# Technology Stack

## Project Type

Self-hosted web application — Node.js/Express backend serving a vanilla JavaScript single-page frontend, containerized with Docker, reverse-proxied by nginx.

## Core Technologies

### Primary Language(s)

- **Language**: JavaScript (ES6+, CommonJS modules)
- **Runtime**: Node.js 18+ (4GB heap allocation)
- **Package Manager**: npm

### Key Dependencies/Libraries

- **Express ^4.18.2**: HTTP server, routing, middleware
- **better-sqlite3 ^12.4.1**: Primary synchronous SQLite driver (migrations, queries)
- **sqlite3 ^5.1.7**: Async SQLite driver (legacy/callback-based operations)
- **Socket.IO ^4.8.1**: WebSocket real-time updates
- **Argon2 ^0.31.2**: Password hashing (Argon2id variant)
- **Helmet ^8.1.0**: HTTP security headers
- **csrf-sync ^4.2.1**: CSRF protection
- **express-rate-limit ^8.1.0**: Rate limiting
- **DOMPurify ^3.2.6**: HTML sanitization (XSS prevention)
- **marked ^16.2.1**: Markdown-to-HTML rendering (documentation system)
- **highlight.js ^11.11.1**: Code syntax highlighting in docs
- **PapaParse ^5.4.1**: CSV parsing for vulnerability imports
- **node-fetch ^3.3.2**: HTTP client for vendor API calls
- **node-cache ^5.1.2**: In-memory TTL cache (5-min default)
- **JSZip ^3.10.1**: ZIP archive creation for exports/backups
- **Multer ^2.0.2**: File upload handling
- **uuid ^12.0.0**: Unique identifier generation
- **dotenv ^17.2.1**: Environment variable loading

### Application Architecture

Modular MVC pattern:

- **Controllers** (`app/controllers/`): Request handling, input validation, response formatting
- **Services** (`app/services/`): Business logic, 20 service files covering all domains
- **Routes** (`app/routes/`): 14 route modules mapping URLs to controllers
- **Middleware** (`app/middleware/`): Auth, CSRF, rate limiting, session management
- **Modules** (`app/modules/`): Shared utilities (hostname parsing, schema validation)

### Data Storage

- **Primary storage**: SQLite (WAL journal mode) via Docker named volume at `/app/data/hextrackr.db`
- **Caching**: In-memory TTL cache (node-cache, 5-minute default)
- **Data formats**: JSON (API responses, user preferences), CSV (import/export), ZIP (backups)
- **Backup**: Automated backup service with retention policy, stored in `backups/` directory

### External Integrations

- **CISA KEV API**: 24-hour background sync of Known Exploited Vulnerabilities catalog
- **Cisco PSIRT API**: OAuth2 authenticated advisory retrieval with fixed version parsing
- **Palo Alto Advisories**: Web scraping of security bulletins with version matching
- **Protocols**: HTTP/REST (all APIs), WebSocket (Socket.IO for real-time UI updates)
- **Authentication**: Session-based (express-session with better-sqlite3 session store), Argon2id password hashing

### Monitoring & Dashboard Technologies

- **Dashboard Framework**: Vanilla JavaScript (no framework — DOM manipulation, custom components)
- **Real-time Communication**: Socket.IO WebSocket for live vulnerability/ticket updates
- **Visualization Libraries**: Custom chart rendering, CSS-based progress indicators
- **State Management**: Server as source of truth; client fetches on demand + WebSocket push

## Development Environment

### Build & Development Tools

- **Build System**: npm scripts (no bundler — files served directly)
- **Package Management**: npm with `package-lock.json`
- **Development workflow**: Docker Compose (`docker-compose restart hextrackr` for backend changes; browser refresh for frontend)
- **Nodemon**: Dev-mode file watching (not used in Docker production)

### Code Quality Tools

- **Static Analysis**: ESLint v9 with `@stylistic/eslint-plugin`, Codacy (CI quality gate)
- **CSS Linting**: Stylelint with `stylelint-config-standard`
- **Markdown Linting**: markdownlint-cli with custom `.markdownlint.json` config
- **Formatting**: ESLint stylistic rules (4-space indent, double quotes, semicolons required)
- **Documentation**: JSDoc (API reference at `/dev-docs-html/`), markdown docs (130+ files at `/docs-html/`)
- **Schema Validation**: Zod (dev dependency for build-time validation)

### Version Control & Collaboration

- **VCS**: Git (GitHub hosted)
- **Branching Strategy**: `dev` (default development) → `main` (protected production). Feature work via `patch/VERSION` worktrees.
- **Code Review Process**: Codacy automated quality gates on both `dev` and `main` branches. PR-based workflow with review required.
- **Issue Tracking**: Linear (HexTrackr-Dev team)

## Deployment & Distribution

- **Target Platform**: Docker container (Linux-based) behind nginx reverse proxy
- **Distribution Method**: Docker Compose self-hosted deployment
- **Container**: `hextrackr` service on port 8989, `hextrackr-nginx` reverse proxy
- **Access URL**: https://dev.hextrackr.com
- **RHEL Deployment**: Production deployment guides for RHEL 10 available in `/docs/`
- **Update Mechanism**: Git pull → Docker rebuild → volume-preserved database

## Technical Requirements & Constraints

### Performance Requirements

- Node.js 4GB heap allocation for large dataset handling
- SQLite WAL mode for concurrent read performance
- In-memory cache with 5-minute TTL to reduce database load
- 365-day daily totals retention for trend analysis

### Compatibility Requirements

- **Platform Support**: Any Docker-capable host; RHEL 10 for production
- **Browser Support**: Modern browsers (ES6+ required, vanilla JS)
- **Node.js**: 18+ required

### Security & Compliance

- **Password Hashing**: Argon2id (industry-leading)
- **Audit Trail**: AES-256-GCM encrypted audit logs with configurable retention
- **HTTP Security**: Helmet headers, CSRF tokens, rate limiting
- **Input Sanitization**: DOMPurify for HTML, parameterized SQL queries
- **Session Management**: Secure cookies with SQLite-backed session store

### Scalability & Reliability

- **Expected Load**: Single-team deployment (10-50 concurrent users)
- **Availability**: Self-hosted; uptime depends on host infrastructure
- **Database**: SQLite suitable for single-instance; no horizontal scaling path

## Technical Decisions & Rationale

### Decision Log

1. **SQLite over PostgreSQL**: Chosen for zero-configuration self-hosted deployment on isolated networks. Trade-off: no horizontal scaling, but matches single-team use case.
2. **Vanilla JS over React/Vue**: Eliminates build toolchain complexity, reduces bundle size, enables direct browser debugging. Trade-off: more manual DOM management.
3. **better-sqlite3 + sqlite3 dual drivers**: better-sqlite3 for synchronous migrations and new code; sqlite3 retained for legacy callback-based operations (gradual migration).
4. **Docker Compose**: Simplifies deployment to a single `docker-compose up` command with named volumes for data persistence.
5. **Argon2id over bcrypt**: Superior resistance to GPU/ASIC attacks, recommended by OWASP for new applications.

## Known Limitations

- **Single-instance only**: SQLite doesn't support multi-server deployments. Would require migration to PostgreSQL for horizontal scaling.
- **No automated testing**: No unit or integration test suite. Manual QA via browser and Docker logs.
- **Dual SQLite drivers**: `sqlite3` (async) and `better-sqlite3` (sync) coexist, creating inconsistent database access patterns. Gradual migration to better-sqlite3 is in progress.
- **No bundler/minification**: Frontend assets served raw — no tree-shaking, code splitting, or minification.
