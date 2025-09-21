/**
 * Template Service
 * Business logic for email template operations.
 * Part of v1.0.21 Template Editor feature implementation.
 *
 * Handles:
 * - Template CRUD operations
 * - Template processing with variable substitution
 * - Template validation
 * - Default template management
 *
 * @module TemplateService
 * @version 1.0.21
 */

class TemplateService {
    constructor() {
        this.db = null;
    }

    /**
     * Initialize service with database connection
     * @param {sqlite3.Database} database - Database connection from server.js
     */
    initialize(database) {
        this.db = database;
    }

    /**
     * Get template table name based on template name prefix
     * @param {string} templateName - Template name (e.g., 'default_email', 'default_ticket')
     * @returns {string} Table name
     */
    getTemplateTable(templateName) {
        if (templateName.includes('_email') || templateName === 'default_email') {
            return 'email_templates';
        } else if (templateName.includes('_ticket') || templateName === 'default_ticket') {
            return 'ticket_templates';
        } else if (templateName.includes('_vulnerability') || templateName === 'default_vulnerability') {
            return 'vulnerability_templates';
        }
        // Default to email_templates for backward compatibility
        return 'email_templates';
    }

    /**
     * Get template table name by ID by checking all tables
     * @param {number} id - Template ID
     * @returns {Promise<string|null>} Table name or null if not found
     */
    async getTemplateTableById(id) {
        return new Promise((resolve, reject) => {
            const tables = ['email_templates', 'ticket_templates', 'vulnerability_templates'];
            let found = false;
            let completed = 0;

            tables.forEach(tableName => {
                this.db.get(`SELECT id FROM ${tableName} WHERE id = ? AND is_active = 1`, [id], (err, row) => {
                    completed++;
                    if (err) {
                        return reject(new Error(`Failed to check ${tableName}: ${err.message}`));
                    }
                    if (row && !found) {
                        found = true;
                        resolve(tableName);
                    } else if (completed === tables.length && !found) {
                        resolve(null);
                    }
                });
            });
        });
    }

    /**
     * Get all templates from all template types
     * @returns {Promise<Array>} Array of template objects
     */
    async getAllTemplates() {
        return new Promise((resolve, reject) => {
            // Query all three template tables
            const queries = [
                "SELECT *, 'email' as template_type FROM email_templates WHERE is_active = 1",
                "SELECT *, 'ticket' as template_type FROM ticket_templates WHERE is_active = 1",
                "SELECT *, 'vulnerability' as template_type FROM vulnerability_templates WHERE is_active = 1"
            ];

            const unionQuery = queries.join(" UNION ALL ") + " ORDER BY name";

            this.db.all(unionQuery, (err, rows) => {
                if (err) {
                    return reject(new Error("Failed to fetch templates: " + err.message));
                }

                // Parse variables JSON for each template
                const templates = rows.map(row => ({
                    ...row,
                    variables: JSON.parse(row.variables || "[]")
                }));

                resolve(templates);
            });
        });
    }

    /**
     * Get template by ID
     * @param {number} id - Template ID
     * @returns {Promise<Object|null>} Template object or null if not found
     */
    async getTemplateById(id) {
        try {
            const tableName = await this.getTemplateTableById(id);
            if (!tableName) {
                return null;
            }

            return new Promise((resolve, reject) => {
                this.db.get(
                    `SELECT * FROM ${tableName} WHERE id = ? AND is_active = 1`,
                    [id],
                    (err, row) => {
                        if (err) {
                            return reject(new Error("Failed to fetch template: " + err.message));
                        }

                        if (!row) {
                            return resolve(null);
                        }

                        // Parse variables JSON
                        resolve({
                            ...row,
                            variables: JSON.parse(row.variables || "[]")
                        });
                    }
                );
            });
        } catch (error) {
            throw error;
        }
    }

