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
     * @description Initialize controller with database connection. Called from server.js during setup.
     * @param {Object} database - SQLite database connection instance
     * @returns {TicketController} The initialized controller instance
     * @throws {Error} If database connection is invalid
     * @example
     * // In server.js after database initialization
     * const ticketController = TicketController.initialize(db);
     */
    static initialize(database) {
        if (!TicketController.instance) {
            TicketController.instance = new TicketController();
        }
        TicketController.instance.ticketService.initialize(database);
        return TicketController.instance;
    }

    /**
     * @description Get singleton instance of TicketController for use in routes
     * @returns {TicketController} The singleton controller instance
     * @throws {Error} If controller not initialized via initialize() method
     * @example
     * // In route handlers
     * const controller = TicketController.getInstance();
     */
    static getInstance() {
        if (!TicketController.instance) {
            throw new Error("TicketController not initialized. Call initialize() first.");
        }
        return TicketController.instance;
    }

    /**
     * @description Get all tickets from the database
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     * @returns {Promise<void>} Sends JSON response with array of tickets
     * @throws {Error} Database query errors
     * @example
     * // GET /api/tickets
     * // Response: [{ id: 1, ticketNumber: "TCK-001", title: "Issue", ... }]
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
     * @description Create a new ticket in the database
     * @param {Object} req - Express request object
     * @param {Object} req.body - Ticket data object
     * @param {string} req.body.ticketNumber - Unique ticket number
     * @param {string} req.body.title - Ticket title
     * @param {string} req.body.description - Ticket description
     * @param {string} req.body.priority - Ticket priority (low/medium/high)
     * @param {Object} res - Express response object
     * @returns {Promise<void>} Sends JSON response with success status and new ticket ID
     * @throws {Error} Validation or database insertion errors
     * @example
     * // POST /api/tickets
     * // Body: { ticketNumber: "TCK-001", title: "New Issue", ... }
     * // Response: { success: true, id: 123, message: "Ticket saved successfully" }
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
     * @description Update an existing ticket by ID
     * @param {Object} req - Express request object
     * @param {Object} req.params - Route parameters
     * @param {string} req.params.id - Ticket ID to update
     * @param {Object} req.body - Updated ticket data
     * @param {Object} res - Express response object
     * @returns {Promise<void>} Sends JSON response with success status
     * @throws {Error} Ticket not found or database update errors
     * @example
     * // PUT /api/tickets/123
     * // Body: { title: "Updated Title", status: "resolved" }
     * // Response: { success: true, message: "Ticket updated successfully" }
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
     * @description Delete a ticket by ID
     * @param {Object} req - Express request object
     * @param {Object} req.params - Route parameters
     * @param {string} req.params.id - Ticket ID to delete
     * @param {Object} res - Express response object
     * @returns {Promise<void>} Sends JSON response with deletion count
     * @throws {Error} Ticket not found or database deletion errors
     * @example
     * // DELETE /api/tickets/123
     * // Response: { success: true, deleted: 1 }
     */
    static async deleteTicket(req, res) {
        try {
            const controller = TicketController.getInstance();
            const ticketId = req.params.id;

            const deletedCount = await controller.ticketService.deleteTicket(ticketId);
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
     * @description Migrate tickets from legacy import format
     * @param {Object} req - Express request object
     * @param {Object} req.body - Request body
     * @param {Array<Object>} req.body.tickets - Array of ticket objects to migrate
     * @param {Object} res - Express response object
     * @returns {Promise<void>} Sends JSON response with migration results
     * @throws {Error} Migration or database insertion errors
     * @example
     * // POST /api/tickets/migrate
     * // Body: { tickets: [{ id: 'legacy-1', ... }] }
     * // Response: { success: true, message: "Migration completed: 1 tickets migrated, 0 errors" }
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
     * @description Import tickets from CSV data structure
     * @param {Object} req - Express request object
     * @param {Object} req.body - Request body
     * @param {Array<Object>} req.body.data - Array of objects representing ticket data from CSV
     * @param {Object} res - Express response object
     * @returns {Promise<void>} Sends JSON response with import results
     * @throws {Error} Import process or validation errors
     * @example
     * // POST /api/tickets/import
     * // Body: { data: [{ "XT Number": "XT001", ... }] }
     * // Response: { success: true, imported: 1, total: 1, errors: undefined }
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
     * @description Export all tickets to JSON format for backup
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     * @returns {Promise<void>} Sends JSON response containing exported ticket data
     * @throws {Error} Database query or export errors
     * @example
     * // GET /api/tickets/export
     * // Response: { type: "tickets", count: 5, data: [...], exported_at: "2024-01-01T00:00:00.000Z" }
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
}

module.exports = TicketController;