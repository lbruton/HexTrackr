# HexTrackr UI/UX Technical Roadmap

<!-- markdownlint-disable MD013 MD009 -->

Updated: August 25, 2025

## 🎯 CURRENT STATUS: CHART ENHANCEMENT PHASE

## ✅ CURRENT ACHIEVEMENTS

- ✅ **VPR Toggle Bug Fix**: Fixed critical JavaScript bug in chart metric switching
- ✅ Modern Tabler.io vulnerability dashboard with real 6K records
- ✅ Time-series database migration complete (97% data reduction)
- ✅ Chart metric toggle working perfectly (Count ↔ VPR Sum modes)

## 🎯 NEXT PRIORITY

- **Chart Timeline Extension**: Extend chart to current date (Aug 25, 2025) with flat lines for data continuity

---

## 📋 PHASE 0: JavaScript Architecture & Code Organization ✅ COMPLETE Aug 26, 2025

Risk: LOW | Impact: HIGH | Duration: Ongoing

### 0.1 JavaScript File Organization ✅ **COMPLETED**

- [x] **tickets.html → tickets.js**: Successfully migrated following "each HTML page uses dedicated JS file" pattern
- [x] **app.js Legacy Cleanup**: Marked as LEGACY file with deprecation notice, no longer loaded by any HTML pages
- [x] **Architecture Documentation**: Updated copilot-instructions.md with detailed JavaScript organization rules

### 0.2 Vulnerabilities JavaScript Discovery & Strategy ✅ **COMPLETED**

- [x] **Code Location Discovery**: Found ~1860 lines of JavaScript embedded in vulnerabilities.html (NOT in app.js)
- [x] **Migration Target Created**: Created vulnerabilities.js with proper JSDoc documentation header
- [x] **Incremental Strategy**: Documented incremental migration approach - too much code to move at once
- [x] **Migration Rules**: New JS goes directly in vulnerabilities.js, modified JS gets commented out in HTML and moved to .js

### 0.3 Modular Architecture Implementation ✅ **COMPLETED Aug 26, 2025**

- [x] **Shared Components**: Implemented scripts/shared/settings-modal.js with unified Settings modal
- [x] **Page-Specific Files**: Created scripts/pages/ structure for organized code separation
- [x] **Integration Pattern**: Shared components FIRST, page-specific code SECOND loading pattern
- [x] **Settings Modal Unification**: Single settings modal working identically across both pages
- [x] **JavaScript Console Errors**: Fixed TypeError in setupEventListeners() with proper null checks
- [x] **Playwright Testing**: Comprehensive browser automation testing validates all functionality
- [x] **Data Loading Verification**: 100,553+ vulnerabilities properly displaying from database

### 0.4 Ongoing Vulnerabilities Migration 📋 **INCREMENTAL**

### 0.4 Ongoing Vulnerabilities Migration 📋 **INCREMENTAL** (2)

- [ ] **ModernVulnManager Class**: Migrate when modifying core functionality
- [ ] **Event Listeners**: Migrate when adding new event handling
- [ ] **AG Grid Initialization**: Migrate when updating grid features
- [ ] **CSV Import/Export**: Migrate when enhancing import functionality
- [ ] **Device Management**: Migrate when working on device features
- [ ] **Modal Handlers**: Migrate when fixing modal issues
- [ ] **API Communication**: Migrate when updating API endpoints
- [ ] **Utility Functions**: Migrate when refactoring helper functions

### 0.5 Layout & Responsiveness Issues ✅ **COMPLETED**

- [x] **Responsive AG Grid Configuration**: Implemented comprehensive 302-line responsive configuration with mobile-first design
- [x] **Mobile CSS Optimizations**: Added extensive media queries for 768px and 576px breakpoints
- [x] **Grid Auto-Sizing**: Implemented proper column auto-sizing and viewport adaptation
- [x] **Mobile Responsiveness**: Ensured tables and cards work properly on smaller screens
- [x] **Field Mapping Updates**: Fixed import_date → last_seen field mapping issues
- [x] **Modern Grid Initialization**: Replaced legacy 100+ line initializeGrid() with modern 15-line responsive version
- [x] **Desktop Layout Validation**: Confirmed all 8 columns display properly on desktop (1024x768)
- [x] **Responsive Script Integration**: Successfully integrated ag-grid-responsive-config.js into vulnerabilities.html

