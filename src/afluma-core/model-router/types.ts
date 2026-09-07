import type { CapabilityId } from '../contracts/capabilities'

export type ModelMessage = {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export type StructuredModelRequest = {
  capability: CapabilityId
  messages: ModelMessage[]
  schema?: Record<string, unknown>
  temperature?: number
}

export type StructuredModelResponse<T = unknown> = {
  provider: string
  model: string
  output: T
  rawText: string
  durationMs: number
}

export interface ModelProvider {
  readonly id: string
  supports(capability: CapabilityId): boolean
  run<T = unknown>(request: StructuredModelRequest): Promise<StructuredModelResponse<T>>
}
