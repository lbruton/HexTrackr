# Frontend API Reference

> Complete documentation for HexTrackr's frontend architecture, including page managers, shared components, and utilities

## Overview

HexTrackr's frontend uses vanilla JavaScript with a modular, class-based architecture. Components follow a consistent pattern using ES6 modules, with clear separation between page-specific logic, shared components, and utilities.

**Core Technologies:**

- Vanilla JavaScript (ES6+)
- AG-Grid for data tables
- ApexCharts for visualizations
- Tabler.io CSS framework
- WebSocket for real-time updates

---

## Page Components {#page-components}

Page components manage the main functionality for each application page.

### VulnerabilitiesPage

**Location:** `app/public/scripts/pages/vulnerabilities.js`

The main vulnerability management interface.

**Key Features:**

- Real-time vulnerability grid with AG-Grid
- Interactive charts and statistics
- CSV import with progress tracking
- Advanced filtering and search
- WebSocket integration for live updates

**Main Components:**

- `ModernVulnManager` - Main orchestrator class
- `VulnerabilityCoreOrchestrator` - Central module coordinator (Phase 2 modularization)
- `VulnerabilityDataManager` - Data operations
- `VulnerabilityGridManager` - AG-Grid integration
- `VulnerabilityChartManager` - ApexCharts visualizations

**Initialization:**

```javascript
// Auto-initializes on DOMContentLoaded
const vulnManager = new ModernVulnManager();
```

**Key Methods:**
| Method | Purpose |
|--------|---------|
| `init()` | Initialize all components and load data |
| `loadVulnerabilities()` | Fetch and display vulnerability data |
| `setupEventListeners()` | Configure UI interactions |
| `handleImport()` | Manage CSV import process |
| `applyFilters()` | Apply search and filter criteria |
| `exportData()` | Export filtered data to CSV |

### VulnerabilityCoreOrchestrator

**Location:** `app/public/scripts/shared/vulnerability-core.js`
**Since:** Phase 2 Modularization (T004)

Central coordination hub for the vulnerability management system. Implements the **modular orchestrator pattern** that provides clean separation of concerns and event-driven communication between specialized modules.

**Key Responsibilities:**

- **Module Lifecycle Management**: Creates and initializes all specialized managers
- **Inter-Module Communication**: Coordinates data flow between modules via event system
- **State Synchronization**: Ensures consistent state across all components
- **Cross-Cutting Concerns**: Handles WebSocket integration, theme changes, error handling
- **Delegation Pattern**: ModernVulnManager delegates all operations to orchestrator

**Architecture Pattern:**

```javascript
// ModernVulnManager creates orchestrator
this.coreOrchestrator = new VulnerabilityCoreOrchestrator();
await this.coreOrchestrator.initializeAllModules(this);

// All operations delegated to orchestrator
switchView(view) {
    return this.coreOrchestrator.switchView(view);
}
```

**Managed Modules:**

| Module | Responsibility |
|--------|---------------|
| `VulnerabilityDataManager` | API communication, data caching |
| `VulnerabilityStatisticsManager` | Statistical calculations and analysis |
| `VulnerabilityChartManager` | ApexCharts visualization |
| `VulnerabilitySearchManager` | Search and filtering |
| `VulnerabilityGridManager` | AG-Grid table rendering |
| `VulnerabilityCardsManager` | Device card views |
| `WebSocketClient` | Real-time updates |
| `ProgressModal` | Long-running operation feedback |

**Core Methods:**

- `initializeAllModules(parentContext)` - Single initialization point for all modules
- `setupDataManagerListeners()` - Coordinate cross-module data events
- `setupThemeListeners()` - Synchronize theme changes across components
- `switchView(view)` - Toggle between table and card views
- `loadData()` - Orchestrate data loading across all modules
- `viewDeviceDetails(hostname)` - Coordinate device detail modal
- `exportVulnerabilityReport()` - Generate CSV exports

**Event Coordination:**

The orchestrator uses event-driven architecture to maintain loose coupling:

```javascript
// Data manager emits events
this.dataManager.on('data-loaded', () => {
    this.statisticsManager.calculate();
    this.chartManager.render();
    this.gridManager.refresh();
});

// Theme changes propagate to all components
this.setupThemeListeners(); // Updates grid, charts, modals
```

