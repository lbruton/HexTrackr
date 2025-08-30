# ADR-0003: Claude Embeddings Strategy (rMemory-Inspired)

**Date:** 2025-08-29  
**Status:** Proposed  
**Context:** Memento MCP embedding provider optimization for AI-to-AI memory communication

## Summary

Implement Claude API embeddings for memento-mcp to achieve superior AI-to-AI semantic alignment, inspired by the rMemory project's advanced memory management architecture.

## Background

### Current State

- Memento MCP configured for OpenAI text-embedding-3-small (1536 dimensions)
- OpenAI API authentication issues preventing embedding generation
- Zero entities have embeddings despite configuration showing "openai_api_key_present: true"

### rMemory Project Insights

- **Discovered Architecture**: `Lonnie-Bruton/rEngine` contains sophisticated rMemory system
- **Key Components**:
  - `protocol_memory.json` (27 operational protocols)
  - `search-matrix/` with context matrices (2.1MB consolidated-matrix.json)
  - `rAgentMemories/` for agent-specific memory persistence
  - Dual-memory architecture: MCP + local JSON fallbacks

### Strategic Advantage: Claude Embeddings

- **AI-to-AI Semantic Coherence**: Claude assistant retrieving from Claude-generated embeddings
- **Same-Model Understanding**: Consistent semantic interpretation between embedding creator and consumer
- **Immediate Access**: User has Claude API configured and available

## Decision

**Primary Strategy**: Implement Claude API embedding provider for memento-mcp

**Inspiration from rMemory**: Apply proven memory architecture patterns:

1. **Dual-Backend Design** (like rMemory's MCP + JSON)
2. **Search Matrix Generation** (like rMemory's consolidated-matrix.json)
3. **Protocol-Based Operations** (like rMemory's 27 numbered protocols)
4. **Modular Memory Components** (like rMemory's agent-specific folders)

## Implementation Plan

### Phase 1: Claude Integration (Immediate)

```bash

# Modify memento-mcp configuration

# Add Claude provider support

# Test embedding generation with Claude API

```

### Phase 2: rMemory Pattern Application

- **Search Matrix Generation**: Claude analyzes memory and generates semantic matrices
- **Protocol-Based Memory Management**: Numbered protocols for memory operations  
- **Dual-Backend Architecture**: Maintain JSON fallbacks like rMemory
- **Agent-Specific Memory**: Separate memory namespaces per project

### Phase 3: Future Local LLM Support

- **Ollama Integration**: Extend architecture for local embeddings
- **Provider Abstraction**: Pluggable embedding providers (Claude → Ollama → Others)
- **Performance Optimization**: Local processing for privacy/speed
- **rMemory Compatibility**: Bridge with existing rEngine ecosystem

## Technical Architecture

### Claude Embedding Provider

```javascript
// memento-mcp modification concept
const embeddingProviders = {
  claude: {
    endpoint: 'https://api.anthropic.com/v1/embeddings',
    model: 'claude-3-embedding', // Future model
    dimensions: 1536, // Or Claude's native dimension
    apiKey: process.env.ANTHROPIC_API_KEY
  },
  openai: { /* existing config */ },
  ollama: { /* future local provider */ }
}
```

### rMemory-Inspired Memory Structure

```
HexTrackr/
├── memento-memory/
│   ├── search-matrix/          # Claude-generated semantic matrices
│   │   ├── consolidated-matrix.json
│   │   └── context-matrix.json
│   ├── agent-memories/         # Project-specific memories
│   │   └── hextrackr/
│   ├── protocol-memory.json    # Numbered memory protocols
│   └── embedding-config.json   # Provider configurations
```

## Benefits

### Immediate Benefits

1. **Working Embeddings**: Claude API resolves current OpenAI authentication issues
2. **Semantic Alignment**: Same-model coherence between embedding and retrieval
3. **Proven Patterns**: rMemory architecture battle-tested in rEngine project

### Strategic Benefits

1. **AI-to-AI Optimization**: Superior memory communication for Claude assistant
2. **Modular Design**: Easy provider switching (Claude → Ollama → Others)
3. **rMemory Compatibility**: Potential integration with existing rEngine ecosystem
4. **Future-Proof**: Architecture supports local LLM expansion

## Risks and Mitigations

### Risks

- **Claude API Costs**: Embedding generation pricing
- **Development Time**: memento-mcp modification complexity
- **Breaking Changes**: Potential compatibility issues

### Mitigations

- **Cost Management**: Batch processing, smart caching
- **Incremental Development**: Maintain OpenAI fallback during transition
- **Testing Strategy**: Comprehensive compatibility testing

## Documentation Requirements

### ADRs to Create

- ADR-0004: rMemory Architecture Integration
- ADR-0005: Local LLM Embedding Strategy (Future)

### Documentation Updates

- `docs-source/development/memory-system.md`: rMemory pattern documentation
- `scripts/memento-claude-integration.md`: Implementation guide
- `README.md`: Updated memory system capabilities

## Success Criteria

### Phase 1 Complete When

- [ ] Claude embeddings generating successfully
- [ ] Semantic search functional with Claude provider
- [ ] Performance benchmarks meet OpenAI baseline

### Full Implementation Complete When

- [ ] rMemory-inspired architecture implemented
- [ ] Search matrix generation working
- [ ] Protocol-based memory management operational
- [ ] Local LLM provider framework ready
- [ ] Documentation complete and accessible

## References

- **rMemory Project**: `Lonnie-Bruton/rEngine/rMemory/`
- **Memento MCP**: Current implementation with Neo4j backend
- **Claude API**: Anthropic's embedding capabilities (future)
- **User Preference**: "1-to-1 language alignment between you and the ai organizing the memories"

---

**Decision Rationale**: Claude embeddings provide optimal AI-to-AI semantic alignment while rMemory patterns offer proven memory management architecture. This combination delivers immediate functionality and strategic long-term benefits.
