import {
  createHash,
  createHmac,
  randomUUID,
} from 'node:crypto'


export const ASK_AFLUMA_SECURITY_LIMITS = {

  requestBurstLimit:
    12,

  requestBurstWindowMs:
    60_000,

  requestSustainedLimit:
    60,

  requestSustainedWindowMs:
    10 * 60_000,

  providerLimit:
    8,

  providerWindowMs:
    10 * 60_000,

  duplicateCooldownMs:
    2_500,

  maxConcurrentExecutions:
    4,

} as const


type EventStore =
  Map<string, number[]>


type DuplicateEntry = {
  inFlight: boolean
  expiresAt: number
}


const requestEvents:
  EventStore =
  new Map()


const providerEvents:
  EventStore =
  new Map()


const duplicateEntries =
  new Map<
    string,
    DuplicateEntry
  >()


let activeExecutions =
  0


export type AskAflumaRateDecision = {
  allowed: boolean
  remaining: number
  retryAfterSeconds: number
}


export type AskAflumaDuplicateDecision =
  AskAflumaRateDecision & {
    reason:
      'allowed' |
      'in_flight' |
      'cooldown'
  }


export type AskAflumaRiskDecision = {
  allowed: boolean
  reason: string | null
}


export type AskAflumaAuditEvent = {
  requestId: string

  clientHash: string

  accessMode:
    'public' |
    'internal' |
    'blocked'

  outcome: string

  httpStatus: number

  providerCalled:
    boolean |
    null

  durationMs: number
}


export class AskAflumaBusyError
  extends Error {

  readonly retryAfterSeconds:
    number


  constructor(
    retryAfterSeconds =
      2,
  ) {

    super(
      'Ask Afluma is busy.',
    )

    this.name =
      'AskAflumaBusyError'

    this.retryAfterSeconds =
      retryAfterSeconds
  }
}


function cleanHeader(
  value:
    string |
    null,
): string {

  return (
    value ??
    ''
  )
    .replace(
      /[\r\n]/g,
      '',
    )
    .trim()
    .slice(
      0,
      256,
    )
}


export function createAskAflumaRequestId():
  string {

  return randomUUID()
}


export function getAskAflumaClientKey(
  request:
    Request,
): string {

  const cloudflare =
    cleanHeader(
      request.headers.get(
        'cf-connecting-ip',
      ),
    )


  if (cloudflare) {

    return `ip:${cloudflare}`

  }


  const realIp =
    cleanHeader(
      request.headers.get(
        'x-real-ip',
      ),
    )


  if (realIp) {

    return `ip:${realIp}`

  }


  const forwarded =
    cleanHeader(
      request.headers.get(
        'x-forwarded-for',
      ),
    )


  if (forwarded) {

    const first =
      forwarded
        .split(
          ',',
        )[0]
        ?.trim()
        .slice(
          0,
          128,
        )


    if (first) {

      return `ip:${first}`

    }

  }


  const userAgent =
    cleanHeader(
      request.headers.get(
        'user-agent',
      ),
    )


  const language =
    cleanHeader(
      request.headers.get(
        'accept-language',
      ),
    )


  const fallback =
    createHash(
      'sha256',
    )
      .update(
        `${userAgent}|${language}`,
      )
      .digest(
        'hex',
      )
      .slice(
        0,
        24,
      )


  return `fallback:${fallback}`
}


export function getAskAflumaClientHash(
  clientKey:
    string,
): string {

  const secret =
    process.env
      .ASK_AFLUMA_LOG_SALT
      ?.trim() ||
    process.env
      .PAYLOAD_SECRET
      ?.trim() ||
    process.env
      .ASK_AFLUMA_INTERNAL_TOKEN
      ?.trim() ||
    'ask-afluma-local'


  return createHmac(
    'sha256',
    secret,
  )
    .update(
      clientKey,
    )
    .digest(
      'hex',
    )
    .slice(
      0,
      20,
    )
}


function pruneEvents(
  events:
    number[],

  minimumTime:
    number,
): number[] {

  return events.filter(
    (timestamp) =>
      timestamp >=
        minimumTime,
  )
}


function retryAfterForWindow(
  events:
    number[],

  now:
    number,

  windowMs:
    number,
): number {

  const oldest =
    events[0]


  if (
    oldest ===
      undefined
  ) {

    return 1

  }


  return Math.max(
    1,

    Math.ceil(
      (
        oldest +
        windowMs -
        now
      ) /
      1_000,
    ),
  )
}


