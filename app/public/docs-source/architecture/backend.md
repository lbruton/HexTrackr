# Backend Architecture

The backend is a modular Node.js/Express application providing REST endpoints, rollover ingestion, documentation delivery, and SQLite persistence. It serves the static frontend pages (`tickets.html`, `vulnerabilities.html`) and the generated documentation portal (`/docs-html`).

---

## Key Characteristics

- **Modular Architecture**: `server.js` (~205 lines) orchestrates modular components across multiple directories.
- **Separation of Concerns**: Controllers, services, routes, and configuration are cleanly separated.
- **Unified Delivery**: API + static assets + docs from one process.
- **Embedded DB**: Single SQLite file (`data/hextrackr.db`). No external service dependency.
- **Security Utilities**: Extracted `PathValidator` class for safe file operations + security headers.

---

## Core Components

| Component | Purpose | Location |
| --------- | ------- | -------- |
| `server.js` | Main application runtime (orchestration + initialization) | `/app/public/` |
| **Controllers** | Business logic (mixed patterns - see Controller Patterns section) | `/app/controllers/` |
| **Services** | Data access and business services | `/app/services/` |
| **Routes** | Express route definitions | `/app/routes/` |
| **Configuration** | Database, middleware, websocket configs | `/app/config/` |
| **Utilities** | PathValidator, ProgressTracker, helpers | `/app/utils/` |
| `init-database.js` | Bootstrap base schema & indexes | `/app/public/scripts/` |
| Rate Limiting | IP-based request throttling (100 req/15min) | Express middleware |

### Module Organization

| Directory | Contents | Pattern |
| --------- | -------- | ------- |
| `/app/controllers/` | 5 controller modules | Mixed (3 singleton, 2 functional) |
| `/app/services/` | 10 service modules | Functional exports |
| `/app/routes/` | 5 route definition files | Express router pattern |
| `/app/config/` | 4 configuration modules | Module exports |
| `/app/middleware/` | 4 middleware modules | Express middleware pattern |
| `/app/utils/` | 4 utility modules | Static class methods |

### Controller Files

| Controller | Pattern | Methods | Dependency Injection |
| ---------- | ------- | ------- | -------------------- |
| `vulnerabilityController.js` | Singleton | 14 static methods | `initialize(db, progressTracker)` |
| `ticketController.js` | Singleton | 7 static methods | `initialize(db)` |
| `backupController.js` | Singleton | 6 static methods | `initialize(db)` |
| `importController.js` | Functional | 6 exported functions | `setProgressTracker(tracker)` |
| `docsController.js` | Instance | 2 wrapped methods | Direct instantiation |

### Service Files

| Service | Purpose | Key Methods |
| ------- | ------- | ----------- |
| `databaseService.js` | Core database operations | `getDb()`, `runQuery()`, `transaction()` |
| `vulnerabilityService.js` | Vulnerability CRUD operations | `getVulnerabilities()`, `createVulnerability()` |
| `vulnerabilityStatsService.js` | Statistics and aggregations | `getStats()`, `getTrends()` |
| `ticketService.js` | Ticket CRUD operations | `getTickets()`, `createTicket()` |
| `importService.js` | Import business logic | `processVulnerabilitiesWithLifecycle()`, `bulkLoadToStagingTable()` |
| `backupService.js` | Backup/restore operations | `getBackupStats()`, `restoreBackup()` |
| `docsService.js` | Documentation statistics | `computeStats()`, `computeApiEndpoints()` |
| `fileService.js` | File system operations | `readFile()`, `writeFile()` |
| `progressService.js` | WebSocket progress tracking | `createSession()`, `updateProgress()` |
| `validationService.js` | Input validation and sanitization | `validateVulnerability()`, `sanitizeInput()` |

---

## Controller Patterns

The backend uses two distinct controller patterns, with ongoing migration toward singleton pattern for consistency:

### Singleton Pattern Controllers

Three controllers (`VulnerabilityController`, `TicketController`, `BackupController`) implement the singleton pattern:

```javascript
class VulnerabilityController {
    static instance = null;

    static initialize(database, progressTracker) {
        if (!VulnerabilityController.instance) {
            VulnerabilityController.instance = new VulnerabilityController();
        }
        VulnerabilityController.instance.db = database;
        VulnerabilityController.instance.progressTracker = progressTracker;
        return VulnerabilityController.instance;
    }

    static getInstance() {
        if (!VulnerabilityController.instance) {
            throw new Error("Controller not initialized. Call initialize() first.");
        }
        return VulnerabilityController.instance;
    }

    // All route methods are static and use getInstance()
    static async getStats(req, res) {
        const controller = VulnerabilityController.getInstance();
        // Implementation...
    }
}
```

**Characteristics:**
- Static `initialize()` method for dependency injection
- Static `getInstance()` method for retrieving singleton
- All route methods are static
- Throws error if accessed before initialization

### Functional Pattern Controllers

Two controllers (`ImportController`, `DocsController`) use different patterns:

**ImportController (Functional exports):**
```javascript
let progressTracker = null;

function setProgressTracker(tracker) {
    progressTracker = tracker;
}

async function importVulnerabilities(req, res) {
    // Direct function implementation
}

module.exports = {
    setProgressTracker,
    importVulnerabilities,
    // Other functions...
};
```

**DocsController (Instance-based):**
```javascript
class DocsController {
    constructor() {
        // Direct instantiation
    }

    async getStats() {
        // Instance method
    }
}

const docsController = new DocsController();

module.exports = {
    getStats: () => docsController.getStats(),
    // Wrapped methods...
};
```

### Migration Status

| Controller | Current Pattern | Target Pattern | Priority |
| ---------- | -------------- | -------------- | -------- |
| ImportController | Functional | Singleton | High - Complex dependencies |
| DocsController | Instance | Singleton | Low - Simple controller |

---

## Initialization Sequence

**CRITICAL**: The initialization order is crucial for proper dependency injection. Controllers must be initialized BEFORE routes are imported.

```javascript
async function startServer() {
    // 1. Initialize database FIRST
    await initDb();
    const db = getDatabase();

    // 2. Initialize utilities
    const progressTracker = new ProgressTracker(io);

    // 3. Initialize ALL controllers with dependencies
    // ORDER MATTERS - initialize before importing routes!
    VulnerabilityController.initialize(db, progressTracker);
    TicketController.initialize(db);
    BackupController.initialize(db);

    // For functional controllers
    ImportController.setProgressTracker(progressTracker);

    // 4. NOW import routes (after controllers are ready)
    const vulnerabilityRoutes = require("../routes/vulnerabilities");
    const ticketRoutes = require("../routes/tickets");
    const backupRoutes = require("../routes/backup");
    const importRoutes = require("../routes/imports");
    const docsRoutes = require("../routes/docs");

    // 5. Mount routes on Express app
    app.use("/api/vulnerabilities", vulnerabilityRoutes);
    app.use("/api/tickets", ticketRoutes);
    app.use("/api/backup", backupRoutes);
    app.use("/api", importRoutes);  // Import routes at root API level
    app.use("/api/docs", docsRoutes);

    // 6. Start server
    server.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}
```

### Common Initialization Errors

| Error | Cause | Solution |
| ----- | ----- | -------- |
| "Controller not initialized" | Routes imported before controller initialization | Follow initialization sequence |
| "Cannot read property 'db' of undefined" | Controller accessed before `initialize()` called | Ensure `initialize()` called first |
| "progressTracker is null" | ImportController used before `setProgressTracker()` | Call `setProgressTracker()` during init |
| Empty API responses | Database not initialized before controllers | Await database initialization |

### PathValidator Security Class

```javascript
class PathValidator {
  static validatePath(filePath) {
    // Path normalization
    const normalizedPath = path.normalize(filePath);

    // Traversal attack prevention
    if (normalizedPath.includes("../") || normalizedPath.includes("..\\")) {
      throw new Error("Path traversal detected");
    }

    // Component validation
    const pathComponents = normalizedPath.split(path.sep);
    for (const component of pathComponents) {
      if (component === ".." || (component === "." && pathComponents.length > 1)) {
        throw new Error("Invalid path component");
      }
    }

    return normalizedPath;
  }
}
```

**Security Features**:

- Path normalization before validation
- Directory traversal attack prevention
- Component-level validation
- Safe file operation wrappers
- Exception-based error handling

---

## Middleware & Infrastructure

