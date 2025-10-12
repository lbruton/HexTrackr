/**
 * AG Grid Responsive Configuration for HexTrackr
 * 
 * This module provides responsive AG Grid configuration for vulnerability management.
 * Extracted from inline JavaScript for better code organization and maintainability.
 * 
 * @fileoverview AG Grid responsive configuration utilities with v33 theming support
 * @author HexTrackr Development Team
 * @version 2.0.0 - AG-Grid v33 Quartz theme integration
 */

/* global window, setTimeout, clearTimeout, module */

// AG-Grid theme available as agGrid.themeQuartz global

/**
 * Debounce function to limit the rate at which a function gets called.
 * This is crucial for performance on events that fire rapidly, like window resize.
 * @param {Function} func - The function to debounce.
 * @param {number} delay - The debounce delay in milliseconds.
 * @returns {Function} The debounced function.
 */
function debounce(func, delay) {
    let timeout;
    return function(...args) {
        const context = this;
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(context, args), delay);
    };
}


/**
 * Creates and returns the complete AG Grid configuration object.
 * @param {object} componentContext - The "this" context of the calling component (e.g., ModernVulnManager)
 *                                    to access its methods and properties like `gridApi`.
 * @param {boolean} isDarkMode - Whether to use dark mode theme (optional)
 * @param {boolean} usePagination - Whether to use built-in AG-Grid pagination (default: true)
 * @returns {GridOptions} A complete AG Grid `gridOptions` object.
 */
