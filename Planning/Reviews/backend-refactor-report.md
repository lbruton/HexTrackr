# HexTrackr Backend Refactoring Report

Date: 2025-09-15

This report reviews the current backend implementation (notably `app/public/server.js`) and outlines concrete refactoring opportunities with a pragmatic, phased migration plan. The goal is to improve maintainability, performance, reliability, and security without disrupting current functionality.

## Executive Summary

- `server.js` is a 3,800+ line monolith that mixes concerns: HTTP server setup, Socket.IO, middleware, route definitions, CSV ingest, batch processing, database DDL/DML, docs serving, and utilities.
- The code largely uses callback-based `sqlite3` with deep nesting and cross-cutting responsibilities, making changes risky and testing difficult.
- High-value refactors:
  - Extract modules (config, db, routers, services, utilities) and adopt `express.Router()` per domain.
  - Wrap SQLite in a thin promise-based layer, centralize schema and migrations, and tune pragmas and indexes.
  - Isolate CSV ingest/batch processing into a service with testable units, progress reporting via an event/channel boundary.
  - Centralize error handling, request validation, CORS/rate limiting config, and structured logging/metrics.
  - Introduce versioned API (`/api/v1`) and consistent response envelopes.
  - Add unit/integration tests around utils, routers, and ingest service.

---

## Current State Overview

- Primary entrypoint: `app/public/server.js` (~3,809 lines) containing:
  - App/server bootstrap (Express + HTTP + Socket.IO)
  - Security/middleware (CORS, rate limit, compression, body parsers, headers)
  - WebSocket progress system (`ProgressTracker`)
  - Path/file utilities (`PathValidator`)
  - Vulnerability ingest + enhanced deduplication helpers
  - Two-stage ingest path: staging load and batch promotion to final tables
  - Database initialization, CREATE TABLE/INDEX, schema changes and ALTERs
  - 29 API endpoints across vulnerabilities, tickets, backup/restore, docs, health
  - Static docs serving and SPA redirect helpers

Observations:

- Single global `db` connection; raw SQL scattered across routes/services in `server.js`.
- Duplicated logic and very long functions (e.g., ingest/batch processing) couple IO, transformation, and persistence.
- Callback-style flows hinder readability and error handling.
- Route logic returns ad‑hoc response shapes.
- Configuration is mostly inline/hardcoded and spread across the file.

---

## Findings by Category

### 1) Architecture & Structure

- Monolithic `server.js` couples:
  - Infrastructure (server/io/middleware) with
  - Domain concerns (vulnerabilities, tickets, backups) and
  - Utilities (path validation, normalization, hashing).
- Docs routes depend on reading `server.js` for stats; this creates a hidden coupling that will break when splitting files.

Opportunities

- Extract modules by concern and introduce a conventional `src/` or `app/server/` layout.
- Use `express.Router()` per feature area and mount under `/api/v1/...`.
- Define a small, composable bootstrap: `loadConfig → createDb → createApp → attachRouters → startServer`.

### 2) Modularity & Code Organization

- Utilities (`PathValidator`, hostname/IP normalization, hashing) are embedded in `server.js`.
- Progress reporting is tightly coupled to data processing and web sockets.

Opportunities

- Move utilities to `utils/` with focused unit tests.
- Extract `ProgressTracker` to `services/progress-tracker.js`; expose methods/events, not socket implementation details.
- Isolate CSV/parsing and mapping code into `services/import-service.js` with pure functions for mapping/normalization.

### 3) Database & Data Model

- `sqlite3` callbacks used directly; schema DDL/ALTER/INDEX statements live in the runtime file.
- Queries are scattered, some repeated; transaction handling is manual per block.
- Indexes exist for hot paths (good), but pragmas and connection settings are not centralized.

Opportunities

- Introduce a DB module:
  - Create and export a promise-based wrapper (e.g., `db.query`, `db.runTx`).
  - Centralize PRAGMAs: `journal_mode=WAL`, `synchronous=NORMAL`, `busy_timeout`, `cache_size`, `temp_store=MEMORY`.
  - Move DDL/ALTER/INDEX into one-time migration scripts and track schema versioning.
  - Encapsulate common queries into repository helpers (e.g., vulnerabilitiesRepo, ticketsRepo).

### 4) Import Pipeline & Performance

- Two-phase ingest (staging → batch finalize) is implemented inline with a lot of state and logging.
- Concurrency control relies on “sequential loops + flags” across callbacks.
- CSV processing reads files fully into memory; progress is socket-emitted inline.

