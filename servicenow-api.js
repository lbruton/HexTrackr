/**
 * ServiceNow API Integration Service
 * Provides integration with ServiceNow for ticket management and data synchronization
 * 
 * @description ServiceNow REST API integration for ITSM workflows
 * @author HexTrackr Team
 * @version 1.0.0
 */

class ServiceNowAPI {
    constructor(instanceUrl, username, password) {
        this.instanceUrl = instanceUrl.replace(/\/$/, ''); // Remove trailing slash
        this.username = username;
        this.password = password;
        this.baseUrl = `${this.instanceUrl}/api/now`;
        this.rateLimiter = {
            requests: 0,
            resetTime: Date.now() + 60000,
            maxRequests: 100 // ServiceNow typically allows higher limits
        };
        this.cache = new Map();
        this.cacheTimeout = 300000; // 5 minutes
    }

    /**
     * Get authentication headers
     * @returns {Object} Headers with basic auth
     */
    getAuthHeaders() {
        const credentials = btoa(`${this.username}:${this.password}`);
        return {
            'Authorization': `Basic ${credentials}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        };
    }

    /**
     * Check rate limiting
     */
    checkRateLimit() {
        const now = Date.now();
        if (now > this.rateLimiter.resetTime) {
            this.rateLimiter.requests = 0;
            this.rateLimiter.resetTime = now + 60000;
        }
        
        if (this.rateLimiter.requests >= this.rateLimiter.maxRequests) {
            throw new Error('ServiceNow API rate limit exceeded. Please wait before making more requests.');
        }
        
        this.rateLimiter.requests++;
    }

    /**
     * Test ServiceNow connection
     * @returns {Promise<Object>} Connection test result
     */
    async testConnection() {
        try {
            this.checkRateLimit();
            
            const response = await fetch(`${this.baseUrl}/table/sys_user?sysparm_limit=1`, {
                method: 'GET',
                headers: this.getAuthHeaders()
            });

            if (response.ok) {
                const data = await response.json();
                return {
                    success: true,
                    status: response.status,
                    message: 'Connection successful',
                    instanceUrl: this.instanceUrl,
                    userCount: data.result?.length || 0
                };
            } else {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
        } catch (error) {
            return {
                success: false,
                error: error.message,
                instanceUrl: this.instanceUrl
            };
        }
    }

    /**
     * Get incident by number
     * @param {string} incidentNumber - ServiceNow incident number (e.g., "INC0000123")
     * @returns {Promise<Object>} Incident details
     */
    async getIncident(incidentNumber) {
        try {
            this.checkRateLimit();
            
            const cacheKey = `incident_${incidentNumber}`;
            const cached = this.cache.get(cacheKey);
            if (cached && (Date.now() - cached.timestamp) < this.cacheTimeout) {
                return cached.data;
            }

            const query = `number=${encodeURIComponent(incidentNumber)}`;
            const response = await fetch(`${this.baseUrl}/table/incident?sysparm_query=${query}&sysparm_display_value=true`, {
                method: 'GET',
                headers: this.getAuthHeaders()
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            
            if (data.result && data.result.length > 0) {
                const incident = this.formatIncidentData(data.result[0]);
                
                // Cache the result
                this.cache.set(cacheKey, {
                    data: incident,
                    timestamp: Date.now()
                });
                
                return incident;
            } else {
                throw new Error(`Incident ${incidentNumber} not found`);
            }
        } catch (error) {
            console.error(`Error fetching incident ${incidentNumber}:`, error);
            throw error;
        }
    }

    /**
     * Search for incidents by criteria
     * @param {Object} criteria - Search criteria
     * @returns {Promise<Object[]>} Array of matching incidents
     */
    async searchIncidents(criteria) {
        try {
            this.checkRateLimit();
            
            let query = '';
            const queryParts = [];
            
            if (criteria.state) queryParts.push(`state=${criteria.state}`);
            if (criteria.priority) queryParts.push(`priority=${criteria.priority}`);
            if (criteria.assignedTo) queryParts.push(`assigned_to.name=${encodeURIComponent(criteria.assignedTo)}`);
            if (criteria.shortDescription) queryParts.push(`short_descriptionLIKE${encodeURIComponent(criteria.shortDescription)}`);
            if (criteria.category) queryParts.push(`category=${encodeURIComponent(criteria.category)}`);
            
            if (queryParts.length > 0) {
                query = '&sysparm_query=' + queryParts.join('^');
            }

            const limit = criteria.limit || 25;
            const response = await fetch(`${this.baseUrl}/table/incident?sysparm_limit=${limit}${query}&sysparm_display_value=true`, {
                method: 'GET',
                headers: this.getAuthHeaders()
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            return data.result.map(incident => this.formatIncidentData(incident));
        } catch (error) {
            console.error('Error searching incidents:', error);
            throw error;
        }
    }

    /**
     * Create a new incident
     * @param {Object} incidentData - Incident data
     * @returns {Promise<Object>} Created incident
     */
    async createIncident(incidentData) {
        try {
            this.checkRateLimit();
            
            const payload = {
                short_description: incidentData.shortDescription,
                description: incidentData.description,
                priority: incidentData.priority || '3',
                impact: incidentData.impact || '3',
                urgency: incidentData.urgency || '3',
                category: incidentData.category || 'Security',
                subcategory: incidentData.subcategory || 'Vulnerability Management',
                caller_id: incidentData.callerId,
                assignment_group: incidentData.assignmentGroup,
                work_notes: incidentData.workNotes
            };

            const response = await fetch(`${this.baseUrl}/table/incident`, {
                method: 'POST',
                headers: this.getAuthHeaders(),
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            return this.formatIncidentData(data.result);
        } catch (error) {
            console.error('Error creating incident:', error);
            throw error;
        }
    }

    /**
     * Update an existing incident
     * @param {string} sysId - ServiceNow sys_id of the incident
     * @param {Object} updateData - Data to update
     * @returns {Promise<Object>} Updated incident
     */
    async updateIncident(sysId, updateData) {
        try {
            this.checkRateLimit();
            
            const response = await fetch(`${this.baseUrl}/table/incident/${sysId}`, {
                method: 'PUT',
                headers: this.getAuthHeaders(),
                body: JSON.stringify(updateData)
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            return this.formatIncidentData(data.result);
        } catch (error) {
            console.error('Error updating incident:', error);
            throw error;
        }
    }

    /**
     * Add work notes to an incident
     * @param {string} incidentNumber - Incident number
     * @param {string} workNotes - Work notes to add
     * @returns {Promise<Object>} Updated incident
     */
    async addWorkNotes(incidentNumber, workNotes) {
        try {
            const incident = await this.getIncident(incidentNumber);
            return await this.updateIncident(incident.sysId, {
                work_notes: workNotes
            });
        } catch (error) {
            console.error('Error adding work notes:', error);
            throw error;
        }
    }

    /**
     * Get incident history/activities
     * @param {string} incidentNumber - Incident number
     * @returns {Promise<Object[]>} Incident activities
     */
    async getIncidentActivities(incidentNumber) {
        try {
            this.checkRateLimit();
            
            const incident = await this.getIncident(incidentNumber);
            const query = `document_id=${incident.sysId}`;
            
            const response = await fetch(`${this.baseUrl}/table/sys_audit?sysparm_query=${query}&sysparm_display_value=true&sysparm_order_by=sys_created_on`, {
                method: 'GET',
                headers: this.getAuthHeaders()
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            return data.result.map(activity => this.formatActivityData(activity));
        } catch (error) {
            console.error('Error getting incident activities:', error);
            throw error;
        }
    }

    /**
     * Format incident data for consistent output
     * @param {Object} rawIncident - Raw incident data from ServiceNow
     * @returns {Object} Formatted incident data
     */
    formatIncidentData(rawIncident) {
        return {
            sysId: rawIncident.sys_id,
            number: rawIncident.number,
            shortDescription: rawIncident.short_description,
            description: rawIncident.description,
            state: {
                value: rawIncident.state,
                display: rawIncident.state?.display_value || rawIncident.state
            },
            priority: {
                value: rawIncident.priority,
                display: rawIncident.priority?.display_value || rawIncident.priority
            },
            impact: {
                value: rawIncident.impact,
                display: rawIncident.impact?.display_value || rawIncident.impact
            },
            urgency: {
                value: rawIncident.urgency,
                display: rawIncident.urgency?.display_value || rawIncident.urgency
            },
            category: rawIncident.category,
            subcategory: rawIncident.subcategory,
            assignedTo: {
                value: rawIncident.assigned_to,
                display: rawIncident.assigned_to?.display_value || rawIncident.assigned_to
            },
            assignmentGroup: {
                value: rawIncident.assignment_group,
                display: rawIncident.assignment_group?.display_value || rawIncident.assignment_group
            },
            caller: {
                value: rawIncident.caller_id,
                display: rawIncident.caller_id?.display_value || rawIncident.caller_id
            },
            createdOn: rawIncident.sys_created_on,
            updatedOn: rawIncident.sys_updated_on,
            workNotes: rawIncident.work_notes,
            closeNotes: rawIncident.close_notes,
            resolution: rawIncident.resolution_code,
            url: `${this.instanceUrl}/nav_to.do?uri=incident.do?sys_id=${rawIncident.sys_id}`
        };
    }

    /**
     * Format activity data
     * @param {Object} rawActivity - Raw activity data from ServiceNow
     * @returns {Object} Formatted activity data
     */
    formatActivityData(rawActivity) {
        return {
            sysId: rawActivity.sys_id,
            fieldName: rawActivity.fieldname,
            oldValue: rawActivity.oldvalue,
            newValue: rawActivity.newvalue,
            user: rawActivity.user?.display_value || rawActivity.user,
            createdOn: rawActivity.sys_created_on,
            reason: rawActivity.reason
        };
    }

    /**
     * Extract ServiceNow ticket number from text
     * @param {string} text - Text that might contain SNOW ticket numbers
     * @returns {string[]} Array of found ticket numbers
     */
    static extractTicketNumbers(text) {
        const patterns = [
            /INC\d{7}/gi,      // Standard incident format
            /REQ\d{7}/gi,      // Request format
            /RITM\d{7}/gi,     // Request item format
            /CHG\d{7}/gi,      // Change format
            /PRB\d{7}/gi,      // Problem format
            /TASK\d{7}/gi      // Task format
        ];
        
        const matches = [];
        patterns.forEach(pattern => {
            const found = text.match(pattern);
            if (found) {
                matches.push(...found);
            }
        });
        
        return [...new Set(matches)]; // Remove duplicates
    }

    /**
     * Clear cache
     */
    clearCache() {
        this.cache.clear();
        console.log('ServiceNow cache cleared');
    }

    /**
     * Get cache statistics
     * @returns {Object} Cache statistics
     */
    getCacheStats() {
        return {
            size: this.cache.size,
            rateLimitRemaining: this.rateLimiter.maxRequests - this.rateLimiter.requests,
            rateLimitReset: new Date(this.rateLimiter.resetTime).toISOString()
        };
    }
}

// Export for use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ServiceNowAPI;
}

// Global instance for browser use
if (typeof window !== 'undefined') {
    window.ServiceNowAPI = ServiceNowAPI;
}
