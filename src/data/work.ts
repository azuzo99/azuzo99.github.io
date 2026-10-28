// Source: v4:L329-534 (work template copy), v4:L995-1041 (diagram), v4:L1093-1100 (wk* toggles),
// v4:L1147-1163 (mpFeatures, mpStack, fandomStack, earlier) (verbatim; apostrophes -> ’)
import type { ImageMetadata } from 'astro';
import { I, img, type Tool } from './icons';
import movephysiqShot from '../assets/photos/movephysiq-shot.webp';

export const workSection = {
  num: '(03)',
  heading: 'Selected work.',
  lead:
    'Six systems, from a one-person practice to ~50 TB a day. The FOR chip on each one tells you which of the three offers it belongs to.',
  /** phone (<600) tap-to-expand labels; icons in ui.toggleIcon (v4:L1098, L1163) */
  toggle: { show: 'Show details', hide: 'Hide details' },
} as const;

/** Phone toggle keys (v4 `work[id]`); doubles as the `data-key` test hook. */
export type WorkKey = 'mp' | 'fd' | 'pl' | 'kb' | 'e0' | 'e1';

export interface LabeledIcon {
  name: string;
  icon: ImageMetadata;
}

// ---------- MovePhysiQ (v4:L339-365) ----------
export const movePhysiq = {
  key: 'mp' as WorkKey,
  status: 'Paying client',
  /** notPhone only */
  category: 'AI application | HealthTech',
  audience: ['Small businesses & solo founders'],
  title: 'MovePhysiQ',
  /** phone collapsed line (`wkS.mp`) */
  short: 'Patient platform for a physiotherapy practice.',
  body: 'A premium patient platform for a physiotherapy practice, built for a paying client. One calm system replaces spreadsheets for the patient - and gives the therapist a single place to run the whole collaboration.',
  features: [
    { n: '01', t: "Training plans imported straight from the therapist’s Excel / Google Sheets" },
    { n: '02', t: 'Progress roadmap, curated knowledge library, guided onboarding' },
    { n: '03', t: 'Separate therapist and patient panels with role-based access' },
    { n: '04', t: 'Installable on the phone (PWA), Calendly booking, E2E-tested' },
  ],
  stack: [I.next, I.ts, I.supabase, I.vercel, I.playwright] as Tool[],
  /** image-slot `movephysiq-shot`, fit contain (v4:L342); v4 has no alt - added for a11y */
  shot: movephysiqShot,
  shotAlt: 'MovePhysiQ app screenshot',
} as const;

// ---------- Ads & Revenue Data Platform @ Fandom (v4:L368-501) ----------
export const fandom = {
  key: 'fd' as WorkKey,
  /** notPhone only */
  category: 'Data platform | AdTech',
  audience: ['Enterprises & consulting'],
  /** notPhone only */
  flowLabel: 'DATA FLOW ↓',
  title: 'Ads & Revenue Data Platform @ Fandom',
  /** phone collapsed line (`wkS.fd`) */
  short: 'The ads & revenue data monetization teams run on.',
  body:
    'Ads performance and revenue data at ~50 TB a day, turned into self-serve analytics the monetization teams run on: which ads earned what, where, and when. Brand-safety data feeds dynamic ads, and monitoring keeps the reporting stack healthy.',
  metrics: [
    { value: '~50 TB/day', label: 'ads & revenue data in production' },
    { value: 'Self-serve', label: 'revenue & ads analytics for monetization teams' },
    { value: 'Brand safety', label: 'data feeding dynamic ads' },
  ],
  /** v4 `fandomStack`: first chip is the AWS logo renamed "EMR" */
  stack: [{ ...I.aws, name: 'EMR' }, I.spark, I.iceberg, I.dbt, I.snowflake, I.airflow] as Tool[],
} as const;

// ---------- Data-flow diagram (v4:L381-494, L995-1041) ----------
export interface ArchStep {
  num: string;
  label: string;
  icons: ImageMetadata[];
  sub: string;
  /** 'counter' -> archCounter(tick) on step 03; 'version' -> archVersion(tick) on step 05 */
  badge?: 'counter' | 'version';
  /** step 05 shows the Glue "Data Catalog / ALWAYS IN SYNC" box */
  catalog?: boolean;
  /** connector after this step (v4 hasNext: steps 01-04; L1018-1019) */
  hasNext: boolean;
}

