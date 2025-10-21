/**
 * LocationDetailsModal - Manages location details modal display
 * @class
 *
 * HEX-295 Session 1: Core Modal Structure (v1.0.87)
 * HEX-295 Session 2: Grid & Filters (v1.0.88)
 * HEX-295 Session 3: Ticket Integration (v1.0.89)
 * HEX-296 Session 4: UI Polish & Bug Fixes (v1.0.90)
 *
 * Session 4 Fixes (HEX-296):
 * - Removed Primary Vendor field (meaningless for locations)
 * - Added "Devices" and "Total VPR" labels to severity cards
 * - Fixed empty grid with case-insensitive location matching
 * - Removed pagination (enabled scrolling)
 * - Removed Actions column (redundant with hostname link)
 *
 * Pattern source: device-security-modal.js (modal structure and theme propagation)
 * Pattern source: location-cards.js (network subnet calculation)
 */
class LocationDetailsModal {
    /**
     * Initialize the location details modal
     */
    constructor() {
        this.currentLocation = null;
        this.dataManager = null;
        this.modal = null;
        this.gridApi = null;
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

    /**
     * Show location details modal
     * @param {Object} location - Location data from locationService
     * @param {Object} dataManager - VulnerabilityCore dataManager instance
     *
     * Pattern source: device-security-modal.js:57-76 (entry point pattern)
     */
    showLocationDetails(location, dataManager) {
        try {
            // Validate inputs
            if (!location) {
                console.error("[LocationDetailsModal] No location data provided");
                return;
            }

            // Store references
            this.currentLocation = location;
            this.dataManager = dataManager;

            // Populate modal sections
            this.populateLocationInfo(location);

            // Show modal with theme propagation
            this.showModal();

        } catch (error) {
            console.error("[LocationDetailsModal] Error showing location details:", error);
        }
    }

    /**
     * Populate left info card with location data
     * @param {Object} location - Location data
     *
     * Pattern source: device-security-modal.js:77-167 (info card population)
     */
    populateLocationInfo(location) {
        try {
            // Extract location data with fallbacks
            const locationDisplay = location.location_display || location.location?.toUpperCase() || "N/A";
            const deviceCount = location.device_count || 0;
            const totalVPR = location.total_vpr || 0;
            const kevCount = location.kev_count || 0;
            const openTickets = location.open_tickets || 0;

            // VPR severity badge
            const vprSeverityClass = this.getVprSeverityClass(totalVPR);
            const vprBadgeClass = vprSeverityClass === "critical" ? "bg-red" :
                                  vprSeverityClass === "high" ? "bg-orange" :
                                  vprSeverityClass === "medium" ? "bg-yellow" :
                                  "bg-green";

            // Risk level badge and severity breakdown data
            const severityBreakdown = location.severity_breakdown || {};
            const criticalCount = severityBreakdown.Critical?.count || 0;
            const criticalVpr = severityBreakdown.Critical?.vpr || 0;
            const highCount = severityBreakdown.High?.count || 0;
            const highVpr = severityBreakdown.High?.vpr || 0;
            const mediumCount = severityBreakdown.Medium?.count || 0;
            const mediumVpr = severityBreakdown.Medium?.vpr || 0;
            const lowCount = severityBreakdown.Low?.count || 0;
            const lowVpr = severityBreakdown.Low?.vpr || 0;

            let riskBadge = "";
            if (criticalCount > 0) {
                riskBadge = "<span class=\"badge bg-red\">Critical Risk</span>";
            } else if (highCount > 5) {
                riskBadge = "<span class=\"badge bg-orange\">High Risk</span>";
            } else if (mediumCount > 10) {
                riskBadge = "<span class=\"badge bg-yellow\">Medium Risk</span>";
            } else {
                riskBadge = "<span class=\"badge bg-green\">Low Risk</span>";
            }

            // KEV badge
            const kevBadge = kevCount > 0
                ? `<span class="badge bg-red">${kevCount}</span>`
                : "<span class=\"text-muted\">0</span>";

            // Calculate network subnet
            const networkSubnet = this.calculateNetworkSubnet(location.device_ips || []);

            // Build HTML for location info card
            const infoHtml = `
                <div class="mb-3">
                    <div class="row">
                        <div class="col-sm-5 text-muted">Location:</div>
                        <div class="col-sm-7 fw-bold">${locationDisplay}</div>
                    </div>
                </div>
                <div class="mb-3">
                    <div class="row">
                        <div class="col-sm-5 text-muted">Device Count:</div>
                        <div class="col-sm-7">
                            <span class="badge bg-secondary">${deviceCount} devices</span>
                        </div>
                    </div>
                </div>
                <div class="mb-3">
                    <div class="row">
                        <div class="col-sm-5 text-muted">Total VPR:</div>
                        <div class="col-sm-7">
                            <span class="badge ${vprBadgeClass}">${totalVPR.toFixed(1)}</span>
                        </div>
                    </div>
                </div>
                <div class="mb-3">
                    <div class="row">
                        <div class="col-sm-5 text-muted">Risk Level:</div>
                        <div class="col-sm-7">
                            ${riskBadge}
                        </div>
                    </div>
                </div>
                <div class="mb-3">
                    <div class="row">
                        <div class="col-sm-5 text-muted">KEV Devices:</div>
                        <div class="col-sm-7">
                            ${kevBadge}
                        </div>
                    </div>
                </div>
                <div class="mb-3">
                    <div class="row">
                        <div class="col-sm-5 text-muted">Open Tickets:</div>
                        <div class="col-sm-7">
                            <span class="text-primary fw-bold">${openTickets}</span>
                        </div>
                    </div>
                </div>
                <div class="mb-3">
                    <div class="row">
                        <div class="col-sm-5 text-muted">Network:</div>
                        <div class="col-sm-7">
                            <span class="font-monospace text-info">${networkSubnet}</span>
                        </div>
                    </div>
                </div>
                <div class="mb-3">
                    <div class="row">
                        <div class="col-sm-5 text-muted">Address:</div>
                        <div class="col-sm-7">
                            <span class="text-muted">Coming soon
                                <i class="fas fa-info-circle ms-1"
                                   data-bs-toggle="tooltip"
                                   data-bs-placement="top"
                                   title="Address data will be integrated from NetBox and ticket history"></i>
                            </span>
                        </div>
                    </div>
                </div>
                <div class="mb-3">
                    <div class="row">
                        <div class="col-sm-5 text-muted">Contacts:</div>
                        <div class="col-sm-7">
                            <span class="text-muted">Coming soon
                                <i class="fas fa-info-circle ms-1"
                                   data-bs-toggle="tooltip"
                                   data-bs-placement="top"
                                   title="Contact data will be integrated from ticket history and NetBox"></i>
                            </span>
                        </div>
                    </div>
                </div>
                <div class="mb-3">
                    <div class="text-muted mb-2">Severity Breakdown:</div>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
                        <div style="padding: 8px; border: 1px solid rgba(255,255,255,0.1); border-radius: 4px; text-align: center;">
                            <div style="font-size: 0.75rem; text-transform: uppercase; opacity: 0.7; margin-bottom: 4px;">CRITICAL</div>
                            <div style="font-size: 1.5rem; font-weight: bold; color: var(--vpr-critical);">${criticalCount}</div>
                            <div style="font-size: 0.75rem; opacity: 0.7; margin-top: 2px;">${criticalVpr.toFixed(1)} VPR</div>
                        </div>
                        <div style="padding: 8px; border: 1px solid rgba(255,255,255,0.1); border-radius: 4px; text-align: center;">
                            <div style="font-size: 0.75rem; text-transform: uppercase; opacity: 0.7; margin-bottom: 4px;">HIGH</div>
                            <div style="font-size: 1.5rem; font-weight: bold; color: var(--vpr-high);">${highCount}</div>
                            <div style="font-size: 0.75rem; opacity: 0.7; margin-top: 2px;">${highVpr.toFixed(1)} VPR</div>
                        </div>
                        <div style="padding: 8px; border: 1px solid rgba(255,255,255,0.1); border-radius: 4px; text-align: center;">
                            <div style="font-size: 0.75rem; text-transform: uppercase; opacity: 0.7; margin-bottom: 4px;">MEDIUM</div>
                            <div style="font-size: 1.5rem; font-weight: bold; color: var(--vpr-medium);">${mediumCount}</div>
                            <div style="font-size: 0.75rem; opacity: 0.7; margin-top: 2px;">${mediumVpr.toFixed(1)} VPR</div>
                        </div>
                        <div style="padding: 8px; border: 1px solid rgba(255,255,255,0.1); border-radius: 4px; text-align: center;">
                            <div style="font-size: 0.75rem; text-transform: uppercase; opacity: 0.7; margin-bottom: 4px;">LOW</div>
                            <div style="font-size: 1.5rem; font-weight: bold; color: var(--vpr-low);">${lowCount}</div>
                            <div style="font-size: 0.75rem; opacity: 0.7; margin-top: 2px;">${lowVpr.toFixed(1)} VPR</div>
                        </div>
                    </div>
                </div>
            `;

            // Inject HTML into modal
            document.getElementById("locationInfo").innerHTML = infoHtml;

            // Initialize tooltips
            const tooltipTriggerList = [].slice.call(document.querySelectorAll("[data-bs-toggle=\"tooltip\"]"));
            tooltipTriggerList.map(function (tooltipTriggerEl) {
                return new bootstrap.Tooltip(tooltipTriggerEl);
            });

        } catch (error) {
            console.error("[LocationDetailsModal] Error populating location info:", error);
            document.getElementById("locationInfo").innerHTML = "<p class=\"text-danger\">Error loading location information</p>";
        }
    }

    /**
     * Calculate most common /24 network from device IP addresses
     * Prefers production subnets over management (10.95.x.x, 10.96.x.x, 10.97.x.x)
     *
     * Pattern source: location-cards.js:473-533 (EXACT REUSE - network subnet calculation)
     *
     * @param {Array<string>} ipAddresses - Array of IP addresses
     * @returns {string} /24 network string (e.g., "192.168.1.0/24") or "N/A"
     */
    calculateNetworkSubnet(ipAddresses) {
        if (!ipAddresses || ipAddresses.length === 0) {
            return "N/A";
        }

        // Management subnets to deprioritize (out-of-band management networks)
        const managementSubnets = ["10.95", "10.96", "10.97"];

        // Count frequency of production networks (excluding management)
        const productionNetworkCounts = {};
        // Count frequency of management networks (fallback)
        const managementNetworkCounts = {};

        ipAddresses.forEach(ip => {
            if (!ip) {return;}

            // Extract first 3 octets
            const parts = ip.split(".");
            if (parts.length >= 3) {
                const network = `${parts[0]}.${parts[1]}.${parts[2]}.0/24`;

                // Check if this IP is in a management subnet
                const isManagementIP = managementSubnets.some(subnet => ip.startsWith(subnet + "."));

                if (isManagementIP) {
                    managementNetworkCounts[network] = (managementNetworkCounts[network] || 0) + 1;
                } else {
                    productionNetworkCounts[network] = (productionNetworkCounts[network] || 0) + 1;
                }
            }
        });

        // Find most common production network first
        let mostCommon = "N/A";
        let maxCount = 0;

        for (const [network, count] of Object.entries(productionNetworkCounts)) {
            if (count > maxCount) {
                maxCount = count;
                mostCommon = network;
            }
        }

        // If no production networks found, fall back to management networks
        if (mostCommon === "N/A") {
            for (const [network, count] of Object.entries(managementNetworkCounts)) {
                if (count > maxCount) {
                    maxCount = count;
                    mostCommon = network;
                }
            }
        }

        return mostCommon;
    }

    /**
     * Get VPR severity class based on score
     *
     * Pattern source: device-security-modal.js:744-751 (VPR severity classification)
     *
     * @param {number} score - VPR score
     * @returns {string} Severity class name ("critical", "high", "medium", "low")
     */
    getVprSeverityClass(score) {
        if (score >= 9.0) {return "critical";}
        if (score >= 7.0) {return "high";}
        if (score >= 4.0) {return "medium";}
        return "low";
    }

    /**
     * Populate vendor breakdown cards with multi-select filtering
     * Creates 4 cards showing device counts by vendor (Cisco, Palo Alto, Other, KEV)
     *
     * Pattern source: location-cards.js:337-340 (vendor breakdown from API)
     */
    populateVendorBreakdownCards() {
        try {
            // Use pre-aggregated vendor breakdown from location object (matches location-cards.js)
            const vendorBreakdown = this.currentLocation.vendor_breakdown || {};
            const ciscoCount = vendorBreakdown["CISCO"] || 0;
            const paloCount = vendorBreakdown["Palo Alto"] || 0;
            const otherCount = vendorBreakdown["Other"] || 0;

            // KEV count - count devices in allDevices with hasKev
            const kevCount = this.allDevices.filter(d => d.hasKev === true).length;

            // Build HTML for 4 vendor breakdown cards (clickable filters)
            document.getElementById("vprSummaryCards").innerHTML = `
                <div class="col-md-3">
                    <div class="card vendor-filter-card" data-filter="cisco" onclick="window.locationDetailsModal.toggleFilter('cisco')">
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
                    <div class="card vendor-filter-card" data-filter="palo" onclick="window.locationDetailsModal.toggleFilter('palo')">
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
                    <div class="card vendor-filter-card" data-filter="other" onclick="window.locationDetailsModal.toggleFilter('other')">
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
                    <div class="card vendor-filter-card" data-filter="kev" onclick="window.locationDetailsModal.toggleFilter('kev')">
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

    /**
     * Toggle vendor/KEV filter on card click
     * Uses CSS classes from cards.css for visual feedback (no inline styles)
     * Pattern source: Centralized theme engine approach (cards.css:475-522)
     * @param {string} filterName - Filter to toggle (cisco|palo|other|kev)
     */
    toggleFilter(filterName) {
        // Toggle filter state
        this.activeFilters[filterName] = !this.activeFilters[filterName];

        // Update card visual state using CSS classes
        const card = document.querySelector(`[data-filter="${filterName}"]`);
        if (card) {
            const activeClass = `active-${filterName}`;

            if (this.activeFilters[filterName]) {
                // Add vendor-specific active class (e.g., "active-cisco")
                card.classList.add(activeClass);
            } else {
                // Remove active class
                card.classList.remove(activeClass);
            }
        }

        // Apply filters to grid
        this.applyFilters();
    }

    /**
     * Apply active filters using AG-Grid's external filter API
     * External filters are registered in gridOptions (isExternalFilterPresent, doesExternalFilterPass)
     * Vendor filters use OR logic, KEV filter uses AND logic
     */
    applyFilters() {
        if (!this.gridApi) {
            return;
        }

        // Trigger AG-Grid to re-run external filter on all rows
        this.gridApi.onFilterChanged();

        // Count filtered rows for display
        let filteredCount = 0;
        this.gridApi.forEachNodeAfterFilter(_node => {
            filteredCount++;
        });

        this.updateFilterCountDisplay(filteredCount, this.allDevices.length);
    }

    /**
     * Check if external filter is present (required by AG-Grid)
     * @returns {boolean} True if any filter is active
     */
    isExternalFilterPresent() {
        return this.activeFilters.cisco ||
               this.activeFilters.palo ||
               this.activeFilters.other ||
               this.activeFilters.kev;
    }

    /**
     * External filter logic (called by AG-Grid for each row)
     * @param {Object} node - AG-Grid row node
     * @returns {boolean} True if row should be shown
     */
    doesExternalFilterPass(node) {
        const device = node.data;

        // Step 1: Check vendor filters (OR logic)
        const vendorActive = this.activeFilters.cisco ||
                             this.activeFilters.palo ||
                             this.activeFilters.other;

        if (vendorActive) {
            const vendor = device.vendor || "";
            const vendorUpper = vendor.toUpperCase();
            const isCisco = vendorUpper === "CISCO";
            const isPalo = vendor === "Palo Alto" || vendorUpper.includes("PALO");
            const isOther = !isCisco && !isPalo;

            const vendorMatches = (this.activeFilters.cisco && isCisco) ||
                                 (this.activeFilters.palo && isPalo) ||
                                 (this.activeFilters.other && isOther);

            if (!vendorMatches) {
                return false; // Vendor doesn't match, filter out
            }
        }

        // Step 2: Check KEV filter (AND logic on top of vendor filter)
        if (this.activeFilters.kev) {
            if (device.hasKev !== true) {
                return false; // Not a KEV device, filter out
            }
        }

        return true; // Row passes all filters
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

    /**
     * Create and configure the location devices grid with 7 columns
     * Aggregates device data from vulnerabilities and displays in AG-Grid
     * Session 3: Now async to support ticket count integration
     *
     * Pattern source: device-security-modal.js:420-731 (AG-Grid setup and theming)
     *
     * @param {Object} location - Location data with device_ips and vulnerabilities
     */
    async createLocationDevicesGrid(location) {
        try {
            // Get container and clear existing content
            const gridContainer = document.getElementById("locationDevicesGridContainer");
            if (!gridContainer) {
                console.error("[LocationDetailsModal] Grid container not found");
                return;
            }
            gridContainer.innerHTML = "";

            // Destroy existing grid if present
            if (this.gridApi) {
                this.gridApi.destroy();
                this.gridApi = null;
            }

            // Aggregate device data from vulnerabilities (now async with ticket counts)
            const deviceData = await this.aggregateDeviceData(location);
            this.allDevices = deviceData; // Store for filtering

            // Define column structure (matches Device Security Modal patterns)
            const columnDefs = [
                {
                    headerName: "Hostname",
                    field: "hostname",
                    width: 180,
                    cellRenderer: (params) => {
                        const hostname = params.value;
                        const vendor = params.data.vendor || "Other";

                        // Vendor-based colors: Blue for Cisco, Orange for Palo Alto, Gray for Other
                        let linkColor = "#6c757d"; // Gray for Other (Bootstrap secondary)
                        if (vendor.toLowerCase().includes("cisco")) {
                            linkColor = "#1A73E8"; // Blue for Cisco
                        } else if (vendor.toLowerCase().includes("palo")) {
                            linkColor = "#FF6B35"; // Orange for Palo Alto
                        }

                        const fontWeight = "700";

                        return `<a href="#" style="color: ${linkColor} !important; font-weight: ${fontWeight} !important; text-decoration: none;"
                                   onclick="window.locationDetailsModal.navigateToDevice('${hostname}'); return false;">
                                   ${hostname}
                                </a>`;
                    }
                },
                {
                    headerName: "CVE",
                    field: "vulnerabilityCount",
                    width: 100,
                    cellRenderer: (params) => {
                        const count = params.value || 0;
                        const hasKev = params.data.hasKev;
                        // Red for KEV devices, Orange for non-KEV devices
                        // Must use !important to override AG-Grid's default cell styling
                        const color = hasKev ? "#dc3545" : "#f76707";
                        return `<span class="fw-bold" style="color: ${color} !important;">${count}</span>`;
                    }
                },
                {
                    headerName: "VPR",
                    field: "totalVpr",
                    width: 100,
                    cellRenderer: (params) => {
                        const vpr = params.value || 0;
                        const hasKev = params.data.hasKev;
                        // KEV-based colors for consistency with CVE column
                        // Red for KEV devices, Orange for non-KEV devices
                        const color = hasKev ? "#dc3545" : "#f76707";
                        return `<span style="color: ${color} !important; font-weight: 700;">${vpr.toFixed(1)}</span>`;
                    }
                },
                {
                    headerName: "Installed",
                    field: "installedVersion",
                    width: 130,
                    cellRenderer: (params) => {
                        const os = params.value;
                        if (!os || os === "N/A") {
                            return "<span class=\"font-monospace text-muted\">N/A</span>";
                        }

                        // Extract version number from OS string (matches main table pattern)
                        // Remove prefixes like "Cisco IOS", "IOS XE", "PAN-OS", etc.
                        let displayVersion = os;
                        const versionMatch = os.match(/(\d+\.\d+(?:\.\d+)?(?:\(\d+\))?[A-Z]*)/);
                        if (versionMatch) {
                            displayVersion = versionMatch[1];
                        }

                        return `<span class=\"font-monospace text-info\">${displayVersion}</span>`;
                    }
                },
                {
                    headerName: "Fixed",
                    field: "fixedVersion",
                    width: 150,
                    cellRenderer: (params) => {
                        const cellId = `fixed-version-cell-${params.node.id}`;

                        // Return placeholder with unique ID for async update
                        setTimeout(async () => {
                            const cell = document.getElementById(cellId);
                            if (!cell) {return;}

                            const device = params.data;
                            if (!device.vulnerabilities || device.vulnerabilities.length === 0) {
                                cell.innerHTML = "<span class=\"font-monospace text-muted\">N/A</span>";
                                return;
                            }

                            // Get vendor from first vulnerability (all should be same vendor per device)
                            const vendor = device.vulnerabilities[0].vendor;

                            // Determine which advisory helper to use
                            let advisoryHelper = null;
                            if (vendor?.toLowerCase().includes("cisco")) {
                                advisoryHelper = window.ciscoAdvisoryHelper;
                            } else if (vendor?.toLowerCase().includes("palo")) {
                                advisoryHelper = window.paloAdvisoryHelper;
                            }

                            // Unsupported vendor or helper not loaded
                            if (!advisoryHelper) {
                                cell.innerHTML = "<span class=\"font-monospace text-muted\">N/A</span>";
                                params.node.setDataValue("fixedVersion", "N/A");
                                return;
                            }

                            try {
                                // Get ALL unique CVEs (not just first) - matches Device Security Modal pattern
                                const uniqueCves = [...new Set(device.vulnerabilities
                                    .filter(v => v.cve && v.cve.startsWith("CVE-"))
                                    .map(v => v.cve))];

                                if (uniqueCves.length === 0) {
                                    cell.innerHTML = "<span class=\"font-monospace text-muted\">No CVEs</span>";
                                    params.node.setDataValue("fixedVersion", "No CVEs");
                                    return;
                                }

                                const installedVersion = device.installedVersion;

                                // Query ALL CVEs in parallel (matches device-security-modal.js:204-214)
                                const fixedVersionPromises = uniqueCves.map(cve =>
                                    advisoryHelper.getFixedVersion(cve, vendor, installedVersion)
                                        .catch(err => {
                                            console.warn(`[LocationDetailsModal] Failed to get fixed version for ${cve}:`, err);
                                            return null;
                                        })
                                );

                                const fixedVersions = await Promise.all(fixedVersionPromises);

                                // Filter out nulls and deduplicate
                                const validVersions = [...new Set(fixedVersions.filter(v => v !== null && v !== "No Fix"))];

                                if (validVersions.length > 0) {
                                    // Sort versions (highest/most recent first) using advisory helper's compareVersions
                                    validVersions.sort((a, b) => advisoryHelper.compareVersions(a, b));

                                    // Display highest version (first after sort)
                                    const highestVersion = validVersions[0];
                                    cell.innerHTML = `<span class=\"font-monospace text-success\">${DOMPurify.sanitize(highestVersion)}</span>`;
                                    params.node.setDataValue("fixedVersion", highestVersion);
                                } else {
                                    cell.innerHTML = "<span class=\"font-monospace text-muted\">No Fix</span>";
                                    params.node.setDataValue("fixedVersion", "No Fix");
                                }
                            } catch (error) {
                                console.error("[LocationDetailsModal] Fixed version lookup failed:", error);
                                cell.innerHTML = "<span class=\"font-monospace text-muted\">Error</span>";
                                params.node.setDataValue("fixedVersion", "Error");
                            }
                        }, 0);

                        return `<span id=\"${cellId}\" class=\"font-monospace text-muted\">Loading...</span>`;
                    }
                },
                {
                    headerName: "",  // Empty header - will show icon via CSS
                    headerClass: "ticket-header-icon",  // Custom class for icon styling
                    field: "ticketStatus",
                    width: 80,
                    sortable: true,
                    filter: false,
                    cellStyle: { textAlign: "center" },
                    cellRenderer: (params) => {
                        const ticketCount = params.data.ticketCount || 0;
                        const ticketStatus = params.data.ticketStatus;
                        const hostname = params.data.hostname;
                        const isKev = params.data.hasKev;
                        const allTickets = params.data.tickets || [];

                        // No open tickets - check for closed tickets in history
                        if (ticketCount === 0) {
                            const closedTickets = allTickets.filter(t => ["Completed", "Closed"].includes(t.status));
                            const closedCount = closedTickets.length;

                            let tooltipText = `Create ticket for ${hostname}`;
                            if (closedCount > 0) {
                                tooltipText = `${closedCount} closed ticket${closedCount > 1 ? "s" : ""} - click to create new`;
                            }

                            return `<a href="#" class="text-muted"
                                       onclick="window.locationDetailsModal.createTicket('${hostname}', ${isKev}); return false;"
                                       title="${tooltipText}">
                                       <i class="fas fa-ticket-alt" style="opacity: 0.6;"></i>
                                    </a>`;
                        }

                        // Has open tickets - show colored icon based on status
                        let colorClass = "text-secondary";  // Gray for unknown
                        if (ticketStatus === "Overdue") {
                            colorClass = "text-danger";     // Red
                        } else if (ticketStatus === "Pending") {
                            colorClass = "text-warning";    // Yellow
                        } else if (ticketStatus === "Open") {
                            colorClass = "text-primary";    // Blue
                        } else if (ticketStatus === "Completed" || ticketStatus === "Closed") {
                            colorClass = "text-success";    // Green
                        }

                        const tooltipText = `${ticketStatus} - ${ticketCount} ticket${ticketCount > 1 ? "s" : ""} - click to view/edit`;

                        return `<a href="#" class="${colorClass}"
                                   onclick="window.locationDetailsModal.viewTickets('${hostname}'); return false;"
                                   title="${tooltipText}">
                                   <i class="fas fa-ticket-alt"></i>
                                </a>`;
                    }
                }
            ];

