#!/usr/bin/env node

/* eslint-env node */
/* global require, process, console, __dirname */

/**
 * HexTrackr Version Management Script
 * Manages version numbers across application files
 */

const fs = require("fs");
const path = require("path");

/**
 * Secure path validation utility to prevent path traversal attacks
 */
class PathValidator {
    static validatePath(filePath, allowedBaseDir = process.cwd()) {
        if (!filePath || typeof filePath !== "string") {
            throw new Error("Invalid file path: path must be a non-empty string");
        }

        // Resolve the path to get absolute path
        const resolvedPath = path.resolve(path.normalize(filePath));
        const resolvedBase = path.resolve(allowedBaseDir);

        // Check if the resolved path is within the allowed base directory
        if (!resolvedPath.startsWith(resolvedBase)) {
            throw new Error(`Path traversal detected: ${filePath} is outside allowed directory ${allowedBaseDir}`);
        }

        return resolvedPath;
    }

    static safeReadFileSync(filePath, options = "utf8") {
        const validatedPath = PathValidator.validatePath(filePath);
        if (!fs.existsSync(validatedPath)) throw new Error(`File not found: ${validatedPath}`);
        return fs.readFileSync(validatedPath, options);
    }

    static safeWriteFileSync(filePath, data, options = "utf8") {
        const validatedPath = PathValidator.validatePath(filePath);
        return fs.writeFileSync(validatedPath, data, options);
    }
}

const VERSION_FILES = [
    "package.json",
    "tickets.html",
    "vulnerabilities.html"
];

function getCurrentVersion() {
    const packagePath = path.join(__dirname, "..", "package.json");
    const packageContent = JSON.parse(PathValidator.safeReadFileSync(packagePath, "utf8"));
    return packageContent.version;
}

function updateVersion(newVersion) {
    console.log(`🔧 Updating HexTrackr to version ${newVersion}`);
    
    // Update package.json
    const packagePath = path.join(__dirname, "..", "package.json");
    const packageContent = JSON.parse(PathValidator.safeReadFileSync(packagePath, "utf8"));
    packageContent.version = newVersion;
    PathValidator.safeWriteFileSync(packagePath, JSON.stringify(packageContent, null, 2) + "\n");
    console.log("✅ Updated package.json");
    
    // Update HTML files
    const htmlFiles = ["tickets.html", "vulnerabilities.html"];
    htmlFiles.forEach(file => {
        const filePath = path.join(__dirname, "..", file);
        let content = PathValidator.safeReadFileSync(filePath, "utf8");
        content = content.replace(
            /<span id="app-version">[\d.]+<\/span>/g,
            `<span id="app-version">${newVersion}</span>`
        );
        PathValidator.safeWriteFileSync(filePath, content);
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
    console.log("\nUsage:");
    console.log("  node scripts/version-manager.js <new-version>");
    console.log("  node scripts/version-manager.js 1.1.0");
} else if (args.length === 1) {
    const newVersion = args[0];
    if (!validateVersion(newVersion)) {
        console.error(`❌ Invalid version format: ${newVersion}`);
        console.error("   Expected format: X.Y.Z (e.g., 1.1.0)");
        process.exit(1);
    }
    updateVersion(newVersion);
} else {
    console.error("❌ Too many arguments");
    console.error("Usage: node scripts/version-manager.js <new-version>");
    process.exit(1);
}
