# Setting up the admin

The owner edits the site at `/admin`. Every save is a commit to `content/`,
which triggers a Cloudflare Pages build. There is no database.

## One-time setup

1. **Push this repo to GitHub.** Set `backend.repo` in
   `public/admin/config.yml` to `owner/repo`.

2. **Create a GitHub OAuth app.**
   GitHub → Settings → Developer settings → OAuth Apps → New.
   - Homepage URL: your site URL
   - Authorization callback URL: the worker URL from step 3, plus `/callback`

3. **Deploy the Sveltia authenticator.** Sveltia commits as the owner, which
   needs an OAuth callback endpoint that a static site does not have. Deploy
   the authenticator to a free Cloudflare Worker and put its URL in
   `base_url` in `config.yml`.

   Check the current Sveltia CMS documentation for the authenticator repo and
   deploy steps — this part has changed more than once, so follow their docs
   rather than anything written here.

4. **Give the owner a GitHub account** and add them as a collaborator on the
   repo. This is the one bit of friction in the whole setup: without a GitHub
   login they cannot use the admin.

## What the owner can change

Packages, occasions, reviews, FAQs, gallery, service areas, add-ons, and all
the business details — phone, WhatsApp number, prices, the numbers shown on
the home page.

## What happens when they break something

The build fails and **the current site stays live**. They see an error in the
Cloudflare dashboard; visitors see nothing wrong. Every content file is
validated against `src/lib/schema.ts` during the build, so a malformed price
or a missing image never reaches production.

## Publishing mode

`publish_mode: simple` commits straight to `main`. To add a review step,
change it to `editorial_workflow` — Sveltia then opens a pull request instead
of committing, and someone approves before it goes live.
