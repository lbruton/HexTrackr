# SQLite Migration Plan for rEngine Memory System

**Version**: 3.04.86+  
**Date**: 2025-01-18  
**Priority**: P2 - Performance Enhancement  
**Estimated Time**: 2-3 days implementation

## Executive Summary

Currently, the rEngine memory system uses a JSON-based architecture with hundreds of individual files scattered across `/rMemory/rAgentMemories/`. This causes performance issues, file management complexity, and scaling problems. This plan outlines migration to a consolidated SQLite database system.

## Current System Analysis

### JSON File Structure

```
/rMemory/rAgentMemories/
├── agents/
│   ├── github_copilot_memories.json (7,429 lines)
│   ├── claude_agent_memories.json
│   └── [50+ agent memory files]
├── scribe/
│   ├── catch-up-events/
│   │   └── [200+ timestamp-based JSON files]
│   └── conversation_logs/
│       └── [100+ conversation JSON files]
├── engine/
│   ├── conversations/
│   │   └── [300+ individual conversation files]
│   └── metadata/
│       └── [Various tracking JSONs]
└── persistent-memory.json (master index)
```

### Performance Issues

- **File I/O Overhead**: 500+ individual JSON files require separate read/write operations
- **Memory Usage**: Large JSON files loaded entirely into memory
- **Search Performance**: No indexing, requires full-text scanning across multiple files
- **Concurrent Access**: File locking issues with multiple agents accessing same files
- **Backup Complexity**: Individual file backups create management overhead

### Current Data Schema (from persistent-memory.json)

```json
{
  "metadata": {
    "version": "2.5.1",
    "created": "2025-01-17T21:02:27.402Z",
    "last_sync": "2025-01-18T14:45:23.123Z"
  },
  "entities": [
    {
      "name": "StackTrackr",
      "type": "application",
      "observations": ["Web-based precious metals inventory", "Client-side storage", ...]
    }
  ],
  "relations": [
    {
      "from": "StackTrackr", 
      "to": "rEngine",
      "type": "orchestrated_by"
    }
  ],
  "conversations": [
    {
      "id": "conv_123",
      "timestamp": "2025-01-18T10:30:00Z",
      "participants": ["github_copilot", "user"],
      "summary": "Discussion about SQLite migration"
    }
  ]
}
```

## Proposed SQLite Schema

### Core Tables

```sql
-- Main entity storage
CREATE TABLE entities (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE NOT NULL,
    type TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    metadata JSON
);

-- Entity observations/notes
CREATE TABLE observations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    entity_id INTEGER NOT NULL,
    content TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    source TEXT, -- agent name that created observation
    FOREIGN KEY (entity_id) REFERENCES entities(id) ON DELETE CASCADE
);

-- Entity relationships
CREATE TABLE relations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    from_entity_id INTEGER NOT NULL,
    to_entity_id INTEGER NOT NULL,
    relation_type TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    metadata JSON,
    FOREIGN KEY (from_entity_id) REFERENCES entities(id) ON DELETE CASCADE,
    FOREIGN KEY (to_entity_id) REFERENCES entities(id) ON DELETE CASCADE
);

-- Conversation storage
CREATE TABLE conversations (
    id TEXT PRIMARY KEY, -- Keep original conv_* format
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    participants JSON, -- Array of participant names
    summary TEXT,
    metadata JSON
);

-- Conversation messages
CREATE TABLE conversation_messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    conversation_id TEXT NOT NULL,
    timestamp DATETIME NOT NULL,
    participant TEXT NOT NULL,
    message_type TEXT DEFAULT 'message', -- message, system, handoff, etc.
    content TEXT NOT NULL,
    metadata JSON,
    FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE
);

-- Agent-specific memory storage
CREATE TABLE agent_memories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    agent_name TEXT NOT NULL,
    memory_type TEXT NOT NULL, -- context, skill, preference, etc.
    key_name TEXT NOT NULL,
    value_data JSON NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    expires_at DATETIME, -- Optional expiration
    UNIQUE(agent_name, memory_type, key_name)
);

-- System metadata and configuration
CREATE TABLE system_metadata (
    key_name TEXT PRIMARY KEY,
    value_data JSON NOT NULL,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Search optimization - Full Text Search
CREATE VIRTUAL TABLE search_index USING fts5(
    content,
    entity_name,
    content='observations',
    content_rowid='id'
);

-- Indexes for performance
CREATE INDEX idx_entities_type ON entities(type);
CREATE INDEX idx_entities_updated_at ON entities(updated_at);
CREATE INDEX idx_observations_entity_id ON observations(entity_id);
CREATE INDEX idx_observations_created_at ON observations(created_at);
CREATE INDEX idx_relations_from_entity ON relations(from_entity_id);
CREATE INDEX idx_relations_to_entity ON relations(to_entity_id);
CREATE INDEX idx_relations_type ON relations(relation_type);
CREATE INDEX idx_conversations_created_at ON conversations(created_at);
CREATE INDEX idx_conversation_messages_conv_id ON conversation_messages(conversation_id);
CREATE INDEX idx_conversation_messages_timestamp ON conversation_messages(timestamp);
CREATE INDEX idx_agent_memories_agent ON agent_memories(agent_name);
CREATE INDEX idx_agent_memories_type ON agent_memories(memory_type);
CREATE INDEX idx_agent_memories_updated_at ON agent_memories(updated_at);
```

## Migration Strategy

### Phase 1: Database Creation and Migration Tool (Day 1)

```bash

# Migration tool: rEngine/migrate-to-sqlite.js

node rEngine/migrate-to-sqlite.js --create-schema
node rEngine/migrate-to-sqlite.js --migrate-data
node rEngine/migrate-to-sqlite.js --validate
```

## Implementation Steps:

