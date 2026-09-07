import { cataloguePages } from './catalogue'
import { articles } from './articles'
import { agents } from '@/afluma-core/agents/registry'

export const workforce = agents.map((agent) => ({
  ...agent,
  slug: agent.name.toLowerCase().replaceAll(' ', '-'),
  initials: agent.name.split(' ').map((part) => part[0]).join(''),
}))

export type EditorialSection = { title: string; body: string; items?: string[] }
export type SitePage = {
  slug: string
  eyebrow: string
  title: string
  description: string
  sections: EditorialSection[]
}

export const products = [
  { slug: 'serenops', name: 'SerenOps', label: 'Infrastructure operations', number: '01', description: 'The operational foundation for deploying, maintaining and protecting the systems an AI workforce depends on.', focus: 'Infrastructure → governed operations', sections: [
    { title: 'Give infrastructure a clear owner.', body: 'SerenOps is being developed to connect infrastructure context, operational tasks and controlled execution. Its purpose is to help teams understand the environment before changing it.', items: ['Map systems, services and dependencies.', 'Prepare changes with explicit scope and permissions.', 'Verify the result and keep a path to recovery.'] },
    { title: 'The workforce needs reliable ground.', body: 'AgenticOS defines the work and its boundaries. SerenOps is the infrastructure operations product intended to put those boundaries into practice around servers and applications. Mikhail’s security role and Kai’s engineering role describe the responsibilities that meet here.' },
    { title: 'Start with your environment.', body: 'Deployment support, integrations and operating scope need to be assessed against the systems you actually run. Discuss the environment with Afluma before planning an implementation.' },
  ] },
  { slug: 'afluma-commerce', name: 'Afluma Commerce', label: 'AI-native commerce', number: '02', description: 'A business application connecting the customer experience to the operational work behind every sale.', focus: 'Commerce → everyday business work', sections: [
    { title: 'Connect the work behind the storefront.', body: 'Afluma Commerce brings the commerce direction into focus: product information, orders, inventory and merchant workflows belong to one operating picture. AI assistance should work with that context.', items: ['Product and catalogue management', 'Merchant control workspace and onboarding', 'Customer-facing storefront experiences', 'Product media and change history', 'Connected order and inventory workflows — planned', 'AI-assisted merchant operations — planned'] },
    { title: 'A proving ground for AI work.', body: 'Commerce gives the workforce a practical context: a customer asks a question, a merchant needs information, or a product needs attention. The long-term direction is to connect these tasks to AgenticOS with scoped access and clear handoffs.' },
    { title: 'Build around the merchant.', body: 'Channel support, payments, accounting connections and automation scope depend on the implementation. We start with the merchant’s workflow and confirm requirements before promising an integration.' },
  ] },
  { slug: 'commander-os', name: 'Commander OS', label: 'Local-first control room', number: '03', description: 'The human-facing control room for organising context, directing work and making the decisions that matter.', focus: 'Human direction → coordinated action', sections: [
    { title: 'Keep the person in command.', body: 'Commander OS is the local-first product direction for bringing information, tasks and decisions into a focused workspace. It is intended to become the interface through which people direct the wider Afluma operating model.', items: ['Keep working context close to the person using it.', 'Make tasks, priorities and decisions visible.', 'Bring proven agents into a shared control interface.'] },
    { title: 'Independent agents. A common control room.', body: 'The development sequence begins with individual agents that can be tested in isolation. Commander OS is intended to connect those agents once their responsibilities, permissions and behaviour are established.' },
    { title: 'Local-first, with explicit connections.', body: 'Local-first describes the product’s direction for ownership and working context. Any external model or service connection still needs its own data-handling and permission boundaries. Availability and supported platforms should be confirmed with Afluma.' },
  ] },
] satisfies Array<{slug: string; name: string; label: string; number: string; description: string; focus: string; sections: EditorialSection[]}>

