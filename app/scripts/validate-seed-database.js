#!/usr/bin/env node

/**
 * HexTrackr Seed Database Validator (HEX-348)
 *
 * Validates that the seed database:
 * 1. Exists and is accessible
 * 2. Checksum matches expected value
 * 3. Has correct schema (all required tables)
 * 4. Has admin user seeded
 * 5. Has templates seeded
 * 6. Has NO user data (tickets, vulnerabilities)
 *
 * Usage:
 *   npm run db:seed:validate
 *
 * This tool is used to:
 * - Verify seed database before committing to git
 * - Validate seed database in CI/CD pipelines
 * - Troubleshoot deployment issues
 */

const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const sqlite3 = require("sqlite3").verbose();

// Configuration
const SEED_DB = path.join(__dirname, "../data/hextrackr.seed.db");
const SEED_CHECKSUM = path.join(__dirname, "../data/hextrackr.seed.db.sha256");

// Expected schema (minimum required tables)
const REQUIRED_TABLES = [
    "users",
    "user_preferences",
    "tickets",
    "vulnerability_imports",
    "vulnerabilities_current",
    "vulnerability_snapshots",
    "vulnerability_daily_totals",
    "vendor_daily_totals",
    "kev_status",
    "cisco_advisories",
    "palo_alto_advisories",
    "cisco_fixed_versions",
    "email_templates",
    "ticket_templates",
    "vulnerability_templates",
    "backup_metadata",
    "audit_logs",
    "audit_log_config"
];

// ANSI color codes
const colors = {
    reset: "\x1b[0m",
    bright: "\x1b[1m",
    red: "\x1b[31m",
    green: "\x1b[32m",
    yellow: "\x1b[33m",
    blue: "\x1b[34m",
    cyan: "\x1b[36m"
};

let validationErrors = 0;
let validationWarnings = 0;

/**
 * Print colored message
 */
function print(message, color = "reset") {
    console.log(colors[color] + message + colors.reset);
}

/**
 * Print section header
 */
function header(message) {
    console.log("");
    print("═".repeat(70), "cyan");
    print(`  ${message}`, "bright");
    print("═".repeat(70), "cyan");
    console.log("");
}

/**
 * Print error
 */
function error(message) {
    validationErrors++;
    print("❌ " + message, "red");
}

/**
 * Print warning
 */
function warn(message) {
    validationWarnings++;
    print("⚠️  " + message, "yellow");
}

/**
 * Print success
 */
function success(message) {
    print("✅ " + message, "green");
}

/**
 * Print info
 */
function info(message) {
    print("ℹ️  " + message, "blue");
}

/**
 * Query database and return results
 */
async function query(db, sql, params = []) {
    return new Promise((resolve, reject) => {
        db.all(sql, params, (err, rows) => {
            if (err) {
                reject(err);
            } else {
                resolve(rows);
            }
        });
    });
}

/**
 * Get single row from database
 */
async function queryOne(db, sql, params = []) {
    return new Promise((resolve, reject) => {
        db.get(sql, params, (err, row) => {
            if (err) {
                reject(err);
            } else {
                resolve(row);
            }
        });
    });
}

/**
 * Validate seed database file exists
 */
async function validateFileExists() {
    header("Test 1: File Existence");

    if (!fs.existsSync(SEED_DB)) {
        error(`Seed database not found: ${SEED_DB}`);
        return false;
    }

    success(`Seed database found: ${SEED_DB}`);

    const stats = fs.statSync(SEED_DB);
    info(`File size: ${(stats.size / 1024).toFixed(2)} KB`);

    if (stats.size < 10 * 1024) {
        warn(`File size is suspiciously small (< 10 KB)`);
    }

    if (stats.size > 500 * 1024) {
        warn(`File size is large (> 500 KB) - may contain user data`);
    }

    return true;
}

/**
 * Validate checksum
 */
