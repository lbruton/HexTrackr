---
tags: []
doc_type: reference
project: hextrackr
source: manual
created: "2026-03-12"
updated: "2026-03-12"
sourceFiles:
  - app/public/docs-source/api-reference/backend-api.md
---

# API Reference

Complete reference for HexTrackr's backend architecture, including controllers, services, routes, and server configuration.

> [!note]
> Historical "Since:" annotations throughout this document indicate when features were first introduced.

## Overview

HexTrackr's backend follows a modular Express.js architecture with clear separation of concerns:

- **Controllers** handle HTTP requests and responses
- **Services** contain business logic and data access
- **Routes** define API endpoints and middleware
- **Server** orchestrates initialization and dependency injection

All components use the singleton pattern for consistent state management across the application.

---

## Controllers

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

**HEX-112 Pagination Enhancements:**

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
- Status workflow (Open -> In Progress -> Closed)
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

**XT# Ticket System (HEX-196):**

- **Format**: `XT-####` (e.g., XT-0001, XT-0042)
- **Auto-generation**: `/next-xt-number` returns next available number
- **Soft Delete**: Deleted tickets preserve XT# to prevent reuse
- **Purpose**: Provides human-friendly ticket reference for coordination

**Device Navigation (HEX-203):**

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
4. **Lifecycle** - Tracks vulnerability state (active -> grace_period -> resolved)
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

### PaloAltoController

**Location:** `app/controllers/paloAltoController.js`

Manages Palo Alto Networks security advisory integration for Palo Alto device vulnerabilities.

**Main Endpoints:**

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/palo/sync` | Trigger Palo Alto advisory synchronization |
| GET | `/api/palo/status` | Get sync status and advisory statistics |
| GET | `/api/palo/check-autosync` | Check if auto-sync needed based on schedule |
| GET | `/api/palo/advisory/:cveId` | Get Palo Alto advisory details for specific CVE |

**Rate Limiting:**
- `/sync` endpoint: 10 requests per 10 minutes

### AuthController

**Location:** `app/controllers/authController.js`

Handles user authentication, session management, and security features including CSRF protection and account lockout.

**Key Features:**

- **Argon2id Password Hashing** - Industry-standard secure password storage with timing-safe comparison
- **Session Management** - SQLite-backed session store with configurable expiration (24h/30d)
- **Account Lockout Protection** - 5 failed login attempts trigger 15-minute lockout
- **CSRF Token Generation** - Stateless double-submit cookie pattern for state-changing requests
- **Profile Management** - User profile retrieval and password change functionality

**Main Endpoints:**

| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| POST | `/api/auth/login` | No (Public) | Authenticate user with username/password |
| POST | `/api/auth/logout` | Yes (Protected) | End user session and clear cookies |
| GET | `/api/auth/status` | No (Public) | Check current authentication status |
| GET | `/api/auth/csrf` | No (Public) | Retrieve CSRF token for forms |
| POST | `/api/auth/change-password` | Yes (Protected) | Update user password (requires current password) |
| GET | `/api/auth/profile` | Yes (Protected) | Get current user profile information |

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
  "lockoutRemaining": 892
}
```

### PreferencesController

**Location:** `app/controllers/preferencesController.js`

Manages user-specific preferences and application settings with flexible JSON value storage.

**Main Endpoints:**

| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| GET | `/api/preferences` | Yes | Get all preferences for current user |
| GET | `/api/preferences/:key` | Yes | Get specific preference by key |
| GET | `/api/preferences/count` | Yes | Get preference count for current user |
| HEAD | `/api/preferences/:key` | Yes | Check if preference exists (returns 200 or 404) |
| POST | `/api/preferences` | Yes | Create new preference |
| PUT | `/api/preferences/:key` | Yes | Update existing preference |
| DELETE | `/api/preferences/:key` | Yes | Delete specific preference |
| POST | `/api/preferences/bulk` | Yes | Bulk update multiple preferences (transaction) |
| DELETE | `/api/preferences` | Yes | Delete all user preferences |
| POST | `/api/preferences/reset` | Yes | Reset preferences to defaults |

**Common Preference Keys:**

- `dashboard.theme` - UI theme settings
- `dashboard.defaultView` - Default dashboard view (grid/cards)
- `vulnerabilities.filters` - Saved filter configurations
- `notifications.enabled` - Notification preferences
- `export.defaultFormat` - Default export format

