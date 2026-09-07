import type { CollectionConfig } from 'payload'

import { contentTeam, editors } from '@/access'

export const KnowledgeDocuments: CollectionConfig = {
  slug: 'knowledge-documents',
  admin: {
    group: 'AgenticOS',
    useAsTitle: 'title',
    defaultColumns: [
      'title',
      'knowledgeClass',
      'status',
      'tenantId',
      'updatedAt',
    ],
  },
  access: {
    read: contentTeam,
    create: contentTeam,
    update: contentTeam,
    delete: editors,
  },
  fields: [
    { name: 'title', type: 'text', required: true, index: true },
    {
      name: 'knowledgeClass',
      type: 'select',
      required: true,
      options: ['truth','intelligence','presentation'],
      index: true,
    },
    {
      name: 'status',
      type: 'select',
      defaultValue: 'draft',
      options: ['draft','review','approved','superseded','archived'],
      index: true,
    },
    {
      name: 'tenantId',
      type: 'text',
      defaultValue: 'afluma',
      index: true,
    },
    {
      name: 'sourceType',
      type: 'select',
      options: [
        'internal',
        'website',
        'document',
        'research',
        'client',
        'system',
        'other',
      ],
      index: true,
    },
    { name: 'sourceUri', type: 'text' },
    { name: 'confidence', type: 'number', min: 0, max: 1 },
    { name: 'content', type: 'textarea', required: true },
    { name: 'metadata', type: 'json' },
  ],
}
