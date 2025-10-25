/**
 * Audit Logs Modal Manager (HEX-254 Session 13)
 * Admin-only interface for viewing encrypted audit logs with filtering and export
 *
 * Features:
 * - Real-time stats display
 * - Date range and category filtering
 * - Pagination support (100 entries per page)
 * - JSON and CSV export
 * - Server-side decryption (encryption key never sent to client)
 * - Detailed log view with metadata
 */

class AuditLogModalManager {
    constructor() {
        this.modal = null;
        this.detailsModal = null;
        this.currentPage = 1;
        this.pageLimit = 100;
        this.totalLogs = 0;
        this.stats = null;
        this.filters = {
            startDate: null,
            endDate: null,
            category: null
        };

        this.init();
    }

    /**
     * Initialize modal manager
     */
    async init() {
        try {
            // Load modal HTML
            const response = await fetch("/scripts/shared/audit-logs-modal.html");
            if (!response.ok) {
                throw new Error(`Failed to load modal HTML: ${response.status}`);
            }

            const html = await response.text();
            document.body.insertAdjacentHTML("beforeend", html);

            // Initialize Bootstrap modals
            this.modal = new bootstrap.Modal(document.getElementById("auditLogsModal"));
            this.detailsModal = new bootstrap.Modal(document.getElementById("auditLogDetailsModal"));

            // Attach event listeners
            this.attachEventListeners();

            console.log("AuditLogModalManager initialized");

        } catch (error) {
            console.error("Failed to initialize AuditLogModalManager:", error);
            global.logger?.error("frontend", "audit", "Failed to initialize audit logs modal", { error: error.message });
        }
    }

    /**
     * Attach event listeners
     * @private
     */
    attachEventListeners() {
        // Apply filters button
        document.getElementById("auditApplyFilters")?.addEventListener("click", () => {
            this.applyFilters();
        });

        // Clear filters button
        document.getElementById("auditClearFilters")?.addEventListener("click", () => {
            this.clearFilters();
        });

        // Export buttons
        document.getElementById("auditExportJSON")?.addEventListener("click", () => {
            this.exportLogs("json");
        });

        document.getElementById("auditExportCSV")?.addEventListener("click", () => {
            this.exportLogs("csv");
        });

        // Modal shown event - load initial data
        document.getElementById("auditLogsModal")?.addEventListener("shown.bs.modal", () => {
            this.loadStats();
            this.loadLogs();
        });
    }

    /**
     * Show the audit logs modal
     */
    show() {
        if (this.modal) {
            this.modal.show();
        }
    }

    /**
     * Hide the audit logs modal
     */
    hide() {
        if (this.modal) {
            this.modal.hide();
        }
    }

    /**
     * Load audit log statistics
     * @private
     */
    async loadStats() {
        try {
            const response = await fetch("/api/audit-logs/stats");

            if (!response.ok) {
                throw new Error(`Failed to load stats: ${response.status}`);
            }

            const result = await response.json();

            if (!result.success) {
                throw new Error(result.error || "Failed to load audit log statistics");
            }

            this.stats = result.data;
            this.renderStats();
            this.populateCategoryFilter();

        } catch (error) {
            console.error("Failed to load audit log stats:", error);
            global.logger?.error("frontend", "audit", "Failed to load audit log stats", { error: error.message });
            this.showError("Failed to load audit log statistics. Please try again.");
        }
    }

    /**
     * Render statistics in modal header
     * @private
     */
    renderStats() {
        if (!this.stats) return;

        document.getElementById("auditModalTotalLogs").textContent = this.stats.totalLogs.toLocaleString();
        document.getElementById("auditModalCategories").textContent = this.stats.categoriesTracked.length;

        // Format date range
        if (this.stats.oldestLog && this.stats.newestLog) {
            const oldest = new Date(this.stats.oldestLog).toLocaleDateString();
            const newest = new Date(this.stats.newestLog).toLocaleDateString();
            document.getElementById("auditModalDateRange").textContent = `${oldest} - ${newest}`;
        } else {
            document.getElementById("auditModalDateRange").textContent = "No logs";
        }
    }

    /**
     * Populate category filter dropdown
     * @private
     */
    populateCategoryFilter() {
        if (!this.stats || !this.stats.categoriesTracked) return;

        const select = document.getElementById("auditCategory");
        if (!select) return;

        // Clear existing options (except "All Categories")
        select.innerHTML = '<option value="">All Categories</option>';

        // Add category options
        this.stats.categoriesTracked.forEach(category => {
            const option = document.createElement("option");
            option.value = category;
            option.textContent = category;
            select.appendChild(option);
        });
    }

