# HexTrackr AI Assistant Instructions (DRAFT)

## Project Overview

HexTrackr is a vulnerability and ticket management system with a monolithic Node.js/Express backend and browser-based frontend. It uses SQLite for persistence and follows a modular JavaScript architecture pattern.

## Memory Systems Integration

You have access to two advanced memory systems that work together to provide comprehensive context:

1. **Memento MCP**: Knowledge graph for structured technical information
   - Stores: Code components, architectural decisions, entity relationships
   - Optimized for: Technical knowledge, code structure, design patterns
   - Query via: `semantic_search` with specific entity types

1. **Persistent AI Memory (PAM)**: Timeline-based memory for conversational context
   - Stores: Conversation history, git commits, user preferences
   - Optimized for: Chronological data, conversation continuity
   - Query via: `search_memories` with type filters

### MCP Tool Reference

- **Tool Documentation**: Check `.runbooks/tools/` for comprehensive MCP server documentation
- **Available Tools**: FileScopeMCP, Codacy, GitHub, Firecrawl, Context7, and 10+ other servers
- **Usage Patterns**: Each `.runbooks/tools/{server}-mcp.prompt.md` includes tool lists and best practices

### Memory Access Optimization Protocol

Follow this sequence for maximum token efficiency:

1. **Context First**: Use what's in the current conversation window
2. **Targeted Search**: Use specific 3-5 word queries with type filters
3. **Progressive Expansion**: Only broaden search if needed after initial results

```
// EFFICIENT PATTERN
semantic_search("express route validation", entity_types=["code-component"], limit=3)

// INEFFICIENT PATTERN - AVOID
read_graph() // Returns everything - token expensive
```

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

### Development Setup

- **NEVER** run node.js locally for this project, always run in Docker container

### Docker Configuration

- Uses `Dockerfile.node` (not the main `Dockerfile`)
- Single container setup on port 8080
- **Important:** Restart Docker container before running Playwright tests

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

## 7-Step Task Execution Protocol

Follow this process for every user request:

### 1. Observe - Gather Context Efficiently

- Check current conversation context first
- Use targeted semantic searches with specific terms and type filters
- Limit initial results to 3-5 items to conserve tokens
- Track sources with [MEMENTO] or [PAM] prefixes

### 2. Plan - Structure Your Approach

- Create a concise checklist of 3-5 specific actions
- Identify files that need to be changed
- Store technical concepts as Memento entities with proper types

### 3. Safeguards - Prevent Data Loss

- Create safety snapshots before making changes
- Document rollback strategies
- Store conversation state in PAM before major operations

### 4. Execute - Implement With Precision

- Make minimal, focused changes
- Run Codacy analysis after file edits
- Work in small, verifiable increments

### 5. Verify - Confirm Success

- Run appropriate tests for the changes made
- Perform targeted smoke tests
- Fix any issues before continuing

### 6. Map-Update - Enhance Knowledge

- Add observations to relevant Memento entities
- Update conversation context in PAM
- Create reminders for follow-up tasks

### 7. Log - Document Outcomes

- Store structured records in both memory systems
- Update project documentation
- Maintain the project roadmap

## Optimized Memory Taxonomy

| Knowledge Type | System | Query Method | Example | When to Use |
|---------------|--------|--------------|---------|------------|
| Code structure | Memento | `semantic_search` + type filter | `semantic_search("server endpoints", entity_types=["code-component"])` | Understanding implementation |
| Design decisions | Memento | `semantic_search` + type filter | `semantic_search("database schema design", entity_types=["decision"])` | Retrieving rationale |
| User preferences | Memento | `open_nodes` with ID | `open_nodes(["user_lonnie"])` | Personalizing responses |
| Recent conversations | PAM | `search_memories` with type | `search_memories("vulnerability import", type="conversation")` | Continuing discussions |
| Git history | PAM | `search_memories` with type | `search_memories("fix ticket schema", type="git-commit")` | Understanding changes |
| Project timeline | PAM | `get_memories_by_date` | `get_memories_by_date(start="2025-08-01")` | Tracking progress |

## Versioning Standards

### Keep a Changelog

- **Format**: Follow [Keep a Changelog v1.0.0](https://keepachangelog.com/en/1.0.0/) format
- **File**: `CHANGELOG.md` must be updated for ALL releases
- **Sections**: Unreleased, Added, Changed, Deprecated, Removed, Fixed, Security
- **Badges**: [![Keep a Changelog](https://img.shields.io/badge/Keep%20a%20Changelog-v1.0.0-orange)](https://keepachangelog.com/en/1.0.0/)

### Semantic Versioning

- **Standard**: Follow [Semantic Versioning v2.0.0](https://semver.org/spec/v2.0.0.html)
- **Format**: MAJOR.MINOR.PATCH (e.g., 1.0.2)
- **Current Version**: 1.0.3 (in package.json)
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
