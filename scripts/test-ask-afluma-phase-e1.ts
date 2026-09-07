import fs from 'node:fs'
import path from 'node:path'


function loadEnv(
  filePath: string,
  overwrite = false,
) {

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


if (
  process.env
    .ASK_AFLUMA_ENABLED ===
      'true'
) {

  throw new Error(
    'Public Ask Afluma must remain disabled.',
  )

}


if (
  process.env
    .ASK_AFLUMA_PREVIEW_ENABLED !==
      'true'
) {

  throw new Error(
    'Local preview flag is not enabled.',
  )

}


const route =
  await import(
    '../src/app/api/ask-afluma-preview/route'
  )


console.log(
  '=== TEST 1: NON-LOCAL PREVIEW BLOCK ===',
)


const remoteResponse =
  await route.POST(
    new Request(
      'http://example.com/api/ask-afluma-preview',
      {
        method:
          'POST',

        headers: {
          'content-type':
            'application/json',
        },

        body:
          JSON.stringify({
            question:
              'What is Afluma?',
          }),
      },
    ),
  )


if (
  remoteResponse.status !==
    404
) {

  throw new Error(
    `Expected non-local preview 404, got ${remoteResponse.status}.`,
  )

}


console.log(
  'NON-LOCAL PREVIEW BLOCK: PASS',
)


console.log('')
console.log(
  '=== TEST 2: LOCAL SAFE EMPTY PATH ===',
)


const response =
  await route.POST(
    new Request(
      'http://localhost/api/ask-afluma-preview',
      {
        method:
          'POST',

        headers: {
          'content-type':
            'application/json',

          origin:
            'http://localhost',
        },

        body:
          JSON.stringify({
            question:
              'Does Afluma have ISO 27001 certification?',
          }),
      },
    ),
  )


console.log(
  `HTTP status: ${response.status}`,
)

console.log(
  `Preview header: ${response.headers.get('x-afluma-preview')}`,
)

console.log(
  `Provider called: ${response.headers.get('x-afluma-preview-provider-called')}`,
)


if (
  response.status !==
    200
) {

  throw new Error(
    `Expected preview 200, got ${response.status}.`,
  )

}


if (
  response.headers.get(
    'x-afluma-preview',
  ) !==
    '1'
) {

  throw new Error(
    'Preview marker missing.',
  )

}


if (
  response.headers.get(
    'x-afluma-preview-provider-called',
  ) !==
    '0'
) {

  throw new Error(
    'Preview safe-empty test unexpectedly called Groq.',
  )

}


if (
  response.headers.get(
    'x-afluma-private-mode',
  ) !==
    null
) {

  throw new Error(
    'Internal private-mode header leaked through preview bridge.',
  )

}


const body =
  await response.json() as {
    status?: string
    confidence?: string
    sourceIds?: unknown[]
  }


if (
  body.status !==
    'insufficient_context'
) {

  throw new Error(
    `Expected insufficient_context, got ${body.status}.`,
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


console.log(
  'LOCAL SAFE EMPTY PATH: PASS',
)

console.log('')
console.log(
  '==============================================',
)

console.log(
  ' ASK AFLUMA PHASE E1 PREVIEW TEST PASSED',
)

console.log(
  '==============================================',
)

console.log(
  'Public AI: DISABLED',
)

console.log(
  'Preview: LOCAL DEVELOPMENT ONLY',
)

console.log(
  'Internal token exposed: NO',
)

console.log(
  'Real Groq calls: 0',
)

console.log(
  'Database writes: 0',
)


setTimeout(
  () =>
    process.exit(0),
  100,
)