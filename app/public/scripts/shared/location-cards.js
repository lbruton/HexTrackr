/**
 * @fileoverview LocationCardsManager - Handles location-based vulnerability card rendering
 * Part of HEX-292 (Location Cards View - Phase 1 MVP)
 * @version 1.0.0
 * @author HexTrackr Team
 * @date 2025-10-18
 */

/* eslint-env browser, es6 */
/* global window, document */
/* exported LocationCardsManager */

/**
 * Manages location cards rendering with pagination and sorting
 * Follows device cards pattern from vulnerability-cards.js
 */
class LocationCardsManager {
    constructor() {
        // Default to KEV Priority (matches device/vulnerability cards)
        this.sortBy = "kev_device_count";
        this.sortOrder = "desc";
        this.locationData = [];
        this.filteredData = [];

        // Initialize pagination controller (defaultPageSize, availableSizes)
        this.pagination = new PaginationController(6, [6, 12, 24, 48, 96]);
    }

    /**
     * Initialize location cards view
     * @param {Array} locations - Array of location stats from API
     */
    initialize(locations) {
        this.locationData = locations || [];
        this.filteredData = [...this.locationData];
        this.pagination.setTotalItems(this.filteredData.length);
        this.pagination.setCurrentPage(1);

        // Wire up search bar event listener
        this.setupSearchListener();

        this.render();
    }

    /**
     * Setup search bar event listener for location cards
     * Filters by location name and network address
     *
     * IMPORTANT: Does NOT clone search input to preserve other views' listeners
     * Instead, applies current search value immediately and lets existing listener handle changes
     */
    setupSearchListener() {
        const searchInput = document.getElementById("searchInput");
        if (searchInput) {
            // Get current search value
            const currentValue = searchInput.value || "";

            // Apply current search value immediately if present
            // The global search listener (vulnerability-search.js) will handle future changes
            if (currentValue.trim()) {
                this.applySearchFilter(currentValue);
                logger.debug("search", "Applied existing search term to location cards", { searchTerm: currentValue });
            }

            logger.debug("search", "Location cards search initialized with current value");
        } else {
            logger.warn("search", "Search input not found - search functionality unavailable");
        }
    }

    /**
     * Apply location dropdown filter to location cards
     * Filters by exact location match (normalized to lowercase)
     * @param {string} selectedLocation - Selected location from dropdown (lowercase)
     */
    applyLocationFilter(selectedLocation) {
        // Get current search term to combine filters
        const searchInput = document.getElementById("searchInput");
        const searchTerm = searchInput ? searchInput.value : "";

        // Start with all locations
        let filtered = [...this.locationData];

        // Apply location filter if selected
        if (selectedLocation && selectedLocation.trim() !== "") {
            // Match against display name (case-insensitive) - what user sees in dropdown
            const selectedDisplayName = selectedLocation.toUpperCase().trim();
            logger.debug("location-filter", "Applying location filter", {
                selectedLocation,
                selectedDisplayName,
                totalLocations: this.locationData.length
            });
            filtered = filtered.filter(location => {
                // Compare against location_display (uppercase) or fallback to uppercase location
                const displayName = (location.location_display || location.location || "").toUpperCase();
                const matches = displayName === selectedDisplayName;
                if (matches) {
                    logger.debug("location-filter", "Location matched", {
                        displayName,
                        selectedDisplayName
                    });
                }
                return matches;
            });
            logger.debug("location-filter", "Location filter applied", {
                matchedCount: filtered.length
            });
        }

        // Apply search filter on top of location filter
        if (searchTerm && searchTerm.trim() !== "") {
            const term = searchTerm.toLowerCase().trim();
            filtered = filtered.filter(location => {
                const locationMatch = (location.location_display || "").toLowerCase().includes(term);
                const network = this.calculateNetwork24(location.device_ips || []);
                const networkMatch = network.toLowerCase().includes(term);
                const keyMatch = (location.location || "").toLowerCase().includes(term);
                return locationMatch || networkMatch || keyMatch;
            });
        }

        this.filteredData = filtered;

        // Update pagination and re-render
        this.pagination.setTotalItems(this.filteredData.length);
        this.pagination.setCurrentPage(1);
        this.render();
    }

