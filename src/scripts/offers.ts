// Component B: offers slider (scrollMode) + accordion (otherwise). v4:L823-838, L900-911; design.md §3 rule 4, §7.
import { subscribe, requestFrame, type FrameInfo } from './lib/scroll';
import { matches, onChange, prefersReducedMotion } from './lib/media';

function init() {
  const svc = document.getElementById('services') as HTMLElement | null;
  if (!svc) return;
  const track = svc.querySelector<HTMLElement>('[data-test=offer-track]')!;
  const sliders = Array.from(svc.querySelectorAll<HTMLElement>('article[data-variant=slider]'));
  const tabs = Array.from(svc.querySelectorAll<HTMLElement>('[role=tablist] [role=tab]'));
  const bars = Array.from(svc.querySelectorAll<HTMLElement>('[data-test=offer-bar]'));
  const accs = Array.from(svc.querySelectorAll<HTMLElement>('article[data-variant=accordion]'));
  const reduce = () => prefersReducedMotion();

  let idx = 0;
  let openOffer = -1;
  let pending: { idx: number; pos: number; seg: number; s: number } | null = null;

  const renderTabs = () => {
    tabs.forEach((t, i) => {
      t.setAttribute('aria-selected', String(i === idx));
      t.tabIndex = i === idx ? 0 : -1;
    });
  };

  const renderAcc = () => {
    accs.forEach((a, i) => {
      const open = openOffer === i;
      a.dataset.open = String(open);
      a.querySelector('button[aria-expanded]')!.setAttribute('aria-expanded', String(open));
      a.querySelector<HTMLElement>('.acc-body')!.hidden = !open;
      a.querySelector('.tg')!.textContent = open ? '−' : '+';
    });
  };

  const clearScrollState = () => {
    track.style.transform = '';
    bars.forEach((b) => (b.style.width = ''));
    sliders.forEach((a) => a.removeAttribute('inert'));
    idx = 0;
    renderTabs();
  };

  subscribe({
    read(f: FrameInfo) {
      pending = null;
      if (!matches('scrollMode')) return;
      const r = svc.getBoundingClientRect();
      const total = r.height - f.vh;
      if (total <= 0) return;
      const p = Math.min(1, Math.max(0, -r.top / total));
      const seg = Math.min(2, Math.floor(p * 3));
      const s = Math.min(1, p * 3 - seg);
      const t = Math.min(1, Math.max(0, (s - 0.25) / 0.25));
      const e = t * t * (3 - 2 * t);
      const i = seg < 2 && s >= 0.5 ? seg + 1 : seg;
      const pos = reduce() ? i : seg < 2 ? seg + e : 2;
      pending = { idx: i, pos, seg, s };
    },
    write() {
      if (!pending) return;
      const { idx: i, pos, seg, s } = pending;
      track.style.transform = `translateX(${-pos * 100}%)`;
      bars.forEach((b, k) => {
        b.style.width = `${k < seg ? 100 : k === seg ? (i > seg ? 100 : s * 100) : 0}%`;
      });
      sliders.forEach((a, k) => (k === i ? a.removeAttribute('inert') : a.setAttribute('inert', '')));
      if (i !== idx) {
        idx = i;
        renderTabs();
      }
    },
  });

  const selectOffer = (i: number) => {
    if (!matches('scrollMode')) return;
    const se = document.scrollingElement || document.documentElement;
    const total = svc.offsetHeight - window.innerHeight;
    const top = svc.getBoundingClientRect().top + se.scrollTop;
    window.scrollTo({ top: top + total * (i / 3) + 4, behavior: reduce() ? 'auto' : 'smooth' });
  };

  tabs.forEach((t, i) => {
    t.addEventListener('click', () => selectOffer(i));
    t.addEventListener('keydown', (ev) => {
      const k = (ev as KeyboardEvent).key;
      if (k !== 'ArrowRight' && k !== 'ArrowLeft') return;
      ev.preventDefault();
      const n = Math.min(tabs.length - 1, Math.max(0, i + (k === 'ArrowRight' ? 1 : -1)));
      tabs.forEach((x, j) => (x.tabIndex = j === n ? 0 : -1));
      tabs[n].focus();
      selectOffer(n);
    });
  });

  accs.forEach((a, i) => {
    a.querySelector('button[aria-expanded]')!.addEventListener('click', () => {
      openOffer = openOffer === i ? -1 : i;
      renderAcc();
    });
  });

  onChange('scrollMode', (on) => {
    openOffer = -1;
    renderAcc();
    if (on) requestFrame();
    else {
      pending = null;
      clearScrollState();
    }
  });
}

init();
