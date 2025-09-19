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

            const result = await controller.ticketService.updateTicket(ticketId, ticket);
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
}

module.exports = TicketController;