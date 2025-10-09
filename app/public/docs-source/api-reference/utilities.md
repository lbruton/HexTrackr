# Utilities Reference

> Core utility modules and helper functions for HexTrackr vulnerability management

## Overview

HexTrackr's utility layer provides 31+ specialized modules across backend and frontend for vulnerability processing, security validation, theme management, template systems, and data transformation. This reference documents all production utilities with code examples and usage patterns.

**Utility Categories**:
- **Backend Core** (6 modules): Vulnerability processing, security, progress tracking, constants
- **Backend Configuration** (1 module): Dynamic vendor pattern configuration
- **Frontend Validation** (3 modules): CVE processing, validation, secure ID generation
- **Frontend Theme System** (2 modules): Theme configuration, VPR color management
- **Frontend Template System** (1 module): Template variable definitions
- **Component Utilities** (13 modules): Shared frontend components
- **Database Scripts** (4 modules): Schema initialization and migrations
- **Development Tools** (1 module): Version management

---

## Backend Core Utilities {#backend-core}

### helpers.js - Vulnerability Processing Library

**Location:** `app/utils/helpers.js`
**Since:** v1.0.0 (Core module)
**Purpose:** Primary utility library for CSV import, vulnerability normalization, and deduplication

#### Data Normalization Functions

**`normalizeVendor(vendor, hostname)`**

Normalize vendor names using pattern matching against `import.config.json` rules.

**Returns:** `"CISCO"`, `"Palo Alto"`, or `"Other"`

```javascript
const { normalizeVendor } = require('./utils/helpers');

// Family field matching
normalizeVendor("Cisco Systems", "fw-01") // → "CISCO"
normalizeVendor("palo alto networks", "pan-fw") // → "Palo Alto"

// Hostname pattern matching
normalizeVendor("Unknown", "nfpan-fw01") // → "Palo Alto" (hostname prefix)
normalizeVendor("Unknown", "nrwan-rtr01") // → "CISCO" (hostname prefix)

// Default fallback
normalizeVendor("Fortinet", "fg-fw01") // → "Other"
```

**Configuration:** Patterns defined in `app/config/import.config.json`:
- `familyVendorPatterns`: Match vendor name in "family" field
- `hostnameVendorPatterns`: Match vendor in hostname (e.g., "nfpan" → Palo Alto)

---

**`normalizeHostname(hostname)`**

Normalize hostnames for consistent deduplication (handles IP addresses vs domain names).

**Returns:** Normalized hostname string or `null`

```javascript
normalizeHostname("192.168.1.1") // → "192.168.1.1"
normalizeHostname("fw-01.corp.local") // → "fw-01.corp.local"
normalizeHostname("") // → null
normalizeHostname(null) // → null
```

---

**`normalizeIPAddress(ipAddress)`**

Extract and validate first IP from multi-IP strings.

**Returns:** First valid IP address or original value

```javascript
normalizeIPAddress("192.168.1.1, 10.0.0.1") // → "192.168.1.1"
normalizeIPAddress("192.168.1.1") // → "192.168.1.1"
normalizeIPAddress("invalid") // → "invalid" (unchanged)
```

---

**`isValidIPAddress(ip)`**

Validate IPv4 addresses with octet range checking (0-255).

**Returns:** `true` if valid IPv4, `false` otherwise

```javascript
isValidIPAddress("192.168.1.1") // → true
isValidIPAddress("255.255.255.255") // → true
isValidIPAddress("256.1.1.1") // → false (octet > 255)
isValidIPAddress("192.168.1") // → false (incomplete)
```

---

**`normalizeXtNumber(value)`**

Normalize XT ticket numbers to 4-digit zero-padded format.

**Returns:** Zero-padded string (e.g., "0042") or original value if invalid

```javascript
normalizeXtNumber("42") // → "0042"
normalizeXtNumber("123") // → "0123"
normalizeXtNumber("XT-42") // → "0042" (strips prefix)
normalizeXtNumber("invalid") // → "invalid" (unchanged)
```

---

#### String & Hashing Functions

**`createDescriptionHash(description)`**

Generate MD5 hash of normalized description (first 8 characters).

**Returns:** 8-character hash string

```javascript
createDescriptionHash("Apache vulnerability on port 80") // → "a3f2c1d4"
createDescriptionHash("Apache vulnerability on port 80") // → "a3f2c1d4" (same hash)
createDescriptionHash("Different description") // → "b7e9f3a2"
```

**Use Case:** Deduplication when CVE and plugin ID unavailable.

---

**`extractScanDateFromFilename(filename)`**

Parse scan dates from CSV filenames using 4 pattern types.

**Supported Formats:**
- `YYYY-MM-DD` (e.g., `scan-2024-01-15.csv`)
- `MM-DD-YYYY` (e.g., `scan-01-15-2024.csv`)
- `YYYYMMDD` (e.g., `scan-20240115.csv`)
- `DD-MM-YYYY` (e.g., `scan-15-01-2024.csv`)

**Returns:** ISO date string (`YYYY-MM-DD`) or `null`

```javascript
extractScanDateFromFilename("vulnerabilities-2024-01-15.csv") // → "2024-01-15"
extractScanDateFromFilename("scan-01-15-2024.csv") // → "2024-01-15"
extractScanDateFromFilename("export-20240115.csv") // → "2024-01-15"
extractScanDateFromFilename("data.csv") // → null (no date found)
```

---

#### Deduplication Engine

**`generateEnhancedUniqueKey(mapped)`**

Multi-tier deduplication key generation with confidence scoring.

**Deduplication Tiers:**
1. **Tier 1 (95% confidence)**: Asset Hostname + CVE + Plugin ID
2. **Tier 2 (85% confidence)**: Asset Hostname + CVE + Description Hash
3. **Tier 3 (75% confidence)**: Asset Hostname + Plugin ID + Description Hash
4. **Tier 4 (50% confidence)**: Asset Hostname + Description Hash
5. **Tier 5 (25% confidence)**: Description Hash only (fallback)

**Returns:** `{ key: string, tier: number, confidence: number }`

```javascript
const mapped = {
    assetHostname: "fw-01",
    cve: "CVE-2024-1234",
    pluginId: "12345"
};

generateEnhancedUniqueKey(mapped)
// → {
//     key: "fw-01|CVE-2024-1234|12345",
//     tier: 1,
//     confidence: 95
//   }
```

**Use Case:** Prevents duplicate vulnerability imports with confidence scoring.

---

**`generateUniqueKey(mapped)`**

Legacy deduplication key (backward compatibility).

**Returns:** Simple concatenated key string

```javascript
generateUniqueKey(mapped) // → "fw-01|CVE-2024-1234|12345"
```

---

**`calculateDeduplicationConfidence(uniqueKey)`**

Calculate confidence percentage from unique key structure.

**Returns:** Confidence percentage (25-95%)

