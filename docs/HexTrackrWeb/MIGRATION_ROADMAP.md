# HexTrackr Migration Roadmap

> Incremental path from legacy SQLite monolith to Turso-backed API-first architecture.
> Compiled 2026-03-08 from full codebase analysis + Linear board audit.

## Current Architecture (Pain Points)

**Data flow today**: CSV upload → Express → SQLite → localStorage → browser calculations → UI

- **60k+ vulnerabilities** loaded into browser memory on login
- **15 localStorage keys**, **7 sessionStorage patterns** caching data client-side
- **40+ API endpoints** hit on page load, rate limited at 1000/min
- **LIKE-based string matching** for ticket↔device correlation (no FKs)
- **Hostname regex parsing** for location grouping (23 patterns, 3 site codes)
- **3 external data sources** (CISA KEV, Cisco PSIRT, Palo Alto) correlated via CVE string JOINs
- **182 database call sites** across 12 services using callback-style `db.run()`/`db.get()`/`db.all()`
- **Dual pagination modes** — legacy (all-in-memory) vs paginated (100/page), feature-flagged

## Target Architecture

**Data flow target**: CSV upload → Express → Turso → API v2 (server-side aggregation, pagination) → UI

- All calculations server-side
- No localStorage for data (only UI preferences)
- Paginated/aggregated API responses
- Proper relational schema with FKs and junction tables
- Cloudflare Tunnel + email OTP for external access
- Same Portainer deploy pattern (PR → merge → redeploy)

---

## Phase 0: Stabilize (HEX-362) — IMMEDIATE

**Goal**: Clean baseline before any architectural work.

- [ ] Commit `databaseService.js` self-pattern fix (currently uncommitted on dev)
- [ ] Merge Dependabot PRs #6, #7, #8
- [ ] Guard unprotected endpoints: `/api/sites`, `/api/locations` (add requireAuth)
- [ ] Tag as v1.2.0
- [ ] Verify Portainer repo-based deploy works end-to-end

**Effort**: 1-2 sessions

---

## Phase 1: Cloudflare Tunnel + Auth Hardening — NEW

**Goal**: Secure remote access without app code changes.

- [ ] Create Cloudflare Tunnel on Portainer VM pointing to localhost:8989
- [ ] Configure Cloudflare Access policy: email OTP for your email + coworker emails
- [ ] Add `hextrackr.lbruton.cc` proxy host in NPM (or route tunnel directly)
- [ ] Test: external access requires Cloudflare email OTP → then app login as normal
- [ ] Activate Helmet.js (already installed, just unused)
- [ ] Tighten CORS to specific origins only

**Effort**: 1-2 sessions. Zero app code changes for tunnel. Minor changes for Helmet/CORS.

**Why first**: Solves the security concern immediately. Everything after this is internal refactoring.

---

## Phase 2: Turso Schema Design — FOUNDATION

**Goal**: Design a clean, normalized schema that handles the full dataset.

### Current Tables → Turso Tables

| Current | Issue | Turso Design |
|---|---|---|
| `vulnerabilities_current` (flat) | All data in one wide table | Keep flat — it works, add proper indexes |
| `tickets.devices` (JSON text) | LIKE '%hostname%' matching | New `ticket_devices` junction table (ticket_id, hostname) |
| `tickets.location` (plain text) | Implicit hostname→location | New `devices` table (hostname PK, location, site, vendor, device_type) |
| `kev_status` | CVE string JOIN | Keep — already clean (CVE as PK) |
| `cisco_advisories` + `cisco_fixed_versions` | Already normalized (HEX-287) | Keep as-is |
| `palo_alto_advisories` | CVE string JOIN | Keep — already clean |
| `vulnerability_daily_totals` | Write-through aggregates | Keep — efficient for trend charts |
| `vendor_daily_totals` | Write-through aggregates | Keep |

### New Tables

```sql
-- Proper device registry (populated from hostname parser during import)
CREATE TABLE devices (
    hostname TEXT PRIMARY KEY,
    normalized_hostname TEXT NOT NULL,
    site TEXT,
    location TEXT,
    device_type TEXT,
    vendor TEXT,
    first_seen TEXT,
    last_seen TEXT
);

-- Junction table replacing tickets.devices JSON column
CREATE TABLE ticket_devices (
    ticket_id TEXT NOT NULL REFERENCES tickets(id),
    hostname TEXT NOT NULL REFERENCES devices(hostname),
    PRIMARY KEY (ticket_id, hostname)
);
```