### TemplateController

**Location:** `app/controllers/templateController.js`

Manages email and ticket templates for consistent communication and ticket creation.

**Main Endpoints:**

| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| GET | `/api/templates` | Yes | List all templates |
| GET | `/api/templates/:id` | Yes | Get specific template |
| GET | `/api/templates/by-name/:name` | Yes | Get template by name (alternative lookup) |
| POST | `/api/templates` | Yes | Create new template |
| POST | `/api/templates/:id/preview` | Yes | Preview template with data (non-destructive) |
| PUT | `/api/templates/:id` | Yes | Update template |
| DELETE | `/api/templates/:id` | Yes | Delete template |
| GET | `/api/templates/category/:category` | Yes | Get templates by category |
| POST | `/api/templates/:id/render` | Yes | Render template with variables |

---

## Services

Services encapsulate business logic and data access. They are injected into controllers during initialization.

### VulnerabilityService

**Location:** `app/services/vulnerabilityService.js`

Core service for vulnerability data operations.

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

Analytics and reporting for vulnerability data including VPR calculation, severity distribution analysis, trend analysis, and host-based vulnerability grouping.

### TicketService

**Location:** `app/services/ticketService.js`

Ticket management and device tracking with XT# generation and device navigation.

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

**Key Functions:**

- `processStagingToFinalTables()` - Batch processes staged data to production tables
- `calculateAndStoreDailyTotalsEnhanced()` - Calculates per-scan-date statistics with VPR
- `bulkLoadToStagingTable()` - High-performance bulk import to staging
- `extractDateFromFilename()` - Smart date extraction from various filename formats

### BackupService

**Location:** `app/services/backupService.js`

Database backup and restore operations with SQLite database copying, timestamp-based naming, compression, integrity validation, and restore rollback on failure.

### DatabaseService

**Location:** `app/services/databaseService.js`

Database connection and query management including connection pooling, transaction management, schema migrations, and error handling with retry logic.

### CacheService

**Location:** `app/services/cacheService.js`

Multi-tier caching service for optimizing API response times and reducing database load.

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
- `invalidate(zone)` - Clear specific cache zone on data changes
- `getCacheStats()` - Retrieve hit/miss statistics for monitoring

**Cache Headers:**

- `X-Cache: HIT` - Response served from cache
- `X-Cache: MISS` - Response generated fresh, now cached
- `Cache-Control: public, max-age=<browserTTL>, must-revalidate` - Browser caching directive

### KevService

**Location:** `app/services/kevService.js`

CISA Known Exploited Vulnerabilities data management and synchronization with daily automatic sync, CVE-based vulnerability matching, and local catalog caching.

### AuthService

**Location:** `app/services/authService.js`

Core authentication logic including Argon2id password hashing, timing-safe comparison, failed login tracking, account lockout management, and session lifecycle.

### PreferencesService

**Location:** `app/services/preferencesService.js`

User preference management with flexible JSON value storage, user-scoped isolation, transaction support for atomic bulk updates, and automatic timestamp management.

### CiscoAdvisoryService

**Location:** `app/services/ciscoAdvisoryService.js`

Cisco PSIRT API integration for security advisory synchronization and CVE matching via OAuth 2.0 client credentials.

### PaloAltoService

**Location:** `app/services/paloAltoService.js`

Palo Alto Networks Security Advisory API integration for vulnerability tracking and CVE-to-advisory matching.

---

## Routes

Route modules define API endpoints and apply middleware.

### Vulnerability Routes

**File:** `app/routes/vulnerabilities.js`
**Base Path:** `/api/vulnerabilities`

```
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

**Vendor Filtering:**

The `/stats` and `/recent-trends` endpoints support vendor-based filtering via query parameter:

```
GET /api/vulnerabilities/stats                    // All vendors (default)
GET /api/vulnerabilities/stats?vendor=CISCO       // Cisco devices only
GET /api/vulnerabilities/stats?vendor=Palo%20Alto // Palo Alto devices
GET /api/vulnerabilities/stats?vendor=Other       // Other vendors
```

### Ticket Routes

**File:** `app/routes/tickets.js`
**Base Path:** `/api/tickets`

```
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

```
POST   /vulnerabilities       // Import vulnerabilities
GET    /progress/:id          // Check progress
```

### Backup Routes

