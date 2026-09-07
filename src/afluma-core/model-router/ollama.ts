import type { CapabilityId } from '../contracts/capabilities'
import type {
  ModelProvider,
  StructuredModelRequest,
  StructuredModelResponse,
} from './types'

export type OllamaProviderOptions = {
  enabled?: boolean
  baseUrl?: string
  modelByCapability: Partial<Record<CapabilityId, string>>
}

function assertAllowedBaseUrl(baseUrl: string) {
  const url = new URL(baseUrl)
  const hostname = url.hostname.toLowerCase()

  const localHosts = new Set([
    '127.0.0.1',
    'localhost',
    '::1',
    '[::1]',
  ])

  const remoteAllowed =
    process.env.AFLUMA_ALLOW_REMOTE_MODEL_PROVIDER === 'true'

  if (!localHosts.has(hostname) && !remoteAllowed) {
    throw new Error(
      'Remote model providers are disabled in development. ' +
        'Set AFLUMA_ALLOW_REMOTE_MODEL_PROVIDER=true only after reviewing the endpoint.',
    )
  }
}

export class OllamaProvider implements ModelProvider {
  readonly id = 'ollama.local'
  private readonly enabled: boolean
  private readonly baseUrl: string
  private readonly modelByCapability: Partial<Record<CapabilityId, string>>

  constructor(options: OllamaProviderOptions) {
    this.enabled = options.enabled ?? false
    this.baseUrl =
      options.baseUrl ??
      process.env.OLLAMA_BASE_URL ??
      'http://127.0.0.1:11434'
    this.modelByCapability = options.modelByCapability

    if (this.enabled) {
      assertAllowedBaseUrl(this.baseUrl)
    }
  }

  supports(capability: CapabilityId): boolean {
    return this.enabled && Boolean(this.modelByCapability[capability])
  }

  async run<T = unknown>(
    request: StructuredModelRequest,
  ): Promise<StructuredModelResponse<T>> {
    const model = this.modelByCapability[request.capability]

    if (!model) {
      throw new Error(`No Ollama model configured for ${request.capability}`)
    }

    const started = Date.now()
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 45_000)

    try {
      const response = await fetch(`${this.baseUrl}/api/chat`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          model,
          stream: false,
          messages: request.messages,
          ...(request.schema
            ? { format: request.schema }
            : { format: 'json' }),
          options:
            typeof request.temperature === 'number'
              ? { temperature: request.temperature }
              : undefined,
        }),
      })

      if (!response.ok) {
        throw new Error(
          `Ollama returned ${response.status}: ${await response.text()}`,
        )
      }

      const body = (await response.json()) as {
        message?: { content?: string }
      }

      const rawText = body.message?.content ?? ''

      let output: T
      try {
        output = JSON.parse(rawText) as T
      } catch {
        throw new Error('Ollama returned invalid JSON for a structured request')
      }

      return {
        provider: this.id,
        model,
        output,
        rawText,
        durationMs: Date.now() - started,
      }
    } finally {
      clearTimeout(timeout)
    }
  }
}
