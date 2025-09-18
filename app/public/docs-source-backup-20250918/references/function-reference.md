# Function Reference

Comprehensive reference for all major functions in the HexTrackr codebase, organized by module and responsibility.

---

## Backend Functions (server.js)

### Security & Validation

#### PathValidator Class

```javascript
PathValidator.validatePath(filePath: string): string
```

**Purpose**: Validates file paths against traversal attacks and malformed paths
**Parameters**: `filePath` - Path to validate
**Returns**: Normalized, validated path
**Throws**: Error on invalid paths or traversal attempts
**Location**: `server.js:23-44`

```javascript
PathValidator.safeReadFileSync(filePath: string, options?: string): string
```

**Purpose**: Safely read files with path validation
**Parameters**: `filePath` - File to read, `options` - Encoding options
**Returns**: File contents
**Location**: `server.js:46-49`

```javascript
PathValidator.safeWriteFileSync(filePath: string, data: any, options?: string): void
```

**Purpose**: Safely write files with path validation
**Parameters**: `filePath` - Target file, `data` - Content to write
**Location**: `server.js:51-54`

```javascript
PathValidator.safeExistsSync(filePath: string): boolean
```

**Purpose**: Check file existence with path validation
**Parameters**: `filePath` - File to check
**Returns**: True if file exists and path is valid
**Location**: `server.js:66-73`

### Progress Tracking

#### ProgressTracker Class

```javascript
ProgressTracker.createSession(metadata?: object): string
```

**Purpose**: Create new progress tracking session
**Parameters**: `metadata` - Optional session metadata
**Returns**: Session UUID
**Location**: `server.js:94-97`

```javascript
ProgressTracker.updateProgress(sessionId: string, progress: number, metadata?: object): void
```

**Purpose**: Update session progress with throttling
**Parameters**: `sessionId` - Session identifier, `progress` - Progress value (0-1), `metadata` - Additional data
**Location**: `server.js:130-150`

```javascript
ProgressTracker.completeSession(sessionId: string, result?: object): void
```

**Purpose**: Mark session as complete and emit completion event
**Parameters**: `sessionId` - Session identifier, `result` - Final result data
**Location**: `server.js:165-180`

```javascript
ProgressTracker.cleanupStaleSessions(): void
```

**Purpose**: Remove sessions older than cleanup interval
**Location**: `server.js:200-220`

### Vulnerability Processing

#### Data Normalization

```javascript
normalizeHostname(hostname: string): string
```

**Purpose**: Normalize hostname by removing domain suffixes and standardizing case
**Parameters**: `hostname` - Raw hostname from CSV
**Returns**: Normalized hostname
**Example**: `"web01.corp.local"` → `"web01"`
**Location**: `server.js:350-365`

```javascript
normalizeIPAddress(ipAddress: string): string
```

**Purpose**: Validate and normalize IP addresses
**Parameters**: `ipAddress` - Raw IP address
**Returns**: Normalized IP or null if invalid
**Location**: `server.js:367-380`

```javascript
createDescriptionHash(description: string): string
```

**Purpose**: Generate consistent hash for vulnerability descriptions
**Parameters**: `description` - Vulnerability description text
**Returns**: SHA-256 hash (first 12 characters)
**Location**: `server.js:382-390`

#### Enhanced Deduplication

```javascript
generateEnhancedUniqueKey(mapped: VulnerabilityData): string
```

**Purpose**: Generate unique key using 4-tier strategy for deduplication
**Parameters**: `mapped` - Processed vulnerability data object
**Returns**: Unique key string with tier prefix
**Algorithm**:

1. `asset:${assetId}|plugin:${pluginId}` (highest reliability)
2. `cve:${cve}|host:${hostIdentifier}` (CVE-based)
3. `plugin:${pluginId}|host:${hostIdentifier}|vendor:${vendor}` (plugin-based)
4. `desc:${descriptionHash}|host:${hostIdentifier}` (fallback)
**Location**: `server.js:507-533`

```javascript
getUniqueKeyReliability(uniqueKey: string): number
```

**Purpose**: Score unique key reliability for conflict resolution
**Parameters**: `uniqueKey` - Generated unique key
**Returns**: Reliability score (1-5, lower is better)
**Location**: `server.js:495-504`

