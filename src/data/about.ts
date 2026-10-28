// Source: v4:L256-326 (about bento), v4:L1120-1129 (certBadge, talkLbl, commLbl) (verbatim; apostrophes -> ’)
import { img } from './icons';
import { links } from './site';
import aboutPhoto from '../assets/photos/about-photo.webp';

export const about = {
  num: '(02)',
  heading: 'Why trust me.',
  /** image-slot `about-photo` (v4:L261, grayscale); v4 has no alt - added for a11y */
  photo: aboutPhoto,
  photoAlt: 'Adam Zuzo',
  location: 'Poznan / Warsaw | remote-friendly',
  /** notPhone only (`aboutLinkDisp`, v4:L268) */
  experience: { label: 'Full experience', href: links.linkedin, icon: img.linkedin },

  /** label is notPhone only (v4:L274) */
  inShortLabel: 'IN SHORT',
  inShort:
    'I work on the data that tells a business where its money comes from - then make it faster, cheaper and AI-ready. At Fandom that is ~50 TB a day. For a small business it is one app that replaces a spreadsheet. Same engineering, different size.',

  /** `value<span>unit</span>`; unit keeps its leading space (v4:L281, L285) */
  stats: [
    { value: '~50 TB', unit: ' /day', label: 'of data processed' },
    { value: '18', unit: ' people', label: 'in the academy teams I led' },
  ],

  certsLabel: 'CERTIFICATIONS',
  certAws: {
    title: 'AWS Certified Solutions Architect',
    /** notPhone only (v4:L293) */
    detail: '+ Data Analytics - Specialty',
    icon: img.aws,
    alt: 'AWS',
  },
  certClaude: {
    title: 'Claude Certified Architect',
    icon: img.claudeMuted,
    alt: 'Claude',
    /** `certBadge` (v4:L1120): notPhone vs phone */
    badge: 'EXPECTED 2026',
    badgeShort: 'EXPECTED',
  },

  speaker: {
    href: '#community',
    icon: img.mic,
    /** `talkLbl` (v4:L1128): notPhone vs phone */
    link: 'Watch the talk →',
    linkShort: '→',
    title: 'Active speaker',
    /** notPhone only (v4:L312) */
    detail: 'SysOps/DevOps Polska | AWS Community Day | community meetups',
  },

  communities: {
    href: '#community',
    icons: [img.claude, img.aws],
    /** `commLbl` (v4:L1129): notPhone vs phone */
    link: 'See community →',
    linkShort: '→',
    /** `<span>2</span>tech communities led` (v4:L319) */
    count: '2',
    title: 'tech communities co-led',
    /** notPhone only (v4:L320) */
    detail: 'Claude Community Poznan | AWS Poznan & Poland Community',
  },
} as const;
