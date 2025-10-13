/**
 * HexTrackr Express Server - Modular Implementation
 * Replaces the monolithic ~3,800 line server with route/controller modules
 * while preserving the legacy implementation in app/backups/server-monolithic-backup.js
 */
/* eslint-env node */
/* global __dirname, require, console, process */

// Load environment variables
require("dotenv").config();

// HEX-133 Task 1.3: Validate SESSION_SECRET exists at boot time
if (!process.env.SESSION_SECRET || process.env.SESSION_SECRET.length < 32) {
    console.error("\n❌ CRITICAL: SESSION_SECRET is missing or too short!");
    console.error("📋 Session security requires a cryptographically random secret (32+ characters)");
    console.error("\n🔧 To generate a secure SESSION_SECRET, run:");
    console.error("   node -e \"console.log(require('crypto').randomBytes(32).toString('hex'))\"");
    console.error("\n📝 Add the generated value to your .env file:");
    console.error("   SESSION_SECRET=<generated_secret_here>");
    console.error("\n⚠️  Server startup aborted for security.\n");
    process.exit(1);
}

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
const CiscoAdvisoryService = require("../services/ciscoAdvisoryService");
const PaloAltoService = require("../services/paloAltoService"); // HEX-209: Palo Alto advisory sync
const PreferencesService = require("../services/preferencesService");

// Authentication middleware
const { sessionMiddleware } = require("../middleware/auth");
const { csrfSync } = require("csrf-sync");

// Controllers that require initialization
const VulnerabilityController = require("../controllers/vulnerabilityController");
const TicketController = require("../controllers/ticketController");
const BackupController = require("../controllers/backupController");
const TemplateController = require("../controllers/templateController");
const ImportController = require("../controllers/importController");
const DocsController = require("../controllers/docsController");
const AuthController = require("../controllers/authController");
const PreferencesController = require("../controllers/preferencesController");

// Route modules
const vulnerabilityRoutes = require("../routes/vulnerabilities");
const ticketRoutes = require("../routes/tickets");
const importRoutes = require("../routes/imports");
const backupRoutes = require("../routes/backup");
const docsRoutes = require("../routes/docs");
const templateRoutes = require("../routes/templates");
const kevRoutes = require("../routes/kev");
const ciscoRoutes = require("../routes/cisco"); // HEX-141: Cisco PSIRT advisory sync
const paloRoutes = require("../routes/palo-alto"); // HEX-209: Palo Alto advisory sync
const deviceRoutes = require("../routes/devices"); // HEX-101: Device statistics endpoint
const authRoutes = require("../routes/auth");
const preferencesRoutes = require("../routes/preferences"); // HEX-138: User preferences API

// Express application & HTTP/HTTPS server
const app = express();
const PORT = process.env.PORT || 8080;

// Trust proxy configuration for nginx reverse proxy
// ALWAYS true - we always run behind nginx reverse proxy (HEX-128 CRITICAL FIX)
// Required for Express to recognize HTTPS from X-Forwarded-Proto header
// Without this, secure cookies won't work because Express sees connection as HTTP
app.set("trust proxy", true);

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

// Secure WebSocket connections with session-based authentication
// Only authenticate on handshake (when sid is undefined), not on subsequent polling requests
io.engine.use((req, res, next) => {
    const isHandshake = req._query.sid === undefined;
    if (!isHandshake) {
        return next();
    }

    // Apply session middleware during handshake
    sessionMiddleware(req, res, (err) => {
        if (err) {
            console.error("❌ Socket session error:", err);
            return next(err);
        }

        // Check if user is authenticated
        if (!req.session || !req.session.userId) {
            console.log("⚠️  Unauthenticated WebSocket connection attempt");
            return next(new Error("Authentication required"));
        }

        console.log(`✅ Authenticated WebSocket handshake: ${req.session.username}`);
        next();
    });
});

io.on("connection", (socket) => {
    // Access session from socket handshake
    const session = socket.request.session;
    const username = session ? session.username : "Unknown";

    console.log(`📡 WebSocket client connected: ${username} (${socket.id})`);

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
        console.log(`📡 WebSocket client disconnected: ${username} (${socket.id}) - ${reason}`);
    });
});