### 0.6 Modal Behavior Improvements 📋 **IN PROGRESS**

- [x] **Settings Modal Fixed**: Fixed initialization and restore functionality
- [x] **JSZip Integration**: Added proper dependency for backup/restore operations
- [ ] **Auto-Refresh After Modal**: Implement auto-refresh when settings modal is closed
- [ ] **Background Refresh**: Add background refresh during import/export operations
- [ ] **Toast Notifications**: Add toast notifications for all operations
- [ ] **Confirmation Feedback**: Improve visual feedback for successful operations

---

## 📋 PHASE 1: Database Schema Migration 

Risk: HIGH | Impact: CRITICAL | Duration: 2-3 tasks

### 1.1 Analyze Current Data Structure

- [ ] Audit existing vulnerability data patterns
- [ ] Identify unique vulnerability identifiers (CVE+hostname+date)
- [ ] Map current columns to time-series requirements

### 1.2 Design Time-Series Schema

- [ ] Create `vulnerability_master` table (static CVE data)
- [ ] Create `vulnerability_history` table (time-series: device+date+VPR)
- [ ] Add unique constraints: `(hostname, cve, scan_date)`
- [ ] Design indexes for latest-value queries

### 1.3 Create Migration Scripts

- [ ] Backup existing data
- [ ] Write migration script to reshape current data
- [ ] Test migration on sample data
- [ ] Create rollback procedures

---

## 📋 PHASE 2: Smart CSV Import System

Risk: MEDIUM | Impact: HIGH | Duration: 2-3 tasks

### 2.1 Redesign Import Logic

- [ ] Use date field as "last_updated" timestamp
- [ ] Implement UPSERT logic (UPDATE if exists, INSERT if new)
- [ ] Key on: `hostname + cve + scan_date`
- [ ] Track VPR changes over time

### 2.2 Data Validation & Integrity

- [ ] Validate date formats during import
- [ ] Ensure VPR score changes are logged
- [ ] Add data quality checks
- [ ] Handle malformed/duplicate entries gracefully

### 2.3 Import Analytics

- [ ] Track what changed during each import
- [ ] Report new/updated/unchanged vulnerabilities
- [ ] Log VPR trend changes per import

---

## 📋 PHASE 3: Core UX Improvements

Risk: MEDIUM | Impact: HIGH | Duration: 4-5 tasks

### 3.0 Layout & Table Responsiveness 🚨 **HIGH PRIORITY**

- [ ] **Fix Container Layout**: Vulnerabilities page body stretches full browser width instead of centered container
- [ ] **AG Grid Responsiveness**: Table cells don't auto-adjust when browser is resized - lots of dead space
- [ ] **Pagination Size Behavior**: Page size selector (50, 100, etc.) only enables scroll wheel instead of resizing table
- [ ] **Viewport Optimization**: Implement proper responsive design with appropriate padding and centering
- [ ] **Column Auto-Sizing**: Fix AG Grid columns to properly resize with viewport changes
- [ ] **Mobile Layout**: Ensure tables work on smaller screens with horizontal scroll or stacked layout
- [ ] **Search Bar Width**: Search bar and buttons don't fill the entire card width properly
- [ ] **Card Edge Alignment**: Statistics cards above search are slightly narrower than search card - edges should align
- [ ] **Title Indentation**: Dashboard title appears indented and not properly aligned
- [ ] **Layout Consistency**: Ensure all cards and elements have consistent padding and edge alignment

### 3.1 Modal System Architecture

### 3.1 Header & Navigation Cleanup

- [ ] Remove non-working "Import CSV Data" button from header
- [ ] Remove standalone "Settings" button (now in user dropdown)
- [ ] Clean up header layout for better visual balance
- [ ] Update navigation accessibility and keyboard support

### 3.2 CVE Link System Overhaul

- [ ] **CRITICAL BUG**: Fix CVE links opening ALL CVEs instead of clicked one
- [ ] Audit all CVE link implementations
- [ ] Create centralized CVE popup handler function
- [ ] Fix popup URL construction for multiple CVEs
- [ ] Implement 1200px wide popup standard
- [ ] Add error handling for blocked popups

