# Database Schema Standardization - Data Model

## Entity Definitions

### Schema Metadata Entity

```typescript
// Branded types for schema management security
type SchemaVersion = string & { readonly __brand: unique symbol };
type TableName = string & { readonly __brand: unique symbol };
type IndexName = string & { readonly __brand: unique symbol };

// Schema metadata tracking
interface SchemaMetadata {
    readonly id: string;                    // UUID v4 schema identifier
    readonly version: SchemaVersion;        // Semantic version (e.g., "1.2.3")
    readonly description: string;           // Human-readable change description
    readonly migration_scripts: MigrationScript[];
    readonly rollback_scripts: RollbackScript[];
    readonly created_at: Date;
    readonly created_by: string;
    readonly applied_at?: Date;
    readonly rollback_at?: Date;
    readonly status: MigrationStatus;
    readonly performance_impact: PerformanceImpact;
}

enum MigrationStatus {
    PENDING = 'Pending',
    IN_PROGRESS = 'In Progress',
    COMPLETED = 'Completed', 
    FAILED = 'Failed',
    ROLLED_BACK = 'Rolled Back'
}

interface MigrationScript {
    readonly sequence: number;              // Execution order
    readonly script_type: ScriptType;
    readonly sql_content: string;
    readonly expected_duration_ms: number;
    readonly rollback_sql: string;
    readonly validation_query: string;      // Post-execution validation
}

enum ScriptType {
    CREATE_TABLE = 'CREATE_TABLE',
    ALTER_TABLE = 'ALTER_TABLE',
    CREATE_INDEX = 'CREATE_INDEX',
    DROP_INDEX = 'DROP_INDEX',
    DATA_MIGRATION = 'DATA_MIGRATION',
    CONSTRAINT_ADD = 'CONSTRAINT_ADD',
    CONSTRAINT_DROP = 'CONSTRAINT_DROP'
}

interface PerformanceImpact {
    readonly estimated_downtime_ms: number;
    readonly storage_change_mb: number;
    readonly query_performance_impact: number; // -100 to +100 percentage
    readonly memory_usage_change_mb: number;
}
```

### Table Standardization Entity

```typescript
// Standardized table structure
interface StandardTable {
    readonly name: TableName;
    readonly module: ModuleType;
    readonly purpose: TablePurpose;
    readonly columns: StandardColumn[];
    readonly indexes: StandardIndex[];
    readonly constraints: TableConstraint[];
    readonly audit_config: AuditConfiguration;
    readonly retention_policy: RetentionPolicy;
    readonly performance_tier: PerformanceTier;
}

enum ModuleType {
    VULNERABILITY = 'vulnerability',
    DEVICE = 'device', 
    REPORTING = 'reporting',
    USER_MANAGEMENT = 'user_management',
    AUDIT = 'audit',
    CONFIGURATION = 'configuration'
}

enum TablePurpose {
    PRIMARY_DATA = 'primary_data',      // Main business entities
    STAGING = 'staging',                // Temporary processing tables
    AUDIT_TRAIL = 'audit_trail',        // Historical change tracking
    AGGREGATION = 'aggregation',        // Pre-computed summaries
    CONFIGURATION = 'configuration',     // System configuration
    MAPPING = 'mapping'                 // Junction/relationship tables
}

interface StandardColumn {
    readonly name: string;
    readonly data_type: SQLiteDataType;
    readonly is_nullable: boolean;
    readonly default_value?: string;
    readonly constraints: ColumnConstraint[];
    readonly description: string;
    readonly business_purpose: string;
}

enum SQLiteDataType {
    INTEGER = 'INTEGER',
    TEXT = 'TEXT', 
    REAL = 'REAL',
    BLOB = 'BLOB',
    DATE = 'TEXT',                      // ISO 8601 format
    DATETIME = 'TEXT',                  // ISO 8601 format
    JSON = 'TEXT',                      // JSON with validation
    BOOLEAN = 'INTEGER'                 // 0/1 values
}

interface ColumnConstraint {
    readonly type: ConstraintType;
    readonly definition: string;
    readonly error_message: string;
}

enum ConstraintType {
    PRIMARY_KEY = 'PRIMARY KEY',
    FOREIGN_KEY = 'FOREIGN KEY',
    UNIQUE = 'UNIQUE',
    CHECK = 'CHECK',
    NOT_NULL = 'NOT NULL'
}
```

