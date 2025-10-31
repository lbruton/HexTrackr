# HEX-324 PLAN: Schema Consolidation Implementation

## HOW - Implementation Strategy

### Overview

This plan implements the v1.1.0 schema consolidation by:
1. Creating a consolidated `init-database-v1.1.0.js` with production-verified schema
2. Removing service-level `initializeTables()` methods
3. Archiving pre-v1.1.0 migrations with clear documentation
4. Updating documentation to reflect 21-table reality
5. Testing fresh install and upgrade paths

**Estimated Effort**: 4-6 hours
**Risk Level**: Medium (backward compatibility critical)
**Reversibility**: High (Git revert + Docker image rollback)

---

## Phase 1: Schema Extraction and Consolidation

**Goal**: Create init-database-v1.1.0.js with complete production schema
**Duration**: 1 hour
**Files Modified**: 1 new file

### Step 1.1: Export Production Schema

**Verification Command**:
```bash
# Verify current production table count
docker exec hextrackr sqlite3 /app/data/hextrackr.db \
  "SELECT COUNT(*) FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%';"
# Expected: 22 (21 application + 1 lost_and_found)

# Export complete schema
docker exec hextrackr sqlite3 /app/data/hextrackr.db ".schema" > /tmp/production-schema-$(date +%Y%m%d).sql

# Export table list for verification
docker exec hextrackr sqlite3 /app/data/hextrackr.db \
  "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name;" \
  > /tmp/production-tables-$(date +%Y%m%d).txt
```

**Deliverable**: `/tmp/production-schema-YYYYMMDD.sql` (timestamp for audit trail)

### Step 1.2: Create init-database-v1.1.0.js

**File**: `/app/public/scripts/init-database-v1.1.0.js`

**Template Structure**:
```javascript
/* eslint-env node */
/* global require, console, __dirname */

const sqlite3 = require("sqlite3").verbose();
const path = require("path");
const argon2 = require("argon2");

const dbPath = path.join(__dirname, "..", "..", "data", "hextrackr.db");

/**
 * Initialize database schema for v1.1.0 baseline
 * @description Consolidated schema including all runtime tables from v1.0.x migrations
 * @returns {Promise<void>}
 */
async function initializeDatabase() {
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database(dbPath, async (err) => {
      if (err) {
        console.error("Error opening database:", err.message);
        reject(err);
        return;
      }
      console.log("Connected to SQLite database");

      try {
        // SAFETY CHECK: Detect existing database (v1.0.x → v1.1.0 upgrade)
        const existingTables = await checkExistingSchema(db);
        if (existingTables) {
          console.log("═══════════════════════════════════════════════════════");
          console.log("EXISTING DATABASE DETECTED (v1.0.x → v1.1.0 upgrade)");
          console.log("═══════════════════════════════════════════════════════");
          console.log("Schema already initialized - skipping table creation");
          console.log("This is normal for database upgrades (no action needed)");
          console.log("═══════════════════════════════════════════════════════");
          db.close();
          resolve();
          return;
        }

        // Fresh installation - create complete schema
        await createTables(db);
        await seedInitialData(db);

        db.close((closeErr) => {
          if (closeErr) {
            console.error("Error closing database:", closeErr.message);
            reject(closeErr);
          } else {
            console.log("Database connection closed");
            resolve();
          }
        });
      } catch (error) {
        console.error("Error during database initialization:", error);
        db.close();
        reject(error);
      }
    });
  });
}

/**
 * Check if database already has existing schema
 * @param {sqlite3.Database} db - Database connection
 * @returns {Promise<boolean>} True if tables exist, false for fresh install
 */
function checkExistingSchema(db) {
  return new Promise((resolve, reject) => {
    db.get(
      "SELECT COUNT(*) as count FROM sqlite_master WHERE type='table' AND name='users'",
      (err, row) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(row.count > 0);
      }
    );
  });
}

/**
 * Create all database tables and indexes for v1.1.0 baseline
 * @param {sqlite3.Database} db - Database connection
 * @returns {Promise<void>}
 */
function createTables(db) {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      // Enable foreign keys and configure journal mode
      db.run("PRAGMA foreign_keys = ON");
      db.run("PRAGMA journal_mode = WAL");
      db.run("PRAGMA synchronous = NORMAL");

      // CREATE TABLE statements for all 21 application tables
      // (Schema extracted from production database - see RESEARCH.md)

      // 1-16: Base tables from init-database.js (existing)
      // 17: cisco_advisories (from ciscoAdvisoryService)
      // 18: palo_alto_advisories (from paloAltoService)
      // 19: cisco_fixed_versions (from Migration 007)
      // 20: audit_logs (from Migration 012)
      // 21: audit_log_config (from Migration 012)

      // CREATE INDEX statements for all 68 indexes
      // (Complete production index set)

      // Initialize audit_log_config singleton
      db.run(`INSERT OR IGNORE INTO audit_log_config (id, retention_days) VALUES (1, 30)`);

      // Wait for last index creation before resolving
      db.run("CREATE INDEX IF NOT EXISTS idx_audit_logs_category_timestamp ON audit_logs(category, timestamp)", (err) => {
        if (err) {
          console.error("Error creating indexes:", err.message);
          reject(err);
          return;
        }

        console.log("");
        console.log("═══════════════════════════════════════════════════════");
        console.log("DATABASE INITIALIZED SUCCESSFULLY - v1.1.0 BASELINE");
        console.log("═══════════════════════════════════════════════════════");
        console.log("Schema Version: v1.1.0 (consolidated)");
        console.log("Tables Created: 21 application tables");
        console.log("Indexes Created: 68 performance indexes");
        console.log("Triggers Created: 1 (user_preferences_updated_at)");
        console.log("═══════════════════════════════════════════════════════");
        console.log("");
        console.log("Table Breakdown:");
        console.log("  Core Business: tickets, ticket_templates, ticket_vulnerabilities");
        console.log("  Vulnerabilities: vulnerabilities, vulnerabilities_current, vulnerability_snapshots,");
        console.log("                   vulnerability_staging, vulnerability_daily_totals, vulnerability_imports,");
        console.log("                   vulnerability_templates, vendor_daily_totals");
        console.log("  Vendor Intelligence: cisco_advisories, cisco_fixed_versions, palo_alto_advisories");
        console.log("  CISA Integration: kev_status, sync_metadata");
        console.log("  Authentication: users, user_preferences");
        console.log("  Templates: email_templates, ticket_templates, vulnerability_templates");
        console.log("  Audit & Security: audit_logs, audit_log_config");
        console.log("═══════════════════════════════════════════════════════");
        console.log("");

        resolve();
      });
    });
  });
}

/**
 * Seed initial admin user and default data
 * @param {sqlite3.Database} db - Database connection
 * @returns {Promise<void>}
 */
async function seedInitialData(db) {
  // (Existing seedInitialData logic from init-database.js)
  // No changes needed
}

// Execute database initialization
initializeDatabase()
  .then(() => {
    console.log("Database initialization completed successfully");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Database initialization failed:", error);
    process.exit(1);
  });
```

