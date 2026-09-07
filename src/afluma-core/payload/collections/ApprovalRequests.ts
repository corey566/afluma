import type { CollectionConfig } from 'payload'

import { adminOnly, contentTeam } from '@/access'

export const ApprovalRequests: CollectionConfig = {
  slug: 'approval-requests',
  admin: {
    group: 'AgenticOS',
    useAsTitle: 'title',
    defaultColumns: [
      'title',
      'category',
      'status',
      'requestedByAgentId',
      'updatedAt',
    ],
  },
  access: {
    read: contentTeam,
    create: adminOnly,
    update: adminOnly,
    delete: adminOnly,
  },
  fields: [
    { name: 'title', type: 'text', required: true },
    {
      name: 'category',
      type: 'select',
      required: true,
      options: [
        'commercial',
        'payment',
        'content',
        'production',
        'security',
        'legal',
        'data',
        'other',
      ],
      index: true,
    },
    {
      name: 'status',
      type: 'select',
      defaultValue: 'pending',
      options: ['pending','approved','rejected','expired'],
      index: true,
    },
    { name: 'requestedByAgentId', type: 'text', index: true },
    { name: 'correlationId', type: 'text', index: true },
    {
      name: 'riskLevel',
      type: 'select',
      defaultValue: 'normal',
      options: ['low','normal','high','critical'],
      index: true,
    },
    { name: 'reason', type: 'textarea', required: true },
    { name: 'proposedAction', type: 'json' },
    { name: 'decisionNotes', type: 'textarea' },
    { name: 'decidedAt', type: 'date' },
  ],
}