    /**
     * Load audit logs with current filters and pagination
     * @private
     */
    async loadLogs() {
        try {
            // Show loading state
            this.showLoading();

            // Build query parameters
            const params = new URLSearchParams({
                page: this.currentPage,
                limit: this.pageLimit
            });

            if (this.filters.startDate) {
                params.append("startDate", this.filters.startDate);
            }
            if (this.filters.endDate) {
                params.append("endDate", this.filters.endDate);
            }
            if (this.filters.category) {
                params.append("category", this.filters.category);
            }

            const response = await fetch(`/api/audit-logs?${params.toString()}`);

            if (!response.ok) {
                throw new Error(`Failed to load logs: ${response.status}`);
            }

            const result = await response.json();

            if (!result.success) {
                throw new Error(result.error || "Failed to load audit logs");
            }

            // Hide loading state
            this.hideLoading();

            // Render logs
            this.renderLogs(result.data.logs);
            this.renderPagination(result.data.pagination);

        } catch (error) {
            console.error("Failed to load audit logs:", error);
            global.logger?.error("frontend", "audit", "Failed to load audit logs", { error: error.message });
            this.hideLoading();
            this.showError("Failed to load audit logs. Please try again.");
        }
    }

    /**
     * Render audit logs table
     * @private
     * @param {Array} logs - Array of audit log objects
     */
    renderLogs(logs) {
        const tbody = document.getElementById("auditLogsTableBody");
        const emptyState = document.getElementById("auditLogsEmpty");

        if (!tbody) return;

        // Clear existing rows
        tbody.innerHTML = "";

        if (!logs || logs.length === 0) {
            emptyState?.classList.remove("d-none");
            return;
        }

        emptyState?.classList.add("d-none");

        logs.forEach(log => {
            const row = document.createElement("tr");

            // Extract message string from object
            let messageStr = "";
            let username = "";
            if (typeof log.message === "object" && log.message !== null) {
                messageStr = log.message.message || JSON.stringify(log.message);
                // Extract username from encrypted message data
                username = log.message.data?.username || log.username;
            } else {
                messageStr = log.message || "";
                username = log.username;
            }

            // Truncate long messages
            const truncatedMessage = messageStr.length > 80
                ? messageStr.substring(0, 80) + "..."
                : messageStr;

            // Display username, or truncated UUID (last 8 chars), or dash
            let userDisplay = "-";
            if (username) {
                userDisplay = username;
            } else if (log.user_id) {
                // Truncate UUID to last 8 characters
                userDisplay = `...${log.user_id.slice(-8)}`;
            }

            row.innerHTML = `
                <td class="text-muted">${log.id}</td>
                <td>${this.formatTimestamp(log.timestamp)}</td>
                <td><span class="badge ${this.getCategoryBadgeColor(log.category)}">${log.category}</span></td>
                <td>${this.escapeHtml(truncatedMessage)}</td>
                <td>${userDisplay}</td>
                <td class="text-muted">${log.ip_address || "-"}</td>
                <td>
                    <button class="btn btn-sm btn-outline-primary" onclick="window.auditLogModalManager.showLogDetails(${log.id})">
                        <i class="fas fa-eye"></i>
                    </button>
                </td>
            `;

            tbody.appendChild(row);
        });
    }