```javascript
generateUniqueKey(mapped: VulnerabilityData): string
```

**Purpose**: Legacy unique key generation (maintained for compatibility)
**Parameters**: `mapped` - Vulnerability data object
**Returns**: Legacy format unique key
**Status**: Deprecated, use `generateEnhancedUniqueKey`
**Location**: `server.js:536-557`

#### Data Mapping

```javascript
mapVulnerabilityRow(row: object): VulnerabilityData[]
```

**Purpose**: Transform CSV row into standardized vulnerability objects
**Parameters**: `row` - Raw CSV row object
**Returns**: Array of vulnerability objects (handles multi-CVE rows)
**Features**:

- Multi-CVE splitting on comma/semicolon
- Field normalization and validation
- Severity standardization
- Vendor-specific field mapping
**Location**: `server.js:1100-1200`

```javascript
mapColumnName(columnName: string): string
```

**Purpose**: Map vendor-specific column names to standard fields
**Parameters**: `columnName` - Original column header
**Returns**: Standardized field name
**Mappings**: Handles Tenable, Cisco, Qualys, and generic formats
**Location**: `server.js:1050-1100`

#### Rollover Processing

```javascript
_processVulnerabilityRowsWithRollover(rows: object[], stmt: Statement, importId: number, filePath: string, responseData: object, res: Response, scanDate?: string): void
```

**Purpose**: Process vulnerability import with rollover architecture
**Parameters**:

- `rows` - Parsed CSV rows
- `stmt` - Database statement (legacy)
- `importId` - Import batch identifier
- `filePath` - Source file path
- `responseData` - Response accumulator
- `res` - Express response object
- `scanDate` - Optional scan date override
**Features**:
- Sequential processing to prevent race conditions
- Dual table updates (current + snapshots)
- Stale vulnerability cleanup
- Daily totals aggregation
**Location**: `server.js:559-800`

```javascript
processNextRow(index: number): void
```

**Purpose**: Sequential row processing within rollover function
**Parameters**: `index` - Current row index
**Features**: Prevents race conditions in async database operations
**Location**: `server.js:586-700`

```javascript
finalizeBatch(): void
```

**Purpose**: Complete import batch processing and update daily totals
**Features**:

- Remove stale vulnerabilities not seen in current scan
- Update vulnerability_daily_totals table
- Calculate final import statistics
**Location**: `server.js:750-800`

### Database Operations

#### Table Management

```javascript
ensureRolloverTablesExist(): void
```

**Purpose**: Create rollover tables if they don't exist (idempotent)
**Tables Created**:

- `vulnerabilities_current`
- `vulnerability_snapshots`
- `vulnerability_daily_totals`
**Location**: `server.js:200-300`

```javascript
addMissingColumns(): void
```

**Purpose**: Add new columns to existing tables for backward compatibility
**Features**: Idempotent ALTER TABLE operations
**Location**: `server.js:150-200`

#### Data Queries

```javascript
getVulnerabilityStats(): Promise<object>
```

**Purpose**: Calculate comprehensive vulnerability statistics
**Returns**: Object with severity distributions, totals, and trends
**Queries**:

- Severity breakdowns with percentages
- Active vs resolved counts
- Unique host and CVE counts
- Temporal trend calculations
**Location**: `server.js:900-950`

```javascript
getVulnerabilityTrends(startDate?: string, endDate?: string): Promise<object>
```

**Purpose**: Generate historical trend data
**Parameters**: Optional date range filters
**Returns**: Time-series data for charting
**Location**: `server.js:950-1000`

---

## Frontend Functions

### Core Orchestrator

#### VulnerabilityCoreOrchestrator

```javascript
VulnerabilityCoreOrchestrator.initializeAllModules(parentManager: ModernVulnManager): Promise<void>
```

**Purpose**: Initialize and wire all specialized manager modules
**Parameters**: `parentManager` - Main page manager instance
**Features**: Creates all manager instances and establishes communication
**Location**: `/scripts/shared/vulnerability-core.js:50-100`

```javascript
VulnerabilityCoreOrchestrator.switchView(view: string): void
```

**Purpose**: Coordinate view changes across all modules
**Parameters**: `view` - Target view ('grid', 'cards', 'charts')
**Location**: `/scripts/shared/vulnerability-core.js:150-180`

