#!/usr/bin/env node
/**
 * CVE Data Migration Script - Fix Truncated CVEs in Database
 * 
 * Enhanced version with automated detection and safe migration capabilities.
 * Identifies CVE data that was truncated by the old bug (B004) where only 
 * the first CVE was stored from multi-CVE entries.
 * 
 * Features:
 * - Automated detection of truncated CVE records
 * - Safe migration with backup capabilities
 * - Dry-run mode for testing
 * - Detailed reporting and logging
 * 
 * Usage: 
 *   node fix-truncated-cves.js --analyze         # Analysis only
 *   node fix-truncated-cves.js --dry-run         # Test migration without changes
 *   node fix-truncated-cves.js --migrate         # Perform actual migration
 *   node fix-truncated-cves.js --backup          # Create backup before migration
 * 
 * Task: T042 - Data migration strategy for existing truncated CVE records
 */

const sqlite3 = require("sqlite3").verbose();
const path = require("path");
const fs = require("fs");

// Parse command line arguments
const args = process.argv.slice(2);
const mode = args[0] || "--analyze";
const validModes = ["--analyze", "--dry-run", "--migrate", "--backup"];

if (!validModes.includes(mode)) {
    console.error(`❌ Invalid mode: ${mode}`);
    console.error(`Valid modes: ${validModes.join(", ")}`);
    process.exit(1);
}

// Database paths
const dbPath = path.join(__dirname, "..", "..", "data", "hextrackr.db");
const backupPath = path.join(__dirname, "..", "..", "data", `hextrackr_backup_${Date.now()}.db`);

console.log("🔍 CVE Data Migration Tool - Enhanced Version");
console.log("=============================================");
console.log(`Mode: ${mode}`);
console.log(`Database: ${dbPath}`);
if (mode === "--backup" || mode === "--migrate") {
    console.log(`Backup: ${backupPath}`);
}
console.log("");

// Statistics tracking
const stats = {
    totalRecords: 0,
    singleCVERecords: 0,
    multiCVERecords: 0,
    truncatedRecords: 0,
    fixableRecords: 0,
    fixedRecords: 0,
    errors: []
};

// Create backup if requested
function createBackup() {
    return new Promise((resolve, reject) => {
        if (mode === "--backup" || mode === "--migrate") {
            console.log("📦 Creating database backup...");
            
            const readStream = fs.createReadStream(dbPath);
            const writeStream = fs.createWriteStream(backupPath);
            
            readStream.on("error", reject);
            writeStream.on("error", reject);
            writeStream.on("finish", () => {
                console.log(`✅ Backup created: ${backupPath}\n`);
                resolve();
            });
            
            readStream.pipe(writeStream);
        } else {
            resolve();
        }
    });
}

// Open database connection
const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READWRITE, (err) => {
    if (err) {
        console.error("❌ Error opening database:", err.message);
        process.exit(1);
    }
    console.log("✅ Connected to HexTrackr database\n");
});

