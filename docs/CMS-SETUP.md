# The CMS

The owner edits the site at `/admin`. Every save is a commit to `content/`
in this repo, which triggers a rebuild. There is no database.

All of it is free: Sveltia CMS is open source, the auth Worker runs on
Cloudflare's free tier, GitHub is free.

## Where to open it

| | |
| --- | --- |
| Production | `https://<your-site>/admin/` |
| Local dev | `http://localhost:3000/admin/index.html` |

The dev URL needs `index.html` on the end. `next dev` serves files out of
`public/` but does not resolve a directory index, so bare `/admin/` returns
the site's 404 page there. Static hosts do resolve it, so production is fine.

## Three ways to sign in

Sveltia offers all three on the login screen. They are listed here easiest
first.

### 1. Work with Local Repository — no setup at all

Open the admin locally, click **Work with Local Repository**, and pick this
repo's folder when prompted. Sveltia reads and writes `content/` directly
through the browser's File System Access API.

No GitHub login, no token, no Worker, no proxy server. Saves land as
ordinary file changes in your working copy, which you then commit yourself.

**This is the fastest way to fill in the remaining placeholders.** Needs a
Chromium browser (Chrome, Edge, Brave).

### 2. Sign In Using Access Token — hosted, minimal setup

On the live site, click **Sign In Using Access Token** and paste a GitHub
personal access token with `repo` scope.

Good for testing the hosted admin before wiring up OAuth. Less good as the
owner's daily route: a PAT is a long-lived credential that is easy to paste
somewhere it should not go, and it has to be regenerated when it expires.

### 3. Sign In with GitHub — the real one for the owner

A normal "log in with GitHub" button. Needs the one-time setup below. This
is what the owner should use: nothing to copy, nothing to store, and access
follows their GitHub account.

---

## Setting up GitHub sign-in

### 1. Deploy the auth Worker

A static site has nowhere to receive GitHub's OAuth callback. `cms-auth/`
in this repo is a small Worker that does exactly that and nothing else.

```bash
npm run cms-auth:deploy
```

Note the URL it prints, e.g. `https://p5events-cms-auth.<subdomain>.workers.dev`.

### 2. Create a GitHub OAuth App

GitHub → Settings → Developer settings → **OAuth Apps** → New OAuth App.

| Field | Value |
| --- | --- |
| Application name | P5 Events CMS |
| Homepage URL | your site URL |
| Authorization callback URL | the Worker URL + `/callback` |

Copy the **Client ID** and generate a **Client Secret**.

### 3. Give the Worker the credentials

```bash
npm run cms-auth:secrets
```

Prompts for `GITHUB_CLIENT_ID` then `GITHUB_CLIENT_SECRET`. These are
Worker secrets — never committed, never sent to the browser.

### 4. Point the CMS at the Worker

In `public/admin/config.yml`, set `base_url` to the Worker URL, no trailing
slash:

```yaml
backend:
  name: github
  repo: manikanta-gbv/p5events
  branch: main
  base_url: https://p5events-cms-auth.<subdomain>.workers.dev
```

### 5. Allow your site's origin

`ALLOWED_ORIGINS` in `cms-auth/wrangler.jsonc` lists the sites permitted to
receive a token. Add the real site URL and any custom domain, then redeploy:

```bash
npm run cms-auth:deploy
```

This is the security boundary. A token is only ever posted back to an origin
on that list, so another site cannot open the endpoint and harvest one.

### 6. Give the owner access

They need a GitHub account with write access to this repo as a
collaborator. That is the one unavoidable bit of friction — without a GitHub
login they cannot use the hosted admin. Option 1 above needs no account at
all, so it stays available to you regardless.

---

## What the owner can change

Packages, occasions, FAQs, gallery, featured videos, service areas, add-ons,
and the business details — phone, WhatsApp, email, social links and the
numbers shown on the site.

**Deliberately not in the CMS:** `theme.json` (colour and type tokens),
`navigation.json` (header and footer links) and `pages/*.json` (section
order). A wrong value in any of those breaks the design or the routing
rather than just reading badly. They are developer config. Add them later if
the owner genuinely needs them.

## What happens when they break something

The build fails and **the current site stays live**. Every content file is
validated against `src/lib/schema.ts` during the build, so a malformed price
or a missing image never reaches production. They see an error; visitors see
nothing wrong.

## Publishing mode

`publish_mode: simple` commits straight to `main`. For a review step, change
it to `editorial_workflow` — the CMS then opens a pull request instead, and
someone approves before it goes live.

## Not instant

Save to live is roughly one to two minutes: commit, build, deploy. Worth
telling the owner so they do not sit refreshing.

## How the auth Worker protects the token

- The client secret exists only as a Worker secret. Never in the repo, never
  in the browser.
- `state` is a random value stored in an `HttpOnly` cookie and checked on the
  way back, so the callback cannot be forged.
- The origin that started the login travels in that same cookie, so the token
  can only be handed back to the site that asked for it — not to whatever
  origin a caller claims.
- The requesting origin is read from the `Referer`, not a query parameter, so
  a caller cannot simply name an origin it does not control.
- `/admin` is reachable by anyone but useless without write access to this
  repo. `public/_headers` marks it `noindex`.
