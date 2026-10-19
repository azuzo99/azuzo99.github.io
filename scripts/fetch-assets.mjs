#!/usr/bin/env node
// Downloads every external image that v4 renders (docs/inventory.md §7a) into the repo,
// so the built site makes no third-party image requests at runtime.
//
// Usage: node scripts/fetch-assets.mjs [--force]
//   Idempotent: files that already exist (non-empty) are skipped unless --force is passed.
//   Node 22+, no dependencies.
//
// Not downloaded: ghchart (Activity section is hidden, inv §10 #2) and simpleicons/anthropic
// (only used by dead code, inv §9 #3).

import { mkdir, writeFile, stat } from 'node:fs/promises';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const LOGOS = join(ROOT, 'src/assets/logos');
const MEDIA = join(ROOT, 'src/assets/media');

// Pinned devicon release (v4 uses @latest). Tag v2.17.0 verified on jsDelivr.
const DEVICON = 'https://cdn.jsdelivr.net/gh/devicons/devicon@v2.17.0/icons/';

// simpleicons: [slug, hex?]. The CDN bakes the brand colour (or the given hex) into the SVG;
// the file is kept exactly as returned, because that is what the design shows.
const SIMPLE_ICONS = [
  ['claude'],
  ['claude', '8C857A'],
  ['github', '111111'],
  ['modelcontextprotocol'],
  ['snowflake'],
  ['apachespark'],
  ['docker'],
  ['supabase'],
  ['vercel'],
  ['terraform'],
  ['githubactions'],
  ['nextdotjs'],
  ['typescript'],
  ['fandom'],
];

const DEVICONS = [
  'amazonwebservices/amazonwebservices-original-wordmark.svg',
  'playwright/playwright-original.svg',
];

/** @type {{ url: string, dest: string, kind: 'svg' | 'jpg' }[]} */
const jobs = [
  ...SIMPLE_ICONS.map(([slug, hex]) => ({
    url: `https://cdn.simpleicons.org/${slug}${hex ? `/${hex}` : ''}`,
    dest: join(LOGOS, `${slug}${hex ? `-${hex}` : ''}.svg`),
    kind: /** @type {const} */ ('svg'),
  })),
  ...DEVICONS.map((p) => ({
    url: DEVICON + p,
    dest: join(LOGOS, p.split('/').pop()),
    kind: /** @type {const} */ ('svg'),
  })),
  {
    url: 'https://i.ytimg.com/vi/SE4vJdIIbGM/hqdefault.jpg',
    dest: join(MEDIA, 'talk-thumb.jpg'),
    kind: 'jpg',
  },
];

const force = process.argv.includes('--force');

async function exists(p) {
  try {
    return (await stat(p)).size > 0;
  } catch {
    return false;
  }
}

function validate(buf, kind, url) {
  if (buf.length === 0) throw new Error(`empty response: ${url}`);
  if (kind === 'svg') {
    const head = buf.subarray(0, 512).toString('utf8').trimStart();
    if (!head.startsWith('<svg')) throw new Error(`not an <svg> document: ${url}`);
  } else if (kind === 'jpg') {
    if (buf[0] !== 0xff || buf[1] !== 0xd8) throw new Error(`not a JPEG: ${url}`);
  }
}

async function fetchOne({ url, dest, kind }) {
  const rel = relative(ROOT, dest);
  if (!force && (await exists(dest))) return { rel, status: 'skip' };
  const res = await fetch(url, { headers: { 'user-agent': 'azuzo99-site fetch-assets' } });
  if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}: ${url}`);
  const buf = Buffer.from(await res.arrayBuffer());
  validate(buf, kind, url);
  await mkdir(dirname(dest), { recursive: true });
  await writeFile(dest, buf);
  return { rel, status: `ok ${buf.length} B` };
}

const results = await Promise.allSettled(jobs.map(fetchOne));
let failed = 0;
results.forEach((r, i) => {
  if (r.status === 'fulfilled') console.log(`${r.value.status.padEnd(12)} ${r.value.rel}`);
  else {
    failed++;
    console.error(`FAIL         ${relative(ROOT, jobs[i].dest)}  ${r.reason?.message ?? r.reason}`);
  }
});
console.log(`\n${jobs.length - failed}/${jobs.length} assets present${force ? ' (forced)' : ''}.`);
if (failed) process.exit(1);
