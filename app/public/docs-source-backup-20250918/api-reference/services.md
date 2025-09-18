# Services

This section contains API documentation for Services.

## Source: app/services/**/*.js

## Classes

<table>
  <thead>
    <tr>
      <th>Global</th><th>Description</th>
    </tr>
  </thead>
  <tbody>
<tr>
    <td><a href="#DocsService">DocsService</a></td>
    <td><p>Documentation Service
Handles business logic for documentation statistics and file operations
Extracted from server.js (T030)</p>
</td>
    </tr>
<tr>
    <td><a href="#ProgressService">ProgressService</a></td>
    <td><p>ProgressService - High-level service for managing import/export progress tracking</p>
<p>This service provides a convenient interface for tracking progress of long-running
operations like CSV imports, exports, and batch processing. It builds on top of
the ProgressTracker utility to provide domain-specific functionality.</p>
<p>Features:</p>
<ul>
<li>Import progress tracking with standardized phases</li>
<li>Export progress tracking for various data types</li>
<li>Batch operation progress management</li>
<li>WebSocket integration for real-time updates</li>
<li>Session lifecycle management</li>
<li>Error handling and recovery</li>
</ul>
<p>Usage:
const progressService = new ProgressService(io);
const sessionId = progressService.startImport(&quot;vulnerabilities.csv&quot;, 10000);
progressService.updateImportProgress(sessionId, 500, &quot;processing&quot;);
progressService.completeImport(sessionId, { imported: 9500, errors: 500 });</p>
</td>
    </tr>
<tr>
    <td><a href="#TicketService">TicketService</a></td>
    <td><p>TicketService - Ticket business logic and database operations
Extracted from server.js lines: 3320-3344, 3369-3394, 3396-3422, 3424-3435, 3437-3479, 3482-3498, 1802-1874, 3606-3621</p>
<p>Handles:</p>
<ul>
<li>CRUD operations for tickets table</li>
<li>Device management (JSON field handling)</li>
<li>CSV import processing with mapping</li>
<li>Migration operations</li>
<li>Export functionality</li>
<li>Ticket number generation (XT numbers)</li>
</ul>
<p>T053 INTEGRATION NOTES:
This service requires database initialization before use.
In server.js, after database connection, call:
ticketController.initialize(db);</p>
</td>
    </tr>
<tr>
    <td><a href="#VulnerabilityStatsService">VulnerabilityStatsService</a></td>
    <td><p>VulnerabilityStatsService - Vulnerability statistics and analytics business logic
Extracted from server.js lines: 1996-2016, 2019-2092, 2095-2156, 1719-1798</p>
<p>This service handles all statistical calculations and analytics for vulnerabilities:</p>
<ul>
<li>Current vulnerability statistics with VPR totals and distribution</li>
<li>Recent trends comparison for dashboard cards (current vs previous day)</li>
<li>Historical trending data with date range filtering</li>
<li>Daily totals calculation and rollup operations</li>
<li>Enhanced lifecycle state tracking (active, resolved, reopened)</li>
<li>VPR score aggregations and severity-based metrics</li>
</ul>
<p>Separated from vulnerabilityService due to complexity and distinct concerns:</p>
<ul>
<li>vulnerabilityService: CRUD, import, data management</li>
<li>vulnerabilityStatsService: Analytics, trends, statistics, rollups</li>
</ul>
<p>T053 INTEGRATION NOTES:
This service requires database initialization and works with vulnerability_daily_totals table.
Complex statistical calculations are isolated here for maintainability.</p>
</td>
    </tr>
</tbody>
</table>

## Constants

<table>
  <thead>
    <tr>
      <th>Global</th><th>Description</th>
    </tr>
  </thead>
  <tbody>
<tr>
    <td><a href="#_DatabaseService">_DatabaseService</a></td>
    <td><p>BackupService - Database backup and restore operations
Extracted from server.js lines: 2701, 3274-3798</p>
<p>Handles:</p>
<ul>
<li>Database export to JSON format</li>
<li>Backup file restoration from ZIP/JSON</li>
<li>Data clearing operations</li>
<li>Backup statistics and file management</li>
</ul>
</td>
    </tr>
<tr>
    <td><a href="#sqlite3">sqlite3</a></td>
    <td><p>DatabaseService - Extracted from app/public/server.js lines 12, 1932-3280+</p>
