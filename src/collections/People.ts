import type { CollectionConfig } from 'payload'
import { contentTeam, editors, publishedOrAuthenticated } from '@/access'
export const People: CollectionConfig = { slug: 'people', versions: { drafts: true }, admin: { useAsTitle: 'name', group: 'Company', defaultColumns: ['name','role','personType','verified','_status'] }, access: { read: publishedOrAuthenticated, create: contentTeam, update: contentTeam, delete: editors }, fields: [
  { name: 'name', type: 'text', required: true }, { name: 'slug', type: 'text', required: true, unique: true }, { name: 'role', type: 'text', required: true },
  { name: 'personType', type: 'select', required: true, options: ['leadership','team','author','reviewer','advisor'] }, { name: 'photo', type: 'upload', relationTo: 'media' }, { name: 'bio', type: 'richText' },
  { name: 'linkedinURL', type: 'text' }, { name: 'githubURL', type: 'text' }, { name: 'verified', type: 'checkbox', defaultValue: false }, { name: 'displayOrder', type: 'number', defaultValue: 100 }
]}
