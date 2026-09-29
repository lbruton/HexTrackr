---
tags:
  - api
doc_type: reference
project: hextrackr
source: manual
created: "2026-03-12"
updated: "2026-03-12"
sourceFiles:
  - app/public/docs-source/api-reference/frontend-api.md
---

# Frontend API

Complete documentation for HexTrackr's frontend architecture, including page managers, shared components, and utilities.

## Overview

HexTrackr's frontend uses vanilla JavaScript with a modular, class-based architecture. Components follow a consistent pattern using ES6 modules, with clear separation between page-specific logic, shared components, and utilities.

**Core Technologies:**

- Vanilla JavaScript (ES6+)
- AG-Grid for data tables
- ApexCharts for visualizations
- Tabler.io CSS framework
- WebSocket for real-time updates

---

## Page Components

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

### TicketsPage

**Location:** `app/public/scripts/pages/tickets.js`

Support ticket management interface.

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

## Shared Components

Reusable components used across multiple pages.

### ThemeController

**Location:** `app/public/scripts/shared/theme-controller.js`

Manages light/dark theme switching with CSS variable updates, persistent theme preference (localStorage), smooth transitions, AG-Grid theme synchronization, and chart theme adaptation.

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

### AGGridThemeManager

**Location:** `app/public/scripts/shared/ag-grid-theme-manager.js`

Centralized theme management for all AG-Grid instances across the application.

**Key Features:**

- **Unified Theme Control**: Single source of truth for grid themes across all pages
- **Dynamic Theme Switching**: Instant theme updates without page reload
- **Cross-Tab Synchronization**: Theme changes propagate across browser tabs via localStorage events
- **Grid Instance Registry**: Tracks all active grid instances for coordinated updates
- **Dark Mode Surface Hierarchy**: Implements proper surface elevation (base -> surface-1 -> surface-2)

**Core Methods:**

- `registerGrid(gridApi, gridId)` - Register new grid instance for theme management
- `unregisterGrid(gridId)` - Remove grid from theme tracking
- `applyTheme(theme)` - Apply theme to all registered grids
- `getCurrentTheme()` - Get active theme ('light' or 'dark')
- `setupCrossTabSync()` - Enable theme synchronization across browser tabs

### PaginationController

**Location:** `app/public/scripts/shared/pagination-controller.js`

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

**Core Methods:**

- `setTotalItems(count)` - Update total item count and recalculate pages
- `getCurrentPageData(items)` - Get items for current page from array
- `setCurrentPage(page)` - Navigate to specific page
- `setPageSize(size)` - Change items per page (must be in availableSizes)
- `getPageInfo()` - Get pagination state (currentPage, totalPages, pageSize, etc.)
- `renderTopControls(containerId, onPageSizeChange, options)` - Render sort dropdown + items-per-page above cards
- `renderPaginationControls(containerId, onPageChange)` - Render bottom pagination arrows/numbers

> [!note]
> The HTML structure for pagination controls is automatically generated by the `renderPaginationControls()` and `renderTopControls()` methods. Do not create this HTML manually.

### VulnerabilityDataManager

**Location:** `app/public/scripts/shared/vulnerability-data.js`

Core data management for vulnerabilities including API communication, data caching, filter application, sort operations, and export preparation.

### WebSocketClient

**Location:** `app/public/scripts/shared/websocket-client.js`

Real-time communication handler. For the complete WebSocket reference, see [[WebSocket Architecture]].

**Events:**

| Event | Purpose |
|-------|---------|
| `import-progress` | CSV import updates |
| `vulnerability-added` | New vulnerability notification |
| `ticket-updated` | Ticket status change |
| `connection-status` | Connection state changes |

### ModalManager Classes

#### VulnerabilityDetailsModal

**Location:** `app/public/scripts/shared/vulnerability-details-modal.js`

Displays detailed vulnerability information with integrated KEV checking and Cisco PSIRT lookup.

**Features:**

