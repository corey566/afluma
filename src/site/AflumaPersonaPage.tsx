import Link from 'next/link'
import { workforce } from './content'
import styles from './AflumaCorePages.module.css'

function Arrow() {
  return <span aria-hidden="true">↗</span>
}

const capabilityLabels: Record<string, string> = {
  'conversation.fast': 'Fast customer conversation',
  'conversation.realtime': 'Real-time conversation',
  'reasoning.business': 'Business reasoning',
  'reasoning.general': 'General reasoning',
  'reasoning.deep': 'Deep reasoning',
  'research.web': 'Research',
  'knowledge.retrieve': 'Approved knowledge retrieval',
  'knowledge.embed': 'Knowledge preparation',
  'crm.read': 'CRM context',
  'crm.write': 'CRM updates',
  'sales.discovery': 'Commercial discovery',
  'proposal.draft': 'Proposal drafting',
  schedule: 'Scheduling',
  'design.review': 'Design review',
  'code.advanced': 'Advanced engineering',
  'workflow.manage': 'Workflow coordination',
  'analytics.read': 'Analytics interpretation',
  'security.assess': 'Security assessment',
  'customer.health': 'Customer health context',
}

const authorityLabels: Record<number, string> = {
  0: 'Observe only',
  1: 'Prepare & recommend',
  2: 'Bounded operational work',
  3: 'Elevated approved execution',
  4: 'Reserved / exceptional authority',
}

export function AflumaPersonaPage({ slug }: { slug: string }) {
  const agent = workforce.find((item) => `workforce/${item.slug}` === slug)
  if (!agent) return null

  const index = workforce.findIndex((item) => item.id === agent.id)
  const handoffs = agent.escalationAgentIds
    .map((id) => workforce.find((item) => item.id === id))
    .filter((item): item is (typeof workforce)[number] => Boolean(item))

  return <div className={styles.page}>
    <section className={styles.hero}>
      <div className={`${styles.shell} ${styles.heroGrid}`}>
        <div>
          <p className={styles.eyebrow}>AI teammate / {String(index + 1).padStart(2, '0')}</p>
          <h1>{agent.name}<br /><em>{agent.role}.</em></h1>
          <p className={styles.lede}>{agent.mission}</p>
          <div className={styles.actions}>
            <Link href="/workforce" className={styles.primary}><span>Meet the full workforce</span><Arrow /></Link>
            <Link href="/platform/agenticos" className={styles.secondary}><span>How AgenticOS governs the role</span><Arrow /></Link>
          </div>
        </div>
        <aside className={styles.heroAside}>
          <span className={styles.status}>Disclosed AI persona</span>
          <p>{agent.disclosure}. {agent.name} is a digital persona / AI teammate at Afluma, not a biological employee. This profile describes the role interface and intended responsibility; it does not claim unrestricted autonomy.</p>
          <div className={styles.heroStatus}>
            <span>Role persistent</span>
            <span>Authority bounded</span>
            <span>Human governed</span>
            <span>Evidence led</span>
          </div>
        </aside>
      </div>
    </section>

    <section className={styles.section}>
      <div className={styles.shell}>
        <div className={styles.heading}>
          <p className={styles.eyebrow}>Responsibility</p>
          <div><h2>A role with a boundary,<br />not a character with infinite access.</h2><p>The public persona makes ownership legible. The actual system limits what context, tools and actions this role may use for any task.</p></div>
        </div>
        <div className={styles.trustGrid}>
          <article className={styles.trustCard}><span>01 / Mission</span><h3>Own the defined work.</h3><p>{agent.mission}</p></article>
          <article className={styles.trustCard}><span>02 / Default authority</span><h3>{authorityLabels[agent.defaultAuthority] || 'Bounded authority'}</h3><p>Authority level {agent.defaultAuthority} is a default role boundary. Individual actions can still require narrower permissions, review or explicit human approval.</p></article>
          <article className={styles.trustCard}><span>03 / Memory</span><h3>{agent.canWriteLongTermMemory ? 'Can propose durable learning.' : 'Task context stays temporary by default.'}</h3><p>{agent.canWriteLongTermMemory ? 'Long-term memory writes should preserve source, confidence and review status rather than turning every interaction into permanent organisational knowledge.' : 'The role can use approved context for the task without automatically promoting the interaction into long-term organisational memory.'}</p></article>
          <article className={styles.trustCard}><span>04 / Escalation</span><h3>Know when another owner is needed.</h3><p>{handoffs.length ? `Primary handoff paths include ${handoffs.map((item) => item.name).join(', ')}.` : 'Uncertainty or out-of-scope work is routed to the relevant human or specialised Afluma role.'}</p></article>
        </div>
      </div>
    </section>

    <section className={`${styles.section} ${styles.sectionNight}`}>
      <div className={styles.shell}>
        <div className={styles.heading}>
          <p className={styles.eyebrow}>Capability contract</p>
          <div><h2>The role asks for capabilities.<br />The platform decides how they run.</h2><p>AgenticOS is designed to keep the organisational role stable while underlying models, providers and tools can be changed, benchmarked or restricted.</p></div>
        </div>
        <div className={styles.architecture}>
          {agent.capabilities.slice(0, 8).map((capability, capabilityIndex) => <article key={capability}><span>{String(capabilityIndex + 1).padStart(2, '0')} / Capability</span><h3>{capabilityLabels[capability] || capability.replaceAll('.', ' ')}</h3><p>Available only when the current task, connection and permission boundary allow it.</p></article>)}
        </div>
      </div>
    </section>

    <section className={styles.section}>
      <div className={styles.shell}>
        <div className={styles.heading}>
          <p className={styles.eyebrow}>Handoffs</p>
          <div><h2>Specialisation only works<br />when context survives the handoff.</h2><p>A useful handoff includes the request, work completed, evidence used, uncertainty, expected next output and the authority required for the next step.</p></div>
        </div>
        <div className={styles.modelGrid}>
          {handoffs.map((item, handoffIndex) => <article className={styles.modelCard} key={item.id}><span>{String(handoffIndex + 1).padStart(2, '0')} / Next owner</span><div><h3>{item.name}</h3><p>{item.role}</p></div><Link href={`/workforce/${item.slug}`}>View role <Arrow /></Link></article>)}
          <article className={styles.modelCard}><span>Human / approval</span><div><h3>Human authority</h3><p>Commercial commitments, sensitive publishing, security-sensitive operations and other consequential actions retain explicit human approval where policy requires it.</p></div><Link href="/trust">Trust model <Arrow /></Link></article>
        </div>
      </div>
    </section>

    <section className={styles.cta}><div className={`${styles.shell} ${styles.ctaInner}`}><div><p className={styles.eyebrow}>Afluma workforce</p><h2>Judge the role by the work it can complete safely.</h2></div><Link href="/proof/afluma-runs-on-afluma" className={styles.primary}><span>See the proving model</span><Arrow /></Link></div></section>
  </div>
}