### 3.3 Enhanced Vulnerability Details Modal

- [ ] **NEW FEATURE**: Click vulnerability description → modal
- [ ] Design vulnerability details modal (mirror of device modal)
- [ ] Show vulnerability details, totals, affected devices table
- [ ] Use 1200px width like device modal
- [ ] Add vulnerability metadata display (CVSS, VPR, timeline)
- [ ] Create vulnerability export functionality

### 3.4 Device Modal Export System

- [ ] **FIX**: CVE links in Active Vulnerabilities sub-table should open 1200px popup
- [ ] **CRITICAL BUG**: CSV export headers contain extra characters/corruption in device security reports
- [ ] **IMPLEMENT**: Generate Report → PDF/HTML export of Device Overview
- [ ] **IMPLEMENT**: Export button → CSV export of Active Vulnerabilities table
- [ ] Replace HTML file generation with PDF creation
- [ ] Add professional PDF headers/footers with timestamps

### 3.5 Advanced Trends Chart Analytics ✅ CRITICAL ISSUE RESOLVED

Risk: CRITICAL | Impact: HIGHEST | Duration: 2-4 hours total

**✅ RESOLVED**: Historical VPR Trends chart now correctly shows VPR SCORE SUMS with toggle functionality!

#### 3.5.1 Count vs VPR Sum Toggle ✅ **PHASE 1 - COMPLETE** (2025-01-28)

- ✅ **BACKEND FIX**: Modified `/api/vulnerabilities/trends` to return both count AND total_vpr data (API working correctly)
- ✅ **FRONTEND TOGGLE**: Added button group to Historical VPR Trends card header similar to Data Workspace switcher
- ✅ **CHART LOGIC**: Updated ApexCharts to switch between count vs VPR sum based on user selection
- ✅ **DEFAULT**: Set to VPR Sum (the correct behavior) instead of count
- ✅ **TESTING**: Verified toggle works both ways, VPR sum calculations accurate and meaningful
- ✅ **QUALITY**: Added ESLint config, Playwright testing confirms functionality

#### 3.5.2 Multi-Vendor Analytics 🎯 PHASE 2 - READY FOR IMPLEMENTATION (45 min estimated)  

- [ ] **VENDOR FILTERING**: Add Cisco | Palo Alto | Other | All vendor filter buttons
- [ ] **API ENHANCEMENT**: JOIN time-series with vulnerabilities table for vendor-specific trends
- [ ] **UI DESIGN**: 3-row button groups (Vendor, Metric, Aggregation) with clean spacing
- [ ] **BACKEND QUERY**: Support vendor parameter in trends API endpoint
- [ ] **TESTING**: Verify filtering works correctly (currently all data is Cisco)

#### 3.5.3 CVSS Support & Aggregation Methods 📊 PHASE 3 (30 min)

- [ ] **CVSS INTEGRATION**: Add CVSS Sum option (infrastructure ready, awaiting real CVSS data)
- [ ] **AGGREGATION TOGGLE**: Add Sum | Average toggle for both VPR and CVSS metrics  
- [ ] **API EXPANSION**: Support metric type (VPR/CVSS) and aggregation (sum/avg) parameters
- [ ] **CHART UPDATES**: Update tooltips and labels based on selected metric and aggregation
- [ ] **DEFAULT STATE**: All vendors, VPR Sum, Sum aggregation

#### 3.5.4 UI Polish & Performance 🎨 PHASE 4 (15 min)

- [ ] **RESPONSIVE DESIGN**: Ensure button groups work on mobile devices
- [ ] **LOADING STATES**: Add loading indicators during metric switching
- [ ] **PERFORMANCE**: Optimize API queries for vendor filtering
- [ ] **ACCESSIBILITY**: Add proper ARIA labels and keyboard navigation

**Vision**: Transform trends chart into comprehensive analytics dashboard with vendor-specific, multi-metric trend analysis using elegant button-based UI (no ugly dropdowns).

#### 3.5.5 Timeline Extension & Data Continuity 📈 PHASE 4 (45 min) 🎯 NEXT PRIORITY

