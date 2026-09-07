import { pages, workforce } from './content'

export const siteOrigin = process.env.SEO_SITE_URL || 'https://afluma.com'
export const absoluteUrl = (path: string) => new URL(path, siteOrigin).toString()
export const searchTitles: Record<string, string> = {
  '': 'AI Workforce, AgenticOS & Intelligent Operations', workforce: 'AI Workforce & Digital Teammates',
  'platform/agenticos': 'AgenticOS — AI Workforce Operating Layer', products: 'AI Products — SerenOps, Commerce & Commander OS',
  services: 'AI, Research, Marketing & Software Development Services', about: 'About Afluma — A Human-Governed AI Company',
  work: 'Afluma Products & Development Approach', research: 'AI Research & Operating Principles',
  contact: 'Contact Afluma — Projects, Products & Partnerships', news: 'AI News & Industry Reading',
  locations: 'AI & Digital Services — Regions We Target', industries: 'AI & Digital Services by Industry',
  blog: 'AI, Automation & Digital Service Guides', careers: 'Careers & Talent Enquiries',
}
export const publicRoutes = () => [...pages.map((page) => page.slug), ...workforce.map((agent) => `workforce/${agent.slug}`)]
export const structuredPage = (slug: string, title: string, description: string) => ({
  '@context': 'https://schema.org',
  '@graph': [
    { '@type': 'Organization', '@id': absoluteUrl('/#organization'), name: 'Afluma', url: siteOrigin, logo: absoluteUrl('/assets/brand/afluma-logo.png'), description: 'Afluma is building an AI workforce connected by AgenticOS, with people in command.', areaServed: ['Australia', 'United States', 'Europe', 'Gulf', 'Asia'] },
    { '@type': 'WebSite', '@id': absoluteUrl('/#website'), name: 'Afluma', url: siteOrigin, publisher: { '@id': absoluteUrl('/#organization') } },
    { '@type': slug.startsWith('services/') ? 'Service' : 'WebPage', '@id': absoluteUrl(`/${slug}#page`), name: title, description, url: absoluteUrl(`/${slug}`), ...(slug.startsWith('services/') ? { provider: { '@id': absoluteUrl('/#organization') } } : { isPartOf: { '@id': absoluteUrl('/#website') } }) },
    ...(slug ? [{ '@type': 'BreadcrumbList', itemListElement: [{ '@type': 'ListItem', position: 1, name: 'Afluma', item: siteOrigin }, { '@type': 'ListItem', position: 2, name: title, item: absoluteUrl(`/${slug}`) }] }] : []),
  ],
})

export function productDestination(slug: string) {
  const configured = slug === 'serenops' ? process.env.SERENOPS_SITE_URL : slug === 'afluma-commerce' ? process.env.COMMERCE_SITE_URL : process.env.COMMANDER_SITE_URL
  if (configured) {
    try { const url = new URL(configured); if (url.protocol === 'https:') return url.toString() } catch { /* Keep the working local launch route until configured. */ }
  }
  return `/launch/${slug}`
}
