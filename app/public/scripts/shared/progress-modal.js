/* eslint-env browser */
/* global bootstrap, console, document, window */

"use strict";

/**
 * HexTrackr - Real-Time Progress Modal Component
 * 
 * 🎯 SHARED COMPONENT PATTERN
 * 
 * This component provides real-time progress tracking for long-running operations
 * like CSV imports, data processing, and other background tasks. It integrates
 * with the existing WebSocket client for real-time updates and follows HexTrackr's
 * established modal patterns.
 * 
 * @file progress-modal.js
 * @description Real-time progress modal with WebSocket integration
 * @version 1.0.0
 * @author HexTrackr Development Team
 * @since 2025-01-07
 * 
 * Dependencies:
 * - Bootstrap 5 (modals, progress bars)
 * - Tabler.io CSS Framework
 * - WebSocket Client (scripts/shared/websocket-client.js)
 * 
 * @example
 * // Initialize and show progress modal
 * const progressModal = new ProgressModal(websocketClient);
 * progressModal.show({
 *   title: "Importing CSV Data",
 *   sessionId: "import_12345",
 *   allowCancel: true,
 *   onCancel: () => cancelImport()
 * });
 */

console.log("✅ HexTrackr Progress Modal (shared) loaded successfully");

/**
 * Real-time Progress Modal Class
 */
class ProgressModal {
    constructor(websocketClient) {
        this.websocketClient = websocketClient;
        this.modal = null;
        this.bsModal = null;
        this.currentSessionId = null;
        this.onCancelCallback = null;
        this.isVisible = false;
        this.animationFrameId = null;
        this.progressData = {
            progress: 0,
            message: "",
            stage: "",
            current: 0,
            total: 0,
            eta: null,
            error: null
        };
        
        // Bind methods to maintain context
        this.handleProgressUpdate = this.handleProgressUpdate.bind(this);
        this.handleProgressStatus = this.handleProgressStatus.bind(this);
        this.handleProgressComplete = this.handleProgressComplete.bind(this);
        this.handleWebSocketError = this.handleWebSocketError.bind(this);
        this.handleCancel = this.handleCancel.bind(this);
        this.handleClose = this.handleClose.bind(this);
        
        // Create modal HTML
        this.createModalHTML();
        
        // Setup WebSocket listeners
        if (this.websocketClient) {
            this.setupWebSocketListeners();
        }
    }
    
