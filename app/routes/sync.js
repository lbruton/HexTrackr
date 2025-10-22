/**
 * Sync Status Routes (HEX-279)
 * Unified endpoint for checking all sync service statuses and countdown timers
 */

const express = require("express");
const { requireAuth } = require("../middleware/auth");

function createSyncRouter(db, preferencesService) {
    const router = express.Router();

    // Initialize services
    const CiscoAdvisoryService = require("../services/ciscoAdvisoryService");
    const PaloAltoService = require("../services/paloAltoService");
    const KEVService = require("../services/kevService");

    const ciscoService = new CiscoAdvisoryService(db, preferencesService);
    const paloService = new PaloAltoService(db, preferencesService);
    const kevService = new KEVService(db);

    /**
     * GET /api/sync/status
     * @description Get unified status for all three sync services
     * @returns {Object} Status object with cisco, palo, and kev properties
     */
    router.get("/status", requireAuth, async (req, res) => {
        try {
            // Fetch all three service statuses in parallel
            const [ciscoStatus, paloStatus, kevStatus] = await Promise.all([
                ciscoService.getSyncStatus(),
                paloService.getSyncStatus(),
                kevService.getSyncStatus()
            ]);

            res.json({
                cisco: {
                    lastSync: ciscoStatus.lastSync,
                    nextSync: ciscoStatus.nextSync,
                    syncInProgress: ciscoStatus.syncInProgress,
                    stats: {
                        totalCves: ciscoStatus.totalCiscoCves,
                        synced: ciscoStatus.totalAdvisories,
                        matched: ciscoStatus.matchedCount,
                        noFix: ciscoStatus.noFixAvailable,
                        unsynced: ciscoStatus.unsyncedCount
                    }
                },
                palo: {
                    lastSync: paloStatus.lastSync,
                    nextSync: paloStatus.nextSync,
                    syncInProgress: paloStatus.syncInProgress,
                    stats: {
                        totalCves: paloStatus.totalPaloCves,
                        synced: paloStatus.totalAdvisories,
                        matched: paloStatus.matchedCount,
                        noFix: paloStatus.noFixAvailable,
                        unsynced: paloStatus.unsyncedCount
                    }
                },
                kev: {
                    lastSync: kevStatus.lastSync,
                    nextSync: kevStatus.nextSync,
                    syncInProgress: kevStatus.syncInProgress,
                    stats: {
                        total: kevStatus.totalKevs,
                        matched: kevStatus.matchedCount,
                        version: kevStatus.catalogVersion
                    }
                }
            });
        } catch (error) {
            console.error("Failed to get sync status:", error);
            res.status(500).json({
                error: "Failed to get sync status",
                message: error.message
            });
        }
    });

    return router;
}

module.exports = createSyncRouter;
