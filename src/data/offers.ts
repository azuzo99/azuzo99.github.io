// Source: v4:L174-253 (section template copy), v4:L1048-1077 (CH, offers, offerIndex) (verbatim; apostrophes -> ’)
// Dropped as unused by the template: dark/light themes, `delay`, `flex`, `short`, `dotW`, `tgLabel`.
import type { ImageMetadata } from 'astro';
import { I, img, type Tool } from './icons';
import { links } from './site';

export interface Channel {
  label: string;
  icon: ImageMetadata;
  href: string;
  /**
   * v4 `chans(list, true)` (L1056): first channel is primary = bg #FBF6EE, fg #111111, border transparent;
   * the rest = bg transparent, fg #FBF6EE, border #3A3A3A. Hover: opacity .85, colour = own fg.
   */
  primary: boolean;
}

export interface OfferPoint extends Tool {
  t: string;
}

export interface Offer {
  /** '01' | '02' | '03'; slider shows `${num} / 03` */
  num: string;
  /** slider: FOR chip text */
  tag: string;
  /** slider: h3 */
  title: string;
  /** slider: muted pitch, followed by a space and <strong>{value}</strong> */
  pitch: string;
  value: string;
  /** accordion: `value` with first letter upper-cased (v4 valueCap, L1076) */
  valueCap: string;
  /** accordion toggle title (v4 cTitle) */
  cTitle: string;
  /** accordion toggle chip (v4 cWho) - also the tab chip (offerIndex.who) */
  cWho: string;
  /** tablist title (v4 offerIndex.title, L1077) */
  tabTitle: string;
  points: OfferPoint[];
  /** slider only, after "PROOF" */
  proof: string;
  channels: Channel[];
}

const CH = {
  cal: { label: 'Book a call', icon: img.calendly, href: links.calendly },
  li: { label: 'LinkedIn', icon: img.linkedin, href: links.linkedin },
  ig: { label: 'Instagram', icon: img.instagram, href: links.instagram },
  mu: { label: 'Meetups', icon: img.meetup, href: links.meetupClaude },
} as const;

export const offers: Offer[] = [
  {
    num: '01',
    tag: 'Small businesses & solo founders',
    title: 'Personalized apps & automations that grow your business',
    pitch: 'You run the business, I build the software it runs on - from a client portal to a personalized app -',
    value: 'saving your time and letting you scale.',
    valueCap: 'Saving your time and letting you scale.',
    cTitle: 'Apps & automations',
    cWho: 'Small business',
    tabTitle: 'Personalized apps & automations',
    points: [
      { ...I.claude, t: 'AI-powered apps, assistants and automations' },
      { ...I.next, t: 'Web apps and client panels, installable on the phone' },
      { ...I.supabase, t: 'Backend, data and booking flows that just work' },
    ],
    proof: 'MovePhysiQ - a premium patient platform for a physiotherapy practice.',
    channels: [
      { ...CH.cal, primary: true },
      { ...CH.ig, primary: false },
      { ...CH.li, primary: false },
    ],
  },
  {
    num: '02',
    tag: 'Companies & data teams',
    title: 'Consulting',
    pitch: 'Senior help on the data behind your revenue - architecture, audits and hands-on delivery',
    value: 'that save you money and reduce technical debt.',
    valueCap: 'That save you money and reduce technical debt.',
    cTitle: 'Consulting',
    cWho: 'Companies',
    tabTitle: 'Consulting',
    points: [
      { ...I.snowflake, t: 'Monetization data: ads performance & revenue analytics' },
      { ...I.s3, t: 'Cloud cost optimization across storage and compute' },
      { ...I.agents, t: 'AI improvements: agents, knowledge bases, Claude rollouts' },
    ],
    proof: "Brand-safety data for Fandom’s dynamic ads | Enterprise migration to AWS Redshift",
    channels: [
      { ...CH.li, primary: true },
      { ...CH.mu, primary: false },
      { ...CH.cal, primary: false },
    ],
  },
  {
    num: '03',
    tag: 'Teams & individuals',
    title: 'Training & mentoring',
    pitch: 'I teach what I ship - real production experience',
    value: 'that gives you solid foundations and hands-on expertise.',
    valueCap: 'That gives you solid foundations and hands-on expertise.',
    cTitle: 'Training & mentoring',
    cWho: 'Teams | people',
    tabTitle: 'Training & mentoring',
    points: [
      { ...I.claude, t: 'AWS + Claude workshops for engineering teams' },
      { ...I.aws, t: '1:1 mentoring for data engineers' },
      { ...I.kb, t: 'Career, architecture and certification prep' },
      { name: 'Talks', icon: img.presentation, mono: 'Tk', t: 'Speaker & panelist at meetups and conferences' },
    ],
    proof: 'Led 18-person academy teams | Mentoring at Fandom | SysOps/DevOps Polska | AWS Community Day',
    channels: [
      { ...CH.ig, primary: true },
      { ...CH.li, primary: false },
    ],
  },
];

/** Section copy (v4:L179-238). */
export const offersSection = {
  num: '(01)',
  /** h2, one <br> between the lines (v4:L180) */
  headingLines: ['How I can', 'help you.'],
  lead: 'Three ways to work together. Pick the one that fits.',
  /** accordion mode only (!scrollMode) (v4:L184) */
  tapHint: 'TAP AN OFFER TO SEE DETAILS ↓',
  /** slider mode only (v4:L198) */
  scrollHint: 'SCROLL TO EXPLORE ↓',
  tablistLabel: 'Offers',
  /** slider counter `${num} / ${total}` (v4:L222) */
  total: '03',
  proofLabel: 'PROOF',
  reachLabel: 'Best way to reach me',
} as const;
