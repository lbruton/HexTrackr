# Complete API Reference

This document contains the complete API reference for HexTrackr.

---

# API Routes

This section contains API documentation for API Routes.

## Source: app/routes/**/*.js

## Constants

<table>
  <thead>
    <tr>
      <th>Global</th><th>Description</th>
    </tr>
  </thead>
  <tbody>
<tr>
    <td><a href="#express">express</a></td>
    <td><p>Backup and Restore Routes
Extracted from server.js lines: 2701, 3274-3798</p>
<p>Routes:</p>
<ul>
<li>DELETE /api/backup/clear/:type - Clear data (line 2701)</li>
<li>GET /api/backup/stats - Get backup statistics (line 3274)</li>
<li>GET /api/backup/vulnerabilities - Export vulnerabilities (line 3304)</li>
<li>GET /api/backup/tickets - Export tickets (line 3606)</li>
<li>GET /api/backup/all - Export complete backup (line 3623)</li>
<li>POST /api/restore - Restore from backup file (line 3654)</li>
</ul>
</td>
    </tr>
<tr>
    <td><a href="#express">express</a></td>
    <td><p>Import Routes - Vendor CSV Import Operations</p>
<p>This module handles operational imports of vendor CSV data (e.g., Tenable vulnerability scans),
not backup/restore operations. Those are handled by the backup module.</p>
<p>Routes extracted from server.js lines: 2337-2399, 2403-2531, 3482-3604, 2534-2550</p>
<h1 id="integration-instructions-for-t053">INTEGRATION INSTRUCTIONS FOR T053:</h1>
<ol>
<li>In server.js, add: const importRoutes = require(&quot;./routes/imports&quot;);</li>
<li>In server.js, add: importController.setProgressTracker(progressTracker);</li>
<li>In server.js, add: app.use(&quot;/api&quot;, importRoutes);</li>
<li>Remove the corresponding routes from server.js (lines documented above)</li>
<li>Ensure multer upload configuration matches server.js exactly</li>
</ol>
<p>ROUTE MAPPING:</p>
<ul>
<li>/api/vulnerabilities/import -&gt; router.post(&quot;/vulnerabilities/import&quot;)</li>
<li>/api/vulnerabilities/import-staging -&gt; router.post(&quot;/vulnerabilities/import-staging&quot;)</li>
<li>/api/import/vulnerabilities -&gt; router.post(&quot;/import/vulnerabilities&quot;)</li>
<li>/api/import/tickets -&gt; router.post(&quot;/import/tickets&quot;)</li>
<li>/api/imports -&gt; router.get(&quot;/imports&quot;)</li>
<li>/api/import/progress/:sessionId -&gt; router.get(&quot;/import/progress/:sessionId&quot;)</li>
</ul>
</td>
    </tr>
<tr>
    <td><a href="#express">express</a></td>
    <td><p>Ticket Routes
Extracted from server.js lines: 3320-3344, 3369-3394, 3396-3422, 3424-3435, 3437-3479, 3482-3498, 3606-3621</p>
<p>Routes:</p>
<ul>
<li>GET /api/tickets - List all tickets (line 3320)</li>
<li>POST /api/tickets - Create new ticket (line 3369)</li>
<li>PUT /api/tickets/:id - Update ticket (line 3396)</li>
<li>DELETE /api/tickets/:id - Delete ticket (line 3424)</li>
<li>POST /api/tickets/migrate - Migrate tickets (line 3437)</li>
<li>POST /api/import/tickets - Import tickets from CSV (line 3482) - NOTE: This route needs special handling in T053</li>
<li>GET /api/backup/tickets - Export tickets (line 3606) - NOTE: This conflicts with backup routes in T053</li>
</ul>
</td>
    </tr>
<tr>
    <td><a href="#express">express</a></td>
    <td><p>Vulnerability Routes
Extracted from server.js lines: 1996-2016, 2019-2092, 2095-2156, 2159-2218, 2221-2283, 2337-2399, 2403-2514, 2517-2531, 3304-3317, 3501-3565</p>
<p>This is the largest and most complex module in HexTrackr, handling:</p>
<ul>
<li>Core vulnerability CRUD operations</li>
<li>Statistics and analytics endpoints</li>
<li>Import/export functionality (CSV imports, backup exports)</li>
<li>Trend analysis and historical data</li>
<li>Staging-based imports for performance</li>
<li>Multi-vendor vulnerability data processing</li>
</ul>
<p>Routes:</p>
<ul>
<li>GET /api/vulnerabilities/stats - Statistics with VPR totals (lines 1996-2016)</li>
<li>GET /api/vulnerabilities/recent-trends - Recent trends for dashboard cards (lines 2019-2092)</li>
<li>GET /api/vulnerabilities/trends - Historical trending data (lines 2095-2156)</li>
<li>GET /api/vulnerabilities - List vulnerabilities with pagination/filters (lines 2159-2218)</li>
<li>GET /api/vulnerabilities/resolved - List resolved vulnerabilities (lines 2221-2283)</li>
<li>POST /api/vulnerabilities/import - Standard CSV import (lines 2337-2399)</li>
<li>POST /api/vulnerabilities/import-staging - High-performance staging import (lines 2403-2514)</li>
<li>DELETE /api/vulnerabilities/clear - Clear all vulnerability data (lines 2517-2531)</li>
<li>GET /api/backup/vulnerabilities - Export vulnerability data (lines 3304-3317) - NOTE: Conflicts with backup routes</li>
<li>POST /api/import/vulnerabilities - Web-based import (lines 3501-3565) - NOTE: Part of import system</li>
</ul>
</td>
    </tr>
</tbody>
</table>

<a name="express"></a>

## express

Backup and Restore Routes
Extracted from server.js lines: 2701, 3274-3798

Routes:

- DELETE /api/backup/clear/:type - Clear data (line 2701)
- GET /api/backup/stats - Get backup statistics (line 3274)
- GET /api/backup/vulnerabilities - Export vulnerabilities (line 3304)
- GET /api/backup/tickets - Export tickets (line 3606)
- GET /api/backup/all - Export complete backup (line 3623)
- POST /api/restore - Restore from backup file (line 3654)

**Kind**: global constant  

* * *

<a name="express"></a>

## express

Import Routes - Vendor CSV Import Operations

This module handles operational imports of vendor CSV data (e.g., Tenable vulnerability scans),
not backup/restore operations. Those are handled by the backup module.

Routes extracted from server.js lines: 2337-2399, 2403-2531, 3482-3604, 2534-2550

INTEGRATION INSTRUCTIONS FOR T053
==================================

1. In server.js, add: const importRoutes = require("./routes/imports");
2. In server.js, add: importController.setProgressTracker(progressTracker);
3. In server.js, add: app.use("/api", importRoutes);
4. Remove the corresponding routes from server.js (lines documented above)
5. Ensure multer upload configuration matches server.js exactly

ROUTE MAPPING:

- /api/vulnerabilities/import -> router.post("/vulnerabilities/import")
- /api/vulnerabilities/import-staging -> router.post("/vulnerabilities/import-staging")
- /api/import/vulnerabilities -> router.post("/import/vulnerabilities")
- /api/import/tickets -> router.post("/import/tickets")
- /api/imports -> router.get("/imports")
- /api/import/progress/:sessionId -> router.get("/import/progress/:sessionId")

**Kind**: global constant  

* * *

<a name="express"></a>

## express

Ticket Routes
Extracted from server.js lines: 3320-3344, 3369-3394, 3396-3422, 3424-3435, 3437-3479, 3482-3498, 3606-3621

Routes:

- GET /api/tickets - List all tickets (line 3320)
- POST /api/tickets - Create new ticket (line 3369)
- PUT /api/tickets/:id - Update ticket (line 3396)
- DELETE /api/tickets/:id - Delete ticket (line 3424)
- POST /api/tickets/migrate - Migrate tickets (line 3437)
- POST /api/import/tickets - Import tickets from CSV (line 3482) - NOTE: This route needs special handling in T053
- GET /api/backup/tickets - Export tickets (line 3606) - NOTE: This conflicts with backup routes in T053

**Kind**: global constant  

* * *

<a name="express"></a>

## express

Vulnerability Routes
Extracted from server.js lines: 1996-2016, 2019-2092, 2095-2156, 2159-2218, 2221-2283, 2337-2399, 2403-2514, 2517-2531, 3304-3317, 3501-3565

This is the largest and most complex module in HexTrackr, handling:

- Core vulnerability CRUD operations
- Statistics and analytics endpoints
- Import/export functionality (CSV imports, backup exports)
- Trend analysis and historical data
- Staging-based imports for performance
- Multi-vendor vulnerability data processing

Routes:

- GET /api/vulnerabilities/stats - Statistics with VPR totals (lines 1996-2016)
- GET /api/vulnerabilities/recent-trends - Recent trends for dashboard cards (lines 2019-2092)
- GET /api/vulnerabilities/trends - Historical trending data (lines 2095-2156)
- GET /api/vulnerabilities - List vulnerabilities with pagination/filters (lines 2159-2218)
- GET /api/vulnerabilities/resolved - List resolved vulnerabilities (lines 2221-2283)
- POST /api/vulnerabilities/import - Standard CSV import (lines 2337-2399)
- POST /api/vulnerabilities/import-staging - High-performance staging import (lines 2403-2514)
- DELETE /api/vulnerabilities/clear - Clear all vulnerability data (lines 2517-2531)
- GET /api/backup/vulnerabilities - Export vulnerability data (lines 3304-3317) - NOTE: Conflicts with backup routes
- POST /api/import/vulnerabilities - Web-based import (lines 3501-3565) - NOTE: Part of import system

**Kind**: global constant  

* * *

---

# Backup and Restore API

This API provides endpoints for data export, backup, restore, and clearing operations.

---

## Endpoints

### GET /api/backup/stats

- **Description**: Retrieves statistics about the database, including record counts and file size.
- **Response**: `200 OK`

    ```json
    {
      "vulnerabilities": 100553,
      "tickets": 17,
      "total": 100570,
      "dbSize": 5468160
    }
    ```

### GET /api/backup/tickets

- **Description**: Exports all tickets as a JSON object.
- **Response**: `200 OK`

    ```json
    {
      "type": "tickets",
      "count": 17,
      "data": [
        { "id": "TICK-123", "xt_number": "XT001", ... }
      ],
      "exported_at": "2025-09-03T12:00:00.000Z"
    }
    ```

### GET /api/backup/vulnerabilities

- **Description**: Exports up to 10,000 vulnerabilities as a JSON object.
- **DEPRECATED**: This endpoint uses an outdated database schema and will be removed in a future version.
- **Response**: `200 OK`

```json
{
  "type": "vulnerabilities",
  "count": 10000,
  "data": [
    { "id": 1, "hostname": "server-01", ... }
  ],
```

### POST /api/restore

- **Description**: Restore system data from a backup ZIP file. The ZIP file should contain `tickets.json` and/or `vulnerabilities.json`.
- **Body**: `multipart/form-data`
  - `file`: The backup ZIP file (required).
  - `type`: The type of data to restore: "tickets", "vulnerabilities", or "all" (required).
  - `clearExisting`: If "true", deletes existing data of the specified type before restoring (optional, default: "false").
- **Response**: `200 OK`

```json
{
  "success": true,
  "message": "Successfully restored 3012 records",
  "count": 3012
}
```

      "exported_at": "2025-09-03T12:00:00.000Z"
    }
    ```

### GET /api/backup/all

- **Description**: Exports all tickets and up to 10,000 vulnerabilities as a single JSON object.
- **Response**: `200 OK`

    ```json
    {
      "type": "complete_backup",
      "vulnerabilities": {
        "count": 10000,
        "data": [ ... ]
      },
      "tickets": {
        "count": 17,
        "data": [ ... ]
      },
      "exported_at": "2025-09-03T12:00:00.000Z"
    }
    ```

### DELETE /api/backup/clear/:type

- **Description**: Deletes data of a specified type. This is a destructive operation.
- **URL Parameters**:
  - `type` (string, required): The type of data to clear. Can be `tickets`, `vulnerabilities`, or `all`.
- **Response**: `200 OK`

```json
{
  "message": "Tickets cleared successfully"
}
```

---

## Usage Examples

### Get All Data as a JSON Backup

```bash
curl -X GET http://localhost:8080/api/backup/all -o hextrackr_backup.json
```

### Restore Tickets from a Backup

This example restores tickets from `backup.zip` and clears existing tickets first.

```bash
curl -X POST http://localhost:8080/api/restore \
  -F "file=@/path/to/backup.zip" \
  -F "type=tickets" \
  -F "clearExisting=true"
