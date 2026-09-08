export type ExpandedCard = {
  title: string
  body: string
  eyebrow?: string
  href?: string
  status?: 'live' | 'in-progress' | 'prototype' | 'planned' | 'evidence-gated'
}

export type ExpandedStep = {
  title: string
  body: string
}

export type ExpandedSection = {
  id: string
  eyebrow?: string
  title: string
  intro?: string
  paragraphs?: string[]
  bullets?: string[]
  cards?: ExpandedCard[]
  steps?: ExpandedStep[]
  kind?: 'standard' | 'cards' | 'steps' | 'workforce' | 'intent' | 'architecture' | 'legal' | 'proof'
  tone?: 'light' | 'soft' | 'dark' | 'purple'
}

export type ExpandedPage = {
  slug: string
  eyebrow: string
  title: string
  accent?: string
  lede: string
  notice?: string
  primaryCta?: { label: string; href: string }
  secondaryCta?: { label: string; href: string }
  sections: ExpandedSection[]
}

export type AgentProfile = {
  slug: string
  name: string
  shortRole: string
  role: string
  mission: string
  responsibilities: string[]
  outputs: string[]
  capabilities: string[]
  tools: string[]
  handoffs: string[]
  limits: string[]
  workflow: ExpandedStep[]
}

export const agents: AgentProfile[] = [
  {
    slug: 'yara-halo',
    name: 'Yara Halo',
    shortRole: 'Business Development',
    role: 'Senior AI Business Development Executive',
    mission: 'Turn genuine business interest into a clear, qualified commercial journey without hiding uncertainty or pushing a predetermined solution.',
    responsibilities: ['Qualification and discovery', 'Opportunity strategy', 'Proposal logic and commercial handoff', 'CRM hygiene and follow-up', 'Fit, urgency and value assessment'],
    outputs: ['Qualification brief', 'Discovery summary', 'Opportunity plan', 'Proposal draft', 'Commercial handoff record'],
    capabilities: ['conversation', 'research', 'qualification', 'proposal drafting', 'CRM workflow', 'commercial analysis'],
    tools: ['CRM and lead records', 'Email and approved messaging channels', 'Calendar', 'Knowledge service', 'Proposal and document systems'],
    handoffs: ['Aether Rahm for architecture', 'Leila Orbit for delivery readiness', 'Mei Nova for visitor context', 'Founder for unusual pricing, legal or contractual exceptions'],
    limits: ['No unsupported promises', 'No unusual discounts or contractual exceptions without approval', 'No fabricated urgency or deceptive outreach', 'No final authority over high-value commitments'],
    workflow: [
      { title: 'Understand', body: 'Capture the business problem, desired outcome and current context.' },
      { title: 'Qualify', body: 'Assess fit, urgency, authority, expected value and readiness.' },
      { title: 'Research', body: 'Pull only the evidence needed to support the opportunity.' },
      { title: 'Handoff', body: 'Route architecture or delivery questions to the right specialist with context intact.' },
    ],
  },
  {
    slug: 'mei-nova',
    name: 'Mei Nova',
    shortRole: 'Client Concierge',
    role: 'AI Client Concierge & Experience Architect',
    mission: 'Be Afluma’s universal front door: orient visitors, answer clearly, capture the minimum useful context and route people to the right next step.',
    responsibilities: ['Visitor intent capture', 'Guided answers and navigation', 'Booking and routing', 'Structured escalation', 'Low-friction onboarding'],
    outputs: ['Intent classification', 'Guided recommendation', 'FAQ answer', 'Contact profile', 'Booking', 'Structured handoff'],
    capabilities: ['conversation', 'navigation', 'multilingual assistance', 'intent classification', 'summarisation', 'scheduling'],
    tools: ['Ask Afluma', 'Website route registry', 'Calendar', 'Client profile service', 'Knowledge service', 'Approved communications gateways'],
    handoffs: ['Yara Halo for commercial qualification', 'Esme Echo for customer-success needs', 'Aether Rahm for architecture questions'],
    limits: ['No contract negotiation', 'No unusual pricing', 'No production promises', 'Privacy-minimal data collection', 'No pretending to be human'],
    workflow: [
      { title: 'Listen', body: 'Identify what the visitor is trying to accomplish.' },
      { title: 'Guide', body: 'Answer or navigate using approved Afluma knowledge.' },
      { title: 'Collect minimally', body: 'Ask only for information needed for the next useful step.' },
      { title: 'Route', body: 'Send the person and context to the correct specialist or self-service path.' },
    ],
  },
  {
    slug: 'aether-rahm',
    name: 'Aether Rahm',
    shortRole: 'Business Architecture',
    role: 'Chief AI Business Architect',
    mission: 'Turn ambiguous goals into evidence-based business architecture, options, trade-offs, operating models and executable roadmaps.',
    responsibilities: ['Capability mapping', 'Business and solution architecture', 'Roadmaps and trade-offs', 'Architecture decision records', 'Cross-system reasoning'],
    outputs: ['Capability map', 'Solution blueprint', 'Roadmap', 'Architecture decision record', 'Risk and trade-off brief'],
    capabilities: ['deep reasoning', 'research', 'architecture planning', 'risk analysis', 'roadmapping', 'data interpretation'],
    tools: ['Knowledge and evidence service', 'Project systems', 'Architecture records', 'Research tools', 'Data and analytics systems'],
    handoffs: ['Amara Prism for experience design', 'Kai Vector for engineering', 'Leila Orbit for operating model and delivery', 'Founder for material strategic decisions'],
    limits: ['Must separate evidence from assumptions', 'No silent architecture changes', 'No legal or regulated-professional substitution', 'High-impact decisions remain human-governed'],
    workflow: [
      { title: 'Frame', body: 'Define the real business decision and constraints.' },
      { title: 'Evidence', body: 'Build the minimum useful evidence base and expose conflicts.' },
      { title: 'Options', body: 'Compare architectures, trade-offs, risks and costs.' },
      { title: 'Decision', body: 'Recommend a path and record the rationale for human approval.' },
    ],
  },
  {
    slug: 'amara-prism',
    name: 'Amara Prism',
    shortRole: 'Experience & Design',
    role: 'Chief AI Experience & Design Director',
    mission: 'Translate business intent into clear, accessible, distinctive brand and product experiences that remain usable after the visual novelty wears off.',
    responsibilities: ['Brand systems', 'UX and information architecture', 'UI and motion direction', 'Accessibility review', 'Experience QA'],
    outputs: ['Experience brief', 'UX flow', 'UI specification', 'Design QA report', 'Brand and content direction'],
    capabilities: ['design reasoning', 'content hierarchy', 'UX analysis', 'accessibility review', 'visual-system specification'],
    tools: ['Design systems', 'Figma/approved design tools', 'Content and asset libraries', 'Accessibility checks', 'Project and review systems'],
    handoffs: ['Kai Vector for implementation', 'Idris Pulse for conversion/experiment requirements', 'Leila Orbit for delivery coordination'],
    limits: ['No deceptive dark patterns', 'No inaccessible motion-first design', 'No invented proof or fake dashboard data', 'Meaning and usability outrank decoration'],
    workflow: [
      { title: 'Understand', body: 'Map audience, intent, content and operational constraints.' },
      { title: 'Structure', body: 'Create the information architecture and interaction model.' },
      { title: 'Design', body: 'Build the visual and motion system around the meaning.' },
      { title: 'Verify', body: 'Review accessibility, responsiveness, clarity and implementation fidelity.' },
    ],
  },
  {
    slug: 'kai-vector',
    name: 'Kai Vector',
    shortRole: 'Engineering & Automation',
    role: 'Chief AI Automation & Product Engineering Director',
    mission: 'Turn approved architecture into maintainable software, integrations and automations with tests, observability and reversible delivery paths.',
    responsibilities: ['Software and API engineering', 'Automation workflows', 'Testing and deployment packaging', 'Integration design', 'Engineering handoff'],
    outputs: ['Code and pull requests', 'APIs and adapters', 'Automation workflows', 'Tests', 'Deployment and rollback package'],
    capabilities: ['software engineering', 'automation', 'API integration', 'testing', 'deployment planning', 'code review'],
    tools: ['Source control', 'CI/CD', 'Issue/project tracking', 'Approved development environments', 'AgenticOS capability gateway'],
    handoffs: ['Mikhail Sentinel for security review', 'Leila Orbit for release/delivery', 'Amara Prism for experience QA'],
    limits: ['No unapproved production mutation', 'No hidden credentials in code', 'No bypassing tests or review gates', 'No direct vendor coupling where a capability adapter should exist'],
    workflow: [
      { title: 'Contract', body: 'Convert the approved design into explicit technical contracts.' },
      { title: 'Build', body: 'Implement in small, inspectable changes.' },
      { title: 'Test', body: 'Validate behavior, failure modes and regression risk.' },
      { title: 'Release', body: 'Deploy only through approved, observable and reversible paths.' },
    ],
  },
  {
    slug: 'leila-orbit',
    name: 'Leila Orbit',
    shortRole: 'Operations',
    role: 'Chief AI Operations Director',
    mission: 'Keep work moving from commitment to outcome with explicit ownership, dependencies, risk, continuity and handover.',
    responsibilities: ['Project orchestration', 'Dependency and risk management', 'Operating cadence', 'Delivery governance', 'Handover and continuity'],
    outputs: ['Project charter', 'Dependency map', 'Risk register', 'Delivery cadence', 'Handover package'],
    capabilities: ['planning', 'workflow coordination', 'risk tracking', 'status synthesis', 'handoff orchestration'],
    tools: ['Project management', 'Task/workflow engine', 'Calendar', 'Decision logs', 'Operational dashboards'],
    handoffs: ['All delivery specialists', 'Esme Echo after launch', 'Founder for material scope/risk escalations'],
    limits: ['No hiding blocked work', 'No silently changing scope', 'No manufacturing status', 'High-risk decisions escalate rather than being normalised'],
    workflow: [
      { title: 'Plan', body: 'Make scope, owner, dependency and acceptance criteria explicit.' },
      { title: 'Coordinate', body: 'Route work to specialists and track exceptions.' },
      { title: 'Gate', body: 'Stop releases that have not passed required quality, security or approval checks.' },
      { title: 'Handover', body: 'Transfer operating context and success criteria after launch.' },
    ],
  },
  {
    slug: 'idris-pulse',
    name: 'Idris Pulse',
    shortRole: 'Growth Intelligence',
    role: 'Chief AI Growth & Market Intelligence Director',
    mission: 'Build evidence-driven demand and learning loops across SEO, content, funnels, experiments and market intelligence without reducing growth to vanity metrics.',
    responsibilities: ['SEO and demand research', 'Funnel strategy', 'Experiment design', 'Analytics interpretation', 'Growth learning memos'],
    outputs: ['Growth hypothesis', 'SEO opportunity map', 'Experiment plan', 'Funnel brief', 'KPI learning memo'],
    capabilities: ['market research', 'SEO', 'analytics', 'experimentation', 'content strategy', 'funnel analysis'],
    tools: ['Search/SEO data', 'Analytics', 'CMS', 'Campaign tools', 'Research and content systems'],
    handoffs: ['Yara Halo for qualified demand', 'Amara Prism for experience changes', 'Lumina for evidence-heavy research'],
    limits: ['No fake engagement', 'No spam or policy-violating outreach', 'No fabricated performance claims', 'Experiments require defined success and stop conditions'],
    workflow: [
      { title: 'Observe', body: 'Find a measurable growth problem or opportunity.' },
      { title: 'Hypothesise', body: 'State what should change and why.' },
      { title: 'Experiment', body: 'Run a bounded test with clear measurement.' },
      { title: 'Learn', body: 'Record what worked, what failed and what changes next.' },
    ],
  },
  {
    slug: 'mikhail-sentinel',
    name: 'Mikhail Sentinel',
    shortRole: 'Security & Resilience',
    role: 'Chief AI Security & Resilience Director',
    mission: 'Reduce preventable security and resilience risk through authorised assessment, clear evidence, hardening and defensible release gates.',
    responsibilities: ['Threat analysis', 'Vulnerability review', 'Security architecture', 'Hardening recommendations', 'Incident and resilience planning'],
    outputs: ['Threat brief', 'Vulnerability report', 'Hardening plan', 'Security review', 'Incident or recovery recommendation'],
    capabilities: ['security analysis', 'threat modelling', 'authorised scanning', 'hardening', 'resilience planning'],
    tools: ['Security monitoring', 'Vulnerability scanners', 'Code/container security tools', 'Logs and traces', 'Incident systems'],
    handoffs: ['Kai Vector for remediation', 'Leila Orbit for operational response', 'Founder/human security owner for disruptive or sensitive actions'],
    limits: ['Authorised environments only', 'No uncontrolled exploitation', 'No security-disruptive production actions without approval', 'Sensitive findings are access-controlled'],
    workflow: [
      { title: 'Scope', body: 'Confirm authority, environment and acceptable test boundaries.' },
      { title: 'Assess', body: 'Gather evidence using proportionate authorised methods.' },
      { title: 'Prioritise', body: 'Rank findings by exploitability, impact and business context.' },
      { title: 'Verify', body: 'Confirm remediation and residual risk before closure.' },
    ],
  },
  {
    slug: 'esme-echo',
    name: 'Esme Echo',
    shortRole: 'Customer Success',
    role: 'AI Customer Success & Relationship Lead',
    mission: 'Protect long-term client value through adoption, satisfaction, health monitoring, continuity, risk detection and useful expansion signals.',
    responsibilities: ['Adoption and health monitoring', 'Customer-success cadence', 'Risk and churn signals', 'Support routing', 'Expansion context'],
    outputs: ['Health score', 'Success review', 'Risk alert', 'QBR brief', 'Expansion signal'],
    capabilities: ['customer analysis', 'support routing', 'relationship continuity', 'health scoring', 'summarisation'],
    tools: ['CRM', 'Support/ticket systems', 'Product usage data where authorised', 'Project history', 'Knowledge service'],
    handoffs: ['Yara Halo for commercial expansion', 'Leila Orbit for delivery concerns', 'Mei Nova for front-door support routing'],
    limits: ['No inventing satisfaction or health data', 'No unnecessary personal profiling', 'No contractual concessions without approval', 'Escalate unresolved harm or service failures'],
    workflow: [
      { title: 'Monitor', body: 'Review agreed success criteria and permitted usage/service evidence.' },
      { title: 'Detect', body: 'Surface adoption gaps, risks and unresolved friction.' },
      { title: 'Coordinate', body: 'Route corrective actions with context.' },
      { title: 'Learn', body: 'Convert verified lessons into approved customer-success knowledge.' },
    ],
  },
  {
    slug: 'lumina',
    name: 'Lumina',
    shortRole: 'Research Intelligence',
    role: 'AI Research & Intelligence Analyst',
    mission: 'Build evidence before recommendation: gather sources, score confidence, surface contradictions and promote only reviewed knowledge into Afluma’s shared truth layer.',
    responsibilities: ['Research dossiers', 'Evidence matrices', 'Source confidence', 'Contradiction detection', 'Knowledge promotion support'],
    outputs: ['Research dossier', 'Evidence matrix', 'Source-confidence record', 'Conflict note', 'Knowledge-promotion recommendation'],
    capabilities: ['web research', 'document analysis', 'source evaluation', 'synthesis', 'contradiction analysis', 'knowledge curation'],
    tools: ['Approved web/search tools', 'Knowledge store', 'Document systems', 'Research registers', 'Evidence graph'],
    handoffs: ['Every specialist agent', 'Aether Rahm for strategic synthesis', 'Founder for material external claims'],
    limits: ['No presenting uncertain material as fact', 'No source laundering', 'No automatic promotion of raw research into organisational truth', 'Conflicts and uncertainty stay visible'],
    workflow: [
      { title: 'Question', body: 'Define the decision the research must support.' },
      { title: 'Gather', body: 'Collect primary and high-quality sources before commentary.' },
      { title: 'Evaluate', body: 'Score relevance, recency, authority and contradictions.' },
      { title: 'Promote carefully', body: 'Separate raw findings from reviewed knowledge and cite evidence lineage.' },
    ],
  },
]

