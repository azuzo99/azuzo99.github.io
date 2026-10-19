// Component B (Offers) behaviour: design.md §3 rule 4, §5 B, §6.1, §6.8, §7, §10; inventory §3.3, §4 #1-#4, §10 #5.
// Selectors only from the design.md §10 contract (+ section ids).
import { test, expect, type Page, type Locator } from '@playwright/test';
import { FIXED_TIME, type ViewportName } from './harness/viewports';

const SCROLL_MODE: ViewportName[] = ['desktop'];
const ACCORDION_MODE: ViewportName[] = ['phone', 'mid', 'short-desktop'];

const svc = (page: Page) => page.locator('#services');
const tabs = (page: Page) => svc(page).locator('[role=tablist] [role=tab]');
const track = (page: Page) => svc(page).locator('[data-test=offer-track]');
const bars = (page: Page) => svc(page).locator('[data-test=offer-bar]');
const sliders = (page: Page) => svc(page).locator('article[data-variant=slider]');
const accs = (page: Page) => svc(page).locator('article[data-variant=accordion]');

async function open(page: Page) {
  await page.clock.install({ time: FIXED_TIME });
  await page.goto('/');
}

/** Instant scroll, then wait for two frames so the rAF-throttled handler has run. */
async function scrollToY(page: Page, y: number) {
  await page.evaluate(async (yy) => {
    window.scrollTo({ top: yy, behavior: 'instant' as ScrollBehavior });
    await new Promise<void>((r) => requestAnimationFrame(() => requestAnimationFrame(() => r())));
  }, y);
  await page.clock.runFor(50);
  await page.evaluate(() => new Promise<void>((r) => requestAnimationFrame(() => requestAnimationFrame(() => r()))));
}

async function geometry(page: Page) {
  return page.evaluate(() => {
    const el = document.querySelector('#services') as HTMLElement;
    const r = el.getBoundingClientRect();
    return { top: r.top + window.scrollY, height: r.height, total: r.height - window.innerHeight, vh: window.innerHeight };
  });
}

async function scrollToP(page: Page, p: number) {
  const g = await geometry(page);
  await scrollToY(page, g.top + g.total * p);
  return g;
}

/** v4:L823-838 */
function expected(p: number) {
  const seg = Math.min(2, Math.floor(p * 3));
  const s = Math.min(1, p * 3 - seg);
  const t = Math.min(1, Math.max(0, (s - 0.25) / 0.25));
  const e = t * t * (3 - 2 * t);
  const pos = seg < 2 ? seg + e : 2;
  const idx = seg < 2 && s >= 0.5 ? seg + 1 : seg;
  const bar = [0, 1, 2].map((i) => (i < seg ? 100 : i === seg ? (idx > seg ? 100 : s * 100) : 0));
  return { seg, s, pos, idx, bar };
}

/** translateX of the track, as percent of its own width (negative = shifted left). */
async function trackPercent(page: Page): Promise<number> {
  return track(page).evaluate((el) => {
    const tf = getComputedStyle(el).transform;
    if (!tf || tf === 'none') return 0;
    const m = new DOMMatrix(tf);
    return (m.m41 / (el as HTMLElement).offsetWidth) * 100;
  });
}

async function selectedIndex(page: Page): Promise<number> {
  return tabs(page).evaluateAll((els) => els.findIndex((e) => e.getAttribute('aria-selected') === 'true'));
}

async function barPercents(page: Page): Promise<number[]> {
  return bars(page).evaluateAll((els) =>
    els.map((b) => {
      const parent = b.parentElement as HTMLElement;
      return (b.getBoundingClientRect().width / parent.getBoundingClientRect().width) * 100;
    }),
  );
}

const inertOf = (l: Locator) => l.evaluateAll((els) => els.map((e) => (e as HTMLElement).inert || e.hasAttribute('inert')));

