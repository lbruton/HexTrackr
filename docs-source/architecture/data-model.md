# HexTrackr Data Model

This document provides a definitive overview of the HexTrackr database schema. The single source of truth for the schema is the `scripts/init-database.js` script, which creates and initializes the database. The `server.js` file also performs idempotent `ALTER TABLE` operations at runtime to add columns, ensuring backward compatibility.

## Database Engine

- **Engine**: SQLite 3
- **Database File**: `data/hextrackr.db`

---

## Core Tables

### `tickets`

Stores all ticketing information. The schema has evolved from an initial simple structure to accommodate more detailed fields.

| Column | Type | Description |
| --- | --- | --- |
| `id` | TEXT | **Primary Key**. A unique identifier for the ticket (e.g., "TICK-123"). |
| `xt_number` | TEXT | A human-readable ticket number (e.g., "XT001"). Can be used as an ID if `id` is null. |
| `date_submitted` | TEXT | The date the ticket was submitted (ISO 8601 format). |
| `date_due` | TEXT | The required completion date for the ticket (ISO 8601 format). |
| `hexagon_ticket` | TEXT | The ticket number from the Hexagon system. |
| `service_now_ticket` | TEXT | The ticket number from ServiceNow. |
| `location` | TEXT | The primary location or site for the ticket. |
| `devices` | TEXT | A JSON string representing an array of device hostnames. |
| `supervisor` | TEXT | The name of the responsible supervisor. |
| `tech` | TEXT | The name of the assigned technician. |
| `status` | TEXT | The current workflow status (e.g., "Open", "Overdue", "Completed"). |
| `notes` | TEXT | Free-form text for additional notes. |
| `attachments` | TEXT | A JSON string representing an array of attached file metadata. |
| `created_at` | TEXT | Timestamp of when the ticket was created. |
| `updated_at` | TEXT | Timestamp of the last modification. |
| `site` | TEXT | The broader site or region for the ticket. |
| `site_id` | INTEGER | A foreign key to a potential `sites` table (not currently implemented). |
| `location_id` | INTEGER | A foreign key to a potential `locations` table (not currently implemented). |

### `vulnerability_imports`

Tracks each CSV import event, providing an audit trail for all vulnerability data.

| Column | Type | Description |
| --- | --- | --- |
| `id` | INTEGER | **Primary Key**. Auto-incrementing ID for the import batch. |
| `filename` | TEXT | The original name of the imported CSV file. |
| `import_date` | TEXT | The timestamp when the import occurred. |
| `row_count` | INTEGER | The total number of rows processed from the file. |
| `vendor` | TEXT | The source of the vulnerability data (e.g., "cisco", "tenable"). |
| `file_size` | INTEGER | The size of the imported file in bytes. |
| `processing_time` | INTEGER | The time taken to process the import in milliseconds. |
| `raw_headers` | TEXT | A JSON string of the original CSV header row. |
| `created_at` | DATETIME | The timestamp when the import record was created. |

---

## Vulnerability Rollover Architecture

HexTrackr uses a "rollover" architecture to manage vulnerability data over time. This allows for accurate daily trending and historical analysis. It consists of three main tables.

### `vulnerabilities_current`

This table holds the **current state** of all active vulnerabilities from the most recent scan for each unique vulnerability.

| Column | Type | Description |
| --- | --- | --- |
| `id` | INTEGER | **Primary Key**. |
| `unique_key` | TEXT | **UNIQUE**. A composite key to deduplicate vulnerabilities (e.g., `hostname|cve`). |
| `import_id` | INTEGER | Foreign key to `vulnerability_imports.id`. |
| `scan_date` | TEXT | The date of the scan this vulnerability appeared in. |
| `hostname` | TEXT | The hostname of the affected asset. |
| `ip_address` | TEXT | The IP address of the asset. |
| `cve` | TEXT | The CVE identifier (e.g., "CVE-2023-12345"). |
| `severity` | TEXT | The severity level (e.g., "Critical", "High"). |
| `vpr_score` | REAL | The Vulnerability Priority Rating (VPR) score. |
| `cvss_score` | REAL | The Common Vulnerability Scoring System (CVSS) score. |
| `first_seen` | TEXT | The date the vulnerability was first observed. |
| `last_seen` | TEXT | The date the vulnerability was last observed. |
| `plugin_id` | TEXT | The ID of the scanner plugin that detected the vulnerability. |
| `plugin_name` | TEXT | The name of the scanner plugin. |
| `description` | TEXT | A description of the vulnerability. |
| `solution` | TEXT | The recommended solution or remediation. |
| `vendor` | TEXT | The vendor of the affected product. |
| `vulnerability_date` | TEXT | The date the vulnerability was published. |
| `state` | TEXT | The current state of the vulnerability (e.g., "open"). |

### `vulnerability_snapshots`

This table is an append-only log of **all vulnerabilities from every scan**. It serves as the historical record for trend analysis.

*This table shares the same schema as `vulnerabilities_current` but does not have a unique constraint on `unique_key`, allowing multiple entries for the same vulnerability over time.*

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

---

## Junction Tables

### `ticket_vulnerabilities`

This table creates a many-to-many relationship between tickets and vulnerabilities.

| Column | Type | Description |
| --- | --- | --- |
| `id` | INTEGER | **Primary Key**. |
| `ticket_id` | TEXT | Foreign key to `tickets.id`. |
| `vulnerability_id` | INTEGER | Foreign key to `vulnerabilities_current.id`. |
| `relationship_type` | TEXT | The nature of the link (e.g., "remediation", "investigation"). |
| `notes` | TEXT | Notes specific to this ticket-vulnerability link. |

## Indexes

To ensure efficient querying, the following indexes are created:

- `idx_vulnerabilities_hostname` on `vulnerabilities_current(hostname)`
- `idx_vulnerabilities_severity` on `vulnerabilities_current(severity)`
- `idx_vulnerabilities_cve` on `vulnerabilities_current(cve)`
- `idx_snapshots_scan_date` on `vulnerability_snapshots(scan_date)`
- `idx_current_unique_key` on `vulnerabilities_current(unique_key)`