async function validateChecksum() {
    header("Test 2: Checksum Validation");

    if (!fs.existsSync(SEED_CHECKSUM)) {
        error(`Checksum file not found: ${SEED_CHECKSUM}`);
        return false;
    }

    // Read expected checksum
    const checksumContent = fs.readFileSync(SEED_CHECKSUM, "utf8").trim();
    const expectedChecksum = checksumContent.split(/\s+/)[0];

    info(`Expected checksum: ${expectedChecksum}`);

    // Calculate actual checksum
    return new Promise((resolve) => {
        const hash = crypto.createHash("sha256");
        const stream = fs.createReadStream(SEED_DB);

        stream.on("data", (data) => {
            hash.update(data);
        });

        stream.on("end", () => {
            const actualChecksum = hash.digest("hex");
            info(`Actual checksum:   ${actualChecksum}`);

            if (actualChecksum === expectedChecksum) {
                success("Checksum matches ✅");
                resolve(true);
            } else {
                error("Checksum mismatch! File may be corrupted or modified");
                resolve(false);
            }
        });

        stream.on("error", (err) => {
            error(`Failed to read file: ${err.message}`);
            resolve(false);
        });
    });
}

/**
 * Validate database schema
 */
async function validateSchema(db) {
    header("Test 3: Database Schema");

    try {
        // Get all tables
        const tables = await query(db, "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name");
        const tableNames = tables.map(t => t.name);

        info(`Found ${tables.length} tables in database`);

        // Check for required tables
        let missingTables = [];
        for (const requiredTable of REQUIRED_TABLES) {
            if (tableNames.includes(requiredTable)) {
                success(`Table exists: ${requiredTable}`);
            } else {
                error(`Missing required table: ${requiredTable}`);
                missingTables.push(requiredTable);
            }
        }

        if (missingTables.length === 0) {
            success("All required tables present ✅");
        } else {
            error(`Missing ${missingTables.length} required tables`);
        }

        return missingTables.length === 0;

    } catch (err) {
        error(`Schema validation failed: ${err.message}`);
        return false;
    }
}

/**
 * Validate admin user exists
 */
async function validateAdminUser(db) {
    header("Test 4: Admin User");

    try {
        const userCount = await queryOne(db, "SELECT COUNT(*) as count FROM users");
        const adminUser = await queryOne(db, "SELECT * FROM users WHERE role IN ('admin', 'superadmin') LIMIT 1");

        info(`Total users in database: ${userCount.count}`);

        if (userCount.count === 0) {
            error("No users found in database - admin user required");
            return false;
        }

        if (!adminUser) {
            error("No admin user found - at least one admin required");
            return false;
        }

        success(`Admin user exists: ${adminUser.username}`);

        if (userCount.count === 1) {
            success("Exactly 1 user (admin only) ✅");
        } else {
            warn(`Found ${userCount.count} users (expected 1 admin user)`);
        }

        return true;

    } catch (err) {
        error(`Admin user validation failed: ${err.message}`);
        return false;
    }
}

/**
 * Validate templates exist
 */
async function validateTemplates(db) {
    header("Test 5: Default Templates");

    try {
        const emailTemplates = await queryOne(db, "SELECT COUNT(*) as count FROM email_templates");
        const ticketTemplates = await queryOne(db, "SELECT COUNT(*) as count FROM ticket_templates");
        const vulnTemplates = await queryOne(db, "SELECT COUNT(*) as count FROM vulnerability_templates");

        info(`Email templates: ${emailTemplates.count}`);
        info(`Ticket templates: ${ticketTemplates.count}`);
        info(`Vulnerability templates: ${vulnTemplates.count}`);

        let hasTemplates = true;

        if (emailTemplates.count === 0) {
            warn("No email templates found - may need to seed templates");
            hasTemplates = false;
        } else {
            success(`Email templates present (${emailTemplates.count})`);
        }

        if (ticketTemplates.count === 0) {
            warn("No ticket templates found - may need to seed templates");
            hasTemplates = false;
        } else {
            success(`Ticket templates present (${ticketTemplates.count})`);
        }

        if (vulnTemplates.count === 0) {
            warn("No vulnerability templates found - may need to seed templates");
            hasTemplates = false;
        } else {
            success(`Vulnerability templates present (${vulnTemplates.count})`);
        }

        return hasTemplates;

    } catch (err) {
        error(`Template validation failed: ${err.message}`);
        return false;
    }
}

/**
 * Validate no user data present
 */
