# Frontend Architecture

**Note:** The HexTrackr frontend is currently undergoing a significant refactoring to a modular, widget-based architecture. This document provides a high-level overview of the current state. For a detailed breakdown of the refactoring plan and the target architecture, please see the [Frontend Refactoring Plan](./refactoring.md).

The frontend of HexTrackr is composed of two main pages, each with its own set of JavaScript modules and CSS styles. Shared components, such as the header, footer, and settings modal, are loaded dynamically on each page.

For more detailed information on the frontend architecture, see the following documents:

- [CSS Architecture](./css-architecture.md)
- [JavaScript Module System](./javascript-modules.md)
- [Accessibility](./accessibility.md)

## Page Architecture

### `tickets.html`

- **Styling**: Uses a combination of Bootstrap 5 and Tabler.io for its UI components.
- **Core Logic**: Managed by `scripts/pages/tickets.js`, which contains the `HexagonTicketsManager` class.
- **Functionality**: Provides full CRUD operations for tickets, including filtering, pagination, and data export.

### `vulnerabilities.html`

- **Styling**: Uses the Tabler.io framework, with AG Grid for data tables and ApexCharts for visualizations.
- **Core Logic**: Refactor in progress from a monolithic `ModernVulnManager` class (≈2,286 lines as of current commit) toward a modular architecture. Extracted so far: `PaginationController` (moved to `scripts/shared/pagination-controller.js`). Planned next extractions: Data fetch/cache manager hardening, chart controller, grid configuration factory, import workflow module. Progress ~12% (1 of 8 planned modules fully separated).
- **Critical Bug Fix (v1.0.5)**: Resolved CSV import functionality breakdown caused by missing `this.apiBase = "/api"` property in ModernVulnManager constructor. This bug caused all CSV upload attempts to fail with 404 errors due to undefined API endpoint URLs.
- **Enhanced Features**:
  - **Cisco Vulnerability ID Support**: Renamed "CVE" column to "Vulnerability" across all views with support for CVE, Cisco SA, and Plugin ID display
  - **Intelligent Linking**: CVE identifiers link to CVE.org, Cisco SA identifiers link to cisco.com security advisories
  - **Enhanced Cell Renderers**: Improved vulnerability identification with appropriate styling for different ID types
- **Functionality**: Comprehensive vulnerability dashboard: interactive severity/time charts, dynamic AG Grid table, device cards with pagination, CSV import (rollover pipeline), export (CSV/HTML), inline filtering and search.

## Modal Architecture (v1.0.6+)

### Universal Aggregation System

HexTrackr implements a description-field-based universal aggregation key for consistent modal data relationships:

- **Vulnerability Modal**: Aggregates all devices affected by a specific vulnerability using the vulnerability description as the grouping key
  - Example: CVE-2017-3881 shows all 24 affected devices in a single modal
  - Modal displays comprehensive device list with hostnames, IP addresses, and affected services

- **Device Modal**: Aggregates all vulnerabilities affecting a specific device using device hostname as the grouping key  
  - Example: grimesnswan03 shows all 12 vulnerabilities affecting that device
  - Modal displays complete vulnerability profile for the selected device

### Modal State Management

- **Bootstrap Integration**: Uses proper `Modal.getInstance()` for clean modal transitions
- **Layering Prevention**: Ensures existing modals close before opening new ones
- **Workflow**: Vulnerability modal → closes → device modal opens seamlessly
- **Data Consistency**: All modal data reflects current aggregated state from database

### Testing Strategy

- **Playwright Automation**: Comprehensive browser automation for modal workflow validation
- **Aggregation Verification**: Automated testing ensures correct device/vulnerability counts
- **Performance Testing**: Validated with 10,000+ record datasets for large-scale deployments
- **UI Responsiveness**: Modal interactions tested across different viewport sizes
