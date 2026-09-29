---
tags: []
doc_type: research
project: hextrackr
source: manual
status: archived
created: "2026-03-12"
updated: "2026-03-31"
sourceFiles:
  - docs/HexTrackrWeb/STRATEGIC_RESEARCH.md
  - docs/HexTrackrWeb/MIGRATION_ROADMAP.md
  - docs/HexTrackrWeb/migration_plan.md
  - docs/HexTrackrWeb/technical_architecture.md
  - docs/HexTrackrWeb/data_consolidation_strategy.md
  - docs/HexTrackrWeb/storage_assessment.md
---

# Turso Migration

> **CANCELLED (2026-03-31)**: This migration direction has been abandoned. SQLite is the long-term database for HexTrackr. All related issues (HEX-369 epic, HEX-361 epic) have been cancelled. This page is retained as historical research reference only.

This page consolidates all research and planning for migrating HexTrackr from a self-hosted SQLite monolith to a Turso-backed, API-first architecture with a "Bring Your Own Backend" (BYOB) data ownership model.

---

## Context and Motivation

HexTrackr is an enterprise vulnerability management system currently self-hosted on a Portainer VM behind Nginx Proxy Manager. Getting approval to host internally at work has been slow. The goal is to host a publicly accessible instance that:

- Can be used for day-job vulnerability tracking without waiting for IT approval
- Could eventually be offered as a service to others
- Avoids managing user accounts, passwords, or PII
- Lets each user bring their own data store (BYOB pattern)

**Linear State**: HEX-361 (BYOB Turso Architecture Epic) with child issues HEX-362 through HEX-368.

---

## Current Architecture (Pain Points)

**Data flow today**: CSV upload -> Express -> SQLite -> localStorage -> browser calculations -> UI

- **60k+ vulnerabilities** loaded into browser memory on login
- **15 localStorage keys**, **7 sessionStorage patterns** caching data client-side
- **40+ API endpoints** hit on page load, rate limited at 1000/min
- **LIKE-based string matching** for ticket-device correlation (no FKs)
- **Hostname regex parsing** for location grouping (23 patterns, 3 site codes)
- **3 external data sources** (CISA KEV, Cisco PSIRT, Palo Alto) correlated via CVE string JOINs
- **182 database call sites** across 12 services using callback-style `db.run()`/`db.get()`/`db.all()`
- **Dual pagination modes** -- legacy (all-in-memory) vs paginated (100/page), feature-flagged

### Storage Assessment

**SQLite (Backend)**: The core of the application. Uses `sqlite3` and `better-sqlite3` libraries. Complex relational schema with 23 tables. All logic encapsulated in `databaseService.js`.

**localStorage/sessionStorage (Frontend)**:
- Found in 20+ files
- Stores: theme settings, grid column states, chart configurations, markdown editor preferences, authentication tokens
- A `PreferencesService` attempts to sync some preferences to the backend SQLite database, but many UI-specific states remain purely local
- These local settings are lost if a user switches devices unless explicitly synced

**IndexedDB**: Unused. No explicit usage found in the codebase.

---

## Architectures Evaluated

### Architecture A: Thin Shell (Keep Backend, Swap DB)

Keep the Node.js/Express backend, swap SQLite for Turso, add OAuth.

| Component | Current | Architecture A |
|-----------|---------|---------------|
| Hosting | Docker (self-hosted) | Node.js on Fly.io / Railway / VPS |
| Backend | Node.js/Express | Same -- kept |
| Database | SQLite (local file) | Turso (per-user remote DB) |
| Auth | Argon2id local passwords | OAuth (Microsoft Entra + PKCE) |
| Data ownership | Server-controlled | User-controlled (BYOB Turso DB) |
| Settings sync | N/A | OneDrive/Dropbox JSON file |

**Pros**: Preserves existing Express routes and middleware; Turso is SQLite-compatible at the query level; Node.js SDK support; background sync jobs still possible.

**Cons**: Still requires a running server; 182 DB call sites need driver swap (callback to Promise); session store replacement needed; WAL/PRAGMA optimizations meaningless over HTTP.

### Architecture B: Full Client-Side (Explored and Deferred)

Eliminate the backend entirely. SQLite Wasm in the browser, Dropbox for sync.

