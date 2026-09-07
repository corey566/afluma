import {
  postGroq,
} from './groqTransport'
import {
  ASK_AFLUMA_RESPONSE_SCHEMA,
  ASK_AFLUMA_SYSTEM_PROMPT,
} from './config'

import type {
  AskAflumaLink,
  AskAflumaMessage,
  AskAflumaProvider,
  AskAflumaRequest,
  AskAflumaResponse,
} from './types'

const MAX_QUESTION_LENGTH = 4_000
const MAX_CONTEXT_LENGTH = 32_000
const MAX_HISTORY_MESSAGES = 8
const MAX_HISTORY_MESSAGE_LENGTH = 2_500

type GroqPayload = {
  choices?: Array<{
    finish_reason?: string | null

    message?: {
      content?: string | null
      refusal?: string | null
    }
  }>
}

type AllowList = {
  sourceIds: Set<string>
  urls: Set<string>
}

function cleanText(
  value: string,
  limit: number,
): string {
  return value
    .replace(/\u0000/g, '')
    .trim()
    .slice(0, limit)
}

function sanitizeHistory(
  history:
    AskAflumaMessage[] |
    undefined,
): AskAflumaMessage[] {
  return (
    history ?? []
  )
    .slice(
      -MAX_HISTORY_MESSAGES,
    )
    .map(
      (message) => ({
        role:
          message.role,

        content:
          cleanText(
            message.content,
            MAX_HISTORY_MESSAGE_LENGTH,
          ),
      }),
    )
    .filter(
      (message) =>
        message.content.length > 0,
    )
}

function extractAllowList(
  context: string,
): AllowList {
  const sourceIds =
    new Set<string>()

  const urls =
    new Set<string>()

  const pattern =
    /\[SOURCE\s+id="([^"]+)"(?:\s+url="([^"]+)")?\]/g

  let match:
    RegExpExecArray |
    null

  while (
    (
      match =
        pattern.exec(context)
    ) !== null
  ) {
    const id =
      match[1]?.trim()

    const url =
      match[2]?.trim()

    if (id) {
      sourceIds.add(id)
    }

    if (url) {
      urls.add(url)
    }
  }

  return {
    sourceIds,
    urls,
  }
}

function validLink(
  value: unknown,
): value is AskAflumaLink {
  if (
    !value ||
    typeof value !== 'object'
  ) {
    return false
  }

  const link =
    value as
      Partial<AskAflumaLink>

  return (
    typeof link.label === 'string' &&
    link.label.trim().length > 0 &&
    typeof link.href === 'string' &&
    link.href.trim().length > 0
  )
}

function validateStructureStrict(
  value: unknown,
): AskAflumaResponse {
  if (
    !value ||
    typeof value !== 'object'
  ) {
    throw new Error(
      'Invalid Ask Afluma response.',
    )
  }

  const result =
    value as
      Partial<AskAflumaResponse>

  if (
    ![
      'answered',
      'insufficient_context',
      'handoff',
    ].includes(
      String(result.status),
    )
  ) {
    throw new Error(
      'Invalid Ask Afluma status.',
    )
  }

  if (
    typeof result.answer !== 'string'
  ) {
    throw new Error(
      'Ask Afluma answer is invalid.',
    )
  }

  const normalizedAnswer =
    result.answer.trim()

  if (!normalizedAnswer) {
    if (
      result.status ===
      'insufficient_context'
    ) {
      result.answer =
        'I do not have verified Afluma information to answer that yet.'
    }
    else {
      throw new Error(
        'Ask Afluma answer is empty.',
      )
    }
  }
  else {
    result.answer =
      normalizedAnswer
  }

  if (
    ![
      'high',
      'medium',
      'low',
    ].includes(
      String(
        result.confidence,
      ),
    )
  ) {
    throw new Error(
      'Invalid Ask Afluma confidence.',
    )
  }

  if (
    !Array.isArray(
      result.sourceIds,
    ) ||
    !result.sourceIds.every(
      (id) =>
        typeof id === 'string',
    )
  ) {
    throw new Error(
      'Invalid Ask Afluma source IDs.',
    )
  }

  if (
    !Array.isArray(
      result.recommendedLinks,
    ) ||
    !result.recommendedLinks.every(
      validLink,
    )
  ) {
    throw new Error(
      'Invalid Ask Afluma links.',
    )
  }

  if (
    ![
      'none',
      'explore',
      'start_project',
      'contact',
    ].includes(
      String(
        result.suggestedAction,
      ),
    )
  ) {
    throw new Error(
      'Invalid Ask Afluma action.',
    )
  }

  return result as
    AskAflumaResponse
}

