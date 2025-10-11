/* eslint-env browser */
/* global console, localStorage, FileReader, JSZip, URL, XLSX, Blob, navigator, bootstrap, window, document, Tabler, authState, setTimeout, alert, confirm, atob */

/**
 * HexTrackr - Tickets Management System
 * 
 * This file contains all JavaScript functionality for the tickets management system.
 * It implements the HexagonTicketsManager class and related functions for managing
 * Hexagon security tickets, including CRUD operations, pagination, search, filtering,
 * CSV import/export, PDF generation, and drag-and-drop device management.
 * 
 * Used by: tickets.html
 * Dependencies: 
 * - Bootstrap 5, jsPDF, JSZip, XLSX (SheetJS)
 * - scripts/shared/settings-modal.js (shared Settings modal component)
 * 
 * Architecture: Modular JavaScript following CSS pattern
 * scripts/
 * ├── shared/           # Shared components (Settings modal, navigation, etc.)
 * ├── pages/           # Page-specific functionality
 * └── utils/           # Utility functions
 * 
 * @author HexTrackr Development Team
 * @version 2.0.0
 * @since 2025-08-24
 * @updated 2025-08-26 - Refactored to use shared Settings modal component
 */

/**
 * Escape HTML entities to prevent XSS attacks
 * @param {string} text - The text to escape
 * @returns {string} - The escaped text
 */
function escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
}

// HexTrackr - Hexagon Tickets Management System
class HexagonTicketsManager {
    constructor() {
        this.tickets = [];
        this.currentEditingId = null;
        this.sharedDocumentation = []; // Store shared documentation files
        this.sortColumn = null;
        this.sortDirection = "asc";
        // Pagination properties
        this.currentPage = 1;
        this.rowsPerPage = 25;
        this.isDeviceOrderReversed = false; // Track reverse state

        // Card filter state
        this.activeCardFilter = null; // 'all', 'open', 'overdue', 'completed'
        this.init();
    }

