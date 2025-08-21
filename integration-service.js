/**
 * HexTrackr Integration Service
 * Manages bi-directional data flow between vulnerability dashboard and ticket system
 */

class IntegrationService {
    constructor() {
        this.vulnerabilityStorageKey = 'hexTrackrVulnerabilities';
        this.ticketStorageKey = 'hexTrackrTickets';
        this.integrationStorageKey = 'hexTrackrIntegrations';
        this.eventListeners = [];
    }

    /**
     * Initialize the integration service
     */
    init() {
        this.setupEventListeners();
        this.syncExistingData();
    }

    /**
     * Setup event listeners for cross-page communication
     */
    setupEventListeners() {
        // Listen for storage changes to sync between tabs
        window.addEventListener('storage', (e) => {
            if (e.key === this.integrationStorageKey) {
                this.handleIntegrationEvent(JSON.parse(e.newValue));
            }
        });

        // Listen for custom events within the same page
        document.addEventListener('vulnerabilityCreated', (e) => {
            this.handleVulnerabilityCreated(e.detail);
        });

        document.addEventListener('ticketCreated', (e) => {
            this.handleTicketCreated(e.detail);
        });
    }

    /**
     * Create a ticket from vulnerability data
     * @param {Object} vulnerabilityData - Vulnerability information
     * @returns {Object} Created ticket data
     */
    createTicketFromVulnerability(vulnerabilityData) {
        const ticket = {
            id: this.generateId(),
            hexagonTicketNumber: `HEX-${Date.now()}`,
            serviceNowNumber: '',
            dateSubmitted: new Date().toISOString().split('T')[0],
            dateDue: this.calculateDueDate(vulnerabilityData.severity),
            location: vulnerabilityData.location || 'Network Infrastructure',
            devices: vulnerabilityData.hostname ? [vulnerabilityData.hostname] : [],
            supervisor: '',
            tech: '',
            status: 'Open',
            priority: this.mapSeverityToPriority(vulnerabilityData.severity),
            vulnerabilityId: vulnerabilityData.id,
            cveId: vulnerabilityData.cve_id,
            vprScore: vulnerabilityData.vpr_score,
            notes: this.generateTicketNotes(vulnerabilityData),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        // Save ticket to localStorage
        this.saveTicket(ticket);

        // Create integration mapping
        this.createIntegrationMapping(vulnerabilityData.id, ticket.id, 'vulnerability-to-ticket');

        // Trigger event for other components
        this.triggerIntegrationEvent('ticketCreatedFromVulnerability', {
            vulnerability: vulnerabilityData,
            ticket: ticket
        });

        return ticket;
    }

    /**
     * Link vulnerability to existing ticket
     * @param {string} vulnerabilityId - Vulnerability ID
     * @param {string} ticketId - Ticket ID
     */
    linkVulnerabilityToTicket(vulnerabilityId, ticketId) {
        this.createIntegrationMapping(vulnerabilityId, ticketId, 'linked');
        
        // Update ticket with vulnerability reference
        const tickets = this.getTickets();
        const ticket = tickets.find(t => t.id === ticketId);
        if (ticket) {
            ticket.vulnerabilityId = vulnerabilityId;
            ticket.updatedAt = new Date().toISOString();
            this.saveTicket(ticket);
        }
    }

    /**
     * Get vulnerability data for a device
     * @param {string} deviceName - Device hostname
     * @returns {Array} Vulnerabilities for the device
     */
    getVulnerabilitiesForDevice(deviceName) {
        const vulnerabilities = this.getVulnerabilities();
        return vulnerabilities.filter(vuln => 
            vuln.hostname && vuln.hostname.toLowerCase() === deviceName.toLowerCase()
        );
    }

    /**
     * Get ticket data for a vulnerability
     * @param {string} vulnerabilityId - Vulnerability ID
     * @returns {Object|null} Associated ticket
     */
    getTicketForVulnerability(vulnerabilityId) {
        const integrations = this.getIntegrations();
        const mapping = integrations.find(i => 
            i.vulnerabilityId === vulnerabilityId && i.type !== 'deleted'
        );
        
        if (mapping) {
            const tickets = this.getTickets();
            return tickets.find(t => t.id === mapping.ticketId);
        }
        
        return null;
    }

    /**
     * Generate remediation template from vulnerability data
     * @param {Object} vulnerabilityData - Vulnerability information
     * @returns {string} Formatted template
     */
    generateRemediationTemplate(vulnerabilityData) {
        const severity = vulnerabilityData.severity || 'Unknown';
        const cve = vulnerabilityData.cve_id || 'N/A';
        const vpr = vulnerabilityData.vpr_score || 'N/A';
        const hostname = vulnerabilityData.hostname || 'Unknown Device';
        
        return `VULNERABILITY REMEDIATION TEMPLATE
========================================

Device: ${hostname}
CVE ID: ${cve}
Severity: ${severity}
VPR Score: ${vpr}
Plugin: ${vulnerabilityData.plugin_name || 'N/A'}

DESCRIPTION:
${vulnerabilityData.description || 'No description available'}

SOLUTION:
${vulnerabilityData.solution || 'Refer to vendor documentation'}

AFFECTED SYSTEMS:
- ${hostname}

REMEDIATION STEPS:
1. Review vulnerability details
2. Test patches in staging environment
3. Schedule maintenance window
4. Apply patches/configurations
5. Verify remediation
6. Update documentation

PRIORITY: ${this.mapSeverityToPriority(severity)}
ESTIMATED TIME: ${this.estimateRemediationTime(severity)}

Notes: ${vulnerabilityData.notes || 'None'}
`;
    }

    /**
     * Handle vulnerability created event
     * @param {Object} vulnerabilityData - New vulnerability data
     */
    handleVulnerabilityCreated(vulnerabilityData) {
        // Check if there's an existing ticket for this device
        const existingVulns = this.getVulnerabilitiesForDevice(vulnerabilityData.hostname);
        if (existingVulns.length > 1) {
            // Multiple vulnerabilities for same device - suggest ticket consolidation
            this.suggestTicketConsolidation(vulnerabilityData.hostname);
        }
    }

    /**
     * Handle ticket created event
     * @param {Object} ticketData - New ticket data
     */
    handleTicketCreated(ticketData) {
        // Auto-link vulnerabilities for devices in the ticket
        if (ticketData.devices && ticketData.devices.length > 0) {
            ticketData.devices.forEach(device => {
                const vulns = this.getVulnerabilitiesForDevice(device);
                vulns.forEach(vuln => {
                    if (!this.getTicketForVulnerability(vuln.id)) {
                        this.linkVulnerabilityToTicket(vuln.id, ticketData.id);
                    }
                });
            });
        }
    }

    /**
     * Calculate due date based on severity
     * @param {string} severity - Vulnerability severity
     * @returns {string} Due date (YYYY-MM-DD)
     */
    calculateDueDate(severity) {
        const today = new Date();
        let daysToAdd = 30; // Default 30 days
        
        switch (severity?.toLowerCase()) {
            case 'critical':
                daysToAdd = 7; // 1 week
                break;
            case 'high':
                daysToAdd = 14; // 2 weeks
                break;
            case 'medium':
                daysToAdd = 30; // 1 month
                break;
            case 'low':
                daysToAdd = 90; // 3 months
                break;
        }
        
        today.setDate(today.getDate() + daysToAdd);
        return today.toISOString().split('T')[0];
    }

    /**
     * Map severity to priority
     * @param {string} severity - Vulnerability severity
     * @returns {string} Priority level
     */
    mapSeverityToPriority(severity) {
        switch (severity?.toLowerCase()) {
            case 'critical':
                return 'Urgent';
            case 'high':
                return 'High';
            case 'medium':
                return 'Medium';
            case 'low':
                return 'Low';
            default:
                return 'Medium';
        }
    }

    /**
     * Estimate remediation time based on severity
     * @param {string} severity - Vulnerability severity
     * @returns {string} Time estimate
     */
    estimateRemediationTime(severity) {
        switch (severity?.toLowerCase()) {
            case 'critical':
                return '1-2 days';
            case 'high':
                return '3-5 days';
            case 'medium':
                return '1-2 weeks';
            case 'low':
                return '2-4 weeks';
            default:
                return '1-2 weeks';
        }
    }

    /**
     * Generate ticket notes from vulnerability data
     * @param {Object} vulnerabilityData - Vulnerability information
     * @returns {string} Formatted notes
     */
    generateTicketNotes(vulnerabilityData) {
        const notes = [];
        
        notes.push(`Auto-generated from vulnerability: ${vulnerabilityData.cve_id || vulnerabilityData.plugin_name}`);
        
        if (vulnerabilityData.vpr_score) {
            notes.push(`VPR Score: ${vulnerabilityData.vpr_score}`);
        }
        
        if (vulnerabilityData.exploitability_ease) {
            notes.push(`Exploitability: ${vulnerabilityData.exploitability_ease}`);
        }
        
        if (vulnerabilityData.patch_publication_date) {
            notes.push(`Patch Available: ${vulnerabilityData.patch_publication_date}`);
        }
        
        return notes.join(' | ');
    }

    /**
     * Create integration mapping between vulnerability and ticket
     * @param {string} vulnerabilityId - Vulnerability ID
     * @param {string} ticketId - Ticket ID
     * @param {string} type - Integration type
     */
    createIntegrationMapping(vulnerabilityId, ticketId, type) {
        const integrations = this.getIntegrations();
        const mapping = {
            id: this.generateId(),
            vulnerabilityId,
            ticketId,
            type,
            createdAt: new Date().toISOString()
        };
        
        integrations.push(mapping);
        localStorage.setItem(this.integrationStorageKey, JSON.stringify(integrations));
    }

    /**
     * Trigger integration event for cross-component communication
     * @param {string} eventType - Event type
     * @param {Object} data - Event data
     */
    triggerIntegrationEvent(eventType, data) {
        const event = {
            type: eventType,
            data,
            timestamp: new Date().toISOString()
        };
        
        // Store event for cross-tab communication
        localStorage.setItem(this.integrationStorageKey, JSON.stringify(event));
        
        // Dispatch custom event for same-page communication
        document.dispatchEvent(new CustomEvent(`integration:${eventType}`, { detail: data }));
    }

    /**
     * Handle integration events from other tabs/components
     * @param {Object} event - Integration event
     */
    handleIntegrationEvent(event) {
        switch (event.type) {
            case 'ticketCreatedFromVulnerability':
                this.refreshTicketList();
                break;
            case 'vulnerabilityLinkedToTicket':
                this.refreshVulnerabilityList();
                break;
        }
    }

    /**
     * Sync existing data to create missing integrations
     */
    syncExistingData() {
        const vulnerabilities = this.getVulnerabilities();
        const tickets = this.getTickets();
        
        // Auto-link based on device names
        tickets.forEach(ticket => {
            if (ticket.devices && ticket.devices.length > 0) {
                ticket.devices.forEach(device => {
                    const vulns = vulnerabilities.filter(v => 
                        v.hostname && v.hostname.toLowerCase() === device.toLowerCase()
                    );
                    
                    vulns.forEach(vuln => {
                        if (!this.getTicketForVulnerability(vuln.id)) {
                            this.linkVulnerabilityToTicket(vuln.id, ticket.id);
                        }
                    });
                });
            }
        });
    }

    /**
     * Suggest ticket consolidation for multiple vulnerabilities on same device
     * @param {string} deviceName - Device hostname
     */
    suggestTicketConsolidation(deviceName) {
        if (typeof showToast === 'function') {
            showToast(
                `Multiple vulnerabilities found for ${deviceName}. Consider consolidating into a single ticket.`,
                'info'
            );
        }
    }

    /**
     * Refresh ticket list (to be implemented by ticket page)
     */
    refreshTicketList() {
        if (typeof loadTickets === 'function') {
            loadTickets();
        }
    }

    /**
     * Refresh vulnerability list (to be implemented by vulnerability page)
     */
    refreshVulnerabilityList() {
        if (typeof loadVulnerabilities === 'function') {
            loadVulnerabilities();
        }
    }

    // Storage helper methods
    getVulnerabilities() {
        const stored = localStorage.getItem(this.vulnerabilityStorageKey);
        return stored ? JSON.parse(stored) : [];
    }

    getTickets() {
        const stored = localStorage.getItem(this.ticketStorageKey);
        return stored ? JSON.parse(stored) : [];
    }

    getIntegrations() {
        const stored = localStorage.getItem(this.integrationStorageKey);
        return stored ? JSON.parse(stored) : [];
    }

    saveTicket(ticket) {
        const tickets = this.getTickets();
        const existingIndex = tickets.findIndex(t => t.id === ticket.id);
        
        if (existingIndex >= 0) {
            tickets[existingIndex] = ticket;
        } else {
            tickets.push(ticket);
        }
        
        localStorage.setItem(this.ticketStorageKey, JSON.stringify(tickets));
    }

    generateId() {
        return 'hex_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }
}

// Initialize global integration service
window.integrationService = new IntegrationService();

// Auto-initialize on DOM load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.integrationService.init();
    });
} else {
    window.integrationService.init();
}
