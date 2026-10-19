import { readFileSync } from 'node:fs';
import type { ViewportName } from './viewports';

export type DesignFixture = Record<string, string | null>;

/** Design innerText per region for one viewport (written by scripts/snapshot-design.mjs). */
export function loadFixture(vp: ViewportName): DesignFixture {
  const url = new URL(`../fixtures/design-${vp}.json`, import.meta.url);
  return JSON.parse(readFileSync(url, 'utf8')) as DesignFixture;
}
