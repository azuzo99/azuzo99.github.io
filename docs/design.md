# Design - azuzo99.github.io (Phase 1)

Source of truth: `_source/design/Adam Zuzo Profile v4.dc.html` (v4). Facts: `docs/inventory.md` (refs `inv §n`). Decisions: `inv §10`.

## 1. Goal and non-goals
- Goal: static single page at `https://azuzo99.github.io` that is visually and behaviourally identical to v4 at 390x844, 768x1024 and 1440x900, plus the a11y/SEO/perf requirements of the brief.
- Non-goals: redesign, copy edits (except `inv §10` #2, #7), stack filter, Activity section, analytics, CMS, i18n, custom domain.

## 2. Stack
- Astro (latest stable, pinned exact in `package.json`), `output: 'static'`, `site: 'https://azuzo99.github.io'`, no `base`. TypeScript strict.
- Plain CSS: `src/styles/tokens.css` (custom properties) + `src/styles/global.css` (reset, keyframes, utilities). Component styles in `<style>` (scoped).
- Client JS: plain TS modules loaded with Astro `<script>` (bundled, deferred). No framework runtime.
- Fonts: `@fontsource/schibsted-grotesk` 400/500/600, `@fontsource/geist-mono` 400/500 (only the used weights, latin + latin-ext subsets). Preload Schibsted 500 latin woff2.
- Images: `astro:assets` `<Picture>` (avif + webp, `widths` 1x/2x of rendered size, explicit `width`/`height`). Hero = `loading="eager" fetchpriority="high"`; all else lazy.
- Integrations: `@astrojs/sitemap`. Dev: `@playwright/test`, `@axe-core/playwright`, `@lhci/cli`.

## 3. Responsive model
v4 switches DOM with JS flags. We use **CSS media queries only** for layout, so the HTML is final at build and there is no layout shift on load.

| v4 flag | Media query (custom media in `tokens.css` comments; written out literally) |
|---|---|
| `isPhone` | `(max-width: 599px)` |
| `heroMid` | `(min-width: 600px) and (max-width: 939px)` |
| `navWide` | `(min-width: 860px)` |
| `scrollMode` | `(min-width: 900px) and (min-height: 720px)` |
| desktop (`!heroMid && !isPhone`) | `(min-width: 940px)` |
| `wide` (rail) | `(min-width: 1340px)` |

JS reads the same queries via `src/scripts/lib/media.ts` (`matchMedia` + change listeners), never `innerWidth` math.

Rules:
1. **Prefer one DOM, restyled by CSS.** Duplicate markup only when v4 structure differs materially (offers slider vs accordion content, diagram desktop vs mobile, stack grid vs accordion, contact rows vs icon grid). **Hero photo is NOT duplicated**: one `<picture>` placed with CSS grid areas per band (an eager image inside `display:none` still downloads).
2. Duplicated variants: hidden one gets `display: none` from the media query (out of the a11y tree). **No duplicate `id`s; exactly one `<h1>`.**
3. Interactive state shared by two variants (e.g. `openOffer`, diagram step) lives in one TS store per component; both variants render from it.
4. **JS state must follow media changes.** `media.ts` exposes `onChange(query, cb)`. Every script that writes inline state for one band (transform, bar widths, `inert`, `aria-hidden`, open flags) must clear it when that band is left and recompute on enter (v4 L848 re-runs `onScroll`). Offers: leaving scrollMode clears track transform, bars, `inert`, sets `openOffer=-1`; entering runs the scroll handler.

Bands that must each be tested (inv §2): `<600`, `600-859`, `860-899`, `900-939`, `940-1339`, `>=1340`, and scrollMode off at `1440x700`.

## 4. File contract
Shared (owned by scaffold, Phase 2 - solvers may **not** edit; request changes in the report):
```
src/styles/tokens.css  global.css
src/layouts/Base.astro             head, SEO, JSON-LD, fonts, skip link
src/pages/index.astro              section order + component mounts only
src/data/*.ts                      all content, verbatim from inv §5 (apostrophes -> ’)
src/assets/{icons,logos,photos}/   local images (logos downloaded by scripts/fetch-assets.mjs)
src/scripts/lib/media.ts           breakpoint queries + prefersReducedMotion()
src/scripts/lib/scroll.ts          one passive rAF-throttled scroll+resize loop, subscribe({read, write}): all reads, then all writes, per frame
src/scripts/lib/ticker.ts          shared intervals: techTick 2200 ms, archTick 400 ms; pause on document.hidden
tests/harness/*                    design-vs-site helpers, viewports
```
Per component X (owned by its solver): `src/components/X/*.astro`, `src/scripts/X.ts`, `tests/X.spec.ts` (written by test-writer, read-only for solver).

### Section markup contract (binding for every component)
```html
<section id="{chapter}" data-chapter="{NN}" aria-labelledby="{chapter}-h">
  <div class="sec" data-pause>   <!-- exactly ONE child; all content + all variants inside -->
    ...
  </div>
</section>
```
- Sticky pauses apply to `#about, #work, #community, #stack` and select `[data-pause]`, never `firstElementChild`.
- `data-reveal` / `data-delay` attributes are copied **verbatim from v4** onto the matching elements (solver obligation; shell script only consumes them).
- Scaffold ships placeholder components for every section with the real ids, this contract and a fixed-height `[data-pause]` block, so A's tests (pauses, active tracking, rail, reveal) can go green in isolation. Solvers C/D/E replace their placeholder only.
- Cross-component specs (pauses, active section, reveal, CLS) are tagged `@integration` and re-run on `integration` before CP3.

## 5. Components (one solver each)
| # | Component | Sections / features (inv §3, §4) | Script |
|---|---|---|---|
| A | Shell | side rail (§3.0), header/nav + menu + top bar (§3.1), hero incl. tech-group row (§3.2), active-section tracking (#5), rail/bar fill (#6), **sticky pauses** for about/work/community/stack (#7), reveal-on-scroll (#8), techTick hero rotation (#16) | `shell.ts` |
| B | Offers | `#services` (§3.3): scroll-pinned slider (#1), bars (#2), `selectOffer` (#3), accordion (#4), keyboard (ArrowLeft/Right on tablist, roving tabindex), touch = native scroll | `offers.ts` |
| C | Content | `#about` (§3.4), `#community` incl. Talk (§3.6), YouTube facade (#18), phone tap-to-expand for communities/talk (#12) | `content.ts` |
| D | Work | `#work` (§3.5) incl. data-flow diagram desktop + mobile (#14, #15), phone tap-to-expand work/earlier (#12) | `work.ts` |
| E | Stack + tail | `#stack` (§3.7, #9, #11), trusted-by (§3.9, #17, phone rotation #16), `#contact` + footer (§3.10), copy-email (#19) | `stack.ts`, `tail.ts` |

Chapters (rail, menu, nav numbering): `top, services, about, work, community, stack, contact` -> `00..06` (`inv §10` #2).

## 6. Behaviour changes vs v4 (all intentional)
1. Hover colours applied as intended (`inv §10` #5).
2. Diagram: step/dot/output click and phone Prev/Next pause the loop; resume after 8 s idle. Hidden tab pauses (as v4).
3. Diagram steps: `<button>` (not `div role=button`), `aria-current="step"` on active; dots `aria-label="Step NN"`. Loop region `aria-live="off"`; caption is plain text.
4. All toggles `<button aria-expanded aria-controls>`. Menu: Esc closes, focus returns to button.
5. Trusted-by `<section id="trusted" aria-label="Worked with and trusted by">`; marquee duplicate set `aria-hidden="true"`.
6. YouTube thumbnail served locally (downloaded at build), iframe only after click.
7. Contact heading `(06)`; apostrophes `’`.
8. Offer slider in `scrollMode`: off-screen **slider-variant** articles `inert` (the accordion variant is never inerted) so tab order follows the visible one; cleared on scrollMode exit (§3 rule 4).
9. **Tap targets** (phone): every control < 44 px gets an invisible hit area (`position: relative` + `::after { inset: -Npx }`) to reach 44x44 - no visual change (diagram dots, menu button 40 px, toggles 38 px, social icons).
10. **Colours stay as designed** (user decision CP1): `#77716A` small text keeps its ~3.9-4.5:1 contrast. Consequence: axe `color-contrast` is reported, not gating; Lighthouse a11y gate = ">= 95, or the only failing audit is color-contrast".

## 7. Reduced motion (`prefers-reduced-motion: reduce`)
CSS: `scroll-behavior: auto`; all `az*` keyframe animations `animation: none` (pulse dots static, marquee becomes a static wrapped row of logos with no duplicate set, catalog dash static); reveal transitions removed (elements visible). JS: `scrollTo` uses `behavior: 'auto'`; diagram does **not** auto-advance (user steps with buttons); techTick rotation stops on index 0; offer slider still follows scroll (user-driven) but without the smoothstep slide - it snaps at segment midpoint.

## 8. Performance budget (Lighthouse mobile >= 90/95/95/95)
- JS total <= 25 KB gzip; one scroll listener (`lib/scroll.ts`, read/write phases).
- Rail and top-bar fill use `transform: scaleY()/scaleX()` (origin top/left, same `.12s linear` on the rail) instead of `height`/`width` - same look, no layout per frame. Offer bars keep `width` (3 px, only inside the pinned section) or use scaleX too.
- CSS <= 30 KB gzip. Fonts 3 files, preload max 1.
- LCP = h1 text; hero photo eager but sized.
- **Pauses height in CSS, not JS.** `[data-pause] { position: sticky }`; section `padding-bottom: 18lvh` (`12lvh` under `max-width: 599px`) = v4's `offsetHeight + round(innerHeight*k)` because the section has one child. JS (`shell.ts`) computes only `top` = v4 formula (`content <= avail ? 90 + (avail-content)/2 : innerHeight - content - 16`) from ResizeObserver on `[data-pause]`, and ignores height-only window resizes < 150 px on touch (URL bar). An inline `<script is:inline>` in `Base.astro` sets the initial `top` before first paint, so deep links (`/#work`) land correctly.
- CLS = 0 (tested): every image has width/height or an aspect-ratio box.
- No runtime third-party request except Calendly/social links (navigation) and the YouTube iframe after click.

## 9. SEO / head
Title `Adam Zuzo | Data & AI Engineer`; meta description from hero intro copy; canonical `https://azuzo99.github.io/`; OG + Twitter `summary_large_image` with `public/og.png` 1200x630 (generated by `scripts/og.mjs` with Playwright screenshot of an `og.html` in site style); JSON-LD `Person` (name, jobTitle, url, sameAs LinkedIn/Instagram/GitHub, address Poznan, PL); `robots.txt` + sitemap; `lang="en"`; theme-color `#FBF6EE`; favicon = `AZ` tile SVG.

## 10. Testing
Playwright projects: `phone` 390x844 (touch), `mid` 768x1024 (touch), `desktop` 1440x900, `short-desktop` 1440x700 (scrollMode off). Band checks (copy + screenshot only): 880x800, 920x800, 1200x900.
- **Design fixtures: retired.** Phase 2 snapshotted the design page into `tests/fixtures/design-<viewport>.json` and compared the site's `innerText` against it region by region. That made the design the source of truth for every word. The site is now a sales page, so copy must be free to change; the fixtures, `tests/copy.spec.ts`, the snapshot config and the shared text/region harness were all removed. The design remains the reference for layout only, and `scripts/compare.mjs` still produces the visual side-by-side.
- Regions: `header` (nav + menu closed), `rail` (>=1340), and each section mapped by v4 `data-screen-label` -> site id (`Trusted by` -> `#trusted`).
- **Copy test**: site tested with the same frozen clock (t=0: techTick 0, archTick 0, diagram step 01, counter `00/24`, `v42`). Normalized visible `innerText` per region == fixture (fixture normalized: `'` -> `’`, `(07)` -> `(06)`, whitespace collapsed). All 4 projects + 3 band sizes.
- **Selector contract** (tests and solvers both use only these; anything else is internal):

| Component | Hooks |
|---|---|
| A | `header nav[aria-label="Main"]`, `button[aria-label="Sections"][aria-expanded]`, `#menu`, `aside[aria-label="Page progress"]`, `[data-test=rail-fill]`, `[data-test=bar-fill]`, nav/rail links `a[href="#id"][aria-current="true"]` when active, `#top h1`, `[data-test=hero-photo]`, `[data-test=tech-group]` x3 with `[data-active]` icon |
| B | `#services [role=tablist]`, `[role=tab][aria-selected]` x3, `[data-test=offer-track]`, `[data-test=offer-bar]` x3, slider `article[data-variant=slider]` x3, accordion `article[data-variant=accordion]` x3 with `button[aria-expanded]` |
| C | `#about`, `#community`, `[data-test=community]` x2 + `[data-test=talk]` with `button[aria-expanded]` (phone), `[data-test=video-facade]` button, `iframe[data-test=video]` |
| D | `#work`, `[data-test=work-card]` (`mp`,`fd`,`pl`,`kb`,`e0`,`e1` via `data-key`) with `button[aria-expanded]` (phone), `[data-test=diagram]` desktop + `[data-test=diagram-mobile]`, step `button[data-step][aria-current]`, `[data-test=arch-now]`, `[data-test=arch-caption]`, dot buttons `[data-test=arch-dot]`, `[data-test=arch-prev]`/`[data-test=arch-next]` |
| E | `#stack`, `[data-test=stack-tool][data-open]`, `[data-test=stack-group] button[aria-expanded]` (<860), `[data-test=where-used]`, `#trusted [data-test=marquee]`, `#contact`, `[data-test=copy-email]`, `[data-test=copy-state]` |

- **Structure/a11y**: one h1, ids per section contract, axe zero serious/critical violations **excluding `color-contrast`** (reported only, §6.10); `target-size` (wcag22aa) on in `phone`.
- **CLS / deep link**: goto `/#stack` and `/#work`: sum of `layout-shift` entries == 0 after load, target section top within 96 ± 4 px.
- **Resize**: 1440x900 -> 1440x700 -> 1440x900: no visible article `inert`, track transform cleared then restored.
- **Behaviour**: per component spec (scroll the page, assert transforms/active classes/aria states, clicks, keyboard, reduced-motion via `page.emulateMedia`).
- **Visual**: screenshot per section per viewport saved to `test-results/compare/` side by side with the design (review artefact, not an assertion; pixel diff threshold reported, not gated, because font rendering differs: Google Fonts vs fontsource).
- **Network**: test fails if any request leaves `localhost` on page load.
- Tests for one component that need other sections run against the scaffold placeholders; `@integration` specs re-run after merge.
- Lighthouse CI: `lighthouserc.json` against `dist/`, mobile preset, asserts the budget.

## 11. Delivery
- Branches: `main` (scaffold), `comp/A-shell` ... `comp/E-tail` in worktrees `../wt-A` ... (inside `adam-zuzo-page/`), merged to `integration`; `integration` -> `main` at Gate H.
- Deploy: `.github/workflows/deploy.yml` = `withastro/action` + `actions/deploy-pages`, on push to `main` + manual.
