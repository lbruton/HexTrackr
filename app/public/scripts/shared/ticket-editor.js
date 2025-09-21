/**
 * Ticket Editor Module for HexTrackr v1.0.21
 *
 * Provides interactive ticket editing functionality for ticket details.
 * Features: edit mode toggle, form validation, data persistence,
 * device list management, and coordinate with email template editor.
 *
 * @fileoverview Ticket editor for modifying ticket details
 * @author HexTrackr Development Team
 * @version 1.0.21
 */

/* global fetch, bootstrap, DOMPurify */

/**
 * Ticket Editor Class
 * Manages the ticket editing interface and form functionality
 */
class TicketEditor {
    constructor() {
        this.isEditMode = false;
        this.currentTicket = null;
        this.originalTicketData = null;
        this.validationTimeout = null;

        this.init();
    }

    /**
     * Initialize the ticket editor
     */
    init() {
        // Set up form validation
        this.setupValidation();
    }

    /**
     * Toggle between view and edit modes for ticket details
     */
    async toggleEditMode() {
        const viewMode = document.getElementById('ticketViewMode');
        const editMode = document.getElementById('ticketEditMode');

        if (!this.isEditMode) {
            // Entering edit mode
            try {
                if (this.currentTicket) {
                    this.loadTicketForEditing(this.currentTicket);

                    viewMode.style.display = 'none';
                    editMode.style.display = 'block';
                    this.isEditMode = true;

                    this.showToast('Ticket edit mode enabled', 'info');
                } else {
                    throw new Error('No ticket data available for editing');
                }
            } catch (error) {
                console.error('Error entering ticket edit mode:', error);
                this.showToast('Failed to enter ticket edit mode', 'error');
            }
        } else {
            // Exiting edit mode
            viewMode.style.display = 'block';
            editMode.style.display = 'none';
            this.isEditMode = false;

            this.showToast('Ticket edit mode disabled', 'info');
        }
    }

    /**
     * Load ticket data into the edit form
     * @param {Object} ticket - Ticket data to load
     */
    loadTicketForEditing(ticket) {
        this.currentTicket = ticket;
        this.originalTicketData = JSON.parse(JSON.stringify(ticket)); // Deep copy

        // Populate form fields
        document.getElementById('editHexagonTicket').value = ticket.hexagonTicket || '';
        document.getElementById('editServiceNowTicket').value = ticket.serviceNowTicket || '';
        document.getElementById('editSite').value = ticket.site || '';
        document.getElementById('editLocation').value = ticket.location || '';
        document.getElementById('editStatus').value = ticket.status || 'open';
        document.getElementById('editSupervisor').value = ticket.supervisor || '';
        document.getElementById('editTech').value = ticket.tech || '';
        document.getElementById('editNotes').value = ticket.notes || '';

        // Handle date fields (convert from display format to input format)
        if (ticket.dateSubmitted) {
            document.getElementById('editDateSubmitted').value = this.formatDateForInput(ticket.dateSubmitted);
        }
        if (ticket.dateDue) {
            document.getElementById('editDateDue').value = this.formatDateForInput(ticket.dateDue);
        }

        // Handle devices array
        if (ticket.devices && Array.isArray(ticket.devices)) {
            document.getElementById('editDevices').value = ticket.devices.join('\\n');
        }

        // Trigger form validation
        this.validateForm();
    }

    /**
     * Convert date string to YYYY-MM-DD format for input fields
     * @param {string} dateString - Date string to convert
     * @returns {string} Formatted date string
     */
    formatDateForInput(dateString) {
        if (!dateString) return '';

        try {
            const date = new Date(dateString);
            return date.toISOString().split('T')[0];
        } catch (error) {
            console.warn('Invalid date format:', dateString);
            return '';
        }
    }

