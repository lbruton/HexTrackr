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
     * Get all templates
     * @returns {Promise<Array>} Array of template objects
     */
    async getAllTemplates() {
        return new Promise((resolve, reject) => {
            this.db.all(
                "SELECT * FROM email_templates WHERE is_active = 1 ORDER BY name",
                (err, rows) => {
                    if (err) {
                        return reject(new Error("Failed to fetch templates: " + err.message));
                    }

                    // Parse variables JSON for each template
                    const templates = rows.map(row => ({
                        ...row,
                        variables: JSON.parse(row.variables || "[]")
                    }));

                    resolve(templates);
                }
            );
        });
    }

    /**
     * Get template by ID
     * @param {number} id - Template ID
     * @returns {Promise<Object|null>} Template object or null if not found
     */
    async getTemplateById(id) {
        return new Promise((resolve, reject) => {
            this.db.get(
                "SELECT * FROM email_templates WHERE id = ? AND is_active = 1",
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
    }

    /**
     * Get template by name
     * @param {string} name - Template name
     * @returns {Promise<Object|null>} Template object or null if not found
     */
    async getTemplateByName(name) {
        return new Promise((resolve, reject) => {
            this.db.get(
                "SELECT * FROM email_templates WHERE name = ? AND is_active = 1",
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
        return new Promise((resolve, reject) => {
            const { template_content, description } = updates;

            this.db.run(
                `UPDATE email_templates
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
    }

    /**
     * Reset template to default content
     * @param {number} id - Template ID
     * @returns {Promise<Object|null>} Reset template or null if not found
     */
    async resetTemplateToDefault(id) {
        return new Promise((resolve, reject) => {
            this.db.run(
                `UPDATE email_templates
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
    }

    /**
     * Validate template content
     * @param {string} templateContent - Template content to validate
     * @returns {Object} Validation result with valid boolean and errors array
     */
    validateTemplate(templateContent) {
        const errors = [];

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

        return {
            valid: errors.length === 0,
            errors
        };
    }

    /**
     * Process template with ticket data (variable substitution)
     * @param {number} id - Template ID
     * @param {Object} ticketData - Ticket data for variable substitution
     * @returns {Promise<string|null>} Processed template content or null if template not found
     */
    async processTemplate(id, ticketData) {
        const template = await this.getTemplateById(id);
        if (!template) {
            return null;
        }

        return this.substituteVariables(template.template_content, ticketData);
    }

    /**
     * Substitute variables in template content
     * @param {string} templateContent - Template content with variables
     * @param {Object} ticketData - Ticket data for substitution
     * @returns {string} Processed template with variables replaced
     */
    substituteVariables(templateContent, ticketData) {
        // This will be expanded in Session 2, for now return basic substitution
        const replacements = {
            '[GREETING]': this.getSupervisorGreeting(ticketData.supervisor),
            '[SITE_NAME]': ticketData.site || "[Site Name]",
            '[LOCATION]': ticketData.location || "[Location]",
            '[HEXAGON_NUM]': ticketData.hexagonTicket || "[Hexagon #]",
            '[SERVICENOW_NUM]': ticketData.serviceNowTicket || "[ServiceNow #]",
            '[XT_NUMBER]': ticketData.xt_number || `XT#${ticketData.id}`,
            '[DEVICE_COUNT]': ticketData.devices ? ticketData.devices.length : 0,
            '[DEVICE_LIST]': this.generateDeviceList(ticketData.devices),
            '[DATE_DUE]': this.formatDate(ticketData.dateDue),
            '[DATE_SUBMITTED]': this.formatDate(ticketData.dateSubmitted),
            '[VULNERABILITY_SUMMARY]': '' // Added dynamically later
        };

        let processed = templateContent;
        for (const [tag, value] of Object.entries(replacements)) {
            processed = processed.replace(new RegExp(this.escapeRegex(tag), 'g'), value);
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

        return devices.map((device, index) => `${index + 1}. ${device}`).join('\\n');
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
        return string.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\\\$&');
    }
}

module.exports = TemplateService;