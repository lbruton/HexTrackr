/**
 * Ticket Controller
 * Extracted from server.js lines: 3320-3344, 3369-3394, 3396-3422, 3424-3435, 3437-3479, 3482-3498, 3606-3621
 *
 * Handles HTTP requests for ticket operations.
 * Delegates business logic to ticketService.
 *
 * T053 INTEGRATION CHECKLIST:
 * 1. Import this controller in server.js: const ticketController = require("./app/controllers/ticketController");
 * 2. Initialize after database connection: ticketController.initialize(db);
 * 3. Register routes: app.use("/api/tickets", require("./app/routes/tickets"));
 * 4. Remove duplicate routes from server.js (see routes file for line numbers)
 * 5. Handle import/backup route conflicts as noted in routes file
 */

const TicketService = require("../services/ticketService");

class TicketController {
    constructor() {
        this.ticketService = new TicketService();
    }

    /**
     * Initialize controller with database connection
     * Called from server.js during setup
     */
    static initialize(database) {
        if (!TicketController.instance) {
            TicketController.instance = new TicketController();
        }
        TicketController.instance.ticketService.initialize(database);
        return TicketController.instance;
    }

    /**
     * Get singleton instance (for use in routes)
     */
    static getInstance() {
        if (!TicketController.instance) {
            throw new Error("TicketController not initialized. Call initialize() first.");
        }
        return TicketController.instance;
    }

    /**
     * Get all tickets
     * Extracted from server.js line 3320-3344
     */
    static async getAllTickets(req, res) {
        try {
            const controller = TicketController.getInstance();
            const tickets = await controller.ticketService.getAllTickets();
            res.json(tickets);
        } catch (error) {
            console.error("Error fetching tickets:", error);
            res.status(500).json({
                success: false,
                error: "Failed to fetch tickets",
                details: error.message
            });
        }
    }

    /**
     * Create new ticket
     * Extracted from server.js line 3369-3394
     */
    static async createTicket(req, res) {
        try {
            const controller = TicketController.getInstance();
            const ticket = req.body;

            const result = await controller.ticketService.createTicket(ticket);
            res.json({
                success: true,
                id: result.id,
                message: "Ticket saved successfully"
            });
        } catch (error) {
            console.error("Error saving ticket:", error);
            res.status(500).json({
                success: false,
                error: "Failed to save ticket",
                details: error.message
            });
        }
    }

    /**
     * Update existing ticket
     * Extracted from server.js line 3396-3422
     */
    static async updateTicket(req, res) {
        try {
            const controller = TicketController.getInstance();
            const ticketId = req.params.id;
            const ticket = req.body;

            const _result = await controller.ticketService.updateTicket(ticketId, ticket);
            res.json({
                success: true,
                id: ticketId,
                message: "Ticket updated successfully"
            });
        } catch (error) {
            console.error("Error updating ticket:", error);
            res.status(500).json({
                success: false,
                error: "Failed to update ticket",
                details: error.message
            });
        }
    }

    /**
     * Delete ticket
     * Extracted from server.js line 3424-3435
     */
    static async deleteTicket(req, res) {
        try {
            const controller = TicketController.getInstance();
            const ticketId = req.params.id;
            const { deletion_reason } = req.body; // Accept reason from request body
            const deletedBy = req.user?.username || "system"; // From auth session

            const deletedCount = await controller.ticketService.deleteTicket(
                ticketId,
                deletion_reason,
                deletedBy
            );

            res.json({
                success: true,
                deleted: deletedCount
            });
        } catch (error) {
            console.error("Error deleting ticket:", error);
            res.status(500).json({
                success: false,
                error: "Failed to delete ticket",
                details: error.message
            });
        }
    }

    /**
     * Migrate tickets (legacy import format)
     * Extracted from server.js line 3437-3479
     */
    static async migrateTickets(req, res) {
        try {
            const controller = TicketController.getInstance();
            const tickets = req.body.tickets || [];

            if (!Array.isArray(tickets) || tickets.length === 0) {
                return res.json({ success: true, message: "No tickets to migrate" });
            }

            const result = await controller.ticketService.migrateTickets(tickets);
            res.json({
                success: true,
                message: `Migration completed: ${result.successCount} tickets migrated, ${result.errorCount} errors`
            });
        } catch (error) {
            console.error("Error migrating tickets:", error);
            res.status(500).json({
                success: false,
                error: "Failed to migrate tickets",
                details: error.message
            });
        }
    }

    /**
     * Import tickets from CSV data
     * Extracted from server.js line 3482-3498 + processTicketRows function
     */
    static async importTickets(req, res) {
        try {
            const controller = TicketController.getInstance();
            const csvData = req.body.data || [];

            if (!Array.isArray(csvData) || csvData.length === 0) {
                return res.status(400).json({
                    success: false,
                    error: "No data provided"
                });
            }

            const result = await controller.ticketService.importTickets(csvData);
            res.json({
                success: true,
                imported: result.imported,
                total: csvData.length,
                errors: result.errors.length > 0 ? result.errors : undefined
            });
        } catch (error) {
            console.error("Error importing tickets:", error);
            res.status(500).json({
                success: false,
                error: "Import failed",
                details: error.message
            });
        }
    }