| Component | Current | Architecture B |
|-----------|---------|---------------|
| Hosting | Docker (self-hosted) | Cloudflare Pages (free static) |
| Backend | Node.js/Express | None -- fully client-side |
| Database | SQLite (local file) | SQLite Wasm (browser OPFS) |
| Auth | Argon2id local passwords | Dropbox/OneDrive/Google OAuth |
| Data ownership | Server-controlled | User-controlled (encrypted in their cloud) |

**Technical Architecture** (if pursued):
```
Browser -> Static site (Cloudflare Pages)
    | Dropbox OAuth
    | Download encrypted master.enc from Dropbox vault
    | Decrypt -> load into SQLite Wasm (OPFS)
    | All queries run in-browser
    | On save: snapshot -> encrypt -> upload to Dropbox
```

**Pros**: Zero server cost; zero server maintenance; maximum data privacy; works offline via OPFS.

**Cons**: Massive rewrite of all 17 route modules and 182 DB calls; SQLite Wasm + OPFS is bleeding-edge (no Safari OPFS); no background sync jobs; ~450MB database sync is impractical; 2M+ row snapshots table may exceed browser memory; estimated 16+ weeks. **This architecture was explored and deferred in favor of Architecture C.**

### Architecture C: Hybrid -- Hosted Shell + Turso BYOB (Recommended)

```
Browser -> HexTrackr (hosted Node.js app)
    | Microsoft Entra OAuth2 + PKCE (no client secret needed)
    | Session established (server-side, Redis/Turso session store)
    | First login: prompt for Turso DB URL + auth token
    | Turso credentials encrypted and stored in a "system" Turso DB (shared)
    | All vulnerability/ticket data routes use user's personal Turso DB
    | Background sync jobs (KEV, Cisco, Palo Alto) run server-side per-user
```

**Key Design Decisions**:

1. **Two-database model**:
   - **System DB** (single shared Turso instance, owned by operator): Stores user profiles (OAuth ID, display name, role), encrypted Turso credentials, app config. Small, cheap, one DB.
   - **User DB** (per-user Turso instance, owned by user): Contains all vulnerability data, tickets, templates, preferences, audit logs. User creates this in their own Turso account.

2. **OAuth provider**: Microsoft Entra ID (Azure AD) with PKCE flow. Supports any Microsoft tenant (multi-tenant app registration). Fallback: GitHub OAuth for non-Microsoft users.

3. **Turso credential flow**: User signs up, gets a "Connect Your Database" onboarding screen, creates a Turso DB (free tier), pastes URL + token. Server encrypts credentials with a per-user key derived from their OAuth identity.

4. **Schema management**: First connection runs `init-database.js` against user's empty Turso DB. Version tracked in a `schema_version` table. Migrations run against each connected user DB on first request after app upgrade.

5. **Background sync jobs**: KEV, Cisco PSIRT, Palo Alto sync run per-user on a schedule. Only for users who have configured the relevant API keys.

6. **Settings portability**: Users can export Turso credentials + preferences as encrypted JSON, or simply re-enter Turso URL on another device.

---

## Alternatives Considered and Rejected

| Alternative | Why Not |
|------------|---------|
| **Keep current auth, host publicly** | Not aligned with BYOB vision; doesn't scale to multiple users |
| **Supabase** | Not SQLite-compatible -- requires rewriting all 182 SQL call sites AND query syntax; vendor lock-in |
| **PocketBase** | Complete platform replacement, not a migration path from current codebase |
| **D1 (Cloudflare SQLite)** | No per-user database pattern; user data lives in operator's Cloudflare account |
| **Self-hosted libSQL** | Back to managing infrastructure; defeats the "hosted shell" purpose. Good fallback if Turso changes pricing. |
| **IndexedDB (Dexie.js)** | Requires rewriting all SQL logic; worse performance with 100k+ rows; complete architectural rewrite |

---

## Turso Technical Details

### SDK and Connectivity

- **Node.js SDK**: `@libsql/client` -- full SDK support, Promise-based
- **Browser SDK**: `@libsql/client/web` -- remote connections only (HTTP/WebSocket), works in all modern browsers
- **Embedded Replicas**: Local SQLite file that stays in sync with remote Turso DB (Node.js/Bun/Deno only). Could enable fast local reads, offline support, and reduced latency for read-heavy queries.

### Pricing

| Plan | Price | Storage | Databases | Rows Read/Month |
|------|-------|---------|-----------|----------------|
| Free | $0 | 5GB | 100 | 500M |
| Developer | $4.99/mo | 9GB | Unlimited | 2B |
| Scaler | $24.92/mo | 50GB | 10,000 | 10B |

