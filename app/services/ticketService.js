/**
 * TicketService - Ticket business logic and database operations
 * Extracted from server.js lines: 3320-3344, 3369-3394, 3396-3422, 3424-3435, 3437-3479, 3482-3498, 1802-1874, 3606-3621
 *
 * Handles:
 * - CRUD operations for tickets table
 * - Device management (JSON field handling)
 * - CSV import processing with mapping
 * - Migration operations
 * - Export functionality
 * - Ticket number generation (XT numbers)
 *
 * T053 INTEGRATION NOTES:
 * This service requires database initialization before use.
 * In server.js, after database connection, call:
 * ticketController.initialize(db);
 */

class TicketService {
    constructor() {
        this.db = null;
    }

    /**
     * Initialize service with database connection
     * @param {sqlite3.Database} database - Database connection from server.js
     */
    initialize(database) {
        this.db = database;
    }

    /**
     * Get all tickets with ID normalization
     * Extracted from server.js line 3320-3344
     */
    async getAllTickets() {
        return new Promise((resolve, reject) => {
            this.db.all("SELECT * FROM tickets ORDER BY created_at DESC", (err, rows) => {
                if (err) {
                    return reject(new Error("Failed to fetch tickets: " + err.message));
                }

                // Log the structure of the first row for debugging
                if (rows.length > 0) {
                    console.log("Sample ticket row:", Object.keys(rows[0]));
                }

                // Transform the rows to ensure each ticket has an id (use xt_number if id is null)
                const transformedRows = rows.map(row => {
                    // If id is null, use xt_number as the id
                    if (row.id === null || row.id === undefined) {
                        row.id = row.xt_number;
                    }
                    return row;
                });

                resolve(transformedRows);
            });
        });
    }

