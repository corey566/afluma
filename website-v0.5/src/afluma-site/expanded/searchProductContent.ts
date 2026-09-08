export type SearchAuthorityCard = {
  title: string
  body: string
  href?: string
  label?: string
  status?: 'implemented' | 'in-development' | 'research' | 'planned' | 'evidence-gated'
}

export type SearchAuthoritySection = {
  id: string
  eyebrow: string
  title: string
  intro: string
  cards?: SearchAuthorityCard[]
  bullets?: string[]
  questions?: { question: string; answer: string }[]
  tone?: 'light' | 'soft' | 'dark' | 'purple'
}

export type SearchAuthorityPage = {
  slug: string
  label: string
  sections: SearchAuthoritySection[]
  schema?: {
    type: 'SoftwareApplication' | 'Organization' | 'Service'
    name: string
    description: string
    applicationCategory?: string
  }
}

const productTruth = [
  'Product status is stated explicitly. Planned capability is not presented as shipped capability.',
  'Concept imagery and prototype UI must be labelled until replaced by verified product interfaces.',
  'Customer outcomes and case-study metrics require evidence before publication.',
  'High-impact AI actions remain bounded by permissions, policy and human approval where required.',
]

export const searchAuthorityPages: Record<string, SearchAuthorityPage> = {
  home: {
    slug: 'home',
    label: 'Search authority layer',
    sections: [
      {
        id: 'authority-position',
        eyebrow: 'Why Afluma exists',
        title: 'An AI-native company should be more than a collection of copilots.',
        intro: 'Afluma is building a company operating model where persistent AI coworkers, shared organizational knowledge, governed tools and human authority work as one system. The products and services below are different expressions of that same architecture.',
        cards: [
          { title: 'AI Workforce', body: 'Ten disclosed digital coworkers with defined professions, outputs, handoffs, capability boundaries and governance.', href: '/workforce/', label: 'Workforce' },
          { title: 'AgenticOS', body: 'The shared operating layer for agent identity, context, memory, knowledge, model routing, tools, workflows, approvals and audit.', href: '/platform/agenticos/', label: 'Platform' },
          { title: 'Afluma Commerce', body: 'A Sri Lanka-first unified-commerce platform being designed to connect selling, inventory, operations and business intelligence.', href: '/products/afluma-commerce/', label: 'Product', status: 'in-development' },
          { title: 'SerenOps', body: 'Infrastructure operations software being built around secure onboarding, controlled delivery and bounded AI assistance.', href: '/products/serenops/', label: 'Product', status: 'in-development' },
        ],
      },
      {
        id: 'authority-proof',
        eyebrow: 'Afluma Runs on Afluma',
        title: 'The operating model becomes credible when it runs real work.',
        intro: 'Afluma’s strongest long-term proof is not a marketing claim. It is the growing record of our own research, website, sales, delivery, security, product and growth workflows moving through the same governed system we intend to offer others.',
        bullets: ['Real workflow state instead of staged dashboards', 'Evidence-labelled experiments and research', 'Human approval for consequential actions', 'Measured handoffs between specialist agents', 'Failures and limitations retained as learning, not hidden'],
      },
      {
        id: 'authority-research',
        eyebrow: 'Non-commodity knowledge',
        title: 'Research should answer questions competitors cannot answer with generic AI copy.',
        intro: 'Afluma Research is being shaped around original experiments in agent memory, model routing, organizational cognition, governed autonomy and multi-agent coordination. The goal is useful first-party knowledge that can improve the product and stand on its own as evidence.',
        cards: [
          { title: 'Agent memory', body: 'What should be remembered, for how long, with what authority and how conflicting evidence is handled.', href: '/research/' },
          { title: 'Model routing', body: 'How capability, latency, cost and risk influence which model or deterministic system should handle a task.', href: '/research/' },
          { title: 'Human approval', body: 'Where autonomy adds value and where a person should remain the final authority.', href: '/trust/' },
        ],
      },
    ],
  },

  products: {
    slug: 'products',
    label: 'Product intelligence',
    sections: [
      {
        id: 'product-system',
        eyebrow: 'One architecture, different operating problems',
        title: 'Afluma products are not unrelated SaaS experiments.',
        intro: 'Each product addresses a different operational layer while sharing the same principles: clear state, strong data integrity, explicit permissions, observable workflows and AI that works inside boundaries rather than sitting on top as decoration.',
        cards: [
          { title: 'AgenticOS', body: 'The AI workforce operating layer: identity, memory, knowledge, model routing, capabilities, approvals, handoffs and audit.', href: '/platform/agenticos/', label: 'Platform foundation', status: 'research' },
          { title: 'Afluma Commerce', body: 'Unified commerce for businesses that need POS, ecommerce, inventory, orders, CRM, finance and offline resilience to work together.', href: '/products/afluma-commerce/', label: 'Commerce', status: 'in-development' },
          { title: 'SerenOps', body: 'Infrastructure operations for teams that need safer onboarding, delivery, visibility, fleet operations and bounded AI assistance.', href: '/products/serenops/', label: 'Infrastructure', status: 'in-development' },
        ],
      },
      {
        id: 'product-fit',
        eyebrow: 'Choose by operating problem',
        title: 'Start with the work that must become easier, safer or more intelligent.',
        intro: 'Afluma avoids forcing every customer into the same product. The problem determines the layer.',
        cards: [
          { title: 'Coordinate digital workers', body: 'Use AgenticOS concepts when the core problem is roles, memory, tools, handoffs, policy and governed agent execution.', href: '/platform/agenticos/' },
          { title: 'Run connected commerce', body: 'Use Afluma Commerce when the problem spans selling, stock, orders, customers, finance and store continuity.', href: '/products/afluma-commerce/' },
          { title: 'Operate infrastructure', body: 'Use SerenOps when the problem is server/app visibility, controlled change, fleet operations and infrastructure intelligence.', href: '/products/serenops/' },
        ],
      },
      {
        id: 'product-difference',
        eyebrow: 'Design principle',
        title: 'AI should improve the operating system, not decorate the interface.',
        intro: 'Many products add chat to an existing workflow. Afluma’s product direction goes deeper: model the business state, expose the relevant tools, preserve permissions and use AI only where reasoning, retrieval, coordination or generation genuinely improves the work.',
        bullets: ['Structured operational state before generative action', 'Capability routing instead of one-model-for-everything', 'Human approval for material decisions', 'Audit trails and observable workflow state', 'Graceful fallback when AI is unavailable or uncertain'],
      },
      {
        id: 'product-truth',
        eyebrow: 'Product truth standard',
        title: 'Roadmaps are useful only when the boundary between now and later is visible.',
        intro: 'Afluma publishes product direction with explicit implementation status. This is especially important while Commerce, SerenOps and AgenticOS evolve.',
        bullets: productTruth,
      },
      {
        id: 'product-docs',
        eyebrow: 'Documentation & research',
        title: 'Products should accumulate implementation knowledge, not just feature pages.',
        intro: 'The product network will progressively include architecture notes, integration guidance, operating playbooks, security boundaries, release notes, comparisons and evidence-backed research. These pages are published only when they contain unique useful intent.',
        cards: [
          { title: 'Research', body: 'Original work on agents, memory, routing, cognition and evaluation.', href: '/research/' },
          { title: 'Trust', body: 'AI disclosure, permissions, approval, security, privacy and auditability.', href: '/trust/' },
          { title: 'Proof', body: 'Verified product interfaces, internal operating evidence and case studies as they become available.', href: '/proof/' },
        ],
      },
    ],
  },

  'products/afluma-commerce': {
    slug: 'products/afluma-commerce',
    label: 'Commerce authority layer',
    schema: {
      type: 'SoftwareApplication',
      name: 'Afluma Commerce',
      description: 'Sri Lanka-first unified-commerce platform in development for POS, ecommerce, inventory, orders, CRM, finance and offline Store Edge.',
      applicationCategory: 'BusinessApplication',
    },
    sections: [
      {
        id: 'commerce-problem',
        eyebrow: 'Unified commerce',
        title: 'Sell in more places without creating separate versions of the business.',
        intro: 'Afluma Commerce is being designed for merchants whose storefront, POS, inventory, purchasing, customer records, money and reporting must agree. The product direction is one operating layer with specialized surfaces rather than disconnected systems that reconcile by hand.',
        bullets: ['POS and physical stores', 'Ecommerce and digital orders', 'Inventory and warehouses', 'Purchasing and suppliers', 'Orders, returns and fulfilment', 'CRM and loyalty', 'Accounting, payments and payroll', 'Reporting, integrations and multi-store operations'],
      },
      {
        id: 'commerce-sri-lanka',
        eyebrow: 'Sri Lanka first, globally extensible',
        title: 'Local operating realities belong in the architecture.',
        intro: 'The first design context is Sri Lanka and South Asia: intermittent connectivity, multilingual operations, mixed cash/digital payment behavior, small teams doing many jobs and merchants that cannot stop selling because the internet is unstable.',
        cards: [
          { title: 'Offline Store Edge', body: 'A separate store-side operating layer is intended to keep essential retail workflows available during connectivity disruption, with controlled synchronization when connectivity returns.', status: 'in-development' },
          { title: 'Multilingual foundation', body: 'English, Sinhala, Tamil and Hindi are core product requirements rather than a late translation layer.', status: 'planned' },
          { title: 'Local integrations', body: 'Payments, banking, tax/accounting and regional services are adapter concerns that must be verified against real provider contracts before being presented as live.', status: 'evidence-gated' },
        ],
      },
      {
        id: 'commerce-progressive-entry',
        eyebrow: 'Merchant UX',
        title: 'Simple input for the merchant, detailed structure underneath.',
        intro: 'Product creation should not feel like filling a giant ERP form. The intended UX is progressive and category-aware: capture the minimum useful information first, then reveal variant, inventory, storefront, POS, SEO and reporting details when they matter.',
        bullets: ['Quick product-kind selection', 'Progressive fields instead of a single giant form', 'Canonical product and variant model underneath', 'Offers separated from core product identity', 'Inventory/location data separated from descriptive content', 'Storefront and POS presentation generated from shared truth'],
      },
      {
        id: 'commerce-ai',
        eyebrow: 'AI-native commerce',
        title: 'The AI layer should help operate the merchant, not just write product descriptions.',
        intro: 'Long-term Afluma Commerce differentiates through operational assistance: onboarding, catalog support, anomaly surfacing, customer-service context, reporting explanations, content assistance and workflow automation. Every capability remains constrained by data access and approval rules.',
        cards: [
          { title: 'Understand', body: 'Explain performance, inventory movement and operating exceptions using real business data.' },
          { title: 'Assist', body: 'Help with catalog, customer support, reporting, campaigns and repetitive coordination without fabricating facts.' },
          { title: 'Act within bounds', body: 'Trigger approved workflows only where permissions, state and rollback behavior are defined.' },
        ],
      },
      {
        id: 'commerce-fit',
        eyebrow: 'Where it fits',
        title: 'Afluma Commerce is for businesses that have outgrown disconnected tools but do not want enterprise software complexity.',
        intro: 'The product is being aimed at small and growing merchants that need one operational truth across stores and channels while preserving a path to more advanced finance, automation and multi-location operations.',
        questions: [
          { question: 'Is Afluma Commerce available as a finished 1.0 platform?', answer: 'No. It remains in active development. Public pages should distinguish current implementation, prototype UI and long-term product direction.' },
          { question: 'Is it only for Sri Lanka?', answer: 'No. Sri Lanka is the first operating context. The architecture is intended to remain modular and integration-friendly enough for wider regional and international deployment.' },
          { question: 'Will every module launch at once?', answer: 'No. The product is intentionally being scoped so the MVP is narrower than the long-term platform vision.' },
        ],
      },
      {
        id: 'commerce-truth',
        eyebrow: 'Evidence gate',
        title: 'Commerce visuals and claims must match the actual build.',
        intro: 'Concept POS, inventory, storefront, mobile and reporting interfaces can support product direction only when clearly labelled. They are replaced with verified product UI as implementation matures.',
        bullets: productTruth,
      },
    ],
  },

  'products/serenops': {
    slug: 'products/serenops',
    label: 'SerenOps authority layer',
    schema: {
      type: 'SoftwareApplication',
      name: 'SerenOps',
      description: 'Infrastructure operations software in development around secure onboarding, controlled delivery, fleet visibility and bounded AI assistance.',
      applicationCategory: 'DeveloperApplication',
    },
    sections: [
      {
        id: 'serenops-problem',
        eyebrow: 'Infrastructure operations',
        title: 'Infrastructure AI is useful only when it understands state, authority and blast radius.',
        intro: 'SerenOps is being designed as an operational control plane rather than a chat interface placed beside servers. The system direction connects identity, onboarding, delivery, edge/network controls, fleet state, observability and policy-bound AI actions.',
        cards: [
          { title: 'Foundation', body: 'Identity, secure onboarding and an explicit operational baseline.', status: 'in-development' },
          { title: 'Controlled delivery', body: 'Immutable application delivery and reversible change paths.', status: 'planned' },
          { title: 'Cloudflare control plane', body: 'Dedicated edge/network operations through scoped provider integration.', status: 'planned' },
          { title: 'Seren AI', body: 'Policy-bound assistance that reasons over infrastructure evidence rather than acting without context.', status: 'planned' },
        ],
      },
      {
        id: 'serenops-current',
        eyebrow: 'Current implementation truth',
        title: 'Fleet is the first module being completed. Process Inspector is still unfinished.',
        intro: 'The wider SerenOps roadmap remains direction, not a completion claim. The website should keep this boundary visible so technical credibility grows from demonstrated capability instead of roadmap inflation.',
        bullets: ['Overall Phase 1 is not complete', 'Fleet is the current first module', 'Fleet → Process Inspector remains unfinished', 'Future maintenance and autonomous operations remain bounded and policy-controlled', 'No roadmap phase is presented as complete without passing its implementation and test gates'],
      },
      {
        id: 'serenops-use-cases',
        eyebrow: 'Technical use cases',
        title: 'Designed around the moments infrastructure teams actually lose context.',
        intro: 'SerenOps content should answer concrete operational questions rather than repeating generic AIOps language.',
        cards: [
          { title: 'What is running?', body: 'Build a reliable view of servers, applications, processes, releases and operational state.' },
          { title: 'What changed?', body: 'Connect release, configuration and provider events to the current system state.' },
          { title: 'What is safe to do?', body: 'Evaluate permissions, policy, dependencies, blast radius and rollback before an action.' },
          { title: 'What needs a person?', body: 'Escalate disruptive, ambiguous or high-risk operations instead of converting uncertainty into automation.' },
        ],
      },
      {
        id: 'serenops-search-intelligence',
        eyebrow: 'Search + infrastructure knowledge',
        title: 'Search performance can become operational state too.',
        intro: 'The technical architecture already treats CMS publication, Search Console, analytics, crawling and release state as related resources. That makes it possible to investigate whether an indexing or visibility change followed a release, robots change, certificate problem, CMS event or infrastructure failure instead of treating SEO as a disconnected dashboard.',
        bullets: ['Search Console query/page/device/country aggregates', 'Sitemap and URL-inspection state', 'Analytics page/session/event data', 'Crawler evidence for status, canonical, metadata, schema and links', 'Release-aware verification and recovery'],
      },
      {
        id: 'serenops-authority',
        eyebrow: 'Technical authority',
        title: 'Documentation should show the engineering boundary, not hide it.',
        intro: 'The SerenOps content network should progressively publish architecture decisions, implementation notes, fleet concepts, secure onboarding patterns, delivery controls, observability, policy and verified lessons from real development.',
        cards: [
          { title: 'Engineering', body: 'Implementation decisions and tested system behavior.', href: '/research/' },
          { title: 'Security', body: 'Authorization, secrets, threat boundaries and resilience.', href: '/trust/' },
          { title: 'Roadmap', body: 'Current state and future capability clearly separated.', href: '/products/serenops/' },
        ],
      },
      {
        id: 'serenops-truth',
        eyebrow: 'Evidence gate',
        title: 'No green status without a passing gate.',
        intro: 'SerenOps uses a stricter public-claim standard because infrastructure software can create material operational risk.',
        bullets: productTruth,
      },
    ],
  },

  'platform/agenticos': {
    slug: 'platform/agenticos',
    label: 'AgenticOS authority layer',
    schema: {
      type: 'SoftwareApplication',
      name: 'AgenticOS',
      description: 'Afluma’s research and platform direction for governed AI workforce identity, memory, orchestration, tools, approvals and auditability.',
      applicationCategory: 'BusinessApplication',
    },
    sections: [
      {
        id: 'agenticos-definition',
        eyebrow: 'Definition',
        title: 'AgenticOS is the operating layer between an AI model and real organizational work.',
        intro: 'A model can generate an answer. An organization needs identity, task state, memory, knowledge authority, permissions, tools, handoffs, approvals, cost controls and recovery. AgenticOS is the architecture Afluma is developing around those missing layers.',
        bullets: ['Agent identity and role registry', 'Task/context assembly', 'Model and capability routing', 'Evidence-aware memory and knowledge', 'Tool gateway and scoped credentials', 'Workflow state and handoffs', 'Human approval and policy', 'Audit, observability and cost'],
      },
      {
        id: 'agenticos-vs-copilot',
        eyebrow: 'Why an operating layer',
        title: 'A workforce is different from a set of independent copilots.',
        intro: 'Independent assistants can be useful, but company work crosses roles and systems. AgenticOS focuses on how specialized agents share context without collapsing authority, how work survives long-running processes and how a human can inspect why an action happened.',
        cards: [
          { title: 'Persistent roles', body: 'Each coworker has a stable profession, mission, capabilities, outputs, boundaries and handoffs.' },
          { title: 'Shared cognition', body: 'Common organizational context exists without treating every retrieved document as permanent truth.' },
          { title: 'Governed action', body: 'Tools sit behind scoped adapters, permissions and explicit approval rules.' },
          { title: 'Observable work', body: 'Tasks, events, retries, costs, approvals and outcomes remain inspectable.' },
        ],
      },
      {
        id: 'agenticos-memory',
        eyebrow: 'Memory & knowledge',
        title: 'Retrieval is not memory, and memory is not organizational truth.',
        intro: 'AgenticOS separates temporary task context, retrieved evidence, structured records, learned preferences and reviewed organizational knowledge. Conflicts and source confidence remain visible instead of being silently flattened into a single answer.',
        questions: [
          { question: 'Why separate memory levels?', answer: 'Different information has different authority and lifetime. A conversation detail should not automatically override a reviewed policy or verified business record.' },
          { question: 'Why keep source confidence?', answer: 'Agents need to know whether a statement came from an authoritative record, an external source, an inference or an unverified note.' },
          { question: 'Why does this matter for AI search?', answer: 'The same source-aware knowledge architecture can support public answers, website content, proposals and internal operations without manufacturing certainty.' },
        ],
      },
      {
        id: 'agenticos-routing',
        eyebrow: 'Capability routing',
        title: 'The smartest model is not automatically the right model for every task.',
        intro: 'AgenticOS is designed around capability classes so work can be routed by reasoning depth, speed, modality, cost, privacy and operational risk. Deterministic code remains preferable when the task does not need generative reasoning.',
        bullets: ['Deep reasoning for difficult planning and architecture', 'Fast models for classification and routine conversation', 'Research models for evidence-heavy tasks', 'Vision/speech/embedding capabilities when required', 'Open or local models where deployment constraints justify them', 'Deterministic logic for predictable calculations and policy checks'],
      },
      {
        id: 'agenticos-governance',
        eyebrow: 'Agent governance',
        title: 'Autonomy is a permission, not a personality trait.',
        intro: 'Afluma’s governance model treats the agent identity, task, tool, action type, data scope and business risk as inputs to an authorization decision. High-impact actions can require review, while low-risk reversible steps can be automated more aggressively.',
        cards: [
          { title: 'Identity', body: 'Who is acting and which role/capability contract applies?' },
          { title: 'Authority', body: 'Which tools, data and action classes are permitted for this task?' },
          { title: 'Evidence', body: 'What information supports the decision and how reliable is it?' },
          { title: 'Recovery', body: 'Can the action be paused, retried, reversed or escalated safely?' },
        ],
      },
      {
        id: 'agenticos-research',
        eyebrow: 'Research program',
        title: 'The platform should improve through measured experiments, not agent mythology.',
        intro: 'Afluma Research is intended to test memory quality, model routing, handoff performance, cost, latency, human intervention and failure modes. Results should feed back into architecture and public documentation when they are strong enough to support a claim.',
        cards: [
          { title: 'Research', body: 'Experiments, evidence matrices and technical notes.', href: '/research/' },
          { title: 'Workforce', body: 'The ten role contracts that exercise the platform.', href: '/workforce/' },
          { title: 'Trust', body: 'Approval, disclosure, privacy, security and audit rules.', href: '/trust/' },
        ],
      },
    ],
  },

  workforce: {
    slug: 'workforce',
    label: 'Workforce authority layer',
    sections: [
      {
        id: 'workforce-definition',
        eyebrow: 'AI workforce',
        title: 'The ten are jobs, not mascots.',
        intro: 'Each Afluma digital coworker has a profession, mission, capability contract, expected outputs, tools, governance limits and handoff relationships. The character is the human interface; operational responsibility is the product design.',
      },
      {
        id: 'workforce-collaboration',
        eyebrow: 'Multi-agent work',
        title: 'The useful unit is the handoff, not the number of agents.',
        intro: 'Afluma measures whether context survives between research, architecture, design, engineering, security, delivery, growth and customer success. A multi-agent system that creates more coordination overhead than it removes is not an improvement.',
        bullets: ['Lumina builds evidence', 'Aether turns evidence into architecture', 'Amara translates architecture into experience', 'Kai implements software and automation', 'Mikhail reviews security and resilience', 'Leila coordinates delivery and continuity', 'Yara and Esme connect commercial and customer context', 'Idris closes the growth learning loop'],
      },
      {
        id: 'workforce-disclosure',
        eyebrow: 'Disclosure',
        title: 'A digital coworker should never depend on the user believing it is a biological human.',
        intro: 'Public profiles use clear labels such as “AI teammate at Afluma” or “Afluma digital persona.” Personality can make interaction more useful, but fictional biography never replaces disclosure.',
      },
      {
        id: 'workforce-evaluation',
        eyebrow: 'Evaluation',
        title: 'A workforce earns trust through output quality, boundaries and recovery.',
        intro: 'Role-level evaluation should track whether the agent produces useful outputs, cites or preserves evidence where required, hands work off correctly, stays inside tool permissions and escalates uncertainty instead of manufacturing confidence.',
      },
    ],
  },

  services: {
    slug: 'services',
    label: 'Service authority layer',
    sections: [
      {
        id: 'services-outcomes',
        eyebrow: 'Outcome-led services',
        title: 'The public service catalogue should help a buyer solve a problem, not decode our org chart.',
        intro: 'Afluma still has deep capabilities across software, AI, design, commerce, operations, data, cloud, growth and transformation. The visible experience groups them around Start, Grow, Operate and Transform so customers reach the right combination without browsing fifteen equal-weight departments.',
        cards: [
          { title: 'Start', body: 'Business architecture, product strategy, experience design, software and launch systems.', href: '/solutions/start-a-business/' },
          { title: 'Grow', body: 'SEO, AI-search visibility, content, CRM, commerce, analytics and experimentation.', href: '/solutions/grow-a-business/' },
          { title: 'Operate', body: 'Workflow automation, managed operations, customer experience, finance, procurement and reporting.', href: '/solutions/operate-smarter/' },
          { title: 'Transform', body: 'AI workforce design, AgenticOS architecture, knowledge, governance and system integration.', href: '/solutions/ai-transformation/' },
        ],
      },
      {
        id: 'services-ai-native',
        eyebrow: 'AI-native delivery',
        title: 'AI is a capability inside the solution, not a mandatory feature on every project.',
        intro: 'Afluma chooses deterministic software, workflow automation, retrieval, agents, generative models or human operation based on what creates the most reliable outcome. “Powered by AI” is not treated as a substitute for architecture.',
      },
      {
        id: 'services-commercial',
        eyebrow: 'How to engage',
        title: 'Project, dedicated team, managed service, consulting or build + operate.',
        intro: 'Different operating problems need different commercial structures. A defined product build may suit milestones; ongoing operations may need a managed service; transformation work may start with architecture and continue into implementation and operation.',
      },
      {
        id: 'services-proof',
        eyebrow: 'Proof standard',
        title: 'The strongest service page is the one that can show what changed.',
        intro: 'Service pages should progressively connect to verified case evidence, implementation artifacts, research and measurable outcomes. Until that evidence exists, the page should explain the method and boundaries rather than inventing client results.',
      },
    ],
  },

  'services/ai-automation': {
    slug: 'services/ai-automation',
    label: 'AI automation authority layer',
    sections: [
      {
        id: 'ai-automation-definition',
        eyebrow: 'AI automation services',
        title: 'Automate around accountability.',
        intro: 'Afluma combines workflow automation, assistants, document/data processing, API integration and AI agents where they reduce repetitive work or improve access to knowledge without erasing the owner of the decision.',
        cards: [
          { title: 'AI assistants', body: 'Task-focused assistants grounded in approved business information.' },
          { title: 'Workflow automation', body: 'Routing, notifications, repetitive actions, approvals and process coordination.' },
          { title: 'Document & data workflows', body: 'Extraction, classification, summarisation and structured handling of business information.' },
          { title: 'Agent integration', body: 'Role-specific agents connected to tools, policies and business state rather than isolated chat interfaces.' },
        ],
      },
      {
        id: 'ai-automation-method',
        eyebrow: 'Implementation method',
        title: 'Map the workflow before selecting the model.',
        intro: 'The first questions are where work begins, which data is authoritative, which exceptions occur, what can be reversed, who owns the outcome and where approval is needed. Only then does model or vendor selection become useful.',
      },
      {
        id: 'ai-automation-governance',
        eyebrow: 'Governance',
        title: 'AI agents need the same clarity about authority that people do.',
        intro: 'Afluma designs tool access, data scope, human approval, logs, failure behavior and escalation into the workflow. Higher autonomy is earned where the task is well-defined, low-risk and observable.',
      },
      {
        id: 'ai-automation-sri-lanka',
        eyebrow: 'Sri Lanka & regional delivery',
        title: 'AI automation should fit the systems businesses actually use here.',
        intro: 'Regional implementations may involve WhatsApp, email, spreadsheets, legacy software, local payment/banking systems and multilingual customer communication. Integrations are verified provider-by-provider rather than promised generically.',
      },
    ],
  },

  'services/seo-digital-growth': {
    slug: 'services/seo-digital-growth',
    label: 'Search intelligence authority layer',
    sections: [
      {
        id: 'search-engine',
        eyebrow: 'Search + AI discovery',
        title: 'SEO remains the foundation of visibility in generative search.',
        intro: 'Afluma treats Google Search, AI search, answer engines and browser agents as connected discovery surfaces. The work begins with crawlability, indexability, useful content, entity clarity, page experience and real evidence rather than AEO/GEO hacks.',
        bullets: ['Technical crawl and index controls', 'Search intent and content architecture', 'Original research and non-commodity content', 'Structured internal linking and entity consistency', 'Search Console and analytics measurement', 'AI-referral and crawler accessibility', 'Continuous competitor and query research'],
      },
      {
        id: 'search-noncommodity',
        eyebrow: 'Content strategy',
        title: 'The goal is to publish something a model could not produce by summarizing the same ten websites.',
        intro: 'Afluma prioritizes first-party experiments, implementation lessons, verified operating data, product documentation, architecture decisions, real comparisons and region-specific expertise. Thin query variants stay out of the index until they earn a reason to exist.',
      },
      {
        id: 'search-ai-agents',
        eyebrow: 'Agent-friendly UX',
        title: 'A website now serves humans, crawlers and agents.',
        intro: 'Semantic links and buttons, explicit labels, stable layout, accessible forms, meaningful headings and visible state improve usability for people and also make the site easier for browser agents to interpret through HTML and the accessibility tree.',
      },
      {
        id: 'search-measurement',
        eyebrow: 'Measurement loop',
        title: 'Baseline → research → hypothesis → experiment → learn.',
        intro: 'Search work is managed as an experiment system: identify an opportunity, make a bounded change, measure query/page/country/device performance, record the result and promote only durable learning into the content system.',
        cards: [
          { title: 'Search Console', body: 'Clicks, impressions, CTR, position, pages, queries, countries, devices and indexing state.' },
          { title: 'Analytics', body: 'Sessions, engagement, conversion events and AI-assistant referral traffic.' },
          { title: 'Competitive research', body: 'Keyword gaps, SERP competitors, backlink opportunities and market movement when quantitative tools are available.' },
        ],
      },
      {
        id: 'search-index-policy',
        eyebrow: 'Index policy',
        title: 'Authority pages are indexed deliberately. The architecture backlog is not.',
        intro: 'The site may eventually contain thousands of useful routes, but page count is not the target. A page becomes indexable only when it has a distinct user intent, reviewed content, correct metadata, useful internal links and enough substance to compete on its own.',
      },
    ],
  },

  research: {
    slug: 'research',
    label: 'Research authority layer',
    sections: [
      {
        id: 'research-program',
        eyebrow: 'Research program',
        title: 'Afluma Research exists to turn uncertain AI assumptions into testable questions.',
        intro: 'The research agenda focuses on areas that materially affect an AI-native company: organizational cognition, evidence-governed memory, model routing, agent collaboration, bounded autonomy, cost, latency and human intervention.',
      },
      {
        id: 'research-method',
        eyebrow: 'Method',
        title: 'Question → evidence → experiment → result → limitation → knowledge update.',
        intro: 'Research pages should publish methodology, sources, uncertainty and negative findings where useful. The objective is not to make every experiment look successful; it is to improve the architecture and leave a record others can inspect.',
      },
      {
        id: 'research-benchmarks',
        eyebrow: 'Original benchmarks',
        title: 'The highest-value future content is first-party evidence.',
        intro: 'Candidate public studies include single-agent vs multi-agent task performance, memory quality under conflicting evidence, model-routing cost/latency trade-offs, human-approval rates and recovery behavior after tool or model failure.',
      },
      {
        id: 'research-to-product',
        eyebrow: 'Research → product',
        title: 'Research only compounds when the result changes the system.',
        intro: 'Validated findings can update AgenticOS policies, model-routing rules, agent role contracts, website knowledge, product design or governance. Unvalidated ideas remain research rather than quietly becoming product claims.',
      },
    ],
  },

  trust: {
    slug: 'trust',
    label: 'Governance authority layer',
    sections: [
      {
        id: 'trust-agent-governance',
        eyebrow: 'AI agent governance',
        title: 'Every action needs an identity, an authority boundary and a record.',
        intro: 'Afluma’s governance direction combines disclosed AI identity, capability contracts, scoped credentials, approval rules, evidence, audit logs, security controls and recovery paths. A high-quality answer is not enough when the system can also act.',
      },
      {
        id: 'trust-human',
        eyebrow: 'Human authority',
        title: 'Humans remain accountable for consequential commitments.',
        intro: 'Contracts, unusual pricing, high-value recommendations, sensitive security actions, material production changes and other high-impact decisions retain explicit human approval unless a narrower policy has been deliberately authorized.',
      },
      {
        id: 'trust-disclosure',
        eyebrow: 'AI disclosure',
        title: 'Personality is useful. Misrepresentation is not.',
        intro: 'Afluma’s digital coworkers may speak with a distinctive voice, but public surfaces identify them as AI teammates or digital personas. Fictional character details are separated from factual company and product claims.',
      },
      {
        id: 'trust-evidence',
        eyebrow: 'Evidence governance',
        title: 'Uncertainty remains visible all the way to the public claim.',
        intro: 'Source confidence, contradictions, implementation status and evidence gates are designed to stop provisional information from silently turning into company truth or marketing copy.',
      },
    ],
  },
}

export function getSearchAuthorityPage(slug: string) {
  const normalized = (slug || 'home').replace(/^\/+|\/+$/g, '') || 'home'
  return searchAuthorityPages[normalized]
}
