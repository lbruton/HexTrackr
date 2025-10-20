const argon2 = require("argon2");

/**
 * AuthService - Authentication business logic and database operations
 * Handles user authentication, password management, and session validation
 *
 * Features:
 * - Argon2id password verification with timing-safe comparison
 * - Failed login attempt tracking (max 5 attempts, 15-minute lockout)
 * - Account lockout management
 * - Session validation
 * - Password change with verification
 */
class AuthService {
    constructor() {
        this.db = null;
    }

    /**
     * Initialize service with database connection
     * @param {sqlite3.Database} database - Database connection from server.js
     */
    initialize(database) {
        this.db = database;
    }

    /**
     * Authenticate user with username and password
     * Implements failed login tracking and account lockout
     * @param {string} username - Username to authenticate
     * @param {string} password - Plain text password to verify
     * @returns {Promise<Object|null>} User object if authenticated, null otherwise
     */
    async authenticateUser(username, password) {
        return new Promise((resolve, reject) => {
            // Fetch user by username
            this.db.get(
                "SELECT * FROM users WHERE username = ?",
                [username],
                async (err, user) => {
                    if (err) {
                        return reject(new Error("Database error during authentication: " + err.message));
                    }

                    // User not found - return null (don't reveal if username exists)
                    if (!user) {
                        return resolve(null);
                    }

                    try {
                        // Check if account is locked
                        const isLocked = await this.checkAccountLockout(user.id);
                        if (isLocked) {
                            return resolve({ locked: true, userId: user.id });
                        }

                        // Verify password with Argon2id (timing-safe comparison built-in)
                        const isValid = await argon2.verify(user.password_hash, password);

                        if (!isValid) {
                            // Increment failed attempts on password mismatch
                            await this.incrementFailedAttempts(user.id);
                            return resolve(null);
                        }

                        // Authentication successful - reset failed attempts and update last login
                        await this.resetFailedAttempts(user.id);
                        await this.updateLastLogin(user.id);

                        // Return user object without password hash
                        const { password_hash, ...userWithoutPassword } = user;
                        resolve(userWithoutPassword);

                    } catch (verifyError) {
                        reject(new Error("Password verification failed: " + verifyError.message));
                    }
                }
            );
        });
    }

    /**
     * Validate session user still exists and is active
     * @param {string} sessionUserId - User ID from session
     * @returns {Promise<boolean>} True if user exists and active, false otherwise
     */
    async validateSession(sessionUserId) {
        return new Promise((resolve, reject) => {
            this.db.get(
                "SELECT id FROM users WHERE id = ?",
                [sessionUserId],
                (err, user) => {
                    if (err) {
                        return reject(new Error("Database error during session validation: " + err.message));
                    }
                    resolve(!!user);
                }
            );
        });
    }

    /**
     * Change user password with old password verification
     * @param {string} userId - User ID
     * @param {string} oldPassword - Current password for verification
     * @param {string} newPassword - New password (plain text, will be hashed)
     * @returns {Promise<Object>} Success status and message
     */
    async changePassword(userId, oldPassword, newPassword) {
        return new Promise(async (resolve, reject) => {
            try {
                // Fetch user to verify old password
                const user = await this.getUserById(userId);
                if (!user) {
                    return reject(new Error("User not found"));
                }

                // Verify old password
                const isValid = await argon2.verify(user.password_hash, oldPassword);
                if (!isValid) {
                    return resolve({ success: false, error: "Old password is incorrect" });
                }

                // Hash new password with Argon2id
                const newHash = await argon2.hash(newPassword, {
                    type: argon2.argon2id,
                    memoryCost: 65536, // 64 MiB
                    timeCost: 3,
                    parallelism: 4
                });

                // Update password hash in database
                this.db.run(
                    "UPDATE users SET password_hash = ? WHERE id = ?",
                    [newHash, userId],
                    function(err) {
                        if (err) {
                            return reject(new Error("Failed to update password: " + err.message));
                        }
                        resolve({ success: true, message: "Password updated successfully" });
                    }
                );

            } catch (error) {
                reject(new Error("Password change failed: " + error.message));
            }
        });
    }

    /**
     * Get user by ID
     * @param {string} userId - User ID
     * @returns {Promise<Object|null>} User object or null if not found
     */
    async getUserById(userId) {
        return new Promise((resolve, reject) => {
            this.db.get(
                "SELECT * FROM users WHERE id = ?",
                [userId],
                (err, user) => {
                    if (err) {
                        return reject(new Error("Database error fetching user: " + err.message));
                    }
                    resolve(user || null);
                }
            );
        });
    }

    /**
     * Update last login timestamp for user
     * @param {string} userId - User ID
     * @returns {Promise<void>}
     */
    async updateLastLogin(userId) {
        return new Promise((resolve, reject) => {
            const now = new Date().toISOString();
            this.db.run(
                "UPDATE users SET last_login = ? WHERE id = ?",
                [now, userId],
                function(err) {
                    if (err) {
                        return reject(new Error("Failed to update last login: " + err.message));
                    }
                    resolve();
                }
            );
        });
    }

