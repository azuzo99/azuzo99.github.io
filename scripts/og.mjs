// Renders public/og.png (1200x630) in the site style. Run: node scripts/og.mjs
import { chromium } from '@playwright/test';
import { readFileSync } from 'node:fs';

const font = (pkg, file) =>
  readFileSync(new URL(`../node_modules/@fontsource/${pkg}/files/${file}`, import.meta.url)).toString('base64');
const sans500 = font('schibsted-grotesk', 'schibsted-grotesk-latin-500-normal.woff2');
const sans600 = font('schibsted-grotesk', 'schibsted-grotesk-latin-600-normal.woff2');
const mono500 = font('geist-mono', 'geist-mono-latin-500-normal.woff2');

const html = `<!doctype html><html><head><style>
@font-face { font-family: S; font-weight: 500; src: url(data:font/woff2;base64,${sans500}) format('woff2'); }
@font-face { font-family: S; font-weight: 600; src: url(data:font/woff2;base64,${sans600}) format('woff2'); }
@font-face { font-family: M; font-weight: 500; src: url(data:font/woff2;base64,${mono500}) format('woff2'); }
body { margin: 0; width: 1200px; height: 630px; background: #FBF6EE; color: #111111; font-family: S, sans-serif; }
.wrap { box-sizing: border-box; height: 100%; padding: 64px 72px; display: flex; flex-direction: column; justify-content: space-between; }
.top { display: flex; align-items: center; justify-content: space-between; }
.logo { display: flex; align-items: center; gap: 14px; font-weight: 600; font-size: 28px; }
.tile { width: 56px; height: 56px; border-radius: 16px; background: #111111; color: #FBF6EE; display: grid; place-items: center; font-size: 20px; }
.pill { display: flex; align-items: center; gap: 10px; border: 1px solid #E4DACA; border-radius: 999px; padding: 10px 20px; font-size: 22px; font-weight: 500; }
.dot { width: 12px; height: 12px; border-radius: 50%; background: #2F7A55; }
h1 { margin: 0; font-size: 150px; line-height: .9; letter-spacing: -.055em; font-weight: 500; }
.foot { display: flex; justify-content: space-between; font-family: M, monospace; font-size: 22px; color: #5C5850; letter-spacing: .06em; }
.foot b { font-weight: 500; color: #111111; background: #7FC7A0; padding: 4px 12px; border-radius: 999px; }
</style></head><body><div class="wrap">
<div class="top"><div class="logo"><span class="tile">AZ</span>Adam Zuzo</div><div class="pill"><span class="dot"></span>Open to new projects</div></div>
<h1>Data &amp; AI<br>Engineer</h1>
<div class="foot"><span>APPS | CONSULTING | TRAINING</span><b>azuzo99.github.io</b></div>
</div></body></html>`;

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });
await page.setContent(html);
await page.evaluate(() => document.fonts.ready);
await page.screenshot({ path: new URL('../public/og.png', import.meta.url).pathname });
await browser.close();
console.log('wrote public/og.png');
