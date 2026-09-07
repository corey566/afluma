import {
  GROQ_TRANSPORT_LIMITS,
  GroqTransportNetworkError,
  GroqTransportTimeoutError,
  parseGroqRetryAfter,
  postGroq,
} from '../src/lib/ai/ask-afluma/groqTransport'


console.log(
  '============================================================',
)

console.log(
  ' ASK AFLUMA - PHASE F2 V2 TRANSPORT TEST',
)

console.log(
  ' MOCK FETCH ONLY / ZERO REAL GROQ',
)

console.log(
  '============================================================',
)


const key =
  'never-sent-test-key'


const body = {
  model:
    'mock',

  messages:
    [],
}


function makeResponse(
  status: number,
  headers:
    Record<string, string> = {},
): Response {

  return new Response(
    JSON.stringify({
      status,
    }),
    {
      status,
      headers,
    },
  )
}


// ============================================================
// 1. SUCCESS
// ============================================================

console.log('')
console.log(
  '=== TEST 1: SUCCESS ===',
)


let successCalls =
  0


const successFetch =
  (async () => {

    successCalls += 1

    return makeResponse(
      200,
    )

  }) as typeof fetch


const success =
  await postGroq(
    key,
    body,
    {
      fetchFn:
        successFetch,

      sleepFn:
        async () => {
          throw new Error(
            'Successful request unexpectedly retried.',
          )
        },
    },
  )


if (
  success.status !== 200 ||
  successCalls !== 1
) {
  throw new Error(
    'Success test failed.',
  )
}


console.log(
  'SUCCESS: PASS',
)


// ============================================================
// 2. 400 NO RETRY
// ============================================================

console.log('')
console.log(
  '=== TEST 2: NORMAL 400 / NO RETRY ===',
)


let clientErrorCalls =
  0


const clientErrorFetch =
  (async () => {

    clientErrorCalls += 1

    return makeResponse(
      400,
    )

  }) as typeof fetch


const clientError =
  await postGroq(
    key,
    body,
    {
      fetchFn:
        clientErrorFetch,

      sleepFn:
        async () => {
          throw new Error(
            'HTTP 400 unexpectedly retried.',
          )
        },
    },
  )


if (
  clientError.status !== 400 ||
  clientErrorCalls !== 1
) {
  throw new Error(
    'HTTP 400 retry policy failed.',
  )
}


console.log(
  'NORMAL 400 / NO RETRY: PASS',
)


// ============================================================
// 3. 429
// ============================================================

console.log('')
console.log(
  '=== TEST 3: 429 RETRY ===',
)


let rateCalls =
  0


const rateSleeps:
  number[] = []


const rateFetch =
  (async () => {

    rateCalls += 1


    if (
      rateCalls === 1
    ) {

      return makeResponse(
        429,
        {
          'retry-after':
            '2',
        },
      )

    }


    return makeResponse(
      200,
    )

  }) as typeof fetch


const rateResult =
  await postGroq(
    key,
    body,
    {
      fetchFn:
        rateFetch,

      sleepFn:
        async (
          milliseconds,
        ) => {

          rateSleeps.push(
            milliseconds,
          )

        },
    },
  )


if (
  rateResult.status !== 200 ||
  rateCalls !== 2 ||
  rateSleeps.length !== 1 ||
  rateSleeps[0] !== 2_300
) {

  throw new Error(
    '429 retry test failed.',
  )

}


console.log(
  '429 RETRY: PASS',
)


// ============================================================
// 4. HTTP-DATE RETRY-AFTER
// ============================================================

console.log('')
console.log(
  '=== TEST 4: HTTP-DATE RETRY-AFTER ===',
)


const now =
  Date.parse(
    '2030-01-01T00:00:00Z',
  )


const dateDelay =
  parseGroqRetryAfter(
    makeResponse(
      429,
      {
        'retry-after':
          new Date(
            now + 5_000,
          ).toUTCString(),
      },
    ),

    0,
    now,
  )


if (
  dateDelay !== 5_300
) {

  throw new Error(
    `Expected 5300ms, got ${dateDelay}.`,
  )

}


console.log(
  'HTTP-DATE RETRY-AFTER: PASS',
)


// ============================================================
// 5. 5xx
// ============================================================

console.log('')
console.log(
  '=== TEST 5: 5xx RETRIES ===',
)


let serverCalls =
  0


