/**
 * HexTrackr Validation Service
 * Centralized validation logic extracted from server.js for better modularity
 * Handles input validation, data type validation, format validation, and sanitization
 */

const { isValidIPAddress, normalizeHostname, normalizeIPAddress } = require("../utils/helpers");

class ValidationService {

    // =============================================================================
    // INPUT VALIDATION METHODS
    // =============================================================================

    /**
     * Validate ticket input data
     * @param {object} data - Ticket data to validate
     * @returns {object} Validation result with success flag and errors
     */
    validateTicketInput(data) {
        const errors = [];
        const warnings = [];

        if (!data) {
            return { success: false, errors: ["No data provided"], warnings: [] };
        }

        // Required fields validation
        if (!data.xtNumber && !data.id) {
            errors.push("Either XT Number or ID is required");
        }

        // XT Number format validation
        if (data.xtNumber && !this.validateXTNumberFormat(data.xtNumber)) {
            warnings.push("XT Number format should be XT### (e.g., XT001)");
        }

        // Date validation
        if (data.dateSubmitted && !this.validateDateFormat(data.dateSubmitted)) {
            errors.push("Invalid date submitted format");
        }

        if (data.dateDue && !this.validateDateFormat(data.dateDue)) {
            errors.push("Invalid date due format");
        }

        // Status validation
        if (data.status && !this.validateTicketStatus(data.status)) {
            errors.push("Invalid ticket status");
        }

        // Field length validation
        const fieldLimits = {
            xtNumber: 20,
            hexagonTicket: 50,
            serviceNowTicket: 50,
            location: 100,
            supervisor: 100,
            tech: 100,
            notes: 1000
        };

        for (const [field, limit] of Object.entries(fieldLimits)) {
            if (data[field] && data[field].length > limit) {
                errors.push(`${field} exceeds maximum length of ${limit} characters`);
            }
        }

        return {
            success: errors.length === 0,
            errors,
            warnings
        };
    }

    /**
     * Validate vulnerability input data
     * @param {object} data - Vulnerability data to validate
     * @returns {object} Validation result with success flag and errors
     */
    validateVulnerabilityInput(data) {
        const errors = [];
        const warnings = [];

        if (!data) {
            return { success: false, errors: ["No data provided"], warnings: [] };
        }

        // Hostname validation
        if (data.hostname && !this.validateHostname(data.hostname)) {
            warnings.push("Hostname format may be invalid");
        }

        // IP Address validation
        if (data.ipAddress && !this.validateIPAddress(data.ipAddress)) {
            errors.push("Invalid IP address format");
        }

        // CVE validation
        if (data.cve && !this.validateCVEFormat(data.cve)) {
            warnings.push("CVE format may be invalid");
        }

        // Severity validation
        if (data.severity && !this.validateSeverity(data.severity)) {
            errors.push("Invalid severity level");
        }

        // VPR Score validation
        if (data.vprScore !== null && data.vprScore !== undefined && !this.validateVPRScore(data.vprScore)) {
            errors.push("VPR Score must be between 0 and 10");
        }

        // CVSS Score validation
        if (data.cvssScore !== null && data.cvssScore !== undefined && !this.validateCVSSScore(data.cvssScore)) {
            errors.push("CVSS Score must be between 0 and 10");
        }

        // Plugin ID validation
        if (data.pluginId && !this.validatePluginId(data.pluginId)) {
            warnings.push("Plugin ID format may be invalid");
        }

        // Required field checks
        if (!data.hostname && !data.ipAddress) {
            errors.push("Either hostname or IP address is required");
        }

        if (!data.description && !data.pluginName) {
            warnings.push("Description or plugin name should be provided");
        }

        return {
            success: errors.length === 0,
            errors,
            warnings
        };
    }

    /**
     * Validate CSV row data based on import type
     * @param {object} row - CSV row data
     * @param {string} type - Import type ("vulnerabilities" or "tickets")
     * @returns {object} Validation result with success flag and errors
     */
    validateCSVRow(row, type) {
        if (!row || typeof row !== "object") {
            return { success: false, errors: ["Invalid row data"], warnings: [] };
        }

        if (type === "vulnerabilities") {
            return this.validateVulnerabilityCSVRow(row);
        } else if (type === "tickets") {
            return this.validateTicketCSVRow(row);
        } else {
            return { success: false, errors: ["Unknown import type"], warnings: [] };
        }
    }

