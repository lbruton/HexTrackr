# Backend API Reference

> Complete reference for HexTrackr's backend architecture, including controllers, services, routes, and server configuration

> **Current Version**: v1.1.5 (see `package.json` for latest version)
>
> Historical "Since:" annotations throughout this document indicate when features were first introduced.

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
| GET | `/api/vulnerabilities/:id` | Get single vulnerability by ID |
| GET | `/api/vulnerabilities/count` | Filtered vulnerability counts (HEX-112 Phase 2) |
| GET | `/api/vulnerabilities/kev-stats` | KEV-specific statistics (HEX-112 Phase 2) |
| GET | `/api/vulnerabilities/vendor-stats` | Vendor distribution statistics (HEX-112 Phase 2) |
| GET | `/api/vulnerabilities/top-devices` | Top affected devices by vulnerability count (HEX-112 Phase 2) |
| GET | `/api/vulnerabilities/cvss-distribution` | CVSS score distribution (HEX-112 Phase 2) |
| GET | `/api/vulnerabilities/severity-distribution` | Severity counts by level (HEX-112 Phase 2) |
| GET | `/api/vulnerabilities/recent` | Recent vulnerabilities feed (HEX-112 Phase 2) |
| GET | `/api/vulnerabilities/export` | Streaming CSV export with filters (HEX-112 Phase 2) |
| GET | `/api/vulnerabilities/last-import` | Last CSV import date (HEX-240) |
| POST | `/api/vulnerabilities` | Creates new vulnerability record |
| PUT | `/api/vulnerabilities/:id` | Updates existing vulnerability |
| DELETE | `/api/vulnerabilities/:id` | Deletes specific vulnerability |
| POST | `/api/vulnerabilities/bulk-delete` | Bulk delete vulnerabilities by IDs |
| POST | `/api/vulnerabilities/import` | Imports CSV file with progress tracking |
| DELETE | `/api/vulnerabilities/all` | Clears all vulnerability data |

**HEX-112 Pagination Enhancements (Since v1.0.50):**

The HEX-112 Phase 2 endpoints enable efficient pagination and statistics calculation without loading all vulnerabilities client-side:

- **Performance**: Reduces client-side data transfer from 30k+ records to targeted results
- **Filtering**: All endpoints support query parameters for vendor, severity, KEV status
- **Caching**: Server-side caching reduces database load
- **Streaming**: Export endpoint streams results for memory efficiency

### TicketController

**Location:** `app/controllers/ticketController.js`

Manages support tickets and associated device tracking with XT# generation and device navigation.

**Key Features:**

- Complete ticket lifecycle management
- Device association tracking (stored as JSON)
- Status workflow (Open → In Progress → Closed)
- Priority-based sorting and filtering
- XT# ticket number generation (HEX-196)
- Device-based ticket lookup and navigation (HEX-203)
- Batch device lookup for performance optimization

**Main Endpoints:**

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/tickets` | Lists all tickets with device information |
| GET | `/api/tickets/:id` | Gets specific ticket details |
| GET | `/api/tickets/next-xt-number` | Generate next XT ticket number (HEX-196) |
| GET | `/api/tickets/by-device/:hostname` | Get all tickets for specific device (HEX-203) |
| POST | `/api/tickets/batch-device-lookup` | Batch device ticket lookup (HEX-203) |
| POST | `/api/tickets` | Creates new ticket |
| PUT | `/api/tickets/:id` | Updates ticket information |
| PUT | `/api/tickets/:id/devices` | Updates associated devices |
| DELETE | `/api/tickets/:id` | Deletes ticket (soft delete with deleted_at) |

**XT# Ticket System (Since v1.0.58 - HEX-196):**

- **Format**: `XT-####` (e.g., XT-0001, XT-0042)
- **Auto-generation**: `/next-xt-number` returns next available number
- **Soft Delete**: Deleted tickets preserve XT# to prevent reuse
- **Purpose**: Provides human-friendly ticket reference for coordination

**Device Navigation (Since v1.0.60 - HEX-203):**

- **Single Device**: `/by-device/:hostname` returns all tickets for a device
- **Batch Lookup**: `/batch-device-lookup` accepts array of hostnames for efficient N+1 query reduction
- **Performance**: Reduces 100+ individual requests to single SQL query with IN clause

### ImportController

**Location:** `app/controllers/importController.js`
**Base Paths:** `/api/vulnerabilities`, `/api/import`

