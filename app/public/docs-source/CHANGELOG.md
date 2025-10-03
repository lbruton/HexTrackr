# Changelog

All notable changes to HexTrackr will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.44] - 2025-10-03

### Enhanced

#### HEX-121: ESLint 9+ Migration and Code Quality Improvements

**Achievement**: Successfully migrated from ESLint 8 to ESLint 9 with flat config format and achieved complete code quality compliance across entire codebase.

**Implementation**:
- Migrated ESLint configuration from legacy `.eslintrc.json` to modern `eslint.config.mjs` flat config format
- Updated all ESLint dependencies to version 9+ with proper plugin integrations
- Added comprehensive JSDoc comments to all JavaScript functions (frontend and backend)
- Fixed 32 unused variable warnings through systematic 5-phase incremental approach
- Improved error handling and input validation across all modules
- Enhanced code maintainability with proper documentation standards

**Impact**:
- **100% ESLint Compliance**: Zero linting errors across entire JavaScript codebase
- **Enhanced Documentation**: Every function now has complete JSDoc comments for better developer experience
- **Bug Fixes**: Discovered and fixed 1 functional bug (button state restoration in progress-modal.js)
- **Code Quality**: Eliminated false positives with proper inline documentation
- **Team Productivity**: Clean linting results enable faster development without tool noise

**Files Modified** (20+ files across frontend and backend):
- ESLint configuration: `eslint.config.mjs` (new flat config format)
- Frontend modules: tickets.js, vulnerability components, modal managers, theme controllers
- Backend services: templateService.js, ticketService.js, importService.js, progressService.js
- Utilities: logging.js, docs.js, and various helper modules

**Quality Metrics**:
- Unused variables: 32 → 0 errors (100% reduction)
- JSDoc coverage: 100% (all functions documented)
- Code complexity: Improved through refactoring and documentation
- False positives: Properly documented with explanations

**Related Issues**: HEX-122 (theme color investigation), HEX-123 (CSV import fix)

