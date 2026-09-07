import type {
  Payload,
} from 'payload'

import {
  groqAskAfluma,
} from './groqProvider'

import {
  retrieveAflumaKnowledge,
} from './retrieval'

import type {
  AflumaKnowledgeSource,
  AflumaRetrievalResult,
} from './retrieval'

import type {
  AskAflumaMessage,
  AskAflumaResponse,
} from './types'


export type AskAflumaCmsRequest = {
  question: string

  history?:
    AskAflumaMessage[]
}


export type AskAflumaCmsResult = {

  /**
   * Final visitor-safe response.
   */
  response:
    AskAflumaResponse

  /**
   * Exact source set/context exposed to the provider.
   *
   * This may be narrower than the initial lexical retrieval
   * when an entity boundary is required.
   */
  retrieval:
    AflumaRetrievalResult

  /**
   * Raw C1/C1.2 retrieval result before C2 narrowing.
   */
  rawRetrieval:
    AflumaRetrievalResult

  /**
   * True only when the Groq provider was logically invoked.
   */
  providerCalled:
    boolean
}


const MAX_PROVIDER_CONTEXT =
  18_000


function insufficientContext():
  AskAflumaResponse {

  return {

    status:
      'insufficient_context',

    answer:
      'I do not have verified Afluma information to answer that yet.',

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


function cleanQuestion(
  question: string,
): string {

  return question
    .replace(
      /\u0000/g,
      '',
    )
    .trim()
    .slice(
      0,
      4_000,
    )
}


function normalizedIdentityQuestion(
  question: string,
): string {

  return question
    .toLowerCase()
    .replace(
      /[?!.,:;]+$/g,
      '',
    )
    .replace(
      /\s+/g,
      ' ',
    )
    .trim()
}


function isAflumaIdentityQuestion(
  question: string,
): boolean {

  const normalized =
    normalizedIdentityQuestion(
      question,
    )


  return /^(?:afluma|what\s+is\s+afluma|who\s+is\s+afluma|tell\s+me\s+about\s+afluma|explain\s+afluma|describe\s+afluma|what\s+does\s+afluma\s+do)$/
    .test(
      normalized,
    )
}


/**
 * Source IDs and URLs originate from our own CMS/retrieval layer.
 *
 * Reject rather than encode unexpected quote/newline characters,
 * because groqProvider.ts parses these exact attributes into its
 * source/URL allow-list.
 */
function safeAttribute(
  value: string,
  label: string,
): string {

  if (
    /["\r\n]/.test(
      value,
    )
  ) {

    throw new Error(
      `Unsafe ${label} in Ask Afluma source boundary.`,
    )

  }


  return value
}


function sourceBlock(
  source:
    AflumaKnowledgeSource,
): string {

  const id =
    safeAttribute(
      source.id,
      'source ID',
    )


  const url =
    source.url
      ? safeAttribute(
          source.url,
          'source URL',
        )
      : null


  const opening =
    url
      ? `[SOURCE id="${id}" url="${url}"]`
      : `[SOURCE id="${id}"]`


  return [
    opening,

    `Type: ${source.type}`,

    source.pageType
      ? `Page type: ${source.pageType}`
      : '',

    `Title: ${source.title}`,

    url
      ? `URL: ${url}`
      : '',

    '',

    source.text,

    '[/SOURCE]',
  ]
    .filter(
      (line) =>
        line.length > 0,
    )
    .join(
      '\n',
    )
}


function buildContext(
  sources:
    AflumaKnowledgeSource[],
): string {

  const blocks:
    string[] = []

  let size =
    0


  for (
    const source of
    sources
  ) {

    const block =
      sourceBlock(
        source,
      )


    const separatorSize =
      blocks.length > 0
        ? 2
        : 0


    if (
      size +
        separatorSize +
        block.length >
      MAX_PROVIDER_CONTEXT
    ) {

      continue

    }


    blocks.push(
      block,
    )


    size +=
      separatorSize +
      block.length

  }


  return blocks.join(
    '\n\n',
  )
}


/**
 * Entity-boundary narrowing.
 *
 * C1.2 already ranks COR-001 first for company identity.
 *
 * C2 adds another safety layer:
 * when the visitor asks what/who Afluma is, the provider receives
 * only canonical company identity evidence.
 *
 * Products, geographic pages and insights cannot accidentally
 * redefine the parent company.
 */
function applyEntityBoundary(
  raw:
    AflumaRetrievalResult,
): AflumaRetrievalResult {

  if (
    !isAflumaIdentityQuestion(
      raw.question,
    )
  ) {

    return raw

  }


  const canonical =
    raw.sources.filter(
      (source) =>
        source.id ===
          'COR-001' ||
        source.id ===
          'COR-002',
    )


  const hasHome =
    canonical.some(
      (source) =>
        source.id ===
          'COR-001',
    )


  /**
   * A company identity answer is not allowed if the
   * canonical company homepage did not survive retrieval.
   */
  if (!hasHome) {

    return {
      ...raw,

      sources:
        [],

      context:
        '',
    }

  }


  return {
    ...raw,

    sources:
      canonical,

    context:
      buildContext(
        canonical,
      ),
  }
}


function enforceRetrievalBoundary(
  response:
    AskAflumaResponse,

  retrieval:
    AflumaRetrievalResult,
): void {

  const allowedSourceIds =
    new Set(
      retrieval.sources.map(
        (source) =>
          source.id,
      ),
    )


  const allowedUrls =
    new Set(
      retrieval.sources
        .map(
          (source) =>
            source.url,
        )
        .filter(
          (
            value,
          ): value is string =>
            typeof value ===
              'string' &&
            value.length > 0,
        ),
    )


  for (
    const sourceId of
    response.sourceIds
  ) {

    if (
      !allowedSourceIds.has(
        sourceId,
      )
    ) {

      throw new Error(
        `C2 grounding violation: unknown retrieval source ID ${sourceId}`,
      )

    }

  }


  for (
    const link of
    response.recommendedLinks
  ) {

    if (
      !allowedUrls.has(
        link.href,
      )
    ) {

      throw new Error(
        `C2 grounding violation: unknown retrieval URL ${link.href}`,
      )

    }

  }


  if (
    response.status ===
      'answered' &&
    response.sourceIds.length ===
      0
  ) {

    throw new Error(
      'C2 grounding violation: answered without a retrieval source.',
    )

  }


  if (
    response.status ===
      'insufficient_context' &&
    response.confidence !==
      'low'
  ) {

    throw new Error(
      'C2 grounding violation: insufficient context must have low confidence.',
    )

  }


  /**
   * Additional semantic gate for company identity.
   *
   * The provider cannot cite a product as evidence for
   * "What is Afluma?" because product sources never enter
   * this provider context.
   */
  if (
    isAflumaIdentityQuestion(
      retrieval.question,
    ) &&
    response.sourceIds.some(
      (sourceId) =>
        sourceId.startsWith(
          'PRD-',
        ),
    )
  ) {

    throw new Error(
      'C2 entity violation: product cited as company identity evidence.',
    )

  }
}


export async function askAflumaFromCMS(
  payload:
    Payload,

  request:
    AskAflumaCmsRequest,
): Promise<AskAflumaCmsResult> {

  const question =
    cleanQuestion(
      request.question,
    )


  if (!question) {

    throw new Error(
      'Question is empty.',
    )

  }


  const rawRetrieval =
    await retrieveAflumaKnowledge(
      payload,
      question,
    )


  const retrieval =
    applyEntityBoundary(
      rawRetrieval,
    )


  /**
   * Cost + safety gate.
   *
   * No verified provider context means no Groq call.
   */
  if (
    retrieval.sources.length ===
      0 ||
    !retrieval.context.trim()
  ) {

    return {

      response:
        insufficientContext(),

      retrieval,

      rawRetrieval,

      providerCalled:
        false,
    }

  }


  const response =
    await groqAskAfluma.ask({

      question:
        retrieval.question,

      context:
        retrieval.context,

      history:
        request.history,
    })


  enforceRetrievalBoundary(
    response,
    retrieval,
  )


  return {

    response,

    retrieval,

    rawRetrieval,

    providerCalled:
      true,
  }
}