1. Create SQLite database at `/rMemory/rengine_memory.db`
2. Execute schema creation script
3. Build migration tool to parse JSON files and insert into SQLite
4. Validate data integrity post-migration

### Phase 2: Update Memory Access Layer (Day 2)

## Files to Update:

- `rEngine/memory-sync-manager.js` - Add SQLite backend option
- `rEngine/mcp-fallback-handler.js` - Update to use SQLite queries
- `rEngine/dual-memory-writer.js` - Add SQLite write support
- `rEngine/memory-intelligence.js` - Update search to use FTS5

## New API Layer:

```javascript
class SQLiteMemoryManager {
    constructor(dbPath = '/Volumes/DATA/GitHub/rEngine/rMemory/rengine_memory.db') {
        this.db = new Database(dbPath);
    }
    
    // Entity operations
    async createEntity(name, type, observations = []) { }
    async getEntity(name) { }
    async updateEntity(name, updates) { }
    async deleteEntity(name) { }
    
    // Observation operations
    async addObservation(entityName, content, source) { }
    async getObservations(entityName, limit = 50) { }
    
    // Relation operations
    async createRelation(fromEntity, toEntity, relationType) { }
    async getRelations(entityName) { }
    
    // Conversation operations
    async createConversation(id, participants) { }
    async addMessage(conversationId, participant, content, messageType = 'message') { }
    
    // Search operations
    async searchContent(query, limit = 20) { }
    async searchEntities(query, entityType = null) { }
    
    // Agent memory operations
    async setAgentMemory(agentName, memoryType, key, value, expiresAt = null) { }
    async getAgentMemory(agentName, memoryType, key) { }
    async getAgentMemories(agentName, memoryType = null) { }
}
```

### Phase 3: Gradual Rollout and Testing (Day 2-3)

1. **Parallel Operation**: Run both JSON and SQLite systems simultaneously
2. **Agent Testing**: Update one agent at a time to use SQLite
3. **Performance Benchmarking**: Compare query times and memory usage
4. **Rollback Plan**: Keep JSON files as backup during transition

### Phase 4: Cleanup and Optimization (Day 3)

1. **Archive JSON Files**: Move old JSON files to `/rMemory/legacy-json-backup/`
2. **Update Documentation**: Update all agent instructions to reference SQLite
3. **Performance Tuning**: Optimize SQLite settings and indexes
4. **Backup Strategy**: Setup automated SQLite database backups

## Performance Benefits

### Expected Improvements

- **File Count Reduction**: 500+ JSON files → 1 SQLite database
- **Search Performance**: Full-text search with FTS5 indexing
- **Memory Usage**: On-demand loading vs. full JSON file loading
- **Concurrent Access**: SQLite handles multiple readers/writers efficiently
- **Backup Simplicity**: Single database file backup vs. 500+ files

### Benchmarking Targets

- **Search Query Time**: < 50ms for keyword searches (vs. current 500-2000ms)
- **Memory Usage**: < 50MB for typical operations (vs. current 200-400MB)
- **Startup Time**: < 2 seconds for memory system initialization (vs. current 10-15s)
- **Write Performance**: < 10ms for typical memory writes

## Risk Assessment

### Potential Issues

1. **Data Loss Risk**: Ensure complete migration validation before JSON cleanup
2. **Agent Compatibility**: Some agents may have hardcoded JSON file paths
3. **Backup Disruption**: Existing backup scripts target JSON files
4. **Development Workflow**: Developers familiar with JSON file editing

### Mitigation Strategies

1. **Comprehensive Testing**: Full data validation and rollback procedures
2. **Gradual Migration**: Maintain dual-system operation during transition
3. **Documentation Updates**: Update all agent instructions and developer guides
4. **SQLite Tools**: Provide easy-to-use tools for database inspection and editing

## Implementation Commands

### Migration Execution

```bash

# Phase 1: Create and migrate

cd /Volumes/DATA/GitHub/rEngine/rEngine
node migrate-to-sqlite.js --create-schema
node migrate-to-sqlite.js --migrate-entities
node migrate-to-sqlite.js --migrate-conversations
node migrate-to-sqlite.js --migrate-agent-memories
node migrate-to-sqlite.js --validate-migration

# Phase 2: Update system configuration

echo "MEMORY_BACKEND=sqlite" >> .env
node update-memory-config.js --enable-sqlite

# Phase 3: Test and validate

npm test -- --filter=memory-system
node test-sqlite-performance.js

# Phase 4: Cleanup

node migrate-to-sqlite.js --archive-json-files
node update-backup-scripts.js --target=sqlite
```

### Rollback Procedure (If Needed)

```bash

# Emergency rollback to JSON system

echo "MEMORY_BACKEND=json" >> .env
node restore-from-json-backup.js
node verify-json-system.js
```

## Success Metrics

- ✅ **Data Integrity**: 100% of entities, relations, and conversations migrated successfully
- ✅ **Performance**: Search queries complete in <50ms average
- ✅ **System Stability**: All agents operate normally with SQLite backend
- ✅ **File Management**: Single database file replaces 500+ JSON files
- ✅ **Backup Efficiency**: Database backup completes in <5 seconds vs. 30+ seconds for JSON

## Timeline

- **Day 1 Morning**: Create SQLite schema and migration tool
- **Day 1 Afternoon**: Execute data migration and validation
- **Day 2 Morning**: Update memory access layer and API
- **Day 2 Afternoon**: Test with one agent, gradual rollout
- **Day 3 Morning**: Performance optimization and cleanup
- **Day 3 Afternoon**: Documentation updates and system validation

**Dependencies**: None - this is a standalone migration that doesn't affect StackTrackr application functionality.

**Testing Strategy**: Full parallel operation ensures zero downtime and complete rollback capability if issues arise.
