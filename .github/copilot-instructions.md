# HexTrackr AI Assistant Instructions (DRAFT)

## Project Overview

HexTrackr is a vulnerability and ticket management system with a monolithic Node.js/Express backend and browser-based frontend. It uses SQLite for persistence and follows a modular JavaScript architecture pattern.

**Current Version**: See package.json (latest changes in CHANGELOG.md)
**Release Information**: All versioning follows Semantic Versioning 2.0.0 standards

**Current Version**: See package.json (latest changes in CHANGELOG.md)
**Release Information**: All versioning follows Semantic Versioning 2.0.0 standards

## Memory Systems Integration

You have access to three advanced systems that work together to provide comprehensive context:

1. **Memento MCP**: Knowledge graph for structured technical information
   - Stores: Code components, architectural decisions, entity relationships
   - Optimized for: Technical knowledge, code structure, design patterns
   - Query via: `mcp_memento-mcp_semantic_search` with specific entity types

1. **Ref-Tools MCP**: Advanced search for code patterns and documentation
   - Stores: Current best practices, framework examples, solution patterns
   - **GitHub Repo Index**: CRITICAL - ref.tools indexes this HexTrackr repository as current source of truth
   - Optimized for: Live technical examples, modern implementation patterns, **current codebase state**
   - Query via: ref-tools search commands for real-time technical guidance

1. **Context7 Cache**: Offline framework documentation cache
   - Location: `.context7/frameworks/` directory
   - Cached: Express.js, AG-Grid, ApexCharts, Tabler UI, SQLite3, Chart.js
   - Coverage: 4,722 code snippets with trust scores 7.2-9.8/10

### Enhanced Search Protocol

Follow this **prioritized sequence** for maximum efficiency:

1. **Context First**: Use what's in the current conversation window
2. **Memento Semantic Search**: Query existing project knowledge

   ```javascript
   mcp_memento-mcp_semantic_search("express route validation", entity_types=["code-component"], limit=3)
   ```

1. **Ref-Tools Search**: Find current best practices and examples

   ```bash

   # Current HexTrackr codebase queries (PRIORITY - always current)

   ref.tools search "HexTrackr vulnerability deduplication logic"
   ref.tools search "HexTrackr server.js API endpoints current implementation"
   
   # External best practices

   ref.tools search "Node.js Express security middleware 2025"
   ref.tools search "SQLite database performance optimization"
   ```

1. **Context7 Cache**: Check offline documentation

   ```bash

   # Quick reference without web calls

   cat .context7/frameworks/express.md
   grep -n "middleware" .context7/frameworks/tabler.md
   ```

1. **Web Search**: Only if above sources insufficient

### MCP Tool Reference

- **Tool Documentation**: Enhanced multi-MCP architecture with Zen orchestration
- **Available Tools**:
  - **Zen MCP**: Multi-model analysis (zen analyze, debug, codereview, secaudit, testgen)
  - **Ref-Tools MCP**: Live documentation search with API key integration
  - **Memento MCP**: Knowledge graph with semantic search capabilities
  - **Context7 Cache**: Offline framework docs (Express, AG-Grid, Tabler, SQLite3)
  - **Codacy, GitHub, Playwright**: Quality, version control, and testing automation
- **Usage Patterns**: Zen for analysis → Ref-tools for patterns → Context7 for reference → Web if needed

### Memory Access Optimization Protocol

Follow this sequence for maximum token efficiency:

1. **Context First**: Use what's in the current conversation window
2. **Memento Semantic Search**: Query project-specific knowledge with entity type filters
3. **Ref-Tools Search**: Find current implementation patterns and best practices
4. **Context7 Offline**: Check cached framework documentation
5. **Progressive Expansion**: Only broaden search if needed after initial results