export function checkAskAflumaRequestRate(
  clientKey:
    string,

  now =
    Date.now(),
): AskAflumaRateDecision {

  const previous =
    requestEvents.get(
      clientKey,
    ) ??
    []


  const sustained =
    pruneEvents(
      previous,

      now -
        ASK_AFLUMA_SECURITY_LIMITS
          .requestSustainedWindowMs,
    )


  const burst =
    sustained.filter(
      (timestamp) =>
        timestamp >=
        now -
          ASK_AFLUMA_SECURITY_LIMITS
            .requestBurstWindowMs,
    )


  if (
    burst.length >=
      ASK_AFLUMA_SECURITY_LIMITS
        .requestBurstLimit
  ) {

    requestEvents.set(
      clientKey,
      sustained,
    )


    return {
      allowed:
        false,

      remaining:
        0,

      retryAfterSeconds:
        retryAfterForWindow(
          burst,
          now,
          ASK_AFLUMA_SECURITY_LIMITS
            .requestBurstWindowMs,
        ),
    }

  }


  if (
    sustained.length >=
      ASK_AFLUMA_SECURITY_LIMITS
        .requestSustainedLimit
  ) {

    requestEvents.set(
      clientKey,
      sustained,
    )


    return {
      allowed:
        false,

      remaining:
        0,

      retryAfterSeconds:
        retryAfterForWindow(
          sustained,
          now,
          ASK_AFLUMA_SECURITY_LIMITS
            .requestSustainedWindowMs,
        ),
    }

  }


  sustained.push(
    now,
  )


  requestEvents.set(
    clientKey,
    sustained,
  )


  const burstRemaining =
    ASK_AFLUMA_SECURITY_LIMITS
      .requestBurstLimit -
    (
      burst.length +
      1
    )


  const sustainedRemaining =
    ASK_AFLUMA_SECURITY_LIMITS
      .requestSustainedLimit -
    sustained.length


  return {
    allowed:
      true,

    remaining:
      Math.max(
        0,

        Math.min(
          burstRemaining,
          sustainedRemaining,
        ),
      ),

    retryAfterSeconds:
      0,
  }
}


export function checkAskAflumaProviderBudget(
  clientKey:
    string,

  now =
    Date.now(),
): AskAflumaRateDecision {

  const events =
    pruneEvents(
      providerEvents.get(
        clientKey,
      ) ??
        [],

      now -
        ASK_AFLUMA_SECURITY_LIMITS
          .providerWindowMs,
    )


  providerEvents.set(
    clientKey,
    events,
  )


  if (
    events.length >=
      ASK_AFLUMA_SECURITY_LIMITS
        .providerLimit
  ) {

    return {
      allowed:
        false,

      remaining:
        0,

      retryAfterSeconds:
        retryAfterForWindow(
          events,
          now,
          ASK_AFLUMA_SECURITY_LIMITS
            .providerWindowMs,
        ),
    }

  }


  return {
    allowed:
      true,

    remaining:
      ASK_AFLUMA_SECURITY_LIMITS
        .providerLimit -
      events.length,

    retryAfterSeconds:
      0,
  }
}


export function recordAskAflumaProviderUse(
  clientKey:
    string,

  now =
    Date.now(),
): void {

  const events =
    pruneEvents(
      providerEvents.get(
        clientKey,
      ) ??
        [],

      now -
        ASK_AFLUMA_SECURITY_LIMITS
          .providerWindowMs,
    )


  events.push(
    now,
  )


  providerEvents.set(
    clientKey,
    events,
  )
}


export function fingerprintAskAflumaRequest(
  question:
    string,

  history:
    Array<{
      role: string
      content: string
    }> |
    undefined,
): string {

  return createHash(
    'sha256',
  )
    .update(
      JSON.stringify({
        question,

        history:
          history ??
          [],
      }),
    )
    .digest(
      'hex',
    )
}


function duplicateKey(
  clientKey:
    string,

  fingerprint:
    string,
): string {

  return `${clientKey}:${fingerprint}`
}


function pruneDuplicateEntries(
  now:
    number,
): void {

  if (
    duplicateEntries.size <
      500
  ) {

    return

  }


  for (
    const [
      key,
      entry,
    ] of
    duplicateEntries
  ) {

    if (
      !entry.inFlight &&
      entry.expiresAt <=
        now
    ) {

      duplicateEntries.delete(
        key,
      )

    }

  }
}


/**
 * Acquire an identity/fingerprint lock.
 *
 * Unlike a simple TTL, an in-flight lock does not expire while
 * Payload, retrieval or the AI provider is still processing.
 */
