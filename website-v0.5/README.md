# Afluma Website v0.5/v0.6 — Content, Product, Search, Interaction & Compliance Expansion

This package targets the current local Source Fidelity application at:

`C:\www\Afluma_Production_Website_v0_4_Source_Fidelity`

The GitHub repository currently contains the older template/source library rather than the complete Next.js/Payload application. For that reason this branch keeps the expansion isolated and provides guarded integration scripts instead of pretending that the current production source already exists in GitHub.

## Core direction

The public site is expanded around one coherent Afluma thesis:

**Afluma is building an AI-native company operating model where a persistent digital workforce works through AgenticOS under human governance. Services create proof and operating knowledge; Afluma Commerce and SerenOps turn repeated operating problems into product IP; research, evidence and real internal use create the long-term authority layer.**

## What v0.5 changes

The v0.5 content/compliance expansion provides 6–10+ meaningful sections for:

- Home
- Company / About
- Services
- Solutions
- Workforce
- All ten digital coworker profiles
- Platform
- AgenticOS
- Products
- SerenOps
- Afluma Commerce
- Research
- Proof
- Afluma Runs on Afluma
- Trust / Responsible AI
- Security
- Join Pilot / Contact
- Privacy Policy
- Terms of Use
- Cookie & Similar Technologies Policy
- Accessibility Statement

Service, solution, industry and product detail routes also receive a richer generated baseline instead of falling back to a very short generic page.

## What v0.6 adds

v0.6 applies current search, AI-discovery, product-positioning and agent-friendly UX research to the highest-value pages.

### Product authority

**Products** now explains how AgenticOS, Afluma Commerce and SerenOps fit the same Afluma operating architecture instead of presenting them as disconnected SaaS ideas.

**Afluma Commerce** is expanded around:
- unified commerce and one operational truth;
- POS, ecommerce, inventory, purchasing, orders, CRM, finance and reporting;
- Sri Lanka-first operating realities;
- offline Store Edge direction;
- English, Sinhala, Tamil and Hindi as core requirements;
- progressive product-entry UX;
- AI as an operating assistant rather than only a copy generator;
- explicit MVP-vs-future and concept-UI evidence boundaries.

**SerenOps** is expanded around:
- infrastructure state, authority and blast radius;
- secure onboarding and controlled delivery;
- concrete operations questions and technical documentation;
- Search/CMS/analytics state within the infrastructure knowledge graph;
- transparent current implementation status: Fleet is the current first module and Process Inspector remains unfinished; overall Phase 1 is not described as complete.

**AgenticOS** is expanded around:
- agent identity and stable role contracts;
- context, retrieval, memory and reviewed knowledge as separate authority levels;
- model/capability routing;
- tool gateways and scoped credentials;
- multi-agent handoffs and long-running workflow state;
- human approval, policy, auditability, recovery, cost and evaluation.

### Search + AI discovery

v0.6 adds:
- an explicit authority-page index policy instead of mass-indexing the 1,669-route architecture;
- stronger titles, descriptions, canonical URLs and search themes for Home, Workforce, AgenticOS, Products, Commerce, SerenOps, AI Automation, SEO & Digital Growth, Research and Trust;
- deeper non-commodity content around AI workforce, agentic AI, agent governance, memory, model routing, AI automation and search intelligence;
- semantic internal links across product, workforce, research, trust, proof and solution pages;
- truthful SoftwareApplication-style structured entity descriptions for relevant platform/product pages without invented ratings, prices or offers;
- a live search-readiness audit for canonical, noindex, sitemap and crawler checks.

The SEO & Digital Growth service now treats search as an evidence loop:

`baseline -> research -> hypothesis -> change -> measure -> learn -> knowledge update`

It does not present AEO/GEO buzzwords, `llms.txt`, mass AI content or keyword variants as substitutes for technical SEO and useful content.

### Agent-friendly UI/UX

The v0.6 authority layer uses semantic HTML such as sections, articles, links, details and summaries so the content is readable through the DOM and accessibility tree as well as visually. The design keeps Afluma's off-white / black / purple visual system, responsive grids, visible focus states and reduced-motion behavior.

The design rule remains:

