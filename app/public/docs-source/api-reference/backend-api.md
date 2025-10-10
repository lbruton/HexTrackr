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

### KevController

**Location:** `app/controllers/kevController.js`
**Since:** v1.0.22

Manages CISA Known Exploited Vulnerabilities (KEV) integration and synchronization.

**Key Features:**

- Automatic daily synchronization with CISA KEV catalog
- Conflict detection and resolution for concurrent sync requests
- Comprehensive error handling and retry logic
- Real-time sync status tracking
- Integration with vulnerability matching system

**Main Endpoints:**

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/kev/sync` | Trigger manual KEV synchronization from CISA |
| GET | `/api/kev/status` | Get current sync status and statistics |
| GET | `/api/kev/vulnerability/:cveId` | Get KEV details for specific CVE |

### AuthController

**Location:** `app/controllers/authController.js`
**Since:** v1.0.46

Handles user authentication, session management, and security features including CSRF protection and account lockout.

**Key Features:**

- **Argon2id Password Hashing** - Industry-standard secure password storage with timing-safe comparison
- **Session Management** - SQLite-backed session store with configurable expiration (24h/30d)
- **Account Lockout Protection** - 5 failed login attempts trigger 15-minute lockout
- **CSRF Token Generation** - Stateless double-submit cookie pattern for state-changing requests
- **Profile Management** - User profile retrieval and password change functionality

**Security Architecture:**

- Passwords hashed with Argon2id (time cost: 2, memory cost: 19MB, parallelism: 1)
- Sessions stored in SQLite with automatic cleanup of expired sessions
- Failed login attempts tracked per username with automatic expiry
- Trust proxy enabled for nginx reverse proxy X-Forwarded-Proto headers
- Secure cookies require HTTPS in production

**Main Endpoints:**

| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| POST | `/api/auth/login` | ❌ Public | Authenticate user with username/password |
| POST | `/api/auth/logout` | ✅ Protected | End user session and clear cookies |
| GET | `/api/auth/status` | ❌ Public | Check current authentication status |
| GET | `/api/auth/csrf` | ❌ Public | Retrieve CSRF token for forms |
| POST | `/api/auth/change-password` | ✅ Protected | Update user password (requires current password) |
| GET | `/api/auth/profile` | ✅ Protected | Get current user profile information |

**Login Request Example:**

```javascript
POST /api/auth/login
Content-Type: application/json

{
  "username": "admin",
  "password": "secure-password"
}
```

**Login Response (Success):**

```javascript
{
  "success": true,
  "user": {
    "id": 1,
    "username": "admin",
    "email": "admin@hextrackr.local",
    "created_at": "2025-10-04T12:00:00.000Z"
  },
  "message": "Login successful"
}
```

**Login Response (Account Locked):**

```javascript
{
  "success": false,
  "error": "Account temporarily locked due to too many failed login attempts. Please try again in 15 minutes.",
  "lockoutRemaining": 892 // seconds
}
```

**Status Check Response:**

```javascript
GET /api/auth/status

{
  "authenticated": true,
  "user": {
    "id": 1,
    "username": "admin",
    "email": "admin@hextrackr.local"
  }
}
```

**Change Password Request:**

```javascript
POST /api/auth/change-password
Content-Type: application/json
X-CSRF-Token: <token-from-csrf-endpoint>

{
  "currentPassword": "old-password",
  "newPassword": "new-secure-password"
}
```

### PreferencesController

**Location:** `app/controllers/preferencesController.js`
**Since:** v1.0.48

Manages user-specific preferences and application settings with flexible JSON value storage.

**Key Features:**

- User-scoped preference management (isolated per user)
- Flexible JSON value storage for complex data structures
- Transaction support for atomic bulk updates
- Automatic timestamp tracking (created_at, updated_at)
- Validation for preference key format and value structure

**Main Endpoints:**

| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| GET | `/api/preferences` | ✅ Protected | Get all preferences for current user |
| GET | `/api/preferences/:key` | ✅ Protected | Get specific preference by key |
| POST | `/api/preferences` | ✅ Protected | Create new preference |
| PUT | `/api/preferences/:key` | ✅ Protected | Update existing preference |
| DELETE | `/api/preferences/:key` | ✅ Protected | Delete specific preference |
| POST | `/api/preferences/bulk` | ✅ Protected | Bulk update multiple preferences (transaction) |
| DELETE | `/api/preferences` | ✅ Protected | Delete all user preferences |
| POST | `/api/preferences/reset` | ✅ Protected | Reset preferences to defaults |

**Preference Object Structure:**

```javascript
{
  "id": 1,
  "user_id": 1,
  "key": "dashboard.theme",
  "value": {"mode": "dark", "accent": "blue"},
  "created_at": "2025-10-04T12:00:00.000Z",
  "updated_at": "2025-10-04T14:30:00.000Z"
}
```

**Common Preference Keys:**

- `dashboard.theme` - UI theme settings
- `dashboard.defaultView` - Default dashboard view (grid/cards)
- `vulnerabilities.filters` - Saved filter configurations
- `notifications.enabled` - Notification preferences
- `export.defaultFormat` - Default export format

**Bulk Update Example:**

```javascript
POST /api/preferences/bulk
Content-Type: application/json
X-CSRF-Token: <token>

