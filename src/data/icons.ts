// Source: v4:L921-951 (I map), plus every other image v4 renders (inv §7a, §8) (verbatim; apostrophes -> ’)
// Remote icons are downloaded by scripts/fetch-assets.mjs into src/assets/logos/ (devicon pinned v2.17.0).
// Dropped (dead code only, inv §9 #3): I.anthropic, I.emr, I.glue, I.redshift, I.lambda as tools;
// emr.svg / glue.svg are still exported below as plain images for the data-flow diagram.
/// <reference types="astro/client" />
import type { ImageMetadata } from 'astro';

// remote, downloaded (src/assets/logos)
import awsLogo from '../assets/logos/amazonwebservices-original-wordmark.svg';
import playwrightLogo from '../assets/logos/playwright-original.svg';
import snowflakeLogo from '../assets/logos/snowflake.svg';
import sparkLogo from '../assets/logos/apachespark.svg';
import dockerLogo from '../assets/logos/docker.svg';
import claudeLogo from '../assets/logos/claude.svg';
import claudeMutedLogo from '../assets/logos/claude-8C857A.svg';
import mcpLogo from '../assets/logos/modelcontextprotocol.svg';
import supabaseLogo from '../assets/logos/supabase.svg';
import vercelLogo from '../assets/logos/vercel.svg';
import terraformLogo from '../assets/logos/terraform.svg';
import ghaLogo from '../assets/logos/githubactions.svg';
import nextLogo from '../assets/logos/nextdotjs.svg';
import tsLogo from '../assets/logos/typescript.svg';
import githubLogo from '../assets/logos/github-111111.svg';
import fandomLogo from '../assets/logos/fandom.svg';

// local design assets (src/assets/icons)
import dbtIcon from '../assets/icons/dbt.svg';
import icebergIcon from '../assets/icons/iceberg.png';
import datahubIcon from '../assets/icons/datahub.svg';
import agentsIcon from '../assets/icons/agents.svg';
import ragIcon from '../assets/icons/rag.svg';
import knowledgeIcon from '../assets/icons/knowledge.svg';
import airflowIcon from '../assets/icons/airflow.png';
import s3Icon from '../assets/icons/s3.svg';
import emrIcon from '../assets/icons/emr.svg';
import glueIcon from '../assets/icons/glue.svg';
import athenaIcon from '../assets/icons/athena.svg';
import gamIcon from '../assets/icons/gam.png';
import gcloudIcon from '../assets/icons/gcloud.png';
import linkedinIcon from '../assets/icons/linkedin.svg';
import instagramIcon from '../assets/icons/instagram.svg';
import calendlyIcon from '../assets/icons/calendly.svg';
import meetupIcon from '../assets/icons/meetup.svg';
import presentationIcon from '../assets/icons/presentation.svg';
import micIcon from '../assets/icons/mic.svg';
import sodoIcon from '../assets/icons/sodo.png';
import teradataIcon from '../assets/icons/teradata.svg';
import informaticaIcon from '../assets/icons/informatica.svg';
import redshiftAwsIcon from '../assets/icons/redshift-aws.svg';
import lambdaAwsIcon from '../assets/icons/lambda-aws.svg';
import stepfunctionsIcon from '../assets/icons/stepfunctions.svg';
import fanaticalIcon from '../assets/icons/fanatical.png';
import onweloIcon from '../assets/icons/onwelo.png';
import geHealthcareIcon from '../assets/icons/ge-healthcare.png';
import claudeCommunityIcon from '../assets/icons/claude-community-poznan.png';
import awsCommunityDayIcon from '../assets/icons/aws-community-day.png';

/** A tool chip: icon image with a mono-text fallback rendered underneath it (v4 `t.mono`). */
export interface Tool {
  name: string;
  icon: ImageMetadata | null;
  mono: string;
}

