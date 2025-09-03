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
    const isTablet = window.innerWidth >= 768 && window.innerWidth < 1200;
    const isMobile = window.innerWidth < 768;
    
    const columnDefs = [
        {
            headerName: "Last Seen",
            field: "last_seen",
            sortable: true,
            filter: "agDateColumnFilter",
            width: isDesktop ? 120 : isTablet ? 100 : 80,
            minWidth: 80,
            maxWidth: 130,
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
            headerName: "Hostname",
            field: "hostname",
            sortable: true,
            filter: true,
            width: isDesktop ? 180 : isTablet ? 140 : 120,
            minWidth: 100,
            maxWidth: 200,
            cellRenderer: (params) => {
                const hostname = params.value || "-";
                return `<a href="#" class="fw-bold text-primary text-decoration-none" onclick="vulnManager.viewDeviceDetails('${hostname}')">${hostname}</a>`;
            }
        },
        {
            headerName: "IP Address",
            field: "ip_address",
            sortable: true,
            filter: true,
            width: isDesktop ? 140 : 120,
            minWidth: 100,
            maxWidth: 150,
            hide: isMobile,
        },
        {
            headerName: "Severity",
            field: "severity",
            sortable: true,
            filter: true,
            width: isDesktop ? 110 : isTablet ? 100 : 90,
            minWidth: 80,
            maxWidth: 120,
            cellRenderer: (params) => {
                const severity = params.value || "Low";
                const className = `severity-${severity.toLowerCase()}`;
                return `<span class="severity-badge ${className}">${severity}</span>`;
            }
        },
        {
            headerName: "CVE",
            field: "cve",
            sortable: true,
            filter: true,
            width: isDesktop ? 150 : isTablet ? 130 : 110,
            minWidth: 90,
            maxWidth: 160,
            hide: isMobile,
            cellRenderer: (params) => {
                if (params.value && params.value.startsWith("CVE-")) {
                    return `<a href="#" class="text-decoration-none" onclick="vulnManager.lookupCVE('${params.value}')">${params.value}</a>`;
                }
                return params.value || "-";
            }
        },
        {
            headerName: "Vendor",
            field: "vendor",
            sortable: true,
            filter: true,
            width: isDesktop ? 120 : 100,
            minWidth: 80,
            maxWidth: 140,
            hide: !isDesktop,
        },
        {
            headerName: isMobile ? "Description" : "Vulnerability Description",
            field: "plugin_name",
            sortable: true,
            filter: true,
            flex: 1,
            minWidth: isMobile ? 200 : isTablet ? 250 : 300,
            maxWidth: 600,
            wrapText: true,
            autoHeight: true,
            cellRenderer: (params) => params.value || "-",
        },
        {
            headerName: "VPR",
            field: "vpr_score",
            sortable: true,
            filter: "agNumberColumnFilter",
            width: isDesktop ? 90 : isTablet ? 80 : 70,
            minWidth: 60,
            maxWidth: 100,
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
        paginationPageSize: 50,
        paginationPageSizeSelector: [25, 50, 100, 200],
        suppressColumnVirtualisation: true,
        suppressHorizontalScroll: false,
        
        onGridReady: (params) => {
            // Responsive column management on resize
            window.addEventListener("resize", debounce(() => {
                if (componentContext.gridApi) {
                    // Auto-size columns to fit viewport
                    componentContext.gridApi.sizeColumnsToFit();
                    
                    // Update column visibility based on screen size
                    updateColumnVisibility(params.api);
                }
            }, 200));
            
            // Initial column fitting
            setTimeout(() => {
                if (componentContext.gridApi) {
                    componentContext.gridApi.sizeColumnsToFit();
                }
            }, 100);
        },

        onFirstDataRendered: (params) => {
            if (componentContext.gridApi) {
                // Auto-size all columns to fit content and viewport
                componentContext.gridApi.sizeColumnsToFit();
                updateColumnVisibility(params.api);
            }
        },

        onGridSizeChanged: (params) => {
            // Auto-fit columns when grid container changes size
            if (params.api) {
                params.api.sizeColumnsToFit();
                updateColumnVisibility(params.api);
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
