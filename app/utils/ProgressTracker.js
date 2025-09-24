const crypto = require("crypto");

/**
 * ProgressTracker - Manages real-time progress tracking for long-running operations
 *
 * Features:
 * - Session-based progress tracking with unique IDs
 * - WebSocket integration via Socket.io for real-time updates
 * - Throttled progress events to prevent spam
 * - Automatic cleanup of stale sessions
 * - Error handling and session management
 *
 * Usage:
 * const progressTracker = new ProgressTracker(io);
 * const sessionId = progressTracker.createSession({ operation: "import" });
 * progressTracker.updateProgress(sessionId, 50, "Processing data...");
 * progressTracker.completeSession(sessionId, "Import completed");
 */
class ProgressTracker {
    constructor(io) {
        this.io = io;
        this.sessions = new Map(); // sessionId -> { progress, lastUpdate, metadata }
        this.eventThrottle = new Map(); // sessionId -> lastEmitTime
        this.THROTTLE_INTERVAL = 100; // ms - minimum time between progress events
        this.SESSION_CLEANUP_INTERVAL = 30 * 60 * 1000; // 30 minutes

        // Auto-cleanup stale sessions
        setInterval(() => this.cleanupStaleSessions(), this.SESSION_CLEANUP_INTERVAL);
    }

    /**
     * Create a new progress session with auto-generated UUID
     * @param {Object} metadata - Initial metadata for the session
     * @returns {string} sessionId - Unique session identifier
     */
    createSession(metadata = {}) {
        const sessionId = crypto.randomUUID();
        return this.createSessionWithId(sessionId, metadata);
    }

    /**
     * Create a new progress session with specified ID
     * @param {string} sessionId - Unique session identifier
     * @param {Object} metadata - Initial metadata for the session
     * @returns {string} sessionId - The session identifier
     */
    createSessionWithId(sessionId, metadata = {}) {
        const session = {
            id: sessionId,
            progress: 0,
            status: "initialized",
            startTime: Date.now(),
            lastUpdate: Date.now(),
            metadata: {
                operation: "unknown",
                totalSteps: 0,
                currentStep: 0,
                message: "",
                ...metadata
            }
        };

        this.sessions.set(sessionId, session);
        console.log(`Progress session created: ${sessionId} for ${metadata.operation || "unknown operation"}`);
        return sessionId;
    }

    /**
     * Update progress for a session with throttled WebSocket events
     * @param {string} sessionId - Session identifier
     * @param {number} progress - Progress percentage (0-100)
     * @param {string} message - Progress message
     * @param {Object} additionalData - Additional metadata to include
     * @returns {boolean} Success status
     */
    updateProgress(sessionId, progress, message = "", additionalData = {}) {
        if (!this.sessions.has(sessionId)) {
            console.warn(`Progress update attempted for unknown session: ${sessionId}`);
            return false;
        }

        const session = this.sessions.get(sessionId);
        const now = Date.now();

        // Update session data
        session.progress = Math.max(0, Math.min(100, progress));
        session.lastUpdate = now;
        session.metadata.message = message;
        session.metadata.currentStep = additionalData.currentStep || session.metadata.currentStep;

        // Add any additional metadata
        Object.assign(session.metadata, additionalData);

        // Throttle progress events to prevent spam
        const lastEmit = this.eventThrottle.get(sessionId) || 0;
        const shouldEmit = (now - lastEmit) >= this.THROTTLE_INTERVAL || progress >= 100;

        if (shouldEmit) {
            this.eventThrottle.set(sessionId, now);

            // Emit to specific room for this session
            this.io.to(`progress-${sessionId}`).emit("progress-update", {
                sessionId,
                progress: session.progress,
                message,
                status: session.status,
                timestamp: now,
                metadata: session.metadata
            });

            console.log(`Progress ${sessionId}: ${progress}% - ${message}`);
        }

        return true;
    }

    /**
     * Mark a session as completed and emit completion event
     * @param {string} sessionId - Session identifier
     * @param {string} message - Completion message
     * @param {Object} finalData - Final metadata to include
     * @returns {boolean} Success status
     */
    completeSession(sessionId, message = "Operation completed", finalData = {}) {
        if (!this.sessions.has(sessionId)) {
            console.warn(`Completion attempted for unknown session: ${sessionId}`);
            return false;
        }

        const session = this.sessions.get(sessionId);
        session.progress = 100;
        session.status = "completed";
        session.lastUpdate = Date.now();
        session.metadata.message = message;

        // Add final data
        Object.assign(session.metadata, finalData);

        // Force emit completion event (ignore throttling)
        this.io.to(`progress-${sessionId}`).emit("progress-complete", {
            sessionId,
            progress: 100,
            message,
            status: "completed",
            timestamp: session.lastUpdate,
            metadata: session.metadata,
            duration: session.lastUpdate - session.startTime
        });

        console.log(`Progress session completed: ${sessionId} - ${message}`);

        // Schedule session cleanup
        setTimeout(() => {
            this.sessions.delete(sessionId);
            this.eventThrottle.delete(sessionId);
        }, 5000); // Keep for 5 seconds after completion

        return true;
    }

    /**
     * Mark a session as errored and emit error event
     * @param {string} sessionId - Session identifier
     * @param {string} errorMessage - Error message
     * @param {Object} errorData - Error details and metadata
     * @returns {boolean} Success status
     */
    errorSession(sessionId, errorMessage, errorData = {}) {
        if (!this.sessions.has(sessionId)) {
            console.warn(`Error attempted for unknown session: ${sessionId}`);
            return false;
        }

        const session = this.sessions.get(sessionId);
        session.status = "error";
        session.lastUpdate = Date.now();
        session.metadata.message = errorMessage;
        session.metadata.error = errorData;

        // Force emit error event
        this.io.to(`progress-${sessionId}`).emit("progress-error", {
            sessionId,
            progress: session.progress,
            message: errorMessage,
            status: "error",
            timestamp: session.lastUpdate,
            metadata: session.metadata,
            error: errorData
        });

        console.error(`Progress session error: ${sessionId} - ${errorMessage}`, errorData);

        // Schedule session cleanup
        setTimeout(() => {
            this.sessions.delete(sessionId);
            this.eventThrottle.delete(sessionId);
        }, 10000); // Keep for 10 seconds after error

        return true;
    }

    /**
     * Get session data by ID
     * @param {string} sessionId - Session identifier
     * @returns {Object|null} Session object or null if not found
     */
    getSession(sessionId) {
        return this.sessions.get(sessionId) || null;
    }

    /**
     * Clean up stale sessions that haven't been updated recently
     * Automatically called via setInterval in constructor
     */
    cleanupStaleSessions() {
        const now = Date.now();
        const staleThreshold = 60 * 60 * 1000; // 1 hour

        for (const [sessionId, session] of this.sessions.entries()) {
            if (now - session.lastUpdate > staleThreshold) {
                console.log(`Cleaning up stale progress session: ${sessionId}`);
                this.sessions.delete(sessionId);
                this.eventThrottle.delete(sessionId);
            }
        }
    }
}

module.exports = ProgressTracker;