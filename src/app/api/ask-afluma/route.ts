import {
  timingSafeEqual,
} from 'node:crypto'

import {
  getPayload,
} from 'payload'

import config from '../../../../payload.config'

import {
  askAflumaFromCMS,
} from '../../../lib/ai/ask-afluma'

import type {
  AskAflumaMessage,
} from '../../../lib/ai/ask-afluma'

import {
  AskAflumaBusyError,
  acquireAskAflumaDuplicate,
  analyzeAskAflumaContent,
  auditAskAfluma,
  checkAskAflumaProviderBudget,
  checkAskAflumaRequestRate,
  createAskAflumaRequestId,
  fingerprintAskAflumaRequest,
  finishAskAflumaDuplicate,
  getAskAflumaClientHash,
  getAskAflumaClientKey,
  recordAskAflumaProviderUse,
  withAskAflumaExecutionGuard,
} from '../../../lib/ai/ask-afluma/security'


export const runtime =
  'nodejs'


const MAX_BODY_BYTES =
  16 * 1024

const MAX_QUESTION_LENGTH =
  4_000

const MAX_HISTORY_MESSAGES =
  8

const MAX_HISTORY_MESSAGE_LENGTH =
  2_500


type JsonRecord =
  Record<string, unknown>


type AccessState = {
  allowed: boolean
  internal: boolean
}


function jsonResponse(
  body:
    unknown,

  status:
    number,

  requestId:
    string,

  extraHeaders:
    Record<string, string> = {},
): Response {

  return Response.json(
    body,
    {
      status,

      headers: {
        'Cache-Control':
          'no-store, max-age=0',

        'Pragma':
          'no-cache',

        'X-Content-Type-Options':
          'nosniff',

        'X-Frame-Options':
          'DENY',

        'Referrer-Policy':
          'no-referrer',

        'Cross-Origin-Resource-Policy':
          'same-origin',

        'Permissions-Policy':
          'camera=(), microphone=(), geolocation=()',

        'Content-Security-Policy':
          "default-src 'none'; frame-ancestors 'none'",

        'X-Request-ID':
          requestId,

        ...extraHeaders,
      },
    },
  )
}


function secureEqual(
  left:
    string,

  right:
    string,
): boolean {

  const leftBuffer =
    Buffer.from(
      left,
      'utf8',
    )


  const rightBuffer =
    Buffer.from(
      right,
      'utf8',
    )


  if (
    leftBuffer.length !==
      rightBuffer.length
  ) {

    return false

  }


  return timingSafeEqual(
    leftBuffer,
    rightBuffer,
  )
}


function accessState(
  request:
    Request,
): AccessState {

  const publiclyEnabled =
    process.env
      .ASK_AFLUMA_ENABLED
      ?.trim()
      .toLowerCase() ===
        'true'


  if (publiclyEnabled) {

    return {
      allowed:
        true,

      internal:
        false,
    }

  }


  const expectedToken =
    process.env
      .ASK_AFLUMA_INTERNAL_TOKEN
      ?.trim() ??
    ''


  const suppliedToken =
    request.headers
      .get(
        'x-afluma-internal-token',
      )
      ?.trim() ??
    ''


  if (
    expectedToken.length >=
      32 &&
    suppliedToken.length >=
      32 &&
    secureEqual(
      suppliedToken,
      expectedToken,
    )
  ) {

    return {
      allowed:
        true,

      internal:
        true,
    }

  }


  return {
    allowed:
      false,

    internal:
      false,
  }
}


function isRecord(
  value:
    unknown,
): value is JsonRecord {

  return (
    typeof value ===
      'object' &&
    value !==
      null &&
    !Array.isArray(
      value,
    )
  )
}


function parseHistory(
  value:
    unknown,
):
  AskAflumaMessage[] |
  undefined {

  if (
    value ===
      undefined
  ) {

    return undefined

  }


  if (
    !Array.isArray(
      value,
    )
  ) {

    throw new Error(
      'history must be an array.',
    )

  }


  if (
    value.length >
      MAX_HISTORY_MESSAGES
  ) {

    throw new Error(
      `history may contain at most ${MAX_HISTORY_MESSAGES} messages.`,
    )

  }


  return value.map(
    (
      item,
      index,
    ) => {

      if (
        !isRecord(
          item,
        )
      ) {

        throw new Error(
          `history[${index}] must be an object.`,
        )

      }


      if (
        item.role !==
          'user' &&
        item.role !==
          'assistant'
      ) {

        throw new Error(
          `history[${index}].role is invalid.`,
        )

      }


      if (
        typeof item.content !==
          'string'
      ) {

        throw new Error(
          `history[${index}].content must be a string.`,
        )

      }


      const content =
        item.content
          .replace(
            /\u0000/g,
            '',
          )
          .trim()


      if (!content) {

        throw new Error(
          `history[${index}].content is empty.`,
        )

      }


      if (
        content.length >
          MAX_HISTORY_MESSAGE_LENGTH
      ) {

        throw new Error(
          `history[${index}].content is too long.`,
        )

      }


      return {
        role:
          item.role,

        content,
      }

    },
  )
}


