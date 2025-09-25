# Changelog

All notable changes to HexTrackr will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.30] - 2025-09-24

### Enhanced

#### KEV Badge Added to Vulnerability Details Modal

- **Visual Consistency**: Added KEV badge to Vulnerability Details Modal header for immediate KEV status visibility
  - Badge appears on the right side of "Vulnerability Information" card header
  - Only displays for vulnerabilities in CISA's KEV catalog (isKev === "Yes")
  - Maintains exact same appearance as KEV badges on vulnerability and device cards

- **Implementation Details**:
  - Reuses existing `.kev-badge` CSS class for consistency
  - Dynamically inserts badge using JavaScript in `updateKevBadge()` method
  - Uses flexbox layout for proper positioning within card header
  - Includes full accessibility support with keyboard navigation

- **User Experience**:
  - Immediate visual indication of KEV status when viewing vulnerability details
  - Clicking badge opens KEV details modal (same behavior as card badges)
  - Consistent UI patterns across all vulnerability displays
  - No additional CSS required - leverages existing badge styles

#### Files Modified
- `app/public/scripts/shared/vulnerability-details-modal.js` - Added updateKevBadge() method

## [1.0.28] - 2025-09-24

### Fixed - KEV Badge Modal Issue on Device Cards

#### Bug Resolution

- **Fixed Modal Behavior**: KEV badges on device cards now correctly open the KEV details modal instead of the device security modal
  - **Root Cause**: Incorrect onclick handler was calling `vulnManager.viewDeviceDetails()` instead of `showKevDetails()`
  - **User Impact**: Security teams can now quickly access KEV vulnerability details directly from device cards
  - **Consistency Restored**: KEV badge behavior is now uniform across vulnerability cards and device cards

#### Technical Implementation

- **Device Aggregation Enhancement**: Extended `getFilteredDevices()` in `vulnerability-data.js` to track first KEV CVE per device
  - Added `kevCve: null` property to device object initialization
  - Implemented KEV CVE tracking: `if (!device.kevCve) { device.kevCve = vuln.cve; }`
- **Event Handler Correction**: Fixed onclick handler in `vulnerability-cards.js` line 93
  - **Before**: `onclick="event.stopPropagation(); vulnManager.viewDeviceDetails('${device.hostname}')"`
  - **After**: `onclick="event.stopPropagation(); showKevDetails('${device.kevCve}')"`
  - Also updated onkeydown handler for accessibility consistency

#### Files Modified
- `app/public/scripts/shared/vulnerability-data.js` - Device aggregation logic for KEV CVE tracking
- `app/public/scripts/shared/vulnerability-cards.js` - KEV badge event handlers

## [1.0.27] - 2025-09-24

### Added - KEV Badge on Device Cards

#### Enhanced Risk Visibility

- **Consistent UI Indicators**: Added KEV (Known Exploited Vulnerabilities) badges to device cards, creating visual consistency with vulnerability cards
  - **Badge Appearance**: Red KEV badge displays in upper right corner when ANY vulnerability on that device is in CISA's KEV catalog
  - **Risk Assessment**: Users can now instantly identify high-risk devices requiring immediate attention
  - **Click Functionality**: Clicking KEV badge opens device details modal to view all vulnerabilities affecting that device

#### Technical Implementation

- **Backend Enhancement**: Extended device aggregation logic to track KEV status across all vulnerabilities per device
  - Modified `getFilteredDevices()` in `vulnerability-data.js` to include `hasKev` property
  - Added KEV tracking during vulnerability iteration: `if (vuln.isKev === "Yes") { device.hasKev = true; }`
- **Frontend Integration**: Enhanced device card generation to display KEV badges
  - Updated `generateDeviceCardsHTML()` in `vulnerability-cards.js` with KEV badge HTML
  - Used identical badge structure as vulnerability cards for UI consistency
- **Styling Consistency**: Extended existing KEV CSS styles to support device cards
  - Added `.device-card .kev-indicator` selectors to match vulnerability card styling
  - Maintained responsive design and accessibility features

#### User Experience Improvements

- **Immediate Risk Recognition**: Security teams can quickly scan device cards to identify compromised systems
- **Operational Efficiency**: Faster prioritization of remediation efforts based on visual KEV indicators
- **UI Consistency**: Uniform KEV badge appearance across all card types (vulnerability cards and device cards)
- **Accessibility**: Full keyboard navigation support with ARIA labels and focus indicators

#### Files Modified
- `app/public/scripts/shared/vulnerability-data.js`: Device aggregation logic for KEV tracking
- `app/public/scripts/shared/vulnerability-cards.js`: Device card HTML generation with KEV badges
- `app/public/styles/pages/vulnerabilities.css`: Extended KEV indicator styles for device cards

#### Linear Issue
- **HEX-10**: v1.0.27: Feature - Add KEV Badge to Device Cards (Completed)

## [1.0.26] - 2025-09-23

### Fixed - Low Severity Vulnerability Visibility

#### Critical Bug Resolution

- **Complete Visibility Restored**: Fixed critical issue where 3,314 Low severity vulnerabilities were completely hidden from users
  - **Root Cause**: VPR-based sorting combined with 10K frontend limit pushed Low severity items (VPR 1.4-5.1) beyond visible range
  - **Impact**: Users could not filter, view, or access any Low severity vulnerabilities despite their presence in database
  - **Severity**: Critical - affected core vulnerability management functionality

#### Backend Sorting Optimization

- **Severity-Balanced Algorithm**: Implemented intelligent sorting to ensure all severity levels remain visible
  ```sql
  ORDER BY isKev DESC,
           CASE severity
             WHEN 'Critical' THEN 1
             WHEN 'High' THEN 2
             WHEN 'Medium' THEN 3
             WHEN 'Low' THEN 4
           END ASC,
           vpr_score DESC,
           last_seen DESC
  ```
  - **KEV Priority Maintained**: Known Exploited Vulnerabilities still appear first
  - **VPR Sorting Preserved**: Within each severity level, VPR scores determine order
  - **Distribution Guarantee**: All severity levels now appear in first 10K-30K results

#### Frontend Performance Optimization

- **Async Processing Implementation**: Resolved UI freezing when loading large vulnerability datasets
  - **Chunked Processing**: 24,660 vulnerabilities processed in 1000-item chunks using `requestIdleCallback()`
  - **Non-Blocking UI**: Browser remains responsive during data processing
  - **Progress Feedback**: Real-time loading indicators ("Processing vulnerabilities... 5000/24660")
  - **Fallback Support**: `setTimeout()` fallback for browsers without `requestIdleCallback()`

- **Data Capacity Increase**: Frontend limit increased from 10K to 30K to accommodate all vulnerabilities
  - **Complete Dataset**: All 24,660 current vulnerabilities now loaded for comprehensive filtering
  - **Compressed Transfer**: GZIP compression maintains efficient 614KB payload (vs 21MB uncompressed)
  - **Completeness Monitoring**: Added automatic warnings when approaching 90% of data limits

#### Technical Performance Metrics

- **Network Efficiency**: 614KB compressed transfer with 97% compression ratio
- **Processing Speed**: 1000 items per chunk with idle callback scheduling
- **UI Responsiveness**: Sub-2-second load times maintained with progress feedback
- **Memory Management**: Incremental processing prevents browser memory spikes
- **Data Integrity**: All 3,314 Low severity items now accessible through filtering

#### User Experience Improvements

- **Filtering Functionality**: Low severity filter now returns all 3,314 items (previously 0)
- **Complete Visibility**: Users can access full vulnerability dataset across all severity levels
- **Loading Feedback**: Progressive loading messages prevent perceived application freezing
- **Responsive Interface**: UI remains interactive during background data processing

### Technical Implementation

- **Files Modified**:
  - `vulnerabilityService.js`: Backend sorting algorithm
  - `vulnerability-data.js`: Async processing with chunking and progress events