// Database bootstrap using the extracted DatabaseService
// HEX-133: Database moved outside public root for security
const dbPath = path.join(__dirname, "..", "data", "hextrackr.db");
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
    PreferencesController.initialize(db); // HEX-138: User preferences

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

    // HEX-133 Task 1.2: Body parser MUST come before CSRF middleware
    // CRITICAL: CSRF middleware needs to read req.body._csrf, so body must be parsed first
    app.use(express.json(middlewareConfig.bodyParser.json));
    app.use(express.urlencoded(middlewareConfig.bodyParser.urlencoded));

    // HEX-133 Task 1.2: CSRF protection (must be after session AND body-parser)
    // CRITICAL: Login endpoint MUST be excluded from CSRF (can't get token before authenticating)
    // csrf-sync uses Synchroniser Token Pattern - tokens stored in req.session (no secret needed)
    const { csrfSynchronisedProtection, generateToken } = csrfSync({
        getTokenFromRequest: (req) => {
            // Check multiple locations for CSRF token (header, body, query)
            return req.headers["x-csrf-token"] ||
                   req.body?._csrf ||
                   req.query?._csrf;
        },
        ignoredMethods: ["GET", "HEAD", "OPTIONS"],
        // csrf-sync stores tokens in session, retrieves from req.session.csrfToken
        getTokenFromState: (req) => req.session.csrfToken,
        storeTokenInState: (req, token) => { req.session.csrfToken = token; },
        size: 128 // Token size in bits
    });

    // Make generateToken available to routes via app.locals
    app.locals.generateCsrfToken = generateToken;

    // Apply CSRF protection to all routes EXCEPT login
    app.use((req, res, next) => {
        const publicAuthPaths = ["/api/auth/login", "/api/auth/csrf", "/api/auth/status"];
        if (publicAuthPaths.includes(req.path)) {
            return next(); // Skip CSRF for public auth endpoints
        }
        return csrfSynchronisedProtection(req, res, next);
    });

    app.use("/api/", rateLimit(middlewareConfig.rateLimit));

    // Only use Express compression when NOT behind nginx reverse proxy
    // When TRUST_PROXY=true, nginx handles compression (avoid double compression overhead)
    // Double compression wastes CPU cycles and actually slows responses
    if (process.env.TRUST_PROXY !== "true") {
        app.use(compression());
    }

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
    app.use("/api/cisco", ciscoRoutes(db, PreferencesController.getInstance().preferencesService)); // HEX-141: Cisco PSIRT advisory sync
    app.use("/api/palo", paloRoutes(db, PreferencesController.getInstance().preferencesService)); // HEX-209: Palo Alto advisory sync
    app.use("/api/devices", deviceRoutes); // HEX-101: Device statistics endpoint
    app.use("/api/auth", authRoutes);
    app.use("/api/preferences", preferencesRoutes); // HEX-138: User preferences

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

    // HEX-133: Block access to /data directory (databases moved outside public root)
    app.use("/data", (req, res) => {
        res.status(403).json({ error: "Forbidden" });
    });

    app.use(express.static(__dirname, {
        setHeaders: (res, filePath) => {
            if (filePath.endsWith(".html")) {
                res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
            }
        }
    }));

    // Root redirect handler (HEX-128 Task 3.5)
    // Serves index.html which redirects based on authentication status
    app.get("/", (req, res) => {
        res.sendFile(path.join(__dirname, "index.html"));
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

        // HEX-133 Task 1.6: Warn about HTTPS requirement for authentication
        if (!useHTTPS && process.env.NODE_ENV !== "test") {
            console.log("\n⚠️  WARNING: Secure cookies enabled but server not using HTTPS!");
            console.log("   Session cookies will be rejected by browsers over HTTP.");
            console.log("   Login and authentication will NOT work without HTTPS.");
            console.log("\n🔧 For local development, use Docker nginx reverse proxy:");
            console.log("   docker-compose up -d");
            console.log("   Access via https://localhost or https://dev.hextrackr.com");
            console.log("   (Type 'thisisunsafe' to bypass self-signed cert warning)\n");
        }

        // HEX-141: Start Cisco advisory background sync worker
        startCiscoBackgroundSync(db);
    });
}

/**
 * Background worker for Cisco PSIRT advisory sync (HEX-141)
 * Runs on startup and repeats every 24 hours
 * Automatically syncs stale advisories (>90 days) and new CVEs
 * @param {Object} db - Database instance
 */
function startCiscoBackgroundSync(db) {
    const SYNC_INTERVAL = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
    const ADMIN_USER_ID = "00000000-0000-0000-0000-000000000001"; // Default admin user UUID

    const preferencesService = new PreferencesService();
    preferencesService.initialize(db);
    const ciscoService = new CiscoAdvisoryService(db, preferencesService);

    // Initialize preference with default value if it doesn't exist (HEX-141)
    preferencesService.getPreference(ADMIN_USER_ID, "cisco_background_sync_enabled")
        .then(result => {
            if (!result.success) {
                // Preference doesn't exist - create it with default value "true"
                return preferencesService.setPreference(ADMIN_USER_ID, "cisco_background_sync_enabled", "true");
            }
        })
        .then(() => {
            console.log("✅ Cisco background sync preference initialized");
        })
        .catch(err => {
            console.warn("⚠️  Failed to initialize Cisco background sync preference:", err.message);
        });

    /**
     * Execute Cisco advisory sync if enabled and credentials are configured
     */
    async function runSync() {
        try {
            // Check if background sync is enabled (default: true)
            const bgSyncPref = await preferencesService.getPreference(ADMIN_USER_ID, "cisco_background_sync_enabled");
            const isEnabled = bgSyncPref.success && bgSyncPref.data
                ? (bgSyncPref.data.value === "true" || bgSyncPref.data.value === true)
                : true; // Default enabled if preference doesn't exist

            if (!isEnabled) {
                console.log("ℹ️  Cisco background sync skipped: Disabled by user preference");
                return;
            }

            // Check if Cisco API credentials exist
            const { clientId } = await ciscoService.getCiscoCredentials(ADMIN_USER_ID);

            if (!clientId) {
                console.log("ℹ️  Cisco background sync skipped: No API credentials configured");
                return;
            }

            console.log("🔄 Starting Cisco advisory background sync...");
            const result = await ciscoService.syncCiscoAdvisories(ADMIN_USER_ID);

            console.log(`✅ Cisco background sync completed: ${result.matchedCount}/${result.totalCvesChecked} CVEs synced`);

        } catch (error) {
            console.error("❌ Cisco background sync failed:", error.message);
            // Don't crash the server on sync failure - just log and continue
        }
    }

    // Run initial sync on startup (after 10 second delay to let server fully initialize)
    console.log("⏰ Cisco advisory background sync scheduled (runs on startup + every 24 hours)");
    setTimeout(() => {
        runSync();
    }, 10000);

    // Schedule recurring sync every 24 hours
    setInterval(runSync, SYNC_INTERVAL);
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
