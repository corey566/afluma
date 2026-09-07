import fs from 'node:fs/promises'
const pages = JSON.parse(await fs.readFile('content/pages.json','utf8')) as any[]
const slugs = new Set<string>(); const errors:string[]=[]
for (const page of pages){ const slug=String(page.slug||''); if(slugs.has(slug))errors.push(`Duplicate slug: ${slug}`); slugs.add(slug); if(!page['SEO Title'])errors.push(`Missing SEO title: ${page['Page ID']}`); if(!page['Meta Description'])errors.push(`Missing meta description: ${page['Page ID']}`) }
const report={total:pages.length,uniqueSlugs:slugs.size,recommendedIndexable:pages.filter(p=>p.indexable).length,importPolicy:'All documents import as drafts/noindex until approved in CMS.',errors}
console.log(JSON.stringify(report,null,2)); if(errors.length)process.exit(1)
