# Database Schema Standardization - Validation Guide

## Manual Validation Steps

### Phase 1: Schema Discovery and Analysis

1. **Current Schema Inventory**

   ```sql
   -- Generate complete schema inventory
   SELECT 
     type,
     name,
     sql,
     CASE 
       WHEN name LIKE '%_staging_%' THEN 'staging'
       WHEN name LIKE '%_audit_%' THEN 'audit' 
       WHEN name LIKE '%_daily_%' THEN 'aggregation'
       ELSE 'primary_data'
     END as table_purpose
   FROM sqlite_master 
   WHERE type IN ('table', 'index', 'trigger')
   ORDER BY type, name;
   ```

2. **Naming Convention Compliance Check**

   ```bash
   # Check table naming patterns
   echo "Tables not following {module}_{purpose}_{entity} pattern:"
   sqlite3 hextrackr.db "SELECT name FROM sqlite_master WHERE type='table' 
     AND name NOT GLOB '*_*_*' 
     AND name NOT IN ('sqlite_sequence', 'sqlite_stat1')"
   
   # Check index naming patterns  
   echo "Indexes not following idx_{table}_{columns} pattern:"
   sqlite3 hextrackr.db "SELECT name FROM sqlite_master WHERE type='index' 
     AND name NOT GLOB 'idx_*' 
     AND name NOT LIKE 'sqlite_%'"
   ```

3. **Schema Metadata Verification**

   ```sql
   -- Verify schema registry is populated
   SELECT COUNT(*) as registered_tables FROM table_registry;
   SELECT COUNT(*) as registered_indexes FROM index_registry;
   SELECT COUNT(*) as pending_migrations FROM schema_migrations WHERE status = 'Pending';
   
   -- Check for orphaned indexes
   SELECT i.name as index_name 
   FROM index_registry i
   LEFT JOIN table_registry t ON i.table_name = t.table_name
   WHERE t.table_name IS NULL;
   ```

### Phase 2: Standard Template Validation

4. **Audit Column Verification**

   ```sql
   -- Check all primary data tables have required audit columns
   WITH required_columns AS (
     SELECT 'created_at' as column_name UNION
     SELECT 'created_by' UNION  
     SELECT 'updated_at' UNION
     SELECT 'updated_by' UNION
     SELECT 'version'
   ),
   primary_tables AS (
     SELECT table_name FROM table_registry 
     WHERE purpose = 'primary_data'
   )
   SELECT 
     pt.table_name,
     rc.column_name,
     CASE WHEN ti.name IS NOT NULL THEN 'Present' ELSE 'MISSING' END as status
   FROM primary_tables pt
   CROSS JOIN required_columns rc
   LEFT JOIN pragma_table_info(pt.table_name) ti ON ti.name = rc.column_name
   WHERE ti.name IS NULL
   ORDER BY pt.table_name, rc.column_name;
   ```

5. **Primary Key Standard Validation**

   ```sql
   -- Verify all tables have proper primary keys
   SELECT 
     t.table_name,
     CASE 
       WHEN pk.name IS NOT NULL THEN 'UUID Primary Key'
       WHEN rowid.cid IS NOT NULL THEN 'ROWID Primary Key'
       ELSE 'NO PRIMARY KEY'
     END as pk_status
   FROM table_registry t
   LEFT JOIN pragma_table_info(t.table_name) pk 
     ON pk.pk = 1 AND pk.type = 'TEXT' AND LENGTH(pk.dflt_value) = 38
   LEFT JOIN pragma_table_info(t.table_name) rowid
     ON rowid.pk = 1 AND rowid.type = 'INTEGER'
   ORDER BY t.table_name;
   ```

6. **Foreign Key Integrity Check**

   ```sql
   -- Enable foreign key constraints for testing
   PRAGMA foreign_keys = ON;
   
   -- Check for foreign key violations
   PRAGMA foreign_key_check;
   
   -- Verify foreign key naming convention
   SELECT 
     m.name as table_name,
     fk.id,
     fk."table" as referenced_table,
     fk."from" as local_column,
     fk."to" as foreign_column,
     CASE 
       WHEN fk."from" = fk."table" || '_id' THEN 'Compliant'
       ELSE 'Non-compliant naming'
     END as naming_status
   FROM sqlite_master m
   JOIN pragma_foreign_key_list(m.name) fk
   WHERE m.type = 'table';
   ```

### Phase 3: Performance Optimization Validation

7. **Index Usage Analysis**

   ```sql
   -- Analyze query patterns and index usage
   EXPLAIN QUERY PLAN 
   SELECT * FROM vulnerabilities_current 
   WHERE hostname = 'server.local' AND severity = 'Critical';
   
   -- Should show index usage, not full table scan
   -- Expected: "USING INDEX idx_vuln_hostname" or similar
   ```

