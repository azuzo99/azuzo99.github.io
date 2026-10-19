// Community: phone tap-to-expand (inv §4 #12) and the YouTube facade (#18). design.md §3 rule 4.
import { matches, onChange } from './lib/media';

const cards = Array.from(document.querySelectorAll<HTMLElement>('#community [data-collapsible]'));

function sync(card: HTMLElement): void {
  const btn = card.querySelector<HTMLButtonElement>('[data-toggle]');
  const body = card.querySelector<HTMLElement>('[data-body]');
  if (!btn || !body) return;
  if (matches('phone')) {
    const open = card.dataset.open === 'true';
    btn.setAttribute('aria-expanded', String(open));
    btn.setAttribute('aria-controls', body.id);
    const glyph = btn.querySelector('[data-glyph]');
    if (glyph) glyph.textContent = open ? '−' : '+';
  } else {
    // >= 600: always open, no toggle semantics (v4 renders no button)
    btn.removeAttribute('aria-expanded');
    btn.removeAttribute('aria-controls');
  }
}

for (const card of cards) {
  card.querySelector<HTMLButtonElement>('[data-toggle]')?.addEventListener('click', () => {
    card.dataset.open = String(card.dataset.open !== 'true');
    sync(card);
  });
  sync(card);
}
onChange('phone', () => cards.forEach(sync));

document.querySelector<HTMLButtonElement>('[data-test=video-facade]')?.addEventListener('click', (e) => {
  const facade = e.currentTarget as HTMLButtonElement;
  const frame = document.createElement('iframe');
  frame.dataset.test = 'video';
  frame.src = facade.dataset.src ?? '';
  frame.title = facade.dataset.title ?? '';
  frame.allow = facade.dataset.allow ?? '';
  frame.allowFullscreen = true;
  frame.className = 'video-frame';
  facade.replaceWith(frame);
});