### Index Standardization Entity  

```typescript
// Standardized indexing patterns
interface StandardIndex {
    readonly name: IndexName;
    readonly table_name: TableName;
    readonly columns: IndexColumn[];
    readonly index_type: IndexType;
    readonly purpose: IndexPurpose;
    readonly estimated_size_mb: number;
    readonly query_patterns: QueryPattern[];
    readonly maintenance_cost: MaintenanceCost;
}

enum IndexType {
    UNIQUE = 'UNIQUE',
    COMPOSITE = 'COMPOSITE',
    PARTIAL = 'PARTIAL',
    EXPRESSION = 'EXPRESSION'
}

enum IndexPurpose {
    PRIMARY_KEY = 'primary_key',        // Table primary key
    FOREIGN_KEY = 'foreign_key',        // Foreign key relationships
    QUERY_OPTIMIZATION = 'query_opt',   // Performance optimization
    UNIQUENESS = 'uniqueness',          // Business uniqueness
    SORTING = 'sorting'                 // ORDER BY optimization
}

interface IndexColumn {
    readonly column_name: string;
    readonly sort_order: SortOrder;
    readonly collation?: string;
}

enum SortOrder {
    ASC = 'ASC',
    DESC = 'DESC'
}

interface QueryPattern {
    readonly description: string;
    readonly frequency: QueryFrequency;
    readonly example_query: string;
    readonly performance_benefit: number;   // Estimated improvement %
}

enum QueryFrequency {
    VERY_HIGH = 'very_high',    // >1000/day
    HIGH = 'high',              // 100-1000/day  
    MEDIUM = 'medium',          // 10-100/day
    LOW = 'low'                 // <10/day
}

interface MaintenanceCost {
    readonly insert_overhead_ms: number;
    readonly update_overhead_ms: number;
    readonly storage_overhead_mb: number;
    readonly rebuild_time_estimate_ms: number;
}
```

### Audit Trail Standardization

```typescript
// Universal audit pattern for all major entities
interface AuditRecord {
    readonly audit_id: string;          // UUID v4 audit identifier
    readonly table_name: TableName;
    readonly entity_id: string;         // Primary key of audited entity
    readonly operation: AuditOperation;
    readonly changed_fields: string[];  // JSON array of changed field names
    readonly old_values: Record<string, any>; // JSON of previous values
    readonly new_values: Record<string, any>; // JSON of new values
    readonly change_summary: string;    // Human-readable change description
    readonly changed_by: string;        // User identifier
    readonly changed_at: Date;
    readonly client_ip?: string;
    readonly user_agent?: string;
    readonly session_id?: string;
}

enum AuditOperation {
    INSERT = 'INSERT',
    UPDATE = 'UPDATE', 
    DELETE = 'DELETE',
    BULK_INSERT = 'BULK_INSERT',
    BULK_UPDATE = 'BULK_UPDATE',
    BULK_DELETE = 'BULK_DELETE'
}

interface AuditConfiguration {
    readonly enabled: boolean;
    readonly track_all_changes: boolean;
    readonly sensitive_fields: string[];     // Fields requiring extra protection
    readonly retention_days: number;
    readonly compression_enabled: boolean;
    readonly notification_rules: NotificationRule[];
}

interface NotificationRule {
    readonly field_pattern: string;         // Regex pattern for field names
    readonly operation_types: AuditOperation[];
    readonly notification_method: NotificationMethod;
    readonly recipients: string[];
}

enum NotificationMethod {
    EMAIL = 'email',
    WEBHOOK = 'webhook',
    LOG_ALERT = 'log_alert'
}
```

## Database Schema

### Schema Management Tables

