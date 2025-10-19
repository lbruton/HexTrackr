#!/usr/bin/env node
/**
 * Database Snapshot Cleanup Script
 * HEX-219: Implement retention policy for vulnerability_snapshots table
 *
 * Purpose: Keep only the last N scan dates in vulnerability_snapshots table
 * Why: Reduce database bloat while preserving rollback capability and trends
 *
 * Features:
 * - Dry-run mode (default): Shows what will be deleted without deleting
 * - Backup verification: Ensures backup exists before cleanup
 * - Transaction-based: All-or-nothing cleanup
 * - Detailed logging: Records exactly what was deleted
 *
 * Usage:
 *   npm run db:cleanup           # Dry-run (shows what would be deleted)
 *   npm run db:cleanup -- --execute  # Actually delete old snapshots
 *   npm run db:cleanup -- --retain 5 # Keep last 5 scan dates instead of 3
 *
 * @author Claude Code
 * @since v1.0.66
 */

const sqlite3 = require("sqlite3").verbose();
const path = require("path");
const fs = require("fs");

// Configuration
const DB_PATH = path.join(__dirname, "..", "app", "data", "hextrackr.db");
const BACKUP_DIR = path.join(__dirname, "..", "app", "data");
const DEFAULT_RETAIN_COUNT = 3;

// Parse command line arguments
const args = process.argv.slice(2);
const isDryRun = !args.includes("--execute");
const retainCount = parseInt(args.find(arg => arg.startsWith("--retain="))?.split("=")[1]) || DEFAULT_RETAIN_COUNT;

/**
 * Format bytes to human-readable size
 */
function formatBytes(bytes) {
    if (bytes === 0) {return "0 B";}
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + " " + sizes[i];
}

/**
 * Check if a recent backup exists
 */
function checkBackup() {
    const files = fs.readdirSync(BACKUP_DIR);
    const backupFiles = files.filter(f => f.endsWith(".backup") || f.includes("backup"));

    if (backupFiles.length === 0) {
        console.error("❌ ERROR: No database backup found!");
        console.error("   Create a backup first: sqlite3 app/data/hextrackr.db \".backup app/data/hextrackr.db.backup-pre-cleanup\"");
        process.exit(1);
    }

    const latestBackup = backupFiles
        .map(f => ({ name: f, time: fs.statSync(path.join(BACKUP_DIR, f)).mtime }))
        .sort((a, b) => b.time - a.time)[0];

    const backupAge = Date.now() - latestBackup.time.getTime();
    const backupAgeHours = Math.round(backupAge / 1000 / 60 / 60);

    console.log(`✅ Backup found: ${latestBackup.name} (${backupAgeHours} hours old)`);

    if (backupAgeHours > 24) {
        console.warn("⚠️  WARNING: Backup is more than 24 hours old. Consider creating a fresh backup.");
    }
}

/**
 * Main cleanup function
 */
