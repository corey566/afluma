import type { CollectionConfig } from 'payload'
import { allBlocks } from '@/blocks'
import { contentTeam, editors, publishedOrAuthenticated } from '@/access'
import { seoFields, workflowFields } from '@/fields/seo'
import { enforcePageGate } from '@/hooks/contentGates'
import { revalidateDeleted, revalidateDocument } from '@/hooks/revalidate'
export const Products: CollectionConfig = { slug: 'products', versions: { drafts: { autosave: true, schedulePublish: true } }, admin: { useAsTitle: 'title', group: 'Products', defaultColumns: ['title','availability','workflow.status','_status'] }, access: { read: publishedOrAuthenticated, create: contentTeam, update: contentTeam, delete: editors }, hooks: { beforeChange: [enforcePageGate], afterChange: [revalidateDocument], afterDelete: [revalidateDeleted] }, fields: [
  { name: 'title', type: 'text', required: true }, { name: 'slug', type: 'text', required: true, unique: true }, { name: 'summary', type: 'textarea', required: true },
  { name: 'availability', type: 'select', required: true, defaultValue: 'planned', options: ['generally-available','beta','early-access','planned','paused'] },
  { name: 'productURL', type: 'text' }, { name: 'screenshots', type: 'upload', relationTo: 'media', hasMany: true }, { name: 'documentationURL', type: 'text' },
  { name: 'features', type: 'array', fields: [{ name: 'title', type: 'text', required: true }, { name: 'body', type: 'textarea' }] },
  { name: 'layout', type: 'blocks', blocks: allBlocks }, { name: 'seo', type: 'group', fields: seoFields }, { name: 'workflow', type: 'group', fields: workflowFields }
]}