For the current dataset (~450MB DB, ~95K current vulns, ~2M snapshots): Free tier is tight but workable for a single user. Developer tier ($5/mo) comfortably covers it. **User pays their own Turso bill** -- zero data hosting cost to the operator.

### Per-User Database Pattern

Turso explicitly supports and recommends per-user databases. Their architecture makes DB creation cheap (shared infrastructure, VM isolation). This validates Architecture C's two-database model.

---

## Codebase Impact Analysis

### High Impact (must change)

| Area | Current | Required Change | Effort |
|------|---------|----------------|--------|
| **Database driver** | `sqlite3` (callback) + `better-sqlite3` (sync) | `@libsql/client` (Promise-based) | High -- 182 call sites across 12 services |
| **Database connection model** | Single `global.db` at startup | Per-request `req.db` middleware | High -- every service's `initialize(db)` pattern changes |
| **Auth system** | Argon2id + express-session + CSRF | Microsoft Entra OAuth2 + PKCE via MSAL.js | Medium -- AuthService rewrite, middleware swap |
| **Session store** | `better-sqlite3-session-store` (local file) | Redis or Turso-backed session store | Medium |
| **DatabaseService pragmas** | WAL, mmap_size, page_size | Strip or conditionalize for Turso HTTP | Low |
| **Login UI** | Username/password form | "Sign in with Microsoft" button + Turso onboarding | Medium |

### Medium Impact (adapt)

| Area | Change Needed |
|------|--------------|
| **PreferencesService** | Add `turso_db_url`, `turso_auth_token` to sensitive key filters |
| **Frontend auth-state.js** | Replace password login with OAuth redirect; hide change-password for OAuth users |
| **CSRF middleware** | Add OAuth callback routes to exempt list |
| **Server startup** | Remove `global.db` pattern; create connection-per-request middleware |
| **User table schema** | Add `oauth_provider`, `oauth_id` columns; make `password_hash` nullable |

### Low Impact (minimal or no change)

| Area | Why |
|------|-----|
| **SQL queries** | Turso is SQLite-compatible -- all SQL strings work as-is |
| **Frontend UI** (grids, charts, modals) | No change -- they call API endpoints which work the same |
| **Route handlers** | Logic stays the same; only the DB handle source changes |
| **WebSocket layer** | No change -- still push notifications on data changes |
| **KEV/Cisco/Palo Alto sync services** | Logic identical, just use Turso client instead of sqlite3 |

### Service Layer Call Site Inventory

| Service | Call Sites | Complexity |
|---------|-----------|------------|
| vulnerabilityService | 33 | High -- bulk imports, aggregations |
| backupService | 27 | Medium -- backup/restore logic |
| ticketService | 19 | Medium -- CRUD + soft delete |
| ciscoAdvisoryService | 18 | Medium -- OAuth + sync |
| importService | 15 | High -- staging pipeline, transactions |
| kevService | 12 | Low -- sync + correlate |
| paloAltoService | 10 | Low -- sync |
| databaseService | 10 | High -- migrations, WAL, pragmas |
| loggingService | 8 | Low -- audit writes |
| locationService | 8 | Medium -- hostname parsing queries |
| templateService | 6 | Low -- CRUD |
| authService + preferencesService | 16 | Medium -- session, user prefs |

### Unguarded Legacy Endpoints (fix regardless)

Two endpoints in `server.js` have no auth guard:
- `GET /api/sites`
- `GET /api/locations`

These must be behind `requireAuth` or removed before any public deployment.

---

## Schema Changes for Turso

### Current Tables -> Turso Tables

| Current | Issue | Turso Design |
|---------|-------|-------------|
| `vulnerabilities_current` (flat) | All data in one wide table | Keep flat -- it works, add proper indexes |
| `tickets.devices` (JSON text) | LIKE '%hostname%' matching | New `ticket_devices` junction table (ticket_id, hostname) |
| `tickets.location` (plain text) | Implicit hostname->location | New `devices` table (hostname PK, location, site, vendor, device_type) |
| `kev_status` | CVE string JOIN | Keep -- already clean (CVE as PK) |
| `cisco_advisories` + `cisco_fixed_versions` | Already normalized (HEX-287) | Keep as-is |
| `palo_alto_advisories` | CVE string JOIN | Keep -- already clean |
| `vulnerability_daily_totals` | Write-through aggregates | Keep -- efficient for trend charts |
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

