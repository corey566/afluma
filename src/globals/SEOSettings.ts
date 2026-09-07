import type { GlobalConfig } from 'payload'
import { editors } from '@/access'
export const SEOSettings: GlobalConfig = { slug: 'seo-settings', admin: { group: 'SEO & governance' }, versions: { drafts: { autosave: true } }, access: { read: () => true, update: editors }, fields: [
  { name: 'titleTemplate', type: 'text', required: true, defaultValue: '%s | Afluma' }, { name: 'defaultDescription', type: 'textarea' }, { name: 'defaultOGImage', type: 'upload', relationTo: 'media' },
  { name: 'organization', type: 'group', fields: [{ name: 'legalName', type: 'text' }, { name: 'foundingLocation', type: 'text' }, { name: 'logo', type: 'upload', relationTo: 'media' }, { name: 'sameAs', type: 'array', fields: [{ name: 'url', type: 'text', required: true }] }] },
  { name: 'verification', type: 'group', fields: [{ name: 'google', type: 'text' }, { name: 'bing', type: 'text' }] }
]}
