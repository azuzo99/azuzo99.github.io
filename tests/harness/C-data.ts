import { readFileSync } from 'node:fs';

// src/data/*.ts import image assets, which Playwright cannot load, so read the
// literal values from the source text instead of retyping them in tests.
const siteSrc = readFileSync(new URL('../../src/data/site.ts', import.meta.url), 'utf8');
const communitySrc = readFileSync(new URL('../../src/data/community.ts', import.meta.url), 'utf8');
const aboutSrc = readFileSync(new URL('../../src/data/about.ts', import.meta.url), 'utf8');

function grab(src: string, key: string): string {
  const m = src.match(new RegExp(`\\b${key}:\\s*(['"])(.*?)\\1`));
  if (!m) throw new Error(`C-data: ${key} not found`);
  return m[2];
}

/** Same idea, but anchored on a literal prefix when the key alone is not unique. */
function grabAfter(src: string, prefix: string): string {
  const i = src.indexOf(prefix);
  if (i < 0) throw new Error(`C-data: ${prefix} not found`);
  const m = src.slice(i).match(/:\s*(['"])(.*?)\1/);
  if (!m) throw new Error(`C-data: value after ${prefix} not found`);
  return m[2];
}

export const hrefs = {
  linkedin: grab(siteSrc, 'linkedin'),
  meetupClaude: grab(siteSrc, 'meetupClaude'),
  lumaClaude: grab(siteSrc, 'lumaClaude'),
  meetupAws: grab(siteSrc, 'meetupAws'),
};

export const talkData = {
  embedUrl: grab(communitySrc, 'embedUrl'),
  playLabel: grab(communitySrc, 'playLabel'),
  iframeTitle: grab(communitySrc, 'iframeTitle'),
};

export const aboutData = {
  badge: grab(aboutSrc, 'badge'),
  badgeShort: grab(aboutSrc, 'badgeShort'),
  experienceLabel: grab(aboutSrc, 'label'),
  certsLabel: grab(aboutSrc, 'certsLabel'),
  certAwsTitle: grab(aboutSrc, 'title'),
  certAwsDetail: grab(aboutSrc, 'detail'),
  speakerTitle: grabAfter(aboutSrc, "title: 'Active"),
  communitiesTitle: grabAfter(aboutSrc, "title: 'tech"),
};
