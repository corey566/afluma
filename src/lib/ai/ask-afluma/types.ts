export type AskAflumaStatus =
  | 'answered'
  | 'insufficient_context'
  | 'handoff'

export type AskAflumaConfidence =
  | 'high'
  | 'medium'
  | 'low'

export type AskAflumaSuggestedAction =
  | 'none'
  | 'explore'
  | 'start_project'
  | 'contact'

export type AskAflumaLink = {
  label: string
  href: string
}

export type AskAflumaMessage = {
  role: 'user' | 'assistant'
  content: string
}

export type AskAflumaRequest = {
  question: string
  context: string
  history?: AskAflumaMessage[]
}

export type AskAflumaResponse = {
  status: AskAflumaStatus
  answer: string
  confidence: AskAflumaConfidence
  sourceIds: string[]
  recommendedLinks: AskAflumaLink[]
  suggestedAction: AskAflumaSuggestedAction
  disclaimer: string | null
}

export type AskAflumaProvider = {
  ask(
    request: AskAflumaRequest,
  ): Promise<AskAflumaResponse>
}