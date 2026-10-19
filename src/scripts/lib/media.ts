// Breakpoint queries mirroring the v4 resize flags (v4:L848, design.md §3).
export const Q = {
  phone: '(max-width: 599px)',
  heroMid: '(min-width: 600px) and (max-width: 939px)',
  navWide: '(min-width: 860px)',
  scrollMode: '(min-width: 900px) and (min-height: 720px)',
  desktop: '(min-width: 940px)',
  wide: '(min-width: 1340px)',
  reducedMotion: '(prefers-reduced-motion: reduce)',
} as const;

export type QueryName = keyof typeof Q;

const lists = new Map<QueryName, MediaQueryList>();

function list(name: QueryName): MediaQueryList {
  let mql = lists.get(name);
  if (!mql) {
    mql = window.matchMedia(Q[name]);
    lists.set(name, mql);
  }
  return mql;
}

export function matches(name: QueryName): boolean {
  return list(name).matches;
}

export function prefersReducedMotion(): boolean {
  return matches('reducedMotion');
}

/** Calls `cb(matches)` whenever the query flips. Returns an unsubscribe function. */
export function onChange(name: QueryName, cb: (matches: boolean) => void): () => void {
  const mql = list(name);
  const handler = (e: MediaQueryListEvent) => cb(e.matches);
  mql.addEventListener('change', handler);
  return () => mql.removeEventListener('change', handler);
}