function enforceGroundingStrict(
  result: AskAflumaResponse,
  allowList: AllowList,
): AskAflumaResponse {
  const sourceIds =
    [
      ...new Set(
        result.sourceIds
          .map(
            (id) =>
              id.trim(),
          )
          .filter(Boolean),
      ),
    ]

  for (
    const sourceId of sourceIds
  ) {
    if (
      !allowList
        .sourceIds
        .has(sourceId)
    ) {
      throw new Error(
        `Unknown Ask Afluma source ID: ${sourceId}`,
      )
    }
  }

  for (
    const link of
    result.recommendedLinks
  ) {
    if (
      !allowList
        .urls
        .has(
          link.href.trim(),
        )
    ) {
      throw new Error(
        `Unverified Ask Afluma URL: ${link.href}`,
      )
    }
  }

  if (
    result.status ===
      'answered' &&
    sourceIds.length === 0
  ) {
    throw new Error(
      'Ask Afluma answered without evidence.',
    )
  }

  if (
    result.status ===
      'insufficient_context' &&
    result.confidence !==
      'low'
  ) {
    throw new Error(
      'Insufficient context must have low confidence.',
    )
  }

  return {
    ...result,
    sourceIds,

    recommendedLinks:
      result
        .recommendedLinks
        .map(
          (link) => ({
            label:
              link.label.trim(),

            href:
              link.href.trim(),
          }),
        ),
  }
}


/*
 * ==========================================================
 * ASK AFLUMA PROVIDER RESILIENCE
 * ==========================================================
 *
 * Transport / network / HTTP failures are NOT handled here.
 * They continue to throw and remain genuine service errors.
 *
 * This layer handles only provider OUTPUT rejection:
 *
 * - malformed provider JSON
 * - invalid structured response shape
 * - unknown source IDs
 * - unknown / unapproved URLs
 * - answered responses without evidence
 * - inconsistent grounding metadata
 *
 * The rejected model output is never returned to the visitor.
 */

const PROVIDER_JSON_REJECTED =
  Symbol(
    'ask_afluma_provider_json_rejected',
  )


function providerRejectionFallback():
  AskAflumaResponse {

  return {
    status:
      'insufficient_context',

    answer:
      'I could not safely verify a grounded answer for that question. Please try rephrasing it or explore the related Afluma content.',

    confidence:
      'low',

    sourceIds:
      [],

    recommendedLinks:
      [],

    suggestedAction:
      'none',

    disclaimer:
      null,
  }
}


function logSafeProviderRejection(
  reason:
    | 'invalid_json'
    | 'invalid_structure'
    | 'grounding_rejected',
): void {

  /*
   * Never log:
   * - question text
   * - retrieved context
   * - provider response
   * - API keys
   *
   * Only the safe classification is recorded.
   */
  console.warn(
    JSON.stringify({
      event:
        'ask_afluma_provider_rejected',

      reason,
    }),
  )
}


function parseProviderJson(
  value: string,
): unknown {

  try {

    return JSON.parse(
      value,
    )

  }
  catch {

    logSafeProviderRejection(
      'invalid_json',
    )


    return PROVIDER_JSON_REJECTED

  }
}


