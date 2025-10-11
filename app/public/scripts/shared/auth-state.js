/**
 * @fileoverview Authentication State Manager for HexTrackr
 * @description Global authentication state manager that handles session checking,
 * user info, protected routes, and API integration across all HexTrackr pages.
 * Provides centralized authentication state, automatic session validation,
 * unauthenticated redirect handling, and authenticated fetch wrapper with
 * credential management and 401 response handling.
 *
 * @module AuthState
 * @version 1.0.47
 * @since 2025-10-05
 * @author HexTrackr Development Team
 *
 * @requires bootstrap - Bootstrap 5 for modal components
 *
 * @example
 * // In any protected HTML page:
 * <script src="/scripts/shared/auth-state.js"></script>
 * <script>
 *   document.addEventListener('DOMContentLoaded', async () => {
 *     const isAuth = await authState.init();
 *     if (isAuth) {
 *       authState.updateUserMenu();
 *       logger.debug('Authenticated as:', authState.getUser().username);
 *     }
 *   });
 * </script>
 */

/* eslint-env browser */
/* global bootstrap, console, document, window, setInterval, clearInterval, fetch */

"use strict";

/**
 * Authentication State Manager Class
 *
 * Manages global authentication state including session validation,
 * user information, protected route handling, and authenticated API calls.
 *
 * @class AuthState
 */
class AuthState {
    /**
     * Create an AuthState instance
     *
     * Initializes authentication state with null user, unauthenticated status,
     * and no active session check interval.
     *
     * @constructor
     */
    constructor() {
        /**
         * Current authenticated user object
         * @type {Object|null}
         * @private
         */
        this.user = null;

        /**
         * Current authentication status
         * @type {boolean}
         * @private
         */
        this.authenticated = false;

        /**
         * Session check interval timer ID
         * @type {number|null}
         * @private
         */
        this.sessionCheckInterval = null;

        logger.debug("✅ AuthState initialized");
    }

    /**
     * Initialize authentication state by checking current session
     *
     * Checks session status via GET /api/auth/status endpoint. If unauthenticated
     * and not on a public page, redirects to login. If authenticated, updates
     * internal state and starts session validation interval.
     *
     * @async
     * @returns {Promise<boolean>} True if authenticated, false otherwise
     * @throws {Error} When session status check fails
     *
     * @example
     * const isAuth = await authState.init();
     * if (isAuth) {
     *   logger.debug('User is authenticated');
     * }
     */
    async init() {
        try {
            const response = await fetch("/api/auth/status", {
                method: "GET",
                credentials: "include"
            });

            if (!response.ok) {
                logger.error("Failed to check authentication status:", response.status);
                this.authenticated = false;
                this.user = null;
                this.handleUnauthenticated();
                return false;
            }

            const response_data = await response.json();
            this.authenticated = response_data.data.authenticated || false;
            this.user = response_data.data.user || null;

            if (!this.authenticated) {
                this.handleUnauthenticated();
                return false;
            }

            // Start periodic session validation
            this.startSessionCheck();

            logger.debug(`✅ Authenticated as: ${this.user?.username || "Unknown"}`);
            return true;

        } catch (error) {
            logger.error("Error checking authentication status:", error);
            this.authenticated = false;
            this.user = null;
            this.handleUnauthenticated();
            return false;
        }
    }

    /**
     * Handle unauthenticated state by redirecting to login
     *
     * Skips redirect if already on login page or public pages (health, docs-html).
     * Preserves current URL as return parameter for post-login redirect.
     *
     * @returns {void}
     *
     * @example
     * authState.handleUnauthenticated();
     * // Redirects to: /login.html?return=/vulnerabilities.html
     */
    handleUnauthenticated() {
        const currentPath = window.location.pathname;

        // Skip redirect if already on public pages
        if (currentPath.includes("/login.html") ||
            currentPath.includes("/health") ||
            currentPath.includes("/docs-html/")) {
            return;
        }

        this.redirectToLogin();
    }

