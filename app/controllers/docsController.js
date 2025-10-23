const docsService = require("../services/docsService");

/**
 * Documentation Controller
 * Handles HTTP requests for documentation-related endpoints
 * Extracted from server.js (T029)
 */
class DocsController {
    /**
     * Get documentation statistics
     * Handles GET /api/docs/stats
     * Computes API endpoints, JS function count, and framework statistics
     * Original: server.js lines 2624-2680
     *
     * @async
     * @returns {Promise<{apiEndpoints: number, jsFunctions: number, frameworks: number, computedAt: string}>}
     *   Statistics object containing:
     *   - apiEndpoints: Count of unique Express API routes
     *   - jsFunctions: Approximate count of JS functions across codebase
     *   - frameworks: Number of primary frameworks detected
     *   - computedAt: ISO 8601 timestamp of computation
     * @throws {Error} If statistics computation fails (delegated from docsService)
     * @example
     * const stats = await docsController.getStats();
     * // Returns: { apiEndpoints: 87, jsFunctions: 342, frameworks: 4, computedAt: "2025-10-22T..." }
     */
    async getStats() {
        try {
            const stats = await docsService.computeStats();
            return {
                apiEndpoints: stats.apiEndpoints,
                jsFunctions: stats.jsFunctions,
                frameworks: stats.frameworks,
                computedAt: new Date().toISOString()
            };
        } catch (error) {
            console.error("DocsController.getStats failed:", error);
            throw new Error("Failed to compute documentation statistics");
        }
    }
}

/**
 * Helper function to find a section path for a given filename by scanning the content folder
 * Extracted from server.js lines 2560-2582
 * Used by the documentation portal routing system to resolve filenames to section paths
 *
 * @param {string} filename - The HTML filename to search for in the docs content directory.
 *   Should include the .html extension. Examples: "OVERVIEW.html", "api/endpoints.html"
 *   No validation is performed on the input - invalid filenames return null
 * @returns {string|null} The section path without .html extension and using forward slashes
 *   (e.g., "OVERVIEW", "api/endpoints"), or null if filename not found in content directory.
 *   Used as the hash fragment in documentation URLs (e.g., /docs-html/#api/endpoints)
 * @throws {never} Does not throw - delegates to docsService.findDocsSectionForFilename() which
 *   catches all filesystem errors internally and returns null on failure
 * @see {@link DocsService#findDocsSectionForFilename} - Implementation details
 *
 * @example
 * // Simple filename lookup
 * findDocsSectionForFilename("OVERVIEW.html") // Returns "OVERVIEW"
 *
 * @example
 * // Nested path lookup
 * findDocsSectionForFilename("api/endpoints.html") // Returns "api/endpoints"
 *
 * @example
 * // File not found
 * findDocsSectionForFilename("nonexistent.html") // Returns null
 */
function findDocsSectionForFilename(filename) {
    return docsService.findDocsSectionForFilename(filename);
}

// Export controller instance for route handlers
const docsController = new DocsController();

module.exports = {
    /**
     * Get documentation statistics (Public API)
     * Computes API endpoints, JS function count, and framework statistics
     * Used by GET /api/docs/stats route handler
     *
     * @async
     * @function getStats
     * @returns {Promise<{apiEndpoints: number, jsFunctions: number, frameworks: number, computedAt: string}>}
     *   Statistics object containing documentation metrics
     * @throws {Error} If statistics computation fails
     * @example
     * const stats = await docsController.getStats();
     * // Returns: { apiEndpoints: 87, jsFunctions: 342, frameworks: 4, computedAt: "2025-10-22T..." }
     */
    getStats: () => docsController.getStats(),

    /**
     * Find documentation section path for a given HTML filename (Public API)
     * Searches the docs-html/content directory recursively to resolve filenames to section paths
     * Used by documentation portal routing system to handle direct file requests
     *
     * @function findDocsSectionForFilename
     * @param {string} filename - HTML filename to search for (e.g., "OVERVIEW.html", "api/endpoints.html")
     * @returns {string|null} Section path without .html extension (e.g., "OVERVIEW", "api/endpoints"), or null if not found
     * @throws {never} Does not throw - delegates to DocsService which catches all errors and returns null
     * @see {@link DocsService#findDocsSectionForFilename} - Implementation in service layer
     * @example
     * // Resolve filename to section path
     * const section = findDocsSectionForFilename("OVERVIEW.html");
     * // Returns: "OVERVIEW"
     *
     * @example
     * // File not found case
     * const section = findDocsSectionForFilename("nonexistent.html");
     * // Returns: null
     */
    findDocsSectionForFilename
};