// One passive, rAF-throttled scroll + resize loop for the whole page (design.md §4, §8).
// Each frame runs every `read` first, then every `write`, so layout is read once before any style write.

export interface FrameInfo {
  scrollTop: number;
  maxScroll: number;
  /** 0..1 page progress (v4:L810-812). */
  progress: number;
  vw: number;
  vh: number;
}

export interface Subscriber {
  read?: (f: FrameInfo) => void;
  write?: (f: FrameInfo) => void;
}

const subs = new Set<Subscriber>();
let raf = 0;
let started = false;

function frame() {
  raf = 0;
  const se = document.scrollingElement || document.documentElement;
  const vh = window.innerHeight;
  const maxScroll = se.scrollHeight - vh;
  const scrollTop = se.scrollTop;
  const f: FrameInfo = {
    scrollTop,
    maxScroll,
    progress: maxScroll > 0 ? Math.min(1, Math.max(0, scrollTop / maxScroll)) : 0,
    vw: window.innerWidth,
    vh,
  };
  subs.forEach((s) => s.read?.(f));
  subs.forEach((s) => s.write?.(f));
}

/** Schedules a frame (used by scroll/resize and by scripts after a state change). */
export function requestFrame() {
  if (!raf) raf = requestAnimationFrame(frame);
}

export function subscribe(s: Subscriber): () => void {
  subs.add(s);
  if (!started) {
    started = true;
    window.addEventListener('scroll', requestFrame, { passive: true });
    window.addEventListener('resize', requestFrame);
  }
  requestFrame();
  return () => subs.delete(s);
}