function validateStructure(
  value: unknown,
): AskAflumaResponse {

  if (
    value ===
      PROVIDER_JSON_REJECTED
  ) {

    return providerRejectionFallback()

  }


  try {

    return validateStructureStrict(
      value,
    )

  }
  catch {

    logSafeProviderRejection(
      'invalid_structure',
    )


    return providerRejectionFallback()

  }
}


function enforceGrounding(
  result:
    AskAflumaResponse,

  allowList:
    AllowList,
): AskAflumaResponse {

  /*
   * A deterministic fallback is already safe.
   * Do not ask the strict grounding validator to
   * reinterpret it as a model-produced answer.
   */
  if (
    result.status ===
      'insufficient_context' &&
    result.confidence ===
      'low' &&
    result.sourceIds.length ===
      0 &&
    result.recommendedLinks.length ===
      0 &&
    result.answer ===
      'I could not safely verify a grounded answer for that question. Please try rephrasing it or explore the related Afluma content.'
  ) {

    return result

  }


  try {

    return enforceGroundingStrict(
      result,
      allowList,
    )

  }
  catch {

    logSafeProviderRejection(
      'grounding_rejected',
    )


    return providerRejectionFallback()

  }
}

class GroqAskAflumaProvider
  implements AskAflumaProvider
{
  async ask(
    request:
      AskAflumaRequest,
  ): Promise<AskAflumaResponse> {
    const apiKey =
      process.env
        .GROQ_API_KEY
        ?.trim()

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

    const question =
      cleanText(
        request.question,
        MAX_QUESTION_LENGTH,
      )

    const context =
      cleanText(
        request.context,
        MAX_CONTEXT_LENGTH,
      )

    if (!question) {
      throw new Error(
        'Question is empty.',
      )
    }

    const allowList =
      extractAllowList(
        context,
      )

    const history =
      sanitizeHistory(
        request.history,
      )

    const response =
      await postGroq(
        apiKey,
        {
          model,

          messages: [
            {
              role:
                'system',

              content:
                ASK_AFLUMA_SYSTEM_PROMPT,
            },

            ...history,

            {
              role:
                'user',

              content: [
                'VERIFIED AFLUMA CONTEXT',
                '=======================',
                context ||
                  '[NO VERIFIED CONTEXT AVAILABLE]',
                '',
                'END VERIFIED AFLUMA CONTEXT',
                '',
                'VISITOR QUESTION',
                '================',
                question,
                '',
                'Use only verified context.',
                'Never invent source IDs or URLs.',
              ].join('\n'),
            },
          ],

          reasoning_effort:
            'low',

          include_reasoning:
            false,

          temperature:
            0,

          /*
           * Keep this deliberately bounded.
           *
           * Ask Afluma is a website discovery assistant,
           * not a long-form essay generator.
           */
          max_completion_tokens:
            420,

          response_format: {
            type:
              'json_schema',

            json_schema: {
              name:
                'ask_afluma_response',

              strict:
                true,

              schema:
                ASK_AFLUMA_RESPONSE_SCHEMA,
            },
          },
        },
      )

    if (!response.ok) {
      const text =
        await response
          .text()
          .catch(() => '')

      throw new Error(
        `Groq request failed (${response.status}): ${text.slice(0, 500)}`,
      )
    }

    const payload =
      await response.json() as
        GroqPayload

    const message =
      payload
        .choices
        ?.[0]
        ?.message

    if (
      message?.refusal
    ) {
      throw new Error(
        'Groq refused the request.',
      )
    }

    const content =
      message?.content

    if (!content?.trim()) {
      throw new Error(
        'Groq returned empty content.',
      )
    }

    let parsed:
      unknown

    try {
      parsed =
        parseProviderJson(content)
    }
    catch {
      throw new Error(
        'Groq returned malformed JSON.',
      )
    }

    return enforceGrounding(
      validateStructure(parsed),
      allowList,
    )
  }
}

export const groqAskAfluma =
  new GroqAskAflumaProvider()