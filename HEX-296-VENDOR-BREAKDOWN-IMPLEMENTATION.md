# HEX-296: Location Details Modal - Vendor Breakdown Implementation

**Date:** 2025-10-19
**Session:** 4
**Status:** In Progress

## Overview

Simplifying Location Details Modal by replacing ticket breakdown with vendor breakdown + multi-select filtering.

**Original Problem:** Ticket breakdown was too complex and didn't align with modal's purpose (vulnerability tracking, not ticket management).

**New Approach:** Vendor-focused breakdown with clickable filters + 2x2 severity grid in sidebar.

---

## ✅ Completed Tasks

### 1. Backend Reverted (HEX-296 Cleanup)
- ✅ `app/services/ticketService.js` - Removed `includeCompleted` parameter and completed ticket queries
- ✅ `app/controllers/ticketController.js` - Removed query parameter handling
- ✅ Backwards compatibility restored - no breaking changes

### 2. Frontend Cleanup
- ✅ `location-details-modal.js` - Removed `includeCompleted=true` from API call
- ✅ Removed `completedCount` and `completedTickets` enrichment
- ✅ Removed "Completed Tickets" field from Location Information card
- ✅ Removed completed tickets calculation in `showModal()`

---

## 🚧 Remaining Tasks

### Task 1: Replace `populateTicketStatusCards()` with `populateVendorBreakdownCards()`

**File:** `app/public/scripts/shared/location-details-modal.js`
**Lines:** 288-400

**Replace entire method:**

```javascript
/**
 * Populate vendor breakdown cards with multi-select filtering
 * Creates 4 cards showing device counts by vendor (Cisco, Palo Alto, Other, KEV)
 *
 * Pattern source: location-cards.js (vendor breakdown display)
 *
 * @param {Array} deviceData - Array of device objects with vendor and hasKev properties
 */
populateVendorBreakdownCards(deviceData) {
    try {
        // Calculate vendor counts from device data
        const ciscoCount = deviceData.filter(d => {
            const vendor = d.vendor || "";
            return vendor === "Cisco";
        }).length;

        const paloCount = deviceData.filter(d => {
            const vendor = d.vendor || "";
            return vendor === "Palo Alto";
        }).length;

        const otherCount = deviceData.filter(d => {
            const vendor = d.vendor || "";
            return vendor !== "Cisco" && vendor !== "Palo Alto";
        }).length;

        const kevCount = deviceData.filter(d => d.hasKev === true).length;

        // Build HTML for 4 vendor breakdown cards (clickable filters)
        document.getElementById("vprSummaryCards").innerHTML = `
            <div class="col-md-3">
                <div class="card vendor-filter-card" data-filter="cisco" onclick="window.locationDetailsModal.toggleFilter('cisco')" style="cursor: pointer;">
                    <div class="card-body text-center">
                        <div class="mb-2">
                            <i class="fas fa-network-wired fa-2x text-primary"></i>
                        </div>
                        <div class="text-muted small text-uppercase">CISCO</div>
                        <div class="h3 mb-0">${ciscoCount}</div>
                    </div>
                </div>
            </div>
            <div class="col-md-3">
                <div class="card vendor-filter-card" data-filter="palo" onclick="window.locationDetailsModal.toggleFilter('palo')" style="cursor: pointer;">
                    <div class="card-body text-center">
                        <div class="mb-2">
                            <i class="fas fa-fire fa-2x text-orange"></i>
                        </div>
                        <div class="text-muted small text-uppercase">PALO ALTO</div>
                        <div class="h3 mb-0">${paloCount}</div>
                    </div>
                </div>
            </div>
            <div class="col-md-3">
                <div class="card vendor-filter-card" data-filter="other" onclick="window.locationDetailsModal.toggleFilter('other')" style="cursor: pointer;">
                    <div class="card-body text-center">
                        <div class="mb-2">
                            <i class="fas fa-server fa-2x text-secondary"></i>
                        </div>
                        <div class="text-muted small text-uppercase">OTHER</div>
                        <div class="h3 mb-0">${otherCount}</div>
                    </div>
                </div>
            </div>
            <div class="col-md-3">
                <div class="card vendor-filter-card" data-filter="kev" onclick="window.locationDetailsModal.toggleFilter('kev')" style="cursor: pointer;">
                    <div class="card-body text-center">
                        <div class="mb-2">
                            <i class="fas fa-shield-alt fa-2x text-danger"></i>
                        </div>
                        <div class="text-muted small text-uppercase">KEV</div>
                        <div class="h3 mb-0 text-danger">${kevCount}</div>
                    </div>
                </div>
            </div>
        `;
    } catch (error) {
        console.error("[LocationDetailsModal] Error populating vendor breakdown cards:", error);
    }
}
```

