import type { CollectionConfig } from 'payload'
import { contentTeam, editors, publishedOrAuthenticated } from '@/access'
import { seoFields, workflowFields } from '@/fields/seo'
import { enforcePageGate } from '@/hooks/contentGates'
import { revalidateDeleted, revalidateDocument } from '@/hooks/revalidate'
export const Locations: CollectionConfig = { slug: 'locations', versions: { drafts: true }, admin: { useAsTitle: 'name', group: 'Company' }, access: { read: publishedOrAuthenticated, create: contentTeam, update: contentTeam, delete: editors }, hooks: { beforeChange: [enforcePageGate], afterChange: [revalidateDocument], afterDelete: [revalidateDeleted] }, fields: [
  { name: 'name', type: 'text', required: true }, { name: 'slug', type: 'text', required: true, unique: true }, { name: 'country', type: 'text', required: true }, { name: 'city', type: 'text' }, { name: 'address', type: 'textarea' }, { name: 'phone', type: 'text' }, { name: 'email', type: 'email' }, { name: 'mapURL', type: 'text' }, { name: 'photo', type: 'upload', relationTo: 'media' }, { name: 'isPublicOffice', type: 'checkbox', defaultValue: false }, { name: 'seo', type: 'group', fields: seoFields }, { name: 'workflow', type: 'group', fields: workflowFields }
]}
