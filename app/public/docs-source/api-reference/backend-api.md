# Backend API Reference

> Complete reference for HexTrackr's backend architecture, including controllers, services, routes, and server configuration

## Overview

HexTrackr's backend follows a modular Express.js architecture with clear separation of concerns:

- **Controllers** handle HTTP requests and responses
- **Services** contain business logic and data access
- **Routes** define API endpoints and middleware
- **Server** orchestrates initialization and dependency injection

All components use the singleton pattern for consistent state management across the application.

---

## Controllers {#controllers}

Controllers handle incoming HTTP requests, validate input, coordinate with services, and return responses. Each controller follows the singleton pattern for dependency injection.

### VulnerabilityController

**Location:** `app/controllers/vulnerabilityController.js`

The primary controller for vulnerability management, handling everything from CRUD operations to complex CSV imports and statistical analysis.

**Key Features:**

- Full CRUD operations for vulnerability records
- CSV import with progress tracking (supports Tenable, Qualys formats)
- Real-time statistics and VPR score calculations
- Bulk operations for data management
- Integration with WebSocket for live updates

**Main Endpoints:**

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/vulnerabilities/stats` | Returns comprehensive statistics including severity distribution and trends |
| GET | `/api/vulnerabilities` | Lists vulnerabilities with filtering, sorting, and pagination |
| POST | `/api/vulnerabilities` | Creates new vulnerability record |
| PUT | `/api/vulnerabilities/:id` | Updates existing vulnerability |
| DELETE | `/api/vulnerabilities/:id` | Deletes specific vulnerability |
| POST | `/api/vulnerabilities/import` | Imports CSV file with progress tracking |
| DELETE | `/api/vulnerabilities/all` | Clears all vulnerability data |

### TicketController

**Location:** `app/controllers/ticketController.js`

Manages support tickets and associated device tracking.

**Key Features:**

- Complete ticket lifecycle management
- Device association tracking (stored as JSON)
- Status workflow (Open → In Progress → Closed)
- Priority-based sorting and filtering

**Main Endpoints:**

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/tickets` | Lists all tickets with device information |
| GET | `/api/tickets/:id` | Gets specific ticket details |
| POST | `/api/tickets` | Creates new ticket |
| PUT | `/api/tickets/:id` | Updates ticket information |
| PUT | `/api/tickets/:id/devices` | Updates associated devices |
| DELETE | `/api/tickets/:id` | Deletes ticket |

### ImportController

**Location:** `app/controllers/importController.js`

Handles CSV file imports from vulnerability scanners.

**Key Features:**

- Multi-format CSV support (Tenable, Qualys, Rapid7)
- Automatic scan date extraction from filenames
- Progress tracking via WebSocket
- Staging mode for large files (>10,000 rows)
- Duplicate detection and merging

**Main Endpoints:**

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/import/vulnerabilities` | Standard vulnerability import |
| POST | `/api/import/staging` | Staged import for large files |
| GET | `/api/import/progress/:id` | Real-time import progress |

### BackupController

**Location:** `app/controllers/backupController.js`

Database backup and restoration management.

**Key Features:**

- Timestamped backup creation
- Compression support for large databases
- Backup rotation and cleanup
- Validation before restoration

**Main Endpoints:**

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/backup/create` | Creates new backup |
| GET | `/api/backup/list` | Lists available backups |
| POST | `/api/backup/restore` | Restores from backup |
| DELETE | `/api/backup/:filename` | Deletes backup file |

### DocsController

**Location:** `app/controllers/docsController.js`

Serves documentation portal and API documentation.

