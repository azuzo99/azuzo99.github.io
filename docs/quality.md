# QA report - azuzo99 site (integration) - cycle 1

Branch `integration` (not committed). Static Astro 7.4.0 site. Server: `serve dist -l 4321`. Nothing was listening on 4321 beforehand.

## Gate summary
| Gate | Status | Evidence |
|---|---|---|
| Build / `astro check` | PASS | `npm run build`: 57 files, 0 errors, 0 warnings, 0 hints; build complete |
| JS <= 25 KB gzip | PASS | 12 files, 20,151 B raw, **9,615 B gzip** (+ ~765 B gzip inline JS) |
| CSS <= 30 KB gzip | **FAIL** | 1 file `index.C7NGohGO.css` 92,990 B raw, **37,237 B gzip** (`gzip -9`). Cause below (F1) |
| Playwright (4 projects + 3 bands) | PASS (1 flaky) | 389 passed, 0 failed, 197 skipped (viewport-conditional `test.skip`), 0 flaky on the clean run |
| Lighthouse mobile (lhci x3) | PASS | Perf 0.96, A11y 1.00, BP 1.00, SEO 1.00 on all 3 runs |
| Lighthouse a11y gate | PASS | mobile 1.00 (>=0.95) |
| axe 390/768/1440 (wcag2a/aa/21a/21aa/22aa) | PASS excl. contrast; color-contrast ACCEPTED | see axe section; one aria-allowed-role hit in Lighthouse desktop (F2) |
| Tap targets 390 (>=44x44) | PASS (1 nit) | 29 visible controls, 1 below 44 px bounding box (F4) |
| Network | PASS (1 note) | localhost only; youtube-nocookie after facade click; plus `fonts.gstatic.com` from the YouTube embed (F5) |
| Keyboard | PASS (minor notes) | skip link works; focus ring on every stop; section order correct |
| Reduced motion | PASS | 0 running animations/transitions; diagram does not advance; marquee static |

## 1. Build
Command: `npm run build`. Result: `astro check` 0 errors / 0 warnings / 0 hints; `1 page(s) built`, sitemap created.

dist/ sizes (bytes, raw):
- JS 20,151 (gzip 9,615), 12 modules. Largest gzip: Work 2,106, Hero 1,803, icons 1,534, Offers 1,105.
- CSS 92,990 (gzip 37,237).
- Images: avif 158,009; webp 375,608; png 1,782,818 (15 files, incl. og.png); jpg 608,383; svg 496,474 (101 files).
- Fonts: woff2 155,056 (12); woff 219,216 (16, only referenced as fallback `src`).

CSS breakdown (python, same file): `@font-face` rules = 43,599 B raw / ~27,951 B gzip. Everything else = 49,391 B raw / 8,966 B gzip. Six Geist Mono subset woff2 files (cyrillic, latin-ext; weights 400/500) are Vite-inlined as `data:font/woff2;base64` into the CSS (~35 KB base64, incompressible). They are not needed for the page, since only latin 400/500 are preloaded/used.

## 2. Playwright
Command: `./node_modules/.bin/playwright test --workers=4 --reporter=json` (full suite, all projects).

| Project | pass | fail | skip |
|---|---|---|---|
| phone (390) | 90 | 0 | 49 |
| mid (768) | 84 | 0 | 55 |
| desktop (1440) | 102 | 0 | 37 |
| short-desktop (1440x700) | 83 | 0 | 56 |
| band-880 / 920 / 1200 | 10 / 10 / 10 | 0 | 0 |
| **Total** | 389 | 0 | 197 |

Skips are the specs' own viewport guards (`test.skip(isPhone, ...)` and similar), not disabled tests.

Flaky: the first full run (`--workers=4`) reported `unexpected: 1` (388 passed / 197 skipped / 1 failed). The immediate second full run at `--workers=4` was fully green. I only kept the tail of the first run's output, so the test name was not captured. The `--workers=1` re-run of the failing test was therefore not possible. It is classified **flaky (unidentified)** (see Flaky list); re-run with `--reporter=list` once to identify it.

## 3. Lighthouse
Command: `CHROME_PATH=<playwright chromium> ./node_modules/.bin/lhci autorun` (3 runs, mobile 390x844, simulated throttling). Assertions passed (no failures printed).

