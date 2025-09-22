/**
 * Ticket Markdown Editor Module for HexTrackr v1.0.21
 *
 * Provides interactive markdown template editing functionality for ticket details.
 * Features: template editing, variable substitution, preview mode, and validation.
 *
 * @fileoverview Ticket markdown template editor for customizing ticket display
 * @author HexTrackr Development Team
 * @version 1.0.21
 */

/* global fetch, bootstrap, DOMPurify */

/**
 * Ticket Markdown Editor Class
 * Manages the ticket markdown template editing interface
 */
class TicketMarkdownEditor {
    constructor() {
        this.isEditMode = false;
        this.currentTemplate = null;
        this.currentTicketData = null;
        this.validationTimeout = null;
        this.isRestoring = false;

        // Use unified variables from the global variable system
        this.variables = window.HexTrackrTemplateVariables?.getRecommendedVariables('ticket') || [];

        this.init();
    }

    /**
     * Initialize the ticket markdown editor
     */
    init() {
        // Populate variable reference panel when DOM is ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.populateVariablePanel());
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
        const viewMode = document.getElementById('ticketViewMode');
        const editMode = document.getElementById('ticketEditMode');

        if (!this.isEditMode) {
            // Entering edit mode
            try {
                await this.loadTemplateForEditing();

                viewMode.style.display = 'none';
                editMode.style.display = 'block';
                this.isEditMode = true;

                // Focus on editor
                const editor = document.getElementById('ticketTemplateEditor');
                if (editor) {
                    editor.focus();
                }

                // Ensure variable panel is populated
                this.populateVariablePanel();

                this.showToast('Ticket template edit mode enabled', 'info');
            } catch (error) {
                console.error('Error entering ticket template edit mode:', error);
                this.showToast('Failed to enter ticket template edit mode', 'error');
            }
        } else {
            // Exiting edit mode
            viewMode.style.display = 'block';
            editMode.style.display = 'none';
            this.isEditMode = false;

            this.showToast('Ticket template edit mode disabled', 'info');
        }
    }

    /**
     * Load template for editing
     */
    async loadTemplateForEditing(forceRefresh = false) {
        try {
            // If forceRefresh is true, always fetch from API
            if (forceRefresh) {
                console.log('[TicketMarkdownEditor] Force refresh requested, fetching from API');
                const response = await fetch('/api/templates/by-name/default_ticket');
                if (response.ok) {
                    const result = await response.json();
                    if (result.success) {
                        this.currentTemplate = result.data;
                        this.cacheTemplate(this.currentTemplate);
                        console.log('[TicketMarkdownEditor] Template refreshed from API');
                    }
                }
            } else {
                // Try cache first, then API if no cache
                const cached = this.getCachedTemplate('default_ticket');
                if (cached) {
                    this.currentTemplate = cached;
                    console.log('[TicketMarkdownEditor] Using cached template');
                } else if (!this.currentTemplate) {
                    const response = await fetch('/api/templates/by-name/default_ticket');
                    if (response.ok) {
                        const result = await response.json();
                        if (result.success) {
                            this.currentTemplate = result.data;
                            this.cacheTemplate(this.currentTemplate);
                            console.log('[TicketMarkdownEditor] Template loaded from API');
                        }
                    }
                }
            }

            if (!this.currentTemplate) {
                await this.createDefaultTemplate();
                return;
            }

            // Temporarily disable aggressive template validation to prevent unwanted restoration
            // TODO: Implement more robust template validation that doesn't interfere with user edits
            if (!this.isRestoring && !this.isTemplateContentValid(this.currentTemplate.template_content)) {
                console.warn('Template content validation failed, but allowing user content to load for editing.');
                console.log('Template content preview:', this.currentTemplate.template_content.substring(0, 100));
            }

            const editor = document.getElementById('ticketTemplateEditor');
            if (editor && this.currentTemplate) {
                editor.value = this.currentTemplate.template_content;
                this.validateTemplate();
            }
        } catch (error) {
            console.error('Error loading ticket template:', error);
            await this.createDefaultTemplate();
        }
    }