const serverFetch =
  (async () => {

    serverCalls += 1


    if (
      serverCalls === 1
    ) {
      return makeResponse(
        503,
      )
    }


    if (
      serverCalls === 2
    ) {
      return makeResponse(
        502,
      )
    }


    return makeResponse(
      200,
    )

  }) as typeof fetch


const serverResult =
  await postGroq(
    key,
    body,
    {
      fetchFn:
        serverFetch,

      sleepFn:
        async () => {
          return
        },
    },
  )


if (
  serverResult.status !== 200 ||
  serverCalls !== 3
) {

  throw new Error(
    '5xx retry test failed.',
  )

}


console.log(
  '5xx RETRIES: PASS',
)


// ============================================================
// 6. NETWORK RETRY
// ============================================================

console.log('')
console.log(
  '=== TEST 6: NETWORK RETRY ===',
)


let networkCalls =
  0


const networkFetch =
  (async () => {

    networkCalls += 1


    if (
      networkCalls < 3
    ) {

      throw new TypeError(
        'simulated network failure',
      )

    }


    return makeResponse(
      200,
    )

  }) as typeof fetch


const networkResult =
  await postGroq(
    key,
    body,
    {
      fetchFn:
        networkFetch,

      sleepFn:
        async () => {
          return
        },
    },
  )


if (
  networkResult.status !== 200 ||
  networkCalls !== 3
) {

  throw new Error(
    'Network retry recovery failed.',
  )

}


console.log(
  'NETWORK RETRY: PASS',
)


// ============================================================
// 7. RETRY CEILING
// ============================================================

console.log('')
console.log(
  '=== TEST 7: MAX RETRY CEILING ===',
)


let ceilingCalls =
  0


const ceilingFetch =
  (async () => {

    ceilingCalls += 1

    return makeResponse(
      503,
    )

  }) as typeof fetch


const ceiling =
  await postGroq(
    key,
    body,
    {
      fetchFn:
        ceilingFetch,

      sleepFn:
        async () => {
          return
        },
    },
  )


const expectedAttempts =
  GROQ_TRANSPORT_LIMITS.maxRetries +
  1


if (
  ceilingCalls !== expectedAttempts ||
  ceiling.status !== 503
) {

  throw new Error(
    `Retry ceiling failed. calls=${ceilingCalls}`,
  )

}


console.log(
  `HTTP attempts: ${ceilingCalls}`,
)

console.log(
  'MAX RETRY CEILING: PASS',
)


// ============================================================
// 8. TOTAL DELAY BUDGET
// ============================================================

console.log('')
console.log(
  '=== TEST 8: TOTAL RETRY DELAY BUDGET ===',
)


const sleeps:
  number[] = []


const budgetFetch =
  (async () =>
    makeResponse(
      429,
      {
        'retry-after':
          '100',
      },
    )
  ) as typeof fetch


await postGroq(
  key,
  body,
  {
    fetchFn:
      budgetFetch,

    sleepFn:
      async (
        milliseconds,
      ) => {

        sleeps.push(
          milliseconds,
        )

      },

    maxRetries:
      6,

    maxRetryDelayMs:
      15_000,

    maxTotalRetryDelayMs:
      20_000,
  },
)


const totalSleep =
  sleeps.reduce(
    (
      sum,
      value,
    ) =>
      sum + value,

    0,
  )


if (
  totalSleep !== 20_000
) {

  throw new Error(
    `Expected 20000ms total retry delay, got ${totalSleep}.`,
  )

}


console.log(
  `Total simulated retry sleep: ${totalSleep}ms`,
)

console.log(
  'TOTAL RETRY DELAY BUDGET: PASS',
)


// ============================================================
// 9. REAL ABORT SIGNAL
// ============================================================

console.log('')
console.log(
  '=== TEST 9: ABORTABLE FETCH TIMEOUT ===',
)


let timeoutCalls =
  0


let actualAborts =
  0


const timeoutFetch =
  ((
    _input:
      Parameters<typeof fetch>[0],

    init?:
      Parameters<typeof fetch>[1],
  ) => {

    timeoutCalls += 1


    return new Promise<Response>(
      (
        _resolve,
        reject,
      ) => {

        const signal =
          init?.signal


        if (!signal) {

          reject(
            new Error(
              'Fetch had no AbortSignal.',
            ),
          )

          return

        }


        signal.addEventListener(
          'abort',

          () => {

            actualAborts += 1


            reject(
              new DOMException(
                'Aborted',
                'AbortError',
              ),
            )

          },

          {
            once:
              true,
          },
        )

      },
    )

  }) as typeof fetch


