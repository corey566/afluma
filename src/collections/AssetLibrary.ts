import type { CollectionConfig } from 'payload'
import { contentTeam, editors, publishedOrAuthenticated } from '@/access'

export const AssetLibrary: CollectionConfig = {
  slug: 'asset-library',
  admin: {
    useAsTitle: 'canonicalPath',
    group: 'Source Fidelity',
    defaultColumns: ['assetId','family','kind','status','assignedRoute','updatedAt'],
    description: 'Complete NextSaaS media inventory. Dimension placeholders are excluded; demo logos and avatars are restricted until replaced or approved.'
  },
  access: { read: publishedOrAuthenticated, create: contentTeam, update: contentTeam, delete: editors },
  fields: [
    { name: 'assetId', type: 'text', required: true, unique: true, index: true },
    { name: 'canonicalPath', type: 'text', required: true, unique: true },
    { name: 'family', type: 'text', required: true, index: true },
    { name: 'kind', type: 'select', required: true, options: ['image','vector','gradient','icon','avatar','client-logo','logo'] },
    { name: 'status', type: 'select', required: true, index: true, options: [
      { label: 'Production candidate', value: 'production-candidate' },
      { label: 'Replace before launch', value: 'replace-before-launch' },
      { label: 'Editorial placeholder only', value: 'editorial-placeholder-only' },
      { label: 'Excluded', value: 'excluded' }
    ]},
    { name: 'exclusionReason', type: 'text' },
    { name: 'sourceArchive', type: 'text', admin: { readOnly: true } },
    { name: 'sourceCRC32', type: 'text', admin: { readOnly: true } },
    { name: 'sourceBytes', type: 'number', admin: { readOnly: true } },
    { name: 'publicPath', type: 'text', admin: { readOnly: true, description: 'Local extracted path used before R2 migration.' } },
    { name: 'media', type: 'upload', relationTo: 'media', admin: { description: 'Imported production media. Empty until the extraction/import job runs.' } },
    { name: 'assignedRoute', type: 'text', index: true },
    { name: 'assignedSlot', type: 'text' },
    { name: 'alt', type: 'text' },
    { name: 'caption', type: 'textarea' },
    { name: 'licenseStatus', type: 'textarea', required: true },
    { name: 'publicUseAllowed', type: 'checkbox', defaultValue: false },
    { name: 'duplicatePaths', type: 'array', fields: [{ name: 'path', type: 'text', required: true }] }
  ]
}
