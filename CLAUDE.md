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
**Database**: SQLite (DELETE journal mode) at `/app/data/hextrackr.db`
**Services**: 20 service files | **Routes**: 14 route modules

**Core Services** (17 total):

* **DatabaseService**: `services/databaseService.js:23` (DELETE journal mode, backup/restore, schema migrations)
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

**Database Tables** (15 core):

* **tickets**: Field operations ticketing (6500+ records, soft delete)
* **vulnerabilities**: Primary vuln data (3000+ CVEs)
* **vulnerabilities_affected_devices**: Many-to-many device mapping
* **vulnerabilities_affected_locations**: Many-to-many location mapping
* **daily_totals**: Historical trend aggregation (365-day retention)
* **kev_status**: CISA KEV correlation (1200+ exploited vulns)
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

**Vendor Advisory Sync Status** (October 2025):

**Cisco PSIRT** (70 of 88 CVEs synced):
- **70 advisories synced**: 70 with fixes, 0 no fix available
- **18 CVEs not applicable**: Ancient CVEs (1999-2001) predate Cisco PSIRT API coverage
- Count logic uses `cisco_fixed_versions` table (normalized schema from Migration 007)
- **Expected**: Not all CVEs will sync - API coverage starts ~2010

**Palo Alto Security Advisory** (21 of 32 CVEs synced):
- **21 advisories synced**: 20 with fixes, 1 no fix available
- **11 CVEs not applicable**: Generic SSH/crypto CVEs not specific to PAN-OS
- Count logic excludes empty `first_fixed` arrays (legitimate "no fix yet" cases)
- **Expected**: Generic infrastructure CVEs (OpenSSH, OpenSSL) won't sync

**Counting Rules** (Applied October 2025):
- `totalAdvisories`: ALL synced CVEs (including those with `first_fixed: []`)
- `matchedCount`: CVEs with at least one fixed version
- `noFixAvailable`: Synced CVEs with `first_fixed: []` (legitimate, not errors)
- `unsyncedCount`: CVEs that will never sync (not in vendor APIs)

**Quality**: ESLint 9+ | Codacy A+ (12 security issues pending triage)

**Key Commands**:

* Dev: `npm run dev` or `docker-compose up`
* Test Production: Access via `https://hextrackr.com` (NEVER use HTTP)
* Lint: `npm run lint`
* Docs: `npm run docs:generate`
* Database: `npm run db:backup`, `npm run db:restore`, `npm run db:migrate`

## Coding Style & Naming Conventions
- JavaScript: 4-space indentation, double quotes, required semicolons (`@stylistic/quotes` and `@stylistic/semi`). Prefer `const`/`let`; `no-var` is enforced.
- Lint errors block CI; run `npm run eslint:fix` and `npm run stylelint:fix` before committing CSS or JS-heavy changes.
- Folder naming mirrors feature areas (e.g., `controllers`, `services`); add new modules under the closest existing category for discoverability.

## Security & Configuration Tips
- Generate a strong `SESSION_SECRET` (`node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`) and store cert paths when enabling HTTPS (`USE_HTTPS=true` with `./scripts/setup-ssl.sh`).
- Never commit files from `/secrets`, `/certs`, `hextrackr.db`, or any `.env`; add new sensitive paths to `.gitignore` where necessary.

---

### SRPI (Specification → Research → Plan → Implement)
**Use for**: New features, user-facing enhancements, cross-system changes
- **Specification + Research** (combined phase): Define WHY (user requirements) + discover WHAT (codebase integration points, risks)
- **Plan**: Define HOW using Context7 standards, Codacy linting, proper frameworks
- **Implement**: Break into bite-sized sessions, use specialized agents, checkpoint/rewind workflow
- Full process guide: `/docs/SRPI/SRPI_PROCESS.md`
- Templates: `/docs/SRPI/TEMPLATE_*.md` (Specification, Research, Plan, Implement, Changelog)

---

## Additional Documentation

**Core Reference**:
- MCP Tools Guide: `/docs/MCP_TOOLS.md`
- Taxonomy: `TAXONOMY.md` (Memento entity naming)

**Workflow Guides**:
- SRPI Process: `/docs/SRPI_PROCESS.md`
- CHANGELOG and Version Bump: `/docs/CHANGELOG AND VERSION BUMP PROCESS.md`

**Changelogs**:
- Location: `/app/public/docs-source/changelog/versions/`
- Format: Each version gets its own file (e.g., `1.0.67.md`)
- Index: `/app/public/docs-source/changelog/index.md` (links to all versions)
- Template: `/docs/SRPI/TEMPLATE_CHANGELOG.md`
- **Version Strategy**: Each HEX-254 session gets a new patch version
  - Session 3 → v1.0.67
  - Session 4 → v1.0.68
  - Session 5 → v1.0.69 (etc.)

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
1. `/codebase-search` - Fast semantic search (if codebase indexed) - USE FIRST
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





