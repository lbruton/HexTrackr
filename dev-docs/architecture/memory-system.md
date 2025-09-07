# HexTrackr Memory System Architecture

**Version**: 2.0 (SQLite-based)  
**Migration Date**: September 7, 2025  
**Status**: Production Ready  

## Overview

HexTrackr's memory system uses **iAchilles/memento** with SQLite FTS5 + sqlite-vec backend, providing hybrid keyword and semantic search capabilities for persistent knowledge management across development sessions.

## Architecture Stack

### Core Components

- **Database**: SQLite with FTS5 (full-text search) + sqlite-vec (vector embeddings)
- **MCP Integration**: iAchilles/memento MCP server via `/opt/homebrew/bin/memento`
- **Search**: Hybrid approach combining keyword matching and semantic similarity
- **Classification**: PROJECT:DOMAIN:TYPE hierarchical entity organization

### Migration History

- **v1.0**: Neo4j-based gannonh/memento-mcp (deprecated September 2025)
- **v2.0**: SQLite-based iAchilles/memento (current, production)

## Entity Classification Convention

### Standardized Pattern: `PROJECT:DOMAIN:TYPE[:STATUS][:ID]`

#### Examples

```
HEXTRACKR:UI:PATTERN           - UI patterns specific to HexTrackr
HEXTRACKR:API:DECISION         - API architectural decisions
SYSTEM:MCP:CONFIG:ACTIVE       - Active MCP server configurations  
SYSTEM:WORKFLOW:TEMPLATE       - Reusable workflow patterns
WORKFLOW:MEMORY:OPERATION      - Memory system operations
DEPRECATED:PAM:MIGRATION:2025  - Historical/deprecated systems with date
```

#### Classification Rules

1. **PROJECT**: Primary system context (HEXTRACKR, SYSTEM, WORKFLOW, DEPRECATED)
2. **DOMAIN**: Functional area (UI, API, MCP, MEMORY, etc.)
3. **TYPE**: Entity classification (PATTERN, DECISION, CONFIG, etc.)
4. **STATUS**: Optional status qualifier (ACTIVE, DEPRECATED, etc.)
5. **ID**: Optional unique identifier or date

## Memory Operations

### Core Tools (MCP)

```javascript
// Search memories with hybrid keyword + semantic
mcp__memento__search_nodes({
  query: "vulnerability rollover deduplication",
  mode: "hybrid",           // keyword + semantic
  topK: 10,                 // max results
  threshold: 0.35           // similarity threshold
})

// Create new entity with classification
mcp__memento__create_entities([{
  name: "CVE Deduplication Pattern",
  entityType: "HEXTRACKR:SECURITY:PATTERN",
  observations: [
    "Uses normalizeHostname(hostname) + CVE as dedup key",
    "Falls back to plugin_id + description for non-CVE entries",
    "Prevents duplicate vulnerability entries during CSV imports"
  ]
}])

// Create relationships between entities
mcp__memento__create_relations([{
  from: "CVE Deduplication Pattern",
  to: "HexTrackr",
  relationType: "IMPLEMENTS"
}])

// Read entire knowledge graph
mcp__memento__read_graph()
```

### Search Modes

- **hybrid**: Combines FTS5 keyword + sqlite-vec semantic search (recommended)
- **keyword**: Pure FTS5 full-text search for exact term matching
- **semantic**: Pure vector similarity search for conceptual matching

## Workflow Integration

### Session Start Protocol

```javascript
// 1. Search for relevant context
const memories = await mcp__memento__search_nodes({
  query: "current task or project context",
  mode: "hybrid",
  topK: 5
});

// 2. Review existing patterns and decisions
// 3. Proceed with development informed by previous work
```

### During Development

- **Capture Decisions**: Store architectural choices with rationale
- **Document Patterns**: Save reusable code patterns and configurations
- **Track Solutions**: Record bug fixes with root cause analysis
- **Build Relationships**: Connect new knowledge to existing entities

### Session End Protocol

```javascript
// Use command snippets for consistent memory operations
/save-conversation "Brief summary of key outcomes"
/save-insights "Technical patterns or workflow improvements"
```

## Command Snippets

### /save-conversation

Creates focused entity capturing essential session outcomes:

- Key decisions and solutions discussed
- Technical patterns or approaches identified  
- Problems solved and methods used
- Project-specific insights with proper classification

### /save-insights

Extracts high-value technical discoveries:

- Code patterns and architectural decisions
- Workflow optimizations and process improvements
- Tool configurations and integration patterns
- Security considerations and implementation approaches

### /memory-search

Quick memory search template:

```javascript
mcp__memento__search_nodes({
  query: "$SEARCH_TERMS",
  mode: "hybrid",
  topK: 8
})
```

## Agent Integration

### Memory-Aware Agents

All specialized agents integrate with memory system:

```javascript
// UI Design Specialist with memory
Task(ui-design-specialist): "Search memory for responsive table patterns, then optimize AG Grid implementation"

// Vulnerability Data Processor with memory
Task(vulnerability-data-processor): "Review stored deduplication patterns before processing CSV import"

// GitHub Workflow Manager with memory
Task(github-workflow-manager): "Check memory for backup procedures before making repository changes"
```

