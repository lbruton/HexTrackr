/**
 * @fileoverview Enhanced Toast Manager for HexTrackr - User feedback system
 * Provides loading states, error feedback, and visual notifications
 * 
 * @version 1.0.0
 * @date 2025-09-10
 * @spec 004-cve-link-system-fix
 * @task T041 - Add user feedback for error states in modal displays
 * @author Curly (with creative enhancements!)
 */

/* global bootstrap */

(function(global) {
    "use strict";

    /**
     * Toast Manager class for handling all user notifications
     * Provides consistent UI feedback across the application
     */
    class ToastManager {
        constructor() {
            this.activeToasts = new Map();
            this.loadingToast = null;
            this.toastQueue = [];
            this.maxToasts = 5;
            this.defaultDuration = 5000;
            this.loadingTimeout = null;
            this.initializeContainer();
        }

        /**
         * Initialize or get the toast container
         * @private
         */
        initializeContainer() {
            let container = document.getElementById("toastContainer");
            if (!container) {
                container = document.createElement("div");
                container.id = "toastContainer";
                container.className = "position-fixed top-0 end-0 p-3";
                container.style.zIndex = "9999";
                container.style.maxHeight = "100vh";
                container.style.overflowY = "auto";
                container.setAttribute("aria-live", "polite");
                container.setAttribute("aria-atomic", "true");
                document.body.appendChild(container);
            }
            this.container = container;
        }

        /**
         * Show a toast notification
         * @param {string} message - Message to display
         * @param {string} [type='info'] - Type: success, error, warning, info, danger
         * @param {Object} [options] - Additional options
         * @returns {string} Toast ID for reference
         */
        showToast(message, type = "info", options = {}) {
            // Map error to danger for Bootstrap
            if (type === "error") {type = "danger";}

            const defaults = {
                duration: this.defaultDuration,
                autohide: true,
                showProgress: false,
                icon: this.getIconForType(type),
                dismissible: true,
                animation: true
            };

            const settings = Object.assign({}, defaults, options);
            // Generate secure toast ID using shared utility
            const toastId = generateSecureId("toast", 2);

            // Check if we need to queue this toast
            if (this.activeToasts.size >= this.maxToasts && !options.priority) {
                this.toastQueue.push({ message, type, options, toastId });
                return toastId;
            }

            // Create toast element
            const toast = this.createToastElement(toastId, message, type, settings);
            
            // Add to container
            if (options.priority) {
                this.container.insertBefore(toast, this.container.firstChild);
            } else {
                this.container.appendChild(toast);
            }

            // Initialize Bootstrap toast
            const bsToast = new bootstrap.Toast(toast, {
                autohide: settings.autohide,
                delay: settings.duration,
                animation: settings.animation
            });

            // Track active toast
            this.activeToasts.set(toastId, { element: toast, instance: bsToast });

            // Show the toast
            bsToast.show();

            // Handle removal
            toast.addEventListener("hidden.bs.toast", () => {
                this.handleToastHidden(toastId);
            });

            return toastId;
        }

        /**
         * Create the toast HTML element
         * @private
         */
        createToastElement(toastId, message, type, settings) {
            const toast = document.createElement("div");
            toast.className = `toast align-items-center border-0 ${settings.animation ? "fade" : ""}`;
            toast.id = toastId;
            toast.setAttribute("role", "alert");
            toast.setAttribute("aria-live", "assertive");
            toast.setAttribute("aria-atomic", "true");

            // Set background color based on type
            const bgClass = this.getBackgroundClass(type);
            toast.classList.add(bgClass);

            // Build toast content
            const iconHtml = settings.icon ? `<i class="${settings.icon} me-2"></i>` : "";
            const progressHtml = settings.showProgress ? this.createProgressBar() : "";
            const closeButton = settings.dismissible ? 
                "<button type=\"button\" class=\"btn-close btn-close-white me-2 m-auto\" data-bs-dismiss=\"toast\" aria-label=\"Close\"></button>" : "";

            toast.innerHTML = `
                <div class="d-flex">
                    <div class="toast-body text-white">
                        ${iconHtml}${this.escapeHtml(message)}
                        ${progressHtml}
                    </div>
                    ${closeButton}
                </div>
            `;

            // Add progress animation if needed
            if (settings.showProgress && settings.autohide) {
                this.animateProgress(toast, settings.duration);
            }

            return toast;
        }

        /**
         * Show a loading toast with spinner
         * @param {string} message - Loading message
         * @param {Object} [options] - Additional options
         * @returns {string} Loading toast ID
         */
        showLoading(message = "Loading...", options = {}) {
            // Hide any existing loading toast
            this.hideLoading();

            const loadingOptions = Object.assign({}, options, {
                autohide: false,
                dismissible: false,
                icon: "spinner-border spinner-border-sm",
                showProgress: false,
                priority: true
            });

            this.loadingToast = this.showToast(message, "info", loadingOptions);

            // Add timeout protection (30 seconds max)
            this.loadingTimeout = setTimeout(() => {
                this.hideLoading();
                this.showToast("Operation timed out", "warning");
            }, options.timeout || 30000);

            return this.loadingToast;
        }

        /**
         * Hide the loading toast
         */
        hideLoading() {
            if (this.loadingToast && this.activeToasts.has(this.loadingToast)) {
                const toast = this.activeToasts.get(this.loadingToast);
                toast.instance.hide();
                this.loadingToast = null;
            }

            if (this.loadingTimeout) {
                clearTimeout(this.loadingTimeout);
                this.loadingTimeout = null;
            }
        }

        /**
         * Show error with details
         * @param {string} message - Error message
         * @param {Error|Object} [error] - Error object with details
         * @param {Object} [options] - Additional options
         */
        showError(message, error = null, options = {}) {
            let fullMessage = message;
            
            if (error) {
                if (error.message) {
                    fullMessage += `: ${error.message}`;
                }
                if (error.code) {
                    fullMessage += ` (Code: ${error.code})`;
                }
            }

            const errorOptions = Object.assign({}, options, {
                duration: 8000,
                priority: true,
                icon: "bi bi-exclamation-triangle-fill"
            });

            return this.showToast(fullMessage, "danger", errorOptions);
        }

        /**
         * Show success message
         * @param {string} message - Success message
         * @param {Object} [options] - Additional options
         */
        showSuccess(message, options = {}) {
            const successOptions = Object.assign({}, options, {
                icon: "bi bi-check-circle-fill"
            });
            return this.showToast(message, "success", successOptions);
        }

        /**
         * Show warning message
         * @param {string} message - Warning message
         * @param {Object} [options] - Additional options
         */
        showWarning(message, options = {}) {
            const warningOptions = Object.assign({}, options, {
                icon: "bi bi-exclamation-circle-fill",
                duration: 6000
            });
            return this.showToast(message, "warning", warningOptions);
        }

        /**
         * Show info message
         * @param {string} message - Info message
         * @param {Object} [options] - Additional options
         */
        showInfo(message, options = {}) {
            const infoOptions = Object.assign({}, options, {
                icon: "bi bi-info-circle-fill"
            });
            return this.showToast(message, "info", infoOptions);
        }

        /**
         * Show a toast for CVE lookup status
         * @param {string} cveId - CVE identifier
         * @param {string} status - Status: looking, found, notfound, error
         * @param {Object} [data] - Additional data
         */
        showCVEStatus(cveId, status, data = {}) {
            switch (status) {
                case "looking":
                    return this.showLoading(`Looking up ${cveId}...`, { timeout: 15000 });
                case "found":
                    this.hideLoading();
                    return this.showSuccess(`Found information for ${cveId}`);
                case "notfound":
                    this.hideLoading();
                    return this.showWarning(`No information found for ${cveId}. Opening external lookup...`);
                case "error":
                    this.hideLoading();
                    return this.showError(`Failed to lookup ${cveId}`, data.error);
                default:
                    return this.showInfo(`${cveId}: ${status}`);
            }
        }

        /**
         * Clear all toasts
         */
        clearAll() {
            this.activeToasts.forEach((toast) => {
                toast.instance.hide();
            });
            this.toastQueue = [];
        }

        /**
         * Handle toast hidden event
         * @private
         */
        handleToastHidden(toastId) {
            const toast = this.activeToasts.get(toastId);
            if (toast) {
                toast.element.remove();
                this.activeToasts.delete(toastId);
            }

            // Process queue if there are waiting toasts
            if (this.toastQueue.length > 0 && this.activeToasts.size < this.maxToasts) {
                const next = this.toastQueue.shift();
                this.showToast(next.message, next.type, next.options);
            }
        }

        /**
         * Get background class for toast type
         * @private
         */
        getBackgroundClass(type) {
            const classes = {
                success: "bg-success",
                danger: "bg-danger",
                error: "bg-danger",
                warning: "bg-warning",
                info: "bg-info",
                primary: "bg-primary",
                secondary: "bg-secondary"
            };
            return classes[type] || "bg-secondary";
        }

        /**
         * Get icon for toast type
         * @private
         */
        getIconForType(type) {
            const icons = {
                success: "bi bi-check-circle",
                danger: "bi bi-x-circle",
                error: "bi bi-x-circle",
                warning: "bi bi-exclamation-triangle",
                info: "bi bi-info-circle"
            };
            return icons[type] || "";
        }

        /**
         * Create progress bar HTML
         * @private
         */
        createProgressBar() {
            return `
                <div class="progress mt-2" style="height: 3px;">
                    <div class="progress-bar progress-bar-animated" role="progressbar" 
                         style="width: 100%;" aria-valuenow="100" aria-valuemin="0" aria-valuemax="100">
                    </div>
                </div>
            `;
        }

        /**
         * Animate progress bar
         * @private
         */
        animateProgress(toast, duration) {
            const progressBar = toast.querySelector(".progress-bar");
            if (progressBar) {
                progressBar.style.transition = `width ${duration}ms linear`;
                setTimeout(() => {
                    progressBar.style.width = "0%";
                }, 100);
            }
        }

        /**
         * Escape HTML to prevent XSS
         * @private
         */
        escapeHtml(text) {
            const map = {
                "&": "&amp;",
                "<": "&lt;",
                ">": "&gt;",
                "\"": "&quot;",
                "'": "&#039;"
            };
            return String(text).replace(/[&<>"']/g, m => map[m]);
        }

        /**
         * Show modal error state
         * @param {string} modalId - Modal element ID
         * @param {string} message - Error message
         * @param {Object} [options] - Additional options
         */
        showModalError(modalId, message, options = {}) {
            const modal = document.getElementById(modalId);
            if (!modal) {return;}

            // Find or create error container in modal
            let errorContainer = modal.querySelector(".modal-error-container");
            if (!errorContainer) {
                errorContainer = document.createElement("div");
                errorContainer.className = "modal-error-container alert alert-danger alert-dismissible fade show m-3";
                errorContainer.setAttribute("role", "alert");
                
                const modalBody = modal.querySelector(".modal-body");
                if (modalBody) {
                    modalBody.insertBefore(errorContainer, modalBody.firstChild);
                }
            }

            // Set error content
            errorContainer.innerHTML = `
                <i class="bi bi-exclamation-triangle-fill me-2"></i>
                <strong>Error:</strong> ${this.escapeHtml(message)}
                <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
            `;

            // Auto-hide after duration
            if (options.autohide !== false) {
                setTimeout(() => {
                    errorContainer.classList.remove("show");
                    setTimeout(() => errorContainer.remove(), 150);
                }, options.duration || 5000);
            }
        }

        /**
         * Clear modal errors
         * @param {string} modalId - Modal element ID
         */
        clearModalErrors(modalId) {
            const modal = document.getElementById(modalId);
            if (!modal) {return;}

            const errorContainers = modal.querySelectorAll(".modal-error-container");
            errorContainers.forEach(container => container.remove());
        }
    }

    // Create singleton instance
    const toastManager = new ToastManager();

    // Export for different environments
    if (typeof module !== "undefined" && module.exports) {
        module.exports = toastManager;
    } else if (typeof define === "function" && define.amd) {
        define([], function() {
            return toastManager;
        });
    } else {
        global.ToastManager = ToastManager;
        global.toastManager = toastManager;
    }

})(typeof window !== "undefined" ? window : global);