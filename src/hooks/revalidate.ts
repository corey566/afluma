import type { CollectionAfterChangeHook, CollectionAfterDeleteHook } from 'payload'
import { revalidatePath, revalidateTag } from 'next/cache'

const pathFor = (doc: Record<string, any>) => {
  const slug = String(doc?.slug || '').replace(/^\/+|\/+$/g, '')
  return slug ? `/${slug}` : '/'
}

export const revalidateDocument: CollectionAfterChangeHook = ({ doc, req }) => {
  if (!req.context?.skipRevalidate && doc?._status === 'published') {
    revalidatePath(pathFor(doc))
    revalidateTag('afluma-content', 'max')
  }
  return doc
}

export const revalidateDeleted: CollectionAfterDeleteHook = ({ doc }) => {
  revalidatePath(pathFor(doc))
  revalidateTag('afluma-content', 'max')
  return doc
}
