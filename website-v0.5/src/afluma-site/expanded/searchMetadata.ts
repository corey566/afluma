import type { ExpandedPage } from './content'

export type ExpandedSearchMetadata = {
  title: string
  description: string
  keywords?: string[]
  canonical: string
  robots: { index: boolean; follow: boolean }
}

const authorityIndexable = new Set([
  'home',
  'company',
  'about',
  'services',
  'services/ai-automation',
  'services/custom-software-development',
  'services/digital-product-design',
  'services/web-digital-experiences',
  'services/ecommerce-unified-commerce',
  'services/pos-retail-inventory',
  'services/managed-business-operations',
  'services/customer-experience-operations',
  'services/data-analytics-reporting',
  'services/seo-digital-growth',
  'services/cloud-integration-it-operations',
  'services/business-transformation-strategy',
  'workforce',
  'platform',
  'platform/agenticos',
  'products',
  'products/afluma-commerce',
  'products/serenops',
  'research',
  'proof',
  'proof/afluma-runs-on-afluma',
  'trust',
  'security',
  'solutions',
  'solutions/start-a-business',
  'solutions/grow-a-business',
  'solutions/operate-smarter',
  'solutions/ai-transformation',
])

const overrides: Record<string, Pick<ExpandedSearchMetadata, 'title' | 'description' | 'keywords'>> = {
  home: {
    title: 'Afluma | AI Workforce, AgenticOS & AI-Native Business Systems',
    description: 'Afluma is building a governed AI-native company operating model: persistent digital coworkers, AgenticOS, AI transformation services, Afluma Commerce and SerenOps.',
    keywords: ['AI workforce', 'agentic AI platform', 'AI company Sri Lanka', 'AI transformation', 'digital coworkers'],
  },
  workforce: {
    title: 'Afluma AI Workforce | 10 Governed Digital Coworkers',
    description: 'Meet Afluma’s ten clearly disclosed AI teammates across business development, research, architecture, design, engineering, operations, growth, security and customer success.',
    keywords: ['AI workforce', 'AI coworkers', 'digital workforce', 'AI employees', 'enterprise AI agents'],
  },
  'platform/agenticos': {
    title: 'AgenticOS | Governed AI Workforce & Agent Orchestration Platform',
    description: 'Explore Afluma AgenticOS: the operating layer for AI agent identity, memory, knowledge, model routing, tool access, workflows, approvals, handoffs and auditability.',
    keywords: ['agentic AI platform', 'AI agent orchestration', 'AI agent governance', 'AI agent memory', 'model routing'],
  },
  products: {
    title: 'Afluma Products | AgenticOS, Afluma Commerce & SerenOps',
    description: 'Explore Afluma’s AI-native product system: AgenticOS for governed digital work, Afluma Commerce for connected commerce operations and SerenOps for infrastructure intelligence.',
    keywords: ['AI-native software', 'agentic AI products', 'unified commerce platform', 'AI infrastructure operations'],
  },
  'products/afluma-commerce': {
    title: 'Afluma Commerce | Unified Commerce, POS & Inventory Platform',
    description: 'Afluma Commerce is a Sri Lanka-first, globally scalable unified-commerce platform for POS, offline Store Edge, ecommerce, inventory, orders, CRM, accounting, payroll and reporting.',
    keywords: ['unified commerce Sri Lanka', 'POS software Sri Lanka', 'inventory management Sri Lanka', 'offline POS', 'ecommerce inventory platform'],
  },
  'products/serenops': {
    title: 'SerenOps | AI-Native Infrastructure Operations by Afluma',
    description: 'SerenOps is Afluma’s infrastructure operations product direction for secure onboarding, immutable delivery, fleet visibility, Cloudflare control and bounded policy-governed AI operations.',
    keywords: ['AI infrastructure operations', 'AI DevOps', 'server fleet management', 'AI SRE', 'infrastructure automation'],
  },
  'services/ai-automation': {
    title: 'AI Automation Services | Agents, Workflows & Integrations | Afluma',
    description: 'Afluma designs governed AI assistants, agent workflows, document automation, system integrations and human-approval paths around measurable business work.',
    keywords: ['AI automation services', 'AI agent development', 'workflow automation', 'AI development company Sri Lanka'],
  },
  'services/seo-digital-growth': {
    title: 'SEO & AI Search Optimization | Search, AEO/GEO & Growth | Afluma',
    description: 'Afluma combines technical SEO, content strategy, analytics, AI-search discoverability, structured knowledge and experimentation to build qualified organic demand.',
    keywords: ['SEO Sri Lanka', 'AI search optimization', 'generative search optimization', 'technical SEO', 'AI SEO'],
  },
  research: {
    title: 'Afluma Research | AI Agents, Memory, Routing & Organizational Cognition',
    description: 'Afluma Research studies governed AI workforces, organizational cognition, agent memory, model routing, evaluation and bounded adaptive systems with evidence-first reporting.',
    keywords: ['AI agent research', 'AI agent memory', 'model routing', 'organizational cognition', 'multi-agent systems'],
  },
  trust: {
    title: 'Responsible AI & AI Agent Governance | Afluma',
    description: 'How Afluma approaches AI disclosure, human approval, permissions, evidence, auditability, privacy, security and bounded autonomy across its workforce and products.',
    keywords: ['AI agent governance', 'responsible AI', 'human in the loop AI', 'AI auditability', 'AI permissions'],
  },
}

export function normalizeExpandedSlug(slug: string) {
  const value = (slug || 'home').replace(/^\/+|\/+$/g, '')
  return value || 'home'
}

export function isAuthorityIndexable(slug: string) {
  const normalized = normalizeExpandedSlug(slug)
  if (authorityIndexable.has(normalized)) return true
  if (normalized.startsWith('workforce/')) return true
  return false
}

export function getExpandedSearchMetadata(page: ExpandedPage): ExpandedSearchMetadata {
  const slug = normalizeExpandedSlug(page.slug)
  const override = overrides[slug]
  const canonicalPath = slug === 'home' ? '/' : `/${slug}/`

  return {
    title: override?.title || `${page.title} | Afluma`,
    description: override?.description || page.lede,
    keywords: override?.keywords,
    canonical: `https://afluma.com${canonicalPath}`,
    robots: { index: isAuthorityIndexable(slug), follow: true },
  }
}