### Data Consolidation Strategy

**localStorage keys to migrate**:

| Key | Target Destination |
|-----|-------------------|
| `hextrackr-theme` | `user_preferences` table |
| `hextrackr_cache_metadata` | `sync_metadata` table |
| `ag-grid-state-*` | `user_preferences` table (serialized JSON) |
| `cveAPICache`, `cve_cache_*`, `pendingCVELookups` | Remove -- server-side CVE proxy |
| `cisco_client_id`, `cisco_client_secret` | Remove -- already in DB |
| `hextrackr_cache_metadata`, `hextrackr_last_load` | Remove -- server handles freshness |
| `hextrackr.chartViewState` | Keep or migrate to `user_preferences` |

**localStorage keys to keep**: `hextrackr-theme` (UI), AG-Grid state (UI), Hexagon bridge keys (transient).

### Migration Risks to Address

1. **`better-sqlite3` sync -> `@libsql/client` async**: Every `db.run()`/`db.get()`/`db.all()` becomes async/await
2. **`global.db` usage**: Import service uses global ref -- needs DI refactor
3. **Session store**: Separate `sessions.db` file -- keep local SQLite or use Redis/memory
4. **Aggregate write-through latency**: Turso remote writes for daily totals after import -- batch these
5. **Audit log AES-256-GCM blobs**: Binary-safe in libSQL, just verify

---

## Migration Roadmap

### Phase 0: Stabilize (HEX-362) -- IMMEDIATE

**Goal**: Clean baseline before any architectural work.

- [ ] Commit `databaseService.js` self-pattern fix
- [ ] Merge Dependabot PRs
- [ ] Guard unprotected endpoints: `/api/sites`, `/api/locations` (add requireAuth)
- [ ] Tag as a release
- [ ] Verify Portainer repo-based deploy works end-to-end

**Effort**: 1-2 sessions

### Phase 1: Cloudflare Tunnel + Auth Hardening

**Goal**: Secure remote access without app code changes.

- [ ] Create Cloudflare Tunnel on Portainer VM pointing to localhost:8989
- [ ] Configure Cloudflare Access policy: email OTP for authorized emails
- [ ] Add proxy host in NPM (or route tunnel directly)
- [ ] Test: external access requires Cloudflare email OTP then app login as normal
- [ ] Activate Helmet.js (already installed, just unused)
- [ ] Tighten CORS to specific origins only

**Effort**: 1-2 sessions. Zero app code changes for tunnel. Minor changes for Helmet/CORS.

**Why first**: Solves the security concern immediately. Everything after this is internal refactoring.

### Phase 2: Turso Schema Design -- FOUNDATION

**Goal**: Design a clean, normalized schema that handles the full dataset.

- Validate current tables against Turso compatibility
- Design new `devices` and `ticket_devices` tables
- Plan schema migration path for existing data

**Effort**: 2-3 sessions for schema design + validation against actual data.

### Phase 3: Database Abstraction Layer (HEX-363) -- CRITICAL PATH

**Goal**: Wrap all 182 database call sites behind an adapter interface so SQLite and Turso can coexist.

**Adapter Pattern**:

```javascript
class DatabaseAdapter {
    async run(sql, params) {}
    async get(sql, params) {}
    async all(sql, params) {}
    async transaction(fn) {}
}

class SQLiteAdapter extends DatabaseAdapter { /* wraps better-sqlite3 */ }
class TursoAdapter extends DatabaseAdapter { /* wraps @libsql/client */ }
```

**Migration Order** (lowest risk first):

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

### Phase 4: Dual-Path Pipeline

**Goal**: CSV import writes to both SQLite (legacy) and Turso simultaneously.

- [ ] Import pipeline writes to both adapters
- [ ] External syncs (KEV, Cisco, Palo Alto) write to both
- [ ] Daily totals aggregation writes to both
- [ ] Validation: compare row counts and checksums between both DBs
- [ ] Feature flag: `TURSO_ENABLED=true` to activate dual-write

**Effort**: 1-2 weeks. Depends on Phase 3 adapter being complete.

### Phase 5: API v2 Endpoints

**Goal**: New endpoints backed by Turso with server-side aggregation, proper pagination, and minimal client-side processing.

**Dashboard Load** (currently 7+ parallel fetches, target 1-2):

