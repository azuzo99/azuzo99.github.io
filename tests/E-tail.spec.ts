// Component E: #stack, #trusted, #contact + footer (design.md §5 row E; inv §3.7, §3.9, §3.10, §4 #9 #11 #16 #17 #19).
// Selectors: design.md §10 contract only. Copy is imported from src/data (never retyped).
import { test, expect, type Page, type Locator } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { FIXED_TIME } from './harness/viewports';
import { stackData, trustedData, contactData } from './harness/E-data';

const { stackGroups } = stackData;
const { trusted, trustedSection } = trustedData;
const { contactSection, contacts, email, footer } = contactData;

const isWide = (page: Page) => page.viewportSize()!.width >= 860; // stack grid vs accordion
const isPhone = (page: Page) => page.viewportSize()!.width < 600;
const only = (cond: boolean, why: string) => test.skip(!cond, why);

async function open(page: Page) {
  await page.clock.install({ time: FIXED_TIME });
  await page.goto('/');
}
const isOpen = async (l: Locator) => {
  const v = await l.getAttribute('data-open');
  return v !== null && v !== 'false';
};
const allTools = (page: Page) => page.locator('#stack [data-test=stack-tool]');

// ---------------------------------------------------------------- Stack >= 860
test.describe('stack wide', () => {
  test.beforeEach(async ({ page }) => {
    only(isWide(page), '>=860 only');
    await open(page);
    await page.locator('#stack').scrollIntoViewIfNeeded();
  });

  test('3-column grid with 18 tools @E', async ({ page }) => {
    await expect(allTools(page)).toHaveCount(18);
    const groups = page.locator('#stack [data-test=stack-group]');
    await expect(groups).toHaveCount(3);
    const xs = await groups.evaluateAll((els) => els.map((e) => Math.round(e.getBoundingClientRect().left)));
    const ys = await groups.evaluateAll((els) => els.map((e) => Math.round(e.getBoundingClientRect().top)));
    expect(new Set(xs).size, 'three distinct columns').toBe(3);
    expect(new Set(ys).size, 'one row').toBe(1);
    await expect(page.locator('#stack button[aria-expanded]')).toHaveCount(0);
  });

  test('hover opens the where-used row, leaving closes it @E', async ({ page }) => {
    const tool = allTools(page).nth(0);
    await expect(tool).not.toHaveAttribute('data-open', /.*/);
    await tool.hover();
    await expect(tool).toHaveAttribute('data-open', /^(true|)$/);
    await expect(tool.locator('[data-test=where-used]')).toBeVisible();
    await page.mouse.move(2, 2);
    await expect.poll(() => isOpen(tool)).toBe(false);
    await expect(tool.locator('[data-test=where-used]')).toBeHidden();
  });

  test('click pins, hover is inert while pinned, click again unpins @E', async ({ page }) => {
    const a = allTools(page).nth(0);
    const b = allTools(page).nth(1);
    await a.click();
    await page.mouse.move(2, 2);
    expect(await isOpen(a), 'pinned stays open after leaving').toBe(true);
    await b.hover();
    expect(await isOpen(b), 'hover inert while pinned').toBe(false);
    expect(await isOpen(a)).toBe(true);
    await a.click();
    await page.mouse.move(2, 2);
    await expect.poll(() => isOpen(a)).toBe(false);
    await b.hover();
    await expect.poll(() => isOpen(b)).toBe(true);
  });

  test('where-used text matches src/data for every tool @E', async ({ page }) => {
    const flat = stackGroups.flatMap((g) => g.items);
    for (let i = 0; i < flat.length; i++) {
      const tool = allTools(page).nth(i);
      await tool.hover();
      await expect(tool.locator('[data-test=where-used]'), flat[i].id).toContainText(flat[i].where);
    }
  });
});

// ---------------------------------------------------------------- Stack < 860
test.describe('stack accordion', () => {
  test.beforeEach(async ({ page }) => {
    only(!isWide(page), '<860 only');
    await open(page);
    await page.locator('#stack').scrollIntoViewIfNeeded();
  });

  test('3 accordion groups, multi-open @E', async ({ page }) => {
    const btns = page.locator('#stack [data-test=stack-group] button[aria-expanded]');
    await expect(page.locator('#stack [data-test=stack-group]')).toHaveCount(3);
    await expect(btns).toHaveCount(3);
    for (const b of await btns.all()) await expect(b).toHaveAttribute('aria-expanded', 'false');
    await btns.nth(0).click();
    await btns.nth(2).click();
    await expect(btns.nth(0)).toHaveAttribute('aria-expanded', 'true');
    await expect(btns.nth(1)).toHaveAttribute('aria-expanded', 'false');
    await expect(btns.nth(2)).toHaveAttribute('aria-expanded', 'true');
    await btns.nth(1).click();
    for (const b of await btns.all()) await expect(b).toHaveAttribute('aria-expanded', 'true');
  });

  test('tapping a tool pins it and shows where-used @E', async ({ page }) => {
    const group = page.locator('#stack [data-test=stack-group]').nth(1);
    await group.locator('button[aria-expanded]').click();
    const tool = group.locator('[data-test=stack-tool]').nth(2);
    await expect(group.locator('[data-test=where-used]:visible')).toHaveCount(0);
    await tool.click();
    const where = group.locator('[data-test=where-used]:visible');
    await expect(where).toHaveCount(1);
    await expect(where).toContainText(stackGroups[1].items[2].where);
    expect(await isOpen(tool)).toBe(true);
  });
});

