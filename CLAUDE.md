# CLAUDE.md

This file provides core guidance to Claude Code (claude.ai/code) when working with code in this repository.

> See `~/.claude/CLAUDE.md` for global workflow rules (push safety, version checkout gate, PR lifecycle, MCP tools, code search tiers, UI design workflow, plugins).

## Project Overview

**HexTrackr** is an enterprise vulnerability management system built with Node.js/Express backend and vanilla JavaScript frontend. The application tracks security vulnerabilities, maintenance tickets, and CISA KEV (Known Exploited Vulnerabilities) data with real-time WebSocket updates. Provides a Ticketing Bridge system to allow users to cordinate field operations between two independent teams.

**Current Version**: See root `package.json` (auto-synced to 5 files via `npm run release`)

**Access Points**:

- **Application**: https://hextrackr.lbruton.cc (production, Cloudflare Zero Trust tunnel, team 2FA)
- **Legacy aliases**: hextrackr.com, dev.hextrackr.com (NPM reverse proxy, home network only)

**Status**: Stable production system undergoing v2 planning. SQLite is the current database; PostgreSQL under evaluation for v2.

## Technical Baseline

**Architecture**: Modular MVC (controllers → services → database)
**Runtime**: Node.js 22 LTS (4GB heap via `NODE_OPTIONS`) | **Docker**: hextrackr service on port 8989 → container 8080
**Database**: SQLite (WAL mode) at `/app/app/data/hextrackr.db`. Driver: `sqlite3` (callback API, verbose mode). Session store: `better-sqlite3-session-store`. Do NOT set `DATABASE_PATH` env var.
**Code inventory**: 20 services | 17 routes (16 mounted + `auditLogs.js` orphan) | 14 controllers | 21 unique `CREATE TABLE` in source

## Documentation

**DocVault master index**: `/Volumes/DATA/GitHub/DocVault/INDEX.md`
**Project index**: `/Volumes/DATA/GitHub/DocVault/Projects/HexTrackr/_Index.md`

**Tier 1 — Foundation docs** (start here). Canonical pages at `DocVault/Projects/HexTrackr/Foundation/`:

| File | When to read |
|---|---|
| `infrastructure.md` | Deploy, Cloudflare tunnel, NPM, Portainer stack 11, Docker volumes, secrets |
| `architecture.md` | Backend MVC, services/routes/controllers, SQLite WAL, WebSocket, middleware order |
| `coding-standards.md` | JS/CSS conventions, git workflow, gitleaks hook, logging, versioning |
| `design-philosophy.md` | Theme architecture, `data-bs-theme` toggle, CSS variables |
| `reusable-patterns.md` | Backend/frontend utilities, MCP usage, HostnameParser patterns |
| `api-reference.md` | REST endpoints, Argon2id auth, CSRF, rate limits, CORS |
| `integrations.md` | Cisco PSIRT OAuth2, CISA KEV, Palo Alto advisories, sync scheduler |

**Tier 2 — Deep dives.** Topic docs at `DocVault/Projects/HexTrackr/` — referenced from foundation docs via `[[wikilinks]]`. Archived retired docs live in `Archived/`.

**Tier 3 — Source code.** When foundation doc disagrees with code, code wins. Run `/vault-drift` periodically.

**Documentation quality**: Use `/obsidian-cli` or `/obsidian-markdown` for DocVault maintenance. Never edit DocVault files without proper frontmatter (tags, created, updated). Run `/vault-reconcile` for structural drift.

## Core Services

Key services to know: `databaseService.js` (SQLite WAL, sqlite3 callback API), `authService.js` (Argon2id — memoryCost 65536, timeCost 3, parallelism 4), `ciscoAdvisoryService.js` (OAuth2 PSIRT), `hostnameParserService.js` (Pattern 1/2/3 normalization), `loggingService.js` (AES-256-GCM encrypted audit trail).

## Key Commands

* Lint: `npm run lint:all`
- Database: `npm run db:cleanup`, `npm run db:seed:create`, `npm run db:seed:validate`

## Audit Log System (HEX-254)

