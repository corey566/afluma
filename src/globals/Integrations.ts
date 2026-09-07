import type { GlobalConfig } from 'payload'
import { adminOnly, sensitiveField } from '@/access'
export const Integrations: GlobalConfig = { slug: 'integrations', admin: { group: 'Settings' }, access: { read: adminOnly, update: adminOnly }, fields: [
  { name: 'analytics', type: 'group', fields: [{ name: 'provider', type: 'select', options: ['none','google-analytics','plausible','cloudflare-web-analytics'] }, { name: 'siteId', type: 'text' }] },
  { name: 'consentManager', type: 'group', fields: [{ name: 'provider', type: 'text' }, { name: 'configurationId', type: 'text' }] },
  { name: 'webhooks', type: 'array', fields: [{ name: 'name', type: 'text', required: true }, { name: 'url', type: 'text', required: true, access: { read: sensitiveField, update: sensitiveField } }, { name: 'enabled', type: 'checkbox', defaultValue: false }] }
]}