<p>This service encapsulates all SQLite database operations from the monolithic server.js,
providing connection pooling patterns, transaction management, and common query methods.</p>
<p>Key extractions from server.js:</p>
<ul>
<li>Line 12: const sqlite3 = require(&quot;sqlite3&quot;).verbose();</li>
<li>Line 1933: const dbPath = path.join(__dirname, &quot;data&quot;, &quot;hextrackr.db&quot;);</li>
<li>Line 1934: const db = new sqlite3.Database(dbPath);</li>
<li>Lines 2785-3280: Database initialization, schema creation, and operations</li>
<li>Transaction patterns from lines 782-783, 1033-1034, etc.</li>
<li>Error handling patterns throughout server.js database operations</li>
</ul>
</td>
    </tr>
<tr>
    <td><a href="#fs">fs</a></td>
    <td><p>FileService - Centralized file operations using PathValidator
Handles file uploads, CSV processing, backup operations, and temporary files</p>
</td>
    </tr>
<tr>
    <td><a href="#Papa">Papa</a></td>
    <td><p>Import Service - Vendor CSV Import Business Logic</p>
<p>This service handles operational imports of vendor CSV data (e.g., Tenable vulnerability scans),
not backup/restore operations. Those are handled by the backup service.</p>
<p>Business logic extracted from server.js lines: 252-341, 1306-1823, 2291-2335, and various processing functions</p>
<h1 id="integration-dependencies-for-t053">INTEGRATION DEPENDENCIES FOR T053:</h1>
<ul>
<li>Uses DatabaseService for all database operations</li>
<li>Uses PathValidator for secure file operations</li>
<li>Uses helpers for vulnerability mapping and deduplication</li>
<li>Requires existing database schema (staging tables, current tables)</li>
<li>Compatible with existing ProgressTracker WebSocket implementation</li>
<li>Maintains all existing CSV parsing and mapping logic</li>
</ul>
</td>
    </tr>
<tr>
    <td><a href="#Papa">Papa</a></td>
    <td><p>VulnerabilityService - Core vulnerability business logic and database operations
Extracted from server.js lines: 252-341, 343-558, 559-742, 768-1295, 1306-1703, 2159-2283, 2337-2514, 2517-2531, 3304-3317, 3501-3565</p>
<p>This service handles the most complex business logic in HexTrackr:</p>
<ul>
<li>Multi-vendor vulnerability data processing and normalization</li>
<li>Advanced deduplication using enhanced unique keys with confidence scoring</li>
<li>Lifecycle management (active, grace_period, resolved, reopened states)</li>
<li>CSV import processing with staging table support for performance</li>
<li>VPR and CVSS score processing and validation</li>
<li>Host/IP normalization and asset correlation</li>
<li>Daily totals calculation and rollup operations</li>
<li>Large-scale data operations with performance instrumentation</li>
</ul>
<p>Key Dependencies (utility functions remain in server.js):</p>
<ul>
<li>mapVulnerabilityRow: Maps CSV rows to vulnerability objects</li>
<li>generateEnhancedUniqueKey: Multi-tier deduplication key generation</li>
<li>extractScanDateFromFilename: Date extraction from filenames</li>
<li>normalizeHostname, normalizeIPAddress: Network asset normalization</li>
<li>PathValidator: Secure file operations</li>
<li>Papa: CSV parsing</li>
</ul>
<p>T053 INTEGRATION NOTES:
This service requires database initialization and access to utility functions.
Utility functions must remain in server.js for shared access.</p>
</td>
    </tr>
</tbody>
</table>

## Functions

<table>
  <thead>
    <tr>
      <th>Global</th><th>Description</th>
    </tr>
  </thead>
  <tbody>
<tr>
    <td><a href="#extractDateFromFilename">extractDateFromFilename()</a></td>
    <td><p>Extract scan date from filename using various patterns
From server.js lines 2291-2335</p>
</td>
    </tr>
<tr>
    <td><a href="#extractVendorFromFilename">extractVendorFromFilename()</a></td>
    <td><p>Extract vendor from filename based on common patterns</p>
</td>
    </tr>
<tr>
    <td><a href="#mapVulnerabilityRow">mapVulnerabilityRow()</a></td>
    <td><p>Map CSV row to vulnerability record(s) with multi-CVE splitting
From server.js lines 252-341</p>
</td>
    </tr>
<tr>
    <td><a href="#parseCSV">parseCSV()</a></td>
    <td><p>Parse CSV file using PapaParse</p>
</td>
    </tr>
<tr>
    <td><a href="#createImportRecord">createImportRecord()</a></td>
    <td><p>Create import record in database</p>
</td>
    </tr>
<tr>
    <td><a href="#processVulnerabilitiesWithLifecycle">processVulnerabilitiesWithLifecycle()</a></td>
    <td><p>Process vulnerabilities with enhanced lifecycle management
Simplified version of the complex logic from server.js lines 1306+</p>
</td>
    </tr>