**Benefits:**

- **Maintainability**: Each module has single responsibility
- **Testability**: Modules can be tested independently
- **Scalability**: Easy to add new modules without touching existing code
- **Debugging**: Clear data flow and event tracking
- **Performance**: Efficient coordination prevents redundant operations

### TicketsPage

**Location:** `app/public/scripts/pages/tickets.js`

Support ticket management interface.

**Key Features:**

- Ticket CRUD operations
- Device association management
- Status workflow visualization
- Priority-based sorting
- Real-time updates

**Main Components:**

- `HexagonTicketsManager` - Main ticket controller class
- AG-Grid for ticket table rendering
- Device management modals

**Key Methods:**
| Method | Purpose |
|--------|---------|
| `init()` | Initialize ticket interface |
| `loadTicketsFromDB()` | Fetch tickets from database API |
| `renderTickets()` | Display tickets in table with pagination |
| `saveTicket()` | Create or update ticket |
| `editTicket(id)` | Open ticket edit modal |
| `viewTicket(id)` | Display read-only ticket details |
| `deleteTicket(id)` | Remove ticket with confirmation |
| `bundleTicketFiles(id)` | Generate downloadable ticket bundle |

---

## Shared Components {#shared-components}

Reusable components used across multiple pages.

### ThemeController

**Location:** `app/public/scripts/shared/theme-controller.js`

Manages light/dark theme switching with CSS variable updates.

**Features:**

- Persistent theme preference (localStorage)
- Smooth transitions
- Dynamic CSS variable updates
- AG-Grid theme synchronization
- Chart theme adaptation

**Usage:**

```javascript
const themeController = new ThemeController();
themeController.initializeToggle();
```

### AG-Grid Configuration Functions

**Location:** `app/public/scripts/shared/ag-grid-responsive-config.js`

Provides responsive AG-Grid configuration functions with theme support and optimized column definitions.

**Primary Function:**

```javascript
createVulnerabilityGridOptions(componentContext, isDarkMode, usePagination)
```

**Features:**

- Responsive column definitions with mobile/desktop breakpoints
- Automatic theme detection and application
- Custom cell renderers for vulnerabilities, vendors, CVEs
- Optimized column widths (minWidth, maxWidth, flex)
- Pagination support (optional)

**Usage Example:**

```javascript
import { createVulnerabilityGridOptions } from './ag-grid-responsive-config.js';

// Create grid options for vulnerabilities page
const gridOptions = createVulnerabilityGridOptions(
    this,           // Component context for callbacks
    false,          // isDarkMode (false = light theme)
    true            // usePagination (true = enable pagination)
);

// Apply to AG-Grid
const gridApi = agGrid.createGrid(gridContainer, gridOptions);
```

**Column Definitions:**

The function generates responsive columnDefs with:
- Optimized widths based on screen size (mobile, desktop)
- Custom cell renderers for CVE links, vendor badges, VPR scores
- Built-in filtering and sorting
- Hide/show logic for mobile screens

### AGGridThemeManager

**Location:** `app/public/scripts/shared/ag-grid-theme-manager.js`
**Since:** v1.0.40+

Centralized theme management for all AG-Grid instances across the application.

**Key Features:**

- **Unified Theme Control**: Single source of truth for grid themes across all pages
- **Dynamic Theme Switching**: Instant theme updates without page reload
- **Cross-Tab Synchronization**: Theme changes propagate across browser tabs via localStorage events
- **Grid Instance Registry**: Tracks all active grid instances for coordinated updates
- **Dark Mode Surface Hierarchy**: Implements proper surface elevation for dark mode (base → surface-1 → surface-2)

**Architecture Pattern:**

```javascript
// Register grid instance on creation
AGGridThemeManager.registerGrid(gridApi, 'vulnerabilities-grid');

// Theme changes automatically update all registered grids
AGGridThemeManager.applyTheme('dark'); // Updates all grids instantly
```

**Core Methods:**

