import type { CollectionConfig } from 'payload'
import { mediaTeam, publishedOrAuthenticated } from '@/access'

export const Media: CollectionConfig = {
  slug: 'media', admin: { useAsTitle: 'title', group: 'Assets', defaultColumns: ['title','assetRole','productionStatus','licenseStatus','updatedAt'] },
  access: { read: publishedOrAuthenticated, create: mediaTeam, update: mediaTeam, delete: mediaTeam },
  upload: {
    staticDir: 'media', mimeTypes: ['image/*','video/*','application/pdf','audio/*'], imageSizes: [
      { name: 'thumbnail', width: 480, height: 320, position: 'centre' },
      { name: 'card', width: 960, height: 640, position: 'centre' },
      { name: 'og', width: 1200, height: 630, position: 'centre' },
      { name: 'wide', width: 1920, height: 1080, position: 'centre' }
    ], focalPoint: true
  },
  fields: [
    { name: 'title', type: 'text', required: true }, { name: 'alt', type: 'text', required: true }, { name: 'caption', type: 'textarea' },
    { name: 'assetRole', type: 'select', required: true, defaultValue: 'editorial', options: ['brand','hero','section-motion','product-evidence','case-study-evidence','team','editorial','icon','document','archive'] },
    { name: 'sourceType', type: 'select', required: true, defaultValue: 'owned', options: ['owned','licensed-stock','template-source','client-supplied','reference-only'] },
    { name: 'creator', type: 'text' }, { name: 'sourceURL', type: 'text' }, { name: 'licenseRecord', type: 'textarea' },
    { name: 'licenseStatus', type: 'select', required: true, defaultValue: 'pending', options: ['owned','verified','pending','restricted','reference-only'] },
    { name: 'productionStatus', type: 'select', required: true, defaultValue: 'review', options: ['approved','review','replace','archive'] },
    { name: 'motion', type: 'group', admin: { condition: (_, siblingData) => String(siblingData?.mimeType || '').startsWith('video/') }, fields: [
      { name: 'loopApproved', type: 'checkbox' }, { name: 'autoplayApproved', type: 'checkbox' }, { name: 'reducedMotionFallback', type: 'upload', relationTo: 'media' }, { name: 'transcript', type: 'textarea' }
    ]}
  ]
}