- [ ] **TIMELINE EXTENSION**: Extend chart from last data point to current date (August 25, 2025)
- [ ] **FLAT LINE CONTINUATION**: Show flat lines when no new data exists between last scan and current date
- [ ] **DATE CALCULATION**: Calculate gap between max(date_discovered) and current date
- [ ] **DATA PADDING**: Add synthetic data points with same values to extend timeline
- [ ] **UX IMPROVEMENT**: Users see system is current and data is up-to-date visually
- [ ] **API ENHANCEMENT**: Support date range extension in trends endpoint
- [ ] **CHART CONFIG**: Update ApexCharts to handle extended timeline properly

---

## 📋 PHASE 4: Enhanced Filtering & Display

Risk: LOW | Impact: HIGH | Duration: 3-4 tasks

### 4.1 State Column Improvements & Default Filtering

- [ ] **DEFAULT**: Hide FIXED state by default in all filters (table, charts, totals)
- [ ] **STYLE**: Use different color scheme for STATE column (currently showing FIXED/Open)
- [ ] **FILTER**: Add State filter dropdown to table controls
- [ ] **CONSISTENCY**: Ensure state colors match across cards and table

### 4.2 Advanced Vendor Filtering System

- [ ] **FILTER**: Add Vendor filter dropdown (CISCO, Tenable, etc.)
- [ ] **UI**: Integrate with existing severity filter in clean layout
- [ ] **EXTEND**: Apply all table filters to card views (Devices/Vulnerabilities)
- [ ] **SYNC**: Keep filter state synchronized across view modes
- [ ] Extract vendor from plugin_name automatically
- [ ] Add vendor-specific vulnerability scoring

### 4.3 Interactive Statistics Cards

- [ ] Implement vendor filtering with flip animations
- [ ] Add historical trend integration
- [ ] Calculate vendor-specific statistics
- [ ] Show vendor comparison analytics

### 4.4 Layout & Navigation Improvements

- [ ] **REPOSITION**: Move search bar below charts and above table
- [ ] **CRITICAL FIX**: Fix non-functional "Clear Data" button in settings
- [ ] **UI**: Optimize layout flow for better user experience

### 4.5 Unified Header Design

- [ ] **HEADER UNIFICATION**: Remove purple bar from vulnerability dashboard
- [ ] **DARK HEADER**: Replace vuln dashboard top bar with tickets page dark header
- [ ] **TOGGLE INTEGRATION**: Move dark/light mode toggle into both page toolbars
- [ ] **MENU CONSISTENCY**: Add hamburger menu to both pages with same styling
- [ ] **BRANDING**: Ensure consistent HexTrackr branding across both dashboards

---

## 📋 PHASE 5: Performance & Navigation

Risk: LOW | Impact: HIGH | Duration: 2-3 tasks

### 5.1 Latest Values Display

- [ ] Modify `/api/vulnerabilities` to return latest values only
- [ ] Create efficient queries for most recent data per device+CVE
- [ ] Update vulnerability cards to show latest VPR
- [ ] Ensure tables reflect most recent scan data
- [ ] Add "last updated" timestamps to UI

### 5.2 Pagination Enhancement

- [ ] **OPTIMIZE**: Add pagination to card views (currently only table has it)
- [ ] **PERFORMANCE**: Reduce initial load by limiting cards per page
- [ ] **UX**: Consistent pagination controls across all views

### 5.3 Memory & Load Optimization

- [ ] **ANALYZE**: Current system loads 10,000+ records (Page 1 of 200)
- [ ] **OPTIMIZE**: Implement virtual scrolling or smaller page sizes
- [ ] **CACHE**: Better client-side data management

---

## 📋 **PHASE 6: Trend Visualization**

Risk: LOW | Impact: HIGH | Duration: 3-4 tasks

### 6.1 Historical Data API

- [ ] Create `/api/vulnerabilities/trends` endpoint
- [ ] Return VPR changes over time per vulnerability
- [ ] Support date range filtering

### 6.2 Chart Implementation

- [ ] Design Chart.js trend visualizations
- [ ] Show VPR score changes over time
- [ ] Display severity level migrations
- [ ] Add device-level trend analysis
- [ ] Implement interactive legend with line toggling

### 6.3 Dashboard Integration

