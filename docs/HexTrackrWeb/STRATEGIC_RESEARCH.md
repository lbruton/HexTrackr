# HexTrackr Public Hosting — Strategic Research Document

**Date**: 2026-03-08
**Author**: Claude Code (synthesized from codebase analysis, Linear state, session history, and web research)
**Status**: Draft — brainstorming, no decisions committed

---

## 1. Context and Motivation

HexTrackr is an enterprise vulnerability management system currently self-hosted on a Portainer VM behind Nginx Proxy Manager. Getting approval to host internally at work has been slow. The goal is to host a publicly accessible instance that:

- Can be used for day-job vulnerability tracking without waiting for IT approval
- Could eventually be offered as a service to others
- Avoids managing user accounts, passwords, or PII
- Lets each user bring their own data store (BYOB pattern)

**Current Version**: v1.1.12 on `dev` branch
**Linear State**: 0 issues in progress, 2 in Todo (HEX-360 ignore/mitigation system, HEX-354 NVD research), no architectural/migration issues exist yet

---

## 2. Two Competing Architectures

Prior brainstorming produced two distinct approaches. This section compares them.

### Architecture A: "Thin Shell" (Current Thinking)

**Keep the Node.js/Express backend, swap SQLite for Turso, add OAuth.**

```
Browser → HexTrackr (Cloudflare/Vercel/static host)
    ↓ OAuth (Microsoft Entra / O365)
    ↓ Authenticated session
    ↓ User provides Turso DB URL + auth token (stored in preferences)
    ↓ All API calls use user's Turso DB as the backend
    ↓ Settings/Turso key synced to OneDrive or Dropbox for portability
```

| Component | Current | Architecture A |
|-----------|---------|---------------|
| Hosting | Docker (self-hosted) | Node.js on Fly.io / Railway / VPS |
| Backend | Node.js/Express | Same — kept |
| Database | SQLite (local file) | Turso (per-user remote DB) |
| Auth | Argon2id local passwords | OAuth (Microsoft Entra + PKCE) |
| Data ownership | Server-controlled | User-controlled (BYOB Turso DB) |
| Settings sync | N/A | OneDrive/Dropbox JSON file |

**Pros**:
- Preserves existing Express routes, controllers, middleware (minimal rewrite)
- Turso is SQLite-compatible at the query level — SQL strings don't change
- Node.js can use `@libsql/client` natively (full SDK support)
- Server-side can still run background sync jobs (KEV, Cisco PSIRT, Palo Alto)
- Simpler deployment — single Node.js app, no browser WASM complexity
- Turso free tier: 5GB storage, 100 databases, 500M rows read/month
- Per-user database is a first-class Turso pattern (they have templates for it)

**Cons**:
- Still requires a running server (hosting cost, uptime responsibility)
- 182 direct `this.db.*` call sites across 12 services need driver swap (callback → Promise)
- Session store (`better-sqlite3-session-store`) needs replacement
- WAL/PRAGMA optimizations (databaseService.js:92-105) are meaningless over HTTP — must be stripped
- Each user's Turso DB needs schema migrations propagated to it
- Turso auth tokens in user preferences = secrets management concern
- Server sees user's Turso credentials (trust boundary)

### Architecture B: "Full Client-Side" (Earlier Research — docs/HexTrackrWeb/)

**Eliminate the backend entirely. SQLite Wasm in the browser, Dropbox for sync.**

```
Browser → Static site (Cloudflare Pages)
    ↓ Dropbox OAuth
    ↓ Download encrypted master.enc from Dropbox vault
    ↓ Decrypt → load into SQLite Wasm (OPFS)
    ↓ All queries run in-browser
    ↓ On save: snapshot → encrypt → upload to Dropbox
```

| Component | Current | Architecture B |
|-----------|---------|---------------|
| Hosting | Docker (self-hosted) | Cloudflare Pages (free static) |
| Backend | Node.js/Express | None — fully client-side |
| Database | SQLite (local file) | SQLite Wasm (browser OPFS) |
| Auth | Argon2id local passwords | Dropbox/OneDrive/Google OAuth |
| Data ownership | Server-controlled | User-controlled (encrypted in their cloud) |
| Settings sync | N/A | Stored in cloud vault alongside DB |

