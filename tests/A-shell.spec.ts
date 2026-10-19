// Component A (Shell): rail, header/nav, menu, progress bars, hero, tracking, pauses, reveal.
// Spec: docs/design.md §5 row A, §10 selector contract; docs/inventory.md §3.0-3.2, §4 #5-#8, #13, #16.
import { test, expect, type Page, type Locator } from '@playwright/test';
import { FIXED_TIME } from './harness/viewports';

const CHAPTERS = ['top', 'services', 'about', 'work', 'community', 'stack', 'contact'] as const;
const NAV_ITEMS = ['services', 'about', 'work', 'community'] as const;
const PAUSED = ['about', 'work', 'community', 'stack'] as const;

const NAV = 'header nav[aria-label="Main"]';
const MENU_BTN = 'button[aria-label="Sections"][aria-expanded]';
const RAIL = 'aside[aria-label="Page progress"]';

const bandOf = (name: string) => ({
  navWide: name === 'desktop' || name === 'short-desktop',
  rail: name === 'desktop' || name === 'short-desktop',
  phone: name === 'phone',
});

async function jump(page: Page, y: number) {
  await page.evaluate((top) => window.scrollTo({ top, behavior: 'instant' as ScrollBehavior }), y);
}
async function toChapter(page: Page, id: string) {
  if (id === 'contact') {
    await page.evaluate(() => window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'instant' as ScrollBehavior }));
    return;
  }
  const y = await page.evaluate((i) => document.getElementById(i)!.getBoundingClientRect().top + window.scrollY + 1, id);
  await jump(page, y);
}
/** scaleX / scaleY of the element's computed transform (identity if none). */
async function scale(loc: Locator, axis: 'x' | 'y'): Promise<number> {
  return loc.evaluate((el, ax) => {
    const m = new DOMMatrix(getComputedStyle(el).transform);
    return ax === 'x' ? m.a : m.d;
  }, axis);
}
async function progress(page: Page) {
  return page.evaluate(() => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    return window.scrollY / max;
  });
}

test.describe('nav and menu @A', () => {
  test('nav links vs menu button per band @A', async ({ page }, info) => {
    await page.goto('/');
    const b = bandOf(info.project.name);
    const btn = page.locator(`${NAV} ${MENU_BTN}, header ${MENU_BTN}`);
    if (b.navWide) {
      for (const id of NAV_ITEMS) await expect(page.locator(`${NAV} a[href="#${id}"]:visible`), id).toHaveCount(1);
      await expect(btn).toBeHidden();
    } else {
      await expect(btn).toBeVisible();
      await expect(page.locator('#menu')).toBeHidden();
      for (const id of NAV_ITEMS) await expect(page.locator(`${NAV} a[href="#${id}"]:visible`), id).toHaveCount(0);
    }
  });

  test('menu opens and closes, Esc returns focus to the button @A', async ({ page }, info) => {
    test.skip(bandOf(info.project.name).navWide, 'menu is < 860 only');
    await page.goto('/');
    const btn = page.locator(MENU_BTN);
    await expect(btn).toHaveAttribute('aria-expanded', 'false');
    await btn.click();
    await expect(btn).toHaveAttribute('aria-expanded', 'true');
    await expect(page.locator('#menu')).toBeVisible();
    for (const id of CHAPTERS) await expect(page.locator(`#menu a[href="#${id}"]`), id).toHaveCount(1);
    await page.keyboard.press('Escape');
    await expect(btn).toHaveAttribute('aria-expanded', 'false');
    await expect(page.locator('#menu')).toBeHidden();
    await expect(btn).toBeFocused();
    // toggle closes as well
    await btn.click();
    await expect(btn).toHaveAttribute('aria-expanded', 'true');
    await btn.click();
    await expect(btn).toHaveAttribute('aria-expanded', 'false');
  });

  test('menu item click closes the menu and navigates @A', async ({ page }, info) => {
    test.skip(bandOf(info.project.name).navWide, 'menu is < 860 only');
    await page.goto('/');
    await expect(page.locator(MENU_BTN)).toHaveCount(1);
    await page.locator(MENU_BTN).click();
    await page.locator('#menu a[href="#work"]').click();
    await expect(page.locator(MENU_BTN)).toHaveAttribute('aria-expanded', 'false');
    await expect(page.locator('#menu')).toBeHidden();
    await expect.poll(() => new URL(page.url()).hash).toBe('#work');
    await expect
      .poll(() => page.evaluate(() => Math.round(document.getElementById('work')!.getBoundingClientRect().top)), { timeout: 5000 })
      .toBeGreaterThanOrEqual(92);
    expect(await page.evaluate(() => document.getElementById('work')!.getBoundingClientRect().top)).toBeLessThanOrEqual(100);
  });

  test('phone menu button has a 44px hit area @A', async ({ page }, info) => {
    test.skip(!bandOf(info.project.name).phone, 'phone only');
    await page.goto('/');
    const btn = page.locator(MENU_BTN);
    await expect(btn).toBeVisible();
    const box = (await btn.boundingBox())!;
    const cx = box.x + box.width / 2;
    const cy = box.y + box.height / 2;
    const hits = await page.evaluate(
      ({ cx, cy }) => {
        const b = document.querySelector('button[aria-label="Sections"]')!;
        const pts = [[-21, 0], [21, 0], [0, -21], [0, 21], [-21, -21], [21, 21]];
        return pts.map(([dx, dy]) => {
          const el = document.elementFromPoint(cx + dx, cy + dy);
          return !!el && (el === b || b.contains(el));
        });
      },
      { cx, cy },
    );
    expect(hits).toEqual([true, true, true, true, true, true]);
  });
});

