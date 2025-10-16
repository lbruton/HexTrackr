/**
 * Ticket Routes
 * Extracted from server.js lines: 3320-3344, 3369-3394, 3396-3422, 3424-3435, 3437-3479, 3482-3498, 3606-3621
 *
 * Routes:
 * - GET /api/tickets - List all tickets (line 3320)
 * - POST /api/tickets - Create new ticket (line 3369)
 * - PUT /api/tickets/:id - Update ticket (line 3396)
 * - DELETE /api/tickets/:id - Delete ticket (line 3424)
 * - POST /api/tickets/migrate - Migrate tickets (line 3437)
 * - POST /api/import/tickets - Import tickets from CSV (line 3482) - NOTE: This route needs special handling in T053
 * - GET /api/backup/tickets - Export tickets (line 3606) - NOTE: This conflicts with backup routes in T053
 */

const express = require("express");
const TicketController = require("../controllers/ticketController");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

// Core CRUD operations
router.get("/", requireAuth, TicketController.getAllTickets);
router.post("/", requireAuth, TicketController.createTicket);
router.put("/:id", requireAuth, TicketController.updateTicket);
router.delete("/:id", requireAuth, TicketController.deleteTicket);

// Special operations
router.post("/migrate", requireAuth, TicketController.migrateTickets);
router.get("/next-xt-number", requireAuth, TicketController.getNextXTNumber);
router.get("/by-device/:hostname", requireAuth, TicketController.getTicketsByDevice);
router.post("/batch-device-lookup", requireAuth, TicketController.getTicketsByDeviceBatch);
router.get("/address-suggestions", requireAuth, TicketController.getAddressSuggestions);

/**
 * T053 INTEGRATION NOTES:
 *
 * 1. Import route conflict: The original route is POST /api/import/tickets
 *    This should be handled in a separate import router, not tickets router
 *
 * 2. Backup route conflict: GET /api/backup/tickets already exists in backup routes
 *    The backup routes should be used instead of duplicating here
 *
 * 3. In server.js, add these lines after database connection:
 *    const TicketController = require("./app/controllers/TicketController");
 *    TicketController.initialize(db);
 *
 * 4. In server.js, add this route registration:
 *    const ticketRoutes = require("./app/routes/tickets");
 *    app.use("/api/tickets", ticketRoutes);
 *
 * 5. Remove these lines from server.js:
 *    - Lines 3320-3344 (GET /api/tickets)
 *    - Lines 3369-3394 (POST /api/tickets)
 *    - Lines 3396-3422 (PUT /api/tickets/:id)
 *    - Lines 3424-3435 (DELETE /api/tickets/:id)
 *    - Lines 3437-3479 (POST /api/tickets/migrate)
 *
 * 6. Keep these lines in server.js (they need special integration):
 *    - Lines 3482-3498 (POST /api/import/tickets) - part of import system
 *    - Lines 3606-3621 (GET /api/backup/tickets) - already handled by backup routes
 */

module.exports = router;