import type { CollectionConfig } from 'payload'

import { adminOnly, contentTeam, hasRole, publicCreate } from '@/access'

export const Enquiries: CollectionConfig = {
  hooks: {
    afterChange: [
      async ({ doc, operation, req }) => {
        if (operation !== 'create') return doc

        const honeypot =
          typeof doc.honeypot === 'string'
            ? doc.honeypot.trim()
            : ''

        // Never queue automation for obvious bot submissions.
        if (honeypot) return doc

        try {
          await req.payload.jobs.queue({
            task: 'processMeiLeadIntake',
            queue: 'agentic',
            input: {
              enquiryId: String(doc.id),
              name: doc.name,
              email: doc.email,
              company: doc.company ?? undefined,
              phone: doc.phone ?? undefined,
              enquiryType: doc.enquiryType,
              message: doc.message,
              consent: Boolean(doc.consent),
            },
          })
        } catch (error) {
          // The public enquiry is already stored. Do not make the visitor
          // resubmit just because an internal background job failed to queue.
          console.error('[Afluma Core] Unable to queue Mei intake job', {
            enquiryId: doc.id,
            error,
          })
        }

        return doc
      },
    ],
  },
  slug: 'enquiries',
  timestamps: true,
  admin: {
    useAsTitle: 'email',
    group: 'Leads',
    defaultColumns: ['name', 'email', 'company', 'enquiryType', 'status', 'createdAt'],
  },
  access: {
    create: publicCreate,
    read: contentTeam,
    update: contentTeam,
    delete: adminOnly,
  },
  fields: [
    { name: 'name', type: 'text', required: true },
    { name: 'email', type: 'email', required: true },
    { name: 'company', type: 'text' },
    { name: 'phone', type: 'text' },
    {
      name: 'enquiryType',
      type: 'select',
      required: true,
      options: ['project', 'partnership', 'career', 'media', 'support', 'other'],
    },
    { name: 'budgetRange', type: 'text' },
    { name: 'message', type: 'textarea', required: true, maxLength: 5000 },
    { name: 'consent', type: 'checkbox', required: true },
    { name: 'honeypot', type: 'text', admin: { hidden: true } },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'new',
      options: ['new', 'qualified', 'in-progress', 'closed', 'spam'],
    },
    { name: 'assignedTo', type: 'relationship', relationTo: 'users' },
    {
      name: 'internalNotes',
      type: 'textarea',
      access: {
        create: () => false,
        read: ({ req }) =>
          hasRole(req.user, ['admin', 'editor', 'author', 'reviewer']),
        update: ({ req }) =>
          hasRole(req.user, ['admin', 'editor', 'author', 'reviewer']),
      },
    },
  ],
}
