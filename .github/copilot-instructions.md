# HexTrackr AI Assistant Instructions

## Project Overview

HexTrackr is a vulnerability and ticket management system with a monolithic Node.js/Express backend and browser-based frontend. It uses SQLite for persistence and follows a modular JavaScript architecture pattern.

## Key Architecture Patterns

### Backend Architecture

- Monolithic Express server (`server.js`) handling both API and static file serving
- SQLite database with runtime schema evolution
- Core middleware: CORS, compression, JSON/form parsing (100MB limits), security headers
- File uploads handled via multer in `uploads/` directory
- PathValidator class for secure file operations

### Frontend Architecture

- Modular pattern with shared components (`scripts/shared/`), page-specific code (`scripts/pages/`), and utilities (`scripts/utils/`)
- Page initialization flow:
  1. Load shared components (e.g., `settings-modal.js`)
  2. Load page-specific code (e.g., `tickets.js`)
- Inter-module communication via `window.refreshPageData(type)` pattern

### Database Schema

- Located at `data/hextrackr.db`, initialized by `scripts/init-database.js`
- Key tables: tickets, vulnerabilities, vulnerability_imports
- Schema evolution happens at runtime with idempotent ALTERs
- JSON fields stored as strings (e.g., devices in tickets table)

## Critical Workflows

## 7-Step Turn Loop

# 1. observe

- **CHECK CONTEXT FIRST**: Analyze if the answer exists in the current conversation context
- If not in context, **ACCESS TIERED MEMORY**:
  1. Check active reminders via (get_reminders)
  2. Query Memento MCP via (semantic_search)

  1. Query persistent-ai-memory via (search_memories) only if needed for:
     - Conversation history use: (type:conversation)
     - Git commit summaries use: (type:git-commit)
  1. Get recent context via (get_recent_context) if continuing previous work
- **TRACK MEMORY SOURCE** with each retrieved item: `[MEMENTO]` or `[PAM]` prefix

# 2. plan

- Produce a short actionable checklist tied to requirements
- Identify files to change and expected outputs
- **CREATE STRUCTURED MEMORIES** for new concepts:
  - Technical concepts → Memento MCP via `create_entities` with relevant relations
  - Conversational notes → persistent-ai-memory via `create_memory`

# 3. safeguards

- Make a pre-flight commit to snapshot baseline
- Note roll-back strategy
- Store conversation state via `store_conversation` before major changes
- **BACKUP CRITICAL KNOWLEDGE** to both systems for redundancy

# 4. execute

- Apply the smallest changes needed
- After each file edit, run Codacy CLI analysis for the edited file
- Prefer incremental, verifiable steps

# 5. verify

- Run linters and tests
- Perform a small smoke test where applicable
- Fix issues before proceeding

# 6. map-update

- **DUAL MEMORY UPDATE**:
  - Technical knowledge → Memento via `add_observations` and `create_relations`
  - Conversation context → persistent-ai-memory via `update_memory`
- Create reminders via `create_reminder` for time-sensitive tasks

### 7. log

- Store structured knowledge in Memento MCP for:
  - Entity relationships
  - Code structure
  - Technical decisions with reasons
- Store conversation logs in persistent-ai-memory for:
  - Chat history
  - Git commit summaries
  - User preferences
- Update project roadmap (`roadmaps/ROADMAP.md`) with progress

## Context-First, Memory-Optimized Philosophy

🧠 **Check context first, then query the right memory system**

- **Context is king**: Use what's already in the conversation before memory lookup
- **Know your memory systems**:
  - **Memento MCP**: For structured knowledge, technical concepts, relationships between code components
  - **persistent-ai-memory**: For conversation history, git commit logs, chronological project history
- **Cross-reference memories**: Link information between systems with consistent entity IDs
- **Optimize token usage**: Fetch only what's needed, in the right order:
  1. Check context window first
  2. Use semantic search in Memento for targeted knowledge
  3. Fall back to persistent-ai-memory for historical context

## Memory Taxonomy