```sql
-- Schema versioning and migration tracking
CREATE TABLE schema_migrations (
    id TEXT PRIMARY KEY,
    version TEXT NOT NULL UNIQUE CHECK(version GLOB '[0-9].*.[0-9].*.[0-9]*'),
    description TEXT NOT NULL CHECK(LENGTH(description) <= 500),
    migration_scripts TEXT NOT NULL CHECK(json_valid(migration_scripts)),
    rollback_scripts TEXT NOT NULL CHECK(json_valid(rollback_scripts)), 
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    created_by TEXT NOT NULL CHECK(LENGTH(created_by) <= 100),
    applied_at TEXT,
    rollback_at TEXT,
    status TEXT NOT NULL DEFAULT 'Pending' CHECK(status IN ('Pending', 'In Progress', 'Completed', 'Failed', 'Rolled Back')),
    performance_impact TEXT CHECK(json_valid(performance_impact)),
    execution_log TEXT
);

CREATE INDEX idx_migrations_version ON schema_migrations(version);
CREATE INDEX idx_migrations_status ON schema_migrations(status);
CREATE INDEX idx_migrations_applied ON schema_migrations(applied_at) WHERE applied_at IS NOT NULL;

-- Table metadata registry
CREATE TABLE table_registry (
    table_name TEXT PRIMARY KEY CHECK(LENGTH(table_name) <= 64),
    module TEXT NOT NULL CHECK(module IN ('vulnerability', 'device', 'reporting', 'user_management', 'audit', 'configuration')),
    purpose TEXT NOT NULL CHECK(purpose IN ('primary_data', 'staging', 'audit_trail', 'aggregation', 'configuration', 'mapping')),
    description TEXT NOT NULL CHECK(LENGTH(description) <= 1000),
    owner_team TEXT NOT NULL CHECK(LENGTH(owner_team) <= 100),
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    last_modified TEXT NOT NULL DEFAULT (datetime('now')),
    row_count_estimate INTEGER DEFAULT 0,
    storage_size_mb REAL DEFAULT 0.0,
    audit_enabled INTEGER NOT NULL DEFAULT 1,
    retention_days INTEGER CHECK(retention_days > 0),
    performance_tier TEXT CHECK(performance_tier IN ('high', 'medium', 'low')),
    documentation_url TEXT
);

CREATE INDEX idx_table_module ON table_registry(module);
CREATE INDEX idx_table_purpose ON table_registry(purpose);

-- Index management registry
CREATE TABLE index_registry (
    index_name TEXT PRIMARY KEY CHECK(LENGTH(index_name) <= 64),
    table_name TEXT NOT NULL CHECK(LENGTH(table_name) <= 64),
    columns TEXT NOT NULL CHECK(json_valid(columns)),
    index_type TEXT NOT NULL CHECK(index_type IN ('UNIQUE', 'COMPOSITE', 'PARTIAL', 'EXPRESSION')),
    purpose TEXT NOT NULL CHECK(purpose IN ('primary_key', 'foreign_key', 'query_opt', 'uniqueness', 'sorting')),
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    last_analyzed TEXT,
    usage_count INTEGER DEFAULT 0,
    estimated_size_mb REAL DEFAULT 0.0,
    maintenance_cost TEXT CHECK(json_valid(maintenance_cost)),
    query_patterns TEXT CHECK(json_valid(query_patterns)),
    FOREIGN KEY(table_name) REFERENCES table_registry(table_name)
);

CREATE INDEX idx_index_table ON index_registry(table_name);
CREATE INDEX idx_index_purpose ON index_registry(purpose);
CREATE INDEX idx_index_usage ON index_registry(usage_count);
```

### Standardized Table Templates

