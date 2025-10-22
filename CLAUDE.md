# CLAUDE.md

This file provides core guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**HexTrackr** is an enterprise vulnerability management system built with Node.js/Express backend and vanilla JavaScript frontend. The application tracks security vulnerabilities, maintenance tickets, and CISA KEV (Known Exploited Vulnerabilities) data with real-time WebSocket updates. Provides a Ticketing Bridge system to allow users to cordinate field operations between two independent teams.

**Current Version**: See root `package.json` (auto-synced to 5 files via `npm run release`)

**URL** https://dev.hextrackr.com 

---

## 📊 Technical Baseline

**Architecture**: Modular MVC (controllers → services → database)
**Runtime**: Node.js 18+ (4GB heap) | **Docker**: hextrackr service on port 8989
**Database**: SQLite (WAL journal mode, Docker named volume) at `/app/data/hextrackr.db`
**Services**: 20 service files | **Routes**: 14 route modules

## Core Services

* **DatabaseService**: `services/databaseService.js:23` (WAL journal mode with Docker named volume isolation, backup/restore, schema migrations)
* **LoggingService**: `services/loggingService.js:45` (category-based, rotating logs, audit trail)
* **VulnerabilityService**: `services/vulnerabilityService.js:67` (CRUD + stats aggregation)
* **TicketService**: `services/ticketService.js:89` (full CRUD, soft delete, field operations ticketing)
* **BackupService**: `services/backupService.js:34` (automated backups, retention policy)
* **ImportService**: `services/importService.js:12` (CSV import with validation)
* **TemplateService**: `services/templateService.js:56` (email/ticket/vulnerability templates)
* **AuthService**: `services/authService.js:78` (Argon2id password hashing, session management)
* **PreferencesService**: `services/preferencesService.js:23` (cross-device user settings)
* **KevService**: `services/kevService.js:45` (CISA KEV integration, 24h background sync)
* **CiscoService**: `services/ciscoService.js:123` (OAuth2, PSIRT API, advisory parsing)
* **PaloAltoService**: `services/paloAltoService.js:89` (advisory scraping, version matching)
* **CacheService**: `services/cacheService.js:12` (in-memory TTL cache, 5-min default)
* **FileService**: `services/fileService.js:34` (safe file operations, path validation)
* **LocationService**: `services/locationService.js:45` (site aggregation, hostname parsing)
* **DocsService**: `services/docsService.js:23` (markdown rendering, version docs)
* **HostnameParserService**: `services/hostnameParserService.js:15` (Pattern 1/2/3 hostname normalization)

## Database Tables