8. **Database Performance Benchmarks**

   ```bash
   # Create performance test script
   cat << 'EOF' > test_performance.sql
   .timer ON
   .headers ON
   
   -- Test 1: Simple lookup (should be <50ms)
   SELECT COUNT(*) FROM vulnerabilities_current WHERE hostname = 'test.local';
   
   -- Test 2: Aggregation query (should be <200ms)
   SELECT severity, COUNT(*) FROM vulnerabilities_current GROUP BY severity;
   
   -- Test 3: Join performance (should be <500ms)
   SELECT v.hostname, COUNT(s.id) as snapshot_count
   FROM vulnerabilities_current v
   LEFT JOIN vulnerability_snapshots s ON v.id = s.vulnerability_id
   GROUP BY v.hostname
   LIMIT 100;
   
   -- Test 4: Complex filter (should use indexes)
   SELECT * FROM vulnerabilities_current 
   WHERE severity IN ('Critical', 'High') 
   AND last_seen >= date('now', '-30 days')
   ORDER BY last_seen DESC
   LIMIT 50;
   EOF
   
   sqlite3 hextrackr.db < test_performance.sql
   ```

9. **Storage Efficiency Validation**

   ```sql
   -- Analyze storage usage by table
   SELECT 
     t.table_name,
     t.storage_size_mb,
     COUNT(i.index_name) as index_count,
     ROUND(SUM(i.estimated_size_mb), 2) as total_index_size_mb,
     ROUND((SUM(i.estimated_size_mb) / t.storage_size_mb) * 100, 1) as index_overhead_percent
   FROM table_registry t
   LEFT JOIN index_registry i ON t.table_name = i.table_name
   WHERE t.storage_size_mb > 0
   GROUP BY t.table_name, t.storage_size_mb
   HAVING index_overhead_percent > 25 -- Flag tables with >25% index overhead
   ORDER BY index_overhead_percent DESC;
   ```

### Phase 4: Migration Framework Testing

10. **Migration Script Validation**

    ```bash
    # Test migration framework with sample migration
    cat << 'EOF' > test_migration.sql
    INSERT INTO schema_migrations (
      id, version, description, migration_scripts, rollback_scripts,
      created_by, status
    ) VALUES (
      '550e8400-e29b-41d4-a716-446655440000',
      '1.1.0',
      'Add CVE score column to vulnerabilities',
      '[{"sequence": 1, "script_type": "ALTER_TABLE", "sql_content": "ALTER TABLE vulnerabilities_current ADD COLUMN cve_score REAL", "rollback_sql": "ALTER TABLE vulnerabilities_current DROP COLUMN cve_score"}]',
      '[{"sequence": 1, "sql_content": "ALTER TABLE vulnerabilities_current DROP COLUMN cve_score"}]',
      'test_user',
      'Pending'
    );
    EOF
    
    sqlite3 hextrackr.db < test_migration.sql
    echo "Migration added successfully"
    ```

11. **Rollback Capability Testing**

    ```sql
    -- Test rollback tracking
    INSERT INTO migration_rollbacks (
      rollback_id, migration_id, rollback_reason,
      rollback_started_at, data_loss_risk, rollback_status
    ) VALUES (
      '550e8400-e29b-41d4-a716-446655440001',
      '550e8400-e29b-41d4-a716-446655440000',
      'Performance regression detected',
      datetime('now'),
      'none',
      'in_progress'
    );
    
    -- Verify rollback logging
    SELECT * FROM migration_rollbacks 
    WHERE migration_id = '550e8400-e29b-41d4-a716-446655440000';
    ```

## Automated Test Scenarios

### Schema Validation Tests

