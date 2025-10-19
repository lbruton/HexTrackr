#!/usr/bin/env node

/**
 * @fileoverview One-time seeding script for Cisco advisory data
 * @description Runs a full sync to populate initial advisory data
 * @usage node scripts/seed-cisco-advisories.js
 * @since v1.0.63
 */

const path = require("path");
const Database = require("better-sqlite3");

// Load environment variables
require("dotenv").config({ path: path.join(__dirname, "../.env") });

// Import service
const CiscoAdvisoryService = require("../app/services/ciscoAdvisoryService");
const PreferencesService = require("../app/services/preferencesService");

async function main() {
    console.log("🌱 Cisco Advisory Seeding Script");
    console.log("=" .repeat(50));

    // Initialize database connection
    const dbPath = path.join(__dirname, "../app/data/hextrackr.db");
    console.log(`📂 Database: ${dbPath}`);

    const db = new Database(dbPath);
    console.log("✅ Connected to database");

    // Initialize services
    const preferencesService = new PreferencesService(db);
    const ciscoService = new CiscoAdvisoryService(db, preferencesService);

    console.log("\n📊 Checking existing data...");
    const existingCount = db.prepare("SELECT COUNT(*) as count FROM cisco_advisories").get().count;
    console.log(`   Found ${existingCount} existing advisories in database`);

    // Check if user has Cisco credentials
    try {
        const { clientId } = await ciscoService.getCiscoCredentials(1); // Assume user ID 1 (admin)
        if (!clientId) {
            console.error("\n❌ No Cisco API credentials found in preferences");
            console.error("   Please configure credentials in HexTrackr settings first");
            process.exit(1);
        }
    } catch (error) {
        console.error("\n❌ Failed to load Cisco credentials:", error.message);
        process.exit(1);
    }

    console.log("\n🚀 Starting seed sync...");
    console.log("   This will take approximately 6-10 minutes");
    console.log("   Progress will be logged every 10 CVEs\n");

    try {
        const result = await ciscoService.syncCiscoAdvisories(1); // User ID 1 (admin)

        console.log("\n" + "=".repeat(50));
        console.log("✅ Seed sync completed successfully!");
        console.log(`   Total advisories: ${result.totalAdvisories}`);
        console.log(`   CVEs matched: ${result.matchedCount}`);
        console.log(`   CVEs checked: ${result.totalCvesChecked}`);
        console.log(`   Last sync: ${result.lastSync}`);

        // Show statistics
        const stats = db.prepare(`
            SELECT
                COUNT(*) as total,
                COUNT(CASE WHEN LENGTH(first_fixed) > 2 THEN 1 END) as with_fixes
            FROM cisco_advisories
        `).get();

        console.log("\n📈 Database statistics:");
        console.log(`   Total advisories: ${stats.total}`);
        console.log(`   With fixed versions: ${stats.with_fixes}`);
        console.log(`   Without fixes: ${stats.total - stats.with_fixes}`);

    } catch (error) {
        console.error("\n❌ Seed sync failed:", error.message);
        process.exit(1);
    } finally {
        db.close();
        console.log("\n👋 Database connection closed");
    }
}

// Run the script
main().catch(error => {
    console.error("Fatal error:", error);
    process.exit(1);
});
