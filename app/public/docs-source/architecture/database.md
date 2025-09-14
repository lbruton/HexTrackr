# Database Architecture

HexTrackr uses a file-based SQLite 3 database as its primary data store. This document provides an updated overview of the current (live) database architecture, including rollover vulnerability tables, normalization references, and key data flows.

## Engine

- **Type**: SQLite 3
- **Location**: `data/hextrackr.db`
- **Initialization**: The database is initialized by the `scripts/init-database.js` script.

---

## Entity Relationship Diagram (Current)

The diagram below reflects the active tables used by the rollover ingestion pipeline and ticketing system. The legacy `vulnerabilities` table still exists (for backup/export compatibility) but is not part of the primary analytics path.

```mermaid
erDiagram
    vulnerability_imports ||--o{ vulnerability_snapshots : batches
    vulnerability_imports ||--o{ vulnerabilities_current : source
    vulnerability_imports ||--o{ vulnerability_daily_totals : aggregates
    tickets ||--o{ ticket_vulnerabilities : links
    vulnerabilities_current ||--o{ ticket_vulnerabilities : links
    sites ||--o{ tickets : contextual
    locations ||--o{ tickets : contextual

    vulnerability_imports {
        INTEGER id PK
        TEXT filename
        TEXT import_date
        INTEGER row_count
        TEXT vendor
        INTEGER file_size
        INTEGER processing_time
        TEXT raw_headers
        DATETIME created_at
    }

    vulnerability_snapshots {
        INTEGER id PK
        INTEGER import_id FK
        TEXT scan_date
        TEXT hostname
        TEXT ip_address
        TEXT cve
        TEXT severity
        REAL vpr_score
        REAL cvss_score
        TEXT first_seen
        TEXT last_seen
        TEXT plugin_id
        TEXT plugin_name
        TEXT description
        TEXT solution
        TEXT vendor_reference
        TEXT vulnerability_date
        TEXT state
        TEXT unique_key
    }

    vulnerabilities_current {
        INTEGER id PK
        INTEGER import_id FK
        TEXT scan_date
        TEXT hostname
        TEXT ip_address
        TEXT cve
        TEXT severity
        REAL vpr_score
        REAL cvss_score
        TEXT first_seen
        TEXT last_seen
        TEXT plugin_id
        TEXT plugin_name
        TEXT description
        TEXT solution
        TEXT vendor_reference
        TEXT vendor
        TEXT vulnerability_date
        TEXT state
        TEXT unique_key UK
        TEXT lifecycle_state
        TEXT resolved_date
        DATETIME created_at
        DATETIME updated_at
    }

    vulnerability_daily_totals {
        INTEGER id PK
        TEXT scan_date UK
        INTEGER critical_count
        REAL critical_total_vpr
        INTEGER high_count
        REAL high_total_vpr
        INTEGER medium_count
        REAL medium_total_vpr
        INTEGER low_count
        REAL low_total_vpr
        INTEGER total_vulnerabilities
        REAL total_vpr
        INTEGER resolved_count
        INTEGER reopened_count
        DATETIME created_at
        DATETIME updated_at
    }

    sites {
        INTEGER id PK
        TEXT code UK
        TEXT name
    }

    locations {
        INTEGER id PK
        TEXT code UK
        TEXT name
    }

    tickets {
        TEXT id PK
        TEXT date_submitted
        TEXT date_due
        TEXT hexagon_ticket
        TEXT service_now_ticket
        TEXT location
        TEXT devices
        TEXT supervisor
        TEXT tech
        TEXT status
        TEXT notes
        TEXT attachments
        TEXT site
        TEXT xt_number
        INTEGER site_id FK
        INTEGER location_id FK
        TEXT created_at
        TEXT updated_at
    }

    ticket_vulnerabilities {
        INTEGER id PK
        TEXT ticket_id FK
        INTEGER vulnerability_id FK
    }
```

---

## Data Flows

### Vulnerability CSV Import (Rollover Pipeline)

This flow shows how a CSV file upload is processed and stored in the database using the rollover architecture.

```mermaid
sequenceDiagram
    participant User
    participant API as POST /api/vulnerabilities/import
    participant DB as SQLite

    User->>API: Upload csvFile
    API->>DB: INSERT into vulnerability_imports
    API->>DB: INSERT into vulnerability_snapshots (append-only)
    API->>DB: UPSERT logic in vulnerabilities_current (implemented as SELECT + conditional INSERT/UPDATE in code)
    API->>DB: DELETE stale rows from vulnerabilities_current
    API->>DB: INSERT OR REPLACE vulnerability_daily_totals (aggregates)
    API-->>User: { success, importId, ... }
```

### Ticket Creation / Update

This flow shows the simple process of creating a new ticket.

```mermaid
sequenceDiagram
    participant User
    participant API as POST /api/tickets
    participant DB as SQLite

    User->>API: { ticketData }
    API->>DB: INSERT (or UPDATE for modifications) into tickets
    API-->>User: { success, id }

---

## Legacy Table Notice

The original `vulnerabilities` table remains in the database to support existing backup endpoints (`/api/backup/vulnerabilities`, `/api/backup/all`). This table is used ONLY for exports - all new imports and analytics use the rollover architecture. New analytics and UI panels rely exclusively on the rollover trio:

- `vulnerability_snapshots` (historical log)
- `vulnerabilities_current` (deduplicated active set)
- `vulnerability_daily_totals` (aggregated trends)

Migration plan (tracked in roadmap) will eventually deprecate the legacy ingestion path and unify export logic on the rollover schema.

---

## Lifecycle State Management

The `vulnerabilities_current` table uses a `lifecycle_state` column to track vulnerability status:

- **active**: Currently detected vulnerability
- **resolved**: Vulnerability no longer detected (marked with resolved_date)
- **reopened**: Previously resolved vulnerability that reappeared

This enables accurate tracking of vulnerability remediation and regression.

---

## Index Overview

| Table | Index | Purpose |
| ----- | ----- | ------- |
| vulnerability_snapshots | scan_date, hostname, severity | Historical filtering & trends |
| vulnerabilities_current | unique_key, scan_date | Fast dedupe lookups & date filtering |
| vulnerability_daily_totals | scan_date (UNIQUE) | Idempotent aggregates |
| tickets | multiple (location, status, date_submitted, date_due, external refs) | UI filtering & reporting |
| sites / locations | code (UNIQUE) | Lookup by code |

---

## Staging Tables

HexTrackr uses staging tables to process new data before it is moved into the production tables. This allows for data validation and transformation without affecting the live data.

- `vulnerabilities_staging`: Used for staging new vulnerability data.

For more information on the data lifecycle, see the [Data Lifecycle and Rollover Mechanism](./data-lifecycle.md) documentation.

---

## Database Migrations

Database migrations are handled automatically by the application. For more information on the migration process, see the [Database Migrations](../development/database-migrations.md) documentation.

---

## Data Integrity & Future Enhancements

| Area | Current | Planned |
| ---- | ------- | ------- |
| Severity values | Free text | Add CHECK constraint / normalization table |
| Vendor fields | vendor_reference + vendor | Consolidate and document mapping rules |
| Orphan cleanup | Manual (app logic) | ON DELETE CASCADE for future RDBMS migration |
| Performance | Basic single-file SQLite | WAL mode + scheduled VACUUM (future) |

---

This document reflects the schema as of the current release cycle. Re-run architecture analysis after structural migrations or table additions.
```
