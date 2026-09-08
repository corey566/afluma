import Link from 'next/link'
import {
  genericExpandedPage,
  pageForSlug,
  shouldUseExpandedPage,
  type ExpandedCard,
  type ExpandedPage,
  type ExpandedSection,
} from './content'
import {
  ArchitectureExplorer,
  IntentPathfinder,
  LegalAccordion,
  SectionJumpNav,
  WorkforceExplorer,
} from './ExpandedAflumaClient'
import { SearchProductUpgrade } from './SearchProductUpgrade'
import styles from './ExpandedAflumaPage.module.css'

function Arrow() {
  return <span aria-hidden="true">↗</span>
}

function Status({ value }: { value?: ExpandedCard['status'] }) {
  if (!value) return null
  const labels: Record<NonNullable<ExpandedCard['status']>, string> = {
    live: 'Implemented',
    'in-progress': 'In progress',
    prototype: 'Prototype',
    planned: 'Planned',
    'evidence-gated': 'Evidence gated',
  }
  return <span className={`${styles.status} ${styles[`status_${value.replace('-', '_')}`]}`}>{labels[value]}</span>
}

function CardGrid({ cards }: { cards: ExpandedCard[] }) {
  return (
    <div className={styles.cardGrid}>
      {cards.map((card, index) => (
        <article className={styles.card} key={`${card.title}-${index}`}>
          <div className={styles.cardTop}>
            <span>{card.eyebrow || String(index + 1).padStart(2, '0')}</span>
            <Status value={card.status} />
          </div>
          <h3>{card.title}</h3>
          <p>{card.body}</p>
          {card.href ? <Link href={card.href}>Explore <Arrow /></Link> : null}
        </article>
      ))}
    </div>
  )
}

function Steps({ section }: { section: ExpandedSection }) {
  return (
    <div className={styles.steps}>
      {section.steps?.map((step, index) => (
        <article className={styles.step} key={`${step.title}-${index}`}>
          <span>{String(index + 1).padStart(2, '0')}</span>
          <div>
            <h3>{step.title}</h3>
            <p>{step.body}</p>
          </div>
        </article>
      ))}
    </div>
  )
}

function StandardBody({ section }: { section: ExpandedSection }) {
  return (
    <div className={styles.prose}>
      {section.intro ? <p className={styles.intro}>{section.intro}</p> : null}
      {section.paragraphs?.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
      {section.bullets?.length ? (
        <ul className={styles.bulletGrid}>
          {section.bullets.map((item) => <li key={item}>{item}</li>)}
        </ul>
      ) : null}
    </div>
  )
}

function SectionBody({ section }: { section: ExpandedSection }) {
  if (section.kind === 'intent') return <IntentPathfinder />
  if (section.kind === 'workforce') return <WorkforceExplorer />
  if (section.kind === 'architecture') return <ArchitectureExplorer />
  if (section.kind === 'steps') return <Steps section={section} />

  return (
    <>
      <StandardBody section={section} />
      {section.cards?.length ? <CardGrid cards={section.cards} /> : null}
      {section.steps?.length ? <Steps section={section} /> : null}
    </>
  )
}

function StandardSection({ section, index }: { section: ExpandedSection; index: number }) {
  const toneClass = section.tone ? styles[`tone_${section.tone}`] : ''
  return (
    <section id={section.id} className={`${styles.section} ${toneClass}`}>
      <div className={styles.shell}>
        <div className={styles.sectionHeading}>
          <div>
            <span className={styles.kicker}>{section.eyebrow || `0${index + 1}`}</span>
            <h2>{section.title}</h2>
          </div>
          {section.intro && ['intent', 'workforce', 'architecture'].includes(section.kind || '') ? <p>{section.intro}</p> : null}
        </div>
        <SectionBody section={section} />
      </div>
    </section>
  )
}

function LegalSections({ page }: { page: ExpandedPage }) {
  return (
    <section className={styles.legalWrap}>
      <div className={styles.shell}>
        <div className={styles.legalLayout}>
          <aside className={styles.legalAside}>
            <span className={styles.kicker}>Policy navigation</span>
            <strong>Read by section</strong>
            <nav>
              {page.sections.map((section) => <a key={section.id} href={`#${section.id}`}>{section.eyebrow} {section.title}</a>)}
            </nav>
          </aside>
          <div className={styles.legalList}>
            {page.sections.map((section, index) => (
              <LegalAccordion key={section.id} section={section} defaultOpen={index === 0} />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

function Hero({ page }: { page: ExpandedPage }) {
  return (
    <header className={styles.hero}>
      <div className={styles.heroGlow} aria-hidden="true" />
      <div className={styles.shell}>
        <div className={styles.heroGrid}>
          <div className={styles.heroCopy}>
            <span className={styles.heroEyebrow}>{page.eyebrow}</span>
            <h1>{page.title}</h1>
            {page.accent ? <p className={styles.heroAccent}>{page.accent}</p> : null}
            <p className={styles.heroLede}>{page.lede}</p>
            <div className={styles.heroActions}>
              {page.primaryCta ? <Link className={styles.primaryButton} href={page.primaryCta.href}>{page.primaryCta.label} <Arrow /></Link> : null}
              {page.secondaryCta ? <Link className={styles.secondaryButton} href={page.secondaryCta.href}>{page.secondaryCta.label}</Link> : null}
            </div>
          </div>
          <div className={styles.heroSystem} aria-label="Afluma operating system summary">
            <span>THE AFLUMA SYSTEM</span>
            <div><strong>01</strong><p>Digital workforce</p></div>
            <div><strong>02</strong><p>AgenticOS</p></div>
            <div><strong>03</strong><p>Products + tools</p></div>
            <div><strong>04</strong><p>Human governance</p></div>
            <small>Intelligence in motion.</small>
          </div>
        </div>
        {page.notice ? <div className={styles.notice}><strong>Important</strong><p>{page.notice}</p></div> : null}
      </div>
    </header>
  )
}

function ClosingCta({ page }: { page: ExpandedPage }) {
  return (
    <section className={styles.closing}>
      <div className={styles.shell}>
        <div className={styles.closingInner}>
          <div>
            <span className={styles.kicker}>Next move</span>
            <h2>Turn the page into a working conversation.</h2>
            <p>Explore the system, inspect the evidence or bring Afluma a real operating problem with a measurable outcome.</p>
          </div>
          <div className={styles.closingActions}>
            <Link className={styles.primaryButton} href={page.primaryCta?.href || '/contact/'}>{page.primaryCta?.label || 'Talk to Afluma'} <Arrow /></Link>
            <Link className={styles.secondaryButtonDark} href="/trust/">Trust & responsible AI</Link>
          </div>
        </div>
      </div>
    </section>
  )
}

export function ExpandedAflumaPage({ slug, doc }: { slug: string; doc?: any }) {
  const page = pageForSlug(slug) || genericExpandedPage(doc || { slug })
  const isLegal = ['privacy', 'terms', 'cookies', 'accessibility'].includes(page.slug)

  return (
    <main className={styles.page}>
      <Hero page={page} />
      {!isLegal ? <SectionJumpNav sections={page.sections} /> : null}
      {isLegal ? (
        <LegalSections page={page} />
      ) : (
        page.sections.map((section, index) => <StandardSection key={section.id} section={section} index={index} />)
      )}
      {!isLegal ? <SearchProductUpgrade slug={page.slug} /> : null}
      <ClosingCta page={page} />
    </main>
  )
}

export { shouldUseExpandedPage }
