# P5 Events

Static marketing and catalogue site for P5 Events, a party décor studio in
Hyderabad. Booking runs over WhatsApp;

## Running it

```bash
npm install
npm run dev     # http://localhost:3000
npm run build   # static export to out/
```

## How it is put together

| | |
|---|---|
| Framework | Next.js 16, App Router, `output: 'export'` |
| Styling | Tailwind, tokens generated from `content/theme.json` |
| Content | JSON files in `content/`, validated by Zod at build |
| Admin | Sveltia CMS at `/admin`, commits to GitHub |
| Images | `public/images/`, WebP, variants built by `scripts/` |
| Hosting | Cloudflare Workers static assets (free, commercial use permitted) |

## The rule

`content/` is the business. `src/` is the machinery. **Swap the `content/`
folder and the same codebase becomes a different company's site.**

No string like `Hyderabad`, a price, or a phone number appears anywhere
under `src/`. A grep for any of them returning a hit is a defect.

## Deploying

Connected to Cloudflare via Git, or straight from your machine:

```bash
npm run deploy      # builds, then wrangler deploy
```

`wrangler.jsonc` declares `out/` as static assets. Without it, wrangler
auto-detects Next.js and installs the OpenNext SSR adapter, which a static
export cannot satisfy. Node 22+ (wrangler requires it).

## Moving to a real domain

The site is on its free `workers.dev` subdomain. Every absolute URL —
canonicals, sitemap, robots, JSON-LD — resolves from one value, so switching
is three edits, not a search-and-replace. See `docs/CUSTOM-DOMAIN.md`.

```
SITE_URL (build env)  →  falls back to  →  seo.siteUrl (content/settings.json)
```

## Content that still needs filling in

Placeholders are written as `[like this]` so they are easy to grep:

```bash
grep -rn "\[.*\]" content/*.json content/packages/*.json
```

Outstanding:
- Studio address and pincode
- Real prices on every package
- Years trading, setups completed, Google rating and review count
- Cancellation and reschedule terms
- The service areas actually covered

Done: phone numbers, email, WhatsApp, Instagram, YouTube and the Google
Business Profile are all live in `content/settings.json`.
