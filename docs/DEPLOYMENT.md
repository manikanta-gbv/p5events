# Deployment

The site builds and deploys from **GitHub Actions**, not from Cloudflare's
own build system. A CMS save still commits to `main` and still deploys
automatically — only the machine doing the work changed.

```
CMS save  →  commit to main  →  GitHub Actions  →  wrangler deploy  →  live
```

## Why not Cloudflare's builder

It kept failing in ways that had nothing to do with this repo.

On 3 October 2026 a build sat in **Initializing** for 14 minutes and timed
out without ever cloning the repository — during an open Cloudflare incident
titled *"Issues with Workers Build failing to start"*. No code ran. Nothing
in the project could have prevented or fixed it.

An earlier failure came from the same builder auto-detecting Next.js and
installing the OpenNext SSR adapter over a static export.

GitHub Actions removes that dependency. It is free, the logs are complete,
the Node version comes from `.node-version`, and a failed run can be re-run
from the browser without an empty commit.

## One-time setup

### 1. Create a Cloudflare API token

Cloudflare dashboard → My Profile → API Tokens → **Create Token** → use the
**Edit Cloudflare Workers** template.

Scope it to this account only. Copy the token — it is shown once.

### 2. Add two GitHub secrets

Repo → Settings → Secrets and variables → Actions → **New repository secret**:

| Secret | Value |
| --- | --- |
| `CLOUDFLARE_API_TOKEN` | the token from step 1 |
| `CLOUDFLARE_ACCOUNT_ID` | the id in the dashboard URL, after `dash.cloudflare.com/` |

### 3. Turn off the Cloudflare Git build

Cloudflare dashboard → Workers & Pages → **p5events** → Settings → Builds →
disconnect the Git repository.

Skip this and both systems deploy on every push: two builds, one of them on
the infrastructure we are trying to stop relying on.

## Deploying

Automatic on every push to `main`, including CMS saves.

Manual, from the repo's **Actions** tab: open *Deploy* → **Run workflow**.
Useful for redeploying the current `main` without an empty commit.

From your own machine, bypassing CI entirely:

```bash
npm run deploy
```

Needs `wrangler login` once, and Node 22+.

## What the deploy checks before it ships

1. `npm run check` — every content file against its schema, and every image
   path against the filesystem
2. Image size gate on `public/images`
3. `next build` — the static export
4. `tsc --noEmit`
5. A sanity check on `out/`: index, sitemap and admin must exist, and there
   must be at least 10 pages

Any failure stops the deploy and **leaves the live site untouched**. That is
the point: a bad content edit shows up as a red run in Actions, not as a
broken page.

## Concurrency

Runs are queued, never cancelled mid-flight. Two CMS saves in quick
succession deploy in order rather than racing.
