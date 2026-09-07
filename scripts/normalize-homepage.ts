import config from '@payload-config'
import { getPayload } from 'payload'

const run = async (): Promise<void> => {
  const payload = await getPayload({ config })

  const result = await payload.find({
    collection: 'pages',
    draft: true,
    overrideAccess: true,
    depth: 0,
    limit: 10,
    where: {
      sourceId: {
        equals: 'COR-001',
      },
    },
  })

  if (result.docs.length !== 1) {
    throw new Error(
      `Expected exactly one COR-001 homepage record, found ${result.docs.length}.`,
    )
  }

  const homepage = result.docs[0]

  await payload.update({
    collection: 'pages',
    id: homepage.id,
    draft: false,
    overrideAccess: true,
    depth: 0,
    data: {
      slug: 'home',
      _status: 'published',
    },
    context: {
      skipRevalidate: true,
    },
  })

  const verification = await payload.find({
    collection: 'pages',
    draft: false,
    overrideAccess: true,
    depth: 0,
    limit: 10,
    where: {
      and: [
        {
          sourceId: {
            equals: 'COR-001',
          },
        },
        {
          slug: {
            equals: 'home',
          },
        },
      ],
    },
  })

  if (verification.docs.length !== 1) {
    throw new Error(
      `Homepage verification failed. Found ${verification.docs.length} matching records.`,
    )
  }

  console.log(
    JSON.stringify(
      {
        id: verification.docs[0].id,
        sourceId: verification.docs[0].sourceId,
        slug: verification.docs[0].slug,
        status: verification.docs[0]._status,
      },
      null,
      2,
    ),
  )

  console.log('AFLUMA HOMEPAGE DATABASE REPAIR PASSED')
}

run()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(
      'AFLUMA HOMEPAGE DATABASE REPAIR FAILED:',
      error instanceof Error ? error.message : error,
    )

    process.exit(1)
  })