// Shared intervals from v4:L788-789. techTick: 2200 ms. archTick: 400 ms, skipped while the tab is hidden.
// Both stop under prefers-reduced-motion (design.md §7): ticks stay at 0 unless advanced by the user.
import { prefersReducedMotion, onChange } from './media';

type Listener = (tick: number) => void;

function makeTicker(ms: number, skipHidden: boolean) {
  let tick = 0;
  let timer = 0;
  let paused = false;
  const listeners = new Set<Listener>();
  const emit = () => listeners.forEach((l) => l(tick));
  const run = () => {
    if (paused || (skipHidden && document.hidden)) return;
    tick += 1;
    emit();
  };
  const start = () => {
    if (!timer && !prefersReducedMotion()) timer = window.setInterval(run, ms);
  };
  const stop = () => {
    clearInterval(timer);
    timer = 0;
  };
  onChange('reducedMotion', (reduce) => (reduce ? stop() : start()));
  return {
    get value() {
      return tick;
    },
    /** Jump to a tick (user navigation, e.g. diagram step click). */
    set(t: number) {
      tick = t;
      emit();
    },
    pause() {
      paused = true;
    },
    resume() {
      paused = false;
    },
    subscribe(l: Listener): () => void {
      listeners.add(l);
      start();
      return () => listeners.delete(l);
    },
  };
}

export const techTicker = makeTicker(2200, false);
export const archTicker = makeTicker(400, true);
