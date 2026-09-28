# Photographs

## What is in the repo

`public/images/` holds 33 web-ready WebP images plus the two logo files. Every
one was checked before it was included. Source images are capped at roughly
250 KB; `scripts/generate-image-variants.mjs` produces narrower widths at build
time, and those variants are gitignored because the build recreates them.

## What is deliberately not in the repo

The original 91 WhatsApp photographs are **not** committed. They stay outside
the repository because a meaningful number of them cannot be published, and
once a file is in git history it is effectively permanent.

The originals currently live at:

```
/home/manikanta/Workspace/Personal_workspace/Event_management/images/
```

Keep that folder somewhere safe — a drive or private cloud folder, not this
repo.

## Why they were excluded

Of the 91 originals:

| Count | Problem |
| --- | --- |
| 4 | Screenshots of a competitor's product pages, with their pricing UI visible |
| 1 | Carries another company's watermark |
| 4 | Instagram screen-grabs with app chrome and letterbox bars |
| 16 | Show identifiable licensed characters |
| 3 | Show a client's child printed large on the backdrop |

The 33 in the repo are drawn only from the images clear of all of the above.

## Licensed characters

Sixteen originals show Spider-Man, Frozen, CoComelon, Minions, LEGO, Mickey or
Minnie, Baby Shark, Boss Baby or Dora. These belong to Disney, Marvel,
Universal, Moonbug, LEGO and Paramount.

Enforcement against small local decorators is not routine, but a public,
indexed website raises visibility considerably. **This is a business decision,
not a technical one** — it has not been made yet, so none of those images are
used on the site.

The same rule was applied to the YouTube videos featured in
`content/videos.json`: a CoComelon-themed video on the channel was left out.

## Children in photographs

Three setups show the client's child printed large on the backdrop. That is a
consent question rather than a copyright one: publishing an identifiable child
on a commercial site needs the parents' permission. None are used.

## Still outstanding

The owner has said the original set is **mixed** — some images are reference
pictures rather than P5 Events' own work. Until there is a marked list of which
are genuinely ours, treat the gallery as provisional. Publishing another
decorator's work as your portfolio is direct infringement.

## Adding a photo later

Upload through the CMS at `/admin`. It resizes and converts to WebP on upload,
and a CI check fails the build if anything in `public/images/` exceeds about
400 KB.
