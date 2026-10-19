// Copy test: visible text per region == design fixture (design.md §10). Tags: @copy @<owner>.
import { test, expect } from '@playwright/test';
import { REGIONS } from './harness/regions';
import { loadFixture } from './harness/fixtures';
import { applyCopyDecisions, collapse } from './harness/text';
import { FIXED_TIME, type ViewportName } from './harness/viewports';

for (const r of REGIONS) {
  test(`copy: ${r.name} @copy @${r.owner}`, async ({ page }, info) => {
    const vp = info.project.name as ViewportName;
    const expected = loadFixture(vp)[r.name];
    await page.clock.install({ time: FIXED_TIME });
    await page.goto('/');
    const el = page.locator(r.site).first();
    if (expected === null) {
      // Region not rendered in the design at this viewport.
      if (await el.count()) await expect(el).toBeHidden();
      return;
    }
    await expect(el).toBeVisible();
    expect(collapse(await el.innerText())).toBe(applyCopyDecisions(expected));
  });
}
