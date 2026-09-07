import type { CollectionConfig } from 'payload'
import { editors } from '@/access'
export const Redirects: CollectionConfig = { slug: 'redirects', admin: { useAsTitle: 'from', group: 'SEO & governance', defaultColumns: ['from','to','type','active'] }, access: { read: () => true, create: editors, update: editors, delete: editors }, fields: [
  { name: 'from', type: 'text', required: true, unique: true }, { name: 'to', type: 'text', required: true }, { name: 'type', type: 'select', required: true, defaultValue: '301', options: ['301','302','307','308'] }, { name: 'active', type: 'checkbox', defaultValue: true }, { name: 'notes', type: 'textarea' }
]}