**Main Endpoints:**

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/docs/stats` | Documentation coverage statistics |

---

## Services {#services}

Services encapsulate business logic and data access. They are injected into controllers during initialization.

### VulnerabilityService

**Location:** `app/services/vulnerabilityService.js`

Core service for vulnerability data operations.

**Responsibilities:**

- Database CRUD operations
- CSV parsing and field mapping
- Data validation and sanitization
- Batch processing for imports
- Snapshot creation for historical tracking

**Key Methods:**

- `getAll()` - Retrieve vulnerabilities with filters
- `create()` - Add new vulnerability
- `update()` - Modify existing record
- `delete()` - Remove vulnerability
- `importBatch()` - Process CSV data in chunks
- `createSnapshot()` - Save point-in-time state

### VulnerabilityStatsService

**Location:** `app/services/vulnerabilityStatsService.js`

Analytics and reporting for vulnerability data.

**Capabilities:**

- VPR (Vulnerability Priority Rating) calculation
- Severity distribution analysis
- Trend analysis over time periods
- Top vulnerabilities by risk
- Plugin family categorization
- Host-based vulnerability grouping

### TicketService

**Location:** `app/services/ticketService.js`

Ticket management and device tracking.

**Features:**

- Full ticket CRUD operations
- Device list management (JSON storage)
- Status transition validation
- Priority-based operations
- Automatic timestamp management

### ImportService

**Location:** `app/services/importService.js`

Vendor CSV import processing with lifecycle management and batch operations.

**Capabilities:**

- CSV parsing with PapaParse
- Field mapping and transformation
- Data type conversion and validation
- Batch processing with configurable size (1000 records)
- Vulnerability lifecycle management (active, grace_period, resolved)
- Deduplication using hostname and plugin_id
- Daily totals calculation with VPR aggregation
- Staging table for atomic imports
- Progress tracking with WebSocket integration
- Multi-vendor support (Tenable, Cisco, Qualys)

**Key Functions:**

- `processStagingToFinalTables()` - Batch processes staged data to production tables
- `calculateAndStoreDailyTotalsEnhanced()` - Calculates per-scan-date statistics with VPR
- `bulkLoadToStagingTable()` - High-performance bulk import to staging
- `extractDateFromFilename()` - Smart date extraction from various filename formats

### BackupService

**Location:** `app/services/backupService.js`

Database backup and restore operations.

**Features:**

- SQLite database copying
- Timestamp-based naming
- Compression with zlib
- Integrity validation
- Restore rollback on failure

### ProgressService

**Location:** `app/services/progressService.js`

Real-time progress tracking for long operations.

**Features:**

- Operation registration and tracking
- Percentage calculation
- ETA estimation
- WebSocket event emission
- Multi-operation support

### DatabaseService

**Location:** `app/services/databaseService.js`

Database connection and query management.

**Responsibilities:**

- Connection pooling
- Query execution
- Transaction management
- Schema migrations
- Error handling and retry logic

### ValidationService

**Location:** `app/services/validationService.js`

Input validation and sanitization.

**Security Features:**

- SQL injection prevention
- XSS protection
- Path traversal blocking
- Type validation
- Range checking

### FileService

**Location:** `app/services/fileService.js`

Secure file operations.

**Features:**

- Upload handling with Multer
- File type verification
- Size limit enforcement
- Temporary file cleanup
- Path validation

---

## Routes {#routes}

Route modules define API endpoints and apply middleware.

### Vulnerability Routes

**File:** `app/routes/vulnerabilities.js`
**Base Path:** `/api/vulnerabilities`

```javascript
GET    /stats                 // Statistics dashboard data
GET    /                      // List vulnerabilities
POST   /                      // Create vulnerability
PUT    /:id                   // Update vulnerability
DELETE /:id                   // Delete vulnerability
POST   /import                // Import CSV
POST   /import/staging        // Staged import
GET    /import/progress/:id   // Import progress
DELETE /all                   // Clear all data
```

### Ticket Routes

**File:** `app/routes/tickets.js`
**Base Path:** `/api/tickets`

```javascript
GET    /                      // List tickets
GET    /:id                   // Get ticket
POST   /                      // Create ticket
PUT    /:id                   // Update ticket
PUT    /:id/devices           // Update devices
DELETE /:id                   // Delete ticket
```

### Import Routes

**File:** `app/routes/imports.js`
**Base Path:** `/api/import`

```javascript
POST   /vulnerabilities       // Import vulnerabilities
GET    /progress/:id          // Check progress
```

### Backup Routes

**File:** `app/routes/backup.js`
**Base Path:** `/api/backup`

```javascript
POST   /create                // Create backup
GET    /list                  // List backups
POST   /restore               // Restore backup
DELETE /:filename             // Delete backup
```

---

## Server Configuration {#server}

### Main Server

**File:** `app/public/server.js`

The main server file orchestrates the entire application using a modular initialization sequence.

**Initialization Order:**

1. Environment configuration loading
2. Database connection establishment
3. Controller initialization with dependencies
4. Service layer configuration
5. Route registration
6. WebSocket server setup
7. Static file serving
8. Error handling middleware

**Core Configuration:**

```javascript
// Server settings
const PORT = process.env.PORT || 8080;
const HOST = "0.0.0.0";

