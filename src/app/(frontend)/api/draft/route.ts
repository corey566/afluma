import config from '@payload-config'
import { draftMode } from 'next/headers'
import { redirect } from 'next/navigation'
import { getPayload } from 'payload'
export async function GET(request: Request) {
  const url = new URL(request.url)
  const secret = url.searchParams.get('secret')
  const slug = String(url.searchParams.get('slug') || '').replace(/^\/+|\/+$/g, '')
  if (!process.env.PREVIEW_SECRET || secret !== process.env.PREVIEW_SECRET) return new Response('Invalid preview secret', { status: 401 })
  const payload = await getPayload({ config })
  const found = await payload.find({ collection: 'pages', draft: true, overrideAccess: true, limit: 1, where: { slug: { equals: slug } } })
  if (!found.docs.length) return new Response('Document not found', { status: 404 })
  const draft = await draftMode(); draft.enable(); redirect(slug ? `/${slug}` : '/')
}
