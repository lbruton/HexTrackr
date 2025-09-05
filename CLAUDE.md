# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Core Commands

- `npm start` - Start the production server
- `npm run dev` - Start the development server with nodemon
- `npm run init-db` - Initialize the SQLite database

### Linting and Code Quality

- `npm run lint:all` - Run all linters (markdown, ESLint, Stylelint)
- `npm run fix:all` - Fix all linting issues automatically
- `npm run eslint` - Run ESLint on JavaScript files
- `npm run eslint:fix` - Fix ESLint issues
- `npm run stylelint` - Run Stylelint on CSS files
- `npm run stylelint:fix` - Fix Stylelint issues
- `npm run lint:md` - Run markdownlint on documentation
- `npm run lint:md:fix` - Fix markdown formatting issues

### Documentation and Analysis

- `npm run docs:generate` - Update HTML documentation
- `npm run docs:analyze` - Generate architecture analysis and update docs
- `npm run roadmap` - Generate project roadmap portal

### Important Notes

- **NEVER run Node.js locally** - Always use Docker containers
- Use `Dockerfile.node` (not the main Dockerfile)
- Server runs on port 8080 in Docker
- **Always restart Docker container before running Playwright tests**

## Architecture Overview

### Backend Architecture

HexTrackr uses a monolithic Node.js/Express server pattern:

- **Main Entry Point**: `server.js` (~1,200+ lines) - Handles both API routes and static file serving
- **Database**: SQLite with runtime schema evolution (`data/hextrackr.db`)
- **File Uploads**: Handled via multer, stored in `uploads/` directory with 100MB limit
- **Security**: PathValidator class prevents path traversal attacks, security headers on all responses
- **Middleware Stack**: CORS, compression, JSON/form parsing (100mb limits), multer for file uploads

### Vulnerability Rollover Architecture

Critical pattern for vulnerability data management:

- **Current Data**: `vulnerabilities_current` table holds deduplicated current state
- **Historical Snapshots**: `vulnerability_snapshots` preserves all import history  
- **Daily Aggregation**: `vulnerability_daily_totals` for trend analysis
- **Dedup Key**: `normalizeHostname(hostname) + CVE` (or `plugin_id + description` fallback)
- **Process Flow**: CSV import → temp file → Papa.parse → `processVulnerabilityRowsWithRollover()` → DB updates

### Frontend Architecture

Modular JavaScript pattern with clear separation:

- **Shared Components**: `scripts/shared/` - Reusable UI components and utilities
- **Page-Specific Code**: `scripts/pages/` - Individual page functionality  
- **Utilities**: `scripts/utils/` - Helper functions and data processing
- **Communication**: Pages use `window.refreshPageData(type)` for inter-module updates

### Database Schema

- **Location**: `data/hextrackr.db`
- **Initialization**: `scripts/init-database.js` for bootstrap, runtime evolution in `server.js`
- **Key Tables**:
  - `tickets` - Primary ticket data with JSON fields for devices/attachments
  - `vulnerabilities_current` - Deduplicated current vulnerability state
  - `vulnerability_snapshots` - Complete historical import records
  - `vulnerability_daily_totals` - Aggregated data for trend analysis
  - `vulnerability_imports` - Import metadata and audit trail
- **Evolution**: Idempotent ALTER statements handle schema changes
- **JSON Storage**: Complex fields stored as JSON strings (e.g., devices in tickets, attachments)

## Key Workflows

### Data Import System

Two primary import flows:

1. **CSV Upload**: Multipart form → temp file → Papa.parse → DB insert → cleanup
2. **JSON Import**: Direct JSON payload → DB insert (client-parsed CSV)

Both flows update `vulnerability_imports` table for audit trail and `vulnerabilities` table for active data.

### Integration Points

- **ServiceNow**: Configurable ticket integration via settings modal
- **Security Scanners**: CSV import support for various vulnerability scanners
- **Backup/Restore**: Complete data export/import system via API endpoints
- **Settings Modal**: Global configuration interface (`scripts/shared/settings-modal.js`)

## File Organization

### Critical Files

- `server.js:1-2000` - Main server implementation with all API routes
- `scripts/init-database.js` - Database schema and initialization logic
- `scripts/shared/settings-modal.js` - Global frontend utilities and data operations
- `docs-source/` - Source documentation (generates to `docs-html/`)

### Directory Structure

```
├── scripts/
│   ├── shared/     # Reusable components and utilities
│   ├── pages/      # Page-specific functionality
│   └── utils/      # Helper functions
├── data/           # SQLite database location
├── uploads/        # File upload storage
└── docs-source/    # Documentation source files
```

## Error Handling Patterns

### HTTP Response Conventions

- **400**: Bad input (missing files, invalid data)
- **500**: Database or processing errors
- **Success**: Always include `{ success: true }` with additional data

### Common Pitfalls

- `settings-modal.js` expects generic `/api/import` but server uses specific endpoints
- Ticket schema evolution means some deployments may lack newer columns
- File uploads have 100MB hard limit
- Always `unlink()` temporary files after processing
- SQLite file requires write permissions in `data/` directory

## Testing

### Playwright Tests

- **Prerequisites**: Docker container must be restarted before running tests (`docker-compose restart`)
- **Configuration**: Uses `@playwright/test` framework  
- **Requirements**: Tests expect `http://localhost:8080` and clean container state
- **Design**: Tests should be idempotent and handle existing data gracefully
- **Command**: `npx playwright test` (run inside or outside container)

## Code Conventions

### Security Requirements

- Use PathValidator class for all file operations
- Never expose sensitive data in logs or responses
- Validate all user inputs, especially file uploads and CSV data
- Implement proper error handling without information disclosure

### Database Interactions

