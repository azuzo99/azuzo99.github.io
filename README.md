# azuzo99.github.io

Personal site of Adam Zuzo - Data & AI Engineer. Live at **https://azuzo99.github.io**.

Static [Astro](https://astro.build) site, rebuilt 1:1 from the approved design (`Adam Zuzo Profile v4`). Plain CSS, small vanilla-TS islands, self-hosted fonts, no runtime third-party requests.

## Edit content

All copy and data live in `src/data/*.ts` - change text there, not in components.

| File | Section |
|---|---|
| `site.ts` | links, chapters, nav |
| `hero.ts` | hero pills, intro, tech groups |
| `offers.ts` | the three offers (`#services`) |
| `about.ts` | about, stats, certifications |
| `work.ts` | selected work + data-flow diagram steps |
| `community.ts` | communities + talk |
| `stack.ts` | tech stack + "where I used it" |
| `trusted.ts` | trusted-by logos |
| `contact.ts` | contact, email, footer |

Photos: `src/assets/photos/`. Replace a file with a higher-resolution one of the same name and aspect ratio; Astro regenerates AVIF/WebP at build.

Copy tests compare the page with the design (`tests/fixtures/design-*.json`). After an intentional copy change, update the fixture or the test will fail.

## Run locally

```sh
npm ci
npm run dev          # http://localhost:4321
npm run build        # astro check + build -> dist/
npx serve dist -l 4321 & ./node_modules/.bin/playwright test   # full suite (needs a build)
npm run lhci         # Lighthouse mobile against dist/
```

Other scripts: `npm run fetch-assets` (re-download external logos into `src/assets/logos/`), `npm run snapshot-design` (regenerate design fixtures; needs the design folder and internet), `node scripts/og.mjs` (OG image), `node scripts/compare.mjs` (design vs site screenshots).

## Deploy

Push to `main` -> GitHub Actions (`.github/workflows/deploy.yml`, `withastro/action`) builds and publishes to GitHub Pages. Rollback: revert the commit and push.

## Docs

- `docs/inventory.md` - what the design contains; §10 = decisions
- `docs/design.md` - architecture, breakpoints, selector contract, budgets
- `docs/quality.md` - QA report (Lighthouse mobile 98/100/100/100, axe, tap targets)
- `docs/publish-log.md` - first deployment log

## Open items

- Full-resolution photos (hero headshot is 400x400).
- Custom domain `adam-zuzo.com`: buy it, verify it in GitHub, set DNS (`www` CNAME `azuzo99.github.io`, apex A `185.199.108-111.153`), add `public/CNAME`, update `site` in `astro.config.mjs` and the profile README links.
- Testimonials section, analytics (none by default).
- Small accepted gaps vs design: rail number contrast (`#77716A`, by decision), "IN SHORT" line wrap (font build difference), hero "What I offer" ~10px offset.
