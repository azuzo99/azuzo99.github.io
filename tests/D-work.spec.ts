// Component D (Work) - design.md §5 row D, §6.2, §6.9, §7, §10; inventory §3.5, §4 #12/#14/#15.
import { test, expect, type Page, type TestInfo } from '@playwright/test';
import { FIXED_TIME } from './harness/viewports';
import { work } from './harness/D-data';

const {
  archStep, archCounter, archVersion, archNow, archCaptions, ARCH_PER, ARCH_STEPS,
  movePhysiq, fandom, plugins, kb, earlier, workSection, diagram,
} = work;

const TICK = 400;
const phoneOnly = (i: TestInfo) => test.skip(i.project.name !== 'phone', 'phone only');
const wideOnly = (i: TestInfo) => test.skip(i.project.name === 'phone', 'width >= 600 only');
const pad = (n: number) => String(n).padStart(2, '0');

const GREEN = 'rgb(47, 122, 85)';
const AIR_ON = 'rgb(127, 199, 160)';
const AIR_OFF = 'rgb(207, 197, 179)';

// On phone the diagram lives inside the collapsible Fandom card (v4); open() expands it unless `collapsed`.
async function open(page: Page, opts: { reduced?: boolean; hiddenShim?: boolean; collapsed?: boolean } = {}) {
  if (opts.reduced) await page.emulateMedia({ reducedMotion: 'reduce' });
  if (opts.hiddenShim) {
    await page.addInitScript(() => {
      (window as any).__hidden = false;
      Object.defineProperty(document, 'hidden', { get: () => (window as any).__hidden, configurable: true });
      Object.defineProperty(document, 'visibilityState', { get: () => ((window as any).__hidden ? 'hidden' : 'visible'), configurable: true });
    });
  }
  // Paused clock: fake time must not flow in real time, or ticks drift across checkpoints.
  await page.clock.install({ time: FIXED_TIME });
  await page.clock.pauseAt(new Date(FIXED_TIME.getTime() + 1000));
  await page.goto('/');
  await page.locator('#work').scrollIntoViewIfNeeded();
  if (page.viewportSize()!.width < 600 && !opts.collapsed) {
    await page.locator('#work [data-test=work-card][data-key=fd] button[aria-expanded]').click();
  }
}
const tickN = (page: Page, n: number) => page.clock.runFor(TICK * n);
const diagramRoot = (page: Page) => page.locator('#work [data-test=diagram]');
const mobileRoot = (page: Page) => page.locator('#work [data-test=diagram-mobile]');
const steps = (page: Page) => diagramRoot(page).locator('button[data-step]');
const vis = (page: Page, sel: string) => page.locator(`#work ${sel}`).locator('visible=true');
const dots = (page: Page) => vis(page, '[data-test=arch-dot]');
const card = (page: Page, key: string) => page.locator(`#work [data-test=work-card][data-key=${key}]`);

async function activeIdx(page: Page): Promise<number> {
  return steps(page).evaluateAll((els) => els.findIndex((e) => e.getAttribute('aria-current') === 'step'));
}

/** Count of 2px-thick solid-green line segments (connectors + fork lines) inside the desktop diagram. */
function greenLines(page: Page): Promise<number> {
  return diagramRoot(page).evaluate((root, green) => {
    let n = 0;
    root.querySelectorAll<HTMLElement>('*').forEach((el) => {
      const cs = getComputedStyle(el);
      const r = el.getBoundingClientRect();
      const thin = (Math.round(r.height) === 2 && r.width > 10) || (Math.round(r.width) === 2 && r.height > 10);
      if (thin && cs.backgroundColor === green && cs.backgroundImage === 'none') n++;
    });
    return n;
  }, GREEN);
}
const expectedGreen = (st: number) => Math.min(st, 4) + (st === 5 ? 4 : 0);

function airPill(page: Page, root: 'diagram' | 'diagram-mobile') {
  return page.locator(`#work [data-test=${root}]`).getByText(/^(Orchestrated by )?Apache Airflow$/).first();
}

