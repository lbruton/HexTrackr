const ProgressTracker = require("../utils/ProgressTracker");

/**
 * ProgressService - High-level service for managing import/export progress tracking
 *
 * This service provides a convenient interface for tracking progress of long-running
 * operations like CSV imports, exports, and batch processing. It builds on top of
 * the ProgressTracker utility to provide domain-specific functionality.
 *
 * Features:
 * - Import progress tracking with standardized phases
 * - Export progress tracking for various data types
 * - Batch operation progress management
 * - WebSocket integration for real-time updates
 * - Session lifecycle management
 * - Error handling and recovery
 *
 * Usage:
 * const progressService = new ProgressService(io);
 * const sessionId = progressService.startImport("vulnerabilities.csv", 10000);
 * progressService.updateImportProgress(sessionId, 500, "processing");
 * progressService.completeImport(sessionId, { imported: 9500, errors: 500 });
 */
class ProgressService {
    constructor(io) {
        this.progressTracker = new ProgressTracker(io);
        this.io = io;

        // Import phase definitions with progress ranges
        this.IMPORT_PHASES = {
            PARSING: { start: 0, end: 15, name: "parsing" },
            STAGING: { start: 15, end: 60, name: "staging" },
            PROCESSING: { start: 60, end: 95, name: "processing" },
            FINALIZING: { start: 95, end: 100, name: "finalizing" }
        };

        // Export phase definitions
        this.EXPORT_PHASES = {
            PREPARING: { start: 0, end: 20, name: "preparing" },
            QUERYING: { start: 20, end: 70, name: "querying" },
            FORMATTING: { start: 70, end: 90, name: "formatting" },
            FINALIZING: { start: 90, end: 100, name: "finalizing" }
        };
    }

    /**
     * Start tracking progress for a CSV import operation
     * @param {string} filename - Name of the file being imported
     * @param {number} totalRows - Total number of rows to process
     * @param {string} vendor - Vendor/source of the data
     * @param {string} scanDate - Date of the scan data
     * @param {string} customSessionId - Optional custom session ID
     * @returns {string} sessionId - Unique session identifier
     */
    startImport(filename, totalRows, vendor = "unknown", scanDate = null, customSessionId = null) {
        const metadata = {
            operation: "csv-import",
            filename: filename,
            vendor: vendor,
            scanDate: scanDate || new Date().toISOString(),
            totalRows: totalRows,
            totalSteps: 4, // Parse, Stage, Process, Finalize
            currentStep: 0,
            phase: "initializing",
            processedRows: 0,
            insertedRows: 0,
            errorCount: 0
        };

        const sessionId = customSessionId ?
            this.progressTracker.createSessionWithId(customSessionId, metadata) :
            this.progressTracker.createSession(metadata);

        console.log(`📊 Import session started: ${sessionId} for ${filename} (${totalRows} rows)`);
        return sessionId;
    }

    /**
     * Update import progress based on current phase and processed items
     * @param {string} sessionId - Session identifier
     * @param {number} processed - Number of items processed in current phase
     * @param {string} status - Current operation status
     * @param {Object} additionalData - Additional metadata
     * @returns {boolean} Success status
     */
    updateImportProgress(sessionId, processed, status, additionalData = {}) {
        const session = this.progressTracker.getSession(sessionId);
        if (!session) {
            console.warn(`Import progress update attempted for unknown session: ${sessionId}`);
            return false;
        }

        const phase = additionalData.phase || session.metadata.phase;
        const phaseConfig = this.IMPORT_PHASES[phase.toUpperCase()] || this.IMPORT_PHASES.PROCESSING;

        // Calculate progress within the current phase
        const totalInPhase = additionalData.totalInPhase || session.metadata.totalRows || 1;
        const phaseProgress = Math.min(100, (processed / totalInPhase) * 100);
        const progressRange = phaseConfig.end - phaseConfig.start;
        const overallProgress = phaseConfig.start + (phaseProgress * progressRange / 100);

        const message = this.formatImportMessage(phase, processed, totalInPhase, status);

        return this.progressTracker.updateProgress(sessionId, overallProgress, message, {
            phase: phase,
            processedRows: processed,
            totalInPhase: totalInPhase,
            phaseProgress: phaseProgress,
            currentStep: additionalData.currentStep || session.metadata.currentStep,
            ...additionalData
        });
    }

