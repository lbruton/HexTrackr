# HexTrackr Database Schema (Current State)

**Generated**: 2025-10-30
**Database**: hextrackr.db (SQLite 3.x, WAL mode)
**Schema Version**: v1.1.10
**Source**: Live production database extraction

---

## Overview

This document provides a complete reference of the current HexTrackr database schema as extracted from the live production database. The schema includes 23 tables, 68 indexes, and 1 trigger.

### Critical Notes

- **Legacy Table Warning**: The `vulnerabilities` table (created but unused) is scheduled for removal in HEX-349
- **Recovery Table**: The `lost_and_found` table indicates previous database corruption recovery
- **WAL Mode**: Database runs in Write-Ahead Logging mode for better concurrency

---

## Table Inventory

### Core Business Tables

| Table | Purpose | Status | Rows (Approx) |
|-------|---------|--------|---------------|
| `tickets` | Field operations ticketing with soft delete | Active | ~500 |
| `ticket_templates` | Markdown templates for ticket creation | Active | ~10 |
| `ticket_vulnerabilities` | Junction table linking tickets to vulnerabilities | Active | ~2K |

### Vulnerability Management Tables

| Table | Purpose | Status | Rows (Approx) |
|-------|---------|--------|---------------|
| `vulnerability_imports` | CSV import tracking | Active | ~200 |
| **`vulnerabilities`** | **LEGACY - NOT USED** | **To Remove (HEX-349)** | **0** |
| `vulnerabilities_current` | **ACTIVE production vulnerability data** | Active | ~95K |
| `vulnerability_snapshots` | Historical point-in-time vulnerability data | Active | ~2M |
| `vulnerability_daily_totals` | Aggregate trend data (365-day retention) | Active | ~365 |
| `vulnerability_staging` | Batch import staging area | Active | ~0 (temp) |
| `vulnerability_templates` | CVE report templates | Active | ~5 |
| `kev_status` | CISA KEV correlation tracking | Active | ~1K |

### Vendor Intelligence Tables

| Table | Purpose | Status | Rows (Approx) |
|-------|---------|--------|---------------|
| `cisco_advisories` | Cisco PSIRT advisories (OAuth2 synced) | Active | ~15K |
| `cisco_fixed_versions` | Normalized Cisco fixed versions (3NF, Migration 007) | Active | ~50K |
| `palo_alto_advisories` | Palo Alto security bulletins (web scraped) | Active | ~2K |
| `vendor_daily_totals` | Per-vendor trend aggregation (permanent) | Active | ~10K |

### Integration & Sync Tables

| Table | Purpose | Status | Rows (Approx) |
|-------|---------|--------|---------------|
| `sync_metadata` | Background sync tracking (KEV, Cisco, Palo Alto) | Active | ~1K |

### Templates & Email Tables

| Table | Purpose | Status | Rows (Approx) |
|-------|---------|--------|---------------|
| `email_templates` | Notification templates (4 types) | Active | ~10 |

### Authentication & Preferences Tables

| Table | Purpose | Status | Rows (Approx) |
|-------|---------|--------|---------------|
| `users` | Argon2id hashed passwords | Active | ~5 |
| `user_preferences` | Cross-device settings (JSON blob) | Active | ~20 |

### Security & Audit Tables

| Table | Purpose | Status | Rows (Approx) |
|-------|---------|--------|---------------|
| `audit_logs` | AES-256-GCM encrypted audit trail (HEX-254) | Active | ~5K |
| `audit_log_config` | Encryption key storage and retention policy | Active | 1 (singleton) |

### System Tables

| Table | Purpose | Status | Rows (Approx) |
|-------|---------|--------|---------------|
| `sqlite_sequence` | Auto-created for AUTOINCREMENT tracking | System | ~23 |
| `lost_and_found` | SQLite recovery table from corruption repair | Recovery | Variable |

---

## Detailed Table Definitions

### 1. vulnerability_imports

**Purpose**: Tracks CSV import operations with metadata and performance metrics.

