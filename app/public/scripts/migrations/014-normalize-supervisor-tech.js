#!/usr/bin/env node

/**
 * ========================================
 * HEX-267: Normalize Supervisor/Tech Fields
 * Migration 014: Normalize Existing Ticket Data
 * Version: 1.0.94
 * Date: 2025-10-21
 * ========================================
 *
 * This migration normalizes existing supervisor and tech fields in the tickets table
 * from Hexagon EAM export format (LAST,FIRST all-caps) to proper case "First Last" format.
 *
 * ROOT CAUSE: Hexagon EAM exports supervisor/tech fields as "LAST,FIRST; LAST2,FIRST2"
 * in all-caps. Previously, we normalized at display-time (3 separate implementations).
 * Nuclear option: Normalize once at migration, store clean data, remove duplicate code.
 *
 * SOLUTION: One-time migration to normalize all 6500+ existing tickets, then new tickets
 * are normalized at save-time (tickets.js:1222-1223).
 *
 * ARCHITECTURE PATTERN: Write Normalization
 * - Old: Store raw "LAST,FIRST", normalize at read-time (O(n) reads)
 * - New: Normalize at write-time, store clean data (O(1) reads)
 *
 * USAGE:
 *   cd /Volumes/DATA/GitHub/HexTrackr
 *   node app/public/scripts/migrations/014-normalize-supervisor-tech.js
 */

const sqlite3 = require("sqlite3").verbose();
const readline = require("readline");
const path = require("path");

// ========================================
// CONFIGURATION
// ========================================

const DB_PATH = path.join(__dirname, "../../../data/hextrackr.db");
const PREVIEW_LIMIT = 5; // Number of sample tickets to show before migration
const CONFIRMATION_DELAY_MS = 5000; // 5 seconds to review before execution

// ========================================
// NORMALIZATION FUNCTIONS
// ========================================

/**
 * Normalize person name(s) to "First Last; First Last" format
 * Matches implementation in tickets.js:170-201
 *
 * @param {string|null} input - Raw name(s) from database
 * @returns {string|null} Normalized name(s) or original if null/N/A
 */
function normalizePersonName(input) {
    if (!input || input === "N/A") {
        return input;
    }

    const trimmed = input.trim();
    if (!trimmed) {return "";}

    // Split on semicolon (multiple people)
    const people = trimmed.split(";").map(p => p.trim()).filter(Boolean);

    // Transform each person
    const normalized = people.map(person => {
        // If no comma, assume "First Last" format (just capitalize)
        if (!person.includes(",")) {
            return toProperCase(person);
        }

        // "LAST,FIRST" format - reverse and capitalize
        const parts = person.split(",").map(p => p.trim());
        if (parts.length < 2) {
            return toProperCase(person); // Fallback
        }

        const lastName = toProperCase(parts[0]);
        const firstName = toProperCase(parts[1]);
        return `${firstName} ${lastName}`;
    });

    // Join multiple people with semicolon-space
    return normalized.join("; ");
}

/**
 * Convert string to proper case (capitalize first letter of each word)
 *
 * @param {string} str - Input string (may be all-caps or lowercase)
 * @returns {string} String with first letter of each word capitalized
 */
function toProperCase(str) {
    if (!str) {return str;}
    return str.toLowerCase().replace(/\b\w/g, char => char.toUpperCase());
}

// ========================================
// PRE-MIGRATION ANALYSIS
// ========================================

/**
 * Analyze current supervisor/tech field formats before migration
 *
 * @param {sqlite3.Database} db - Database connection
 * @returns {Promise<Object>} Analysis results
 */
function analyzeCurrentFormats(db) {
    return new Promise((resolve, reject) => {
        const query = `
            SELECT
                COUNT(*) as total_tickets,
                COUNT(DISTINCT supervisor) as unique_supervisors,
                COUNT(DISTINCT tech) as unique_techs,
                SUM(CASE WHEN supervisor LIKE '%,%' THEN 1 ELSE 0 END) as supervisor_eam_format,
                SUM(CASE WHEN tech LIKE '%,%' THEN 1 ELSE 0 END) as tech_eam_format,
                SUM(CASE WHEN supervisor IS NULL OR supervisor = '' THEN 1 ELSE 0 END) as supervisor_empty,
                SUM(CASE WHEN tech IS NULL OR tech = '' THEN 1 ELSE 0 END) as tech_empty
            FROM tickets
            WHERE deleted_at IS NULL
        `;

        db.get(query, (err, row) => {
            if (err) {reject(err);}
            else {resolve(row);}
        });
    });
}

/**
 * Get sample tickets to preview transformation
 *
 * @param {sqlite3.Database} db - Database connection
 * @param {number} limit - Number of samples to retrieve
 * @returns {Promise<Array>} Sample tickets
 */
