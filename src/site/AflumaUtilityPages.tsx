import Link from 'next/link'
import { ContactForm } from '@/afluma-site/ContactForm'
import styles from './AflumaCorePages.module.css'

export const utilityPageMeta: Record<string, { title: string; description: string }> = {
  contact: {
    title: 'Contact Afluma — Projects, Products & Partnerships',
    description: 'Talk to Afluma about an AI workflow, AgenticOS, SerenOps, Afluma Commerce, Commander OS, a partnership or a career enquiry.',
  },
  'responsible-ai': {
    title: 'Responsible AI — Afluma',
    description: 'Afluma’s responsible AI principles: disclosed identity, bounded authority, evidence, escalation and human accountability.',
  },
  security: {
    title: 'Security Principles — Afluma',
    description: 'Afluma designs AI and operational systems around least authority, inspectable changes, scoped context and recovery.',
  },
  careers: {
    title: 'Careers — Afluma',
    description: 'Explore how human engineers, designers and operators can contribute to Afluma’s AI-first company and governed digital workforce.',
  },
}

export function isAflumaUtilityRoute(slug: string) {
  return Object.hasOwn(utilityPageMeta, slug)
}

function Arrow() {
  return <span aria-hidden="true">↗</span>
}

function Hero({ eyebrow, title, accent, description, note }: { eyebrow: string; title: string; accent: string; description: string; note: string }) {
  return <section className={styles.hero}><div className={`${styles.shell} ${styles.heroGrid}`}><div><p className={styles.eyebrow}>{eyebrow}</p><h1>{title}<br /><em>{accent}</em></h1><p className={styles.lede}>{description}</p></div><aside className={styles.heroAside}><p>{note}</p><div className={styles.heroStatus}><span>Clear scope</span><span>Human accountable</span><span>Evidence led</span><span>Privacy aware</span></div></aside></div></section>
}

function ContactPage() {
  return <div className={styles.page}>
    <Hero eyebrow="Start a conversation" title="Bring the operating" accent="problem, not a perfect brief." description="Tell us what needs to work better, who uses it and which systems are already involved. That is enough to start a useful conversation." note="Submitting an enquiry does not create a contract, promise product availability or grant an AI system permission to act in your environment." />
    <section className={styles.section}><div className={`${styles.shell} ${styles.companyGrid}`}><div className={styles.companyQuote}><p className={styles.eyebrow}>Good starting points</p><blockquote>A workflow. A product. An infrastructure problem. A partnership.</blockquote><p>We would rather understand the actual operating context than force every enquiry into a pre-defined package.</p></div><div><ContactForm /></div></div></section>
    <section className={`${styles.section} ${styles.sectionTint}`}><div className={styles.shell}><div className={styles.trustGrid}><article className={styles.trustCard}><span>01 / Product</span><h3>Explore a focused Afluma product.</h3><p>SerenOps, Commerce and Commander OS each address a different operating environment.</p><Link href="/products">Products <Arrow /></Link></article><article className={styles.trustCard}><span>02 / Pilot</span><h3>Start with a bounded workflow.</h3><p>A measurable pilot is more useful than a broad promise of transformation with no acceptance criteria.</p><Link href="/proof/afluma-runs-on-afluma">Proof approach <Arrow /></Link></article></div></div></section>
  </div>
}

function ResponsibleAIPage() {
  const principles = [
    ['01 / Identity', 'Say when the coworker is AI.', 'Names and personalities can make responsibility understandable, but they must not depend on someone believing the digital persona is a biological employee.'],
    ['02 / Authority', 'Separate capability from permission.', 'Being able to draft, research or call a tool does not automatically grant authority to publish, commit money, change infrastructure or expose private data.'],
    ['03 / Evidence', 'Keep uncertainty visible.', 'Approved context, source lineage and review status matter more than confident prose. Escalation is preferable to invented certainty.'],
    ['04 / Improvement', 'Learning needs governance too.', 'A useful lesson should be promoted deliberately into reusable knowledge rather than turning every interaction into permanent memory.'],
  ]
  return <div className={styles.page}><Hero eyebrow="Responsible AI" title="Clear identity." accent="Bounded authority." description="Afluma’s digital coworkers are designed to be useful without making responsibility disappear." note="These principles describe Afluma’s operating standard. They are not a claim that every future implementation shares the same risk profile, legal requirement or technical control." /><section className={styles.section}><div className={styles.shell}><div className={styles.heading}><p className={styles.eyebrow}>Operating principles</p><div><h2>Trust is designed into<br />the work contract.</h2><p>The role, context, tools, approvals and recovery path belong to the system around the model.</p></div></div><div className={styles.trustGrid}>{principles.map(([label,title,body])=><article className={styles.trustCard} key={title}><span>{label}</span><h3>{title}</h3><p>{body}</p></article>)}</div><div className={styles.actions}><Link href="/trust" className={styles.primary}><span>Trust & governance</span><Arrow /></Link><Link href="/security" className={styles.secondary}><span>Security principles</span><Arrow /></Link></div></div></section></div>
}

