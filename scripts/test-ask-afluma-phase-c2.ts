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


  for (
    const rawLine of
    fs
      .readFileSync(
        filePath,
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


console.log(
  '============================================================',
)

console.log(
  ' ASK AFLUMA - PHASE C2 V2 END-TO-END TEST',
)

console.log(
  '============================================================',
)


if (
  process.env.ASK_AFLUMA_ENABLED ===
    'true'
) {

  throw new Error(
    'Public Ask Afluma must remain disabled.',
  )

}


const apiKey =
  process.env.GROQ_API_KEY
    ?.trim() ??
  ''


if (!apiKey) {

  throw new Error(
    'GROQ_API_KEY is not configured.',
  )

}


const model =
  process.env
    .ASK_AFLUMA_MODEL
    ?.trim() ||
  'openai/gpt-oss-20b'


if (
  model !==
    'openai/gpt-oss-20b'
) {

  throw new Error(
    `Unexpected model: ${model}`,
  )

}


console.log('')
console.log(
  '=== PRECHECK ===',
)

console.log(
  'Groq key: CONFIGURED (value hidden)',
)

console.log(
  `Model: ${model}`,
)

console.log(
  'Public Ask Afluma: DISABLED',
)


const [
  payloadModule,
  configModule,
  askModule,
] =
  await Promise.all([
    import('payload'),
    import('../payload.config'),
    import(
      '../src/lib/ai/ask-afluma'
    ),
  ])


const payload =
  await payloadModule.getPayload({
    config:
      configModule.default,
  })


let logicalProviderCalls =
  0


// ============================================================
// TEST 1 - COMPANY IDENTITY
// ============================================================

console.log('')
console.log(
  '=== TEST 1: COMPANY IDENTITY BOUNDARY ===',
)


const identity =
  await askModule.askAflumaFromCMS(
    payload,
    {
      question:
        'What is Afluma?',
    },
  )


if (
  identity.providerCalled
) {

  logicalProviderCalls += 1

}


console.log(
  `Raw top source: ${identity.rawRetrieval.sources[0]?.id ?? '[none]'}`,
)

console.log(
  `Provider sources: ${identity.retrieval.sources.map((source) => source.id).join(', ') || '[none]'}`,
)

console.log(
  `Provider called: ${identity.providerCalled}`,
)

console.log(
  `Status: ${identity.response.status}`,
)

console.log(
  `Confidence: ${identity.response.confidence}`,
)

console.log(
  `Returned source IDs: ${identity.response.sourceIds.join(', ') || '[none]'}`,
)

console.log('')
console.log(
  'ANSWER:',
)

console.log(
  identity.response.answer,
)


if (
  identity.rawRetrieval
    .sources[0]
    ?.id !==
      'COR-001'
) {

  throw new Error(
    'TEST 1 failed: C1.2 did not return COR-001 first.',
  )

}


const providerIds =
  identity.retrieval.sources.map(
    (source) =>
      source.id,
  )


if (
  providerIds.length < 1 ||
  providerIds.length > 2
) {

  throw new Error(
    `TEST 1 failed: unexpected company identity source count ${providerIds.length}.`,
  )

}


if (
  !providerIds.includes(
    'COR-001',
  )
) {

  throw new Error(
    'TEST 1 failed: COR-001 missing from provider context.',
  )

}


if (
  providerIds.some(
    (id) =>
      id.startsWith(
        'PRD-',
      ),
  )
) {

  throw new Error(
    'TEST 1 failed: product source entered company identity context.',
  )

}


if (
  !identity.providerCalled
) {

  throw new Error(
    'TEST 1 failed: provider was not called.',
  )

}


if (
  identity.response.status !==
    'answered'
) {

  throw new Error(
    `TEST 1 failed: expected answered, received ${identity.response.status}.`,
  )

}


if (
  identity.response.sourceIds.length ===
    0
) {

  throw new Error(
    'TEST 1 failed: answered without source IDs.',
  )

}


if (
  !identity.response.sourceIds.includes(
    'COR-001',
  ) &&
  !identity.response.sourceIds.includes(
    'COR-002',
  )
) {

  throw new Error(
    'TEST 1 failed: company identity answer cited no canonical company source.',
  )

}


if (
  identity.response.sourceIds.some(
    (id) =>
      id.startsWith(
        'PRD-',
      ),
  )
) {

  throw new Error(
    'TEST 1 failed: company identity response cited a product.',
  )

}


/*
 * Catch the exact semantic failure from C2 V1.
 */
const normalizedAnswer =
  identity.response.answer
    .toLowerCase()
    .replace(
      /\s+/g,
      ' ',
    )


if (
  /\bafluma is (?:a |an )?[^.]{0,120}unified commerce platform\b/
    .test(
      normalizedAnswer,
    )
) {

  throw new Error(
    'TEST 1 failed: Afluma company was conflated with Afluma Commerce.',
  )

}


console.log(
  'TEST 1: PASS',
)


// ============================================================
// TEST 2 - EMPTY CONTEXT, NO PROVIDER
// ============================================================

console.log('')
console.log(
  '=== TEST 2: UNSUPPORTED CERTIFICATION / NO GROQ ===',
)


const certification =
  await askModule.askAflumaFromCMS(
    payload,
    {
      question:
        'Does Afluma have ISO 27001 certification?',
    },
  )


if (
  certification.providerCalled
) {

  logicalProviderCalls += 1

}


console.log(
  `Raw sources: ${certification.rawRetrieval.sources.length}`,
)

console.log(
  `Provider sources: ${certification.retrieval.sources.length}`,
)

console.log(
  `Provider called: ${certification.providerCalled}`,
)

console.log(
  `Status: ${certification.response.status}`,
)

console.log(
  `Confidence: ${certification.response.confidence}`,
)

console.log(
  `Source IDs: ${certification.response.sourceIds.join(', ') || '[none]'}`,
)

console.log(
  `Answer: ${certification.response.answer}`,
)


if (
  certification.rawRetrieval
    .sources.length !==
      0
) {

  throw new Error(
    'TEST 2 failed: certification query unexpectedly retrieved evidence.',
  )

}


if (
  certification.providerCalled
) {

  throw new Error(
    'TEST 2 failed: provider was called with zero verified context.',
  )

}


if (
  certification.response.status !==
    'insufficient_context'
) {

  throw new Error(
    'TEST 2 failed: expected insufficient_context.',
  )

}


if (
  certification.response.confidence !==
    'low'
) {

  throw new Error(
    'TEST 2 failed: insufficient_context must be low confidence.',
  )

}


if (
  certification.response.sourceIds.length !==
    0
) {

  throw new Error(
    'TEST 2 failed: unsupported answer returned source IDs.',
  )

}


console.log(
  'TEST 2: PASS',
)


// ============================================================
// FINAL
// ============================================================

console.log('')
console.log(
  '=== FINAL C2 V2 GATES ===',
)


if (
  logicalProviderCalls !==
    1
) {

  throw new Error(
    `Expected exactly 1 logical provider call, observed ${logicalProviderCalls}.`,
  )

}


console.log(
  `Logical Groq calls: ${logicalProviderCalls}`,
)

console.log(
  'Database writes: 0',
)

console.log(
  'Public Ask Afluma: DISABLED',
)


console.log('')
console.log(
  '============================================================',
)

console.log(
  ' ASK AFLUMA PHASE C2 V2 PASSED',
)

console.log(
  '============================================================',
)


setTimeout(
  () =>
    process.exit(0),
  150,
)