/**
 * Import Controller - Vendor CSV Import Operations
 *
 * This controller handles operational imports of vendor CSV data (e.g., Tenable vulnerability scans),
 * not backup/restore operations. Those are handled by the backup controller.
 *
 * Controller logic extracted from server.js lines: 2337-2399, 2403-2531, 3482-3604, 2534-2550
 *
 * INTEGRATION NOTES FOR T053:
 * ===========================
 * - setProgressTracker() MUST be called by server.js before route registration
 * - All file upload logic uses PathValidator for security
 * - Controller delegates complex business logic to importService
 * - Progress tracking is handled via injected progressTracker instance
 * - Database operations go through DatabaseService
 */

const Papa = require("papaparse");
const crypto = require("crypto");
const importService = require("../services/importService");
const PathValidator = require("../utils/PathValidator");
const ProgressTracker = require("../utils/ProgressTracker");
const ValidationService = require("../services/validationService");
const DatabaseService = require("../services/databaseService");

// Initialize progress tracker (will be injected by server.js)
let progressTracker = null;

/**
 * Set progress tracker instance (called by server.js)
 */
function setProgressTracker(tracker) {
    progressTracker = tracker;
}

/**
 * POST /api/vulnerabilities/import
 * Standard vulnerability CSV import with enhanced lifecycle management
 * From server.js lines 2337-2399
 */
async function importVulnerabilities(req, res) {
    if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
    }

    const startTime = Date.now();

    try {
        // Extract metadata from filename and request
        const filename = req.file.originalname;
        const vendor = req.body.vendor || importService.extractVendorFromFilename(filename);
        const extractedDate = importService.extractDateFromFilename(filename);
        const scanDate = req.body.scanDate || extractedDate || new Date().toISOString().split("T")[0];

        console.log("📥 STANDARD IMPORT: Starting vulnerability CSV import");
        console.log(`📊 File: ${filename}, Vendor: ${vendor}, Scan Date: ${scanDate}`);

        // Parse CSV file
        const csvData = PathValidator.safeReadFileSync(req.file.path, "utf8");
        const results = await importService.parseCSV(csvData);
        const rows = results.data.filter(row => Object.values(row).some(val => val && val.trim()));

        console.log(`📈 Parsed ${rows.length} rows from CSV`);

        // Create import record
        const importRecord = await importService.createImportRecord({
            filename,
            vendor,
            scanDate,
            rowCount: rows.length,
            fileSize: req.file.size,
            headers: results.meta.fields
        });

        // Process vulnerabilities using enhanced lifecycle
        const result = await importService.processVulnerabilitiesWithLifecycle(
            rows,
            importRecord.importId,
            req.file.path,
            scanDate
        );

        // Clean up uploaded file
        try {
            if (PathValidator.safeExistsSync(req.file.path)) {
                PathValidator.safeUnlinkSync(req.file.path);
            }
        } catch (cleanupError) {
            console.warn("File cleanup warning:", cleanupError.message);
        }

        res.json({
            success: true,
            importId: importRecord.importId,
            filename,
            vendor,
            scanDate,
            ...result
        });

    } catch (error) {
        console.error("Vulnerability import failed:", error);

        // Clean up file on error
        try {
            if (req.file && PathValidator.safeExistsSync(req.file.path)) {
                PathValidator.safeUnlinkSync(req.file.path);
            }
        } catch (cleanupError) {
            console.warn("File cleanup error:", cleanupError.message);
        }

        res.status(500).json({
            success: false,
            error: "Import failed",
            details: error.message
        });
    }
}

/**
 * POST /api/vulnerabilities/import-staging
 * High-performance vulnerability import using staging table for batch processing
 * From server.js lines 2403-2531
 */