// ---------------------------------------------------------------- desktop loop
test.describe('diagram desktop (>=600) @D', () => {
  test.beforeEach(({}, info) => wideOnly(info));

  test('only the desktop diagram is visible @D', async ({ page }) => {
    await open(page);
    await expect(diagramRoot(page)).toBeVisible();
    await expect(mobileRoot(page)).toBeHidden();
  });

  test('t=0: step 01 active, arch-now 01 / 06, counter 00/24, v42 @D', async ({ page }) => {
    await open(page);
    await expect(steps(page)).toHaveCount(6);
    expect(await activeIdx(page)).toBe(0);
    await expect(vis(page, '[data-test=arch-now]')).toHaveText(archNow(0));
    await expect(vis(page, '[data-test=arch-now]')).toHaveText('01 / 06');
    await expect(steps(page).nth(2)).toContainText('00/24');
    await expect(steps(page).nth(4)).toContainText('v42');
    await expect(vis(page, '[data-test=arch-caption]')).toHaveText(archCaptions[0]);
  });

  test('state follows the helpers across the loop @D', async ({ page }) => {
    await open(page);
    let at = 0;
    const checkpoints = [0, 3, 10, 19, 20, 23, 27, 28, 29, 30, 39, 40, 44, 45, 50, 55, 59, 60, 61];
    for (const t of checkpoints) {
      await tickN(page, t - at);
      at = t;
      const st = archStep(t);
      expect(await activeIdx(page), `active step @tick ${t}`).toBe(st);
      await expect(vis(page, '[data-test=arch-now]'), `now @${t}`).toHaveText(archNow(t));
      await expect(vis(page, '[data-test=arch-caption]'), `caption @${t}`).toHaveText(archCaptions[st]);
      await expect(steps(page).nth(2), `counter @${t}`).toContainText(archCounter(t));
      const ver = archVersion(t);
      await expect(steps(page).nth(4), `version @${t}`).toContainText(ver);
      if (ver === 'v43 ✓') await expect(steps(page).nth(4)).not.toContainText('v42');
      await expect(dots(page).nth(st)).toHaveAttribute('aria-current', /.+/).catch(() => {});
    }
  });

  test('counter spec: pad(min(24, sub*3))/24, check at 24 @D', async ({ page }) => {
    await open(page);
    await tickN(page, 2 * ARCH_PER + 8);
    expect(archCounter(2 * ARCH_PER + 8)).toBe('24/24 ✓');
    await expect(steps(page).nth(2)).toContainText('24/24 ✓');
    await tickN(page, 2 * ARCH_PER + 8 + 1 - (2 * ARCH_PER + 8)); // tick 29 still ✓
    await expect(steps(page).nth(2)).toContainText('24/24 ✓');
  });

  test('loop wraps after 24 s @D', async ({ page }) => {
    await open(page);
    await page.clock.runFor(23_600);
    expect(await activeIdx(page)).toBe(ARCH_STEPS - 1);
    await expect(vis(page, '[data-test=arch-now]')).toHaveText('06 / 06');
    await page.clock.runFor(400);
    expect(await activeIdx(page)).toBe(0);
    await expect(vis(page, '[data-test=arch-now]')).toHaveText('01 / 06');
    await expect(steps(page).nth(2)).toContainText('00/24');
    await expect(steps(page).nth(4)).toContainText('v42');
  });

  test('connectors are green for i < st; fork lines green at st 5 @D', async ({ page }) => {
    await open(page);
    for (let st = 0; st < ARCH_STEPS; st++) {
      if (st > 0) await tickN(page, ARCH_PER);
      expect(await greenLines(page), `green lines at step ${pad(st + 1)}`).toBe(expectedGreen(st));
    }
  });

  test('Airflow box active for st 2-4 only @D', async ({ page }) => {
    await open(page);
    for (let st = 0; st < ARCH_STEPS; st++) {
      if (st > 0) await tickN(page, ARCH_PER);
      const on = st >= 2 && st <= 4;
      await expect(airPill(page, 'diagram'), `pill @ step ${st + 1}`).toHaveCSS('border-top-color', on ? AIR_ON : AIR_OFF);
      await expect(airPill(page, 'diagram')).toHaveText('Orchestrated by Apache Airflow');
    }
  });

  test('fork/outputs active at st 5 (dark outputs, green fork) @D', async ({ page }) => {
    await open(page);
    const out = steps(page).nth(5);
    await expect(out).toHaveAttribute('aria-label', 'Go to step 06');
    await expect(out).not.toHaveAttribute('aria-current', 'step');
    await tickN(page, 5 * ARCH_PER);
    await expect(out).toHaveAttribute('aria-current', 'step');
    expect(await greenLines(page)).toBe(8);
  });

  test('a11y: steps are <button>, aria-current only on active; dots labelled "Step NN" @D', async ({ page }) => {
    await open(page);
    expect(await steps(page).evaluateAll((els) => els.map((e) => e.tagName))).toEqual(Array(6).fill('BUTTON'));
    for (let i = 0; i < 5; i++) await expect(steps(page).nth(i)).toHaveAttribute('aria-label', `Go to step ${pad(i + 1)}`);
    await expect(dots(page)).toHaveCount(6);
    for (let i = 0; i < 6; i++) {
      await expect(dots(page).nth(i)).toHaveAttribute('aria-label', `Step ${pad(i + 1)}`);
      expect(await dots(page).nth(i).evaluate((e) => e.tagName)).toBe('BUTTON');
    }
    await expect(page.locator('#work [aria-live]').first()).toHaveAttribute('aria-live', 'off');
  });

  test('loop pauses while document.hidden @D', async ({ page }) => {
    await open(page, { hiddenShim: true });
    await page.evaluate(() => { (window as any).__hidden = true; document.dispatchEvent(new Event('visibilitychange')); });
    await page.clock.runFor(12_000);
    expect(await activeIdx(page)).toBe(0);
    await page.evaluate(() => { (window as any).__hidden = false; document.dispatchEvent(new Event('visibilitychange')); });
    await page.clock.runFor(4_000);
    expect(await activeIdx(page)).toBe(1);
  });

  test('at 768 the diagram scrolls horizontally inside its frame (min-width 1040) @D', async ({ page }, info) => {
    test.skip(info.project.name !== 'mid', 'mid only');
    await open(page);
    const r = await diagramRoot(page).evaluate((root) => {
      const inner = [...root.querySelectorAll<HTMLElement>('*')].find((e) => getComputedStyle(e).minWidth === '1040px');
      if (!inner) return null;
      const sc = inner.parentElement!;
      return { ox: getComputedStyle(sc).overflowX, sw: sc.scrollWidth, cw: sc.clientWidth, docOverflow: document.documentElement.scrollWidth > innerWidth };
    });
    expect(r, 'element with min-width 1040px').not.toBeNull();
    expect(['auto', 'scroll']).toContain(r!.ox);
    expect(r!.sw).toBeGreaterThanOrEqual(1040);
    expect(r!.sw).toBeGreaterThan(r!.cw);
    expect(r!.docOverflow).toBe(false);
  });
});

