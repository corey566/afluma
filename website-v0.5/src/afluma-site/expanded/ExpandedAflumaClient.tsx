'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'
import { agents, type ExpandedSection } from './content'
import styles from './ExpandedAflumaPage.module.css'

const intentPaths = [
  {
    id: 'start',
    label: 'Start something',
    title: 'Turn an idea into an operating business.',
    body: 'Research the market, shape the offer, architect the business, design the experience, build the product and create the workflows needed to operate after launch.',
    href: '/solutions/start-a-business/',
    next: 'Business architecture → experience → engineering → launch',
  },
  {
    id: 'grow',
    label: 'Grow something',
    title: 'Connect demand to a system that can convert and learn.',
    body: 'Bring SEO, content, CRM, commerce, analytics, experiments and customer journeys into one measurable growth loop instead of producing more disconnected marketing activity.',
    href: '/solutions/grow-a-business/',
    next: 'Research → growth intelligence → experience → commercial handoff',
  },
  {
    id: 'fix',
    label: 'Fix / operate smarter',
    title: 'Reduce manual coordination and operational friction.',
    body: 'Map the workflow, find exceptions and hidden dependencies, connect systems, automate bounded steps and preserve human judgment where it is valuable or required.',
    href: '/solutions/operate-smarter/',
    next: 'Process map → automation → approvals → operational measurement',
  },
  {
    id: 'transform',
    label: 'Transform with AI',
    title: 'Build an operating layer, not a pile of copilots.',
    body: 'Define roles, shared knowledge, permissions, tool adapters, workflows, evaluation and human authority before expanding autonomy across the organisation.',
    href: '/solutions/ai-transformation/',
    next: 'AI architecture → AgenticOS → governed workflows → evaluation',
  },
] as const

const architectureLayers = [
  {
    id: 'channels',
    label: 'Channels',
    title: 'Where people and systems enter.',
    body: 'Website, portal, email, WhatsApp, voice and APIs provide surfaces. Channel logic should not contain the organisation’s entire intelligence stack.',
    items: ['Website + Ask Afluma', 'Email / WhatsApp', 'Voice', 'APIs / product surfaces'],
  },
  {
    id: 'runtime',
    label: 'Agent runtime',
    title: 'Who is acting, why and with what context?',
    body: 'Identity, tenant, persona, task context, planning, handoff and policy live in the runtime instead of being improvised by each integration.',
    items: ['Agent registry', 'Context builder', 'Planner / executor', 'Handoff + policy'],
  },
  {
    id: 'intelligence',
    label: 'Intelligence',
    title: 'Route work to the right capability class.',
    body: 'AgenticOS can choose deep reasoning, fast conversation, vision, speech, embeddings, open models, code or deterministic logic based on the task and stakes.',
    items: ['Model router', 'Capability classes', 'Research', 'Vision / speech / embeddings'],
  },
  {
    id: 'knowledge',
    label: 'Knowledge',
    title: 'Evidence and memory with different authority levels.',
    body: 'Structured records, files, retrieved context and reviewed knowledge are useful in different ways. Raw retrieval should not silently become permanent truth.',
    items: ['PostgreSQL / records', 'Vector retrieval', 'Files / evidence', 'Reviewed knowledge'],
  },
  {
    id: 'tools',
    label: 'Tool gateway',
    title: 'Capabilities act through approved adapters.',
    body: 'CRM, communications, search, analytics, project systems, source control, payments and security tools remain behind scoped credentials and policy checks.',
    items: ['CRM + comms', 'Search + analytics', 'Project + SCM', 'Payments + security'],
  },
  {
    id: 'workflow',
    label: 'Workflow + audit',
    title: 'Long-running work needs state and recovery.',
    body: 'State machines, events, retries, human tasks, logs, traces, approvals and costs make the system inspectable and able to pause or recover safely.',
    items: ['State + events', 'Approvals', 'Retries / recovery', 'Audit + observability'],
  },
] as const

export function IntentPathfinder() {
  const [selected, setSelected] = useState<(typeof intentPaths)[number]['id']>('start')
  const active = intentPaths.find((item) => item.id === selected) ?? intentPaths[0]

  return (
    <div className={styles.intentExplorer}>
      <div className={styles.intentTabs} role="tablist" aria-label="Choose your business outcome">
        {intentPaths.map((item) => (
          <button
            type="button"
            key={item.id}
            className={item.id === selected ? styles.intentTabActive : styles.intentTab}
            role="tab"
            aria-selected={item.id === selected}
            onClick={() => setSelected(item.id)}
          >
            {item.label}
          </button>
        ))}
      </div>
      <div className={styles.intentPanel} role="tabpanel">
        <div>
          <span className={styles.microLabel}>Recommended journey</span>
          <h3>{active.title}</h3>
          <p>{active.body}</p>
        </div>
        <div className={styles.intentNext}>
          <span>Likely path</span>
          <strong>{active.next}</strong>
          <Link href={active.href}>Explore this path <span aria-hidden="true">↗</span></Link>
        </div>
      </div>
    </div>
  )
}