```javascript
calculateDeduplicationConfidence("fw-01|CVE-2024-1234|12345") // → 95 (tier 1)
calculateDeduplicationConfidence("fw-01|CVE-2024-1234|hash:a3f2c1d4") // → 85 (tier 2)
calculateDeduplicationConfidence("hash:a3f2c1d4") // → 25 (tier 5)
```

---

**`getDeduplicationTier(uniqueKey)`**

Classify deduplication tier (1-5) from unique key.

**Returns:** Tier number (1-5)

```javascript
getDeduplicationTier("fw-01|CVE-2024-1234|12345") // → 1
getDeduplicationTier("fw-01|CVE-2024-1234|hash:a3f2c1d4") // → 2
getDeduplicationTier("hash:a3f2c1d4") // → 5
```

---

#### CSV Data Mapping Functions

**`mapVulnerabilityRow(row)`**

Map Tenable CSV row to vulnerability object(s) with multi-CVE splitting.

**Returns:** Array of vulnerability objects (1+ per row)

```javascript
const row = {
    "Asset Hostname": "fw-01",
    "CVE": "CVE-2024-1234, CVE-2024-5678",
    "Plugin": "12345",
    "VPR Score": "9.2",
    // ... other Tenable columns
};

mapVulnerabilityRow(row)
// → [
//     { assetHostname: "fw-01", cve: "CVE-2024-1234", pluginId: "12345", vprScore: 9.2, ... },
//     { assetHostname: "fw-01", cve: "CVE-2024-5678", pluginId: "12345", vprScore: 9.2, ... }
//   ]
```

**Multi-CVE Splitting:** Single row with multiple CVEs creates separate vulnerability records.

---

**`mapTicketRow(row, index)`**

Map CSV row to ticket object structure.

**Returns:** Ticket object with normalized fields

```javascript
const row = {
    "XT Number": "42",
    "Site Name": "HQ",
    "Status": "Open"
};

mapTicketRow(row, 0)
// → {
//     xtNumber: "0042",
//     siteName: "HQ",
//     status: "Open",
//     rowIndex: 0
//   }
```

---

#### Documentation Helper

**`findDocsSectionForFilename(filename)`**

Locate documentation HTML files for dynamic loading in docs portal.

**Returns:** Section path string or `null`

```javascript
findDocsSectionForFilename("backend-api.html") // → "api-reference"
findDocsSectionForFilename("getting-started.html") // → "guides"
findDocsSectionForFilename("unknown.html") // → null
```

**Used By:** Documentation portal for file path resolution.

---

### constants.js - Application Constants

**Location:** `app/utils/constants.js`
**Since:** v1.0.0 (Core module)
**Purpose:** Centralized configuration constants for network, security, database, and API

#### Constant Categories

**Network Configuration**
```javascript
const {
    PORT,                  // 8080 (application server)
    WEBSOCKET_PORT,        // WebSocket server port
    CORS_ORIGINS,          // Allowed CORS origins array
    CORS_METHODS,          // Allowed HTTP methods array
    CORS_HEADERS           // Allowed headers array
} = require('./utils/constants');
```

**File System Paths**
```javascript
const {
    UPLOADS_DIRECTORY,     // /tmp/hextrackr-uploads
    DATA_DIRECTORY,        // app/data
    BACKUPS_DIRECTORY,     // app/data/backups
    DATABASE_FILENAME      // hextrackr.db
} = require('./utils/constants');
```

**File Size Limits**
```javascript
const {
    MAX_FILE_SIZE,         // 100MB (104857600 bytes)
    EXPRESS_JSON_LIMIT,    // "50mb"
    EXPRESS_URLENCODED_LIMIT // "50mb"
} = require('./utils/constants');
```

**Rate Limiting**
```javascript
const {
    RATE_LIMIT_WINDOW_MS,  // 15 minutes
    RATE_LIMIT_MAX_REQUESTS // 100 (prod) / 1000 (dev)
} = require('./utils/constants');
```

**Security Headers**
```javascript
const {
    X_CONTENT_TYPE_OPTIONS, // "nosniff"
    X_FRAME_OPTIONS,        // "DENY"
    X_XSS_PROTECTION        // "1; mode=block"
} = require('./utils/constants');
```

**Progress Tracking**
```javascript
const {
    PROGRESS_THROTTLE_INTERVAL,  // 100ms (WebSocket event throttle)
    SESSION_CLEANUP_INTERVAL,    // 30 minutes
    STALE_SESSION_THRESHOLD      // 30 minutes
} = require('./utils/constants');
```

**Database Processing**
```javascript
const {
    BATCH_SIZE,                  // 1000 (bulk insert batch size)
    PROGRESS_UPDATE_INTERVAL,    // 100 (update progress every N rows)
    DESCRIPTION_TRUNCATE_LENGTH  // 500 characters
} = require('./utils/constants');
```

**API Endpoints** (Complete object with 39+ endpoint paths)
```javascript
const { API_ENDPOINTS } = require('./utils/constants');

API_ENDPOINTS.VULNERABILITIES      // "/api/vulnerabilities"
API_ENDPOINTS.TICKETS              // "/api/tickets"
API_ENDPOINTS.AUTH_LOGIN           // "/api/auth/login"
API_ENDPOINTS.KEV_LOOKUP           // "/api/kev/lookup"
// ... 35+ more endpoints
```

**Database Query Limits**
```javascript
const {
    RECENT_TRENDS_LIMIT,           // 30 days
    BACKUP_QUERY_LIMIT,            // 100 backups
    VULNERABILITY_EXPORT_LIMIT     // 10,000 vulnerabilities
} = require('./utils/constants');
```

**Time Intervals**
```javascript
const {
    FIFTEEN_MINUTES,  // 900000ms
    THIRTY_MINUTES,   // 1800000ms
    ONE_HOUR,         // 3600000ms
    ONE_DAY,          // 86400000ms
    ONE_WEEK          // 604800000ms
} = require('./utils/constants');
```

**File Processing**
```javascript
const {
    CSV_IMPORT_OPERATION,  // "csv_import"
    WEB_UPLOAD_FILENAME,   // "web-upload.csv"
    WEB_IMPORT_SOURCE      // "web"
} = require('./utils/constants');
```

**Used By:** All backend modules (server, controllers, services, middleware)

---

### PathValidator.js - Security Utility Class

**Location:** `app/utils/PathValidator.js`
**Since:** v1.0.46 (Security enhancement)
**Purpose:** Prevent directory traversal attacks and validate file paths

#### Key Methods

**`PathValidator.validatePath(filePath)`**

Validate and normalize paths, detect traversal attempts.

**Throws:** Error if path contains traversal patterns (`../`, absolute paths, null bytes)

**Returns:** Normalized safe path

```javascript
const PathValidator = require('./utils/PathValidator');

// Valid path
const safe = PathValidator.validatePath("uploads/data.csv");
// → "/app/uploads/data.csv" (normalized)

// Invalid paths (throws Error)
PathValidator.validatePath("../../../etc/passwd"); // ❌ Directory traversal
PathValidator.validatePath("/etc/shadow");         // ❌ Absolute path
PathValidator.validatePath("uploads/../secrets");  // ❌ Traversal attempt
```

