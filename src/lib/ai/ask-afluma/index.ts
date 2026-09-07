import {
  groqAskAfluma,
} from './groqProvider'

import type {
  AskAflumaRequest,
  AskAflumaResponse,
} from './types'

export type {
  AskAflumaConfidence,
  AskAflumaLink,
  AskAflumaMessage,
  AskAflumaProvider,
  AskAflumaRequest,
  AskAflumaResponse,
  AskAflumaStatus,
  AskAflumaSuggestedAction,
} from './types'

export async function askAfluma(
  request:
    AskAflumaRequest,
): Promise<AskAflumaResponse> {
  return groqAskAfluma.ask(
    request,
  )
}
export {
  retrieveAflumaKnowledge,
} from './retrieval'

export type {
  AflumaKnowledgeSource,
  AflumaKnowledgeType,
  AflumaRetrievalResult,
} from './retrieval'

export {
  askAflumaFromCMS,
} from './cmsGrounded'

export type {
  AskAflumaCmsRequest,
  AskAflumaCmsResult,
} from './cmsGrounded'