**Schema Source Priority**:
1. **Production schema export** (ground truth)
2. **Migration 007** (cisco_fixed_versions table + indexes)
3. **Migration 012** (audit_logs tables + indexes)
4. **Service schemas** (cisco_advisories, palo_alto_advisories)
5. **Production-only columns** (from ALTER TABLE migrations)

**Critical Columns to Add**:
- `tickets` table: Add 18 production-only columns (deleted, deleted_at, job_type, etc.)
- `vulnerabilities` table: Add 6 vendor fix columns (is_fixed, fixed_cisco_versions, etc.)
- `vulnerabilities_current` table: Add is_fix_available column
- `sync_metadata` table: Add next_sync_time column

**Critical Indexes to Add**:
- Migration 007: 3 cisco_fixed_versions indexes
- Migration 012: 6 audit_logs indexes
- Service initialization: 10 vendor table indexes
- Production-only: 19 additional indexes (total 68)

### Step 1.3: Version Detection Logic

**Safety Check** (lines 25-45):
```javascript
const existingTables = await checkExistingSchema(db);
if (existingTables) {
  console.log("EXISTING DATABASE DETECTED - Skipping schema creation");
  resolve();
  return;
}
```

**Rationale**:
- Prevents accidental schema rewrites on existing databases
- Distinguishes fresh install from v1.0.x → v1.1.0 upgrade
- Upgrade path: All tables already exist from runtime initialization
- Fresh install path: Creates complete 21-table schema

---

## Phase 2: Service Refactoring

**Goal**: Remove redundant initializeTables() methods from services
**Duration**: 1 hour
**Files Modified**: 3 service files

### Step 2.1: Remove ciscoAdvisoryService.initializeTables()

**File**: `/app/services/ciscoAdvisoryService.js`

**Change 1: Constructor** (lines 39-61):
```javascript
// BEFORE
constructor(db, preferencesService) {
    this.db = db;
    this.preferencesService = preferencesService;
    this.ciscoTokenUrl = "https://id.cisco.com/oauth2/default/v1/token";
    this.ciscoPsirtBaseUrl = "https://apix.cisco.com/security/advisories/v2";
    this.lastSyncTime = null;
    this.syncInProgress = false;
    this.fetch = global.fetch || this._initHttpsClient();

    // Initialize database tables if they don't exist
    this.initializeTables();  // ← REMOVE THIS LINE
}

// AFTER
constructor(db, preferencesService) {
    this.db = db;
    this.preferencesService = preferencesService;
    this.ciscoTokenUrl = "https://id.cisco.com/oauth2/default/v1/token";
    this.ciscoPsirtBaseUrl = "https://apix.cisco.com/security/advisories/v2";
    this.lastSyncTime = null;
    this.syncInProgress = false;
    this.fetch = global.fetch || this._initHttpsClient();

    // Tables guaranteed to exist in v1.1.0+ baseline
    // (cisco_advisories, cisco_fixed_versions created by init-database-v1.1.0.js)
}
```

**Change 2: Remove initializeTables() Method** (lines 63-106):
```javascript
// DELETE ENTIRE METHOD (lines 63-106)
/**
 * Initialize Cisco advisory database tables
 * @async
 */
async initializeTables() {
    // ... (44 lines of table creation code) ...
}
```

**Verification**:
```bash
grep -n "initializeTables" /Volumes/DATA/GitHub/HexTrackr/app/services/ciscoAdvisoryService.js
# Expected: No matches
```

### Step 2.2: Remove paloAltoService.initializeTables()

**File**: `/app/services/paloAltoService.js`

**Change 1: Constructor** (lines 36-57):
```javascript
// BEFORE
constructor(db, preferencesService) {
    this.db = db;
    this.preferencesService = preferencesService;
    this.paloApiBaseUrl = "https://security.paloaltonetworks.com/json";
    this.lastSyncTime = null;
    this.syncInProgress = false;
    this.fetch = global.fetch || this._initHttpsClient();

    // Initialize database tables if they don't exist
    this.initializeTables();  // ← REMOVE THIS LINE
}

// AFTER
constructor(db, preferencesService) {
    this.db = db;
    this.preferencesService = preferencesService;
    this.paloApiBaseUrl = "https://security.paloaltonetworks.com/json";
    this.lastSyncTime = null;
    this.syncInProgress = false;
    this.fetch = global.fetch || this._initHttpsClient();

    // Tables guaranteed to exist in v1.1.0+ baseline
    // (palo_alto_advisories created by init-database-v1.1.0.js)
}
```

