#!/usr/bin/env node
/**
 * HexTrackr Version Management Script
 * Manages version numbers across application files
 */

const fs = require('fs');
const path = require('path');

const VERSION_FILES = [
    'package.json',
    'tickets.html',
    'vulnerabilities.html'
];

function getCurrentVersion() {
    const packagePath = path.join(__dirname, '..', 'package.json');
    const packageContent = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
    return packageContent.version;
}

function updateVersion(newVersion) {
    console.log(`🔧 Updating HexTrackr to version ${newVersion}`);
    
    // Update package.json
    const packagePath = path.join(__dirname, '..', 'package.json');
    const packageContent = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
    packageContent.version = newVersion;
    fs.writeFileSync(packagePath, JSON.stringify(packageContent, null, 2) + '\n');
    console.log(`✅ Updated package.json`);
    
    // Update HTML files
    const htmlFiles = ['tickets.html', 'vulnerabilities.html'];
    htmlFiles.forEach(file => {
        const filePath = path.join(__dirname, '..', file);
        let content = fs.readFileSync(filePath, 'utf8');
        content = content.replace(
            /<span id="app-version">[\d.]+<\/span>/g,
            `<span id="app-version">${newVersion}</span>`
        );
        fs.writeFileSync(filePath, content);
        console.log(`✅ Updated ${file}`);
    });
    
    console.log(`🎉 Version update complete: v${newVersion}`);
}

function validateVersion(version) {
    const semverRegex = /^\d+\.\d+\.\d+$/;
    return semverRegex.test(version);
}

// CLI interface
const args = process.argv.slice(2);
if (args.length === 0) {
    console.log(`📋 Current version: v${getCurrentVersion()}`);
    console.log(`\nUsage:`);
    console.log(`  node scripts/version-manager.js <new-version>`);
    console.log(`  node scripts/version-manager.js 1.1.0`);
} else if (args.length === 1) {
    const newVersion = args[0];
    if (!validateVersion(newVersion)) {
        console.error(`❌ Invalid version format: ${newVersion}`);
        console.error(`   Expected format: X.Y.Z (e.g., 1.1.0)`);
        process.exit(1);
    }
    updateVersion(newVersion);
} else {
    console.error(`❌ Too many arguments`);
    console.error(`Usage: node scripts/version-manager.js <new-version>`);
    process.exit(1);
}