let timeoutError:
  unknown =
  null


try {

  await postGroq(
    key,
    body,
    {
      fetchFn:
        timeoutFetch,

      /*
       * No actual retry waiting during test,
       * but keep a positive budget so retry #2 is permitted.
       */
      sleepFn:
        async () => {
          return
        },

      attemptTimeoutMs:
        20,

      maxRetries:
        1,

      maxTotalRetryDelayMs:
        5_000,
    },
  )

}
catch (
  error
) {

  timeoutError =
    error

}


if (
  !(
    timeoutError instanceof
      GroqTransportTimeoutError
  )
) {

  throw new Error(
    'Timeout was not classified correctly.',
  )

}


if (
  timeoutCalls !== 2 ||
  actualAborts !== 2
) {

  throw new Error(
    `Expected 2 attempts/aborts, got calls=${timeoutCalls}, aborts=${actualAborts}.`,
  )

}


console.log(
  `HTTP attempts: ${timeoutCalls}`,
)

console.log(
  `Actual aborts: ${actualAborts}`,
)

console.log(
  'ABORTABLE FETCH TIMEOUT: PASS',
)


// ============================================================
// 10. NETWORK EXHAUSTION
// ============================================================

console.log('')
console.log(
  '=== TEST 10: NETWORK FAILURE EXHAUSTION ===',
)


let failedCalls =
  0


const failedFetch =
  (async () => {

    failedCalls += 1


    throw new TypeError(
      'offline',
    )

  }) as typeof fetch


let failedError:
  unknown =
  null


try {

  await postGroq(
    key,
    body,
    {
      fetchFn:
        failedFetch,

      sleepFn:
        async () => {
          return
        },

      maxRetries:
        2,
    },
  )

}
catch (
  error
) {

  failedError =
    error

}


if (
  !(
    failedError instanceof
      GroqTransportNetworkError
  )
) {

  throw new Error(
    'Network exhaustion classification failed.',
  )

}


if (
  failedCalls !== 3
) {

  throw new Error(
    `Expected 3 attempts, got ${failedCalls}.`,
  )

}


console.log(
  'NETWORK FAILURE EXHAUSTION: PASS',
)


// ============================================================
// 11. REQUEST SHAPE
// ============================================================

console.log('')
console.log(
  '=== TEST 11: REQUEST SHAPE ===',
)


let authorization:
  string |
  null =
  null


let sentBody =
  ''


let hasSignal =
  false


const shapeFetch =
  (async (
    _input,
    init,
  ) => {

    const headers =
      new Headers(
        init?.headers,
      )


    authorization =
      headers.get(
        'authorization',
      )


    sentBody =
      typeof init?.body ===
        'string'
        ? init.body
        : ''


    hasSignal =
      Boolean(
        init?.signal,
      )


    return makeResponse(
      200,
    )

  }) as typeof fetch


await postGroq(
  key,
  body,
  {
    fetchFn:
      shapeFetch,
  },
)


if (
  authorization !==
    `Bearer ${key}`
) {

  throw new Error(
    'Authorization header changed.',
  )

}


if (
  sentBody !==
    JSON.stringify(
      body,
    )
) {

  throw new Error(
    'JSON body changed.',
  )

}


if (!hasSignal) {

  throw new Error(
    'AbortSignal missing from request.',
  )

}


console.log(
  'REQUEST SHAPE: PASS',
)


console.log('')
console.log(
  '============================================================',
)

console.log(
  ' ASK AFLUMA PHASE F2 V2 TRANSPORT PASSED',
)

console.log(
  '============================================================',
)

console.log('')
console.log(
  'Success behavior: PASS',
)

console.log(
  'Normal 4xx no retry: PASS',
)

console.log(
  '429 handling: PASS',
)

console.log(
  'HTTP-date Retry-After: PASS',
)

console.log(
  '5xx handling: PASS',
)

console.log(
  'Network retry: PASS',
)

console.log(
  'Retry ceiling: PASS',
)

console.log(
  'Retry delay budget: PASS',
)

console.log(
  'AbortController timeout: PASS',
)

console.log(
  'Network failure classification: PASS',
)

console.log(
  'Request shape: PASS',
)

console.log(
  'Real Groq calls: 0',
)

console.log(
  'Database writes: 0',
)

console.log(
  'Public Ask Afluma: DISABLED',
)


setTimeout(
  () =>
    process.exit(0),
  100,
)