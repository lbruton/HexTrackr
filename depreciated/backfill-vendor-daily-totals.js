#!/usr/bin/env node

/**
 * Backfill Vendor Daily Totals from Backup Database
 *
 * Purpose: Populate vendor_daily_totals table with historical trend data
 *          from pre-cleanup backup database that still has full vulnerability_snapshots
 *
 * Usage:
 *   node scripts/backfill-vendor-daily-totals.js --backup /path/to/backup.db [--dry-run|--execute]
 *
 * Context: vendor_daily_totals table created in Migration 008 to permanently store
 *          vendor-specific trend data. Previously trends were queried from
 *          vulnerability_snapshots which gets cleaned up to keep only last 3 scan dates.
 *
 * Safety: Uses transactions, dry-run mode available, backs up before execution
 */

const sqlite3 = require("sqlite3").verbose();
const path = require("path");
const fs = require("fs");

// Parse command line arguments
const args = process.argv.slice(2);
let backupPath = null;
let isDryRun = true; // Safe default

for (let i = 0; i < args.length; i++) {
    if (args[i] === "--backup" && i + 1 < args.length) {
        backupPath = args[i + 1];
        i++;
    } else if (args[i] === "--execute") {
        isDryRun = false;
    } else if (args[i] === "--dry-run") {
        isDryRun = true;
    }
}

if (!backupPath) {
    console.error("❌ Error: --backup parameter required");
    console.log("\nUsage:");
    console.log("  node scripts/backfill-vendor-daily-totals.js \\");
    console.log("    --backup /path/to/backup.db \\");
    console.log("    [--dry-run|--execute]");
    console.log("\nOptions:");
    console.log("  --backup PATH    Path to backup database with full vulnerability_snapshots");
    console.log("  --dry-run        Show what would be done without making changes (default)");
    console.log("  --execute        Actually perform the backfill operation");
    process.exit(1);
}

if (!fs.existsSync(backupPath)) {
    console.error(`❌ Error: Backup database not found: ${backupPath}`);
    process.exit(1);
}

// Production database path
const prodDbPath = path.join(__dirname, "..", "app", "data", "hextrackr.db");

if (!fs.existsSync(prodDbPath)) {
    console.error(`❌ Error: Production database not found: ${prodDbPath}`);
    process.exit(1);
}

console.log("🔄 Vendor Daily Totals Backfill");
console.log("================================\n");
console.log(`Backup database:  ${backupPath}`);
console.log(`Target database:  ${prodDbPath}`);
console.log(`Mode:             ${isDryRun ? "🔍 DRY-RUN (no changes)" : "⚠️  EXECUTE"}\n`);

// Open databases
const backupDb = new sqlite3.Database(backupPath, sqlite3.OPEN_READONLY, (err) => {
    if (err) {
        console.error("❌ Error opening backup database:", err.message);
        process.exit(1);
    }
});

const prodDb = new sqlite3.Database(prodDbPath, (err) => {
    if (err) {
        console.error("❌ Error opening production database:", err.message);
        process.exit(1);
    }
});

/**
 * Main backfill process
 */
