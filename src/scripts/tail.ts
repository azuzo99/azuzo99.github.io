// Tail (#trusted, #contact, shared band swapping for #stack): design.md §3, §6.5, §6.9, §7; inv §4 #16 #17 #19.
import { matches, onChange, type QueryName } from './lib/media';
import { techTicker } from './lib/ticker';

// ---- band-only markup: `data-only` elements are detached (not just hidden) outside their band, so one DOM
// serves both variants and text/image counts match the design per viewport.
const CONDS: Record<string, { q: QueryName; want: boolean }> = {
  phone: { q: 'phone', want: true },
  notphone: { q: 'phone', want: false },
  wide: { q: 'navWide', want: true },
  compact: { q: 'navWide', want: false },
  motion: { q: 'reducedMotion', want: false },
};

function initBands() {
  const items = Array.from(document.querySelectorAll<HTMLElement>('[data-only]')).map((el) => {
    const marker = document.createComment('only');
    el.before(marker);
    return { el, marker, cond: CONDS[el.dataset.only || ''] };
  });
  const apply = () => {
    for (const { el, marker, cond } of items) {
      if (!cond) continue;
      const show = matches(cond.q) === cond.want;
      if (show && !el.isConnected) marker.after(el);
      else if (!show && el.isConnected) el.remove();
    }
  };
  (['phone', 'navWide', 'reducedMotion'] as QueryName[]).forEach((q) => onChange(q, apply));
  apply();
}

// ---- trusted: phone rotates one logo per tech tick (v4:L1114)
function initRotator() {
  const root = document.querySelector<HTMLElement>('#trusted [data-rotator]');
  if (!root) return;
  const items = Array.from(root.querySelectorAll<HTMLElement>('[data-logo]'));
  const show = (t: number) => items.forEach((el, i) => (el.hidden = i !== t % items.length));
  show(techTicker.value);
  techTicker.subscribe(show);
}

// ---- contact: copy email (v4:L913-918)
function initCopy() {
  const btn = document.querySelector<HTMLElement>('#contact [data-test=copy-email]');
  if (!btn) return;
  const state = document.querySelector<HTMLElement>('#contact [data-test=copy-state]');
  const address = btn.dataset.address || '';
  const set = (done: boolean) => {
    btn.querySelectorAll<HTMLElement>('[data-action]').forEach((e) => (e.textContent = done ? e.dataset.done! : e.dataset.idle!));
    btn.querySelectorAll<HTMLElement>('[data-hint]').forEach((e) => (e.textContent = done ? e.dataset.done! : e.dataset.idle!));
    if (state) state.textContent = done ? 'Copied to clipboard' : '';
  };
  let timer = 0;
  const mailto = () => (window.location.href = `mailto:${address}`);
  const done = () => {
    set(true);
    clearTimeout(timer);
    timer = window.setTimeout(() => set(false), Number(btn.dataset.reset) || 2200);
  };
  btn.addEventListener('click', () => {
    if (navigator.clipboard) navigator.clipboard.writeText(address).then(done, mailto);
    else mailto();
  });
}

initBands();
initRotator();
initCopy();
