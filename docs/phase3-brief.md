# Phase 3 brief (shared by test-writers and solvers)

Read: `docs/design.md` (binding: §3 responsive model, §4 file + section contract, §5 components, §6 behaviour changes, §7 reduced motion, §8 perf, §10 testing + **selector contract**), `docs/inventory.md` (facts per section §3, interactions §4, decisions §10), and the v4 source `../_source/design/Adam Zuzo Profile v4.dc.html` (markup + inline styles = the visual truth).

## Rules for everyone
- Copy lives in `src/data/*.ts` (already written, verbatim). Never retype copy in components or tests; import it.
- Selectors: only those in design.md §10 selector contract (+ section ids). Add `data-test` hooks exactly as listed.
- Viewports / projects: `phone` 390x844 touch, `mid` 768x1024 touch, `desktop` 1440x900, `short-desktop` 1440x700 (scrollMode off). The band-880/920/1200 projects existed only for the retired copy test and were removed.
- Deterministic time: `await page.clock.install({ time: FIXED_TIME })` from `tests/harness/viewports.ts` before `goto`; advance with `page.clock.runFor(ms)`.
- Reduced motion: `await page.emulateMedia({ reducedMotion: 'reduce' })`.
- Tags in test titles: `@<owner>` always (`@A`..`@E`); `@integration` for tests that need other components' real markup; `@shot` for screenshot-only tests.
- Copy had its own test (`tests/copy.spec.ts`, tag `@copy`); it was retired when the page became a sales page. Do not re-add strict wording assertions.
- Shared files (design.md §4) are owned by the scaffold. Solvers must not edit them; if blocked, say so in the report.
- Mono icon fallback spans (`{{ x.mono }}` under icons in v4) stay in the DOM, with `aria-hidden="true"`.
- Run tests: `npx playwright test tests/<X>.spec.ts` (server is `npx serve dist` on $PORT, default 4321). Build with `npx astro build` (fast) — `npm run build` adds `astro check`.
