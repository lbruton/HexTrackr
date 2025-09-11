# Data Model: HexTrackr Master - Vulnerability Management Platform

**Spec**: [spec.md](./spec.md) | **Date**: 2025-09-10 | **Version**: v1.0.12

## Entity Definitions

### Vulnerability

Primary entity representing security findings from scanners.

**Fields**:

- `id` (INTEGER PRIMARY KEY): Auto-incrementing identifier
- `hostname` (TEXT NOT NULL): Affected device hostname
- `ip_address` (TEXT): Device IP address
- `cve` (TEXT): CVE identifier(s), comma-separated for multiple
- `title` (TEXT): Vulnerability title/name
- `severity` (TEXT): Critical, High, Medium, Low, Info
- `cvss_score` (REAL): CVSS numeric score (0.0-10.0)
- `plugin_id` (TEXT): Scanner-specific plugin identifier
- `plugin_family` (TEXT): Scanner plugin category
- `port` (INTEGER): Affected port number
- `protocol` (TEXT): TCP, UDP, ICMP
- `description` (TEXT): Detailed vulnerability description
- `solution` (TEXT): Remediation instructions
- `synopsis` (TEXT): Brief summary
- `first_seen` (TEXT): ISO date first detected
- `last_seen` (TEXT): ISO date last observed
- `state` (TEXT): active, fixed, resurfaced
- `vendor` (TEXT): Tenable, Cisco, Qualys
- `confidence_score` (REAL): Deduplication confidence (0.0-1.0)
- `import_session_id` (INTEGER): Foreign key to import session
- `created_at` (TEXT): Record creation timestamp
- `updated_at` (TEXT): Last modification timestamp

**Indexes**:

- `idx_vulnerability_hostname` (hostname)
- `idx_vulnerability_severity` (severity)
- `idx_vulnerability_cve` (cve)
- `idx_vulnerability_state` (state)
- `idx_vulnerability_composite` (vendor, plugin_id, hostname)
- `idx_vulnerability_import` (import_session_id)

### Device

Network infrastructure components being monitored.

**Fields**:

- `id` (INTEGER PRIMARY KEY): Auto-incrementing identifier
- `hostname` (TEXT UNIQUE NOT NULL): Device hostname
- `ip_address` (TEXT): Primary IP address
- `location` (TEXT): Physical or logical location
- `device_type` (TEXT): Server, Switch, Router, Firewall, etc.
- `operating_system` (TEXT): OS identification
- `criticality` (TEXT): Critical, High, Medium, Low
- `owner` (TEXT): Responsible team/person
- `vulnerability_count` (INTEGER): Total active vulnerabilities
- `critical_count` (INTEGER): Critical severity count
- `high_count` (INTEGER): High severity count
- `security_score` (REAL): Calculated security posture (0-100)
- `last_scan_date` (TEXT): Most recent scan timestamp
- `first_seen` (TEXT): Initial discovery date
- `last_updated` (TEXT): Last modification timestamp

**Indexes**:

- `idx_device_hostname` (hostname)
- `idx_device_ip` (ip_address)
- `idx_device_criticality` (criticality)
- `idx_device_score` (security_score)

### Ticket

Remediation work orders across ticketing systems.

**Fields**:

- `id` (INTEGER PRIMARY KEY): Auto-incrementing identifier
- `title` (TEXT NOT NULL): Ticket title
- `description` (TEXT): Detailed description
- `servicenow_id` (TEXT): ServiceNow ticket number
- `hexagon_id` (TEXT): Hexagon ticket number
- `status` (TEXT): open, in_progress, resolved, closed
- `priority` (TEXT): P1, P2, P3, P4
- `assignee` (TEXT): Assigned team/person
- `device_list` (TEXT): JSON array of affected devices
- `vulnerability_list` (TEXT): JSON array of vulnerability IDs
- `markdown_content` (TEXT): Generated markdown documentation
- `export_package` (TEXT): Path to ZIP file
- `created_at` (TEXT): Creation timestamp
- `updated_at` (TEXT): Last modification
- `resolved_at` (TEXT): Resolution timestamp

**Indexes**:

- `idx_ticket_servicenow` (servicenow_id)
- `idx_ticket_hexagon` (hexagon_id)
- `idx_ticket_status` (status)
- `idx_ticket_priority` (priority)

### ImportSession

Tracking for CSV import operations.

**Fields**:

