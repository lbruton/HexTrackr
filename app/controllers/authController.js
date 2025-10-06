/**
 * AuthController - HTTP request handlers for authentication
 * Handles login, logout, session status, password changes, and user profile
 *
 * Delegates business logic to AuthService
 * Returns standardized JSON responses: {success: boolean, data?: any, error?: string, details?: any}
 */

const AuthService = require("../services/authService");
const { extendSession } = require("../middleware/auth");

class AuthController {
    constructor() {
        this.authService = new AuthService();
    }

    /**
     * Initialize controller with database connection
     * Called from server.js during setup
     * @param {sqlite3.Database} database - Database connection
     */
    static initialize(database) {
        if (!AuthController.instance) {
            AuthController.instance = new AuthController();
        }
        AuthController.instance.authService.initialize(database);
        return AuthController.instance;
    }

    /**
     * Get singleton instance (for use in routes)
     * @returns {AuthController} Controller instance
     */
    static getInstance() {
        if (!AuthController.instance) {
            throw new Error("AuthController not initialized. Call initialize() first.");
        }
        return AuthController.instance;
    }

    /**
     * Login endpoint - POST /api/auth/login
     * Authenticates user and creates session
     * @param {Object} req - Express request
     * @param {Object} req.body - Request body
     * @param {string} req.body.username - Username
     * @param {string} req.body.password - Password
     * @param {boolean} [req.body.rememberMe] - Remember Me option (30-day session)
     * @param {Object} res - Express response
     */
    static async login(req, res) {
        try {
            const { username, password, rememberMe } = req.body;

            // Input validation
            if (!username || !password) {
                return res.status(400).json({
                    success: false,
                    error: "Username and password are required"
                });
            }

            const controller = AuthController.getInstance();
            const result = await controller.authService.authenticateUser(username, password);

            // Authentication failed (invalid username or password)
            if (!result) {
                return res.status(401).json({
                    success: false,
                    error: "Invalid username or password"
                });
            }

            // Account locked due to too many failed attempts
            if (result.locked) {
                // Get remaining attempts for details
                const attemptsRemaining = await controller.authService.getRemainingAttempts(result.userId);

                return res.status(403).json({
                    success: false,
                    error: "Account locked due to too many failed login attempts",
                    details: {
                        lockoutMinutes: 15,
                        attemptsRemaining
                    }
                });
            }

            // Authentication successful - create session
            req.session.userId = result.id;
            req.session.username = result.username;
            req.session.role = result.role;

            // Extend session if Remember Me is enabled
            if (rememberMe) {
                extendSession(req);
            }

            // Save session before sending response (required for async stores)
            req.session.save((err) => {
                if (err) {
                    console.error("Session save error:", err);
                    return res.status(500).json({
                        success: false,
                        error: "Failed to create session"
                    });
                }

                // Return success with user details (without password hash)
                res.json({
                    success: true,
                    data: {
                        user: {
                            id: result.id,
                            username: result.username,
                            role: result.role,
                            last_login: result.last_login
                        }
                    }
                });
            });

        } catch (error) {
            console.error("Login error:", error);
            res.status(500).json({
                success: false,
                error: "Login failed",
                details: error.message
            });
        }
    }

    /**
     * Logout endpoint - POST /api/auth/logout
     * Destroys session and logs user out
     * @param {Object} req - Express request
     * @param {Object} res - Express response
     */
    static async logout(req, res) {
        try {
            // Destroy session
            req.session.destroy((err) => {
                if (err) {
                    console.error("Logout error:", err);
                    // Even if session destroy fails, clear the cookie
                    res.clearCookie("hextrackr.sid");
                    return res.status(500).json({
                        success: false,
                        error: "Logout failed",
                        details: err.message
                    });
                }

                // Clear session cookie to ensure complete logout
                res.clearCookie("hextrackr.sid");

                res.json({
                    success: true,
                    data: {
                        message: "Logged out successfully"
                    }
                });
            });

        } catch (error) {
            console.error("Logout error:", error);
            // Clear cookie even on error
            res.clearCookie("hextrackr.sid");
            res.status(500).json({
                success: false,
                error: "Logout failed",
                details: error.message
            });
        }
    }

    /**
     * Status endpoint - GET /api/auth/status
     * Returns current authentication status
     * @param {Object} req - Express request
     * @param {Object} res - Express response
     */
    static async status(req, res) {
        try {
            // Check if session exists and has userId
            if (!req.session || !req.session.userId) {
                return res.json({
                    success: true,
                    data: {
                        authenticated: false
                    }
                });
            }

            // Validate session user still exists
            const controller = AuthController.getInstance();
            const isValid = await controller.authService.validateSession(req.session.userId);

            if (!isValid) {
                // User no longer exists - destroy session
                req.session.destroy(() => {});
                return res.json({
                    success: true,
                    data: {
                        authenticated: false
                    }
                });
            }

            // Return authenticated status with user info
            res.json({
                success: true,
                data: {
                    authenticated: true,
                    user: {
                        id: req.session.userId,
                        username: req.session.username,
                        role: req.session.role
                    }
                }
            });

        } catch (error) {
            console.error("Status check error:", error);
            res.status(500).json({
                success: false,
                error: "Status check failed",
                details: error.message
            });
        }
    }

    /**
     * Change password endpoint - POST /api/auth/change-password
     * Changes user password with old password verification
     * Requires authentication (requireAuth middleware)
     * @param {Object} req - Express request
     * @param {Object} req.body - Request body
     * @param {string} req.body.oldPassword - Current password
     * @param {string} req.body.newPassword - New password
     * @param {Object} res - Express response
     */
    static async changePassword(req, res) {
        try {
            const { oldPassword, newPassword } = req.body;

            // Input validation
            if (!oldPassword || !newPassword) {
                return res.status(400).json({
                    success: false,
                    error: "Old password and new password are required"
                });
            }

            // Password strength validation (minimum 8 characters)
            if (newPassword.length < 8) {
                return res.status(400).json({
                    success: false,
                    error: "New password must be at least 8 characters long"
                });
            }

            // Get userId from session (set by requireAuth middleware)
            const userId = req.user.id;

            const controller = AuthController.getInstance();
            const result = await controller.authService.changePassword(userId, oldPassword, newPassword);

            if (!result.success) {
                return res.status(401).json({
                    success: false,
                    error: result.error
                });
            }

            res.json({
                success: true,
                data: {
                    message: result.message
                }
            });

        } catch (error) {
            console.error("Change password error:", error);
            res.status(500).json({
                success: false,
                error: "Password change failed",
                details: error.message
            });
        }
    }

    /**
     * Get profile endpoint - GET /api/auth/profile
     * Returns current user profile details
     * Requires authentication (requireAuth middleware)
     * @param {Object} req - Express request
     * @param {Object} res - Express response
     */
    static async getProfile(req, res) {
        try {
            // Get userId from session (set by requireAuth middleware)
            const userId = req.user.id;

            const controller = AuthController.getInstance();
            const user = await controller.authService.getUserById(userId);

            if (!user) {
                // User not found - destroy session
                req.session.destroy(() => {});
                return res.status(404).json({
                    success: false,
                    error: "User not found"
                });
            }

            // Return user profile without password hash
            const { password_hash, failed_login_count, failed_login_timestamp, ...profile } = user;

            res.json({
                success: true,
                data: {
                    user: profile
                }
            });

        } catch (error) {
            console.error("Get profile error:", error);
            res.status(500).json({
                success: false,
                error: "Failed to retrieve profile",
                details: error.message
            });
        }
    }
}

module.exports = AuthController;
