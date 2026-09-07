import { pages as websitePages } from '@/site/content'
import type {
  Payload,
  Where,
} from 'payload'

export type AflumaKnowledgeType =
  | 'page'
  | 'service'
  | 'solution'
  | 'industry'
  | 'product'
  | 'case-study'
  | 'post'
  | 'faq'
  | 'location'
  | 'job'

export type AflumaKnowledgeSource = {
  id: string
  type: AflumaKnowledgeType

  /**
   * For records sourced from the Pages collection.
   *
   * Examples:
   * home, hub, service, industry, product,
   * article, company, careers, location.
   */
  pageType?: string

  title: string
  url: string | null
  text: string
  score: number
}

export type AflumaRetrievalResult = {
  question: string
  sources: AflumaKnowledgeSource[]
  context: string

  counts: Record<
    AflumaKnowledgeType,
    number
  >
}

type RecordValue =
  Record<string, unknown>

const MAX_RESULTS = 8
const MAX_CONTEXT = 18_000
const MAX_SOURCE_TEXT = 3_000

const STOP_WORDS =
  new Set([
    'a',
    'an',
    'and',
    'are',
    'as',
    'at',
    'be',
    'by',
    'can',
    'do',
    'does',
    'for',
    'from',
    'how',
    'i',
    'in',
    'is',
    'it',
    'me',
    'my',
    'of',
    'on',
    'or',
    'our',
    'that',
    'the',
    'their',
    'this',
    'to',
    'we',
    'what',
    'which',
    'with',
    'you',
    'your',
  ])

function objectValue(
  value: unknown,
): RecordValue {

  if (
    value &&
    typeof value === 'object' &&
    !Array.isArray(value)
  ) {
    return value as RecordValue
  }

  return {}
}

function stringValue(
  value: unknown,
): string {

  return typeof value === 'string'
    ? value.trim()
    : ''
}

function arrayValue(
  value: unknown,
): unknown[] {

  return Array.isArray(value)
    ? value
    : []
}

function idValue(
  value: unknown,
): string | null {

  if (
    typeof value === 'string' ||
    typeof value === 'number'
  ) {
    return String(value)
  }

  const item =
    objectValue(value)

  if (
    typeof item.id === 'string' ||
    typeof item.id === 'number'
  ) {
    return String(item.id)
  }

  return null
}

function relationshipIds(
  value: unknown,
): string[] {

  return arrayValue(value)
    .map(idValue)
    .filter(
      (
        id,
      ): id is string =>
        Boolean(id),
    )
}

function flattenText(
  value: unknown,
): string {

  const parts: string[] = []

  const ignored =
    new Set([
      'id',
      '_status',
      'createdAt',
      'updatedAt',
      'relationTo',
      'mimeType',
      'filename',
      'sizes',
    ])

  function visit(
    current: unknown,
  ): void {

    if (
      current === null ||
      current === undefined
    ) {
      return
    }

    if (
      typeof current === 'string'
    ) {

      const text =
        current.trim()

      if (
        text &&
        text.length <= 2_000
      ) {
        parts.push(text)
      }

      return
    }

    if (
      Array.isArray(current)
    ) {

      for (
        const item of current
      ) {
        visit(item)
      }

      return
    }

    if (
      typeof current !== 'object'
    ) {
      return
    }

    for (
      const [
        key,
        child,
      ] of
      Object.entries(
        current as RecordValue,
      )
    ) {

      if (
        ignored.has(key)
      ) {
        continue
      }

      visit(child)
    }
  }

  visit(value)

  return [
    ...new Set(parts),
  ].join(' ')
}

