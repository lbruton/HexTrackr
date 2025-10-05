/**
 * HexTrackr Express Server - Modular Implementation
 * Replaces the monolithic ~3,800 line server with route/controller modules
 * while preserving the legacy implementation in app/backups/server-monolithic-backup.js
 */
/* eslint-env node */
/* global __dirname, require, console, process */

// Load environment variables
require("dotenv").config();

const express = require("express");
const path = require("path");
const cors = require("cors");
const compression = require("compression");
const rateLimit = require("express-rate-limit");
const http = require("http");
const https = require("https");
const socketIo = require("socket.io");
const fs = require("fs");

// Configuration & utilities
const middlewareConfig = require("../config/middleware");
const ProgressTracker = require("../utils/ProgressTracker");
const DatabaseService = require("../services/databaseService");

// Authentication middleware
const { sessionMiddleware } = require("../middleware/auth");

// Controllers that require initialization
const VulnerabilityController = require("../controllers/vulnerabilityController");
const TicketController = require("../controllers/ticketController");
const BackupController = require("../controllers/backupController");
const TemplateController = require("../controllers/templateController");
const ImportController = require("../controllers/importController");
const DocsController = require("../controllers/docsController");
const AuthController = require("../controllers/authController");

// Route modules
const vulnerabilityRoutes = require("../routes/vulnerabilities");
const ticketRoutes = require("../routes/tickets");
const importRoutes = require("../routes/imports");
const backupRoutes = require("../routes/backup");
const docsRoutes = require("../routes/docs");
const templateRoutes = require("../routes/templates");
const kevRoutes = require("../routes/kev");
const deviceRoutes = require("../routes/devices"); // HEX-101: Device statistics endpoint
const authRoutes = require("../routes/auth");

// Express application & HTTP/HTTPS server
const app = express();
const PORT = process.env.PORT || 8080;

// Trust proxy configuration for nginx reverse proxy
// Enable when behind nginx to allow Express to see real client IPs in X-Forwarded-* headers
// Required for: rate limiting, logging, security headers
// Set TRUST_PROXY=true in .env when behind nginx reverse proxy
app.set("trust proxy", process.env.TRUST_PROXY === "true");

// HTTPS configuration
const useHTTPS = process.env.USE_HTTPS === "true";
let server;

if (useHTTPS) {
    const httpsOptions = {
        key: fs.readFileSync(process.env.SSL_KEY_PATH || "./certs/key.pem"),
        cert: fs.readFileSync(process.env.SSL_CERT_PATH || "./certs/cert.pem")
    };
    server = https.createServer(httpsOptions, app);
} else {
    server = http.createServer(app);
}

// WebSocket setup for progress tracking
const io = socketIo(server, middlewareConfig.websocket);
const progressTracker = new ProgressTracker(io);
ImportController.setProgressTracker(progressTracker);

io.on("connection", (socket) => {
    console.log(`📡 WebSocket client connected: ${socket.id}`);

    socket.on("join-progress", (sessionId) => {
        if (sessionId && typeof sessionId === "string") {
            socket.join(`progress-${sessionId}`);
            console.log(`Client ${socket.id} joined progress room: ${sessionId}`);

            const session = progressTracker.getSession(sessionId);
            if (session) {
                socket.emit("progress-status", {
                    sessionId,
                    progress: session.progress,
                    status: session.status,
                    message: session.metadata.message,
                    metadata: session.metadata
                });
            }
        }
    });

    socket.on("leave-progress", (sessionId) => {
        if (sessionId && typeof sessionId === "string") {
            socket.leave(`progress-${sessionId}`);
            console.log(`Client ${socket.id} left progress room: ${sessionId}`);
        }
    });

    socket.on("disconnect", (reason) => {
        console.log(`📡 WebSocket client disconnected: ${socket.id} (${reason})`);
    });
});

// Database bootstrap using the extracted DatabaseService
const dbPath = path.join(__dirname, "data", "hextrackr.db");
const databaseService = new DatabaseService(dbPath);