- CVE Links and References (direct links to NVD, MITRE, and vendor advisories)
- CVSS Score Breakdown with visual representation
- Remediation Guidance with solution steps
- Plugin Output Display with syntax highlighting
- Related Vulnerabilities (other CVEs affecting same device)
- KEV Integration (automatic CISA KEV lookup with visual indicators)
- Cisco PSIRT Integration (fixed version information for Cisco CVEs)

#### ProgressModal

**Location:** `app/public/scripts/shared/progress-modal.js`

Shows progress for long-running operations with real-time percentage updates, ETA calculation, cancel capability, and WebSocket integration.

#### SettingsModal

**Location:** `app/public/scripts/shared/settings-modal.js`

Global application settings interface for theme preferences, grid configuration, export settings, data management operations, and backup/restore functionality.

#### DeviceSecurityModal

**Location:** `app/public/scripts/shared/device-security-modal.js`

Device management for tickets with device list editing, bulk operations, validation, and auto-save.

### ChartManager Components

#### VulnerabilityChartManager

**Location:** `app/public/scripts/shared/vulnerability-chart-manager.js`

Manages ApexCharts visualizations. Provides temporal trends (line chart) with severity breakdown over time and zoom/pan capabilities. Supports dynamic theme adaptation, responsive sizing, interactive tooltips, and export to image.

#### VulnerabilityStatistics

**Location:** `app/public/scripts/shared/vulnerability-statistics.js`

Statistical calculations and displays for total vulnerabilities, Critical/High/Medium/Low counts, average CVSS score, VPR distribution, and remediation progress.

### ToastManager

**Location:** `app/public/scripts/shared/toast-manager.js`

Notification system for user feedback with multiple severity levels, auto-dismiss, action buttons, queue management, and accessibility support.

**Usage:**

```javascript
ToastManager.show('Operation successful', 'success');
ToastManager.show('Error occurred', 'error', { duration: 5000 });
```

### HeaderManager

**Location:** `app/public/scripts/shared/header.js`

Dynamic header with theme toggle button, user dropdown, navigation state, and notification badges.

### PreferencesSync

**Location:** `app/public/scripts/shared/preferences-sync.js`

Frontend synchronization client for user preferences between localStorage and backend PreferencesService API.

**Key Features:**

- **Backend Sync**: Syncs preferences to `/api/preferences` endpoints
- **localStorage Cache**: Fast local storage for immediate access
- **Debounced Writes**: Batches preference updates to reduce API calls
- **Cross-Tab Sync**: Automatic synchronization across browser tabs
- **Theme Priority**: Immediate sync for theme changes (no debounce)

**Core Methods:**

