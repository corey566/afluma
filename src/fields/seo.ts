import type { Field } from 'payload'

export const seoFields: Field[] = [
  { name: 'title', type: 'text', maxLength: 65, admin: { description: 'Search title. Keep the main term natural and specific.' } },
  { name: 'description', type: 'textarea', maxLength: 170, admin: { description: 'Search description. Avoid unsupported claims.' } },
  { name: 'canonicalURL', type: 'text' },
  { name: 'primaryKeyword', type: 'text' },
  { name: 'indexing', type: 'select', required: true, defaultValue: 'noindex', options: [
    { label: 'Noindex — not ready for search', value: 'noindex' },
    { label: 'Index — approved for search', value: 'index' }
  ]},
  { name: 'includeInSitemap', type: 'checkbox', defaultValue: false },
  { name: 'openGraphImage', type: 'upload', relationTo: 'media' },
  { name: 'schemaType', type: 'select', defaultValue: 'WebPage', options: ['WebPage','AboutPage','ContactPage','Service','Product','Article','FAQPage','ProfilePage','CollectionPage'] },
  { name: 'structuredData', type: 'json', admin: { description: 'Optional schema additions. Do not paste unverified ratings, reviews or claims.' } }
]

export const workflowFields: Field[] = [
  { name: 'status', type: 'select', required: true, defaultValue: 'brief', options: [
    'brief','draft','needs-review','fact-check','legal-review','approved','retired'
  ]},
  { name: 'contentOwner', type: 'relationship', relationTo: 'users' },
  { name: 'reviewers', type: 'relationship', relationTo: 'users', hasMany: true },
  { name: 'evidenceStatus', type: 'select', required: true, defaultValue: 'not-required', options: ['not-required','pending','verified','restricted'] },
  { name: 'reviewNotes', type: 'textarea' },
  { name: 'approvedAt', type: 'date', admin: { readOnly: true } }
]