- **Commits**: `e0538ec` (backend sorting), `2faa0cb` (async processing)
- **Performance Strategy**: Balanced approach maintaining filtering capability while optimizing browser performance

## [1.0.25] - 2025-09-23

### Added - Import Summary HTML Export

#### Professional Report Generation

- **Standalone HTML Reports**: Added ability to download import summaries as complete HTML documents with embedded CSS styling
  - **Export Button**: New "Download Report" button appears in progress modal when CVE import summaries are available
  - **Self-Contained Files**: Reports include all necessary CSS (Tabler.io framework, HexTrackr variables, component styles) embedded inline
  - **Professional Formatting**: Complete document structure with metadata headers, generation timestamps, and HexTrackr branding
  - **Print-Friendly Styling**: Optimized CSS for both screen viewing and professional printing

#### Technical Implementation

- **CSS Extraction Engine**: Automated system fetches and combines 7 key stylesheets into single embedded block
  - Tabler.io framework, CSS custom properties, modal styles, badges, cards, tables, and base styles
  - Font Awesome icons via CDN import for universal compatibility
  - Custom print media queries for professional output
- **Dynamic File Naming**: Descriptive filenames using pattern `HexTrackr_Import_Report_YYYY-MM-DD_[source-filename].html`
- **Blob Download Pattern**: Follows established file export approach with proper MIME types and browser compatibility

#### User Experience Enhancements

- **Visual Feedback System**: Export button provides clear state indicators
  - Loading state with spinner and "Generating..." text
  - Success confirmation with checkmark and "Downloaded!" message
  - Error handling with warning icon and failure notification
- **Conditional Visibility**: Export option only appears when import summaries contain meaningful CVE discovery data
- **Non-Disruptive Integration**: Feature seamlessly extends existing import workflow without affecting standard operations

### Fixed - Import Modal State Persistence

#### Clean Loading States

- **Resolved Stale Data Display**: Fixed issue where previous import summaries appeared during new import loading phases
  - **Root Cause**: `resetProgressState()` function didn't clear `importSummary` data or associated DOM elements
  - **Solution**: Added explicit `importSummary: null` reset and summary container cleanup
- **Complete State Reset**: Enhanced modal initialization to properly clear all previous session data
  - Hide and clear `progressSummary` container content during reset
  - Reset export button visibility to prevent stale UI states
  - Ensure clean slate for each new import operation

#### Technical Improvements

- **Data Lifecycle Management**: Improved progress modal data handling to prevent state leakage between sessions
- **DOM Cleanup**: Systematic clearing of dynamically created summary content and UI elements
- **ESLint Compliance**: All code modifications passed linting validation with zero errors

## [1.0.24] - 2025-09-23

### Enhanced - Vulnerability Card Polish

#### Card Layout Simplification

- **Streamlined Card Body**: Removed the redundant criticality subcards from vulnerability cards to focus on the key summary details and reduce visual noise.
- **Consistent Spacing**: Tweaked card padding to accommodate the simplified layout without affecting existing content hierarchy.

#### KEV Indicator Improvements

- **Accessible Badge Placement**: Replaced the inline flame icon with an accessible red KEV pill badge anchored to the top-right corner of each vulnerability card.
- **Improved Visual Priority**: Updated the indicator styling and keyboard handling so KEV status remains prominent while staying aligned with the HexTrackr design system.

- **Vulnerability Cards UI Enhancement**: Removed redundant VPR mini-cards from vulnerability cards to reduce visual clutter
- **CSS Architecture**: Migrated inline styles to external CSS files for better maintainability
- **Enhanced Device Display**: Improved device information presentation in vulnerability cards with theme-aware styling
- **Responsive Design**: Enhanced mobile and tablet layout for vulnerability cards

### Technical Details
- Added page-specific CSS file (`vulnerabilities.css`) for vulnerability page styling
- Updated `cards.css` with enhanced device display component
- Removed VPR mini-cards HTML generation from `VulnerabilityCardsManager`
- Preserved VPR mini-cards functionality in device cards where they remain relevant
- Implemented CSS selector specificity to target only vulnerability cards
- Added theme support with light/dark mode transitions

### Files Modified
- `app/public/styles/pages/vulnerabilities.css` (created)
- `app/public/styles/shared/cards.css` (enhanced)
- `app/public/scripts/shared/vulnerability-cards.js` (modified)
- `app/public/pages/vulnerabilities.html` (updated CSS references)

## [1.0.23] - 2025-09-22

### Added - Interactive Statistics Card Filtering

#### Enhanced Ticket Management User Experience

- **Clickable Statistics Cards**: Transformed passive statistics displays into interactive filter controls
  - **Total Tickets Card**: Shows all tickets, acts as filter reset button
  - **Open Tickets Card**: Filters to active tickets (excludes Closed, Completed, Failed statuses)
  - **Overdue Card**: Shows urgent tickets requiring immediate attention (Overdue + Failed statuses)
  - **Completed Card**: Displays finished work (Completed + Closed statuses)

#### Technical Implementation

- **Smart Filter Integration**: Card filters integrate seamlessly with existing search and location filters
  - Mutual exclusivity with status dropdown to prevent filter conflicts
  - Automatic pagination reset when filters are applied
  - Preserves existing filter chain architecture for backward compatibility

- **Statistics Logic Fix**: Corrected "Open Tickets" calculation to include all non-terminal statuses
  - Previous logic only counted "Open" and "In Progress" statuses
  - New logic excludes terminal statuses (Closed, Completed, Failed) for more accurate representation
  - Statistics now align perfectly with filter behavior for consistency

#### User Interface Enhancements

- **Visual Feedback System**: Added comprehensive visual indicators for interactive elements
  - Hover effects with theme-aware shadows and subtle lift animations
  - Active card highlighting with distinct border and background styling
  - Smooth 200ms transitions for professional feel
  - Pointer cursor indication for clickability

- **Theme Compatibility**: Full support for both light and dark themes
  - Dynamic shadow effects adapted for each theme
  - Proper contrast ratios maintained across all visual states
  - Consistent styling with existing HexTrackr design system

#### Accessibility Excellence

- **Screen Reader Support**: Complete accessibility implementation for all users
  - ARIA button roles with pressed/unpressed state announcements
  - Live region announcements for filter changes ("Showing open tickets only", etc.)
  - Unique descriptive labels for each card's functionality

- **Keyboard Navigation**: Full keyboard accessibility support
  - Tab navigation through all statistics cards
  - Enter and Space key activation matching mouse click behavior
  - Focus indicators meeting WCAG AA contrast requirements
  - Logical tab order for intuitive navigation

#### Performance Optimizations

- **Efficient Filter Processing**: Optimized filter operations for large datasets
  - Sub-100ms filter response times for datasets up to 1000+ tickets
  - No AG-Grid re-initialization during filter changes
  - Preserved existing performance characteristics

### Technical Notes

- **Architecture**: Extends existing `HexagonTicketsManager` class with minimal code changes
- **Integration**: Works seamlessly with AG-Grid v33 and existing filter infrastructure
- **Compatibility**: Maintains full backward compatibility with existing workflows
- **Testing**: Comprehensive functionality verified across all supported browsers

## [1.0.22] - 2025-09-21

### Enhanced - KEV (Known Exploited Vulnerabilities) Integration

#### AG-Grid Table Improvements

- **Filterable KEV Column**: Replaced fire emoji (🔥) with filterable YES/NO pills in KEV column
  - Red badge for "YES" (vulnerability is in KEV catalog)
  - Blue badge for "NO" (not in KEV catalog)
  - Follows same design pattern as severity and VPR columns for consistency
  - Enables proper filtering using AG-Grid's built-in text-based filter system