**Security Patterns Blocked:**
- `../` (directory traversal)
- Absolute paths (`/etc/`, `C:\`, etc.)
- Null byte injection (`\0`)
- Symlink attacks
- Path normalization exploits

---

**`PathValidator.safeReadFileSync(filePath, options)`**

Secure file reading wrapper with path validation.

**Returns:** File contents (Buffer or string based on encoding)

```javascript
// Safe read with validation
const data = PathValidator.safeReadFileSync("uploads/data.csv", "utf8");

// Unsafe path blocked
PathValidator.safeReadFileSync("../secrets/key.pem"); // ❌ Throws Error
```

---

**`PathValidator.safeWriteFileSync(filePath, data, options)`**

Secure file writing wrapper.

```javascript
PathValidator.safeWriteFileSync("uploads/output.json", JSON.stringify(data));
```

---

**`PathValidator.safeReaddirSync(dirPath, options)`**

Secure directory reading wrapper.

**Returns:** Array of filenames

```javascript
const files = PathValidator.safeReaddirSync("uploads");
// → ["file1.csv", "file2.csv"]
```

---

**`PathValidator.safeStatSync(filePath)`**

Secure file stat wrapper.

**Returns:** `fs.Stats` object

```javascript
const stats = PathValidator.safeStatSync("uploads/data.csv");
console.log(stats.size); // File size in bytes
```

---

**`PathValidator.safeExistsSync(filePath)`**

Secure file existence check wrapper.

**Returns:** `true` if file exists, `false` otherwise

```javascript
if (PathValidator.safeExistsSync("uploads/data.csv")) {
    // File exists
}
```

---

**`PathValidator.safeUnlinkSync(filePath)`**

Secure file deletion wrapper.

```javascript
PathValidator.safeUnlinkSync("uploads/temp.csv"); // Delete file
```

---

**Used By:** helpers.js, version-manager.js, documentation controllers, file upload handlers

---

### ProgressTracker.js - Real-time Progress Management

**Location:** `app/utils/ProgressTracker.js`
**Since:** v1.0.0 (WebSocket integration)
**Purpose:** WebSocket-based progress tracking for long-running operations (CSV imports, backups)

#### Key Methods

**`constructor(io)`**

Initialize with Socket.io instance.

```javascript
const ProgressTracker = require('./utils/ProgressTracker');
const progressTracker = new ProgressTracker(io);
```

---

**`createSession(metadata)`**

Create new progress session with auto-generated UUID.

**Returns:** Session ID (UUID v4)

```javascript
const sessionId = progressTracker.createSession({
    operation: "csv_import",
    filename: "vulnerabilities.csv",
    totalRows: 1000
});
// → "550e8400-e29b-41d4-a716-446655440000"
```

---

**`createSessionWithId(sessionId, metadata)`**

Create session with specific ID (for pre-generated session IDs).

```javascript
progressTracker.createSessionWithId("custom-session-id", {
    operation: "backup",
    filename: "backup.db"
});
```

---

**`updateProgress(sessionId, progress, message, additionalData)`**

Throttled progress updates (100ms interval to prevent WebSocket spam).

**Parameters:**
- `sessionId` - Session identifier
- `progress` - Percentage (0-100)
- `message` - Status message
- `additionalData` - Optional extra data

```javascript
for (let i = 0; i < totalRows; i++) {
    await processRow(data[i]);

    progressTracker.updateProgress(sessionId,
        Math.round((i / totalRows) * 100),
        `Processing row ${i + 1} of ${totalRows}`,
        { currentRow: i + 1, totalRows }
    );
}
```

**Throttling:** Updates are throttled to 100ms intervals to prevent overwhelming WebSocket clients.

---

**`completeSession(sessionId, message, finalData)`**

Mark session complete.

```javascript
progressTracker.completeSession(sessionId,
    "Import completed successfully",
    {
        imported: 950,
        duplicates: 50,
        errors: 0
    }
);
```

**Cleanup:** Session is auto-deleted 5 seconds after completion.

---

**`errorSession(sessionId, errorMessage, errorData)`**

Mark session errored.

```javascript
progressTracker.errorSession(sessionId,
    "Import failed: Invalid CSV format",
    { error: err.message }
);
```

**Cleanup:** Session is auto-deleted 5 seconds after error.

---

**`getSession(sessionId)`**

Retrieve session data.

**Returns:** Session object or `undefined`

```javascript
const session = progressTracker.getSession(sessionId);
// → {
//     id: "550e8400-...",
//     operation: "csv_import",
//     progress: 75,
//     status: "processing",
//     startTime: 1672531200000,
//     ...metadata
//   }
```

---

**`cleanupStaleSessions()`**

Auto-cleanup of stale sessions (runs every 30 minutes).

**Criteria:**
- Sessions inactive for 30+ minutes
- Completed/errored sessions 5+ seconds old

```javascript
// Automatic cleanup runs every 30 minutes
// Manual cleanup:
progressTracker.cleanupStaleSessions();
```

---

#### WebSocket Events

**Room-based Broadcasting**

Each session broadcasts to room `progress-{sessionId}`:

```javascript
// Client joins progress room
socket.emit("join-progress", { sessionId });

// Server broadcasts to room
io.to(`progress-${sessionId}`).emit("progress", {
    sessionId,
    progress: 75,
    message: "Processing...",
    ...additionalData
});
```

**Event Types:**
- `progress` - Progress update
- `complete` - Operation completed
- `error` - Operation failed

---

**Used By:** importController, backupController, all long-running operations

---

### seedEmailTemplates.js - Template Seeding Utilities

**Location:** `app/utils/seedEmailTemplates.js`
**Since:** v1.0.21 (Template Editor feature)
**Purpose:** Seed and repair default email/ticket/vulnerability templates

#### Key Functions

**`seedEmailTemplates(db)`**

Seed default email template.

```javascript
const { seedEmailTemplates } = require('./utils/seedEmailTemplates');

seedEmailTemplates(db);
// Creates default email template with 11 variables
```

**Default Email Template:**
```markdown
Subject: Vulnerability Report - {{SITE_NAME}}

Dear {{SUPERVISOR}},

A vulnerability report has been generated for {{SITE_NAME}}.

**Summary:**
- Total Vulnerabilities: {{TOTAL_VULNERABILITIES}}
- Critical: {{CRITICAL_COUNT}}
- High: {{HIGH_COUNT}}

{{VULNERABILITY_SUMMARY}}

Generated: {{GENERATED_TIME}}
```

---

**`seedTicketTemplates(db)`**

Seed default ticket template.

```javascript
seedTicketTemplates(db);
// Creates default ticket template with 14 variables
```

**Default Ticket Template:**
```markdown
# Hexagon Work Request

**XT Number:** {{XT_NUMBER}}
**Site:** {{SITE_NAME}}
**Location:** {{LOCATION}}

## Device List
{{DEVICE_LIST}}

## Notes
{{NOTES}}

**Submitted:** {{DATE_SUBMITTED}}
**Due:** {{DATE_DUE}}
```

---

**`seedVulnerabilityTemplates(db)`**

Seed default vulnerability report template.

```javascript
seedVulnerabilityTemplates(db);
// Creates default vulnerability template with 11 variables
```

---

**`seedAllTemplates(db)`**

Seed all templates at once.

```javascript
const { seedAllTemplates } = require('./utils/seedEmailTemplates');

seedAllTemplates(db);
// Seeds email, ticket, and vulnerability templates
```

---

**`resetTemplateToDefault(db, templateName)`**

Reset template to default content (repair corrupted templates).

**Parameters:**
- `templateName` - `"email"`, `"ticket"`, or `"vulnerability"`

```javascript
const { resetTemplateToDefault } = require('./utils/seedEmailTemplates');

resetTemplateToDefault(db, "email");
// Resets email template to default
```

---

**`contentLooksMismatched(content, category)`**

Validate template content integrity.

**Returns:** `true` if content appears corrupted/mismatched

```javascript
const { contentLooksMismatched } = require('./utils/seedEmailTemplates');

if (contentLooksMismatched(emailContent, "email")) {
    resetTemplateToDefault(db, "email");
}
```

**Validation Checks:**
- Email templates should contain email-specific variables (`{{SUPERVISOR}}`, `Subject:`)
- Ticket templates should contain ticket-specific variables (`{{XT_NUMBER}}`)
- Vulnerability templates should contain vulnerability-specific variables

---

**Template Variables**

**Email Template (11 variables):**
- `{{SUPERVISOR}}` - Supervisor name
- `{{SITE_NAME}}` - Site name
- `{{TOTAL_VULNERABILITIES}}` - Total vulnerability count
- `{{CRITICAL_COUNT}}` - Critical vulnerabilities
- `{{HIGH_COUNT}}` - High severity
- `{{MEDIUM_COUNT}}` - Medium severity
- `{{LOW_COUNT}}` - Low severity
- `{{VULNERABILITY_SUMMARY}}` - Summary text
- `{{GENERATED_TIME}}` - Generation timestamp
- `{{GREETING}}` - Greeting text
- `{{NOTES}}` - Additional notes

**Ticket Template (14 variables):**
- `{{XT_NUMBER}}` - XT ticket number
- `{{HEXAGON_TICKET}}` - Hexagon ticket number
- `{{SERVICENOW_TICKET}}` - ServiceNow ticket number
- `{{STATUS}}` - Ticket status
- `{{SITE_NAME}}` - Site name
- `{{LOCATION}}` - Location details
- `{{DATE_SUBMITTED}}` - Submission date
- `{{DATE_DUE}}` - Due date
- `{{DEVICE_LIST}}` - List of devices
- `{{DEVICE_COUNT}}` - Number of devices
- `{{NOTES}}` - Ticket notes
- `{{SUPERVISOR}}` - Supervisor name
- `{{TECHNICIAN}}` - Technician name
- `{{GENERATED_TIME}}` - Generation timestamp

**Vulnerability Template (11 variables):**
- `{{VULNERABILITY_SUMMARY}}` - Summary section
- `{{VULNERABILITY_DETAILS}}` - Detailed information
- `{{TOTAL_VULNERABILITIES}}` - Total count
- `{{CRITICAL_COUNT}}` - Critical count
- `{{HIGH_COUNT}}` - High count
- `{{MEDIUM_COUNT}}` - Medium count
- `{{LOW_COUNT}}` - Low count
- `{{SITE_NAME}}` - Site name
- `{{LOCATION}}` - Location
- `{{GENERATED_TIME}}` - Timestamp
- `{{NOTES}}` - Additional notes

---

**Used By:** init-database.js, template repair during server startup

---

## Backend Configuration Utilities {#backend-config}

### importConfig.js - Vendor Pattern Configuration

**Location:** `app/config/importConfig.js`
**Since:** v1.0.53 (Dynamic vendor configuration)
**Purpose:** Dynamic vendor normalization patterns (CISCO, Palo Alto) with regex caching

#### Key Functions

**`getImportConfig()`**

Get cached config or load from disk.

**Returns:** Configuration object with compiled regex patterns

```javascript
const { getImportConfig } = require('../config/importConfig');

const config = getImportConfig();
// → {
//     familyVendorPatterns: { ... },
//     hostnameVendorPatterns: { ... }
//   }
```

**Caching:** Configuration is cached in memory for performance.

---

**`refreshImportConfig()`**

Force reload of configuration (for config file changes).

```javascript
const { refreshImportConfig } = require('../config/importConfig');

refreshImportConfig();
// Clears cache and reloads import.config.json
```

---

**`resolveConfigPath()`**

Resolve config file path (environment variable or default).

**Environment Variable:** `IMPORT_CONFIG_PATH`

**Default:** `app/config/import.config.json`

```javascript
const { resolveConfigPath } = require('../config/importConfig');

const path = resolveConfigPath();
// → "/app/config/import.config.json"
```

---

**`preparePatterns(patterns)`**

Compile regex patterns from JSON config (internal).

**Returns:** Object with compiled regex patterns

---

**`loadConfigFromDisk(configPath)`**

Load and parse `import.config.json` (internal).

**Returns:** Parsed configuration object

---

#### Configuration Structure

**File:** `app/config/import.config.json`

```json
{
  "familyVendorPatterns": {
    "CISCO": ["cisco", "cisco systems"],
    "Palo Alto": ["palo alto", "palo alto networks"]
  },
  "hostnameVendorPatterns": {
    "CISCO": ["nrwan", "cisco"],
    "Palo Alto": ["nfpan", "paloalto"]
  }
}
```

**Pattern Matching:**
- `familyVendorPatterns`: Match vendor name in "family" field (case-insensitive)
- `hostnameVendorPatterns`: Match prefix/substring in hostname

---

**Used By:** helpers.js (`normalizeVendor` function), importService

---

## Frontend Validation Utilities {#frontend-validation}

### cve-utilities.js - CVE Link & Event Management

**Location:** `app/public/scripts/shared/cve-utilities.js`
**Since:** v1.0.0 (T038 - CVE Link System Fix)
**Spec:** 004-cve-link-system-fix
**Purpose:** Centralized CVE validation, parsing, link creation, and event handling

#### Validation Functions

**`validateCVE(cve)`**

Validate CVE-YYYY-NNNNN format.

**Returns:** `true` if valid, `false` otherwise

```javascript
validateCVE("CVE-2024-1234") // → true
validateCVE("CVE-2024-12345678") // → true (any length after year)
validateCVE("CVE-24-1234") // → false (invalid year)
validateCVE("invalid") // → false
```

---

**`validateCiscoSA(id)`**

Validate Cisco Security Advisory format: `cisco-sa-YYYYMMDD-name`

**Returns:** `true` if valid, `false` otherwise

```javascript
validateCiscoSA("cisco-sa-20240115-apache") // → true
validateCiscoSA("invalid") // → false
```

---

#### Parsing Functions

**`parseCVEString(cveString)`**

Parse comma/space-separated CVE lists.

**Returns:** Array of valid CVE IDs

```javascript
parseCVEString("CVE-2024-1234, CVE-2024-5678")
// → ["CVE-2024-1234", "CVE-2024-5678"]

parseCVEString("CVE-2024-1234 CVE-2024-5678")
// → ["CVE-2024-1234", "CVE-2024-5678"]

parseCVEString("CVE-2024-1234, invalid, CVE-2024-5678")
// → ["CVE-2024-1234", "CVE-2024-5678"] (filters invalid)
```

---

**`extractCVEIds(cveString, firstOnly = false)`**

Extract CVE IDs as array or single value.

**Parameters:**
- `cveString` - CVE string to parse
- `firstOnly` - Return only first CVE (default: `false`)

**Returns:** Array of CVEs or single CVE string

```javascript
extractCVEIds("CVE-2024-1234, CVE-2024-5678")
// → ["CVE-2024-1234", "CVE-2024-5678"]

extractCVEIds("CVE-2024-1234, CVE-2024-5678", true)
// → "CVE-2024-1234"
```

---

**`getFirstCVE(cveString)`**

Get first CVE from multi-CVE string.

**Returns:** First CVE ID or empty string

```javascript
getFirstCVE("CVE-2024-1234, CVE-2024-5678") // → "CVE-2024-1234"
getFirstCVE("invalid") // → ""
```

---

**`normalizeCVE(cve)`**

Normalize to uppercase standard format.

**Returns:** Normalized CVE string

```javascript
normalizeCVE("cve-2024-1234") // → "CVE-2024-1234"
normalizeCVE("CVE-2024-1234") // → "CVE-2024-1234"
```

---

**`countCVEs(cveString)`**

Count valid CVEs in string.

**Returns:** Number of valid CVEs

```javascript
countCVEs("CVE-2024-1234, CVE-2024-5678") // → 2
countCVEs("CVE-2024-1234, invalid, CVE-2024-5678") // → 2
countCVEs("invalid") // → 0
```

---

#### Link Creation Functions

**`createCVELink(cveId, options = {})`**

Create single CVE link with event isolation.

**Options:**
- `classes` - CSS classes for link
- `target` - Link target (`_blank` default)
- `dataAttributes` - Additional data attributes

**Returns:** HTML link element (string)

```javascript
createCVELink("CVE-2024-1234")
// → '<a href="#" class="cve-link" data-cve="CVE-2024-1234" target="_blank">CVE-2024-1234</a>'

createCVELink("CVE-2024-1234", {
    classes: "btn btn-sm",
    dataAttributes: { severity: "critical" }
})
// → '<a href="#" class="btn btn-sm cve-link" data-cve="CVE-2024-1234" data-severity="critical" target="_blank">CVE-2024-1234</a>'
```

---

**`createMultipleCVELinks(cveString, options = {})`**

Create multiple CVE links with separator.

**Options:**
- `separator` - HTML separator between links (default: `", "`)
- `classes` - CSS classes
- `limit` - Maximum links to show (default: all)

**Returns:** HTML string with multiple links

```javascript
createMultipleCVELinks("CVE-2024-1234, CVE-2024-5678")
// → '<a href="#" class="cve-link" data-cve="CVE-2024-1234">CVE-2024-1234</a>, <a href="#" class="cve-link" data-cve="CVE-2024-5678">CVE-2024-5678</a>'

createMultipleCVELinks("CVE-2024-1234, CVE-2024-5678", {
    separator: " | ",
    limit: 1
})
// → '<a href="#" class="cve-link" data-cve="CVE-2024-1234">CVE-2024-1234</a> <span class="cve-more">+1 more</span>'
```

---

**`createCVESummary(cveString, options = {})`**

Create "CVE-XXX +N more" summary display.

**Options:**
- `maxVisible` - Maximum CVEs to show (default: 1)
- `classes` - CSS classes
- `showTooltip` - Show full list on hover (default: `true`)

**Returns:** HTML summary string

```javascript
createCVESummary("CVE-2024-1234, CVE-2024-5678, CVE-2024-9999")
// → '<a href="#" class="cve-link" data-cve="CVE-2024-1234">CVE-2024-1234</a> <span class="cve-more" title="CVE-2024-5678, CVE-2024-9999">+2 more</span>'
```

---

#### Event Handling Functions

**`attachCVEEventHandlers(container, lookupHandler, options = {})`**

Event delegation for CVE clicks (prevents event handler duplication).

**Parameters:**
- `container` - DOM element to attach listeners to
- `lookupHandler` - Callback function `(cveId) => void`
- `options` - Optional configuration

**Returns:** `void`

```javascript
const container = document.querySelector(".vulnerability-grid");

attachCVEEventHandlers(container, (cveId) => {
    console.log(`CVE clicked: ${cveId}`);
    // Open KEV modal, fetch CVE details, etc.
});
```

**Event Isolation:** Uses event delegation to prevent duplicate handlers on dynamic content.

---

**`removeCVEEventHandlers(container)`**

Cleanup event handlers.

```javascript
removeCVEEventHandlers(container);
```

---

**Used By:** vulnerability-grid.js, vulnerability-details-modal.js, vulnerability-cards.js, all CVE display components

---

### crypto-utils.js - Secure ID Generation

**Location:** `app/public/scripts/shared/crypto-utils.js`
**Since:** v1.0.31
**Purpose:** Cryptographically secure random ID generation with HTTPS/HTTP fallback

#### Key Function

**`generateSecureId(prefix = "", randomBytes = 8)`**

Generate unique IDs with Web Crypto API or timestamp fallback.

**Parameters:**
- `prefix` - Optional prefix string
- `randomBytes` - Number of random bytes (default: 8)

**Returns:** Unique ID string (prefix + base36 encoded random bytes)

```javascript
import { generateSecureId } from './crypto-utils.js';

// HTTPS context (secure)
generateSecureId("toast")
// → "toast-a3f2c1d4b5e6f7"

generateSecureId("modal", 16)
// → "modal-a3f2c1d4b5e6f7a8b9c0d1e2f3a4b5c6"

// HTTP context (fallback to timestamp)
generateSecureId("session")
// → "session-1672531200000-123.456"
```

**Security:**
- **HTTPS**: Uses `window.crypto.getRandomValues()` for cryptographically secure random IDs
- **HTTP fallback**: Uses `Date.now() + performance.now()` for non-secure contexts
- **Compact encoding**: Base36 encoding for shorter IDs

---

**Used By:** toast-manager.js, progress-modal.js, modal-monitoring.js, all dynamic ID generation

---

### validation-utils.js - Frontend Validation Library

**Location:** `app/public/scripts/validation-utils.js`
**Since:** v1.0.41
**Purpose:** Comprehensive validation and error handling for CSV imports and forms

#### Validation Functions

**`isValidCVE(cve)`**

CVE format validation: `CVE-YYYY-NNNN+`

**Returns:** `true` if valid, `false` otherwise

```javascript
isValidCVE("CVE-2024-1234") // → true
isValidCVE("CVE-2024-12345678") // → true
isValidCVE("CVE-24-1234") // → false (invalid year)
```

---

**`isValidIP(ip)`**

IPv4 and IPv6 validation.

**Returns:** `true` if valid IP, `false` otherwise

```javascript
isValidIP("192.168.1.1") // → true (IPv4)
isValidIP("2001:db8::1") // → true (IPv6)
isValidIP("256.1.1.1") // → false (invalid IPv4)
```

---

**`isValidVPR(score)`**

VPR score validation (0.0-10.0).

**Returns:** `true` if valid VPR score, `false` otherwise

```javascript
isValidVPR(9.2) // → true
isValidVPR("9.2") // → true (string coerced to number)
isValidVPR(10.5) // → false (out of range)
isValidVPR(-1) // → false (negative)
```

---

**`normalizeDate(dateInput)`**

Normalize dates to ISO 8601 format (YYYY-MM-DD).

**Supported Formats:**
- ISO 8601 (`2024-01-15T10:30:00Z`)
- MM/DD/YYYY (`01/15/2024`)
- DD/MM/YYYY (`15/01/2024`)
- YYYY-MM-DD (`2024-01-15`)
- Unix timestamp (milliseconds)

**Returns:** ISO date string or `null`

```javascript
normalizeDate("2024-01-15T10:30:00Z") // → "2024-01-15"
normalizeDate("01/15/2024") // → "2024-01-15"
normalizeDate("15/01/2024") // → "2024-01-15"
normalizeDate(1672531200000) // → "2024-01-15"
normalizeDate("invalid") // → null
```

---

**`isValidHostname(hostname)`**

DNS hostname validation.

**Returns:** `true` if valid hostname, `false` otherwise

```javascript
isValidHostname("fw-01.corp.local") // → true
isValidHostname("server123") // → true
isValidHostname("invalid..hostname") // → false
```

---

**`isValidSeverity(severity)`**

Severity level validation.

**Valid Values:** `"critical"`, `"high"`, `"medium"`, `"low"`, `"info"`

**Returns:** `true` if valid severity, `false` otherwise

```javascript
isValidSeverity("critical") // → true
isValidSeverity("high") // → true
isValidSeverity("invalid") // → false
```

---

#### Error Handling

**`AppError` Class**

Custom error class with status codes and operational flags.

```javascript
class AppError extends Error {
    constructor(message, statusCode = 500, isOperational = true) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = isOperational;
    }
}

