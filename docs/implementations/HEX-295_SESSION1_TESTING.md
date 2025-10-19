# HEX-295 Session 1 Testing Guide

**Implementation**: Location Details Modal - Core Structure (v1.0.87)
**Linear Issue**: https://linear.app/hextrackr/issue/HEX-295
**Date**: 2025-10-18

---

## Implementation Summary

### Files Created

1. **`/app/public/scripts/shared/location-details-modal.js`** (397 lines)
   - LocationDetailsModal class with full JSDoc
   - Methods implemented: showLocationDetails(), populateLocationInfo(), calculateNetworkSubnet(), getVprSeverityClass(), showModal(), hide(), destroy()
   - Pattern sources documented in comments

### Files Modified

1. **`/app/public/vulnerabilities.html`**
   - Added modal HTML structure (lines 638-709)
   - Added script reference for location-details-modal.js (line 993)
   - Pattern: Bootstrap modal-xl modal-dialog-centered with theme propagation

---

## Pattern Reuse Documentation

### Network Subnet Calculation
**Source**: `location-cards.js:473-533`
**Implementation**: `location-details-modal.js:231-289`
- Exact reuse of production vs management subnet logic
- Prefers production networks (non-10.95/10.96/10.97)
- Falls back to management networks if no production found

### Vendor Badge Colors
**Source**: `device-security-modal.js:92-95`
**Implementation**: `location-details-modal.js:68-70`
- CISCO → bg-primary (blue)
- Palo Alto → bg-warning (orange)
- Other → bg-secondary (gray)

### Theme Propagation
**Source**: `device-security-modal.js:768-795`
**Implementation**: `location-details-modal.js:311-336`
- Detects current theme from document.documentElement
- Propagates data-bs-theme attribute to modal
- Bootstrap Modal initialization with cleanup listener

### Modal Structure
**Source**: `vulnerabilities.html:472-636` (Device Security Modal)
**Implementation**: `vulnerabilities.html:638-709` (Location Details Modal)
- Row → Col-lg-4 (left) + Col-lg-8 (right)
- Left: Information card
- Right: Placeholder cards for Session 2

---

## Browser Console Testing

### Test 1: Basic Modal Open

```javascript
// Test data (use actual location from location cards if available)
const locationData = {
  location: "wtulsa",
  location_display: "WTULSA",
  device_count: 42,
  device_ips: ["10.95.220.1", "10.95.220.2", "10.95.84.1", "10.142.15.1"],
  primary_vendor: "CISCO",
  total_vpr: 1847.3,
  severity_breakdown: {
    Critical: { count: 12, vpr: 456.2 },
    High: { count: 28, vpr: 892.1 },
    Medium: { count: 15, vpr: 398.0 },
    Low: { count: 8, vpr: 101.0 }
  },
  kev_count: 3,
  open_tickets: 2
};

// Open modal
window.locationDetailsModal.showLocationDetails(locationData, window.vulnManager?.dataManager);
```

**Expected Results**:
- ✅ Modal opens centered on screen
- ✅ Location: "WTULSA" displayed
- ✅ Device Count: "42 devices" badge
- ✅ Primary Vendor: Blue "CISCO" badge
- ✅ Total VPR: Red "1847.3" badge (critical severity)
- ✅ Risk Level: Red "Critical Risk" badge
- ✅ KEV Devices: Red "3" badge
- ✅ Open Tickets: "2" in blue
- ✅ Network: Calculated subnet displayed
- ✅ Address: "Coming soon" with tooltip
- ✅ Contacts: "Coming soon" with tooltip

### Test 2: Network Subnet Calculation

```javascript
// Test production network preference
const testLocation1 = {
  location: "test1",
  location_display: "TEST1",
  device_count: 10,
  device_ips: [
    "10.95.220.1", "10.95.220.2", // Management (should be deprioritized)
    "10.142.15.1", "10.142.15.2", "10.142.15.3", // Production (should win)
    "10.142.15.4", "10.142.15.5"
  ],
  primary_vendor: "CISCO",
  total_vpr: 500,
  severity_breakdown: { High: { count: 5, vpr: 500 } },
  kev_count: 0,
  open_tickets: 1
};

window.locationDetailsModal.showLocationDetails(testLocation1, null);

// Expected Network: "10.142.15.0/24" (production network preferred)
```

### Test 3: Vendor Badge Colors

