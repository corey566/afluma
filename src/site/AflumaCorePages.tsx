import Link from 'next/link'
import AflumaHero from '@/components/hero/AflumaHero'
import { AutonomousCompanyShowcase } from '@/afluma-site/AutonomousCompanyShowcase'
import { products, workforce } from './content'
import styles from './AflumaCorePages.module.css'

export const corePageMeta: Record<string, { title: string; description: string }> = {
  '': {
    title: 'Afluma — Intelligence in motion',
    description: 'Afluma is building a human-governed AI workforce, AgenticOS and AI-native products for real company work.',
  },
  workforce: {
    title: 'AI Workforce — Afluma',
    description: 'Meet Afluma’s ten disclosed digital coworkers, each designed around a defined company responsibility and governed authority.',
  },
  platform: {
    title: 'AgenticOS Platform — Afluma',
    description: 'AgenticOS is Afluma’s shared operating layer for identity, context, tools, coordination, permissions and human governance.',
  },
  'platform/agenticos': {
    title: 'AgenticOS — Afluma',
    description: 'AgenticOS is Afluma’s shared operating layer for identity, context, tools, coordination, permissions and human governance.',
  },
  products: {
    title: 'Products — Afluma',
    description: 'Explore SerenOps, Afluma Commerce and Commander OS: product environments for infrastructure, commerce and human control.',
  },
  research: {
    title: 'Research — Afluma',
    description: 'Afluma research explores persistent AI roles, accountable autonomy, evidence-governed memory and useful AI work.',
  },
  proof: {
    title: 'Proof — Afluma',
    description: 'Afluma runs on Afluma first: internal workflows are the proving ground for the AI workforce and AgenticOS operating model.',
  },
  'proof/afluma-runs-on-afluma': {
    title: 'Afluma Runs on Afluma — Proof',
    description: 'The Afluma company is the first proving ground for its own AI workforce, AgenticOS and operating products.',
  },
  company: {
    title: 'Company — Afluma',
    description: 'Afluma is an AI-first company building a governed digital workforce, a shared operating layer and focused AI-native products.',
  },
  trust: {
    title: 'Trust & Governance — Afluma',
    description: 'Afluma’s trust model centers on disclosed AI identity, bounded authority, evidence, security and human accountability.',
  },
}

export function isAflumaCoreRoute(slug: string) {
  return Object.hasOwn(corePageMeta, slug)
}

function Arrow() {
  return <span aria-hidden="true">↗</span>
}

function CoreHero({ eyebrow, title, accent, description, note }: { eyebrow: string; title: string; accent?: string; description: string; note?: string }) {
  return <section className={styles.hero}><div className={`${styles.shell} ${styles.heroGrid}`}><div><p className={styles.eyebrow}>{eyebrow}</p><h1>{title}{accent ? <><br /><em>{accent}</em></> : null}</h1><p className={styles.lede}>{description}</p><div className={styles.actions}><Link className={styles.primary} href="/contact"><span>Join the pilot</span><Arrow /></Link><Link className={styles.secondary} href="/proof/afluma-runs-on-afluma"><span>See the proving ground</span><Arrow /></Link></div></div><aside className={styles.heroAside}><p>{note || 'Afluma is being developed as a real operating model, not a fictional claim of finished autonomy. Capability grows only as workflows are tested, governed and verified.'}</p><div className={styles.heroStatus}><span>AI disclosed</span><span>Human governed</span><span>Evidence led</span><span>In development</span></div></aside></div></section>
}

function Heading({ eyebrow, title, body }: { eyebrow: string; title: React.ReactNode; body: string }) {
  return <div className={styles.heading}><p className={styles.eyebrow}>{eyebrow}</p><div><h2>{title}</h2><p>{body}</p></div></div>
}