**Also Update Call Site:**
Line ~1026: Change `this.populateTicketStatusCards(deviceData);` to `this.populateVendorBreakdownCards(deviceData);`

---

### Task 2: Add Filter State to Constructor

**File:** `app/public/scripts/shared/location-details-modal.js`
**Location:** In `constructor()` method (around line 20)

**Add after existing initialization:**

```javascript
constructor() {
    this.gridApi = null;
    this.modal = null;
    this.currentLocation = null;
    this.dataManager = null;
    this.activeFilter = null;

    // Multi-select filter state
    this.activeFilters = {
        cisco: false,
        palo: false,
        other: false,
        kev: false
    };
    this.allDevices = []; // Store unfiltered device data for filtering
}
```

---

### Task 3: Add Filter Toggle and Apply Methods

**File:** `app/public/scripts/shared/location-details-modal.js`
**Location:** Add after `populateVendorBreakdownCards()` method

```javascript
/**
 * Toggle vendor/KEV filter on card click
 * Implements multi-select with visual feedback
 * @param {string} filterName - Filter to toggle (cisco|palo|other|kev)
 */
toggleFilter(filterName) {
    // Toggle filter state
    this.activeFilters[filterName] = !this.activeFilters[filterName];

    // Update card visual state
    const card = document.querySelector(`[data-filter="${filterName}"]`);
    if (card) {
        if (this.activeFilters[filterName]) {
            card.style.border = "2px solid #0d6efd";
            card.style.backgroundColor = "rgba(13, 110, 253, 0.05)";
        } else {
            card.style.border = "";
            card.style.backgroundColor = "";
        }
    }

    // Apply filters to grid
    this.applyFilters();
}

/**
 * Apply active filters to grid
 * Vendor filters use OR logic, KEV filter uses AND logic
 */
applyFilters() {
    let filtered = this.allDevices;

    // Step 1: Apply vendor filters (OR logic)
    const vendorActive = this.activeFilters.cisco ||
                         this.activeFilters.palo ||
                         this.activeFilters.other;

    if (vendorActive) {
        filtered = filtered.filter(device => {
            const vendor = device.vendor || "";
            const isCisco = vendor === "Cisco";
            const isPalo = vendor === "Palo Alto";
            const isOther = !isCisco && !isPalo;

            return (this.activeFilters.cisco && isCisco) ||
                   (this.activeFilters.palo && isPalo) ||
                   (this.activeFilters.other && isOther);
        });
    }

    // Step 2: Apply KEV filter (AND logic on top of vendor filter)
    if (this.activeFilters.kev) {
        filtered = filtered.filter(device => device.hasKev === true);
    }

    // Update grid
    if (this.gridApi) {
        this.gridApi.setGridOption("rowData", filtered);
    }

    // Update filter count display
    this.updateFilterCountDisplay(filtered.length, this.allDevices.length);
}

/**
 * Update filter count display above grid
 * @param {number} filteredCount - Number of filtered devices
 * @param {number} totalCount - Total devices
 */
updateFilterCountDisplay(filteredCount, totalCount) {
    const activeFilterNames = Object.keys(this.activeFilters)
        .filter(key => this.activeFilters[key])
        .map(key => key.toUpperCase());

    let message = `Showing ${filteredCount} of ${totalCount} devices`;
    if (activeFilterNames.length > 0) {
        message += ` (Filters: ${activeFilterNames.join(", ")})`;
    }

    // Find or create filter count element
    let filterCountEl = document.getElementById("filterCountDisplay");
    if (!filterCountEl) {
        // Create and insert before grid
        const gridContainer = document.querySelector(".ag-theme-quartz");
        if (gridContainer) {
            filterCountEl = document.createElement("div");
            filterCountEl.id = "filterCountDisplay";
            filterCountEl.className = "text-muted mb-2";
            gridContainer.parentNode.insertBefore(filterCountEl, gridContainer);
        }
    }

    if (filterCountEl) {
        filterCountEl.textContent = message;
    }
}
```

