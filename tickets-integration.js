/**
 * Tickets Integration Service
 * Isolated integration between tickets and vulnerability data
 * This handles hostname lookups from the main vulnerability dashboard
 */

class TicketsIntegrationService {
    constructor() {
        this.vulnerabilityStorageKey = 'hexTrackrVulnerabilities';
        this.mainVulnDataKey = 'vulnData'; // Main dashboard storage key
    }

    /**
     * Get hostname suggestions from vulnerability data
     * @returns {Array} Array of unique hostnames
     */
    getHostnameSuggestions() {
        try {
            // Try to get data from main dashboard storage
            const mainVulnData = localStorage.getItem(this.mainVulnDataKey);
            const legacyVulnData = localStorage.getItem(this.vulnerabilityStorageKey);
            
            let hostnames = [];
            
            if (mainVulnData) {
                const data = JSON.parse(mainVulnData);
                if (Array.isArray(data)) {
                    hostnames = [...hostnames, ...data.map(item => item.hostname).filter(Boolean)];
                }
            }
            
            if (legacyVulnData) {
                const data = JSON.parse(legacyVulnData);
                if (Array.isArray(data)) {
                    hostnames = [...hostnames, ...data.map(item => item.hostname).filter(Boolean)];
                }
            }
            
            // Return unique hostnames sorted
            return [...new Set(hostnames)].sort();
        } catch (error) {
            console.warn('Could not load hostname suggestions:', error);
            return [];
        }
    }

    /**
     * Get vulnerability information for a specific hostname
     * @param {string} hostname - Target hostname
     * @returns {Array} Array of vulnerabilities for the hostname
     */
    getVulnerabilitiesForHostname(hostname) {
        try {
            const mainVulnData = localStorage.getItem(this.mainVulnDataKey);
            const legacyVulnData = localStorage.getItem(this.vulnerabilityStorageKey);
            
            let vulnerabilities = [];
            
            if (mainVulnData) {
                const data = JSON.parse(mainVulnData);
                if (Array.isArray(data)) {
                    vulnerabilities = [...vulnerabilities, ...data.filter(item => 
                        item.hostname && item.hostname.toLowerCase() === hostname.toLowerCase()
                    )];
                }
            }
            
            if (legacyVulnData) {
                const data = JSON.parse(legacyVulnData);
                if (Array.isArray(data)) {
                    vulnerabilities = [...vulnerabilities, ...data.filter(item => 
                        item.hostname && item.hostname.toLowerCase() === hostname.toLowerCase()
                    )];
                }
            }
            
            return vulnerabilities;
        } catch (error) {
            console.warn('Could not load vulnerabilities for hostname:', error);
            return [];
        }
    }

    /**
     * Get summary statistics for hostname
     * @param {string} hostname - Target hostname
     * @returns {Object} Summary statistics
     */
    getHostnameSummary(hostname) {
        const vulnerabilities = this.getVulnerabilitiesForHostname(hostname);
        
        const summary = {
            totalVulns: vulnerabilities.length,
            critical: vulnerabilities.filter(v => v.severity === 'Critical').length,
            high: vulnerabilities.filter(v => v.severity === 'High').length,
            medium: vulnerabilities.filter(v => v.severity === 'Medium').length,
            low: vulnerabilities.filter(v => v.severity === 'Low').length,
            vprTotal: vulnerabilities.reduce((sum, v) => sum + (parseFloat(v.vpr || v.vprScore || 0)), 0).toFixed(1)
        };
        
        return summary;
    }
}

// Initialize the service when script loads
window.ticketsIntegration = new TicketsIntegrationService();
