// Source: v4:L733-773 (contact + footer template copy), v4:L913-918 (copyEmail), v4:L1198-1207 (contacts,
// emailAction, emailHint) (verbatim; apostrophes -> ’; heading number (07) -> (06), inv §10 #2)
import type { ImageMetadata } from 'astro';
import { img } from './icons';
import { links, site } from './site';

export const contactSection = {
  num: '(06)',
  heading: "Let’s talk.",
  /** notPhone (v4:L740) */
  body: '45 minutes, free, no slides. Bring your idea or challenge - an app for your business, a slow pipeline, a scary AWS bill, a team to train - and leave with a clear next step.',
  /** phone (v4:L741) */
  bodyShort: '45 minutes, free, no slides. Bring your challenge - leave with a clear next step.',
  /** one text node in v4 (L742) */
  cta: { label: 'Book a free 45-min intro ↗', href: links.calendly },
  /** notPhone row trailing arrow (v4:L758) */
  rowArrow: '↗',
} as const;

export interface ContactLink {
  label: string;
  icon: ImageMetadata;
  /** notPhone rows only */
  sub: string;
  href: string;
}

export const contacts: ContactLink[] = [
  { label: 'LinkedIn', icon: img.linkedin, sub: 'Projects, consulting, recruiting', href: links.linkedin },
  { label: 'Instagram', icon: img.instagram, sub: '1:1 mentoring & small-business projects', href: links.instagram },
  { label: 'GitHub', icon: img.github, sub: '@azuzo99', href: links.github },
];

/** Copy-email row (notPhone) / button (phone). */
export const email = {
  address: site.email,
  /** fallback when the Clipboard API is missing or rejects (v4:L916-917) */
  mailto: links.email,
  /** `emailAction` */
  action: 'Copy',
  actionDone: 'Copied ✓',
  /** `emailHint`, notPhone only */
  hint: 'Direct email',
  hintDone: 'Copied to clipboard',
  /** copied state duration (v4:L915) */
  resetMs: 2200,
} as const;

/** Footer row inside the contact card (v4:L767-770). */
export const footer = {
  copyright: '© 2026 Adam Zuzo | Poznan / Warsaw, Poland',
  /** notPhone only */
  tagline: 'One part data engineer, one part cloud cost-cutter, full-time problem solver.',
} as const;
