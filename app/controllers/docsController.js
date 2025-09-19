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