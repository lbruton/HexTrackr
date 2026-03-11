# CLAUDE.md

This file provides core guidance to Claude Code (claude.ai/code) when working with code in this repository.

> See `~/.claude/CLAUDE.md` for global workflow rules (push safety, version checkout gate, PR lifecycle, MCP tools, code search tiers, UI design workflow, plugins).

## Project Overview

**HexTrackr** is an enterprise vulnerability management system built with Node.js/Express backend and vanilla JavaScript frontend. The application tracks security vulnerabilities, maintenance tickets, and CISA KEV (Known Exploited Vulnerabilities) data with real-time WebSocket updates. Provides a Ticketing Bridge system to allow users to cordinate field operations between two independent teams.

**Current Version**: See root `package.json` (auto-synced to 5 files via `npm run release`)

**Access Points**:

- **Application**: https://hextrackr.com (production, via NPM reverse proxy)
- **Dev alias**: https://dev.hextrackr.com (same instance, alternate domain)
- **User Documentation**: https://hextrackr.com/docs-html/ (markdown → HTML, 130+ files)
- **JSDoc API Reference**: https://hextrackr.com/dev-docs-html (inline code comments → HTML)

**Future Direction**: Migration to Turso hosted DB, eventual "bring your own backend" public web app with cloud sync credentials replacing admin/user auth.

## Technical Baseline

**Architecture**: Modular MVC (controllers → services → database)
**Runtime**: Node.js 18+ (4GB heap) | **Docker**: hextrackr service on port 8989
**Database**: SQLite (WAL journal mode, Docker named volume) at `/app/app/data/hextrackr.db`
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
* **ticket_templates**: Field ops markdown templates
* **vulnerability_templates**: CVE templates
* **backup_metadata**: Backup history with retention policy
* **audit_logs**: Logging system with AES-256-GCM encryption
* **audit_log_config**: Encryption key storage and retention policy configuration
* **cisco_fixed_versions**: Normalized Cisco fixed versions (HEX-287 Migration 007)

## Key Commands

* Lint: `npm run lint`
* Docs: `npm run docs:generate`
* Database: `npm run db:backup`, `npm run db:restore`, `npm run db:migrate`

## Audit Log System (HEX-254)

**Admin Access**: Settings modal → "View Audit Logs" button (admin users only)
**Features**: AES-256-GCM encrypted audit trail with filtering, search, CSV/JSON export
**Categories Tracked**: Authentication, Tickets, Imports, Backups, System
**Documentation**: See `/docs/LOGGING_SYSTEM.md` for complete developer guide

## Deployment Architecture

> Infrastructure details (IPs, ports, stack IDs, proxy hosts, SSL certs) live in **DocVault** — see `[[HexTrackr Overview]]`, `[[Portainer]]`, `[[NPM]]`, `[[Stack Registry]]`.

**Deploy Pattern**: PR to `dev` → merge → Portainer redeploy (pulls latest, rebuilds image, restarts).
Redeploy via API: `PUT /api/stacks/11/git/redeploy?endpointId=3` with `SESSION_SECRET` env var.
Redeploy via UI: Stacks → hextrackr → Pull and redeploy.

**Secrets**: `SESSION_SECRET` injected as Portainer env var (source: Infisical key `HEXTRACKR_SESSION_SECRET`).

**Volume Mounts** (all named volumes, no bind mounts for data):

- `hextrackr-database` → `/app/app/data` (SQLite DB — MUST be /app/app/data, not /app/data)
- `hextrackr-backups` → `/app/backups`
- `hextrackr-uploads` → `/app/app/uploads`
- `./config` → `/app/config:ro` (from repo)

**CRITICAL**: Database volume mounts at `/app/app/data` because server.js resolves the default DB path via `path.join(__dirname, '..', 'data', 'hextrackr.db')` from `/app/app/public/server.js` → `/app/app/data/hextrackr.db`. Do NOT set `DATABASE_PATH` env var — let the app use its default.

