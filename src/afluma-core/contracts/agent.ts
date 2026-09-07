import type { CapabilityId } from './capabilities'

export type AgentAuthority = 0 | 1 | 2 | 3 | 4

export type AgentDefinition = {
  id: string
  name: string
  role: string
  mission: string
  defaultAuthority: AgentAuthority
  capabilities: readonly CapabilityId[]
  canWriteLongTermMemory: boolean
  publicPersona: boolean
  disclosure: string
  escalationAgentIds: readonly string[]
}