```
GET /api/v2/dashboard
  -> { stats, trends, recentTrends, deviceStats, cvssDistribution, severityDistribution, recentVulns }

GET /api/v2/vulnerabilities?page=1&limit=100&sort=severity&filter=...
  -> { data, pagination, enrichment: { kevFlags, ticketCounts, fixedVersions } }
```

**Key Changes**:
- All enrichment (KEV badges, ticket counts, fixed versions) done server-side in the query
- Ticket-device correlation uses new `ticket_devices` junction table (no more LIKE matching)
- Location grouping uses `devices` table (no more per-request hostname parsing)
- Client receives ready-to-render data -- no `.reduce()/.filter()/.map()` on 50k+ arrays

**Effort**: 2-3 weeks.

### Phase 6: Frontend Module Migration

**Goal**: Swap each page from localStorage + legacy API to v2 endpoints, one module at a time.

**Module Order** (by independence):

1. **Dashboard cards** (stats, trends, % changes) -- pure API read
2. **Vulnerability grid** -- swap to v2 paginated endpoint with server enrichment
3. **Location cards** -- swap to v2 with pre-grouped data
4. **Device security modal** -- swap to v2 device endpoint
5. **Ticket system** -- swap to v2 with junction table lookups
6. **CVE search/lookup** -- move Cisco/Palo Alto/MITRE lookups to backend proxy
7. **Import pipeline** -- point at Turso-only path
8. **Settings/preferences** -- already migrated to DB

**Effort**: 3-4 weeks, ~1 module per 2 sessions.

### Phase 7: Cutover + Cleanup

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
|-------|--------|-------------|
| Phase 0: Stabilize | 1-2 sessions | None |
| Phase 1: Cloudflare Tunnel | 1-2 sessions | None (parallel with Phase 0) |
| Phase 2: Turso Schema | 2-3 sessions | Phase 0 |
| Phase 3: DB Abstraction | 2-3 weeks | Phase 2 |
| Phase 4: Dual Pipeline | 1-2 weeks | Phase 3 |
| Phase 5: API v2 | 2-3 weeks | Phase 3 |
| Phase 6: Frontend Migration | 3-4 weeks | Phase 5 |
| Phase 7: Cutover | 1 week | Phase 6 |

Phases 4 and 5 can run in parallel once Phase 3 is done.

**"A little each night" pace**: Phase 0-1 first week, Phase 2 next week, then ~1 service per session through Phase 3. Realistic 2-3 month timeline at evening pace.

---

## Security Analysis

### Threat Model for Architecture C

| Threat | Mitigation | Residual Risk |
|--------|-----------|---------------|
| **Server sees Turso credentials** | Encrypt at rest with per-user key derived from OAuth identity; decrypt only for active requests | Medium -- server compromise exposes encrypted creds |
| **Turso token theft** | Tokens are scoped to specific DBs; user can rotate/revoke anytime | Low -- blast radius limited to one user's DB |
| **OAuth token theft** | PKCE prevents code interception; tokens are short-lived (1h) with refresh | Low -- standard OAuth security model |
| **Multi-tenant data leakage** | Each user has a physically separate Turso DB -- no shared tables | Very Low -- strongest isolation possible |
| **CSRF on public instance** | Existing csrf-sync pattern works; OAuth callback exempt | Low |
| **XSS -> credential theft** | Turso creds stored server-side only, never sent to browser | Low |
| **Unguarded endpoints** | `/api/sites` and `/api/locations` need `requireAuth` | Fix before deploy |
| **DDoS on hosted instance** | Cloudflare proxy or hosting provider's DDoS protection | Medium -- depends on hosting |
| **Audit log encryption key** | Currently in `audit_log_config` table -- would be in user's Turso DB | Low -- user controls their own key |

### Microsoft Entra OAuth2 + PKCE Implementation

- **Flow**: Authorization Code with PKCE (no client secret for SPA portion)
- **Library**: MSAL.js v2 (`@azure/msal-browser` for frontend, `@azure/msal-node` for backend)
- **App registration**: Multi-tenant (any Microsoft account can sign in)
- **Scopes needed**: `openid`, `profile`, `email` (basic identity only)
- **Token storage**: Server-side session only (never in localStorage for security)
- **Refresh**: MSAL handles token refresh automatically
- **Fallback provider**: GitHub OAuth (for users without Microsoft accounts)

### Data Sovereignty

