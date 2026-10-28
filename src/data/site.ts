// Source: v4:L39-79 (rail, header, menu), v4:L896-899 (chapterList, showGithub=false), v4:L955 (navIds),
// v4:L913-918 (email) (verbatim; apostrophes -> ’)
import type { ImageMetadata } from 'astro';
import { img } from './icons';

export const site = {
  name: 'Adam Zuzo',
  /** nav logo tile (v4:L57) */
  initials: 'AZ',
  /** nav subtitle default; phone shows `NN | Chapter` instead once past the intro (v4:L973) */
  role: 'Data & AI Consultant',
  email: 'zuzoadam@gmail.com',
} as const;

export const links = {
  /**
   * The event itself, not the profile page. Only one event type is active, so the profile
   * page resolves to the same booking - but it costs the visitor an extra click.
   */
  calendly: 'https://calendly.com/adam-zuzo/konsultacja-it-it-consultation-pl-en',
  /**
   * Qualifying intake form (Google Form -> Google Sheet), the low-friction path for
   * visitors who will not book a cold 45-min call. Empty string = not published yet;
   * every surface that links to it is conditional on this being non-empty.
   */
  intakeForm: '',
  linkedin: 'https://www.linkedin.com/in/adam-zuzo/',
  instagram: 'https://www.instagram.com/zuzo_adam/',
  github: 'https://github.com/azuzo99',
  email: 'mailto:zuzoadam@gmail.com',
  meetupClaude: 'https://www.meetup.com/claude_community_poznan/',
  meetupAws: 'https://www.meetup.com/pl-pl/awsugpl/',
  lumaClaude: 'https://luma.com/claude-community-poznan',
} as const;

export type ChapterId = 'top' | 'services' | 'about' | 'work' | 'community' | 'stack' | 'contact';

export interface Chapter {
  id: ChapterId;
  label: string;
  /** `pad(i)` with Activity removed (inv §10 #2) */
  num: string;
}

/** Rail, menu and nav numbering (v4:L897, `github` filtered out). */
export const chapters: Chapter[] = [
  { id: 'top', label: 'Intro', num: '00' },
  { id: 'services', label: 'Services', num: '01' },
  { id: 'about', label: 'About', num: '02' },
  { id: 'work', label: 'Work', num: '03' },
  { id: 'community', label: 'Community', num: '04' },
  { id: 'stack', label: 'Tech stack', num: '05' },
  { id: 'contact', label: 'Contact', num: '06' },
];

/** Header pill nav, shown >= 860 (v4:L955). */
export const navItems: { id: ChapterId; label: string }[] = [
  { id: 'services', label: 'Services' },
  { id: 'about', label: 'About' },
  { id: 'work', label: 'Work' },
  { id: 'community', label: 'Community' },
];

export interface SocialLink {
  label: string;
  href: string;
  icon: ImageMetadata;
}

/** Header (v4:L64-66) and hero (v4:L113-115, L132-134, L141-143) social links, in order. */
export const social: SocialLink[] = [
  { label: 'LinkedIn', href: links.linkedin, icon: img.linkedin },
  { label: 'Instagram', href: links.instagram, icon: img.instagram },
  { label: 'GitHub', href: links.github, icon: img.github },
];

/**
 * Umami Cloud website id. Cookieless, ~2 KB, works on GitHub Pages, no consent banner
 * needed in the EU. Empty string = analytics off; Base.astro renders nothing.
 */
export const analytics = { umamiWebsiteId: '' } as const;

/** Shared UI strings. */
export const ui = {
  railLabel: 'Page progress', // aside aria-label (v4:L39)
  menuLabel: 'Sections', // menu button aria-label (v4:L67)
  menuIcon: { closed: '≡', open: '×' }, // v4:L974
  bookCall: 'Free intro', // nav CTA (v4:L68) - must stay short: the header pill has no room at 390px
  bookIntro: 'Book a free 45-min intro', // hero CTAs, followed by <span>↗</span> (v4:L111, L130, L139)
  bookIntroArrow: '↗',
  forLabel: 'FOR', // audience chip prefix (offers, work)
  toggleIcon: { closed: '+', open: '−' }, // all phone/tablet toggles
} as const;
