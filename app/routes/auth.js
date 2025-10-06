/**
 * Authentication Routes
 * Handles user login, logout, session management, and password changes
 *
 * Routes:
 * - POST /api/auth/login - Authenticate user (public)
 * - POST /api/auth/logout - Logout user (protected)
 * - GET /api/auth/status - Check authentication status (public)
 * - POST /api/auth/change-password - Change password (protected)
 * - GET /api/auth/profile - Get user profile (protected)
 */

const express = require("express");
const AuthController = require("../controllers/authController");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

// Public routes (no authentication required)
router.post("/login", AuthController.login);
router.get("/status", AuthController.status);

/**
 * GET /api/auth/csrf - Get CSRF token for state-changing requests
 * @route GET /api/auth/csrf
 * @access Public - Required before any state-changing requests (POST, PUT, DELETE)
 * @returns {Object} JSON response with CSRF token
 * @returns {boolean} success - Always true
 * @returns {string} csrfToken - CSRF token to include in request headers
 * @description HEX-133: Generates CSRF token using csrf-sync's generateToken function.
 *              Token is bound to the request (uses session or cookies).
 *              Client must include this token in X-CSRF-Token header for all mutations.
 */
router.get("/csrf", (req, res) => {
    const csrfToken = req.app.locals.generateCsrfToken(req);
    res.json({ success: true, csrfToken });
});

// Protected routes (require authentication)
router.post("/logout", requireAuth, AuthController.logout);
router.post("/change-password", requireAuth, AuthController.changePassword);
router.get("/profile", requireAuth, AuthController.getProfile);

module.exports = router;
