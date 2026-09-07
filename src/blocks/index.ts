import type { Block } from 'payload'

const linkFields = [
  { name: 'label', type: 'text' as const, required: true },
  { name: 'href', type: 'text' as const, required: true },
  { name: 'style', type: 'select' as const, enumName: 'afl_link_style', defaultValue: 'primary', options: ['primary','secondary','text'] }
]

const mediaChoice = [
  { name: 'media', type: 'upload' as const, relationTo: 'media' as const },
  { name: 'fallbackAssetPath', type: 'text' as const, admin: { description: 'Temporary local /assets path. Replace with a Media Library item before launch.' } },
  { name: 'alt', type: 'text' as const }
]

export const CinematicHero: Block = {
  slug: 'cinematicHero', dbName: 'b_cine_hero', interfaceName: 'CinematicHeroBlock', labels: { singular: 'Cinematic hero', plural: 'Cinematic heroes' },
  fields: [
    { name: 'eyebrow', type: 'text' }, { name: 'headline', type: 'text', required: true }, { name: 'accentText', type: 'text' },
    { name: 'description', type: 'textarea' },
    { name: 'visual', type: 'group', fields: [
      ...mediaChoice,
      { name: 'mode', type: 'select', defaultValue: 'video', options: ['video','image'] },
      { name: 'poster', type: 'upload', relationTo: 'media' },
      { name: 'autoplay', type: 'checkbox', defaultValue: true },
      { name: 'muted', type: 'checkbox', defaultValue: true },
      { name: 'loop', type: 'checkbox', defaultValue: true }
    ]},
    { name: 'tabs', type: 'array', maxRows: 5, fields: [{ name: 'label', type: 'text', required: true }] },
    { name: 'chapters', type: 'array', maxRows: 6, fields: [{ name: 'label', type: 'text', required: true }, { name: 'time', type: 'number', min: 0 }] },
    { name: 'actions', type: 'array', maxRows: 2, fields: linkFields },
    { name: 'statusCard', type: 'group', fields: [{ name: 'enabled', type: 'checkbox' }, { name: 'label', type: 'text' }, { name: 'value', type: 'text' }, { name: 'note', type: 'text' }] }
  ]
}

export const EditorialIntro: Block = { slug: 'editorialIntro', dbName: 'b_editorial', fields: [
  { name: 'eyebrow', type: 'text' }, { name: 'heading', type: 'text', required: true }, { name: 'body', type: 'textarea' },
  { name: 'alignment', type: 'select', defaultValue: 'left', options: ['left','center','split'] }, { name: 'action', type: 'group', fields: linkFields }
]}

export const RichTextBlock: Block = { slug: 'richText', dbName: 'b_rich_text', fields: [{ name: 'content', type: 'richText', required: true }, { name: 'width', type: 'select', defaultValue: 'reading', options: ['reading','wide','full'] }] }

export const BentoGrid: Block = { slug: 'bentoGrid', dbName: 'b_bento', fields: [
  { name: 'eyebrow', type: 'text' }, { name: 'heading', type: 'text' }, { name: 'intro', type: 'textarea' },
  { name: 'theme', type: 'select', defaultValue: 'light', options: ['light','dark','mixed'] },
  { name: 'items', type: 'array', minRows: 1, fields: [
    { name: 'title', type: 'text', required: true }, { name: 'body', type: 'textarea' }, { name: 'iconKey', type: 'text' }, ...mediaChoice,
    { name: 'size', type: 'select', defaultValue: 'medium', options: ['small','medium','large','wide'] },
    { name: 'link', type: 'group', fields: linkFields }
  ]}
]}

export const CapabilityTheatre: Block = { slug: 'capabilityTheatre', dbName: 'b_cap_theatre', fields: [
  { name: 'heading', type: 'text', required: true }, { name: 'intro', type: 'textarea' },
  { name: 'panels', type: 'array', minRows: 3, maxRows: 6, fields: [
    { name: 'title', type: 'text', required: true }, { name: 'body', type: 'textarea' }, { name: 'eyebrow', type: 'text' }, ...mediaChoice,
    { name: 'link', type: 'group', fields: linkFields }
  ]}
]}

export const MediaFeature: Block = { slug: 'mediaFeature', dbName: 'b_media_feat', fields: [
  { name: 'eyebrow', type: 'text' }, { name: 'heading', type: 'text', required: true }, { name: 'body', type: 'textarea' },
  { name: 'layout', type: 'select', defaultValue: 'media-right', options: ['media-right','media-left','full-bleed'] }, ...mediaChoice,
  { name: 'action', type: 'group', fields: linkFields }
]}