```javascript
await preferencesSync.initialize();
await preferencesSync.syncTheme('dark');
preferencesSync.queueSync('pagination_enabled', true);
await preferencesSync.syncNow();
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

### AuthState

**Location:** `app/public/scripts/shared/auth-state.js`

Frontend authentication state management with session monitoring.

**Key Features:**

- **Session Monitoring**: Periodic checks for session validity (every 5 minutes)
- **Auto-Redirect**: Redirects to login on session expiration
- **User Profile Caching**: Cached user data for performance
- **CSRF Token Management**: Automatic CSRF token refresh
- **State Change Events**: Emits events when auth state changes

**Core Methods:**

```javascript
const isAuthenticated = await AuthState.checkAuth();
const user = AuthState.getCurrentUser();
const csrfToken = await AuthState.getCsrfToken();
await AuthState.logout();
```

---

## Utilities

Helper functions and security utilities.

### VendorFilterUI

**Location:** `app/public/scripts/shared/vendor-filter-ui.js`

Manages vendor filtering UI with bidirectional synchronization between radio buttons and dropdown.

**Vendor Values:**

- `` (empty string) - All Vendors
- `CISCO` - Cisco Systems
- `Palo Alto` - Palo Alto Networks
- `Other` - All other vendors

### CVEUtilities

**Location:** `app/public/scripts/utils/cve-utilities.js`

CVE data processing, validation, and external API integration. See [[Utilities]] for the complete reference.

### Security Module

**Location:** `app/public/scripts/utils/security.js`

Security utilities for input validation and sanitization.

| Function | Purpose |
|----------|---------|
| `escapeHtml()` | Prevent XSS attacks |
| `sanitizeInput()` | Clean user input |
| `validatePath()` | Prevent path traversal |
| `sanitizeCSV()` | Clean CSV data |

### AccessibilityAnnouncer

**Location:** `app/public/scripts/utils/accessibility-announcer.js`

ARIA live region management for screen readers with dynamic announcements, priority levels, and queue management.

### WCAGContrastValidator

**Location:** `app/public/scripts/utils/wcag-contrast-validator.js`

Validates color contrast for WCAG compliance with AA/AAA level checking, dynamic theme validation, and suggestion generation.

### ChartThemeAdapter

**Location:** `app/public/scripts/utils/chart-theme-adapter.js`

Adapts chart colors to current theme with color palette management, dynamic theme switching, contrast optimization, and ApexCharts configuration.

### ValidationUtils

**Location:** `app/public/scripts/validation-utils.js`

Form and data validation utilities.

| Function | Purpose |
|----------|---------|
| `validateEmail()` | Email format validation |
| `validateURL()` | URL format checking |
| `validateIPAddress()` | IP address validation |
| `validateCVE()` | CVE ID format validation |
| `validateDate()` | Date format and range |

---

## Constants and Configuration

### VulnerabilityConstants

**Location:** `app/public/scripts/shared/vulnerability-constants.js`

Central configuration for vulnerability features including severity levels and colors, risk thresholds, API endpoints, grid column definitions, and chart configurations.

### ConfigLoader

**Location:** `app/public/scripts/shared/config-loader.js`

Loads and manages application configuration with environment-based config, default fallbacks, runtime updates, and validation.

---

## Module Loading Patterns

HexTrackr uses **multiple module loading patterns** depending on component age and refactoring status:

### Pattern 1: ES6 Module Export (Modern)

Used in newer, refactored components (`ModernVulnManager`, `ThemeController`):

```javascript
export class ComponentName {
    constructor() { this.init(); }
    init() { /* ... */ }
}

import { ComponentName } from './component-name.js';
```

### Pattern 2: Global Window Assignment (Legacy)

Used in older components (`HexagonTicketsManager`, `ToastManager`):

```javascript
class ComponentName {
    constructor(options = {}) { /* ... */ }
}
document.addEventListener('DOMContentLoaded', () => {
    window.component = new ComponentName();
});
```

### Pattern 3: Deferred/Lazy Initialization

Used for components that initialize on-demand (`VulnerabilityChartManager`):

```javascript
class ComponentName {
    constructor() { this.initialized = false; }
    async initialize() {
        if (this.initialized) return;
        await this.loadDependencies();
        this.initialized = true;
    }
}
```

### Pattern 4: Functional/Utility Modules

Helper functions without class structure (`CVEUtilities`, `ValidationUtils`):

```javascript
export function helperFunction(param) { return processedResult; }
export const CONSTANTS = { KEY: 'value' };
```

> [!note]
> The application is gradually migrating from Pattern 2 (global window) to Pattern 1 (ES6 modules) as components are refactored.

---

## Event System

### Custom Events

| Event | Triggered When | Data |
|-------|---------------|------|
| `theme-changed` | Theme toggles | `{ theme: 'light'\|'dark' }` |
| `data-refresh` | Data needs reload | `{ type: 'vulnerabilities'\|'tickets' }` |
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
--hextrackr-surface-0: [[1a2234]];    /* Base level - page background */
--hextrackr-surface-1: [[1a2234]];    /* Cards - elevated from base */
--hextrackr-surface-2: [[202c42]];    /* Elevated surfaces */
--hextrackr-surface-3: [[1a2234]];    /* Modals */
--hextrackr-surface-4: #334155;    /* Highest elevation */

/* Severity colors */
--hextrackr-critical: [[d63939]];
--hextrackr-high: [[f76707]];
--hextrackr-medium: [[f59f00]];
--hextrackr-low: [[74b816]];
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

---

## Related

- [[Frontend Architecture]]
- [[Theme Architecture]]
- [[API Reference]]
- [[WebSocket Architecture]]
- [[CSS Coding Standards]]
- [[Utilities]]