### Migration Risks to Address

1. **`better-sqlite3` sync → `@libsql/client` async**: Every `db.run()`/`db.get()`/`db.all()` becomes async/await
2. **`global.db` usage**: Import service uses global ref — needs DI refactor
3. **Session store**: Separate `sessions.db` file — keep local SQLite or use Redis/memory
4. **Aggregate write-through latency**: Turso remote writes for daily totals after import — batch these
5. **Audit log AES-256-GCM blobs**: Binary-safe in libSQL, just verify

**Effort**: 2-3 sessions for schema design + validation against actual data.

---

## Phase 3: Database Abstraction Layer (HEX-363) — CRITICAL PATH

**Goal**: Wrap all 182 database call sites behind an adapter interface so SQLite and Turso can coexist.

### Call Site Inventory (top services)

| Service | Call Sites | Complexity |
|---|---|---|
| vulnerabilityService | 33 | High — bulk imports, aggregations |
| backupService | 27 | Medium — backup/restore logic |
| ticketService | 19 | Medium — CRUD + soft delete |
| ciscoAdvisoryService | 18 | Medium — OAuth + sync |
| importService | 15 | High — staging pipeline, transactions |
| kevService | 12 | Low — sync + correlate |
| paloAltoService | 10 | Low — sync |
| databaseService | 10 | High — migrations, WAL, pragmas |
| loggingService | 8 | Low — audit writes |
| locationService | 8 | Medium — hostname parsing queries |
| templateService | 6 | Low — CRUD |
| authService/preferencesService | 16 | Medium — session, user prefs |

### Adapter Pattern

```javascript
// DatabaseAdapter interface
class DatabaseAdapter {
    async run(sql, params) {}
    async get(sql, params) {}
    async all(sql, params) {}
    async transaction(fn) {}
}

class SQLiteAdapter extends DatabaseAdapter { /* wraps better-sqlite3 */ }
class TursoAdapter extends DatabaseAdapter { /* wraps @libsql/client */ }
```

### Migration Order (lowest risk first)

1. templateService (6 calls, simple CRUD)
2. kevService (12 calls, read-heavy)
3. paloAltoService (10 calls, read-heavy)
4. loggingService (8 calls, write-only)
5. ticketService (19 calls, medium complexity)
6. ciscoAdvisoryService (18 calls, medium)
7. locationService (8 calls, hostname queries)
8. authService + preferencesService (16 calls)
9. vulnerabilityService (33 calls, complex aggregations)
10. importService (15 calls, transactions + staging)
11. backupService (27 calls, backup/restore)
12. databaseService (10 calls, schema management)

**Effort**: 2-3 weeks, ~1 service per session.

---

## Phase 4: Dual-Path Pipeline

**Goal**: CSV import writes to both SQLite (legacy) and Turso simultaneously.

- [ ] Import pipeline writes to both adapters
- [ ] External syncs (KEV, Cisco, Palo Alto) write to both
- [ ] Daily totals aggregation writes to both
- [ ] Validation: compare row counts and checksums between both DBs
- [ ] Feature flag: `TURSO_ENABLED=true` to activate dual-write

**Effort**: 1-2 weeks. Depends on Phase 3 adapter being complete.

---

## Phase 5: API v2 Endpoints

**Goal**: New endpoints backed by Turso with server-side aggregation, proper pagination, and minimal client-side processing.

### Dashboard Load (currently 7+ parallel fetches → target: 1-2)

```
GET /api/v2/dashboard
  → { stats, trends, recentTrends, deviceStats, cvssDistribution, severityDistribution, recentVulns }

GET /api/v2/vulnerabilities?page=1&limit=100&sort=severity&filter=...
  → { data, pagination, enrichment: { kevFlags, ticketCounts, fixedVersions } }
```

### Key Changes

- All enrichment (KEV badges, ticket counts, fixed versions) done server-side in the query
- Ticket↔device correlation uses new `ticket_devices` junction table (no more LIKE matching)
- Location grouping uses `devices` table (no more per-request hostname parsing)
- Client receives ready-to-render data — no `.reduce()/.filter()/.map()` on 50k+ arrays

