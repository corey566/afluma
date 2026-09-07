import configPromise from '@payload-config'

import {
  getPayload,
} from 'payload'

import {
  buildAskAflumaPresentation,
} from '@/lib/ai/ask-afluma/presentation'

import {
  retrieveAflumaKnowledge,
} from '@/lib/ai/ask-afluma/retrieval'


export const dynamic =
  'force-dynamic'


const MAX_BODY_BYTES =
  16 * 1024

const MAX_QUESTION_LENGTH =
  4_000

const MAX_SOURCE_IDS =
  8

const MAX_LINKS =
  8


type Body = {
  question?: unknown

  sourceIds?: unknown

  recommendedLinks?: unknown
}


type LinkInput = {
  label: string

  href: string
}


function responseHeaders():
  HeadersInit {

  return {
    'Cache-Control':
      'no-store, max-age=0',

    'X-Content-Type-Options':
      'nosniff',

    'Referrer-Policy':
      'no-referrer',
  }

}


function notFound() {

  return Response.json(
    {
      error:
        'Not found.',
    },
    {
      status:
        404,

      headers:
        responseHeaders(),
    },
  )

}


function isLocalHost(
  value: string,
): boolean {

  const hostname =
    value
      .trim()
      .toLowerCase()


  return (
    hostname ===
      'localhost' ||
    hostname ===
      '127.0.0.1' ||
    hostname ===
      '[::1]' ||
    hostname ===
      '::1'
  )

}


function cleanQuestion(
  value: unknown,
): string {

  if (
    typeof value !==
      'string'
  ) {

    return ''

  }


  return value
    .replace(
      /\u0000/g,
      '',
    )
    .trim()
    .slice(
      0,
      MAX_QUESTION_LENGTH,
    )

}


function cleanSourceIds(
  value: unknown,
): string[] {

  if (
    !Array.isArray(
      value,
    )
  ) {

    return []

  }


  return value
    .filter(
      (
        item,
      ): item is string =>
        typeof item ===
          'string',
    )
    .map(
      (item) =>
        item
          .replace(
            /\u0000/g,
            '',
          )
          .trim()
          .slice(
            0,
            100,
          ),
    )
    .filter(
      (item) =>
        item.length >
        0,
    )
    .slice(
      0,
      MAX_SOURCE_IDS,
    )

}


function cleanLinks(
  value: unknown,
): LinkInput[] {

  if (
    !Array.isArray(
      value,
    )
  ) {

    return []

  }


  const output:
    LinkInput[] =
    []


  for (
    const item of
    value
  ) {

    if (
      !item ||
      typeof item !==
        'object'
    ) {

      continue

    }


    const candidate =
      item as
        Record<
          string,
          unknown
        >


    if (
      typeof candidate.label !==
        'string' ||
      typeof candidate.href !==
        'string'
    ) {

      continue

    }


    const label =
      candidate.label
        .replace(
          /\u0000/g,
          '',
        )
        .trim()
        .slice(
          0,
          160,
        )


    const href =
      candidate.href
        .replace(
          /\u0000/g,
          '',
        )
        .trim()
        .slice(
          0,
          500,
        )


    if (
      !label ||
      !href
    ) {

      continue

    }


    output.push({
      label,
      href,
    })


    if (
      output.length >=
        MAX_LINKS
    ) {

      break

    }

  }


  return output

}


export async function POST(
  request: Request,
) {

  /*
   * Preview enrichment is never available in production.
   */
  if (
    process.env.NODE_ENV ===
      'production' ||
    process.env
      .ASK_AFLUMA_PREVIEW_ENABLED !==
      'true'
  ) {

    return notFound()

  }


  let url:
    URL


  try {

    url =
      new URL(
        request.url,
      )

  }
  catch {

    return notFound()

  }


  if (
    !isLocalHost(
      url.hostname,
    )
  ) {

    return notFound()

  }


  const origin =
    request.headers.get(
      'origin',
    )


  if (origin) {

    try {

      const originURL =
        new URL(
          origin,
        )


      if (
        !isLocalHost(
          originURL.hostname,
        )
      ) {

        return notFound()

      }

    }
    catch {

      return notFound()

    }

  }


  const raw =
    await request.text()


  if (
    Buffer.byteLength(
      raw,
      'utf8',
    ) >
      MAX_BODY_BYTES
  ) {

    return Response.json(
      {
        error:
          'Request is too large.',
      },
      {
        status:
          413,

        headers:
          responseHeaders(),
      },
    )

  }


  let body:
    Body


  try {

    body =
      JSON.parse(
        raw,
      ) as Body

  }
  catch {

    return Response.json(
      {
        error:
          'Invalid JSON.',
      },
      {
        status:
          400,

        headers:
          responseHeaders(),
      },
    )

  }


  const question =
    cleanQuestion(
      body.question,
    )


  if (!question) {

    return Response.json(
      {
        error:
          'Question is required.',
      },
      {
        status:
          400,

        headers:
          responseHeaders(),
      },
    )

  }


  const sourceIds =
    cleanSourceIds(
      body.sourceIds,
    )


  const recommendedLinks =
    cleanLinks(
      body.recommendedLinks,
    )


  try {

    const payload =
      await getPayload({
        config:
          configPromise,
      })


    /*
     * Same retrieval engine as Ask Afluma.
     *
     * No Groq/provider request.
     * No database mutation.
     */
    const retrieval =
      await retrieveAflumaKnowledge(
        payload,
        question,
      )


    const presentation =
      buildAskAflumaPresentation(
        retrieval,
        sourceIds,
        recommendedLinks,
      )


    const headers =
      new Headers(
        responseHeaders(),
      )


    headers.set(
      'X-Afluma-Presentation',
      '1',
    )


    return Response.json(
      presentation,
      {
        status:
          200,

        headers,
      },
    )

  }
  catch (
    error
  ) {

    /*
     * Related-content failure must never convert a
     * validated AI answer into an application failure.
     */
    console.error(
      JSON.stringify({
        event:
          'ask_afluma_presentation_error',

        errorType:
          error instanceof Error
            ? error.name
            : 'Unknown',
      }),
    )


    const headers =
      new Headers(
        responseHeaders(),
      )


    headers.set(
      'X-Afluma-Presentation',
      'fallback',
    )


    return Response.json(
      {
        references:
          [],

        relatedContent:
          [],

        faqQuestions:
          [],
      },
      {
        status:
          200,

        headers,
      },
    )

  }

}