```

### Clear All Vulnerability Data

```bash
curl -X DELETE http://localhost:8080/api/backup/clear/vulnerabilities
```

# Configuration

This section contains API documentation for Configuration.

## Source: app/config/**/*.js

## Constants

<table>
  <thead>
    <tr>
      <th>Global</th><th>Description</th>
    </tr>
  </thead>
  <tbody>
<tr>
    <td><a href="#path">path</a></td>
    <td><p>Database Configuration Module</p>
<p>Extracted from server.js to centralize database configuration settings.
This module provides SQLite database configuration, connection options,
schema versioning, and environment-based settings for HexTrackr.</p>
</td>
    </tr>
<tr>
    <td><a href="#databaseConfig">databaseConfig</a> : <code>Object</code></td>
    <td><p>Database configuration object containing all database-related settings</p>
</td>
    </tr>
<tr>
    <td><a href="#cors">cors</a></td>
    <td><p>CORS (Cross-Origin Resource Sharing) Configuration
Configures which origins, methods, and headers are allowed for cross-origin requests</p>
</td>
    </tr>
<tr>
    <td><a href="#rateLimit">rateLimit</a></td>
    <td><p>Rate Limiting Configuration
DoS protection by limiting requests per IP address within a time window</p>
</td>
    </tr>
<tr>
    <td><a href="#bodyParser">bodyParser</a></td>
    <td><p>Body Parser Configuration
Settings for parsing JSON and URL-encoded request bodies</p>
</td>
    </tr>
<tr>
    <td><a href="#upload">upload</a></td>
    <td><p>File Upload Configuration (Multer)
Settings for handling CSV file uploads and processing</p>
</td>
    </tr>
<tr>
    <td><a href="#security">security</a></td>
    <td><p>Security Headers Configuration
HTTP security headers to protect against common web vulnerabilities</p>
</td>
    </tr>
<tr>
    <td><a href="#compression">compression</a></td>
    <td><p>Compression Configuration
Settings for compressing HTTP responses to reduce bandwidth usage</p>
</td>
    </tr>
<tr>
    <td><a href="#websocket">websocket</a></td>
    <td><p>WebSocket Configuration
CORS settings for Socket.io WebSocket connections</p>
</td>
    </tr>
<tr>
    <td><a href="#websocketConfig">websocketConfig</a> : <code>Object</code></td>
    <td><p>WebSocket server configuration</p>
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
    <td><a href="#getEnvironmentConfig">getEnvironmentConfig(env)</a> ⇒ <code>Object</code></td>
    <td><p>Get environment-specific database configuration</p>
</td>
    </tr>
<tr>
    <td><a href="#getPragmaStatements">getPragmaStatements(config)</a> ⇒ <code>Array.&lt;string&gt;</code></td>
    <td><p>Get PRAGMA statements for database optimization</p>
</td>
    </tr>
<tr>
    <td><a href="#validateConfig">validateConfig(config)</a> ⇒ <code>Array.&lt;string&gt;</code></td>
    <td><p>Validate database configuration</p>
</td>
    </tr>
<tr>
    <td><a href="#getSocketOptions">getSocketOptions()</a> ⇒ <code>Object</code></td>
    <td><p>Get Socket.io server options</p>
</td>
    </tr>
<tr>
    <td><a href="#getEventNames">getEventNames()</a> ⇒ <code>Object</code></td>
    <td><p>Get event names object</p>
</td>
    </tr>
<tr>
    <td><a href="#getRoomConfig">getRoomConfig()</a> ⇒ <code>Object</code></td>
    <td><p>Get room configuration</p>
</td>
    </tr>
<tr>
    <td><a href="#getProgressRoom">getProgressRoom(sessionId)</a> ⇒ <code>string</code></td>
    <td><p>Get progress room name for a session</p>
</td>
    </tr>
<tr>
    <td><a href="#getDebugConfig">getDebugConfig()</a> ⇒ <code>Object</code></td>
    <td><p>Get debugging configuration</p>
</td>
    </tr>
<tr>
    <td><a href="#getLimitsConfig">getLimitsConfig()</a> ⇒ <code>Object</code></td>
    <td><p>Get rate limiting configuration</p>
</td>
    </tr>
</tbody>
</table>

<a name="path"></a>

## path

Database Configuration Module

Extracted from server.js to centralize database configuration settings.
This module provides SQLite database configuration, connection options,
schema versioning, and environment-based settings for HexTrackr.

**Kind**: global constant  
**Version**: 1.0.0  
**Author**: HexTrackr Team  

* * *

<a name="databaseConfig"></a>

## databaseConfig : <code>Object</code>

Database configuration object containing all database-related settings

**Kind**: global constant  

- [databaseConfig](#databaseConfig) : <code>Object</code>
  - [.path](#databaseConfig.path) : <code>Object</code>
    - [.relative](#databaseConfig.path.relative) : <code>string</code>
    - [.absolute](#databaseConfig.path.absolute) : <code>string</code>
    - [.dataDirectory](#databaseConfig.path.dataDirectory) : <code>string</code>
  - [.options](#databaseConfig.options) : <code>Object</code>
    - [.verbose](#databaseConfig.options.verbose) : <code>boolean</code>
    - [.mode](#databaseConfig.options.mode) : <code>number</code>
    - [.timeout](#databaseConfig.options.timeout) : <code>number</code>
    - [.foreignKeys](#databaseConfig.options.foreignKeys) : <code>boolean</code>
    - [.walMode](#databaseConfig.options.walMode) : <code>boolean</code>
    - [.synchronous](#databaseConfig.options.synchronous) : <code>string</code>
    - [.cacheSize](#databaseConfig.options.cacheSize) : <code>number</code>
  - [.pool](#databaseConfig.pool) : <code>Object</code>
    - [.max](#databaseConfig.pool.max) : <code>number</code>
    - [.min](#databaseConfig.pool.min) : <code>number</code>
    - [.idleTimeoutMillis](#databaseConfig.pool.idleTimeoutMillis) : <code>number</code>
    - [.acquireTimeoutMillis](#databaseConfig.pool.acquireTimeoutMillis) : <code>number</code>
  - [.schema](#databaseConfig.schema) : <code>Object</code>
    - [.version](#databaseConfig.schema.version) : <code>string</code>
    - [.targetVersion](#databaseConfig.schema.targetVersion) : <code>string</code>
    - [.autoMigrate](#databaseConfig.schema.autoMigrate) : <code>boolean</code>
    - [.backupBeforeMigration](#databaseConfig.schema.backupBeforeMigration) : <code>boolean</code>
    - [.coreTables](#databaseConfig.schema.coreTables) : <code>Array.&lt;string&gt;</code>
    - [.performanceIndexes](#databaseConfig.schema.performanceIndexes) : <code>Array.&lt;string&gt;</code>
  - [.performance](#databaseConfig.performance) : <code>Object</code>
    - [.batchSize](#databaseConfig.performance.batchSize) : <code>number</code>
    - [.maxMemoryUsageMB](#databaseConfig.performance.maxMemoryUsageMB) : <code>number</code>
    - [.useTransactions](#databaseConfig.performance.useTransactions) : <code>boolean</code>
    - [.progressReportInterval](#databaseConfig.performance.progressReportInterval) : <code>number</code>
    - [.maxRowsInMemory](#databaseConfig.performance.maxRowsInMemory) : <code>number</code>
  - [.environment](#databaseConfig.environment) : <code>Object</code>
    - [.development](#databaseConfig.environment.development) : <code>Object</code>
    - [.production](#databaseConfig.environment.production) : <code>Object</code>
    - [.test](#databaseConfig.environment.test) : <code>Object</code>
  - [.security](#databaseConfig.security) : <code>Object</code>
    - [.enablePathValidation](#databaseConfig.security.enablePathValidation) : <code>boolean</code>
    - [.maxImportFileSize](#databaseConfig.security.maxImportFileSize) : <code>number</code>
    - [.allowedImportExtensions](#databaseConfig.security.allowedImportExtensions) : <code>Array.&lt;string&gt;</code>
    - [.preventSqlInjection](#databaseConfig.security.preventSqlInjection) : <code>boolean</code>
  - [.maintenance](#databaseConfig.maintenance) : <code>Object</code>
    - [.autoBackupIntervalHours](#databaseConfig.maintenance.autoBackupIntervalHours) : <code>number</code>
    - [.backupRetentionCount](#databaseConfig.maintenance.backupRetentionCount) : <code>number</code>
    - [.enableAutoVacuum](#databaseConfig.maintenance.enableAutoVacuum) : <code>boolean</code>
    - [.vacuumIntervalDays](#databaseConfig.maintenance.vacuumIntervalDays) : <code>number</code>
    - [.analyzeIntervalDays](#databaseConfig.maintenance.analyzeIntervalDays) : <code>number</code>

* * *

<a name="databaseConfig.path"></a>

### databaseConfig.path : <code>Object</code>

Database file path configuration

**Kind**: static property of [<code>databaseConfig</code>](#databaseConfig)  

- [.path](#databaseConfig.path) : <code>Object</code>
  - [.relative](#databaseConfig.path.relative) : <code>string</code>
  - [.absolute](#databaseConfig.path.absolute) : <code>string</code>
  - [.dataDirectory](#databaseConfig.path.dataDirectory) : <code>string</code>

* * *

<a name="databaseConfig.path.relative"></a>

#### path.relative : <code>string</code>

Relative path to database file from server.js

**Kind**: static property of [<code>path</code>](#databaseConfig.path)  

* * *

<a name="databaseConfig.path.absolute"></a>

#### path.absolute : <code>string</code>

Absolute path to database file (calculated at runtime)

**Kind**: static property of [<code>path</code>](#databaseConfig.path)  

* * *

<a name="databaseConfig.path.dataDirectory"></a>

#### path.dataDirectory : <code>string</code>

Directory containing the database file

**Kind**: static property of [<code>path</code>](#databaseConfig.path)  

* * *

<a name="databaseConfig.options"></a>

### databaseConfig.options : <code>Object</code>

SQLite database connection options

**Kind**: static property of [<code>databaseConfig</code>](#databaseConfig)  

- [.options](#databaseConfig.options) : <code>Object</code>
  - [.verbose](#databaseConfig.options.verbose) : <code>boolean</code>
  - [.mode](#databaseConfig.options.mode) : <code>number</code>
  - [.timeout](#databaseConfig.options.timeout) : <code>number</code>
  - [.foreignKeys](#databaseConfig.options.foreignKeys) : <code>boolean</code>
  - [.walMode](#databaseConfig.options.walMode) : <code>boolean</code>
  - [.synchronous](#databaseConfig.options.synchronous) : <code>string</code>
  - [.cacheSize](#databaseConfig.options.cacheSize) : <code>number</code>

* * *

<a name="databaseConfig.options.verbose"></a>

#### options.verbose : <code>boolean</code>

Enable verbose mode for detailed logging

**Kind**: static property of [<code>options</code>](#databaseConfig.options)  

* * *

<a name="databaseConfig.options.mode"></a>

#### options.mode : <code>number</code>

Database mode (OPEN_READWRITE | OPEN_CREATE)

**Kind**: static property of [<code>options</code>](#databaseConfig.options)  

* * *

<a name="databaseConfig.options.timeout"></a>

#### options.timeout : <code>number</code>

Connection timeout in milliseconds

**Kind**: static property of [<code>options</code>](#databaseConfig.options)  

* * *

<a name="databaseConfig.options.foreignKeys"></a>

#### options.foreignKeys : <code>boolean</code>

Enable foreign key constraints

**Kind**: static property of [<code>options</code>](#databaseConfig.options)  

* * *

<a name="databaseConfig.options.walMode"></a>

#### options.walMode : <code>boolean</code>

WAL (Write-Ahead Logging) mode for better concurrency

**Kind**: static property of [<code>options</code>](#databaseConfig.options)  

* * *

<a name="databaseConfig.options.synchronous"></a>

#### options.synchronous : <code>string</code>

Synchronous mode setting

**Kind**: static property of [<code>options</code>](#databaseConfig.options)  

* * *

<a name="databaseConfig.options.cacheSize"></a>

#### options.cacheSize : <code>number</code>

Cache size in pages (negative value means KB)

**Kind**: static property of [<code>options</code>](#databaseConfig.options)  

* * *

<a name="databaseConfig.pool"></a>

### databaseConfig.pool : <code>Object</code>

Connection pool settings (simulated for SQLite)

**Kind**: static property of [<code>databaseConfig</code>](#databaseConfig)  

- [.pool](#databaseConfig.pool) : <code>Object</code>
  - [.max](#databaseConfig.pool.max) : <code>number</code>
  - [.min](#databaseConfig.pool.min) : <code>number</code>
  - [.idleTimeoutMillis](#databaseConfig.pool.idleTimeoutMillis) : <code>number</code>
  - [.acquireTimeoutMillis](#databaseConfig.pool.acquireTimeoutMillis) : <code>number</code>

* * *

<a name="databaseConfig.pool.max"></a>

#### pool.max : <code>number</code>

Maximum number of concurrent connections
Note: SQLite handles this internally, but useful for monitoring

**Kind**: static property of [<code>pool</code>](#databaseConfig.pool)  

* * *

<a name="databaseConfig.pool.min"></a>

#### pool.min : <code>number</code>

Minimum number of connections to maintain

**Kind**: static property of [<code>pool</code>](#databaseConfig.pool)  

* * *

<a name="databaseConfig.pool.idleTimeoutMillis"></a>

#### pool.idleTimeoutMillis : <code>number</code>

Connection idle timeout in milliseconds

**Kind**: static property of [<code>pool</code>](#databaseConfig.pool)  

* * *

<a name="databaseConfig.pool.acquireTimeoutMillis"></a>

#### pool.acquireTimeoutMillis : <code>number</code>

Maximum time to wait for connection in milliseconds

**Kind**: static property of [<code>pool</code>](#databaseConfig.pool)  

* * *

<a name="databaseConfig.schema"></a>

### databaseConfig.schema : <code>Object</code>

Schema version management and migration settings

**Kind**: static property of [<code>databaseConfig</code>](#databaseConfig)  

- [.schema](#databaseConfig.schema) : <code>Object</code>
  - [.version](#databaseConfig.schema.version) : <code>string</code>
  - [.targetVersion](#databaseConfig.schema.targetVersion) : <code>string</code>
  - [.autoMigrate](#databaseConfig.schema.autoMigrate) : <code>boolean</code>
  - [.backupBeforeMigration](#databaseConfig.schema.backupBeforeMigration) : <code>boolean</code>
  - [.coreTables](#databaseConfig.schema.coreTables) : <code>Array.&lt;string&gt;</code>
  - [.performanceIndexes](#databaseConfig.schema.performanceIndexes) : <code>Array.&lt;string&gt;</code>

* * *

<a name="databaseConfig.schema.version"></a>

#### schema.version : <code>string</code>

Current schema version

**Kind**: static property of [<code>schema</code>](#databaseConfig.schema)  

* * *

<a name="databaseConfig.schema.targetVersion"></a>

#### schema.targetVersion : <code>string</code>

Target schema version for migrations

**Kind**: static property of [<code>schema</code>](#databaseConfig.schema)  

* * *

<a name="databaseConfig.schema.autoMigrate"></a>

#### schema.autoMigrate : <code>boolean</code>

Enable automatic schema migrations on startup

**Kind**: static property of [<code>schema</code>](#databaseConfig.schema)  

* * *

<a name="databaseConfig.schema.backupBeforeMigration"></a>

#### schema.backupBeforeMigration : <code>boolean</code>

Backup database before schema changes

**Kind**: static property of [<code>schema</code>](#databaseConfig.schema)  

* * *

<a name="databaseConfig.schema.coreTables"></a>

#### schema.coreTables : <code>Array.&lt;string&gt;</code>

Core tables that should exist

**Kind**: static property of [<code>schema</code>](#databaseConfig.schema)  

* * *

<a name="databaseConfig.schema.performanceIndexes"></a>

#### schema.performanceIndexes : <code>Array.&lt;string&gt;</code>

Performance indexes that should exist

**Kind**: static property of [<code>schema</code>](#databaseConfig.schema)  

* * *

<a name="databaseConfig.performance"></a>

### databaseConfig.performance : <code>Object</code>

Performance and optimization settings

**Kind**: static property of [<code>databaseConfig</code>](#databaseConfig)  

- [.performance](#databaseConfig.performance) : <code>Object</code>
  - [.batchSize](#databaseConfig.performance.batchSize) : <code>number</code>
  - [.maxMemoryUsageMB](#databaseConfig.performance.maxMemoryUsageMB) : <code>number</code>
  - [.useTransactions](#databaseConfig.performance.useTransactions) : <code>boolean</code>
  - [.progressReportInterval](#databaseConfig.performance.progressReportInterval) : <code>number</code>
  - [.maxRowsInMemory](#databaseConfig.performance.maxRowsInMemory) : <code>number</code>

* * *

<a name="databaseConfig.performance.batchSize"></a>

#### performance.batchSize : <code>number</code>

Batch size for bulk insert operations

**Kind**: static property of [<code>performance</code>](#databaseConfig.performance)  

* * *

<a name="databaseConfig.performance.maxMemoryUsageMB"></a>

#### performance.maxMemoryUsageMB : <code>number</code>

Maximum memory usage for import operations (MB)

**Kind**: static property of [<code>performance</code>](#databaseConfig.performance)  

* * *

<a name="databaseConfig.performance.useTransactions"></a>

#### performance.useTransactions : <code>boolean</code>

Enable transaction wrapping for bulk operations

**Kind**: static property of [<code>performance</code>](#databaseConfig.performance)  

* * *

<a name="databaseConfig.performance.progressReportInterval"></a>

#### performance.progressReportInterval : <code>number</code>

Progress reporting interval for large operations

**Kind**: static property of [<code>performance</code>](#databaseConfig.performance)  

* * *

<a name="databaseConfig.performance.maxRowsInMemory"></a>

#### performance.maxRowsInMemory : <code>number</code>

Maximum number of rows to process in memory

**Kind**: static property of [<code>performance</code>](#databaseConfig.performance)  

* * *

<a name="databaseConfig.environment"></a>

### databaseConfig.environment : <code>Object</code>

Environment-specific configuration

**Kind**: static property of [<code>databaseConfig</code>](#databaseConfig)  

- [.environment](#databaseConfig.environment) : <code>Object</code>
  - [.development](#databaseConfig.environment.development) : <code>Object</code>
  - [.production](#databaseConfig.environment.production) : <code>Object</code>
  - [.test](#databaseConfig.environment.test) : <code>Object</code>

* * *

<a name="databaseConfig.environment.development"></a>

#### environment.development : <code>Object</code>

Development environment settings

**Kind**: static property of [<code>environment</code>](#databaseConfig.environment)  

* * *

<a name="databaseConfig.environment.production"></a>

#### environment.production : <code>Object</code>

Production environment settings

**Kind**: static property of [<code>environment</code>](#databaseConfig.environment)  

* * *

<a name="databaseConfig.environment.test"></a>

#### environment.test : <code>Object</code>

Test environment settings

**Kind**: static property of [<code>environment</code>](#databaseConfig.environment)  

* * *

<a name="databaseConfig.security"></a>

### databaseConfig.security : <code>Object</code>

Security and validation settings

**Kind**: static property of [<code>databaseConfig</code>](#databaseConfig)  

- [.security](#databaseConfig.security) : <code>Object</code>
  - [.enablePathValidation](#databaseConfig.security.enablePathValidation) : <code>boolean</code>
  - [.maxImportFileSize](#databaseConfig.security.maxImportFileSize) : <code>number</code>
  - [.allowedImportExtensions](#databaseConfig.security.allowedImportExtensions) : <code>Array.&lt;string&gt;</code>
  - [.preventSqlInjection](#databaseConfig.security.preventSqlInjection) : <code>boolean</code>

* * *

<a name="databaseConfig.security.enablePathValidation"></a>

#### security.enablePathValidation : <code>boolean</code>

Enable path validation for all database file operations

**Kind**: static property of [<code>security</code>](#databaseConfig.security)  

* * *

<a name="databaseConfig.security.maxImportFileSize"></a>

#### security.maxImportFileSize : <code>number</code>

Maximum file size for CSV imports (bytes)

**Kind**: static property of [<code>security</code>](#databaseConfig.security)  

* * *

<a name="databaseConfig.security.allowedImportExtensions"></a>

#### security.allowedImportExtensions : <code>Array.&lt;string&gt;</code>

Allowed file extensions for imports

**Kind**: static property of [<code>security</code>](#databaseConfig.security)  

* * *

<a name="databaseConfig.security.preventSqlInjection"></a>

#### security.preventSqlInjection : <code>boolean</code>

Enable SQL injection protection

**Kind**: static property of [<code>security</code>](#databaseConfig.security)  

* * *

<a name="databaseConfig.maintenance"></a>

### databaseConfig.maintenance : <code>Object</code>

Backup and maintenance settings

**Kind**: static property of [<code>databaseConfig</code>](#databaseConfig)  

- [.maintenance](#databaseConfig.maintenance) : <code>Object</code>
  - [.autoBackupIntervalHours](#databaseConfig.maintenance.autoBackupIntervalHours) : <code>number</code>
  - [.backupRetentionCount](#databaseConfig.maintenance.backupRetentionCount) : <code>number</code>
  - [.enableAutoVacuum](#databaseConfig.maintenance.enableAutoVacuum) : <code>boolean</code>
  - [.vacuumIntervalDays](#databaseConfig.maintenance.vacuumIntervalDays) : <code>number</code>
  - [.analyzeIntervalDays](#databaseConfig.maintenance.analyzeIntervalDays) : <code>number</code>

* * *

<a name="databaseConfig.maintenance.autoBackupIntervalHours"></a>

#### maintenance.autoBackupIntervalHours : <code>number</code>

Automatic backup schedule (hours between backups)

**Kind**: static property of [<code>maintenance</code>](#databaseConfig.maintenance)  

* * *

<a name="databaseConfig.maintenance.backupRetentionCount"></a>

#### maintenance.backupRetentionCount : <code>number</code>

Number of backup files to retain

**Kind**: static property of [<code>maintenance</code>](#databaseConfig.maintenance)  

* * *

<a name="databaseConfig.maintenance.enableAutoVacuum"></a>

#### maintenance.enableAutoVacuum : <code>boolean</code>

Enable automatic VACUUM operation

**Kind**: static property of [<code>maintenance</code>](#databaseConfig.maintenance)  

* * *

<a name="databaseConfig.maintenance.vacuumIntervalDays"></a>

#### maintenance.vacuumIntervalDays : <code>number</code>

VACUUM operation schedule (days between operations)

**Kind**: static property of [<code>maintenance</code>](#databaseConfig.maintenance)  

* * *

<a name="databaseConfig.maintenance.analyzeIntervalDays"></a>

#### maintenance.analyzeIntervalDays : <code>number</code>

Analyze statistics schedule (days between operations)

**Kind**: static property of [<code>maintenance</code>](#databaseConfig.maintenance)  

* * *

<a name="cors"></a>

## cors

CORS (Cross-Origin Resource Sharing) Configuration
Configures which origins, methods, and headers are allowed for cross-origin requests

**Kind**: global constant  

* * *

<a name="rateLimit"></a>

## rateLimit

Rate Limiting Configuration
DoS protection by limiting requests per IP address within a time window

**Kind**: global constant  

* * *

<a name="bodyParser"></a>

## bodyParser

Body Parser Configuration
Settings for parsing JSON and URL-encoded request bodies

**Kind**: global constant  

* * *

<a name="upload"></a>

## upload

File Upload Configuration (Multer)
Settings for handling CSV file uploads and processing

**Kind**: global constant  

* * *

<a name="security"></a>

## security

Security Headers Configuration
HTTP security headers to protect against common web vulnerabilities

**Kind**: global constant  

* * *

<a name="compression"></a>

## compression

Compression Configuration
Settings for compressing HTTP responses to reduce bandwidth usage

**Kind**: global constant  

* * *

<a name="websocket"></a>

## websocket

WebSocket Configuration
CORS settings for Socket.io WebSocket connections

**Kind**: global constant  

* * *

<a name="websocketConfig"></a>

## websocketConfig : <code>Object</code>

WebSocket server configuration

**Kind**: global constant  

- [websocketConfig](#websocketConfig) : <code>Object</code>
  - [.port](#websocketConfig.port) : <code>number</code>
  - [.options](#websocketConfig.options) : <code>Object</code>
    - [.cors](#websocketConfig.options.cors) : <code>Object</code>
    - [.pingTimeout](#websocketConfig.options.pingTimeout) : <code>number</code>
    - [.pingInterval](#websocketConfig.options.pingInterval) : <code>number</code>
    - [.transports](#websocketConfig.options.transports) : <code>Array.&lt;string&gt;</code>
    - [.upgradeTimeout](#websocketConfig.options.upgradeTimeout) : <code>number</code>
    - [.maxBufferSize](#websocketConfig.options.maxBufferSize) : <code>number</code>
    - [.allowEIO3](#websocketConfig.options.allowEIO3) : <code>boolean</code>
  - [.events](#websocketConfig.events) : <code>Object</code>
  - [.rooms](#websocketConfig.rooms) : <code>Object</code>
    - [.PROGRESS_PREFIX](#websocketConfig.rooms.PROGRESS_PREFIX) : <code>string</code>
    - [.NOTIFICATIONS](#websocketConfig.rooms.NOTIFICATIONS) : <code>string</code>
    - [.ADMIN](#websocketConfig.rooms.ADMIN) : <code>string</code>
  - [.limits](#websocketConfig.limits) : <code>Object</code>
    - [.maxMessageSize](#websocketConfig.limits.maxMessageSize) : <code>number</code>
    - [.messagesPerSecond](#websocketConfig.limits.messagesPerSecond) : <code>number</code>
    - [.maxRoomsPerClient](#websocketConfig.limits.maxRoomsPerClient) : <code>number</code>
  - [.debug](#websocketConfig.debug) : <code>Object</code>
    - [.logConnections](#websocketConfig.debug.logConnections) : <code>boolean</code>
    - [.logRooms](#websocketConfig.debug.logRooms) : <code>boolean</code>
    - [.logProgress](#websocketConfig.debug.logProgress) : <code>boolean</code>

* * *

<a name="websocketConfig.port"></a>

### websocketConfig.port : <code>number</code>

WebSocket server port (planned for future use)
Currently WebSocket runs on same port as HTTP server

**Kind**: static property of [<code>websocketConfig</code>](#websocketConfig)  

* * *

<a name="websocketConfig.options"></a>

### websocketConfig.options : <code>Object</code>

Socket.io server options

**Kind**: static property of [<code>websocketConfig</code>](#websocketConfig)  

- [.options](#websocketConfig.options) : <code>Object</code>
  - [.cors](#websocketConfig.options.cors) : <code>Object</code>
  - [.pingTimeout](#websocketConfig.options.pingTimeout) : <code>number</code>
  - [.pingInterval](#websocketConfig.options.pingInterval) : <code>number</code>
  - [.transports](#websocketConfig.options.transports) : <code>Array.&lt;string&gt;</code>
  - [.upgradeTimeout](#websocketConfig.options.upgradeTimeout) : <code>number</code>
  - [.maxBufferSize](#websocketConfig.options.maxBufferSize) : <code>number</code>
  - [.allowEIO3](#websocketConfig.options.allowEIO3) : <code>boolean</code>

* * *

<a name="websocketConfig.options.cors"></a>

#### options.cors : <code>Object</code>

CORS configuration for WebSocket connections

**Kind**: static property of [<code>options</code>](#websocketConfig.options)  

* * *

<a name="websocketConfig.options.pingTimeout"></a>

#### options.pingTimeout : <code>number</code>

Connection timeout settings
Time before considering a connection dead if no pong received

**Kind**: static property of [<code>options</code>](#websocketConfig.options)  

* * *

<a name="websocketConfig.options.pingInterval"></a>

#### options.pingInterval : <code>number</code>

Ping interval for keeping connections alive
How often to send ping packets

**Kind**: static property of [<code>options</code>](#websocketConfig.options)  

* * *

<a name="websocketConfig.options.transports"></a>

#### options.transports : <code>Array.&lt;string&gt;</code>

Transport methods allowed

**Kind**: static property of [<code>options</code>](#websocketConfig.options)  

* * *

<a name="websocketConfig.options.upgradeTimeout"></a>

#### options.upgradeTimeout : <code>number</code>

Time to wait for transport upgrade

**Kind**: static property of [<code>options</code>](#websocketConfig.options)  

* * *

<a name="websocketConfig.options.maxBufferSize"></a>

#### options.maxBufferSize : <code>number</code>

Maximum buffer size for messages

**Kind**: static property of [<code>options</code>](#websocketConfig.options)  

* * *

<a name="websocketConfig.options.allowEIO3"></a>

#### options.allowEIO3 : <code>boolean</code>

Allow HTTP long-polling fallback

**Kind**: static property of [<code>options</code>](#websocketConfig.options)  

* * *

<a name="websocketConfig.events"></a>

### websocketConfig.events : <code>Object</code>

Standardized event names for WebSocket communication

**Kind**: static property of [<code>websocketConfig</code>](#websocketConfig)  

* * *

<a name="websocketConfig.rooms"></a>

### websocketConfig.rooms : <code>Object</code>

Room/namespace configuration

**Kind**: static property of [<code>websocketConfig</code>](#websocketConfig)  

- [.rooms](#websocketConfig.rooms) : <code>Object</code>
  - [.PROGRESS_PREFIX](#websocketConfig.rooms.PROGRESS_PREFIX) : <code>string</code>
  - [.NOTIFICATIONS](#websocketConfig.rooms.NOTIFICATIONS) : <code>string</code>
  - [.ADMIN](#websocketConfig.rooms.ADMIN) : <code>string</code>

* * *

<a name="websocketConfig.rooms.PROGRESS_PREFIX"></a>

#### rooms.PROGRESS\_PREFIX : <code>string</code>

Progress tracking room prefix
Rooms are named: progress-{sessionId}

**Kind**: static property of [<code>rooms</code>](#websocketConfig.rooms)  

* * *

<a name="websocketConfig.rooms.NOTIFICATIONS"></a>

#### rooms.NOTIFICATIONS : <code>string</code>

Global notification room

**Kind**: static property of [<code>rooms</code>](#websocketConfig.rooms)  

* * *

<a name="websocketConfig.rooms.ADMIN"></a>

#### rooms.ADMIN : <code>string</code>

Admin operations room

**Kind**: static property of [<code>rooms</code>](#websocketConfig.rooms)  

* * *

<a name="websocketConfig.limits"></a>

### websocketConfig.limits : <code>Object</code>

Message size limits and throttling

**Kind**: static property of [<code>websocketConfig</code>](#websocketConfig)  

- [.limits](#websocketConfig.limits) : <code>Object</code>
  - [.maxMessageSize](#websocketConfig.limits.maxMessageSize) : <code>number</code>
  - [.messagesPerSecond](#websocketConfig.limits.messagesPerSecond) : <code>number</code>
  - [.maxRoomsPerClient](#websocketConfig.limits.maxRoomsPerClient) : <code>number</code>

* * *

<a name="websocketConfig.limits.maxMessageSize"></a>

#### limits.maxMessageSize : <code>number</code>

Maximum message size in bytes

**Kind**: static property of [<code>limits</code>](#websocketConfig.limits)  

* * *

<a name="websocketConfig.limits.messagesPerSecond"></a>

#### limits.messagesPerSecond : <code>number</code>

Rate limiting: messages per second per connection

**Kind**: static property of [<code>limits</code>](#websocketConfig.limits)  

* * *

<a name="websocketConfig.limits.maxRoomsPerClient"></a>

#### limits.maxRoomsPerClient : <code>number</code>

Maximum number of rooms a client can join

**Kind**: static property of [<code>limits</code>](#websocketConfig.limits)  

* * *

<a name="websocketConfig.debug"></a>

### websocketConfig.debug : <code>Object</code>

Development/debugging settings

**Kind**: static property of [<code>websocketConfig</code>](#websocketConfig)  

- [.debug](#websocketConfig.debug) : <code>Object</code>
  - [.logConnections](#websocketConfig.debug.logConnections) : <code>boolean</code>
  - [.logRooms](#websocketConfig.debug.logRooms) : <code>boolean</code>
  - [.logProgress](#websocketConfig.debug.logProgress) : <code>boolean</code>

* * *

<a name="websocketConfig.debug.logConnections"></a>

#### debug.logConnections : <code>boolean</code>

Log connection events

**Kind**: static property of [<code>debug</code>](#websocketConfig.debug)  

* * *

<a name="websocketConfig.debug.logRooms"></a>

#### debug.logRooms : <code>boolean</code>

Log room join/leave events

**Kind**: static property of [<code>debug</code>](#websocketConfig.debug)  

* * *

<a name="websocketConfig.debug.logProgress"></a>

#### debug.logProgress : <code>boolean</code>

Log progress updates

**Kind**: static property of [<code>debug</code>](#websocketConfig.debug)  

* * *

<a name="getEnvironmentConfig"></a>

## getEnvironmentConfig(env) ⇒ <code>Object</code>

Get environment-specific database configuration

**Kind**: global function  
**Returns**: <code>Object</code> - Merged configuration for the specified environment  

| Param | Type | Description |
| --- | --- | --- |
| env | <code>string</code> | Environment name (development, production, test) |

* * *

<a name="getPragmaStatements"></a>

## getPragmaStatements(config) ⇒ <code>Array.&lt;string&gt;</code>

Get PRAGMA statements for database optimization

**Kind**: global function  
**Returns**: <code>Array.&lt;string&gt;</code> - Array of PRAGMA statements  

| Param | Type | Description |
| --- | --- | --- |
| config | <code>Object</code> | Database configuration object |

* * *

<a name="validateConfig"></a>

## validateConfig(config) ⇒ <code>Array.&lt;string&gt;</code>

Validate database configuration

**Kind**: global function  
**Returns**: <code>Array.&lt;string&gt;</code> - Array of validation errors (empty if valid)  

| Param | Type | Description |
| --- | --- | --- |
| config | <code>Object</code> | Configuration object to validate |

* * *

<a name="getSocketOptions"></a>

## getSocketOptions() ⇒ <code>Object</code>

Get Socket.io server options

**Kind**: global function  
**Returns**: <code>Object</code> - Socket.io server configuration options  

* * *

<a name="getEventNames"></a>

## getEventNames() ⇒ <code>Object</code>

Get event names object

**Kind**: global function  
**Returns**: <code>Object</code> - Standardized event names  

* * *

<a name="getRoomConfig"></a>

## getRoomConfig() ⇒ <code>Object</code>

Get room configuration

**Kind**: global function  
**Returns**: <code>Object</code> - Room naming and configuration  

* * *

<a name="getProgressRoom"></a>

## getProgressRoom(sessionId) ⇒ <code>string</code>

Get progress room name for a session

**Kind**: global function  
**Returns**: <code>string</code> - Progress room name  

| Param | Type | Description |
| --- | --- | --- |
| sessionId | <code>string</code> | Session identifier |

* * *

<a name="getDebugConfig"></a>

## getDebugConfig() ⇒ <code>Object</code>

Get debugging configuration

**Kind**: global function  
**Returns**: <code>Object</code> - Debug settings  

* * *

<a name="getLimitsConfig"></a>

## getLimitsConfig() ⇒ <code>Object</code>

Get rate limiting configuration

**Kind**: global function  
**Returns**: <code>Object</code> - Rate limiting and size limits  

* * *

---

# Controllers

This section contains API documentation for Controllers.

## Source: app/controllers/**/*.js

## Classes

<table>
  <thead>
    <tr>
      <th>Global</th><th>Description</th>
    </tr>
  </thead>
  <tbody>
<tr>
    <td><a href="#DocsController">DocsController</a></td>
    <td><p>Documentation Controller
Handles HTTP requests for documentation-related endpoints
Extracted from server.js (T029)</p>
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
    <td><a href="#BackupService">BackupService</a></td>
    <td><p>Backup Controller
Extracted from server.js lines: 2701, 3274-3798</p>
<p>Handles HTTP requests for backup and restore operations.
Delegates business logic to backupService.</p>
</td>
    </tr>
<tr>
    <td><a href="#_Papa">_Papa</a></td>
    <td><p>Import Controller - Vendor CSV Import Operations</p>
<p>This controller handles operational imports of vendor CSV data (e.g., Tenable vulnerability scans),
not backup/restore operations. Those are handled by the backup controller.</p>
<p>Controller logic extracted from server.js lines: 2337-2399, 2403-2531, 3482-3604, 2534-2550</p>
<h1 id="integration-notes-for-t053">INTEGRATION NOTES FOR T053:</h1>
<ul>
<li>setProgressTracker() MUST be called by server.js before route registration</li>
<li>All file upload logic uses PathValidator for security</li>
<li>Controller delegates complex business logic to importService</li>
<li>Progress tracking is handled via injected progressTracker instance</li>
<li>Database operations go through DatabaseService</li>
</ul>
</td>
    </tr>
<tr>
    <td><a href="#TicketService">TicketService</a></td>
    <td><p>Ticket Controller
Extracted from server.js lines: 3320-3344, 3369-3394, 3396-3422, 3424-3435, 3437-3479, 3482-3498, 3606-3621</p>
<p>Handles HTTP requests for ticket operations.
Delegates business logic to ticketService.</p>
<p>T053 INTEGRATION CHECKLIST:</p>
<ol>
<li>Import this controller in server.js: const ticketController = require(&quot;./app/controllers/ticketController&quot;);</li>
<li>Initialize after database connection: ticketController.initialize(db);</li>
<li>Register routes: app.use(&quot;/api/tickets&quot;, require(&quot;./app/routes/tickets&quot;));</li>
<li>Remove duplicate routes from server.js (see routes file for line numbers)</li>
<li>Handle import/backup route conflicts as noted in routes file</li>
</ol>
</td>
    </tr>
<tr>
    <td><a href="#VulnerabilityService">VulnerabilityService</a></td>
    <td><p>Vulnerability Controller
Extracted from server.js lines: 1996-2016, 2019-2092, 2095-2156, 2159-2218, 2221-2283, 2337-2399, 2403-2514, 2517-2531, 3304-3317, 3501-3565</p>
<p>This is the largest and most complex controller in HexTrackr, handling:</p>
<ul>
<li>Statistics and analytics endpoints with complex VPR calculations</li>
<li>Core vulnerability CRUD operations with lifecycle management</li>
<li>CSV import operations (standard and staging-based for performance)</li>
<li>Data management and clearing operations</li>
<li>Export functionality for backup/analysis</li>
</ul>
<p>Delegates business logic to:</p>
<ul>
<li>vulnerabilityService: Core CRUD, import processing, data management</li>
<li>vulnerabilityStatsService: Statistics, trends, analytics calculations</li>
</ul>
<p>T053 INTEGRATION CHECKLIST:</p>
<ol>
<li>Import this controller in server.js: const vulnerabilityController = require(&quot;./app/controllers/vulnerabilityController&quot;);</li>
<li>Initialize after database connection: vulnerabilityController.initialize(db, progressTracker);</li>
<li>Register routes: app.use(&quot;/api/vulnerabilities&quot;, require(&quot;./app/routes/vulnerabilities&quot;));</li>
<li>Remove duplicate routes from server.js (see routes file for line numbers)</li>
<li>Handle import/backup route conflicts as noted in routes file</li>
<li>Ensure utility functions (mapVulnerabilityRow, extractScanDateFromFilename) remain in server.js</li>
</ol>
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
    <td><a href="#findDocsSectionForFilename">findDocsSectionForFilename()</a></td>
    <td><p>Helper function to find a section path for a given filename by scanning the content folder
Extracted from server.js lines 2560-2582
Used by the documentation portal routing system</p>
</td>
    </tr>
<tr>
    <td><a href="#setProgressTracker">setProgressTracker()</a></td>
    <td><p>Set progress tracker instance (called by server.js)</p>
</td>
    </tr>
<tr>
    <td><a href="#importVulnerabilities">importVulnerabilities()</a></td>
    <td><p>POST /api/vulnerabilities/import
Standard vulnerability CSV import with enhanced lifecycle management
From server.js lines 2337-2399</p>
</td>
    </tr>
<tr>
    <td><a href="#importVulnerabilitiesStaging">importVulnerabilitiesStaging()</a></td>
    <td><p>POST /api/vulnerabilities/import-staging
High-performance vulnerability import using staging table for batch processing
From server.js lines 2403-2531</p>
</td>
    </tr>
<tr>
    <td><a href="#importVulnerabilitiesJSON">importVulnerabilitiesJSON()</a></td>
    <td><p>POST /api/import/vulnerabilities
JSON-based vulnerability import for frontend data upload
From server.js lines 3501-3604</p>
</td>
    </tr>
<tr>
    <td><a href="#importTicketsJSON">importTicketsJSON()</a></td>
    <td><p>POST /api/import/tickets
JSON-based ticket import for frontend data upload
From server.js lines 3482-3499</p>
</td>
    </tr>
<tr>
    <td><a href="#getImportHistory">getImportHistory()</a></td>
    <td><p>GET /api/imports
Get import history with vulnerability counts
From server.js lines 2534-2550</p>
</td>
    </tr>
<tr>
    <td><a href="#checkImportProgress">checkImportProgress()</a></td>
    <td><p>GET /api/import/progress/:sessionId
Check import progress for a specific session
Progress tracking via WebSocket (ProgressTracker class)</p>
</td>
    </tr>
</tbody>
</table>

<a name="DocsController"></a>

## DocsController

Documentation Controller
Handles HTTP requests for documentation-related endpoints
Extracted from server.js (T029)

**Kind**: global class  

* * *

<a name="DocsController+getStats"></a>

### docsController.getStats()

Get documentation statistics
Handles GET /api/docs/stats
Computes API endpoints, JS function count, and framework statistics
Original: server.js lines 2624-2680

**Kind**: instance method of [<code>DocsController</code>](#DocsController)  

* * *

<a name="BackupService"></a>

## BackupService

Backup Controller
Extracted from server.js lines: 2701, 3274-3798

Handles HTTP requests for backup and restore operations.
Delegates business logic to backupService.

**Kind**: global constant  

* * *

<a name="_Papa"></a>

## \_Papa

Import Controller - Vendor CSV Import Operations

This controller handles operational imports of vendor CSV data (e.g., Tenable vulnerability scans),
not backup/restore operations. Those are handled by the backup controller.

Controller logic extracted from server.js lines: 2337-2399, 2403-2531, 3482-3604, 2534-2550

INTEGRATION NOTES FOR T053
===========================

- setProgressTracker() MUST be called by server.js before route registration
- All file upload logic uses PathValidator for security
- Controller delegates complex business logic to importService
- Progress tracking is handled via injected progressTracker instance
- Database operations go through DatabaseService

**Kind**: global constant  

* * *

<a name="TicketService"></a>

## TicketService

Ticket Controller
Extracted from server.js lines: 3320-3344, 3369-3394, 3396-3422, 3424-3435, 3437-3479, 3482-3498, 3606-3621

Handles HTTP requests for ticket operations.
Delegates business logic to ticketService.

T053 INTEGRATION CHECKLIST:

1. Import this controller in server.js: const ticketController = require("./app/controllers/ticketController");
2. Initialize after database connection: ticketController.initialize(db);
3. Register routes: app.use("/api/tickets", require("./app/routes/tickets"));
4. Remove duplicate routes from server.js (see routes file for line numbers)
5. Handle import/backup route conflicts as noted in routes file

**Kind**: global constant  

* * *

<a name="VulnerabilityService"></a>

## VulnerabilityService

Vulnerability Controller
Extracted from server.js lines: 1996-2016, 2019-2092, 2095-2156, 2159-2218, 2221-2283, 2337-2399, 2403-2514, 2517-2531, 3304-3317, 3501-3565

This is the largest and most complex controller in HexTrackr, handling:

- Statistics and analytics endpoints with complex VPR calculations
- Core vulnerability CRUD operations with lifecycle management
- CSV import operations (standard and staging-based for performance)
- Data management and clearing operations
- Export functionality for backup/analysis

Delegates business logic to:

- vulnerabilityService: Core CRUD, import processing, data management
- vulnerabilityStatsService: Statistics, trends, analytics calculations

T053 INTEGRATION CHECKLIST:

1. Import this controller in server.js: const vulnerabilityController = require("./app/controllers/vulnerabilityController");
2. Initialize after database connection: vulnerabilityController.initialize(db, progressTracker);
3. Register routes: app.use("/api/vulnerabilities", require("./app/routes/vulnerabilities"));
4. Remove duplicate routes from server.js (see routes file for line numbers)
5. Handle import/backup route conflicts as noted in routes file
6. Ensure utility functions (mapVulnerabilityRow, extractScanDateFromFilename) remain in server.js

**Kind**: global constant  

* * *

<a name="findDocsSectionForFilename"></a>

## findDocsSectionForFilename()

Helper function to find a section path for a given filename by scanning the content folder
Extracted from server.js lines 2560-2582
Used by the documentation portal routing system

**Kind**: global function  

* * *

<a name="setProgressTracker"></a>

## setProgressTracker()

Set progress tracker instance (called by server.js)

**Kind**: global function  

* * *

<a name="importVulnerabilities"></a>

## importVulnerabilities()

POST /api/vulnerabilities/import
Standard vulnerability CSV import with enhanced lifecycle management
From server.js lines 2337-2399

**Kind**: global function  

* * *

<a name="importVulnerabilitiesStaging"></a>

## importVulnerabilitiesStaging()

POST /api/vulnerabilities/import-staging
High-performance vulnerability import using staging table for batch processing
From server.js lines 2403-2531

**Kind**: global function  

* * *

<a name="importVulnerabilitiesJSON"></a>

## importVulnerabilitiesJSON()

POST /api/import/vulnerabilities
JSON-based vulnerability import for frontend data upload
From server.js lines 3501-3604

**Kind**: global function  

* * *

<a name="importTicketsJSON"></a>

## importTicketsJSON()

POST /api/import/tickets
JSON-based ticket import for frontend data upload
From server.js lines 3482-3499

**Kind**: global function  

* * *

<a name="getImportHistory"></a>

## getImportHistory()

GET /api/imports
Get import history with vulnerability counts
From server.js lines 2534-2550

**Kind**: global function  

* * *

<a name="checkImportProgress"></a>

## checkImportProgress()

GET /api/import/progress/:sessionId
Check import progress for a specific session
Progress tracking via WebSocket (ProgressTracker class)

**Kind**: global function  

* * *

---

# Frontend Pages

This section contains API documentation for Frontend Pages.

## Source: app/public/scripts/pages/**/*.js

<a name="escapeHtml"></a>

## escapeHtml(text) ⇒ <code>string</code>

Escape HTML entities to prevent XSS attacks

**Kind**: global function  
**Returns**: <code>string</code> - - The escaped text  

| Param | Type | Description |
| --- | --- | --- |
| text | <code>string</code> | The text to escape |

* * *

---

# Frontend Shared

This section contains API documentation for Frontend Shared.

## Source: app/public/scripts/shared/**/*.js

## Classes

<table>
  <thead>
    <tr>
      <th>Global</th><th>Description</th>
    </tr>
  </thead>
  <tbody>
<tr>
    <td><a href="#HeaderThemeManager">HeaderThemeManager</a></td>
    <td></td>
    </tr>
<tr>
    <td><a href="#ModalMonitor">ModalMonitor</a></td>
    <td><p>Modal Monitoring and Instrumentation System
Provides comprehensive monitoring for modal operations</p>
</td>
    </tr>
<tr>
    <td><a href="#ModalMonitorIntegration">ModalMonitorIntegration</a></td>
    <td><p>Modal Monitor Integration Helper
Provides easy integration with existing modal system</p>
</td>
    </tr>
<tr>
    <td><a href="#PaginationController">PaginationController</a></td>
    <td><p>PaginationController - Handles pagination logic and UI generation</p>
<p>Usage:</p>
<pre><code class="language-javascript">const pagination = new PaginationController(12, [6, 12, 24, 48]);
pagination.setTotalItems(150);
pagination.renderPaginationControls(&#39;pagination-container&#39;,
  () =&gt; renderCurrentPage(),
  () =&gt; renderCurrentPage()
);
</code></pre>
</td>
    </tr>
<tr>
    <td><a href="#ProgressModal">ProgressModal</a></td>
    <td><p>Real-time Progress Modal Class</p>
</td>
    </tr>
<tr>
    <td><a href="#ThemeController">ThemeController</a></td>
    <td><p>ThemeController class for managing dark/light theme switching in HexTrackr.
Handles system preference detection, theme persistence, and event listening.</p>
</td>
    </tr>
<tr>
    <td><a href="#ToastManager">ToastManager</a></td>
    <td><p>Toast Manager class for handling all user notifications
Provides consistent UI feedback across the application</p>
</td>
    </tr>
<tr>
    <td><a href="#VulnerabilityCardsManager">VulnerabilityCardsManager</a></td>
    <td><p>Manages device cards and vulnerability cards rendering with pagination</p>
</td>
    </tr>
<tr>
    <td><a href="#VulnerabilityChartManager">VulnerabilityChartManager</a></td>
    <td><p>VulnerabilityChartManager - Manages vulnerability chart lifecycle
Extends EventTarget for event-driven communication with other components</p>
</td>
    </tr>
<tr>
    <td><a href="#VulnerabilityCoreOrchestrator">VulnerabilityCoreOrchestrator</a></td>
    <td><p>Central orchestrator for vulnerability management system
Coordinates between all extracted modules and handles cross-cutting concerns</p>
</td>
    </tr>
<tr>
    <td><a href="#VulnerabilityDataManager">VulnerabilityDataManager</a></td>
    <td><p>VulnerabilityDataManager - Centralized data management for vulnerability system</p>
<p>Usage:</p>
<pre><code class="language-javascript">const dataManager = new VulnerabilityDataManager(&#39;/api&#39;);
await dataManager.loadData();
const filteredData = dataManager.filterData(&#39;searchTerm&#39;, &#39;Critical&#39;);
</code></pre>
</td>
    </tr>
<tr>
    <td><a href="#VulnerabilityGridManager">VulnerabilityGridManager</a></td>
    <td><p>Manages all AG Grid operations for vulnerability data display</p>
</td>
    </tr>
<tr>
    <td><a href="#VulnerabilitySearchManager">VulnerabilitySearchManager</a></td>
    <td><p>Manages vulnerability search, filtering, and external lookup operations</p>
</td>
    </tr>
<tr>
    <td><a href="#WebSocketClient">WebSocketClient</a></td>
    <td><p>WebSocket client class for real-time progress tracking</p>
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
    <td><a href="#headerThemeManager">headerThemeManager</a></td>
    <td><p>Auto-initialize header theme management when module loads
This ensures theme toggles work on all pages that include this script</p>
</td>
    </tr>
<tr>
    <td><a href="#VPR_COLORS">VPR_COLORS</a></td>
    <td><p>Vulnerability Color Constants
Single source of truth for VPR severity colors
These values match the CSS variables defined in vulnerabilities.css</p>
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
    <td><a href="#debounce">debounce(func, delay)</a> ⇒ <code>function</code></td>
    <td><p>Debounce function to limit the rate at which a function gets called.
This is crucial for performance on events that fire rapidly, like window resize.</p>
</td>
    </tr>
<tr>
    <td><a href="#createVulnerabilityGridOptions">createVulnerabilityGridOptions(componentContext, isDarkMode)</a> ⇒ <code>GridOptions</code></td>
    <td><p>Creates and returns the complete AG Grid configuration object.</p>
</td>
    </tr>
<tr>
    <td><a href="#createFallbackFooter">createFallbackFooter(container)</a></td>
    <td><p>Creates a safe fallback footer using DOM methods with badges</p>
</td>
    </tr>
<tr>
    <td><a href="#escapeHtml">escapeHtml(text)</a> ⇒ <code>string</code></td>
    <td><p>Escape HTML characters to prevent XSS attacks</p>
</td>
    </tr>
<tr>
    <td><a href="#getVPRColors">getVPRColors(theme)</a> ⇒ <code>Array.&lt;string&gt;</code></td>
    <td><p>Get severity colors for the current theme</p>
</td>
    </tr>
<tr>
    <td><a href="#getSeverityColor">getSeverityColor(severity, theme)</a> ⇒ <code>Object</code></td>
    <td><p>Get color configuration for a specific severity</p>
</td>
    </tr>
<tr>
    <td><a href="#getVPRColorsFromCSS">getVPRColorsFromCSS()</a> ⇒ <code>Array.&lt;string&gt;</code></td>
    <td><p>Get colors from CSS variables (dynamic, theme-aware)</p>
</td>
    </tr>
<tr>
    <td><a href="#getCurrentTheme">getCurrentTheme()</a> ⇒ <code>string</code></td>
    <td><p>Get the current theme from document body</p>
</td>
    </tr>
</tbody>
</table>

<a name="HeaderThemeManager"></a>

## HeaderThemeManager

**Kind**: global class  

- [HeaderThemeManager](#HeaderThemeManager)
  - [new HeaderThemeManager()](#new_HeaderThemeManager_new)
  - [.HeaderThemeManager](#HeaderThemeManager+HeaderThemeManager)
    - [new exports.HeaderThemeManager()](#new_HeaderThemeManager+HeaderThemeManager_new)
  - [.init()](#HeaderThemeManager+init) ⇒ <code>void</code>
  - [.initializeToggles()](#HeaderThemeManager+initializeToggles) ⇒ <code>void</code>
  - [.applyInitialTheme()](#HeaderThemeManager+applyInitialTheme) ⇒ <code>void</code>
  - [.toggleToDark()](#HeaderThemeManager+toggleToDark) ⇒ <code>void</code>
  - [.toggleToLight()](#HeaderThemeManager+toggleToLight) ⇒ <code>void</code>
  - [.updateToggleVisibility(currentTheme)](#HeaderThemeManager+updateToggleVisibility) ⇒ <code>void</code>
  - [.getThemeController()](#HeaderThemeManager+getThemeController) ⇒ [<code>ThemeController</code>](#ThemeController)
  - [.isInitialized()](#HeaderThemeManager+isInitialized) ⇒ <code>boolean</code>

* * *

<a name="new_HeaderThemeManager_new"></a>

### new HeaderThemeManager()

Header Theme Manager - manages theme toggle UI in navigation header

* * *

<a name="HeaderThemeManager+HeaderThemeManager"></a>

### headerThemeManager.HeaderThemeManager

**Kind**: instance class of [<code>HeaderThemeManager</code>](#HeaderThemeManager)  

* * *

<a name="new_HeaderThemeManager+HeaderThemeManager_new"></a>

#### new exports.HeaderThemeManager()

Initialize header theme management

* * *

<a name="HeaderThemeManager+init"></a>

### headerThemeManager.init() ⇒ <code>void</code>

Initialize theme toggles after DOM is loaded
T023: Theme toggle UI button integration

**Kind**: instance method of [<code>HeaderThemeManager</code>](#HeaderThemeManager)  

* * *

<a name="HeaderThemeManager+initializeToggles"></a>

### headerThemeManager.initializeToggles() ⇒ <code>void</code>

Initialize theme toggle elements and event listeners

**Kind**: instance method of [<code>HeaderThemeManager</code>](#HeaderThemeManager)  

* * *

<a name="HeaderThemeManager+applyInitialTheme"></a>

### headerThemeManager.applyInitialTheme() ⇒ <code>void</code>

Apply initial theme on page load

**Kind**: instance method of [<code>HeaderThemeManager</code>](#HeaderThemeManager)  

* * *

<a name="HeaderThemeManager+toggleToDark"></a>

### headerThemeManager.toggleToDark() ⇒ <code>void</code>

Toggle to dark theme

**Kind**: instance method of [<code>HeaderThemeManager</code>](#HeaderThemeManager)  

* * *

<a name="HeaderThemeManager+toggleToLight"></a>

### headerThemeManager.toggleToLight() ⇒ <code>void</code>

Toggle to light theme

**Kind**: instance method of [<code>HeaderThemeManager</code>](#HeaderThemeManager)  

* * *

<a name="HeaderThemeManager+updateToggleVisibility"></a>

### headerThemeManager.updateToggleVisibility(currentTheme) ⇒ <code>void</code>

Update theme toggle visibility based on current theme
T023: Show/hide appropriate toggle buttons

**Kind**: instance method of [<code>HeaderThemeManager</code>](#HeaderThemeManager)  

| Param | Type | Description |
| --- | --- | --- |
| currentTheme | <code>string</code> | Current active theme ('light' | 'dark') |

* * *

<a name="HeaderThemeManager+getThemeController"></a>

### headerThemeManager.getThemeController() ⇒ [<code>ThemeController</code>](#ThemeController)

Get current theme controller instance

**Kind**: instance method of [<code>HeaderThemeManager</code>](#HeaderThemeManager)  
**Returns**: [<code>ThemeController</code>](#ThemeController) - The theme controller instance  

* * *

<a name="HeaderThemeManager+isInitialized"></a>

### headerThemeManager.isInitialized() ⇒ <code>boolean</code>

Check if header theme manager is initialized

**Kind**: instance method of [<code>HeaderThemeManager</code>](#HeaderThemeManager)  
**Returns**: <code>boolean</code> - True if initialized  

* * *

<a name="ModalMonitor"></a>

## ModalMonitor

Modal Monitoring and Instrumentation System
Provides comprehensive monitoring for modal operations

**Kind**: global class  

- [ModalMonitor](#ModalMonitor)
  - [.init()](#ModalMonitor+init)
  - [.startMemoryMonitoring()](#ModalMonitor+startMemoryMonitoring)
  - [.recordMemorySnapshot()](#ModalMonitor+recordMemorySnapshot)
  - [.reportMemoryLeak()](#ModalMonitor+reportMemoryLeak)
  - [.instrumentPerformanceAPIs()](#ModalMonitor+instrumentPerformanceAPIs)
  - [.setupErrorTracking()](#ModalMonitor+setupErrorTracking)
  - [.trackModalOperationStart()](#ModalMonitor+trackModalOperationStart)
  - [.trackModalOperationEnd()](#ModalMonitor+trackModalOperationEnd)
  - [.reportPerformanceIssue()](#ModalMonitor+reportPerformanceIssue)
  - [.logError()](#ModalMonitor+logError)
  - [.trimMetricsArrays()](#ModalMonitor+trimMetricsArrays)
  - [.startPeriodicReporting()](#ModalMonitor+startPeriodicReporting)
  - [.generatePerformanceReport()](#ModalMonitor+generatePerformanceReport)
  - [.calculatePerformanceStats()](#ModalMonitor+calculatePerformanceStats)
  - [.calculateMemoryStats()](#ModalMonitor+calculateMemoryStats)
  - [.calculateStats()](#ModalMonitor+calculateStats)
  - [.getRecentErrors()](#ModalMonitor+getRecentErrors)
  - [.calculateHealthScore()](#ModalMonitor+calculateHealthScore)
  - [.getStatus()](#ModalMonitor+getStatus)
  - [.getMetrics()](#ModalMonitor+getMetrics)
  - [.dispatchEvent()](#ModalMonitor+dispatchEvent)
  - [.formatBytes()](#ModalMonitor+formatBytes)
  - [.destroy()](#ModalMonitor+destroy)

* * *

<a name="ModalMonitor+init"></a>

### modalMonitor.init()

Initialize monitoring system

**Kind**: instance method of [<code>ModalMonitor</code>](#ModalMonitor)  

* * *

<a name="ModalMonitor+startMemoryMonitoring"></a>

### modalMonitor.startMemoryMonitoring()

Start memory monitoring

**Kind**: instance method of [<code>ModalMonitor</code>](#ModalMonitor)  

* * *

<a name="ModalMonitor+recordMemorySnapshot"></a>

### modalMonitor.recordMemorySnapshot()

Record memory snapshot

**Kind**: instance method of [<code>ModalMonitor</code>](#ModalMonitor)  

* * *

<a name="ModalMonitor+reportMemoryLeak"></a>

### modalMonitor.reportMemoryLeak()

Report memory leak detection

**Kind**: instance method of [<code>ModalMonitor</code>](#ModalMonitor)  

* * *

<a name="ModalMonitor+instrumentPerformanceAPIs"></a>

### modalMonitor.instrumentPerformanceAPIs()

Instrument performance APIs for modal operations

**Kind**: instance method of [<code>ModalMonitor</code>](#ModalMonitor)  

* * *

<a name="ModalMonitor+setupErrorTracking"></a>

### modalMonitor.setupErrorTracking()

Setup error tracking

**Kind**: instance method of [<code>ModalMonitor</code>](#ModalMonitor)  

* * *

<a name="ModalMonitor+trackModalOperationStart"></a>

### modalMonitor.trackModalOperationStart()

Track modal operation start

**Kind**: instance method of [<code>ModalMonitor</code>](#ModalMonitor)  

* * *

<a name="ModalMonitor+trackModalOperationEnd"></a>

### modalMonitor.trackModalOperationEnd()

Track modal operation end

**Kind**: instance method of [<code>ModalMonitor</code>](#ModalMonitor)  

* * *

<a name="ModalMonitor+reportPerformanceIssue"></a>

### modalMonitor.reportPerformanceIssue()

Report performance issue

**Kind**: instance method of [<code>ModalMonitor</code>](#ModalMonitor)  

* * *

<a name="ModalMonitor+logError"></a>

### modalMonitor.logError()

Log error to error tracking system

**Kind**: instance method of [<code>ModalMonitor</code>](#ModalMonitor)  

* * *

<a name="ModalMonitor+trimMetricsArrays"></a>

### modalMonitor.trimMetricsArrays()

Trim metrics arrays to prevent memory issues

**Kind**: instance method of [<code>ModalMonitor</code>](#ModalMonitor)  

* * *

<a name="ModalMonitor+startPeriodicReporting"></a>

### modalMonitor.startPeriodicReporting()

Start periodic reporting

**Kind**: instance method of [<code>ModalMonitor</code>](#ModalMonitor)  

* * *

<a name="ModalMonitor+generatePerformanceReport"></a>

### modalMonitor.generatePerformanceReport()

Generate performance report

**Kind**: instance method of [<code>ModalMonitor</code>](#ModalMonitor)  

* * *

<a name="ModalMonitor+calculatePerformanceStats"></a>

### modalMonitor.calculatePerformanceStats()

Calculate performance statistics

**Kind**: instance method of [<code>ModalMonitor</code>](#ModalMonitor)  

* * *

<a name="ModalMonitor+calculateMemoryStats"></a>

### modalMonitor.calculateMemoryStats()

Calculate memory statistics

**Kind**: instance method of [<code>ModalMonitor</code>](#ModalMonitor)  

* * *

<a name="ModalMonitor+calculateStats"></a>

### modalMonitor.calculateStats()

Calculate basic statistics for array

**Kind**: instance method of [<code>ModalMonitor</code>](#ModalMonitor)  

* * *

<a name="ModalMonitor+getRecentErrors"></a>

### modalMonitor.getRecentErrors()

Get recent errors

**Kind**: instance method of [<code>ModalMonitor</code>](#ModalMonitor)  

* * *

<a name="ModalMonitor+calculateHealthScore"></a>

### modalMonitor.calculateHealthScore()

Calculate overall health score (0-100)

**Kind**: instance method of [<code>ModalMonitor</code>](#ModalMonitor)  

* * *

<a name="ModalMonitor+getStatus"></a>

### modalMonitor.getStatus()

Get current monitoring status

**Kind**: instance method of [<code>ModalMonitor</code>](#ModalMonitor)  

* * *

<a name="ModalMonitor+getMetrics"></a>

### modalMonitor.getMetrics()

Get all metrics data

**Kind**: instance method of [<code>ModalMonitor</code>](#ModalMonitor)  

* * *

<a name="ModalMonitor+dispatchEvent"></a>

### modalMonitor.dispatchEvent()

Dispatch custom event

**Kind**: instance method of [<code>ModalMonitor</code>](#ModalMonitor)  

* * *

<a name="ModalMonitor+formatBytes"></a>

### modalMonitor.formatBytes()

Format bytes for human reading

**Kind**: instance method of [<code>ModalMonitor</code>](#ModalMonitor)  

* * *

<a name="ModalMonitor+destroy"></a>

### modalMonitor.destroy()

Clean up monitoring

**Kind**: instance method of [<code>ModalMonitor</code>](#ModalMonitor)  

* * *

<a name="ModalMonitorIntegration"></a>

## ModalMonitorIntegration

Modal Monitor Integration Helper
Provides easy integration with existing modal system

**Kind**: global class  

* * *

<a name="PaginationController"></a>

## PaginationController

PaginationController - Handles pagination logic and UI generation

Usage:

```javascript
const pagination = new PaginationController(12, [6, 12, 24, 48]);
pagination.setTotalItems(150);
pagination.renderPaginationControls('pagination-container', 
  () => renderCurrentPage(), 
  () => renderCurrentPage()
);
```

**Kind**: global class  

* * *

<a name="ProgressModal"></a>

## ProgressModal

Real-time Progress Modal Class

**Kind**: global class  

- [ProgressModal](#ProgressModal)
  - [.createModalHTML()](#ProgressModal+createModalHTML)
  - [.setupEventListeners()](#ProgressModal+setupEventListeners)
  - [.setupWebSocketListeners()](#ProgressModal+setupWebSocketListeners)
  - [.removeWebSocketListeners()](#ProgressModal+removeWebSocketListeners)
  - [.show(options)](#ProgressModal+show)
  - [.hide()](#ProgressModal+hide)
  - [.update(data)](#ProgressModal+update)
  - [.handleProgressUpdate(data)](#ProgressModal+handleProgressUpdate)
  - [.handleProgressStatus(data)](#ProgressModal+handleProgressStatus)
  - [.handleProgressComplete(data)](#ProgressModal+handleProgressComplete)
  - [.handleWebSocketError()](#ProgressModal+handleWebSocketError)
  - [.updateUI()](#ProgressModal+updateUI)
  - [.showSuccess(message)](#ProgressModal+showSuccess)
  - [.showError(message)](#ProgressModal+showError)
  - [.showCompleteButtons()](#ProgressModal+showCompleteButtons)
  - [.handleCancel()](#ProgressModal+handleCancel)
  - [.showCancelConfirmation()](#ProgressModal+showCancelConfirmation)
  - [.handleClose()](#ProgressModal+handleClose)
  - [.isActiveProgress()](#ProgressModal+isActiveProgress) ⇒ <code>boolean</code>
  - [.resetProgressState()](#ProgressModal+resetProgressState)
  - [.cleanup()](#ProgressModal+cleanup)
  - [.destroy()](#ProgressModal+destroy)

* * *

<a name="ProgressModal+createModalHTML"></a>

### progressModal.createModalHTML()

Create the modal HTML structure following HexTrackr patterns

**Kind**: instance method of [<code>ProgressModal</code>](#ProgressModal)  

* * *

<a name="ProgressModal+setupEventListeners"></a>

### progressModal.setupEventListeners()

Setup event listeners for modal interactions

**Kind**: instance method of [<code>ProgressModal</code>](#ProgressModal)  

* * *

<a name="ProgressModal+setupWebSocketListeners"></a>

### progressModal.setupWebSocketListeners()

Setup WebSocket event listeners

**Kind**: instance method of [<code>ProgressModal</code>](#ProgressModal)  

* * *

<a name="ProgressModal+removeWebSocketListeners"></a>

### progressModal.removeWebSocketListeners()

Remove WebSocket event listeners

**Kind**: instance method of [<code>ProgressModal</code>](#ProgressModal)  

* * *

<a name="ProgressModal+show"></a>

### progressModal.show(options)

Show the progress modal

**Kind**: instance method of [<code>ProgressModal</code>](#ProgressModal)  

| Param | Type | Description |
| --- | --- | --- |
| options | <code>Object</code> | Configuration options |
| options.title | <code>string</code> | Modal title |
| options.sessionId | <code>string</code> | Session ID for WebSocket room |
| options.allowCancel | <code>boolean</code> | Whether to show cancel button |
| options.onCancel | <code>function</code> | Callback for cancel action |
| options.initialMessage | <code>string</code> | Initial status message |

* * *

<a name="ProgressModal+hide"></a>

### progressModal.hide()

Hide the progress modal

**Kind**: instance method of [<code>ProgressModal</code>](#ProgressModal)  

* * *

<a name="ProgressModal+update"></a>

### progressModal.update(data)

Update progress manually (for non-WebSocket usage)

**Kind**: instance method of [<code>ProgressModal</code>](#ProgressModal)  

| Param | Type | Description |
| --- | --- | --- |
| data | <code>Object</code> | Progress data |

* * *

<a name="ProgressModal+handleProgressUpdate"></a>

### progressModal.handleProgressUpdate(data)

Handle progress updates from WebSocket

**Kind**: instance method of [<code>ProgressModal</code>](#ProgressModal)  

| Param | Type | Description |
| --- | --- | --- |
| data | <code>Object</code> | Progress data from WebSocket |

* * *

<a name="ProgressModal+handleProgressStatus"></a>

### progressModal.handleProgressStatus(data)

Handle status updates from WebSocket

**Kind**: instance method of [<code>ProgressModal</code>](#ProgressModal)  

| Param | Type | Description |
| --- | --- | --- |
| data | <code>Object</code> | Status data from WebSocket |

* * *

<a name="ProgressModal+handleProgressComplete"></a>

### progressModal.handleProgressComplete(data)

Handle progress completion from WebSocket

**Kind**: instance method of [<code>ProgressModal</code>](#ProgressModal)  

| Param | Type | Description |
| --- | --- | --- |
| data | <code>Object</code> | Completion data from WebSocket |

* * *

<a name="ProgressModal+handleWebSocketError"></a>

### progressModal.handleWebSocketError()

Handle WebSocket connection errors

**Kind**: instance method of [<code>ProgressModal</code>](#ProgressModal)  

* * *

<a name="ProgressModal+updateUI"></a>

### progressModal.updateUI()

Update the UI with current progress data

**Kind**: instance method of [<code>ProgressModal</code>](#ProgressModal)  

* * *

<a name="ProgressModal+showSuccess"></a>

### progressModal.showSuccess(message)

Show success state

**Kind**: instance method of [<code>ProgressModal</code>](#ProgressModal)  

| Param | Type | Description |
| --- | --- | --- |
| message | <code>string</code> | Success message |

* * *

<a name="ProgressModal+showError"></a>

### progressModal.showError(message)

Show error state

**Kind**: instance method of [<code>ProgressModal</code>](#ProgressModal)  

| Param | Type | Description |
| --- | --- | --- |
| message | <code>string</code> | Error message |

* * *

<a name="ProgressModal+showCompleteButtons"></a>

### progressModal.showCompleteButtons()

Show completion buttons (hide cancel, show close)

**Kind**: instance method of [<code>ProgressModal</code>](#ProgressModal)  

* * *

<a name="ProgressModal+handleCancel"></a>

### progressModal.handleCancel()

Handle cancel button click

**Kind**: instance method of [<code>ProgressModal</code>](#ProgressModal)  

* * *

<a name="ProgressModal+showCancelConfirmation"></a>

### progressModal.showCancelConfirmation()

Show cancel confirmation dialog

**Kind**: instance method of [<code>ProgressModal</code>](#ProgressModal)  

* * *

<a name="ProgressModal+handleClose"></a>

### progressModal.handleClose()

Handle close button click

**Kind**: instance method of [<code>ProgressModal</code>](#ProgressModal)  

* * *

<a name="ProgressModal+isActiveProgress"></a>

### progressModal.isActiveProgress() ⇒ <code>boolean</code>

Check if progress is actively running

**Kind**: instance method of [<code>ProgressModal</code>](#ProgressModal)  
**Returns**: <code>boolean</code> - True if progress is active  

* * *

<a name="ProgressModal+resetProgressState"></a>

### progressModal.resetProgressState()

Reset progress state to initial values

**Kind**: instance method of [<code>ProgressModal</code>](#ProgressModal)  

* * *

<a name="ProgressModal+cleanup"></a>

### progressModal.cleanup()

Cleanup resources when modal is hidden

**Kind**: instance method of [<code>ProgressModal</code>](#ProgressModal)  

* * *

<a name="ProgressModal+destroy"></a>

### progressModal.destroy()

Destroy the modal and remove all event listeners

**Kind**: instance method of [<code>ProgressModal</code>](#ProgressModal)  

* * *

<a name="ToastManager"></a>

## ToastManager

Toast Manager class for handling all user notifications
Provides consistent UI feedback across the application

**Kind**: global class  

- [ToastManager](#ToastManager)
  - [.showToast(message, [type], [options])](#ToastManager+showToast) ⇒ <code>string</code>
  - [.showLoading(message, [options])](#ToastManager+showLoading) ⇒ <code>string</code>
  - [.hideLoading()](#ToastManager+hideLoading)
  - [.showError(message, [error], [options])](#ToastManager+showError)
  - [.showSuccess(message, [options])](#ToastManager+showSuccess)
  - [.showWarning(message, [options])](#ToastManager+showWarning)
  - [.showInfo(message, [options])](#ToastManager+showInfo)
  - [.showCVEStatus(cveId, status, [data])](#ToastManager+showCVEStatus)
  - [.clearAll()](#ToastManager+clearAll)
  - [.showModalError(modalId, message, [options])](#ToastManager+showModalError)
  - [.clearModalErrors(modalId)](#ToastManager+clearModalErrors)

* * *

<a name="ToastManager+showToast"></a>

### toastManager.showToast(message, [type], [options]) ⇒ <code>string</code>

Show a toast notification

**Kind**: instance method of [<code>ToastManager</code>](#ToastManager)  
**Returns**: <code>string</code> - Toast ID for reference  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| message | <code>string</code> |  | Message to display |
| [type] | <code>string</code> | <code>&quot;&#x27;info&#x27;&quot;</code> | Type: success, error, warning, info, danger |
| [options] | <code>Object</code> |  | Additional options |

* * *

<a name="ToastManager+showLoading"></a>

### toastManager.showLoading(message, [options]) ⇒ <code>string</code>

Show a loading toast with spinner

**Kind**: instance method of [<code>ToastManager</code>](#ToastManager)  
**Returns**: <code>string</code> - Loading toast ID  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| message | <code>string</code> | <code>&quot;Loading...&quot;</code> | Loading message |
| [options] | <code>Object</code> |  | Additional options |

* * *

<a name="ToastManager+hideLoading"></a>

### toastManager.hideLoading()

Hide the loading toast

**Kind**: instance method of [<code>ToastManager</code>](#ToastManager)  

* * *

<a name="ToastManager+showError"></a>

### toastManager.showError(message, [error], [options])

Show error with details

**Kind**: instance method of [<code>ToastManager</code>](#ToastManager)  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| message | <code>string</code> |  | Error message |
| [error] | <code>Error</code> \| <code>Object</code> | <code></code> | Error object with details |
| [options] | <code>Object</code> |  | Additional options |

* * *

<a name="ToastManager+showSuccess"></a>

### toastManager.showSuccess(message, [options])

Show success message

**Kind**: instance method of [<code>ToastManager</code>](#ToastManager)  

| Param | Type | Description |
| --- | --- | --- |
| message | <code>string</code> | Success message |
| [options] | <code>Object</code> | Additional options |

* * *

<a name="ToastManager+showWarning"></a>

### toastManager.showWarning(message, [options])

Show warning message

**Kind**: instance method of [<code>ToastManager</code>](#ToastManager)  

| Param | Type | Description |
| --- | --- | --- |
| message | <code>string</code> | Warning message |
| [options] | <code>Object</code> | Additional options |

* * *

<a name="ToastManager+showInfo"></a>

### toastManager.showInfo(message, [options])

Show info message

**Kind**: instance method of [<code>ToastManager</code>](#ToastManager)  

| Param | Type | Description |
| --- | --- | --- |
| message | <code>string</code> | Info message |
| [options] | <code>Object</code> | Additional options |

* * *

<a name="ToastManager+showCVEStatus"></a>

### toastManager.showCVEStatus(cveId, status, [data])

Show a toast for CVE lookup status

**Kind**: instance method of [<code>ToastManager</code>](#ToastManager)  

| Param | Type | Description |
| --- | --- | --- |
| cveId | <code>string</code> | CVE identifier |
| status | <code>string</code> | Status: looking, found, notfound, error |
| [data] | <code>Object</code> | Additional data |

* * *

<a name="ToastManager+clearAll"></a>

### toastManager.clearAll()

Clear all toasts

**Kind**: instance method of [<code>ToastManager</code>](#ToastManager)  

* * *

<a name="ToastManager+showModalError"></a>

### toastManager.showModalError(modalId, message, [options])

Show modal error state

**Kind**: instance method of [<code>ToastManager</code>](#ToastManager)  

| Param | Type | Description |
| --- | --- | --- |
| modalId | <code>string</code> | Modal element ID |
| message | <code>string</code> | Error message |
| [options] | <code>Object</code> | Additional options |

* * *

<a name="ToastManager+clearModalErrors"></a>

### toastManager.clearModalErrors(modalId)

Clear modal errors

**Kind**: instance method of [<code>ToastManager</code>](#ToastManager)  

| Param | Type | Description |
| --- | --- | --- |
| modalId | <code>string</code> | Modal element ID |

* * *

<a name="VulnerabilityCardsManager"></a>

## VulnerabilityCardsManager

Manages device cards and vulnerability cards rendering with pagination

**Kind**: global class  

- [VulnerabilityCardsManager](#VulnerabilityCardsManager)
  - [.renderDeviceCards()](#VulnerabilityCardsManager+renderDeviceCards)
  - [.generateDeviceCardsHTML(devices)](#VulnerabilityCardsManager+generateDeviceCardsHTML) ⇒ <code>string</code>
  - [.renderVulnerabilityCards()](#VulnerabilityCardsManager+renderVulnerabilityCards)
  - [.generateVulnerabilityCardsHTML(vulnEntries)](#VulnerabilityCardsManager+generateVulnerabilityCardsHTML) ⇒ <code>string</code>
  - [.generateVulnerabilityLinkHTML(cve, primaryVuln)](#VulnerabilityCardsManager+generateVulnerabilityLinkHTML) ⇒ <code>string</code>
  - [.generateVulnerabilityActionsHTML(cve, primaryVuln, vulnDataId)](#VulnerabilityCardsManager+generateVulnerabilityActionsHTML) ⇒ <code>string</code>
  - [.initializeSortable(container)](#VulnerabilityCardsManager+initializeSortable)
  - [.updateForCurrentView(viewType)](#VulnerabilityCardsManager+updateForCurrentView)

* * *

<a name="VulnerabilityCardsManager+renderDeviceCards"></a>

### vulnerabilityCardsManager.renderDeviceCards()

Render device cards with VPR scoring and pagination

**Kind**: instance method of [<code>VulnerabilityCardsManager</code>](#VulnerabilityCardsManager)  

* * *

<a name="VulnerabilityCardsManager+generateDeviceCardsHTML"></a>

### vulnerabilityCardsManager.generateDeviceCardsHTML(devices) ⇒ <code>string</code>

Generate HTML for device cards

**Kind**: instance method of [<code>VulnerabilityCardsManager</code>](#VulnerabilityCardsManager)  
**Returns**: <code>string</code> - HTML string for device cards  

| Param | Type | Description |
| --- | --- | --- |
| devices | <code>Array</code> | Array of device objects |

* * *

<a name="VulnerabilityCardsManager+renderVulnerabilityCards"></a>

### vulnerabilityCardsManager.renderVulnerabilityCards()

Render vulnerability cards grouped by CVE with VPR scoring

**Kind**: instance method of [<code>VulnerabilityCardsManager</code>](#VulnerabilityCardsManager)  

* * *

<a name="VulnerabilityCardsManager+generateVulnerabilityCardsHTML"></a>

### vulnerabilityCardsManager.generateVulnerabilityCardsHTML(vulnEntries) ⇒ <code>string</code>

Generate HTML for vulnerability cards

**Kind**: instance method of [<code>VulnerabilityCardsManager</code>](#VulnerabilityCardsManager)  
**Returns**: <code>string</code> - HTML string for vulnerability cards  

| Param | Type | Description |
| --- | --- | --- |
| vulnEntries | <code>Array</code> | Array of [cve, vulns] tuples |

* * *

<a name="VulnerabilityCardsManager+generateVulnerabilityLinkHTML"></a>

### vulnerabilityCardsManager.generateVulnerabilityLinkHTML(cve, primaryVuln) ⇒ <code>string</code>

Generate vulnerability link HTML (CVE or Cisco SA)
Handles multiple CVEs with proper individual link creation

**Kind**: instance method of [<code>VulnerabilityCardsManager</code>](#VulnerabilityCardsManager)  
**Returns**: <code>string</code> - HTML string for vulnerability link(s)  

| Param | Type | Description |
| --- | --- | --- |
| cve | <code>string</code> | CVE identifier(s) - may be comma/space separated |
| primaryVuln | <code>Object</code> | Primary vulnerability object |

* * *

<a name="VulnerabilityCardsManager+generateVulnerabilityActionsHTML"></a>

### vulnerabilityCardsManager.generateVulnerabilityActionsHTML(cve, primaryVuln, vulnDataId) ⇒ <code>string</code>

Generate vulnerability card actions HTML

**Kind**: instance method of [<code>VulnerabilityCardsManager</code>](#VulnerabilityCardsManager)  
**Returns**: <code>string</code> - HTML string for card actions  

| Param | Type | Description |
| --- | --- | --- |
| cve | <code>string</code> | CVE identifier |
| primaryVuln | <code>Object</code> | Primary vulnerability object |
| vulnDataId | <code>string</code> | Vulnerability data ID |

* * *

<a name="VulnerabilityCardsManager+initializeSortable"></a>

### vulnerabilityCardsManager.initializeSortable(container)

Initialize Sortable.js for drag-and-drop functionality

**Kind**: instance method of [<code>VulnerabilityCardsManager</code>](#VulnerabilityCardsManager)  

| Param | Type | Description |
| --- | --- | --- |
| container | <code>HTMLElement</code> | Container element |

* * *

<a name="VulnerabilityCardsManager+updateForCurrentView"></a>

### vulnerabilityCardsManager.updateForCurrentView(viewType)

Update cards for current view type

**Kind**: instance method of [<code>VulnerabilityCardsManager</code>](#VulnerabilityCardsManager)  

| Param | Type | Description |
| --- | --- | --- |
| viewType | <code>string</code> | Current view type |

* * *

<a name="VulnerabilityDataManager"></a>

## VulnerabilityDataManager

VulnerabilityDataManager - Centralized data management for vulnerability system

Usage:

```javascript
const dataManager = new VulnerabilityDataManager('/api');
await dataManager.loadData();
const filteredData = dataManager.filterData('searchTerm', 'Critical');
```

**Kind**: global class  

- [VulnerabilityDataManager](#VulnerabilityDataManager)
  - [.loadData()](#VulnerabilityDataManager+loadData) ⇒ <code>Promise.&lt;void&gt;</code>
  - [.processDevices()](#VulnerabilityDataManager+processDevices)
  - [.loadStatistics()](#VulnerabilityDataManager+loadStatistics) ⇒ <code>Promise.&lt;void&gt;</code>
  - [.filterData(searchTerm, severityFilter)](#VulnerabilityDataManager+filterData) ⇒ <code>Array</code>
  - [.groupVulnerabilitiesByCVE()](#VulnerabilityDataManager+groupVulnerabilitiesByCVE) ⇒ <code>Object</code>
  - [.getDeviceByHostname(hostname)](#VulnerabilityDataManager+getDeviceByHostname) ⇒ <code>Object</code> \| <code>null</code>
  - [.getStatistics()](#VulnerabilityDataManager+getStatistics) ⇒ <code>Object</code>
  - [.getTrends()](#VulnerabilityDataManager+getTrends) ⇒ <code>Object</code>
  - [.getHistoricalData()](#VulnerabilityDataManager+getHistoricalData) ⇒ <code>Array</code>
  - [.getAllVulnerabilities()](#VulnerabilityDataManager+getAllVulnerabilities) ⇒ <code>Array</code>
  - [.getFilteredVulnerabilities()](#VulnerabilityDataManager+getFilteredVulnerabilities) ⇒ <code>Array</code>
  - [.getDevices()](#VulnerabilityDataManager+getDevices) ⇒ <code>Array</code>
  - [.getUniqueAssetCount()](#VulnerabilityDataManager+getUniqueAssetCount) ⇒ <code>number</code>
  - [.refreshData()](#VulnerabilityDataManager+refreshData) ⇒ <code>Promise.&lt;void&gt;</code>
  - [.on(event, callback)](#VulnerabilityDataManager+on)
  - [.off(event, callback)](#VulnerabilityDataManager+off)
  - [.emit(event, data)](#VulnerabilityDataManager+emit)
  - [.extendTimelineData(originalData)](#VulnerabilityDataManager+extendTimelineData) ⇒ <code>Array</code>
  - [.exportDeviceReport(hostname)](#VulnerabilityDataManager+exportDeviceReport) ⇒ <code>Object</code> \| <code>null</code>
  - [.saveVulnerability(id, formData)](#VulnerabilityDataManager+saveVulnerability) ⇒ <code>Promise.&lt;boolean&gt;</code>
  - [.deleteVulnerability(id)](#VulnerabilityDataManager+deleteVulnerability) ⇒ <code>Promise.&lt;boolean&gt;</code>
  - [.clearAllData()](#VulnerabilityDataManager+clearAllData) ⇒ <code>Promise.&lt;boolean&gt;</code>
  - [.fetchTenableHistoricalData(apiKey, secretKey)](#VulnerabilityDataManager+fetchTenableHistoricalData) ⇒ <code>Promise.&lt;(Object\|null)&gt;</code>

* * *

<a name="VulnerabilityDataManager+loadData"></a>

### vulnerabilityDataManager.loadData() ⇒ <code>Promise.&lt;void&gt;</code>

Load vulnerability data from API endpoints

**Kind**: instance method of [<code>VulnerabilityDataManager</code>](#VulnerabilityDataManager)  

* * *

<a name="VulnerabilityDataManager+processDevices"></a>

### vulnerabilityDataManager.processDevices()

Process vulnerability data to create device aggregations

**Kind**: instance method of [<code>VulnerabilityDataManager</code>](#VulnerabilityDataManager)  

* * *

<a name="VulnerabilityDataManager+loadStatistics"></a>

### vulnerabilityDataManager.loadStatistics() ⇒ <code>Promise.&lt;void&gt;</code>

Load statistics and trend data from API

**Kind**: instance method of [<code>VulnerabilityDataManager</code>](#VulnerabilityDataManager)  

* * *

<a name="VulnerabilityDataManager+filterData"></a>

### vulnerabilityDataManager.filterData(searchTerm, severityFilter) ⇒ <code>Array</code>

Filter vulnerability data based on search term and severity

**Kind**: instance method of [<code>VulnerabilityDataManager</code>](#VulnerabilityDataManager)  
**Returns**: <code>Array</code> - Filtered vulnerabilities  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| searchTerm | <code>string</code> | <code>null</code> | Search term for hostname, CVE, or plugin name |
| severityFilter | <code>string</code> | <code>null</code> | Severity level filter |

* * *

<a name="VulnerabilityDataManager+groupVulnerabilitiesByCVE"></a>

### vulnerabilityDataManager.groupVulnerabilitiesByCVE() ⇒ <code>Object</code>

Group vulnerabilities by CVE for card view display

**Kind**: instance method of [<code>VulnerabilityDataManager</code>](#VulnerabilityDataManager)  
**Returns**: <code>Object</code> - Grouped vulnerabilities by CVE or plugin ID  

* * *

<a name="VulnerabilityDataManager+getDeviceByHostname"></a>

### vulnerabilityDataManager.getDeviceByHostname(hostname) ⇒ <code>Object</code> \| <code>null</code>

Get device by hostname

**Kind**: instance method of [<code>VulnerabilityDataManager</code>](#VulnerabilityDataManager)  
**Returns**: <code>Object</code> \| <code>null</code> - Device object or null if not found  

| Param | Type | Description |
| --- | --- | --- |
| hostname | <code>string</code> | Device hostname |

* * *

<a name="VulnerabilityDataManager+getStatistics"></a>

### vulnerabilityDataManager.getStatistics() ⇒ <code>Object</code>

Get vulnerability statistics

**Kind**: instance method of [<code>VulnerabilityDataManager</code>](#VulnerabilityDataManager)  
**Returns**: <code>Object</code> - Current statistics object  

* * *

<a name="VulnerabilityDataManager+getTrends"></a>

### vulnerabilityDataManager.getTrends() ⇒ <code>Object</code>

Get trend data

**Kind**: instance method of [<code>VulnerabilityDataManager</code>](#VulnerabilityDataManager)  
**Returns**: <code>Object</code> - Current trend data  

* * *

<a name="VulnerabilityDataManager+getHistoricalData"></a>

### vulnerabilityDataManager.getHistoricalData() ⇒ <code>Array</code>

Get historical data for charting

**Kind**: instance method of [<code>VulnerabilityDataManager</code>](#VulnerabilityDataManager)  
**Returns**: <code>Array</code> - Historical trend data  

* * *

<a name="VulnerabilityDataManager+getAllVulnerabilities"></a>

### vulnerabilityDataManager.getAllVulnerabilities() ⇒ <code>Array</code>

Get all vulnerability data

**Kind**: instance method of [<code>VulnerabilityDataManager</code>](#VulnerabilityDataManager)  
**Returns**: <code>Array</code> - All vulnerabilities  

* * *

<a name="VulnerabilityDataManager+getFilteredVulnerabilities"></a>

### vulnerabilityDataManager.getFilteredVulnerabilities() ⇒ <code>Array</code>

Get filtered vulnerability data

**Kind**: instance method of [<code>VulnerabilityDataManager</code>](#VulnerabilityDataManager)  
**Returns**: <code>Array</code> - Filtered vulnerabilities  

* * *

<a name="VulnerabilityDataManager+getDevices"></a>

### vulnerabilityDataManager.getDevices() ⇒ <code>Array</code>

Get all processed devices

**Kind**: instance method of [<code>VulnerabilityDataManager</code>](#VulnerabilityDataManager)  
**Returns**: <code>Array</code> - All device objects  

* * *

<a name="VulnerabilityDataManager+getUniqueAssetCount"></a>

### vulnerabilityDataManager.getUniqueAssetCount() ⇒ <code>number</code>

Get unique asset count

**Kind**: instance method of [<code>VulnerabilityDataManager</code>](#VulnerabilityDataManager)  
**Returns**: <code>number</code> - Number of unique assets  

* * *

<a name="VulnerabilityDataManager+refreshData"></a>

### vulnerabilityDataManager.refreshData() ⇒ <code>Promise.&lt;void&gt;</code>

Refresh all data from API

**Kind**: instance method of [<code>VulnerabilityDataManager</code>](#VulnerabilityDataManager)  

* * *

<a name="VulnerabilityDataManager+on"></a>

### vulnerabilityDataManager.on(event, callback)

Add event listener

**Kind**: instance method of [<code>VulnerabilityDataManager</code>](#VulnerabilityDataManager)  

| Param | Type | Description |
| --- | --- | --- |
| event | <code>string</code> | Event name |
| callback | <code>function</code> | Callback function |

* * *

<a name="VulnerabilityDataManager+off"></a>

### vulnerabilityDataManager.off(event, callback)

Remove event listener

**Kind**: instance method of [<code>VulnerabilityDataManager</code>](#VulnerabilityDataManager)  

| Param | Type | Description |
| --- | --- | --- |
| event | <code>string</code> | Event name |
| callback | <code>function</code> | Callback function to remove |

* * *

<a name="VulnerabilityDataManager+emit"></a>

### vulnerabilityDataManager.emit(event, data)

Emit event to all listeners

**Kind**: instance method of [<code>VulnerabilityDataManager</code>](#VulnerabilityDataManager)  

| Param | Type | Description |
| --- | --- | --- |
| event | <code>string</code> | Event name |
| data | <code>Object</code> | Event data |

* * *

<a name="VulnerabilityDataManager+extendTimelineData"></a>

### vulnerabilityDataManager.extendTimelineData(originalData) ⇒ <code>Array</code>

Extend timeline data with interpolated values for charting

**Kind**: instance method of [<code>VulnerabilityDataManager</code>](#VulnerabilityDataManager)  
**Returns**: <code>Array</code> - Extended data with interpolated values  

| Param | Type | Description |
| --- | --- | --- |
| originalData | <code>Array</code> | Original historical data points |

* * *

<a name="VulnerabilityDataManager+exportDeviceReport"></a>

### vulnerabilityDataManager.exportDeviceReport(hostname) ⇒ <code>Object</code> \| <code>null</code>

Export device vulnerability report as CSV data

**Kind**: instance method of [<code>VulnerabilityDataManager</code>](#VulnerabilityDataManager)  
**Returns**: <code>Object</code> \| <code>null</code> - CSV data and metadata or null if device not found  

| Param | Type | Description |
| --- | --- | --- |
| hostname | <code>string</code> | Device hostname |

* * *

<a name="VulnerabilityDataManager+saveVulnerability"></a>

### vulnerabilityDataManager.saveVulnerability(id, formData) ⇒ <code>Promise.&lt;boolean&gt;</code>

Save vulnerability changes via API

**Kind**: instance method of [<code>VulnerabilityDataManager</code>](#VulnerabilityDataManager)  
**Returns**: <code>Promise.&lt;boolean&gt;</code> - Success status  

| Param | Type | Description |
| --- | --- | --- |
| id | <code>number</code> | Vulnerability ID |
| formData | <code>Object</code> | Updated vulnerability data |

* * *

<a name="VulnerabilityDataManager+deleteVulnerability"></a>

### vulnerabilityDataManager.deleteVulnerability(id) ⇒ <code>Promise.&lt;boolean&gt;</code>

Delete vulnerability via API

**Kind**: instance method of [<code>VulnerabilityDataManager</code>](#VulnerabilityDataManager)  
**Returns**: <code>Promise.&lt;boolean&gt;</code> - Success status  

| Param | Type | Description |
| --- | --- | --- |
| id | <code>number</code> | Vulnerability ID |

* * *

<a name="VulnerabilityDataManager+clearAllData"></a>

### vulnerabilityDataManager.clearAllData() ⇒ <code>Promise.&lt;boolean&gt;</code>

Clear all vulnerability data via API

**Kind**: instance method of [<code>VulnerabilityDataManager</code>](#VulnerabilityDataManager)  
**Returns**: <code>Promise.&lt;boolean&gt;</code> - Success status  

* * *

<a name="VulnerabilityDataManager+fetchTenableHistoricalData"></a>

### vulnerabilityDataManager.fetchTenableHistoricalData(apiKey, secretKey) ⇒ <code>Promise.&lt;(Object\|null)&gt;</code>

Fetch historical VPR data from Tenable API

**Kind**: instance method of [<code>VulnerabilityDataManager</code>](#VulnerabilityDataManager)  
**Returns**: <code>Promise.&lt;(Object\|null)&gt;</code> - Fetched data or null on error  

| Param | Type | Description |
| --- | --- | --- |
| apiKey | <code>string</code> | Tenable API key |
| secretKey | <code>string</code> | Tenable secret key |

* * *

<a name="VulnerabilitySearchManager"></a>

## VulnerabilitySearchManager

Manages vulnerability search, filtering, and external lookup operations

**Kind**: global class  

- [VulnerabilitySearchManager](#VulnerabilitySearchManager)
  - [.setupEventListeners()](#VulnerabilitySearchManager+setupEventListeners)
  - [.lookupVulnerability(vulnId, pluginName)](#VulnerabilitySearchManager+lookupVulnerability)
  - [.lookupCVE(cveId)](#VulnerabilitySearchManager+lookupCVE)
  - [.lookupCVEWithCiscoAPI(cveId, clientId, clientSecret, retryCount, maxRetries)](#VulnerabilitySearchManager+lookupCVEWithCiscoAPI)
  - [.openCVEPopups(cveIds)](#VulnerabilitySearchManager+openCVEPopups)
  - [.displayCVEInfo(cveId, data)](#VulnerabilitySearchManager+displayCVEInfo)
  - [.extractCiscoVulnId(pluginName)](#VulnerabilitySearchManager+extractCiscoVulnId) ⇒ <code>string</code> \| <code>null</code>
  - [.getVulnerabilityLink(vulnData)](#VulnerabilitySearchManager+getVulnerabilityLink) ⇒ <code>Object</code>
  - [.delay(ms)](#VulnerabilitySearchManager+delay)
  - [.cacheAPIResponse(cveId, data)](#VulnerabilitySearchManager+cacheAPIResponse)
  - [.getCachedAPIResponse(cveId)](#VulnerabilitySearchManager+getCachedAPIResponse) ⇒ <code>Object</code> \| <code>null</code>
  - [.handleOfflineMode(cveId)](#VulnerabilitySearchManager+handleOfflineMode)
  - [.displayOfflineCVEInfo(cveId)](#VulnerabilitySearchManager+displayOfflineCVEInfo)
  - [.processPendingCVELookups()](#VulnerabilitySearchManager+processPendingCVELookups)

* * *

<a name="VulnerabilitySearchManager+setupEventListeners"></a>

### vulnerabilitySearchManager.setupEventListeners()

Setup search and filter event listeners

**Kind**: instance method of [<code>VulnerabilitySearchManager</code>](#VulnerabilitySearchManager)  

* * *

<a name="VulnerabilitySearchManager+lookupVulnerability"></a>

### vulnerabilitySearchManager.lookupVulnerability(vulnId, pluginName)

Enhanced lookup method that handles different vulnerability ID types

**Kind**: instance method of [<code>VulnerabilitySearchManager</code>](#VulnerabilitySearchManager)  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| vulnId | <code>string</code> |  | Vulnerability ID (CVE, Cisco SA, or plugin) |
| pluginName | <code>string</code> | <code>null</code> | Optional plugin name for extraction |

* * *

<a name="VulnerabilitySearchManager+lookupCVE"></a>

### vulnerabilitySearchManager.lookupCVE(cveId)

Handle CVE lookup with multiple CVE support

**Kind**: instance method of [<code>VulnerabilitySearchManager</code>](#VulnerabilitySearchManager)  

| Param | Type | Description |
| --- | --- | --- |
| cveId | <code>string</code> | CVE identifier(s) |

* * *

<a name="VulnerabilitySearchManager+lookupCVEWithCiscoAPI"></a>

### vulnerabilitySearchManager.lookupCVEWithCiscoAPI(cveId, clientId, clientSecret, retryCount, maxRetries)

Lookup CVE using Cisco PSIRT API with retry and fallback (T040)

**Kind**: instance method of [<code>VulnerabilitySearchManager</code>](#VulnerabilitySearchManager)  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| cveId | <code>string</code> |  | Single CVE identifier |
| clientId | <code>string</code> |  | Cisco API client ID |
| clientSecret | <code>string</code> |  | Cisco API client secret |
| retryCount | <code>number</code> | <code>0</code> | Current retry attempt |
| maxRetries | <code>number</code> | <code>3</code> | Maximum number of retries |

* * *

<a name="VulnerabilitySearchManager+openCVEPopups"></a>

### vulnerabilitySearchManager.openCVEPopups(cveIds)

Open CVE lookup popups for multiple CVE IDs

**Kind**: instance method of [<code>VulnerabilitySearchManager</code>](#VulnerabilitySearchManager)  

| Param | Type | Description |
| --- | --- | --- |
| cveIds | <code>Array</code> | Array of CVE identifiers |

* * *

<a name="VulnerabilitySearchManager+displayCVEInfo"></a>

### vulnerabilitySearchManager.displayCVEInfo(cveId, data)

Display CVE information from Cisco PSIRT API

**Kind**: instance method of [<code>VulnerabilitySearchManager</code>](#VulnerabilitySearchManager)  

| Param | Type | Description |
| --- | --- | --- |
| cveId | <code>string</code> | CVE identifier |
| data | <code>Object</code> | CVE data from API |

* * *

<a name="VulnerabilitySearchManager+extractCiscoVulnId"></a>

### vulnerabilitySearchManager.extractCiscoVulnId(pluginName) ⇒ <code>string</code> \| <code>null</code>

Extract Cisco vulnerability ID from plugin name

**Kind**: instance method of [<code>VulnerabilitySearchManager</code>](#VulnerabilitySearchManager)  
**Returns**: <code>string</code> \| <code>null</code> - Cisco SA identifier or null  

| Param | Type | Description |
| --- | --- | --- |
| pluginName | <code>string</code> | Plugin name to search |

* * *

<a name="VulnerabilitySearchManager+getVulnerabilityLink"></a>

### vulnerabilitySearchManager.getVulnerabilityLink(vulnData) ⇒ <code>Object</code>

Determine vulnerability ID type and create appropriate link

**Kind**: instance method of [<code>VulnerabilitySearchManager</code>](#VulnerabilitySearchManager)  
**Returns**: <code>Object</code> - Link information object  

| Param | Type | Description |
| --- | --- | --- |
| vulnData | <code>Object</code> | Vulnerability data object |

* * *

<a name="VulnerabilitySearchManager+delay"></a>

### vulnerabilitySearchManager.delay(ms)

T040: Helper method for exponential backoff delay

**Kind**: instance method of [<code>VulnerabilitySearchManager</code>](#VulnerabilitySearchManager)  

| Param | Type | Description |
| --- | --- | --- |
| ms | <code>number</code> | Milliseconds to delay |

* * *

<a name="VulnerabilitySearchManager+cacheAPIResponse"></a>

### vulnerabilitySearchManager.cacheAPIResponse(cveId, data)

T040: Cache API responses for offline/failure scenarios

**Kind**: instance method of [<code>VulnerabilitySearchManager</code>](#VulnerabilitySearchManager)  

| Param | Type | Description |
| --- | --- | --- |
| cveId | <code>string</code> | CVE identifier |
| data | <code>Object</code> | API response data |

* * *

<a name="VulnerabilitySearchManager+getCachedAPIResponse"></a>

### vulnerabilitySearchManager.getCachedAPIResponse(cveId) ⇒ <code>Object</code> \| <code>null</code>

T040: Retrieve cached API response

**Kind**: instance method of [<code>VulnerabilitySearchManager</code>](#VulnerabilitySearchManager)  
**Returns**: <code>Object</code> \| <code>null</code> - Cached data or null  

| Param | Type | Description |
| --- | --- | --- |
| cveId | <code>string</code> | CVE identifier |

* * *

<a name="VulnerabilitySearchManager+handleOfflineMode"></a>

### vulnerabilitySearchManager.handleOfflineMode(cveId)

T040: Handle offline mode with graceful degradation

**Kind**: instance method of [<code>VulnerabilitySearchManager</code>](#VulnerabilitySearchManager)  

| Param | Type | Description |
| --- | --- | --- |
| cveId | <code>string</code> | CVE identifier |

* * *

<a name="VulnerabilitySearchManager+displayOfflineCVEInfo"></a>

### vulnerabilitySearchManager.displayOfflineCVEInfo(cveId)

T040: Display offline CVE information

**Kind**: instance method of [<code>VulnerabilitySearchManager</code>](#VulnerabilitySearchManager)  

| Param | Type | Description |
| --- | --- | --- |
| cveId | <code>string</code> | CVE identifier |

* * *

<a name="VulnerabilitySearchManager+processPendingCVELookups"></a>

### vulnerabilitySearchManager.processPendingCVELookups()

T040: Process pending CVE lookups when coming back online

**Kind**: instance method of [<code>VulnerabilitySearchManager</code>](#VulnerabilitySearchManager)  

* * *

<a name="WebSocketClient"></a>

## WebSocketClient

WebSocket client class for real-time progress tracking

**Kind**: global class  

- [WebSocketClient](#WebSocketClient)
  - [.debug()](#WebSocketClient+debug)
  - [.connect()](#WebSocketClient+connect) ⇒ <code>Promise.&lt;boolean&gt;</code>

* * *

<a name="WebSocketClient+debug"></a>

### webSocketClient.debug()

Debug logging method - only logs when debug mode is enabled

**Kind**: instance method of [<code>WebSocketClient</code>](#WebSocketClient)  

* * *

<a name="WebSocketClient+connect"></a>

### webSocketClient.connect() ⇒ <code>Promise.&lt;boolean&gt;</code>

Connect to WebSocket server

**Kind**: instance method of [<code>WebSocketClient</code>](#WebSocketClient)  
**Returns**: <code>Promise.&lt;boolean&gt;</code> - Connection success  

* * *

<a name="headerThemeManager"></a>

## headerThemeManager

Auto-initialize header theme management when module loads
This ensures theme toggles work on all pages that include this script

**Kind**: global constant  

* * *

<a name="VPR_COLORS"></a>

## VPR\_COLORS

Vulnerability Color Constants
Single source of truth for VPR severity colors
These values match the CSS variables defined in vulnerabilities.css

**Kind**: global constant  

* * *

<a name="debounce"></a>

## debounce(func, delay) ⇒ <code>function</code>

Debounce function to limit the rate at which a function gets called.
This is crucial for performance on events that fire rapidly, like window resize.

**Kind**: global function  
**Returns**: <code>function</code> - The debounced function.  

| Param | Type | Description |
| --- | --- | --- |
| func | <code>function</code> | The function to debounce. |
| delay | <code>number</code> | The debounce delay in milliseconds. |

* * *

<a name="createVulnerabilityGridOptions"></a>

## createVulnerabilityGridOptions(componentContext, isDarkMode) ⇒ <code>GridOptions</code>

Creates and returns the complete AG Grid configuration object.

**Kind**: global function  
**Returns**: <code>GridOptions</code> - A complete AG Grid `gridOptions` object.  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| componentContext | <code>object</code> |  | The "this" context of the calling component (e.g., ModernVulnManager)                                    to access its methods and properties like `gridApi`. |
| isDarkMode | <code>boolean</code> | <code>false</code> | Whether to use dark mode theme (optional) |

* * *

<a name="createFallbackFooter"></a>

## createFallbackFooter(container)

Creates a safe fallback footer using DOM methods with badges

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| container | <code>Element</code> | The container element to add footer to |

* * *

<a name="escapeHtml"></a>

## escapeHtml(text) ⇒ <code>string</code>

Escape HTML characters to prevent XSS attacks

**Kind**: global function  
**Returns**: <code>string</code> - Escaped text  

| Param | Type | Description |
| --- | --- | --- |
| text | <code>string</code> | Text to escape |

* * *

<a name="getVPRColors"></a>

## getVPRColors(theme) ⇒ <code>Array.&lt;string&gt;</code>

Get severity colors for the current theme

**Kind**: global function  
**Returns**: <code>Array.&lt;string&gt;</code> - Array of hex color values  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| theme | <code>string</code> | <code>&quot;light&quot;</code> | 'light' or 'dark' |

* * *

<a name="getSeverityColor"></a>

## getSeverityColor(severity, theme) ⇒ <code>Object</code>

Get color configuration for a specific severity

**Kind**: global function  
**Returns**: <code>Object</code> - Color configuration object  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| severity | <code>string</code> |  | 'critical', 'high', 'medium', or 'low' |
| theme | <code>string</code> | <code>&quot;light&quot;</code> | 'light' or 'dark' |

* * *

<a name="getVPRColorsFromCSS"></a>

## getVPRColorsFromCSS() ⇒ <code>Array.&lt;string&gt;</code>

Get colors from CSS variables (dynamic, theme-aware)

**Kind**: global function  
**Returns**: <code>Array.&lt;string&gt;</code> - Array of hex color values from CSS  

* * *

<a name="getCurrentTheme"></a>

## getCurrentTheme() ⇒ <code>string</code>

Get the current theme from document body

**Kind**: global function  
**Returns**: <code>string</code> - 'light' or 'dark'  

* * *

---

# Import API

The Import API provides endpoints for importing vulnerability and ticket data from various sources including CSV files and JSON payloads. It supports both standard and high-performance staging imports with progress tracking via WebSocket.

## Overview

The import system handles:

- CSV vulnerability imports from security scanners (Tenable, Qualys, etc.)
- JSON-based vulnerability and ticket imports
- High-performance staging imports for large datasets
- Real-time progress tracking
- Import history and metadata tracking

## Endpoints

### Import Vulnerabilities (Standard)

**POST** `/api/vulnerabilities/import`

Standard vulnerability CSV import with enhanced lifecycle management. Processes vulnerabilities row-by-row with immediate deduplication.

#### Request

**Headers:**

- `Content-Type: multipart/form-data`

**Body (multipart/form-data):**

- `csvFile` (file, required) - CSV file containing vulnerability data
- `vendor` (string, optional) - Vendor name (auto-extracted from filename if not provided)
- `scanDate` (string, optional) - Scan date in YYYY-MM-DD format (auto-extracted if not provided)

#### Response

```json
{
  "success": true,
  "importId": "imp_20240315_143022_abc123",
  "filename": "tenable_scan_2024-03-15.csv",
  "vendor": "Tenable",
  "scanDate": "2024-03-15",
  "totalRows": 5000,
  "imported": 4500,
  "skipped": 500,
  "duplicates": 450,
  "errors": 0,
  "processingTime": 15000
}
```

#### Error Response

```json
{
  "success": false,
  "error": "Import failed",
  "details": "CSV parsing failed: Unexpected column count"
}
```

---

### Import Vulnerabilities (Staging)

**POST** `/api/vulnerabilities/import-staging`

High-performance vulnerability import using staging table for batch processing. Optimized for large CSV files (10,000+ rows).

#### Request

**Headers:**

- `Content-Type: multipart/form-data`

**Body (multipart/form-data):**

- `csvFile` (file, required) - CSV file containing vulnerability data
- `vendor` (string, optional) - Vendor name (auto-extracted from filename if not provided)
- `scanDate` (string, optional) - Scan date in YYYY-MM-DD format (auto-extracted if not provided)
- `sessionId` (string, optional) - Session ID for progress tracking (auto-generated if not provided)

#### Response

```json
{
  "success": true,
  "message": "Import completed successfully",
  "sessionId": "import-1710515422123-abc123",
  "filename": "large_scan_2024-03-15.csv",
  "vendor": "Qualys",
  "scanDate": "2024-03-15",
  "stats": {
    "totalRows": 50000,
    "imported": 48500,
    "duplicates": 1500,
    "newVulnerabilities": 48500,
    "updatedVulnerabilities": 0,
    "errors": 0
  },
  "processingTime": 45000,
  "performance": {
    "csvParsing": 5000,
    "stagingLoad": 10000,
    "processing": 30000,
    "rowsPerSecond": 1111
  }
}
```

#### Progress Tracking

Progress updates are sent via WebSocket to connected clients:

```json
{
  "sessionId": "import-1710515422123-abc123",
  "progress": 75,
  "message": "Processing batch 3 of 4",
  "currentStep": 2,
  "totalSteps": 3,
  "details": {
    "processedRows": 37500,
    "totalRows": 50000
  }
}
```

---

### Import Vulnerabilities (JSON)

**POST** `/api/import/vulnerabilities`

JSON-based vulnerability import for frontend data restoration and programmatic imports.

#### Request

**Headers:**

- `Content-Type: application/json`

**Body:**

```json
{
  "vulnerabilities": [
    {
      "vulnerability_id": "VULN-001",
      "title": "Critical Security Update",
      "severity": "Critical",
      "cvss": 9.8,
      "cve_id": "CVE-2024-1234",
      "affected_hosts": "server01.example.com",
      "remediation": "Apply security patch",
      "vendor": "Microsoft",
      "scan_date": "2024-03-15"
    }
  ],
  "metadata": {
    "source": "backup_restore",
    "importDate": "2024-03-15T14:30:00Z"
  }
}
```

#### Response

```json
{
  "success": true,
  "message": "Vulnerabilities imported successfully",
  "count": 1,
  "imported": 1,
  "skipped": 0,
  "duplicates": 0
}
```

---

### Import Tickets (JSON)

**POST** `/api/import/tickets`

JSON-based ticket import for backup restoration and bulk ticket creation.

#### Request

**Headers:**

- `Content-Type: application/json`

**Body:**

```json
{
  "tickets": [
    {
      "ticket_number": "INC0012345",
      "xt_number": "XT24-001",
      "title": "Network Maintenance",
      "description": "Scheduled maintenance window",
      "priority": "Medium",
      "status": "Open",
      "assignee": "John Doe",
      "devices": ["switch01", "router02"],
      "location": "Data Center A",
      "created_date": "2024-03-15T10:00:00Z"
    }
  ],
  "metadata": {
    "source": "servicenow_export",
    "importDate": "2024-03-15T14:30:00Z"
  }
}
```

#### Response

```json
{
  "success": true,
  "message": "Tickets imported successfully",
  "count": 1,
  "imported": 1,
  "skipped": 0,
  "errors": []
}
```

---

### Get Import History

**GET** `/api/imports`

Retrieve history of all imports with statistics and metadata.

#### Request

No parameters required.

#### Response

```json
{
  "imports": [
    {
      "import_id": "imp_20240315_143022_abc123",
      "filename": "tenable_scan_2024-03-15.csv",
      "import_date": "2024-03-15T14:30:22Z",
      "vendor": "Tenable",
      "scan_date": "2024-03-15",
      "total_rows": 5000,
      "imported_count": 4500,
      "vulnerability_count": 4500,
      "file_size": 2048576,
      "processing_time": 15000,
      "status": "completed"
    }
  ],
  "total": 25,
  "summary": {
    "totalImports": 25,
    "totalVulnerabilities": 112500,
    "lastImport": "2024-03-15T14:30:22Z"
  }
}
```

---

### Check Import Progress

**GET** `/api/import/progress/:sessionId`

Check the progress of an ongoing import operation.

#### Request

**Path Parameters:**

- `sessionId` (string, required) - Session ID from import response

#### Response

```json
{
  "sessionId": "import-1710515422123-abc123",
  "status": "processing",
  "progress": 75,
  "message": "Processing vulnerabilities",
  "currentStep": 2,
  "totalSteps": 3,
  "details": {
    "filename": "large_scan.csv",
    "processedRows": 37500,
    "totalRows": 50000,
    "estimatedTimeRemaining": 15000
  }
}
```

## File Size Limits

- Maximum file size: 100MB
- Recommended to use staging import for files > 10MB or > 10,000 rows

## Supported CSV Formats

The import system automatically detects and maps columns from various security scanner formats:

### Tenable/Nessus

- Required columns: `Plugin ID`, `Plugin Name`, `Severity`, `Host`, `Port`
- Optional: `CVE`, `CVSS`, `Solution`, `Synopsis`, `Description`

### Qualys

- Required columns: `QID`, `Title`, `Severity`, `IP`, `Port`
- Optional: `CVE ID`, `CVSS Score`, `Solution`, `Threat`, `Impact`

### Generic Format

- Required columns: `vulnerability_id`, `title`, `severity`, `host`
- Optional: `cve`, `cvss`, `port`, `remediation`, `description`

## Error Handling

All endpoints return consistent error responses:

```json
{
  "success": false,
  "error": "Error type",
  "details": "Detailed error message",
  "code": "ERROR_CODE"
}
```

Common error codes:

- `NO_FILE`: No file uploaded
- `INVALID_FORMAT`: File format not supported
- `PARSE_ERROR`: CSV parsing failed
- `DB_ERROR`: Database operation failed
- `VALIDATION_ERROR`: Data validation failed

## Performance Considerations

### Standard Import (`/api/vulnerabilities/import`)

- Best for: Small to medium files (< 10,000 rows)
- Processing: Row-by-row with immediate deduplication
- Memory usage: Moderate
- Speed: ~500-1000 rows/second

### Staging Import (`/api/vulnerabilities/import-staging`)

- Best for: Large files (> 10,000 rows)
- Processing: Batch processing via staging table
- Memory usage: Optimized for large datasets
- Speed: ~1000-2000 rows/second

## WebSocket Progress Updates

For real-time progress tracking, connect to the WebSocket endpoint:

```javascript
const ws = new WebSocket('ws://localhost:8989/ws');