**Change 2: Remove initializeTables() Method** (lines 59-99):
```javascript
// DELETE ENTIRE METHOD
```

### Step 2.3: Remove kevService.initializeTables()

**File**: `/app/services/kevService.js`

**Special Case**: This service creates `kev_status` and `sync_metadata`, both of which are ALREADY in `init-database.js` (lines 293-316). This is redundant initialization.

**Change 1: Constructor** (lines 29-45):
```javascript
// BEFORE
constructor(db) {
    this.db = db;
    this.kevApiUrl = "https://www.cisa.gov/sites/default/files/feeds/known_exploited_vulnerabilities.json";
    this.lastSyncTime = null;
    this.syncInProgress = false;
    this.fetch = global.fetch || this._initHttpsClient();

    // Initialize database tables if they don't exist
    this.initializeTables();  // ← REMOVE THIS LINE
}

// AFTER
constructor(db) {
    this.db = db;
    this.kevApiUrl = "https://www.cisa.gov/sites/default/files/feeds/known_exploited_vulnerabilities.json";
    this.lastSyncTime = null;
    this.syncInProgress = false;
    this.fetch = global.fetch || this._initHttpsClient();

    // Tables guaranteed to exist in v1.1.0+ baseline
    // (kev_status, sync_metadata created by init-database-v1.1.0.js)
}
```

**Change 2: Remove initializeTables() Method** (lines 47-96):
```javascript
// DELETE ENTIRE METHOD
```

**Note**: kevService duplication was harmless due to IF NOT EXISTS, but removal simplifies service and eliminates 50 lines of redundant code.

### Step 2.4: Update Service Imports (If Needed)

**Verification**: Check if any services import initializeTables from others:
```bash
grep -r "initializeTables" /Volumes/DATA/GitHub/HexTrackr/app/ --include="*.js"
# Expected: No matches after refactoring
```

---

## Phase 3: Migration Script Archival

**Goal**: Archive pre-v1.1.0 migrations with clear documentation
**Duration**: 30 minutes
**Files Modified**: 2 migration files moved, 1 README created

### Step 3.1: Create Archive Directory

```bash
mkdir -p /Volumes/DATA/GitHub/HexTrackr/app/public/scripts/migrations/archive/pre-v1.1.0
```

### Step 3.2: Move Migration Scripts

```bash
# Move Migration 007
mv /Volumes/DATA/GitHub/HexTrackr/app/public/scripts/migrations/007-normalize-cisco-fixed-versions.sql \
   /Volumes/DATA/GitHub/HexTrackr/app/public/scripts/migrations/archive/pre-v1.1.0/

# Move Migration 012
mv /Volumes/DATA/GitHub/HexTrackr/app/public/scripts/migrations/012-create-audit-logs.sql \
   /Volumes/DATA/GitHub/HexTrackr/app/public/scripts/migrations/archive/pre-v1.1.0/
```

### Step 3.3: Create Archive README

**File**: `/app/public/scripts/migrations/archive/pre-v1.1.0/README.md`

```markdown
# Pre-v1.1.0 Migration Archive

This directory contains migration scripts that were **consolidated into the v1.1.0 baseline** and are **no longer needed for fresh installations**.

## Archived Migrations

### 007-normalize-cisco-fixed-versions.sql
- **Issue**: HEX-287 - Fix data corruption from multi-OS-family CVEs
- **Version**: v1.0.79
- **Date**: 2025-10-18
- **Purpose**: Create `cisco_fixed_versions` table (3NF normalization)
- **Consolidation**: Table now created by `init-database-v1.1.0.js` (line XXX)
- **Status**: Obsolete for v1.1.0+ fresh installs

**When to Reference**:
- Understanding historical schema evolution
- Debugging v1.0.x databases (if rollback needed)
- Investigating cisco_fixed_versions table design decisions

**DO NOT RUN** on fresh v1.1.0+ installations (table already in baseline).

---

### 012-create-audit-logs.sql
- **Issue**: HEX-254 - Unified logging system with audit trail
- **Version**: v1.0.67+
- **Date**: 2025-10-16
- **Purpose**: Create `audit_logs` and `audit_log_config` tables
- **Consolidation**: Tables now created by `init-database-v1.1.0.js` (line YYY)
- **Status**: Obsolete for v1.1.0+ fresh installs

**When to Reference**:
- Understanding audit log encryption architecture
- Reviewing retention policy design
- Debugging v1.0.x audit log issues

**DO NOT RUN** on fresh v1.1.0+ installations (tables already in baseline).

---

## Version Consolidation Strategy

HexTrackr follows a **periodic consolidation pattern**:

| Version | Migration Strategy |
|---------|-------------------|
| v1.0.0 - v1.0.99 | Incremental migrations (001-015) |
| v1.1.0 | **Consolidation Point** - All migrations → baseline |
| v1.1.1 - v1.1.99 | Incremental migrations (016+) |
| v1.2.0 | **Next Consolidation** - All v1.1.x migrations → baseline |

**Benefits**:
- Fresh installs get complete schema from one script
- Existing databases upgrade via incremental migrations
- Migration history preserved for forensics
- Developer onboarding simplified (one file to read)

**Post-v1.1.0 Migration Pattern**:
- New tables/columns → Create `016-add-feature.sql`
- No need to update `init-database-v1.1.0.js` until v1.2.0
- Migrations run automatically on application startup

---

## Historical Context

**v1.0.x Initialization Fragmentation**:
- Base schema: `init-database.js` (16 tables)
- Runtime tables: `ciscoAdvisoryService`, `paloAltoService` (3 tables)
- Migrations: 007, 012 (2 more tables)
- **Total**: 21 tables via 3 different pathways

**v1.1.0 Consolidation**:
- Single script: `init-database-v1.1.0.js` (21 tables)
- Service refactoring: Remove `initializeTables()` methods
- Clear migration path: Fresh install vs upgrade

**Developer Impact**:
- Before v1.1.0: Must read 3+ files to understand schema
- After v1.1.0: Read one file (`init-database-v1.1.0.js`)

---

## Related Documentation

- **SRPI Documents**: `/docs/srpi/HEX-324/` (SPECIFICATION, RESEARCH, PLAN)
- **Schema Evolution**: `/docs/SCHEMA_EVOLUTION.md`
- **Data Model**: `/app/public/docs-source/architecture/data-model.md`
- **Linear Issue**: [HEX-324](https://linear.app/hextrackr/issue/HEX-324)
```

