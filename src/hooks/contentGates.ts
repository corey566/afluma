import type { CollectionBeforeChangeHook } from 'payload'

const setNoIndex = (data: Record<string, any>) => {
  data.seo = { ...(data.seo || {}), indexing: 'noindex', includeInSitemap: false }
}

export const enforcePageGate: CollectionBeforeChangeHook = ({ data }) => {
  const approved = data?.workflow?.status === 'approved'
  const published = data?._status === 'published'
  const evidenceOK = ['not-required', 'verified'].includes(data?.workflow?.evidenceStatus)
  if (!(approved && published && evidenceOK)) setNoIndex(data)
  if (approved && !data.workflow.approvedAt) data.workflow.approvedAt = new Date().toISOString()
  return data
}

export const enforcePostGate: CollectionBeforeChangeHook = ({ data }) => {
  const sourceCount = Array.isArray(data?.sources) ? data.sources.length : 0
  const approved = data?.editorialStatus === 'approved' || data?.editorialStatus === 'published'
  const ready = approved && data?.factChecked === true && data?.originalityChecked === true && sourceCount > 0
  if (!(ready && data?._status === 'published')) setNoIndex(data)
  return data
}

export const enforceCaseStudyGate: CollectionBeforeChangeHook = ({ data }) => {
  const ready = data?.permissionStatus === 'approved' && data?.evidenceStatus === 'verified' && data?.workflow?.status === 'approved'
  if (!(ready && data?._status === 'published')) setNoIndex(data)
  return data
}