// Usage
throw new AppError("Invalid CSV format", 400);
```

---

**`formatApiError(err)`**

Format errors for consistent API responses.

**Returns:** Formatted error object

```javascript
formatApiError(err)
// → {
//     error: "Invalid CSV format",
//     statusCode: 400,
//     timestamp: "2024-01-15T10:30:00Z"
//   }
```

---

**`log(level, message, data)`**

Simple logging utility.

**Levels:** `"info"`, `"warn"`, `"error"`, `"debug"`

```javascript
log("info", "Import started", { filename: "data.csv" });
log("error", "Import failed", { error: err.message });
```

---

**`errorMessages` Object**

User-friendly error templates.

```javascript
errorMessages.csv.invalidFormat     // "Invalid CSV format"
errorMessages.csv.missingColumns    // "Missing required columns"
errorMessages.db.connectionFailed   // "Database connection failed"
errorMessages.api.timeout           // "Request timeout"
```

---

#### Integration Wrappers

**`validateCsvRow(row, rowIndex)`**

Pipeline function for CSV row validation.

**Returns:** `{ valid: boolean, errors: Array<string> }`

```javascript
const result = validateCsvRow(row, 5);
// → {
//     valid: false,
//     errors: ["Invalid CVE format at row 5", "Missing required field: hostname"]
//   }
```

---

**`handleDbOperation(dbOperation)`**

Async wrapper for database operations (returns `[data, error]` tuple).

**Returns:** `[data, null]` on success, `[null, error]` on failure

```javascript
const [data, error] = await handleDbOperation(
    db.prepare("SELECT * FROM vulnerabilities").all()
);