```javascript
// Test CISCO (blue badge)
const ciscoLocation = {
  location: "cisco_test",
  location_display: "CISCO TEST",
  device_count: 5,
  device_ips: ["10.1.1.1"],
  primary_vendor: "CISCO",
  total_vpr: 100,
  severity_breakdown: { Medium: { count: 2, vpr: 100 } },
  kev_count: 0,
  open_tickets: 0
};
window.locationDetailsModal.showLocationDetails(ciscoLocation, null);
// Expected: Blue "CISCO" badge

// Test Palo Alto (orange badge)
const paloLocation = {
  location: "palo_test",
  location_display: "PALO TEST",
  device_count: 3,
  device_ips: ["10.1.1.2"],
  primary_vendor: "Palo Alto",
  total_vpr: 200,
  severity_breakdown: { High: { count: 3, vpr: 200 } },
  kev_count: 1,
  open_tickets: 0
};
window.locationDetailsModal.showLocationDetails(paloLocation, null);
// Expected: Orange "Palo Alto" badge

// Test Other (gray badge)
const otherLocation = {
  location: "other_test",
  location_display: "OTHER TEST",
  device_count: 2,
  device_ips: ["10.1.1.3"],
  primary_vendor: "Fortinet",
  total_vpr: 50,
  severity_breakdown: { Low: { count: 1, vpr: 50 } },
  kev_count: 0,
  open_tickets: 0
};
window.locationDetailsModal.showLocationDetails(otherLocation, null);
// Expected: Gray "Fortinet" badge
```

### Test 4: Dark Mode Theme Propagation

```javascript
// Test dark mode
document.documentElement.setAttribute("data-bs-theme", "dark");

const testLocation = {
  location: "dark_test",
  location_display: "DARK MODE TEST",
  device_count: 10,
  device_ips: ["10.1.1.1"],
  primary_vendor: "CISCO",
  total_vpr: 300,
  severity_breakdown: { High: { count: 5, vpr: 300 } },
  kev_count: 0,
  open_tickets: 0
};

window.locationDetailsModal.showLocationDetails(testLocation, null);

// Expected: Modal displays with dark theme
// Verify: document.getElementById("locationDetailsModal").getAttribute("data-bs-theme") === "dark"

// Switch to light mode
document.documentElement.setAttribute("data-bs-theme", "light");
window.locationDetailsModal.hide();
window.locationDetailsModal.showLocationDetails(testLocation, null);

// Expected: Modal displays with light theme
// Verify: document.getElementById("locationDetailsModal").getAttribute("data-bs-theme") === "light"
```

### Test 5: Risk Level Badge Logic

```javascript
// Test Critical Risk (criticalCount > 0)
const criticalLocation = {
  location: "critical",
  location_display: "CRITICAL",
  device_count: 1,
  device_ips: ["10.1.1.1"],
  primary_vendor: "CISCO",
  total_vpr: 500,
  severity_breakdown: {
    Critical: { count: 1, vpr: 500 }
  },
  kev_count: 0,
  open_tickets: 0
};
window.locationDetailsModal.showLocationDetails(criticalLocation, null);
// Expected: Red "Critical Risk" badge

// Test High Risk (highCount > 5)
const highLocation = {
  location: "high",
  location_display: "HIGH",
  device_count: 6,
  device_ips: ["10.1.1.1"],
  primary_vendor: "CISCO",
  total_vpr: 400,
  severity_breakdown: {
    High: { count: 6, vpr: 400 }
  },
  kev_count: 0,
  open_tickets: 0
};
window.locationDetailsModal.showLocationDetails(highLocation, null);
// Expected: Orange "High Risk" badge

// Test Medium Risk (mediumCount > 10)
const mediumLocation = {
  location: "medium",
  location_display: "MEDIUM",
  device_count: 11,
  device_ips: ["10.1.1.1"],
  primary_vendor: "CISCO",
  total_vpr: 300,
  severity_breakdown: {
    Medium: { count: 11, vpr: 300 }
  },
  kev_count: 0,
  open_tickets: 0
};
window.locationDetailsModal.showLocationDetails(mediumLocation, null);
// Expected: Yellow "Medium Risk" badge

// Test Low Risk
const lowLocation = {
  location: "low",
  location_display: "LOW",
  device_count: 1,
  device_ips: ["10.1.1.1"],
  primary_vendor: "CISCO",
  total_vpr: 50,
  severity_breakdown: {
    Low: { count: 1, vpr: 50 }
  },
  kev_count: 0,
  open_tickets: 0
};
window.locationDetailsModal.showLocationDetails(lowLocation, null);
// Expected: Green "Low Risk" badge
```

