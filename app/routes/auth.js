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

// Protected routes (require authentication)
router.post("/logout", requireAuth, AuthController.logout);
router.post("/change-password", requireAuth, AuthController.changePassword);
router.get("/profile", requireAuth, AuthController.getProfile);

module.exports = router;