**File:** `app/routes/backup.js`
**Base Path:** `/api/backup`

```
POST   /create                // Create backup
GET    /list                  // List backups
POST   /restore               // Restore backup
DELETE /:filename             // Delete backup
```

### KEV Routes

**File:** `app/routes/kev.js`
**Base Path:** `/api/kev`

```
POST   /sync                  // Manual KEV synchronization
GET    /status                // Sync status and statistics
GET    /vulnerability/:cveId  // KEV details for specific CVE
```

### Authentication Routes

**File:** `app/routes/auth.js`
**Base Path:** `/api/auth`

```
// Public endpoints (no authentication required)
POST   /login                 // User login with username/password
GET    /status                // Check authentication status
GET    /csrf                  // Get CSRF token for forms

// Protected endpoints (require authentication)
POST   /logout                // User logout (clears session)
POST   /change-password       // Update user password
GET    /profile               // Get current user profile
```

### Preferences Routes

**File:** `app/routes/preferences.js`
**Base Path:** `/api/preferences`
**Authentication:** All endpoints require `requireAuth` middleware

```
GET    /                      // Get all user preferences
GET    /:key                  // Get specific preference
POST   /                      // Create new preference
PUT    /:key                  // Update existing preference
DELETE /:key                  // Delete specific preference
POST   /bulk                  // Bulk update preferences (transaction)
DELETE /                      // Delete all user preferences
POST   /reset                 // Reset to default preferences
```

### Template Routes

**File:** `app/routes/templates.js`
**Base Path:** `/api/templates`
**Authentication:** All endpoints require `requireAuth` middleware

```
GET    /                      // List all templates
GET    /:id                   // Get specific template
POST   /                      // Create new template
PUT    /:id                   // Update template
DELETE /:id                   // Delete template
GET    /category/:category    // Get templates by category
POST   /:id/render            // Render template with variables
```

### Device Routes

**File:** `app/routes/devices.js`
**Base Path:** `/api/devices`

```
GET    /stats                 // Aggregated device statistics with vulnerability counts
```

Provides pre-calculated device statistics for efficient device card rendering. Server-side aggregation reduces client memory usage and improves performance compared to loading all 30k+ vulnerabilities client-side.

---

## Database Schema

For the complete database schema reference, see [[Database Schema]].

Key tables: `vulnerabilities`, `tickets`, `users`, `sessions`, `preferences`, `templates`, `kev_catalog`, `cisco_advisories`, `palo_advisories`, `vendor_patterns`, `vulnerability_imports`.

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

For the complete security reference, see [Security Architecture](/Volumes/DATA/GitHub/Devops/DocVault/Projects/HexTrackr/Security%20Architecture.md).

**Key aspects:**
- Session-based authentication with SQLite session store
- Argon2id password hashing
- CSRF protection via double-submit cookie pattern
- Trust proxy configuration for nginx reverse proxy
- Rate limiting per endpoint
- Input validation with PathValidator

---

## Environment Variables

```bash
# Server Configuration
PORT=8080
HOST=0.0.0.0
NODE_ENV=production

# Database
DATABASE_PATH=data/hextrackr.db

# Security & Authentication
SESSION_SECRET=<your-32-byte-hex-string>  # REQUIRED
TRUST_PROXY=true                          # REQUIRED for nginx reverse proxy

# File Handling
MAX_FILE_SIZE=100MB
UPLOAD_DIR=uploads
BACKUP_DIR=backups

# Features
ENABLE_WEBSOCKET=true
ENABLE_COMPRESSION=true
```

**Critical Variables:**

- **SESSION_SECRET**: Minimum 32 characters, server refuses to start if missing or too short. Generate with: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
- **TRUST_PROXY**: Always `true` for nginx reverse proxy. Required for secure cookies and authentication to function correctly.

---

## Related

- [Backend Architecture](/Volumes/DATA/GitHub/Devops/DocVault/Projects/HexTrackr/Backend%20Architecture.md)
- [Security Architecture](/Volumes/DATA/GitHub/Devops/DocVault/Projects/HexTrackr/Security%20Architecture.md)
- [[WebSocket Architecture]]
- [Middleware & Config](/Volumes/DATA/GitHub/Devops/DocVault/Projects/HexTrackr/Middleware%20&%20Config.md)
- [[Database Schema]]
- [[Frontend API]]
- [[Utilities]]