if (error) {
    console.error("Database error:", error);
    return;
}

console.log("Data:", data);
```

---

**Used By:** All frontend forms, CSV import validation, API error handling

---

## Frontend Theme System {#frontend-theme}

### theme-config.js - Theme Configuration Module

**Location:** `app/public/scripts/shared/theme-config.js`
**Since:** v1.0.40 (Theme architecture)
**Purpose:** Single source of truth for all theme parameters (CSS, AG-Grid, ApexCharts)

#### Exported Configuration

**`COLOR_PALETTE`**

Navy/light color schemes with semantic colors.

```javascript
COLOR_PALETTE.navy.primary       // "#1a237e"
COLOR_PALETTE.navy.secondary     // "#283593"
COLOR_PALETTE.navy.background    // "#0a0e27"
COLOR_PALETTE.light.primary      // "#1976d2"
COLOR_PALETTE.light.background   // "#ffffff"
```

---

**`TYPOGRAPHY`**

Font families, sizes, weights.

```javascript
TYPOGRAPHY.fontFamily           // "Inter, system-ui, sans-serif"
TYPOGRAPHY.monoFamily           // "Fira Code, monospace"
TYPOGRAPHY.sizes.xs             // "0.75rem"
TYPOGRAPHY.sizes.base           // "1rem"
TYPOGRAPHY.weights.normal       // 400
TYPOGRAPHY.weights.bold         // 700
```

---

**`SPACING`**

Spacing scale (xs → 3xl).

```javascript
SPACING.xs    // "0.25rem"
SPACING.sm    // "0.5rem"
SPACING.md    // "1rem"
SPACING.lg    // "1.5rem"
SPACING.xl    // "2rem"
SPACING['2xl'] // "3rem"
SPACING['3xl'] // "4rem"
```

---

**`SHADOWS`**

Shadow definitions for light/dark themes.

```javascript
SHADOWS.light.sm    // "0 1px 2px rgba(0,0,0,0.05)"
SHADOWS.dark.sm     // "0 1px 2px rgba(0,0,0,0.3)"
```

---

**`AG_GRID_THEMES`**

AG-Grid Quartz theme parameters.

```javascript
AG_GRID_THEMES.light.accentColor      // "#1976d2"
AG_GRID_THEMES.dark.backgroundColor   // "#0a0e27"
AG_GRID_THEMES.dark.foregroundColor   // "#e0e0e0"
```

---

**`APEX_CHARTS_THEMES`**

ApexCharts theme configuration.

```javascript
APEX_CHARTS_THEMES.light.mode         // "light"
APEX_CHARTS_THEMES.light.palette      // "palette1"
APEX_CHARTS_THEMES.dark.mode          // "dark"
```

---

**`CSS_VARIABLES`**

CSS custom property mappings.

```javascript
CSS_VARIABLES.light['--primary-color']     // "#1976d2"
CSS_VARIABLES.dark['--background-color']   // "#0a0e27"
```

---

#### Key Methods

**`THEME_CONFIG.getTheme(theme)`**

Get complete theme configuration.

**Parameters:**
- `theme` - `"light"` or `"dark"`

**Returns:** Complete theme object

```javascript
const theme = THEME_CONFIG.getTheme("dark");
// → {
//     colors: { ... },
//     typography: { ... },
//     spacing: { ... },
//     shadows: { ... }
//   }
```

---

**`THEME_CONFIG.getAgGridTheme(isDark)`**

Get AG-Grid theme params.

**Returns:** AG-Grid theme parameters object

```javascript
const gridTheme = THEME_CONFIG.getAgGridTheme(true); // dark mode
```

---

**`THEME_CONFIG.getApexChartsTheme(isDark)`**

Get ApexCharts theme.

**Returns:** ApexCharts theme configuration

```javascript
const chartTheme = THEME_CONFIG.getApexChartsTheme(false); // light mode
```

---

**`THEME_CONFIG.getCssVariables(isDark)`**

Get CSS variables for theme.

**Returns:** CSS variable object

```javascript
const vars = THEME_CONFIG.getCssVariables(true);
// → {
//     '--primary-color': '#3b82f6',
//     '--background-color': '#0a0e27',
//     ...
//   }
```

---

**`THEME_CONFIG.applyCssVariables(element, isDark)`**

Apply CSS variables to DOM element.

```javascript
THEME_CONFIG.applyCssVariables(document.documentElement, true);
// Sets all CSS variables on <html> element
```

---

**Used By:** theme-controller.js, ag-grid-theme-manager.js, chart managers, all themed components

---

### vulnerability-constants.js - VPR Color Constants

**Location:** `app/public/scripts/shared/vulnerability-constants.js`
**Since:** v1.0.40
**Purpose:** VPR severity color definitions and utility functions

#### Exported Constants

**`VPR_COLORS`**

Complete color definitions for critical/high/medium/low (light/dark modes).

```javascript
VPR_COLORS.critical.light      // "#dc3545" (red)
VPR_COLORS.critical.dark       // "#ef5350" (lighter red)
VPR_COLORS.critical.rgb        // "220, 53, 69"
VPR_COLORS.critical.cssVar     // "--severity-critical"
VPR_COLORS.critical.textClass  // "text-danger"
VPR_COLORS.critical.bgClass    // "bg-danger"
VPR_COLORS.critical.icon       // "fa-exclamation-circle"
VPR_COLORS.critical.priority   // 1
```

**Severity Levels:**
- `critical` - Red (VPR 9.0-10.0)
- `high` - Orange (VPR 7.0-8.9)
- `medium` - Yellow (VPR 4.0-6.9)
- `low` - Blue (VPR 0.1-3.9)

---

#### Key Functions

**`getVPRColors(theme)`**

Get severity colors array for theme.

**Parameters:**
- `theme` - `"light"` or `"dark"`

**Returns:** Array of color strings `[critical, high, medium, low]`

```javascript
getVPRColors("dark")
// → ["#ef5350", "#ff9800", "#fdd835", "#42a5f5"]
```

---

**`getSeverityColor(severity, theme)`**

Get color config for specific severity.

**Parameters:**
- `severity` - `"critical"`, `"high"`, `"medium"`, or `"low"`
- `theme` - `"light"` or `"dark"`

**Returns:** Color configuration object

```javascript
getSeverityColor("critical", "dark")
// → {
//     name: "critical",
//     light: "#dc3545",
//     dark: "#ef5350",
//     rgb: "220, 53, 69",
//     cssVar: "--severity-critical",
//     textClass: "text-danger",
//     bgClass: "bg-danger",
//     icon: "fa-exclamation-circle",
//     priority: 1
//   }
```

---

**`getVPRColorsFromCSS()`**

Get colors from CSS custom properties (theme-aware).

**Returns:** Array of color strings from `--severity-*` CSS variables

```javascript
getVPRColorsFromCSS()
// → ["#ef5350", "#ff9800", "#fdd835", "#42a5f5"]
```

---

**`getVPRContrastColorsFromCSS()`**

Get WCAG contrast-optimized colors from CSS.

**Returns:** Array of contrast colors

```javascript
getVPRContrastColorsFromCSS()
// → ["#ffffff", "#000000", "#000000", "#ffffff"]
```

---

**`getCurrentTheme()`**

Get current theme from document body.

**Returns:** `"dark"` or `"light"`

```javascript
getCurrentTheme()
// → "dark" (if body has data-bs-theme="dark")
```

---

**Used By:** vulnerability-statistics.js, vulnerability-chart-manager.js, all VPR color displays

---

## Frontend Template System {#frontend-template}

### template-variables.js - Template Variable System

**Location:** `app/public/scripts/shared/template-variables.js`
**Since:** v1.0.21 (Template Editor feature)
**Purpose:** Unified template variable definitions for email/ticket/vulnerability templates

#### Exported Object

**`window.HexTrackrTemplateVariables`**

Contains all template variable definitions.

```javascript
const {
    variables,                    // Array of 20 template variables
    getVariablesByCategory,       // Filter by category
    getAllVariables,              // Get all variables
    getRecommendedVariables       // Get recommended vars for template type
} = window.HexTrackrTemplateVariables;
```

---

#### Variable Categories

**ticket** (4 variables):
- `{{XT_NUMBER}}` - XT ticket number
- `{{HEXAGON_TICKET}}` - Hexagon ticket number
- `{{SERVICENOW_TICKET}}` - ServiceNow ticket number
- `{{STATUS}}` - Ticket status

**location** (2 variables):
- `{{SITE_NAME}}` - Site name
- `{{LOCATION}}` - Location details

**dates** (3 variables):
- `{{DATE_SUBMITTED}}` - Submission date
- `{{DATE_DUE}}` - Due date
- `{{GENERATED_TIME}}` - Generation timestamp

**devices** (2 variables):
- `{{DEVICE_LIST}}` - List of devices
- `{{DEVICE_COUNT}}` - Number of devices

**personnel** (3 variables):
- `{{SUPERVISOR}}` - Supervisor name
- `{{TECHNICIAN}}` - Technician name
- `{{GREETING}}` - Greeting text

**content** (3 variables):
- `{{NOTES}}` - Additional notes
- `{{VULNERABILITY_SUMMARY}}` - Summary text
- `{{VULNERABILITY_DETAILS}}` - Detailed information

**counts** (5 variables):
- `{{TOTAL_VULNERABILITIES}}` - Total vulnerability count
- `{{CRITICAL_COUNT}}` - Critical vulnerabilities
- `{{HIGH_COUNT}}` - High severity
- `{{MEDIUM_COUNT}}` - Medium severity
- `{{LOW_COUNT}}` - Low severity

---

#### Key Methods

**`getVariablesByCategory(categories)`**

Filter variables by category.

**Parameters:**
- `categories` - Array of category names or single category string

**Returns:** Array of variable objects

```javascript
getVariablesByCategory(["ticket", "dates"])
// → [
//     { name: "{{XT_NUMBER}}", description: "...", category: "ticket", required: true },
//     { name: "{{DATE_SUBMITTED}}", description: "...", category: "dates", required: false },
//     ...
//   ]

