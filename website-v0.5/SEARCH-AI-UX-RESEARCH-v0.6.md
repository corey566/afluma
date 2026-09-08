# Afluma Website v0.6 — Search, AI Discovery, Product & Agent-Friendly UX Research

Prepared: 8 September 2026

This note records the external guidance and internal Afluma documentation used to shape the v0.6 product/search expansion. It is an implementation rationale, not a claim that rankings, rich results or AI citations are guaranteed.

## External guidance applied

### Google Search — generative AI optimization

Primary guidance:
- https://developers.google.com/search/docs/fundamentals/ai-optimization-guide
- https://developers.google.com/search/docs/appearance/ai-features
- https://developers.google.com/search/blog/2026/05/a-new-resource-for-optimizing
- https://developers.google.com/search/blog/2026/06/gen-ai-performance-reports

Implementation consequences:
- Keep foundational SEO as the base for AI Overviews and AI Mode.
- Prefer unique, useful, non-commodity content over scaled query-variant pages.
- Important content must be crawlable, indexable, textual and internally linked.
- AEO/GEO labels do not justify gimmicks such as unnecessary content chunking or mass-created AI text pages.
- Do not treat `llms.txt` or a special AI schema as a Google ranking requirement.
- Structured data must match visible page content.
- Search Console should be used to measure Search and generative-AI visibility once the first-party integration is available again.

### Google — agent-friendly website UX

Primary guidance:
- https://web.dev/articles/ai-agent-site-ux
- https://web.dev/learn/html/semantic-html/

Implementation consequences:
- Prefer real `<button>`, `<a>`, `<details>`, `<summary>`, `<section>`, `<article>` and landmark elements over clickable generic divs.
- Keep layouts stable and avoid invisible/ghost overlays on important controls.
- Preserve useful names, roles and states in the accessibility tree.
- Human accessibility and agent operability are treated as the same design-quality problem, not two separate products.

### OpenAI — ChatGPT search and agent discovery

Primary guidance:
- https://help.openai.com/en/articles/12627856-publishers-and-developers-faq

Implementation consequences:
- Verify that `OAI-SearchBot` is not blocked by robots, CDN or WAF when Afluma wants public pages discoverable in ChatGPT search.
- Track ChatGPT referral traffic through `utm_source=chatgpt.com` when analytics is connected.
- Use descriptive ARIA/semantic structure on interactive journeys so browser agents can interpret controls reliably.
- GPTBot training controls and OAI-SearchBot search discovery are separate concerns and should not be conflated.

### Google structured data

Primary guidance:
- https://developers.google.com/search/docs/appearance/structured-data/software-app
- https://developers.google.com/search/docs/appearance/structured-data/product
- https://developers.google.com/search/docs/appearance

Implementation consequences:
- v0.6 uses truthful SoftwareApplication-style entity descriptions for relevant Afluma platform/product pages.
- It does **not** invent price offers, reviews, ratings, availability or merchant data for products that are not commercially released.
- Therefore the markup must not be described as a guarantee of a Google software-app rich result.
- Product/merchant schema is reserved for pages where the visible product/offer data actually exists and satisfies Google’s requirements.

## Internal Afluma documentation applied

The v0.6 content was checked against the latest available internal material, including:

- Afluma Master Blueprint v2
- Afluma Master Operating Codex v1.0
- Afluma Hub71 Strategic Brief
- Afluma responsive/content production plans and replacement gates
- Source Fidelity architecture and current Next.js/Payload renderer evidence

Key internal rules carried into v0.6:

1. **The website is a guided narrative, not a directory.** Visitors should orient by Start / Grow / Fix / Transform and by operating problem.
2. **The ten digital coworkers are jobs, not mascots.** Each public agent has a profession, outputs, handoffs, capability boundaries and clear AI disclosure.
3. **Meaning → usability → beauty → animation.** Product and AI visuals do not outrank comprehension or accessibility.
4. **The long-term knowledge network is not a programmatic SEO factory.** A route becomes indexable only when it has unique useful intent and reviewed substance.
5. **Roadmap truth is mandatory.** Planned, prototype, in-development and evidence-gated capability must not be described as complete.
6. **Concept UI is labelled.** Product screenshots/concepts are not presented as verified production UI until they are verified.
7. **Research should change the product.** Original experiments in memory, routing, agent coordination, cognition, cost, latency and governance should feed architecture and content only after evidence review.

