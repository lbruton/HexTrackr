# HexTrackr Trend Tracking Roadmap
*Updated: August 24, 2025*

## 🎯 **CRITICAL ISSUE IDENTIFIED: No Trend Tracking**
**Problem**: CSV imports create duplicates instead of tracking changes over time  
**Solution**: Transform into time-series vulnerability management system

---

## 📋 **PHASE 1: Database Schema Migration** 
*Risk: HIGH | Impact: CRITICAL | Duration: 2-3 tasks*

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

## � **PHASE 2: Smart CSV Import System**
*Risk: MEDIUM | Impact: HIGH | Duration: 2-3 tasks*

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

## 📋 **PHASE 3: Latest Values Display**
*Risk: LOW | Impact: MEDIUM | Duration: 2 tasks*

### 3.1 Update API Endpoints
- [ ] Modify `/api/vulnerabilities` to return latest values only
- [ ] Create efficient queries for most recent data per device+CVE
- [ ] Ensure cards/tables show current state

### 3.2 Frontend Display Updates
- [ ] Update vulnerability cards to show latest VPR
- [ ] Ensure tables reflect most recent scan data
- [ ] Add "last updated" timestamps to UI

---

## 📋 **PHASE 4: Trend Visualization**
*Risk: LOW | Impact: HIGH | Duration: 3-4 tasks*

### 4.1 Historical Data API
- [ ] Create `/api/vulnerabilities/trends` endpoint
- [ ] Return VPR changes over time per vulnerability
- [ ] Support date range filtering

### 4.2 Chart Implementation
- [ ] Design Chart.js trend visualizations
- [ ] Show VPR score changes over time
- [ ] Display severity level migrations
- [ ] Add device-level trend analysis

### 4.3 Dashboard Integration
- [ ] Add trend charts to vulnerability dashboard
- [ ] Create "trending up/down" indicators
- [ ] Show improvement/degradation analytics

---

## � **PHASE 5: API Integration Framework**
*Risk: MEDIUM | Impact: HIGH | Duration: 2-3 tasks*

### 5.1 API Supplement System
- [ ] Design hooks for real-time API data
- [ ] Create 30-day history pull mechanism
- [ ] Merge API data with CSV historical data

### 5.2 Data Source Management
- [ ] Support multiple data sources (CSV + API)
- [ ] Prioritize API data over CSV when available
- [ ] Maintain data source lineage

---

## 🎨 **PHASE 6: Enhanced User Interactions**
*Risk: LOW | Impact: MEDIUM | Duration: 2-3 tasks*

### 6.1 Vulnerability Action Buttons Implementation
- [ ] **Edit Button (Pencil Icon)**: 
  - Create modal for editing vulnerability information
  - Allow updates to VPR scores, descriptions, status
  - Implement save/cancel functionality
  - Update database via API endpoints
- [ ] **Refresh Button (Refresh Icon)**:
  - Implement API data refresh for individual vulnerabilities
  - Gray out button when no API is configured
  - Show loading state during refresh
  - Update UI with fresh data from external sources
- [ ] **Button State Management**:
  - Show appropriate tooltips ("Edit vulnerability", "Refresh from API", "API not configured")
  - Handle error states gracefully
  - Provide user feedback for successful actions

### 6.2 Modal System Enhancements
- [ ] Create reusable vulnerability edit modal component
- [ ] Implement form validation for vulnerability updates
- [ ] Add confirmation dialogs for destructive actions
- [ ] Support bulk edit operations

### 6.3 Enhanced Table Interactions & Smart Filtering
- [ ] **Clickable Description Filtering**:
  - Make "Vulnerability Description" column clickable
  - Filter table to show all devices with same vulnerability when clicked
  - Highlight active filter in UI
  - Add clear filter option
- [ ] **Clickable CVE Filtering**:
  - Make "CVE Info" column clickable  
  - Filter table to show all instances of same CVE when clicked
  - Show filtered state clearly in UI
- [ ] **Clickable Hostname Filtering**:
  - Make hostname entries clickable
  - Filter table to show all vulnerabilities for that device when clicked
  - Provide device-specific view without modal popup
- [ ] **Smart Info Icons**:
  - Add info icon next to CVE entries → opens CVE database website (mitre.org, nvd.nist.gov)
  - Add info icon next to vulnerability descriptions → opens detailed vulnerability modal
  - Add info icon next to hostnames → opens device details modal
  - Use appropriate icons (external link, info, device icons)