test.describe('rail and progress @A', () => {
  test('rail only at >= 1340 @A', async ({ page }, info) => {
    await page.goto('/');
    const rail = page.locator(RAIL);
    if (bandOf(info.project.name).rail) {
      await expect(rail).toBeVisible();
      for (const id of CHAPTERS) await expect(rail.locator(`a[href="#${id}"]`), id).toHaveCount(1);
      await expect(rail.locator('[data-test=rail-fill]')).toHaveCount(1);
    } else {
      await expect(rail).toBeHidden();
    }
  });

  for (const id of CHAPTERS) {
    test(`aria-current follows scroll: ${id} @A @integration`, async ({ page }, info) => {
      await page.goto('/');
      await toChapter(page, id);
      const b = bandOf(info.project.name);
      if (b.rail) {
        await expect(page.locator(`${RAIL} a[aria-current="true"]`)).toHaveCount(1);
        await expect(page.locator(`${RAIL} a[href="#${id}"][aria-current="true"]`)).toHaveCount(1);
      }
      if (b.navWide) {
        if ((NAV_ITEMS as readonly string[]).includes(id)) {
          await expect(page.locator(`${NAV} a[href="#${id}"][aria-current="true"]`)).toHaveCount(1);
        }
        await expect(page.locator(`${NAV} a[aria-current="true"]:not([href="#top"])`)).toHaveCount(
          (NAV_ITEMS as readonly string[]).includes(id) ? 1 : 0,
        );
      } else {
        await expect(page.locator(MENU_BTN)).toHaveCount(1);
        await page.locator(MENU_BTN).click();
        await expect(page.locator(`#menu a[href="#${id}"][aria-current="true"]`)).toHaveCount(1);
        await expect(page.locator('#menu a[aria-current="true"]')).toHaveCount(1);
      }
    });
  }

  test('rail-fill and bar-fill transform tracks scroll progress @A', async ({ page }, info) => {
    await page.goto('/');
    const bar = page.locator('[data-test=bar-fill]');
    await expect(bar).toHaveCount(1);
    const rail = page.locator('[data-test=rail-fill]');
    const hasRail = bandOf(info.project.name).rail;
    if (hasRail) await expect(rail).toHaveCount(1);

    await expect.poll(() => scale(bar, 'x')).toBeLessThan(0.01);
    if (hasRail) await expect.poll(() => scale(rail, 'y')).toBeLessThan(0.01);

    const max = await page.evaluate(() => document.documentElement.scrollHeight - window.innerHeight);
    await jump(page, max / 2);
    const p = await progress(page);
    await expect.poll(() => scale(bar, 'x')).toBeCloseTo(p, 1);
    if (hasRail) await expect.poll(() => scale(rail, 'y')).toBeCloseTo(p, 1);

    await jump(page, max);
    await expect.poll(() => scale(bar, 'x')).toBeGreaterThan(0.99);
    if (hasRail) await expect.poll(() => scale(rail, 'y')).toBeGreaterThan(0.99);
  });
});

