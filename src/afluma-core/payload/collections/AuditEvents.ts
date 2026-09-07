import type { CollectionConfig } from 'payload'

import { adminOnly, contentTeam } from '@/access'

export const AuditEvents: CollectionConfig = {
  slug: 'audit-events',
  admin: {
    group: 'AgenticOS',
    useAsTitle: 'eventType',
    defaultColumns: [
      'eventType',
      'actorType',
      'actorId',
      'correlationId',
      'createdAt',
    ],
  },
  access: {
    read: contentTeam,
    create: adminOnly,
    update: () => false,
    delete: adminOnly,
  },
  fields: [
    { name: 'eventType', type: 'text', required: true, index: true },
    {
      name: 'actorType',
      type: 'select',
      required: true,
      options: ['human','agent','system','external'],
      index: true,
    },
    { name: 'actorId', type: 'text', required: true, index: true },
    {
      name: 'correlationId',
      type: 'text',
      required: true,
      index: true,
    },
    { name: 'tenantId', type: 'text', index: true },
    { name: 'targetType', type: 'text' },
    { name: 'targetId', type: 'text' },
    { name: 'summary', type: 'textarea', required: true },
    { name: 'metadata', type: 'json' },
  ],
}
