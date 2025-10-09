#!/usr/bin/env node

/**
 * @fileoverview Split CHANGELOG.md into individual version files
 * @description Parses the monolithic CHANGELOG.md and creates individual
 * markdown files for each version in the changelog/versions/ directory
 */

const fs = require("fs");
const path = require("path");

const CHANGELOG_PATH = path.join(__dirname, "..", "docs-source", "CHANGELOG.md");
const VERSIONS_DIR = path.join(__dirname, "..", "docs-source", "changelog", "versions");

/**
 * Parse CHANGELOG and extract version sections
 * @returns {Array<{version: string, content: string}>}
 */
function parseChangelog() {
    const content = fs.readFileSync(CHANGELOG_PATH, "utf8");
    const lines = content.split("\n");

    const versions = [];
    let currentVersion = null;
    let currentContent = [];
    let inHeader = true;

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];

        // Check for version header (## [x.x.x] or ## [x.x.x] - date)
        const versionMatch = line.match(/^## \[([^\]]+)\](?:\s+-\s+(.+))?$/);

        if (versionMatch) {
            inHeader = false;

            // Save previous version if exists
            if (currentVersion) {
                versions.push({
                    version: currentVersion.version,
                    date: currentVersion.date,
                    content: currentContent.join("\n").trim()
                });
            }

            // Start new version
            currentVersion = {
                version: versionMatch[1],
                date: versionMatch[2] || ""
            };
            currentContent = [line]; // Include the version header
        } else if (!inHeader && currentVersion) {
            // Add line to current version content
            currentContent.push(line);
        }
    }

    // Don't forget the last version
    if (currentVersion) {
        versions.push({
            version: currentVersion.version,
            date: currentVersion.date,
            content: currentContent.join("\n").trim()
        });
    }

    return versions;
}

/**
 * Write version files to disk
 * @param {Array} versions - Array of version objects
 */
function writeVersionFiles(versions) {
    // Ensure versions directory exists
    if (!fs.existsSync(VERSIONS_DIR)) {
        fs.mkdirSync(VERSIONS_DIR, { recursive: true });
    }

    let filesWritten = 0;

    for (const versionData of versions) {
        const filename = `${versionData.version}.md`;
        const filepath = path.join(VERSIONS_DIR, filename);

        // Add frontmatter header
        let fileContent = `# Version ${versionData.version}`;
        if (versionData.date) {
            fileContent += `\n\n**Release Date**: ${versionData.date}`;
        }
        fileContent += `\n\n---\n\n${versionData.content}`;

        fs.writeFileSync(filepath, fileContent, "utf8");
        filesWritten++;

        console.log(`✅ Created ${filename}`);
    }

    return filesWritten;
}

/**
 * Main execution
 */
function main() {
    console.log("🚀 Splitting CHANGELOG.md into version files...\n");

    try {
        // Parse the changelog
        const versions = parseChangelog();
        console.log(`📊 Found ${versions.length} versions\n`);

        // Write individual version files
        const filesWritten = writeVersionFiles(versions);

        console.log(`\n✨ Successfully created ${filesWritten} version files in:`);
        console.log(`   ${VERSIONS_DIR}`);

        // Summary
        console.log(`\n📋 Version Range:`);
        console.log(`   Newest: ${versions[0].version}`);
        console.log(`   Oldest: ${versions[versions.length - 1].version}`);

    } catch (error) {
        console.error("❌ Error splitting changelog:", error.message);
        process.exit(1);
    }
}

// Run if called directly
if (require.main === module) {
    main();
}

module.exports = { parseChangelog, writeVersionFiles };