function cleanText(
  value: string,
): string {

  return value
    .replace(
      /\[\/?SOURCE\b/gi,
      '[CMS_SOURCE_TEXT',
    )
    .replace(
      /\s+/g,
      ' ',
    )
    .trim()
}

function joinText(
  ...values: Array<
    string |
    null |
    undefined
  >
): string {

  return cleanText(
    values
      .filter(
        (
          value,
        ): value is string =>
          typeof value === 'string' &&
          value.trim().length > 0,
      )
      .join('\n'),
  )
}

function safeId(
  value: string,
): string {

  return value
    .replace(
      /[^a-zA-Z0-9:_-]/g,
      '-',
    )
    .slice(
      0,
      140,
    )
}

function publicPath(
  slug: string,
): string {

  const clean =
    slug
      .replace(
        /^\/+|\/+$/g,
        '',
      )
      .trim()

  if (
    !clean ||
    clean === 'home'
  ) {
    return '/'
  }

  return `/${clean}/`
}

function queryTokens(
  value: string,
): string[] {

  return [
    ...new Set(
      value
        .toLowerCase()
        .replace(
          /[^\p{L}\p{N}]+/gu,
          ' ',
        )
        .split(/\s+/)
        .filter(
          (token) =>
            token.length >= 2 &&
            !STOP_WORDS.has(
              token,
            ),
        ),
    ),
  ]
}

function scoreSource(
  question: string,
  source: Omit<
    AflumaKnowledgeSource,
    'score'
  >,
): AflumaKnowledgeSource {

  const terms =
    queryTokens(
      question,
    )

  const q =
    question
      .toLowerCase()
      .trim()

  const title =
    source.title
      .toLowerCase()

  const text =
    source.text
      .toLowerCase()

  const pageType =
    (
      source.pageType ??
      ''
    )
      .toLowerCase()

  const sourceId =
    source.id
      .toUpperCase()

  const searchable =
    `${title} ${text}`

  let score = 0


  // ----------------------------------------------------------
  // BASIC LEXICAL MATCHING
  // ----------------------------------------------------------

  let matchedTerms = 0

  for (
    const term of
    terms
  ) {

    let matched =
      false

    if (
      title === term
    ) {

      score += 30
      matched = true

    }
    else if (
      title.includes(
        term,
      )
    ) {

      score += 14
      matched = true

    }


    if (
      text
        .slice(
          0,
          900,
        )
        .includes(
          term,
        )
    ) {

      score += 5
      matched = true

    }
    else if (
      text.includes(
        term,
      )
    ) {

      score += 2
      matched = true

    }


    if (matched) {
      matchedTerms += 1
    }

  }


  // Full phrase in the title is extremely meaningful.
  if (
    q.length >= 4 &&
    title.includes(
      q,
    )
  ) {

    score += 55

  }


  // Reward coverage across several query terms.
  if (
    terms.length >= 2
  ) {

    const coverage =
      matchedTerms /
      terms.length

    if (
      coverage === 1
    ) {

      score += 25

    }
    else if (
      coverage >= 0.66
    ) {

      score += 12

    }
    else if (
      coverage < 0.34
    ) {

      score -= 8

    }

  }


  // ----------------------------------------------------------
  // QUERY INTENT
  // ----------------------------------------------------------

  const asksForInsight =
    /(article|articles|blog|blogs|insight|insights|guide|guides|checklist|checklists|roi|mistake|mistakes|roadmap|comparison|compare|best practice|best practices|use case|use cases|how to|when should)/i
      .test(
        q,
      )


  const asksForProduct =
    /(product|products|platform|commerce|pos|inventory|ecommerce|payroll|serenops|daily fitness)/i
      .test(
        q,
      )


  const asksForService =
    /(service|services|software|engineering|development|cloud|automation|cybersecurity|security|data|analytics|design|strategy|bpo|managed operations|finance operations|customer experience)/i
      .test(
        q,
      )


  const asksForIndustry =
    /(industry|industries|retail|financial services|finance sector|hospitality|travel|manufacturing|healthcare|real estate|saas|technology company|startup|startups|restaurant|restaurants)/i
      .test(
        q,
      )


  const asksForCareer =
    /(career|careers|job|jobs|vacancy|vacancies|hiring|internship|internships|role|roles)/i
      .test(
        q,
      )


  const asksForContact =
    /(contact|office|offices|address|phone|email|enquiry|enquiries|project enquiry|support)/i
      .test(
        q,
      )


  const asksForCompany =
    q === 'afluma' ||
    /(company|about|afluma|leadership|team|partner|partners|responsible ai|delivery model)/i
      .test(
        q,
      )


  // ----------------------------------------------------------
  // PAGE-TYPE / SOURCE-ID PRIORITY
  // ----------------------------------------------------------

  if (
    asksForProduct &&
    (
      pageType === 'product' ||
      sourceId.startsWith(
        'PRD-',
      )
    )
  ) {

    score += 40

  }


  if (
    asksForService &&
    (
      pageType === 'service' ||
      (
        pageType === 'hub' &&
        sourceId.startsWith(
          'SRV-',
        )
      ) ||
      sourceId.startsWith(
        'SRV-',
      )
    )
  ) {

    score += 32

  }


  if (
    asksForIndustry &&
    (
      pageType === 'industry' ||
      sourceId.startsWith(
        'IND-',
      )
    )
  ) {

    score += 32

  }


  if (
    asksForCareer &&
    (
      pageType === 'careers' ||
      pageType === 'job' ||
      (
        pageType === 'company' &&
        /career/i.test(
          searchable,
        )
      )
    )
  ) {

    score += 40

  }


  if (
    asksForContact &&
    (
      pageType === 'company' ||
      pageType === 'location'
    )
  ) {

    score += 30

  }


  if (
    asksForCompany &&
    (
      pageType === 'home' ||
      pageType === 'company' ||
      pageType === 'hub'
    )
  ) {

    score += 28

  }


  // ----------------------------------------------------------
  // AFLUMA COMPANY IDENTITY INTENT
  // ----------------------------------------------------------
  //
  // These visitor questions all refer to the Afluma company:
  //
  //   Afluma
  //   What is Afluma?
  //   Who is Afluma?
  //   Tell me about Afluma
  //   Explain Afluma
  //   Describe Afluma
  //   What does Afluma do?
  //
  // A product such as "Afluma Commerce" must not become the
  // identity of the parent company merely because the product
  // title also contains the word "Afluma".

  const identityQuestion =
    q
      .replace(
        /[?!.,:;]+$/g,
        '',
      )
      .replace(
        /\s+/g,
        ' ',
      )
      .trim()


  const asksForAflumaIdentity =
    /^(?:afluma|what\s+is\s+afluma|who\s+is\s+afluma|tell\s+me\s+about\s+afluma|explain\s+afluma|describe\s+afluma|what\s+does\s+afluma\s+do)$/
      .test(
        identityQuestion,
      )


  if (
    asksForAflumaIdentity
  ) {

    /*
     * COR-001 is the canonical Afluma company identity page.
     */
    if (
      pageType === 'home' ||
      sourceId === 'COR-001'
    ) {

      score += 220

    }


    /*
     * About Afluma is useful secondary company evidence.
     */
    if (
      sourceId === 'COR-002' ||
      (
        pageType === 'company' &&
        /\babout afluma\b/i.test(
          title,
        )
      )
    ) {

      score += 100

    }


    /*
     * Other company pages remain relevant,
     * but below Home and About.
     */
    if (
      pageType === 'company'
    ) {

      score += 25

    }


    /*
     * Products must not define the parent company.
     */
    if (
      pageType === 'product' ||
      sourceId.startsWith(
        'PRD-',
      )
    ) {

      score -= 90

    }


    /*
     * Geographic landing pages are not primary
     * company identity evidence.
     */
    if (
      pageType === 'location' ||
      sourceId.startsWith(
        'LOC-',
      )
    ) {

      score -= 90

    }


    /*
     * Insight articles also must not define
     * the company identity.
     */
    if (
      pageType === 'article' ||
      pageType === 'insights' ||
      sourceId.startsWith(
        'INS-',
      )
    ) {

      score -= 90

    }

  }


  // ----------------------------------------------------------
  // PRODUCT NAME EXACTNESS
  // ----------------------------------------------------------

  if (
    /serenops/i.test(
      q,
    ) &&
    /serenops/i.test(
      title,
    )
  ) {

    score += 100

  }


  if (
    /afluma commerce/i.test(
      q,
    ) &&
    /afluma commerce/i.test(
      title,
    )
  ) {

    score += 100

  }


  if (
    /daily fitness/i.test(
      q,
    ) &&
    /daily fitness/i.test(
      title,
    )
  ) {

    score += 100

  }


  // ----------------------------------------------------------
  // INSIGHTS SHOULD NOT SWAMP NAVIGATION / PRODUCT QUERIES
  // ----------------------------------------------------------

  const looksLikeInsight =
    pageType === 'article' ||
    pageType === 'insights' ||
    sourceId.startsWith(
      'INS-',
    )


  if (
    looksLikeInsight &&
    !asksForInsight
  ) {

    score -= 45

  }


  if (
    looksLikeInsight &&
    asksForInsight
  ) {

    score += 15

  }


  return {
    ...source,
    score,
  }
}

function sourceBlock(
  source: AflumaKnowledgeSource,
): string {

  const urlPart =
    source.url
      ? ` url="${source.url}"`
      : ''

  return [
    `[SOURCE id="${safeId(source.id)}"${urlPart}]`,
    `Type: ${source.type}`,
    source.pageType
      ? `Page type: ${source.pageType}`
      : '',
    `Title: ${source.title}`,
    cleanText(source.text),
    '[/SOURCE]',
  ].join('\n')
}

const approvedWorkflowWhere: Where = {
  and: [
    {
      _status: {
        equals:
          'published',
      },
    },

    {
      'workflow.status': {
        equals:
          'approved',
      },
    },

    {
      or: [
        {
          'workflow.evidenceStatus': {
            equals:
              'not-required',
          },
        },

        {
          'workflow.evidenceStatus': {
            equals:
              'verified',
          },
        },
      ],
    },
  ],
}

export async function retrieveAflumaKnowledge(
  payload: Payload,
  question: string,
): Promise<AflumaRetrievalResult> {

  const cleanQuestion =
    question
      .replace(
        /\u0000/g,
        '',
      )
      .trim()
      .slice(
        0,
        4_000,
      )

  if (!cleanQuestion) {
    throw new Error(
      'Question is empty.',
    )
  }

  const [
    pagesResult,
    servicesResult,
    solutionsResult,
    industriesResult,
    productsResult,
    caseStudiesResult,
    postsResult,
    faqsResult,
    locationsResult,
    jobsResult,
  ] =
    await Promise.all([

      payload.find({
        collection:
          'pages',

        overrideAccess:
          false,

        draft:
          false,

        depth:
          0,

        limit:
          5000,

        pagination:
          false,

        where:
          approvedWorkflowWhere,
      }),

      payload.find({
        collection:
          'services',

        overrideAccess:
          false,

        draft:
          false,

        depth:
          0,

        limit:
          200,

        pagination:
          false,

        where:
          approvedWorkflowWhere,
      }),

      payload.find({
        collection:
          'solutions',

        overrideAccess:
          false,

        draft:
          false,

        depth:
          0,

        limit:
          200,

        pagination:
          false,

        where:
          approvedWorkflowWhere,
      }),

      payload.find({
        collection:
          'industries',

        overrideAccess:
          false,

        draft:
          false,

        depth:
          0,

        limit:
          200,

        pagination:
          false,

        where:
          approvedWorkflowWhere,
      }),

      payload.find({
        collection:
          'products',

        overrideAccess:
          false,

        draft:
          false,

        depth:
          0,

        limit:
          200,

        pagination:
          false,

        where:
          approvedWorkflowWhere,
      }),

      payload.find({
        collection:
          'case-studies',

        overrideAccess:
          false,

        draft:
          false,

        depth:
          0,

        limit:
          100,

        pagination:
          false,

        where: {
          and: [
            {
              _status: {
                equals:
                  'published',
              },
            },

            {
              'workflow.status': {
                equals:
                  'approved',
              },
            },

            {
              permissionStatus: {
                equals:
                  'approved',
              },
            },

            {
              evidenceStatus: {
                equals:
                  'verified',
              },
            },
          ],
        },
      }),

      payload.find({
        collection:
          'posts',

        overrideAccess:
          false,

        draft:
          false,

        depth:
          0,

        limit:
          200,

        pagination:
          false,

        where: {
          and: [
            {
              _status: {
                equals:
                  'published',
              },
            },

            {
              editorialStatus: {
                equals:
                  'published',
              },
            },

            {
              factChecked: {
                equals:
                  true,
              },
            },
          ],
        },
      }),

      payload.find({
        collection:
          'faqs',

        overrideAccess:
          false,

        depth:
          0,

        limit:
          200,

        pagination:
          false,

        where: {
          approved: {
            equals:
              true,
          },
        },
      }),

      payload.find({
        collection:
          'locations',

        overrideAccess:
          false,

        draft:
          false,

        depth:
          0,

        limit:
          100,

        pagination:
          false,

        where: {
          and: [
            {
              _status: {
                equals:
                  'published',
              },
            },

            {
              'workflow.status': {
                equals:
                  'approved',
              },
            },

            {
              isPublicOffice: {
                equals:
                  true,
              },
            },
          ],
        },
      }),

      /*
       * IMPORTANT:
       *
       * _status is Payload publication state.
       * jobStatus is the Afluma recruitment workflow.
       */
      payload.find({
        collection:
          'jobs',

        overrideAccess:
          false,

        draft:
          false,

        depth:
          0,

        limit:
          100,

        pagination:
          false,

        where: {
          and: [
            {
              _status: {
                equals:
                  'published',
              },
            },

            {
              jobStatus: {
                equals:
                  'open',
              },
            },
          ],
        },
      }),
    ])

  const pages =
    pagesResult.docs.map(
      objectValue,
    )

  const services =
    servicesResult.docs.map(
      objectValue,
    )

  const solutions =
    solutionsResult.docs.map(
      objectValue,
    )

  const industries =
    industriesResult.docs.map(
      objectValue,
    )

  const products =
    productsResult.docs.map(
      objectValue,
    )

  const caseStudies =
    caseStudiesResult.docs.map(
      objectValue,
    )

  const posts =
    postsResult.docs.map(
      objectValue,
    )

  const faqs =
    faqsResult.docs.map(
      objectValue,
    )

  const locations =
    locationsResult.docs.map(
      objectValue,
    )

  const jobs =
    jobsResult.docs.map(
      objectValue,
    )

  const serviceURLs =
    new Map<string, string>()

  const solutionURLs =
    new Map<string, string>()

  const industryURLs =
    new Map<string, string>()

  const productURLs =
    new Map<string, string>()

  for (
    const page of pages
  ) {

    const url =
      publicPath(
        stringValue(
          page.slug,
        ),
      )

    for (
      const id of
      relationshipIds(
        page.services,
      )
    ) {
      serviceURLs.set(
        id,
        url,
      )
    }

    for (
      const id of
      relationshipIds(
        page.solutions,
      )
    ) {
      solutionURLs.set(
        id,
        url,
      )
    }

    for (
      const id of
      relationshipIds(
        page.industries,
      )
    ) {
      industryURLs.set(
        id,
        url,
      )
    }

    for (
      const id of
      relationshipIds(
        page.products,
      )
    ) {
      productURLs.set(
        id,
        url,
      )
    }
  }

  const candidates:
    Array<
      Omit<
        AflumaKnowledgeSource,
        'score'
      >
    > = []

  function add(
    source:
      Omit<
        AflumaKnowledgeSource,
        'score'
      >,
  ): void {

    if (
      !source.title.trim()
    ) {
      return
    }

    candidates.push({
      ...source,

      text:
        cleanText(
          source.text,
        ),
    })
  }

  for (
    const item of pages
  ) {

    const id =
      idValue(
        item.id,
      )

    const slug =
      stringValue(
        item.slug,
      )

    add({
      id:
        safeId(
          stringValue(
            item.sourceId,
          ) ||
          `page:${slug || id || 'unknown'}`,
        ),

      type:
        'page',

      pageType:
        stringValue(
          item.pageType,
        ),

      title:
        stringValue(
          item.title,
        ),

      url:
        publicPath(slug),

      text:
        joinText(
          stringValue(
            item.summary,
          ),

          flattenText(
            item.sourceSlots,
          ),

          flattenText(
            item.layout,
          ),
        ),
    })
  }

  for (
    const item of services
  ) {

    const id =
      idValue(
        item.id,
      )

    const slug =
      stringValue(
        item.slug,
      )

    add({
      id:
        `service:${slug || id || 'unknown'}`,

      type:
        'service',

      title:
        stringValue(
          item.title,
        ),

      url:
        id
          ? serviceURLs.get(id) ??
            null
          : null,

      text:
        joinText(
          stringValue(
            item.summary,
          ),

          flattenText(
            item.layout,
          ),
        ),
    })
  }

  for (
    const item of solutions
  ) {

    const id =
      idValue(
        item.id,
      )

    const slug =
      stringValue(
        item.slug,
      )

    add({
      id:
        `solution:${slug || id || 'unknown'}`,

      type:
        'solution',

      title:
        stringValue(
          item.title,
        ),

      url:
        id
          ? solutionURLs.get(id) ??
            null
          : null,

      text:
        joinText(
          stringValue(
            item.summary,
          ),

          flattenText(
            item.layout,
          ),
        ),
    })
  }

  for (
    const item of industries
  ) {

    const id =
      idValue(
        item.id,
      )

    const slug =
      stringValue(
        item.slug,
      )

    add({
      id:
        `industry:${slug || id || 'unknown'}`,

      type:
        'industry',

      title:
        stringValue(
          item.title,
        ),

      url:
        id
          ? industryURLs.get(id) ??
            null
          : null,

      text:
        joinText(
          stringValue(
            item.summary,
          ),

          flattenText(
            item.challenges,
          ),

          flattenText(
            item.layout,
          ),
        ),
    })
  }

  for (
    const item of products
  ) {

    const id =
      idValue(
        item.id,
      )

    const slug =
      stringValue(
        item.slug,
      )

    add({
      id:
        `product:${slug || id || 'unknown'}`,

      type:
        'product',

      title:
        stringValue(
          item.title,
        ),

      url:
        id
          ? productURLs.get(id) ??
            null
          : null,

      text:
        joinText(
          stringValue(
            item.summary,
          ),

          `Availability: ${
            stringValue(
              item.availability,
            ) || 'unknown'
          }`,

          flattenText(
            item.features,
          ),

          flattenText(
            item.layout,
          ),
        ),
    })
  }

  for (
    const item of caseStudies
  ) {

    const slug =
      stringValue(
        item.slug,
      )

    const approvedEvidence =
      arrayValue(
        item.evidence,
      )
        .map(
          objectValue,
        )
        .filter(
          (evidence) =>
            evidence.approved ===
              true,
        )

    add({
      id:
        `case-study:${
          slug ||
          idValue(item.id) ||
          'unknown'
        }`,

      type:
        'case-study',

      title:
        stringValue(
          item.title,
        ),

      url:
        null,

      text:
        joinText(
          stringValue(
            item.clientDisplayName,
          )
            ? `Client: ${stringValue(item.clientDisplayName)}`
            : '',

          stringValue(
            item.summary,
          ),

          flattenText(
            item.challenge,
          ),

          flattenText(
            item.solution,
          ),

          flattenText(
            item.outcome,
          ),

          flattenText(
            approvedEvidence.map(
              (evidence) => ({
                claim:
                  evidence.claim,

                value:
                  evidence.value,
              }),
            ),
          ),
        ),
    })
  }

  for (
    const item of posts
  ) {

    const slug =
      stringValue(
        item.slug,
      )

    add({
      id:
        `post:${
          slug ||
          idValue(item.id) ||
          'unknown'
        }`,

      type:
        'post',

      title:
        stringValue(
          item.title,
        ),

      url:
        null,

      text:
        joinText(
          stringValue(
            item.pillar,
          ),

          stringValue(
            item.cluster,
          ),

          stringValue(
            item.summary,
          ),

          flattenText(
            item.content,
          ),

          flattenText(
            item.layout,
          ),
        ),
    })
  }

  for (
    const item of faqs
  ) {

    const question =
      stringValue(
        item.question,
      )

    add({
      id:
        `faq:${
          idValue(item.id) ||
          question
            .slice(
              0,
              40,
            )
            .replace(
              /\s+/g,
              '-',
            )
        }`,

      type:
        'faq',

      title:
        question,

      url:
        null,

      text:
        joinText(
          question,
          flattenText(
            item.answer,
          ),
        ),
    })
  }

  for (
    const item of locations
  ) {

    const slug =
      stringValue(
        item.slug,
      )

    add({
      id:
        `location:${
          slug ||
          idValue(item.id) ||
          'unknown'
        }`,

      type:
        'location',

      title:
        stringValue(
          item.name,
        ),

      url:
        null,

      text:
        joinText(
          stringValue(
            item.country,
          ),

          stringValue(
            item.city,
          ),

          stringValue(
            item.address,
          ),

          stringValue(
            item.phone,
          ),

          stringValue(
            item.email,
          ),
        ),
    })
  }

  for (
    const item of jobs
  ) {

    const slug =
      stringValue(
        item.slug,
      )

    add({
      id:
        `job:${
          slug ||
          idValue(item.id) ||
          'unknown'
        }`,

      type:
        'job',

      title:
        stringValue(
          item.title,
        ),

      url:
        null,

      text:
        joinText(
          `Job status: ${
            stringValue(
              item.jobStatus,
            )
          }`,

          stringValue(
            item.department,
          ),

          stringValue(
            item.location,
          ),

          stringValue(
            item.workModel,
          ),

          stringValue(
            item.employmentType,
          ),

          stringValue(
            item.summary,
          ),

          flattenText(
            item.description,
          ),
        ),
    })
  }

  // The rebuilt website catalogue is the source for current public positioning.
  // Remove older CMS candidates for the same canonical route to avoid conflicting answers.
  const rebuiltPaths = new Set(websitePages.map((page) => '/' + page.slug))
  for (let index = candidates.length - 1; index >= 0; index--) {
    const url = candidates[index].url
    if (!url) continue
    try {
      const pathname = new URL(url, 'https://afluma.com').pathname.replace(/\/$/, '') || '/'
      if (rebuiltPaths.has(pathname)) candidates.splice(index, 1)
    } catch { /* Non-URL CMS references are retained for the existing scorer. */ }
  }
  for (const page of websitePages) {
    add({ id: 'website:' + (page.slug || 'home'), type: 'page', pageType: page.slug.startsWith('products/') ? 'product' : page.slug.startsWith('services/') ? 'service' : 'company', title: page.title, url: 'https://afluma.com/' + page.slug, text: [page.description, ...page.sections.flatMap((section) => [section.title, section.body, ...(section.items || [])]), ...(page.slug.startsWith('products/') ? ['Coming soon. Register interest on the product launch page. Pricing and launch date are not announced.'] : [])].join('\n') })
  }

  const ranked =
    candidates
      .map(
        (source) =>
          scoreSource(
            cleanQuestion,
            {
              ...source,

              text:
                source.text.slice(
                  0,
                  MAX_SOURCE_TEXT,
                ),
            },
          ),
      )
      .filter(
        (source) =>
          source.score >= 12,
      )
      .sort(
        (
          a,
          b,
        ) =>
          b.score -
          a.score,
      )
      .slice(
        0,
        MAX_RESULTS,
      )

  const selected:
    AflumaKnowledgeSource[] = []

  const blocks:
    string[] = []

  let size = 0

  for (
    const source of ranked
  ) {

    const block =
      sourceBlock(
        source,
      )

    if (
      size +
        block.length >
      MAX_CONTEXT
    ) {
      continue
    }

    selected.push(
      source,
    )

    blocks.push(
      block,
    )

    size +=
      block.length
  }

  return {
    question:
      cleanQuestion,

    sources:
      selected,

    context:
      blocks.join(
        '\n\n',
      ),

    counts: {
      page:
        pages.length,

      service:
        services.length,

      solution:
        solutions.length,

      industry:
        industries.length,

      product:
        products.length,

      'case-study':
        caseStudies.length,

      post:
        posts.length,

      faq:
        faqs.length,

      location:
        locations.length,

      job:
        jobs.length,
    },
  }
}
