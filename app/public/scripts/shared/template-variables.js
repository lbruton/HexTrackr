/**
 * Unified Template Variables for HexTrackr v1.0.21
 *
 * Centralized variable definitions used across all template editors.
 * Provides consistent naming and categorization for all available template variables.
 *
 * @fileoverview Unified template variable system
 * @author HexTrackr Development Team
 * @version 1.0.21
 */

/**
 * Unified template variables used across all template types
 * Variables are organized by category for better UX
 */
window.HexTrackrTemplateVariables = {
    /**
     * All available variables with unified naming
     */
    variables: [
        // Core Ticket Information
        { name: "[XT_NUMBER]", description: "Internal XT number", required: true, category: "ticket" },
        { name: "[HEXAGON_TICKET]", description: "Hexagon ticket number", required: false, category: "ticket" },
        { name: "[SERVICENOW_TICKET]", description: "ServiceNow ticket number", required: false, category: "ticket" },
        { name: "[STATUS]", description: "Ticket status", required: false, category: "ticket" },

        // Location Information
        { name: "[SITE_NAME]", description: "Site name", required: true, category: "location" },
        { name: "[LOCATION]", description: "Location name", required: true, category: "location" },

        // Date Information
        { name: "[DATE_SUBMITTED]", description: "Date submitted (formatted)", required: true, category: "dates" },
        { name: "[DATE_DUE]", description: "Due date (formatted)", required: true, category: "dates" },
        { name: "[GENERATED_TIME]", description: "Current date and time", required: false, category: "dates" },

        // Device Information
        { name: "[DEVICE_LIST]", description: "Formatted list of devices", required: true, category: "devices" },
        { name: "[DEVICE_COUNT]", description: "Number of devices", required: true, category: "devices" },

        // Personnel Information
        { name: "[SUPERVISOR]", description: "Supervisor name", required: false, category: "personnel" },
        { name: "[TECHNICIAN]", description: "Technician name", required: false, category: "personnel" },
        { name: "[GREETING]", description: "Supervisor greeting (first name or \"Team\")", required: false, category: "personnel" },

        // Content Information
        { name: "[NOTES]", description: "Additional notes", required: false, category: "content" },
        { name: "[VULNERABILITY_SUMMARY]", description: "Vulnerability assessment summary", required: false, category: "content" },
        { name: "[VULNERABILITY_DETAILS]", description: "Dynamic vulnerability data per device", required: false, category: "content" },

        // Vulnerability Counts
        { name: "[TOTAL_VULNERABILITIES]", description: "Total vulnerability count", required: false, category: "counts" },
        { name: "[CRITICAL_COUNT]", description: "Critical vulnerabilities count", required: false, category: "counts" },
        { name: "[HIGH_COUNT]", description: "High vulnerabilities count", required: false, category: "counts" },
        { name: "[MEDIUM_COUNT]", description: "Medium vulnerabilities count", required: false, category: "counts" },
        { name: "[LOW_COUNT]", description: "Low vulnerabilities count", required: false, category: "counts" }
    ],

    /**
     * Get variables filtered by category
     * @param {string|Array<string>} categories - Category or array of categories to include
     * @returns {Array} Filtered variables
     */
    getVariablesByCategory(categories) {
        if (typeof categories === "string") {
            categories = [categories];
        }
        return this.variables.filter(variable => categories.includes(variable.category));
    },

    /**
     * Get all variables (backward compatibility)
     * @returns {Array} All variables
     */
    getAllVariables() {
        return this.variables;
    },

    /**
     * Get variables recommended for specific template type
     * @param {string} templateType - 'ticket', 'email', or 'vulnerability'
     * @returns {Array} Recommended variables for the template type
     */
    getRecommendedVariables(templateType) {
        switch (templateType) {
            case "ticket":
                return this.getVariablesByCategory(["ticket", "location", "dates", "devices", "personnel", "content"]);
            case "email":
                return this.getVariablesByCategory(["ticket", "location", "dates", "devices", "personnel"]);
            case "vulnerability":
                return this.getVariablesByCategory(["ticket", "location", "dates", "devices", "content", "counts"]);
            default:
                return this.getAllVariables();
        }
    },

    /**
     * Category definitions for organizing variables
     */
    categories: {
        "ticket": { label: "Ticket Info", icon: "fas fa-ticket-alt" },
        "location": { label: "Location", icon: "fas fa-map-marker-alt" },
        "dates": { label: "Dates", icon: "fas fa-calendar-alt" },
        "devices": { label: "Devices", icon: "fas fa-server" },
        "personnel": { label: "Personnel", icon: "fas fa-users" },
        "content": { label: "Content", icon: "fas fa-file-text" },
        "counts": { label: "Counts", icon: "fas fa-chart-bar" }
    }
};