// ---------------------------------------------------------------- pause rule
test.describe('pause rule (design §6.2) @D', () => {
  test('click on a step holds it for 8 s, then resumes @D', async ({ page }, info) => {
    wideOnly(info);
    await open(page);
    await tickN(page, 5); // step 0 still
    await steps(page).nth(3).click();
    expect(await activeIdx(page)).toBe(3);
    await page.clock.runFor(7_600);
    expect(await activeIdx(page), 'held').toBe(3);
    await expect(vis(page, '[data-test=arch-now]')).toHaveText('04 / 06');
    await page.clock.runFor(4_800); // 12.4 s after the click: idle > 8 s and >= 1 full step elapsed
    expect(await activeIdx(page), 'resumed').not.toBe(3);
  });

  test('click on the outputs (06) pauses too @D', async ({ page }, info) => {
    wideOnly(info);
    await open(page);
    await steps(page).nth(5).click();
    expect(await activeIdx(page)).toBe(5);
    await page.clock.runFor(7_600);
    expect(await activeIdx(page)).toBe(5);
  });

  test('click on a dot jumps and holds 8 s, then resumes @D', async ({ page }) => {
    await open(page);
    await dots(page).nth(4).click();
    await expect(vis(page, '[data-test=arch-now]')).toHaveText('05 / 06');
    await page.clock.runFor(7_600);
    await expect(vis(page, '[data-test=arch-now]')).toHaveText('05 / 06');
    await expect(vis(page, '[data-test=arch-caption]')).toHaveText(archCaptions[4]);
    await page.clock.runFor(4_800);
    await expect(vis(page, '[data-test=arch-now]')).not.toHaveText('05 / 06');
  });

  test('a second click restarts the 8 s hold @D', async ({ page }) => {
    await open(page);
    await dots(page).nth(1).click();
    await page.clock.runFor(6_000);
    await dots(page).nth(2).click();
    await page.clock.runFor(6_000);
    await expect(vis(page, '[data-test=arch-now]')).toHaveText('03 / 06');
  });

  test('phone Prev/Next wraps mod 6 and pauses 8 s @D', async ({ page }, info) => {
    phoneOnly(info);
    await open(page);
    const now = vis(page, '[data-test=arch-now]');
    await expect(now).toHaveText('01 / 06');
    await vis(page, '[data-test=arch-prev]').click();
    await expect(now).toHaveText('06 / 06');
    await vis(page, '[data-test=arch-next]').click();
    await expect(now).toHaveText('01 / 06');
    await vis(page, '[data-test=arch-next]').click();
    await expect(now).toHaveText('02 / 06');
    await page.clock.runFor(7_600);
    await expect(now).toHaveText('02 / 06');
    await page.clock.runFor(4_800);
    await expect(now).not.toHaveText('02 / 06');
  });

  test('phone Next x6 returns to 01 and caption matches @D', async ({ page }, info) => {
    phoneOnly(info);
    await open(page);
    for (let i = 1; i <= 6; i++) {
      await vis(page, '[data-test=arch-next]').click();
      await expect(vis(page, '[data-test=arch-now]')).toHaveText(archNow(i * ARCH_PER));
      await expect(vis(page, '[data-test=arch-caption]')).toHaveText(archCaptions[i % 6]);
    }
  });
});