**Pros**:
- Zero server cost (Cloudflare Pages free tier)
- Zero server to maintain, no uptime responsibility
- Maximum data privacy — server never sees user data
- No secrets on server (Turso tokens, API keys — all client-side)
- Works offline (OPFS persistence)
- Reuses same SQL schema (SQLite Wasm is SQL-compatible)

**Cons**:
- **Massive rewrite**: All 17 route modules, all controllers, 182 DB calls must be ported to browser modules
- SQLite Wasm + OPFS is bleeding-edge (browser compat: Chrome 102+, Firefox 111+, no Safari OPFS)
- No background sync jobs possible — KEV, Cisco PSIRT, Palo Alto scrapers can't run without a server
- CSV import of 95K+ rows in-browser via Web Workers — untested at scale
- Sync conflicts between devices (Last Write Wins is lossy)
- ~450MB database file upload/download on every sync is impractical
- 2M+ row `vulnerability_snapshots` table may exceed browser memory
- Complete retirement of Express, Passport.js, all middleware
- Estimated 16+ weeks of work across 7 phases

---

## 3. Recommended Architecture: Hybrid "C" (New Proposal)

Neither A nor B is ideal alone. A hybrid approach gets the best of both:

### Architecture C: "Hosted Shell + Turso BYOB"

```
Browser → HexTrackr (hosted Node.js app)
    ↓ Microsoft Entra OAuth2 + PKCE (no client secret needed)
    ↓ Session established (server-side, Redis/Turso session store)
    ↓ First login: prompt for Turso DB URL + auth token
    ↓ Turso credentials encrypted and stored in a "system" Turso DB (shared)
    ↓ All vulnerability/ticket data routes use user's personal Turso DB
    ↓ Background sync jobs (KEV, Cisco, Palo Alto) run server-side per-user
```

**Key Design Decisions**:

1. **Two-database model**:
   - **System DB** (single shared Turso instance, owned by you): Stores user profiles (OAuth ID, display name, role), encrypted Turso credentials, app config. Small, cheap, one DB.
   - **User DB** (per-user Turso instance, owned by user): Contains all vulnerability data, tickets, templates, preferences, audit logs. User creates this in their own Turso account.

2. **OAuth provider**: Microsoft Entra ID (Azure AD) with PKCE flow
   - Your workplace uses O365 — you can authenticate immediately
   - Entra supports SPAs with PKCE (no client secret needed for the auth code flow)
   - MSAL.js library handles token acquisition, refresh, and caching
   - Users from any Microsoft tenant can sign in (multi-tenant app registration)
   - Fallback: Add GitHub OAuth as a second provider for non-Microsoft users

3. **Turso credential flow**:
   - User signs up → gets a "Connect Your Database" onboarding screen
   - They create a Turso DB (free tier: 5GB, 100 DBs) and generate an auth token
   - They paste the URL + token into HexTrackr
   - Server encrypts credentials with a per-user key derived from their OAuth identity
   - On each request, server decrypts and connects to user's Turso DB
   - User can rotate their token anytime; revoke = instant data disconnection

4. **Schema management**:
   - First connection: server runs `init-database.js` against user's empty Turso DB
   - Version tracked in a `schema_version` table
   - On app upgrade: migration scripts run against each connected user DB on first request

5. **Background sync jobs**:
   - KEV, Cisco PSIRT, Palo Alto advisory sync run per-user on a schedule
   - Only for users who have configured the relevant API keys in their preferences
   - Jobs use the user's Turso DB connection