{
  "preferences": [
    {"key": "dashboard.theme", "value": {"mode": "dark"}},
    {"key": "dashboard.defaultView", "value": "grid"},
    {"key": "notifications.enabled", "value": true}
  ]
}
```

### TemplateController

**Location:** `app/controllers/templateController.js`
**Since:** v1.0.21

Manages email and ticket templates for consistent communication and ticket creation.

**Key Features:**

- Template CRUD operations for email and ticket templates
- Variable substitution system for dynamic content
- Template categories (email, ticket, notification)
- Version tracking for template changes
- Default template management

**Main Endpoints:**

| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| GET | `/api/templates` | ✅ Protected | List all templates |
| GET | `/api/templates/:id` | ✅ Protected | Get specific template |
| POST | `/api/templates` | ✅ Protected | Create new template |
| PUT | `/api/templates/:id` | ✅ Protected | Update template |
| DELETE | `/api/templates/:id` | ✅ Protected | Delete template |
| GET | `/api/templates/category/:category` | ✅ Protected | Get templates by category |
| POST | `/api/templates/:id/render` | ✅ Protected | Render template with variables |

**Template Object Structure:**

```javascript
{
  "id": 1,
  "name": "Critical Vulnerability Alert",
  "category": "email",
  "subject": "Critical Vulnerability Detected: {{cve_id}}",
  "body": "A critical vulnerability has been detected...",
  "variables": ["cve_id", "hostname", "severity"],
  "created_at": "2025-10-04T12:00:00.000Z",
  "updated_at": "2025-10-04T14:30:00.000Z"
}
```

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

### CacheService

**Location:** `app/services/cacheService.js`
**Since:** v1.0.42

Multi-tier caching service for optimizing API response times and reducing database load.

**Key Features:**

- Three specialized cache zones with independent TTL configurations
- Server-side caching (NodeCache) with configurable expiration
- Browser cache control via HTTP headers
- Cache hit/miss tracking for monitoring
- Automatic cache invalidation on data changes
- Clone-based storage to prevent cache mutations

**Cache Zones:**

| Zone | TTL | Use Case | Max Keys |
|------|-----|----------|----------|
| **Stats Cache** | 5 minutes | Severity counts, VPR totals, dashboard statistics | 100 |
| **Trends Cache** | 10 minutes | Historical data, dashboard cards, trend analysis | 100 |
| **Vulnerability Cache** | 10 minutes | Full vulnerability lists, device statistics | 50 |

**Core Methods:**

- `withCaching(res, cacheType, cacheKey, serverTTL, handler, browserTTL)` - Universal caching wrapper for route handlers
- `getStats(key)` / `setStats(key, value, ttl)` - Stats cache operations
- `getTrends(key)` / `setTrends(key, value, ttl)` - Trends cache operations
- `getVulnerabilities(key)` / `setVulnerabilities(key, value, ttl)` - Vulnerability cache operations
- `invalidate(zone)` - Clear specific cache zone on data changes
- `getCacheStats()` - Retrieve hit/miss statistics for monitoring

**Usage Example:**

```javascript
// In controller route handler
await cacheService.withCaching(res, "stats", "device_statistics", 300, async () => {
    return await vulnerabilityService.getDeviceStatistics();
}, 60); // Server: 5min, Browser: 60s
```

**Cache Headers:**

- `X-Cache: HIT` - Response served from cache
- `X-Cache: MISS` - Response generated fresh, now cached
- `Cache-Control: public, max-age=<browserTTL>, must-revalidate` - Browser caching directive

### KevService

**Location:** `app/services/kevService.js`
**Since:** v1.0.22

CISA Known Exploited Vulnerabilities data management and synchronization.

**Key Features:**

- Daily automatic synchronization with CISA KEV API
- CVE-based vulnerability matching and flagging
- Sync status tracking and error handling
- Local KEV catalog caching for performance
- Integration with vulnerability database

**Core Methods:**

- `syncKevData()` - Fetch and process CISA KEV catalog
- `getSyncStatus()` - Current synchronization status
- `getKevByCve(cveId)` - Retrieve KEV details for specific CVE
- `matchVulnerabilities()` - Update vulnerability KEV flags
- `scheduleAutoSync()` - Configure automatic sync intervals

### AuthService

**Location:** `app/services/authService.js`
**Since:** v1.0.46

Core authentication logic including password verification, session management, and account security.

**Key Features:**

- **Argon2id Password Hashing** - Time cost: 2, Memory cost: 19456KB, Parallelism: 1
- **Timing-Safe Password Comparison** - Prevents timing attacks during verification
- **Failed Login Tracking** - In-memory store with automatic expiry (15 minutes)
- **Account Lockout Management** - 5 attempts trigger 15-minute lockout
- **Session Lifecycle** - Creation, validation, destruction with configurable TTL

**Core Methods:**

- `verifyPassword(username, password)` - Authenticate user credentials with lockout check
- `hashPassword(password)` - Generate Argon2id hash for new passwords
- `createSession(userId, username)` - Initialize user session
- `validateSession(sessionId)` - Verify active session
- `destroySession(sessionId)` - End user session
- `checkAccountLockout(username)` - Verify if account is locked
- `recordFailedLogin(username)` - Increment failed login counter
- `resetFailedLogins(username)` - Clear failed login tracking on success

**Security Configuration:**

```javascript
// Argon2id parameters
{
  type: argon2.argon2id,
  timeCost: 2,        // Number of iterations
  memoryCost: 19456,  // Memory in KB (19MB)
  parallelism: 1,     // Number of threads
  hashLength: 32      // Output hash length
}