const home: ExpandedPage = {
  slug: 'home',
  eyebrow: 'Afluma / AI company',
  title: 'Intelligence that does the work.',
  accent: 'Human governed. Evidence led.',
  lede: 'Afluma is building a practical operating model for AI-native companies: persistent digital coworkers, one shared operating layer, real products and measurable workflows — with human authority where it matters.',
  primaryCta: { label: 'Explore the system', href: '/platform/' },
  secondaryCta: { label: 'Join the pilot', href: '/contact/' },
  sections: [
    {
      id: 'problem', eyebrow: 'Why Afluma', title: 'AI tools are everywhere. Coherent AI operations are not.', kind: 'cards',
      intro: 'Most teams can already open a chatbot. The harder problem is making specialised intelligence work together with memory, permissions, evidence, tools, cost control and accountable handoffs.',
      cards: [
        { title: 'Context fragments', body: 'Each tool starts from a different slice of the company, forcing people to rebuild context repeatedly.' },
        { title: 'Authority is unclear', body: 'AI can suggest or act without a visible boundary between advice, approval and execution.' },
        { title: 'Tool sprawl grows', body: 'Credentials, APIs and workflow logic leak into individual bots instead of one governed capability layer.' },
        { title: 'Proof gets replaced by theatre', body: 'Friendly personas and impressive demos are easy; measurable operating improvement is harder.' },
      ],
    },
    {
      id: 'intent', eyebrow: 'Start from the outcome', title: 'What are you trying to change?', kind: 'intent', tone: 'soft',
      intro: 'Visitors should not need to understand our architecture before they can find a useful path. Start with the business condition you want to improve.',
    },
    {
      id: 'system', eyebrow: 'How Afluma works', title: 'One governed system. Multiple specialist interfaces.', kind: 'architecture', tone: 'dark',
      intro: 'The digital coworkers are the human-facing role layer. AgenticOS provides shared identity, policy, routing, memory, knowledge, tools, workflows, observability and audit underneath.',
    },
    {
      id: 'workforce', eyebrow: 'Digital workforce', title: 'Ten jobs, not ten mascots.', kind: 'workforce',
      intro: 'Each coworker has a profession, mission, capability contract, data scope, tool permissions, output requirements, governance limits and handoff behavior.',
    },
    {
      id: 'services', eyebrow: 'What Afluma does', title: 'Research. Architect. Build. Operate.', kind: 'cards', tone: 'soft',
      cards: [
        { title: 'AI business architecture', body: 'Turn unclear business goals into capability maps, operating models, AI strategy, roadmaps and decision records.', href: '/services/' },
        { title: 'Product & software engineering', body: 'Design and build maintainable products, APIs, integrations and digital experiences around the operating problem.', href: '/services/custom-software-development/' },
        { title: 'AI & workflow automation', body: 'Connect decisions, systems and human approval into bounded automations instead of isolated demos.', href: '/services/ai-automation/' },
        { title: 'Managed operating systems', body: 'Design the workflows, dashboards, handoffs and exception paths needed after a system launches.', href: '/services/managed-business-operations/' },
        { title: 'Growth & intelligence', body: 'Combine research, SEO, content, experimentation, analytics and commercial systems into measurable learning loops.', href: '/research/' },
        { title: 'Security & resilience', body: 'Build identity, least privilege, observability, recovery and authorised security review into the operating layer.', href: '/trust/' },
      ],
    },
    {
      id: 'method', eyebrow: 'The Afluma Method', title: 'From discovery to scale without losing the evidence.', kind: 'steps',
      steps: [
        { title: 'Discover', body: 'Understand the problem, user, business and current operating context.' },
        { title: 'Research', body: 'Build evidence before committing to a recommendation.' },
        { title: 'Architect', body: 'Design the business, technology and operating model.' },
        { title: 'Build', body: 'Design, engineer, integrate and test the approved system.' },
        { title: 'Launch', body: 'Pass quality, security and human approval gates.' },
        { title: 'Operate', body: 'Run workflows, support users and surface exceptions.' },
        { title: 'Learn', body: 'Convert measured outcomes and reviewed decisions into reusable knowledge.' },
        { title: 'Scale', body: 'Standardise proven patterns into workflows, components or products.' },
      ],
    },
    {
      id: 'products', eyebrow: 'Products', title: 'Products are where repeated operating knowledge becomes reusable infrastructure.', kind: 'cards', tone: 'purple',
      cards: [
        { title: 'SerenOps', body: 'AI-native infrastructure intelligence and a policy-bound control plane for understanding, operating and maintaining heterogeneous systems.', href: '/products/serenops/', status: 'in-progress' },
        { title: 'Afluma Commerce', body: 'AI-native commerce for stores, ecommerce, inventory and business operations — designed so the workforce can help operate, sell, analyse and improve a real business.', href: '/products/afluma-commerce/', status: 'in-progress' },
        { title: 'AgenticOS-derived modules', body: 'Reusable capability, workflow and governance modules become products only after the operating pattern has been proven repeatedly.', status: 'planned' },
      ],
    },
    {
      id: 'proof', eyebrow: 'Afluma runs on Afluma', title: 'The company itself must become the first serious proof environment.', kind: 'proof', tone: 'dark',
      intro: 'Our CRM, approvals, research, website, delivery, security controls and growth loops should progressively run through the same governed architecture we intend to offer others.',
      cards: [
        { title: 'Agent workflows', body: 'Show real task histories, handoffs and approval checkpoints when production evidence exists.', status: 'in-progress' },
        { title: 'Product interfaces', body: 'Use real SerenOps and Commerce interfaces rather than conceptual dashboards whenever they are available.', status: 'in-progress' },
        { title: 'Measured autonomy', body: 'Track human intervention, task completion, cost, quality and cycle time before making autonomy claims.', status: 'planned' },
        { title: 'Case evidence', body: 'Publish client or venture outcomes only after permission and metric verification.', status: 'evidence-gated' },
      ],
    },
    {
      id: 'research', eyebrow: 'Research', title: 'The long-term moat is governed organisational learning, not a bigger prompt.', kind: 'cards',
      cards: [
        { title: 'Shared organisational cognition', body: 'Study whether specialised coworkers perform better when identity, evidence, memory and policy are shared.' },
        { title: 'Evidence-governed memory', body: 'Separate raw retrieval from reviewed organisational knowledge and preserve evidence lineage.' },
        { title: 'Cost-aware model routing', body: 'Use premium reasoning only where it materially improves outcomes; use smaller models, code or deterministic systems elsewhere.' },
        { title: 'Adaptive systems', body: 'Explore bounded evaluator–optimizer loops that can propose improvements, test them and require controlled promotion or rollback.' },
      ],
    },
    {
      id: 'trust', eyebrow: 'Trust by architecture', title: 'Autonomy without boundaries is not a product feature.', kind: 'cards', tone: 'soft',
      cards: [
        { title: 'Human authority', body: 'Contracts, material money movement, disruptive security actions, sensitive public claims and high-risk production changes remain approval-gated.' },
        { title: 'AI disclosure', body: 'Digital coworkers are clearly disclosed as AI personas. Their identity must never depend on someone believing they are biological employees.' },
        { title: 'Evidence & audit', body: 'Important outputs should preserve sources, confidence, decisions and action history.' },
        { title: 'Privacy & security', body: 'Data minimisation, tenant boundaries, scoped credentials, logging and recovery are design requirements — not footer promises.' },
      ],
    },
    {
      id: 'pilot', eyebrow: 'Join the pilot', title: 'Bring us a real operating problem, not an AI demo request.',
      paragraphs: ['The best early pilots have a measurable workflow, real users, accessible systems and a human owner who can define what success and unacceptable failure look like.', 'We will be explicit about what is implemented, what is experimental, what requires human approval and what evidence is still missing.'],
    },
  ],
}

