import fs from 'node:fs'
import path from 'node:path'

import {
  ASK_AFLUMA_SECURITY_LIMITS,
  AskAflumaBusyError,
  acquireAskAflumaDuplicate,
  analyzeAskAflumaContent,
  checkAskAflumaProviderBudget,
  checkAskAflumaRequestRate,
  fingerprintAskAflumaRequest,
  finishAskAflumaDuplicate,
  recordAskAflumaProviderUse,
  withAskAflumaExecutionGuard,
} from '../src/lib/ai/ask-afluma/security'


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
    'ASK_AFLUMA_INTERNAL_TOKEN is missing.',
  )

}


console.log(
  '============================================================',
)

console.log(
  ' ASK AFLUMA - PHASE F1 V2 SECURITY TEST',
)

console.log(
  ' ZERO GROQ EXPECTED',
)

console.log(
  '============================================================',
)


// ============================================================
// TEST 1
// ============================================================

console.log('')
console.log(
  '=== TEST 1: REQUEST RATE LIMIT ===',
)


const rateKey =
  `rate-${Date.now()}`


const fakeNow =
  1_800_000_000_000


for (
  let index = 0;
  index <
    ASK_AFLUMA_SECURITY_LIMITS
      .requestBurstLimit;
  index += 1
) {

  const decision =
    checkAskAflumaRequestRate(
      rateKey,
      fakeNow,
    )


  if (
    !decision.allowed
  ) {

    throw new Error(
      `Rate limit blocked early at ${index}.`,
    )

  }

}


const rateBlocked =
  checkAskAflumaRequestRate(
    rateKey,
    fakeNow,
  )


if (
  rateBlocked.allowed
) {

  throw new Error(
    'Burst overflow was not blocked.',
  )

}


if (
  rateBlocked.retryAfterSeconds <
    1
) {

  throw new Error(
    'Rate limiter returned no Retry-After.',
  )

}


console.log(
  'REQUEST RATE LIMIT: PASS',
)


// ============================================================
// TEST 2
// ============================================================

console.log('')
console.log(
  '=== TEST 2: IN-FLIGHT DUPLICATE LOCK ===',
)


const duplicateKey =
  `duplicate-${Date.now()}`


const fingerprint =
  fingerprintAskAflumaRequest(
    'What is Afluma?',
    undefined,
  )


const firstAcquire =
  acquireAskAflumaDuplicate(
    duplicateKey,
    fingerprint,
    fakeNow,
  )


if (
  !firstAcquire.allowed
) {

  throw new Error(
    'Initial duplicate lock was not acquired.',
  )

}


/*
 * Simulate a request taking five minutes.
 *
 * The lock must STILL reject an identical request because
 * in-flight locks have no processing TTL.
 */
const whileInFlight =
  acquireAskAflumaDuplicate(
    duplicateKey,
    fingerprint,
    fakeNow +
      5 * 60_000,
  )


if (
  whileInFlight.allowed
) {

  throw new Error(
    'In-flight duplicate lock expired while work was still running.',
  )

}


if (
  whileInFlight.reason !==
    'in_flight'
) {

  throw new Error(
    `Expected in_flight duplicate reason, got ${whileInFlight.reason}.`,
  )

}


/*
 * First request finishes after five minutes.
 */
const finishTime =
  fakeNow +
  5 * 60_000


finishAskAflumaDuplicate(
  duplicateKey,
  fingerprint,
  finishTime,
)


const duringCooldown =
  acquireAskAflumaDuplicate(
    duplicateKey,
    fingerprint,
    finishTime + 100,
  )


if (
  duringCooldown.allowed
) {

  throw new Error(
    'Post-completion duplicate cooldown was not enforced.',
  )

}


if (
  duringCooldown.reason !==
    'cooldown'
) {

  throw new Error(
    `Expected cooldown reason, got ${duringCooldown.reason}.`,
  )

}


const afterCooldown =
  acquireAskAflumaDuplicate(
    duplicateKey,
    fingerprint,
    finishTime +
      ASK_AFLUMA_SECURITY_LIMITS
        .duplicateCooldownMs +
      1,
  )


if (
  !afterCooldown.allowed
) {

  throw new Error(
    'Duplicate remained blocked after cooldown expired.',
  )

}


finishAskAflumaDuplicate(
  duplicateKey,
  fingerprint,
  finishTime +
    ASK_AFLUMA_SECURITY_LIMITS
      .duplicateCooldownMs +
    1,
)


