// Writes tests/fixtures/design-<viewport>.json (innerText per region) and design screenshots.
// Run: npm run snapshot-design  (needs internet: the design page loads React/Babel from unpkg).
import { test } from '@playwright/test';
import { mkdirSync, writeFileSync } from 'node:fs';
import { REGIONS } from '../harness/regions';
import { collapse } from '../harness/text';
import { VIEWPORTS, FIXED_TIME, type ViewportName } from '../harness/viewports';

const OUT = new URL('../fixtures/', import.meta.url);
const SHOTS = new URL('../../test-results/design/', import.meta.url);

for (const vp of Object.keys(VIEWPORTS) as ViewportName[]) {
  test(`snapshot design @ ${vp}`, async ({ browser }) => {
    const context = await browser.newContext({ viewport: VIEWPORTS[vp], hasTouch: vp === 'phone' || vp === 'mid' });
    const page = await context.newPage();
    await page.clock.install({ time: FIXED_TIME });
    await page.goto('/Adam%20Zuzo%20Profile%20v4.dc.html', { waitUntil: 'networkidle' });
    await page.locator('section[data-screen-label="07 Contact"]').waitFor({ timeout: 30_000 });
    await page.evaluate(() => document.fonts.ready);

    const out: Record<string, string | null> = {};
    for (const r of REGIONS) {
      const el = page.locator(r.design).first();
      out[r.name] = (await el.count()) && (await el.isVisible()) ? collapse(await el.innerText()) : null;
    }
    mkdirSync(OUT, { recursive: true });
    writeFileSync(new URL(`design-${vp}.json`, OUT), JSON.stringify(out, null, 2) + '\n');

    mkdirSync(SHOTS, { recursive: true });
    await page.screenshot({ path: new URL(`${vp}-full.png`, SHOTS).pathname, fullPage: true });
    await context.close();
  });
}