- `registerGrid(gridApi, gridId)` - Register new grid instance for theme management
- `unregisterGrid(gridId)` - Remove grid from theme tracking
- `applyTheme(theme)` - Apply theme to all registered grids
- `getCurrentTheme()` - Get active theme ('light' or 'dark')
- `setupCrossTabSync()` - Enable theme synchronization across browser tabs

**Surface Hierarchy (Dark Mode):**

```css
/* Grid theme uses proper surface elevation */
--ag-background-color: var(--hextrackr-surface-2);     /* Table body */
--ag-header-background-color: var(--hextrackr-surface-1); /* Headers */
--ag-row-hover-color: var(--hextrackr-surface-3);     /* Hover state */
```

**Cross-Tab Sync:**

```javascript
// Automatic sync via localStorage events
window.addEventListener('storage', (e) => {
    if (e.key === 'hextrackr-theme') {
        AGGridThemeManager.applyTheme(e.newValue);
    }
});
```

### PaginationController

**Location:** `app/public/scripts/shared/pagination-controller.js`
**Since:** v1.0.42 (HEX-112)

User-facing pagination controls for device cards and large datasets.

**Key Features:**

- **Dynamic Page Size**: User-selectable rows per page (10, 25, 50, 100)
- **Page Navigation**: First, Previous, Next, Last buttons with keyboard shortcuts
- **Status Display**: "Showing X-Y of Z results" with real-time updates
- **Responsive Design**: Mobile-friendly pagination controls
- **State Persistence**: Remembers user's page size preference

**Constructor:**

```javascript
// Constructor takes simple parameters (not options object)
constructor(defaultPageSize = 12, availableSizes = [6, 12, 24, 48, 64, 96])
```

**Usage:**

```javascript
// Create pagination controller with default page size and available sizes
const pagination = new PaginationController(25, [10, 25, 50, 100]);

// Set total items (required before rendering)
pagination.setTotalItems(1245);

// Render pagination controls with callback
pagination.renderPaginationControls('paginationContainer', () => {
    // This callback is invoked when user changes pages
    const currentPage = pagination.getCurrentPage();
    const pageSize = pagination.getPageInfo().pageSize;
    renderPage(currentPage, pageSize);
});

// Navigate programmatically
pagination.setCurrentPage(3);
```

**Core Methods:**

- `setTotalItems(count)` - Update total item count and recalculate pages
- `getCurrentPageData(items)` - Get items for current page from array
- `setCurrentPage(page)` - Navigate to specific page
- `setPageSize(size)` - Change items per page (must be in availableSizes)
- `getPageInfo()` - Get pagination state (currentPage, totalPages, pageSize, etc.)
- `renderTopControls(containerId, onPageSizeChange, options)` - Render sort dropdown + items-per-page above cards
- `renderPaginationControls(containerId, onPageChange)` - Render bottom pagination arrows/numbers

**Generated HTML Structure** *(for reference only - do not create manually)*:

```html
<!-- Auto-generated by renderPaginationControls() -->
<div class="pagination-controls">
    <div class="pagination-info">Showing 1-25 of 1,245 results</div>
    <div class="pagination-buttons">
        <button class="btn-first">First</button>
        <button class="btn-prev">Previous</button>
        <span class="page-indicator">Page 1 of 50</span>
        <button class="btn-next">Next</button>
        <button class="btn-last">Last</button>
    </div>
    <select class="page-size-selector">
        <option value="10">10 per page</option>
        <option value="25" selected>25 per page</option>
        <option value="50">50 per page</option>
        <option value="100">100 per page</option>
    </select>
</div>
```

**Note:** The HTML structure above is automatically generated by the `renderPaginationControls()` and `renderTopControls()` methods. Do not create this HTML manually - let the controller generate it.

### VulnerabilityDataManager

**Location:** `app/public/scripts/shared/vulnerability-data.js`

Core data management for vulnerabilities.

**Responsibilities:**

- API communication
- Data caching
- Filter application
- Sort operations
- Export preparation

**Key Methods:**
| Method | Purpose |
|--------|---------|
| `fetchVulnerabilities()` | Load data from API |
| `filterData()` | Apply client-side filters |
| `sortData()` | Sort by various criteria |
| `exportToCSV()` | Generate CSV export |
| `getCachedData()` | Retrieve cached results |