    /**
     * Create default template from hardcoded version
     */
    async createDefaultTemplate() {
        const defaultContent = `# Hexagon Work Request

**Ticket Information:**
- Hexagon Ticket #: [HEXAGON_TICKET]
- ServiceNow Ticket #: [SERVICENOW_TICKET]
- XT Number: [XT_NUMBER]
- Site: [SITE_NAME]
- Location: [LOCATION]
- Status: [STATUS]

**Timeline:**
- Date Submitted: [DATE_SUBMITTED]
- Required Completion Date: [DATE_DUE]

**Task Instruction:**
There are critical security patches that must be applied within 30 days at the [SITE_NAME] site. Please schedule a maintenance outage of at least two hours and contact the ITCC at 918-732-4822 with ServiceNow ticket [SERVICENOW_TICKET] to coordinate NetOps for applying security updates and rebooting the equipment.

**Devices to be Updated:**
The following [DEVICE_COUNT] device(s) will be updated and rebooted:

[DEVICE_LIST]

**Personnel:**
- Supervisor: [SUPERVISOR]
- Technician: [TECHNICIAN]

**Additional Notes:**
[NOTES]

---
Generated: [GENERATED_TIME]`;

        try {
            const templateData = {
                name: 'default_ticket',
                description: 'Default ticket markdown template',
                template_content: defaultContent,
                default_content: defaultContent,
                variables: JSON.stringify(this.variables),
                category: 'ticket'
            };

            const response = await fetch('/api/templates', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(templateData)
            });

            if (response.status === 409) {
                const existing = await fetch('/api/templates/by-name/default_ticket');
                if (existing.ok) {
                    const existingResult = await existing.json();
                    if (existingResult.success) {
                        this.currentTemplate = existingResult.data;
                    }
                }
            } else {
                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }

                const result = await response.json();
                if (!result.success) {
                    throw new Error(result.error || 'Failed to seed ticket template');
                }

                this.currentTemplate = result.data;
            }

            const editor = document.getElementById('ticketTemplateEditor');
            if (editor) {
                editor.value = this.currentTemplate.template_content;
                this.validateTemplate();
            }