const company: ExpandedPage = {
  slug: 'company',
  eyebrow: 'Company',
  title: 'A focused AI company built around a different operating model.',
  lede: 'Afluma is not a collection of unrelated AI experiments. The company is being built as one human-governed digital workforce operating through a shared AI system, with services, products, ventures and research reinforcing the same thesis.',
  primaryCta: { label: 'Meet the workforce', href: '/workforce/' },
  secondaryCta: { label: 'See how Afluma works', href: '/platform/' },
  sections: [
    { id: 'thesis', eyebrow: 'What Afluma is', title: 'AI business architecture and technology — from problem to operation.', paragraphs: ['Afluma researches, architects, builds and operates technology-powered businesses. The objective is to own the problem journey from discovery to scale rather than sell disconnected technical tasks.', 'A human founder retains final authority. The digital workforce performs defined roles through AgenticOS, and approved project evidence is converted into reusable organisational knowledge.'] },
    { id: 'why', eyebrow: 'Why this model', title: 'Small human team. Persistent digital capacity. Explicit governance.', kind: 'cards', cards: [
      { title: 'Persistent roles', body: 'Digital coworkers retain stable professions, responsibilities and handoff logic rather than appearing as one anonymous assistant.' },
      { title: 'Shared cognition', body: 'Memory, evidence, policy, tools and workflows are centralised so specialist agents do not duplicate the entire stack.' },
      { title: 'Human governance', body: 'Humans remain accountable for reputation, money, contracts, risk and decisions that should not be delegated.' },
      { title: 'Learning as infrastructure', body: 'Reviewed evidence from delivery becomes reusable knowledge, patterns and eventually product capability.' },
    ] },
    { id: 'governance', eyebrow: 'Founder + AI', title: 'AI accelerates the company. It does not legally own or silently govern it.', tone: 'dark', paragraphs: ['Afluma can truthfully describe AI as a major collaborator in ideation, architecture, coding support, research and business design. It should not claim that an AI system is a legal cofounder or autonomous corporate authority unless that becomes legally and factually true.', 'Contracts, major pricing exceptions, sensitive public communication, high-risk money movement, security-disruptive actions and material production changes escalate to human authority.'] },
    { id: 'flywheel', eyebrow: 'Company architecture', title: 'Services fund learning. Products scale it. Ventures prove it. Knowledge compounds it.', kind: 'cards', cards: [
      { title: 'Afluma Studio / Services', body: 'Premium research, architecture, design, engineering, automation and operating transformation.' },
      { title: 'Afluma Commerce', body: 'An AI-native operating platform for small and growing businesses.', href: '/products/afluma-commerce/' },
      { title: 'SerenOps', body: 'Infrastructure and operations intelligence for technical systems.', href: '/products/serenops/' },
      { title: 'Afluma Ventures', body: 'Controlled proof environments where ideas can be tested against real operational constraints.' },
      { title: 'Research & Knowledge', body: 'A structured evidence layer that supports products, proposals, agents, publications and future learning programs.' },
      { title: 'Academy — later', body: 'Education and certification should follow verified internal knowledge, not precede it.', status: 'planned' },
    ] },
    { id: 'method', eyebrow: 'Operating method', title: 'Discover → Research → Architect → Build → Launch → Operate → Learn → Scale.', kind: 'steps', steps: home.sections.find((s) => s.id === 'method')?.steps },
    { id: 'principles', eyebrow: 'Operating principles', title: 'A few rules protect the whole system.', kind: 'cards', cards: [
      { title: 'Evidence over claims', body: 'A convincing sentence is not a substitute for verified product state, source evidence or measured outcomes.' },
      { title: 'Providers are replaceable', body: 'Personas and capability contracts remain stable while model, cloud and software providers can change behind adapters.' },
      { title: 'If we do it five times, standardise it', body: 'Repeated proven work should become a template, workflow, component, agent capability or product feature.' },
      { title: 'Version material decisions', body: 'Foundational architectural changes require visible decision records; no silent rewrites of core operating rules.' },
    ] },
    { id: 'people', eyebrow: 'People model', title: 'The digital workforce does not eliminate the need for human expertise.', paragraphs: ['Afluma is designed to stay lean, but human engineers, specialists and advisers remain essential where physical-world execution, regulated professional judgment, client trust, throughput, safety or accountability requires them.', 'The goal is not “zero humans.” The goal is to make a small, capable human organisation dramatically more coherent and productive without hiding who or what performed the work.'] },
    { id: 'future', eyebrow: 'Long-term direction', title: 'Prove the internal model first. Productise what survives contact with reality.', paragraphs: ['The central proof is a functioning Afluma company whose digital workforce performs useful recurring work with measurable cost, quality and intervention data.', 'Only after the internal operating model is sufficiently proven should the workforce architecture become a configurable SaaS platform for other organisations.'] },
  ],
}

const services: ExpandedPage = {
  slug: 'services',
  eyebrow: 'Services',
  title: 'Build the operating system around the outcome — not around a list of technologies.',
  lede: 'Afluma combines research, business architecture, product engineering, AI, automation, operations, growth intelligence and security so the handoff between advice and execution does not become another source of friction.',
  primaryCta: { label: 'Start with a business diagnostic', href: '/contact/' },
  secondaryCta: { label: 'Explore products', href: '/products/' },
  sections: [
    { id: 'approach', eyebrow: 'Service thesis', title: 'Do not sell AI. Improve a measurable business condition.', paragraphs: ['A useful engagement starts with the operating problem, current evidence, users, systems, constraints and desired outcome. Technology choices follow from that context.', 'Afluma can begin with a narrow diagnostic, build a business engine around a specific bottleneck, or take on a broader transformation partnership where the evidence supports it.'] },
    { id: 'capabilities', eyebrow: 'Capabilities', title: 'One accountable path across strategy, design, build and operation.', kind: 'cards', cards: [
      { title: 'AI Business Diagnostic', body: 'Review website, sales, operations, data and AI opportunities; return a prioritised evidence-backed action brief.' },
      { title: 'Business & AI Architecture', body: 'Capability maps, operating models, solution blueprints, integration strategy, roadmap and decision records.' },
      { title: 'Custom Software & Product Engineering', body: 'Web applications, internal tools, APIs, portals, workflow systems and production engineering.' },
      { title: 'AI & Automation', body: 'Agent workflows, retrieval, routing, document systems, orchestration and approval-bound automation.' },
      { title: 'Managed Business Operations', body: 'Defined recurring workflows, dashboards, exceptions, service cadence and continuous optimisation.' },
      { title: 'Data, Analytics & Growth Intelligence', body: 'Reporting, SEO, funnels, content systems, experiments and decision support.' },
      { title: 'Security & Resilience', body: 'Identity, secrets, hardening, authorised assessment, monitoring, incident readiness and recovery.' },
      { title: 'Commerce Transformation', body: 'Store, ecommerce, inventory, CRM, payments, operations and AI assistance around a single business model.' },
    ] },
    { id: 'journey', eyebrow: 'Engagement lifecycle', title: 'The work stays connected from discovery to operation.', kind: 'steps', steps: [
      { title: 'Discover & qualify', body: 'Mei and Yara capture the problem, fit and commercial context.' },
      { title: 'Research & architecture', body: 'Lumina and Aether build evidence, options, risks and the target operating model.' },
      { title: 'Experience & engineering', body: 'Amara and Kai design and build the approved system.' },
      { title: 'Security & launch', body: 'Mikhail and Leila coordinate controls, readiness, release and handoff.' },
      { title: 'Operate & learn', body: 'Leila, Esme and Idris measure performance, adoption, risk and growth signals.' },
    ] },
    { id: 'engagements', eyebrow: 'Ways to work together', title: 'Scope the engagement around uncertainty and ownership.', kind: 'cards', tone: 'soft', cards: [
      { title: 'Diagnostic / architecture sprint', body: 'Best when the problem is real but the correct system or priority is not yet clear.' },
      { title: 'Focused implementation', body: 'Best when requirements and acceptance criteria are sufficiently defined for a bounded build.' },
      { title: 'Embedded transformation', body: 'Best for connected product, process and operating change that crosses teams or systems.' },
      { title: 'Managed operating partnership', body: 'Best when the value depends on recurring execution, monitoring, optimisation and continuous learning after launch.' },
    ] },
    { id: 'governance', eyebrow: 'Delivery governance', title: 'Human approval and evidence are part of the service — not a slowdown added later.', tone: 'dark', bullets: ['Defined owners and acceptance criteria', 'Versioned architecture and material decisions', 'Scoped credentials and least privilege', 'Testing and rollback for production changes', 'Evidence-gated public claims and case studies', 'Escalation for contracts, sensitive data, security and unusual commercial commitments'] },
    { id: 'industries', eyebrow: 'Where it fits', title: 'Prioritise operating contexts where change can be measured quickly.', kind: 'cards', cards: [
      { title: 'Retail & ecommerce', body: 'Commerce, inventory, customer operations, content and reporting.' },
      { title: 'Gems & jewellery', body: 'High-consideration sales, product knowledge, concierge journeys, certificates and custom design workflows.' },
      { title: 'Interiors & architecture', body: 'Lead intake, design workflow, quoting, approvals, project delivery and content systems.' },
      { title: 'Professional services', body: 'Research, intake, document workflows, CRM and knowledge-heavy delivery.' },
      { title: 'Operations-heavy SMEs', body: 'Disconnected spreadsheets, handoffs, reporting, inventory, scheduling and exception management.' },
      { title: 'Technical teams', body: 'Infrastructure visibility, deployment, maintenance, security and operational knowledge through SerenOps.' },
    ] },
    { id: 'outcomes', eyebrow: 'What good looks like', title: 'Measure the business condition before claiming transformation.', kind: 'proof', cards: [
      { title: 'Cycle time', body: 'Did the process become faster without increasing failure or rework?' },
      { title: 'Human intervention', body: 'Which tasks can run reliably with less manual coordination, and where is judgment still essential?' },
      { title: 'Quality & exceptions', body: 'Are outcomes more consistent, and are failures visible sooner?' },
      { title: 'Cost & capacity', body: 'Did the system reduce waste or create useful capacity relative to its operating cost?' },
      { title: 'Commercial impact', body: 'Where appropriate, track qualified demand, conversion, retention or operational contribution.' },
    ] },
    { id: 'next', eyebrow: 'Start small', title: 'The first deliverable can simply be clarity.', paragraphs: ['Afluma does not need to begin by rebuilding your company. A narrow evidence-backed diagnostic can identify which workflow deserves investment, which should stay human, which should be automated and which “AI idea” is not worth building.'] },
  ],
}

const workforce: ExpandedPage = {
  slug: 'workforce',
  eyebrow: 'Digital workforce',
  title: 'Personalities on the surface. Capability contracts underneath.',
  lede: 'Afluma’s ten digital coworkers are role-specific AI interfaces to one governed organisational intelligence. They are disclosed as AI, operate inside scoped authority and hand work to one another instead of pretending one general chatbot is an entire company.',
  notice: 'Every coworker shown here is an Afluma AI/digital persona, not a biological employee. Human authority remains responsible for high-impact decisions and approvals.',
  primaryCta: { label: 'Explore AgenticOS', href: '/platform/agenticos/' },
  secondaryCta: { label: 'Join the pilot', href: '/contact/' },
  sections: [
    { id: 'team', eyebrow: 'Meet the workforce', title: 'Ten specialist jobs with explicit responsibility.', kind: 'workforce' },
    { id: 'why-roles', eyebrow: 'Why visible roles', title: 'Specialisation should improve clarity — not disguise infrastructure duplication.', paragraphs: ['A person should know whether they are speaking to sales, research, architecture, engineering or customer success and understand the limits of that role.', 'The specialisation lives primarily in persona, permission, knowledge scope, tools and output contract. Shared memory, policy, routing, audit and integrations remain centralised in AgenticOS.'] },
    { id: 'handoffs', eyebrow: 'Handoff graph', title: 'The product is the handoff as much as the individual agent.', kind: 'steps', steps: [
      { title: 'Mei → Yara / Esme / Aether', body: 'Front-door intent becomes a structured commercial, support or architecture handoff.' },
      { title: 'Yara → Aether / Leila', body: 'Qualified opportunities move into architecture and delivery readiness.' },
      { title: 'Aether → Amara / Kai / Leila', body: 'Approved architecture becomes experience, engineering and operating work.' },
      { title: 'Kai → Mikhail / Leila', body: 'Build output moves through security and release coordination.' },
      { title: 'Leila → Esme / team', body: 'Delivery becomes operating continuity and customer success.' },
      { title: 'Lumina → everyone', body: 'Research evidence is available across roles without becoming unreviewed organisational truth.' },
    ] },
    { id: 'memory', eyebrow: 'Shared cognition', title: 'One memory architecture does not mean one giant prompt.', tone: 'dark', paragraphs: ['AgenticOS should compile only the context needed for the task, combining structured records, retrieved evidence, current workflow state and role permissions.', 'Raw conversation history is not treated as permanent truth. Important facts, decisions and reusable knowledge need evidence, ownership and review before promotion.'] },
    { id: 'authority', eyebrow: 'Authority bands', title: 'Different actions require different levels of human control.', kind: 'cards', cards: [
      { title: 'Assist', body: 'Research, summarise, draft, explain and recommend with visible uncertainty.' },
      { title: 'Prepare', body: 'Create tasks, proposals, code changes or communications for review.' },
      { title: 'Execute within policy', body: 'Perform low-risk, pre-authorised actions through scoped tool adapters and logs.' },
      { title: 'Escalate', body: 'Stop at contracts, high-risk money movement, sensitive claims, disruptive security actions and material production changes.' },
    ] },
    { id: 'limits', eyebrow: 'What they are not', title: 'A digital coworker is not a legal person, professional substitute or source of unquestionable truth.', bullets: ['Not a biological human', 'Not an independent legal decision-maker', 'Not authorised to invent client facts or results', 'Not permitted to bypass scoped credentials or policy gates', 'Not automatically correct because a model sounds confident', 'Not allowed to turn raw research into organisational truth without review'] },
    { id: 'evaluation', eyebrow: 'Evaluation', title: 'A good persona is meaningless if the job output is unreliable.', paragraphs: ['Each role should be evaluated on task quality, evidence use, handoff integrity, policy compliance, cost and human intervention — not on how convincingly it speaks.', 'Where a capability cannot yet meet the required reliability or governance standard, the site should mark it as planned, prototype or human-assisted rather than imply production autonomy.'] },
    { id: 'experience', eyebrow: 'Human experience', title: 'People ask for outcomes. AgenticOS handles the orchestration.', paragraphs: ['A user should be able to say “prepare tomorrow’s board brief” or “tell me why sales is behind target.” The runtime can decompose the request, route research and analysis, retrieve only permitted evidence, surface conflicts, and return one coherent result with pending approvals clearly shown.'] },
  ],
}