### WebSocketClient

**Location:** `app/public/scripts/shared/websocket-client.js`

Real-time communication handler.

**Features:**

- Auto-reconnection
- Event-based messaging
- Progress tracking
- Error recovery
- Connection state management

**Events:**
| Event | Purpose |
|-------|---------|
| `import-progress` | CSV import updates |
| `vulnerability-added` | New vulnerability notification |
| `ticket-updated` | Ticket status change |
| `connection-status` | Connection state changes |

### ModalManager Classes

Multiple modal components for different purposes:

#### VulnerabilityDetailsModal

**Location:** `app/public/scripts/shared/vulnerability-details-modal.js`
**Since:** v1.0.22 (Enhanced v2.0 in HEX-151)

Displays detailed vulnerability information with integrated KEV checking and Cisco PSIRT lookup.

**Features:**

- **CVE Links and References**: Direct links to NVD, MITRE, and vendor advisories
- **CVSS Score Breakdown**: Visual representation of CVSS metrics with explanations
- **Remediation Guidance**: Solution steps and patching recommendations
- **Plugin Output Display**: Raw scanner output with syntax highlighting
- **Related Vulnerabilities**: Shows other CVEs affecting the same device
- **KEV Integration (v1.0.51)**: Automatic CISA KEV lookup with visual indicators
- **Cisco PSIRT Integration**: Fixed version information for Cisco CVEs

**KEV Modal Features (HEX-151 Enhancement):**

```javascript
// Automatic KEV lookup when modal opens
async showVulnerabilityDetails(vulnId) {
    const vuln = await fetchVulnerability(vulnId);

    // Check if this CVE is in CISA KEV catalog
    if (vuln.cve) {
        const kevData = await fetchKEVData(vuln.cve);
        if (kevData.isKEV) {
            displayKEVBanner(kevData);
        }
    }

    displayVulnerabilityDetails(vuln);
}
```

**KEV Data Display:**

- **Ransomware Flag**: Highlighted if CVE is known to be used in ransomware attacks
- **Vendor Project**: Shows affected vendor/product from CISA
- **Date Added**: When CISA added to KEV catalog
- **Required Action**: CISA's mandated remediation action
- **Due Date**: Federal agency remediation deadline
- **Notes**: Additional CISA context and warnings

**Cisco PSIRT Display:**

- **Fixed Versions**: Shows which software versions patch the vulnerability
- **Advisory Link**: Direct link to Cisco security advisory
- **Platform Coverage**: Lists affected platforms and fixed versions per platform

#### ProgressModal

**Location:** `app/public/scripts/shared/progress-modal.js`

Shows progress for long-running operations.

**Features:**

- Real-time percentage updates
- ETA calculation
- Cancel capability
- WebSocket integration

#### SettingsModal

**Location:** `app/public/scripts/shared/settings-modal.js`

Global application settings interface.

**Features:**

- Theme preferences
- Grid configuration
- Export settings
- Data management operations
- Backup/restore functionality

#### DeviceSecurityModal

**Location:** `app/public/scripts/shared/device-security-modal.js`

Device management for tickets.

**Features:**

- Device list editing
- Bulk operations
- Validation
- Auto-save

### ChartManager Components

#### VulnerabilityChartManager

**Location:** `app/public/scripts/shared/vulnerability-chart-manager.js`

Manages ApexCharts visualizations.

**Charts:**

- Severity distribution (donut)
- Trend analysis (line)
- Top vulnerabilities (bar)
- Risk matrix (heatmap)

**Features:**

- Dynamic theme adaptation
- Responsive sizing
- Interactive tooltips
- Export to image

#### VulnerabilityStatistics

**Location:** `app/public/scripts/shared/vulnerability-statistics.js`

Statistical calculations and displays.

**Metrics:**

- Total vulnerabilities
- Critical/High/Medium/Low counts
- Average CVSS score
- VPR distribution
- Remediation progress

### ToastManager

**Location:** `app/public/scripts/shared/toast-manager.js`

Notification system for user feedback.

**Features:**

- Multiple severity levels
- Auto-dismiss
- Action buttons
- Queue management
- Accessibility support

