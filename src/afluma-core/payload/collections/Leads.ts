import type { CollectionConfig } from 'payload'

import { contentTeam, editors } from '@/access'

export const Leads: CollectionConfig = {
  slug: 'leads',
  admin: {
    group: 'Afluma Core',
    useAsTitle: 'subject',
    defaultColumns: [
      'subject',
      'stage',
      'priority',
      'assignedAgentId',
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
    { name: 'subject', type: 'text', required: true },
    {
      name: 'contact',
      type: 'relationship',
      relationTo: 'contacts',
      required: true,
      index: true,
    },
    {
      name: 'organization',
      type: 'relationship',
      relationTo: 'organizations',
      index: true,
    },
    {
      name: 'sourceEnquiryId',
      type: 'text',
      unique: true,
      index: true,
    },
    {
      name: 'stage',
      type: 'select',
      defaultValue: 'new',
      options: [
        'new',
        'triaged',
        'qualified',
        'discovery',
        'proposal',
        'won',
        'lost',
        'archived',
      ],
      index: true,
    },
    {
      name: 'priority',
      type: 'select',
      defaultValue: 'normal',
      options: ['low','normal','high','urgent'],
      index: true,
    },
    {
      name: 'assignedAgentId',
      type: 'text',
      defaultValue: 'agent.mei.nova',
      index: true,
    },
    { name: 'businessNeed', type: 'textarea' },
    { name: 'aiSummary', type: 'textarea' },
    { name: 'missingInformation', type: 'json' },
    { name: 'safetyFlags', type: 'json' },
    {
      name: 'triageProvider',
      type: 'text',
      admin: { readOnly: true },
    },
    {
      name: 'triageModel',
      type: 'text',
      admin: { readOnly: true },
    },
  ],
}
