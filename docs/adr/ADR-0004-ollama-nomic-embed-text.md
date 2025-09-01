# ADR-0004: Using Ollama with nomic-embed-text for PAM Embeddings

## Status

Accepted

## Context

The Persistent AI Memory (PAM) system requires embedding capabilities to perform semantic search across stored memories. Initially, we used OpenAI's embedding model (`text-embedding-3-small`), but this created an external dependency and potential cost implications.

As part of our strategy to reduce external dependencies and enable offline operation, we needed to evaluate local embedding alternatives that could provide similar quality while maintaining performance.

## Decision

We will use **Ollama** with the **nomic-embed-text** model as the primary embedding provider for the PAM system.

To maintain compatibility with existing code that expects an OpenAI-compatible API, we will implement a proxy service that translates between the OpenAI embedding API format and Ollama's API.

## Consequences

### Positive

- **Local Operation**: Embeddings can be generated entirely locally without internet connectivity
- **Cost Elimination**: No usage costs associated with API calls
- **Privacy**: All data remains local without being sent to external services
- **Compatibility**: The proxy approach maintains compatibility with existing code
- **Performance**: nomic-embed-text provides high-quality 768-dimensional embeddings suitable for semantic search

### Negative

- **Resource Usage**: Running Ollama locally consumes system resources
- **Maintenance**: We need to maintain the proxy service and ensure Ollama is properly configured
- **Dimension Mismatch**: OpenAI embeddings are 1536 dimensions while nomic-embed-text produces 768 dimensions, requiring adaptation in some components
- **Startup Dependencies**: PAM tools will be disabled until Ollama and the embedding proxy are running

## Implementation

1. Create an Ollama embedding proxy service that implements the OpenAI embeddings API specification
2. Modify the startup scripts to ensure Ollama and the proxy start automatically
3. Create a LaunchAgent (macOS) or systemd service (Linux) for automatic startup
4. Update documentation to reflect the new embedding approach
5. Implement robust error handling in PAM when the embedding service is unavailable

## Alternatives Considered

### Continue Using OpenAI Embeddings

- **Pros**: Higher dimension (1536), potentially better quality, no local resources needed
- **Cons**: Cost, external dependency, privacy concerns, requires internet

### Use Sentence Transformers Directly

- **Pros**: Direct integration without proxy, many model options
- **Cons**: Requires more complex Python environment, less standardized API

### Use Other Local Embedding Models

- **Pros**: Could explore alternative models with different characteristics
- **Cons**: nomic-embed-text is already high quality and well-optimized for Ollama

## References

- [Nomic AI Embed](https://blog.nomic.ai/posts/nomic-embed-text-v1) - Information about the nomic-embed-text model
- [Ollama](https://ollama.com/) - The local LLM runtime we're using
- [PAM Architecture](../memory-system/pam-ollama-integration.md) - Detailed implementation documentation