```javascript
describe('Schema Standardization Tests', () => {
  let database;
  
  beforeAll(async () => {
    database = new Database('test_hextrackr.db');
  });
  
  afterAll(async () => {
    await database.close();
  });
  
  describe('Naming Convention Validation', () => {
    it('should enforce table naming pattern: {module}_{purpose}_{entity}', async () => {
      const tables = await database.query(`
        SELECT name FROM sqlite_master 
        WHERE type='table' AND name NOT LIKE 'sqlite_%'
      `);
      
      const pattern = /^[a-z]+_[a-z]+_[a-z]+$/;
      const nonCompliantTables = tables.filter(table => !pattern.test(table.name));
      
      expect(nonCompliantTables).toEqual([]);
    });
    
    it('should enforce index naming pattern: idx_{table}_{columns}', async () => {
      const indexes = await database.query(`
        SELECT name FROM sqlite_master 
        WHERE type='index' AND name NOT LIKE 'sqlite_%'
      `);
      
      const pattern = /^idx_[a-z_]+$/;
      const nonCompliantIndexes = indexes.filter(index => !pattern.test(index.name));
      
      expect(nonCompliantIndexes).toEqual([]);
    });
  });
  
  describe('Standard Column Validation', () => {
    it('should have required audit columns in all primary tables', async () => {
      const primaryTables = await database.query(`
        SELECT table_name FROM table_registry 
        WHERE purpose = 'primary_data'
      `);
      
      const requiredColumns = ['created_at', 'created_by', 'updated_at', 'updated_by', 'version'];
      
      for (const table of primaryTables) {
        const columns = await database.query(`PRAGMA table_info(${table.table_name})`);
        const columnNames = columns.map(col => col.name);
        
        for (const requiredColumn of requiredColumns) {
          expect(columnNames).toContain(requiredColumn);
        }
      }
    });
    
    it('should have UUID primary keys in all tables', async () => {
      const tables = await database.query(`
        SELECT table_name FROM table_registry
      `);
      
      for (const table of tables) {
        const columns = await database.query(`PRAGMA table_info(${table.table_name})`);
        const primaryKey = columns.find(col => col.pk === 1);
        
        expect(primaryKey).toBeDefined();
        expect(primaryKey.type).toBe('TEXT');
        expect(primaryKey.name).toBe('id');
      }
    });
  });
  
  describe('Foreign Key Validation', () => {
    it('should have proper foreign key relationships', async () => {
      const tables = await database.query(`
        SELECT table_name FROM table_registry
      `);
      
      for (const table of tables) {
        const foreignKeys = await database.query(`PRAGMA foreign_key_list(${table.table_name})`);
        
        for (const fk of foreignKeys) {
          // Verify naming convention: {referenced_table}_id
          expect(fk.from).toBe(`${fk.table}_id`);
          
          // Verify referenced table exists
          const referencedTable = await database.query(`
            SELECT 1 FROM sqlite_master 
            WHERE type='table' AND name=?
          `, [fk.table]);
          expect(referencedTable).toHaveLength(1);
        }
      }
    });
  });
});
```

### Performance Tests

```javascript
describe('Database Performance Tests', () => {
  beforeAll(async () => {
    // Setup test data
    await setupTestData();
  });
  
  it('should meet query performance targets', async () => {
    const testCases = [
      {
        name: 'Simple lookup',
        query: `SELECT * FROM vulnerabilities_current WHERE hostname = ?`,
        params: ['test.local'],
        maxTime: 50 // ms
      },
      {
        name: 'Aggregation query',
        query: `SELECT severity, COUNT(*) FROM vulnerabilities_current GROUP BY severity`,
        params: [],
        maxTime: 200 // ms
      },
      {
        name: 'Complex filter with sort',
        query: `
          SELECT * FROM vulnerabilities_current 
          WHERE severity IN ('Critical', 'High') 
          AND last_seen >= date('now', '-30 days')
          ORDER BY last_seen DESC LIMIT 50
        `,
        params: [],
        maxTime: 500 // ms
      }
    ];
    
    for (const testCase of testCases) {
      const startTime = performance.now();
      await database.query(testCase.query, testCase.params);
      const endTime = performance.now();
      
      const executionTime = endTime - startTime;
      expect(executionTime).toBeLessThan(testCase.maxTime);
    }
  });
  
  it('should use indexes efficiently', async () => {
    const queries = [
      'SELECT * FROM vulnerabilities_current WHERE hostname = ?',
      'SELECT * FROM vulnerabilities_current WHERE severity = ?',
      'SELECT * FROM vulnerabilities_current WHERE last_seen >= ?'
    ];
    
    for (const query of queries) {
      const plan = await database.query(`EXPLAIN QUERY PLAN ${query}`);
      const planText = plan.map(row => row.detail).join(' ');
      
      // Should use index, not scan entire table
      expect(planText).toMatch(/USING INDEX/);
      expect(planText).not.toMatch(/SCAN TABLE/);
    }
  });
});
```

### Migration Framework Tests