// ---------------------------------------------------------------- Trusted
test.describe('trusted', () => {
  test('has an accessible name @E', async ({ page }) => {
    await open(page);
    await expect(page.getByRole('region', { name: trustedSection.ariaLabel })).toHaveCount(1);
    await expect(page.locator('#trusted')).toHaveAttribute('aria-label', trustedSection.ariaLabel);
  });

  test('marquee: list twice, second set aria-hidden, 38s linear, pauses on hover @E', async ({ page }) => {
    only(!isPhone(page), '>=600 only');
    await open(page);
    const m = page.locator('#trusted [data-test=marquee]');
    await m.scrollIntoViewIfNeeded();
    await expect(m.locator('img')).toHaveCount(trusted.length * 2);
    await expect(m.locator('[aria-hidden="true"] img')).toHaveCount(trusted.length);
    await expect(m.locator('img:not([aria-hidden="true"] img)')).toHaveCount(trusted.length);
    const css = await m.evaluate((e) => {
      const s = getComputedStyle(e);
      return { d: s.animationDuration, t: s.animationTimingFunction, i: s.animationIterationCount, n: s.animationName };
    });
    expect(css).toMatchObject({ d: '38s', t: 'linear', i: 'infinite' });
    expect(css.n).not.toBe('none');
    const state = () => m.evaluate((e) => getComputedStyle(e).animationPlayState);
    expect(await state()).toBe('running');
    await m.hover();
    await expect.poll(state).toBe('paused');
    await page.mouse.move(2, 2);
    await expect.poll(state).toBe('running');
  });

  test('phone: a single logo rotates every 2200ms @E', async ({ page }) => {
    only(isPhone(page), 'phone only');
    await open(page);
    await page.locator('#trusted').scrollIntoViewIfNeeded();
    const img = page.locator('#trusted img:visible');
    await expect(img).toHaveCount(1);
    await expect(page.locator('#trusted [data-test=marquee] img')).toHaveCount(0);
    const before = await img.getAttribute('src');
    await page.clock.runFor(2200);
    await expect.poll(() => img.getAttribute('src')).not.toBe(before);
    await expect(img).toHaveCount(1);
  });

  test('reduced motion: no animation, single set, all logos visible @E', async ({ page }) => {
    only(!isPhone(page), '>=600 only');
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await open(page);
    const m = page.locator('#trusted [data-test=marquee]');
    await m.scrollIntoViewIfNeeded();
    expect(await m.evaluate((e) => getComputedStyle(e).animationName)).toBe('none');
    await expect(m.locator('img')).toHaveCount(trusted.length);
    await expect(m.locator('[aria-hidden="true"]')).toHaveCount(0);
    for (const i of await m.locator('img').all()) await expect(i).toBeVisible();
    const box = await m.boundingBox();
    const vw = page.viewportSize()!.width;
    for (const i of await m.locator('img').all()) {
      const b = (await i.boundingBox())!;
      expect(b.x + b.width, 'logo inside viewport').toBeLessThanOrEqual(vw + 1);
    }
    expect(box).not.toBeNull();
  });
});

