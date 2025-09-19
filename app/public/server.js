/**
 * HexTrackr Express Server - Fixed Modular backend application server
 * Refactored from monolithic 3,800-line server.js to use extracted modules
 * Handles API endpoints, vulnerability data management, file uploads, and serves the frontend
 */
/* eslint-env node */
/* global __dirname, require, console, process */

// Core dependencies
const express = require("express");
const path = require("path");
const cors = require("cors");
const compression = require("compression");
const rateLimit = require("express-rate-limit");
const multer = require("multer");
const http = require("http");
const socketIo = require("socket.io");
const sqlite3 = require("sqlite3").verbose();
const fs = require("fs");

// Configuration modules
const { config: dbConfig } = require("../config/database");
const middlewareConfig = require("../config/middleware");
const { getSocketOptions } = require("../config/websocket");

// Utility modules
const ProgressTracker = require("../utils/ProgressTracker");

// Service modules
const DatabaseService = require("../services/databaseService");
const importService = require("../services/importService");

// Initialize Express app and server
const app = express();
const PORT = process.env.PORT || 8080;
const server = http.createServer(app);

// Initialize Socket.io with configuration
const io = socketIo(server, getSocketOptions());

// Initialize progress tracker with WebSocket support
const progressTracker = new ProgressTracker(io);

// Database initialization
const dbPath = path.join(__dirname, dbConfig.path.relative);
const db = new sqlite3.Database(dbPath);
const databaseService = new DatabaseService(dbPath);

// Make database globally accessible for services that need it
global.db = db;

// Set up global utility functions for import processes
global.PathValidator = require("../utils/PathValidator");
global.extractScanDateFromFilename = importService.extractScanDateFromFilename;
global.extractDateFromFilename = importService.extractDateFromFilename;
global.bulkLoadToStagingTable = importService.bulkLoadToStagingTable;
global.mapVulnerabilityRow = importService.mapVulnerabilityRow;
global.processVulnerabilityRowsWithEnhancedLifecycle = importService.processVulnerabilitiesWithLifecycle;

// Configure multer for file uploads (kept for future use)
const _upload = multer(middlewareConfig.upload);

// Import controllers that need initialization
const VulnerabilityController = require("../controllers/vulnerabilityController");
const TicketController = require("../controllers/ticketController");
const BackupController = require("../controllers/backupController");

/**
 * Initializes the database and controllers.
 * @returns {Promise<void>}
 */
async function initDb() {
    await databaseService.initialize();

    // Initialize controllers with database and dependencies
    // These are static methods that set up the singleton instances
    VulnerabilityController.initialize(db, progressTracker);
    TicketController.initialize(db);
    BackupController.initialize(db);
    // Initialize importController with progressTracker
    const importController = require("../controllers/importController");
    importController.setProgressTracker(progressTracker);

    console.log("✅ Database and controllers initialized successfully");
}

// Setup WebSocket event handlers
io.on("connection", (socket) => {
    console.log("📡 Client connected:", socket.id);

    socket.on("disconnect", () => {
        console.log("📡 Client disconnected:", socket.id);
    });
});

// Apply middleware configuration
app.use(cors(middlewareConfig.cors));
app.use("/api/", rateLimit(middlewareConfig.rateLimit));
app.use(compression());
app.use(express.json(middlewareConfig.bodyParser.json));
app.use(express.urlencoded(middlewareConfig.bodyParser.urlencoded));

// Apply security headers
app.use((req, res, next) => {
    Object.entries(middlewareConfig.security.headers).forEach(([header, value]) => {
        res.setHeader(header, value);
    });
    next();
});

/**
 * @description Health check endpoint
 * @name /health
 * @method GET
 * @returns {object} Health status object
 */