### Step 3.4: Update Migration Index (If Exists)

**Check for migration index file**:
```bash
ls /Volumes/DATA/GitHub/HexTrackr/app/public/scripts/migrations/README.md
```

If exists, update to note archived migrations.

---

## Phase 4: Documentation Updates

**Goal**: Fix documentation to reflect 21-table reality
**Duration**: 1 hour
**Files Modified**: 3 documentation files

### Step 4.1: Update data-model.md

**File**: `/app/public/docs-source/architecture/data-model.md`

**Changes Required**:

1. **Update table count** (introduction section):
```markdown
# BEFORE
HexTrackr uses 16 core tables organized into X categories...

# AFTER
HexTrackr uses 21 core tables organized into 6 categories (v1.1.0 baseline):

**Core Business** (3 tables):
- tickets, ticket_templates, ticket_vulnerabilities

**Vulnerability Management** (9 tables):
- vulnerabilities, vulnerabilities_current, vulnerability_snapshots
- vulnerability_staging, vulnerability_daily_totals, vulnerability_imports
- vulnerability_templates, vendor_daily_totals

**Vendor Intelligence** (3 tables):
- cisco_advisories, cisco_fixed_versions, palo_alto_advisories

**CISA Integration** (2 tables):
- kev_status, sync_metadata

**Authentication & Preferences** (2 tables):
- users, user_preferences

**Security & Audit** (2 tables):
- audit_logs, audit_log_config
```

2. **Add missing table documentation**:
   - cisco_advisories (schema, purpose, sync frequency)
   - palo_alto_advisories (schema, purpose, sync frequency)
   - cisco_fixed_versions (3NF normalization, foreign key relationship)
   - audit_logs (encryption, retention, query patterns)
   - audit_log_config (singleton pattern, encryption key management)

3. **Update index count**:
```markdown
# BEFORE
Performance is optimized via 37 indexes...

# AFTER
Performance is optimized via 68 indexes (v1.1.0):
- Core vulnerability indexes: 25
- Vendor intelligence indexes: 13
- Ticket management indexes: 10
- Audit log indexes: 6
- User/preference indexes: 4
- Staging/import indexes: 10
```

4. **Add production-only columns** to existing table documentation:
   - tickets: 18 additional columns (deleted, deleted_at, job_type, etc.)
   - vulnerabilities: 6 vendor fix columns
   - vulnerabilities_current: is_fix_available
   - sync_metadata: next_sync_time

**Verification**:
```bash
grep -c "cisco_advisories" /Volumes/DATA/GitHub/HexTrackr/app/public/docs-source/architecture/data-model.md
# Expected: > 0 (table documented)

grep -c "68 indexes" /Volumes/DATA/GitHub/HexTrackr/app/public/docs-source/architecture/data-model.md
# Expected: 1 (count updated)
```

### Step 4.2: Create SCHEMA_EVOLUTION.md

**File**: `/docs/SCHEMA_EVOLUTION.md`

**Content**:
```markdown
# HexTrackr Schema Evolution History

This document tracks the progression of HexTrackr's database schema from v1.0.0 to present, showing consolidation points and migration patterns.

## Version History

### v1.0.0 - v1.0.62: Base Schema (16 tables)

**Initialization**: `init-database.js` (single script)

**Tables**:
1. tickets
2. vulnerability_imports
3. vulnerabilities
4. ticket_vulnerabilities
5. vulnerability_snapshots
6. vulnerabilities_current
7. vulnerability_daily_totals
8. vulnerability_staging
9. email_templates
10. kev_status
11. sync_metadata
12. ticket_templates
13. vulnerability_templates
14. users
15. user_preferences
16. vendor_daily_totals (added in Migration 008)

**Indexes**: 49

---

### v1.0.63: Vendor Intelligence (+ 2 tables)

**Changes**:
- Added `cisco_advisories` table (ciscoAdvisoryService runtime)
- Added `palo_alto_advisories` table (paloAltoService runtime)
- Migration 005: Cisco advisory infrastructure
- Migration 006: Palo Alto advisory infrastructure

**Total Tables**: 18
**Indexes**: 59

---

### v1.0.67: Audit Logging (+ 2 tables)

**Changes**:
- Migration 012: Added `audit_logs` table
- Migration 012: Added `audit_log_config` table
- HEX-254: Unified logging system with encryption

**Total Tables**: 20
**Indexes**: 65

---

### v1.0.79: Cisco Fix Normalization (+ 1 table)

**Changes**:
- Migration 007: Added `cisco_fixed_versions` table
- HEX-287: Fix data corruption from multi-OS-family CVEs
- 3NF normalization of Cisco fix versions

**Total Tables**: 21
**Indexes**: 68

---

### v1.1.0: CONSOLIDATION BASELINE (21 tables)

**Major Change**: All tables consolidated into `init-database-v1.1.0.js`

**Rationale**:
- Eliminate schema drift (3 initialization pathways → 1)
- Documentation accuracy (claimed 15 tables, actually 21)
- Developer onboarding simplification
- Clear migration path for v1.1.x

**Consolidated Tables** (previously runtime-created):
- cisco_advisories (from ciscoAdvisoryService)
- palo_alto_advisories (from paloAltoService)
- cisco_fixed_versions (from Migration 007)
- audit_logs (from Migration 012)
- audit_log_config (from Migration 012)

**Archived Migrations**:
- 007-normalize-cisco-fixed-versions.sql → `archive/pre-v1.1.0/`
- 012-create-audit-logs.sql → `archive/pre-v1.1.0/`

**Service Refactoring**:
- Removed `ciscoAdvisoryService.initializeTables()`
- Removed `paloAltoService.initializeTables()`
- Removed `kevService.initializeTables()` (redundant)

**Total Tables**: 21 (baseline)
**Total Indexes**: 68
**Total Triggers**: 1 (user_preferences_updated_at)

**Linear Issue**: [HEX-324](https://linear.app/hextrackr/issue/HEX-324/consolidate-init-databasejs-with-all-runtime-tables-for-v110-baseline)

---

## Migration Philosophy

HexTrackr follows a **periodic consolidation pattern**:

```
v1.0.0 ──┐
         ├─> Incremental migrations (001-015)