export function acquireAskAflumaDuplicate(
  clientKey:
    string,

  fingerprint:
    string,

  now =
    Date.now(),
): AskAflumaDuplicateDecision {

  pruneDuplicateEntries(
    now,
  )


  const key =
    duplicateKey(
      clientKey,
      fingerprint,
    )


  const existing =
    duplicateEntries.get(
      key,
    )


  if (existing) {

    if (
      existing.inFlight
    ) {

      return {
        allowed:
          false,

        remaining:
          0,

        retryAfterSeconds:
          Math.max(
            1,

            Math.ceil(
              ASK_AFLUMA_SECURITY_LIMITS
                .duplicateCooldownMs /
              1_000,
            ),
          ),

        reason:
          'in_flight',
      }

    }


    if (
      existing.expiresAt >
        now
    ) {

      return {
        allowed:
          false,

        remaining:
          0,

        retryAfterSeconds:
          Math.max(
            1,

            Math.ceil(
              (
                existing.expiresAt -
                now
              ) /
              1_000,
            ),
          ),

        reason:
          'cooldown',
      }

    }


    duplicateEntries.delete(
      key,
    )

  }


  duplicateEntries.set(
    key,
    {
      inFlight:
        true,

      expiresAt:
        0,
    },
  )


  return {
    allowed:
      true,

    remaining:
      1,

    retryAfterSeconds:
      0,

    reason:
      'allowed',
  }
}


/**
 * When processing finishes, convert the in-flight lock into
 * a short post-completion cooldown.
 */
export function finishAskAflumaDuplicate(
  clientKey:
    string,

  fingerprint:
    string,

  now =
    Date.now(),
): void {

  const key =
    duplicateKey(
      clientKey,
      fingerprint,
    )


  const existing =
    duplicateEntries.get(
      key,
    )


  if (!existing) {

    return

  }


  duplicateEntries.set(
    key,
    {
      inFlight:
        false,

      expiresAt:
        now +
        ASK_AFLUMA_SECURITY_LIMITS
          .duplicateCooldownMs,
    },
  )
}


export function analyzeAskAflumaContent(
  question:
    string,

  history:
    Array<{
      content: string
    }> |
    undefined,
): AskAflumaRiskDecision {

  const combined =
    [
      question,

      ...(
        history ??
        []
      ).map(
        (message) =>
          message.content,
      ),
    ]
      .join(
        '\n',
      )


  if (
    /[\u0001-\u0008\u000B\u000C\u000E-\u001F\u007F]/
      .test(
        combined,
      )
  ) {

    return {
      allowed:
        false,

      reason:
        'control_characters',
    }

  }


  const lineCount =
    combined
      .split(
        /\r?\n/,
      )
      .length


  if (
    lineCount >
      200
  ) {

    return {
      allowed:
        false,

      reason:
        'excessive_lines',
    }

  }


  const urls =
    combined.match(
      /(?:https?:\/\/|www\.)/gi,
    )


  if (
    (
      urls?.length ??
      0
    ) >
      8
  ) {

    return {
      allowed:
        false,

      reason:
        'excessive_urls',
    }

  }


  /**
   * Check obvious character floods before encoded blobs
   * so diagnostics identify the more precise reason.
   */
  if (
    /(.)\1{511,}/s
      .test(
        combined,
      )
  ) {

    return {
      allowed:
        false,

      reason:
        'repeated_character_flood',
    }

  }


  if (
    /[A-Za-z0-9+/_=-]{800,}/
      .test(
        combined,
      )
  ) {

    return {
      allowed:
        false,

      reason:
        'encoded_blob',
    }

  }


  return {
    allowed:
      true,

    reason:
      null,
  }
}


export async function withAskAflumaExecutionGuard<T>(
  operation:
    () => Promise<T>,
): Promise<T> {

  if (
    activeExecutions >=
      ASK_AFLUMA_SECURITY_LIMITS
        .maxConcurrentExecutions
  ) {

    throw new AskAflumaBusyError(
      2,
    )

  }


  activeExecutions +=
    1


  try {

    return await operation()

  }
  finally {

    activeExecutions =
      Math.max(
        0,
        activeExecutions -
          1,
      )

  }
}


export function auditAskAfluma(
  event:
    AskAflumaAuditEvent,
): void {

  /*
   * Never log:
   *
   * question
   * history
   * retrieved context
   * model answer
   * API keys
   * private token
   * raw client IP
   */
  console.info(
    JSON.stringify({
      event:
        'ask_afluma_request',

      timestamp:
        new Date()
          .toISOString(),

      requestId:
        event.requestId,

      clientHash:
        event.clientHash,

      accessMode:
        event.accessMode,

      outcome:
        event.outcome,

      httpStatus:
        event.httpStatus,

      providerCalled:
        event.providerCalled,

      durationMs:
        Math.max(
          0,

          Math.round(
            event.durationMs,
          ),
        ),
    }),
  )
}