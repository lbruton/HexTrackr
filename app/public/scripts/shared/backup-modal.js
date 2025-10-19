/**
 * Backup Modal Manager - HEX-270
 * Manages three backup modals following Tabler.io patterns (KEV picker, ticket picker)
 * - Tickets Backup Modal (JSON backups)
 * - Vulnerabilities Backup Modal (JSON backups)
 * - Database Backup Modal (SQLite backups)
 */

class BackupModalManager {
    constructor() {
        this.backups = {
            tickets: [],
            vulnerabilities: [],
            database: []
        };
        this.csrfToken = null;

        // Track selected backup for each type
        this.selectedBackup = {
            tickets: null,
            vulnerabilities: null,
            database: null
        };

        // Track backup queue status
        this.queueStatus = {
            tickets: { inProgress: false, message: "Ready to create backup" },
            vulnerabilities: { inProgress: false, message: "Ready to create backup" }
        };

        // Bind methods
        this.showTicketsBackupModal = this.showTicketsBackupModal.bind(this);
        this.showVulnerabilitiesBackupModal = this.showVulnerabilitiesBackupModal.bind(this);
        this.showDatabaseBackupModal = this.showDatabaseBackupModal.bind(this);
        this.loadBackupHistory = this.loadBackupHistory.bind(this);
        this.downloadBackup = this.downloadBackup.bind(this);
        this.queueBackup = this.queueBackup.bind(this);
        this.restoreFromFile = this.restoreFromFile.bind(this);
        this.restoreFromServer = this.restoreFromServer.bind(this);
        this.selectBackup = this.selectBackup.bind(this);
    }

    /**
     * Get CSRF token for authenticated requests
     */
    async getCsrfToken() {
        if (!this.csrfToken) {
            const response = await window.authState.authenticatedFetch("/api/auth/csrf");
            const data = await response.json();
            this.csrfToken = data.csrfToken;
        }
        return this.csrfToken;
    }

    /**
     * Load backup history from server
     * Filters backups by type (JSON ZIP or Database)
     */
    async loadBackupHistory() {
        try {
            const response = await window.authState.authenticatedFetch("/api/backup/history");

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();

            if (!data.success) {
                throw new Error(data.error || "Failed to load backup history");
            }

            // Filter backups by type
            // Support both legacy "JSON ZIP" type and new specific types ("Tickets", "Vulnerabilities")
            this.backups.tickets = data.backups.filter(b =>
                b.type === "Tickets" || (b.type === "JSON ZIP" && b.filename.includes("tickets"))
            );
            this.backups.vulnerabilities = data.backups.filter(b =>
                b.type === "Vulnerabilities" || (b.type === "JSON ZIP" && b.filename.includes("vulnerabilities"))
            );
            this.backups.database = data.backups.filter(b =>
                b.type === "Database"
            );

            return data.backups;

        } catch (error) {
            logger.error("backup", "Failed to load backup history:", error);
            throw error;
        }
    }

    /**
     * Show Tickets Backup Modal
     * Displays available ticket backup files (JSON ZIP)
     */
    async showTicketsBackupModal() {
        try {
            logger.info("backup", "Opening tickets backup modal");

            // Load backups
            await this.loadBackupHistory();

            const modalBody = document.getElementById("ticketsBackupModalBody");
            if (!modalBody) {
                logger.error("backup", "Tickets backup modal body not found");
                return;
            }

            // Render modal content
            modalBody.innerHTML = this.renderBackupList(
                this.backups.tickets,
                "Tickets",
                "No ticket backups found. Create your first backup to get started."
            );

            // Show modal
            const modalElement = document.getElementById("ticketsBackupModal");
            if (modalElement) {
                const modal = new bootstrap.Modal(modalElement);
                modal.show();
            }

        } catch (error) {
            logger.error("backup", "Failed to show tickets backup modal:", error);
            window.window.showNotification(`Failed to load backup history: ${error.message}`, "danger");
        }
    }

    /**
     * Show Vulnerabilities Backup Modal
     * Displays available vulnerability backup files (JSON ZIP)
     */
    async showVulnerabilitiesBackupModal() {
        try {
            logger.info("backup", "Opening vulnerabilities backup modal");

            // Load backups
            await this.loadBackupHistory();

            const modalBody = document.getElementById("vulnerabilitiesBackupModalBody");
            if (!modalBody) {
                logger.error("backup", "Vulnerabilities backup modal body not found");
                return;
            }

            // Render modal content
            modalBody.innerHTML = this.renderBackupList(
                this.backups.vulnerabilities,
                "Vulnerabilities",
                "No vulnerability backups found. Create your first backup to get started."
            );

            // Show modal
            const modalElement = document.getElementById("vulnerabilitiesBackupModal");
            if (modalElement) {
                const modal = new bootstrap.Modal(modalElement);
                modal.show();
            }

        } catch (error) {
            logger.error("backup", "Failed to show vulnerabilities backup modal:", error);
            window.window.showNotification(`Failed to load backup history: ${error.message}`, "danger");
        }
    }