Handles CSV and JSON file imports from vulnerability scanners with lifecycle management and batch processing.

**Key Features:**

- Multi-format CSV support (Tenable, Qualys, Rapid7)
- JSON-based import for programmatic uploads
- Automatic scan date extraction from filenames
- Progress tracking via WebSocket
- Staging mode for large files (>10,000 rows)
- Duplicate detection and merging
- Vulnerability lifecycle management (active, grace_period, resolved)
- Import history tracking

**Main Endpoints:**

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/vulnerabilities/import` | Standard vulnerability CSV import (primary endpoint) |
| POST | `/api/vulnerabilities/import-staging` | Staged CSV import for large files |
| POST | `/api/import/vulnerabilities` | JSON-based vulnerability import |
| POST | `/api/import/tickets` | JSON-based ticket import |
| POST | `/api/import` | Generic import handler |
| GET | `/api/imports` | Import history with status tracking |
| GET | `/api/import/progress/:sessionId` | Real-time import progress by session ID |

**Import Workflow:**

1. **CSV Upload** - File uploaded to `/api/vulnerabilities/import` or `/import-staging`
2. **Staging** - Data loaded into `vulnerability_staging` table for validation
3. **Processing** - Batch processing (1000 records at a time) with deduplication
4. **Lifecycle** - Tracks vulnerability state (active → grace_period → resolved)
5. **Statistics** - Calculates daily totals with VPR aggregation
6. **Progress** - Real-time updates via WebSocket

**Supported Import Types:**
- **CSV**: Tenable, Qualys, Rapid7 formats
- **JSON**: Programmatic uploads with structured data

### BackupController

**Location:** `app/controllers/backupController.js`

Database backup and restoration management with modern ZIP export capabilities.

**Key Features:**

- Timestamped backup creation
- Compression support for large databases
- Backup rotation and cleanup
- Validation before restoration
- ZIP export for data portability (vulnerabilities, tickets, complete backups)

**Main Endpoints:**

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/backup/create` | Creates new backup |
| GET | `/api/backup/list` | Lists available backups |
| POST | `/api/backup/restore` | Restores from backup |
| DELETE | `/api/backup/:filename` | Deletes backup file |
| GET | `/api/backup/export/vulnerabilities` | Export vulnerabilities as ZIP archive |
| GET | `/api/backup/export/tickets` | Export tickets as ZIP archive |
| GET | `/api/backup/export/all` | Export complete backup as ZIP archive |

**ZIP Export Features:**

- **Format**: Standard ZIP archive with JSON/CSV data
- **Use Cases**: Data portability, external analysis, compliance reporting
- **Streaming**: Large datasets streamed for memory efficiency

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
| GET | `/api/kev/check-autosync` | Check if auto-sync needed based on schedule |
| GET | `/api/kev/stats` | KEV dashboard statistics |
| GET | `/api/kev/all` | Get all KEV vulnerabilities from catalog |
| GET | `/api/kev/matched` | Get matched KEVs in current environment |
| GET | `/api/kev/:cveId` | Get KEV details for specific CVE |

**Rate Limiting:**
- `/sync` endpoint: 3 requests per 5 minutes (prevents API abuse)

### CiscoController

**Location:** `app/controllers/ciscoController.js`
**Since:** v1.0.63

Manages Cisco PSIRT (Product Security Incident Response Team) advisory integration for Cisco device vulnerabilities.

**Key Features:**

- Automatic synchronization with Cisco PSIRT API
- CVE-to-advisory matching for Cisco devices
- Fix availability tracking and remediation guidance
- Sync status monitoring and error handling
- Integration with vulnerability classification system

**Main Endpoints:**

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/cisco/sync` | Trigger Cisco PSIRT advisory synchronization |
| GET | `/api/cisco/status` | Get sync status and advisory statistics |
| GET | `/api/cisco/check-autosync` | Check if auto-sync needed based on schedule |
| GET | `/api/cisco/advisory/:cveId` | Get Cisco advisory details for specific CVE |

**Rate Limiting:**
- `/sync` endpoint: 10 requests per 10 minutes

**Advisory Integration:**
- Matches CVEs to official Cisco advisories
- Provides fix availability status
- Links to vendor security bulletins
- Tracks affected Cisco product versions

### PaloAltoController

**Location:** `app/controllers/paloAltoController.js`
**Since:** v1.0.63

Manages Palo Alto Networks security advisory integration for Palo Alto device vulnerabilities.

**Key Features:**

- Automatic synchronization with Palo Alto Security Advisory API
- CVE-to-advisory matching for Palo Alto devices
- Fix availability tracking and remediation guidance
- Sync status monitoring and error handling
- Integration with vulnerability classification system

**Main Endpoints:**

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/palo/sync` | Trigger Palo Alto advisory synchronization |
| GET | `/api/palo/status` | Get sync status and advisory statistics |
| GET | `/api/palo/check-autosync` | Check if auto-sync needed based on schedule |
| GET | `/api/palo/advisory/:cveId` | Get Palo Alto advisory details for specific CVE |

