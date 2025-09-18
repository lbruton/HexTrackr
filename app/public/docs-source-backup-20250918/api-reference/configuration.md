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

* [databaseConfig](#databaseConfig) : <code>Object</code>
  * [.path](#databaseConfig.path) : <code>Object</code>
    * [.relative](#databaseConfig.path.relative) : <code>string</code>
    * [.absolute](#databaseConfig.path.absolute) : <code>string</code>
    * [.dataDirectory](#databaseConfig.path.dataDirectory) : <code>string</code>
  * [.options](#databaseConfig.options) : <code>Object</code>
    * [.verbose](#databaseConfig.options.verbose) : <code>boolean</code>
    * [.mode](#databaseConfig.options.mode) : <code>number</code>
    * [.timeout](#databaseConfig.options.timeout) : <code>number</code>
    * [.foreignKeys](#databaseConfig.options.foreignKeys) : <code>boolean</code>
    * [.walMode](#databaseConfig.options.walMode) : <code>boolean</code>
    * [.synchronous](#databaseConfig.options.synchronous) : <code>string</code>
    * [.cacheSize](#databaseConfig.options.cacheSize) : <code>number</code>
  * [.pool](#databaseConfig.pool) : <code>Object</code>
    * [.max](#databaseConfig.pool.max) : <code>number</code>
    * [.min](#databaseConfig.pool.min) : <code>number</code>
    * [.idleTimeoutMillis](#databaseConfig.pool.idleTimeoutMillis) : <code>number</code>
    * [.acquireTimeoutMillis](#databaseConfig.pool.acquireTimeoutMillis) : <code>number</code>
  * [.schema](#databaseConfig.schema) : <code>Object</code>
    * [.version](#databaseConfig.schema.version) : <code>string</code>
    * [.targetVersion](#databaseConfig.schema.targetVersion) : <code>string</code>
    * [.autoMigrate](#databaseConfig.schema.autoMigrate) : <code>boolean</code>
    * [.backupBeforeMigration](#databaseConfig.schema.backupBeforeMigration) : <code>boolean</code>
    * [.coreTables](#databaseConfig.schema.coreTables) : <code>Array.&lt;string&gt;</code>
    * [.performanceIndexes](#databaseConfig.schema.performanceIndexes) : <code>Array.&lt;string&gt;</code>
  * [.performance](#databaseConfig.performance) : <code>Object</code>
    * [.batchSize](#databaseConfig.performance.batchSize) : <code>number</code>
    * [.maxMemoryUsageMB](#databaseConfig.performance.maxMemoryUsageMB) : <code>number</code>
    * [.useTransactions](#databaseConfig.performance.useTransactions) : <code>boolean</code>
    * [.progressReportInterval](#databaseConfig.performance.progressReportInterval) : <code>number</code>
    * [.maxRowsInMemory](#databaseConfig.performance.maxRowsInMemory) : <code>number</code>
  * [.environment](#databaseConfig.environment) : <code>Object</code>
    * [.development](#databaseConfig.environment.development) : <code>Object</code>
    * [.production](#databaseConfig.environment.production) : <code>Object</code>
    * [.test](#databaseConfig.environment.test) : <code>Object</code>
  * [.security](#databaseConfig.security) : <code>Object</code>
    * [.enablePathValidation](#databaseConfig.security.enablePathValidation) : <code>boolean</code>
    * [.maxImportFileSize](#databaseConfig.security.maxImportFileSize) : <code>number</code>
    * [.allowedImportExtensions](#databaseConfig.security.allowedImportExtensions) : <code>Array.&lt;string&gt;</code>
    * [.preventSqlInjection](#databaseConfig.security.preventSqlInjection) : <code>boolean</code>
  * [.maintenance](#databaseConfig.maintenance) : <code>Object</code>
    * [.autoBackupIntervalHours](#databaseConfig.maintenance.autoBackupIntervalHours) : <code>number</code>
    * [.backupRetentionCount](#databaseConfig.maintenance.backupRetentionCount) : <code>number</code>
    * [.enableAutoVacuum](#databaseConfig.maintenance.enableAutoVacuum) : <code>boolean</code>
    * [.vacuumIntervalDays](#databaseConfig.maintenance.vacuumIntervalDays) : <code>number</code>
    * [.analyzeIntervalDays](#databaseConfig.maintenance.analyzeIntervalDays) : <code>number</code>

* * *

<a name="databaseConfig.path"></a>

### databaseConfig.path : <code>Object</code>

Database file path configuration

**Kind**: static property of [<code>databaseConfig</code>](#databaseConfig)  

* [.path](#databaseConfig.path) : <code>Object</code>
  * [.relative](#databaseConfig.path.relative) : <code>string</code>
  * [.absolute](#databaseConfig.path.absolute) : <code>string</code>
  * [.dataDirectory](#databaseConfig.path.dataDirectory) : <code>string</code>

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

* [.options](#databaseConfig.options) : <code>Object</code>
  * [.verbose](#databaseConfig.options.verbose) : <code>boolean</code>
  * [.mode](#databaseConfig.options.mode) : <code>number</code>
  * [.timeout](#databaseConfig.options.timeout) : <code>number</code>
  * [.foreignKeys](#databaseConfig.options.foreignKeys) : <code>boolean</code>
  * [.walMode](#databaseConfig.options.walMode) : <code>boolean</code>
  * [.synchronous](#databaseConfig.options.synchronous) : <code>string</code>
  * [.cacheSize](#databaseConfig.options.cacheSize) : <code>number</code>

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

* [.pool](#databaseConfig.pool) : <code>Object</code>
  * [.max](#databaseConfig.pool.max) : <code>number</code>
  * [.min](#databaseConfig.pool.min) : <code>number</code>
  * [.idleTimeoutMillis](#databaseConfig.pool.idleTimeoutMillis) : <code>number</code>
  * [.acquireTimeoutMillis](#databaseConfig.pool.acquireTimeoutMillis) : <code>number</code>

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

* [.schema](#databaseConfig.schema) : <code>Object</code>
  * [.version](#databaseConfig.schema.version) : <code>string</code>
  * [.targetVersion](#databaseConfig.schema.targetVersion) : <code>string</code>
  * [.autoMigrate](#databaseConfig.schema.autoMigrate) : <code>boolean</code>
  * [.backupBeforeMigration](#databaseConfig.schema.backupBeforeMigration) : <code>boolean</code>
  * [.coreTables](#databaseConfig.schema.coreTables) : <code>Array.&lt;string&gt;</code>
  * [.performanceIndexes](#databaseConfig.schema.performanceIndexes) : <code>Array.&lt;string&gt;</code>

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

* [.performance](#databaseConfig.performance) : <code>Object</code>
  * [.batchSize](#databaseConfig.performance.batchSize) : <code>number</code>
  * [.maxMemoryUsageMB](#databaseConfig.performance.maxMemoryUsageMB) : <code>number</code>
  * [.useTransactions](#databaseConfig.performance.useTransactions) : <code>boolean</code>
  * [.progressReportInterval](#databaseConfig.performance.progressReportInterval) : <code>number</code>
  * [.maxRowsInMemory](#databaseConfig.performance.maxRowsInMemory) : <code>number</code>

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

* [.environment](#databaseConfig.environment) : <code>Object</code>
  * [.development](#databaseConfig.environment.development) : <code>Object</code>
  * [.production](#databaseConfig.environment.production) : <code>Object</code>
  * [.test](#databaseConfig.environment.test) : <code>Object</code>

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

* [.security](#databaseConfig.security) : <code>Object</code>
  * [.enablePathValidation](#databaseConfig.security.enablePathValidation) : <code>boolean</code>
  * [.maxImportFileSize](#databaseConfig.security.maxImportFileSize) : <code>number</code>
  * [.allowedImportExtensions](#databaseConfig.security.allowedImportExtensions) : <code>Array.&lt;string&gt;</code>
  * [.preventSqlInjection](#databaseConfig.security.preventSqlInjection) : <code>boolean</code>

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

* [.maintenance](#databaseConfig.maintenance) : <code>Object</code>
  * [.autoBackupIntervalHours](#databaseConfig.maintenance.autoBackupIntervalHours) : <code>number</code>
  * [.backupRetentionCount](#databaseConfig.maintenance.backupRetentionCount) : <code>number</code>
  * [.enableAutoVacuum](#databaseConfig.maintenance.enableAutoVacuum) : <code>boolean</code>
  * [.vacuumIntervalDays](#databaseConfig.maintenance.vacuumIntervalDays) : <code>number</code>
  * [.analyzeIntervalDays](#databaseConfig.maintenance.analyzeIntervalDays) : <code>number</code>

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

* [websocketConfig](#websocketConfig) : <code>Object</code>
  * [.port](#websocketConfig.port) : <code>number</code>
  * [.options](#websocketConfig.options) : <code>Object</code>
    * [.cors](#websocketConfig.options.cors) : <code>Object</code>
    * [.pingTimeout](#websocketConfig.options.pingTimeout) : <code>number</code>
    * [.pingInterval](#websocketConfig.options.pingInterval) : <code>number</code>
    * [.transports](#websocketConfig.options.transports) : <code>Array.&lt;string&gt;</code>
    * [.upgradeTimeout](#websocketConfig.options.upgradeTimeout) : <code>number</code>
    * [.maxBufferSize](#websocketConfig.options.maxBufferSize) : <code>number</code>
    * [.allowEIO3](#websocketConfig.options.allowEIO3) : <code>boolean</code>
  * [.events](#websocketConfig.events) : <code>Object</code>
  * [.rooms](#websocketConfig.rooms) : <code>Object</code>
    * [.PROGRESS_PREFIX](#websocketConfig.rooms.PROGRESS_PREFIX) : <code>string</code>
    * [.NOTIFICATIONS](#websocketConfig.rooms.NOTIFICATIONS) : <code>string</code>
    * [.ADMIN](#websocketConfig.rooms.ADMIN) : <code>string</code>
  * [.limits](#websocketConfig.limits) : <code>Object</code>
    * [.maxMessageSize](#websocketConfig.limits.maxMessageSize) : <code>number</code>
    * [.messagesPerSecond](#websocketConfig.limits.messagesPerSecond) : <code>number</code>
    * [.maxRoomsPerClient](#websocketConfig.limits.maxRoomsPerClient) : <code>number</code>
  * [.debug](#websocketConfig.debug) : <code>Object</code>
    * [.logConnections](#websocketConfig.debug.logConnections) : <code>boolean</code>
    * [.logRooms](#websocketConfig.debug.logRooms) : <code>boolean</code>
    * [.logProgress](#websocketConfig.debug.logProgress) : <code>boolean</code>

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

* [.options](#websocketConfig.options) : <code>Object</code>
  * [.cors](#websocketConfig.options.cors) : <code>Object</code>
  * [.pingTimeout](#websocketConfig.options.pingTimeout) : <code>number</code>
  * [.pingInterval](#websocketConfig.options.pingInterval) : <code>number</code>
  * [.transports](#websocketConfig.options.transports) : <code>Array.&lt;string&gt;</code>
  * [.upgradeTimeout](#websocketConfig.options.upgradeTimeout) : <code>number</code>
  * [.maxBufferSize](#websocketConfig.options.maxBufferSize) : <code>number</code>
  * [.allowEIO3](#websocketConfig.options.allowEIO3) : <code>boolean</code>

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

* [.rooms](#websocketConfig.rooms) : <code>Object</code>
  * [.PROGRESS_PREFIX](#websocketConfig.rooms.PROGRESS_PREFIX) : <code>string</code>
  * [.NOTIFICATIONS](#websocketConfig.rooms.NOTIFICATIONS) : <code>string</code>
  * [.ADMIN](#websocketConfig.rooms.ADMIN) : <code>string</code>

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

* [.limits](#websocketConfig.limits) : <code>Object</code>
  * [.maxMessageSize](#websocketConfig.limits.maxMessageSize) : <code>number</code>
  * [.messagesPerSecond](#websocketConfig.limits.messagesPerSecond) : <code>number</code>
  * [.maxRoomsPerClient](#websocketConfig.limits.maxRoomsPerClient) : <code>number</code>

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

* [.debug](#websocketConfig.debug) : <code>Object</code>
  * [.logConnections](#websocketConfig.debug.logConnections) : <code>boolean</code>
  * [.logRooms](#websocketConfig.debug.logRooms) : <code>boolean</code>
  * [.logProgress](#websocketConfig.debug.logProgress) : <code>boolean</code>

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
