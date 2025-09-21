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

/* global fetch, bootstrap, DOMPurify */

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

        // Available variables from the backend
        this.variables = [
            { name: '[GREETING]', description: 'Supervisor first name or Team for multiple supervisors', required: false },
            { name: '[SITE_NAME]', description: 'Site name from ticket', required: true },
            { name: '[LOCATION]', description: 'Location from ticket', required: true },
            { name: '[HEXAGON_NUM]', description: 'Hexagon ticket number', required: false },
            { name: '[SERVICENOW_NUM]', description: 'ServiceNow ticket number', required: false },
            { name: '[XT_NUMBER]', description: 'Internal XT number', required: true },
            { name: '[DEVICE_COUNT]', description: 'Number of devices in ticket', required: true },
            { name: '[DEVICE_LIST]', description: 'Enumerated list of devices', required: true },
            { name: '[DATE_DUE]', description: 'Due date formatted', required: true },
            { name: '[DATE_SUBMITTED]', description: 'Submission date formatted', required: true },
            { name: '[VULNERABILITY_SUMMARY]', description: 'Dynamic vulnerability summary (generated at runtime)', required: false }
        ];

        this.init();
    }

    /**
     * Initialize the template editor
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
        const viewMode = document.getElementById('emailViewMode');
        const editMode = document.getElementById('emailEditMode');
        const editBtn = document.getElementById('editTemplateBtn');

        if (!this.isEditMode) {
            // Entering edit mode
            try {
                await this.loadTemplateForEditing();

                viewMode.style.display = 'none';
                editMode.style.display = 'block';
                this.isEditMode = true;

                // Update button appearance
                editBtn.innerHTML = '<i class="fas fa-times me-1"></i>Cancel';
                editBtn.className = 'btn btn-outline-secondary btn-sm';
                editBtn.title = 'Cancel editing';

                // Focus on editor
                const editor = document.getElementById('templateEditor');
                if (editor) {
                    editor.focus();
                }

                this.showToast('Edit mode enabled', 'info');
            } catch (error) {
                console.error('Error entering edit mode:', error);
                this.showToast('Failed to enter edit mode', 'error');
            }
        } else {
            // Exiting edit mode
            viewMode.style.display = 'block';
            editMode.style.display = 'none';
            this.isEditMode = false;

            // Reset button appearance
            editBtn.innerHTML = '<i class="fas fa-edit me-1"></i>Edit';
            editBtn.className = 'btn btn-outline-primary btn-sm';
            editBtn.title = 'Edit email template';

            this.showToast('Edit mode disabled', 'info');
        }
    }

    /**
     * Load template for editing
     */
    async loadTemplateForEditing() {
        try {
            const response = await fetch('/api/templates/by-name/default_email');
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const result = await response.json();
            if (result.success) {
                this.currentTemplate = result.data;

                // Load template content into editor
                const editor = document.getElementById('templateEditor');
                if (editor) {
                    editor.value = this.currentTemplate.template_content;

                    // Trigger validation
                    this.validateTemplate();
                }
            } else {
                throw new Error(result.error || 'Failed to load template');
            }
        } catch (error) {
            console.error('Error loading template:', error);
            this.showToast('Failed to load template for editing', 'error');
            throw error;
        }
    }

    /**
     * Populate the variable reference panel
     */
    populateVariablePanel() {
        const panel = document.getElementById('variablePanel');
        if (!panel) return;

        panel.innerHTML = '';

        this.variables.forEach(variable => {
            const variableElement = document.createElement('div');
            variableElement.className = 'variable-item mb-2';

            variableElement.innerHTML = `
                <span class="variable-tag ${variable.required ? 'required' : 'optional'}"
                      onclick="templateEditor.insertVariable('${variable.name}')"
                      title="${variable.description}${variable.required ? ' (Required)' : ' (Optional)'}">
                    ${variable.name}
                </span>
                <small class="text-muted d-block">${variable.description}</small>
            `;

            panel.appendChild(variableElement);
        });
    }

    /**
     * Insert variable at cursor position
     * @param {string} variable - Variable to insert
     */
    insertVariable(variable) {
        const editor = document.getElementById('templateEditor');
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
        const editor = document.getElementById('templateEditor');
        if (!editor || !this.currentTicketData) {
            this.showToast('No ticket data available for preview', 'warning');
            return;
        }

        try {
            const templateContent = editor.value;

            const response = await fetch('/api/templates/1/preview', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    ticketData: this.currentTicketData
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const result = await response.json();
            if (result.success) {
                // Show preview in a modal or overlay
                this.showPreviewModal(result.data.processed_content);
            } else {
                throw new Error(result.error || 'Preview failed');
            }
        } catch (error) {
            console.error('Error previewing template:', error);
            this.showToast('Failed to generate preview', 'error');
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
        const existingModal = document.getElementById('templatePreviewModal');
        if (existingModal) {
            existingModal.remove();
        }

        // Add modal to document
        document.body.insertAdjacentHTML('beforeend', modalHtml);

        // Show the modal
        const previewModal = new bootstrap.Modal(document.getElementById('templatePreviewModal'));
        previewModal.show();

        // Clean up when modal is hidden
        document.getElementById('templatePreviewModal').addEventListener('hidden.bs.modal', function() {
            this.remove();
        });
    }

    /**
     * Save template changes
     */
    async saveTemplate() {
        const editor = document.getElementById('templateEditor');
        if (!editor || !this.currentTemplate) return;

        try {
            const templateContent = editor.value;

            // Validate before saving
            const validation = await this.validateTemplateContent(templateContent);
            if (!validation.valid) {
                this.showToast(`Cannot save: ${validation.errors.join(', ')}`, 'error');
                return;
            }

            const response = await fetch(`/api/templates/${this.currentTemplate.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    template_content: templateContent
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const result = await response.json();
            if (result.success) {
                this.showToast('Template saved successfully', 'success');

                // Update current template
                this.currentTemplate.template_content = templateContent;

                // Exit edit mode
                await this.toggleEditMode();

                // Refresh the email view if it's loaded
                if (window.ticketManager && window.ticketManager.loadEmailMarkdownForModal) {
                    window.ticketManager.loadEmailMarkdownForModal();
                }
            } else {
                throw new Error(result.error || 'Save failed');
            }
        } catch (error) {
            console.error('Error saving template:', error);
            this.showToast('Failed to save template', 'error');
        }
    }

    /**
     * Reset template to default
     */
    async resetToDefault() {
        if (!this.currentTemplate) return;

        if (!confirm('Reset template to default? This will lose all custom changes.')) {
            return;
        }

        try {
            const response = await fetch(`/api/templates/${this.currentTemplate.id}/reset`, {
                method: 'POST'
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const result = await response.json();
            if (result.success) {
                this.showToast('Template reset to default', 'success');

                // Reload template for editing
                await this.loadTemplateForEditing();
            } else {
                throw new Error(result.error || 'Reset failed');
            }
        } catch (error) {
            console.error('Error resetting template:', error);
            this.showToast('Failed to reset template', 'error');
        }
    }

    /**
     * Set up real-time validation
     */
    setupValidation() {
        // Add event listener when DOM is ready
        const setupListener = () => {
            const editor = document.getElementById('templateEditor');
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
        const editor = document.getElementById('templateEditor');
        const validationDiv = document.getElementById('templateValidation');

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
            errors.push('Unmatched brackets detected');
        }

        // Check for empty variables
        if (content.includes('[]')) {
            errors.push('Empty variable brackets found');
        }

        // Extract variables
        const variableMatches = content.match(/\[[A-Z_]+\]/g) || [];
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
        const validationDiv = document.getElementById('templateValidation');
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
        // Use existing toast system if available, otherwise fallback to alert
        if (window.ticketManager && window.ticketManager.showToast) {
            window.ticketManager.showToast(message, type);
        } else {
            console.log(`[${type.toUpperCase()}] ${message}`);
        }
    }
}

// Create global instance
window.templateEditor = new TemplateEditor();

// Add CSS for variable styling
const style = document.createElement('style');
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