    /**
     * Apply search filter to location cards
     * Searches location name, location key, and network address
     * @param {string} searchTerm - Search term to filter by
     */
    applySearchFilter(searchTerm) {
        // Get current location filter to combine filters
        const locationFilter = document.getElementById("locationFilter");
        const selectedLocation = locationFilter ? locationFilter.value : "";

        // Start with all locations
        let filtered = [...this.locationData];

        // Apply location filter first if selected
        if (selectedLocation && selectedLocation.trim() !== "") {
            // Match against display name (case-insensitive)
            const selectedDisplayName = selectedLocation.toUpperCase().trim();
            filtered = filtered.filter(location => {
                const displayName = (location.location_display || location.location || "").toUpperCase();
                return displayName === selectedDisplayName;
            });
        }

        // Apply search filter on top of location filter
        if (searchTerm && searchTerm.trim() !== "") {
            const term = searchTerm.toLowerCase().trim();
            filtered = filtered.filter(location => {
                const locationMatch = (location.location_display || "").toLowerCase().includes(term);
                const network = this.calculateNetwork24(location.device_ips || []);
                const networkMatch = network.toLowerCase().includes(term);
                const keyMatch = (location.location || "").toLowerCase().includes(term);
                return locationMatch || networkMatch || keyMatch;
            });
        }

        this.filteredData = filtered;

        // Update pagination and re-render
        this.pagination.setTotalItems(this.filteredData.length);
        this.pagination.setCurrentPage(1);
        this.render();

        logger.debug("search", "Location cards filtered", {
            searchTerm,
            totalLocations: this.locationData.length,
            filteredLocations: this.filteredData.length
        });
    }

    /**
     * Render location cards with pagination
     */
    render() {
        const container = document.getElementById("locationCards");
        if (!container) {
            logger.error("ui", "Location cards container not found");
            return;
        }

        // Sort data
        this.sortData();

        // Update pagination total
        this.pagination.setTotalItems(this.filteredData.length);

        // Get current page data
        const paginatedLocations = this.pagination.getCurrentPageData(this.filteredData);

        // Render cards (now async - HEX-344 Step 2)
        this.generateLocationCardsHTML(paginatedLocations).then(html => {
            container.innerHTML = html;
        });

        // Render top controls (sort + items per page)
        // Standardized to match device/vulnerability cards naming
        const sortOptions = [
            { value: "kev_device_count", label: "KEV Priority" },
            { value: "vpr", label: "VPR Priority" },
            { value: "location_name_asc", label: "Name A-Z" },
            { value: "location_name_desc", label: "Name Z-A" },
            { value: "device_count", label: "Device Count (High-Low)" },
            { value: "device_count_low", label: "Device Count (Low-High)" }
        ];

        this.pagination.renderTopControls(
            "locationControlsTop",
            () => this.render(),
            {
                sortOptions: sortOptions,
                currentSort: this.sortBy,
                onSortChange: (sortValue) => this.changeSort(sortValue),
                itemType: "Locations"
            }
        );

        // Render pagination controls (arrows/numbers)
        this.pagination.renderPaginationControls("locationPaginationControls", () => this.render());

        // Update pagination info text
        this.updatePaginationInfo();

        // Initialize drag-and-drop sorting
        this.initializeSortable(container);
    }

    /**
     * Sort location data based on current sort settings
     * Standardized to match device/vulnerability cards naming
     */
    sortData() {
        this.filteredData.sort((a, b) => {
            let aVal, bVal;
            const isString = false;

            switch (this.sortBy) {
                case "kev_device_count":
                    // KEV Priority: KEV device count (high→low)
                    aVal = (a.kev_devices || []).length;
                    bVal = (b.kev_devices || []).length;
                    // Descending (high first)
                    return bVal - aVal;

                case "vpr":
                    // VPR Priority: Total VPR (high→low)
                    aVal = a.total_vpr || 0;
                    bVal = b.total_vpr || 0;
                    // Descending (high first)
                    return bVal - aVal;

                case "location_name_asc":
                    // Name A-Z
                    aVal = (a.location_display || "").toLowerCase();
                    bVal = (b.location_display || "").toLowerCase();
                    return aVal.localeCompare(bVal);

                case "location_name_desc":
                    // Name Z-A
                    aVal = (a.location_display || "").toLowerCase();
                    bVal = (b.location_display || "").toLowerCase();
                    return bVal.localeCompare(aVal);

                case "device_count":
                    // Device Count (High-Low)
                    aVal = a.device_count || 0;
                    bVal = b.device_count || 0;
                    // Descending (high first)
                    return bVal - aVal;

                case "device_count_low":
                    // Device Count (Low-High)
                    aVal = a.device_count || 0;
                    bVal = b.device_count || 0;
                    // Ascending (low first)
                    return aVal - bVal;

                default:
                    // Default to KEV Priority
                    aVal = (a.kev_devices || []).length;
                    bVal = (b.kev_devices || []).length;
                    return bVal - aVal;
            }
        });
    }