- [ ] **Enhanced Filter UI**:
  - Show active filters as removable chips/badges
  - Add "Clear All Filters" button
  - Display filter count (e.g., "Showing 15 of 500 vulnerabilities")
  - Maintain filter state during pagination

### 6.4 Device Security Modal Improvements
- [ ] **Remove "First Seen" Column**: 
  - Clean up modal table layout
  - Remove redundant "First Seen" column from device modals
  - Optimize table width and readability
- [ ] **Clickable Plugin Names**:
  - Make "Plugin Name" column clickable links
  - Open individual vulnerability detail modal when clicked
  - Add hover effects to indicate clickability
  - Show vulnerability-specific information (description, remediation, etc.)
### 6.4 Device Security Modal Improvements
- [ ] **Remove "First Seen" Column**: 
  - Clean up modal table layout
  - Remove redundant "First Seen" column from device modals
  - Optimize table width and readability
- [ ] **Clickable Plugin Names**:
  - Make "Plugin Name" column clickable links
  - Open individual vulnerability detail modal when clicked
  - Add hover effects to indicate clickability
  - Show vulnerability-specific information (description, remediation, etc.)
- [ ] **PDF Report Generation**:
  - Replace HTML file generation with PDF creation
  - Implement proper PDF formatting and styling
  - Include charts and tables in PDF format
  - Add professional PDF headers/footers with timestamps
  - Maintain current "Generate Report" button but output PDF instead of HTML

### 6.5 API Integration Status
- [ ] Add API configuration status indicator to UI
- [ ] Show API connectivity status in header/footer
- [ ] Implement API health checks
- [ ] Graceful degradation when API is unavailable

---

## 🐛 **MAINTENANCE & BUG FIXES**
*Priority: LOW | Impact: LOW | Duration: 1 task*

### Bug: HTML Report Title Artifacts
- [ ] **Issue**: Modal-generated HTML reports show character encoding artifacts in titles
- [ ] **Symptoms**: Strange characters appearing in report headers (e.g., "øÝ┤µ Device Security Report")
- [ ] **Root Cause**: HTML entity encoding issues in report generation
- [ ] **Fix Required**: Clean up title rendering in modal report generation
- [ ] **Files to Check**: Modal report generation functions, HTML template processing

### Bug: Modal Z-Index Layering Issue
- [ ] **Issue**: Nested modals appear behind parent modals instead of on top
- [ ] **Symptoms**: Clicking hostnames in "Affected Assets" table opens device modals behind vulnerability detail modal
- [ ] **Root Cause**: Z-index stacking context problems with nested modal system
- [ ] **Fix Required**: 
  - Implement proper modal stacking system
  - Increase z-index for nested modals dynamically
  - Add modal backdrop management for multiple layers
  - Ensure latest modal always appears on top
- [ ] **Files to Check**: Modal JavaScript, CSS z-index values, Bootstrap modal configurations

### Bug: CVE Link Behavior - Multiple Popups
- [ ] **Issue**: Clicking any single CVE link opens ALL CVEs instead of just the clicked one
- [ ] **Symptoms**: User clicks one CVE (e.g., CVE-2024-1234) but browser opens popups for multiple/all CVEs
- [ ] **Root Cause**: `lookupCVE()` function incorrectly processing single CVE as multiple CVE string
- [ ] **Expected Behavior**: Clicking a CVE link should open only that specific CVE's lookup popup
- [ ] **Fix Required**: 
  - Debug `lookupCVE()` function in lines 2266-2281 of vulnerabilities.html
  - Check if CVE grouping or string processing is incorrectly splitting single CVE IDs
  - Ensure `openCVEPopups()` receives only the intended CVE ID
  - Test CVE links in table view, card view, and modal detail views
- [ ] **Files to Check**: `vulnerabilities.html` CVE link onclick handlers, `lookupCVE()` function, `openCVEPopups()` function

---

## 🎯 **IMMEDIATE NEXT STEPS**
1. **Start with Phase 1.1**: Analyze current data structure
2. **Keep it simple**: One task at a time
3. **Test thoroughly**: Each phase must be working before moving on

**Which phase would you like to start with? I recommend Phase 1.1 to understand our current data first! 🚀**