// ---------------------------------------------------------------- Contact
test.describe('contact', () => {
  test.beforeEach(async ({ page }) => {
    await open(page);
    await page.locator('#contact').scrollIntoViewIfNeeded();
  });

  test('heading shows (06) and CTA goes to Calendly @E', async ({ page }) => {
    await expect(page.locator('#contact').getByText(contactSection.num, { exact: true })).toBeVisible();
    await expect(page.locator('#contact h2')).toHaveText(contactSection.heading);
    const cta = page.locator(`#contact a[href="${contactSection.cta.href}"]`);
    await expect(cta).toHaveCount(1);
    await expect(cta).toHaveText(contactSection.cta.label);
  });

  test('>=600: 3 contact rows + copy-email row @E', async ({ page }) => {
    only(!isPhone(page), '>=600 only');
    for (const c of contacts) {
      const row = page.locator(`#contact a[href="${c.href}"]`);
      await expect(row).toHaveCount(1);
      await expect(row).toContainText(c.label);
      await expect(row).toContainText(c.sub);
      await expect(row).toContainText(contactSection.rowArrow);
    }
    const copy = page.locator('#contact [data-test=copy-email]');
    await expect(copy).toHaveCount(1);
    await expect(copy).toContainText(email.hint);
    await expect(copy).toContainText(email.action);
    // rows stack vertically: same x, increasing y
    const ys = await Promise.all(contacts.map(async (c) => (await page.locator(`#contact a[href="${c.href}"]`).boundingBox())!.y));
    expect(ys[0] < ys[1] && ys[1] < ys[2]).toBe(true);
  });

  test('phone: 3-column icon grid + compact copy button @E', async ({ page }) => {
    only(isPhone(page), 'phone only');
    for (const c of contacts) {
      const a = page.locator(`#contact a[href="${c.href}"]`);
      await expect(a).toHaveCount(1);
      await expect(a).not.toContainText(c.sub);
    }
    const measure = () => Promise.all(contacts.map(async (c) => (await page.locator(`#contact a[href="${c.href}"]`).boundingBox())!));
    // Poll: the shell's staggered reveal (translate + delay) moves the links for ~1 s after they enter the viewport.
    await page.locator('#contact').scrollIntoViewIfNeeded();
    await expect.poll(async () => new Set((await measure()).map((b) => Math.round(b.y))).size, { message: 'single row', timeout: 5000 }).toBe(1);
    const boxes = await measure();
    expect(new Set(boxes.map((b) => Math.round(b.x))).size, 'three columns').toBe(3);
    const copy = page.locator('#contact [data-test=copy-email]');
    await expect(copy).toContainText(email.action);
    await expect(copy).not.toContainText(email.hint);
    const cb = (await copy.boundingBox())!;
    expect(cb.height, 'compact').toBeLessThan(70);
  });

  test('copy-email writes the address, shows Copied, reverts after 2200ms @E', async ({ page, context }) => {
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);
    const copy = page.locator('#contact [data-test=copy-email]');
    const state = page.locator('#contact [data-test=copy-state]');
    await expect(state).toHaveCount(1);
    await copy.click();
    expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(email.address);
    await expect(copy).toContainText(email.actionDone);
    if (!isPhone(page)) await expect(copy).toContainText(email.hintDone);
    await expect(state).toContainText(/Copied/);
    await page.clock.runFor(email.resetMs);
    await expect(copy).not.toContainText(email.actionDone);
    await expect(copy).toContainText(email.action);
    if (!isPhone(page)) await expect(copy).toContainText(email.hint);
  });

  test('copy-email falls back to mailto when the Clipboard API is missing @E', async ({ page }) => {
    await page.addInitScript(() => Object.defineProperty(navigator, 'clipboard', { value: undefined, configurable: true }));
    await page.reload();
    await page.locator('#contact').scrollIntoViewIfNeeded();
    const requested: string[] = [];
    page.on('request', (r) => requested.push(r.url()));
    await page.locator('#contact [data-test=copy-email]').click();
    await expect.poll(() => requested.some((u) => u.startsWith(`mailto:${email.address}`))).toBe(true);
  });

  test('footer text from src/data @E', async ({ page }) => {
    const c = page.locator('#contact');
    await expect(c).toContainText(footer.copyright);
    if (isPhone(page)) await expect(c).not.toContainText(footer.tagline);
    else await expect(c).toContainText(footer.tagline);
  });
});

// ---------------------------------------------------------------- Phone hit areas
test('phone: controls reach a 44px hit area @E', async ({ page }) => {
  only(isPhone(page), 'phone only');
  await open(page);
  // Open every group (multi-open) so all tools are visible before measuring.
  const heads = page.locator('#stack [data-test=stack-group] button[aria-expanded]');
  for (let g = 0; g < (await heads.count()); g++) await heads.nth(g).click();
  const sel = [
    '#stack [data-test=stack-group] button[aria-expanded]',
    '#stack [data-test=stack-tool]',
    '#contact a[href]',
    '#contact [data-test=copy-email]',
  ];
  const bad: string[] = [];
  for (const s of sel) {
    const n = await page.locator(s).count();
    expect(n, s).toBeGreaterThan(0);
    for (let i = 0; i < n; i++) {
      const el = page.locator(s).nth(i);
      await el.scrollIntoViewIfNeeded();
      const ok = await el.evaluate((node) => {
        const r = node.getBoundingClientRect();
        const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
        const hit = (x: number, y: number) => {
          const t = document.elementFromPoint(x, y);
          return !!t && (node === t || node.contains(t));
        };
        return hit(cx - 21, cy) && hit(cx + 21, cy) && hit(cx, cy - 21) && hit(cx, cy + 21);
      });
      if (!ok) bad.push(`${s}[${i}]`);
    }
  }
  expect(bad).toEqual([]);
});

// ---------------------------------------------------------------- axe
test('axe: no serious/critical violations in stack, trusted, contact @E', async ({ page }) => {
  await open(page);
  let b = new AxeBuilder({ page }).include('#stack').include('#trusted').include('#contact').disableRules(['color-contrast']);
  if (isPhone(page)) b = b.withTags(['wcag2a', 'wcag2aa', 'wcag22aa', 'best-practice']);
  const { violations } = await b.analyze();
  const bad = violations.filter((v) => v.impact === 'serious' || v.impact === 'critical');
  expect(bad.map((v) => `${v.id}: ${v.nodes.length}`)).toEqual([]);
});