Opportunities

- Make ingest a service with explicit phases and boundaries:
  - Parse stream → map rows → stage (transaction) → batch finalize (transaction).
  - Provide progress via an event emitter/channel; the socket layer subscribes and relays.
  - Apply backpressure (batch sizes pulled from config) and consistent error propagation.
  - Add deterministic unit tests for mapping, key generation, and dedup tiers.

### 5) Security

- CORS whitelist is inline; should be driven by env (and support Docker mapping `8989 → 8080`).
- `PathValidator.validatePath` relies on `normalize` and string checks. Stronger guarantee is to resolve to an allowed base and ensure the resolved path stays within it.
- Upload configuration is inline; limited validation of CSV content and file type.
- Rate limiter attached to `/api/` only; some heavy endpoints might need tighter limits.

Opportunities

- Centralize security middleware and config (CORS, rate limits, helmet-style headers, upload type/size validation).
- Implement safe path resolution against an allowlisted base directory for docs/uploads.
- Validate request bodies and query params (e.g., Zod/Joi), returning uniform 4xx on validation errors.

### 6) API Design & Consistency

- Endpoints return varied response envelopes and error shapes.
- API is unversioned. Some routes hardcode logic/joins, making client coupling stronger.

Opportunities

- Introduce `/api/v1` namespace, stable shapes, and an error envelope (`{ error: { code, message } }`).
- Add response pagination for potentially large collections (e.g., vulnerabilities, backups).
- Extract a consistent DTO/serializer layer in each router.

### 7) Error Handling & Observability

- Mixed inline `console.log/error` and ad‑hoc progress messages.
- No centralized error middleware, no correlation ID, and limited metrics.

Opportunities

- Add centralized error middleware, request ID (e.g., header → context), and structured logging (pino/winston) with levels.
- Expose `/metrics` for Prometheus and include DB, ingest, and request metrics.
- Add health (`/health`) and readiness endpoints with DB ping (lightweight `SELECT 1`).

### 8) Static Files & Docs

- Regex route and a static mount for docs; logic scans `server.js` to compute stats.

Opportunities

- Keep docs routes, but decouple stats by scanning router files instead of `server.js`.
- Constrain static file serving and ensure caching headers are configured in one place.

### 9) Testing & Tooling

- No `__tests__` directory present; large logic surface without unit/integration coverage.

Opportunities

- Add unit tests for utilities (path validation, normalization, unique key generation).
- Add integration tests for routers (Jest + supertest) with an ephemeral SQLite database (tmp dir, WAL + migrations).
- Add ingest service tests with small fixture CSVs to verify mapping and batch behavior.

---

## Proposed Target Structure

```
app/server/                     # new backend home (or `src/` at repo root)
  index.js                      # bootstrap: loadConfig → createDb → createApp → start
  config/index.js               # env parsing (PORT, CORS_ORIGINS, DB_PATH, LIMITS,...)
  db/index.js                   # sqlite init, PRAGMAs, migrations, promise wrapper
  middleware/
    security.js                 # headers, helmet-like, CORS builder
    body-parsers.js             # JSON/urlencoded limits from config
    rate-limit.js               # reusable limiter(s)
    errors.js                   # centralized error handler
    request-id.js               # correlation ids
  routers/
    health.js                   # GET /health
    vulnerabilities.js          # /api/v1/vulnerabilities/*
    tickets.js                  # /api/v1/tickets/*
    backups.js                  # /api/v1/backup/*
    docs.js                     # /docs-html/*
  services/
    import-service.js           # staging → batch finalize, events for progress
    progress-tracker.js         # session mgmt, throttling, emit interface
    path-validator.js           # safe path utilities (base-root allowed)
    normalization.js            # hostname/ip/vendor normalization, hashing
    unique-key.js               # enhanced key + tiers + scores
  ws/
    socket.js                   # Socket.IO wiring that subscribes to service events
```

Notes

- `server.js` becomes a thin entrypoint delegating to this structure.
- Docs stats endpoint should scan `routers/` and `services/` for counts, not `server.js`.

---

## Phased Migration Plan

Phase 0 – Baseline and Guardrails (0.5–1 day)

- Add smoke tests for key endpoints (health, a couple of GETs) using supertest.
- Introduce structured logger and a global error handler; keep console logs as fallback.
- Capture current behavior/response shapes for top endpoints.

