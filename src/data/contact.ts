// Source: v4:L733-773 (contact + footer template copy), v4:L913-918 (copyEmail), v4:L1198-1207 (contacts,
// emailAction, emailHint) (verbatim; apostrophes -> ’; heading number (07) -> (06), inv §10 #2)
import type { ImageMetadata } from 'astro';
import { img } from './icons';
import { links, site } from './site';

export const contactSection = {
  num: '(06)',
  heading: "Let’s talk.",
  /** notPhone (v4:L740) */
  body: '45 minutes, free, no slides. Bring your idea or challenge - an app for your business, a slow pipeline, a scary AWS bill, a team to train - and leave with a written next step, whether or not you hire me. If I am not the right person, I will say so on the call and point you to someone who is.',
  /** phone (v4:L741) */
  bodyShort: '45 minutes, free, no slides. Bring your challenge - leave with a written next step, whether or not you hire me.',
  /** one text node in v4 (L742) */
  cta: { label: 'Book a free 45-min intro ↗', href: links.calendly },
  /**
   * Low-friction second path, visually subordinate to the call. Rendered only when
   * `links.intakeForm` is set, so an unpublished form never ships a dead link.
   */
  secondary: {
    label: 'Not ready for a call?',
    text: 'Send me the problem in 2 minutes →',
    href: links.intakeForm,
    note: 'I reply to every one within two working days.',
  },
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
  { label: 'LinkedIn', icon: img.linkedin, sub: 'Consulting enquiries and company projects', href: links.linkedin },
  { label: 'Instagram', icon: img.instagram, sub: 'Small-business projects and 1:1 mentoring', href: links.instagram },
  { label: 'GitHub', icon: img.github, sub: '@azuzo99 - code and open-source work', href: links.github },
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
  tagline: 'Data engineer, cloud cost-cutter, and the person who actually builds it.',
} as const;
