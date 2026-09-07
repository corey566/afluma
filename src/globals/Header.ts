import type { GlobalConfig } from 'payload'
import { editors } from '@/access'
export const Header: GlobalConfig = { slug: 'header', admin: { group: 'Navigation' }, versions: { drafts: { autosave: true } }, access: { read: () => true, update: editors }, fields: [
  { name: 'announcement', type: 'group', fields: [{ name: 'enabled', type: 'checkbox' }, { name: 'text', type: 'text' }, { name: 'href', type: 'text' }] },
  { name: 'items', type: 'array', maxRows: 8, fields: [
    { name: 'label', type: 'text', required: true }, { name: 'href', type: 'text', required: true }, { name: 'featuredHeading', type: 'text' }, { name: 'featuredBody', type: 'textarea' },
    { name: 'columns', type: 'array', maxRows: 3, fields: [{ name: 'heading', type: 'text' }, { name: 'links', type: 'array', fields: [{ name: 'label', type: 'text', required: true }, { name: 'href', type: 'text', required: true }] }] }
  ]},
  { name: 'cta', type: 'group', fields: [{ name: 'label', type: 'text', defaultValue: 'Start a project' }, { name: 'href', type: 'text', defaultValue: '/start-project' }] }
]}