    /**
     * Update import progress for CSV parsing phase
     * @param {string} sessionId - Session identifier
     * @param {number} rowCount - Number of rows parsed
     * @param {string} status - Parsing status
     * @returns {boolean} Success status
     */
    updateImportParsingProgress(sessionId, rowCount, status = "parsing") {
        return this.updateImportProgress(sessionId, rowCount, status, {
            phase: "parsing",
            currentStep: 1,
            totalInPhase: rowCount
        });
    }

    /**
     * Update import progress for staging phase
     * @param {string} sessionId - Session identifier
     * @param {number} staged - Number of rows staged
     * @param {number} total - Total rows to stage
     * @param {string} status - Staging status
     * @returns {boolean} Success status
     */
    updateImportStagingProgress(sessionId, staged, total, status = "staging") {
        return this.updateImportProgress(sessionId, staged, status, {
            phase: "staging",
            currentStep: 2,
            totalInPhase: total,
            insertedToStaging: staged
        });
    }

    /**
     * Update import progress for batch processing phase
     * @param {string} sessionId - Session identifier
     * @param {number} currentBatch - Current batch number
     * @param {number} totalBatches - Total number of batches
     * @param {number} processedRows - Total rows processed so far
     * @param {string} _status - Processing status (unused, reserved for future metadata)
     * @returns {boolean} Success status
     */
    updateImportBatchProgress(sessionId, currentBatch, totalBatches, processedRows, _status = "processing") {
        const batchProgress = (currentBatch / totalBatches) * 100;
        const phaseConfig = this.IMPORT_PHASES.PROCESSING;
        const overallProgress = phaseConfig.start + (batchProgress * (phaseConfig.end - phaseConfig.start) / 100);

        const message = `Processing batch ${currentBatch}/${totalBatches} (${processedRows} rows processed)...`;

        return this.progressTracker.updateProgress(sessionId, overallProgress, message, {
            phase: "processing",
            currentStep: 3,
            currentBatch: currentBatch,
            totalBatches: totalBatches,
            processedRows: processedRows,
            batchProgress: batchProgress
        });
    }

    /**
     * Complete an import operation with final results
     * @param {string} sessionId - Session identifier
     * @param {Object} results - Final import results
     * @returns {boolean} Success status
     */
    completeImport(sessionId, results = {}) {
        const {
            totalProcessed = 0,
            totalInserted = 0,
            totalErrors = 0,
            duration = 0,
            ...additionalResults
        } = results;

        const message = `Import completed: ${totalInserted} records inserted, ${totalErrors} errors`;

        return this.progressTracker.completeSession(sessionId, message, {
            phase: "completed",
            totalProcessed: totalProcessed,
            totalInserted: totalInserted,
            totalErrors: totalErrors,
            duration: duration,
            successRate: totalProcessed > 0 ? ((totalInserted / totalProcessed) * 100).toFixed(1) : 0,
            ...additionalResults
        });
    }

    /**
     * Start tracking progress for an export operation
     * @param {string} type - Type of export (vulnerabilities, tickets, combined)
     * @param {number} totalItems - Total number of items to export
     * @param {string} format - Export format (json, csv, xlsx)
     * @param {string} customSessionId - Optional custom session ID
     * @returns {string} sessionId - Unique session identifier
     */
    startExport(type, totalItems, format = "json", customSessionId = null) {
        const metadata = {
            operation: "data-export",
            exportType: type,
            format: format,
            totalItems: totalItems,
            totalSteps: 4, // Prepare, Query, Format, Finalize
            currentStep: 0,
            phase: "preparing",
            processedItems: 0,
            exportedItems: 0
        };

        const sessionId = customSessionId ?
            this.progressTracker.createSessionWithId(customSessionId, metadata) :
            this.progressTracker.createSession(metadata);

        console.log(`📤 Export session started: ${sessionId} for ${type} (${totalItems} items, ${format} format)`);
        return sessionId;
    }

    /**
     * Update export progress based on current phase
     * @param {string} sessionId - Session identifier
     * @param {number} processed - Number of items processed
     * @param {string} phase - Current export phase
     * @param {string} status - Current operation status
     * @returns {boolean} Success status
     */
    updateExportProgress(sessionId, processed, phase = "querying", status = "") {
        const session = this.progressTracker.getSession(sessionId);
        if (!session) {
            console.warn(`Export progress update attempted for unknown session: ${sessionId}`);
            return false;
        }

        const phaseConfig = this.EXPORT_PHASES[phase.toUpperCase()] || this.EXPORT_PHASES.QUERYING;
        const totalItems = session.metadata.totalItems || 1;

        // Calculate progress within the current phase
        const phaseProgress = Math.min(100, (processed / totalItems) * 100);
        const progressRange = phaseConfig.end - phaseConfig.start;
        const overallProgress = phaseConfig.start + (phaseProgress * progressRange / 100);

        const message = this.formatExportMessage(phase, processed, totalItems, status);

        return this.progressTracker.updateProgress(sessionId, overallProgress, message, {
            phase: phase,
            processedItems: processed,
            totalItems: totalItems,
            phaseProgress: phaseProgress,
            currentStep: this.getExportStepNumber(phase)
        });
    }