- All schema changes must be idempotent ALTER statements in `server.js`
- Handle nullable columns for schema evolution compatibility
- **Sequential Processing**: Use sequential loops for row iteration to prevent race conditions (see `processVulnerabilityRowsWithRollover`)
- Store complex data as JSON strings with proper parsing/validation
- Use proper transaction handling for multi-table operations

### Documentation Updates

- When adding new docs sections, update the whitelist in `/docs-html` deep-link routing
- Run `npm run docs:generate` to update HTML documentation after markdown changes
- Use `npm run docs:analyze` to regenerate architecture analysis

### API Response Patterns  

- **Success**: Return JSON arrays/objects or `{ success: true, ...additional_data }`
- **Errors**: Use status 400 (bad input) or 500 (server errors) with `{ error: "message" }`
- **Dates**: Use ISO `YYYY-MM-DD` format for scan dates
- **Pagination**: Support `page`, `limit`, `search`, and filtering parameters

## Knowledge Management

### Memento MCP Integration

HexTrackr integrates with Memento MCP knowledge graph for persistent context sharing across AI assistants (Claude Desktop, Gemini, Codex, GitHub Copilot).

### Session Workflow

## At Session Start:

1. **Always use semantic search first**: `mcp__memento-mcp__semantic_search` with task-specific keywords (saves tokens vs full graph reads)
2. Review existing knowledge about current task area  
3. Only use `search_nodes` or `read_graph` if semantic search insufficient

## During Development:

1. Document significant decisions and patterns as they emerge
2. Record solutions to complex problems for future reference  
3. Update knowledge when discovering existing patterns or anti-patterns

## At Session End:

1. Capture new architectural insights and decisions
2. Document gotchas, edge cases, and solutions discovered
3. Record user preferences and workflow patterns

### What to Capture

## Essential Knowledge Types:

- **Architectural Decisions**: Why certain patterns were chosen, trade-offs made
- **Gotchas & Edge Cases**: Common pitfalls and their solutions (e.g., Docker-only deployment)
- **User Preferences**: Coding styles, workflow preferences, tool choices
- **Performance Patterns**: Solutions to scaling issues, optimization approaches
- **Integration Points**: How external systems connect, API patterns
- **Bug Fixes**: Root causes and solutions to prevent recurrence

## Example Usage:

```javascript
// Before implementing new feature
mcp__memento-mcp__semantic_search("vulnerability rollover architecture patterns")

// After solving complex problem
mcp__memento-mcp__create_entities([{
  name: "CSV Import Memory Leak Fix",
  entityType: "bug_fix", 
  observations: ["Root cause: Papa.parse not releasing large file handles...", "Solution: Stream processing with cleanup callbacks"]
}])
```

### Knowledge Graph Hygiene

- Use consistent entity types: `architecture_decision`, `bug_fix`, `user_preference`, `integration_pattern`
- Write observations in past tense for completed work, present tense for current state
- Link related entities with meaningful relationship types
- Update existing entities rather than creating duplicates

## Unified AI Development Workflow

### Orchestration Strategy (Updated September 5, 2025)

HexTrackr uses a unified AI development workflow with Claude Code as the central command center:

**Claude Code (Central Hub)**:

- Primary orchestrator with unlimited context for complex planning and implementation
- Executes multi-step development tasks, UI/UX improvements, and architectural changes
- Maintains project coherence through Memento MCP + PAM knowledge systems
- Manages documentation, testing strategies, and cross-tool coordination

**Task Delegation Framework**:

1. **GitHub Copilot** (5-30 minutes) - Quick fixes and completions
   - Single-file modifications and bug fixes
   - Code completion and inline improvements
   - Unit test writing and simple refactoring
   - Has access to PAM for session continuity

1. **Claude Desktop Agents** (30-90 minutes) - Specialized tasks
   - `vulnerability-data-processor`: CSV imports, deduplication, rollover processes
   - `ui-design-specialist`: UI enhancements with Playwright testing integration
   - `docs-portal-maintainer`: Documentation updates with knowledge persistence
   - `database-schema-manager`: SQLite migrations and integrity checks
   - `cisco-integration-specialist`: API integrations and sync operations

1. **Google Gemini CLI** (2+ hours) - Large context analysis
   - Major refactoring requiring full codebase analysis
   - Complex architectural changes across multiple files
   - Performance optimization requiring deep analysis
   - Uses `/dev-docs/session-handoff.json` for context transfer

1. **OpenAI Codex** (1-2 hours) - Maintenance and cleanup
   - Code style standardization and formatting
   - Dependency updates and security patches
   - Test coverage improvements and documentation generation
   - Uses `/dev-docs/session-handoff.json` for context transfer

### Session Handoff Protocol

For tools without memory access (Gemini, Codex), use `/dev-docs/session-handoff.json`:

```json
{
  "timestamp": "2025-09-05T12:00:00Z",
  "from_tool": "claude-code",
  "to_tool": "gemini-cli",
  "task_context": "Description of task being handed off",
  "project_state": {
    "current_version": "1.0.4",
    "active_sprint": "v1.0.5 Foundation Sprint",
    "recent_changes": ["modal fixes", "table resizing", "pagination"],
    "next_priorities": ["hostname normalization", "chart improvements"]
  },
  "files_modified": ["/path/to/files"],
  "testing_status": "all tests passing",
  "notes": "Any specific context or gotchas"
}
```

### Memory System Integration

- **Start every session**: Use `mcp__memento-mcp__semantic_search` first for context
- **During development**: Document decisions and patterns as they emerge
- **Session end**: Store achievements, solutions, and next priorities
- **Cross-tool awareness**: PAM automatically records all VSCode Copilot interactions

This workflow ensures context continuity while optimizing each tool's strengths for maximum development efficiency.