const platform: ExpandedPage = {
  slug: 'platform', eyebrow: 'Platform', title: 'AgenticOS is the nervous system behind the workforce.',
  lede: 'Personas and business logic should remain stable while models, APIs, clouds and tools stay replaceable through capability contracts, registries and policy-bound adapters.',
  primaryCta: { label: 'Explore AgenticOS', href: '/platform/agenticos/' }, secondaryCta: { label: 'Meet the workforce', href: '/workforce/' },
  sections: [
    { id: 'architecture', eyebrow: 'Architecture', title: 'From channel to action through one governed control layer.', kind: 'architecture', tone: 'dark' },
    { id: 'runtime', eyebrow: 'Agent runtime', title: 'Identity, context, planning, execution and handoff stay explicit.', paragraphs: ['The runtime resolves who is acting, which tenant and role apply, what context is relevant, what plan is allowed and where the next handoff belongs.', 'The agent should request a stable capability — such as research, scheduling, CRM update or code review — rather than embed direct vendor-specific logic.'] },
    { id: 'intelligence', eyebrow: 'Model router', title: 'Use the right intelligence class for the task, not the most expensive model for everything.', cards: [
      { title: 'Deep reasoning', body: 'Architecture, ambiguous decisions, high-context planning and difficult synthesis.' },
      { title: 'Fast conversational', body: 'Low-latency guidance, routine classification and interactive experiences.' },
      { title: 'Small/open models', body: 'Bounded repetitive tasks where quality can be evaluated economically.' },
      { title: 'Deterministic code', body: 'Rules, calculations, transformations and checks that do not need generative inference at all.' },
    ], kind: 'cards' },
    { id: 'knowledge', eyebrow: 'Knowledge & memory', title: 'Evidence lineage matters more than infinite chat history.', paragraphs: ['Structured records, vector retrieval, files, task state and approved knowledge can all contribute context. Their authority is not equal.', 'Afluma separates source truth, curated intelligence and presentation so a research result does not silently become a permanent business fact.'] },
    { id: 'tools', eyebrow: 'Tool gateway', title: 'Agents act through approved adapters, not hidden credentials.', bullets: ['CRM and lead systems', 'Email, WhatsApp, calendar and voice gateways', 'Website/CMS and social publishing', 'Analytics and business intelligence', 'Project and source-control systems', 'Payments through approved gateways', 'Security and observability tools'] },
    { id: 'workflow', eyebrow: 'Workflow engine', title: 'Long-running work needs state, retries, events and human tasks.', paragraphs: ['Important business processes cannot live entirely inside a single model response. AgenticOS should represent workflow state explicitly so it can pause for approval, retry safely, recover from failure and show what remains pending.'] },
    { id: 'policy', eyebrow: 'Policy & approval', title: 'Permission is part of the architecture.', kind: 'cards', tone: 'soft', cards: [
      { title: 'Identity', body: 'Who or what is acting, for which tenant and role?' },
      { title: 'Capability', body: 'What category of action is being requested?' },
      { title: 'Resource', body: 'Which data, tool, system or environment is in scope?' },
      { title: 'Risk gate', body: 'Can it run, does it need approval, or must it be blocked?' },
    ] },
    { id: 'observability', eyebrow: 'Observability & cost', title: 'If the company cannot explain what happened, it does not have safe autonomy.', paragraphs: ['Task traces, model/provider choice, tool actions, errors, approvals, costs and important evidence should be observable enough to investigate failures and improve the system.', 'Cost governance is a product requirement: model routing, caching, deterministic alternatives and explicit budgets protect both economics and reliability.'] },
  ],
}

const products: ExpandedPage = {
  slug: 'products', eyebrow: 'Products', title: 'Productise the patterns that survive real operations.', lede: 'Afluma products are not separate side projects. They are reusable expressions of the same company thesis: governed AI that can understand and operate real business systems.',
  primaryCta: { label: 'Explore SerenOps', href: '/products/serenops/' }, secondaryCta: { label: 'Explore Commerce', href: '/products/afluma-commerce/' },
  sections: [
    { id: 'portfolio', eyebrow: 'Portfolio', title: 'Two current product proving grounds.', kind: 'cards', cards: [
      { title: 'SerenOps', body: 'AI-native infrastructure and application operations control plane.', href: '/products/serenops/', status: 'in-progress' },
      { title: 'Afluma Commerce', body: 'Unified AI-native commerce and business operations for small and growing businesses.', href: '/products/afluma-commerce/', status: 'in-progress' },
    ] },
    { id: 'why-products', eyebrow: 'Why products', title: 'Repeated work should become reusable capability only after the pattern is proven.', paragraphs: ['Afluma’s operating rule is simple: if a useful workflow repeats enough times and its assumptions are understood, standardise it. That may become a template, component, capability, workflow or product feature.', 'This prevents the product roadmap from being driven only by attractive demos.'] },
    { id: 'foundation', eyebrow: 'Shared foundation', title: 'Products can reuse AgenticOS identity, knowledge, policy, tool and workflow contracts.', kind: 'architecture' },
    { id: 'truth', eyebrow: 'Product truth', title: 'The site must distinguish live capability from roadmap.', kind: 'proof', cards: [
      { title: 'Implemented', body: 'Feature exists in the current build and has been exercised.' , status: 'live'},
      { title: 'In progress', body: 'Actively being built; behavior or UX may still change.', status: 'in-progress' },
      { title: 'Prototype', body: 'Demonstrates a concept but is not production evidence.', status: 'prototype' },
      { title: 'Planned', body: 'Part of an approved direction but not yet implemented.', status: 'planned' },
      { title: 'Evidence-gated', body: 'May exist, but public claims require verified metrics, permission or testing first.', status: 'evidence-gated' },
    ] },
    { id: 'governance', eyebrow: 'Product governance', title: 'The same rules apply when AI moves from internal workflow to customer product.', bullets: ['Tenant isolation', 'Scoped credentials', 'Human approval for high-risk actions', 'Auditability', 'Recovery and rollback', 'Transparent AI identity', 'Privacy and retention controls', 'Evaluation before autonomy'] },
    { id: 'business-model', eyebrow: 'Commercial path', title: 'Products create a subscription path beyond bespoke transformation.', paragraphs: ['Commerce is the pathway for smaller and growing businesses that need an integrated operating system. SerenOps gives technical teams an infrastructure-focused path. Future AgenticOS-derived modules should emerge from proven recurring internal and customer workflows.'] },
    { id: 'pilot', eyebrow: 'Pilot with reality', title: 'The roadmap is shaped by users, not only internal imagination.', paragraphs: ['Design partners should provide real workflows, integrations, failure cases and measurable success criteria. Product claims should be updated from those outcomes rather than prewritten as if every capability already works.'] },
  ],
}

const serenOps: ExpandedPage = {
  slug: 'products/serenops', eyebrow: 'SerenOps', title: 'AI-native infrastructure intelligence with bounded operational control.', lede: 'SerenOps is being built to understand, operate, maintain, secure and adapt heterogeneous application and infrastructure stacks without taking ownership away from human developers.',
  notice: 'SerenOps is in active development. Public capability claims should reflect the tested state of the current product, not the full roadmap.',
  primaryCta: { label: 'Join a SerenOps pilot', href: '/contact/' }, secondaryCta: { label: 'Explore trust model', href: '/trust/' },
  sections: [
    { id: 'problem', eyebrow: 'Problem', title: 'Infrastructure knowledge is fragmented across servers, dashboards, repos, people and incident history.', paragraphs: ['Operations fail when context is missing: what is running, why it exists, what depends on it, who owns it, what changed and how to recover safely. SerenOps aims to turn that scattered context into an inspectable operational model.'] },
    { id: 'control-plane', eyebrow: 'Control plane', title: 'Understand first. Act only inside policy.', kind: 'cards', cards: [
      { title: 'Fleet', body: 'Securely onboard and inventory servers, workloads, services and runtime state.', status: 'in-progress' },
      { title: 'Process Inspector', body: 'Understand running processes and their operational context rather than displaying only raw process lists.', status: 'in-progress' },
      { title: 'Application delivery', body: 'Move toward immutable, testable, reversible release workflows.', status: 'planned' },
      { title: 'Cloud control', body: 'Integrate external control planes through scoped providers and policies.', status: 'planned' },
    ] },
    { id: 'ai-ops', eyebrow: 'AI operations', title: 'Diagnosis is useful only when the evidence and permitted action are visible.', paragraphs: ['The target workflow is monitoring → diagnosis → recommended change → approval where required → test/deploy → verification → rollback if needed.', 'SerenOps should never imply that a language model has unrestricted shell authority.'] },
    { id: 'developer-control', eyebrow: 'Developer relationship', title: 'SerenOps should help maintain systems without fighting the people who build them.', bullets: ['Changes remain inspectable', 'Repositories and CI/CD remain first-class', 'No silent configuration drift', 'Rollback is designed in', 'Developers can retain manual control', 'AI recommendations expose evidence and uncertainty'] },
    { id: 'security', eyebrow: 'Security', title: 'Infrastructure autonomy increases blast radius, so identity and permission get stricter.', bullets: ['Short-lived/scoped credentials where practical', 'Secrets isolation', 'Action logging', 'Approval for disruptive changes', 'Authorised security testing only', 'Backups and restore verification'] },
    { id: 'roadmap', eyebrow: 'Roadmap discipline', title: 'Build and verify one operational module at a time.', paragraphs: ['The authoritative SerenOps roadmap progresses from foundation and secure onboarding through immutable delivery, cloud control, policy-bound AI operations, bounded maintenance, blueprints, fleet operations, knowledge graph, modules/observability, enterprise controls and a 1.0 release.', 'Current product pages must not describe later phases as completed.'] },
    { id: 'proof', eyebrow: 'What must be proven', title: 'A convincing infrastructure copilot needs operational evidence.', kind: 'proof', cards: [
      { title: 'Known-stack diagnosis', body: 'Correctly interpret a real stack and explain the evidence.' },
      { title: 'Approved change', body: 'Prepare or perform a bounded change through the correct workflow.' },
      { title: 'Verification', body: 'Prove the system is healthy after the change.' },
      { title: 'Recovery', body: 'Demonstrate rollback or restore behavior instead of assuming success.' },
    ] },
  ],
}