async function validateNoUserData(db) {
    header("Test 6: No User Data Present");

    try {
        const tickets = await queryOne(db, "SELECT COUNT(*) as count FROM tickets WHERE deleted_at IS NULL");
        const vulnsCurrent = await queryOne(db, "SELECT COUNT(*) as count FROM vulnerabilities_current");
        const vulnsSnapshots = await queryOne(db, "SELECT COUNT(*) as count FROM vulnerability_snapshots");
        const imports = await queryOne(db, "SELECT COUNT(*) as count FROM vulnerability_imports");

        let isClean = true;

        if (tickets.count === 0) {
            success("Tickets table is empty ✅");
        } else {
            error(`Tickets table has ${tickets.count} rows (expected 0)`);
            isClean = false;
        }

        if (vulnsCurrent.count === 0) {
            success("Vulnerabilities_current table is empty ✅");
        } else {
            error(`Vulnerabilities_current has ${vulnsCurrent.count} rows (expected 0)`);
            isClean = false;
        }

        if (vulnsSnapshots.count === 0) {
            success("Vulnerability_snapshots table is empty ✅");
        } else {
            error(`Vulnerability_snapshots has ${vulnsSnapshots.count} rows (expected 0)`);
            isClean = false;
        }

        if (imports.count === 0) {
            success("Vulnerability_imports table is empty ✅");
        } else {
            warn(`Vulnerability_imports has ${imports.count} rows`);
        }

        return isClean;

    } catch (err) {
        error(`User data validation failed: ${err.message}`);
        return false;
    }
}

/**
 * Validate encryption key exists (audit logs)
 */
async function validateEncryption(db) {
    header("Test 7: Encryption Configuration");

    try {
        const config = await queryOne(db, "SELECT * FROM audit_log_config WHERE id = 1");

        if (!config) {
            warn("Audit log config not initialized - may need manual setup");
            return false;
        }

        if (config.encryption_key) {
            success("Audit log encryption key present ✅");
        } else {
            warn("Audit log encryption key not set - will be generated on first use");
        }

        info(`Retention days: ${config.retention_days}`);
        info(`Total logs written: ${config.total_logs_written}`);

        return true;

    } catch (err) {
        warn(`Encryption validation skipped: ${err.message}`);
        return false;
    }
}

/**
 * Display validation summary
 */
function displaySummary() {
    header("Validation Summary");

    if (validationErrors === 0 && validationWarnings === 0) {
        success("🎉 All validations passed!");
        console.log("");
        info("Seed database is ready for deployment");
        return true;
    } else {
        console.log("");
        if (validationErrors > 0) {
            print(`❌ ${validationErrors} error(s) found`, "red");
        }
        if (validationWarnings > 0) {
            print(`⚠️  ${validationWarnings} warning(s) found`, "yellow");
        }
        console.log("");

        if (validationErrors > 0) {
            error("Seed database validation FAILED");
            console.log("");
            info("Please fix errors before deploying:");
            console.log("  1. Review error messages above");
            console.log("  2. Rebuild seed database: npm run db:seed:create");
            console.log("  3. Re-validate: npm run db:seed:validate");
            return false;
        } else {
            warn("Seed database has warnings but may be usable");
            return true;
        }
    }
}

/**
 * Main execution
 */
async function main() {
    try {
        console.log("");
        print("╔═══════════════════════════════════════════════════════════════════╗", "cyan");
        print("║                                                                   ║", "cyan");
        print("║            HexTrackr Seed Database Validator                      ║", "cyan");
        print("║                                                                   ║", "cyan");
        print("║  Validates seed database is ready for production deployment      ║", "cyan");
        print("║                                                                   ║", "cyan");
        print("╚═══════════════════════════════════════════════════════════════════╝", "cyan");
        console.log("");

        // Test 1: File exists
        const fileExists = await validateFileExists();
        if (!fileExists) {
            displaySummary();
            process.exit(1);
        }

        // Test 2: Checksum
        await validateChecksum();

        // Open database for tests 3-7
        const db = new sqlite3.Database(SEED_DB, sqlite3.OPEN_READONLY, async (err) => {
            if (err) {
                error(`Failed to open database: ${err.message}`);
                displaySummary();
                process.exit(1);
                return;
            }

            try {
                // Test 3: Schema
                await validateSchema(db);

                // Test 4: Admin user
                await validateAdminUser(db);

                // Test 5: Templates
                await validateTemplates(db);

                // Test 6: No user data
                await validateNoUserData(db);

                // Test 7: Encryption
                await validateEncryption(db);

                db.close();

                // Display summary
                const passed = displaySummary();

                process.exit(passed ? 0 : 1);

            } catch (err) {
                error(`Validation failed: ${err.message}`);
                db.close();
                displaySummary();
                process.exit(1);
            }
        });

    } catch (err) {
        error(`Validation failed: ${err.message}`);
        displaySummary();
        process.exit(1);
    }
}

main();
