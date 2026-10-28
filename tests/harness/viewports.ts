// Viewports used by the Playwright projects.
export const VIEWPORTS = {
  phone: { width: 390, height: 844 },
  mid: { width: 768, height: 1024 },
  desktop: { width: 1440, height: 900 },
  'short-desktop': { width: 1440, height: 700 },
} as const;

export type ViewportName = keyof typeof VIEWPORTS;

/** Fixed time for page.clock so tick-driven content is deterministic (techTick 0, archTick 0). */
export const FIXED_TIME = new Date('2026-10-19T10:00:00Z');