// Account lockout policy
{
  maxAttempts: 5,
  lockoutDuration: 900000  // 15 minutes in ms
}
```

**Failed Login Tracking:**

```javascript
{
  username: {
    attempts: 3,
    firstAttempt: 1696435200000,
    lastAttempt: 1696435260000
  }
}
```

### PreferencesService

**Location:** `app/services/preferencesService.js`
**Since:** v1.0.48

User preference management with flexible JSON value storage and transaction support.

**Key Features:**

- User-scoped preference isolation (each user has independent preferences)
- JSON value serialization/deserialization for complex data structures
- Transaction support for atomic bulk updates
- Automatic timestamp management (created_at, updated_at)
- Key validation and sanitization

**Core Methods:**

- `getUserPreferences(userId)` - Retrieve all preferences for user
- `getPreference(userId, key)` - Get specific preference value
- `setPreference(userId, key, value)` - Create or update preference
- `deletePreference(userId, key)` - Remove specific preference
- `bulkUpdatePreferences(userId, preferences)` - Atomic multi-preference update (transaction)
- `resetToDefaults(userId)` - Clear all preferences and restore defaults
- `validatePreferenceKey(key)` - Ensure key follows naming convention

**Transaction Pattern:**

```javascript
// Bulk update uses SQLite transaction for atomicity
db.transaction(() => {
  preferences.forEach(({key, value}) => {
    db.prepare('INSERT OR REPLACE INTO preferences...').run(userId, key, JSON.stringify(value));
  });
});
```

### DocsService

**Location:** `app/services/docsService.js`
**Since:** v1.0.38

Documentation statistics and coverage analysis.

**Key Features:**

- JSDoc coverage calculation
- File type distribution analysis
- Documentation completeness metrics
- API endpoint inventory

**Core Methods:**

- `getDocumentationStats()` - Calculate comprehensive documentation metrics
- `analyzeJSDocCoverage()` - Determine percentage of documented functions
- `getFileTypeCounts()` - Breakdown of file types in codebase
- `getEndpointInventory()` - List all API routes with documentation status

---

## Routes {#routes}

Route modules define API endpoints and apply middleware.

### Vulnerability Routes

**File:** `app/routes/vulnerabilities.js`
**Base Path:** `/api/vulnerabilities`

```javascript
GET    /stats                 // Statistics dashboard data (supports vendor filtering)
GET    /recent-trends         // Historical vulnerability trends (supports vendor filtering)
GET    /                      // List vulnerabilities
POST   /                      // Create vulnerability
PUT    /:id                   // Update vulnerability
DELETE /:id                   // Delete vulnerability
POST   /import                // Import CSV
POST   /import/staging        // Staged import
GET    /import/progress/:id   // Import progress
DELETE /all                   // Clear all data
```

**Vendor Filtering (Since v1.0.53):**

The `/stats` and `/recent-trends` endpoints support vendor-based filtering via query parameter:

```javascript
// Get statistics for all vendors (default)
GET /api/vulnerabilities/stats