- `id` (INTEGER PRIMARY KEY): Auto-incrementing identifier
- `filename` (TEXT NOT NULL): Uploaded file name
- `file_size` (INTEGER): File size in bytes
- `vendor` (TEXT): Detected vendor format
- `import_date` (TEXT): Import timestamp
- `record_count` (INTEGER): Total records in file
- `processed_count` (INTEGER): Successfully processed
- `duplicate_count` (INTEGER): Deduplicated records
- `error_count` (INTEGER): Failed records
- `new_vulnerabilities` (INTEGER): Newly discovered
- `updated_vulnerabilities` (INTEGER): Updated existing
- `processing_time` (REAL): Seconds to process
- `throughput` (REAL): Records per second
- `status` (TEXT): pending, processing, completed, failed
- `error_log` (TEXT): Error messages if any
- `created_by` (TEXT): User who initiated import

**Indexes**:

- `idx_import_date` (import_date)
- `idx_import_vendor` (vendor)
- `idx_import_status` (status)

## Database Schema

### Table Creation Order

1. import_sessions (no dependencies)
2. devices (no dependencies)  
3. vulnerabilities (depends on import_sessions)
4. tickets (references vulnerabilities and devices)

### Relationships

- Vulnerabilities → ImportSession (many-to-one)
- Vulnerabilities → Device (many-to-one via hostname)
- Tickets → Vulnerabilities (many-to-many via JSON)
- Tickets → Devices (many-to-many via JSON)

### Constraints

- Unique constraint on device hostname
- Check constraint on severity values
- Check constraint on CVSS scores (0.0-10.0)
- Check constraint on confidence scores (0.0-1.0)
- Foreign key from vulnerabilities to import_sessions

## Validation Rules

### Vulnerability Validation

- Hostname required and non-empty
- Severity must be in allowed values
- CVSS score between 0.0 and 10.0
- State must be active, fixed, or resurfaced
- Vendor must be recognized format
- Confidence score between 0.0 and 1.0

### Device Validation

- Hostname required and unique
- Criticality in allowed values
- Security score between 0 and 100
- Counts must be non-negative

### Ticket Validation

- Title required and non-empty
- Status in allowed values
- Priority in P1-P4 range
- Device list valid JSON array
- Vulnerability list valid JSON array

### Import Session Validation

- Filename required
- File size positive integer
- Vendor in supported list
- Counts non-negative
- Processing time positive

## Performance Constraints

### Index Strategy

- 52 total indexes across 4 tables
- Composite indexes for common queries
- Covering indexes to avoid table lookups
- Partial indexes for active records only

### Query Optimization

- Prepared statements for all queries
- Batch inserts with transactions
- Connection pooling with 10 connections
- Query timeout of 30 seconds
- WAL mode for concurrent reads

### Data Limits

- Maximum 100MB import file size
- Maximum 25,000 records per import
- Maximum 50 concurrent connections
- Maximum 1000 API requests per 15 minutes

## State Transitions

### Vulnerability States

```
null → active (first detection)
active → fixed (not seen in latest scan)
fixed → resurfaced (seen again after fix)
active → active (still present)
```

### Ticket States

```
null → open (creation)
open → in_progress (work started)
in_progress → resolved (work complete)
resolved → closed (verified)
any → open (reopened)
```

### Import States

```
null → pending (file uploaded)
pending → processing (import started)
processing → completed (success)
processing → failed (error)
```

## Data Retention

### Retention Policies

- Vulnerabilities: Indefinite (compliance requirement)
- Devices: Indefinite (asset tracking)
- Tickets: 2 years after closure
- Import Sessions: 1 year
- Audit Logs: 7 years (compliance)

### Archival Strategy

- Move closed tickets >2 years to archive table
- Compress import sessions >1 year
- Partition vulnerabilities by year
- Backup before archival operations

## Integration Mappings

### CSV Import Mappings

**Tenable Format** (29 columns):

- Column 0 → hostname
- Column 4 → cve
- Column 3 → severity
- Column 2 → plugin_id
- Column 6 → port

**Cisco Format**:

- Different column positions
- Vendor-specific severity mapping
- Additional metadata preservation

**Qualys Format**:

- Unique identifier system
- QID to CVE mapping
- Custom severity calculation

### API Response Mappings

- Database fields → JSON camelCase
- Timestamps → ISO 8601 format
- Arrays → JSON stringified in database
- Nulls → Omitted from responses

---
*Data model validated in production v1.0.12 with 25,000+ vulnerabilities*
