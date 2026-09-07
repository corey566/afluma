import type { CapabilityId } from '../contracts/capabilities'
import type {
  ModelProvider,
  StructuredModelRequest,
  StructuredModelResponse,
} from './types'

type IntakeShape = {
  name?: string
  email?: string
  company?: string
  enquiryType?: string
  message?: string
}

function parseInput(request: StructuredModelRequest): IntakeShape {
  const userMessage = [...request.messages]
    .reverse()
    .find((message) => message.role === 'user')

  if (!userMessage) return {}

  try {
    return JSON.parse(userMessage.content) as IntakeShape
  } catch {
    return { message: userMessage.content }
  }
}

function classify(input: IntakeShape) {
  const message = `${input.enquiryType ?? ''} ${input.message ?? ''}`.toLowerCase()

  if (
    input.enquiryType === 'support' ||
    /\b(existing client|support|issue|bug|problem with)\b/.test(message)
  ) {
    return {
      intent: 'support',
      route: 'agent.esme.echo' as const,
    }
  }

  if (
    input.enquiryType === 'career' ||
    /\b(job|career|cv|resume|internship|hiring)\b/.test(message)
  ) {
    return {
      intent: 'career',
      route: 'human' as const,
    }
  }

  if (
    input.enquiryType === 'partnership' ||
    /\b(partner|partnership|collaborat|reseller|affiliate)\b/.test(message)
  ) {
    return {
      intent: 'partnership',
      route: 'agent.yara.halo' as const,
    }
  }

  if (
    input.enquiryType === 'project' ||
    /\b(website|software|automation|ai|crm|seo|marketing|sales|build|develop|design)\b/.test(
      message,
    )
  ) {
    return {
      intent: 'new-business',
      route: 'agent.yara.halo' as const,
    }
  }

  return {
    intent: 'other',
    route: 'human' as const,
  }
}

export class RuleBasedProvider implements ModelProvider {
  readonly id = 'afluma.rules.v0'

  supports(capability: CapabilityId): boolean {
    return capability === 'reasoning.business'
  }

  async run<T = unknown>(
    request: StructuredModelRequest,
  ): Promise<StructuredModelResponse<T>> {
    const started = Date.now()
    const input = parseInput(request)
    const classified = classify(input)

    const message = (input.message ?? '').trim()
    const urgency =
      /\b(urgent|asap|immediately|today|emergency)\b/i.test(message)
        ? 'high'
        : 'unknown'

    const missingInformation: string[] = []
    if (!input.company) missingInformation.push('company')
    if (!message) missingInformation.push('business need / message')

    const result = {
      intent: classified.intent,
      summary:
        message.slice(0, 600) ||
        `Inbound ${input.enquiryType ?? 'general'} enquiry from ${
          input.company ?? input.name ?? 'unknown contact'
        }.`,
      businessNeed:
        message.slice(0, 1000) ||
        `Needs follow-up for ${input.enquiryType ?? 'general enquiry'}.`,
      urgency,
      recommendedNextAgent: classified.route,
      missingInformation,
      safetyFlags: [],
    }

    return {
      provider: this.id,
      model: 'deterministic-intake-v0',
      output: result as T,
      rawText: JSON.stringify(result),
      durationMs: Date.now() - started,
    }
  }
}
