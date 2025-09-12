/**
 * AG Grid Responsive Configuration for HexTrackr
 * 
 * This module provides responsive AG Grid configuration for vulnerability management.
 * Extracted from inline JavaScript for better code organization and maintainability.
 * 
 * @fileoverview AG Grid responsive configuration utilities
 * @author HexTrackr Development Team
 * @version 1.0.0
 */

/* global window, setTimeout, clearTimeout, module */

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
 * @returns {GridOptions} A complete AG Grid `gridOptions` object.
 */
function createVulnerabilityGridOptions(componentContext) {
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
            aggFunc: "sum",
            enableValue: true,
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
                return `<a href="#" class="fw-bold text-primary text-decoration-none" style="cursor: pointer;">${hostname}</a>`;
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
                return ip !== "N/A" ? `<code class="text-muted small">${ip}</code>` : "<span class=\"text-muted\">N/A</span>";
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
            minWidth: 110,
            maxWidth: 180,
            resizable: true,
            hide: isMobile,
            cellRenderer: (params) => {
                const cve = params.value;
                const pluginName = params.data.plugin_name;
                
                // Simple single CVE handling (records are now split during import)
                if (cve && cve.startsWith("CVE-")) {
                    return `<a href="#" class="text-decoration-none" onclick="event.preventDefault(); event.stopPropagation(); vulnManager.showVulnerabilityDetailsByCVE('${cve}'); return false;">${cve}</a>`;
                }
                
                // Check for Cisco SA ID
                if (cve && cve.startsWith("cisco-sa-")) {
                    return `<a href="#" class="text-decoration-none text-warning" onclick="event.preventDefault(); event.stopPropagation(); vulnManager.showVulnerabilityDetailsByCVE('${cve}'); return false;">${cve}</a>`;
                }
                
                // Check for Cisco SA ID in plugin name (fallback)
                if (pluginName && typeof pluginName === "string") {
                    const ciscoSaMatch = pluginName.match(/cisco-sa-([a-zA-Z0-9-]+)/i);
                    if (ciscoSaMatch) {
                        const ciscoId = `cisco-sa-${ciscoSaMatch[1]}`;
                        return `<a href="#" class="text-decoration-none text-warning" onclick="event.preventDefault(); event.stopPropagation(); vulnManager.showVulnerabilityDetailsByCVE('${ciscoId}'); return false;">${ciscoId}</a>`;
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
            width: 350,
            minWidth: 200,
            maxWidth: 600,
            resizable: true,
            wrapText: false,
            autoHeight: false,
            cellClass: "ag-cell-wrap-text",
            cellStyle: {
                "white-space": "nowrap",
                "overflow": "hidden",
                "text-overflow": "ellipsis"
            },
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
                    
                    return `<a href="#" class="text-decoration-none text-dark" style="cursor: pointer;" title="${value}" onclick="vulnManager.viewVulnerabilityDetails('${vulnDataId}')">${value}</a>`;
                }
                return `<span title="${value}">${value}</span>`;
            },
        }
    ];

    const gridOptions = {
        columnDefs: columnDefs,
        rowData: [],
        defaultColDef: {
            resizable: true,
            sortable: true,
            filter: true,
            wrapHeaderText: true,
            autoHeaderHeight: true,
        },
        animateRows: true,
        rowSelection: "multiple",
        suppressRowClickSelection: true,
        pagination: true,
        paginationPageSize: 10,
        paginationPageSizeSelector: [10, 25, 50, 100, 200],
        
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
        
        // Enhanced features for requirements
        enableRangeSelection: true,
        enableRangeHandle: true,
        enableFillHandle: true,
        
        // Column sizing enhancements
        maintainColumnOrder: true,
        enableColResize: true,
        suppressAutoSize: false,
        skipHeaderOnAutoSize: false,
        
        onGridReady: (params) => {
            // Store API reference for container height management
            componentContext.gridApi = params.api;
            componentContext.columnApi = params.columnApi;
            
            // Note: Height management simplified - let AG-Grid domLayout: 'autoHeight' handle sizing
            
            // Responsive column management on resize
            window.addEventListener("resize", debounce(() => {
                if (componentContext.gridApi) {
                    // Update column visibility based on screen size
                    updateColumnVisibility(params.api);
                }
            }, 200));
            
            // Set initial column visibility
            setTimeout(() => {
                if (componentContext.gridApi) {
                    updateColumnVisibility(params.api);
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
            }
        },

        onGridSizeChanged: (params) => {
            // Update column visibility when grid container changes size
            if (params.api) {
                updateColumnVisibility(params.api);
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

    // Note: Container height management functions removed
    // AG-Grid domLayout: 'autoHeight' now handles all height management automatically

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
