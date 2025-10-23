# HEX-324 RESEARCH: Database Schema Analysis

## WHAT - Current Implementation Analysis

### Current Schema Initialization Architecture

HexTrackr's database schema is initialized through **three distinct pathways**, creating fragmentation that this consolidation addresses.

---

## Pathway 1: Base Schema - `init-database.js`

**Location**: `/app/public/scripts/init-database.js`
**Execution**: Manual CLI (`npm run init-db`) or Docker initialization
**Tables Created**: 15 tables (documented) / 16 tables (actual - includes vendor_daily_totals)

### Table Creation Analysis (Lines 54-465)

#### Created Tables (16 total)

1. **tickets** (line 63-82)
   - Core business entity for field operations
   - Primary key: `id TEXT PRIMARY KEY`
   - UNIQUE constraint: `xt_number TEXT UNIQUE` (OUTDATED - removed in production via migration)

2. **vulnerability_imports** (line 85-95)
   - CSV import tracking and metadata
   - Foreign key parent for vulnerability tables

3. **vulnerabilities** (line 99-123)
   - Legacy vulnerability data (pre-rollover)
   - Foreign key: `import_id → vulnerability_imports(id)`
   - Migration 006 added: `operating_system`, `solution_text`

4. **ticket_vulnerabilities** (line 126-135)
   - Junction table (many-to-many)
   - Foreign keys: `ticket_id → tickets(id)`, `vulnerability_id → vulnerabilities(id)`

5. **vulnerability_snapshots** (line 139-167)
   - Historical scan data for trend analysis
   - Foreign key: `import_id → vulnerability_imports(id)`
   - Deduplication fields: `enhanced_unique_key`, `confidence_score`, `dedup_tier`

6. **vulnerabilities_current** (line 171-202)
   - Active vulnerability state
   - UNIQUE constraint: `unique_key TEXT UNIQUE`
   - Lifecycle tracking: `lifecycle_state`, `resolved_date`, `resolution_reason`

7. **vulnerability_daily_totals** (line 205-221)
   - Aggregated metrics by date
   - UNIQUE constraint: `scan_date TEXT NOT NULL UNIQUE`
   - 365-day retention policy (automated cleanup)

8. **vendor_daily_totals** (line 226-242)
   - Vendor-specific daily aggregation (Migration 008)
   - UNIQUE constraint: `(scan_date, vendor)`
   - Permanent retention (never cleaned up)

9. **vulnerability_staging** (line 246-276)
   - Import staging area for batch processing
   - Lifecycle state: `lifecycle_state TEXT DEFAULT 'staging'`

10. **email_templates** (line 279-290)
    - User-customizable email templates
    - 4 template types: ticket notifications

11. **kev_status** (line 293-304)
    - CISA KEV (Known Exploited Vulnerabilities) tracking
    - Primary key: `cve_id TEXT PRIMARY KEY`
    - Synced from https://www.cisa.gov/sites/default/files/feeds/known_exploited_vulnerabilities.json

12. **sync_metadata** (line 307-316)
    - API sync tracking (KEV, Cisco, Palo Alto)
    - Tracks: sync time, record count, status, error messages

13. **ticket_templates** (line 319-330)
    - Field operations ticket templates
    - Markdown content for consistent ticket creation

14. **vulnerability_templates** (line 333-344)
    - CVE-specific markdown templates
    - Similar structure to ticket templates

15. **users** (line 347-359)
    - Authentication and authorization
    - Password hashing: Argon2id (implemented in seedInitialData)
    - Role: `role TEXT DEFAULT 'superadmin'`
    - Account lockout: `failed_attempts`, `failed_login_timestamp`

16. **user_preferences** (line 362-371)
    - Cross-device settings persistence (HEX-138)
    - Foreign key: `user_id → users(id) ON DELETE CASCADE`
    - UNIQUE constraint: `(user_id, preference_key)`
    - Trigger: `user_preferences_updated_at` auto-updates timestamp

### Index Creation (Lines 384-433)

**Documented Count**: 37 indexes (line 459)
**Actual Count**: 49 indexes created in init-database.js
**Production Count**: 68 indexes (includes runtime-created tables)

#### Vulnerability Table Indexes (Lines 384-407)
- `idx_vulnerabilities_hostname` - hostname lookups
- `idx_vulnerabilities_severity` - severity filtering
- `idx_vulnerabilities_cve` - CVE searches
- `idx_vulnerabilities_import` - import relationship queries

