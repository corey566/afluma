import type { CollectionConfig } from 'payload'
import { contentTeam, editors, publishedOrAuthenticated } from '@/access'

export const ClientProjects: CollectionConfig = {
  slug: 'client-projects',
  admin: { useAsTitle: 'title', group: 'Business', defaultColumns: ['title','client','status','publicEvidenceStatus','updatedAt'] },
  access: { read: publishedOrAuthenticated, create: contentTeam, update: contentTeam, delete: editors },
  fields: [
    { name: 'title', type: 'text', required: true },
    { name: 'client', type: 'relationship', relationTo: 'clients', required: true },
    { name: 'status', type: 'select', defaultValue: 'discovery', options: ['discovery','active','on-hold','completed','cancelled','archived'] },
    { name: 'services', type: 'relationship', relationTo: 'services', hasMany: true },
    { name: 'products', type: 'relationship', relationTo: 'products', hasMany: true },
    { name: 'summary', type: 'textarea' },
    { name: 'projectMedia', type: 'upload', relationTo: 'media', hasMany: true },
    { name: 'verifiedMetrics', type: 'array', fields: [
      { name: 'label', type: 'text', required: true }, { name: 'value', type: 'text', required: true }, { name: 'source', type: 'text', required: true }, { name: 'verified', type: 'checkbox', defaultValue: false }
    ]},
    { name: 'publicEvidenceStatus', type: 'select', defaultValue: 'private', options: ['private','reviewing','approved','published','revoked'] },
    { name: 'caseStudy', type: 'relationship', relationTo: 'case-studies' },
    { name: 'internalNotes', type: 'textarea' }
  ]
}
