/**
 * Device Security Modal Module for HexTrackr
 * 
 * This module provides an enhanced device security overview modal with improved UI/UX,
 * Tabler.io styling, and comprehensive report generation capabilities.
 * 
 * @fileoverview Device security modal management and display
 * @author HexTrackr Development Team
 * @version 1.0.0
 */

/* global window, document, bootstrap, agGrid, console */

class DeviceSecurityModal {
    constructor() {
        this.currentDevice = null;
        this.deviceGrid = null;
        this.deviceGridApi = null;
        this.activeFilter = null; // Track active severity filter for toggle behavior

        this.init();
    }

    /**
     * Initialize the device security modal
     */
    init() {
        this.bindEventListeners();
        logger.debug("DeviceSecurityModal initialized");
    }

    /**
     * Bind event listeners for modal interactions
     */
    bindEventListeners() {
        // Export device data button
        const exportDeviceData = document.getElementById("exportDeviceData");
        if (exportDeviceData) {
            exportDeviceData.addEventListener("click", () => {
                this.exportDeviceData();
            });
        }

        // Smart ticket button will be dynamically populated in showDeviceDetails()
    }

    /**
     * Display device details in the modal with enhanced UI
     * @param {string} hostname - The hostname of the device to display
     * @param {Object} dataManager - The data manager instance for getting device data
     */
    showDeviceDetails(hostname, dataManager) {
        const device = dataManager.getDeviceByHostname(hostname);
        if (!device) {
            logger.error("Device not found:", hostname);
            return;
        }

        this.currentDevice = device;
        this.dataManager = dataManager; // HEX-203: Store for power tools access
        this.populateDeviceInfo(device);
        this.populateVprSummary(device);
        this.createDeviceVulnerabilityGrid(device);
        this.showModal();

        // HEX-204: Add KEV badge to Device Information card header if device has KEV vulnerabilities
        this.updateDeviceInfoKevBadge(device);

        // HEX-203: Update smart ticket button after modal is shown
        this.updateTicketButton(hostname);
    }

    /**
     * Populate device information section
     * @param {Object} device - The device data object
     */
    populateDeviceInfo(device) {
        // HEX-174: Get IP from first vulnerability that has one (mirrors AG-Grid table behavior)
        // This is a short-term fix until database-first device endpoint is implemented
        const ipAddress = device.vulnerabilities?.find(v => v.ip_address)?.ip_address || device.ipAddress || "N/A";

        // HEX-204: Use vendor from device object (already set during aggregation from database)
        // This preserves the sophisticated hostname+plugin pattern matching from CSV import
        // Fallback to checking vulnerabilities array if device.vendor is missing
        const vendor = device.vendor ||
                       device.vulnerabilities?.find(v => v.vendor)?.vendor ||
                       "Other";

        // HEX-204: Get installed software/OS from vulnerability data (use first non-null value)
        const installedSoftware = device.vulnerabilities?.find(v => v.operating_system)?.operating_system || "N/A";

        // Vendor badge color logic (matches card view styling)
        const vendorBadgeClass = vendor === "CISCO" ? "bg-primary" :
                                 vendor === "Palo Alto" ? "bg-warning" :
                                 "bg-secondary";

        document.getElementById("deviceInfo").innerHTML = `
            <div class="mb-3">
                <div class="row">
                    <div class="col-sm-4 text-muted">Hostname:</div>
                    <div class="col-sm-8 fw-bold">${device.hostname}</div>
                </div>
            </div>
            <div class="mb-3">
                <div class="row">
                    <div class="col-sm-4 text-muted">IP Address:</div>
                    <div class="col-sm-8">
                        <span class="font-monospace text-primary">${ipAddress}</span>
                    </div>
                </div>
            </div>
            <div class="mb-3">
                <div class="row">
                    <div class="col-sm-4 text-muted">Vendor:</div>
                    <div class="col-sm-8">
                        <span class="badge ${vendorBadgeClass}">${vendor}</span>
                    </div>
                </div>
            </div>
            <div class="mb-3">
                <div class="row">
                    <div class="col-sm-4 text-muted">Installed Software:</div>
                    <div class="col-sm-8">
                        <span class="font-monospace text-info">${installedSoftware}</span>
                    </div>
                </div>
            </div>
            <div class="mb-3">
                <div class="row">
                    <div class="col-sm-4 text-muted">Fixed Version(s):</div>
                    <div class="col-sm-8">
                        <span id="deviceFixedVersion" class="font-monospace text-muted">Loading...</span>
                    </div>
                </div>
            </div>
            <div class="mb-3">
                <div class="row">
                    <div class="col-sm-4 text-muted">Total Risks:</div>
                    <div class="col-sm-8">
                        <span class="badge bg-secondary">${device.totalCount} vulnerabilities</span>
                    </div>
                </div>
            </div>
            <div class="mb-3">
                <div class="row">
                    <div class="col-sm-4 text-muted">Total VPR:</div>
                    <div class="col-sm-8">
                        <span class="severity-badge severity-${this.getVprSeverityClass(device.totalVPR || 0)}">${(device.totalVPR || 0).toFixed(1)}</span>
                    </div>
                </div>
            </div>
            <div class="mb-3">
                <div class="row">
                    <div class="col-sm-4 text-muted">Risk Level:</div>
                    <div class="col-sm-8">
                        ${device.criticalCount > 0 ? "<span class=\"badge bg-red\">Critical Risk</span>" :
                          device.highCount > 5 ? "<span class=\"badge bg-orange\">High Risk</span>" :
                          device.mediumCount > 10 ? "<span class=\"badge bg-yellow\">Medium Risk</span>" :
                          "<span class=\"badge bg-green\">Low Risk</span>"}
                    </div>
                </div>
            </div>
        `;

        // Asynchronously load and display the device's fixed version
        this.loadDeviceFixedVersion(device);
    }