            // Detect current theme for AG-Grid theming
            const currentTheme = this.detectCurrentTheme();
            const isDarkMode = currentTheme === "dark";

            // Create theme configuration (matches device-security-modal.js pattern)
            let quartzTheme = null;
            if (window.agGrid && window.agGrid.themeQuartz) {
                if (isDarkMode) {
                    quartzTheme = window.agGrid.themeQuartz.withParams({
                        backgroundColor: "#0F1C31",
                        foregroundColor: "#FFF",
                        browserColorScheme: "dark",
                        chromeBackgroundColor: "#202c3f",
                        headerBackgroundColor: "#202c3f",
                        headerTextColor: "#FFF",
                        fontSize: 13,
                        headerFontSize: 13,
                        oddRowBackgroundColor: "rgba(255, 255, 255, 0.02)",
                        rowBorder: false,
                        headerRowBorder: false,
                        columnBorder: false,
                        borderColor: "#2a3f5f",
                        selectedRowBackgroundColor: "#2563eb",
                        rowHoverColor: "rgba(37, 99, 235, 0.15)",
                        rangeSelectionBackgroundColor: "rgba(37, 99, 235, 0.2)"
                    });
                } else {
                    quartzTheme = window.agGrid.themeQuartz.withParams({
                        backgroundColor: "#ffffff",
                        foregroundColor: "#2d3748",
                        chromeBackgroundColor: "#f7fafc",
                        headerBackgroundColor: "#edf2f7",
                        headerTextColor: "#2d3748",
                        fontSize: 13,
                        headerFontSize: 13,
                        oddRowBackgroundColor: "rgba(0, 0, 0, 0.02)",
                        rowBorder: false,
                        headerRowBorder: false,
                        columnBorder: false,
                        borderColor: "#e2e8f0",
                        selectedRowBackgroundColor: "#3182ce",
                        rowHoverColor: "rgba(49, 130, 206, 0.1)",
                        rangeSelectionBackgroundColor: "rgba(49, 130, 206, 0.2)"
                    });
                }
            }