/** v4 `steps` (L1003-1009), split as v4 renders them: archPre = steps 01-02, archAir = 03-05. */
const archSteps: ArchStep[] = [
  { num: '01', label: 'GAM ads data', icons: [img.gam], sub: 'hourly logs', hasNext: true },
  { num: '02', label: 'Google Cloud Ads Data', icons: [img.gcloud], sub: 'export', hasNext: true },
  { num: '03', label: 'Raw data storage', icons: [img.s3], sub: 'Amazon S3', badge: 'counter', hasNext: true },
  { num: '04', label: 'Big data processing', icons: [img.spark, img.emr], sub: 'Spark on EMR', hasNext: true },
  { num: '05', label: 'Data lakehouse', icons: [img.s3, img.iceberg], sub: 'Apache Iceberg', badge: 'version', catalog: true, hasNext: false },
];

export const archPre: ArchStep[] = archSteps.slice(0, 2);
export const archAir: ArchStep[] = archSteps.slice(2, 5);

/** Step 06 desktop: one button (aria-label "Go to step 06") wrapping both outputs (v4:L1028-1031, L471). */
export const archOutputs: { num: string; label: string; icons: ImageMetadata[] }[] = [
  { num: '06a', label: 'SQL queries & analytics', icons: [img.athena] },
  { num: '06b', label: 'Revenue data models', icons: [img.snowflake, img.dbt] },
];

/** Phone card for step 06 (v4 archMob when st === 5, L1034). Steps 01-05 reuse archPre/archAir. */
export const archMobileFinal = {
  num: '06',
  label: 'Analytics & revenue models',
  sub: 'Athena | Snowflake + dbt',
  icons: [img.athena, img.snowflake, img.dbt] as ImageMetadata[],
} as const;

/** v4 `caps` (L1010-1017), one per step 01-06. */
export const archCaptions: string[] = [
  'Ad data lands every hour from Google Ad Manager.',
  'Hourly logs are exported to Google Cloud.',
  'Files are copied to S3 - the pipeline waits until all 24 hours are in.',
  'All 24 in: Airflow triggers Spark on EMR - ~50 TB a day, in parallel.',
  'Iceberg commits a new table version. Late fixes rewrite only what changed.',
  'Fresh data served to SQL analytics and revenue models in Snowflake + dbt.',
];

export const diagram = {
  title: 'HOW THE DATA FLOWS',
  /** `archHint` (v4:L1036): phone vs notPhone */
  hint: 'Click any step to jump to it',
  hintPhone: 'Tap Next to follow the data',
  airflowIcon: img.airflow,
  /** desktop box pill: always this text (v4:L431); phone pill (`archMobAir`, v4:L1035): this on steps 03-05 */
  airflowLabel: 'Orchestrated by Apache Airflow',
  /** phone pill on steps 01, 02, 06 */
  airflowLabelIdle: 'Apache Airflow',
  catalog: { icon: img.glue, title: 'Data Catalog', sub: 'ALWAYS IN SYNC' },
  /** step buttons: `Go to step ${num}`; dots: `Step ${i+1}` (v4:L403, L471, L1039) */
  stepLabelPrefix: 'Go to step ',
  dotLabelPrefix: 'Step ',
  prev: '← Previous',
  next: 'Next →',
} as const;

// Loop helpers - pure ports of v4:L996-999, L1020 and L1033.
// archTick advances every 400 ms; PER = 10 ticks per step (4 s), N = 6 steps (24 s loop).
export const ARCH_PER = 10;
export const ARCH_STEPS = 6;

/** Active step index 0-5 (v4:L996 `st`). */
export const archStep = (tick: number): number => Math.floor(tick / ARCH_PER) % ARCH_STEPS;
/** Tick within the step 0-9 (v4:L996 `sub`). */
export const archSub = (tick: number): number => tick % ARCH_PER;
/** Airflow box active for steps 03-05 (v4:L1020 `inAir`). */
export const archInAir = (tick: number): boolean => {
  const st = archStep(tick);
  return st >= 2 && st <= 4;
};