```javascript
VulnerabilityCoreOrchestrator.loadData(): Promise<void>
```

**Purpose**: Orchestrate data loading across all modules
**Features**: Coordinates data fetching, processing, and UI updates
**Location**: `/scripts/shared/vulnerability-core.js:200-250`

### Data Management

#### VulnerabilityDataManager

```javascript
VulnerabilityDataManager.fetchVulnerabilities(params: object): Promise<VulnerabilityResponse>
```

**Purpose**: Fetch vulnerability data with caching and error handling
**Parameters**: `params` - Query parameters (page, limit, filters)
**Returns**: Promise resolving to vulnerability data and pagination info
**Features**:

- Intelligent caching with TTL
- Request deduplication
- Error retry logic
**Location**: `/scripts/shared/vulnerability-data.js:50-100`

```javascript
VulnerabilityDataManager.importCSV(file: File, options: object): Promise<ImportResult>
```

**Purpose**: Handle CSV file import with progress tracking
**Parameters**: `file` - File object, `options` - Import configuration
**Returns**: Promise resolving to import results
**Features**:

- WebSocket progress updates
- File validation
- Error handling and recovery
**Location**: `/scripts/shared/vulnerability-data.js:200-300`

```javascript
VulnerabilityDataManager.clearCache(): void
```

**Purpose**: Clear cached data and force refresh
**Location**: `/scripts/shared/vulnerability-data.js:350-370`

### Chart Management

#### VulnerabilityChartManager

```javascript
VulnerabilityChartManager.initializeCharts(): Promise<void>
```

**Purpose**: Initialize ApexCharts with theme-aware configuration
**Features**:

- Multi-layer initialization strategy
- Theme detection and application
- Fallback handling for theme loading issues
**Location**: `/scripts/shared/vulnerability-chart-manager.js:100-150`

```javascript
VulnerabilityChartManager.updateCharts(data: VulnerabilityData): void
```

**Purpose**: Update all charts with new data
**Parameters**: `data` - New vulnerability dataset
**Features**: Smooth transitions and performance optimization
**Location**: `/scripts/shared/vulnerability-chart-manager.js:300-400`

```javascript
VulnerabilityChartManager.applyTheme(theme: string): void
```

**Purpose**: Apply theme changes to all chart instances
**Parameters**: `theme` - Theme identifier ('light', 'dark')
**Features**: Dynamic theme switching without recreation
**Location**: `/scripts/shared/vulnerability-chart-manager.js:500-600`

### WebSocket Communication

#### WebSocketClient

```javascript
WebSocketClient.connect(): Promise<boolean>
```

**Purpose**: Establish WebSocket connection with retry logic
**Returns**: Promise resolving to connection success
**Features**:

- Automatic reconnection with exponential backoff
- Connection timeout handling
- Transport fallback (WebSocket → polling)
**Location**: `/scripts/shared/websocket-client.js:41-89`

```javascript
WebSocketClient.subscribe(eventType: string, callback: Function): void
```

**Purpose**: Subscribe to WebSocket events with callback registration
**Parameters**: `eventType` - Event name, `callback` - Handler function
**Location**: `/scripts/shared/websocket-client.js:150-170`

```javascript
WebSocketClient.handleProgressUpdate(data: ProgressData): void
```

**Purpose**: Process progress updates with throttling
**Parameters**: `data` - Progress update data
**Features**: Client-side throttling to prevent UI overload
**Location**: `/scripts/shared/websocket-client.js:200-250`

### Grid Management

#### VulnerabilityGridManager

```javascript
VulnerabilityGridManager.initializeGrid(): void
```

**Purpose**: Configure and initialize AG-Grid with custom renderers
**Features**:

- Virtual scrolling for performance
- Custom cell renderers for CVE links
- Responsive column configuration
**Location**: `/scripts/shared/vulnerability-grid.js:50-150`

```javascript
VulnerabilityGridManager.updateGridData(data: VulnerabilityData[]): void
```

**Purpose**: Update grid with new dataset
**Parameters**: `data` - Array of vulnerability objects
**Features**: Efficient data updates without full re-render
**Location**: `/scripts/shared/vulnerability-grid.js:200-250`

```javascript
VulnerabilityGridManager.exportToCsv(): void
```