6. **Settings portability** (optional enhancement):
   - Users can export their Turso credentials + preferences as an encrypted JSON file
   - Store in OneDrive/Dropbox for cross-device portability
   - Or: simply log in on another device and re-enter Turso URL (it's just two strings)

---

## 4. Codebase Impact Analysis

### What changes (Architecture C)

#### High Impact (must change)

| Area | Current | Required Change | Effort |
|------|---------|----------------|--------|
| **Database driver** | `sqlite3` (callback) + `better-sqlite3` (sync) | `@libsql/client` (Promise-based) | High — 182 call sites across 12 services |
| **Database connection model** | Single `global.db` at startup | Per-request `req.db` middleware | High — every service's `initialize(db)` pattern changes |
| **Auth system** | Argon2id + express-session + CSRF | Microsoft Entra OAuth2 + PKCE via MSAL.js | Medium — AuthService rewrite, middleware swap |
| **Session store** | `better-sqlite3-session-store` (local file) | Redis or Turso-backed session store | Medium |
| **DatabaseService pragmas** | WAL, mmap_size, page_size (lines 92-105) | Strip or conditionalize for Turso HTTP | Low |
| **Login UI** | Username/password form | "Sign in with Microsoft" button + Turso onboarding | Medium |

#### Medium Impact (adapt)

| Area | Change Needed |
|------|--------------|
| **PreferencesService** | Add `turso_db_url`, `turso_auth_token` to sensitive key filters (lines 344-353, 419-428) |
| **Frontend auth-state.js** | Replace password login with OAuth redirect; hide change-password for OAuth users |
| **CSRF middleware** | Add OAuth callback routes to exempt list (server.js:241) |
| **Server startup** | Remove `global.db = db` pattern; create connection-per-request middleware |
| **User table schema** | Add `oauth_provider`, `oauth_id` columns; make `password_hash` nullable |

#### Low Impact (minimal or no change)

| Area | Why |
|------|-----|
| **SQL queries** | Turso is SQLite-compatible — all SQL strings work as-is |
| **Frontend UI** (grids, charts, modals) | No change — they call API endpoints which work the same |
| **Route handlers** | Logic stays the same; only the DB handle source changes |
| **WebSocket layer** | No change — still push notifications on data changes |
| **KEV/Cisco/Palo Alto sync services** | Logic identical, just use Turso client instead of sqlite3 |

### Specific Files Requiring Changes

**Critical path** (must change for any architecture):
- `app/services/databaseService.js` — Complete rewrite of connection layer
- `app/services/authService.js` — OAuth replacement
- `app/middleware/auth.js` — Session store swap, OAuth middleware
- `app/public/server.js` — Remove `global.db`, add per-request DB middleware
- `app/public/scripts/shared/auth-state.js` — OAuth flow in frontend
- `app/public/login.html` — OAuth login button

**Service layer** (182 DB call sites to migrate):
- `app/services/vulnerabilityService.js` (33 calls)
- `app/services/backupService.js` (27 calls)
- `app/services/ticketService.js` (19 calls)
- `app/services/ciscoAdvisoryService.js` (18 calls)
- `app/services/preferencesService.js` (16 calls)
- `app/services/kevService.js` (15 calls)
- `app/services/vulnerabilityStatsService.js` (14 calls)
- `app/services/paloAltoService.js` (13 calls)
- `app/services/authService.js` (11 calls)
- `app/services/loggingService.js` (8 calls)
- `app/services/templateService.js` (7 calls)
- `app/services/locationService.js` (1 call)

### Unguarded Legacy Endpoints (fix regardless)

Two endpoints in `server.js` (lines 306-324) have **no auth guard**:
- `GET /api/sites` (inline, line ~306)
- `GET /api/locations` (inline, line ~316)

These should be behind `requireAuth` or removed before any public deployment.

---

## 5. Security Analysis

### Threat Model for Architecture C

| Threat | Mitigation | Residual Risk |
|--------|-----------|---------------|
| **Server sees Turso credentials** | Encrypt at rest with per-user key derived from OAuth identity; decrypt only for active requests | Medium — server compromise exposes encrypted creds |
| **Turso token theft** | Tokens are scoped to specific DBs; user can rotate/revoke anytime | Low — blast radius limited to one user's DB |
| **OAuth token theft** | PKCE prevents code interception; tokens are short-lived (1h) with refresh | Low — standard OAuth security model |
| **Multi-tenant data leakage** | Each user has a physically separate Turso DB — no shared tables | Very Low — strongest isolation possible |
| **CSRF on public instance** | Existing csrf-sync pattern works; OAuth callback exempt | Low |
| **XSS → credential theft** | Turso creds stored server-side only, never sent to browser | Low |
| **Unguarded endpoints** | `/api/sites` and `/api/locations` need `requireAuth` | Fix before deploy |
| **DDoS on hosted instance** | Cloudflare proxy or hosting provider's DDoS protection | Medium — depends on hosting |
| **Audit log encryption key** | Currently in `audit_log_config` table — would be in user's Turso DB | Low — user controls their own key |

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

## 6. Turso Technical Details

### Browser SDK (`@libsql/client/web`)

- Supports **remote connections only** (no local file access)
- Uses HTTP/WebSocket to communicate with Turso server
- Works in all modern browsers
- This means: if we ever want a hybrid (server + optional client-side), the same SDK works

### Pricing (as of 2026)

| Plan | Price | Storage | Databases | Rows Read/Month |
|------|-------|---------|-----------|----------------|
| Free | $0 | 5GB | 100 | 500M |
| Developer | $4.99/mo | 9GB | Unlimited | 2B |
| Scaler | $24.92/mo | 50GB | 10,000 | 10B |

For our use case (single user, ~450MB DB, ~95K current vulns, ~2M snapshots):
- Free tier is tight but workable for a single user
- Developer tier ($5/mo) comfortably covers it
- **User pays their own Turso bill** — zero cost to us for data hosting

### Per-User Database Pattern

Turso explicitly supports and recommends per-user databases. Their architecture makes DB creation cheap (shared infrastructure, VM isolation). This validates Architecture C's two-database model.

### Embedded Replicas (Future Enhancement)

Turso supports "embedded replicas" — a local SQLite file that stays in sync with the remote Turso DB. Currently Node.js/Bun/Deno only (not browser). This could enable:
- Fast local reads with remote write consistency
- Offline support for the Node.js server
- Reduced latency for read-heavy vulnerability queries

---

## 7. Migration Strategy

### Phase 0: Stabilize Current Build (1-2 days)

- [ ] Commit the uncommitted `databaseService.js` `self` pattern fix
- [ ] Merge Dependabot PRs (#6, #7, #8)
- [ ] Tag current state as a release (v1.1.12 or v1.2.0)
- [ ] Fix unguarded `/api/sites` and `/api/locations` endpoints
- [ ] Close or park HEX-360 and HEX-354 (decide if they proceed on current arch or wait for new arch)

### Phase 1: Database Abstraction Layer (1-2 weeks)

- [ ] Create `DatabaseAdapter` interface wrapping all DB operations
- [ ] Implement `SQLiteAdapter` (current driver, maintains backwards compat)
- [ ] Implement `TursoAdapter` (`@libsql/client`, Promise-based)
- [ ] Refactor all 12 services to use `DatabaseAdapter` instead of raw `this.db.*`
- [ ] This is the hardest phase — 182 call sites across 12 services
- [ ] All existing functionality must work identically with `SQLiteAdapter`

### Phase 2: OAuth Integration (1 week)

- [ ] Register app in Microsoft Entra (Azure AD) — multi-tenant
- [ ] Add MSAL.js to frontend, MSAL Node to backend
- [ ] Create OAuth callback routes
- [ ] Modify `AuthService` to support both local password and OAuth
- [ ] Keep local auth as fallback for self-hosted users
- [ ] Update login UI with "Sign in with Microsoft" button

### Phase 3: Per-User Turso Connection (1 week)

- [ ] Add Turso onboarding flow (UI to input DB URL + auth token)
- [ ] Create system DB schema (user profiles, encrypted Turso creds)
- [ ] Build per-request DB middleware (`req.db = getTursoClientForUser(req.user)`)
- [ ] Schema initialization on first connection to a new user DB
- [ ] Connection pooling/caching for active users

### Phase 4: Background Sync Adaptation (1 week)

- [ ] Modify KEV, Cisco, Palo Alto sync services to work per-user
- [ ] Scheduler that iterates connected users and runs sync with their DB
- [ ] Respect user's API key preferences (only sync if keys configured)

### Phase 5: Hosting and Security Hardening (1 week)

- [ ] Deploy to Fly.io / Railway / VPS
- [ ] Add Cloudflare proxy for DDoS protection
- [ ] Security audit: OWASP top 10 review
- [ ] Rate limiting on public endpoints
- [ ] Penetration testing

### Phase 6: Settings Portability (optional, 1 week)

- [ ] OneDrive/Dropbox integration for credential backup
- [ ] Export/import settings as encrypted JSON
- [ ] Cross-device onboarding flow

---

## 8. Alternative Approaches Considered

### Alt 1: Keep Current Auth, Just Host Publicly

- Simply deploy current Docker image to a VPS with strong passwords
- Pros: Zero code changes, immediate deployment
- Cons: Managing user accounts, password resets, security liability for credential storage
- **Verdict**: Not aligned with BYOB vision; doesn't scale to multiple users

### Alt 2: Supabase Instead of Turso

- PostgreSQL-based, built-in auth (including OAuth), row-level security
- Pros: Auth + DB + storage in one platform; RLS provides multi-tenant isolation without per-user DBs
- Cons: **Not SQLite-compatible** — would require rewriting all 182 SQL call sites AND query syntax; vendor lock-in; more expensive at scale
- **Verdict**: Too much rewrite for unclear benefit. Turso's SQLite compatibility is a major advantage.

### Alt 3: PocketBase

- Go-based backend with built-in SQLite, auth, and REST API
- Pros: Batteries-included; each user could self-host their own PocketBase instance
- Cons: Complete platform replacement, not a migration path from current codebase
- **Verdict**: Interesting for a greenfield project, not practical for migrating HexTrackr

### Alt 4: D1 (Cloudflare's SQLite)

- Cloudflare's serverless SQLite database
- Pros: Native integration with Cloudflare Pages/Workers; SQLite-compatible
- Cons: No per-user database pattern; all data in your Cloudflare account; less mature than Turso
- **Verdict**: Viable but doesn't support BYOB — user data lives in your Cloudflare account

### Alt 5: Self-Hosted libSQL (Turso Open Source)

- Run your own Turso-compatible server
- Pros: No Turso dependency, no usage-based pricing
- Cons: You're back to managing infrastructure; defeats the "hosted shell" purpose
- **Verdict**: Good fallback if Turso changes pricing; not the primary path

---

## 9. Open Questions

1. **Should we keep local auth as a fallback?** Self-hosted users (current deployment) may want to keep username/password auth. The database abstraction layer (Phase 1) would let the same codebase work with either SQLite or Turso. Should OAuth be additive or a replacement?

2. **Where does the system DB live?** The shared database storing user profiles and encrypted Turso credentials needs to be reliable and cheap. Options: a single Turso DB (free tier), a Fly.io SQLite volume, or a managed Postgres.

3. **Schema migration for N user databases**: When we ship a new version with schema changes, how do we migrate all connected user DBs? Options: lazy migration (on first request per user), or a background job that connects to each user's DB and runs migrations.

4. **Vulnerability snapshot table size**: `vulnerability_snapshots` has ~2M rows (~450MB). Is this practical over Turso's HTTP API? Read latency and data transfer costs could be significant. Consider: archiving old snapshots, pagination, or keeping snapshots local-only.

5. **Cisco OAuth and Palo Alto scraping**: These background sync features require API keys. In a multi-user model, each user needs their own Cisco API credentials. Is this realistic for public users, or is this a power-user feature?

6. **What's the MVP?** The minimum viable public version might be: OAuth login + paste your Turso URL + vulnerability import/view + tickets. No background sync, no Cisco/Palo Alto integration, no audit logs. Ship fast, iterate.

7. **Licensing**: If HexTrackr becomes a public service, what license applies? Currently no LICENSE file in the repo. Need to decide: open source (MIT/Apache), source-available (BSL), or proprietary.

---

## 10. Recommendation

**Yes, this is worth pursuing, and now is a good time.**

The codebase is stable (50 issues closed, clean Linear state, only 2 open items). The biggest risk is the 182-callsite database driver migration, but that's mechanical work that can be done incrementally with a clean adapter pattern. The Turso BYOB model elegantly solves the "I don't want to manage users' data" problem while still letting you run background sync jobs that a pure client-side app can't.

**Suggested next step**: Don't start coding yet. Create a Linear epic for "HexTrackr Public Hosting" with child issues for each phase. Run Phase 0 (stabilize + tag release) first. Then tackle Phase 1 (database abstraction) as the critical-path work — everything else depends on it.

The earlier `docs/HexTrackrWeb/` research (Architecture B — full client-side) is valuable reference but should be archived as "explored and deferred." The hybrid Architecture C keeps your existing investment in the Express backend while adding the BYOB capability you want.

---

## Sources

- [Turso Per-User Database Architecture](https://turso.tech/multi-tenancy)
- [Turso Pricing](https://turso.tech/pricing)
- [Turso JavaScript SDK](https://docs.turso.tech/sdk/ts/quickstart)
- [Turso HTTP API (Bring Your Own SDK)](https://turso.tech/blog/bring-your-own-sdk-with-tursos-http-api-ff4ccbed)
- [Microsoft Entra OAuth2 + PKCE Flow](https://learn.microsoft.com/en-us/entra/identity-platform/v2-oauth2-auth-code-flow)
- [MSAL Authentication Flows](https://learn.microsoft.com/en-us/entra/identity-platform/msal-authentication-flows)
- [Application Types for Microsoft Identity Platform](https://learn.microsoft.com/en-us/entra/identity-platform/v2-app-types)
