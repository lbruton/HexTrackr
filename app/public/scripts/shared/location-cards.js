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
        this.sortBy = 'vpr'; // vpr, device_count, location_name
        this.sortOrder = 'desc';
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
        this.render();
    }

    /**
     * Render location cards with pagination
     */
    render() {
        const container = document.getElementById('locationCards');
        if (!container) {
            logger.error('ui', 'Location cards container not found');
            return;
        }

        // Sort data
        this.sortData();

        // Update pagination total
        this.pagination.setTotalItems(this.filteredData.length);

        // Get current page data
        const paginatedLocations = this.pagination.getCurrentPageData(this.filteredData);

        // Render cards
        container.innerHTML = this.generateLocationCardsHTML(paginatedLocations);

        // Render top controls (sort + items per page)
        const sortOptions = [
            { value: 'vpr', label: 'Total VPR' },
            { value: 'device_count', label: 'Device Count' },
            { value: 'kev_device_count', label: 'KEV Devices' },
            { value: 'location_name', label: 'Location Name' }
        ];

        this.pagination.renderTopControls(
            'locationControlsTop',
            () => this.render(),
            {
                sortOptions: sortOptions,
                currentSort: this.sortBy,
                onSortChange: (sortValue) => this.changeSort(sortValue),
                itemType: 'Locations'
            }
        );

        // Render pagination controls (arrows/numbers)
        this.pagination.renderPaginationControls('locationPaginationControls', () => this.render());

        // Update pagination info text
        this.updatePaginationInfo();

        // Initialize drag-and-drop sorting
        this.initializeSortable(container);
    }

    /**
     * Sort location data based on current sort settings
     */
    sortData() {
        this.filteredData.sort((a, b) => {
            let aVal, bVal;

            switch (this.sortBy) {
                case 'vpr':
                    aVal = a.total_vpr || 0;
                    bVal = b.total_vpr || 0;
                    break;
                case 'device_count':
                    aVal = a.device_count || 0;
                    bVal = b.device_count || 0;
                    break;
                case 'kev_device_count':
                    aVal = (a.kev_devices || []).length;
                    bVal = (b.kev_devices || []).length;
                    break;
                case 'location_name':
                    aVal = (a.location_display || '').toLowerCase();
                    bVal = (b.location_display || '').toLowerCase();
                    break;
                default:
                    aVal = a.total_vpr || 0;
                    bVal = b.total_vpr || 0;
            }

            if (this.sortOrder === 'asc') {
                return aVal > bVal ? 1 : aVal < bVal ? -1 : 0;
            } else {
                return aVal < bVal ? 1 : aVal > bVal ? -1 : 0;
            }
        });
    }

    /**
     * Generate HTML for location cards with VPR mini-cards and vendor icons
     * @param {Array} locations - Array of location stat objects
     * @returns {string} HTML string for location cards
     */
    generateLocationCardsHTML(locations) {
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

        return locations.map(location => {
            const totalVPR = location.total_vpr || 0;
            const deviceCount = location.device_count || 0;
            const locationDisplay = location.location_display || location.location || 'Unknown';
            const locationKey = location.location || '';

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
            const escapedLocation = locationKey.replace(/\\/g, "\\\\").replace(/'/g, "\\'").replace(/"/g, '\\"');

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
            let kevBadge = '';

            if (kevDeviceCount > 0) {
                // Store KEV devices data for modal
                const kevDataId = `kev-location-${locationKey.replace(/[^a-zA-Z0-9]/g, '')}-${Date.now()}`;
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
                        KEV${kevDeviceCount > 1 ? ` (${kevDeviceCount})` : ''}
                    </span>
                `;
            }

            // Calculate most common /24 network
            const network = this.calculateNetwork24(location.device_ips || []);

            return `
            <div class="col-lg-4 col-md-6 mb-3 fade-in">
                <div class="card device-card" style="cursor: pointer; position: relative;" onclick="window.filterByLocation('${escapedLocation}')">
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
                            <button class="btn btn-outline-secondary" style="font-size: 0.875rem; padding: 0.375rem 0.75rem;" disabled
                                    onclick="event.stopPropagation()">
                                <i class="fas fa-eye me-1"></i>View Site Details
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            `;
        }).join('');
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
            return 'N/A';
        }

        // Management subnets to deprioritize (out-of-band management networks)
        const managementSubnets = ['10.95', '10.96', '10.97'];

        // Count frequency of production networks (excluding management)
        const productionNetworkCounts = {};
        // Count frequency of management networks (fallback)
        const managementNetworkCounts = {};

        deviceIPs.forEach(ip => {
            if (!ip) return;

            // Extract first 3 octets
            const parts = ip.split('.');
            if (parts.length >= 3) {
                const network = `${parts[0]}.${parts[1]}.${parts[2]}.0/24`;

                // Check if this IP is in a management subnet
                const isManagementIP = managementSubnets.some(subnet => ip.startsWith(subnet + '.'));

                if (isManagementIP) {
                    managementNetworkCounts[network] = (managementNetworkCounts[network] || 0) + 1;
                } else {
                    productionNetworkCounts[network] = (productionNetworkCounts[network] || 0) + 1;
                }
            }
        });

        // Find most common production network first
        let mostCommon = 'N/A';
        let maxCount = 0;

        for (const [network, count] of Object.entries(productionNetworkCounts)) {
            if (count > maxCount) {
                maxCount = count;
                mostCommon = network;
            }
        }

        // If no production networks found, fall back to management networks
        if (mostCommon === 'N/A') {
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
     * Update pagination info text
     */
    updatePaginationInfo() {
        const container = document.getElementById('locationPaginationInfo');
        if (!container) return;

        const info = this.pagination.getPageInfo();
        container.innerHTML = `
            <span class="text-muted">
                Showing ${info.startItem}-${info.endItem} of ${info.totalItems} location${info.totalItems !== 1 ? 's' : ''}
            </span>
        `;
    }

    /**
     * Change sort order
     * @param {string} sortBy - Sort field (vpr, device_count, location_name)
     */
    changeSort(sortBy) {
        this.sortBy = sortBy;
        // Auto-determine sort order based on field
        if (sortBy === 'location_name') {
            this.sortOrder = 'asc'; // A-Z for names
        } else {
            this.sortOrder = 'desc'; // Highest first for numbers
        }
        this.pagination.setCurrentPage(1);
        this.render();
    }
}

// Global instance
window.locationCardsManager = new LocationCardsManager();

// Global function for filtering by location (called from card click)
window.filterByLocation = function(location) {
    logger.info('ui', 'Filtering by location:', { location });

    // Store filter in sessionStorage
    sessionStorage.setItem('activeFilters', JSON.stringify({
        location: location,
        vendor: null,
        severity: null
    }));

    // Switch to table view
    const tableViewButton = document.getElementById('view-table');
    if (tableViewButton) {
        tableViewButton.click();
    }

    // Apply filters (vulnerability-core.js will handle this)
    if (window.vulnManager && typeof window.vulnManager.applyStoredFilters === 'function') {
        setTimeout(() => {
            window.vulnManager.applyStoredFilters();
        }, 100);
    }
};

// Global function for showing KEV modal for a location
window.showLocationKevModal = function(location, kevDevices) {
    logger.info('ui', 'Showing KEV modal for location:', { location, deviceCount: kevDevices.length });

    if (!kevDevices || kevDevices.length === 0) {
        logger.warn('ui', 'No KEV devices found for location:', { location });
        return;
    }

    // Create modal HTML
    const modalId = 'locationKevModal';
    let modal = document.getElementById(modalId);

    if (!modal) {
        modal = document.createElement('div');
        modal.id = modalId;
        modal.className = 'modal fade';
        modal.setAttribute('tabindex', '-1');
        modal.setAttribute('aria-hidden', 'true');
        document.body.appendChild(modal);
    }

    // Build device list HTML
    const deviceListHtml = kevDevices.map(device => {
        const cveList = device.cves.map(cve =>
            `<a href="#" class="badge bg-red-lt me-1 mb-1" onclick="event.preventDefault(); window.showKevDetails('${cve}')">${cve}</a>`
        ).join('');

        return `
            <div class="list-group-item">
                <div class="row align-items-center">
                    <div class="col-auto">
                        <i class="fas fa-server text-primary"></i>
                    </div>
                    <div class="col">
                        <div class="fw-bold">${device.hostname}</div>
                        <div class="text-muted small">${device.cve_count} KEV ${device.cve_count === 1 ? 'vulnerability' : 'vulnerabilities'}</div>
                    </div>
                </div>
                <div class="mt-2">
                    ${cveList}
                </div>
            </div>
        `;
    }).join('');

    modal.innerHTML = `
        <div class="modal-dialog modal-lg">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">
                        <i class="fas fa-shield-halved text-danger me-2"></i>
                        KEV Devices at ${location.toUpperCase()}
                    </h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    <div class="alert alert-warning">
                        <i class="fas fa-exclamation-triangle me-2"></i>
                        <strong>${kevDevices.length} device${kevDevices.length === 1 ? '' : 's'}</strong> at this location ${kevDevices.length === 1 ? 'has' : 'have'} Known Exploited Vulnerabilities (KEV).
                        These should be prioritized for immediate remediation.
                    </div>
                    <div class="list-group" style="${kevDevices.length > 5 ? 'max-height: 400px; overflow-y: auto;' : ''}">
                        ${deviceListHtml}
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                </div>
            </div>
        </div>
    `;

    // Show the modal
    const bsModal = new bootstrap.Modal(modal);
    bsModal.show();
};
