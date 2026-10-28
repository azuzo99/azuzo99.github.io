// Source: v4:L537-616 (community + talk template copy), v4:L1105 (talk toggle),
// v4:L1165-1168 (communities) (verbatim; apostrophes -> ’)
// Dropped as style-only: per-card colours bg/fg/bd/bd2/muted, tgBg/tgFg.
import type { ImageMetadata } from 'astro';
import { img } from './icons';
import { links } from './site';
import claudeCommunityPhoto from '../assets/photos/claude-community-poznan.jpeg';
import awsCommunityDayPhoto from '../assets/photos/aws-community-day.webp';
import talkThumb from '../assets/media/talk-thumb.jpg';

export const communitySection = {
  num: '(04)',
  heading: 'Community.',
  /** two <span>s inside one <p> (v4:L544) */
  leadLines: [
    "Bringing Poznan’s cloud & AI builders together.",
    'Two communities, a conference and a recorded talk - the proof behind the training offer.',
  ],
} as const;

export interface Community {
  /** phone toggle key (v4 `work.c0` / `work.c1`) */
  key: 'c0' | 'c1';
  delay: string;
  icon: ImageMetadata;
  /** notPhone chip */
  role: string;
  /** phone toggle sub-line */
  hook: string;
  /** phone toggle title; notPhone h3 */
  name: string;
  photo: {
    src: ImageMetadata;
    alt: string;
    /** caption chip over the photo, with `labelIcon` */
    label: string;
    labelIcon: ImageMetadata;
    /** Claude jpeg uses object-position center 62% (inv §3 image slots) */
    position?: string;
  };
  body: string;
  /** rendered as `${label} ↗` */
  links: { label: string; href: string }[];
}

export const communities: Community[] = [
  {
    key: 'c0',
    delay: '100',
    icon: img.claude,
    role: 'Co-leader',
    hook: 'Co-leader | meetups for teams building with Claude',
    name: 'Claude Community Poznan',
    photo: {
      src: claudeCommunityPhoto,
      alt: 'Claude Community Poznan meetup group photo', // v4:L564
      label: 'Claude Community Poznan meetup',
      labelIcon: img.claude,
      position: 'center 62%',
    },
    body: 'Meetups for engineers building with Claude - agents, MCP, Claude Code in real teams.',
    links: [
      { label: 'Meetup', href: links.meetupClaude },
      { label: 'Luma', href: links.lumaClaude },
    ],
  },
  {
    key: 'c1',
    delay: '200',
    icon: img.aws,
    role: 'Co-leader',
    hook: 'Co-leader | cloud meetups + AWS Community Day',
    name: 'AWS Poznan & Poland Community',
    photo: {
      src: awsCommunityDayPhoto, // image-slot `aws-community-day` (v4:L570)
      alt: 'AWS Community Day', // v4 has no alt - added for a11y
      label: 'AWS Community Day',
      labelIcon: img.aws,
    },
    body: 'Bringing the local cloud ecosystem together to swap architecture horror stories and share cloud wins. I also co-organized AWS Community Day - a full-day conference for the Polish AWS community.',
    links: [{ label: 'Meetup', href: links.meetupAws }],
  },
];

/** Talk card (v4:L585-612). */
export const talk = {
  key: 'talk',
  /** phone toggle (v4:L587-590) */
  org: 'SysOps/DevOps Polska',
  orgLogo: img.sodo,
  orgLogoAlt: 'SysOps/DevOps Polska',
  hook: 'Speaker | DataOps and costs',
  /** video facade */
  playLabel: 'Play talk',
  duration: '51 MIN',
  /** local copy of i.ytimg.com/vi/SE4vJdIIbGM/hqdefault.jpg (480x360), grayscale in v4 */
  thumb: talkThumb,
  youtubeId: 'SE4vJdIIbGM',
  embedUrl: 'https://www.youtube-nocookie.com/embed/SE4vJdIIbGM?autoplay=1',
  iframeTitle: 'DataOps and costs: operational data challenges',
  iframeAllow: 'autoplay; encrypted-media; picture-in-picture',
  /** text */
  eyebrow: 'TALK | SYSOPS/DEVOPS POLSKA #659 | 2026',
  title: 'DataOps and costs: operational data challenges',
  body: 'Where money escapes in AWS data systems - and the architecture decisions that actually move the bill: S3 layout, file formats, Iceberg, and compute choices. It is 51 minutes of exactly what the consulting engagement looks like, for free.',
} as const;
