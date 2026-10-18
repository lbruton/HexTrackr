---
tags: []
doc_type: reference
project: hextrackr
source: manual
created: "2026-03-12"
updated: "2026-03-12"
sourceFiles:
  - app/public/docs-source/api-reference/utilities.md
---

# Utilities

Core utility modules and helper functions for HexTrackr vulnerability management.

## Overview

HexTrackr's utility layer provides 31+ specialized modules across backend and frontend for vulnerability processing, security validation, theme management, template systems, and data transformation.

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

## Backend Core Utilities

### helpers.js - Vulnerability Processing Library

**Location:** `app/utils/helpers.js`
**Purpose:** Primary utility library for CSV import, vulnerability normalization, and deduplication

#### Data Normalization Functions

**`normalizeVendor(vendor, hostname)`**

Normalize vendor names using pattern matching against `import.config.json` rules.

**Returns:** `"CISCO"`, `"Palo Alto"`, or `"Other"`

```javascript
const { normalizeVendor } = require('./utils/helpers');

normalizeVendor("Cisco Systems", "fw-01")     // -> "CISCO"
normalizeVendor("palo alto networks", "pan-fw") // -> "Palo Alto"
normalizeVendor("Unknown", "nfpan-fw01")       // -> "Palo Alto" (hostname prefix)
normalizeVendor("Unknown", "nrwan-rtr01")      // -> "CISCO" (hostname prefix)
normalizeVendor("Fortinet", "fg-fw01")         // -> "Other"
```

**Configuration:** Patterns defined in `app/config/import.config.json`:
- `familyVendorPatterns`: Match vendor name in "family" field
- `hostnameVendorPatterns`: Match vendor in hostname (e.g., "nfpan" -> Palo Alto)

**`normalizeHostname(hostname)`**

Normalize hostnames for consistent deduplication (handles IP addresses vs domain names). Returns normalized hostname string or `null`.

**`normalizeIPAddress(ipAddress)`**

Extract and validate first IP from multi-IP strings. Returns first valid IP address or original value.

**`isValidIPAddress(ip)`**

Validate IPv4 addresses with octet range checking (0-255).

**`normalizeXtNumber(value)`**

Normalize XT ticket numbers to 4-digit zero-padded format.

```javascript
normalizeXtNumber("42")    // -> "0042"
normalizeXtNumber("XT-42") // -> "0042" (strips prefix)
```

#### String & Hashing Functions

**`createDescriptionHash(description)`**

Generate MD5 hash of normalized description (first 8 characters). Used for deduplication when CVE and plugin ID are unavailable.

**`extractScanDateFromFilename(filename)`**

Parse scan dates from CSV filenames using 4 pattern types:
- `YYYY-MM-DD` (e.g., `scan-2024-01-15.csv`)
- `MM-DD-YYYY` (e.g., `scan-01-15-2024.csv`)
- `YYYYMMDD` (e.g., `scan-20240115.csv`)
- `DD-MM-YYYY` (e.g., `scan-15-01-2024.csv`)

Returns ISO date string (`YYYY-MM-DD`) or `null`.

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

**`calculateDeduplicationConfidence(uniqueKey)`** - Returns confidence percentage (25-95%).

**`getDeduplicationTier(uniqueKey)`** - Returns tier number (1-5).

#### CSV Data Mapping Functions

**`mapVulnerabilityRow(row)`**

Map Tenable CSV row to vulnerability object(s) with multi-CVE splitting. Single row with multiple CVEs creates separate vulnerability records.

**`mapTicketRow(row, index)`**

Map CSV row to ticket object structure with normalized fields.

---

### constants.js - Application Constants

**Location:** `app/utils/constants.js`
**Purpose:** Centralized configuration constants for network, security, database, and API

#### Constant Categories

| Category | Examples |
|----------|---------|
| **Network** | `PORT`, `WEBSOCKET_PORT`, `CORS_ORIGINS`, `CORS_METHODS`, `CORS_HEADERS` |
| **File System** | `UPLOADS_DIRECTORY`, `DATA_DIRECTORY`, `BACKUPS_DIRECTORY`, `DATABASE_FILENAME` |
| **File Size** | `MAX_FILE_SIZE` (100MB), `EXPRESS_JSON_LIMIT` (50mb) |
| **Rate Limiting** | `RATE_LIMIT_WINDOW_MS` (15min prod / 1min dev), `RATE_LIMIT_MAX_REQUESTS` (60 prod / 10000 dev) |
| **Security Headers** | `X_CONTENT_TYPE_OPTIONS`, `X_FRAME_OPTIONS`, `X_XSS_PROTECTION` |
| **Progress** | `PROGRESS_THROTTLE_INTERVAL` (100ms), `SESSION_CLEANUP_INTERVAL` (30min) |
| **Database** | `BATCH_SIZE` (1000), `PROGRESS_UPDATE_INTERVAL` (100), `DESCRIPTION_TRUNCATE_LENGTH` (500) |
| **API Endpoints** | 39+ endpoint paths via `API_ENDPOINTS` object |
| **Time Intervals** | `FIFTEEN_MINUTES`, `THIRTY_MINUTES`, `ONE_HOUR`, `ONE_DAY`, `ONE_WEEK` |