export const Process: Block = { slug: 'process', dbName: 'b_process', fields: [
  { name: 'eyebrow', type: 'text' }, { name: 'heading', type: 'text', required: true }, { name: 'intro', type: 'textarea' },
  { name: 'steps', type: 'array', minRows: 2, fields: [{ name: 'title', type: 'text', required: true }, { name: 'body', type: 'textarea' }, { name: 'iconKey', type: 'text' }] }
]}

export const Metrics: Block = { slug: 'metrics', dbName: 'b_metrics', fields: [
  { name: 'heading', type: 'text' }, { name: 'theme', type: 'select', defaultValue: 'dark', options: ['light','dark'] },
  { name: 'items', type: 'array', fields: [{ name: 'value', type: 'text', required: true }, { name: 'label', type: 'text', required: true }, { name: 'source', type: 'text' }, { name: 'verified', type: 'checkbox', defaultValue: false }] }
]}

export const LogoStrip: Block = { slug: 'logoStrip', dbName: 'b_logo_strip', fields: [
  { name: 'label', type: 'text' }, { name: 'logos', type: 'array', fields: [{ name: 'name', type: 'text', required: true }, { name: 'logo', type: 'upload', relationTo: 'media' }, { name: 'permissionVerified', type: 'checkbox', defaultValue: false }] }
]}

export const ProductShowcase: Block = { slug: 'productShowcase', dbName: 'b_products', fields: [
  { name: 'heading', type: 'text', required: true }, { name: 'products', type: 'relationship', relationTo: 'products', hasMany: true }, { name: 'showRoadmapStatus', type: 'checkbox', defaultValue: true }
]}

export const CaseStudyShowcase: Block = { slug: 'caseStudyShowcase', dbName: 'b_cases', fields: [
  { name: 'heading', type: 'text', required: true }, { name: 'caseStudies', type: 'relationship', relationTo: 'case-studies', hasMany: true }, { name: 'layout', type: 'select', defaultValue: 'featured-grid', options: ['featured-grid','carousel','compact'] }
]}

export const InsightsFeed: Block = { slug: 'insightsFeed', dbName: 'b_insights', fields: [
  { name: 'heading', type: 'text', required: true }, { name: 'posts', type: 'relationship', relationTo: 'posts', hasMany: true }, { name: 'pillar', type: 'text' }, { name: 'limit', type: 'number', defaultValue: 3, min: 1, max: 12 }
]}

export const TeamGrid: Block = { slug: 'teamGrid', dbName: 'b_team', fields: [
  { name: 'heading', type: 'text', required: true }, { name: 'people', type: 'relationship', relationTo: 'people', hasMany: true }, { name: 'team', type: 'select', options: ['leadership','team','authors','advisors'] }
]}

export const JobsList: Block = { slug: 'jobsList', dbName: 'b_jobs', fields: [
  { name: 'heading', type: 'text', required: true }, { name: 'department', type: 'text' }, { name: 'location', type: 'text' }, { name: 'emptyState', type: 'textarea', defaultValue: 'There are no verified open roles in this category right now.' }
]}

export const FAQBlock: Block = { slug: 'faq', dbName: 'b_faq', fields: [
  { name: 'heading', type: 'text' }, { name: 'items', type: 'relationship', relationTo: 'faqs', hasMany: true },
  { name: 'manualItems', type: 'array', fields: [{ name: 'question', type: 'text', required: true }, { name: 'answer', type: 'textarea', required: true }] }
]}

export const CTA: Block = { slug: 'cta', dbName: 'b_cta', fields: [
  { name: 'eyebrow', type: 'text' }, { name: 'heading', type: 'text', required: true }, { name: 'body', type: 'textarea' },
  { name: 'theme', type: 'select', defaultValue: 'dark', options: ['light','dark','gradient'] }, ...mediaChoice,
  { name: 'actions', type: 'array', maxRows: 2, fields: linkFields }
]}

export const FormBlock: Block = { slug: 'form', dbName: 'b_form', fields: [
  { name: 'heading', type: 'text', required: true }, { name: 'body', type: 'textarea' },
  { name: 'formType', type: 'select', required: true, options: ['project-enquiry','contact','talent-network','newsletter'] },
  { name: 'successMessage', type: 'textarea', defaultValue: 'Thank you. Your message has been received.' }
]}

export const allBlocks = [CinematicHero, EditorialIntro, RichTextBlock, BentoGrid, CapabilityTheatre, MediaFeature, Process, Metrics, LogoStrip, ProductShowcase, CaseStudyShowcase, InsightsFeed, TeamGrid, JobsList, FAQBlock, CTA, FormBlock]
