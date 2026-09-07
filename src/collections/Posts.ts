import type { CollectionConfig } from 'payload'
import { allBlocks } from '@/blocks'
import { contentTeam, editors, publishedOrAuthenticated, reviewers } from '@/access'
import { seoFields } from '@/fields/seo'
import { enforcePostGate } from '@/hooks/contentGates'
import { revalidateDeleted, revalidateDocument } from '@/hooks/revalidate'

const serverURL = process.env.SERVER_URL || 'http://localhost:3000'
export const Posts: CollectionConfig = {
  slug: 'posts', versions: { drafts: { autosave: { interval: 1200, showSaveDraftButton: true }, schedulePublish: true }, maxPerDoc: 100 }, trash: true,
  admin: { useAsTitle: 'title', group: 'Insights', defaultColumns: ['articleId','title','pillar','editorialStatus','_status','updatedAt'], preview: (doc) => `${serverURL}/api/draft?secret=${process.env.PREVIEW_SECRET || ''}&slug=${encodeURIComponent(String(doc.slug || ''))}` },
  access: { read: publishedOrAuthenticated, create: contentTeam, update: contentTeam, delete: editors, readVersions: reviewers },
  hooks: { beforeChange: [enforcePostGate], afterChange: [revalidateDocument], afterDelete: [revalidateDeleted] },
  fields: [
    { name: 'articleId', type: 'text', unique: true, index: true }, { name: 'title', type: 'text', required: true }, { name: 'slug', type: 'text', required: true, unique: true, index: true },
    { name: 'pillar', type: 'text', required: true, index: true }, { name: 'cluster', type: 'text', index: true }, { name: 'summary', type: 'textarea', required: true },
    { name: 'cover', type: 'upload', relationTo: 'media' }, { name: 'authors', type: 'relationship', relationTo: 'people', hasMany: true }, { name: 'reviewers', type: 'relationship', relationTo: 'people', hasMany: true },
    { name: 'content', type: 'richText' }, { name: 'layout', type: 'blocks', blocks: allBlocks },
    { name: 'sources', type: 'array', fields: [{ name: 'title', type: 'text', required: true }, { name: 'url', type: 'text', required: true }, { name: 'publisher', type: 'text' }, { name: 'accessedAt', type: 'date' }] },
    { name: 'editorialStatus', type: 'select', required: true, defaultValue: 'brief', options: ['brief','research','draft','fact-check','review','approved','published','retired'] },
    { name: 'originalityChecked', type: 'checkbox', defaultValue: false }, { name: 'factChecked', type: 'checkbox', defaultValue: false },
    { name: 'seo', type: 'group', fields: seoFields }, { name: 'relatedPages', type: 'relationship', relationTo: 'pages', hasMany: true }, { name: 'relatedPosts', type: 'relationship', relationTo: 'posts', hasMany: true }
  ]
}