    /**
     * Generate HTML for location cards with VPR mini-cards and vendor icons
     * HEX-344: Now async to support batch ticket lookup
     * @param {Array} locations - Array of location stat objects
     * @returns {Promise<string>} HTML string for location cards
     */
    async generateLocationCardsHTML(locations) {
        if (!locations || locations.length === 0) {
            return `
                <div class="col-12">
                    <div class="alert alert-info">
                        <i class="fas fa-info-circle me-2"></i>
                        No location data available. Locations are parsed from device hostnames.
                    </div>
                </div>
            `;
        }

        // HEX-344 Step 2: Fetch ticket data for all devices across all locations
        const allHostnames = locations.flatMap(loc => loc.device_hostnames || []);
        const ticketMap = await this.checkTicketStatusBatch(allHostnames);

        return locations.map(location => {
            const totalVPR = location.total_vpr || 0;
            const deviceCount = location.device_count || 0;
            const locationDisplay = location.location_display || location.location || "Unknown";
            const locationKey = location.location || "";

            // Severity breakdown
            const severityBreakdown = location.severity_breakdown || {
                Critical: { count: 0, vpr: 0 },
                High: { count: 0, vpr: 0 },
                Medium: { count: 0, vpr: 0 },
                Low: { count: 0, vpr: 0 }
            };

            const criticalCount = severityBreakdown.Critical?.count || 0;
            const highCount = severityBreakdown.High?.count || 0;
            const mediumCount = severityBreakdown.Medium?.count || 0;
            const lowCount = severityBreakdown.Low?.count || 0;

            const criticalVPR = severityBreakdown.Critical?.vpr || 0;
            const highVPR = severityBreakdown.High?.vpr || 0;
            const mediumVPR = severityBreakdown.Medium?.vpr || 0;
            const lowVPR = severityBreakdown.Low?.vpr || 0;

            // Escape location for JavaScript (MUST be defined BEFORE use in KEV badge)
            const escapedLocation = locationKey.replace(/\\/g, "\\\\").replace(/'/g, "\\'").replace(/"/g, "\\\"");

            // Vendor breakdown (Cisco, Other, Palo Alto)
            const vendorBreakdown = location.vendor_breakdown || {};
            const ciscoCount = vendorBreakdown["CISCO"] || 0;
            const paloCount = vendorBreakdown["Palo Alto"] || 0;
            const otherCount = vendorBreakdown["Other"] || 0;

            // Vendor VPR totals (stub for now - backend doesn't provide this yet)
            // TODO HEX-293: Add vendor_vpr to backend locationService.js
            const ciscoVPR = 0;
            const paloVPR = 0;
            const otherVPR = 0;

            // KEV badge (top-left, outside card) - shows DEVICE count not KEV count
            const kevDeviceCount = (location.kev_devices || []).length;
            const kevDevices = location.kev_devices || [];
            let kevBadge = "";

            if (kevDeviceCount > 0) {
                // Store KEV devices data for modal
                const kevDataId = `kev-location-${locationKey.replace(/[^a-zA-Z0-9]/g, "")}-${Date.now()}`;
                if (!window.locationKevData) {
                    window.locationKevData = {};
                }
                window.locationKevData[kevDataId] = kevDevices;

                kevBadge = `
                    <span class="badge kev-badge" role="button" tabindex="0"
                          style="position: absolute; top: 0.5rem; left: 0.5rem; z-index: 10;"
                          onclick="event.stopPropagation(); window.showLocationKevModal('${escapedLocation}', window.locationKevData['${kevDataId}'])"
                          onkeydown="if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); event.stopPropagation(); window.showLocationKevModal('${escapedLocation}', window.locationKevData['${kevDataId}']); }">
                        <i class="fas fa-shield-halved me-1"></i>
                        KEV${kevDeviceCount > 1 ? ` (${kevDeviceCount})` : ""}
                    </span>
                `;
            }

            // Calculate most common /24 network
            const network = this.calculateNetwork24(location.device_ips || []);

            // Serialize location data for modal (Session 3: HEX-295)
            const locationDataForModal = JSON.stringify(location).replace(/'/g, "&#39;").replace(/"/g, "&quot;");

            return `
            <div class="col-lg-4 col-md-6 mb-3 fade-in">
                <div class="card device-card" style="cursor: pointer; position: relative;"
                     onclick="window.locationDetailsModal?.showLocationDetails(JSON.parse(this.dataset.location), window.vulnManager?.dataManager)"
                     data-location='${locationDataForModal}'>
                    ${kevBadge}
                    <div class="card-body">
                        <div class="device-hostname" style="display: flex; justify-content: space-between; align-items: center;">
                            <div>
                                <i class="fas fa-map-marker-alt me-2 text-muted"></i>
                                ${locationDisplay}
                            </div>
                            <div class="d-flex flex-column align-items-end">
                                <span class="fw-bold text-danger">${totalVPR.toFixed(1)}</span>
                                <span class="text-muted" style="font-size: 0.7rem;">Total VPR</span>
                            </div>
                        </div>

                        <div class="device-version-info" style="display: flex; justify-content: space-between; padding: 0.5rem 0; border-bottom: 1px solid var(--bs-border-color);">
                            <div style="text-align: left;">
                                <div class="text-muted small">Physical address coming soon</div>
                            </div>
                        </div>

                        <div class="vendor-mini-cards">
                            <div class="vendor-mini-card">
                                <div class="vendor-label">CISCO</div>
                                <div class="vendor-icon">
                                    <i class="fas fa-network-wired text-primary"></i>
                                </div>
                                <div class="vendor-count">${ciscoCount}</div>
                            </div>
                            <div class="vendor-mini-card">
                                <div class="vendor-label">Palo</div>
                                <div class="vendor-icon">
                                    <i class="fas fa-fire text-warning"></i>
                                </div>
                                <div class="vendor-count">${paloCount}</div>
                            </div>
                            <div class="vendor-mini-card">
                                <div class="vendor-label">Other</div>
                                <div class="vendor-icon">
                                    <i class="fas fa-server text-secondary"></i>
                                </div>
                                <div class="vendor-count">${otherCount}</div>
                            </div>
                        </div>

                        <div class="vpr-mini-cards">
                            <div class="vpr-mini-card critical">
                                <div class="vpr-count text-red">${criticalCount}</div>
                                <div class="vpr-label">Critical</div>
                                <div class="vpr-sum">${criticalVPR.toFixed(1)}</div>
                            </div>
                            <div class="vpr-mini-card high">
                                <div class="vpr-count text-orange">${highCount}</div>
                                <div class="vpr-label">High</div>
                                <div class="vpr-sum">${highVPR.toFixed(1)}</div>
                            </div>
                            <div class="vpr-mini-card medium">
                                <div class="vpr-count text-yellow">${mediumCount}</div>
                                <div class="vpr-label">Medium</div>
                                <div class="vpr-sum">${mediumVPR.toFixed(1)}</div>
                            </div>
                            <div class="vpr-mini-card low">
                                <div class="vpr-count text-green">${lowCount}</div>
                                <div class="vpr-label">Low</div>
                                <div class="vpr-sum">${lowVPR.toFixed(1)}</div>
                            </div>
                        </div>

                        <div class="card-actions">
                            <span class="text-info font-monospace" style="font-size: 0.875rem;">${network}</span>
                            ${this.generateTicketButton(location, ticketMap)}
                        </div>
                    </div>
                </div>
            </div>
            `;
        }).join("");
    }

    /**
     * Initialize Sortable.js for drag-and-drop functionality
     * @param {HTMLElement} container - Container element to make sortable
     */
    initializeSortable(container) {
        if (window.Sortable) {
            new Sortable(container, {
                animation: 150,
                ghostClass: "sortable-ghost",
                chosenClass: "sortable-chosen",
                dragClass: "sortable-drag"
            });
        }
    }

    /**
     * Calculate most common /24 network from device IP addresses
     * Prefers production subnets over management (10.95.x.x, 10.96.x.x, 10.97.x.x)
     * @param {Array} deviceIPs - Array of IP addresses
     * @returns {string} /24 network string (e.g., "192.168.1.0/24")
     */
    calculateNetwork24(deviceIPs) {
        if (!deviceIPs || deviceIPs.length === 0) {
            return "N/A";
        }

        // Management subnets to deprioritize (out-of-band management networks)
        const managementSubnets = ["10.95", "10.96", "10.97"];

        // Count frequency of production networks (excluding management)
        const productionNetworkCounts = {};
        // Count frequency of management networks (fallback)
        const managementNetworkCounts = {};

        deviceIPs.forEach(ip => {
            if (!ip) {return;}

            // Extract first 3 octets
            const parts = ip.split(".");
            if (parts.length >= 3) {
                const network = `${parts[0]}.${parts[1]}.${parts[2]}.0/24`;

                // Check if this IP is in a management subnet
                const isManagementIP = managementSubnets.some(subnet => ip.startsWith(subnet + "."));

                if (isManagementIP) {
                    managementNetworkCounts[network] = (managementNetworkCounts[network] || 0) + 1;
                } else {
                    productionNetworkCounts[network] = (productionNetworkCounts[network] || 0) + 1;
                }
            }
        });

        // Find most common production network first
        let mostCommon = "N/A";
        let maxCount = 0;

        for (const [network, count] of Object.entries(productionNetworkCounts)) {
            if (count > maxCount) {
                maxCount = count;
                mostCommon = network;
            }
        }

        // If no production networks found, fall back to management networks
        if (mostCommon === "N/A") {
            for (const [network, count] of Object.entries(managementNetworkCounts)) {
                if (count > maxCount) {
                    maxCount = count;
                    mostCommon = network;
                }
            }
        }

        return mostCommon;
    }

    /**
     * Generate ticket button HTML for a location card
     * Follows device card pattern from vulnerability-cards.js
     * HEX-344 Step 3: Dynamic button based on ticket count
     *
     * @param {Object} location - Location data object
     * @param {Object} ticketMap - Map of hostname to ticket data (from batch lookup)
     * @returns {string} Button HTML
     */
    generateTicketButton(location, ticketMap) {
        // Get ticket counts for ALL devices at this location
        const deviceHostnames = location.device_hostnames || [];
        const locationTickets = new Map(); // Track unique tickets

        // BUGFIX HEX-344: Extract site code from location
        // LocationService doesn't include site_code in returned data, so we need to derive it
        // Pattern: location is like "laxb1" → site is "LAX" (first 4 chars uppercase)
        const locationKey = location.location || "";
        const site = locationKey.substring(0, 4).toUpperCase(); // Extract site from location code

        deviceHostnames.forEach(hostname => {
            // CRITICAL: Use lowercase for lookup (backend returns lowercase keys)
            const ticketData = ticketMap[hostname.toLowerCase()] || { count: 0, tickets: [] };
            if (ticketData.count > 0) {
                ticketData.tickets.forEach(ticketId => {
                    locationTickets.set(ticketId, {
                        id: ticketId,
                        status: ticketData.status,
                        jobType: ticketData.jobType
                    });
                });
            }
        });

        const uniqueTicketCount = locationTickets.size;
        const ticketArray = Array.from(locationTickets.values());

        // Button state configuration (follows device-security-modal.js:1004-1012)
        let buttonText, buttonClass, buttonIcon;
        const statusColors = {
            "Pending": "warning",      // Amber yellow
            "Staged": "info",          // Purple (using info as closest Bootstrap match)
            "Open": "primary",         // Blue
            "Overdue": "danger",       // Red
            "Completed": "success",    // Green
            "Failed": "danger",        // Orange-red
            "Closed": "secondary"      // Gray
        };

        if (uniqueTicketCount === 0) {
            buttonText = "Create Ticket";
            buttonClass = "btn-outline-success";
            buttonIcon = "fas fa-ticket-alt";
        } else if (uniqueTicketCount === 1) {
            const ticket = ticketArray[0];
            const statusColor = statusColors[ticket.status] || "secondary";
            buttonText = "View Ticket";
            buttonClass = `btn-outline-${statusColor}`;
            buttonIcon = "fas fa-folder-open";
        } else {
            // Use most recent ticket's status for color
            const ticket = ticketArray[0];
            const statusColor = statusColors[ticket.status] || "secondary";
            buttonText = `View Tickets (${uniqueTicketCount})`;
            buttonClass = `btn-outline-${statusColor}`;
            buttonIcon = "fas fa-layer-group";
        }

        // Escape data for HTML attributes
        const escapedLocation = locationKey.replace(/'/g, "\\'").replace(/"/g, "&quot;");
        const ticketsJson = JSON.stringify(ticketArray).replace(/"/g, "&quot;");

        return `
            <button class="btn ${buttonClass} location-ticket-btn"
                    style="font-size: 0.875rem; padding: 0.375rem 0.75rem;"
                    data-location-key="${escapedLocation}"
                    data-site="${site}"
                    data-ticket-count="${uniqueTicketCount}"
                    data-tickets="${ticketsJson}"
                    data-kev-devices="${JSON.stringify(location.kev_devices || []).replace(/"/g, "&quot;")}"
                    data-all-devices="${JSON.stringify(deviceHostnames).replace(/"/g, "&quot;")}"
                    onclick="event.stopPropagation(); window.locationCardsManager.handleLocationTicketClick(event, this)">
                <i class="${buttonIcon} me-1"></i>${buttonText}
            </button>
        `;
    }

    /**
     * Handle ticket button click on location card
     * Implements 3-tier navigation: 0 tickets → Create, 1 → View, 2+ → Picker modal
     * Supports keyboard shortcuts: Cmd+Shift for KEV-only filtering
     * HEX-344 Step 4: Click handler with location context
     *
     * @param {Event} event - Click event (needed for keyboard modifiers)
     * @param {HTMLElement} button - Button element that was clicked
     */
    handleLocationTicketClick(event, button) {
        event.stopPropagation(); // Prevent card click

        // Read data from button dataset
        const ticketCount = parseInt(button.dataset.ticketCount) || 0;
        const tickets = button.dataset.tickets ? JSON.parse(button.dataset.tickets) : [];
        const site = button.dataset.site || "";
        const locationKey = button.dataset.locationKey || "";

        // TIER 1: Single ticket exists → Direct navigation
        if (ticketCount === 1) {
            const ticketId = tickets[0].id;
            logger.info("tickets", `Navigating to single ticket: ${ticketId}`);
            window.location.href = `/tickets.html?openTicket=${ticketId}`;
            return;
        }

        // TIER 2: Multiple tickets exist → Show picker modal
        // HEX-344: Fetch full ticket details and reuse device cards modal (same UX)
        if (ticketCount > 1) {
            logger.info("tickets", `Fetching ${ticketCount} tickets for ${locationKey}`);
            this.fetchAndShowLocationTicketModal(locationKey);
            return;
        }

        // TIER 3: No tickets exist → Create new ticket
        logger.info("tickets", "Creating new ticket for location", { site, locationKey });

        // Parse device lists from button data
        const allDevices = JSON.parse(button.dataset.allDevices || "[]");
        const kevDevices = JSON.parse(button.dataset.kevDevices || "[]");

        // Determine mode based on keyboard modifiers
        let mode = "bulk-all"; // Default: all devices at location
        let deviceList = allDevices.map(h => h.toUpperCase()); // UPPERCASE for ticket form

        // Cmd+Shift or Ctrl+Shift → KEV devices only
        if ((event.metaKey || event.ctrlKey) && event.shiftKey) {
            mode = "bulk-kev";
            deviceList = kevDevices.map(d => d.hostname.toUpperCase());
            logger.info("tickets", `[KEV Filter] Creating ticket with ${deviceList.length} KEV devices`);
        } else {
            logger.info("tickets", `Creating ticket with ${deviceList.length} devices at ${locationKey}`);
        }

        // Build sessionStorage data for ticket creation
        const ticketData = {
            devices: deviceList,              // UPPERCASE hostnames
            site: site.toUpperCase(),         // UPPERCASE site
            location: locationKey.toUpperCase(), // UPPERCASE location
            mode: mode,
            timestamp: Date.now()
        };

        // Store in sessionStorage and navigate to tickets page
        sessionStorage.setItem("createTicketData", JSON.stringify(ticketData));
        sessionStorage.setItem("autoOpenModal", "true");
        window.location.href = "/tickets.html";
    }

    /**
     * Fetch full ticket details for a location and show picker modal
     * HEX-344: Reuses device cards modal implementation for consistent UX
     * Fetches complete ticket objects (with xt_number, created_at, etc.)
     * Then calls vulnerability-cards.js showTicketPickerModal() directly
     *
     * @param {string} locationKey - Location identifier (e.g., "WTULSA", "LAXB1")
     */
    async fetchAndShowLocationTicketModal(locationKey) {
        try {
            // Fetch full ticket details from backend
            const response = await fetch(`/api/tickets/location/${locationKey}`);
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            if (!data.success || !data.tickets) {
                throw new Error(data.error || "Failed to fetch tickets");
            }

            // Reuse device cards modal - same UX, same data structure
            // Call vulnerability-cards.js showTicketPickerModal() directly
            if (window.vulnManager && window.vulnManager.cardsManager) {
                window.vulnManager.cardsManager.showTicketPickerModal(locationKey.toUpperCase(), data.tickets);

                // Override "Create New Ticket Anyway" button to handle location-based creation
                // The device modal's button calls createTicketFromDevice(hostname) which only adds 1 device
                // For locations, we need to add ALL devices at the location (same as "Create Ticket" button with 0 tickets)
                setTimeout(() => {
                    this.overrideModalCreateButton(locationKey);
                }, 100); // Small delay to ensure modal DOM is rendered
            } else {
                logger.error("tickets", "VulnerabilityCardsManager not available");
                alert("Unable to show ticket picker. Please refresh the page.");
            }

        } catch (error) {
            logger.error("tickets", `Failed to fetch tickets for location ${locationKey}:`, error);
            alert(`Failed to load tickets: ${error.message}`);
        }
    }

    /**
     * Override the "Create New Ticket Anyway" button in device modal for location context
     * HEX-344: Make button behavior match "Create Ticket" button (add all devices at location)
     *
     * @param {string} locationKey - Location identifier
     */
    overrideModalCreateButton(locationKey) {
        const modal = document.getElementById("ticketPickerModal");
        if (!modal) {return;}

        // Find the "Create New Ticket Anyway" button
        const createButton = modal.querySelector("button.btn-success");
        if (!createButton) {
            logger.warn("tickets", "Create button not found in modal");
            return;
        }

        // Find the location card button to get device data
        const locationButton = document.querySelector(`[data-location-key="${locationKey}"]`);
        if (!locationButton) {
            logger.error("tickets", `Location button not found for ${locationKey}`);
            return;
        }

        // Replace onclick to use location-based creation (all devices at location)
        createButton.onclick = (event) => {
            event.preventDefault();
            logger.info("tickets", `Creating ticket with all devices at ${locationKey}`);

            // Close modal
            const bsModal = bootstrap.Modal.getInstance(modal);
            if (bsModal) {
                bsModal.hide();
            }

            // Get device data from location button
            const allDevices = JSON.parse(locationButton.dataset.allDevices || "[]");
            const site = locationButton.dataset.site || "";

            // Build ticket data (same as TIER 3 in handleLocationTicketClick)
            const ticketData = {
                devices: allDevices.map(h => h.toUpperCase()),
                site: site.toUpperCase(),
                location: locationKey.toUpperCase(),
                mode: "bulk-all",
                timestamp: Date.now()
            };

            // Store and navigate
            sessionStorage.setItem("createTicketData", JSON.stringify(ticketData));
            sessionStorage.setItem("autoOpenModal", "true");
            window.location.href = "/tickets.html";
        };
    }

    /**
     * Check ticket status for multiple devices in a single batch API call
     * Performance optimization: HEX-216 batch lookup pattern
     * Case-insensitive hostname handling: HEX-190 lessons learned
     *
     * @param {Array<string>} hostnames - Array of device hostnames to check
     * @returns {Promise<Object>} Map of hostname (lowercase) to ticket data
     *   Example: { "lax-fw01": { count: 2, status: "In Progress", jobType: "Firmware", tickets: [123, 456] } }
     */
    async checkTicketStatusBatch(hostnames) {
        if (!hostnames || hostnames.length === 0) {
            return {};
        }

        try {
            // CRITICAL: Normalize hostnames to lowercase for API call
            // Backend ticketService.js:822 returns lowercase keys
            const normalizedHostnames = hostnames.map(h => h.toLowerCase());

            // Get CSRF token first (required for POST requests)
            const csrfResponse = await fetch("/api/auth/csrf", {
                credentials: "include"
            });
            const { csrfToken } = await csrfResponse.json();

            const response = await fetch("/api/tickets/batch-device-lookup", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "x-csrf-token": csrfToken
                },
                credentials: "include",
                body: JSON.stringify({ hostnames: normalizedHostnames })
            });

            if (!response.ok) {
                throw new Error(`Batch ticket lookup failed: ${response.status}`);
            }

            const result = await response.json();

            // Backend returns { success: true, data: { hostname: {count, status, ...} } }
            // CRITICAL: Keys are lowercase in response
            return result.data || {};
        } catch (error) {
            logger.error("tickets", "Failed to fetch batch ticket status", error);
            return {}; // Return empty map on error - don't break card render
        }
    }

