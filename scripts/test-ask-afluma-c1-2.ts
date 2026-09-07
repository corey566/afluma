import fs from 'node:fs'
import path from 'node:path'


function loadEnv(
  filePath: string,
  overwrite = false,
): void {

  if (
    !fs.existsSync(
      filePath,
    )
  ) {
    return
  }


  const lines =
    fs
      .readFileSync(
        filePath,
        'utf8',
      )
      .split(/\r?\n/)


  for (
    const rawLine of
    lines
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


    if (
      equals <= 0
    ) {
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
    'Public Ask Afluma must remain disabled.',
  )

}


console.log(
  '============================================================',
)

console.log(
  ' ASK AFLUMA - C1.2 IDENTITY REGRESSION TEST',
)

console.log(
  ' ZERO DATABASE WRITES / ZERO GROQ',
)

console.log(
  '============================================================',
)


const [
  payloadModule,
  configModule,
  retrievalModule,
] =
  await Promise.all([
    import('payload'),
    import('../payload.config'),
    import(
      '../src/lib/ai/ask-afluma/retrieval'
    ),
  ])


const payload =
  await payloadModule.getPayload({
    config:
      configModule.default,
  })


type TestCase = {
  question: string
  expected: string
}


const identityCases:
  TestCase[] = [

    {
      question:
        'Afluma',

      expected:
        'COR-001',
    },

    {
      question:
        'What is Afluma?',

      expected:
        'COR-001',
    },

    {
      question:
        'Who is Afluma?',

      expected:
        'COR-001',
    },

    {
      question:
        'Tell me about Afluma',

      expected:
        'COR-001',
    },

    {
      question:
        'Explain Afluma',

      expected:
        'COR-001',
    },

    {
      question:
        'Describe Afluma',

      expected:
        'COR-001',
    },

    {
      question:
        'What does Afluma do?',

      expected:
        'COR-001',
    },
  ]


console.log('')
console.log(
  '=== COMPANY IDENTITY TESTS ===',
)


for (
  const testCase of
  identityCases
) {

  const result =
    await retrievalModule
      .retrieveAflumaKnowledge(
        payload,
        testCase.question,
      )


  const top =
    result.sources[0]


  console.log('')
  console.log(
    `QUERY: ${testCase.question}`,
  )

  console.log(
    `Selected sources: ${result.sources.length}`,
  )

  console.log(
    `Top ID: ${top?.id ?? '[none]'}`,
  )

  console.log(
    `Top title: ${top?.title ?? '[none]'}`,
  )

  console.log(
    `Top score: ${top?.score ?? 0}`,
  )


  console.log(
    'Top 5:',
  )


  for (
    const source of
    result.sources.slice(
      0,
      5,
    )
  ) {

    console.log(
      `  ${source.id} | ${source.score} | ${source.title}`,
    )

  }


  if (
    top?.id !==
      testCase.expected
  ) {

    throw new Error(
      `Identity regression failed for "${testCase.question}". Expected ${testCase.expected}, received ${top?.id ?? '[none]'}.`,
    )

  }


  const firstTwo =
    result.sources.slice(
      0,
      2,
    )


  if (
    firstTwo.some(
      (source) =>
        source.id.startsWith(
          'PRD-',
        ),
    )
  ) {

    throw new Error(
      `Identity regression failed for "${testCase.question}": a product appears in the top two identity sources.`,
    )

  }


  console.log(
    'RESULT: PASS',
  )

}


// ============================================================
// PRODUCT INTENT REGRESSION
// ============================================================

console.log('')
console.log(
  '=== AFLUMA COMMERCE PRODUCT REGRESSION ===',
)


const commerce =
  await retrievalModule
    .retrieveAflumaKnowledge(
      payload,
      'Tell me about Afluma Commerce',
    )


console.log(
  `Top ID: ${commerce.sources[0]?.id ?? '[none]'}`,
)

console.log(
  `Top title: ${commerce.sources[0]?.title ?? '[none]'}`,
)


if (
  commerce.sources[0]?.id !==
    'PRD-001'
) {

  throw new Error(
    `Afluma Commerce regression failed. Expected PRD-001, received ${commerce.sources[0]?.id ?? '[none]'}.`,
  )

}


console.log(
  'AFLUMA COMMERCE: PASS',
)


// ============================================================
// SERENOPS REGRESSION
// ============================================================

console.log('')
console.log(
  '=== SERENOPS PRODUCT REGRESSION ===',
)


const serenOps =
  await retrievalModule
    .retrieveAflumaKnowledge(
      payload,
      'What is SerenOps?',
    )


console.log(
  `Top ID: ${serenOps.sources[0]?.id ?? '[none]'}`,
)

console.log(
  `Top title: ${serenOps.sources[0]?.title ?? '[none]'}`,
)


if (
  serenOps.sources[0]?.id !==
    'PRD-002'
) {

  throw new Error(
    `SerenOps regression failed. Expected PRD-002, received ${serenOps.sources[0]?.id ?? '[none]'}.`,
  )

}


console.log(
  'SERENOPS: PASS',
)


// ============================================================
// CERTIFICATION SAFETY REGRESSION
// ============================================================

console.log('')
console.log(
  '=== CERTIFICATION SAFETY REGRESSION ===',
)


const certification =
  await retrievalModule
    .retrieveAflumaKnowledge(
      payload,
      'Does Afluma have ISO 27001 certification?',
    )


console.log(
  `Selected sources: ${certification.sources.length}`,
)


if (
  certification.sources.length !==
    0
) {

  console.log(
    'Unexpected sources:',
  )

  for (
    const source of
    certification.sources
  ) {

    console.log(
      `  ${source.id} | ${source.score} | ${source.title}`,
    )

  }


  throw new Error(
    'Certification safety regression failed. Expected zero sources.',
  )

}


console.log(
  'CERTIFICATION SAFETY: PASS',
)


// ============================================================
// POS / RETAIL REGRESSION
// ============================================================

console.log('')
console.log(
  '=== POS / RETAIL REGRESSION ===',
)


const pos =
  await retrievalModule
    .retrieveAflumaKnowledge(
      payload,
      'POS inventory ecommerce retail',
    )


console.log(
  `Selected sources: ${pos.sources.length}`,
)

console.log(
  `Top ID: ${pos.sources[0]?.id ?? '[none]'}`,
)


if (
  pos.sources.length ===
    0
) {

  throw new Error(
    'POS regression failed: no sources selected.',
  )

}


const posIds =
  new Set(
    pos.sources.map(
      (source) =>
        source.id,
    ),
  )


if (
  !posIds.has(
    'PRD-001',
  )
) {

  throw new Error(
    'POS regression failed: PRD-001 Afluma Commerce was not present in the selected source set.',
  )

}


console.log(
  'POS / RETAIL: PASS',
)


// ============================================================
// FINAL
// ============================================================

console.log('')
console.log(
  '============================================================',
)

console.log(
  ' ASK AFLUMA C1.2 V2 PASSED',
)

console.log(
  '============================================================',
)

console.log('')
console.log(
  'Database writes: 0',
)

console.log(
  'Groq calls: 0',
)

console.log(
  'Public Ask Afluma: DISABLED',
)


setTimeout(
  () =>
    process.exit(0),
  150,
)