// Enhanced CVE detection with pattern matching
function detectTruncatedCVEs() {
    return new Promise((resolve, reject) => {
        console.log("🔎 Automated Truncation Detection\n");
        console.log("Analyzing patterns to identify truncated CVE records...\n");
        
        // First, get total count
        db.get("SELECT COUNT(*) as total FROM vulnerabilities", (err, row) => {
            if (err) {
                reject(err);
                return;
            }
            stats.totalRecords = row.total;
            console.log(`📊 Total vulnerability records: ${stats.totalRecords}`);
        });
        
        // Find records with evidence of truncation
        const detectionQuery = `
            SELECT 
                id,
                hostname,
                cve,
                plugin_name,
                description,
                severity,
                CASE 
                    WHEN cve LIKE '%,%' OR cve LIKE '% %' THEN 'multi'
                    WHEN cve LIKE 'CVE-%' THEN 'single'
                    ELSE 'none'
                END as cve_type,
                CASE
                    WHEN (description LIKE '%CVE-%' OR plugin_name LIKE '%CVE-%')
                         AND cve LIKE 'CVE-%'
                         AND cve NOT LIKE '%,%'
                         AND cve NOT LIKE '% %'
                    THEN 'suspected'
                    ELSE 'normal'
                END as truncation_status
            FROM vulnerabilities
            WHERE cve IS NOT NULL AND cve != ''
        `;
        
        db.all(detectionQuery, (err, rows) => {
            if (err) {
                reject(err);
                return;
            }
            
            const truncatedCandidates = [];
            
            rows.forEach(row => {
                // Count CVE types
                if (row.cve_type === "single") {stats.singleCVERecords++;}
                if (row.cve_type === "multi") {stats.multiCVERecords++;}
                
                // Advanced truncation detection
                if (row.truncation_status === "suspected") {
                    // Extract all CVEs from text fields
                    const descCVEs = (row.description || "").match(/CVE-\d{4}-\d{4,}/gi) || [];
                    const pluginCVEs = (row.plugin_name || "").match(/CVE-\d{4}-\d{4,}/gi) || [];
                    
                    // Deduplicate and normalize
                    const allCVEs = [...new Set([...descCVEs, ...pluginCVEs])]
                        .map(cve => cve.toUpperCase());
                    
                    // Check if stored CVE is incomplete
                    const storedCVE = row.cve.toUpperCase();
                    const missingCVEs = allCVEs.filter(cve => cve !== storedCVE);
                    
                    if (missingCVEs.length > 0) {
                        truncatedCandidates.push({
                            id: row.id,
                            hostname: row.hostname,
                            storedCVE: storedCVE,
                            allCVEs: allCVEs,
                            missingCVEs: missingCVEs,
                            severity: row.severity,
                            plugin_name: row.plugin_name
                        });
                        stats.truncatedRecords++;
                    }
                }
            });
            
            // Report findings
            console.log("\n📈 Detection Results:");
            console.log(`   • Single CVE records: ${stats.singleCVERecords}`);
            console.log(`   • Multi-CVE records: ${stats.multiCVERecords}`);
            console.log(`   • Suspected truncations: ${stats.truncatedRecords}`);
            
            if (truncatedCandidates.length > 0) {
                console.log("\n⚠️  Truncated Records Found:\n");
                console.log("ID    | Hostname        | Stored CVE      | Missing CVEs");
                console.log("------|-----------------|-----------------|------------------");
                
                truncatedCandidates.slice(0, 10).forEach(record => {
                    const hostname = record.hostname.substring(0, 15).padEnd(15);
                    const stored = record.storedCVE.substring(0, 15).padEnd(15);
                    const missing = record.missingCVEs.join(", ").substring(0, 30);
                    console.log(`${String(record.id).padEnd(5)} | ${hostname} | ${stored} | ${missing}`);
                });
                
                if (truncatedCandidates.length > 10) {
                    console.log(`\n... and ${truncatedCandidates.length - 10} more records`);
                }
                
                // Store for potential migration
                global.truncatedRecords = truncatedCandidates;
                stats.fixableRecords = truncatedCandidates.length;
            } else {
                console.log("\n✅ No truncated records detected!");
            }
            
            resolve();
        });
    });
}

// Safe migration function
function performMigration(dryRun = true) {
    return new Promise((resolve, reject) => {
        if (!global.truncatedRecords || global.truncatedRecords.length === 0) {
            console.log("\n✅ No records to migrate");
            resolve();
            return;
        }
        
        const modeText = dryRun ? "DRY RUN" : "ACTUAL MIGRATION";
        console.log(`\n\n🔄 ${modeText} - Safe CVE Data Migration\n`);
        console.log(`Processing ${global.truncatedRecords.length} truncated records...\n`);
        
        let successCount = 0;
        let errorCount = 0;
        const migrationLog = [];
        
        // Process each truncated record
        const processRecord = (index) => {
            if (index >= global.truncatedRecords.length) {
                // Migration complete
                console.log("\n📊 Migration Summary:");
                console.log(`   • Records processed: ${global.truncatedRecords.length}`);
                console.log(`   • Successful updates: ${successCount}`);
                console.log(`   • Errors: ${errorCount}`);
                
                if (!dryRun) {
                    stats.fixedRecords = successCount;
                    
                    // Save migration log
                    const logPath = path.join(__dirname, "..", "..", "data", `migration_log_${Date.now()}.json`);
                    fs.writeFileSync(logPath, JSON.stringify({
                        timestamp: new Date().toISOString(),
                        mode: mode,
                        stats: stats,
                        migrationLog: migrationLog
                    }, null, 2));
                    console.log(`\n📝 Migration log saved: ${logPath}`);
                }
                
                resolve();
                return;
            }
            
            const record = global.truncatedRecords[index];
            const newCVEValue = record.allCVEs.join(", ");
            
            // Validate new CVE string
            const cveRegex = /^CVE-\d{4}-\d{4,}$/;
            const allValid = record.allCVEs.every(cve => cveRegex.test(cve));
            
            if (!allValid) {
                console.log(`⚠️  Skipping record ${record.id}: Invalid CVE format detected`);
                errorCount++;
                stats.errors.push(`Record ${record.id}: Invalid CVE format`);
                processRecord(index + 1);
                return;
            }
            
            const updateQuery = `
                UPDATE vulnerabilities 
                SET cve = ?, 
                    updated_at = datetime('now'),
                    migration_note = 'CVE data restored from description/plugin_name by migration script'
                WHERE id = ?
            `;
            
            if (dryRun) {
                console.log(`[DRY RUN] Would update record ${record.id}:`);
                console.log(`   From: ${record.storedCVE}`);
                console.log(`   To:   ${newCVEValue}`);
                successCount++;
                migrationLog.push({
                    id: record.id,
                    hostname: record.hostname,
                    oldValue: record.storedCVE,
                    newValue: newCVEValue,
                    status: "dry-run"
                });
                processRecord(index + 1);
            } else {
                db.run(updateQuery, [newCVEValue, record.id], function(err) {
                    if (err) {
                        console.error(`❌ Error updating record ${record.id}:`, err.message);
                        errorCount++;
                        stats.errors.push(`Record ${record.id}: ${err.message}`);
                        migrationLog.push({
                            id: record.id,
                            hostname: record.hostname,
                            oldValue: record.storedCVE,
                            newValue: newCVEValue,
                            status: "error",
                            error: err.message
                        });
                    } else {
                        console.log(`✅ Updated record ${record.id}: ${record.storedCVE} → ${newCVEValue}`);
                        successCount++;
                        migrationLog.push({
                            id: record.id,
                            hostname: record.hostname,
                            oldValue: record.storedCVE,
                            newValue: newCVEValue,
                            status: "success"
                        });
                    }
                    processRecord(index + 1);
                });
            }
        };
        
        // Start processing
        processRecord(0);
    });
}