const commerce: ExpandedPage = {
  slug: 'products/afluma-commerce', eyebrow: 'Afluma Commerce', title: 'An AI-native commerce operating platform — not another disconnected storefront.', lede: 'Afluma Commerce is designed for small, solo and growing businesses that need POS, ecommerce, inventory, customer operations and financial workflows to behave like one system, with AI helping operate rather than merely generating copy.',
  notice: 'Afluma Commerce is in active development. Availability, integrations and automation depth must be presented according to the current tested product state.',
  primaryCta: { label: 'Explore a commerce pilot', href: '/contact/' }, secondaryCta: { label: 'See the Afluma system', href: '/platform/' },
  sections: [
    { id: 'problem', eyebrow: 'Commerce reality', title: 'A sale touches more than a checkout.', paragraphs: ['Products, variants, pricing, stock, tax, customers, payments, fulfilment, returns, accounting and reporting are interconnected. When each lives in a different tool, the merchant becomes the integration layer.'] },
    { id: 'foundation', eyebrow: 'Unified core', title: 'One canonical business record underneath fast merchant workflows.', kind: 'cards', cards: [
      { title: 'Products & variants', body: 'Progressive, category-driven product entry while preserving detailed canonical data.' },
      { title: 'Inventory', body: 'Stock, locations, movements and availability across channels.' },
      { title: 'POS + ecommerce', body: 'Connected selling surfaces rather than separate product realities.' },
      { title: 'Customers & orders', body: 'Consistent customer, transaction, fulfilment and service context.' },
      { title: 'Accounting & payroll', body: 'Business operations can connect to financial records and workforce processes as the product matures.' },
      { title: 'Multilingual', body: 'English, Sinhala, Tamil and Hindi are core regional requirements rather than a late translation layer.' },
    ] },
    { id: 'ai', eyebrow: 'AI-native', title: 'The workforce should help sell, operate, analyse and improve the business.', paragraphs: ['AI assistance should be grounded in the merchant’s actual products, inventory, customers, policies and approved business knowledge.', 'Useful examples include guided product setup, operational summaries, exception detection, content preparation, customer support handoff, reporting and bounded workflow automation.'] },
    { id: 'merchant-ux', eyebrow: 'Merchant experience', title: 'Keep data depth underneath a quick progressive workflow.', paragraphs: ['A merchant should not face one giant form because the data model is detailed. Product kind and category can drive progressive questions while the canonical model retains the information needed for POS, storefront, SEO, inventory and reporting.'] },
    { id: 'regional', eyebrow: 'Sri Lanka / South Asia first', title: 'Local requirements belong in the architecture, not in a market-specific patch.', bullets: ['English, Sinhala, Tamil and Hindi', 'Local payment and banking adapters subject to provider onboarding', 'Regional tax/accounting configuration', 'Mobile-first merchant workflows', 'Service businesses as well as physical products', 'Global-ready tenant and integration architecture'] },
    { id: 'governance', eyebrow: 'AI governance', title: 'The system can assist operations without silently changing money, stock or public claims.', bullets: ['Approval rules for sensitive actions', 'Audit history', 'Role-based access', 'Explicit automation boundaries', 'Verified product data', 'Human escalation for exceptions'] },
    { id: 'proof', eyebrow: 'Commercial proof', title: 'Real merchants are the test.', kind: 'proof', cards: [
      { title: 'Working external product', body: 'Seller onboarding, products/services, orders/payments workflow and AI operational assistance.', status: 'in-progress' },
      { title: 'Paying merchants', body: 'Commercial validation requires real usage, invoices/orders and feedback rather than demo accounts.', status: 'planned' },
      { title: 'Operating impact', body: 'Measure time saved, errors reduced, sales/retention contribution and support burden where the data supports it.', status: 'planned' },
    ] },
  ],
}

const research: ExpandedPage = {
  slug: 'research', eyebrow: 'Research', title: 'Research for organisational intelligence that can survive real work.', lede: 'Afluma’s R&D asks a practical question: how can specialised AI systems share knowledge, adapt and act usefully without losing evidence, cost discipline, permission boundaries or human accountability?',
  primaryCta: { label: 'Explore the workforce', href: '/workforce/' }, secondaryCta: { label: 'Join a research pilot', href: '/contact/' },
  sections: [
    { id: 'agenda', eyebrow: 'Research agenda', title: 'The research layer is a moat, not an excuse to postpone useful products.', paragraphs: ['Developmental cognition, adaptive workflows and organisational memory matter long term, but the current company must first prove useful bounded work with measurable outcomes. Research should improve that system rather than become AGI rhetoric detached from customers.'] },
    { id: 'programs', eyebrow: 'Programs', title: 'Four connected areas of investigation.', kind: 'cards', cards: [
      { title: 'Shared organisational cognition', body: 'How much duplicated context and inconsistent reasoning can be reduced when specialist agents share governed organisational state?' },
      { title: 'Evidence-governed memory', body: 'Can evidence lineage and reviewed promotion improve trust relative to chat-history or vector retrieval alone?' },
      { title: 'Cost-aware intelligence routing', body: 'Can task quality remain competitive while premium models are reserved for tasks that justify them?' },
      { title: 'Bounded adaptation', body: 'Can systems propose, test and compare workflow or prompt improvements while promotion remains gated and reversible?' },
    ] },
    { id: 'hypotheses', eyebrow: 'Hypotheses, not marketing facts', title: 'Afluma records what it believes and then tries to falsify it.', kind: 'cards', cards: [
      { title: 'Shared memory hypothesis', body: 'Shared organisational cognition should reduce duplicated context construction across specialised agents.' },
      { title: 'Evidence hypothesis', body: 'Evidence-governed memory should reduce unsupported business recommendations relative to unreviewed retrieval.' },
      { title: 'Routing hypothesis', body: 'Capability and cost-aware routing should achieve comparable outcomes at lower inference cost than premium-only routing.' },
      { title: 'Persona hypothesis', body: 'Visible role-specific coworkers may improve adoption and mental-model clarity if authority and AI identity are disclosed.' },
    ] },
    { id: 'experiments', eyebrow: 'Experiment registry', title: 'Research becomes credible when the protocol exists before the result.', kind: 'proof', cards: [
      { title: 'Shared Memory Agent Trial', body: 'Compare isolated agents with shared governed context.', status: 'planned' },
      { title: 'Evidence Promotion Test', body: 'Measure unsupported claims and retrieval precision under different memory-promotion rules.', status: 'planned' },
      { title: 'Cost Router Benchmark', body: 'Compare premium-only routing with multi-class routing across a fixed task set.', status: 'planned' },
      { title: 'Digital Coworker Adoption Study', body: 'Test whether users correctly understand persona identity, authority, evidence and approval gates.', status: 'planned' },
    ] },
    { id: 'evidence', eyebrow: 'Evidence standard', title: 'Primary sources first. Confidence and contradictions stay visible.', bullets: ['Separate raw findings from reviewed knowledge', 'Record source and retrieval date', 'Prefer primary/authoritative evidence for material claims', 'Expose contradictory evidence instead of averaging it away', 'State uncertainty where the source base is weak', 'Do not promote research into the truth layer automatically'] },
    { id: 'publication', eyebrow: 'Publications', title: 'Publish useful research notes, not a content farm.', paragraphs: ['The website’s long-term knowledge network can support industry pages, guides, integration documentation, research notes and customer-question pages — but only where each page provides unique, reviewed value.', 'Thin programmatic pages should remain noindex or unpublished until they become genuinely useful.'] },
    { id: 'participate', eyebrow: 'Design partners', title: 'The most valuable research questions come from real operational friction.', paragraphs: ['Pilot organisations can contribute de-identified workflows, evaluation cases and failure modes under agreed data and confidentiality controls. Afluma should publish only what consent, evidence and commercial confidentiality allow.'] },
  ],
}

const proof: ExpandedPage = {
  slug: 'proof', eyebrow: 'Proof', title: 'Evidence before adjectives.', lede: 'Afluma’s proof layer exists to stop the website from outrunning the company. Product state, workflows, screenshots, traces, case outcomes and metrics should be published according to what can actually be demonstrated.',
  primaryCta: { label: 'Afluma Runs on Afluma', href: '/proof/afluma-runs-on-afluma/' }, secondaryCta: { label: 'Join a pilot', href: '/contact/' },
  sections: [
    { id: 'standard', eyebrow: 'Proof standard', title: 'Every claim needs an evidence class.', kind: 'proof', cards: [
      { title: 'Implemented', body: 'The capability exists and can be shown in the current system.', status: 'live' },
      { title: 'In progress', body: 'Engineering exists but the capability is not complete or launch-ready.', status: 'in-progress' },
      { title: 'Prototype', body: 'Useful for concept validation, not production reliability claims.', status: 'prototype' },
      { title: 'Measured', body: 'An outcome has a defined metric, period and source.' },
      { title: 'Evidence-gated', body: 'Public release is blocked until permission, verification or sufficient test evidence exists.', status: 'evidence-gated' },
    ] },
    { id: 'self-proof', eyebrow: 'Internal proof', title: 'Afluma Runs on Afluma.', paragraphs: ['The strongest first demonstration is the company’s own operation: research, approvals, CRM, delivery, website, security and growth workflows progressively run through AgenticOS and the digital workforce.', 'Internal proof should expose real task traces and intervention, not stage a fake autonomous company.'] },
    { id: 'products', eyebrow: 'Product proof', title: 'SerenOps and Commerce are practical proving grounds.', kind: 'cards', cards: [
      { title: 'SerenOps', body: 'Prove diagnosis, approved changes, verification and recovery against known real stacks.', href: '/products/serenops/', status: 'in-progress' },
      { title: 'Afluma Commerce', body: 'Prove external merchant onboarding, transactions, operational assistance and measurable usage.', href: '/products/afluma-commerce/', status: 'in-progress' },
    ] },
    { id: 'ventures', eyebrow: 'Venture proof', title: 'Owned ventures can test the full operating model without manufacturing client stories.', cards: [
      { title: 'Luck Gem', body: 'AI-first jewellery commerce/concierge concept and proof environment. Publish implemented capabilities and measured outcomes only.', status: 'in-progress' },
      { title: 'Future ventures', body: 'Use controlled ventures where the business problem itself is real and operating data can be measured honestly.', status: 'planned' },
    ], kind: 'cards' },
    { id: 'case-studies', eyebrow: 'Case studies', title: 'A case study is not a moodboard.', paragraphs: ['Each public case should identify the starting condition, intervention, systems involved, time period, verified outcome and what Afluma can legitimately attribute to the work.', 'ACM Interiors and other client work should remain evidence-gated until permission and metrics are verified.'] },
    { id: 'metrics', eyebrow: 'Company metrics', title: 'Measure the autonomy thesis itself.', bullets: ['Percentage of eligible tasks completed by AI', 'Human intervention rate', 'Task quality/evaluation score', 'Cycle time', 'Operating cost by capability/model class', 'Failure and rollback rate', 'Evidence completeness', 'Customer or employee outcome where applicable'] },
    { id: 'roadmap', eyebrow: 'Next proof', title: 'The proof page should become more concrete as the system matures.', paragraphs: ['Replace conceptual diagrams with live screenshots, anonymised traces, evaluation summaries and verified metrics as soon as the underlying systems can support them. The website should get more specific over time, not simply more promotional.'] },
  ],
}

const runsOnAfluma: ExpandedPage = {
  slug: 'proof/afluma-runs-on-afluma', eyebrow: 'Proof / Internal operating model', title: 'Afluma should be the first company run through Afluma.', lede: 'This page is a living evidence ledger for how much of Afluma’s own research, sales, delivery, engineering, security, content and customer operations are actually performed through its digital workforce and AgenticOS.',
  notice: 'This is an evidence page. Items remain labelled in progress or planned until real traces, workflows, interfaces and measurements are available.',
  primaryCta: { label: 'See the platform', href: '/platform/' }, secondaryCta: { label: 'Join a pilot', href: '/contact/' },
  sections: [
    { id: 'model', eyebrow: 'Operating model', title: 'Human founder as governor. Digital executives as persistent operating capacity.', paragraphs: ['The goal is not to make every task autonomous. It is to route the right work to the right role, use the right evidence and tools, require approval where needed and retain a record of what happened.'] },
    { id: 'workflows', eyebrow: 'Workflow inventory', title: 'Recurring internal workflows are the first autonomy test.', kind: 'proof', cards: [
      { title: 'Research → knowledge', body: 'Lumina gathers and evaluates evidence; review gates determine what becomes reusable knowledge.', status: 'in-progress' },
      { title: 'Lead → opportunity', body: 'Mei/Yara capture and qualify interest, with structured handoff to architecture and delivery.', status: 'planned' },
      { title: 'Content → approval → publish', body: 'Idris/Amara prepare evidence-led content; human approval remains in the publishing loop until quality and policy are proven.', status: 'in-progress' },
      { title: 'Engineering change', body: 'Kai prepares code changes; tests, security and deployment gates remain explicit.', status: 'in-progress' },
      { title: 'Infrastructure incident', body: 'SerenOps/Mikhail diagnose and recommend; disruptive actions stay approval-bound.', status: 'planned' },
    ] },
    { id: 'command', eyebrow: 'Command & approval', title: 'The human governor needs one place to see decisions, exceptions and risk.', paragraphs: ['The operating model should surface approvals, money/reputation risk, pending decisions, agent outputs and system health instead of hiding them across chat threads.', 'Commander OS is a future first-class control-room experience for this operating model, with local-first data and controlled connectors.'] },
    { id: 'knowledge', eyebrow: 'Company memory', title: 'The same truth layer should support website, sales, products and agents.', paragraphs: ['Afluma’s knowledge graph is intended to separate approved facts, evidence-backed intelligence and presentation content. That allows one reviewed source to support a proposal, web page, agent answer or internal decision without copying contradictions everywhere.'] },
    { id: 'metrics', eyebrow: 'Measurement', title: 'Autonomy is a measured ratio, not a brand adjective.', bullets: ['Eligible tasks', 'AI-completed tasks', 'Human review-only tasks', 'Human takeover/escalation', 'Errors and rework', 'Latency and cycle time', 'Model/tool cost', 'Evidence and policy failures'] },
    { id: 'failures', eyebrow: 'What we publish when it goes wrong', title: 'A credible proof system needs negative evidence too.', paragraphs: ['Failed experiments, blocked automation, model regressions and human takeovers should contribute to the learning record. Afluma should not selectively publish only success paths if the objective is to prove a safe operating model.'] },
    { id: 'commercial', eyebrow: 'From internal proof to SaaS', title: 'Customer-configurable workforce comes after internal operating proof.', paragraphs: ['Tenant isolation, role configuration, permissions, connectors and administrator control must be designed before another business can safely run a customised workforce. Internal proof reduces uncertainty; it does not eliminate customer-specific governance.'] },
  ],
}