## Competitive lessons translated into site changes

The competitor review included agent/workforce platforms, enterprise AI suites, regional engineering firms, commerce platforms and infrastructure/operations products. The site does not copy their wording or layouts. Instead, common market patterns were translated into Afluma-specific information architecture:

- workforce/use-case depth rather than one generic AI-agent page;
- explicit enterprise governance and human approval;
- technical AgenticOS architecture around identity, memory, tools, orchestration and audit;
- product-specific problem/use-case pages rather than feature dumps;
- original research and documentation as a future authority moat;
- regional context where it is genuinely different, especially Sri Lanka/South Asia for Commerce and AI implementation.

## v0.6 search authority policy

The 1,669-route architecture remains a knowledge backlog. v0.6 introduces an explicit authority-page index policy for reviewed core pages instead of globally making every route indexable.

Initial authority targets include:
- Home
- Company/About
- Services and selected high-value service families
- Workforce and ten coworker profiles
- Platform / AgenticOS
- Products / Afluma Commerce / SerenOps
- Research
- Proof
- Trust / Security
- selected solution paths

Deep architecture routes continue to rely on their existing CMS/indexability gates until reviewed.

## Product content additions

### Afluma Commerce

Expanded around:
- unified commerce problem definition;
- Sri Lanka-first operating reality;
- offline Store Edge direction;
- English / Sinhala / Tamil / Hindi product requirement;
- progressive merchant product-entry UX;
- canonical product / variant / offer / inventory separation;
- AI as an operating assistant rather than only a copy generator;
- MVP-vs-long-term boundary;
- concept UI and integration evidence gates.

### SerenOps

Expanded around:
- infrastructure state, authority and blast radius;
- secure onboarding and controlled delivery direction;
- Fleet as current first module;
- Process Inspector explicitly unfinished;
- no claim that overall Phase 1 is complete;
- concrete operational questions: what is running, what changed, what is safe, what needs a human;
- technical documentation and evidence standards;
- search/CMS/analytics state as part of the broader infrastructure knowledge graph where the architecture supports it.

### AgenticOS

Expanded around:
- identity and stable role contracts;
- temporary context vs retrieval vs memory vs reviewed organizational knowledge;
- capability/model routing;
- tool gateways and scoped credentials;
- handoffs and long-running workflow state;
- authorization and human approval;
- auditability, recovery, cost and evaluation;
- original research rather than anthropomorphic agent claims.

## Search / AI-discovery service positioning

The SEO & Digital Growth service now positions Afluma around a measurable Search Intelligence loop:

`baseline -> research -> hypothesis -> change -> measure -> learn -> knowledge update`

The content explicitly rejects:
- mass publishing thin AI pages;
- fabricated authority or mentions;
- treating `llms.txt` as a Google ranking shortcut;
- AEO/GEO terminology without technical SEO and useful content underneath it.

The page instead emphasizes:
- crawl/index controls;
- entity clarity;
- original evidence;
- internal linking;
- Search Console and analytics;
- AI-assistant referrals;
- competitor/query research;
- accessible semantic UX.

## Remaining deployment gates

The v0.6 branch is **not yet a verified live deployment**. Before merge/launch, run against the actual Source Fidelity project and require:

1. `npx tsc --noEmit`
2. production build when the local Payload/PostgreSQL environment is ready
3. rendered desktop/mobile visual QA
4. live canonical/robots/indexability inspection
5. sitemap inspection ensuring authority URLs are included and backlog URLs are not accidentally unleashed
6. robots/CDN/WAF verification for Googlebot and OAI-SearchBot
7. structured-data validation against the rendered visible content
8. Core Web Vitals/page-experience testing
9. Search Console and analytics baselines when those integrations are available
10. Semrush competitor/keyword quantification when API units are available

No ranking, indexing, rich-result or AI-citation outcome should be claimed before external systems confirm it.