// Generate enhanced recommendations based on findings
function generateRecommendations() {
    console.log("\n\n📝 MIGRATION RECOMMENDATIONS");
    console.log("============================\n");
    
    if (stats.truncatedRecords > 0) {
        console.log(`⚠️  TRUNCATED DATA DETECTED: ${stats.truncatedRecords} records affected\n`);
        
        console.log("RECOMMENDED ACTIONS:");
        console.log("1. Create a backup first:");
        console.log("   node fix-truncated-cves.js --backup\n");
        
        console.log("2. Test migration with dry-run:");
        console.log("   node fix-truncated-cves.js --dry-run\n");
        
        console.log("3. If dry-run looks good, perform actual migration:");
        console.log("   node fix-truncated-cves.js --migrate\n");
        
        console.log("4. Alternative: Re-import from original CSV files");
        console.log("   - This is the safest option if you have the original data");
        console.log("   - The fixed import logic will preserve all CVEs\n");
    } else {
        console.log("✅ NO TRUNCATED DATA DETECTED\n");
        console.log("Your database appears to be clean. No migration needed.\n");
    }
    
    console.log("PREVENTION MEASURES:");
    console.log("• The code fix (B004) prevents future data loss");
    console.log("• CVE utilities module ensures proper handling");
    console.log("• Monitor imports for completeness\n");
    
    console.log("DATA INTEGRITY CHECKS:");
    console.log("• Verify CVE links open individual CVEs (not all)");
    console.log("• Check that multi-CVE records display correctly");
    console.log("• Confirm external CVE lookups work properly\n");
}

// Enhanced main function with mode handling
async function main() {
    try {
        console.log("🚀 Starting CVE Data Migration Tool...\n");
        
        // Always start with backup if migrating
        if (mode === "--backup" || mode === "--migrate") {
            await createBackup();
        }
        
        // Always run detection first
        await detectTruncatedCVEs();
        
        // Handle different modes
        switch(mode) {
            case "--analyze":
                generateRecommendations();
                break;
                
            case "--dry-run":
                await performMigration(true);
                generateRecommendations();
                break;
                
            case "--migrate":
                await performMigration(false);
                console.log("\n✅ Migration completed successfully!");
                console.log("Please verify your data and test CVE functionality.");
                break;
                
            case "--backup":
                console.log("✅ Backup completed. Run with --analyze to check for issues.");
                break;
        }
        
        // Display final statistics
        console.log("\n📊 Final Statistics:");
        console.log(`   Total Records: ${stats.totalRecords}`);
        console.log(`   Single CVE: ${stats.singleCVERecords}`);
        console.log(`   Multi-CVE: ${stats.multiCVERecords}`);
        console.log(`   Truncated: ${stats.truncatedRecords}`);
        console.log(`   Fixed: ${stats.fixedRecords}`);
        
        if (stats.errors.length > 0) {
            console.log("\n⚠️  Errors encountered:");
            stats.errors.forEach(err => console.log(`   - ${err}`));
        }
        
        console.log("\n✅ Operation complete!");
        
    } catch (error) {
        console.error("❌ Fatal error:", error.message);
        console.error(error.stack);
    } finally {
        db.close((err) => {
            if (err) {
                console.error("Error closing database:", err.message);
            }
            process.exit(stats.errors.length > 0 ? 1 : 0);
        });
    }
}

// Execute
main();