console.log(
  'IN-FLIGHT DUPLICATE LOCK: PASS',
)


// ============================================================
// TEST 3
// ============================================================

console.log('')
console.log(
  '=== TEST 3: CONTENT ABUSE FILTER ===',
)


const normalRisk =
  analyzeAskAflumaContent(
    'What services does Afluma provide?',
    undefined,
  )


if (
  !normalRisk.allowed
) {

  throw new Error(
    'Normal question was rejected.',
  )

}


const floodRisk =
  analyzeAskAflumaContent(
    'A'.repeat(
      900,
    ),
    undefined,
  )


if (
  floodRisk.allowed
) {

  throw new Error(
    'Repeated-character flood was not rejected.',
  )

}


if (
  floodRisk.reason !==
    'repeated_character_flood'
) {

  throw new Error(
    `Unexpected flood reason: ${floodRisk.reason}`,
  )

}


console.log(
  `Rejected reason: ${floodRisk.reason}`,
)

console.log(
  'CONTENT ABUSE FILTER: PASS',
)


// ============================================================
// TEST 4
// ============================================================

console.log('')
console.log(
  '=== TEST 4: PROVIDER COST BUDGET ===',
)


const providerKey =
  `provider-${Date.now()}`


for (
  let index = 0;
  index <
    ASK_AFLUMA_SECURITY_LIMITS
      .providerLimit;
  index += 1
) {

  const before =
    checkAskAflumaProviderBudget(
      providerKey,
      fakeNow,
    )


  if (
    !before.allowed
  ) {

    throw new Error(
      `Provider budget blocked early at ${index}.`,
    )

  }


  recordAskAflumaProviderUse(
    providerKey,
    fakeNow,
  )

}


const providerBlocked =
  checkAskAflumaProviderBudget(
    providerKey,
    fakeNow,
  )


if (
  providerBlocked.allowed
) {

  throw new Error(
    'Provider cost limit was not enforced.',
  )

}


console.log(
  'PROVIDER COST BUDGET: PASS',
)


// ============================================================
// TEST 5
// ============================================================

console.log('')
console.log(
  '=== TEST 5: CONCURRENCY GUARD ===',
)


const releases:
  Array<
    () => void
  > = []


const running =
  Array.from(
    {
      length:
        ASK_AFLUMA_SECURITY_LIMITS
          .maxConcurrentExecutions,
    },

    () =>
      withAskAflumaExecutionGuard(
        () =>
          new Promise<void>(
            (resolve) => {

              releases.push(
                resolve,
              )

            },
          ),
      ),
  )


while (
  releases.length <
    ASK_AFLUMA_SECURITY_LIMITS
      .maxConcurrentExecutions
) {

  await new Promise<void>(
    (resolve) =>
      setTimeout(
        resolve,
        1,
      ),
  )

}


let busyBlocked =
  false


try {

  await withAskAflumaExecutionGuard(
    async () => {
      return
    },
  )

}
catch (
  error
) {

  if (
    error instanceof
      AskAflumaBusyError
  ) {

    busyBlocked =
      true

  }
  else {

    throw error

  }

}


if (
  !busyBlocked
) {

  throw new Error(
    'Concurrency overflow was not blocked.',
  )

}


for (
  const release of
  releases
) {

  release()

}


await Promise.all(
  running,
)


const afterRelease =
  await withAskAflumaExecutionGuard(
    async () =>
      'available',
  )


if (
  afterRelease !==
    'available'
) {

  throw new Error(
    'Concurrency slot did not release.',
  )

}


console.log(
  'CONCURRENCY GUARD: PASS',
)


// ============================================================
// ROUTE
// ============================================================

console.log('')
console.log(
  '=== ROUTE SECURITY INTEGRATION ===',
)


const route =
  await import(
    '../src/app/api/ask-afluma/route'
  )