function getSampleTickets(db, limit) {
    return new Promise((resolve, reject) => {
        const query = `
            SELECT id, xt_number, supervisor, tech
            FROM tickets
            WHERE deleted_at IS NULL
              AND (supervisor LIKE '%,%' OR tech LIKE '%,%')
            LIMIT ?
        `;

        db.all(query, [limit], (err, rows) => {
            if (err) {reject(err);}
            else {resolve(rows);}
        });
    });
}

// ========================================
// MIGRATION EXECUTION
// ========================================

/**
 * Execute the normalization migration in a transaction
 *
 * @param {sqlite3.Database} db - Database connection
 * @returns {Promise<Object>} Migration results
 */
function executeMigration(db) {
    return new Promise((resolve, reject) => {
        const startTime = Date.now();

        db.serialize(() => {
            // Start transaction
            db.run("BEGIN TRANSACTION", (err) => {
                if (err) {
                    reject(err);
                    return;
                }

                console.log("\n[INFO] Transaction started...");

                // Get all non-deleted tickets with supervisor or tech fields
                const selectQuery = `
                    SELECT id, supervisor, tech
                    FROM tickets
                    WHERE deleted_at IS NULL
                      AND (supervisor IS NOT NULL OR tech IS NOT NULL)
                `;

                db.all(selectQuery, (err, tickets) => {
                    if (err) {
                        db.run("ROLLBACK");
                        reject(err);
                        return;
                    }

                    console.log(`[INFO] Processing ${tickets.length} tickets...`);

                    let updated = 0;
                    let errors = 0;

                    // Prepare update statement
                    const updateStmt = db.prepare(`
                        UPDATE tickets
                        SET supervisor = ?,
                            tech = ?,
                            updated_at = CURRENT_TIMESTAMP
                        WHERE id = ?
                    `);

                    // Process each ticket
                    tickets.forEach((ticket, index) => {
                        const normalizedSupervisor = normalizePersonName(ticket.supervisor);
                        const normalizedTech = normalizePersonName(ticket.tech);

                        updateStmt.run(
                            normalizedSupervisor,
                            normalizedTech,
                            ticket.id,
                            (err) => {
                                if (err) {
                                    console.error(`[ERROR] Failed to update ticket ${ticket.id}:`, err.message);
                                    errors++;
                                } else {
                                    updated++;
                                }

                                // Check if this was the last ticket
                                if (index === tickets.length - 1) {
                                    updateStmt.finalize((finalizeErr) => {
                                        if (finalizeErr) {
                                            db.run("ROLLBACK");
                                            reject(finalizeErr);
                                            return;
                                        }

                                        if (errors > 0) {
                                            console.error(`[ERROR] ${errors} tickets failed to update, rolling back...`);
                                            db.run("ROLLBACK");
                                            reject(new Error(`${errors} tickets failed to update`));
                                        } else {
                                            // Commit transaction
                                            db.run("COMMIT", (commitErr) => {
                                                if (commitErr) {
                                                    reject(commitErr);
                                                    return;
                                                }

                                                const duration = ((Date.now() - startTime) / 1000).toFixed(2);
                                                resolve({
                                                    updated,
                                                    errors,
                                                    duration
                                                });
                                            });
                                        }
                                    });
                                }
                            }
                        );
                    });
                });
            });
        });
    });
}

/**
 * Verify migration results
 *
 * @param {sqlite3.Database} db - Database connection
 * @returns {Promise<Object>} Verification results
 */
function verifyMigration(db) {
    return new Promise((resolve, reject) => {
        const query = `
            SELECT
                SUM(CASE WHEN supervisor LIKE '%,%' THEN 1 ELSE 0 END) as remaining_eam_supervisors,
                SUM(CASE WHEN tech LIKE '%,%' THEN 1 ELSE 0 END) as remaining_eam_techs
            FROM tickets
            WHERE deleted_at IS NULL
        `;

        db.get(query, (err, row) => {
            if (err) {reject(err);}
            else {resolve(row);}
        });
    });
}

// ========================================
// USER INTERACTION
// ========================================

/**
 * Ask user for confirmation before proceeding
 *
 * @param {string} question - Question to ask
 * @returns {Promise<boolean>} User's response
 */
function askQuestion(question) {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    return new Promise((resolve) => {
        rl.question(question, (answer) => {
            rl.close();
            resolve(answer.toLowerCase() === "y" || answer.toLowerCase() === "yes");
        });
    });
}

/**
 * Countdown timer before execution
 *
 * @param {number} seconds - Seconds to count down
 * @returns {Promise<void>}
 */
