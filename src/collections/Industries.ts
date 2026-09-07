import type { CollectionConfig } from 'payload'
import { allBlocks } from '@/blocks'
import { contentTeam, editors, publishedOrAuthenticated } from '@/access'
import { seoFields, workflowFields } from '@/fields/seo'
import { enforcePageGate } from '@/hooks/contentGates'
import { revalidateDeleted, revalidateDocument } from '@/hooks/revalidate'
export const Industries: CollectionConfig = { slug: 'industries', versions: { drafts: { autosave: true, schedulePublish: true } }, admin: { useAsTitle: 'title', group: 'Structured content' }, access: { read: publishedOrAuthenticated, create: contentTeam, update: contentTeam, delete: editors }, hooks: { beforeChange: [enforcePageGate], afterChange: [revalidateDocument], afterDelete: [revalidateDeleted] }, fields: [
  { name: 'title', type: 'text', required: true }, { name: 'slug', type: 'text', required: true, unique: true }, { name: 'summary', type: 'textarea', required: true }, { name: 'challenges', type: 'array', fields: [{ name: 'title', type: 'text', required: true }, { name: 'body', type: 'textarea' }] }, { name: 'solutions', type: 'relationship', relationTo: 'solutions', hasMany: true }, { name: 'layout', type: 'blocks', blocks: allBlocks }, { name: 'seo', type: 'group', fields: seoFields }, { name: 'workflow', type: 'group', fields: workflowFields }
]}
