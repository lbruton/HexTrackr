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
            headerName: "Last Seen",
            field: "last_seen",
            sortable: true,
            filter: "agDateColumnFilter",
            width: 120,
            minWidth: 100,
            maxWidth: 150,
            resizable: true,
            cellRenderer: (params) => {
                // Priority: last_seen date (if available) → scan_date (fallback)
                const lastSeen = params.data.last_seen;
                const scanDate = params.data.scan_date;
                
                if (lastSeen && lastSeen.trim() !== "") {
                    return new Date(lastSeen).toLocaleDateString();
                } else if (scanDate && scanDate.trim() !== "") {
                    return new Date(scanDate).toLocaleDateString();
                }
                return "-";
            },
            hide: isMobile,
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
            headerName: "KEV",
            field: "isKev",
            sortable: true,
            filter: true,
            width: 110,
            minWidth: 110,
            maxWidth: 140,
            resizable: true,
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
            headerName: "Vendor",
            field: "vendor",
            sortable: true,
            filter: true,
            width: 120,
            minWidth: 100,
            maxWidth: 160,
            resizable: true,
            hide: !isDesktop,
        },
        {
            headerName: "Vulnerability",
            field: "cve",
            sortable: true,
            filter: true,
            width: 150,
            minWidth: 140,
            maxWidth: 200,
            resizable: true,
            hide: isMobile,
            cellRenderer: (params) => {
                const cve = params.value;
                const pluginName = params.data.plugin_name;

                // Simple single CVE handling - open external CVE link in popup
                if (cve && cve.startsWith("CVE-")) {
                    const cveUrl = `https://cve.mitre.org/cgi-bin/cvename.cgi?name=${cve}`;
                    return `<a href="#" class="link-primary"
                               onclick="window.open('${cveUrl}', 'cve_popup', 'width=1200,height=1200,scrollbars=yes,resizable=yes'); return false;"
                               title="View CVE details on MITRE">${cve}</a>`;
                }

                // Check for Cisco SA ID - open external Cisco Security Advisory in popup
                if (cve && cve.startsWith("cisco-sa-")) {
                    const ciscoUrl = `https://sec.cloudapps.cisco.com/security/center/content/CiscoSecurityAdvisory/${cve}`;
                    return `<a href="#" class="link-primary text-warning"
                               onclick="window.open('${ciscoUrl}', 'cisco_popup', 'width=1200,height=1200,scrollbars=yes,resizable=yes'); return false;"
                               title="View Cisco Security Advisory">${cve}</a>`;
                }

                // Check for Cisco SA ID in plugin name (fallback) - open external link in popup
                if (pluginName && typeof pluginName === "string") {
                    const ciscoSaMatch = pluginName.match(/cisco-sa-([a-zA-Z0-9-]+)/i);
                    if (ciscoSaMatch) {
                        const ciscoId = `cisco-sa-${ciscoSaMatch[1]}`;
                        const ciscoUrl = `https://sec.cloudapps.cisco.com/security/center/content/CiscoSecurityAdvisory/${ciscoId}`;
                        return `<a href="#" class="link-primary text-warning"
                                   onclick="window.open('${ciscoUrl}', 'cisco_popup', 'width=1200,height=1200,scrollbars=yes,resizable=yes'); return false;"
                                   title="View Cisco Security Advisory">${ciscoId}</a>`;
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
            headerName: "Vulnerability Description",
            field: "plugin_name",
            sortable: true,
            filter: true,
            flex: 1, // Allow this column to grow to fill available space
            minWidth: 250,
            resizable: true,
            wrapText: true, // Enable text wrapping
            autoHeight: true, // Allow row height to adjust to content
            cellClass: "ag-cell-wrap-text",
            cellRenderer: (params) => {
                const value = params.value || "-";
                
                // Create a clickable link that opens the vulnerability details modal for this specific vulnerability
                if (value !== "-") {
                    // Create a unique ID for this vulnerability row to store in vulnModalData
                    const vulnDataId = `vuln_${params.data.hostname}_${params.data.cve || params.data.plugin_id}_${Date.now()}`;
                    
                    // Store the vulnerability data for modal access
                    if (!window.vulnModalData) {
                        window.vulnModalData = {};
                    }
                    window.vulnModalData[vulnDataId] = params.data;
                    
                    return `<a href="#" class="ag-grid-link" title="${value}" onclick="vulnManager.viewVulnerabilityDetails('${vulnDataId}'); return false;">${value}</a>`;
                }
                return `<span title="${value}">${value}</span>`;
            },
        }
    ];

    // Create proper AG-Grid v33 Quartz theme configuration based on dark mode
    let quartzTheme = null;
    if (typeof window.agGrid !== "undefined" && window.agGrid.themeQuartz) {
        if (isDarkMode) {
            // Updated dark theme with EXACT colors from AG-Grid Theme Builder
            quartzTheme = window.agGrid.themeQuartz.withParams({
                backgroundColor: "#0F1C31", // Dark navy background - EXACT
                foregroundColor: "#FFF", // Pure white text for better contrast
                browserColorScheme: "dark",
                chromeBackgroundColor: "#202c3f", // EXACT header color (no mixing function)
                headerBackgroundColor: "#202c3f", // EXACT header color #202c3f as specified
                headerTextColor: "#FFF",
                headerFontSize: 14,
                oddRowBackgroundColor: "rgba(255, 255, 255, 0.02)",
                rowBorder: false,
                headerRowBorder: false,
                columnBorder: false,
                borderColor: "#2a3f5f", // Subtle navy border
                selectedRowBackgroundColor: "#2563eb", // Bright blue for selection
                rowHoverColor: "rgba(37, 99, 235, 0.15)", // Blue hover effect
                rangeSelectionBackgroundColor: "rgba(37, 99, 235, 0.2)"
            });
        } else {
            // Light mode Quartz theme - matching AG-Grid Theme Builder  
            quartzTheme = window.agGrid.themeQuartz.withParams({
                backgroundColor: "#ffffff",
                foregroundColor: "#2d3748",
                chromeBackgroundColor: "#f7fafc",
                headerBackgroundColor: "#edf2f7",
                headerTextColor: "#2d3748",
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

    const gridOptions = {
        theme: quartzTheme, // AG-Grid v33 proper Quartz theme configuration
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
