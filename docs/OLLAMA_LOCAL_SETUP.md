# Local Ollama development setup

The application talks to Ollama through `http://127.0.0.1:11434` by default.

Suggested first capability bindings are intentionally environment-configured:

- reasoning.business → `AFLUMA_REASONING_MODEL`
- conversation.fast → `AFLUMA_FAST_MODEL`
- knowledge.embed → `AFLUMA_EMBEDDING_MODEL`

Model names are not part of agent identity or business logic.

After Ollama is installed locally, pull only models that fit the development machine. If 8B is too heavy, choose a smaller compatible model and change the environment variable; do not change Mei's code.