ws.on('message', (data) => {
  const update = JSON.parse(data);
  if (update.type === 'import-progress') {
    console.log(`Import ${update.sessionId}: ${update.progress}%`);
  }
});
```

Progress updates include:

- Current progress percentage
- Processing step details
- Estimated time remaining
- Row processing statistics

## Rate Limiting

Import endpoints are subject to rate limiting:

- 10 imports per hour per IP address
- Maximum 3 concurrent imports

## Security

- All file uploads are validated for type and size
- File paths are validated using `PathValidator` to prevent directory traversal
- Uploaded files are automatically deleted after processing
- Input data is sanitized before database insertion
- CSV parsing uses safe parsing options to prevent injection attacks

# Middleware

This section contains API documentation for Middleware.

## Source: app/middleware/**/*.js

## Classes

<table>
  <thead>
    <tr>
      <th>Global</th><th>Description</th>
    </tr>
  </thead>
  <tbody>
<tr>
    <td><a href="#PathValidator">PathValidator</a></td>
    <td><p>PathValidator - Security utility for path validation
Prevents path traversal attacks and ensures safe file operations</p>
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
    <td><a href="#crypto">crypto</a></td>
    <td><p>Logging Middleware for HexTrackr</p>
<p>Provides structured logging with request tracking, performance monitoring,
and environment-appropriate log levels.</p>
</td>
    </tr>
<tr>
    <td><a href="#cors">cors</a></td>
    <td><p>HexTrackr Security Middleware
Centralized security middleware for the monolithic Express.js server</p>
<p>This module extracts all security-related middleware from server.js including:</p>
<ul>
<li>CORS configuration and setup</li>
<li>Security headers (X-Content-Type-Options, X-Frame-Options, X-XSS-Protection)</li>
<li>Rate limiting configuration for DoS protection</li>
<li>PathValidator class for secure file operations</li>
<li>Request sanitization and validation middleware</li>
</ul>
</td>
    </tr>
<tr>
    <td><a href="#multer">multer</a></td>
    <td><p>HexTrackr Validation Middleware
Extracted from server.js for better modularity and reusability
Provides validation middleware functions for request parameters, bodies, and files</p>
</td>
    </tr>
<tr>
    <td><a href="#csvUpload">csvUpload</a></td>
    <td><p>Multer configuration for CSV file uploads
Limits file size and validates file types</p>
</td>
    </tr>
<tr>
    <td><a href="#jsonUpload">jsonUpload</a></td>
    <td><p>JSON file upload configuration for data restoration</p>
</td>
    </tr>
<tr>
    <td><a href="#validateTicketInput">validateTicketInput</a></td>
    <td><p>Ticket input validation middleware</p>
</td>
    </tr>
<tr>
    <td><a href="#validateVulnerabilityInput">validateVulnerabilityInput</a></td>
    <td><p>Vulnerability input validation middleware</p>
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
    <td><a href="#globalErrorHandler">globalErrorHandler(err, req, res, next)</a></td>
    <td><p>Global error handler middleware (4 parameters required for Express error handler)</p>
</td>
    </tr>
<tr>
    <td><a href="#notFoundHandler">notFoundHandler(req, res)</a></td>
    <td><p>404 Not Found handler for unmatched routes</p>
</td>
    </tr>
<tr>
    <td><a href="#formatDatabaseError">formatDatabaseError(err)</a> ⇒ <code>string</code></td>
    <td><p>Database error formatter</p>
</td>
    </tr>
<tr>
    <td><a href="#formatValidationError">formatValidationError(err)</a> ⇒ <code>Object</code> | <code>string</code></td>
    <td><p>Validation error formatter</p>
</td>
    </tr>
<tr>
    <td><a href="#asyncErrorHandler">asyncErrorHandler(fn)</a> ⇒ <code>function</code></td>
    <td><p>Async wrapper to catch async route handler errors</p>
</td>
    </tr>
<tr>
    <td><a href="#handleDatabaseError">handleDatabaseError(err, res, operation, additionalContext)</a></td>
    <td><p>Database operation error handler
Provides consistent error handling for database operations</p>
</td>
    </tr>
<tr>
    <td><a href="#handleFileError">handleFileError(err, res, operation)</a></td>
    <td><p>File operation error handler
Provides consistent error handling for file operations</p>
</td>
    </tr>
<tr>
    <td><a href="#handleCSVError">handleCSVError(err, res)</a></td>
    <td><p>CSV parsing error handler</p>
</td>
    </tr>
<tr>
    <td><a href="#handleValidationError">handleValidationError(message, res, details)</a></td>
    <td><p>Request validation error handler</p>
</td>
    </tr>
<tr>
    <td><a href="#requestLoggingMiddleware">requestLoggingMiddleware()</a></td>
    <td><p>Request logging middleware
Logs incoming requests with unique ID and response times</p>
</td>
    </tr>
<tr>
    <td><a href="#errorLoggingMiddleware">errorLoggingMiddleware()</a></td>
    <td><p>Error logging middleware
Logs uncaught errors with request context</p>
</td>
    </tr>
<tr>
    <td><a href="#logApiResponse">logApiResponse()</a></td>
    <td><p>API response logging wrapper
Standardizes API response logging</p>
</td>
    </tr>
<tr>
    <td><a href="#logServerStartup">logServerStartup()</a></td>
    <td><p>Server startup logging</p>
</td>
    </tr>
<tr>
    <td><a href="#logServerReady">logServerReady()</a></td>
    <td><p>Server ready logging</p>
</td>
    </tr>
<tr>
    <td><a href="#createCorsMiddleware">createCorsMiddleware()</a> ⇒ <code>function</code></td>
    <td><p>CORS Middleware Configuration
Configures Cross-Origin Resource Sharing to allow frontend access</p>
</td>
    </tr>
<tr>
    <td><a href="#createRateLimitMiddleware">createRateLimitMiddleware()</a> ⇒ <code>function</code></td>
    <td><p>Rate Limiting Middleware
DoS protection by limiting requests per IP address within a time window</p>
</td>
    </tr>
<tr>
    <td><a href="#securityHeadersMiddleware">securityHeadersMiddleware(req, res, next)</a></td>
    <td><p>Security Headers Middleware
Adds essential security headers to all responses</p>
</td>
    </tr>
<tr>
    <td><a href="#requestSanitizationMiddleware">requestSanitizationMiddleware(req, res, next)</a></td>
    <td><p>Request Sanitization Middleware
Basic sanitization and validation for incoming requests</p>
</td>
    </tr>
<tr>
    <td><a href="#apiSecurityMiddleware">apiSecurityMiddleware(req, res, next)</a></td>
    <td><p>API Security Middleware
Additional security measures specifically for API endpoints</p>
</td>
    </tr>
<tr>
    <td><a href="#securityErrorHandler">securityErrorHandler(err, req, res, next)</a></td>
    <td><p>Error Handling Middleware for Security
Handles security-related errors without exposing sensitive information</p>
</td>
    </tr>
<tr>
    <td><a href="#inputValidationMiddleware">inputValidationMiddleware(req, res, next)</a></td>
    <td><p>Input Validation Middleware
Validates common input parameters to prevent injection attacks</p>
</td>
    </tr>
<tr>
    <td><a href="#createValidationMiddleware">createValidationMiddleware(validatorFn, sourceProperty)</a> ⇒ <code>function</code></td>
    <td><p>Generic validation middleware factory</p>
</td>
    </tr>
<tr>
    <td><a href="#validateFileUpload">validateFileUpload()</a></td>
    <td><p>File upload validation middleware
Checks if file was uploaded and validates basic properties</p>
</td>
    </tr>
<tr>
    <td><a href="#validateCSVImportData">validateCSVImportData()</a></td>
    <td><p>CSV import data validation middleware</p>
</td>
    </tr>
<tr>
    <td><a href="#validatePaginationParams">validatePaginationParams()</a></td>
    <td><p>Pagination parameters validation middleware</p>
</td>
    </tr>
<tr>
    <td><a href="#validateDateRangeParams">validateDateRangeParams()</a></td>
    <td><p>Date range parameters validation middleware</p>
</td>
    </tr>
<tr>
    <td><a href="#validateNumericId">validateNumericId()</a></td>
    <td><p>Numeric ID parameter validation middleware</p>
</td>
    </tr>
<tr>
    <td><a href="#validateImportType">validateImportType()</a></td>
    <td><p>Import type validation middleware</p>
</td>
    </tr>
<tr>
    <td><a href="#validateVendorParam">validateVendorParam()</a></td>
    <td><p>Vendor parameter validation middleware</p>
</td>
    </tr>
<tr>
    <td><a href="#validateSearchQuery">validateSearchQuery()</a></td>
    <td><p>Search query validation middleware</p>
</td>
    </tr>
<tr>
    <td><a href="#validateFilterParams">validateFilterParams()</a></td>
    <td><p>Filter parameters validation middleware</p>
</td>
    </tr>
</tbody>
</table>

<a name="PathValidator"></a>

## PathValidator

PathValidator - Security utility for path validation
Prevents path traversal attacks and ensures safe file operations

**Kind**: global class  

- [PathValidator](#PathValidator)
  - [.validatePath(filePath)](#PathValidator.validatePath) ⇒ <code>string</code>
  - [.safeReadFileSync(filePath, options)](#PathValidator.safeReadFileSync) ⇒ <code>string</code> \| <code>Buffer</code>
  - [.safeWriteFileSync(filePath, data, options)](#PathValidator.safeWriteFileSync)
  - [.safeReaddirSync(dirPath, options)](#PathValidator.safeReaddirSync) ⇒ <code>Array</code>
  - [.safeStatSync(filePath)](#PathValidator.safeStatSync) ⇒ <code>fs.Stats</code>
  - [.safeExistsSync(filePath)](#PathValidator.safeExistsSync) ⇒ <code>boolean</code>
  - [.safeUnlinkSync(filePath)](#PathValidator.safeUnlinkSync)

* * *

<a name="PathValidator.validatePath"></a>

### PathValidator.validatePath(filePath) ⇒ <code>string</code>

Validates and normalizes file paths to prevent path traversal

**Kind**: static method of [<code>PathValidator</code>](#PathValidator)  
**Returns**: <code>string</code> - - The validated and normalized path  
**Throws**:

- <code>Error</code> - If path is invalid or contains traversal attempts

| Param | Type | Description |
| --- | --- | --- |
| filePath | <code>string</code> | The file path to validate |

* * *

<a name="PathValidator.safeReadFileSync"></a>

### PathValidator.safeReadFileSync(filePath, options) ⇒ <code>string</code> \| <code>Buffer</code>

Safely reads a file with path validation

**Kind**: static method of [<code>PathValidator</code>](#PathValidator)  
**Returns**: <code>string</code> \| <code>Buffer</code> - - File contents  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| filePath | <code>string</code> |  | The file path to read |
| options | <code>string</code> \| <code>object</code> | <code>&quot;utf8&quot;</code> | Encoding or options object |

* * *

<a name="PathValidator.safeWriteFileSync"></a>

### PathValidator.safeWriteFileSync(filePath, data, options)

Safely writes a file with path validation

**Kind**: static method of [<code>PathValidator</code>](#PathValidator)  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| filePath | <code>string</code> |  | The file path to write |
| data | <code>string</code> \| <code>Buffer</code> |  | Data to write |
| options | <code>string</code> \| <code>object</code> | <code>&quot;utf8&quot;</code> | Encoding or options object |

* * *

<a name="PathValidator.safeReaddirSync"></a>

### PathValidator.safeReaddirSync(dirPath, options) ⇒ <code>Array</code>

Safely reads a directory with path validation

**Kind**: static method of [<code>PathValidator</code>](#PathValidator)  
**Returns**: <code>Array</code> - - Directory contents  

| Param | Type | Description |
| --- | --- | --- |
| dirPath | <code>string</code> | The directory path to read |
| options | <code>object</code> | Options object |

* * *

<a name="PathValidator.safeStatSync"></a>

### PathValidator.safeStatSync(filePath) ⇒ <code>fs.Stats</code>

Safely gets file stats with path validation

**Kind**: static method of [<code>PathValidator</code>](#PathValidator)  
**Returns**: <code>fs.Stats</code> - - File statistics  

| Param | Type | Description |
| --- | --- | --- |
| filePath | <code>string</code> | The file path to stat |

* * *

<a name="PathValidator.safeExistsSync"></a>

### PathValidator.safeExistsSync(filePath) ⇒ <code>boolean</code>

Safely checks if file exists with path validation

**Kind**: static method of [<code>PathValidator</code>](#PathValidator)  
**Returns**: <code>boolean</code> - - True if file exists, false otherwise  

| Param | Type | Description |
| --- | --- | --- |
| filePath | <code>string</code> | The file path to check |

* * *

<a name="PathValidator.safeUnlinkSync"></a>

### PathValidator.safeUnlinkSync(filePath)

Safely deletes a file with path validation

**Kind**: static method of [<code>PathValidator</code>](#PathValidator)  

| Param | Type | Description |
| --- | --- | --- |
| filePath | <code>string</code> | The file path to delete |

* * *

<a name="crypto"></a>

## crypto

Logging Middleware for HexTrackr

Provides structured logging with request tracking, performance monitoring,
and environment-appropriate log levels.

**Kind**: global constant  

* * *

<a name="cors"></a>

## cors

HexTrackr Security Middleware
Centralized security middleware for the monolithic Express.js server

This module extracts all security-related middleware from server.js including:

- CORS configuration and setup
- Security headers (X-Content-Type-Options, X-Frame-Options, X-XSS-Protection)
- Rate limiting configuration for DoS protection
- PathValidator class for secure file operations
- Request sanitization and validation middleware

**Kind**: global constant  
**Version**: 1.0.0  
**Author**: HexTrackr Development Team  

* * *

<a name="multer"></a>

## multer

HexTrackr Validation Middleware
Extracted from server.js for better modularity and reusability
Provides validation middleware functions for request parameters, bodies, and files

**Kind**: global constant  

* * *

<a name="csvUpload"></a>

## csvUpload

Multer configuration for CSV file uploads
Limits file size and validates file types

**Kind**: global constant  

* * *

<a name="jsonUpload"></a>

## jsonUpload

JSON file upload configuration for data restoration

**Kind**: global constant  

* * *

<a name="validateTicketInput"></a>

## validateTicketInput

Ticket input validation middleware

**Kind**: global constant  

* * *

<a name="validateVulnerabilityInput"></a>

## validateVulnerabilityInput

Vulnerability input validation middleware

**Kind**: global constant  

* * *

<a name="globalErrorHandler"></a>

## globalErrorHandler(err, req, res, next)

Global error handler middleware (4 parameters required for Express error handler)

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| err | <code>Error</code> | The error object |
| req | <code>Object</code> | Express request object |
| res | <code>Object</code> | Express response object |
| next | <code>function</code> | Express next middleware function |

* * *

<a name="notFoundHandler"></a>

## notFoundHandler(req, res)

404 Not Found handler for unmatched routes

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| req | <code>Object</code> | Express request object |
| res | <code>Object</code> | Express response object |

* * *

<a name="formatDatabaseError"></a>

## formatDatabaseError(err) ⇒ <code>string</code>

Database error formatter

**Kind**: global function  
**Returns**: <code>string</code> - Formatted error message  

| Param | Type | Description |
| --- | --- | --- |
| err | <code>Error</code> | Database error object |

* * *

<a name="formatValidationError"></a>

## formatValidationError(err) ⇒ <code>Object</code> \| <code>string</code>

Validation error formatter

**Kind**: global function  
**Returns**: <code>Object</code> \| <code>string</code> - Formatted validation errors  

| Param | Type | Description |
| --- | --- | --- |
| err | <code>Error</code> | Validation error object |

* * *

<a name="asyncErrorHandler"></a>

## asyncErrorHandler(fn) ⇒ <code>function</code>

Async wrapper to catch async route handler errors

**Kind**: global function  
**Returns**: <code>function</code> - Wrapped function that catches async errors  

| Param | Type | Description |
| --- | --- | --- |
| fn | <code>function</code> | Async route handler function |

* * *

<a name="handleDatabaseError"></a>

## handleDatabaseError(err, res, operation, additionalContext)

Database operation error handler
Provides consistent error handling for database operations

**Kind**: global function  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| err | <code>Error</code> |  | Database error |
| res | <code>Object</code> |  | Express response object |
| operation | <code>string</code> | <code>&quot;Database operation&quot;</code> | Description of the failed operation |
| additionalContext | <code>Object</code> |  | Additional context for logging |

* * *

<a name="handleFileError"></a>

## handleFileError(err, res, operation)

File operation error handler
Provides consistent error handling for file operations

**Kind**: global function  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| err | <code>Error</code> |  | File operation error |
| res | <code>Object</code> |  | Express response object |
| operation | <code>string</code> | <code>&quot;File operation&quot;</code> | Description of the failed operation |

* * *

<a name="handleCSVError"></a>

## handleCSVError(err, res)

CSV parsing error handler

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| err | <code>Error</code> | CSV parsing error |
| res | <code>Object</code> | Express response object |

* * *

<a name="handleValidationError"></a>

## handleValidationError(message, res, details)

Request validation error handler

**Kind**: global function  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| message | <code>string</code> |  | Validation error message |
| res | <code>Object</code> |  | Express response object |
| details | <code>Object</code> | <code></code> | Additional validation details |

* * *

<a name="requestLoggingMiddleware"></a>

## requestLoggingMiddleware()

Request logging middleware
Logs incoming requests with unique ID and response times

**Kind**: global function  

* * *

<a name="errorLoggingMiddleware"></a>

## errorLoggingMiddleware()

Error logging middleware
Logs uncaught errors with request context

**Kind**: global function  

* * *

<a name="logApiResponse"></a>

## logApiResponse()

API response logging wrapper
Standardizes API response logging

**Kind**: global function  

* * *

<a name="logServerStartup"></a>

## logServerStartup()

Server startup logging

**Kind**: global function  

* * *

<a name="logServerReady"></a>

## logServerReady()

Server ready logging

**Kind**: global function  

* * *

<a name="createCorsMiddleware"></a>

## createCorsMiddleware() ⇒ <code>function</code>

CORS Middleware Configuration
Configures Cross-Origin Resource Sharing to allow frontend access

**Kind**: global function  
**Returns**: <code>function</code> - - CORS middleware function  

* * *

<a name="createRateLimitMiddleware"></a>

## createRateLimitMiddleware() ⇒ <code>function</code>

Rate Limiting Middleware
DoS protection by limiting requests per IP address within a time window

**Kind**: global function  
**Returns**: <code>function</code> - - Rate limiting middleware function  

* * *

<a name="securityHeadersMiddleware"></a>

## securityHeadersMiddleware(req, res, next)

Security Headers Middleware
Adds essential security headers to all responses

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| req | <code>object</code> | Express request object |
| res | <code>object</code> | Express response object |
| next | <code>function</code> | Express next function |

* * *

<a name="requestSanitizationMiddleware"></a>

## requestSanitizationMiddleware(req, res, next)

Request Sanitization Middleware
Basic sanitization and validation for incoming requests

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| req | <code>object</code> | Express request object |
| res | <code>object</code> | Express response object |
| next | <code>function</code> | Express next function |

* * *

<a name="apiSecurityMiddleware"></a>

## apiSecurityMiddleware(req, res, next)

API Security Middleware
Additional security measures specifically for API endpoints

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| req | <code>object</code> | Express request object |
| res | <code>object</code> | Express response object |
| next | <code>function</code> | Express next function |

* * *

<a name="securityErrorHandler"></a>

## securityErrorHandler(err, req, res, next)

Error Handling Middleware for Security
Handles security-related errors without exposing sensitive information

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| err | <code>Error</code> | Error object |
| req | <code>object</code> | Express request object |
| res | <code>object</code> | Express response object |
| next | <code>function</code> | Express next function |

* * *

<a name="inputValidationMiddleware"></a>

## inputValidationMiddleware(req, res, next)

Input Validation Middleware
Validates common input parameters to prevent injection attacks

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| req | <code>object</code> | Express request object |
| res | <code>object</code> | Express response object |
| next | <code>function</code> | Express next function |

* * *

<a name="createValidationMiddleware"></a>

## createValidationMiddleware(validatorFn, sourceProperty) ⇒ <code>function</code>

Generic validation middleware factory

**Kind**: global function  
**Returns**: <code>function</code> - Express middleware function  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| validatorFn | <code>function</code> |  | Validation function that returns {success, errors, warnings} |
| sourceProperty | <code>string</code> | <code>&quot;body&quot;</code> | Request property to validate ("body", "query", "params") |

* * *

<a name="validateFileUpload"></a>

## validateFileUpload()

File upload validation middleware
Checks if file was uploaded and validates basic properties

**Kind**: global function  

* * *

<a name="validateCSVImportData"></a>

## validateCSVImportData()

CSV import data validation middleware

**Kind**: global function  

* * *

<a name="validatePaginationParams"></a>

## validatePaginationParams()

Pagination parameters validation middleware

**Kind**: global function  

* * *

<a name="validateDateRangeParams"></a>

## validateDateRangeParams()

Date range parameters validation middleware

**Kind**: global function  

* * *

<a name="validateNumericId"></a>

## validateNumericId()

Numeric ID parameter validation middleware

**Kind**: global function  

* * *

<a name="validateImportType"></a>

## validateImportType()

Import type validation middleware

**Kind**: global function  

* * *

<a name="validateVendorParam"></a>

## validateVendorParam()

Vendor parameter validation middleware

**Kind**: global function  

* * *

<a name="validateSearchQuery"></a>

## validateSearchQuery()

Search query validation middleware

**Kind**: global function  

* * *

<a name="validateFilterParams"></a>

## validateFilterParams()

Filter parameters validation middleware

**Kind**: global function  

* * *

---

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

- [DocsService](#DocsService)
  - [.computeStats()](#DocsService+computeStats)
  - [.computeApiEndpoints()](#DocsService+computeApiEndpoints)
  - [.computeJsFunctionCount()](#DocsService+computeJsFunctionCount)
  - [.detectFrameworks()](#DocsService+detectFrameworks)
  - [.findDocsSectionForFilename()](#DocsService+findDocsSectionForFilename)

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

- Import progress tracking with standardized phases
- Export progress tracking for various data types
- Batch operation progress management
- WebSocket integration for real-time updates
- Session lifecycle management
- Error handling and recovery

Usage:
const progressService = new ProgressService(io);
const sessionId = progressService.startImport("vulnerabilities.csv", 10000);
progressService.updateImportProgress(sessionId, 500, "processing");
progressService.completeImport(sessionId, { imported: 9500, errors: 500 });

**Kind**: global class  

- [ProgressService](#ProgressService)
  - [.startImport(filename, totalRows, vendor, scanDate, customSessionId)](#ProgressService+startImport) ⇒ <code>string</code>
  - [.updateImportProgress(sessionId, processed, status, additionalData)](#ProgressService+updateImportProgress) ⇒ <code>boolean</code>
  - [.updateImportParsingProgress(sessionId, rowCount, status)](#ProgressService+updateImportParsingProgress) ⇒ <code>boolean</code>
  - [.updateImportStagingProgress(sessionId, staged, total, status)](#ProgressService+updateImportStagingProgress) ⇒ <code>boolean</code>
  - [.updateImportBatchProgress(sessionId, currentBatch, totalBatches, processedRows, status)](#ProgressService+updateImportBatchProgress) ⇒ <code>boolean</code>
  - [.completeImport(sessionId, results)](#ProgressService+completeImport) ⇒ <code>boolean</code>
  - [.startExport(type, totalItems, format, customSessionId)](#ProgressService+startExport) ⇒ <code>string</code>
  - [.updateExportProgress(sessionId, processed, phase, status)](#ProgressService+updateExportProgress) ⇒ <code>boolean</code>
  - [.completeExport(sessionId, results)](#ProgressService+completeExport) ⇒ <code>boolean</code>
  - [.getProgress(sessionId)](#ProgressService+getProgress) ⇒ <code>Object</code> \| <code>null</code>
  - [.handleError(sessionId, errorMessage, errorData)](#ProgressService+handleError) ⇒ <code>boolean</code>
  - [.getActiveSessions()](#ProgressService+getActiveSessions) ⇒ <code>Array</code>
  - [.cleanupSession(sessionId)](#ProgressService+cleanupSession) ⇒ <code>boolean</code>
  - [.broadcastEvent(eventName, data)](#ProgressService+broadcastEvent)

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

- CRUD operations for tickets table
- Device management (JSON field handling)
- CSV import processing with mapping
- Migration operations
- Export functionality
- Ticket number generation (XT numbers)

T053 INTEGRATION NOTES:
This service requires database initialization before use.
In server.js, after database connection, call:
ticketController.initialize(db);

**Kind**: global class  

- [TicketService](#TicketService)
  - [.initialize(database)](#TicketService+initialize)
  - [.getAllTickets()](#TicketService+getAllTickets)
  - [.createTicket()](#TicketService+createTicket)
  - [.updateTicket()](#TicketService+updateTicket)
  - [.deleteTicket()](#TicketService+deleteTicket)
  - [.migrateTickets()](#TicketService+migrateTickets)
  - [.importTickets()](#TicketService+importTickets)
  - [._mapTicketRow()](#TicketService+_mapTicketRow)
  - [.exportTickets()](#TicketService+exportTickets)
  - [.generateNextXTNumber()](#TicketService+generateNextXTNumber)
  - [.updateTicketDevices()](#TicketService+updateTicketDevices)
  - [.getTicketById()](#TicketService+getTicketById)

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

- Current vulnerability statistics with VPR totals and distribution
- Recent trends comparison for dashboard cards (current vs previous day)
- Historical trending data with date range filtering
- Daily totals calculation and rollup operations
- Enhanced lifecycle state tracking (active, resolved, reopened)
- VPR score aggregations and severity-based metrics

Separated from vulnerabilityService due to complexity and distinct concerns:

- vulnerabilityService: CRUD, import, data management
- vulnerabilityStatsService: Analytics, trends, statistics, rollups

T053 INTEGRATION NOTES:
This service requires database initialization and works with vulnerability_daily_totals table.
Complex statistical calculations are isolated here for maintainability.

**Kind**: global class  

- [VulnerabilityStatsService](#VulnerabilityStatsService)
  - [.initialize(database)](#VulnerabilityStatsService+initialize)
  - [.getStats()](#VulnerabilityStatsService+getStats)
  - [.getRecentTrends()](#VulnerabilityStatsService+getRecentTrends)
  - [.getTrends()](#VulnerabilityStatsService+getTrends)
  - [.calculateAndStoreDailyTotalsEnhanced()](#VulnerabilityStatsService+calculateAndStoreDailyTotalsEnhanced)
  - [.getVulnerabilityDistribution()](#VulnerabilityStatsService+getVulnerabilityDistribution)
  - [.getTopVulnerableHosts()](#VulnerabilityStatsService+getTopVulnerableHosts)
  - [.getVprScoreDistribution()](#VulnerabilityStatsService+getVprScoreDistribution)
  - [.getVulnerabilityAging()](#VulnerabilityStatsService+getVulnerabilityAging)
  - [.getDailyTotalsRange()](#VulnerabilityStatsService+getDailyTotalsRange)

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

- Database export to JSON format
- Backup file restoration from ZIP/JSON
- Data clearing operations
- Backup statistics and file management

**Kind**: global constant  

* * *

<a name="sqlite3"></a>

## sqlite3

DatabaseService - Extracted from app/public/server.js lines 12, 1932-3280+

This service encapsulates all SQLite database operations from the monolithic server.js,
providing connection pooling patterns, transaction management, and common query methods.

Key extractions from server.js:

- Line 12: const sqlite3 = require("sqlite3").verbose();
- Line 1933: const dbPath = path.join(__dirname, "data", "hextrackr.db");
- Line 1934: const db = new sqlite3.Database(dbPath);
- Lines 2785-3280: Database initialization, schema creation, and operations
- Transaction patterns from lines 782-783, 1033-1034, etc.
- Error handling patterns throughout server.js database operations

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

- Uses DatabaseService for all database operations
- Uses PathValidator for secure file operations
- Uses helpers for vulnerability mapping and deduplication
- Requires existing database schema (staging tables, current tables)
- Compatible with existing ProgressTracker WebSocket implementation
- Maintains all existing CSV parsing and mapping logic

**Kind**: global constant  

* * *

<a name="Papa"></a>

## Papa

VulnerabilityService - Core vulnerability business logic and database operations
Extracted from server.js lines: 252-341, 343-558, 559-742, 768-1295, 1306-1703, 2159-2283, 2337-2514, 2517-2531, 3304-3317, 3501-3565

This service handles the most complex business logic in HexTrackr:

- Multi-vendor vulnerability data processing and normalization
- Advanced deduplication using enhanced unique keys with confidence scoring
- Lifecycle management (active, grace_period, resolved, reopened states)
- CSV import processing with staging table support for performance
- VPR and CVSS score processing and validation
- Host/IP normalization and asset correlation
- Daily totals calculation and rollup operations
- Large-scale data operations with performance instrumentation

Key Dependencies (utility functions remain in server.js):

- mapVulnerabilityRow: Maps CSV rows to vulnerability objects
- generateEnhancedUniqueKey: Multi-tier deduplication key generation
- extractScanDateFromFilename: Date extraction from filenames
- normalizeHostname, normalizeIPAddress: Network asset normalization
- PathValidator: Secure file operations
- Papa: CSV parsing

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

# Tickets API

The Tickets API provides CRUD operations for managing tickets. For general API information, see the [API Overview](../api-reference/overview.md).

**Data Model**: For detailed information on the `tickets` table schema, see the [Data Model documentation](../architecture/data-model.md).

---

## Endpoints

### GET /api/tickets

- **Description**: Retrieves a list of all tickets, ordered by creation date in descending order.
- **Query Parameters**: None
- **Response**: `200 OK`
  - **Note**: Devices are persisted as a semicolon-delimited string (preserving boot order). Attachments remain a JSON string that the frontend parses into objects.

    ```json
    [
      {
        "id": "TICK-123",
        "xt_number": "0103",
        "date_submitted": "2025-08-20",
        "date_due": "2025-08-30",
        "hexagon_ticket": "HX-456",
        "service_now_ticket": "INC0000123",
        "location": "HQ-1",
        "devices": "Device 1;Device 2",
        "supervisor": "Jane Doe",
        "tech": "John Smith",
        "status": "Open",
        "notes": "Initial ticket creation.",
        "attachments": "[]",
        "created_at": "2025-08-20T12:00:00.000Z",
        "updated_at": "2025-08-20T12:00:00.000Z",
        "site": "HQ"
      }
    ]
    ```

### POST /api/tickets

- **Description**: Creates a new ticket. The UI sends camelCase keys; the API also accepts legacy snake_case fields for backwards compatibility.
- **Request Body**: `application/json`

    ```json
    {
      "id": "TICK-124",
      "xtNumber": "0104",
      "dateSubmitted": "2025-08-21",
      "dateDue": "2025-08-31",
      "hexagonTicket": "HX-457",
      "serviceNowTicket": "INC0000124",
      "location": "HQ-2",
      "devices": "Device 3;Device 4",
      "supervisor": "John Doe",
      "tech": "Jane Smith",
      "status": "Open",
      "notes": "This is a new ticket.",
      "attachments": [],
      "createdAt": "2025-08-21T10:00:00.000Z",
      "updatedAt": "2025-08-21T10:00:00.000Z",
      "site": "HQ"
    }
    ```

- **Device Formats**: `devices` may be a semicolon string or an array. Arrays are joined into an ordered semicolon string to preserve the boot/reboot sequence.

- **Response**: `200 OK`

    ```json
    {
      "success": true,
      "id": "TICK-124",
      "message": "Ticket saved successfully"
    }
    ```

### PUT /api/tickets/:id

- **Description**: Updates an existing ticket by its `id`.
- **URL Parameters**:
  - `id` (string, required): The ID of the ticket to update.
- **Request Body**: `application/json` (Same shape as `POST /api/tickets`)
- **Response**: `200 OK`

    ```json
    {
      "success": true,
      "id": "TICK-123",
      "message": "Ticket updated successfully"
    }
    ```

### DELETE /api/tickets/:id

- **Description**: Deletes a ticket by its `id`.
- **URL Parameters**:
  - `id` (string, required): The ID of the ticket to delete.
- **Response**: `200 OK`

    ```json
    {
      "success": true,
      "deleted": 1
    }
    ```

---

## Data Import Endpoints

### POST /api/import/tickets

- **Description**: Imports a batch of tickets from a JSON array. The tickets UI uses PapaParse to convert CSV files into this structure before calling the endpoint. Rows are upserted (`INSERT OR REPLACE`).
- **Request Body**: `application/json`

    ```json
    {
      "data": [
        {
          "id": "ticket_1",
          "xt_number": "0105",
          "date_submitted": "2025-08-20",
          "date_due": "2025-08-30",
          "hexagon_ticket": "HX-456",
          "service_now_ticket": "INC0000123",
          "location": "HQ-1",
          "devices": "Device 1;Device 2",
          "supervisor": "Jane",
          "tech": "John",
          "status": "Open",
          "notes": "Notes from import.",
          "attachments": "[]"
        }
      ]
    }
    ```

- **Response**: `200 OK`

    ```json
    {
      "success": true,
      "imported": 1,
      "total": 1
    }
    ```

- **Device Compatibility**: The importer accepts semicolon strings, comma-separated strings, or JSON arrays. Commas and arrays are normalized server-side to Semicolon strings.

### POST /api/tickets/migrate

- **Description**: Bulk import endpoint used by the CSV workflow. Supports `append`, `replace`, and `check` (default) modes and mirrors the structure used by the UI.
- **Request Body**: `application/json`

    ```json
    {
      "mode": "append",
      "tickets": [
        {
          "id": "legacy-1",
          "xtNumber": "0106",
          "dateSubmitted": "2025-08-01",
          "dateDue": "2025-08-05",
          "hexagonTicket": "PR-1",
          "serviceNowTicket": "INC-1",
          "site": "HQ",
          "location": "HQ-WEST",
          "devices": ["DEV-1", "DEV-2"],
          "supervisor": "Tech Lead",
          "status": "Open"
        }
      ]
    }
    ```

- **Response**: `200 OK`

    ```json
    {
      "success": true,
      "message": "Migration completed: 1 tickets migrated, 0 errors"
    }
    ```

- **Mode Behavior**:
  - `append`: keeps existing records and upserts incoming tickets.
  - `replace`: clears the `tickets` table before inserting new rows.
  - `check`: validates payload without clearing existing data and upserts rows.

---

## Reference Data Endpoints

### GET /api/sites

- **Description**: Retrieves a list of unique sites from the database.
- **Response**: `200 OK` - An array of site records.

### GET /api/locations

- **Description**: Retrieves a list of unique locations from the database.
- **Response**: `200 OK` - An array of location records.

---

## Error Responses

- **`400 Bad Request`**: The request body is missing or contains invalid data.

    ```json
    {
      "error": "No data provided"
    }
    ```

- **`500 Internal Server Error`**: An error occurred during a database operation.

    ```json
    {
      "error": "Failed to save ticket"
    }
    ```

# Utilities

This section contains API documentation for Utilities.

## Source: app/utils/**/*.js

## Classes

<table>
  <thead>
    <tr>
      <th>Global</th><th>Description</th>
    </tr>
  </thead>
  <tbody>
<tr>
    <td><a href="#ProgressTracker">ProgressTracker</a></td>
    <td><p>ProgressTracker - Manages real-time progress tracking for long-running operations</p>
<p>Features:</p>
<ul>
<li>Session-based progress tracking with unique IDs</li>
<li>WebSocket integration via Socket.io for real-time updates</li>
<li>Throttled progress events to prevent spam</li>
<li>Automatic cleanup of stale sessions</li>
<li>Error handling and session management</li>
</ul>
<p>Usage:
const progressTracker = new ProgressTracker(io);
const sessionId = progressTracker.createSession({ operation: &quot;import&quot; });
progressTracker.updateProgress(sessionId, 50, &quot;Processing data...&quot;);
progressTracker.completeSession(sessionId, &quot;Import completed&quot;);</p>
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
    <td><a href="#crypto">crypto</a></td>
    <td><p>HexTrackr Helper Functions
Standalone utility functions extracted from server.js for better modularity</p>
</td>
    </tr>
<tr>
    <td><a href="#fs">fs</a></td>
    <td><p>PathValidator - Security utility for path validation
Prevents directory traversal attacks and validates file paths</p>
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
    <td><a href="#normalizeHostname">normalizeHostname(hostname)</a> ⇒ <code>string</code></td>
    <td><p>Normalize hostname for consistent deduplication
Handles IP addresses vs domain names appropriately</p>
</td>
    </tr>
<tr>
    <td><a href="#normalizeVendor">normalizeVendor(vendor)</a> ⇒ <code>string</code></td>
    <td><p>Normalize vendor names for consistent categorization</p>
</td>
    </tr>
<tr>
    <td><a href="#normalizeIPAddress">normalizeIPAddress(ipAddress)</a> ⇒ <code>string</code> | <code>null</code></td>
    <td><p>Normalize IP address, handling multiple IPs and validation</p>
</td>
    </tr>
<tr>
    <td><a href="#isValidIPAddress">isValidIPAddress(ip)</a> ⇒ <code>boolean</code></td>
    <td><p>Validate if a string is a valid IP address</p>
</td>
    </tr>
<tr>
    <td><a href="#createDescriptionHash">createDescriptionHash(description)</a> ⇒ <code>string</code></td>
    <td><p>Create a stable hash from description text for deduplication</p>
</td>
    </tr>
<tr>
    <td><a href="#extractScanDateFromFilename">extractScanDateFromFilename(filename)</a> ⇒ <code>string</code> | <code>null</code></td>
    <td><p>Extract scan date from filename using various patterns</p>
</td>
    </tr>
<tr>
    <td><a href="#calculateDeduplicationConfidence">calculateDeduplicationConfidence(uniqueKey)</a> ⇒ <code>number</code></td>
    <td><p>Calculate confidence level for deduplication based on unique key type</p>
</td>
    </tr>
<tr>
    <td><a href="#getDeduplicationTier">getDeduplicationTier(uniqueKey)</a> ⇒ <code>number</code></td>
    <td><p>Get deduplication tier (1-5) based on unique key reliability</p>
</td>
    </tr>
<tr>
    <td><a href="#generateEnhancedUniqueKey">generateEnhancedUniqueKey(mapped)</a> ⇒ <code>string</code></td>
    <td><p>Generate enhanced multi-tier unique key for vulnerability deduplication</p>
</td>
    </tr>
<tr>
    <td><a href="#generateUniqueKey">generateUniqueKey(mapped)</a> ⇒ <code>string</code></td>
    <td><p>Legacy function maintained for backward compatibility during transition</p>
</td>
    </tr>
<tr>
    <td><a href="#mapVulnerabilityRow">mapVulnerabilityRow(row)</a> ⇒ <code>array</code></td>
    <td><p>Map CSV row data to vulnerability object structure</p>
</td>
    </tr>
<tr>
    <td><a href="#mapTicketRow">mapTicketRow(row, index)</a> ⇒ <code>object</code></td>
    <td><p>Map CSV row data to ticket object structure</p>
</td>
    </tr>
<tr>
    <td><a href="#findDocsSectionForFilename">findDocsSectionForFilename(filename)</a> ⇒ <code>string</code> | <code>null</code></td>
    <td><p>Find a documentation section path for a given filename by scanning the content folder</p>
</td>
    </tr>
</tbody>
</table>

<a name="ProgressTracker"></a>

## ProgressTracker

ProgressTracker - Manages real-time progress tracking for long-running operations

Features:

- Session-based progress tracking with unique IDs
- WebSocket integration via Socket.io for real-time updates
- Throttled progress events to prevent spam
- Automatic cleanup of stale sessions
- Error handling and session management

Usage:
const progressTracker = new ProgressTracker(io);
const sessionId = progressTracker.createSession({ operation: "import" });
progressTracker.updateProgress(sessionId, 50, "Processing data...");
progressTracker.completeSession(sessionId, "Import completed");

**Kind**: global class  

- [ProgressTracker](#ProgressTracker)
  - [.createSession(metadata)](#ProgressTracker+createSession) ⇒ <code>string</code>
  - [.createSessionWithId(sessionId, metadata)](#ProgressTracker+createSessionWithId) ⇒ <code>string</code>
  - [.updateProgress(sessionId, progress, message, additionalData)](#ProgressTracker+updateProgress) ⇒ <code>boolean</code>
  - [.completeSession(sessionId, message, finalData)](#ProgressTracker+completeSession) ⇒ <code>boolean</code>
  - [.errorSession(sessionId, errorMessage, errorData)](#ProgressTracker+errorSession) ⇒ <code>boolean</code>
  - [.getSession(sessionId)](#ProgressTracker+getSession) ⇒ <code>Object</code> \| <code>null</code>
  - [.cleanupStaleSessions()](#ProgressTracker+cleanupStaleSessions)

* * *

<a name="ProgressTracker+createSession"></a>

### progressTracker.createSession(metadata) ⇒ <code>string</code>

Create a new progress session with auto-generated UUID

**Kind**: instance method of [<code>ProgressTracker</code>](#ProgressTracker)  
**Returns**: <code>string</code> - sessionId - Unique session identifier  

| Param | Type | Description |
| --- | --- | --- |
| metadata | <code>Object</code> | Initial metadata for the session |

* * *

<a name="ProgressTracker+createSessionWithId"></a>

### progressTracker.createSessionWithId(sessionId, metadata) ⇒ <code>string</code>

Create a new progress session with specified ID

**Kind**: instance method of [<code>ProgressTracker</code>](#ProgressTracker)  
**Returns**: <code>string</code> - sessionId - The session identifier  

| Param | Type | Description |
| --- | --- | --- |
| sessionId | <code>string</code> | Unique session identifier |
| metadata | <code>Object</code> | Initial metadata for the session |

* * *

<a name="ProgressTracker+updateProgress"></a>

### progressTracker.updateProgress(sessionId, progress, message, additionalData) ⇒ <code>boolean</code>

Update progress for a session with throttled WebSocket events

**Kind**: instance method of [<code>ProgressTracker</code>](#ProgressTracker)  
**Returns**: <code>boolean</code> - Success status  

| Param | Type | Description |
| --- | --- | --- |
| sessionId | <code>string</code> | Session identifier |
| progress | <code>number</code> | Progress percentage (0-100) |
| message | <code>string</code> | Progress message |
| additionalData | <code>Object</code> | Additional metadata to include |

* * *

<a name="ProgressTracker+completeSession"></a>

### progressTracker.completeSession(sessionId, message, finalData) ⇒ <code>boolean</code>

Mark a session as completed and emit completion event

**Kind**: instance method of [<code>ProgressTracker</code>](#ProgressTracker)  
**Returns**: <code>boolean</code> - Success status  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| sessionId | <code>string</code> |  | Session identifier |
| message | <code>string</code> | <code>&quot;Operation completed&quot;</code> | Completion message |
| finalData | <code>Object</code> |  | Final metadata to include |

* * *

<a name="ProgressTracker+errorSession"></a>

### progressTracker.errorSession(sessionId, errorMessage, errorData) ⇒ <code>boolean</code>

Mark a session as errored and emit error event

**Kind**: instance method of [<code>ProgressTracker</code>](#ProgressTracker)  
**Returns**: <code>boolean</code> - Success status  

| Param | Type | Description |
| --- | --- | --- |
| sessionId | <code>string</code> | Session identifier |
| errorMessage | <code>string</code> | Error message |
| errorData | <code>Object</code> | Error details and metadata |

* * *

<a name="ProgressTracker+getSession"></a>

### progressTracker.getSession(sessionId) ⇒ <code>Object</code> \| <code>null</code>

Get session data by ID

**Kind**: instance method of [<code>ProgressTracker</code>](#ProgressTracker)  
**Returns**: <code>Object</code> \| <code>null</code> - Session object or null if not found  

| Param | Type | Description |
| --- | --- | --- |
| sessionId | <code>string</code> | Session identifier |

* * *

<a name="ProgressTracker+cleanupStaleSessions"></a>

### progressTracker.cleanupStaleSessions()

Clean up stale sessions that haven't been updated recently
Automatically called via setInterval in constructor

**Kind**: instance method of [<code>ProgressTracker</code>](#ProgressTracker)  

* * *

<a name="crypto"></a>

## crypto

HexTrackr Helper Functions
Standalone utility functions extracted from server.js for better modularity

**Kind**: global constant  

* * *

<a name="fs"></a>

## fs

PathValidator - Security utility for path validation
Prevents directory traversal attacks and validates file paths

**Kind**: global constant  

* * *

<a name="normalizeHostname"></a>

## normalizeHostname(hostname) ⇒ <code>string</code>

Normalize hostname for consistent deduplication
Handles IP addresses vs domain names appropriately

**Kind**: global function  
**Returns**: <code>string</code> - Normalized hostname  

| Param | Type | Description |
| --- | --- | --- |
| hostname | <code>string</code> | Raw hostname from CSV |

* * *

<a name="normalizeVendor"></a>

## normalizeVendor(vendor) ⇒ <code>string</code>

Normalize vendor names for consistent categorization

**Kind**: global function  
**Returns**: <code>string</code> - Normalized vendor name  

| Param | Type | Description |
| --- | --- | --- |
| vendor | <code>string</code> | Raw vendor name |

* * *

<a name="normalizeIPAddress"></a>

## normalizeIPAddress(ipAddress) ⇒ <code>string</code> \| <code>null</code>

Normalize IP address, handling multiple IPs and validation

**Kind**: global function  
**Returns**: <code>string</code> \| <code>null</code> - First valid IP address or null  

| Param | Type | Description |
| --- | --- | --- |
| ipAddress | <code>string</code> | Raw IP address string (may contain multiple IPs) |

* * *

<a name="isValidIPAddress"></a>

## isValidIPAddress(ip) ⇒ <code>boolean</code>

Validate if a string is a valid IP address

**Kind**: global function  
**Returns**: <code>boolean</code> - True if valid IP address  

| Param | Type | Description |
| --- | --- | --- |
| ip | <code>string</code> | IP address to validate |

* * *

<a name="createDescriptionHash"></a>

## createDescriptionHash(description) ⇒ <code>string</code>

Create a stable hash from description text for deduplication

**Kind**: global function  
**Returns**: <code>string</code> - Short hash string  

| Param | Type | Description |
| --- | --- | --- |
| description | <code>string</code> | Description text to hash |

* * *

<a name="extractScanDateFromFilename"></a>

## extractScanDateFromFilename(filename) ⇒ <code>string</code> \| <code>null</code>

Extract scan date from filename using various patterns

**Kind**: global function  
**Returns**: <code>string</code> \| <code>null</code> - Date in YYYY-MM-DD format or null if no pattern matches  

| Param | Type | Description |
| --- | --- | --- |
| filename | <code>string</code> | The CSV filename |

* * *

<a name="calculateDeduplicationConfidence"></a>

## calculateDeduplicationConfidence(uniqueKey) ⇒ <code>number</code>

Calculate confidence level for deduplication based on unique key type

**Kind**: global function  
**Returns**: <code>number</code> - Confidence percentage (0-100)  

| Param | Type | Description |
| --- | --- | --- |
| uniqueKey | <code>string</code> | The unique key to analyze |

* * *

<a name="getDeduplicationTier"></a>

## getDeduplicationTier(uniqueKey) ⇒ <code>number</code>

Get deduplication tier (1-5) based on unique key reliability

**Kind**: global function  
**Returns**: <code>number</code> - Tier number (1 = most stable, 5 = least stable)  

| Param | Type | Description |
| --- | --- | --- |
| uniqueKey | <code>string</code> | The unique key to analyze |

* * *

<a name="generateEnhancedUniqueKey"></a>

## generateEnhancedUniqueKey(mapped) ⇒ <code>string</code>

Generate enhanced multi-tier unique key for vulnerability deduplication

**Kind**: global function  
**Returns**: <code>string</code> - Enhanced unique key with tier prefix  

| Param | Type | Description |
| --- | --- | --- |
| mapped | <code>object</code> | Mapped vulnerability data object |

* * *

<a name="generateUniqueKey"></a>

## generateUniqueKey(mapped) ⇒ <code>string</code>

Legacy function maintained for backward compatibility during transition

**Kind**: global function  
**Returns**: <code>string</code> - Legacy unique key format  

| Param | Type | Description |
| --- | --- | --- |
| mapped | <code>object</code> | Mapped vulnerability data object |

* * *

<a name="mapVulnerabilityRow"></a>

## mapVulnerabilityRow(row) ⇒ <code>array</code>

Map CSV row data to vulnerability object structure

**Kind**: global function  
**Returns**: <code>array</code> - Array of mapped vulnerability objects (may contain multiple CVEs)  

| Param | Type | Description |
| --- | --- | --- |
| row | <code>object</code> | Raw CSV row data |

* * *

<a name="mapTicketRow"></a>

## mapTicketRow(row, index) ⇒ <code>object</code>

Map CSV row data to ticket object structure

**Kind**: global function  
**Returns**: <code>object</code> - Mapped ticket object  

| Param | Type | Description |
| --- | --- | --- |
| row | <code>object</code> | Raw CSV row data |
| index | <code>number</code> | Row index for generating fallback IDs |

* * *

<a name="findDocsSectionForFilename"></a>

## findDocsSectionForFilename(filename) ⇒ <code>string</code> \| <code>null</code>

Find a documentation section path for a given filename by scanning the content folder

**Kind**: global function  
**Returns**: <code>string</code> \| <code>null</code> - Relative section path or null if not found  

| Param | Type | Description |
| --- | --- | --- |
| filename | <code>string</code> | The filename to search for |

* * *

---

## Source: app/public/scripts/utils/**/*.js

## Modules

<table>
  <thead>
    <tr>
      <th>Module</th><th>Description</th>
    </tr>
  </thead>
  <tbody>
<tr>
    <td><a href="#module_AccessibilityAnnouncer">AccessibilityAnnouncer</a></td>
    <td><p>Accessibility Announcer Utility - T044
Provides ARIA live region management for screen reader announcements
Follows WCAG 2.1 guidelines for dynamic content announcement</p>
</td>
    </tr>
</tbody>
</table>

## Classes

<table>
  <thead>
    <tr>
      <th>Global</th><th>Description</th>
    </tr>
  </thead>
  <tbody>
<tr>
    <td><a href="#ChartThemeAdapter">ChartThemeAdapter</a></td>
    <td></td>
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
    <td><a href="#DARK_THEME_COLORS">DARK_THEME_COLORS</a></td>
    <td><p>HexTrackr Dark Theme Color Definitions
Extracted from dark-theme.css for testing</p>
</td>
    </tr>
<tr>
    <td><a href="#CRITICAL_COMBINATIONS">CRITICAL_COMBINATIONS</a></td>
    <td><p>Critical text/background combinations to test
These represent the most important UI elements for accessibility</p>
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
    <td><a href="#safeSetInnerHTML">safeSetInnerHTML(element, htmlContent)</a></td>
    <td><p>Safely set innerHTML with DOMPurify sanitization</p>
</td>
    </tr>
<tr>
    <td><a href="#escapeHtml">escapeHtml(text)</a> ⇒ <code>string</code></td>
    <td><p>Escape HTML entities to prevent XSS attacks</p>
</td>
    </tr>
<tr>
    <td><a href="#safeCreateElement">safeCreateElement(tagName, content, attributes)</a> ⇒ <code>HTMLElement</code></td>
    <td><p>Safely create element with sanitized content</p>
</td>
    </tr>
<tr>
    <td><a href="#testDarkThemeCompliance">testDarkThemeCompliance(verbose)</a> ⇒ <code>Object</code></td>
    <td><p>Run WCAG AA compliance test on all critical color combinations</p>
</td>
    </tr>
<tr>
    <td><a href="#generateRecommendations">generateRecommendations(criticalFailures, nonCriticalFailures)</a> ⇒ <code>Array</code></td>
    <td><p>Generate actionable recommendations for fixing accessibility issues</p>
</td>
    </tr>
<tr>
    <td><a href="#testColorCombination">testColorCombination(foreground, background, label)</a> ⇒ <code>Object</code></td>
    <td><p>Test specific color combination</p>
</td>
    </tr>
<tr>
    <td><a href="#hexToRgb">hexToRgb(hex)</a> ⇒ <code>Object</code></td>
    <td><p>Convert hex color to RGB values
Handles both 3-digit and 6-digit hex codes with or without #</p>
</td>
    </tr>
<tr>
    <td><a href="#calculateLuminance">calculateLuminance(rgb)</a> ⇒ <code>number</code></td>
    <td><p>Calculate relative luminance of a color per WCAG 2.1 formula</p>
</td>
    </tr>
<tr>
    <td><a href="#calculateContrastRatio">calculateContrastRatio(color1, color2)</a> ⇒ <code>number</code></td>
    <td><p>Calculate contrast ratio between two colors per WCAG 2.1</p>
</td>
    </tr>
<tr>
    <td><a href="#validateWCAGCompliance">validateWCAGCompliance(ratio, level, textSize)</a> ⇒ <code>Object</code></td>
    <td><p>Validate if contrast ratio meets WCAG standards</p>
</td>
    </tr>
<tr>
    <td><a href="#validateColorCombination">validateColorCombination(foreground, background, options)</a> ⇒ <code>Object</code></td>
    <td><p>Comprehensive contrast validation for a color combination</p>
</td>
    </tr>
<tr>
    <td><a href="#batchValidateColors">batchValidateColors(combinations, options)</a> ⇒ <code>Array</code></td>
    <td><p>Batch validate multiple color combinations</p>
</td>
    </tr>
<tr>
    <td><a href="#generateAccessibilityReport">generateAccessibilityReport(themeColors, level)</a> ⇒ <code>Object</code></td>
    <td><p>Generate accessibility report for theme colors</p>
</td>
    </tr>
<tr>
    <td><a href="#suggestImprovedColors">suggestImprovedColors(foreground, background, targetRatio)</a> ⇒ <code>Object</code></td>
    <td><p>Suggest improved colors for failing combinations</p>
</td>
    </tr>
</tbody>
</table>

<a name="module_AccessibilityAnnouncer"></a>

## AccessibilityAnnouncer

Accessibility Announcer Utility - T044
Provides ARIA live region management for screen reader announcements
Follows WCAG 2.1 guidelines for dynamic content announcement

**Version**: 1.0.0  

- [AccessibilityAnnouncer](#module_AccessibilityAnnouncer)
  - [.AccessibilityAnnouncer](#module_AccessibilityAnnouncer.AccessibilityAnnouncer)
    - [new exports.AccessibilityAnnouncer()](#new_module_AccessibilityAnnouncer.AccessibilityAnnouncer_new)
    - [.initializeLiveRegions()](#module_AccessibilityAnnouncer.AccessibilityAnnouncer+initializeLiveRegions) ⇒ <code>void</code>
    - [.announce(message, options)](#module_AccessibilityAnnouncer.AccessibilityAnnouncer+announce) ⇒ <code>boolean</code>
    - [.announceThemeChange(newTheme, previousTheme, source)](#module_AccessibilityAnnouncer.AccessibilityAnnouncer+announceThemeChange) ⇒ <code>boolean</code>
    - [.announceAccessibilityStatus(accessibilityReport, theme)](#module_AccessibilityAnnouncer.AccessibilityAnnouncer+announceAccessibilityStatus) ⇒ <code>boolean</code>
    - [.sanitizeMessage(message)](#module_AccessibilityAnnouncer.AccessibilityAnnouncer+sanitizeMessage) ⇒ <code>string</code> \| <code>null</code>
    - [.isDuplicateAnnouncement(announcement)](#module_AccessibilityAnnouncer.AccessibilityAnnouncer+isDuplicateAnnouncement) ⇒ <code>boolean</code>
    - [.queueAnnouncement(announcement)](#module_AccessibilityAnnouncer.AccessibilityAnnouncer+queueAnnouncement) ⇒ <code>boolean</code>
    - [.processAnnouncementQueue()](#module_AccessibilityAnnouncer.AccessibilityAnnouncer+processAnnouncementQueue) ⇒ <code>void</code>
    - [.performAnnouncement(announcement)](#module_AccessibilityAnnouncer.AccessibilityAnnouncer+performAnnouncement) ⇒ <code>boolean</code>
    - [.generateAnnouncementId()](#module_AccessibilityAnnouncer.AccessibilityAnnouncer+generateAnnouncementId) ⇒ <code>string</code>
    - [.getStats()](#module_AccessibilityAnnouncer.AccessibilityAnnouncer+getStats) ⇒ <code>Object</code>
    - [.clearQueue()](#module_AccessibilityAnnouncer.AccessibilityAnnouncer+clearQueue) ⇒ <code>void</code>
    - [.registerCleanup()](#module_AccessibilityAnnouncer.AccessibilityAnnouncer+registerCleanup) ⇒ <code>void</code>
    - [.destroy()](#module_AccessibilityAnnouncer.AccessibilityAnnouncer+destroy) ⇒ <code>void</code>

* * *

<a name="module_AccessibilityAnnouncer.AccessibilityAnnouncer"></a>

### AccessibilityAnnouncer.AccessibilityAnnouncer

ARIA live region manager for dynamic content announcements
Creates and manages invisible live regions for screen reader accessibility

**Kind**: static class of [<code>AccessibilityAnnouncer</code>](#module_AccessibilityAnnouncer)  

- [.AccessibilityAnnouncer](#module_AccessibilityAnnouncer.AccessibilityAnnouncer)
  - [new exports.AccessibilityAnnouncer()](#new_module_AccessibilityAnnouncer.AccessibilityAnnouncer_new)
  - [.initializeLiveRegions()](#module_AccessibilityAnnouncer.AccessibilityAnnouncer+initializeLiveRegions) ⇒ <code>void</code>
  - [.announce(message, options)](#module_AccessibilityAnnouncer.AccessibilityAnnouncer+announce) ⇒ <code>boolean</code>
  - [.announceThemeChange(newTheme, previousTheme, source)](#module_AccessibilityAnnouncer.AccessibilityAnnouncer+announceThemeChange) ⇒ <code>boolean</code>
  - [.announceAccessibilityStatus(accessibilityReport, theme)](#module_AccessibilityAnnouncer.AccessibilityAnnouncer+announceAccessibilityStatus) ⇒ <code>boolean</code>
  - [.sanitizeMessage(message)](#module_AccessibilityAnnouncer.AccessibilityAnnouncer+sanitizeMessage) ⇒ <code>string</code> \| <code>null</code>
  - [.isDuplicateAnnouncement(announcement)](#module_AccessibilityAnnouncer.AccessibilityAnnouncer+isDuplicateAnnouncement) ⇒ <code>boolean</code>
  - [.queueAnnouncement(announcement)](#module_AccessibilityAnnouncer.AccessibilityAnnouncer+queueAnnouncement) ⇒ <code>boolean</code>
  - [.processAnnouncementQueue()](#module_AccessibilityAnnouncer.AccessibilityAnnouncer+processAnnouncementQueue) ⇒ <code>void</code>
  - [.performAnnouncement(announcement)](#module_AccessibilityAnnouncer.AccessibilityAnnouncer+performAnnouncement) ⇒ <code>boolean</code>
  - [.generateAnnouncementId()](#module_AccessibilityAnnouncer.AccessibilityAnnouncer+generateAnnouncementId) ⇒ <code>string</code>
  - [.getStats()](#module_AccessibilityAnnouncer.AccessibilityAnnouncer+getStats) ⇒ <code>Object</code>
  - [.clearQueue()](#module_AccessibilityAnnouncer.AccessibilityAnnouncer+clearQueue) ⇒ <code>void</code>
  - [.registerCleanup()](#module_AccessibilityAnnouncer.AccessibilityAnnouncer+registerCleanup) ⇒ <code>void</code>
  - [.destroy()](#module_AccessibilityAnnouncer.AccessibilityAnnouncer+destroy) ⇒ <code>void</code>

* * *

<a name="new_module_AccessibilityAnnouncer.AccessibilityAnnouncer_new"></a>

#### new exports.AccessibilityAnnouncer()

Constructor - initializes live regions and announcement queue

* * *

<a name="module_AccessibilityAnnouncer.AccessibilityAnnouncer+initializeLiveRegions"></a>

#### accessibilityAnnouncer.initializeLiveRegions() ⇒ <code>void</code>

Initialize ARIA live regions in the DOM
Creates invisible but accessible regions for screen reader announcements

**Kind**: instance method of [<code>AccessibilityAnnouncer</code>](#module_AccessibilityAnnouncer.AccessibilityAnnouncer)  

* * *

<a name="module_AccessibilityAnnouncer.AccessibilityAnnouncer+announce"></a>

#### accessibilityAnnouncer.announce(message, options) ⇒ <code>boolean</code>

Announce message to screen readers with specified priority

**Kind**: instance method of [<code>AccessibilityAnnouncer</code>](#module_AccessibilityAnnouncer.AccessibilityAnnouncer)  
**Returns**: <code>boolean</code> - True if announcement was queued/announced, false otherwise  

| Param | Type | Description |
| --- | --- | --- |
| message | <code>string</code> | Message to announce |
| options | <code>Object</code> | Announcement options |
| options.priority | <code>string</code> | 'polite', 'assertive', or 'status' (default: 'polite') |
| options.immediate | <code>boolean</code> | Skip queue and announce immediately (default: false) |
| options.category | <code>string</code> | Category for duplicate filtering (default: 'general') |

* * *

<a name="module_AccessibilityAnnouncer.AccessibilityAnnouncer+announceThemeChange"></a>

#### accessibilityAnnouncer.announceThemeChange(newTheme, previousTheme, source) ⇒ <code>boolean</code>

Announce theme change specifically - T044 primary use case
Provides contextual information about the theme switch

**Kind**: instance method of [<code>AccessibilityAnnouncer</code>](#module_AccessibilityAnnouncer.AccessibilityAnnouncer)  
**Returns**: <code>boolean</code> - True if announcement was successful  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| newTheme | <code>string</code> |  | The new theme ('light' or 'dark') |
| previousTheme | <code>string</code> |  | The previous theme |
| source | <code>string</code> | <code>&quot;user&quot;</code> | Source of the change ('user', 'system', etc.) |

* * *

<a name="module_AccessibilityAnnouncer.AccessibilityAnnouncer+announceAccessibilityStatus"></a>

#### accessibilityAnnouncer.announceAccessibilityStatus(accessibilityReport, theme) ⇒ <code>boolean</code>

Announce accessibility compliance status - T044 enhancement
Informs users about WCAG compliance when theme changes

**Kind**: instance method of [<code>AccessibilityAnnouncer</code>](#module_AccessibilityAnnouncer.AccessibilityAnnouncer)  
**Returns**: <code>boolean</code> - True if announcement was successful  

| Param | Type | Description |
| --- | --- | --- |
| accessibilityReport | <code>Object</code> | Report from WCAG validator |
| theme | <code>string</code> | Current theme |

* * *

<a name="module_AccessibilityAnnouncer.AccessibilityAnnouncer+sanitizeMessage"></a>

#### accessibilityAnnouncer.sanitizeMessage(message) ⇒ <code>string</code> \| <code>null</code>

Sanitize message to prevent XSS and ensure safe announcement

**Kind**: instance method of [<code>AccessibilityAnnouncer</code>](#module_AccessibilityAnnouncer.AccessibilityAnnouncer)  
**Returns**: <code>string</code> \| <code>null</code> - Sanitized message or null if unsafe  

| Param | Type | Description |
| --- | --- | --- |
| message | <code>string</code> | Message to sanitize |

* * *

<a name="module_AccessibilityAnnouncer.AccessibilityAnnouncer+isDuplicateAnnouncement"></a>

#### accessibilityAnnouncer.isDuplicateAnnouncement(announcement) ⇒ <code>boolean</code>

Check if announcement is a duplicate to prevent spam

**Kind**: instance method of [<code>AccessibilityAnnouncer</code>](#module_AccessibilityAnnouncer.AccessibilityAnnouncer)  
**Returns**: <code>boolean</code> - True if this is a duplicate announcement  

| Param | Type | Description |
| --- | --- | --- |
| announcement | <code>Object</code> | Announcement to check |

* * *

<a name="module_AccessibilityAnnouncer.AccessibilityAnnouncer+queueAnnouncement"></a>

#### accessibilityAnnouncer.queueAnnouncement(announcement) ⇒ <code>boolean</code>

Add announcement to queue for processing

**Kind**: instance method of [<code>AccessibilityAnnouncer</code>](#module_AccessibilityAnnouncer.AccessibilityAnnouncer)  
**Returns**: <code>boolean</code> - True if queued successfully  

| Param | Type | Description |
| --- | --- | --- |
| announcement | <code>Object</code> | Announcement object |

* * *

<a name="module_AccessibilityAnnouncer.AccessibilityAnnouncer+processAnnouncementQueue"></a>

#### accessibilityAnnouncer.processAnnouncementQueue() ⇒ <code>void</code>

Process the announcement queue sequentially

**Kind**: instance method of [<code>AccessibilityAnnouncer</code>](#module_AccessibilityAnnouncer.AccessibilityAnnouncer)  

* * *

<a name="module_AccessibilityAnnouncer.AccessibilityAnnouncer+performAnnouncement"></a>

#### accessibilityAnnouncer.performAnnouncement(announcement) ⇒ <code>boolean</code>

Perform the actual announcement to screen readers

**Kind**: instance method of [<code>AccessibilityAnnouncer</code>](#module_AccessibilityAnnouncer.AccessibilityAnnouncer)  
**Returns**: <code>boolean</code> - True if announcement was performed  

| Param | Type | Description |
| --- | --- | --- |
| announcement | <code>Object</code> | Announcement object |

* * *

<a name="module_AccessibilityAnnouncer.AccessibilityAnnouncer+generateAnnouncementId"></a>

#### accessibilityAnnouncer.generateAnnouncementId() ⇒ <code>string</code>

Generate unique announcement ID for tracking

**Kind**: instance method of [<code>AccessibilityAnnouncer</code>](#module_AccessibilityAnnouncer.AccessibilityAnnouncer)  
**Returns**: <code>string</code> - Unique announcement identifier  

* * *

<a name="module_AccessibilityAnnouncer.AccessibilityAnnouncer+getStats"></a>

#### accessibilityAnnouncer.getStats() ⇒ <code>Object</code>

Get announcement statistics for monitoring

**Kind**: instance method of [<code>AccessibilityAnnouncer</code>](#module_AccessibilityAnnouncer.AccessibilityAnnouncer)  
**Returns**: <code>Object</code> - Statistics object  

* * *

<a name="module_AccessibilityAnnouncer.AccessibilityAnnouncer+clearQueue"></a>

#### accessibilityAnnouncer.clearQueue() ⇒ <code>void</code>

Clear announcement queue and reset state

**Kind**: instance method of [<code>AccessibilityAnnouncer</code>](#module_AccessibilityAnnouncer.AccessibilityAnnouncer)  

* * *

<a name="module_AccessibilityAnnouncer.AccessibilityAnnouncer+registerCleanup"></a>

#### accessibilityAnnouncer.registerCleanup() ⇒ <code>void</code>

Register cleanup handlers for page unload

**Kind**: instance method of [<code>AccessibilityAnnouncer</code>](#module_AccessibilityAnnouncer.AccessibilityAnnouncer)  

* * *

<a name="module_AccessibilityAnnouncer.AccessibilityAnnouncer+destroy"></a>

#### accessibilityAnnouncer.destroy() ⇒ <code>void</code>

Clean up resources and remove DOM elements

**Kind**: instance method of [<code>AccessibilityAnnouncer</code>](#module_AccessibilityAnnouncer.AccessibilityAnnouncer)  

* * *

<a name="ChartThemeAdapter"></a>

## ChartThemeAdapter

**Kind**: global class  

- [ChartThemeAdapter](#ChartThemeAdapter)
  - [new ChartThemeAdapter()](#new_ChartThemeAdapter_new)
  - [.detectCurrentTheme()](#ChartThemeAdapter+detectCurrentTheme) ⇒ <code>string</code>
  - [.getThemeConfig(theme)](#ChartThemeAdapter+getThemeConfig) ⇒ <code>Object</code>
  - [.getCSSVariables(theme)](#ChartThemeAdapter+getCSSVariables) ⇒ <code>Object</code>
  - [.getFallbackConfig(theme)](#ChartThemeAdapter+getFallbackConfig) ⇒ <code>Object</code>
  - [.getFallbackCSSVariables(theme)](#ChartThemeAdapter+getFallbackCSSVariables) ⇒ <code>Object</code>
  - [.getVulnerabilityColors(theme)](#ChartThemeAdapter+getVulnerabilityColors) ⇒ <code>Array</code>
  - [.updateChartTheme(chartInstance, theme, chartId)](#ChartThemeAdapter+updateChartTheme) ⇒ <code>Promise.&lt;boolean&gt;</code>
  - [.registerCharts(charts)](#ChartThemeAdapter+registerCharts) ⇒ <code>void</code>
  - [.updateAllCharts(theme)](#ChartThemeAdapter+updateAllCharts) ⇒ <code>Promise.&lt;Array&gt;</code>
  - [.applyGridTheme(gridApi, theme, gridId)](#ChartThemeAdapter+applyGridTheme) ⇒ <code>boolean</code>
  - [.applyGridThemeLegacy(gridApi, theme, gridId)](#ChartThemeAdapter+applyGridThemeLegacy) ⇒ <code>boolean</code>
  - [.registerGrids(grids)](#ChartThemeAdapter+registerGrids) ⇒ <code>void</code>
  - [.updateAllGrids(theme)](#ChartThemeAdapter+updateAllGrids) ⇒ <code>Array.&lt;boolean&gt;</code>
  - [.updateAllComponents(theme)](#ChartThemeAdapter+updateAllComponents) ⇒ <code>Promise.&lt;Object&gt;</code>
  - [.getCurrentTheme()](#ChartThemeAdapter+getCurrentTheme) ⇒ <code>string</code>
  - [.getRegistryStatus()](#ChartThemeAdapter+getRegistryStatus) ⇒ <code>Object</code>
  - [.clearRegistry()](#ChartThemeAdapter+clearRegistry) ⇒ <code>void</code>

* * *

<a name="new_ChartThemeAdapter_new"></a>

### new ChartThemeAdapter()

Creates an instance of ChartThemeAdapter.
T025: Initialize theme detection and chart registry

* * *

<a name="ChartThemeAdapter+detectCurrentTheme"></a>

### chartThemeAdapter.detectCurrentTheme() ⇒ <code>string</code>

Detect current theme from document element
T025: Theme detection logic

**Kind**: instance method of [<code>ChartThemeAdapter</code>](#ChartThemeAdapter)  
**Returns**: <code>string</code> - Current theme ('light' | 'dark')  

* * *

<a name="ChartThemeAdapter+getThemeConfig"></a>

### chartThemeAdapter.getThemeConfig(theme) ⇒ <code>Object</code>

Retrieves the theme configuration for ApexCharts based on the specified theme.
T025: Complete ApexCharts theme configuration with CSS custom properties

**Kind**: instance method of [<code>ChartThemeAdapter</code>](#ChartThemeAdapter)  
**Returns**: <code>Object</code> - The configuration object for ApexCharts compatible with the theme  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| theme | <code>string</code> | <code>&quot;light&quot;</code> | The theme to apply ('light' or 'dark') |

* * *

<a name="ChartThemeAdapter+getCSSVariables"></a>

### chartThemeAdapter.getCSSVariables(theme) ⇒ <code>Object</code>

Get CSS custom property values for theming
T025: CSS variable extraction for dynamic theming

**Kind**: instance method of [<code>ChartThemeAdapter</code>](#ChartThemeAdapter)  
**Returns**: <code>Object</code> - CSS variable values  

| Param | Type | Description |
| --- | --- | --- |
| theme | <code>string</code> | Theme name ('light' | 'dark') |

* * *

<a name="ChartThemeAdapter+getFallbackConfig"></a>

### chartThemeAdapter.getFallbackConfig(theme) ⇒ <code>Object</code>

Fallback theme configuration when CSS variables fail
T025: Error resilience for theme configuration

**Kind**: instance method of [<code>ChartThemeAdapter</code>](#ChartThemeAdapter)  
**Returns**: <code>Object</code> - Fallback configuration  

| Param | Type | Description |
| --- | --- | --- |
| theme | <code>string</code> | Theme name |

* * *

<a name="ChartThemeAdapter+getFallbackCSSVariables"></a>

### chartThemeAdapter.getFallbackCSSVariables(theme) ⇒ <code>Object</code>

Fallback CSS variables when extraction fails

**Kind**: instance method of [<code>ChartThemeAdapter</code>](#ChartThemeAdapter)  
**Returns**: <code>Object</code> - Fallback CSS variables  

| Param | Type | Description |
| --- | --- | --- |
| theme | <code>string</code> | Theme name |

* * *

<a name="ChartThemeAdapter+getVulnerabilityColors"></a>

### chartThemeAdapter.getVulnerabilityColors(theme) ⇒ <code>Array</code>

Get vulnerability-specific chart colors - S002

**Kind**: instance method of [<code>ChartThemeAdapter</code>](#ChartThemeAdapter)  
**Returns**: <code>Array</code> - Array of vulnerability severity colors [critical, high, medium, low]  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| theme | <code>string</code> | <code>&quot;light&quot;</code> | Theme name ('light' | 'dark') |

* * *

<a name="ChartThemeAdapter+updateChartTheme"></a>

### chartThemeAdapter.updateChartTheme(chartInstance, theme, chartId) ⇒ <code>Promise.&lt;boolean&gt;</code>

Updates the theme of an existing ApexCharts instance.
T025: Dynamic chart theme updates with performance optimization

**Kind**: instance method of [<code>ChartThemeAdapter</code>](#ChartThemeAdapter)  
**Returns**: <code>Promise.&lt;boolean&gt;</code> - True if update succeeded  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| chartInstance | <code>Object</code> |  | The ApexCharts instance to update |
| theme | <code>string</code> |  | The theme to apply ('light' or 'dark') |
| chartId | <code>string</code> | <code>null</code> | Optional chart identifier for registry |

* * *

<a name="ChartThemeAdapter+registerCharts"></a>

### chartThemeAdapter.registerCharts(charts) ⇒ <code>void</code>

Register multiple chart instances for bulk theme updates
T025: Chart instance management for bulk operations

**Kind**: instance method of [<code>ChartThemeAdapter</code>](#ChartThemeAdapter)  

| Param | Type | Description |
| --- | --- | --- |
| charts | <code>Object</code> | Object with chartId: chartInstance pairs |

* * *

<a name="ChartThemeAdapter+updateAllCharts"></a>

### chartThemeAdapter.updateAllCharts(theme) ⇒ <code>Promise.&lt;Array&gt;</code>

Update all registered charts to new theme
T025: Bulk chart theme updates for performance

**Kind**: instance method of [<code>ChartThemeAdapter</code>](#ChartThemeAdapter)  
**Returns**: <code>Promise.&lt;Array&gt;</code> - Results of all chart updates  

| Param | Type | Description |
| --- | --- | --- |
| theme | <code>string</code> | Theme to apply to all charts |

* * *

<a name="ChartThemeAdapter+applyGridTheme"></a>

### chartThemeAdapter.applyGridTheme(gridApi, theme, gridId) ⇒ <code>boolean</code>

Applies the specified theme to an AG-Grid instance using modern themeQuartz API.
T037: Modern AG-Grid theme switching with themeQuartz for smooth transitions

**Kind**: instance method of [<code>ChartThemeAdapter</code>](#ChartThemeAdapter)  
**Returns**: <code>boolean</code> - True if theme applied successfully  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| gridApi | <code>Object</code> |  | The AG-Grid API instance to update |
| theme | <code>string</code> |  | The theme to apply ('light' or 'dark') |
| gridId | <code>string</code> | <code>null</code> | Optional grid identifier for registry |

* * *

<a name="ChartThemeAdapter+applyGridThemeLegacy"></a>

### chartThemeAdapter.applyGridThemeLegacy(gridApi, theme, gridId) ⇒ <code>boolean</code>

Legacy fallback method for AG-Grid theme switching using CSS classes
T026: Backward compatibility for older AG-Grid setups

**Kind**: instance method of [<code>ChartThemeAdapter</code>](#ChartThemeAdapter)  
**Returns**: <code>boolean</code> - True if theme applied successfully  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| gridApi | <code>Object</code> |  | The AG-Grid API instance to update |
| theme | <code>string</code> |  | The theme to apply ('light' or 'dark') |
| gridId | <code>string</code> | <code>null</code> | Optional grid identifier for registry |

* * *

<a name="ChartThemeAdapter+registerGrids"></a>

### chartThemeAdapter.registerGrids(grids) ⇒ <code>void</code>

Register multiple AG-Grid instances for bulk theme updates
T026: Grid instance management for bulk operations

**Kind**: instance method of [<code>ChartThemeAdapter</code>](#ChartThemeAdapter)  

| Param | Type | Description |
| --- | --- | --- |
| grids | <code>Object</code> | Object with gridId: gridApi pairs |

* * *

<a name="ChartThemeAdapter+updateAllGrids"></a>

### chartThemeAdapter.updateAllGrids(theme) ⇒ <code>Array.&lt;boolean&gt;</code>

Update all registered grids to new theme
T026: Bulk grid theme updates

**Kind**: instance method of [<code>ChartThemeAdapter</code>](#ChartThemeAdapter)  
**Returns**: <code>Array.&lt;boolean&gt;</code> - Results of all grid updates  

| Param | Type | Description |
| --- | --- | --- |
| theme | <code>string</code> | Theme to apply to all grids |

* * *

<a name="ChartThemeAdapter+updateAllComponents"></a>

### chartThemeAdapter.updateAllComponents(theme) ⇒ <code>Promise.&lt;Object&gt;</code>

Update all registered charts and grids to new theme
T025/T026: Complete theme system update

**Kind**: instance method of [<code>ChartThemeAdapter</code>](#ChartThemeAdapter)  
**Returns**: <code>Promise.&lt;Object&gt;</code> - Results of updates  

| Param | Type | Description |
| --- | --- | --- |
| theme | <code>string</code> | Theme to apply ('light' or 'dark') |

* * *

<a name="ChartThemeAdapter+getCurrentTheme"></a>

### chartThemeAdapter.getCurrentTheme() ⇒ <code>string</code>

Get current theme state

**Kind**: instance method of [<code>ChartThemeAdapter</code>](#ChartThemeAdapter)  
**Returns**: <code>string</code> - Current theme ('light' or 'dark')  

* * *

<a name="ChartThemeAdapter+getRegistryStatus"></a>

### chartThemeAdapter.getRegistryStatus() ⇒ <code>Object</code>

Get registry status for debugging

**Kind**: instance method of [<code>ChartThemeAdapter</code>](#ChartThemeAdapter)  
**Returns**: <code>Object</code> - Registry information  

* * *

<a name="ChartThemeAdapter+clearRegistry"></a>

### chartThemeAdapter.clearRegistry() ⇒ <code>void</code>

Clear all registrations (useful for cleanup)

**Kind**: instance method of [<code>ChartThemeAdapter</code>](#ChartThemeAdapter)  

* * *

<a name="DARK_THEME_COLORS"></a>

## DARK\_THEME\_COLORS

HexTrackr Dark Theme Color Definitions
Extracted from dark-theme.css for testing

**Kind**: global constant  

* * *

<a name="CRITICAL_COMBINATIONS"></a>

## CRITICAL\_COMBINATIONS

Critical text/background combinations to test
These represent the most important UI elements for accessibility

**Kind**: global constant  

* * *

<a name="safeSetInnerHTML"></a>

## safeSetInnerHTML(element, htmlContent)

Safely set innerHTML with DOMPurify sanitization

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| element | <code>HTMLElement</code> | The DOM element to update |
| htmlContent | <code>string</code> | The HTML content to sanitize and inject |

* * *

<a name="escapeHtml"></a>

## escapeHtml(text) ⇒ <code>string</code>

Escape HTML entities to prevent XSS attacks

**Kind**: global function  
**Returns**: <code>string</code> - - The escaped text  

| Param | Type | Description |
| --- | --- | --- |
| text | <code>string</code> | The text to escape |

* * *

<a name="safeCreateElement"></a>

## safeCreateElement(tagName, content, attributes) ⇒ <code>HTMLElement</code>

Safely create element with sanitized content

**Kind**: global function  
**Returns**: <code>HTMLElement</code> - - The created element  

| Param | Type | Description |
| --- | --- | --- |
| tagName | <code>string</code> | The HTML tag name |
| content | <code>string</code> | The content to sanitize |
| attributes | <code>object</code> | Optional attributes to set |

* * *

<a name="testDarkThemeCompliance"></a>

## testDarkThemeCompliance(verbose) ⇒ <code>Object</code>

Run WCAG AA compliance test on all critical color combinations

**Kind**: global function  
**Returns**: <code>Object</code> - Test results with summary and violations  

| Param | Type | Description |
| --- | --- | --- |
| verbose | <code>boolean</code> | Include detailed results in output |

* * *

<a name="generateRecommendations"></a>

## generateRecommendations(criticalFailures, nonCriticalFailures) ⇒ <code>Array</code>

Generate actionable recommendations for fixing accessibility issues

**Kind**: global function  
**Returns**: <code>Array</code> - List of actionable recommendations  

| Param | Type | Description |
| --- | --- | --- |
| criticalFailures | <code>Array</code> | Critical accessibility violations |
| nonCriticalFailures | <code>Array</code> | Non-critical accessibility issues |

* * *

<a name="testColorCombination"></a>

## testColorCombination(foreground, background, label) ⇒ <code>Object</code>

Test specific color combination

**Kind**: global function  
**Returns**: <code>Object</code> - Detailed test result  

| Param | Type | Description |
| --- | --- | --- |
| foreground | <code>string</code> | Foreground color (hex) |
| background | <code>string</code> | Background color (hex) |
| label | <code>string</code> | Description of the combination |

* * *

<a name="hexToRgb"></a>

## hexToRgb(hex) ⇒ <code>Object</code>

Convert hex color to RGB values
Handles both 3-digit and 6-digit hex codes with or without #

**Kind**: global function  
**Returns**: <code>Object</code> - RGB values {r, g, b} or null if invalid  

| Param | Type | Description |
| --- | --- | --- |
| hex | <code>string</code> | Hex color code |

* * *

<a name="calculateLuminance"></a>

## calculateLuminance(rgb) ⇒ <code>number</code>

Calculate relative luminance of a color per WCAG 2.1 formula

**Kind**: global function  
**Returns**: <code>number</code> - Relative luminance (0-1)  

| Param | Type | Description |
| --- | --- | --- |
| rgb | <code>Object</code> | RGB color values {r, g, b} |

* * *

<a name="calculateContrastRatio"></a>

## calculateContrastRatio(color1, color2) ⇒ <code>number</code>

Calculate contrast ratio between two colors per WCAG 2.1

**Kind**: global function  
**Returns**: <code>number</code> - Contrast ratio (1-21)  

| Param | Type | Description |
| --- | --- | --- |
| color1 | <code>string</code> | First color (hex) |
| color2 | <code>string</code> | Second color (hex) |

* * *

<a name="validateWCAGCompliance"></a>

## validateWCAGCompliance(ratio, level, textSize) ⇒ <code>Object</code>

Validate if contrast ratio meets WCAG standards

**Kind**: global function  
**Returns**: <code>Object</code> - Validation result  

| Param | Type | Description |
| --- | --- | --- |
| ratio | <code>number</code> | Contrast ratio to validate |
| level | <code>string</code> | WCAG level ('AA' or 'AAA') |
| textSize | <code>string</code> | Text size ('normal' or 'large') |

* * *

<a name="validateColorCombination"></a>

## validateColorCombination(foreground, background, options) ⇒ <code>Object</code>

Comprehensive contrast validation for a color combination

**Kind**: global function  
**Returns**: <code>Object</code> - Complete validation results  

| Param | Type | Description |
| --- | --- | --- |
| foreground | <code>string</code> | Foreground color (hex) |
| background | <code>string</code> | Background color (hex) |
| options | <code>Object</code> | Validation options |

* * *

<a name="batchValidateColors"></a>

## batchValidateColors(combinations, options) ⇒ <code>Array</code>

Batch validate multiple color combinations

**Kind**: global function  
**Returns**: <code>Array</code> - Array of validation results  

| Param | Type | Description |
| --- | --- | --- |
| combinations | <code>Array</code> | Array of {fg, bg, label} objects |
| options | <code>Object</code> | Validation options |

* * *

<a name="generateAccessibilityReport"></a>

## generateAccessibilityReport(themeColors, level) ⇒ <code>Object</code>

Generate accessibility report for theme colors

**Kind**: global function  
**Returns**: <code>Object</code> - Accessibility report  

| Param | Type | Description |
| --- | --- | --- |
| themeColors | <code>Object</code> | Theme color definitions |
| level | <code>string</code> | WCAG level to validate against |

* * *

<a name="suggestImprovedColors"></a>

## suggestImprovedColors(foreground, background, targetRatio) ⇒ <code>Object</code>

Suggest improved colors for failing combinations

**Kind**: global function  
**Returns**: <code>Object</code> - Color suggestions  

| Param | Type | Description |
| --- | --- | --- |
| foreground | <code>string</code> | Current foreground color |
| background | <code>string</code> | Current background color |
| targetRatio | <code>number</code> | Target contrast ratio |

* * *

---

# Vulnerabilities API

HexTrackr exposes a set of REST endpoints for reporting, trending, and importing vulnerability data. The API operates on the rollover pipeline described in [Database Architecture](../architecture/database.md) and surfaces both the deduplicated current state (`vulnerabilities_current`) and supporting metadata.

**Related reading**: [Data Model](../architecture/data-model.md) for table layouts and column notes.

---

## Endpoints

### GET /api/vulnerabilities

- **Description**: Returns active and reopened vulnerabilities ordered by VPR score. Resolved rows are excluded automatically (`lifecycle_state IN ('active','reopened')`).
- **Query Parameters**:
  - `page` (number, default `1`)
  - `limit` (number, default `50`)
  - `search` (string): case-insensitive substring match against hostname, CVE, or plugin name
  - `severity` (string): one of `Critical`, `High`, `Medium`, `Low`
- **Response**: `200 OK`

```json
{
  "data": [
    {
      "id": 42,
      "import_id": 9,
      "scan_date": "2025-08-20",
      "hostname": "core-switch-01",
      "ip_address": "10.0.10.5",
      "cve": "CVE-2024-0001",
      "severity": "High",
      "vpr_score": 8.6,
      "cvss_score": 9.0,
      "plugin_id": "12345",
      "plugin_name": "Example Vulnerability Name",
      "description": "Example Vulnerability Name (CVE-2024-0001)",
      "solution": "Update firmware to version 18.5",
      "state": "ACTIVE",
      "lifecycle_state": "active",
      "first_seen": "2025-08-10",
      "last_seen": "2025-08-20"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 312,
    "pages": 7
  }
}
```

### GET /api/vulnerabilities/stats

- **Description**: Aggregated metrics derived from `vulnerabilities_current` grouped by severity.
- **Response**: `200 OK`

```json
[
  {
    "severity": "Critical",
    "count": 12,
    "total_vpr": 100.1,
    "avg_vpr": 8.34,
    "earliest": "2025-08-01",
    "latest": "2025-08-20"
  }
]
```

### GET /api/vulnerabilities/recent-trends

- **Description**: Compares the most recent daily totals with the previous day to highlight deltas. Uses `vulnerability_daily_totals`.
- **Response**: `200 OK`

```json
{
  "Critical": {
    "current": { "count": 12, "total_vpr": 115.8 },
    "trend": { "count_change": 2, "vpr_change": 10.2 }
  },
  "High": {
    "current": { "count": 40, "total_vpr": 320.1 },
    "trend": { "count_change": -5, "vpr_change": -34.5 }
  }
}
```

### GET /api/vulnerabilities/trends

- **Description**: Historical trend series for each severity with optional start/end date filters. Defaults to the last 14 days.
- **Query Parameters**: `startDate`, `endDate` (`YYYY-MM-DD`)
- **Response**: `200 OK`

```json
[
  {
    "date": "2025-08-20",
    "Critical": { "count": 12, "total_vpr": 115.8 },
    "High": { "count": 85, "total_vpr": 722.5 },
    "Medium": { "count": 210, "total_vpr": 1050.0 },
    "Low": { "count": 50, "total_vpr": 50.0 }
  }
]
```

### GET /api/vulnerabilities/resolved

- **Description**: Paginated access to resolved vulnerabilities (`lifecycle_state = 'resolved'`). Useful for audits and verification workflows.
- **Response**: `200 OK`

```json
{
  "data": [
    {
      "id": 15,
      "hostname": "server-01",
      "cve": "CVE-2023-1234",
      "severity": "High",
      "lifecycle_state": "resolved",
      "resolved_date": "2025-08-15",
      "last_seen": "2025-08-10",
      "resolution_reason": "No longer detected in latest scan"
    }
  ],
  "pagination": { "page": 1, "limit": 50, "total": 45, "pages": 1 }
}
```

### GET /api/imports

- **Description**: Returns import history from `vulnerability_imports` with derived vulnerability counts.
- **Response**: `200 OK`

```json
[
  {
    "id": 12,
    "filename": "cisco_scan_2025-08-20.csv",
    "import_date": "2025-08-20T15:04:00.000Z",
    "row_count": 9850,
    "vendor": "cisco",
    "file_size": 1048576,
    "processing_time": 2340,
    "raw_headers": "[\"asset.name\",\"definition.cve\"]",
    "created_at": "2025-08-20T15:04:00.000Z",
    "vulnerability_count": 9850
  }
]
```

### DELETE /api/vulnerabilities/clear

- **Description**: Removes all rollover data (current, snapshots, daily totals, staging, import history). Also clears many-to-many ticket links.
- **Warning**: Irreversible destructive operation.
- **Response**: `200 OK`

```json
{
  "success": true,
  "message": "All vulnerability data cleared from rollover architecture"
}
```

---

## System Management

### GET /health

- **Description**: Lightweight health probe that reports application version, database availability, and uptime.
- **Response**: `200 OK`

```json
{
  "status": "ok",
  "version": "1.2.0",
  "db": true,
  "uptime": 8645.32
}
```

### GET /api/sites

- **Description**: Lists known sites used for ticket context.
- **Response**: `200 OK`

```json
[
  {
    "id": 1,
    "code": "HQ",
    "name": "Main Campus",
    "description": "Primary operations center",
    "created_at": "2025-08-01T10:00:00.000Z",
    "updated_at": "2025-08-01T10:00:00.000Z"
  }
]
```

### GET /api/locations

- **Description**: Lists normalized locations associated with tickets.
- **Response**: `200 OK`

```json
[
  {
    "id": 3,
    "code": "HQ-WEST",
    "name": "Building A",
    "description": "West wing",
    "created_at": "2025-08-01T10:00:00.000Z",
    "updated_at": "2025-08-01T10:00:00.000Z"
  }
]
```

---

## Data Import & History

HexTrackr supports three ingestion paths. All flows normalise hostname/IP data, split multi-CVE rows, and update lifecycle states automatically.

### POST /api/vulnerabilities/import

- **Use case**: Standard CSV uploads from the dashboard.
- **Form fields**: `csvFile` (required), optional `vendor`, `scanDate`.
- **Processing**: Parses CSV via PapaParse, maps rows, updates rollover tables sequentially, and recalculates daily totals.
- **Response**: `200 OK`

```json
{
  "success": true,
  "importId": 12,
  "filename": "export.csv",
  "rowsProcessed": 250,
  "recordsCreated": 250,
  "inserted": 200,
  "updated": 30,
  "reopened": 20,
  "resolvedCount": 10,
  "scanDate": "2025-08-20",
  "rolloverComplete": true,
  "enhancedLifecycle": true,
  "performanceMetrics": {
    "totalImportTimeMs": 2340,
    "rowsPerSecond": 106.8,
    "memoryDeltaMB": 12,
    "dbOperations": {
      "total": 1800,
      "snapshotInserts": 250,
      "currentChecks": 250,
      "currentUpdates": 200,
      "currentInserts": 50,
      "avgTimeMs": 1.5
    },
    "avgRowTimeMs": 0.9
  }
}
```

### POST /api/vulnerabilities/import-staging

- **Use case**: High-volume CSV uploads that need progress feedback.
- **Form fields**: `csvFile` (required), optional `vendor`, `scanDate`, `sessionId`.
- **Behavior**:
  - Immediately returns `{ success, sessionId }`.
  - Streams Socket.io events (`progress-update`, `progress-error`, `progress-complete`) in the room `progress-{sessionId}` managed by `ProgressTracker`.
  - Bulk loads data into `vulnerability_staging` before promoting to final tables.

```json
{
  "success": true,
  "sessionId": "1f4bba9b-3f8c-4d13-8cb8-4dedc1b7a9a2",
  "message": "CSV import started",
  "filename": "scan.csv",
  "vendor": "cisco",
  "scanDate": "2025-08-20"
}
```

### POST /api/import/vulnerabilities

- **Use case**: Automated integrations that pre-parse CSV to JSON.
- **Request Body**: `{ "data": VulnerabilityRow[] }`
- **Response**: `200 OK`

```json
{
  "success": true,
  "imported": 1,
  "total": 1,
  "errors": []
}
```

- **Supported fields**: `hostname`, `ip_address`, `cve`, `severity`, `vpr_score`, `cvss_score`, `plugin_id`, `plugin_name`, `description`, `solution`, `vendor`, `state`.

---

## Error Handling

Typical error formats follow Express conventions:

```json
{
  "error": "CSV parsing failed: Unexpected column count"
}
```

- `400 Bad Request`: invalid payloads or missing files
- `409 Conflict`: conflicts raised during import mode checks
- `500 Internal Server Error`: database or file-processing failures

# WebSocket API

HexTrackr uses Socket.io on the main Express server (default port `8989`) to stream long-running operation progress. WebSocket integration is optional—the UI falls back to manual polling when a socket connection is unavailable.

---

## Server Configuration

- **Port**: shares the Express HTTP server (`http://localhost:8989`)
- **Library**: `socket.io`
- **Transports**: `polling` upgradeable to `websocket`
- **Rooms**: per-session namespace `progress-{sessionId}`
- **Throttle**: minimum 100 ms between `progress-update` events

The server registers listeners in `server.js` and manages state through `ProgressTracker`.

### ProgressTracker Session Model

```json
{
  "id": "uuid",
  "progress": 45,
  "status": "processing",
  "startTime": 1724190482000,
  "lastUpdate": 1724190491000,
  "metadata": {
    "operation": "csv-import",
    "filename": "scan.csv",
    "scanDate": "2025-08-20",
    "totalSteps": 3,
    "currentStep": 2,
    "message": "Loading data to staging table..."
  }
}
```

Sessions are created via `ProgressTracker.createSession()` (or `createSessionWithId` when the client supplies its own UUID). They emit progress to the associated room and are cleaned up automatically after completion or after one hour of inactivity.

---

## Event Reference

| Event | Direction | Description |
| ----- | --------- | ----------- |
| `progress-update` | server → client | Throttled incremental updates. Includes `progress`, `message`, `status`, and `metadata`. |
| `progress-status` | server → client | Snapshot sent immediately after joining a room so reconnecting clients can resume display. |
| `progress-complete` | server → client | Signals successful completion. Contains final metadata and duration. |
| `progress-error` | server → client | Signals a fatal error with additional context under `error`. |
| `join-progress` | client → server | Subscribes the socket to a progress room (`progress-{sessionId}`). |
| `leave-progress` | client → server | Unsubscribes from a room when no longer needed. |

### Event Payloads

#### `progress-update`

```json
{
  "sessionId": "1f4bba9b-3f8c-4d13-8cb8-4dedc1b7a9a2",
  "progress": 60,
  "message": "Staging complete. Processing 9850 records to final tables...",
  "status": "processing",
  "timestamp": 1724190493000,
  "metadata": {
    "operation": "csv-import",
    "currentStep": 3,
    "insertedToStaging": 9850
  }
}
```

#### `progress-complete`

```json
{
  "sessionId": "1f4bba9b-3f8c-4d13-8cb8-4dedc1b7a9a2",
  "progress": 100,
  "message": "Import completed successfully",
  "status": "completed",
  "timestamp": 1724190525000,
  "metadata": {
    "operation": "csv-import",
    "duration": 42350,
    "recordsCreated": 9850
  }
}
```

#### `progress-error`

```json
{
  "sessionId": "1f4bba9b-3f8c-4d13-8cb8-4dedc1b7a9a2",
  "progress": 45,
  "message": "Failed to prepare for batch processing",
  "status": "error",
  "timestamp": 1724190508000,
  "metadata": {
    "operation": "csv-import",
    "currentStep": 3,
    "message": "Failed to prepare for batch processing"
  },
  "error": {
    "code": "SQLITE_BUSY",
    "detail": "database is locked"
  }
}
```

---

## Client Integration

`app/public/scripts/shared/websocket-client.js` wraps Socket.io and exposes a resilient API used by the Progress Modal.

### Connection Lifecycle

```javascript
import WebSocketClient from './scripts/shared/websocket-client.js';

const client = new WebSocketClient();
await client.connect();

client.on('progress', (payload) => updateProgressUI(payload));
client.on('progressComplete', (payload) => handleComplete(payload));
client.on('progressStatus', (payload) => hydrateFromSnapshot(payload));
client.on('progressError', (payload) => showError(payload));
client.on('connectionFailed', () => enableManualFallback());
```

#### Debug Logging

Set `localStorage.hextrackr_debug = "true"` to enable verbose console output inside the client wrapper. Logging automatically disables when the value is removed.

### Joining Rooms

```javascript
const sessionId = '1f4bba9b-3f8c-4d13-8cb8-4dedc1b7a9a2';
client.emit('join-progress', sessionId);
```

The Progress Modal automatically joins when the staging importer returns a session ID and calls `leave-progress` when the modal closes.

### Reconnection & Fallback

- Automatic retries use exponential backoff up to five attempts.
- The Progress Modal listens for the `connectionFailed` callback. When triggered, it displays a warning and continues with manual UI updates provided by HTTP responses.
- Heartbeats (`ping`/`pong`) run every 30 s to detect broken connections.

---

## Manual Mode (No WebSocket)

If Socket.io is unavailable the UI still works:

1. The `WebSocketClient` rejects the connection and emits `connectionFailed`.
2. `progress-modal.js` switches to manual mode and updates progress via standard UI callbacks.
3. Import workflows continue unaffected—the WebSocket stream only enhances user feedback.

---

## Security Considerations

- WebSocket access is limited to local development origins (`http://localhost:8080`, `http://127.0.0.1:8080`). Adjust the CORS list in `server.js` for other environments.
- Room names embed the session identifier; treat session IDs as opaque GUIDs.
- No authentication layer is implemented. Deploy behind a trusted network segment or add your own gateway.
