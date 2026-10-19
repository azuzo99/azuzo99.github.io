// Component A (Shell): active section, progress fills, menu, sticky-pause tops, reveal, tech ticker.
import { subscribe, type FrameInfo } from './lib/scroll';
import { matches, onChange, prefersReducedMotion } from './lib/media';
import { techTicker } from './lib/ticker';
import { chapters } from '../data/site';

const $$ = <T extends HTMLElement>(sel: string) => Array.from(document.querySelectorAll<T>(sel));

// ---- progress fills + active section (v4:L805-822) ----
const railFill = document.querySelector<HTMLElement>('[data-test=rail-fill]');
const barFill = document.querySelector<HTMLElement>('[data-test=bar-fill]');
const links = $$<HTMLAnchorElement>('[data-chapter-link]');
const navSub = document.querySelector<HTMLElement>('[data-nav-sub]');
const ids = chapters.map((c) => c.id as string);

let active = '';
let nextActive = ids[0];
let lastP = -1;

function applyActive() {
  const idx = Math.max(0, ids.indexOf(active));
  for (const a of links) {
    const id = a.dataset.chapterLink;
    if (id === active) a.setAttribute('aria-current', 'true');
    else a.removeAttribute('aria-current');
    if (ids.indexOf(id!) < idx) a.setAttribute('data-past', '');
    else a.removeAttribute('data-past');
  }
  if (navSub) {
    const c = chapters[idx];
    navSub.textContent = !matches('navWide') && idx > 0 ? `${c.num} | ${c.label}` : navSub.dataset.default ?? '';
  }
}

subscribe({
  read(f: FrameInfo) {
    const line = Math.min(f.vh * 0.4, 360);
    let cur = ids[0];
    for (const id of ids) {
      const el = document.getElementById(id);
      if (el && el.getBoundingClientRect().top <= line) cur = id;
    }
    if (f.maxScroll > 0 && f.scrollTop >= f.maxScroll - 2) cur = ids[ids.length - 1];
    nextActive = cur;
  },
  write(f: FrameInfo) {
    if (f.progress !== lastP) {
      lastP = f.progress;
      if (railFill) railFill.style.transform = `scaleY(${f.progress})`;
      if (barFill) barFill.style.transform = `scaleX(${f.progress})`;
    }
    if (nextActive !== active) {
      active = nextActive;
      applyActive();
    }
  },
});
onChange('navWide', () => applyActive());

// ---- section menu (< 860) ----
const menuBtn = document.querySelector<HTMLButtonElement>('[data-menu-btn]');
const menu = document.getElementById('menu');

function setMenu(open: boolean, refocus = false) {
  if (!menuBtn || !menu) return;
  menu.hidden = !open;
  menuBtn.setAttribute('aria-expanded', String(open));
  menuBtn.textContent = open ? menuBtn.dataset.open! : menuBtn.dataset.closed!;
  if (!open && refocus) menuBtn.focus();
}
if (menuBtn && menu) {
  menuBtn.addEventListener('click', () => setMenu(menu.hidden === true));
  menu.addEventListener('click', (e) => {
    if ((e.target as HTMLElement).closest('a')) setMenu(false);
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !menu.hidden) setMenu(false, true);
  });
  onChange('navWide', (wide) => {
    if (wide) setMenu(false);
  });
}

// ---- hero tech groups (v4:L984) ----
const groups = $$('[data-test=tech-group]');
techTicker.subscribe((tick) => {
  groups.forEach((g, gi) => {
    const chips = Array.from(g.querySelectorAll<HTMLElement>('.chip'));
    const a = (tick + gi * 2) % chips.length;
    chips.forEach((c, i) => c.toggleAttribute('data-active', i === a));
    const name = g.querySelector('[data-tech-name]');
    if (name) name.textContent = chips[a].title;
  });
});

// ---- sticky pauses: only `top` is computed here (design.md §8) ----
const pauses = $$('[data-pause]');
let vw = window.innerWidth;
let vh = window.innerHeight;
const touch = navigator.maxTouchPoints > 0 || window.matchMedia('(pointer: coarse)').matches;

function applyPauses() {
  const avail = vh - 96;
  const tops = pauses.map((c) => {
    const pb = parseFloat(getComputedStyle(c).paddingBottom) || 0;
    const content = c.offsetHeight - pb;
    return Math.round(content <= avail ? 90 + (avail - content) / 2 : vh - content - 16) + 'px';
  });
  pauses.forEach((c, i) => {
    if (c.style.top !== tops[i]) c.style.top = tops[i];
  });
}
if (pauses.length) {
  const ro = new ResizeObserver(applyPauses);
  pauses.forEach((c) => ro.observe(c));
  window.addEventListener('resize', () => {
    const nw = window.innerWidth;
    const nh = window.innerHeight;
    // mobile URL bar: height-only change under 150px is not a layout change
    if (touch && nw === vw && Math.abs(nh - vh) < 150) return;
    vw = nw;
    vh = nh;
    applyPauses();
  });
  applyPauses();
}

// ---- reveal on scroll (v4:L861-871) ----
if (!prefersReducedMotion()) {
  const ease = 'cubic-bezier(.2,.7,.2,1)';
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        const t = e.target as HTMLElement;
        t.style.opacity = '1';
        t.style.translate = '0 0';
        io.unobserve(t);
      });
    },
    { rootMargin: '0px 0px -8% 0px', threshold: 0.08 },
  );
  const items = $$('[data-reveal]').filter((el) => el.getBoundingClientRect().top >= window.innerHeight * 0.92);
  // hide without a transition first (flush), so the opacity 1 -> 0 change does not animate
  items.forEach((el) => {
    el.style.opacity = '0';
    el.style.translate = '0 32px';
  });
  void document.body.offsetHeight;
  items.forEach((el) => {
    const d = parseInt(el.getAttribute('data-delay') || '0', 10);
    el.style.transition = `opacity .9s ${ease} ${d}ms, translate .9s ${ease} ${d}ms, transform .3s ease`;
    io.observe(el);
  });
}
