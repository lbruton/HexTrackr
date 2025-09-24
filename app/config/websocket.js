/**
 * WebSocket Configuration Module
 *
 * Centralized configuration for Socket.io WebSocket server
 * Used by the main server for real-time communication and progress tracking
 *
 * @fileoverview Socket.io configuration including CORS, connection settings,
 *               transport methods, and event handling parameters
 */

const {
    WEBSOCKET_PORT,
    CORS_ORIGINS,
    CORS_METHODS,
    WEBSOCKET_PING_TIMEOUT,
    WEBSOCKET_PING_INTERVAL
} = require("../utils/constants");

/**
 * WebSocket server configuration
 * @type {Object}
 */
const websocketConfig = {
    /**
     * WebSocket server port (planned for future use)
     * Currently WebSocket runs on same port as HTTP server
     * @type {number}
     */
    port: WEBSOCKET_PORT,

    /**
     * Socket.io server options
     * @type {Object}
     */
    options: {
        /**
         * CORS configuration for WebSocket connections
         * @type {Object}
         */
        cors: {
            origin: CORS_ORIGINS,
            methods: CORS_METHODS,
            credentials: true
        },

        /**
         * Connection timeout settings
         * Time before considering a connection dead if no pong received
         * @type {number} milliseconds
         */
        pingTimeout: WEBSOCKET_PING_TIMEOUT,

        /**
         * Ping interval for keeping connections alive
         * How often to send ping packets
         * @type {number} milliseconds
         */
        pingInterval: WEBSOCKET_PING_INTERVAL,

        /**
         * Transport methods allowed
         * @type {string[]}
         */
        transports: ["polling", "websocket"],

        /**
         * Time to wait for transport upgrade
         * @type {number} milliseconds
         */
        upgradeTimeout: 10000,

        /**
         * Maximum buffer size for messages
         * @type {number} bytes
         */
        maxBufferSize: 1e6,

        /**
         * Allow HTTP long-polling fallback
         * @type {boolean}
         */
        allowEIO3: true
    },

    /**
     * Standardized event names for WebSocket communication
     * @type {Object}
     */
    events: {
        // Connection events
        CONNECTION: "connection",
        DISCONNECT: "disconnect",

        // Progress tracking events
        JOIN_PROGRESS: "join-progress",
        LEAVE_PROGRESS: "leave-progress",
        PROGRESS_STATUS: "progress-status",
        PROGRESS_UPDATE: "progress-update",

        // Import operation events
        IMPORT_STARTED: "import-started",
        IMPORT_PROGRESS: "import-progress",
        IMPORT_COMPLETED: "import-completed",
        IMPORT_ERROR: "import-error",

        // General data events
        DATA_REFRESH: "data-refresh",
        NOTIFICATION: "notification"
    },

    /**
     * Room/namespace configuration
     * @type {Object}
     */
    rooms: {
        /**
         * Progress tracking room prefix
         * Rooms are named: progress-{sessionId}
         * @type {string}
         */
        PROGRESS_PREFIX: "progress-",

        /**
         * Global notification room
         * @type {string}
         */
        NOTIFICATIONS: "notifications",

        /**
         * Admin operations room
         * @type {string}
         */
        ADMIN: "admin"
    },

    /**
     * Message size limits and throttling
     * @type {Object}
     */
    limits: {
        /**
         * Maximum message size in bytes
         * @type {number}
         */
        maxMessageSize: 1024 * 1024, // 1MB

        /**
         * Rate limiting: messages per second per connection
         * @type {number}
         */
        messagesPerSecond: 10,

        /**
         * Maximum number of rooms a client can join
         * @type {number}
         */
        maxRoomsPerClient: 10
    },

    /**
     * Development/debugging settings
     * @type {Object}
     */
    debug: {
        /**
         * Log connection events
         * @type {boolean}
         */
        logConnections: true,

        /**
         * Log room join/leave events
         * @type {boolean}
         */
        logRooms: true,

        /**
         * Log progress updates
         * @type {boolean}
         */
        logProgress: false // Set to true for verbose progress logging
    }
};

/**
 * Get Socket.io server options
 * @returns {Object} Socket.io server configuration options
 */
function getSocketOptions() {
    return websocketConfig.options;
}

/**
 * Get event names object
 * @returns {Object} Standardized event names
 */
function getEventNames() {
    return websocketConfig.events;
}

/**
 * Get room configuration
 * @returns {Object} Room naming and configuration
 */
function getRoomConfig() {
    return websocketConfig.rooms;
}

/**
 * Get progress room name for a session
 * @param {string} sessionId - Session identifier
 * @returns {string} Progress room name
 */
function getProgressRoom(sessionId) {
    return `${websocketConfig.rooms.PROGRESS_PREFIX}${sessionId}`;
}

/**
 * Get debugging configuration
 * @returns {Object} Debug settings
 */
function getDebugConfig() {
    return websocketConfig.debug;
}

/**
 * Get rate limiting configuration
 * @returns {Object} Rate limiting and size limits
 */
function getLimitsConfig() {
    return websocketConfig.limits;
}

module.exports = {
    websocketConfig,
    getSocketOptions,
    getEventNames,
    getRoomConfig,
    getProgressRoom,
    getDebugConfig,
    getLimitsConfig
};