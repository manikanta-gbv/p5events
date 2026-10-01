/**
 * GitHub OAuth endpoint for the CMS.
 *
 * The site is a static export with no server, so there is nowhere for
 * GitHub to send an OAuth callback. This Worker is that one missing piece:
 * it starts the GitHub login, swaps the returned code for an access token,
 * and hands the token back to the admin page.
 *
 * It implements the Decap/Netlify CMS handshake, which Sveltia speaks.
 *
 * Secrets (never in this file — set with `wrangler secret put`):
 *   GITHUB_CLIENT_ID
 *   GITHUB_CLIENT_SECRET
 * Vars (in wrangler.jsonc):
 *   ALLOWED_ORIGINS  comma-separated list of sites allowed to receive a token
 */

const COOKIE = 'cms_auth_state';
const PROVIDER = 'github';

function parseOrigins(env) {
  return (env.ALLOWED_ORIGINS || '')
    .split(',')
    .map((o) => o.trim().replace(/\/$/, ''))
    .filter(Boolean);
}

/**
 * Which site is asking. Taken from the Referer rather than a query
 * parameter so a caller cannot simply name an origin it does not control.
 */
function resolveOrigin(request, env) {
  const allowed = parseOrigins(env);
  const referer = request.headers.get('Referer');
  if (!referer) return null;

  let origin;
  try {
    origin = new URL(referer).origin;
  } catch {
    return null;
  }
  return allowed.includes(origin) ? origin : null;
}

function cookie(name, value, maxAge) {
  return `${name}=${value}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=${maxAge}`;
}

function readCookie(request, name) {
  const header = request.headers.get('Cookie') || '';
  const hit = header.split(';').find((c) => c.trim().startsWith(`${name}=`));
  return hit ? hit.trim().slice(name.length + 1) : null;
}

function handleAuth(request, env, url) {
  const origin = resolveOrigin(request, env);
  if (!origin) {
    return new Response(
      'This site is not allowed to use this auth endpoint. Add its origin to ALLOWED_ORIGINS.',
      { status: 403 },
    );
  }
  if (!env.GITHUB_CLIENT_ID) {
    return new Response('GITHUB_CLIENT_ID is not set on this Worker.', { status: 500 });
  }

  // CSRF: a random value echoed by GitHub and checked on the way back.
  const state = crypto.randomUUID();

  const authorize = new URL('https://github.com/login/oauth/authorize');
  authorize.searchParams.set('client_id', env.GITHUB_CLIENT_ID);
  authorize.searchParams.set('scope', url.searchParams.get('scope') || 'repo,user');
  authorize.searchParams.set('state', state);
  authorize.searchParams.set('redirect_uri', `${url.origin}/callback`);

  return new Response(null, {
    status: 302,
    headers: {
      Location: authorize.toString(),
      // The origin travels in the cookie, so the token can only ever be
      // posted back to the site that started the flow.
      'Set-Cookie': cookie(COOKIE, `${state}|${encodeURIComponent(origin)}`, 600),
    },
  });
}

/** The page GitHub returns to. It speaks the CMS handshake, then closes. */
function resultPage(origin, payload) {
  const message = `authorization:${PROVIDER}:${payload.token ? 'success' : 'error'}:${JSON.stringify(payload)}`;

  return `<!doctype html>
<html lang="en">
<head><meta charset="utf-8"><title>Signing in…</title></head>
<body style="font-family:system-ui;padding:2rem;color:#1C1720;background:#FBF7F3">
<p>${payload.token ? 'Signed in. You can close this window.' : 'Sign-in failed. You can close this window.'}</p>
<script>
(function () {
  var origin = ${JSON.stringify(origin)};
  var message = ${JSON.stringify(message)};
  function send() { window.opener.postMessage(message, origin); }
  window.addEventListener('message', function (e) {
    if (e.origin === origin && e.data === 'authorizing:${PROVIDER}') send();
  }, false);
  if (window.opener) {
    window.opener.postMessage('authorizing:${PROVIDER}', origin);
  } else {
    document.body.insertAdjacentHTML('beforeend', '<p>Opened directly — start from the admin page instead.</p>');
  }
})();
</script>
</body>
</html>`;
}

async function handleCallback(request, env, url) {
  const raw = readCookie(request, COOKIE);
  const clear = cookie(COOKIE, '', 0);
  const html = { 'Content-Type': 'text/html; charset=utf-8', 'Set-Cookie': clear };

  if (!raw) {
    return new Response(resultPage('*', { error: 'Login expired. Try again.' }), {
      status: 400,
      headers: html,
    });
  }

  const [state, encodedOrigin] = raw.split('|');
  const origin = decodeURIComponent(encodedOrigin || '');

  if (!state || state !== url.searchParams.get('state')) {
    return new Response(resultPage(origin || '*', { error: 'State mismatch.' }), {
      status: 400,
      headers: html,
    });
  }

  const code = url.searchParams.get('code');
  if (!code) {
    return new Response(resultPage(origin, { error: 'No code returned by GitHub.' }), {
      status: 400,
      headers: html,
    });
  }

  let token;
  try {
    const res = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({
        client_id: env.GITHUB_CLIENT_ID,
        client_secret: env.GITHUB_CLIENT_SECRET,
        code,
        redirect_uri: `${url.origin}/callback`,
      }),
    });
    const data = await res.json();
    if (data.error || !data.access_token) {
      return new Response(
        resultPage(origin, { error: data.error_description || data.error || 'No token returned.' }),
        { status: 400, headers: html },
      );
    }
    token = data.access_token;
  } catch (e) {
    return new Response(resultPage(origin, { error: 'Token exchange failed.' }), {
      status: 502,
      headers: html,
    });
  }

  return new Response(resultPage(origin, { token, provider: PROVIDER }), { headers: html });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === '/auth') return handleAuth(request, env, url);
    if (url.pathname === '/callback') return handleCallback(request, env, url);
    if (url.pathname === '/') {
      return new Response('CMS auth endpoint. Start from /admin on the site.', {
        headers: { 'Content-Type': 'text/plain' },
      });
    }
    return new Response('Not found', { status: 404 });
  },
};