- **KEV Column Filtering Fix**: Fixed KEV column filtering to work with AG-Grid's filtering system
  - Changed database query to return 'Yes'/'No' text values instead of 1/0 boolean
  - Updated column renderer to parse text values for proper filtering compatibility
  - Made KEV badges clickable to open detailed KEV modal for vulnerability information

#### KEV Modal Enhancements

- **CVE Details Integration**: Added "View CVE Details" button in KEV modal
  - Opens vulnerability details modal for comprehensive CVE information
  - Provides seamless navigation between KEV catalog info and full vulnerability details
  - Uses existing `showVulnerabilityDetailsByCVE()` function for consistency

- **NIST NVD Integration**: Replaced CISA KEV Catalog link with NIST NVD link
  - Uses pattern `https://nvd.nist.gov/vuln/detail/${cveId}` for direct CVE lookup
  - Provides more comprehensive vulnerability information from authoritative source
  - Both modal buttons now use consistent primary button style for better UI cohesion

- **Clickable Links in Notes**: Made all HTTPS links in KEV additional notes clickable
  - Links open in 1200x1200px popup windows for consistency with rest of application
  - Automatic regex replacement converts plain URLs to clickable links
  - Preserves existing text while enhancing usability

#### Filter Dropdown Improvements

- **Filter Option Cleanup**: Removed fire emoji from KEV filter option in severity dropdown
  - Changed dropdown option from "🔥 KEV" to simply "KEV" for cleaner interface
  - Maintains clear identification of KEV filtering without emoji clutter

- **KEV Filter Logic Fix**: Fixed KEV filter to properly match vulnerabilities
  - Added special handling in filter logic to distinguish KEV from severity filtering
  - Fixed filter matching to properly check `isKev === "Yes"` when KEV filter selected
  - Ensures consistent filtering behavior across grid, cards, and modal contexts

### Fixed - KEV Data Handling

- **Database Service Updates**: Updated vulnerability service to return text-based KEV values
  - Changed database query from returning 1/0 to 'Yes'/'No' text values
  - Ensures compatibility with AG-Grid's text-based filtering system
  - Maintains data integrity while improving UI functionality

- **Component Consistency**: Fixed KEV handling across all vulnerability components
  - Updated vulnerability cards to check for text value "Yes" instead of boolean
  - Ensured consistent KEV data interpretation in grid, cards, modals, and filters
  - Eliminated discrepancies between different UI components

## [1.0.21] - 2025-09-21

### Added

#### Unified Template Variable System

- **Centralized Variable Configuration**: Created `template-variables.js` with unified variable definitions
  - Consistent naming conventions across all template types ([HEXAGON_TICKET], [SERVICENOW_TICKET], etc.)
  - Categorized variables by function: Ticket Info, Location, Dates, Devices, Personnel, Content, Counts
  - Universal variable access for maximum flexibility across ticket, email, and vulnerability templates
  - Backward compatibility maintained for existing templates

- **Dropdown Variable Interface**: Transformed bulky 300px variable panels into compact Bootstrap dropdowns
  - **87% space reduction**: From 300px fixed panels to 38px dropdown buttons in editor headers
  - Organized variable categories with descriptive icons (📋 Ticket Info, 📍 Location, 📅 Dates, etc.)
  - Click-to-insert functionality with cursor position preservation
  - Auto-close behavior and success notifications for smooth user experience
  - Comprehensive dark theme support with proper contrast and hover states

#### Template Editing Enhancements

- **Enhanced Template Editors**: Improved all three template editors (ticket, email, vulnerability)
  - Consistent dropdown-based variable selection across all editors
  - Better visual organization with category headers and variable descriptions
  - Required vs optional variable highlighting (orange for required, blue for optional)
  - Monospace font for variable names with clear descriptions

- **Improved Space Utilization**: Maximized editing area by eliminating horizontal panels
  - More screen real estate for template content editing
  - Professional appearance with header-integrated dropdown controls
  - Responsive design that adapts to container constraints

### Fixed

#### Template System Bug Resolutions

- **Template Cross-Contamination**: Fixed cache key collisions between template types
  - Eliminated issue where editing one template would affect another
  - Proper isolation between ticket, email, and vulnerability template caches
  - Enhanced cache management with template-specific keys

- **Validation System Issues**: Resolved aggressive validation triggering unwanted restoration
  - Temporarily disabled overly strict template validation that interfered with user edits
  - Improved validation logic to allow user content loading for editing
  - Better error handling and user feedback for template operations

- **ForceRefresh Logic**: Fixed template reloading after reset operations
  - Corrected conditional statements that prevented proper API calls
  - Ensured templates properly reload from server when force refresh is requested
  - Enhanced debugging with comprehensive logging for template operations

### Changed

#### User Interface Improvements

- **Variable Selection UI**: Transformed from horizontal panels to dropdown interface
  - Replaced space-consuming variable panels with compact dropdown buttons
  - Improved workflow with faster variable selection and insertion
  - Better visual hierarchy with organized categories and clear descriptions

- **Template Editor Layout**: Optimized modal space utilization
  - Removed bulky reference panels below editors
  - Integrated variable access directly into editor toolbars
  - Cleaner, more professional appearance throughout template editing interface

#### Technical Improvements

- **Variable System Architecture**: Unified variable management across all components
  - Centralized variable definitions eliminate duplication and inconsistencies
  - Standardized variable naming improves maintainability
  - Prepared foundation for future config builder tools and custom template types

## [1.0.20] - 2025-09-21

### Added

#### Email Template Generation for Tickets

- **Third Tab in Ticket Modal**: Added "Email Template" tab alongside existing "Ticket Details" and "Vulnerabilities" tabs
  - Professional email template automatically generated from ticket data
  - Includes subject line suggestion with site name and Hexagon ticket number
  - Formatted with clear sections: Maintenance Details, Affected Systems, Action Required, Timeline
  - Automatic device list formatting with enumeration

- **Email Copy Button**: New dedicated copy button for email template
  - Icon uses envelope symbol for clear identification
  - Copies formatted email template to clipboard
  - Toast notification confirms successful copy
  - Lazy loading only generates template when tab is clicked

- **Template Edit Button Stub**: Placeholder for future v1.0.21 template editing feature
  - Disabled button with tooltip indicating "Template editing coming in v1.0.21"
  - Positioned alongside copy buttons for consistent UI
  - Prepares interface for upcoming customizable templates

- **Enhanced Workflow**: Email template streamlines communication process
  - Pre-formatted professional communication ready for sending
  - Includes all critical ticket information in email-friendly format
  - Consistent messaging across team communications
  - Reduces time spent composing maintenance notifications

## [1.0.19] - 2025-09-21

### Added

#### Enhanced Ticket Modal with Vulnerability Integration

- **Dual Copy Buttons**: Ticket modal now features two separate copy buttons
  - "Ticket" button: Copies ticket markdown to clipboard (existing functionality)
  - "Vulnerabilities" button: Copies vulnerability report markdown without requiring bundle download

- **Tabbed Interface**: New Bootstrap tabs in ticket modal for better information organization
  - "Ticket Details" tab: Shows existing ticket markdown view
  - "Vulnerabilities" tab: Displays vulnerability report for all devices in the ticket
  - Lazy loading: Vulnerability data only fetched when tab is clicked
  - Fuzzy hostname matching using Levenshtein distance for flexible device matching

- **Improved Workflow**: Users can now quickly access and copy vulnerability data directly from the ticket modal without needing to download the full bundle

### Changed

- **Repository Cleanup**: Removed deprecated files and development artifacts
  - Cleaned up .claude/, .specify/, and .context7/ directories
  - Removed test files, backups, and temporary uploads
  - Streamlined repository structure for better maintainability

## [1.0.18] - 2025-09-20

### Added

#### UI/UX Enhancements

