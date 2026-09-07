import config from '@payload-config'
import { getPayload } from 'payload'

type PageDocument = {
  id: string | number
  slug?: string | null
  sourceId?: string | null
  title?: string | null
  _status?: string | null
}

const run = async (): Promise<void> => {
  const payload = await getPayload({ config })

  const result = await payload.find({
    collection: 'pages',
    draft: true,
    overrideAccess: true,
    depth: 0,
    limit: 2000,
  })

  const pages = result.docs as unknown as PageDocument[]

  if (pages.length !== 1669) {
    throw new Error(
      `Expected 1669 imported pages, but found ${pages.length}.`,
    )
  }

  const homepage =
    pages.find((page) => page.sourceId === 'COR-001') ||
    pages.find((page) => String(page.slug ?? '') === '') ||
    pages.find((page) => page.slug === 'home')

  if (!homepage) {
    throw new Error('The homepage record could not be identified.')
  }

  let published = 0

  for (const [index, page] of pages.entries()) {
    const data: Record<string, unknown> = {
      _status: 'published',
    }

    // The canonical database slug for the root URL is empty.
    if (page.id === homepage.id) {
      data.slug = ''
    }

    await payload.update({
      collection: 'pages',
      id: page.id,
      data: data as never,
      draft: false,
      overrideAccess: true,
      depth: 0,
      context: {
        skipRevalidate: true,
      },
    })

    published += 1

    if ((index + 1) % 100 === 0 || index + 1 === pages.length) {
      console.log(`Published ${index + 1}/${pages.length}`)
    }
  }

  const verification = await payload.find({
    collection: 'pages',
    draft: false,
    overrideAccess: true,
    depth: 0,
    limit: 2000,
  })

  const publishedPages =
    verification.docs as unknown as PageDocument[]

  const publishedHomepage = publishedPages.filter(
    (page) => String(page.slug ?? '') === '',
  )

  if (publishedPages.length !== 1669) {
    throw new Error(
      `Expected 1669 published pages, but found ${publishedPages.length}.`,
    )
  }

  if (publishedHomepage.length !== 1) {
    throw new Error(
      `Expected exactly one published homepage, but found ${publishedHomepage.length}.`,
    )
  }

  console.log(
    JSON.stringify(
      {
        totalImported: pages.length,
        published,
        verifiedPublished: publishedPages.length,
        homepageSlug: publishedHomepage[0]?.slug ?? '',
      },
      null,
      2,
    ),
  )

  console.log('AFLUMA PAGE PUBLICATION PASSED')
}

run()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(
      'AFLUMA PAGE PUBLICATION FAILED:',
      error instanceof Error ? error.message : error,
    )

    process.exit(1)
  })