function parseRequestBody(
  value:
    unknown,
): {
  question: string
  history?: AskAflumaMessage[]
} {

  if (
    !isRecord(
      value,
    )
  ) {

    throw new Error(
      'Request body must be a JSON object.',
    )

  }


  if (
    typeof value.question !==
      'string'
  ) {

    throw new Error(
      'question must be a string.',
    )

  }


  const question =
    value.question
      .replace(
        /\u0000/g,
        '',
      )
      .trim()


  if (!question) {

    throw new Error(
      'question is required.',
    )

  }


  if (
    question.length >
      MAX_QUESTION_LENGTH
  ) {

    throw new Error(
      `question may contain at most ${MAX_QUESTION_LENGTH} characters.`,
    )

  }


  const history =
    parseHistory(
      value.history,
    )


  return {
    question,
    history,
  }
}


function internalDebugHeaders(
  access:
    AccessState,

  workStarted:
    boolean,

  providerCalled:
    boolean |
    null = null,
): Record<string, string> {

  const headers:
    Record<string, string> = {}


  if (
    !access.internal
  ) {

    return headers

  }


  headers[
    'X-Afluma-Private-Mode'
  ] =
    '1'


  headers[
    'X-Afluma-Work-Started'
  ] =
    workStarted
      ? '1'
      : '0'


  if (
    providerCalled !==
      null
  ) {

    headers[
      'X-Afluma-Provider-Called'
    ] =
      providerCalled
        ? '1'
        : '0'

  }


  return headers
}


