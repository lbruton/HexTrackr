const docsService = require("../services/docsService");

/**
 * DocsController - Controller for documentation-related endpoints
 *
 * Handles HTTP requests for documentation statistics and metadata.
 * Uses functional pattern (not singleton) with instance-based methods.
 * Delegates computation logic to docsService.
 *
 * @class DocsController
 * @since 1.0.0
 * @extracted from server.js (T029)
 */
class DocsController {
    /**
     * Get documentation statistics including API endpoints and framework data
     * Route: GET /api/docs/stats
     * Computes API endpoints, JS function count, and framework statistics
     * Original: server.js lines 2624-2680
     *
     * @async
     * @returns {Promise<Object>} Documentation statistics object
     * @throws {Error} If statistics computation fails
     *
     * @example
     * // Usage in route handler:
     * const stats = await docsController.getStats();
     * // Returns:
     * {
     *   apiEndpoints: 45,
     *   jsFunctions: 156,
     *   frameworks: { express: "4.18.x", socket.io: "4.7.x" },
     *   computedAt: "2024-01-15T10:30:00.000Z"
     * }
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
 * @param {string} filename - The filename to search for (without path)
 * @returns {string|null} The section path if found, null otherwise
 * @throws {Error} If file system access fails
 *
 * @example
 * // Find section for a documentation file
 * const section = findDocsSectionForFilename("api-reference.md");
 * // Returns: "api-reference" or null if not found
 */
function findDocsSectionForFilename(filename) {
    return docsService.findDocsSectionForFilename(filename);
}

// Export controller instance for route handlers
const docsController = new DocsController();

/**
 * Module exports for documentation controller
 * Provides wrapped methods for route handlers
 *
 * @module docsController
 */
module.exports = {
    /**
     * Wrapped getStats method for route handlers
     * @returns {Promise<Object>} Documentation statistics
     */
    getStats: () => docsController.getStats(),

    /**
     * Helper function for finding documentation sections
     * @param {string} filename - Filename to search for
     * @returns {string|null} Section path or null
     */
    findDocsSectionForFilename
};