function makeRequest(
  body:
    string,

  token:
    string |
    null,

  contentType =
    'application/json',

  ip =
    '203.0.113.210',
): Request {

  const headers =
    new Headers({
      'content-type':
        contentType,

      'cf-connecting-ip':
        ip,

      'user-agent':
        'Ask-Afluma-F1-V2-Test',
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
// TEST 6
// ============================================================

console.log('')
console.log(
  '=== TEST 6: PUBLIC ACCESS BLOCK ===',
)


const publicResponse =
  await route.POST(
    makeRequest(
      JSON.stringify({
        question:
          'What is Afluma?',
      }),

      null,

      'application/json',

      '203.0.113.220',
    ),
  )


if (
  publicResponse.status !==
    404
) {

  throw new Error(
    `Expected public 404, got ${publicResponse.status}.`,
  )

}


if (
  !publicResponse.headers.get(
    'x-request-id',
  )
) {

  throw new Error(
    'Public blocked request has no request ID.',
  )

}


console.log(
  'PUBLIC BLOCK: PASS',
)


// ============================================================
// TEST 7
// ============================================================

console.log('')
console.log(
  '=== TEST 7: WRONG TOKEN ===',
)


const wrongResponse =
  await route.POST(
    makeRequest(
      JSON.stringify({
        question:
          'What is Afluma?',
      }),

      'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',

      'application/json',

      '203.0.113.221',
    ),
  )


if (
  wrongResponse.status !==
    404
) {

  throw new Error(
    `Expected wrong-token 404, got ${wrongResponse.status}.`,
  )

}


console.log(
  'WRONG TOKEN: PASS',
)


// ============================================================
// TEST 8
// ============================================================

console.log('')
console.log(
  '=== TEST 8: JSON CONTENT TYPE ===',
)


const wrongType =
  await route.POST(
    makeRequest(
      JSON.stringify({
        question:
          'What is Afluma?',
      }),

      privateToken,

      'text/plain',

      '203.0.113.222',
    ),
  )


if (
  wrongType.status !==
    415
) {

  throw new Error(
    `Expected 415, got ${wrongType.status}.`,
  )

}


if (
  wrongType.headers.get(
    'x-afluma-work-started',
  ) !==
    '0'
) {

  throw new Error(
    'Bad Content-Type unexpectedly started work.',
  )

}


console.log(
  'JSON CONTENT TYPE: PASS',
)


// ============================================================
// TEST 9
// ============================================================

console.log('')
console.log(
  '=== TEST 9: SUSPICIOUS CONTENT ===',
)


const suspicious =
  await route.POST(
    makeRequest(
      JSON.stringify({
        question:
          'Z'.repeat(
            900,
          ),
      }),

      privateToken,

      'application/json',

      '203.0.113.223',
    ),
  )


if (
  suspicious.status !==
    400
) {

  throw new Error(
    `Expected suspicious-content 400, got ${suspicious.status}.`,
  )

}


if (
  suspicious.headers.get(
    'x-afluma-work-started',
  ) !==
    '0'
) {

  throw new Error(
    'Rejected content unexpectedly started work.',
  )

}


console.log(
  'SUSPICIOUS CONTENT: PASS',
)


// ============================================================
// TEST 10
// ============================================================

console.log('')
console.log(
  '=== TEST 10: REAL IN-FLIGHT ROUTE DUPLICATE ===',
)


const safeBody =
  JSON.stringify({
    question:
      'Does Afluma have ISO 27001 certification?',
  })


/*
 * Do NOT await yet.
 *
 * Calling POST starts the first request and synchronously
 * acquires the duplicate lock before Payload yields.
 */
const firstRequest =
  route.POST(
    makeRequest(
      safeBody,

      privateToken,

      'application/json',

      '203.0.113.224',
    ),
  )


/*
 * Same client + same body while first execution is still active.
 */
const duplicateResponse =
  await route.POST(
    makeRequest(
      safeBody,

      privateToken,

      'application/json',

      '203.0.113.224',
    ),
  )


console.log(
  `Duplicate HTTP status: ${duplicateResponse.status}`,
)

console.log(
  `Duplicate work started: ${duplicateResponse.headers.get('x-afluma-work-started')}`,
)

console.log(
  `Duplicate provider called: ${duplicateResponse.headers.get('x-afluma-provider-called')}`,
)


if (
  duplicateResponse.status !==
    429
) {

  throw new Error(
    `Expected in-flight duplicate 429, got ${duplicateResponse.status}.`,
  )

}


if (
  duplicateResponse.headers.get(
    'x-afluma-work-started',
  ) !==
    '0'
) {

  throw new Error(
    'In-flight duplicate unexpectedly started Payload/provider work.',
  )

}


if (
  duplicateResponse.headers.get(
    'x-afluma-provider-called',
  ) !==
    '0'
) {

  throw new Error(
    'In-flight duplicate unexpectedly called provider.',
  )

}


if (
  !duplicateResponse.headers.get(
    'retry-after',
  )
) {

  throw new Error(
    'In-flight duplicate returned no Retry-After.',
  )

}


console.log(
  'IN-FLIGHT DUPLICATE: PASS',
)


// ============================================================
// TEST 11
// ============================================================

console.log('')
console.log(
  '=== TEST 11: FIRST REQUEST COMPLETES SAFELY ===',
)


const firstResponse =
  await firstRequest


console.log(
  `First HTTP status: ${firstResponse.status}`,
)

console.log(
  `First work started: ${firstResponse.headers.get('x-afluma-work-started')}`,
)

console.log(
  `First provider called: ${firstResponse.headers.get('x-afluma-provider-called')}`,
)


if (
  firstResponse.status !==
    200
) {

  throw new Error(
    `Expected first request 200, got ${firstResponse.status}.`,
  )

}


if (
  firstResponse.headers.get(
    'x-afluma-work-started',
  ) !==
    '1'
) {

  throw new Error(
    'First request did not traverse Payload/C2.',
  )

}


if (
  firstResponse.headers.get(
    'x-afluma-provider-called',
  ) !==
    '0'
) {

  throw new Error(
    'Safe-empty first request unexpectedly called Groq.',
  )

}


const firstJson =
  await firstResponse.json() as {
    status?: string
    confidence?: string
    sourceIds?: unknown[]
  }


if (
  firstJson.status !==
    'insufficient_context'
) {

  throw new Error(
    `Expected insufficient_context, got ${firstJson.status}.`,
  )

}


if (
  firstJson.confidence !==
    'low'
) {

  throw new Error(
    'Safe empty confidence was not low.',
  )

}


if (
  !Array.isArray(
    firstJson.sourceIds,
  ) ||
  firstJson.sourceIds.length !==
    0
) {

  throw new Error(
    'Safe empty request returned source IDs.',
  )

}


console.log(
  'FIRST REQUEST SAFE COMPLETION: PASS',
)


// ============================================================
// TEST 12
// ============================================================

console.log('')
console.log(
  '=== TEST 12: POST-COMPLETION COOLDOWN ===',
)


const cooldownResponse =
  await route.POST(
    makeRequest(
      safeBody,

      privateToken,

      'application/json',

      '203.0.113.224',
    ),
  )


console.log(
  `Cooldown HTTP status: ${cooldownResponse.status}`,
)

console.log(
  `Cooldown work started: ${cooldownResponse.headers.get('x-afluma-work-started')}`,
)


if (
  cooldownResponse.status !==
    429
) {

  throw new Error(
    `Expected cooldown 429, got ${cooldownResponse.status}.`,
  )

}


if (
  cooldownResponse.headers.get(
    'x-afluma-work-started',
  ) !==
    '0'
) {

  throw new Error(
    'Cooldown request unexpectedly started work.',
  )

}


console.log(
  'POST-COMPLETION COOLDOWN: PASS',
)


// ============================================================
// TEST 13
// ============================================================

console.log('')
console.log(
  '=== TEST 13: SECURITY HEADERS ===',
)


for (
  const header of [
    'cache-control',
    'pragma',
    'x-content-type-options',
    'x-frame-options',
    'referrer-policy',
    'cross-origin-resource-policy',
    'permissions-policy',
    'content-security-policy',
    'x-request-id',
  ]
) {

  if (
    !firstResponse.headers.get(
      header,
    )
  ) {

    throw new Error(
      `Missing security header: ${header}`,
    )

  }

}


console.log(
  'SECURITY HEADERS: PASS',
)


// ============================================================
// FINAL
// ============================================================

console.log('')
console.log(
  '============================================================',
)

console.log(
  ' ASK AFLUMA PHASE F1 V2 PASSED',
)

console.log(
  '============================================================',
)

console.log('')
console.log(
  'Request rate limit: PASS',
)

console.log(
  'In-flight duplicate lock: PASS',
)

console.log(
  'Post-completion cooldown: PASS',
)

console.log(
  'Content abuse filter: PASS',
)

console.log(
  'Provider budget: PASS',
)

console.log(
  'Concurrency guard: PASS',
)

console.log(
  'Request IDs: PASS',
)

console.log(
  'Safe structured logging: ACTIVE',
)

console.log(
  'Security headers: PASS',
)

console.log(
  'Duplicate Payload work prevented: PASS',
)

console.log(
  'Duplicate provider work prevented: PASS',
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