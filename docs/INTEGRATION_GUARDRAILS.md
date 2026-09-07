# Integration guardrails

1. Never modify existing production tables until migrations are reviewed.
2. Preserve the existing `enquiries` collection and map it into CRM.
3. Do not hard-code Ollama model names into agent personas.
4. All model selection is capability-based.
5. All external actions go through a ToolAdapter.
6. Every agent run gets an audit event.
7. Client/tenant IDs must be present before client-specific retrieval.
8. No agent may write long-term memory directly; memory writes require policy checks.
9. No production route for Founder Command Center until authentication is confirmed.
10. No payment, email, WhatsApp, voice or social provider is needed during v0.1 testing.
