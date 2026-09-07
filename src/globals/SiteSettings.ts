import type { GlobalConfig } from 'payload'
import { editors } from '@/access'
export const SiteSettings: GlobalConfig = { slug: 'site-settings', label: 'Site settings', admin: { group: 'Settings' }, versions: { drafts: { autosave: true } }, access: { read: () => true, update: editors }, fields: [
  { name: 'companyName', type: 'text', required: true, defaultValue: 'Afluma' }, { name: 'companyDescription', type: 'textarea', required: true }, { name: 'logo', type: 'upload', relationTo: 'media' }, { name: 'logoDark', type: 'upload', relationTo: 'media' },
  { name: 'contact', type: 'group', fields: [{ name: 'email', type: 'email' }, { name: 'phone', type: 'text' }, { name: 'address', type: 'textarea' }] },
  { name: 'socialLinks', type: 'array', fields: [{ name: 'platform', type: 'text', required: true }, { name: 'url', type: 'text', required: true }] },
  { name: 'defaultCTA', type: 'group', fields: [{ name: 'label', type: 'text', defaultValue: 'Start a project' }, { name: 'href', type: 'text', defaultValue: '/start-project' }] }
]}