async function initializeApplication() {
    await databaseService.initialize();
    const db = databaseService.db; // underlying sqlite3.Database instance
    global.db = db; // maintain compatibility with legacy services

    // Initialize controllers that depend on database/progress tracker
    VulnerabilityController.initialize(db, progressTracker);
    TicketController.initialize(db);
    BackupController.initialize(db);
    TemplateController.initialize(db);
    AuthController.initialize(db);

    // Seed email templates (v1.0.21 feature)
    const { seedAllTemplates } = require("../utils/seedEmailTemplates");
    try {
        await seedAllTemplates(db);
    } catch (seedError) {
        console.error("⚠️ Failed to seed templates:", seedError.message);
    }

    // Apply middleware configuration
    app.use(cors(middlewareConfig.cors));
    app.use(sessionMiddleware); // Session management with SQLite store
    app.use("/api/", rateLimit(middlewareConfig.rateLimit));

    // Only use Express compression when NOT behind nginx reverse proxy
    // When TRUST_PROXY=true, nginx handles compression (avoid double compression overhead)
    // Double compression wastes CPU cycles and actually slows responses
    if (process.env.TRUST_PROXY !== "true") {
        app.use(compression());
    }

    app.use(express.json(middlewareConfig.bodyParser.json));
    app.use(express.urlencoded(middlewareConfig.bodyParser.urlencoded));

    // Security headers
    app.use((req, res, next) => {
        Object.entries(middlewareConfig.security.headers).forEach(([header, value]) => {
            res.setHeader(header, value);
        });
        next();
    });

    // Lightweight health endpoint
    app.get("/health", (req, res) => {
        try {
            let version = "unknown";
            try {
                // Try to read from the mounted package.json in Docker container (/app/package.json)
                // Server is at /app/public/server.js, so package.json is at ../package.json
                version = require("../package.json").version;
            } catch (packageError) {
                // Fallback to environment variable if package.json not found
                version = process.env.HEXTRACKR_VERSION || "unknown";
                console.log(`Using environment version: ${version} (package.json not found: ${packageError.message})`);
            }

            const dbExists = fs.existsSync(dbPath);
            res.json({ status: "ok", version, db: dbExists, uptime: process.uptime() });
        } catch (error) {
            console.error("Health endpoint error:", error.message);
            res.json({ status: "ok", version: process.env.HEXTRACKR_VERSION || "unknown", db: false, uptime: process.uptime() });
        }
    });

    // Register modular route stacks
    app.use("/api/docs", docsRoutes);
    app.use("/api/backup", backupRoutes);
    app.use("/api/vulnerabilities", vulnerabilityRoutes);
    app.use("/api", importRoutes); // handles /vulnerabilities/import, /import/tickets, /imports, etc.
    app.use("/api/tickets", ticketRoutes);
    app.use("/api/templates", templateRoutes);
    app.use("/api/kev", kevRoutes(db));
    app.use("/api/devices", deviceRoutes); // HEX-101: Device statistics endpoint
    app.use("/api/auth", authRoutes);

    // Legacy lightweight endpoints retained from monolith
    app.get("/api/sites", (req, res) => {
        db.all("SELECT * FROM sites ORDER BY name ASC", (err, rows) => {
            if (err) {
                console.error("Error fetching sites:", err);
                return res.status(500).json({ error: "Failed to fetch sites" });
            }
            res.json(rows);
        });
    });

    app.get("/api/locations", (req, res) => {
        db.all("SELECT * FROM locations ORDER BY name ASC", (err, rows) => {
            if (err) {
                console.error("Error fetching locations:", err);
                return res.status(500).json({ error: "Failed to fetch locations" });
            }
            res.json(rows);
        });
    });

    // Documentation deep-link redirects (mirror original behavior)
    app.get(/^\/docs-html\/([^\/]+)\.html$/, (req, res) => {
        let section = req.params[0];
        const validSections = [
            "getting-started", "user-guides", "development", "architecture",
            "api-reference", "project-management", "security", "index",
            "getting-started/index", "getting-started/installation",
            "user-guides/index", "user-guides/ticket-management", "user-guides/vulnerability-management",
            "development/index", "development/coding-standards", "development/contributing",
            "development/development-setup", "development/docs-portal-guide", "development/memory-system", "development/pre-commit-hooks",
            "architecture/index", "architecture/backend", "architecture/database", "architecture/deployment",
            "architecture/frameworks", "architecture/frontend",
            "api-reference/index", "api-reference/backup-api", "api-reference/tickets-api", "api-reference/vulnerabilities-api",
            "project-management/index", "project-management/codacy-compliance", "project-management/quality-badges",
            "project-management/roadmap-to-sprint-system", "project-management/strategic-roadmap",
            "security/index", "security/overview", "security/vulnerability-disclosure",
            "html-update-report", "CHANGELOG", "ROADMAP"
        ];

        if (!section.includes("/")) {
            const resolved = DocsController.findDocsSectionForFilename(`${section}.html`);
            if (resolved) {section = resolved;}
        }

        if (!validSections.includes(section)) {
            return res.status(404).json({ error: "Documentation section not found" });
        }

        res.redirect(302, `/docs-html/#${section}`);
    });

    // Static assets for documentation portal and SPA shell
    app.use("/docs-html", express.static(path.join(__dirname, "docs-html"), {
        setHeaders: (res, filePath) => {
            if (filePath.endsWith(".html")) {
                res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
            }
        }
    }));

    // Serve developer documentation (JSDoc)
    app.use("/dev-docs-html", express.static(path.join(__dirname, "../dev-docs-html"), {
        setHeaders: (res, filePath) => {
            if (filePath.endsWith(".html")) {
                res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
            }
        }
    }));

    app.use(express.static(__dirname, {
        setHeaders: (res, filePath) => {
            if (filePath.endsWith(".html")) {
                res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
            }
        }
    }));

    // Root fallback
    app.get("/", (req, res) => {
        res.sendFile(path.join(__dirname, "tickets.html"));
    });

    // Global error handler
    app.use((error, req, res, _next) => {
        console.error("Unhandled error:", error);
        res.status(500).json({
            success: false,
            error: "Internal server error",
            details: process.env.NODE_ENV === "development" ? error.message : undefined
        });
    });

    server.listen(PORT, "0.0.0.0", () => {
        console.log(`🚀 HexTrackr server running on ${useHTTPS ? "https" : "http"}://localhost:${PORT}`);
        console.log("📊 Modular backend initialized");
        console.log("🔌 WebSocket progress tracking enabled");
        console.log("Available endpoints:");
        console.log(`  - Tickets: ${useHTTPS ? "https" : "http"}://localhost:${PORT}/tickets.html`);
        console.log(`  - Vulnerabilities: ${useHTTPS ? "https" : "http"}://localhost:${PORT}/vulnerabilities.html`);
        console.log(`  - API Root: ${useHTTPS ? "https" : "http"}://localhost:${PORT}/api`);
    });
}

initializeApplication().catch(error => {
    console.error("Failed to start server:", error);
    process.exit(1);
});

/*
 * Legacy monolithic server implementation retained for reference in:
 *   app/backups/server-monolithic-backup.js
 * The historical code is no longer executed here to complete T053 modular refactor.
 */
