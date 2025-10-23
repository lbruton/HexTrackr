# HexTrackr Data Model

This document provides a definitive overview of the HexTrackr database schema. The schema baseline is v1.1.0 (established via HEX-324), which consolidates all 21 application tables into `scripts/init-database-v1.1.0.js`. This documentation reflects the current application version v1.1.3. The schema may evolve further via incremental migrations in the `migrations/` directory. The authoritative state is the **live SQLite schema** captured in this document and the v1.1.0 baseline script.

**Schema Summary** (v1.1.0 baseline):
- **21 Core Tables**: Organized into 6 functional categories
- **68 Indexes**: Performance-optimized queries on critical fields (67 user-created + 1 auto-generated trigger index)
- **4-Tier Deduplication**: Enhanced unique key generation with confidence scoring
- **KEV Integration**: CISA Known Exploited Vulnerabilities catalog synchronization
- **Template System**: Email, ticket, and vulnerability report templates with variable substitution
- **Authentication**: Argon2id password hashing with account lockout protection
- **Vendor Intelligence**: Cisco PSIRT and Palo Alto advisory integration with 3NF normalization
- **Audit Logging**: Encrypted audit trail with configurable retention policy

## Database Engine

- **Engine**: SQLite 3
- **Database File**: `/app/data/hextrackr.db` (Docker named volume: `hextrackr-database`)
- **Local Path**: Not accessible from host filesystem (isolated in Docker volume for SQLite integrity)

---

## Schema Organization (v1.1.0)

The 21 application tables are organized into 6 functional categories:

**Core Business** (3 tables):
- `tickets` - Field operations ticketing system
- `ticket_templates` - Ticket creation templates
- `ticket_vulnerabilities` - Junction table linking tickets to vulnerabilities

**Vulnerability Management** (9 tables):
- `vulnerabilities` - Legacy vulnerability data (pre-rollover, backup/export only)
- `vulnerabilities_current` - Current deduplicated vulnerability state
- `vulnerability_snapshots` - Historical append-only vulnerability log
- `vulnerability_staging` - Bulk import staging area
- `vulnerability_daily_totals` - Pre-calculated daily aggregates
- `vulnerability_imports` - CSV import audit trail
- `vulnerability_templates` - Vulnerability report templates
- `vendor_daily_totals` - Vendor-specific daily aggregates

**Vendor Intelligence** (3 tables):
- `cisco_advisories` - Cisco PSIRT security advisories (OAuth2 synced)
- `cisco_fixed_versions` - Normalized Cisco fix versions (3NF, addresses multi-OS-family CVE corruption)
- `palo_alto_advisories` - Palo Alto security bulletins (web scraped)

**CISA Integration** (2 tables):
- `kev_status` - CISA Known Exploited Vulnerabilities catalog
- `sync_metadata` - KEV synchronization history and status

**Authentication & Preferences** (2 tables):
- `users` - User accounts with Argon2id password hashing
- `user_preferences` - Cross-device user settings (JSON blob storage)

**Security & Audit** (2 tables):
- `audit_logs` - Encrypted audit trail with retention policy
- `audit_log_config` - Singleton configuration for audit logging

**Note**: The `email_templates` table (part of the Template System category) is included in the Vulnerability Management count above for organizational clarity.

---

## Core Tables

### `tickets`

Stores all ticketing information. This table has **indexes for query performance** on dates, status, site codes, and external ticket numbers. Site and location tracking uses TEXT fields (`site`, `site_id`, `location`, `location_id`) for flexible data storage.

| Column | Type | Constraints | Description |
| --- | --- | --- | --- |
| `id` | TEXT | PK | Stable unique identifier supplied by UI (string, not auto-increment). |
| `xt_number` | TEXT | UNIQUE | Alternate human-friendly number (used when `id` absent in legacy imports). |
| `date_submitted` | TEXT |  | Submission date (ISO date) - nullable. |
| `date_due` | TEXT |  | Due date (ISO date) - nullable. |
| `hexagon_ticket` | TEXT |  | External Hexagon reference. |
| `service_now_ticket` | TEXT |  | External ServiceNow reference. |
| `location` | TEXT | NOT NULL | Human readable location label. |
| `devices` | TEXT |  | Semicolon-delimited device names preserving boot order (imports accept JSON arrays and are normalised). |
| `supervisor` | TEXT |  | Supervisor name (can be semicolon-delimited for multiple). |
| `tech` | TEXT |  | Assigned technician. |
| `status` | TEXT | DEFAULT 'Open' | Workflow status (Open, Completed, etc.). |
| `notes` | TEXT |  | Free form notes. |
| `attachments` | TEXT |  | JSON array of attachment metadata. |
| `created_at` | DATETIME | DEFAULT CURRENT_TIMESTAMP | Creation timestamp. |
| `updated_at` | DATETIME | DEFAULT CURRENT_TIMESTAMP | Last update timestamp. |
| `site` | TEXT |  | Higher-level site grouping. |
| `site_id` | TEXT |  | Optional site identifier (TEXT, not FK). |
| `location_id` | TEXT |  | Optional location identifier (TEXT, not FK). |

**Ticket Indexes** (all created automatically): location, status, date_submitted, date_due, hexagon_ticket, service_now_ticket, site, xt_number, site_id, location_id.

### `vulnerability_imports`

Audit log of each ingested CSV batch.

