/**
 * LocationDetailsModal - Manages location details modal display
 * @class
 *
 * HEX-295 Session 1: Core Modal Structure (v1.0.87)
 * Pattern source: device-security-modal.js (modal structure and theme propagation)
 * Pattern source: location-cards.js (network subnet calculation)
 */
class LocationDetailsModal {
    /**
     * Initialize the location details modal
     */
    constructor() {
        this.currentLocation = null;
        this.dataManager = null;
        this.modal = null;
        this.gridApi = null;
        this.activeFilter = null;
    }

    /**
     * Show location details modal
     * @param {Object} location - Location data from locationService
     * @param {Object} dataManager - VulnerabilityCore dataManager instance
     *
     * Pattern source: device-security-modal.js:57-76 (entry point pattern)
     */
    showLocationDetails(location, dataManager) {
        try {
            // Validate inputs
            if (!location) {
                console.error("[LocationDetailsModal] No location data provided");
                return;
            }

            // Store references
            this.currentLocation = location;
            this.dataManager = dataManager;

            // Populate modal sections
            this.populateLocationInfo(location);

            // Show modal with theme propagation
            this.showModal();

        } catch (error) {
            console.error("[LocationDetailsModal] Error showing location details:", error);
        }
    }

    /**
     * Populate left info card with location data
     * @param {Object} location - Location data
     *
     * Pattern source: device-security-modal.js:77-167 (info card population)
     */
    populateLocationInfo(location) {
        try {
            // Extract location data with fallbacks
            const locationDisplay = location.location_display || location.location?.toUpperCase() || "N/A";
            const deviceCount = location.device_count || 0;
            const primaryVendor = location.primary_vendor || "Other";
            const totalVPR = location.total_vpr || 0;
            const kevCount = location.kev_count || 0;
            const openTickets = location.open_tickets || 0;

            // Vendor badge color logic (matches device-security-modal.js:92-95)
            const vendorBadgeClass = primaryVendor === "CISCO" ? "bg-primary" :
                                     primaryVendor === "Palo Alto" ? "bg-warning" :
                                     "bg-secondary";

            // VPR severity badge
            const vprSeverityClass = this.getVprSeverityClass(totalVPR);
            const vprBadgeClass = vprSeverityClass === "critical" ? "bg-red" :
                                  vprSeverityClass === "high" ? "bg-orange" :
                                  vprSeverityClass === "medium" ? "bg-yellow" :
                                  "bg-green";

            // Risk level badge
            const severityBreakdown = location.severity_breakdown || {};
            const criticalCount = severityBreakdown.Critical?.count || 0;
            const highCount = severityBreakdown.High?.count || 0;
            const mediumCount = severityBreakdown.Medium?.count || 0;

            let riskBadge = "";
            if (criticalCount > 0) {
                riskBadge = "<span class=\"badge bg-red\">Critical Risk</span>";
            } else if (highCount > 5) {
                riskBadge = "<span class=\"badge bg-orange\">High Risk</span>";
            } else if (mediumCount > 10) {
                riskBadge = "<span class=\"badge bg-yellow\">Medium Risk</span>";
            } else {
                riskBadge = "<span class=\"badge bg-green\">Low Risk</span>";
            }

            // KEV badge
            const kevBadge = kevCount > 0
                ? `<span class="badge bg-red">${kevCount}</span>`
                : '<span class="text-muted">0</span>';

            // Calculate network subnet
            const networkSubnet = this.calculateNetworkSubnet(location.device_ips || []);

            // Build HTML for location info card
            const infoHtml = `
                <div class="mb-3">
                    <div class="row">
                        <div class="col-sm-5 text-muted">Location:</div>
                        <div class="col-sm-7 fw-bold">${locationDisplay}</div>
                    </div>
                </div>
                <div class="mb-3">
                    <div class="row">
                        <div class="col-sm-5 text-muted">Device Count:</div>
                        <div class="col-sm-7">
                            <span class="badge bg-secondary">${deviceCount} devices</span>
                        </div>
                    </div>
                </div>
                <div class="mb-3">
                    <div class="row">
                        <div class="col-sm-5 text-muted">Primary Vendor:</div>
                        <div class="col-sm-7">
                            <span class="badge ${vendorBadgeClass}">${primaryVendor}</span>
                        </div>
                    </div>
                </div>
                <div class="mb-3">
                    <div class="row">
                        <div class="col-sm-5 text-muted">Total VPR:</div>
                        <div class="col-sm-7">
                            <span class="badge ${vprBadgeClass}">${totalVPR.toFixed(1)}</span>
                        </div>
                    </div>
                </div>
                <div class="mb-3">
                    <div class="row">
                        <div class="col-sm-5 text-muted">Risk Level:</div>
                        <div class="col-sm-7">
                            ${riskBadge}
                        </div>
                    </div>
                </div>
                <div class="mb-3">
                    <div class="row">
                        <div class="col-sm-5 text-muted">KEV Devices:</div>
                        <div class="col-sm-7">
                            ${kevBadge}
                        </div>
                    </div>
                </div>
                <div class="mb-3">
                    <div class="row">
                        <div class="col-sm-5 text-muted">Open Tickets:</div>
                        <div class="col-sm-7">
                            <span class="text-primary fw-bold">${openTickets}</span>
                        </div>
                    </div>
                </div>
                <div class="mb-3">
                    <div class="row">
                        <div class="col-sm-5 text-muted">Network:</div>
                        <div class="col-sm-7">
                            <span class="font-monospace text-info">${networkSubnet}</span>
                        </div>
                    </div>
                </div>
                <div class="mb-3">
                    <div class="row">
                        <div class="col-sm-5 text-muted">Address:</div>
                        <div class="col-sm-7">
                            <span class="text-muted">Coming soon
                                <i class="fas fa-info-circle ms-1"
                                   data-bs-toggle="tooltip"
                                   data-bs-placement="top"
                                   title="Address data will be integrated from NetBox and ticket history"></i>
                            </span>
                        </div>
                    </div>
                </div>
                <div class="mb-3">
                    <div class="row">
                        <div class="col-sm-5 text-muted">Contacts:</div>
                        <div class="col-sm-7">
                            <span class="text-muted">Coming soon
                                <i class="fas fa-info-circle ms-1"
                                   data-bs-toggle="tooltip"
                                   data-bs-placement="top"
                                   title="Contact data will be integrated from ticket history and NetBox"></i>
                            </span>
                        </div>
                    </div>
                </div>
            `;

            // Inject HTML into modal
            document.getElementById("locationInfo").innerHTML = infoHtml;

            // Initialize tooltips
            const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
            tooltipTriggerList.map(function (tooltipTriggerEl) {
                return new bootstrap.Tooltip(tooltipTriggerEl);
            });

        } catch (error) {
            console.error("[LocationDetailsModal] Error populating location info:", error);
            document.getElementById("locationInfo").innerHTML = '<p class="text-danger">Error loading location information</p>';
        }
    }