async function cleanupSnapshots() {
    console.log("📊 Database Snapshot Cleanup Script");
    console.log("=====================================\n");

    // Check for backup
    checkBackup();

    // Connect to database
    const db = new sqlite3.Database(DB_PATH, sqlite3.OPEN_READWRITE, (err) => {
        if (err) {
            console.error("❌ Error opening database:", err.message);
            process.exit(1);
        }
    });

    return new Promise((resolve, reject) => {
        db.serialize(() => {
            // Step 1: Get current snapshot statistics
            console.log("\n📈 Current Snapshot Statistics:");
            console.log("================================\n");

            db.all(`
                SELECT
                    scan_date,
                    COUNT(*) as row_count,
                    ROUND(COUNT(*) * 1200.0 / 1024 / 1024, 2) as est_mb
                FROM vulnerability_snapshots
                GROUP BY scan_date
                ORDER BY scan_date DESC
            `, [], (err, rows) => {
                if (err) {
                    console.error("❌ Error querying snapshots:", err.message);
                    db.close();
                    reject(err);
                    return;
                }

                console.log("Scan Date   | Row Count | Est. Size");
                console.log("------------|-----------|----------");

                let totalRows = 0;
                let totalSize = 0;

                rows.forEach((row, index) => {
                    const marker = index < retainCount ? "✅ KEEP" : "🗑️  DELETE";
                    console.log(`${row.scan_date} | ${row.row_count.toLocaleString().padStart(9)} | ${row.est_mb.toString().padStart(7)} MB ${marker}`);
                    totalRows += row.row_count;
                    totalSize += row.est_mb;
                });

                console.log("------------|-----------|----------");
                console.log(`TOTAL       | ${totalRows.toLocaleString().padStart(9)} | ${totalSize.toFixed(2).padStart(7)} MB`);

                // Step 2: Determine what will be deleted
                const datesToKeep = rows.slice(0, retainCount).map(r => r.scan_date);
                const datesToDelete = rows.slice(retainCount).map(r => r.scan_date);

                if (datesToDelete.length === 0) {
                    console.log("\n✅ No cleanup needed! Database already has " + retainCount + " or fewer scan dates.");
                    db.close();
                    resolve();
                    return;
                }

                console.log("\n📋 Cleanup Plan:");
                console.log("================\n");
                console.log(`Retention Policy: Keep last ${retainCount} scan dates`);
                console.log(`Dates to KEEP:    ${datesToKeep.join(", ")}`);
                console.log(`Dates to DELETE:  ${datesToDelete.join(", ")}`);

                const rowsToDelete = rows.slice(retainCount).reduce((sum, r) => sum + r.row_count, 0);
                const sizeToFree = rows.slice(retainCount).reduce((sum, r) => sum + r.est_mb, 0);

                console.log(`\nRows to delete:   ${rowsToDelete.toLocaleString()}`);
                console.log(`Space to reclaim: ~${sizeToFree.toFixed(2)} MB`);

                // Step 3: Execute or dry-run
                if (isDryRun) {
                    console.log("\n🔍 DRY-RUN MODE (no changes made)");
                    console.log("   Run with --execute flag to perform cleanup");
                    db.close();
                    resolve();
                    return;
                }

                console.log("\n⚠️  EXECUTING CLEANUP...\n");

                // Step 4: Delete old snapshots in transaction
                db.run("BEGIN TRANSACTION", (err) => {
                    if (err) {
                        console.error("❌ Error starting transaction:", err.message);
                        db.close();
                        reject(err);
                        return;
                    }

                    const placeholders = datesToDelete.map(() => "?").join(",");
                    const deleteQuery = `
                        DELETE FROM vulnerability_snapshots
                        WHERE scan_date IN (${placeholders})
                    `;

                    db.run(deleteQuery, datesToDelete, function(err) {
                        if (err) {
                            console.error("❌ Error deleting snapshots:", err.message);
                            db.run("ROLLBACK");
                            db.close();
                            reject(err);
                            return;
                        }

                        console.log(`✅ Deleted ${this.changes.toLocaleString()} rows from vulnerability_snapshots`);

                        // Commit transaction
                        db.run("COMMIT", (err) => {
                            if (err) {
                                console.error("❌ Error committing transaction:", err.message);
                                db.run("ROLLBACK");
                                db.close();
                                reject(err);
                                return;
                            }

                            console.log("✅ Transaction committed successfully");

                            // Step 5: Run incremental vacuum if auto_vacuum is enabled
                            db.get("PRAGMA auto_vacuum", [], (err, row) => {
                                if (err) {
                                    console.warn("⚠️  Could not check auto_vacuum setting");
                                    db.close();
                                    resolve();
                                    return;
                                }

                                if (row.auto_vacuum === 2) {
                                    // INCREMENTAL auto_vacuum enabled
                                    console.log("\n🔧 Running incremental vacuum...");
                                    db.run("PRAGMA incremental_vacuum(1000)", (err) => {
                                        if (err) {
                                            console.warn("⚠️  Incremental vacuum warning:", err.message);
                                        } else {
                                            console.log("✅ Incremental vacuum completed (1000 pages)");
                                        }

                                        console.log("\n✅ CLEANUP COMPLETE!");
                                        console.log("\nNext steps:");
                                        console.log("1. Run VACUUM to reclaim disk space: sqlite3 app/data/hextrackr.db \"VACUUM;\"");
                                        console.log("2. Check database size: ls -lh app/data/hextrackr.db");
                                        console.log("3. Verify functionality: npm start (test charts/trends)");

                                        db.close();
                                        resolve();
                                    });
                                } else {
                                    console.log("\n✅ CLEANUP COMPLETE!");
                                    console.log("\nNext steps:");
                                    console.log("1. Run VACUUM to reclaim disk space: sqlite3 app/data/hextrackr.db \"VACUUM;\"");
                                    console.log("2. Check database size: ls -lh app/data/hextrackr.db");
                                    console.log("3. Verify functionality: npm start (test charts/trends)");

                                    db.close();
                                    resolve();
                                }
                            });
                        });
                    });
                });
            });
        });
    });
}

// Run cleanup
cleanupSnapshots()
    .then(() => {
        process.exit(0);
    })
    .catch((err) => {
        console.error("\n❌ Cleanup failed:", err.message);
        process.exit(1);
    });