    /**
     * Increment failed login attempts for user
     * Sets timestamp on first failure, increments count on subsequent failures
     * @param {string} userId - User ID
     * @returns {Promise<void>}
     */
    async incrementFailedAttempts(userId) {
        return new Promise((resolve, reject) => {
            // Get current failed attempts
            this.db.get(
                "SELECT failed_attempts, failed_login_timestamp FROM users WHERE id = ?",
                [userId],
                (err, user) => {
                    if (err) {
                        return reject(new Error("Database error incrementing failed attempts: " + err.message));
                    }

                    if (!user) {
                        return reject(new Error("User not found"));
                    }

                    const now = new Date().toISOString();
                    const currentCount = user.failed_attempts || 0;
                    const currentTimestamp = user.failed_login_timestamp;

                    // If this is the first failure or lockout period expired, reset timestamp
                    const needsTimestampReset = !currentTimestamp || currentCount === 0;

                    this.db.run(
                        "UPDATE users SET failed_attempts = ?, failed_login_timestamp = ? WHERE id = ?",
                        [currentCount + 1, needsTimestampReset ? now : currentTimestamp, userId],
                        function(updateErr) {
                            if (updateErr) {
                                return reject(new Error("Failed to increment login attempts: " + updateErr.message));
                            }
                            resolve();
                        }
                    );
                }
            );
        });
    }

    /**
     * Reset failed login attempts after successful login
     * @param {string} userId - User ID
     * @returns {Promise<void>}
     */
    async resetFailedAttempts(userId) {
        return new Promise((resolve, reject) => {
            this.db.run(
                "UPDATE users SET failed_attempts = 0, failed_login_timestamp = NULL WHERE id = ?",
                [userId],
                function(err) {
                    if (err) {
                        return reject(new Error("Failed to reset failed attempts: " + err.message));
                    }
                    resolve();
                }
            );
        });
    }

    /**
     * Check if account is locked due to too many failed attempts
     * Account is locked if: failed_attempts >= 5 AND within 15 minutes of failed_login_timestamp
     * @param {string} userId - User ID
     * @returns {Promise<boolean>} True if account is locked, false otherwise
     */
    async checkAccountLockout(userId) {
        return new Promise((resolve, reject) => {
            this.db.get(
                `SELECT failed_attempts, failed_login_timestamp
                 FROM users
                 WHERE id = ?`,
                [userId],
                (err, user) => {
                    if (err) {
                        return reject(new Error("Database error checking lockout: " + err.message));
                    }

                    if (!user) {
                        return resolve(false);
                    }

                    const failedCount = user.failed_attempts || 0;
                    const failedTimestamp = user.failed_login_timestamp;

                    // Not locked if less than 5 attempts
                    if (failedCount < 5) {
                        return resolve(false);
                    }

                    // Not locked if no timestamp (shouldn't happen, but defensive)
                    if (!failedTimestamp) {
                        return resolve(false);
                    }

                    // Check if lockout period (15 minutes) has expired
                    const lockoutTime = new Date(failedTimestamp);
                    const lockoutExpiresAt = new Date(lockoutTime.getTime() + 15 * 60 * 1000); // 15 minutes
                    const now = new Date();

                    // If lockout expired, reset failed attempts and return false
                    if (now >= lockoutExpiresAt) {
                        this.resetFailedAttempts(userId)
                            .then(() => resolve(false))
                            .catch(resetErr => reject(resetErr));
                    } else {
                        // Account is still locked
                        resolve(true);
                    }
                }
            );
        });
    }

    /**
     * Get remaining attempts before lockout
     * @param {string} userId - User ID
     * @returns {Promise<number>} Number of attempts remaining (0-5)
     */
    async getRemainingAttempts(userId) {
        return new Promise((resolve, reject) => {
            this.db.get(
                "SELECT failed_attempts FROM users WHERE id = ?",
                [userId],
                (err, user) => {
                    if (err) {
                        return reject(new Error("Database error getting remaining attempts: " + err.message));
                    }

                    if (!user) {
                        return resolve(5); // Default to 5 if user not found
                    }

                    const failedCount = user.failed_attempts || 0;
                    const remaining = Math.max(0, 5 - failedCount);
                    resolve(remaining);
                }
            );
        });
    }

    /**
     * Reset admin password to default (HEX-303)
     * Used when clearing all data to reset admin account to factory defaults
     * Password is set to 'admin123!' with Argon2id hashing
     * @returns {Promise<Object>} Success status and message
     */
    async resetAdminPassword() {
        return new Promise(async (resolve, reject) => {
            try {
                // Hash the default password 'admin123!' with Argon2id
                const defaultPassword = "admin123!";
                const passwordHash = await argon2.hash(defaultPassword, {
                    type: argon2.argon2id,
                    memoryCost: 65536, // 64 MiB
                    timeCost: 3,
                    parallelism: 4
                });

                // Update admin user password and reset failed attempts
                this.db.run(
                    `UPDATE users
                     SET password_hash = ?,
                         failed_attempts = 0,
                         failed_login_timestamp = NULL,
                         last_login = NULL
                     WHERE username = 'admin'`,
                    [passwordHash],
                    function(err) {
                        if (err) {
                            return reject(new Error("Failed to reset admin password: " + err.message));
                        }

                        if (this.changes === 0) {
                            return reject(new Error("Admin user not found"));
                        }

                        resolve({
                            success: true,
                            message: "Admin password reset to 'admin123!' successfully"
                        });
                    }
                );

            } catch (error) {
                reject(new Error("Admin password reset failed: " + error.message));
            }
        });
    }
}

module.exports = AuthService;