    /**
     * Calculate most common /24 network from device IP addresses
     * Prefers production subnets over management (10.95.x.x, 10.96.x.x, 10.97.x.x)
     *
     * Pattern source: location-cards.js:473-533 (EXACT REUSE - network subnet calculation)
     *
     * @param {Array<string>} ipAddresses - Array of IP addresses
     * @returns {string} /24 network string (e.g., "192.168.1.0/24") or "N/A"
     */
    calculateNetworkSubnet(ipAddresses) {
        if (!ipAddresses || ipAddresses.length === 0) {
            return 'N/A';
        }

        // Management subnets to deprioritize (out-of-band management networks)
        const managementSubnets = ['10.95', '10.96', '10.97'];

        // Count frequency of production networks (excluding management)
        const productionNetworkCounts = {};
        // Count frequency of management networks (fallback)
        const managementNetworkCounts = {};

        ipAddresses.forEach(ip => {
            if (!ip) {return;}

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
     * Get VPR severity class based on score
     *
     * Pattern source: device-security-modal.js:744-751 (VPR severity classification)
     *
     * @param {number} score - VPR score
     * @returns {string} Severity class name ("critical", "high", "medium", "low")
     */
    getVprSeverityClass(score) {
        if (score >= 9.0) {return "critical";}
        if (score >= 7.0) {return "high";}
        if (score >= 4.0) {return "medium";}
        return "low";
    }

    /**
     * Show modal with theme propagation
     *
     * Pattern source: device-security-modal.js:768-795 (theme propagation)
     */
    showModal() {
        try {
            // Detect current theme and propagate to modal
            const currentTheme = document.documentElement.getAttribute("data-bs-theme") || "light";
            const modalElement = document.getElementById("locationDetailsModal");

            // Propagate theme to modal
            if (modalElement) {
                modalElement.setAttribute("data-bs-theme", currentTheme);
            }

            // Initialize Bootstrap modal
            this.modal = new bootstrap.Modal(modalElement);

            // Add cleanup listener for modal close
            modalElement.addEventListener("hidden.bs.modal", () => {
                this.destroy();
            }, { once: true }); // Use once: true to prevent multiple listeners

            // Show modal
            this.modal.show();

        } catch (error) {
            console.error("[LocationDetailsModal] Error showing modal:", error);
        }
    }

    /**
     * Hide modal
     */
    hide() {
        if (this.modal) {
            this.modal.hide();
        }
    }

    /**
     * Cleanup on modal close
     */
    destroy() {
        // Cleanup grid API if exists
        if (this.gridApi) {
            this.gridApi.destroy();
            this.gridApi = null;
        }

        // Clear current data
        this.currentLocation = null;
        this.dataManager = null;
        this.activeFilter = null;

        // Dispose tooltips
        const tooltips = document.querySelectorAll('#locationInfo [data-bs-toggle="tooltip"]');
        tooltips.forEach(tooltipEl => {
            const tooltip = bootstrap.Tooltip.getInstance(tooltipEl);
            if (tooltip) {
                tooltip.dispose();
            }
        });
    }
}

// Global registration
if (typeof window !== "undefined") {
    window.locationDetailsModal = new LocationDetailsModal();
}