    /**
     * Render pagination controls
     * @private
     * @param {Object} pagination - {page, limit, total, pages}
     */
    renderPagination(pagination) {
        if (!pagination) return;

        const { page, limit, total, pages } = pagination;

        // Update pagination info
        const start = total === 0 ? 0 : (page - 1) * limit + 1;
        const end = Math.min(page * limit, total);

        document.getElementById("auditLogsStart").textContent = start;
        document.getElementById("auditLogsEnd").textContent = end;
        document.getElementById("auditLogsTotal").textContent = total;

        // Render pagination buttons
        const paginationContainer = document.getElementById("auditLogsPagination");
        if (!paginationContainer) return;

        paginationContainer.innerHTML = "";

        if (pages <= 1) return; // No pagination needed

        // Previous button
        const prevLi = document.createElement("li");
        prevLi.className = `page-item ${page === 1 ? "disabled" : ""}`;
        prevLi.innerHTML = `
            <a class="page-link" href="#" ${page === 1 ? 'tabindex="-1"' : ""}>
                <i class="fas fa-chevron-left"></i>
            </a>
        `;
        if (page > 1) {
            prevLi.addEventListener("click", (e) => {
                e.preventDefault();
                this.goToPage(page - 1);
            });
        }
        paginationContainer.appendChild(prevLi);

        // Page numbers (show 5 pages max)
        const startPage = Math.max(1, page - 2);
        const endPage = Math.min(pages, page + 2);

        for (let i = startPage; i <= endPage; i++) {
            const pageLi = document.createElement("li");
            pageLi.className = `page-item ${i === page ? "active" : ""}`;
            pageLi.innerHTML = `<a class="page-link" href="#">${i}</a>`;

            if (i !== page) {
                pageLi.addEventListener("click", (e) => {
                    e.preventDefault();
                    this.goToPage(i);
                });
            }

            paginationContainer.appendChild(pageLi);
        }

        // Next button
        const nextLi = document.createElement("li");
        nextLi.className = `page-item ${page === pages ? "disabled" : ""}`;
        nextLi.innerHTML = `
            <a class="page-link" href="#" ${page === pages ? 'tabindex="-1"' : ""}>
                <i class="fas fa-chevron-right"></i>
            </a>
        `;
        if (page < pages) {
            nextLi.addEventListener("click", (e) => {
                e.preventDefault();
                this.goToPage(page + 1);
            });
        }
        paginationContainer.appendChild(nextLi);
    }

    /**
     * Navigate to specific page
     * @param {number} page - Page number
     */
    goToPage(page) {
        this.currentPage = page;
        this.loadLogs();
    }

    /**
     * Apply current filters
     */
    applyFilters() {
        // Read filter values
        this.filters.startDate = document.getElementById("auditStartDate")?.value || null;
        this.filters.endDate = document.getElementById("auditEndDate")?.value || null;
        this.filters.category = document.getElementById("auditCategory")?.value || null;

        // Reset to page 1 when filtering
        this.currentPage = 1;

        // Reload logs
        this.loadLogs();
    }

    /**
     * Clear all filters
     */
    clearFilters() {
        // Clear filter form
        const startDate = document.getElementById("auditStartDate");
        const endDate = document.getElementById("auditEndDate");
        const category = document.getElementById("auditCategory");

        if (startDate) startDate.value = "";
        if (endDate) endDate.value = "";
        if (category) category.value = "";

        // Clear filter state
        this.filters = {
            startDate: null,
            endDate: null,
            category: null
        };

        // Reset to page 1
        this.currentPage = 1;

        // Reload logs
        this.loadLogs();
    }

    /**
     * Export audit logs in specified format
     * @param {string} format - "json" or "csv"
     */
    async exportLogs(format) {
        try {
            // Build query parameters
            const params = new URLSearchParams({ format });

            if (this.filters.startDate) {
                params.append("startDate", this.filters.startDate);
            }
            if (this.filters.endDate) {
                params.append("endDate", this.filters.endDate);
            }
            if (this.filters.category) {
                params.append("category", this.filters.category);
            }

            // Trigger download
            window.location.href = `/api/audit-logs/export?${params.toString()}`;

            console.log(`Exporting audit logs as ${format}`);
            global.logger?.info("frontend", "audit", `Exported audit logs as ${format}`);

        } catch (error) {
            console.error(`Failed to export logs as ${format}:`, error);
            global.logger?.error("frontend", "audit", `Failed to export logs as ${format}`, { error: error.message });
            this.showError(`Failed to export logs as ${format.toUpperCase()}. Please try again.`);
        }
    }

    /**
     * Show log details in nested modal
     * @param {number} logId - Log ID to display
     */
    async showLogDetails(logId) {
        try {
            // Find log in current data (or fetch if needed)
            const tbody = document.getElementById("auditLogsTableBody");
            if (!tbody) return;

            // For now, we'll need to fetch the full log details
            // In a production system, you might cache the full log data
            const response = await fetch(`/api/audit-logs?page=1&limit=10000`);
            const result = await response.json();

            if (!result.success) {
                throw new Error(result.error || "Failed to load log details");
            }

            const log = result.data.logs.find(l => l.id === logId);

            if (!log) {
                throw new Error("Log not found");
            }

            this.renderLogDetails(log);
            this.detailsModal.show();

        } catch (error) {
            console.error("Failed to show log details:", error);
            global.logger?.error("frontend", "audit", "Failed to show log details", { error: error.message });
            this.showError("Failed to load log details. Please try again.");
        }
    }

