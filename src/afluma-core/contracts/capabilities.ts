export const capabilityIds = [
  'conversation.fast',
  'conversation.realtime',
  'reasoning.general',
  'reasoning.deep',
  'reasoning.business',
  'research.web',
  'knowledge.retrieve',
  'knowledge.embed',
  'crm.read',
  'crm.write',
  'sales.discovery',
  'proposal.draft',
  'schedule',
  'voice.stt',
  'voice.tts',
  'design.review',
  'code.advanced',
  'workflow.manage',
  'analytics.read',
  'security.assess',
  'customer.health',
] as const

export type CapabilityId = (typeof capabilityIds)[number]

export type CapabilityRequest<TInput = unknown> = {
  capability: CapabilityId
  agentId: string
  tenantId?: string
  input: TInput
  correlationId: string
  approvalContext?: {
    requestedBy?: string
    approvalLevel?: 0 | 1 | 2 | 3 | 4
  }
}
