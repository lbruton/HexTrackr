const path = require("path");
const PathValidator = require("../utils/pathValidator");

/**
 * Documentation Service
 * Handles business logic for documentation statistics and file operations
 * Extracted from server.js (T030)
 */
class DocsService {
    constructor() {
        this.serverFilePath = path.join(__dirname, "../public/server.js");
    }

    /**
     * Compute comprehensive documentation statistics
     * Combines API endpoints, JS function count, and framework detection
     * Original: server.js lines 2624-2680
     */
    async computeStats() {
        try {
            const apiEndpoints = await this.computeApiEndpoints();
            const jsFunctions = await this.computeJsFunctionCount();
            const frameworks = this.detectFrameworks();

            return {
                apiEndpoints,
                jsFunctions,
                frameworks: frameworks.length
            };
        } catch (error) {
            console.error("DocsService.computeStats failed:", error);
            throw error;
        }
    }

    /**
     * Count unique Express API routes by scanning server.js file
     * Extracts routes matching pattern: app.(get|post|put|delete|patch)("/api/...")
     */
    async computeApiEndpoints() {
        try {
            const serverCode = PathValidator.safeReadFileSync(this.serverFilePath, "utf8");
            const apiRouteRegex = /app\.(get|post|put|delete|patch)\s*\(\s*["'`]\/api\/[^"'`]+["'`]/g;
            const matches = serverCode.match(apiRouteRegex) || [];
            return [...new Set(matches)].length; // dedupe
        } catch (error) {
            console.error("Failed to compute API endpoints:", error);
            return 0;
        }
    }

    /**
     * Approximate JS function count across scripts/, docs-html/js/, and server.js
     * Uses multiple regex patterns to detect various function declaration styles
     */
    async computeJsFunctionCount() {
        try {
            const jsTargets = [
                path.join(__dirname, "../public/scripts"),
                path.join(__dirname, "../public/docs-html/js")
            ];

            let jsFunctions = 0;
            const fnRegexes = [
                /function\s+\w+/g,           // function declarations
                /const\s+\w+\s*=\s*\(/g,     // const arrow functions
                /\w+\s*:\s*function/g        // object method functions
            ];

            const filesToScan = [this.serverFilePath]; // always include server.js

            // Scan target directories for JS files
            for (const dir of jsTargets) {
                try {
                    const files = PathValidator.safeReaddirSync(dir);
                    for (const file of files) {
                        if (file.endsWith(".js")) {
                            filesToScan.push(path.join(dir, file));
                        }
                    }
                } catch (_) {
                    // ignore missing directories
                }
            }

            // Count functions in each file
            for (const filePath of filesToScan) {
                try {
                    const src = PathValidator.safeReadFileSync(filePath, "utf8");
                    for (const regex of fnRegexes) {
                        const matches = src.match(regex);
                        if (matches) {
                            jsFunctions += matches.length;
                        }
                    }
                } catch (_) {
                    // ignore file read errors
                }
            }

            return jsFunctions;
        } catch (error) {
            console.error("Failed to compute JS function count:", error);
            return 0;
        }
    }

    /**
     * Detect primary frameworks used in the project
     * Returns static list of core frameworks for HexTrackr
     */
    detectFrameworks() {
        return ["Express", "Bootstrap", "Tabler", "SQLite"];
    }

    /**
     * Find a section path for a given filename by scanning the content folder
     * Used by documentation portal routing to resolve direct filename requests
     * Original: server.js lines 2560-2582
     */
    findDocsSectionForFilename(filename) {
        try {
            const contentRoot = path.join(__dirname, "../public/docs-html/content");
            const stack = [""]; // use relative subpaths

            while (stack.length) {
                const relDir = stack.pop();
                const dirPath = path.join(contentRoot, relDir);
                const entries = PathValidator.safeReaddirSync(dirPath, { withFileTypes: true });

                for (const entry of entries) {
                    if (entry.isDirectory()) {
                        stack.push(path.join(relDir, entry.name));
                    } else if (entry.isFile() && entry.name.toLowerCase() === filename.toLowerCase()) {
                        const relFile = path.join(relDir, entry.name);
                        // Convert to section path without .html and using forward slashes
                        return relFile.replace(/\\/g, "/").replace(/\.html$/i, "");
                    }
                }
            }
        } catch (_e) {
            // ignore scan errors and fall back to original behavior
        }
        return null;
    }
}

// Export service instance
const docsService = new DocsService();

module.exports = docsService;