export async function POST(
  request:
    Request,
): Promise<Response> {

  const startedAt =
    Date.now()


  const requestId =
    createAskAflumaRequestId()


  const clientKey =
    getAskAflumaClientKey(
      request,
    )


  const clientHash =
    getAskAflumaClientHash(
      clientKey,
    )


  const access =
    accessState(
      request,
    )


  const accessMode:
    'public' |
    'internal' |
    'blocked' =
    access.allowed
      ? (
          access.internal
            ? 'internal'
            : 'public'
        )
      : 'blocked'


  const respond =
    (
      body:
        unknown,

      status:
        number,

      outcome:
        string,

      providerCalled:
        boolean |
        null,

      extraHeaders:
        Record<string, string> = {},
    ): Response => {

      auditAskAfluma({
        requestId,

        clientHash,

        accessMode,

        outcome,

        httpStatus:
          status,

        providerCalled,

        durationMs:
          Date.now() -
          startedAt,
      })


      return jsonResponse(
        body,
        status,
        requestId,
        extraHeaders,
      )
    }


  if (
    !access.allowed
  ) {

    return respond(
      {
        error:
          'Not found.',
      },

      404,

      'access_denied',

      null,
    )

  }


  const requestRate =
    checkAskAflumaRequestRate(
      clientKey,
    )


  const rateHeaders:
    Record<string, string> = {

    'X-Afluma-RateLimit-Remaining':
      String(
        requestRate.remaining,
      ),
  }


  if (
    !requestRate.allowed
  ) {

    return respond(
      {
        error:
          'Too many requests.',
      },

      429,

      'request_rate_limited',

      false,

      {
        ...rateHeaders,

        'Retry-After':
          String(
            requestRate.retryAfterSeconds,
          ),

        ...internalDebugHeaders(
          access,
          false,
          false,
        ),
      },
    )

  }


  const contentType =
    request.headers
      .get(
        'content-type',
      )
      ?.toLowerCase() ??
    ''


  if (
    !contentType.includes(
      'application/json',
    )
  ) {

    return respond(
      {
        error:
          'Content-Type must be application/json.',
      },

      415,

      'unsupported_media_type',

      false,

      {
        ...rateHeaders,

        ...internalDebugHeaders(
          access,
          false,
          false,
        ),
      },
    )

  }


  const contentLength =
    request.headers.get(
      'content-length',
    )


  if (contentLength) {

    const declaredLength =
      Number(
        contentLength,
      )


    if (
      Number.isFinite(
        declaredLength,
      ) &&
      declaredLength >
        MAX_BODY_BYTES
    ) {

      return respond(
        {
          error:
            'Request body is too large.',
        },

        413,

        'body_too_large',

        false,

        {
          ...rateHeaders,

          ...internalDebugHeaders(
            access,
            false,
            false,
          ),
        },
      )

    }

  }


  let rawBody:
    string


  try {

    rawBody =
      await request.text()

  }
  catch {

    return respond(
      {
        error:
          'Unable to read request body.',
      },

      400,

      'body_read_failed',

      false,

      {
        ...rateHeaders,

        ...internalDebugHeaders(
          access,
          false,
          false,
        ),
      },
    )

  }


  if (
    Buffer.byteLength(
      rawBody,
      'utf8',
    ) >
      MAX_BODY_BYTES
  ) {

    return respond(
      {
        error:
          'Request body is too large.',
      },

      413,

      'body_too_large',

      false,

      {
        ...rateHeaders,

        ...internalDebugHeaders(
          access,
          false,
          false,
        ),
      },
    )

  }


  let parsed:
    unknown


  try {

    parsed =
      JSON.parse(
        rawBody,
      )

  }
  catch {

    return respond(
      {
        error:
          'Invalid JSON.',
      },

      400,

      'invalid_json',

      false,

      {
        ...rateHeaders,

        ...internalDebugHeaders(
          access,
          false,
          false,
        ),
      },
    )

  }


  let input:
    {
      question: string
      history?: AskAflumaMessage[]
    }


  try {

    input =
      parseRequestBody(
        parsed,
      )

  }
  catch (
    error
  ) {

    const message =
      error instanceof Error
        ? error.message
        : 'Invalid request.'


    return respond(
      {
        error:
          message,
      },

      400,

      'invalid_input',

      false,

      {
        ...rateHeaders,

        ...internalDebugHeaders(
          access,
          false,
          false,
        ),
      },
    )

  }


  const risk =
    analyzeAskAflumaContent(
      input.question,
      input.history,
    )


  if (
    !risk.allowed
  ) {

    return respond(
      {
        error:
          'Request content was rejected.',
      },

      400,

      `content_rejected:${risk.reason ?? 'unknown'}`,

      false,

      {
        ...rateHeaders,

        ...internalDebugHeaders(
          access,
          false,
          false,
        ),
      },
    )

  }


  const providerBudget =
    checkAskAflumaProviderBudget(
      clientKey,
    )


  if (
    !providerBudget.allowed
  ) {

    return respond(
      {
        error:
          'AI request allowance temporarily reached.',
      },

      429,

      'provider_budget_limited',

      false,

      {
        ...rateHeaders,

        'Retry-After':
          String(
            providerBudget.retryAfterSeconds,
          ),

        'X-Afluma-Provider-Budget-Remaining':
          '0',

        ...internalDebugHeaders(
          access,
          false,
          false,
        ),
      },
    )

  }


  const fingerprint =
    fingerprintAskAflumaRequest(
      input.question,
      input.history,
    )


  /*
   * Critical F1 V2 change:
   *
   * this lock remains active for the entire CMS/provider
   * execution regardless of how long the work takes.
   */
  const duplicate =
    acquireAskAflumaDuplicate(
      clientKey,
      fingerprint,
    )


  if (
    !duplicate.allowed
  ) {

    return respond(
      {
        error:
          duplicate.reason ===
            'in_flight'
            ? 'An identical request is already processing.'
            : 'Duplicate request received too quickly.',
      },

      429,

      duplicate.reason ===
        'in_flight'
        ? 'duplicate_in_flight'
        : 'duplicate_cooldown',

      false,

      {
        ...rateHeaders,

        'Retry-After':
          String(
            duplicate.retryAfterSeconds,
          ),

        ...internalDebugHeaders(
          access,
          false,
          false,
        ),
      },
    )

  }


  /*
   * From here onward we own the fingerprint lock.
   *
   * The finally block MUST always convert it to the
   * post-completion cooldown.
   */
  try {

    try {

      const result =
        await withAskAflumaExecutionGuard(
          async () => {

            const payload =
              await getPayload({
                config,
              })


            return askAflumaFromCMS(
              payload,
              input,
            )

          },
        )


      if (
        result.providerCalled
      ) {

        recordAskAflumaProviderUse(
          clientKey,
        )

      }


      const responseHeaders:
        Record<string, string> = {

        ...rateHeaders,

        'X-Afluma-Provider-Budget-Remaining':
          String(
            Math.max(
              0,

              providerBudget.remaining -
                (
                  result.providerCalled
                    ? 1
                    : 0
                ),
            ),
          ),

        ...internalDebugHeaders(
          access,
          true,
          result.providerCalled,
        ),
      }


      return respond(
        result.response,

        200,

        result.providerCalled
          ? 'answered_with_provider'
          : 'answered_without_provider',

        result.providerCalled,

        responseHeaders,
      )

    }
    catch (
      error
    ) {

      if (
        error instanceof
          AskAflumaBusyError
      ) {

        return respond(
          {
            error:
              'Ask Afluma is busy. Please retry shortly.',
          },

          503,

          'concurrency_limited',

          false,

          {
            ...rateHeaders,

            'Retry-After':
              String(
                error.retryAfterSeconds,
              ),

            ...internalDebugHeaders(
              access,
              false,
              false,
            ),
          },
        )

      }


      console.error(
        JSON.stringify({
          event:
            'ask_afluma_server_error',

          requestId,

          clientHash,

          errorType:
            error instanceof Error
              ? error.name
              : 'UnknownError',
        }),
      )


      return respond(
        {
          error:
            'Ask Afluma is temporarily unavailable.',
        },

        503,

        'server_error',

        null,

        {
          ...rateHeaders,

          ...internalDebugHeaders(
            access,
            true,
            null,
          ),
        },
      )

    }

  }
  finally {

    finishAskAflumaDuplicate(
      clientKey,
      fingerprint,
    )

  }
}