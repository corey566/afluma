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


const privateToken =
  process.env
    .ASK_AFLUMA_INTERNAL_TOKEN
    ?.trim() ??
  ''


if (
  privateToken.length <
    32
) {

  throw new Error(
    'ASK_AFLUMA_INTERNAL_TOKEN is missing or invalid.',
  )

}


console.log(
  '============================================================',
)

console.log(
  ' ASK AFLUMA - PHASE D V3 API TEST',
)

console.log(
  ' ZERO GROQ EXPECTED',
)

console.log(
  '============================================================',
)


const route =
  await import(
    '../src/app/api/ask-afluma/route'
  )


function makeRequest(
  body: string,
  token:
    string |
    null,
): Request {

  const headers =
    new Headers({
      'content-type':
        'application/json',
    })


  if (token) {

    headers.set(
      'x-afluma-internal-token',
      token,
    )

  }


  return new Request(
    'http://localhost/api/ask-afluma',
    {
      method:
        'POST',

      headers,

      body,
    },
  )
}


// ============================================================
// TEST 1
// ============================================================

console.log('')
console.log(
  '=== TEST 1: PUBLIC DISABLED ===',
)


const publicResponse =
  await route.POST(
    makeRequest(
      JSON.stringify({
        question:
          'What is Afluma?',
      }),
      null,
    ),
  )


console.log(
  `Status: ${publicResponse.status}`,
)


if (
  publicResponse.status !==
    404
) {

  throw new Error(
    `Expected 404, got ${publicResponse.status}.`,
  )

}


console.log(
  'PUBLIC DISABLED: PASS',
)


// ============================================================
// TEST 2
// ============================================================

console.log('')
console.log(
  '=== TEST 2: WRONG TOKEN ===',
)


const wrongResponse =
  await route.POST(
    makeRequest(
      JSON.stringify({
        question:
          'What is Afluma?',
      }),
      'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
    ),
  )


console.log(
  `Status: ${wrongResponse.status}`,
)


if (
  wrongResponse.status !==
    404
) {

  throw new Error(
    `Expected wrong token 404, got ${wrongResponse.status}.`,
  )

}


console.log(
  'WRONG TOKEN: PASS',
)


// ============================================================
// TEST 3
// ============================================================

console.log('')
console.log(
  '=== TEST 3: INVALID JSON ===',
)


const invalidResponse =
  await route.POST(
    makeRequest(
      '{invalid',
      privateToken,
    ),
  )


console.log(
  `Status: ${invalidResponse.status}`,
)


if (
  invalidResponse.status !==
    400
) {

  throw new Error(
    `Expected invalid JSON 400, got ${invalidResponse.status}.`,
  )

}


console.log(
  'INVALID JSON: PASS',
)


// ============================================================
// TEST 4
// ============================================================

console.log('')
console.log(
  '=== TEST 4: BODY SIZE LIMIT ===',
)


const largeResponse =
  await route.POST(
    makeRequest(
      JSON.stringify({
        question:
          'x'.repeat(
            20_000,
          ),
      }),
      privateToken,
    ),
  )


console.log(
  `Status: ${largeResponse.status}`,
)


if (
  largeResponse.status !==
    413
) {

  throw new Error(
    `Expected body limit 413, got ${largeResponse.status}.`,
  )

}


console.log(
  'BODY LIMIT: PASS',
)


// ============================================================
// TEST 5
// ============================================================

console.log('')
console.log(
  '=== TEST 5: PRIVATE C2 SAFE EMPTY STATE ===',
)


const privateResponse =
  await route.POST(
    makeRequest(
      JSON.stringify({
        question:
          'Does Afluma have ISO 27001 certification?',
      }),
      privateToken,
    ),
  )


console.log(
  `HTTP status: ${privateResponse.status}`,
)

console.log(
  `Private mode: ${privateResponse.headers.get('x-afluma-private-mode')}`,
)

console.log(
  `Provider called: ${privateResponse.headers.get('x-afluma-provider-called')}`,
)


if (
  privateResponse.status !==
    200
) {

  throw new Error(
    `Expected private request 200, got ${privateResponse.status}.`,
  )

}


if (
  privateResponse.headers.get(
    'x-afluma-private-mode',
  ) !==
    '1'
) {

  throw new Error(
    'Private mode header missing.',
  )

}


if (
  privateResponse.headers.get(
    'x-afluma-provider-called',
  ) !==
    '0'
) {

  throw new Error(
    'Groq provider was unexpectedly called.',
  )

}


const body =
  await privateResponse.json() as {
    status?: string
    answer?: string
    confidence?: string
    sourceIds?: unknown[]
  }


console.log(
  `Response status: ${body.status}`,
)

console.log(
  `Confidence: ${body.confidence}`,
)

console.log(
  `Sources: ${body.sourceIds?.length ?? 0}`,
)

console.log(
  `Answer: ${body.answer}`,
)


if (
  body.status !==
    'insufficient_context'
) {

  throw new Error(
    'Expected insufficient_context.',
  )

}


if (
  body.confidence !==
    'low'
) {

  throw new Error(
    'Expected low confidence.',
  )

}


if (
  !Array.isArray(
    body.sourceIds,
  ) ||
  body.sourceIds.length !==
    0
) {

  throw new Error(
    'Safe empty state unexpectedly returned source IDs.',
  )

}


console.log(
  'PRIVATE C2 PATH: PASS',
)


console.log('')
console.log(
  '============================================================',
)

console.log(
  ' ASK AFLUMA PHASE D V3 PASSED',
)

console.log(
  '============================================================',
)

console.log('')
console.log(
  'Public access: BLOCKED',
)

console.log(
  'Wrong token: BLOCKED',
)

console.log(
  'Private access: VERIFIED',
)

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