```sql
-- Template 1: Primary Data Table with Standard Columns
CREATE TABLE template_primary_data (
    -- Standard primary key
    id TEXT PRIMARY KEY CHECK(LENGTH(id) = 36), -- UUID v4 format
    
    -- Standard audit columns (required for all primary tables)
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    created_by TEXT CHECK(LENGTH(created_by) <= 100),
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_by TEXT CHECK(LENGTH(updated_by) <= 100),
    version INTEGER NOT NULL DEFAULT 1,
    
    -- Standard soft delete pattern (optional)
    deleted_at TEXT,
    is_active INTEGER NOT NULL DEFAULT 1 CHECK(is_active IN (0, 1)),
    
    -- Business-specific columns go here
    -- ...
    
    -- Standard constraints
    CHECK(created_at <= updated_at),
    CHECK((deleted_at IS NULL AND is_active = 1) OR (deleted_at IS NOT NULL AND is_active = 0))
);

-- Standard indexes for primary data template
CREATE INDEX idx_template_created_at ON template_primary_data(created_at);
CREATE INDEX idx_template_active ON template_primary_data(is_active) WHERE is_active = 1;
CREATE INDEX idx_template_deleted ON template_primary_data(deleted_at) WHERE deleted_at IS NOT NULL;

-- Template 2: Staging Table with Standard Structure  
CREATE TABLE template_staging (
    staging_id TEXT PRIMARY KEY CHECK(LENGTH(staging_id) = 36),
    batch_id TEXT NOT NULL CHECK(LENGTH(batch_id) = 36),
    source_line INTEGER,
    validation_status TEXT DEFAULT 'pending' CHECK(validation_status IN ('pending', 'valid', 'invalid')),
    validation_errors TEXT CHECK(json_valid(validation_errors)),
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    
    -- Business-specific columns
    -- ...
    
    -- Standard staging constraints
    UNIQUE(batch_id, source_line)
);

-- Standard staging indexes
CREATE INDEX idx_template_staging_batch ON template_staging(batch_id);
CREATE INDEX idx_template_staging_status ON template_staging(validation_status);

-- Template 3: Audit Trail with Standard Structure
CREATE TABLE template_audit (
    audit_id TEXT PRIMARY KEY CHECK(LENGTH(audit_id) = 36),
    table_name TEXT NOT NULL CHECK(LENGTH(table_name) <= 64),
    entity_id TEXT NOT NULL CHECK(LENGTH(entity_id) <= 64),
    operation TEXT NOT NULL CHECK(operation IN ('INSERT', 'UPDATE', 'DELETE', 'BULK_INSERT', 'BULK_UPDATE', 'BULK_DELETE')),
    changed_fields TEXT CHECK(json_valid(changed_fields)),
    old_values TEXT CHECK(json_valid(old_values)),
    new_values TEXT CHECK(json_valid(new_values)),
    change_summary TEXT CHECK(LENGTH(change_summary) <= 1000),
    changed_by TEXT NOT NULL CHECK(LENGTH(changed_by) <= 100),
    changed_at TEXT NOT NULL DEFAULT (datetime('now')),
    client_ip TEXT CHECK(LENGTH(client_ip) <= 45), -- IPv6 max length
    user_agent TEXT CHECK(LENGTH(user_agent) <= 500),
    session_id TEXT CHECK(LENGTH(session_id) <= 128)
);

-- Standard audit indexes
CREATE INDEX idx_template_audit_table_entity ON template_audit(table_name, entity_id);
CREATE INDEX idx_template_audit_changed_at ON template_audit(changed_at);
CREATE INDEX idx_template_audit_user ON template_audit(changed_by);
CREATE INDEX idx_template_audit_operation ON template_audit(operation);

-- Template 4: Aggregation Table for Performance
CREATE TABLE template_aggregation (
    id TEXT PRIMARY KEY CHECK(LENGTH(id) = 36),
    aggregation_key TEXT NOT NULL CHECK(LENGTH(aggregation_key) <= 200),
    aggregation_date TEXT NOT NULL,
    
    -- Standard aggregation columns
    record_count INTEGER NOT NULL DEFAULT 0,
    sum_values REAL DEFAULT 0.0,
    avg_values REAL DEFAULT 0.0,
    min_value REAL,
    max_value REAL,
    
    -- Metadata
    last_calculated TEXT NOT NULL DEFAULT (datetime('now')),
    calculation_duration_ms INTEGER,
    source_tables TEXT CHECK(json_valid(source_tables)),
    
    UNIQUE(aggregation_key, aggregation_date)
);

-- Standard aggregation indexes  
CREATE INDEX idx_template_agg_key ON template_aggregation(aggregation_key);
CREATE INDEX idx_template_agg_date ON template_aggregation(aggregation_date);
CREATE INDEX idx_template_agg_calculated ON template_aggregation(last_calculated);
```

### Standardized Naming Conventions

```sql
-- Naming convention enforcement triggers
CREATE TRIGGER enforce_table_naming
BEFORE INSERT ON table_registry
BEGIN
    -- Tables must follow pattern: {module}_{purpose}_{entity}
    -- Examples: vuln_primary_current, device_staging_import, audit_trail_changes
    SELECT CASE
        WHEN NEW.table_name NOT GLOB '*_*_*' THEN
            RAISE(ABORT, 'Table name must follow pattern: {module}_{purpose}_{entity}')
        WHEN LENGTH(NEW.table_name) > 64 THEN
            RAISE(ABORT, 'Table name must be 64 characters or less')
        WHEN NEW.table_name != LOWER(NEW.table_name) THEN
            RAISE(ABORT, 'Table name must be lowercase')
    END;
END;

CREATE TRIGGER enforce_index_naming  
BEFORE INSERT ON index_registry
BEGIN
    -- Indexes must follow pattern: idx_{table}_{columns}[_{type}]
    -- Examples: idx_vuln_current_hostname, idx_device_ip_unique
    SELECT CASE
        WHEN NEW.index_name NOT GLOB 'idx_*' THEN
            RAISE(ABORT, 'Index name must start with "idx_"')
        WHEN LENGTH(NEW.index_name) > 64 THEN
            RAISE(ABORT, 'Index name must be 64 characters or less')
        WHEN NEW.index_name != LOWER(NEW.index_name) THEN
            RAISE(ABORT, 'Index name must be lowercase')
    END;
END;
```