    /**
     * Validate entire import data structure
     * @param {array} data - Array of data objects to import
     * @param {string} type - Import type ("vulnerabilities" or "tickets")
     * @returns {object} Validation result with success flag, errors, and stats
     */
    validateImportData(data, type) {
        if (!Array.isArray(data)) {
            return { success: false, errors: ["Data must be an array"], warnings: [], stats: null };
        }

        if (data.length === 0) {
            return { success: false, errors: ["No data provided"], warnings: [], stats: null };
        }

        const results = {
            success: true,
            errors: [],
            warnings: [],
            stats: {
                totalRows: data.length,
                validRows: 0,
                invalidRows: 0,
                rowErrors: [],
                fieldStats: {}
            }
        };

        // Validate each row
        data.forEach((row, index) => {
            const validation = this.validateCSVRow(row, type);

            if (validation.success) {
                results.stats.validRows++;
            } else {
                results.stats.invalidRows++;
                results.stats.rowErrors.push({
                    row: index + 1,
                    errors: validation.errors,
                    warnings: validation.warnings
                });
            }

            // Collect warnings at import level
            if (validation.warnings.length > 0) {
                results.warnings.push(...validation.warnings.map(w => `Row ${index + 1}: ${w}`));
            }
        });

        // Fail import if too many invalid rows
        const invalidRowPercentage = (results.stats.invalidRows / results.stats.totalRows) * 100;
        if (invalidRowPercentage > 50) {
            results.success = false;
            results.errors.push(`Too many invalid rows (${invalidRowPercentage.toFixed(1)}%). Import aborted.`);
        }

        return results;
    }

    // =============================================================================
    // DATA TYPE VALIDATORS
    // =============================================================================

    /**
     * Validate IP address format
     * @param {string} ip - IP address to validate
     * @returns {boolean} True if valid IP address
     */
    validateIPAddress(ip) {
        if (!ip || typeof ip !== "string") {
            return false;
        }

        // Handle comma-separated IPs (validate first one)
        if (ip.includes(",")) {
            const ips = ip.split(",").map(i => i.trim());
            return ips.some(singleIP => isValidIPAddress(singleIP));
        }

        return isValidIPAddress(ip);
    }

    /**
     * Validate hostname format
     * @param {string} hostname - Hostname to validate
     * @returns {boolean} True if valid hostname
     */
    validateHostname(hostname) {
        if (!hostname || typeof hostname !== "string") {
            return false;
        }

        const cleaned = hostname.trim();
        if (cleaned.length === 0) {
            return false;
        }

        // Check if it's an IP (that's also valid)
        if (isValidIPAddress(cleaned)) {
            return true;
        }

        // Basic hostname validation
        const hostnameRegex = /^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
        return hostnameRegex.test(cleaned) && cleaned.length <= 255;
    }

    /**
     * Validate date format (supports multiple formats)
     * @param {string} date - Date string to validate
     * @returns {boolean} True if valid date format
     */
    validateDateFormat(date) {
        if (!date || typeof date !== "string") {
            return false;
        }

        const dateStr = date.trim();
        if (dateStr === "") {
            return true; // Empty dates are acceptable
        }

        // Try parsing as Date object
        const parsedDate = new Date(dateStr);
        if (isNaN(parsedDate.getTime())) {
            return false;
        }

        // Check if year is reasonable (1900-2100)
        const year = parsedDate.getFullYear();
        return year >= 1900 && year <= 2100;
    }

    /**
     * Validate VPR score range
     * @param {number} score - VPR score to validate
     * @returns {boolean} True if valid VPR score
     */
    validateVPRScore(score) {
        if (score === null || score === undefined) {
            return true; // Null/undefined scores are acceptable
        }

        const numScore = parseFloat(score);
        if (isNaN(numScore)) {
            return false;
        }

        return numScore >= 0 && numScore <= 10;
    }

    /**
     * Validate CVSS score range
     * @param {number} score - CVSS score to validate
     * @returns {boolean} True if valid CVSS score
     */
    validateCVSSScore(score) {
        if (score === null || score === undefined) {
            return true; // Null/undefined scores are acceptable
        }

        const numScore = parseFloat(score);
        if (isNaN(numScore)) {
            return false;
        }

        return numScore >= 0 && numScore <= 10;
    }

    // =============================================================================
    // FORMAT VALIDATORS
    // =============================================================================

