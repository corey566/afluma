import { getPayload } from 'payload'
import config from '../payload.config'

const payload = await getPayload({ config })
const collectionSlugs = payload.config.collections.map((collection) => collection.slug)
const pagesCollection = collectionSlugs.find((slug) => slug === 'pages')

if (!pagesCollection) {
  console.error(JSON.stringify({ passed: false, error: 'The pages collection is not registered.', collectionSlugs }, null, 2))
  process.exit(1)
}

const pageCount = await payload.count({ collection: pagesCollection })
const sample = await payload.find({ collection: pagesCollection, limit: 5, depth: 0, overrideAccess: true })

const result = {
  passed: pageCount.totalDocs > 0,
  pages: pageCount.totalDocs,
  collectionSlugs,
  sample: sample.docs.map((doc: any) => ({ id: doc.id, slug: doc.slug, title: doc.title ?? doc.name ?? doc.h1 })),
}

console.log(JSON.stringify(result, null, 2))
if (!result.passed) process.exit(1)
process.exit(0)