**Usage:**

```javascript
ToastManager.show('Operation successful', 'success');
ToastManager.show('Error occurred', 'error', { duration: 5000 });
```

### HeaderManager

**Location:** `app/public/scripts/shared/header.js`

Dynamic header with theme toggle and user menu.

**Components:**

- Theme toggle button
- User dropdown
- Navigation state
- Notification badges

### PreferencesSync

**Location:** `app/public/scripts/shared/preferences-sync.js`
**Since:** v1.0.48

Frontend synchronization client for user preferences between localStorage and backend PreferencesService API.

**Key Features:**

- **Backend Sync**: Syncs preferences to `/api/preferences` endpoints
- **localStorage Cache**: Fast local storage for immediate access
- **Debounced Writes**: Batches preference updates to reduce API calls
- **Cross-Tab Sync**: Automatic synchronization across browser tabs
- **Theme Priority**: Immediate sync for theme changes (no debounce)

**Core Methods:**

```javascript
// Initialize sync system (loads preferences from database to localStorage)
await preferencesSync.initialize();

// Sync theme immediately (high-priority, no debounce)
await preferencesSync.syncTheme('dark');

// Queue a preference for debounced sync
preferencesSync.queueSync('pagination_enabled', true);

// Force immediate sync of all queued preferences
await preferencesSync.syncNow();

// Flush sync queue to database
await preferencesSync.flushSyncQueue();
```

**Synced Preference Keys:**

| Key | Storage Key | Description |
|-----|-------------|-------------|
| `theme` | `hextrackr-theme` | Theme preference ('light' or 'dark') |
| `markdown_template_ticket` | `hextrackr-markdown-ticket` | Ticket markdown template |
| `markdown_template_vulnerability` | `hextrackr-markdown-vulnerability` | Vulnerability markdown template |
| `pagination_enabled` | `hextrackr_enablePagination` | Pagination feature flag |
| `kev_auto_refresh` | `kevAutoSyncEnabled` | KEV auto-sync setting |
| `cisco_api_key` | `hextrackr-cisco-key` | Cisco API credentials |

**How It Works:**

```javascript
// 1. On page load, PreferencesSync loads from database to localStorage
await preferencesSync.initialize();

// 2. Theme changes are synced immediately
await preferencesSync.syncTheme('dark');
// → Updates localStorage + database instantly

// 3. Other preferences are queued and debounced (1 second)
preferencesSync.queueSync('pagination_enabled', true);
// → Waits 1 second, then batches all queued updates

// 4. Before page unload, force immediate sync
await preferencesSync.syncNow();
```

**Integration with Backend:**

PreferencesSync communicates with the backend `PreferencesService` (located at `app/services/preferencesService.js`) via these endpoints:

- `GET /api/preferences` - Load all preferences
- `POST /api/preferences/:key` - Set single preference
- `POST /api/preferences/bulk` - Bulk update preferences

**Note:** PreferencesSync is a frontend-only component. The actual preferences API service runs on the backend.

### AuthState

**Location:** `app/public/scripts/shared/auth-state.js`
**Since:** v1.0.46

Frontend authentication state management with session monitoring.

**Key Features:**

- **Session Monitoring**: Periodic checks for session validity
- **Auto-Redirect**: Redirects to login on session expiration
- **User Profile Caching**: Cached user data for performance
- **CSRF Token Management**: Automatic CSRF token refresh
- **State Change Events**: Emits events when auth state changes

**Core Methods:**

```javascript
// Check authentication status
const isAuthenticated = await AuthState.checkAuth();
// Returns: true/false

// Get current user
const user = AuthState.getCurrentUser();
// Returns: { id: 1, username: "admin", email: "...", ... }

// Get CSRF token for forms
const csrfToken = await AuthState.getCsrfToken();
// Returns: "abc123..."

// Logout
await AuthState.logout();
// Clears session, redirects to login

// Session monitoring (auto-starts on page load)
AuthState.startSessionMonitor(); // Checks every 5 minutes
AuthState.stopSessionMonitor();
```

**Authentication Events:**