#### Snapshot Table Indexes (Lines 394-398)
- `idx_snapshots_scan_date` - date range queries
- `idx_snapshots_hostname` - historical host lookups
- `idx_snapshots_severity` - trend filtering
- `idx_snapshots_enhanced_key` - deduplication
- `idx_snapshots_cve` - CVE history tracking

#### Current Vulnerabilities Indexes (Lines 399-408)
- `idx_current_unique_key` - deduplication enforcement
- `idx_current_scan_date` - temporal queries
- `idx_current_enhanced_unique_key` - advanced deduplication
- `idx_current_lifecycle_scan` - composite (lifecycle_state, scan_date)
- `idx_current_confidence_tier` - confidence scoring
- `idx_current_active_severity` - active vulnerability filtering
- `idx_current_resolved_date` - resolution tracking
- `idx_current_cve` - CVE lookups
- `idx_current_vendor` - vendor filtering (HEX-101 Blocking Issue #3)

#### Ticket Indexes (Lines 390-393)
- `idx_tickets_status` - status filtering
- `idx_tickets_site` - site-based queries
- `idx_tickets_location` - location filtering
- `idx_tickets_xt` - XT number lookups

#### Vendor Daily Totals Indexes (Lines 413-415)
- `idx_vendor_daily_scan_date` - date filtering
- `idx_vendor_daily_vendor` - vendor filtering
- `idx_vendor_daily_composite` - composite (vendor, scan_date)

### Trigger Creation (Lines 374-381)

**Trigger**: `user_preferences_updated_at`
**Purpose**: Auto-update `updated_at` timestamp on modification
**Target Table**: `user_preferences`

---

## Pathway 2: Service-Level Initialization

### Service: `ciscoAdvisoryService.js`

**Location**: `/app/services/ciscoAdvisoryService.js`
**Constructor Call**: Line 60 - `this.initializeTables()`
**Execution**: Every service instantiation (application startup)

#### Table Created: `cisco_advisories`

**Schema** (Lines 67-83):
```sql
CREATE TABLE IF NOT EXISTS cisco_advisories (
    cve_id TEXT PRIMARY KEY,
    advisory_id TEXT,
    advisory_title TEXT,
    severity TEXT,
    cvss_score TEXT,
    first_fixed TEXT,              -- JSON array (legacy, see Migration 007)
    affected_releases TEXT,        -- JSON array
    product_names TEXT,            -- JSON array
    publication_url TEXT,
    last_synced TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)
```

#### Indexes Created (Lines 85-92):
- `idx_cisco_advisories_cve` - CVE lookups
- `idx_cisco_advisories_synced` - sync status queries
- `idx_vulnerabilities_is_fixed` - partial index (WHERE is_fixed = 1)

**Note** (Lines 94-96): Migration 005 creates `is_fixed`, `fixed_cisco_versions`, `fixed_cisco_url`, `cisco_synced_at` columns in `vulnerabilities` table. Service does NOT alter vulnerabilities table.

### Service: `paloAltoService.js`

**Location**: `/app/services/paloAltoService.js`
**Constructor Call**: Line 56 - `this.initializeTables()`
**Execution**: Every service instantiation (application startup)

#### Table Created: `palo_alto_advisories`

**Schema** (Lines 63-79):
```sql
CREATE TABLE IF NOT EXISTS palo_alto_advisories (
    cve_id TEXT PRIMARY KEY,
    advisory_id TEXT,
    advisory_title TEXT,
    severity TEXT,
    cvss_score TEXT,
    first_fixed TEXT,              -- JSON array
    affected_versions TEXT,        -- JSON array (from x_affectedList)
    product_name TEXT,             -- Always "PAN-OS" for v1
    publication_url TEXT,
    last_synced TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)
```

#### Indexes Created (Lines 81-88):
- `idx_palo_advisories_cve` - CVE lookups
- `idx_palo_advisories_synced` - sync status queries
- `idx_vulnerabilities_is_fixed` - partial index (duplicate, already created by Cisco service)

**Note** (Lines 90-92): Migration 006 creates `is_fixed`, `fixed_palo_versions`, `fixed_palo_url`, `palo_synced_at` columns in `vulnerabilities` table.

### Service: `kevService.js`

**Location**: `/app/services/kevService.js`
**Constructor Call**: Line 44 - `this.initializeTables()`
**Execution**: Every service instantiation (application startup)

#### Tables Created: `kev_status`, `sync_metadata`

**kev_status Schema** (Lines 51-67):
```sql
CREATE TABLE IF NOT EXISTS kev_status (
    cve_id TEXT PRIMARY KEY,
    date_added DATE NOT NULL,
    vulnerability_name TEXT,
    vendor_project TEXT,
    product TEXT,
    required_action TEXT,
    due_date DATE,
    known_ransomware_use BOOLEAN DEFAULT 0,
    notes TEXT,
    last_synced TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)
```

**sync_metadata Schema** (Lines 75-88):
```sql
CREATE TABLE IF NOT EXISTS sync_metadata (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    sync_type TEXT NOT NULL,
    sync_time TIMESTAMP NOT NULL,
    next_sync_time TIMESTAMP,      -- Added in HEX-279
    version TEXT,
    record_count INTEGER,
    status TEXT DEFAULT 'completed',
    error_message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)
```

#### Indexes Created (Lines 69-90):
- `idx_kev_status_cve_id` - CVE lookups
- `idx_kev_status_due_date` - due date filtering
- `idx_kev_status_date_added` - chronological queries
- `idx_kev_status_ransomware` - partial index (WHERE known_ransomware_use = 1)
- `idx_sync_metadata_type_time` - composite (sync_type, sync_time DESC)

**Duplication Note**: Both `kev_status` and `sync_metadata` are ALSO created in `init-database.js` (lines 293-316). This creates redundancy but is harmless due to IF NOT EXISTS.

---

## Pathway 3: Migration Scripts

### Migration 007: `normalize-cisco-fixed-versions.sql`

**Location**: `/app/public/scripts/migrations/007-normalize-cisco-fixed-versions.sql`
**Issue**: HEX-287 - Fix data corruption from multi-OS-family CVEs
**Version**: v1.0.79
**Date**: 2025-10-18

#### Root Cause Analysis (Lines 11-20)

**Problem**: One-to-many relationship (CVE → multiple OS family fixes) stored in denormalized JSON array caused INSERT OR REPLACE to overwrite previous OS family data.

**Example**:
- CVE-2025-20352 affects IOS and IOS XE
- First sync: Saves IOS fix versions → `first_fixed: ["15.2(8)E8", "15.2(9)E"]`
- Second sync: Saves IOS XE fix versions → `first_fixed: ["17.12.6", "17.13.1"]` (OVERWRITES IOS data)

**Solution**: Third Normal Form (3NF) normalization
- `cisco_advisories`: One row per CVE (metadata)
- `cisco_fixed_versions`: Multiple rows per CVE (OS-specific fixes)

#### Table Created: `cisco_fixed_versions`

**Schema** (Lines 26-39):
```sql
CREATE TABLE IF NOT EXISTS cisco_fixed_versions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    cve_id TEXT NOT NULL,
    os_family TEXT NOT NULL,             -- ios, iosxe, iosxr, nxos, asa, ftd, fxos
    fixed_version TEXT NOT NULL,         -- 15.2(8)E8, 17.12.6, etc.
    affected_version TEXT,               -- Version this fixes
    last_synced TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (cve_id) REFERENCES cisco_advisories(cve_id) ON DELETE CASCADE,
    UNIQUE(cve_id, os_family, fixed_version)
)
```

#### Indexes Created (Lines 45-55):
- `idx_fixed_versions_cve` - CVE lookups (most common query)
- `idx_fixed_versions_os_family` - OS family filtering
- `idx_fixed_versions_lookup` - composite (cve_id, os_family) for frontend queries

#### Data Migration (Lines 57-78)

**Best-Effort Migration**: Extract existing JSON arrays into normalized rows with `os_family = 'unknown'` (corrected on next sync).

```sql
INSERT OR IGNORE INTO cisco_fixed_versions (cve_id, os_family, fixed_version, last_synced)
SELECT
    ca.cve_id,
    'unknown' as os_family,
    json_each.value as fixed_version,
    ca.last_synced
FROM cisco_advisories ca,
     json_each(ca.first_fixed)
WHERE ca.first_fixed IS NOT NULL
  AND ca.first_fixed != '[]'
  AND ca.first_fixed != 'null';
```

#### Rollback Safety (Lines 80-85)

**Strategy**: Keep old columns (`first_fixed`, `affected_releases`, `product_names`) for 1-2 releases in case rollback needed. Will be removed in Migration 008 after validation.

### Migration 012: `create-audit-logs.sql`

**Location**: `/app/public/scripts/migrations/012-create-audit-logs.sql`
**Issue**: HEX-254 - Unified logging system with audit trail
**Version**: v1.0.67+
**Date**: 2025-10-16

#### Tables Created: `audit_logs`, `audit_log_config`

**audit_logs Schema** (Lines 13-36):
```sql
CREATE TABLE IF NOT EXISTS audit_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,

    -- Event Classification (indexed)
    category TEXT NOT NULL,                   -- 'user.login', 'ticket.delete', 'import.start'
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,

    -- User Context (nullable for system events)
    user_id TEXT,
    username TEXT,

    -- Request Context (if web request)
    ip_address TEXT,
    user_agent TEXT,
    request_id TEXT,                          -- Correlation ID

    -- Encrypted Payload (AES-256-GCM)
    encrypted_message BLOB NOT NULL,
    encrypted_data BLOB,
    encryption_iv BLOB NOT NULL,

    -- Metadata
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
)
```

**audit_log_config Schema** (Lines 54-73):
```sql
CREATE TABLE IF NOT EXISTS audit_log_config (
    id INTEGER PRIMARY KEY CHECK (id = 1),    -- Singleton table

    -- Encryption Key (AES-256, 32 bytes)
    encryption_key BLOB NOT NULL,
    key_created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    key_rotated_at DATETIME,                  -- Future key rotation feature

    -- Retention Policy
    retention_days INTEGER DEFAULT 30,
    last_cleanup_at DATETIME,

    -- Statistics
    total_logs_written INTEGER DEFAULT 0,
    total_logs_purged INTEGER DEFAULT 0,

    -- Metadata
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
)
```

#### Indexes Created (Lines 39-46):
- `idx_audit_logs_category` - category filtering
- `idx_audit_logs_timestamp` - temporal queries
- `idx_audit_logs_user_id` - user-specific audits
- `idx_audit_logs_username` - username lookups
- `idx_audit_logs_created_at` - chronological ordering
- `idx_audit_logs_category_timestamp` - composite (category, timestamp) for common query pattern

#### Initialization (Lines 75-78):
```sql
INSERT OR IGNORE INTO audit_log_config (id, retention_days)
VALUES (1, 30);
```

**Note**: Encryption key generated by LoggingService on first init, not in migration.

---

## Production Schema Reality

**Verification Method**: Docker exec on production database
**Date**: 2025-10-22
**Source Files**: `/tmp/hextrackr-production-schema.sql`, `/tmp/hextrackr-tables.txt`

### Table Count Discrepancy Analysis

| Source | Table Count | Accuracy |
|--------|-------------|----------|
| `init-database.js:459` message | 15 tables | ❌ WRONG (missing vendor_daily_totals) |
| `init-database.js` actual code | 16 tables | ✅ CORRECT (for init script only) |
| Service initialization | +3 tables | (cisco_advisories, palo_alto_advisories, kev_status duplicate) |
| Migration 007 | +1 table | (cisco_fixed_versions) |
| Migration 012 | +2 tables | (audit_logs, audit_log_config) |
| **Production Total** | **22 tables** | (21 application + 1 SQLite artifact) |

### Complete Production Table List (22 tables)

#### Application Tables (21)

1. audit_log_config (Migration 012)
2. audit_logs (Migration 012)
3. cisco_advisories (ciscoAdvisoryService)
4. cisco_fixed_versions (Migration 007)
5. email_templates (init-database.js)
6. kev_status (init-database.js + kevService duplicate)
7. palo_alto_advisories (paloAltoService)
8. sync_metadata (init-database.js + kevService duplicate)
9. ticket_templates (init-database.js)
10. ticket_vulnerabilities (init-database.js)
11. tickets (init-database.js)
12. user_preferences (init-database.js)
13. users (init-database.js)
14. vendor_daily_totals (init-database.js)
15. vulnerabilities (init-database.js)
16. vulnerabilities_current (init-database.js)
17. vulnerability_daily_totals (init-database.js)
18. vulnerability_imports (init-database.js)
19. vulnerability_snapshots (init-database.js)
20. vulnerability_staging (init-database.js)
21. vulnerability_templates (init-database.js)

#### SQLite Recovery Artifact (1)

22. **lost_and_found** ⚠️ INVESTIGATE
    - **Row Count**: 81,805 rows (verified via Docker exec)
    - **Schema**: `rootpgno, pgno, nfield, id, c0-c25` (generic recovery columns)
    - **Purpose**: SQLite recovery table from past corruption event
    - **Action Needed**: Investigate contents before DROP decision

### Index Count Analysis

| Source | Index Count | Status |
|--------|-------------|--------|
| `init-database.js:459` message | 37 indexes | ❌ WRONG |
| `init-database.js` actual code | 49 indexes | ⚠️ PARTIAL (base schema only) |
| Production database | **68 indexes** | ✅ ACTUAL |

**Missing 19 indexes** come from:
- Migration 007: 3 indexes (cisco_fixed_versions)
- Migration 012: 6 indexes (audit_logs)
- Service initialization: ~10 indexes (Cisco/Palo Alto/KEV tables)

### Production-Only Columns (Not in init-database.js)

These columns were added via ALTER TABLE migrations and are NOT in init-database.js schema:

#### `tickets` table (from migrations 004, 005, 007, 009, 010, 011)
- `deleted INTEGER DEFAULT 0` (soft delete flag)
- `deleted_at TEXT` (soft delete timestamp)
- `job_type TEXT DEFAULT 'Upgrade'` (work categorization)
- `tracking_number TEXT` (shipment tracking)
- `software_versions TEXT` (installed versions)
- `mitigation_details TEXT` (remediation notes)
- `shipping_line1`, `shipping_line2`, `shipping_city`, `shipping_state`, `shipping_zip` (structured addresses)
- `return_line1`, `return_line2`, `return_city`, `return_state`, `return_zip` (return addresses)
- `outbound_tracking TEXT` (outbound shipment)
- `return_tracking TEXT` (return shipment)
- `deletion_reason TEXT` (audit trail for deletions - HEX-248)
- `deleted_by TEXT` (user who deleted - HEX-248)
- `site_address TEXT` (denormalized site address)
- `return_address TEXT` (denormalized return address)
- `installed_versions TEXT` (pre-upgrade versions)
- `device_status TEXT` (device state tracking)

#### `vulnerabilities` table (from migrations 005, 006)
- `is_fixed INTEGER DEFAULT 0` (has vendor fix available)
- `fixed_cisco_versions TEXT` (Cisco fix versions - JSON)
- `fixed_cisco_url TEXT` (Cisco advisory URL)
- `cisco_synced_at DATETIME` (last Cisco sync)
- `fixed_palo_versions TEXT` (Palo Alto fix versions - JSON)
- `fixed_palo_url TEXT` (Palo Alto advisory URL)
- `palo_synced_at DATETIME` (last Palo Alto sync)

#### `vulnerabilities_current` table (from migration 006)
- `is_fix_available INTEGER DEFAULT 0` (has vendor fix)

#### `sync_metadata` table (from migration 015)
- `next_sync_time TEXT` (scheduled next sync - HEX-279)

### Production-Only Indexes (Not in init-database.js)

#### Tickets Table Indexes (from migrations)
- `idx_tickets_xt_unique_active` - UNIQUE INDEX WHERE deleted = 0 (replaced UNIQUE constraint)
- `idx_tickets_deleted` - soft delete filtering
- `idx_tickets_xt_number` - XT number lookups (duplicate of idx_tickets_xt)
- `idx_tickets_job_type` - job type filtering

#### Vulnerabilities Table Indexes (from migrations)
- `idx_vulnerabilities_is_fixed` - partial index WHERE is_fixed = 1
- `idx_vulnerabilities_current_fix_available` - partial index WHERE is_fix_available = 1

---

## Codebase Integration Points

### Schema-Dependent Services

#### Services Reading from Runtime-Created Tables

**ciscoAdvisoryService.js**:
- Reads: `cisco_advisories` (all CVE advisories)
- Reads: `cisco_fixed_versions` (normalized OS-specific fixes)
- Writes: Both tables during sync operations
- **Impact**: Service will fail if tables don't exist

**paloAltoService.js**:
- Reads: `palo_alto_advisories` (all PAN-OS advisories)
- Writes: Advisory data during sync operations
- **Impact**: Service will fail if table doesn't exist

**kevService.js**:
- Reads: `kev_status` (all CISA KEV entries)
- Reads: `sync_metadata` (sync status and scheduling)
- Writes: Both tables during sync operations
- **Impact**: Background sync will fail if tables don't exist

**LoggingService.js** (from HEX-254):
- Reads: `audit_log_config` (encryption key, retention policy)
- Writes: `audit_logs` (encrypted audit entries)
- Initializes: Encryption key on first startup
- **Impact**: ALL application logging fails if tables don't exist

#### Controllers Reading from Runtime Tables

**auditLogController.js**:
- Endpoint: `/api/audit-logs` (fetch paginated logs)
- Reads: `audit_logs` with decryption
- **Impact**: Admin audit viewer fails

**vulnerabilityController.js**:
- Cisco advisory enrichment: Reads `cisco_advisories`, `cisco_fixed_versions`
- Palo Alto enrichment: Reads `palo_alto_advisories`
- KEV correlation: Reads `kev_status`
- **Impact**: Vulnerability cards missing vendor fix data

### Frontend Components Reading Vendor Data

**vulnerability-details-modal.js**:
- Displays Cisco fixed versions by OS family
- Displays Palo Alto fixed versions
- Shows KEV badge if CVE in CISA catalog
- **Impact**: Modal shows incomplete data if tables missing

**vulnerability-data.js**:
- Enriches vulnerability records with vendor fix availability
- **Impact**: "Fix Available" badge missing

**location-details-modal.js**:
- Shows vendor-specific vulnerability counts
- **Impact**: Vendor breakdown missing

---

## lost_and_found Table Investigation

### Current State

**Table**: `lost_and_found`
**Row Count**: 81,805 rows (verified via Docker exec)
**Schema**: Generic SQLite recovery structure

```sql
CREATE TABLE lost_and_found(
  rootpgno INTEGER,
  pgno INTEGER,
  nfield INTEGER,
  id INTEGER,
  c0, c1, c2, c3, c4, c5, c6, c7, c8, c9,
  c10, c11, c12, c13, c14, c15, c16, c17, c18, c19,
  c20, c21, c22, c23, c24, c25
);
```

### Investigation Questions

1. **When was this table created?** (Check audit_logs for corruption events)
2. **What data is in c0-c25 columns?** (Sample 10 rows to identify data structure)
3. **Was data successfully recovered?** (Cross-reference with application logs)
4. **Is this table referenced anywhere?** (Grep codebase for "lost_and_found")
5. **Is the data still needed?** (Forensic value vs cleanup)

### Investigation Plan

```bash
# 1. Sample data to identify structure
docker exec hextrackr sqlite3 /app/data/hextrackr.db \
  "SELECT * FROM lost_and_found LIMIT 10;"

# 2. Check for codebase references
grep -r "lost_and_found" /Volumes/DATA/GitHub/HexTrackr/

# 3. Check audit_logs for corruption events (if audit logging was enabled during event)
docker exec hextrackr sqlite3 /app/data/hextrackr.db \
  "SELECT * FROM audit_logs WHERE category LIKE '%error%' OR category LIKE '%corruption%' LIMIT 20;"

# 4. Export for forensics before cleanup
docker exec hextrackr sqlite3 /app/data/hextrackr.db \
  ".mode csv" \
  ".output /tmp/lost_and_found_backup.csv" \
  "SELECT * FROM lost_and_found;" \
  ".quit"
```

### Cleanup Decision Matrix

| Data State | Action |
|------------|--------|
| Data successfully recovered | DROP TABLE (safe to remove) |
| Data is duplicate of existing records | DROP TABLE (redundant) |
| Data is unrecoverable/corrupted | DROP TABLE (no value) |
| Data is unique and critical | KEEP TABLE (forensic value) |
| Unknown/investigation incomplete | KEEP TABLE (safety first) |

---

## Schema Consolidation Implications

### Tables to Add to v1.1.0 Baseline (5 tables)

1. **cisco_advisories** (from ciscoAdvisoryService)
2. **palo_alto_advisories** (from paloAltoService)
3. **cisco_fixed_versions** (from Migration 007)
4. **audit_logs** (from Migration 012)
5. **audit_log_config** (from Migration 012)

### Tables Already in Baseline (16 tables)

All tables in current `init-database.js` remain unchanged.

### Service Methods to Remove

**ciscoAdvisoryService.js:60-100** - `initializeTables()`
- CREATE TABLE cisco_advisories
- CREATE INDEX idx_cisco_advisories_cve
- CREATE INDEX idx_cisco_advisories_synced
- CREATE INDEX idx_vulnerabilities_is_fixed

**paloAltoService.js:56-98** - `initializeTables()`
- CREATE TABLE palo_alto_advisories
- CREATE INDEX idx_palo_advisories_cve
- CREATE INDEX idx_palo_advisories_synced
- CREATE INDEX idx_vulnerabilities_is_fixed (duplicate)

**kevService.js:44-96** - `initializeTables()`
- Note: kev_status and sync_metadata already in init-database.js
- Safe to remove entirely (redundant)

### Migrations to Archive (2 scripts)

**007-normalize-cisco-fixed-versions.sql** → Archive to `migrations/archive/pre-v1.1.0/`
- Reason: cisco_fixed_versions now in baseline
- Data migration: NOT needed (fresh installs won't have old data)

**012-create-audit-logs.sql** → Archive to `migrations/archive/pre-v1.1.0/`
- Reason: audit_logs and audit_log_config now in baseline
- Initialization INSERT: Move to init-database-v1.1.0.js

### Columns to Add to init-database-v1.1.0.js

All production-only columns from migrations must be added to baseline schema:

**tickets table**: Add 18 columns (deleted, deleted_at, job_type, etc.)
**vulnerabilities table**: Add 6 columns (is_fixed, fixed_cisco_versions, etc.)
**vulnerabilities_current table**: Add 1 column (is_fix_available)
**sync_metadata table**: Add 1 column (next_sync_time)

### Indexes to Add to init-database-v1.1.0.js

Add missing 19 indexes:
- Migration 007 indexes (3)
- Migration 012 indexes (6)
- Service initialization indexes (10)

**Total indexes in v1.1.0**: 68 (matching production)

---

## Backward Compatibility Analysis

### Fresh Install Scenario

**Before (v1.0.x)**:
1. Run `init-database.js` → 16 tables
2. Start application → Services create 3 tables
3. Migrations run → 2 more tables
4. **Result**: 21 tables (inconsistent initialization)

**After (v1.1.0)**:
1. Run `init-database-v1.1.0.js` → 21 tables
2. Start application → Services detect existing tables (no-op)
3. Migrations skipped → Tables already in baseline
4. **Result**: 21 tables (single initialization point)

### Upgrade Scenario (v1.0.x → v1.1.0)

**Existing Database State**:
- All 21 tables already exist from v1.0.x runtime initialization
- Migrations 007 and 012 already ran
- Services already created tables at startup

**v1.1.0 Upgrade Behavior**:
1. `init-database-v1.1.0.js` NOT run (database already exists)
2. Services call removed `initializeTables()` → ERROR if not handled
3. **Critical**: Must add version detection to prevent service errors

**Required Safety Check**:
```javascript
// init-database-v1.1.0.js
async function initializeDatabase() {
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database(dbPath, async (err) => {
      if (err) {
        reject(err);
        return;
      }

      // SAFETY: Check if database already initialized
      db.get("SELECT COUNT(*) as count FROM sqlite_master WHERE type='table' AND name='users'", (err, row) => {
        if (err) {
          reject(err);
          return;
        }

        if (row.count > 0) {
          console.log("Database already initialized (v1.0.x → v1.1.0 upgrade detected)");
          console.log("Skipping schema creation to prevent data loss");
          resolve();
          return;
        }

        // Fresh install - proceed with table creation
        createTables(db)
          .then(() => seedInitialData(db))
          .then(() => resolve())
          .catch(reject);
      });
    });
  });
}
```

### Service Refactoring Strategy

**Option 1: Silent No-Op** (Recommended)
```javascript
// ciscoAdvisoryService.js (AFTER consolidation)
constructor(db, preferencesService) {
  this.db = db;
  this.preferencesService = preferencesService;
  // Remove: this.initializeTables();
  // Tables guaranteed to exist in v1.1.0+
}
```

**Option 2: Version Detection**
```javascript
constructor(db, preferencesService) {
  this.db = db;
  this.preferencesService = preferencesService;
  // Check if running on v1.0.x (for backward compatibility)
  const version = this.getAppVersion(); // Read from package.json
  if (version.startsWith('1.0.')) {
    this.initializeTables(); // Legacy support
  }
  // v1.1.0+ tables already exist in baseline
}
```

**Recommendation**: Option 1 (Silent No-Op) because:
- Simpler code
- v1.0.x → v1.1.0 upgrade guaranteed to have tables (migrations already ran)
- No backward compatibility needed (forward upgrade only)

---

## Files Modified Summary

### New Files (2)
- `/app/public/scripts/init-database-v1.1.0.js` - Consolidated 21-table schema
- `/docs/SCHEMA_EVOLUTION.md` - Historical schema progression

### Modified Files (5)
- `/app/services/ciscoAdvisoryService.js` - Remove initializeTables() method
- `/app/services/paloAltoService.js` - Remove initializeTables() method
- `/app/services/kevService.js` - Remove initializeTables() method (redundant)
- `/app/public/docs-source/architecture/data-model.md` - Add missing 5 tables
- `/app/public/scripts/init-database.js` - Rename to init-database-v1.0.x-legacy.js

### Archived Files (2)
- `migrations/007-normalize-cisco-fixed-versions.sql` → `migrations/archive/pre-v1.1.0/`
- `migrations/012-create-audit-logs.sql` → `migrations/archive/pre-v1.1.0/`

---

## Testing Requirements

### Test 1: Fresh Installation

**Purpose**: Verify all 21 tables created from single script

**Steps**:
```bash
# 1. Clean Docker volume
docker-compose down
docker volume rm hextrackr-database

# 2. Fresh install with v1.1.0
docker-compose up -d

# 3. Verify table count
docker exec hextrackr sqlite3 /app/data/hextrackr.db \
  "SELECT COUNT(*) FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%';"
# Expected: 22 (21 application + 1 lost_and_found)

# 4. Verify index count
docker exec hextrackr sqlite3 /app/data/hextrackr.db \
  "SELECT COUNT(*) FROM sqlite_master WHERE type='index' AND name NOT LIKE 'sqlite_%';"
# Expected: 68

# 5. Check application startup logs
docker logs hextrackr --tail 50
# Expected: No "CREATE TABLE" statements from services
```

### Test 2: Upgrade Path (v1.0.x → v1.1.0)

**Purpose**: Verify existing databases work without data loss

**Steps**:
```bash
# 1. Baseline data collection
docker exec hextrackr sqlite3 /app/data/hextrackr.db "SELECT COUNT(*) FROM tickets;" > /tmp/before_tickets.txt
docker exec hextrackr sqlite3 /app/data/hextrackr.db "SELECT COUNT(*) FROM vulnerabilities_current;" > /tmp/before_vulns.txt

# 2. Upgrade to v1.1.0
docker-compose down
git checkout feature/hex-324-consolidation
docker-compose up -d

# 3. Verify data integrity
docker exec hextrackr sqlite3 /app/data/hextrackr.db "SELECT COUNT(*) FROM tickets;" > /tmp/after_tickets.txt
docker exec hextrackr sqlite3 /app/data/hextrackr.db "SELECT COUNT(*) FROM vulnerabilities_current;" > /tmp/after_vulns.txt
diff /tmp/before_tickets.txt /tmp/after_tickets.txt  # Expected: No differences
diff /tmp/before_vulns.txt /tmp/after_vulns.txt    # Expected: No differences

# 4. Check for schema errors in logs
docker logs hextrackr 2>&1 | grep -i "error"
# Expected: No schema-related errors
```

### Test 3: Backup and Restore

**Purpose**: Verify backup/restore creates complete schema

**Steps**:
```bash
# 1. Create backup
npm run db:backup

# 2. Destroy database
docker volume rm hextrackr-database
docker-compose up -d

# 3. Restore from backup
npm run db:restore -- backups/hextrackr-backup-YYYY-MM-DD.db

# 4. Verify tables
docker exec hextrackr sqlite3 /app/data/hextrackr.db \
  "SELECT name FROM sqlite_master WHERE type='table' ORDER BY name;"
# Expected: All 22 tables present
```

---

## Research Findings Summary

### Critical Discoveries

1. **Table Count Mismatch**: Documentation claims 15 tables, production has 22
2. **Index Count Mismatch**: Documentation claims 37 indexes, production has 68
3. **Three Initialization Pathways**: init-database.js + service constructors + migrations
4. **Service Duplication**: KEV service creates tables already in init-database.js
5. **Production-Only Columns**: 26 columns added via migrations not in init-database.js
6. **lost_and_found Mystery**: 81,805 rows in SQLite recovery table (needs investigation)

### Consolidation Benefits

1. **Single Source of Truth**: All 21 tables in one initialization script
2. **Simplified Onboarding**: Developers read one file, not three pathways
3. **Documentation Accuracy**: Counts match reality (21 tables, 68 indexes)
4. **Service Simplification**: Remove redundant initializeTables() methods
5. **Clear Migration Path**: v1.1.0 = baseline, v1.1.x = incremental

### Risks Mitigated

1. **Data Loss**: IF NOT EXISTS prevents duplicate creation
2. **Schema Drift**: Version detection prevents init-database.js reruns
3. **Service Failures**: Tables guaranteed to exist in v1.1.0+
4. **Migration Confusion**: Clear archive documentation

### Next Steps (PLAN.md)

1. Create consolidated init-database-v1.1.0.js with production schema
2. Remove service initializeTables() methods
3. Archive migrations 007 and 012
4. Update documentation (data-model.md, success messages)
5. Test fresh install and upgrade paths
6. Investigate and resolve lost_and_found table