| Column | Type | Constraints | Description |
| --- | --- | --- | --- |
| `id` | INTEGER | PK AUTOINCREMENT | Batch identifier. |
| `filename` | TEXT | NOT NULL | Uploaded filename. |
| `import_date` | TEXT | NOT NULL | Import timestamp (ISO). |
| `row_count` | INTEGER | NOT NULL | Rows parsed (after filtering empties). |
| `vendor` | TEXT |  | Source label (cisco, tenable, web-import, etc.). |
| `file_size` | INTEGER |  | Size in bytes. |
| `processing_time` | INTEGER |  | Milliseconds to process. |
| `raw_headers` | TEXT |  | JSON array of original column names. |
| `created_at` | DATETIME | DEFAULT CURRENT_TIMESTAMP | Record creation time. |

---

## Vulnerability Rollover Architecture

HexTrackr uses a "rollover" architecture to manage vulnerability data over time. This allows for accurate daily trending and historical analysis. It consists of three main tables.

For a detailed walkthrough of the rollover process, see [Backend Architecture](./backend.md#vulnerability-rollover-workflow).

### `vulnerabilities_current`

Current deduplicated state (one row per active unique vulnerability for the most recent scan date it appeared in). Added during rollover processing.

| Column | Type | Constraints | Notes |
| --- | --- | --- | --- |
| `id` | INTEGER | PK AUTOINCREMENT |  |
| `import_id` | INTEGER | FK to `vulnerability_imports.id` | Batch that introduced or last updated this row. |
| `scan_date` | TEXT | NOT NULL | Date of the scan (YYYY-MM-DD). |
| `hostname` | TEXT |  | Raw hostname (pre-normalization retained). |
| `ip_address` | TEXT |  | Optional IP (may be blank). |
| `cve` | TEXT |  | CVE identifier if present. |
| `severity` | TEXT |  | Critical/High/Medium/Low (case-insensitive input). |
| `vpr_score` | REAL |  | Vulnerability Priority Rating. |
| `cvss_score` | REAL |  | CVSS Base score. |
| `first_seen` | TEXT |  | First observed date (fallback to `scan_date` if missing). |
| `last_seen` | TEXT |  | Last observed date (updated each scan presence). |
| `plugin_id` | TEXT |  | Scanner plugin id. |
| `plugin_name` | TEXT |  | Scanner plugin name. |
| `description` | TEXT |  | Short description (duplicate of plugin_name in some feeds). |
| `solution` | TEXT |  | Remediation guidance. |
| `vendor_reference` | TEXT |  | Original vendor family string. |
| `vendor` | TEXT |  | Normalized vendor (currently mirrors vendor_reference). |
| `vulnerability_date` | TEXT |  | Publication date. |
| `state` | TEXT | DEFAULT 'open' | Physical state (open/closed). |
| `lifecycle_state` | TEXT | DEFAULT 'active' | Logical state (active/resolved/reopened). |
| `resolved_date` | TEXT |  | Date when marked as resolved. |
| `resolution_reason` | TEXT |  | Reason why vulnerability was resolved. |
| `confidence_score` | INTEGER | DEFAULT 50 | Deduplication confidence (0-100). |
| `dedup_tier` | INTEGER | DEFAULT 4 | Deduplication tier level (1-4). |
| `enhanced_unique_key` | TEXT |  | Enhanced 4-tier deduplication key. |
| `operating_system` | TEXT |  | Operating system information (added Migration 006). |
| `solution_text` | TEXT |  | Extended solution details (added Migration 006). |
| `created_at` | DATETIME | DEFAULT CURRENT_TIMESTAMP | Insert timestamp. |
| `updated_at` | DATETIME |  | Last update timestamp. |
| `unique_key` | TEXT | UNIQUE | Composite key (see Rollover section). |

### `vulnerability_snapshots`

This table is an append-only log of **all vulnerabilities from every scan**. It serves as the historical record for trend analysis.

| Column | Type | Constraints | Description |
| --- | --- | --- | --- |
| `id` | INTEGER | PK AUTOINCREMENT | Snapshot record identifier. |
| `import_id` | INTEGER | FK to `vulnerability_imports.id`, NOT NULL | Associated import batch. |
| `scan_date` | TEXT | NOT NULL | Date of the scan (YYYY-MM-DD). |
| `hostname` | TEXT |  | Raw hostname (pre-normalization retained). |
| `ip_address` | TEXT |  | Optional IP (may be blank). |
| `cve` | TEXT |  | CVE identifier if present. |
| `severity` | TEXT |  | Critical/High/Medium/Low (case-insensitive input). |
| `vpr_score` | REAL |  | Vulnerability Priority Rating. |
| `cvss_score` | REAL |  | CVSS Base score. |
| `first_seen` | TEXT |  | First observed date. |
| `last_seen` | TEXT |  | Last observed date. |
| `plugin_id` | TEXT |  | Scanner plugin id. |
| `plugin_name` | TEXT |  | Scanner plugin name. |
| `description` | TEXT |  | Short description (duplicate of plugin_name in some feeds). |
| `solution` | TEXT |  | Remediation guidance. |
| `vendor_reference` | TEXT |  | Original vendor family string. |
| `vendor` | TEXT |  | Normalized vendor. |
| `vulnerability_date` | TEXT |  | Publication date. |
| `state` | TEXT | DEFAULT 'open' | Physical state (open/closed). |
| `created_at` | DATETIME | DEFAULT CURRENT_TIMESTAMP | Insert timestamp. |
| `unique_key` | TEXT |  | Composite key (not unique - allows duplicates across scan dates). |
| `confidence_score` | INTEGER | DEFAULT 50 | Deduplication confidence (0-100). |
| `dedup_tier` | INTEGER | DEFAULT 4 | Deduplication tier level (1-4). |
| `enhanced_unique_key` | TEXT |  | Enhanced 4-tier deduplication key. |
| `operating_system` | TEXT |  | Operating system information (added Migration 006). |
| `solution_text` | TEXT |  | Extended solution details (added Migration 006). |

**Key Differences from `vulnerabilities_current`**:
- `unique_key` is **not unique** (allows duplicate vulnerabilities across scan dates)
- Missing lifecycle management columns: `lifecycle_state`, `resolved_date`, `resolution_reason`
- Missing `updated_at` column (append-only, never updated)
- Acts as append-only historical log for every scan ingestion

### `vulnerability_daily_totals`

This table stores pre-calculated daily aggregates to power the dashboard charts efficiently.

| Column | Type | Description |
| --- | --- | --- |
| `id` | INTEGER | **Primary Key**. |
| `scan_date` | TEXT | **UNIQUE**. The date for which the totals are calculated. |
| `critical_count` | INTEGER | Total count of Critical vulnerabilities on this date. |
| `critical_total_vpr` | REAL | Sum of VPR scores for all Critical vulnerabilities. |
| `high_count` | INTEGER | Total count of High vulnerabilities. |
| `high_total_vpr` | REAL | Sum of VPR scores for High vulnerabilities. |
| `medium_count` | INTEGER | Total count of Medium vulnerabilities. |
| `medium_total_vpr` | REAL | Sum of VPR scores for Medium vulnerabilities. |
| `low_count` | INTEGER | Total count of Low vulnerabilities. |
| `low_total_vpr` | REAL | Sum of VPR scores for Low vulnerabilities. |
| `total_vulnerabilities` | INTEGER | The sum of all vulnerability counts for the day. |
| `total_vpr` | REAL | The sum of all VPR scores for the day. |
| `resolved_count` | INTEGER | Count of vulnerabilities marked resolved this day. |
| `reopened_count` | INTEGER | Count of previously resolved vulnerabilities that reappeared. |
| `created_at` | DATETIME | Record creation timestamp. |
| `updated_at` | DATETIME | Last update timestamp. |

### `vendor_daily_totals` *(v1.0.62 - Migration 008)*

Vendor-specific daily aggregates for trend analysis and vendor comparison. This table provides granular insights into vulnerability distribution across different vendors (Cisco, Palo Alto, etc.).

| Column | Type | Description |
| --- | --- | --- |
| `id` | INTEGER | **Primary Key**. |
| `scan_date` | TEXT | The date for which the totals are calculated. |
| `vendor` | TEXT | Vendor name (cisco, paloalto, etc.). |
| `critical_count` | INTEGER | Count of Critical vulnerabilities for this vendor on this date. |
| `critical_total_vpr` | REAL | Sum of VPR scores for Critical vulnerabilities. |
| `high_count` | INTEGER | Count of High vulnerabilities. |
| `high_total_vpr` | REAL | Sum of VPR scores for High vulnerabilities. |
| `medium_count` | INTEGER | Count of Medium vulnerabilities. |
| `medium_total_vpr` | REAL | Sum of VPR scores for Medium vulnerabilities. |
| `low_count` | INTEGER | Count of Low vulnerabilities. |
| `low_total_vpr` | REAL | Sum of VPR scores for Low vulnerabilities. |
| `total_vulnerabilities` | INTEGER | Sum of all vulnerability counts for this vendor/date. |
| `total_vpr` | REAL | Sum of all VPR scores for this vendor/date. |
| `created_at` | DATETIME | Record creation timestamp. |
| **UNIQUE** | (scan_date, vendor) | One record per vendor per date. |

**Indexes**:
- `idx_vendor_daily_scan_date` (scan_date)
- `idx_vendor_daily_vendor` (vendor)
- `idx_vendor_daily_composite` (vendor, scan_date)

**Purpose**: Permanent storage for vendor-specific trend data. Unlike `vulnerability_daily_totals`, this table is **never cleaned up** by db-snapshot-cleanup.js, providing long-term vendor performance tracking.

### `vulnerability_staging`

This table serves as a **bulk import staging area** for high-performance CSV processing with enhanced deduplication scoring.

| Column | Type | Constraints | Description |
| --- | --- | --- | --- |
| `id` | INTEGER | PK AUTOINCREMENT | Staging row identifier. |
| `import_id` | INTEGER | FK to `vulnerability_imports.id`, NOT NULL | Associated import batch. |
| `hostname` | TEXT |  | Raw hostname (pre-normalization). |
| `ip_address` | TEXT |  | Optional IP address. |
| `cve` | TEXT |  | CVE identifier if present. |
| `severity` | TEXT |  | Critical/High/Medium/Low. |
| `vpr_score` | REAL |  | Vulnerability Priority Rating. |
| `cvss_score` | REAL |  | CVSS Base score. |
| `plugin_id` | TEXT |  | Scanner plugin identifier. |
| `plugin_name` | TEXT |  | Scanner plugin name. |
| `description` | TEXT |  | Vulnerability description. |
| `solution` | TEXT |  | Remediation guidance. |
| `vendor_reference` | TEXT |  | Original vendor family string. |
| `vendor` | TEXT |  | Normalized vendor. |
| `vulnerability_date` | TEXT |  | Publication date. |
| `state` | TEXT |  | Physical state (open/closed). |
| `enhanced_unique_key` | TEXT |  | 4-tier deduplication key (see Rollover section). |
| `confidence_score` | REAL |  | Deduplication confidence (0.0-1.0): Tier 1 = 0.95, Tier 2 = 0.75, Tier 3 = 0.50, Tier 4 = 0.25. |
| `dedup_tier` | INTEGER |  | Tier level (1-4): 1 = Asset+Plugin (highest), 2 = CVE+Host, 3 = Plugin+Host+Vendor, 4 = Desc Hash (lowest). |
| `lifecycle_state` | TEXT | DEFAULT 'staging' | Processing state (staging/processed/error). |
| `raw_csv_row` | JSON |  | Complete original CSV row for audit trail. |
| `processed` | BOOLEAN | DEFAULT 0 | Whether row has been processed into `vulnerabilities_current`. |
| `batch_id` | INTEGER |  | Sub-batch identifier for parallel processing. |
| `processing_error` | TEXT |  | Error message if processing failed. |
| `operating_system` | TEXT |  | Operating system information (added Migration 006). |
| `solution_text` | TEXT |  | Extended solution details (added Migration 006). |
| `created_at` | DATETIME | DEFAULT CURRENT_TIMESTAMP | Staging timestamp. |
| `processed_at` | DATETIME |  | Processing completion timestamp. |

**Purpose**: Enables bulk loading of large CSV files (10k+ rows) with preprocessing, deduplication scoring, and error tracking before committing to production tables.

---

## KEV Integration *(v1.0.22+)*

HexTrackr integrates with CISA's **Known Exploited Vulnerabilities (KEV) catalog** to track actively exploited vulnerabilities.

### `kev_status`

Stores CISA KEV catalog data synced from https://www.cisa.gov/known-exploited-vulnerabilities-catalog.

| Column | Type | Constraints | Description |
| --- | --- | --- | --- |
| `cve_id` | TEXT | PRIMARY KEY | CVE identifier (e.g., CVE-2021-44228). |
| `date_added` | DATE | NOT NULL | Date CISA added this CVE to KEV catalog. |
| `vulnerability_name` | TEXT |  | CISA-provided vulnerability name. |
| `vendor_project` | TEXT |  | Affected vendor/project. |
| `product` | TEXT |  | Affected product. |
| `required_action` | TEXT |  | CISA-mandated remediation action. |
| `due_date` | DATE |  | Federal agency remediation deadline. |
| `known_ransomware_use` | BOOLEAN | DEFAULT 0 | Whether used in ransomware campaigns (1 = Yes, 0 = No). |
| `notes` | TEXT |  | Additional context or references. |
| `last_synced` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Last sync timestamp. |

**Relationship**: Vulnerabilities in `vulnerabilities_current` are LEFT JOINed with `kev_status` on `cve` = `cve_id` to enrich data with KEV flags and due dates.

### `sync_metadata`

Tracks KEV catalog synchronization history and status.

| Column | Type | Constraints | Description |
| --- | --- | --- | --- |
| `id` | INTEGER | PK AUTOINCREMENT | Sync record identifier. |
| `sync_type` | TEXT | NOT NULL | Type of sync (e.g., 'kev_catalog'). |
| `sync_time` | TIMESTAMP | NOT NULL | Sync execution timestamp. |
| `version` | TEXT |  | Catalog version or timestamp from CISA. |
| `record_count` | INTEGER |  | Number of KEV records synced. |
| `status` | TEXT | DEFAULT 'completed' | Sync status (completed/failed/in_progress). |
| `error_message` | TEXT |  | Error details if sync failed. |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Record creation timestamp. |

**Purpose**: Audit trail for KEV sync operations, enables troubleshooting and monitoring of catalog updates.

---

## Vendor Intelligence *(v1.0.63+)*

HexTrackr integrates with vendor security advisory systems to provide fix availability tracking and remediation guidance.

### `cisco_advisories` *(v1.0.63 - HEX-287)*

Stores Cisco PSIRT security advisory metadata synced via OAuth2 API.

| Column | Type | Constraints | Description |
| --- | --- | --- | --- |
| `cve_id` | TEXT | PRIMARY KEY | CVE identifier (e.g., CVE-2025-20352). |
| `advisory_id` | TEXT |  | Cisco advisory identifier (e.g., cisco-sa-20170317-cmp). |
| `advisory_title` | TEXT |  | Advisory title/summary. |
| `severity` | TEXT |  | Cisco severity rating (Critical/High/Medium/Low). |
| `cvss_score` | TEXT |  | CVSS base score from Cisco. |
| `first_fixed` | TEXT |  | **Deprecated**: Legacy column, use `cisco_fixed_versions` instead. |
| `affected_releases` | TEXT |  | JSON array of affected software versions. |
| `product_names` | TEXT |  | Affected product names. |
| `publication_url` | TEXT |  | Direct link to Cisco advisory. |
| `last_synced` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Last synchronization timestamp. |

**Indexes**:
- `idx_cisco_advisories_cve` (cve_id)
- `idx_cisco_advisories_synced` (last_synced)

**Sync Strategy**: OAuth2 authentication with 90-day refresh cycle for existing advisories. See [Cisco PSIRT Integration Guide](/docs-html/content/guides/cisco-psirt-integration.html) for details.

### `cisco_fixed_versions` *(v1.0.79 - Migration 007, HEX-287)*

Stores normalized Cisco fix versions (3NF normalization to prevent data corruption from multi-OS-family CVEs).

| Column | Type | Constraints | Description |
| --- | --- | --- | --- |
| `id` | INTEGER | PK AUTOINCREMENT | Fixed version record identifier. |
| `cve_id` | TEXT | FK to `cisco_advisories.cve_id`, NOT NULL | Associated CVE. |
| `os_family` | TEXT | NOT NULL | Operating system family (ios, iosxe, iosxr, nxos, etc.). |
| `fixed_version` | TEXT | NOT NULL | Software version that fixes the vulnerability. |
| `affected_version` | TEXT |  | Original affected version string. |
| `last_synced` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Last synchronization timestamp. |
| **UNIQUE** | (cve_id, os_family, fixed_version) |  | One row per CVE + OS family + version. |
| **FOREIGN KEY** | ON DELETE CASCADE |  | Versions deleted when advisory is deleted. |

**Indexes**:
- `idx_cisco_fixed_versions_cve` (cve_id)
- `idx_cisco_fixed_versions_os_family` (os_family)
- `idx_cisco_fixed_versions_composite` (cve_id, os_family)

**Why Normalized?** Multi-OS-family CVEs (affecting both IOS and IOS XE) require separate rows to prevent data overwrites. See [HEX-287](https://linear.app/hextrackr/issue/HEX-287) for technical details.

**Example Data**:
```
cve_id            | os_family | fixed_version
------------------|-----------|---------------
CVE-2025-20352    | ios       | 15.2(8)E8
CVE-2025-20352    | ios       | 15.9(3)M11
CVE-2025-20352    | iosxe     | 17.12.6
CVE-2025-20352    | iosxe     | 17.9.4a
```

### `palo_alto_advisories` *(v1.0.63)*

Stores Palo Alto Networks security bulletin data scraped from their security advisory website.

| Column | Type | Constraints | Description |
| --- | --- | --- | --- |
| `cve_id` | TEXT | PRIMARY KEY | CVE identifier. |
| `advisory_id` | TEXT |  | Palo Alto advisory identifier (e.g., PAN-SA-2024-0001). |
| `advisory_title` | TEXT |  | Advisory title/summary. |
| `severity` | TEXT |  | Palo Alto severity rating. |
| `cvss_score` | TEXT |  | CVSS base score from Palo Alto. |
| `first_fixed` | TEXT |  | First fixed software version. |
| `affected_releases` | TEXT |  | JSON array of affected PAN-OS versions. |
| `product_names` | TEXT |  | Affected product names. |
| `publication_url` | TEXT |  | Direct link to Palo Alto advisory. |
| `last_synced` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Last synchronization timestamp. |

**Indexes**:
- `idx_palo_advisories_cve` (cve_id)
- `idx_palo_advisories_synced` (last_synced)

**Sync Strategy**: Web scraping with HTML parsing (no official API available). Manual refresh via admin interface.

**Vendor-Neutral Fix Tracking**: Both vendor advisory systems set the `is_fix_available` flag on `vulnerabilities_current` table for fast filtering of fixable vulnerabilities.

---

## Template System *(v1.0.46+)*

HexTrackr provides customizable templates for emails, tickets, and vulnerability reports with variable substitution.

### `email_templates`

Stores email notification templates with dynamic variable support.

| Column | Type | Constraints | Description |
| --- | --- | --- | --- |
| `id` | INTEGER | PK AUTOINCREMENT | Template identifier. |
| `name` | TEXT | UNIQUE NOT NULL | Template name (e.g., 'vulnerability_notification'). |
| `description` | TEXT |  | Template purpose and usage notes. |
| `template_content` | TEXT | NOT NULL | Customized template content (user-modified). |
| `default_content` | TEXT | NOT NULL | Original default template (for reset). |
| `variables` | TEXT | NOT NULL | JSON array of supported variables (e.g., `{{ticket_id}}`, `{{hostname}}`). |
| `category` | TEXT | DEFAULT 'ticket' | Template category (ticket/vulnerability/system). |
| `is_active` | BOOLEAN | DEFAULT 1 | Whether template is active (1 = enabled, 0 = disabled). |
| `created_at` | DATETIME | DEFAULT CURRENT_TIMESTAMP | Creation timestamp. |
| `updated_at` | DATETIME | DEFAULT CURRENT_TIMESTAMP | Last modification timestamp. |

### `ticket_templates`

Stores ticket creation templates with pre-filled fields and workflows.

| Column | Type | Constraints | Description |
| --- | --- | --- | --- |
| `id` | INTEGER | PK AUTOINCREMENT | Template identifier. |
| `name` | TEXT | UNIQUE NOT NULL | Template name (e.g., 'critical_vulnerability_ticket'). |
| `description` | TEXT |  | Template purpose and usage notes. |
| `template_content` | TEXT | NOT NULL | Customized template content (JSON structure). |
| `default_content` | TEXT | NOT NULL | Original default template. |
| `variables` | TEXT | NOT NULL | JSON array of supported variables. |
| `category` | TEXT | DEFAULT 'ticket' | Template category. |
| `is_active` | BOOLEAN | DEFAULT 1 | Whether template is active. |
| `created_at` | DATETIME | DEFAULT CURRENT_TIMESTAMP | Creation timestamp. |
| `updated_at` | DATETIME | DEFAULT CURRENT_TIMESTAMP | Last modification timestamp. |

### `vulnerability_templates`

Stores vulnerability report templates for exports and notifications.

| Column | Type | Constraints | Description |
| --- | --- | --- | --- |
| `id` | INTEGER | PK AUTOINCREMENT | Template identifier. |
| `name` | TEXT | UNIQUE NOT NULL | Template name (e.g., 'executive_summary'). |
| `description` | TEXT |  | Template purpose and usage notes. |
| `template_content` | TEXT | NOT NULL | Customized template content. |
| `default_content` | TEXT | NOT NULL | Original default template. |
| `variables` | TEXT | NOT NULL | JSON array of supported variables (e.g., `{{cve}}`, `{{severity}}`, `{{vpr_score}}`). |
| `category` | TEXT | DEFAULT 'vulnerability' | Template category. |
| `is_active` | BOOLEAN | DEFAULT 1 | Whether template is active. |
| `created_at` | DATETIME | DEFAULT CURRENT_TIMESTAMP | Creation timestamp. |
| `updated_at` | DATETIME | DEFAULT CURRENT_TIMESTAMP | Last modification timestamp. |

**Variable Substitution**: Templates support dynamic variables like `{{ticket_id}}`, `{{hostname}}`, `{{cve}}`, `{{severity}}` which are replaced at runtime with actual values.

---

## Authentication & User Management *(v1.0.46+)*

### `users`

Stores user accounts with Argon2id password hashing and account lockout tracking.

| Column | Type | Constraints | Description |
| --- | --- | --- | --- |
| `id` | TEXT | PRIMARY KEY | User identifier (UUID or similar). |
| `username` | TEXT | UNIQUE NOT NULL | Login username. |
| `email` | TEXT |  | User email address (optional). |
| `password_hash` | TEXT | NOT NULL | Argon2id password hash (never stored plaintext). |
| `role` | TEXT | DEFAULT 'superadmin' | User role (superadmin/admin/user). |
| `is_active` | INTEGER | DEFAULT 1 | Account status (1 = active, 0 = disabled). |
| `last_login` | DATETIME |  | Last successful login timestamp. |
| `failed_attempts` | INTEGER | DEFAULT 0 | Consecutive failed login attempts (reset on success). |
| `failed_login_timestamp` | DATETIME |  | Most recent failed login timestamp (for lockout calculation). |
| `created_at` | DATETIME | DEFAULT CURRENT_TIMESTAMP | Account creation timestamp. |
| `updated_at` | DATETIME | DEFAULT CURRENT_TIMESTAMP | Last modification timestamp. |

**Account Lockout**: After 5 failed login attempts, account is locked for 15 minutes (enforced in `authService.js`, not database constraint).

**Password Security**: Passwords are hashed using Argon2id with timing-safe comparison to prevent timing attacks.

### `user_preferences`

Stores user-specific UI preferences for cross-device synchronization (HEX-138).

| Column | Type | Constraints | Description |
| --- | --- | --- | --- |
| `id` | INTEGER | PK AUTOINCREMENT | Preference record identifier. |
| `user_id` | TEXT | FK to `users.id`, NOT NULL | Associated user. |
| `preference_key` | TEXT | NOT NULL | Preference identifier (e.g., 'theme', 'dashboard_layout'). |
| `preference_value` | TEXT | NOT NULL | Preference value (JSON or plain text). |
| `created_at` | DATETIME | DEFAULT CURRENT_TIMESTAMP | Creation timestamp. |
| `updated_at` | DATETIME | DEFAULT CURRENT_TIMESTAMP | Last modification timestamp (auto-updated via trigger). |
| **UNIQUE** | (user_id, preference_key) |  | One value per user per preference key. |
| **FOREIGN KEY** | ON DELETE CASCADE |  | Preferences deleted when user is deleted. |

**Trigger**: `user_preferences_updated_at` automatically updates `updated_at` timestamp on modification.

**Common Preferences**:
- `theme`: 'light' or 'dark'
- `dashboard_layout`: JSON configuration
- `default_page`: Starting page after login
- `table_preferences`: AG-Grid column state

---

## Security & Audit *(v1.0.67 - Migration 012, HEX-254)*

HexTrackr provides encrypted audit logging for compliance and security monitoring.

### `audit_logs`

Stores encrypted audit trail entries with automatic retention policy enforcement.

| Column | Type | Constraints | Description |
| --- | --- | --- | --- |
| `id` | INTEGER | PK AUTOINCREMENT | Audit log entry identifier. |
| `category` | TEXT | NOT NULL | Log category (auth, data, system, security). |
| `timestamp` | DATETIME | DEFAULT CURRENT_TIMESTAMP, NOT NULL | Event timestamp. |
| `user_id` | TEXT |  | User identifier (if user-initiated action). |
| `username` | TEXT |  | Username (denormalized for query performance). |
| `ip_address` | TEXT |  | Source IP address. |
| `user_agent` | TEXT |  | Client user agent string. |
| `request_id` | TEXT |  | Request correlation identifier. |
| `encrypted_message` | BLOB | NOT NULL | AES-256-GCM encrypted log message. |
| `encrypted_data` | BLOB |  | AES-256-GCM encrypted additional context (JSON). |
| `encryption_iv` | BLOB | NOT NULL | Initialization vector for decryption. |
| `created_at` | DATETIME | DEFAULT CURRENT_TIMESTAMP | Record creation timestamp. |

**Indexes**:
- `idx_audit_logs_category` (category)
- `idx_audit_logs_timestamp` (timestamp DESC)
- `idx_audit_logs_user_id` (user_id)
- `idx_audit_logs_category_timestamp` (category, timestamp DESC)
- `idx_audit_logs_user_timestamp` (user_id, timestamp DESC)
- `idx_audit_logs_request_id` (request_id)

**Encryption**: All log messages and data are encrypted at rest using AES-256-GCM with per-record initialization vectors. Encryption keys are stored in `audit_log_config` and never logged.

**Retention Policy**: Logs older than `retention_days` (default: 30) are automatically purged by background cleanup job.

### `audit_log_config`

Singleton configuration table for audit logging system (enforced via `CHECK (id = 1)` constraint).

| Column | Type | Constraints | Description |
| --- | --- | --- | --- |
| `id` | INTEGER | PRIMARY KEY, CHECK (id = 1) | Always 1 (singleton pattern). |
| `encryption_key` | BLOB | NOT NULL | AES-256 encryption key (32 bytes). |
| `key_created_at` | DATETIME | DEFAULT CURRENT_TIMESTAMP | Encryption key creation timestamp. |
| `key_rotated_at` | DATETIME |  | Last key rotation timestamp. |
| `retention_days` | INTEGER | DEFAULT 30 | Log retention period in days. |
| `last_cleanup_at` | DATETIME |  | Last retention cleanup timestamp. |
| `total_logs_written` | INTEGER | DEFAULT 0 | Lifetime audit log count. |
| `total_logs_purged` | INTEGER | DEFAULT 0 | Lifetime purged log count. |
| `created_at` | DATETIME | DEFAULT CURRENT_TIMESTAMP | Record creation timestamp. |
| `updated_at` | DATETIME | DEFAULT CURRENT_TIMESTAMP | Last modification timestamp. |

**Singleton Pattern**: Only one row can exist (enforced by `CHECK (id = 1)`). Prevents accidental creation of multiple encryption key records.

**Key Management**: Encryption keys are randomly generated on first initialization and can be rotated via admin interface. Key rotation re-encrypts all existing logs.

---

## Junction Tables

### `ticket_vulnerabilities`

Many-to-many relationship between tickets and (legacy) `vulnerabilities` (pre-rollover) or conceptually `vulnerabilities_current` for future adaptation.

| Column | Type | Constraints | Description |
| --- | --- | --- | --- |
| `id` | INTEGER | PK AUTOINCREMENT | Link row id. |
| `ticket_id` | TEXT | FK to `tickets.id` | Associated ticket. |
| `vulnerability_id` | INTEGER | FK | Associated vulnerability (references vulnerabilities.id for legacy compatibility). |
| `relationship_type` | TEXT | DEFAULT 'remediation' | Relationship semantics. |
| `notes` | TEXT |  | Free-form link-specific notes. |

**Note on Sites & Locations**: The `tickets` table includes TEXT fields (`site`, `site_id`, `location`, `location_id`) for flexible site/location tracking. Dedicated normalization tables (`sites`, `locations`) are **not currently implemented** but may be added in future versions for structured taxonomy.

## Indexes

To ensure efficient querying, **68 indexes** are automatically created during database initialization (v1.1.0 baseline). This includes 67 user-created indexes plus 1 auto-generated trigger index (`sqlite_autoindex_user_preferences_1`).

### Index Inventory by Table (v1.1.0)

**vulnerability_snapshots** (5 indexes):
- `idx_snapshots_scan_date` - Query by date
- `idx_snapshots_hostname` - Query by hostname
- `idx_snapshots_severity` - Query by severity
- `idx_snapshots_enhanced_key` - Enhanced deduplication
- `idx_snapshots_cve` - KEV integration lookups

**vulnerabilities_current** (9 indexes):
- `idx_current_unique_key` - Primary deduplication key
- `idx_current_scan_date` - Query by scan date
- `idx_current_enhanced_unique_key` - Enhanced deduplication
- `idx_current_lifecycle_scan` - Composite (lifecycle_state, scan_date)
- `idx_current_confidence_tier` - Composite (confidence_score, dedup_tier)
- `idx_current_active_severity` - Composite (lifecycle_state, severity)
- `idx_current_resolved_date` - Resolution tracking
- `idx_current_cve` - KEV integration lookups
- `idx_current_vendor` - Vendor filtering (HEX-101)

**vulnerability_staging** (4 indexes):
- `idx_staging_import_id` - Import batch tracking
- `idx_staging_processed` - Processing status
- `idx_staging_batch_id` - Batch processing
- `idx_staging_unprocessed_batch` - Composite (processed, batch_id)

**tickets** (10 indexes):
- `idx_tickets_status` - Status filtering
- `idx_tickets_site` - Site grouping
- `idx_tickets_location` - Location filtering
- `idx_tickets_xt` - XT number lookups
- Plus 6 auto-created indexes for: date_submitted, date_due, hexagon_ticket, service_now_ticket, site_id, location_id

**vulnerabilities (legacy)** (4 indexes):
- `idx_vulnerabilities_hostname` - Hostname lookups
- `idx_vulnerabilities_severity` - Severity filtering
- `idx_vulnerabilities_cve` - CVE lookups
- `idx_vulnerabilities_import` - Import batch tracking

**vendor_daily_totals** (3 indexes):
- `idx_vendor_daily_scan_date` - Date-based queries
- `idx_vendor_daily_vendor` - Vendor-based queries
- `idx_vendor_daily_composite` - Composite (vendor, scan_date)

**kev_status** (4 indexes):
- `idx_kev_status_cve_id` - CVE lookups
- `idx_kev_status_date_added` - Chronological queries
- `idx_kev_status_due_date` - Deadline tracking
- `idx_kev_status_ransomware` - Partial index (WHERE known_ransomware_use = 1)

**Vendor Intelligence** (7 indexes):
- Cisco advisories: `idx_cisco_advisories_cve`, `idx_cisco_advisories_synced`
- Cisco fixed versions: `idx_cisco_fixed_versions_cve`, `idx_cisco_fixed_versions_os_family`, `idx_cisco_fixed_versions_composite`
- Palo Alto advisories: `idx_palo_advisories_cve`, `idx_palo_advisories_synced`

**Security & Audit** (6 indexes):
- `idx_audit_logs_category` - Category filtering
- `idx_audit_logs_timestamp` - Chronological queries
- `idx_audit_logs_user_id` - User activity tracking
- `idx_audit_logs_category_timestamp` - Composite (category, timestamp DESC)
- `idx_audit_logs_user_timestamp` - Composite (user_id, timestamp DESC)
- `idx_audit_logs_request_id` - Request correlation

**Template Tables** (9 indexes total):
- Email templates: `idx_email_templates_name`, `idx_email_templates_active`, `idx_email_templates_category`
- Ticket templates: `idx_ticket_templates_name`, `idx_ticket_templates_category`, `idx_ticket_templates_active`
- Vulnerability templates: `idx_vulnerability_templates_name`, `idx_vulnerability_templates_category`, `idx_vulnerability_templates_active`

**Authentication & User Management** (4 indexes):
- Users: `idx_users_username`, `idx_users_email`
- User preferences: `idx_user_preferences_user_id`, `idx_user_preferences_key`

**Other Indexes** (3 indexes):
- `idx_ticket_vulns_ticket` - Junction table (ticket_id)
- `idx_ticket_vulns_vuln` - Junction table (vulnerability_id)
- `idx_sync_metadata_type_time` - Composite (sync_type, sync_time DESC)

> Note: The legacy `vulnerabilities` table remains ONLY for backup/export endpoints (`/api/backup/vulnerabilities`, `/api/backup/all`). All imports and dashboards use the rollover trio (`vulnerability_snapshots`, `vulnerabilities_current`, `vulnerability_daily_totals`).

---

## Modal Aggregation Architecture (v1.0.6+)

### Universal Aggregation Keys

The modal system uses strategic field selection for data aggregation:

| Modal Type | Aggregation Key | Purpose | Example |
| --- | --- | --- | --- |
| Vulnerability Modal | `description` field | Groups all devices affected by same vulnerability | CVE-2017-3881 shows 24 affected devices |
| Device Modal | `hostname` field (normalized) | Groups all vulnerabilities affecting same device | grimesnswan03 shows 12 vulnerabilities |

### Data Relationships

**Vulnerability -> Device Aggregation**:

- Query: `SELECT * FROM vulnerabilities_current WHERE description = ?`
- Groups by hostname to show unique devices affected
- Displays device count, IP addresses, and affected services

**Device -> Vulnerability Aggregation**:

- Query: `SELECT * FROM vulnerabilities_current WHERE hostname = ?`
- Groups by description/CVE to show unique vulnerabilities
- Displays vulnerability count, severity distribution, and VPR totals

### Aggregation Benefits

- **Complete Visibility**: Users see full impact scope (all 24 devices for a CVE, all 12 vulnerabilities for a device)
- **Data Consistency**: Aggregation keys ensure reliable grouping across different data imports
- **Performance**: Indexed fields (`description`, `hostname`) enable efficient aggregation queries
- **Modal State Management**: Proper Bootstrap integration prevents modal layering issues

---

## Unique Key Generation Logic (Summary)

`unique_key = normalize(hostname)|CVE` when CVE present; fallback to `normalize(hostname)|plugin_id|truncated(description)`; final fallback uses description + VPR score. Host normalization collapses domain suffixes and validates IP addresses.

---

## Schema Drift Notes

- `schema.sql` no longer reflects live tables (kept for historical reference only).
- Runtime adds columns (`vendor`, `vulnerability_date`, `state`, `import_date`, `notes`) to legacy `vulnerabilities` table if missing.
- Two UNIQUE indexes (`idx_vulnerabilities_unique_scan` / `_v2`) ensure per-scan dedupe in legacy ingestion path.
- Future work: unify attribute naming (`vendor_reference` vs `vendor`).

---

## Planned Enhancements

| Area | Planned Change |
| ---- | -------------- |
| Normalization | Resolve duplication between `vendor` / `vendor_reference`. |
| Integrity | Add CHECK constraints for severity enumeration. |
| Archival | Partition snapshots by month (optional) when size grows. |
| Migration | Deprecate legacy `vulnerabilities` table after full UI refactor. |
| Index Tuning | Add composite index (severity, scan_date) if trend queries increase. |

---

The above reflects the database as inspected on the current build date. Regenerate this document after structural changes or migration scripts are introduced.

---

*Last Updated: 2025-10-23 | Application Version: v1.1.3 | Schema Baseline: v1.1.0 | Audit: DOCS-64*