| Knowledge Type | Storage System | Query Method | When to Use |
|---------------|---------------|-------------|------------|
| Code structure | Memento MCP | `semantic_search` with `type:code-component` | Understanding architecture |
| Technical decisions | Memento MCP | `semantic_search` with `type:decision` | Retrieving rationale |
| User preferences | Memento MCP | `open_nodes` with user ID | Personalizing responses |
| Conversation history | persistent-ai-memory | `search_memories` with `type:conversation` | Getting chat context |
| Git commits | persistent-ai-memory | `search_memories` with `type:git-commit` | Understanding changes |
| Project timelines | persistent-ai-memory | `get_memories_by_date` | Tracking progress |

### Development Setup

- **NEVER** run node.js locally for this project, always run in Docker container

## Docker Configuration

- Uses `Dockerfile.node` (not the main `Dockerfile`)
- Single container setup on port 8080
- **Important:** Restart Docker container before running Playwright tests

### Testing Setup

## Playwright Testing

- Requires Docker container restart: `docker-compose restart`
- Browser automation tests need clean container state
- All tests run against `http://localhost:8080`

### Data Import Flows

1. CSV Upload:
   - Multipart form upload → temp file storage → Papa.parse → DB insert → cleanup
1. JSON Import (client-parsed CSV):
   - Direct JSON payload → DB insert
   - Both flows update both vulnerability_imports and vulnerabilities tables

### Integration Points

- ServiceNow ticket integration via configurable settings
- CSV imports from various vulnerability scanners
- Backup/restore system for all data types
- Settings modal provides global data operation hooks

## Project-Specific Conventions

### File Organization

- Frontend modules follow strict shared/pages/utils separation
- API endpoints grouped by domain (tickets, vulnerabilities, backup)
- Database initialization split between runtime (server.js) and bootstrap (init-database.js)

### Error Handling

- HTTP 400 for bad input (missing files/data)
- HTTP 500 for DB/processing errors
- Success responses always include `{ success: true }` with additional data

### Data Validation

- CSV imports validate required fields per vendor
- Ticket fields allow schema evolution (nullable new columns)
- File paths validated through PathValidator class

## Common Pitfalls

- settings-modal.js expects generic `/api/import` but server uses specific endpoints
- Ticket schema has evolved - some deployments may lack newer columns
- File uploads must not exceed 100MB limit
- Remember to unlink temporary files after processing
- SQLite file requires write permissions in `data/` directory

## Key Files for Context

- `server.js`: Main backend entry point
- `scripts/init-database.js`: DB schema and initialization
- `scripts/shared/settings-modal.js`: Global frontend utilities
- `docs-source/architecture/`: Detailed architecture documentation

- Store structured knowledge in Memento MCP for:
  - Entity relationships
  - Code structure
  - Technical decisions with reasons
- Store conversation logs in persistent-ai-memory for:
  - Chat history
  - Git commit summaries
  - User preferences
- Update project roadmap (`roadmaps/ROADMAP.md`) with progress

## Versioning Standards

### Keep a Changelog

- **Format**: Follow [Keep a Changelog v1.0.0](https://keepachangelog.com/en/1.0.0/) format
- **File**: `CHANGELOG.md` must be updated for ALL releases
- **Sections**: Unreleased, Added, Changed, Deprecated, Removed, Fixed, Security
- **Badges**: [![Keep a Changelog](https://img.shields.io/badge/Keep%20a%20Changelog-v1.0.0-orange)](https://keepachangelog.com/en/1.0.0/)

### Semantic Versioning

- **Standard**: Follow [Semantic Versioning v2.0.0](https://semver.org/spec/v2.0.0.html)
- **Format**: MAJOR.MINOR.PATCH (e.g., 1.0.2)
- **Current Version**: 1.0.2 (in package.json)
- **Rules**:
  - **MAJOR**: Breaking changes or major architectural updates
  - **MINOR**: New features and enhancements (backward compatible)  
  - **PATCH**: Bug fixes and minor improvements
- **Badges**: [![Semantic Versioning](https://img.shields.io/badge/Semantic%20Versioning-v2.0.0-blue)](https://semver.org/spec/v2.0.0.html)

### Release Process

1. Update CHANGELOG.md with new version section
2. Update package.json version number
3. Commit with descriptive message following SemVer
4. Create Git tag matching version number
5. Push changes and tags to GitHub

## Documentation

Full documentation available in `docs-source/` with architecture diagrams and API references.