    async init() {
        // Check if we have localStorage data to migrate
        await this.migrateFromLocalStorageIfNeeded();
        
        // Load tickets from database
        await this.loadTicketsFromDB();
        
        this.loadSharedDocumentation();
        this.setupEventListeners();
        this.populateLocationFilter();
        
        this.updateStatistics();
        this.renderTickets();
        
        // Set default date to today
        document.getElementById("dateSubmitted").value = new Date().toISOString().split("T")[0];
        
        // Set default due date to 7 days from now
        const dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + 7);
        document.getElementById("dateDue").value = dueDate.toISOString().split("T")[0];
    }

    // ==================== DATABASE API METHODS ====================

    /**
     * Transform raw ticket data from database to display format.
     * Handles overdue status calculation, XT number normalization,
     * and data structure transformation for UI consumption.
     *
     * @param {Object} rawTicket - Raw ticket object from database
     * @returns {Object} Transformed ticket object for display
     */
    transformTicketData(rawTicket) {
        // Calculate if the ticket is overdue based on due date
        const dueDate = rawTicket.date_due || rawTicket.dateDue;
        const isOverdue = dueDate ? new Date(dueDate) < new Date() : false;
        let status = rawTicket.status || "";
        
        // Auto-update status to "Overdue" if conditions are met
        // Priority: Failed > Overdue (Failed tickets need re-queuing, not just follow-up)
        if (isOverdue && status !== "Completed" && status !== "Closed" && status !== "Failed" && status !== "Overdue") {
            // PMD-disable-next-line GlobalVariable
            status = "Overdue";
            // Update the status in the database asynchronously
            this.updateTicketStatusToOverdue(rawTicket.id);
        }

        // Don't mark completed, closed, or failed tickets as overdue
        const isActiveOverdue = isOverdue && status !== "Completed" && status !== "Closed" && status !== "Failed";
        
        const normalizedXtNumber = this.normalizeXtNumber(rawTicket.xt_number || rawTicket.xtNumber);

        return {
            ...rawTicket,
            status: status, // Use the potentially updated status
            devices: typeof rawTicket.devices === "string" ? JSON.parse(rawTicket.devices) : rawTicket.devices || [],
            attachments: typeof rawTicket.attachments === "string" ? JSON.parse(rawTicket.attachments) : rawTicket.attachments || [],
            xtNumber: normalizedXtNumber,
            dateSubmitted: rawTicket.date_submitted || rawTicket.dateSubmitted,
            dateDue: rawTicket.date_due || rawTicket.dateDue,
            hexagonTicket: rawTicket.hexagon_ticket || rawTicket.hexagonTicket,
            serviceNowTicket: rawTicket.service_now_ticket || rawTicket.serviceNowTicket,
            site: rawTicket.site || "",
            location: rawTicket.location || "",
            isOverdue: isActiveOverdue // Add the isOverdue flag
        };
    }

    /**
     * Normalize XT number values to four-digit strings without prefixes.
     * @param {string} value - Raw XT number value
     * @returns {string|undefined} Normalized value or undefined if none provided
     */
    /**
     * Normalize XT ticket number to 4-digit format.
     * Extracts digits from input and pads with leading zeros to ensure
     * consistent 4-digit format for display and sorting.
     *
     * @param {string|number} value - XT number value to normalize
     * @returns {string|undefined} Normalized 4-digit XT number or undefined if invalid
     * @example
     * // Returns: "0123"
     * normalizeXtNumber("123");
     * normalizeXtNumber("XT-123");
     * normalizeXtNumber(123);
     */
    normalizeXtNumber(value) {
        if (!value) {return undefined;}

        const digitMatch = value.match(/\d+/);
        if (!digitMatch) {return undefined;}

        const digits = digitMatch[0];
        return digits.padStart(4, "0");
    }

    async loadTicketsFromDB() {
        try {
            const response = await authState.authenticatedFetch("/api/tickets");
            if (response.ok) {
                const rawTickets = await response.json();
                console.log("Raw tickets from DB:", rawTickets);
                console.log("First raw ticket:", rawTickets[0]);
                
                // Changed from using map with this.transformTicketData to using an arrow function
                // to ensure 'this' context is preserved
                this.tickets = rawTickets.map(ticket => this.transformTicketData(ticket));
                
                console.log("Loaded", this.tickets.length, "tickets from database");
                // Debug: Check first ticket to ensure it has an id
                if (this.tickets.length > 0) {
                    console.log("First transformed ticket:", this.tickets[0]);
                    console.log("First ticket ID:", this.tickets[0].id);
                    
                    // Debug: Check all ticket IDs
                    console.log("All ticket IDs:", this.tickets.map(t => t.id));
                }
            } else {
                console.error("Failed to load tickets:", response.statusText);
                this.showToast("Failed to load tickets from database", "error");
            }
        } catch (error) {
            console.error("Error loading tickets:", error);
            this.showToast("Error connecting to database", "error");
        }
    }

    async saveTicketToDB(ticket) {
        try {
            const method = ticket.id && this.tickets.find(t => t.id === ticket.id) ? "PUT" : "POST";
            const url = method === "PUT" ? `/api/tickets/${ticket.id}` : "/api/tickets";
            
            const response = await authState.authenticatedFetch(url, {
                method: method,
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(ticket)
            });

            if (response.ok) {
                const result = await response.json();
                console.log("Ticket saved:", result.message);
                // Reload tickets from database to ensure consistency
                await this.loadTicketsFromDB();
                return result;
            } else {
                const error = await response.json();
                throw new Error(error.error || "Failed to save ticket");
            }
        } catch (error) {
            console.error("Error saving ticket:", error);
            this.showToast("Error saving ticket: " + error.message, "error");
            throw error;
        }
    }

    // Method to update ticket status to "Overdue" in the database
    async updateTicketStatusToOverdue(ticketId) {
        try {
            const response = await authState.authenticatedFetch(`/api/tickets/${ticketId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ status: "Overdue" })
            });

            if (response.ok) {
                console.log(`Ticket ${ticketId} status updated to Overdue`);
            } else {
                console.error(`Failed to update ticket ${ticketId} status to Overdue`);
            }
        } catch (error) {
            console.error(`Error updating ticket ${ticketId} to overdue:`, error);
        }
    }

    async deleteTicketFromDB(ticketId) {
        try {
            const response = await authState.authenticatedFetch(`/api/tickets/${ticketId}`, {
                method: "DELETE"
            });

            if (response.ok) {
                const result = await response.json();
                console.log("Ticket deleted:", result.message);
                // Reload tickets from database to ensure consistency
                await this.loadTicketsFromDB();
                return result;
            } else {
                const error = await response.json();
                throw new Error(error.error || "Failed to delete ticket");
            }
        } catch (error) {
            console.error("Error deleting ticket:", error);
            this.showToast("Error deleting ticket: " + error.message, "error");
            throw error;
        }
    }

    async migrateFromLocalStorageIfNeeded() {
        try {
            const localData = localStorage.getItem("hexagonTickets");
            if (!localData) {return;}

            const tickets = JSON.parse(localData);
            if (!Array.isArray(tickets) || tickets.length === 0) {
                localStorage.removeItem("hexagonTickets");
                return;
            }

            console.log("Found", tickets.length, "tickets in localStorage, migrating to database...");
            this.showToast("Migrating tickets from localStorage to database...", "info");

            const response = await authState.authenticatedFetch("/api/tickets/migrate", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ tickets })
            });

            if (response.ok) {
                const result = await response.json();
                console.log("Migration successful:", result.message);
                this.showToast(`Migration successful: ${result.message}`, "success");
                
                // Clear localStorage after successful migration
                localStorage.removeItem("hexagonTickets");
            } else {
                const error = await response.json();
                if (response.status === 409) {
                    // Database already has data, just clear localStorage
                    localStorage.removeItem("hexagonTickets");
                    console.log("Database already contains tickets, cleared localStorage");
                } else {
                    throw new Error(error.error || "Migration failed");
                }
            }
        } catch (error) {
            console.error("Migration error:", error);
            this.showToast("Migration error: " + error.message, "error");
        }
    }

    // ==================== END DATABASE API METHODS ====================

    /**
     * Set up all event listeners for the tickets management interface.
     * Includes search, filter, pagination, and form submission handlers.
     * Resets pagination to first page when filters change.
     *
     * @returns {void}
     */
    setupEventListeners() {
        // Search functionality
        document.getElementById("searchInput").addEventListener("input", () => {
            this.currentPage = 1; // Reset to first page when searching
            this.renderTickets();
        });

        // Filter functionality
        document.getElementById("statusFilter").addEventListener("change", () => {
            this.currentPage = 1; // Reset to first page when filtering

            // Clear card filter when status dropdown is used
            if (document.getElementById("statusFilter").value && this.activeCardFilter) {
                this.activeCardFilter = null;
                this.updateCardStyles(null);
            }

            this.renderTickets();
        });

        document.getElementById("locationFilter").addEventListener("change", () => {
            this.currentPage = 1; // Reset to first page when filtering
            this.renderTickets();
        });

        document.getElementById("jobTypeFilter").addEventListener("change", () => {
            this.currentPage = 1; // Reset to first page when filtering
            this.renderTickets();
        });

        // Job Type dropdown in modal - show/hide conditional fields
        document.getElementById("jobType").addEventListener("change", () => {
            this.updateConditionalFields();
        });

        // Pagination controls
        document.getElementById("rowsPerPage").addEventListener("change", (e) => {
            this.rowsPerPage = parseInt(e.target.value, 10);
            this.currentPage = 1; // Reset to first page
            this.renderTickets();
        });

        // Device management
        this.setupDeviceManagement();

        // Modal events
        document.getElementById("ticketModal").addEventListener("hidden.bs.modal", () => {
            this.resetForm();
        });

        // Update XT# when modal is shown for new tickets
        document.getElementById("ticketModal").addEventListener("show.bs.modal", () => {
            if (!this.currentEditingId) { // Only for new tickets
                this.updateXtNumberDisplay();
                // Use setTimeout to ensure DOM is fully rendered before updating device numbers
                setTimeout(() => {
                    this.updateDeviceNumbers();
                    console.log("Device numbers updated after modal show");
                }, 100);
            }
        });

        // Location-to-device autofill functionality for new tickets only
        document.getElementById("location").addEventListener("input", (e) => {
            this.handleLocationToDeviceAutofill(e.target.value);
        });

        // Track manual edits to device fields to disable autofill for manually edited fields
        document.getElementById("devicesContainer").addEventListener("input", (e) => {
            if (e.target.classList.contains("device-input")) {
                // Remove autofill tracking when user manually edits a device field
                delete e.target.dataset.autofilled;
            }
        });

        // Shared documentation handling
        const attachBtn = document.getElementById("attachDocsBtn");
        attachBtn.addEventListener("click", (e) => {
            // Check if user is holding Shift key to clear attachments
            if (e.shiftKey && this.sharedDocumentation && this.sharedDocumentation.length > 0) {
                if (confirm(`Clear all ${this.sharedDocumentation.length} attached documentation file(s)?`)) {
                    this.sharedDocumentation = [];
                    this.saveSharedDocumentation();
                    this.updateAttachmentTooltip();
                    this.showToast("Documentation attachments cleared", "info");
                }
            } else {
                document.getElementById("sharedDocsInput").click();
            }
        });

        // Add context menu (right-click) to clear attachments
        attachBtn.addEventListener("contextmenu", (e) => {
            e.preventDefault();
            if (this.sharedDocumentation && this.sharedDocumentation.length > 0) {
                if (confirm(`Clear all ${this.sharedDocumentation.length} attached documentation file(s)?`)) {
                    this.sharedDocumentation = [];
                    this.saveSharedDocumentation();
                    this.updateAttachmentTooltip();
                    this.showToast("Documentation attachments cleared", "info");
                }
            }
        });

        document.getElementById("sharedDocsInput").addEventListener("change", (e) => {
            this.handleSharedDocumentation(e.target.files);
        });

        // CSV import handler - now integrated with Data Management tab in Settings modal
        document.getElementById("csvImportInput").addEventListener("change", (e) => {
            this.handleCsvImport(e.target.files[0]);
        });

        // Reverse devices button handler
        document.getElementById("reverseDevicesBtn").addEventListener("click", () => {
            this.reverseDeviceOrder();
        });

        // Supervisor filter clear button
        // Remove this event listener since we no longer have supervisor filter
        // document.getElementById('clearSupervisorFilter').addEventListener('click', () => {
        //     this.clearSupervisorFilter();
        // });
    }

    /**
     * Initialize device management functionality including drag-and-drop,
     * device field addition/removal, and device ordering controls.
     * Sets up all device-related UI interactions and event handlers.
     *
     * @returns {void}
     */
    setupDeviceManagement() {
        const container = document.getElementById("devicesContainer");
        
        container.addEventListener("click", (e) => {
            if (e.target.classList.contains("add-device-btn") || e.target.parentElement.classList.contains("add-device-btn")) {
                this.addDeviceField();
            } else if (e.target.classList.contains("remove-device-btn") || e.target.parentElement.classList.contains("remove-device-btn")) {
                this.removeDeviceField(e.target.closest(".device-entry"));
            } else if (e.target.classList.contains("move-up-btn") || e.target.parentElement.classList.contains("move-up-btn")) {
                this.moveDeviceUp(e.target.closest(".device-entry"));
            } else if (e.target.classList.contains("move-down-btn") || e.target.parentElement.classList.contains("move-down-btn")) {
                this.moveDeviceDown(e.target.closest(".device-entry"));
            }
        });

        // Initialize drag and drop for existing device entries
        this.initializeDragAndDrop();
    }

    /**
     * Add a new device input field to the ticket form.
     * Creates device field with drag-and-drop functionality,
     * auto-generates device names, and updates UI controls.
     *
     * @returns {void}
     */
    addDeviceField() {
        const container = document.getElementById("devicesContainer");
        const deviceEntry = document.createElement("div");
        deviceEntry.className = "device-entry mb-2";
        deviceEntry.draggable = true;
        
        // Get the value from the last device input to smart increment
        const lastInput = container.querySelector(".device-entry:last-child .device-input");
        const suggestedValue = this.generateNextDeviceName(lastInput ? lastInput.value : "");
        
        // SECURITY: Escape HTML to prevent XSS injection
        const escapedValue = escapeHtml(suggestedValue);
        
        // SECURITY: Use safe innerHTML assignment to prevent XSS
        const deviceEntryHTML = `
            <div class="input-group">
                <span class="input-group-text device-number-indicator" style="min-width: 40px; font-weight: bold; color: #6c757d;">
                    #0
                </span>
                <span class="input-group-text drag-handle" style="cursor: grab; border-left: 0;">
                    <i class="fas fa-grip-vertical"></i>
                </span>
                <div class="input-group-text border-0 p-1" style="flex-direction: column; background: var(--tblr-bg-surface-secondary);">
                    <button type="button" class="btn btn-primary btn-sm move-up-btn" style="padding: 2px 8px; margin-bottom: 1px; border-radius: 3px; font-size: 11px;" title="Move Up">
                        <i class="fas fa-chevron-up"></i>
                    </button>
                    <button type="button" class="btn btn-primary btn-sm move-down-btn" style="padding: 2px 8px; border-radius: 3px; font-size: 11px;" title="Move Down">
                        <i class="fas fa-chevron-down"></i>
                    </button>
                </div>
                <input type="text" class="form-control device-input" placeholder="Enter device name (e.g., host01)" value="${escapedValue}">
                <button type="button" class="btn btn-outline-danger remove-device-btn">
                    <i class="fas fa-minus"></i>
                </button>
                <button type="button" class="btn btn-outline-success add-device-btn">
                    <i class="fas fa-plus"></i>
                </button>
            </div>
        `;
        
        // SECURITY: Use safe innerHTML assignment with DOMPurify sanitization
        window.safeSetInnerHTML(deviceEntry, deviceEntryHTML);
        
        container.appendChild(deviceEntry);
        this.updateDeviceButtons();
        this.updateDeviceNumbers();
        this.setupDragAndDrop(deviceEntry);
        
        // Focus and select the new input for easy editing
        const newInput = deviceEntry.querySelector(".device-input");
        newInput.focus();
        newInput.select();
    }

    generateNextDeviceName(previousValue) {
        if (!previousValue || previousValue.trim() === "") {
            return "";
        }

        // Look for patterns like: nswan01, host30, server123, etc.
        const match = previousValue.match(/^(.+?)(\d+)$/);
        
        if (match) {
            const prefix = match[1]; // e.g., "nswan", "host", "server"
            const number = parseInt(match[2], 10); // e.g., 1, 30, 123
            const nextNumber = number + 1;
            
            // Preserve leading zeros if they exist
            const originalNumberStr = match[2];
            const paddedNumber = nextNumber.toString().padStart(originalNumberStr.length, "0");
            
            return prefix + paddedNumber;
        }
        
        // If no numeric pattern found, return empty to let user type
        return "";
    }

    /**
     * Generate the next ticket number for new records.
     * IMPORTANT: Must check ALL tickets including deleted ones to prevent XT# reuse.
     * HEX-196: Soft delete implementation requires XT# uniqueness across lifetime.
     * @returns {Promise<string>} Next ticket number (e.g., "0001")
     */
    async generateNextXtNumber() {
        // Call backend API to generate next XT# (includes deleted tickets)
        // HEX-196: No fallback - if API fails, the error should bubble up
        console.log("[HEX-196] Calling /api/tickets/next-xt-number...");
        const response = await fetch("/api/tickets/next-xt-number");
        console.log("[HEX-196] Response status:", response.status, response.statusText);

        if (!response.ok) {
            const errorText = await response.text();
            console.error("[HEX-196] API error response:", errorText);
            throw new Error(`Failed to generate XT#: ${response.statusText} - ${errorText}`);
        }

        const data = await response.json();
        console.log("[HEX-196] Backend returned:", data.nextXtNumber);
        return data.nextXtNumber;
    }

    /**
     * Update the XT number display in the modal
     */
    async updateXtNumberDisplay() {
        const xtDisplayElement = document.getElementById("xtNumberDisplay");
        if (xtDisplayElement) {
            if (this.currentEditingId) {
                // Show current ticket's XT number when editing
                const ticket = this.getTicketById(this.currentEditingId);
                const xtValue = this.normalizeXtNumber(ticket?.xtNumber || ticket?.xt_number);
                xtDisplayElement.textContent = xtValue || "N/A";
            } else {
                // Show next available XT number for new tickets
                const nextXt = await this.generateNextXtNumber();
                xtDisplayElement.textContent = nextXt;
            }
        }
    }

    /**
     * Handle location-to-device autofill functionality
     * Only autofills the first device field when in ADD mode (not EDIT mode)
     * @param {string} locationValue - The value entered in the location field
     */
    handleLocationToDeviceAutofill(locationValue) {
        // Only autofill for new tickets (not when editing existing tickets)
        if (this.currentEditingId) {
            return;
        }

        // Skip autofill if power tool was used (devices already populated)
        const locationField = document.getElementById("location");
        if (locationField && locationField.dataset.powerToolPopulated === "true") {
            return;
        }

        // Get the first device input field
        const firstDeviceInput = document.querySelector("#devicesContainer .device-input");
        if (firstDeviceInput) {
            // Autofill if field is empty OR was previously autofilled (not manually edited)
            const isEmpty = !firstDeviceInput.value.trim();
            const wasAutofilled = firstDeviceInput.dataset.autofilled === "true";
            
            if (isEmpty || wasAutofilled) {
                firstDeviceInput.value = locationValue.trim();
                // Mark as autofilled if there's content, remove if empty
                if (locationValue.trim()) {
                    firstDeviceInput.dataset.autofilled = "true";
                } else {
                    delete firstDeviceInput.dataset.autofilled;
                }
            }
        }
    }

    removeDeviceField(deviceEntry) {
        const container = document.getElementById("devicesContainer");
        if (container.children.length > 1) {
            deviceEntry.remove();
            this.updateDeviceButtons();
            this.updateDeviceNumbers();
        }
    }

    updateDeviceButtons() {
        const deviceEntries = document.querySelectorAll(".device-entry");
        deviceEntries.forEach((entry) => {
            const removeBtn = entry.querySelector(".remove-device-btn");
            if (deviceEntries.length === 1) {
                removeBtn.style.display = "none";
            } else {
                removeBtn.style.display = "block";
            }
        });
    }

    /**
     * Move a device entry up in the list
     * @param {HTMLElement} deviceEntry - The device entry to move up
     */
    moveDeviceUp(deviceEntry) {
        const previousSibling = deviceEntry.previousElementSibling;
        if (previousSibling) {
            deviceEntry.parentNode.insertBefore(deviceEntry, previousSibling);
            this.updateDeviceNumbers();
            this.showMoveArrowFeedback("up");
            
            // Re-initialize drag and drop after DOM change
            this.initializeDragAndDrop();
        }
    }

    /**
     * Move a device entry down in the list
     * @param {HTMLElement} deviceEntry - The device entry to move down
     */
    moveDeviceDown(deviceEntry) {
        const nextSibling = deviceEntry.nextElementSibling;
        if (nextSibling) {
            deviceEntry.parentNode.insertBefore(nextSibling, deviceEntry);
            this.updateDeviceNumbers();
            this.showMoveArrowFeedback("down");
            
            // Re-initialize drag and drop after DOM change
            this.initializeDragAndDrop();
        }
    }

    /**
     * Update the numbered indicators for all device entries
     */
    updateDeviceNumbers() {
        const container = document.getElementById("devicesContainer");
        const deviceEntries = container.querySelectorAll(".device-entry");
        
        console.log(`Updating ${deviceEntries.length} device numbers`); // Debug log
        
        deviceEntries.forEach((entry, index) => {
            const numberIndicator = entry.querySelector(".device-number-indicator");
            if (numberIndicator) {
                const newNumber = `#${index + 1}`;
                console.log(`Setting device ${index} to ${newNumber}`); // Debug log
                numberIndicator.textContent = newNumber;
                
                // Add a subtle highlight effect to show the number updated
                numberIndicator.style.backgroundColor = "#007bff";
                numberIndicator.style.color = "white";
                numberIndicator.style.transition = "all 0.3s ease";
                
                setTimeout(() => {
                    numberIndicator.style.backgroundColor = "";
                    numberIndicator.style.color = "#6c757d";
                }, 800);
            } else {
                console.warn(`No number indicator found for device ${index}`); // Debug log
            }
            
            // Update up/down button states
            const moveUpBtn = entry.querySelector(".move-up-btn");
            const moveDownBtn = entry.querySelector(".move-down-btn");
            
            if (moveUpBtn && moveDownBtn) {
                // Disable up button for first item
                moveUpBtn.disabled = (index === 0);
                moveUpBtn.style.opacity = (index === 0) ? "0.5" : "1";
                
                // Disable down button for last item
                moveDownBtn.disabled = (index === deviceEntries.length - 1);
                moveDownBtn.style.opacity = (index === deviceEntries.length - 1) ? "0.5" : "1";
            }
        });
    }

    /**
     * Reverse the order of all device entries in the container (with toggle support)
     */
    reverseDeviceOrder() {
        const container = document.getElementById("devicesContainer");
        const deviceEntries = Array.from(container.querySelectorAll(".device-entry"));
        
        if (deviceEntries.length <= 1) {
            return; // Nothing to reverse
        }
        
        console.log("Reversing device order"); // Debug log
        
        // Clear the container
        container.innerHTML = "";
        
        // Add devices back in reverse order
        deviceEntries.reverse().forEach(entry => {
            container.appendChild(entry);
        });
        
        // Toggle the reverse state
        this.isDeviceOrderReversed = !this.isDeviceOrderReversed;
        
        // Update the reverse button to reflect current state
        this.updateReverseButton();
        
        // Update the numbering and button states
        this.updateDeviceNumbers();
        this.updateDeviceButtons();
        
        // Show visual feedback
        this.showReverseOrderFeedback();
    }

    /**
     * Update the reverse button appearance and text based on current state
     */
    updateReverseButton() {
        const reverseBtn = document.getElementById("reverseDevicesBtn");
        if (reverseBtn) {
            if (this.isDeviceOrderReversed) {
                reverseBtn.innerHTML = "<i class=\"fas fa-sort-amount-up\"></i> Restore";
                reverseBtn.title = "Restore original device order";
                reverseBtn.classList.remove("btn-outline-primary");
                reverseBtn.classList.add("btn-outline-warning");
            } else {
                reverseBtn.innerHTML = "<i class=\"fas fa-sort-amount-down-alt\"></i> Reverse";
                reverseBtn.title = "Reverse device order";
                reverseBtn.classList.remove("btn-outline-warning");
                reverseBtn.classList.add("btn-outline-primary");
            }
        }
    }

    /**
     * Show visual feedback when reversing device order
     */
    showReverseOrderFeedback() {
        const container = document.getElementById("devicesContainer");
        const headerDiv = container.previousElementSibling;
        const label = headerDiv.querySelector("label");
        
        if (label) {
            // Create feedback message based on current state
            const originalText = label.textContent; // Use textContent to avoid HTML
            const actionText = this.isDeviceOrderReversed ? "reversed" : "restored";
            label.textContent = "Devices (Order " + escapeHtml(actionText) + "! ✓ Use arrows or drag to reorder";
            const small = document.createElement("small");
            small.className = "text-primary fw-bold";
            small.textContent = "Order " + escapeHtml(actionText) + "! ✓ Use arrows or drag to reorder boot sequence";
            label.appendChild(small);
            label.style.color = "#0d6efd";
            
            // Reset after a short delay
            setTimeout(() => {
                label.textContent = originalText; // Use textContent for safe restoration
                label.style.color = "";
            }, 2000);
        }
    }

    /**
     * Show visual feedback when using arrow controls
     * @param {string} direction - 'up' or 'down'
     */
    showMoveArrowFeedback(direction) {
        const container = document.getElementById("devicesContainer");
        const headerDiv = container.previousElementSibling;
        const label = headerDiv.querySelector("label");
        
        if (label) {
            // Create a more prominent feedback message
            const originalText = label.textContent; // Use textContent to avoid HTML
            label.style.color = "#28a745";
            label.style.fontWeight = "bold";
            label.style.transition = "all 0.3s ease";
            
            // Safe DOM manipulation instead of innerHTML
            label.textContent = "Devices ";
            const small = document.createElement("small");
            small.className = "text-success fw-bold";
            small.textContent = `(Moved ${escapeHtml(direction)}! ✓ Use arrows or drag to reorder boot sequence)`;
            label.appendChild(small);
            
            setTimeout(() => {
                label.style.color = "";
                label.style.fontWeight = "";
                label.textContent = originalText; // Use textContent for safe restoration
            }, 2000);
        }
    }

    getDevices() {
        // PMD-disable-next-line GlobalVariable
        const deviceInputs = document.querySelectorAll(".device-input");
        const devices = [];
        deviceInputs.forEach(input => {
            if (input.value.trim()) {
                devices.push(input.value.trim());
            }
        });
        return devices;
    }

    setDevices(devices) {
        const container = document.getElementById("devicesContainer");
        container.innerHTML = "";
        
        // Use local variable to avoid parameter modification
        const deviceList = devices.length === 0 ? [""] : devices;
        
        deviceList.forEach((device) => {
            const deviceEntry = document.createElement("div");
            deviceEntry.className = "device-entry mb-2";
            deviceEntry.draggable = true;

            deviceEntry.innerHTML = `
                <div class="input-group">
                    <span class="input-group-text device-number-indicator" style="min-width: 40px; font-weight: bold; color: #6c757d;">
                        #0
                    </span>
                    <span class="input-group-text drag-handle" style="cursor: grab; border-left: 0;">
                        <i class="fas fa-grip-vertical"></i>
                    </span>
                    <div class="input-group-text border-0 p-1" style="flex-direction: column; background: var(--tblr-bg-surface-secondary);">
                        <button type="button" class="btn btn-primary btn-sm move-up-btn" style="padding: 2px 8px; margin-bottom: 1px; border-radius: 3px; font-size: 11px;" title="Move Up">
                            <i class="fas fa-chevron-up"></i>
                        </button>
                        <button type="button" class="btn btn-primary btn-sm move-down-btn" style="padding: 2px 8px; border-radius: 3px; font-size: 11px;" title="Move Down">
                            <i class="fas fa-chevron-down"></i>
                        </button>
                    </div>
                    <input type="text" class="form-control device-input" placeholder="Enter device name (e.g., host01)" value="${device}">
                    <button type="button" class="btn btn-outline-danger remove-device-btn" ${devices.length === 1 ? "style=\"display: none;\"" : ""}>
                        <i class="fas fa-minus"></i>
                    </button>
                    <button type="button" class="btn btn-outline-success add-device-btn">
                        <i class="fas fa-plus"></i>
                    </button>
                </div>
            `;
            container.appendChild(deviceEntry);
            this.setupDragAndDrop(deviceEntry);
        });
        
        this.updateDeviceButtons();
        this.updateDeviceNumbers();
    }

    // Drag and Drop functionality
    initializeDragAndDrop() {
        const container = document.getElementById("devicesContainer");
        const deviceEntries = container.querySelectorAll(".device-entry");
        
        deviceEntries.forEach(entry => {
            this.setupDragAndDrop(entry);
        });
    }

    setupDragAndDrop(deviceEntry) {
        // Add drag event listeners
        deviceEntry.addEventListener("dragstart", this.handleDragStart.bind(this));
        deviceEntry.addEventListener("dragend", this.handleDragEnd.bind(this));
        deviceEntry.addEventListener("dragover", this.handleDragOver.bind(this));
        deviceEntry.addEventListener("drop", this.handleDrop.bind(this));
        deviceEntry.addEventListener("dragenter", this.handleDragEnter.bind(this));
        deviceEntry.addEventListener("dragleave", this.handleDragLeave.bind(this));
    }

    handleDragStart(e) {
        this.draggedElement = e.currentTarget;
        e.currentTarget.classList.add("dragging");
        e.dataTransfer.effectAllowed = "move";
        e.dataTransfer.setData("text/html", e.currentTarget.outerHTML);
    }

    handleDragEnd(e) {
        e.currentTarget.classList.remove("dragging");
        
        // Clean up any remaining drag-over classes
        const container = document.getElementById("devicesContainer");
        const entries = container.querySelectorAll(".device-entry");
        entries.forEach(entry => {
            entry.classList.remove("drag-over");
        });
        
        // Remove any drag placeholder
        const placeholder = container.querySelector(".drag-placeholder");
        if (placeholder) {
            placeholder.remove();
        }
        
        this.draggedElement = null;
    }

    handleDragOver(e) {
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
        return false;
    }

    handleDragEnter(e) {
        e.preventDefault();
        if (e.currentTarget !== this.draggedElement) {
            e.currentTarget.classList.add("drag-over");
        }
    }

    handleDragLeave(e) {
        e.currentTarget.classList.remove("drag-over");
    }

    handleDrop(e) {
        e.preventDefault();
        e.stopPropagation();
        
        const dropTarget = e.currentTarget;
        
        if (dropTarget !== this.draggedElement && this.draggedElement) {
            const container = document.getElementById("devicesContainer");
            const allEntries = Array.from(container.querySelectorAll(".device-entry"));
            const draggedIndex = allEntries.indexOf(this.draggedElement);
            const dropIndex = allEntries.indexOf(dropTarget);
            
            // Remove the dragged element from its current position
            this.draggedElement.remove();
            
            // Insert the dragged element at the correct position
            if (dropIndex === 0) {
                // Dropping at the top - insert as first child
                container.insertBefore(this.draggedElement, container.firstChild);
            } else if (draggedIndex < dropIndex) {
                // Moving down - insert after the drop target
                dropTarget.parentNode.insertBefore(this.draggedElement, dropTarget.nextSibling);
            } else {
                // Moving up - insert before the drop target
                dropTarget.parentNode.insertBefore(this.draggedElement, dropTarget);
            }
            
            // Update device numbers after reordering
            this.updateDeviceNumbers();
            
            // Re-initialize drag and drop for all entries
            this.initializeDragAndDrop();
            
            // Show visual feedback for successful reorder
            this.showReorderFeedback();
        }
        
        dropTarget.classList.remove("drag-over");
        return false;
    }

    showReorderFeedback() {
        const container = document.getElementById("devicesContainer");
        const headerDiv = container.previousElementSibling;
        const label = headerDiv.querySelector("label");
        
        if (label) {
            // Temporarily highlight the label to show reordering happened
            const originalText = label.textContent; // Use textContent to avoid HTML
            label.style.color = "#28a745";
            label.innerHTML = "Devices <small class=\"text-success\">(Reordered! ✓ Use arrows or drag to reorder boot sequence)</small>";
            
            setTimeout(() => {
                label.style.color = "";
                label.textContent = originalText; // Use textContent for safe restoration
            }, 2000);
        }
    }

    async saveTicket() {
        // Validate that both site and location are required
        const site = document.getElementById("site").value.trim();
        const location = document.getElementById("location").value.trim();
        
        if (!site) {
            alert("Site is required.");
            document.getElementById("site").focus();
            return;
        }
        
        if (!location) {
            alert("Location is required.");
            document.getElementById("location").focus();
            return;
        }

        // Generate XT# for new tickets (await backend API call)
        const xtNumber = this.currentEditingId ?
            this.getTicketById(this.currentEditingId).xtNumber || this.getTicketById(this.currentEditingId).xt_number :
            await this.generateNextXtNumber();

        const ticket = {
            id: this.currentEditingId || Date.now().toString(),
            xtNumber: xtNumber,
            dateSubmitted: document.getElementById("dateSubmitted").value,
            dateDue: document.getElementById("dateDue").value,
            hexagonTicket: document.getElementById("hexagonTicket").value,
            serviceNowTicket: document.getElementById("serviceNowTicket").value,
            site: document.getElementById("site").value,
            location: document.getElementById("location").value,
            devices: this.getDevices(),
            supervisor: document.getElementById("supervisor").value,
            tech: document.getElementById("tech").value,
            status: document.getElementById("status").value,
            jobType: document.getElementById("jobType").value,
            notes: document.getElementById("notes").value,
            // Conditional fields
            trackingNumber: document.getElementById("outboundTracking").value + (document.getElementById("returnTracking").value ? " | " + document.getElementById("returnTracking").value : ""),
            shippingAddress: document.getElementById("shippingAddress").value,
            returnAddress: document.getElementById("returnAddress").value,
            softwareVersions: document.getElementById("softwareVersions").value,
            mitigationDetails: document.getElementById("mitigationDetailsInput").value,
            attachments: [], // No more attachments since we removed the file input
            createdAt: this.currentEditingId ? this.getTicketById(this.currentEditingId).createdAt : new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        ticket.xt_number = ticket.xtNumber;

        try {
            // Save to database instead of localStorage
            await this.saveTicketToDB(ticket);

            this.renderTickets();
            this.updateStatistics();
            this.populateLocationFilter();
            
            // Close modal
            const modal = bootstrap.Modal.getInstance(document.getElementById("ticketModal"));
            modal.hide();

            // Show success message
            this.showToast("Ticket saved successfully!", "success");
        } catch {
            // Error is already handled in saveTicketToDB, just return
            return;
        }
    }

    editTicket(id) {
        const ticket = this.getTicketById(id);
        if (!ticket) {return;}

        this.currentEditingId = id;
        
        document.getElementById("dateSubmitted").value = ticket.dateSubmitted;
        document.getElementById("dateDue").value = ticket.dateDue;
        document.getElementById("hexagonTicket").value = ticket.hexagonTicket;
        document.getElementById("serviceNowTicket").value = ticket.serviceNowTicket;
        document.getElementById("site").value = ticket.site || "";
        document.getElementById("location").value = ticket.location;
        document.getElementById("supervisor").value = ticket.supervisor;
        document.getElementById("tech").value = ticket.tech;
        document.getElementById("status").value = ticket.status;
        document.getElementById("jobType").value = ticket.jobType || ticket.job_type || "Upgrade";
        document.getElementById("notes").value = ticket.notes || "";

        // Populate conditional fields
        // Parse tracking numbers (stored as "outbound | return")
        const trackingNumbers = (ticket.tracking_number || ticket.trackingNumber || "").split(" | ");
        document.getElementById("outboundTracking").value = trackingNumbers[0] || "";
        document.getElementById("returnTracking").value = trackingNumbers[1] || "";
        document.getElementById("shippingAddress").value = ticket.shipping_address || ticket.shippingAddress || "";
        document.getElementById("returnAddress").value = ticket.return_address || ticket.returnAddress || "";
        document.getElementById("softwareVersions").value = ticket.software_versions || ticket.softwareVersions || "";
        document.getElementById("mitigationDetailsInput").value = ticket.mitigation_details || ticket.mitigationDetails || "";

        this.setDevices(ticket.devices || []);

        // Update XT# display for editing
        this.updateXtNumberDisplay();

        // Show/hide conditional fields based on job type
        this.updateConditionalFields();

        document.getElementById("ticketModalLabel").innerHTML = "<i class=\"fas fa-edit me-2\"></i>Edit Ticket";

        const modal = new bootstrap.Modal(document.getElementById("ticketModal"));
        modal.show();
    }

    /**
     * Show/hide conditional fields based on selected job type
     * @description Displays job type-specific fields: shipping (Replace/Refresh), software versions (Upgrade), or mitigation details (Mitigate)
     * @since 1.0.57
     * @module TicketsManager
     */
    updateConditionalFields() {
        const jobType = document.getElementById("jobType").value;
        const shippingFields = document.getElementById("shippingFields");
        const softwareVersionsField = document.getElementById("softwareVersionsField");
        const mitigationDetailsField = document.getElementById("mitigationDetailsField");

        // Hide all conditional fields first
        shippingFields.style.display = "none";
        softwareVersionsField.style.display = "none";
        mitigationDetailsField.style.display = "none";

        // Show appropriate fields based on job type
        switch (jobType) {
            case "Replace":
            case "Refresh":
                shippingFields.style.display = "block";
                break;
            case "Upgrade":
                softwareVersionsField.style.display = "block";
                break;
            case "Mitigate":
                mitigationDetailsField.style.display = "block";
                break;
            // "Other" shows no additional fields
        }
    }

    async deleteTicket(id) {
        if (confirm("Are you sure you want to delete this ticket?")) {
            try {
                await this.deleteTicketFromDB(id);
                this.renderTickets();
                this.updateStatistics();
                this.populateLocationFilter();
                this.showToast("Ticket deleted successfully!", "success");
            } catch (_error) {
                // Error is already handled in deleteTicketFromDB
                return;
            }
        }
    }

    viewTicket(id) {
        console.log("viewTicket called with id:", id);
        const ticket = this.getTicketById(id);
        if (!ticket) {
            console.error("Ticket not found with id:", id);
            return;
        }

        // Generate markdown content for the ticket (async)
        this.generateMarkdown(ticket).then(markdownContent => {
            // Display in the markdown view modal
            document.getElementById("markdownContent").textContent = markdownContent;
        }).catch(error => {
            console.error("Error generating ticket markdown:", error);
            document.getElementById("markdownContent").textContent = "Error loading ticket details";
        });
        document.getElementById("viewTicketModal").setAttribute("data-ticket-id", id);

        // Reset tabs to show ticket tab first
        const ticketTab = document.getElementById("ticket-tab");
        const vulnTab = document.getElementById("vulnerabilities-tab");
        if (ticketTab && vulnTab) {
            // Bootstrap tab switching
            const bsTicketTab = new bootstrap.Tab(ticketTab);
            bsTicketTab.show();
        }

        // Clear vulnerability markdown content initially
        const vulnContent = document.getElementById("vulnerabilityMarkdownContent");
        const vulnLoading = document.getElementById("vulnerabilityLoadingMessage");
        if (vulnContent) {
            vulnContent.textContent = "";
            vulnContent.style.display = "none";
        }
        if (vulnLoading) {
            vulnLoading.style.display = "block";
        }

        // Clear email markdown content initially
        const emailContent = document.getElementById("emailMarkdownContent");
        const emailLoading = document.getElementById("emailLoadingMessage");
        if (emailContent) {
            emailContent.textContent = "";
            emailContent.style.display = "none";
        }
        if (emailLoading) {
            emailLoading.style.display = "block";
        }

        // Load vulnerability data when the tab is clicked
        const vulnTabBtn = document.getElementById("vulnerabilities-tab");
        if (vulnTabBtn) {
            // Remove any existing listeners to prevent duplicates
            const newVulnTabBtn = vulnTabBtn.cloneNode(true);
            vulnTabBtn.parentNode.replaceChild(newVulnTabBtn, vulnTabBtn);

            newVulnTabBtn.addEventListener("shown.bs.tab", async () => {
                await this.loadVulnerabilityMarkdownForModal();
            });
        }

        // Load email template when the tab is clicked
        const emailTabBtn = document.getElementById("email-tab");
        if (emailTabBtn) {
            // Remove any existing listeners to prevent duplicates
            const newEmailTabBtn = emailTabBtn.cloneNode(true);
            emailTabBtn.parentNode.replaceChild(newEmailTabBtn, emailTabBtn);

            newEmailTabBtn.addEventListener("shown.bs.tab", async () => {
                await this.loadEmailMarkdownForModal();
            });
        }
        
        // Check if we're using Bootstrap or Tabler
        const viewTicketModal = document.getElementById("viewTicketModal");
        if (typeof bootstrap !== "undefined" && bootstrap.Modal) {
            console.log("Using Bootstrap Modal");
            const modal = new bootstrap.Modal(viewTicketModal);
            modal.show();
        } else if (typeof Tabler !== "undefined" && Tabler.Modal) {
            console.log("Using Tabler Modal");
            const modal = new Tabler.Modal(viewTicketModal);
            modal.show();
        } else {
            console.log("Manually showing modal with jQuery or native methods");
            // Fallback to manually adding the classes
            viewTicketModal.classList.add("show");
            viewTicketModal.style.display = "block";
            document.body.classList.add("modal-open");
            
            // Add backdrop
            const backdrop = document.createElement("div");
            backdrop.className = "modal-backdrop fade show";
            document.body.appendChild(backdrop);
        }
    }

    editTicketFromView() {
        const ticketId = document.getElementById("viewTicketModal").getAttribute("data-ticket-id");
        const viewModal = bootstrap.Modal.getInstance(document.getElementById("viewTicketModal"));
        viewModal.hide();

        setTimeout(() => {
            this.editTicket(ticketId);
        }, 300);
    }

    // Load vulnerability markdown for the modal view
    async loadVulnerabilityMarkdownForModal() {
        const ticketId = document.getElementById("viewTicketModal").getAttribute("data-ticket-id");
        const ticket = this.getTicketById(ticketId);

        if (!ticket) {
            console.error("[VulnModal] No ticket found for vulnerability loading");
            return;
        }

        const vulnContent = document.getElementById("vulnerabilityMarkdownContent");
        const vulnLoading = document.getElementById("vulnerabilityLoadingMessage");

        try {
            // Check if ticket has devices
            if (!ticket.devices || ticket.devices.length === 0) {
                if (vulnContent) {
                    vulnContent.textContent = "# No Devices Found\n\nThis ticket has no devices associated with it.";
                    vulnContent.style.display = "block";
                }
                if (vulnLoading) {
                    vulnLoading.style.display = "none";
                }
                return;
            }

            // Fetch vulnerabilities for this ticket's devices
            console.log("[VulnModal] Fetching vulnerabilities for devices:", ticket.devices);
            const vulnerabilities = await this.fetchVulnerabilitiesForDevices(ticket.devices);
            console.log("[VulnModal] Fetched vulnerabilities:", vulnerabilities?.length || 0);

            if (!vulnerabilities || vulnerabilities.length === 0) {
                // No vulnerabilities found
                if (vulnContent) {
                    const deviceList = ticket.devices.join(", ");
                    vulnContent.textContent = `# No Vulnerabilities Found\n\nNo vulnerability data found for the devices in this ticket:\n${deviceList}`;
                    vulnContent.style.display = "block";
                }
                if (vulnLoading) {
                    vulnLoading.style.display = "none";
                }
                return;
            }

            // Generate the markdown report
            const markdownReport = await this.generateVulnerabilityMarkdown(ticket, vulnerabilities);

            // Display the markdown
            if (vulnContent) {
                vulnContent.textContent = markdownReport || "No vulnerability data available";
                vulnContent.style.display = "block";
            }
            if (vulnLoading) {
                vulnLoading.style.display = "none";
            }

            console.log("[VulnModal] Vulnerability markdown loaded successfully");

        } catch (error) {
            console.error("[VulnModal] Error loading vulnerability markdown:", error);
            if (vulnContent) {
                vulnContent.textContent = "# Error Loading Vulnerabilities\n\nFailed to load vulnerability data. Please try again.";
                vulnContent.style.display = "block";
            }
            if (vulnLoading) {
                vulnLoading.style.display = "none";
            }
        }
    }

    renderTickets() {
        const tbody = document.getElementById("ticketsTableBody");
        const filteredTickets = this.getFilteredTickets();

        if (filteredTickets.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="12" class="text-center py-4">
                        <div class="empty-state">
                            <i class="fas fa-inbox"></i>
                            <h5>No tickets found</h5>
                            <p>No tickets match your current search criteria.</p>
                        </div>
                    </td>
                </tr>
            `;
            this.updatePaginationInfo(0, 0, 0);
            this.renderPaginationControls(0);
            return;
        }

        // Calculate pagination
        const totalItems = filteredTickets.length;
        const totalPages = Math.ceil(totalItems / this.rowsPerPage);
        
        // Ensure current page is valid
        if (this.currentPage > totalPages) {
            this.currentPage = totalPages;
        }
        if (this.currentPage < 1) {
            this.currentPage = 1;
        }

        const startIndex = (this.currentPage - 1) * this.rowsPerPage;
        const endIndex = Math.min(startIndex + this.rowsPerPage, totalItems);
        const paginatedTickets = filteredTickets.slice(startIndex, endIndex);

        tbody.innerHTML = paginatedTickets.map(ticket => {
            // Use server-calculated overdue status
            const isOverdue = ticket.isOverdue || ticket.status === "Overdue";
            
            // Format XT# to show only last 4 digits - escape for safety
            const displayXtNumber = ticket.xtNumber ? escapeHtml(ticket.xtNumber) : "N/A";
            
            return `
                <tr class="${isOverdue ? "table-danger" : ""}" data-ticket-id="${escapeHtml(ticket.id)}">
                    <td class="text-center"><strong>${displayXtNumber}</strong></td>
                    <td class="text-center">${escapeHtml(this.formatDate(ticket.dateSubmitted))}</td>
                    <td class="text-center">${escapeHtml(this.formatDate(ticket.dateDue))}</td>
                    <td class="text-center"><strong>${this.highlightSearch(ticket.hexagonTicket)}</strong></td>
                    <td class="text-center">${this.createServiceNowDisplay(ticket.serviceNowTicket)}</td>
                    <td class="text-center">${this.createSiteChip(ticket.site || "")}</td>
                    <td class="text-center">${this.createLocationChip(ticket.location || "")}</td>
                    <td class="text-center">
                        <div class="devices-list">
                            ${ticket.devices.map(device => `<span class="device-tag enhanced">${this.highlightSearch(device)}</span>`).join("")}
                        </div>
                    </td>
                    <td class="text-center">
                        <div class="supervisor-chips">
                            ${this.createSupervisorChips(ticket.supervisor)}
                        </div>
                    </td>
                    <td class="text-center"><span class="status-badge status-${escapeHtml(ticket.status.toLowerCase().replace(" ", "-"))}">${escapeHtml(ticket.status)}</span></td>
                    <td class="text-center">
                        <div class="btn-group btn-group-sm" role="group">
                            <button class="btn btn-outline-primary action-btn" onclick="window.ticketManager.viewTicket('${escapeHtml(ticket.id)}')" title="View">
                                <i class="fas fa-eye"></i>
                            </button>
                            <button class="btn btn-outline-warning action-btn" onclick="window.ticketManager.editTicket('${escapeHtml(ticket.id)}')" title="Edit">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="btn btn-outline-success action-btn" onclick="window.ticketManager.bundleTicketFiles('${escapeHtml(ticket.id)}')" title="Download Bundle">
                                <i class="fas fa-download"></i>
                            </button>
                            <button class="btn btn-outline-danger action-btn" onclick="window.ticketManager.deleteTicket('${escapeHtml(ticket.id)}')" title="Delete">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        }).join("");

        // Update pagination info and controls
        this.updatePaginationInfo(startIndex + 1, endIndex, totalItems);
        this.renderPaginationControls(totalPages);
    }

    updatePaginationInfo(start, end, total) {
        const paginationInfo = document.getElementById("paginationInfo");
        if (total === 0) {
            paginationInfo.textContent = "Showing 0 to 0 of 0 entries";
        } else {
            paginationInfo.textContent = `Showing ${start} to ${end} of ${total} entries`;
        }
    }

    renderPaginationControls(totalPages) {
        const paginationControls = document.getElementById("paginationControls");
        
        if (totalPages <= 1) {
            paginationControls.innerHTML = "";
            return;
        }

        let html = "";

        // Previous button
        html += `
            <li class="page-item ${this.currentPage === 1 ? "disabled" : ""}">
                <a class="page-link" href="#" onclick="ticketManager.goToPage(${this.currentPage - 1}); return false;">
                    <i class="fas fa-chevron-left"></i>
                </a>
            </li>
        `;

        // Page numbers with ellipsis logic
        const maxVisiblePages = 5;
        let startPage = Math.max(1, this.currentPage - Math.floor(maxVisiblePages / 2));
        const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

        // Adjust start if we're near the end
        if (endPage - startPage < maxVisiblePages - 1) {
            // PMD-disable-next-line GlobalVariable
            startPage = Math.max(1, endPage - maxVisiblePages + 1);
        }

        // First page and ellipsis if needed
        if (startPage > 1) {
            html += `
                <li class="page-item">
                    <a class="page-link" href="#" onclick="ticketManager.goToPage(1); return false;">1</a>
                </li>
            `;
            if (startPage > 2) {
                html += "<li class=\"page-item disabled\"><span class=\"page-link\">...</span></li>";
            }
        }

        // Page numbers
        for (let i = startPage; i <= endPage; i++) {
            html += `
                <li class="page-item ${i === this.currentPage ? "active" : ""}">
                    <a class="page-link" href="#" onclick="ticketManager.goToPage(${i}); return false;">${i}</a>
                </li>
            `;
        }

        // Last page and ellipsis if needed
        if (endPage < totalPages) {
            if (endPage < totalPages - 1) {
                html += "<li class=\"page-item disabled\"><span class=\"page-link\">...</span></li>";
            }
            html += `
                <li class="page-item">
                    <a class="page-link" href="#" onclick="ticketManager.goToPage(${totalPages}); return false;">${totalPages}</a>
                </li>
            `;
        }

        // Next button
        html += `
            <li class="page-item ${this.currentPage === totalPages ? "disabled" : ""}">
                <a class="page-link" href="#" onclick="ticketManager.goToPage(${this.currentPage + 1}); return false;">
                    <i class="fas fa-chevron-right"></i>
                </a>
            </li>
        `;

        // PMD-disable-next-line GlobalVariable
        paginationControls.innerHTML = html;
    }

    goToPage(page) {
        this.currentPage = page;
        this.renderTickets();
    }

    // Helper function to create location chips
    createLocationChip(location) {
        if (!location) {return "N/A";}
        const colorClass = this.getLocationColor(location);
        return `<span class="location-chip ${colorClass}">${this.highlightSearch(location)}</span>`;
    }

    // Helper function to create site chips  
    createSiteChip(site) {
        if (!site) {return "N/A";}
        const colorClass = this.getSiteColor(site);
        return `<span class="site-chip ${colorClass}">${this.highlightSearch(site)}</span>`;
    }

    // Helper function to create supervisor chips
    createSupervisorChips(supervisorText) {
        if (!supervisorText) {return "N/A";}
        
        // Parse supervisors (semicolon separated only - names are "LAST, FIRST" format)
        const supervisors = supervisorText.split(";").map(s => s.trim()).filter(s => s);
        
        return supervisors.map(supervisor => {
            const colorClass = this.getSupervisorColor(supervisor);
            return `<span class="supervisor-chip ${colorClass}">${this.highlightSearch(supervisor)}</span>`;
        }).join("");
    }

    // Color assignment functions for consistent chip styling
    getLocationColor(location) {
        const colors = ["bg-primary", "bg-success", "bg-info", "bg-warning", "bg-danger", "bg-secondary"];
        const hash = this.hashString(location);
        return colors[hash % colors.length];
    }

    getSiteColor(site) {
        const colors = ["bg-primary", "bg-success", "bg-info", "bg-warning", "bg-danger", "bg-secondary"];
        const hash = this.hashString(site);
        return colors[hash % colors.length];
    }

    getSupervisorColor(supervisor) {
        const colors = ["bg-primary", "bg-success", "bg-info", "bg-warning", "bg-danger", "bg-secondary"];
        const hash = this.hashString(supervisor);
        return colors[hash % colors.length];
    }

    // Helper function to create ServiceNow ticket display (clickable if enabled)
    createServiceNowDisplay(serviceNowTicket) {
        if (!serviceNowTicket) {return this.highlightSearch("N/A");}
        
        // Check if ServiceNow integration is enabled (from shared settings modal)
        const isEnabled = window.isServiceNowEnabled && window.isServiceNowEnabled();
        const serviceNowUrl = window.generateServiceNowUrl && window.generateServiceNowUrl(serviceNowTicket);
        
        // If enabled and we have a valid URL, make it clickable
        if (isEnabled && serviceNowUrl) {
            return `<a href="${serviceNowUrl}" target="_blank" class="text-decoration-none service-now-link" title="Open in ServiceNow">
                        <i class="fas fa-external-link-alt me-1 text-primary"></i>${this.highlightSearch(serviceNowTicket)}
                    </a>`;
        }
        
        // Otherwise, just show the ticket number
        return this.highlightSearch(serviceNowTicket);
    }

    // Simple hash function for consistent color assignment
    hashString(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            // PMD-disable-next-line GlobalVariable
            hash = ((hash << 5) - hash) + char;
            // PMD-disable-next-line GlobalVariable
            hash = hash & hash; // Convert to 32-bit integer
        }
        return Math.abs(hash);
    }

    /**
     * Get tickets filtered by search term, status, job type, location, and supervisor.
     * Applies all active filters and returns matching tickets for display.
     *
     * @returns {Array} Array of filtered ticket objects
     */
    getFilteredTickets() {
        const searchTerm = document.getElementById("searchInput").value.toLowerCase();
        const statusFilter = document.getElementById("statusFilter").value;
        const jobTypeFilter = document.getElementById("jobTypeFilter").value;
        const locationFilter = document.getElementById("locationFilter").value;

        return this.tickets.filter(ticket => {
            // 1. Search filter (applies to all fields)
            const matchesSearch = !searchTerm ||
                (ticket.xtNumber && ticket.xtNumber.toLowerCase().includes(searchTerm)) ||
                (ticket.hexagonTicket && ticket.hexagonTicket.toString().toLowerCase().includes(searchTerm)) ||
                (ticket.serviceNowTicket && ticket.serviceNowTicket.toLowerCase().includes(searchTerm)) ||
                (ticket.location && ticket.location.toLowerCase().includes(searchTerm)) ||
                (ticket.site && ticket.site.toLowerCase().includes(searchTerm)) ||
                (ticket.supervisor && ticket.supervisor.toLowerCase().includes(searchTerm)) ||
                (ticket.tech && ticket.tech.toLowerCase().includes(searchTerm)) ||
                (ticket.devices && Array.isArray(ticket.devices) && ticket.devices.some(device => device && device.toLowerCase().includes(searchTerm)));

            // 2. Card filter (primary status filter)
            const matchesCardFilter = this.applyCardFilterLogic(ticket);

            // 3. Status dropdown (only if no card filter active)
            const matchesStatus = this.activeCardFilter ? true : (!statusFilter || ticket.status === statusFilter);

            // 4. Job Type filter
            const matchesJobType = !jobTypeFilter || (ticket.jobType === jobTypeFilter || ticket.job_type === jobTypeFilter);

            // 5. Location filter
            const matchesLocation = !locationFilter || ticket.location === locationFilter;

            return matchesSearch && matchesCardFilter && matchesStatus && matchesJobType && matchesLocation;
        });
    }

    highlightSearch(text) {
        let searchTerm = document.getElementById("searchInput").value.toLowerCase();
        if (!searchTerm || !text) {return text;}

        // Defense-in-depth: Length limit to prevent excessive processing
        if (searchTerm.length > 100) {
            console.warn("[Security] Search term too long, truncating from", searchTerm.length, "to 100 chars");
            searchTerm = searchTerm.substring(0, 100);
        }

        // Security: Use split/join with escaped search term to prevent DoS attacks
        const parts = text.split(new RegExp(`(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi"));
        
        return parts.map((part, index) => {
            if (index % 2 === 1) {
                return `<span class="highlight">${part}</span>`;
            }
            return part;
        }).join("");
    }

    /**
     * Update ticket statistics display with current data.
     * Calculates and displays total tickets, active tickets, and overdue tickets.
     *
     * @returns {void}
     */
    updateStatistics() {
        const total = this.tickets.length;
        const open = this.tickets.filter(t => !["Closed", "Completed", "Failed"].includes(t.status)).length;
        const completed = this.tickets.filter(t => ["Completed", "Closed"].includes(t.status)).length;
        const overdue = this.tickets.filter(t => ["Overdue", "Failed"].includes(t.status)).length;

        document.getElementById("totalTickets").textContent = total;
        document.getElementById("openTickets").textContent = open;
        document.getElementById("completedTickets").textContent = completed;
        document.getElementById("overdueTickets").textContent = overdue;
    }

    /**
     * Apply card filter based on the clicked statistics card.
     * Updates filter state, visual styling, and re-renders the ticket table.
     *
     * @param {string} filterType - The type of filter ('all', 'open', 'overdue', 'completed')
     * @returns {void}
     */
    applyCardFilter(filterType) {
        // Validate filter type
        const validTypes = ["all", "open", "overdue", "completed"];
        if (!validTypes.includes(filterType)) {
            console.warn(`Invalid filter type: ${filterType}`);
            return;
        }

        // Handle clicking the same card (reset to all)
        if (this.activeCardFilter === filterType && filterType !== "all") {
            this.activeCardFilter = null;
            filterType = "all";
        } else {
            this.activeCardFilter = filterType === "all" ? null : filterType;
        }

        // Clear status dropdown when card is clicked
        if (this.activeCardFilter) {
            document.getElementById("statusFilter").value = "";
        }

        // Reset pagination and update visuals
        this.currentPage = 1;
        this.updateCardStyles(filterType === "all" ? null : filterType);
        this.announceFilterChange(filterType);
        this.renderTickets();
    }

    /**
     * Apply card filter logic to a single ticket.
     * Determines if ticket matches the currently active card filter.
     *
     * @param {Object} ticket - Ticket object to test
     * @returns {boolean} True if ticket matches active card filter
     */
    applyCardFilterLogic(ticket) {
        if (!this.activeCardFilter) {
            return true; // No card filter active, include all tickets
        }

        switch (this.activeCardFilter) {
            case "open":
                // Active tickets needing attention
                return !["Closed", "Completed", "Failed"].includes(ticket.status);

            case "overdue":
                // Urgent/problematic tickets
                return ["Overdue", "Failed"].includes(ticket.status);

            case "completed":
                // Successfully finished tickets
                return ["Completed", "Closed"].includes(ticket.status);

            default:
                return true;
        }
    }

    /**
     * Update visual styling for statistics cards based on active filter.
     * Adds/removes active styling to show which filter is currently applied.
     *
     * @param {string|null} activeFilter - The currently active filter type or null
     * @returns {void}
     */
    updateCardStyles(activeFilter) {
        const cards = document.querySelectorAll(".stats-card");
        cards.forEach(card => {
            const cardType = card.getAttribute("data-filter-type");
            if (cardType === activeFilter) {
                card.classList.add("stats-card-active");
                card.setAttribute("aria-pressed", "true");
            } else {
                card.classList.remove("stats-card-active");
                card.setAttribute("aria-pressed", "false");
            }
        });
    }

    /**
     * Announce filter changes to screen readers for accessibility.
     * Updates live region with human-readable filter status.
     *
     * @param {string} filterType - The filter type that was applied
     * @returns {void}
     */
    announceFilterChange(filterType) {
        const messages = {
            "all": "Showing all tickets",
            "open": "Showing open tickets only",
            "overdue": "Showing overdue and failed tickets",
            "completed": "Showing completed tickets only"
        };

        // Find or create announcement element
        let announcement = document.getElementById("filterAnnouncement");
        if (!announcement) {
            announcement = document.createElement("div");
            announcement.id = "filterAnnouncement";
            announcement.className = "sr-only";
            announcement.setAttribute("aria-live", "polite");
            announcement.setAttribute("aria-atomic", "true");
            document.body.appendChild(announcement);
        }

        announcement.textContent = messages[filterType] || "Filter applied";
    }

    populateLocationFilter() {
        const locations = [...new Set(this.tickets.map(t => t.location))].sort();
        const filter = document.getElementById("locationFilter");
        const currentValue = filter.value;
        
        filter.innerHTML = "<option value=\"\">All Locations</option>";
        locations.forEach(location => {
            const option = document.createElement("option");
            option.value = location;
            option.textContent = location;
            filter.appendChild(option);
        });
        
        filter.value = currentValue;
    }

    /**
     * Reset the ticket creation/editing form to default state.
     * Clears all form fields, resets device entries, and clears any editing state.
     *
     * @returns {void}
     */
    resetForm() {
        document.getElementById("ticketForm").reset();
        this.currentEditingId = null;
        document.getElementById("ticketModalLabel").innerHTML = "<i class=\"fas fa-plus me-2\"></i>Add New Ticket";
        
        // Reset dates
        document.getElementById("dateSubmitted").value = new Date().toISOString().split("T")[0];
        const dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + 7);
        document.getElementById("dateDue").value = dueDate.toISOString().split("T")[0];
        
        // Reset devices
        this.setDevices([""]);
        // Update device numbers to show proper numbering (fixes #0 display issue)
        setTimeout(() => this.updateDeviceNumbers(), 50);

        // Show/hide conditional fields for default job type (Upgrade)
        this.updateConditionalFields();
    }

    formatDate(dateString) {
        // Handle date-only strings (YYYY-MM-DD) to avoid timezone issues
        if (dateString && dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
            const [year, month, day] = dateString.split("-");
            return new Date(year, month - 1, day).toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric"
            });
        }
        
        // Fallback for other date formats
        return new Date(dateString).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric"
        });
    }

    getTicketById(id) {
        return this.tickets.find(t => t.id === id);
    }

    // Note: loadTickets() and saveTickets() methods removed - now using database API

    showToast(message, type = "info") {
        // Create toast container if it doesn't exist
        let toastContainer = document.getElementById("toastContainer");
        if (!toastContainer) {
            toastContainer = document.createElement("div");
            toastContainer.id = "toastContainer";
            toastContainer.className = "position-fixed top-0 end-0 p-3";
            toastContainer.style.zIndex = "1055";
            document.body.appendChild(toastContainer);
        }

        const toastId = "toast-" + Date.now();
        const toast = document.createElement("div");
        toast.className = `toast align-items-center text-white bg-${type === "success" ? "success" : type === "error" ? "danger" : "info"} border-0`;
        toast.id = toastId;
        toast.setAttribute("role", "alert");
        toast.innerHTML = `
            <div class="d-flex">
                <div class="toast-body">${message}</div>
                <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
            </div>
        `;

        toastContainer.appendChild(toast);
        const bsToast = new bootstrap.Toast(toast);
        bsToast.show();

        // Remove toast after it's hidden
        toast.addEventListener("hidden.bs.toast", () => {
            toast.remove();
        });
    }

    // Individual Ticket PDF Download
    downloadTicketPDF(id) {
        /* PMD-disable GlobalVariable */
        const ticket = this.getTicketById(id);
        if (!ticket) {
            this.showToast("Ticket not found", "error");
            return;
        }

        const { jsPDF } = window.jspdf;
        const doc = new jsPDF("p", "mm", "a4");

        // Title
        doc.setFontSize(16);
        doc.setTextColor(0, 102, 204); // Blue color
        doc.text(`Hexagon Ticket [${ticket.hexagonTicket}]`, 20, 25);

        // Content styling
        doc.setTextColor(0, 0, 0); // Black color
        doc.setFontSize(12);

        let yPosition = 45;
        const lineHeight = 8;
        const sectionSpacing = 12;

        // Site/Group
        doc.setFont("helvetica", "bold");
        doc.text("Site/Group:", 20, yPosition);
        doc.setFont("helvetica", "normal");
        doc.text(`${ticket.location}`, 20, yPosition + lineHeight);
        // PMD-disable-next-line GlobalVariable
        yPosition += sectionSpacing;

        // Subject
        doc.setFont("helvetica", "bold");
        doc.text("Subject:", 20, yPosition);
        doc.setFont("helvetica", "normal");
        doc.text(`NETOPS: Software Upgrades [${ticket.location}]`, 20, yPosition + lineHeight);
        yPosition += sectionSpacing;

        // Start Date
        doc.setFont("helvetica", "bold");
        doc.text("Start Date:", 20, yPosition);
        doc.setFont("helvetica", "normal");
        doc.text(this.formatDate(ticket.dateSubmitted), 20, yPosition + lineHeight);
        yPosition += sectionSpacing;

        // Required Completion Date
        doc.setFont("helvetica", "bold");
        doc.text("Required Completion Date:", 20, yPosition);
        doc.setFont("helvetica", "normal");
        doc.text(this.formatDate(ticket.dateDue), 20, yPosition + lineHeight);
        yPosition += sectionSpacing;

        // Task Instruction
        doc.setFont("helvetica", "bold");
        doc.text("Task Instruction:", 20, yPosition);
        yPosition += lineHeight;
        doc.setFont("helvetica", "normal");
        
        const taskText = `There are critical security patches that must be applied within 30 days at the [${ticket.location}] site.`;
        const splitTaskText = doc.splitTextToSize(taskText, 170);
        doc.text(splitTaskText, 20, yPosition);
        yPosition += splitTaskText.length * 6 + 8;

        // Instructions with Service Now info
        const instructionText = `Please schedule a maintenance outage of at least two hours and contact the ITCC @ 918-732-4822 with service now ticket number [${ticket.serviceNowTicket || "TBD"}] to coordinate Netops to apply security updates and reboot the equipment.`;
        const splitInstructionText = doc.splitTextToSize(instructionText, 170);
        doc.text(splitInstructionText, 20, yPosition);
        yPosition += splitInstructionText.length * 6 + 15;

        // Devices section
        doc.setFont("helvetica", "bold");
        doc.text("The devices will be updated and rebooted in the following order:", 20, yPosition);
        yPosition += lineHeight + 5;

        doc.setFont("helvetica", "normal");
        ticket.devices.forEach((device, index) => {
            doc.text(`${index + 1}. ${device}`, 30, yPosition);
            yPosition += lineHeight;
        });

        // Notes section (moved up)
        if (ticket.notes) {
            yPosition += 15;
            doc.setFont("helvetica", "bold");
            doc.setFontSize(12);
            doc.setTextColor(0, 0, 0);
            doc.text("Notes:", 20, yPosition);
            yPosition += 8;
            doc.setFont("helvetica", "normal");
            doc.setFontSize(10);
            const splitNotes = doc.splitTextToSize(ticket.notes, 170);
            doc.text(splitNotes, 20, yPosition);
            yPosition += splitNotes.length * 6;
        }

        // Add shared documentation info if available
        if (this.sharedDocumentation.length > 0) {
            yPosition += 15;
            doc.setFont("helvetica", "bold");
            doc.setFontSize(12);
            doc.setTextColor(0, 0, 0);
            doc.text("Attached Documentation:", 20, yPosition);
            yPosition += 8;
            
            doc.setFont("helvetica", "normal");
            doc.setFontSize(10);
            this.sharedDocumentation.forEach((doc_file, index) => {
                doc.text(`${index + 1}. ${doc_file.name} (${this.formatFileSize(doc_file.size)})`, 25, yPosition);
                yPosition += 6;
            });
            yPosition += 5;
        }

        // Footer with additional details
        yPosition += 20;
        doc.setFontSize(10);
        doc.setTextColor(100, 100, 100);
        doc.text(`Generated: ${new Date().toLocaleDateString()}`, 20, yPosition);
        doc.text(`Supervisor: ${ticket.supervisor}`, 20, yPosition + 6);
        doc.text(`Tech: ${ticket.tech}`, 20, yPosition + 12);
        doc.text(`Status: ${ticket.status}`, 20, yPosition + 18);

        // Generate filename: sitename_date_ticketnumber
        const siteName = ticket.location.replace(/\s+/g, "").replace(/[^a-zA-Z0-9]/g, "");
        const dateStr = ticket.dateSubmitted.replace(/-/g, "");
        const ticketNum = ticket.hexagonTicket.replace(/[^a-zA-Z0-9]/g, "");
        const filename = `${siteName}_${dateStr}_${ticketNum}.pdf`;

        // Save the PDF
        doc.save(filename);
        this.showToast(`PDF downloaded: ${filename}`, "success");
    }
    // PMD-suppresswarnings:enable

    // File conversion helper
    fileToBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result);
            reader.onerror = error => reject(error);
        });
    }

    // Simple hostname matching - case-insensitive only
    hostnameMatches(hostname1, hostname2) {
        if (!hostname1 || !hostname2) {return false;}

        // Simple case-insensitive match
        return hostname1.toLowerCase().trim() === hostname2.toLowerCase().trim();
    }

    // Fetch vulnerabilities for matched devices
    async fetchVulnerabilitiesForDevices(devices) {
        if (!devices || devices.length === 0) {return [];}

        try {
            // Fetch vulnerabilities from the API
            const response = await authState.authenticatedFetch("/api/vulnerabilities?" + new URLSearchParams({
                limit: "10000",  // Get all vulnerabilities for these devices
                sort: "severity"
            }));

            if (!response.ok) {
                console.error("[VulnBundle] Failed to fetch vulnerabilities:", response.status);
                return [];
            }

            const data = await response.json();

            // Check if we got the expected data structure
            if (!data || !data.data || !Array.isArray(data.data)) {
                console.error("[VulnBundle] Unexpected API response structure");
                return [];
            }

            // Filter vulnerabilities to match our devices
            const matchedVulns = data.data.filter(vuln => {
                return devices.some(device => {
                    return this.hostnameMatches(vuln.hostname, device);
                });
            });

            // Log matching summary (production-friendly)
            if (matchedVulns.length > 0) {
                const uniqueHosts = new Set(matchedVulns.map(v => v.hostname));
                console.log(`[VulnBundle] Found ${matchedVulns.length} vulnerabilities across ${uniqueHosts.size} device(s)`);
            }

            return matchedVulns;
        } catch (error) {
            console.error("[VulnBundle] Error fetching vulnerabilities:", error);
            return [];
        }
    }

    // Generate vulnerability markdown report
    async generateVulnerabilityMarkdown(ticket, vulnerabilities) {
        if (!vulnerabilities || vulnerabilities.length === 0) {
            return null;  // No report if no vulnerabilities
        }

        try {
            // Try to fetch template from database first
            const template = await this.fetchTemplateFromDB("default_vulnerability");

            if (template) {
                // Use database template with variable substitution
                const variableMap = this.buildVariableMap(ticket, vulnerabilities);
                return this.processTemplateWithVariables(template, variableMap);
            } else {
                console.warn("Vulnerability template not found in database, using fallback");
                // Fallback to hardcoded template
                return this.generateVulnerabilityMarkdownFallback(ticket, vulnerabilities);
            }
        } catch (error) {
            console.error("Error generating vulnerability markdown from template:", error);
            // Use fallback on any error
            return this.generateVulnerabilityMarkdownFallback(ticket, vulnerabilities);
        }
    }

    // Fallback vulnerability markdown generation (original hardcoded version)
    generateVulnerabilityMarkdownFallback(ticket, vulnerabilities) {
        if (!vulnerabilities || vulnerabilities.length === 0) {
            return null;  // No report if no vulnerabilities
        }

        // Group vulnerabilities by device
        const vulnsByDevice = {};
        vulnerabilities.forEach(vuln => {
            const hostname = vuln.hostname || "Unknown Device";
            if (!vulnsByDevice[hostname]) {
                vulnsByDevice[hostname] = [];
            }
            vulnsByDevice[hostname].push(vuln);
        });

        // Build the markdown report
        let markdown = `# Vulnerability Report for ${ticket.location || ticket.site || "Unknown Location"}\n\n`;
        markdown += `**XT#:** ${ticket.xtNumber || ticket.xt_number || "N/A"}\n`;
        markdown += `**Hexagon#:** ${ticket.hexagonTicket || "N/A"}\n`;
        markdown += `**ServiceNow#:** ${ticket.serviceNowTicket || "N/A"}\n\n`;
        markdown += `Generated: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}\n\n`;
        markdown += "## Summary\n";
        markdown += `- Total Vulnerabilities: ${vulnerabilities.length}\n`;
        markdown += `- Affected Devices: ${Object.keys(vulnsByDevice).length}\n`;

        // Count by severity
        const severityCounts = { CRITICAL: 0, HIGH: 0, MEDIUM: 0, LOW: 0 };
        vulnerabilities.forEach(v => {
            const sev = (v.severity || "LOW").toUpperCase();
            if (severityCounts[sev] !== undefined) {
                severityCounts[sev]++;
            }
        });
        markdown += `- Critical: ${severityCounts.CRITICAL}, High: ${severityCounts.HIGH}, Medium: ${severityCounts.MEDIUM}, Low: ${severityCounts.LOW}\n\n`;

        // Add vulnerabilities by device
        Object.keys(vulnsByDevice).sort().forEach(hostname => {
            const deviceVulns = vulnsByDevice[hostname];

            markdown += `## Device: ${hostname}\n`;
            markdown += `Total Vulnerabilities: ${deviceVulns.length}\n\n`;

            // Sort by VPR score (highest to lowest)
            deviceVulns.sort((a, b) => {
                return (b.vpr_score || 0) - (a.vpr_score || 0);
            });

            // Create table
            markdown += "| CVE/Plugin | Description | Severity | VPR | First Seen | Last Seen |\n";
            markdown += "|------------|-------------|----------|-----|------------|-------------||\n";

            deviceVulns.forEach(vuln => {
                const id = vuln.cve || vuln.plugin_id || "N/A";
                const desc = (vuln.plugin_name || vuln.description || "N/A").substring(0, 50);
                const severity = vuln.severity || "N/A";
                const vpr = vuln.vpr_score ? vuln.vpr_score.toFixed(1) : "N/A";
                const firstSeen = vuln.first_seen ? new Date(vuln.first_seen).toLocaleDateString() : "N/A";
                const lastSeen = vuln.last_seen ? new Date(vuln.last_seen).toLocaleDateString() : "N/A";

                markdown += `| ${id} | ${desc} | ${severity} | ${vpr} | ${firstSeen} | ${lastSeen} |\n`;
            });

            markdown += "\n";
        });

        // Add devices with no vulnerabilities
        if (ticket.devices && ticket.devices.length > 0) {
            const devicesWithoutVulns = ticket.devices.filter(device => {
                return !vulnerabilities.some(v => {
                    return this.hostnameMatches(v.hostname, device);
                });
            });

            if (devicesWithoutVulns.length > 0) {
                markdown += "---\n\n";
                markdown += "## Devices with No Vulnerabilities Found\n";
                devicesWithoutVulns.forEach(device => {
                    markdown += `- ${device}\n`;
                });
                markdown += "\n";
            }
        }

        markdown += "---\n";
        markdown += "*This report was automatically generated based on matching device hostnames.*\n";

        return markdown;
    }

    // Bundle ticket files into zip
    async bundleTicketFiles(id) {
        const ticket = this.getTicketById(id);
        if (!ticket) {
            this.showToast("Ticket not found", "error");
            return;
        }

        try {
            const zip = new JSZip();
            const ticketMarkdown = await this.generateMarkdown(ticket);

            const { jsPDF } = window.jspdf;
            const doc = new jsPDF("p", "mm", "a4");
            const margin = 20;
            const pageWidth = doc.internal.pageSize.getWidth() - (margin * 2);
            const lineHeight = 6;
            let yPosition = margin;

            doc.setFont("courier", "normal");
            doc.setFontSize(11);

            const wrappedLines = doc.splitTextToSize(ticketMarkdown, pageWidth);
            wrappedLines.forEach(line => {
                if (yPosition > doc.internal.pageSize.getHeight() - margin) {
                    doc.addPage();
                    doc.setFont("courier", "normal");
                    doc.setFontSize(11);
                    yPosition = margin;
                }
                doc.text(line, margin, yPosition);
                yPosition += lineHeight;
            });

            const sanitizedSite = (ticket.site || ticket.location || "UNKNOWN")
                .replace(/\s+/g, "")
                .replace(/[^a-zA-Z0-9_-]/g, "");
            const dateStr = (ticket.dateSubmitted || new Date().toISOString().split("T")[0]).replace(/-/g, "");
            const hexagonId = (ticket.hexagonTicket || "TICKET").replace(/[^a-zA-Z0-9_-]/g, "");
            const baseFilename = `${sanitizedSite}_${dateStr}_${hexagonId}`;

            const pdfBlob = doc.output("blob");
            zip.file(`${baseFilename}.pdf`, pdfBlob);

            const markdownBlob = new Blob([ticketMarkdown], { type: "text/markdown" });
            zip.file(`${baseFilename}.md`, markdownBlob);

            // Automatically fetch and include vulnerabilities if devices are present
            if (ticket.devices && ticket.devices.length > 0) {
                try {
                    // Ensure devices is an array (sometimes it might be a string from the database)
                    let deviceArray = ticket.devices;
                    if (typeof deviceArray === "string") {
                        try {
                            deviceArray = JSON.parse(deviceArray);
                        } catch (e) {
                            console.error("[VulnBundle] Failed to parse devices string:", e);
                            deviceArray = [];
                        }
                    }

                    if (!Array.isArray(deviceArray) || deviceArray.length === 0) {
                        deviceArray = [];
                    }

                    // Check if vulnerability feature is available
                    const statsResponse = await authState.authenticatedFetch("/api/vulnerabilities/stats");

                    if (statsResponse.ok) {
                        const stats = await statsResponse.json();

                        // Calculate total vulnerabilities from all severities
                        const totalVulns = (stats.critical?.count || 0) + (stats.high?.count || 0) +
                                          (stats.medium?.count || 0) + (stats.low?.count || 0);

                        // Only proceed if there are vulnerabilities in the database
                        if (totalVulns > 0 && deviceArray.length > 0) {
                            console.log(`[VulnBundle] Checking ${deviceArray.length} devices for vulnerabilities...`);
                            const vulnerabilities = await this.fetchVulnerabilitiesForDevices(deviceArray);

                            if (vulnerabilities && vulnerabilities.length > 0) {
                                const vulnMarkdown = await this.generateVulnerabilityMarkdown(ticket, vulnerabilities);

                                if (vulnMarkdown) {
                                    const vulnBlob = new Blob([vulnMarkdown], { type: "text/markdown" });
                                    zip.file(`${baseFilename}_vulnerabilities.md`, vulnBlob);
                                    console.log("[VulnBundle] ✅ Vulnerability report added to bundle");
                                }
                            }
                        }
                    }
                } catch (error) {
                    console.error("[VulnBundle] Error during vulnerability processing:", error);
                    // Continue without vulnerability report - don't fail the whole bundle
                }
            }

            // Add shared documentation files (uploaded via "Attach Documentation")
            if (this.sharedDocumentation && this.sharedDocumentation.length > 0) {
                this.sharedDocumentation.forEach((doc_file) => {
                    // Convert base64 back to blob
                    const base64Data = doc_file.content.split(",")[1];
                    const binaryString = atob(base64Data);
                    const bytes = new Uint8Array(binaryString.length);
                    for (let i = 0; i < binaryString.length; i++) {
                        bytes[i] = binaryString.charCodeAt(i);
                    }
                    zip.file(doc_file.name, bytes);
                });
            }

            // Add attached files to zip
            if (ticket.attachments && ticket.attachments.length > 0) {
                ticket.attachments.forEach((attachment, index) => {
                    // Convert base64 back to blob
                    const base64Data = attachment.data.split(",")[1];
                    const binaryString = atob(base64Data);
                    const bytes = new Uint8Array(binaryString.length);
                    for (let i = 0; i < binaryString.length; i++) {
                        bytes[i] = binaryString.charCodeAt(i);
                    }
                    
                    // Rename file to match the base filename pattern
                    const fileExt = attachment.name.split(".").pop();
                    const newFileName = `${baseFilename}_attachment_${index + 1}.${fileExt}`;
                    
                    zip.file(newFileName, bytes);
                });
            }

            // Generate and download zip
            const zipBlob = await zip.generateAsync({type: "blob"});
            const url = URL.createObjectURL(zipBlob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `${baseFilename}_bundle.zip`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            this.showToast(`Bundle downloaded: ${baseFilename}_bundle.zip`, "success");
        } catch (error) {
            console.error("Error creating bundle:", error);
            this.showToast("Error creating bundle", "error");
        }
    }

    // Export Functions
    exportData(format) {
        const tickets = this.getFilteredTickets();
        
        if (tickets.length === 0) {
            this.showToast("No tickets to export", "error");
            return;
        }

        switch (format) {
            case "csv":
                this.exportCSV(tickets);
                break;
            case "excel":
                this.exportExcel(tickets);
                break;
            case "json":
                this.exportJSON(tickets);
                break;
            case "pdf":
                this.exportPDF(tickets);
                break;
            case "html":
                this.exportHTML(tickets);
                break;
        }
    }

    exportCSV(tickets) {
        const headers = ["XT Number", "Date Submitted", "Date Due", "Hexagon Ticket #", "Service Now #", "Site", "Location", "Devices", "Supervisor", "Tech", "Status", "Notes"];
        const csvContent = [
            headers.join(","),
            ...tickets.map(ticket => [
                `"${ticket.xtNumber || ""}"`,
                ticket.dateSubmitted,
                ticket.dateDue,
                `"${ticket.hexagonTicket}"`,
                `"${ticket.serviceNowTicket || ""}"`,
                `"${ticket.site || ""}"`,
                `"${ticket.location || ""}"`,
                `"${ticket.devices.join("; ")}"`,
                `"${ticket.supervisor || ""}"`,
                `"${ticket.tech || ""}"`,
                `"${ticket.status}"`,
                `"${ticket.notes || ""}"`
            ].join(","))
        ].join("\n");

        this.downloadFile(csvContent, "hexagon-tickets.csv", "text/csv");
    }

    exportExcel(tickets) {
        const ws = XLSX.utils.json_to_sheet(tickets.map(ticket => ({
            "XT Number": ticket.xtNumber || "",
            "Date Submitted": ticket.dateSubmitted,
            "Date Due": ticket.dateDue,
            "Hexagon Ticket #": ticket.hexagonTicket,
            "Service Now #": ticket.serviceNowTicket,
            "Site": ticket.site || "",
            "Location": ticket.location || "",
            "Devices": ticket.devices.join("; "),
            "Supervisor": ticket.supervisor || "",
            "Tech": ticket.tech || "",
            "Status": ticket.status,
            "Notes": ticket.notes || ""
        })));

        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Hexagon Tickets");
        XLSX.writeFile(wb, "hexagon-tickets.xlsx");
    }

    exportJSON(tickets) {
        const jsonContent = JSON.stringify(tickets, null, 2);
        this.downloadFile(jsonContent, "hexagon-tickets.json", "application/json");
    }

    exportPDF(tickets) {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF("l", "mm", "a4");

        doc.setFontSize(18);
        doc.text("Hexagon Tickets Report", 14, 22);
        
        doc.setFontSize(12);
        doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 32);
        doc.text(`Total Tickets: ${tickets.length}`, 14, 40);

        const tableData = tickets.map(ticket => [
            this.formatDate(ticket.dateSubmitted),
            this.formatDate(ticket.dateDue),
            ticket.hexagonTicket,
            ticket.serviceNowTicket || "N/A",
            ticket.location,
            ticket.devices.join(", "),
            ticket.supervisor,
            ticket.tech,
            ticket.status
        ]);

        doc.autoTable({
            head: [["Date Submitted", "Date Due", "Hexagon #", "Service Now #", "Location", "Devices", "Supervisor", "Tech", "Status"]],
            body: tableData,
            startY: 50,
            styles: { fontSize: 8 },
            columnStyles: {
                5: { cellWidth: 40 }
            }
        });

        doc.save("hexagon-tickets.pdf");
    }

    exportHTML(tickets) {
        const htmlContent = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>Hexagon Tickets Report</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 20px; }
                    table { border-collapse: collapse; width: 100%; }
                    th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                    th { background-color: #f2f2f2; }
                    .header { margin-bottom: 20px; }
                </style>
            </head>
            <body>
                <div class="header">
                    <h1>Hexagon Tickets Report</h1>
                    <p>Generated on: ${new Date().toLocaleDateString()}</p>
                    <p>Total Tickets: ${tickets.length}</p>
                </div>
                <table>
                    <thead>
                        <tr>
                            <th>Date Submitted</th>
                            <th>Date Due</th>
                            <th>Hexagon Ticket #</th>
                            <th>Service Now #</th>
                            <th>Location</th>
                            <th>Devices</th>
                            <th>Supervisor</th>
                            <th>Tech</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${tickets.map(ticket => `
                            <tr>
                                <td>${this.formatDate(ticket.dateSubmitted)}</td>
                                <td>${this.formatDate(ticket.dateDue)}</td>
                                <td>${ticket.hexagonTicket}</td>
                                <td>${ticket.serviceNowTicket || "N/A"}</td>
                                <td>${ticket.location}</td>
                                <td>${ticket.devices.join(", ")}</td>
                                <td>${ticket.supervisor}</td>
                                <td>${ticket.tech}</td>
                                <td>${ticket.status}</td>
                            </tr>
                        `).join("")}
                    </tbody>
                </table>
            </body>
            </html>
        `;

        this.downloadFile(htmlContent, "hexagon-tickets.html", "text/html");
    }

    downloadFile(content, filename, mimeType) {
        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        this.showToast(`${filename} downloaded successfully!`, "success");
    }

    // Handle shared documentation upload
    async handleSharedDocumentation(files) {
        if (files.length === 0) {return;}

        this.sharedDocumentation = [];

        for (const file of files) {
            try {
                const base64Content = await this.fileToBase64(file);
                this.sharedDocumentation.push({
                    name: file.name,
                    type: file.type,
                    size: file.size,
                    content: base64Content
                });
            } catch (error) {
                console.error("Error processing shared documentation:", error);
                this.showToast(`Error uploading ${file.name}`, "error");
            }
        }

        this.saveSharedDocumentation();
        this.updateAttachmentTooltip(); // Update tooltip to show new files
        this.showToast(`${files.length} documentation file(s) uploaded successfully!`, "success");
    }

    // Save shared documentation to localStorage
    saveSharedDocumentation() {
        localStorage.setItem("hexagon_shared_docs", JSON.stringify(this.sharedDocumentation));
    }

    // Load shared documentation from localStorage
    loadSharedDocumentation() {
        const saved = localStorage.getItem("hexagon_shared_docs");
        if (saved) {
            this.sharedDocumentation = JSON.parse(saved);
            // Update the button tooltip to show loaded files
            // Use setTimeout to ensure DOM is fully ready when navigating between pages
            setTimeout(() => {
                this.updateAttachmentTooltip();
            }, 100);
        }
    }

    // Update the attachment button tooltip and appearance
    updateAttachmentTooltip() {
        const btn = document.getElementById("attachDocsBtn");
        const countBadge = document.getElementById("attachDocsCount");

        if (!btn) {
            console.debug("Attach button not found in DOM");
            return;
        }

        // Dispose of any existing tooltip to avoid stale data
        const existingTooltip = bootstrap.Tooltip.getInstance(btn);
        if (existingTooltip) {
            existingTooltip.dispose();
        }

        // Create fresh tooltip instance
        const tooltipInstance = new bootstrap.Tooltip(btn, {
            html: true,
            placement: "bottom",
            trigger: "hover"
        });

        if (this.sharedDocumentation && this.sharedDocumentation.length > 0) {
            // Format file list for tooltip
            const fileList = this.sharedDocumentation.map(doc => {
                const sizeKB = (doc.size / 1024).toFixed(1);
                return `• ${doc.name} (${sizeKB} KB)`;
            }).join("<br>");

            const tooltipContent = `<strong>Attached Documentation:</strong><br>${fileList}<br><br><small><em>Shift+Click or Right-Click to clear</em></small>`;

            // Update tooltip content
            tooltipInstance.setContent({ ".tooltip-inner": tooltipContent });

            // Update button appearance
            btn.classList.remove("btn-outline-secondary");
            btn.classList.add("btn-outline-primary");

            // Show file count badge
            if (countBadge) {
                countBadge.textContent = this.sharedDocumentation.length;
                countBadge.style.display = "inline-block";
            }
        } else {
            // No files attached
            tooltipInstance.setContent({ ".tooltip-inner": "No documentation attached" });

            // Reset button appearance
            btn.classList.remove("btn-outline-primary");
            btn.classList.add("btn-outline-secondary");

            // Hide file count badge
            if (countBadge) {
                countBadge.style.display = "none";
            }
        }
    }

    // Template processing helper functions

    /**
     * Fetch template content from database by name
     * @description Retrieves template content from the database API endpoint
     * @param {string} templateName - Name of the template to fetch (e.g., 'default_email', 'default_ticket', 'default_vulnerability')
     * @returns {Promise<string|null>} Template content string or null if not found/error
     * @throws {Error} Network or API errors during template fetch
     * @example
     * const template = await this.fetchTemplateFromDB('default_email');
     * if (template) {
     *   // Process template
     * }
     * @since 1.0.21
     * @module TicketsManager
     */
    async fetchTemplateFromDB(templateName) {
        try {
            const response = await authState.authenticatedFetch(`/api/templates/by-name/${templateName}`);
            if (!response.ok) {
                console.warn(`Template ${templateName} not found in database, using fallback`);
                return null;
            }
            const result = await response.json();
            if (result.success && result.data) {
                return result.data.template_content;
            }
            return null;
        } catch (error) {
            console.error(`Error fetching template ${templateName}:`, error);
            return null;
        }
    }

    /**
     * Build variable mapping for template substitution
     * @description Creates a key-value map of template variables and their actual values for substitution
     * @param {Object} ticket - Ticket object containing all ticket data
     * @param {Array|string|null} vulnerabilitiesOrType - Either vulnerability array, template type ('email', 'ticket', 'vulnerability'), or null
     * @returns {Object} Object mapping template variables to actual values
     * @example
     * const variables = this.buildVariableMap(ticket, 'email');
     * // Returns: { '[SITE_NAME]': 'Example Site', '[HEXAGON_NUM]': 'HEX123', ... }
     * @since 1.0.21
     * @module TicketsManager
     */
    buildVariableMap(ticket, vulnerabilitiesOrType = null) {
        const deviceCount = ticket.devices ? ticket.devices.length : 0;
        const deviceList = ticket.devices && ticket.devices.length > 0
            ? ticket.devices.map((device, index) => `${index + 1}. ${device}`).join("\n")
            : "Device list to be confirmed";

        const variables = {
            "[HEXAGON_TICKET]": ticket.hexagonTicket || "N/A",
            "[HEXAGON_NUM]": ticket.hexagonTicket || "N/A",
            "[SERVICENOW_TICKET]": ticket.serviceNowTicket || "N/A",
            "[SERVICENOW_NUM]": ticket.serviceNowTicket || "N/A",
            "[XT_NUMBER]": ticket.xt_number || `XT#${ticket.id}`,
            "[SITE]": ticket.site || "N/A",
            "[SITE_NAME]": ticket.site || "N/A",
            "[LOCATION]": ticket.location || "N/A",
            "[STATUS]": ticket.status || "N/A",
            "[DATE_SUBMITTED]": this.formatDate(ticket.dateSubmitted),
            "[DATE_DUE]": this.formatDate(ticket.dateDue),
            "[DEVICE_COUNT]": deviceCount.toString(),
            "[DEVICE_LIST]": deviceList,
            "[SUPERVISOR]": ticket.supervisor || "N/A",
            "[TECHNICIAN]": ticket.technician || "N/A",
            "[NOTES]": ticket.notes || "N/A",
            "[GENERATED_TIME]": new Date().toLocaleString(),
            "[GREETING]": this.getSupervisorGreeting(ticket.supervisor)
        };

        // Handle vulnerabilities array (backward compatibility)
        if (vulnerabilitiesOrType && Array.isArray(vulnerabilitiesOrType)) {
            const vulnerabilities = vulnerabilitiesOrType;
            const severityCounts = { CRITICAL: 0, HIGH: 0, MEDIUM: 0, LOW: 0 };
            vulnerabilities.forEach(v => {
                const sev = (v.severity || "LOW").toUpperCase();
                if (severityCounts[sev] !== undefined) {
                    severityCounts[sev]++;
                }
            });

            variables["[TOTAL_VULNERABILITIES]"] = vulnerabilities.length.toString();
            variables["[CRITICAL_COUNT]"] = severityCounts.CRITICAL.toString();
            variables["[HIGH_COUNT]"] = severityCounts.HIGH.toString();
            variables["[MEDIUM_COUNT]"] = severityCounts.MEDIUM.toString();
            variables["[LOW_COUNT]"] = severityCounts.LOW.toString();
            variables["[DEVICE_COUNT]"] = Object.keys(this.groupVulnerabilitiesByDevice(vulnerabilities)).length.toString();
            variables["[VULNERABILITY_DETAILS]"] = this.buildVulnerabilityDetails(vulnerabilities);
        }

        // Add template-specific variables
        if (vulnerabilitiesOrType === "email") {
            // Email-specific variables can be added here if needed
            // Currently using common variables which should work for email templates
        } else if (vulnerabilitiesOrType === "ticket") {
            // Ticket-specific variables can be added here if needed
        } else if (vulnerabilitiesOrType === "vulnerability") {
            // Vulnerability-specific variables can be added here if needed
        }

        return variables;
    }

    groupVulnerabilitiesByDevice(vulnerabilities) {
        const vulnsByDevice = {};
        vulnerabilities.forEach(vuln => {
            const hostname = vuln.hostname || "Unknown Device";
            if (!vulnsByDevice[hostname]) {
                vulnsByDevice[hostname] = [];
            }
            vulnsByDevice[hostname].push(vuln);
        });
        return vulnsByDevice;
    }

    buildVulnerabilityDetails(vulnerabilities) {
        const vulnsByDevice = this.groupVulnerabilitiesByDevice(vulnerabilities);
        let details = "";

        Object.keys(vulnsByDevice).sort().forEach(hostname => {
            const deviceVulns = vulnsByDevice[hostname];
            details += `### Device: ${hostname}\n`;
            details += `Total Vulnerabilities: ${deviceVulns.length}\n\n`;

            // Sort by VPR score (highest to lowest)
            deviceVulns.sort((a, b) => (b.vpr_score || 0) - (a.vpr_score || 0));

            details += "| CVE | Severity | VPR | Description |\n";
            details += "|-----|----------|-----|-------------|\n";

            deviceVulns.slice(0, 10).forEach(vuln => { // Limit to top 10 per device
                const cve = vuln.cve || "N/A";
                const severity = vuln.severity || "Unknown";
                const vpr = vuln.vpr_score || "N/A";
                const desc = (vuln.description || "No description").substring(0, 50) + "...";
                details += `| ${cve} | ${severity} | ${vpr} | ${desc} |\n`;
            });

            details += "\n";
        });

        return details;
    }

    /**
     * Process template by substituting variables with actual values
     * @description Replaces template variables (e.g., [SITE_NAME]) with actual values from variable map
     * @param {string} template - Template content with variable placeholders
     * @param {Object} variables - Object mapping variable names to values
     * @returns {string} Processed template with variables substituted
     * @example
     * const result = this.processTemplateWithVariables(
     *   'Hello [GREETING] at [SITE_NAME]',
     *   { '[GREETING]': 'John', '[SITE_NAME]': 'Main Office' }
     * );
     * // Returns: 'Hello John at Main Office'
     * @since 1.0.21
     * @module TicketsManager
     */
    processTemplateWithVariables(template, variables) {
        let processedTemplate = template;

        // Replace all variables in the template
        Object.keys(variables).forEach(variable => {
            // Defense-in-depth: Length validation for variable names
            if (variable.length > 50) {
                console.warn("[Security] Variable name too long, skipping:", variable.substring(0, 20) + "...");
                return; // Skip this variable
            }

            const value = variables[variable] || "";
            // Use global replace to handle multiple occurrences
            processedTemplate = processedTemplate.replace(new RegExp(variable.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g"), value);
        });

        return processedTemplate;
    }

    // View ticket in markdown format
    // Generate markdown format for ticket using database template
    async generateMarkdown(ticket) {
        try {
            // Determine template variant based on job type
            const variant = this.getTemplateVariant(ticket.jobType || ticket.job_type);
            const templateName = `markdown_${variant}`;

            // Try to fetch template from database
            const template = await this.fetchTemplateFromDB(templateName);

            if (template) {
                // Use template system
                const variables = this.buildVariableMap(ticket, "ticket");
                return this.processTemplateWithVariables(template, variables);
            }
        } catch (error) {
            console.error("Error using ticket template:", error);
        }

        // Fallback to hardcoded template if database fails
        let markdown = "# Hexagon Work Request\n\n";

        markdown += "**Ticket Information:**\n";
        markdown += `- Hexagon Ticket #: ${ticket.hexagonTicket || "N/A"}\n`;
        markdown += `- ServiceNow Ticket #: ${ticket.serviceNowTicket || "N/A"}\n`;
        markdown += `- Site: ${ticket.site || "N/A"}\n`;
        markdown += `- Location: ${ticket.location || "N/A"}\n`;
        markdown += `- Status: ${ticket.status || "N/A"}\n\n`;

        markdown += "**Timeline:**\n";
        markdown += `- Date Submitted: ${this.formatDate(ticket.dateSubmitted)}\n`;
        markdown += `- Required Completion Date: ${this.formatDate(ticket.dateDue)}\n\n`;

        markdown += "**Task Instruction:**\n";
        markdown += `There are critical security patches that must be applied within 30 days at the [${ticket.site || "SITE NAME"}] site.\n`;
        markdown += "Please schedule a maintenance outage of at least two hours and contact the ITCC @\n";
        markdown += `918-732-4822 with service now ticket number [${ticket.serviceNowTicket || "SERVICE NOW TICKET"}] to coordinate Netops to apply security\n`;
        markdown += "updates and reboot the equipment.\n\n";

        if (ticket.devices && ticket.devices.length > 0) {
            markdown += "**Devices to be Updated:**\n";
            markdown += "The following devices will be updated and rebooted:\n\n";
            ticket.devices.forEach((device, index) => {
                markdown += `${index + 1}. ${device}\n`;
            });
            markdown += "\n";
        }

        markdown += "**Personnel:**\n";
        markdown += `- Supervisor: ${ticket.supervisor || "N/A"}\n`;
        markdown += `- Technician: ${ticket.tech || "N/A"}\n\n`;

        if (ticket.notes && ticket.notes.trim()) {
            markdown += `**Additional Notes:**\n${ticket.notes}\n\n`;
        }

        markdown += "---\n";
        markdown += `Generated: ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}\n`;

        return markdown;
    }

    // Generate vulnerability summary for email
    generateVulnerabilitySummaryForEmail(ticket, vulnerabilities) {
        if (!ticket.devices || ticket.devices.length === 0) {
            return "";
        }

        let summary = "**VULNERABILITY SUMMARY:**\n\n";

        // Group vulnerabilities by device
        const deviceVulnMap = {};

        // Initialize all devices with 0 counts
        ticket.devices.forEach(device => {
            deviceVulnMap[device.toUpperCase()] = {
                critical: 0,
                high: 0,
                medium: 0,
                low: 0,
                total: 0
            };
        });

        // Count vulnerabilities per device
        vulnerabilities.forEach(vuln => {
            const matchedDevice = ticket.devices.find(device =>
                this.hostnameMatches(vuln.hostname, device)
            );

            if (matchedDevice) {
                const key = matchedDevice.toUpperCase();
                if (deviceVulnMap[key]) {
                    const severity = vuln.severity?.toLowerCase() || "low";
                    if (deviceVulnMap[key][severity] !== undefined) {
                        deviceVulnMap[key][severity]++;
                    }
                    deviceVulnMap[key].total++;
                }
            }
        });

        // Generate summary lines
        ticket.devices.forEach(device => {
            const key = device.toUpperCase();
            const counts = deviceVulnMap[key];

            if (counts.total === 0) {
                summary += `${device}: No vulnerabilities found\n`;
            } else {
                summary += `${device}: ${counts.total} total vulnerabilities`;

                // Add severity breakdown if there are vulnerabilities
                const severityBreakdown = [];
                if (counts.critical > 0) {severityBreakdown.push(`${counts.critical} critical`);}
                if (counts.high > 0) {severityBreakdown.push(`${counts.high} high`);}
                if (counts.medium > 0) {severityBreakdown.push(`${counts.medium} medium`);}
                if (counts.low > 0) {severityBreakdown.push(`${counts.low} low`);}

                if (severityBreakdown.length > 0) {
                    summary += ` (${severityBreakdown.join(", ")})`;
                }
                summary += "\n";
            }
        });

        return summary;
    }

    // Helper function to extract first name from supervisor field
    getSupervisorGreeting(supervisorField) {
        if (!supervisorField || supervisorField === "N/A") {
            return "[Supervisor First Name]";
        }

        const trimmed = supervisorField.trim();

        // Check for multiple supervisors (semicolon, ampersand, or multiple commas)
        const commaCount = (trimmed.match(/,/g) || []).length;
        if (trimmed.includes(";") || trimmed.includes("&") || commaCount > 1) {
            return "Team";
        }

        // Handle "Last, First" format (single comma)
        if (commaCount === 1) {
            const parts = trimmed.split(",");
            if (parts.length >= 2) {
                const firstName = parts[1].trim().split(" ")[0];
                if (firstName) {return firstName;}
            }
        }

        // Handle "First Last" or "First Middle Last" format
        const parts = trimmed.split(" ");
        if (parts.length > 0 && parts[0]) {
            return parts[0];
        }

        return trimmed;
    }

    /**
     * Get template variant name based on job type
     * @description Maps job types to template variant names for dynamic template selection
     * @param {string} jobType - Job type value (Upgrade, Replace, Refresh, Mitigate, Other)
     * @returns {string} Template variant name ('upgrade', 'replacement', or 'mitigate')
     * @example
     * const variant = this.getTemplateVariant('Replace');  // Returns 'replacement'
     * const templateName = `email_${variant}`;  // 'email_replacement'
     * @since 1.0.57
     * @module TicketsManager
     */
    getTemplateVariant(jobType) {
        if (!jobType) {
            return 'upgrade';  // Default fallback
        }

        switch (jobType.toLowerCase()) {
            case 'replace':
            case 'refresh':
                return 'replacement';  // Both use same template (equipment swap workflow)
            case 'mitigate':
                return 'mitigate';     // KEV emergency patching
            case 'upgrade':
            case 'other':
            default:
                return 'upgrade';      // Default for Upgrade and Other job types
        }
    }

    // Generate email template markdown for ticket
    async generateEmailMarkdown(ticket) {
        try {
            // Determine template variant based on job type
            const variant = this.getTemplateVariant(ticket.jobType || ticket.job_type);
            const templateName = `email_${variant}`;

            // Try to fetch template from database first
            const template = await this.fetchTemplateFromDB(templateName);

            if (template) {
                // Use database template with variable substitution
                const variableMap = this.buildVariableMap(ticket, "email");
                return this.processTemplateWithVariables(template, variableMap);
            } else {
                console.warn("Email template not found in database, using fallback");
                // Fallback to hardcoded template
                return this.generateEmailMarkdownFallback(ticket);
            }
        } catch (error) {
            console.error("Error generating email markdown from template:", error);
            // Use fallback on any error
            return this.generateEmailMarkdownFallback(ticket);
        }
    }

    // Fallback email markdown generation (original hardcoded version)
    generateEmailMarkdownFallback(ticket) {
        const siteName = ticket.site || "[Site Name]";
        const location = ticket.location || "[Location]";
        const hexagonNum = ticket.hexagonTicket || "[Hexagon #]";
        const serviceNowNum = ticket.serviceNowTicket || "[ServiceNow #]";
        const xtNumber = ticket.xt_number || `XT#${ticket.id}`;
        const deviceCount = ticket.devices ? ticket.devices.length : 0;
        const dateDue = this.formatDate(ticket.dateDue);
        const dateSubmitted = this.formatDate(ticket.dateSubmitted);

        // Get appropriate greeting
        const greeting = this.getSupervisorGreeting(ticket.supervisor);

        // Build email
        let email = `Subject: Hexagon Work Order - ${siteName} - ${hexagonNum}\n\n`;

        email += `Hello ${greeting},\n\n`;

        email += `We have submitted a Hexagon work order (${hexagonNum}) for the ${siteName} site.\n\n`;

        email += "There are critical security patches that must be applied within 30 days.\n\n";

        email += "Please see the attached notes for more information. If you have any questions or concerns please feel free to reach out to NetOps at netops@oneok.com.\n\n";

        email += "**MAINTENANCE DETAILS:**\n";
        email += `• Location: ${siteName} - ${location}\n`;
        email += `• Hexagon Ticket: ${hexagonNum}\n`;
        email += `• ServiceNow Reference: ${serviceNowNum}\n`;
        email += `• Required Completion: ${dateDue}\n\n`;

        email += "**AFFECTED SYSTEMS:**\n";
        if (deviceCount > 0) {
            email += `${deviceCount} device${deviceCount > 1 ? "s" : ""} require security patches and will need to be rebooted:\n`;
            ticket.devices.forEach((device, index) => {
                email += `${index + 1}. ${device}\n`;
            });
            email += "\n";
        } else {
            email += "Device list to be confirmed\n\n";
        }

        email += "**ACTION REQUIRED:**\n";
        email += "• Schedule a maintenance window of at least 2 hours\n";
        email += `• Contact ITCC at 918-732-4822 with ServiceNow ticket ${serviceNowNum}\n`;
        email += "• Coordinate with NetOps for patch application\n\n";

        email += "**TIMELINE:**\n";
        email += `• Request Submitted: ${dateSubmitted}\n`;
        email += `• Required Completion: ${dateDue}\n`;
        email += "• Maintenance Window: To be scheduled\n\n";

        // Note: Vulnerability summary will be added by loadEmailMarkdownForModal

        email += "Please confirm receipt and provide your proposed maintenance window.\n\n";

        email += "---\n";
        email += "Generated by HexTrackr v1.0.20\n";
        email += `Ticket ID: ${xtNumber}\n`;

        return email;
    }

    // Copy ticket markdown to clipboard
    copyTicketMarkdown() {
        const content = document.getElementById("markdownContent").textContent;
        navigator.clipboard.writeText(content).then(() => {
            this.showToast("Ticket markdown copied to clipboard!", "success");
        }).catch(err => {
            console.error("Failed to copy ticket markdown:", err);
            this.showToast("Failed to copy ticket markdown", "error");
        });
    }

    // Copy vulnerability markdown to clipboard
    async copyVulnerabilityMarkdown() {
        // First ensure we have the vulnerability markdown loaded
        const vulnContent = document.getElementById("vulnerabilityMarkdownContent");

        if (!vulnContent || !vulnContent.textContent || vulnContent.textContent.trim() === "") {
            // If not loaded, generate it first
            await this.loadVulnerabilityMarkdownForModal();
        }

        const content = document.getElementById("vulnerabilityMarkdownContent").textContent;

        if (!content || content.trim() === "") {
            this.showToast("No vulnerability data available for this ticket", "warning");
            return;
        }

        navigator.clipboard.writeText(content).then(() => {
            this.showToast("Vulnerability report copied to clipboard!", "success");
        }).catch(err => {
            console.error("Failed to copy vulnerability markdown:", err);
            this.showToast("Failed to copy vulnerability report", "error");
        });
    }

    // Copy email markdown to clipboard
    async copyEmailMarkdown() {
        // First ensure we have the email markdown loaded
        const emailContent = document.getElementById("emailMarkdownContent");

        if (!emailContent || !emailContent.textContent || emailContent.textContent.trim() === "") {
            // If not loaded, generate it first
            await this.loadEmailMarkdownForModal();
        }

        const content = document.getElementById("emailMarkdownContent").textContent;

        if (!content || content.trim() === "") {
            this.showToast("No email template available for this ticket", "warning");
            return;
        }

        navigator.clipboard.writeText(content).then(() => {
            this.showToast("Email template copied to clipboard!", "success");
        }).catch(err => {
            console.error("Failed to copy email markdown:", err);
            this.showToast("Failed to copy email template", "error");
        });
    }

    // Load email markdown for modal display
    async loadEmailMarkdownForModal() {
        const ticketId = document.getElementById("viewTicketModal").getAttribute("data-ticket-id");
        const ticket = this.getTicketById(ticketId);

        if (!ticket) {
            console.error("[EmailTemplate] Ticket not found:", ticketId);
            document.getElementById("emailMarkdownContent").textContent = "# Error Loading Email Template\n\nTicket not found.";
            document.getElementById("emailMarkdownContent").style.display = "block";
            document.getElementById("emailLoadingMessage").style.display = "none";
            return;
        }

        try {
            // Generate the base email markdown
            let emailMarkdown = await this.generateEmailMarkdown(ticket);

            let summaryBlock = "";

            if (ticket.devices && ticket.devices.length > 0) {
                document.getElementById("emailLoadingMessage").textContent = "Generating email template with vulnerability summary...";

                try {
                    const vulnerabilities = await this.fetchVulnerabilitiesForDevices(ticket.devices);

                    if (vulnerabilities && vulnerabilities.length > 0) {
                        summaryBlock = this.generateVulnerabilitySummaryForEmail(ticket, vulnerabilities || []);
                    }
                } catch (vulnError) {
                    console.error("[EmailTemplate] Error fetching vulnerabilities:", vulnError);
                    summaryBlock = "**VULNERABILITY SUMMARY:**\n\nUnable to fetch vulnerability data.";
                }
            }

            const summaryReplacement = summaryBlock && summaryBlock.trim() ? `${summaryBlock.trim()}\n\n` : "";

            if (emailMarkdown.includes("[VULNERABILITY_SUMMARY]")) {
                emailMarkdown = emailMarkdown.replace(/\[VULNERABILITY_SUMMARY\]/g, summaryReplacement);
            } else if (summaryReplacement) {
                const confirmReceiptIndex = emailMarkdown.indexOf("\nPlease confirm receipt");
                if (confirmReceiptIndex > -1) {
                    const beforeConfirm = emailMarkdown.substring(0, confirmReceiptIndex);
                    const afterConfirm = emailMarkdown.substring(confirmReceiptIndex);
                    emailMarkdown = `${beforeConfirm}${summaryReplacement}${afterConfirm}`;
                } else {
                    emailMarkdown = `${emailMarkdown}\n\n${summaryReplacement}`;
                }
            }

            // Display the complete email markdown
            document.getElementById("emailMarkdownContent").textContent = emailMarkdown;
            document.getElementById("emailMarkdownContent").style.display = "block";
            document.getElementById("emailLoadingMessage").style.display = "none";

            console.log("[EmailTemplate] Email template generated for ticket:", ticketId);
        } catch (error) {
            console.error("[EmailTemplate] Error generating email template:", error);
            document.getElementById("emailMarkdownContent").textContent = "# Error Loading Email Template\n\nFailed to generate email template. Please try again.";
            document.getElementById("emailMarkdownContent").style.display = "block";
            document.getElementById("emailLoadingMessage").style.display = "none";
        }
    }

    // Backwards compatibility
    copyMarkdownToClipboard() {
        // Redirect to the new method for backward compatibility
        this.copyTicketMarkdown();
    }

    // Download bundle from view modal
    downloadBundleFromView() {
        // Get the ticket ID from the modal's data attribute
        const modal = document.getElementById("viewTicketModal");
        const ticketId = modal?.dataset.ticketId;
        
        if (!ticketId) {
            this.showToast("No ticket selected for download", "error");
            return;
        }
        
        this.bundleTicketFiles(ticketId);
    }

    // Handle CSV import
    async handleCsvImport(file) {
        if (!file) {return;}

        if (!file.name.toLowerCase().endsWith(".csv")) {
            this.showToast("Please select a CSV file", "error");
            return;
        }

        try {
            const text = await file.text();
            const tickets = await this.parseCsvToTickets(text);
            
            if (tickets.length === 0) {
                this.showToast("No valid tickets found in CSV file", "warning");
                return;
            }

            // Check if database has existing data
            const statsResponse = await authState.authenticatedFetch("/api/backup/stats");
            const stats = await statsResponse.json();
            
            let mode = "check";
            
            if (stats.tickets > 0) {
                // Show import mode selection modal
                mode = await this.showImportModeModal(stats.tickets, tickets.length);
                if (!mode) {
                    // User cancelled
                    return;
                }
            }

            // Use the migration API to import tickets to database
            const response = await authState.authenticatedFetch("/api/tickets/migrate", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ tickets, mode })
            });

            if (response.ok) {
                await response.json(); // Parse response (not used)
                // Reload tickets from database to refresh local array
                await this.loadTicketsFromDB();
                this.renderTickets();
                this.updateStatistics();
                this.populateLocationFilter();
                
                this.showToast(`Successfully imported ${tickets.length} ticket(s)!`, "success");
            } else {
                const error = await response.json();
                throw new Error(error.error || "Failed to import tickets");
            }
        } catch (error) {
            console.error("Error importing CSV:", error);
            this.showToast("Error importing CSV file: " + error.message, "error");
        }
    }

    // Show import mode selection modal
    async showImportModeModal(existingCount, newCount) {
        return new Promise((resolve) => {
            const modal = document.createElement("div");
            modal.className = "modal fade";
            modal.innerHTML = `
                <div class="modal-dialog modal-dialog-centered">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">
                                <i class="fas fa-exclamation-triangle text-warning"></i>
                                Import Mode Selection
                            </h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <div class="alert alert-info">
                                <strong>Existing Data Detected</strong><br>
                                Database contains: <strong>${existingCount}</strong> tickets<br>
                                Importing: <strong>${newCount}</strong> new tickets
                            </div>
                            <p>How would you like to proceed?</p>
                            <div class="d-grid gap-2">
                                <button type="button" class="btn btn-danger" data-mode="replace">
                                    <i class="fas fa-trash-restore"></i>
                                    Replace All Data
                                    <small class="d-block text-light">Clear existing tickets and import new ones</small>
                                </button>
                                <button type="button" class="btn btn-primary" data-mode="append">
                                    <i class="fas fa-plus"></i>
                                    Add to Existing Data
                                    <small class="d-block text-light">Keep existing tickets and add new ones</small>
                                </button>
                                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
                                    <i class="fas fa-times"></i>
                                    Cancel Import
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            
            document.body.appendChild(modal);
            const bsModal = new bootstrap.Modal(modal);
            
            // Handle mode selection
            modal.addEventListener("click", (e) => {
                if (e.target.dataset.mode) {
                    bsModal.hide();
                    resolve(e.target.dataset.mode);
                }
            });
            
            // Handle modal close without selection
            modal.addEventListener("hidden.bs.modal", () => {
                document.body.removeChild(modal);
                resolve(null);
            });
            
            bsModal.show();
        });
    }

    // Parse CSV text to tickets array
    async parseCsvToTickets(csvText) {
        const lines = csvText.split("\n").filter(line => line.trim());
        if (lines.length < 2) {return [];}

        const headers = lines[0].split(",").map(h => h.trim().replace(/"/g, ""));
        const tickets = [];

        let nextImportNumber = parseInt(await this.generateNextXtNumber(), 10);
        if (isNaN(nextImportNumber)) {
            nextImportNumber = this.tickets.length + 1;
        }

        for (let i = 1; i < lines.length; i++) {
            const values = this.parseCsvLine(lines[i]);
            if (values.length === headers.length) {
                const ticket = {};
                
                headers.forEach((header, index) => {
                    const value = values[index].trim().replace(/"/g, "");
                    
                    // Map CSV headers to ticket properties
                    switch (header.toLowerCase()) {
                        case "date submitted":
                        case "datesubmitted":
                        case "date_submitted":  // Support snake_case from export
                            ticket.dateSubmitted = value;
                            break;
                        case "date due":
                        case "datedue":
                        case "date_due":  // Support snake_case from export
                            ticket.dateDue = value;
                            break;
                        case "hexagon ticket":
                        case "hexagon ticket #":
                        case "hexagonticket":
                        case "hexagon_ticket":  // Support snake_case from export
                            ticket.hexagonTicket = value;
                            break;
                        case "service now #":
                        case "servicenow ticket":
                        case "servicenow ticket #":
                        case "servicenowticket":
                        case "service_now_ticket":  // Support snake_case from export
                            ticket.serviceNowTicket = value;
                            break;
                        case "site":
                            ticket.site = value;
                            break;
                        case "location":
                        case "site/group":
                            ticket.location = value;
                            break;
                        case "devices":
                            // Handle both JSON array format and semicolon-separated format
                            if (value.startsWith("[") && value.endsWith("]")) {
                                try {
                                    ticket.devices = JSON.parse(value);
                                } catch (_e) {
                                    ticket.devices = value ? value.split(";").map(d => d.trim()).filter(d => d) : [];
                                }
                            } else {
                                ticket.devices = value ? value.split(";").map(d => d.trim()).filter(d => d) : [];
                            }
                            break;
                        case "supervisor":
                            ticket.supervisor = value;
                            break;
                        case "tech":
                        case "technician":
                            ticket.tech = value;
                            break;
                        case "status":
                            ticket.status = value;
                            break;
                        case "notes":
                            ticket.notes = value;
                            break;
                        case "xt#":
                        case "xt":
                        case "xtnumber":
                        case "xt_number":  // Support snake_case from export
                            ticket.xtNumber = this.normalizeXtNumber(value);
                            break;
                        case "id":  // Pass through ID from export if present
                            ticket.existingId = value;
                            break;
                        case "created_at":  // Pass through timestamps from export
                            ticket.createdAt = value;
                            break;
                        case "updated_at":
                            ticket.updatedAt = value;
                            break;
                    }
                });

                // Set defaults for missing fields
                ticket.dateSubmitted = ticket.dateSubmitted || new Date().toISOString().split("T")[0];
                ticket.dateDue = ticket.dateDue || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
                ticket.hexagonTicket = ticket.hexagonTicket || "";
                ticket.serviceNowTicket = ticket.serviceNowTicket || "";
                ticket.site = ticket.site || "";
                ticket.location = ticket.location || "";
                ticket.devices = ticket.devices || [];
                ticket.supervisor = ticket.supervisor || "";
                ticket.tech = ticket.tech || "";
                ticket.status = ticket.status || "Open";
                ticket.notes = ticket.notes || "";

                ticket.xtNumber = ticket.xtNumber || String(nextImportNumber).padStart(4, "0");
                ticket.xt_number = ticket.xtNumber;

                // Use existing ID from export if available, otherwise generate new one
                if (ticket.existingId) {
                    ticket.id = ticket.existingId;
                    delete ticket.existingId;
                } else {
                    // Generate ID using cryptographically secure random
                    const randomBytes = new Uint8Array(9);
                    window.crypto.getRandomValues(randomBytes);
                    const randomString = Array.from(randomBytes, byte => byte.toString(36).padStart(2, "0")).join("").substr(0, 9);
                    ticket.id = Date.now().toString() + randomString;
                }

                // Use existing timestamps if available
                ticket.createdAt = ticket.createdAt || new Date().toISOString();
                ticket.updatedAt = ticket.updatedAt || new Date().toISOString();

                // Only require location (consistent with form validation)
                if (ticket.location && ticket.location.trim()) {
                    tickets.push(ticket);
                    nextImportNumber += 1;
                } else {
                    console.log("Skipping ticket with missing location:", ticket);
                }
            }
        }

        return tickets;
    }

    // Parse CSV line handling quoted values
    parseCsvLine(line) {
        const values = [];
        let current = "";
        let inQuotes = false;
        
        for (let i = 0; i < line.length; i++) {
            const char = line[i];
            
            if (char === "\"") {
                inQuotes = !inQuotes;
            } else if (char === "," && !inQuotes) {
                values.push(current);
                current = "";
            } else {
                current += char;
            }
        }
        
        values.push(current);
        return values;
    }

    // Table sorting functionality
    sortTable(column) {
        // Update sort direction
        if (this.sortColumn === column) {
            this.sortDirection = this.sortDirection === "asc" ? "desc" : "asc";
        } else {
            this.sortColumn = column;
            this.sortDirection = "asc";
        }

        // Update header visual indicators
        this.updateSortHeaders();

        // Sort the tickets array
        this.tickets.sort((a, b) => {
            let valueA = a[column] || "";
            let valueB = b[column] || "";

            // Handle date columns
            if (column === "dateSubmitted" || column === "dateDue") {
                valueA = new Date(valueA);
                valueB = new Date(valueB);
            } else if (typeof valueA === "string") {
                valueA = valueA.toLowerCase();
                valueB = valueB.toLowerCase();
            }

            let comparison = 0;
            if (valueA > valueB) {
                comparison = 1;
            } else if (valueA < valueB) {
                comparison = -1;
            }

            return this.sortDirection === "desc" ? comparison * -1 : comparison;
        });

        // Re-render the table
        this.renderTickets();
    }

    updateSortHeaders() {
        // Remove all sort classes
        document.querySelectorAll(".sortable-header").forEach(header => {
            header.classList.remove("sort-asc", "sort-desc");
        });

        // Add appropriate class to current sort column
        if (this.sortColumn) {
            const header = document.querySelector(`[data-column="${this.sortColumn}"]`);
            if (header) {
                header.classList.add(this.sortDirection === "asc" ? "sort-asc" : "sort-desc");
            }
        }
    }
}

// Global functions for button onclick events
// Explicitly assign to window object to ensure global scope
window.ticketManager = null; // Will be initialized on DOMContentLoaded

window.saveTicket = function() {
    if (window.ticketManager) {window.ticketManager.saveTicket();}
};

window.editTicketFromView = function() {
    if (window.ticketManager) {window.ticketManager.editTicketFromView();}
};

window.copyMarkdownToClipboard = function() {
    if (window.ticketManager) {window.ticketManager.copyMarkdownToClipboard();}
};

window.downloadBundleFromView = function() {
    if (window.ticketManager) {window.ticketManager.downloadBundleFromView();}
};

window.exportData = function(format) {
    if (window.ticketManager) {window.ticketManager.exportData(format);}
};

window.sortTable = function(column) {
    if (window.ticketManager) {window.ticketManager.sortTable(column);}
};

// Page-specific refresh function for Settings modal integration
window.refreshPageData = function(type) {
    if (type === "tickets" && window.ticketManager) {
        window.ticketManager.loadTicketsFromDB();
        window.ticketManager.renderTickets();
        window.ticketManager.updateStatistics();
        window.ticketManager.populateLocationFilter();
    } else if (type === "serviceNow" && window.ticketManager) {
        // Refresh ticket display to apply ServiceNow link changes
        window.ticketManager.renderTickets();
    }
};

// Page-specific toast integration for Settings modal
window.showToast = function(message, type) {
    if (window.ticketManager) {
        window.ticketManager.showToast(message, type);
    }
};

// Initialize the application
document.addEventListener("DOMContentLoaded", function() {
    // Initialize the ticket manager and explicitly set it as a global variable
    window.ticketManager = new HexagonTicketsManager();

    // Check if we're coming from vulnerability page with a device to create a ticket for
    const autoOpen = sessionStorage.getItem("autoOpenModal");
    const ticketDataRaw = sessionStorage.getItem("createTicketData");  // NEW: JSON format
    const deviceHostname = sessionStorage.getItem("createTicketDevice"); // OLD: String format (kept for backward compat)

    if (autoOpen === "true") {
        // Clear flags immediately
        sessionStorage.removeItem("autoOpenModal");
        sessionStorage.removeItem("createTicketData");   // NEW
        sessionStorage.removeItem("createTicketDevice"); // EXISTING

        // Attempt to parse JSON format first
        let ticketData = null;
        if (ticketDataRaw) {
            try {
                ticketData = JSON.parse(ticketDataRaw);
            } catch (e) {
                console.error("[Power Tool] Failed to parse createTicketData JSON:", e);
                ticketData = null;
            }
        }

        // If JSON parsing failed or no JSON, fall back to old format
        if (!ticketData && deviceHostname) {
            ticketData = {
                devices: [deviceHostname],
                site: deviceHostname.substring(0, 4),
                location: deviceHostname.substring(0, 5),
                mode: "single"
            };
        }

        // If we have no data at all, abort
        if (!ticketData) {
            return;
        }

        // Wait for everything to initialize, then open modal
        setTimeout(() => {
            const ticketModal = document.getElementById("ticketModal");
            if (ticketModal) {
                const modal = new bootstrap.Modal(ticketModal);
                modal.show();

                // Wait for modal to be fully shown
                ticketModal.addEventListener("shown.bs.modal", function onModalShown() {
                    ticketModal.removeEventListener("shown.bs.modal", onModalShown);

                    setTimeout(() => {
                        // --- NEW: Populate SITE field ---
                        const siteField = document.getElementById("site");
                        if (siteField && ticketData.site) {
                            siteField.value = ticketData.site;
                        }

                        // --- NEW: Populate Location field ---
                        const locationField = document.getElementById("location");
                        if (locationField && ticketData.location) {
                            locationField.value = ticketData.location;

                            // Set flag to disable location-to-device autofill (for Task 1.4)
                            locationField.dataset.powerToolPopulated = "true";
                        }

                        // --- ENHANCED: Populate multiple devices ---
                        const devices = ticketData.devices || [];
                        if (devices.length > 0) {
                            // Find first device input
                            const firstDeviceInput = document.querySelector("#devicesContainer .device-input");

                            if (firstDeviceInput) {
                                // Populate first device in existing field
                                firstDeviceInput.value = devices[0];

                                // Add remaining devices (if any)
                                for (let i = 1; i < devices.length; i++) {
                                    // Add new device field
                                    window.ticketManager.addDeviceField();

                                    // Use setTimeout to ensure field is fully created before populating
                                    ((deviceIndex) => {
                                        setTimeout(() => {
                                            const deviceInputs = document.querySelectorAll("#devicesContainer .device-input");
                                            if (deviceInputs[deviceIndex]) {
                                                deviceInputs[deviceIndex].value = devices[deviceIndex];
                                            }
                                        }, 50 * deviceIndex); // Stagger timeouts
                                    })(i);
                                }
                            }
                        }

                        // --- ENHANCED: Toast message with device count and mode ---
                        const deviceCount = devices.length;
                        const modeLabels = {
                            "single": "device",
                            "bulk-all": `devices at ${ticketData.location}`,
                            "bulk-kev": `KEV devices at ${ticketData.location}`
                        };
                        const modeLabel = modeLabels[ticketData.mode] || "device";

                        window.ticketManager.showToast(
                            `Ticket form pre-populated with ${deviceCount} ${modeLabel}`,
                            "info"
                        );
                    }, 100);
                }, { once: true });
            }
        }, 500);
    }
});