    /**
     * Show Database Backup Modal
     * Displays available database backup files (SQLite)
     */
    async showDatabaseBackupModal() {
        try {
            logger.info("backup", "Opening database backup modal");

            // Load backups
            await this.loadBackupHistory();

            const modalBody = document.getElementById("databaseBackupModalBody");
            if (!modalBody) {
                logger.error("backup", "Database backup modal body not found");
                return;
            }

            // Render modal content
            modalBody.innerHTML = this.renderBackupList(
                this.backups.database,
                "Database",
                "No database backups found. Create your first backup to get started."
            );

            // Show modal
            const modalElement = document.getElementById("databaseBackupModal");
            if (modalElement) {
                const modal = new bootstrap.Modal(modalElement);
                modal.show();
            }

        } catch (error) {
            logger.error("backup", "Failed to show database backup modal:", error);
            window.window.showNotification(`Failed to load backup history: ${error.message}`, "danger");
        }
    }

    /**
     * Render backup list following Tabler.io list-group pattern
     * @param {Array} backups - Array of backup objects
     * @param {string} type - Backup type label
     * @param {string} emptyMessage - Message to show when no backups
     * @returns {string} HTML content
     */
    renderBackupList(backups, type, emptyMessage) {
        if (backups.length === 0) {
            return `
                <div class="text-center py-4">
                    <i class="fas fa-inbox fa-3x text-muted mb-3"></i>
                    <p class="text-muted">${emptyMessage}</p>
                </div>
            `;
        }

        return `
            <p class="mb-3">
                <strong>${backups.length}</strong> ${type.toLowerCase()} backup${backups.length !== 1 ? "s" : ""} available on disk.
            </p>
            <div class="list-group">
                ${backups.map(backup => {
                    // Parse timestamp: format is "2025-10-17_22-30-50" or "YYYY-MM-DDTHH-MM-SS"
                    const timestampStr = backup.timestamp
                        .replace(/_/g, " ")  // Replace underscore with space
                        .replace(/-/g, "-"); // Keep hyphens for date, replace time hyphens with colons below

                    // Convert time portion hyphens to colons: "22-30-50" -> "22:30:50"
                    const parts = timestampStr.split(" ");
                    const dateStr = parts[0];
                    const timeStr = parts[1] ? parts[1].replace(/-/g, ":") : "00:00:00";

                    const timestamp = new Date(`${dateStr}T${timeStr}`);
                    const formattedDate = timestamp.toLocaleString();
                    const sourceBadge = backup.is_manual
                        ? "<span class=\"badge bg-warning ms-2\">Manual</span>"
                        : "<span class=\"badge bg-secondary ms-2\">Automated</span>";

                    const backupType = type.toLowerCase().replace(" ", "-");
                    return `
                        <div class="list-group-item list-group-item-action"
                             style="cursor: pointer;"
                             onclick="window.backupModalManager.selectBackup('${backupType}', '${backup.filename}')"
                             id="backup-item-${backup.filename.replace(/[^a-zA-Z0-9]/g, "-")}">
                            <div class="row align-items-center g-2">
                                <div class="col-auto d-flex align-items-center">
                                    <input type="radio" name="selected-${backupType}-backup"
                                           class="form-check-input"
                                           value="${backup.filename}"
                                           onclick="event.stopPropagation();">
                                </div>
                                <div class="col d-flex align-items-center">
                                    <div>
                                        <strong>${backup.filename}</strong>${sourceBadge}
                                        <div class="text-muted small mt-1">
                                            <i class="fas fa-clock me-1"></i>${formattedDate} •
                                            <i class="fas fa-hdd me-1"></i>${backup.size_mb} MB •
                                            ${backup.age_days} days ago
                                        </div>
                                    </div>
                                </div>
                                <div class="col-auto d-flex align-items-center">
                                    <button type="button" class="btn btn-outline-primary btn-sm"
                                            onclick="event.stopPropagation(); window.backupModalManager.downloadBackup('${backup.filename}')">
                                        <i class="fas fa-download me-1"></i>Download
                                    </button>
                                </div>
                            </div>
                        </div>
                    `;
                }).join("")}
            </div>
        `;
    }

