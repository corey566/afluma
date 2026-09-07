const GROQ_ENDPOINT =
  'https://api.groq.com/openai/v1/chat/completions'


export const GROQ_TRANSPORT_LIMITS = {
  maxRetries: 3,
  attemptTimeoutMs: 8_000,
  maxRetryDelayMs: 15_000,
  maxTotalRetryDelayMs: 20_000,
} as const


export type GroqFetch =
  typeof fetch


export type GroqTransportOptions = {
  fetchFn?: GroqFetch

  sleepFn?: (
    milliseconds: number,
  ) => Promise<void>

  nowFn?: () => number

  maxRetries?: number
  attemptTimeoutMs?: number
  maxRetryDelayMs?: number
  maxTotalRetryDelayMs?: number
}


export class GroqTransportTimeoutError
  extends Error {

  readonly code =
    'GROQ_TIMEOUT'

  readonly attempts:
    number


  constructor(
    attempts: number,
  ) {

    super(
      `Groq request timed out after ${attempts} HTTP attempt${attempts === 1 ? '' : 's'}.`,
    )

    this.name =
      'GroqTransportTimeoutError'

    this.attempts =
      attempts
  }
}


export class GroqTransportNetworkError
  extends Error {

  readonly code =
    'GROQ_NETWORK_ERROR'

  readonly attempts:
    number


  constructor(
    attempts: number,
  ) {

    super(
      `Groq network request failed after ${attempts} HTTP attempt${attempts === 1 ? '' : 's'}.`,
    )

    this.name =
      'GroqTransportNetworkError'

    this.attempts =
      attempts
  }
}


function sleep(
  milliseconds: number,
): Promise<void> {

  return new Promise(
    (resolve) => {
      setTimeout(
        resolve,
        milliseconds,
      )
    },
  )
}


function boundedInteger(
  value: number,
  fallback: number,
  minimum: number,
  maximum: number,
): number {

  if (
    !Number.isFinite(
      value,
    )
  ) {
    return fallback
  }


  return Math.max(
    minimum,
    Math.min(
      maximum,
      Math.floor(
        value,
      ),
    ),
  )
}


function isRetryableStatus(
  status: number,
): boolean {

  return (
    status === 429 ||
    (
      status >= 500 &&
      status <= 599
    )
  )
}


export function parseGroqRetryAfter(
  response: Response,
  attempt: number,
  now: number,

  /*
   * Explicit : number is important because
   * GROQ_TRANSPORT_LIMITS is declared "as const".
   */
  maxRetryDelayMs: number =
    GROQ_TRANSPORT_LIMITS.maxRetryDelayMs,
): number {

  const raw =
    response.headers
      .get(
        'retry-after',
      )
      ?.trim() ??
    ''


  if (raw) {

    const seconds =
      Number(
        raw,
      )


    if (
      Number.isFinite(
        seconds,
      ) &&
      seconds >= 0
    ) {

      return Math.min(
        Math.ceil(
          seconds * 1_000,
        ) + 300,

        maxRetryDelayMs,
      )

    }


    const dateValue =
      Date.parse(
        raw,
      )


    if (
      Number.isFinite(
        dateValue,
      )
    ) {

      return Math.min(
        Math.max(
          0,
          dateValue - now,
        ) + 300,

        maxRetryDelayMs,
      )

    }

  }


  return Math.min(
    1_500 *
      Math.pow(
        2,
        attempt,
      ),

    maxRetryDelayMs,
  )
}


type FetchAttemptResult = {
  response?: Response
  timedOut: boolean
  networkError: boolean
}


async function fetchGroqAttempt(
  apiKey: string,
  body: unknown,
  fetchFn: GroqFetch,
  attemptTimeoutMs: number,
): Promise<FetchAttemptResult> {

  const controller =
    new AbortController()


  let timedOut =
    false


  const timeout =
    setTimeout(
      () => {

        timedOut =
          true

        controller.abort()

      },

      attemptTimeoutMs,
    )


  try {

    const response =
      await fetchFn(
        GROQ_ENDPOINT,
        {
          method:
            'POST',

          headers: {
            Authorization:
              `Bearer ${apiKey}`,

            'Content-Type':
              'application/json',
          },

          body:
            JSON.stringify(
              body,
            ),

          cache:
            'no-store',

          signal:
            controller.signal,
        },
      )


    return {
      response,
      timedOut: false,
      networkError: false,
    }

  }
  catch {

    if (
      timedOut ||
      controller.signal.aborted
    ) {

      return {
        timedOut: true,
        networkError: false,
      }

    }


    return {
      timedOut: false,
      networkError: true,
    }

  }
  finally {

    clearTimeout(
      timeout,
    )

  }
}