app.get("/health", (req, res) => {
    try {
        // Get version from environment or default
        const version = process.env.HEXTRACKR_VERSION || "1.0.16";

        // Check if database file exists
        const dbExists = fs.existsSync(dbPath);

        // Return full health status
        res.json({
            status: "ok",
            version: version,
            db: dbExists,
            uptime: process.uptime()
        });
    } catch (error) {
        console.error("Health endpoint error:", error.message);
        res.json({
            status: "ok",
            version: process.env.HEXTRACKR_VERSION || "unknown",
            db: false,
            uptime: process.uptime()
        });
    }
});

/**
 * Starts the server.
 * @returns {Promise<void>}
 */
async function startServer() {
    // Initialize database and controllers BEFORE importing routes
    await initDb();

    // NOW import route modules (after controllers are initialized)
    const vulnerabilityRoutes = require("../routes/vulnerabilities");
    const ticketRoutes = require("../routes/tickets");
    const importRoutes = require("../routes/imports");
    const backupRoutes = require("../routes/backup");
    const docsRoutes = require("../routes/docs");

    // Mount route modules (order matters to avoid conflicts)
    app.use("/api/docs", docsRoutes);
    app.use("/api/backup", backupRoutes);
    app.use("/api/vulnerabilities", vulnerabilityRoutes);
    app.use("/api/imports", importRoutes);
    app.use("/api/import", importRoutes); // Also mount at /api/import for legacy routes
    app.use("/api/tickets", ticketRoutes);

    /**
     * @description Get all sites
     * @name /api/sites
     * @method GET
     * @returns {Array<object>} Array of site objects
     */
    app.get("/api/sites", (req, res) => {
        db.all("SELECT DISTINCT hostname FROM vulnerabilities ORDER BY hostname", [], (err, rows) => {
            if (err) {return res.status(500).json({ error: err.message });}
            res.json(rows.map(row => ({ name: row.hostname })));
        });
    });

    /**
     * @description Get all locations
     * @name /api/locations
     * @method GET
     * @returns {Array<object>} Array of location objects
     */
    app.get("/api/locations", (req, res) => {
        db.all("SELECT DISTINCT ip_address FROM vulnerabilities WHERE ip_address != '' ORDER BY ip_address", [], (err, rows) => {
            if (err) {return res.status(500).json({ error: err.message });}
            res.json(rows.map(row => ({ name: row.ip_address })));
        });
    });

    // Static file serving
    app.use("/docs-html", express.static(path.join(__dirname, "docs-html"), {
        setHeaders: (res, filePath) => {
            if (filePath.endsWith(".html")) {
                res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
            }
        }
    }));

    // Developer documentation (JSDoc generated - not linked in main navigation)
    app.use("/dev-docs", express.static(path.join(__dirname, "../dev-docs-html"), {
        setHeaders: (res, filePath) => {
            if (filePath.endsWith(".html")) {
                res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
            }
        }
    }));

    app.use(express.static(path.join(__dirname), {
        setHeaders: (res, filePath) => {
            if (filePath.endsWith(".html")) {
                res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
            }
        }
    }));

    /**
     * @description Default route
     * @name /
     * @method GET
     */
    app.get("/", (req, res) => {
        res.redirect("/vulnerabilities.html");
    });

    // Error handling middleware
    app.use((error, req, res, _next) => {
        console.error("Unhandled error:", error);
        res.status(500).json({
            success: false,
            error: "Internal server error",
            details: process.env.NODE_ENV === "development" ? error.message : undefined
        });
    });

    // Now start listening for requests
    server.listen(PORT, "0.0.0.0", () => {
        console.log(`🚀 HexTrackr server running on http://localhost:${PORT}`);
        console.log("📊 Database-powered vulnerability management enabled");
        console.log("🔌 WebSocket progress tracking enabled");
        console.log("Available endpoints:");
        console.log(`  - Tickets: http://localhost:${PORT}/tickets.html`);
        console.log(`  - Vulnerabilities: http://localhost:${PORT}/vulnerabilities.html`);
        console.log(`  - API: http://localhost:${PORT}/api/vulnerabilities`);
    });
}

// Start the server
startServer().catch(error => {
    console.error("Failed to start server:", error);
    process.exit(1);
});