| Concern | Implementation |
| ------- | -------------- |
| CORS | `cors()` (open by default) |
| Compression | `compression()` |
| Parsing | `express.json` & `express.urlencoded` (100MB limit) |
| Uploads | `multer` (CSV import; 100 MB cap) |
| Security Headers | `X-Content-Type-Options`, `X-Frame-Options`, `X-XSS-Protection` |
| Static Assets | `express.static` (root + `docs-html/`) |

---

## Persistence & Schema Evolution

- **Initialization**: If DB missing, runs `scripts/init-database.js`.
- **Runtime Evolution**: Idempotent `ALTER TABLE` adds new columns (`vendor`, `vulnerability_date`, `state`, `import_date`, etc.) to legacy tables for backward compatibility.
- **Rollover Tables**: Created on startup if absent (`vulnerability_snapshots`, `vulnerabilities_current`, `vulnerability_daily_totals`).

See: [Data Model](./data-model.md) for exhaustive schema & index inventory.

---

## Vulnerability Rollover Workflow

Purpose: Maintain real-time deduplicated active set + full historical timeline + fast daily aggregates.

### CSV Import (Rollover Path)

```mermaid
sequenceDiagram
    participant User
    participant API as server.js
    participant DB as SQLite

    User->>API: POST /api/vulnerabilities/import (multipart/form-data + optional scanDate)
    API->>API: Parse CSV (PapaParse, filter empty rows)
    API->>DB: INSERT vulnerability_imports
    API->>DB: UPDATE vulnerabilities_current (mark potentially stale)
    loop Each row (sequential to prevent race conditions)
        API->>API: Map + generate unique_key
        API->>DB: INSERT vulnerability_snapshots
        API->>DB: INSERT or UPDATE vulnerabilities_current
    end
    API->>DB: DELETE stale rows (not seen in this scan)
    API->>DB: INSERT OR REPLACE vulnerability_daily_totals
    API-->>User: { importId, insertCount, updateCount, removedStale, scanDate, performanceMetrics }
```

> **Staging importer**: `POST /api/vulnerabilities/import-staging` follows the same steps but first bulk loads data into `vulnerability_staging` and streams `ProgressTracker` events (`progress-update`, `progress-complete`, `progress-error`).

### Enhanced Deduplication System

HexTrackr implements a sophisticated 4-tier unique key generation strategy:

**Tier 1: Asset ID + Plugin ID** (Highest Reliability)

```javascript
if (mapped.assetId && mapped.pluginId) {
  return `asset:${mapped.assetId}|plugin:${mapped.pluginId}`;
}
```

**Tier 2: CVE + Hostname/IP** (CVE-based)

```javascript
if (mapped.cve && mapped.cve.trim()) {
  const hostIdentifier = normalizedIP || normalizedHostname;
  return `cve:${mapped.cve.trim()}|host:${hostIdentifier}`;
}
```

**Tier 3: Plugin ID + Hostname/IP + Vendor** (User-requested approach)

```javascript
if (mapped.pluginId && mapped.pluginId.trim()) {
  const hostIdentifier = normalizedIP || normalizedHostname;
  const vendor = mapped.vendor || "unknown";
  return `plugin:${mapped.pluginId.trim()}|host:${hostIdentifier}|vendor:${vendor}`;
}
```

**Tier 4: Description Hash + Hostname/IP** (Fallback)

```javascript
const descriptionHash = createDescriptionHash(mapped.description);
const hostIdentifier = normalizedIP || normalizedHostname;
return `desc:${descriptionHash}|host:${hostIdentifier}`;
```

### Key Safeguards

| Risk | Mitigation |
| ---- | ---------- |
| Row duplication in batch | In-memory `Set` of processed unique_keys |
| Race conditions | Explicit sequential loop with `processNextRow(index)` pattern |
| Data drift | Historical record preserved in snapshots before updates |
| Performance | Indexes on `unique_key`, `scan_date`, severities |
| **Key conflicts** | **4-tier unique key generation with reliability scoring** |
| **Memory leaks** | **Session-based processing with automatic cleanup** |
| **Hostname variations** | **Hostname normalization (domain stripping, case insensitive)** |
| **IP address formats** | **IP normalization and validation** |

---

## API Surface (High-Level)