    /**
     * Redirect to login page with return URL parameter
     *
     * Preserves current URL as query parameter to enable automatic redirect
     * after successful authentication.
     *
     * @returns {void}
     *
     * @example
     * authState.redirectToLogin();
     * // Redirects to: /login.html?return=/current-page.html
     */
    redirectToLogin() {
        const currentUrl = window.location.pathname + window.location.search;
        const returnUrl = encodeURIComponent(currentUrl);
        window.location.href = `/login.html?return=${returnUrl}`;
    }

    /**
     * Get current authenticated user object
     *
     * @returns {Object|null} User object with username, email, etc., or null if not authenticated
     *
     * @example
     * const user = authState.getUser();
     * logger.debug(user.username); // "admin"
     */
    getUser() {
        return this.user;
    }

    /**
     * Get current authentication status
     *
     * @returns {boolean} True if authenticated, false otherwise
     *
     * @example
     * if (authState.isAuthenticated()) {
     *   logger.debug('User is logged in');
     * }
     */
    isAuthenticated() {
        return this.authenticated;
    }

    /**
     * Log out current user
     *
     * Sends POST request to /api/auth/logout, clears local state, stops
     * session checking, and redirects to login page.
     *
     * @async
     * @returns {Promise<void>}
     * @throws {Error} When logout request fails
     *
     * @example
     * await authState.logout();
     * // User is logged out and redirected to login
     */
    async logout() {
        try {
            // Use authenticatedFetch to include CSRF token
            const response = await this.authenticatedFetch("/api/auth/logout", {
                method: "POST"
            });

            if (!response.ok) {
                logger.error("Logout request failed:", response.status);
            }

            // Clear state regardless of response
            this.authenticated = false;
            this.user = null;
            this.stopSessionCheck();

            // Clear sessionStorage cache to force fresh data on next login
            sessionStorage.removeItem("hextrackr_cache_metadata");
            sessionStorage.removeItem("hextrackr_last_load");
            logger.debug("🗑️  Cleared vulnerability cache on logout");

            // Redirect to login
            window.location.href = "/login.html";

        } catch (error) {
            logger.error("Error during logout:", error);
            // Clear state and redirect anyway
            this.authenticated = false;
            this.user = null;
            this.stopSessionCheck();

            // Clear sessionStorage cache even on error
            sessionStorage.removeItem("hextrackr_cache_metadata");
            sessionStorage.removeItem("hextrackr_last_load");

            window.location.href = "/login.html";
        }
    }

    /**
     * Start periodic session validation
     *
     * Validates session every 5 minutes (300000ms) by calling /api/auth/status.
     * If session expires, shows modal and redirects to login.
     *
     * @returns {void}
     *
     * @example
     * authState.startSessionCheck();
     * // Session will be validated every 5 minutes
     */
    startSessionCheck() {
        // Clear any existing interval
        this.stopSessionCheck();

        // Check session every 5 minutes
        this.sessionCheckInterval = setInterval(async () => {
            try {
                const response = await fetch("/api/auth/status", {
                    method: "GET",
                    credentials: "include"
                });

                if (!response.ok) {
                    logger.warn("Session check failed:", response.status);
                    this.showSessionExpiredModal();
                    return;
                }

                const result = await response.json();
                if (!result.data?.authenticated) {
                    logger.warn("Session expired");
                    this.showSessionExpiredModal();
                }

            } catch (error) {
                logger.error("Error checking session:", error);
                // Don't show modal for network errors - may be temporary
            }
        }, 300000); // 5 minutes

        logger.debug("✅ Session validation started (5 minute interval)");
    }

    /**
     * Stop periodic session validation
     *
     * Clears the session check interval timer.
     *
     * @returns {void}
     *
     * @example
     * authState.stopSessionCheck();
     */
    stopSessionCheck() {
        if (this.sessionCheckInterval) {
            clearInterval(this.sessionCheckInterval);
            this.sessionCheckInterval = null;
            logger.debug("Session validation stopped");
        }
    }