function countdown(seconds) {
    return new Promise((resolve) => {
        let remaining = seconds;
        console.log(`\n[INFO] Starting migration in ${remaining} seconds... (Ctrl+C to cancel)`);

        const interval = setInterval(() => {
            remaining--;
            if (remaining > 0) {
                process.stdout.write(`\r[INFO] Starting migration in ${remaining} seconds... (Ctrl+C to cancel)`);
            } else {
                process.stdout.write("\r[INFO] Starting migration NOW...                                      \n");
                clearInterval(interval);
                resolve();
            }
        }, 1000);
    });
}

// ========================================
// MAIN EXECUTION
// ========================================

async function main() {
    console.log("========================================");
    console.log("HEX-267: Normalize Supervisor/Tech Fields");
    console.log("Migration 014");
    console.log("========================================\n");

    // Open database connection
    const db = new sqlite3.Database(DB_PATH, (err) => {
        if (err) {
            console.error("[ERROR] Failed to connect to database:", err.message);
            process.exit(1);
        }
        console.log(`[INFO] Connected to database: ${DB_PATH}\n`);
    });

    try {
        // Step 1: Pre-migration analysis
        console.log("[STEP 1] Analyzing current data...\n");
        const analysis = await analyzeCurrentFormats(db);

        console.log("Current State:");
        console.log(`  Total Tickets:          ${analysis.total_tickets}`);
        console.log(`  Unique Supervisors:     ${analysis.unique_supervisors}`);
        console.log(`  Unique Techs:           ${analysis.unique_techs}`);
        console.log(`  Supervisor EAM Format:  ${analysis.supervisor_eam_format} (${((analysis.supervisor_eam_format / analysis.total_tickets) * 100).toFixed(1)}%)`);
        console.log(`  Tech EAM Format:        ${analysis.tech_eam_format} (${((analysis.tech_eam_format / analysis.total_tickets) * 100).toFixed(1)}%)`);
        console.log(`  Supervisor Empty:       ${analysis.supervisor_empty}`);
        console.log(`  Tech Empty:             ${analysis.tech_empty}\n`);

        // Step 2: Sample preview
        console.log(`[STEP 2] Sample tickets (showing first ${PREVIEW_LIMIT} with EAM format)...\n`);
        const samples = await getSampleTickets(db, PREVIEW_LIMIT);

        samples.forEach((ticket, index) => {
            console.log(`Sample ${index + 1}: XT-${ticket.xt_number} (ID: ${ticket.id})`);
            if (ticket.supervisor) {
                console.log(`  Supervisor BEFORE: "${ticket.supervisor}"`);
                console.log(`  Supervisor AFTER:  "${normalizePersonName(ticket.supervisor)}"`);
            }
            if (ticket.tech) {
                console.log(`  Tech BEFORE:       "${ticket.tech}"`);
                console.log(`  Tech AFTER:        "${normalizePersonName(ticket.tech)}"`);
            }
            console.log("");
        });

        // Step 3: User confirmation
        console.log("[STEP 3] User confirmation required...\n");
        const confirmed = await askQuestion("Proceed with migration? (y/n): ");

        if (!confirmed) {
            console.log("\n[INFO] Migration cancelled by user.");
            db.close();
            process.exit(0);
        }

        // Step 4: Countdown
        await countdown(CONFIRMATION_DELAY_MS / 1000);

        // Step 5: Execute migration
        console.log("\n[STEP 4] Executing migration...\n");
        const results = await executeMigration(db);

        console.log("\n[SUCCESS] Migration completed!");
        console.log(`  Tickets Updated:  ${results.updated}`);
        console.log(`  Errors:           ${results.errors}`);
        console.log(`  Duration:         ${results.duration}s\n`);

        // Step 6: Verification
        console.log("[STEP 5] Verifying migration...\n");
        const verification = await verifyMigration(db);

        console.log("Post-Migration State:");
        console.log(`  Remaining EAM Supervisors: ${verification.remaining_eam_supervisors}`);
        console.log(`  Remaining EAM Techs:       ${verification.remaining_eam_techs}\n`);

        if (verification.remaining_eam_supervisors > 0 || verification.remaining_eam_techs > 0) {
            console.log("[WARNING] Some EAM-format fields remain. This may indicate edge cases.");
        } else {
            console.log("[SUCCESS] All EAM-format fields normalized successfully!");
        }

        // Close database
        db.close((err) => {
            if (err) {
                console.error("[ERROR] Error closing database:", err.message);
                process.exit(1);
            }
            console.log("\n[INFO] Database connection closed.");
            console.log("\n========================================");
            console.log("Migration 014 Complete");
            console.log("========================================\n");
        });

    } catch (error) {
        console.error("\n[ERROR] Migration failed:", error.message);
        db.close();
        process.exit(1);
    }
}

// Run migration if executed directly
if (require.main === module) {
    main();
}

module.exports = { normalizePersonName, toProperCase };
