import type { CollectionConfig } from 'payload'
import { recruiters, publishedOrAuthenticated } from '@/access'
import { seoFields } from '@/fields/seo'
import { revalidateDeleted, revalidateDocument } from '@/hooks/revalidate'
export const Jobs: CollectionConfig = { slug: 'jobs', versions: { drafts: { autosave: true, schedulePublish: true } }, admin: { useAsTitle: 'title', group: 'Careers', defaultColumns: ['title','department','location','jobStatus','_status'] }, access: { read: publishedOrAuthenticated, create: recruiters, update: recruiters, delete: recruiters }, hooks: { afterChange: [revalidateDocument], afterDelete: [revalidateDeleted] }, fields: [
  { name: 'title', type: 'text', required: true }, { name: 'slug', type: 'text', required: true, unique: true }, { name: 'department', type: 'text', required: true }, { name: 'location', type: 'text', required: true },
  { name: 'workModel', type: 'select', required: true, options: ['remote','hybrid','onsite'] }, { name: 'employmentType', type: 'select', required: true, options: ['full-time','part-time','contract','internship'] },
  { name: 'jobStatus', type: 'select', required: true, defaultValue: 'draft', options: ['draft','approved','open','paused','closed'] }, { name: 'openDate', type: 'date' }, { name: 'closeDate', type: 'date' },
  { name: 'summary', type: 'textarea', required: true }, { name: 'description', type: 'richText', required: true }, { name: 'applyURL', type: 'text' }, { name: 'seo', type: 'group', fields: seoFields }
]}