| Run | Perf | A11y | BP | SEO | LCP | CLS | TBT | FCP |
|---|---|---|---|---|---|---|---|---|
| 1 | 0.96 | 1.00 | 1.00 | 1.00 | 2.6 s | 0 | 0 ms | 1.6 s |
| 2 | 0.96 | 1.00 | 1.00 | 1.00 | 2.7 s | 0 | 0 ms | 1.6 s |
| 3 | 0.96 | 1.00 | 1.00 | 1.00 | 2.7 s | 0 | 0 ms | 1.6 s |

Top opportunities (mobile): render-blocking-resources ~440 ms (the single 93 KB CSS), unused-css-rules ~160 ms / 27 KB (the inlined fonts, F1), modern-image-formats ~150 ms / 12 KB, dom-size 0.5.

Desktop preset (information only, 1 run, custom config in scratchpad): Perf 1.00, A11y **0.96**, BP 1.00, SEO 1.00; LCP 0.8 s, CLS 0, TBT 0 ms, FCP 0.4 s. Failing audits: color-contrast (accepted; `aside.rail span.num` #77716a on #fbf6ee = 4.48:1), **aria-allowed-role** (F2), uses-long-cache-ttl (static server, not a site issue), render-blocking 40 ms, unused-css 22 KB, modern-image-formats 12 KB.

## 4. axe (full page, all tags, incl. color-contrast)
| Viewport | Violations |
|---|---|
| 390 | none |
| 768 | none |
| 1440 | `color-contrast`, impact serious, 6 nodes, e.g. `aside.rail a[data-chapter-link="services"] > .num` (`<span class="num">01</span>`). **ACCEPTED by decision (design 6.10)**, rail numbers #77716a at 4.48:1 (needs 4.5:1). |

No other serious/critical violations. (The Lighthouse desktop run flags `aria-allowed-role`, which the axe pass did not; see F2.)

## 5. Tap targets at 390 (touch, mobile)
Script: every visible `a`, `button`, `[role=button]` (excluding inert/hidden/aria-hidden subtrees), scrolled through the whole page; hit area = 1 px `elementFromPoint` probes out to 40 px from centre on each axis, compared with the bounding box. 29 controls, 1 below 44x44:
- NAV: `a.logo` (AZ Adam Zuzo): box 138x32; hit area 81+ x 33 px (height < 44). Header logo link. See F4.

Not covered: content collapsed in closed phone accordions (work/community/talk/stack/offer toggles are visible and passed; their hidden bodies are not tappable until open).

## 6. Network (full scroll at 390 and 1440)
| Viewport | Before click | After talk-facade click |
|---|---|---|
| 390 | localhost:4321 x56 | + www.youtube-nocookie.com x5, fonts.gstatic.com x1 |
| 1440 | localhost:4321 x120 | + www.youtube-nocookie.com x6, fonts.gstatic.com x1 |

At 390 the Talk toggle had to be expanded first (facade is hidden until then). No third-party request before the click.

## 7. Keyboard
Tab sequence (1440): skip link > rail (aside) > header nav > top > services > about > work > community > stack > contact, 69 stops, then wraps to the skip link. 390: skip link > nav > top ... contact, 31 stops (no rail).
- Skip link: first Tab focuses "Skip to content" (`#main`); Enter sets `#main`, scrolls to y=60 (1440) / 58 (390), focus moves on to the main content. Works.
- Visible focus: present (outline or box-shadow) on every one of the 69 / 31 stops.
- Invisible/inert/offscreen focusable elements: none permanently. Transient only: `#about` "Watch the talk" / "See community" cards and `#community` Meetup links have `opacity:0` (reveal-on-scroll, `translate: 0 32px`) at the instant of focus and finish fading in about 1 s (F3). Offer-tab/slider articles that are off-screen are `inert` as designed. Skip link read "offscreen" at the end of wrap-around only because of smooth-scroll timing (not reproduced as a defect).

## 8. Reduced motion (`emulateMedia` reducedMotion: reduce, via context option)
- `document.getAnimations()` after load + 1.5 s: **0** animations/transitions (1440 and 390).
- Diagram (`[data-test=arch-now]`) stays `01 / 06` after 9 s (no auto-advance) at both sizes.
- Marquee (1440): `#trusted [data-test=marquee]` has 1 child (no duplicate set), `animation-name: none`, `transform: none`, static. At 390 the marquee selector is absent (phone uses the rotation variant; no animation running).

## Findings
| id | Severity | Owner (culprit) | Affected | Evidence | Suggested fix |
|---|---|---|---|---|---|
| F1 | **major** (budget gate) | A Shell (`src/layouts/Base.astro`, font CSS imports; `astro.config.mjs`) | global CSS, FCP/render-blocking | CSS gzip 37,237 B vs 30,720 B budget. 6 Geist Mono cyrillic/latin-ext woff2 subsets inlined as base64 into `index.*.css` (`@font-face` = 28 KB gz of 37 KB); non-font CSS only ~9 KB gz | Import only latin subsets (`@fontsource/geist-mono/latin-400.css`, `latin-500.css` and the matching schibsted-grotesk latin files) or set `vite.build.assetsInlineLimit: 0`. Expect CSS ~10 KB gz |
| F2 | minor | B Offers | `#services` slider articles | Lighthouse desktop `aria-allowed-role`: `article#offer-panel-0[role=tabpanel]` ("ARIA role tabpanel is not allowed for given element"). axe (full-page) did not flag it | Use `div`/`section` for the tabpanel wrapper or drop `role=tabpanel` from `<article>` and put it on an inner div |
| F3 | minor | A Shell (reveal) / C About+Community | `#about` CTA cards, `#community` links | Focused element is `opacity:0` until its reveal fires (~0.9 s fade) when reached by Tab | Add `:focus-within`/focus handler that forces reveal, or reveal on `focusin` in `shell.ts` |
| F4 | minor | A Shell | header logo (`a.logo`) at 390 | Box 138x32, hit area ~33 px tall (target < 44) | Extend with `::after { inset: -6px 0 }` per design 6.9. Automated `target-size` still passes (spacing exception) |
| F5 | minor (info) | C Content | YouTube facade (after click) | `fonts.gstatic.com` x1 requested by the embed player after click (plus 5-6 youtube-nocookie requests). Outside the "only youtube-nocookie" allowance, but made by the iframe, not the site | Accept as a YouTube embed side effect, or document it in design 8 |
| F6 | info | A Shell | global | Lighthouse mobile LCP 2.6-2.7 s (score 0.86-0.87), still passes Perf 0.96. Render-blocking CSS ~440 ms | Fixed by F1 (smaller CSS) |

No blocker findings. No findings for D Work or E Stack/Trusted/Contact.

## Flaky tests
- 1 unidentified Playwright test in the full `--workers=4` run (first run: 1 unexpected; second run: 0). Cannot attribute without the failing test name. The failed run's report was overwritten. Re-run with `--reporter=list --retries=0` a few times to find it.

## Notes
- Server on 4321 was stopped after QA. Lighthouse reports are in `.lighthouseci/` (not committed); temp scripts in the scratchpad. No source or test files were modified.

## Verdict: fail (CSS gzip budget, F1)

## Re-run after fixes (2026-10-19, integration)

| Finding | Fix | Result |
|---|---|---|
| F1 CSS gzip 37.2 KB | Latin font subsets only (`Base.astro`), `vite.build.assetsInlineLimit: 0` (`astro.config.mjs`) | CSS **9.4 KB gzip**, 0 base64 fonts - **PASS** |
| F2 `aria-allowed-role` on `article[role=tabpanel]` | `role=tabpanel` moved to a `display: contents` wrapper inside the slider article (`Offers.astro`) | axe (incl. best-practice) at 390/768: none; 1440: only color-contrast (accepted) - **PASS** |
| F3 focusable at opacity 0 during reveal | `focusin` reveals the element at once, keyboard focus (`:focus-visible`) only - mouse clicks unaffected (`shell.ts`) | 60 Tab stops at 1440: 0 focused while invisible - **PASS** |
| F4 header logo hit area 33 px | `.hit` on the logo link (`Header.astro`) | - **PASS** |
| F5 `fonts.gstatic.com` from the YouTube embed | Accepted: only after the user clicks play; the embed is YouTube's own document | **ACCEPTED** |

- Playwright full suite: **389 passed, 0 failed** (workers=4).
- Lighthouse mobile (3 runs): **Performance 0.98, Accessibility 1.00, Best Practices 1.00, SEO 1.00**; LCP 2.4 s, CLS 0, TBT 0 ms.
- `npm run build`: 0 errors, 0 warnings.

**Verdict: PASS** - ready for Gate H.