function createVulnerabilityGridOptions(componentContext, isDarkMode = false, usePagination = true) {
    // Column definitions with optimized responsive width management
    const isDesktop = window.innerWidth >= 1200;
    const isMobile = window.innerWidth < 768;
    
    const columnDefs = [
        {
            headerName: "First Seen",
            field: "first_seen",
            sortable: true,
            filter: "agDateColumnFilter",
            width: 120,
            minWidth: 100,
            maxWidth: 150,
            resizable: true,
            cellRenderer: (params) => {
                return params.value ? new Date(params.value).toLocaleDateString() : "-";
            },
            hide: isMobile,
        },
        {
            headerName: "Vendor",
            field: "vendor",
            sortable: true,
            filter: true,
            width: 90,
            minWidth: 80,
            maxWidth: 120,
            resizable: true,
            hide: !isDesktop,
            cellRenderer: (params) => {
                const vendor = params.value || "Other";
                const badgeColors = {
                    "CISCO": "primary",      // Blue
                    "Palo Alto": "warning",  // Orange
                    "Other": "secondary"     // Gray
                };
                const color = badgeColors[vendor] || "secondary";
                return `<span class="badge bg-${color}">${vendor}</span>`;
            },
            cellStyle: {
                textAlign: "center"
            }
        },
        {
            headerName: "Hostname",
            field: "hostname",
            sortable: true,
            filter: true,
            width: 180,
            minWidth: 120,
            maxWidth: 250,
            resizable: true,
            cellRenderer: (params) => {
                const hostname = params.value || "-";
                return `<a href="#" class="fw-bold link-primary" style="cursor: pointer;">${hostname}</a>`;
            }
        },
        {
            headerName: "IP Address",
            field: "ip_address",
            sortable: true,
            filter: true,
            width: 140,
            minWidth: 110,
            maxWidth: 180,
            resizable: true,
            hide: isMobile,
            cellRenderer: (params) => {
                const ip = params.value || "N/A";
                return ip !== "N/A" ? `<code class="text-muted-var small">${ip}</code>` : "<span class=\"text-muted-var\">N/A</span>";
            }
        },
        {
            headerName: "Installed",
            field: "operating_system",
            sortable: true,
            filter: true,
            width: 120,
            minWidth: 100,
            maxWidth: 150,
            resizable: true,
            hide: isMobile,
            cellRenderer: (params) => {
                const os = params.value || "N/A";
                const className = os !== "N/A" ? "text-info" : "text-muted";

                // Extract version number from OS string (remove prefixes like "Cisco IOS", "IOS XE", etc.)
                let displayVersion = os;
                if (os !== "N/A") {
                    // Match version patterns like: 15.2(7)E, 16.9(4), 17.3.1
                    const versionMatch = os.match(/(\d+\.\d+(?:\.\d+)?(?:\(\d+\))?[A-Z]*)/);
                    if (versionMatch) {
                        displayVersion = versionMatch[1];
                    }
                }

                return `<span class="font-monospace ${className} small">${displayVersion}</span>`;
            }
        },
        {
            headerName: "Fixed",
            field: "fixed_version",
            sortable: true,
            filter: true,
            width: 150,
            minWidth: 120,
            maxWidth: 180,
            resizable: true,
            hide: isMobile,
            cellRenderer: (params) => {
                const cveId = params.data.cve;
                const vendor = params.data.vendor;
                const cellId = `fixed-ver-${params.node.id}`;

                // Async lookup in setTimeout (non-blocking)
                setTimeout(async () => {
                    const cell = document.getElementById(cellId);
                    if (!cell) return;

                    // Only Cisco devices get fixed version lookup
                    if (!vendor || !vendor.toLowerCase().includes('cisco')) {
                        cell.innerHTML = `<span class="font-monospace text-muted small">N/A</span>`;
                        params.node.setDataValue('fixed_version', 'N/A');  // Update AG-Grid data model for search
                        return;
                    }

                    if (!window.ciscoAdvisoryHelper) {
                        cell.innerHTML = `<span class="font-monospace text-muted small">N/A</span>`;
                        params.node.setDataValue('fixed_version', 'N/A');
                        return;
                    }

                    try {
                        const installedVersion = params.data.operating_system;
                        const fixedVersion = await window.ciscoAdvisoryHelper.getFixedVersion(
                            cveId, vendor, installedVersion
                        );

                        if (fixedVersion) {
                            cell.innerHTML = `<span class="font-monospace text-success small">${DOMPurify.sanitize(fixedVersion)}+</span>`;
                            params.node.setDataValue('fixed_version', fixedVersion);  // Update AG-Grid data model
                        } else {
                            cell.innerHTML = `<span class="font-monospace text-muted small">No Fix</span>`;
                            params.node.setDataValue('fixed_version', 'No Fix');
                        }
                    } catch (error) {
                        cell.innerHTML = `<span class="font-monospace text-muted small">Error</span>`;
                        params.node.setDataValue('fixed_version', 'Error');
                    }
                }, 0);

                // Return placeholder while async lookup runs
                return `<span id="${cellId}" class="font-monospace text-muted small">...</span>`;
            }
        },
        {
            headerName: "Vulnerability",
            field: "cve",
            sortable: true,
            filter: true,
            width: 160,
            minWidth: 150,
            maxWidth: 220,
            resizable: true,
            hide: isMobile,
            cellRenderer: (params) => {
                const cve = params.value;
                const pluginName = params.data.plugin_name;
                const isKev = params.data.isKev === "Yes";

                // KEV indicator via red text color (no badge)
                const kevClass = isKev ? "text-danger fw-bold" : "link-primary";
                const kevTitle = isKev ? "Known Exploited Vulnerability - " : "";

                // Create unique ID for vulnerability modal data storage
                const vulnDataId = `vuln_${params.data.hostname}_${cve || params.data.plugin_id}_${Date.now()}`;
                if (!window.vulnModalData) {
                    window.vulnModalData = {};
                }
                window.vulnModalData[vulnDataId] = params.data;

                // Single CVE handling - open vulnerability details modal
                if (cve && cve.startsWith("CVE-")) {
                    return `<a href="#" class="${kevClass}"
                               onclick="vulnManager.viewVulnerabilityDetails('${vulnDataId}'); return false;"
                               title="${kevTitle}View vulnerability details">${cve}</a>`;
                }

                // Cisco SA ID - open vulnerability details modal
                if (cve && cve.startsWith("cisco-sa-")) {
                    return `<a href="#" class="${kevClass}"
                               onclick="vulnManager.viewVulnerabilityDetails('${vulnDataId}'); return false;"
                               title="${kevTitle}View Cisco Security Advisory details">${cve}</a>`;
                }

                // Cisco SA ID in plugin name (fallback) - open vulnerability details modal
                if (pluginName && typeof pluginName === "string") {
                    const ciscoSaMatch = pluginName.match(/cisco-sa-([a-zA-Z0-9-]+)/i);
                    if (ciscoSaMatch) {
                        const ciscoId = `cisco-sa-${ciscoSaMatch[1]}`;
                        return `<a href="#" class="${kevClass}"
                                   onclick="vulnManager.viewVulnerabilityDetails('${vulnDataId}'); return false;"
                                   title="${kevTitle}View Cisco Security Advisory details">${ciscoId}</a>`;
                    }
                }

                // Fall back to Plugin ID
                if (params.data.plugin_id) {
                    return `<span class="text-muted">Plugin ${params.data.plugin_id}</span>`;
                }

                return "-";
            }
        },
        {
            headerName: "VPR",
            field: "vpr_score",
            sortable: true,
            filter: "agNumberColumnFilter",
            width: 90,
            minWidth: 70,
            maxWidth: 120,
            resizable: true,
            cellRenderer: (params) => {
                const score = parseFloat(params.value) || 0;
                let className = "severity-low";
                if (score >= 9.0) {
                    className = "severity-critical";
                } else if (score >= 7.0) {
                    className = "severity-high";
                } else if (score >= 4.0) {
                    className = "severity-medium";
                }
                return `<span class="severity-badge ${className}">${score.toFixed(1)}</span>`;
            }
        },
        {
            headerName: "Severity",
            field: "severity",
            sortable: true,
            filter: true,
            width: 110,
            minWidth: 90,
            maxWidth: 140,
            resizable: true,
            cellRenderer: (params) => {
                const severity = params.value || "Low";
                const className = `severity-${severity.toLowerCase()}`;
                return `<span class="severity-badge ${className}">${severity}</span>`;
            }
        },
        {
            headerName: "Info",
            field: "info_icon",
            sortable: false,
            filter: false,
            width: 60,
            minWidth: 50,
            maxWidth: 80,
            resizable: false,
            suppressHeaderMenuButton: true,  // Remove filter icon from header
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

    // Use centralized AGGridThemeManager for consistent theming across all grids
    // This is the single source of truth - edit ag-grid-theme-manager.js for theme changes
    const gridOptions = {
        theme: window.agGridThemeManager ? window.agGridThemeManager.getCurrentTheme() : null, // AG-Grid v33 centralized theme
        columnDefs: columnDefs,
        rowData: [],
        defaultColDef: {
            resizable: true,
            sortable: true,
            filter: true,
            wrapHeaderText: false,
            autoHeaderHeight: false,
        },
        animateRows: true,
        // Pagination configuration - controlled by usePagination parameter
        pagination: usePagination,
        paginationPageSize: usePagination ? 10 : undefined,
        paginationPageSizeSelector: usePagination ? [10, 25, 50, 100, 200] : undefined,

        // Enable auto-height to let pagination control vertical display
        domLayout: "autoHeight",
        
        // Enhanced horizontal scrolling support
        suppressColumnVirtualisation: false,
        suppressHorizontalScroll: false,
        suppressScrollOnNewData: true,
        alwaysShowHorizontalScroll: false,
        
        // Single-row display optimizations
        rowHeight: 42,
        suppressRowTransform: false,
        
        // Enhanced features for requirements (Community edition only)
        // enableRangeSelection: true, // Enterprise feature - removed
        // enableRangeHandle: true, // Enterprise feature - removed
        // enableFillHandle: true, // Enterprise feature - removed
        
        // Column sizing enhancements
        maintainColumnOrder: true,
        // Note: Column resizing controlled by defaultColDef.resizable (already set to true)
        suppressAutoSize: false,
        skipHeaderOnAutoSize: false,
        
        onGridReady: (params) => {
            // Responsive column management on resize
            window.addEventListener("resize", debounce(() => {
                if (componentContext.gridApi) {
                    // Update column visibility based on screen size
                    updateColumnVisibility(params.api);
                    // Ensure columns fill available width after resize
                    params.api.sizeColumnsToFit();
                }
            }, 200));

            // Set initial column visibility and sizing
            setTimeout(() => {
                if (componentContext.gridApi) {
                    updateColumnVisibility(params.api);
                    // Ensure columns fill available width on initial load
                    params.api.sizeColumnsToFit();
                }
            }, 100);
        },

        onCellClicked: (params) => {
            // Secure event handling for hostname clicks
            if (params.column.getColId() === "hostname" && params.data && componentContext.viewDeviceDetails) {
                componentContext.viewDeviceDetails(params.data.hostname);
            }
        },

        onFirstDataRendered: (params) => {
            if (componentContext.gridApi) {
                // Update column visibility based on screen size
                updateColumnVisibility(params.api);
                // Ensure columns fill available width when data is first rendered
                params.api.sizeColumnsToFit();

                // HEX-170: Initialize footer with database metadata on first data render
                if (typeof componentContext.updatePaginationInfo === "function") {
                    const totalRows = params.api.getDisplayedRowCount();
                    const currentPage = params.api.paginationGetCurrentPage();
                    const pageSize = params.api.paginationGetPageSize();
                    componentContext.updatePaginationInfo(totalRows, currentPage, pageSize);
                }
            }
        },

        onGridSizeChanged: (params) => {
            // Update column visibility when grid container changes size
            if (params.api) {
                updateColumnVisibility(params.api);
                // Ensure columns fill available width when grid size changes
                params.api.sizeColumnsToFit();
            }
        },

        onPaginationChanged: (params) => {
            // Update pagination info when page size or page changes
            if (componentContext && typeof componentContext.updatePaginationInfo === "function") {
                const totalRows = params.api.getDisplayedRowCount();
                const currentPage = params.api.paginationGetCurrentPage();
                const pageSize = params.api.paginationGetPageSize();
                componentContext.updatePaginationInfo(totalRows, currentPage, pageSize);
            }
        },
    };

    // Helper function to update column visibility based on screen size
    function updateColumnVisibility(api) {
        const gridWidth = window.innerWidth;
        const breakpoints = { small: 768, large: 1200 };
        
        const allColumns = api.getColumns();
        if (!allColumns) {
            return;
        }

        const columnsToShow = [];
        const columnsToHide = [];

        allColumns.forEach(column => {
            const colId = column.getColId();
            switch (colId) {
                case "last_seen":
                    gridWidth < breakpoints.small ? columnsToHide.push(colId) : columnsToShow.push(colId);
                    break;
                case "ip_address":
                case "cve":
                    gridWidth < breakpoints.small ? columnsToHide.push(colId) : columnsToShow.push(colId);
                    break;
                case "vendor":
                    gridWidth < breakpoints.large ? columnsToHide.push(colId) : columnsToShow.push(colId);
                    break;
                default:
                    columnsToShow.push(colId);
                    break;
            }
        });

        api.setColumnsVisible(columnsToShow, true);
        api.setColumnsVisible(columnsToHide, false);
    }

    return gridOptions;
}

// Export functions for module usage
if (typeof module !== "undefined" && module.exports) {
    module.exports = {
        debounce,
        createVulnerabilityGridOptions
    };
}

// Global exposure for legacy usage
window.debounce = debounce;
window.createVulnerabilityGridOptions = createVulnerabilityGridOptions;
