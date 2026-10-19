// #work behaviour (design.md §3 rule 3-4, §6.2, §7; inv §4 #12, #14, #15). Source: v4:L995-1041, L1093-1100.
import { archTicker } from './lib/ticker';
import { onChange, matches } from './lib/media';
import {
  ARCH_PER, ARCH_STEPS, archStep, archCounter, archVersion, archNow, archCaptions, diagram, workSection,
} from '../data/work';

const HOLD_MS = 8000;

function initDiagram(fig: HTMLElement) {
  const $$ = <T extends HTMLElement>(sel: string) => Array.from(fig.querySelectorAll<T>(sel));
  const now = fig.querySelector<HTMLElement>('[data-test=arch-now]')!;
  const cap = fig.querySelector<HTMLElement>('[data-test=arch-caption]')!;
  const steps = $$('[data-step]');
  const conns = $$('[data-conn]');
  const dots = $$('[data-dot]');
  const cards = $$('[data-mcard]');
  const pills = $$('[data-air-pill]');
  let last = -1;

  const render = (tick: number) => {
    const st = archStep(tick);
    fig.dataset.st = String(st);
    now.textContent = archNow(tick);
    cap.textContent = archCaptions[st];
    steps.forEach((s) => (+s.dataset.step! === st ? s.setAttribute('aria-current', 'step') : s.removeAttribute('aria-current')));
    dots.forEach((d) => (+d.dataset.dot! === st ? d.setAttribute('aria-current', 'step') : d.removeAttribute('aria-current')));
    conns.forEach((c) => {
      const i = +c.dataset.conn!;
      c.toggleAttribute('data-on', i < st);
      c.toggleAttribute('data-flow', i === st - 1);
    });
    cards.forEach((c) => (c.hidden = +c.dataset.mcard! !== st));
    const counter = archCounter(tick);
    const version = archVersion(tick);
    $$('[data-badge=counter]').forEach((b) => (b.textContent = counter));
    $$('[data-badge=version]').forEach((b) => (b.textContent = version));
    if (st !== last) {
      const air = st >= 2 && st <= 4;
      pills.forEach((p) => {
        // the phone pill swaps its text (v4 archMobAir); the desktop pill is static
        if (p.classList.contains('wk-mpill')) p.lastChild!.textContent = air ? diagram.airflowLabel : diagram.airflowLabelIdle;
      });
      last = st;
    }
  };

  let holdTimer = 0;
  /** User jump: go to `step`, pause the loop, resume after 8 s idle (design §6.2). */
  const jump = (step: number) => {
    begin();
    const i = ((step % ARCH_STEPS) + ARCH_STEPS) % ARCH_STEPS;
    archTicker.pause();
    window.clearTimeout(holdTimer);
    holdTimer = window.setTimeout(() => archTicker.resume(), HOLD_MS);
    archTicker.set(i * ARCH_PER);
  };

  steps.forEach((s) => s.addEventListener('click', () => jump(+s.dataset.step!)));
  dots.forEach((d) => d.addEventListener('click', () => jump(+d.dataset.dot!)));
  fig.querySelector('[data-test=arch-prev]')!.addEventListener('click', () => jump(archStep(archTicker.value) - 1));
  fig.querySelector('[data-test=arch-next]')!.addEventListener('click', () => jump(archStep(archTicker.value) + 1));

  // The loop starts on mount (v4); `begin` is also called by the first user jump.
  let started = false;
  const begin = () => {
    if (started) return;
    started = true;
    archTicker.subscribe(render);
  };
  render(archTicker.value);
  begin();
}

function initCards(root: HTMLElement) {
  const cards = Array.from(root.querySelectorAll<HTMLElement>('[data-test=work-card]'));
  const apply = (phone: boolean) =>
    cards.forEach((card) => {
      const slot = card.querySelector<HTMLElement>('[data-wk-slot]')!;
      if (!phone) {
        slot.replaceChildren();
        card.removeAttribute('data-open');
        return;
      }
      if (slot.firstElementChild) return;
      const ids = Array.from(card.querySelectorAll<HTMLElement>('.wk-body'), (b) => b.id).join(' ');
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'wk-toggle';
      btn.dataset.variant = slot.dataset.variant;
      btn.setAttribute('aria-expanded', 'false');
      btn.setAttribute('aria-controls', ids);
      const label = document.createElement('span');
      const icon = document.createElement('span');
      icon.className = 'wk-toggle-i';
      icon.setAttribute('aria-hidden', 'true');
      btn.append(label, icon);
      const paint = () => {
        const open = card.hasAttribute('data-open');
        btn.setAttribute('aria-expanded', String(open));
        label.textContent = open ? workSection.toggle.hide : workSection.toggle.show;
        icon.textContent = open ? '−' : '+';
      };
      btn.addEventListener('click', () => {
        card.toggleAttribute('data-open');
        paint();
      });
      paint();
      slot.append(btn);
    });
  apply(matches('phone'));
  onChange('phone', apply);
}

const root = document.getElementById('work');
if (root) {
  initCards(root);
  const fig = root.querySelector<HTMLElement>('[data-arch]');
  if (fig) initDiagram(fig);
}
