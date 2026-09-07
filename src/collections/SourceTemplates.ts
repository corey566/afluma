import type { CollectionConfig } from 'payload'
import { contentTeam, editors, publishedOrAuthenticated } from '@/access'

export const SourceTemplates: CollectionConfig = {
  slug: 'source-templates',
  admin: { useAsTitle: 'key', group: 'Source Fidelity', defaultColumns: ['key','family','page','status','updatedAt'] },
  access: { read: publishedOrAuthenticated, create: contentTeam, update: contentTeam, delete: editors },
  fields: [
    { name: 'key', type: 'text', required: true, unique: true, index: true },
    { name: 'family', type: 'select', required: true, options: ['creative-portfolio','ai-agency','automation-saas','app-development'] },
    { name: 'page', type: 'text', required: true },
    { name: 'sourcePath', type: 'text', required: true, admin: { readOnly: true } },
    { name: 'resolvedPath', type: 'text', required: true, admin: { readOnly: true } },
    { name: 'status', type: 'select', defaultValue: 'available', options: ['available','approved','deprecated'] },
    { name: 'contentBindings', type: 'array', fields: [
      { name: 'slot', type: 'text', required: true },
      { name: 'selector', type: 'text', required: true },
      { name: 'mode', type: 'select', required: true, options: ['text','html','image-src','video-src','href','class'] },
      { name: 'fallback', type: 'textarea' }
    ]},
    { name: 'notes', type: 'textarea' }
  ]
}