    /**
     * Show session expired modal
     *
     * Creates and displays a Bootstrap modal informing the user that their
     * session has expired and they need to log in again. Uses Tabler.io
     * styling with warning icon.
     *
     * @returns {void}
     *
     * @example
     * authState.showSessionExpiredModal();
     * // Displays modal with "Session Expired" message
     */
    showSessionExpiredModal() {
        // Stop session checking
        this.stopSessionCheck();

        // Check if modal already exists
        let modal = document.getElementById("sessionExpiredModal");
        if (modal) {
            // Modal already exists, just show it
            const bsModal = new bootstrap.Modal(modal);
            bsModal.show();
            return;
        }

        // Create modal HTML
        const modalHtml = `
            <div class="modal modal-blur fade" id="sessionExpiredModal" tabindex="-1" role="dialog" aria-labelledby="sessionExpiredModalLabel" aria-hidden="true" data-bs-backdrop="static" data-bs-keyboard="false">
                <div class="modal-dialog modal-sm modal-dialog-centered" role="document">
                    <div class="modal-content">
                        <div class="modal-body text-center py-4">
                            <i class="ti ti-clock-exclamation icon mb-3 text-warning" style="font-size: 3rem;"></i>
                            <h3 class="mb-2">Session Expired</h3>
                            <p class="text-muted mb-0">Your session has expired. Please log in again to continue.</p>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-primary w-100" id="sessionExpiredLoginBtn">
                                Log In Again
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Append modal to body
        document.body.insertAdjacentHTML("beforeend", modalHtml);

        // Get modal element
        modal = document.getElementById("sessionExpiredModal");

        // Add event listener to login button
        const loginBtn = document.getElementById("sessionExpiredLoginBtn");
        loginBtn.addEventListener("click", () => {
            this.redirectToLogin();
        });

        // Show modal
        const bsModal = new bootstrap.Modal(modal);
        bsModal.show();
    }

    /**
     * Update user menu in navbar with authenticated user information
     *
     * CRITICAL FIX: Preserves existing settings dropdown menu items and only
     * updates the user display (avatar + username) and adds authentication
     * options at the bottom. Does NOT destroy the settings menu.
     *
     * RACE CONDITION FIX: Waits for header-loader.js to finish injecting
     * header HTML before attempting to update menu. Retries automatically
     * if header not ready yet.
     *
     * Updates:
     * - User avatar with initials
     * - Username display
     * - Adds "Change Password" link
     * - Adds "Sign Out" link
     *
     * Preserves:
     * - All existing settings menu items (User Management, API Config, etc.)
     *
     * Requires header.html to be loaded first.
     *
     * @param {number} retryCount - Internal retry counter (default: 0)
     * @returns {void}
     *
     * @example
     * authState.updateUserMenu();
     * // Navbar user menu updated, settings menu preserved
     */
    updateUserMenu(retryCount = 0) {
        if (!this.user) {
            logger.warn("Cannot update user menu: no user data");
            return;
        }

        // Find the user dropdown in navbar
        const userDropdown = document.querySelector(".navbar-nav .nav-item.dropdown");
        if (!userDropdown) {
            // Header not loaded yet - wait and retry (max 50 retries = 5 seconds)
            if (retryCount < 50) {
                setTimeout(() => this.updateUserMenu(retryCount + 1), 100);
                if (retryCount === 0) {
                    logger.debug("⏳ Waiting for header to load before updating user menu...");
                }
                return;
            } else {
                logger.error("❌ User dropdown not found after 5 seconds - header may have failed to load");
                return;
            }
        }

        // Find the dropdown trigger link (avatar + username)
        const dropdownTrigger = userDropdown.querySelector("a[data-bs-toggle='dropdown']");
        if (!dropdownTrigger) {
            logger.warn("Dropdown trigger not found");
            return;
        }

        // Create user initials for avatar
        const username = this.user.username || "User";
        const initials = username.substring(0, 2).toUpperCase();

        // Create avatar URL
        const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(initials)}&background=206bc4&color=fff`;

        // Update ONLY the dropdown trigger (avatar + username display)
        // This preserves the dropdown menu content
        dropdownTrigger.innerHTML = `
            <span class="avatar avatar-sm" style="background-image: url(${avatarUrl})"></span>
            <div class="d-none d-xl-block ps-2">
                <div>${username}</div>
                <div class="mt-1 small text-muted">Logged in</div>
            </div>
        `;

        // Find the dropdown menu container
        const dropdownMenu = userDropdown.querySelector(".dropdown-menu");
        if (!dropdownMenu) {
            logger.warn("Dropdown menu not found");
            return;
        }

        // Check if authentication menu items already exist
        if (document.getElementById("changePasswordLink")) {
            // Already added, just update event listeners
            this.attachMenuEventListeners();
            logger.debug("✅ User menu updated (auth items already present)");
            return;
        }

        // Add authentication-specific menu items AFTER existing settings items
        const authMenuItems = `
            <div class="dropdown-divider"></div>
            <a href="#" class="dropdown-item" id="changePasswordLink">
                <i class="ti ti-key me-2"></i>Change Password
            </a>
            <div class="dropdown-divider"></div>
            <a href="#" class="dropdown-item text-danger" id="logoutLink">
                <i class="ti ti-logout me-2"></i>Sign Out
            </a>
        `;

        // Append to existing menu (preserves settings items from header.html)
        dropdownMenu.insertAdjacentHTML("beforeend", authMenuItems);

        // Attach event listeners
        this.attachMenuEventListeners();

        logger.debug("✅ User menu updated (settings preserved)");
    }

