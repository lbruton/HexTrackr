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
                if (params.value && typeof params.value === "string" && params.value.trim() !== "") {
                    return new Date(params.value).toLocaleDateString();
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
            width: 90,
            minWidth: 80,
            maxWidth: 120,
            resizable: true,
            hide: !isDesktop,
            cellRenderer: (params) => {
                const vendor = params.value || "Other";
                // Colored text instead of badges - cleaner table design
                let colorClass = "text-secondary";  // Gray for Other
                if (vendor === "CISCO") {
                    colorClass = "text-primary";     // Blue for Cisco
                } else if (vendor === "Palo Alto") {
                    colorClass = "text-warning";     // Orange for Palo Alto
                }
                return `<span class="${colorClass} fw-bold">${vendor}</span>`;
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
                    if (!cell) {return;}

                    // Determine which advisory helper to use based on vendor
                    let advisoryHelper = null;
                    if (vendor?.toLowerCase().includes("cisco")) {
                        advisoryHelper = window.ciscoAdvisoryHelper;
                    } else if (vendor?.toLowerCase().includes("palo")) {
                        advisoryHelper = window.paloAdvisoryHelper;
                    }

                    // Unsupported vendor or helper not loaded
                    if (!advisoryHelper) {
                        cell.innerHTML = "<span class=\"font-monospace text-muted small\">N/A</span>";
                        params.node.setDataValue("fixed_version", "N/A");  // Update AG-Grid data model for search
                        params.data.fixed_version = "N/A";  // HEX-234: Update source data for search
                        return;
                    }

                    try {
                        const installedVersion = params.data.operating_system;
                        const fixedVersion = await advisoryHelper.getFixedVersion(
                            cveId, vendor, installedVersion
                        );

                        if (fixedVersion) {
                            cell.innerHTML = `<span class="font-monospace text-success small">${DOMPurify.sanitize(fixedVersion)}</span>`;
                            params.node.setDataValue("fixed_version", fixedVersion);  // Update AG-Grid data model
                            params.data.fixed_version = fixedVersion;  // HEX-234: Update source data for search
                        } else {
                            cell.innerHTML = "<span class=\"font-monospace text-muted small\">No Fix</span>";
                            params.node.setDataValue("fixed_version", "No Fix");
                            params.data.fixed_version = "No Fix";  // HEX-234: Update source data for search
                        }
                    } catch (error) {
                        cell.innerHTML = "<span class=\"font-monospace text-muted small\">Error</span>";
                        params.node.setDataValue("fixed_version", "Error");
                        params.data.fixed_version = "Error";  // HEX-234: Update source data for search
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
                // Colored text based on score - cleaner table design
                let colorClass = "text-success";  // Green for low (0-3.9)
                if (score >= 9.0) {
                    colorClass = "text-danger";   // Red for critical (9-10)
                } else if (score >= 7.0) {
                    colorClass = "text-orange";   // Orange for high (7-8.9)
                } else if (score >= 4.0) {
                    colorClass = "text-warning";  // Yellow for medium (4-6.9)
                }
                return `<span class="${colorClass} fw-bold">${score.toFixed(1)}</span>`;
            }
        },
        {
            headerName: "CVSS",
            field: "cvss_score",
            sortable: true,
            filter: "agNumberColumnFilter",
            width: 90,
            minWidth: 70,
            maxWidth: 120,
            resizable: true,
            cellRenderer: (params) => {
                const cvss = parseFloat(params.value) || 0;
                // Colored text based on CVSS score - cleaner table design
                let colorClass = "text-success";  // Green for low (0-3.9)
                if (cvss >= 9.0) {
                    colorClass = "text-danger";   // Red for critical (9-10)
                } else if (cvss >= 7.0) {
                    colorClass = "text-orange";   // Orange for high (7-8.9)
                } else if (cvss >= 4.0) {
                    colorClass = "text-warning";  // Yellow for medium (4-6.9)
                }
                if (cvss === 0) {
                    return "<span class=\"text-muted\">N/A</span>";
                }
                return `<span class="${colorClass} fw-bold">${cvss.toFixed(1)}</span>`;
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
                // Colored text based on severity - cleaner table design
                let colorClass = "text-success";  // Green for Low
                if (severity.toUpperCase() === "CRITICAL") {
                    colorClass = "text-danger";   // Red for Critical
                } else if (severity.toUpperCase() === "HIGH") {
                    colorClass = "text-orange";   // Orange for High
                } else if (severity.toUpperCase() === "MEDIUM") {
                    colorClass = "text-warning";  // Yellow for Medium
                }
                return `<span class="${colorClass} fw-bold text-uppercase">${severity}</span>`;
            }
        },
        {
            headerName: "",  // Empty - will show icon via CSS
            headerClass: "ticket-header-icon",  // Custom class for icon styling
            field: "ticket_status",
            sortable: true,
            filter: false,  // No filter icon, just sorting
            width: 80,
            minWidth: 70,
            maxWidth: 100,
            resizable: true,
            cellStyle: {
                textAlign: "center"
            },
            cellRenderer: (params) => {
                const ticketStatus = params.value;
                const ticketCount = params.data.ticket_count || 0;
                const ticketIds = params.data.ticket_ids || [];
                const hostname = params.data.hostname;
                const isKev = params.data.is_kev === 1 || params.data.is_kev === true;

                // No tickets - show muted ticket icon with keyboard shortcuts
                if (!ticketStatus || ticketCount === 0) {
                    return `<a href="#" class="text-muted create-ticket-link"
                               data-hostname="${hostname}"
                               data-is-kev="${isKev}"
                               onclick="handleGridCreateTicket(event, this); return false;"
                               title="Create ticket for ${hostname}&#13;&#10;Cmd+Shift: KEV devices at location&#13;&#10;Alt+Shift: All devices at location">
                               <i class="fas fa-ticket-alt" style="opacity: 0.6;"></i>
                            </a>`;
                }

                // Has tickets - show colored indicator based on status
                let colorClass = "text-secondary";  // Gray for unknown
                const icon = "fas fa-ticket-alt";

                if (ticketStatus === "Overdue") {
                    colorClass = "text-danger";     // Red
                } else if (ticketStatus === "Pending") {
                    colorClass = "text-warning";    // Yellow
                } else if (ticketStatus === "Open") {
                    colorClass = "text-primary";    // Blue
                }

                // Single ticket - navigate directly
                if (ticketCount === 1) {
                    const ticketId = ticketIds[0];
                    const href = ticketId ? `/tickets.html?openTicket=${ticketId}` : "#";
                    return `<a href="${href}" class="${colorClass}"
                               title="View ${ticketStatus} ticket for ${hostname}">
                               <i class="${icon}"></i>
                            </a>`;
                }

                // Multiple tickets - show picker modal
                return `<a href="#" class="${colorClass}"
                           data-hostname="${hostname}"
                           data-ticket-count="${ticketCount}"
                           onclick="handleGridViewTickets(event, this); return false;"
                           title="${ticketCount} ${ticketStatus} tickets for ${hostname} - click to choose">
                           <i class="${icon}"></i>
                        </a>`;
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

/**
 * Handle create ticket click from AG-Grid table view with keyboard shortcuts
 * Matches card view power tool functionality:
 * - Single click: Create ticket for one device
 * - Cmd+Shift (Mac) or Ctrl+Shift (Windows): KEV devices at location
 * - Alt+Shift: All devices at location
 *
 * @param {MouseEvent} event - Click event with keyboard modifiers
 * @param {HTMLElement} link - The link element that was clicked
 * @global
 */
function handleGridCreateTicket(event, link) {
    // Stop event propagation
    event.preventDefault();
    event.stopPropagation();

    // Read data from link attributes
    const hostname = link.dataset.hostname;
    const isKev = link.dataset.isKev === "true";

    logger.debug("ui", `[Grid Create Ticket] hostname=${hostname}, isKev=${isKev}`);

    // Parse hostname to extract SITE and Location (ALL CAPS)
    const site = hostname.substring(0, 4).toUpperCase();
    const location = hostname.substring(0, 5).toUpperCase();

    // Detect keyboard modifiers to determine mode
    let mode = "single";
    let deviceList = [hostname.toUpperCase()];

    // Mode 2: KEV devices at location (Cmd/Ctrl + Shift)
    if ((event.metaKey || event.ctrlKey) && event.shiftKey) {
        mode = "bulk-kev";

        // Access dataManager from global vulnManager
        if (window.vulnManager && window.vulnManager.dataManager) {
            const allDevices = window.vulnManager.dataManager.getFilteredDevices();

            // Filter for KEV devices at same location
            deviceList = allDevices
                .filter(device => device.hostname.toLowerCase().startsWith(location.toLowerCase()) && device.hasKev === true)
                .map(device => device.hostname.toUpperCase())
                .sort(); // HEX-313: Alphabetical sorting for boot order planning

            logger.debug("ui", `[Grid Power Tool] KEV mode - found ${deviceList.length} KEV devices at ${location}`);
        } else {
            logger.error("ui", "[Grid Power Tool] vulnManager.dataManager not available");
        }
    }
    // Mode 3: All devices at location (Alt + Shift)
    else if (event.altKey && event.shiftKey) {
        mode = "bulk-all";

        // Access dataManager from global vulnManager
        if (window.vulnManager && window.vulnManager.dataManager) {
            const allDevices = window.vulnManager.dataManager.getFilteredDevices();

            // Filter for all devices at same location
            deviceList = allDevices
                .filter(device => device.hostname.toLowerCase().startsWith(location.toLowerCase()))
                .map(device => device.hostname.toUpperCase())
                .sort(); // HEX-313: Alphabetical sorting for boot order planning

            logger.debug("ui", `[Grid Power Tool] All devices mode - found ${deviceList.length} devices at ${location}`);
        } else {
            logger.error("ui", "[Grid Power Tool] vulnManager.dataManager not available");
        }
    }
    // Mode 1: Single device (default - no modifiers)

    logger.debug("ui", "[Grid Power Tool] Mode:", mode);
    logger.debug("ui", "[Grid Power Tool] Site:", site);
    logger.debug("ui", "[Grid Power Tool] Location:", location);
    logger.debug("ui", "[Grid Power Tool] Devices:", deviceList);
    logger.debug("ui", "[Grid Power Tool] Total Count:", deviceList.length);

    // Build ticket data object
    const ticketData = {
        devices: deviceList,
        site: site,
        location: location,
        mode: mode,
        timestamp: Date.now()
    };

    // Set sessionStorage for tickets.html to read
    sessionStorage.setItem("createTicketData", JSON.stringify(ticketData));
    sessionStorage.setItem("createTicketDevice", deviceList[0]);  // Backward compatibility
    sessionStorage.setItem("autoOpenModal", "true");

    // Show toast message
    const deviceCount = deviceList.length;
    const modeLabel = {
        "single": "device",
        "bulk-all": `devices at ${location}`,
        "bulk-kev": `KEV devices at ${location}`
    }[mode] || "device";

    if (window.vulnManager && typeof window.vulnManager.showToast === "function") {
        window.vulnManager.showToast(`Creating ticket for ${deviceCount} ${modeLabel}...`, "info");
    }

    // Navigate to tickets page
    setTimeout(() => {
        window.location.href = "/tickets.html";
    }, 300);
}

/**
 * Handle view tickets click from AG-Grid for devices with multiple tickets
 * Shows picker modal like card view
 *
 * @param {MouseEvent} event - Click event
 * @param {HTMLElement} link - The link element that was clicked
 * @global
 */
async function handleGridViewTickets(event, link) {
    // Stop event propagation
    event.preventDefault();
    event.stopPropagation();

    // Read data from link attributes
    const hostname = link.dataset.hostname;
    const ticketCount = parseInt(link.dataset.ticketCount) || 0;

    logger.debug("ui", `[Grid View Tickets] hostname=${hostname}, count=${ticketCount}`);

    // Fetch tickets for this device
    try {
        const response = await fetch(`/api/tickets/by-device/${encodeURIComponent(hostname)}`, {
            credentials: "include"
        });

        if (!response.ok) {
            logger.error("ui", "[Grid View Tickets] Failed to fetch tickets:", response.statusText);
            return;
        }

        const result = await response.json();
        const tickets = result.tickets || [];

        logger.debug("ui", `[Grid View Tickets] Fetched ${tickets.length} tickets:`, tickets);

        if (tickets.length === 0) {
            logger.warn("ui", `[Grid View Tickets] No tickets found for ${hostname}`);
            return;
        }

        // Show the picker modal
        showGridTicketPickerModal(hostname, tickets);

    } catch (error) {
        logger.error("ui", "[Grid View Tickets] Error fetching tickets:", error);
    }
}

/**
 * Show ticket picker modal for devices with multiple tickets (grid view)
 * Reuses existing modal from vulnerabilities.html
 *
 * @param {string} hostname - Device hostname
 * @param {Array<Object>} tickets - Array of ticket objects
 * @global
 */
function showGridTicketPickerModal(hostname, tickets) {
    logger.debug("ui", `[Grid Ticket Picker] Opening picker for ${hostname} with ${tickets.length} tickets`);

    const validTickets = tickets.filter(t => t !== null && t.id);
    logger.debug("ui", `[Grid Ticket Picker] Valid tickets: ${validTickets.length}`, validTickets);

    if (validTickets.length === 0) {
        logger.error("ui", `[Grid Ticket Picker] No valid tickets found for ${hostname}`);
        return;
    }

    // Build modal content - reuses existing modal structure
    const modalBody = document.getElementById("ticketPickerModalBody");
    if (!modalBody) {
        logger.error("ui", "[Grid Ticket Picker] Modal body element not found!");
        return;
    }

    // Helper function to get status badge color
    const getStatusBadgeColor = (status) => {
        const colorMap = {
            "Open": "primary",
            "Pending": "warning",
            "Overdue": "danger",
            "Completed": "success",
            "Cancelled": "secondary"
        };
        return colorMap[status] || "secondary";
    };

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
                        <span class="badge bg-${getStatusBadgeColor(ticket.status)}">${ticket.status}</span>
                    </div>
                </button>
            `).join("")}
        </div>
    `;

    // Show the modal
    const modalElement = document.getElementById("ticketPickerModal");
    if (!modalElement) {
        logger.error("ui", "[Grid Ticket Picker] Modal element not found!");
        return;
    }

    logger.debug("ui", "[Grid Ticket Picker] Showing modal...");
    if (typeof bootstrap === "undefined") {
        logger.error("ui", "[Grid Ticket Picker] Bootstrap is not loaded!");
        return;
    }

    const modal = new bootstrap.Modal(modalElement);
    modal.show();
    logger.debug("ui", "[Grid Ticket Picker] Modal shown successfully");
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
window.handleGridCreateTicket = handleGridCreateTicket;
window.handleGridViewTickets = handleGridViewTickets;
window.showGridTicketPickerModal = showGridTicketPickerModal;