export const pages: SitePage[] = [...cataloguePages,
  {slug:'blog',eyebrow:'Practical guides',title:'Ideas you can put to work.',description:'Afluma perspectives on choosing useful AI workflows, building clear digital experiences and keeping delivery accountable.',sections:[]},
  ...articles.map((article)=>({slug:`blog/${article.slug}`,eyebrow:'Afluma practical guide',title:article.title,description:article.description,sections:article.sections.map((section)=>({...section}))})),
  { slug: 'news', eyebrow: 'AI news & reading', title: 'Follow the work behind the headlines.', description: 'A curated reading list on AI, research, business adoption and search. Each item links directly to its original publisher.', sections: [] },
  { slug: '', eyebrow: 'Afluma · Intelligence in motion', title: 'A workforce built from intelligence.', description: 'Afluma is building an AI workforce: persistent digital teammates, connected by AgenticOS, working across products and operations with people in command.', sections: [] },
  { slug: 'workforce', eyebrow: 'The Afluma workforce', title: 'Distinct minds. Shared purpose.', description: 'Ten digital personas, each with a defined responsibility. Together, they describe how an AI-native company can connect strategy, design, engineering and operations.', sections: [] },
  { slug: 'platform/agenticos', eyebrow: 'The central operating layer', title: 'One system for work that connects.', description: 'AgenticOS is the shared operating layer being developed for Afluma’s AI workforce: identity, context, tools, coordination and human governance.', sections: [
    { title: 'Identity persists. Models can change.', body: 'A teammate’s role, responsibilities and boundaries should not disappear when the underlying model changes. The architecture separates agent identity from model selection and execution.' },
    { title: 'Context belongs to the work.', body: 'Knowledge, task history and authorised business information give each agent the context needed for its responsibility. Access should be scoped to the task, with evidence and handoffs preserved.' },
    { title: 'Collaboration needs a contract.', body: 'A request moves between roles with an owner, expected output and approval boundary. Agents should escalate uncertainty and return useful work that another teammate or person can inspect.' },
    { title: 'Autonomy is earned through validation.', body: 'Afluma’s direction is to establish individual agents, test their behaviour, and expand their authority only within agreed boundaries. High-impact changes remain subject to human approval.' },
  ] },
  { slug: 'products', eyebrow: 'The Afluma ecosystem', title: 'One company. Connected products.', description: 'AgenticOS connects the workforce. SerenOps, Afluma Commerce and Commander OS bring that operating model into infrastructure, business and human control.', sections: [] },
  ...products.map((product) => ({ slug: `products/${product.slug}`, eyebrow: product.label, title: product.name, description: product.description, sections: product.sections })),
  { slug: 'services', eyebrow: 'Build with Afluma', title: 'Make intelligence useful in your business.', description: 'Start with a workflow that needs to work better. We connect product thinking, engineering and AI to define a practical path from the problem to a working system.', sections: [
    { title: 'AI & workflow automation', body: 'Map repetitive work, decision points and exceptions. Define where AI can help, what it can access and which decisions need a person.', items: ['Workflow discovery and automation scope', 'Knowledge and system integration', 'Approval and exception design'] },
    { title: 'Product & software engineering', body: 'Shape useful interfaces and build maintainable software around the people who use it. Connect the product experience to the data and services that support it.', items: ['Product definition and experience design', 'Application development and integrations', 'Testing, release and operational handover'] },
    { title: 'Infrastructure & operational design', body: 'Make ownership, dependencies and change procedures explicit. Plan operations alongside implementation so the system can be maintained after launch.', items: ['Environment and dependency assessment', 'Deployment and recovery planning', 'Operational visibility and support boundaries'] },
  ] },
  { slug: 'about', eyebrow: 'One focused AI company', title: 'Building the company we believe in.', description: 'Afluma brings AI coworkers, software products and operational discipline into one company model. Our direction is to make intelligence useful through work people can understand and govern.', sections: [
    { title: 'The workforce is the starting point.', body: 'We begin with persistent AI roles and a common operating layer. Products and services give those roles practical settings in which to contribute, learn from feedback and be evaluated.' },
    { title: 'Build internally. Learn deliberately.', body: 'Afluma’s strategy is to develop the operating model inside its own work before extending proven capabilities to other organisations. That makes internal use a place to test assumptions, not a substitute for evidence.' },
    { title: 'People retain accountability.', body: 'The characters represent AI teammates, not human employees. Their public identities help explain responsibilities; real authority must be defined by permissions, approvals and operational ownership.' },
  ] },
  { slug: 'work', eyebrow: 'Our proving ground', title: 'Build it. Use it. Verify it.', description: 'Afluma’s products are the practical setting for its AI workforce strategy. Explore the systems being developed and the questions each one is designed to answer.', sections: [
    { title: 'Afluma runs on Afluma: the direction.', body: 'The intention is to apply the workforce to Afluma’s own research, product development, customer journeys and operations. Individual workflows need testing before they become evidence of autonomous operation.' },
    { title: 'What counts as proof?', body: 'A useful result has a defined task, a traceable output, a clear reviewer and an observable outcome. Customer results and performance figures belong here only when they can be verified and shared with permission.' },
  ] },
  { slug: 'research', eyebrow: 'Research & thinking', title: 'Better questions. More useful intelligence.', description: 'Explore the ideas behind Afluma’s operating model: persistent AI roles, accountable automation and products built around real work.', sections: [
    { title: 'What should an AI teammate remember?', body: 'Useful continuity needs deliberate boundaries. Afluma’s design direction separates role identity, approved knowledge and task context, so persistence does not become unrestricted access to information.' },
    { title: 'When is a handoff complete?', body: 'Passing a message is not enough. A meaningful handoff identifies what was requested, what was produced, what remains uncertain and who owns the next decision.' },
    { title: 'How do we evaluate autonomy?', body: 'The starting point is a bounded task with observable acceptance criteria. More autonomy should follow evidence of reliable behaviour and a defined recovery path, rather than a stronger marketing claim.' },
  ] },
  { slug: 'contact', eyebrow: 'Start a conversation', title: 'What should work better?', description: 'Tell us about the workflow, product or operating challenge. We’ll use your context to understand the right next conversation.', sections: [] },
  { slug: 'security', eyebrow: 'Trust & control', title: 'Control belongs in the architecture.', description: 'Afluma’s security direction puts permissions, operational visibility and human accountability alongside product design from the beginning.', sections: [
    { title: 'Limit the authority of each task.', body: 'Define who can request work, what an agent may access and which actions require approval. A public persona or job title is not evidence of unrestricted system access.' },
    { title: 'Make changes inspectable.', body: 'Operational changes should carry context, an accountable owner and a verification step. Recovery and escalation need to be considered before expanding automation.' },
    { title: 'Discuss your requirements.', body: 'Security requirements, data boundaries and deployment controls are assessed for each implementation. This page describes our design principles; it does not assert a certification or compliance status.' },
  ] },
  { slug: 'responsible-ai', eyebrow: 'Human-governed intelligence', title: 'Clear identity. Bounded authority.', description: 'AI teammates should be recognisable as AI, candid about uncertainty and accountable to the people who direct their work.', sections: [
    { title: 'Disclose the digital persona.', body: 'Yara, Mei and the other Afluma characters are AI teammates. Their names and professional identities make the workforce understandable; they are not presented as real human employees.' },
    { title: 'Separate proposals from decisions.', body: 'An agent can research, organise information and prepare a recommendation. Consequential commercial commitments, publishing and operational changes need authority appropriate to the action.' },
    { title: 'Ground the output.', body: 'Use approved context, preserve relevant evidence and make uncertainty visible. If the system cannot substantiate an answer, escalation is preferable to an invented claim.' },
  ] },
  { slug: 'careers', eyebrow: 'People at Afluma', title: 'Bring your judgment to intelligent systems.', description: 'Afluma’s work connects product, engineering, design and operations. Tell us what you build and which problems you care about.', sections: [
    { title: 'Start with an introduction.', body: 'Use the contact form and choose Career to share your interests. A conversation is not an advertised vacancy or an offer of employment; specific openings will have their own role details.' },
  ] },
]

export const aliases: Record<string, string> = {
  home: '', platform: 'platform/agenticos', 'platform/agentic-os': 'platform/agenticos',
  company: 'about', team: 'workforce', insights: 'research', 'start-project': 'contact',
  'proof/afluma-runs-on-afluma': 'work', 'products/agenticos': 'platform/agenticos',
}

export const findPage = (slug: string) => pages.find((page) => page.slug === slug)
export const findPersona = (slug: string) => workforce.find((agent) => `workforce/${agent.slug}` === slug)