test.describe('scrollMode (desktop 1440x900)', () => {
  test.beforeEach(async ({ page }, info) => {
    test.skip(!SCROLL_MODE.includes(info.project.name as ViewportName), 'scrollMode only');
    await open(page);
    await expect(tabs(page)).toHaveCount(3, { timeout: 2000 });
  });

  test('section is 240vh with a sticky inner block @B', async ({ page }) => {
    const g = await geometry(page);
    expect(Math.abs(g.height - g.vh * 2.4)).toBeLessThanOrEqual(2);
    const pos = await page.locator('#services > .sec').evaluate((el) => getComputedStyle(el).position);
    expect(pos).toBe('sticky');
  });

  for (const p of [0.1, 0.4, 0.45, 0.6, 0.9]) {
    test(`track transform follows v4 smoothstep at p=${p} @B`, async ({ page }) => {
      await scrollToP(page, p);
      const exp = expected(p);
      expect(Math.abs((await trackPercent(page)) - -exp.pos * 100)).toBeLessThanOrEqual(1);
    });

    test(`selected tab and bar widths follow v4 at p=${p} @B`, async ({ page }) => {
      await scrollToP(page, p);
      const exp = expected(p);
      expect(await selectedIndex(page)).toBe(exp.idx);
      const widths = await barPercents(page);
      expect(widths).toHaveLength(3);
      widths.forEach((w, i) => expect(Math.abs(w - exp.bar[i])).toBeLessThanOrEqual(1.5));
    });
  }

  test('only the selected tab is in the tab order (roving tabindex) @B', async ({ page }) => {
    await scrollToP(page, 0.4);
    const ti = await tabs(page).evaluateAll((els) => els.map((e) => e.getAttribute('tabindex')));
    expect(ti).toEqual(['-1', '0', '-1']);
  });

  for (const i of [1, 2, 0]) {
    test(`tab click ${i} scrolls to top + total*(i/3) + 4 @B`, async ({ page }) => {
      const g = await geometry(page);
      if (i === 0) await scrollToP(page, 0.9); // come from below
      await tabs(page).nth(i).click();
      const want = g.top + g.total * (i / 3) + 4;
      // Poll the distance, not a lower bound: tab 0 scrolls up from below.
      await expect
        .poll(async () => {
          await page.clock.runFor(100);
          return Math.abs((await page.evaluate(() => window.scrollY)) - want);
        }, { timeout: 5000 })
        .toBeLessThanOrEqual(2);
    });
  }

  test('ArrowRight / ArrowLeft move the selection with a roving tabindex @B', async ({ page }) => {
    await scrollToY(page, (await geometry(page)).top + 4);
    expect(await selectedIndex(page)).toBe(0);
    await tabs(page).nth(0).focus();
    await page.keyboard.press('ArrowRight');
    await expect.poll(async () => { await page.clock.runFor(100); return selectedIndex(page); }, { timeout: 4000 }).toBe(1);
    expect(await tabs(page).evaluateAll((els) => els.map((e) => e.getAttribute('tabindex')))).toEqual(['-1', '0', '-1']);
    await expect(tabs(page).nth(1)).toBeFocused();
    await page.keyboard.press('ArrowLeft');
    await expect.poll(async () => { await page.clock.runFor(100); return selectedIndex(page); }, { timeout: 4000 }).toBe(0);
    expect(await tabs(page).evaluateAll((els) => els.map((e) => e.getAttribute('tabindex')))).toEqual(['0', '-1', '-1']);
    await expect(tabs(page).nth(0)).toBeFocused();
  });

  for (const [p, visible] of [[0.4, 1], [0.9, 2], [0.05, 0]] as const) {
    test(`off-screen slider articles are inert at p=${p} @B`, async ({ page }) => {
      await scrollToP(page, p);
      await expect(sliders(page)).toHaveCount(3);
      const inert = await inertOf(sliders(page));
      expect(inert).toEqual([0, 1, 2].map((i) => i !== visible));
    });
  }

  test('no accordion article is ever inert, and no slider variant outside scrollMode leaks @B', async ({ page }) => {
    await scrollToP(page, 0.4);
    await expect(accs(page)).toHaveCount(3);
    expect(await inertOf(accs(page))).toEqual([false, false, false]);
    for (let i = 0; i < 3; i++) await expect(accs(page).nth(i)).toBeHidden();
  });

  test('channel hover uses the intended fg colour and opacity .85 (inv §10 #5) @B', async ({ page }) => {
    await scrollToP(page, 0.05);
    const links = sliders(page).nth(0).locator('a');
    await expect(links).toHaveCount(3);
    await links.nth(0).hover();
    await expect(links.nth(0)).toHaveCSS('color', 'rgb(17, 17, 17)');
    await expect(links.nth(0)).toHaveCSS('opacity', '0.85');
    await links.nth(1).hover();
    await expect(links.nth(1)).toHaveCSS('color', 'rgb(251, 246, 238)');
    await expect(links.nth(1)).toHaveCSS('opacity', '0.85');
  });
});