    /**
     * Create the modal HTML structure following HexTrackr patterns
     */
    createModalHTML() {
        const modalHTML = `
            <div class="modal fade" id="progressModal" tabindex="-1" aria-labelledby="progressModalLabel" aria-hidden="true" data-bs-backdrop="static" data-bs-keyboard="false">
                <div class="modal-dialog modal-dialog-centered">
                    <div class="modal-content">
                        <div class="modal-header bg-primary text-white">
                            <h5 class="modal-title d-flex align-items-center" id="progressModalLabel">
                                <div class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></div>
                                <span id="progressModalTitle">Processing...</span>
                            </h5>
                        </div>
                        <div class="modal-body">
                            <!-- Progress Bar -->
                            <div class="mb-3">
                                <div class="d-flex justify-content-between align-items-center mb-2">
                                    <small class="text-muted" id="progressStage">Initializing...</small>
                                    <small class="text-muted" id="progressPercentage">0%</small>
                                </div>
                                <div class="progress" style="height: 8px;">
                                    <div class="progress-bar progress-bar-striped progress-bar-animated" 
                                         role="progressbar" 
                                         id="progressBar"
                                         style="width: 0%"
                                         aria-valuenow="0" 
                                         aria-valuemin="0" 
                                         aria-valuemax="100">
                                    </div>
                                </div>
                            </div>
                            
                            <!-- Status Message -->
                            <div class="mb-3">
                                <div class="d-flex align-items-center">
                                    <i class="fas fa-info-circle text-primary me-2"></i>
                                    <span id="progressMessage" class="text-muted">Starting process...</span>
                                </div>
                            </div>
                            
                            <!-- Progress Details (Hidden for CSV imports as server doesn't provide current/total/eta) -->
                            <div class="row text-center d-none" id="progressDetails">
                                <div class="col-4">
                                    <div class="text-muted small">Current</div>
                                    <div class="fw-bold" id="progressCurrent">0</div>
                                </div>
                                <div class="col-4">
                                    <div class="text-muted small">Total</div>
                                    <div class="fw-bold" id="progressTotal">0</div>
                                </div>
                                <div class="col-4">
                                    <div class="text-muted small">ETA</div>
                                    <div class="fw-bold" id="progressETA">--</div>
                                </div>
                            </div>
                            
                            <!-- Error State (Hidden by default) -->
                            <div class="alert alert-danger d-none" id="progressError" role="alert">
                                <div class="d-flex align-items-center">
                                    <i class="fas fa-exclamation-triangle me-2"></i>
                                    <div>
                                        <strong>Error:</strong>
                                        <span id="progressErrorMessage">An error occurred during processing.</span>
                                    </div>
                                </div>
                            </div>
                            
                            <!-- Success State (Hidden by default) -->
                            <div class="alert alert-success d-none" id="progressSuccess" role="alert">
                                <div class="d-flex align-items-center">
                                    <i class="fas fa-check-circle me-2"></i>
                                    <div>
                                        <strong>Complete:</strong>
                                        <span id="progressSuccessMessage">Process completed successfully.</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-outline-secondary" id="progressCancelBtn">
                                <i class="fas fa-times me-1"></i>
                                Cancel
                            </button>
                            <button type="button" class="btn btn-primary d-none" id="progressCloseBtn">
                                <i class="fas fa-check me-1"></i>
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Insert modal into DOM
        let modalContainer = document.getElementById("progressModalContainer");
        if (!modalContainer) {
            modalContainer = document.createElement("div");
            modalContainer.id = "progressModalContainer";
            document.body.appendChild(modalContainer);
        }
        modalContainer.innerHTML = modalHTML;
        
        // Get modal elements
        this.modal = document.getElementById("progressModal");
        this.bsModal = new bootstrap.Modal(this.modal);
        
        // Setup event listeners
        this.setupEventListeners();
    }
    
    /**
     * Setup event listeners for modal interactions
     */
    setupEventListeners() {
        // Cancel button
        const cancelBtn = document.getElementById("progressCancelBtn");
        if (cancelBtn) {
            cancelBtn.addEventListener("click", this.handleCancel);
        }
        
        // Close button
        const closeBtn = document.getElementById("progressCloseBtn");
        if (closeBtn) {
            closeBtn.addEventListener("click", this.handleClose);
        }
        
        // Modal events
        this.modal.addEventListener("hidden.bs.modal", () => {
            this.cleanup();
        });
        
        // Prevent modal from being closed during active progress
        this.modal.addEventListener("hide.bs.modal", (event) => {
            if (this.isActiveProgress() && !this.progressData.error) {
                event.preventDefault();
                this.showCancelConfirmation();
            }
        });
    }
    
    /**
     * Setup WebSocket event listeners
     */
    setupWebSocketListeners() {
        this.websocketClient.on("progress", this.handleProgressUpdate);
        this.websocketClient.on("progressStatus", this.handleProgressStatus);
        this.websocketClient.on("progressComplete", this.handleProgressComplete);
        this.websocketClient.on("connectionFailed", this.handleWebSocketError);
        this.websocketClient.on("disconnect", this.handleWebSocketError);
    }
    
    /**
     * Remove WebSocket event listeners
     */
    removeWebSocketListeners() {
        if (this.websocketClient) {
            this.websocketClient.off("progress", this.handleProgressUpdate);
            this.websocketClient.off("progressStatus", this.handleProgressStatus);
            this.websocketClient.off("progressComplete", this.handleProgressComplete);
            this.websocketClient.off("connectionFailed", this.handleWebSocketError);
            this.websocketClient.off("disconnect", this.handleWebSocketError);
        }
    }
    
    /**
     * Show the progress modal
     * @param {Object} options - Configuration options
     * @param {string} options.title - Modal title
     * @param {string} options.sessionId - Session ID for WebSocket room
     * @param {boolean} options.allowCancel - Whether to show cancel button
     * @param {Function} options.onCancel - Callback for cancel action
     * @param {string} options.initialMessage - Initial status message
     */
    show(options = {}) {
        const {
            title = "Processing...",
            sessionId,
            allowCancel = true,
            onCancel = null,
            initialMessage = "Starting process..."
        } = options;

        // Add theme detection
        const currentTheme = document.documentElement.getAttribute("data-bs-theme") || "light";
        const modalElement = document.getElementById("progressModal");

        // Propagate theme
        if (modalElement) {
            modalElement.setAttribute("data-bs-theme", currentTheme);
        }

        // Update modal content
        document.getElementById("progressModalTitle").textContent = title;
        document.getElementById("progressMessage").textContent = initialMessage;

        // Configure cancel functionality
        const cancelBtn = document.getElementById("progressCancelBtn");
        if (allowCancel && onCancel) {
            this.onCancelCallback = onCancel;
            cancelBtn.style.display = "inline-block";
        } else {
            cancelBtn.style.display = "none";
        }

        // Reset state
        this.resetProgressState();

        // Join WebSocket room if sessionId provided
        if (sessionId && this.websocketClient && this.websocketClient.isSocketConnected()) {
            this.currentSessionId = sessionId;
            this.websocketClient.joinProgressRoom(sessionId);
        }

        // Show modal
        this.isVisible = true;
        this.bsModal.show();

        console.log("Progress modal shown with session:", sessionId);
    }
    
    /**
     * Hide the progress modal
     */
    hide() {
        if (this.bsModal && this.isVisible) {
            this.bsModal.hide();
        }
    }
    
    /**
     * Update progress manually (for non-WebSocket usage)
     * @param {Object} data - Progress data
     */
    update(data) {
        this.progressData = { ...this.progressData, ...data };
        this.updateUI();
    }
    
    /**
     * Handle progress updates from WebSocket
     * @param {Object} data - Progress data from WebSocket
     */
    handleProgressUpdate(data) {
        console.log("Progress update received:", data, "Visible:", this.isVisible, "Session match:", data.sessionId === this.currentSessionId);
        
        if (!this.isVisible || data.sessionId !== this.currentSessionId) {
            console.log("Progress update ignored - modal not visible or session mismatch");
            return;
        }
        
        this.progressData = { ...this.progressData, ...data };
        
        // Use requestAnimationFrame for smooth updates
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
        }
        
        this.animationFrameId = requestAnimationFrame(() => {
            this.updateUI();
        });
    }
    
    /**
     * Handle status updates from WebSocket
     * @param {Object} data - Status data from WebSocket
     */
    handleProgressStatus(data) {
        if (!this.isVisible || data.sessionId !== this.currentSessionId) {
            return;
        }
        
        if (data.status === "completed") {
            this.showSuccess(data.message || "Process completed successfully!");
        } else if (data.status === "error") {
            this.showError(data.message || "An error occurred during processing.");
        }
    }
    
    /**
     * Handle progress completion from WebSocket
     * @param {Object} data - Completion data from WebSocket
     */
    handleProgressComplete(data) {
        if (!this.isVisible || data.sessionId !== this.currentSessionId) {
            return;
        }
        
        console.log("Progress complete event received:", data);
        
        // Update progress data to completion
        this.progressData.progress = 100;
        this.progressData.status = "completed";
        this.progressData.message = data.message || "Import completed successfully";
        
        // Update UI to show 100% completion
        this.updateUI();
        
        // Show success state
        this.showSuccess(this.progressData.message);
        
        // Auto-close after 2 seconds on success
        if (!this.progressData.error) {
            setTimeout(() => {
                this.hide();
                
                // Trigger page refresh to show new data
                if (window.refreshPageData) {
                    window.refreshPageData("vulnerabilities");
                }
            }, 2000);
        }
    }
    
    /**
     * Handle WebSocket connection errors
     */
    handleWebSocketError() {
        if (this.isVisible) {
            this.showError("Connection lost. Please check your network and try again.");
        }
    }
    
    /**
     * Update the UI with current progress data
     */
    updateUI() {
        const {
            progress = 0,
            message = "",
            stage = "",
            current = 0,
            total = 0,
            eta = null
        } = this.progressData;
        
        // Update progress bar
        const progressBar = document.getElementById("progressBar");
        const percentage = Math.min(Math.max(progress, 0), 100);
        
        if (progressBar) {
            progressBar.style.width = `${percentage}%`;
            progressBar.setAttribute("aria-valuenow", percentage);
        }
        
        // Update percentage display
        const percentageEl = document.getElementById("progressPercentage");
        if (percentageEl) {
            percentageEl.textContent = `${Math.round(percentage)}%`;
        }
        
        // Update stage
        const stageEl = document.getElementById("progressStage");
        if (stageEl && stage) {
            stageEl.textContent = stage;
        }
        
        // Update message
        const messageEl = document.getElementById("progressMessage");
        if (messageEl && message) {
            messageEl.textContent = message;
        }
        
        // Update details
        const currentEl = document.getElementById("progressCurrent");
        const totalEl = document.getElementById("progressTotal");
        const etaEl = document.getElementById("progressETA");
        
        if (currentEl) {currentEl.textContent = current.toLocaleString();}
        if (totalEl) {totalEl.textContent = total.toLocaleString();}
        if (etaEl) {etaEl.textContent = eta || "--";}
    }
    
    /**
     * Show success state
     * @param {string} message - Success message
     */
    showSuccess(message) {
        // Hide spinner
        const spinner = this.modal.querySelector(".spinner-border");
        if (spinner) {
            spinner.style.display = "none";
        }
        
        // Update header to success state
        const header = this.modal.querySelector(".modal-header");
        if (header) {
            header.className = "modal-header bg-success text-white";
        }
        
        // Show success alert
        const successAlert = document.getElementById("progressSuccess");
        const successMessage = document.getElementById("progressSuccessMessage");
        if (successAlert && successMessage) {
            successMessage.textContent = message;
            successAlert.classList.remove("d-none");
        }
        
        // Update buttons
        this.showCompleteButtons();
        
        // Update progress bar to 100%
        this.update({ progress: 100 });
        
        console.log("Progress modal: Success state shown");
    }
    
    /**
     * Show error state
     * @param {string} message - Error message
     */
    showError(message) {
        this.progressData.error = message;
        
        // Hide spinner
        const spinner = this.modal.querySelector(".spinner-border");
        if (spinner) {
            spinner.style.display = "none";
        }
        
        // Update header to error state
        const header = this.modal.querySelector(".modal-header");
        if (header) {
            header.className = "modal-header bg-danger text-white";
        }
        
        // Show error alert
        const errorAlert = document.getElementById("progressError");
        const errorMessage = document.getElementById("progressErrorMessage");
        if (errorAlert && errorMessage) {
            errorMessage.textContent = message;
            errorAlert.classList.remove("d-none");
        }
        
        // Update buttons
        this.showCompleteButtons();
        
        console.error("Progress modal: Error state shown -", message);
    }
    
    /**
     * Show completion buttons (hide cancel, show close)
     */
    showCompleteButtons() {
        const cancelBtn = document.getElementById("progressCancelBtn");
        const closeBtn = document.getElementById("progressCloseBtn");
        
        if (cancelBtn) {cancelBtn.classList.add("d-none");}
        if (closeBtn) {closeBtn.classList.remove("d-none");}
    }
    
    /**
     * Handle cancel button click
     */
    handleCancel() {
        this.showCancelConfirmation();
    }
    
    /**
     * Show cancel confirmation dialog
     */
    showCancelConfirmation() {
        if (!this.isActiveProgress()) {
            this.hide();
            return;
        }
        
        const confirmed = confirm("Are you sure you want to cancel this operation? This action cannot be undone.");
        if (confirmed && this.onCancelCallback) {
            this.onCancelCallback();
            this.hide();
        }
    }
    
    /**
     * Handle close button click
     */
    handleClose() {
        this.hide();
    }
    
    /**
     * Check if progress is actively running
     * @returns {boolean} True if progress is active
     */
    isActiveProgress() {
        return this.isVisible && 
               this.progressData.progress < 100 && 
               !this.progressData.error;
    }
    
    /**
     * Reset progress state to initial values
     */
    resetProgressState() {
        this.progressData = {
            progress: 0,
            message: "",
            stage: "",
            current: 0,
            total: 0,
            eta: null,
            error: null
        };
        
        // Reset UI elements
        const header = this.modal.querySelector(".modal-header");
        if (header) {
            header.className = "modal-header bg-primary text-white";
        }
        
        // Show spinner
        const spinner = this.modal.querySelector(".spinner-border");
        if (spinner) {
            spinner.style.display = "inline-block";
        }
        
        // Hide alerts
        const successAlert = document.getElementById("progressSuccess");
        const errorAlert = document.getElementById("progressError");
        if (successAlert) {successAlert.classList.add("d-none");}
        if (errorAlert) {errorAlert.classList.add("d-none");}
        
        // Reset buttons
        const cancelBtn = document.getElementById("progressCancelBtn");
        const closeBtn = document.getElementById("progressCloseBtn");
        if (cancelBtn) {cancelBtn.classList.remove("d-none");}
        if (closeBtn) {closeBtn.classList.add("d-none");}
        
        // Update UI
        this.updateUI();
    }
    
    /**
     * Cleanup resources when modal is hidden
     */
    cleanup() {
        this.isVisible = false;
        
        // Leave WebSocket room
        if (this.currentSessionId && this.websocketClient) {
            this.websocketClient.leaveProgressRoom(this.currentSessionId);
            this.currentSessionId = null;
        }
        
        // Cancel animation frame
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
            this.animationFrameId = null;
        }
        
        // Clear callbacks
        this.onCancelCallback = null;
        
        console.log("Progress modal: Cleanup completed");
    }
    
    /**
     * Destroy the modal and remove all event listeners
     */
    destroy() {
        this.cleanup();
        this.removeWebSocketListeners();
        
        if (this.bsModal) {
            this.bsModal.dispose();
        }
        
        const container = document.getElementById("progressModalContainer");
        if (container) {
            container.remove();
        }
        
        console.log("Progress modal: Destroyed");
    }
}

// Make available globally
if (typeof window !== "undefined") {
    window.ProgressModal = ProgressModal;
}