function ModelGrid() {
  const items = [
    ['01 / Workforce', 'Persistent roles', 'Ten role-specific digital coworkers with defined missions, handoffs and bounded authority.', '/workforce'],
    ['02 / Operating layer', 'AgenticOS', 'Identity, memory, knowledge, tasks, tools, events, model routing and governance in one shared system.', '/platform/agenticos'],
    ['03 / Products', 'Real work environments', 'SerenOps, Afluma Commerce and Commander OS give the operating model practical places to work.', '/products'],
    ['04 / Control', 'Human accountability', 'Autonomy is constrained by permissions, approval gates, evidence and explicit recovery paths.', '/trust'],
  ]
  return <div className={styles.modelGrid}>{items.map(([label, title, body, href]) => <article className={styles.modelCard} key={title}><span>{label}</span><div><h3>{title}</h3><p>{body}</p></div><Link href={href}>Explore <Arrow /></Link></article>)}</div>
}

function ProductsGrid() {
  return <div className={styles.productGrid}>{products.map((product) => <Link href={`/products/${product.slug}`} className={styles.productCard} key={product.slug}><div className={styles.productTop}><span>{product.number} / {product.label}</span><Arrow /></div><div className={styles.productVisual} aria-hidden="true" /><div><h3>{product.name}</h3><p>{product.description}</p><span className={styles.productLink}>Explore product →</span></div></Link>)}</div>
}

function AgentGrid() {
  return <><div className={styles.agentGrid}>{workforce.map((agent, index) => <Link href={`/workforce/${agent.slug}`} className={styles.agentCard} key={agent.id}><div className={styles.agentIndex}><span>AI / {String(index + 1).padStart(2, '0')}</span><span className={styles.agentGlyph}>{agent.initials}</span></div><div><h3>{agent.name}</h3><p className={styles.agentRole}>{agent.role}</p><p className={styles.agentMission}>{agent.mission}</p></div></Link>)}</div><p className={styles.disclosure}>All ten identities are Afluma digital personas / AI teammates, not biological employees. A role profile describes intended responsibility; it does not imply every capability is already deployed autonomously.</p></>
}

function ResearchGrid() {
  const items = [
    ['01 / Identity', 'How can an AI role persist when the model changes?', 'Separate the role, responsibilities and authority from the model used for any single execution.'],
    ['02 / Memory', 'What should a digital coworker be allowed to remember?', 'Useful continuity needs evidence lineage, scoped access and deliberate promotion into reusable knowledge.'],
    ['03 / Autonomy', 'When has a system earned more authority?', 'Start with bounded tasks, observable acceptance criteria and a recovery path. Expand only after reliable evidence.'],
  ]
  return <div className={styles.researchGrid}>{items.map(([label, title, body]) => <article className={styles.researchCard} key={title}><span>{label}</span><h3>{title}</h3><p>{body}</p></article>)}</div>
}

function CTA({ title = 'See what a governed AI workforce can do in practice.' }: { title?: string }) {
  return <section className={styles.cta}><div className={`${styles.shell} ${styles.ctaInner}`}><div><p className={styles.eyebrow}>Afluma / Pilot</p><h2>{title}</h2></div><Link href="/contact" className={styles.primary}><span>Start a conversation</span><Arrow /></Link></div></section>
}

function HomePage() {
  return <div className={styles.page}><AflumaHero /><AutonomousCompanyShowcase image="/assets/visuals/human-ai-portrait.png" /><section className={styles.section}><div className={styles.shell}><Heading eyebrow="The operating model" title={<>One company.<br />Four connected layers.</>} body="The workforce is the centre of the thesis. AgenticOS coordinates the work. Focused products provide real operating environments. Human authority defines the boundary around all of it." /><ModelGrid /></div></section><section className={`${styles.section} ${styles.sectionNight}`}><div className={styles.shell}><Heading eyebrow="Afluma products" title={<>Where intelligence<br />meets the operation.</>} body="These products are not a collection of unrelated SaaS ideas. Each one gives the same operating model a different place to create useful work." /><ProductsGrid /></div></section><section className={`${styles.section} ${styles.sectionTint}`}><div className={styles.shell}><Heading eyebrow="Research direction" title={<>Beyond chat.<br />Toward accountable work.</>} body="Afluma’s R&D asks how persistent digital roles can retain context, coordinate, improve and act inside defined boundaries without hiding uncertainty or removing human responsibility." /><ResearchGrid /><div className={styles.actions}><Link href="/research" className={styles.primary}><span>Explore research</span><Arrow /></Link><Link href="/trust" className={styles.secondary}><span>Read the trust model</span><Arrow /></Link></div></div></section><CTA /></div>
}