**Admin Access**: Settings modal → "View Audit Logs" button (admin users only)
**Features**: AES-256-GCM encrypted audit trail with filtering, search, CSV/JSON export
**Categories Tracked**: Authentication, Tickets, Imports, Backups, System
**Documentation**: See DocVault `[[Logging System]]` for complete developer guide

## Deployment Architecture

> Infrastructure details (IPs, ports, stack IDs, proxy hosts, SSL certs) live in **DocVault** — see `[[HexTrackr Overview]]`, `[[Portainer]]`, `[[NPM]]`, `[[Stack Registry]]`.

**Primary access**: https://hextrackr.lbruton.cc via Cloudflare Zero Trust tunnel (team 2FA, 8 members). Also accessible at https://hextrackr.com (NPM reverse proxy, home network).

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

**Production (Portainer)**: Container `hextrackr-app` on Portainer VM, accessed via https://hextrackr.lbruton.cc
**Testing after deploy**: PR to `dev` → merge → redeploy in Portainer → test at https://hextrackr.lbruton.cc

**Local dev build**: Run `docker build -t hextrackr-local .` to verify the image builds. For testing application behavior, use the Portainer deploy cycle — do NOT run `npm run dev` or `node` directly, as the app expects the Docker environment (volume mounts, env vars).

**No local dev compose**: The single `docker-compose.yml` is production-oriented (no bind mounts, no nginx sidecar). Local development uses the Portainer deploy cycle.

## Coding Style & Naming Conventions

- JavaScript: 4-space indentation, double quotes, required semicolons. Prefer `const`/`let`; `no-var` is enforced.
- Lint errors block CI; run `npm run eslint:fix` and `npm run stylelint:fix` before committing.

## Development Process

**HexTrackr uses the global spec-workflow** for features and enhancements:

```
/chat (Phase 0) → Issue → /discover (Phase 1) → /spec (Phase 2-4) → /retro (Phase 5)
```

Bug fast path: `/systematic-debugging` → issue → fix (skip Phases 0-2).
Casual path: `/gsd` — no issue, no spec, `chore:` PR.

See `~/.claude/CLAUDE.md` for the full Spec Flow Lifecycle. SpecFlow config at `.specflow/config.json`.

## Version & Release

Version bump via `/release patch` before any PR with runtime code changes. The project-level `/release` skill (`.claude/skills/release/`) overrides the user-level `/release` and manages changelog version files at `/app/public/docs-source/changelog/versions/`. Each version file requires YAML frontmatter (title, date, version, status, category) and an Overview section. `index.md` and `archive.md` are auto-generated — never manually edit.

## User-Facing Documentation

User docs live in `/app/public/docs-source/` (guides, reference, changelog). HTML files at `/app/public/docs-html/` are build artifacts generated by `html-content-updater.js`.

> **Note**: JSDoc dev documentation (`npm run docs:dev`) is being retired (HEX-384). Do not invest in JSDoc config or output — developer/technical docs belong in DocVault.

## Git Branch Workflow

**CRITICAL**: `main` branch is **PROTECTED** — never merge directly to main

- `dev`: Development branch (default)
- `main`: Production branch (protected, deploy-only)
- `feature/*`: Feature branches (create from dev, merge back to dev)

## Issue Tracking

Issues tracked in DocVault vault. Prefix: `HEX` (see `issue` skill).
**Status Flow**: backlog → todo → in-progress → in-review → done

## Hooks

- **Active hook**: `.githooks/pre-commit` (enforced via `core.hooksPath .githooks`). Three layers, all in one script:
  1. Markdown auto-fix (`npm run lint:md:fix`)
  2. Stylelint auto-fix + ESLint warning check
  3. **gitleaks** secret scan (installed OPS-116, commit `62028a51`, 2026-04-14)
- `.pre-commit-config.yaml` does NOT exist — conflicts with `core.hooksPath` so gitleaks was inlined into the existing `.githooks/pre-commit` instead of using the `pre-commit` framework.

## Code Search

> See global `~/.claude/CLAUDE.md` for the full code search tier order (HARD GATE).

**Project search path**: `/Volumes/DATA/GitHub/HexTrackr`

**CRITICAL**: Never assume code exists or works a certain way — always search first.

## Memory Backend

**Active**: mem0 cloud (`mcp__mem0__*`) with `agent_id: "hextrackr"` for project-scoped memories.
