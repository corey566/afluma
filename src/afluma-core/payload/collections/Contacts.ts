import type { CollectionConfig } from 'payload'

import { contentTeam, editors } from '@/access'

export const Contacts: CollectionConfig = {
  slug: 'contacts',
  admin: {
    group: 'Afluma Core',
    useAsTitle: 'email',
    defaultColumns: ['name','email','organization','source','updatedAt'],
  },
  access: {
    read: contentTeam,
    create: contentTeam,
    update: contentTeam,
    delete: editors,
  },
  fields: [
    { name: 'name', type: 'text', required: true },
    {
      name: 'email',
      type: 'email',
      required: true,
      unique: true,
      index: true,
    },
    { name: 'phone', type: 'text' },
    {
      name: 'organization',
      type: 'relationship',
      relationTo: 'organizations',
    },
    {
      name: 'source',
      type: 'select',
      options: [
        'website',
        'email',
        'whatsapp',
        'voice',
        'manual',
        'social',
        'referral',
      ],
      defaultValue: 'website',
      index: true,
    },
    {
      name: 'consentToContact',
      type: 'checkbox',
      defaultValue: false,
    },
  ],
}