// Get statistics for Cisco devices only
GET /api/vulnerabilities/stats?vendor=CISCO

// Get statistics for Palo Alto devices
GET /api/vulnerabilities/stats?vendor=Palo%20Alto

// Get statistics for other vendors
GET /api/vulnerabilities/stats?vendor=Other
```

**Vendor Values:**
- `` (empty) - All vendors (default)
- `CISCO` - Cisco Systems devices
- `Palo Alto` - Palo Alto Networks devices
- `Other` - All other vendors

**Response Format (with vendor filter):**

```javascript
{
  "success": true,
  "stats": {
    "vendor": "CISCO",  // null if no filter applied
    "total": 1245,
    "vprTotal": 8934.5,
    "severityCounts": {
      "Critical": 45,
      "High": 234,
      "Medium": 456,
      "Low": 510
    },
    "hasKev": 12
  }
}
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

### KEV Routes

**File:** `app/routes/kev.js`
**Base Path:** `/api/kev`
**Since:** v1.0.22

```javascript
POST   /sync                  // Manual KEV synchronization
GET    /status                // Sync status and statistics
GET    /vulnerability/:cveId  // KEV details for specific CVE
```

### Authentication Routes

**File:** `app/routes/auth.js`
**Base Path:** `/api/auth`
**Since:** v1.0.46

```javascript
// Public endpoints (no authentication required)
POST   /login                 // User login with username/password
GET    /status                // Check authentication status
GET    /csrf                  // Get CSRF token for forms

// Protected endpoints (require authentication)
POST   /logout                // User logout (clears session)
POST   /change-password       // Update user password
GET    /profile               // Get current user profile
```

**Middleware:**
- `requireAuth` applied to `/logout`, `/change-password`, `/profile`
- CSRF validation required for all POST requests except `/login`

### Preferences Routes

**File:** `app/routes/preferences.js`
**Base Path:** `/api/preferences`
**Since:** v1.0.48
**Authentication:** All endpoints require `requireAuth` middleware

```javascript
GET    /                      // Get all user preferences
GET    /:key                  // Get specific preference
POST   /                      // Create new preference
PUT    /:key                  // Update existing preference
DELETE /:key                  // Delete specific preference
POST   /bulk                  // Bulk update preferences (transaction)
DELETE /                      // Delete all user preferences
POST   /reset                 // Reset to default preferences
```

**CSRF Protection:** All state-changing operations (POST, PUT, DELETE) require valid CSRF token

### Template Routes

**File:** `app/routes/templates.js`
**Base Path:** `/api/templates`
**Since:** v1.0.21
**Authentication:** All endpoints require `requireAuth` middleware

```javascript
GET    /                      // List all templates
GET    /:id                   // Get specific template
POST   /                      // Create new template
PUT    /:id                   // Update template
DELETE /:id                   // Delete template
GET    /category/:category    // Get templates by category
POST   /:id/render            // Render template with variables
```

**CSRF Protection:** All state-changing operations require valid CSRF token

### Device Routes

**File:** `app/routes/devices.js`
**Base Path:** `/api/devices`
**Since:** v1.0.42

```javascript
GET    /stats                 // Aggregated device statistics with vulnerability counts
```

**Device Statistics Response Format:**

```javascript
{
  success: true,
  devices: [
    {
      hostname: "server01",
      totalVulnerabilities: 245,
      totalVpr: 1234.5,
      severityCounts: { Critical: 12, High: 45, Medium: 88, Low: 100 },
      hasKev: true
    },
    // ... more devices
  ],
  count: 42
}
```

**Purpose:** Replaces client-side device processing that required loading all 30k+ vulnerabilities. Provides pre-calculated device statistics for efficient device card rendering. Server-side aggregation reduces client memory usage and improves performance.

**Caching:**
- Server cache: 5 minutes (300s) via CacheService stats zone
- Browser cache: 60 seconds via Cache-Control headers
- Cache headers: `X-Cache: HIT/MISS` for monitoring

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

### Authentication System (Since v1.0.46)

**Architecture:** Session-based authentication with SQLite session store

**Core Components:**