// Security middleware
app.use(helmet());
app.use(compression());
app.use(express.json({ limit: "50mb" }));

// CORS configuration
app.use(cors({
    origin: process.env.ALLOWED_ORIGINS?.split(",") || ["http://localhost:8080"],
    credentials: true
}));

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests
});
```

### WebSocket Integration

Real-time communication for progress updates and live data.

**Events:**

| Event | Direction | Purpose |
|-------|-----------|---------|
| `import-progress` | Server→Client | Import progress updates |
| `vulnerability-added` | Server→Client | New vulnerability notification |
| `operation-complete` | Server→Client | Operation completion |
| `error` | Server→Client | Error notifications |

---

## Database Schema {#database}

### Tables

#### vulnerabilities

Primary table for vulnerability data.

| Column | Type | Description |
|--------|------|-------------|
| id | INTEGER PRIMARY KEY | Auto-incrementing ID |
| plugin_id | TEXT | Scanner plugin identifier |
| cve | TEXT | CVE identifier |
| cvss | REAL | CVSS score |
| risk | TEXT | Risk level (Critical/High/Medium/Low) |
| host | TEXT | Affected host |
| protocol | TEXT | Network protocol |
| port | INTEGER | Port number |
| name | TEXT | Vulnerability name |
| synopsis | TEXT | Brief description |
| description | TEXT | Full description |
| solution | TEXT | Remediation steps |
| plugin_output | TEXT | Scanner output |
| vpr_score | REAL | VPR score |
| scan_date | TEXT | Scan timestamp |
| created_at | TEXT | Record creation |
| updated_at | TEXT | Last modification |

#### tickets

Support ticket tracking.

| Column | Type | Description |
|--------|------|-------------|
| id | INTEGER PRIMARY KEY | Auto-incrementing ID |
| title | TEXT | Ticket title |
| description | TEXT | Full description |
| status | TEXT | Open/In Progress/Closed |
| priority | TEXT | Low/Medium/High/Critical |
| devices | TEXT | JSON array of devices |
| created_at | TEXT | Creation timestamp |
| updated_at | TEXT | Last update |
| closed_at | TEXT | Closure timestamp |

#### vulnerability_imports

Import operation tracking.

| Column | Type | Description |
|--------|------|-------------|
| id | INTEGER PRIMARY KEY | Import ID |
| filename | TEXT | Source filename |
| scan_date | TEXT | Scan date |
| total_items | INTEGER | Total records |
| processed_items | INTEGER | Processed count |
| status | TEXT | pending/processing/completed/failed |
| created_at | TEXT | Start time |
| completed_at | TEXT | End time |

---

## Error Handling

Consistent error handling across all endpoints:

```javascript
// Success response
{
    "success": true,
    "data": { /* response data */ },
    "message": "Operation completed"
}

// Error response
{
    "success": false,
    "error": "Error message",
    "details": "Detailed error information (dev mode only)"
}
```

**HTTP Status Codes:**

- `200` - Success
- `201` - Created
- `400` - Bad request
- `401` - Unauthorized
- `404` - Not found
- `500` - Server error

---

## Security

### Authentication

Currently using session-based authentication with planned JWT migration.

### Input Validation

- All file paths validated with PathValidator
- SQL queries use parameterized statements
- HTML content escaped before storage
- File uploads restricted by type and size

### Rate Limiting

Configurable per-endpoint limits to prevent abuse.

### CORS Policy

Whitelist-based origin control with credentials support.

---

## Environment Variables

```bash
# Server Configuration
PORT=8080
HOST=0.0.0.0
NODE_ENV=production

# Database
DATABASE_PATH=data/hextrackr.db

# Security
ALLOWED_ORIGINS=http://localhost:8080
SESSION_SECRET=your-secret-key

# File Handling
MAX_FILE_SIZE=100MB
UPLOAD_DIR=uploads
BACKUP_DIR=backups

# Features
ENABLE_WEBSOCKET=true
ENABLE_COMPRESSION=true
```