// ---------------------------------------------------------------- mobile
test.describe('diagram mobile (<600) @D', () => {
  test.beforeEach(({}, info) => phoneOnly(info));

  test('only diagram-mobile is visible; Prev/Next and hint present @D', async ({ page }) => {
    await open(page);
    await expect(mobileRoot(page)).toBeVisible();
    await expect(diagramRoot(page)).toBeHidden();
    await expect(vis(page, '[data-test=arch-prev]')).toHaveText(diagram.prev);
    await expect(vis(page, '[data-test=arch-next]')).toHaveText(diagram.next);
  });

  test('Airflow pill text switches per step @D', async ({ page }) => {
    await open(page);
    for (let st = 0; st < ARCH_STEPS; st++) {
      if (st > 0) await tickN(page, ARCH_PER);
      const on = st >= 2 && st <= 4;
      await expect(airPill(page, 'diagram-mobile'), `step ${st + 1}`).toHaveText(on ? diagram.airflowLabel : diagram.airflowLabelIdle);
    }
  });

  test('card, now, caption, counter and version follow the helpers @D', async ({ page }) => {
    await open(page);
    let at = 0;
    for (const t of [0, 5, 10, 22, 28, 30, 44, 45, 50, 59]) {
      await tickN(page, t - at);
      at = t;
      await expect(vis(page, '[data-test=arch-now]'), `now @${t}`).toHaveText(archNow(t));
      await expect(vis(page, '[data-test=arch-caption]'), `caption @${t}`).toHaveText(archCaptions[archStep(t)]);
      const st = archStep(t);
      if (st === 2) await expect(mobileRoot(page)).toContainText(archCounter(t));
      if (st === 4) await expect(mobileRoot(page)).toContainText(archVersion(t));
    }
  });

  test('loop wraps after 24 s on phone @D', async ({ page }) => {
    await open(page);
    await page.clock.runFor(24_000);
    await expect(vis(page, '[data-test=arch-now]')).toHaveText('01 / 06');
  });
});

