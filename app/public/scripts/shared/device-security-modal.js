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
    }

    /**
     * Populate VPR summary cards with enhanced Tabler.io styling
     * @param {Object} device - The device data object
     */
    populateVprSummary(device) {
        document.getElementById("deviceVprSummary").innerHTML = `
            <div class="col-6">
                <div class="card card-sm bg-red-lt">
                    <div class="card-body text-center">
                        <div class="text-red h3 mb-1">${device.criticalCount}</div>
                        <div class="text-muted small">Critical</div>
                        <div class="text-red fw-bold">${(device.criticalVPR || 0).toFixed(1)}</div>
                    </div>
                </div>
            </div>
            <div class="col-6">
                <div class="card card-sm bg-orange-lt">
                    <div class="card-body text-center">
                        <div class="text-orange h3 mb-1">${device.highCount}</div>
                        <div class="text-muted small">High</div>
                        <div class="text-orange fw-bold">${(device.highVPR || 0).toFixed(1)}</div>
                    </div>
                </div>
            </div>
            <div class="col-6">
                <div class="card card-sm bg-yellow-lt">
                    <div class="card-body text-center">
                        <div class="text-yellow h3 mb-1">${device.mediumCount}</div>
                        <div class="text-muted small">Medium</div>
                        <div class="text-yellow fw-bold">${(device.mediumVPR || 0).toFixed(1)}</div>
                    </div>
                </div>
            </div>
            <div class="col-6">
                <div class="card card-sm bg-green-lt">
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
     * Create and configure the device vulnerability grid with enhanced column order and styling
     * @param {Object} device - The device data object
     */
    createDeviceVulnerabilityGrid(device) {
        const deviceGridDiv = document.getElementById("device-vuln-grid");
        deviceGridDiv.innerHTML = "";

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
                headerName: "Last Seen",
                field: "last_seen",
                colId: "last_seen",
                width: 120,
                cellRenderer: (params) => {
                    if (params.value && params.value.trim() !== "") {
                        return new Date(params.value).toLocaleDateString();
                    } else if (params.data.scan_date && params.data.scan_date.trim() !== "") {
                        return new Date(params.data.scan_date).toLocaleDateString();
                    }
                    return "N/A";
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
                    const className = `severity-${severity.toLowerCase()}`;
                    return `<span class="severity-badge ${className}">${severity}</span>`;
                }
            },
            {
                headerName: "VPR",
                field: "vpr_score",
                colId: "vpr_score",
                width: 90,
                cellRenderer: (params) => {
                    const score = params.value || 0;
                    const severityClass = this.getVprSeverityClass(score);
                    return `<span class="severity-badge severity-${severityClass}">${score.toFixed(1)}</span>`;
                }
            },
            {
                headerName: "KEV",
                field: "isKev",
                colId: "isKev",
                width: 110,
                comparator: (valueA, valueB) => {
                    // Custom sort: Yes > No (KEVs first when descending)
                    const kevOrder = { "Yes": 1, "No": 0 };
                    return (kevOrder[valueA] || 0) - (kevOrder[valueB] || 0);
                },
                cellRenderer: (params) => {
                    const kevStatus = params.value || "No";
                    if (kevStatus === "Yes") {
                        return "<span class=\"badge bg-danger\" style=\"cursor: pointer;\" title=\"Known Exploited Vulnerability\" onclick=\"showKevDetails('" + (params.data.cve || "") + "')\">YES</span>";
                    }
                    return "<span class=\"badge bg-primary\">NO</span>";
                },
                cellStyle: {
                    textAlign: "center"
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
                    
                    if (cve && cve.startsWith("CVE-")) {
                        const cveUrl = `https://cve.mitre.org/cgi-bin/cvename.cgi?name=${cve}`;
                        return `<a href="#" class="text-primary text-decoration-none"
                                   onclick="window.open('${cveUrl}', 'cve_popup', 'width=1200,height=1200,scrollbars=yes,resizable=yes'); return false;"
                                   title="View CVE details on MITRE">${cve}</a>`;
                    }
                    
                    // Check for Cisco SA ID in plugin name
                    if (pluginName && typeof pluginName === "string") {
                        const ciscoSaMatch = pluginName.match(/cisco-sa-([a-zA-Z0-9-]+)/i);
                        if (ciscoSaMatch) {
                            const ciscoId = `cisco-sa-${ciscoSaMatch[1]}`;
                            const ciscoUrl = `https://sec.cloudapps.cisco.com/security/center/content/CiscoSecurityAdvisory/${ciscoId}`;
                            return `<a href="#" class="text-warning text-decoration-none"
                                       onclick="window.open('${ciscoUrl}', 'cisco_popup', 'width=1200,height=1200,scrollbars=yes,resizable=yes'); return false;"
                                       title="View Cisco Security Advisory">${ciscoId}</a>`;
                        }
                    }
                    
                    // Fall back to Plugin ID
                    if (params.data.plugin_id) {
                        return `<span class="text-muted">Plugin ${params.data.plugin_id}</span>`;
                    }
                    
                    return "N/A";
                }
            },
            { 
                headerName: "Vulnerability Description", 
                field: "plugin_name",
                colId: "plugin_name",
                flex: 1,
                cellRenderer: (params) => {
                    const value = params.value || "-";
                    
                    // Make description clickable to open vulnerability details modal
                    if (value !== "-") {
                        // Create unique ID for this vulnerability and store data for modal access
                        const vulnDataId = `device_desc_${params.data.hostname}_${params.data.cve || params.data.plugin_id}_${Date.now()}`;
                        if (!window.vulnModalData) {
                            window.vulnModalData = {};
                        }
                        window.vulnModalData[vulnDataId] = params.data;
                        
                        return `<a href="#" class="ag-grid-link" title="${value}" onclick="vulnManager.viewVulnerabilityDetails('${vulnDataId}')">${value}</a>`;
                    }
                    return `<span title="${value}">${value}</span>`;
                }
            }
        ];

        // Detect current theme for v33 theming
        const currentTheme = this.detectCurrentTheme();
        const _isDarkMode = currentTheme === "dark";  // Prefixed with _ to indicate intentionally unused

        const deviceGridOptions = {
            theme: window.agGridThemeManager ? window.agGridThemeManager.getCurrentTheme() : null, // AG-Grid v33 theme configuration
            columnDefs: deviceColumnDefs,
            rowData: device.vulnerabilities,
            defaultColDef: {
                resizable: true,
                sortable: true,
                filter: true,
                wrapHeaderText: false,
                autoHeaderHeight: false
            },
            pagination: true,
            paginationPageSize: 25,
            paginationPageSizeSelector: false, // Remove page size dropdown for fixed-height modal
            animateRows: true,
            // Default sort: Last Seen descending (most recent first)
            // AG-Grid will handle secondary sorting naturally
            initialState: {
                sort: {
                    sortModel: [
                        { colId: "last_seen", sort: "desc" }
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
                text: "Open Ticket",
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