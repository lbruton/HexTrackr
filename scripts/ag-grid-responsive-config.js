/* eslint-env browser */
/* global window, document, setTimeout, console */

/**
 * @fileoverview This file contains the optimal AG Grid configuration for the HexTrackr vulnerabilities table.
 * It includes responsive behavior, auto-sizing columns, and mobile-friendly features.
 * This configuration is designed to be dropped into the existing HexTrackr application.
 * 
 * @version 1.0.0
 * @author GitHub Copilot
 * @date 2025-08-25
 */

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
 * @param {object} componentContext - The 'this' context of the calling component (e.g., ModernVulnManager)
 *                                    to access its methods and properties like `gridApi`.
 * @returns {GridOptions} A complete AG Grid `gridOptions` object.
 */
function createVulnerabilityGridOptions(componentContext) {

    // =================================================================================================
    // COLUMN DEFINITIONS WITH RESPONSIVE BEHAVIOR
    // =================================================================================================
    // - `hide`: Columns are hidden based on initial screen width. This is updated dynamically.
    // - `minWidth`: Ensures columns don't become too small.
    // - `flex: 1`: The 'Vulnerability Description' column will grow to fill available space.
    // =================================================================================================
    const columnDefs = [
        {
            headerName: "Last Seen",
            field: "last_seen",
            sortable: true,
            filter: "agDateColumnFilter",
            width: 120,
            cellRenderer: (params) => params.value ? new Date(params.value).toLocaleDateString() : "-",
            // Responsive setting for small screens
            hide: window.innerWidth < 576,
        },
        {
            headerName: "Hostname",
            field: "hostname",
            sortable: true,
            filter: true,
            width: 180,
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
            width: 140,
            // Responsive setting for medium screens
            hide: window.innerWidth < 992,
        },
        {
            headerName: "Severity",
            field: "severity",
            sortable: true,
            filter: true,
            width: 110,
            cellRenderer: (params) => {
                const severity = params.value || "Low";
                const className = `severity-${severity.toLowerCase()}`;
                return `<span class="severity-badge ${className}">${severity}</span>`;
            }
        },
        {
            headerName: "CVE Info",
            field: "cve",
            sortable: true,
            filter: true,
            width: 150,
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
            width: 120,
            // Responsive setting for medium screens
            hide: window.innerWidth < 992,
        },
        {
            headerName: "Vulnerability Description",
            field: "plugin_name",
            sortable: true,
            filter: true,
            flex: 1, // This column will take up the remaining available space
            minWidth: 250,
            wrapText: true,
            autoHeight: true,
            cellRenderer: (params) => params.value || "-",
        },
        {
            headerName: "VPR",
            field: "vpr_score",
            sortable: true,
            filter: "agNumberColumnFilter",
            width: 90,
            cellRenderer: (params) => {
                const score = parseFloat(params.value) || 0;
                let className = "severity-low";
                if (score >= 9.0) {className = "severity-critical";}
                else if (score >= 7.0) {className = "severity-high";}
                else if (score >= 4.0) {className = "severity-medium";}
                return `<span class="severity-badge ${className}">${score.toFixed(1)}</span>`;
            }
        },
        {
            headerName: "State",
            field: "state",
            sortable: true,
            filter: true,
            width: 100,
            // Responsive setting for small screens
            hide: window.innerWidth < 768,
            cellRenderer: (params) => {
                const state = params.value || "open";
                const className = state === "open" ? "badge bg-warning" : "badge bg-success";
                return `<span class="${className}">${state}</span>`;
            }
        },
        {
            headerName: "Actions",
            field: "actions",
            width: 120,
            cellRenderer: (params) => {
                const id = params.data.id || params.node.rowIndex;
                return `
                    <div class="btn-group" role="group">
                        <button class="btn btn-sm btn-outline-primary" onclick="vulnManager.editVulnerability(${id})" title="Edit"><i class="fas fa-edit"></i></button>
                        <button class="btn btn-sm btn-outline-danger" onclick="vulnManager.deleteVulnerability(${id})" title="Delete"><i class="fas fa-trash"></i></button>
                    </div>
                `;
            }
        }
    ];

    // =================================================================================================
    // GRID OPTIONS CONFIGURATION
    // =================================================================================================
    const gridOptions = {
        columnDefs: columnDefs,
        rowData: [],
        
        // --- CORE GRID FEATURES ---
        defaultColDef: {
            resizable: true,
            sortable: true,
            filter: true,
        },
        animateRows: true,
        rowSelection: "multiple",
        suppressRowClickSelection: true,

        // --- PAGINATION CONFIGURATION ---
        pagination: true,
        paginationPageSize: 50,
        paginationPageSizeSelector: [25, 50, 100, 200],
        
        /**
         * Handles grid initialization.
         */
        onGridReady: (params) => {
            componentContext.gridApi = params.api;
            // Attach the responsive resize listener using a debounced function
            window.addEventListener("resize", debounce(() => {
                if (params.api) {
                    params.api.sizeColumnsToFit();
                }
            }, 200));
        },

        /**
         * Handles the first data render to size columns correctly.
         */
        onFirstDataRendered: (params) => {
            params.api.sizeColumnsToFit();
        },

        /**
         * Dynamically updates column visibility based on the grid's width.
         */
        onGridSizeChanged: (params) => {
            const gridWidth = document.getElementById("vulnGrid").offsetWidth;
            const columnApi = params.columnApi;
            
            // Define breakpoints for showing/hiding columns
            const breakpoints = {
                small: 576,
                medium: 768,
                large: 992,
            };

            // Get all columns and their definitions
            const allColumns = columnApi.getColumns();
            if (!allColumns) {return;}

            const columnsToShow = [];
            const columnsToHide = [];

            allColumns.forEach(column => {
                const colId = column.getColId();
                switch (colId) {
                    case "last_seen":
                        gridWidth < breakpoints.small ? columnsToHide.push(colId) : columnsToShow.push(colId);
                        break;
                    case "ip_address":
                    case "vendor":
                        gridWidth < breakpoints.large ? columnsToHide.push(colId) : columnsToShow.push(colId);
                        break;
                    case "state":
                        gridWidth < breakpoints.medium ? columnsToHide.push(colId) : columnsToShow.push(colId);
                        break;
                    default:
                        columnsToShow.push(colId);
                        break;
                }
            });

            columnApi.setColumnsVisible(columnsToShow, true);
            columnApi.setColumnsVisible(columnsToHide, false);
            
            // Fit columns after visibility changes
            params.api.sizeColumnsToFit();
        }
    };

    return gridOptions;
}