## Validation Rules

### Schema Validation Patterns

```typescript
// Schema consistency validation
interface SchemaValidator {
    validateTableStructure(table: StandardTable): ValidationResult;
    validateIndexStrategy(table: StandardTable): ValidationResult;
    validateNamingConventions(schema: SchemaMetadata): ValidationResult;
    validatePerformanceConstraints(migration: MigrationScript[]): ValidationResult;
}

interface ValidationResult {
    readonly is_valid: boolean;
    readonly errors: ValidationError[];
    readonly warnings: ValidationWarning[];
    readonly recommendations: string[];
}

// Table structure validation rules
const tableValidationRules = {
    primaryKeyRequired: (table: StandardTable) => {
        const hasPrimaryKey = table.columns.some(col => 
            col.constraints.some(constraint => constraint.type === ConstraintType.PRIMARY_KEY)
        );
        return hasPrimaryKey || "Table must have a primary key column";
    },
    
    auditColumnsRequired: (table: StandardTable) => {
        if (table.purpose !== TablePurpose.PRIMARY_DATA) return true;
        
        const requiredAuditColumns = ['created_at', 'created_by', 'updated_at', 'updated_by', 'version'];
        const tableColumns = table.columns.map(col => col.name);
        const missingColumns = requiredAuditColumns.filter(col => !tableColumns.includes(col));
        
        return missingColumns.length === 0 || `Missing audit columns: ${missingColumns.join(', ')}`;
    },
    
    namingConventionCompliance: (table: StandardTable) => {
        const pattern = /^[a-z]+_[a-z]+_[a-z]+$/;
        return pattern.test(table.name) || "Table name must follow pattern: {module}_{purpose}_{entity}";
    }
};
```

### Index Optimization Rules

```typescript
// Index validation and optimization
interface IndexOptimizer {
    analyzeIndexUsage(table: TableName): IndexUsageAnalysis;
    recommendIndexes(queryPatterns: QueryPattern[]): IndexRecommendation[];
    validateIndexStrategy(indexes: StandardIndex[]): ValidationResult;
    optimizeCompositeIndexes(indexes: StandardIndex[]): StandardIndex[];
}

interface IndexUsageAnalysis {
    readonly table_name: TableName;
    readonly total_queries: number;
    readonly index_hit_ratio: number;
    readonly unused_indexes: IndexName[];
    readonly missing_indexes: IndexRecommendation[];
    readonly redundant_indexes: IndexName[];
}

interface IndexRecommendation {
    readonly recommended_name: IndexName;
    readonly columns: string[];
    readonly estimated_benefit: number;     // Query performance improvement %
    readonly estimated_cost_mb: number;
    readonly justification: string;
}

// Composite index optimization logic
const indexOptimizationRules = {
    selectivityOrder: (columns: IndexColumn[]) => {
        // Most selective columns should come first in composite indexes
        return columns.sort((a, b) => 
            estimateSelectivity(b.column_name) - estimateSelectivity(a.column_name)
        );
    },
    
    redundancyElimination: (indexes: StandardIndex[]) => {
        // Remove indexes that are prefixes of other indexes
        return indexes.filter(index => !hasRedundantPrefix(index, indexes));
    },
    
    usageBasedPruning: (indexes: StandardIndex[], usageStats: IndexUsageAnalysis) => {
        // Remove indexes with very low usage unless they serve unique constraints
        return indexes.filter(index => 
            usageStats.unused_indexes.includes(index.name) && 
            index.purpose !== IndexPurpose.UNIQUENESS
        );
    }
};
```

## Performance Constraints

### Query Performance Standards

