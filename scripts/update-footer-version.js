#!/usr/bin/env node

/* eslint-env node */
/* global require, process, console, module */

/**
 * Footer Version Updater
 * Updates footer.html with version from roadmap.json
 * Tool script for Doc agent to use during documentation generation
 */

const fs = require("fs").promises;
const path = require("path");

/**
 * Updates the footer.html file with the version from roadmap.json
 */
async function updateFooterVersion() {
    try {
        console.log("📋 Updating footer version from roadmap.json...");
        
        // Read the current version from roadmap.json
        const roadmapPath = path.join(process.cwd(), "hextrackr-specs", "data", "roadmap.json");
        const roadmapContent = await fs.readFile(roadmapPath, "utf8");
        const roadmapData = JSON.parse(roadmapContent);
        const currentVersion = roadmapData.version;
        
        if (!currentVersion) {
            throw new Error("No version found in roadmap.json");
        }
        
        console.log(`📌 Found version: ${currentVersion}`);
        
        // Read the footer.html file
        const footerPath = path.join(process.cwd(), "app", "public", "scripts", "shared", "footer.html");
        let footerContent = await fs.readFile(footerPath, "utf8");
        
        // Update the version badge URL
        const oldBadgePattern = /HexTrackr-v[\d.]+/g;
        const newBadgeUrl = `HexTrackr-v${currentVersion}`;
        
        // Count replacements to verify they happened
        const originalContent = footerContent;
        footerContent = footerContent.replace(oldBadgePattern, newBadgeUrl);
        
        // Check if any replacements were made
        if (originalContent === footerContent) {
            console.log("⚠️  No version badges found to update in footer.html");
            return { success: false, message: "No badges updated" };
        }
        
        // Write the updated footer back
        await fs.writeFile(footerPath, footerContent, "utf8");
        
        console.log(`✅ Footer version updated to v${currentVersion}`);
        console.log(`📄 Updated: ${footerPath}`);
        
        return { 
            success: true, 
            version: currentVersion,
            message: `Footer updated to v${currentVersion}` 
        };
        
    } catch (error) {
        console.error("❌ Error updating footer version:", error.message);
        return { 
            success: false, 
            error: error.message,
            message: `Failed to update footer: ${error.message}` 
        };
    }
}

// Run if called directly
if (require.main === module) {
    updateFooterVersion()
        .then(result => {
            if (result.success) {
                console.log("\n🎉 Footer version update complete!");
                process.exit(0);
            } else {
                console.error(`\n💥 Footer version update failed: ${result.message}`);
                process.exit(1);
            }
        })
        .catch(error => {
            console.error("💥 Unexpected error:", error);
            process.exit(1);
        });
}

module.exports = { updateFooterVersion };