- [ ] Add trend charts to vulnerability dashboard
- [ ] Create "trending up/down" indicators
- [ ] Show improvement/degradation analytics
- [ ] Add vendor filtering to historical trends

### 6.4 Reporting System Integration 🎯 **MID-TERM GOAL**

- [ ] **HTML Report Templates**: Design beautiful HTML report layouts
  - [ ] Executive summary reports with charts and trend visualizations
  - [ ] Technical detailed reports with vulnerability tables
  - [ ] Compliance reports with risk assessments
- [ ] **PDF Export Capabilities**: Implement report-to-PDF conversion
  - [ ] jsPDF integration for client-side PDF generation
  - [ ] Puppeteer integration for server-side PDF generation (future)
  - [ ] Print-optimized CSS for high-quality PDF output
- [ ] **Dual-Mode Reporting Support**:
  - [ ] **Live Tracking Mode Reports**: Individual vulnerability timelines with scan dates
  - [ ] **Scheduled Snapshots Mode Reports**: Aggregate trend reports with snapshot dates
  - [ ] Mode-specific chart types and data presentations
- [ ] **Report Customization**:
  - [ ] Customizable report branding and styling
  - [ ] Date range selection for both modes
  - [ ] Vendor and severity filtering in reports
  - [ ] Automated report scheduling and delivery

---

## 📋 **PHASE 7: Enhanced User Interactions**

Risk: LOW | Impact: MEDIUM | Duration: 3-4 tasks

### 7.1 Vulnerability Action Buttons

- [ ] **Edit Button (Pencil Icon)**: Create modal for editing vulnerability information
- [ ] **Refresh Button (Refresh Icon)**: Implement API data refresh for individual vulnerabilities
- [ ] **Button State Management**: Show appropriate tooltips and handle error states

### 7.2 Enhanced Table Interactions & Smart Filtering

- [ ] **Clickable Description Filtering**: Make vulnerability description column clickable to filter
- [ ] **Clickable CVE Filtering**: Make CVE Info column clickable to filter
- [ ] **Clickable Hostname Filtering**: Make hostname entries clickable to filter
- [ ] **Smart Info Icons**: Add info icons next to CVE entries, descriptions, hostnames
- [ ] **Enhanced Filter UI**: Show active filters as removable chips/badges

### 7.3 Device Security Modal Improvements

- [ ] **Remove "First Seen" Column**: Clean up modal table layout
- [ ] **Clickable Plugin Names**: Make Plugin Name column clickable links
- [ ] **Modal System Enhancements**: Create reusable vulnerability edit modal component

### 7.4 Modal Z-Index & CVE Bug Fixes

- [ ] **Fix Modal Layering**: Implement proper modal stacking system for nested modals
- [ ] **Fix CVE Link Behavior**: Ensure single CVE clicks open only that CVE popup
- [ ] **Fix HTML Report Artifacts**: Clean up character encoding issues in report titles

---

## 📋 **PHASE 8: API Integration Framework**

Risk: MEDIUM | Impact: HIGH | Duration: 2-3 tasks

### 8.1 API Supplement System

- [ ] Design hooks for real-time API data
- [ ] Create 30-day history pull mechanism
- [ ] Merge API data with CSV historical data

### 8.2 Data Source Management

- [ ] Support multiple data sources (CSV + API)
- [ ] Prioritize API data over CSV when available
- [ ] Maintain data source lineage
- [ ] Add API configuration status indicator to UI
- [ ] Implement API health checks

---

## 📋 **PHASE 9: Cross-Dashboard Integration**

Risk: MEDIUM | Impact: HIGH | Duration: 4-5 tasks

### 9.1 Tickets Page Redesign

- [ ] Audit current tickets.html design and functionality
- [ ] Apply Tabler.io framework to tickets page
- [ ] Implement consistent header and navigation design
- [ ] Update ticket cards to match vulnerability card styling
- [ ] Add VPR-style mini-cards for ticket priorities/statuses
- [ ] Update PDF generation to match new design

### 9.2 Ticket ↔ Vulnerability Cross-Reference

