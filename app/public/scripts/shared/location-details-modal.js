/**
 * LocationDetailsModal - Manages location details modal display
 * @class
 *
 * HEX-295 Session 1: Core Modal Structure (v1.0.87)
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
            const primaryVendor = location.primary_vendor || "Other";
            const totalVPR = location.total_vpr || 0;
            const kevCount = location.kev_count || 0;
            const openTickets = location.open_tickets || 0;

            // Vendor badge color logic (matches device-security-modal.js:92-95)
            const vendorBadgeClass = primaryVendor === "CISCO" ? "bg-primary" :
                                     primaryVendor === "Palo Alto" ? "bg-warning" :
                                     "bg-secondary";

            // VPR severity badge
            const vprSeverityClass = this.getVprSeverityClass(totalVPR);
            const vprBadgeClass = vprSeverityClass === "critical" ? "bg-red" :
                                  vprSeverityClass === "high" ? "bg-orange" :
                                  vprSeverityClass === "medium" ? "bg-yellow" :
                                  "bg-green";

            // Risk level badge
            const severityBreakdown = location.severity_breakdown || {};
            const criticalCount = severityBreakdown.Critical?.count || 0;
            const highCount = severityBreakdown.High?.count || 0;
            const mediumCount = severityBreakdown.Medium?.count || 0;

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
                : '<span class="text-muted">0</span>';

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
                        <div class="col-sm-5 text-muted">Primary Vendor:</div>
                        <div class="col-sm-7">
                            <span class="badge ${vendorBadgeClass}">${primaryVendor}</span>
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
            `;

            // Inject HTML into modal
            document.getElementById("locationInfo").innerHTML = infoHtml;

            // Initialize tooltips
            const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
            tooltipTriggerList.map(function (tooltipTriggerEl) {
                return new bootstrap.Tooltip(tooltipTriggerEl);
            });

        } catch (error) {
            console.error("[LocationDetailsModal] Error populating location info:", error);
            document.getElementById("locationInfo").innerHTML = '<p class="text-danger">Error loading location information</p>';
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
            return 'N/A';
        }

        // Management subnets to deprioritize (out-of-band management networks)
        const managementSubnets = ['10.95', '10.96', '10.97'];

        // Count frequency of production networks (excluding management)
        const productionNetworkCounts = {};
        // Count frequency of management networks (fallback)
        const managementNetworkCounts = {};

        ipAddresses.forEach(ip => {
            if (!ip) {return;}

            // Extract first 3 octets
            const parts = ip.split('.');
            if (parts.length >= 3) {
                const network = `${parts[0]}.${parts[1]}.${parts[2]}.0/24`;

                // Check if this IP is in a management subnet
                const isManagementIP = managementSubnets.some(subnet => ip.startsWith(subnet + '.'));

                if (isManagementIP) {
                    managementNetworkCounts[network] = (managementNetworkCounts[network] || 0) + 1;
                } else {
                    productionNetworkCounts[network] = (productionNetworkCounts[network] || 0) + 1;
                }
            }
        });

        // Find most common production network first
        let mostCommon = 'N/A';
        let maxCount = 0;

        for (const [network, count] of Object.entries(productionNetworkCounts)) {
            if (count > maxCount) {
                maxCount = count;
                mostCommon = network;
            }
        }

        // If no production networks found, fall back to management networks
        if (mostCommon === 'N/A') {
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
     * Populate VPR summary cards with interactive filtering
     * Creates 4 clickable severity cards that filter the device grid
     *
     * Pattern source: device-security-modal.js:311-356 (VPR filter cards)
     *
     * @param {Object} location - Location data with severity_breakdown
     */
    populateVprSummary(location) {
        try {
            const severityBreakdown = location.severity_breakdown || {
                Critical: { count: 0, vpr: 0 },
                High: { count: 0, vpr: 0 },
                Medium: { count: 0, vpr: 0 },
                Low: { count: 0, vpr: 0 }
            };

            // Build HTML for 4 severity filter cards
            document.getElementById("vprSummaryCards").innerHTML = `
                <div class="col-lg-3 col-6">
                    <div class="card card-sm bg-red-lt vpr-filter-card" style="cursor: pointer;" data-severity="Critical" onclick="window.locationDetailsModal.filterBySeverity('Critical')">
                        <div class="card-body text-center">
                            <div class="text-red h3 mb-1">${severityBreakdown.Critical.count}</div>
                            <div class="text-muted small">Critical</div>
                            <div class="text-red fw-bold">${(severityBreakdown.Critical.vpr || 0).toFixed(1)}</div>
                        </div>
                    </div>
                </div>
                <div class="col-lg-3 col-6">
                    <div class="card card-sm bg-orange-lt vpr-filter-card" style="cursor: pointer;" data-severity="High" onclick="window.locationDetailsModal.filterBySeverity('High')">
                        <div class="card-body text-center">
                            <div class="text-orange h3 mb-1">${severityBreakdown.High.count}</div>
                            <div class="text-muted small">High</div>
                            <div class="text-orange fw-bold">${(severityBreakdown.High.vpr || 0).toFixed(1)}</div>
                        </div>
                    </div>
                </div>
                <div class="col-lg-3 col-6">
                    <div class="card card-sm bg-yellow-lt vpr-filter-card" style="cursor: pointer;" data-severity="Medium" onclick="window.locationDetailsModal.filterBySeverity('Medium')">
                        <div class="card-body text-center">
                            <div class="text-yellow h3 mb-1">${severityBreakdown.Medium.count}</div>
                            <div class="text-muted small">Medium</div>
                            <div class="text-yellow fw-bold">${(severityBreakdown.Medium.vpr || 0).toFixed(1)}</div>
                        </div>
                    </div>
                </div>
                <div class="col-lg-3 col-6">
                    <div class="card card-sm bg-green-lt vpr-filter-card" style="cursor: pointer;" data-severity="Low" onclick="window.locationDetailsModal.filterBySeverity('Low')">
                        <div class="card-body text-center">
                            <div class="text-green h3 mb-1">${severityBreakdown.Low.count}</div>
                            <div class="text-muted small">Low</div>
                            <div class="text-green fw-bold">${(severityBreakdown.Low.vpr || 0).toFixed(1)}</div>
                        </div>
                    </div>
                </div>
            `;
        } catch (error) {
            console.error("[LocationDetailsModal] Error populating VPR summary:", error);
        }
    }

    /**
     * Filter device grid by severity with toggle behavior
     * Clicking an active filter clears it; clicking a new severity applies that filter
     *
     * Pattern source: device-security-modal.js:358-414 (severity filtering with toggle)
     *
     * @param {string} severity - Severity level to filter by (Critical, High, Medium, Low)
     */
    filterBySeverity(severity) {
        if (!this.gridApi) {
            console.warn("[LocationDetailsModal] Grid API not available for filtering");
            return;
        }

        // Toggle behavior: if clicking the same severity, clear the filter
        if (this.activeFilter === severity) {
            // Clear filter - show all rows
            this.gridApi.setGridOption("rowData", this.allDevices);
            this.activeFilter = null;

            // Reset all card styles
            document.querySelectorAll(".vpr-filter-card").forEach(card => {
                card.style.opacity = "1";
                card.style.border = "";
                card.style.transform = "";
            });

            console.log("[LocationDetailsModal] Filter cleared");
        } else {
            // Apply new filter
            this.activeFilter = severity;

            // Filter devices by highest severity matching the selected severity
            const filteredDevices = this.allDevices.filter(device => {
                return device.highestSeverity === severity;
            });

            // Update grid with filtered data
            this.gridApi.setGridOption("rowData", filteredDevices);

            // Update card visual states
            document.querySelectorAll(".vpr-filter-card").forEach(card => {
                const cardSeverity = card.getAttribute("data-severity");
                if (cardSeverity === severity) {
                    // Highlight active card
                    card.style.opacity = "1";
                    card.style.border = "2px solid var(--hextrackr-primary)";
                    card.style.transform = "translateY(-2px)";
                } else {
                    // Dim inactive cards
                    card.style.opacity = "0.5";
                    card.style.border = "";
                    card.style.transform = "";
                }
            });

            console.log(`[LocationDetailsModal] Filtered by ${severity} severity (${filteredDevices.length} devices)`);
        }
    }

    /**
     * Create and configure the location devices grid with 7 columns
     * Aggregates device data from vulnerabilities and displays in AG-Grid
     *
     * Pattern source: device-security-modal.js:420-731 (AG-Grid setup and theming)
     *
     * @param {Object} location - Location data with device_ips and vulnerabilities
     */
    createLocationDevicesGrid(location) {
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

            // Aggregate device data from vulnerabilities
            const deviceData = this.aggregateDeviceData(location);
            this.allDevices = deviceData; // Store for filtering

            // Define 7 column structure
            const columnDefs = [
                {
                    headerName: "Hostname",
                    field: "hostname",
                    width: 180,
                    cellRenderer: (params) => {
                        const hostname = params.value;
                        const isKev = params.data.hasKev;
                        const linkColor = isKev ? "#dc3545" : "#3b82f6"; // Red for KEV, blue for normal
                        const fontWeight = "700";

                        return `<a href="#" style="color: ${linkColor}; font-weight: ${fontWeight}; text-decoration: none;"
                                   onclick="window.locationDetailsModal.navigateToDevice('${hostname}'); return false;">
                                   ${hostname}
                                </a>`;
                    }
                },
                {
                    headerName: "Total Vuln",
                    field: "vulnerabilityCount",
                    width: 110,
                    cellRenderer: (params) => {
                        return `<span class="badge bg-secondary">${params.value}</span>`;
                    }
                },
                {
                    headerName: "Total VPR",
                    field: "totalVpr",
                    width: 110,
                    cellRenderer: (params) => {
                        const vpr = params.value || 0;
                        const severityClass = this.getVprSeverityClass(vpr);
                        const badgeClass = severityClass === "critical" ? "bg-red" :
                                          severityClass === "high" ? "bg-orange" :
                                          severityClass === "medium" ? "bg-yellow" : "bg-green";

                        // Build tooltip with C/H/M/L breakdown
                        const breakdown = params.data.severityBreakdown;
                        const tooltip = `Critical: ${breakdown.Critical.count} (${breakdown.Critical.vpr.toFixed(1)})
High: ${breakdown.High.count} (${breakdown.High.vpr.toFixed(1)})
Medium: ${breakdown.Medium.count} (${breakdown.Medium.vpr.toFixed(1)})
Low: ${breakdown.Low.count} (${breakdown.Low.vpr.toFixed(1)})`;

                        return `<span class="badge ${badgeClass}" title="${tooltip}" style="cursor: help;">
                                    ${vpr.toFixed(1)}
                                </span>`;
                    }
                },
                {
                    headerName: "Installed Version",
                    field: "installedVersion",
                    width: 150,
                    cellRenderer: (params) => {
                        return params.value ? `<span class="font-monospace">${params.value}</span>` : "N/A";
                    }
                },
                {
                    headerName: "Fixed Version",
                    field: "fixedVersion",
                    width: 150,
                    cellRenderer: (params) => {
                        return params.value ? `<span class="font-monospace text-success">${params.value}+</span>` : "N/A";
                    }
                },
                {
                    headerName: "Ticket Status",
                    field: "ticketStatus",
                    width: 110,
                    cellStyle: { textAlign: "center" },
                    cellRenderer: (params) => {
                        const ticketCount = params.data.ticketCount || 0;
                        const hostname = params.data.hostname;

                        // No tickets - show "Create" button
                        if (ticketCount === 0) {
                            return `<button class="btn btn-sm btn-outline-primary" onclick="window.locationDetailsModal.createTicket('${hostname}'); return false;">
                                        <i class="fas fa-plus me-1"></i>Create
                                    </button>`;
                        }

                        // Has tickets - show "View" button
                        return `<button class="btn btn-sm btn-primary" onclick="window.locationDetailsModal.viewTickets('${hostname}'); return false;">
                                    <i class="fas fa-eye me-1"></i>View (${ticketCount})
                                </button>`;
                    }
                },
                {
                    headerName: "Actions",
                    field: "actions",
                    width: 130,
                    cellStyle: { textAlign: "center" },
                    sortable: false,
                    filter: false,
                    cellRenderer: (params) => {
                        const hostname = params.data.hostname;
                        return `<button class="btn btn-sm btn-info" onclick="window.locationDetailsModal.navigateToDevice('${hostname}'); return false;">
                                    <i class="fas fa-search me-1"></i>View Details
                                </button>`;
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
                pagination: true,
                paginationPageSize: 25,
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
     * Aggregate device data from vulnerabilities for grid display
     * Groups vulnerabilities by hostname and calculates totals/breakdowns
     *
     * @param {Object} location - Location data
     * @returns {Array<Object>} Array of device objects for grid
     */
    aggregateDeviceData(location) {
        try {
            // Get all vulnerabilities (use dataManager if available, otherwise empty array)
            const allVulnerabilities = this.dataManager?.vulnerabilities || [];

            // Filter vulnerabilities for this location
            const locationVulns = allVulnerabilities.filter(vuln =>
                vuln.affectedLocations?.includes(location.location)
            );

            // Group by hostname
            const deviceMap = new Map();

            locationVulns.forEach(vuln => {
                const hostnames = vuln.affectedDevices || [];

                hostnames.forEach(hostname => {
                    if (!deviceMap.has(hostname)) {
                        deviceMap.set(hostname, {
                            hostname: hostname,
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
                    device.totalVpr += vuln.vprScore || 0;

                    // Update severity breakdown
                    const severity = vuln.severity || "Low";
                    if (device.severityBreakdown[severity]) {
                        device.severityBreakdown[severity].count++;
                        device.severityBreakdown[severity].vpr += vuln.vprScore || 0;
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
     * Create ticket for device (placeholder for Session 3)
     * @param {string} hostname - Device hostname
     */
    createTicket(hostname) {
        console.log(`[LocationDetailsModal] Create ticket for: ${hostname} (Session 3)`);
        // TODO: Implement in Session 3
    }

    /**
     * View tickets for device (placeholder for Session 3)
     * @param {string} hostname - Device hostname
     */
    viewTickets(hostname) {
        console.log(`[LocationDetailsModal] View tickets for: ${hostname} (Session 3)`);
        // TODO: Implement in Session 3
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
     *
     * Pattern source: device-security-modal.js:768-795 (theme propagation)
     */
    showModal() {
        try {
            // Detect current theme and propagate to modal
            const currentTheme = document.documentElement.getAttribute("data-bs-theme") || "light";
            const modalElement = document.getElementById("locationDetailsModal");

            // Propagate theme to modal
            if (modalElement) {
                modalElement.setAttribute("data-bs-theme", currentTheme);
            }

            // Populate VPR summary cards
            this.populateVprSummary(this.currentLocation);

            // Create device grid
            this.createLocationDevicesGrid(this.currentLocation);

            // Initialize Bootstrap modal
            this.modal = new bootstrap.Modal(modalElement);

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
        const tooltips = document.querySelectorAll('#locationInfo [data-bs-toggle="tooltip"]');
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