* **tickets**: Field operations ticketing (soft delete)
* **vulnerabilities**: Primary vuln data
* **vulnerabilities_affected_devices**: Many-to-many device mapping
* **vulnerabilities_affected_locations**: Many-to-many location mapping
* **daily_totals**: Historical trend aggregation (365-day retention)
* **kev_status**: CISA KEV correlation tracking
* **cisco_advisories**: Cisco PSIRT advisories (OAuth2 synced)
* **palo_alto_advisories**: Palo Alto security bulletins (web scraped)
* **users**: Authentication (Argon2id hashed passwords)
* **user_preferences**: Cross-device settings (JSON blob)
* **email_templates**: Notification templates (4 types)
* **ticket_templates**: Field ops markdown templates (restored in [HEX-286](https://linear.app/hextrackr/issue/HEX-286/ticket-markdown-templates-truncated-in-database))
* **vulnerability_templates**: CVE templates
* **backup_metadata**: Backup history with retention policy
* **audit_logs**: [HEX-254](https://linear.app/hextrackr/issue/HEX-254/implement-unified-logging-system-with-audit-trail) logging system (Session 10/14 complete)
* **cisco_fixed_versions**: Normalized Cisco fixed versions (HEX-287 Migration 007)



## Key Commands

* Lint: `npm run lint`
* Docs: `npm run docs:generate`
* Database: `npm run db:backup`, `npm run db:restore`, `npm run db:migrate`

## Testing & Development

**Docker Service**: HexTrackr runs in Docker container `hextrackr` on port 8989
**Access URL**: https://dev.hextrackr.com (Docker must be running)
**Database Location**: Inside Docker volume `hextrackr-database` (NOT in project directory)

**Testing Workflow**:
- **Frontend changes**: Refresh browser (no restart needed)
- **Backend changes**: `docker-compose restart hextrackr` (or `docker restart hextrackr`)
- **Database changes**: Use `npm run db:migrate` (runs inside container)

**Important**: Do NOT run `npm run dev` for testing - Docker is already running the server.
Only use `npm run dev` if you're testing without Docker (rare).

## Coding Style & Naming Conventions
- JavaScript: 4-space indentation, double quotes, required semicolons (`@stylistic/quotes` and `@stylistic/semi`). Prefer `const`/`let`; `no-var` is enforced.
- Lint errors block CI; run `npm run eslint:fix` and `npm run stylelint:fix` before committing CSS or JS-heavy changes.
- Folder naming mirrors feature areas (e.g., `controllers`, `services`); add new modules under the closest existing category for discoverability.

---

### SRPI (Specification → Research → Plan → Implement)
**Use for**: New features, user-facing enhancements, cross-system changes
- **Specification + Research** (combined phase): Define WHY (user requirements) + discover WHAT (codebase integration points, risks)
- **Plan**: Define HOW using Context7 standards, Codacy linting, proper frameworks
- **Implement**: Break into bite-sized sessions, use specialized agents, checkpoint/rewind workflow
- Full process guide: `/docs/SRPI_PROCESS.md`
- Templates: `/docs/TEMPLATE_*.md` (Specification, Research, Plan, Implement, Changelog)

---

## Additional Documentation

**Core Reference**:
- MCP Tools Guide: `/docs/MCP_TOOLS.md`
- Taxonomy: `/docs/TAXONOMY.md` (Memento entity naming)

**Workflow Guides**:
- SRPI Process: `/docs/SRPI_PROCESS.md`
- CHANGELOG and Version Bump: `/docs/CHANGELOG AND VERSION BUMP PROCESS.md`

**Changelogs**:
- Location: `/app/public/docs-source/changelog/versions/`
- Format: Each version gets its own file (e.g., `1.0.67.md`)
- Index: `/app/public/docs-source/changelog/index.md` (links to all versions)
- Template: `/docs/TEMPLATE_CHANGELOG.md`
- **Version Strategy**: Each HEX-254 session gets a new patch version
  - Session 3 → v1.0.67
  - Session 4 → v1.0.68
  - Session 5 → v1.0.69 (etc.)

---

## Git Branch Workflow

**CRITICAL**: `main` branch is **PROTECTED** - never merge directly to main

**Branch Strategy**:
- `dev`: Development branch (default, merge feature branches here)
- `main`: Production branch (protected, deploy-only)
- `feature/*`: Feature branches (create from dev, merge back to dev)

**Workflow**:
1. Create feature branch from `dev`: `git checkout -b feature/hex-XXX-description`
2. Develop and commit to feature branch
3. Merge feature branch to `dev`: `git checkout dev && git merge feature/hex-XXX-description`
4. Deploy `dev` to staging/development environment
5. After validation, deploy `dev` to production (updates `main` via deployment process)

**Example**:
```bash
git checkout dev
git checkout -b feature/hex-267-supervisor-tech-normalization
# ... make changes, commit ...
git checkout dev
git merge feature/hex-267-supervisor-tech-normalization
git push origin dev
```

**Production Deployment**: Code flows dev → production deployment (not dev → main merge)

---

## Linear Issue Tracking

**Team**: HexTrackr-Dev (primary development team)
**Workflow**: Use Linear MCP (`mcp__linear-server__*`) to track all planning, tasks, and implementations
**When to Use**: Check Linear for current work context, update issue status during sessions, link commits to issue IDs (e.g., `HEX-297`)
**Status Flow**: Backlog → Todo → In Progress → In Review → Done

---

## Specialized Subagents

**Purpose**: Offload complex searches to isolated context windows - preserves main session tokens for actual implementation work

**Search Strategy** (use in this order to avoid assumptions):
1. `/codebase-search` - Fast semantic search (if codebase indexed) - USE FIRST, If index is older than 8 hours use `/codebase-index` to re-index. 
2. **Explore agent** - Grep/glob-based keyword search (fallback if index unavailable)
3. **codebase-navigator** - Custom agent combining claude-context semantic search + file reads for comprehensive architectural analysis

**Available Agents**:
- **Explore** ⭐ (Claude Code built-in): Keyword/pattern search via Grep/Glob/Read (thoroughness: quick/medium/"very thorough")
- **codebase-navigator** ⭐ (HexTrackr custom): claude-context semantic search + targeted file reads - prevents building features on assumptions
- **linear-librarian**: Cross-team Linear issue research, status intelligence
- **memento-oracle**: Historical pattern mining from knowledge graph
- **hextrackr-fullstack-dev**: Feature implementation with Five Whys, JSDoc standards, pattern reuse

**CRITICAL**: Never assume code exists or works a certain way - always search first using one of the above strategies

**Why Use Agents**: Offload 20-50K token searches to isolated context windows - preserve main session for actual implementation

**Usage**: `Task(subagent_type: "Explore", prompt: "Find all WebSocket event handlers, thoroughness: medium")`

---

## Context Retrieval Strategy

**Three-Tier Search Hierarchy** - Use these tools in order to maximize efficiency and prevent rebuilding solved problems:

**1. Memento First (Historical Context)** - Query the knowledge graph using `mcp__memento__semantic_search` to find past implementations, architectural decisions, and lessons learned. Use temporal tags to filter: `week-42-2025`, `v1.0.93`, `q4-2025`. Example queries: "modal design patterns unified system", "SRPI workflow scope reduction", "vendor aggregation deduplication bugs". **Why**: Prevents assumption-based development - the HEX-190-193 SRPI cycle revealed 90% of infrastructure already existed, reducing 8 tasks to 4 tasks by searching Memento first.

**2. Claude-Context Second (Current Codebase)** - Use `/codebase-search` for semantic code lookup (275 files, 3280 chunks, last updated 10/18/2025). Example queries: "WebSocket authentication session", "AG-Grid theme configuration", "vendor normalization helpers". Falls back to **Explore agent** (grep/glob) if index unavailable. **Why**: Verifies file:line locations with precision - HEX-155/156 research caught 49-line discrepancies that would have caused implementation failures.

**3. Specialized Agents Third (Deep Analysis)** - Deploy **codebase-navigator** for comprehensive architectural analysis combining semantic search + targeted file reads. Runs in isolated context (saves 20-50K tokens in main session). Deploy **memento-oracle** for historical pattern mining across multiple sessions. **Why**: Prevents architectural misidentification - HEX-156 caught nginx vs Express node-cache confusion that would have invalidated entire implementation strategy.

**SRPI Integration Pattern**:
- **RESEARCH Phase**: Memento search ("have we solved this before?") → claude-context search ("where is this implemented?") → codebase-navigator ("how does this work?")
- **PLAN Phase**: Verify ALL assumptions from RESEARCH using claude-context semantic search (NO ASSUMPTIONS rule)
- **IMPLEMENT Phase**: Use Linear issue descriptions (HEX-XXX) as authoritative source, update descriptions not comments

**Temporal Filtering**: Memento graph contains 497K+ tokens across 100+ sessions. Use taxonomy tags to filter: `TAG: week-XX-2025` for recent work, `TAG: breakthrough` for critical patterns, `TAG: lesson-learned` for anti-patterns, `TAG: reusable` for cross-project patterns. Query recent context: `semantic_search("modal patterns", entity_types: ["HEXTRACKR:FRONTEND:PATTERN"], hybrid_search: true)`.

---

## MCP Tools & Slash Commands

### Codebase Indexing & Search (claude-context MCP)

**Index the Codebase**:
```
/codebase-index
```
Uses `mcp__claude-context__index_codebase` with:
- `path`: `/Volumes/DATA/GitHub/HexTrackr`
- `splitter`: `ast` (AST-based code splitting, recommended) or `langchain` (character-based)
- `force`: `true` (for full reindex when out of date)

**Search the Codebase**:
```
/codebase-search <natural language query>
```
Uses `mcp__claude-context__search_code` with:
- `path`: `/Volumes/DATA/GitHub/HexTrackr`
- `query`: Natural language search query
- `limit`: 10 (default, max 50)
- `extensionFilter`: Optional array like `[".js", ".css"]`

**Check Index Status**:
```
/codebase-status
```
Uses `mcp__claude-context__get_indexing_status` to show:
- Index completion status (completed/in-progress)
- File count and chunk statistics
- Last update timestamp
- Progress percentage (if indexing)

**When to Use**:
- Use `/codebase-search` before exploring local files for better context efficiency
- Reindex with `/codebase-index` after major structural changes
- Check `/codebase-status` to verify index freshness (currently: 275 files, 3280 chunks)

---





