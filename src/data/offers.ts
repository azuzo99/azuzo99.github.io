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

/**
 * Process transparency. The site publishes no prices, so the buyer needs something else
 * concrete to say yes to: what the steps are, and when the engagement ends.
 */
export interface OfferHow {
  label: string;
  steps: string[];
  ends: string;
}

/** The one objection that stops this segment from booking, answered before it is asked. */
export interface OfferObjection {
  q: string;
  a: string;
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
  /** collapsed phone accordion row: the only offer copy a phone visitor sees before tapping */
  oneLine: string;
  /** accordion toggle chip (v4 cWho) - also the tab chip (offerIndex.who) */
  cWho: string;
  /** tablist title (v4 offerIndex.title, L1077) */
  tabTitle: string;
  points: OfferPoint[];
  /** disclosure inside both card variants: process instead of a price */
  how: OfferHow;
  /** disclosure inside both card variants, under `how` */
  objection: OfferObjection;
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
    oneLine: 'One app that replaces the spreadsheets.',
    cWho: 'Small business',
    tabTitle: 'Personalized apps & automations',
    points: [
      { ...I.claude, t: 'AI-powered apps, assistants and automations' },
      { ...I.next, t: 'Web apps and client panels, installable on the phone' },
      { ...I.supabase, t: 'Backend, data and booking flows that just work' },
    ],
    how: {
      label: 'HOW IT WORKS',
      steps: [
        'Free 45-min call - we scope the problem, and I tell you if software is even the answer.',
        'Fixed-scope proposal in 3 working days: what gets built, what it needs from you, what it will not include.',
        'Build in 2-week slices. You see a working version every two weeks, not at the end.',
        'Handover: the code, the accounts and a 30-minute walkthrough are yours. No lock-in, no retainer required.',
      ],
      ends: 'The engagement ends when the thing works and you can run it without me.',
    },
    objection: {
      q: 'Is my business too small for this?',
      a: 'No. Most of what I build for small businesses is one app, one automation or one booking flow - a few weeks, not a few quarters. The enterprise numbers on this page are where the standards come from, not the minimum size.',
    },
    proof: 'MovePhysiQ - a paying physiotherapy practice running patient plans, bookings and progress in one app instead of spreadsheets. Built solo, end to end, E2E-tested.',
    channels: [
      { ...CH.cal, primary: true },
      { ...CH.ig, primary: false },
      { ...CH.li, primary: false },
    ],
  },
  {
    num: '02',
    tag: 'Companies & data teams',
    title: 'Senior data engineering, without the headcount',
    pitch: 'Senior help on the data behind your revenue - architecture, audits and hands-on delivery',
    value: 'that save you money and reduce technical debt.',
    valueCap: 'That save you money and reduce technical debt.',
    cTitle: 'Consulting',
    oneLine: 'Senior data help, with an end date.',
    cWho: 'Companies',
    tabTitle: 'Consulting with an end date',
    points: [
      { ...I.snowflake, t: 'Monetization data: ads performance & revenue analytics' },
      { ...I.s3, t: 'Cloud cost optimization across storage and compute' },
      { ...I.agents, t: 'AI improvements: agents, knowledge bases, Claude rollouts' },
    ],
    how: {
      label: 'HOW IT WORKS',
      steps: [
        'Free 45-min call - you describe the stack and the pain, I tell you where I would start.',
        'Written scope in 3 working days: the question I will answer, the access I need, the deliverable, the end date.',
        'Delivery as a fixed-length engagement or a day rate, part-time and remote, agreed up front.',
        'You get a written findings document and a prioritised plan your own team can execute - not a dependency on me.',
      ],
      ends: 'Every engagement has an end date in writing before it starts.',
    },
    objection: {
      q: 'Will you have the time?',
      a: 'I take a small number of engagements at a time, and the hours and the end date are agreed in writing before we start. If I cannot give you the time, I will say so on the call.',
    },
    proof:
      '~50 TB of ads data a day in production at Fandom, turned into self-serve revenue and ads-performance analytics the monetization teams run on | brand-safety data feeding dynamic ads | enterprise Teradata → Redshift migration validated table by table at Onwelo.',
    channels: [
      { ...CH.cal, primary: true },
      { ...CH.li, primary: false },
      { ...CH.mu, primary: false },
    ],
  },
  {
    num: '03',
    tag: 'Teams & individuals',
    title: 'Your team ships AI, not demos',
    pitch: 'I teach what I ship - real production experience',
    value: 'that gives you solid foundations and hands-on expertise.',
    valueCap: 'That gives you solid foundations and hands-on expertise.',
    cTitle: 'Training & mentoring',
    oneLine: 'Workshops and mentoring on your stack.',
    cWho: 'Teams | people',
    tabTitle: 'Training on your stack',
    points: [
      { ...I.claude, t: 'AWS + Claude workshops for engineering teams' },
      { ...I.aws, t: '1:1 mentoring for data engineers' },
      { ...I.kb, t: 'Career, architecture and certification prep' },
      { name: 'Talks', icon: img.presentation, mono: 'Tk', t: 'Speaker & panelist at meetups and conferences' },
    ],
    how: {
      label: 'HOW IT WORKS',
      steps: [
        'Free 45-min call - we agree what you or your team should be able to do afterwards.',
        'I design the material around your stack and your real data, not a generic deck.',
        'Workshops run as half-days; 1:1 mentoring runs as a fixed block of sessions, agreed up front.',
        'You keep the exercises, the notes and the recordings.',
      ],
      ends: 'Mentoring blocks end on a set date. You renew only if you want to.',
    },
    objection: {
      q: 'Will this be generic training?',
      a: 'No. Every workshop is built on your stack and your data. I teach what I ship in production, and the material stays with you.',
    },
    proof:
      'Led an 18-person academy team | mentoring engineers at Fandom | speaker at SysOps/DevOps Polska and AWS Community Day | co-leader of two tech communities.',
    channels: [
      { ...CH.cal, primary: true },
      { ...CH.ig, primary: false },
      { ...CH.li, primary: false },
    ],
  },
];

/** Section copy (v4:L179-238). */
export const offersSection = {
  num: '(01)',
  /** h2, one <br> between the lines (v4:L180) */
  headingLines: ['How I can', 'help you.'],
  lead:
    'Three ways to work together. Every one starts with the same free 45-minute call, and every one has a written scope and an end date before it starts.',
  /** accordion mode only (!scrollMode) (v4:L184) */
  tapHint: 'TAP AN OFFER TO SEE DETAILS ↓',
  /** slider mode only (v4:L198) */
  scrollHint: 'SCROLL TO EXPLORE ↓',
  tablistLabel: 'Offers',
  /** slider counter `${num} / ${total}` (v4:L222) */
  total: '03',
  proofLabel: 'PROOF',
  reachLabel: 'Best way to reach me',
  /** always-visible risk-reversal line above the disclosure */
  endsLabel: 'HOW IT ENDS',
  /** <summary> of the process disclosure inside each card */
  howSummary: 'See the process, the scope and the end date',
  objectionLabel: 'HONEST ANSWER',
} as const;
