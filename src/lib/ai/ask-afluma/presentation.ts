import type {
  AflumaKnowledgeSource,
  AflumaRetrievalResult,
} from './retrieval'


export type AskAflumaPresentationItem = {
  sourceId: string

  title: string

  href: string

  type: string

  pageType:
    | string
    | null

  excerpt:
    | string
    | null
}


export type AskAflumaPresentation = {
  references:
    AskAflumaPresentationItem[]

  relatedContent:
    AskAflumaPresentationItem[]

  faqQuestions:
    string[]
}


type LinkInput = {
  label: string
  href: string
}


function cleanText(
  value: string,
  maxLength = 220,
): string {

  return value
    .replace(
      /\s+/g,
      ' ',
    )
    .trim()
    .slice(
      0,
      maxLength,
    )
}


function safeURL(
  value:
    string |
    null,
): value is string {

  if (!value) {

    return false

  }


  const url =
    value.trim()


  return (
    url.startsWith(
      '/',
    ) ||
    /^https:\/\/(?:www\.)?afluma\.com(?:\/|$)/i.test(
      url,
    )
  )
}


function normalizedURL(
  value: string,
): string {

  try {

    const url =
      new URL(
        value,
        'https://afluma.com',
      )


    return (
      url.pathname
        .replace(
          /\/+$/,
          '',
        ) ||
      '/'
    ).toLowerCase()

  }
  catch {

    return value
      .trim()
      .replace(
        /\/+$/,
        '',
      )
      .toLowerCase()

  }
}


function displayType(
  source:
    AflumaKnowledgeSource,
): string {

  const raw =
    (
      source.pageType ||
      source.type
    )
      .trim()
      .toLowerCase()


  switch (raw) {

    case 'post':
    case 'article':
    case 'insights':
      return 'Insight'

    case 'case-study':
      return 'Case Study'

    case 'service':
      return 'Service'

    case 'solution':
      return 'Solution'

    case 'industry':
      return 'Industry'

    case 'product':
      return 'Product'

    case 'faq':
      return 'FAQ'

    case 'company':
      return 'Company'

    case 'location':
      return 'Location'

    case 'job':
    case 'careers':
      return 'Careers'

    default:
      return 'Resource'

  }

}


function excerptFrom(
  source:
    AflumaKnowledgeSource,
): string | null {

  const cleaned =
    cleanText(
      source.text,
      210,
    )


  if (!cleaned) {

    return null

  }


  return (
    source.text
      .replace(
        /\s+/g,
        ' ',
      )
      .trim()
      .length >
      210
      ? `${cleaned.slice(
          0,
          207,
        ).trim()}...`
      : cleaned
  )

}


function itemFrom(
  source:
    AflumaKnowledgeSource,
): AskAflumaPresentationItem | null {

  if (
    !safeURL(
      source.url,
    )
  ) {

    return null

  }


  const title =
    cleanText(
      source.title,
      140,
    )


  if (!title) {

    return null

  }


  return {
    sourceId:
      source.id,

    title,

    href:
      source.url,

    type:
      displayType(
        source,
      ),

    pageType:
      source.pageType ??
      null,

    excerpt:
      excerptFrom(
        source,
      ),
  }

}


function uniqueItems(
  items:
    AskAflumaPresentationItem[],
): AskAflumaPresentationItem[] {

  const seen =
    new Set<string>()


  return items.filter(
    (item) => {

      const key =
        `${item.sourceId}|${normalizedURL(
          item.href,
        )}`


      if (
        seen.has(
          key,
        )
      ) {

        return false

      }


      seen.add(
        key,
      )


      return true

    },
  )

}


function uniqueQuestions(
  questions:
    string[],
): string[] {

  const seen =
    new Set<string>()


  return questions
    .map(
      (question) =>
        cleanText(
          question,
          120,
        ),
    )
    .filter(
      (question) =>
        question.length >
        0,
    )
    .filter(
      (question) => {

        const key =
          question
            .toLowerCase()


        if (
          seen.has(
            key,
          )
        ) {

          return false

        }


        seen.add(
          key,
        )


        return true

      },
    )
    .slice(
      0,
      4,
    )

}


export function buildAskAflumaPresentation(
  retrieval:
    AflumaRetrievalResult,

  sourceIds:
    string[],

  recommendedLinks:
    LinkInput[],
): AskAflumaPresentation {

  const selectedIds =
    new Set(
      sourceIds
        .map(
          (id) =>
            id.trim(),
        )
        .filter(
          (id) =>
            id.length >
            0,
        ),
    )


  const recommendedURLs =
    new Set(
      recommendedLinks
        .map(
          (link) =>
            normalizedURL(
              link.href,
            ),
        ),
    )


  /*
   * References must correspond to either:
   *
   * 1. a source ID selected by the grounded answer, or
   * 2. a recommended URL that exists inside the same
   *    eligibility-aware retrieval result.
   *
   * Browser input therefore cannot create arbitrary
   * reference records.
   */
  const references =
    uniqueItems(
      retrieval.sources
        .filter(
          (source) => {

            if (
              selectedIds.has(
                source.id,
              )
            ) {

              return true

            }


            return (
              source.url !==
                null &&
              recommendedURLs.has(
                normalizedURL(
                  source.url,
                ),
              )
            )

          },
        )
        .map(
          itemFrom,
        )
        .filter(
          (
            item,
          ): item is
            AskAflumaPresentationItem =>
              item !== null,
        ),
    )
      .slice(
        0,
        6,
      )


  const referenceIds =
    new Set(
      references.map(
        (item) =>
          item.sourceId,
      ),
    )


  const referenceURLs =
    new Set(
      references.map(
        (item) =>
          normalizedURL(
            item.href,
          ),
      ),
    )


  const relatedContent =
    uniqueItems(
      retrieval.sources
        .filter(
          (source) => {

            if (
              source.type ===
                'faq' ||
              source.type ===
                'job' ||
              source.type ===
                'location'
            ) {

              return false

            }


            if (
              !safeURL(
                source.url,
              )
            ) {

              return false

            }


            if (
              referenceIds.has(
                source.id,
              )
            ) {

              return false

            }


            if (
              referenceURLs.has(
                normalizedURL(
                  source.url,
                ),
              )
            ) {

              return false

            }


            return true

          },
        )
        .map(
          itemFrom,
        )
        .filter(
          (
            item,
          ): item is
            AskAflumaPresentationItem =>
              item !== null,
        ),
    )
      .slice(
        0,
        4,
      )


  /*
   * FAQ text comes only from eligible FAQ records that
   * actually appeared in retrieval.
   *
   * Clicking one still sends the question back through
   * the normal grounded Ask Afluma pipeline.
   */
  const faqQuestions =
    uniqueQuestions(
      retrieval.sources
        .filter(
          (source) =>
            source.type ===
              'faq',
        )
        .map(
          (source) =>
            source.title,
        ),
    )


  return {
    references,
    relatedContent,
    faqQuestions,
  }

}