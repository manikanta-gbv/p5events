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

Go straight to <https://dash.cloudflare.com/profile/api-tokens> — it sits
under your user profile, not under the p5events project, which is the part
most people hunt for.

Two ways. The custom token is fewer clicks once you know where things are,
and grants far less.

**Custom token (recommended)**

*Create Token* → **Create Custom Token** → *Get started*.

| Setting | Value |
| --- | --- |
| Token name | `p5events deploy` |
| Permissions | **Account** · **Workers Scripts** · **Edit** |
| Account Resources | **Include** · *Gbvmanikanta13@gmail.com's Account* |
| Zone Resources | leave as is |

One permission is enough. This Worker serves static assets — no KV, no R2,
no Containers, no Pages — so everything else the template asks for is scope
you would be handing out for nothing.

**Or the Edit Cloudflare Workers template**

It works, but you must narrow *Account Resources* to your account **only**
before continuing. Left at the default it tries to grant the same
permissions on every account you can see, and fails:

> Failed common permission check against resources.
> (Permission group: "Workers KV Storage Write")

That is what the error on the summary screen means: the template asked for
Workers KV Storage Write on an account you belong to but do not own, so
Cloudflare rejected the token as a whole. Narrowing the account resources
clears it.

Copy the token immediately. Cloudflare shows it once and never again.

### 2. Add one GitHub secret

<https://github.com/manikanta-gbv/p5events/settings/secrets/actions/new>

| Name | Value |
| --- | --- |
| `CLOUDFLARE_API_TOKEN` | the token from step 1 |

Nothing else. The account id is not a secret — it is an identifier that
appears in every dashboard URL and grants nothing on its own — so it lives
in `wrangler.jsonc` instead.

### 3. Turn off the Cloudflare Git build

<https://dash.cloudflare.com/f8c97edc15df9ff338c60ead975ba657/workers/services/view/p5events/production/settings>

Find the **Build** section and disconnect the Git repository.

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
