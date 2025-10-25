/**
 * HTTP Response Helper Utilities for HexTrackr
 * Provides cache-busting detection and response header management
 * Used by controllers that support client-side cache bypass via query parameters
 *
 * @module utils/httpHelpers
 * @since 1.1.7
 */

/**
 * Check if request should bypass cache
 * Supports two mechanisms: _t timestamp or bustCache flag
 *
 * @param {Object} req - Express request object
 * @param {Object} [req.query] - Query string parameters from URL
 * @param {string} [req.query._t] - Timestamp parameter (any value triggers bypass)
 * @param {string|boolean} [req.query.bustCache] - Explicit cache bust flag
 * @returns {boolean} True if cache should be bypassed
 *
 * @example
 * // Timestamp-based cache bypass (common pattern)
 * // GET /api/vulnerabilities/stats?_t=1729701234567
 * shouldBypassCache(req); // Returns: true
 *
 * @example
 * // Explicit bustCache flag
 * // GET /api/vulnerabilities/stats?bustCache=true
 * shouldBypassCache(req); // Returns: true
 *
 * @example
 * // Normal cached request
 * // GET /api/vulnerabilities/stats
 * shouldBypassCache(req); // Returns: false
 */
function shouldBypassCache(req) {
    if (!req || !req.query) {
        return false;
    }

    // Support both explicit bustCache flag and timestamp query param
    if (Object.prototype.hasOwnProperty.call(req.query, "_t")) {
        return true;
    }

    if (typeof req.query.bustCache === "string") {
        return req.query.bustCache.toLowerCase() === "true";
    }

    return Boolean(req.query.bustCache);
}

/**
 * Send JSON response with cache bypass headers
 * Sets HTTP cache control headers to prevent browser and proxy caching
 * Works in conjunction with shouldBypassCache() to implement dual cache-busting strategy
 *
 * Sets the following headers:
 * - X-Cache: BYPASS (custom header for monitoring)
 * - Cache-Control: no-cache, no-store, must-revalidate (HTTP/1.1)
 * - Pragma: no-cache (HTTP/1.0 compatibility)
 * - Expires: 0 (legacy browser support)
 *
 * @param {Object} res - Express response object
 * @param {Object} payload - JSON payload to send in response body
 * @returns {Object} Express response object (for chaining)
 *
 * @example
 * // Typical usage in controller
 * if (shouldBypassCache(req)) {
 *     const freshData = await service.getStats();
 *     return sendBypassResponse(res, { success: true, data: freshData });
 * }
 *
 * @example
 * // Integration with shouldBypassCache() for dual cache-busting
 * const bypassCache = shouldBypassCache(req);
 * if (bypassCache) {
 *     const result = await getDataFromDatabase();
 *     return sendBypassResponse(res, result);
 * }
 */
function sendBypassResponse(res, payload) {
    res.setHeader("X-Cache", "BYPASS");
    res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
    res.setHeader("Pragma", "no-cache");
    res.setHeader("Expires", "0");
    return res.json(payload);
}

module.exports = {
    shouldBypassCache,
    sendBypassResponse
};
