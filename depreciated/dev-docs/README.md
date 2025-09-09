# HexTrackr Technical Documentation Index

## Overview

This directory contains technical implementation documentation specifically for developers working on the HexTrackr codebase. These docs are optimized for ref.tools searchability and contain detailed implementation patterns, architectural decisions, and testing strategies.

## Documentation Categories

### 🏗️ Architecture Documentation

#### [Symbol Table (`architecture/symbol-table.json`)](./architecture/symbol-table.json)

**Keywords**: `function definitions`, `class extraction`, `refactoring queue`, `performance metrics`

- Complete symbol mapping for server.js (3300+ lines)
- Modular architecture extraction progress tracking
- Database function definitions with performance characteristics
- Staging table implementation patterns
- Refactoring priority queue and completion status

#### [Database Schema Evolution (`architecture/database-schema-evolution.md`)](./architecture/database-schema-evolution.md)

**Keywords**: `staging table`, `batch processing`, `performance optimization`, `schema migration`

- High-performance staging table architecture
- Batch processing patterns (1000-row batches)
- Database indexing strategies for performance
- Migration patterns and version tracking
- Rollover processing with deduplication logic

### 🎨 UI Pattern Documentation

#### [AG Grid Responsive Architecture (`ui-patterns/ag-grid-responsive-architecture.md`)](./ui-patterns/ag-grid-responsive-architecture.md)

**Keywords**: `responsive design`, `AG Grid configuration`, `breakpoint management`, `column visibility`

- Responsive breakpoint strategy (mobile: 768px, tablet: 1200px)
- Dynamic column visibility system with debounced resize handling
- Cell renderer patterns for severity badges, CVE links, Cisco SA detection
- Modal integration patterns with global data storage
- Performance optimizations for pagination and virtualization

### 🧪 Testing Documentation

#### [Playwright Testing Patterns (`testing/playwright-test-patterns.md`)](./testing/playwright-test-patterns.md)

**Keywords**: `end-to-end testing`, `modal testing`, `responsive testing`, `performance validation`

- Modal interaction testing patterns with timeout management
- Responsive design validation across viewport sizes
- CSV import/export testing with file handling
- Performance measurement and memory usage monitoring
- Error detection and JavaScript monitoring patterns

## Function Reference Index

### Server.js Functions (v1.0.4)

#### High-Performance Import Functions

```javascript
// Staging Table Processing
bulkInsertToStagingTable(rows, importId, filePath, responseData, res, scanDate, startTime)
processStagingToFinalTables(importId, scanDate, responseData, res, startTime) 
finalizeBatchProcessing(importId, currentDate, batchStats, responseData, res, startTime)

// Legacy Processing (Use staging functions for new implementations)
processVulnerabilityRowsWithRollover(rows, stmt, importId, filePath, responseData, res, scanDate)
```

#### Data Mapping Functions

```javascript
// CSV to Database Mapping
mapVulnerabilityRow(row) // Vendor-agnostic CSV mapping
normalizeHostname(hostname) // Hostname standardization for deduplication
extractCVE(rowData) // CVE extraction from various fields
```

### AG Grid Configuration Functions

#### Responsive Grid Setup

```javascript
// scripts/shared/ag-grid-responsive-config.js
createVulnerabilityGridOptions(componentContext) // Complete grid configuration factory
debounce(func, delay) // Performance optimization for resize events
updateColumnVisibility(api) // Dynamic column management based on screen size
```

#### Cell Renderer Patterns

```javascript
// Severity badge rendering with dynamic styling
severityRenderer(params) // Color-coded severity levels
vprScoreRenderer(params) // VPR score with threshold-based styling
hostnameRenderer(params) // Interactive hostname links for device details
cveRenderer(params) // CVE/Cisco SA detection and lookup integration
```

### Testing Function Patterns

#### Modal Testing

```javascript
// tests/modal-success-validation.spec.js
validateVulnerabilityModal(page) // Core vulnerability modal testing
validateDeviceModal(page) // Device aggregation modal testing
validateCSVExport(page) // CSV export functionality testing
```

#### Performance Testing

```javascript
// Performance measurement patterns
measurePageLoadTime(page) // Complete page load timing
validateMemoryUsage(page) // Memory leak detection
validateAPIResponses(page) // Network request monitoring
```

## Search Keywords for ref.tools

### Database & Performance

- `staging table implementation`
- `batch processing patterns`
- `database schema migration`
- `SQLite performance optimization`
- `deduplication strategies`
- `bulk insert patterns`

### Frontend & UI

- `AG Grid responsive configuration`
- `breakpoint management`
- `column visibility patterns`
- `modal data flow`
- `debounced resize handling`
- `cell renderer patterns`

### Testing & Quality

- `Playwright testing patterns`
- `modal interaction testing`
- `responsive design validation`
- `performance benchmarking`
- `error monitoring patterns`
- `CSV import/export testing`

### Architecture & Patterns

- `modular architecture extraction`
- `symbol table generation`
- `refactoring queue management`
- `inter-module communication`
- `event handling patterns`
- `dependency injection patterns`

## Technical Implementation Decisions

### Performance Architecture Choices

1. **Staging Table Pattern**: Chosen for 80% performance improvement over row-by-row processing
2. **Batch Processing**: 1000-row batches optimize memory usage vs. processing speed
3. **Generated Columns**: SQLite computed columns for consistent deduplication keys
4. **Index Strategy**: Composite indexes for batch processing queries

### UI Architecture Choices

1. **Responsive Breakpoints**: Mobile-first design with progressive enhancement
2. **Column Virtualization**: AG Grid virtualization for large datasets
3. **Debounced Events**: 200ms debounce prevents excessive resize calculations
4. **Modal Data Pattern**: Global storage with unique identifiers for context passing

### Testing Architecture Choices

1. **Docker-First Testing**: Ensures consistent environment across CI/CD
2. **Progressive Timeouts**: Different timeout values for loading stages
3. **Visual Regression**: Screenshot-based validation with naming conventions
4. **Error Monitoring**: Comprehensive JavaScript and network error capture

## Integration with User Documentation

This technical documentation complements the user-facing docs portal (`docs-source/` → `docs-html/`) by providing:

- **Developer Focus**: Implementation details vs. user instructions
- **Search Optimization**: Keywords for ref.tools vs. user navigation
- **Code Examples**: Function signatures and patterns vs. feature descriptions
- **Architecture Details**: Internal structure vs. external interfaces

The docs portal (`docs-html/`) remains the authoritative source for:

- User guides and tutorials
- API reference for external consumers  
- Installation and configuration
- Feature announcements and changelogs

## Contributing to Technical Docs

### When to Update These Docs

1. **New Functions Added**: Update symbol table immediately
2. **Schema Changes**: Document in database-schema-evolution.md
3. **UI Pattern Changes**: Update AG Grid or responsive documentation
4. **New Test Patterns**: Document in Playwright testing patterns
5. **Performance Changes**: Update performance metrics and benchmarks

### Documentation Standards

1. **Function Signatures**: Include parameter types and return values
2. **Performance Data**: Include benchmarks and measurement methodology
3. **Code Examples**: Provide working code snippets with context
4. **Keywords**: Include searchable terms for ref.tools discovery
5. **Cross-References**: Link related patterns and implementations

This technical documentation ecosystem ensures that developers can efficiently find implementation details, patterns, and architectural decisions through ref.tools searches while maintaining clear separation from user-facing documentation.