v1.0.99 ──┘

v1.1.0 ───> CONSOLIDATION (all migrations → baseline)

v1.1.1 ──┐
         ├─> Incremental migrations (016+)
v1.1.99 ──┘

v1.2.0 ───> CONSOLIDATION (all v1.1.x migrations → baseline)
```

**Benefits**:
- Fresh installs: Complete schema from one script
- Existing databases: Incremental migration path
- Migration history: Preserved in archive for forensics
- Developer onboarding: Single source of truth

**Post-v1.1.0 Pattern**:
1. New feature requires table/column → Create `016-add-feature.sql`
2. Run migration: `npm run db:migrate`
3. Migration applied automatically on deployment
4. At v1.2.0: Consolidate 016+ migrations into `init-database-v1.2.0.js`

---

## Schema Statistics

| Version | Tables | Indexes | Triggers | Initialization Method |
|---------|--------|---------|----------|-----------------------|
| v1.0.0 | 15 | 37 | 1 | init-database.js |
| v1.0.62 | 16 | 49 | 1 | init-database.js + Migration 008 |
| v1.0.63 | 18 | 59 | 1 | init-database.js + Services |
| v1.0.67 | 20 | 65 | 1 | init-database.js + Services + Migration 012 |
| v1.0.79 | 21 | 68 | 1 | init-database.js + Services + Migrations 007/012 |
| **v1.1.0** | **21** | **68** | **1** | **init-database-v1.1.0.js (consolidated)** |

---

## Future Consolidation Plan

**v1.2.0 Consolidation** (projected):
- Consolidate v1.1.x migrations (016+) into baseline
- Archive v1.1.x migrations to `archive/pre-v1.2.0/`
- Update init script to `init-database-v1.2.0.js`
- Pattern repeats for v1.3.0, v2.0.0, etc.

**Triggers for Consolidation**:
- Major/minor version milestones (v1.1.0, v1.2.0, v2.0.0)
- 10+ migrations accumulated since last consolidation
- Significant architectural refactoring
- Documentation refresh cycles
```

### Step 4.3: Update Success Messages

**File**: `/app/public/scripts/init-database-v1.1.0.js`

**Success message** (replace lines 442-459 equivalent):
```javascript
console.log("");
console.log("═══════════════════════════════════════════════════════");
console.log("DATABASE INITIALIZED SUCCESSFULLY - v1.1.0 BASELINE");
console.log("═══════════════════════════════════════════════════════");
console.log("Schema Version: v1.1.0 (consolidated)");
console.log("Tables Created: 21 application tables");
console.log("Indexes Created: 68 performance indexes");
console.log("Triggers Created: 1 (user_preferences_updated_at)");
console.log("═══════════════════════════════════════════════════════");
```

**Replaces old message**:
```javascript
// OLD (WRONG)
console.log("All 15 tables and 37 indexes created successfully!");

// NEW (CORRECT)
console.log("Tables Created: 21 application tables");
console.log("Indexes Created: 68 performance indexes");
```

---

## Phase 5: Testing Strategy

**Goal**: Verify fresh install and upgrade paths work correctly
**Duration**: 1.5 hours
**Files Modified**: None (testing only)

### Test 1: Fresh Installation (Clean Docker Volume)

**Purpose**: Verify all 21 tables created from single script

**Pre-Test Cleanup**:
```bash
# Stop containers
docker-compose down

# Delete existing database volume
docker volume rm hextrackr-database

# Verify volume removed
docker volume ls | grep hextrackr-database
# Expected: No output
```