- **Attachment Visibility for Tickets**: Added comprehensive tooltip functionality for "Attach Documentation" button on tickets2.html
  - Displays list of currently attached files with sizes on hover
  - Shows file count badge when documents are attached (e.g., "(3)")
  - Button changes from gray outline to blue when files are present
  - Tooltips persist across page refreshes using localStorage
  - Added Shift+Click and Right-Click functionality to clear all attachments with confirmation
  - Smooth animations and visual feedback for improved user experience
  - Resolves issue where users had no visibility of attached files until downloading bundles

### Fixed

#### Bug Fixes

- **Attachment Tooltip Navigation Bug**: Fixed issue where tooltip displayed empty content after navigating between pages
  - Root cause: Bootstrap tooltip wasn't properly reinitializing when returning to tickets page
  - Solution: Dispose old tooltip instances and create fresh ones with proper data on page load
  - Added 100ms delay to ensure DOM readiness when navigating between pages

- **Version Display in Health Endpoint**: Fixed incorrect version reporting in `/health` API endpoint
  - Corrected package.json path in server.js from `./package.json` to `../package.json` for Docker container
  - Updated docker-compose.yml HEXTRACKR_VERSION environment variable to match package.json
  - Health endpoint now correctly reports version 1.0.18 instead of falling back to old versions

#### Documentation