```sql
CREATE TABLE vulnerability_imports (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    filename TEXT NOT NULL,
    import_date TEXT NOT NULL,
    row_count INTEGER NOT NULL,
    vendor TEXT,                          -- cisco, tenable, qualys, etc
    file_size INTEGER,
    processing_time INTEGER,              -- milliseconds
    raw_headers TEXT,                     -- JSON array of original column names
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

**Indexes**: None
**Foreign Keys**: None
**Used By**: ImportService, BackupService

---

### 2. vulnerabilities (LEGACY - TO REMOVE)

**Purpose**: ⚠️ **UNUSED LEGACY TABLE** - Originally the primary vulnerability table, now replaced by `vulnerabilities_current`. **Scheduled for removal in HEX-349.**

```sql
CREATE TABLE vulnerabilities (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    import_id INTEGER NOT NULL,
    hostname TEXT,
    ip_address TEXT,
    cve TEXT,
    severity TEXT,
    vpr_score REAL,
    cvss_score REAL,
    first_seen TEXT,
    last_seen TEXT,
    plugin_id TEXT,
    plugin_name TEXT,
    description TEXT,
    solution TEXT,
    vendor_reference TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    vendor TEXT DEFAULT '',
    vulnerability_date TEXT DEFAULT '',
    state TEXT DEFAULT 'open',
    import_date TEXT DEFAULT '',
    is_fixed INTEGER DEFAULT 0,
    fixed_cisco_versions TEXT,
    fixed_cisco_url TEXT,
    cisco_synced_at DATETIME,
    operating_system TEXT,
    solution_text TEXT,
    fixed_palo_versions TEXT,
    fixed_palo_url TEXT,
    palo_synced_at DATETIME,
    FOREIGN KEY (import_id) REFERENCES vulnerability_imports (id)
);
```

**Indexes**:
- `idx_vulnerabilities_hostname` ON vulnerabilities (hostname)
- `idx_vulnerabilities_severity` ON vulnerabilities (severity)
- `idx_vulnerabilities_cve` ON vulnerabilities (cve)
- `idx_vulnerabilities_import` ON vulnerabilities (import_id)
- `idx_vulnerabilities_is_fixed` ON vulnerabilities(is_fixed) WHERE is_fixed = 1

**Status**: ⚠️ **NOT USED BY APPLICATION CODE** - All queries use `vulnerabilities_current` instead.
**Action Required**: Remove from init-database.js after testing (HEX-349)

---

### 3. ticket_vulnerabilities

**Purpose**: Junction table linking tickets to vulnerabilities for remediation tracking.

```sql
CREATE TABLE ticket_vulnerabilities (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ticket_id TEXT NOT NULL,
    vulnerability_id INTEGER NOT NULL,
    relationship_type TEXT DEFAULT 'remediation',  -- remediation, investigation, etc
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (ticket_id) REFERENCES tickets (id),
    FOREIGN KEY (vulnerability_id) REFERENCES vulnerabilities (id)
);
```

**Indexes**:
- `idx_ticket_vulns_ticket` ON ticket_vulnerabilities (ticket_id)
- `idx_ticket_vulns_vuln` ON ticket_vulnerabilities (vulnerability_id)

**Foreign Keys**: tickets.id, vulnerabilities.id
**Used By**: TicketService, VulnerabilityService

---

### 4. vulnerability_snapshots

**Purpose**: Historical point-in-time vulnerability data for trend analysis. No unique constraints allow duplicates across time.

```sql
CREATE TABLE vulnerability_snapshots (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    import_id INTEGER NOT NULL,
    scan_date TEXT NOT NULL,
    hostname TEXT,
    ip_address TEXT,
    cve TEXT,
    severity TEXT,
    vpr_score REAL,
    cvss_score REAL,
    first_seen TEXT,
    last_seen TEXT,
    plugin_id TEXT,
    plugin_name TEXT,
    description TEXT,
    solution TEXT,
    vendor_reference TEXT,
    vendor TEXT,
    vulnerability_date TEXT,
    state TEXT DEFAULT 'open',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    unique_key TEXT,
    confidence_score INTEGER DEFAULT 50,
    dedup_tier INTEGER DEFAULT 4,
    enhanced_unique_key TEXT,
    operating_system TEXT,
    solution_text TEXT,
    FOREIGN KEY (import_id) REFERENCES vulnerability_imports (id)
);
```

**Indexes**:
- `idx_snapshots_scan_date` ON vulnerability_snapshots (scan_date)
- `idx_snapshots_hostname` ON vulnerability_snapshots (hostname)
- `idx_snapshots_severity` ON vulnerability_snapshots (severity)
- `idx_snapshots_cve` ON vulnerability_snapshots (cve)
- `idx_snapshots_enhanced_key` ON vulnerability_snapshots (enhanced_unique_key)

**Foreign Keys**: vulnerability_imports.id
**Used By**: VulnerabilityService (historical analysis), BackupService

---

### 5. vulnerabilities_current (ACTIVE PRODUCTION)

**Purpose**: **PRIMARY VULNERABILITY TABLE** - Current state of all vulnerabilities with lifecycle tracking. This is the table used by all application code.

```sql
CREATE TABLE vulnerabilities_current (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    import_id INTEGER NOT NULL,
    scan_date TEXT NOT NULL,
    hostname TEXT,
    ip_address TEXT,
    cve TEXT,
    severity TEXT,
    vpr_score REAL,
    cvss_score REAL,
    first_seen TEXT,
    last_seen TEXT,
    plugin_id TEXT,
    plugin_name TEXT,
    description TEXT,
    solution TEXT,
    vendor_reference TEXT,
    vendor TEXT,
    vulnerability_date TEXT,
    state TEXT DEFAULT 'open',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    unique_key TEXT UNIQUE,                         -- Enforces no duplicate vulnerabilities
    lifecycle_state TEXT DEFAULT 'active',          -- active, resolved
    resolved_date TEXT,
    resolution_reason TEXT,
    confidence_score INTEGER DEFAULT 50,
    dedup_tier INTEGER DEFAULT 4,
    enhanced_unique_key TEXT,
    is_fix_available INTEGER DEFAULT 0,
    operating_system TEXT,
    solution_text TEXT,
    FOREIGN KEY (import_id) REFERENCES vulnerability_imports (id)
);
```

**Indexes**:
- `idx_current_unique_key` ON vulnerabilities_current (unique_key)
- `idx_current_enhanced_unique_key` ON vulnerabilities_current (enhanced_unique_key)
- `idx_current_scan_date` ON vulnerabilities_current (scan_date)
- `idx_current_lifecycle_scan` ON vulnerabilities_current (lifecycle_state, scan_date)
- `idx_current_confidence_tier` ON vulnerabilities_current (confidence_score, dedup_tier)
- `idx_current_active_severity` ON vulnerabilities_current (lifecycle_state, severity)
- `idx_current_resolved_date` ON vulnerabilities_current (resolved_date)
- `idx_current_cve` ON vulnerabilities_current (cve)
- `idx_current_vendor` ON vulnerabilities_current (vendor)
- `idx_vulnerabilities_current_fix_available` ON vulnerabilities_current(is_fix_available) WHERE is_fix_available = 1

**Foreign Keys**: vulnerability_imports.id
**Used By**: VulnerabilityService (primary table), BackupService, all UI grids

---

### 6. vulnerability_daily_totals

**Purpose**: Daily aggregation of vulnerability counts by severity for trend charts. 365-day retention policy.

```sql
CREATE TABLE vulnerability_daily_totals (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    scan_date TEXT NOT NULL UNIQUE,
    critical_count INTEGER DEFAULT 0,
    critical_total_vpr REAL DEFAULT 0,
    high_count INTEGER DEFAULT 0,
    high_total_vpr REAL DEFAULT 0,
    medium_count INTEGER DEFAULT 0,
    medium_total_vpr REAL DEFAULT 0,
    low_count INTEGER DEFAULT 0,
    low_total_vpr REAL DEFAULT 0,
    total_vulnerabilities INTEGER DEFAULT 0,
    total_vpr REAL DEFAULT 0,
    resolved_count INTEGER DEFAULT 0,
    reopened_count INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

**Indexes**: None
**Foreign Keys**: None
**Used By**: VulnerabilityStatsService, Dashboard charts

---

### 7. vulnerability_staging

**Purpose**: Temporary staging area for batch imports before processing into `vulnerabilities_current`.

```sql
CREATE TABLE vulnerability_staging (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    import_id INTEGER NOT NULL,
    hostname TEXT,
    ip_address TEXT,
    cve TEXT,
    severity TEXT,
    vpr_score REAL,
    cvss_score REAL,
    plugin_id TEXT,
    plugin_name TEXT,
    description TEXT,
    solution TEXT,
    vendor_reference TEXT,
    vendor TEXT,
    vulnerability_date TEXT,
    state TEXT,
    enhanced_unique_key TEXT,
    confidence_score REAL,
    dedup_tier INTEGER,
    lifecycle_state TEXT DEFAULT 'staging',
    raw_csv_row JSON,
    processed BOOLEAN DEFAULT 0,
    batch_id INTEGER,
    processing_error TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    processed_at DATETIME,
    operating_system TEXT,
    solution_text TEXT,
    FOREIGN KEY (import_id) REFERENCES vulnerability_imports (id)
);
```

**Indexes**:
- `idx_staging_import_id` ON vulnerability_staging (import_id)
- `idx_staging_processed` ON vulnerability_staging (processed)
- `idx_staging_batch_id` ON vulnerability_staging (batch_id)
- `idx_staging_unprocessed_batch` ON vulnerability_staging (processed, batch_id)

**Foreign Keys**: vulnerability_imports.id
**Used By**: ImportService (batch processing)

---

### 8. email_templates

**Purpose**: Email notification templates with variable substitution support.

```sql
CREATE TABLE email_templates (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    template_content TEXT NOT NULL,
    default_content TEXT NOT NULL,
    variables TEXT NOT NULL,
    category TEXT DEFAULT 'ticket',
    is_active BOOLEAN DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

**Indexes**:
- `idx_email_templates_name` ON email_templates (name)
- `idx_email_templates_active` ON email_templates (is_active)
- `idx_email_templates_category` ON email_templates (category)

**Foreign Keys**: None
**Used By**: TemplateService

---

### 9. kev_status

**Purpose**: CISA Known Exploited Vulnerabilities (KEV) catalog data synced daily.

```sql
CREATE TABLE kev_status (
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
);
```

**Indexes**:
- `idx_kev_status_cve_id` ON kev_status(cve_id)
- `idx_kev_status_date_added` ON kev_status(date_added)
- `idx_kev_status_due_date` ON kev_status(due_date)
- `idx_kev_status_ransomware` ON kev_status(known_ransomware_use) WHERE known_ransomware_use = 1

**Foreign Keys**: None
**Used By**: KevService (24h background sync)

---

### 10. sync_metadata

**Purpose**: Tracks background sync operations for KEV, Cisco, and Palo Alto integrations.

```sql
CREATE TABLE sync_metadata (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    sync_type TEXT NOT NULL,
    sync_time TIMESTAMP NOT NULL,
    version TEXT,
    record_count INTEGER,
    status TEXT DEFAULT 'completed',
    error_message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    next_sync_time TEXT
);
```

**Indexes**:
- `idx_sync_metadata_type_time` ON sync_metadata(sync_type, sync_time DESC)

**Foreign Keys**: None
**Used By**: KevService, CiscoService, PaloAltoService

---

### 11. ticket_templates

**Purpose**: Markdown templates for ticket creation restored in HEX-286.

```sql
CREATE TABLE ticket_templates (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    template_content TEXT NOT NULL,
    default_content TEXT NOT NULL,
    variables TEXT NOT NULL,
    category TEXT DEFAULT 'ticket',
    is_active BOOLEAN DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

**Indexes**:
- `idx_ticket_templates_name` ON ticket_templates (name)
- `idx_ticket_templates_category` ON ticket_templates (category)
- `idx_ticket_templates_active` ON ticket_templates (is_active)

**Foreign Keys**: None
**Used By**: TemplateService

---

### 12. vulnerability_templates

**Purpose**: CVE report templates for vulnerability documentation.

```sql
CREATE TABLE vulnerability_templates (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    template_content TEXT NOT NULL,
    default_content TEXT NOT NULL,
    variables TEXT NOT NULL,
    category TEXT DEFAULT 'vulnerability',
    is_active BOOLEAN DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

**Indexes**:
- `idx_vulnerability_templates_name` ON vulnerability_templates (name)
- `idx_vulnerability_templates_category` ON vulnerability_templates (category)
- `idx_vulnerability_templates_active` ON vulnerability_templates (is_active)

**Foreign Keys**: None
**Used By**: TemplateService

---

### 13. users

**Purpose**: User authentication with Argon2id password hashing and session management.

```sql
CREATE TABLE users (
    id TEXT PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    email TEXT,
    password_hash TEXT NOT NULL,
    role TEXT DEFAULT 'superadmin',
    is_active INTEGER DEFAULT 1,
    last_login DATETIME,
    failed_attempts INTEGER DEFAULT 0,
    failed_login_timestamp DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

**Indexes**:
- `idx_users_username` ON users (username)
- `idx_users_email` ON users (email)

**Foreign Keys**: None
**Used By**: AuthService
**Security Note**: Password hashes NEVER exported in backups (BackupService.js:229)

---

### 14. lost_and_found

**Purpose**: SQLite recovery table created during database corruption repair. Contains orphaned rows.

```sql
CREATE TABLE lost_and_found(
    rootpgno INTEGER,
    pgno INTEGER,
    nfield INTEGER,
    id INTEGER,
    c0, c1, c2, c3, c4, c5, c6, c7, c8, c9, c10, c11, c12, c13, c14, c15,
    c16, c17, c18, c19, c20, c21, c22, c23, c24, c25
);
```

**Indexes**: None
**Foreign Keys**: None
**Status**: Recovery artifact - may be safe to drop after verifying no data loss

---

### 15. user_preferences

**Purpose**: Cross-device user settings stored as JSON blobs.

```sql
CREATE TABLE user_preferences (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    preference_key TEXT NOT NULL,
    preference_value TEXT NOT NULL,      -- JSON for complex values
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE(user_id, preference_key)
);
```

**Indexes**:
- `idx_user_preferences_user_id` ON user_preferences(user_id)
- `idx_user_preferences_key` ON user_preferences(user_id, preference_key)

**Foreign Keys**: users.id (CASCADE DELETE)
**Triggers**: `user_preferences_updated_at` (updates timestamp on change)
**Used By**: PreferencesService

---

### 16. tickets

**Purpose**: Field operations ticketing with soft delete support and shipping address tracking.

```sql
CREATE TABLE IF NOT EXISTS "tickets" (
    id TEXT PRIMARY KEY,
    xt_number TEXT,                      -- UNIQUE constraint removed, handled by partial index
    date_submitted TEXT,
    date_due TEXT,
    hexagon_ticket TEXT,
    service_now_ticket TEXT,
    location TEXT NOT NULL,
    devices TEXT,
    supervisor TEXT,
    tech TEXT,
    status TEXT DEFAULT 'Open',
    notes TEXT,
    attachments TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    site TEXT,
    site_id TEXT,
    location_id TEXT,
    deleted INTEGER DEFAULT 0,
    deleted_at TEXT,
    job_type TEXT DEFAULT 'Upgrade',
    tracking_number TEXT,
    software_versions TEXT,
    mitigation_details TEXT,
    shipping_line1 TEXT,
    shipping_line2 TEXT,
    shipping_city TEXT,
    shipping_state TEXT,
    shipping_zip TEXT,
    return_line1 TEXT,
    return_line2 TEXT,
    return_city TEXT,
    return_state TEXT,
    return_zip TEXT,
    outbound_tracking TEXT,
    return_tracking TEXT,
    deletion_reason TEXT,
    deleted_by TEXT,
    site_address TEXT,
    return_address TEXT,
    installed_versions TEXT,
    device_status TEXT
);
```

**Indexes**:
- `idx_tickets_xt_unique_active` (UNIQUE) ON tickets(xt_number) WHERE deleted = 0 (partial index for soft delete)
- `idx_tickets_deleted` ON tickets(deleted)
- `idx_tickets_xt_number` ON tickets(xt_number)
- `idx_tickets_xt` ON tickets (xt_number)
- `idx_tickets_status` ON tickets(status)
- `idx_tickets_location` ON tickets (location)
- `idx_tickets_site` ON tickets (site)
- `idx_tickets_job_type` ON tickets(job_type)

**Foreign Keys**: None
**Used By**: TicketService (primary table), BackupService

---

### 17. cisco_advisories

**Purpose**: Cisco PSIRT advisory data synced via OAuth2 API.

```sql
CREATE TABLE cisco_advisories (
    cve_id TEXT PRIMARY KEY,
    advisory_id TEXT,
    advisory_title TEXT,
    severity TEXT,
    cvss_score TEXT,
    first_fixed TEXT,                    -- JSON array: ["15.2(4)M11", "16.3.1"]
    affected_releases TEXT,              -- JSON array of affected versions
    product_names TEXT,                  -- JSON array of Cisco products
    publication_url TEXT,
    last_synced TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Indexes**:
- `idx_cisco_advisories_cve` ON cisco_advisories(cve_id)
- `idx_cisco_advisories_synced` ON cisco_advisories(last_synced)

**Foreign Keys**: None
**Used By**: CiscoService (OAuth2 sync), VulnerabilityService

---

### 18. palo_alto_advisories

**Purpose**: Palo Alto security bulletin data scraped from web API.

```sql
CREATE TABLE palo_alto_advisories (
    cve_id TEXT PRIMARY KEY,
    advisory_id TEXT,
    advisory_title TEXT,
    severity TEXT,
    cvss_score TEXT,
    first_fixed TEXT,                    -- JSON array: ["10.2.0-h3", "11.0.0"]
    affected_versions TEXT,              -- JSON array from x_affectedList
    product_name TEXT,                   -- From affected[].product (always "PAN-OS")
    publication_url TEXT,
    last_synced TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Indexes**:
- `idx_palo_advisories_cve` ON palo_alto_advisories(cve_id)
- `idx_palo_advisories_synced` ON palo_alto_advisories(last_synced)

**Foreign Keys**: None
**Used By**: PaloAltoService (web scraping), VulnerabilityService

---

### 19. vendor_daily_totals

**Purpose**: Per-vendor daily aggregation of vulnerability counts. Permanent retention.

```sql
CREATE TABLE vendor_daily_totals (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    scan_date TEXT NOT NULL,
    vendor TEXT NOT NULL,
    critical_count INTEGER DEFAULT 0,
    critical_total_vpr REAL DEFAULT 0,
    high_count INTEGER DEFAULT 0,
    high_total_vpr REAL DEFAULT 0,
    medium_count INTEGER DEFAULT 0,
    medium_total_vpr REAL DEFAULT 0,
    low_count INTEGER DEFAULT 0,
    low_total_vpr REAL DEFAULT 0,
    total_vulnerabilities INTEGER DEFAULT 0,
    total_vpr REAL DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(scan_date, vendor)
);
```

**Indexes**:
- `idx_vendor_daily_scan_date` ON vendor_daily_totals(scan_date)
- `idx_vendor_daily_vendor` ON vendor_daily_totals(vendor)
- `idx_vendor_daily_composite` ON vendor_daily_totals(vendor, scan_date)

**Foreign Keys**: None
**Used By**: VulnerabilityStatsService, vendor analytics

---

### 20. audit_logs

**Purpose**: AES-256-GCM encrypted audit trail implemented in HEX-254.

```sql
CREATE TABLE audit_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    category TEXT NOT NULL,              -- e.g., 'user.login', 'ticket.delete'
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,
    user_id TEXT,
    username TEXT,
    ip_address TEXT,
    user_agent TEXT,
    request_id TEXT,
    encrypted_message BLOB NOT NULL,     -- AES-256-GCM encrypted message
    encrypted_data BLOB,                 -- AES-256-GCM encrypted JSON data
    encryption_iv BLOB NOT NULL,         -- IV for decryption
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

**Indexes**:
- `idx_audit_logs_category` ON audit_logs(category)
- `idx_audit_logs_timestamp` ON audit_logs(timestamp)
- `idx_audit_logs_user_id` ON audit_logs(user_id)
- `idx_audit_logs_username` ON audit_logs(username)
- `idx_audit_logs_created_at` ON audit_logs(created_at)
- `idx_audit_logs_category_timestamp` ON audit_logs(category, timestamp)

**Foreign Keys**: None
**Used By**: LoggingService (HEX-254)
**Documentation**: /docs/LOGGING_SYSTEM.md

---

### 21. audit_log_config

**Purpose**: Singleton table storing audit log encryption key and retention policy.

```sql
CREATE TABLE audit_log_config (
    id INTEGER PRIMARY KEY CHECK (id = 1),     -- Singleton (only 1 row allowed)
    encryption_key BLOB NOT NULL,              -- AES-256 key (32 bytes)
    key_created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    key_rotated_at DATETIME,
    retention_days INTEGER DEFAULT 30,
    last_cleanup_at DATETIME,
    total_logs_written INTEGER DEFAULT 0,
    total_logs_purged INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

**Indexes**: None
**Foreign Keys**: None
**Used By**: LoggingService (HEX-254)
**Security Note**: Encryption key must be protected

---

### 22. cisco_fixed_versions

**Purpose**: Normalized Cisco fixed versions in 3NF (Third Normal Form). Implemented in Migration 007.

```sql
CREATE TABLE cisco_fixed_versions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    cve_id TEXT NOT NULL,
    os_family TEXT NOT NULL,             -- "ios", "iosxe", "iosxr", "nxos", "asa", "ftd", "fxos"
    fixed_version TEXT NOT NULL,         -- "15.2(8)E8", "17.12.6"
    affected_version TEXT,
    last_synced TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (cve_id) REFERENCES cisco_advisories(cve_id) ON DELETE CASCADE,
    UNIQUE(cve_id, os_family, fixed_version)
);
```

**Indexes**:
- `idx_fixed_versions_cve` ON cisco_fixed_versions(cve_id)
- `idx_fixed_versions_os_family` ON cisco_fixed_versions(os_family)
- `idx_fixed_versions_lookup` ON cisco_fixed_versions(cve_id, os_family)

**Foreign Keys**: cisco_advisories.cve_id (CASCADE DELETE)
**Used By**: CiscoService, VulnerabilityService

---

### 23. sqlite_sequence

**Purpose**: Auto-created by SQLite to track AUTOINCREMENT values for all tables.

```sql
CREATE TABLE sqlite_sequence(name, seq);
```

**Indexes**: None
**Foreign Keys**: None
**Status**: System table (do not modify)

---

## Index Summary

**Total Indexes**: 68 user-created + 1 auto-generated

### Performance Critical Indexes

| Index | Table | Columns | Purpose |
|-------|-------|---------|---------|
| idx_current_unique_key | vulnerabilities_current | unique_key | Enforce uniqueness, deduplication |
| idx_tickets_xt_unique_active | tickets | xt_number WHERE deleted=0 | Partial index for soft delete |
| idx_current_lifecycle_scan | vulnerabilities_current | lifecycle_state, scan_date | Active vulnerability queries |
| idx_audit_logs_category_timestamp | audit_logs | category, timestamp | Fast audit log filtering |
| idx_vendor_daily_composite | vendor_daily_totals | vendor, scan_date | Vendor analytics |

### Unused Index Candidates

The following indexes may be redundant and candidates for removal after analysis:

- `idx_tickets_xt_number` (duplicate of idx_tickets_xt)
- `idx_kev_status_cve_id` (redundant, cve_id is PRIMARY KEY)
- `idx_cisco_advisories_cve` (redundant, cve_id is PRIMARY KEY)
- `idx_palo_advisories_cve` (redundant, cve_id is PRIMARY KEY)

---

## Triggers

### user_preferences_updated_at

**Purpose**: Automatically updates the `updated_at` timestamp when user preferences are modified.

```sql
CREATE TRIGGER user_preferences_updated_at
  AFTER UPDATE ON user_preferences
  FOR EACH ROW
BEGIN
  UPDATE user_preferences
  SET updated_at = CURRENT_TIMESTAMP
  WHERE id = NEW.id;
END;
```

**Table**: user_preferences
**Event**: AFTER UPDATE
**Action**: Sets updated_at = CURRENT_TIMESTAMP

---

## Foreign Key Relationships

```
vulnerability_imports (id)
  ├─→ vulnerabilities (import_id)              [LEGACY]
  ├─→ vulnerability_snapshots (import_id)
  ├─→ vulnerabilities_current (import_id)
  └─→ vulnerability_staging (import_id)

tickets (id)
  └─→ ticket_vulnerabilities (ticket_id)

vulnerabilities (id)                           [LEGACY]
  └─→ ticket_vulnerabilities (vulnerability_id)

users (id)
  └─→ user_preferences (user_id) [CASCADE DELETE]

cisco_advisories (cve_id)
  └─→ cisco_fixed_versions (cve_id) [CASCADE DELETE]
```

---

## Schema Evolution Notes

### Recent Changes

1. **Migration 007** (v1.1.0): Normalized Cisco fixed versions into 3NF (`cisco_fixed_versions`)
2. **Migration 008** (v1.1.0): Added `vendor_daily_totals` for per-vendor analytics
3. **Migration 012** (v1.1.0): Implemented encrypted audit logs (`audit_logs`, `audit_log_config`)
4. **Migration 014** (v1.1.10): Supervisor/tech normalization

### Pending Changes

1. **HEX-349**: Remove legacy `vulnerabilities` table (test in dev first)
2. **Recovery Analysis**: Evaluate `lost_and_found` table for safe removal
3. **Index Optimization**: Remove redundant indexes on PRIMARY KEY columns

---

## Database Statistics

**Database File Size**: ~450MB (main) + ~453MB (WAL) = 903MB total
**Estimated Row Counts**:
- vulnerabilities_current: ~95,000
- vulnerability_snapshots: ~2,000,000
- cisco_advisories: ~15,000
- cisco_fixed_versions: ~50,000
- tickets: ~500
- audit_logs: ~5,000

**Journal Mode**: WAL (Write-Ahead Logging)
**Page Size**: 4096 bytes (default)
**Encoding**: UTF-8

---

## Backup & Restore

**Backup Files Include**:
- All tables EXCEPT `users` (password hashes excluded)
- JSON ZIP format for comprehensive backups
- Database file format (.db) for large datasets

**Restore Limitations**:
- JSON restore cannot handle chunked exports (10K+ records per chunk)
- Use database file restore for datasets with 95K+ vulnerabilities
- See: BackupService.js:399-591 for restore implementation

---

## References

- **Schema Evolution**: /docs/SCHEMA_EVOLUTION.md
- **Database Seed Strategy**: /docs/DATABASE_SEED.md
- **Audit Log System**: /docs/LOGGING_SYSTEM.md
- **Cisco Advisory Architecture**: /docs/CISCO_ADVISORY_ARCHITECTURE.md
- **SQL Dump**: /docs/schema-actual-20251030.sql

---

**Document Version**: 1.0
**Last Updated**: 2025-10-30
**Extracted From**: hextrackr.db (production database)