    /**
     * Validate CVE format
     * @param {string} cve - CVE identifier to validate
     * @returns {boolean} True if valid CVE format
     */
    validateCVEFormat(cve) {
        if (!cve || typeof cve !== "string") {
            return true; // Empty CVE is acceptable
        }

        const cveStr = cve.trim();
        if (cveStr === "") {
            return true; // Empty CVE is acceptable
        }

        // Standard CVE pattern: CVE-YYYY-NNNN+
        const cvePattern = /^CVE-\d{4}-\d{4,}$/;

        // Cisco security advisory pattern: cisco-sa-...
        const ciscoPattern = /^cisco-sa-[\w-]+$/i;

        return cvePattern.test(cveStr) || ciscoPattern.test(cveStr);
    }

    /**
     * Validate email format
     * @param {string} email - Email address to validate
     * @returns {boolean} True if valid email format
     */
    validateEmailFormat(email) {
        if (!email || typeof email !== "string") {
            return false;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email.trim());
    }

    /**
     * Validate ticket number format (four-digit identifier)
     * @param {string} xtNumber - Ticket number to validate
     * @returns {boolean} True if valid ticket number format
     */
    validateXTNumberFormat(xtNumber) {
        if (!xtNumber || typeof xtNumber !== "string") {
            return false;
        }

        const xtRegex = /^\d{4}$/;
        return xtRegex.test(xtNumber.trim());
    }

    /**
     * Validate plugin ID format
     * @param {string} pluginId - Plugin ID to validate
     * @returns {boolean} True if valid plugin ID format
     */
    validatePluginId(pluginId) {
        if (!pluginId || typeof pluginId !== "string") {
            return true; // Empty plugin ID is acceptable
        }

        const pluginStr = pluginId.trim();
        if (pluginStr === "") {
            return true;
        }

        // Plugin IDs are typically numeric or alphanumeric
        const pluginRegex = /^[a-zA-Z0-9_-]+$/;
        return pluginRegex.test(pluginStr) && pluginStr.length <= 50;
    }

    // =============================================================================
    // BUSINESS RULE VALIDATORS
    // =============================================================================

    /**
     * Validate ticket status
     * @param {string} status - Ticket status to validate
     * @returns {boolean} True if valid ticket status
     */
    validateTicketStatus(status) {
        if (!status || typeof status !== "string") {
            return false;
        }

        const validStatuses = [
            "Open", "In Progress", "Pending", "Resolved", "Closed",
            "open", "in progress", "pending", "resolved", "closed",
            "OPEN", "IN PROGRESS", "PENDING", "RESOLVED", "CLOSED"
        ];

        return validStatuses.includes(status.trim());
    }

    /**
     * Validate vulnerability severity level
     * @param {string} severity - Severity level to validate
     * @returns {boolean} True if valid severity level
     */
    validateSeverity(severity) {
        if (!severity || typeof severity !== "string") {
            return false;
        }

        const validSeverities = [
            "Critical", "High", "Medium", "Low", "Info", "Informational",
            "critical", "high", "medium", "low", "info", "informational",
            "CRITICAL", "HIGH", "MEDIUM", "LOW", "INFO", "INFORMATIONAL"
        ];

        return validSeverities.includes(severity.trim());
    }

    /**
     * Validate vulnerability state
     * @param {string} state - Vulnerability state to validate
     * @returns {boolean} True if valid vulnerability state
     */
    validateVulnerabilityState(state) {
        if (!state || typeof state !== "string") {
            return true; // Default state is acceptable
        }

        const validStates = [
            "ACTIVE", "FIXED", "RESURFACED", "NEW", "OPEN", "CLOSED",
            "active", "fixed", "resurfaced", "new", "open", "closed"
        ];

        return validStates.includes(state.trim());
    }

    // =============================================================================
    // SANITIZATION UTILITIES
    // =============================================================================

