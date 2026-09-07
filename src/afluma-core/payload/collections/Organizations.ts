import type { CollectionConfig } from 'payload'

import { contentTeam, editors } from '@/access'

export const Organizations: CollectionConfig = {
  slug: 'organizations',
  admin: {
    group: 'Afluma Core',
    useAsTitle: 'name',
    defaultColumns: ['name','status','country','updatedAt'],
  },
  access: {
    read: contentTeam,
    create: contentTeam,
    update: contentTeam,
    delete: editors,
  },
  fields: [
    { name: 'name', type: 'text', required: true, index: true },
    { name: 'legalName', type: 'text' },
    { name: 'website', type: 'text' },
    { name: 'industry', type: 'text', index: true },
    { name: 'country', type: 'text', index: true },
    {
      name: 'status',
      type: 'select',
      defaultValue: 'prospect',
      options: ['prospect','client','partner','inactive'],
      index: true,
    },
    { name: 'notes', type: 'textarea' },
  ],
}
