import type { CollectionConfig } from 'payload'

import { adminOnly, authenticated, hasRole } from '@/access'

export const Users: CollectionConfig = {
  slug: 'users',
  auth: {
    tokenExpiration: 28800,
    verify: true,
    maxLoginAttempts: 8,
    lockTime: 600000,
  },
  admin: {
    useAsTitle: 'name',
    group: 'Administration',
    defaultColumns: ['name', 'email', 'roles', 'updatedAt'],
  },
  access: {
    read: authenticated,
    create: adminOnly,
    update: ({ req, id }) =>
      hasRole(req.user, ['admin']) ||
      Boolean(req.user && id !== undefined && String(req.user.id) === String(id)),
    delete: adminOnly,
    admin: ({ req }) => Boolean(req.user),
  },
  fields: [
    { name: 'name', type: 'text', required: true },
    {
      name: 'roles',
      type: 'select',
      hasMany: true,
      required: true,
      saveToJWT: true,
      defaultValue: ['author'],
      options: [
        { label: 'Administrator', value: 'admin' },
        { label: 'Editor', value: 'editor' },
        { label: 'Author', value: 'author' },
        { label: 'Reviewer', value: 'reviewer' },
        { label: 'Media manager', value: 'media' },
        { label: 'Recruiter', value: 'recruiter' },
      ],
    },
    { name: 'avatar', type: 'upload', relationTo: 'media' },
  ],
}