```javascript
// ENHANCED EFFICIENT PATTERN
// 1. Memento for project context
mcp_memento-mcp_semantic_search("express route validation", entity_types=["code-component"], limit=3)

// 2. Ref-tools for current practices AND current codebase
ref.tools search "HexTrackr server.js route validation current implementation"
ref.tools search "Express.js route validation middleware 2025"

// 3. Context7 for offline reference
cat .context7/frameworks/express.md | grep -A10 "validation"

// INEFFICIENT PATTERN - AVOID
mcp_memento-mcp_read_graph() // Returns everything - token expensive
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
- Use Memento semantic search with specific terms and entity type filters
- Query ref-tools for current best practices and implementation patterns
- Check Context7 offline cache for framework-specific patterns
- Limit initial results to 3-5 items to conserve tokens
- Store findings in Memento with proper entity types and relationships

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

- Add observations to relevant Memento entities with proper types
- Store successful patterns and solutions for future reference
- Document architecture decisions with relationships to affected components
- Create reminders for follow-up tasks

### 7. Log - Document Outcomes

- Store structured records in Memento with appropriate entity types
- Update project documentation to reflect changes
- Maintain the project roadmap with timeline updates

## Optimized Memory Taxonomy

| Knowledge Type | System | Query Method | Example | When to Use |
|---------------|--------|--------------|---------|------------|
| Code structure | Memento | `semantic_search` + type filter | `semantic_search("server endpoints", entity_types=["code-component"])` | Understanding implementation |
| Design decisions | Memento | `semantic_search` + type filter | `semantic_search("database schema design", entity_types=["decision"])` | Retrieving rationale |
| User preferences | Memento | `search_nodes` with name | `search_nodes("user_lonnie")` | Personalizing responses |
| Current patterns | Ref-Tools | Search query | `ref.tools search "Express.js middleware patterns 2025"` | Finding best practices |
| Framework docs | Context7 | File access | `cat .context7/frameworks/express.md` | Quick reference |
| Combined search | Multiple | Sequential query | Memento → Ref-tools → Context7 → Web | Comprehensive research |

## Versioning Standards

### Keep a Changelog

- **Format**: Follow [Keep a Changelog v1.0.0](https://keepachangelog.com/en/1.0.0/) format
- **File**: `CHANGELOG.md` must be updated for ALL releases
- **Sections**: Unreleased, Added, Changed, Deprecated, Removed, Fixed, Security
- **Badges**: [![Keep a Changelog](https://img.shields.io/badge/Keep%20a%20Changelog-v1.0.0-orange)](https://keepachangelog.com/en/1.0.0/)

### Semantic Versioning

- **Standard**: Follow [Semantic Versioning v2.0.0](https://semver.org/spec/v2.0.0.html)
- **Format**: MAJOR.MINOR.PATCH (e.g., 1.0.2)
- **Current Version**: See package.json for authoritative version number
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

## AI Agent Team Integration

**You are part of a collaborative AI agent ecosystem** with shared Memento knowledge graph access. The team includes:

### **Specialized Agents (Claude Environment)**

- **vulnerability-data-processor**: CSV imports, rollover logic, data validation
- **ui-design-specialist**: Frontend components, Tabler.io, AG-Grid optimization  
- **docs-portal-maintainer**: Documentation pipeline, technical writing
- **project-planner-manager**: Roadmaps, strategic planning, feature prioritization
- **github-workflow-manager**: CI/CD, releases, automation
- **database-schema-manager**: SQLite schema evolution, migration scripts

### **Zen MCP Orchestration**

**Enhanced Capabilities Available**:

- **Multi-Model Analysis**: 31 models including GPT-5, O3, Gemini 2.5 Pro
- **Systematic Workflows**: `zen analyze`, `zen debug`, `zen codereview`, `zen secaudit`
- **Test Generation**: `zen testgen` with comprehensive edge case coverage
- **Architecture Planning**: `zen planner` with revision and branching
- **Code Tracing**: `zen tracer` for execution flow and dependency mapping
- **Multi-Model Consensus**: `zen consensus` for complex decisions

**Delegation Strategy**: Use Zen tools for:

- Complex debugging requiring systematic investigation
- Multi-model code review and security audits
- Comprehensive test suite generation
- Architecture analysis and refactoring recommendations
- Pre-commit validation of changes

### **Shared Knowledge Base**

- **Memento Graph**: Stores architectural decisions, successful patterns, user preferences
- **Context Continuity**: All agents contribute to and benefit from shared project memory
- **Pattern Recognition**: Successful solutions automatically cataloged for team reuse