```javascript
// Listen for auth state changes
AuthState.addEventListener('auth-changed', (e) => {
    if (e.detail.authenticated) {
        console.log('User logged in:', e.detail.user);
    } else {
        console.log('User logged out');
        window.location.href = '/login.html';
    }
});

// Listen for session expiration
AuthState.addEventListener('session-expired', () => {
    ToastManager.show('Session expired. Please log in again.', 'warning');
    window.location.href = '/login.html';
});
```

**Session Monitor:**

```javascript
// Automatic session checking (every 5 minutes)
setInterval(async () => {
    const status = await fetch('/api/auth/status');
    if (!status.authenticated) {
        AuthState.emit('session-expired');
    }
}, 300000); // 5 minutes
```

**CSRF Token Integration:**

```javascript
// Automatically adds CSRF token to API requests
async function apiCall(endpoint, method, data) {
    const token = await AuthState.getCsrfToken();

    return fetch(endpoint, {
        method,
        headers: {
            'Content-Type': 'application/json',
            'X-CSRF-Token': token
        },
        body: JSON.stringify(data)
    });
}
```

---

## Utilities {#utilities}

Helper functions and security utilities.

### VendorFilterUI

**Location:** `app/public/scripts/shared/vendor-filter-ui.js`
**Since:** v1.0.53 (HEX-156)

Manages vendor filtering UI with bidirectional synchronization between radio buttons and dropdown.

**Key Features:**

- **Dual Control Sync**: Radio button toggles and dropdown select stay synchronized
- **Infinite Loop Prevention**: Smart event handling prevents circular updates
- **Dashboard Integration**: Updates statistics cards and charts when vendor changes
- **Table/Card Filtering**: Synchronizes with AG-Grid and card view filters
- **URL State Persistence**: Maintains filter state in query parameters

**Architecture Pattern:**

```javascript
// Radio buttons → Dropdown sync
vendorRadios.forEach(radio => {
    radio.addEventListener('change', (e) => {
        const vendor = e.target.dataset.vendor;

        // Sync dropdown (prevent infinite loop)
        if (vendorDropdown.value !== vendor) {
            vendorDropdown.value = vendor;
            vendorDropdown.dispatchEvent(new Event('change'));
        }

        // Update dashboard
        updateStatistics(vendor);
        updateChart(vendor);
    });
});

// Dropdown → Radio buttons sync
vendorDropdown.addEventListener('change', (e) => {
    const vendor = e.target.value;

    // Find matching radio button
    const matchingRadio = findRadioByVendor(vendor);
    if (matchingRadio && !matchingRadio.checked) {
        matchingRadio.checked = true;
        matchingRadio.dispatchEvent(new Event('change'));
    }
});
```

**Vendor Values:**

- `` (empty string) - All Vendors
- `CISCO` - Cisco Systems
- `Palo Alto` - Palo Alto Networks
- `Other` - All other vendors

**getCurrentVendor() Helper:**

```javascript
/**
 * Get currently selected vendor from radio buttons
 * @returns {string} Current vendor ("", "CISCO", "Palo Alto", or "Other")
 */
function getCurrentVendor() {
    const checkedRadio = document.querySelector('input[name="vendor-filter"]:checked');
    if (!checkedRadio) return "";

    const label = document.querySelector(`label[for="${checkedRadio.id}"]`);
    return label ? (label.dataset.vendor || "") : "";
}
```

**Integration Points:**

- **Statistics Cards**: `updateStatisticsDisplay(vendor)` updates VPR card metrics
- **Charts**: `chartManager.update(false, vendor)` filters trend data
- **Grid/Cards**: `applyVendorFilter(vendor)` filters table/card results
- **Chart Metric Toggle**: Passes vendor to maintain filter when switching VPR sum ↔ vuln count

### CVEUtilities

**Location:** `app/public/scripts/utils/cve-utilities.js`
**Since:** v1.0.22

CVE data processing, validation, and external API integration.

**Key Features:**

- **CVE ID Validation**: Regex-based format validation (CVE-YYYY-NNNNN)
- **External Links Generation**: Creates links to NVD, MITRE, vendor databases
- **KEV Integration**: CISA KEV catalog lookup and caching
- **Cisco PSIRT**: Cisco security advisory lookup for CVE fixed versions
- **Batch Processing**: Efficient handling of multiple CVE lookups