    /**
     * Update pagination info text
     */
    updatePaginationInfo() {
        const container = document.getElementById("locationPaginationInfo");
        if (!container) {return;}

        const info = this.pagination.getPageInfo();
        container.innerHTML = `
            <span class="text-muted">
                Showing ${info.startItem}-${info.endItem} of ${info.totalItems} location${info.totalItems !== 1 ? "s" : ""}
            </span>
        `;
    }

    /**
     * Change sort order
     * @param {string} sortBy - Sort field (kev_device_count, vpr, location_name_asc, location_name_desc, device_count, device_count_low)
     */
    changeSort(sortBy) {
        this.sortBy = sortBy;
        // Sort order is now encoded in the sort value itself (e.g., location_name_asc vs location_name_desc)
        // No need to set this.sortOrder separately
        this.pagination.setCurrentPage(1);
        this.render();
    }
}

// Global instance
window.locationCardsManager = new LocationCardsManager();

// Global function for filtering by location (called from card click)
window.filterByLocation = function(location) {
    logger.info("ui", "Filtering by location:", { location });

    // Store filter in sessionStorage
    sessionStorage.setItem("activeFilters", JSON.stringify({
        location: location,
        vendor: null,
        severity: null
    }));

    // Switch to table view
    const tableViewButton = document.getElementById("view-table");
    if (tableViewButton) {
        tableViewButton.click();
    }

    // Apply filters (vulnerability-core.js will handle this)
    if (window.vulnManager && typeof window.vulnManager.applyStoredFilters === "function") {
        setTimeout(() => {
            window.vulnManager.applyStoredFilters();
        }, 100);
    }
};

