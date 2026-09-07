import type { CollectionConfig } from 'payload'

import { adminOnly, contentTeam } from '@/access'

export const Agents: CollectionConfig = {
  slug: 'agents',
  admin: {
    group: 'AgenticOS',
    useAsTitle: 'name',
    defaultColumns: ['name','agentId','status','authorityLevel','updatedAt'],
  },
  access: {
    read: contentTeam,
    create: adminOnly,
    update: adminOnly,
    delete: adminOnly,
  },
  fields: [
    {
      name: 'agentId',
      type: 'text',
      required: true,
      unique: true,
      index: true,
    },
    { name: 'name', type: 'text', required: true },
    { name: 'role', type: 'text', required: true },
    { name: 'mission', type: 'textarea', required: true },
    {
      name: 'status',
      type: 'select',
      defaultValue: 'designed',
      options: ['designed','development','testing','active','paused','disabled'],
      index: true,
    },
    {
      name: 'authorityLevel',
      type: 'number',
      min: 0,
      max: 4,
      required: true,
    },
    {
      name: 'capabilities',
      type: 'json',
      required: true,
    },
    {
      name: 'publicPersona',
      type: 'checkbox',
      defaultValue: true,
    },
    { name: 'disclosure', type: 'text', required: true },
    {
      name: 'canWriteLongTermMemory',
      type: 'checkbox',
      defaultValue: false,
    },
    {
      name: 'escalationAgentIds',
      type: 'json',
    },
    { name: 'runtimeNotes', type: 'textarea' },
  ],
}