**Core Functions:**

```javascript
// CVE ID validation
CVEUtilities.isValidCVE('CVE-2024-12345')  // true
CVEUtilities.isValidCVE('CVE-24-123')      // false

// External link generation
CVEUtilities.getNVDLink('CVE-2024-12345')
// → https://nvd.nist.gov/vuln/detail/CVE-2024-12345

CVEUtilities.getMITRELink('CVE-2024-12345')
// → https://cve.mitre.org/cgi-bin/cvename.cgi?name=CVE-2024-12345

// KEV lookup
const kevData = await CVEUtilities.checkKEV('CVE-2024-12345');
// Returns: { isKEV: true, dateAdded: "2024-10-01", ransomware: true, ... }

// Cisco PSIRT lookup
const ciscoData = await CVEUtilities.lookupCiscoPSIRT('CVE-2024-12345');
// Returns: { advisory: "cisco-sa-xxx", fixedVersions: [...], ... }
```

**KEV Cache:**

```javascript
// Local storage cache for KEV lookups (24h TTL)
const kevCache = {
    'CVE-2024-12345': {
        data: { isKEV: true, dateAdded: '2024-10-01', ... },
        timestamp: 1696435200000
    }
};

// Cache management
CVEUtilities.clearKEVCache()      // Clear all cached KEV data
CVEUtilities.refreshKEV(cveId)    // Force fresh lookup
```

**Batch Processing:**

```javascript
// Efficient batch KEV lookups
const cveList = ['CVE-2024-1', 'CVE-2024-2', 'CVE-2024-3'];
const kevResults = await CVEUtilities.batchKEVLookup(cveList);
// Returns: Map<cveId, kevData>
```

### Security Module

**Location:** `app/public/scripts/utils/security.js`

Security utilities for input validation and sanitization.

**Functions:**
| Function | Purpose |
|----------|---------|
| `escapeHtml()` | Prevent XSS attacks |
| `sanitizeInput()` | Clean user input |
| `validatePath()` | Prevent path traversal |
| `sanitizeCSV()` | Clean CSV data |

### AccessibilityAnnouncer

**Location:** `app/public/scripts/utils/accessibility-announcer.js`

ARIA live region management for screen readers.

**Features:**

- Dynamic announcements
- Priority levels
- Queue management
- Automatic cleanup

**Usage:**

```javascript
AccessibilityAnnouncer.announce('Data loaded', 'polite');
AccessibilityAnnouncer.announce('Error occurred', 'assertive');
```

### WCAGContrastValidator

**Location:** `app/public/scripts/utils/wcag-contrast-validator.js`

Validates color contrast for WCAG compliance.

**Features:**

- AA/AAA level checking
- Dynamic theme validation
- Suggestion generation
- Batch validation

### ChartThemeAdapter

**Location:** `app/public/scripts/utils/chart-theme-adapter.js`

Adapts chart colors to current theme.

**Responsibilities:**

- Color palette management
- Dynamic theme switching
- Contrast optimization
- ApexCharts configuration

### ValidationUtils

**Location:** `app/public/scripts/validation-utils.js`

Form and data validation utilities.

**Functions:**
| Function | Purpose |
|----------|---------|
| `validateEmail()` | Email format validation |
| `validateURL()` | URL format checking |
| `validateIPAddress()` | IP address validation |
| `validateCVE()` | CVE ID format validation |
| `validateDate()` | Date format and range |

---

## Constants and Configuration {#constants}

### VulnerabilityConstants

**Location:** `app/public/scripts/shared/vulnerability-constants.js`

Central configuration for vulnerability features.

**Includes:**

- Severity levels and colors
- Risk thresholds
- API endpoints
- Grid column definitions
- Chart configurations

### ConfigLoader

**Location:** `app/public/scripts/shared/config-loader.js`

Loads and manages application configuration.

**Features:**

- Environment-based config
- Default fallbacks
- Runtime updates
- Validation

---

## Initialization Scripts {#initialization}

### Database Initializer

**Location:** `app/public/scripts/init-database.js`