    /**
     * Load and display the most recent fixed version for this device
     * Queries all CVEs in parallel and displays the highest fixed version available
     * @param {Object} device - The device data object
     *
     * Note: compareVersions() moved to ciscoAdvisoryHelper (HEX-246) - shared function
     */

    async loadDeviceFixedVersion(device) {
        const fixedVersionElement = document.getElementById('deviceFixedVersion');
        if (!fixedVersionElement) return;

        // Use same vendor detection as populateDeviceInfo (with fallback to vulnerabilities)
        const vendor = device.vendor ||
                       device.vulnerabilities?.find(v => v.vendor)?.vendor ||
                       "Other";

        // Determine which advisory helper to use based on vendor
        let advisoryHelper = null;
        if (vendor?.toLowerCase().includes('cisco')) {
            advisoryHelper = window.ciscoAdvisoryHelper;
        } else if (vendor?.toLowerCase().includes('palo')) {
            advisoryHelper = window.paloAdvisoryHelper;
        }

        // Unsupported vendor or helper not loaded
        if (!advisoryHelper) {
            fixedVersionElement.innerHTML = `<span class="font-monospace text-muted">N/A</span>`;
            return;
        }

        try {
            // Get unique CVEs from device vulnerabilities
            const uniqueCves = [...new Set(device.vulnerabilities
                .filter(v => v.cve && v.cve.startsWith('CVE-'))
                .map(v => v.cve))];

            if (uniqueCves.length === 0) {
                fixedVersionElement.innerHTML = `<span class="font-monospace text-muted">No CVEs</span>`;
                return;
            }

            // Get installed version for OS-aware matching
            const installedVersion = device.vulnerabilities?.find(v => v.operating_system)?.operating_system || null;

            // Query all CVEs in parallel
            const fixedVersionPromises = uniqueCves.map(cve =>
                advisoryHelper.getFixedVersion(cve, vendor, installedVersion)
                    .catch(err => {
                        logger.warn(`Failed to get fixed version for ${cve}:`, err);
                        return null;
                    })
            );

            const fixedVersions = await Promise.all(fixedVersionPromises);

            // Filter out nulls and deduplicate
            const validVersions = [...new Set(fixedVersions.filter(v => v !== null && v !== 'No Fix'))];

            if (validVersions.length > 0) {
                // Sort versions (highest/most recent first) using shared function - HEX-246
                validVersions.sort((a, b) => window.ciscoAdvisoryHelper.compareVersions(a, b));

                // Display all unique versions, comma-separated
                const versionList = validVersions.map(v => DOMPurify.sanitize(v) + '+').join(', ');
                fixedVersionElement.innerHTML = `<span class="font-monospace text-success">${versionList}</span>`;
            } else {
                fixedVersionElement.innerHTML = `<span class="font-monospace text-muted">No Fix</span>`;
            }
        } catch (error) {
            logger.error('Failed to load device fixed version:', error);
            fixedVersionElement.innerHTML = `<span class="font-monospace text-danger">Error</span>`;
        }
    }

    /**
     * Add KEV badge to Device Information card header if device has KEV vulnerabilities
     * HEX-204: Visual indicator for high-risk devices with known exploited vulnerabilities
     * Updated to handle multiple KEVs with picker modal pattern
     * @param {Object} device - The device data object
     */
    updateDeviceInfoKevBadge(device) {
        // Find the Device Information card header
        const deviceInfoCard = document.querySelector("#deviceModal .card-header h3.card-title");
        if (!deviceInfoCard) {
            return;
        }

        // Remove any existing KEV badge
        const existingBadge = deviceInfoCard.parentElement.querySelector(".kev-badge");
        if (existingBadge) {
            existingBadge.remove();
        }

        // Check if device has any KEV vulnerabilities
        const hasKev = device.hasKev === true;
        if (!hasKev) {
            // Reset header styling if no KEV
            deviceInfoCard.parentElement.style.display = "";
            deviceInfoCard.parentElement.style.justifyContent = "";
            deviceInfoCard.parentElement.style.alignItems = "";
            return;
        }

        // Get ALL KEV vulnerabilities for this device
        const kevVulns = device.vulnerabilities?.filter(v => v.isKev === "Yes") || [];
        const kevCount = kevVulns.length;

        if (kevCount === 0) {
            return; // No KEVs found
        }

        // Make the card-header a flex container for badge positioning
        deviceInfoCard.parentElement.style.display = "flex";
        deviceInfoCard.parentElement.style.justifyContent = "space-between";
        deviceInfoCard.parentElement.style.alignItems = "center";

        // Store KEV data in a temporary object for the click handler
        const kevDataId = `kev-data-${Date.now()}`;
        if (!window.kevModalData) {
            window.kevModalData = {};
        }
        window.kevModalData[kevDataId] = kevVulns;

        // Determine click handler based on KEV count
        const clickHandler = kevCount === 1
            ? `showKevDetails('${kevVulns[0].cve}')`
            : `showKevPickerModal('${device.hostname}', window.kevModalData['${kevDataId}'])`;

        // Add KEV badge with count indicator if multiple
        const kevBadgeHtml = `
            <span class="badge kev-badge" role="button" tabindex="0"
                  onclick="event.stopPropagation(); ${clickHandler}"
                  onkeydown="if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); event.stopPropagation(); ${clickHandler}; }">
                <i class="fas fa-shield-halved me-1"></i>
                KEV${kevCount > 1 ? ` (${kevCount})` : ""}
            </span>
        `;

        deviceInfoCard.parentElement.insertAdjacentHTML("beforeend", kevBadgeHtml);
    }