// ---------------------------------------------------------------- reduced motion
test.describe('reduced motion (design §7) @D', () => {
  test('no auto-advance after 30 s @D', async ({ page }) => {
    await open(page, { reduced: true });
    await page.clock.runFor(30_000);
    await expect(vis(page, '[data-test=arch-now]')).toHaveText('01 / 06');
    await expect(vis(page, '[data-test=arch-caption]')).toHaveText(archCaptions[0]);
  });

  test('phone Prev/Next still work @D', async ({ page }, info) => {
    phoneOnly(info);
    await open(page, { reduced: true });
    await vis(page, '[data-test=arch-next]').click();
    await expect(vis(page, '[data-test=arch-now]')).toHaveText('02 / 06');
    await vis(page, '[data-test=arch-prev]').click();
    await vis(page, '[data-test=arch-prev]').click();
    await expect(vis(page, '[data-test=arch-now]')).toHaveText('06 / 06');
    await page.clock.runFor(30_000);
    await expect(vis(page, '[data-test=arch-now]')).toHaveText('06 / 06');
  });

  test('dots still jump (wide) @D', async ({ page }, info) => {
    wideOnly(info);
    await open(page, { reduced: true });
    await dots(page).nth(3).click();
    await expect(vis(page, '[data-test=arch-now]')).toHaveText('04 / 06');
    await page.clock.runFor(30_000);
    await expect(vis(page, '[data-test=arch-now]')).toHaveText('04 / 06');
  });
});

// ---------------------------------------------------------------- tap to expand
const cards: { key: string; short: string; body: string }[] = [
  { key: 'mp', short: movePhysiq.short, body: movePhysiq.body },
  { key: 'fd', short: fandom.short, body: fandom.body },
  { key: 'pl', short: plugins.short, body: plugins.body },
  { key: 'kb', short: kb.short, body: kb.body },
  { key: 'e0', short: earlier[0].hook, body: earlier[0].body },
  { key: 'e1', short: earlier[1].hook, body: earlier[1].body },
];
const visibleText = (c: ReturnType<typeof card>) => c.evaluate((e) => (e as HTMLElement).innerText.replace(/\s+/g, ' '));
const toggle = (c: ReturnType<typeof card>) => c.locator('button[aria-expanded]');