---

### Task 4: Store Unfiltered Devices

**File:** `app/public/scripts/shared/location-details-modal.js`
**Location:** In `showModal()` method, after `aggregateDeviceData()` call (around line 1023)

**Add:**

```javascript
// Aggregate device data first (needed for vendor breakdown cards)
const deviceData = await this.aggregateDeviceData(this.currentLocation);

// Store unfiltered devices for filtering
this.allDevices = deviceData;

// Populate vendor breakdown cards
this.populateVendorBreakdownCards(deviceData);
```

---

### Task 5: Add 2x2 Severity Grid to Location Information Card

**File:** `app/public/scripts/shared/location-details-modal.js`
**Location:** In `populateLocationInfo()` method, after "Address" field (around line 180)

**Add before closing:**

```javascript
                <div class="mb-3">
                    <div class="text-muted mb-2">Severity Breakdown:</div>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
                        <div style="padding: 8px; border: 1px solid rgba(255,255,255,0.1); border-radius: 4px; text-align: center;">
                            <div style="font-size: 0.75rem; text-transform: uppercase; opacity: 0.7; margin-bottom: 4px;">CRITICAL</div>
                            <div style="font-size: 1.5rem; font-weight: bold; color: var(--bs-danger);">${criticalCount}</div>
                            <div style="font-size: 0.75rem; opacity: 0.7; margin-top: 2px;">${criticalVpr.toFixed(1)} VPR</div>
                        </div>
                        <div style="padding: 8px; border: 1px solid rgba(255,255,255,0.1); border-radius: 4px; text-align: center;">
                            <div style="font-size: 0.75rem; text-transform: uppercase; opacity: 0.7; margin-bottom: 4px;">HIGH</div>
                            <div style="font-size: 1.5rem; font-weight: bold; color: var(--bs-orange);">${highCount}</div>
                            <div style="font-size: 0.75rem; opacity: 0.7; margin-top: 2px;">${highVpr.toFixed(1)} VPR</div>
                        </div>
                        <div style="padding: 8px; border: 1px solid rgba(255,255,255,0.1); border-radius: 4px; text-align: center;">
                            <div style="font-size: 0.75rem; text-transform: uppercase; opacity: 0.7; margin-bottom: 4px;">MEDIUM</div>
                            <div style="font-size: 1.5rem; font-weight: bold; color: var(--bs-warning);">${mediumCount}</div>
                            <div style="font-size: 0.75rem; opacity: 0.7; margin-top: 2px;">${mediumVpr.toFixed(1)} VPR</div>
                        </div>
                        <div style="padding: 8px; border: 1px solid rgba(255,255,255,0.1); border-radius: 4px; text-align: center;">
                            <div style="font-size: 0.75rem; text-transform: uppercase; opacity: 0.7; margin-bottom: 4px;">LOW</div>
                            <div style="font-size: 1.5rem; font-weight: bold; color: var(--bs-success);">${lowCount}</div>
                            <div style="font-size: 0.75rem; opacity: 0.7; margin-top: 2px;">${lowVpr.toFixed(1)} VPR</div>
                        </div>
                    </div>
                </div>
```