    /**
     * Attach event listeners to authentication menu items
     *
     * Separated into its own method to avoid duplicate listeners when
     * updateUserMenu() is called multiple times.
     *
     * @private
     * @returns {void}
     */
    attachMenuEventListeners() {
        const changePasswordLink = document.getElementById("changePasswordLink");
        if (changePasswordLink) {
            // Remove old listener if exists (prevent duplicates)
            const newLink = changePasswordLink.cloneNode(true);
            changePasswordLink.replaceWith(newLink);
            newLink.addEventListener("click", (e) => {
                e.preventDefault();
                this.showChangePasswordModal();
            });
        }

        const logoutLink = document.getElementById("logoutLink");
        if (logoutLink) {
            // Remove old listener if exists (prevent duplicates)
            const newLink = logoutLink.cloneNode(true);
            logoutLink.replaceWith(newLink);
            newLink.addEventListener("click", (e) => {
                e.preventDefault();
                this.logout();
            });
        }
    }

    /**
     * Show change password modal
     *
     * Creates and displays a Tabler.io modal for changing the user's password.
     * The modal includes three password fields (current, new, confirm) with
     * visibility toggles, inline validation, and API integration.
     *
     * @returns {void}
     *
     * @example
     * authState.showChangePasswordModal();
     * // Displays the change password modal
     */
    showChangePasswordModal() {
        const modalHtml = `
            <div class="modal modal-blur fade show" id="change-password-modal" style="display: block;" tabindex="-1">
                <div class="modal-dialog modal-sm modal-dialog-centered">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">Change Password</h5>
                            <button type="button" class="btn-close" onclick="authState.closeChangePasswordModal()"></button>
                        </div>
                        <div class="modal-body">
                            <form id="change-password-form" onsubmit="authState.handlePasswordChange(event)">
                                <!-- Error Alert (hidden by default) -->
                                <div id="password-error" class="alert alert-danger" style="display: none;"></div>

                                <!-- Success Alert (hidden by default) -->
                                <div id="password-success" class="alert alert-success" style="display: none;">
                                    Password changed successfully!
                                </div>

                                <!-- Current Password Field -->
                                <div class="mb-3">
                                    <label class="form-label">Current Password</label>
                                    <div class="input-group input-group-flat">
                                        <span class="input-group-text">
                                            <i class="fas fa-lock"></i>
                                        </span>
                                        <input
                                            type="password"
                                            id="current-password"
                                            class="form-control"
                                            placeholder="Enter current password"
                                            required
                                            autocomplete="current-password"
                                        >
                                        <span class="input-group-text cursor-pointer" onclick="authState.togglePasswordVisibility('current-password')" title="Toggle password visibility">
                                            <i id="current-password-toggle-icon" class="fas fa-eye"></i>
                                        </span>
                                    </div>
                                </div>

                                <!-- New Password Field -->
                                <div class="mb-3">
                                    <label class="form-label">New Password</label>
                                    <div class="input-group input-group-flat">
                                        <span class="input-group-text">
                                            <i class="fas fa-lock"></i>
                                        </span>
                                        <input
                                            type="password"
                                            id="new-password"
                                            class="form-control"
                                            placeholder="Enter new password"
                                            required
                                            autocomplete="new-password"
                                            minlength="8"
                                        >
                                        <span class="input-group-text cursor-pointer" onclick="authState.togglePasswordVisibility('new-password')" title="Toggle password visibility">
                                            <i id="new-password-toggle-icon" class="fas fa-eye"></i>
                                        </span>
                                    </div>
                                    <small class="form-hint">At least 8 characters</small>
                                </div>

                                <!-- Confirm Password Field -->
                                <div class="mb-3">
                                    <label class="form-label">Confirm New Password</label>
                                    <div class="input-group input-group-flat">
                                        <span class="input-group-text">
                                            <i class="fas fa-lock"></i>
                                        </span>
                                        <input
                                            type="password"
                                            id="confirm-password"
                                            class="form-control"
                                            placeholder="Confirm new password"
                                            required
                                            autocomplete="new-password"
                                        >
                                        <span class="input-group-text cursor-pointer" onclick="authState.togglePasswordVisibility('confirm-password')" title="Toggle password visibility">
                                            <i id="confirm-password-toggle-icon" class="fas fa-eye"></i>
                                        </span>
                                    </div>
                                </div>
                            </form>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn" onclick="authState.closeChangePasswordModal()">Cancel</button>
                            <button type="submit" form="change-password-form" class="btn btn-primary" id="password-submit-btn">
                                Change Password
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            <div class="modal-backdrop fade show"></div>
        `;

        // Inject modal into DOM
        document.body.insertAdjacentHTML("beforeend", modalHtml);
    }