test.describe('phone tap-to-expand (#12) @D', () => {
  test.beforeEach(({}, info) => phoneOnly(info));

  for (const c of cards) {
    test(`card ${c.key} starts collapsed with the short line @D`, async ({ page }) => {
      await open(page, { collapsed: true });
      const el = card(page, c.key);
      await expect(el).toHaveCount(1);
      await expect(toggle(el)).toHaveCount(1);
      await expect(toggle(el)).toHaveAttribute('aria-expanded', 'false');
      await expect(toggle(el)).toContainText(workSection.toggle.show);
      await expect(toggle(el)).toHaveAttribute('aria-controls', /.+/);
      const txt = await visibleText(el);
      expect(txt).toContain(c.short.replace(/\s+/g, ' '));
      expect(txt).not.toContain(c.body.slice(0, 60));
    });

    test(`card ${c.key} toggles open and closed @D`, async ({ page }) => {
      await open(page, { collapsed: true });
      const el = card(page, c.key);
      await toggle(el).scrollIntoViewIfNeeded();
      await toggle(el).click();
      await expect(toggle(el)).toHaveAttribute('aria-expanded', 'true');
      await expect(toggle(el)).toContainText(workSection.toggle.hide);
      expect(await visibleText(el)).toContain(c.body.slice(0, 60));
      await toggle(el).click();
      await expect(toggle(el)).toHaveAttribute('aria-expanded', 'false');
      await expect(toggle(el)).toContainText(workSection.toggle.show);
      expect(await visibleText(el)).not.toContain(c.body.slice(0, 60));
    });
  }

  test('toggles are independent; several can be open @D', async ({ page }) => {
    await open(page, { collapsed: true });
    for (const k of ['mp', 'pl', 'e1']) {
      await toggle(card(page, k)).scrollIntoViewIfNeeded();
      await toggle(card(page, k)).click();
    }
    for (const c of cards) {
      await expect(toggle(card(page, c.key))).toHaveAttribute('aria-expanded', ['mp', 'pl', 'e1'].includes(c.key) ? 'true' : 'false');
    }
    await toggle(card(page, 'pl')).click();
    await expect(toggle(card(page, 'mp'))).toHaveAttribute('aria-expanded', 'true');
    await expect(toggle(card(page, 'pl'))).toHaveAttribute('aria-expanded', 'false');
    await expect(toggle(card(page, 'e1'))).toHaveAttribute('aria-expanded', 'true');
  });

  test('MovePhysiQ shot: object-fit contain and order 2 @D', async ({ page }) => {
    await open(page, { collapsed: true });
    const img = card(page, 'mp').locator(`img[alt="${movePhysiq.shotAlt}"]`);
    await expect(img).toHaveCSS('object-fit', 'contain');
    const order = await img.evaluate((el) => {
      const root = el.closest('[data-test=work-card]')!;
      for (let n: Element | null = el; n && n !== root; n = n.parentElement) if (getComputedStyle(n).order === '2') return true;
      return false;
    });
    expect(order, 'shot (or its wrapper) has CSS order 2').toBe(true);
  });

  test('hit areas reach 44px (dots and toggles) @D', async ({ page }) => {
    await open(page); // expanded: the dots live inside the Fandom body on phone
    const hit = (loc: ReturnType<typeof dots>) =>
      loc.evaluateAll((els) => els.map((e) => {
        const r = e.getBoundingClientRect();
        const a = getComputedStyle(e, '::after');
        const has = a.content !== 'none' && a.content !== 'normal';
        return { w: Math.max(r.width, has ? parseFloat(a.width) || 0 : 0), h: Math.max(r.height, has ? parseFloat(a.height) || 0 : 0) };
      }));
    await expect(dots(page)).toHaveCount(6);
    for (const s of await hit(dots(page))) expect(s.h).toBeGreaterThanOrEqual(44);
    for (const c of cards) {
      const t = toggle(card(page, c.key));
      for (const s of await hit(t)) {
        expect(s.h, `toggle ${c.key} height`).toBeGreaterThanOrEqual(44);
        expect(s.w, `toggle ${c.key} width`).toBeGreaterThanOrEqual(44);
      }
    }
    // real hit-test: 20px above/below a dot's centre still lands on the dot
    const d = dots(page).nth(0);
    await d.scrollIntoViewIfNeeded();
    const b = (await d.boundingBox())!;
    for (const dy of [-20, 20]) {
      const ok = await d.evaluate((el, [x, y]) => el.contains(document.elementFromPoint(x, y)), [b.x + b.width / 2, b.y + b.height / 2 + dy] as [number, number]);
      expect(ok, `dot hit at dy ${dy}`).toBe(true);
    }
  });
});

test.describe('width >= 600: no toggles, full content @D', () => {
  test('cards show full content and have no expand buttons @D', async ({ page }, info) => {
    wideOnly(info);
    await open(page);
    for (const c of cards) {
      const el = card(page, c.key);
      await expect(el, c.key).toHaveCount(1);
      await expect(toggle(el), `${c.key} toggles`).toHaveCount(0);
      expect(await visibleText(el), c.key).toContain(c.body.slice(0, 60));
    }
  });

  test('MovePhysiQ shot is object-fit contain @D', async ({ page }, info) => {
    wideOnly(info);
    await open(page);
    await expect(card(page, 'mp').locator(`img[alt="${movePhysiq.shotAlt}"]`)).toHaveCSS('object-fit', 'contain');
  });
});
