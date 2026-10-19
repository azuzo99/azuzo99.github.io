// Viewports used by the Playwright projects and the design fixtures (design.md §10).
export const VIEWPORTS = {
  phone: { width: 390, height: 844 },
  mid: { width: 768, height: 1024 },
  desktop: { width: 1440, height: 900 },
  'short-desktop': { width: 1440, height: 700 },
  'band-880': { width: 880, height: 800 },
  'band-920': { width: 920, height: 800 },
  'band-1200': { width: 1200, height: 900 },
} as const;

export type ViewportName = keyof typeof VIEWPORTS;

/** Projects that run the full suite; band-* only run copy + screenshots. */
export const MAIN_PROJECTS: ViewportName[] = ['phone', 'mid', 'desktop', 'short-desktop'];

/** Fixed time for page.clock so tick-driven copy is deterministic (techTick 0, archTick 0). */
export const FIXED_TIME = new Date('2026-10-19T10:00:00Z');