    /**
     * Sanitize input string by removing dangerous characters
     * @param {string} input - Input string to sanitize
     * @returns {string} Sanitized string
     */
    sanitizeInput(input) {
        if (!input || typeof input !== "string") {
            return "";
        }

        return input.trim()
            .replace(/[<>]/g, "") // Remove potential HTML tags
            .replace(/['"]/g, "") // Remove quotes to prevent injection
            .replace(/[\x00-\x1f\x7f]/g, "") // Remove control characters
            .substring(0, 1000); // Limit length
    }

    /**
     * Sanitize and normalize hostname
     * @param {string} hostname - Hostname to sanitize
     * @returns {string} Sanitized hostname
     */
    sanitizeHostname(hostname) {
        if (!hostname || typeof hostname !== "string") {
            return "";
        }

        return normalizeHostname(hostname);
    }

    /**
     * Sanitize and normalize IP address
     * @param {string} ipAddress - IP address to sanitize
     * @returns {string|null} Sanitized IP address or null
     */
    sanitizeIPAddress(ipAddress) {
        if (!ipAddress || typeof ipAddress !== "string") {
            return null;
        }

        return normalizeIPAddress(ipAddress);
    }

    /**
     * Sanitize numeric input and convert to appropriate type
     * @param {any} value - Value to sanitize as number
     * @param {number} defaultValue - Default value if parsing fails
     * @returns {number} Sanitized number
     */
    sanitizeNumericInput(value, defaultValue = 0) {
        if (value === null || value === undefined || value === "") {
            return defaultValue;
        }

        const parsed = parseFloat(value);
        return isNaN(parsed) ? defaultValue : parsed;
    }

    /**
     * Sanitize and validate page/limit parameters for pagination
     * @param {any} page - Page number
     * @param {any} limit - Items per page
     * @returns {object} Sanitized pagination parameters
     */
    sanitizePaginationParams(page, limit) {
        const sanitizedPage = Math.max(1, parseInt(page, 10) || 1);
        const sanitizedLimit = Math.min(1000, Math.max(1, parseInt(limit, 10) || 50));

        return {
            page: sanitizedPage,
            limit: sanitizedLimit,
            offset: (sanitizedPage - 1) * sanitizedLimit
        };
    }

    // =============================================================================
    // CSV-SPECIFIC VALIDATORS
    // =============================================================================

    /**
     * Validate vulnerability CSV row
     * @param {object} row - CSV row data
     * @returns {object} Validation result
     */
    validateVulnerabilityCSVRow(row) {
        const errors = [];
        const warnings = [];

        // Check for required identification fields
        const hasHostname = row["asset.name"] || row["hostname"] || row["Host"];
        const hasIP = row["asset.display_ipv4_address"] || row["asset.ipv4_addresses"] || row["ip_address"] || row["IP Address"];

        if (!hasHostname && !hasIP) {
            errors.push("Missing both hostname and IP address");
        }

        // Validate IP if present
        if (hasIP && !this.validateIPAddress(hasIP)) {
            warnings.push("Invalid IP address format");
        }

        // Check for vulnerability identification
        const hasCVE = row["definition.cve"] || row["cve"] || row["CVE"];
        const hasPluginId = row["definition.id"] || row["plugin_id"] || row["Plugin ID"];
        const hasDescription = row["definition.description"] || row["definition.name"] || row["plugin_name"] || row["description"] || row["Description"];

        if (!hasCVE && !hasPluginId && !hasDescription) {
            errors.push("Missing vulnerability identification (CVE, Plugin ID, or Description)");
        }

        // Validate scores if present
        const vprScore = row["definition.vpr.score"] || row["definition.vpr_v2.score"] || row["vpr_score"] || row["VPR Score"];
        if (vprScore && !this.validateVPRScore(vprScore)) {
            warnings.push("Invalid VPR score");
        }

        const cvssScore = row["cvss_score"] || row["CVSS Score"];
        if (cvssScore && !this.validateCVSSScore(cvssScore)) {
            warnings.push("Invalid CVSS score");
        }

        // Validate severity if present
        const severity = row["severity"] || row["Severity"];
        if (severity && !this.validateSeverity(severity)) {
            warnings.push("Invalid severity level");
        }

        return {
            success: errors.length === 0,
            errors,
            warnings
        };
    }

    /**
     * Validate ticket CSV row
     * @param {object} row - CSV row data
     * @returns {object} Validation result
     */
    validateTicketCSVRow(row) {
        const errors = [];
        const warnings = [];

        // Check for required fields
        const hasXTNumber = row.xt_number || row["XT Number"];
        const hasId = row.id;

        if (!hasXTNumber && !hasId) {
            errors.push("Missing both XT Number and ID");
        }

        // Validate XT number format if present
        if (hasXTNumber && !this.validateXTNumberFormat(hasXTNumber)) {
            warnings.push("Invalid XT Number format");
        }

        // Validate dates if present
        const dateSubmitted = row.date_submitted || row["Date Submitted"];
        if (dateSubmitted && !this.validateDateFormat(dateSubmitted)) {
            warnings.push("Invalid date submitted format");
        }

        const dateDue = row.date_due || row["Date Due"];
        if (dateDue && !this.validateDateFormat(dateDue)) {
            warnings.push("Invalid date due format");
        }

        // Validate status if present
        const status = row.status || row["Status"];
        if (status && !this.validateTicketStatus(status)) {
            warnings.push("Invalid ticket status");
        }

        return {
            success: errors.length === 0,
            errors,
            warnings
        };
    }
}

module.exports = ValidationService;