export async function postGroq(
  apiKey: string,
  body: unknown,
  options: GroqTransportOptions = {},
): Promise<Response> {

  const fetchFn =
    options.fetchFn ??
    globalThis.fetch


  const sleepFn =
    options.sleepFn ??
    sleep


  const nowFn =
    options.nowFn ??
    Date.now


  if (
    typeof fetchFn !==
    'function'
  ) {
    throw new Error(
      'Global fetch is unavailable.',
    )
  }


  const maxRetries =
    boundedInteger(
      options.maxRetries ??
        GROQ_TRANSPORT_LIMITS.maxRetries,

      GROQ_TRANSPORT_LIMITS.maxRetries,
      0,
      10,
    )


  const attemptTimeoutMs =
    boundedInteger(
      options.attemptTimeoutMs ??
        GROQ_TRANSPORT_LIMITS.attemptTimeoutMs,

      GROQ_TRANSPORT_LIMITS.attemptTimeoutMs,
      1,
      60_000,
    )


  const maxRetryDelayMs =
    boundedInteger(
      options.maxRetryDelayMs ??
        GROQ_TRANSPORT_LIMITS.maxRetryDelayMs,

      GROQ_TRANSPORT_LIMITS.maxRetryDelayMs,
      0,
      60_000,
    )


  const maxTotalRetryDelayMs =
    boundedInteger(
      options.maxTotalRetryDelayMs ??
        GROQ_TRANSPORT_LIMITS.maxTotalRetryDelayMs,

      GROQ_TRANSPORT_LIMITS.maxTotalRetryDelayMs,
      0,
      120_000,
    )


  let attemptsMade =
    0

  let totalRetryDelay =
    0

  let lastResponse:
    Response |
    null =
    null

  let lastFailure:
    'timeout' |
    'network' |
    null =
    null


  for (
    let attempt = 0;
    attempt <= maxRetries;
    attempt += 1
  ) {

    attemptsMade += 1


    const attemptResult =
      await fetchGroqAttempt(
        apiKey,
        body,
        fetchFn,
        attemptTimeoutMs,
      )


    if (
      attemptResult.response
    ) {

      lastResponse =
        attemptResult.response

      lastFailure =
        null


      if (
        !isRetryableStatus(
          lastResponse.status,
        )
      ) {

        return lastResponse

      }


      if (
        attempt === maxRetries
      ) {

        return lastResponse

      }

    }
    else {

      /*
       * Do not let a response from an earlier attempt
       * override a later network/timeout failure.
       */
      lastResponse =
        null


      lastFailure =
        attemptResult.timedOut
          ? 'timeout'
          : 'network'


      if (
        attempt === maxRetries
      ) {

        break

      }

    }


    let proposedDelay:
      number


    if (
      lastResponse
    ) {

      proposedDelay =
        parseGroqRetryAfter(
          lastResponse,
          attempt,
          nowFn(),
          maxRetryDelayMs,
        )

    }
    else {

      proposedDelay =
        Math.min(
          1_500 *
            Math.pow(
              2,
              attempt,
            ),

          maxRetryDelayMs,
        )

    }


    const remainingDelayBudget =
      Math.max(
        0,

        maxTotalRetryDelayMs -
          totalRetryDelay,
      )


    /*
     * Avoid zero-delay hammering after retry budget exhaustion.
     */
    if (
      proposedDelay > 0 &&
      remainingDelayBudget <= 0
    ) {

      break

    }


    const actualDelay =
      Math.min(
        proposedDelay,
        remainingDelayBudget,
      )


    if (
      actualDelay > 0
    ) {

      await sleepFn(
        actualDelay,
      )


      totalRetryDelay +=
        actualDelay

    }

  }


  if (
    lastResponse
  ) {

    return lastResponse

  }


  if (
    lastFailure ===
    'timeout'
  ) {

    throw new GroqTransportTimeoutError(
      attemptsMade,
    )

  }


  throw new GroqTransportNetworkError(
    attemptsMade,
  )
}