```javascript
describe('Migration Framework Tests', () => {
  let migrationManager;
  
  beforeEach(async () => {
    migrationManager = new MigrationManager(database);
    await migrationManager.initialize();
  });
  
  it('should execute migration scripts in sequence', async () => {
    const migration = {
      id: 'test-migration-001',
      version: '1.1.0',
      description: 'Test migration',
      migration_scripts: [
        {
          sequence: 1,
          script_type: 'CREATE_INDEX',
          sql_content: 'CREATE INDEX idx_test_column ON test_table(test_column)',
          rollback_sql: 'DROP INDEX idx_test_column'
        }
      ]
    };
    
    await migrationManager.executeMigration(migration);
    
    // Verify migration was applied
    const indexes = await database.query(`
      SELECT name FROM sqlite_master 
      WHERE type='index' AND name='idx_test_column'
    `);
    expect(indexes).toHaveLength(1);
    
    // Verify migration logged
    const migrationLog = await database.query(`
      SELECT * FROM schema_migrations WHERE id=?
    `, [migration.id]);
    expect(migrationLog[0].status).toBe('Completed');
  });
  
  it('should rollback migrations on failure', async () => {
    const migration = {
      id: 'test-migration-002',
      version: '1.2.0',
      description: 'Failing migration test',
      migration_scripts: [
        {
          sequence: 1,
          script_type: 'ALTER_TABLE',
          sql_content: 'ALTER TABLE nonexistent_table ADD COLUMN test_col TEXT',
          rollback_sql: 'ALTER TABLE nonexistent_table DROP COLUMN test_col'
        }
      ]
    };
    
    await expect(migrationManager.executeMigration(migration))
      .rejects.toThrow('no such table: nonexistent_table');
    
    // Verify migration marked as failed
    const migrationLog = await database.query(`
      SELECT * FROM schema_migrations WHERE id=?
    `, [migration.id]);
    expect(migrationLog[0].status).toBe('Failed');
  });
  
  it('should prevent duplicate migration execution', async () => {
    const migration = {
      id: 'test-migration-003',
      version: '1.3.0',
      description: 'Duplicate test',
      migration_scripts: []
    };
    
    // Execute once
    await migrationManager.executeMigration(migration);
    
    // Attempt to execute again
    await expect(migrationManager.executeMigration(migration))
      .rejects.toThrow('Migration already executed');
  });
});
```

## Common Issues & Solutions

### Issue 1: Migration Script Execution Order

**Symptoms**: Foreign key constraint errors during complex migrations
**Cause**: Dependencies not properly ordered in migration scripts
**Solution**:

```javascript
// Sort migration scripts by dependency graph
function sortMigrationsByDependencies(migrations) {
  const dependencyGraph = new Map();
  const sorted = [];
  
  // Build dependency graph
  migrations.forEach(migration => {
    const dependencies = extractDependencies(migration.sql_content);
    dependencyGraph.set(migration.id, dependencies);
  });
  
  // Topological sort
  function visit(migrationId, visited, temp) {
    if (temp.has(migrationId)) {
      throw new Error(`Circular dependency detected involving ${migrationId}`);
    }
    if (visited.has(migrationId)) {
      return;
    }
    
    temp.add(migrationId);
    const dependencies = dependencyGraph.get(migrationId) || [];
    dependencies.forEach(depId => visit(depId, visited, temp));
    temp.delete(migrationId);
    visited.add(migrationId);
    sorted.push(migrationId);
  }
  
  const visited = new Set();
  migrations.forEach(migration => {
    if (!visited.has(migration.id)) {
      visit(migration.id, visited, new Set());
    }
  });
  
  return sorted;
}
```

### Issue 2: Index Overhead Exceeding Limits

**Symptoms**: Slow write operations, excessive storage usage
**Cause**: Too many indexes on frequently updated tables
**Solution**:

```sql
-- Analyze index usage and remove unused indexes
WITH index_usage AS (
  SELECT 
    i.name as index_name,
    i.table_name,
    i.usage_count,
    i.estimated_size_mb,
    CASE WHEN i.usage_count = 0 THEN 'UNUSED'
         WHEN i.usage_count < 10 THEN 'LOW_USAGE'
         ELSE 'ACTIVE' 
    END as usage_category
  FROM index_registry i
  WHERE i.purpose = 'query_opt'
)
SELECT 
  table_name,
  COUNT(*) as total_indexes,
  SUM(CASE WHEN usage_category = 'UNUSED' THEN 1 ELSE 0 END) as unused_count,
  SUM(estimated_size_mb) as total_index_size_mb
FROM index_usage
GROUP BY table_name
HAVING unused_count > 0 OR total_index_size_mb > 100
ORDER BY unused_count DESC, total_index_size_mb DESC;

-- Drop unused indexes
-- DROP INDEX index_name;
```

### Issue 3: Schema Registry Synchronization Issues  

**Symptoms**: Mismatch between actual schema and registry metadata
**Cause**: Direct schema changes bypassing registry updates
**Solution**:

```javascript
// Implement schema synchronization check
async function synchronizeSchemaRegistry() {
  const actualTables = await database.query(`
    SELECT name FROM sqlite_master WHERE type='table'
  `);
  
  const registeredTables = await database.query(`
    SELECT table_name FROM table_registry
  `);
  
  const actualTableNames = new Set(actualTables.map(t => t.name));
  const registeredTableNames = new Set(registeredTables.map(t => t.table_name));
  
  // Find unregistered tables
  const unregistered = [...actualTableNames].filter(name => 
    !registeredTableNames.has(name) && !name.startsWith('sqlite_')
  );
  
  // Find orphaned registrations
  const orphaned = [...registeredTableNames].filter(name => 
    !actualTableNames.has(name)
  );
  
  console.log('Unregistered tables:', unregistered);
  console.log('Orphaned registrations:', orphaned);
  
  // Auto-register missing tables
  for (const tableName of unregistered) {
    await registerTable(tableName);
  }
  
  // Remove orphaned registrations
  for (const tableName of orphaned) {
    await database.query('DELETE FROM table_registry WHERE table_name = ?', [tableName]);
  }
}
```

### Issue 4: Foreign Key Constraint Violations During Migration

**Symptoms**: Migration fails with "FOREIGN KEY constraint failed"
**Cause**: Data integrity issues or migration order problems
**Solution**:

```sql
-- Temporarily disable foreign key constraints during migration
PRAGMA foreign_keys = OFF;

-- Perform migration steps
-- ... migration SQL ...

-- Validate foreign key integrity before re-enabling
PRAGMA foreign_key_check;

-- Re-enable foreign key constraints
PRAGMA foreign_keys = ON;
```

### Issue 5: Performance Degradation After Schema Changes

**Symptoms**: Queries become significantly slower after migration
**Cause**: Missing statistics or suboptimal query plans
**Solution**:

```sql
-- Update SQLite statistics after schema changes
ANALYZE;

-- Rebuild indexes to ensure optimal structure
REINDEX;

-- Optimize database file
VACUUM;

-- Update query planner statistics
PRAGMA optimize;
```

## Success Criteria

### Schema Compliance Success Criteria

✅ **Naming Convention Compliance**:

- 100% of tables follow {module}_{purpose}_{entity} pattern
- 100% of indexes follow idx_{table}_{columns} pattern
- Zero naming convention violations in schema registry

✅ **Standard Template Adherence**:

- All primary data tables have required audit columns
- All tables have proper UUID primary keys
- Foreign key relationships follow naming conventions
- Staging tables use standardized structure

✅ **Metadata Accuracy**:

- Schema registry 100% synchronized with actual database
- All indexes registered with usage tracking
- Migration history complete and accurate

### Performance Success Criteria

✅ **Query Performance Targets**:

- Simple lookups: <50ms average response time
- List queries: <200ms for 50 records with pagination
- Aggregation queries: <500ms for summary statistics  
- Complex joins: <1000ms for multi-table operations

✅ **Storage Efficiency**:

- Index overhead: <25% of total table size
- Storage growth: <10% overhead from standardization
- Compression ratio: >50% for historical data
- Fragmentation: <5% database fragmentation

✅ **Scalability Metrics**:

- Migration execution: <30 seconds for schema changes
- Concurrent access: Support 10+ simultaneous connections
- Transaction throughput: >1000 transactions/second
- Index maintenance: <100ms per index update

### Migration Framework Success Criteria

✅ **Migration Reliability**:

- 100% migration success rate for validated scripts
- Zero data loss incidents during migrations
- Complete rollback capability for all migration types
- Atomic migration execution with proper transaction handling

✅ **Migration Performance**:

- Schema migration time: <5 minutes for major changes
- Migration validation: <30 seconds for integrity checks
- Rollback time: <2 minutes for any migration
- Zero downtime for additive migrations

✅ **Audit and Compliance**:

- Complete migration history tracking
- Performance impact assessment for all changes  
- Rollback procedure documentation and validation
- Change approval workflow integration

### Integration Success Criteria

✅ **Cross-Module Compatibility**:

- All modules follow standardized schema patterns
- Foreign key relationships properly maintained
- Consistent data types across related tables
- Uniform naming and structure conventions

✅ **API Integration**:

- Schema introspection APIs functional
- Migration APIs secure and reliable  
- Performance monitoring APIs accurate
- Configuration management APIs consistent

✅ **Tool Integration**:

- Backup/restore procedures updated for new schema
- Monitoring tools recognize standardized patterns
- Development tools support schema conventions
- Documentation generation reflects standards

---

_This validation guide ensures comprehensive verification of database schema standardization across all compliance, performance, and integration dimensions._