**meaning -> usability -> beauty -> animation**

## Interaction additions

- Sticky on-page section navigation for long pages
- Interactive Start / Grow / Fix / Transform intent pathfinder
- Selectable ten-person AI workforce explorer
- AgenticOS layer explorer
- Native expand/collapse research/product questions
- Expand/collapse legal and policy sections
- Proof maturity/status language that distinguishes implemented, in-development, research, planned, prototype and evidence-gated claims
- Reusable cards, process steps, governance callouts and conversion panels

## Compliance posture

This content is designed to be **compliance-aware, not compliance-theatre**. It does not claim certifications or legal compliance that have not been independently verified.

Research basis used for the legal revision includes:

- Sri Lanka Data Protection Authority — Personal Data Protection Act No. 9 of 2022, the Personal Data Protection (Amendment) Act No. 22 of 2025, and the 22 July 2026 commencement Gazette. Key provisions referenced by the DPA are scheduled to become operational on 1 January 2027.
- European Commission — EU AI Act Article 50 transparency guidance; relevant transparency obligations apply from 2 August 2026.
- European Commission — GDPR data-subject rights guidance.
- UK Information Commissioner’s Office — 2026 storage/access technology guidance and consent requirements for non-essential technologies.
- California Privacy Protection Agency — CCPA rights and opt-out preference signal / Global Privacy Control guidance, where the law applies.
- W3C — WCAG 2.2 accessibility recommendation.
- NIST AI RMF — voluntary Govern / Map / Measure / Manage risk-management framework.

Search/AI/UX research sources and implementation rationale are recorded in:

`SEARCH-AI-UX-RESEARCH-v0.6.md`

Legal text still needs final review against Afluma’s actual registered legal entity, countries served, deployed analytics/advertising stack, processors/sub-processors, retention schedule, payment flows and contractual model before a public launch.

## Integration

### v0.5 baseline installer

`Apply-Afluma-Content-Expansion-v0.5.ps1`

### v0.6 product/search installer

Use the v0.6 installer for the latest package:

```powershell
powershell -ExecutionPolicy Bypass `
  -File .\website-v0.5\Apply-Afluma-Search-Product-v0.6.ps1 `
  -ProjectRoot "C:\www\Afluma_Production_Website_v0_4_Source_Fidelity"
```

When the local Payload/PostgreSQL environment is ready for the full production build gate:

```powershell
powershell -ExecutionPolicy Bypass `
  -File .\website-v0.5\Apply-Afluma-Search-Product-v0.6.ps1 `
  -ProjectRoot "C:\www\Afluma_Production_Website_v0_4_Source_Fidelity" `
  -RunBuild
```

The installer:
- backs up touched source files;
- refuses unsafe patch anchors;
- installs the expanded content/product/search modules;
- updates the verified catch-all metadata path;
- keeps deep/unreviewed routes behind their existing CMS/indexability gates;
- runs static content gates;
- runs `npx tsc --noEmit` unless explicitly skipped;
- optionally runs the production build;
- rolls back if a required gate fails;
- does not print success after failure.

## Live search-readiness audit

After the app is running locally, execute:

```powershell
powershell -ExecutionPolicy Bypass `
  -File .\website-v0.5\Audit-Afluma-Search-Readiness-v0.6.ps1 `
  -BaseUrl "http://localhost:3000"
```

The audit checks the priority authority pages for HTTP 200, title, canonical, H1 and accidental `noindex`, then checks `robots.txt`, `sitemap.xml`, authority sitemap inclusion and basic OAI-SearchBot blocking signals.

Crawler access at Cloudflare/CDN/WAF level still requires deployment-specific verification.

## Important evidence rule

The new content deliberately avoids invented case-study metrics. `Afluma Runs on Afluma`, SerenOps, Commerce, Luck Gem and other proof pages must label prototypes and in-progress capabilities honestly until screenshots, traces, workflows, users, outcomes or measurements are verified.

## Current verification status

The v0.6 code is committed to the expansion branch, but it has **not yet been executed against the user's actual Source Fidelity project in this environment** because that complete application is not present in the GitHub default branch. Do not treat the branch commit itself as proof that the real application typecheck/build or live crawl gates have passed.
