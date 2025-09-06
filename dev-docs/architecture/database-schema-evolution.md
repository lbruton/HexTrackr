# Database Schema Evolution - HexTrackr

## Overview

HexTrackr's database architecture has evolved to support high-performance CSV imports through a staging table pattern. This document details the current schema and performance optimizations.

## Schema Architecture

### Core Tables

#### vulnerabilities_current

Primary table for active vulnerability data with deduplication.

```sql
CREATE TABLE vulnerabilities_current (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  import_id INTEGER NOT NULL,
  scan_date TEXT NOT NULL,
  hostname TEXT NOT NULL,
  ip_address TEXT,
  cve TEXT,
  severity TEXT NOT NULL DEFAULT 'Low',
  vpr_score REAL DEFAULT 0.0,
  cvss_score REAL DEFAULT 0.0,
  first_seen TEXT,
  last_seen TEXT,
  plugin_id INTEGER,
  plugin_name TEXT,
  description TEXT,
  solution TEXT,
  vendor_reference TEXT,
  vendor TEXT,
  enhanced_unique_key TEXT GENERATED ALWAYS AS (
    CASE 
      WHEN cve IS NOT NULL AND cve != '' 
      THEN lower(replace(hostname, ' ', '')) || '|' || cve
      ELSE lower(replace(hostname, ' ', '')) || '|' || plugin_id || '|' || substr(description, 1, 50)
    END
  ) STORED,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);
```

## Deduplication Strategy

- **Primary Key**: `enhanced_unique_key` (generated column)
- **Logic**: `normalizeHostname(hostname) + CVE` OR `hostname + plugin_id + description_prefix`
- **Performance**: Indexed for O(log n) lookups during rollover processing

#### vulnerability_staging (NEW - v1.0.4)

High-performance temporary table for CSV import processing.

```sql
CREATE TABLE vulnerability_staging (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  import_id INTEGER NOT NULL,
  hostname TEXT NOT NULL,
  ip_address TEXT,
  cve TEXT,
  severity TEXT NOT NULL DEFAULT 'Low',
  vpr_score REAL DEFAULT 0.0,
  cvss_score REAL DEFAULT 0.0,
  plugin_id INTEGER,
  plugin_name TEXT,
  description TEXT,
  solution TEXT,
  vendor_reference TEXT,
  vendor TEXT,
  
  -- Batch processing control
  batch_id INTEGER,
  processed INTEGER DEFAULT 0,
  processed_at TEXT,
  
  -- Lifecycle management
  lifecycle_state TEXT DEFAULT 'staging',
  
  -- Raw CSV data for flexibility
  raw_csv_data TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);
```

## Performance Features

- **Bulk Insert**: Optimized for high-volume CSV imports
- **Batch Processing**: Configurable batch size (default: 1000 rows)
- **Lifecycle Management**: Temporary storage, auto-cleanup after processing
- **Vendor Flexibility**: Supports multiple CSV formats via raw_csv_data

### Historical Tables

#### vulnerability_snapshots

Complete historical record of all vulnerability imports.

```sql
CREATE TABLE vulnerability_snapshots (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  import_id INTEGER NOT NULL,
  scan_date TEXT NOT NULL,
  hostname TEXT NOT NULL,
  ip_address TEXT,
  cve TEXT,
  severity TEXT NOT NULL DEFAULT 'Low',
  vpr_score REAL DEFAULT 0.0,
  cvss_score REAL DEFAULT 0.0,
  first_seen TEXT,
  last_seen TEXT,
  plugin_id INTEGER,
  plugin_name TEXT,
  description TEXT,
  solution TEXT,
  vendor_reference TEXT,
  vendor TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);
```

#### vulnerability_daily_totals

Aggregated statistics for trend analysis.

```sql
CREATE TABLE vulnerability_daily_totals (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  scan_date TEXT NOT NULL UNIQUE,
  critical_count INTEGER DEFAULT 0,
  high_count INTEGER DEFAULT 0,
  medium_count INTEGER DEFAULT 0,
  low_count INTEGER DEFAULT 0,
  total_count INTEGER DEFAULT 0,
  total_devices INTEGER DEFAULT 0,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);
```

### Metadata Tables

#### vulnerability_imports

Audit trail for all CSV imports.

```sql
CREATE TABLE vulnerability_imports (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  filename TEXT NOT NULL,
  import_date TEXT NOT NULL,
  row_count INTEGER DEFAULT 0,
  vendor TEXT,
  file_size INTEGER DEFAULT 0,
  processing_time REAL DEFAULT 0.0,
  raw_headers TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);
```

## Performance Indexes

### Current Tables

```sql
-- Primary deduplication index
CREATE INDEX idx_current_enhanced_unique_key ON vulnerabilities_current (enhanced_unique_key);

-- Query optimization indexes
CREATE INDEX idx_current_hostname ON vulnerabilities_current (hostname);
CREATE INDEX idx_current_severity ON vulnerabilities_current (severity);
CREATE INDEX idx_current_scan_date ON vulnerabilities_current (scan_date);
```

### Staging Table (High-Performance)

