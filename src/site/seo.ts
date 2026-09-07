import { pages, workforce } from './content'

export const siteOrigin = process.env.SEO_SITE_URL || 'https://afluma.com'
export const absoluteUrl = (path: string) => new URL(path, siteOrigin).toString()

export const searchTitles: Record<string, string> = {
  '': 'Afluma — AI Workforce, AgenticOS & AI-Native Products',
  workforce: 'AI Workforce & Digital Coworkers — Afluma',
  platform: 'AgenticOS Platform — Afluma',
  'platform/agenticos': 'AgenticOS — AI Workforce Operating Layer',
  products: 'Afluma Products — SerenOps, Commerce & Commander OS',
  research: 'AI Research & Operating Principles — Afluma',
  proof: 'Proof — Afluma Runs on Afluma',
  'proof/afluma-runs-on-afluma': 'Afluma Runs on Afluma — Proof',
  company: 'Company — Afluma',
  trust: 'Trust & Governance — Afluma',
  services: 'Build with Afluma — AI, Product & Workflow Engineering',
  about: 'About Afluma — A Human-Governed AI Company',
  work: 'Afluma Development & Proving Approach',
  contact: 'Contact Afluma — Projects, Products & Partnerships',
  news: 'AI News & Industry Reading',
  locations: 'Afluma — Regions & Availability',
  industries: 'Afluma — Industry Contexts',
  blog: 'Afluma Research, Automation & Product Guides',
  careers: 'Careers & Talent Enquiries — Afluma',
}

const flagshipRoutes = [
  '',
  'workforce',
  'platform/agenticos',
  'products',
  'research',
  'proof',
  'proof/afluma-runs-on-afluma',
  'company',
  'trust',
]

const legacyRedirectRoutes = new Set(['about', 'work'])

export const publicRoutes = () => Array.from(new Set([
  ...flagshipRoutes,
  ...pages.map((page) => page.slug).filter((slug) => !legacyRedirectRoutes.has(slug)),
  ...workforce.map((agent) => `workforce/${agent.slug}`),
]))

export const structuredPage = (slug: string, title: string, description: string) => ({
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      '@id': absoluteUrl('/#organization'),
      name: 'Afluma',
      url: siteOrigin,
      logo: absoluteUrl('/assets/brand/afluma-logo.png'),
      description: 'Afluma is building a human-governed AI workforce connected by AgenticOS, with focused AI-native products for real company work.',
    },
    {
      '@type': 'WebSite',
      '@id': absoluteUrl('/#website'),
      name: 'Afluma',
      url: siteOrigin,
      publisher: { '@id': absoluteUrl('/#organization') },
    },
    {
      '@type': slug.startsWith('services/') ? 'Service' : 'WebPage',
      '@id': absoluteUrl(`/${slug}#page`),
      name: title,
      description,
      url: absoluteUrl(`/${slug}`),
      ...(slug.startsWith('services/')
        ? { provider: { '@id': absoluteUrl('/#organization') } }
        : { isPartOf: { '@id': absoluteUrl('/#website') } }),
    },
    ...(slug
      ? [{
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Afluma', item: siteOrigin },
            { '@type': 'ListItem', position: 2, name: title, item: absoluteUrl(`/${slug}`) },
          ],
        }]
      : []),
  ],
})

export function productDestination(slug: string) {
  const configured = slug === 'serenops'
    ? process.env.SERENOPS_SITE_URL
    : slug === 'afluma-commerce'
      ? process.env.COMMERCE_SITE_URL
      : process.env.COMMANDER_SITE_URL

  if (configured) {
    try {
      const url = new URL(configured)
      if (url.protocol === 'https:') return url.toString()
    } catch {
      // Keep the working local launch route until a valid product URL is configured.
    }
  }

  return `/launch/${slug}`
}
