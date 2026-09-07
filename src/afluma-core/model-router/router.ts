import type { CapabilityId } from '../contracts/capabilities'
import type {
  ModelProvider,
  StructuredModelRequest,
  StructuredModelResponse,
} from './types'

export class ModelRouter {
  constructor(private readonly providers: readonly ModelProvider[]) {}

  async run<T = unknown>(
    request: StructuredModelRequest,
  ): Promise<StructuredModelResponse<T>> {
    const candidates = this.providers.filter((provider) =>
      provider.supports(request.capability),
    )

    if (!candidates.length) {
      throw new Error(
        `No model provider is configured for capability ${request.capability}`,
      )
    }

    const failures: string[] = []

    for (const provider of candidates) {
      try {
        return await provider.run<T>(request)
      } catch (error) {
        failures.push(
          `${provider.id}: ${
            error instanceof Error ? error.message : 'unknown failure'
          }`,
        )
      }
    }

    throw new Error(
      `All providers failed for ${request.capability}: ${failures.join(' | ')}`,
    )
  }

  canResolve(capability: CapabilityId) {
    return this.providers.some((provider) => provider.supports(capability))
  }
}