export type ToolKey =
  | 'snowflake' | 'dbt' | 'iceberg' | 'datahub' | 'agents' | 'rag' | 'kb' | 'aws' | 'spark'
  | 'airflow' | 'docker' | 'claude' | 'mcp' | 'supabase' | 'vercel' | 'terraform' | 'gha'
  | 'next' | 'ts' | 'playwright' | 's3';

/** v4 `I` (L923-950), rendered entries only. */
export const I: Record<ToolKey, Tool> = {
  snowflake: { name: 'Snowflake', icon: snowflakeLogo, mono: 'Sf' },
  dbt: { name: 'dbt', icon: dbtIcon, mono: 'dbt' },
  iceberg: { name: 'Iceberg', icon: icebergIcon, mono: 'Ib' },
  datahub: { name: 'DataHub', icon: datahubIcon, mono: 'Dh' },
  agents: { name: 'Agents', icon: agentsIcon, mono: 'Ag' },
  rag: { name: 'RAG', icon: ragIcon, mono: 'Rg' },
  kb: { name: 'Knowledge bases', icon: knowledgeIcon, mono: 'Kb' },
  aws: { name: 'AWS', icon: awsLogo, mono: 'aws' },
  spark: { name: 'Spark', icon: sparkLogo, mono: 'Sp' },
  airflow: { name: 'Airflow', icon: airflowIcon, mono: 'Af' },
  docker: { name: 'Docker', icon: dockerLogo, mono: 'Dk' },
  claude: { name: 'Claude', icon: claudeLogo, mono: 'Cl' },
  mcp: { name: 'MCP', icon: mcpLogo, mono: 'mcp' },
  supabase: { name: 'Supabase', icon: supabaseLogo, mono: 'Sb' },
  vercel: { name: 'Vercel', icon: vercelLogo, mono: '▲' },
  terraform: { name: 'Terraform', icon: terraformLogo, mono: 'Tf' },
  gha: { name: 'CI/CD', icon: ghaLogo, mono: 'CI' },
  next: { name: 'Next.js', icon: nextLogo, mono: 'N' },
  ts: { name: 'TypeScript', icon: tsLogo, mono: 'TS' },
  playwright: { name: 'Playwright', icon: playwrightLogo, mono: 'Pw' },
  s3: { name: 'S3', icon: s3Icon, mono: 'S3' },
};

/** Every other image v4 renders outside the `I` map, by role. */
export const img = {
  // brand / social
  aws: awsLogo,
  claude: claudeLogo,
  /** simpleicons claude/8C857A - muted Claude mark on the in-progress cert (v4:L296) */
  claudeMuted: claudeMutedLogo,
  mcp: mcpLogo,
  github: githubLogo, // simpleicons github/111111
  linkedin: linkedinIcon,
  instagram: instagramIcon,
  calendly: calendlyIcon,
  meetup: meetupIcon,
  // misc UI
  presentation: presentationIcon,
  mic: micIcon,
  agents: agentsIcon,
  knowledge: knowledgeIcon,
  rag: ragIcon,
  // data-flow diagram (v4:L997, L388, L416)
  gam: gamIcon,
  gcloud: gcloudIcon,
  s3: s3Icon,
  spark: sparkLogo,
  emr: emrIcon,
  iceberg: icebergIcon,
  athena: athenaIcon,
  snowflake: snowflakeLogo,
  dbt: dbtIcon,
  airflow: airflowIcon,
  glue: glueIcon,
  // earlier work (v4:L1157-1161)
  teradata: teradataIcon,
  informatica: informaticaIcon,
  redshiftAws: redshiftAwsIcon,
  lambdaAws: lambdaAwsIcon,
  stepfunctions: stepfunctionsIcon,
  // trusted by (v4:L1110)
  fandom: fandomLogo,
  fanatical: fanaticalIcon,
  onwelo: onweloIcon,
  geHealthcare: geHealthcareIcon,
  claudeCommunity: claudeCommunityIcon,
  awsCommunityDay: awsCommunityDayIcon,
  sodo: sodoIcon,
} satisfies Record<string, ImageMetadata>;