// Global function for showing KEV modal for a location
window.showLocationKevModal = function(location, kevDevices) {
    logger.info("ui", "Showing KEV modal for location:", { location, deviceCount: kevDevices.length });

    if (!kevDevices || kevDevices.length === 0) {
        logger.warn("ui", "No KEV devices found for location:", { location });
        return;
    }

    // Store location KEV context for back navigation
    window.locationKevPickerContext = {
        location: location,
        kevDevices: kevDevices
    };

    // Create modal HTML
    const modalId = "locationKevModal";
    let modal = document.getElementById(modalId);

    if (!modal) {
        modal = document.createElement("div");
        modal.id = modalId;
        modal.className = "modal fade";
        modal.setAttribute("tabindex", "-1");
        modal.setAttribute("aria-hidden", "true");
        document.body.appendChild(modal);
    }

    // Build device list HTML with new picker pattern
    const deviceListHtml = kevDevices.map((device, index) => {
        const cveList = device.cves.map(cve =>
            `<a href="#" class="badge bg-red-lt me-1 mb-1" onclick="event.preventDefault(); event.stopPropagation(); window.showKevDetails('${cve}', true); bootstrap.Modal.getInstance(document.getElementById('locationKevModal')).hide(); return false;">${cve}</a>`
        ).join("");

        return `
            <div class="list-group-item list-group-item-action"
                 style="cursor: pointer;"
                 onclick="window.selectLocationKevDevice('${device.hostname}')"
                 id="location-kev-item-${device.hostname.replace(/[^a-zA-Z0-9]/g, "-")}">
                <div class="row align-items-center g-2">
                    <div class="col-auto d-flex align-items-center">
                        <input type="radio" name="selected-location-kev-device"
                               class="form-check-input"
                               value="${device.hostname}"
                               ${index === 0 ? "checked" : ""}
                               onclick="event.stopPropagation(); window.selectLocationKevDevice('${device.hostname}');">
                    </div>
                    <div class="col d-flex align-items-center">
                        <div class="w-100">
                            <div class="d-flex justify-content-between align-items-center">
                                <div class="fw-bold" style="font-size: 1.05rem;">${device.hostname}</div>
                                <div>
                                    ${cveList}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }).join("");

    modal.innerHTML = `
        <div class="modal-dialog modal-lg">
            <div class="modal-content">
                <div class="modal-header bg-danger text-white">
                    <h5 class="modal-title">
                        <i class="fas fa-shield-halved me-2"></i>
                        KEV Devices at ${location.toUpperCase()}
                    </h5>
                    <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    <div class="alert alert-warning">
                        <i class="fas fa-exclamation-triangle me-2"></i>
                        <strong>${kevDevices.length} device${kevDevices.length === 1 ? "" : "s"}</strong> at this location ${kevDevices.length === 1 ? "has" : "have"} Known Exploited Vulnerabilities (KEV).
                        Select a device to view details.
                    </div>
                    <div class="list-group" style="max-height: 400px; overflow-y: auto;">
                        ${deviceListHtml}
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-primary" id="locationKevViewDeviceBtn" onclick="window.viewSelectedLocationKevDevice()">
                        <i class="fas fa-server me-1"></i>View Device Details
                    </button>
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
                        <i class="fas fa-times me-1"></i>Close
                    </button>
                </div>
            </div>
        </div>
    `;

    // Store selected device (default to first one)
    window.selectedLocationKevDevice = kevDevices[0].hostname;

    // Show the modal
    const bsModal = new bootstrap.Modal(modal);
    bsModal.show();
};

/**
 * Select a device from the location KEV picker modal
 * Updates the selected radio button and stores the selection
 * @param {string} hostname - Hostname that was selected
 */
window.selectLocationKevDevice = function(hostname) {
    logger.debug("ui", "Selected location KEV device:", hostname);

    // Store the selected device
    window.selectedLocationKevDevice = hostname;

    // Update radio button
    const radio = document.querySelector(`input[name="selected-location-kev-device"][value="${hostname}"]`);
    if (radio) {
        radio.checked = true;
    }
};

/**
 * View device details for the selected device from location KEV picker modal
 * Opens the device security modal for the selected device
 */
window.viewSelectedLocationKevDevice = function() {
    if (!window.selectedLocationKevDevice) {
        logger.warn("ui", "No device selected from location KEV picker");
        return;
    }

    logger.info("ui", "Opening device details for:", window.selectedLocationKevDevice);

    // Close the location KEV modal
    const locationKevModal = bootstrap.Modal.getInstance(document.getElementById("locationKevModal"));
    if (locationKevModal) {
        locationKevModal.hide();
    }

    // Wait for modal to close, then open device details
    setTimeout(() => {
        // Clean up any stray modal backdrops
        document.querySelectorAll(".modal-backdrop").forEach(backdrop => backdrop.remove());
        document.body.classList.remove("modal-open");
        document.body.style.overflow = "";
        document.body.style.paddingRight = "";

        // Open the device details modal
        if (window.vulnManager && typeof window.vulnManager.viewDeviceDetails === "function") {
            window.vulnManager.viewDeviceDetails(window.selectedLocationKevDevice);
        } else if (window.openDeviceModal && typeof window.openDeviceModal === "function") {
            window.openDeviceModal(window.selectedLocationKevDevice);
        } else {
            logger.error("ui", "Device modal functions not available");
        }
    }, 300);
};

/**
 * Return to location KEV picker modal from KEV details modal
 * Closes KEV details and re-opens location picker with stored context
 */
window.returnToLocationKevPicker = function() {
    logger.debug("ui", "Returning to location KEV picker modal");

    // Close the KEV details modal
    const kevDetailsModal = bootstrap.Modal.getInstance(document.getElementById("kevDetailsModal"));
    if (kevDetailsModal) {
        kevDetailsModal.hide();
    }

    // Wait for modal to close, then re-open location picker
    setTimeout(() => {
        // Clean up any stray modal backdrops
        document.querySelectorAll(".modal-backdrop").forEach(backdrop => backdrop.remove());
        document.body.classList.remove("modal-open");
        document.body.style.overflow = "";
        document.body.style.paddingRight = "";

        // Re-open the location KEV picker modal with stored context
        if (window.locationKevPickerContext) {
            window.showLocationKevModal(window.locationKevPickerContext.location, window.locationKevPickerContext.kevDevices);
        } else {
            logger.error("ui", "No location KEV picker context available");
        }
    }, 300);
};