            // Create grid options
            const gridOptions = {
                theme: quartzTheme,
                columnDefs: columnDefs,
                rowData: deviceData,
                defaultColDef: {
                    resizable: true,
                    sortable: true,
                    filter: true,
                    wrapHeaderText: false,
                    autoHeaderHeight: false
                },
                domLayout: "normal",
                animateRows: true,
                pagination: false,
                // External filter callbacks for vendor/KEV filtering
                isExternalFilterPresent: () => this.isExternalFilterPresent(),
                doesExternalFilterPass: (node) => this.doesExternalFilterPass(node),
                initialState: {
                    sort: {
                        sortModel: [{ colId: "totalVpr", sort: "desc" }]
                    }
                },
                onGridReady: (params) => {
                    this.gridApi = params.api;

                    // Register grid with AGGridThemeManager for dynamic theme updates
                    if (window.agGridThemeManager) {
                        window.agGridThemeManager.registerGrid("locationDetailsModal", this.gridApi, gridContainer);
                    }

                    // Auto-size columns to fit
                    setTimeout(() => {
                        if (params.api) {
                            params.api.sizeColumnsToFit();
                        }
                    }, 100);
                },
                onGridSizeChanged: (params) => {
                    if (params.api) {
                        params.api.sizeColumnsToFit();
                    }
                },
                onFirstDataRendered: (params) => {
                    if (params.api) {
                        params.api.sizeColumnsToFit();
                    }
                }
            };