**Test Execution**:
```bash
# 1. Start containers (triggers init-database-v1.1.0.js)
docker-compose up -d

# 2. Wait for initialization (monitor logs)
docker logs -f hextrackr

# Expected in logs:
# "DATABASE INITIALIZED SUCCESSFULLY - v1.1.0 BASELINE"
# "Tables Created: 21 application tables"
# "Indexes Created: 68 performance indexes"

# 3. Verify table count
docker exec hextrackr sqlite3 /app/data/hextrackr.db \
  "SELECT COUNT(*) FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%';"
# Expected: 22 (21 application + 1 lost_and_found)

# 4. Verify index count
docker exec hextrackr sqlite3 /app/data/hextrackr.db \
  "SELECT COUNT(*) FROM sqlite_master WHERE type='index' AND name NOT LIKE 'sqlite_%';"
# Expected: 68

# 5. Verify trigger count
docker exec hextrackr sqlite3 /app/data/hextrackr.db \
  "SELECT COUNT(*) FROM sqlite_master WHERE type='trigger';"
# Expected: 1

# 6. List all tables (verification)
docker exec hextrackr sqlite3 /app/data/hextrackr.db \
  "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name;"
# Expected: All 22 tables listed

# 7. Check for service table creation errors
docker logs hextrackr 2>&1 | grep -i "CREATE TABLE"
# Expected: No CREATE TABLE statements from services (only from init script)

# 8. Verify application functionality
curl -k https://dev.hextrackr.com/api/health
# Expected: 200 OK

# 9. Test vendor data endpoints
curl -k https://dev.hextrackr.com/api/cisco/advisories
curl -k https://dev.hextrackr.com/api/paloalto/advisories
curl -k https://dev.hextrackr.com/api/kev/status
# Expected: 200 OK (empty arrays acceptable for fresh DB)

# 10. Test audit logging
curl -k https://dev.hextrackr.com/api/audit-logs
# Expected: 200 OK (requires authentication)
```

**Success Criteria**:
- ✅ 22 tables created (21 application + lost_and_found)
- ✅ 68 indexes created
- ✅ No errors in Docker logs
- ✅ Application starts successfully
- ✅ All API endpoints respond
- ✅ No service-level CREATE TABLE statements

### Test 2: Upgrade Path (v1.0.x → v1.1.0)

**Purpose**: Verify existing databases upgrade without data loss

**Pre-Test Baseline**:
```bash
# 1. Collect baseline metrics
docker exec hextrackr sqlite3 /app/data/hextrackr.db \
  "SELECT
    (SELECT COUNT(*) FROM tickets) as ticket_count,
    (SELECT COUNT(*) FROM vulnerabilities_current) as vuln_count,
    (SELECT COUNT(*) FROM cisco_advisories) as cisco_count,
    (SELECT COUNT(*) FROM palo_alto_advisories) as palo_count,
    (SELECT COUNT(*) FROM audit_logs) as audit_count;" \
  > /tmp/hex-324-before-upgrade.txt

# 2. Export schema for diff
docker exec hextrackr sqlite3 /app/data/hextrackr.db ".schema" > /tmp/hex-324-schema-before.sql
```

**Test Execution**:
```bash
# 1. Stop application
docker-compose down

# 2. Switch to v1.1.0 branch
git checkout feature/hex-324-consolidation

# 3. Start application with v1.1.0 code
docker-compose up -d

# 4. Monitor startup logs
docker logs -f hextrackr

# Expected in logs:
# "EXISTING DATABASE DETECTED (v1.0.x → v1.1.0 upgrade)"
# "Schema already initialized - skipping table creation"

# 5. Collect post-upgrade metrics
docker exec hextrackr sqlite3 /app/data/hextrackr.db \
  "SELECT
    (SELECT COUNT(*) FROM tickets) as ticket_count,
    (SELECT COUNT(*) FROM vulnerabilities_current) as vuln_count,
    (SELECT COUNT(*) FROM cisco_advisories) as cisco_count,
    (SELECT COUNT(*) FROM palo_alto_advisories) as palo_count,
    (SELECT COUNT(*) FROM audit_logs) as audit_count;" \
  > /tmp/hex-324-after-upgrade.txt

# 6. Compare metrics (MUST be identical)
diff /tmp/hex-324-before-upgrade.txt /tmp/hex-324-after-upgrade.txt
# Expected: No differences

# 7. Export post-upgrade schema
docker exec hextrackr sqlite3 /app/data/hextrackr.db ".schema" > /tmp/hex-324-schema-after.sql

# 8. Compare schemas (should be identical)
diff /tmp/hex-324-schema-before.sql /tmp/hex-324-schema-after.sql
# Expected: No differences

# 9. Check for errors
docker logs hextrackr 2>&1 | grep -i "error" | grep -v "404"
# Expected: No schema-related errors

# 10. Test application functionality
curl -k https://dev.hextrackr.com/api/health
# Expected: 200 OK

# 11. Test data integrity
docker exec hextrackr sqlite3 /app/data/hextrackr.db "PRAGMA integrity_check;"
# Expected: ok
```

**Success Criteria**:
- ✅ All row counts identical (before/after)
- ✅ Schema diff is empty (no changes)
- ✅ "EXISTING DATABASE DETECTED" message in logs
- ✅ No errors during startup
- ✅ Application functions normally
- ✅ Database integrity check passes

### Test 3: Backup and Restore

**Purpose**: Verify backup/restore creates complete schema

**Test Execution**:
```bash
# 1. Create backup of v1.1.0 database
npm run db:backup

# 2. Verify backup file created
ls -lh backups/
# Expected: Recent hextrackr-backup-*.db file

# 3. Destroy database
docker-compose down
docker volume rm hextrackr-database

# 4. Start fresh container
docker-compose up -d

# 5. Restore from backup
npm run db:restore -- backups/hextrackr-backup-YYYY-MM-DD-HH-MM-SS.db

# 6. Verify table count
docker exec hextrackr sqlite3 /app/data/hextrackr.db \
  "SELECT COUNT(*) FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%';"
# Expected: 22

# 7. Verify index count
docker exec hextrackr sqlite3 /app/data/hextrackr.db \
  "SELECT COUNT(*) FROM sqlite_master WHERE type='index' AND name NOT LIKE 'sqlite_%';"
# Expected: 68

# 8. Verify data integrity
docker exec hextrackr sqlite3 /app/data/hextrackr.db "PRAGMA integrity_check;"
# Expected: ok

# 9. Test application
curl -k https://dev.hextrackr.com/api/health
# Expected: 200 OK
```

