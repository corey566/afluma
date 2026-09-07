export type OllamaEmbeddingOptions = {
  baseUrl?: string
  model?: string
}

export async function embedTexts(input: string[], options: OllamaEmbeddingOptions = {}) {
  const baseUrl = options.baseUrl ?? process.env.OLLAMA_BASE_URL ?? 'http://127.0.0.1:11434'
  const model = options.model ?? process.env.AFLUMA_EMBEDDING_MODEL ?? 'qwen3-embedding:0.6b'
  const response = await fetch(`${baseUrl}/api/embed`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ model, input }),
  })
  if (!response.ok) throw new Error(`Ollama embeddings failed: ${response.status} ${await response.text()}`)
  const body = await response.json() as { embeddings?: number[][] }
  if (!body.embeddings?.length) throw new Error('Ollama returned no embeddings')
  return body.embeddings
}