    /**
     * Close and cleanup change password modal
     *
     * Removes the change password modal and backdrop from the DOM,
     * ensuring no memory leaks or DOM remnants.
     *
     * @returns {void}
     *
     * @example
     * authState.closeChangePasswordModal();
     * // Modal and backdrop removed from DOM
     */
    closeChangePasswordModal() {
        const modal = document.getElementById("change-password-modal");
        const backdrop = document.querySelector(".modal-backdrop");

        if (modal) {
            modal.remove();
        }
        if (backdrop) {
            backdrop.remove();
        }
    }

    /**
     * Toggle password field visibility
     *
     * Toggles a password field between masked (password) and visible (text) states,
     * updating the associated eye icon accordingly. Used for current, new, and
     * confirm password fields in the change password modal.
     *
     * @param {string} fieldId - The ID of the password input field to toggle
     * @returns {void}
     *
     * @example
     * authState.togglePasswordVisibility('current-password');
     * // Toggles current password field visibility
     */
    togglePasswordVisibility(fieldId) {
        const passwordField = document.getElementById(fieldId);
        const icon = document.getElementById(`${fieldId}-toggle-icon`);

        if (!passwordField || !icon) {
            logger.warn(`Password field or icon not found for ID: ${fieldId}`);
            return;
        }

        if (passwordField.type === "password") {
            passwordField.type = "text";
            icon.className = "fas fa-eye-slash";
        } else {
            passwordField.type = "password";
            icon.className = "fas fa-eye";
        }
    }