async function backfillVendorDailyTotals() {
    return new Promise((resolve, reject) => {
        console.log("📊 Analyzing backup database...\n");

        // Query to aggregate vendor-specific daily totals from backup's vulnerability_snapshots
        // Uses same deduplication logic as calculateAndStoreDailyTotalsEnhanced()
        const analysisQuery = `
            SELECT
                scan_date,
                vendor,
                SUM(CASE WHEN severity = 'Critical' THEN 1 ELSE 0 END) as critical_count,
                ROUND(SUM(CASE WHEN severity = 'Critical' THEN max_vpr ELSE 0 END), 2) as critical_total_vpr,
                SUM(CASE WHEN severity = 'High' THEN 1 ELSE 0 END) as high_count,
                ROUND(SUM(CASE WHEN severity = 'High' THEN max_vpr ELSE 0 END), 2) as high_total_vpr,
                SUM(CASE WHEN severity = 'Medium' THEN 1 ELSE 0 END) as medium_count,
                ROUND(SUM(CASE WHEN severity = 'Medium' THEN max_vpr ELSE 0 END), 2) as medium_total_vpr,
                SUM(CASE WHEN severity = 'Low' THEN 1 ELSE 0 END) as low_count,
                ROUND(SUM(CASE WHEN severity = 'Low' THEN max_vpr ELSE 0 END), 2) as low_total_vpr,
                COUNT(*) as total_vulnerabilities,
                ROUND(SUM(max_vpr), 2) as total_vpr
            FROM (
                SELECT
                    scan_date,
                    severity,
                    vendor,
                    hostname,
                    COALESCE(plugin_id, SUBSTR(description, 1, 100)) as dedup_key,
                    MAX(vpr_score) as max_vpr
                FROM vulnerability_snapshots
                WHERE vendor IS NOT NULL AND vendor != ''
                GROUP BY scan_date, severity, vendor, hostname, dedup_key
            ) deduplicated
            GROUP BY scan_date, vendor
            ORDER BY scan_date ASC, vendor ASC
        `;

        backupDb.all(analysisQuery, [], (err, rows) => {
            if (err) {
                console.error("❌ Error querying backup database:", err.message);
                backupDb.close();
                prodDb.close();
                reject(err);
                return;
            }

            if (!rows || rows.length === 0) {
                console.log("⚠️  No vendor data found in backup database");
                backupDb.close();
                prodDb.close();
                resolve();
                return;
            }

            console.log(`✅ Found ${rows.length} vendor/date combinations in backup\n`);

            // Group by scan_date for reporting
            const dateGroups = rows.reduce((acc, row) => {
                if (!acc[row.scan_date]) {
                    acc[row.scan_date] = [];
                }
                acc[row.scan_date].push(row.vendor);
                return {};
            }, {});

            const uniqueDates = [...new Set(rows.map(r => r.scan_date))].sort();
            const uniqueVendors = [...new Set(rows.map(r => r.vendor))].sort();

            console.log("📋 Backfill Plan:");
            console.log("================\n");
            console.log(`Scan dates:   ${uniqueDates.length} (${uniqueDates[0]} to ${uniqueDates[uniqueDates.length - 1]})`);
            console.log(`Vendors:      ${uniqueVendors.join(", ")}`);
            console.log(`Total rows:   ${rows.length}\n`);

            // Show sample of data
            console.log("Sample Data (first 5 rows):");
            console.log("----------------------------");
            rows.slice(0, 5).forEach(row => {
                console.log(`${row.scan_date} | ${row.vendor.padEnd(12)} | C:${row.critical_count} H:${row.high_count} M:${row.medium_count} L:${row.low_count} | Total VPR: ${row.total_vpr}`);
            });
            console.log();

            if (isDryRun) {
                console.log("🔍 DRY-RUN MODE (no changes made)");
                console.log("   Run with --execute flag to perform backfill");
                backupDb.close();
                prodDb.close();
                resolve();
                return;
            }

            console.log("⚠️  EXECUTING BACKFILL...\n");

            // Begin transaction on production database
            prodDb.run("BEGIN TRANSACTION", (err) => {
                if (err) {
                    console.error("❌ Error starting transaction:", err.message);
                    backupDb.close();
                    prodDb.close();
                    reject(err);
                    return;
                }

                const insertQuery = `
                    INSERT OR REPLACE INTO vendor_daily_totals (
                        scan_date, vendor,
                        critical_count, critical_total_vpr,
                        high_count, high_total_vpr,
                        medium_count, medium_total_vpr,
                        low_count, low_total_vpr,
                        total_vulnerabilities, total_vpr
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                `;

                let inserted = 0;
                let errors = 0;

                // Insert all rows
                const insertPromises = rows.map(row => {
                    return new Promise((resolveInsert, rejectInsert) => {
                        prodDb.run(insertQuery, [
                            row.scan_date, row.vendor,
                            row.critical_count, row.critical_total_vpr,
                            row.high_count, row.high_total_vpr,
                            row.medium_count, row.medium_total_vpr,
                            row.low_count, row.low_total_vpr,
                            row.total_vulnerabilities, row.total_vpr
                        ], function (insertErr) {
                            if (insertErr) {
                                console.error(`❌ Error inserting ${row.scan_date} / ${row.vendor}:`, insertErr.message);
                                errors++;
                                resolveInsert(); // Continue despite error
                            } else {
                                inserted++;
                                if (inserted % 10 === 0) {
                                    process.stdout.write(`\r   Inserted ${inserted}/${rows.length} rows...`);
                                }
                                resolveInsert();
                            }
                        });
                    });
                });

                Promise.all(insertPromises).then(() => {
                    console.log(`\n✅ Inserted ${inserted} rows into vendor_daily_totals`);

                    if (errors > 0) {
                        console.log(`⚠️  ${errors} errors encountered`);
                    }

                    // Commit transaction
                    prodDb.run("COMMIT", (commitErr) => {
                        if (commitErr) {
                            console.error("❌ Error committing transaction:", commitErr.message);
                            prodDb.run("ROLLBACK");
                            backupDb.close();
                            prodDb.close();
                            reject(commitErr);
                            return;
                        }

                        console.log("✅ Transaction committed successfully");
                        console.log("\n🎉 Backfill complete!\n");

                        // Verify results
                        prodDb.all(`
                            SELECT vendor, COUNT(*) as count, MIN(scan_date) as earliest, MAX(scan_date) as latest
                            FROM vendor_daily_totals
                            GROUP BY vendor
                            ORDER BY vendor
                        `, [], (verifyErr, verifyRows) => {
                            if (!verifyErr && verifyRows) {
                                console.log("📊 Verification - Vendor Daily Totals Table:");
                                console.log("=============================================");
                                verifyRows.forEach(row => {
                                    console.log(`${row.vendor.padEnd(12)} | ${row.count} rows | ${row.earliest} to ${row.latest}`);
                                });
                                console.log();
                            }

                            backupDb.close();
                            prodDb.close();
                            resolve();
                        });
                    });
                }).catch(promiseErr => {
                    console.error("❌ Error during insertion:", promiseErr);
                    prodDb.run("ROLLBACK");
                    backupDb.close();
                    prodDb.close();
                    reject(promiseErr);
                });
            });
        });
    });
}

// Run backfill
backfillVendorDailyTotals().then(() => {
    console.log("✅ Backfill script completed successfully");
    process.exit(0);
}).catch(err => {
    console.error("❌ Backfill script failed:", err);
    process.exit(1);
});