    /**
     * Create new ticket
     * Extracted from server.js line 3369-3394
     */
    async createTicket(ticket) {
        return new Promise((resolve, reject) => {
            const sql = `INSERT INTO tickets (
                id, date_submitted, date_due, hexagon_ticket, service_now_ticket, location,
                devices, supervisor, tech, status, notes, attachments,
                created_at, updated_at, site, xt_number, site_id, location_id
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

            const params = [
                ticket.id,
                ticket.dateSubmitted,
                ticket.dateDue,
                ticket.hexagonTicket,
                ticket.serviceNowTicket,
                ticket.location,
                JSON.stringify(ticket.devices),
                ticket.supervisor,
                ticket.tech,
                ticket.status,
                ticket.notes,
                JSON.stringify(ticket.attachments || []),
                ticket.createdAt,
                ticket.updatedAt,
                ticket.site,
                ticket.xt_number,
                ticket.site_id,
                ticket.location_id
            ];

            this.db.run(sql, params, function(err) {
                if (err) {
                    return reject(new Error("Failed to save ticket: " + err.message));
                }
                resolve({ id: ticket.id });
            });
        });
    }

    /**
     * Update existing ticket
     * Extracted from server.js line 3396-3422
     */
    async updateTicket(ticketId, ticket) {
        return new Promise((resolve, reject) => {
            const sql = `UPDATE tickets SET
                date_submitted = ?, date_due = ?, hexagon_ticket = ?, service_now_ticket = ?,
                location = ?, devices = ?, supervisor = ?, tech = ?, status = ?, notes = ?,
                attachments = ?, updated_at = ?, site = ?, xt_number = ?, site_id = ?, location_id = ?
                WHERE id = ?`;

            const params = [
                ticket.dateSubmitted,
                ticket.dateDue,
                ticket.hexagonTicket,
                ticket.serviceNowTicket,
                ticket.location,
                JSON.stringify(ticket.devices),
                ticket.supervisor,
                ticket.tech,
                ticket.status,
                ticket.notes,
                JSON.stringify(ticket.attachments || []),
                ticket.updatedAt,
                ticket.site,
                ticket.xt_number,
                ticket.site_id,
                ticket.location_id,
                ticketId
            ];

            this.db.run(sql, params, function(err) {
                if (err) {
                    return reject(new Error("Failed to update ticket: " + err.message));
                }
                resolve({ id: ticketId });
            });
        });
    }

    /**
     * Delete ticket by ID
     * Extracted from server.js line 3424-3435
     */
    async deleteTicket(ticketId) {
        return new Promise((resolve, reject) => {
            this.db.run("DELETE FROM tickets WHERE id = ?", [ticketId], function(err) {
                if (err) {
                    return reject(new Error("Failed to delete ticket: " + err.message));
                }
                resolve(this.changes);
            });
        });
    }

    /**
     * Migrate tickets from legacy format
     * Extracted from server.js line 3437-3479
     */
    async migrateTickets(tickets) {
        return new Promise((resolve, reject) => {
            const sql = `INSERT OR REPLACE INTO tickets (
                id, start_date, end_date, primary_number, incident_number, site_code,
                affected_devices, assignee, notes, status, priority, linked_cves,
                created_at, updated_at, display_site_code, ticket_number, site_id, location_id
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

            let successCount = 0;
            let errorCount = 0;

            tickets.forEach(ticket => {
                const params = [
                    ticket.id,
                    ticket.start_date,
                    ticket.end_date,
                    ticket.primary_number,
                    ticket.incident_number,
                    ticket.site_code,
                    JSON.stringify(ticket.affected_devices || []),
                    ticket.assignee,
                    ticket.notes,
                    ticket.status,
                    ticket.priority,
                    JSON.stringify(ticket.linked_cves || []),
                    ticket.created_at,
                    ticket.updated_at,
                    ticket.display_site_code,
                    ticket.ticket_number,
                    ticket.site_id,
                    ticket.location_id
                ];

                this.db.run(sql, params, function(err) {
                    if (err) {
                        console.error("Error migrating ticket:", err);
                        errorCount++;
                    } else {
                        successCount++;
                    }
                });
            });

            // Give the database operations time to complete
            setTimeout(() => {
                resolve({ successCount, errorCount });
            }, 1000);
        });
    }

    /**
     * Import tickets from CSV data
     * Extracted from server.js line 3482-3498 + processTicketRows (1825-1874) + mapTicketRow (1802-1823)
     */
    async importTickets(csvData) {
        return new Promise((resolve, reject) => {
            // Prepare insert statement with UPSERT (INSERT OR REPLACE)
            const stmt = this.db.prepare(`
                INSERT OR REPLACE INTO tickets (
                    id, xt_number, date_submitted, date_due, hexagon_ticket,
                    service_now_ticket, location, devices, supervisor, tech,
                    status, notes, created_at, updated_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `);

            let imported = 0;
            const errors = [];

            csvData.forEach((row, index) => {
                try {
                    const mapped = this._mapTicketRow(row, index);

                    stmt.run([
                        mapped.id,
                        mapped.xtNumber,
                        mapped.dateSubmitted,
                        mapped.dateDue,
                        mapped.hexagonTicket,
                        mapped.serviceNowTicket,
                        mapped.location,
                        mapped.devices,
                        mapped.supervisor,
                        mapped.tech,
                        mapped.status,
                        mapped.notes,
                        mapped.createdAt,
                        mapped.updatedAt
                    ], (err) => {
                        if (err) {
                            console.error(`Error importing ticket row ${index + 1}:`, err);
                            errors.push(`Row ${index + 1}: ${err.message}`);
                        } else {
                            imported++;
                        }
                    });
                } catch (error) {
                    errors.push(`Row ${index + 1}: ${error.message}`);
                }
            });

            stmt.finalize((err) => {
                if (err) {
                    return reject(new Error("Import failed: " + err.message));
                }

                resolve({
                    imported: imported,
                    errors: errors
                });
            });
        });
    }

    /**
     * Map CSV row to ticket object
     * Extracted from server.js line 1802-1823
     */
    _mapTicketRow(row, index) {
        const now = new Date().toISOString();
        const xtNumber = row.xt_number || row["XT Number"] || `XT${String(index + 1).padStart(3, "0")}`;
        const ticketId = row.id || `ticket_${Date.now()}_${index}`;

        return {
            id: ticketId,
            xtNumber,
            dateSubmitted: row.date_submitted || row["Date Submitted"] || "",
            dateDue: row.date_due || row["Date Due"] || "",
            hexagonTicket: row.hexagon_ticket || row["Hexagon Ticket"] || "",
            serviceNowTicket: row.service_now_ticket || row["ServiceNow Ticket"] || "",
            location: row.location || row["Location"] || "",
            devices: row.devices || row["Devices"] || "",
            supervisor: row.supervisor || row["Supervisor"] || "",
            tech: row.tech || row["Tech"] || "",
            status: row.status || row["Status"] || "Open",
            notes: row.notes || row["Notes"] || "",
            createdAt: row.created_at || now,
            updatedAt: now
        };
    }

    /**
     * Export tickets for backup
     * Extracted from server.js line 3606-3621
     */
    async exportTickets() {
        return new Promise((resolve, reject) => {
            this.db.all("SELECT * FROM tickets ORDER BY created_at DESC", (err, rows) => {
                if (err) {
                    return reject(new Error("Failed to fetch tickets for backup: " + err.message));
                }

                resolve({
                    type: "tickets",
                    count: rows.length,
                    data: rows,
                    exported_at: new Date().toISOString()
                });
            });
        });
    }

    /**
     * Generate next XT number for new tickets
     */
    async generateNextXTNumber() {
        return new Promise((resolve, reject) => {
            this.db.get(
                "SELECT xt_number FROM tickets WHERE xt_number LIKE 'XT%' ORDER BY xt_number DESC LIMIT 1",
                (err, row) => {
                    if (err) {
                        return reject(new Error("Failed to generate XT number: " + err.message));
                    }

                    let nextNumber = 1;
                    if (row && row.xt_number) {
                        const currentNum = parseInt(row.xt_number.replace("XT", ""));
                        nextNumber = isNaN(currentNum) ? 1 : currentNum + 1;
                    }

                    resolve(`XT${String(nextNumber).padStart(3, "0")}`);
                }
            );
        });
    }

    /**
     * Update devices for a specific ticket
     * Helper method for device management
     */
    async updateTicketDevices(ticketId, devices) {
        return new Promise((resolve, reject) => {
            const sql = "UPDATE tickets SET devices = ?, updated_at = ? WHERE id = ?";
            const params = [JSON.stringify(devices), new Date().toISOString(), ticketId];

            this.db.run(sql, params, function(err) {
                if (err) {
                    return reject(new Error("Failed to update ticket devices: " + err.message));
                }
                resolve({ updated: this.changes });
            });
        });
    }

    /**
     * Get ticket by ID
     * Helper method for single ticket retrieval
     */
    async getTicketById(ticketId) {
        return new Promise((resolve, reject) => {
            this.db.get("SELECT * FROM tickets WHERE id = ?", [ticketId], (err, row) => {
                if (err) {
                    return reject(new Error("Failed to fetch ticket: " + err.message));
                }

                if (!row) {
                    return reject(new Error("Ticket not found"));
                }

                resolve(row);
            });
        });
    }
}

module.exports = TicketService;