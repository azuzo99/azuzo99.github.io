// Source: v4:L619-691 (stack template copy), v4:L1169-1184 (stack groups, W "where I used it", groups),
// v4:L1197 (exploring) (verbatim; apostrophes -> ’)
// Dropped (dead, inv §9 #3): stackTabs, stackTiles, stackFilter, group tag ('DATA'/'AI'/'SYSTEM'),
// __stack name/count/delay/flex. `where` is resolved here from v4 `W[name + '|' + gkey] || W[name]`.
import { I, type Tool } from './icons';

export const stackSection = {
  num: '(05)',
  heading: 'Main tech stack.',
  exploringLabel: 'Currently building with',
  /** group header `${count} tools` */
  toolsSuffix: ' tools',
  whereLabel: 'WHERE I USED IT',
  /** >= 860 only (v4:L688) */
  hint: 'Hover or click a tool to see where I used it',
} as const;

export const exploring: string[] = ['Chatbots', 'ASDLC', 'Semantic layers'];

export interface StackTool extends Tool {
  /** unique, DOM-safe `${group}-${slug}` (v4 used gkey + name; AWS appears in two groups) */
  id: string;
  sub: string;
  where: string;
}

export interface StackGroup {
  key: 'data' | 'ai' | 'apps';
  /** displayed label = v4 groups[gi][1] */
  label: string;
  /** String(items.length).padStart(2, '0') */
  count: string;
  /** all items; phone peek row = items.slice(0, 6) = all */
  items: StackTool[];
}

const AWS_WHERE = 'Literally everywhere - from migrations, through data platforms, up to hosting Docker apps';

export const stackGroups: StackGroup[] = [
  {
    key: 'data',
    label: 'Data',
    count: '06',
    items: [
      { ...I.snowflake, id: 'data-snowflake', sub: 'Warehouse', where: 'Revenue data models with dbt at Fandom' },
      { ...I.dbt, id: 'data-dbt', sub: 'Modelling', where: 'Warehouse modelling for ads & revenue' },
      { ...I.iceberg, id: 'data-iceberg', sub: 'Lakehouse tables', where: 'PB-scale lakehouse with versioned tables' },
      { ...I.aws, id: 'data-aws', sub: 'EMR | Glue | Batch | Redshift | Lambda', where: AWS_WHERE },
      { ...I.spark, id: 'data-spark', sub: 'Distributed compute', where: '~50 TB/day of ads data processed on EMR' },
      { ...I.airflow, id: 'data-airflow', sub: 'Orchestration', where: 'Orchestrates multiple data pipelines - from hourly ads ingestion to daily revenue models' },
    ],
  },
  {
    key: 'ai',
    label: 'AI',
    count: '06',
    items: [
      { ...I.claude, id: 'ai-claude', sub: 'API | Claude Code', where: 'Almost everywhere - the core of my AI transformation work, from plugins to agents' },
      { ...I.mcp, id: 'ai-mcp', sub: 'Model Context Protocol', where: 'Own-built MCP servers plus tool integrations for agents' },
      { ...I.agents, id: 'ai-agents', sub: 'Harnesses | swarms | plugins', where: 'Agent workflows and infrastructure at Fandom, plus my own ASDLC process' },
      { ...I.rag, id: 'ai-rag', sub: 'Retrieval', where: 'Retrieval over company knowledge' },
      { ...I.kb, id: 'ai-kb', sub: 'Semantic layers', where: 'LLM knowledge base and semantic layer (in progress)' },
      { ...I.datahub, id: 'ai-datahub', sub: 'Metadata catalog', where: 'Metadata catalog for data discovery' },
    ],
  },
  {
    key: 'apps',
    label: 'System design',
    count: '06',
    items: [
      { ...I.aws, id: 'apps-aws', sub: 'Cloud architecture', where: AWS_WHERE },
      { ...I.docker, id: 'apps-docker', sub: 'Containers', where: 'Hosting containerized apps and batch jobs on AWS' },
      { ...I.supabase, id: 'apps-supabase', sub: 'Backend | auth', where: 'MovePhysiQ backend, auth and storage' },
      { ...I.vercel, id: 'apps-vercel', sub: 'Hosting', where: 'MovePhysiQ hosting and deploys' },
      { ...I.terraform, id: 'apps-terraform', sub: 'Infrastructure as code', where: 'Infrastructure as code for data platforms' },
      { ...I.gha, id: 'apps-cicd', sub: 'Pipelines', where: 'Automated tests and deploys (Playwright E2E)' },
    ],
  },
];
