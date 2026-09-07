import type { CollectionConfig } from 'payload'
import { allBlocks } from '@/blocks'
import { contentTeam, editors, publishedOrAuthenticated, reviewers } from '@/access'
import { seoFields, workflowFields } from '@/fields/seo'
import { enforcePageGate } from '@/hooks/contentGates'
import { revalidateDeleted, revalidateDocument } from '@/hooks/revalidate'

const serverURL = process.env.SERVER_URL || 'http://localhost:3000'

export const Pages: CollectionConfig = {
  slug: 'pages', versions: { drafts: { autosave: { interval: 1200, showSaveDraftButton: true }, schedulePublish: true }, maxPerDoc: 80 }, trash: true,
  admin: {
    useAsTitle: 'title', group: 'Website', defaultColumns: ['sourceId','title','pageType','template','workflow.status','_status','updatedAt'],
    preview: (doc) => `${serverURL}/api/draft?secret=${process.env.PREVIEW_SECRET || ''}&slug=${encodeURIComponent(String(doc.slug || ''))}`,
    livePreview: { url: ({ data }) => `${serverURL}/api/draft?secret=${process.env.PREVIEW_SECRET || ''}&slug=${encodeURIComponent(String(data?.slug || ''))}` }
  },
  access: { read: publishedOrAuthenticated, create: contentTeam, update: contentTeam, delete: editors, readVersions: reviewers },
  hooks: { beforeChange: [enforcePageGate], afterChange: [revalidateDocument], afterDelete: [revalidateDeleted] },
  fields: [
    { type: 'tabs', tabs: [
      { label: 'Page', fields: [
        { name: 'sourceId', type: 'text', unique: true, index: true }, { name: 'title', type: 'text', required: true },
        { name: 'slug', type: 'text', required: true, unique: true, index: true, admin: { description: 'Use an empty value only for the homepage.' } },
        { name: 'pageType', type: 'select', required: true, options: ['home','hub','service','solution','industry','product','work','case-study','insights','article','company','team','careers','job','location','legal','utility'] },
        { name: 'template', type: 'select', required: true, defaultValue: 'standard', options: ['home','hub','detail','article','about','team','careers','contact','legal','utility','standard'] },
        { name: 'section', type: 'text', index: true }, { name: 'parent', type: 'relationship', relationTo: 'pages' },
        { name: 'summary', type: 'textarea', required: true },
        { name: 'presentationMode', type: 'select', defaultValue: 'afluma-blocks', options: [
          { label: 'Afluma controlled blocks', value: 'afluma-blocks' },
          { label: 'Exact NextSaaS source template', value: 'source-template' },
          { label: 'Hybrid source template + Afluma components', value: 'hybrid' }
        ]},
        { name: 'sourceTemplate', type: 'relationship', relationTo: 'source-templates', admin: { condition: (_, siblingData) => siblingData?.presentationMode !== 'afluma-blocks' } },
        { name: 'sourceSlots', type: 'array', admin: { condition: (_, siblingData) => siblingData?.presentationMode !== 'afluma-blocks', description: 'Editable replacements applied to the exact source markup without touching code.' }, fields: [
          { name: 'slot', type: 'text', required: true },
          { name: 'value', type: 'textarea' },
          { name: 'media', type: 'upload', relationTo: 'media' }
        ]},
        { name: 'assetAssignments', type: 'relationship', relationTo: 'asset-library', hasMany: true, admin: { description: 'All NextSaaS assets assigned to this route. Excluded placeholders cannot be selected for public use.' } },
        { name: 'layout', type: 'blocks', blocks: allBlocks }
      ]},
      { label: 'SEO', fields: [{ name: 'seo', type: 'group', fields: seoFields }] },
      { label: 'Workflow', fields: [{ name: 'workflow', type: 'group', fields: workflowFields }, { name: 'recommendedIndexable', type: 'checkbox', admin: { readOnly: true } }] },
      { label: 'Relationships', fields: [
        { name: 'services', type: 'relationship', relationTo: 'services', hasMany: true }, { name: 'solutions', type: 'relationship', relationTo: 'solutions', hasMany: true },
        { name: 'industries', type: 'relationship', relationTo: 'industries', hasMany: true }, { name: 'products', type: 'relationship', relationTo: 'products', hasMany: true },
        { name: 'relatedPages', type: 'relationship', relationTo: 'pages', hasMany: true }, { name: 'relatedPosts', type: 'relationship', relationTo: 'posts', hasMany: true }
      ]}
    ]}
  ]
}