    /**
     * Export tickets for backup
     * Extracted from server.js line 3606-3621
     */
    static async exportTickets(req, res) {
        try {
            const controller = TicketController.getInstance();
            const exportData = await controller.ticketService.exportTickets();
            res.json(exportData);
        } catch (error) {
            console.error("Error exporting tickets for backup:", error);
            res.status(500).json({
                success: false,
                error: "Failed to fetch tickets",
                details: error.message
            });
        }
    }

    /**
     * Generate next XT# for new tickets
     * HEX-196: Soft delete implementation requires backend XT# generation
     * Includes deleted tickets to prevent number reuse
     */
    static async getNextXTNumber(req, res) {
        try {
            const controller = TicketController.getInstance();
            const nextXtNumber = await controller.ticketService.generateNextXTNumber();
            res.json({
                success: true,
                nextXtNumber: nextXtNumber
            });
        } catch (error) {
            console.error("Error generating next XT#:", error);
            res.status(500).json({
                success: false,
                error: "Failed to generate next XT#",
                details: error.message
            });
        }
    }

    /**
     * Get all tickets containing a specific device hostname
     * HEX-203: Bidirectional device-to-ticket navigation
     * Enables vulnerability cards to link to existing tickets
     * @param {string} req.params.hostname - Device hostname or IP address
     * @returns {Array} List of tickets containing the device (excludes completed/cancelled)
     */
    static async getTicketsByDevice(req, res) {
        try {
            const controller = TicketController.getInstance();
            const { hostname } = req.params;

            if (!hostname) {
                return res.status(400).json({
                    success: false,
                    error: "Hostname parameter is required"
                });
            }

            const tickets = await controller.ticketService.getTicketsByDevice(hostname);
            res.json({
                success: true,
                count: tickets.length,
                tickets: tickets
            });
        } catch (error) {
            console.error(`Error fetching tickets for device ${req.params.hostname}:`, error);
            res.status(500).json({
                success: false,
                error: "Failed to fetch tickets for device",
                details: error.message
            });
        }
    }

    /**
     * Get ticket summary for multiple devices in a single request (batch lookup)
     * HEX-216: Performance optimization to replace N+1 HTTP requests
     * Reduces 100+ individual requests to a single batch query
     * @param {Array<string>} req.body.hostnames - Array of device hostnames
     * @returns {Object} Map of hostname to ticket summary {count, status, jobType}
     */
    static async getTicketsByDeviceBatch(req, res) {
        try {
            const controller = TicketController.getInstance();
            const { hostnames } = req.body;

            if (!hostnames || !Array.isArray(hostnames)) {
                return res.status(400).json({
                    success: false,
                    error: "hostnames array is required in request body"
                });
            }

            if (hostnames.length === 0) {
                return res.json({
                    success: true,
                    data: {}
                });
            }

            const ticketMap = await controller.ticketService.getTicketsByDeviceBatch(hostnames);
            res.json({
                success: true,
                data: ticketMap
            });
        } catch (error) {
            console.error("Error fetching tickets for device batch:", error);
            res.status(500).json({
                success: false,
                error: "Failed to fetch tickets for device batch",
                details: error.message
            });
        }
    }

    /**
     * Get address suggestions for autofill based on site and location
     * Returns most recent addresses (shipping and return) from matching tickets
     * Used by ticket creation form to auto-populate shipping/return address fields
     *
     * @async
     * @param {Object} req - Express request object
     * @param {Object} req.query - Query parameters
     * @param {string} req.query.site - Site identifier (e.g., "LAX", "DFW")
     * @param {string} req.query.location - Location within site (e.g., "Building A", "Floor 3")
     * @param {Object} res - Express response object
     * @returns {Promise<void>} Sends JSON response with address suggestions:
     *   - 200: {success: true, data: {shippingAddress: string, returnAddress: string}}
     *   - 400: {success: false, error: "site and location query parameters are required"}
     *   - 500: {success: false, error: "Failed to fetch address suggestions", details: string}
     * @throws {Error} Caught and returned as 500 response if TicketService.getAddressesBySiteLocation fails
     * @route GET /api/tickets/address-suggestions
     * @example
     * // GET /api/tickets/address-suggestions?site=LAX&location=Building%20A
     * // Returns: {success: true, data: {shippingAddress: "...", returnAddress: "..."}}
     */
    static async getAddressSuggestions(req, res) {
        try {
            const controller = TicketController.getInstance();
            const { site, location } = req.query;

            if (!site || !location) {
                return res.status(400).json({
                    success: false,
                    error: "site and location query parameters are required"
                });
            }

            const addresses = await controller.ticketService.getAddressesBySiteLocation(site, location);
            res.json({
                success: true,
                data: addresses
            });
        } catch (error) {
            console.error("Error fetching address suggestions:", error);
            res.status(500).json({
                success: false,
                error: "Failed to fetch address suggestions",
                details: error.message
            });
        }
    }
}

module.exports = TicketController;