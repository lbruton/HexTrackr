#!/usr/bin/env node
/**
 * CVE Data Migration Script - Fix Truncated CVEs in Database
 * 
 * This script helps identify and potentially fix CVE data that was truncated
 * by the old bug (B004) where only the first CVE was stored from multi-CVE entries.
 * 
 * IMPORTANT: This is a diagnostic tool. Manual review is recommended before
 * applying any automated fixes, as we cannot recover lost CVE data automatically.
 * 
 * Usage: node fix-truncated-cves.js
 */

const sqlite3 = require("sqlite3").verbose();
const path = require("path");

// Database path
const dbPath = path.join(__dirname, "..", "..", "data", "hextrackr.db");

console.log("🔍 CVE Data Migration Tool");
console.log("==========================");
console.log(`Database: ${dbPath}\n`);

// Open database connection
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error("❌ Error opening database:", err.message);
        process.exit(1);
    }
    console.log("✅ Connected to HexTrackr database\n");
});

// Analyze CVE data
function analyzeCVEData() {
    return new Promise((resolve, reject) => {
        console.log("📊 Analyzing CVE Data...\n");
        
        // Count total vulnerabilities
        db.get("SELECT COUNT(*) as total FROM vulnerabilities", (err, row) => {
            if (err) {
                reject(err);
                return;
            }
            console.log(`Total vulnerability records: ${row.total}`);
        });
        
        // Find records with single CVEs that might have been truncated
        const singleCVEQuery = `
            SELECT 
                id,
                hostname,
                cve,
                plugin_name,
                description
            FROM vulnerabilities 
            WHERE cve LIKE 'CVE-%' 
            AND cve NOT LIKE '%,%'
            AND cve NOT LIKE '% %'
            LIMIT 20
        `;
        
        db.all(singleCVEQuery, (err, rows) => {
            if (err) {
                reject(err);
                return;
            }
            
            console.log("\n📋 Sample of single CVE records (potentially truncated):\n");
            console.log("ID | Hostname | CVE | Plugin Name");
            console.log("---|----------|-----|-------------");
            
            rows.forEach(row => {
                const pluginShort = row.plugin_name ? 
                    row.plugin_name.substring(0, 50) + (row.plugin_name.length > 50 ? "..." : "") : 
                    "N/A";
                console.log(`${row.id} | ${row.hostname} | ${row.cve} | ${pluginShort}`);
            });
            
            resolve();
        });
    });
}

// Find patterns that suggest truncation
function findTruncationPatterns() {
    return new Promise((resolve, reject) => {
        console.log("\n\n🔎 Looking for truncation patterns...\n");
        
        // Look for CVEs in description/plugin_name that aren't in CVE field
        const patternQuery = `
            SELECT 
                id,
                hostname,
                cve,
                plugin_name,
                description
            FROM vulnerabilities
            WHERE (description LIKE '%CVE-%' OR plugin_name LIKE '%CVE-%')
            AND cve LIKE 'CVE-%'
            LIMIT 10
        `;
        
        db.all(patternQuery, (err, rows) => {
            if (err) {
                reject(err);
                return;
            }
            
            console.log("Records where description/plugin_name might contain additional CVEs:\n");
            
            let foundIssues = 0;
            rows.forEach(row => {
                // Extract all CVEs from description and plugin_name
                const descCVEs = (row.description || "").match(/CVE-\d{4}-\d+/g) || [];
                const pluginCVEs = (row.plugin_name || "").match(/CVE-\d{4}-\d+/g) || [];
                const allCVEs = [...new Set([...descCVEs, ...pluginCVEs])];
                
                if (allCVEs.length > 1 || (allCVEs.length === 1 && allCVEs[0] !== row.cve)) {
                    foundIssues++;
                    console.log(`⚠️  Record ${row.id} (${row.hostname}):`);
                    console.log(`   Stored CVE: ${row.cve}`);
                    console.log(`   Found CVEs: ${allCVEs.join(", ")}`);
                    console.log(`   Plugin: ${row.plugin_name?.substring(0, 60)}...`);
                    console.log("");
                }
            });
            
            if (foundIssues === 0) {
                console.log("✅ No obvious truncation patterns found in sample");
            } else {
                console.log(`\n⚠️  Found ${foundIssues} potential truncation issues in sample`);
            }
            
            resolve();
        });
    });
}

// Generate migration recommendations
function generateRecommendations() {
    console.log("\n\n📝 RECOMMENDATIONS");
    console.log("==================\n");
    
    console.log("1. IMMEDIATE ACTIONS:");
    console.log("   - The code fix (B004) prevents NEW data loss");
    console.log("   - The UI fix prevents multiple tabs from opening\n");
    
    console.log("2. FOR EXISTING DATA:");
    console.log("   - Re-import vulnerability data from original CSV files if available");
    console.log("   - The new import logic will preserve all CVEs\n");
    
    console.log("3. MANUAL REVIEW:");
    console.log("   - Check records where plugin_name contains multiple CVEs");
    console.log("   - Consider updating CVE field manually for critical records\n");
    
    console.log("4. PREVENTION:");
    console.log("   - Always use the latest import logic");
    console.log("   - Monitor for CVE truncation in future imports\n");
}

// Run analysis
async function main() {
    try {
        await analyzeCVEData();
        await findTruncationPatterns();
        generateRecommendations();
        
        console.log("✅ Analysis complete!\n");
    } catch (error) {
        console.error("❌ Error during analysis:", error);
    } finally {
        db.close((err) => {
            if (err) {
                console.error("Error closing database:", err.message);
            }
            process.exit(0);
        });
    }
}

// Execute
main();