    /**
     * Download specific backup file
     * @param {string} filename - Backup filename
     */
    async downloadBackup(filename) {
        try {
            logger.info("backup", `Downloading backup: ${filename}`);

            // Use window.location for file download
            window.location.href = `/api/backup/download/${filename}`;

            window.showNotification(`Downloading backup: ${filename}`, "success");

        } catch (error) {
            logger.error("backup", "Failed to download backup:", error);
            window.showNotification(`Failed to download backup: ${error.message}`, "danger");
        }
    }

    /**
     * Create fresh backup and download
     * @param {string} type - Backup type ('tickets', 'vulnerabilities', 'all')
     */
    async createFreshBackup(type) {
        try {
            const btn = event.target.closest("button");
            if (btn) {
                btn.disabled = true;
                btn.innerHTML = "<span class=\"spinner-border spinner-border-sm me-1\"></span>Creating...";
            }

            logger.info("backup", `Creating fresh ${type} backup...`);

            const csrfToken = await this.getCsrfToken();

            const response = await window.authState.authenticatedFetch("/api/backup/trigger-manual", {
                method: "POST",
                headers: {
                    "X-CSRF-Token": csrfToken
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();

            if (!data.success) {
                throw new Error(data.error || "Backup creation failed");
            }

            window.showNotification(`Fresh backup created successfully (${data.total_size_mb}MB)`, "success");

            // Reload the current modal
            if (type === "tickets") {
                await this.showTicketsBackupModal();
            } else if (type === "vulnerabilities") {
                await this.showVulnerabilitiesBackupModal();
            } else {
                await this.showDatabaseBackupModal();
            }

        } catch (error) {
            logger.error("backup", "Fresh backup failed:", error);
            window.showNotification(`Failed to create backup: ${error.message}`, "danger");
        } finally {
            if (btn) {
                btn.disabled = false;
                btn.innerHTML = "<i class=\"fas fa-plus me-1\"></i>Create Fresh Backup";
            }
        }
    }

    /**
     * Select a backup from the list
     * Enables "Restore from Server" button when backup is selected
     */
    selectBackup(type, filename) {
        logger.info("backup", `Selected ${type} backup: ${filename}`);

        // Update selected backup
        this.selectedBackup[type] = filename;

        // Update radio button
        const radio = document.querySelector(`input[name="selected-${type}-backup"][value="${filename}"]`);
        if (radio) {
            radio.checked = true;
        }

        // Enable "Restore from Server" button
        const restoreBtn = document.getElementById(`restore${type.charAt(0).toUpperCase() + type.slice(1)}FromServer`);
        if (restoreBtn) {
            restoreBtn.disabled = false;
        }
    }

    /**
     * Queue a backup to be created
     * Creates backup in background, user can retrieve from list later
     */
    async queueBackup(type) {
        try {
            logger.info("backup", `Queuing ${type} backup...`);

            // Update status
            this.queueStatus[type] = {
                inProgress: true,
                message: "Backup in progress..."
            };

            // Update UI
            const statusElement = document.getElementById(`${type}BackupStatus`);
            const queueBtn = document.getElementById(`queue${type.charAt(0).toUpperCase() + type.slice(1)}Backup`);

            if (statusElement) {
                statusElement.innerHTML = "<i class=\"fas fa-spinner fa-spin me-1\"></i>Backup in progress...";
                statusElement.className = "mt-2 small text-warning";
            }

            if (queueBtn) {
                queueBtn.disabled = true;
            }

            // Trigger backup creation (saves to disk only, no download)
            const response = await window.authState.authenticatedFetch(`/api/backup/export/${type}`);

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            // Just consume the response (file is saved server-side)
            await response.blob();

            // Update status
            this.queueStatus[type] = {
                inProgress: false,
                message: "Backup complete! Refresh to see it in the list."
            };

            if (statusElement) {
                statusElement.innerHTML = "<i class=\"fas fa-check-circle me-1\"></i>Backup complete! Refreshing...";
                statusElement.className = "mt-2 small text-success";
            }

            window.showNotification(`${type.charAt(0).toUpperCase() + type.slice(1)} backup queued successfully`, "success");

            // Reload backup history after short delay
            setTimeout(async () => {
                await this.loadBackupHistory();

                // Refresh the modal content
                if (type === "tickets") {
                    const modalBody = document.getElementById("ticketsBackupModalBody");
                    if (modalBody) {
                        modalBody.innerHTML = this.renderBackupList(
                            this.backups.tickets,
                            "Tickets",
                            "No ticket backups found. Click \"Queue Backup\" to create your first backup."
                        );
                    }
                } else {
                    const modalBody = document.getElementById("vulnerabilitiesBackupModalBody");
                    if (modalBody) {
                        modalBody.innerHTML = this.renderBackupList(
                            this.backups.vulnerabilities,
                            "Vulnerabilities",
                            "No vulnerability backups found. Click \"Queue Backup\" to create your first backup."
                        );
                    }
                }

                // Reset status
                if (statusElement) {
                    statusElement.innerHTML = "Ready to create backup";
                    statusElement.className = "mt-2 small text-muted";
                }

                if (queueBtn) {
                    queueBtn.disabled = false;
                }
            }, 2000);

        } catch (error) {
            logger.error("backup", "Failed to queue backup:", error);

            // Reset status
            this.queueStatus[type] = {
                inProgress: false,
                message: "Ready to create backup"
            };

            const statusElement = document.getElementById(`${type}BackupStatus`);
            const queueBtn = document.getElementById(`queue${type.charAt(0).toUpperCase() + type.slice(1)}Backup`);

            if (statusElement) {
                statusElement.innerHTML = "Ready to create backup";
                statusElement.className = "mt-2 small text-muted";
            }

            if (queueBtn) {
                queueBtn.disabled = false;
            }

            window.showNotification(`Failed to queue backup: ${error.message}`, "danger");
        }
    }

    /**
     * Restore from uploaded file
     * Opens file picker for user to select backup ZIP
     */
    async restoreFromFile(type) {
        try {
            logger.info("backup", `Restoring ${type} from file...`);

            // Create file input
            const fileInput = document.createElement("input");
            fileInput.type = "file";
            fileInput.accept = ".zip";

            fileInput.onchange = async (e) => {
                const file = e.target.files[0];
                if (!file) {return;}

                try {
                    logger.info("backup", `Uploading file: ${file.name}`);

                    const formData = new FormData();
                    formData.append("file", file);  // Must be 'file' to match multer config
                    formData.append("type", type);
                    formData.append("clearExisting", "false"); // Don't clear by default

                    const csrfToken = await this.getCsrfToken();
                    const response = await window.authState.authenticatedFetch("/api/backup/restore", {
                        method: "POST",
                        headers: {
                            "X-CSRF-Token": csrfToken
                        },
                        body: formData
                    });

                    if (!response.ok) {
                        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                    }

                    const data = await response.json();

                    if (!data.success) {
                        throw new Error(data.error || "Restore failed");
                    }

                    window.showNotification(`✅ Restored ${data.count} ${type} from backup`, "success");

                } catch (error) {
                    logger.error("backup", "Restore from file failed:", error);
                    window.showNotification(`❌ Restore failed: ${error.message}`, "danger");
                }
            };

            fileInput.click();

        } catch (error) {
            logger.error("backup", "Failed to restore from file:", error);
            window.showNotification(`Failed to restore from file: ${error.message}`, "danger");
        }
    }

    /**
     * Restore from selected server backup
     * Uses the backup selected from the list
     */
    async restoreFromServer(type) {
        const selectedFilename = this.selectedBackup[type];

        if (!selectedFilename) {
            window.showNotification("Please select a backup from the list first", "warning");
            return;
        }

        try {
            logger.info("backup", `Restoring ${type} from server backup: ${selectedFilename}`);

            // Download backup file from server
            const response = await window.authState.authenticatedFetch(`/api/backup/download/${selectedFilename}`);

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const blob = await response.blob();

            // Create a File object from the blob
            const file = new File([blob], selectedFilename, { type: "application/zip" });

            // Upload it to restore endpoint
            const formData = new FormData();
            formData.append("file", file);  // Must be 'file' to match multer config
            formData.append("type", type);
            formData.append("clearExisting", "false");

            const csrfToken = await this.getCsrfToken();
            const restoreResponse = await window.authState.authenticatedFetch("/api/backup/restore", {
                method: "POST",
                headers: {
                    "X-CSRF-Token": csrfToken
                },
                body: formData
            });

            if (!restoreResponse.ok) {
                throw new Error(`HTTP ${restoreResponse.status}: ${restoreResponse.statusText}`);
            }

            const data = await restoreResponse.json();

            if (!data.success) {
                throw new Error(data.error || "Restore failed");
            }

            window.showNotification(`✅ Restored ${data.count} ${type} from ${selectedFilename}`, "success");

        } catch (error) {
            logger.error("backup", "Restore from server failed:", error);
            window.showNotification(`❌ Restore failed: ${error.message}`, "danger");
        }
    }
}

// Create global instance
window.backupModalManager = new BackupModalManager();

// Export for use in other modules
if (typeof module !== "undefined" && module.exports) {
    module.exports = BackupModalManager;
}