async function importVulnerabilitiesStaging(req, res) {
    if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
    }

    const startTime = Date.now();

    try {
        // Extract metadata
        const filename = req.file.originalname;
        const vendor = req.body.vendor || importService.extractVendorFromFilename(filename);
        const extractedDate = importService.extractDateFromFilename(filename);
        const scanDate = req.body.scanDate || extractedDate || new Date().toISOString().split("T")[0];

        // Use frontend sessionId or create new one
        const frontendSessionId = req.body.sessionId;
        const sessionId = frontendSessionId ?
            progressTracker.createSessionWithId(frontendSessionId, {
                operation: "csv-import",
                filename: filename,
                vendor: vendor,
                scanDate: scanDate,
                totalSteps: 3, // 1. Parse CSV, 2. Load to staging, 3. Process to final tables
                currentStep: 0
            }) :
            progressTracker.createSession({
                operation: "csv-import",
                filename: filename,
                vendor: vendor,
                scanDate: scanDate,
                totalSteps: 3,
                currentStep: 0
            });

        console.log("🚀 STAGING IMPORT: Starting high-performance CSV import");
        console.log(`📊 File: ${filename}, Vendor: ${vendor}, Scan Date: ${scanDate}`);
        console.log(`🔄 Progress Session: ${sessionId}`);

        // Immediately return session ID to client
        res.json({
            success: true,
            sessionId: sessionId,
            message: "CSV import started",
            filename: filename,
            vendor: vendor,
            scanDate: scanDate
        });

        // Continue processing asynchronously
        await importService.processStagingImport({
            filePath: req.file.path,
            filename,
            vendor,
            scanDate,
            sessionId,
            startTime,
            progressTracker
        });

    } catch (error) {
        console.error("Staging import failed:", error);

        if (progressTracker && req.body.sessionId) {
            progressTracker.errorSession(req.body.sessionId, "Import failed: " + error.message, { error });
        }

        // If response hasn't been sent yet
        if (!res.headersSent) {
            res.status(500).json({
                success: false,
                error: "Import failed",
                details: error.message
            });
        }
    }
}

/**
 * POST /api/import/vulnerabilities
 * JSON-based vulnerability import for frontend data upload
 * From server.js lines 3501-3604
 */
async function importVulnerabilitiesJSON(req, res) {
    const csvData = req.body.data || [];

    if (!Array.isArray(csvData) || csvData.length === 0) {
        return res.status(400).json({ error: "No data provided" });
    }

    try {
        const result = await importService.processVulnerabilitiesJSON(csvData);

        res.json({
            success: true,
            imported: result.imported,
            total: csvData.length,
            importId: result.importId,
            errors: result.errors.length > 0 ? result.errors : undefined
        });

    } catch (error) {
        console.error("JSON vulnerability import failed:", error);
        res.status(500).json({
            success: false,
            error: "Import failed",
            details: error.message
        });
    }
}

/**
 * POST /api/import/tickets
 * JSON-based ticket import for frontend data upload
 * From server.js lines 3482-3499
 */
async function importTicketsJSON(req, res) {
    const csvData = req.body.data || [];

    if (!Array.isArray(csvData) || csvData.length === 0) {
        return res.status(400).json({ error: "No data provided" });
    }

    try {
        const result = await importService.processTicketsJSON(csvData);

        res.json({
            success: true,
            imported: result.imported,
            total: csvData.length,
            errors: result.errors.length > 0 ? result.errors : undefined
        });

    } catch (error) {
        console.error("JSON ticket import failed:", error);
        res.status(500).json({
            success: false,
            error: "Import failed",
            details: error.message
        });
    }
}

/**
 * GET /api/imports
 * Get import history with vulnerability counts
 * From server.js lines 2534-2550
 */
async function getImportHistory(req, res) {
    try {
        const imports = await importService.getImportHistory();
        res.json({
            success: true,
            data: imports
        });
    } catch (error) {
        console.error("Error fetching import history:", error);
        res.status(500).json({
            success: false,
            error: "Failed to fetch import history",
            details: error.message
        });
    }
}

/**
 * GET /api/import/progress/:sessionId
 * Check import progress for a specific session
 * Progress tracking via WebSocket (ProgressTracker class)
 */
async function checkImportProgress(req, res) {
    const sessionId = req.params.sessionId;

    if (!sessionId) {
        return res.status(400).json({
            success: false,
            error: "Session ID required"
        });
    }

    try {
        const session = progressTracker.getSession(sessionId);

        if (!session) {
            return res.status(404).json({
                success: false,
                error: "Session not found"
            });
        }

        res.json({
            success: true,
            sessionId: sessionId,
            progress: session.progress,
            status: session.status,
            message: session.metadata.message,
            metadata: session.metadata
        });

    } catch (error) {
        console.error("Error checking import progress:", error);
        res.status(500).json({
            success: false,
            error: "Failed to check progress",
            details: error.message
        });
    }
}

module.exports = {
    setProgressTracker,
    importVulnerabilities,
    importVulnerabilitiesStaging,
    importVulnerabilitiesJSON,
    importTicketsJSON,
    getImportHistory,
    checkImportProgress
};