<tr>
    <td><a href="#processStagingImport">processStagingImport()</a></td>
    <td><p>Process staging import with progress tracking
High-performance import using staging table for batch processing</p>
</td>
    </tr>
<tr>
    <td><a href="#bulkLoadToStagingTable">bulkLoadToStagingTable()</a></td>
    <td><p>Simplified bulk load to staging table</p>
</td>
    </tr>
<tr>
    <td><a href="#processVulnerabilitiesJSON">processVulnerabilitiesJSON()</a></td>
    <td><p>Process JSON vulnerability data</p>
</td>
    </tr>
<tr>
    <td><a href="#processTicketsJSON">processTicketsJSON()</a></td>
    <td><p>Process JSON ticket data</p>
</td>
    </tr>
<tr>
    <td><a href="#getImportHistory">getImportHistory()</a></td>
    <td><p>Get import history with vulnerability counts</p>
</td>
    </tr>
</tbody>
</table>

<a name="DocsService"></a>

## DocsService

Documentation Service
Handles business logic for documentation statistics and file operations
Extracted from server.js (T030)

**Kind**: global class  

* [DocsService](#DocsService)
  * [.computeStats()](#DocsService+computeStats)
  * [.computeApiEndpoints()](#DocsService+computeApiEndpoints)
  * [.computeJsFunctionCount()](#DocsService+computeJsFunctionCount)
  * [.detectFrameworks()](#DocsService+detectFrameworks)
  * [.findDocsSectionForFilename()](#DocsService+findDocsSectionForFilename)

* * *

<a name="DocsService+computeStats"></a>

### docsService.computeStats()

Compute comprehensive documentation statistics
Combines API endpoints, JS function count, and framework detection
Original: server.js lines 2624-2680

**Kind**: instance method of [<code>DocsService</code>](#DocsService)  

* * *

<a name="DocsService+computeApiEndpoints"></a>

### docsService.computeApiEndpoints()

Count unique Express API routes by scanning server.js file
Extracts routes matching pattern: app.(get|post|put|delete|patch)("/api/...")

**Kind**: instance method of [<code>DocsService</code>](#DocsService)  

* * *

<a name="DocsService+computeJsFunctionCount"></a>

### docsService.computeJsFunctionCount()

Approximate JS function count across scripts/, docs-html/js/, and server.js
Uses multiple regex patterns to detect various function declaration styles

**Kind**: instance method of [<code>DocsService</code>](#DocsService)  

* * *

<a name="DocsService+detectFrameworks"></a>

### docsService.detectFrameworks()

Detect primary frameworks used in the project
Returns static list of core frameworks for HexTrackr

**Kind**: instance method of [<code>DocsService</code>](#DocsService)  

* * *

<a name="DocsService+findDocsSectionForFilename"></a>

### docsService.findDocsSectionForFilename()

Find a section path for a given filename by scanning the content folder
Used by documentation portal routing to resolve direct filename requests
Original: server.js lines 2560-2582

**Kind**: instance method of [<code>DocsService</code>](#DocsService)  

* * *

<a name="ProgressService"></a>

## ProgressService

ProgressService - High-level service for managing import/export progress tracking

This service provides a convenient interface for tracking progress of long-running
operations like CSV imports, exports, and batch processing. It builds on top of
the ProgressTracker utility to provide domain-specific functionality.

Features:

* Import progress tracking with standardized phases
* Export progress tracking for various data types
* Batch operation progress management
* WebSocket integration for real-time updates
* Session lifecycle management
* Error handling and recovery

Usage:
const progressService = new ProgressService(io);
const sessionId = progressService.startImport("vulnerabilities.csv", 10000);
progressService.updateImportProgress(sessionId, 500, "processing");
progressService.completeImport(sessionId, { imported: 9500, errors: 500 });

**Kind**: global class  

* [ProgressService](#ProgressService)
  * [.startImport(filename, totalRows, vendor, scanDate, customSessionId)](#ProgressService+startImport) ⇒ <code>string</code>
  * [.updateImportProgress(sessionId, processed, status, additionalData)](#ProgressService+updateImportProgress) ⇒ <code>boolean</code>
  * [.updateImportParsingProgress(sessionId, rowCount, status)](#ProgressService+updateImportParsingProgress) ⇒ <code>boolean</code>
  * [.updateImportStagingProgress(sessionId, staged, total, status)](#ProgressService+updateImportStagingProgress) ⇒ <code>boolean</code>
  * [.updateImportBatchProgress(sessionId, currentBatch, totalBatches, processedRows, status)](#ProgressService+updateImportBatchProgress) ⇒ <code>boolean</code>
  * [.completeImport(sessionId, results)](#ProgressService+completeImport) ⇒ <code>boolean</code>
  * [.startExport(type, totalItems, format, customSessionId)](#ProgressService+startExport) ⇒ <code>string</code>
  * [.updateExportProgress(sessionId, processed, phase, status)](#ProgressService+updateExportProgress) ⇒ <code>boolean</code>
  * [.completeExport(sessionId, results)](#ProgressService+completeExport) ⇒ <code>boolean</code>
  * [.getProgress(sessionId)](#ProgressService+getProgress) ⇒ <code>Object</code> \| <code>null</code>
  * [.handleError(sessionId, errorMessage, errorData)](#ProgressService+handleError) ⇒ <code>boolean</code>
  * [.getActiveSessions()](#ProgressService+getActiveSessions) ⇒ <code>Array</code>
  * [.cleanupSession(sessionId)](#ProgressService+cleanupSession) ⇒ <code>boolean</code>
  * [.broadcastEvent(eventName, data)](#ProgressService+broadcastEvent)

* * *

<a name="ProgressService+startImport"></a>

### progressService.startImport(filename, totalRows, vendor, scanDate, customSessionId) ⇒ <code>string</code>

Start tracking progress for a CSV import operation

**Kind**: instance method of [<code>ProgressService</code>](#ProgressService)  
**Returns**: <code>string</code> - sessionId - Unique session identifier  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| filename | <code>string</code> |  | Name of the file being imported |
| totalRows | <code>number</code> |  | Total number of rows to process |
| vendor | <code>string</code> | <code>&quot;unknown&quot;</code> | Vendor/source of the data |
| scanDate | <code>string</code> | <code>null</code> | Date of the scan data |
| customSessionId | <code>string</code> | <code>null</code> | Optional custom session ID |

* * *

<a name="ProgressService+updateImportProgress"></a>

### progressService.updateImportProgress(sessionId, processed, status, additionalData) ⇒ <code>boolean</code>

Update import progress based on current phase and processed items

**Kind**: instance method of [<code>ProgressService</code>](#ProgressService)  
**Returns**: <code>boolean</code> - Success status  

| Param | Type | Description |
| --- | --- | --- |
| sessionId | <code>string</code> | Session identifier |
| processed | <code>number</code> | Number of items processed in current phase |
| status | <code>string</code> | Current operation status |
| additionalData | <code>Object</code> | Additional metadata |

* * *

<a name="ProgressService+updateImportParsingProgress"></a>

### progressService.updateImportParsingProgress(sessionId, rowCount, status) ⇒ <code>boolean</code>

Update import progress for CSV parsing phase

**Kind**: instance method of [<code>ProgressService</code>](#ProgressService)  
**Returns**: <code>boolean</code> - Success status  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| sessionId | <code>string</code> |  | Session identifier |
| rowCount | <code>number</code> |  | Number of rows parsed |
| status | <code>string</code> | <code>&quot;parsing&quot;</code> | Parsing status |

* * *

<a name="ProgressService+updateImportStagingProgress"></a>

### progressService.updateImportStagingProgress(sessionId, staged, total, status) ⇒ <code>boolean</code>

Update import progress for staging phase

**Kind**: instance method of [<code>ProgressService</code>](#ProgressService)  
**Returns**: <code>boolean</code> - Success status  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| sessionId | <code>string</code> |  | Session identifier |
| staged | <code>number</code> |  | Number of rows staged |
| total | <code>number</code> |  | Total rows to stage |
| status | <code>string</code> | <code>&quot;staging&quot;</code> | Staging status |

* * *

<a name="ProgressService+updateImportBatchProgress"></a>

### progressService.updateImportBatchProgress(sessionId, currentBatch, totalBatches, processedRows, status) ⇒ <code>boolean</code>

Update import progress for batch processing phase

**Kind**: instance method of [<code>ProgressService</code>](#ProgressService)  
**Returns**: <code>boolean</code> - Success status  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| sessionId | <code>string</code> |  | Session identifier |
| currentBatch | <code>number</code> |  | Current batch number |
| totalBatches | <code>number</code> |  | Total number of batches |
| processedRows | <code>number</code> |  | Total rows processed so far |
| status | <code>string</code> | <code>&quot;processing&quot;</code> | Processing status |

* * *

<a name="ProgressService+completeImport"></a>

### progressService.completeImport(sessionId, results) ⇒ <code>boolean</code>

Complete an import operation with final results

**Kind**: instance method of [<code>ProgressService</code>](#ProgressService)  
**Returns**: <code>boolean</code> - Success status  

| Param | Type | Description |
| --- | --- | --- |
| sessionId | <code>string</code> | Session identifier |
| results | <code>Object</code> | Final import results |

* * *

<a name="ProgressService+startExport"></a>

### progressService.startExport(type, totalItems, format, customSessionId) ⇒ <code>string</code>

Start tracking progress for an export operation

**Kind**: instance method of [<code>ProgressService</code>](#ProgressService)  
**Returns**: <code>string</code> - sessionId - Unique session identifier  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| type | <code>string</code> |  | Type of export (vulnerabilities, tickets, combined) |
| totalItems | <code>number</code> |  | Total number of items to export |
| format | <code>string</code> | <code>&quot;json&quot;</code> | Export format (json, csv, xlsx) |
| customSessionId | <code>string</code> | <code>null</code> | Optional custom session ID |

* * *

<a name="ProgressService+updateExportProgress"></a>

### progressService.updateExportProgress(sessionId, processed, phase, status) ⇒ <code>boolean</code>

Update export progress based on current phase

**Kind**: instance method of [<code>ProgressService</code>](#ProgressService)  
**Returns**: <code>boolean</code> - Success status  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| sessionId | <code>string</code> |  | Session identifier |
| processed | <code>number</code> |  | Number of items processed |
| phase | <code>string</code> | <code>&quot;querying&quot;</code> | Current export phase |
| status | <code>string</code> |  | Current operation status |

* * *

<a name="ProgressService+completeExport"></a>

### progressService.completeExport(sessionId, results) ⇒ <code>boolean</code>

Complete an export operation with final results

**Kind**: instance method of [<code>ProgressService</code>](#ProgressService)  
**Returns**: <code>boolean</code> - Success status  

| Param | Type | Description |
| --- | --- | --- |
| sessionId | <code>string</code> | Session identifier |
| results | <code>Object</code> | Final export results |

* * *

<a name="ProgressService+getProgress"></a>

### progressService.getProgress(sessionId) ⇒ <code>Object</code> \| <code>null</code>

Get progress information for a session

**Kind**: instance method of [<code>ProgressService</code>](#ProgressService)  
**Returns**: <code>Object</code> \| <code>null</code> - Session progress data or null if not found  

| Param | Type | Description |
| --- | --- | --- |
| sessionId | <code>string</code> | Session identifier |

* * *

<a name="ProgressService+handleError"></a>

### progressService.handleError(sessionId, errorMessage, errorData) ⇒ <code>boolean</code>

Handle import/export errors

**Kind**: instance method of [<code>ProgressService</code>](#ProgressService)  
**Returns**: <code>boolean</code> - Success status  

| Param | Type | Description |
| --- | --- | --- |
| sessionId | <code>string</code> | Session identifier |
| errorMessage | <code>string</code> | Error description |
| errorData | <code>Object</code> | Error details |

* * *

<a name="ProgressService+getActiveSessions"></a>

### progressService.getActiveSessions() ⇒ <code>Array</code>

Get all active progress sessions

**Kind**: instance method of [<code>ProgressService</code>](#ProgressService)  
**Returns**: <code>Array</code> - Array of active session objects  

* * *

<a name="ProgressService+cleanupSession"></a>

### progressService.cleanupSession(sessionId) ⇒ <code>boolean</code>

Clean up a specific session

**Kind**: instance method of [<code>ProgressService</code>](#ProgressService)  
**Returns**: <code>boolean</code> - Success status  

| Param | Type | Description |
| --- | --- | --- |
| sessionId | <code>string</code> | Session identifier |

* * *

<a name="ProgressService+broadcastEvent"></a>

### progressService.broadcastEvent(eventName, data)

Broadcast a custom progress event to all connected clients

**Kind**: instance method of [<code>ProgressService</code>](#ProgressService)  

| Param | Type | Description |
| --- | --- | --- |
| eventName | <code>string</code> | Event name |
| data | <code>Object</code> | Event data |

* * *

<a name="TicketService"></a>

## TicketService

TicketService - Ticket business logic and database operations
Extracted from server.js lines: 3320-3344, 3369-3394, 3396-3422, 3424-3435, 3437-3479, 3482-3498, 1802-1874, 3606-3621

Handles:

* CRUD operations for tickets table
* Device management (JSON field handling)
* CSV import processing with mapping
* Migration operations
* Export functionality
* Ticket number generation (XT numbers)

T053 INTEGRATION NOTES:
This service requires database initialization before use.
In server.js, after database connection, call:
ticketController.initialize(db);

**Kind**: global class  

* [TicketService](#TicketService)
  * [.initialize(database)](#TicketService+initialize)
  * [.getAllTickets()](#TicketService+getAllTickets)
  * [.createTicket()](#TicketService+createTicket)
  * [.updateTicket()](#TicketService+updateTicket)
  * [.deleteTicket()](#TicketService+deleteTicket)
  * [.migrateTickets()](#TicketService+migrateTickets)
  * [.importTickets()](#TicketService+importTickets)
  * [._mapTicketRow()](#TicketService+_mapTicketRow)
  * [.exportTickets()](#TicketService+exportTickets)
  * [.generateNextXTNumber()](#TicketService+generateNextXTNumber)
  * [.updateTicketDevices()](#TicketService+updateTicketDevices)
  * [.getTicketById()](#TicketService+getTicketById)

* * *

<a name="TicketService+initialize"></a>

### ticketService.initialize(database)

Initialize service with database connection

**Kind**: instance method of [<code>TicketService</code>](#TicketService)  

| Param | Type | Description |
| --- | --- | --- |
| database | <code>sqlite3.Database</code> | Database connection from server.js |

* * *

<a name="TicketService+getAllTickets"></a>

### ticketService.getAllTickets()

Get all tickets with ID normalization
Extracted from server.js line 3320-3344

**Kind**: instance method of [<code>TicketService</code>](#TicketService)  

* * *

<a name="TicketService+createTicket"></a>

### ticketService.createTicket()

Create new ticket
Extracted from server.js line 3369-3394

**Kind**: instance method of [<code>TicketService</code>](#TicketService)  

* * *

<a name="TicketService+updateTicket"></a>

### ticketService.updateTicket()

Update existing ticket
Extracted from server.js line 3396-3422

**Kind**: instance method of [<code>TicketService</code>](#TicketService)  

* * *

<a name="TicketService+deleteTicket"></a>

### ticketService.deleteTicket()

Delete ticket by ID
Extracted from server.js line 3424-3435

**Kind**: instance method of [<code>TicketService</code>](#TicketService)  

* * *

<a name="TicketService+migrateTickets"></a>

### ticketService.migrateTickets()

Migrate tickets from legacy format
Extracted from server.js line 3437-3479

**Kind**: instance method of [<code>TicketService</code>](#TicketService)  

* * *

<a name="TicketService+importTickets"></a>

### ticketService.importTickets()

Import tickets from CSV data
Extracted from server.js line 3482-3498 + processTicketRows (1825-1874) + mapTicketRow (1802-1823)

**Kind**: instance method of [<code>TicketService</code>](#TicketService)  

* * *

<a name="TicketService+_mapTicketRow"></a>

### ticketService.\_mapTicketRow()

Map CSV row to ticket object
Extracted from server.js line 1802-1823

**Kind**: instance method of [<code>TicketService</code>](#TicketService)  

* * *

<a name="TicketService+exportTickets"></a>

### ticketService.exportTickets()

Export tickets for backup
Extracted from server.js line 3606-3621

**Kind**: instance method of [<code>TicketService</code>](#TicketService)  

* * *

<a name="TicketService+generateNextXTNumber"></a>

### ticketService.generateNextXTNumber()

Generate next XT number for new tickets

**Kind**: instance method of [<code>TicketService</code>](#TicketService)  

* * *

<a name="TicketService+updateTicketDevices"></a>

### ticketService.updateTicketDevices()

Update devices for a specific ticket
Helper method for device management

**Kind**: instance method of [<code>TicketService</code>](#TicketService)  

* * *

<a name="TicketService+getTicketById"></a>

### ticketService.getTicketById()

Get ticket by ID
Helper method for single ticket retrieval

**Kind**: instance method of [<code>TicketService</code>](#TicketService)  

* * *

<a name="VulnerabilityStatsService"></a>

## VulnerabilityStatsService

VulnerabilityStatsService - Vulnerability statistics and analytics business logic
Extracted from server.js lines: 1996-2016, 2019-2092, 2095-2156, 1719-1798

This service handles all statistical calculations and analytics for vulnerabilities:

* Current vulnerability statistics with VPR totals and distribution
* Recent trends comparison for dashboard cards (current vs previous day)
* Historical trending data with date range filtering
* Daily totals calculation and rollup operations
* Enhanced lifecycle state tracking (active, resolved, reopened)
* VPR score aggregations and severity-based metrics

Separated from vulnerabilityService due to complexity and distinct concerns:

* vulnerabilityService: CRUD, import, data management
* vulnerabilityStatsService: Analytics, trends, statistics, rollups

T053 INTEGRATION NOTES:
This service requires database initialization and works with vulnerability_daily_totals table.
Complex statistical calculations are isolated here for maintainability.

**Kind**: global class  

* [VulnerabilityStatsService](#VulnerabilityStatsService)
  * [.initialize(database)](#VulnerabilityStatsService+initialize)
  * [.getStats()](#VulnerabilityStatsService+getStats)
  * [.getRecentTrends()](#VulnerabilityStatsService+getRecentTrends)
  * [.getTrends()](#VulnerabilityStatsService+getTrends)
  * [.calculateAndStoreDailyTotalsEnhanced()](#VulnerabilityStatsService+calculateAndStoreDailyTotalsEnhanced)
  * [.getVulnerabilityDistribution()](#VulnerabilityStatsService+getVulnerabilityDistribution)
  * [.getTopVulnerableHosts()](#VulnerabilityStatsService+getTopVulnerableHosts)
  * [.getVprScoreDistribution()](#VulnerabilityStatsService+getVprScoreDistribution)
  * [.getVulnerabilityAging()](#VulnerabilityStatsService+getVulnerabilityAging)
  * [.getDailyTotalsRange()](#VulnerabilityStatsService+getDailyTotalsRange)

* * *

<a name="VulnerabilityStatsService+initialize"></a>

### vulnerabilityStatsService.initialize(database)

Initialize service with database connection

**Kind**: instance method of [<code>VulnerabilityStatsService</code>](#VulnerabilityStatsService)  

| Param | Type | Description |
| --- | --- | --- |
| database | <code>sqlite3.Database</code> | Database connection from server.js |

* * *

<a name="VulnerabilityStatsService+getStats"></a>

### vulnerabilityStatsService.getStats()

Get vulnerability statistics with VPR totals
Extracted from server.js lines 1996-2016

**Kind**: instance method of [<code>VulnerabilityStatsService</code>](#VulnerabilityStatsService)  

* * *

<a name="VulnerabilityStatsService+getRecentTrends"></a>

### vulnerabilityStatsService.getRecentTrends()

Get recent vulnerability statistics with trend comparison (for dashboard cards)
Extracted from server.js lines 2019-2092

**Kind**: instance method of [<code>VulnerabilityStatsService</code>](#VulnerabilityStatsService)  

* * *

<a name="VulnerabilityStatsService+getTrends"></a>

### vulnerabilityStatsService.getTrends()

Get historical trending data with optional date range filtering
Extracted from server.js lines 2095-2156

**Kind**: instance method of [<code>VulnerabilityStatsService</code>](#VulnerabilityStatsService)  

* * *

<a name="VulnerabilityStatsService+calculateAndStoreDailyTotalsEnhanced"></a>

### vulnerabilityStatsService.calculateAndStoreDailyTotalsEnhanced()

Calculate and store enhanced daily totals with lifecycle states
Extracted from server.js lines 1719-1798

**Kind**: instance method of [<code>VulnerabilityStatsService</code>](#VulnerabilityStatsService)  

* * *

<a name="VulnerabilityStatsService+getVulnerabilityDistribution"></a>

### vulnerabilityStatsService.getVulnerabilityDistribution()

Get vulnerability distribution by severity
Helper method for analytics

**Kind**: instance method of [<code>VulnerabilityStatsService</code>](#VulnerabilityStatsService)  

* * *

<a name="VulnerabilityStatsService+getTopVulnerableHosts"></a>

### vulnerabilityStatsService.getTopVulnerableHosts()

Get top vulnerable hosts by VPR score
Helper method for analytics

**Kind**: instance method of [<code>VulnerabilityStatsService</code>](#VulnerabilityStatsService)  

* * *

<a name="VulnerabilityStatsService+getVprScoreDistribution"></a>

### vulnerabilityStatsService.getVprScoreDistribution()

Get VPR score distribution statistics
Helper method for analytics

**Kind**: instance method of [<code>VulnerabilityStatsService</code>](#VulnerabilityStatsService)  

* * *

<a name="VulnerabilityStatsService+getVulnerabilityAging"></a>

### vulnerabilityStatsService.getVulnerabilityAging()

Get vulnerability aging metrics
Helper method for analytics

**Kind**: instance method of [<code>VulnerabilityStatsService</code>](#VulnerabilityStatsService)  

* * *

<a name="VulnerabilityStatsService+getDailyTotalsRange"></a>

### vulnerabilityStatsService.getDailyTotalsRange()

Get daily totals for a specific date range
Helper method for custom analytics

**Kind**: instance method of [<code>VulnerabilityStatsService</code>](#VulnerabilityStatsService)  

* * *

<a name="_DatabaseService"></a>

## \_DatabaseService

BackupService - Database backup and restore operations
Extracted from server.js lines: 2701, 3274-3798

Handles:

* Database export to JSON format
* Backup file restoration from ZIP/JSON
* Data clearing operations
* Backup statistics and file management

**Kind**: global constant  

* * *

<a name="sqlite3"></a>

## sqlite3

DatabaseService - Extracted from app/public/server.js lines 12, 1932-3280+

This service encapsulates all SQLite database operations from the monolithic server.js,
providing connection pooling patterns, transaction management, and common query methods.

Key extractions from server.js:

* Line 12: const sqlite3 = require("sqlite3").verbose();
* Line 1933: const dbPath = path.join(__dirname, "data", "hextrackr.db");
* Line 1934: const db = new sqlite3.Database(dbPath);
* Lines 2785-3280: Database initialization, schema creation, and operations
* Transaction patterns from lines 782-783, 1033-1034, etc.
* Error handling patterns throughout server.js database operations

**Kind**: global constant  

* * *

<a name="fs"></a>

## fs

FileService - Centralized file operations using PathValidator
Handles file uploads, CSV processing, backup operations, and temporary files

**Kind**: global constant  

* * *

<a name="Papa"></a>

## Papa

Import Service - Vendor CSV Import Business Logic

This service handles operational imports of vendor CSV data (e.g., Tenable vulnerability scans),
not backup/restore operations. Those are handled by the backup service.

Business logic extracted from server.js lines: 252-341, 1306-1823, 2291-2335, and various processing functions

INTEGRATION DEPENDENCIES FOR T053
==================================

* Uses DatabaseService for all database operations
* Uses PathValidator for secure file operations
* Uses helpers for vulnerability mapping and deduplication
* Requires existing database schema (staging tables, current tables)
* Compatible with existing ProgressTracker WebSocket implementation
* Maintains all existing CSV parsing and mapping logic

**Kind**: global constant  

* * *

<a name="Papa"></a>

## Papa

VulnerabilityService - Core vulnerability business logic and database operations
Extracted from server.js lines: 252-341, 343-558, 559-742, 768-1295, 1306-1703, 2159-2283, 2337-2514, 2517-2531, 3304-3317, 3501-3565

This service handles the most complex business logic in HexTrackr:

* Multi-vendor vulnerability data processing and normalization
* Advanced deduplication using enhanced unique keys with confidence scoring
* Lifecycle management (active, grace_period, resolved, reopened states)
* CSV import processing with staging table support for performance
* VPR and CVSS score processing and validation
* Host/IP normalization and asset correlation
* Daily totals calculation and rollup operations
* Large-scale data operations with performance instrumentation

Key Dependencies (utility functions remain in server.js):

* mapVulnerabilityRow: Maps CSV rows to vulnerability objects
* generateEnhancedUniqueKey: Multi-tier deduplication key generation
* extractScanDateFromFilename: Date extraction from filenames
* normalizeHostname, normalizeIPAddress: Network asset normalization
* PathValidator: Secure file operations
* Papa: CSV parsing

T053 INTEGRATION NOTES:
This service requires database initialization and access to utility functions.
Utility functions must remain in server.js for shared access.

**Kind**: global constant  

* * *

<a name="extractDateFromFilename"></a>

## extractDateFromFilename()

Extract scan date from filename using various patterns
From server.js lines 2291-2335

**Kind**: global function  

* * *

<a name="extractVendorFromFilename"></a>

## extractVendorFromFilename()

Extract vendor from filename based on common patterns

**Kind**: global function  

* * *

<a name="mapVulnerabilityRow"></a>

## mapVulnerabilityRow()

Map CSV row to vulnerability record(s) with multi-CVE splitting
From server.js lines 252-341

**Kind**: global function  

* * *

<a name="parseCSV"></a>

## parseCSV()

Parse CSV file using PapaParse

**Kind**: global function  

* * *

<a name="createImportRecord"></a>

## createImportRecord()

Create import record in database

**Kind**: global function  

* * *

<a name="processVulnerabilitiesWithLifecycle"></a>

## processVulnerabilitiesWithLifecycle()

Process vulnerabilities with enhanced lifecycle management
Simplified version of the complex logic from server.js lines 1306+

**Kind**: global function  

* * *

<a name="processStagingImport"></a>

## processStagingImport()

Process staging import with progress tracking
High-performance import using staging table for batch processing

**Kind**: global function  

* * *

<a name="bulkLoadToStagingTable"></a>

## bulkLoadToStagingTable()

Simplified bulk load to staging table

**Kind**: global function  

* * *

<a name="processVulnerabilitiesJSON"></a>

## processVulnerabilitiesJSON()

Process JSON vulnerability data

**Kind**: global function  

* * *

<a name="processTicketsJSON"></a>

## processTicketsJSON()

Process JSON ticket data

**Kind**: global function  

* * *

<a name="getImportHistory"></a>

## getImportHistory()

Get import history with vulnerability counts

**Kind**: global function  

* * *

---