**Also add data extraction at top of method (around line 70):**

```javascript
// Extract severity breakdown data
const severityBreakdown = location.severity_breakdown || {};
const criticalCount = severityBreakdown.Critical?.count || 0;
const criticalVpr = severityBreakdown.Critical?.vpr || 0;
const highCount = severityBreakdown.High?.count || 0;
const highVpr = severityBreakdown.High?.vpr || 0;
const mediumCount = severityBreakdown.Medium?.count || 0;
const mediumVpr = severityBreakdown.Medium?.vpr || 0;
const lowCount = severityBreakdown.Low?.count || 0;
const lowVpr = severityBreakdown.Low?.vpr || 0;
```

---

### Task 6: Add Modal Footer Buttons

**File:** `app/public/vulnerabilities.html`
**Location:** Find the Location Details Modal, add footer before `</div>` closing modal

**Search for:** `<div class="modal-content"` within `id="locationDetailsModal"`

**Add before closing `</div>` of modal-content:**

```html
                <div class="modal-footer">
                    <button type="button" class="btn btn-outline-info me-auto" id="exportLocationCsvBtn">
                        <i class="fas fa-download me-1"></i> Export CSV
                    </button>
                    <button type="button" class="btn btn-outline-success" id="createLocationTicketBtn">
                        <i class="fas fa-ticket-alt me-1"></i> Create Ticket
                    </button>
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                </div>
```

---

### Task 7: Add Footer Button Handlers

**File:** `app/public/scripts/shared/location-details-modal.js`
**Location:** Add methods after filter methods

```javascript
/**
 * Initialize footer button event listeners
 */
initializeFooterButtons() {
    const exportBtn = document.getElementById("exportLocationCsvBtn");
    const createTicketBtn = document.getElementById("createLocationTicketBtn");

    if (exportBtn) {
        exportBtn.addEventListener("click", () => this.exportLocationCsv());
    }

    if (createTicketBtn) {
        createTicketBtn.addEventListener("click", () => this.createLocationTicket());
    }
}

/**
 * Export location grid data to CSV (stub)
 */
exportLocationCsv() {
    console.log("[LocationDetailsModal] Export CSV clicked - feature coming soon");
    if (window.vulnManager && typeof window.vulnManager.showToast === "function") {
        window.vulnManager.showToast("Export CSV feature coming soon", "info");
    }
}

/**
 * Create ticket for all devices at this location
 */
createLocationTicket() {
    const location = this.currentLocation.location?.toUpperCase() || "UNKNOWN";
    const site = location.substring(0, 4);

    // Get all device hostnames at this location
    const deviceList = this.allDevices.map(d => d.hostname.toUpperCase());

    const ticketData = {
        devices: deviceList,
        site: site,
        location: location,
        mode: "bulk-all",
        timestamp: Date.now()
    };

    sessionStorage.setItem("createTicketData", JSON.stringify(ticketData));
    sessionStorage.setItem("autoOpenModal", "true");

    if (window.vulnManager && typeof window.vulnManager.showToast === "function") {
        window.vulnManager.showToast(`Creating ticket for ${deviceList.length} devices at ${location}...`, "info");
    }

    setTimeout(() => {
        window.location.href = "/tickets.html";
    }, 300);
}
```

**Call in `showModal()` after modal initialization (around line 1033):**

```javascript
// Initialize Bootstrap modal
this.modal = new bootstrap.Modal(modalElement);

// Initialize footer buttons
this.initializeFooterButtons();
```

---

### Task 8: Update Section Header

**File:** `app/public/vulnerabilities.html`
**Location:** Search for "Ticket Breakdown" header

**Change from:**
```html
<h3 class="card-title">
    <i class="fas fa-ticket-alt me-2"></i>
    Ticket Breakdown
</h3>
```