    /**
     * Save ticket changes
     */
    async saveTicket() {
        if (!this.currentTicket) return;

        try {
            const formData = this.getFormData();

            // Validate form data
            const validation = this.validateFormData(formData);
            if (!validation.valid) {
                this.showToast(`Cannot save: ${validation.errors.join(', ')}`, 'error');
                return;
            }

            // Prepare update payload
            const updateData = {
                ...formData,
                id: this.currentTicket.id
            };

            const response = await fetch(`/api/tickets/${this.currentTicket.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(updateData)
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const result = await response.json();
            if (result.success) {
                this.showToast('Ticket saved successfully', 'success');

                // Update current ticket data
                this.currentTicket = { ...this.currentTicket, ...formData };

                // Refresh the ticket view
                if (window.ticketManager && window.ticketManager.loadTicketMarkdownForModal) {
                    window.ticketManager.loadTicketMarkdownForModal();
                }

                // Exit edit mode
                await this.toggleEditMode();
            } else {
                throw new Error(result.error || 'Save failed');
            }
        } catch (error) {
            console.error('Error saving ticket:', error);
            this.showToast('Failed to save ticket', 'error');
        }
    }

    /**
     * Get form data as object
     * @returns {Object} Form data
     */
    getFormData() {
        const formData = {
            hexagonTicket: document.getElementById('editHexagonTicket').value.trim(),
            serviceNowTicket: document.getElementById('editServiceNowTicket').value.trim(),
            site: document.getElementById('editSite').value.trim(),
            location: document.getElementById('editLocation').value.trim(),
            status: document.getElementById('editStatus').value,
            supervisor: document.getElementById('editSupervisor').value.trim(),
            tech: document.getElementById('editTech').value.trim(),
            notes: document.getElementById('editNotes').value.trim(),
            dateSubmitted: document.getElementById('editDateSubmitted').value,
            dateDue: document.getElementById('editDateDue').value
        };

        // Parse devices from textarea (one per line)
        const devicesText = document.getElementById('editDevices').value.trim();
        formData.devices = devicesText ? devicesText.split('\\n').map(device => device.trim()).filter(device => device) : [];

        return formData;
    }

    /**
     * Validate form data
     * @param {Object} formData - Form data to validate
     * @returns {Object} Validation result
     */
    validateFormData(formData) {
        const errors = [];

        // Required fields
        if (!formData.site) errors.push('Site is required');
        if (!formData.location) errors.push('Location is required');
        if (!formData.dateSubmitted) errors.push('Date Submitted is required');
        if (!formData.dateDue) errors.push('Required Completion Date is required');

        // Date validation
        if (formData.dateSubmitted && formData.dateDue) {
            const submitted = new Date(formData.dateSubmitted);
            const due = new Date(formData.dateDue);

            if (due < submitted) {
                errors.push('Due date cannot be before submission date');
            }
        }

        return {
            valid: errors.length === 0,
            errors
        };
    }

    /**
     * Reset form to original values
     */
    resetForm() {
        if (!this.originalTicketData) return;

        if (confirm('Reset form to original values? This will lose all unsaved changes.')) {
            this.loadTicketForEditing(this.originalTicketData);
            this.showToast('Form reset to original values', 'info');
        }
    }

    /**
     * Set up real-time form validation
     */
    setupValidation() {
        const setupListener = () => {
            const form = document.getElementById('ticketEditForm');
            if (form) {
                // Add validation listeners to required fields
                const requiredFields = ['editSite', 'editLocation', 'editDateSubmitted', 'editDateDue'];

                requiredFields.forEach(fieldId => {
                    const field = document.getElementById(fieldId);
                    if (field) {
                        field.addEventListener('blur', () => {
                            clearTimeout(this.validationTimeout);
                            this.validationTimeout = setTimeout(() => {
                                this.validateForm();
                            }, 300);
                        });
                    }
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
     * Validate form in real-time
     */
    validateForm() {
        const formData = this.getFormData();
        const validation = this.validateFormData(formData);

        // Update field validation classes
        const fields = ['editSite', 'editLocation', 'editDateSubmitted', 'editDateDue'];
        fields.forEach(fieldId => {
            const field = document.getElementById(fieldId);
            if (field) {
                if (field.value.trim() === '') {
                    field.classList.add('is-invalid');
                    field.classList.remove('is-valid');
                } else {
                    field.classList.add('is-valid');
                    field.classList.remove('is-invalid');
                }
            }
        });

        // Special validation for date relationship
        const dateSubmitted = document.getElementById('editDateSubmitted');
        const dateDue = document.getElementById('editDateDue');

        if (dateSubmitted && dateDue && dateSubmitted.value && dateDue.value) {
            const submitted = new Date(dateSubmitted.value);
            const due = new Date(dateDue.value);

            if (due < submitted) {
                dateDue.classList.add('is-invalid');
                dateDue.classList.remove('is-valid');
            }
        }
    }

    /**
     * Set current ticket data for editing
     * @param {Object} ticketData - Current ticket data
     */
    setTicketData(ticketData) {
        this.currentTicket = ticketData;
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
window.ticketEditor = new TicketEditor();