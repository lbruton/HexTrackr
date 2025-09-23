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
        this.handleExport = this.handleExport.bind(this);
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
                        <div class="modal-header">
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
                            <button type="button" class="btn btn-outline-info d-none" id="progressExportBtn">
                                <i class="fas fa-download me-1"></i>
                                Download Report
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
        
        // Export button
        const exportBtn = document.getElementById("progressExportBtn");
        if (exportBtn) {
            exportBtn.addEventListener("click", this.handleExport);
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

        // Store import summary if available
        if (data.metadata && data.metadata.importSummary) {
            this.progressData.importSummary = data.metadata.importSummary;
            console.log("Import summary received:", data.metadata.importSummary);
        }

        // Update UI to show 100% completion
        this.updateUI();

        // Show success state with summary
        this.showSuccess(this.progressData.message, data.metadata ? data.metadata.importSummary : null);

        // Modal will stay open until user manually closes it
        // Page refresh will be triggered by the Close button handler when import summary is present
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
     * @param {Object} importSummary - Optional import summary data
     */
    showSuccess(message, importSummary = null) {
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

        // Display import summary if available
        if (importSummary) {
            this.displayImportSummary(importSummary);
        }

        // Update buttons
        this.showCompleteButtons();

        // Update progress bar to 100%
        this.update({ progress: 100 });

        console.log("Progress modal: Success state shown", importSummary ? "with summary" : "");
    }

    /**
     * Display import summary in the modal
     * @param {Object} summary - Import summary data
     */
    displayImportSummary(summary) {
        // Create or update summary container
        let summaryContainer = document.getElementById("progressSummary");
        if (!summaryContainer) {
            summaryContainer = document.createElement("div");
            summaryContainer.id = "progressSummary";
            summaryContainer.className = "mt-3";

            // Insert after success alert
            const successAlert = document.getElementById("progressSuccess");
            if (successAlert && successAlert.parentNode) {
                successAlert.parentNode.insertBefore(summaryContainer, successAlert.nextSibling);
            }
        }

        // Generate summary HTML
        const summaryHTML = this.generateSummaryHTML(summary);
        summaryContainer.innerHTML = summaryHTML;
        summaryContainer.classList.remove("d-none");

        console.log("Import summary displayed:", summary);
    }

    /**
     * Generate HTML for import summary
     * @param {Object} summary - Import summary data
     * @returns {string} HTML string
     */
    generateSummaryHTML(summary) {
        const { cveDiscovery, severityImpact, comparison } = summary;

        let html = `
            <div class="card border-info">
                <div class="card-header bg-info text-white">
                    <h6 class="mb-0">📊 Import Summary</h6>
                </div>
                <div class="card-body">
        `;

        // CVE Discovery Section
        if (cveDiscovery && cveDiscovery.totalNewCves > 0) {
            html += `
                <div class="row mb-3">
                    <div class="col-12">
                        <h6 class="text-primary">🔍 New CVEs Discovered</h6>
                        <div class="alert alert-warning">
                            <strong>${cveDiscovery.totalNewCves} new CVE${cveDiscovery.totalNewCves !== 1 ? "s" : ""}</strong>
                            affecting <strong>${cveDiscovery.totalNewVulnerabilities.toLocaleString()} vulnerabilities</strong>
                            <small class="d-block mt-1">Total VPR Impact: +${cveDiscovery.totalNewVpr.toLocaleString()}</small>
                        </div>
                    </div>
                </div>
            `;

            // Show top new CVEs (limit to 5)
            if (cveDiscovery.newCves && cveDiscovery.newCves.length > 0) {
                const topCves = cveDiscovery.newCves.slice(0, 5);
                html += `
                    <div class="row mb-3">
                        <div class="col-12">
                            <h6 class="mb-2">Top New CVEs:</h6>
                            <div class="table-responsive">
                                <table class="table table-sm">
                                    <thead>
                                        <tr><th>CVE</th><th>Severity</th><th>Hosts</th><th>VPR Total</th></tr>
                                    </thead>
                                    <tbody>
                `;

                topCves.forEach(cve => {
                    const severityClass = cve.severity.toLowerCase();
                    html += `
                        <tr>
                            <td><code>${cve.cve}</code></td>
                            <td><span class="badge severity-${severityClass}">${cve.severity}</span></td>
                            <td>${cve.hostCount.toLocaleString()}</td>
                            <td>${cve.totalVpr.toLocaleString()}</td>
                        </tr>
                    `;
                });

                html += `
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                `;
            }
        }

        // Severity Impact Section
        if (severityImpact) {
            html += `
                <div class="row">
                    <div class="col-12">
                        <h6 class="text-primary">📈 Severity Impact</h6>
                        <div class="row">
            `;

            ["critical", "high", "medium", "low"].forEach(severity => {
                const impact = severityImpact[severity];
                if (impact && Math.abs(impact.netChange) > 0) {
                    const changeIcon = impact.netChange > 0 ? "↗️" : "↘️";
                    const changeClass = impact.netChange > 0 ? "text-danger" : "text-success";

                    html += `
                        <div class="col-6 col-md-3 mb-2">
                            <div class="text-center">
                                <div class="fw-bold text-${severity === "critical" ? "danger" : severity === "high" ? "warning" : severity === "medium" ? "info" : "secondary"}">${severity.toUpperCase()}</div>
                                <div class="${changeClass}">${changeIcon} ${impact.netChange > 0 ? "+" : ""}${impact.netChange.toLocaleString()}</div>
                                <small class="text-muted">${impact.current.toLocaleString()} total</small>
                            </div>
                        </div>
                    `;
                }
            });

            html += `
                        </div>
                    </div>
                </div>
            `;
        }

        // Overall Impact
        if (comparison) {
            const changePercentage = comparison.percentageChange;
            const changeIcon = changePercentage > 0 ? "↗️" : changePercentage < 0 ? "↘️" : "➡️";
            const changeClass = comparison.significantChange ?
                (changePercentage > 0 ? "text-danger" : "text-success") : "text-muted";

            html += `
                <div class="row mt-3">
                    <div class="col-12">
                        <div class="alert alert-info">
                            <strong>Overall Impact:</strong>
                            <span class="${changeClass}">
                                ${changeIcon} ${changePercentage > 0 ? "+" : ""}${changePercentage.toFixed(1)}%
                                (${comparison.netChange > 0 ? "+" : ""}${comparison.netChange.toLocaleString()} vulnerabilities)
                            </span>
                            ${comparison.significantChange ? " <small class=\"badge bg-warning text-dark\">Significant Change</small>" : ""}
                        </div>
                    </div>
                </div>
            `;
        }

        html += `
                </div>
            </div>
        `;

        return html;
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
        const exportBtn = document.getElementById("progressExportBtn");
        const closeBtn = document.getElementById("progressCloseBtn");

        if (cancelBtn) {cancelBtn.classList.add("d-none");}

        // Show export button only if import summary is present
        if (exportBtn) {
            if (this.progressData.importSummary) {
                exportBtn.classList.remove("d-none");
            } else {
                exportBtn.classList.add("d-none");
            }
        }

        if (closeBtn) {
            closeBtn.classList.remove("d-none");

            // Update button text if import summary is present
            if (this.progressData.importSummary) {
                closeBtn.innerHTML = '<i class="fas fa-check me-1"></i>OK - Refresh Page';
                closeBtn.classList.add("btn-pulse");
            }
        }
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
        const hasImportSummary = this.progressData.importSummary;
        this.hide();

        // Trigger page refresh if we just completed an import with summary
        if (hasImportSummary && window.refreshPageData) {
            window.refreshPageData("vulnerabilities");
        }
    }

    /**
     * Handle export button click - downloads import summary as HTML report
     */
    async handleExport() {
        if (!this.progressData.importSummary) {
            console.error("No import summary available for export");
            return;
        }

        try {
            await this.downloadImportReport();
        } catch (error) {
            console.error("Export failed:", error);

            // Show error state on button
            const exportBtn = document.getElementById("progressExportBtn");
            if (exportBtn) {
                const originalText = exportBtn.innerHTML;
                exportBtn.innerHTML = '<i class="fas fa-exclamation-triangle me-1"></i>Failed!';
                exportBtn.classList.add("btn-outline-danger");
                exportBtn.classList.remove("btn-outline-info");

                setTimeout(() => {
                    exportBtn.innerHTML = '<i class="fas fa-download me-1"></i>Download Report';
                    exportBtn.classList.remove("btn-outline-danger");
                    exportBtn.classList.add("btn-outline-info");
                    exportBtn.disabled = false;
                }, 3000);
            }
        }
    }

    /**
     * Extract and combine all necessary CSS for standalone HTML report
     * @returns {Promise<string>} Combined CSS content
     */
    async extractEmbeddedCSS() {
        const cssFiles = [
            "/vendor/tabler/css/tabler.min.css",           // Tabler.io framework
            "/styles/css-variables.css",                   // HexTrackr CSS variables
            "/styles/shared/base.css",                     // Base styles
            "/styles/shared/modals.css",                   // Modal styles
            "/styles/shared/badges.css",                   // Severity badges
            "/styles/shared/cards.css",                    // Card components
            "/styles/shared/tables.css"                    // Table styles
        ];

        let combinedCSS = "";

        // Add Font Awesome CSS link since it's external
        combinedCSS += `
        /* Font Awesome Icons */
        @import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css');

        `;

        // Fetch and combine all CSS files
        for (const cssFile of cssFiles) {
            try {
                const response = await fetch(cssFile);
                if (response.ok) {
                    const cssContent = await response.text();
                    combinedCSS += `\n/* === ${cssFile} === */\n`;
                    combinedCSS += cssContent;
                    combinedCSS += "\n";
                } else {
                    console.warn(`Could not load CSS file: ${cssFile}`);
                }
            } catch (error) {
                console.warn(`Error loading CSS file ${cssFile}:`, error);
            }
        }

        // Add custom styles for print-friendly report
        combinedCSS += `
        /* === Custom Report Styles === */
        @media print {
            .modal-header {
                border-bottom: 2px solid #dee2e6 !important;
                background: #f8f9fa !important;
                -webkit-print-color-adjust: exact;
                color-adjust: exact;
            }

            .card {
                break-inside: avoid;
                margin-bottom: 1rem;
            }

            .table {
                font-size: 0.875rem;
            }
        }

        /* Standalone document styles */
        body {
            padding: 2rem;
            background: #ffffff;
        }

        .report-header {
            border-bottom: 3px solid var(--tblr-primary, #206bc4);
            padding-bottom: 1rem;
            margin-bottom: 2rem;
        }

        .report-title {
            color: var(--tblr-primary, #206bc4);
            font-size: 1.75rem;
            font-weight: 600;
            margin: 0;
        }

        .report-subtitle {
            color: var(--tblr-muted, #6c757d);
            margin: 0.5rem 0 0 0;
        }
        `;

        return combinedCSS;
    }

    /**
     * Generate complete HTML report with embedded CSS and import summary
     * @returns {Promise<string>} Complete HTML document
     */
    async generateStandaloneReport() {
        if (!this.progressData.importSummary) {
            throw new Error("No import summary available");
        }

        // Extract embedded CSS
        const embeddedCSS = await this.extractEmbeddedCSS();

        // Generate import summary content using existing function
        const summaryHTML = this.generateSummaryHTML(this.progressData.importSummary);

        // Get metadata for report header
        const reportDate = new Date().toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        });

        // Extract filename from import metadata if available
        const originalFilename = this.progressData.importSummary.metadata?.filename || "unknown";
        const scanDate = this.progressData.importSummary.metadata?.scanDate || "unknown";

        // Create complete HTML document
        const htmlDocument = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="generator" content="HexTrackr Vulnerability Management System">
    <meta name="description" content="Import Summary Report generated by HexTrackr">
    <title>HexTrackr Import Report - ${scanDate}</title>

    <style>
