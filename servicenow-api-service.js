/**
 * ServiceNow API Integration Service
 * Provides bi-directional integration with ServiceNow ITSM platform
 * Supports ticket creation, updates, and status synchronization
 */

class ServiceNowAPIService {
    constructor(instanceUrl, username, password) {
        this.instanceUrl = instanceUrl.replace(/\/$/, ''); // Remove trailing slash
        this.credentials = btoa(`${username}:${password}`); // Basic auth
        this.baseUrl = `${this.instanceUrl}/api/now`;
        this.rateLimit = {
            requests: 0,
            resetTime: Date.now() + 60000 // Reset every minute
        };
    }

    /**
     * Rate limiting for ServiceNow API (100 requests per minute)
     */
    checkRateLimit() {
        const now = Date.now();
        if (now > this.rateLimit.resetTime) {
            this.rateLimit.requests = 0;
            this.rateLimit.resetTime = now + 60000;
        }

        if (this.rateLimit.requests >= 100) {
            throw new Error('ServiceNow API rate limit exceeded. Please wait before making more requests.');
        }

        this.rateLimit.requests++;
    }

    /**
     * Make authenticated request to ServiceNow API
     * @param {string} endpoint - API endpoint
     * @param {string} method - HTTP method
     * @param {Object} data - Request body data
     * @returns {Promise<Object>} API response
     */
    async makeRequest(endpoint, method = 'GET', data = null) {
        this.checkRateLimit();

        const url = `${this.baseUrl}${endpoint}`;
        const headers = {
            'Authorization': `Basic ${this.credentials}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'User-Agent': 'HexTrackr/1.0'
        };

        const config = {
            method,
            headers
        };

        if (data && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
            config.body = JSON.stringify(data);
        }

        try {
            const response = await fetch(url, config);
            
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`ServiceNow API error ${response.status}: ${errorText}`);
            }

            return await response.json();
        } catch (error) {
            console.error('ServiceNow API request failed:', error);
            throw error;
        }
    }

    /**
     * Test ServiceNow connection
     * @returns {Promise<Object>} Connection test result
     */
    async testConnection() {
        try {
            const response = await this.makeRequest('/table/sys_user?sysparm_limit=1');
            
            return {
                success: true,
                message: 'ServiceNow connection successful',
                instanceUrl: this.instanceUrl,
                userCount: response.result ? response.result.length : 0,
                timestamp: new Date().toISOString()
            };
        } catch (error) {
            return {
                success: false,
                message: `ServiceNow connection failed: ${error.message}`,
                instanceUrl: this.instanceUrl,
                timestamp: new Date().toISOString()
            };
        }
    }

    /**
     * Get ServiceNow incident by number
     * @param {string} incidentNumber - ServiceNow incident number (e.g., INC0001234)
     * @returns {Promise<Object>} Incident details
     */
    async getIncident(incidentNumber) {
        try {
            const response = await this.makeRequest(
                `/table/incident?sysparm_query=number=${incidentNumber}&sysparm_limit=1`
            );

            if (response.result && response.result.length > 0) {
                const incident = response.result[0];
                
                return {
                    success: true,
                    incident: {
                        number: incident.number,
                        sysId: incident.sys_id,
                        shortDescription: incident.short_description,
                        description: incident.description,
                        state: this.mapIncidentState(incident.state),
                        priority: this.mapPriority(incident.priority),
                        assignedTo: incident.assigned_to?.display_value || 'Unassigned',
                        assignmentGroup: incident.assignment_group?.display_value || '',
                        category: incident.category,
                        subcategory: incident.subcategory,
                        createdOn: incident.sys_created_on,
                        updatedOn: incident.sys_updated_on,
                        resolvedOn: incident.resolved_at,
                        closeNotes: incident.close_notes,
                        workNotes: incident.work_notes
                    }
                };
            } else {
                return {
                    success: false,
                    message: `Incident ${incidentNumber} not found`
                };
            }
        } catch (error) {
            console.error('Error fetching ServiceNow incident:', error);
            return {
                success: false,
                message: error.message
            };
        }
    }

    /**
     * Create new ServiceNow incident
     * @param {Object} incidentData - Incident data
     * @returns {Promise<Object>} Created incident details
     */
    async createIncident(incidentData) {
        const {
            shortDescription,
            description,
            priority = '3', // Medium priority by default
            category = 'Security',
            subcategory = 'Vulnerability',
            assignmentGroup = '',
            caller = ''
        } = incidentData;

        const data = {
            short_description: shortDescription,
            description: description,
            priority: priority,
            category: category,
            subcategory: subcategory,
            state: '1', // New
            impact: this.mapPriorityToImpact(priority),
            urgency: this.mapPriorityToUrgency(priority)
        };

        if (assignmentGroup) {
            data.assignment_group = assignmentGroup;
        }

        if (caller) {
            data.caller_id = caller;
        }

        try {
            const response = await this.makeRequest('/table/incident', 'POST', data);
            
            if (response.result) {
                return {
                    success: true,
                    incident: {
                        number: response.result.number,
                        sysId: response.result.sys_id,
                        state: this.mapIncidentState(response.result.state),
                        priority: this.mapPriority(response.result.priority),
                        createdOn: response.result.sys_created_on
                    }
                };
            } else {
                throw new Error('Invalid response from ServiceNow');
            }
        } catch (error) {
            console.error('Error creating ServiceNow incident:', error);
            return {
                success: false,
                message: error.message
            };
        }
    }

    /**
     * Update ServiceNow incident
     * @param {string} incidentNumber - Incident number
     * @param {Object} updateData - Data to update
     * @returns {Promise<Object>} Update result
     */
    async updateIncident(incidentNumber, updateData) {
        try {
            // First get the incident to find its sys_id
            const getResponse = await this.makeRequest(
                `/table/incident?sysparm_query=number=${incidentNumber}&sysparm_limit=1`
            );

            if (!getResponse.result || getResponse.result.length === 0) {
                return {
                    success: false,
                    message: `Incident ${incidentNumber} not found`
                };
            }

            const sysId = getResponse.result[0].sys_id;
            
            // Update the incident
            const updateResponse = await this.makeRequest(
                `/table/incident/${sysId}`,
                'PUT',
                updateData
            );

            return {
                success: true,
                message: `Incident ${incidentNumber} updated successfully`,
                updatedFields: Object.keys(updateData)
            };
        } catch (error) {
            console.error('Error updating ServiceNow incident:', error);
            return {
                success: false,
                message: error.message
            };
        }
    }

    /**
     * Add work notes to ServiceNow incident
     * @param {string} incidentNumber - Incident number
     * @param {string} workNotes - Work notes to add
     * @returns {Promise<Object>} Update result
     */
    async addWorkNotes(incidentNumber, workNotes) {
        return await this.updateIncident(incidentNumber, {
            work_notes: workNotes
        });
    }

    /**
     * Get all incidents assigned to a specific group
     * @param {string} assignmentGroup - Assignment group name
     * @param {string} state - Optional state filter ('open', 'in_progress', 'resolved', etc.)
     * @returns {Promise<Object>} List of incidents
     */
    async getIncidentsByGroup(assignmentGroup, state = 'open') {
        try {
            let query = `assignment_group.name=${assignmentGroup}`;
            
            if (state === 'open') {
                query += '^state!=6^state!=7'; // Not resolved or closed
            } else if (state) {
                const stateValue = this.mapStateToValue(state);
                query += `^state=${stateValue}`;
            }

            const response = await this.makeRequest(
                `/table/incident?sysparm_query=${encodeURIComponent(query)}&sysparm_limit=100`
            );

            if (response.result) {
                const incidents = response.result.map(incident => ({
                    number: incident.number,
                    shortDescription: incident.short_description,
                    state: this.mapIncidentState(incident.state),
                    priority: this.mapPriority(incident.priority),
                    assignedTo: incident.assigned_to?.display_value || 'Unassigned',
                    createdOn: incident.sys_created_on,
                    updatedOn: incident.sys_updated_on
                }));

                return {
                    success: true,
                    incidents,
                    count: incidents.length
                };
            } else {
                return {
                    success: false,
                    message: 'No incidents found'
                };
            }
        } catch (error) {
            console.error('Error fetching incidents by group:', error);
            return {
                success: false,
                message: error.message
            };
        }
    }

    /**
     * Map ServiceNow incident state values to readable names
     * @param {string} stateValue - Numeric state value
     * @returns {string} Readable state name
     */
    mapIncidentState(stateValue) {
        const stateMap = {
            '1': 'new',
            '2': 'in_progress',
            '3': 'on_hold',
            '6': 'resolved',
            '7': 'closed',
            '8': 'cancelled'
        };
        return stateMap[stateValue] || 'unknown';
    }

    /**
     * Map ServiceNow priority values to readable names
     * @param {string} priorityValue - Numeric priority value
     * @returns {string} Readable priority name
     */
    mapPriority(priorityValue) {
        const priorityMap = {
            '1': 'critical',
            '2': 'high',
            '3': 'medium',
            '4': 'low',
            '5': 'planning'
        };
        return priorityMap[priorityValue] || 'medium';
    }

    /**
     * Map state names to ServiceNow values
     * @param {string} stateName - Readable state name
     * @returns {string} Numeric state value
     */
    mapStateToValue(stateName) {
        const stateMap = {
            'new': '1',
            'in_progress': '2',
            'on_hold': '3',
            'resolved': '6',
            'closed': '7',
            'cancelled': '8'
        };
        return stateMap[stateName] || '1';
    }

    /**
     * Map priority to impact for incident creation
     * @param {string} priority - Priority value
     * @returns {string} Impact value
     */
    mapPriorityToImpact(priority) {
        const impactMap = {
            '1': '1', // Critical -> High impact
            '2': '2', // High -> Medium impact
            '3': '3', // Medium -> Low impact
            '4': '3', // Low -> Low impact
            '5': '3'  // Planning -> Low impact
        };
        return impactMap[priority] || '3';
    }

    /**
     * Map priority to urgency for incident creation
     * @param {string} priority - Priority value
     * @returns {string} Urgency value
     */
    mapPriorityToUrgency(priority) {
        const urgencyMap = {
            '1': '1', // Critical -> High urgency
            '2': '2', // High -> Medium urgency
            '3': '3', // Medium -> Low urgency
            '4': '3', // Low -> Low urgency
            '5': '3'  // Planning -> Low urgency
        };
        return urgencyMap[priority] || '3';
    }

    /**
     * Get rate limiting statistics
     * @returns {Object} Rate limit stats
     */
    getRateLimitStats() {
        return {
            requests: this.rateLimit.requests,
            resetTime: new Date(this.rateLimit.resetTime).toISOString(),
            remaining: Math.max(0, 100 - this.rateLimit.requests)
        };
    }
}

// Export for both browser and Node.js environments
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ServiceNowAPIService;
} else if (typeof window !== 'undefined') {
    window.ServiceNowAPIService = ServiceNowAPIService;
}
