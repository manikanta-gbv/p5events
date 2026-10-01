# Moving to a real domain

The site currently runs on its free `workers.dev` subdomain. Nothing about
that is permanent — switching to a real domain is three edits and a redeploy.

## What depends on the domain

Most of the site does not. Internal links, images, CSS and the WhatsApp
deep links are all relative or absolute to someone else's host, so they do
not care where the site lives.

Four things are absolute, and all four come from **one value**:

| Thing | Where it shows up |
| --- | --- |
| `<link rel="canonical">` | every page |
| `sitemap.xml` | 27 entries |
| `robots.txt` | the `Sitemap:` line |
| JSON-LD | `LocalBusiness` url and image, `Product` offers, breadcrumbs |

That value is resolved once, by `getSiteUrl()` in `src/lib/content.ts`:

```
SITE_URL (build environment)  →  falls back to  →  seo.siteUrl (settings.json)
```

So moving domain never means editing templates.

## The switch

### 1. Point the domain at the Worker

In the Cloudflare dashboard, add the custom domain to the Worker. If the
domain's DNS is already on Cloudflare this is a couple of clicks; otherwise
move its nameservers first.

### 2. Update the canonical URL

`content/settings.json`:

```json
"seo": {
  "siteUrl": "https://p5events.in"
}
```

This is the durable production value — it is what ships. `SITE_URL` exists
for one-off builds against a different host (a preview, a staging domain),
not as the normal way to configure production.

### 3. Let the CMS log in from the new origin

`cms-auth/wrangler.jsonc`:

```jsonc
"ALLOWED_ORIGINS": "https://p5events.in,https://p5events.gbvmanikanta13.workers.dev,http://localhost:3000"
```

Then `npm run cms-auth:deploy`.

**This one is easy to forget.** The auth Worker only hands a token back to an
origin on that list, so signing in from the new domain fails with a 403
until it is added. Keep the old `workers.dev` origin too while both work.

Also update the GitHub OAuth App's **Homepage URL** to the new domain. The
callback URL does not change — it points at the auth Worker, which stays on
`workers.dev` regardless of where the site lives.

### 4. Rebuild and deploy

```bash
npm run deploy
```

## Checking it worked

```bash
curl -s https://p5events.in/sitemap.xml | head -5
curl -s https://p5events.in/robots.txt
curl -s https://p5events.in/ | grep -o 'rel="canonical" href="[^"]*"'
```

All three should show the new domain. Verified locally by building with
`SITE_URL` set: every canonical, sitemap entry, robots line and JSON-LD URL
moves together.

## Both URLs will still work

The `workers.dev` address keeps serving the site after you add a custom
domain, so for a while both are live. That is fine: every page carries a
canonical pointing at `seo.siteUrl`, so search engines will treat the custom
domain as the real one and ignore the duplicate.

If you would rather the old address stop working entirely, remove the
`workers.dev` route in the Worker's settings once the domain is bedded in.

## A note on cost

A domain is the only part of this that costs money — roughly ₹900–1,500 a
year for a `.in` or `.com`. Hosting, the CMS, the auth Worker and GitHub all
stay free.
