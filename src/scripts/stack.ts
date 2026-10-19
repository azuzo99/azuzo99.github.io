// Stack (#stack): wide hover/pin rows, <860 accordion + pinned tools (v4:L1187-1197; design.md §3, §6.7; inv §4 #9 #11).
import { matches, onChange } from './lib/media';

const root = document.querySelector<HTMLElement>('#stack');
if (root) {
  const tools = Array.from(root.querySelectorAll<HTMLElement>('[data-test=stack-tool]'));
  let pinned: string | null = null;
  let hover: string | null = null;

  const render = () => {
    const wide = matches('navWide');
    const openId = wide ? pinned || hover : pinned;
    for (const t of tools) {
      const on = t.dataset.id === openId;
      t.toggleAttribute('data-open', on);
      t.setAttribute('aria-pressed', String(t.dataset.id === pinned));
      const mark = t.querySelector<HTMLElement>('[data-mark]');
      if (mark) mark.textContent = t.dataset.id === pinned ? '−' : '+';
    }
  };

  for (const t of tools) {
    const id = t.dataset.id!;
    t.addEventListener('click', () => {
      pinned = pinned === id ? null : id;
      render();
    });
    t.addEventListener('mouseenter', () => {
      if (!matches('navWide')) return;
      hover = id;
      render();
    });
    t.addEventListener('mouseleave', () => {
      hover = null;
      render();
    });
  }

  // Accordion groups (<860, multi-open); the buttons are detached at >= 860 by tail.ts.
  root.querySelectorAll<HTMLElement>('[data-test=stack-group]').forEach((g) => {
    const btn = g.querySelector<HTMLElement>('button[aria-expanded]');
    const sign = btn?.querySelector<HTMLElement>('[data-sign]');
    btn?.addEventListener('click', () => {
      const open = !g.hasAttribute('data-open');
      g.toggleAttribute('data-open', open);
      btn.setAttribute('aria-expanded', String(open));
      if (sign) sign.textContent = open ? '−' : '+';
    });
  });

  onChange('navWide', () => {
    hover = null;
    render();
  });
  render();
}