**Purpose**: Export current grid data to CSV format
**Features**: Respects current filters and sorting
**Location**: `/scripts/shared/vulnerability-grid.js:400-450`

### Theme Management

#### ThemeController

```javascript
ThemeController.setTheme(theme: string): void
```

**Purpose**: Apply theme across all UI components
**Parameters**: `theme` - Theme identifier
**Features**:

- Cross-tab synchronization
- Component notification system
- WCAG compliance validation
**Location**: `/scripts/shared/theme-controller.js:100-150`

```javascript
ThemeController.getTheme(): string
```

**Purpose**: Get current theme setting
**Returns**: Current theme identifier
**Location**: `/scripts/shared/theme-controller.js:50-70`

### Security Functions

#### Security Utilities

```javascript
sanitizeInput(input: string): string
```

**Purpose**: Sanitize user input for XSS prevention
**Parameters**: `input` - User-provided string
**Returns**: Sanitized string safe for DOM insertion
**Features**: Uses DOMPurify for comprehensive sanitization
**Location**: `/scripts/utils/security.js:20-30`

```javascript
validateCVE(cveId: string): boolean
```

**Purpose**: Validate CVE identifier format
**Parameters**: `cveId` - CVE identifier string
**Returns**: True if valid CVE format
**Pattern**: `CVE-YYYY-NNNN` format validation
**Location**: `/scripts/shared/cve-utilities.js:10-25`

---

## Utility Functions

### Data Processing

```javascript
debounce(func: Function, delay: number): Function
```

**Purpose**: Create debounced function for performance optimization
**Parameters**: `func` - Function to debounce, `delay` - Delay in milliseconds
**Returns**: Debounced function wrapper
**Usage**: Search input handling, resize events
**Location**: `/scripts/utils/performance.js:10-25`

```javascript
formatDate(date: Date, format: string): string
```

**Purpose**: Format dates for display
**Parameters**: `date` - Date object, `format` - Format string
**Returns**: Formatted date string
**Location**: `/scripts/utils/formatting.js:30-50`

### Accessibility

```javascript
announceToScreenReader(message: string, priority: string): void
```

**Purpose**: Announce messages to screen readers
**Parameters**: `message` - Text to announce, `priority` - Announcement priority
**Features**: ARIA live region management
**Location**: `/scripts/utils/accessibility-announcer.js:20-40`

```javascript
validateContrast(foreground: string, background: string): boolean
```

**Purpose**: Validate color contrast for WCAG compliance
**Parameters**: `foreground` - Foreground color, `background` - Background color
**Returns**: True if contrast meets WCAG AA standards
**Location**: `/scripts/utils/wcag-contrast-validator.js:10-30`

---

## Database Functions (init-database.js)

### Schema Creation

```javascript
createTablesIfNotExists(): void
```

**Purpose**: Create initial database schema with indexes
**Tables**: tickets, vulnerability_imports, vulnerabilities, ticket_vulnerabilities
**Features**: Idempotent table creation with proper indexes
**Location**: `/scripts/init-database.js:19-87`

---

## Performance Considerations

### Function Optimization

| Function Category | Optimization Strategy |
|------------------|----------------------|
| **Data Processing** | Batch operations, streaming for large datasets |
| **WebSocket Events** | Throttling (100ms minimum interval) |
| **Database Queries** | Prepared statements, proper indexing |
| **Chart Updates** | Debounced updates, incremental data |
| **Grid Operations** | Virtual scrolling, lazy loading |

### Memory Management

All functions implement proper cleanup:

- Event listener removal
- WebSocket connection cleanup
- Chart instance disposal
- Cache invalidation strategies

---

## Error Handling Patterns

### Consistent Error Handling

```javascript
// Standard error handling pattern used throughout
try {
    const result = await riskyOperation();
    return { success: true, data: result };
} catch (error) {
    console.error('Operation failed:', error);
    this.showErrorToast(error.message);
    return { success: false, error: error.message };
}
```

### Recovery Strategies

Functions implement multiple recovery strategies:

1. **Retry Logic**: Automatic retry for transient failures
2. **Fallback Methods**: Alternative approaches when primary method fails
3. **Graceful Degradation**: Reduced functionality when full features unavailable
4. **User Notification**: Clear error communication to users

---

This function reference provides comprehensive documentation for integration, maintenance, and extension of the HexTrackr system.