```sql
-- Batch processing indexes
CREATE INDEX idx_staging_import_id ON vulnerability_staging (import_id);
CREATE INDEX idx_staging_processed ON vulnerability_staging (processed);
CREATE INDEX idx_staging_batch_id ON vulnerability_staging (batch_id);

-- Composite index for batch processing queries
CREATE INDEX idx_staging_unprocessed_batch ON vulnerability_staging (processed, batch_id);
```

### Historical Tables (2)

```sql
-- Time-series analysis
CREATE INDEX idx_snapshots_scan_date ON vulnerability_snapshots (scan_date);
CREATE INDEX idx_snapshots_import_id ON vulnerability_snapshots (import_id);

-- Daily aggregations
CREATE INDEX idx_daily_totals_scan_date ON vulnerability_daily_totals (scan_date);
```

## Performance Architecture

### Staging Table Pattern

#### 1. Bulk Insert Phase

```javascript
// High-performance bulk insert using prepared statements
const stagingInsertSQL = `
  INSERT INTO vulnerability_staging (
    import_id, hostname, ip_address, cve, severity, vpr_score, cvss_score,
    plugin_id, plugin_name, description, solution, vendor_reference, vendor
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`;

const stmt = db.prepare(stagingInsertSQL);
// Bulk insert all rows without individual processing
```

#### 2. Batch Processing Phase

```javascript
// Process staging records in configurable batches
const batchSize = process.env.BATCH_SIZE || 1000;
const batchQuery = `
  SELECT * FROM vulnerability_staging 
  WHERE import_id = ? AND processed = 0 
  ORDER BY id 
  LIMIT ${batchSize}
`;
```

#### 3. Cleanup Phase

```javascript
// Remove processed staging records
db.run("DELETE FROM vulnerability_staging WHERE import_id = ?", [importId]);
```

### Performance Metrics

#### Legacy vs Staging Comparison

| Metric | Legacy Processing | Staging Table |
|--------|------------------|---------------|
| 10K rows | ~45-60 seconds | ~8-12 seconds |
| Memory usage | High (row-by-row) | Low (batch processing) |
| Rollover complexity | O(n) per row | O(n) per batch |
| Error recovery | Single row failure | Batch-level recovery |

#### Batch Size Optimization

- **Default**: 1000 rows per batch
- **Small datasets**: Batch size may equal total rows
- **Large datasets**: Multiple batches with progress tracking
- **Memory constraint**: Configurable via environment variable

### Rollover Processing Evolution

#### Enhanced Unique Key Generation

```sql
-- Generated column for consistent deduplication
enhanced_unique_key TEXT GENERATED ALWAYS AS (
  CASE 
    WHEN cve IS NOT NULL AND cve != '' 
    THEN lower(replace(hostname, ' ', '')) || '|' || cve
    ELSE lower(replace(hostname, ' ', '')) || '|' || plugin_id || '|' || substr(description, 1, 50)
  END
) STORED
```

#### Deduplication Logic

1. **Primary**: `normalizeHostname(hostname)` + CVE
2. **Fallback**: `hostname` + `plugin_id` + `description` (first 50 chars)
3. **Normalization**: Lowercase, space removal for hostname consistency

### Vendor-Specific CSV Handling

#### Supported Vendors

- **Tenable**: Standard Nessus CSV export format
- **Cisco**: Security Advisory format with `cisco-sa-*` identifiers
- **Generic**: Flexible mapping via header detection

#### Dynamic Schema Mapping

```javascript
function mapVulnerabilityRow(row) {
  return {
    hostname: row['Host'] || row['Hostname'] || row['Device'],
    ip_address: row['IP Address'] || row['IP'] || row['Host IP'],
    cve: row['CVE'] || row['CVE ID'] || extractCVE(row),
    severity: normalizeSeverity(row['Severity'] || row['Risk']),
    // ... dynamic field mapping
  };
}
```

## Migration Patterns

### Schema Evolution Process

1. **Backward Compatibility**: New columns with DEFAULT values
2. **Index Creation**: Non-blocking index creation with IF NOT EXISTS
3. **Data Migration**: Optional migration for existing data
4. **Feature Flags**: Gradual rollout of new functionality

### Version Tracking

- **Schema Version**: Tracked in application metadata
- **Migration Scripts**: Automated schema updates on startup
- **Rollback Support**: Schema downgrades for emergency rollback

## Monitoring and Maintenance

### Performance Monitoring

- **Import Time Tracking**: Total processing time per CSV
- **Batch Performance**: Rows processed per second per batch
- **Memory Usage**: Staging table size monitoring
- **Index Effectiveness**: Query plan analysis

### Maintenance Tasks

- **Daily**: Cleanup orphaned staging records
- **Weekly**: VACUUM and ANALYZE on main tables
- **Monthly**: Archive old snapshot data
- **Quarterly**: Index fragmentation analysis

## Future Enhancements

### Planned Optimizations

- **Parallel Batch Processing**: Multiple worker threads for large imports
- **Compressed Storage**: LZ4 compression for historical snapshots
- **Partitioning**: Date-based partitioning for vulnerability_snapshots
- **Materialized Views**: Pre-computed aggregations for dashboard queries

### Integration Improvements

- **Real-time Sync**: WebSocket-based live updates during imports
- **API Streaming**: Chunked responses for large exports
- **Backup Integration**: Point-in-time recovery for staging table failures
