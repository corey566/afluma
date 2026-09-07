'use client'

import Link from 'next/link'

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from 'react'

import styles from './AskAflumaClient.module.css'


type AskLink = {
  label: string
  href: string
}


type PresentationItem = {
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


type AskAflumaPresentation = {
  references:
    PresentationItem[]

  relatedContent:
    PresentationItem[]

  faqQuestions:
    string[]
}

type ApiResponse = {
  status:
    | 'answered'
    | 'insufficient_context'
    | 'handoff'

  answer: string

  confidence:
    | 'high'
    | 'medium'
    | 'low'

  sourceIds: string[]

  recommendedLinks: AskLink[]

  suggestedAction:
    | 'none'
    | 'explore'
    | 'start_project'
    | 'contact'

  disclaimer:
    | string
    | null

  presentation?:
    AskAflumaPresentation
}


type ChatMessage = {
  id: string

  role:
    | 'user'
    | 'assistant'

  content: string

  response?:
    ApiResponse
}


type Props = {
  endpoint: string
  preview: boolean
}


type GenerationPhase =
  | 'idle'
  | 'understanding'
  | 'searching'
  | 'composing'
  | 'revealing'


type ContentKind =
  | 'Service'
  | 'Product'
  | 'Insight'
  | 'Work'
  | 'Industry'
  | 'Company'
  | 'Resource'


const openingSuggestions = [
  'What does Afluma do?',
  'Explore Afluma services',
  'Tell me about Afluma Commerce',
  'What is SerenOps?',
] as const


function makeId() {
  return `${Date.now()}-${Math.random()
    .toString(36)
    .slice(2)}`
}


function wait(
  milliseconds: number,
) {

  return new Promise<void>(
    (resolve) => {

      window.setTimeout(
        resolve,
        milliseconds,
      )

    },
  )
}


function safeHref(
  href: string,
): boolean {

  const value =
    href.trim()


  return (
    value.startsWith(
      '/',
    ) ||
    /^https:\/\/(?:www\.)?afluma\.com(?:\/|$)/i.test(
      value,
    )
  )
}


function cleanLinks(
  links:
    AskLink[],
): AskLink[] {

  const seen =
    new Set<string>()


  return links
    .filter(
      (link) =>
        Boolean(
          link &&
          typeof link.label ===
            'string' &&
          typeof link.href ===
            'string',
        ),
    )
    .map(
      (link) => ({
        label:
          link.label.trim(),

        href:
          link.href.trim(),
      }),
    )
    .filter(
      (link) =>
        Boolean(
          link.label &&
          safeHref(
            link.href,
          ),
        ),
    )
    .filter(
      (link) => {

        const key =
          `${link.label.toLowerCase()}|${link.href}`


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


function kindFromHref(
  href: string,
): ContentKind {

  const path =
    href.toLowerCase()


  if (
    path.includes(
      '/services/',
    ) ||
    path ===
      '/services/'
  ) {

    return 'Service'

  }


  if (
    path.includes(
      '/products/',
    ) ||
    path ===
      '/products/'
  ) {

    return 'Product'

  }


  if (
    path.includes(
      '/insights/',
    ) ||
    path.includes(
      '/research/',
    ) ||
    path.includes(
      '/guides/',
    )
  ) {

    return 'Insight'

  }


  if (
    path.includes(
      '/work/',
    ) ||
    path.includes(
      '/case-studies/',
    )
  ) {

    return 'Work'

  }


  if (
    path.includes(
      '/industries/',
    )
  ) {

    return 'Industry'

  }


  if (
    path.includes(
      '/about/',
    ) ||
    path.includes(
      '/company/',
    ) ||
    path.includes(
      '/careers/',
    ) ||
    path.includes(
      '/contact/',
    )
  ) {

    return 'Company'

  }


  return 'Resource'
}


function pathLabel(
  href: string,
): string {

  try {

    const url =
      new URL(
        href,
        'https://afluma.com',
      )


    return (
      url.pathname ===
        '/'
        ? 'afluma.com'
        : url.pathname
    )

  }
  catch {

    return href

  }
}


function escapeRegex(
  value: string,
) {

  return value.replace(
    /[.*+?^${}()|[\]\\]/g,
    '\\$&',
  )
}


function renderLinkedPlainText(
  text: string,
  links: AskLink[],
): ReactNode[] {

  const candidates =
    links
      .filter(
        (link) =>
          link.label.length >=
          4,
      )
      .sort(
        (
          left,
          right,
        ) =>
          right.label.length -
          left.label.length,
      )


  if (
    candidates.length ===
      0
  ) {

    return [
      text,
    ]

  }


  const matcher =
    new RegExp(
      `(${candidates
        .map(
          (link) =>
            escapeRegex(
              link.label,
            ),
        )
        .join('|')})`,
      'gi',
    )


  const parts =
    text.split(
      matcher,
    )


  return parts.map(
    (
      part,
      index,
    ) => {

      const matched =
        candidates.find(
          (link) =>
            link.label
              .toLowerCase() ===
            part.toLowerCase(),
        )


      if (!matched) {

        return (
          <span
            key={`plain-${index}`}
          >
            {part}
          </span>
        )

      }


      return (
        <Link
          key={`link-${index}-${matched.href}`}
          href={matched.href}
          className={styles.inlineLink}
        >
          {part}

          <span
            aria-hidden="true"
          >
            ↗
          </span>
        </Link>
      )

    },
  )
}


function renderInline(
  text: string,
  links: AskLink[],
): ReactNode[] {

  const parts =
    text.split(
      /(\*\*[^*]+\*\*|`[^`]+`)/g,
    )


  return parts.flatMap<ReactNode>(
    (
      part,
      index,
    ) => {

      if (
        part.startsWith(
          '**',
        ) &&
        part.endsWith(
          '**',
        ) &&
        part.length >
          4
      ) {

        return [
          <strong
            key={`strong-${index}`}
          >
            {renderLinkedPlainText(
              part.slice(
                2,
                -2,
              ),
              links,
            )}
          </strong>,
        ]

      }


      if (
        part.startsWith(
          '`',
        ) &&
        part.endsWith(
          '`',
        ) &&
        part.length >
          2
      ) {

        return [
          <code
            key={`code-${index}`}
          >
            {part.slice(
              1,
              -1,
            )}
          </code>,
        ]

      }


      return renderLinkedPlainText(
        part,
        links,
      )

    },
  )
}


function RichAnswer({
  content,
  links,
}: {
  content: string
  links: AskLink[]
}) {

  const lines =
    content
      .replace(
        /\r/g,
        '',
      )
      .split(
        '\n',
      )


  return (
    <div
      className={
        styles.richAnswer
      }
    >

      {lines.map(
        (
          raw,
          index,
        ) => {

          const line =
            raw.trim()


          if (!line) {

            return (
              <div
                key={`space-${index}`}
                className={
                  styles.answerSpace
                }
                aria-hidden="true"
              />
            )

          }


          const heading =
            line.match(
              /^#{1,3}\s+(.+)$/,
            )


          if (heading) {

            return (
              <h4
                key={`heading-${index}`}
              >
                {renderInline(
                  heading[1],
                  links,
                )}
              </h4>
            )

          }


          const numbered =
            line.match(
              /^(\d+)\.\s+(.+)$/,
            )


          if (numbered) {

            return (
              <div
                key={`number-${index}`}
                className={
                  styles.numberedItem
                }
              >

                <span
                  className={
                    styles.listNumber
                  }
                >
                  {numbered[1]}.
                </span>


                <div>
                  {renderInline(
                    numbered[2],
                    links,
                  )}
                </div>

              </div>
            )

          }


          const bullet =
            line.match(
              /^[-*•]\s+(.+)$/,
            )


          if (bullet) {

            return (
              <div
                key={`bullet-${index}`}
                className={
                  styles.bulletItem
                }
              >

                <span
                  className={
                    styles.bulletDot
                  }
                  aria-hidden="true"
                />


                <div>
                  {renderInline(
                    bullet[1],
                    links,
                  )}
                </div>

              </div>
            )

          }


          return (
            <p
              key={`paragraph-${index}`}
            >
              {renderInline(
                line,
                links,
              )}
            </p>
          )

        },
      )}

    </div>
  )
}


function buildRevealFrames(
  answer: string,
): string[] {

  const normalized =
    answer
      .replace(
        /\r/g,
        '',
      )
      .trim()


  if (!normalized) {

    return []

  }


  const lines =
    normalized.split(
      '\n',
    )


  const frames:
    string[] =
    []


  let current =
    ''


  for (
    const rawLine of lines
  ) {

    const line =
      rawLine.trimEnd()


    if (!line) {

      if (
        current &&
        !current.endsWith(
          '\n\n',
        )
      ) {

        current +=
          '\n'

      }


      continue

    }


    current =
      current
        ? `${current}\n${line}`
        : line


    frames.push(
      current,
    )

  }


  if (
    frames.length ===
      0
  ) {

    frames.push(
      normalized,
    )

  }


  if (
    frames[
      frames.length -
        1
    ] !==
      normalized
  ) {

    frames.push(
      normalized,
    )

  }


  return frames
}


function buildFollowUps(
  question: string,
  links: AskLink[],
): string[] {

  const q =
    question.toLowerCase()


  const prompts:
    string[] =
    []


  for (
    const link of
    links.slice(
      0,
      2,
    )
  ) {

    prompts.push(
      `Tell me more about ${link.label}`,
    )

  }


  if (
    /web|website|digital experience|cms|ecommerce/i.test(
      q,
    )
  ) {

    prompts.push(
      'Can Afluma help redesign an existing digital experience?',
    )

    prompts.push(
      'How do I start a digital project with Afluma?',
    )

  }
  else if (
    /commerce|pos|inventory|retail/i.test(
      q,
    )
  ) {

    prompts.push(
      'What else should I know about Afluma Commerce?',
    )

    prompts.push(
      'How can I discuss a commerce project with Afluma?',
    )

  }
  else if (
    /serenops|infrastructure|operations/i.test(
      q,
    )
  ) {

    prompts.push(
      'What else can I explore about SerenOps?',
    )

    prompts.push(
      'How can I discuss infrastructure operations with Afluma?',
    )

  }
  else {

    prompts.push(
      'Which Afluma capabilities are most relevant to this?',
    )

    prompts.push(
      'How can I discuss this with Afluma?',
    )

  }


  const seen =
    new Set<string>()


  return prompts
    .map(
      (prompt) =>
        prompt.trim(),
    )
    .filter(Boolean)
    .filter(
      (prompt) => {

        const key =
          prompt.toLowerCase()


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


function ArrowIcon() {

  return (
    <svg
      viewBox="0 0 20 20"
      aria-hidden="true"
    >
      <path
        d="M4 10h11M11 6l4 4-4 4"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.45"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}


function SearchIcon() {

  return (
    <svg
      viewBox="0 0 20 20"
      aria-hidden="true"
    >
      <circle
        cx="8.8"
        cy="8.8"
        r="5.2"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.45"
      />

      <path
        d="m12.7 12.7 3.5 3.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.45"
        strokeLinecap="round"
      />
    </svg>
  )
}


function CloseIcon() {

  return (
    <svg
      viewBox="0 0 20 20"
      aria-hidden="true"
    >
      <path
        d="m5 5 10 10M15 5 5 15"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </svg>
  )
}


function PlusIcon() {

  return (
    <svg
      viewBox="0 0 20 20"
      aria-hidden="true"
    >
      <path
        d="M10 4v12M4 10h12"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </svg>
  )
}


function SparkIcon() {

  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path
        d="M12 1.8c.46 5.78 4.33 9.65 10.1 10.2-5.77.54-9.64 4.41-10.1 10.2-.46-5.79-4.33-9.66-10.1-10.2C7.67 11.45 11.54 7.58 12 1.8Z"
        fill="currentColor"
      />
    </svg>
  )
}


function GenerationStage({
  phase,
}: {
  phase: GenerationPhase
}) {

  const title =
    phase ===
      'searching'
      ? 'Searching Afluma knowledge'
      : phase ===
          'composing'
        ? 'Building your answer'
        : 'Understanding your question'


  const detail =
    phase ===
      'searching'
      ? 'Finding the most relevant approved Afluma content.'
      : phase ===
          'composing'
        ? 'Grounding the response and validating its sources.'
        : 'Reading your intent and conversation context.'


  return (
    <div
      className={
        styles.generationStage
      }
      role="status"
      aria-live="polite"
    >

      <div
        className={
          styles.generationVisual
        }
        aria-hidden="true"
      >
        <span
          className={
            styles.generationOrbit
          }
        />

        <span
          className={
            styles.generationOrbitInner
          }
        />

        <span
          className={
            styles.generationCore
          }
        >
          <SparkIcon />
        </span>
      </div>


      <span
        className={
          styles.generationEyebrow
        }
      >
        AFLUMA INTELLIGENCE
      </span>


      <strong>
        {title}
      </strong>


      <p>
        {detail}
      </p>


      <div
        className={
          styles.generationProgress
        }
        aria-hidden="true"
      >
        <span />
      </div>

    </div>
  )
}


function FeaturedCTA({
  question,
  response,
  links,
  onNavigate,
}: {
  question: string
  response: ApiResponse
  links: AskLink[]
  onNavigate: () => void
}) {

  const q =
    question.toLowerCase()


  let title =
    'Explore the next useful path with Afluma'

  let copy =
    'See the most relevant capability or talk to Afluma about what you are trying to build.'

  let label =
    'Explore'

  let href =
    links[0]?.href ??
    '/services/'


  if (
    /web|website|digital experience|cms/i.test(
      q,
    )
  ) {

    title =
      'Build a modern digital experience'

    copy =
      'Explore how Afluma approaches digital products, websites and experience engineering.'

  }


  if (
    /commerce|pos|inventory|retail/i.test(
      q,
    )
  ) {

    title =
      'Explore Afluma Commerce'

    copy =
      'Continue into the relevant Afluma Commerce information and capabilities.'

  }


  if (
    /serenops/i.test(
      q,
    )
  ) {

    title =
      'Explore SerenOps'

    copy =
      'Continue into the relevant SerenOps product information.'

  }


  if (
    response.suggestedAction ===
      'start_project'
  ) {

    title =
      'Have a project in mind?'

    copy =
      'Share the context, challenge and outcome you are working toward.'

    label =
      'Start a project'

    href =
      '/start-project/'

  }


  if (
    response.suggestedAction ===
      'contact'
  ) {

    title =
      'Talk to Afluma'

    copy =
      'Connect with the team about the question or project you are exploring.'

    label =
      'Contact Afluma'

    href =
      '/contact/'

  }


  if (
    response.suggestedAction ===
      'none' &&
    links.length ===
      0
  ) {

    return null

  }


  return (
    <Link
      href={href}
      className={
        styles.featuredCta
      }
      onClick={onNavigate}
    >

      <div>

        <span>
          NEXT STEP
        </span>

        <strong>
          {title}
        </strong>

        <p>
          {copy}
        </p>

      </div>


      <span
        className={
          styles.featuredCtaAction
        }
      >
        {label}

        <ArrowIcon />
      </span>

    </Link>
  )
}


function References({
  links,
}: {
  links: AskLink[]
}) {

  if (
    links.length ===
      0
  ) {

    return null

  }


  return (
    <section
      className={
        styles.resultSection
      }
    >

      <div
        className={
          styles.sectionHeading
        }
      >
        <span>
          References
        </span>

        <small>
          Approved Afluma pages
        </small>
      </div>


      <div
        className={
          styles.referenceList
        }
      >

        {links
          .slice(
            0,
            6,
          )
          .map(
            (link) => (

              <Link
                key={`${link.label}-${link.href}`}
                href={link.href}
                className={
                  styles.referenceRow
                }
              >

                <span
                  className={
                    styles.referenceIcon
                  }
                  aria-hidden="true"
                >
                  ↗
                </span>


                <span
                  className={
                    styles.referenceText
                  }
                >
                  <strong>
                    {link.label}
                  </strong>

                  <small>
                    {pathLabel(
                      link.href,
                    )}
                  </small>
                </span>

              </Link>

            ),
          )}

      </div>

    </section>
  )
}


function RelatedContent({
  links,
  onNavigate,
}: {
  links: AskLink[]
  onNavigate: () => void
}) {

  if (
    links.length ===
      0
  ) {

    return null

  }


  return (
    <section
      className={
        styles.resultSection
      }
    >

      <div
        className={
          styles.sectionHeading
        }
      >
        <span>
          Related content
        </span>

        <small>
          Continue exploring
        </small>
      </div>


      <div
        className={
          styles.relatedGrid
        }
      >

        {links
          .slice(
            0,
            4,
          )
          .map(
            (
              link,
              index,
            ) => {

              const kind =
                kindFromHref(
                  link.href,
                )


              return (
                <Link
                  key={`${link.href}-${index}`}
                  href={link.href}
                  className={
                    styles.relatedCard
                  }
                  onClick={onNavigate}
                >

                  <span
                    className={
                      styles.cardGlow
                    }
                    aria-hidden="true"
                  />


                  <span
                    className={
                      styles.cardKind
                    }
                  >
                    {kind}
                  </span>


                  <strong>
                    {link.label}
                  </strong>


                  <span
                    className={
                      styles.cardRead
                    }
                  >
                    {kind ===
                      'Insight'
                      ? 'Read more'
                      : 'Explore'}

                    <ArrowIcon />
                  </span>

                </Link>
              )

            },
          )}

      </div>

    </section>
  )
}


function FollowUpQuestions({
  questions,
  disabled,
  onQuestion,
}: {
  questions: string[]
  disabled: boolean
  onQuestion: (
    question: string,
  ) => void
}) {

  if (
    questions.length ===
      0
  ) {

    return null

  }


  return (
    <section
      className={
        styles.resultSection
      }
    >

      <div
        className={
          styles.askNextHeading
        }
      >
        <span
          aria-hidden="true"
        >
          ☷
        </span>

        <strong>
          What would you like to ask next?
        </strong>
      </div>


      <div
        className={
          styles.followUpList
        }
      >

        {questions.map(
          (question) => (

            <button
              key={question}
              type="button"
              disabled={disabled}
              onClick={() => {
                onQuestion(
                  question,
                )
              }}
            >
              <span>
                {question}
              </span>

              <PlusIcon />
            </button>

          ),
        )}

      </div>

    </section>
  )
}


function EnrichedReferences({
  references,
}: {
  references:
    PresentationItem[]
}) {

  if (
    references.length ===
      0
  ) {

    return null

  }


  return (
    <section
      className={
        styles.resultSection
      }
    >

      <div
        className={
          styles.sectionHeading
        }
      >
        <span>
          References
        </span>

        <small>
          Sources used for this answer
        </small>
      </div>


      <div
        className={
          styles.referenceList
        }
      >

        {references.map(
          (
            reference,
            index,
          ) => (

            <Link
              key={
                `${reference.sourceId}-${reference.href}`
              }
              href={
                reference.href
              }
              className={
                styles.referenceRow
              }
            >

              <span
                className={
                  styles.referenceIndex
                }
                aria-hidden="true"
              >
                {index + 1}
              </span>


              <span
                className={
                  styles.referenceText
                }
              >

                <span
                  className={
                    styles.referenceMeta
                  }
                >
                  {reference.type}
                </span>


                <strong>
                  {reference.title}
                </strong>


                {reference.excerpt && (
                  <span
                    className={
                      styles.referenceExcerpt
                    }
                  >
                    {reference.excerpt}
                  </span>
                )}

              </span>


              <span
                className={
                  styles.referenceArrow
                }
                aria-hidden="true"
              >
                ↗
              </span>

            </Link>

          ),
        )}

      </div>

    </section>
  )
}


function EnrichedRelatedContent({
  items,
  onNavigate,
}: {
  items:
    PresentationItem[]

  onNavigate:
    () => void
}) {

  if (
    items.length ===
      0
  ) {

    return null

  }


  return (
    <section
      className={
        styles.resultSection
      }
    >

      <div
        className={
          styles.sectionHeading
        }
      >
        <span>
          Related content
        </span>

        <small>
          From Afluma knowledge
        </small>
      </div>


      <div
        className={
          styles.relatedGrid
        }
      >

        {items.map(
          (
            item,
            index,
          ) => (

            <Link
              key={
                `${item.sourceId}-${index}`
              }
              href={
                item.href
              }
              className={
                styles.relatedCard
              }
              onClick={
                onNavigate
              }
            >

              <span
                className={
                  styles.cardGlow
                }
                aria-hidden="true"
              />


              <span
                className={
                  styles.cardKind
                }
              >
                {item.type}
              </span>


              <strong>
                {item.title}
              </strong>


              {item.excerpt && (
                <p
                  className={
                    styles.relatedExcerpt
                  }
                >
                  {item.excerpt}
                </p>
              )}


              <span
                className={
                  styles.cardRead
                }
              >
                {item.type ===
                  'Insight'
                  ? 'Read more'
                  : 'Explore'}

                <ArrowIcon />
              </span>

            </Link>

          ),
        )}

      </div>

    </section>
  )
}

function AnswerResult({
  message,
  question,
  preview,
  loading,
  onFollowUp,
  onNavigate,
}: {
  message: ChatMessage
  question: string
  preview: boolean
  loading: boolean
  onFollowUp: (
    question: string,
  ) => void
  onNavigate: () => void
}) {

  const response =
    message.response


  const links =
    useMemo(
      () => {

        if (!response) {

          return []

        }


        const presentationLinks =
          [
            ...(
              response.presentation
                ?.references ??
              []
            ),

            ...(
              response.presentation
                ?.relatedContent ??
              []
            ),
          ]
            .map(
              (item) => ({
                label:
                  item.title,

                href:
                  item.href,
              }),
            )


        return cleanLinks([
          ...(
            response.recommendedLinks ??
            []
          ),

          ...presentationLinks,
        ])

      },
      [
        response,
      ],
    )


  const followUps =
    useMemo(
      () => {

        if (!response) {

          return []

        }


        const cmsQuestions =
          response.presentation
            ?.faqQuestions ??
          []


        if (
          cmsQuestions.length >
            0
        ) {

          return cmsQuestions
            .slice(
              0,
              4,
            )

        }


        return buildFollowUps(
          question,
          links,
        )

      },
      [
        question,
        links,
        response,
      ],
    )


  return (
    <article
      className={
        styles.answerResult
      }
    >

      <div
        className={
          styles.answerIdentity
        }
      >
        <span
          className={
            styles.answerOrb
          }
        >
          <SparkIcon />
        </span>

        <span>
          AFLUMA
        </span>
      </div>


      <div
        className={
          styles.answerContent
        }
      >

        <RichAnswer
          content={
            message.content
          }
          links={links}
        />


        {response && (

          <>

            <FeaturedCTA
              question={question}
              response={response}
              links={links}
              onNavigate={onNavigate}
            />


            {response.presentation &&
            response.presentation.references.length >
              0 ? (

              <EnrichedReferences
                references={
                  response.presentation.references
                }
              />

            ) : (

              <References
                links={links}
              />

            )}


            {response.presentation &&
            response.presentation.relatedContent.length >
              0 ? (

              <EnrichedRelatedContent
                items={
                  response.presentation.relatedContent
                }
                onNavigate={
                  onNavigate
                }
              />

            ) : (

              <RelatedContent
                links={links}
                onNavigate={
                  onNavigate
                }
              />

            )}


            <FollowUpQuestions
              questions={followUps}
              disabled={loading}
              onQuestion={
                onFollowUp
              }
            />


            <div
              className={
                styles.answerTrust
              }
            >
              <span>
                Grounded in approved Afluma content
              </span>

              <span
                aria-hidden="true"
              >
                •
              </span>

              <span>
                {response.confidence} confidence
              </span>
            </div>


            {response.disclaimer && (
              <p
                className={
                  styles.disclaimer
                }
              >
                {response.disclaimer}
              </p>
            )}


            {preview &&
              response.sourceIds.length >
                0 && (

              <details
                className={
                  styles.previewDetails
                }
              >
                <summary>
                  Retrieval details
                </summary>

                <div>
                  {response.sourceIds.map(
                    (sourceId) => (
                      <span
                        key={sourceId}
                      >
                        {sourceId}
                      </span>
                    ),
                  )}
                </div>
              </details>

            )}

          </>

        )}

      </div>

    </article>
  )
}


function validPresentationItem(
  value: unknown,
): value is PresentationItem {

  if (
    !value ||
    typeof value !==
      'object'
  ) {

    return false

  }


  const item =
    value as
      Record<
        string,
        unknown
      >


  return (
    typeof item.sourceId ===
      'string' &&
    typeof item.title ===
      'string' &&
    typeof item.href ===
      'string' &&
    typeof item.type ===
      'string' &&
    (
      typeof item.pageType ===
        'string' ||
      item.pageType ===
        null
    ) &&
    (
      typeof item.excerpt ===
        'string' ||
      item.excerpt ===
        null
    )
  )

}


function validPresentation(
  value: unknown,
): value is AskAflumaPresentation {

  if (
    !value ||
    typeof value !==
      'object'
  ) {

    return false

  }


  const data =
    value as
      Record<
        string,
        unknown
      >


  return (
    Array.isArray(
      data.references,
    ) &&
    data.references.every(
      validPresentationItem,
    ) &&
    Array.isArray(
      data.relatedContent,
    ) &&
    data.relatedContent.every(
      validPresentationItem,
    ) &&
    Array.isArray(
      data.faqQuestions,
    ) &&
    data.faqQuestions.every(
      (question) =>
        typeof question ===
          'string',
    )
  )

}


async function fetchAskPresentation(
  question: string,
  response: ApiResponse,
  preview: boolean,
): Promise<AskAflumaPresentation | null> {

  if (!preview) {

    return null

  }


  try {

    const result =
      await fetch(
        '/api/ask-afluma-presentation-preview',
        {
          method:
            'POST',

          headers: {
            'Content-Type':
              'application/json',
          },

          cache:
            'no-store',

          body:
            JSON.stringify({
              question,

              sourceIds:
                response.sourceIds,

              recommendedLinks:
                response.recommendedLinks,
            }),
        },
      )


    if (!result.ok) {

      return null

    }


    const data:
      unknown =
      await result.json()


    if (
      !validPresentation(
        data,
      )
    ) {

      return null

    }


    return data

  }
  catch {

    return null

  }

}

function validResponse(
  value: unknown,
): value is ApiResponse {

  if (
    !value ||
    typeof value !==
      'object'
  ) {

    return false

  }


  const data =
    value as
      Record<
        string,
        unknown
      >


  return (
    typeof data.answer ===
      'string' &&
    typeof data.status ===
      'string' &&
    typeof data.confidence ===
      'string' &&
    Array.isArray(
      data.sourceIds,
    ) &&
    Array.isArray(
      data.recommendedLinks,
    ) &&
    typeof data.suggestedAction ===
      'string'
  )
}


export default function AskAflumaClient({
  endpoint,
  preview,
}: Props) {

  const [open, setOpen] =
    useState(false)

  const [question, setQuestion] =
    useState('')

  const [messages, setMessages] =
    useState<ChatMessage[]>([])

  const [loading, setLoading] =
    useState(false)

  const [
    generationPhase,
    setGenerationPhase,
  ] =
    useState<GenerationPhase>(
      'idle',
    )

  const [error, setError] =
    useState<
      string |
      null
    >(
      null,
    )


  const inputRef =
    useRef<
      HTMLTextAreaElement |
      null
    >(
      null,
    )


  const viewportRef =
    useRef<
      HTMLDivElement |
      null
    >(
      null,
    )


  const closePanel =
    useCallback(
      () => {

        /*
         * Close immediately even while an AI request is running.
         * Also restore document scrolling as a defensive fallback.
         */
        setOpen(
          false,
        )

        if (
          typeof document !==
            'undefined'
        ) {

          document.body.style.overflow =
            ''

        }

      },
      [],
    )


  useEffect(
    () => {

      const handler =
        () => {

          setOpen(
            true,
          )

        }


      window.addEventListener(
        'afluma:ask-open',
        handler,
      )


      return () => {

        window.removeEventListener(
          'afluma:ask-open',
          handler,
        )

      }

    },
    [],
  )


  useEffect(
    () => {

      if (!open) {

        return

      }


      const timer =
        window.setTimeout(
          () => {

            inputRef.current?.focus()

          },
          160,
        )


      const handleEscape =
        (
          event:
            globalThis.KeyboardEvent,
        ) => {

          if (
            event.key ===
              'Escape'
          ) {

            closePanel()

          }

        }


      window.addEventListener(
        'keydown',
        handleEscape,
      )


      return () => {

        window.clearTimeout(
          timer,
        )


        window.removeEventListener(
          'keydown',
          handleEscape,
        )

      }

    },
    [
      open,
      closePanel,
    ],
  )


  useEffect(
    () => {

      if (!open) {

        return

      }


      const media =
        window.matchMedia(
          '(max-width: 760px)',
        )


      if (
        !media.matches
      ) {

        return

      }


      const previous =
        document.body.style.overflow


      document.body.style.overflow =
        'hidden'


      return () => {

        document.body.style.overflow =
          previous

      }

    },
    [
      open,
    ],
  )


  useEffect(
    () => {

      const viewport =
        viewportRef.current


      if (!viewport) {

        return

      }


      viewport.scrollTo({
        top:
          viewport.scrollHeight,

        behavior:
          generationPhase ===
            'revealing'
            ? 'auto'
            : 'smooth',
      })

    },
    [
      messages,
      generationPhase,
      error,
    ],
  )


  const clearConversation =
    useCallback(
      () => {

        if (loading) {

          return

        }


        setMessages(
          [],
        )

        setQuestion(
          '',
        )

        setError(
          null,
        )

        setGenerationPhase(
          'idle',
        )


        window.setTimeout(
          () => {

            inputRef.current?.focus()

          },
          0,
        )

      },
      [
        loading,
      ],
    )


  const sendQuestion =
    useCallback(
      async (
        explicitQuestion?:
          string,
      ) => {

        if (loading) {

          return

        }


        const clean =
          (
            explicitQuestion ??
            question
          )
            .trim()
            .slice(
              0,
              4_000,
            )


        if (!clean) {

          return

        }


        const history =
          messages
            .slice(
              -8,
            )
            .map(
              (message) => ({
                role:
                  message.role,

                content:
                  message.content,
              }),
            )


        const userMessage:
          ChatMessage = {

          id:
            makeId(),

          role:
            'user',

          content:
            clean,
        }


        setMessages(
          (current) => [
            ...current,
            userMessage,
          ],
        )


        setQuestion(
          '',
        )

        setError(
          null,
        )

        setLoading(
          true,
        )

        setGenerationPhase(
          'understanding',
        )


        const searchTimer =
          window.setTimeout(
            () => {

              setGenerationPhase(
                'searching',
              )

            },
            700,
          )


        const composeTimer =
          window.setTimeout(
            () => {

              setGenerationPhase(
                'composing',
              )

            },
            2_200,
          )


        try {

          const response =
            await fetch(
              endpoint,
              {
                method:
                  'POST',

                headers: {
                  'Content-Type':
                    'application/json',
                },

                cache:
                  'no-store',

                body:
                  JSON.stringify({
                    question:
                      clean,

                    history,
                  }),
              },
            )


          let data:
            unknown


          try {

            data =
              await response.json()

          }
          catch {

            throw new Error(
              'Ask Afluma returned an unreadable response.',
            )

          }


          if (
            !response.ok
          ) {

            if (
              response.status ===
                429
            ) {

              const retry =
                response.headers.get(
                  'retry-after',
                )


              throw new Error(
                retry
                  ? `Please try again in about ${retry} seconds.`
                  : 'Please try again shortly.',
              )

            }


            if (
              response.status ===
                503
            ) {

              throw new Error(
                'Ask Afluma is temporarily unavailable.',
              )

            }


            const apiError =
              data &&
              typeof data ===
                'object' &&
              'error' in data &&
              typeof (
                data as {
                  error?: unknown
                }
              ).error ===
                'string'
                ? (
                    data as {
                      error: string
                    }
                  ).error
                : null


            throw new Error(
              apiError ??
              'Ask Afluma could not complete that request.',
            )

          }


          if (
            !validResponse(
              data,
            )
          ) {

            throw new Error(
              'Ask Afluma returned an invalid response.',
            )

          }


          window.clearTimeout(
            searchTimer,
          )

          window.clearTimeout(
            composeTimer,
          )


          setGenerationPhase(
            'revealing',
          )


          const assistantId =
            makeId()


          setMessages(
            (current) => [
              ...current,
              {
                id:
                  assistantId,

                role:
                  'assistant',

                content:
                  '',
              },
            ],
          )


          const frames =
            buildRevealFrames(
              data.answer,
            )


          const delay =
            Math.max(
              95,

              Math.min(
                230,

                Math.round(
                  2_000 /
                  Math.max(
                    1,
                    frames.length,
                  ),
                ),
              ),
            )


          for (
            const visible of
            frames
          ) {

            setMessages(
              (current) =>
                current.map(
                  (message) =>
                    message.id ===
                      assistantId
                      ? {
                          ...message,
                          content:
                            visible,
                        }
                      : message,
                ),
            )


            await wait(
              delay,
            )

          }


          setMessages(
            (current) =>
              current.map(
                (message) =>
                  message.id ===
                    assistantId
                    ? {
                        ...message,

                        content:
                          data.answer,

                        response:
                          data,
                      }
                    : message,
              ),
          )


          /*
           * The validated answer has already rendered.
           * Presentation enrichment is deliberately secondary.
           */
          void fetchAskPresentation(
            clean,
            data,
            preview,
          )
            .then(
              (presentation) => {

                if (!presentation) {

                  return

                }


                setMessages(
                  (current) =>
                    current.map(
                      (message) =>
                        message.id ===
                          assistantId
                          ? {
                              ...message,

                              response: {
                                ...data,

                                presentation,
                              },
                            }
                          : message,
                    ),
                )

              },
            )
        }
        catch (
          requestError
        ) {

          setError(
            requestError instanceof
              Error
              ? requestError.message
              : 'Ask Afluma is unavailable.',
          )

        }
        finally {

          window.clearTimeout(
            searchTimer,
          )

          window.clearTimeout(
            composeTimer,
          )


          setGenerationPhase(
            'idle',
          )

          setLoading(
            false,
          )

        }

      },
      [
        endpoint,
        loading,
        messages,
        preview,
        question,
      ],
    )


  const handleKeyDown =
    (
      event:
        KeyboardEvent<
          HTMLTextAreaElement
        >,
    ) => {

      if (
        event.key ===
          'Enter' &&
        !event.shiftKey
      ) {

        event.preventDefault()

        void sendQuestion()

      }

    }


  const latestUserQuestion =
    [...messages]
      .reverse()
      .find(
        (message) =>
          message.role ===
            'user',
      )
      ?.content ??
    ''


  const hasConversation =
    messages.length >
    0


  return (
    <>

      <button
        type="button"
        className={
          styles.mobileLauncher
        }
        onClick={() => {
          setOpen(
            true,
          )
        }}
        aria-label="Ask Afluma"
      >
        <span>
          <SparkIcon />
        </span>

        Ask Afluma
      </button>


      <button
        type="button"
        className={`${styles.backdrop} ${
          open
            ? styles.backdropOpen
            : ''
        }`}
        onClick={
          closePanel
        }
        onPointerDown={(event) => {
          event.preventDefault()
          event.stopPropagation()
          closePanel()
        }}
        tabIndex={
          open
            ? 0
            : -1
        }
        aria-label="Close Ask Afluma"
      />


      <section
        className={`${styles.panel} ${
          open
            ? styles.panelOpen
            : ''
        }`}
        role="dialog"
        aria-modal={true}
        aria-label="Ask Afluma"
        aria-hidden={
          !open
        }
      >

        <header
          className={
            styles.header
          }
        >

          <div
            className={
              styles.identity
            }
          >

            <span
              className={
                styles.brandOrb
              }
            >
              <SparkIcon />
            </span>


            <div>

              <div
                className={
                  styles.eyebrow
                }
              >
                AFLUMA INTELLIGENCE

                {preview && (
                  <span
                    className={
                      styles.previewBadge
                    }
                  >
                    PRIVATE PREVIEW
                  </span>
                )}
              </div>


              <h2>
                Ask Afluma
              </h2>

            </div>

          </div>


          <div
            className={
              styles.headerActions
            }
          >

            {hasConversation && (
              <button
                type="button"
                className={
                  styles.iconButton
                }
                onClick={
                  clearConversation
                }
                disabled={
                  loading
                }
                aria-label="New conversation"
              >
                <PlusIcon />
              </button>
            )}


            <button
              type="button"
              className={
                styles.iconButton
              }
              onClick={
                closePanel
              }
              onPointerDown={(event) => {
                event.preventDefault()
                event.stopPropagation()
                closePanel()
              }}
              aria-label="Close Ask Afluma"
            >
              <CloseIcon />
            </button>

          </div>

        </header>


        <div
          ref={
            viewportRef
          }
          className={
            styles.viewport
          }
        >

          {!hasConversation && (
            <div
              className={
                styles.welcome
              }
            >

              <span
                className={
                  styles.welcomeOrb
                }
              >
                <SparkIcon />
              </span>


              <span
                className={
                  styles.welcomeEyebrow
                }
              >
                ASK · DISCOVER · MOVE FORWARD
              </span>


              <h3>
                What would you like to know about Afluma?
              </h3>


              <p>
                Explore the company, services, products, capabilities and ways to work with Afluma.
              </p>


              <div
                className={
                  styles.suggestionGrid
                }
              >

                {openingSuggestions.map(
                  (suggestion) => (

                    <button
                      key={
                        suggestion
                      }
                      type="button"
                      disabled={
                        loading
                      }
                      onClick={() => {
                        void sendQuestion(
                          suggestion,
                        )
                      }}
                    >
                      <span>
                        {suggestion}
                      </span>

                      <ArrowIcon />
                    </button>

                  ),
                )}

              </div>

            </div>
          )}


          {messages.map(
            (
              message,
              index,
            ) => {

              if (
                message.role ===
                  'user'
              ) {

                return (
                  <article
                    key={
                      message.id
                    }
                    className={
                      styles.userQuery
                    }
                  >

                    <span>
                      YOU
                    </span>

                    <div>
                      {message.content}
                    </div>

                  </article>
                )

              }


              let questionForAnswer =
                ''


              for (
                let cursor =
                  index - 1;
                cursor >= 0;
                cursor -= 1
              ) {

                if (
                  messages[cursor]
                    ?.role ===
                    'user'
                ) {

                  questionForAnswer =
                    messages[cursor]
                      .content

                  break

                }

              }


              return (
                <AnswerResult
                  key={
                    message.id
                  }
                  message={
                    message
                  }
                  question={
                    questionForAnswer
                  }
                  preview={
                    preview
                  }
                  loading={
                    loading
                  }
                  onFollowUp={
                    (
                      followUp,
                    ) => {
                      void sendQuestion(
                        followUp,
                      )
                    }
                  }
                  onNavigate={
                    closePanel
                  }
                />
              )

            },
          )}


          {loading &&
            generationPhase !==
              'revealing' && (

            <GenerationStage
              phase={
                generationPhase
              }
            />

          )}


          {error && (
            <div
              className={
                styles.error
              }
              role="alert"
            >
              <div>
                <strong>
                  Something interrupted the answer.
                </strong>

                <span>
                  {error}
                </span>
              </div>

              <button
                type="button"
                onClick={() => {
                  setError(
                    null,
                  )
                }}
              >
                Dismiss
              </button>
            </div>
          )}

        </div>


        <footer
          className={
            styles.composerArea
          }
        >

          <div
            className={
              styles.composer
            }
          >

            <span
              className={
                styles.composerOrb
              }
              aria-hidden="true"
            >
              <SparkIcon />
            </span>


            <textarea
              ref={
                inputRef
              }
              value={
                question
              }
              rows={1}
              maxLength={
                4_000
              }
              disabled={
                loading
              }
              placeholder={
                hasConversation
                  ? 'Ask a follow-up question'
                  : 'Please ask a question or initiate a search'
              }
              aria-label="Ask Afluma a question"
              onChange={
                (
                  event,
                ) => {

                  setQuestion(
                    event.target.value,
                  )

                }
              }
              onKeyDown={
                handleKeyDown
              }
            />


            <button
              type="button"
              className={
                styles.sendButton
              }
              disabled={
                loading ||
                !question.trim()
              }
              onClick={() => {
                void sendQuestion()
              }}
              aria-label="Search Ask Afluma"
            >
              <SearchIcon />
            </button>

          </div>


          <div
            className={
              styles.composerMeta
            }
          >
            <span>
              Answers use approved Afluma content.
            </span>

            <Link
              href="/start-project/"
              onClick={
                closePanel
              }
            >
              Start a project
            </Link>
          </div>

        </footer>

      </section>

    </>
  )
}