function SecurityPage() {
  const principles = [
    ['01 / Least authority', 'Grant the minimum useful access.', 'Permissions should be scoped to the task, system, data boundary and time window rather than inherited from a broad persona title.'],
    ['02 / Inspectable change', 'Know what changed and why.', 'Operational work should preserve request context, intended action, accountable owner and a verification step.'],
    ['03 / Recovery', 'Design the way back before acting.', 'Changes that can fail need an explicit recovery or escalation path before automation is expanded.'],
    ['04 / Disclosure', 'Do not imply certifications.', 'Security requirements, data handling and compliance posture must be confirmed for the actual implementation and jurisdiction.'],
  ]
  return <div className={styles.page}><Hero eyebrow="Security" title="Control belongs" accent="in the architecture." description="Afluma treats identity, permissions, visibility and recovery as product requirements for AI-enabled operations." note="This is a design-principles page, not a certification statement. Current controls and deployment requirements must be verified for the system being discussed." /><section className={`${styles.section} ${styles.sectionNight}`}><div className={styles.shell}><div className={styles.heading}><p className={styles.eyebrow}>Security model</p><div><h2>Before an agent acts,<br />the boundary should be clear.</h2><p>Useful automation starts with explicit scope. High-impact access is not justified by a confident model response or a professional-looking persona.</p></div></div><div className={styles.architecture}>{principles.map(([label,title,body])=><article key={title}><span>{label}</span><h3>{title}</h3><p>{body}</p></article>)}</div><div className={styles.flow}><strong>Identity</strong><i>→</i><strong>Permission</strong><i>→</i><strong>Verified action</strong></div></div></section></div>
}

function CareersPage() {
  const areas = [
    ['01 / Platform', 'AI systems & engineering', 'Build the runtime, tools, knowledge and verification systems that make role-specific AI work reliable.'],
    ['02 / Product', 'Product & experience', 'Design focused interfaces where people can understand context, direct work and make consequential decisions.'],
    ['03 / Operations', 'Infrastructure & delivery', 'Turn architecture into systems that can be deployed, observed, recovered and improved in practice.'],
    ['04 / Research', 'Applied AI research', 'Investigate persistent roles, memory, evaluation, adaptive workflows and safe expansion of authority.'],
  ]
  return <div className={styles.page}><Hero eyebrow="Careers at Afluma" title="Build serious systems" accent="with human judgment intact." description="Afluma’s human team is intended to stay small, technical and close to the platform: improving the systems, verifying behaviour and owning decisions that should remain human." note="This page describes the kinds of work Afluma values. It does not imply that every discipline currently has an open paid vacancy. Specific openings should be published separately." /><section className={styles.section}><div className={styles.shell}><div className={styles.heading}><p className={styles.eyebrow}>Where humans matter</p><div><h2>Better autonomy needs<br />better engineering and judgment.</h2><p>The objective is not to remove people from the company. It is to move human attention toward architecture, difficult judgment, safety, product quality and platform improvement.</p></div></div><div className={styles.trustGrid}>{areas.map(([label,title,body])=><article className={styles.trustCard} key={title}><span>{label}</span><h3>{title}</h3><p>{body}</p></article>)}</div><div className={styles.actions}><Link href="/contact" className={styles.primary}><span>Introduce yourself</span><Arrow /></Link><Link href="/company" className={styles.secondary}><span>How Afluma is structured</span><Arrow /></Link></div></div></section></div>
}

export function AflumaUtilityPage({ slug }: { slug: string }) {
  if (slug === 'contact') return <ContactPage />
  if (slug === 'responsible-ai') return <ResponsibleAIPage />
  if (slug === 'security') return <SecurityPage />
  if (slug === 'careers') return <CareersPage />
  return null
}
