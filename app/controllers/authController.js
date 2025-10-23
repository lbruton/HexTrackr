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
                // Audit failed login attempt
                if (global.logger?.audit) {
                    global.logger.audit("user.failed_login", "Failed login attempt", {
                        username,
                        reason: "Invalid credentials",
                        ip: req.ip,
                        userAgent: req.headers["user-agent"]
                    }, null, req);
                }

                if (global.logger?.auth?.warn) {
                    global.logger.auth.warn("Authentication failed: Invalid credentials", {
                        username,
                        ip: req.ip
                    });
                }

                return res.status(401).json({
                    success: false,
                    error: "Invalid username or password"
                });
            }

            // Account locked due to too many failed attempts
            if (result.locked) {
                // Get remaining attempts for details
                const attemptsRemaining = await controller.authService.getRemainingAttempts(result.userId);

                // Audit account lockout event
                if (global.logger?.audit) {
                    global.logger.audit("user.account_locked", "Account locked due to failed login attempts", {
                        userId: result.userId,
                        lockoutMinutes: 15,
                        ip: req.ip,
                        userAgent: req.headers["user-agent"]
                    }, result.userId, req);
                }

                if (global.logger?.auth?.warn) {
                    global.logger.auth.warn("Account locked due to failed attempts", {
                        userId: result.userId,
                        lockoutMinutes: 15,
                        attemptsRemaining
                    });
                }

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
                    if (global.logger?.auth?.error) {
                        global.logger.auth.error("Session save failed during login", {
                            username,
                            error: err.message
                        });
                    } else {
                        console.error("Session save failed during login:", err);
                    }
                    return res.status(500).json({
                        success: false,
                        error: "Failed to create session"
                    });
                }

                // Audit successful login
                if (global.logger?.audit) {
                    global.logger.audit("user.login", "User logged in successfully", {
                        userId: result.id,
                        username: result.username,
                        rememberMe: !!rememberMe,
                        ip: req.ip,
                        userAgent: req.headers["user-agent"]
                    }, result.id, req);
                }

                if (global.logger?.auth?.info) {
                    global.logger.auth.info("User authenticated successfully", {
                        userId: result.id,
                        username: result.username,
                        rememberMe: !!rememberMe
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
            // Defensive logging (global.logger may not be initialized yet)
            if (global.logger?.auth?.error) {
                global.logger.auth.error("Login exception occurred", {
                    error: error.message,
                    stack: error.stack
                });
            } else {
                console.error("Login exception occurred:", error);
            }
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
            const userId = req.user?.id;
            const username = req.user?.username;

            // Destroy session
            req.session.destroy((err) => {
                if (err) {
                    if (global.logger?.auth?.error) {
                        global.logger.auth.error("Session destruction failed during logout", {
                            userId,
                            error: err.message
                        });
                    } else {
                        console.error("Session destruction failed during logout:", err);
                    }
                    // Even if session destroy fails, clear the cookie
                    res.clearCookie("hextrackr.sid");
                    return res.status(500).json({
                        success: false,
                        error: "Logout failed",
                        details: err.message
                    });
                }

                // Audit successful logout
                if (global.logger?.audit) {
                    global.logger.audit("user.logout", "User logged out", {
                        userId,
                        username,
                        ip: req.ip
                    }, userId, req);
                }

                if (global.logger?.auth?.info) {
                    global.logger.auth.info("User logged out successfully", {
                        userId,
                        username
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
            if (global.logger?.auth?.error) {
                global.logger.auth.error("Logout exception occurred", {
                    error: error.message,
                    stack: error.stack
                });
            } else {
                console.error("Logout exception occurred:", error);
            }
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
            if (global.logger?.auth?.error) {
                global.logger.auth.error("Status check exception occurred", {
                    error: error.message
                });
            } else {
                console.error("Status check exception occurred:", error);
            }
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
        // Get userId early for error logging (HEX-318)
        const userId = req.user?.id || "unknown";

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

            const controller = AuthController.getInstance();
            const result = await controller.authService.changePassword(userId, oldPassword, newPassword);

            if (!result.success) {
                if (global.logger?.auth?.warn) {
                    global.logger.auth.warn("Password change failed: Incorrect old password", {
                        userId,
                        username: req.user.username
                    });
                }
                return res.status(401).json({
                    success: false,
                    error: result.error
                });
            }

            // Audit successful password change
            if (global.logger?.audit) {
                global.logger.audit("user.password_change", "User password changed", {
                    userId,
                    username: req.user.username,
                    ip: req.ip
                }, userId, req);
            }

            if (global.logger?.auth?.info) {
                global.logger.auth.info("Password changed successfully", {
                    userId,
                    username: req.user.username
                });
            }

            res.json({
                success: true,
                data: {
                    message: result.message
                }
            });

        } catch (error) {
            if (global.logger?.auth?.error) {
                global.logger.auth.error("Password change exception occurred", {
                    userId,
                    error: error.message,
                    stack: error.stack
                });
            } else {
                console.error("Password change exception occurred:", error);
            }
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
            if (global.logger?.auth?.error) {
                global.logger.auth.error("Get profile exception occurred", {
                    error: error.message
                });
            } else {
                console.error("Get profile exception occurred:", error);
            }
            res.status(500).json({
                success: false,
                error: "Failed to retrieve profile",
                details: error.message
            });
        }
    }
}

module.exports = AuthController;
