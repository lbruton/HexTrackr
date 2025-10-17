/**
 * LoggingService - Centralized logging with encrypted audit trail
 *
 * Purpose: Provides category-aware logging for frontend and backend with
 * encrypted audit trail storage for compliance and security monitoring.
 *
 * Features:
 * - Configuration-driven category toggles (logging.config.json)
 * - AES-256-GCM encrypted audit logs for sensitive operations
 * - Environment-aware log levels (dev/test/prod)
 * - Consistent emoji/timestamp formatting
 * - 30-day audit retention with automatic cleanup
 *
 * Related Files:
 * - /app/config/logging.config.json - Configuration
 * - /app/public/scripts/migrations/012-create-audit-logs.sql - Database schema
 * - /app/public/scripts/shared/logger.js - Frontend logger
 *
 * Issue: HEX-254 (Session 2)
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

class LoggingService {
    constructor() {
        this.db = null;
        this.config = null;
        this.encryptionKey = null;
        this.isInitialized = false;

        // Cache for performance
        this.categoryCache = new Map();
        this.lastCleanup = null;
    }

    /**
     * Initialize logging service with database and load configuration
     * @param {Object} db - SQLite database instance
     */
    async initialize(db) {
        try {
            this.db = db;

            // Load configuration
            await this.loadConfig();

            // Initialize encryption for audit logs
            await this.initializeEncryption();

            // Schedule cleanup for old audit logs
            this._scheduleCleanup();

            this.isInitialized = true;
            this.info('backend', 'auth', 'LoggingService initialized successfully');

        } catch (error) {
            console.error('❌ Failed to initialize LoggingService:', error.message);
            throw error;
        }
    }

    /**
     * Load logging configuration from JSON file
     */
    async loadConfig() {
        return new Promise((resolve, reject) => {
            const configPath = path.join(__dirname, '..', 'config', 'logging.config.json');

            fs.readFile(configPath, 'utf8', (err, data) => {
                if (err) {
                    console.error('❌ Failed to load logging.config.json:', err.message);
                    // Fall back to defaults
                    this.config = this._getDefaultConfig();
                    resolve();
                    return;
                }

                try {
                    this.config = JSON.parse(data);
                    resolve();
                } catch (parseError) {
                    console.error('❌ Failed to parse logging.config.json:', parseError.message);
                    this.config = this._getDefaultConfig();
                    resolve();
                }
            });
        });
    }

    /**
     * Initialize encryption for audit logs (AES-256-GCM)
     * Generates or retrieves encryption key from audit_log_config table
     */
    async initializeEncryption() {
        return new Promise((resolve, reject) => {
            // Check if encryption key exists in database
            this.db.get(
                'SELECT encryption_key FROM audit_log_config WHERE id = 1',
                [],
                (err, row) => {
                    if (err) {
                        reject(new Error('Failed to query encryption key: ' + err.message));
                        return;
                    }

                    if (row && row.encryption_key) {
                        // Use existing key
                        this.encryptionKey = row.encryption_key;
                        resolve();
                    } else {
                        // Generate new 256-bit key
                        this.encryptionKey = crypto.randomBytes(32);

                        // Store in database
                        this.db.run(
                            `UPDATE audit_log_config
                             SET encryption_key = ?,
                                 key_created_at = datetime('now'),
                                 updated_at = datetime('now')
                             WHERE id = 1`,
                            [this.encryptionKey],
                            (updateErr) => {
                                if (updateErr) {
                                    reject(new Error('Failed to store encryption key: ' + updateErr.message));
                                    return;
                                }
                                resolve();
                            }
                        );
                    }
                }
            );
        });
    }

    /**
     * Encrypt data using AES-256-GCM
     * @param {string|Object} data - Data to encrypt
     * @returns {Object} - {encrypted: Buffer, iv: Buffer}
     */
    encrypt(data) {
        if (!this.encryptionKey) {
            throw new Error('Encryption key not initialized');
        }

        // Convert to string if object
        const plaintext = typeof data === 'object' ? JSON.stringify(data) : String(data);

        // Generate random IV (12 bytes recommended for GCM)
        const iv = crypto.randomBytes(12);

        // Create cipher
        const cipher = crypto.createCipheriv('aes-256-gcm', this.encryptionKey, iv);

        // Encrypt data
        let encrypted = cipher.update(plaintext, 'utf8');
        encrypted = Buffer.concat([encrypted, cipher.final()]);

        // Get auth tag (provides integrity verification)
        const authTag = cipher.getAuthTag();

        // Combine encrypted data with auth tag
        const combined = Buffer.concat([encrypted, authTag]);

        return {
            encrypted: combined,
            iv: iv
        };
    }

    /**
     * Decrypt data using AES-256-GCM
     * @param {Buffer} encryptedData - Encrypted data with auth tag
     * @param {Buffer} iv - Initialization vector
     * @returns {string|Object} - Decrypted data
     */
    decrypt(encryptedData, iv) {
        if (!this.encryptionKey) {
            throw new Error('Encryption key not initialized');
        }

        try {
            // Split encrypted data and auth tag (last 16 bytes)
            const authTag = encryptedData.slice(-16);
            const ciphertext = encryptedData.slice(0, -16);

            // Create decipher
            const decipher = crypto.createDecipheriv('aes-256-gcm', this.encryptionKey, iv);
            decipher.setAuthTag(authTag);

            // Decrypt
            let decrypted = decipher.update(ciphertext);
            decrypted = Buffer.concat([decrypted, decipher.final()]);

            const plaintext = decrypted.toString('utf8');

            // Try to parse as JSON, return string if it fails
            try {
                return JSON.parse(plaintext);
            } catch {
                return plaintext;
            }

        } catch (error) {
            throw new Error('Decryption failed: ' + error.message);
        }
    }

    /**
     * Write audit log entry (always encrypted)
     * @param {string} category - Audit category (e.g., 'user.login', 'ticket.delete')
     * @param {string} message - Human-readable message
     * @param {Object} data - Additional data to store (will be encrypted)
     * @param {string} userId - User ID (optional)
     * @param {Object} req - Express request object (optional, for IP/user-agent)
     */
    async audit(category, message, data = null, userId = null, req = null) {
        if (!this.config.global.auditEnabled) {
            return; // Audit disabled
        }

        // Check if category is in whitelist
        if (!this.config.audit.whitelist.includes(category)) {
            this.warn('backend', 'auth', `Audit category not in whitelist: ${category}`);
            return;
        }

        try {
            // Combine message and data into single encrypted payload
            const payload = { message, data };
            const encrypted = this.encrypt(payload);

            // Extract request context
            let ipAddress = null;
            let userAgent = null;
            let username = null;

            if (req) {
                ipAddress = req.ip || req.connection.remoteAddress;
                userAgent = req.get('user-agent');
                if (req.session && req.session.user) {
                    username = req.session.user.username;
                    userId = userId || req.session.user.id;
                }
            }

            // Insert into database
            await new Promise((resolve, reject) => {
                this.db.run(
                    `INSERT INTO audit_logs (
                        category, user_id, username, ip_address, user_agent,
                        encrypted_message, encrypted_data, encryption_iv
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                    [
                        category,
                        userId,
                        username,
                        ipAddress,
                        userAgent,
                        encrypted.encrypted,  // Store combined payload in encrypted_message
                        null,                  // Leave encrypted_data NULL (legacy column)
                        encrypted.iv
                    ],
                    (err) => {
                        if (err) {
                            reject(new Error('Failed to write audit log: ' + err.message));
                            return;
                        }

                        // Increment counter
                        this.db.run(
                            'UPDATE audit_log_config SET total_logs_written = total_logs_written + 1 WHERE id = 1'
                        );

                        resolve();
                    }
                );
            });

        } catch (error) {
            console.error('❌ Audit log write failed:', error.message);
        }
    }

    /**
     * Check if logging is enabled for a specific category and level
     * @param {string} scope - 'frontend' or 'backend'
     * @param {string} category - Category name
     * @param {string} level - Log level (debug/info/warn/error)
     * @returns {boolean}
     */
    _shouldLog(scope, category, level) {
        if (!this.config || !this.config.global.enabled) {
            return false;
        }

        // Check cache first
        const cacheKey = `${scope}:${category}:${level}`;
        if (this.categoryCache.has(cacheKey)) {
            return this.categoryCache.get(cacheKey);
        }

        // Check if category is enabled
        const categoryConfig = this.config[scope]?.categories?.[category];
        if (!categoryConfig || !categoryConfig.enabled) {
            this.categoryCache.set(cacheKey, false);
            return false;
        }

        // Check environment-based log level
        const env = process.env.NODE_ENV || 'development';
        const minLevel = this.config.levels[env] || 'debug';

        const levelHierarchy = { debug: 0, info: 1, warn: 2, error: 3 };
        const shouldLog = levelHierarchy[level] >= levelHierarchy[minLevel];

        this.categoryCache.set(cacheKey, shouldLog);
        return shouldLog;
    }

    /**
     * Format log message with emoji and timestamp
     * @param {string} level - Log level
     * @param {string} scope - 'frontend' or 'backend'
     * @param {string} category - Category name
     * @param {string} message - Log message
     * @returns {string}
     */
    _formatMessage(level, scope, category, message) {
        const parts = [];

        // Add emoji if enabled
        if (this.config.global.emojis) {
            parts.push(this.config.emojis[level] || '');
        }

        // Add timestamp if enabled
        if (this.config.global.timestamps) {
            const timestamp = new Date().toISOString();
            parts.push(`[${timestamp}]`);
        }

        // Add level and category
        parts.push(`[${level.toUpperCase()}]`);
        parts.push(`[${scope}:${category}]`);

        // Add message
        parts.push(message);

        return parts.join(' ');
    }

    /**
     * Log at DEBUG level
     * @param {string} scope - 'frontend' or 'backend'
     * @param {string} category - Category name
     * @param {string} message - Log message
     * @param {any} data - Additional data (optional)
     */
    debug(scope, category, message, data = null) {
        if (!this._shouldLog(scope, category, 'debug')) {
            return;
        }

        const formatted = this._formatMessage('debug', scope, category, message);
        if (data) {
            console.log(formatted, data);
        } else {
            console.log(formatted);
        }
    }

    /**
     * Log at INFO level
     * @param {string} scope - 'frontend' or 'backend'
     * @param {string} category - Category name
     * @param {string} message - Log message
     * @param {any} data - Additional data (optional)
     */
    info(scope, category, message, data = null) {
        if (!this._shouldLog(scope, category, 'info')) {
            return;
        }

        const formatted = this._formatMessage('info', scope, category, message);
        if (data) {
            console.log(formatted, data);
        } else {
            console.log(formatted);
        }
    }

    /**
     * Log at WARN level
     * @param {string} scope - 'frontend' or 'backend'
     * @param {string} category - Category name
     * @param {string} message - Log message
     * @param {any} data - Additional data (optional)
     */
    warn(scope, category, message, data = null) {
        if (!this._shouldLog(scope, category, 'warn')) {
            return;
        }

        const formatted = this._formatMessage('warn', scope, category, message);
        if (data) {
            console.warn(formatted, data);
        } else {
            console.warn(formatted);
        }
    }

    /**
     * Log at ERROR level
     * @param {string} scope - 'frontend' or 'backend'
     * @param {string} category - Category name
     * @param {string} message - Log message
     * @param {any} data - Additional data (optional)
     */
    error(scope, category, message, data = null) {
        if (!this._shouldLog(scope, category, 'error')) {
            return;
        }

        const formatted = this._formatMessage('error', scope, category, message);
        if (data) {
            console.error(formatted, data);
        } else {
            console.error(formatted);
        }
    }

    /**
     * Schedule cleanup of old audit logs based on retention policy
     * @private
     */
    _scheduleCleanup() {
        // Run cleanup daily at 3 AM
        const runCleanup = () => {
            const now = new Date();
            const lastRun = this.lastCleanup || new Date(0);
            const hoursSinceLastRun = (now - lastRun) / (1000 * 60 * 60);

            // Only run if it's been at least 23 hours
            if (hoursSinceLastRun < 23) {
                return;
            }

            this._cleanupOldAuditLogs();
        };

        // Check every hour
        setInterval(runCleanup, 60 * 60 * 1000);

        // Run once at startup if needed
        runCleanup();
    }

    /**
     * Clean up old audit logs based on retention policy
     * @private
     */
    async _cleanupOldAuditLogs() {
        if (!this.config.global.auditEnabled) {
            return;
        }

        try {
            const retentionDays = this.config.global.retentionDays || 30;
            const db = this.db; // Preserve reference for callback

            await new Promise((resolve, reject) => {
                db.run(
                    `DELETE FROM audit_logs
                     WHERE timestamp < datetime('now', '-' || ? || ' days')`,
                    [retentionDays],
                    function(err) {
                        if (err) {
                            reject(new Error('Audit log cleanup failed: ' + err.message));
                            return;
                        }

                        const deletedCount = this.changes;

                        if (deletedCount > 0) {
                            console.log(`✅ Cleaned up ${deletedCount} old audit logs (retention: ${retentionDays} days)`);
                        }

                        // Update metadata (use db reference, not this.db)
                        db.run(
                            `UPDATE audit_log_config
                             SET total_logs_purged = total_logs_purged + ?,
                                 last_cleanup_at = datetime('now')
                             WHERE id = 1`,
                            [deletedCount]
                        );

                        resolve();
                    }
                );
            });

            this.lastCleanup = new Date();

        } catch (error) {
            console.error('❌ Audit log cleanup error:', error.message);
        }
    }

    /**
     * Get default configuration (fallback if file loading fails)
     * @private
     */
    _getDefaultConfig() {
        return {
            global: { enabled: true, emojis: true, timestamps: true, auditEnabled: true, retentionDays: 30 },
            levels: { production: 'warn', development: 'debug', test: 'error' },
            frontend: { categories: {} },
            backend: { categories: {} },
            audit: { whitelist: [] },
            emojis: { debug: '🐛', info: 'ℹ️', warn: '⚠️', error: '❌', success: '✅' },
            performance: { slowQueryThreshold: 500, slowRequestThreshold: 2000, logMemoryUsage: false }
        };
    }
}

// Export singleton instance
let instance = null;

module.exports = {
    /**
     * Get or create LoggingService instance
     * @returns {LoggingService}
     */
    getInstance() {
        if (!instance) {
            instance = new LoggingService();
        }
        return instance;
    },

    /**
     * Initialize logging service
     * @param {Object} db - SQLite database instance
     */
    async initialize(db) {
        const service = this.getInstance();
        await service.initialize(db);
        return service;
    }
};
