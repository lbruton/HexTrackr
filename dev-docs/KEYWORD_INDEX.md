# Technical Documentation Keyword Index

## Database & Performance Keywords

### Staging Table Architecture

- **staging table implementation** → `architecture/database-schema-evolution.md`
- **bulk insert patterns** → `architecture/database-schema-evolution.md`
- **batch processing patterns** → `architecture/database-schema-evolution.md`
- **vulnerability_staging table** → `architecture/database-schema-evolution.md`
- **SQLite performance optimization** → `architecture/database-schema-evolution.md`
- **database schema migration** → `architecture/database-schema-evolution.md`

### Function Definitions

- **bulkInsertToStagingTable** → `architecture/symbol-table.json`
- **processStagingToFinalTables** → `architecture/symbol-table.json`
- **finalizeBatchProcessing** → `architecture/symbol-table.json`
- **processVulnerabilityRowsWithRollover** → `architecture/symbol-table.json`
- **mapVulnerabilityRow** → `architecture/symbol-table.json`

### Performance Metrics

- **deduplication strategies** → `architecture/database-schema-evolution.md`
- **enhanced_unique_key generation** → `architecture/database-schema-evolution.md`
- **batch size optimization** → `architecture/database-schema-evolution.md`
- **index performance strategies** → `architecture/database-schema-evolution.md`

## Frontend & UI Keywords

### AG Grid Configuration

- **createVulnerabilityGridOptions** → `ui-patterns/ag-grid-responsive-architecture.md`
- **AG Grid responsive configuration** → `ui-patterns/ag-grid-responsive-architecture.md`
- **responsive breakpoint strategy** → `ui-patterns/ag-grid-responsive-architecture.md`
- **column visibility patterns** → `ui-patterns/ag-grid-responsive-architecture.md`
- **dynamic column management** → `ui-patterns/ag-grid-responsive-architecture.md`

### Responsive Design

- **breakpoint management** → `ui-patterns/ag-grid-responsive-architecture.md`
- **mobile first design** → `ui-patterns/ag-grid-responsive-architecture.md`  
- **debounced resize handling** → `ui-patterns/ag-grid-responsive-architecture.md`
- **viewport responsive testing** → `ui-patterns/ag-grid-responsive-architecture.md`

### Cell Renderers & Patterns

- **severity badge rendering** → `ui-patterns/ag-grid-responsive-architecture.md`
- **VPR score cell renderer** → `ui-patterns/ag-grid-responsive-architecture.md`
- **CVE detection patterns** → `ui-patterns/ag-grid-responsive-architecture.md`
- **Cisco SA detection** → `ui-patterns/ag-grid-responsive-architecture.md`
- **modal data flow patterns** → `ui-patterns/ag-grid-responsive-architecture.md`

## Testing & Quality Keywords

### Playwright Testing

- **modal interaction testing** → `testing/playwright-test-patterns.md`
- **vulnerability modal testing** → `testing/playwright-test-patterns.md`
- **device modal testing** → `testing/playwright-test-patterns.md`
- **responsive design validation** → `testing/playwright-test-patterns.md`
- **CSV import export testing** → `testing/playwright-test-patterns.md`

### Performance Testing

- **page load performance** → `testing/playwright-test-patterns.md`
- **memory usage monitoring** → `testing/playwright-test-patterns.md`
- **JavaScript error detection** → `testing/playwright-test-patterns.md`
- **network request monitoring** → `testing/playwright-test-patterns.md`
- **performance benchmarking** → `testing/playwright-test-patterns.md`

### Test Patterns

- **timeout management patterns** → `testing/playwright-test-patterns.md`
- **screenshot naming conventions** → `testing/playwright-test-patterns.md`
- **visual regression testing** → `testing/playwright-test-patterns.md`
- **error recovery patterns** → `testing/playwright-test-patterns.md`

## Architecture & Development Keywords

### Modular Architecture

- **ModernVulnManager refactoring** → `architecture/symbol-table.json`
- **VulnerabilityDataManager extraction** → `architecture/symbol-table.json`
- **PaginationController extraction** → `architecture/symbol-table.json`
- **modular architecture patterns** → `architecture/symbol-table.json`
- **component extraction strategies** → `architecture/symbol-table.json`

### Development Patterns

- **inter-module communication** → `architecture/symbol-table.json`
- **event handling patterns** → `ui-patterns/ag-grid-responsive-architecture.md`
- **dependency injection patterns** → `ui-patterns/ag-grid-responsive-architecture.md`
- **context passing patterns** → `ui-patterns/ag-grid-responsive-architecture.md`

## Server.js Function Reference

### High Performance Functions (v1.0.4)

```
bulkInsertToStagingTable(rows, importId, filePath, responseData, res, scanDate, startTime)
```

- **Location**: server.js:519
- **Purpose**: High-performance bulk insert to staging table
- **Keywords**: bulk insert, staging table, prepared statements, performance optimization