    /**
     * Complete an export operation with final results
     * @param {string} sessionId - Session identifier
     * @param {Object} results - Final export results
     * @returns {boolean} Success status
     */
    completeExport(sessionId, results = {}) {
        const {
            totalExported = 0,
            fileSize = 0,
            filePath = "",
            duration = 0,
            ...additionalResults
        } = results;

        const message = `Export completed: ${totalExported} records exported${fileSize > 0 ? ` (${this.formatFileSize(fileSize)})` : ""}`;

        return this.progressTracker.completeSession(sessionId, message, {
            phase: "completed",
            totalExported: totalExported,
            fileSize: fileSize,
            filePath: filePath,
            duration: duration,
            ...additionalResults
        });
    }

    /**
     * Get progress information for a session
     * @param {string} sessionId - Session identifier
     * @returns {Object|null} Session progress data or null if not found
     */
    getProgress(sessionId) {
        return this.progressTracker.getSession(sessionId);
    }

    /**
     * Handle import/export errors
     * @param {string} sessionId - Session identifier
     * @param {string} errorMessage - Error description
     * @param {Object} errorData - Error details
     * @returns {boolean} Success status
     */
    handleError(sessionId, errorMessage, errorData = {}) {
        return this.progressTracker.errorSession(sessionId, errorMessage, errorData);
    }

    /**
     * Get all active progress sessions
     * @returns {Array} Array of active session objects
     */
    getActiveSessions() {
        const sessions = [];
        for (const [sessionId, session] of this.progressTracker.sessions.entries()) {
            if (session.status !== "completed" && session.status !== "error") {
                sessions.push({
                    sessionId,
                    ...session
                });
            }
        }
        return sessions;
    }

    /**
     * Clean up a specific session
     * @param {string} sessionId - Session identifier
     * @returns {boolean} Success status
     */
    cleanupSession(sessionId) {
        if (this.progressTracker.sessions.has(sessionId)) {
            this.progressTracker.sessions.delete(sessionId);
            this.progressTracker.eventThrottle.delete(sessionId);
            console.log(`🧹 Manually cleaned up session: ${sessionId}`);
            return true;
        }
        return false;
    }

    /**
     * Broadcast a custom progress event to all connected clients
     * @param {string} eventName - Event name
     * @param {Object} data - Event data
     */
    broadcastEvent(eventName, data) {
        this.io.emit(eventName, data);
    }

    // Private helper methods

    /**
     * Format import progress message based on phase and status
     * @private
     */
    formatImportMessage(phase, processed, total, status) {
        switch (phase.toLowerCase()) {
            case "parsing":
                return `Parsing CSV file: ${processed} rows found...`;
            case "staging":
                return `Loading to staging table: ${processed}/${total} rows...`;
            case "processing":
                return `Processing data: ${processed}/${total} rows...`;
            case "finalizing":
                return "Finalizing import and cleaning up...";
            default:
                return `${status}: ${processed}/${total} items...`;
        }
    }

    /**
     * Format export progress message based on phase and status
     * @private
     */
    formatExportMessage(phase, processed, total, status) {
        switch (phase.toLowerCase()) {
            case "preparing":
                return "Preparing export query and filters...";
            case "querying":
                return `Retrieving data: ${processed}/${total} records...`;
            case "formatting":
                return `Formatting data for export: ${processed}/${total} records...`;
            case "finalizing":
                return "Finalizing export file...";
            default:
                return `${status}: ${processed}/${total} items...`;
        }
    }

    /**
     * Get step number for export phase
     * @private
     */
    getExportStepNumber(phase) {
        switch (phase.toLowerCase()) {
            case "preparing": return 1;
            case "querying": return 2;
            case "formatting": return 3;
            case "finalizing": return 4;
            default: return 2;
        }
    }

    /**
     * Format file size for display
     * @private
     */
    formatFileSize(bytes) {
        if (bytes === 0) {return "0 B";}
        const k = 1024;
        const sizes = ["B", "KB", "MB", "GB"];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
    }
}

module.exports = ProgressService;