**Success Criteria**:
- ✅ Backup file created successfully
- ✅ Restore completes without errors
- ✅ All tables present after restore
- ✅ All indexes present after restore
- ✅ Data integrity verified
- ✅ Application functions normally

### Test 4: Docker Restart Stability

**Purpose**: Verify schema remains stable across restarts

**Test Execution**:
```bash
# 1. Baseline table count
docker exec hextrackr sqlite3 /app/data/hextrackr.db \
  "SELECT COUNT(*) FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%';" \
  > /tmp/hex-324-tables-before-restart.txt

# 2. Restart Docker service
docker-compose restart hextrackr

# 3. Wait for startup
sleep 10

# 4. Post-restart table count
docker exec hextrackr sqlite3 /app/data/hextrackr.db \
  "SELECT COUNT(*) FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%';" \
  > /tmp/hex-324-tables-after-restart.txt

# 5. Compare (must be identical)
diff /tmp/hex-324-tables-before-restart.txt /tmp/hex-324-tables-after-restart.txt
# Expected: No differences

# 6. Check logs for schema warnings
docker logs hextrackr --since 30s | grep -i "schema\|table\|index"
# Expected: "EXISTING DATABASE DETECTED" message, no CREATE statements

# 7. Verify no duplicate tables/indexes
docker exec hextrackr sqlite3 /app/data/hextrackr.db \
  "SELECT name, COUNT(*) as count FROM sqlite_master WHERE type='table' GROUP BY name HAVING count > 1;"
# Expected: No output (no duplicates)
```

**Success Criteria**:
- ✅ Table count unchanged after restart
- ✅ No schema modification warnings
- ✅ No duplicate tables/indexes
- ✅ Application starts successfully

---

## Phase 6: lost_and_found Investigation

**Goal**: Investigate and resolve mystery table with 81,805 rows
**Duration**: 30 minutes
**Files Modified**: Potentially 1 (DROP statement if safe)

### Step 6.1: Data Sampling

**Investigate Contents**:
```bash
# 1. Sample first 10 rows
docker exec hextrackr sqlite3 /app/data/hextrackr.db \
  "SELECT * FROM lost_and_found LIMIT 10;"

# 2. Check column types
docker exec hextrackr sqlite3 /app/data/hextrackr.db \
  "PRAGMA table_info(lost_and_found);"

# 3. Count non-NULL columns
docker exec hextrackr sqlite3 /app/data/hextrackr.db \
  "SELECT
    COUNT(CASE WHEN c0 IS NOT NULL THEN 1 END) as c0_count,
    COUNT(CASE WHEN c1 IS NOT NULL THEN 1 END) as c1_count,
    COUNT(CASE WHEN c2 IS NOT NULL THEN 1 END) as c2_count,
    COUNT(CASE WHEN c3 IS NOT NULL THEN 1 END) as c3_count
  FROM lost_and_found;"

# 4. Check for patterns in data
docker exec hextrackr sqlite3 /app/data/hextrackr.db \
  "SELECT DISTINCT rootpgno FROM lost_and_found LIMIT 20;"
```

### Step 6.2: Correlation Analysis

**Check for References**:
```bash
# 1. Search codebase for table references
grep -r "lost_and_found" /Volumes/DATA/GitHub/HexTrackr/ --include="*.js" --include="*.sql"
# Expected: No matches (not used in application)

# 2. Check audit logs for corruption events (if available)
docker exec hextrackr sqlite3 /app/data/hextrackr.db \
  "SELECT * FROM audit_logs WHERE category LIKE '%error%' OR category LIKE '%corruption%' LIMIT 20;"

# 3. Check for database integrity issues
docker exec hextrackr sqlite3 /app/data/hextrackr.db "PRAGMA integrity_check;"
# Expected: ok (if "ok", lost_and_found is recovery artifact, not active corruption)
```

### Step 6.3: Backup and Cleanup Decision

**If Investigation Shows**:

**Scenario A: Data Successfully Recovered**
```bash
# Safe to drop - data recovery complete
# 1. Export for forensics
docker exec hextrackr sqlite3 /app/data/hextrackr.db \
  ".mode csv" \
  ".output /tmp/lost_and_found_archive.csv" \
  "SELECT * FROM lost_and_found;" \
  ".quit"

# 2. Backup database before DROP
npm run db:backup

# 3. Drop table
docker exec hextrackr sqlite3 /app/data/hextrackr.db "DROP TABLE lost_and_found;"

# 4. Verify application still works
curl -k https://dev.hextrackr.com/api/health
```

**Scenario B: Data is Duplicate/Redundant**
```bash
# Safe to drop - no unique data
# Follow same steps as Scenario A
```

**Scenario C: Data is Unrecoverable/Corrupted**
```bash
# Safe to drop - no value in keeping
# Follow same steps as Scenario A
```

**Scenario D: Unknown/Investigation Incomplete**
```bash
# KEEP table - safety first
# Document findings in HEX-324
# Revisit in future release
```

### Step 6.4: Documentation

**Update Linear Issue** (HEX-324):
```markdown
## lost_and_found Table Investigation Results

**Date**: YYYY-MM-DD
**Row Count**: 81,805
**Decision**: [DROP | KEEP]

**Findings**:
- [Sample data analysis]
- [Codebase reference check: None found]
- [Corruption event timeline: TBD]
- [Data recovery status: Complete | Incomplete | Unknown]

**Action Taken**:
- [Exported to CSV for forensics]
- [Dropped table (safe)]
OR
- [Kept table for future investigation]

**Recommendation**:
- [For fresh v1.1.0+ installs: Exclude lost_and_found from init script]
- [For existing databases: Monitor table growth, drop if no changes in 30 days]
```