function WorkforcePage() {
  return <div className={styles.page}><CoreHero eyebrow="01 / Afluma workforce" title="Ten responsibilities." accent="One shared company context." description="Afluma’s workforce is a set of persistent digital coworkers designed around real organisational roles rather than a swarm of interchangeable chatbots." note="The public identities make responsibility legible. Their authority is still defined by the systems, permissions and approval boundaries behind each task." /><section className={styles.section}><div className={styles.shell}><Heading eyebrow="The team" title={<>Distinct minds.<br />Shared purpose.</>} body="Each digital coworker owns a domain, has explicit non-responsibilities and hands work to other roles when the task crosses a boundary." /><AgentGrid /></div></section><section className={`${styles.section} ${styles.sectionNight}`}><div className={styles.shell}><Heading eyebrow="Coordination" title={<>A handoff should carry<br />more than a message.</>} body="Work moves with context: what was requested, what was produced, what remains uncertain, who owns the next decision and whether approval is required." /><div className={styles.flow}><strong>Request + context</strong><i>→</i><strong>Role-owned work</strong><i>→</i><strong>Review / next owner</strong></div></div></section><CTA title="Meet the workforce, then give it a real problem to solve." /></div>
}

function PlatformPage() {
  const layers = [
    ['01 / Identity', 'Persistent roles', 'Role, responsibility, policy and authority stay stable even when underlying models change.'],
    ['02 / Context', 'Evidence-governed memory', 'Approved knowledge, task history and business context remain scoped to the work.'],
    ['03 / Execution', 'Tools & model routing', 'Capabilities can use different providers without rewriting the organisational role around them.'],
    ['04 / Governance', 'Permissions & audit', 'High-impact actions require the right authority, verification and recovery path.'],
  ]
  return <div className={styles.page}><CoreHero eyebrow="02 / Platform" title="AgenticOS." accent="The shared layer behind the workforce." description="AgenticOS is the capability-first operating system Afluma is developing to coordinate identity, knowledge, models, tools, handoffs and governance across persistent AI coworkers." /><section className={`${styles.section} ${styles.sectionNight}`}><div className={styles.shell}><Heading eyebrow="Core architecture" title={<>Identity above models.<br />Governance around action.</>} body="The architecture is designed so Afluma is not defined by one LLM vendor. The organisational interface stays stable while providers and capabilities can be benchmarked and replaced." /><div className={styles.architecture}>{layers.map(([label, title, body]) => <article key={title}><span>{label}</span><h3>{title}</h3><p>{body}</p></article>)}</div><div className={styles.flow}><strong>Human direction</strong><i>→</i><strong>AgenticOS</strong><i>→</i><strong>Bounded work</strong></div></div></section><section className={styles.section}><div className={styles.shell}><Heading eyebrow="The principle" title={<>Conversation is only<br />the interface.</>} body="The useful output is not the chat itself. The useful output is research completed, a workflow advanced, a product changed safely, a customer helped or a decision prepared with evidence." /><ModelGrid /></div></section><CTA /></div>
}

function ProductsPage() {
  return <div className={styles.page}><CoreHero eyebrow="03 / Products" title="Focused products." accent="One operating thesis." description="Afluma’s products extend the same AI-first company model into infrastructure, commerce and the human control surface." note="Product pages distinguish planned direction from implemented capability. Availability, integrations and maturity are confirmed separately rather than implied by the design." /><section className={`${styles.section} ${styles.sectionNight}`}><div className={styles.shell}><Heading eyebrow="The ecosystem" title={<>Three environments.<br />A common intelligence layer.</>} body="AgenticOS is the connective tissue. The products remain useful in their own domains while becoming stronger as the workforce gains validated capabilities." /><ProductsGrid /></div></section><section className={styles.section}><div className={styles.shell}><ModelGrid /></div></section><CTA title="Tell us which operating environment you want to improve first." /></div>
}

