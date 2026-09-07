import type { GlobalConfig } from 'payload'
import { editors } from '@/access'
export const Footer: GlobalConfig = { slug: 'footer', admin: { group: 'Navigation' }, versions: { drafts: { autosave: true } }, access: { read: () => true, update: editors }, fields: [
  { name: 'description', type: 'textarea' }, { name: 'columns', type: 'array', maxRows: 6, fields: [{ name: 'heading', type: 'text', required: true }, { name: 'links', type: 'array', fields: [{ name: 'label', type: 'text', required: true }, { name: 'href', type: 'text', required: true }] }] },
  { name: 'legalLinks', type: 'array', fields: [{ name: 'label', type: 'text', required: true }, { name: 'href', type: 'text', required: true }] }, { name: 'newsletterEnabled', type: 'checkbox', defaultValue: true }
]}