---

## Phase 7: Final Validation

**Goal**: Comprehensive end-to-end verification
**Duration**: 30 minutes

### Validation Checklist

#### Schema Validation ✅
- [ ] Fresh install creates exactly 21 application tables
- [ ] Fresh install creates exactly 68 indexes
- [ ] Existing database upgrade is no-op (no schema changes)
- [ ] Backup/restore creates complete schema
- [ ] Docker restart does not modify schema

#### Service Validation ✅
- [ ] ciscoAdvisoryService starts without errors
- [ ] paloAltoService starts without errors
- [ ] kevService starts without errors
- [ ] No "CREATE TABLE" statements in service logs
- [ ] Vendor data endpoints respond (200 OK)

#### Documentation Validation ✅
- [ ] data-model.md lists all 21 tables
- [ ] data-model.md reports 68 indexes
- [ ] SCHEMA_EVOLUTION.md created with v1.1.0 milestone
- [ ] Success messages report accurate counts
- [ ] Migration archive README created

#### Code Quality ✅
- [ ] No grep matches for "initializeTables" in services
- [ ] ESLint passes (`npm run lint`)
- [ ] No TODO comments left in refactored code
- [ ] JSDoc comments updated (removed initializeTables references)

#### Production Safety ✅
- [ ] Backup created before any testing
- [ ] Rollback plan tested (Docker image revert)
- [ ] Monitoring in place (log analysis)
- [ ] Data integrity verified (PRAGMA integrity_check)

---

## Rollback Plan

**If v1.1.0 Consolidation Fails**:

### Emergency Rollback Steps

1. **Stop v1.1.0 Application**:
```bash
docker-compose down
```

2. **Revert Git Changes**:
```bash
git checkout main  # Or last known-good commit
```

3. **Restore from Backup** (if data corruption):
```bash
npm run db:restore -- backups/hextrackr-backup-YYYY-MM-DD-HH-MM-SS.db
```

4. **Start v1.0.x Application**:
```bash
docker-compose up -d
```

5. **Verify Rollback**:
```bash
curl -k https://dev.hextrackr.com/api/health
docker logs hextrackr --tail 50
```

**Rollback Triggers**:
- Data loss detected (row count mismatch)
- Database corruption (integrity_check fails)
- Application fails to start
- Critical endpoints return 500 errors
- Schema migration errors in logs

**Recovery Time Objective (RTO)**: 5 minutes (Git revert + Docker restart)
**Recovery Point Objective (RPO)**: 0 minutes (backup before consolidation)

---

## Post-Implementation Checklist

### Code Review ✅
- [ ] Self-review all changes against PLAN.md checklist
- [ ] Verify all 7 phases completed
- [ ] Check git diff for unintended changes
- [ ] Ensure no console.log statements left in production code

### Linear Issue Update ✅
- [ ] Update HEX-324 with implementation summary
- [ ] Link to SRPI documents (SPECIFICATION, RESEARCH, PLAN)
- [ ] Mark as "In Review" status
- [ ] Add "Testing Complete" label

### Changelog Entry ✅
- [ ] Create changelog entry for v1.1.0
- [ ] Document schema consolidation as major feature
- [ ] List all 21 tables in release notes
- [ ] Note backward compatibility (upgrade is no-op)

### Deployment Preparation ✅
- [ ] Tag commit: `git tag v1.1.0`
- [ ] Push to dev branch: `git push origin feature/hex-324-consolidation`
- [ ] Create pull request to main (per Git workflow)
- [ ] Deploy to production after validation on dev

---

## Success Metrics

### Primary Metrics ✅
- **Single Source of Truth**: 100% of schema in one file (init-database-v1.1.0.js)
- **Documentation Accuracy**: 0 discrepancies (21 tables, 68 indexes)
- **Zero Data Loss**: 100% row count match (before/after upgrade)
- **Service Simplification**: 150 lines of code removed (initializeTables methods)

### Secondary Metrics ✅
- **Developer Onboarding**: 1 file to read (vs 3+ pathways)
- **Migration Clarity**: 2 migrations archived with documentation
- **Testing Coverage**: 4 test scenarios passed (fresh, upgrade, backup, restart)
- **Production Safety**: 0 errors during upgrade

---

## Timeline

| Phase | Duration | Status |
|-------|----------|--------|
| 1. Schema Extraction | 1 hour | ⏸️ Pending |
| 2. Service Refactoring | 1 hour | ⏸️ Pending |
| 3. Migration Archival | 30 min | ⏸️ Pending |
| 4. Documentation | 1 hour | ⏸️ Pending |
| 5. Testing | 1.5 hours | ⏸️ Pending |
| 6. lost_and_found Investigation | 30 min | ⏸️ Pending |
| 7. Final Validation | 30 min | ⏸️ Pending |
| **Total** | **6 hours** | ⏸️ Not Started |

**Target Completion**: Before v1.1.0 release
**Dependencies**: None (can start immediately)

---

## Related Documentation

- **SPECIFICATION.md**: WHY consolidation is needed
- **RESEARCH.md**: WHAT exists in codebase
- **PLAN.md**: HOW implementation works (this document)
- **Linear Issue**: [HEX-324](https://linear.app/hextrackr/issue/HEX-324)
- **CLAUDE.md**: Project architecture guidelines
- **SRPI_PROCESS.md**: SRPI workflow documentation
