import fs from 'fs';
import path from 'path';
import { remark } from 'remark';
import remarkGfm from 'remark-gfm';
import remarkHtml from 'remark-html';

const CONTENT_DIR = path.join(process.cwd(), 'src', 'content');

export interface DocMeta {
  slug: string;
  title: string;
  filename: string;
  description: string;
  featured?: boolean;
}

export const DOC_REGISTRY: DocMeta[] = [
  {
    slug: 'executive-summary',
    title: 'Executive Summary',
    filename: 'executive_summary.md',
    description:
      'The opportunity, revenue model, cost roadmap, and investment overview.',
    featured: true,
  },
  {
    slug: 'market-research',
    title: 'Market Research',
    filename: 'market_research.md',
    description:
      'Go/no-go signal report — market size, advisor pain points, willingness to pay, competitive gaps.',
  },
  {
    slug: 'competitive-analysis',
    title: 'Competitive Analysis',
    filename: 'competitive_analysis.md',
    description:
      'Top 5 competitors, AI adjacencies, and remaining gaps in the market.',
  },
  {
    slug: 'requirements',
    title: 'Requirements',
    filename: 'requirements.md',
    description:
      'Functional and non-functional requirements for the platform.',
  },
  {
    slug: 'roadmap-and-risks',
    title: 'Roadmap and Risks',
    filename: 'roadmap_and_risks.md',
    description:
      'Build sequence, architecture spikes, and risk register with mitigations.',
  },
  {
    slug: 'technology-roadmap',
    title: 'Technology Roadmap',
    filename: 'technology_roadmap.md',
    description:
      'Platform architecture, data pipelines, AI systems, and privacy infrastructure.',
  },
  {
    slug: 'infrastructure-plan',
    title: 'Infrastructure Plan',
    filename: 'infrastructure_plan.md',
    description:
      'AWS architecture, service definitions, security model, cost estimates, and CI/CD.',
  },
  {
    slug: 'compliance-research',
    title: 'Compliance Research',
    filename: 'compliance_research.md',
    description:
      'SOC 2, GLBA, CCPA, ECPA, HIPAA, and data anonymization requirements.',
  },
  {
    slug: 'background-notes',
    title: 'Background Notes',
    filename: 'background_alanna_joe.md',
    description:
      'Founding partnership context, product vision, and strategic direction.',
  },
];

export function getDocBySlug(slug: string): DocMeta | undefined {
  return DOC_REGISTRY.find((d) => d.slug === slug);
}

export async function renderMarkdown(filename: string): Promise<string> {
  const filePath = path.join(CONTENT_DIR, filename);
  const raw = fs.readFileSync(filePath, 'utf-8');

  const result = await remark()
    .use(remarkGfm)
    .use(remarkHtml, { sanitize: false })
    .process(raw);

  let html = result.toString();

  html = html.replace(
    /<table>/g,
    '<div class="table-outer"><div class="table-wrap"><table>',
  );
  html = html.replace(/<\/table>/g, '</table></div></div>');

  return html;
}