test.describe('hero @A', () => {
  test('exactly one h1 @A', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('h1')).toHaveCount(1);
    await expect(page.locator('#top h1')).toHaveCount(1);
  });

  test('hero photo is a single element (no duplicated markup per band) @A', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('[data-test=hero-photo]')).toHaveCount(1);
    const imgs = await page.locator('[data-test=hero-photo]').evaluate((el) => (el.matches('img') ? 1 : el.querySelectorAll('img').length));
    expect(imgs).toBe(1);
    // nothing else in the hero is a second photo
    expect(await page.locator('#top img[src*="headshot"]').count()).toBeLessThanOrEqual(1);
  });

  const activeIdx = (page: Page) =>
    page.locator('[data-test=tech-group]').evaluateAll((groups) =>
      groups.map((g) => {
        const act = g.querySelectorAll('[data-active]');
        if (act.length !== 1) return { n: act.length, i: -1, len: 0 };
        const parent = act[0].parentElement!;
        return { n: 1, i: Array.prototype.indexOf.call(parent.children, act[0]), len: parent.children.length };
      }),
    );

  test('tech-group active icon advances every 2200 ms @A', async ({ page }, info) => {
    test.skip(bandOf(info.project.name).phone, 'tech row is hidden on phone');
    await page.clock.install({ time: FIXED_TIME });
    await page.goto('/');
    await expect(page.locator('[data-test=tech-group]')).toHaveCount(3);
    const before = await activeIdx(page);
    for (const g of before) expect(g.n, 'one [data-active] icon per group').toBe(1);
    await page.clock.runFor(2200);
    const after = await activeIdx(page);
    for (let k = 0; k < 3; k++) {
      expect(after[k].n).toBe(1);
      expect((after[k].i - before[k].i + before[k].len) % before[k].len, `group ${k} advanced by one`).toBe(1);
    }
  });

  test('tech-group does not advance under reduced motion @A', async ({ page }, info) => {
    test.skip(bandOf(info.project.name).phone, 'tech row is hidden on phone');
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.clock.install({ time: FIXED_TIME });
    await page.goto('/');
    await expect(page.locator('[data-test=tech-group]')).toHaveCount(3);
    const before = await activeIdx(page);
    for (const g of before) expect(g.n).toBe(1);
    await page.clock.runFor(2200 * 3);
    expect(await activeIdx(page)).toEqual(before);
  });
});

test.describe('sticky pauses, deep links, reveal @A @integration', () => {
  for (const id of PAUSED) {
    test(`[data-pause] sticky top follows the v4 formula: ${id} @A @integration`, async ({ page }) => {
      await page.goto('/');
      const loc = page.locator(`#${id} > [data-pause]`);
      await expect(loc).toHaveCount(1);
      await expect(loc).toHaveCSS('position', 'sticky');
      const expected = () =>
        page.evaluate((i) => {
          const c = document.querySelector(`#${i} > [data-pause]`) as HTMLElement;
          const content = c.offsetHeight - parseFloat(getComputedStyle(c).paddingBottom);
          const avail = window.innerHeight - 96;
          const want = content <= avail ? 90 + (avail - content) / 2 : window.innerHeight - content - 16;
          return { want, got: parseFloat(getComputedStyle(c).top) };
        }, id);
      await expect.poll(async () => { const r = await expected(); return Math.abs(r.got - r.want) <= 2; }, { timeout: 3000 }).toBe(true);
    });
  }

  for (const id of ['work', 'stack']) {
    test(`deep link /#${id}: CLS 0 and target top 96px @A @integration`, async ({ page }) => {
      await page.addInitScript(() => {
        (window as any).__cls = 0;
        new PerformanceObserver((list) => {
          for (const e of list.getEntries() as any[]) (window as any).__cls += e.value;
        }).observe({ type: 'layout-shift', buffered: true });
      });
      await page.goto(`/#${id}`, { waitUntil: 'load' });
      await page.waitForLoadState('networkidle');
      await expect
        .poll(() => page.evaluate((i) => Math.round(document.getElementById(i)!.getBoundingClientRect().top), id), { timeout: 5000 })
        .toBeGreaterThanOrEqual(92);
      await page.waitForTimeout(500);
      const top = await page.evaluate((i) => document.getElementById(i)!.getBoundingClientRect().top, id);
      expect(top).toBeLessThanOrEqual(100);
      expect(await page.evaluate(() => (window as any).__cls)).toBe(0);
    });
  }

  /** Indices of [data-reveal] elements whose top is below 92% of the viewport at load. */
  const belowFold = (page: Page) =>
    page.locator('[data-reveal]').evaluateAll((els) =>
      els.map((el, i) => (el.getBoundingClientRect().top >= window.innerHeight * 0.92 ? i : -1)).filter((i) => i >= 0),
    );

  test('[data-reveal] below the fold starts hidden and shows when scrolled to @A @integration', async ({ page }) => {
    await page.goto('/', { waitUntil: 'load' });
    const idx = (await belowFold(page)).slice(0, 4);
    expect(idx.length, 'at least one below-the-fold [data-reveal]').toBeGreaterThan(0);
    const els = page.locator('[data-reveal]');
    for (const i of idx) expect(await els.nth(i).evaluate((e) => getComputedStyle(e).opacity), `#${i} initial`).toBe('0');
    for (const i of idx) {
      await els.nth(i).evaluate((e) => e.scrollIntoView({ block: 'center', behavior: 'instant' as ScrollBehavior }));
      await expect.poll(() => els.nth(i).evaluate((e) => getComputedStyle(e).opacity), { timeout: 4000 }).toBe('1');
    }
  });

  test('[data-reveal] is visible under reduced motion @A @integration', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/', { waitUntil: 'load' });
    const idx = await belowFold(page);
    expect(idx.length, 'at least one below-the-fold [data-reveal]').toBeGreaterThan(0);
    for (const i of idx) {
      expect(await page.locator('[data-reveal]').nth(i).evaluate((e) => getComputedStyle(e).opacity), `#${i}`).toBe('1');
    }
  });
});
