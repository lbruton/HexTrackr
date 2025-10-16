/* eslint-env browser */
/* global agGrid, HexagonTicketsManager */

/**
 * AG Grid integration layer for the tickets.html page.
 * Reuses the existing HexagonTicketsManager data layer while providing
 * a modern AG Grid v33 presentation that matches the Quartz theme used
 * by the vulnerabilities workspace.
 */
(function() {
    if (typeof HexagonTicketsManager === "undefined" || typeof agGrid === "undefined") {
        console.warn("HexagonTicketsManager or AG Grid not available for tickets.html.");
        return;
    }

    const COLOR_CLASS_COUNT = 6;
    const GRID_ID = "ticketsAgGrid";

    /**
     * Detect the current theme, aligning with the shared theme controller.
     * @returns {boolean} True when dark mode is active.
     */
    function isDarkMode() {
        const themeAttr = document.documentElement.getAttribute("data-bs-theme");
        if (themeAttr) {
            return themeAttr === "dark";
        }

        // FIX (HEX-140): Use correct key "hextrackr-theme" and parse JSON format
        try {
            const stored = localStorage.getItem("hextrackr-theme");
            if (stored) {
                // Try parsing as JSON first (new format)
                try {
                    const parsed = JSON.parse(stored);
                    const theme = parsed.theme || parsed;
                    return theme === "dark";
                } catch {
                    // Simple string format (backward compatibility)
                    return stored === "dark";
                }
            }
        } catch (error) {
            console.debug("Theme detection fallback:", error);
        }

        return false;
    }

    /**
     * Build an AG Grid Quartz theme configuration consistent with the
     * vulnerabilities workspace so both grids share the same design language.
     * @param {boolean} darkMode - Whether the dark theme should be applied.
     * @returns {import('ag-grid-community').Theme | null}
     */
    function createQuartzTheme(darkMode) {
        // Create proper AG-Grid v33 Quartz theme configuration based on dark mode
        let quartzTheme = null;
        if (typeof window.agGrid !== "undefined" && window.agGrid.themeQuartz) {
            if (darkMode) {
                // Use centralized theme configuration for consistency
                quartzTheme = window.agGrid.themeQuartz.withParams({
                    backgroundColor: "#0F1C31", // Dark navy background - EXACT
                    foregroundColor: "#FFF", // Pure white text
                    browserColorScheme: "dark",
                    chromeBackgroundColor: "#202c3f", // EXACT header color (no mixing)
                    headerBackgroundColor: "#202c3f", // EXACT header color - matches vulnerabilities
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
        return quartzTheme;
    }

    /**
     * Generate a consistent color class for a given value.
     * @param {HexagonTicketsManager} manager - Ticket manager instance.
     * @param {string} value - Value used to derive a deterministic color.
     * @returns {string} CSS class name.
     */
    function getColorClass(manager, value) {
        if (!value) {
            return "ticket-grid-color-5";
        }

        if (typeof manager.hashString === "function") {
            const index = Math.abs(manager.hashString(value)) % COLOR_CLASS_COUNT;
            return `ticket-grid-color-${index}`;
        }

        // Fallback hash implementation (should not be hit in practice).
        let hash = 0;
        for (let i = 0; i < value.length; i += 1) {
            hash = ((hash << 5) - hash) + value.charCodeAt(i);
            hash |= 0;
        }
        return `ticket-grid-color-${Math.abs(hash) % COLOR_CLASS_COUNT}`;
    }

    /**
     * Create a DOM element with optional text content and class list.
     * @param {string} tag - HTML tag to create.
     * @param {string} text - Text content to assign.
     * @param {string} [className] - Optional class list.
     * @returns {HTMLElement}
     */
    function createElement(tag, text, className) {
        const element = document.createElement(tag);
        if (className) {
            element.className = className;
        }
        if (typeof text === "string") {
            element.textContent = text;
        }
        return element;
    }

    /**
     * Normalize vendor name from hostname for device icon color coding (HEX-241).
     * Simplified version of helpers.js normalizeVendor() for frontend use.
     * @param {string} hostname - Device hostname to analyze.
     * @returns {string} Normalized vendor name: "CISCO", "Palo Alto", or "Other".
     */
    function normalizeVendor(hostname) {
        if (!hostname || typeof hostname !== "string") {
            return "Other";
        }

        const lower = hostname.toLowerCase();

        // Cisco patterns: hostname contains "cisco" OR matches device type patterns
        // Device types: nswan (network switch), swan (switch), rtr (router), sw (switch), fw (firewall), asa (ASA)
        if (lower.includes("cisco") || /(nswan|swan|rtr|sw|fw|asa)\d+$/.test(lower)) {
            return "CISCO";
        }

        // Palo Alto patterns: hostname contains "pan", "palo", or matches naming convention
        if (lower.includes("pan") || lower.includes("palo")) {
            return "Palo Alto";
        }

        return "Other";
    }

    /**
     * Build all column definitions for the tickets grid.
     * @param {HexagonTicketsManager} manager - Ticket manager instance.
     * @returns {import('ag-grid-community').ColDef[]}
     */
    function buildColumnDefs(manager) {
        return [
            {
                headerName: "XT #",
                field: "xtNumber",
                colId: "xtNumber",
                width: 90,
                minWidth: 80,
                maxWidth: 110,
                filter: "agTextColumnFilter",
                cellRenderer: (params) => {
                    const wrapper = document.createElement("div");
                    wrapper.className = "text-center";

                    const link = document.createElement("a");
                    link.href = "#";
                    link.className = "ticket-grid-link";
                    link.textContent = params.value || "N/A";

                    link.addEventListener("click", (event) => {
                        event.preventDefault();
                        event.stopPropagation();
                        if (params.data && params.data.id && window.ticketManager) {
                            // TODO: Replace with dedicated ticket modal
                            // Currently opens markdown modal - future enhancement should show
                            // a nicely formatted HTML version of ticket data with:
                            // - Ticket details (XT#, dates, status)
                            // - Device information
                            // - Supervisor assignments
                            // - Formatted markdown content
                            // - Action buttons (edit, close, etc.)
                            window.ticketManager.viewTicket(params.data.id);
                        }
                    });

                    wrapper.appendChild(link);
                    return wrapper;
                },
                comparator: (valueA, valueB) => {
                    const a = valueA || "";
                    const b = valueB || "";
                    return a.localeCompare(b, "en", { sensitivity: "base" });
                }
            },
            {
                headerName: "Submitted",
                field: "dateSubmitted",
                colId: "dateSubmitted",
                width: 120,
                minWidth: 100,
                maxWidth: 140,
                filter: "agDateColumnFilter",
                valueGetter: (params) => params.data?.dateSubmitted || "",
                cellRenderer: (params) => {
                    const span = createElement("span", manager.formatDate(params.data?.dateSubmitted));
                    span.classList.add("ticket-grid-strong");
                    return span;
                },
                comparator: (dateA, dateB) => {
                    const a = dateA ? new Date(dateA).getTime() : 0;
                    const b = dateB ? new Date(dateB).getTime() : 0;
                    return a - b;
                }
            },
            {
                headerName: "Due",
                field: "dateDue",
                colId: "dateDue",
                width: 110,
                minWidth: 90,
                maxWidth: 130,
                filter: "agDateColumnFilter",
                valueGetter: (params) => params.data?.dateDue || "",
                cellRenderer: (params) => {
                    const span = createElement("span", manager.formatDate(params.data?.dateDue));
                    span.classList.add("ticket-grid-strong");
                    return span;
                },
                comparator: (dateA, dateB) => {
                    const a = dateA ? new Date(dateA).getTime() : 0;
                    const b = dateB ? new Date(dateB).getTime() : 0;
                    return a - b;
                }
            },
            {
                headerName: "Hexagon #",
                field: "hexagonTicket",
                colId: "hexagonTicket",
                width: 120,
                minWidth: 100,
                maxWidth: 150,
                flex: 1,
                filter: "agTextColumnFilter",
                cellRenderer: (params) => {
                    const span = document.createElement("span");
                    span.className = "ticket-grid-strong";
                    span.innerHTML = manager.highlightSearch(params.value || "N/A");
                    return span;
                }
            },
            {
                headerName: "Service Now #",
                field: "serviceNowTicket",
                colId: "serviceNowTicket",
                width: 140,
                minWidth: 120,
                maxWidth: 170,
                flex: 1,
                filter: "agTextColumnFilter",
                cellRenderer: (params) => {
                    const wrapper = document.createElement("span");
                    wrapper.innerHTML = manager.createServiceNowDisplay(params.value || "");
                    return wrapper;
                }
            },
            {
                headerName: "Site",
                field: "site",
                colId: "site",
                width: 100,
                minWidth: 80,
                maxWidth: 120,
                flex: 1,
                filter: "agTextColumnFilter",
                cellRenderer: (params) => {
                    const value = params.value || "N/A";
                    const span = document.createElement("span");
                    span.className = `ticket-grid-strong ${getColorClass(manager, value)}`;
                    span.innerHTML = manager.highlightSearch(value);
                    return span;
                }
            },
            {
                headerName: "Location",
                field: "location",
                colId: "location",
                width: 110,
                minWidth: 90,
                maxWidth: 140,
                flex: 1,
                filter: "agTextColumnFilter",
                cellRenderer: (params) => {
                    const value = params.value || "N/A";
                    const span = document.createElement("span");
                    span.className = `ticket-grid-strong ${getColorClass(manager, value)}`;
                    span.innerHTML = manager.highlightSearch(value);
                    return span;
                }
            },
            {
                headerName: "Supervisor",
                field: "supervisor",
                colId: "supervisor",
                width: 160,
                minWidth: 130,
                maxWidth: 200,
                filter: "agTextColumnFilter",
                hide: true, // Hidden to give other columns more space - data available in markdown/modal
                cellRenderer: (params) => {
                    const container = document.createElement("div");
                    container.className = "ticket-grid-multi";

                    if (!params.value) {
                        container.appendChild(createElement("span", "N/A", "text-muted"));
                        return container;
                    }

                    const supervisors = params.value
                        .split(";")
                        .map((name) => name.trim())
                        .filter(Boolean)
                        .sort((a, b) => a.localeCompare(b, "en", { sensitivity: "base" }));

                    if (supervisors.length === 0) {
                        container.appendChild(createElement("span", "N/A", "text-muted"));
                        return container;
                    }

                    const primary = document.createElement("span");
                    primary.className = `ticket-grid-strong ${getColorClass(manager, supervisors[0])}`;
                    primary.innerHTML = manager.highlightSearch(supervisors[0]);
                    container.appendChild(primary);

                    if (supervisors.length > 1) {
                        const indicator = createElement("span", "…", "ticket-grid-more");
                        indicator.title = supervisors.join("\n");
                        container.appendChild(indicator);
                    }

                    return container;
                }
            },
            {
                headerName: "Status",
                field: "status",
                colId: "status",
                width: 120,
                minWidth: 100,
                maxWidth: 140,
                cellClass: "ticket-status-cell",
                filter: "agTextColumnFilter",
                cellRenderer: (params) => {
                    const statusValue = params.value || "Pending";
                    const slug = statusValue.toLowerCase().replace(/\s+/g, "-");
                    const label = document.createElement("span");

                    const supportedStatuses = new Set([
                        "pending",
                        "staged",
                        "open",
                        "overdue",
                        "completed",
                        "failed",
                        "closed"
                    ]);

                    const classes = ["status-label"];
                    if (supportedStatuses.has(slug)) {
                        classes.push(`status-${slug}`);
                    } else {
                        classes.push("status-generic");
                    }

                    label.className = classes.join(" ");

                    const strong = document.createElement("strong");
                    strong.textContent = statusValue.toUpperCase();
                    label.appendChild(strong);

                    return label;
                }
            },
            {
                headerName: "Job Type",
                field: "jobType",
                colId: "jobType",
                width: 120,
                minWidth: 100,
                maxWidth: 140,
                cellClass: "ticket-jobtype-cell",
                filter: "agTextColumnFilter",
                valueGetter: (params) => {
                    // Support both camelCase and snake_case
                    return params.data.jobType || params.data.job_type || "Upgrade";
                },
                cellRenderer: (params) => {
                    const jobTypeValue = params.value || "Upgrade";
                    const slug = jobTypeValue.toLowerCase();
                    const label = document.createElement("span");

                    // Map job types to existing status classes for color-coding
                    const classMap = {
                        "upgrade": "status-open",         // Blue (patch-only)
                        "replace": "status-overdue",      // Orange (equipment swap)
                        "refresh": "status-pending",      // Purple (new model)
                        "mitigate": "status-failed",      // Red (urgent KEV)
                        "other": "status-generic"         // Gray (fallback)
                    };

                    label.className = `status-label ${classMap[slug] || "status-generic"}`;

                    const strong = document.createElement("strong");
                    strong.textContent = jobTypeValue.toUpperCase();
                    label.appendChild(strong);

                    return label;
                }
            },
            {
                headerName: "Devices",
                field: "devices",
                colId: "devices",
                width: 100,
                minWidth: 90,
                maxWidth: 120,
                filter: "agTextColumnFilter",
                cellClass: "text-center",
                filterValueGetter: (params) => {
                    // Make filter searchable by device names (HEX-241)
                    const devices = Array.isArray(params.data.devices) ? params.data.devices : [];
                    return devices
                        .map((device) => (typeof device === "string" ? device.trim() : ""))
                        .filter(Boolean)
                        .join(" "); // Return space-separated device names for text search
                },
                comparator: (valueA, valueB) => {
                    // Sort by device count (HEX-241)
                    const countA = Array.isArray(valueA) ? valueA.filter(d => d && typeof d === "string" && d.trim()).length : 0;
                    const countB = Array.isArray(valueB) ? valueB.filter(d => d && typeof d === "string" && d.trim()).length : 0;
                    return countA - countB;
                },
                cellRenderer: (params) => {
                    const container = document.createElement("div");
                    container.className = "d-flex align-items-center justify-content-center gap-2";

                    const devices = Array.isArray(params.value) ? params.value : [];
                    const cleaned = devices
                        .map((device) => (typeof device === "string" ? device.trim() : ""))
                        .filter(Boolean);

                    if (cleaned.length === 0) {
                        container.innerHTML = "<span class=\"text-muted\">N/A</span>";
                        return container;
                    }

                    // Detect vendor for color coding (HEX-241)
                    const vendors = new Set();
                    cleaned.forEach(hostname => {
                        const vendor = normalizeVendor(hostname);
                        console.log(`[HEX-241 Debug] Hostname: "${hostname}" -> Vendor: "${vendor}"`);
                        vendors.add(vendor);
                    });

                    // Determine icon color based on vendor mix
                    let iconColorClass = "text-secondary"; // Default gray for Other or mixed
                    if (vendors.size === 1) {
                        const vendor = Array.from(vendors)[0];
                        if (vendor === "CISCO") {
                            iconColorClass = "text-primary"; // Blue for Cisco
                        } else if (vendor === "Palo Alto") {
                            iconColorClass = "text-warning"; // Orange for Palo Alto
                        }
                        console.log(`[HEX-241 Debug] Single vendor: ${vendor}, Color: ${iconColorClass}`);
                    } else if (vendors.size > 1) {
                        console.log(`[HEX-241 Debug] Mixed vendors: ${Array.from(vendors).join(", ")}, Color: gray`);
                    }

                    // Device icon
                    const icon = document.createElement("i");
                    icon.className = `ti ti-devices ${iconColorClass}`;
                    icon.style.fontSize = "1.2rem";

                    // Device count badge
                    const badge = document.createElement("span");
                    badge.className = "badge bg-secondary-lt";
                    badge.textContent = cleaned.length;

                    // Tooltip with boot order (preserves device sequence)
                    container.title = cleaned.map((device, index) => `#${index}: ${device}`).join("\n");
                    container.setAttribute("data-bs-toggle", "tooltip");
                    container.setAttribute("data-bs-placement", "top");

                    container.appendChild(icon);
                    container.appendChild(badge);

                    return container;
                }
            },
            {
                headerName: "Actions",
                field: "actions",
                colId: "actions",
                sortable: false,
                filter: false,
                width: 190,
                minWidth: 180,
                maxWidth: 210,
                suppressSizeToFit: true,
                headerClass: "ticket-actions-header",
                cellClass: "ticket-actions-cell ag-right-aligned-cell",
                cellRenderer: (params) => {
                    const group = document.createElement("div");
                    group.className = "btn-group btn-group-sm ticket-grid-actions";
                    group.setAttribute("role", "group");

                    const buildButton = (icon, className, handler, title) => {
                        const button = document.createElement("button");
                        button.type = "button";
                        button.className = `btn ${className}`;
                        button.title = title;
                        button.innerHTML = `<i class="${icon}"></i>`;
                        button.addEventListener("click", (event) => {
                            event.preventDefault();
                            event.stopPropagation();
                            if (typeof handler === "function") {
                                handler();
                            }
                        });
                        return button;
                    };

                    const id = params.data?.id;
                    if (!id) {
                        const emptyWrapper = document.createElement("div");
                        emptyWrapper.className = "ticket-grid-actions-wrapper";
                        emptyWrapper.appendChild(group);
                        return emptyWrapper;
                    }

                    group.appendChild(buildButton("fas fa-eye", "btn-outline-primary", () => window.ticketManager.viewTicket(id), "View"));
                    group.appendChild(buildButton("fas fa-edit", "btn-outline-warning", () => window.ticketManager.editTicket(id), "Edit"));
                    group.appendChild(buildButton("fas fa-download", "btn-outline-success", () => window.ticketManager.bundleTicketFiles(id), "Download Bundle"));
                    group.appendChild(buildButton("fas fa-trash", "btn-outline-danger", () => window.ticketManager.deleteTicket(id), "Delete"));

                    const wrapper = document.createElement("div");
                    wrapper.className = "ticket-grid-actions-wrapper";
                    wrapper.appendChild(group);
                    return wrapper;
                }
            }
        ];
    }

    /**
     * Set pagination page size using whichever API is available.
     * @param {object} api - Grid API instance.
     * @param {number} size - Desired page size.
     */
    function setPaginationPageSize(api, size) {
        if (!api) {return;}
        if (typeof api.paginationSetPageSize === "function") {
            api.paginationSetPageSize(size);
            return;
        }
        if (typeof api.setGridOption === "function") {
            api.setGridOption("paginationPageSize", size);
        }
    }

    /**
     * Retrieve pagination page size in a version-safe manner.
     * @param {object} api - Grid API instance.
     * @param {number} fallback - Value to use when none detected.
     * @returns {number}
     */
    function getPaginationPageSize(api, fallback) {
        if (!api) {return fallback;}
        if (typeof api.paginationGetPageSize === "function") {
            return api.paginationGetPageSize();
        }
        if (typeof api.getGridOption === "function") {
            const option = api.getGridOption("paginationPageSize");
            if (typeof option === "number" && !Number.isNaN(option)) {
                return option;
            }
        }
        return fallback;
    }

    /**
     * Get the zero-based pagination index with graceful fallback.
     * @param {object} api - Grid API instance.
     * @returns {number}
     */
    function getCurrentPaginationPage(api) {
        if (!api) {return 0;}
        if (typeof api.paginationGetCurrentPage === "function") {
            return api.paginationGetCurrentPage();
        }
        if (typeof api.getGridOption === "function") {
            const option = api.getGridOption("paginationCurrentPage");
            if (typeof option === "number" && option >= 0) {
                return option;
            }
        }
        return 0;
    }

    /**
     * Navigate to a given pagination index using available API.
     * @param {object} api - Grid API instance.
     * @param {number} index - Zero-based page index.
     */
    function goToPaginationPage(api, index) {
        if (!api) {return;}
        if (typeof api.paginationGoToPage === "function") {
            api.paginationGoToPage(index);
            return;
        }
        if (typeof api.setGridOption === "function") {
            api.setGridOption("paginationCurrentPage", index);
        }
    }

    /**
     * Create the AG Grid options object.
     * @param {HexagonTicketsManager} manager - Ticket manager instance.
     * @returns {import('ag-grid-community').GridOptions}
     */
    function createGridOptions(manager) {
        return {
            theme: createQuartzTheme(isDarkMode()),
            columnDefs: buildColumnDefs(manager),
            rowData: [],
            defaultColDef: {
                resizable: true,
                sortable: true,
                filter: true,
                minWidth: 80,
                wrapHeaderText: false,
                autoHeaderHeight: false
            },
            pagination: true,
            paginationPageSize: manager.rowsPerPage || 10,
            paginationPageSizeSelector: [10, 25, 50, 100, 200],
            // Show AG-Grid's built-in pagination controls
            animateRows: true,
            rowHeight: 42,
            domLayout: "autoHeight",
            rowSelection: "single",
            rowClassRules: {
                "ticket-row-overdue": (params) => {
                    if (!params.data) {return false;}
                    return Boolean(params.data.isOverdue || params.data.status === "Overdue");
                }
            },
            onGridReady: (params) => {
                manager.gridApi = params.api;
                manager.gridColumnApi = params.columnApi;

                if (manager.pendingRowData) {
                    manager.gridApi.setGridOption("rowData", manager.pendingRowData);
                    manager.pendingRowData = null;
                }

                setPaginationPageSize(manager.gridApi, manager.rowsPerPage || 10);
                manager.sizeTicketsGridColumns();
                manager.updatePaginationDisplay();
            },
            onFirstDataRendered: () => {
                manager.sizeTicketsGridColumns();
                manager.updatePaginationDisplay();

                // Initialize Bootstrap tooltips for device count cells (HEX-241)
                const tooltipTriggerList = document.querySelectorAll("[data-bs-toggle=\"tooltip\"]");
                [...tooltipTriggerList].map(el => new bootstrap.Tooltip(el, {
                    delay: { show: 100, hide: 0 } // Fast tooltip display (100ms show, instant hide)
                }));
            },
            onModelUpdated: () => {
                manager.updatePaginationDisplay();
            },
            onPaginationChanged: () => {
                manager.updatePaginationDisplay();
            },
            onGridSizeChanged: () => {
                manager.sizeTicketsGridColumns();
            }
        };
    }

    /**
     * Extend HexagonTicketsManager with AG Grid helpers.
     */
    const originalRenderTickets = HexagonTicketsManager.prototype.renderTickets;
    const originalGoToPage = HexagonTicketsManager.prototype.goToPage;
    const originalSortTable = HexagonTicketsManager.prototype.sortTable;

    /**
     * Initialize AG Grid integration for the tickets display.
     * Creates the AG Grid instance and sets up theme management.
     * Only initializes once to prevent duplicate grids.
     *
     * @this {HexagonTicketsManager}
     * @returns {void}
     */
    HexagonTicketsManager.prototype.initializeAgGrid = function initializeAgGrid() {
        if (this.agGridInitialized) {
            return;
        }

        const gridContainer = document.getElementById(GRID_ID);
        if (!gridContainer) {
            console.warn("tickets-aggrid: container not found.");
            return;
        }

        const gridOptions = createGridOptions(this);
        this.gridApi = agGrid.createGrid(gridContainer, gridOptions);
        if (this.gridApi && typeof this.gridApi.getColumnApi === "function") {
            this.gridColumnApi = this.gridApi.getColumnApi();
        } else {
            this.gridColumnApi = null;
        }

        // Register with AGGridThemeManager using custom adapter to preserve our themeQuartz.withParams() configuration
        if (window.agGridThemeManager) {
            const customThemeAdapter = {
                applyTheme: (isDark) => {
                    if (gridContainer) {
                        gridContainer.classList.remove("ag-theme-quartz", "ag-theme-quartz-dark");
                        gridContainer.classList.add(isDark ? "ag-theme-quartz-dark" : "ag-theme-quartz");
                    }

                    if (this.gridApi) {
                        const quartzTheme = createQuartzTheme(isDark);
                        if (quartzTheme) {
                            if (typeof this.gridApi.setGridOption === "function") {
                                this.gridApi.setGridOption("theme", quartzTheme);
                            } else if (typeof this.gridApi.setGridOptions === "function") {
                                this.gridApi.setGridOptions({ theme: quartzTheme });
                            }
                        }

                        if (typeof this.gridApi.refreshHeader === "function") {
                            this.gridApi.refreshHeader();
                        }

                        if (typeof this.gridApi.refreshCells === "function") {
                            this.gridApi.refreshCells({ force: true });
                        }
                    }
                }
            };
            window.agGridThemeManager.registerGrid("ticketsAgGrid", this.gridApi, customThemeAdapter);
        }
        this.agGridInitialized = true;

        if (!this._ticketsGridResizeHandler) {
            this._ticketsGridResizeHandler = () => {
                this.sizeTicketsGridColumns();
            };
            window.addEventListener("resize", this._ticketsGridResizeHandler);
        }
    };

    /**
     * Automatically resize grid columns to fit the available space.
     * Uses requestAnimationFrame for smooth resizing and error handling.
     *
     * @this {HexagonTicketsManager}
     * @returns {void}
     */
    HexagonTicketsManager.prototype.sizeTicketsGridColumns = function sizeTicketsGridColumns() {
        if (!this.gridApi) {
            return;
        }

        window.requestAnimationFrame(() => {
            if (this.gridApi) {
                try {
                    this.gridApi.sizeColumnsToFit();
                } catch (error) {
                    console.debug("tickets-aggrid: unable to size columns", error);
                }
            }
        });
    };

    /**
     * Show or hide the empty state message based on whether tickets are available.
     * Manages ARIA attributes for accessibility compliance.
     *
     * @this {HexagonTicketsManager}
     * @param {boolean} hasRows - True if tickets are present, false if empty
     * @returns {void}
     */
    HexagonTicketsManager.prototype.toggleTicketsEmptyState = function toggleTicketsEmptyState(hasRows) {
        const emptyState = document.getElementById("ticketsGridEmptyState");
        if (!emptyState) {
            return;
        }

        if (hasRows) {
            emptyState.classList.remove("active");
            emptyState.style.display = "none";
            emptyState.setAttribute("aria-hidden", "true");
        } else {
            emptyState.classList.add("active");
             emptyState.style.display = "flex";
            emptyState.setAttribute("aria-hidden", "false");
        }
    };

    /**
     * Update pagination information and synchronize with AG Grid state.
     * Calculates current page, page size, and total pages from grid state.
     *
     * @this {HexagonTicketsManager}
     * @returns {void}
     */
    HexagonTicketsManager.prototype.updatePaginationDisplay = function updatePaginationDisplay() {
        if (!this.gridApi) {
            this.currentPage = 1;
            return;
        }

        const fallbackPageSize = this.rowsPerPage || 10;
        const pageSize = getPaginationPageSize(this.gridApi, fallbackPageSize);
        const currentPageIndex = Math.max(getCurrentPaginationPage(this.gridApi), 0);
        const totalRows = this.filteredTicketsCount || 0;
        const totalPages = pageSize > 0 ? Math.ceil(totalRows / pageSize) : 0;

        this.rowsPerPage = pageSize;
        this.currentPage = totalPages === 0 ? 1 : currentPageIndex + 1;
    };

    /**
     * Navigate to a specific page in the AG Grid pagination.
     * Falls back to original implementation if AG Grid is not available.
     *
     * @this {HexagonTicketsManager}
     * @param {number} pageNumber - 1-based page number to navigate to
     * @returns {void}
     */
    HexagonTicketsManager.prototype.goToPage = function goToPage(pageNumber) {
        if (this.gridApi) {
            const targetIndex = Math.max(0, pageNumber - 1);
            goToPaginationPage(this.gridApi, targetIndex);
            this.currentPage = targetIndex + 1;
            this.updatePaginationDisplay();
            return;
        }

        if (typeof originalGoToPage === "function") {
            originalGoToPage.call(this, pageNumber);
        }
    };

    /**
     * Render tickets using AG Grid integration.
     * Initializes AG Grid if needed and updates the grid with filtered ticket data.
     * Falls back to original rendering if AG Grid initialization fails.
     *
     * @this {HexagonTicketsManager}
     * @returns {void}
     */
    HexagonTicketsManager.prototype.renderTickets = function renderTickets() {
        this.initializeAgGrid();

        if (typeof originalRenderTickets === "function" && !this.agGridInitialized) {
            originalRenderTickets.call(this);
            return;
        }

        const filteredTickets = this.getFilteredTickets();
        this.filteredTicketsCount = filteredTickets.length;

        const rowData = filteredTickets.map((ticket) => ({
            ...ticket,
            dateSubmitted: ticket.dateSubmitted,
            dateDue: ticket.dateDue
        }));

        if (this.gridApi) {
            this.gridApi.setGridOption("rowData", rowData);
            setPaginationPageSize(this.gridApi, this.rowsPerPage || 10);

            const pageSize = getPaginationPageSize(this.gridApi, this.rowsPerPage || 10);
            const totalPages = rowData.length === 0 ? 0 : Math.ceil(rowData.length / pageSize);
            const currentIndex = getCurrentPaginationPage(this.gridApi);

            if (rowData.length === 0) {
                goToPaginationPage(this.gridApi, 0);
            } else if (currentIndex > totalPages - 1) {
                goToPaginationPage(this.gridApi, Math.max(totalPages - 1, 0));
            }

            this.sizeTicketsGridColumns();
        } else {
            this.pendingRowData = rowData;
        }

        this.toggleTicketsEmptyState(rowData.length > 0);
        this.updatePaginationDisplay();
    };

    /**
     * Update pagination information display.
     * Alias for updatePaginationDisplay for backward compatibility.
     *
     * @this {HexagonTicketsManager}
     * @returns {void}
     */
    HexagonTicketsManager.prototype.updatePaginationInfo = function updatePaginationInfo() {
        this.updatePaginationDisplay();
    };

    /**
     * Apply sorting to the tickets grid with AG Grid integration.
     * Synchronizes sorting between legacy implementation and AG Grid column state.
     *
     * @this {HexagonTicketsManager}
     * @param {string} column - Column identifier to sort by
     * @returns {void}
     */
    HexagonTicketsManager.prototype.sortTable = function sortTable(column) {
        if (typeof originalSortTable === "function") {
            originalSortTable.call(this, column);
        }

        if (this.gridColumnApi && column) {
            try {
                this.gridColumnApi.applyColumnState({
                    defaultState: { sort: null },
                    state: [{ colId: column, sort: this.sortDirection }]
                });
            } catch (error) {
                console.debug("tickets-aggrid: unable to synchronize sort state", error);
            }
        }
    };
})();
