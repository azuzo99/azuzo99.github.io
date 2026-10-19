// Side-by-side design vs site screenshots per region and viewport -> ../compare/index.html (outside test-results,
// which Playwright wipes). Needs the design and site served: DESIGN_PORT (4400) and SITE_PORT (4321).
import { chromium } from '@playwright/test';
import { mkdirSync, writeFileSync } from 'node:fs';

const OUT = new URL('../../compare/', import.meta.url);
mkdirSync(OUT, { recursive: true });
const VPS = { phone: [390, 844], mid: [768, 1024], desktop: [1440, 900] };
const REGIONS = [
  ['header', 'header', 'header'],
  ['top', 'section[data-screen-label="00 Intro"]', 'section#top'],
  ['services', 'section[data-screen-label="01 Services"]', 'section#services'],
  ['about', 'section[data-screen-label="02 About"]', 'section#about > [data-pause]'],
  ['work', 'section[data-screen-label="03 Work"]', 'section#work > [data-pause]'],
  ['community', 'section[data-screen-label="04 Community"]', 'section#community > [data-pause]'],
  ['stack', 'section[data-screen-label="05 Stack"]', 'section#stack > [data-pause]'],
  ['trusted', 'section[data-screen-label="Trusted by"]', 'section#trusted'],
  ['contact', 'section[data-screen-label="07 Contact"]', 'section#contact'],
];
const DESIGN = `http://localhost:${process.env.DESIGN_PORT ?? 4400}/Adam%20Zuzo%20Profile%20v4.dc.html`;
const SITE = `http://localhost:${process.env.SITE_PORT ?? 4321}/`;

async function shoot(browser, url, vp, sel, file, isDesign) {
  const [width, height] = VPS[vp];
  const ctx = await browser.newContext({ viewport: { width, height }, deviceScaleFactor: 1, hasTouch: vp !== 'desktop' });
  const page = await ctx.newPage();
  await page.goto(url, { waitUntil: 'networkidle' });
  if (isDesign) await page.locator('section[data-screen-label="07 Contact"]').waitFor();
  await page.evaluate(() => document.fonts.ready);
  // Scroll the whole page once so reveal-on-scroll elements settle in both.
  for (let y = 0; y < 30000; y += height / 2) await page.evaluate((yy) => window.scrollTo(0, yy), y);
  await page.waitForTimeout(1200);
  const el = page.locator(sel).first();
  await el.scrollIntoViewIfNeeded();
  await page.waitForTimeout(1200);
  await el.screenshot({ path: new URL(file, OUT).pathname, animations: 'disabled' }).catch((e) => console.log('skip', file, e.message.split('\n')[0]));
  await ctx.close();
}

const browser = await chromium.launch();
let html = '<!doctype html><meta charset=utf-8><title>Design vs site</title><style>body{font-family:system-ui;background:#eee;margin:16px}h2{margin:32px 0 8px}.row{display:flex;gap:16px;align-items:flex-start}.row figure{margin:0;background:#fff;padding:8px}figcaption{font:12px monospace;margin-bottom:6px}img{max-width:100%;display:block}</style>';
for (const vp of Object.keys(VPS)) {
  for (const [name, d, s] of REGIONS) {
    await shoot(browser, DESIGN, vp, d, `${vp}-${name}-design.png`, true);
    await shoot(browser, SITE, vp, s, `${vp}-${name}-site.png`, false);
    html += `<h2>${vp} · ${name}</h2><div class=row><figure><figcaption>design (v4)</figcaption><img src="${vp}-${name}-design.png"></figure><figure><figcaption>site</figcaption><img src="${vp}-${name}-site.png"></figure></div>`;
    console.log('done', vp, name);
  }
}
writeFileSync(new URL('index.html', OUT), html);
await browser.close();
