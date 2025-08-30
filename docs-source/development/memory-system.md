# Memory System (Memento MCP)

This document outlines HexTrackr's persistent memory system using memento-mcp with Neo4j backend for enhanced development workflows and knowledge retention.

## Overview

HexTrackr uses a memory-first development approach with the memento-mcp (Model Context Protocol) server to maintain persistent knowledge across development sessions. This system provides:

- **Persistent Knowledge**: Project context survives VS Code restarts
- **Semantic Search**: Find relevant information using natural language
- **Relationship Mapping**: Automatic connections between entities
- **Archive Separation**: Historical vs current project knowledge

## Architecture Evolution

### Current Architecture (Neo4j + OpenAI)

- **memento-mcp v0.3.9**: Neo4j-backed MCP server for VS Code
- **Neo4j Database**: Graph database for storing entities and relationships
- **OpenAI Embeddings**: text-embedding-3-small (1536 dimensions)
- **Docker Environment**: Isolated development container
- **VS Code Integration**: MCP tools available in Copilot chat

### Future Architecture (rMemory-Inspired + Claude)

Based on learnings from the `Lonnie-Bruton/rEngine/rMemory` project, we're evolving toward:

- **Claude Embeddings**: AI-to-AI semantic alignment for superior memory retrieval
- **Dual-Backend Design**: Neo4j primary + JSON fallbacks (like rMemory's MCP + local files)
- **Search Matrix System**: Claude-generated semantic matrices for fast context retrieval
- **Protocol-Based Operations**: Numbered memory protocols for systematic operations
- **Agent-Specific Memory**: Project namespaces following rMemory patterns

#### rMemory Learnings Applied

The rEngine project's rMemory system demonstrates proven patterns:

1. **Protocol Memory System**: 27 numbered protocols for systematic operations
2. **Search Matrices**: Multi-layered context mapping (consolidated-matrix.json, context-matrix.json)
3. **Agent-Specific Memory**: Separate memory namespaces (rAgentMemories/)
4. **Dual Architecture**: Primary system + local JSON fallbacks for reliability

### Components

- **memento-mcp v0.3.9**: Neo4j-backed MCP server for VS Code
- **Neo4j Database**: Graph database for storing entities and relationships
- **Docker Environment**: Isolated development container
- **VS Code Integration**: MCP tools available in Copilot chat

### Data Model

The memory system uses a graph-based approach:

```mermaid
Entity → Properties (name, type, status, confidence, etc.)
Entity → Relationships → Other Entities
Entity → Observations → Time-stamped notes
```

## Setup

### Prerequisites

- Docker Desktop installed and running
- VS Code with GitHub Copilot
- Node.js 18+ for development scripts

### Installation

1. **Install memento-mcp**:

   ```bash
   npm install -g @modelcontextprotocol/create-server
   npm install -g memento-mcp
   ```

1. **Configure Docker Neo4j**:

   ```bash

   # Start Neo4j container

   docker run -d \
     --name neo4j-dev \
     -p 7474:7474 -p 7687:7687 \
     -e NEO4J_AUTH=neo4j/password \
     neo4j:latest
   ```

1. **Configure VS Code MCP**:

   Add to your MCP settings in GitHub Copilot:

   ```json
   {
     "memento": {
       "command": "memento-mcp",
       "args": ["--neo4j-uri", "bolt://localhost:7687"]
     }
   }
   ```

## Memory-First Development Workflow

### 7-Step Protocol

1. **📋 Observe**: Scan current context and identify key information
2. **🎯 Plan**: Design approach using available knowledge and tools
3. **🛡️ Safeguards**: Validate inputs, check constraints, ensure security
4. **⚡ Execute**: Implement solution with proper error handling
5. **✅ Verify**: Test functionality and validate results
6. **🧠 Map**: Update memory with new knowledge and relationships
7. **📝 Log**: Record decisions and outcomes for future reference

### Entity Types

- **`project_component`**: Major system components (frontend, backend, etc.)
- **`development_process`**: Workflows, procedures, standards
- **`technical_decision`**: Architecture choices, technology selections
- **`agent_memory`**: Historical knowledge with `status:archived`

### Memory Operations

#### Creating Entities

```typescript
// Create a new development process entity
await memento.createEntity({
  name: "Code Review Process",
  type: "development_process",
  observations: ["Uses pre-commit hooks", "Codacy integration required"]
});
```

#### Searching Knowledge

```typescript
// Find relevant entities
const results = await memento.searchEntities("security validation");
```

#### Managing Relationships

```typescript
// Link related concepts
await memento.createRelation({
  from: "ESLint Configuration",
  to: "Code Quality",
  relationType: "enhances"
});
```

## Archived vs Current Knowledge

### Archived Entities

- Historical project memories from previous systems
- Tagged with `status:archived` for reference
- Searchable but distinguished from current project state

### Current Entities

- Active project components and processes
- Live development knowledge
- Real-time relationship mapping

## Practical Usage

### Session Continuity

1. Start VS Code and activate memento MCP
2. Query previous session context: "What was I working on last?"
3. Retrieve relevant technical decisions and progress
4. Continue development with full context

### Knowledge Discovery

```bash

# Search for security-related knowledge

"Find all entities related to security validation"

# Discover architectural decisions

"Show me technical decisions about database design"

# Find development processes

"What processes do we have for code quality?"
```

### Development Session Logging

```bash

# Record new technical decisions

"Create entity: API Rate Limiting Implementation"

# Link related components

"Connect API Rate Limiting to Security Framework"

# Add observations

"Add observation to ESLint Config: Fixed Node.js environment globals"
```

## Integration with HexTrackr

### Pre-commit Hooks

- Memory system validates against known security patterns
- Automatic logging of code quality improvements
- Cross-reference with existing technical decisions

### Documentation Generation

- Memory-informed documentation updates
- Automatic discovery of new components
- Relationship mapping for cross-references

### Agent Operations

- All AI interactions logged for future reference
- Decision rationale preserved
- Context continuity across sessions

## Troubleshooting

### Common Issues

**MCP Server Not Available**:

1. Check Docker Neo4j container status
2. Verify VS Code MCP configuration
3. Restart VS Code to refresh MCP connections

**Memory Persistence Issues**:

1. Confirm Neo4j database connectivity
2. Check memento-mcp service status
3. Validate environment configuration

**Search Performance**:

1. Ensure embeddings are generated
2. Check Neo4j index status
3. Monitor database query performance

### Diagnostic Commands

```bash

# Check Docker containers

docker ps | grep neo4j

# Test Neo4j connectivity

docker exec -it neo4j-dev cypher-shell -u neo4j -p password

# Verify memento installation

npm list -g | grep memento-mcp
```

## Best Practices

### Entity Naming

- Use clear, descriptive names
- Follow consistent naming conventions
- Include context for disambiguation

### Relationship Types

- Use meaningful relationship labels
- Create bidirectional connections where appropriate
- Document relationship semantics

### Observation Quality

- Include timestamps and context
- Reference specific files or commits
- Note decision rationale

### Archive Management

- Regularly review and tag outdated entities
- Maintain clear separation between historical and current knowledge
- Preserve valuable historical context for reference

## Temporary Development Enhancements

### memento-protocol-enhanced Wrapper (Development Only)

**Purpose**: Enhanced memory capabilities during development phase, easily removable before shipping.

**Status**: Available in separate repository: `lbruton/memento-protocol-enhanced`

#### Features Added

- **Protocol Engine**: YAML-based rule enforcement outside LLM control
- **Quality Management**: Confidence scoring, freshness decay, deduplication
- **Enhanced Search**: Hybrid strategies (semantic + keyword + temporal + confidence)
- **Synthesis Reporting**: "Ask the Scribe" functionality for memory insights

#### Integration Approach

```bash

# Install wrapper as development dependency

npm install --save-dev memento-protocol-enhanced

# Configure as optional MCP server

# Add to VS Code MCP settings (development profile only):

{
  "memento-enhanced": {
    "command": "node",
    "args": ["./node_modules/memento-protocol-enhanced/src/index.js"],
    "env": {
      "MEMENTO_WRAPPER_MODE": "development",
      "FALLBACK_TO_STANDARD": "true"
    }
  }
}
```

#### Easy Removal Strategy

1. **Development Dependency**: Installed as `devDependency`, not shipped in production
2. **Graceful Fallbacks**: Wrapper automatically falls back to standard memento-mcp if unavailable
3. **Separate Configuration**: Uses dedicated MCP server entry, easily removed
4. **No Data Lock-in**: All data remains in standard memento-mcp format
5. **Clean Uninstall**: Simple `npm uninstall` and MCP config removal

#### Benefits for Development

- **Enhanced Search**: Better context retrieval during development
- **Quality Control**: Automatic confidence scoring and memory cleanup
- **Protocol Enforcement**: Consistent memory operations (backup-before-write, etc.)
- **Debugging**: Synthesis reports help understand memory state

#### Shipping Preparation

```bash

# Remove wrapper before shipping

npm uninstall memento-protocol-enhanced

# Remove from MCP configuration

# (delete memento-enhanced section from VS Code settings)

# Standard memento-mcp continues working unchanged

```

## Future Enhancements

### Planned Features

- Automated entity discovery from code changes
- Integration with GitHub commit messages
- Enhanced semantic search with local LLM models
- Automated relationship inference

### Extension Opportunities

- Custom entity types for specific domains
- Workflow automation based on memory patterns
- Integration with external knowledge sources
- Advanced analytics and knowledge visualization

## Related Documentation

- [Agent Operations Guide](../agents/AGENTS.md)
- [Development Environment Setup](dev-environment.md)
- [Pre-commit Hooks](pre-commit-hooks.md)
- [Architecture Decision Records](../adr/)

## References

- [memento-mcp Documentation](https://github.com/modelcontextprotocol/servers/tree/main/src/memento)
- [Neo4j Documentation](https://neo4j.com/docs/)
- [Model Context Protocol Specification](https://modelcontextprotocol.io/)