- [ ] **HOSTNAME LINKS**: Click hostname in tickets dashboard → opens vulnerability modal
- [ ] **DEVICE INTEGRATION**: Add "Open Ticket" button on vulnerability device cards
- [ ] **MODAL SHARING**: Share device modal component between dashboards
- [ ] **DATA INDEPENDENCE**: Maintain separate data storage for each dashboard

### 9.3 Authentication & Data Protection

- [ ] Implement secure login system with default credentials
- [ ] Add session management with HttpOnly cookies and proper expiration
- [ ] Create user profile management interface with secure password reset
- [ ] Default credentials: `admin` / `hextrackr2025` (changeable on first login)
- [ ] Implement proper CSRF protection on all forms
- [ ] Add API key management for programmatic access
- [ ] Implement audit logging for security-relevant events
- [ ] Configure proper security headers (CSP, X-Content-Type-Options, etc.)
- [ ] Add rate limiting on login and sensitive API endpoints

---

## 📋 **PHASE 10: Advanced UI/UX Features**

Risk: LOW | Impact: MEDIUM | Duration: 3-4 tasks

### 10.1 Dark Mode Implementation

- [ ] Design dark mode color palette for Tabler.io integration
- [ ] Implement CSS custom properties for theme switching
- [ ] Add dark mode toggle in user dropdown
- [ ] Update all charts and graphs for dark mode compatibility
- [ ] Create automatic dark/light mode based on system preference

### 10.2 User Experience Refinements

- [ ] Add keyboard shortcuts for power users
- [ ] Implement context menus for quick actions
- [ ] Add drag-and-drop for bulk operations
- [ ] Create onboarding tour for new users
- [ ] Add accessibility improvements (ARIA labels, keyboard nav)

### 10.3 Advanced Dashboard Customization

- [ ] Implement drag-and-drop dashboard builder
- [ ] Add widget library (charts, tables, statistics)
- [ ] Create dashboard templates for different roles
- [ ] Add dashboard sharing and collaboration features

---

## 🎯 **IMMEDIATE NEXT STEPS**

1. **Start with Phase 1.1**: Analyze current data structure
2. **Fix Critical Issues**: Address CVE link bugs and modal layering
3. **Test thoroughly**: Each phase must be working before moving on
4. **Implement time-series**: Core architecture change for trend tracking

## 📊 **Success Criteria**

- ✅ Time-series data model implemented with no duplicates
- ✅ All CVE links open properly in 1200px popups
- ✅ Vulnerability modal shows comprehensive device list
- ✅ State filtering works with proper color coding
- ✅ Vendor filtering implemented across all views
- ✅ Page load time reduced by 50%
- ✅ Memory usage optimized for large datasets

## 🚀 **Estimated Timeline**

- **Phase 1-2 (Database)**: 1-2 weeks
- **Phase 3-5 (Core UX)**: 2-3 weeks
- **Phase 6-8 (Advanced Features)**: 2-3 weeks
- **Phase 9-10 (Integration & Polish)**: 1-2 weeks
- **Total Duration**: 6-10 weeks

---
Last Updated: August 25, 2025 • Priority: HIGH - Critical trend tracking + UX improvements

- [ ] **CONTEXT PASSING**: Pass hostname/device context between systems
- [ ] **STATE MANAGEMENT**: Maintain independent operation of each dashboard

---

## 📋 **PHASE 7: Enhanced Statistics Cards** 

Risk: LOW | Impact: LOW | Duration: 2-3 tasks | Priority: VERY LOW

### 7.1 VPR Calculation Improvements

- [ ] **CRITICAL LOGIC**: Exclude FIXED state from VPR total calculations  
- [ ] **ACCURACY**: Ensure cards only count active vulnerabilities
- [ ] **CONSISTENCY**: Match card totals with filtered table data

### 7.2 Enhanced Card Design & Micro-Charts

- [ ] **SIZING**: Make statistics cards larger for better visibility
- [ ] **MICRO-GRAPHS**: Add small historical trend graphs within cards
- [ ] **SPARKLINES**: Show 7-day or 30-day trend indicators
- [ ] **VISUAL**: Enhanced card styling with embedded chart.js mini-graphs

---

## 📋 **PHASE 6: User Authentication & Security**

Risk: HIGH | Impact: CRITICAL | Duration: 5-6 tasks

### 6.1 Authentication System