The BYOB Turso model provides strong data sovereignty:
- User creates their own Turso account and database
- User controls the Turso region (US, EU, etc.)
- User can delete their data by deleting their Turso DB
- If HexTrackr shuts down, user still has their Turso DB (it's standard SQLite)
- No vendor lock-in on the data layer

---

## Open Questions

1. **Should we keep local auth as a fallback?** Self-hosted users may want to keep username/password auth. The database abstraction layer would let the same codebase work with either SQLite or Turso. Should OAuth be additive or a replacement?

2. **Where does the system DB live?** The shared database storing user profiles and encrypted Turso credentials needs to be reliable and cheap. Options: a single Turso DB (free tier), a Fly.io SQLite volume, or a managed Postgres.

3. **Schema migration for N user databases**: When a new version ships with schema changes, how do we migrate all connected user DBs? Options: lazy migration (on first request per user), or a background job that connects to each user's DB and runs migrations.

4. **Vulnerability snapshot table size**: `vulnerability_snapshots` has ~2M rows (~450MB). Is this practical over Turso's HTTP API? Read latency and data transfer costs could be significant. Consider: archiving old snapshots, pagination, or keeping snapshots local-only.

5. **Cisco OAuth and Palo Alto scraping**: These background sync features require API keys. In a multi-user model, each user needs their own Cisco API credentials. Is this realistic for public users, or is this a power-user feature?

6. **What is the MVP?** The minimum viable public version might be: OAuth login + paste your Turso URL + vulnerability import/view + tickets. No background sync, no Cisco/Palo Alto integration, no audit logs. Ship fast, iterate.

7. **Licensing**: If HexTrackr becomes a public service, what license applies? Currently no LICENSE file in the repo. Need to decide: open source (MIT/Apache), source-available (BSL), or proprietary.

---

## Linear Issues

| Issue | Title | Status | Notes |
|-------|-------|--------|-------|
| HEX-361 | BYOB Turso Architecture (Epic) | Todo | Parent epic |
| HEX-362 | Phase 0: Stabilize | Todo, URGENT | Immediate blocker |
| HEX-363 | Phase 1: DB Abstraction Layer | Todo | Maps to Phase 3 in roadmap |
| HEX-364 | Phase 2: OAuth (Entra) | Todo | May be replaced by Cloudflare Tunnel approach |
| HEX-365 | Phase 3: Per-user Turso | Todo | Future -- after single-user migration works |
| HEX-366 | Phase 4: Multi-user sync | Todo | Future |
| HEX-367 | Phase 5: Public hosting | Todo | Future |
| HEX-368 | Phase 6: Settings portability | Todo | Future |
| HEX-360 | Vuln Ignore/Mitigation | Backlog | Parked for post-migration |
| HEX-354 | NVD API Integration | Backlog | Parked for post-migration |

---

## Recommendation

Architecture C (Hosted Shell + Turso BYOB) is the recommended path. The codebase is stable. The biggest risk is the 182-callsite database driver migration, but that is mechanical work that can be done incrementally with a clean adapter pattern. The Turso BYOB model elegantly solves the "I don't want to manage users' data" problem while still letting the server run background sync jobs that a pure client-side app cannot.

The earlier Architecture B research (full client-side with SQLite Wasm + Dropbox) is valuable reference but has been archived as "explored and deferred."

---

## Sources

- [Turso Per-User Database Architecture](https://turso.tech/multi-tenancy)
- [Turso Pricing](https://turso.tech/pricing)
- [Turso JavaScript SDK](https://docs.turso.tech/sdk/ts/quickstart)
- [Turso HTTP API](https://turso.tech/blog/bring-your-own-sdk-with-tursos-http-api)
- [Microsoft Entra OAuth2 + PKCE Flow](https://learn.microsoft.com/en-us/entra/identity-platform/v2-oauth2-auth-code-flow)
- [MSAL Authentication Flows](https://learn.microsoft.com/en-us/entra/identity-platform/msal-authentication-flows)

---

## Related

- [[Database Schema]]
- [[Schema Evolution]]
- [[Database Architecture]]
- [Backend Architecture](/Volumes/DATA/GitHub/Devops/DocVault/Projects/HexTrackr/Backend%20Architecture.md)
- [Security Architecture](/Volumes/DATA/GitHub/Devops/DocVault/Projects/HexTrackr/Security%20Architecture.md)
- [[Architecture]]