```sql
-- Performance monitoring views
CREATE VIEW performance_monitoring AS
SELECT 
    t.table_name,
    t.row_count_estimate,
    t.storage_size_mb,
    COUNT(i.index_name) as index_count,
    AVG(i.estimated_size_mb) as avg_index_size_mb,
    SUM(i.usage_count) as total_index_usage
FROM table_registry t
LEFT JOIN index_registry i ON t.table_name = i.table_name
GROUP BY t.table_name, t.row_count_estimate, t.storage_size_mb;

-- Query performance constraints
CREATE TABLE query_performance_targets (
    table_name TEXT PRIMARY KEY,
    max_select_time_ms INTEGER NOT NULL DEFAULT 500,
    max_insert_time_ms INTEGER NOT NULL DEFAULT 100,
    max_update_time_ms INTEGER NOT NULL DEFAULT 200,
    max_delete_time_ms INTEGER NOT NULL DEFAULT 150,
    concurrent_read_target INTEGER NOT NULL DEFAULT 5,
    concurrent_write_target INTEGER NOT NULL DEFAULT 2,
    FOREIGN KEY(table_name) REFERENCES table_registry(table_name)
);
```

### Storage Optimization Constraints

```typescript
// Storage management rules
interface StorageConstraints {
    readonly max_table_size_mb: number;         // 1GB default
    readonly max_index_overhead_percent: number; // 25% of table size
    readonly compression_threshold_mb: number;   // 100MB triggers compression review
    readonly partition_threshold_rows: number;  // 10M rows triggers partitioning review
    readonly archive_after_days: number;        // 365 days default
}

const performanceConstraints: StorageConstraints = {
    max_table_size_mb: 1024,           // 1GB per table limit
    max_index_overhead_percent: 25,    // Indexes shouldn't exceed 25% of table size
    compression_threshold_mb: 100,     // Review compression at 100MB
    partition_threshold_rows: 10_000_000, // Consider partitioning at 10M rows
    archive_after_days: 365            // Archive data older than 1 year
};

// Automated cleanup procedures
interface CleanupPolicy {
    readonly table_name: TableName;
    readonly cleanup_type: CleanupType;
    readonly retention_period_days: number;
    readonly cleanup_schedule: CronExpression;
    readonly archive_destination?: string;
    readonly compression_enabled: boolean;
}

enum CleanupType {
    SOFT_DELETE = 'soft_delete',       // Mark as deleted
    HARD_DELETE = 'hard_delete',       // Remove from database
    ARCHIVE = 'archive',               // Move to archive table
    COMPRESS = 'compress'              // Apply compression
}

type CronExpression = string; // Standard cron format
```

## Integration Mappings

### Cross-Module Schema Dependencies

```typescript
// Module dependency mapping
interface ModuleDependency {
    readonly source_module: ModuleType;
    readonly target_module: ModuleType;
    readonly dependency_type: DependencyType;
    readonly foreign_key_relationships: ForeignKeyRelationship[];
    readonly data_flow_direction: DataFlowDirection;
    readonly synchronization_requirements: SyncRequirements;
}

enum DependencyType {
    STRONG = 'strong',     // Cannot function without target module
    WEAK = 'weak',         // Enhanced functionality with target module
    BIDIRECTIONAL = 'bidirectional' // Mutual dependency
}

interface ForeignKeyRelationship {
    readonly source_table: TableName;
    readonly source_column: string;
    readonly target_table: TableName; 
    readonly target_column: string;
    readonly on_delete_action: ForeignKeyAction;
    readonly on_update_action: ForeignKeyAction;
}

enum ForeignKeyAction {
    CASCADE = 'CASCADE',
    RESTRICT = 'RESTRICT',
    SET_NULL = 'SET NULL',
    SET_DEFAULT = 'SET DEFAULT',
    NO_ACTION = 'NO ACTION'
}

enum DataFlowDirection {
    SOURCE_TO_TARGET = 'source_to_target',
    TARGET_TO_SOURCE = 'target_to_source', 
    BIDIRECTIONAL = 'bidirectional'
}

interface SyncRequirements {
    readonly real_time_sync: boolean;
    readonly batch_sync_interval_minutes: number;
    readonly conflict_resolution: ConflictResolution;
    readonly data_consistency_level: ConsistencyLevel;
}

enum ConflictResolution {
    SOURCE_WINS = 'source_wins',
    TARGET_WINS = 'target_wins',
    TIMESTAMP_WINS = 'timestamp_wins',
    MANUAL_RESOLUTION = 'manual_resolution'
}

enum ConsistencyLevel {
    STRONG = 'strong',       // ACID compliance required
    EVENTUAL = 'eventual',   // Eventually consistent
    WEAK = 'weak'           // Best effort consistency
}
```