function ResearchPage() {
  return <div className={styles.page}><CoreHero eyebrow="04 / Research" title="From static assistants" accent="to developmental AI systems." description="Afluma’s long-term R&D explores how bounded AI systems can retain evidence, adapt workflows, coordinate specialised roles and improve without turning autonomy into an ungoverned black box." note="This page describes Afluma’s research direction. Hypotheses and architecture decisions are not presented as peer-reviewed scientific findings or proven commercial outcomes." /><section className={`${styles.section} ${styles.sectionTint}`}><div className={styles.shell}><Heading eyebrow="Research questions" title={<>The hard part is not<br />making AI talk.</>} body="The hard part is building systems that know what they are responsible for, what evidence they can trust, when they should ask for help and how their behaviour can improve safely." /><ResearchGrid /></div></section><section className={styles.section}><div className={styles.shell}><Heading eyebrow="Applied research" title={<>Research has to meet<br />a real operating constraint.</>} body="Afluma uses its own products and internal workflows as test environments so architecture decisions can be challenged by practical tasks rather than judged only by demos." /><div className={styles.proofGrid}><article className={styles.proofCard}><span className={styles.status}>Internal proving ground</span><h3>Afluma runs on Afluma</h3><p>Research, product work, operations and customer journeys become controlled settings for evaluating role behaviour, handoffs, memory and governance.</p></article><article className={styles.proofCard}><span className={styles.status}>Evidence gate</span><h3>Measure before claiming.</h3><p>A capability becomes proof only when the task, acceptance criteria, reviewer and outcome can be traced. A polished demo is not enough.</p></article></div></div></section><CTA /></div>
}

function ProofPage() {
  return <div className={styles.page}><CoreHero eyebrow="05 / Proof" title="Afluma runs" accent="on Afluma first." description="Before the operating model becomes a product for other businesses, Afluma is using its own company as the first controlled proving ground." note="Internal use is evidence only when the workflow and outcome are actually measured. Prototype screens, planned agents and architectural intent remain labelled as such." /><section className={styles.section}><div className={styles.shell}><Heading eyebrow="Evidence discipline" title={<>Build it. Use it.<br />Verify what changed.</>} body="The goal is not to manufacture the appearance of autonomy. The goal is to accumulate traceable examples where a bounded digital coworker completed useful work under the agreed governance model." /><div className={styles.proofGrid}><article className={styles.proofCard}><span className={styles.status}>What counts</span><h3>Traceable work</h3><p>A defined request, role owner, approved context, output, reviewer and observable outcome.</p></article><article className={styles.proofCard}><span className={styles.status}>What does not</span><h3>Technology theatre</h3><p>Invented metrics, fake customers, simulated operational claims or a polished interface presented as evidence of deployed autonomy.</p></article></div></div></section><section className={`${styles.section} ${styles.sectionNight}`}><div className={styles.shell}><Heading eyebrow="Current proving environments" title={<>The company.<br />The products.<br />The workflows.</>} body="AgenticOS, SerenOps, Afluma Commerce and Commander OS create progressively richer environments in which the workforce can be tested with real boundaries and real review." /><ProductsGrid /></div></section><CTA title="If you want proof, start with a bounded workflow we can actually measure." /></div>
}

