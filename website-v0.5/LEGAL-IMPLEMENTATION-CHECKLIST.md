# Afluma Website v0.5 — Legal, Privacy, AI & Accessibility Implementation Checklist

**Working date:** 8 September 2026

This document is an implementation checklist, not legal advice and not a certification statement. It translates current public regulatory and standards research into concrete engineering/content gates for the Afluma website and AgenticOS-facing experiences.

## 1. Sri Lanka personal-data readiness

Afluma should prepare now for the Sri Lankan Personal Data Protection Act framework rather than wait for enforcement work to become urgent.

### Production gates

- [ ] Confirm the exact Afluma legal entity that acts as controller for the website and each product.
- [ ] Publish verified controller/contact information in the Privacy Policy.
- [ ] Maintain a data inventory: data category, subject, source, purpose, lawful basis/permission, system, processor, location, retention and deletion rule.
- [ ] Document controller/processor responsibilities for hosting, communications, AI/model providers, analytics, payments, support and other vendors.
- [ ] Define a data-subject request workflow with identity verification, case tracking, deadlines, decision records and escalation.
- [ ] Maintain a retention schedule instead of treating AI memory or database storage as indefinite by default.
- [ ] Establish breach/incident triage, evidence preservation, escalation and notification decision procedures.
- [ ] Establish DPIA/risk-assessment criteria for high-risk personal-data processing and AI workflows.
- [ ] Assess whether a DPO or other designated privacy role is required for the actual processing context.
- [ ] Map international/cross-border processing and document the mechanism/safeguards used where required.
- [ ] Review sensitive/special-category data separately and avoid collecting it where the product does not require it.

### Timing note

Sri Lanka’s PDPA was amended in 2025. The Data Protection Authority lists the Personal Data Protection (Amendment) Act No. 22 of 2025 and the Extraordinary Gazette dated 22 July 2026 among the operative legal materials. The current commencement order identifies 1 January 2027 for major provisions including the core processing/controller/processor and related governance framework. The website should therefore say **“PDPA-ready / preparing for applicable obligations”** rather than claim completed statutory compliance unless the production system has been independently reviewed against the law.

## 2. AI transparency and digital coworker identity

Afluma’s public AI-persona disclosure is a product requirement, not a small-print disclaimer.

- [ ] Every digital coworker profile says clearly that the person shown is an **AI/digital persona**.
- [ ] Conversational experiences disclose AI interaction in a clear, timely way.
- [ ] Do not imply that the persona is a biological employee, legal person or independent corporate authority.
- [ ] Separate persona/voice from actual authority, tool access and approval rights.
- [ ] Mark generated or synthetic media where applicable and where law/platform rules require it.
- [ ] Preserve human escalation for contracts, high-risk money movement, sensitive public statements, security-disruptive actions and material production changes.
- [ ] Provide human-accessible routes for important support, privacy and legal matters; do not make AI chat the only route.

### EU AI Act note

European Commission guidance on Article 50 transparency obligations states that the relevant transparency obligations apply from **2 August 2026**. Afluma’s “AI teammate / digital persona” disclosure standard aligns with the direction of those transparency requirements where the EU AI Act applies. This is not a claim that every Afluma deployment falls within EU jurisdiction or that Afluma has received any EU certification.

## 3. AI governance and evaluation

Use NIST AI RMF as a voluntary risk-management reference, not a badge.

- [ ] **Govern:** define owners, policies, roles, escalation and risk appetite.
- [ ] **Map:** identify context, affected people, data, dependencies, failure modes and impact.
- [ ] **Measure:** maintain task evaluations, policy tests, quality metrics, cost/latency and human intervention measures.
- [ ] **Manage:** introduce mitigations, approval gates, rollback, monitoring and stop conditions.
- [ ] Keep evaluation datasets/versioning separate from marketing claims.
- [ ] Do not promote raw research or generated output into organisational truth without evidence/review.
- [ ] Record provider/model changes that could materially change behavior.
- [ ] Test high-impact agent workflows before increasing authority.

## 4. Privacy notice implementation

The public Privacy Policy should be generated/reviewed against actual production processing.

- [ ] Controller/legal entity and privacy contact.
- [ ] Scope of website, enquiries, pilots and products.
- [ ] Personal-data categories.
- [ ] Sources of data.
- [ ] Purposes.
- [ ] Applicable lawful bases/permissions.
- [ ] AI-assisted processing explanation.
- [ ] Automated-decision safeguards where applicable.
- [ ] Processors/service providers and disclosure categories.
- [ ] International transfers/data residency.
- [ ] Retention/deletion.
- [ ] Security description without absolute promises.
- [ ] Individual rights and request process.
- [ ] Children/minors posture.
- [ ] Cookies/storage technologies link.
- [ ] Effective date and material-change process.

## 5. EU/UK-style data-subject rights readiness

Where relevant law applies, operational support should be able to handle rights such as:

- [ ] Information/transparency.
- [ ] Access.
- [ ] Correction/rectification.
- [ ] Deletion/erasure.
- [ ] Restriction.
- [ ] Portability where applicable.
- [ ] Objection.
- [ ] Withdrawal of consent.
- [ ] Complaint/escalation information.

Do not promise a particular statutory response period globally; deadlines vary by applicable law.

## 6. Cookie and similar-technology controls

Treat “cookies” as a broader storage/access technology problem.

