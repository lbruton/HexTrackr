# Database Schema Standardization - Technical Research

## Architecture Decisions

### Primary Approach: Unified Staging Table Framework

**Decision:** Standardize the proven staging table pattern across all HexTrackr modules for consistent bulk operations.

**Rationale:**

- Vulnerability import system achieved 99%+ performance improvement (8,022ms → 65ms for 12,542 records)
- Atomic operations prevent partial data states during bulk operations
- Enables consistent rollback capabilities across all modules
- Reduces complexity by standardizing bulk operation patterns

**Framework Design:**

```sql
-- Template for all staging operations
CREATE TEMP TABLE staging_{module_name} AS 
SELECT * FROM {target_table} WHERE 1=0;

-- Standard staging operation pattern
INSERT INTO staging_{module_name} SELECT ... FROM source;
-- Validation and transformation logic here
INSERT OR REPLACE INTO {target_table} SELECT * FROM staging_{module_name};
DROP TABLE staging_{module_name};
```

**Alternatives Considered:**

- **Direct CRUD Operations**: Rejected due to performance implications on large datasets
- **ORM-Based Abstraction**: Rejected due to SQL flexibility requirements
- **NoSQL Approach**: Rejected due to ACID requirements and existing SQLite investment

**Technology Stack:**

- **Database Engine**: SQLite 3.x with WAL (Write-Ahead Logging) mode
- **Connection Pooling**: Native SQLite connections with mutex protection
- **Migration Framework**: Custom SQL-based migrations with version tracking
- **Performance Monitoring**: Built-in EXPLAIN QUERY PLAN analysis

### Index Strategy Standardization

**Decision:** Implement consistent indexing naming conventions and automated index creation patterns.

**Naming Convention:**

- Primary indexes: `pk_{table_name}`
- Unique indexes: `idx_{table_name}_{column}_unique`
- Performance indexes: `idx_{table_name}_{column}`
- Composite indexes: `idx_{table_name}_{col1}_{col2}`

**Standard Index Types:**

```sql
-- Primary key (automatic)
CREATE TABLE {table_name} (
    id INTEGER PRIMARY KEY AUTOINCREMENT
);

-- Unique business key
CREATE UNIQUE INDEX idx_{table}_unique_key ON {table}(unique_key);

-- Lookup performance
CREATE INDEX idx_{table}_{lookup_field} ON {table}({lookup_field});

-- Composite queries  
CREATE INDEX idx_{table}_{field1}_{field2} ON {table}({field1}, {field2});
```

## Integration Analysis

### HexTrackr Module Dependencies

- **Vulnerability Management**: Primary reference implementation with proven patterns
- **Device Tracking**: Requires hostname and IP address indexing standardization
- **Reporting Engine**: Depends on aggregation table patterns for performance
- **Import/Export Systems**: All bulk operations will use standardized staging pattern

### Cross-Module Schema Consistency

**Standardized Column Patterns:**

```sql
-- Timestamp fields (consistent across all tables)
created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
last_seen DATE NOT NULL,

-- Audit fields (for trackable entities)
created_by TEXT,
modified_by TEXT,
version INTEGER DEFAULT 1,

-- Soft delete pattern (where applicable)
deleted_at DATETIME NULL,
is_active INTEGER DEFAULT 1
```

**Foreign Key Standards:**

- All foreign keys follow `{referenced_table}_id` naming
- Foreign key constraints enabled with CASCADE options specified
- Junction tables use composite naming: `{table1}_{table2}_mapping`

### Data Migration Strategy

1. **Schema Discovery Phase**: Audit all existing tables and indexes
2. **Gap Analysis Phase**: Identify inconsistencies and missing patterns  
3. **Migration Planning**: Create incremental migration scripts
4. **Validation Phase**: Test migrations on data copies
5. **Production Rollout**: Staged deployment with rollback capability

## Security Requirements

### Data Integrity Constraints

- **Referential Integrity**: All foreign key relationships enforced at database level
- **Business Rule Validation**: Check constraints for critical business logic
- **Data Type Enforcement**: Strict column typing with appropriate constraints

**Example Constraint Patterns:**

```sql
-- Business rule enforcement
ALTER TABLE vulnerabilities_current 
ADD CONSTRAINT chk_severity 
CHECK (severity IN ('Critical', 'High', 'Medium', 'Low', 'Info'));

-- Data quality constraints  
ALTER TABLE devices
ADD CONSTRAINT chk_ip_format
CHECK (ip_address REGEXP '^[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}$');
```

### Audit Trail Standardization

**Universal Audit Pattern:**

