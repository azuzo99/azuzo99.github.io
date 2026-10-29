// Page-level invariants that hold from the scaffold onward (design.md §4, §9, §10).
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const CHAPTERS = ['top', 'services', 'about', 'work', 'community', 'stack', 'contact'];

test('sections follow the markup contract @scaffold', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('h1')).toHaveCount(1);
  for (const id of CHAPTERS) {
    await expect(page.locator(`section#${id}`)).toHaveCount(1);
  }
  await expect(page.locator('section#trusted')).toHaveCount(1);
  for (const id of ['about', 'work', 'community', 'stack']) {
    // Exactly one child, and it carries data-pause.
    const kids = await page.locator(`section#${id} > *`).count();
    expect(kids, `#${id} children`).toBe(1);
    await expect(page.locator(`section#${id} > [data-pause]`)).toHaveCount(1);
  }
  const ids = await page.$$eval('[id]', (els) => els.map((e) => e.id));
  expect(ids.length, 'duplicate ids').toBe(new Set(ids).size);
});

// Analytics is the one deliberate third party. Everything else - fonts, icons, images -
// is self-hosted, which is what keeps the page cookieless and consent-banner-free.
const ALLOWED_HOSTS = ['cloud.umami.is'];

test('no unexpected request leaves localhost on load @scaffold', async ({ page }) => {
  const external: string[] = [];
  page.on('request', (req) => {
    const u = new URL(req.url());
    if (['localhost', '127.0.0.1', ...ALLOWED_HOSTS].includes(u.hostname)) return;
    if (u.protocol.startsWith('http')) external.push(req.url());
  });
  await page.goto('/', { waitUntil: 'networkidle' });
  await page.mouse.wheel(0, 20000);
  await page.waitForLoadState('networkidle');
  expect(external).toEqual([]);
});

test('head: SEO essentials @scaffold', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle('Adam Zuzo - Data & AI Consultant | Poznan, Warsaw, remote');
  await expect(page.locator('link[rel=canonical]')).toHaveAttribute('href', 'https://azuzo99.github.io/');
  await expect(page.locator('meta[property="og:image"]')).toHaveAttribute('content', 'https://azuzo99.github.io/og.png');
  const lds = await page.locator('script[type="application/ld+json"]').allTextContents();
  const types = lds.map((t) => JSON.parse(t)['@type']);
  expect(types).toContain('Person');
  expect(types).toContain('ProfessionalService');
});

test('axe: no serious/critical violations (color-contrast reported only) @scaffold @a11y', async ({ page }, info) => {
  await page.goto('/');
  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', ...(info.project.name === 'phone' ? ['wcag22aa'] : [])])
    .disableRules(['color-contrast'])
    .analyze();
  const bad = results.violations.filter((v) => v.impact === 'serious' || v.impact === 'critical');
  expect(bad.map((v) => `${v.id}: ${v.nodes.length}`)).toEqual([]);
});