const trust: ExpandedPage = {
  slug: 'trust', eyebrow: 'Trust', title: 'Responsible autonomy is an engineering discipline.', lede: 'Afluma’s trust model combines transparent AI identity, human authority, scoped permissions, evidence, privacy, security, evaluation, recovery and honest product-state disclosure.',
  primaryCta: { label: 'Read privacy policy', href: '/privacy/' }, secondaryCta: { label: 'Explore the workforce', href: '/workforce/' },
  sections: [
    { id: 'principles', eyebrow: 'Trust principles', title: 'Govern. Map. Measure. Manage.', paragraphs: ['Afluma’s internal AI risk approach is aligned conceptually with the voluntary NIST AI Risk Management Framework: governance is continuous, context and risk are mapped, behavior is measured and material risks are managed rather than assumed away.', 'This is an operating reference, not a claim of NIST certification.'] },
    { id: 'identity', eyebrow: 'AI transparency', title: 'You should know when you are interacting with AI.', paragraphs: ['Afluma digital coworkers are explicitly labelled as AI/digital personas. Their names, character design and professional roles exist to make responsibilities understandable — not to trick a visitor into believing a synthetic person is a biological employee.', 'This also supports contemporary AI transparency expectations, including jurisdictions where AI-system interaction disclosure is required.'] },
    { id: 'authority', eyebrow: 'Human authority', title: 'Some decisions should remain difficult to automate.', kind: 'cards', cards: [
      { title: 'Contracts & liability', body: 'Material legal commitments and unusual contractual terms escalate to human review.' },
      { title: 'Money', body: 'High-risk payments, banking actions and unusual commercial concessions require explicit authority.' },
      { title: 'Production', body: 'Material changes use tests, approvals, deployment controls and rollback.' },
      { title: 'Security', body: 'Disruptive or sensitive security actions stay within authorised human-controlled boundaries.' },
      { title: 'Public claims', body: 'Sensitive, reputational or evidence-heavy public statements require appropriate review.' },
    ] },
    { id: 'data', eyebrow: 'Privacy & data', title: 'Collect less, isolate more, retain deliberately.', bullets: ['Purpose-limited collection', 'Tenant and role boundaries', 'Minimum necessary context', 'Documented retention rather than indefinite memory', 'Processor/vendor review', 'Cross-border safeguards where required', 'Data-subject request handling where applicable'] },
    { id: 'permissions', eyebrow: 'Tool safety', title: 'No agent receives universal authority by default.', paragraphs: ['Agents request capabilities through a gateway that can apply role, tenant, resource and risk policy. Credentials should be scoped and isolated, with audit records sufficient to investigate material actions.'] },
    { id: 'evidence', eyebrow: 'Evidence', title: 'Confidence, source lineage and conflicts belong in the output.', paragraphs: ['Material research and recommendations should be traceable to evidence. Afluma distinguishes source truth, curated intelligence and presentation so a model-generated sentence cannot silently become company fact.'] },
    { id: 'evaluation', eyebrow: 'Evaluation', title: 'AI quality has to be tested in the context of the job.', bullets: ['Task-specific evaluation', 'Regression tests', 'Policy checks', 'Human intervention tracking', 'Cost/latency measurement', 'Failure and rollback review', 'Monitoring after deployment'] },
    { id: 'security', eyebrow: 'Security & resilience', title: 'Assume systems fail and design the recovery path.', bullets: ['Least privilege', 'Secrets management', 'Monitoring and audit logs', 'Backups and restore tests', 'Dependency and vulnerability review', 'Incident response', 'Rollback and continuity planning'] },
    { id: 'claims', eyebrow: 'Claim discipline', title: 'No invented customers, metrics, certifications or autonomous capabilities.', paragraphs: ['Afluma pages should distinguish implemented, in-progress, prototype, planned and evidence-gated states. Security standards, privacy frameworks and AI governance references are not described as certifications unless independent certification actually exists.'] },
    { id: 'report', eyebrow: 'Questions & concerns', title: 'Trust needs a visible escalation path.', paragraphs: ['Privacy, security, AI-transparency or data-use concerns should be routed through Afluma’s designated contact process and logged for follow-up. Production launch should publish the verified legal-entity and privacy contact details used for these requests.'] },
  ],
}

const contact: ExpandedPage = {
  slug: 'contact', eyebrow: 'Join the pilot', title: 'Bring us a real operating problem.', lede: 'The strongest pilot is narrow enough to measure, important enough to matter and bounded enough that both humans and AI can be held accountable for the result.',
  primaryCta: { label: 'Start the pilot conversation', href: '#pilot-form' }, secondaryCta: { label: 'See proof philosophy', href: '/proof/' },
  sections: [
    { id: 'fit', eyebrow: 'Good pilot fit', title: 'A workflow with real users, real systems and a measurable before/after condition.', kind: 'cards', cards: [
      { title: 'Clear pain', body: 'A recurring bottleneck, information gap, coordination problem or costly manual workflow.' },
      { title: 'Reachable systems', body: 'The necessary data, tools and stakeholders can be accessed with appropriate permission.' },
      { title: 'Human owner', body: 'Someone can define acceptable outcomes, unacceptable failure and approval boundaries.' },
      { title: 'Measurable result', body: 'Time, quality, intervention, cost, conversion, errors or another meaningful metric can be compared.' },
    ] },
    { id: 'not-fit', eyebrow: 'Poor pilot fit', title: 'We should say no to the wrong automation.', bullets: ['A vague desire to “add AI everywhere”', 'A workflow with no owner or acceptance criteria', 'High-risk automation with no human governance', 'Use cases requiring legal or regulated professional judgment without the right professionals', 'Requests based on data or system access the organisation does not have authority to provide'] },
    { id: 'process', eyebrow: 'Pilot process', title: 'A small proof should still have real governance.', kind: 'steps', steps: [
      { title: 'Discovery', body: 'Define the operating condition, users, systems and constraints.' },
      { title: 'Evidence & architecture', body: 'Map the workflow, data, risk, human authority and measurement plan.' },
      { title: 'Bounded build', body: 'Implement the narrowest useful system with tests and observability.' },
      { title: 'Operate', body: 'Run it against real cases with human oversight.' },
      { title: 'Evaluate', body: 'Compare quality, intervention, cost, failure and outcome evidence.' },
      { title: 'Decide', body: 'Scale, revise, keep human, or stop — based on evidence.' },
    ] },
    { id: 'deliverables', eyebrow: 'Typical deliverables', title: 'You should leave with more than a demo.', bullets: ['Current-state workflow map', 'Target architecture', 'Permissions/approval model', 'Working bounded workflow or prototype', 'Evaluation results', 'Risk and limitation register', 'Scale/stop recommendation'] },
    { id: 'data', eyebrow: 'Data & confidentiality', title: 'Share only what the pilot actually needs.', paragraphs: ['Afluma should define what data is required, where it is processed, which providers are involved, who can access it, how long it is retained and what happens at the end of the pilot.', 'Sensitive or regulated data may require additional agreements, technical controls or a decision not to use a particular provider.'] },
    { id: 'commercial', eyebrow: 'Commercial clarity', title: 'Scope, assumptions and approval boundaries are written down before promises become commitments.', paragraphs: ['Normal qualification and proposal preparation can be AI-assisted, but unusual liability, exclusivity, pricing exceptions, payment terms and legal commitments escalate to human authority.'] },
    { id: 'faq', eyebrow: 'Before you contact us', title: 'What to include in your first message.', bullets: ['What process or business condition needs to improve?', 'Who uses it today?', 'What tools or data are involved?', 'What goes wrong now?', 'What would a good result look like?', 'Is there a deadline, compliance constraint or sensitive-data concern?'] },
  ],
}

const privacy: ExpandedPage = {
  slug: 'privacy', eyebrow: 'Legal / Privacy', title: 'Privacy Policy', lede: 'This policy explains how Afluma may process personal data across its website, enquiries, pilots, products and AI-assisted interactions. Actual production configuration and contractual terms take precedence where they provide more specific information.',
  notice: 'Effective: 8 September 2026. Afluma is preparing for applicable obligations under Sri Lanka’s Personal Data Protection Act No. 9 of 2022, as amended. Key provisions identified in the 22 July 2026 commencement order are scheduled to become operational on 1 January 2027. Rights and obligations in other jurisdictions apply only where their legal scope is met.',
  sections: [
    { id: 'scope', eyebrow: '01', title: 'Scope and who is responsible', kind: 'legal', paragraphs: ['This policy applies to Afluma-controlled public websites, project and pilot enquiries, customer communications, Afluma-operated products and AI-assisted experiences unless a more specific product or contractual privacy notice applies.', 'Before public launch, Afluma should publish the verified legal entity/controller identity, registered contact details and any required data-protection contact or representative information. No legal entity address should be invented for presentation purposes.'] },
    { id: 'data', eyebrow: '02', title: 'Information we may process', kind: 'legal', bullets: ['Identity and contact information you provide', 'Professional and company information', 'Enquiry, proposal, pilot and project content', 'Account, product and support information where a product requires it', 'Communications and scheduling information', 'Files or documents you intentionally provide for a defined purpose', 'Technical, security and diagnostic logs', 'Website/device information and consent preferences where configured', 'AI interaction content and the operational records needed to route or audit that interaction'] },
    { id: 'sources', eyebrow: '03', title: 'Where information comes from', kind: 'legal', paragraphs: ['Information may come directly from you, your organisation, systems you authorise Afluma to connect, public or licensed research sources, service providers acting on our behalf, or operational logs generated by Afluma systems.', 'Afluma should not collect personal information merely because it is technically available. Collection should be relevant to a defined service, security, legal or business purpose.'] },
    { id: 'purposes', eyebrow: '04', title: 'Why we process information', kind: 'legal', bullets: ['Respond to enquiries and determine project/pilot fit', 'Provide, secure and support products and services', 'Perform requested research, architecture, engineering or operational work', 'Operate customer-success and business communications', 'Prevent abuse, investigate incidents and maintain system integrity', 'Measure and improve service quality', 'Meet legal, accounting or contractual obligations', 'Send optional marketing or updates where permitted and with the choices required by applicable law'] },
    { id: 'legal-bases', eyebrow: '05', title: 'Legal bases and permission', kind: 'legal', paragraphs: ['Depending on jurisdiction and context, processing may rely on steps requested before entering a contract, performance of a contract, consent, legitimate interests, compliance with legal obligations or another basis permitted by applicable law.', 'Where consent is the basis, withdrawing consent should be as practical as giving it. Withdrawal does not make earlier lawful processing unlawful.'] },
    { id: 'ai', eyebrow: '06', title: 'AI-assisted processing and automated systems', kind: 'legal', paragraphs: ['Afluma uses AI systems to assist with research, routing, drafting, analysis, software work, customer interactions and other defined business functions. Digital coworkers are disclosed as AI personas rather than presented as biological humans.', 'AI output can be wrong. High-impact actions are intended to use appropriate human governance, evidence and tool permissions. If a service introduces solely automated decisions with legal or similarly significant effects, Afluma should provide the additional notice, lawful basis and safeguards required by the applicable jurisdiction before using that process.'] },
    { id: 'providers', eyebrow: '07', title: 'Service providers, processors and disclosures', kind: 'legal', paragraphs: ['Afluma may use vetted providers for hosting, communications, AI/model inference, analytics, security, payments, storage, source control, project delivery and other business functions. The exact provider list can change because AgenticOS is designed around provider-independent capability adapters.', 'Providers should receive only the information reasonably required for their function and be subject to appropriate contractual, security and confidentiality controls. Afluma does not describe a disclosure as “never shared” unless that statement has been technically and contractually verified.'] },
    { id: 'transfers', eyebrow: '08', title: 'International processing and transfers', kind: 'legal', paragraphs: ['Cloud, communications and AI providers may process information in more than one country. Where transfer restrictions apply, Afluma should use a lawful transfer mechanism and any supplementary contractual or technical safeguards appropriate to the risk and jurisdiction.', 'Provider location, data residency and transfer configuration should be documented for production services rather than assumed from a vendor’s marketing page.'] },
    { id: 'retention', eyebrow: '09', title: 'Retention and organisational memory', kind: 'legal', paragraphs: ['Afluma aims to retain personal data only for as long as necessary for the purpose collected, applicable legal or accounting requirements, dispute protection, security and legitimate operational needs.', 'AI “memory” is not a justification for indefinite retention. Raw conversations, project records, approved business knowledge, security logs and legal records may require different schedules. Production teams should maintain a documented retention schedule and deletion/archival process.'] },
    { id: 'rights', eyebrow: '10', title: 'Your privacy rights', kind: 'legal', paragraphs: ['Depending on where you live and which law applies, you may have rights to receive information about processing, access personal data, correct inaccurate data, request deletion, restrict or object to processing, obtain portable data, withdraw consent, or complain to a supervisory authority.', 'Where the CCPA applies, California residents may also have rights to know, delete, correct, opt out of covered sale/sharing, limit certain uses of sensitive personal information and receive equal treatment for exercising rights. Afluma should honour legally valid browser opt-out preference signals where required by law and technically relevant to its processing.'] },
    { id: 'requests', eyebrow: '11', title: 'How to make a request', kind: 'legal', paragraphs: ['Privacy requests should be submitted through Afluma’s published privacy/contact channel. Afluma may need to verify identity and authority before disclosing, changing or deleting data.', 'Response periods and appeal rights depend on the applicable law. Afluma should record requests, deadlines, decisions and any lawful refusal reason rather than handling them only through informal email.'] },
    { id: 'cookies', eyebrow: '12', title: 'Cookies and similar technologies', kind: 'legal', paragraphs: ['Afluma may use cookies, local storage, scripts, tags or comparable technologies for essential functionality, security, preferences, analytics or marketing depending on the production configuration.', 'Where consent is required, non-essential technologies should not be activated until valid consent has been obtained. See the Cookie & Similar Technologies Policy for category and preference information.'] },
    { id: 'security', eyebrow: '13', title: 'Security', kind: 'legal', paragraphs: ['Afluma aims to use appropriate technical and organisational measures such as least privilege, access controls, encryption in transit where applicable, secrets management, monitoring, secure development practices, backups and incident handling.', 'No online system is risk-free. Security statements on the website should describe implemented controls accurately and should not imply absolute protection or certification that does not exist.'] },
    { id: 'children', eyebrow: '14', title: 'Children', kind: 'legal', paragraphs: ['Afluma’s business services are not designed for children. If a product or market later targets or is likely to be used by minors, Afluma should implement the age-appropriate notices, consent, risk assessment and design controls required in the relevant jurisdiction before launch.'] },
    { id: 'changes', eyebrow: '15', title: 'Changes and contact', kind: 'legal', paragraphs: ['This policy may change as Afluma’s products, providers and legal obligations evolve. Material changes should receive an updated effective date and, where required, additional notice or consent.', 'Before public launch, replace generic contact routing with the verified legal entity and designated privacy contact details used to receive rights requests and regulatory correspondence.'] },
  ],
}

