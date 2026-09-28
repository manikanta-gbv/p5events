# P5 Events

Static marketing and catalogue site for P5 Events, a party décor studio in
Visakhapatnam. Booking runs over WhatsApp; there is no database and no server.

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
| Hosting | Cloudflare Pages (free, commercial use permitted) |

## The rule

`content/` is the business. `src/` is the machinery. **Swap the `content/`
folder and the same codebase becomes a different company's site.**

No string like `Visakhapatnam`, a price, or a phone number appears anywhere
under `src/`. A grep for any of them returning a hit is a defect.

## Deploying to Cloudflare Pages

- Build command: `npm run build`
- Output directory: `out`
- Node version: 20

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
