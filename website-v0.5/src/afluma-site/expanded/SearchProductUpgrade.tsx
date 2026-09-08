import Link from 'next/link'
import { getSearchAuthorityPage, type SearchAuthorityCard } from './searchProductContent'
import styles from './SearchProductUpgrade.module.css'

const statusLabels: Record<NonNullable<SearchAuthorityCard['status']>, string> = {
  implemented: 'Implemented',
  'in-development': 'In development',
  research: 'Research / platform direction',
  planned: 'Planned',
  'evidence-gated': 'Evidence gated',
}

function JsonLd({ slug }: { slug: string }) {
  const page = getSearchAuthorityPage(slug)
  if (!page?.schema) return null

  const canonical = `https://afluma.com/${page.slug.replace(/^\/+|\/+$/g, '')}/`
  const data = {
    '@context': 'https://schema.org',
    '@type': page.schema.type,
    name: page.schema.name,
    description: page.schema.description,
    url: canonical,
    ...(page.schema.applicationCategory ? { applicationCategory: page.schema.applicationCategory } : {}),
    creator: {
      '@type': 'Organization',
      name: 'Afluma',
      url: 'https://afluma.com/',
    },
  }

  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />
}

function Status({ value }: { value?: SearchAuthorityCard['status'] }) {
  if (!value) return null
  return <span className={`${styles.status} ${styles[`status_${value.replace('-', '_')}`]}`}>{statusLabels[value]}</span>
}

function Card({ card, index }: { card: SearchAuthorityCard; index: number }) {
  return (
    <article className={styles.card}>
      <div className={styles.cardTop}>
        <span>{card.label || String(index + 1).padStart(2, '0')}</span>
        <Status value={card.status} />
      </div>
      <h3>{card.title}</h3>
      <p>{card.body}</p>
      {card.href ? <Link href={card.href}>Explore <span aria-hidden="true">↗</span></Link> : null}
    </article>
  )
}

export function SearchProductUpgrade({ slug }: { slug: string }) {
  const page = getSearchAuthorityPage(slug)
  if (!page) return null

  return (
    <div className={styles.wrap} data-search-authority={page.slug}>
      <JsonLd slug={page.slug} />
      <section className={styles.introBand} aria-labelledby={`${page.slug.replace(/\//g, '-')}-authority-heading`}>
        <div className={styles.shell}>
          <span className={styles.kicker}>{page.label}</span>
          <h2 id={`${page.slug.replace(/\//g, '-')}-authority-heading`}>Built to be useful to people, understandable to search, and operable by agents.</h2>
          <p>This layer adds the product truth, technical context, research depth and semantic structure needed for Afluma’s highest-value pages to stand on their own instead of depending on generic marketing copy.</p>
        </div>
      </section>

      {page.sections.map((section) => (
        <section key={section.id} id={section.id} className={`${styles.section} ${styles[`tone_${section.tone || 'light'}`]}`}>
          <div className={styles.shell}>
            <header className={styles.heading}>
              <span className={styles.kicker}>{section.eyebrow}</span>
              <h2>{section.title}</h2>
              <p>{section.intro}</p>
            </header>

            {section.cards?.length ? (
              <div className={styles.grid}>
                {section.cards.map((card, index) => <Card key={`${section.id}-${card.title}`} card={card} index={index} />)}
              </div>
            ) : null}

            {section.bullets?.length ? (
              <ul className={styles.bullets}>
                {section.bullets.map((item) => <li key={item}>{item}</li>)}
              </ul>
            ) : null}

            {section.questions?.length ? (
              <div className={styles.questions}>
                {section.questions.map((item) => (
                  <details key={item.question} className={styles.question}>
                    <summary>{item.question}</summary>
                    <div><p>{item.answer}</p></div>
                  </details>
                ))}
              </div>
            ) : null}
          </div>
        </section>
      ))}
    </div>
  )
}
