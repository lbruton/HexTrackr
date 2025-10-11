const crypto = require("crypto");
const { normalizeXtNumber } = require("../utils/helpers");

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
 * - Ticket number generation (4-digit IDs)
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
            this.db.all("SELECT * FROM tickets WHERE deleted = 0 ORDER BY created_at DESC", (err, rows) => {
                if (err) {
                    return reject(new Error("Failed to fetch tickets: " + err.message));
                }

                // Log the structure of the first row for debugging
                if (rows.length > 0) {
                    console.log("Sample ticket row:", Object.keys(rows[0]));
                }

                // Transform the rows to ensure each ticket has an id (use xt_number if id is null)
                const transformedRows = rows.map(row => {
                    const currentXt = row.xt_number;
                    const normalizedXt = currentXt ? normalizeXtNumber(currentXt) : undefined;

                    // If id is null, use the available XT number as the id
                    if (row.id === null || row.id === undefined) {
                        row.id = normalizedXt || currentXt;
                    }

                    if (normalizedXt) {
                        if (normalizedXt !== currentXt) {
                            this.db.run(
                                "UPDATE tickets SET xt_number = ? WHERE id = ?",
                                [normalizedXt, row.id],
                                (updateErr) => {
                                    if (updateErr) {
                                        console.error("Failed to normalize xt_number for ticket", row.id, updateErr);
                                    }
                                }
                            );
                        }
                        row.xt_number = normalizedXt;
                        row.xtNumber = normalizedXt;
                    }

                    // Parse devices field if it's a JSON string
                    if (row.devices && typeof row.devices === "string") {
                        try {
                            row.devices = JSON.parse(row.devices);
                        } catch (e) {
                            console.error("Failed to parse devices JSON for ticket", row.id, e);
                            row.devices = [];
                        }
                    } else if (!row.devices) {
                        row.devices = [];
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
     * HEX-196: Added XT# uniqueness validation to prevent duplicates
     */
    async createTicket(ticket) {
        const normalizedXt = normalizeXtNumber(ticket.xt_number || ticket.xtNumber) || null;
        const payload = {
            ...ticket,
            xt_number: normalizedXt,
            xtNumber: normalizedXt
        };

        // HEX-196: Validate XT# uniqueness across ALL tickets (active + deleted)
        // This should NEVER happen if frontend calls generateNextXTNumber() correctly
        if (normalizedXt) {
            const existingTicket = await new Promise((resolve, reject) => {
                this.db.get(
                    "SELECT id, xt_number, deleted FROM tickets WHERE xt_number = ? LIMIT 1",
                    [normalizedXt],
                    (err, row) => {
                        if (err) {return reject(err);}
                        resolve(row);
                    }
                );
            });

            if (existingTicket) {
                const status = existingTicket.deleted ? "deleted" : "active";
                throw new Error(
                    `CRITICAL: XT# ${normalizedXt} already exists (${status} ticket ${existingTicket.id}). ` +
                    `This indicates frontend failed to call /api/tickets/next-xt-number correctly.`
                );
            }
        }

        return new Promise((resolve, reject) => {
            const sql = `INSERT INTO tickets (
                id, date_submitted, date_due, hexagon_ticket, service_now_ticket, location,
                devices, supervisor, tech, status, notes, attachments,
                created_at, updated_at, site, xt_number, site_id, location_id
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

            const params = [
                payload.id,
                payload.dateSubmitted,
                payload.dateDue,
                payload.hexagonTicket,
                payload.serviceNowTicket,
                payload.location,
                JSON.stringify(payload.devices),
                payload.supervisor,
                payload.tech,
                payload.status,
                payload.notes,
                JSON.stringify(payload.attachments || []),
                payload.createdAt,
                payload.updatedAt,
                payload.site,
                payload.xt_number,
                payload.site_id,
                payload.location_id
            ];

            this.db.run(sql, params, function(err) {
                if (err) {
                    return reject(new Error("Failed to save ticket: " + err.message));
                }
                resolve({ id: payload.id });
            });
        });
    }

    /**
     * Update existing ticket
     * Extracted from server.js line 3396-3422
     * Modified to support partial updates by merging with existing ticket data
     *
     * @description Uses nullish coalescing (??) for optional fields to allow clearing with empty strings.
     *              Uses logical OR (||) for required fields to prevent empty values.
     *              - ?? only falls back on null/undefined (allows "", 0, false)
     *              - || falls back on any falsy value (prevents "", 0, false)
     * @see HEX-90 for bug details about field clearing
     */
    async updateTicket(ticketId, ticket) {
        try {
            // First, get the existing ticket data
            const existingTicket = await this.getTicketById(ticketId);
            if (!existingTicket) {
                throw new Error(`Ticket with ID ${ticketId} not found`);
            }

            // Merge the updates with existing data, ensuring required fields are preserved
            const normalizedXt = normalizeXtNumber(ticket.xt_number || ticket.xtNumber || existingTicket.xt_number) || null;
            const payload = {
                // Required fields - use || to prevent empty values
                dateSubmitted: ticket.dateSubmitted || ticket.date_submitted || existingTicket.date_submitted,
                dateDue: ticket.dateDue || ticket.date_due || existingTicket.date_due,
                devices: ticket.devices || existingTicket.devices,
                attachments: ticket.attachments || existingTicket.attachments,
                updatedAt: ticket.updatedAt || ticket.updated_at || new Date().toISOString(),
                xt_number: normalizedXt,

                // Optional fields - use ?? to allow clearing with empty strings
                hexagonTicket: ticket.hexagonTicket ?? ticket.hexagon_ticket ?? existingTicket.hexagon_ticket,
                serviceNowTicket: ticket.serviceNowTicket ?? ticket.service_now_ticket ?? existingTicket.service_now_ticket,
                location: ticket.location ?? existingTicket.location,
                supervisor: ticket.supervisor ?? existingTicket.supervisor,
                tech: ticket.tech ?? existingTicket.tech,
                status: ticket.status ?? existingTicket.status,
                notes: ticket.notes ?? existingTicket.notes,
                site: ticket.site ?? existingTicket.site,
                site_id: ticket.site_id ?? existingTicket.site_id,
                location_id: ticket.location_id ?? existingTicket.location_id
            };

            return new Promise((resolve, reject) => {
                const sql = `UPDATE tickets SET
                    date_submitted = ?, date_due = ?, hexagon_ticket = ?, service_now_ticket = ?,
                    location = ?, devices = ?, supervisor = ?, tech = ?, status = ?, notes = ?,
                    attachments = ?, updated_at = ?, site = ?, xt_number = ?, site_id = ?, location_id = ?
                    WHERE id = ?`;
                const params = [
                    payload.dateSubmitted,
                    payload.dateDue,
                    payload.hexagonTicket,
                    payload.serviceNowTicket,
                    payload.location,
                    typeof payload.devices === "string" ? payload.devices : JSON.stringify(payload.devices || []),
                    payload.supervisor,
                    payload.tech,
                    payload.status,
                    payload.notes,
                    typeof payload.attachments === "string" ? payload.attachments : JSON.stringify(payload.attachments || []),
                    payload.updatedAt,
                    payload.site,
                    payload.xt_number,
                    payload.site_id,
                    payload.location_id,
                    ticketId
                ];

                this.db.run(sql, params, function(err) {
                    if (err) {
                        return reject(new Error("Failed to update ticket: " + err.message));
                    }
                    resolve({ id: ticketId });
                });
            });
        } catch (error) {
            throw new Error("Failed to update ticket: " + error.message, { cause: error });
        }
    }

    /**
     * Delete ticket by ID (soft delete - sets deleted=1, deleted_at=now)
     * Extracted from server.js line 3424-3435
     * Updated: HEX-196 - Soft delete for audit trail and XT# uniqueness
     */
    async deleteTicket(ticketId) {
        return new Promise((resolve, reject) => {
            this.db.run(
                "UPDATE tickets SET deleted = 1, deleted_at = datetime('now') WHERE id = ?",
                [ticketId],
                function(err) {
                    if (err) {
                        return reject(new Error("Failed to delete ticket: " + err.message));
                    }
                    resolve(this.changes);
                }
            );
        });
    }

    /**
     * Import tickets from CSV export format
     * Maps CSV fields to database schema
     */
    async importTicketsFromCSV(tickets, mode = "replace") {
        return new Promise(async (resolve, reject) => {
            try {
                // Clear existing tickets if replace mode
                if (mode === "replace") {
                    await new Promise((res, rej) => {
                        this.db.run("DELETE FROM tickets", (err) => {
                            if (err) {rej(err);}
                            else {res();}
                        });
                    });
                }

                let imported = 0;
                let skipped = 0;

                for (const ticket of tickets) {
                    try {
                        // Map CSV fields to camelCase for createTicket method
                        // Handle devices field - it may come as JSON string or already parsed array
                        let devicesArray = [];
                        if (ticket.devices) {
                            if (typeof ticket.devices === "string") {
                                try {
                                    devicesArray = JSON.parse(ticket.devices);
                                } catch (_e) {
                                    // Not JSON, treat as single device or empty
                                    devicesArray = ticket.devices ? [ticket.devices] : [];
                                }
                            } else if (Array.isArray(ticket.devices)) {
                                devicesArray = ticket.devices;
                            }
                        }

                        const mappedTicket = {
                            id: ticket.id || Date.now().toString() + crypto.randomBytes(6).toString("hex"),
                            dateSubmitted: ticket.date_submitted || ticket.dateSubmitted,
                            dateDue: ticket.date_due || ticket.dateDue,
                            hexagonTicket: ticket.hexagon_ticket || ticket.hexagonTicket || "",
                            serviceNowTicket: ticket.service_now_ticket || ticket.serviceNowTicket || "",
                            location: ticket.location || "",
                            devices: devicesArray, // Pass as actual array
                            supervisor: ticket.supervisor || "",
                            tech: ticket.tech || "",
                            status: ticket.status || "Open",
                            notes: ticket.notes || "",
                            xtNumber: ticket.xt_number || ticket.xtNumber || "",
                            createdAt: ticket.created_at || new Date().toISOString(),
                            updatedAt: ticket.updated_at || new Date().toISOString()
                        };

                        await this.createTicket(mappedTicket);
                        imported++;
                    } catch (err) {
                        console.error("Error importing ticket:", err);
                        skipped++;
                    }
                }

                resolve({ imported, skipped, total: tickets.length });
            } catch (error) {
                reject(error);
            }
        });
    }

    /**
     * Migrate tickets from legacy format
     * Extracted from server.js line 3437-3479
     */
    async migrateTickets(tickets) {
        return new Promise((resolve, _reject) => {
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
        const xtNumber = normalizeXtNumber(row.xt_number || row["XT Number"] || row.xtNumber) || String(index + 1).padStart(4, "0");
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
            this.db.all("SELECT * FROM tickets WHERE deleted = 0 ORDER BY created_at DESC", (err, rows) => {
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
     * Generate next ticket number for new tickets
     */
    async generateNextXTNumber() {
        return new Promise((resolve, reject) => {
            // IMPORTANT: NO deleted=0 filter here - must include ALL tickets (deleted + active)
            // to guarantee XT# uniqueness across entire database lifetime (HEX-196)
            this.db.all(
                "SELECT xt_number FROM tickets WHERE xt_number IS NOT NULL",
                (err, rows) => {
                    if (err) {
                        return reject(new Error("Failed to generate ticket number: " + err.message));
                    }

                    const numbers = (rows || [])
                        .map(r => normalizeXtNumber(r.xt_number))
                        .filter(Boolean)
                        .map(value => parseInt(value, 10))
                        .filter(num => !isNaN(num));

                    const maxNumber = numbers.length > 0 ? Math.max(...numbers) : 0;
                    const nextNumber = maxNumber + 1;

                    resolve(String(nextNumber).padStart(4, "0"));
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
            this.db.get("SELECT * FROM tickets WHERE id = ? AND deleted = 0", [ticketId], (err, row) => {
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