### Memory Curator Agent

Specialized agent for batch memory management:

- Automated organization and cleanup
- Relationship building between entities
- Classification standardization
- Duplicate detection and consolidation

## Performance Characteristics

### Scalability

- **Optimal Range**: 0-10K entities (instant response)
- **Good Performance**: 10K-50K entities (<100ms search)
- **Degradation Point**: 50K+ entities (monitoring required)

### Search Performance

- **Hybrid Queries**: ~50ms average response time
- **Keyword Queries**: ~10ms average response time  
- **Semantic Queries**: ~80ms average response time

### Storage Efficiency

- **SQLite Database**: ~1MB per 1000 entities
- **Vector Embeddings**: BGE-M3 model (1024 dimensions)
- **Full-Text Index**: FTS5 with trigram tokenization

## Tool Discovery Optimization

### Consolidated Reference

Instead of listing all MCP tools in CLAUDE.md files, use contextual discovery:

```javascript
// Quick tool discovery
mcp__zen__listmodels()  // All available AI models and capabilities

// Context-aware tool routing
"Memory Operations" → mcp__memento__*
"Analysis Tasks" → mcp__zen__*  
"Documentation" → mcp__Ref__*
"Browser Testing" → mcp__playwright__*
"Code Quality" → mcp__codacy__*
```

### Smart Tool Selection

Rather than memorizing extensive tool lists, use pattern-based selection:

- **Planning/Analysis**: Start with Zen MCP tools
- **Memory Operations**: Use memento search before creating
- **Documentation**: Ref.tools for external research
- **Implementation**: Domain-specific agents for validation

## Data Management

### Backup Strategy

- **Location**: `/Volumes/DATA/GitHub/memento/memento.db`
- **Frequency**: Automatic SQLite transactions + manual exports
- **Recovery**: Full graph export via `mcp__memento__read_graph()`

### Migration Procedures

- **Schema Evolution**: ALTER TABLE statements with backward compatibility
- **Data Validation**: Relationship integrity checks
- **Classification Updates**: Batch entity type updates via memory curator

### Retention Policy

- **Active Projects**: Indefinite retention
- **Historical Context**: 90-day deprecation review
- **Deprecated Systems**: Marked DEPRECATED but preserved for reference
- **Cleanup**: Quarterly automated cleanup via memory curator agent

## Security Considerations

### Data Privacy

- **Local Storage**: All data stored locally in SQLite database
- **No External APIs**: Embeddings generated locally via BGE-M3
- **Access Control**: File system permissions control database access

### Data Integrity

- **Transaction Safety**: SQLite ACID compliance
- **Relationship Validation**: Foreign key constraints on entity relationships
- **Backup Verification**: Periodic integrity checks via memory curator

## Troubleshooting

### Common Issues

1. **MCP Connection Failure**:

   ```bash

   # Check binary path

   which memento

   # Should return: /opt/homebrew/bin/memento
   
   # Verify config in Claude Desktop

   # Use direct path instead of npx if needed

   ```

1. **Search Performance Degradation**:

   ```javascript
   // Check entity count
   const graph = await mcp__memento__read_graph();
   console.log(`Total entities: ${graph.entities.length}`);
   
   // If > 50K entities, consider partitioning or cleanup
   ```

1. **Classification Inconsistencies**:

   ```javascript
   // Use memory curator agent for batch standardization
   Task(memento-memory-manager): "Standardize entity classifications using PROJECT:DOMAIN:TYPE pattern"
   ```

## Future Enhancements

### Planned Features

1. **Auto-Classification**: LM-based entity type inference during creation
2. **Memory Versioning**: Track entity evolution with timestamps
3. **Retention Automation**: Automated cleanup based on access patterns
4. **Performance Monitoring**: Query performance metrics and optimization
5. **Export/Import**: Structured memory sharing between projects

### Integration Opportunities

1. **GitHub Integration**: Auto-capture commit messages and PR descriptions
2. **Documentation Sync**: Two-way sync with docs-source/ markdown files
3. **Code Analysis**: Integration with Zen analyze for pattern recognition
4. **Testing Integration**: Store test patterns and coverage insights

---

## Quick Reference

### Essential Commands

```bash

# Search memories

mcp__memento__search_nodes({query: "search terms", mode: "hybrid"})

# Save new knowledge

mcp__memento__create_entities([{name, entityType, observations}])

# Build relationships  

mcp__memento__create_relations([{from, to, relationType}])

# View complete graph

mcp__memento__read_graph()
```

### Classification Examples

- `HEXTRACKR:SECURITY:PATTERN` - Security implementation patterns
- `SYSTEM:MCP:SERVER:ZEN` - Zen MCP server configuration
- `WORKFLOW:DEVELOPMENT:TEMPLATE` - Standard development workflows
- `DEPRECATED:PAM:SYSTEM:2025-09` - Deprecated systems with timeline

This memory system provides persistent, searchable knowledge management that enhances development efficiency and maintains institutional knowledge across projects and sessions.
