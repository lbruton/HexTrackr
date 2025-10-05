const session = require("express-session");
const SQLiteStore = require("better-sqlite3-session-store")(session);
const Database = require("better-sqlite3");

/**
 * Session middleware configuration
 * Uses SQLite session store with automatic expiry cleanup
 * @type {Function}
 */
const sessionMiddleware = session({
    store: new SQLiteStore({
        client: new Database("app/public/data/sessions.db"),
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
        secure: process.env.NODE_ENV === "production", // HTTPS only in production
        httpOnly: true,
        sameSite: "strict",
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    },
    proxy: process.env.TRUST_PROXY === "true"
});

/**
 * Authentication middleware - protects routes requiring login
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 * @param {Function} next - Next middleware
 */
function requireAuth(req, res, next) {
    if (!req.session || !req.session.userId) {
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
