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
 * Used by the documentation portal routing system
 *
 * @param {string} filename - The HTML filename to search for (e.g., "OVERVIEW.html")
 * @returns {string|null} The section path without .html extension and using forward slashes, or null if not found
 * @example
 * findDocsSectionForFilename("OVERVIEW.html") // Returns "OVERVIEW"
 * findDocsSectionForFilename("api/endpoints.html") // Returns "api/endpoints"
 */
function findDocsSectionForFilename(filename) {
    return docsService.findDocsSectionForFilename(filename);
}

// Export controller instance for route handlers
const docsController = new DocsController();

module.exports = {
    getStats: () => docsController.getStats(),
    findDocsSectionForFilename
};