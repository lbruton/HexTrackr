/**
 * Template Editor Module for HexTrackr v1.0.21
 *
 * Provides interactive template editing functionality for email templates.
 * Features: edit mode toggle, variable reference panel, syntax validation,
 * insert-at-cursor, preview mode, and template persistence.
 *
 * @fileoverview Template editor for customizing email templates
 * @author HexTrackr Development Team
 * @version 1.0.21
 */

/* global authState, bootstrap, DOMPurify */

/**
 * Template Editor Class
 * Manages the template editing interface and functionality
 */
class TemplateEditor {
    constructor() {
        this.isEditMode = false;
        this.currentTemplate = null;
        this.currentTicketData = null;
        this.validationTimeout = null;
        this.isRestoring = false;

        // Use unified variables from the global variable system
        this.variables = window.HexTrackrTemplateVariables?.getRecommendedVariables("email") || [];

        this.init();
    }

    /**
     * Initialize the template editor
     */
    init() {
        // Populate variable reference panel when DOM is ready
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", () => this.populateVariablePanel());
        } else {
            this.populateVariablePanel();
        }

        // Set up real-time validation
        this.setupValidation();
    }

    /**
     * Toggle between view and edit modes
     */
    async toggleEditMode() {
        const viewMode = document.getElementById("emailViewMode");
        const editMode = document.getElementById("emailEditMode");

        if (!this.isEditMode) {
            // Entering edit mode
            try {
                await this.loadTemplateForEditing();

                viewMode.style.display = "none";
                editMode.style.display = "block";
                this.isEditMode = true;

                // Focus on editor
                const editor = document.getElementById("templateEditor");
                if (editor) {
                    editor.focus();
                }

                // Ensure variable panel is populated
                this.populateVariablePanel();

                this.showToast("Email template edit mode enabled", "info");
            } catch (error) {
                console.error("Error entering edit mode:", error);
                this.showToast("Failed to enter email template edit mode", "error");
            }
        } else {
            // Exiting edit mode
            viewMode.style.display = "block";
            editMode.style.display = "none";
            this.isEditMode = false;

            this.showToast("Email template edit mode disabled", "info");
        }
    }

    /**
     * Load template for editing
     * @param {boolean} forceRefresh - When true, bypass cache and fetch from server
     */
    async loadTemplateForEditing(forceRefresh = false) {
        try {
            // If forceRefresh is true, always fetch from API
            if (forceRefresh) {
                console.log("[TemplateEditor] Force refresh requested, fetching from API");
                const response = await authState.authenticatedFetch("/api/templates/by-name/default_email");

                if (!response.ok) {
                    if (response.status === 404) {
                        console.warn("Email template not found in database, creating default template");
                        await this.createDefaultTemplate();
                        return;
                    }
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }

                const result = await response.json();
                if (result.success) {
                    this.currentTemplate = result.data;
                    this.cacheTemplate(this.currentTemplate);
                    console.log("[TemplateEditor] Template refreshed from API");
                } else {
                    throw new Error(result.error || "Failed to load template");
                }
            } else {
                // Try cache first, then API if no cache
                const cachedTemplate = this.getCachedTemplate("default_email");
                if (cachedTemplate) {
                    this.currentTemplate = cachedTemplate;
                    console.log("[TemplateEditor] Using cached template");
                } else if (!this.currentTemplate) {
                    const response = await authState.authenticatedFetch("/api/templates/by-name/default_email");

                    if (!response.ok) {
                        if (response.status === 404) {
                            console.warn("Email template not found in database, creating default template");
                            await this.createDefaultTemplate();
                            return;
                        }
                        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                    }

                    const result = await response.json();
                    if (result.success) {
                        this.currentTemplate = result.data;
                        this.cacheTemplate(this.currentTemplate);
                        console.log("[TemplateEditor] Template loaded from API");
                    } else {
                        throw new Error(result.error || "Failed to load template");
                    }
                }
            }

            // Temporarily disable aggressive template validation to prevent unwanted restoration
            // TODO: Implement more robust template validation that doesn't interfere with user edits
            if (!this.isRestoring && this.currentTemplate && !this.isTemplateContentValid(this.currentTemplate.template_content)) {
                console.warn("Template content validation failed, but allowing user content to load for editing.");
                console.log("Template content preview:", this.currentTemplate.template_content.substring(0, 100));
            }

            const editor = document.getElementById("templateEditor");
            if (editor && this.currentTemplate) {
                editor.value = this.currentTemplate.template_content;
                this.validateTemplate();
            }
        } catch (error) {
            console.error("Error loading template:", error);
            try {
                await this.createDefaultTemplate();
                this.showToast("Created default email template", "info");
            } catch (createError) {
                console.error("Failed to create default template:", createError);
                this.showToast("Failed to load template for editing", "error");
                throw error;
            }
        }
    }

    /**
     * Populate the variable reference dropdown with organized categories
     */
    populateVariablePanel() {
        const dropdown = document.getElementById("emailVariableDropdown");
        if (!dropdown) {return;}

        dropdown.innerHTML = "";
        dropdown.className = "dropdown-menu variable-dropdown";

        // Get categories from the global variable system
        const categories = window.HexTrackrTemplateVariables?.categories || {};

        // Group variables by category
        const variablesByCategory = {};
        this.variables.forEach(variable => {
            const category = variable.category || "other";
            if (!variablesByCategory[category]) {
                variablesByCategory[category] = [];
            }
            variablesByCategory[category].push(variable);
        });

        // Create dropdown items organized by category
        Object.keys(variablesByCategory).forEach((categoryKey, index) => {
            const categoryInfo = categories[categoryKey] || { label: categoryKey, icon: "fas fa-tag" };
            const variables = variablesByCategory[categoryKey];

            // Add category header
            const categoryHeader = document.createElement("li");
            categoryHeader.innerHTML = `
                <h6 class="dropdown-header">
                    <i class="${categoryInfo.icon}"></i>
                    ${categoryInfo.label}
                </h6>
            `;
            dropdown.appendChild(categoryHeader);

            // Add variables for this category
            variables.forEach(variable => {
                const item = document.createElement("li");
                const button = document.createElement("button");
                button.type = "button";
                button.className = `dropdown-item ${variable.required ? "required" : ""}`;
                button.onclick = () => this.insertVariable(variable.name);
                button.title = `${variable.description}${variable.required ? " (Required)" : " (Optional)"}`;

                button.innerHTML = `
                    <span>${variable.name}</span>
                    <small class="variable-description">${variable.description}</small>
                `;

                item.appendChild(button);
                dropdown.appendChild(item);
            });

            // Add divider between categories (except for last category)
            if (index < Object.keys(variablesByCategory).length - 1) {
                const divider = document.createElement("li");
                divider.innerHTML = "<hr class=\"dropdown-divider\">";
                dropdown.appendChild(divider);
            }
        });
    }

    /**
     * Insert variable at cursor position
     * @param {string} variable - Variable to insert
     */
    insertVariable(variable) {
        const editor = document.getElementById("templateEditor");
        if (!editor) {return;}

        const start = editor.selectionStart;
        const end = editor.selectionEnd;
        const text = editor.value;

        // Insert variable at cursor position
        const newText = text.substring(0, start) + variable + text.substring(end);
        editor.value = newText;

        // Set cursor position after inserted variable
        const newPosition = start + variable.length;
        editor.setSelectionRange(newPosition, newPosition);
        editor.focus();

        // Trigger validation
        this.validateTemplate();

        this.showToast(`Inserted ${variable}`, "success");
    }

    /**
     * Preview template with current ticket data
     */
    async previewTemplate() {
        const editor = document.getElementById("templateEditor");
        if (!editor || !this.currentTicketData) {
            this.showToast("No ticket data available for preview", "warning");
            return;
        }

        try {
            const templateContent = editor.value;

            // If we have a current template ID, try server-side processing
            if (this.currentTemplate?.id) {
                try {
                    const response = await authState.authenticatedFetch(`/api/templates/${this.currentTemplate.id}/preview`, {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify({
                            template_content: templateContent,
                            ticketData: this.currentTicketData
                        })
                    });

                    if (response.ok) {
                        const result = await response.json();
                        if (result.success) {
                            this.showPreviewModal(result.data.processed_content);
                            return;
                        }
                    }
                } catch (serverError) {
                    console.warn("Server-side preview failed, using client-side processing:", serverError);
                }
            }

            // Fallback to client-side processing
            const processedContent = this.processTemplate(templateContent, this.currentTicketData);
            this.showPreviewModal(processedContent);

        } catch (error) {
            console.error("Error previewing template:", error);
            this.showToast("Failed to generate preview", "error");
        }
    }

    /**
     * Show preview modal
     * @param {string} previewContent - Processed template content
     */
    showPreviewModal(previewContent) {
        // Create a simple preview modal
        const modalHtml = `
            <div class="modal fade" id="templatePreviewModal" tabindex="-1">
                <div class="modal-dialog modal-lg">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">
                                <i class="fas fa-eye me-2"></i>Template Preview
                            </h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <pre class="terminal-content">${DOMPurify.sanitize(previewContent)}</pre>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Remove existing preview modal if any
        const existingModal = document.getElementById("templatePreviewModal");
        if (existingModal) {
            existingModal.remove();
        }

        // Add modal to document
        document.body.insertAdjacentHTML("beforeend", modalHtml);

        // Show the modal
        const previewModal = new bootstrap.Modal(document.getElementById("templatePreviewModal"));
        previewModal.show();

        // Clean up when modal is hidden
        document.getElementById("templatePreviewModal").addEventListener("hidden.bs.modal", function() {
            this.remove();
        });
    }

    /**
     * Save template changes
     */
    async saveTemplate() {
        const editor = document.getElementById("templateEditor");
        if (!editor) {
            this.showToast("Editor not found", "error");
            return;
        }

        try {
            const templateContent = editor.value;

            // Validate before saving
            const validation = await this.validateTemplateContent(templateContent);
            if (!validation.valid) {
                this.showToast(`Cannot save: ${validation.errors.join(", ")}`, "error");
                return;
            }

            // If no current template, create a new one
            if (!this.currentTemplate) {
                await this.createDefaultTemplate();
                if (!this.currentTemplate) {
                    this.showToast("Failed to create template", "error");
                    return;
                }
            }

            console.log(`[TemplateEditor] Saving template with ID: ${this.currentTemplate.id}, category: 'email', name: 'default_email'`);
            console.log(`[TemplateEditor] Template content preview: ${templateContent.substring(0, 100)}...`);

            const response = await authState.authenticatedFetch(`/api/templates/${this.currentTemplate.id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    template_content: templateContent,
                    category: "email",
                    template_name: "default_email"
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const result = await response.json();
            if (result.success) {
                this.showToast("Email template saved successfully", "success");

                // Update current template
                this.currentTemplate.template_content = templateContent;

                // Update cache
                this.cacheTemplate(this.currentTemplate);

                // Refresh the email view if it's loaded
                if (window.ticketManager && window.ticketManager.loadEmailMarkdownForModal) {
                    window.ticketManager.loadEmailMarkdownForModal();
                }
            } else {
                throw new Error(result.error || "Save failed");
            }
        } catch (error) {
            console.error("Error saving template:", error);
            this.showToast("Failed to save email template", "error");
        }
    }

    /**
     * Reset template to default
     */
    async resetToDefault() {
        if (!this.currentTemplate) {return;}

        if (!confirm("Reset template to default? This will lose all custom changes.")) {
            return;
        }

        try {
            this.isRestoring = true;
            const response = await authState.authenticatedFetch(`/api/templates/${this.currentTemplate.id}/reset`, {
                method: "POST"
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const result = await response.json();
            if (result.success) {
                this.showToast("Template reset to default", "success");

                // Reload template for editing
                this.clearTemplateCache("default_email");
                await this.loadTemplateForEditing(true);
            } else {
                throw new Error(result.error || "Reset failed");
            }
        } catch (error) {
            console.error("Error resetting template:", error);
            this.showToast("Failed to reset template", "error");
        } finally {
            this.isRestoring = false;
        }
    }

    /**
     * Set up real-time validation
     */
    setupValidation() {
        // Add event listener when DOM is ready
        const setupListener = () => {
            const editor = document.getElementById("templateEditor");
            if (editor) {
                editor.addEventListener("input", () => {
                    // Debounce validation
                    clearTimeout(this.validationTimeout);
                    this.validationTimeout = setTimeout(() => {
                        this.validateTemplate();
                    }, 500);
                });
            }
        };

        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", setupListener);
        } else {
            setupListener();
        }
    }

    /**
     * Validate template content in real-time
     */
    async validateTemplate() {
        const editor = document.getElementById("templateEditor");
        const validationDiv = document.getElementById("templateValidation");

        if (!editor || !validationDiv) {return;}

        const content = editor.value;
        if (!content.trim()) {
            validationDiv.innerHTML = "";
            return;
        }

        try {
            const validation = await this.validateTemplateContent(content);
            this.displayValidationResults(validation);
        } catch (error) {
            console.error("Validation error:", error);
        }
    }

    /**
     * Validate template content via API
     * @param {string} content - Template content to validate
     * @returns {Object} Validation result
     */
    async validateTemplateContent(content) {
        // For now, implement client-side validation
        // This could be enhanced to call the backend validation API

        const errors = [];
        const warnings = [];

        // Basic bracket matching
        const openBrackets = (content.match(/\[/g) || []).length;
        const closeBrackets = (content.match(/\]/g) || []).length;

        if (openBrackets !== closeBrackets) {
            errors.push("Unmatched brackets detected");
        }

        // Check for empty variables
        if (content.includes("[]")) {
            errors.push("Empty variable brackets found");
        }

        // Extract variables
        const variableMatches = content.match(/\[[A-Z_]+\]/g) || [];
        const uniqueVariables = [...new Set(variableMatches)];
        const knownVariables = this.variables.map(v => v.name);

        // Check for unknown variables
        const unknownVariables = uniqueVariables.filter(v => !knownVariables.includes(v));
        if (unknownVariables.length > 0) {
            warnings.push(`Unknown variables: ${unknownVariables.join(", ")}`);
        }

        return {
            valid: errors.length === 0,
            errors,
            warnings,
            variables: {
                found: uniqueVariables,
                unknown: unknownVariables
            }
        };
    }

    /**
     * Display validation results
     * @param {Object} validation - Validation result
     */
    displayValidationResults(validation) {
        const validationDiv = document.getElementById("templateValidation");
        if (!validationDiv) {return;}

        let html = "";

        if (validation.errors.length > 0) {
            html += `<div class="alert alert-danger alert-sm mb-2">
                <i class="fas fa-exclamation-triangle me-1"></i>
                ${validation.errors.join(", ")}
            </div>`;
        }

        if (validation.warnings.length > 0) {
            html += `<div class="alert alert-warning alert-sm mb-2">
                <i class="fas fa-exclamation-circle me-1"></i>
                ${validation.warnings.join(", ")}
            </div>`;
        }

        if (validation.valid && validation.warnings.length === 0) {
            html = `<div class="alert alert-success alert-sm mb-2">
                <i class="fas fa-check me-1"></i>
                Template is valid
            </div>`;
        }

        validationDiv.innerHTML = html;
    }

    /**
     * Set current ticket data for preview
     * @param {Object} ticketData - Current ticket data
     */
    setTicketData(ticketData) {
        this.currentTicketData = ticketData;
    }

    /**
     * Show toast notification
     * @param {string} message - Message to show
     * @param {string} type - Type of toast (success, error, warning, info)
     */
    showToast(message, type = "info") {
        // Use existing toast system if available, otherwise fallback to alert
        if (window.ticketManager && window.ticketManager.showToast) {
            window.ticketManager.showToast(message, type);
        } else {
            console.log(`[${type.toUpperCase()}] ${message}`);
        }
    }

    /**
     * Process template with ticket data (client-side)
     * @param {string} template - Template content
     * @param {Object} ticket - Ticket data
     * @returns {string} Processed content
     */
    processTemplate(template, ticket) {
        let processed = template;

        // Replace variables with actual data
        const replacements = {
            "[GREETING]": this.getSupervisorGreeting(ticket.supervisor),
            "[SITE_NAME]": ticket.site || "N/A",
            "[SITE]": ticket.site || "N/A",
            "[LOCATION]": ticket.location || "N/A",
            "[STATUS]": ticket.status || "N/A",
            "[HEXAGON_NUM]": ticket.hexagon_ticket || ticket.hexagonTicket || "N/A",
            "[HEXAGON_TICKET]": ticket.hexagon_ticket || ticket.hexagonTicket || "N/A",
            "[SERVICENOW_NUM]": ticket.servicenow_ticket || ticket.serviceNowTicket || "N/A",
            "[SERVICENOW_TICKET]": ticket.servicenow_ticket || ticket.serviceNowTicket || "N/A",
            "[XT_NUMBER]": ticket.xt_number || ticket.xtNumber || `${ticket.id}`,
            "[DEVICE_COUNT]": ticket.devices ? ticket.devices.length : 0,
            "[DEVICE_LIST]": this.formatDeviceList(ticket.devices),
            "[DATE_DUE]": this.formatDate(ticket.date_due || ticket.dateDue),
            "[DATE_SUBMITTED]": this.formatDate(ticket.date_submitted || ticket.dateSubmitted),
            "[SUPERVISOR]": ticket.supervisor || "N/A",
            "[TECHNICIAN]": ticket.technician || "N/A",
            "[NOTES]": ticket.notes || ticket.additional_notes || "N/A",
            "[GENERATED_TIME]": new Date().toLocaleString(),
            "[VULNERABILITY_SUMMARY]": this.generateVulnerabilitySummary(ticket)
        };

        Object.keys(replacements).forEach(variable => {
            const regex = new RegExp(this.escapeRegex(variable), "g");
            processed = processed.replace(regex, replacements[variable]);
        });

        return processed;
    }

    /**
     * Helper: Get supervisor greeting
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
        if (trimmed.includes(";") || trimmed.includes("&") || commaCount > 1) {
            return "Team";
        }

        // Single supervisor - try to extract first name
        let name = trimmed;
        if (trimmed.includes(",")) {
            const parts = trimmed.split(",").map(p => p.trim());
            name = parts.length > 1 ? parts[1] : parts[0];
        }

        const words = name.split(/\s+/);
        return words[0] || "[Supervisor First Name]";
    }

    /**
     * Helper: Format device list
     * @param {Array} devices - Device array
     * @returns {string} Formatted device list
     */
    formatDeviceList(devices) {
        if (!devices || devices.length === 0) {
            return "Device list to be confirmed";
        }
        return devices.map((device, index) => `${index + 1}. ${device}`).join("\n");
    }

    /**
     * Helper: Format date
     * @param {string} dateString - Date string
     * @returns {string} Formatted date
     */
    formatDate(dateString) {
        if (!dateString) {return "N/A";}
        try {
            return new Date(dateString).toLocaleDateString();
        } catch (_error) {
            return dateString;
        }
    }

    /**
     * Helper: Generate vulnerability summary
     * @param {Object} ticket - Ticket data
     * @returns {string} Vulnerability summary
     */
    generateVulnerabilitySummary(_ticket) {
        return "";
    }

    /**
     * Helper: Escape regex special characters
     * @param {string} string - String to escape
     * @returns {string} Escaped string
     */
    escapeRegex(string) {
        return string.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&");
    }

    /**
     * Cache template in localStorage
     * @param {Object} template - Template object to cache
     */
    cacheTemplate(template) {
        try {
            const cacheKey = `hextrackr_email_template_${template.name}`;
            const cacheData = {
                template: template,
                timestamp: Date.now(),
                expires: Date.now() + (60 * 60 * 1000), // 1 hour expiry
                category: "email"
            };
            localStorage.setItem(cacheKey, JSON.stringify(cacheData));
            console.log(`[TemplateEditor] Cached template with key: ${cacheKey}`);
        } catch (error) {
            console.warn("Failed to cache template:", error);
        }
    }

    /**
     * Get template from localStorage cache
     * @param {string} templateName - Name of template to retrieve
     * @returns {Object|null} Cached template or null if not found/expired
     */
    getCachedTemplate(templateName) {
        try {
            const cacheKey = `hextrackr_email_template_${templateName}`;
            const cached = localStorage.getItem(cacheKey);

            if (!cached) {
                console.log(`[TemplateEditor] No cached template found for key: ${cacheKey}`);
                return null;
            }

            const cacheData = JSON.parse(cached);

            // Check if cache is expired
            if (cacheData.expires < Date.now()) {
                console.log(`[TemplateEditor] Cached template expired for key: ${cacheKey}`);
                localStorage.removeItem(cacheKey);
                return null;
            }

            console.log(`[TemplateEditor] Retrieved cached template for key: ${cacheKey}`);
            return cacheData.template;
        } catch (error) {
            console.warn("Failed to retrieve cached template:", error);
            return null;
        }
    }

    /**
     * Clear template cache
     * @param {string} templateName - Optional specific template to clear
     */
    clearTemplateCache(templateName = null) {
        try {
            if (templateName) {
                const cacheKey = `hextrackr_email_template_${templateName}`;
                localStorage.removeItem(cacheKey);
                console.log(`[TemplateEditor] Cleared cache for key: ${cacheKey}`);
            } else {
                // Clear all email template caches
                const keys = Object.keys(localStorage);
                keys.forEach(key => {
                    if (key.startsWith("hextrackr_email_template_")) {
                        localStorage.removeItem(key);
                        console.log(`[TemplateEditor] Cleared cache for key: ${key}`);
                    }
                });
            }
        } catch (error) {
            console.warn("Failed to clear template cache:", error);
        }
    }

    /**
     * Validate that the email template content matches the expected structure
     * @param {string} content - Template content to validate
     * @returns {boolean} True when template content appears valid for email
     */
    isTemplateContentValid(content) {
        if (!content) {
            return false;
        }

        const hasEmailSignature = content.includes("Subject: Hexagon Work Order");
        const containsForeignSignature = content.includes("# Vulnerability Report");

        return hasEmailSignature && !containsForeignSignature;
    }

    /**
     * Restore the email template from server defaults when corruption is detected
     */
    async restoreTemplateFromServer() {
        this.isRestoring = true;
        try {
            if (this.currentTemplate?.id) {
                await authState.authenticatedFetch(`/api/templates/${this.currentTemplate.id}/reset`, { method: "POST" });
            }
        } catch (resetError) {
            console.warn("Failed to reset email template on server:", resetError.message);
        } finally {
            this.clearTemplateCache("default_email");
            this.currentTemplate = null;
            await this.loadTemplateForEditing(true);
            this.isRestoring = false;
        }
    }

    /**
     * Create default email template if none exists
     */
    async createDefaultTemplate() {
        const defaultContent = `Subject: Hexagon Work Order - [SITE_NAME] - [HEXAGON_NUM]

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
[DEVICE_COUNT] device(s) require security patches and will need to be rebooted:
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
Generated by HexTrackr v1.0.21
Ticket ID: [XT_NUMBER]`;

        try {
            const templateData = {
                name: "default_email",
                description: "Default email template for Hexagon work orders",
                template_content: defaultContent,
                default_content: defaultContent,
                variables: JSON.stringify(this.variables),
                category: "email"
            };

            const response = await authState.authenticatedFetch("/api/templates", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(templateData)
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const result = await response.json();
            if (result.success) {
                this.currentTemplate = result.data;

                // Cache the new template
                this.cacheTemplate(this.currentTemplate);

                // Load template content into editor
                const editor = document.getElementById("templateEditor");
                if (editor) {
                    editor.value = this.currentTemplate.template_content;
                    this.validateTemplate();
                }
            } else {
                throw new Error(result.error || "Failed to create default template");
            }
        } catch (error) {
            console.error("Error creating default template:", error);
            throw error;
        }
    }
}

// Create global instance
window.templateEditor = new TemplateEditor();

// Add CSS for variable styling
const style = document.createElement("style");
style.textContent = `
    .variable-tag {
        display: inline-block;
        background: var(--tblr-primary);
        color: white;
        padding: 2px 6px;
        border-radius: 3px;
        font-size: 11px;
        font-family: 'Courier New', monospace;
        cursor: pointer;
        transition: all 0.2s;
    }

    .variable-tag:hover {
        background: var(--tblr-primary-dark);
        transform: translateY(-1px);
    }

    .variable-tag.required {
        border-left: 3px solid var(--tblr-red);
    }

    .variable-tag.optional {
        border-left: 3px solid var(--tblr-green);
    }

    .variable-item {
        border-bottom: 1px solid var(--tblr-border-color);
        padding-bottom: 8px;
    }

    .template-validation .alert-sm {
        padding: 8px 12px;
        font-size: 12px;
    }

    .terminal-content {
        background: var(--tblr-dark);
        color: var(--tblr-light);
        border: 1px solid var(--tblr-border-color);
        border-radius: 4px;
        padding: 12px;
        font-family: 'Courier New', monospace;
        font-size: 13px;
        line-height: 1.4;
        white-space: pre-wrap;
        word-wrap: break-word;
    }
`;
document.head.appendChild(style);