| Domain | Endpoints | Documentation |
| ------ | --------- | ------------- |
| Health | `GET /health` | System health check |
| Vulnerabilities | 14 endpoints for CRUD, stats, trends | [Vulnerabilities API](../api-reference/vulnerabilities-api.md) |
| Imports | 6 endpoints for CSV/JSON imports | [Import API](../api-reference/imports-api.md) |
| Tickets | 7 endpoints for CRUD and migration | [Tickets API](../api-reference/tickets-api.md) |
| Backup/Restore | 6 endpoints for backup operations | [Backup API](../api-reference/backup-api.md) |
| Documentation | Stats and portal delivery | [Docs API](../api-reference/complete-reference.md#documentation) |
| Reference | Sites and locations lookup | [Reference Data](../api-reference/complete-reference.md#reference-data) |

### API Endpoint Summary

- **Total Endpoints**: ~45 REST endpoints
- **Import System**: 6 dedicated import endpoints (see [Import API](../api-reference/imports-api.md))
- **WebSocket**: Separate progress tracking on port 8988
- **Rate Limited**: 100 requests per 15 minutes per IP

---

## Real-time Communication (WebSocket)

### ProgressTracker Architecture

HexTrackr implements a sophisticated WebSocket-based progress tracking system through the `ProgressTracker` class:

- **Port**: 8988 (separate from REST API)
- **Library**: Socket.io with enhanced session management
- **Session Management**: UUID-based sessions with metadata tracking
- **Throttling**: 100ms minimum interval between progress events
- **Auto-cleanup**: 30-minute session timeout with automatic garbage collection

### ProgressTracker Features

```javascript
class ProgressTracker {
  constructor(io) {
    this.sessions = new Map();
    this.eventThrottle = new Map();
    this.THROTTLE_INTERVAL = 100;
    this.SESSION_CLEANUP_INTERVAL = 30 * 60 * 1000;
  }
}
```

**Key Capabilities**:

- Session-based progress tracking with unique identifiers
- Throttled event emission to prevent client overload
- Metadata persistence for operation context
- Automatic session cleanup for memory management
- Error handling with graceful degradation

### WebSocket Events

| Event Type | Purpose | Throttled |
|------------|---------|----------|
| `import_progress` | CSV import progress updates | Yes (100ms) |
| `import_complete` | Import operation completion | No |
| `import_error` | Import operation errors | No |
| `session_created` | New session establishment | No |
| `session_cleanup` | Session removal notification | No |

### Session Lifecycle

```mermaid
sequenceDiagram
    participant Client
    participant ProgressTracker
    participant Import as Import Process

    Client->>ProgressTracker: Connect to WebSocket
    ProgressTracker->>ProgressTracker: createSession(metadata)
    ProgressTracker-->>Client: session_created event

    Import->>ProgressTracker: updateProgress(sessionId, progress)
    ProgressTracker->>ProgressTracker: throttleCheck()
    alt Progress not throttled
        ProgressTracker-->>Client: import_progress event
    end

    Import->>ProgressTracker: completeSession(sessionId)
    ProgressTracker-->>Client: import_complete event
    ProgressTracker->>ProgressTracker: cleanup(sessionId)
```

For more details, see the [WebSocket API documentation](../api-reference/websocket-api.md).

---

## Pagination Flow (Current Vulnerabilities)

```mermaid
sequenceDiagram
    participant UI
    participant API as server.js
    participant DB as SQLite
    UI->>API: GET /api/vulnerabilities?page=1&limit=50
    API->>DB: SELECT filtered rows FROM vulnerabilities_current LIMIT/OFFSET
    DB-->>API: Row batch
    API->>DB: SELECT COUNT(*) (same filters)
    DB-->>API: Total
    API-->>UI: { data, pagination }
```

---

## Legacy vs Rollover Paths

| Aspect | Legacy `vulnerabilities` | Rollover Tables |
| ------ | ------------------------ | --------------- |
| Purpose | Early ingestion & export | Current production analytics |
| Dedupe | Unique per (hostname, cve, import_date) index | Algorithmic unique_key with hostname normalization |
| History | Implicit (one row per scan) | Explicit snapshots + daily aggregates |
| Future | To be deprecated | Strategic direction |

---

## Utility Endpoints

- **`GET /health`**: `{ status, version, db, uptime }`
- **`GET /api/docs/stats`**: Counts routes + approximates function definitions.
- **Backup**: Returns structured JSON (vulnerabilities legacy + tickets) or combined.

---

## Security & Hardening

### Current Security Implementations

| Concern | Implementation | Details |
| ------- | -------------- | ------- |
| **Path Traversal** | `PathValidator` class | Comprehensive path validation and safe file operations |
| **Rate Limiting** | Express rate limit middleware | 100 requests per 15-minute window per IP |
| **Upload Security** | Multer with size limits | 50MB cap with file type validation |
| **XSS Prevention** | Security headers | `X-Content-Type-Options`, `X-Frame-Options`, `X-XSS-Protection` |
| **SQL Injection** | Parameterized queries | All database operations use prepared statements |
| **CORS Protection** | Configurable CORS | Default: all origins (configurable for production) |
| **Input Sanitization** | DOMPurify integration | Client-side XSS prevention |

### PathValidator Security Features

```javascript
// Safe file operations with built-in validation
PathValidator.safeReadFileSync(filePath, options)
PathValidator.safeWriteFileSync(filePath, data, options)
PathValidator.safeReaddirSync(dirPath, options)
PathValidator.safeStatSync(filePath)
PathValidator.safeExistsSync(filePath)
PathValidator.safeUnlinkSync(filePath)
```

**Protection Mechanisms**:

- Path normalization before validation
- Directory traversal detection (`../`, `..\\`)
- Component-level path validation
- Exception-based error handling
- Graceful fallbacks for invalid paths

### Rate Limiting Configuration

```javascript
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP',
  standardHeaders: true,
  legacyHeaders: false
});
```

### Future Security Enhancements

| Concern | Planned |
| ------- | ------- |
| Authentication | JWT-based authentication with role-based access control |
| API Security | API key authentication for external integrations |
| Audit Logging | Central audit logging of security events and rejections |
| TLS | Built-in HTTPS support with automatic certificate management |
| Input Validation | JSON schema (Ajv) enforcement for all API endpoints |
| Structured Logging | Structured JSON logging with request IDs and correlation |
| Vulnerability Scanning | Automated dependency vulnerability scanning |
| Secret Management | Environment-based secret management with rotation |

---

## Planned Enhancements

### Observability & Monitoring

| Area | Enhancement | Priority |
| ---- | ---------- | -------- |
| **Metrics** | Prometheus metrics (import latency, row counts, session tracking) | High |
| **Tracing** | OpenTelemetry integration for distributed tracing | Medium |
| **Health Checks** | Enhanced health endpoints with dependency checking | High |
| **Performance** | APM integration for bottleneck identification | Medium |

### Architecture & Modularity

| Area | Enhancement | Priority |
| ---- | ---------- | -------- |
| **Modularization** | Extract ProgressTracker, PathValidator, and rollover modules | High |
| **Microservices** | Split WebSocket server into separate service | Medium |
| **Database** | PostgreSQL migration for scalability | Low |
| **Caching** | Redis integration for session and data caching | Medium |

### Data Quality & Validation

| Area | Enhancement | Priority |
| ---- | ---------- | -------- |
| **Schema Validation** | JSON schema (Ajv) enforcement for all API endpoints | High |
| **CVE Validation** | Real-time CVE format and existence validation | Medium |
| **Severity Normalization** | Automatic severity enumeration mapping | High |
| **Data Quality Scoring** | Automated data quality metrics and reporting | Medium |

### Legacy Migration

| Area | Enhancement | Priority |
| ---- | ---------- | -------- |
| **Legacy Deprecation** | Retire legacy vulnerabilities table and endpoints | High |
| **Data Migration** | Automated migration from legacy to rollover architecture | High |
| **API Versioning** | Implement API versioning for backward compatibility | Medium |

### Testing & Quality Assurance

| Area | Enhancement | Priority |
| ---- | ---------- | -------- |
| **E2E Testing** | Playwright integration tests for all major workflows | High |
| **API Contract Testing** | OpenAPI-based contract validation | High |
| **Load Testing** | Automated performance testing with realistic data volumes | Medium |
| **Security Testing** | Automated security scanning and penetration testing | High |

---

## Summary

The backend favors simplicity (single process, embedded DB) while implementing a robust rollover pipeline for vulnerability lifecycle tracking. Incremental improvements will focus on modularity, observability, and deprecating legacy ingestion paths.
