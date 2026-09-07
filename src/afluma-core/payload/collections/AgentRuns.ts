import type { CollectionConfig } from 'payload'

import { adminOnly, contentTeam } from '@/access'

export const AgentRuns: CollectionConfig = {
  slug: 'agent-runs',
  admin: {
    group: 'AgenticOS',
    useAsTitle: 'correlationId',
    defaultColumns: [
      'agentId',
      'capability',
      'status',
      'provider',
      'createdAt',
    ],
  },
  access: {
    read: contentTeam,
    create: adminOnly,
    update: adminOnly,
    delete: adminOnly,
  },
  fields: [
    {
      name: 'correlationId',
      type: 'text',
      required: true,
      unique: true,
      index: true,
    },
    { name: 'agentId', type: 'text', required: true, index: true },
    { name: 'capability', type: 'text', required: true, index: true },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'queued',
      options: [
        'queued',
        'running',
        'awaiting-approval',
        'completed',
        'failed',
        'cancelled',
      ],
      index: true,
    },
    { name: 'tenantId', type: 'text', index: true },
    { name: 'provider', type: 'text' },
    { name: 'model', type: 'text' },
    { name: 'input', type: 'json' },
    { name: 'output', type: 'json' },
    { name: 'error', type: 'textarea' },
    { name: 'durationMs', type: 'number' },
  ],
}