    /**
     * Populate VPR summary cards with enhanced Tabler.io styling and interactive filtering
     * HEX-204: Updated to col-3 for full-width layout (4 cards side-by-side)
     * Cards are now clickable to filter the vulnerability table by severity
     * @param {Object} device - The device data object
     */
    populateVprSummary(device) {
        document.getElementById("deviceVprSummary").innerHTML = `
            <div class="col-lg-3 col-6">
                <div class="card card-sm bg-red-lt vpr-filter-card" style="cursor: pointer;" data-severity="Critical" onclick="window.deviceSecurityModal.filterBySeverity('Critical')">
                    <div class="card-body text-center">
                        <div class="text-red h3 mb-1">${device.criticalCount}</div>
                        <div class="text-muted small">Critical</div>
                        <div class="text-red fw-bold">${(device.criticalVPR || 0).toFixed(1)}</div>
                    </div>
                </div>
            </div>
            <div class="col-lg-3 col-6">
                <div class="card card-sm bg-orange-lt vpr-filter-card" style="cursor: pointer;" data-severity="High" onclick="window.deviceSecurityModal.filterBySeverity('High')">
                    <div class="card-body text-center">
                        <div class="text-orange h3 mb-1">${device.highCount}</div>
                        <div class="text-muted small">High</div>
                        <div class="text-orange fw-bold">${(device.highVPR || 0).toFixed(1)}</div>
                    </div>
                </div>
            </div>
            <div class="col-lg-3 col-6">
                <div class="card card-sm bg-yellow-lt vpr-filter-card" style="cursor: pointer;" data-severity="Medium" onclick="window.deviceSecurityModal.filterBySeverity('Medium')">
                    <div class="card-body text-center">
                        <div class="text-yellow h3 mb-1">${device.mediumCount}</div>
                        <div class="text-muted small">Medium</div>
                        <div class="text-yellow fw-bold">${(device.mediumVPR || 0).toFixed(1)}</div>
                    </div>
                </div>
            </div>
            <div class="col-lg-3 col-6">
                <div class="card card-sm bg-green-lt vpr-filter-card" style="cursor: pointer;" data-severity="Low" onclick="window.deviceSecurityModal.filterBySeverity('Low')">
                    <div class="card-body text-center">
                        <div class="text-green h3 mb-1">${device.lowCount}</div>
                        <div class="text-muted small">Low</div>
                        <div class="text-green fw-bold">${(device.lowVPR || 0).toFixed(1)}</div>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Filter vulnerability table by severity with toggle behavior
     * Clicking an active filter clears it; clicking a new severity applies that filter
     * @param {string} severity - Severity level to filter by (Critical, High, Medium, Low)
     */
    filterBySeverity(severity) {
        if (!this.deviceGridApi) {
            logger.warn('Grid API not available for filtering');
            return;
        }

        // Toggle behavior: if clicking the same severity, clear the filter
        if (this.activeFilter === severity) {
            // Clear filter
            this.deviceGridApi.setFilterModel(null);
            this.activeFilter = null;

            // Reset all card styles
            document.querySelectorAll('.vpr-filter-card').forEach(card => {
                card.style.opacity = '1';
                card.style.border = '';
                card.style.transform = '';
            });

            logger.debug('Filter cleared');
        } else {
            // Apply new filter
            this.activeFilter = severity;

            // Set AG-Grid filter
            this.deviceGridApi.setFilterModel({
                severity: {
                    filterType: 'text',
                    type: 'equals',
                    filter: severity
                }
            });

            // Update card visual states
            document.querySelectorAll('.vpr-filter-card').forEach(card => {
                const cardSeverity = card.getAttribute('data-severity');
                if (cardSeverity === severity) {
                    // Highlight active card
                    card.style.opacity = '1';
                    card.style.border = '2px solid var(--hextrackr-primary)';
                    card.style.transform = 'translateY(-2px)';
                } else {
                    // Dim inactive cards
                    card.style.opacity = '0.5';
                    card.style.border = '';
                    card.style.transform = '';
                }
            });

            logger.debug(`Filtered by ${severity} severity`);
        }
    }

    /**
     * Create and configure the device vulnerability grid with enhanced column order and styling
     * @param {Object} device - The device data object
     */
    createDeviceVulnerabilityGrid(device) {
        const deviceGridDiv = document.getElementById("device-vuln-grid");
        deviceGridDiv.innerHTML = "";

        // Unregister and destroy existing grid before creating new one (proper lifecycle)
        if (this.deviceGrid && window.agGridThemeManager) {
            window.agGridThemeManager.unregisterGrid("deviceSecurityModal");
        }
        if (this.deviceGrid) {
            this.deviceGrid.destroy();
            this.deviceGrid = null;
        }

        const deviceColumnDefs = [
            {
                headerName: "First Seen",
                field: "first_seen",
                colId: "first_seen",
                width: 120,
                cellRenderer: (params) => {
                    return params.value ? new Date(params.value).toLocaleDateString() : "N/A";
                }
            },
            {
                headerName: "Fixed Version",
                field: "fixed_version",
                colId: "fixed_version",
                width: 150,
                cellRenderer: (params) => {
                    const cveId = params.data.cve;
                    const vendor = params.data.vendor || this.currentDevice?.vendor;
                    const cellId = `fixed-version-cell-${params.node.id}`;

                    // Return placeholder with unique ID for async update
                    setTimeout(async () => {
                        const cell = document.getElementById(cellId);
                        if (!cell) return;

                        // Determine which advisory helper to use based on vendor
                        let advisoryHelper = null;
                        if (vendor?.toLowerCase().includes('cisco')) {
                            advisoryHelper = window.ciscoAdvisoryHelper;
                        } else if (vendor?.toLowerCase().includes('palo')) {
                            advisoryHelper = window.paloAdvisoryHelper;
                        }

                        // Unsupported vendor or helper not loaded
                        if (!advisoryHelper) {
                            cell.innerHTML = `<span class="font-monospace text-muted">N/A</span>`;
                            params.node.setDataValue('fixed_version', 'N/A');
                            return;
                        }

                        try {
                            const installedVersion = params.data.operating_system;
                            const fixedVersion = await advisoryHelper.getFixedVersion(
                                cveId, vendor, installedVersion
                            );

                            if (fixedVersion) {
                                cell.innerHTML = `<span class="font-monospace text-success">${DOMPurify.sanitize(fixedVersion)}+</span>`;
                                params.node.setDataValue('fixed_version', fixedVersion);
                            } else {
                                cell.innerHTML = `<span class="font-monospace text-muted">No Fix</span>`;
                                params.node.setDataValue('fixed_version', 'No Fix');
                            }
                        } catch (error) {
                            logger.error('Fixed version lookup failed:', error);
                            cell.innerHTML = `<span class="font-monospace text-muted">Error</span>`;
                            params.node.setDataValue('fixed_version', 'Error');
                        }
                    }, 0);

                    return `<span id="${cellId}" class="font-monospace text-muted">Loading...</span>`;
                }
            },
            {
                headerName: "Vulnerability",
                field: "cve",
                colId: "cve",
                width: 140,
                cellRenderer: (params) => {
                    const cve = params.value;
                    const pluginName = params.data.plugin_name;
                    const isKev = params.data.isKev === "Yes";

                    // KEV indicator with inline styles to override AG-Grid defaults
                    // Must use inline styles because AG-Grid applies its own styling that overrides Bootstrap classes
                    const linkColor = isKev ? '#dc3545' : '#3b82f6'; // Red for KEV, blue for normal
                    const fontWeight = isKev ? '700' : '400';
                    const kevTitle = isKev ? "Known Exploited Vulnerability - " : "";

                    // Create unique ID for vulnerability modal data storage
                    const vulnDataId = `device_vuln_${params.data.hostname}_${cve || params.data.plugin_id}_${Date.now()}`;
                    if (!window.vulnModalData) {
                        window.vulnModalData = {};
                    }
                    window.vulnModalData[vulnDataId] = params.data;

                    // Single CVE handling - open vulnerability details modal
                    if (cve && cve.startsWith("CVE-")) {
                        return `<a href="#" style="color: ${linkColor} !important; font-weight: ${fontWeight} !important; text-decoration: none;"
                                   onclick="vulnManager.viewVulnerabilityDetails('${vulnDataId}'); return false;"
                                   title="${kevTitle}View vulnerability details">${cve}</a>`;
                    }

                    // Check for Cisco SA ID in plugin name - open vulnerability details modal
                    if (pluginName && typeof pluginName === "string") {
                        const ciscoSaMatch = pluginName.match(/cisco-sa-([a-zA-Z0-9-]+)/i);
                        if (ciscoSaMatch) {
                            const ciscoId = `cisco-sa-${ciscoSaMatch[1]}`;
                            return `<a href="#" style="color: ${linkColor} !important; font-weight: ${fontWeight} !important; text-decoration: none;"
                                       onclick="vulnManager.viewVulnerabilityDetails('${vulnDataId}'); return false;"
                                       title="${kevTitle}View vulnerability details">${ciscoId}</a>`;
                        }
                    }

                    // Fall back to Plugin ID (muted gray text, not clickable - same as main table)
                    if (params.data.plugin_id) {
                        return `<span style="color: #6b7280 !important;">Plugin ${params.data.plugin_id}</span>`;
                    }

                    return "-";
                }
            },
            {
                headerName: "VPR",
                field: "vpr_score",
                colId: "vpr_score",
                width: 90,
                cellRenderer: (params) => {
                    const score = params.value || 0;
                    // Colored text based on score - inline styles for AG-Grid override
                    let color = "#16a34a";  // Green for low (0-3.9)
                    if (score >= 9.0) {
                        color = "#dc2626";   // Red for critical (9-10)
                    } else if (score >= 7.0) {
                        color = "#f76707";   // Orange for high (7-8.9)
                    } else if (score >= 4.0) {
                        color = "#d97706";   // Yellow for medium (4-6.9)
                    }
                    return `<span style="color: ${color}; font-weight: 700;">${score.toFixed(1)}</span>`;
                }
            },
            {
                headerName: "Severity",
                field: "severity",
                colId: "severity",
                width: 110,
                comparator: (valueA, valueB) => {
                    // Custom sort: Critical > High > Medium > Low
                    const severityOrder = { "Critical": 4, "High": 3, "Medium": 2, "Low": 1 };
                    const orderA = severityOrder[valueA] || 0;
                    const orderB = severityOrder[valueB] || 0;
                    return orderB - orderA; // Descending order (highest first)
                },
                cellRenderer: (params) => {
                    const severity = params.value || "Low";
                    // Colored text based on severity - inline styles for AG-Grid override
                    let color = "#16a34a";  // Green for Low
                    if (severity.toUpperCase() === "CRITICAL") {
                        color = "#dc2626";   // Red for Critical
                    } else if (severity.toUpperCase() === "HIGH") {
                        color = "#f76707";   // Orange for High
                    } else if (severity.toUpperCase() === "MEDIUM") {
                        color = "#d97706";   // Yellow for Medium
                    }
                    return `<span style="color: ${color}; font-weight: 700; text-transform: uppercase;">${severity}</span>`;
                }
            },
            {
                headerName: "Info",
                field: "info_icon",
                colId: "info_icon",
                width: 60,
                minWidth: 50,
                maxWidth: 80,
                sortable: false,
                filter: false,
                resizable: false,
                suppressHeaderMenuButton: true,
                cellStyle: {
                    textAlign: "center"
                },
                cellRenderer: (params) => {
                    const cve = params.data.cve;
                    const pluginName = params.data.plugin_name || "Vulnerability details";

                    // If CVE exists, open external CVE.org link in popup
                    if (cve && cve.startsWith("CVE-")) {
                        const cveUrl = `https://cve.mitre.org/cgi-bin/cvename.cgi?name=${cve}`;
                        return `<a href="#" class="text-primary" title="View ${cve} on CVE.org" onclick="window.open('${cveUrl}', 'cve_popup', 'width=1200,height=1200,scrollbars=yes,resizable=yes'); return false;">
                            <i class="fas fa-external-link-alt"></i>
                        </a>`;
                    }