    /**
     * Render log details in details modal
     * @private
     * @param {Object} log - Log object
     */
    renderLogDetails(log) {
        const content = document.getElementById("auditLogDetailsContent");
        if (!content) return;

        // Extract message and metadata
        let messageStr = "";
        let metadata = {};
        let username = "";

        if (typeof log.message === "object" && log.message !== null) {
            messageStr = log.message.message || "";
            metadata = log.message.data || {};
            // Extract username from encrypted message data
            username = metadata.username || log.username;
        } else {
            messageStr = log.message || "";
            username = log.username;
        }

        // Build HTML with core fields
        let html = `
            <dt class="col-sm-3">Log ID:</dt>
            <dd class="col-sm-9">${log.id}</dd>

            <dt class="col-sm-3">Timestamp:</dt>
            <dd class="col-sm-9">${this.formatTimestamp(log.timestamp)}</dd>

            <dt class="col-sm-3">Category:</dt>
            <dd class="col-sm-9"><span class="badge ${this.getCategoryBadgeColor(log.category)}">${log.category}</span></dd>

            <dt class="col-sm-3">Message:</dt>
            <dd class="col-sm-9">${this.escapeHtml(messageStr)}</dd>
        `;

        // Add user-related fields only if present
        if (log.user_id) {
            html += `
            <dt class="col-sm-3">User ID:</dt>
            <dd class="col-sm-9">${log.user_id}</dd>
            `;
        }

        if (username) {
            html += `
            <dt class="col-sm-3">Username:</dt>
            <dd class="col-sm-9">${username}</dd>
            `;
        }

        // Add network-related fields only if present
        if (log.ip_address) {
            html += `
            <dt class="col-sm-3">IP Address:</dt>
            <dd class="col-sm-9">${log.ip_address}</dd>
            `;
        }

        if (log.user_agent) {
            html += `
            <dt class="col-sm-3">User Agent:</dt>
            <dd class="col-sm-9 text-break">${this.escapeHtml(log.user_agent)}</dd>
            `;
        }

        if (log.request_id) {
            html += `
            <dt class="col-sm-3">Request ID:</dt>
            <dd class="col-sm-9">${log.request_id}</dd>
            `;
        }

        // Dynamically render metadata fields with friendly names
        if (Object.keys(metadata).length > 0) {
            // Separator before metadata section
            html += `<div class="col-12"><hr class="my-2"></div>`;

            // Define friendly labels for common metadata fields
            const fieldLabels = {
                // Import-related fields
                importId: "Import ID",
                sessionId: "Session ID",
                scanDate: "Scan Date",
                vendor: "Vendor(s)",
                vendorList: "Vendor List",
                processedRows: "Processed Rows",
                insertedToCurrent: "Inserted to Current",
                updatedInCurrent: "Updated in Current",
                insertedToSnapshots: "Inserted to Snapshots",
                resolvedCount: "Resolved Count",
                totalProcessingTime: "Total Processing Time (ms)",
                rowsPerSecond: "Rows Per Second",
                // User-related fields
                userId: "User ID",
                username: "Username",
                rememberMe: "Remember Me",
                ip: "IP Address",
                reason: "Reason",
                userAgent: "User Agent",
                // Ticket-related fields
                ticketId: "Ticket ID",
                xtNumber: "XT Number",
                priority: "Priority",
                status: "Status",
                site: "Site",
                location: "Location",
                changes: "Changes",
                changeCount: "Fields Changed",
                previousStatus: "Previous Status",
                newStatus: "New Status",
                transitionType: "Transition Type",
                deletionReason: "Deletion Reason",
                deletedBy: "Deleted By",
                softDelete: "Soft Delete",
                totalTickets: "Total Tickets",
                successCount: "Successfully Migrated",
                errorCount: "Errors",
                migrationSource: "Migration Source"
            };

            // Special rendering for import.complete with diff data
            if (log.category === "import.complete" && metadata.diff) {
                const diff = metadata.diff;

                html += `
                <dt class="col-sm-12"><h6 class="mb-3">Import Diff Summary</h6></dt>

                <!-- New CVEs Section -->
                <dt class="col-sm-3">New CVEs:</dt>
                <dd class="col-sm-9">
                    <span class="badge bg-danger me-1">${diff.newCves.count} CVEs</span>
                    <span class="badge bg-secondary me-1">${diff.newCves.totalVulnerabilities} vulnerabilities</span>
                    <span class="badge bg-warning">${diff.newCves.totalVpr.toFixed(1)} VPR</span>
                    ${diff.newCves.topCritical && diff.newCves.topCritical.length > 0 ? `
                        <div class="mt-2">
                            <strong>Top Critical:</strong>
                            <ul class="mb-0">
                                ${diff.newCves.topCritical.map(c =>
                                    `<li>${this.escapeHtml(c.cve)} (${c.hosts} hosts)</li>`
                                ).join("")}
                            </ul>
                        </div>
                    ` : ""}
                </dd>

                <!-- Resolved CVEs Section -->
                <dt class="col-sm-3">Resolved CVEs:</dt>
                <dd class="col-sm-9">
                    <span class="badge bg-success me-1">${diff.resolvedCves.count} CVEs</span>
                    <span class="badge bg-secondary me-1">${diff.resolvedCves.totalVulnerabilities} vulnerabilities</span>
                    <span class="badge bg-info">${diff.resolvedCves.totalVpr.toFixed(1)} VPR</span>
                    ${diff.resolvedCves.topCritical && diff.resolvedCves.topCritical.length > 0 ? `
                        <div class="mt-2">
                            <strong>Top Critical Resolved:</strong>
                            <ul class="mb-0">
                                ${diff.resolvedCves.topCritical.map(c =>
                                    `<li>${this.escapeHtml(c.cve)} (${c.hosts} hosts)</li>`
                                ).join("")}
                            </ul>
                        </div>
                    ` : ""}
                </dd>

                <!-- Net Change Section -->
                <dt class="col-sm-3">Net Change:</dt>
                <dd class="col-sm-9">
                    <span class="badge ${diff.netChange > 0 ? "bg-danger" : "bg-success"} me-1">
                        ${diff.netChange > 0 ? "+" : ""}${diff.netChange} vulnerabilities
                    </span>
                    <span class="badge ${diff.percentageChange > 0 ? "bg-danger" : "bg-success"}">
                        ${diff.percentageChange > 0 ? "+" : ""}${diff.percentageChange.toFixed(1)}%
                    </span>
                    ${diff.significantChange ?
                        "<span class=\"badge bg-warning ms-2\">⚠️ Significant Change</span>"
                        : ""}
                </dd>

                <!-- Severity Changes Section -->
                <dt class="col-sm-3">Severity Changes:</dt>
                <dd class="col-sm-9">
                    <table class="table table-sm table-bordered mb-0">
                        <thead>
                            <tr>
                                <th>Severity</th>
                                <th>Change</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td><span class="badge bg-danger">Critical</span></td>
                                <td>${diff.severityChanges.critical > 0 ? "+" : ""}${diff.severityChanges.critical}</td>
                            </tr>
                            <tr>
                                <td><span class="badge bg-warning">High</span></td>
                                <td>${diff.severityChanges.high > 0 ? "+" : ""}${diff.severityChanges.high}</td>
                            </tr>
                            <tr>
                                <td><span class="badge bg-info">Medium</span></td>
                                <td>${diff.severityChanges.medium > 0 ? "+" : ""}${diff.severityChanges.medium}</td>
                            </tr>
                            <tr>
                                <td><span class="badge bg-secondary">Low</span></td>
                                <td>${diff.severityChanges.low > 0 ? "+" : ""}${diff.severityChanges.low}</td>
                            </tr>
                        </tbody>
                    </table>
                </dd>

                <div class="col-12"><hr class="my-2"></div>
                <dt class="col-sm-12"><h6 class="mb-3">Import Statistics</h6></dt>
                `;
            }

            // Render each metadata field (excluding diff, which was already rendered)
            for (const [key, value] of Object.entries(metadata)) {
                // Skip diff field as it's been specially rendered above
                if (key === "diff") continue;

                const label = fieldLabels[key] || this.formatFieldName(key);
                const displayValue = this.formatFieldValue(value);

                html += `
                <dt class="col-sm-3">${label}:</dt>
                <dd class="col-sm-9">${displayValue}</dd>
                `;
            }

            // Keep raw JSON at the bottom for reference
            html += `
            <div class="col-12"><hr class="my-2"></div>
            <dt class="col-sm-3">Raw Metadata:</dt>
            <dd class="col-sm-9">
                <pre class="bg-dark text-white p-2 rounded"><code>${JSON.stringify(metadata, null, 2)}</code></pre>
            </dd>
            `;
        }

        content.innerHTML = html;
    }