    /**
     * Handle password change form submission
     *
     * Validates password fields, calls the change password API endpoint,
     * and handles success/error responses with appropriate UI feedback.
     * Includes loading state management and auto-close on success.
     *
     * @async
     * @param {Event} event - The form submit event
     * @returns {Promise<void>}
     *
     * @example
     * // Called automatically on form submit
     * authState.handlePasswordChange(event);
     */
    async handlePasswordChange(event) {
        event.preventDefault();

        // Get form values
        const currentPassword = document.getElementById("current-password").value;
        const newPassword = document.getElementById("new-password").value;
        const confirmPassword = document.getElementById("confirm-password").value;

        // Get UI elements
        const errorAlert = document.getElementById("password-error");
        const successAlert = document.getElementById("password-success");
        const submitBtn = document.getElementById("password-submit-btn");

        // Hide previous alerts
        errorAlert.style.display = "none";
        successAlert.style.display = "none";

        // Validate password match
        if (newPassword !== confirmPassword) {
            errorAlert.textContent = "New password and confirmation do not match";
            errorAlert.style.display = "block";
            return;
        }

        try {
            // Set loading state
            submitBtn.disabled = true;
            submitBtn.innerHTML = "<span class=\"spinner-border spinner-border-sm me-2\"></span>Changing...";

            // Call API
            const response = await this.authenticatedFetch("/api/auth/change-password", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    oldPassword: currentPassword, // HEX-133 Task 1.4: Backend expects "oldPassword"
                    newPassword
                })
            });

            const data = await response.json();

            if (response.ok && data.success) {
                // Show success message
                successAlert.style.display = "block";

                // Reset form
                document.getElementById("change-password-form").reset();

                // Auto-close after 2 seconds
                setTimeout(() => {
                    this.closeChangePasswordModal();
                }, 2000);
            } else {
                // Show error message
                errorAlert.textContent = data.error || "Failed to change password";
                errorAlert.style.display = "block";
            }
        } catch (error) {
            // Handle network or other errors
            logger.error("Password change error:", error);
            errorAlert.textContent = error.message || "An error occurred while changing password";
            errorAlert.style.display = "block";
        } finally {
            // Reset button state (only if modal still exists)
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.innerHTML = "Change Password";
            }
        }
    }

    /**
     * Authenticated fetch wrapper with automatic credential management and 401 handling
     *
     * Wrapper around native fetch() that automatically includes credentials and
     * handles 401 Unauthorized responses by redirecting to login. Also provides
     * graceful handling of 5xx server errors.
     *
     * @async
     * @param {string} url - The URL to fetch
     * @param {Object} [options={}] - Fetch options (method, headers, body, etc.)
     * @returns {Promise<Response>} The fetch Response object
     * @throws {Error} When fetch fails or server returns 5xx error
     *
     * @example
     * const response = await authState.authenticatedFetch('/api/vulnerabilities');
     * const data = await response.json();
     */
    async authenticatedFetch(url, options = {}) {
        try {
            // HEX-133: Fetch CSRF token for state-changing requests
            const method = (options.method || "GET").toUpperCase();
            if (["POST", "PUT", "DELETE", "PATCH"].includes(method)) {
                try {
                    const tokenResponse = await fetch("/api/auth/csrf", { credentials: "include" });
                    const tokenData = await tokenResponse.json();
                    if (tokenData.success && tokenData.csrfToken) {
                        options.headers = {
                            ...options.headers,
                            "X-CSRF-Token": tokenData.csrfToken
                        };
                    }
                } catch (csrfError) {
                    logger.warn("Failed to fetch CSRF token:", csrfError);
                    // Continue without CSRF token - let server reject if needed
                }
            }

            // Merge options with credentials
            const fetchOptions = {
                ...options,
                credentials: "include"
            };

            const response = await fetch(url, fetchOptions);

            // Handle 401 Unauthorized
            if (response.status === 401) {
                logger.warn("Received 401 Unauthorized, redirecting to login");
                this.handleUnauthenticated();
                throw new Error("Unauthorized - redirecting to login");
            }

            // Handle 5xx server errors
            if (response.status >= 500) {
                logger.error(`Server error: ${response.status} ${response.statusText}`);
                throw new Error(`Server error: ${response.status} ${response.statusText}`);
            }

            return response;

        } catch (error) {
            // Re-throw error after logging
            logger.error("Authenticated fetch error:", error);
            throw error;
        }
    }
}

// Create global instance
if (typeof window !== "undefined") {
    /**
     * Global authentication state instance
     * @type {AuthState}
     * @global
     */
    window.authState = new AuthState();
    logger.debug("✅ Global authState instance created");
}