                    // If Cisco SA ID, open external Cisco Security Advisory in popup
                    if (cve && cve.startsWith("cisco-sa-")) {
                        const ciscoUrl = `https://sec.cloudapps.cisco.com/security/center/content/CiscoSecurityAdvisory/${cve}`;
                        return `<a href="#" class="text-warning" title="View ${cve} on Cisco Security" onclick="window.open('${ciscoUrl}', 'cisco_popup', 'width=1200,height=1200,scrollbars=yes,resizable=yes'); return false;">
                            <i class="fas fa-external-link-alt"></i>
                        </a>`;
                    }

                    // For non-CVE/non-Cisco entries, show disabled info icon
                    return `<i class="fas fa-info-circle text-muted" title="No external reference available"></i>`;
                }
            }
        ];

        // Detect current theme for v33 theming
        const currentTheme = this.detectCurrentTheme();
        const isDarkMode = currentTheme === "dark";

        // Use same theme configuration as main table for consistency
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

        const deviceGridOptions = {
            theme: quartzTheme, // Use same theme configuration as main table
            columnDefs: deviceColumnDefs,
            rowData: device.vulnerabilities,
            defaultColDef: {
                resizable: true,
                sortable: true,
                filter: true,
                wrapHeaderText: false,
                autoHeaderHeight: false
            },
            domLayout: 'normal', // Enable vertical scrolling for all rows
            animateRows: true,
            // Default sort: VPR Score descending (highest risk first)
            initialState: {
                sort: {
                    sortModel: [
                        { colId: "vpr_score", sort: "desc" }
                    ]
                }
            },
            onGridReady: (params) => {
                this.deviceGridApi = params.api;

                // Register grid with AGGridThemeManager for dynamic theme updates
                if (window.agGridThemeManager) {
                    window.agGridThemeManager.registerGrid("deviceSecurityModal", this.deviceGridApi, deviceGridDiv);
                }

                // Ensure columns fill available width in modal
                setTimeout(() => {
                    if (params.api) {
                        params.api.sizeColumnsToFit();
                    }
                }, 100);
            },
            onGridSizeChanged: (params) => {
                // Resize columns when modal grid size changes
                if (params.api) {
                    params.api.sizeColumnsToFit();
                }
            },
            onFirstDataRendered: (params) => {
                // Ensure columns fill available width when data loads
                if (params.api) {
                    params.api.sizeColumnsToFit();
                }
            }
        };

        this.deviceGrid = agGrid.createGrid(deviceGridDiv, deviceGridOptions);
    }


    /**
     * Detect current theme from DOM
     * @returns {string} 'dark' or 'light'
     */
    detectCurrentTheme() {
        return document.documentElement.getAttribute("data-bs-theme") === "dark" ? "dark" : "light";
    }

    /**
     * Get VPR severity class based on score
     * @param {number} score - VPR score
     * @returns {string} Severity class name
     */
    getVprSeverityClass(score) {
        if (score >= 9.0) {return "critical";}
        if (score >= 7.0) {return "high";}
        if (score >= 4.0) {return "medium";}
        return "low";
    }

    /**
     * Show the device modal
     */
    showModal() {
        // Add theme detection
        const currentTheme = document.documentElement.getAttribute("data-bs-theme") || "light";
        const modalElement = document.getElementById("deviceModal");

        // Propagate theme to modal
        if (modalElement) {
            modalElement.setAttribute("data-bs-theme", currentTheme);
        }

        // Close any existing vulnerability modals before opening device modal
        const existingVulnModal = bootstrap.Modal.getInstance(document.getElementById("vulnerabilityModal"));
        if (existingVulnModal) {
            existingVulnModal.hide();
        }

        const existingVulnDetailsModal = bootstrap.Modal.getInstance(document.getElementById("vulnDetailsModal"));
        if (existingVulnDetailsModal) {
            existingVulnDetailsModal.hide();
        }

        const modal = new bootstrap.Modal(modalElement);
        modal.show();
    }

    /**
     * Export device data to CSV
     */
    exportDeviceData() {
        const modal = document.getElementById("deviceModal");
        if (!modal.classList.contains("show")) {
            this.showToast("No device modal is currently open", "warning");
            return;
        }

        if (!this.currentDevice) {
            this.showToast("No device data available for export", "warning");
            return;
        }

        const device = this.currentDevice;
        
        // Prepare CSV data with comprehensive device information
        const csvData = [];
        
        // Add device header information
        csvData.push(["Device Information"]);
        csvData.push(["Hostname", device.hostname]);
        csvData.push(["Total Vulnerabilities", device.totalCount]);
        csvData.push(["Total VPR Score", (device.totalVPR || 0).toFixed(1)]);
        csvData.push(["Critical Count", device.criticalCount]);
        csvData.push(["High Count", device.highCount]);
        csvData.push(["Medium Count", device.mediumCount]);
        csvData.push(["Low Count", device.lowCount]);
        csvData.push([]);

        // Add vulnerability data
        csvData.push(["Vulnerabilities"]);
        csvData.push(["First Seen", "VPR Score", "Severity", "CVE/ID", "Vulnerability Name", "Plugin ID", "IP Address", "Port"]);
        
        device.vulnerabilities.forEach(vuln => {
            csvData.push([
                vuln.first_seen || "N/A",
                (vuln.vpr_score || 0).toFixed(1),
                vuln.severity || "Low",
                vuln.cve || `Plugin ${vuln.plugin_id}`,
                vuln.plugin_name || "N/A",
                vuln.plugin_id || "N/A",
                vuln.ip_address || "N/A",
                vuln.port || "N/A"
            ]);
        });

        // Convert to CSV format
        const csvContent = csvData.map(row => 
            row.map(field => `"${String(field).replace(/"/g, "\"\"")}"`).join(",")
        ).join("\n");

        // Create and download the file
        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const link = document.createElement("a");
        const timestamp = new Date().toISOString().slice(0, 10);
        link.href = URL.createObjectURL(blob);
        link.download = `device-security-${device.hostname}-${timestamp}.csv`;
        link.style.visibility = "hidden";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        this.showToast(`Device security data exported for ${device.hostname}`, "success");
    }

    /**
     * Check ticket state for a device (HEX-203)
     * @param {string} hostname - Device hostname
     * @returns {Promise<Object>} Ticket state with count and tickets array
     */
    async checkTicketState(hostname) {
        try {
            const response = await fetch(`/api/tickets/by-device/${encodeURIComponent(hostname)}`);
            if (!response.ok) {
                logger.warn(`[Device Modal] No tickets found for ${hostname}`);
                return { count: 0, tickets: [] };
            }

            const data = await response.json();
            logger.debug(`[Device Modal] Found ${data.count} tickets for ${hostname}:`, data);

            // API returns {success: true, count: N, tickets: [...]}
            const tickets = data.tickets || [];
            const count = data.count || 0;

            return {
                count: count,
                tickets: tickets,
                status: tickets[0]?.status,
                jobType: tickets[0]?.job_type
            };
        } catch (error) {
            logger.error(`[Device Modal] Error checking ticket state for ${hostname}:`, error);
            return { count: 0, tickets: [] };
        }
    }

    /**
     * Get button configuration based on ticket state (HEX-203)
     * @param {number} count - Number of tickets
     * @param {string} status - Ticket status
     * @param {string} jobType - Job type
     * @returns {Object} Button configuration
     */
    getButtonConfig(count, status, jobType) {
        // Status to Bootstrap color mapping (matches tickets.css actual statuses)
        const statusColors = {
            "Pending": "warning",      // Amber yellow
            "Staged": "info",          // Purple (using info as closest Bootstrap match)
            "Open": "primary",         // Blue
            "Overdue": "danger",       // Red
            "Completed": "success",    // Green
            "Failed": "danger",        // Orange-red
            "Closed": "secondary"      // Gray
        };

        // Job type to status-label class mapping (for text color)
        const jobTypeTextColors = {
            "Upgrade": "status-open",      // Blue
            "Replace": "status-overdue",   // Orange/red
            "Refresh": "status-pending",   // Purple
            "Mitigate": "status-failed",   // Red
            "Other": "status-generic"      // Gray
        };

        if (count === 0) {
            return {
                text: "Create Ticket",
                colorClass: "btn-outline-success",
                icon: "fas fa-ticket-alt",
                textColorClass: ""
            };
        } else if (count === 1) {
            const colorClass = `btn-outline-${statusColors[status] || "primary"}`;
            const textColorClass = jobType ? `status-label ${jobTypeTextColors[jobType] || "status-generic"}` : "";
            return {
                text: "View Ticket",
                colorClass: colorClass,
                icon: "fas fa-folder-open",
                textColorClass: textColorClass
            };
        } else {
            const colorClass = `btn-outline-${statusColors[status] || "primary"}`;
            const textColorClass = jobType ? `status-label ${jobTypeTextColors[jobType] || "status-generic"}` : "";
            return {
                text: `View Tickets (${count})`,
                colorClass: colorClass,
                icon: "fas fa-layer-group",
                textColorClass: textColorClass
            };
        }
    }

    /**
     * Handle create/open ticket button click from device modal (HEX-203)
     * Supports power tools: Shift+Cmd/Ctrl (KEV only) or Shift+Alt (all devices)
     * @param {MouseEvent} event - Click event with keyboard modifiers
     * @param {HTMLButtonElement} button - Button element with data attributes
     */
    handleCreateTicketClick(event, button) {
        event.stopPropagation();

        // Read data from button attributes
        const hostname = button.dataset.hostname;
        const ticketCount = parseInt(button.dataset.ticketCount) || 0;
        const tickets = button.dataset.tickets ? JSON.parse(button.dataset.tickets) : [];

        logger.debug(`[Device Modal] Ticket button clicked - Hostname: ${hostname}, Count: ${ticketCount}`);

        // HEX-203: Handle existing tickets first
        if (ticketCount === 1) {
            const ticketId = tickets[0].id;
            logger.debug(`[Device Modal] Single ticket - navigating to ticket ${ticketId}`);
            window.location.href = `/tickets.html?openTicket=${ticketId}`;
            return;
        } else if (ticketCount > 1) {
            logger.debug(`[Device Modal] Multiple tickets - showing picker modal`);
            this.showTicketPickerModal(hostname, tickets);
            return;
        }

        // Original behavior: Create new ticket (ticketCount === 0)

        // Parse hostname to extract SITE and Location (ALL CAPS)
        const site = hostname.substring(0, 4).toUpperCase();
        const location = hostname.substring(0, 5).toUpperCase();

        // Detect keyboard modifiers to determine mode
        let mode = "single";
        let deviceList = [hostname.toUpperCase()];

        // Mode 2: KEV devices at location (Cmd/Ctrl + Shift)
        if ((event.metaKey || event.ctrlKey) && event.shiftKey) {
            mode = "bulk-kev";

            if (!this.dataManager) {
                logger.error("[Device Modal] Power Tool: dataManager not available");
                return;
            }

            // Get all filtered devices
            const allDevices = this.dataManager.getFilteredDevices();

            // Filter for KEV devices at same location
            deviceList = allDevices
                .filter(device => device.hostname.toLowerCase().startsWith(location.toLowerCase()) && device.hasKev === true)
                .map(device => device.hostname.toUpperCase());
        }
        // Mode 3: All devices at location (Alt + Shift)
        else if (event.altKey && event.shiftKey) {
            mode = "bulk-all";

            if (!this.dataManager) {
                logger.error("[Device Modal] Power Tool: dataManager not available");
                return;
            }

            // Get all filtered devices
            const allDevices = this.dataManager.getFilteredDevices();

            // Filter for all devices at same location
            deviceList = allDevices
                .filter(device => device.hostname.toLowerCase().startsWith(location.toLowerCase()))
                .map(device => device.hostname.toUpperCase());
        }

        // Console logging for debugging
        logger.debug("[Device Modal Power Tool] Mode:", mode);
        logger.debug("[Device Modal Power Tool] Site:", site);
        logger.debug("[Device Modal Power Tool] Location:", location);
        logger.debug("[Device Modal Power Tool] Devices:", deviceList);
        logger.debug("[Device Modal Power Tool] Total Count:", deviceList.length);

        // Use sessionStorage pattern (matches device cards createTicketFromDevice)
        const ticketData = {
            devices: deviceList,
            site: site,
            location: location,
            mode: mode,
            timestamp: Date.now()
        };

        // Set new JSON format
        sessionStorage.setItem("createTicketData", JSON.stringify(ticketData));

        // Backward compatibility: also set old format (first device)
        sessionStorage.setItem("createTicketDevice", deviceList[0]);
        sessionStorage.setItem("autoOpenModal", "true");

        // Enhanced toast message showing device count and mode
        const deviceCount = deviceList.length;
        const modeLabel = {
            "single": "device",
            "bulk-all": `devices at ${location}`,
            "bulk-kev": `KEV devices at ${location}`
        }[mode] || "device";

        logger.debug(`[Device Modal] Creating ticket for ${deviceCount} ${modeLabel}...`);

        // Navigate to tickets page - will auto-open modal via sessionStorage
        setTimeout(() => {
            window.location.href = "/tickets.html";
        }, 300);
    }

    /**
     * Show ticket picker modal for devices with multiple tickets (HEX-203)
     * Reuses existing modal structure from vulnerabilities.html
     * @param {string} hostname - Device hostname
     * @param {Array} tickets - Array of ticket objects
     */
    showTicketPickerModal(hostname, tickets) {
        logger.debug(`[Device Modal] Opening picker for ${hostname} with ${tickets.length} tickets:`, tickets);

        const validTickets = tickets.filter(t => t !== null && t.id);
        logger.debug(`[Device Modal] Valid tickets: ${validTickets.length}`, validTickets);

        if (validTickets.length === 0) {
            logger.error(`[Device Modal] No valid tickets found for ${hostname}`);
            return;
        }

        // Build modal content - reuses existing modal structure
        const modalBody = document.getElementById("ticketPickerModalBody");
        if (!modalBody) {
            logger.error(`[Device Modal] Modal body element not found!`);
            return;
        }

        modalBody.innerHTML = `
            <p class="mb-3">
                <strong>${hostname}</strong> has <strong>${validTickets.length}</strong> open tickets. Which would you like to view?
            </p>
            <div class="list-group">
                ${validTickets.map(ticket => `
                    <button type="button" class="list-group-item list-group-item-action"
                            onclick="window.location.href='/tickets.html?openTicket=${ticket.id}';">
                        <div class="d-flex w-100 justify-content-between align-items-center">
                            <div>
                                <h6 class="mb-1">XT-${ticket.xt_number}</h6>
                                <small class="text-muted">${ticket.job_type || "Unknown"} • ${new Date(ticket.created_at).toLocaleDateString()}</small>
                            </div>
                            <span class="badge bg-${this.getStatusBadgeColor(ticket.status)}">${ticket.status}</span>
                        </div>
                    </button>
                `).join("")}
            </div>
            <hr>
            <button type="button" class="btn btn-success w-100"
                    onclick="window.location.href='/tickets.html?createForDevice=${encodeURIComponent(hostname)}'; bootstrap.Modal.getInstance(document.getElementById('ticketPickerModal')).hide();">
                <i class="fas fa-plus me-1"></i>Create New Ticket Anyway
            </button>
        `;

        // Show the modal
        const modalElement = document.getElementById("ticketPickerModal");
        if (!modalElement) {
            logger.error(`[Device Modal] Modal element not found!`);
            return;
        }

        logger.debug(`[Device Modal] Showing modal...`);
        if (typeof bootstrap === "undefined") {
            logger.error(`[Device Modal] Bootstrap is not loaded!`);
            return;
        }

        const modal = new bootstrap.Modal(modalElement);
        modal.show();
        logger.debug(`[Device Modal] Modal shown successfully`);
    }

    /**
     * Get Bootstrap badge color for ticket status
     * @param {string} status - Ticket status
     * @returns {string} Bootstrap color class
     */
    getStatusBadgeColor(status) {
        const colorMap = {
            "Pending": "warning",
            "Staged": "info",
            "Open": "primary",
            "Overdue": "danger",
            "Completed": "success",
            "Failed": "danger",
            "Closed": "secondary"
        };
        return colorMap[status] || "primary";
    }

    /**
     * Update the ticket button in the device modal (HEX-203)
     * Called when modal is shown to dynamically populate button
     * @param {string} hostname - Device hostname
     */
    async updateTicketButton(hostname) {
        const buttonContainer = document.getElementById("deviceModalTicketButton");
        if (!buttonContainer) {
            logger.warn("[Device Modal] Ticket button container not found");
            return;
        }

        // Check ticket state
        const ticketState = await this.checkTicketState(hostname);
        const buttonConfig = this.getButtonConfig(
            ticketState.count,
            ticketState.status,
            ticketState.jobType
        );

        // Generate button HTML
        buttonContainer.innerHTML = `
            <button class="btn ${buttonConfig.colorClass} me-2"
                    data-hostname="${hostname}"
                    data-ticket-count="${ticketState.count}"
                    data-tickets='${JSON.stringify(ticketState.tickets)}'
                    onclick="event.stopPropagation(); window.deviceSecurityModal.handleCreateTicketClick(event, this)">
                <i class="${buttonConfig.icon} me-1"></i><span class="${buttonConfig.textColorClass}">${buttonConfig.text}</span>
            </button>
        `;

        logger.debug(`[Device Modal] Updated ticket button for ${hostname}:`, buttonConfig);
    }

    /**
     * Legacy method stub - removed HTML report generation (HEX-203)
     * Report feature removed in favor of CSV export and smart ticket buttons
     */
    generateReportHTML(device) {
        logger.warn("[Device Modal] generateReportHTML() has been deprecated - use CSV export instead");
        return "";
    }

    /**
     * Legacy method stub - removed report window controls (HEX-203)
     */
    setupReportWindowControls(reportWindow) {
        logger.warn("[Device Modal] setupReportWindowControls() has been deprecated");
    }

    /**
     * Show toast notification
     * @param {string} message - Toast message
     * @param {string} type - Toast type (success, warning, error, info)
     */
    showToast(message, type = "info") {
        // Integration with existing toast system
        if (window.vulnManager && typeof window.vulnManager.showToast === "function") {
            window.vulnManager.showToast(message, type);
        } else {
            logger.debug(`${type.toUpperCase()}: ${message}`);
        }
    }
}

// Initialize the device security modal when the DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
    window.deviceSecurityModal = new DeviceSecurityModal();
});

// Export for module usage (Node.js environment check)
/* global module */
if (typeof window === "undefined" && typeof module !== "undefined" && module.exports) {
    module.exports = DeviceSecurityModal;
}