```
processStagingToFinalTables(importId, scanDate, responseData, res, startTime)
```

- **Location**: server.js:634  
- **Purpose**: Process staging records in configurable batches
- **Keywords**: batch processing, configurable batches, rollover processing

```
finalizeBatchProcessing(importId, currentDate, batchStats, responseData, res, startTime)
```

- **Location**: server.js:877
- **Purpose**: Cleanup staging table and performance metrics
- **Keywords**: staging cleanup, performance metrics, batch statistics

### Legacy Functions (Deprecated)

```
processVulnerabilityRowsWithRollover(rows, stmt, importId, filePath, responseData, res, scanDate)
```

- **Location**: server.js:336
- **Purpose**: Single-row processing (legacy)
- **Keywords**: row-by-row processing, legacy import, single row rollover
- **Status**: Use staging functions for new implementations

## AG Grid Functions Reference

### Configuration Factory

```
createVulnerabilityGridOptions(componentContext)
```

- **Location**: scripts/shared/ag-grid-responsive-config.js:36
- **Purpose**: Creates complete responsive AG Grid configuration
- **Keywords**: grid configuration, responsive design, component context

```
debounce(func, delay)
```

- **Location**: scripts/shared/ag-grid-responsive-config.js:21
- **Purpose**: Performance optimization for rapid events
- **Keywords**: debounce utility, performance optimization, event throttling

### Column Management

```
updateColumnVisibility(api)
```

- **Location**: scripts/shared/ag-grid-responsive-config.js:301
- **Purpose**: Dynamic column visibility based on screen size
- **Keywords**: column visibility, responsive columns, breakpoint management

## Testing Functions Reference

### Modal Testing Patterns

```
validateVulnerabilityModal(page)
```

- **Location**: tests/modal-success-validation.spec.js
- **Purpose**: Core vulnerability modal functionality testing
- **Keywords**: modal testing, vulnerability aggregation, device count validation

```
validateDeviceModal(page)
```

- **Location**: tests/modal-success-validation.spec.js
- **Purpose**: Device-specific modal testing with CSV export
- **Keywords**: device modal, CSV export testing, download validation

### Performance Testing (2)

```
measurePageLoadTime(page)
```

- **Location**: tests/debug-page-load.spec.js
- **Purpose**: Complete page load performance measurement
- **Keywords**: performance measurement, load time tracking, timing analysis

```
validateMemoryUsage(page)
```

- **Location**: tests/ (pattern implementation)
- **Purpose**: Memory leak detection and validation
- **Keywords**: memory monitoring, leak detection, performance memory

## Database Schema Keywords

### Table Structure

- **vulnerabilities_current** → Primary table with deduplication
- **vulnerability_staging** → High-performance temporary import table
- **vulnerability_snapshots** → Historical record storage
- **vulnerability_daily_totals** → Aggregated statistics
- **vulnerability_imports** → Import audit trail

### Index Patterns

- **idx_staging_unprocessed_batch** → Composite index for batch queries
- **idx_current_enhanced_unique_key** → Deduplication performance index
- **idx_staging_import_id** → Import-based filtering
- **idx_staging_processed** → Processing status queries

## CSV Import/Export Keywords

### Import Processing

- **CSV parsing patterns** → Papa.parse integration
- **vendor-specific mapping** → Tenable, Cisco, Generic formats
- **header detection** → Dynamic field mapping
- **error handling patterns** → Import validation and recovery

### Export Functionality  

- **CSV generation** → Data export with proper formatting
- **file download patterns** → Browser download handling
- **data filtering** → Export with search/filter context
- **filename conventions** → Timestamp-based naming

## Performance Benchmarks

### Staging Table Performance

- **10K rows**: 8-12 seconds (vs 45-60 seconds legacy)
- **Memory usage**: Batch processing reduces memory footprint
- **Error recovery**: Batch-level vs single-row failure handling
- **Batch size**: Default 1000 rows, configurable via environment

### UI Performance Targets

- **Initial Load**: < 2 seconds for 10,000 rows
- **Resize Response**: < 100ms column visibility updates  
- **Memory Usage**: < 50MB for large datasets
- **Mobile Performance**: 60fps scrolling on modern devices

## Implementation Status Tracking

### Completed Extractions

- **VulnerabilityDataManager**: 347 lines extracted to shared module
- **PaginationController**: 216 lines extracted to shared module
- **AG Grid Configuration**: Extracted to responsive config module

### Pending Refactoring

- **ModernVulnManager**: Split into 6 specialized modules
- **Chart Management**: Extract ApexCharts logic
- **Modal Handling**: Centralize modal management patterns
- **Import/Export**: Dedicated module for CSV operations

This keyword index ensures maximum discoverability of technical implementation details through ref.tools searches while maintaining clear separation from user-facing documentation.
