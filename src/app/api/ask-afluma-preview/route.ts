import {
  POST as protectedPost,
} from '../ask-afluma/route'


export const runtime =
  'nodejs'


function notFound() {

  return Response.json(
    {
      error:
        'Not found.',
    },
    {
      status:
        404,

      headers: {
        'Cache-Control':
          'no-store',
      },
    },
  )
}


function isLoopbackHost(
  hostname:
    string,
): boolean {

  return (
    hostname ===
      'localhost' ||
    hostname ===
      '127.0.0.1' ||
    hostname ===
      '::1' ||
    hostname ===
      '[::1]'
  )
}


export async function POST(
  request:
    Request,
): Promise<Response> {

  /*
   * This bridge can NEVER operate in production.
   */
  if (
    process.env.NODE_ENV ===
      'production'
  ) {

    return notFound()

  }


  const enabled =
    process.env
      .ASK_AFLUMA_PREVIEW_ENABLED
      ?.trim()
      .toLowerCase() ===
        'true'


  if (!enabled) {

    return notFound()

  }


  const url =
    new URL(
      request.url,
    )


  if (
    !isLoopbackHost(
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

      const originHost =
        new URL(
          origin,
        ).hostname


      if (
        !isLoopbackHost(
          originHost,
        )
      ) {

        return notFound()

      }

    }
    catch {

      return notFound()

    }

  }


  const token =
    process.env
      .ASK_AFLUMA_INTERNAL_TOKEN
      ?.trim() ??
    ''


  if (
    token.length <
      32
  ) {

    return Response.json(
      {
        error:
          'Preview is unavailable.',
      },
      {
        status:
          503,

        headers: {
          'Cache-Control':
            'no-store',
        },
      },
    )

  }


  const body =
    await request.text()


  const internalRequest =
    new Request(
      'http://localhost/api/ask-afluma',
      {
        method:
          'POST',

        headers: {
          'Content-Type':
            request.headers.get(
              'content-type',
            ) ??
            'application/json',

          'x-afluma-internal-token':
            token,

          'cf-connecting-ip':
            '127.0.0.1',

          'user-agent':
            'Ask-Afluma-Local-Preview',
        },

        body,
      },
    )


  const response =
    await protectedPost(
      internalRequest,
    )


  const responseText =
    await response.text()


  const headers =
    new Headers()


  headers.set(
    'Content-Type',
    response.headers.get(
      'content-type',
    ) ??
    'application/json',
  )


  headers.set(
    'Cache-Control',
    'no-store, max-age=0',
  )


  headers.set(
    'X-Content-Type-Options',
    'nosniff',
  )


  headers.set(
    'X-Afluma-Preview',
    '1',
  )


  const requestId =
    response.headers.get(
      'x-request-id',
    )


  if (requestId) {

    headers.set(
      'X-Request-ID',
      requestId,
    )

  }


  const retryAfter =
    response.headers.get(
      'retry-after',
    )


  if (retryAfter) {

    headers.set(
      'Retry-After',
      retryAfter,
    )

  }


  /*
   * Safe local diagnostic only.
   *
   * Internal token/private-mode headers are deliberately
   * NOT forwarded to the browser.
   */
  const providerCalled =
    response.headers.get(
      'x-afluma-provider-called',
    )


  if (
    providerCalled !==
      null
  ) {

    headers.set(
      'X-Afluma-Preview-Provider-Called',
      providerCalled,
    )

  }


  return new Response(
    responseText,
    {
      status:
        response.status,

      headers,
    },
  )
}