/** Step 03 badge (v4:L998): `00/24` -> `NN/24` (+ ` ✓` at 24) -> `24/24 ✓`. */
export function archCounter(tick: number): string {
  const st = archStep(tick);
  const sub = archSub(tick);
  if (st < 2) return '00/24';
  if (st === 2) return String(Math.min(24, sub * 3)).padStart(2, '0') + '/24' + (sub * 3 >= 24 ? ' ✓' : '');
  return '24/24 ✓';
}

/** Step 05 badge (v4:L999): `v42` until halfway through step 05, then `v43 ✓`. */
export function archVersion(tick: number): string {
  const st = archStep(tick);
  const sub = archSub(tick);
  return st < 4 || (st === 4 && sub < 5) ? 'v42' : 'v43 ✓';
}

/** Step indicator (v4:L1033 `archNow`), e.g. `01 / 06`. */
export const archNow = (tick: number): string => String(archStep(tick) + 1).padStart(2, '0') + ' / 06';

// ---------- Claude Plugins Marketplace / AI Knowledge Base (v4:L502-517) ----------
export interface SmallWork {
  key: WorkKey;
  category: string;
  status?: string;
  audience: string[];
  title: string;
  /** phone collapsed line (`wkS`) */
  short: string;
  /** followed by a space and <strong>{bodyStrong}</strong> */
  body: string;
  bodyStrong: string;
  tags: LabeledIcon[];
}

export const plugins: SmallWork = {
  key: 'pl',
  category: 'AI platform | Internal tooling',
  audience: ['Small businesses & solo founders', 'Enterprises & consulting'],
  title: 'Claude Plugins Marketplace @ Fandom',
  short: 'Same AI tooling and guardrails for every engineer.',
  body: 'A company-wide marketplace of Claude Code plugins - skills, hooks and MCP servers that any team installs in one command.',
  bodyStrong: 'Every engineer gets the same AI tooling and guardrails.',
  tags: [
    { name: 'Claude Code', icon: img.claude },
    { name: 'MCP', icon: img.mcp },
    { name: 'Plugins & skills', icon: img.agents },
  ],
};

export const kb: SmallWork = {
  key: 'kb',
  category: 'AI | Knowledge',
  status: 'In progress',
  audience: ['Small businesses & solo founders', 'Enterprises & consulting'],
  title: 'AI Knowledge Base @ Fandom',
  short: 'Business context, ready for AI.',
  body: 'An LLM knowledge base and semantic layer over company data, so agents and people get the same trusted answers.',
  bodyStrong: 'Business context, ready for AI.',
  tags: [
    { name: 'Claude', icon: img.claude },
    { name: 'Semantic layer', icon: img.knowledge },
    { name: 'RAG', icon: img.rag },
  ],
};

// ---------- Earlier | Onwelo (v4:L518-531, L1153-1163) ----------
export interface EarlierWork {
  key: WorkKey;
  delay: string;
  /** hard-coded on both cards in v4 (L520) */
  label: string;
  audience: string[];
  title: string;
  /** phone collapsed line (`showHook`) */
  hook: string;
  body: string;
  logos: LabeledIcon[];
}

export const earlier: EarlierWork[] = [
  {
    key: 'e0',
    delay: '0',
    label: 'Earlier | Onwelo',
    audience: ['Enterprises & consulting'],
    title: 'Teradata → Redshift migration',
    hook: 'Client warehouse moved to AWS, validated table by table.',
    body: 'Moved a client warehouse to Redshift with tuned distribution and sort keys, plus Python data-quality tooling to validate every table.',
    logos: [
      { name: 'Teradata', icon: img.teradata },
      { name: 'Informatica', icon: img.informatica },
      { name: 'AWS', icon: img.aws },
      { name: 'Redshift', icon: img.redshiftAws },
    ],
  },
  {
    key: 'e1',
    delay: '100',
    label: 'Earlier | Onwelo',
    audience: ['Enterprises & consulting'],
    title: 'Automated serverless data warehouse',
    hook: 'Serverless ETL that recovers from errors on its own.',
    body: 'Step Functions and Lambda orchestration with error-catching strategies and a lock that prevents concurrent ETL runs.',
    logos: [
      { name: 'AWS', icon: img.aws },
      { name: 'Lambda', icon: img.lambdaAws },
      { name: 'Step Functions', icon: img.stepfunctions },
    ],
  },
];
