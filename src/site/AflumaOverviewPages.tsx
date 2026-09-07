import Link from 'next/link'
import styles from './AflumaCorePages.module.css'

function Arrow() {
  return <span aria-hidden="true">↗</span>
}

export function isAflumaOverviewRoute(slug: string) {
  return slug === 'platform' || slug === 'proof'
}

function Hero({ eyebrow, title, accent, description }: { eyebrow: string; title: string; accent: string; description: string }) {
  return <section className={styles.hero}><div className={`${styles.shell} ${styles.heroGrid}`}><div><p className={styles.eyebrow}>{eyebrow}</p><h1>{title}<br /><em>{accent}</em></h1><p className={styles.lede}>{description}</p></div><aside className={styles.heroAside}><p>Flagship Afluma pages distinguish architecture, product direction and verified proof. An overview explains how the pieces fit together; a detail page goes deeper into one system.</p><div className={styles.heroStatus}><span>AI disclosed</span><span>Human governed</span><span>Evidence led</span><span>Staged delivery</span></div></aside></div></section>
}

function PlatformOverview() {
  const layers = [
    ['01 / Operating layer', 'AgenticOS', 'The shared identity, context, tool, handoff and governance layer behind persistent AI roles.', '/platform/agenticos'],
    ['02 / Human control', 'Commander OS', 'A local-first control room where context, priorities, approvals and agent activity can remain visible.', '/products/commander-os'],
    ['03 / Infrastructure', 'SerenOps', 'A governed infrastructure operations environment for understanding, preparing, executing and verifying bounded change.', '/products/serenops'],
    ['04 / Commerce', 'Afluma Commerce', 'A commerce operating environment where selling, inventory, customer context and operational workflows can connect.', '/products/afluma-commerce'],
  ]

  return <div className={styles.page}><Hero eyebrow="02 / Platform" title="The systems that let" accent="digital coworkers do real work." description="Afluma’s platform is not one monolithic application. AgenticOS provides the shared operating layer, while focused products expose the right context and controls for each domain." /><section className={styles.section}><div className={styles.shell}><div className={styles.heading}><p className={styles.eyebrow}>Platform map</p><div><h2>One operating thesis.<br />Several purposeful surfaces.</h2><p>The workforce should not have to pretend every task is the same. Infrastructure, commerce and personal control each need their own domain model while sharing identity, governance and approved organisational context.</p></div></div><div className={styles.modelGrid}>{layers.map(([label,title,body,href])=><article className={styles.modelCard} key={title}><span>{label}</span><div><h3>{title}</h3><p>{body}</p></div><Link href={href}>Explore <Arrow /></Link></article>)}</div></div></section><section className={`${styles.section} ${styles.sectionNight}`}><div className={styles.shell}><div className={styles.heading}><p className={styles.eyebrow}>Shared principle</p><div><h2>Capability beneath.<br />Responsibility above.</h2><p>Models and providers can change. The role, authority, evidence requirements and handoff contract should remain understandable to the company using them.</p></div></div><div className={styles.flow}><strong>Company context</strong><i>→</i><strong>AgenticOS</strong><i>→</i><strong>Focused product</strong></div></div></section><section className={styles.cta}><div className={`${styles.shell} ${styles.ctaInner}`}><div><p className={styles.eyebrow}>Start here</p><h2>Go deeper into the shared operating layer.</h2></div><Link href="/platform/agenticos" className={styles.primary}><span>Explore AgenticOS</span><Arrow /></Link></div></section></div>
}

function ProofOverview() {
  const proofTypes = [
    ['01 / Internal proof', 'Afluma runs on Afluma', 'Use the company itself as the first controlled environment for role behaviour, handoffs, memory, approvals and measurable outcomes.', '/proof/afluma-runs-on-afluma'],
    ['02 / Product proof', 'Operational environments', 'Products create concrete places where the AI-company thesis can be tested against real workflows and constraints.', '/products'],
    ['03 / Research proof', 'Hypothesis → experiment', 'Research claims remain research until a repeatable method and evidence support promotion into architecture or product behaviour.', '/research'],
    ['04 / Trust proof', 'Boundaries that survive contact', 'Governance matters only when permissions, escalation and recovery still work during consequential tasks.', '/trust'],
  ]

  return <div className={styles.page}><Hero eyebrow="05 / Proof" title="Proof is not" accent="a polished demo." description="Afluma treats evidence as a separate layer from vision. The goal is to show traceable useful work: what was requested, who owned it, what context was used, what changed and how the result was verified." /><section className={styles.section}><div className={styles.shell}><div className={styles.heading}><p className={styles.eyebrow}>Proof model</p><div><h2>Different claims need<br />different evidence.</h2><p>An internal workflow, a product capability, a research result and a security control should not all be proven in the same way. Each needs an acceptance condition appropriate to the claim.</p></div></div><div className={styles.modelGrid}>{proofTypes.map(([label,title,body,href])=><article className={styles.modelCard} key={title}><span>{label}</span><div><h3>{title}</h3><p>{body}</p></div><Link href={href}>Explore <Arrow /></Link></article>)}</div></div></section><section className={`${styles.section} ${styles.sectionTint}`}><div className={styles.shell}><div className={styles.heading}><p className={styles.eyebrow}>Evidence discipline</p><div><h2>Claim only what the<br />artifact can support.</h2><p>Prototype screens are prototypes. Roadmap features are roadmap features. Internal results are internal until the source and measurement method are verified. Customer outcomes require permission and evidence before publication.</p></div></div><div className={styles.proofGrid}><article className={styles.proofCard}><span className={styles.status}>Acceptable evidence</span><h3>Traceable outcome</h3><p>Defined request, scoped owner, available context, observable output, reviewer and recorded outcome.</p></article><article className={styles.proofCard}><span className={styles.status}>Not evidence</span><h3>Technology theatre</h3><p>Invented metrics, fake conversations, unverified case studies or a UI animation presented as proof of deployed autonomy.</p></article></div></div></section><section className={styles.cta}><div className={`${styles.shell} ${styles.ctaInner}`}><div><p className={styles.eyebrow}>First proving ground</p><h2>See how Afluma plans to prove itself on itself.</h2></div><Link href="/proof/afluma-runs-on-afluma" className={styles.primary}><span>Afluma runs on Afluma</span><Arrow /></Link></div></section></div>
}

export function AflumaOverviewPage({ slug }: { slug: string }) {
  if (slug === 'platform') return <PlatformOverview />
  if (slug === 'proof') return <ProofOverview />
  return null
}
