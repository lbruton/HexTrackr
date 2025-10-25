const path = require("path");
const PathValidator = require("../utils/PathValidator");

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
     * Aggregates multiple metrics into a single statistics object for the documentation portal
     * Original: server.js lines 2624-2680
     *
     * @async
     * @returns {Promise<Object>} Resolves with documentation statistics object containing:
     *   - apiEndpoints {number} - Count of unique Express API routes in server.js
     *   - jsFunctions {number} - Approximate count of JS functions across codebase
     *   - frameworks {number} - Count of primary frameworks detected (Express, Bootstrap, Tabler, SQLite)
     * @throws {Error} Rethrows any errors from computeApiEndpoints(), computeJsFunctionCount(), or detectFrameworks()
     *
     * @example
     * const stats = await docsService.computeStats();
     * // Returns: { apiEndpoints: 87, jsFunctions: 342, frameworks: 4 }
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
            if (global.logger?.error) {
                global.logger.error("backend", "docs", "DocsService.computeStats failed", { error: error.message, stack: error.stack });
            } else {
                console.error("DocsService.computeStats failed:", error);
            }
            throw error;
        }
    }

    /**
     * Count unique Express API routes by scanning server.js file
     * Extracts routes matching pattern: app.(get|post|put|delete|patch)("/api/...")
     * Deduplicates matches to count only unique route definitions
     * Original: server.js lines 2624-2680 (part of stats computation)
     *
     * @async
     * @returns {Promise<number>} Resolves with count of unique API endpoints found in server.js, or 0 if file cannot be read
     * @throws {never} Does not throw - errors are caught and logged, returns 0 on failure
     *
     * @example
     * const count = await docsService.computeApiEndpoints();
     * // Returns: 87 (number of unique API routes)
     */
    async computeApiEndpoints() {
        try {
            const serverCode = PathValidator.safeReadFileSync(this.serverFilePath, "utf8");
            const apiRouteRegex = /app\.(get|post|put|delete|patch)\s*\(\s*["'`]\/api\/[^"'`]+["'`]/g;
            const matches = serverCode.match(apiRouteRegex) || [];
            return [...new Set(matches)].length; // dedupe
        } catch (error) {
            if (global.logger?.error) {
                global.logger.error("backend", "docs", "Failed to compute API endpoints", { error: error.message, filePath: this.serverFilePath });
            } else {
                console.error("Failed to compute API endpoints:", error);
            }
            return 0;
        }
    }

    /**
     * Approximate JS function count across scripts/, docs-html/js/, and server.js
     * Uses multiple regex patterns to detect various function declaration styles
     * Scans multiple directories and aggregates function counts from all discovered JS files
     *
     * @async
     * @returns {Promise<number>} Resolves with approximate count of JS functions across codebase
     * @throws {never} Does not throw - errors are caught and logged, returns 0 on failure
     *
     * @example
     * const count = await docsService.computeJsFunctionCount();
     * // Returns: 342 (approximate count of functions)
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
            if (global.logger?.error) {
                global.logger.error("backend", "docs", "Failed to compute JS function count", { error: error.message });
            } else {
                console.error("Failed to compute JS function count:", error);
            }
            return 0;
        }
    }

    /**
     * Detect primary frameworks used in the project
     * Returns static list of core frameworks for HexTrackr
     * Used by computeStats() to provide framework count for documentation portal
     *
     * @returns {Array<string>} Array of framework names (Express, Bootstrap, Tabler, SQLite)
     * @throws {never} Does not throw - returns static array
     *
     * @example
     * const frameworks = docsService.detectFrameworks();
     * // Returns: ["Express", "Bootstrap", "Tabler", "SQLite"]
     */
    detectFrameworks() {
        return ["Express", "Bootstrap", "Tabler", "SQLite"];
    }

    /**
     * Find a section path for a given filename by scanning the content folder
     * Used by documentation portal routing to resolve direct filename requests
     * Performs recursive directory traversal using stack-based search
     * Original: server.js lines 2560-2582
     *
     * @param {string} filename - The HTML filename to search for (case-insensitive, e.g., "index.html")
     * @returns {string|null} Normalized section path without .html extension (forward slashes), or null if not found
     * @throws {Error} Does not throw - catches all errors internally and returns null
     *
     * @example
     * // Search for changelog index
     * const path = docsService.findDocsSectionForFilename("index.html");
     * // Returns: "changelog/index" or null
     *
     * @example
     * // Case-insensitive matching
     * const path = docsService.findDocsSectionForFilename("ROADMAP.html");
     * // Returns: "roadmap" (normalized to lowercase path)
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