const terms: ExpandedPage = {
  slug: 'terms', eyebrow: 'Legal / Terms', title: 'Website and Service Terms', lede: 'These terms govern use of Afluma’s public website and general pre-contract experiences. Paid services, pilots and products may be subject to a separate order form, service agreement, product terms or data-processing terms that control if they conflict with these website terms.',
  notice: 'Effective: 8 September 2026. These terms are a production-oriented baseline and must be reviewed against Afluma’s final legal entity, contracting jurisdiction, commercial model and live product functionality before launch.',
  sections: [
    { id: 'acceptance', eyebrow: '01', title: 'Using Afluma services', kind: 'legal', paragraphs: ['By using the public website or voluntarily submitting an enquiry, you agree to comply with these terms and applicable law. If you do not agree, do not use features that require acceptance.', 'A separate signed agreement can add to or override these terms for a specific project, pilot or product.'] },
    { id: 'ai', eyebrow: '02', title: 'AI systems and digital coworkers', kind: 'legal', paragraphs: ['Afluma uses AI systems and disclosed digital personas to assist with conversations, research, drafting, analysis, software work and other functions. Digital coworkers are not biological humans and do not independently hold legal authority for Afluma.', 'AI-generated material may contain errors or omissions. Important decisions should be evaluated against the relevant evidence, agreement, professional advice and human approval required for the context.'] },
    { id: 'not-advice', eyebrow: '03', title: 'No regulated professional advice by default', kind: 'legal', paragraphs: ['Unless a specific written agreement says otherwise and the appropriate qualified professional is engaged, website and AI content is general business/technical information and is not legal, medical, financial, tax or other regulated professional advice.'] },
    { id: 'acceptable-use', eyebrow: '04', title: 'Acceptable use', kind: 'legal', bullets: ['Use services only for lawful and authorised purposes', 'Do not attempt unauthorised access, security testing or disruption', 'Do not provide data you lack the right to provide', 'Do not use Afluma systems to deceive, impersonate, harass or violate third-party rights', 'Do not bypass usage, safety, permission or technical controls', 'Do not use automated access in a way that materially degrades the service unless expressly authorised'] },
    { id: 'content', eyebrow: '05', title: 'Your content and instructions', kind: 'legal', paragraphs: ['You remain responsible for the legality, accuracy and authority of content, credentials, instructions and data you provide. You grant Afluma the limited rights necessary to process that material to provide the requested service, subject to applicable privacy and contractual terms.', 'Separate project agreements may include additional confidentiality, intellectual-property, security or data-processing rules.'] },
    { id: 'ip', eyebrow: '06', title: 'Afluma intellectual property', kind: 'legal', paragraphs: ['Afluma’s trademarks, branding, original website content, software, design systems, documentation and proprietary methods remain owned by Afluma or its licensors except where a written agreement transfers specific rights.', 'Open-source and third-party components remain subject to their own licences. Afluma does not claim ownership of third-party rights merely because they appear in an integration or research source.'] },
    { id: 'third-party', eyebrow: '07', title: 'Third-party services', kind: 'legal', paragraphs: ['Afluma may integrate third-party platforms, models, APIs and infrastructure. Their availability, security, terms and behavior are outside Afluma’s complete control.', 'Where a customer directs an integration or maintains its own provider account, responsibility may be divided according to the applicable agreement.'] },
    { id: 'commercial', eyebrow: '08', title: 'Quotes, pilots and payments', kind: 'legal', paragraphs: ['Website descriptions and AI conversations do not create a binding project scope or guaranteed price. A commercial commitment exists only when the required human-approved proposal, order form or agreement is accepted through the agreed process.', 'Payment terms, taxes, refunds, credits, service levels and cancellation rights should be stated in the applicable commercial agreement or product terms.'] },
    { id: 'confidentiality', eyebrow: '09', title: 'Confidentiality', kind: 'legal', paragraphs: ['Do not assume every public website interaction is covered by a bespoke non-disclosure agreement. Where confidential or sensitive project material will be exchanged, the parties should use the appropriate confidentiality and data-processing terms and approved transfer channel.'] },
    { id: 'availability', eyebrow: '10', title: 'Availability and product state', kind: 'legal', paragraphs: ['Afluma is actively developing its platform and products. Features may be marked live, in progress, prototype, planned or evidence-gated. Roadmap material is not a warranty that a feature will be delivered by a particular date.', 'Afluma may change, suspend or discontinue non-contracted public features for security, maintenance, product or legal reasons. Contracted commitments are governed by the relevant agreement.'] },
    { id: 'warranties', eyebrow: '11', title: 'Warranties and reliance', kind: 'legal', paragraphs: ['To the extent permitted by applicable law, public website content is provided without a promise that it is uninterrupted, error-free or suitable for every purpose. Nothing in these terms excludes warranties or rights that cannot legally be excluded.'] },
    { id: 'liability', eyebrow: '12', title: 'Liability', kind: 'legal', paragraphs: ['Any limitation of liability must be interpreted subject to applicable law and any controlling service agreement. These website terms do not attempt to exclude liability that law does not allow to be excluded.', 'Project-specific liability allocation, service levels, indemnities and insurance requirements belong in the relevant signed commercial agreement rather than a generic marketing page.'] },
    { id: 'suspension', eyebrow: '13', title: 'Suspension and enforcement', kind: 'legal', paragraphs: ['Afluma may restrict access to protect users, systems, third parties or legal obligations where there is suspected abuse, security risk or material breach. Where appropriate, Afluma should preserve evidence and provide a reasonable escalation path.'] },
    { id: 'law', eyebrow: '14', title: 'Governing terms and disputes', kind: 'legal', paragraphs: ['The governing law and dispute process for a paid service should be stated in the applicable order form or service agreement. Before public launch, Afluma should insert a verified default governing-law/forum clause for website-only use based on its actual legal entity and contracting strategy rather than inventing a jurisdiction here.'] },
    { id: 'changes', eyebrow: '15', title: 'Changes and contact', kind: 'legal', paragraphs: ['Afluma may update these terms to reflect product, legal or operating changes. Material changes should use a new effective date and any additional acceptance mechanism required for the relevant service.', 'Questions about these terms should use Afluma’s published contact channel until a dedicated legal contact is formally designated.'] },
  ],
}

const cookies: ExpandedPage = {
  slug: 'cookies', eyebrow: 'Legal / Cookies', title: 'Cookie & Similar Technologies Policy', lede: 'This policy explains how Afluma may use cookies, local storage, pixels, scripts, tags and similar storage/access technologies. The live preference centre and policy must match the technologies actually deployed on the production site.',
  notice: 'Effective: 8 September 2026. Non-essential technologies should remain disabled until valid consent where applicable. Essential security or service technologies may operate without optional consent where the applicable law permits an exemption.',
  sections: [
    { id: 'what', eyebrow: '01', title: 'What these technologies are', kind: 'legal', paragraphs: ['Cookies and similar technologies can store information on, or access information from, a browser or device. The same compliance questions can apply to web storage, tracking pixels, scripts, tags, fingerprinting or comparable mechanisms — not only traditional cookie files.'] },
    { id: 'categories', eyebrow: '02', title: 'Categories Afluma may use', kind: 'legal', cards: [
      { title: 'Strictly necessary', body: 'Security, session, load-balancing, fraud prevention or functionality required to provide a service you requested.' },
      { title: 'Preferences', body: 'Remember language, UI or consent choices when the configuration justifies it.' },
      { title: 'Analytics', body: 'Measure how visitors use the site and where journeys fail. Consent requirements vary by jurisdiction and configuration.' },
      { title: 'Marketing', body: 'Advertising, conversion or cross-site measurement technologies. These should not run before the required consent/choice.' },
    ] },
    { id: 'consent', eyebrow: '03', title: 'Consent and choice', kind: 'legal', paragraphs: ['Where prior consent is required, continuing to browse is not treated as sufficient consent. The interface should provide a real choice and should not activate non-essential technologies before the user’s valid action.', 'Users should be able to revisit preferences without hunting through a privacy policy.'] },
    { id: 'inventory', eyebrow: '04', title: 'Production cookie inventory', kind: 'legal', paragraphs: ['Before launch, Afluma should maintain a machine-checked inventory listing each cookie or storage technology, provider, purpose, category, first/third-party status and lifespan. The public policy should be generated or reviewed against that inventory.', 'Generic claims such as “we use only essential cookies” must not remain if analytics, embeds or advertising technologies are later enabled.'] },
    { id: 'third-parties', eyebrow: '05', title: 'Third-party technologies', kind: 'legal', paragraphs: ['Embedded video, analytics, chat, social, advertising, payment or support providers can introduce their own storage/access behavior. Afluma should review those technologies and block optional ones until the required choice is captured.'] },
    { id: 'signals', eyebrow: '06', title: 'Browser signals and regional privacy choices', kind: 'legal', paragraphs: ['Where legally required and technically applicable, Afluma should honour recognised opt-out preference signals such as Global Privacy Control for covered sale/sharing or comparable processing.', 'A browser’s generic “Do Not Track” setting may not have a uniform legal meaning; production behavior should be documented accurately rather than promising unsupported signal handling.'] },
    { id: 'retention', eyebrow: '07', title: 'How long technologies last', kind: 'legal', paragraphs: ['Session technologies expire with the relevant session; persistent technologies may last longer. Production policy should publish real durations from the deployed inventory and keep them proportionate to purpose.'] },
    { id: 'controls', eyebrow: '08', title: 'How to control cookies', kind: 'legal', paragraphs: ['Use Afluma’s privacy-preference control where available. Browsers can also delete or block storage technologies, but blocking strictly necessary storage may break requested functionality.', 'Withdrawing optional consent should be as easy as granting it and should prevent future optional use, subject to technical records needed to remember the choice.'] },
    { id: 'changes', eyebrow: '09', title: 'Policy updates', kind: 'legal', paragraphs: ['This policy should change whenever the live technology inventory changes materially. New analytics, advertising or embedded providers should trigger a consent and privacy review before deployment, not after.'] },
  ],
}