${embeddedCSS}
    </style>
</head>
<body>
    <div class="report-header">
        <h1 class="report-title">
            <i class="fas fa-shield-alt me-2"></i>
            HexTrackr Import Summary Report
        </h1>
        <p class="report-subtitle">
            <strong>Generated:</strong> ${reportDate} |
            <strong>Source File:</strong> ${originalFilename} |
            <strong>Scan Date:</strong> ${scanDate}
        </p>
    </div>

    <div class="container-fluid">
        <div class="row">
            <div class="col-12">
                <!-- Import Summary Content -->
                ${summaryHTML}

                <!-- Report Footer -->
                <div class="mt-5 pt-4 border-top text-center text-muted">
                    <p class="mb-1">
                        <i class="fas fa-info-circle me-1"></i>
                        This report was automatically generated by
                        <strong>HexTrackr Vulnerability Management System</strong>
                    </p>
                    <p class="mb-0 small">
                        Report Generation Time: ${new Date().toISOString()}
                    </p>
                </div>
            </div>
        </div>
    </div>
</body>
</html>`;

        return htmlDocument;
    }

    /**
     * Generate descriptive filename for the HTML report
     * @returns {string} Formatted filename
     */
    generateReportFilename() {
        const dateStr = new Date().toISOString().split("T")[0]; // YYYY-MM-DD format

        // Try to extract original filename from import summary
        let baseFilename = "import";
        if (this.progressData.importSummary?.metadata?.filename) {
            const originalName = this.progressData.importSummary.metadata.filename;
            // Remove extension and clean up filename
            baseFilename = originalName.replace(/\.[^/.]+$/, "").replace(/[^a-zA-Z0-9-_]/g, "_");
        }

        return `HexTrackr_Import_Report_${dateStr}_${baseFilename}.html`;
    }

    /**
     * Download import summary as standalone HTML report
     * Follows the established blob download pattern from vulnerability exports
     */
    async downloadImportReport() {
        const exportBtn = document.getElementById("progressExportBtn");
        const originalBtnText = exportBtn ? exportBtn.innerHTML : "";

        try {
            // Show loading state using the export button
            if (exportBtn) {
                exportBtn.disabled = true;
                exportBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-1"></i>Generating...';
            }

            // Generate complete HTML report
            const htmlContent = await this.generateStandaloneReport();
            const filename = this.generateReportFilename();

            // Create blob with HTML content
            const blob = new Blob([htmlContent], { type: "text/html;charset=utf-8" });
            const url = window.URL.createObjectURL(blob);

            // Create and trigger download link
            const downloadLink = document.createElement("a");
            downloadLink.style.display = "none";
            downloadLink.href = url;
            downloadLink.download = filename;

            // Append to DOM, click, and clean up
            document.body.appendChild(downloadLink);
            downloadLink.click();
            document.body.removeChild(downloadLink);

            // Clean up blob URL
            window.URL.revokeObjectURL(url);

            // Show success state
            if (exportBtn) {
                exportBtn.innerHTML = '<i class="fas fa-check me-1"></i>Downloaded!';
                setTimeout(() => {
                    exportBtn.disabled = false;
                    exportBtn.innerHTML = originalBtnText;
                }, 2000);
            }

            // Show success feedback
            console.log(`Import report downloaded: ${filename}`);

        } catch (error) {
            // Restore button state on error
            if (exportBtn) {
                exportBtn.disabled = false;
                exportBtn.innerHTML = originalBtnText;
            }

            console.error("Failed to download import report:", error);
            throw error; // Re-throw to be handled by handleExport
        }
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
            error: null,
            importSummary: null
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

        // Hide and clear previous import summary
        const summaryContainer = document.getElementById("progressSummary");
        if (summaryContainer) {
            summaryContainer.classList.add("d-none");
            summaryContainer.innerHTML = ""; // Clear content to prevent stale data
        }

        // Reset buttons
        const cancelBtn = document.getElementById("progressCancelBtn");
        const exportBtn = document.getElementById("progressExportBtn");
        const closeBtn = document.getElementById("progressCloseBtn");
        if (cancelBtn) {cancelBtn.classList.remove("d-none");}
        if (exportBtn) {exportBtn.classList.add("d-none");}
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