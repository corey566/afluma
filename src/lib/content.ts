import config from '@payload-config'
import { getPayload } from 'payload'

export const normalizeSlug = (segments?: string[]) => (segments || []).join('/')

export async function getPageBySlug(slug: string, draft = false) {
  const payload = await getPayload({ config })
  const pageSlug = slug || 'home'
  const result = await payload.find({ collection: 'pages', draft, depth: 3, limit: 1, overrideAccess: draft, where: { slug: { equals: pageSlug } } })
  if (result.docs[0]) return { kind: 'page' as const, doc: result.docs[0] as any }
  const post = await payload.find({ collection: 'posts', draft, depth: 3, limit: 1, overrideAccess: draft, where: { slug: { equals: slug } } })
  if (post.docs[0]) return { kind: 'post' as const, doc: post.docs[0] as any }
  const product = await payload.find({ collection: 'products', draft, depth: 3, limit: 1, overrideAccess: draft, where: { slug: { equals: slug } } })
  if (product.docs[0]) return { kind: 'product' as const, doc: product.docs[0] as any }
  const caseStudy = await payload.find({ collection: 'case-studies', draft, depth: 3, limit: 1, overrideAccess: draft, where: { slug: { equals: slug } } })
  if (caseStudy.docs[0]) return { kind: 'case-study' as const, doc: caseStudy.docs[0] as any }
  const job = await payload.find({ collection: 'jobs', draft, depth: 3, limit: 1, overrideAccess: draft, where: { slug: { equals: slug } } })
  if (job.docs[0]) return { kind: 'job' as const, doc: job.docs[0] as any }
  return null
}

export async function getGlobal(slug: 'site-settings'|'header'|'footer'|'seo-settings', draft = false) {
  const payload = await getPayload({ config })
  const pageSlug = slug || 'home'
  return payload.findGlobal({ slug, draft, depth: 2, overrideAccess: draft }) as Promise<any>
}