            // Create grid
            this.grid = agGrid.createGrid(gridContainer, gridOptions);

            console.log(`[LocationDetailsModal] Grid created with ${deviceData.length} devices`);

        } catch (error) {
            console.error("[LocationDetailsModal] Error creating device grid:", error);
        }
    }

    /**
     * Check ticket state for multiple devices in a single batch request
     * Pattern source: vulnerability-grid.js:51-98 (HEX-216 batch optimization)
     * @param {Array<string>} hostnames - Array of device hostnames
     * @returns {Promise<Object>} Map of hostname to ticket summary {count, status, jobType, tickets}
     * @since v1.0.89
     */
    async checkTicketStateBatch(hostnames) {
        try {
            // Get CSRF token first (required for POST requests)
            const csrfResponse = await fetch("/api/auth/csrf", {
                credentials: "include"
            });
            const { csrfToken } = await csrfResponse.json();

            // Make batch request with CSRF token
            const response = await fetch("/api/tickets/batch-device-lookup", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "x-csrf-token": csrfToken
                },
                credentials: "include",
                body: JSON.stringify({ hostnames })
            });

            if (!response.ok) {
                console.error("[LocationDetailsModal] Failed to fetch batch ticket data:", response.statusText);
                // Return empty map on error
                const emptyMap = {};
                hostnames.forEach(hostname => {
                    emptyMap[hostname.toLowerCase()] = { count: 0, status: null, jobType: null, tickets: [] };
                });
                return emptyMap;
            }

            const result = await response.json();
            return result.data || {};
        } catch (error) {
            console.error("[LocationDetailsModal] Error checking ticket state batch:", error);
            // Return empty map on error
            const emptyMap = {};
            hostnames.forEach(hostname => {
                emptyMap[hostname.toLowerCase()] = { count: 0, status: null, jobType: null, tickets: [] };
            });
            return emptyMap;
        }
    }

    /**
     * Aggregate device data from vulnerabilities for grid display
     * Groups vulnerabilities by hostname and calculates totals/breakdowns
     * Session 3: Now async to support ticket count integration
     *
     * @param {Object} location - Location data
     * @returns {Promise<Array<Object>>} Array of device objects for grid
     */
    async aggregateDeviceData(location) {
        try {
            // Get all vulnerabilities (use dataManager if available, otherwise empty array)
            const allVulnerabilities = this.dataManager?.vulnerabilities || [];

            // Filter vulnerabilities for this location (case-insensitive match - HEX-296 Fix #2)
            const locationVulns = allVulnerabilities.filter(vuln => {
                if (!vuln.normalized_location) {
                    return false;
                }
                const searchLocation = location.location.toLowerCase();
                const vulnLocation = vuln.normalized_location.toLowerCase();
                return vulnLocation === searchLocation;
            });

            // Group by hostname (each vulnerability has ONE hostname, not an array)
            const deviceMap = new Map();

            locationVulns.forEach(vuln => {
                const hostname = vuln.hostname;
                if (!hostname) {
                    return; // Skip vulnerabilities without hostname
                }

                if (!deviceMap.has(hostname)) {
                    deviceMap.set(hostname, {
                        hostname: hostname,
                        vendor: null, // Will be set from first vulnerability
                        vulnerabilities: [],
                        totalVpr: 0,
                        vulnerabilityCount: 0,
                        severityBreakdown: {
                            Critical: { count: 0, vpr: 0 },
                            High: { count: 0, vpr: 0 },
                            Medium: { count: 0, vpr: 0 },
                            Low: { count: 0, vpr: 0 }
                        },
                        hasKev: false,
                        installedVersion: null,
                        fixedVersion: null,
                        ticketCount: 0,
                        ticketStatus: null,
                        highestSeverity: "Low"
                    });
                }

                const device = deviceMap.get(hostname);
                device.vulnerabilities.push(vuln);
                device.vulnerabilityCount++;
                device.totalVpr += vuln.vpr_score || 0;

                // Extract vendor from first vulnerability (all vulns for same device have same vendor)
                if (!device.vendor && vuln.vendor) {
                    device.vendor = vuln.vendor;
                }

                // Update severity breakdown
                const severity = vuln.severity || "Low";
                if (device.severityBreakdown[severity]) {
                    device.severityBreakdown[severity].count++;
                    device.severityBreakdown[severity].vpr += vuln.vpr_score || 0;
                }

                // Track KEV status
                if (vuln.isKev === "Yes") {
                    device.hasKev = true;
                }

                // Extract version info (use first available)
                if (!device.installedVersion && vuln.operating_system) {
                    device.installedVersion = vuln.operating_system;
                }
                if (!device.fixedVersion && vuln.solution) {
                    // Extract version from solution field (simplified - Session 3 will improve)
                    const versionMatch = vuln.solution.match(/\d+\.\d+\.\d+/);
                    if (versionMatch) {
                        device.fixedVersion = versionMatch[0];
                    }
                }
            });

            // Convert map to array and calculate highest severity
            const devices = Array.from(deviceMap.values()).map(device => {
                // Determine highest severity based on counts
                if (device.severityBreakdown.Critical.count > 0) {
                    device.highestSeverity = "Critical";
                } else if (device.severityBreakdown.High.count > 0) {
                    device.highestSeverity = "High";
                } else if (device.severityBreakdown.Medium.count > 0) {
                    device.highestSeverity = "Medium";
                } else {
                    device.highestSeverity = "Low";
                }

                return device;
            });

            // Session 3: Fetch ticket counts in batch (HEX-216 pattern)
            const hostnames = devices.map(d => d.hostname);
            if (hostnames.length > 0) {
                const ticketMap = await this.checkTicketStateBatch(hostnames);

                // Enrich devices with ticket data
                devices.forEach(device => {
                    const ticketData = ticketMap[device.hostname.toLowerCase()] || { count: 0, status: null, jobType: null, tickets: [] };
                    device.ticketCount = ticketData.count;
                    device.ticketStatus = ticketData.status;
                    device.tickets = ticketData.tickets || [];
                });

                console.log(`[LocationDetailsModal] Enriched ${devices.length} devices with ticket counts`);
            }

            return devices;

        } catch (error) {
            console.error("[LocationDetailsModal] Error aggregating device data:", error);
            return [];
        }
    }

    /**
     * Navigate to device details modal
     * @param {string} hostname - Device hostname
     */
    navigateToDevice(hostname) {
        console.log(`[LocationDetailsModal] Navigating to device: ${hostname}`);
        // Close this modal
        this.hide();
        // Open device modal (use existing vulnManager pattern)
        if (window.vulnManager && typeof window.vulnManager.viewDeviceDetails === "function") {
            window.vulnManager.viewDeviceDetails(hostname);
        } else {
            console.error("[LocationDetailsModal] vulnManager.viewDeviceDetails not available");
        }
    }

    /**
     * Create ticket for device
     * Pattern source: device-security-modal.js:947-987 (ticket creation flow)
     * @param {string} hostname - Device hostname
     * @since v1.0.89
     */
    createTicket(hostname) {
        console.log(`[LocationDetailsModal] Creating ticket for device: ${hostname}`);

        // Parse hostname to extract SITE and Location (ALL CAPS)
        const site = hostname.substring(0, 4).toUpperCase();       // First 4 characters
        const location = hostname.substring(0, 5).toUpperCase();   // First 5 characters

        // Prepare ticket data for single device creation
        const ticketData = {
            devices: [hostname],
            site: site,
            location: location,
            mode: "single"
        };

        // Store data in sessionStorage for tickets.html to consume
        sessionStorage.setItem("autoOpenModal", "true");
        sessionStorage.setItem("createTicketData", JSON.stringify(ticketData));

        // Navigate to tickets page (modal will auto-open via tickets.js)
        window.location.href = "/tickets.html";
    }

    /**
     * View tickets for device
     * Pattern source: device-security-modal.js:989-1003 (ticket navigation)
     * @param {string} hostname - Device hostname
     * @since v1.0.89
     */
    viewTickets(hostname) {
        console.log(`[LocationDetailsModal] Viewing tickets for device: ${hostname}`);

        // Find device data to get ticket info
        const device = this.allDevices?.find(d => d.hostname === hostname);
        if (!device) {
            console.error("[LocationDetailsModal] Device not found:", hostname);
            return;
        }

        const ticketCount = device.ticketCount || 0;
        const tickets = device.tickets || [];

        if (ticketCount === 0) {
            console.log("[LocationDetailsModal] No tickets found, showing create instead");
            this.createTicket(hostname);
            return;
        } else if (ticketCount === 1) {
            // Open ticket edit modal directly (not navigation)
            const ticketId = tickets[0].id;
            console.log(`[LocationDetailsModal] Opening single ticket modal: ${ticketId}`);

            if (window.ticketManager && typeof window.ticketManager.editTicket === "function") {
                window.ticketManager.editTicket(ticketId);
            } else {
                console.error("[LocationDetailsModal] ticketManager.editTicket not available, falling back to navigation");
                window.location.href = `/tickets.html?openTicket=${ticketId}`;
            }
            return;
        } else {
            // Show picker modal for multiple tickets
            console.log(`[LocationDetailsModal] Showing picker for ${ticketCount} tickets`);
            this.showTicketPickerModal(hostname, tickets);
        }
    }

    /**
     * Show ticket picker modal for device with multiple tickets
     * Pattern source: vulnerability-cards.js:269-312 (ticket picker modal)
     * @param {string} hostname - Device hostname
     * @param {Array} tickets - Array of ticket objects
     * @since v1.0.89
     */
    showTicketPickerModal(hostname, tickets) {
        console.log(`[LocationDetailsModal] Showing ticket picker for ${hostname}: ${tickets.length} tickets`);

        // Use existing ticket picker modal if available
        if (window.ticketPickerModal && typeof window.ticketPickerModal.show === "function") {
            window.ticketPickerModal.show(hostname, tickets);
        } else {
            console.error("[LocationDetailsModal] ticketPickerModal not available");
            // Fallback: Navigate to tickets page filtered by device
            window.location.href = `/tickets.html?device=${encodeURIComponent(hostname)}`;
        }
    }

    /**
     * Detect current theme from DOM
     * @returns {string} "dark" or "light"
     */
    detectCurrentTheme() {
        return document.documentElement.getAttribute("data-bs-theme") === "dark" ? "dark" : "light";
    }

    /**
     * Show modal with theme propagation
     * Session 3: Now async to support ticket count loading
     *
     * Pattern source: device-security-modal.js:768-795 (theme propagation)
     */
    async showModal() {
        try {
            // Detect current theme and propagate to modal
            const currentTheme = document.documentElement.getAttribute("data-bs-theme") || "light";
            const modalElement = document.getElementById("locationDetailsModal");

            // Propagate theme to modal
            if (modalElement) {
                modalElement.setAttribute("data-bs-theme", currentTheme);
            }

            // Aggregate device data first (needed for vendor breakdown cards)
            const deviceData = await this.aggregateDeviceData(this.currentLocation);

            // Store unfiltered devices for filtering
            this.allDevices = deviceData;

            // Populate vendor breakdown cards (reads from this.currentLocation.vendor_breakdown)
            this.populateVendorBreakdownCards();

            // Create device grid (now async with ticket count integration)
            await this.createLocationDevicesGrid(this.currentLocation);

            // Initialize Bootstrap modal
            this.modal = new bootstrap.Modal(modalElement);

            // Initialize footer buttons
            this.initializeFooterButtons();

            // Add cleanup listener for modal close
            modalElement.addEventListener("hidden.bs.modal", () => {
                this.destroy();
            }, { once: true }); // Use once: true to prevent multiple listeners

            // Show modal
            this.modal.show();

        } catch (error) {
            console.error("[LocationDetailsModal] Error showing modal:", error);
        }
    }

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
     * Calculate fixed version for a single device
     * Gets highest fixed version from all CVEs for this device
     * @param {Object} device - Device object with vulnerabilities array
     * @returns {Promise<string>} Fixed version or "N/A"/"No Fix"
     */
    async calculateDeviceFixedVersion(device) {
        const vendor = device.vendor;
        const installedVersion = device.installedVersion;

        // Filter to CVEs only
        const cves = device.vulnerabilities
            .filter(v => v.cve && v.cve.startsWith("CVE-"))
            .map(v => v.cve);

        if (cves.length === 0) {
            return "N/A";
        }

        // Check if vendor supported
        const hasVendor = vendor && (vendor.toLowerCase().includes("cisco") || vendor.toLowerCase().includes("palo"));
        if (!hasVendor) {
            return "N/A";
        }

        // Determine which advisory helper to use
        let advisoryHelper = null;
        if (vendor.toLowerCase().includes("cisco")) {
            advisoryHelper = window.ciscoAdvisoryHelper;
        } else if (vendor.toLowerCase().includes("palo")) {
            advisoryHelper = window.paloAdvisoryHelper;
        }

        if (!advisoryHelper) {
            return "N/A";
        }

        // Get unique CVEs
        const uniqueCves = [...new Set(cves)];

        try {
            // Query all CVEs in parallel
            const fixedVersionPromises = uniqueCves.map(cve =>
                advisoryHelper.getFixedVersion(cve, vendor, installedVersion)
                    .catch(err => {
                        console.warn(`[LocationDetailsModal] Failed to get fixed version for ${cve}:`, err);
                        return null;
                    })
            );

            const fixedVersions = await Promise.all(fixedVersionPromises);

            // Filter out nulls and deduplicate
            const validVersions = [...new Set(fixedVersions.filter(v => v !== null && v !== "No Fix"))];

            if (validVersions.length > 0) {
                // Sort and return highest version
                validVersions.sort((a, b) => advisoryHelper.compareVersions ? advisoryHelper.compareVersions(a, b) : a.localeCompare(b));
                return validVersions[0];
            } else {
                return "No Fix";
            }
        } catch (error) {
            console.error(`[LocationDetailsModal] Error calculating fixed version for ${device.hostname}:`, error);
            return "Error";
        }
    }

    /**
     * Calculate fixed versions for all devices
     * Performs async advisory lookups in parallel for all devices
     * @param {Array} devices - Array of device objects
     * @returns {Promise<void>} Modifies devices in place with fixedVersion field
     */
    async calculateAllDeviceFixedVersions(devices) {
        // Perform lookups in parallel for all devices
        const lookupPromises = devices.map(async (device) => {
            device.fixedVersion = await this.calculateDeviceFixedVersion(device);
        });

        await Promise.all(lookupPromises);
    }

    /**
     * Export location grid data to CSV with async fixed version calculation
     * Performs fresh advisory lookups for ALL devices before export
     * Pattern source: device-security-modal.js:790-869 (CSV export pattern)
     * @since v1.0.93
     */
    async exportLocationCsv() {
        console.log("[LocationDetailsModal] Exporting location CSV");

        // Validate modal state
        const modal = document.getElementById("locationDetailsModal");
        if (!modal || !modal.classList.contains("show")) {
            if (window.vulnManager && typeof window.vulnManager.showToast === "function") {
                window.vulnManager.showToast("No location modal is currently open", "warning");
            }
            return;
        }

        if (!this.currentLocation) {
            if (window.vulnManager && typeof window.vulnManager.showToast === "function") {
                window.vulnManager.showToast("No location data available for export", "warning");
            }
            return;
        }

        // Show loading toast
        if (window.vulnManager && typeof window.vulnManager.showToast === "function") {
            window.vulnManager.showToast("Calculating fixed versions for all devices...", "info");
        }

        const location = this.currentLocation;

        // Clone allDevices to avoid modifying grid state
        const devices = this.allDevices ? this.allDevices.map(d => ({...d, vulnerabilities: [...(d.vulnerabilities || [])]})) : [];

        // Perform async fixed version lookup for ALL devices
        await this.calculateAllDeviceFixedVersions(devices);

        const csvData = [];

        // Extract location metadata
        const locationDisplay = location.location_display || location.location?.toUpperCase() || "N/A";
        const deviceCount = location.device_count || 0;
        const totalVPR = location.total_vpr || 0;
        const kevDeviceCount = location.kev_count || 0;
        const openTickets = location.open_tickets || 0;
        const networkSubnet = this.calculateNetworkSubnet(location.device_ips || []);

        // Calculate risk level from VPR
        let riskLevel = "Low Risk";
        if (totalVPR >= 90) {riskLevel = "Critical Risk";}
        else if (totalVPR >= 70) {riskLevel = "High Risk";}
        else if (totalVPR >= 40) {riskLevel = "Medium Risk";}

        // Severity breakdown
        const severityBreakdown = location.severity_breakdown || {};
        const criticalCount = severityBreakdown.Critical?.count || 0;
        const criticalVpr = severityBreakdown.Critical?.vpr || 0;
        const highCount = severityBreakdown.High?.count || 0;
        const highVpr = severityBreakdown.High?.vpr || 0;
        const mediumCount = severityBreakdown.Medium?.count || 0;
        const mediumVpr = severityBreakdown.Medium?.vpr || 0;
        const lowCount = severityBreakdown.Low?.count || 0;
        const lowVpr = severityBreakdown.Low?.vpr || 0;

        // Vendor breakdown
        const vendorBreakdown = location.vendor_breakdown || {};
        const ciscoCount = vendorBreakdown["CISCO"] || 0;
        const paloCount = vendorBreakdown["Palo Alto"] || 0;
        const otherCount = vendorBreakdown["Other"] || 0;

        // Build location header section
        csvData.push(["Location Information"]);
        csvData.push(["Location", locationDisplay]);
        csvData.push(["Device Count", deviceCount]);
        csvData.push(["Total VPR Score", totalVPR.toFixed(1)]);
        csvData.push(["Risk Level", riskLevel]);
        csvData.push(["KEV Devices", kevDeviceCount]);
        csvData.push(["Open Tickets", openTickets]);
        csvData.push(["Network Subnet", networkSubnet]);
        csvData.push([]);

        csvData.push(["Severity Breakdown"]);
        csvData.push(["Severity", "Device Count", "Total VPR"]);
        csvData.push(["Critical", criticalCount, criticalVpr.toFixed(1)]);
        csvData.push(["High", highCount, highVpr.toFixed(1)]);
        csvData.push(["Medium", mediumCount, mediumVpr.toFixed(1)]);
        csvData.push(["Low", lowCount, lowVpr.toFixed(1)]);
        csvData.push([]);

        csvData.push(["Vendor Breakdown"]);
        csvData.push(["Vendor", "Device Count"]);
        csvData.push(["Cisco", ciscoCount]);
        csvData.push(["Palo Alto", paloCount]);
        csvData.push(["Other", otherCount]);
        csvData.push([]);

        // Device data section (use calculated devices with fixed versions)
        csvData.push(["Devices"]);
        csvData.push(["Hostname", "Vendor", "Installed Version", "Fixed Version", "CVE Count", "Total VPR", "KEV", "Ticket Count", "Ticket Status"]);

        if (devices && devices.length > 0) {
            devices.forEach(device => {
                csvData.push([
                    device.hostname || "N/A",
                    device.vendor || "N/A",
                    device.installedVersion || "N/A",
                    device.fixedVersion || "N/A",
                    device.vulnerabilityCount || 0,
                    (device.totalVpr || 0).toFixed(1),
                    device.hasKev ? "Yes" : "No",
                    device.ticketCount || 0,
                    device.ticketStatus || "None"
                ]);
            });
        }

        // Convert to CSV format with proper escaping
        const csvContent = csvData.map(row =>
            row.map(field => `"${String(field).replace(/"/g, "\"\"")}"`).join(",")
        ).join("\n");

        // Create and download the file
        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const link = document.createElement("a");
        const timestamp = new Date().toISOString().slice(0, 10);
        const safeLocationName = locationDisplay.replace(/[^a-zA-Z0-9]/g, "_");
        link.href = URL.createObjectURL(blob);
        link.download = `location-details-${safeLocationName}-${timestamp}.csv`;
        link.style.visibility = "hidden";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        if (window.vulnManager && typeof window.vulnManager.showToast === "function") {
            window.vulnManager.showToast(`Exported ${devices.length} devices with fixed versions for ${locationDisplay}`, "success");
        }

        console.log(`[LocationDetailsModal] Exported CSV for ${locationDisplay}: ${devices.length} devices with calculated fixed versions`);
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

    /**
     * Hide modal
     */
    hide() {
        if (this.modal) {
            this.modal.hide();
        }
    }

    /**
     * Cleanup on modal close
     */
    destroy() {
        // Cleanup grid API if exists
        if (this.gridApi) {
            this.gridApi.destroy();
            this.gridApi = null;
        }

        // Clear current data
        this.currentLocation = null;
        this.dataManager = null;
        this.activeFilter = null;

        // Dispose tooltips
        const tooltips = document.querySelectorAll("#locationInfo [data-bs-toggle=\"tooltip\"]");
        tooltips.forEach(tooltipEl => {
            const tooltip = bootstrap.Tooltip.getInstance(tooltipEl);
            if (tooltip) {
                tooltip.dispose();
            }
        });
    }
}

// Global registration
if (typeof window !== "undefined") {
    window.locationDetailsModal = new LocationDetailsModal();
}