function CompanyPage() {
  const points = [
    ['01', 'AI workforce at the centre', 'Ten persistent role-specific digital coworkers form the organisational interface Afluma is building around.'],
    ['02', 'A small human engineering core', 'People focus on platform improvement, judgment, oversight, safety and the work that should remain human-controlled.'],
    ['03', 'Focused products as proving systems', 'SerenOps, Commerce and Commander OS are environments where the operating model can solve concrete problems.'],
    ['04', 'A future platform for other companies', 'The long-term product opportunity is to turn validated parts of this company model into a governed AI workforce platform for other organisations.'],
  ]
  return <div className={styles.page}><CoreHero eyebrow="06 / Company" title="A focused" accent="AI company." description="Afluma is being built around one thesis: persistent AI coworkers can become a practical operating layer for a company when identity, tools, memory and authority are designed together." /><section className={styles.section}><div className={`${styles.shell} ${styles.companyGrid}`}><div className={styles.companyQuote}><p className={styles.eyebrow}>Afluma thesis</p><blockquote>Intelligence should do useful work — without making accountability disappear.</blockquote><p>The ambition is larger than automation, but the path is deliberately staged: prove bounded roles first, connect them second, expand authority only after evidence.</p></div><div className={styles.companyPoints}>{points.map(([number, title, body]) => <article key={number}><span>{number}</span><div><h3>{title}</h3><p>{body}</p></div></article>)}</div></div></section><section className={`${styles.section} ${styles.sectionTint}`}><div className={styles.shell}><Heading eyebrow="The workforce" title={<>A company architecture<br />people can understand.</>} body="The digital personas are not a disguise. Public identity is part of making role ownership visible, while disclosure makes clear that these are AI systems rather than biological employees." /><AgentGrid /></div></section><CTA /></div>
}

function TrustPage() {
  const items = [
    ['01 / Identity', 'Disclose the AI.', 'A named digital persona should make responsibility easier to understand, not trick someone into believing they are talking to a biological employee.'],
    ['02 / Authority', 'Bound the action.', 'Tool access, data access and consequential decisions are permissioned by task. A role title is never blanket authority.'],
    ['03 / Evidence', 'Show what supports the claim.', 'Knowledge and public claims should preserve lineage, uncertainty and review status rather than laundering assumptions into facts.'],
    ['04 / Operations', 'Verify and recover.', 'Changes need an accountable owner, observable result and recovery path before greater autonomy is justified.'],
  ]
  return <div className={styles.page}><CoreHero eyebrow="07 / Trust" title="Autonomous" accent="does not mean uncontrolled." description="Afluma’s governance model is designed around transparent AI identity, least-authority execution, evidence, human approvals and operational recovery." note="Security, privacy and compliance requirements differ by implementation and jurisdiction. This page describes design principles; it does not claim certifications that have not been verified." /><section className={styles.section}><div className={styles.shell}><Heading eyebrow="Trust model" title={<>The boundary is<br />part of the product.</>} body="A system is not trustworthy because it sounds confident. Trust comes from knowing who owns the task, what context was used, what the system was allowed to do and how the outcome was checked." /><div className={styles.trustGrid}>{items.map(([label, title, body]) => <article className={styles.trustCard} key={title}><span>{label}</span><h3>{title}</h3><p>{body}</p></article>)}</div><div className={styles.actions}><Link href="/responsible-ai" className={styles.primary}><span>Responsible AI</span><Arrow /></Link><Link href="/security" className={styles.secondary}><span>Security principles</span><Arrow /></Link></div></div></section><section className={`${styles.section} ${styles.sectionNight}`}><div className={styles.shell}><Heading eyebrow="Governance loop" title={<>Request. Scope.<br />Act. Verify.</>} body="Every increase in authority should preserve a clear chain from human intent to bounded execution and observable result." /><div className={styles.flow}><strong>Human intent</strong><i>→</i><strong>Permissioned work</strong><i>→</i><strong>Verified outcome</strong></div></div></section><CTA /></div>
}

export function AflumaCorePage({ slug }: { slug: string }) {
  if (slug === '') return <HomePage />
  if (slug === 'workforce') return <WorkforcePage />
  if (slug === 'platform' || slug === 'platform/agenticos') return <PlatformPage />
  if (slug === 'products') return <ProductsPage />
  if (slug === 'research') return <ResearchPage />
  if (slug === 'proof' || slug === 'proof/afluma-runs-on-afluma') return <ProofPage />
  if (slug === 'company') return <CompanyPage />
  if (slug === 'trust') return <TrustPage />
  return null
}