**Rate Limiting:**
- `/sync` endpoint: 10 requests per 10 minutes

**Advisory Integration:**
- Matches CVEs to official Palo Alto advisories
- Provides fix availability status
- Links to vendor security bulletins
- Tracks affected Palo Alto product versions

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
| GET | `/api/preferences/count` | ✅ Protected | Get preference count for current user |
| HEAD | `/api/preferences/:key` | ✅ Protected | Check if preference exists (returns 200 or 404) |
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
| GET | `/api/templates/by-name/:name` | ✅ Protected | Get template by name (alternative lookup) |
| POST | `/api/templates` | ✅ Protected | Create new template |
| POST | `/api/templates/:id/preview` | ✅ Protected | Preview template with data (non-destructive) |
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
- `getById(id)` - Get single vulnerability by ID
- `getCount(filters)` - Filtered vulnerability counts (HEX-112)
- `getKevStats(filters)` - KEV-specific statistics (HEX-112)
- `getVendorStats(filters)` - Vendor distribution statistics (HEX-112)
- `getTopAffectedDevices(filters, limit)` - Top devices by vulnerability count (HEX-112)
- `getCvssDistribution(filters)` - CVSS score distribution (HEX-112)
- `getSeverityDistribution(filters)` - Severity counts by level (HEX-112)
- `getRecentVulnerabilities(filters, limit)` - Recent vulnerabilities feed (HEX-112)
- `streamExport(filters)` - Streaming CSV export (HEX-112)
- `getLastImportDate()` - Last CSV import date (HEX-240)
- `create()` - Add new vulnerability
- `update()` - Modify existing record
- `delete()` - Remove vulnerability
- `bulkDelete(ids)` - Bulk delete vulnerabilities by IDs
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

Ticket management and device tracking with XT# generation and device navigation.

**Features:**

- Full ticket CRUD operations
- Device list management (JSON storage)
- Status transition validation
- Priority-based operations
- Automatic timestamp management
- XT# ticket number generation (HEX-196)
- Device-based ticket lookup (HEX-203)
- Batch device lookup for performance

**Core Methods:**

- `getAll()` - Retrieve all tickets
- `getById(id)` - Get specific ticket
- `generateNextXTNumber()` - Generate next XT# (HEX-196)
- `getTicketsByDevice(hostname)` - Get tickets for device (HEX-203)
- `getTicketsByDeviceBatch(hostnames)` - Batch device lookup (HEX-203)
- `create(ticketData)` - Create new ticket
- `update(id, ticketData)` - Update ticket
- `delete(id)` - Soft delete ticket (sets deleted_at)
- `updateDevices(id, devices)` - Update device associations

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

### CiscoAdvisoryService

**Location:** `app/services/ciscoAdvisoryService.js`
**Since:** v1.0.63

Cisco PSIRT API integration for security advisory synchronization and CVE matching.

**Key Features:**

- Cisco PSIRT API client with authentication
- CVE-to-advisory matching for Cisco devices
- Advisory database management (cisco_advisories table)
- Sync status tracking and error handling
- Fix availability determination

**Core Methods:**

- `syncAdvisories()` - Fetch latest advisories from Cisco PSIRT API
- `getAdvisoryByCve(cveId)` - Retrieve Cisco advisory for specific CVE
- `getSyncStatus()` - Current sync status and statistics
- `matchVulnerabilities()` - Update vulnerability records with Cisco advisory IDs
- `checkAutoSync()` - Determine if auto-sync is needed based on schedule

**API Integration:**

- **Endpoint**: Cisco PSIRT OpenVuln API
- **Authentication**: OAuth 2.0 client credentials
- **Rate Limiting**: 10 requests per 10 minutes
- **Data Format**: JSON responses with advisory metadata