```sql
-- Audit table template for all major entities
CREATE TABLE {entity}_audit (
    audit_id INTEGER PRIMARY KEY AUTOINCREMENT,
    entity_id INTEGER NOT NULL,
    operation TEXT NOT NULL CHECK (operation IN ('INSERT', 'UPDATE', 'DELETE')),
    changed_fields TEXT, -- JSON of changed fields
    old_values TEXT,     -- JSON of previous values
    new_values TEXT,     -- JSON of new values  
    changed_by TEXT,
    changed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (entity_id) REFERENCES {entity}(id)
);
```

### Access Control Schema

- **Role-Based Permissions**: Standardized `user_roles` and `permissions` tables
- **Resource-Level Security**: Entity-specific access control where required
- **Audit Logging**: Complete audit trail for all schema modifications

## Performance Targets

### Query Performance Standards

- **Simple Lookups**: <50ms for single record retrieval
- **List Queries**: <200ms for paginated results (50 records per page)
- **Aggregation Queries**: <500ms for summary statistics
- **Bulk Operations**: <5ms per record for staging table operations

### Index Performance Optimization

**Proven Index Patterns:**

```sql
-- High-performance vulnerability lookups (from existing implementation)
CREATE INDEX idx_vuln_current_hostname ON vulnerabilities_current(hostname);
CREATE INDEX idx_vuln_current_severity ON vulnerabilities_current(severity);
CREATE INDEX idx_vuln_current_last_seen ON vulnerabilities_current(last_seen);

-- Composite indexes for common query patterns
CREATE INDEX idx_vuln_severity_date ON vulnerabilities_current(severity, last_seen);
```

### Database Size Management

- **Aggregation Tables**: Pre-computed summaries for reporting performance
- **Data Retention**: Automated cleanup of historical data beyond retention period
- **Archive Strategy**: Move old records to archive tables with compressed storage

**Aggregation Table Example:**

```sql  
-- Daily summary pattern (from vulnerability system)
CREATE TABLE {entity}_daily_totals (
    date TEXT PRIMARY KEY,
    total_count INTEGER DEFAULT 0,
    critical_count INTEGER DEFAULT 0,
    high_count INTEGER DEFAULT 0,
    medium_count INTEGER DEFAULT 0,
    low_count INTEGER DEFAULT 0,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### Memory and Storage Optimization

- **WAL Mode**: Write-Ahead Logging for concurrent read/write performance
- **Page Size**: Optimized 4KB page size for SSD storage
- **Cache Size**: Configured for available system memory (default: 64MB)

## Risk Assessment

### Technical Risks

**High Priority:**

1. **Migration Complexity**: Large schema changes risk data corruption or extended downtime
   - **Mitigation**: Incremental migrations with full database backups
   - **Testing**: Complete migration testing on production data copies
   - **Rollback Plan**: Automated rollback scripts for each migration phase

2. **Performance Regression**: Schema changes could impact existing query performance  
   - **Mitigation**: Performance benchmarking before and after each change
   - **Monitoring**: Query performance alerts for regressions >20%
   - **Optimization**: Emergency index creation procedures

**Medium Priority:**  
3. **Index Overhead**: Too many indexes could impact write performance

- **Mitigation**: Index usage monitoring and automated cleanup of unused indexes
- **Guidelines**: Maximum 5 indexes per table unless performance justified

4. **Data Consistency**: Cross-module schema changes could break existing functionality
   - **Mitigation**: Comprehensive integration testing suite
   - **Coordination**: Staged rollout with module-by-module validation

### Operational Risks

**Medium Priority:**
5. **Storage Growth**: Standardized audit trails could significantly increase database size

- **Mitigation**: Automated archive and cleanup procedures
- **Monitoring**: Storage usage alerts and growth trend analysis

6. **Backup Complexity**: More complex schema requires enhanced backup/restore procedures
   - **Mitigation**: Automated backup testing and restoration validation
   - **Documentation**: Updated backup/restore procedures

### Migration Recovery Procedures

**Schema Rollback Strategy:**

1. **Immediate Rollback**: Restore from pre-migration backup (RTO: <30 minutes)
2. **Selective Rollback**: Revert specific schema changes while preserving data
3. **Forward Fix**: Apply corrective migrations to resolve issues
4. **Data Recovery**: Restore specific tables or records from backup archives

**Validation Procedures:**

- Pre-migration: Full database integrity check
- Post-migration: Automated validation of all foreign key relationships
- Performance validation: Benchmark test suite execution
- Application validation: Critical path testing for all modules

---

*This research analysis supports the implementation planning for HexTrackr Specification 015: Database Schema Standardization*
