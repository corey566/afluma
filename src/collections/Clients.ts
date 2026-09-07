import type { CollectionConfig } from 'payload'
import { contentTeam, editors, publishedOrAuthenticated } from '@/access'

export const Clients: CollectionConfig = {
  slug: 'clients',
  admin: { useAsTitle: 'name', group: 'Business', defaultColumns: ['name','status','permissionStatus','updatedAt'] },
  access: { read: publishedOrAuthenticated, create: contentTeam, update: contentTeam, delete: editors },
  fields: [
    { name: 'name', type: 'text', required: true, index: true },
    { name: 'slug', type: 'text', required: true, unique: true },
    { name: 'status', type: 'select', defaultValue: 'prospect', options: ['prospect','active','inactive','archived'] },
    { name: 'logo', type: 'upload', relationTo: 'media' },
    { name: 'website', type: 'text' },
    { name: 'industry', type: 'relationship', relationTo: 'industries' },
    { name: 'contacts', type: 'array', fields: [
      { name: 'name', type: 'text', required: true }, { name: 'role', type: 'text' }, { name: 'email', type: 'email' }, { name: 'phone', type: 'text' }
    ]},
    { name: 'permissionStatus', type: 'select', defaultValue: 'not-requested', options: ['not-requested','requested','approved','restricted','revoked'] },
    { name: 'approvedUses', type: 'select', hasMany: true, options: ['logo','name','case-study','testimonial','metrics','screenshots'] },
    { name: 'notes', type: 'textarea' }
  ]
}