### Test 6: Tooltip Functionality

```javascript
const testLocation = {
  location: "tooltip_test",
  location_display: "TOOLTIP TEST",
  device_count: 1,
  device_ips: ["10.1.1.1"],
  primary_vendor: "CISCO",
  total_vpr: 100,
  severity_breakdown: { Medium: { count: 1, vpr: 100 } },
  kev_count: 0,
  open_tickets: 0
};

window.locationDetailsModal.showLocationDetails(testLocation, null);

// Hover over Address info icon
// Expected: Tooltip appears with text "Address data will be integrated from NetBox and ticket history"

// Hover over Contacts info icon
// Expected: Tooltip appears with text "Contact data will be integrated from ticket history and NetBox"
```

---

## Success Criteria Verification

### ✅ Completed

1. **Modal HTML added to vulnerabilities.html**
   - Lines 638-709
   - Bootstrap modal-xl structure
   - Left info card + right placeholder sections

2. **location-details-modal.js created**
   - 397 lines
   - Full JSDoc documentation
   - 8 methods implemented
   - Pattern sources documented

3. **Modal opens from console command**
   - Test 1 verified
   - Bootstrap modal initialization working

4. **Left info card displays all 10 fields**
   - Location (uppercase)
   - Device Count (badge)
   - Primary Vendor (colored badge)
   - Total VPR (severity-colored badge)
   - Risk Level (badge)
   - KEV Devices (red badge or 0)
   - Open Tickets (number)
   - Network (calculated subnet)
   - Address (stub with tooltip)
   - Contacts (stub with tooltip)

5. **Network subnet calculated using existing pattern**
   - Pattern source: location-cards.js:473-533
   - Exact reuse implementation
   - Production network preference working

6. **Dark mode theme propagates correctly**
   - Test 4 verified
   - data-bs-theme attribute propagated

7. **Tooltips work for Address/Contacts**
   - Test 6 verified
   - Bootstrap tooltips initialized

8. **Vendor badges use correct colors**
   - Test 3 verified
   - CISCO: blue (bg-primary)
   - Palo Alto: orange (bg-warning)
   - Other: gray (bg-secondary)

---

## Next Session Preview (Session 2)

### Remaining Tasks

1. **VPR Risk Breakdown Cards** (right top section)
   - 4 mini cards: Critical, High, Medium, Low
   - Pattern: device-security-modal.js VPR summary cards
   - Display: count + total VPR per severity

2. **Devices Grid** (right bottom section)
   - AG-Grid with device list for location
   - Columns: Hostname, IP, Vendor, Total VPR, KEV badge
   - Clickable rows → open Device Security Modal
   - Pattern: vulnerability-grid.js grid configuration

3. **Integration with Location Cards**
   - Add "View Site Details" button click handler
   - Pass locationService data to modal
   - Test from Location Cards view

---

## Testing Performed

**Date**: 2025-10-18
**Environment**: Development (https://dev.hextrackr.com)

### Manual Testing

- ✅ Modal HTML renders correctly
- ✅ JavaScript loads without errors
- ✅ ESLint passes (no errors in location-details-modal.js)
- ✅ All 10 info fields display with proper formatting
- ✅ Network subnet calculation works
- ✅ Vendor badge colors correct
- ✅ Theme propagation works (light + dark)
- ✅ Tooltips initialize and display
- ✅ Modal cleanup on close

### Edge Cases Tested

- ✅ Missing/null location data → graceful fallbacks
- ✅ Empty device_ips array → "N/A" network
- ✅ Zero KEV count → "0" in gray text
- ✅ Multiple vendor types → correct badge colors

---

## Notes for Session 2

1. **VPR Cards**: Use device-security-modal.js:189-342 as pattern (populateVprSummary method)
2. **Devices Grid**: Use vulnerability-grid.js as pattern, filter by location
3. **Grid Data**: Already in dataManager.currentData - just filter by location
4. **Grid Height**: Use fixed height with auto-resize (pattern from device modal)
5. **Row Click**: Open Device Security Modal (already exists globally)