### API Integration Patterns

```typescript
// Schema API integration
interface SchemaAPI {
    // Schema introspection
    getTableSchema(tableName: TableName): Promise<StandardTable>;
    getIndexes(tableName: TableName): Promise<StandardIndex[]>;
    getConstraints(tableName: TableName): Promise<TableConstraint[]>;
    
    // Schema modification
    createTable(table: StandardTable): Promise<void>;
    alterTable(tableName: TableName, changes: TableChange[]): Promise<void>;
    dropTable(tableName: TableName, cascade: boolean): Promise<void>;
    
    // Index management
    createIndex(index: StandardIndex): Promise<void>;
    dropIndex(indexName: IndexName): Promise<void>;
    analyzeIndex(indexName: IndexName): Promise<IndexUsageAnalysis>;
    
    // Performance monitoring
    getPerformanceMetrics(tableName: TableName): Promise<PerformanceMetrics>;
    optimizeTable(tableName: TableName): Promise<OptimizationResult>;
}

interface TableChange {
    readonly change_type: ChangeType;
    readonly column?: StandardColumn;
    readonly constraint?: TableConstraint;
    readonly index?: StandardIndex;
}

enum ChangeType {
    ADD_COLUMN = 'ADD_COLUMN',
    DROP_COLUMN = 'DROP_COLUMN',
    MODIFY_COLUMN = 'MODIFY_COLUMN',
    ADD_CONSTRAINT = 'ADD_CONSTRAINT',
    DROP_CONSTRAINT = 'DROP_CONSTRAINT',
    RENAME_COLUMN = 'RENAME_COLUMN'
}
```

## Migration Strategies

### Incremental Migration Framework

```sql
-- Migration execution framework
CREATE TABLE migration_execution_log (
    execution_id TEXT PRIMARY KEY,
    migration_id TEXT NOT NULL,
    step_sequence INTEGER NOT NULL,
    step_type TEXT NOT NULL,
    sql_executed TEXT NOT NULL,
    execution_start TEXT NOT NULL,
    execution_end TEXT,
    rows_affected INTEGER,
    execution_time_ms INTEGER,
    status TEXT NOT NULL CHECK(status IN ('running', 'completed', 'failed')),
    error_message TEXT,
    rollback_executed INTEGER DEFAULT 0,
    FOREIGN KEY(migration_id) REFERENCES schema_migrations(id)
);

CREATE INDEX idx_migration_log_migration ON migration_execution_log(migration_id);
CREATE INDEX idx_migration_log_status ON migration_execution_log(status);

-- Rollback tracking
CREATE TABLE migration_rollbacks (
    rollback_id TEXT PRIMARY KEY,
    migration_id TEXT NOT NULL,
    rollback_reason TEXT NOT NULL,
    rollback_started_at TEXT NOT NULL,
    rollback_completed_at TEXT,
    steps_rolled_back INTEGER DEFAULT 0,
    data_loss_risk TEXT CHECK(data_loss_risk IN ('none', 'low', 'medium', 'high')),
    rollback_status TEXT CHECK(rollback_status IN ('in_progress', 'completed', 'failed')),
    FOREIGN KEY(migration_id) REFERENCES schema_migrations(id)
);
```

### Automated Schema Validation

```typescript
// Pre/post migration validation
interface MigrationValidator {
    validatePreMigration(migration: MigrationScript[]): ValidationResult;
    validatePostMigration(migration: MigrationScript[]): ValidationResult;
    validateDataIntegrity(tableName: TableName): IntegrityCheckResult;
    validatePerformance(tableName: TableName): PerformanceCheckResult;
}

interface IntegrityCheckResult {
    readonly foreign_key_violations: number;
    readonly constraint_violations: number;
    readonly orphaned_records: number;
    readonly data_corruption_detected: boolean;
    readonly recommendations: string[];
}

interface PerformanceCheckResult {
    readonly query_performance_regression: number; // Percentage change
    readonly storage_overhead_change: number;      // MB change
    readonly index_efficiency_score: number;       // 0-100 score
    readonly optimization_recommendations: string[];
}
```

---

*This data model provides the foundation for standardized, high-performance database schema management across all HexTrackr modules*