getVariablesByCategory("content")
// → [
//     { name: "{{NOTES}}", description: "...", category: "content", required: false },
//     ...
//   ]
```

---

**`getAllVariables()`**

Get all variables (backward compatibility).

**Returns:** Array of all 20 template variables

```javascript
getAllVariables()
// → [
//     { name: "{{XT_NUMBER}}", description: "...", ... },
//     { name: "{{SITE_NAME}}", description: "...", ... },
//     ...
//   ]
```

---

**`getRecommendedVariables(templateType)`**

Get recommended variables for template type.

**Parameters:**
- `templateType` - `"ticket"`, `"email"`, or `"vulnerability"`

**Returns:** Array of recommended variable objects

```javascript
getRecommendedVariables("ticket")
// → [
//     { name: "{{XT_NUMBER}}", ... },
//     { name: "{{SITE_NAME}}", ... },
//     { name: "{{DEVICE_LIST}}", ... },
//     ...
//   ]

getRecommendedVariables("email")
// → [
//     { name: "{{SUPERVISOR}}", ... },
//     { name: "{{VULNERABILITY_SUMMARY}}", ... },
//     ...
//   ]
```

---

**Variable Object Structure**

Each variable has:
- `name` - Variable placeholder (e.g., `"{{XT_NUMBER}}"`)
- `description` - Human-readable description
- `required` - Whether variable is required for template type
- `category` - Category name (`"ticket"`, `"location"`, etc.)

```javascript
{
    name: "{{XT_NUMBER}}",
    description: "XT ticket number (e.g., 0042)",
    required: true,
    category: "ticket"
}
```

---

**Used By:** template-editor.js, vulnerability-markdown-editor.js, ticket-markdown-editor.js

---

## Component Utilities {#component-utilities}

### Shared Frontend Components

The following modules in `app/public/scripts/shared/` provide component-level utilities:

#### Navigation & Layout
- **header-loader.js** - Dynamic header loading
- **footer-loader.js** - Dynamic footer loading
- **config-loader.js** - Client-side configuration loading

#### User Experience
- **pagination-controller.js** - Pagination state management (HEX-112)
- **toast-manager.js** - Toast notification system
- **modal-monitoring.js** - Modal state tracking

#### Authentication & Preferences
- **auth-state.js** - Authentication state management (session monitoring, CSRF tokens)
- **preferences-service.js** - User preference persistence (IndexedDB caching, 3-tier cache)
- **preferences-sync.js** - Cross-tab preference synchronization

#### Theme Management
- **theme-controller.js** - Theme switching logic
- **ag-grid-theme-manager.js** - AG-Grid theme synchronization (cross-tab sync)
- **ag-grid-responsive-config.js** - AG-Grid responsive breakpoints

#### WebSocket
- **websocket-client.js** - WebSocket connection management

---

## Database Scripts {#database-scripts}

### Schema & Migration Scripts

**`app/public/scripts/init-database.js`**

Database schema initialization (**DESTRUCTIVE** - drops all tables).

**⚠️ WARNING**: This script destroys ALL data. Only use for fresh installations.

```bash
npm run init-db
```

---

**`app/public/scripts/fix-markdown.js`**

One-time markdown field migration (legacy).

---

**`app/public/scripts/fix-truncated-cves.js`**

One-time CVE truncation fix (legacy).

---

**`app/public/scripts/split-changelog.js`**

Changelog file splitting utility.

---

## Development Tools {#development-tools}

### version-manager.js - Version Management CLI

**Location:** `app/public/scripts/version-manager.js`
**Since:** v1.0.0
**Purpose:** Automated version number updates across all application files

#### Key Functions

**`getCurrentVersion()`**

Get version from package.json.

**Returns:** Version string (e.g., `"1.0.54"`)

```javascript
const version = getCurrentVersion();
// → "1.0.54"
```

---

**`updateVersion(newVersion)`**

Update version across 6+ files.

**Updated Files:**
- `package.json`
- `tickets.html` (version span)
- `vulnerabilities.html` (version span)
- `scripts/shared/footer.html` (badge URL)
- `CLAUDE.md` (version header)
- `hextrackr-specs/roadmap.json` (metadata)

**Security:** Uses `PathValidator` class for secure file operations.

```javascript
updateVersion("1.0.55");
// Updates all files with new version
```

---

**`validateVersion(version)`**

Validate semver format (X.Y.Z).

**Returns:** `true` if valid semver, `false` otherwise

```javascript
validateVersion("1.0.54") // → true
validateVersion("1.0") // → false (incomplete)
validateVersion("v1.0.54") // → false (no prefix)
```

---

**CLI Usage:**

```bash
node app/public/scripts/version-manager.js 1.0.55
# Updates all files to version 1.0.55
```

---

## Summary

HexTrackr's utility layer provides 31+ specialized modules across backend and frontend:

- **Backend Core** (6 modules): 40+ functions for vulnerability processing, security, progress tracking
- **Frontend Validation** (3 modules): 19+ functions for CVE processing, validation, secure ID generation
- **Frontend Theme System** (2 modules): Comprehensive theme management with AG-Grid/ApexCharts integration
- **Frontend Template System** (1 module): 20 template variables with category-based filtering
- **Component Utilities** (13 modules): Shared frontend components for navigation, UX, auth, theme management
- **Database Scripts** (4 modules): Schema initialization and migrations
- **Development Tools** (1 module): Version management automation

**Key Patterns:**
- **Security-first**: PathValidator prevents directory traversal attacks
- **Real-time updates**: ProgressTracker with throttled WebSocket events
- **Multi-tier deduplication**: 5-tier confidence scoring for vulnerability imports
- **Vendor normalization**: Dynamic pattern-based vendor classification (CISCO, Palo Alto, Other)
- **CVE processing**: 12 functions for parsing, validation, link creation, event handling
- **Theme consistency**: Centralized theme configuration for CSS, AG-Grid, ApexCharts
- **Template variables**: 20 variables across 6 categories with type-based recommendations

---

**Last Updated:** 2025-10-09
**Version:** 1.0.54
