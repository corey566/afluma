import type { CollectionConfig } from 'payload'
import { contentTeam, editors } from '@/access'
export const FAQs: CollectionConfig = { slug: 'faqs', admin: { useAsTitle: 'question', group: 'Reusable content' }, access: { read: () => true, create: contentTeam, update: contentTeam, delete: editors }, fields: [
  { name: 'question', type: 'text', required: true }, { name: 'answer', type: 'richText', required: true }, { name: 'category', type: 'text', index: true }, { name: 'approved', type: 'checkbox', defaultValue: false }
]}