- **JSDoc Dark Mode Restoration**: Fixed missing dark mode support in developer documentation
  - Ran `inject-jsdoc-theme.js` script to inject theme synchronization into 96 JSDoc HTML files
  - Dark mode now properly syncs with main application theme preference
  - Restored proper styling with dark backgrounds (#0f172a) and light text in dark mode

## [1.0.17] - 2025-09-19

### Added

#### UI/UX Enhancements

- **tickets2.html Beta Implementation**: Introduced beta version of redesigned tickets page with AG-Grid integration
  - Advanced table with column filtering, sorting, resizing, and responsive design
  - SITE and LOCATION columns with ticket accent colors for visual categorization
  - Enhanced user experience with modern data table interface
  - Maintains backward compatibility with existing tickets.html

### Fixed

#### Theme Engine & Visual Improvements

- **Card Border Visibility**: Fixed critical card border issue where vulnerability and device cards blended into page background
  - Root cause: CSS specificity conflicts with `border-color: transparent !important` overrides in dark theme
  - Solution: Standardized border variables from `--tblr-border-color` to `--hextrackr-border-subtle`
  - Enhanced border opacity from 0.08 to 0.15 for better visibility across both light and dark modes
  - Applied Five Whys root cause analysis to identify true underlying issues

- **AG-Grid Dark Mode Contrast**: Fixed poor contrast for SITE and LOCATION ticket accent colors in dark mode
  - Moved ticket accent colors from `.ag-theme-quartz` scope to global `[data-bs-theme="dark"]` scope
  - Optimized colors for WCAG AA compliance with enhanced contrast ratios:
    - Teal: #2dd4bf → #5eead4 (9.5:1 contrast ratio)
    - Amber: #fbbf24 → #fcd34d (11.2:1 contrast ratio)
    - Slate: #94a3b8 → #cbd5e1 (10.2:1 contrast ratio)
  - All ticket accent colors now meet accessibility standards for dark backgrounds

- **CSS Variable Consolidation**: Comprehensive cleanup of CSS variable architecture
  - Fixed Stylelint duplicate variable warnings by creating properly namespaced versions
  - Implemented standard and `-contrast` variants for VPR (Vulnerability Priority Rating) colors
  - Consolidated shadow variables with theme-specific opacity values
  - Created single source of truth for all color definitions across light/dark themes

- **Device Card Interactivity**: Enhanced device cards with click functionality matching vulnerability cards
  - Made device cards clickable with proper cursor styling and modal integration
  - Unified user experience patterns between vulnerability and device card interactions
  - Added comprehensive JSDoc documentation for improved code maintainability

#### CSV Import Pipeline

- **Daily Totals Calculation**: Fixed critical bug where `calculateAndStoreDailyTotalsEnhanced` was missing scan_date filter
  - Root cause: Spec 001 backend refactoring removed the WHERE clause filtering by specific scan date
  - Impact: Each import would overwrite all previous daily totals instead of updating only the current date
  - Solution: Restored `WHERE scan_date = ?` filter in importService.js line 985

- **Batch Processing Restoration**: Re-implemented `processStagingToFinalTables` function with proper lifecycle management
  - Restored grace period handling for vulnerability state transitions
  - Fixed batch processing with 1000-record chunks for performance
  - Ensured atomic imports via staging table approach

- **API Response Format**: Fixed /api/vulnerabilities/stats returning array instead of expected object format
  - Frontend expected severity-keyed object but received array after modularization
  - Restored legacy response contract to maintain backward compatibility

### Documentation

- **CSS Theme Architecture**: Added comprehensive documentation for theme system architecture
  - Documented CSS variable hierarchy and naming conventions
  - Added WCAG contrast guidelines and accessibility best practices
  - Provided CSS customization guide for theme modifications

- **Developer Documentation Link**: Fixed broken dev docs link in documentation portal
  - Changed from `/dev-docs/` to `/dev-docs-html/` to match actual directory structure

- **JSDoc Regeneration**: Updated developer documentation with all recent fixes
  - Documented new import service functions and batch processing
  - Added comprehensive function descriptions for ImportService
  - Enhanced vulnerability-cards.js with detailed JSDoc comments

## [1.0.16] - 2025-09-18

### Fixed

#### Documentation Navigation State Management

- **Navigation State Persistence Issue**: Fixed dual highlighting of menu sections when navigating to documentation from external pages
  - Root cause: Saved navigation state from localStorage was restored even when accessing docs from tickets/vulnerabilities pages
  - Solution: Detect external navigation via `document.referrer` and clear saved state for clean entry
  - Added exclusive menu expansion to prevent multiple sections appearing active simultaneously
  - Overview page now always starts with all menus collapsed for consistent presentation

#### Version Consistency

- **Health API Version Mismatch**: Fixed health endpoint reporting outdated version (1.0.13 instead of 1.0.15)
  - Root cause: Hardcoded `HEXTRACKR_VERSION=1.0.13` in docker-compose.yml overriding code defaults
  - Solution: Enhanced docs generation script to automatically sync version across all files

### Changed

#### Version Management System

- **Centralized Version Updates**: Enhanced html-content-updater.js with comprehensive version synchronization
  - Single source of truth: `app/public/package.json`
  - Automatically updates: footer.html, docker-compose.yml, root package.json, and server.js fallback
  - Runs during `npm run docs:generate` to maintain version consistency project-wide
  - Prevents version drift across multiple hardcoded locations

## [1.0.15] - 2025-09-17

### Changed

#### Backend Modularization Complete

- **Monolithic Refactor Achievement**: Successfully modularized 3,805-line monolithic server.js
  - Reduced main server.js to ~205 lines (94.6% reduction)
  - Extracted into 5 controllers, 4 services, 5 routes, 3 config modules, and 3 utilities
  - Implemented singleton pattern for controllers with dependency injection
  - Maintained 100% backward compatibility with all existing APIs
- **Module Organization**:
  - `/app/controllers/` - Business logic with singleton pattern (5 controllers)
  - `/app/services/` - Data access layer (4 services)
  - `/app/routes/` - Express route definitions (5 route modules)
  - `/app/config/` - Configuration modules (database, middleware, websocket)
  - `/app/utils/` - Utility classes (PathValidator, ProgressTracker, helpers)
- **Critical Initialization Sequence**: Established proper dependency injection order
  - Database initialization → Controller initialization → Route imports → Server start
  - Fixed initialization timing issues that caused "Controller not initialized" errors

### Added

- **Documentation Updates**:
  - Module dependency diagram with ASCII visualization
  - Migration rollback procedure for emergency recovery
  - Updated CLAUDE.md with modular patterns and initialization sequence
  - Comprehensive architecture documentation reflecting new structure

### Fixed

- **Controller Reference Pattern**: Fixed class vs instance pattern in all route files
- **Route Mounting**: Corrected path concatenation issues (e.g., /api/imports/imports)
- **File Name Case Sensitivity**: Standardized on lowercase controller filenames

### Technical Debt Resolved

- **T053 Backend Modularization**: Completed full extraction from monolithic architecture
- **Maintainability**: Improved code organization from single 3,805-line file to 15+ focused modules
- **Testability**: Enabled unit testing through dependency injection and service separation

## [1.0.14] - 2025-09-14

### Added

#### Documentation Portal Enhancements

- **AG-Grid Community Integration**: Advanced data tables for interactive documentation
  - Interactive table converter for markdown tables to AG-Grid format
  - Roadmap table sorting functionality with real-time filtering
  - Responsive AG-Grid tables optimized for mobile devices
  - Dark mode AG-Grid theme integration with proper color schemes
- **Enhanced Navigation System**: Improved user experience and accessibility
  - Back-to-top button with smooth scroll behavior and visual feedback
  - Enhanced breadcrumb navigation system with proper spacing
  - Loading spinner for content transitions
  - Responsive documentation layout with mobile optimization
- **UI/UX Improvements**: Professional navigation and interaction patterns
  - Enhanced navigation with visual feedback and hover effects
  - Improved sub-navigation styling with transform animations
  - Avatar styling enhancements in navigation components
  - Collapse icon rotation animations for expandable sections
- **Mermaid Diagram Support**: Interactive diagram rendering for documentation
  - Client-side Mermaid.js integration for rendering diagrams from markdown
  - Theme-aware diagram rendering with automatic dark/light mode switching
  - Custom CSS styling for consistent diagram appearance across themes
  - Support for flowcharts, sequence diagrams, state diagrams, and more
  - Foundation for future network topology and vulnerability mapping features

#### Architecture Review System

- **Comprehensive Architecture Assessment**: Complete technical review using 5 specialized expert agents
  - Node.js backend architecture analysis (3,809-line monolithic server assessment)
  - SQLite database schema and performance evaluation (15 tables, 31 indexes)
  - OWASP Top 10 security vulnerability assessment
  - JavaScript frontend architecture review (17,951 lines across 46 files)
  - WebSocket real-time communication analysis (Socket.io implementation)
- **Expert Agent System**: 138+ specialized domain expert agents for technical analysis
- **Roadmap Management**: Enhanced project planning with semantic versioning and changelog automation

### Fixed

#### Vulnerability VPR Aggregation (Totals & Trends)

- Fixed inflated per‑severity VPR totals caused by multi‑CVE split rows each carrying the full VPR score
  - Root Cause: Daily totals used `SUM(vpr_score)` over `vulnerabilities_current`, multiplying VPR when a single plugin row listed multiple CVEs
  - Solution: Enhanced daily totals now aggregate VPR by a deduplicated key and sum once per vulnerability entity per host
    - Aggregation key preference: `plugin_id + host` → fallback `plugin_name + host` → fallback `host + description`
    - Counts remain row-based (each CVE row counts); only VPR totals are deduplicated
  - Impact: Stat cards and trend chart now align; Medium spike resolved without altering per‑row VPR in tables
  - Files: `app/public/server.js` (calculateAndStoreDailyTotalsEnhanced)

#### Trend Badge Wiring and Casing

- Fixed trend badges (+/−%) stuck at 0% due to trends not being wired and key casing mismatch
  - Wire: Orchestrator now sets trends on `VulnerabilityStatisticsManager` before UI update
  - Casing: Use capitalized severity keys from `/recent-trends` and robust fallback to data manager trends
  - Files: `app/public/scripts/shared/vulnerability-core.js`, `app/public/scripts/shared/vulnerability-statistics.js`

#### Dark Mode Accessibility Critical Fixes (WCAG Compliance)

- **Navigation Contrast Violation Resolution**: Fixed critical WCAG AA compliance issue
  - **Root Cause**: Selected navigation items had white text on white background (1:1 contrast ratio)
  - **Solution**: Implemented proper dark mode color hierarchy using HexTrackr surface variables
    - Active states: `#2a3f54` background with `#e2e8f0` text (high contrast)
    - Hover states: `#1e293b` background with consistent readable text
    - Sub-navigation: `#94a3b8` muted text with `#243447` hover background
  - **Impact**: Ensures accessibility compliance for visually impaired users
  - **Validation**: Tested across documentation portal, tickets, and vulnerabilities pages

#### Documentation Portal Specific Fixes

- **Header Spacing Issue Resolution**: Eliminated unwanted space above documentation portal header
  - **Root Cause**: CSS rule `.navbar { margin-top: 1rem; }` in docs-tabler.css pushing header down
  - **Solution**: Commented out problematic CSS rule (lines 13-17 in docs-tabler.css)
  - **Impact**: Documentation portal header now aligns consistently with tickets/vulnerabilities pages
  - **Method**: Systematic investigation using sequential thinking and user feedback
- **Breadcrumb and Layout Improvements**: Enhanced documentation page structure
  - Fixed breadcrumb spacing to prevent cramped appearance above menu items
  - Resolved page header positioning conflicts
  - Enhanced documentation content area scroll behavior
  - Improved loading spinner visibility and positioning

#### Modal and Component Accessibility Fixes

- **Modal Contrast Improvements**: Enhanced readability across light and dark themes
  - Improved modal contrast and text readability
  - Fixed table styling in both light and dark modes with proper variable usage
  - Enhanced blockquote styling with theme-aware background colors
  - Resolved loading spinner visibility issues in modal contexts

### Changed

#### CSS Architecture Improvements

- **Modularized Documentation CSS**: Created dedicated docs-tabler.css for portal-specific styling
  - Separated documentation portal styles from main application CSS
  - Enhanced table styling with proper Bootstrap variable integration
  - Improved dark mode table support with enhanced border and background colors
  - Streamlined navigation styling with consistent active states
- **Theme System Enhancements**: Better CSS variable usage for consistency
  - Standardized HexTrackr surface hierarchy variables across components
  - Enhanced CSS custom property usage for maintainable theming
  - Improved color consistency between documentation portal and main application
  - Better separation of concerns between shared and page-specific styles

## [1.0.13] - 2025-09-13

### Added

#### Dark Mode Theme System (Spec 005)

- **Complete Dark/Light Theme Implementation**: Full theme switching system with accessibility focus
  - System preference detection using `prefers-color-scheme` media query
  - Manual theme toggle with persistent localStorage storage (sessionStorage fallback for private browsing)
  - Smooth CSS transitions between light and dark themes
  - WCAG AA compliance with automated contrast ratio validation
  - Screen reader announcements for theme changes via accessibility API
  - Cross-tab synchronization of theme preferences
- **Component Integration**: Seamless theming across all UI components
  - AG-Grid theme integration with custom dark/light variants
  - ApexCharts automatic theme adaptation
  - Tabler framework theme variables override system
  - Modal and overlay components with theme-aware styling
- **Developer Features**: Comprehensive theme development tools
  - Theme validation utilities with contrast checking
  - Debugging tools for theme state management
  - Performance optimizations for theme switching
  - Extensible architecture for future theme variants

### Fixed

#### Card Border Consistency (Dark Mode)

- **Card Border Styling**: Fixed inconsistent border appearance between device cards and vulnerability cards in dark mode
  - Resolved thick white borders on device cards that didn't match the thin dark borders on vulnerability cards
  - Updated `.device-card, .vuln-card` CSS rule in `vulnerabilities.html` to use theme-aware CSS variables
  - Changed hard-coded values to CSS variables for proper theme adaptation:
    - `background: white` → `background: var(--tblr-bg-surface)`
    - `border: 1px solid #e2e8f0` → `border: 1px solid var(--tblr-border-color)`
  - Both card types now display consistent borders across light and dark themes
  - **Engineering Insight**: Hard-coded CSS values prevented proper theme adaptation despite external stylesheet rules
  - **Resolution Method**: Systematic investigation using sequential thinking and disciplined Memento documentation

#### AG-Grid Table Container Overflow (Spec 004)

- Fixed AG-Grid table overflow causing excessive white space in Vulnerability Data Workspace
- Removed problematic grid-height-manager.js calculations and vulnerability-table-fix.css
- Implemented clean flexbox solution for natural container sizing:
  - `.card-body.p-2` uses `display: flex` with consistent minimum height
  - `.view-content` with `flex-grow: 1` for proper space distribution
  - `#vulnGrid` with `height: 100%; flex-grow: 1` for natural expansion
- Table now properly expands for 10, 25, 50, 200 items without overflow or excessive padding
- **Engineering Insight**: Simple CSS flexbox approach solved what complex JavaScript calculations could not
- **Lesson Learned**: Elegant solutions often emerge from removing complexity rather than adding it

## [1.0.12](https://github.com/Lonnie-Bruton/HexTrackr/releases/tag/v1.0.12) - 2025-09-09

### Completed Tasks

#### Javascript Module Extraction (Spec 001)

- vulnerability-statistics.js (364 lines) - Task 1.2 ✅ COMPLETED
- vulnerability-data.js (571 lines) - Task 1.1 ✅ COMPLETED
- vulnerability-chart-manager.js (590 lines) - Task 2.2 ✅ COMPLETED
- vulnerability-details-modal.js (935 lines) - Task 3.3 ✅ COMPLETED
- device-security-modal.js (637 lines) - Additional modal ✅ COMPLETED
- progress-modal.js (649 lines) - Additional modal ✅ COMPLETED
- settings-modal.js (1,296 lines) - Settings management ✅ COMPLETED
- ag-grid-responsive-config.js (356 lines) - Grid configuration ✅ COMPLETED
- vulnerability-search.js (268 lines) - Task 2.1 ✅ COMPLETED (Sept 8)
- vulnerability-grid.js (195 lines) - Task 3.1 ✅ COMPLETED (Sept 8)
- vulnerability-cards.js (345 lines) - Task 3.2 ✅ COMPLETED (Sept 8)
- vulnerability-core.js (571 lines) - T004 ✅ COMPLETED (Sept 8)
- T001 Extract vulnerability-search.js ✅ COMPLETED
- T002 Extract vulnerability-grid.js ✅ COMPLETED
- T003 Extract vulnerability-cards.js ✅ COMPLETED
- T004 Create vulnerability-core.js ✅ COMPLETED

## [1.0.11] - 2025-09-08 (Pre-Release)

### Completed - Sprint T001-T006: JavaScript Modularization Success

- **Extraordinary Sprint Achievement**: 4-week sprint completed in 1 day with 95.1% code reduction
  - **11 Specialized Modules Created**: Complete modular architecture from 2,429-line monolith
  - **Orchestrator Pattern Implementation**: vulnerability-manager.js reduced to 120-line coordinator
  - **Zero Functionality Regression**: All features preserved and validated through comprehensive testing
  - **Widget Architecture Foundation**: Complete foundation established for dashboard platform

- **Module Extraction Achievement**: Comprehensive code organization and maintainability improvements
  - **vulnerability-data.js** (571 lines): Central data management and caching
  - **vulnerability-statistics.js** (364 lines): VPR calculations and metrics generation
  - **vulnerability-search.js** (348 lines): Advanced search and filtering functionality  
  - **vulnerability-grid.js** (529 lines): AG Grid table interface management
  - **vulnerability-cards.js** (395 lines): Card-based responsive layouts
  - **vulnerability-chart-manager.js** (590 lines): ApexCharts visualization management
  - **vulnerability-details-modal.js** (935 lines): Modal system and detail views
  - **vulnerability-core.js** (338 lines): Module orchestration and coordination
  - **Additional supporting modules**: Enhanced architecture with specialized utilities

- **Integration Testing Success**: Comprehensive validation ensuring production readiness
  - **Playwright Browser Testing**: Full UI functionality validation across browsers
  - **Performance Benchmarking**: Maintained sub-2s load times and sub-500ms table rendering
  - **Code Quality Validation**: ESLint compliance and improved complexity scores
  - **Memory Management**: No memory leaks detected in continuous usage testing

### Completed - Code Quality Excellence

- **Markdownlint Configuration Mastery**: Achieved 92% reduction in false positives (157→13 issues)
  - **Directory Exclusion Strategy**: Comprehensive ignore patterns eliminating node_modules and test artifacts
  - **Clean PR Achievement**: Pull Request #32 with zero markdown issues through proper configuration
  - **Quality Gate Success**: Focused validation on documentation files only, excluding build artifacts
- **Code Quality Pipeline Enhancement**: Systematic approach to quality tool configuration
  - **False Positive Elimination**: Strategic directory exclusion patterns for accurate analysis
  - **Documentation Standards**: Maintained high documentation quality without tool noise
  - **Development Velocity**: Reduced quality checking overhead through intelligent exclusions

### Completed - Sprint Task Achievement

- **Task 1.2 Extraction Complete**: vulnerability-statistics.js successfully modularized (Sep 8, 2025)
  - **VPRStatistics Widget**: Created 300-line statistics calculation module
  - **Modular Architecture**: Established pattern for remaining 6 widget extractions
  - **Widget Foundation**: Prepared statistics component for future dashboard integration
- **Development Milestone**: First major component extraction from ModernVulnManager complete
  - **Code Organization**: Statistical calculations now properly separated and reusable
  - **Interface Standardization**: Created consistent API patterns for inter-widget communication
  - **Quality Validation**: Comprehensive testing ensures zero functionality regression

### Strategic - Project Structure Analysis

- **Critical Structure Assessment**: Identified 39 root directory items requiring organization
  - **Docker Conflict Risk**: Accidental Node.js startups causing container conflicts
  - **Path Reference Impact**: 20+ HTML files requiring updates after folder restructure
  - **Git Strategy Planning**: Submodule approach for clean public repo with dev backup
- **Architecture Planning**: /app/public/ migration strategy developed
  - **Container Isolation**: Ensure Docker-only Node.js execution
  - **Clean Repository Structure**: <10 root items for improved navigation
  - **Development File Separation**: Distinguish app code from development tools

## [1.0.10] - 2025-09-07

### Fixed - Real-Time Progress Tracking

- **WebSocket Progress Updates**: Fixed CSV import progress modal hanging at 95% with spinning loading circle
  - **Session ID Synchronization**: Resolved frontend/backend session ID mismatch preventing real-time updates
    - Frontend generating: `import_1757226509515_1rd7p4qpd`
    - Backend generating: `cb92e1d6-42fa-4e8b-a01f-4ca6533011d3`
    - Fixed by modifying server.js to use frontend's sessionId instead of UUID generation
  - **Progress Complete Event Handling**: Added missing `progress-complete` event listener in WebSocket client
    - Server was emitting `progress-complete` but frontend only listened for `progress-update`
    - Added proper completion handler in `websocket-client.js` and `progress-modal.js`
    - Fixed JavaScript error: `this.updateProgressBar is not a function` → changed to `this.updateUI()`
  - **Page Refresh Integration**: Fixed modal closing without refreshing underlying data
    - Added `window.refreshPageData` function to `vulnerability-manager.js`
    - Progress modal now properly triggers data refresh after successful import completion
    - Eliminates blank page state on first upload after modal close

### Enhanced - User Experience Improvements

- **Progress Modal Cleanup**: Hidden hardcoded Current/Total/ETA display elements
  - Added `d-none` class to progress details section showing "0 0 --" placeholder values
  - Server already tracks current/total/eta internally for future enhancement implementation
  - Clean modal interface focusing on percentage progress and success messaging

### Performance - Import Processing Validation

- **CSV Import Speed**: Confirmed excellent import performance at ~6.8 seconds for 10,000 rows
  - User-reported "hanging at 95%" was UI issue, not performance problem
  - Bulk SQLite operations with transaction batching maintaining optimal throughput
  - WebSocket progress updates now properly display real-time progress from 5% → 95% → completion

## [1.0.9] - 2025-09-07

### Code Quality - Comprehensive Codacy Resolution

- **320 Issues Resolved**: Systematic code quality review resolved comprehensive issues
  - **SQL Schema Compliance**: Fixed critical syntax errors in `data/schema.sql`
    - Corrected comment formatting and positioning for SQLite compatibility
    - Fixed AUTOINCREMENT syntax errors preventing proper table creation
    - Resolved OR clause syntax issues in constraint definitions
  - **JavaScript Architecture Analysis**: Complete server.js complexity assessment and refactoring roadmap
    - Identified complexity score of 116 requiring modular architecture approach
    - Created comprehensive refactoring plan targeting <12 complexity per module
    - Established modular structure: services/, routes/, utils/, middleware/ organization
  - **CSS Standards Compliance**: Achieved full color notation standardization
    - Fixed rgba/rgb color format compliance across all stylesheets
    - Eliminated deprecated color notation patterns for browser compatibility
    - Enhanced CSS maintainability with consistent color standards

### Development Infrastructure

- **Code Quality Pipeline**: Enhanced automated quality assurance workflow
  - **Configuration Management**: Optimized `.codacy/codacy.yaml` exclusion patterns
    - Updated file exclusion rules for more accurate analysis
    - Improved configuration for JavaScript and CSS quality gates
    - Enhanced markdown linting integration with development workflow
  - **Pre-commit Enhancement**: Strengthened markdown processing validation
    - Improved formatting consistency across documentation files
    - Enhanced link validation and structure checking
    - Integrated quality gates with development workflow

### Technical Documentation

- **Architecture Documentation**: Comprehensive refactoring strategy documentation
  - **Modular Architecture Plan**: Detailed server.js refactoring roadmap in `/dev-docs/architecture/refactoring-plan.md`
    - 4-week implementation timeline with weekly milestones
    - Service layer extraction strategy with complexity targets
    - Risk mitigation and success metrics for architectural transition
  - **Development Workflow**: Enhanced development documentation with quality improvements section
    - Updated `/dev-docs/development/index.md` with code quality standards
    - Documented recent quality improvement achievements and methodologies
    - Integrated quality assurance practices with development best practices

## [1.0.8] - 2025-09-06

### Security Enhancements

- **XSS Protection**: Fixed critical AG Grid cell renderer vulnerability by replacing dangerous inline onclick handlers with secure event system
  - Removed vulnerable `onclick="vulnManager.viewDeviceDetails('${hostname}')"` pattern susceptible to code injection
  - Implemented secure `onCellClicked` event handler with proper parameter validation
  - Prevents hostname values containing quotes or special characters from breaking HTML structure
- **CORS Security Hardening**: Restricted unrestricted CORS policy to secure localhost-only origins
  - Changed from wide-open `cors()` to specific `origin: ['http://localhost:8080', 'http://127.0.0.1:8080']`
  - Added explicit HTTP methods and headers whitelist for enhanced security posture
  - Enables credentials for future authentication integration
- **DoS Protection**: Implemented express-rate-limit middleware to prevent denial-of-service attacks
  - Limits each IP to 100 requests per 15-minute window on all /api/ endpoints
  - Provides standardized rate limiting headers for client awareness
  - Protects import/export endpoints from API flooding attacks

### Performance Improvements

- **CSV Import Performance**: Achieved 11-13x speed improvement through staging table optimization
  - Large CSV files now import in 8-12 seconds instead of 45-60 seconds (10,000 rows tested)
  - Switched frontend from `/api/vulnerabilities/import` to high-performance `/api/vulnerabilities/import-staging`
  - Utilizes bulk database operations with transaction batching for optimal throughput
  - Maintains full rollover deduplication logic while dramatically improving user experience

### Development Infrastructure (2)

- **Comprehensive Security Audit**: Systematic code quality assessment with detailed vulnerability analysis
  - Conducted thorough security review identifying 6 vulnerabilities and architectural improvements
  - Generated detailed audit reports documenting security issues and remediation recommendations
  - Created comprehensive technical documentation structure in dev-docs/ for ref.tools indexing
- **Technical Documentation**: Established development documentation architecture
  - Comprehensive AG Grid responsive patterns, database schema evolution, and testing strategies
  - Created keyword-indexed technical documentation for enhanced searchability via ref.tools
  - Separated technical docs (dev-docs/) from user documentation (docs-source/) for clarity
- **Version Management**: Improved version reference strategy for reduced maintenance burden
  - Implemented generic version references in technical documentation to prevent version drift
  - Maintained specific versions only where semantically necessary (package.json, CHANGELOG, ROADMAP)

## [1.0.6] - 2025-09-06

### Fixed

- **Critical Modal Aggregation System**: Resolved major user-facing issues with modal data display
  - Fixed vulnerability modal showing only 1 device instead of properly aggregating all affected devices (now shows 24 devices for CVE-2017-3881)
  - Fixed device modal showing only 1 vulnerability instead of properly aggregating all vulnerabilities per device (now shows 12 vulnerabilities for grimesnswan03)
  - Implemented universal aggregation key using description field for consistent data grouping
  - Enhanced modal layering with proper Bootstrap Modal.getInstance() management

### Enhanced

- **Modal Architecture and User Experience**
  - Implemented description-field-based universal aggregation system for consistent data relationships
  - Enhanced testing strategy with comprehensive Playwright browser automation for modal workflows
  - Validated import/export pipeline performance with 10,000+ record handling
  - Improved modal transition workflow: vulnerability modal → closes → device modal opens seamlessly

### Technical Improvements

- **Testing and Validation Infrastructure**
  - Added comprehensive Playwright test coverage for modal aggregation functionality
  - Implemented automated UI testing for vulnerability and device modal interactions
  - Enhanced data validation pipeline for large dataset imports and aggregation accuracy
  - Improved modal state management with proper Bootstrap integration

## [1.0.7] - 2025-09-06

### Enhanced - Documentation Infrastructure

- **Documentation Infrastructure**: Comprehensive documentation update with modal architecture patterns
  - Documented modal aggregation system using description field as universal matching key
  - Enhanced testing documentation with Playwright browser automation integration
  - Updated user guides with detailed modal interaction workflows and functionality
  - Improved architecture documentation covering Bootstrap modal layering and state management

### Technical Improvements - Knowledge Management

- **Knowledge Management Integration**: Enhanced development workflow with persistent knowledge systems
  - Implemented pattern recognition system for development consistency
  - Documented modal aggregation architecture patterns for future development consistency
  - Enhanced testing strategy documentation with comprehensive Playwright validation workflows
  - Updated development guides with modern browser automation testing approaches

### Planned - v1.0.8

- **Dashboard Implementation**: Begin widget-based customizable dashboard development
- **Ticket System Modularization**: Apply lessons learned to tickets.js refactoring
- **Advanced Modal Features**: Implement export and reporting functionality from modal views

## [1.0.5] - 2025-09-05

### Added

- **JavaScript Modularization Architecture**: Established foundation for widget-based dashboard development
  - Created `/dev-docs/architecture/` documentation system with symbol tables and module boundaries
  - Established unified development workflow with enhanced pattern management
  - Designed comprehensive dashboard vision for drag-drop widget customization

- **PaginationController Module**: Successfully extracted first reusable component (216 lines)
  - Reduced vulnerability-manager.js from 2,614 to 2,429 lines (185 line reduction)
  - Established modularization patterns for future extractions
  - Validated zero-regression refactoring process

### Enhanced - Development Workflow

- **Development Workflow**: Standardized development documentation and processes
  - Updated development guides and instruction files with consistent patterns
  - Implemented systematic development handoff procedures
  - Created architectural documentation for coordinated development

- **Project Documentation**: Updated roadmap and sprint priorities to reflect modularization focus
  - Moved JavaScript refactoring to top priority status
  - Deferred documentation sprint until modularization completion
  - Established 4-week Phase 2 timeline for ModernVulnManager splitting

## [1.0.4] - 2025-09-05

### Added - Agent Enhancements

- **UI Testing Enhancement**: Integrated Playwright for live browser testing and visual validation
  - Enhanced testing capabilities with real-time browser automation for design verification
  - Added comprehensive visual testing for UI improvements and changes
  - Implemented before/after screenshot comparison for design changes

### Fixed - Version & Modal Issues

- **Version Badge Synchronization**: Fixed version inconsistency across application components
  - Resolved version badge displaying v1.0.1 while package.json showed v1.0.3
  - Enhanced version-manager.js to include footer badge URL synchronization
  - Added automated version sync command: `node scripts/version-manager.js <new-version>`
  - Implemented production safety with timestamped backups and comprehensive file manifest

- **Modal Layering Bug**: Fixed critical modal interaction issue in vulnerability management
  - Resolved hostname links within vulnerability modal opening device modal behind existing modal
  - Added proper Bootstrap Modal.getInstance() check to close existing modals before opening new ones
  - Implemented clean modal transitions: vulnerability modal → closes → device modal opens
  - Comprehensive Playwright testing confirms smooth modal workflows without layering issues

- **Table Resizing and Pagination**: Implemented working table resizing and card pagination system
  - Added responsive table column resizing functionality
  - Implemented complete pagination system with 6-card default for optimal viewing
  - Fixed incomplete pagination code that previously broke card display functionality
  - Restored comprehensive card functionality across all views

### Enhanced - User Experience

- **User Experience Improvements**
  - Professional modal behavior with proper state management
  - Improved visual consistency with synchronized version badges across all components
  - Enhanced table interaction with responsive design and pagination controls
  - Streamlined vulnerability-to-device navigation workflow

### Technical Improvements - Agent Architecture

- **Testing Architecture**: Enhanced documentation and testing infrastructure with advanced integrations
  - Added Playwright for live browser validation of UI changes
  - Integrated persistent knowledge management across development sessions
  - Improved documentation pipeline with automated visual verification

- **Version Management**: Comprehensive version synchronization system
  - Enhanced version-manager.js with footer badge support and backup safety
  - Added regex pattern matching for badge URL updates: `/HexTrackr-v[\\d.]+(-blue\\?style=flat)/g`
  - Implemented automated backup system with timestamps and rollback capabilities

## [1.0.3] - 2025-09-03

### Fixed - Documentation Accuracy

- **Documentation Accuracy**: Comprehensive documentation review and fixes
  - Updated API reference to include missing `/api/restore` endpoint
  - Clarified difference between `/api/vulnerabilities/import` and `/api/import/vulnerabilities` endpoints
  - Fixed formatting and consistency issues across documentation
  - Ensured all user guides are complete and accurate

### Enhanced - Documentation Improvements

- **Documentation Improvements**:
  - Added explanatory section on import API options
  - Expanded backup and restore documentation with clearer examples
  - Improved navigation and cross-references between related documentation

### Enhanced (Infrastructure)

- **Documentation Infrastructure**: Enhanced automation and quality assurance
  - Improved documentation generation pipeline with automated analysis
  - Added comprehensive documentation review standards and metrics
  - Enhanced cross-reference validation and content accuracy checking

- Docs: Dynamic overview statistics loaded from new `/api/docs/stats` endpoint; falls back to existing static counts

  if API unavailable

- Ticket modal enhancements (v1.1.0)
  - XT# read-only field display
  - Site/location separation and validation
  - Status workflow updates (remove In-Progress, add Staged/Failed/Overdue)
  - Drag-drop UX improvements with accessibility features
  - Auto-status updates for overdue tickets

## [1.0.1] - 2025-08-27

### Fixed - Device Management UI

- **Device Management UI**: Fixed button order from + - to - + for consistent positioning
  - Resolved button position switching that caused UX friction during rapid clicking
  - Updated both initial template (tickets.html) and dynamic generation (tickets.js)
  - Enables efficient "tap tap tap" workflow without mouse repositioning

### Improved

- **Drag-and-Drop System**: Comprehensive bug fixes for device reordering
  - Fixed drag-to-top insertion logic to work repeatedly
  - Preserved reverse button visibility during drag operations
  - Fixed reverse toggle functionality to properly toggle state
  - Enhanced feedback system to maintain UI consistency during operations

## [1.0.0] - 2025-08-27

### Summary

Stable baseline release of HexTrackr cybersecurity ticket and vulnerability management system.

### Features

- **Dual-Purpose Management System**
  - Ticket management with full CRUD operations
  - Vulnerability tracking and analysis
  - Real-time statistics dashboard

- **Database Management**
  - SQLite backend with 17 tickets and 100,553+ vulnerabilities
  - Comprehensive backup/restore system (ZIP format)
  - CSV import/export functionality
  - Web-based data management (no technical knowledge required)

- **ServiceNow Integration**
  - Configurable ServiceNow instance URL
  - Clickable ticket number links
  - Settings modal configuration

- **User Interface**
  - Bootstrap 5 (tickets) + Tabler.io (vulnerabilities) frameworks
  - Responsive design with modular CSS architecture
  - Dark/light theme support
  - Settings modal with tabbed interface

- **Development Infrastructure**
  - Docker-only deployment with Docker Compose
  - Modular JavaScript architecture (shared/pages separation)
  - Comprehensive documentation system
  - Git-based version control with systematic backups

### Technical Stack

- **Backend**: Node.js/Express with SQLite database
- **Frontend**: HTML5, JavaScript (ES6+), Bootstrap 5, Tabler.io
- **Deployment**: Docker + Docker Compose
- **Storage**: SQLite with localStorage fallback
- **Port**: localhost:8080

### Recent Fixes (Leading to v1.0.0)

- ✅ **Field Mapping Fix**: Resolved backend/frontend field mapping preventing ticket saves
- ✅ **ServiceNow Integration Restoration**: Fixed ID mismatches and exposed global functions
- ✅ **Modular CSS Architecture**: Eliminated font inconsistencies with proper CSS organization
- ✅ **Settings Modal Enhancement**: Added Papa Parse 5.4.1 and JSZip 3.10.1 for robust file handling

### Database Statistics (v1.0.0)

- Tickets: 17 total (9 open, 5 overdue, 8 completed)
- Vulnerabilities: 100,553 total
- Total Records: 100,570

### Known Limitations

- Manual XT# assignment (auto-generation planned for v1.1.0)
- Basic drag-drop interface (accessibility improvements planned)
- Status workflow needs refinement (updates planned for v1.1.0)

---

## Version History Notes

### Pre-v1.0.0 Development

- Extensive data recovery and restoration work
- Multiple architecture improvements and bug fixes
- Database corruption recovery with complete data restoration
- Progressive enhancement of import/export functionality

### Development Methodology

- Git-based development with systematic backup commits
- Docker-only deployment strategy
- Modular code organization (scripts/shared/, scripts/pages/)
- Comprehensive documentation maintenance

---

## Release Process

### Version Numbering

- **Major (X.0.0)**: Breaking changes or major architectural updates
- **Minor (1.X.0)**: New features and enhancements (backward compatible)
- **Patch (1.1.X)**: Bug fixes and minor improvements

### Release Cycle

1. Feature development on main branch with backup commits
2. Version tag creation with comprehensive release notes
3. Docker image updates with version tags
4. Documentation updates and roadmap adjustments
5. GitHub release with change summary

### Development Workflow

- All changes documented with descriptive commit messages
- Pre-work backup commits for safety
- Step-by-step implementation with verification
- Comprehensive testing before version tags
