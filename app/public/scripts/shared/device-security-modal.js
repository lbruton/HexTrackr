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
        console.log("DeviceSecurityModal initialized");
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

        // Generate device report button
        const generateDeviceReport = document.getElementById("generateDeviceReport");
        if (generateDeviceReport) {
            generateDeviceReport.addEventListener("click", () => {
                this.generateDeviceReport();
            });
        }
    }

    /**
     * Display device details in the modal with enhanced UI
     * @param {string} hostname - The hostname of the device to display
     * @param {Object} dataManager - The data manager instance for getting device data
     */
    showDeviceDetails(hostname, dataManager) {
        const device = dataManager.getDeviceByHostname(hostname);
        if (!device) {
            console.error("Device not found:", hostname);
            return;
        }

        this.currentDevice = device;
        this.populateDeviceInfo(device);
        this.populateVprSummary(device);
        this.createDeviceVulnerabilityGrid(device);
        this.showModal();
    }

    /**
     * Populate device information section
     * @param {Object} device - The device data object
     */
    populateDeviceInfo(device) {
        document.getElementById("deviceInfo").innerHTML = `
            <div class="mb-3">
                <div class="row">
                    <div class="col-sm-4 text-muted">Hostname:</div>
                    <div class="col-sm-8 fw-bold">${device.hostname}</div>
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
                width: 120,
                cellRenderer: (params) => {
                    return params.value ? new Date(params.value).toLocaleDateString() : "N/A";
                }
            },
            {
                headerName: "Last Seen",
                field: "last_seen",
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
                headerName: "KEV",
                field: "isKev",
                width: 80,
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
                headerName: "VPR",
                field: "vpr_score",
                width: 80,
                cellRenderer: (params) => {
                    const score = params.value || 0;
                    const severityClass = this.getVprSeverityClass(score);
                    return `<span class="severity-badge severity-${severityClass}">${score.toFixed(1)}</span>`;
                }
            },
            {
                headerName: "Severity",
                field: "severity",
                width: 100,
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
                headerName: "Vulnerability",
                field: "cve",
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
                filter: true
            },
            pagination: true,
            paginationPageSize: 25,
            paginationPageSizeSelector: false, // Remove page size dropdown for fixed-height modal
            animateRows: true,
            // Default sort order: Last Seen (desc), Severity, VPR (desc), KEV (desc), Hostname
            initialState: {
                sort: {
                    sortModel: [
                        { colId: "last_seen", sort: "desc" },
                        { colId: "severity", sort: "asc" },
                        { colId: "vpr_score", sort: "desc" },
                        { colId: "isKev", sort: "desc" }
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
     * Generate device report in a popup window with print capabilities
     */
    generateDeviceReport() {
        const modal = document.getElementById("deviceModal");
        if (!modal.classList.contains("show")) {
            this.showToast("No device modal is currently open", "warning");
            return;
        }

        if (!this.currentDevice) {
            this.showToast("No device data available for report generation", "warning");
            return;
        }

        const device = this.currentDevice;
        const reportWindow = window.open("", "_blank", "width=1200,height=800,scrollbars=yes,resizable=yes");
        
        if (!reportWindow) {
            this.showToast("Popup blocked. Please allow popups for this site.", "error");
            return;
        }

        const reportContent = this.generateReportHTML(device);
        reportWindow.document.write(reportContent);
        reportWindow.document.close();
        
        // Add event listeners after content is loaded
        reportWindow.addEventListener("load", () => {
            this.setupReportWindowControls(reportWindow);
        });

        this.showToast("Device security report generated successfully", "success");
    }

    /**
     * Generate HTML content for the device report
     * @param {Object} device - The device data object
     * @returns {string} HTML content for the report
     */
    generateReportHTML(device) {
        const timestamp = new Date().toLocaleString();
        
        return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Device Security Report - ${device.hostname}</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://cdn.jsdelivr.net/npm/@tabler/icons@1.119.0/icons-sprite.svg" rel="stylesheet">
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
        .severity-badge { padding: 0.25rem 0.5rem; border-radius: 0.375rem; font-weight: 500; font-size: 0.75rem; }
        .severity-critical { background-color: #dc3545; color: white; }
        .severity-high { background-color: #fd7e14; color: white; }
        .severity-medium { background-color: #ffc107; color: #000; }
        .severity-low { background-color: #198754; color: white; }
        .no-print { display: block; }
        @media print {
            .no-print { display: none !important; }
            body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
            .page-break { page-break-before: always; }
        }
        .report-header { border-bottom: 3px solid #0054a6; padding-bottom: 1rem; margin-bottom: 2rem; }
        .summary-card { border-left: 4px solid #0054a6; }
        .vpr-card { margin-bottom: 1rem; }
        .table-responsive { max-height: 600px; overflow-y: auto; }
    </style>
</head>
<body>
    <div class="container-fluid">
        <div class="no-print sticky-top bg-white border-bottom p-3 mb-3">
            <div class="d-flex justify-content-between align-items-center">
                <h1 class="h4 mb-0">Device Security Report - ${device.hostname}</h1>
                <div>
                    <button type="button" class="btn btn-outline-primary me-2" onclick="window.print()">
                        <i class="ti ti-printer me-1"></i>Print Report
                    </button>
                    <button type="button" class="btn btn-outline-success me-2" onclick="savePDF()">
                        <i class="ti ti-file-text me-1"></i>Save as PDF
                    </button>
                    <button type="button" class="btn btn-outline-secondary" onclick="window.close()">
                        <i class="ti ti-x me-1"></i>Close
                    </button>
                </div>
            </div>
        </div>

        <div class="report-header">
            <div class="row">
                <div class="col-md-8">
                    <h1 class="display-6 text-primary">Device Security Report</h1>
                    <h2 class="h4 text-muted">${device.hostname}</h2>
                </div>
                <div class="col-md-4 text-end">
                    <p class="mb-0"><strong>Generated:</strong> ${timestamp}</p>
                    <p class="mb-0"><strong>Report Type:</strong> Comprehensive Security Analysis</p>
                </div>
            </div>
        </div>

        <div class="row mb-4">
            <div class="col-md-6">
                <div class="card summary-card h-100">
                    <div class="card-header">
                        <h3 class="card-title">Device Summary</h3>
                    </div>
                    <div class="card-body">
                        <table class="table table-borderless">
                            <tr><th width="40%">Hostname:</th><td>${device.hostname}</td></tr>
                            <tr><th>Total Vulnerabilities:</th><td><span class="badge bg-secondary">${device.totalCount}</span></td></tr>
                            <tr><th>Total VPR Score:</th><td><span class="severity-badge severity-${this.getVprSeverityClass(device.totalVPR || 0)}">${(device.totalVPR || 0).toFixed(1)}</span></td></tr>
                            <tr><th>Risk Level:</th><td>
                                ${device.criticalCount > 0 ? "<span class=\"badge bg-danger\">Critical Risk</span>" :
                                  device.highCount > 5 ? "<span class=\"badge bg-warning\">High Risk</span>" :
                                  device.mediumCount > 10 ? "<span class=\"badge bg-info\">Medium Risk</span>" :
                                  "<span class=\"badge bg-success\">Low Risk</span>"}
                            </td></tr>
                        </table>
                    </div>
                </div>
            </div>
            <div class="col-md-6">
                <div class="card h-100">
                    <div class="card-header">
                        <h3 class="card-title">VPR Risk Breakdown</h3>
                    </div>
                    <div class="card-body">
                        <div class="row g-2">
                            <div class="col-6">
                                <div class="card vpr-card bg-danger bg-opacity-10">
                                    <div class="card-body text-center">
                                        <div class="text-danger h3 mb-1">${device.criticalCount}</div>
                                        <div class="text-muted small">Critical</div>
                                        <div class="text-danger fw-bold">${(device.criticalVPR || 0).toFixed(1)}</div>
                                    </div>
                                </div>
                            </div>
                            <div class="col-6">
                                <div class="card vpr-card bg-warning bg-opacity-10">
                                    <div class="card-body text-center">
                                        <div class="text-warning h3 mb-1">${device.highCount}</div>
                                        <div class="text-muted small">High</div>
                                        <div class="text-warning fw-bold">${(device.highVPR || 0).toFixed(1)}</div>
                                    </div>
                                </div>
                            </div>
                            <div class="col-6">
                                <div class="card vpr-card bg-info bg-opacity-10">
                                    <div class="card-body text-center">
                                        <div class="text-info h3 mb-1">${device.mediumCount}</div>
                                        <div class="text-muted small">Medium</div>
                                        <div class="text-info fw-bold">${(device.mediumVPR || 0).toFixed(1)}</div>
                                    </div>
                                </div>
                            </div>
                            <div class="col-6">
                                <div class="card vpr-card bg-success bg-opacity-10">
                                    <div class="card-body text-center">
                                        <div class="text-success h3 mb-1">${device.lowCount}</div>
                                        <div class="text-muted small">Low</div>
                                        <div class="text-success fw-bold">${(device.lowVPR || 0).toFixed(1)}</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div class="card page-break">
            <div class="card-header">
                <h3 class="card-title">Vulnerability Details</h3>
                <div class="card-subtitle">Complete list of vulnerabilities detected on this device</div>
            </div>
            <div class="card-body p-0">
                <div class="table-responsive">
                    <table class="table table-hover mb-0">
                        <thead class="table-dark">
                            <tr>
                                <th>First Seen</th>
                                <th>VPR</th>
                                <th>Severity</th>
                                <th>Vulnerability</th>
                                <th>Name</th>
                                <th>Port</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${device.vulnerabilities.map(vuln => `
                                <tr>
                                    <td>${vuln.first_seen ? new Date(vuln.first_seen).toLocaleDateString() : "N/A"}</td>
                                    <td><span class="severity-badge severity-${this.getVprSeverityClass(vuln.vpr_score || 0)}">${(vuln.vpr_score || 0).toFixed(1)}</span></td>
                                    <td><span class="severity-badge severity-${(vuln.severity || "Low").toLowerCase()}">${vuln.severity || "Low"}</span></td>
                                    <td>${vuln.cve && (vuln.cve.includes("CVE-") || vuln.cve.includes("cisco-sa-")) && typeof CVEUtilities !== "undefined" ? CVEUtilities.createMultipleCVELinks(vuln.cve, {cssClass: "vulnerability-cve text-decoration-none"}) : (vuln.cve || `Plugin ${vuln.plugin_id}`)}</td>
                                    <td>${vuln.plugin_name || "N/A"}</td>
                                    <td>${vuln.port || "N/A"}</td>
                                </tr>
                            `).join("")}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>

        <footer class="mt-4 pt-3 border-top text-muted text-center">
            <p>Generated by HexTrackr Security Management Platform</p>
        </footer>
    </div>

    <script>
        function savePDF() {
            alert('To save as PDF:\\n\\n1. Click Print Report\\n2. Choose "Save as PDF" as destination\\n3. Configure page settings as needed\\n4. Save to your desired location');
            window.print();
        }
    </script>
</body>
</html>
        `;
    }

    /**
     * Setup controls for the report window
     * @param {Window} reportWindow - The popup report window
     */
    setupReportWindowControls(reportWindow) {
        // Focus the window
        reportWindow.focus();
        
        // Set window title
        reportWindow.document.title = `Device Security Report - ${this.currentDevice.hostname}`;
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
            console.log(`${type.toUpperCase()}: ${message}`);
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