---

### PathValidator Class - Security Utility

**Location:** `app/middleware/security.js` (lines 36-131)
**Purpose:** Prevent directory traversal attacks and validate file paths

**`PathValidator.validatePath(filePath)`** - Validate and normalize paths, detect traversal attempts. Throws Error if path contains traversal patterns (`../`, absolute paths, null bytes).

**Security Patterns Blocked:**
- `../` (directory traversal)
- Absolute paths (`/etc/`, `C:\`, etc.)
- Null byte injection (`\0`)
- Symlink attacks
- Path normalization exploits

**Safe File Operation Methods:**

- `safeReadFileSync(filePath, options)` - Secure file reading
- `safeWriteFileSync(filePath, data, options)` - Secure file writing
- `safeReaddirSync(dirPath, options)` - Secure directory reading
- `safeStatSync(filePath)` - Secure file stat
- `safeExistsSync(filePath)` - Secure existence check
- `safeUnlinkSync(filePath)` - Secure file deletion

---

### ProgressTracker.js - Real-time Progress Management

**Location:** `app/utils/ProgressTracker.js`
**Purpose:** WebSocket-based progress tracking for long-running operations (CSV imports, backups)

For the complete ProgressTracker reference including session lifecycle, event payloads, and throttling behavior, see [[WebSocket Architecture]].

**Key Methods:**

- `createSession(metadata)` - Create new session with auto-generated UUID
- `createSessionWithId(sessionId, metadata)` - Create session with specific ID
- `updateProgress(sessionId, progress, message, additionalData)` - Throttled updates (100ms)
- `completeSession(sessionId, message, finalData)` - Mark complete (auto-delete after 5s)
- `errorSession(sessionId, errorMessage, errorData)` - Mark errored (auto-delete after 5s)
- `getSession(sessionId)` - Retrieve session data
- `cleanupStaleSessions()` - Remove sessions inactive for 30+ minutes

---

### seedEmailTemplates.js - Template Seeding Utilities

**Location:** `app/utils/seedEmailTemplates.js`
**Purpose:** Seed and repair default email/ticket/vulnerability templates

**Key Functions:**

- `seedEmailTemplates(db)` - Seed default email template (11 variables)
- `seedTicketTemplates(db)` - Seed default ticket template (14 variables)
- `seedVulnerabilityTemplates(db)` - Seed default vulnerability template (11 variables)
- `seedAllTemplates(db)` - Seed all templates at once
- `resetTemplateToDefault(db, templateName)` - Reset to default content
- `contentLooksMismatched(content, category)` - Validate template integrity

**Template Variables:**

| Category | Variables |
|----------|-----------|
| **Email** (11) | `SUPERVISOR`, `SITE_NAME`, `TOTAL_VULNERABILITIES`, `CRITICAL_COUNT`, `HIGH_COUNT`, `MEDIUM_COUNT`, `LOW_COUNT`, `VULNERABILITY_SUMMARY`, `GENERATED_TIME`, `GREETING`, `NOTES` |
| **Ticket** (14) | `XT_NUMBER`, `HEXAGON_TICKET`, `SERVICENOW_TICKET`, `STATUS`, `SITE_NAME`, `LOCATION`, `DATE_SUBMITTED`, `DATE_DUE`, `DEVICE_LIST`, `DEVICE_COUNT`, `NOTES`, `SUPERVISOR`, `TECHNICIAN`, `GENERATED_TIME` |
| **Vulnerability** (11) | `VULNERABILITY_SUMMARY`, `VULNERABILITY_DETAILS`, `TOTAL_VULNERABILITIES`, `CRITICAL_COUNT`, `HIGH_COUNT`, `MEDIUM_COUNT`, `LOW_COUNT`, `SITE_NAME`, `LOCATION`, `GENERATED_TIME`, `NOTES` |

---

## Backend Configuration Utilities

### importConfig.js - Vendor Pattern Configuration

**Location:** `app/config/importConfig.js`
**Purpose:** Dynamic vendor normalization patterns (CISCO, Palo Alto) with regex caching

- `getImportConfig()` - Get cached config or load from disk
- `refreshImportConfig()` - Force reload (for config file changes)
- `resolveConfigPath()` - Resolve config path (env var or default)

**Configuration File:** `app/config/import.config.json`

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

---

## Frontend Validation Utilities

### cve-utilities.js - CVE Link & Event Management

**Location:** `app/public/scripts/shared/cve-utilities.js`
**Purpose:** Centralized CVE validation, parsing, link creation, and event handling

#### Validation Functions

- `validateCVE(cve)` - Validate CVE-YYYY-NNNNN format
- `validateCiscoSA(id)` - Validate Cisco Security Advisory format

#### Parsing Functions

- `parseCVEString(cveString)` - Parse comma/space-separated CVE lists
- `extractCVEIds(cveString, firstOnly)` - Extract CVE IDs as array or single value
- `getFirstCVE(cveString)` - Get first CVE from multi-CVE string
- `normalizeCVE(cve)` - Normalize to uppercase standard format
- `countCVEs(cveString)` - Count valid CVEs in string

#### Link Creation Functions

- `createCVELink(cveId, options)` - Create single CVE link with event isolation
- `createMultipleCVELinks(cveString, options)` - Create multiple CVE links with separator
- `createCVESummary(cveString, options)` - Create "CVE-XXX +N more" summary display

#### Event Handling Functions

- `attachCVEEventHandlers(container, lookupHandler, options)` - Event delegation for CVE clicks (prevents duplication)
- `removeCVEEventHandlers(container)` - Cleanup event handlers

### crypto-utils.js - Secure ID Generation

**Location:** `app/public/scripts/shared/crypto-utils.js`
**Purpose:** Cryptographically secure random ID generation with HTTPS/HTTP fallback

**`generateSecureId(prefix, randomBytes)`**

- **HTTPS**: Uses `window.crypto.getRandomValues()` for cryptographically secure random IDs
- **HTTP fallback**: Uses `Date.now() + performance.now()` for non-secure contexts
- **Compact encoding**: Base36 encoding for shorter IDs

### validation-utils.js - Frontend Validation Library

**Location:** `app/public/scripts/validation-utils.js`
**Purpose:** Comprehensive validation and error handling for CSV imports and forms

#### Validation Functions

- `isValidCVE(cve)` - CVE format validation: `CVE-YYYY-NNNN+`
- `isValidIP(ip)` - IPv4 and IPv6 validation
- `isValidVPR(score)` - VPR score validation (0.0-10.0)
- `normalizeDate(dateInput)` - Normalize dates to ISO 8601 format
- `isValidHostname(hostname)` - DNS hostname validation
- `isValidSeverity(severity)` - Severity level validation

#### Error Handling

- `AppError` class - Custom error with status codes and operational flags
- `formatApiError(err)` - Format errors for consistent API responses
- `log(level, message, data)` - Simple logging utility
- `errorMessages` object - User-friendly error templates
- `validateCsvRow(row, rowIndex)` - Pipeline function for CSV row validation
- `handleDbOperation(dbOperation)` - Async wrapper returning `[data, error]` tuple

---

## Frontend Theme System

### theme-config.js - Theme Configuration Module

**Location:** `app/public/scripts/shared/theme-config.js`
**Purpose:** Single source of truth for all theme parameters (CSS, AG-Grid, ApexCharts)

**Exported Configuration:**

| Export | Description |
|--------|-------------|
| `COLOR_PALETTE` | Navy/light color schemes with semantic colors |
| `TYPOGRAPHY` | Font families, sizes, weights |
| `SPACING` | Spacing scale (xs -> 3xl) |
| `SHADOWS` | Shadow definitions for light/dark themes |
| `AG_GRID_THEMES` | AG-Grid Quartz theme parameters |
| `APEX_CHARTS_THEMES` | ApexCharts theme configuration |
| `CSS_VARIABLES` | CSS custom property mappings |

**Key Methods:**

- `THEME_CONFIG.getTheme(theme)` - Get complete theme configuration
- `THEME_CONFIG.getAgGridTheme(isDark)` - Get AG-Grid theme params
- `THEME_CONFIG.getApexChartsTheme(isDark)` - Get ApexCharts theme
- `THEME_CONFIG.getCssVariables(isDark)` - Get CSS variables for theme
- `THEME_CONFIG.applyCssVariables(element, isDark)` - Apply CSS variables to DOM element

### vulnerability-constants.js - VPR Color Constants

**Location:** `app/public/scripts/shared/vulnerability-constants.js`
**Purpose:** VPR severity color definitions and utility functions

**VPR_COLORS** provides complete color definitions for critical/high/medium/low in both light and dark modes, including:
- Light/dark hex values
- RGB values
- CSS variable names
- Bootstrap text/bg classes
- FontAwesome icon names
- Priority ordering

**Severity Levels:**
- `critical` - Red (VPR 9.0-10.0)
- `high` - Orange (VPR 7.0-8.9)
- `medium` - Yellow (VPR 4.0-6.9)
- `low` - Blue (VPR 0.1-3.9)

**Key Functions:**

- `getVPRColors(theme)` - Get severity colors array for theme
- `getSeverityColor(severity, theme)` - Get color config for specific severity
- `getVPRColorsFromCSS()` - Get colors from CSS custom properties (theme-aware)
- `getVPRContrastColorsFromCSS()` - Get WCAG contrast-optimized colors
- `getCurrentTheme()` - Get current theme from document body

---

## Frontend Template System

### template-variables.js - Template Variable System

**Location:** `app/public/scripts/shared/template-variables.js`
**Purpose:** Unified template variable definitions for email/ticket/vulnerability templates

**Variable Categories:**

| Category | Count | Examples |
|----------|-------|---------|
| ticket | 4 | `{{XT_NUMBER}}`, `{{STATUS}}` |
| location | 2 | `{{SITE_NAME}}`, `{{LOCATION}}` |
| dates | 3 | `{{DATE_SUBMITTED}}`, `{{DATE_DUE}}`, `{{GENERATED_TIME}}` |
| devices | 2 | `{{DEVICE_LIST}}`, `{{DEVICE_COUNT}}` |
| personnel | 3 | `{{SUPERVISOR}}`, `{{TECHNICIAN}}`, `{{GREETING}}` |
| content | 3 | `{{NOTES}}`, `{{VULNERABILITY_SUMMARY}}`, `{{VULNERABILITY_DETAILS}}` |
| counts | 5 | `{{TOTAL_VULNERABILITIES}}`, `{{CRITICAL_COUNT}}`, etc. |

**Key Methods:**

- `getVariablesByCategory(categories)` - Filter variables by category
- `getAllVariables()` - Get all 20 template variables
- `getRecommendedVariables(templateType)` - Get recommended vars for template type ("ticket", "email", "vulnerability")

---

## Component Utilities

Shared frontend components in `app/public/scripts/shared/`:

**Navigation & Layout:** `header-loader.js`, `footer-loader.js`, `config-loader.js`

**User Experience:** `pagination-controller.js` (HEX-112), `toast-manager.js`, `modal-monitoring.js`

**Authentication & Preferences:** `auth-state.js`, `preferences-service.js` (IndexedDB caching, 3-tier cache), `preferences-sync.js`

**Theme Management:** `theme-controller.js`, `ag-grid-theme-manager.js` (cross-tab sync), `ag-grid-responsive-config.js`

**WebSocket:** `websocket-client.js`

---

## Database Scripts

- **`app/public/scripts/init-database.js`** - Database schema initialization (DESTRUCTIVE - drops all tables). Only use for fresh installations.
- **`app/public/scripts/fix-markdown.js`** - One-time markdown field migration (legacy)
- **`app/public/scripts/fix-truncated-cves.js`** - One-time CVE truncation fix (legacy)
- **`app/public/scripts/split-changelog.js`** - Changelog file splitting utility

---

## Development Tools

### version-manager.js - Version Management CLI

**Location:** `app/public/scripts/version-manager.js`
**Purpose:** Automated version number updates across all application files

- `getCurrentVersion()` - Get version from package.json
- `updateVersion(newVersion)` - Update version across 6+ files (package.json, HTML files, footer, CLAUDE.md, roadmap)
- `validateVersion(version)` - Validate semver format (X.Y.Z)

Uses `PathValidator` for secure file operations.

```bash
node app/public/scripts/version-manager.js 1.0.55
```

---

## Summary

**Key Patterns:**
- **Security-first**: PathValidator prevents directory traversal attacks
- **Real-time updates**: ProgressTracker with throttled WebSocket events
- **Multi-tier deduplication**: 5-tier confidence scoring for vulnerability imports
- **Vendor normalization**: Dynamic pattern-based vendor classification (CISCO, Palo Alto, Other)
- **CVE processing**: 12 functions for parsing, validation, link creation, event handling
- **Theme consistency**: Centralized theme configuration for CSS, AG-Grid, ApexCharts
- **Template variables**: 20 variables across 6 categories with type-based recommendations

---

## Related

- [[API Reference]]
- [[Frontend API]]
- [Security Architecture](/Volumes/DATA/GitHub/Devops/DocVault/Projects/HexTrackr/Security%20Architecture.md)
- [[WebSocket Architecture]]
- [Backend Architecture](/Volumes/DATA/GitHub/Devops/DocVault/Projects/HexTrackr/Backend%20Architecture.md)
- [[Theme Architecture]]
- [[Version Management]]