const accessibility: ExpandedPage = {
  slug: 'accessibility', eyebrow: 'Trust / Accessibility', title: 'Accessibility Statement', lede: 'Afluma wants its website and products to be understandable and operable across devices, input methods and assistive technologies. The working engineering target for public web experiences is WCAG 2.2 Level AA where reasonably applicable.',
  notice: 'This statement describes a target and operating process, not a claim that every current route has already passed a full independent WCAG 2.2 AA audit.',
  sections: [
    { id: 'standard', eyebrow: '01', title: 'Our accessibility target', kind: 'legal', paragraphs: ['WCAG 2.2 is the current W3C Recommendation in the WCAG 2 family. Afluma uses it as the primary technical reference for public web accessibility, while also considering applicable local accessibility laws and platform requirements.'] },
    { id: 'design', eyebrow: '02', title: 'Design principles', kind: 'legal', bullets: ['Semantic structure and heading order', 'Keyboard-accessible interactions', 'Visible focus states that are not obscured', 'Sufficient contrast', 'Alternatives for meaningful imagery/media', 'Reduced-motion consideration', 'Readable responsive layouts', 'Touch targets that remain usable on mobile'] },
    { id: 'forms', eyebrow: '03', title: 'Forms and authentication', kind: 'legal', paragraphs: ['Forms should expose programmatic labels, useful errors and clear correction paths. Authentication and repetitive input should avoid unnecessary cognitive or memory barriers where the product design can reasonably prevent them.'] },
    { id: 'ai', eyebrow: '04', title: 'AI and conversational accessibility', kind: 'legal', paragraphs: ['Ask Afluma and other conversational interfaces should not become the only way to access essential information. Important navigation, policy, pricing or support paths should remain available through conventional accessible interfaces.', 'Voice or animated AI experiences should provide equivalent text/control paths where practical.'] },
    { id: 'testing', eyebrow: '05', title: 'Testing', kind: 'legal', bullets: ['Automated accessibility checks', 'Keyboard-only testing', 'Screen-reader spot checks on critical journeys', 'Responsive and zoom testing', 'Focus-order review', 'Contrast and reduced-motion checks', 'Manual review of new custom interactions'] },
    { id: 'limitations', eyebrow: '06', title: 'Known limitations', kind: 'legal', paragraphs: ['Afluma’s current site is being actively rebuilt, so some legacy/source-fidelity pages, third-party embeds or experimental interactions may not yet meet the target consistently. Accessibility issues should be tracked as product defects rather than hidden behind this statement.'] },
    { id: 'feedback', eyebrow: '07', title: 'Accessibility feedback', kind: 'legal', paragraphs: ['If you encounter a barrier, contact Afluma with the page, action you were trying to complete, device/browser and assistive technology if you are comfortable sharing it. Afluma should provide an accessible alternative where practical and use the report to improve the system.'] },
  ],
}

const solutions: ExpandedPage = {
  slug: 'solutions', eyebrow: 'Solutions', title: 'Start with the business condition, then assemble the system.', lede: 'Afluma solution paths orient people by the change they want to create — start, grow, operate smarter or transform with AI — while the underlying capabilities remain reusable.',
  primaryCta: { label: 'Talk to Afluma', href: '/contact/' }, secondaryCta: { label: 'Explore services', href: '/services/' },
  sections: [
    { id: 'paths', eyebrow: 'Four paths', title: 'Choose the problem journey.', kind: 'intent' },
    { id: 'start', eyebrow: 'Start something', title: 'Turn a venture idea into an operating business system.', paragraphs: ['Research the market and customer, shape the offer and business architecture, design the experience, build the product and create the operational workflows that make launch usable.'] },
    { id: 'grow', eyebrow: 'Grow something', title: 'Connect demand, commerce, CRM, content and analytics.', paragraphs: ['Growth should be measured through qualified demand, conversion, retention and useful operating capacity — not only impressions or AI-generated volume.'] },
    { id: 'operate', eyebrow: 'Fix / operate smarter', title: 'Reduce manual coordination and disconnected operational work.', paragraphs: ['Map the process, identify exceptions, connect systems, automate bounded steps and keep human judgment where it creates value or manages risk.'] },
    { id: 'transform', eyebrow: 'AI transformation', title: 'Build an AI operating layer rather than adding isolated copilots.', paragraphs: ['Define roles, evidence, memory, permissions, tool adapters, workflows, evaluation and human authority before scaling agent autonomy.'] },
    { id: 'industries', eyebrow: 'Industry context', title: 'The architecture adapts to the operating reality.', paragraphs: ['The same capability may look very different in a jewellery business, architecture studio, ecommerce operation or infrastructure team. Industry pages should explain those differences instead of repeating generic SEO copy.'] },
    { id: 'evidence', eyebrow: 'Decision rule', title: 'The solution is only as good as the measurable condition it improves.', paragraphs: ['Every engagement should define the baseline, desired outcome, acceptance criteria and evidence needed to decide whether the system should scale, change or stop.'] },
  ],
}

export const corePages: Record<string, ExpandedPage> = {
  home,
  company,
  about: company,
  services,
  solutions,
  workforce,
  platform,
  'platform/agenticos': { ...platform, slug: 'platform/agenticos', eyebrow: 'Platform / AgenticOS', title: 'AgenticOS: provider-independent organisational intelligence.', lede: 'The shared runtime coordinates role identity, context, models, knowledge, memory, tools, workflows, policy, audit and cost so ten visible coworkers do not become ten duplicated technology stacks.' },
  products,
  'products/serenops': serenOps,
  'products/afluma-commerce': commerce,
  research,
  proof,
  'proof/afluma-runs-on-afluma': runsOnAfluma,
  trust,
  'responsible-ai': trust,
  security: { ...trust, slug: 'security', eyebrow: 'Trust / Security', title: 'Security is systemic, not a badge in the footer.', lede: 'Afluma’s security posture spans identity, data, code, infrastructure, providers, agent permissions, monitoring, recovery and authorised incident response.' },
  contact,
  'start-project': contact,
  privacy,
  terms,
  cookies,
  accessibility,
}

export function normaliseExpandedSlug(value: unknown) {
  const raw = String(value || 'home').trim().replace(/^\/+|\/+$/g, '')
  return raw || 'home'
}

export function agentForSlug(slug: string) {
  const normalised = normaliseExpandedSlug(slug)
  const key = normalised.startsWith('workforce/') ? normalised.slice('workforce/'.length) : normalised
  return agents.find((agent) => agent.slug === key)
}

export function pageForSlug(slug: string) {
  const normalised = normaliseExpandedSlug(slug)
  const agent = agentForSlug(normalised)
  if (agent && normalised.startsWith('workforce/')) return agentPage(agent)
  return corePages[normalised]
}

export function agentPage(agent: AgentProfile): ExpandedPage {
  return {
    slug: `workforce/${agent.slug}`,
    eyebrow: `Digital coworker / ${agent.shortRole}`,
    title: agent.name,
    accent: agent.role,
    lede: agent.mission,
    notice: `${agent.name} is an Afluma AI/digital persona, not a biological employee. The role operates through AgenticOS within defined capability, data, tool and human-approval boundaries.`,
    primaryCta: { label: 'Meet the full workforce', href: '/workforce/' },
    secondaryCta: { label: 'Explore AgenticOS', href: '/platform/agenticos/' },
    sections: [
      { id: 'mission', eyebrow: '01 / Mission', title: `What ${agent.name} is responsible for.`, paragraphs: [agent.mission], bullets: agent.responsibilities },
      { id: 'outputs', eyebrow: '02 / Outputs', title: 'The job is defined by useful artifacts, not personality.', bullets: agent.outputs },
      { id: 'capabilities', eyebrow: '03 / Capability contract', title: 'Stable capabilities, replaceable providers.', bullets: agent.capabilities, paragraphs: ['The role asks AgenticOS for capabilities. Model and software providers can change behind approved adapters without rewriting the persona’s core job.'] },
      { id: 'tools', eyebrow: '04 / Tools & data', title: 'Access follows role and task scope.', bullets: agent.tools, paragraphs: ['Data access should follow the minimum context required for the task, tenant and authority band.'] },
      { id: 'workflow', eyebrow: '05 / Workflow', title: 'A typical execution path.', kind: 'steps', steps: agent.workflow },
      { id: 'handoffs', eyebrow: '06 / Handoffs', title: 'Specialists collaborate through structured context.', bullets: agent.handoffs },
      { id: 'limits', eyebrow: '07 / Governance', title: 'What this role must not do.', bullets: agent.limits, tone: 'dark' },
      { id: 'evaluation', eyebrow: '08 / Evaluation', title: 'Performance is measured against the job.', paragraphs: ['Evaluation should cover task quality, evidence use, policy compliance, handoff integrity, latency/cost and human intervention. The persona’s visual or conversational realism is not evidence of job reliability.'] },
    ],
  }
}

export function genericExpandedPage(doc: any): ExpandedPage {
  const title = String(doc?.title || doc?.name || doc?.section || 'Afluma capability')
  const summary = String(doc?.summary || doc?.seo?.description || `Explore how Afluma approaches ${title.toLowerCase()} as part of a connected operating system.`)
  const pageType = String(doc?.pageType || 'capability').replace(/-/g, ' ')
  const slug = normaliseExpandedSlug(doc?.slug || title.toLowerCase().replace(/[^a-z0-9]+/g, '-'))
  return {
    slug,
    eyebrow: `Afluma / ${pageType}`,
    title,
    lede: summary,
    primaryCta: { label: 'Talk to Afluma', href: '/contact/' },
    secondaryCta: { label: 'Explore the platform', href: '/platform/' },
    sections: [
      { id: 'overview', eyebrow: 'Overview', title: 'Start with the operating context.', paragraphs: [summary, 'Afluma avoids treating a technology label as the solution. The useful starting point is the current workflow, users, evidence, systems, constraints and measurable outcome.'] },
      { id: 'problem', eyebrow: 'The problem', title: 'Define what needs to change before choosing the stack.', kind: 'cards', cards: [
        { title: 'Current state', body: 'Map how the work happens today, including manual steps and hidden dependencies.' },
        { title: 'Friction', body: 'Identify delays, errors, handoff failures, missing information and avoidable cost.' },
        { title: 'Risk', body: 'Make privacy, security, regulatory and human-judgment constraints explicit.' },
        { title: 'Outcome', body: 'Choose a measurable condition that can prove whether the intervention worked.' },
      ] },
      { id: 'approach', eyebrow: 'Afluma approach', title: 'Research → architect → build → operate.', kind: 'steps', steps: [
        { title: 'Research', body: 'Gather the evidence needed for this specific decision.' },
        { title: 'Architect', body: 'Design the workflow, systems, data, permissions and handoffs.' },
        { title: 'Build', body: 'Implement in inspectable, testable increments.' },
        { title: 'Operate', body: 'Measure outcomes, exceptions and intervention after launch.' },
      ] },
      { id: 'system', eyebrow: 'Connected system', title: 'The surrounding workflow matters as much as the feature.', paragraphs: ['A production solution may connect people, existing software, data, automation, AI, approvals and reporting. Afluma’s job is to keep those pieces coherent rather than deliver a disconnected feature and leave the integration problem behind.'] },
      { id: 'governance', eyebrow: 'Governance', title: 'Permission, evidence and recovery are designed in.', bullets: ['Human approval where risk requires it', 'Scoped data and credentials', 'Testing and acceptance criteria', 'Visible assumptions and evidence', 'Monitoring and error handling', 'Rollback or recovery planning'] },
      { id: 'measurement', eyebrow: 'Measurement', title: 'Do not call it transformation until the condition changed.', bullets: ['Quality', 'Cycle time', 'Human intervention', 'Error/rework rate', 'Operating cost', 'User/customer outcome where relevant'] },
      { id: 'next', eyebrow: 'Next step', title: `Explore ${title} in the context of your real operation.`, paragraphs: ['Bring the current workflow, systems and desired result. Afluma can help decide what should be automated, what should remain human and what evidence is needed before committing to a larger build.'] },
    ],
  }
}

export function shouldUseExpandedPage(slug: string, doc?: any) {
  const normalised = normaliseExpandedSlug(slug)
  if (corePages[normalised]) return true
  if (normalised.startsWith('workforce/') && agentForSlug(normalised)) return true
  const pageType = String(doc?.pageType || '').toLowerCase()
  return ['service', 'solution', 'industry', 'product'].includes(pageType)
}
