import fs from 'node:fs/promises'
import path from 'node:path'
import config from '@payload-config'
import { getPayload } from 'payload'

type SourcePage = Record<string, any>
const source = JSON.parse(await fs.readFile(path.resolve('content/pages.json'), 'utf8')) as SourcePage[]
const payload = await getPayload({ config })

const pageType = (value: string) => {
  const v = value.toLowerCase()
  if (v === 'home') return 'home'
  if (v.includes('insight article')) return 'article'
  if (v.includes('insight') || v.includes('pillar')) return 'insights'
  if (v.includes('service')) return v.includes('hub') ? 'hub' : 'service'
  if (v.includes('solution')) return v.includes('hub') ? 'hub' : 'solution'
  if (v.includes('industry')) return v.includes('hub') ? 'hub' : 'industry'
  if (v.includes('product')) return v.includes('hub') ? 'hub' : 'product'
  if (v.includes('case study')) return 'case-study'
  if (v.includes('work')) return 'work'
  if (v.includes('legal')) return 'legal'
  if (v.includes('location')) return 'location'
  if (v.includes('company')) return 'company'
  return 'standard'
}
const template = (type: string, slug: string) => slug === '' ? 'home' : type === 'article' ? 'article' : slug === 'about' ? 'about' : slug.includes('team') ? 'team' : slug.startsWith('careers') ? 'careers' : ['contact','start-project'].includes(slug) ? 'contact' : type === 'legal' ? 'legal' : ['hub','insights','work'].includes(type) ? 'hub' : 'detail'

const defaultLayout = (p: SourcePage) => {
  const sourceSlug = String(p.slug || '').trim()
  const slug = sourceSlug || 'home'
  const type = pageType(String(p['Page Type'] || ''))
  const h2s: string[] = Array.isArray(p.h2s) ? p.h2s : []
  const heroAsset = slug === '' ? '/assets/motion/hero-automation.mp4' : '/assets/visuals/glass-ribbon.png'
  const blocks: any[] = [{
    blockType: 'cinematicHero', eyebrow: p.Section || p['Page Type'], headline: p['H1 / Page Title'], accentText: slug === '' ? 'Operate. Grow.' : '', description: p['Draft Content Direction'],
    visual: { mode: slug === '' ? 'video' : 'image', fallbackAssetPath: heroAsset, alt: '', autoplay: true, muted: true, loop: true },
    tabs: [{label:'Overview'},{label:type==='home'?'Capabilities':'Related'},{label:'Evidence'}],
    chapters: [{label:'Discover',time:0},{label:'Build',time:4},{label:'Operate',time:8},{label:'Grow',time:12}],
    actions: [{label:p['Primary CTA'] || 'Start a project',href:String(p['CTA URL'] || '/start-project').replace('https://afluma.com','') || '/start-project',style:'primary'}]
  }]
  if (slug === '') blocks.push({ blockType:'capabilityTheatre', heading:'Build. Automate. Operate. Grow.', intro:'A connected system of strategy, software, automation and managed operations.', panels:[
    {eyebrow:'Build',title:'Software and digital products',body:'Design and engineer useful systems around real operating needs.',fallbackAssetPath:'/assets/visuals/glass-ribbon.png',alt:'',link:{label:'Explore services',href:'/services',style:'text'}},
    {eyebrow:'Automate',title:'AI and workflow automation',body:'Orchestrate repetitive and complex work with clear human control.',fallbackAssetPath:'/assets/visuals/automation-hand.png',alt:'',link:{label:'Explore automation',href:'/services/ai-automation',style:'text'}},
    {eyebrow:'Operate',title:'Managed business operations',body:'Operate defined processes with reporting, exceptions and accountability.',fallbackAssetPath:'/assets/visuals/technical-grid.png',alt:'',link:{label:'Explore operations',href:'/services/managed-business-operations',style:'text'}},
    {eyebrow:'Grow',title:'Commerce, data and growth systems',body:'Connect operations, customer experience and measurable growth.',fallbackAssetPath:'/assets/visuals/human-ai-portrait.png',alt:'',link:{label:'Explore solutions',href:'/solutions',style:'text'}}
  ]})
  blocks.push({ blockType:'editorialIntro', eyebrow:p['Page Type'], heading:h2s[0] || p['H1 / Page Title'], body:p['Draft Content Direction'], alignment:'left', action:{ label:p['Primary CTA'] || 'Start a project', href:String(p['CTA URL'] || '/start-project').replace('https://afluma.com','') || '/start-project' } })
  if (h2s.length > 1) blocks.push({ blockType:'bentoGrid', heading:'What this page covers', intro:'Each section is editable, reviewable and replaceable without changing code.', theme:'light', items:h2s.slice(1,7).map((title,i)=>({title,body:'Add reviewed copy, approved media and verified evidence in the Content Studio.',iconKey:String(i+1),size:i===0?'large':'medium',link:{label:'Explore this page',href:slug === '' ? '/' : '/' + slug}})) })
  blocks.push({ blockType:'cta', eyebrow:'Next step', heading:p['Primary CTA'] || 'Start a focused conversation', body:'Share the context and outcome you are working toward.', theme:'dark', fallbackAssetPath:'/assets/visuals/purple-loop.png', alt:'', actions:[{label:p['Primary CTA'] || 'Start a project',href:String(p['CTA URL'] || '/start-project').replace('https://afluma.com','') || '/start-project',style:'primary'}] })
  return blocks
}

let created = 0, updated = 0
for (const p of source) {
  const sourceId = String(p['Page ID'])
  const sourceSlug = String(p.slug || '').trim()
  const slug = sourceSlug || 'home'
  const existing = await payload.find({ collection:'pages', limit:1, depth:0, overrideAccess:true, where:{ sourceId:{ equals:sourceId } } })
  const data: any = {
    sourceId, title:p['H1 / Page Title'], slug, pageType:pageType(String(p['Page Type'] || '')), template:template(pageType(String(p['Page Type'] || '')), sourceSlug), section:p.Section,
    summary:p['Draft Content Direction'] || p['Meta Description'], layout:defaultLayout(p), recommendedIndexable:Boolean(p.indexable),
    seo:{ title:p['SEO Title'], description:p['Meta Description'], canonicalURL:p['Final Page URL'], primaryKeyword:p['Primary Keyword'], indexing:'noindex', includeInSitemap:false, schemaType:'WebPage' },
    workflow:{ status:'needs-review', evidenceStatus:'not-required', reviewNotes:'Imported from the approved 1,669-page architecture. Review content and media before publishing.' }, _status:'draft'
  }
  if (existing.docs[0]) { await payload.update({ collection:'pages', id:existing.docs[0].id, data: { ...data, _status: 'published' },
      draft: false, overrideAccess:true, context:{skipRevalidate:true} }); updated++ }
  else { await payload.create({ collection:'pages', data: { ...data, _status: 'published' },
      draft: false, overrideAccess:true, context:{skipRevalidate:true} }); created++ }
  if ((created+updated)%100===0) console.log(`Imported ${created+updated}/${source.length}`)
}
console.log(JSON.stringify({ total:source.length, created, updated }, null, 2))