## Testing & Development

**Production (Portainer)**: Container `hextrackr-app` on Portainer VM, accessed via https://hextrackr.com
**Testing after deploy**: PR to `dev` → merge → redeploy in Portainer → test at https://hextrackr.com

**Important**: Do NOT run `npm run dev` for testing — Docker is already running the server.
**No local dev compose**: The single `docker-compose.yml` is production-oriented (no bind mounts, no nginx sidecar). Local development uses the Portainer deploy cycle.

## Coding Style & Naming Conventions

- JavaScript: 4-space indentation, double quotes, required semicolons. Prefer `const`/`let`; `no-var` is enforced.
- Lint errors block CI; run `npm run eslint:fix` and `npm run stylelint:fix` before committing.

### SRPI (Specification → Research → Plan → Implement)

**HexTrackr uses SRPI, see `/docs/SRPI_PROCESS.md`** — this is a project-specific override to the global spec-workflow.

**Use for**: New features, user-facing enhancements, cross-system changes

- **Specification + Research** (combined phase): Define WHY + discover WHAT
- **Plan**: Define HOW using Context7 standards, Codacy linting, proper frameworks
- **Implement**: Break into bite-sized sessions, use specialized agents, checkpoint/rewind workflow
- Templates: `/docs/TEMPLATE_*.md`

## Additional Documentation

**Location**: All reference documentation is in `/docs/` folder. Use `/codebase-search` for semantic search.

**Quick Reference Map**:

- **MCP Tools Guide**: `/docs/MCP_TOOLS.md`
- **Taxonomy**: `/docs/TAXONOMY.md` — (archived, historical reference only)
- **Git Workflow**: `/docs/GIT_WORKFLOW.md`
- **SRPI Process**: `/docs/SRPI_PROCESS.md`
- **CHANGELOG and Version Bump**: `/docs/CHANGELOG AND VERSION BUMP PROCESS.md`
- **CSS Coding Standards**: `/docs/CSS_CODING_STANDARDS.md`
- **Logging System**: `/docs/LOGGING_SYSTEM.md`
- **Cisco Advisory Architecture**: `/docs/CISCO_ADVISORY_ARCHITECTURE.md`
- **Schema Evolution**: `/docs/SCHEMA_EVOLUTION.md`
- **RHEL Deployment** (archived — RHEL VM 102 decommissioned): `/docs/RHEL_DEPLOYMENT_GUIDE.md`, `/docs/RHEL_QUICK_REFERENCE.md`, `/docs/DEPLOYMENT_RHEL10.md`

## Changelog Rolling Window

- Location: `/app/public/docs-source/changelog/versions/`
- Each version gets its own file (e.g., `1.0.67.md`)
- MUST include YAML frontmatter (title, date, version, status, category) and Overview section
- `index.md` and `archive.md` are AUTO-GENERATED — never manually edit
- Run `npm run docs:generate` after adding new version files

**Documentation System**: ALL edits in markdown under `/app/public/docs-source/`. HTML files are build artifacts.

## Git Branch Workflow

**CRITICAL**: `main` branch is **PROTECTED** — never merge directly to main

- `dev`: Development branch (default)
- `main`: Production branch (protected, deploy-only)
- `feature/*`: Feature branches (create from dev, merge back to dev)

## Linear Issue Tracking

**Team**: HexTrackr-Dev (primary development team)
**Status Flow**: Backlog → Todo → In Progress → In Review → Done

## Code Search

> See global `~/.claude/CLAUDE.md` for the full code search tier order (HARD GATE).

**Project search path**: `/Volumes/DATA/GitHub/HexTrackr`

**CRITICAL**: Never assume code exists or works a certain way — always search first.

## Memory Backend

**Active**: mem0 cloud (`mcp__mem0__*`) with `agent_id: "hextrackr"` for project-scoped memories.