### PaloAltoService

**Location:** `app/services/paloAltoService.js`
**Since:** v1.0.63

Palo Alto Networks Security Advisory API integration for vulnerability tracking.

**Key Features:**

- Palo Alto Security Advisory API client
- CVE-to-advisory matching for Palo Alto devices
- Advisory database management (palo_advisories table)
- Sync status tracking and error handling
- Fix availability determination

**Core Methods:**

- `syncAdvisories()` - Fetch latest advisories from Palo Alto API
- `getAdvisoryByCve(cveId)` - Retrieve Palo Alto advisory for specific CVE
- `getSyncStatus()` - Current sync status and statistics
- `matchVulnerabilities()` - Update vulnerability records with Palo Alto advisory IDs
- `checkAutoSync()` - Determine if auto-sync is needed based on schedule

**API Integration:**

- **Endpoint**: Palo Alto Security Advisory API
- **Rate Limiting**: 10 requests per 10 minutes
- **Data Format**: JSON responses with advisory metadata

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

Primary table for vulnerability data with vendor classification and advisory integration.

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
| **vendor** | **TEXT** | **Vendor classification (CISCO, Palo Alto, Other) - HEX-241** |
| **has_kev** | **INTEGER** | **KEV flag (0/1 boolean) - v1.0.22** |
| **cisco_advisory_id** | **TEXT** | **Cisco PSIRT advisory ID - v1.0.63** |
| **palo_advisory_id** | **TEXT** | **Palo Alto advisory ID - v1.0.63** |
| **lifecycle_status** | **TEXT** | **active/grace_period/resolved - Import lifecycle** |
| **last_seen_date** | **TEXT** | **Last appearance in scan - Lifecycle tracking** |
| **resolved_date** | **TEXT** | **Resolution timestamp - Lifecycle tracking** |
| created_at | TEXT | Record creation |
| updated_at | TEXT | Last modification |

#### tickets

Support ticket tracking with XT# system and soft delete.

| Column | Type | Description |
|--------|------|-------------|
| id | INTEGER PRIMARY KEY | Auto-incrementing ID |
| **xt_number** | **TEXT** | **XT# identifier (XT-0001, XT-0042) - HEX-196** |
| title | TEXT | Ticket title |
| description | TEXT | Full description |
| status | TEXT | Open/In Progress/Closed |
| priority | TEXT | Low/Medium/High/Critical |
| devices | TEXT | JSON array of devices |
| created_at | TEXT | Creation timestamp |
| updated_at | TEXT | Last update |
| closed_at | TEXT | Closure timestamp |
| **deleted_at** | **TEXT** | **Soft delete timestamp - HEX-196** |

#### users

User authentication and profile data **(Since v1.0.46 - HEX-133)**.

| Column | Type | Description |
|--------|------|-------------|
| id | INTEGER PRIMARY KEY | Auto-incrementing user ID |
| username | TEXT NOT NULL UNIQUE | Login username |
| password_hash | TEXT NOT NULL | Argon2id password hash |
| email | TEXT | User email address |
| role | TEXT | User role (admin, user) |
| created_at | TEXT | Account creation timestamp |
| updated_at | TEXT | Last profile update |

#### sessions

SQLite session store for authentication **(Since v1.0.46)**.

| Column | Type | Description |
|--------|------|-------------|
| sid | TEXT PRIMARY KEY | Session ID (primary key) |
| sess | TEXT NOT NULL | JSON session data |
| expired | INTEGER NOT NULL | Expiration timestamp (Unix epoch) |

#### preferences

User preference storage with JSON values **(Since v1.0.48 - HEX-138)**.

| Column | Type | Description |
|--------|------|-------------|
| id | INTEGER PRIMARY KEY | Auto-incrementing ID |
| user_id | INTEGER NOT NULL | Foreign key to users table |
| key | TEXT NOT NULL | Preference key (dot notation) |
| value | TEXT | JSON-serialized preference value |
| created_at | TEXT | Creation timestamp |
| updated_at | TEXT | Last modification |

**Indexes:** `(user_id, key)` UNIQUE

#### templates

Template system for emails and tickets **(Since v1.0.21)**.