- [ ] **LOGIN PAGE**: Create secure login interface with CSRF protection
- [ ] **SESSION MANAGEMENT**: Implement secure session handling with HttpOnly cookies
- [ ] **ROUTE PROTECTION**: Wrap both dashboards behind authentication middleware
- [ ] **DATA SECURITY**: Protect all API endpoints with auth middleware
- [ ] **JWT IMPLEMENTATION**: Use JWT tokens with proper expiration
- [ ] **PASSWORD SECURITY**: Implement password hashing with bcrypt (min. 10 rounds)
- [ ] **BRUTE FORCE PROTECTION**: Add rate limiting for login attempts
- [ ] **HTTPS ENFORCEMENT**: Redirect HTTP to HTTPS with proper headers

### 6.2 User Management

- [ ] **USER ACCOUNTS**: Basic user account system with secure reset flows
- [ ] **PERMISSIONS**: Role-based access control (Admin, User, Read-only)
- [ ] **API SECURITY**: Implement API key authentication for programmatic access
- [ ] **LOGOUT**: Secure logout mechanism with token invalidation
- [ ] **SESSION TIMEOUT**: Automatic logout after 30 minutes of inactivity
- [ ] **AUDIT LOGGING**: Track login/logout events and security-relevant actions
- [ ] **MFA SUPPORT**: Framework for adding multi-factor authentication later

### 6.3 API Security & Data Protection

- [ ] **API RATE LIMITING**: Prevent abuse with per-endpoint rate limits
- [ ] **INPUT VALIDATION**: Comprehensive validation for all user inputs
- [ ] **OUTPUT SANITIZATION**: Prevent XSS with proper output encoding
- [ ] **CONTENT SECURITY POLICY**: Implement strict CSP headers
- [ ] **SENSITIVE DATA HANDLING**: Proper encryption for sensitive information
- [ ] **ERROR HANDLING**: Security-conscious error messages (no leakage)
- [ ] **DATABASE SECURITY**: Parameterized queries and SQL injection prevention

---

## 📋 **PHASE 7: Future Enhancements & Nice-to-Have Features**

Risk: LOW | Impact: MEDIUM | Duration: Various | Priority: LOW

### 7.1 Interactive Chart Selection & Table Filtering

- [ ] **CHART SELECTION TO TABLE FILTER**: Connect ApexCharts selection box tool to vulnerability table filtering
  - [ ] **Event Integration**: Add `selection` event listener to capture chart time range selection
  - [ ] **Table Filtering**: Filter vulnerability table/cards based on selected chart time period
  - [ ] **Visual Feedback**: Show active time filter as removable chip/badge above table
  - [ ] **Clear Selection**: Add "Clear Time Filter" button to return to full dataset view
  - [ ] **Status Integration**: Update statistics cards to reflect filtered time period
  - **Current State**: Selection box works but only for chart zoom - no table integration
  - **Priority**: Medium - valuable feature connecting chart interaction with data filtering

### 7.2 Dashboard Layout Customization

- [ ] **DRAG-AND-DROP CARDS**: Make trends table and data workspace cards reorderable via drag-and-drop interface
  - [ ] **Library Integration**: Implement using SortableJS or custom drag-and-drop functionality
  - [ ] **State Persistence**: Save user's preferred card order in localStorage
  - [ ] **Visual Feedback**: Add smooth animations and drop zone indicators
  - [ ] **Touch Support**: Ensure drag-and-drop works on mobile devices
  - [ ] **Reset Option**: Allow users to reset to default layout
  - **Priority**: Very low - implement only after all other priorities are completed

---

## 🎯 **IMMEDIATE PRIORITIES**

1. **Phase 2.2** - Fix critical "Clear Data" button issue (urgent bug fix)
2. **Phase 7.1** - Fix VPR calculations to exclude FIXED state (data accuracy)
3. **Phase 2.4** - Unified header design (visual consistency)
4. **Phase 2.1** - Default hide FIXED state (immediate UX improvement)
5. **Phase 1.1** - Vulnerability Description Modal (high impact feature)
6. **Phase 2.2** - Search bar repositioning (layout improvement)

Which phase should we tackle first? I recommend starting with Phase 1.1 for immediate user value! 🚀