Phase 1 – Utilities & Config Extraction (1–2 days)

- Extract `path-validator.js`, `normalization.js`, `unique-key.js`, and `progress-tracker.js` from `server.js` with identical interfaces.
- Add unit tests for each extracted module.
- Create `config/index.js` (env → defaults) and replace inline constants.

Phase 2 – DB Layer & Migrations (1–2 days)

- Introduce `db/index.js` with PRAGMAs and small promise wrapper.
- Move DDL/ALTER/INDEX to a migration file; run at startup if missing.
- Replace inline `db.run`/`db.all` with wrapped calls where touched.

Phase 3 – Routerization (2–4 days, incremental)

- Create `routers/vulnerabilities.js`, `tickets.js`, `backups.js`, `health.js`, `docs.js` and move route code gradually.
- Mount under `/api/v1` while keeping legacy paths with redirects/aliases (temporary).
- Unify response envelope and validation for moved routes.

Phase 4 – Ingest Service Isolation (2–4 days)

- Move CSV parsing, staging, and batch finalize into `services/import-service.js` with events for progress.
- Replace inline Socket.IO calls with subscriptions to service events.
- Add integration tests for ingest with small CSV fixtures; verify dedup tiers and lifecycle.

Phase 5 – Hardening & Cleanups (1–2 days)

- Replace ad‑hoc logs with structured logging; add `/metrics`.
- Remove legacy endpoints/aliases; update docs stats logic to scan new folders.
- Document env vars and runbook; ensure Playwright/Jest tasks run green.

---

## Quick Wins (1–2 days)

- Central error middleware + structured logging (pino) with request ID.
- Extract and unit test `PathValidator` and normalization utilities.
- Move CORS and rate limiter to config-driven middleware; add env-based origins.
- Add `PRAGMA busy_timeout` and WAL mode during DB init; centralize DB open.
- Create `routers/health.js` and mount it (very low risk).

---

## Risks & Mitigations

- Coupling to `server.js` by docs stats — adjust endpoint to scan `routers/` instead.
- Behavior drift in ingest pipeline — add integration tests and log parity metrics during rollout.
- SQLite concurrency under heavy ingest — enforce sequential batches and PRAGMAs; consider `better-sqlite3` if needed.
- Client dependencies on unversioned routes — introduce `/api/v1` with legacy aliases during transition.

---

## Acceptance Criteria (per Phase)

Phase 0

- Basic smoke tests exist and pass; logger + error handler active.

Phase 1

- Utilities extracted and covered by unit tests (≥80% lines in those modules).
- Config driven CORS/rate limit/body limit.

Phase 2

- DB module initializes with WAL, busy_timeout; migrations applied idempotently.
- New wrapper used in at least one router or ingest step.

Phase 3

- Routers mounted under `/api/v1`; ≥50% of routes moved; legacy routes still functional.
- Common response envelope and input validation enforced in moved routers.

Phase 4

- Ingest pipeline runs via service; progress delivered through service events; integration tests green.

Phase 5

- Docs stats no longer read `server.js`; metrics endpoint exposes core counters; legacy route aliases removed.

---

## Appendix A – Notable Modules To Extract (from server.js)

- `PathValidator` (safe read/write/stat/readdir, base-path enforcement)
- `ProgressTracker` (throttle, sessions, complete/error handling)
- Normalization: `normalizeHostname`, `normalizeIPAddress`, `isValidIPAddress`, `normalizeVendor`
- Unique Keys: `generateEnhancedUniqueKey`, `calculateDeduplicationConfidence`, `getDeduplicationTier`, legacy `generateUniqueKey`
- CSV/Mapping: `mapVulnerabilityRow` and related helpers
- Ingest Pipeline: `_processVulnerabilityRowsWithRollover`, `processStagingToFinalTables`, `processNextBatch`, `finalizeBatchProcessing`

## Appendix B – Endpoint Inventory (Observed)

- ~29 app routes in `server.js` including:
  - Health: `GET /health`
  - Vulnerabilities: stats, trends, list, resolved, import (direct, staging), clear
  - Imports: list
  - Docs: `/docs-html` SPA entry, static content, redirect
  - Backup/Restore: backup subset/all, restore
  - Tickets: CRUD, import/migrate, backup

---

## Final Notes

This plan emphasizes incremental change with minimal breakage, improved testability, and clearer ownership per module. If desired, we can start by implementing Phase 0–1 immediately and send a follow‑up PR that extracts utilities and centralizes config.
