---
project: hextrackr
tags:
  - project
  - nodejs
  - security
  - vulnerability-management
aliases: ["HexTrackr Overview", "HexTrackr"]
created: "2026-03-11"
updated: "2026-04-15"
---

# HexTrackr

> **Public copy.** Deployment and infra details (hosts, IPs, ports) are in the private companion: `Devops/DocVault/Projects/HexTrackr/Overview.md` (`vault-path private`).

Enterprise vulnerability management system with real-time WebSocket updates. Tracks security vulnerabilities, maintenance tickets, and CISA KEV (Known Exploited Vulnerabilities) data. Includes a Ticketing Bridge for coordinating field operations between independent teams.

## At a Glance

| Field | Value |
|-------|-------|
| Repo | [lbruton/HexTrackr](https://github.com/lbruton/HexTrackr) |
| Language | Node.js/Express backend, vanilla JavaScript frontend |
| Branches | `dev` (default) + `main` (protected, deploy-only) |
| Version Lock | `devops/version.lock` (patched via `/release patch`) |
| Issue Prefix | HEX (DocVault vault-based tracking) |
| Path | `/Volumes/DATA/GitHub/HexTrackr/` |
| Dev URL | https://dev.hextrackr.com (legacy alias, home network via NPM) |

## How It's Deployed

Runs as a Docker container on the [Portainer](/Volumes/DATA/GitHub/Devops/DocVault/KnowledgeBase/Infrastructure/Portainer.md) VM, behind [NPM](/Volumes/DATA/GitHub/Devops/DocVault/KnowledgeBase/Infrastructure/NPM.md) reverse proxy.

```
Browser → Cloudflare Zero Trust tunnel (2FA) → NPM (443, Let's Encrypt) → Portainer VM (8989, HTTP) → hextrackr-app container (8080)
```


| Component | Detail |
|-----------|--------|
| Stack | [Stack Registry](/Volumes/DATA/GitHub/Devops/DocVault/KnowledgeBase/Infrastructure/Stack%20Registry.md) ID 11, repo-based from `dev` branch |
| Port | 8989 (host) → 8080 (container) |
| Database | SQLite (WAL mode) on [named volume](/Volumes/DATA/GitHub/Devops/DocVault/KnowledgeBase/Infrastructure/Named%20Volumes.md) `hextrackr_hextrackr-database` |
| Volumes | 3 named: database (379M), uploads, backups |
| SSL | Let's Encrypt wildcard certs in NPM (`*.hextrackr.com`, `*.lbruton.cc`) via Cloudflare DNS challenge |
| DNS | Cloudflare DNS (free tier) for both zones; pfSense host overrides only needed when bypassing the tunnel on the LAN |
| Secrets | `SESSION_SECRET` via Portainer env var, sourced from Infisical |
| Backups | [Backups](/Volumes/DATA/GitHub/Devops/DocVault/KnowledgeBase/Infrastructure/Backups.md) stack pulls SQLite via `sqlite3 .backup` |

**Deploy pattern**: PR to `dev` → merge → Portainer redeploy (pulls latest, rebuilds image, restarts). Redeploy via API or Portainer UI.

## Architecture

**Pattern**: Modular MVC (controllers → services → database). See [[Architecture]] for full technology stack and detailed links.

| Metric | Value |
|--------|-------|
| Runtime | Node.js 22 LTS (Alpine, 4GB heap) |
| Database | SQLite (WAL mode), better-sqlite3, 17 tables |
| Services | 20 service files |
| Routes | 14 route modules |
| Frontend | Vanilla JS (50+ modules), Bootstrap 5 + Tabler.io |
| Data Grid | AG-Grid Community (infinite scroll) |
| Real-time | Socket.io WebSocket |
| Auth | Argon2id + express-session + CSRF sync |

### Key Services

| Service | Purpose |
|---------|---------|
| DatabaseService | WAL journal, backup/restore, schema migrations |
| VulnerabilityService | CRUD + stats aggregation |
| TicketService | Full CRUD, soft delete, field ops ticketing |
| KevService | CISA KEV integration, 24h background sync |
| CiscoService | OAuth2, PSIRT API, advisory parsing |
| PaloAltoService | Advisory scraping, version matching |
| AuthService | Argon2id password hashing, session management |
| HostnameParserService | Pattern 1/2/3 hostname normalization |
| CacheService | In-memory TTL cache, 5-min default |
| DocsService | Markdown rendering, version docs |

### In-App Documentation


### Development Process

HexTrackr uses the global spec-workflow for features and enhancements. SRPI was the previous project-specific process (retired — see SRPI Process (archived) for historical reference).

## Architecture Decisions

- **Vanilla JS frontend** — no framework, no build step. Direct DOM manipulation with WebSocket reactivity
- **SQLite over Postgres** — single-file DB simplifies backup/restore, Docker volume isolation. WAL mode handles concurrent reads
- **Let's Encrypt wildcard certs in NPM** — `*.hextrackr.com` and `*.lbruton.cc`, renewed via Cloudflare DNS challenge (Sectigo era retired)
- **Turso migration cancelled (2026-03-31)** — SQLite is the long-term database. Complexity not justified for current use case
- **Linear retired (2026-03-31)** — issue tracking moved to DocVault vault-based system
- **SRPI retired** — replaced by global spec-workflow + specflow plugin
- **Memento (Neo4j) retired** — replaced by mem0 cloud

## Documentation Index

### Architecture and Design

- [[Architecture]] — Technology stack, system overview, and links to all architecture docs
- [Backend Architecture](/Volumes/DATA/GitHub/Devops/DocVault/Projects/HexTrackr/Backend%20Architecture.md) — Node.js/Express server, middleware, services
- [[Frontend Architecture]] — Client-side modules, page managers
- [[Database Architecture]] — SQLite config, WAL mode, migrations
- [[Data Model]] — Complete schema: all 17 tables, columns, relationships
- [[Theme Architecture]] — CSS variables, dark/light mode, component styling
- [[WebSocket Architecture]] — Socket.io protocol, events, progress tracking
- [Security Architecture](/Volumes/DATA/GitHub/Devops/DocVault/Projects/HexTrackr/Security%20Architecture.md) — Auth flow, CSRF, rate limiting, path validation

### API Reference

- [[API Reference]] — Backend controllers, services, REST endpoints
- [[Frontend API]] — UI components, client modules
- [Middleware & Config](/Volumes/DATA/GitHub/Devops/DocVault/Projects/HexTrackr/Middleware%20&%20Config.md) — Request pipeline configuration
- [[Utilities]] — Shared helper functions

### Database

- [[Database Schema]] — Current schema with raw SQL snapshot
- [[Schema Evolution]] — Migration history
- [[Database Seed]] — Seed data for development

### Development Process

- [[Git Workflow]] — Branch model, PR lifecycle
- [[Version Management]] — Changelog and version bump process
- [[CSS Coding Standards]] — Styling conventions
- [[MCP Tools]] — MCP server tools and Claude Code hooks
- [Logging System](/Volumes/DATA/GitHub/Devops/DocVault/Projects/HexTrackr/Logging%20System.md) — Audit logging with AES-256-GCM encryption

### Integrations

- [[Cisco Advisory Architecture]] — OAuth2 PSIRT API integration

### Archived

- SRPI Process (archived) — Previous development process (retired, replaced by spec-workflow)
- [[Turso Migration]] — Cancelled migration research (2026-03-31)

## Related

- Issues tracked in Plane: <https://plane.lbruton.cc/lbruton/projects/105dd863-e217-40a1-bc23-8c4fb0f39279/> (prefix `HXTR`, migrated 2026-04-26). Pre-Plane archive: [[Archive/Issues-Pre-Plane/HexTrackr/HexTrackr|HEX archive]]
- [Portainer](/Volumes/DATA/GitHub/Devops/DocVault/KnowledgeBase/Infrastructure/Portainer.md) — Docker host for the HexTrackr container
- [NPM](/Volumes/DATA/GitHub/Devops/DocVault/KnowledgeBase/Infrastructure/NPM.md) — Reverse proxy and SSL termination
- [Stack Registry](/Volumes/DATA/GitHub/Devops/DocVault/KnowledgeBase/Infrastructure/Stack%20Registry.md) — Stack ID 11
- [Named Volumes](/Volumes/DATA/GitHub/Devops/DocVault/KnowledgeBase/Infrastructure/Named%20Volumes.md) — Database, uploads, backups volumes
- [Backups](/Volumes/DATA/GitHub/Devops/DocVault/KnowledgeBase/Infrastructure/Backups.md) — Automated SQLite backup target
- [Home Network](/Volumes/DATA/GitHub/Devops/DocVault/KnowledgeBase/Infrastructure/Home%20Network.md) — Traffic flow and DNS resolution
