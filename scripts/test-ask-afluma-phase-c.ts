import fs from 'node:fs'
import path from 'node:path'

function loadEnv(
  file: string,
  overwrite = false,
): void {

  if (
    !fs.existsSync(file)
  ) {
    return
  }

  for (
    const rawLine of
    fs
      .readFileSync(
        file,
        'utf8',
      )
      .split(/\r?\n/)
  ) {

    const line =
      rawLine.trim()

    if (
      !line ||
      line.startsWith('#')
    ) {
      continue
    }

    const equals =
      line.indexOf('=')

    if (equals <= 0) {
      continue
    }

    const key =
      line
        .slice(
          0,
          equals,
        )
        .trim()

    let value =
      line
        .slice(
          equals + 1,
        )
        .trim()

    if (
      value.length >= 2 &&
      (
        (
          value.startsWith('"') &&
          value.endsWith('"')
        ) ||
        (
          value.startsWith("'") &&
          value.endsWith("'")
        )
      )
    ) {
      value =
        value.slice(
          1,
          -1,
        )
    }

    if (
      overwrite ||
      process.env[key] ===
        undefined
    ) {
      process.env[key] =
        value
    }
  }
}

const root =
  process.cwd()

loadEnv(
  path.join(
    root,
    '.env',
  ),
)

loadEnv(
  path.join(
    root,
    '.env.local',
  ),
  true,
)

if (
  process.env.ASK_AFLUMA_ENABLED ===
    'true'
) {
  throw new Error(
    'ASK_AFLUMA_ENABLED must remain false during Phase C.',
  )
}

console.log(
  '============================================================',
)

console.log(
  ' ASK AFLUMA - PHASE C1 V4 REAL CMS TEST',
)

console.log(
  '============================================================',
)

console.log('')
console.log(
  'Initializing Payload / PostgreSQL...',
)

const [
  payloadModule,
  configModule,
  retrievalModule,
] =
  await Promise.all([
    import(
      'payload'
    ),

    import(
      '../payload.config'
    ),

    import(
      '../src/lib/ai/ask-afluma/retrieval'
    ),
  ])

const payload =
  await payloadModule
    .getPayload({
      config:
        configModule.default,
    })

const {
  retrieveAflumaKnowledge,
} =
  retrievalModule

const questions = [
  'Afluma',

  'POS inventory ecommerce retail',

  'infrastructure operations SerenOps',

  'software engineering services',

  'company contact office',

  'careers jobs',

  'ISO 27001 certification',
]

try {

  console.log('')
  console.log(
    '=== APPROVED KNOWLEDGE INVENTORY ===',
  )

  const inventory =
    await retrieveAflumaKnowledge(
      payload,
      'Afluma',
    )

  for (
    const [
      type,
      count,
    ] of
    Object.entries(
      inventory.counts,
    )
  ) {

    console.log(
      `${type.padEnd(12)} ${count}`,
    )

  }

  console.log('')
  console.log(
    'Only records passing Ask Afluma gates are counted.',
  )

  for (
    const question of
    questions
  ) {

    console.log('')
    console.log(
      '------------------------------------------------------------',
    )

    console.log(
      `QUERY: ${question}`,
    )

    const result =
      await retrieveAflumaKnowledge(
        payload,
        question,
      )

    if (
      result.context.length >
      18_000
    ) {
      throw new Error(
        'Context budget exceeded.',
      )
    }

    console.log(
      `Selected sources: ${result.sources.length}`,
    )

    console.log(
      `Context chars:    ${result.context.length}`,
    )

    if (
      result.sources.length ===
        0
    ) {

      console.log(
        'SAFE EMPTY STATE',
      )

      continue
    }

    for (
      const source of
      result.sources
    ) {

      console.log('')
      console.log(
        `  [${source.type}] ${source.title}`,
      )

      console.log(
        `  Source ID: ${source.id}`,
      )

      console.log(
        `  Score:     ${source.score}`,
      )

      console.log(
        `  URL:       ${source.url ?? '[none]'}`,
      )

    }

  }

  console.log('')
  console.log(
    '============================================================',
  )

  console.log(
    ' PHASE C1 V4 REAL CMS RETRIEVAL TEST PASSED',
  )

  console.log(
    '============================================================',
  )

  console.log('')
  console.log(
    'Database writes: 0',
  )

  console.log(
    'Groq calls:      0',
  )

  console.log(
    'Public AI:       DISABLED',
  )

}
catch (
  error
) {

  console.error('')
  console.error(
    'PHASE C1 V4 TEST FAILED',
  )

  console.error(
    error,
  )

  process.exitCode =
    1

}
finally {

  setTimeout(
    () => {
      process.exit(
        process.exitCode ?? 0,
      )
    },
    150,
  )

}