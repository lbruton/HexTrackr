---
tags: []
doc_type: architecture
project: hextrackr
source: manual
created: "2026-03-12"
updated: "2026-03-12"
sourceFiles:
  - app/public/docs-source/architecture/index.md
  - app/public/docs-source/architecture/technology-stack.md
---

# Architecture

High-level system architecture overview for HexTrackr. Detailed pages cover each layer.

## System Overview

HexTrackr follows a modular MVC architecture with clear separation of concerns:

```
Browser → NPM (443, SSL) → Portainer VM (8989) → hextrackr-app container (8080)
```

| Layer | Technology | Details |
|-------|-----------|---------|
| Frontend | Vanilla JS (ES6+) | 50+ specialized modules, no framework, no build step |
| UI Framework | Bootstrap 5 + Tabler.io | Dashboard theme, responsive layout |
| Data Grid | AG-Grid Community | Infinite scroll, enterprise-grade |
| Charts | ApexCharts | Interactive data visualization |
| Backend | Node.js 22 + Express | CommonJS modules, middleware pipeline |
| Database | SQLite (WAL mode) | better-sqlite3, 17 tables |
| Real-time | Socket.io | WebSocket for progress tracking and live updates |
| Auth | Argon2id + express-session | CSRF sync tokens, rate limiting |
| Container | Docker (Alpine) | Named volumes for DB, uploads, backups |

## Architecture Documents

### Core Architecture

| Page | Covers |
|------|--------|
| [Backend Architecture](/Volumes/DATA/GitHub/Devops/DocVault/Projects/HexTrackr/Backend%20Architecture.md) | Node.js/Express server, middleware pipeline, service layer, route modules |
| [[Frontend Architecture]] | Client-side module system, page managers, DOM patterns |
| [[Database Architecture]] | SQLite configuration, WAL mode, migrations, backup/restore |
| [[Data Model]] | Complete schema reference — all 17 tables, columns, relationships |
| [[Theme Architecture]] | CSS variables, dark/light mode, AG-Grid theming, component styling |

### API and Integration

| Page | Covers |
|------|--------|
| [[API Reference]] | Backend controllers, services, routes — all REST endpoints |
| [[Frontend API]] | UI components, page managers, client modules |
| [Middleware & Config](/Volumes/DATA/GitHub/Devops/DocVault/Projects/HexTrackr/Middleware%20&%20Config.md) | Request pipeline — auth, CSRF, rate limiting, compression |
| [[Utilities]] | Helper functions, shared utilities |
| [[WebSocket Architecture]] | Socket.io protocol, event definitions, progress tracking |
| [Security Architecture](/Volumes/DATA/GitHub/Devops/DocVault/Projects/HexTrackr/Security%20Architecture.md) | Auth flow, session management, CSRF, rate limiting, path validation |

### Data Layer

| Page | Covers |
|------|--------|
| [[Database Schema]] | Current schema with raw SQL snapshot |
| [[Schema Evolution]] | Migration history and schema changes |
| [[Database Seed]] | Seed data for development and testing |

## Technology Stack

### Runtime

- **Node.js 22.x LTS** (Alpine container image)
- **CommonJS** modules (backend), **ES6** modules (frontend)

### Frontend Libraries

| Library | Version | Purpose |
|---------|---------|---------|
| Bootstrap | 5.x | Responsive CSS framework |
| Tabler.io | — | Dashboard UI theme |
| AG-Grid Community | 33.x | Enterprise data grid |
| ApexCharts | 3.x | Charts and visualization |
| Socket.io-client | 4.x | WebSocket client |
| DOMPurify | 3.x | XSS sanitization |

### Backend Libraries

| Library | Version | Purpose |
|---------|---------|---------|
| Express | 4.x | Web framework |
| better-sqlite3 | 12.x | SQLite driver (native bindings) |
| argon2 | 0.31.x | Password hashing (Argon2id) |
| express-session | 1.x | Session management |
| csrf-sync | 4.x | CSRF protection |
| helmet | 8.x | Security headers |
| express-rate-limit | 8.x | API rate limiting |
| socket.io | 4.x | WebSocket server |
| marked | 16.x | Markdown rendering |
| papaparse | 5.x | CSV parsing |

### Development Tools

| Tool | Purpose |
|------|---------|
| ESLint 9 + @stylistic | JavaScript linting and formatting |
| Stylelint | CSS linting |
| markdownlint-cli | Markdown linting |
| JSDoc | API documentation generation |
| nodemon | Hot-reload dev server |

### External Integrations

| Integration | Purpose |
|-------------|---------|
| CISA KEV API | Known Exploited Vulnerabilities catalog (daily sync) |
| NIST NVD | CVE detail links and references |
| Tenable/Qualys/Rapid7 | Vulnerability scanner CSV imports |

## Related

- [Overview](/Volumes/DATA/GitHub/Devops/DocVault/Projects/HexTrackr/Overview.md) — Project summary and deployment
- [[Cisco Advisory Architecture]] — Cisco PSIRT OAuth2 integration
- [Logging System](/Volumes/DATA/GitHub/Devops/DocVault/Projects/HexTrackr/Logging%20System.md) — Audit logging with AES-256-GCM encryption
- [[Turso Migration]] — Future cloud database migration planning
