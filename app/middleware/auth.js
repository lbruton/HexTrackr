const session = require("express-session");
const SQLiteStore = require("better-sqlite3-session-store")(session);
const Database = require("better-sqlite3");
const fs = require("fs");
const path = require("path");

// Ensure app/data directory exists before creating session database
const dataDir = path.join(__dirname, "../data");
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
}

/**
 * Session middleware configuration
 * Uses SQLite session store with automatic expiry cleanup
 * @type {Function}
 */
const sessionMiddleware = session({
    store: new SQLiteStore({
        client: new Database("app/data/sessions.db"),
        expired: {
            clear: true,
            intervalMs: 900000 // Clean expired sessions every 15 minutes
        }
    }),
    secret: process.env.SESSION_SECRET,
    name: "hextrackr.sid",
    resave: false,
    saveUninitialized: false,
    cookie: {
        // HEX-133 Task 1.6: HTTPS requirement documentation
        // secure: true REQUIRES HTTPS - browsers will reject cookies over HTTP
        // WHY: Prevents session hijacking via man-in-the-middle attacks
        // PRODUCTION: nginx reverse proxy handles SSL/TLS termination
        // DEVELOPMENT: Use Docker nginx reverse proxy (localhost:443)
        // TESTING: Access via https://localhost or https://dev.hextrackr.com
        // If login fails: Verify you're using HTTPS, not HTTP
        secure: true, // Required for HTTPS - browsers enforce this (HEX-128 Task 3.5)
        httpOnly: true,
        sameSite: "lax", // Allow cookies on top-level navigation (login redirect)
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    },
    proxy: true // ALWAYS true - we always run behind nginx reverse proxy (HEX-128 CRITICAL FIX)
});

/**
 * Authentication middleware - protects routes requiring login
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 * @param {Function} next - Next middleware
 */
function requireAuth(req, res, next) {
    if (!req.session || !req.session.userId) {
        if (global.logger?.auth?.warn) {
            global.logger.auth.warn("Unauthorized access attempt to protected route", {
                path: req.path,
                method: req.method,
                ip: req.ip
            });
        }
        return res.status(401).json({
            error: "Authentication required",
            authenticated: false
        });
    }

    // Attach user info to request for use in routes
    req.user = {
        id: req.session.userId,
        username: req.session.username,
        role: req.session.role
    };

    next();
}

/**
 * Extended session for "Remember Me" functionality
 * Call this after successful login when user checks "Remember Me"
 * @param {Object} req - Express request with session
 */
function extendSession(req) {
    if (req.session) {
        req.session.cookie.maxAge = 30 * 24 * 60 * 60 * 1000; // 30 days
    }
}

module.exports = {
    sessionMiddleware,
    requireAuth,
    extendSession
};
