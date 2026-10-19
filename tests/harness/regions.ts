// Comparable regions: design selector -> site selector, plus the owning component (design.md §5).
export interface Region {
  name: string;
  owner: 'A' | 'B' | 'C' | 'D' | 'E';
  design: string;
  site: string;
  /** Only present at some widths (e.g. the rail at >= 1340). */
  minWidth?: number;
}

export const REGIONS: Region[] = [
  { name: 'rail', owner: 'A', design: 'aside[aria-label="Page progress"]', site: 'aside[aria-label="Page progress"]', minWidth: 1340 },
  { name: 'header', owner: 'A', design: 'header', site: 'header' },
  { name: 'top', owner: 'A', design: 'section[data-screen-label="00 Intro"]', site: 'section#top' },
  { name: 'services', owner: 'B', design: 'section[data-screen-label="01 Services"]', site: 'section#services' },
  { name: 'about', owner: 'C', design: 'section[data-screen-label="02 About"]', site: 'section#about' },
  { name: 'work', owner: 'D', design: 'section[data-screen-label="03 Work"]', site: 'section#work' },
  { name: 'community', owner: 'C', design: 'section[data-screen-label="04 Community"]', site: 'section#community' },
  { name: 'stack', owner: 'E', design: 'section[data-screen-label="05 Stack"]', site: 'section#stack' },
  { name: 'trusted', owner: 'E', design: 'section[data-screen-label="Trusted by"]', site: 'section#trusted' },
  { name: 'contact', owner: 'E', design: 'section[data-screen-label="07 Contact"]', site: 'section#contact' },
];
