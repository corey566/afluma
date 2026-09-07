import type { CollectionConfig } from 'payload'
import { allBlocks } from '@/blocks'
import { contentTeam, editors, publishedOrAuthenticated } from '@/access'
import { seoFields, workflowFields } from '@/fields/seo'
import { enforceCaseStudyGate } from '@/hooks/contentGates'
import { revalidateDeleted, revalidateDocument } from '@/hooks/revalidate'
export const CaseStudies: CollectionConfig = { slug: 'case-studies', versions: { drafts: { autosave: true, schedulePublish: true } }, admin: { useAsTitle: 'title', group: 'Evidence', defaultColumns: ['title','clientDisplayName','permissionStatus','evidenceStatus','_status'] }, access: { read: publishedOrAuthenticated, create: contentTeam, update: contentTeam, delete: editors }, hooks: { beforeChange: [enforceCaseStudyGate], afterChange: [revalidateDocument], afterDelete: [revalidateDeleted] }, fields: [
  { name: 'title', type: 'text', required: true }, { name: 'slug', type: 'text', required: true, unique: true }, { name: 'clientDisplayName', type: 'text' }, { name: 'anonymized', type: 'checkbox', defaultValue: false },
  { name: 'summary', type: 'textarea', required: true }, { name: 'challenge', type: 'richText' }, { name: 'solution', type: 'richText' }, { name: 'outcome', type: 'richText' },
  { name: 'evidence', type: 'array', fields: [{ name: 'claim', type: 'text', required: true }, { name: 'value', type: 'text' }, { name: 'sourceRecord', type: 'textarea', required: true }, { name: 'approved', type: 'checkbox', defaultValue: false }] },
  { name: 'permissionStatus', type: 'select', required: true, defaultValue: 'pending', options: ['pending','approved','restricted','withdrawn'] }, { name: 'evidenceStatus', type: 'select', required: true, defaultValue: 'pending', options: ['pending','verified','restricted'] },
  { name: 'media', type: 'upload', relationTo: 'media', hasMany: true }, { name: 'services', type: 'relationship', relationTo: 'services', hasMany: true }, { name: 'industries', type: 'relationship', relationTo: 'industries', hasMany: true },
  { name: 'layout', type: 'blocks', blocks: allBlocks }, { name: 'seo', type: 'group', fields: seoFields }, { name: 'workflow', type: 'group', fields: workflowFields }
]}