test.describe('non-scrollMode accordion (phone, mid, short-desktop)', () => {
  test.beforeEach(async ({ page }, info) => {
    test.skip(!ACCORDION_MODE.includes(info.project.name as ViewportName), 'accordion bands only');
    await open(page);
    await expect(accs(page)).toHaveCount(3, { timeout: 2000 });
  });

  test('accordion articles visible, slider variant and tablist hidden @B', async ({ page }) => {
    for (let i = 0; i < 3; i++) await expect(accs(page).nth(i)).toBeVisible();
    await expect(sliders(page)).toHaveCount(3);
    for (let i = 0; i < 3; i++) await expect(sliders(page).nth(i)).toBeHidden();
    await expect(svc(page).locator('[role=tablist]')).toBeHidden();
    await expect(track(page)).toHaveCount(1);
  });

  test('click toggles aria-expanded, one open at a time, open card is dark @B', async ({ page }) => {
    const btn = (i: number) => accs(page).nth(i).locator('button[aria-expanded]').first();
    const states = () => Promise.all([0, 1, 2].map((i) => btn(i).getAttribute('aria-expanded')));
    expect(await states()).toEqual(['false', 'false', 'false']);
    await btn(0).click();
    expect(await states()).toEqual(['true', 'false', 'false']);
    await expect(accs(page).nth(0)).toHaveCSS('background-color', 'rgb(17, 17, 17)');
    await expect(accs(page).nth(1)).toHaveCSS('background-color', 'rgb(251, 246, 238)');
    await btn(1).click();
    expect(await states()).toEqual(['false', 'true', 'false']);
    await expect(accs(page).nth(1)).toHaveCSS('background-color', 'rgb(17, 17, 17)');
    await expect(accs(page).nth(0)).toHaveCSS('background-color', 'rgb(251, 246, 238)');
    await btn(1).click();
    expect(await states()).toEqual(['false', 'false', 'false']);
    await expect(accs(page).nth(1)).toHaveCSS('background-color', 'rgb(251, 246, 238)');
  });

  test('no accordion article is inert and the slider track has no inline transform @B', async ({ page }) => {
    expect(await inertOf(accs(page))).toEqual([false, false, false]);
    expect(await inertOf(sliders(page))).toEqual([false, false, false]);
    const tf = await track(page).evaluate((el) => (el as HTMLElement).style.transform);
    expect(['', 'none']).toContain(tf);
  });

  test('open card channel hover uses ch.fg and opacity .85 (inv §10 #5) @B', async ({ page }) => {
    await accs(page).nth(0).locator('button[aria-expanded]').first().click();
    const links = accs(page).nth(0).locator('a');
    await expect(links).toHaveCount(3);
    await links.nth(0).scrollIntoViewIfNeeded();
    await links.nth(0).hover();
    await expect(links.nth(0)).toHaveCSS('color', 'rgb(17, 17, 17)');
    await expect(links.nth(0)).toHaveCSS('opacity', '0.85');
    await links.nth(1).hover();
    await expect(links.nth(1)).toHaveCSS('color', 'rgb(251, 246, 238)');
    await expect(links.nth(1)).toHaveCSS('opacity', '0.85');
  });
});

test.describe('resize 1440x900 -> 1440x700 -> 1440x900', () => {
  test('leaving scrollMode clears state, re-entering restores it @B', async ({ page }, info) => {
    test.skip(info.project.name !== 'desktop', 'desktop project only');
    await open(page);
    await expect(tabs(page)).toHaveCount(3, { timeout: 2000 });

    await scrollToP(page, 0.9);
    expect(Math.abs((await trackPercent(page)) - -200)).toBeLessThanOrEqual(1);
    expect(await inertOf(sliders(page))).toEqual([true, true, false]);

    // leave scrollMode
    await page.setViewportSize({ width: 1440, height: 700 });
    await page.evaluate(() => new Promise<void>((r) => requestAnimationFrame(() => requestAnimationFrame(() => r()))));
    await expect(accs(page).nth(0)).toBeVisible();
    expect(await inertOf(accs(page))).toEqual([false, false, false]);
    expect(await inertOf(sliders(page))).toEqual([false, false, false]); // no visible article inert, state cleared
    const tf = await track(page).evaluate((el) => (el as HTMLElement).style.transform);
    expect(['', 'none']).toContain(tf);
    const exp0 = await Promise.all([0, 1, 2].map((i) => accs(page).nth(i).locator('button[aria-expanded]').first().getAttribute('aria-expanded')));
    expect(exp0).toEqual(['false', 'false', 'false']);

    // open one in accordion mode, then bounce through scrollMode: openOffer must reset
    await accs(page).nth(1).locator('button[aria-expanded]').first().click();
    await expect(accs(page).nth(1).locator('button[aria-expanded]').first()).toHaveAttribute('aria-expanded', 'true');
    await page.setViewportSize({ width: 1440, height: 900 });
    await expect(tabs(page).first()).toBeVisible();
    await page.setViewportSize({ width: 1440, height: 700 });
    await expect(accs(page).nth(0)).toBeVisible();
    for (let i = 0; i < 3; i++) await expect(accs(page).nth(i).locator('button[aria-expanded]').first()).toHaveAttribute('aria-expanded', 'false');

    // back to scrollMode: transform restored after a scroll
    await page.setViewportSize({ width: 1440, height: 900 });
    await expect(tabs(page).first()).toBeVisible();
    await scrollToP(page, 0.9);
    expect(Math.abs((await trackPercent(page)) - -200)).toBeLessThanOrEqual(1);
    expect(await selectedIndex(page)).toBe(2);
    expect(await inertOf(sliders(page))).toEqual([true, true, false]);
  });
});

test.describe('reduced motion in scrollMode', () => {
  test('track snaps to whole slides, no smoothstep in between @B', async ({ page }, info) => {
    test.skip(info.project.name !== 'desktop', 'desktop project only');
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await open(page);
    await expect(tabs(page)).toHaveCount(3, { timeout: 2000 });
    // design.md §7: snaps at the segment midpoint (s >= .5 -> next slide)
    const cases: Array<[number, number]> = [[0.1, 0], [0.2, 1], [0.4, 1], [0.45, 1], [0.55, 2], [0.9, 2]];
    for (const [p, slide] of cases) {
      await scrollToP(page, p);
      const pct = await trackPercent(page);
      expect(Math.abs(pct - -slide * 100), `p=${p} translateX ${pct}%`).toBeLessThanOrEqual(0.5);
    }
  });
});
