import type { ModelRouter } from '../model-router/router'

export type MeiIntakeInput = {
  name: string
  email: string
  company?: string
  phone?: string
  enquiryType?: string
  message: string
  consent?: boolean
  source?: 'website' | 'email' | 'whatsapp' | 'voice' | 'manual'
}

export type MeiIntakeResult = {
  intent: 'new-business' | 'partnership' | 'support' | 'career' | 'other'
  summary: string
  businessNeed: string
  urgency: 'low' | 'medium' | 'high' | 'unknown'
  recommendedNextAgent: 'agent.yara.halo' | 'agent.esme.echo' | 'human'
  missingInformation: string[]
  safetyFlags: string[]
}

const schema = {
  type: 'object',
  required: [
    'intent',
    'summary',
    'businessNeed',
    'urgency',
    'recommendedNextAgent',
    'missingInformation',
    'safetyFlags',
  ],
  properties: {
    intent: {
      type: 'string',
      enum: ['new-business','partnership','support','career','other'],
    },
    summary: { type: 'string' },
    businessNeed: { type: 'string' },
    urgency: {
      type: 'string',
      enum: ['low','medium','high','unknown'],
    },
    recommendedNextAgent: {
      type: 'string',
      enum: ['agent.yara.halo','agent.esme.echo','human'],
    },
    missingInformation: {
      type: 'array',
      items: { type: 'string' },
    },
    safetyFlags: {
      type: 'array',
      items: { type: 'string' },
    },
  },
} as const

function assertResult(value: unknown): asserts value is MeiIntakeResult {
  if (!value || typeof value !== 'object') {
    throw new Error('Mei intake output is not an object')
  }

  const result = value as Partial<MeiIntakeResult>

  if (
    !schema.properties.intent.enum.includes(result.intent as MeiIntakeResult['intent']) ||
    typeof result.summary !== 'string' || !result.summary.trim() ||
    typeof result.businessNeed !== 'string' || !result.businessNeed.trim() ||
    !schema.properties.urgency.enum.includes(result.urgency as MeiIntakeResult['urgency']) ||
    !schema.properties.recommendedNextAgent.enum.includes(result.recommendedNextAgent as MeiIntakeResult['recommendedNextAgent']) ||
    !Array.isArray(result.missingInformation) ||
    !Array.isArray(result.safetyFlags) ||
    !result.missingInformation.every((item) => typeof item === 'string') ||
    !result.safetyFlags.every((item) => typeof item === 'string')
  ) {
    throw new Error('Mei intake output is missing required fields')
  }
}

export async function analyzeMeiIntake(
  router: ModelRouter,
  input: MeiIntakeInput,
) {
  const response = await router.run<MeiIntakeResult>({
    capability: 'reasoning.business',
    temperature: 0.1,
    schema,
    messages: [
      {
        role: 'system',
        content: [
          'You are Mei Nova, Afluma AI Client Concierge.',
          'Classify and summarize an inbound enquiry for internal routing.',
          'Do not make commercial promises or invent facts.',
          'New-business and partnership opportunities normally route to Yara Halo.',
          'Existing-client support normally routes to Esme Echo.',
          'Career or ambiguous/high-risk requests route to a human.',
          'Return only the requested JSON structure.',
        ].join('\n'),
      },
      {
        role: 'user',
        content: JSON.stringify(input),
      },
    ],
  })

  assertResult(response.output)

  return {
    analysis: response.output,
    provider: response.provider,
    model: response.model,
    durationMs: response.durationMs,
  }
}