            this.cacheTemplate(this.currentTemplate);
        } catch (error) {
            console.error('Error ensuring default ticket template:', error);
            const editor = document.getElementById('ticketTemplateEditor');
            if (editor) {
                editor.value = defaultContent;
                this.validateTemplate();
            }

            this.currentTemplate = {
                id: null,
                name: 'default_ticket',
                template_content: defaultContent
            };
        }
    }

    /**
     * Populate the variable reference dropdown with organized categories
     */
    populateVariablePanel() {
        const dropdown = document.getElementById('ticketVariableDropdown');
        if (!dropdown) return;

        dropdown.innerHTML = '';
        dropdown.className = 'dropdown-menu variable-dropdown';

        // Get categories from the global variable system
        const categories = window.HexTrackrTemplateVariables?.categories || {};

        // Group variables by category
        const variablesByCategory = {};
        this.variables.forEach(variable => {
            const category = variable.category || 'other';
            if (!variablesByCategory[category]) {
                variablesByCategory[category] = [];
            }
            variablesByCategory[category].push(variable);
        });

        // Create dropdown items organized by category
        Object.keys(variablesByCategory).forEach((categoryKey, index) => {
            const categoryInfo = categories[categoryKey] || { label: categoryKey, icon: 'fas fa-tag' };
            const variables = variablesByCategory[categoryKey];

            // Add category header
            const categoryHeader = document.createElement('li');
            categoryHeader.innerHTML = `
                <h6 class="dropdown-header">
                    <i class="${categoryInfo.icon}"></i>
                    ${categoryInfo.label}
                </h6>
            `;
            dropdown.appendChild(categoryHeader);

            // Add variables for this category
            variables.forEach(variable => {
                const item = document.createElement('li');
                const button = document.createElement('button');
                button.type = 'button';
                button.className = `dropdown-item ${variable.required ? 'required' : ''}`;
                button.onclick = () => this.insertVariable(variable.name);
                button.title = `${variable.description}${variable.required ? ' (Required)' : ' (Optional)'}`;

                button.innerHTML = `
                    <span>${variable.name}</span>
                    <small class="variable-description">${variable.description}</small>
                `;

                item.appendChild(button);
                dropdown.appendChild(item);
            });

            // Add divider between categories (except for last category)
            if (index < Object.keys(variablesByCategory).length - 1) {
                const divider = document.createElement('li');
                divider.innerHTML = '<hr class="dropdown-divider">';
                dropdown.appendChild(divider);
            }
        });
    }

    /**
     * Insert variable at cursor position
     * @param {string} variable - Variable to insert
     */
    insertVariable(variable) {
        const editor = document.getElementById('ticketTemplateEditor');
        if (!editor) return;

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

        this.showToast(`Inserted ${variable}`, 'success');
    }

    /**
     * Preview template with current ticket data
     */
    async previewTemplate() {
        const editor = document.getElementById('ticketTemplateEditor');
        if (!editor || !this.currentTicketData) {
            this.showToast('No ticket data available for preview', 'warning');
            return;
        }

        try {
            const templateContent = editor.value;
            const processedContent = this.processTemplate(templateContent, this.currentTicketData);

            // Show preview in a modal
            this.showPreviewModal(processedContent);
        } catch (error) {
            console.error('Error previewing ticket template:', error);
            this.showToast('Failed to generate preview', 'error');
        }
    }

    /**
     * Process template with ticket data
     * @param {string} template - Template content
     * @param {Object} ticket - Ticket data
     * @returns {string} Processed content
     */
    processTemplate(template, ticket) {
        let processed = template;

        // Replace variables with actual data - matching server-side variable names
        const replacements = {
            '[GREETING]': this.getSupervisorGreeting(ticket.supervisor),
            '[SITE_NAME]': ticket.site || 'N/A',
            '[SITE]': ticket.site || 'N/A',
            '[LOCATION]': ticket.location || 'N/A',
            '[STATUS]': ticket.status || 'N/A',
            '[HEXAGON_NUM]': ticket.hexagon_ticket || ticket.hexagonTicket || 'N/A',
            '[HEXAGON_TICKET]': ticket.hexagon_ticket || ticket.hexagonTicket || 'N/A',
            '[SERVICENOW_NUM]': ticket.servicenow_ticket || ticket.serviceNowTicket || 'N/A',
            '[SERVICENOW_TICKET]': ticket.servicenow_ticket || ticket.serviceNowTicket || 'N/A',
            '[XT_NUMBER]': ticket.xt_number || ticket.xtNumber || `${ticket.id}`,
            '[DEVICE_COUNT]': ticket.devices ? ticket.devices.length : 0,
            '[DEVICE_LIST]': this.formatDeviceList(ticket.devices),
            '[DATE_DUE]': this.formatDate(ticket.date_due || ticket.dateDue),
            '[DATE_SUBMITTED]': this.formatDate(ticket.date_submitted || ticket.dateSubmitted),
            '[SUPERVISOR]': ticket.supervisor || 'N/A',
            '[TECHNICIAN]': ticket.technician || ticket.tech || 'N/A',
            '[NOTES]': ticket.notes || ticket.additional_notes || 'N/A',
            '[GENERATED_TIME]': new Date().toLocaleString(),
            '[VULNERABILITY_SUMMARY]': this.generateVulnerabilitySummary(ticket)
        };

        Object.keys(replacements).forEach(variable => {
            const regex = new RegExp(this.escapeRegex(variable), 'g');
            processed = processed.replace(regex, replacements[variable]);
        });

        return processed;
    }

    /**
     * Format device list
     * @param {Array} devices - Device array
     * @returns {string} Formatted device list
     */
    formatDeviceList(devices) {
        if (!devices || devices.length === 0) return 'No devices specified';

        return devices.map((device, index) => `${index + 1}. ${device}`).join('\\n');
    }

    /**
     * Format date for display
     * @param {string} dateString - Date string
     * @returns {string} Formatted date
     */
    formatDate(dateString) {
        if (!dateString) return 'N/A';

        try {
            return new Date(dateString).toLocaleDateString();
        } catch (error) {
            return dateString;
        }
    }

    /**
     * Get supervisor greeting (matches server-side logic)
     * @param {string} supervisorField - Supervisor field value
     * @returns {string} Appropriate greeting
     */
    getSupervisorGreeting(supervisorField) {
        if (!supervisorField || supervisorField === "N/A") {
            return "[Supervisor First Name]";
        }

        const trimmed = supervisorField.trim();

        // Check for multiple supervisors (semicolon or comma separated)
        if (trimmed.includes(';') || trimmed.includes(',')) {
            return "Team";
        }

        // Extract first name from "LAST, FIRST" format
        if (trimmed.includes(',')) {
            const parts = trimmed.split(',');
            if (parts.length >= 2) {
                const firstName = parts[1].trim();
                return firstName || "[Supervisor First Name]";
            }
        }

        // For single word entries, return as-is
        if (!trimmed.includes(' ') && !trimmed.includes(',')) {
            return trimmed;
        }

        // For other formats, try to extract first word
        const firstWord = trimmed.split(' ')[0];
        return firstWord || "[Supervisor First Name]";
    }

    /**
     * Generate vulnerability summary for ticket
     * @param {Object} ticket - Ticket data
     * @returns {string} Vulnerability summary
     */
    generateVulnerabilitySummary(ticket) {
        if (ticket?.devices && ticket.devices.length > 0) {
            return '';
        }
        return '';
    }

    /**
     * Escape regex special characters
     * @param {string} string - String to escape
     * @returns {string} Escaped string
     */
    escapeRegex(string) {
        return string.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
    }

    /**
     * Show preview modal
     * @param {string} previewContent - Processed template content
     */
    showPreviewModal(previewContent) {
        const modalHtml = `
            <div class="modal fade" id="ticketTemplatePreviewModal" tabindex="-1">
                <div class="modal-dialog modal-lg">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">
                                <i class="fas fa-eye me-2"></i>Ticket Template Preview
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
        const existingModal = document.getElementById('ticketTemplatePreviewModal');
        if (existingModal) {
            existingModal.remove();
        }

        // Add modal to document
        document.body.insertAdjacentHTML('beforeend', modalHtml);

        // Show the modal
        const previewModal = new bootstrap.Modal(document.getElementById('ticketTemplatePreviewModal'));
        previewModal.show();

        // Clean up when modal is hidden
        document.getElementById('ticketTemplatePreviewModal').addEventListener('hidden.bs.modal', function() {
            this.remove();
        });
    }

    /**
     * Save template changes
     */
    async saveTemplate() {
        const editor = document.getElementById('ticketTemplateEditor');
        if (!editor) return;

        try {
            const templateContent = editor.value;

            // Validate before saving
            const validation = await this.validateTemplateContent(templateContent);
            if (!validation.valid) {
                this.showToast(`Cannot save: ${validation.errors.join(', ')}`, 'error');
                return;
            }

            // Create or update template
            if (!this.currentTemplate?.id) {
                await this.createDefaultTemplate();
            }

            console.log(`[TicketMarkdownEditor] Saving template with ID: ${this.currentTemplate.id}, category: 'ticket', name: 'default_ticket'`);
            console.log(`[TicketMarkdownEditor] Template content preview: ${templateContent.substring(0, 100)}...`);

            const response = await fetch(`/api/templates/${this.currentTemplate.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    template_content: templateContent,
                    category: 'ticket',
                    template_name: 'default_ticket'
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const result = await response.json();
            if (result.success) {
                this.showToast('Ticket template saved successfully', 'success');

                // Update current template
                this.currentTemplate.template_content = templateContent;
                this.cacheTemplate(this.currentTemplate);

                // Refresh the ticket view if loaded
                if (window.ticketManager && window.ticketManager.viewTicket) {
                    const ticketId = document.getElementById("viewTicketModal").getAttribute("data-ticket-id");
                    if (ticketId) {
                        const ticket = window.ticketManager.getTicketById(ticketId);
                        if (ticket) {
                            const updatedMarkdown = this.processTemplate(templateContent, ticket);
                            document.getElementById('markdownContent').textContent = updatedMarkdown;
                        }
                    }
                }
            } else {
                throw new Error(result.error || 'Save failed');
            }
        } catch (error) {
            console.error('Error saving ticket template:', error);
            this.showToast('Failed to save ticket template', 'error');
        }
    }

    /**
     * Reset template to default
     */
    async resetToDefault() {
        if (!this.currentTemplate?.id) {
            await this.createDefaultTemplate();
        }

        if (!confirm('Reset template to default? This will lose all custom changes.')) {
            return;
        }

        this.isRestoring = true;
        try {
            const response = await fetch(`/api/templates/${this.currentTemplate.id}/reset`, {
                method: 'POST'
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const result = await response.json();
            if (!result.success) {
                throw new Error(result.error || 'Reset failed');
            }

            this.clearTemplateCache('default_ticket');
            await this.loadTemplateForEditing(true);
            this.showToast('Ticket template reset to default', 'success');
        } catch (error) {
            console.error('Error resetting ticket template:', error);
            this.showToast('Failed to reset ticket template', 'error');
        } finally {
            this.isRestoring = false;
        }
    }

    /**
     * Cache template in localStorage
     * @param {Object} template - Template object to cache
     */
    cacheTemplate(template) {
        try {
            if (!template?.name) return;
            const cacheKey = `hextrackr_ticket_template_${template.name}`;
            const cacheData = {
                template,
                timestamp: Date.now(),
                expires: Date.now() + (60 * 60 * 1000),
                category: 'ticket'
            };
            localStorage.setItem(cacheKey, JSON.stringify(cacheData));
            console.log(`[TicketMarkdownEditor] Cached template with key: ${cacheKey}`);
        } catch (error) {
            console.warn('Failed to cache ticket template:', error);
        }
    }

    /**
     * Retrieve cached template from localStorage
     * @param {string} templateName - Template name
     * @returns {Object|null} Cached template or null
     */
    getCachedTemplate(templateName) {
        try {
            const cacheKey = `hextrackr_ticket_template_${templateName}`;
            const cached = localStorage.getItem(cacheKey);
            if (!cached) {
                console.log(`[TicketMarkdownEditor] No cached template found for key: ${cacheKey}`);
                return null;
            }

            const cacheData = JSON.parse(cached);
            if (cacheData.expires < Date.now()) {
                console.log(`[TicketMarkdownEditor] Cached template expired for key: ${cacheKey}`);
                localStorage.removeItem(cacheKey);
                return null;
            }

            console.log(`[TicketMarkdownEditor] Retrieved cached template for key: ${cacheKey}`);
            return cacheData.template;
        } catch (error) {
            console.warn('Failed to load cached ticket template:', error);
            return null;
        }
    }

    /**
     * Clear cached template(s)
     * @param {string|null} templateName - Specific template to clear or all
     */
    clearTemplateCache(templateName = null) {
        try {
            if (templateName) {
                const cacheKey = `hextrackr_ticket_template_${templateName}`;
                localStorage.removeItem(cacheKey);
                console.log(`[TicketMarkdownEditor] Cleared cache for key: ${cacheKey}`);
                return;
            }

            Object.keys(localStorage).forEach(key => {
                if (key.startsWith('hextrackr_ticket_template_')) {
                    localStorage.removeItem(key);
                    console.log(`[TicketMarkdownEditor] Cleared cache for key: ${key}`);
                }
            });
        } catch (error) {
            console.warn('Failed to clear ticket template cache:', error);
        }
    }

    /**
     * Validate ticket template content against expected markers
     * @param {string} content - Template content to validate
     * @returns {boolean} True when content looks correct for ticket templates
     */
    isTemplateContentValid(content) {
        if (!content) {
            return false;
        }

        const hasTicketSignature = content.includes('# Hexagon Work Request');
        const containsForeignSignature = content.includes('# Vulnerability Report');

        return hasTicketSignature && !containsForeignSignature;
    }

    /**
     * Restore ticket template from server defaults when corruption is detected
     */
    async restoreTemplateFromServer() {
        this.isRestoring = true;
        try {
            if (this.currentTemplate?.id) {
                await fetch(`/api/templates/${this.currentTemplate.id}/reset`, { method: 'POST' });
            }
        } catch (resetError) {
            console.warn('Failed to reset ticket template on server:', resetError.message);
        } finally {
            this.clearTemplateCache('default_ticket');
            this.currentTemplate = null;
            await this.loadTemplateForEditing(true);
            this.isRestoring = false;
        }
    }

    /**
     * Set up real-time validation
     */
    setupValidation() {
        const setupListener = () => {
            const editor = document.getElementById('ticketTemplateEditor');
            if (editor) {
                editor.addEventListener('input', () => {
                    // Debounce validation
                    clearTimeout(this.validationTimeout);
                    this.validationTimeout = setTimeout(() => {
                        this.validateTemplate();
                    }, 500);
                });
            }
        };

        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', setupListener);
        } else {
            setupListener();
        }
    }

    /**
     * Validate template content in real-time
     */
    async validateTemplate() {
        const editor = document.getElementById('ticketTemplateEditor');
        const validationDiv = document.getElementById('ticketTemplateValidation');

        if (!editor || !validationDiv) return;

        const content = editor.value;
        if (!content.trim()) {
            validationDiv.innerHTML = '';
            return;
        }

        try {
            const validation = await this.validateTemplateContent(content);
            this.displayValidationResults(validation);
        } catch (error) {
            console.error('Validation error:', error);
        }
    }

    /**
     * Validate template content
     * @param {string} content - Template content to validate
     * @returns {Object} Validation result
     */
    async validateTemplateContent(content) {
        const errors = [];
        const warnings = [];

        // Basic bracket matching
        const openBrackets = (content.match(/\[/g) || []).length;
        const closeBrackets = (content.match(/\]/g) || []).length;

        if (openBrackets !== closeBrackets) {
            errors.push('Unmatched brackets detected');
        }

        // Check for empty variables
        if (content.includes('[]')) {
            errors.push('Empty variable brackets found');
        }

        // Extract variables
        const variableMatches = content.match(/\\[[A-Z_]+\\]/g) || [];
        const uniqueVariables = [...new Set(variableMatches)];
        const knownVariables = this.variables.map(v => v.name);

        // Check for unknown variables
        const unknownVariables = uniqueVariables.filter(v => !knownVariables.includes(v));
        if (unknownVariables.length > 0) {
            warnings.push(`Unknown variables: ${unknownVariables.join(', ')}`);
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
        const validationDiv = document.getElementById('ticketTemplateValidation');
        if (!validationDiv) return;

        let html = '';

        if (validation.errors.length > 0) {
            html += `<div class="alert alert-danger alert-sm mb-2">
                <i class="fas fa-exclamation-triangle me-1"></i>
                ${validation.errors.join(', ')}
            </div>`;
        }

        if (validation.warnings.length > 0) {
            html += `<div class="alert alert-warning alert-sm mb-2">
                <i class="fas fa-exclamation-circle me-1"></i>
                ${validation.warnings.join(', ')}
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
    showToast(message, type = 'info') {
        // Use existing toast system if available, otherwise fallback to console
        if (window.ticketManager && window.ticketManager.showToast) {
            window.ticketManager.showToast(message, type);
        } else {
            console.log(`[${type.toUpperCase()}] ${message}`);
        }
    }
}

// Create global instance
window.ticketMarkdownEditor = new TicketMarkdownEditor();
