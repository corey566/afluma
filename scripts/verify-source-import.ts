import fs from 'node:fs/promises'
import path from 'node:path'

import config from '@payload-config'
import { getPayload } from 'payload'

type ExpectedCounts = {
  pages: number
  sourceTemplates: number
  assets: number
}

const readArrayLength = async (name: string): Promise<number> => {
  const filePath = path.join(process.cwd(), 'source-fidelity', 'catalog', name)
  const value = JSON.parse(await fs.readFile(filePath, 'utf8')) as unknown

  if (!Array.isArray(value)) {
    throw new Error(`${name} is not a JSON array.`)
  }

  return value.length
}

const run = async (): Promise<void> => {
  const expected: ExpectedCounts = {
    pages: 1669,
    sourceTemplates: await readArrayLength('source-pages.json'),
    assets: await readArrayLength('media-assets.json'),
  }

  const payload = await getPayload({ config })

  const [pages, templates, assets] = await Promise.all([
    payload.find({
      collection: 'pages',
      limit: 1,
      depth: 0,
      overrideAccess: true,
    }),
    payload.find({
      collection: 'source-templates',
      limit: 1,
      depth: 0,
      overrideAccess: true,
    }),
    payload.find({
      collection: 'asset-library',
      limit: 1,
      depth: 0,
      overrideAccess: true,
    }),
  ])

  const actual = {
    pages: pages.totalDocs,
    sourceTemplates: templates.totalDocs,
    assets: assets.totalDocs,
  }

  console.log(JSON.stringify({ expected, actual }, null, 2))

  if (actual.pages < expected.pages) {
    throw new Error(`Expected at least ${expected.pages} pages, found ${actual.pages}.`)
  }

  if (actual.sourceTemplates < expected.sourceTemplates) {
    throw new Error(
      `Expected at least ${expected.sourceTemplates} source templates, found ${actual.sourceTemplates}.`,
    )
  }

  if (actual.assets < expected.assets) {
    throw new Error(`Expected at least ${expected.assets} media records, found ${actual.assets}.`)
  }
}

run()
  .then(() => {
    console.log('SOURCE IMPORT DATABASE VERIFICATION PASSED')
    process.exit(0)
  })
  .catch((error: unknown) => {
    console.error(error)
    process.exit(1)
  })