| Column | Type | Description |
|--------|------|-------------|
| id | INTEGER PRIMARY KEY | Auto-incrementing ID |
| name | TEXT NOT NULL | Template name |
| category | TEXT | email, ticket, notification |
| subject | TEXT | Email subject or ticket title |
| body | TEXT NOT NULL | Template content with variables |
| variables | TEXT | JSON array of variable names |
| created_at | TEXT | Creation timestamp |
| updated_at | TEXT | Last modification |

#### kev_catalog

CISA Known Exploited Vulnerabilities catalog **(Since v1.0.22)**.

| Column | Type | Description |
|--------|------|-------------|
| id | INTEGER PRIMARY KEY | Auto-incrementing ID |
| cve_id | TEXT NOT NULL UNIQUE | CVE identifier |
| vendor_project | TEXT | Vendor name |
| product | TEXT | Product name |
| vulnerability_name | TEXT | KEV vulnerability name |
| date_added | TEXT | CISA addition date |
| short_description | TEXT | Brief description |
| required_action | TEXT | Remediation action |
| due_date | TEXT | Remediation deadline |
| known_ransomware | INTEGER | Ransomware campaign flag (0/1) |
| notes | TEXT | Additional notes |
| created_at | TEXT | Record creation |
| updated_at | TEXT | Last sync update |

#### cisco_advisories

Cisco PSIRT security advisories **(Since v1.0.63)**.

| Column | Type | Description |
|--------|------|-------------|
| id | INTEGER PRIMARY KEY | Auto-incrementing ID |
| advisory_id | TEXT NOT NULL UNIQUE | Cisco advisory ID |
| cve_id | TEXT | CVE identifier |
| advisory_title | TEXT | Advisory title |
| publication_url | TEXT | Link to Cisco advisory |
| sir | TEXT | Security Impact Rating (Critical/High/Medium/Low) |
| first_published | TEXT | Publication date |
| last_updated | TEXT | Last update date |
| status | TEXT | Advisory status |
| version | TEXT | Advisory version |
| cwe_id | TEXT | CWE identifier |
| product_names | TEXT | JSON array of affected products |
| summary | TEXT | Advisory summary |
| created_at | TEXT | Record creation |
| updated_at | TEXT | Last sync update |

#### palo_advisories

Palo Alto Networks security advisories **(Since v1.0.63)**.

| Column | Type | Description |
|--------|------|-------------|
| id | INTEGER PRIMARY KEY | Auto-incrementing ID |
| advisory_id | TEXT NOT NULL UNIQUE | Palo Alto advisory ID |
| cve_id | TEXT | CVE identifier |
| advisory_title | TEXT | Advisory title |
| publication_url | TEXT | Link to Palo Alto advisory |
| severity | TEXT | Severity rating |
| publication_date | TEXT | Publication date |
| last_updated | TEXT | Last update date |
| affected_products | TEXT | JSON array of affected products |
| summary | TEXT | Advisory summary |
| created_at | TEXT | Record creation |
| updated_at | TEXT | Last sync update |

#### vendor_patterns

Hostname patterns for vendor classification **(Since v1.0.63 - HEX-241)**.

| Column | Type | Description |
|--------|------|-------------|
| id | INTEGER PRIMARY KEY | Auto-incrementing ID |
| pattern | TEXT NOT NULL UNIQUE | Hostname pattern (regex or literal) |
| vendor | TEXT NOT NULL | Vendor name (CISCO, Palo Alto) |
| description | TEXT | Pattern description |
| priority | INTEGER DEFAULT 0 | Matching priority (higher first) |
| created_at | TEXT | Record creation |
| updated_at | TEXT | Last modification |

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

**Endpoint-Specific Rate Limits:**

| Endpoint | Window | Max Requests | Purpose |
|----------|--------|--------------|---------|
| `/api/kev/sync` | 5 minutes | 3 | Prevent KEV API abuse |
| `/api/cisco/sync` | 10 minutes | 10 | Prevent Cisco PSIRT API abuse |
| `/api/palo/sync` | 10 minutes | 10 | Prevent Palo Alto API abuse |
| Global (all endpoints) | 15 minutes | 100 | General brute force protection |

**Implementation:**
- Uses `express-rate-limit` middleware
- IP-based tracking for distributed systems
- Returns `429 Too Many Requests` when limit exceeded
- Rate limit headers included in responses:
  - `X-RateLimit-Limit` - Maximum requests allowed
  - `X-RateLimit-Remaining` - Requests remaining
  - `X-RateLimit-Reset` - Timestamp when limit resets

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
