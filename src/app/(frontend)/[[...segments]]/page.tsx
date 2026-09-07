import type { Metadata } from 'next'
import { draftMode } from 'next/headers'
import { notFound, permanentRedirect } from 'next/navigation'
import { RefreshRouteOnSave } from '@/components/RefreshRouteOnSave'
import { getPageBySlug, normalizeSlug } from '@/lib/content'
import { aliases, findPage, findPersona, products } from '@/site/content'
import { SitePage, LaunchPage } from '@/site/SitePage'
import { AflumaCorePage, corePageMeta, isAflumaCoreRoute } from '@/site/AflumaCorePages'
import { AflumaProductPage, isAflumaProductRoute, productPageMeta } from '@/site/AflumaProductPages'
import { AflumaPersonaPage } from '@/site/AflumaPersonaPage'
import { AflumaUtilityPage, isAflumaUtilityRoute, utilityPageMeta } from '@/site/AflumaUtilityPages'
import { legacyFlagshipAliases } from '@/site/routing'
import { absoluteUrl, structuredPage, searchTitles } from '@/site/seo'
import { CmsPage, LegalPage, hasReviewedContent, legalTitles } from '@/site/CmsPage'

export const revalidate = 300
type Props = { params: Promise<{ segments?: string[] }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { segments } = await params
  const slug = normalizeSlug(segments)
  const flagship = corePageMeta[slug] || productPageMeta[slug] || utilityPageMeta[slug]
  if (flagship) {
    return {
      title: flagship.title,
      description: flagship.description,
      alternates: { canonical: absoluteUrl(`/${slug}`) },
      twitter: { card: 'summary_large_image', title: flagship.title, description: flagship.description, images: ['/assets/brand/afluma-logo.png'] },
      openGraph: { type: 'website', siteName: 'Afluma', title: flagship.title, description: flagship.description, images: [{ url: '/assets/brand/afluma-logo.png', alt: 'Afluma' }] },
    }
  }
  const page = findPage(slug)
  const persona = findPersona(slug)
  if (slug.startsWith('launch/')) { const product = products.find((item) => slug === 'launch/' + item.slug); if (product) return { title: product.name + ' — Coming soon', description: product.description, robots: { index: false, follow: true } } }
  if (page || persona) {
    const title = searchTitles[slug] || page?.title || persona?.name || 'Afluma'
    const description = page?.description || `${persona?.role}. AI teammate at Afluma. ${persona?.mission}`
    return { title, description, alternates: { canonical: absoluteUrl(`/${slug}`) }, twitter: { card: 'summary_large_image', title, description, images: ['/assets/brand/afluma-logo.png'] }, openGraph: { type: 'website', siteName: 'Afluma', title, description, images: [{ url: '/assets/brand/afluma-logo.png', alt: 'Afluma' }] } }
  }
  if (legalTitles[slug]) return { title: legalTitles[slug], robots: { index: false, follow: true } }
  const { isEnabled } = await draftMode()
  const result = await getPageBySlug(slug, isEnabled)
  if (!result || (!isEnabled && !hasReviewedContent(result.doc))) return { title: 'Page not found', robots: { index: false, follow: true } }
  return { title: result.doc.seo?.title || result.doc.title, description: result.doc.seo?.description || result.doc.summary, robots: { index: !isEnabled && Boolean(result.doc.recommendedIndexable), follow: true } }
}

export default async function DynamicPage({ params }: Props) {
  const { segments } = await params
  const slug = normalizeSlug(segments)

  if (isAflumaCoreRoute(slug)) {
    const meta = corePageMeta[slug]
    return <><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredPage(slug, meta.title, meta.description)).replace(/</g, '\u003c') }} /><AflumaCorePage slug={slug} /></>
  }

  if (isAflumaProductRoute(slug)) {
    const meta = productPageMeta[slug]
    return <><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredPage(slug, meta.title, meta.description)).replace(/</g, '\u003c') }} /><AflumaProductPage slug={slug} /></>
  }

  if (isAflumaUtilityRoute(slug)) {
    const meta = utilityPageMeta[slug]
    return <><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredPage(slug, meta.title, meta.description)).replace(/</g, '\u003c') }} /><AflumaUtilityPage slug={slug} /></>
  }

  const persona = findPersona(slug)
  if (persona) {
    const title = persona.name
    const description = `${persona.role}. AI teammate at Afluma. ${persona.mission}`
    return <><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredPage(slug, title, description)).replace(/</g, '\u003c') }} /><AflumaPersonaPage slug={slug} /></>
  }

  if (Object.hasOwn(legacyFlagshipAliases, slug)) permanentRedirect(`/${legacyFlagshipAliases[slug]}`)
  if (Object.hasOwn(aliases, slug)) permanentRedirect(`/${aliases[slug]}`)

  const { isEnabled } = await draftMode()
  // Long-tail CMS records remain previewable without replacing the flagship public experience.
  if (isEnabled) {
    const draft = await getPageBySlug(slug, true)
    if (draft) return <><RefreshRouteOnSave /><CmsPage doc={draft.doc} /></>
  }
  const page = findPage(slug)
  if (page) return <><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredPage(slug, page.title, page.description)).replace(/</g, '\u003c') }} /><SitePage page={page} /></>
  const launchProduct = products.find((item) => slug === 'launch/' + item.slug)
  if (launchProduct) return <LaunchPage product={launchProduct} />
  if (legalTitles[slug]) {
    const result = await getPageBySlug(slug)
    return <LegalPage slug={slug} doc={result?.doc} />
  }
  const result = await getPageBySlug(slug)
  if (!result || !hasReviewedContent(result.doc)) notFound()
  return <CmsPage doc={result.doc} />
}