export function WorkforceExplorer() {
  const [selectedSlug, setSelectedSlug] = useState(agents[0].slug)
  const active = useMemo(
    () => agents.find((agent) => agent.slug === selectedSlug) ?? agents[0],
    [selectedSlug],
  )

  return (
    <div className={styles.workforceExplorer}>
      <div className={styles.agentRail} role="list" aria-label="Afluma digital coworkers">
        {agents.map((agent, index) => (
          <button
            type="button"
            role="listitem"
            key={agent.slug}
            className={agent.slug === active.slug ? styles.agentButtonActive : styles.agentButton}
            onClick={() => setSelectedSlug(agent.slug)}
          >
            <span>{String(index + 1).padStart(2, '0')}</span>
            <div>
              <strong>{agent.name}</strong>
              <small>{agent.shortRole}</small>
            </div>
          </button>
        ))}
      </div>
      <article className={styles.agentDetail} aria-live="polite">
        <div className={styles.agentDetailTop}>
          <div>
            <span className={styles.microLabel}>Afluma AI/digital persona</span>
            <h3>{active.name}</h3>
            <p className={styles.agentRole}>{active.role}</p>
          </div>
          <div className={styles.aiBadge}>AI</div>
        </div>
        <p className={styles.agentMission}>{active.mission}</p>
        <div className={styles.agentMetaGrid}>
          <div>
            <span>Typical outputs</span>
            <ul>{active.outputs.slice(0, 4).map((item) => <li key={item}>{item}</li>)}</ul>
          </div>
          <div>
            <span>Key handoffs</span>
            <ul>{active.handoffs.slice(0, 3).map((item) => <li key={item}>{item}</li>)}</ul>
          </div>
        </div>
        <div className={styles.agentBoundary}>
          <strong>Boundary</strong>
          <span>{active.limits[0]}</span>
        </div>
        <Link className={styles.inlineLink} href={`/workforce/${active.slug}/`}>
          Open {active.name}’s role profile <span aria-hidden="true">↗</span>
        </Link>
      </article>
    </div>
  )
}

export function ArchitectureExplorer() {
  const [selected, setSelected] = useState(architectureLayers[1].id)
  const active = architectureLayers.find((layer) => layer.id === selected) ?? architectureLayers[0]

  return (
    <div className={styles.architectureExplorer}>
      <div className={styles.architectureStack} aria-label="AgenticOS architecture layers">
        {architectureLayers.map((layer, index) => (
          <button
            key={layer.id}
            type="button"
            onClick={() => setSelected(layer.id)}
            className={layer.id === selected ? styles.architectureLayerActive : styles.architectureLayer}
          >
            <span>0{index + 1}</span>
            <strong>{layer.label}</strong>
          </button>
        ))}
      </div>
      <div className={styles.architectureDetail} aria-live="polite">
        <span className={styles.microLabel}>Selected layer</span>
        <h3>{active.title}</h3>
        <p>{active.body}</p>
        <div className={styles.architectureItems}>
          {active.items.map((item) => <span key={item}>{item}</span>)}
        </div>
      </div>
    </div>
  )
}

export function LegalAccordion({ section, defaultOpen = false }: { section: ExpandedSection; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <article className={styles.legalItem} id={section.id}>
      <button
        type="button"
        className={styles.legalButton}
        aria-expanded={open}
        aria-controls={`${section.id}-content`}
        onClick={() => setOpen((value) => !value)}
      >
        <span>
          <small>{section.eyebrow}</small>
          <strong>{section.title}</strong>
        </span>
        <span className={styles.legalToggle} aria-hidden="true">{open ? '−' : '+'}</span>
      </button>
      <div id={`${section.id}-content`} hidden={!open} className={styles.legalContent}>
        {section.intro && <p>{section.intro}</p>}
        {section.paragraphs?.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
        {section.bullets?.length ? <ul>{section.bullets.map((item) => <li key={item}>{item}</li>)}</ul> : null}
        {section.cards?.length ? (
          <div className={styles.legalCardGrid}>
            {section.cards.map((card) => <div key={card.title}><strong>{card.title}</strong><p>{card.body}</p></div>)}
          </div>
        ) : null}
      </div>
    </article>
  )
}

export function SectionJumpNav({ sections }: { sections: ExpandedSection[] }) {
  return (
    <nav className={styles.jumpNav} aria-label="On this page">
      <span>On this page</span>
      <div>
        {sections.map((section) => <a key={section.id} href={`#${section.id}`}>{section.title}</a>)}
      </div>
    </nav>
  )
}
