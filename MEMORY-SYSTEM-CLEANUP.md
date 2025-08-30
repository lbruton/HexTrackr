# HexTrackr Memory System Cleanup Plan

**Date**: August 30, 2025  
**Goal**: Remove legacy components, document working system, achieve 100% operational status

## Current Working Components ✅

Based on GUI and testing:

- **Real-time Scribe** (`scribes/real-time-scribe.js`) - ✅ Running
- **Symbol Table Processor** (`tools/symbol-table-processor.js`) - ✅ Working (15 entity types, 5 intent types)
- **SQLite Backend** (`sqlite/memory-mcp.db`) - ✅ Evidence/Notes/Todos tables ready
- **Docker Services** - ✅ Neo4j + Ollama running
- **Python GUI** (`gui/rmemory-control-center.py`) - ✅ Functional

## Components to Remove/Deprecate ❌

### Legacy Startup Scripts

- `/startup.sh` - References old orchestrator components
- `/shutdown.sh` - Manages processes we don't use
- `/scripts/install-memory-system.sh` - Outdated install process

### Broken/Unused Core Components  

- `core/semantic-orchestrator.js` - Old architecture, not in active use
- `core/embedding-indexer.js` - Superseded by Symbol Table Processor
- `core/hierarchical-memory-organizer.js` - Not operational (GUI shows stopped)
- `core/extended-memory-indexer.js` - Unused
- `core/ollama-embedding-proxy.js` - Redundant

### Legacy Scribes (Keep Real-time Scribe Only)

- `scribes/agent-context-loader.js` - Old context system
- `scribes/deep-chat-analysis.js` - Superseded by Evidence processing
- `scribes/memory-importer.js` - Old import system
- All other scribes/* except real-time-scribe.js

### Deprecated Analysis Components

- `analysis/scheduled-analyzer.js` - Heavy analysis not needed
- Everything in `/deprecated/` folder - Already marked

## Database Cleanup Plan

### Keep Core Data

- HexTrackr project entities
- Current sprint/roadmap data  
- Symbol Table classifications

### Remove Scattered Data

- Old rMemory backup entities (10+ items found)
- Outdated development session memories
- Legacy workflow protocols

## Tonight's Action Plan

1. **Phase 1: Remove Legacy Files** (30 min)
   - Move non-working components to `/deprecated/`
   - Clean up startup scripts
   - Remove unused scribes

1. **Phase 2: Database Cleanup** (15 min)  
   - Identify core vs scattered entities
   - Wipe non-essential memories
   - Preserve HexTrackr/project data

1. **Phase 3: Documentation** (30 min)
   - Rewrite Memory-System.md accurately
   - Document working Evidence → Canonical Notes → Todos pipeline
   - Update sprint status

1. **Phase 4: Re-generation** (45 min)
   - Run working scribes to populate clean data
   - Test Evidence processing
   - Verify Canonical Notes generation

1. **Phase 5: Verification** (30 min)
   - Full system test via GUI
   - Confirm 100% operational status
   - Update roadmap completion

## Success Criteria

- [ ] All legacy confusion removed
- [ ] Clean database with only core data
- [ ] Accurate documentation of working system
- [ ] Evidence → Canonical Notes → Todos pipeline operational
- [ ] GUI shows all services green/running
- [ ] Ready to continue sprint development

---

**Start Time**: Now  
**Target Completion**: Tonight  
**Next Phase**: Continue Memory MCP Integration Sprint