**Effort**: 2-3 weeks.

---

## Phase 6: Frontend Module Migration

**Goal**: Swap each page from localStorage + legacy API to v2 endpoints, one module at a time.

### Module Order (by independence)

1. **Dashboard cards** (stats, trends, % changes) — pure API read
2. **Vulnerability grid** — swap to v2 paginated endpoint with server enrichment
3. **Location cards** — swap to v2 with pre-grouped data
4. **Device security modal** — swap to v2 device endpoint
5. **Ticket system** — swap to v2 with junction table lookups
6. **CVE search/lookup** — move Cisco/Palo Alto/MITRE lookups to backend proxy
7. **Import pipeline** — point at Turso-only path
8. **Settings/preferences** — already migrated to DB (HEX-138)

### localStorage Cleanup Per Module

| Key | Action |
|---|---|
| `hextrackr-theme`, AG-Grid state | Keep — UI preferences, already synced to DB |
| `hexagonTickets`, `hexagon_shared_docs` | Keep — Hexagon bridge, transient |
| `cveAPICache`, `cve_cache_*`, `pendingCVELookups` | Remove — server-side CVE proxy |
| `cisco_client_id`, `cisco_client_secret`, `hextrackr-cisco-key` | Remove — already in DB |
| `hextrackr_cache_metadata`, `hextrackr_last_load` | Remove — server handles freshness |
| `hextrackr.chartViewState` | Keep or migrate to user_preferences |

**Effort**: 3-4 weeks, ~1 module per 2 sessions.

---

## Phase 7: Cutover + Cleanup

**Goal**: Drop legacy SQLite path, remove dual-write, clean up.

- [ ] Remove SQLiteAdapter and all legacy code paths
- [ ] Remove localStorage caching keys
- [ ] Remove legacy `vulnerabilities` table (keep `vulnerabilities_current` only)
- [ ] Remove `ticket_vulnerabilities` junction table (replaced by `ticket_devices`)
- [ ] Update backup/restore for Turso (platform snapshots vs file copy)
- [ ] Performance test full pipeline end-to-end
- [ ] Tag as v2.0.0

---

## Timeline Estimate

| Phase | Effort | Dependencies |
|---|---|---|
| Phase 0: Stabilize | 1-2 sessions | None |
| Phase 1: Cloudflare Tunnel | 1-2 sessions | None (parallel with Phase 0) |
| Phase 2: Turso Schema | 2-3 sessions | Phase 0 |
| Phase 3: DB Abstraction | 2-3 weeks | Phase 2 |
| Phase 4: Dual Pipeline | 1-2 weeks | Phase 3 |
| Phase 5: API v2 | 2-3 weeks | Phase 3 |
| Phase 6: Frontend Migration | 3-4 weeks | Phase 5 |
| Phase 7: Cutover | 1 week | Phase 6 |

Phases 4 and 5 can run in parallel once Phase 3 is done.

**"A little each night"** pace: Phase 0-1 this week, Phase 2 next week, then ~1 service per session through Phase 3. Realistic 2-3 month timeline at evening pace.

---

## Linear Issues Status

| Issue | Title | Status | Notes |
|---|---|---|---|
| HEX-361 | BYOB Turso Architecture (Epic) | Todo | Parent epic |
| HEX-362 | Phase 0: Stabilize | Todo, URGENT | Immediate blocker |
| HEX-363 | Phase 1: DB Abstraction Layer | Todo | Maps to our Phase 3 |
| HEX-364 | Phase 2: OAuth (Entra) | Todo | May be replaced by Cloudflare Tunnel approach |
| HEX-365 | Phase 3: Per-user Turso | Todo | Future — after single-user migration works |
| HEX-366 | Phase 4: Multi-user sync | Todo | Future |
| HEX-367 | Phase 5: Public hosting | Todo | Future |
| HEX-368 | Phase 6: Settings portability | Todo | Future |
| **NEW** | Cloudflare Tunnel + email OTP | Not created | Replaces HEX-364 for immediate use |
| **NEW** | Portainer standardization | Not created | Done tonight (docker-compose.yml) |
| HEX-360 | Vuln Ignore/Mitigation | Backlog | Parked for post-migration |
| HEX-354 | NVD API Integration | Backlog | Parked for post-migration |
