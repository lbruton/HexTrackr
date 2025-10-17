/* eslint-env browser */
 
/* global console, document, window, authState, Blob, URL, FormData, Papa, JSZip, bootstrap, module, alert */

/**
 * Escape HTML characters to prevent XSS attacks
 * @param {string} text - Text to escape
 * @returns {string} Escaped text
 */
function escapeHtml(text) {
    const map = {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        "\"": "&quot;",
        "'": "&#039;"
    };
    return text.replace(/[&<>"']/g, function(m) { return map[m]; });
}

/**
 * HexTrackr - Shared Settings Modal Component
 * 
 * 🎯 SHARED COMPONENT PATTERN
 * 
 * This file contains the unified Settings modal functionality that is shared
 * across all HexTrackr pages, following our CSS modular architecture pattern:
 * 
 * scripts/
 * ├── shared/
 * │   ├── settings-modal.js     # This file - shared Settings modal
 * │   ├── navigation.js         # Shared header/navigation components
 * │   └── toast-notifications.js # Shared notification system
 * ├── pages/
 * │   ├── tickets.js           # Ticket-specific functionality
 * │   └── vulnerabilities.js   # Vulnerability-specific functionality
 * └── utils/
 *     ├── api-client.js        # Shared API utilities
 *     └── data-formatters.js   # Shared formatting utilities
 * 
 * @file settings-modal.js
 * @description Unified Settings modal functionality for all HexTrackr pages
 * @version 2.0.0
 * @author HexTrackr Development Team
 * @since 2025-08-26
 * 
 * Dependencies:
 * - Bootstrap 5 (modals, tabs)
 * - Tabler.io CSS Framework
 * 
 * @example
 * // Include in any page:
 * <script src="scripts/shared/settings-modal.js"></script>
 * 
 * // The modal will automatically initialize and be available
 * // All functions are global and work consistently across pages
 */

// 🚀 HEXTRACKR SETTINGS MODAL - SHARED COMPONENT
logger.debug("ui", "HexTrackr Settings Modal (shared) loaded successfully");

/**
 * Settings Modal State Management
 */
// HexTrackr Shared Settings Modal Component
(function() {
  "use strict";
  
  const SettingsModal = {
    // Initialize the settings modal
    async init() {
      try {
        await this.loadModalHtml();
        this.setupEventListeners();
        initServiceNowSettings(); // Call as standalone function instead of method
        logger.debug("ui", "Settings modal initialized");
      } catch (error) {
        logger.error("ui", "Failed to initialize settings modal:", error);
      }
    },

    // Load the modal HTML from shared file
    async loadModalHtml() {
      try {
    // Use appropriate path based on current location
    // If we're in docs-html directory, use "../scripts/shared/settings-modal.html"
    // Otherwise use "scripts/shared/settings-modal.html"
    const isInDocs = window.location.pathname.includes("/docs-html/") || window.location.pathname.includes("/docs-prototype/");
    const modalPath = isInDocs ? "../scripts/shared/settings-modal.html" : "scripts/shared/settings-modal.html";
    const response = await fetch(modalPath);
        if (!response.ok) {
          throw new Error(`Failed to load settings modal: ${response.status}`);
        }
        
        const modalHtml = await response.text();
        
        // Find the modal container or create one if it doesn't exist
        let modalContainer = document.getElementById("settingsModalContainer");
        if (!modalContainer) {
          modalContainer = document.createElement("div");
          modalContainer.id = "settingsModalContainer";
          document.body.appendChild(modalContainer);
        }
        
        // Inject the modal HTML
        modalContainer.innerHTML = modalHtml;
        
        // Get reference to the modal element for Bootstrap
        this.modal = document.getElementById("settingsModal");
        
        logger.debug("ui", "HexTrackr Settings Modal (shared) loaded successfully");
        
      } catch (error) {
        logger.error("ui", "Failed to load shared settings modal:", error);
        throw error;
      }
    },
    
    /**
     * Setup all event listeners for the Settings modal
     */
    setupEventListeners() {
        // Handle tab switching from dropdown links
        document.addEventListener("click", (e) => {
            const target = e.target.closest("[data-settings-tab]");
            if (target) {
                const tabId = target.getAttribute("data-settings-tab");
                this.switchToTab(tabId);
            }
        });
        
        // Refresh stats when modal is shown
        this.modal.addEventListener("shown.bs.modal", () => {
            // Add theme detection and propagation
            const currentTheme = document.documentElement.getAttribute("data-bs-theme") || "light";
            if (this.modal) {
                this.modal.setAttribute("data-bs-theme", currentTheme);
            }
            refreshStats();
        });
        
        // Cisco credential management
        document.getElementById("manageCiscoCredentials")?.addEventListener("click", openCiscoCredentialsModal);
        document.getElementById("saveCiscoCredentialsBtn")?.addEventListener("click", saveCiscoCredentials);
        document.getElementById("clearCiscoCredentialsBtn")?.addEventListener("click", clearCiscoCredentials);
        document.getElementById("syncCiscoNow")?.addEventListener("click", syncCiscoNow);
        document.getElementById("ciscoAutoSync")?.addEventListener("change", toggleCiscoAutoSync);

        // KEV sync button
        document.getElementById("syncKevNow")?.addEventListener("click", syncKevData);
        document.getElementById("kevAutoSync")?.addEventListener("change", toggleKevAutoSync);

        // Palo Alto sync button (HEX-209)
        document.getElementById("syncPaloNow")?.addEventListener("click", syncPaloNow);
        document.getElementById("paloAutoSync")?.addEventListener("change", togglePaloAutoSync);

        // Load status and settings when modal opens
        const settingsModalElement = document.getElementById("settingsModal");
        if (settingsModalElement) {
            settingsModalElement.addEventListener("shown.bs.modal", loadSettings);
            settingsModalElement.addEventListener("shown.bs.modal", loadKevSyncStatus);
            settingsModalElement.addEventListener("shown.bs.modal", loadCiscoSyncStatus);
            settingsModalElement.addEventListener("shown.bs.modal", loadPaloSyncStatus); // HEX-209
            settingsModalElement.addEventListener("shown.bs.modal", loadTenableImportStatus); // HEX-240
        }
        
        // Settings save button
        document.getElementById("saveSettings")?.addEventListener("click", saveSettings);
        
        // CSV Import buttons
        document.getElementById("importTicketsCSV")?.addEventListener("click", () => importCSV("tickets"));
        document.getElementById("importVulnerabilitiesCSV")?.addEventListener("click", () => importCSV("vulnerabilities"));
        
        // Initialize ServiceNow settings when modal is shown
        this.modal.addEventListener("shown.bs.modal", initServiceNowSettings);

        // Settings section navigation buttons
        const self = this;
        document.querySelectorAll('#settingsSectionButtons .btn').forEach(button => {
            button.addEventListener('click', function() {
                const section = this.getAttribute('data-section');

                // Update active button styling
                document.querySelectorAll('#settingsSectionButtons .btn').forEach(btn => {
                    btn.classList.remove('active', 'btn-primary');
                    btn.classList.add('btn-outline-primary');
                });
                this.classList.remove('btn-outline-primary');
                this.classList.add('active', 'btn-primary');

                // Switch to the selected section
                self.switchToTab(section);
            });
        });

        logger.debug("ui", "Settings modal event listeners configured");
    },
    
    /**
     * Switch to a specific section in the settings modal
     * @param {string} sectionId - The ID of the section to switch to (third-party, data-mgmt, system-config)
     */
    switchToTab(sectionId) {
        // Hide all sections
        const sections = ['thirdPartyContent', 'dataManagementContent', 'systemConfigContent'];
        sections.forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.style.display = 'none';
            }
        });

        // Show requested section
        const sectionMap = {
            'third-party': 'thirdPartyContent',
            'api-config': 'thirdPartyContent', // Legacy support
            'data-mgmt': 'dataManagementContent',
            'data-management': 'dataManagementContent', // Legacy support
            'system-config': 'systemConfigContent'
        };

        const targetSectionId = sectionMap[sectionId];
        if (targetSectionId) {
            const targetSection = document.getElementById(targetSectionId);
            if (targetSection) {
                targetSection.style.display = 'block';

                // Update button active state to match section
                document.querySelectorAll('#settingsSectionButtons .btn').forEach(btn => {
                    const btnSection = btn.getAttribute('data-section');
                    if (btnSection === sectionId || sectionMap[btnSection] === targetSectionId) {
                        btn.classList.remove('btn-outline-primary');
                        btn.classList.add('active', 'btn-primary');
                    } else {
                        btn.classList.remove('active', 'btn-primary');
                        btn.classList.add('btn-outline-primary');
                    }
                });

                logger.debug("ui", ` Switched to ${sectionId} section`);
            } else {
                logger.warn("ui", ` Section ${targetSectionId} not found`);
            }
        } else {
            logger.warn("ui", ` Unknown section ID: ${sectionId}`);
        }
    }
};

/**
 * Refresh database statistics for the Settings modal
 * @returns {Promise<void>}
 */
async function refreshStats() {
    try {
        const response = await authState.authenticatedFetch("/api/backup/stats");
        const stats = await response.json();
        
        // Update counters
        const ticketCountEl = document.getElementById("ticketCount");
        const vulnCountEl = document.getElementById("vulnCount");
        const totalCountEl = document.getElementById("totalCount");
        const dbSizeEl = document.getElementById("dbSize");
        
        if (ticketCountEl) {ticketCountEl.textContent = stats.tickets || 0;}
        if (vulnCountEl) {vulnCountEl.textContent = stats.vulnerabilities || 0;}
        if (totalCountEl) {totalCountEl.textContent = stats.total || 0;}
        
        // Format database size
        if (dbSizeEl) {
            const dbSize = stats.dbSize || 0;
            const sizeStr = dbSize < 1024 ? `${dbSize} B` :
                         dbSize < 1024 * 1024 ? `${(dbSize / 1024).toFixed(1)} KB` :
                         `${(dbSize / (1024 * 1024)).toFixed(1)} MB`;
            dbSizeEl.textContent = sizeStr;
        }
    } catch (error) {
        logger.error("ui", "Error fetching stats:", error);
        showNotification("Error loading statistics", "danger");
    }
}

/**
 * Export data as CSV for specified type
 * @param {string} type - Type of data to export ('tickets', 'vulnerabilities', 'all')
 * @returns {Promise<void>}
 */
async function exportData(type) {
    try {
        let endpoint = "/api/backup/";
        switch(type) {
            case "tickets":
                endpoint += "tickets";
                break;
            case "vulnerabilities":
                endpoint += "vulnerabilities";
                break;
            case "all":
                endpoint += "all";
                break;
            default:
                throw new Error("Invalid export type");
        }
        
        const response = await fetch(endpoint);
        if (response.ok) {
            const data = await response.json();
            
            // Create CSV export based on type
            const timestamp = new Date().toISOString().split("T")[0];
            
            if (type === "all") {
                // Export combined CSV for all data
                await exportCombinedCSV(data, timestamp);
            } else {
                // Export single CSV file
                await exportSingleCSV(data, type, timestamp);
            }
            
        } else {
            throw new Error("Export failed");
        }
    } catch (error) {
        logger.error("ui", "Error creating export:", error);
        showNotification(`Export failed: ${error.message}`, "danger");
    }
}

/**
 * Export single data type as CSV
 */
async function exportSingleCSV(data, type, timestamp) {
    if (!data.data || data.data.length === 0) {
        showNotification(`No ${type} data to export`, "warning");
        return;
    }
    
    // Convert to CSV using Papa Parse
    const csv = Papa.unparse(data.data);
    const filename = `hextrackr_${type}_${timestamp}.csv`;
    
    // Download CSV file
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    downloadFile(blob, filename);
    
    showNotification(`CSV export created: ${filename}`, "success");
}

/**
 * Export all data as combined CSV
 */
async function exportCombinedCSV(data, timestamp) {
    const combinedData = [];
    
    // Add vulnerabilities with type indicator
    if (data.vulnerabilities && data.vulnerabilities.data) {
        data.vulnerabilities.data.forEach(item => {
            combinedData.push({ data_type: "vulnerability", ...item });
        });
    }
    
    // Add tickets with type indicator
    if (data.tickets && data.tickets.data) {
        data.tickets.data.forEach(item => {
            combinedData.push({ data_type: "ticket", ...item });
        });
    }
    
    if (combinedData.length === 0) {
        showNotification("No data to export", "warning");
        return;
    }
    
    const csv = Papa.unparse(combinedData);
    const filename = `hextrackr_all_data_${timestamp}.csv`;
    
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    downloadFile(blob, filename);
    
    showNotification(`Combined CSV export created: ${filename}`, "success");
}

/**
 * Utility function to download a file
 * @param {Blob} blob - File blob to download
 * @param {string} filename - Name of the file
 */
function downloadFile(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

/**
 * Create ZIP backup of specified data type with JSON content
 * @param {string} type - Type of data to backup
 * @returns {Promise<void>}
 */
async function backupData(type) {
    try {
        const zip = new JSZip();
        const timestamp = new Date().toISOString().split("T")[0];
        
        // Create metadata
        const metadata = {
            backup_type: type,
            created_at: new Date().toISOString(),
            schema_version: "1.0",
            application: "HexTrackr",
            version: "2.3"
        };
        
        if (type === "all") {
            // Fetch all data types
            const [ticketsRes, vulnsRes, statsRes] = await Promise.all([
                authState.authenticatedFetch("/api/backup/tickets"),
                authState.authenticatedFetch("/api/backup/vulnerabilities"),
                authState.authenticatedFetch("/api/backup/stats")
            ]);
            
            if (ticketsRes.ok && vulnsRes.ok && statsRes.ok) {
                const ticketsData = await ticketsRes.json();
                const vulnsData = await vulnsRes.json();
                const statsData = await statsRes.json();
                
                // Add files to ZIP
                zip.file("tickets.json", JSON.stringify(ticketsData, null, 2));
                zip.file("vulnerabilities.json", JSON.stringify(vulnsData, null, 2));
                zip.file("statistics.json", JSON.stringify(statsData, null, 2));
                zip.file("metadata.json", JSON.stringify(metadata, null, 2));
                
                metadata.contents = {
                    tickets: ticketsData.count || 0,
                    vulnerabilities: vulnsData.count || 0,
                    total_records: (ticketsData.count || 0) + (vulnsData.count || 0)
                };
            }
        } else {
            // Single data type backup
            const response = await authState.authenticatedFetch(`/api/backup/${type}`);
            if (response.ok) {
                const data = await response.json();
                zip.file(`${type}.json`, JSON.stringify(data, null, 2));
                metadata.contents = { [type]: data.count || 0 };
            } else {
                throw new Error(`Failed to fetch ${type} data`);
            }
        }
        
        // Update metadata and add to ZIP
        zip.file("metadata.json", JSON.stringify(metadata, null, 2));
        
        // Generate ZIP file
        const zipBlob = await zip.generateAsync({ type: "blob" });
        
        // Create download
        const filename = `hextrackr_backup_${type}_${timestamp}.zip`;
        const url = URL.createObjectURL(zipBlob);
        
        const a = document.createElement("a");
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        showNotification(`ZIP backup created: ${filename}`, "success");
        
    } catch (error) {
        logger.error("ui", "Error creating ZIP backup:", error);
        showNotification(`ZIP backup failed: ${error.message}`, "danger");
    }
}

/**
 * Import data from file
 * @param {string} type - Type of data to import ('tickets', 'vulnerabilities', 'all')
 * @returns {Promise<void>}
 */
async function importData(type) {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json,.csv";
    
    input.onchange = async function(event) {
        const file = event.target.files[0];
        if (!file) {return;}
        
        try {
            const formData = new FormData();
            formData.append("file", file);
            formData.append("type", type);
            
            const response = await authState.authenticatedFetch("/api/import", {
                method: "POST",
                body: formData
            });
            
            if (response.ok) {
                const result = await response.json();
                showNotification(`Import successful: ${result.message}`, "success");
                await refreshStats();
                
                // Trigger page-specific refresh if available
                if (window.refreshPageData) {
                    window.refreshPageData(type);
                }
            } else {
                const error = await response.json();
                throw new Error(error.message || "Import failed");
            }
        } catch (error) {
            logger.error("ui", "Error importing data:", error);
            showNotification(`Import failed: ${error.message}`, "danger");
        }
    };
    
    input.click();
}

/**
 * Clear specified data type with confirmation
 * @param {string} type - Type of data to clear ('tickets', 'vulnerabilities', 'all')
 * @returns {Promise<void>}
 */
async function clearData(type) {
    const confirmText = type.toUpperCase();
    const confirmed = await showClearConfirmationModal(type, confirmText);
    
    if (!confirmed) {return;}
    
    try {
        const response = await authState.authenticatedFetch(`/api/backup/clear/${type}`, {
            method: "DELETE"
        });

        if (response.ok) {
            const result = await response.json();
            showNotification(result.message, "success");
            
            // Clear client-side cache metadata
            sessionStorage.removeItem("hextrackr_cache_metadata");
            sessionStorage.removeItem("hextrackr_last_load");

            // Refresh statistics
            await refreshStats();

            // Trigger page-specific refresh if available (always bust cache)
            if (window.refreshPageData) {
                window.refreshPageData(type, true);
            }
        } else {
            throw new Error("Clear operation failed");
        }
    } catch (error) {
        logger.error("ui", "Error clearing data:", error);
        showNotification(`Error clearing data: ${error.message}`, "danger");
    }
}

/**
 * Show confirmation modal for data clearing
 * @param {string} type - Type of data being cleared
 * @param {string} confirmText - Text that must be typed to confirm
 * @returns {Promise<boolean>} True if confirmed, false otherwise
 */
function showClearConfirmationModal(type, confirmText) {
    return new Promise((resolve) => {
        const modal = document.createElement("div");
        modal.className = "modal fade";
        
        // Escape potentially unsafe input parameters
        const safeType = escapeHtml(type);
        const safeConfirmText = escapeHtml(confirmText);
        
        modal.innerHTML = `
            <div class="modal-dialog modal-dialog-centered">
                <div class="modal-content">
                    <div class="modal-header bg-danger text-white">
                        <h5 class="modal-title">
                            <i class="fas fa-exclamation-triangle me-2"></i>
                            Confirm Clear ${safeType.charAt(0).toUpperCase() + safeType.slice(1)}
                        </h5>
                        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <div class="alert alert-danger">
                            <strong>Warning:</strong> This action cannot be undone. All ${safeType} data will be permanently deleted.
                        </div>
                        <p>To confirm, type <strong>${safeConfirmText}</strong> in the field below:</p>
                        <input type="text" class="form-control" id="confirmInput" placeholder="Type ${safeConfirmText} to confirm">
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                        <button type="button" class="btn btn-danger" id="confirmBtn" disabled>Clear Data</button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        const bsModal = new bootstrap.Modal(modal);
        const confirmInput = modal.querySelector("#confirmInput");
        const confirmBtn = modal.querySelector("#confirmBtn");
        
        confirmInput.addEventListener("input", () => {
            if (confirmInput.value === confirmText) {
                confirmBtn.disabled = false;
                confirmBtn.classList.remove("disabled");
            } else {
                confirmBtn.disabled = true;
                confirmBtn.classList.add("disabled");
            }
        });
        
        confirmBtn.addEventListener("click", () => {
            if (confirmInput.value === confirmText) {
                bsModal.hide();
                resolve(true);
            }
        });
        
        modal.addEventListener("hidden.bs.modal", () => {
            document.body.removeChild(modal);
            resolve(false);
        });
        
        bsModal.show();
        confirmInput.focus();
    });
}

// ========================================
// HEX-141: Cisco PSIRT Advisory Sync Functions
// ========================================

/**
 * Open the Cisco credentials management modal
 * @async
 * @function openCiscoCredentialsModal
 * @returns {Promise<void>}
 */
async function openCiscoCredentialsModal() {
    try {
        // Clear form fields (both are masked, so user must enter fresh)
        const clientIdInput = document.getElementById("ciscoClientIdInput");
        const clientSecretInput = document.getElementById("ciscoClientSecretInput");

        if (clientIdInput) {
            clientIdInput.value = "";
        }
        if (clientSecretInput) {
            clientSecretInput.value = "";
        }

        // Show the modal
        const credentialsModal = new bootstrap.Modal(document.getElementById("ciscoCredentialsModal"));
        credentialsModal.show();
    } catch (error) {
        logger.error("ui", "Error opening Cisco credentials modal:", error);
        showNotification("Failed to open credentials modal", "error");
    }
}

/**
 * Save Cisco PSIRT credentials to database
 * @async
 * @function saveCiscoCredentials
 * @returns {Promise<void>}
 */
async function saveCiscoCredentials() {
    const clientIdInput = document.getElementById("ciscoClientIdInput");
    const clientSecretInput = document.getElementById("ciscoClientSecretInput");
    const saveButton = document.getElementById("saveCiscoCredentialsBtn");

    const clientId = clientIdInput?.value?.trim() || "";
    const clientSecret = clientSecretInput?.value?.trim() || "";

    // Validation - both fields required
    if (!clientId) {
        showNotification("Please enter a Client ID", "warning");
        clientIdInput?.focus();
        return;
    }

    if (!clientSecret) {
        showNotification("Please enter a Client Secret", "warning");
        clientSecretInput?.focus();
        return;
    }

    // Disable save button during save
    if (saveButton) {
        saveButton.disabled = true;
        saveButton.innerHTML = "<i class=\"fas fa-spinner fa-spin me-2\"></i>Saving...";
    }

    try {
        const ciscoApiKey = `${clientId}:${clientSecret}`;

        if (window.preferencesSync) {
            await window.preferencesSync.syncCiscoCredentials(ciscoApiKey);
            logger.debug("ui", "🔒 Cisco credentials saved to database");

            // Update status in main settings card
            const credentialButton = document.getElementById("manageCiscoCredentials");
            const credentialButtonText = document.getElementById("ciscoCredentialButtonText");
            if (credentialButton && credentialButtonText) {
                credentialButton.className = "btn btn-outline-success";
                credentialButton.innerHTML = '<i class="fas fa-check me-2"></i><span id="ciscoCredentialButtonText">Credentials Configured</span>';
            }

            // Enable sync button
            const syncButton = document.getElementById("syncCiscoNow");
            if (syncButton) {
                syncButton.disabled = false;
            }

            showNotification("Cisco credentials saved securely", "success");

            // Close modal
            const credentialsModal = bootstrap.Modal.getInstance(document.getElementById("ciscoCredentialsModal"));
            if (credentialsModal) {
                credentialsModal.hide();
            }

            // Clear form
            if (clientIdInput) {clientIdInput.value = "";}
            if (clientSecretInput) {clientSecretInput.value = "";}
        } else {
            throw new Error("PreferencesSync not available");
        }
    } catch (error) {
        logger.error("ui", "Failed to save Cisco credentials:", error);
        showNotification("Failed to save credentials: " + error.message, "error");
    } finally {
        // Re-enable save button
        if (saveButton) {
            saveButton.disabled = false;
            saveButton.innerHTML = "<i class=\"fas fa-save me-2\"></i>Save Credentials";
        }
    }
}

/**
 * Clear Cisco PSIRT credentials from database
 * @async
 * @function clearCiscoCredentials
 * @returns {Promise<void>}
 */
async function clearCiscoCredentials() {
    if (!confirm("Are you sure you want to delete your Cisco PSIRT API credentials? This action cannot be undone.")) {
        return;
    }

    const clearButton = document.getElementById("clearCiscoCredentialsBtn");

    // Disable button during clear
    if (clearButton) {
        clearButton.disabled = true;
        clearButton.innerHTML = "<i class=\"fas fa-spinner fa-spin me-2\"></i>Clearing...";
    }

    try {
        if (window.preferencesSync && window.preferencesSync.prefsService) {
            const result = await window.preferencesSync.prefsService.deletePreference("cisco_api_key");

            if (result.success) {
                logger.debug("ui", "Cisco credentials deleted from database");

                // Update status in main settings card
                const credentialButton = document.getElementById("manageCiscoCredentials");
                const credentialButtonText = document.getElementById("ciscoCredentialButtonText");
                if (credentialButton && credentialButtonText) {
                    credentialButton.className = "btn btn-outline-primary";
                    credentialButton.innerHTML = '<i class="fas fa-key me-2"></i><span id="ciscoCredentialButtonText">Manage Credentials</span>';
                }

                // Disable sync button
                const syncButton = document.getElementById("syncCiscoNow");
                if (syncButton) {
                    syncButton.disabled = true;
                }

                showNotification("Cisco credentials cleared", "info");

                // Close modal
                const credentialsModal = bootstrap.Modal.getInstance(document.getElementById("ciscoCredentialsModal"));
                if (credentialsModal) {
                    credentialsModal.hide();
                }
            } else {
                throw new Error(result.error || "Failed to delete credentials");
            }
        } else {
            throw new Error("PreferencesSync not available");
        }
    } catch (error) {
        logger.error("ui", "Failed to clear Cisco credentials:", error);
        showNotification("Failed to clear credentials: " + error.message, "error");
    } finally {
        // Re-enable button
        if (clearButton) {
            clearButton.disabled = false;
            clearButton.innerHTML = "<i class=\"fas fa-trash me-2\"></i>Clear Credentials";
        }
    }
}

/**
 * Load Cisco sync status from API
 * @async
 * @function loadCiscoSyncStatus
 * @returns {Promise<void>}
 */
async function loadCiscoSyncStatus() {
    try {
        // Load background sync setting from database (HEX-141)
        const autoSyncCheckbox = document.getElementById("ciscoAutoSync");
        if (window.preferencesService && autoSyncCheckbox) {
            const bgSyncResult = await window.preferencesService.getPreference("cisco_background_sync_enabled");
            // Default to enabled (true) if preference doesn't exist yet
            // Handle both string "true" and boolean true (JSON parsing converts string to boolean)
            const isEnabled = bgSyncResult.success && bgSyncResult.data
                ? (bgSyncResult.data.value === "true" || bgSyncResult.data.value === true)
                : true; // Default enabled
            autoSyncCheckbox.checked = isEnabled;
        }

        // Check if credentials are configured
        if (window.preferencesService) {
            const result = await window.preferencesService.getPreference("cisco_api_key");
            const credentialButton = document.getElementById("manageCiscoCredentials");
            const credentialButtonText = document.getElementById("ciscoCredentialButtonText");
            const syncButton = document.getElementById("syncCiscoNow");

            if (result.success && result.data && result.data.value) {
                // Credentials exist
                if (credentialButton && credentialButtonText) {
                    credentialButton.className = "btn btn-outline-success";
                    credentialButton.innerHTML = '<i class="fas fa-check me-2"></i><span id="ciscoCredentialButtonText">Credentials Configured</span>';
                }
                if (syncButton) {
                    syncButton.disabled = false;
                }
            } else {
                // No credentials
                if (credentialButton && credentialButtonText) {
                    credentialButton.className = "btn btn-outline-primary";
                    credentialButton.innerHTML = '<i class="fas fa-key me-2"></i><span id="ciscoCredentialButtonText">Manage Credentials</span>';
                }
                if (syncButton) {
                    syncButton.disabled = true;
                }
            }
        }

        // Fetch sync status from API (HEX-141 Phase 2)
        const statusResponse = await fetch("/api/cisco/status");
        if (statusResponse.ok) {
            const statusData = await statusResponse.json();

            // Update last sync time
            const lastSyncElement = document.getElementById("ciscoLastSync");
            if (lastSyncElement) {
                if (statusData.lastSync) {
                    const syncDate = new Date(statusData.lastSync);
                    lastSyncElement.textContent = syncDate.toLocaleString();
                } else {
                    lastSyncElement.textContent = "Never synced";
                }
            }

            // Update statistics
            const totalCvesElement = document.getElementById("ciscoTotalCves");
            if (totalCvesElement) {
                totalCvesElement.textContent = statusData.totalCiscoCves || 0;
            }

            const syncedCountElement = document.getElementById("ciscoSyncedCount");
            if (syncedCountElement) {
                syncedCountElement.textContent = statusData.totalAdvisories || 0;
            }

            const matchedCountElement = document.getElementById("ciscoMatchedCount");
            if (matchedCountElement) {
                matchedCountElement.textContent = statusData.matchedCount || 0;
            }

            // Update status badge
            const statusBadge = document.getElementById("ciscoStatus");
            if (statusBadge) {
                if (statusData.syncInProgress) {
                    statusBadge.textContent = "Syncing";
                    statusBadge.className = "badge bg-warning";
                } else if (statusData.lastSync) {
                    statusBadge.textContent = "Synced";
                    statusBadge.className = "badge bg-success";
                } else {
                    statusBadge.textContent = "Not Synced";
                    statusBadge.className = "badge bg-secondary";
                }
            }
        }
    } catch (error) {
        logger.error("ui", "Error loading Cisco sync status:", error);
    }
}

/**
 * Sync Cisco PSIRT advisories manually
 * @async
 * @function syncCiscoNow
 * @returns {Promise<void>}
 */
async function syncCiscoNow() {
    const syncButton = document.getElementById("syncCiscoNow");
    const statusBadge = document.getElementById("ciscoStatus");

    // Disable button and show loading state
    if (syncButton) {
        syncButton.disabled = true;
        syncButton.innerHTML = "<i class=\"fas fa-spinner fa-spin me-2\"></i>Syncing...";
    }

    if (statusBadge) {
        statusBadge.textContent = "Syncing";
        statusBadge.className = "badge bg-warning";
    }

    try {
        // Call Cisco advisory sync API (HEX-141 Phase 2)
        // Use authState.authenticatedFetch to include CSRF token
        const response = await authState.authenticatedFetch("/api/cisco/sync", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            }
        });

        const result = await response.json();

        if (response.ok && result.success) {
            // Update status badge
            if (statusBadge) {
                statusBadge.textContent = "Synced";
                statusBadge.className = "badge bg-success";
            }

            // Update statistics
            const totalCvesElement = document.getElementById("ciscoTotalCves");
            if (totalCvesElement && result.totalCiscoCves !== undefined) {
                totalCvesElement.textContent = result.totalCiscoCves;
            }

            const syncedCountElement = document.getElementById("ciscoSyncedCount");
            if (syncedCountElement && result.totalAdvisories !== undefined) {
                syncedCountElement.textContent = result.totalAdvisories;
            }

            const matchedCountElement = document.getElementById("ciscoMatchedCount");
            if (matchedCountElement && result.matchedCount !== undefined) {
                matchedCountElement.textContent = result.matchedCount;
            }

            // Update last sync time
            const lastSyncElement = document.getElementById("ciscoLastSync");
            if (lastSyncElement && result.lastSync) {
                const syncDate = new Date(result.lastSync);
                lastSyncElement.textContent = syncDate.toLocaleString();
            }

            showNotification(`Cisco advisory sync completed: ${result.totalAdvisories} CVEs matched, ${result.matchedCount} with fixed versions`, "success");
        } else {
            throw new Error(result.message || result.error || "Unknown sync error");
        }
    } catch (error) {
        logger.error("ui", "Cisco sync error:", error);
        showNotification("Failed to sync Cisco advisories: " + error.message, "error");

        if (statusBadge) {
            statusBadge.textContent = "Sync Failed";
            statusBadge.className = "badge bg-danger";
        }
    } finally {
        // Re-enable button
        if (syncButton) {
            syncButton.disabled = false;
            syncButton.innerHTML = "<i class=\"fas fa-sync me-2\"></i>Sync Now";
        }
    }
}

/**
 * Toggle Cisco background sync setting (HEX-141)
 * Saves preference to database for server-side background worker
 * @async
 * @function toggleCiscoAutoSync
 * @returns {Promise<void>}
 */
async function toggleCiscoAutoSync() {
    const autoSyncCheckbox = document.getElementById("ciscoAutoSync");
    if (!autoSyncCheckbox) {return;}

    try {
        const isEnabled = autoSyncCheckbox.checked;

        // Save to database for server-side background worker
        if (window.preferencesSync && window.preferencesSync.prefsService) {
            const result = await window.preferencesSync.prefsService.setPreference(
                "cisco_background_sync_enabled",
                isEnabled.toString() // Store as string "true"/"false"
            );

            if (result.success) {
                logger.debug("ui", ` Cisco background sync ${isEnabled ? "enabled" : "disabled"}`);
                showNotification(`Background sync ${isEnabled ? "enabled" : "disabled"}`, "success");
            } else {
                throw new Error(result.error || "Failed to save preference");
            }
        } else {
            throw new Error("PreferencesService not available");
        }
    } catch (error) {
        logger.error("ui", "Failed to toggle Cisco background sync:", error);
        showNotification("Failed to update background sync setting: " + error.message, "error");
        // Revert checkbox on error
        if (autoSyncCheckbox) {
            autoSyncCheckbox.checked = !autoSyncCheckbox.checked;
        }
    }
}

/**
 * Sync CISA KEV data
 * @async
 * @function syncKevData
 * @returns {Promise<void>}
 */
async function syncKevData() {
    const syncButton = document.getElementById("syncKevNow");
    const statusBadge = document.getElementById("kevStatus");

    // Disable button and show loading state
    if (syncButton) {
        syncButton.disabled = true;
        syncButton.innerHTML = "<i class=\"fas fa-spinner fa-spin me-2\"></i>Syncing...";
    }

    if (statusBadge) {
        statusBadge.textContent = "Syncing";
        statusBadge.className = "badge bg-warning";
    }

    try {
        const response = await authState.authenticatedFetch("/api/kev/sync", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            }
        });

        if (!response.ok) {
            throw new Error(`Sync failed: ${response.statusText}`);
        }

        const result = await response.json();

        // Update UI with sync results
        updateKevSyncStatus(result);
        showNotification(`KEV sync completed: ${result.totalKevs} total KEVs, ${result.matchedCount} matched in your environment`, "success");

    } catch (error) {
        logger.error("ui", "KEV sync error:", error);
        showNotification("Failed to sync KEV data: " + error.message, "error");

        if (statusBadge) {
            statusBadge.textContent = "Sync Failed";
            statusBadge.className = "badge bg-danger";
        }
    } finally {
        // Re-enable button
        if (syncButton) {
            syncButton.disabled = false;
            syncButton.innerHTML = "<i class=\"fas fa-sync me-2\"></i>Sync Now";
        }
    }
}

/**
 * Toggle KEV auto-sync setting
 * @async
 * @function toggleKevAutoSync
 * @returns {Promise<void>}
 */
async function toggleKevAutoSync() {
    const autoSyncCheckbox = document.getElementById("kevAutoSync");
    if (!autoSyncCheckbox) {return;}

    try {
        // Save to Preferences API (removed localStorage)
        if (window.preferencesService) {
            const result = await window.preferencesService.setPreference(
                "kev_auto_sync_enabled",
                autoSyncCheckbox.checked.toString()
            );

            if (result.success) {
                showNotification(`KEV auto-sync ${autoSyncCheckbox.checked ? "enabled" : "disabled"}`, "info");
            } else {
                throw new Error(result.error || "Failed to save preference");
            }
        } else {
            throw new Error("PreferencesService not available");
        }
    } catch (error) {
        logger.error("ui", "Failed to toggle KEV auto-sync:", error);
        showNotification("Failed to update KEV auto-sync setting", "error");
        // Revert checkbox on error
        autoSyncCheckbox.checked = !autoSyncCheckbox.checked;
    }
}

/**
 * Update KEV sync status in UI
 * @function updateKevSyncStatus
 * @param {Object} status - Status object from server
 * @returns {void}
 */
function updateKevSyncStatus(status) {
    // Update last sync time
    const lastSyncElement = document.getElementById("kevLastSync");
    if (lastSyncElement && status.lastSync) {
        const syncDate = new Date(status.lastSync);
        lastSyncElement.textContent = syncDate.toLocaleString();
    }

    // Update statistics
    const totalCountElement = document.getElementById("kevTotalCount");
    if (totalCountElement && status.totalKevs !== undefined) {
        totalCountElement.textContent = status.totalKevs;
    }

    const matchedCountElement = document.getElementById("kevMatchedCount");
    if (matchedCountElement && status.matchedCount !== undefined) {
        matchedCountElement.textContent = status.matchedCount;
    }

    // Update status badge
    const statusBadge = document.getElementById("kevStatus");
    if (statusBadge) {
        statusBadge.textContent = "Synced";
        statusBadge.className = "badge bg-success";
    }

    // Store last sync time to preferences API (removed localStorage)
    if (window.preferencesService && status.lastSync) {
        window.preferencesService.setPreference("kev_last_sync", status.lastSync)
            .catch(err => logger.warn("ui", "Failed to save KEV last sync time:", err));
    }
}

/**
 * Load KEV sync status on modal open
 * @async
 * @function loadKevSyncStatus
 * @returns {Promise<void>}
 */
async function loadKevSyncStatus() {
    try {
        // Load settings from Preferences API (migrated from localStorage)
        if (window.preferencesService) {
            const result = await window.preferencesService.getAllPreferences();

            if (result.success && result.data) {
                const prefsMap = {};
                result.data.preferences.forEach(pref => {
                    prefsMap[pref.key] = pref.value;
                });

                // Load auto-sync setting (default to true if not set)
                const autoSyncCheckbox = document.getElementById("kevAutoSync");
                if (autoSyncCheckbox) {
                    const autoSyncEnabled = prefsMap.kev_auto_sync_enabled === "true" ||
                                          prefsMap.kev_auto_sync_enabled === true ||
                                          prefsMap.kev_auto_sync_enabled === undefined; // Default true
                    autoSyncCheckbox.checked = autoSyncEnabled;
                }

                // Load last sync time
                const lastSync = prefsMap.kev_last_sync;
                if (lastSync) {
                    const lastSyncElement = document.getElementById("kevLastSync");
                    if (lastSyncElement) {
                        const syncDate = new Date(lastSync);
                        lastSyncElement.textContent = syncDate.toLocaleString();
                    }
                }
            }
        }

        // Fetch current status from server
        const response = await authState.authenticatedFetch("/api/kev/status");
        if (response.ok) {
            const status = await response.json();
            updateKevSyncStatus(status);
        }
    } catch (error) {
        logger.error("ui", "Error loading KEV status:", error);
    }
}

/**
 * Sync Palo Alto Security Advisory data
 * @async
 * @function syncPaloNow
 * @returns {Promise<void>}
 */
async function syncPaloNow() {
    const syncButton = document.getElementById("syncPaloNow");
    const statusBadge = document.getElementById("paloStatus");

    // Disable button and show loading state
    if (syncButton) {
        syncButton.disabled = true;
        syncButton.innerHTML = "<i class=\"fas fa-spinner fa-spin me-2\"></i>Syncing...";
    }

    if (statusBadge) {
        statusBadge.textContent = "Syncing";
        statusBadge.className = "badge bg-warning";
    }

    try {
        const response = await authState.authenticatedFetch("/api/palo/sync", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            }
        });

        if (!response.ok) {
            throw new Error(`Sync failed: ${response.statusText}`);
        }

        const result = await response.json();

        // Update UI with sync results
        updatePaloSyncStatus(result);
        showNotification(`Palo Alto sync completed: ${result.totalAdvisories} advisories, ${result.matchedCount} with fixed versions`, "success");

    } catch (error) {
        logger.error("ui", "Palo Alto sync error:", error);
        showNotification("Failed to sync Palo Alto advisories: " + error.message, "error");

        if (statusBadge) {
            statusBadge.textContent = "Sync Failed";
            statusBadge.className = "badge bg-danger";
        }
    } finally {
        // Re-enable button
        if (syncButton) {
            syncButton.disabled = false;
            syncButton.innerHTML = "<i class=\"fas fa-sync me-2\"></i>Sync Now";
        }
    }
}

/**
 * Toggle Palo Alto auto-sync setting
 * @async
 * @function togglePaloAutoSync
 * @returns {Promise<void>}
 */
async function togglePaloAutoSync() {
    const autoSyncCheckbox = document.getElementById("paloAutoSync");
    if (!autoSyncCheckbox) {return;}

    try {
        // Save to Preferences API
        if (window.preferencesService) {
            const result = await window.preferencesService.setPreference(
                "palo_background_sync_enabled",
                autoSyncCheckbox.checked.toString()
            );

            if (result.success) {
                showNotification(`Palo Alto auto-sync ${autoSyncCheckbox.checked ? "enabled" : "disabled"}`, "info");
            } else {
                throw new Error(result.error || "Failed to save preference");
            }
        } else {
            throw new Error("PreferencesService not available");
        }
    } catch (error) {
        logger.error("ui", "Failed to toggle Palo Alto auto-sync:", error);
        showNotification("Failed to update Palo Alto auto-sync setting", "error");
        // Revert checkbox on error
        autoSyncCheckbox.checked = !autoSyncCheckbox.checked;
    }
}

/**
 * Update Palo Alto sync status in UI
 * @function updatePaloSyncStatus
 * @param {Object} status - Status object from server
 * @returns {void}
 */
function updatePaloSyncStatus(status) {
    // Update last sync time
    const lastSyncElement = document.getElementById("paloLastSync");
    if (lastSyncElement && status.lastSync) {
        const syncDate = new Date(status.lastSync);
        lastSyncElement.textContent = syncDate.toLocaleString();
    }

    // Update statistics
    const totalCvesElement = document.getElementById("paloTotalCves");
    if (totalCvesElement && status.totalPaloCves !== undefined) {
        totalCvesElement.textContent = status.totalPaloCves;
    }

    const syncedCountElement = document.getElementById("paloSyncedCount");
    if (syncedCountElement && status.totalAdvisories !== undefined) {
        syncedCountElement.textContent = status.totalAdvisories;
    }

    const matchedCountElement = document.getElementById("paloMatchedCount");
    if (matchedCountElement && status.matchedCount !== undefined) {
        matchedCountElement.textContent = status.matchedCount;
    }

    // Update status badge
    const statusBadge = document.getElementById("paloStatus");
    if (statusBadge) {
        statusBadge.textContent = "Synced";
        statusBadge.className = "badge bg-success";
    }

    // Store last sync time to preferences API
    if (window.preferencesService && status.lastSync) {
        window.preferencesService.setPreference("palo_last_sync", status.lastSync)
            .catch(err => logger.warn("ui", "Failed to save Palo Alto last sync time:", err));
    }
}

/**
 * Load Palo Alto sync status on modal open
 * @async
 * @function loadPaloSyncStatus
 * @returns {Promise<void>}
 */
async function loadPaloSyncStatus() {
    try {
        // Load settings from Preferences API
        if (window.preferencesService) {
            const result = await window.preferencesService.getAllPreferences();

            if (result.success && result.data) {
                const prefsMap = {};
                result.data.preferences.forEach(pref => {
                    prefsMap[pref.key] = pref.value;
                });

                // Load auto-sync setting (default to true if not set)
                const autoSyncCheckbox = document.getElementById("paloAutoSync");
                if (autoSyncCheckbox) {
                    const autoSyncEnabled = prefsMap.palo_background_sync_enabled === "true" ||
                                          prefsMap.palo_background_sync_enabled === true ||
                                          prefsMap.palo_background_sync_enabled === undefined; // Default true
                    autoSyncCheckbox.checked = autoSyncEnabled;
                }

                // Load last sync time
                const lastSync = prefsMap.palo_last_sync;
                if (lastSync) {
                    const lastSyncElement = document.getElementById("paloLastSync");
                    if (lastSyncElement) {
                        const syncDate = new Date(lastSync);
                        lastSyncElement.textContent = syncDate.toLocaleString();
                    }
                }
            }
        }

        // Fetch current status from server
        const response = await authState.authenticatedFetch("/api/palo/status");
        if (response.ok) {
            const status = await response.json();
            updatePaloSyncStatus(status);
        }
    } catch (error) {
        logger.error("ui", "Error loading Palo Alto status:", error);
    }
}

/**
 * Load Tenable last import date on modal open (HEX-240)
 * @async
 * @function loadTenableImportStatus
 * @returns {Promise<void>}
 */
async function loadTenableImportStatus() {
    try {
        // Fetch last import date and statistics from backend
        const response = await authState.authenticatedFetch("/api/vulnerabilities/last-import");
        if (response.ok) {
            const data = await response.json();

            // Update last import date
            if (data.lastImport) {
                const lastImportElement = document.getElementById("tenableLastImport");
                if (lastImportElement) {
                    const importDate = new Date(data.lastImport);
                    lastImportElement.textContent = importDate.toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric"
                    });
                }
            }

            // Update CSV vulnerabilities count
            if (data.rowCount !== undefined) {
                const csvVulnsElement = document.getElementById("tenableCsvVulns");
                if (csvVulnsElement) {
                    csvVulnsElement.textContent = data.rowCount.toLocaleString();
                }
            }
        }
    } catch (error) {
        logger.error("ui", "Error loading Tenable import status:", error);
    }
}

/**
 * Load Settings modal configuration from Preferences API
 * Migrated from localStorage (HEX-138)
 * @returns {Promise<void>}
 */
async function loadSettings() {
    try {
        if (!window.preferencesService) {
            logger.warn("ui", "PreferencesService not available, using defaults");
            return;
        }

        // Get all preferences
        const result = await window.preferencesService.getAllPreferences();

        if (result.success && result.data && result.data.preferences) {
            const prefs = result.data.preferences;

            // Convert array to object for easier lookup
            const prefsMap = {};
            prefs.forEach(pref => {
                prefsMap[pref.key] = pref.value;
            });

            // Load API Configuration
            const apiEndpoint = document.getElementById("apiEndpoint");
            if (apiEndpoint && prefsMap.api_endpoint) {
                apiEndpoint.value = prefsMap.api_endpoint;
            }

            const refreshInterval = document.getElementById("refreshInterval");
            if (refreshInterval && prefsMap.api_refresh_interval) {
                refreshInterval.value = prefsMap.api_refresh_interval;
            }

            const apiKey = document.getElementById("apiKey");
            if (apiKey && prefsMap.api_key) {
                apiKey.value = prefsMap.api_key;
            }

            const enableApiAuth = document.getElementById("enableApiAuth");
            if (enableApiAuth && prefsMap.api_auth_enabled !== undefined) {
                enableApiAuth.checked = prefsMap.api_auth_enabled === true || prefsMap.api_auth_enabled === "true";
            }

            logger.debug("ui", "Settings loaded from preferences API");
        }
    } catch (error) {
        logger.error("ui", "Error loading settings:", error);
        // Fail silently - use default values
    }
}

/**
 * Save Settings modal configuration
 * Migrated to Preferences API for cross-device sync (HEX-138)
 * @returns {Promise<void>}
 */
async function saveSettings() {
    try {
        // HEX-141: Cisco credentials now managed via separate modal (see openCiscoCredentialsModal)

        // Collect all settings from the modal
        const settings = {
            // API Configuration (prefixed for clarity)
            api_endpoint: document.getElementById("apiEndpoint")?.value || "",
            api_refresh_interval: parseInt(document.getElementById("refreshInterval")?.value, 10) || 30,
            api_key: document.getElementById("apiKey")?.value || "",
            api_auth_enabled: document.getElementById("enableApiAuth")?.checked || false,

            // ServiceNow Configuration (handled separately - kept for backward compat)
            servicenow_enabled: document.getElementById("serviceNowEnabled")?.checked || false,
            servicenow_instance_url: document.getElementById("serviceNowInstance")?.value || "",

            // Metadata
            settings_last_saved: new Date().toISOString()
        };

        // Save to Preferences API (replaces localStorage + broken /api/settings POST)
        if (window.preferencesService) {
            const result = await window.preferencesService.setMultiplePreferences(settings);

            if (result.success) {
                logger.debug("ui", "Settings saved to database successfully");
            } else {
                throw new Error(result.error || "Failed to save settings");
            }
        } else {
            throw new Error("PreferencesService not available");
        }

        // Update ServiceNow integration status
        updateServiceNowStatus();

        // Show success notification
        showNotification("Settings saved successfully!", "success");
        
        // Close the modal
        const settingsModal = bootstrap.Modal.getInstance(document.getElementById("settingsModal"));
        if (settingsModal) {
            settingsModal.hide();
        }
        
        // Refresh page data if there are any refresh hooks
        if (window.refreshPageData) {
            window.refreshPageData("settings");
        }
        
    } catch (error) {
        logger.error("ui", "Error saving settings:", error);
        showNotification("Error saving settings. Please try again.", "danger");
    }
}

/**
 * Notification system - will be improved with proper toast implementation
 * @param {string} message - Message to display
 * @param {string} type - Notification type ('success', 'warning', 'danger', 'info')
 */
function showNotification(message, type) {
    // Fallback notification system
    // This will be replaced with proper toast notifications later
    logger.debug("ui", `${type.toUpperCase()}: ${message}`);
    
    // Try to use page-specific toast if available
    if (window.showToast) {
        window.showToast(message, type);
    } else if (window.ticketManager && window.ticketManager.showToast) {
        window.ticketManager.showToast(message, type);
    } else {
        // Fallback to alert for now
        alert(`${type.toUpperCase()}: ${message}`);
    }
}

// ServiceNow Integration Functions

// Global cache for ServiceNow settings (synchronous access)
window.serviceNowSettingsCache = {
    enabled: false,
    instanceUrl: null
};

function initServiceNowSettings() {
    const enabledToggle = document.getElementById("serviceNowEnabled");
    const instanceInput = document.getElementById("serviceNowInstance");
    const configDiv = document.getElementById("serviceNowConfig");
    const _statusBadge = document.getElementById("serviceNowStatus");
    const testButton = document.getElementById("testServiceNowLink");
    const saveButton = document.getElementById("saveServiceNowSettings");

    if (!enabledToggle || !instanceInput) {return;}

    // Load saved settings
    loadServiceNowSettings();

    // Toggle configuration visibility
    enabledToggle.addEventListener("change", function() {
        configDiv.style.display = this.checked ? "block" : "none";
        updateServiceNowStatus();
        updateUrlPreview();
    });

    // Update URL preview as user types
    instanceInput.addEventListener("input", updateUrlPreview);

    // Test link functionality
    testButton.addEventListener("click", testServiceNowConnection);

    // Save settings
    saveButton.addEventListener("click", saveServiceNowSettings);

    // Initial state
    updateServiceNowStatus();
    updateUrlPreview();
}

async function loadServiceNowSettings() {
    try {
        if (!window.preferencesService) {
            logger.warn("ui", "PreferencesService not available for ServiceNow settings");
            return;
        }

        // Get all preferences (more efficient than two separate calls)
        const result = await window.preferencesService.getAllPreferences();

        if (result.success && result.data && result.data.preferences) {
            const prefsMap = {};
            result.data.preferences.forEach(pref => {
                prefsMap[pref.key] = pref.value;
            });

            const enabledToggle = document.getElementById("serviceNowEnabled");
            const instanceInput = document.getElementById("serviceNowInstance");
            const configDiv = document.getElementById("serviceNowConfig");

            // Load from preferences API (migrated from localStorage)
            const enabled = prefsMap.servicenow_enabled === true || prefsMap.servicenow_enabled === "true";
            const instanceUrl = prefsMap.servicenow_instance_url || "";

            if (enabledToggle) {
                enabledToggle.checked = enabled;
            }
            if (instanceInput) {
                instanceInput.value = instanceUrl;
            }
            if (configDiv) {
                configDiv.style.display = enabled ? "block" : "none";
            }

            // Update global cache for synchronous access
            window.serviceNowSettingsCache.enabled = enabled;
            window.serviceNowSettingsCache.instanceUrl = instanceUrl;
        }
    } catch (error) {
        logger.error("ui", "Error loading ServiceNow settings:", error);
    }
}

async function saveServiceNowSettings() {
    try {
        const enabledToggle = document.getElementById("serviceNowEnabled");
        const instanceInput = document.getElementById("serviceNowInstance");

        if (!enabledToggle || !instanceInput) {
            showNotification("Settings elements not found", "error");
            return;
        }

        // Validate URL if enabled
        if (enabledToggle.checked && instanceInput.value) {
            const url = instanceInput.value.trim();
            if (!url.match(/^https:\/\/.*\.service-now\.com\/?$/)) {
                showNotification("Please enter a valid ServiceNow URL (https://yourorg.service-now.com)", "error");
                instanceInput.focus();
                return;
            }
        }

        // Save to Preferences API (migrated from localStorage)
        if (!window.preferencesService) {
            throw new Error("PreferencesService not available");
        }

        const result = await window.preferencesService.setMultiplePreferences({
            servicenow_enabled: enabledToggle.checked,
            servicenow_instance_url: instanceInput.value.trim()
        });

        if (!result.success) {
            throw new Error(result.error || "Failed to save preferences");
        }

        // Update global cache for synchronous access
        window.serviceNowSettingsCache.enabled = enabledToggle.checked;
        window.serviceNowSettingsCache.instanceUrl = instanceInput.value.trim();

        updateServiceNowStatus();
        showNotification("ServiceNow settings saved successfully", "success");

        // Trigger page refresh if available
        if (window.refreshPageData) {
            window.refreshPageData("serviceNow");
        }
    } catch (error) {
        logger.error("ui", "Error saving ServiceNow settings:", error);
        showNotification("Failed to save ServiceNow settings", "error");
    }
}

function updateServiceNowStatus() {
    const statusBadge = document.getElementById("serviceNowStatus");
    const enabledToggle = document.getElementById("serviceNowEnabled");
    const instanceInput = document.getElementById("serviceNowInstance");

    if (!statusBadge || !enabledToggle) {return;}

    const isEnabled = enabledToggle.checked;
    const hasValidUrl = instanceInput && instanceInput.value.trim().match(/^https:\/\/.*\.service-now\.com\/?$/);

    if (isEnabled && hasValidUrl) {
        statusBadge.textContent = "Enabled";
        statusBadge.className = "badge bg-success ms-auto";
    } else if (isEnabled) {
        statusBadge.textContent = "Configuration Needed";
        statusBadge.className = "badge bg-warning ms-auto";
    } else {
        statusBadge.textContent = "Disabled";
        statusBadge.className = "badge bg-secondary ms-auto";
    }
}

function updateUrlPreview() {
    const urlPreview = document.getElementById("urlPatternPreview");
    const instanceInput = document.getElementById("serviceNowInstance");
    const enabledToggle = document.getElementById("serviceNowEnabled");

    if (!urlPreview || !instanceInput || !enabledToggle) {return;}

    if (!enabledToggle.checked) {
        urlPreview.textContent = "ServiceNow integration is disabled";
        return;
    }

    const instanceUrl = instanceInput.value.trim();
    if (!instanceUrl) {
        urlPreview.textContent = "Enter your ServiceNow instance URL to see the pattern";
        return;
    }

    const baseUrl = instanceUrl.replace(/\/$/, ""); // Remove trailing slash
    const pattern = `${baseUrl}/nav_to.do?uri=incident_list.do?sysparm_query=number={TICKET_NUMBER}`;
    urlPreview.textContent = pattern;
}

function testServiceNowConnection() {
    const instanceInput = document.getElementById("serviceNowInstance");
    const enabledToggle = document.getElementById("serviceNowEnabled");

    if (!instanceInput || !enabledToggle) {
        showNotification("Settings elements not found", "error");
        return;
    }

    if (!enabledToggle.checked) {
        showNotification("Please enable ServiceNow integration first", "warning");
        return;
    }

    const instanceUrl = instanceInput.value.trim();
    if (!instanceUrl) {
        showNotification("Please enter your ServiceNow instance URL", "warning");
        instanceInput.focus();
        return;
    }

    if (!instanceUrl.match(/^https:\/\/.*\.service-now\.com\/?$/)) {
        showNotification("Please enter a valid ServiceNow URL format", "error");
        instanceInput.focus();
        return;
    }

    // Generate test URL
    const baseUrl = instanceUrl.replace(/\/$/, "");
    const testUrl = `${baseUrl}/nav_to.do?uri=incident_list.do?sysparm_query=number=INC0000001`;

    // Open test link
    window.open(testUrl, "_blank");
    showNotification("Test link opened in new tab", "info");
}

async function generateServiceNowUrl(ticketNumber) {
    try {
        if (!window.preferencesService) {
            return null;
        }

        // Get ServiceNow settings from preferences API
        const result = await window.preferencesService.getAllPreferences();
        if (!result.success || !result.data) {
            return null;
        }

        const prefsMap = {};
        result.data.preferences.forEach(pref => {
            prefsMap[pref.key] = pref.value;
        });

        const enabled = prefsMap.servicenow_enabled === true || prefsMap.servicenow_enabled === "true";
        const instanceUrl = prefsMap.servicenow_instance_url;

        if (!enabled || !instanceUrl) {
            return null;
        }

        const baseUrl = instanceUrl.replace(/\/$/, "");
        
        // Detect ticket type based on prefix
        const ticketUpper = ticketNumber.toUpperCase();
        let tableUrl = "";
        
        if (ticketUpper.startsWith("CHG")) {
            // Change Request
            tableUrl = `change_request.do?sysparm_query=number=${ticketNumber}`;
        } else if (ticketUpper.startsWith("INC")) {
            // Incident
            tableUrl = `incident.do?sysparm_query=number=${ticketNumber}`;
        } else if (ticketUpper.startsWith("REQ")) {
            // Request
            tableUrl = `sc_request.do?sysparm_query=number=${ticketNumber}`;
        } else if (ticketUpper.startsWith("PRB")) {
            // Problem
            tableUrl = `problem.do?sysparm_query=number=${ticketNumber}`;
        } else if (ticketUpper.startsWith("TASK")) {
            // Task
            tableUrl = `sc_task.do?sysparm_query=number=${ticketNumber}`;
        } else {
            // Default fallback - try to search across all tables
            tableUrl = `text_search_exact_match.do?sysparm_search=${ticketNumber}`;
        }
        
        return `${baseUrl}/nav_to.do?uri=${encodeURIComponent(tableUrl)}`;
    } catch (error) {
        logger.error("ui", "Error generating ServiceNow URL:", error);
        return null;
    }
}

/**
 * Synchronous version of generateServiceNowUrl using cached settings
 * @param {string} ticketNumber - The ServiceNow ticket number
 * @returns {string|null} The ServiceNow URL or null if not configured
 */
function generateServiceNowUrlSync(ticketNumber) {
    try {
        // Use cached settings for synchronous access
        const enabled = window.serviceNowSettingsCache.enabled;
        const instanceUrl = window.serviceNowSettingsCache.instanceUrl;

        if (!enabled || !instanceUrl) {
            return null;
        }

        const baseUrl = instanceUrl.replace(/\/$/, "");

        // Detect ticket type based on prefix
        const ticketUpper = ticketNumber.toUpperCase();
        let tableUrl = "";

        if (ticketUpper.startsWith("CHG")) {
            // Change Request
            tableUrl = `change_request.do?sysparm_query=number=${ticketNumber}`;
        } else if (ticketUpper.startsWith("INC")) {
            // Incident
            tableUrl = `incident.do?sysparm_query=number=${ticketNumber}`;
        } else if (ticketUpper.startsWith("REQ")) {
            // Request
            tableUrl = `sc_request.do?sysparm_query=number=${ticketNumber}`;
        } else if (ticketUpper.startsWith("PRB")) {
            // Problem
            tableUrl = `problem.do?sysparm_query=number=${ticketNumber}`;
        } else if (ticketUpper.startsWith("TASK")) {
            // Task
            tableUrl = `sc_task.do?sysparm_query=number=${ticketNumber}`;
        } else {
            // Default fallback - try to search across all tables
            tableUrl = `text_search_exact_match.do?sysparm_search=${ticketNumber}`;
        }

        return `${baseUrl}/nav_to.do?uri=${encodeURIComponent(tableUrl)}`;
    } catch (error) {
        logger.error("ui", "Error generating ServiceNow URL (sync):", error);
        return null;
    }
}

async function isServiceNowEnabled() {
    try {
        if (!window.preferencesService) {
            return false;
        }

        // Get ServiceNow settings from preferences API
        const result = await window.preferencesService.getAllPreferences();
        if (!result.success || !result.data) {
            return false;
        }

        const prefsMap = {};
        result.data.preferences.forEach(pref => {
            prefsMap[pref.key] = pref.value;
        });

        const enabled = prefsMap.servicenow_enabled === true || prefsMap.servicenow_enabled === "true";
        const instanceUrl = prefsMap.servicenow_instance_url;

        return enabled && instanceUrl;
    } catch (error) {
        logger.error("ui", "Error checking ServiceNow status:", error);
        return false;
    }
}

/**
 * Convert tickets data to CSV format
 * @param {Array} tickets - Array of ticket objects
 * @returns {string} CSV data
 */
function convertTicketsToCSV(tickets) {
    if (!tickets || tickets.length === 0) {
        return "id,xt_number,date_submitted,date_due,hexagon_ticket,service_now_ticket,location,devices,supervisor,tech,status,notes,created_at,updated_at\n";
    }
    
    // Transform tickets for CSV with proper field mapping
    const csvData = tickets.map(ticket => ({
        id: ticket.id || "",
        xt_number: ticket.xt_number || "",
        date_submitted: ticket.date_submitted || "",
        date_due: ticket.date_due || "",
        hexagon_ticket: ticket.hexagon_ticket || "",
        service_now_ticket: ticket.service_now_ticket || "",
        location: ticket.location || "",
        devices: ticket.devices || "",
        supervisor: ticket.supervisor || "",
        tech: ticket.tech || "",
        status: ticket.status || "",
        notes: ticket.notes || "",
        created_at: ticket.created_at || "",
        updated_at: ticket.updated_at || ""
    }));
    
    return Papa.unparse(csvData);
}

/**
 * Convert vulnerabilities data to CSV format
 * @param {Array} vulnerabilities - Array of vulnerability objects
 * @returns {string} CSV data
 */
function convertVulnerabilitiesToCSV(vulnerabilities) {
    if (!vulnerabilities || vulnerabilities.length === 0) {
        return "id,hostname,ip_address,cve,severity,vpr_score,cvss_score,first_seen,last_seen,plugin_name,description,solution\n";
    }
    
    // Transform vulnerabilities for CSV
    const csvData = vulnerabilities.map(vuln => ({
        id: vuln.id || "",
        hostname: vuln.hostname || "",
        ip_address: vuln.ip_address || "",
        cve: vuln.cve || "",
        severity: vuln.severity || "",
        vpr_score: vuln.vpr_score || 0,
        cvss_score: vuln.cvss_score || 0,
        first_seen: vuln.first_seen || "",
        last_seen: vuln.last_seen || "",
        plugin_name: vuln.plugin_name || "",
        description: vuln.description || "",
        solution: vuln.solution || ""
    }));
    
    return Papa.unparse(csvData);
}

/**
 * Export all data as separate CSV files in a ZIP
 * @returns {Promise<void>}
 */
async function exportAllDataAsCSV() {
    try {
        const zip = new JSZip();
        const timestamp = new Date().toISOString().split("T")[0];
        
        // Fetch all data
        const [ticketsRes, vulnsRes] = await Promise.all([
            authState.authenticatedFetch("/api/backup/tickets"),
            authState.authenticatedFetch("/api/backup/vulnerabilities")
        ]);
        
        if (ticketsRes.ok && vulnsRes.ok) {
            const ticketsData = await ticketsRes.json();
            const vulnsData = await vulnsRes.json();
            
            // Convert to CSV
            const ticketsCSV = convertTicketsToCSV(ticketsData.data || []);
            const vulnsCSV = convertVulnerabilitiesToCSV(vulnsData.data || []);
            
            // Add CSV files to ZIP
            zip.file("tickets.csv", ticketsCSV);
            zip.file("vulnerabilities.csv", vulnsCSV);
            
            // Add metadata
            const metadata = {
                export_type: "all_csv",
                created_at: new Date().toISOString(),
                application: "HexTrackr",
                version: "2.3",
                contents: {
                    tickets: ticketsData.count || 0,
                    vulnerabilities: vulnsData.count || 0
                }
            };
            zip.file("export_info.json", JSON.stringify(metadata, null, 2));
            
            // Generate and download ZIP
            const zipBlob = await zip.generateAsync({ type: "blob" });
            const filename = `hextrackr_all_data_export_${timestamp}.zip`;
            
            const url = URL.createObjectURL(zipBlob);
            const a = document.createElement("a");
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            showNotification(`All data CSV export created: ${filename}`, "success");
        } else {
            throw new Error("Failed to fetch data for export");
        }
    } catch (error) {
        logger.error("ui", "Error creating all data CSV export:", error);
        showNotification(`All data CSV export failed: ${error.message}`, "danger");
    }
}

/**
 * Import CSV data
 * @param {string} type - Type of data to import ('tickets' or 'vulnerabilities')
 */
async function importCSV(type) {
    try {
        // Create a file input element
        const fileInput = document.createElement("input");
        fileInput.type = "file";
        fileInput.accept = ".csv";
        fileInput.style.display = "none";
        
        fileInput.addEventListener("change", async function(event) {
            const file = event.target.files[0];
            if (!file) {return;}
            
            try {
                // Read the CSV file
                const text = await file.text();
                const data = Papa.parse(text, { 
                    header: true, 
                    skipEmptyLines: true 
                });
                
                if (data.errors.length > 0) {
                    throw new Error(`CSV parsing errors: ${data.errors.map(e => e.message).join(", ")}`);
                }
                
                // Send to backend for import
                const response = await authState.authenticatedFetch(`/api/import/${type}`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        data: data.data
                    })
                });
                
                if (response.ok) {
                    const result = await response.json();
                    showNotification(`${type} import successful: ${result.imported || data.data.length} records imported`, "success");
                    
                    // Refresh page data if available
                    if (window.refreshPageData) {
                        window.refreshPageData(type);
                    }
                    if (window.loadTickets) {
                        window.loadTickets();
                    }
                } else {
                    const error = await response.json();
                    throw new Error(error.message || "Import failed");
                }
            } catch (error) {
                logger.error("ui", "Import error:", error);
                showNotification(`Import failed: ${error.message}`, "danger");
            } finally {
                // Clean up
                document.body.removeChild(fileInput);
            }
        });
        
        // Trigger file selection
        document.body.appendChild(fileInput);
        fileInput.click();
        
    } catch (error) {
        logger.error("ui", "Error setting up import:", error);
        showNotification(`Import setup failed: ${error.message}`, "danger");
    }
}

// Auto-initialize when DOM is ready
// Check if DOM is already loaded (important for scripts loaded at end of body)
if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function() {
        SettingsModal.init();
    });
} else {
    // DOM already loaded, init immediately
    SettingsModal.init();
}

// Export for use in other modules
if (typeof module !== "undefined" && module.exports) {
    module.exports = {
        SettingsModal,
        refreshStats,
        exportData,
        backupData,
        importData,
        clearData,
        // HEX-141: Cisco PSIRT functions
        openCiscoCredentialsModal,
        saveCiscoCredentials,
        clearCiscoCredentials,
        loadCiscoSyncStatus,
        syncCiscoNow,
        toggleCiscoAutoSync,
        // KEV functions
        syncKevData,
        toggleKevAutoSync,
        updateKevSyncStatus,
        loadKevSyncStatus,
        // General settings
        saveSettings,
        initServiceNowSettings,
        loadServiceNowSettings,
        saveServiceNowSettings,
        generateServiceNowUrl,
        isServiceNowEnabled
    };
}

// Export for testing and page integration
window.SettingsModal = SettingsModal;
window.refreshPageData = window.refreshPageData || function() {};

// Export individual functions for onclick handlers
window.exportData = exportData;
window.backupData = backupData;
window.importData = importData;
window.clearData = clearData;
window.exportAllDataAsCSV = exportAllDataAsCSV;
window.restoreData = restoreData;
window.restoreFullSystemBackup = restoreFullSystemBackup;

/**
 * Restore full system backup (all data types)
 * This is a specialized version of restoreData that handles the 'all' type
 * @returns {Promise<void>}
 */
async function restoreFullSystemBackup() {
    try {
        // Show confirmation dialog first
        const confirmed = await showRestoreConfirmationModal();
        if (!confirmed) {return;}
        
        // Call restoreData with 'all' type
        await restoreData("all");
    } catch (error) {
        logger.error("ui", "Error with full system restore:", error);
        showNotification(`System restore failed: ${error.message}`, "danger");
    }
}

/**
 * Show confirmation modal for system restore
 * @returns {Promise<boolean>} True if confirmed, false otherwise
 */
function showRestoreConfirmationModal() {
    return new Promise((resolve) => {
        const modal = document.createElement("div");
        modal.className = "modal fade";
        modal.innerHTML = `
            <div class="modal-dialog modal-dialog-centered">
                <div class="modal-content">
                    <div class="modal-header bg-warning">
                        <h5 class="modal-title">
                            <i class="fas fa-exclamation-triangle me-2"></i>
                            Confirm Full System Restore
                        </h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <div class="alert alert-warning">
                            <strong>Warning:</strong> This will restore all data from a backup file.
                            Existing data may be overwritten or duplicated.
                        </div>
                        <p>Would you like to clear existing data before restore?</p>
                        <div class="form-check form-switch mb-3">
                            <input class="form-check-input" type="checkbox" id="clearBeforeRestore">
                            <label class="form-check-label" for="clearBeforeRestore">
                                Clear existing data before restore
                            </label>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                        <button type="button" class="btn btn-primary" id="confirmRestoreBtn">Proceed with Restore</button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        const bsModal = new bootstrap.Modal(modal);
        const confirmBtn = modal.querySelector("#confirmRestoreBtn");
        const clearCheckbox = modal.querySelector("#clearBeforeRestore");
        
        confirmBtn.addEventListener("click", () => {
            const _shouldClear = clearCheckbox.checked;
            bsModal.hide();
            resolve(true);
        });
        
        modal.addEventListener("hidden.bs.modal", () => {
            document.body.removeChild(modal);
            resolve(false);
        });
        
        bsModal.show();
    });
}

/**
 * Restore data from a ZIP backup file
 * @param {string} type - Type of data to restore ('tickets', 'vulnerabilities', 'all')
 * @returns {Promise<void>}
 */
async function restoreData(type) {
    try {
        // Create a file input element for selecting the backup file
        const input = document.createElement("input");
        input.type = "file";
        input.accept = ".zip";
        input.style.display = "none";
        
        input.onchange = async function(event) {
            const file = event.target.files[0];
            if (!file) {return;}
            
            // Show loading notification
            showNotification(`Restoring ${type} data from backup...`, "info");
            
            try {
                // Create form data with the file and type
                const formData = new FormData();
                formData.append("file", file);
                formData.append("type", type);
                
                // Send to backend for processing
                const response = await authState.authenticatedFetch("/api/backup/restore", {
                    method: "POST",
                    body: formData
                });
                
                if (response.ok) {
                    const result = await response.json();
                    showNotification(`Restore successful: ${result.message}`, "success");
                    
                    // Refresh statistics
                    await refreshStats();
                    
                    // Trigger page-specific refresh if available
                    if (window.refreshPageData) {
                        window.refreshPageData(type);
                    }
                } else {
                    const error = await response.json();
                    throw new Error(error.message || "Restore failed");
                }
            } catch (error) {
                logger.error("ui", "Error restoring data:", error);
                showNotification(`Restore failed: ${error.message}`, "danger");
            } finally {
                // Clean up
                document.body.removeChild(input);
            }
        };
        
        // Trigger file selection
        document.body.appendChild(input);
        input.click();
        
    } catch (error) {
        logger.error("ui", "Error setting up restore:", error);
        showNotification(`Restore setup failed: ${error.message}`, "danger");
    }
}

// Expose ServiceNow functions globally for use by other pages
// Using synchronous versions for immediate access (no Promise handling needed)
window.generateServiceNowUrl = generateServiceNowUrlSync;
window.isServiceNowEnabled = () => window.serviceNowSettingsCache.enabled;

})();
