# Memory System Transition Guide

**Date**: September 7, 2025  
**Migration**: gannonh/memento-mcp (Neo4j) → iAchilles/memento (SQLite) + mem0

## 🚨 CRITICAL RECOVERY INFORMATION

### Backup Location

Your complete memory backup is preserved at:

```
/Volumes/DATA/GitHub/HexTrackr/memento-backup-complete.sql
/Volumes/DATA/GitHub/HexTrackr/data/memento_backup.db
```

### Recovery Commands (Emergency Use)

If anything goes wrong during migration, restore memories with:

```bash

# Option 1: SQLite backup (preferred)

cd /Volumes/DATA/GitHub/HexTrackr
sqlite3 data/memento_backup.db
.tables  # Should show: entities, relations
SELECT COUNT(*) FROM entities;  # Should show 75+ entities

# Option 2: SQL script backup

sqlite3 temp_restore.db < memento-backup-complete.sql
```

### Original System State (Pre-Migration)

- **Neo4j Database**: `~/Library/Application Support/neo4j-desktop/`
- **Memento Version**: @gannonh/memento-mcp@0.3.9 (globally installed)
- **Total Memories**: 75+ entities across 4 categories
- **Key Entities**: Enhanced Entity Classification, HexTrackr project, Zen MCP tools
- **Relations**: 15+ documented relationships with metadata

## 📊 Memory Content Inventory

### Entity Categories (Pre-Migration)

1. **Protocol/Planning**: Enhanced Entity Classification System, Phase 1 Implementation
2. **PAM/FileScope**: Development tools cleanup, architectural visions
3. **HexTrackr Development**: Main project entity, vulnerability management patterns
4. **Workflow/Orchestration**: Agent orchestration hub, Zen MCP integration

### Critical Relationships Preserved

- Enhanced Entity Classification → MCPSERVER:Memento (BELONGS_TO)
- Agent Orchestration Hub → Multi-AI Integration Hub (CONTAINS)
- Development Tools Cleanup → PAM Services (DECOMMISSIONED)

## 🔧 Migration Timeline

### Phase 1: Backup Verification ✅

- [x] Complete SQLite backup created
- [x] 75+ entities exported with full metadata
- [x] Relationships preserved with confidence scores
- [x] Time-based versioning maintained

### Phase 2: System Cleanup

- [ ] Uninstall @gannonh/memento-mcp
- [ ] Remove memento-mcp from Claude config
- [ ] Stop Neo4j Desktop (preserve data)
- [ ] Clean up MCP wrapper scripts

### Phase 3: New System Installation

- [ ] Install @iachilles/memento globally
- [ ] Configure SQLite database path
- [ ] Update Claude Desktop configuration
- [ ] Verify sqlite-vec extension loading

### Phase 4: Memory Restoration

- [ ] Create migration script for entity format conversion
- [ ] Restore all 75+ entities to new system
- [ ] Verify relationship preservation
- [ ] Test semantic search functionality

### Phase 5: mem0 Integration

- [ ] Install Docker container at `/Volumes/DATA/GitHub/mem0`
- [ ] Configure PostgreSQL with pgvector
- [ ] Set up mem0-mcp server component
- [ ] Test code snippet storage capabilities

### Phase 6: Validation & Documentation

- [ ] Smoke test all Zen MCP integrations
- [ ] Verify agent memory access
- [ ] Update CLAUDE.md files
- [ ] Document new tool patterns

## 🛠️ Technical Configuration Details

### iAchilles/memento Configuration

```json
{
  "mcpServers": {
    "memento": {
      "description": "SQLite-based memory with FTS5 + sqlite-vec",
      "command": "npx",
      "args": ["-y", "@iachilles/memento"],
      "env": {
        "MEMORY_DB_PATH": "/Volumes/DATA/GitHub/HexTrackr/data/memento.db"
      },
      "options": {
        "autoStart": true,
        "restartOnCrash": true
      }
    }
  }
}
```

### mem0 Docker Configuration

```bash

# Location: /Volumes/DATA/GitHub/mem0

# Docker image: mcp/mem0:latest

# Port: 8050 (SSE transport)

# Database: PostgreSQL with pgvector extension

```

### Environment Variables Required

```bash

# For mem0-mcp

TRANSPORT=sse
LLM_PROVIDER=openai
LLM_API_KEY=<your-openai-key>
LLM_CHOICE=gpt-4o-mini
EMBEDDING_MODEL_CHOICE=text-embedding-3-small
DATABASE_URL=postgresql://user:pass@localhost:5432/mem0
```

## 📋 Pre-Flight Checklist

Before starting migration:

- [ ] Verify backup file exists and contains data
- [ ] Document current Claude Desktop config
- [ ] Check disk space (>2GB free recommended)
- [ ] Ensure OpenAI API key is available
- [ ] Stop all current MCP servers
- [ ] Create system restore point (Time Machine)

## 🚨 Rollback Plan

If migration fails:

1. Stop new memory servers
2. Restore original Claude Desktop config
3. Restart Neo4j Desktop
4. Verify original gannonh/memento-mcp connection
5. Restore from SQLite backup if needed

## 📞 Support Information

### Key Files to Monitor

- `/Volumes/DATA/GitHub/HexTrackr/data/memento.db` (new memory storage)
- `/Users/lbruton/Library/Application Support/Claude/claude_desktop_config.json`
- Docker logs: `docker logs <mem0-container-id>`

### Troubleshooting Commands

```bash

# Test new memento connection

npx @iachilles/memento --version

# Verify SQLite version

sqlite3 --version  # Must be 3.38+

# Check Docker mem0 status

docker ps | grep mem0
curl http://localhost:8050/health
```

### Recovery Contacts

- **Primary Backup**: `/Volumes/DATA/GitHub/HexTrackr/memento-backup-complete.sql`
- **Secondary Backup**: SQLite database in HexTrackr data directory
- **Neo4j Original**: Preserved in Application Support until migration verified

---
**⚠️ Keep this guide accessible during migration. Print or bookmark this file.**