    /**
     * Get template by name
     * @param {string} name - Template name
     * @returns {Promise<Object|null>} Template object or null if not found
     */
    async getTemplateByName(name) {
        return new Promise((resolve, reject) => {
            const tableName = this.getTemplateTable(name);

            this.db.get(
                `SELECT * FROM ${tableName} WHERE name = ? AND is_active = 1`,
                [name],
                (err, row) => {
                    if (err) {
                        return reject(new Error("Failed to fetch template: " + err.message));
                    }

                    if (!row) {
                        return resolve(null);
                    }

                    // Parse variables JSON
                    resolve({
                        ...row,
                        variables: JSON.parse(row.variables || "[]")
                    });
                }
            );
        });
    }

    /**
     * Update template content
     * @param {number} id - Template ID
     * @param {Object} updates - Updates to apply
     * @returns {Promise<Object|null>} Updated template or null if not found
     */
    async updateTemplate(id, updates) {
        try {
            const tableName = await this.getTemplateTableById(id);
            if (!tableName) {
                return null;
            }

            return new Promise((resolve, reject) => {
                const { template_content, description } = updates;

                this.db.run(
                    `UPDATE ${tableName}
                     SET template_content = ?,
                         description = COALESCE(?, description),
                         updated_at = CURRENT_TIMESTAMP
                     WHERE id = ? AND is_active = 1`,
                    [template_content, description, id],
                    function(err) {
                        if (err) {
                            return reject(new Error("Failed to update template: " + err.message));
                        }

                        if (this.changes === 0) {
                            return resolve(null);
                        }

                        // Return the updated template
                        resolve({ id, template_content, description, updated: true });
                    }
                );
            });
        } catch (error) {
            throw error;
        }
    }

    /**
     * Reset template to default content
     * @param {number} id - Template ID
     * @returns {Promise<Object|null>} Reset template or null if not found
     */
    async resetTemplateToDefault(id) {
        try {
            const tableName = await this.getTemplateTableById(id);
            if (!tableName) {
                return null;
            }

            return new Promise((resolve, reject) => {
                this.db.run(
                    `UPDATE ${tableName}
                     SET template_content = default_content,
                         updated_at = CURRENT_TIMESTAMP
                     WHERE id = ? AND is_active = 1`,
                    [id],
                    function(err) {
                        if (err) {
                            return reject(new Error("Failed to reset template: " + err.message));
                        }

                        if (this.changes === 0) {
                            return resolve(null);
                        }

                        resolve({ id, reset: true });
                    }
                );
            });
        } catch (error) {
            throw error;
        }
    }

