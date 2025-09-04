# Database Architecture

HexTrackr uses a file-based SQLite 3 database as its primary data store. This document provides a high-level overview of the database architecture, focusing on relationships and data flows.

**Note**: The definitive and most up-to-date information on the database schema, including table structures and column descriptions, can be found in the [Data Model documentation](./data-model.md).

## Engine

- **Type**: SQLite 3
- **Location**: `data/hextrackr.db`
- **Initialization**: The database is initialized by the `scripts/init-database.js` script.

---

## Entity Relationship Diagram

This diagram illustrates the relationships between the main tables in the database.

```mermaid
erDiagram
    vulnerability_imports ||--o{ vulnerability_snapshots : contains
    tickets ||--o{ ticket_vulnerabilities : links
    vulnerabilities_current ||--o{ ticket_vulnerabilities : links

    vulnerability_imports {
        INTEGER id PK
        TEXT filename
        TEXT import_date
        INTEGER row_count
    }

    vulnerability_snapshots {
        INTEGER id PK
        INTEGER import_id FK
        TEXT scan_date
        TEXT hostname
        TEXT cve
        TEXT severity
        REAL vpr_score
        TEXT unique_key
    }

    vulnerabilities_current {
        INTEGER id PK
        TEXT unique_key UK
        TEXT hostname
        TEXT cve
        TEXT severity
        REAL vpr_score
        TEXT last_seen
    }

    tickets {
        TEXT id PK
        TEXT xt_number
        TEXT date_submitted
        TEXT status
    }

    ticket_vulnerabilities {
        INTEGER id PK
        TEXT ticket_id FK
        INTEGER vulnerability_id FK
    }
```

---

## Data Flows

### Vulnerability CSV Import

This flow shows how a CSV file upload is processed and stored in the database using the rollover architecture.

```mermaid
sequenceDiagram
    participant User
    participant API as POST /api/vulnerabilities/import
    participant DB as SQLite

    User->>API: Upload csvFile
    API->>DB: INSERT into vulnerability_imports
    API->>DB: INSERT into vulnerability_snapshots
    API->>DB: INSERT or UPDATE vulnerabilities_current
    API-->>User: { success, importId, ... }
```

### Ticket Creation

This flow shows the simple process of creating a new ticket.

```mermaid
sequenceDiagram
    participant User
    participant API as POST /api/tickets
    participant DB as SQLite

    User->>API: { ticketData }
    API->>DB: INSERT into tickets
    API-->>User: { success, id }
```
