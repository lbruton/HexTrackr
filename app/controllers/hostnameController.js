/**
 * Hostname Controller
 * HEX-350: Hostname parsing endpoints for intelligent ticket creation
 *
 * Handles HTTP requests for hostname parsing operations.
 * Delegates business logic to hostnameParserService.
 */

const hostnameParserService = require("../services/hostnameParserService");

class HostnameController {
    /**
     * Parse hostname using HostnameParserService
     * HEX-350: Exposes backend hostname parsing logic to frontend
     * Returns parsed location, site code, device type, and confidence level
     *
     * @async
     * @param {Object} req - Express request object
     * @param {Object} req.params - URL parameters
     * @param {string} req.params.hostname - Hostname to parse (e.g., "NSWAN-RT-01", "WTULSA-SW-02")
     * @param {Object} res - Express response object
     * @returns {Promise<void>} Sends JSON response with parsed data:
     *   - 200: {success: true, data: {hostname, location, site_code, device_type, parsing_method, confidence}}
     *   - 400: {success: false, error: "Hostname parameter is required"}
     *   - 500: {success: false, error: "Failed to parse hostname", details: string}
     * @throws {Error} Caught and returned as 500 response if hostnameParserService.parseHostname fails
     * @route GET /api/hostname/parse/:hostname
     * @example
     * // GET /api/hostname/parse/NSWAN-RT-01
     * // Returns: {success: true, data: {location: "NSWAN", site_code: "NSWA", confidence: 1.0, ...}}
     * @example
     * // GET /api/hostname/parse/UNKNOWN-HOST-99
     * // Returns: {success: true, data: {location: "UNKNO", site_code: "UNKN", confidence: 0.5, ...}}
     */
    static async parseHostname(req, res) {
        try {
            const { hostname } = req.params;

            if (!hostname) {
                return res.status(400).json({
                    success: false,
                    error: "Hostname parameter is required"
                });
            }

            // Call hostnameParserService.parseHostname
            const result = hostnameParserService.parseHostname(hostname);

            res.json({
                success: true,
                data: result
            });
        } catch (error) {
            if (global.logger?.error) {
                global.logger.error("backend", "hostname", "Error parsing hostname", { error: error.message, hostname: req.params.hostname });
            } else {
                console.error(`Error parsing hostname ${req.params.hostname}:`, error);
            }
            res.status(500).json({
                success: false,
                error: "Failed to parse hostname",
                details: error.message
            });
        }
    }
}

module.exports = HostnameController;