    /**
     * Validate template content with comprehensive checks
     * @param {string} templateContent - Template content to validate
     * @returns {Object} Validation result with valid boolean, errors array, and warnings
     */
    validateTemplate(templateContent) {
        const errors = [];
        const warnings = [];
        const variableMapping = this.getVariableMapping();
        const knownVariables = Object.keys(variableMapping);

        // Basic structure validation
        if (!templateContent || typeof templateContent !== 'string') {
            errors.push("Template content must be a non-empty string");
            return { valid: false, errors, warnings };
        }

        // Check for unmatched brackets
        const openBrackets = (templateContent.match(/\[/g) || []).length;
        const closeBrackets = (templateContent.match(/\]/g) || []).length;

        if (openBrackets !== closeBrackets) {
            errors.push("Unmatched brackets detected");
        }

        // Check for empty variables (like [])
        if (templateContent.includes("[]")) {
            errors.push("Empty variable brackets found");
        }

        // Check for nested brackets
        if (templateContent.includes("[[") || templateContent.includes("]]")) {
            errors.push("Nested brackets are not allowed");
        }

        // Extract all variables from template
        const variableMatches = templateContent.match(/\[[A-Z_]+\]/g) || [];
        const uniqueVariables = [...new Set(variableMatches)];

        // Check for unknown variables
        const unknownVariables = uniqueVariables.filter(variable =>
            !knownVariables.includes(variable)
        );

        if (unknownVariables.length > 0) {
            warnings.push(`Unknown variables: ${unknownVariables.join(', ')}`);
        }

        // Check for unused known variables
        const usedVariables = uniqueVariables.filter(variable =>
            knownVariables.includes(variable)
        );
        const unusedRequiredVariables = knownVariables.filter(variable => {
            const config = variableMapping[variable];
            return config.required && !usedVariables.includes(variable);
        });

        if (unusedRequiredVariables.length > 0) {
            warnings.push(`Missing required variables: ${unusedRequiredVariables.join(', ')}`);
        }

        // Check for potentially problematic patterns
        if (templateContent.includes('[[') || templateContent.includes(']]')) {
            errors.push("Double brackets are not allowed");
        }

        // Check for malformed variables (brackets with spaces or special chars)
        const malformedVariables = templateContent.match(/\[[^A-Z_\]]*[^A-Z_\]]+[^A-Z_\]]*\]/g);
        if (malformedVariables) {
            errors.push(`Malformed variables found: ${malformedVariables.join(', ')}`);
        }

        // Check template length (reasonable limits)
        if (templateContent.length > 50000) {
            warnings.push("Template is very large (>50KB), consider breaking it down");
        }

        // Check for potential injection patterns
        const dangerousPatterns = [
            /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
            /javascript:/gi,
            /on\w+\s*=/gi
        ];

        for (const pattern of dangerousPatterns) {
            if (pattern.test(templateContent)) {
                errors.push("Potentially dangerous content detected (script tags, javascript:, event handlers)");
                break;
            }
        }

        return {
            valid: errors.length === 0,
            errors,
            warnings,
            variables: {
                found: uniqueVariables,
                unknown: unknownVariables,
                missing_required: unusedRequiredVariables
            }
        };
    }

    /**
     * Process template with ticket data (variable substitution)
     * @param {number} id - Template ID
     * @param {Object} ticketData - Ticket data for variable substitution
     * @param {Object} options - Additional options (vulnerabilityData, fallbackToHardcoded)
     * @returns {Promise<string|null>} Processed template content or null if template not found
     */
    async processTemplate(id, ticketData, options = {}) {
        try {
            const template = await this.getTemplateById(id);
            if (!template) {
                if (options.fallbackToHardcoded) {
                    console.warn(`Template ${id} not found, using hardcoded fallback`);
                    return this.processHardcodedTemplate(ticketData, options);
                }
                return null;
            }

            return this.substituteVariables(template.template_content, ticketData, options);
        } catch (error) {
            console.error(`Error processing template ${id}:`, error);

            if (options.fallbackToHardcoded) {
                console.warn('Database error, falling back to hardcoded template');
                return this.processHardcodedTemplate(ticketData, options);
            }

            throw error;
        }
    }

    /**
     * Process template using hardcoded fallback (mirrors tickets.js generateEmailMarkdown)
     * @param {Object} ticketData - Ticket data for substitution
     * @param {Object} options - Additional options (vulnerabilityData)
     * @returns {string} Processed hardcoded template
     */
    processHardcodedTemplate(ticketData, options = {}) {
        // This mirrors the hardcoded template from tickets.js but with our variable system
        const hardcodedTemplate = `Subject: Hexagon Work Order - [SITE_NAME] - [HEXAGON_NUM]

Hello [GREETING],

We have submitted a Hexagon work order ([HEXAGON_NUM]) for the [SITE_NAME] site.

There are critical security patches that must be applied within 30 days.

Please see the attached notes for more information. If you have any questions or concerns please feel free to reach out to NetOps at netops@oneok.com.

**MAINTENANCE DETAILS:**
• Location: [SITE_NAME] - [LOCATION]
• Hexagon Ticket: [HEXAGON_NUM]
• ServiceNow Reference: [SERVICENOW_NUM]
• Required Completion: [DATE_DUE]

**AFFECTED SYSTEMS:**
[DEVICE_COUNT] device${ticketData.devices && ticketData.devices.length > 1 ? 's' : ''} require security patches and will need to be rebooted:
[DEVICE_LIST]

**ACTION REQUIRED:**
• Schedule a maintenance window of at least 2 hours
• Contact ITCC at 918-732-4822 with ServiceNow ticket [SERVICENOW_NUM]
• Coordinate with NetOps for patch application

**TIMELINE:**
• Request Submitted: [DATE_SUBMITTED]
• Required Completion: [DATE_DUE]
• Maintenance Window: To be scheduled

[VULNERABILITY_SUMMARY]

Please confirm receipt and provide your proposed maintenance window.

---
Generated by HexTrackr v1.0.21 (Fallback Mode)
Ticket ID: [XT_NUMBER]`;

        return this.substituteVariables(hardcodedTemplate, ticketData, options);
    }

    /**
     * Get template with automatic fallback handling
     * @param {string} templateName - Template name (default: 'default_email')
     * @param {Object} ticketData - Ticket data for processing
     * @param {Object} options - Additional options
     * @returns {Promise<string>} Processed template content
     */
    async getProcessedTemplate(templateName = 'default_email', ticketData, options = {}) {
        try {
            // Try to get template by name first
            const template = await this.getTemplateByName(templateName);

            if (template) {
                return this.substituteVariables(template.template_content, ticketData, options);
            } else {
                console.warn(`Template '${templateName}' not found, using hardcoded fallback`);
                return this.processHardcodedTemplate(ticketData, options);
            }
        } catch (error) {
            console.error('Database error getting template, using hardcoded fallback:', error);
            return this.processHardcodedTemplate(ticketData, options);
        }
    }

    /**
     * Get variable mapping configuration
     * @returns {Object} Variable definitions with processing functions
     */
    getVariableMapping() {
        return {
            '[GREETING]': {
                description: 'Supervisor first name or Team for multiple supervisors',
                required: false,
                fallback: '[Supervisor First Name]',
                processor: (ticketData) => this.getSupervisorGreeting(ticketData && ticketData.supervisor)
            },
            '[SITE_NAME]': {
                description: 'Site name from ticket',
                required: true,
                fallback: '[Site Name]',
                processor: (ticketData) => (ticketData && ticketData.site) || '[Site Name]'
            },
            '[SITE]': {
                description: 'Site name from ticket (alias)',
                required: true,
                fallback: '[Site]',
                processor: (ticketData) => (ticketData && ticketData.site) || '[Site]'
            },
            '[LOCATION]': {
                description: 'Location from ticket',
                required: true,
                fallback: '[Location]',
                processor: (ticketData) => (ticketData && ticketData.location) || '[Location]'
            },
            '[STATUS]': {
                description: 'Ticket status',
                required: true,
                fallback: '[Status]',
                processor: (ticketData) => (ticketData && ticketData.status) || '[Status]'
            },
            '[HEXAGON_NUM]': {
                description: 'Hexagon ticket number',
                required: false,
                fallback: '[Hexagon #]',
                processor: (ticketData) => (ticketData && (ticketData.hexagon_ticket || ticketData.hexagonTicket)) || '[Hexagon #]'
            },
            '[HEXAGON_TICKET]': {
                description: 'Hexagon ticket number (alias)',
                required: false,
                fallback: '[Hexagon Ticket]',
                processor: (ticketData) => (ticketData && (ticketData.hexagon_ticket || ticketData.hexagonTicket)) || '[Hexagon Ticket]'
            },
            '[SERVICENOW_NUM]': {
                description: 'ServiceNow ticket number',
                required: false,
                fallback: '[ServiceNow #]',
                processor: (ticketData) => (ticketData && (ticketData.servicenow_ticket || ticketData.serviceNowTicket)) || '[ServiceNow #]'
            },
            '[SERVICENOW_TICKET]': {
                description: 'ServiceNow ticket number (alias)',
                required: false,
                fallback: '[ServiceNow Ticket]',
                processor: (ticketData) => (ticketData && (ticketData.servicenow_ticket || ticketData.serviceNowTicket)) || '[ServiceNow Ticket]'
            },
            '[XT_NUMBER]': {
                description: 'Internal XT number',
                required: true,
                fallback: 'XT#[ID]',
                processor: (ticketData) => (ticketData && ticketData.xt_number) || `XT#${(ticketData && ticketData.id) || 'UNKNOWN'}`
            },
            '[DEVICE_COUNT]': {
                description: 'Number of devices in ticket',
                required: true,
                fallback: '0',
                processor: (ticketData) => String((ticketData && ticketData.devices) ? ticketData.devices.length : 0)
            },
            '[DEVICE_LIST]': {
                description: 'Enumerated list of devices',
                required: true,
                fallback: 'Device list to be confirmed',
                processor: (ticketData) => this.generateDeviceList(ticketData && ticketData.devices)
            },
            '[DATE_DUE]': {
                description: 'Due date formatted',
                required: true,
                fallback: '[Due Date]',
                processor: (ticketData) => this.formatDate(ticketData && (ticketData.date_due || ticketData.dateDue)) || '[Due Date]'
            },
            '[DATE_SUBMITTED]': {
                description: 'Submission date formatted',
                required: true,
                fallback: '[Submitted Date]',
                processor: (ticketData) => this.formatDate(ticketData && (ticketData.date_submitted || ticketData.dateSubmitted)) || '[Submitted Date]'
            },
            '[SUPERVISOR]': {
                description: 'Supervisor name',
                required: false,
                fallback: 'N/A',
                processor: (ticketData) => (ticketData && ticketData.supervisor) || 'N/A'
            },
            '[TECHNICIAN]': {
                description: 'Technician name',
                required: false,
                fallback: 'N/A',
                processor: (ticketData) => (ticketData && ticketData.technician) || 'N/A'
            },
            '[NOTES]': {
                description: 'Additional notes',
                required: false,
                fallback: 'N/A',
                processor: (ticketData) => (ticketData && (ticketData.notes || ticketData.additional_notes)) || 'N/A'
            },
            '[GENERATED_TIME]': {
                description: 'Current date and time',
                required: false,
                fallback: new Date().toLocaleString(),
                processor: () => new Date().toLocaleString()
            },
            '[VULNERABILITY_SUMMARY]': {
                description: 'Dynamic vulnerability summary (generated at runtime)',
                required: false,
                fallback: '',
                processor: (ticketData, vulnerabilityData) => {
                    if (vulnerabilityData) {
                        return this.generateVulnerabilitySummary(ticketData, vulnerabilityData);
                    }
                    return this.fallback;
                }
            }
        };
    }

    /**
     * Substitute variables in template content with enhanced processing
     * @param {string} templateContent - Template content with variables
     * @param {Object} ticketData - Ticket data for substitution
     * @param {Object} options - Additional options (vulnerabilityData, etc.)
     * @returns {string} Processed template with variables replaced
     */
    substituteVariables(templateContent, ticketData, options = {}) {
        const variableMapping = this.getVariableMapping();
        let processed = templateContent;

        // Process each variable
        for (const [variable, config] of Object.entries(variableMapping)) {
            try {
                // Set fallback in config context for processors
                config.fallback = config.fallback;

                // Process the variable with ticket data and options
                let value;
                if (variable === '[VULNERABILITY_SUMMARY]') {
                    value = config.processor(ticketData, options.vulnerabilityData);
                } else {
                    value = config.processor(ticketData);
                }

                // Replace all instances of the variable
                const regex = new RegExp(this.escapeRegex(variable), 'g');
                processed = processed.replace(regex, String(value || config.fallback));

            } catch (error) {
                console.error(`Error processing variable ${variable}:`, error);
                // Use fallback on error
                const regex = new RegExp(this.escapeRegex(variable), 'g');
                processed = processed.replace(regex, config.fallback);
            }
        }

        // Check for unprocessed variables and warn
        const remainingVariables = processed.match(/\[[A-Z_]+\]/g);
        if (remainingVariables) {
            console.warn('Unprocessed variables found:', remainingVariables);
        }

        return processed;
    }

    /**
     * Helper: Extract supervisor greeting (from tickets.js)
     * @param {string} supervisorField - Supervisor field value
     * @returns {string} Appropriate greeting
     */
    getSupervisorGreeting(supervisorField) {
        if (!supervisorField || supervisorField === "N/A") {
            return "[Supervisor First Name]";
        }

        const trimmed = supervisorField.trim();

        // Check for multiple supervisors
        const commaCount = (trimmed.match(/,/g) || []).length;
        if (trimmed.includes(';') || trimmed.includes('&') || commaCount > 1) {
            return "Team";
        }

        // Handle "Last, First" format
        if (commaCount === 1) {
            const parts = trimmed.split(',');
            if (parts.length >= 2) {
                const firstName = parts[1].trim().split(' ')[0];
                if (firstName) return firstName;
            }
        }

        // Handle "First Last" format
        const parts = trimmed.split(' ');
        if (parts.length > 0 && parts[0]) {
            return parts[0];
        }

        return trimmed;
    }

    /**
     * Helper: Generate device list
     * @param {Array} devices - Array of device names
     * @returns {string} Formatted device list
     */
    generateDeviceList(devices) {
        if (!devices || devices.length === 0) {
            return "Device list to be confirmed";
        }

        return devices.map((device, index) => `${index + 1}. ${device}`).join('\n');
    }

    /**
     * Helper: Generate vulnerability summary for email
     * @param {Object} ticketData - Ticket data
     * @param {Array} vulnerabilityData - Vulnerability data for devices
     * @returns {string} Formatted vulnerability summary
     */
    generateVulnerabilitySummary(ticketData, vulnerabilityData) {
        if (!vulnerabilityData || vulnerabilityData.length === 0) {
            return '';
        }

        // Group vulnerabilities by device and severity
        const deviceSummary = {};
        vulnerabilityData.forEach(vuln => {
            const device = vuln.hostname || 'Unknown Device';
            if (!deviceSummary[device]) {
                deviceSummary[device] = { total: 0, critical: 0, high: 0, medium: 0, low: 0 };
            }
            deviceSummary[device].total++;

            const severity = (vuln.severity || 'unknown').toLowerCase();
            if (deviceSummary[device][severity] !== undefined) {
                deviceSummary[device][severity]++;
            }
        });

        let summary = '\n**VULNERABILITY SUMMARY:**\n';

        Object.entries(deviceSummary).forEach(([device, counts]) => {
            summary += `• ${device}: ${counts.total} vulnerabilities`;

            const severityBreakdown = [];
            if (counts.critical > 0) severityBreakdown.push(`${counts.critical} Critical`);
            if (counts.high > 0) severityBreakdown.push(`${counts.high} High`);
            if (counts.medium > 0) severityBreakdown.push(`${counts.medium} Medium`);
            if (counts.low > 0) severityBreakdown.push(`${counts.low} Low`);

            if (severityBreakdown.length > 0) {
                summary += ` (${severityBreakdown.join(', ')})`;
            }
            summary += '\n';
        });

        return summary;
    }

    /**
     * Helper: Format date
     * @param {string} dateString - Date string to format
     * @returns {string} Formatted date
     */
    formatDate(dateString) {
        if (!dateString) return "[Date]";

        try {
            const date = new Date(dateString);
            return date.toLocaleDateString();
        } catch (e) {
            return dateString;
        }
    }

    /**
     * Helper: Escape regex special characters
     * @param {string} string - String to escape
     * @returns {string} Escaped string
     */
    escapeRegex(string) {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }
}

module.exports = TemplateService;