- [ ] Run an inventory/scanner against the production site, not only source code.
- [ ] Record name/key, provider, category, purpose, first/third party, lifespan and host/domain.
- [ ] Strictly necessary technologies are separated from optional analytics/marketing/preferences.
- [ ] Where prior consent is required, optional technologies are blocked before consent.
- [ ] “Accept” and “Reject non-essential” are comparably understandable and accessible.
- [ ] Users can reopen preferences later.
- [ ] Withdrawal is as easy as granting optional consent.
- [ ] Consent state is versioned enough to know what the user was shown.
- [ ] Adding analytics, ad pixels, embedded media or chat providers triggers a consent/privacy review.
- [ ] The public Cookie Policy matches the actual production inventory.

### UK ICO note

The ICO’s updated storage/access guidance covers more than conventional cookies and states that, unless an exception applies, consent must meet the UK GDPR standard and be obtained before the technology is used. Do not rely on “continued browsing” as consent where prior consent is legally required.

## 7. California / Global Privacy Control readiness

Only enable California-specific controls where Afluma is within the applicable statutory scope or chooses to offer equivalent rights voluntarily, but design the stack so compliance is feasible.

- [ ] Determine whether the business/product is subject to the CCPA/CPRA.
- [ ] If covered sale/sharing occurs, expose the required opt-out route.
- [ ] If required, recognise valid opt-out preference signals such as Global Privacy Control.
- [ ] Maintain correction/deletion/know/access request handling where applicable.
- [ ] Avoid dark patterns in privacy choices.
- [ ] Do not describe ordinary service-provider processing as “never shared” without reviewing the legal/contractual facts.

## 8. Accessibility — WCAG 2.2 AA target

Afluma’s public engineering target is WCAG 2.2 Level AA where reasonably applicable. This is a target until verified, not an automatic conformance claim.

- [ ] Semantic landmarks and heading order.
- [ ] Keyboard operation for every custom interaction.
- [ ] Visible focus that is not hidden by sticky UI.
- [ ] Sufficient colour contrast.
- [ ] Text alternatives for meaningful images.
- [ ] Captions/transcripts for meaningful prerecorded media where required.
- [ ] Reduced-motion handling.
- [ ] Responsive reflow/zoom testing.
- [ ] Appropriate touch-target sizing.
- [ ] Form labels, instructions and errors.
- [ ] Authentication/repetitive-input review.
- [ ] Screen-reader spot checks on critical journeys.
- [ ] Automated tests plus manual review.
- [ ] Accessibility feedback route and defect tracking.

## 9. Security and operational trust

Website trust copy must reflect controls that really exist.

- [ ] TLS/HTTPS production configuration.
- [ ] Secrets kept out of client code/repository.
- [ ] Least-privilege application/service credentials.
- [ ] Authentication/authorisation review.
- [ ] Dependency and container scanning where applicable.
- [ ] Security logging/alerting.
- [ ] Backup and restore process.
- [ ] Incident response ownership.
- [ ] Rollback for material releases.
- [ ] Abuse/rate-limit protections on AI/contact endpoints.
- [ ] Prompt/tool injection and data-exfiltration controls for agent systems.
- [ ] Tenant isolation tests before multi-tenant customer deployment.

Never use “100% secure”, “unhackable”, “military-grade” or certification language unless the exact statement is independently supportable.

## 10. AI/model provider register

Because AgenticOS is provider-independent, maintain a live register rather than hard-coding legal text around one vendor.

For each production provider record:

- [ ] Provider and service.
- [ ] Capability supplied.
- [ ] Categories of data sent.
- [ ] Whether customer content can be used for provider training and the selected setting/contract.
- [ ] Retention/logging settings.
- [ ] Processing locations/data-residency options.
- [ ] Subprocessor link/register.
- [ ] Security/compliance evidence actually reviewed.
- [ ] Contract/DPA status.
- [ ] Replacement/exit path.

## 11. Marketing, proof and claim review

- [ ] No fabricated customers, testimonials, dashboards or metrics.
- [ ] No case-study outcome without evidence and publication permission.
- [ ] No “autonomous company” claim presented as fully achieved before measured internal workflows support it.
- [ ] Product state is labelled: Implemented / In progress / Prototype / Planned / Evidence gated.
- [ ] No certification, accreditation, partnership or regulatory-approval claim without evidence.
- [ ] Research hypotheses are labelled as hypotheses/experiments, not established facts.
- [ ] AI-generated product imagery is not represented as guaranteed physical/product accuracy where that matters.

## 12. SEO and long-form policy UX

Legal and trust pages should be useful, not merely long.

- [ ] Unique title, description and H1.
- [ ] Visible effective/updated date.
- [ ] On-page table of contents / anchors.
- [ ] Readable line length and heading hierarchy.
- [ ] Self-canonical where indexable.
- [ ] Internal links among Privacy, Terms, Cookies, Accessibility and Trust.
- [ ] Structured data only when it accurately describes the page.
- [ ] Do not index thin/generated pages merely because a route exists.

## 13. Pre-launch legal facts that still need verification

The v0.5 code intentionally does **not** invent these details:

1. Exact registered Afluma legal entity name.
2. Registered/business address used for legal notices.
3. Designated privacy/legal email or other contact method.
4. Contracting jurisdiction and default dispute forum.
5. Exact production hosting regions.
6. Exact AI/model providers in each live workflow.
7. Exact analytics/advertising/cookie technologies.
8. Exact data-retention periods by record category.
9. Exact subprocessor list.
10. Whether any CCPA thresholds or EU/UK representative requirements apply.
11. Whether a DPO is legally required for the actual processing profile.
12. Any sector-specific rules introduced by a specific customer or product deployment.

These items must be verified before changing the v0.5 legal wording from a compliance-aware baseline into a claim of specific legal compliance.
