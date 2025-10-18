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
        this.currentPage = 1;
        this.itemsPerPage = 12;
        this.sortBy = 'vpr'; // vpr, device_count, location_name
        this.sortOrder = 'desc';
        this.locationData = [];
        this.filteredData = [];
    }

    /**
     * Initialize location cards view
     * @param {Array} locations - Array of location stats from API
     */
    initialize(locations) {
        this.locationData = locations || [];
        this.filteredData = [...this.locationData];
        this.currentPage = 1;
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

        // Paginate
        const startIdx = (this.currentPage - 1) * this.itemsPerPage;
        const endIdx = startIdx + this.itemsPerPage;
        const paginatedLocations = this.filteredData.slice(startIdx, endIdx);

        // Render cards
        container.innerHTML = this.generateLocationCardsHTML(paginatedLocations);

        // Render pagination controls
        this.renderPaginationControls();
        this.updatePaginationInfo();
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

            // Primary vendor badge
            const primaryVendor = location.primary_vendor || 'Other';
            const vendorBadgeColors = {
                "CISCO": "primary",       // Blue
                "Palo Alto": "warning",   // Orange
                "Other": "secondary"      // Gray
            };
            const vendorColor = vendorBadgeColors[primaryVendor] || "secondary";
            const vendorBadge = `<span class="badge bg-${vendorColor}">${primaryVendor}</span>`;

            // Vendor icon breakdown
            const vendorBreakdown = location.vendor_breakdown || {};
            const vendorIconsHTML = this.renderVendorIcons(vendorBreakdown);

            // KEV count
            const kevCount = location.kev_count || 0;
            const kevBadge = kevCount > 0 ? `
                <div class="mt-2">
                    <span class="badge kev-badge">
                        <i class="fas fa-shield-halved me-1"></i>
                        KEV: ${kevCount}
                    </span>
                </div>
            ` : '';

            // Open tickets
            const openTickets = location.open_tickets || 0;
            const ticketsInfo = openTickets > 0 ? `
                <div class="text-muted small mt-1">
                    <i class="fas fa-ticket me-1"></i>
                    ${openTickets} open ticket${openTickets !== 1 ? 's' : ''}
                </div>
            ` : '';

            // Escape location for JavaScript
            const escapedLocation = locationKey.replace(/\\/g, "\\\\").replace(/'/g, "\\'").replace(/"/g, '\\"');

            return `
            <div class="col-lg-4 col-md-6 mb-3 fade-in">
                <div class="card location-card" style="cursor: pointer;" onclick="window.filterByLocation('${escapedLocation}')">
                    <div class="card-body">
                        <div class="location-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem;">
                            <div>
                                <i class="fas fa-map-marker-alt me-2 text-primary"></i>
                                <span class="fw-bold">${locationDisplay}</span>
                            </div>
                            ${vendorBadge}
                        </div>

                        <div class="location-stats" style="display: flex; justify-content: space-between; padding: 0.5rem 0; border-bottom: 1px solid var(--bs-border-color); margin-bottom: 0.75rem;">
                            <div>
                                <div class="text-muted small">Devices</div>
                                <div class="fw-bold">${deviceCount}</div>
                            </div>
                            <div class="text-end">
                                <div class="text-muted small">Total VPR</div>
                                <div class="fw-bold">${totalVPR.toFixed(1)}</div>
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

                        ${vendorIconsHTML}
                        ${kevBadge}
                        ${ticketsInfo}

                        <div class="card-actions mt-3">
                            <button class="btn btn-sm btn-primary w-100"
                                    onclick="event.stopPropagation(); window.filterByLocation('${escapedLocation}')">
                                <i class="fas fa-filter me-1"></i>View Vulnerabilities
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            `;
        }).join('');
    }

    /**
     * Render vendor distribution icons with colors
     * @param {Object} vendorBreakdown - Object with vendor names as keys and counts as values
     * @returns {string} HTML string for vendor icons
     */
    renderVendorIcons(vendorBreakdown) {
        if (!vendorBreakdown || Object.keys(vendorBreakdown).length === 0) {
            return '';
        }

        const vendorColors = {
            "CISCO": "text-primary",      // Blue
            "Palo Alto": "text-warning",  // Orange
            "Other": "text-secondary"     // Gray
        };

        const icons = Object.entries(vendorBreakdown)
            .filter(([vendor, count]) => count > 0)
            .map(([vendor, count]) => {
                const colorClass = vendorColors[vendor] || 'text-secondary';
                return `
                    <span class="${colorClass} me-2" title="${vendor}: ${count} device${count !== 1 ? 's' : ''}">
                        <i class="fas fa-circle"></i> ${count}
                    </span>
                `;
            })
            .join('');

        return `
            <div class="vendor-icons mt-2" style="font-size: 0.875rem;">
                ${icons}
            </div>
        `;
    }

    /**
     * Render pagination controls
     */
    renderPaginationControls() {
        const container = document.getElementById('locationPaginationControls');
        if (!container) return;

        const totalPages = Math.ceil(this.filteredData.length / this.itemsPerPage);

        if (totalPages <= 1) {
            container.innerHTML = '';
            return;
        }

        let html = '<nav aria-label="Location cards pagination"><ul class="pagination justify-content-center">';

        // Previous button
        html += `
            <li class="page-item ${this.currentPage === 1 ? 'disabled' : ''}">
                <a class="page-link" href="#" onclick="event.preventDefault(); locationCardsManager.goToPage(${this.currentPage - 1})">
                    <i class="fas fa-chevron-left"></i>
                </a>
            </li>
        `;

        // Page numbers (show max 5 pages)
        const startPage = Math.max(1, this.currentPage - 2);
        const endPage = Math.min(totalPages, startPage + 4);

        for (let i = startPage; i <= endPage; i++) {
            html += `
                <li class="page-item ${i === this.currentPage ? 'active' : ''}">
                    <a class="page-link" href="#" onclick="event.preventDefault(); locationCardsManager.goToPage(${i})">${i}</a>
                </li>
            `;
        }

        // Next button
        html += `
            <li class="page-item ${this.currentPage === totalPages ? 'disabled' : ''}">
                <a class="page-link" href="#" onclick="event.preventDefault(); locationCardsManager.goToPage(${this.currentPage + 1})">
                    <i class="fas fa-chevron-right"></i>
                </a>
            </li>
        `;

        html += '</ul></nav>';
        container.innerHTML = html;
    }

    /**
     * Update pagination info text
     */
    updatePaginationInfo() {
        const container = document.getElementById('locationPaginationInfo');
        if (!container) return;

        const startIdx = (this.currentPage - 1) * this.itemsPerPage + 1;
        const endIdx = Math.min(this.currentPage * this.itemsPerPage, this.filteredData.length);
        const total = this.filteredData.length;

        container.innerHTML = `
            <span class="text-muted">
                Showing ${startIdx}-${endIdx} of ${total} location${total !== 1 ? 's' : ''}
            </span>
        `;
    }

    /**
     * Go to specific page
     * @param {number} page - Page number
     */
    goToPage(page) {
        const totalPages = Math.ceil(this.filteredData.length / this.itemsPerPage);
        if (page < 1 || page > totalPages) return;

        this.currentPage = page;
        this.render();
    }

    /**
     * Change items per page
     * @param {number} items - Number of items per page
     */
    changeItemsPerPage(items) {
        this.itemsPerPage = parseInt(items, 10);
        this.currentPage = 1;
        this.render();
    }

    /**
     * Change sort order
     * @param {string} sortBy - Sort field (vpr, device_count, location_name)
     * @param {string} sortOrder - Sort order (asc, desc)
     */
    changeSort(sortBy, sortOrder) {
        this.sortBy = sortBy;
        this.sortOrder = sortOrder;
        this.currentPage = 1;
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