Sets up initial database schema and data.

**Operations:**

- Schema creation
- Index setup
- Default data insertion
- Migration running

---

## Module Loading Patterns

HexTrackr uses **multiple module loading patterns** depending on component age and refactoring status. Here are the common patterns:

### Pattern 1: ES6 Module Export (Modern)

Used in newer, refactored components:

```javascript
// Component definition
export class ComponentName {
    constructor() {
        this.init();
    }

    init() {
        // Initialization logic
    }
}

// Import in other modules
import { ComponentName } from './component-name.js';
```

**Examples:** `ModernVulnManager`, `ThemeController`

### Pattern 2: Global Window Assignment (Legacy)

Used in older components for compatibility:

```javascript
class ComponentName {
    constructor(options = {}) {
        this.options = { ...this.defaultOptions, ...options };
        this.init();
    }

    init() {
        this.setupDOM();
        this.attachEventListeners();
        this.loadData();
    }

    destroy() {
        // Cleanup
    }
}

// Auto-initialization on DOM ready
document.addEventListener('DOMContentLoaded', () => {
    window.component = new ComponentName();
});

// Export for testing/module environments
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ComponentName;
}
```

**Examples:** `HexagonTicketsManager`, `ToastManager`

### Pattern 3: Deferred/Lazy Initialization

Used for components that initialize on-demand:

```javascript
class ComponentName {
    constructor() {
        // Lightweight constructor
        this.initialized = false;
    }

    async initialize() {
        if (this.initialized) return;

        // Heavy initialization work
        await this.loadDependencies();
        this.setupEventListeners();
        this.initialized = true;
    }
}

// Component created but not initialized
window.component = new ComponentName();

// Initialize when needed
await window.component.initialize();
```

**Examples:** `VulnerabilityChartManager` (lazy-loads on first view switch)

### Pattern 4: Functional/Utility Modules

Helper functions without class structure:

```javascript
// Utility functions
export function helperFunction(param) {
    return processedResult;
}

export const CONSTANTS = {
    KEY: 'value'
};
```

**Examples:** `CVEUtilities`, `ValidationUtils`

**Note:** The application is gradually migrating from Pattern 2 (global window) to Pattern 1 (ES6 modules) as components are refactored.

---

## Event System

### Custom Events

The application uses custom events for component communication:

| Event | Triggered When | Data |
|-------|---------------|------|
| `theme-changed` | Theme toggles | `{ theme: 'light'|'dark' }` |
| `data-refresh` | Data needs reload | `{ type: 'vulnerabilities'|'tickets' }` |
| `filter-applied` | Filters change | `{ filters: {...} }` |
| `grid-ready` | AG-Grid initializes | `{ gridApi: api }` |

### Global Functions

Available on `window` object:

| Function | Purpose |
|----------|---------|
| `refreshPageData(type)` | Trigger data refresh |
| `showNotification(msg, type)` | Display notification |
| `exportCurrentView()` | Export visible data |
| `toggleTheme()` | Switch theme |

---

## CSS Custom Properties

The frontend relies on CSS custom properties for theming:

```css
/* Surface hierarchy for dark mode */
--hextrackr-surface-base: #0f172a;  /* Background */
--hextrackr-surface-1: #1a2332;     /* Cards */
--hextrackr-surface-2: #253241;     /* Tables */
--hextrackr-surface-3: #2f3f50;     /* Modals */
--hextrackr-surface-4: #526880;     /* Overlays */

/* Severity colors */
--hextrackr-critical: #d63939;
--hextrackr-high: #f76707;
--hextrackr-medium: #f59f00;
--hextrackr-low: #74b816;
```

---

## Performance Considerations

### Optimization Strategies

1. **Lazy Loading**: Components load on demand
2. **Virtual Scrolling**: AG-Grid handles large datasets
3. **Debouncing**: Search and filter inputs are debounced
4. **Caching**: API responses cached for 5 minutes
5. **Web Workers**: CSV parsing in background (large files)

### Memory Management

- Event listeners cleaned up on component destroy
- WebSocket connections properly closed
- Chart instances disposed when not needed
- Grid data virtualized for large datasets
