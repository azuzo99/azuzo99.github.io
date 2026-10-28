// Source: v4:L82-171 (hero template copy), v4:L980-984 (techGroups) (verbatim; apostrophes -> ’)
import { I, type Tool } from './icons';
import headshot from '../assets/photos/hero-headshot.webp';

export const hero = {
  /** h1, one <br> between the lines (v4:L90) */
  titleLines: ['Data & AI that', 'pays for itself.'],
  /** notPhone only (v4:L92) */
  specializedIn: 'Specialized in',
  /** first pill is the filled one (v4:L93-97) */
  pills: ['AI apps', 'Automations', 'Ads & revenue data', 'Cloud costs', 'Training'],
  /** v4:L109, L146 */
  intro:
    'I build the data and AI systems revenue runs on - ~50 TB a day in production. Apps and automations for small businesses, consulting for data teams, AWS and Claude training. Same engineering, scoped to fit.',
  /** image-slot `hero-headshot` (v4:L102, L122); v4 has no alt - added for a11y */
  photo: headshot,
  photoAlt: 'Adam Zuzo',

  /**
   * Segment router under the hero CTA (>= 600). Three buyers, three entry points, so a
   * visitor who is not an enterprise data team still sees themselves in the first screen.
   * All three land on #services; the offer tablist takes it from there.
   */
  segments: {
    label: 'Which one are you?',
    items: [
      { text: 'I run a small business', href: '#services', event: 'segment-smallbiz' },
      { text: 'I need a consultant', href: '#services', event: 'segment-consulting' },
      { text: 'I want training or mentoring', href: '#services', event: 'segment-training' },
    ],
  },
} as const;

export interface TechGroup {
  num: string;
  label: string;
  /** v4 key ['data','ai','apps'][gi] - only used by the dead stack filter, kept for ids */
  key: 'data' | 'ai' | 'apps';
  /** data-delay = String(gi * 120) */
  delay: string;
  items: Tool[];
}

/**
 * Hero tech-group row (notPhone). Active item = `(techTick + gi*2) % items.length` (v4:L984);
 * the label under the group number shows the active item `name`.
 */
export const techGroups: TechGroup[] = [
  { num: '01', label: 'DATA', key: 'data', delay: '0', items: [I.snowflake, I.dbt, I.iceberg, I.spark, I.airflow] },
  { num: '02', label: 'AI', key: 'ai', delay: '120', items: [I.claude, I.mcp, I.agents, I.rag, I.kb] },
  { num: '03', label: 'SYSTEM DESIGN', key: 'apps', delay: '240', items: [I.aws, I.terraform, I.docker, I.supabase, I.vercel] },
];
