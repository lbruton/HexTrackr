# HexTrackr Data Model

This document provides a definitive overview of the HexTrackr database schema. The primary bootstrap is `scripts/init-database.js`; however, the live schema evolves further at runtime via idempotent `ALTER TABLE` and index creation logic inside `server.js` and migration code executed during imports. The authoritative state is therefore the **live SQLite schema** (captured below) rather than the historical `schema.sql` file (now outdated and retained only for legacy reference).

**Schema Summary** (v1.0.54):
- **15 Core Tables**: Vulnerabilities (4), Tickets (2), KEV (2), Templates (3), Authentication (2), Import/Staging (2)
- **37+ Indexes**: Performance-optimized queries on critical fields
- **4-Tier Deduplication**: Enhanced unique key generation with confidence scoring
- **KEV Integration**: CISA Known Exploited Vulnerabilities catalog synchronization
- **Template System**: Email, ticket, and vulnerability report templates with variable substitution
- **Authentication**: Argon2id password hashing with account lockout protection

## Database Engine

- **Engine**: SQLite 3
- **Database File**: `data/hextrackr.db`

---

## Core Tables

### `tickets`

Stores all ticketing information. This table has **indexes for query performance** on dates, status, site codes, and external ticket numbers. It has evolved from a minimal design to a richer structure with relational hooks into `sites` and `locations`.

| Column | Type | Constraints | Description |
| --- | --- | --- | --- |
| `id` | TEXT | PK | Stable unique identifier supplied by UI (string, not auto-increment). |
| `date_submitted` | TEXT | NOT NULL | Submission date (ISO date). |
| `date_due` | TEXT | NOT NULL | Due date (ISO date). |
| `hexagon_ticket` | TEXT | Indexed | External Hexagon reference. |
| `service_now_ticket` | TEXT | Indexed | External ServiceNow reference. |
| `location` | TEXT | NOT NULL, Indexed | Human readable location label. |
| `devices` | TEXT |  | Semicolon-delimited device names preserving boot order (imports accept JSON arrays and are normalised). |
| `supervisor` | TEXT |  | Supervisor name. |
| `tech` | TEXT |  | Assigned technician. |
| `status` | TEXT | DEFAULT 'Open', Indexed | Workflow status (Open, Completed, etc.). |
| `notes` | TEXT |  | Free form notes. |
| `attachments` | TEXT |  | JSON array of attachment metadata. |
| `created_at` | TEXT | NOT NULL | Creation timestamp (string). |
| `updated_at` | TEXT | NOT NULL | Last update timestamp. |
| `site` | TEXT | Indexed | Higher-level site grouping. |
| `xt_number` | TEXT | Indexed | Alternate human-friendly number (used when `id` absent in legacy imports). |
| `site_id` | INTEGER | FK to `sites.id`, Indexed | Optional normalized site reference. |
| `location_id` | INTEGER | FK to `locations.id`, Indexed | Optional normalized location reference. |

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
| `lifecycle_state` | TEXT |  | Logical state (active/resolved/reopened). |
| `resolved_date` | TEXT |  | Date when marked as resolved. |
| `created_at` | DATETIME | DEFAULT CURRENT_TIMESTAMP | Insert timestamp. |
| `updated_at` | DATETIME |  | Last update timestamp. |
| `unique_key` | TEXT | UNIQUE | Composite key (see Rollover section). |

### `vulnerability_snapshots`

This table is an append-only log of **all vulnerabilities from every scan**. It serves as the historical record for trend analysis.

*Shares the same columns as `vulnerabilities_current` (except `unique_key` not unique) and acts as an append-only log for every scan ingestion.*

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

### `sites` & `locations`

Reference/normalization tables to allow structured site & location taxonomy.

| Table | Column | Type | Constraints | Description |
| ----- | ------ | ---- | ----------- | ----------- |
| `sites` | `id` | INTEGER | PK AUTOINCREMENT | Row id. |
|  | `code` | VARCHAR(50) | UNIQUE NOT NULL | Short site code. |
|  | `name` | VARCHAR(255) | NOT NULL | Descriptive name. |
|  | `description` | TEXT |  | Optional details. |
|  | `created_at` | DATETIME | DEFAULT CURRENT_TIMESTAMP | Creation time. |
|  | `updated_at` | DATETIME | DEFAULT CURRENT_TIMESTAMP | Last update. |
| `locations` | `id` | INTEGER | PK AUTOINCREMENT | Row id. |
|  | `code` | VARCHAR(50) | UNIQUE NOT NULL | Location code. |
|  | `name` | VARCHAR(255) | NOT NULL | Descriptive label. |
|  | `description` | TEXT |  | Optional details. |
|  | `created_at` | DATETIME | DEFAULT CURRENT_TIMESTAMP | Creation time. |
|  | `updated_at` | DATETIME | DEFAULT CURRENT_TIMESTAMP | Last update. |

## Indexes

To ensure efficient querying, the following indexes are created:

### Index Inventory

| Purpose | Index |
| ------- | ----- |
| Snapshot query by date | `idx_snapshots_scan_date` |
| Snapshot query by hostname | `idx_snapshots_hostname` |
| Snapshot query by severity | `idx_snapshots_severity` |
| Current lookup by unique key | `idx_current_unique_key` |
| Current query by scan date | `idx_current_scan_date` |
| Tickets filtering | Multiple (see tickets section) |
| Legacy vulnerabilities (pre-rollover) | `idx_vulnerabilities_hostname`, `idx_vulnerabilities_severity`, `idx_vulnerabilities_cve`, `idx_vulnerabilities_import` |

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
