# Afluma Core v0.1 implementation plan

## Milestone 0 — Backend source audit

Required source files from the current production repository:

- `package.json`
- `payload.config.ts` or equivalent
- database adapter config
- `src/collections/**`
- `src/globals/**` if present
- `src/lib/content.ts`
- Payload migrations
- current API routes
- auth/user collection
- current enquiries collection
- generated Payload types
- TypeScript config
- Next config

Do not export `.env`, credentials, database dumps, `node_modules`, `.next`, backups or secrets.

## Milestone 1 — Afluma Core database domains

First-wave collections:

### Commercial
- organizations
- contacts
- leads
- opportunities
- interactions

### AgenticOS
- agents
- capabilities
- agent-runs
- approval-requests
- audit-events
- knowledge-documents

Existing `enquiries` should be preserved and connected to lead intake rather than replaced blindly.

## Milestone 2 — Mei v0.1

Input:
- public enquiry
- Ask Afluma chat message
- simulated WhatsApp/email message

Process:
1. Validate input and consent.
2. Find/create contact.
3. Find/create organization if company supplied.
4. Create or update lead.
5. Retrieve approved Afluma knowledge.
6. Ask local model for structured intent + summary.
7. Persist structured summary.
8. Create audit event.
9. Queue Yara handoff.
10. Surface in Founder Command Center.

No outbound external message is required for v0.1; use mock adapters.

## Milestone 3 — Founder Command Center

Initial widgets:
- New enquiries / leads
- Leads awaiting Yara
- Agent runs
- Approval requests
- Recent audit events
- Local AI status

## Milestone 4 — Yara

Add qualification, opportunity state, discovery notes and proposal drafting.

## Milestone 5 — Aether + Leila

Add architecture briefs, founder decision gate and project creation.