    /**
     * Format field name from camelCase to Title Case
     * @private
     * @param {string} fieldName - Field name in camelCase
     * @returns {string} Formatted field name
     */
    formatFieldName(fieldName) {
        // Convert camelCase to Title Case with spaces
        return fieldName
            .replace(/([A-Z])/g, " $1")
            .replace(/^./, str => str.toUpperCase())
            .trim();
    }

    /**
     * Format field value for display
     * @private
     * @param {*} value - Field value
     * @returns {string} Formatted value
     */
    formatFieldValue(value) {
        if (value === null || value === undefined) {
            return "-";
        }
        if (typeof value === "boolean") {
            return value ? "Yes" : "No";
        }
        if (typeof value === "object") {
            return JSON.stringify(value);
        }
        // Escape HTML for string values
        return this.escapeHtml(String(value));
    }

    /**
     * Show loading state
     * @private
     */
    showLoading() {
        document.getElementById("auditLogsLoading")?.classList.remove("d-none");
        document.getElementById("auditLogsTable")?.closest(".table-responsive")?.classList.add("d-none");
        document.getElementById("auditLogsEmpty")?.classList.add("d-none");
        document.getElementById("auditLogsError")?.classList.add("d-none");
    }

    /**
     * Hide loading state
     * @private
     */
    hideLoading() {
        document.getElementById("auditLogsLoading")?.classList.add("d-none");
        document.getElementById("auditLogsTable")?.closest(".table-responsive")?.classList.remove("d-none");
    }