**Linear Issue**: [HEX-121](https://linear.app/hextrackr/issue/HEX-121)

### Fixed

#### HEX-123: CSV Import Bug - Nginx Body Size Limit

**Issue**: CSV imports failed silently for files larger than 1MB with HTTP 413 (Payload Too Large) error. Users experienced import failures without clear error messages, making large dataset imports impossible.

**Root Cause**:
- **Nginx Default Limit**: `client_max_body_size 1m` (1MB default) was rejecting CSV uploads before they reached Express backend
- **Express Configuration**: Backend was configured to accept up to 100MB (`body-parser` limit), but nginx reverse proxy rejected requests first
- **Silent Failure**: HTTP 413 errors weren't properly surfaced to frontend, causing confusing "import failed" messages

**Solution**:
- Added `client_max_body_size 100m;` to nginx.conf http block to match Express 100MB limit
- Enhanced nginx configuration with complete HTTP server block for development environment
- Added proper error handling for HTTP error responses in frontend import code
- Prevented JSON parse errors on non-JSON HTTP error responses

**Technical Implementation**:
```nginx
http {
    # Allow large CSV file uploads (matches Express body-parser limit)
    client_max_body_size 100m;

    # Additional production-ready nginx configuration
    # (gzip compression, proxy headers, timeouts, etc.)
}
```

**Testing**:
- Successfully imported 3.7MB CSV file with 25,000+ vulnerabilities
- Verified import progress tracking and completion
- Confirmed data integrity and proper database updates

**Impact**:
- **Large Dataset Support**: CSV files up to 100MB now import successfully
- **Better Error Handling**: Clear error messages for upload failures
- **Production Ready**: nginx configuration matches Express backend limits
- **User Experience**: Eliminates silent failures and confusing error messages

**Files Modified**:
- `docker/nginx/nginx.conf` - Added client_max_body_size directive
- Frontend import handlers - Enhanced HTTP error response handling

**Commit**: 72b0f29

**Linear Issue**: [HEX-123](https://linear.app/hextrackr/issue/HEX-123)

---

## [1.0.43] - 2025-10-03

### Fixed

#### HEX-121: ESLint Unused Variable Cleanup (32 → 0 Errors)

**Issue**: 32 ESLint unused variable warnings after configuration improvements in DOCS-25 and DOCS-33. Mix of false positives, intentionally unused parameters, and genuine dead code.

**Solution**:
- Fixed 26 genuine unused variables/parameters via 5 incremental phases
- Fixed 1 actual bug: progress-modal.js button restoration using hardcoded text instead of captured originalText
- Documented 4 false positives with inline ESLint disable comments and explanations
- Identified 1 function (getVPRContrastColorsFromCSS) for investigation with HEX-122 theme controller issue

**Impact**:
- 100% ESLint error reduction (32 → 0)
- 1 functional bug fixed (button state restoration)
- Codebase clarity improved with explicit intent signaling (underscore prefixes for intentionally unused)
- Better developer experience with clean linting results

**Incremental Testing Strategy**:
- Phase 1: 8 catch block prefixes (32 → 24) - Zero functionality risk
- Phase 2: 11 parameter prefixes (24 → 14) - Low-risk API contracts
- Phase 3: 7 safe cleanups (14 → 7) - Dead code removal
- Phase 4: 1 bug fix + 2 export fixes (7 → 4) - Button restoration
- Phase 5: 3 false positive docs + 1 HEX-122 link (4 → 0) - Documentation

**Files Modified** (20 files):
- catch block error prefixes: tickets.js, ag-grid-theme-manager.js, modal-monitoring.js, template-editor.js, ticket-markdown-editor.js, chart-theme-adapter.js, theme-controller.js, templateService.js, ticketService.js
- Parameter prefixes: fix-truncated-cves.js, header.js, vulnerability-grid.js, vulnerability-search.js, logging.js, docs.js, progressService.js
- Export/global fixes: tickets-aggrid.js, theme-contrast-tester.js, modal-monitoring.js
- Bug fix: progress-modal.js (button restoration)
- False positive docs: importController.js, importService.js
- HEX-122 investigation: vulnerability-constants.js

**Related Issues**:
- HEX-122: Theme color inconsistency (getVPRContrastColorsFromCSS investigation)
- HEX-123: CSV import JSON parse error (discovered during testing)
- DOCS-25, DOCS-33: ESLint configuration improvements

#### HEX-120: Device Modal Reliability + Split Loading Disabled

**Issue**: Device vulnerability modal intermittently failed to open due to race conditions in split-loading architecture. Users clicked device cards but sometimes saw no response.

**Root Cause**:
- Split loading architecture introduced timing issues between KEV-first load and background full dataset load
- Device card click handlers referenced devices that might not be fully loaded
- Race condition: UI rendered before device data fully populated

**Solution**:
- Disabled split loading architecture (reverted to single-phase full dataset load)
- Ensured device data fully populated before UI interaction enabled
- Simplified vulnerability-core.js initialization sequence
- Enhanced error handling for modal open failures

**Files Modified**:
- `app/public/scripts/shared/vulnerability-core.js` - Simplified loading sequence, disabled split mode
- `app/public/scripts/shared/vulnerability-data.js` - Reverted to single-phase loading
- `app/public/scripts/shared/vulnerability-cards.js` - Enhanced modal opening reliability

**Impact**: Device modals now open reliably 100% of the time. Trade-off: Initial page load returns to ~2 seconds (from <500ms in HEX-117) but ensures data consistency.

**Testing**: Verified across 25,000+ vulnerabilities with 1,600+ devices - modal opens consistently.

### Documentation

#### DOCS-39 through DOCS-43: Documentation Audit and Auto-Fix

**Audit Findings**:
- Documentation health: 72% accurate (18/25 files current, 5 partially stale, 2 outdated)
- Version drift: ROADMAP.md showed v1.0.30, actual v1.0.43 (13 releases behind)
- Missing features: CacheService (v1.0.36), VulnerabilityCoreOrchestrator (v1.0.41), device stats endpoint

**Fixes Applied**:
- **ROADMAP.md (DOCS-41)**: Updated version from v1.0.30 to v1.0.43
- **backend-api.md (DOCS-40)**: Added CacheService and Device API Routes documentation
- **frontend-api.md (DOCS-42)**: Added VulnerabilityCoreOrchestrator modular orchestrator pattern documentation
- **CLAUDE.md restructure**: Simplified from bloated 2.0.0 to streamlined version with Linear DOCS-22 as primary source

**Documentation Health Improvement**: 72% → ~90% accurate

**Files Modified**:
- `app/public/docs-source/ROADMAP.md` - Version sync
- `app/public/docs-source/api-reference/backend-api.md` - Added missing v1.0.36+ features
- `app/public/docs-source/api-reference/frontend-api.md` - Added orchestrator architecture
- `CLAUDE.md` - Restructured for clarity and Linear-first approach

### Cleanup

- Removed obsolete deployment documentation (NGINX_DEPLOYMENT.md, DISABLED_MCP.md)
- Added database WAL files to .gitignore (hextrackr.db-shm, hextrackr.db-wal)
- ESLint configuration improvements for dependency injection pattern support

---

## [1.0.41] - 2025-10-01

### Performance

#### HEX-117: Surgical Performance Optimization - 80% Faster Page Loads

**Issue**: Vulnerabilities page took 5-8 seconds to load with 25,000+ records, causing poor user experience and high memory usage (300MB). The bottleneck was client-side JavaScript processing 25,000 records to build device aggregations and statistics.

**Root Cause Analysis**:

- API fetch was fast (0.775s for 19.4MB) ✅
- Client-side processing was slow (3-4 seconds) ❌
  - `processDataAsync()` looped through all records
  - Built device maps from 25,813 vulnerabilities
  - Calculated VPR scores for 1,639 devices
  - Created in-memory vulnerability arrays per device

**Solution - Phase 1: Backend Aggregation**:

- Stats cards now fetch from cached `/api/vulnerabilities/stats` endpoint
- Charts now fetch from cached `/api/vulnerabilities/trends` endpoint
- Skip expensive `processDataAsync()` for large datasets (>5000 records)
- Fetch pre-aggregated devices from `/api/devices/stats` endpoint

**Solution - Phase 2: KEV-First + Invisible Loading**:

- Initial load: 100 KEV vulnerabilities only (~200KB, instant)
- Background load: Full 25k dataset loads transparently (2 seconds later)
- Lazy card views: Device/severity cards load only when tab clicked
- Silent footer update: "1-100 of 156" → "1-100 of 25,813" (no spinner)

**Performance Improvements**:

| Metric | Before | After | Improvement |
|--------|--------|-------|-------------|
| Initial Page Load | 5-8 seconds | <500ms | **90% faster** ⚡ |
| Full Dataset Load | 5-8 seconds | 2 seconds | **75% faster** |
| Memory Usage | 300MB | ~100MB | **67% reduction** |
| Stats Cards | 3-4s processing | Instant (cached) | **100% faster** |
| Charts | Client-side calc | Instant (cached) | **100% faster** |
| Device Cards | 3-4s aggregation | Pre-aggregated | **100% faster** |

**Files Modified**:

- `app/public/scripts/shared/vulnerability-core.js` - KEV-first initialization, background loading, lazy card loading
- `app/public/scripts/shared/vulnerability-data.js` - Skip expensive processing, fetch pre-aggregated data
- `app/public/scripts/shared/vulnerability-statistics.js` - Async stats/charts from API with fallbacks

**Impact**: Users can start working immediately (<500ms), full dataset loads silently in background. No toasts, no spinners, no interruptions. Professional-grade invisible loading.

**Backward Compatibility**:

- ✅ Full dataset still available via `getAllVulnerabilities()`
- ✅ Search works across all records
- ✅ Exports include all vulnerabilities
- ✅ Modals show real database values
- ✅ tickets.html export functionality preserved

---

#### HEX-112 Phase 3: Dual-Mode Infrastructure with Cache Control

**Feature**: Implemented infrastructure for future pagination migration with cache-control architecture to manage different caching strategies between legacy (aggressive caching) and pagination (cache bypass) modes.

**Architecture**:

- Master toggle controls: (1) data loading mode and (2) cache-bypass behavior
- Legacy mode: 5-10min aggressive caching (fast/stale) for full dataset
- Pagination mode: cache bypass (fresh/dynamic) for server-side queries
- Feature flag stored in localStorage for gradual rollout capability

**Files Modified**:

- `app/public/scripts/shared/vulnerability-data.js` - Dual-mode loading methods with comprehensive JSDoc

**Testing**: Legacy mode 0.775s/25,813 records, Pagination mode 0.077s/100 records (10x faster)

**Status**: Infrastructure complete, feature flag OFF (legacy mode active)

## [1.0.40] - 2025-09-30

### Added

#### HEX-100: Resolved CVEs Tracking in Import Summaries

**Feature**: Import summaries now show **both** new CVEs discovered AND CVEs resolved/removed between scans, providing complete vulnerability lifecycle visibility.

**Problem**: Previous versions only tracked NEW CVEs, making it impossible to see remediation progress or validate patching efforts.

**Solution Implemented**:
- Backend: New SQL query identifies CVEs present in previous snapshots but missing from current scan
- Frontend: Green "✅ Resolved CVEs" section showing resolved count, affected hosts, VPR reduction, and last seen date
- Reports: Included in both modal display and downloadable HTML exports

**Benefits for Security Teams**:
- Track remediation progress: "3 CVEs resolved this week"
- Validate patching efforts: "CVE-2024-12345 patched across 50 hosts"
- Complete picture: Risk increases (new) + Risk reductions (resolved) = Net impact

**Files Modified**:
- `app/services/importService.js` - Added resolved CVE query and summary data
- `app/public/scripts/shared/progress-modal.js` - Added resolved CVEs UI section

## [1.0.39] - 2025-09-30

### Fixed

#### HEX-99: Clear Vulnerabilities Showing Stale Cached Data

**Issue**: After clicking "Clear Vulnerabilities", the UI continued showing old data despite empty database. Required Docker restart to see empty state.

**Root Cause**: Two-layer caching problem:
1. Server correctly cleared application cache ✅
2. Browser cached responses (60s TTL) served old data ❌
3. Frontend didn't use cache-busting parameters when reloading

**Solution**:
- Added `bustCache=true` parameter to `clearAllData()` operation
- Enhanced `refreshData()` to support optional cache busting
- Cache-busting appends timestamps to API URLs forcing fresh requests

**Impact**: "Clear Vulnerabilities" now immediately shows empty state without page refresh.

**Files Modified**:
- `app/public/scripts/shared/vulnerability-data.js`

#### HEX-99 Enhancement: VACUUM After Clear Operations

**Issue**: Database file showed 140.6 MB despite 0 records. SQLite DELETE operations don't shrink files - they mark pages as "free" for reuse.

**Analysis**:
- Total pages: 35,990 (141 MB)
- Free pages: 28,754 (112 MB wasted space - 80%!)
- Actual data: ~29 MB

**Solution**: Added SQLite VACUUM command after clearing vulnerability data to rebuild database file and reclaim disk space.

**Impact**: Database shrinks from ~141 MB to ~30 MB after clear operation.

**Files Modified**:
- `app/services/vulnerabilityService.js`

## [1.0.38] - 2025-09-30

### Fixed

#### HEX-98: Broken CVE Discovery Query in Import Summaries

**Critical Bug**: Duplicate CSV imports incorrectly showed 51-54 "new CVEs" instead of 0. Import summaries were completely unreliable for CVE discovery tracking.

**Evidence**:
- Import 1 (01:06 AM): 54 new CVEs affecting 1,556 vulnerabilities ❌
- Import 2 (02:30 PM): 54 new CVEs affecting 1,556 vulnerabilities ❌
- Import 3 (03:17 PM): 51 new CVEs affecting 442 vulnerabilities ❌
- **Expected**: 0 new CVEs for duplicate imports

**Root Cause**: SQL query attempted to join `vulnerability_daily_totals` (aggregated table) with `vulnerabilities_current` (detailed records) without proper join condition, creating cartesian product with non-deterministic results. Query would mark ancient CVEs (CVE-2017-12240, CVE-2018-0171) as "new" on every import.

**Solution**:
- Replaced broken query with correct `vulnerability_snapshots` lookup
- Added database indexes on CVE columns for performance optimization
- Reduced query complexity from O(n²) to O(n log n)

**Verification**: Duplicate imports now correctly show 0 new CVEs.

**Files Modified**:
- `app/services/importService.js` - Fixed CVE discovery query
- `app/public/scripts/init-database.js` - Added `idx_snapshots_cve` and `idx_current_cve` indexes

## [1.0.36] - 2025-09-30

### Performance

#### HEX-91: Optimize HTTPS Performance - 3x Slowdown with 30K Vulnerability Records

**Issue**: After implementing HTTPS with nginx reverse proxy (HEXP-14), the vulnerabilities page loaded 3x slower than direct HTTPS in dev environment. Page load time increased from 2-4 seconds to 6-12 seconds when loading 30,000 vulnerability records.

**Root Causes Identified**:
1. **Double Compression**: Nginx gzip + Express compression middleware both compressing the same response
2. **No Application Cache**: Every request triggered fresh database query for 30K records
3. **Aggressive Browser Cache**: 10-minute browser TTL prevented fresh data after CSV imports
4. **Missing Cache Headers**: No Cache-Control headers for browser-side caching coordination

**Solution - Two-Layer Caching Architecture**:

##### Layer 1: Application-Level Caching (node-cache)

- Implemented aggressive server-side caching with 5-10 minute TTL
- Separate cache zones for statistics and trends data
- Memory footprint: ~5-10MB for 30K records
- Performance: 400-1000ms initial load → 2-5ms cached responses

##### Layer 2: Browser Cache Coordination (Cache-Control headers)

- Right-sized browser cache TTL: 30-60 seconds for fresh data visibility
- Automatic cache invalidation on CSV imports and KEV sync
- X-Cache headers (HIT/MISS) for monitoring and debugging

**Technical Implementation**:

**Files Modified**:
- `app/services/cacheService.js` - New caching service with dual-zone architecture (statistics + trends)
- `app/controllers/vulnerabilityController.js` - Integrated caching for all stats and trends endpoints
- `app/public/server.js` - Conditionally disabled Express compression when `TRUST_PROXY=true`

**Key Innovation - withCaching() Helper**:
```javascript
async withCaching(res, cacheType, cacheKey, serverTTL, handler, browserTTL = null) {
    // Server cache: Aggressive (5-10min) for performance
    // Browser cache: Light (30-60s) for freshness
}
```

**Cache Configuration by Endpoint**:
- Vulnerability Stats: 300s server / 60s browser
- Recent Trends: 600s server / 60s browser
- Historical Trends: 600s server / 60s browser
- Vulnerabilities List: 600s server / 30s browser (most critical for filtering)

**Double Compression Fix**:
- Added `TRUST_PROXY` environment variable check in `server.js:130`
- Express compression disabled when nginx handles compression
- Eliminates wasted CPU cycles and response delays

**Performance Results**:
- Page load time: 6-12s → under 2s (80-85% improvement)
- Cached API responses: 2-5ms vs 400-1000ms uncached
- Cache hit rate: 61% improvement on vulnerabilities endpoint
- Fresh data visible: Within 30-60s after import without hard refresh

**Code Quality**:
- Refactored duplicate caching logic using withCaching() helper (Codacy fix)
- Eliminated 44 lines of duplicated code across controllers
- Single source of truth for cache TTL management
- X-Cache headers enable cache effectiveness monitoring

**Production Impact**:
- Maintains ability to filter across all 30,000 records
- Cache automatically cleared on KEV sync and CSV imports
- No breaking changes to existing functionality
- Ready for Claude-Prod deployment to Ubuntu production

**Linear Issue**: [HEX-91](https://linear.app/hextrackr/issue/HEX-91)

---

## [1.0.35] - 2025-09-30

### Fixed

#### HEX-90: Ticket Field Clearing Bug - Nullish Coalescing Operator Fix

**Issue**: Users could not clear optional ticket fields (notes, status, location, supervisor, tech, site) when updating tickets. Sending empty strings or null values silently kept the previous value in the database.

**Root Cause**: The `updateTicket` method in `ticketService.js` used the `||` (logical OR) operator for field merging:
```javascript
// ❌ BEFORE - || treats ANY falsy value as "use fallback"
const payload = {
    notes: ticket.notes || existingTicket.notes,
    status: ticket.status || existingTicket.status,
    // ... empty strings ("") kept old values
};
```

The `||` operator treats ALL falsy values as "use fallback":
- Empty string `""` → falsy → uses old value ❌
- `null` → falsy → uses old value ❌
- `undefined` → falsy → uses old value ✅
- `0` → falsy → uses old value ❌
- `false` → falsy → uses old value ❌

**Solution**: Replaced `||` with `??` (nullish coalescing) for optional fields:
```javascript
// ✅ AFTER - ?? only falls back on null/undefined
const payload = {
    // Optional fields - use ?? to allow clearing with empty strings
    hexagonTicket: ticket.hexagonTicket ?? ticket.hexagon_ticket ?? existingTicket.hexagon_ticket,
    serviceNowTicket: ticket.serviceNowTicket ?? ticket.service_now_ticket ?? existingTicket.service_now_ticket,
    location: ticket.location ?? existingTicket.location,
    supervisor: ticket.supervisor ?? existingTicket.supervisor,
    tech: ticket.tech ?? existingTicket.tech,
    status: ticket.status ?? existingTicket.status,
    notes: ticket.notes ?? existingTicket.notes,
    site: ticket.site ?? existingTicket.site,
    site_id: ticket.site_id ?? existingTicket.site_id,
    location_id: ticket.location_id ?? existingTicket.location_id,

    // Required fields - keep || to prevent empty values
    dateSubmitted: ticket.dateSubmitted || ticket.date_submitted || existingTicket.date_submitted,
    dateDue: ticket.dateDue || ticket.date_due || existingTicket.date_due,
    devices: ticket.devices || existingTicket.devices,
    attachments: ticket.attachments || existingTicket.attachments,
};
```

**Operator Comparison**:
- `||` (Logical OR): Falls back on ANY falsy value (prevents `""`, `0`, `false`)
- `??` (Nullish Coalescing): Falls back ONLY on `null` or `undefined` (allows `""`, `0`, `false`)

**Files Modified**:
- `app/services/ticketService.js` (lines 148-195) - Updated `updateTicket` method with ?? operators and comprehensive JSDoc
- Added JSDoc documentation explaining operator choice for future maintainers

**Impact**:
- Users can now clear optional fields by sending empty strings
- UI shows cleared field and database reflects the change
- No breaking changes to required field validation
- Discovered during Codacy review of PR #59 (WebSocket CORS fix)

**User Experience**:
- Before: Silent failures when clearing fields (UI shows cleared, DB keeps old value)
- After: Fields clear successfully (UI and DB synchronized)
- No error messages needed - clearing now works as expected

**Testing**:
- All linters passed (ESLint, Stylelint, Markdownlint)
- Docker container tested and running on port 8989
- Verified field clearing for all 9 optional fields

### Added

#### Trust Proxy Configuration for Nginx Reverse Proxy

**Purpose**: Enable proper client IP detection and rate limiting when running behind nginx reverse proxy

**Implementation**:
- Added `TRUST_PROXY` environment variable to configure Express trust proxy setting
- Updated `app/public/server.js` (lines 48-52) with conditional proxy trust configuration
- Updated `.env.example` with documentation for production deployment

**Configuration**:
```javascript
// Trust proxy when behind nginx (enables proper client IP detection)
if (process.env.TRUST_PROXY === "true") {
    app.set("trust proxy", 1);
}
```

**Benefits**:
- Rate limiting works correctly with real client IPs (not nginx IP)
- Eliminates ValidationError logs from proxy forwarding
- Enables Cache-Control header optimization
- Ready for Claude-Prod to enable with `TRUST_PROXY=true`

**Linear Issue**: [HEX-90](https://linear.app/hextrackr/issue/HEX-90)

---

## [1.0.34] - 2025-09-29

### Fixed

#### HEX-88: WebSocket Connection Fails in HTTPS Mode - CSV Import Progress Not Working

**Issue**: WebSocket connections failed when running HexTrackr in HTTPS mode, preventing CSV import progress tracking from working. The import would complete but users saw no progress updates and the UI didn't refresh.

**Root Cause**: CORS (Cross-Origin Resource Sharing) configuration in `/app/utils/constants.js` only allowed HTTP origins:
```javascript
// ❌ BEFORE - Only HTTP origins
const CORS_ORIGINS = ["http://localhost:8080", "http://127.0.0.1:8080"];
```

When running in HTTPS mode (enabled in v1.0.33), the browser connected via `https://localhost:8989`, but Socket.io's CORS configuration rejected this origin because it wasn't in the allowed list.

**Solution**: Implemented dynamic CORS function that detects environment and restricts to HTTPS-only in production:

```javascript
// ✅ AFTER - Dynamic HTTPS-only CORS
function getCorsOrigins() {
    const protocol = process.env.USE_HTTPS === "true" ? "https:" : "http:";
    const ports = ["8080", "8989", "8443"];
    const hosts = ["localhost", "127.0.0.1"];

    const origins = [];
    for (const host of hosts) {
        for (const port of ports) {
            origins.push(`${protocol}//${host}:${port}`);
        }
    }
    return origins;
}

const CORS_ORIGINS = getCorsOrigins();
```

**Why Dynamic Instead of Static**:
1. **Security**: HTTPS-only in production (no HTTP fallback)
2. **Flexibility**: Adapts to USE_HTTPS environment variable
3. **Port Coverage**: Supports development (8080), Docker (8989), and HTTPS (8443)
4. **DHCP Resilience**: Works across environments without hardcoded IPs

**Files Modified**:
- `app/utils/constants.js` - Replaced static CORS_ORIGINS array with getCorsOrigins() function
- `app/public/scripts/shared/websocket-client.js` - Enhanced protocol detection with file:// handling
- Documentation updated to explain dynamic CORS strategy

**Additional Fixes**:
- Fixed ticket status update 500 errors (proper error handling)
- Removed temporary documentation files from repository
- Enhanced WebSocket client to handle file:// protocol for local testing

**Technical Details**:
- WebSocket client correctly detects HTTPS and tries to connect via `https://`
- Server creates HTTPS server when `USE_HTTPS=true`
- WebSocket inherits CORS origins that now include HTTPS URLs
- Mixed content errors eliminated with protocol-aware connection

**Testing**:
- Verified CSV import progress tracking works in HTTPS mode
- Confirmed WebSocket connections establish successfully
- Tested across Mac development (port 8989) and Ubuntu production environments

**Security Impact**:
- Production environments use HTTPS-only WebSocket connections
- No HTTP fallback in HTTPS mode (prevents downgrade attacks)
- CORS properly restricts origins to known safe hosts

**Linear Issue**: [HEX-88](https://linear.app/hextrackr/issue/HEX-88)

---

## [1.0.33] - 2025-09-28

### Added

#### HEX-87: HTTPS Support with Self-Signed Certificates

**Feature**: Development environment HTTPS implementation using self-signed certificates

**Purpose**: Critical security foundation for upcoming authentication implementation (HEX-80/81)

**Technical Implementation**:
- Generated 10-year self-signed SSL certificate for localhost development
- Enhanced Express server to support both HTTP and HTTPS modes via environment configuration
- Added dotenv configuration loading to server.js for environment variable support
- Implemented protocol-aware server creation maintaining Socket.io compatibility
- Updated Docker configuration to support HTTPS container deployment
- Enhanced health checks to work with both HTTP and HTTPS protocols
- Added certificate directory structure with proper .gitignore exclusions

**Environment Configuration**:
- `USE_HTTPS=true` enables HTTPS mode
- `SSL_KEY_PATH` and `SSL_CERT_PATH` for certificate locations
- Maintains backward compatibility with HTTP mode for testing

**Files Modified**:
- `app/public/server.js` - Added HTTPS server creation and dotenv support
- `docker-compose.yml` - Added HTTPS port mapping and certificate volume mounts
- `Dockerfile` - Updated health check to support both protocols
- `.env` - Added HTTPS configuration variables
- `.gitignore` - Added certificate exclusions
- `certs/` - New directory with self-signed certificate files

**Security Impact**:
- Enables secure cookie testing for authentication
- Provides foundation for session-based authentication
- Prepares development environment for production-like HTTPS workflows
- Browser certificate warnings expected and acceptable for development

**Browser Access**:
- HTTP: `http://localhost:8080` (development) / `http://localhost:8989` (Docker)
- HTTPS: `https://localhost:8080` (development) / `https://localhost:8989` (Docker)

## [1.0.32] - 2025-09-26

### Fixed

#### HEX-65: Dark Mode White Flash Elimination

**Issue**: White flash occurring when navigating between pages in dark mode, particularly noticeable in Firefox

**Resolution**: Implemented multi-layered theme application system to eliminate flash of unstyled content (FOUC)

**Technical Implementation**:
- Added inline theme detection script in HTML `<head>` that executes before CSS loads
- Implemented fallback chain: localStorage → sessionStorage → OS preference → light theme
- Added critical dark theme styles to `base.css` for immediate card theming
- Commented out unnecessary loading toast that caused additional flash
- Enhanced toast manager to detect and apply current theme to containers
- Updated component initialization to detect pre-applied themes

**Files Modified**:
- `app/public/vulnerabilities.html` - Added inline theme detection script
- `app/public/tickets2.html` - Added inline theme detection script
- `app/public/styles/shared/base.css` - Added critical dark theme card styles (lines 82-95)
- `app/public/scripts/shared/vulnerability-core.js` - Disabled loading toast on page load (line 296)
- `app/public/scripts/shared/toast-manager.js` - Added theme detection for toast containers

**Performance Impact**:
- Zero white flash during navigation
- No additional latency
- Smooth transitions between pages
- Maintains architectural principles (modular CSS structure)

**Browser Compatibility**:
- Tested in Firefox, Chrome, Safari, Edge
- Supports private browsing mode via sessionStorage fallback
- Handles legacy storage formats (both JSON and plain string)

## [1.0.31] - 2025-09-25

### Security Fixes

#### Critical: Cryptographically Weak Random Number Generators

**HEX-14**: Fixed multiple Math.random() vulnerabilities
- `app/public/scripts/shared/vulnerability-cards.js` - Added `generateSecureVulnId()` method using `crypto.getRandomValues()`
- `app/services/ticketService.js` - Updated to use `crypto.randomBytes()` for ticket ID generation
- `app/services/fileService.js` - Updated to use `crypto.randomBytes()` for secure file naming
- **Impact**: Eliminated predictability vulnerability in ID generation, increased entropy from ~2^32 to 2^48 bits

**HEX-15**: Fixed session ID vulnerability in CSV imports
- `app/public/scripts/shared/vulnerability-core.js` - Replaced Math.random() with `window.crypto.getRandomValues()` for session IDs
- **Impact**: Import session IDs are now cryptographically secure, preventing session hijacking during CSV operations

**HEX-16**: Fixed toast notification ID vulnerability
- `app/public/scripts/shared/toast-manager.js` - Secure ID generation for toast notifications using `crypto.getRandomValues()`
- **Impact**: Toast notification IDs are now unpredictable, preventing potential ID collision attacks

**HEX-17**: Fixed modal operation tracking vulnerability
- `app/public/scripts/shared/modal-monitoring.js` - Secure operation ID generation for modal lifecycle tracking
- **Impact**: Modal operation IDs now use cryptographic randomness, eliminating tracking manipulation risks

#### Technical Details
- All fixes maintain backward compatibility with existing ID formats
- Browser implementations use `window.crypto.getRandomValues()`
- Node.js implementations use `crypto.randomBytes()`
- No breaking changes to application functionality
- All fixes validated with ESLint and tested in Docker environment

### Fixed

#### P1: Crypto API Fallbacks for Non-HTTPS Environments

**Issue**: Security fixes introduced breaking changes in environments without Web Crypto API support (HTTP, WebViews, older browsers)

**Resolution**: Added feature detection and graceful fallbacks to maintain functionality across all environments

**Files Updated**:
- `app/public/scripts/shared/vulnerability-core.js` - CSV import session IDs now fallback to timestamp-based IDs when crypto unavailable
- `app/public/scripts/shared/toast-manager.js` - Toast notifications maintain functionality with performance.now() fallback
- `app/public/scripts/shared/modal-monitoring.js` - Modal operations use timestamp fallback to prevent complete failure

**Impact**:
- Maintains cryptographic security in HTTPS environments
- Prevents complete feature failure in non-HTTPS environments
- Console warnings inform developers when running in degraded mode
- No breaking changes - all features work in all environments

### Refactored

#### Code Optimization: Eliminated Crypto Fallback Duplication

**Issue**: Codacy detected code clones from repeated crypto fallback patterns

**Resolution**: Created shared `crypto-utils.js` utility module to centralize ID generation logic

**Implementation**:
- New file: `app/public/scripts/shared/crypto-utils.js` - Shared utility with `generateSecureId()` function
- Refactored: `vulnerability-core.js` - Uses utility for CSV import session IDs
- Refactored: `toast-manager.js` - Uses utility for toast notification IDs
- Refactored: `modal-monitoring.js` - Uses utility for modal operation IDs
- Updated: `vulnerabilities.html` - Added script reference to load utility

**Impact**:
- Eliminated 2 code clones detected by Codacy
- Reduced total code by ~30 lines
- Single source of truth for secure ID generation
- Improved maintainability and testability

### Fixed

#### ESLint no-undef Errors in Crypto Implementation (HEX-61)

**Issue**: The crypto-utils.js refactoring introduced 4 ESLint no-undef errors due to module compatibility issues

**Resolution**: Fixed browser/Node.js compatibility in crypto-utils module

**Errors Fixed**:
- `crypto-utils.js` lines 66-67: 'module' is not defined - Added module to ESLint globals
- `toast-manager.js` line 74: 'generateSecureId' is not defined - Added global directive
- `modal-monitoring.js` line 646: 'generateSecureId' is not defined - Added global directive

**Implementation**:
- Added proper module detection and browser window export in crypto-utils.js
- Added ESLint global directives for generateSecureId in consuming files
- Maintains compatibility with both browser and Node.js environments

### Configuration

#### Codacy Tool Configuration Cleanup

**Issue**: PMD and Semgrep tools causing analysis errors for JavaScript project

**Resolution**: Removed Java-specific and proprietary tools from Codacy configuration

**Changes**:
- Removed PMD tool (Java analyzer not applicable to JavaScript project)
- Removed Semgrep tool (proprietary extension errors)
- Deleted `ruleset.xml` containing Java PMD rules
- Updated `.codacy/codacy.yaml` to include only relevant tools (ESLint, Lizard, Trivy, Pylint)
- Cleaned `.codacy/tools-configs/languages-config.yaml` to remove PMD and Semgrep entries

**Impact**:
- Eliminated all PMD Java ruleset errors
- Resolved Semgrep proprietary extension failures
- Clean Codacy analysis with 0 configuration errors

## [1.0.30] - 2025-09-24

### Enhanced

#### KEV Badge Added to Vulnerability Details Modal

- **Visual Consistency**: Added KEV badge to Vulnerability Details Modal header for immediate KEV status visibility
  - Badge appears on the right side of "Vulnerability Information" card header
  - Only displays for vulnerabilities in CISA's KEV catalog (isKev === "Yes")
  - Maintains exact same appearance as KEV badges on vulnerability and device cards

- **Implementation Details**:
  - Reuses existing `.kev-badge` CSS class for consistency
  - Dynamically inserts badge using JavaScript in `updateKevBadge()` method
  - Uses flexbox layout for proper positioning within card header
  - Includes full accessibility support with keyboard navigation

- **User Experience**:
  - Immediate visual indication of KEV status when viewing vulnerability details
  - Clicking badge opens KEV details modal (same behavior as card badges)
  - Consistent UI patterns across all vulnerability displays
  - No additional CSS required - leverages existing badge styles

#### Files Modified
- `app/public/scripts/shared/vulnerability-details-modal.js` - Added updateKevBadge() method

### Security

#### Removed Dead Code with Cryptographic Weakness

**HEX-18 through HEX-22**: Eliminated unused `updateTrendIndicators()` function
- **File**: `app/public/scripts/shared/vulnerability-statistics.js`
- **Lines Removed**: 126-177 (52 lines of dead code)
- **Issues Resolved**: 5 Math.random() vulnerabilities in lines 155, 156, 157, 158, 166
- **Impact**: Removed unused function that was never called, eliminating false positive security warnings
- **Codacy IDs**:
  - HEX-18: `efc9a590-06bf-42c9-a50a-176ff3bfd242`
  - HEX-19: `9622b92c-5833-4bd9-8a0c-3ce15a08e119`
  - HEX-20: `72166284-86ca-4aa5-9b07-cf6021fc972d`
  - HEX-21: `e151151a-eb9c-4893-b3ba-54fcd82686b2`
  - HEX-22: `15801a4e-a946-4756-8160-b88022efcea3`

**HEX-23**: Documented as false positive (no fix needed)
- **File**: `app/public/scripts/shared/vulnerability-details-modal.js` line 1067
- **Usage**: UI operation tracking for race condition prevention (`Date.now() + Math.random()`)
- **Status**: Marked for Codacy suppression - legitimate non-cryptographic use for modal operation IDs
- **Codacy ID**: `2811f086-463f-4309-a01a-3a53e2d89149`

**HEX-24 & HEX-25**: Added defense-in-depth length validation to RegExp operations
- **File**: `app/public/scripts/pages/tickets.js`
- **Functions Modified**:
  - `highlightSearch()` (line 1573): Added 100 character limit for search terms
  - `processTemplateWithVariables()` (line 2735): Added 50 character limit for template variables
- **Security Enhancement**: Prevents potential ReDoS attacks through excessive input length
- **Impact**: No functional changes - existing RegExp escaping already prevents attacks, this adds extra protection
- **Codacy IDs**:
  - HEX-24: `f27d6346-7894-4545-aae9-d8560ff0a9f6`
  - HEX-25: Duplicate of HEX-24

## [1.0.28] - 2025-09-24

### Fixed - KEV Badge Modal Issue on Device Cards

#### Bug Resolution

- **Fixed Modal Behavior**: KEV badges on device cards now correctly open the KEV details modal instead of the device security modal
  - **Root Cause**: Incorrect onclick handler was calling `vulnManager.viewDeviceDetails()` instead of `showKevDetails()`
  - **User Impact**: Security teams can now quickly access KEV vulnerability details directly from device cards
  - **Consistency Restored**: KEV badge behavior is now uniform across vulnerability cards and device cards

#### Technical Implementation

- **Device Aggregation Enhancement**: Extended `getFilteredDevices()` in `vulnerability-data.js` to track first KEV CVE per device
  - Added `kevCve: null` property to device object initialization
  - Implemented KEV CVE tracking: `if (!device.kevCve) { device.kevCve = vuln.cve; }`
- **Event Handler Correction**: Fixed onclick handler in `vulnerability-cards.js` line 93
  - **Before**: `onclick="event.stopPropagation(); vulnManager.viewDeviceDetails('${device.hostname}')"`
  - **After**: `onclick="event.stopPropagation(); showKevDetails('${device.kevCve}')"`
  - Also updated onkeydown handler for accessibility consistency

#### Files Modified
- `app/public/scripts/shared/vulnerability-data.js` - Device aggregation logic for KEV CVE tracking
- `app/public/scripts/shared/vulnerability-cards.js` - KEV badge event handlers

## [1.0.27] - 2025-09-24

### Added - KEV Badge on Device Cards

#### Enhanced Risk Visibility

- **Consistent UI Indicators**: Added KEV (Known Exploited Vulnerabilities) badges to device cards, creating visual consistency with vulnerability cards
  - **Badge Appearance**: Red KEV badge displays in upper right corner when ANY vulnerability on that device is in CISA's KEV catalog
  - **Risk Assessment**: Users can now instantly identify high-risk devices requiring immediate attention
  - **Click Functionality**: Clicking KEV badge opens device details modal to view all vulnerabilities affecting that device

#### Technical Implementation

- **Backend Enhancement**: Extended device aggregation logic to track KEV status across all vulnerabilities per device
  - Modified `getFilteredDevices()` in `vulnerability-data.js` to include `hasKev` property
  - Added KEV tracking during vulnerability iteration: `if (vuln.isKev === "Yes") { device.hasKev = true; }`
- **Frontend Integration**: Enhanced device card generation to display KEV badges
  - Updated `generateDeviceCardsHTML()` in `vulnerability-cards.js` with KEV badge HTML
  - Used identical badge structure as vulnerability cards for UI consistency
- **Styling Consistency**: Extended existing KEV CSS styles to support device cards
  - Added `.device-card .kev-indicator` selectors to match vulnerability card styling
  - Maintained responsive design and accessibility features

#### User Experience Improvements

- **Immediate Risk Recognition**: Security teams can quickly scan device cards to identify compromised systems
- **Operational Efficiency**: Faster prioritization of remediation efforts based on visual KEV indicators
- **UI Consistency**: Uniform KEV badge appearance across all card types (vulnerability cards and device cards)
- **Accessibility**: Full keyboard navigation support with ARIA labels and focus indicators

#### Files Modified
- `app/public/scripts/shared/vulnerability-data.js`: Device aggregation logic for KEV tracking
- `app/public/scripts/shared/vulnerability-cards.js`: Device card HTML generation with KEV badges
- `app/public/styles/pages/vulnerabilities.css`: Extended KEV indicator styles for device cards

#### Linear Issue
- **HEX-10**: v1.0.27: Feature - Add KEV Badge to Device Cards (Completed)

## [1.0.26] - 2025-09-23

### Fixed - Low Severity Vulnerability Visibility

#### Critical Bug Resolution

- **Complete Visibility Restored**: Fixed critical issue where 3,314 Low severity vulnerabilities were completely hidden from users
  - **Root Cause**: VPR-based sorting combined with 10K frontend limit pushed Low severity items (VPR 1.4-5.1) beyond visible range
  - **Impact**: Users could not filter, view, or access any Low severity vulnerabilities despite their presence in database
  - **Severity**: Critical - affected core vulnerability management functionality

#### Backend Sorting Optimization

- **Severity-Balanced Algorithm**: Implemented intelligent sorting to ensure all severity levels remain visible
  ```sql
  ORDER BY isKev DESC,
           CASE severity
             WHEN 'Critical' THEN 1
             WHEN 'High' THEN 2
             WHEN 'Medium' THEN 3
             WHEN 'Low' THEN 4
           END ASC,
           vpr_score DESC,
           last_seen DESC
  ```
  - **KEV Priority Maintained**: Known Exploited Vulnerabilities still appear first
  - **VPR Sorting Preserved**: Within each severity level, VPR scores determine order
  - **Distribution Guarantee**: All severity levels now appear in first 10K-30K results

#### Frontend Performance Optimization

- **Async Processing Implementation**: Resolved UI freezing when loading large vulnerability datasets
  - **Chunked Processing**: 24,660 vulnerabilities processed in 1000-item chunks using `requestIdleCallback()`
  - **Non-Blocking UI**: Browser remains responsive during data processing
  - **Progress Feedback**: Real-time loading indicators ("Processing vulnerabilities... 5000/24660")
  - **Fallback Support**: `setTimeout()` fallback for browsers without `requestIdleCallback()`

- **Data Capacity Increase**: Frontend limit increased from 10K to 30K to accommodate all vulnerabilities
  - **Complete Dataset**: All 24,660 current vulnerabilities now loaded for comprehensive filtering
  - **Compressed Transfer**: GZIP compression maintains efficient 614KB payload (vs 21MB uncompressed)
  - **Completeness Monitoring**: Added automatic warnings when approaching 90% of data limits

#### Technical Performance Metrics

- **Network Efficiency**: 614KB compressed transfer with 97% compression ratio
- **Processing Speed**: 1000 items per chunk with idle callback scheduling
- **UI Responsiveness**: Sub-2-second load times maintained with progress feedback
- **Memory Management**: Incremental processing prevents browser memory spikes
- **Data Integrity**: All 3,314 Low severity items now accessible through filtering

#### User Experience Improvements

- **Filtering Functionality**: Low severity filter now returns all 3,314 items (previously 0)
- **Complete Visibility**: Users can access full vulnerability dataset across all severity levels
- **Loading Feedback**: Progressive loading messages prevent perceived application freezing
- **Responsive Interface**: UI remains interactive during background data processing

### Technical Implementation

- **Files Modified**:
  - `vulnerabilityService.js`: Backend sorting algorithm
  - `vulnerability-data.js`: Async processing with chunking and progress events
- **Commits**: `e0538ec` (backend sorting), `2faa0cb` (async processing)
- **Performance Strategy**: Balanced approach maintaining filtering capability while optimizing browser performance

## [1.0.25] - 2025-09-23

### Added - Import Summary HTML Export

#### Professional Report Generation

- **Standalone HTML Reports**: Added ability to download import summaries as complete HTML documents with embedded CSS styling
  - **Export Button**: New "Download Report" button appears in progress modal when CVE import summaries are available
  - **Self-Contained Files**: Reports include all necessary CSS (Tabler.io framework, HexTrackr variables, component styles) embedded inline
  - **Professional Formatting**: Complete document structure with metadata headers, generation timestamps, and HexTrackr branding
  - **Print-Friendly Styling**: Optimized CSS for both screen viewing and professional printing

#### Technical Implementation

- **CSS Extraction Engine**: Automated system fetches and combines 7 key stylesheets into single embedded block
  - Tabler.io framework, CSS custom properties, modal styles, badges, cards, tables, and base styles
  - Font Awesome icons via CDN import for universal compatibility
  - Custom print media queries for professional output
- **Dynamic File Naming**: Descriptive filenames using pattern `HexTrackr_Import_Report_YYYY-MM-DD_[source-filename].html`
- **Blob Download Pattern**: Follows established file export approach with proper MIME types and browser compatibility

#### User Experience Enhancements

- **Visual Feedback System**: Export button provides clear state indicators
  - Loading state with spinner and "Generating..." text
  - Success confirmation with checkmark and "Downloaded!" message
  - Error handling with warning icon and failure notification
- **Conditional Visibility**: Export option only appears when import summaries contain meaningful CVE discovery data
- **Non-Disruptive Integration**: Feature seamlessly extends existing import workflow without affecting standard operations

### Fixed - Import Modal State Persistence

#### Clean Loading States

- **Resolved Stale Data Display**: Fixed issue where previous import summaries appeared during new import loading phases
  - **Root Cause**: `resetProgressState()` function didn't clear `importSummary` data or associated DOM elements
  - **Solution**: Added explicit `importSummary: null` reset and summary container cleanup
- **Complete State Reset**: Enhanced modal initialization to properly clear all previous session data
  - Hide and clear `progressSummary` container content during reset
  - Reset export button visibility to prevent stale UI states
  - Ensure clean slate for each new import operation

#### Technical Improvements

- **Data Lifecycle Management**: Improved progress modal data handling to prevent state leakage between sessions
- **DOM Cleanup**: Systematic clearing of dynamically created summary content and UI elements
- **ESLint Compliance**: All code modifications passed linting validation with zero errors

## [1.0.24] - 2025-09-23

### Enhanced - Vulnerability Card Polish

#### Card Layout Simplification

- **Streamlined Card Body**: Removed the redundant criticality subcards from vulnerability cards to focus on the key summary details and reduce visual noise.
- **Consistent Spacing**: Tweaked card padding to accommodate the simplified layout without affecting existing content hierarchy.

#### KEV Indicator Improvements

- **Accessible Badge Placement**: Replaced the inline flame icon with an accessible red KEV pill badge anchored to the top-right corner of each vulnerability card.
- **Improved Visual Priority**: Updated the indicator styling and keyboard handling so KEV status remains prominent while staying aligned with the HexTrackr design system.

- **Vulnerability Cards UI Enhancement**: Removed redundant VPR mini-cards from vulnerability cards to reduce visual clutter
- **CSS Architecture**: Migrated inline styles to external CSS files for better maintainability
- **Enhanced Device Display**: Improved device information presentation in vulnerability cards with theme-aware styling
- **Responsive Design**: Enhanced mobile and tablet layout for vulnerability cards

### Technical Details
- Added page-specific CSS file (`vulnerabilities.css`) for vulnerability page styling
- Updated `cards.css` with enhanced device display component
- Removed VPR mini-cards HTML generation from `VulnerabilityCardsManager`
- Preserved VPR mini-cards functionality in device cards where they remain relevant
- Implemented CSS selector specificity to target only vulnerability cards
- Added theme support with light/dark mode transitions

### Files Modified
- `app/public/styles/pages/vulnerabilities.css` (created)
- `app/public/styles/shared/cards.css` (enhanced)
- `app/public/scripts/shared/vulnerability-cards.js` (modified)
- `app/public/pages/vulnerabilities.html` (updated CSS references)

## [1.0.23] - 2025-09-22

### Added - Interactive Statistics Card Filtering

#### Enhanced Ticket Management User Experience

- **Clickable Statistics Cards**: Transformed passive statistics displays into interactive filter controls
  - **Total Tickets Card**: Shows all tickets, acts as filter reset button
  - **Open Tickets Card**: Filters to active tickets (excludes Closed, Completed, Failed statuses)
  - **Overdue Card**: Shows urgent tickets requiring immediate attention (Overdue + Failed statuses)
  - **Completed Card**: Displays finished work (Completed + Closed statuses)

#### Technical Implementation

- **Smart Filter Integration**: Card filters integrate seamlessly with existing search and location filters
  - Mutual exclusivity with status dropdown to prevent filter conflicts
  - Automatic pagination reset when filters are applied
  - Preserves existing filter chain architecture for backward compatibility

- **Statistics Logic Fix**: Corrected "Open Tickets" calculation to include all non-terminal statuses
  - Previous logic only counted "Open" and "In Progress" statuses
  - New logic excludes terminal statuses (Closed, Completed, Failed) for more accurate representation
  - Statistics now align perfectly with filter behavior for consistency

#### User Interface Enhancements

- **Visual Feedback System**: Added comprehensive visual indicators for interactive elements
  - Hover effects with theme-aware shadows and subtle lift animations
  - Active card highlighting with distinct border and background styling
  - Smooth 200ms transitions for professional feel
  - Pointer cursor indication for clickability

- **Theme Compatibility**: Full support for both light and dark themes
  - Dynamic shadow effects adapted for each theme
  - Proper contrast ratios maintained across all visual states
  - Consistent styling with existing HexTrackr design system

#### Accessibility Excellence

- **Screen Reader Support**: Complete accessibility implementation for all users
  - ARIA button roles with pressed/unpressed state announcements
  - Live region announcements for filter changes ("Showing open tickets only", etc.)
  - Unique descriptive labels for each card's functionality

- **Keyboard Navigation**: Full keyboard accessibility support
  - Tab navigation through all statistics cards
  - Enter and Space key activation matching mouse click behavior
  - Focus indicators meeting WCAG AA contrast requirements
  - Logical tab order for intuitive navigation

#### Performance Optimizations

- **Efficient Filter Processing**: Optimized filter operations for large datasets
  - Sub-100ms filter response times for datasets up to 1000+ tickets
  - No AG-Grid re-initialization during filter changes
  - Preserved existing performance characteristics

### Technical Notes

- **Architecture**: Extends existing `HexagonTicketsManager` class with minimal code changes
- **Integration**: Works seamlessly with AG-Grid v33 and existing filter infrastructure
- **Compatibility**: Maintains full backward compatibility with existing workflows
- **Testing**: Comprehensive functionality verified across all supported browsers

## [1.0.22] - 2025-09-21

### Enhanced - KEV (Known Exploited Vulnerabilities) Integration

#### AG-Grid Table Improvements

- **Filterable KEV Column**: Replaced fire emoji (🔥) with filterable YES/NO pills in KEV column
  - Red badge for "YES" (vulnerability is in KEV catalog)
  - Blue badge for "NO" (not in KEV catalog)
  - Follows same design pattern as severity and VPR columns for consistency
  - Enables proper filtering using AG-Grid's built-in text-based filter system

- **KEV Column Filtering Fix**: Fixed KEV column filtering to work with AG-Grid's filtering system
  - Changed database query to return 'Yes'/'No' text values instead of 1/0 boolean
  - Updated column renderer to parse text values for proper filtering compatibility
  - Made KEV badges clickable to open detailed KEV modal for vulnerability information

#### KEV Modal Enhancements

- **CVE Details Integration**: Added "View CVE Details" button in KEV modal
  - Opens vulnerability details modal for comprehensive CVE information
  - Provides seamless navigation between KEV catalog info and full vulnerability details
  - Uses existing `showVulnerabilityDetailsByCVE()` function for consistency

- **NIST NVD Integration**: Replaced CISA KEV Catalog link with NIST NVD link
  - Uses pattern `https://nvd.nist.gov/vuln/detail/${cveId}` for direct CVE lookup
  - Provides more comprehensive vulnerability information from authoritative source
  - Both modal buttons now use consistent primary button style for better UI cohesion

- **Clickable Links in Notes**: Made all HTTPS links in KEV additional notes clickable
  - Links open in 1200x1200px popup windows for consistency with rest of application
  - Automatic regex replacement converts plain URLs to clickable links
  - Preserves existing text while enhancing usability

#### Filter Dropdown Improvements

- **Filter Option Cleanup**: Removed fire emoji from KEV filter option in severity dropdown
  - Changed dropdown option from "🔥 KEV" to simply "KEV" for cleaner interface
  - Maintains clear identification of KEV filtering without emoji clutter

- **KEV Filter Logic Fix**: Fixed KEV filter to properly match vulnerabilities
  - Added special handling in filter logic to distinguish KEV from severity filtering
  - Fixed filter matching to properly check `isKev === "Yes"` when KEV filter selected
  - Ensures consistent filtering behavior across grid, cards, and modal contexts

### Fixed - KEV Data Handling

- **Database Service Updates**: Updated vulnerability service to return text-based KEV values
  - Changed database query from returning 1/0 to 'Yes'/'No' text values
  - Ensures compatibility with AG-Grid's text-based filtering system
  - Maintains data integrity while improving UI functionality

- **Component Consistency**: Fixed KEV handling across all vulnerability components
  - Updated vulnerability cards to check for text value "Yes" instead of boolean
  - Ensured consistent KEV data interpretation in grid, cards, modals, and filters
  - Eliminated discrepancies between different UI components

## [1.0.21] - 2025-09-21

### Added

#### Unified Template Variable System

- **Centralized Variable Configuration**: Created `template-variables.js` with unified variable definitions
  - Consistent naming conventions across all template types ([HEXAGON_TICKET], [SERVICENOW_TICKET], etc.)
  - Categorized variables by function: Ticket Info, Location, Dates, Devices, Personnel, Content, Counts
  - Universal variable access for maximum flexibility across ticket, email, and vulnerability templates
  - Backward compatibility maintained for existing templates

- **Dropdown Variable Interface**: Transformed bulky 300px variable panels into compact Bootstrap dropdowns
  - **87% space reduction**: From 300px fixed panels to 38px dropdown buttons in editor headers
  - Organized variable categories with descriptive icons (📋 Ticket Info, 📍 Location, 📅 Dates, etc.)
  - Click-to-insert functionality with cursor position preservation
  - Auto-close behavior and success notifications for smooth user experience
  - Comprehensive dark theme support with proper contrast and hover states

#### Template Editing Enhancements

- **Enhanced Template Editors**: Improved all three template editors (ticket, email, vulnerability)
  - Consistent dropdown-based variable selection across all editors
  - Better visual organization with category headers and variable descriptions
  - Required vs optional variable highlighting (orange for required, blue for optional)
  - Monospace font for variable names with clear descriptions

- **Improved Space Utilization**: Maximized editing area by eliminating horizontal panels
  - More screen real estate for template content editing
  - Professional appearance with header-integrated dropdown controls
  - Responsive design that adapts to container constraints

### Fixed

#### Template System Bug Resolutions

- **Template Cross-Contamination**: Fixed cache key collisions between template types
  - Eliminated issue where editing one template would affect another
  - Proper isolation between ticket, email, and vulnerability template caches
  - Enhanced cache management with template-specific keys

- **Validation System Issues**: Resolved aggressive validation triggering unwanted restoration
  - Temporarily disabled overly strict template validation that interfered with user edits
  - Improved validation logic to allow user content loading for editing
  - Better error handling and user feedback for template operations

- **ForceRefresh Logic**: Fixed template reloading after reset operations
  - Corrected conditional statements that prevented proper API calls
  - Ensured templates properly reload from server when force refresh is requested
  - Enhanced debugging with comprehensive logging for template operations

### Changed

#### User Interface Improvements

- **Variable Selection UI**: Transformed from horizontal panels to dropdown interface
  - Replaced space-consuming variable panels with compact dropdown buttons
  - Improved workflow with faster variable selection and insertion
  - Better visual hierarchy with organized categories and clear descriptions

- **Template Editor Layout**: Optimized modal space utilization
  - Removed bulky reference panels below editors
  - Integrated variable access directly into editor toolbars
  - Cleaner, more professional appearance throughout template editing interface

#### Technical Improvements

- **Variable System Architecture**: Unified variable management across all components
  - Centralized variable definitions eliminate duplication and inconsistencies
  - Standardized variable naming improves maintainability
  - Prepared foundation for future config builder tools and custom template types

## [1.0.20] - 2025-09-21

### Added

#### Email Template Generation for Tickets

- **Third Tab in Ticket Modal**: Added "Email Template" tab alongside existing "Ticket Details" and "Vulnerabilities" tabs
  - Professional email template automatically generated from ticket data
  - Includes subject line suggestion with site name and Hexagon ticket number
  - Formatted with clear sections: Maintenance Details, Affected Systems, Action Required, Timeline
  - Automatic device list formatting with enumeration

- **Email Copy Button**: New dedicated copy button for email template
  - Icon uses envelope symbol for clear identification
  - Copies formatted email template to clipboard
  - Toast notification confirms successful copy
  - Lazy loading only generates template when tab is clicked

- **Template Edit Button Stub**: Placeholder for future v1.0.21 template editing feature
  - Disabled button with tooltip indicating "Template editing coming in v1.0.21"
  - Positioned alongside copy buttons for consistent UI
  - Prepares interface for upcoming customizable templates

- **Enhanced Workflow**: Email template streamlines communication process
  - Pre-formatted professional communication ready for sending
  - Includes all critical ticket information in email-friendly format
  - Consistent messaging across team communications
  - Reduces time spent composing maintenance notifications

## [1.0.19] - 2025-09-21

### Added

#### Enhanced Ticket Modal with Vulnerability Integration

- **Dual Copy Buttons**: Ticket modal now features two separate copy buttons
  - "Ticket" button: Copies ticket markdown to clipboard (existing functionality)
  - "Vulnerabilities" button: Copies vulnerability report markdown without requiring bundle download

- **Tabbed Interface**: New Bootstrap tabs in ticket modal for better information organization
  - "Ticket Details" tab: Shows existing ticket markdown view
  - "Vulnerabilities" tab: Displays vulnerability report for all devices in the ticket
  - Lazy loading: Vulnerability data only fetched when tab is clicked
  - Fuzzy hostname matching using Levenshtein distance for flexible device matching

- **Improved Workflow**: Users can now quickly access and copy vulnerability data directly from the ticket modal without needing to download the full bundle

### Changed

- **Repository Cleanup**: Removed deprecated files and development artifacts
  - Cleaned up .claude/, .specify/, and .context7/ directories
  - Removed test files, backups, and temporary uploads
  - Streamlined repository structure for better maintainability

## [1.0.18] - 2025-09-20

### Added

#### UI/UX Enhancements

- **Attachment Visibility for Tickets**: Added comprehensive tooltip functionality for "Attach Documentation" button on tickets2.html
  - Displays list of currently attached files with sizes on hover
  - Shows file count badge when documents are attached (e.g., "(3)")
  - Button changes from gray outline to blue when files are present
  - Tooltips persist across page refreshes using localStorage
  - Added Shift+Click and Right-Click functionality to clear all attachments with confirmation
  - Smooth animations and visual feedback for improved user experience
  - Resolves issue where users had no visibility of attached files until downloading bundles

### Fixed

#### Bug Fixes

- **Attachment Tooltip Navigation Bug**: Fixed issue where tooltip displayed empty content after navigating between pages
  - Root cause: Bootstrap tooltip wasn't properly reinitializing when returning to tickets page
  - Solution: Dispose old tooltip instances and create fresh ones with proper data on page load
  - Added 100ms delay to ensure DOM readiness when navigating between pages

- **Version Display in Health Endpoint**: Fixed incorrect version reporting in `/health` API endpoint
  - Corrected package.json path in server.js from `./package.json` to `../package.json` for Docker container
  - Updated docker-compose.yml HEXTRACKR_VERSION environment variable to match package.json
  - Health endpoint now correctly reports version 1.0.18 instead of falling back to old versions

#### Documentation

- **JSDoc Dark Mode Restoration**: Fixed missing dark mode support in developer documentation
  - Ran `inject-jsdoc-theme.js` script to inject theme synchronization into 96 JSDoc HTML files
  - Dark mode now properly syncs with main application theme preference
  - Restored proper styling with dark backgrounds (#0f172a) and light text in dark mode

## [1.0.17] - 2025-09-19

### Added

#### UI/UX Enhancements

- **tickets2.html Beta Implementation**: Introduced beta version of redesigned tickets page with AG-Grid integration
  - Advanced table with column filtering, sorting, resizing, and responsive design
  - SITE and LOCATION columns with ticket accent colors for visual categorization
  - Enhanced user experience with modern data table interface
  - Maintains backward compatibility with existing tickets.html

### Fixed

#### Theme Engine & Visual Improvements

- **Card Border Visibility**: Fixed critical card border issue where vulnerability and device cards blended into page background
  - Root cause: CSS specificity conflicts with `border-color: transparent !important` overrides in dark theme
  - Solution: Standardized border variables from `--tblr-border-color` to `--hextrackr-border-subtle`
  - Enhanced border opacity from 0.08 to 0.15 for better visibility across both light and dark modes
  - Applied Five Whys root cause analysis to identify true underlying issues

- **AG-Grid Dark Mode Contrast**: Fixed poor contrast for SITE and LOCATION ticket accent colors in dark mode
  - Moved ticket accent colors from `.ag-theme-quartz` scope to global `[data-bs-theme="dark"]` scope
  - Optimized colors for WCAG AA compliance with enhanced contrast ratios:
    - Teal: #2dd4bf → #5eead4 (9.5:1 contrast ratio)
    - Amber: #fbbf24 → #fcd34d (11.2:1 contrast ratio)
    - Slate: #94a3b8 → #cbd5e1 (10.2:1 contrast ratio)
  - All ticket accent colors now meet accessibility standards for dark backgrounds

- **CSS Variable Consolidation**: Comprehensive cleanup of CSS variable architecture
  - Fixed Stylelint duplicate variable warnings by creating properly namespaced versions
  - Implemented standard and `-contrast` variants for VPR (Vulnerability Priority Rating) colors
  - Consolidated shadow variables with theme-specific opacity values
  - Created single source of truth for all color definitions across light/dark themes

- **Device Card Interactivity**: Enhanced device cards with click functionality matching vulnerability cards
  - Made device cards clickable with proper cursor styling and modal integration
  - Unified user experience patterns between vulnerability and device card interactions
  - Added comprehensive JSDoc documentation for improved code maintainability

#### CSV Import Pipeline

- **Daily Totals Calculation**: Fixed critical bug where `calculateAndStoreDailyTotalsEnhanced` was missing scan_date filter
  - Root cause: Spec 001 backend refactoring removed the WHERE clause filtering by specific scan date
  - Impact: Each import would overwrite all previous daily totals instead of updating only the current date
  - Solution: Restored `WHERE scan_date = ?` filter in importService.js line 985

- **Batch Processing Restoration**: Re-implemented `processStagingToFinalTables` function with proper lifecycle management
  - Restored grace period handling for vulnerability state transitions
  - Fixed batch processing with 1000-record chunks for performance
  - Ensured atomic imports via staging table approach

- **API Response Format**: Fixed /api/vulnerabilities/stats returning array instead of expected object format
  - Frontend expected severity-keyed object but received array after modularization
  - Restored legacy response contract to maintain backward compatibility

### Documentation

- **CSS Theme Architecture**: Added comprehensive documentation for theme system architecture
  - Documented CSS variable hierarchy and naming conventions
  - Added WCAG contrast guidelines and accessibility best practices
  - Provided CSS customization guide for theme modifications

- **Developer Documentation Link**: Fixed broken dev docs link in documentation portal
  - Changed from `/dev-docs/` to `/dev-docs-html/` to match actual directory structure

- **JSDoc Regeneration**: Updated developer documentation with all recent fixes
  - Documented new import service functions and batch processing
  - Added comprehensive function descriptions for ImportService
  - Enhanced vulnerability-cards.js with detailed JSDoc comments

## [1.0.16] - 2025-09-18

### Fixed

#### Documentation Navigation State Management

- **Navigation State Persistence Issue**: Fixed dual highlighting of menu sections when navigating to documentation from external pages
  - Root cause: Saved navigation state from localStorage was restored even when accessing docs from tickets/vulnerabilities pages
  - Solution: Detect external navigation via `document.referrer` and clear saved state for clean entry
  - Added exclusive menu expansion to prevent multiple sections appearing active simultaneously
  - Overview page now always starts with all menus collapsed for consistent presentation

#### Version Consistency

- **Health API Version Mismatch**: Fixed health endpoint reporting outdated version (1.0.13 instead of 1.0.15)
  - Root cause: Hardcoded `HEXTRACKR_VERSION=1.0.13` in docker-compose.yml overriding code defaults
  - Solution: Enhanced docs generation script to automatically sync version across all files

### Changed

#### Version Management System

- **Centralized Version Updates**: Enhanced html-content-updater.js with comprehensive version synchronization
  - Single source of truth: `app/public/package.json`
  - Automatically updates: footer.html, docker-compose.yml, root package.json, and server.js fallback
  - Runs during `npm run docs:generate` to maintain version consistency project-wide
  - Prevents version drift across multiple hardcoded locations

## [1.0.15] - 2025-09-17

### Changed

#### Backend Modularization Complete

- **Monolithic Refactor Achievement**: Successfully modularized 3,805-line monolithic server.js
  - Reduced main server.js to ~205 lines (94.6% reduction)
  - Extracted into 5 controllers, 4 services, 5 routes, 3 config modules, and 3 utilities
  - Implemented singleton pattern for controllers with dependency injection
  - Maintained 100% backward compatibility with all existing APIs
- **Module Organization**:
  - `/app/controllers/` - Business logic with singleton pattern (5 controllers)
  - `/app/services/` - Data access layer (4 services)
  - `/app/routes/` - Express route definitions (5 route modules)
  - `/app/config/` - Configuration modules (database, middleware, websocket)
  - `/app/utils/` - Utility classes (PathValidator, ProgressTracker, helpers)
- **Critical Initialization Sequence**: Established proper dependency injection order
  - Database initialization → Controller initialization → Route imports → Server start
  - Fixed initialization timing issues that caused "Controller not initialized" errors

### Added

- **Documentation Updates**:
  - Module dependency diagram with ASCII visualization
  - Migration rollback procedure for emergency recovery
  - Updated CLAUDE.md with modular patterns and initialization sequence
  - Comprehensive architecture documentation reflecting new structure

### Fixed

- **Controller Reference Pattern**: Fixed class vs instance pattern in all route files
- **Route Mounting**: Corrected path concatenation issues (e.g., /api/imports/imports)
- **File Name Case Sensitivity**: Standardized on lowercase controller filenames

### Technical Debt Resolved

- **T053 Backend Modularization**: Completed full extraction from monolithic architecture
- **Maintainability**: Improved code organization from single 3,805-line file to 15+ focused modules
- **Testability**: Enabled unit testing through dependency injection and service separation

## [1.0.14] - 2025-09-14

### Added

#### Documentation Portal Enhancements

- **AG-Grid Community Integration**: Advanced data tables for interactive documentation
  - Interactive table converter for markdown tables to AG-Grid format
  - Roadmap table sorting functionality with real-time filtering
  - Responsive AG-Grid tables optimized for mobile devices
  - Dark mode AG-Grid theme integration with proper color schemes
- **Enhanced Navigation System**: Improved user experience and accessibility
  - Back-to-top button with smooth scroll behavior and visual feedback
  - Enhanced breadcrumb navigation system with proper spacing
  - Loading spinner for content transitions
  - Responsive documentation layout with mobile optimization
- **UI/UX Improvements**: Professional navigation and interaction patterns
  - Enhanced navigation with visual feedback and hover effects
  - Improved sub-navigation styling with transform animations
  - Avatar styling enhancements in navigation components
  - Collapse icon rotation animations for expandable sections
- **Mermaid Diagram Support**: Interactive diagram rendering for documentation
  - Client-side Mermaid.js integration for rendering diagrams from markdown
  - Theme-aware diagram rendering with automatic dark/light mode switching
  - Custom CSS styling for consistent diagram appearance across themes
  - Support for flowcharts, sequence diagrams, state diagrams, and more
  - Foundation for future network topology and vulnerability mapping features

#### Architecture Review System

- **Comprehensive Architecture Assessment**: Complete technical review using 5 specialized expert agents
  - Node.js backend architecture analysis (3,809-line monolithic server assessment)
  - SQLite database schema and performance evaluation (15 tables, 31 indexes)
  - OWASP Top 10 security vulnerability assessment
  - JavaScript frontend architecture review (17,951 lines across 46 files)
  - WebSocket real-time communication analysis (Socket.io implementation)
- **Expert Agent System**: 138+ specialized domain expert agents for technical analysis
- **Roadmap Management**: Enhanced project planning with semantic versioning and changelog automation

### Fixed

#### Vulnerability VPR Aggregation (Totals & Trends)

- Fixed inflated per‑severity VPR totals caused by multi‑CVE split rows each carrying the full VPR score
  - Root Cause: Daily totals used `SUM(vpr_score)` over `vulnerabilities_current`, multiplying VPR when a single plugin row listed multiple CVEs
  - Solution: Enhanced daily totals now aggregate VPR by a deduplicated key and sum once per vulnerability entity per host
    - Aggregation key preference: `plugin_id + host` → fallback `plugin_name + host` → fallback `host + description`
    - Counts remain row-based (each CVE row counts); only VPR totals are deduplicated
  - Impact: Stat cards and trend chart now align; Medium spike resolved without altering per‑row VPR in tables
  - Files: `app/public/server.js` (calculateAndStoreDailyTotalsEnhanced)

#### Trend Badge Wiring and Casing

- Fixed trend badges (+/−%) stuck at 0% due to trends not being wired and key casing mismatch
  - Wire: Orchestrator now sets trends on `VulnerabilityStatisticsManager` before UI update
  - Casing: Use capitalized severity keys from `/recent-trends` and robust fallback to data manager trends
  - Files: `app/public/scripts/shared/vulnerability-core.js`, `app/public/scripts/shared/vulnerability-statistics.js`

#### Dark Mode Accessibility Critical Fixes (WCAG Compliance)

- **Navigation Contrast Violation Resolution**: Fixed critical WCAG AA compliance issue
  - **Root Cause**: Selected navigation items had white text on white background (1:1 contrast ratio)
  - **Solution**: Implemented proper dark mode color hierarchy using HexTrackr surface variables
    - Active states: `#2a3f54` background with `#e2e8f0` text (high contrast)
    - Hover states: `#1e293b` background with consistent readable text
    - Sub-navigation: `#94a3b8` muted text with `#243447` hover background
  - **Impact**: Ensures accessibility compliance for visually impaired users
  - **Validation**: Tested across documentation portal, tickets, and vulnerabilities pages

#### Documentation Portal Specific Fixes

- **Header Spacing Issue Resolution**: Eliminated unwanted space above documentation portal header
  - **Root Cause**: CSS rule `.navbar { margin-top: 1rem; }` in docs-tabler.css pushing header down
  - **Solution**: Commented out problematic CSS rule (lines 13-17 in docs-tabler.css)
  - **Impact**: Documentation portal header now aligns consistently with tickets/vulnerabilities pages
  - **Method**: Systematic investigation using sequential thinking and user feedback
- **Breadcrumb and Layout Improvements**: Enhanced documentation page structure
  - Fixed breadcrumb spacing to prevent cramped appearance above menu items
  - Resolved page header positioning conflicts
  - Enhanced documentation content area scroll behavior
  - Improved loading spinner visibility and positioning

#### Modal and Component Accessibility Fixes

- **Modal Contrast Improvements**: Enhanced readability across light and dark themes
  - Improved modal contrast and text readability
  - Fixed table styling in both light and dark modes with proper variable usage
  - Enhanced blockquote styling with theme-aware background colors
  - Resolved loading spinner visibility issues in modal contexts

### Changed

#### CSS Architecture Improvements

- **Modularized Documentation CSS**: Created dedicated docs-tabler.css for portal-specific styling
  - Separated documentation portal styles from main application CSS
  - Enhanced table styling with proper Bootstrap variable integration
  - Improved dark mode table support with enhanced border and background colors
  - Streamlined navigation styling with consistent active states
- **Theme System Enhancements**: Better CSS variable usage for consistency
  - Standardized HexTrackr surface hierarchy variables across components
  - Enhanced CSS custom property usage for maintainable theming
  - Improved color consistency between documentation portal and main application
  - Better separation of concerns between shared and page-specific styles

## [1.0.13] - 2025-09-13

### Added

#### Dark Mode Theme System (Spec 005)

- **Complete Dark/Light Theme Implementation**: Full theme switching system with accessibility focus
  - System preference detection using `prefers-color-scheme` media query
  - Manual theme toggle with persistent localStorage storage (sessionStorage fallback for private browsing)
  - Smooth CSS transitions between light and dark themes
  - WCAG AA compliance with automated contrast ratio validation
  - Screen reader announcements for theme changes via accessibility API
  - Cross-tab synchronization of theme preferences
- **Component Integration**: Seamless theming across all UI components
  - AG-Grid theme integration with custom dark/light variants
  - ApexCharts automatic theme adaptation
  - Tabler framework theme variables override system
  - Modal and overlay components with theme-aware styling
- **Developer Features**: Comprehensive theme development tools
  - Theme validation utilities with contrast checking
  - Debugging tools for theme state management
  - Performance optimizations for theme switching
  - Extensible architecture for future theme variants

### Fixed

#### Card Border Consistency (Dark Mode)

- **Card Border Styling**: Fixed inconsistent border appearance between device cards and vulnerability cards in dark mode
  - Resolved thick white borders on device cards that didn't match the thin dark borders on vulnerability cards
  - Updated `.device-card, .vuln-card` CSS rule in `vulnerabilities.html` to use theme-aware CSS variables
  - Changed hard-coded values to CSS variables for proper theme adaptation:
    - `background: white` → `background: var(--tblr-bg-surface)`
    - `border: 1px solid #e2e8f0` → `border: 1px solid var(--tblr-border-color)`
  - Both card types now display consistent borders across light and dark themes
  - **Engineering Insight**: Hard-coded CSS values prevented proper theme adaptation despite external stylesheet rules
  - **Resolution Method**: Systematic investigation using sequential thinking and disciplined Memento documentation

#### AG-Grid Table Container Overflow (Spec 004)

- Fixed AG-Grid table overflow causing excessive white space in Vulnerability Data Workspace
- Removed problematic grid-height-manager.js calculations and vulnerability-table-fix.css
- Implemented clean flexbox solution for natural container sizing:
  - `.card-body.p-2` uses `display: flex` with consistent minimum height
  - `.view-content` with `flex-grow: 1` for proper space distribution
  - `#vulnGrid` with `height: 100%; flex-grow: 1` for natural expansion
- Table now properly expands for 10, 25, 50, 200 items without overflow or excessive padding
- **Engineering Insight**: Simple CSS flexbox approach solved what complex JavaScript calculations could not
- **Lesson Learned**: Elegant solutions often emerge from removing complexity rather than adding it

## [1.0.12](https://github.com/Lonnie-Bruton/HexTrackr/releases/tag/v1.0.12) - 2025-09-09

### Completed Tasks

#### Javascript Module Extraction (Spec 001)

- vulnerability-statistics.js (364 lines) - Task 1.2 ✅ COMPLETED
- vulnerability-data.js (571 lines) - Task 1.1 ✅ COMPLETED
- vulnerability-chart-manager.js (590 lines) - Task 2.2 ✅ COMPLETED
- vulnerability-details-modal.js (935 lines) - Task 3.3 ✅ COMPLETED
- device-security-modal.js (637 lines) - Additional modal ✅ COMPLETED
- progress-modal.js (649 lines) - Additional modal ✅ COMPLETED
- settings-modal.js (1,296 lines) - Settings management ✅ COMPLETED
- ag-grid-responsive-config.js (356 lines) - Grid configuration ✅ COMPLETED
- vulnerability-search.js (268 lines) - Task 2.1 ✅ COMPLETED (Sept 8)
- vulnerability-grid.js (195 lines) - Task 3.1 ✅ COMPLETED (Sept 8)
- vulnerability-cards.js (345 lines) - Task 3.2 ✅ COMPLETED (Sept 8)
- vulnerability-core.js (571 lines) - T004 ✅ COMPLETED (Sept 8)
- T001 Extract vulnerability-search.js ✅ COMPLETED
- T002 Extract vulnerability-grid.js ✅ COMPLETED
- T003 Extract vulnerability-cards.js ✅ COMPLETED
- T004 Create vulnerability-core.js ✅ COMPLETED

## [1.0.11] - 2025-09-08 (Pre-Release)

### Completed - Sprint T001-T006: JavaScript Modularization Success

- **Extraordinary Sprint Achievement**: 4-week sprint completed in 1 day with 95.1% code reduction
  - **11 Specialized Modules Created**: Complete modular architecture from 2,429-line monolith
  - **Orchestrator Pattern Implementation**: vulnerability-manager.js reduced to 120-line coordinator
  - **Zero Functionality Regression**: All features preserved and validated through comprehensive testing
  - **Widget Architecture Foundation**: Complete foundation established for dashboard platform

- **Module Extraction Achievement**: Comprehensive code organization and maintainability improvements
  - **vulnerability-data.js** (571 lines): Central data management and caching
  - **vulnerability-statistics.js** (364 lines): VPR calculations and metrics generation
  - **vulnerability-search.js** (348 lines): Advanced search and filtering functionality  
  - **vulnerability-grid.js** (529 lines): AG Grid table interface management
  - **vulnerability-cards.js** (395 lines): Card-based responsive layouts
  - **vulnerability-chart-manager.js** (590 lines): ApexCharts visualization management
  - **vulnerability-details-modal.js** (935 lines): Modal system and detail views
  - **vulnerability-core.js** (338 lines): Module orchestration and coordination
  - **Additional supporting modules**: Enhanced architecture with specialized utilities

- **Integration Testing Success**: Comprehensive validation ensuring production readiness
  - **Playwright Browser Testing**: Full UI functionality validation across browsers
  - **Performance Benchmarking**: Maintained sub-2s load times and sub-500ms table rendering
  - **Code Quality Validation**: ESLint compliance and improved complexity scores
  - **Memory Management**: No memory leaks detected in continuous usage testing

### Completed - Code Quality Excellence

- **Markdownlint Configuration Mastery**: Achieved 92% reduction in false positives (157→13 issues)
  - **Directory Exclusion Strategy**: Comprehensive ignore patterns eliminating node_modules and test artifacts
  - **Clean PR Achievement**: Pull Request #32 with zero markdown issues through proper configuration
  - **Quality Gate Success**: Focused validation on documentation files only, excluding build artifacts
- **Code Quality Pipeline Enhancement**: Systematic approach to quality tool configuration
  - **False Positive Elimination**: Strategic directory exclusion patterns for accurate analysis
  - **Documentation Standards**: Maintained high documentation quality without tool noise
  - **Development Velocity**: Reduced quality checking overhead through intelligent exclusions

### Completed - Sprint Task Achievement

- **Task 1.2 Extraction Complete**: vulnerability-statistics.js successfully modularized (Sep 8, 2025)
  - **VPRStatistics Widget**: Created 300-line statistics calculation module
  - **Modular Architecture**: Established pattern for remaining 6 widget extractions
  - **Widget Foundation**: Prepared statistics component for future dashboard integration
- **Development Milestone**: First major component extraction from ModernVulnManager complete
  - **Code Organization**: Statistical calculations now properly separated and reusable
  - **Interface Standardization**: Created consistent API patterns for inter-widget communication
  - **Quality Validation**: Comprehensive testing ensures zero functionality regression

### Strategic - Project Structure Analysis

- **Critical Structure Assessment**: Identified 39 root directory items requiring organization
  - **Docker Conflict Risk**: Accidental Node.js startups causing container conflicts
  - **Path Reference Impact**: 20+ HTML files requiring updates after folder restructure
  - **Git Strategy Planning**: Submodule approach for clean public repo with dev backup
- **Architecture Planning**: /app/public/ migration strategy developed
  - **Container Isolation**: Ensure Docker-only Node.js execution
  - **Clean Repository Structure**: <10 root items for improved navigation
  - **Development File Separation**: Distinguish app code from development tools

## [1.0.10] - 2025-09-07

### Fixed - Real-Time Progress Tracking

- **WebSocket Progress Updates**: Fixed CSV import progress modal hanging at 95% with spinning loading circle
  - **Session ID Synchronization**: Resolved frontend/backend session ID mismatch preventing real-time updates
    - Frontend generating: `import_1757226509515_1rd7p4qpd`
    - Backend generating: `cb92e1d6-42fa-4e8b-a01f-4ca6533011d3`
    - Fixed by modifying server.js to use frontend's sessionId instead of UUID generation
  - **Progress Complete Event Handling**: Added missing `progress-complete` event listener in WebSocket client
    - Server was emitting `progress-complete` but frontend only listened for `progress-update`
    - Added proper completion handler in `websocket-client.js` and `progress-modal.js`
    - Fixed JavaScript error: `this.updateProgressBar is not a function` → changed to `this.updateUI()`
  - **Page Refresh Integration**: Fixed modal closing without refreshing underlying data
    - Added `window.refreshPageData` function to `vulnerability-manager.js`
    - Progress modal now properly triggers data refresh after successful import completion
    - Eliminates blank page state on first upload after modal close

### Enhanced - User Experience Improvements

- **Progress Modal Cleanup**: Hidden hardcoded Current/Total/ETA display elements
  - Added `d-none` class to progress details section showing "0 0 --" placeholder values
  - Server already tracks current/total/eta internally for future enhancement implementation
  - Clean modal interface focusing on percentage progress and success messaging

### Performance - Import Processing Validation

- **CSV Import Speed**: Confirmed excellent import performance at ~6.8 seconds for 10,000 rows
  - User-reported "hanging at 95%" was UI issue, not performance problem
  - Bulk SQLite operations with transaction batching maintaining optimal throughput
  - WebSocket progress updates now properly display real-time progress from 5% → 95% → completion

## [1.0.9] - 2025-09-07

### Code Quality - Comprehensive Codacy Resolution

- **320 Issues Resolved**: Systematic code quality review resolved comprehensive issues
  - **SQL Schema Compliance**: Fixed critical syntax errors in `data/schema.sql`
    - Corrected comment formatting and positioning for SQLite compatibility
    - Fixed AUTOINCREMENT syntax errors preventing proper table creation
    - Resolved OR clause syntax issues in constraint definitions
  - **JavaScript Architecture Analysis**: Complete server.js complexity assessment and refactoring roadmap
    - Identified complexity score of 116 requiring modular architecture approach
    - Created comprehensive refactoring plan targeting <12 complexity per module
    - Established modular structure: services/, routes/, utils/, middleware/ organization
  - **CSS Standards Compliance**: Achieved full color notation standardization
    - Fixed rgba/rgb color format compliance across all stylesheets
    - Eliminated deprecated color notation patterns for browser compatibility
    - Enhanced CSS maintainability with consistent color standards

### Development Infrastructure

- **Code Quality Pipeline**: Enhanced automated quality assurance workflow
  - **Configuration Management**: Optimized `.codacy/codacy.yaml` exclusion patterns
    - Updated file exclusion rules for more accurate analysis
    - Improved configuration for JavaScript and CSS quality gates
    - Enhanced markdown linting integration with development workflow
  - **Pre-commit Enhancement**: Strengthened markdown processing validation
    - Improved formatting consistency across documentation files
    - Enhanced link validation and structure checking
    - Integrated quality gates with development workflow

### Technical Documentation

- **Architecture Documentation**: Comprehensive refactoring strategy documentation
  - **Modular Architecture Plan**: Detailed server.js refactoring roadmap in `/dev-docs/architecture/refactoring-plan.md`
    - 4-week implementation timeline with weekly milestones
    - Service layer extraction strategy with complexity targets
    - Risk mitigation and success metrics for architectural transition
  - **Development Workflow**: Enhanced development documentation with quality improvements section
    - Updated `/dev-docs/development/index.md` with code quality standards
    - Documented recent quality improvement achievements and methodologies
    - Integrated quality assurance practices with development best practices

## [1.0.8] - 2025-09-06

### Security Enhancements

- **XSS Protection**: Fixed critical AG Grid cell renderer vulnerability by replacing dangerous inline onclick handlers with secure event system
  - Removed vulnerable `onclick="vulnManager.viewDeviceDetails('${hostname}')"` pattern susceptible to code injection
  - Implemented secure `onCellClicked` event handler with proper parameter validation
  - Prevents hostname values containing quotes or special characters from breaking HTML structure
- **CORS Security Hardening**: Restricted unrestricted CORS policy to secure localhost-only origins
  - Changed from wide-open `cors()` to specific `origin: ['http://localhost:8080', 'http://127.0.0.1:8080']`
  - Added explicit HTTP methods and headers whitelist for enhanced security posture
  - Enables credentials for future authentication integration
- **DoS Protection**: Implemented express-rate-limit middleware to prevent denial-of-service attacks
  - Limits each IP to 100 requests per 15-minute window on all /api/ endpoints
  - Provides standardized rate limiting headers for client awareness
  - Protects import/export endpoints from API flooding attacks

### Performance Improvements

- **CSV Import Performance**: Achieved 11-13x speed improvement through staging table optimization
  - Large CSV files now import in 8-12 seconds instead of 45-60 seconds (10,000 rows tested)
  - Switched frontend from `/api/vulnerabilities/import` to high-performance `/api/vulnerabilities/import-staging`
  - Utilizes bulk database operations with transaction batching for optimal throughput
  - Maintains full rollover deduplication logic while dramatically improving user experience

### Development Infrastructure (2)

- **Comprehensive Security Audit**: Systematic code quality assessment with detailed vulnerability analysis
  - Conducted thorough security review identifying 6 vulnerabilities and architectural improvements
  - Generated detailed audit reports documenting security issues and remediation recommendations
  - Created comprehensive technical documentation structure in dev-docs/ for ref.tools indexing
- **Technical Documentation**: Established development documentation architecture
  - Comprehensive AG Grid responsive patterns, database schema evolution, and testing strategies
  - Created keyword-indexed technical documentation for enhanced searchability via ref.tools
  - Separated technical docs (dev-docs/) from user documentation (docs-source/) for clarity
- **Version Management**: Improved version reference strategy for reduced maintenance burden
  - Implemented generic version references in technical documentation to prevent version drift
  - Maintained specific versions only where semantically necessary (package.json, CHANGELOG, ROADMAP)

## [1.0.6] - 2025-09-06

### Fixed

- **Critical Modal Aggregation System**: Resolved major user-facing issues with modal data display
  - Fixed vulnerability modal showing only 1 device instead of properly aggregating all affected devices (now shows 24 devices for CVE-2017-3881)
  - Fixed device modal showing only 1 vulnerability instead of properly aggregating all vulnerabilities per device (now shows 12 vulnerabilities for grimesnswan03)
  - Implemented universal aggregation key using description field for consistent data grouping
  - Enhanced modal layering with proper Bootstrap Modal.getInstance() management

### Enhanced

- **Modal Architecture and User Experience**
  - Implemented description-field-based universal aggregation system for consistent data relationships
  - Enhanced testing strategy with comprehensive Playwright browser automation for modal workflows
  - Validated import/export pipeline performance with 10,000+ record handling
  - Improved modal transition workflow: vulnerability modal → closes → device modal opens seamlessly

### Technical Improvements

- **Testing and Validation Infrastructure**
  - Added comprehensive Playwright test coverage for modal aggregation functionality
  - Implemented automated UI testing for vulnerability and device modal interactions
  - Enhanced data validation pipeline for large dataset imports and aggregation accuracy
  - Improved modal state management with proper Bootstrap integration

## [1.0.7] - 2025-09-06

### Enhanced - Documentation Infrastructure

- **Documentation Infrastructure**: Comprehensive documentation update with modal architecture patterns
  - Documented modal aggregation system using description field as universal matching key
  - Enhanced testing documentation with Playwright browser automation integration
  - Updated user guides with detailed modal interaction workflows and functionality
  - Improved architecture documentation covering Bootstrap modal layering and state management

### Technical Improvements - Knowledge Management

- **Knowledge Management Integration**: Enhanced development workflow with persistent knowledge systems
  - Implemented pattern recognition system for development consistency
  - Documented modal aggregation architecture patterns for future development consistency
  - Enhanced testing strategy documentation with comprehensive Playwright validation workflows
  - Updated development guides with modern browser automation testing approaches

### Planned - v1.0.8

- **Dashboard Implementation**: Begin widget-based customizable dashboard development
- **Ticket System Modularization**: Apply lessons learned to tickets.js refactoring
- **Advanced Modal Features**: Implement export and reporting functionality from modal views

## [1.0.5] - 2025-09-05

### Added

- **JavaScript Modularization Architecture**: Established foundation for widget-based dashboard development
  - Created `/dev-docs/architecture/` documentation system with symbol tables and module boundaries
  - Established unified development workflow with enhanced pattern management
  - Designed comprehensive dashboard vision for drag-drop widget customization

- **PaginationController Module**: Successfully extracted first reusable component (216 lines)
  - Reduced vulnerability-manager.js from 2,614 to 2,429 lines (185 line reduction)
  - Established modularization patterns for future extractions
  - Validated zero-regression refactoring process

### Enhanced - Development Workflow

- **Development Workflow**: Standardized development documentation and processes
  - Updated development guides and instruction files with consistent patterns
  - Implemented systematic development handoff procedures
  - Created architectural documentation for coordinated development

- **Project Documentation**: Updated roadmap and sprint priorities to reflect modularization focus
  - Moved JavaScript refactoring to top priority status
  - Deferred documentation sprint until modularization completion
  - Established 4-week Phase 2 timeline for ModernVulnManager splitting

## [1.0.4] - 2025-09-05

### Added - Agent Enhancements

- **UI Testing Enhancement**: Integrated Playwright for live browser testing and visual validation
  - Enhanced testing capabilities with real-time browser automation for design verification
  - Added comprehensive visual testing for UI improvements and changes
  - Implemented before/after screenshot comparison for design changes

### Fixed - Version & Modal Issues

- **Version Badge Synchronization**: Fixed version inconsistency across application components
  - Resolved version badge displaying v1.0.1 while package.json showed v1.0.3
  - Enhanced version-manager.js to include footer badge URL synchronization
  - Added automated version sync command: `node scripts/version-manager.js <new-version>`
  - Implemented production safety with timestamped backups and comprehensive file manifest

- **Modal Layering Bug**: Fixed critical modal interaction issue in vulnerability management
  - Resolved hostname links within vulnerability modal opening device modal behind existing modal
  - Added proper Bootstrap Modal.getInstance() check to close existing modals before opening new ones
  - Implemented clean modal transitions: vulnerability modal → closes → device modal opens
  - Comprehensive Playwright testing confirms smooth modal workflows without layering issues

- **Table Resizing and Pagination**: Implemented working table resizing and card pagination system
  - Added responsive table column resizing functionality
  - Implemented complete pagination system with 6-card default for optimal viewing
  - Fixed incomplete pagination code that previously broke card display functionality
  - Restored comprehensive card functionality across all views

### Enhanced - User Experience

- **User Experience Improvements**
  - Professional modal behavior with proper state management
  - Improved visual consistency with synchronized version badges across all components
  - Enhanced table interaction with responsive design and pagination controls
  - Streamlined vulnerability-to-device navigation workflow

### Technical Improvements - Agent Architecture

- **Testing Architecture**: Enhanced documentation and testing infrastructure with advanced integrations
  - Added Playwright for live browser validation of UI changes
  - Integrated persistent knowledge management across development sessions
  - Improved documentation pipeline with automated visual verification

- **Version Management**: Comprehensive version synchronization system
  - Enhanced version-manager.js with footer badge support and backup safety
  - Added regex pattern matching for badge URL updates: `/HexTrackr-v[\\d.]+(-blue\\?style=flat)/g`
  - Implemented automated backup system with timestamps and rollback capabilities

## [1.0.3] - 2025-09-03

### Fixed - Documentation Accuracy

- **Documentation Accuracy**: Comprehensive documentation review and fixes
  - Updated API reference to include missing `/api/restore` endpoint
  - Clarified difference between `/api/vulnerabilities/import` and `/api/import/vulnerabilities` endpoints
  - Fixed formatting and consistency issues across documentation
  - Ensured all user guides are complete and accurate

### Enhanced - Documentation Improvements

- **Documentation Improvements**:
  - Added explanatory section on import API options
  - Expanded backup and restore documentation with clearer examples
  - Improved navigation and cross-references between related documentation

### Enhanced (Infrastructure)

- **Documentation Infrastructure**: Enhanced automation and quality assurance
  - Improved documentation generation pipeline with automated analysis
  - Added comprehensive documentation review standards and metrics
  - Enhanced cross-reference validation and content accuracy checking

- Docs: Dynamic overview statistics loaded from new `/api/docs/stats` endpoint; falls back to existing static counts

  if API unavailable

- Ticket modal enhancements (v1.1.0)
  - XT# read-only field display
  - Site/location separation and validation
  - Status workflow updates (remove In-Progress, add Staged/Failed/Overdue)
  - Drag-drop UX improvements with accessibility features
  - Auto-status updates for overdue tickets

## [1.0.1] - 2025-08-27

### Fixed - Device Management UI

- **Device Management UI**: Fixed button order from + - to - + for consistent positioning
  - Resolved button position switching that caused UX friction during rapid clicking
  - Updated both initial template (tickets.html) and dynamic generation (tickets.js)
  - Enables efficient "tap tap tap" workflow without mouse repositioning

### Improved

- **Drag-and-Drop System**: Comprehensive bug fixes for device reordering
  - Fixed drag-to-top insertion logic to work repeatedly
  - Preserved reverse button visibility during drag operations
  - Fixed reverse toggle functionality to properly toggle state
  - Enhanced feedback system to maintain UI consistency during operations

## [1.0.0] - 2025-08-27

### Summary

Stable baseline release of HexTrackr cybersecurity ticket and vulnerability management system.

### Features

- **Dual-Purpose Management System**
  - Ticket management with full CRUD operations
  - Vulnerability tracking and analysis
  - Real-time statistics dashboard

- **Database Management**
  - SQLite backend with 17 tickets and 100,553+ vulnerabilities
  - Comprehensive backup/restore system (ZIP format)
  - CSV import/export functionality
  - Web-based data management (no technical knowledge required)

- **ServiceNow Integration**
  - Configurable ServiceNow instance URL
  - Clickable ticket number links
  - Settings modal configuration

- **User Interface**
  - Bootstrap 5 (tickets) + Tabler.io (vulnerabilities) frameworks
  - Responsive design with modular CSS architecture
  - Dark/light theme support
  - Settings modal with tabbed interface

- **Development Infrastructure**
  - Docker-only deployment with Docker Compose
  - Modular JavaScript architecture (shared/pages separation)
  - Comprehensive documentation system
  - Git-based version control with systematic backups

### Technical Stack

- **Backend**: Node.js/Express with SQLite database
- **Frontend**: HTML5, JavaScript (ES6+), Bootstrap 5, Tabler.io
- **Deployment**: Docker + Docker Compose
- **Storage**: SQLite with localStorage fallback
- **Port**: localhost:8080

### Recent Fixes (Leading to v1.0.0)

- ✅ **Field Mapping Fix**: Resolved backend/frontend field mapping preventing ticket saves
- ✅ **ServiceNow Integration Restoration**: Fixed ID mismatches and exposed global functions
- ✅ **Modular CSS Architecture**: Eliminated font inconsistencies with proper CSS organization
- ✅ **Settings Modal Enhancement**: Added Papa Parse 5.4.1 and JSZip 3.10.1 for robust file handling

### Database Statistics (v1.0.0)

- Tickets: 17 total (9 open, 5 overdue, 8 completed)
- Vulnerabilities: 100,553 total
- Total Records: 100,570

### Known Limitations

- Manual XT# assignment (auto-generation planned for v1.1.0)
- Basic drag-drop interface (accessibility improvements planned)
- Status workflow needs refinement (updates planned for v1.1.0)

---

## Version History Notes

### Pre-v1.0.0 Development

- Extensive data recovery and restoration work
- Multiple architecture improvements and bug fixes
- Database corruption recovery with complete data restoration
- Progressive enhancement of import/export functionality

### Development Methodology

- Git-based development with systematic backup commits
- Docker-only deployment strategy
- Modular code organization (scripts/shared/, scripts/pages/)
- Comprehensive documentation maintenance

---

## Release Process

### Version Numbering

- **Major (X.0.0)**: Breaking changes or major architectural updates
- **Minor (1.X.0)**: New features and enhancements (backward compatible)
- **Patch (1.1.X)**: Bug fixes and minor improvements

### Release Cycle

1. Feature development on main branch with backup commits
2. Version tag creation with comprehensive release notes
3. Docker image updates with version tags
4. Documentation updates and roadmap adjustments
5. GitHub release with change summary

### Development Workflow

- All changes documented with descriptive commit messages
- Pre-work backup commits for safety
- Step-by-step implementation with verification
- Comprehensive testing before version tags
