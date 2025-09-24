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

- `TicketManager` - Main ticket controller
- `TicketGrid` - AG-Grid configuration
- `DeviceModal` - Device management

**Key Methods:**
| Method | Purpose |
|--------|---------|
| `init()` | Initialize ticket interface |
| `loadTickets()` | Fetch and display tickets |
| `createTicket()` | Open new ticket modal |
| `updateTicket()` | Edit existing ticket |
| `updateDevices()` | Manage associated devices |
| `deleteTicket()` | Remove ticket with confirmation |

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

### AGGridResponsiveConfig

**Location:** `app/public/scripts/shared/ag-grid-responsive-config.js`

Provides responsive AG-Grid configuration with theme support.

**Features:**

- Automatic theme detection
- Responsive column sizing
- Custom cell renderers
- Export functionality
- Pagination controls

**Configuration Example:**

```javascript
const gridOptions = AGGridResponsiveConfig.getDefaultGridOptions({
    columnDefs: [...],
    rowData: [...],
    onGridReady: (params) => {...}
});
```

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

Displays detailed vulnerability information.

**Features:**

- CVE links and references
- CVSS score breakdown
- Remediation guidance
- Plugin output display
- Related vulnerabilities

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

---

## Utilities {#utilities}

Helper functions and security utilities.

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

## Module Loading Pattern

All modules follow a consistent loading pattern:

```javascript
// Module definition
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

    setupDOM() {
        // DOM references
    }

    attachEventListeners() {
        // Event bindings
    }

    loadData() {
        // Initial data load
    }

    destroy() {
        // Cleanup
    }
}

// Auto-initialization
document.addEventListener('DOMContentLoaded', () => {
    window.component = new ComponentName();
});

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ComponentName;
}
```

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