#### Password Security
- **Hashing Algorithm:** Argon2id (winner of Password Hashing Competition)
- **Timing-Safe Comparison:** Prevents timing attacks during credential verification
- **Parameters:**
  - Time cost: 2 iterations
  - Memory cost: 19456 KB (19 MB)
  - Parallelism: 1 thread
  - Hash length: 32 bytes

#### Session Management
- **Storage:** SQLite database (`sessions` table)
- **Expiration:** 24 hours (remember me: 30 days)
- **Cookie Settings:**
  - `httpOnly: true` - Prevents XSS access to cookies
  - `secure: true` - HTTPS only (production)
  - `sameSite: 'lax'` - CSRF protection
- **Automatic Cleanup:** Expired sessions removed on startup and periodically

#### Account Lockout Protection
- **Failed Attempts:** 5 consecutive failures
- **Lockout Duration:** 15 minutes
- **Tracking:** In-memory store with automatic expiry
- **Reset:** Successful login clears failed attempt counter

#### CSRF Protection
- **Method:** Double-submit cookie pattern
- **Token Endpoint:** `GET /api/auth/csrf`
- **Required For:** All state-changing requests (POST, PUT, DELETE)
- **Validation:** Automatic via `csrf-sync` middleware
- **Excluded Routes:** `/api/auth/login` (CSRF token needed for form)

#### Protected Endpoints

All API endpoints require authentication (`requireAuth` middleware) **except**:
- `POST /api/auth/login` - Public (login endpoint)
- `GET /api/auth/status` - Public (status check)
- `GET /api/auth/csrf` - Public (token retrieval)

**Protected Endpoint Categories:**
- All `/api/vulnerabilities/*` endpoints
- All `/api/tickets/*` endpoints
- All `/api/preferences/*` endpoints
- All `/api/templates/*` endpoints
- All `/api/backup/*` endpoints
- All `/api/kev/*` endpoints
- All `/api/devices/*` endpoints

### Trust Proxy Configuration

**Setting:** `app.set('trust proxy', true)`

**Purpose:** Enable Express to trust nginx reverse proxy headers

**Why Critical:**
- Allows reading `X-Forwarded-Proto` header to detect HTTPS
- Enables secure cookies with HTTPS termination at nginx
- Required for authentication system to function correctly
- Without this, all authentication will fail (cookies not set)

**Network Flow:**

```text
Client → HTTPS (443) → nginx → HTTP (8080) → Express
         Sets header:    Reads header:
         X-Forwarded-Proto: https
```

### Input Validation

- All file paths validated with PathValidator
- SQL queries use parameterized statements (prepared statements)
- HTML content escaped before storage
- File uploads restricted by type and size
- User input sanitized to prevent injection attacks

### Rate Limiting

Configurable per-endpoint limits to prevent abuse and brute force attacks.

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

# Security & Authentication (Since v1.0.46)
SESSION_SECRET=<your-32-byte-hex-string>  # REQUIRED - Cryptographically secure random string
TRUST_PROXY=true                          # REQUIRED - Enable for nginx reverse proxy
ALLOWED_ORIGINS=http://localhost:8080

# File Handling
MAX_FILE_SIZE=100MB
UPLOAD_DIR=uploads
BACKUP_DIR=backups

# Features
ENABLE_WEBSOCKET=true
ENABLE_COMPRESSION=true
```

**Critical Environment Variables:**

### SESSION_SECRET (Required)

**Purpose:** Cryptographic key for signing session cookies

**Requirements:**
- **Minimum length:** 32 characters (64 recommended)
- **Format:** Hexadecimal string or random alphanumeric
- **Security:** Must be kept secret, never committed to version control

**Generate Secure Secret:**

```bash
# Using Node.js crypto module (recommended)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Using OpenSSL
openssl rand -hex 32
```

**Server Behavior:**
- Server **refuses to start** if SESSION_SECRET is missing
- Server **refuses to start** if SESSION_SECRET is less than 32 characters
- Error message: `"CRITICAL: SESSION_SECRET must be at least 32 characters"`

### TRUST_PROXY (Required for HTTPS)

**Purpose:** Enable Express to trust nginx reverse proxy headers

**Value:** `true` or `1`

**Why Required:**
- Allows Express to read `X-Forwarded-Proto` header from nginx
- Enables secure cookies to work correctly with HTTPS termination
- Required for authentication system to detect HTTPS connections
- Without this, authentication cookies will not be set correctly

**Architecture:**

```text
Browser (HTTPS 443) → nginx → Express (HTTP 8080)
                        ↓
            Sets X-Forwarded-Proto: https
                        ↓
        Express reads header via trust proxy
```