    /**
     * Show error message
     * @private
     * @param {string} message - Error message
     */
    showError(message) {
        const errorDiv = document.getElementById("auditLogsError");
        const errorMessage = document.getElementById("auditLogsErrorMessage");

        if (errorDiv && errorMessage) {
            errorMessage.textContent = message;
            errorDiv.classList.remove("d-none");
        }

        // Hide loading and empty states
        document.getElementById("auditLogsLoading")?.classList.add("d-none");
        document.getElementById("auditLogsEmpty")?.classList.add("d-none");
    }

    /**
     * Get badge color class for category
     * @private
     * @param {string} category - Log category
     * @returns {string} Bootstrap badge color class
     */
    getCategoryBadgeColor(category) {
        const colorMap = {
            // User authentication
            "user.login": "bg-success",           // Green for successful logins
            "user.logout": "bg-secondary",        // Gray for logouts
            "user.failed_login": "bg-danger",     // Red for failed logins
            // Ticket operations
            "ticket.create": "bg-success",        // Green for ticket creation
            "ticket.update": "bg-primary",        // Blue for ticket updates
            "ticket.delete": "bg-danger",         // Red for ticket deletion
            "ticket.status_change": "bg-warning", // Yellow for status changes
            "ticket.migrate": "bg-info",          // Cyan for migrations
            // Import operations
            "import.start": "bg-info",            // Cyan for import start
            "import.complete": "bg-primary",      // Blue for imports
            "import.failed": "bg-danger",         // Red for failed imports
            // Database operations
            "database.vacuum": "bg-warning",      // Yellow for database maintenance
            // System messages
            "system.error": "bg-danger",          // Red for errors
            "system.warning": "bg-warning",       // Yellow for warnings
            "system.info": "bg-info"              // Cyan for info
        };

        return colorMap[category] || "bg-info"; // Default to info blue
    }

    /**
     * Format timestamp for display
     * @private
     * @param {string} timestamp - ISO timestamp
     * @returns {string} Formatted timestamp
     */
    formatTimestamp(timestamp) {
        if (!timestamp) return "-";

        const date = new Date(timestamp);
        return date.toLocaleString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit"
        });
    }

    /**
     * Escape HTML to prevent XSS
     * @private
     * @param {string} text - Text to escape
     * @returns {string} Escaped text
     */
    escapeHtml(text) {
        const div = document.createElement("div");
        div.textContent = text;
        return div.innerHTML;
    }
}

// Initialize global instance when DOM is ready
if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
        window.auditLogModalManager = new AuditLogModalManager();
    });
} else {
    window.auditLogModalManager = new AuditLogModalManager();
}