**To:**
```html
<h3 class="card-title">
    <i class="fas fa-sitemap me-2"></i>
    Location Breakdown
</h3>
```

---

## Testing Checklist

### Test 1: Vendor Breakdown Display
- [ ] Open HOUSTN location modal
- [ ] Verify 4 cards show: Cisco (73), Palo (2), Other (0), KEV (72)
- [ ] Icons match: network-wired (blue), fire (orange), server (gray), shield-alt (red)
- [ ] Hover shows cursor pointer

### Test 2: Multi-Select Filtering
- [ ] Click Cisco card → border turns blue, grid shows only Cisco devices
- [ ] Click Cisco again → filter clears, all devices shown
- [ ] Click Cisco + KEV → shows only Cisco devices that are also KEV
- [ ] Click Palo + Other → shows Palo and Other devices combined
- [ ] Verify "Showing X of Y devices (Filters: ...)" updates correctly

### Test 3: 2x2 Severity Grid
- [ ] Location Information card shows severity grid
- [ ] Grid displays: Critical (3, 22.2 VPR), High (897, 4824.1 VPR), Medium (290, 1548.7 VPR), Low (56, 78.4 VPR)
- [ ] Colors match severity (red, orange, yellow, green)
- [ ] Grid is read-only (not clickable)

### Test 4: Footer Buttons
- [ ] "Export CSV" button shows, click shows "coming soon" toast
- [ ] "Create Ticket" button navigates to tickets.html with all location devices pre-filled
- [ ] "Close" button closes modal

### Test 5: No Regressions
- [ ] Ticket column in grid still works (shows current tickets)
- [ ] Ticket icon clicks open modals (not navigation)
- [ ] Power tool shortcuts in other views unaffected
- [ ] Device modal ticket buttons unchanged

---

## Current Todo List

1. ✅ Revert HEX-296 backend changes
2. ✅ Revert HEX-296 frontend changes
3. ⏳ Replace populateTicketStatusCards with populateVendorBreakdownCards
4. ⏳ Implement multi-select filter logic and state management
5. ⏳ Add 2x2 severity grid to Location Information card
6. ⏳ Add modal footer with action buttons
7. ⏳ Update section header to Location Breakdown
8. ⏳ Test multi-select filtering combinations
9. ⏳ Restart Docker and verify all features
10. ⏳ Commit all changes

---

## File Change Summary

### Modified Files:
1. `app/services/ticketService.js` - ✅ Reverted
2. `app/controllers/ticketController.js` - ✅ Reverted
3. `app/public/scripts/shared/location-details-modal.js` - ⏳ In Progress
4. `app/public/vulnerabilities.html` - ⏳ Pending

### Lines Changed:
- `location-details-modal.js`: ~200 lines (method replacement + new methods)
- `vulnerabilities.html`: ~20 lines (footer + header)

---

## Key Design Decisions

**Multi-Select Logic:**
- Vendor filters (Cisco, Palo, Other) use **OR logic** - selecting multiple shows devices matching ANY selected vendor
- KEV filter uses **AND logic** - filters the already-filtered vendor results to show only KEV devices
- Example: Cisco + Palo + KEV = Show devices that are (Cisco OR Palo) AND KEV

**Visual Feedback:**
- Active filters get blue border + light blue background
- Filter count displays above grid: "Showing 25 of 75 devices (Filters: CISCO, KEV)"
- Cards maintain vendor colors (blue, orange, gray, red)

**Footer Actions:**
- Export CSV: Stubbed (shows toast message)
- Create Ticket: Fully functional (navigates with all devices pre-filled)
- Close: Standard Bootstrap modal dismiss

---

## Next Steps When Resuming

1. Read this file
2. Continue with Task 3 (add filter toggle/apply methods)
3. Test each feature incrementally
4. Restart Docker: `docker-compose -f /Volumes/DATA/GitHub/HexTrackr/docker-compose.yml restart hextrackr`
5. Verify at https://dev.hextrackr.com
6. Commit when all tests pass
