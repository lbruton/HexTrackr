/* eslint-env node */
/* global __dirname, require, console, process, setTimeout */
 
const express = require("express");
const path = require("path");
const cors = require("cors");
const compression = require("compression");
const sqlite3 = require("sqlite3").verbose();
const multer = require("multer");
const Papa = require("papaparse");
const fs = require("fs");

// Security utility for path validation
class PathValidator {
    static validatePath(filePath) {
        if (!filePath || typeof filePath !== "string") {
            throw new Error("Invalid file path");
        }
        
        const normalizedPath = path.normalize(filePath);
        
        // Check for path traversal attempts
        if (normalizedPath.includes("../") || normalizedPath.includes("..\\")) {
            throw new Error("Path traversal detected");
        }
        
        // Validate path components
        const pathComponents = normalizedPath.split(path.sep);
        for (const component of pathComponents) {
            if (component === ".." || (component === "." && pathComponents.length > 1)) {
                throw new Error("Invalid path component");
            }
        }
        
        return normalizedPath;
    }
    
    static safeReadFileSync(filePath, options = "utf8") {
        const validatedPath = this.validatePath(filePath);
        return fs.readFileSync(validatedPath, options);
    }
    
    static safeWriteFileSync(filePath, data, options = "utf8") {
        const validatedPath = this.validatePath(filePath);
        return fs.writeFileSync(validatedPath, data, options);
    }
    
    static safeReaddirSync(dirPath, options = {}) {
        const validatedPath = this.validatePath(dirPath);
        return fs.readdirSync(validatedPath, options);
    }
    
    static safeStatSync(filePath) {
        const validatedPath = this.validatePath(filePath);
        return fs.statSync(validatedPath);
    }
    
    static safeExistsSync(filePath) {
        try {
            const validatedPath = this.validatePath(filePath);
            return fs.existsSync(validatedPath);
        } catch {
            return false;
        }
    }
    
    static safeUnlinkSync(filePath) {
        const validatedPath = this.validatePath(filePath);
        return fs.unlinkSync(validatedPath);
    }
}

// Vulnerability processing helper functions
function mapVulnerabilityRow(row) {
    return {
        hostname: row["asset.name"] || row["hostname"] || row["Host"] || "",
        ipAddress: row["asset.display_ipv4_address"] || row["asset.ipv4_addresses"] || row["ip_address"] || row["IP Address"] || "",
        cve: row["definition.cve"] || row["cve"] || row["CVE"] || "",
        severity: row["severity"] || row["Severity"] || "",
        vprScore: parseFloat(row["definition.vpr.score"] || row["vpr_score"] || row["VPR Score"] || 0) || null,
        cvssScore: parseFloat(row["cvss_score"] || row["CVSS Score"] || 0) || null,
        vendor: row["definition.family"] || row["vendor"] || row["Vendor"] || "",
        description: row["definition.name"] || row["plugin_name"] || row["description"] || row["Description"] || "",
        pluginPublished: row["definition.plugin_published"] || row["vulnerability_date"] || row["plugin_published"] || "",
        state: row["state"] || row["State"] || "open",
        firstSeen: row["first_seen"] || row["First Seen"] || "",
        lastSeen: row["last_seen"] || row["Last Seen"] || "",
        pluginId: row["plugin_id"] || row["Plugin ID"] || "",
        solution: row["solution"] || row["Solution"] || ""
    };
}

function processVulnerabilityRows(rows, stmt, importId, filePath, responseData, res) {
    let processed = 0;
    const currentDate = new Date().toISOString().split("T")[0];
    
    rows.forEach(row => {
        const mapped = mapVulnerabilityRow(row);
        
        stmt.run([
            importId,
            mapped.hostname,
            mapped.ipAddress,
            mapped.cve,
            mapped.severity,
            mapped.vprScore,
            mapped.cvssScore,
            mapped.firstSeen,
            mapped.lastSeen,
            mapped.pluginId,
            mapped.description,
            mapped.solution,
            mapped.vendor,
            mapped.pluginPublished,
            mapped.state,
            currentDate
        ], (err) => {
            if (err) {
                console.error("Row insert error:", err);
            }
            processed++;
            
            if (processed === rows.length) {
                stmt.finalize();
                PathValidator.safeUnlinkSync(filePath);
                res.json({
                    ...responseData,
                    rowsProcessed: processed
                });
            }
        });
    });
}

// Ticket processing helper functions
function mapTicketRow(row, index) {
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

function processTicketRows(csvData, stmt, res) {
    let imported = 0;
    const errors = [];
    
    csvData.forEach((row, index) => {
        try {
            const mapped = mapTicketRow(row, index);
            
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
            console.error("Error finalizing ticket import:", err);
            return res.status(500).json({ error: "Import failed" });
        }
        
        res.json({
            success: true,
            imported: imported,
            total: csvData.length,
            errors: errors.length > 0 ? errors : undefined
        });
    });
}

const app = express();
const PORT = process.env.PORT || 8080;

// Database setup
const dbPath = path.join(__dirname, "data", "hextrackr.db");
const db = new sqlite3.Database(dbPath);

// Middleware
app.use(cors());
app.use(compression());
app.use(express.json({ limit: "100mb" }));
app.use(express.urlencoded({ extended: true, limit: "100mb" }));

// File upload configuration
const upload = multer({
  dest: "uploads/",
  limits: { fileSize: 100 * 1024 * 1024 } // 100MB limit
});

// Security headers
app.use((req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("X-XSS-Protection", "1; mode=block");
  next();
});

// Lightweight health check endpoint for container orchestrators and probes
app.get("/health", (req, res) => {
    try {
        // Simple DB file existence check (non-blocking)
        const dbExists = PathValidator.safeExistsSync(dbPath);
        res.json({ status: "ok", version: require("./package.json").version, db: dbExists, uptime: process.uptime() });
    } catch (_e) {
        res.json({ status: "ok", version: "unknown", db: false, uptime: process.uptime() });
    }
});

// API Routes

// Get vulnerability statistics with VPR totals
app.get("/api/vulnerabilities/stats", (req, res) => {
  const query = `
    SELECT 
      severity,
      COUNT(*) as count,
      SUM(vpr_score) as total_vpr,
      AVG(vpr_score) as avg_vpr,
      MIN(first_seen) as earliest,
      MAX(last_seen) as latest
    FROM vulnerabilities 
    GROUP BY severity
  `;
  
  db.all(query, [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// Get historical trending data (last 14 days)
app.get("/api/vulnerabilities/trends", (req, res) => {
  const query = `
    SELECT 
      DATE(created_at) as date,
      severity,
      COUNT(*) as count,
      SUM(vpr_score) as total_vpr
    FROM vulnerabilities 
    WHERE created_at >= DATE('now', '-14 days')
    GROUP BY DATE(created_at), severity
    ORDER BY date DESC, severity
  `;
  
  db.all(query, [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    
    // Format data for chart consumption
    const trends = {};
    rows.forEach(row => {
      if (!trends[row.date]) {
        trends[row.date] = { date: row.date, Critical: 0, High: 0, Medium: 0, Low: 0 };
      }
      trends[row.date][row.severity] = row.count;
    });
    
    res.json(Object.values(trends));
  });
});

// Get vulnerabilities with pagination
app.get("/api/vulnerabilities", (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 50;
  const offset = (page - 1) * limit;
  const search = req.query.search || "";
  const severity = req.query.severity || "";
  
  let whereClause = "";
  const params = [];
  
  if (search || severity) {
    const conditions = [];
    if (search) {
      conditions.push("(hostname LIKE ? OR cve LIKE ? OR plugin_name LIKE ?)");
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }
    if (severity) {
      conditions.push("severity = ?");
      params.push(severity);
    }
    whereClause = "WHERE " + conditions.join(" AND ");
  }
  
  const query = `
    SELECT * FROM vulnerabilities 
    ${whereClause}
    ORDER BY vpr_score DESC, last_seen DESC 
    LIMIT ? OFFSET ?
  `;
  
  params.push(limit, offset);
  
  db.all(query, params, (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    
    // Get total count for pagination
    const countQuery = `SELECT COUNT(*) as total FROM vulnerabilities ${whereClause}`;
    db.get(countQuery, params.slice(0, -2), (err, countResult) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      
      res.json({
        data: rows,
        pagination: {
          page,
          limit,
          total: countResult.total,
          pages: Math.ceil(countResult.total / limit)
        }
      });
    });
  });
});

// Import CSV vulnerabilities
app.post("/api/vulnerabilities/import", upload.single("csvFile"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }
  
  const startTime = Date.now();
  const filename = req.file.originalname;
  const vendor = req.body.vendor || "unknown";
  
  // Read and parse CSV
  const csvData = PathValidator.safeReadFileSync(req.file.path, "utf8");
  
  Papa.parse(csvData, {
    header: true,
    complete: (results) => {
      const rows = results.data.filter(row => Object.values(row).some(val => val && val.trim()));
      
      // Insert import record
      const importQuery = `
        INSERT INTO vulnerability_imports 
        (filename, import_date, row_count, vendor, file_size, processing_time, raw_headers)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `;
      
      db.run(importQuery, [
        filename,
        new Date().toISOString(),
        rows.length,
        vendor,
        req.file.size,
        Date.now() - startTime,
        JSON.stringify(results.meta.fields)
      ], function(err) {
        if (err) {
          res.status(500).json({ error: err.message });
          return;
        }
        
        const importId = this.lastID;
        
        // Process rows and insert vulnerabilities
        const stmt = db.prepare(`
          INSERT INTO vulnerabilities 
          (import_id, hostname, ip_address, cve, severity, vpr_score, cvss_score, 
           first_seen, last_seen, plugin_id, plugin_name, description, solution, 
           vendor, vulnerability_date, state, import_date)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);
        
        processVulnerabilityRows(rows, stmt, importId, req.file.path, {
          success: true,
          importId,
          filename,
          processingTime: Date.now() - startTime
        }, res);
      });
    },
    error: (error) => {
      res.status(400).json({ error: "CSV parsing failed: " + error.message });
    }
  });
});

// Clear all vulnerability data
app.delete("/api/vulnerabilities/clear", (req, res) => {
  db.serialize(() => {
    db.run("DELETE FROM ticket_vulnerabilities");
    db.run("DELETE FROM vulnerabilities");
    db.run("DELETE FROM vulnerability_imports", (err) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({ success: true, message: "All vulnerability data cleared" });
    });
  });
});

// Get import history
app.get("/api/imports", (req, res) => {
  const query = `
    SELECT 
      vi.*,
      COUNT(v.id) as vulnerability_count
    FROM vulnerability_imports vi
    LEFT JOIN vulnerabilities v ON vi.id = v.import_id
    GROUP BY vi.id
    ORDER BY vi.created_at DESC
  `;
  
  db.all(query, [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// Serve static files from current directory
app.use(express.static(__dirname, {
  maxAge: "1m", // Short cache for development
  etag: true,
  lastModified: true
}));

// Documentation portal routes: serve index for docs root and redirect deep links to hash routing
app.get("/docs-html", (req, res) => {
    res.sendFile(path.join(__dirname, "docs-html", "index.html"));
});

// Helper to find a section path for a given filename by scanning the content folder
function findDocsSectionForFilename(filename) {
    try {
        const contentRoot = path.join(__dirname, "docs-html", "content");
        const stack = [""]; // use relative subpaths
        while (stack.length) {
            const relDir = stack.pop();
            const dirPath = path.join(contentRoot, relDir);
            const entries = PathValidator.safeReaddirSync(dirPath, { withFileTypes: true });
            for (const entry of entries) {
                if (entry.isDirectory()) {
                    stack.push(path.join(relDir, entry.name));
                } else if (entry.isFile() && entry.name.toLowerCase() === filename.toLowerCase()) {
                    const relFile = path.join(relDir, entry.name);
                    // Convert to section path without .html and using forward slashes
                    return relFile.replace(/\\/g, "/").replace(/\.html$/i, "");
                }
            }
        }
    } catch (_e) {
        // ignore scan errors and fall back to original behavior
    }
    return null;
}

app.get(/^\/docs-html\/(.*)\.html$/, (req, res) => {
    let section = req.params[0];
    // If the request is only a filename (no directory), try to resolve the correct section path
    if (!section.includes("/")) {
        const resolved = findDocsSectionForFilename(`${section}.html`);
        if (resolved) {section = resolved;}
    }
    // Redirect to hash-based section so the SPA shell loads correctly
    res.redirect(302, `/docs-html/#${section}`);
});

// Documentation statistics endpoint (used by docs portal homepage)
// Computes:
//  - apiEndpoints: number of unique Express routes under /api
//  - jsFunctions: approximate count of JS function definitions in key folders
app.get("/api/docs/stats", async (req, res) => {
    try {
        const readText = (p) => PathValidator.safeReadFileSync(p, "utf8");

        // 1) Count API endpoints in server.js
        const serverPath = path.join(__dirname, "server.js");
        let apiEndpoints = 0;
        try {
            const serverSrc = readText(serverPath);
            // match app.get('/api/...', ...) capturing path
            const routeRegex = /app\.(get|post|put|delete|patch|options|head)\s*\(\s*['"`]([^'"`]+)['"`]\s*,/g;
            const paths = new Set();
            let m;
            while ((m = routeRegex.exec(serverSrc)) !== null) {
                const routePath = m[2];
                if (routePath.startsWith("/api/")) {
                    paths.add(routePath);
                }
            }
            apiEndpoints = paths.size;
        } catch (_e) {
            apiEndpoints = 0;
        }

        // 2) Approximate JS function count across scripts/ and docs-html/js and server.js
        const scanDirs = [
            path.join(__dirname, "scripts"),
            path.join(__dirname, "docs-html", "js")
        ];
        const filesToScan = [];

        const walk = (dir) => {
            try {
                const entries = PathValidator.safeReaddirSync(dir, { withFileTypes: true });
                for (const e of entries) {
                    const p = path.join(dir, e.name);
                    if (e.isDirectory()) {walk(p);}
                    else if (e.isFile() && p.endsWith(".js")) {filesToScan.push(p);}
                }
            } catch (_) { /* ignore */ }
        };

        scanDirs.forEach(walk);
        // include server.js
        filesToScan.push(serverPath);

        let jsFunctions = 0;
        const fnRegexes = [
            /\bfunction\s+[a-zA-Z0-9_$]+\s*\(/g,                  // named functions
            /\b(const|let|var)\s+[a-zA-Z0-9_$]+\s*=\s*\([^)]*\)\s*=>/g, // arrow fns
            /\b[a-zA-Z0-9_$]+\s*:\s*function\s*\(/g              // obj prop functions
        ];

        for (const f of filesToScan) {
            try {
                const src = readText(f);
                for (const rx of fnRegexes) {
                    const matches = src.match(rx);
                    if (matches) {jsFunctions += matches.length;}
                }
            } catch (_) { /* ignore file read errors */ }
        }

        // 3) Rough framework count (static list of primary frameworks)
        const frameworks = ["Express", "Bootstrap", "Tabler", "SQLite"];

        res.json({
            apiEndpoints,
            jsFunctions,
            frameworks: frameworks.length,
            computedAt: new Date().toISOString()
        });
    } catch (_err) {
        res.status(500).json({ error: "Failed to compute docs stats" });
    }
});

// Clear data endpoint
app.delete("/api/backup/clear/:type", (req, res) => {
    const { type } = req.params;
    let query = "";
    
    if (type === "vulnerabilities") {
        query = "DELETE FROM vulnerabilities";
    } else if (type === "tickets") {
        query = "DELETE FROM tickets";
    } else if (type === "all") {
        // For 'all', we'll run multiple queries
        db.run("DELETE FROM vulnerabilities", (vulnErr) => {
            if (vulnErr) {
                res.status(500).json({ error: "Failed to clear vulnerabilities" });
                return;
            }
            
            db.run("DELETE FROM tickets", (ticketErr) => {
                if (ticketErr) {
                    res.status(500).json({ error: "Failed to clear tickets" });
                    return;
                }
                
                res.json({ message: "All data cleared successfully" });
            });
        });
        return; // Exit early since we're handling the response in the nested callbacks
    } else {
        res.status(400).json({ error: "Invalid data type" });
        return;
    }
    
    // Run the query for single table clear
    db.run(query, (err) => {
        if (err) {
            res.status(500).json({ error: `Failed to clear ${type}` });
            return;
        }
        
        res.json({ message: `${type} cleared successfully` });
    });
});

// Fallback to tickets.html for root
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "tickets.html"));
});

// Initialize database on startup
const initDb = () => {
  if (!PathValidator.safeExistsSync(dbPath)) {
    console.log("Initializing database...");
    require("./scripts/init-database.js");
  }
  
  // Add new columns if they don't exist (for existing databases)
  db.serialize(() => {
    db.run("ALTER TABLE vulnerabilities ADD COLUMN vendor TEXT DEFAULT ''", (err) => {
      if (err && !err.message.includes("duplicate column")) {
        console.error("Error adding vendor column:", err.message);
      }
    });
    
    db.run("ALTER TABLE vulnerabilities ADD COLUMN vulnerability_date TEXT DEFAULT ''", (err) => {
      if (err && !err.message.includes("duplicate column")) {
        console.error("Error adding vulnerability_date column:", err.message);
      }
    });
    
    db.run("ALTER TABLE vulnerabilities ADD COLUMN state TEXT DEFAULT 'open'", (err) => {
      if (err && !err.message.includes("duplicate column")) {
        console.error("Error adding state column:", err.message);
      }
    });
    
    db.run("ALTER TABLE vulnerabilities ADD COLUMN import_date TEXT DEFAULT ''", (err) => {
      if (err && !err.message.includes("duplicate column")) {
        console.error("Error adding import_date column:", err.message);
      }
    });
  });
};

// Backup API endpoints for settings modal
app.get("/api/backup/stats", (req, res) => {
    db.get("SELECT COUNT(*) as vulnerabilities FROM vulnerabilities", (err, vulnRow) => {
        if (err) {
            res.status(500).json({ error: "Database error" });
            return;
        }
        
        db.get("SELECT COUNT(*) as tickets FROM tickets", (ticketErr, ticketRow) => {
            if (ticketErr) {
                res.status(500).json({ error: "Database error - tickets" });
                return;
            }
            
            const vulnCount = vulnRow.vulnerabilities;
            const ticketCount = ticketRow.tickets;
            
            // Get database file size
            const dbSize = PathValidator.safeStatSync(dbPath).size;
            
            res.json({
                vulnerabilities: vulnCount,
                tickets: ticketCount,
                total: vulnCount + ticketCount,
                dbSize: dbSize
            });
        });
    });
});

app.get("/api/backup/vulnerabilities", (req, res) => {
    db.all("SELECT * FROM vulnerabilities LIMIT 10000", (err, rows) => {
        if (err) {
            res.status(500).json({ error: "Export failed" });
            return;
        }
        res.json({
            type: "vulnerabilities",
            count: rows.length,
            data: rows,
            exported_at: new Date().toISOString()
        });
    });
});

// Tickets CRUD endpoints (restored after PostgreSQL corruption incident)
app.get("/api/tickets", (req, res) => {
    db.all("SELECT * FROM tickets ORDER BY created_at DESC", (err, rows) => {
        if (err) {
            console.error("Error fetching tickets:", err);
            res.status(500).json({ error: "Failed to fetch tickets" });
            return;
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
        
        res.json(transformedRows);
    });
});

// Sites and Locations API endpoints
app.get("/api/sites", (req, res) => {
    db.all("SELECT * FROM sites ORDER BY name ASC", (err, rows) => {
        if (err) {
            console.error("Error fetching sites:", err);
            res.status(500).json({ error: "Failed to fetch sites" });
            return;
        }
        res.json(rows);
    });
});

app.get("/api/locations", (req, res) => {
    db.all("SELECT * FROM locations ORDER BY name ASC", (err, rows) => {
        if (err) {
            console.error("Error fetching locations:", err);
            res.status(500).json({ error: "Failed to fetch locations" });
            return;
        }
        res.json(rows);
    });
});

app.post("/api/tickets", (req, res) => {
    const ticket = req.body;
    
    const sql = `INSERT INTO tickets (
        id, date_submitted, date_due, hexagon_ticket, service_now_ticket, location,
        devices, supervisor, tech, status, notes, attachments,
        created_at, updated_at, site, xt_number, site_id, location_id
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    
    const params = [
        ticket.id, ticket.dateSubmitted, ticket.dateDue, ticket.hexagonTicket,
        ticket.serviceNowTicket, ticket.location, JSON.stringify(ticket.devices),
        ticket.supervisor, ticket.tech, ticket.status, ticket.notes,
        JSON.stringify(ticket.attachments || []), ticket.createdAt, ticket.updatedAt,
        ticket.site, ticket.xt_number, ticket.site_id, ticket.location_id
    ];
    
    db.run(sql, params, function(err) {
        if (err) {
            console.error("Error saving ticket:", err);
            res.status(500).json({ error: "Failed to save ticket" });
            return;
        }
        res.json({ success: true, id: ticket.id, message: "Ticket saved successfully" });
    });
});

app.put("/api/tickets/:id", (req, res) => {
    const ticketId = req.params.id;
    const ticket = req.body;
    
    const sql = `UPDATE tickets SET 
        date_submitted = ?, date_due = ?, hexagon_ticket = ?, service_now_ticket = ?, 
        location = ?, devices = ?, supervisor = ?, tech = ?, status = ?, notes = ?, 
        attachments = ?, updated_at = ?, site = ?, xt_number = ?, site_id = ?, location_id = ?
        WHERE id = ?`;
    
    const params = [
        ticket.dateSubmitted, ticket.dateDue, ticket.hexagonTicket,
        ticket.serviceNowTicket, ticket.location, JSON.stringify(ticket.devices),
        ticket.supervisor, ticket.tech, ticket.status, ticket.notes,
        JSON.stringify(ticket.attachments || []), ticket.updatedAt,
        ticket.site, ticket.xt_number, ticket.site_id, ticket.location_id, ticketId
    ];
    
    db.run(sql, params, function(err) {
        if (err) {
            console.error("Error updating ticket:", err);
            res.status(500).json({ error: "Failed to update ticket" });
            return;
        }
        res.json({ success: true, id: ticketId, message: "Ticket updated successfully" });
    });
});

app.delete("/api/tickets/:id", (req, res) => {
    const ticketId = req.params.id;
    
    db.run("DELETE FROM tickets WHERE id = ?", [ticketId], function(err) {
        if (err) {
            console.error("Error deleting ticket:", err);
            res.status(500).json({ error: "Failed to delete ticket" });
            return;
        }
        res.json({ success: true, deleted: this.changes });
    });
});

app.post("/api/tickets/migrate", (req, res) => {
    const tickets = req.body.tickets || [];
    
    if (!Array.isArray(tickets) || tickets.length === 0) {
        return res.json({ success: true, message: "No tickets to migrate" });
    }
    
    const sql = `INSERT OR REPLACE INTO tickets (
        id, start_date, end_date, primary_number, incident_number, site_code,
        affected_devices, assignee, notes, status, priority, linked_cves,
        created_at, updated_at, display_site_code, ticket_number, site_id, location_id
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    
    let successCount = 0;
    let errorCount = 0;
    
    tickets.forEach(ticket => {
        const params = [
            ticket.id, ticket.start_date, ticket.end_date, ticket.primary_number,
            ticket.incident_number, ticket.site_code, JSON.stringify(ticket.affected_devices || []),
            ticket.assignee, ticket.notes, ticket.status, ticket.priority,
            JSON.stringify(ticket.linked_cves || []), ticket.created_at, ticket.updated_at,
            ticket.display_site_code, ticket.ticket_number, ticket.site_id, ticket.location_id
        ];
        
        db.run(sql, params, function(err) {
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
        res.json({ 
            success: true, 
            message: `Migration completed: ${successCount} tickets migrated, ${errorCount} errors`
        });
    }, 1000);
});

// JSON-based CSV import endpoints for frontend upload
app.post("/api/import/tickets", (req, res) => {
    const csvData = req.body.data || [];
    
    if (!Array.isArray(csvData) || csvData.length === 0) {
        return res.status(400).json({ error: "No data provided" });
    }
    
    // Prepare insert statement with UPSERT (INSERT OR REPLACE)
    const stmt = db.prepare(`
        INSERT OR REPLACE INTO tickets (
            id, xt_number, date_submitted, date_due, hexagon_ticket, 
            service_now_ticket, location, devices, supervisor, tech,
            status, notes, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    processTicketRows(csvData, stmt, res);
});

app.post("/api/import/vulnerabilities", (req, res) => {
    const csvData = req.body.data || [];
    
    if (!Array.isArray(csvData) || csvData.length === 0) {
        return res.status(400).json({ error: "No data provided" });
    }
    
    const importDate = new Date().toISOString();
    let imported = 0;
    const errors = [];
    
    // Create import record
    const importQuery = `
        INSERT INTO vulnerability_imports 
        (filename, import_date, row_count, vendor, file_size, processing_time, raw_headers)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    
    db.run(importQuery, [
        "web-upload.csv",
        importDate,
        csvData.length,
        "web-import",
        0,
        0,
        JSON.stringify(Object.keys(csvData[0] || {}))
    ], function(err) {
        if (err) {
            console.error("Error creating import record:", err);
            return res.status(500).json({ error: "Failed to create import record" });
        }
        
        const importId = this.lastID;
        
        // Prepare insert statement
        const stmt = db.prepare(`
            INSERT INTO vulnerabilities 
            (import_id, hostname, ip_address, cve, severity, vpr_score, cvss_score, 
             first_seen, last_seen, plugin_id, plugin_name, description, solution, 
             vendor, vulnerability_date, state, import_date)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);
        
        csvData.forEach((row, index) => {
            try {
                // Map CSV columns to database fields
                const hostname = row["asset.name"] || row["hostname"] || row["Host"] || "";
                const ipAddress = row["asset.display_ipv4_address"] || row["asset.ipv4_addresses"] || row["ip_address"] || row["IP Address"] || "";
                const cve = row["definition.cve"] || row["cve"] || row["CVE"] || "";
                const severity = row["severity"] || row["Severity"] || "";
                const vprScore = parseFloat(row["definition.vpr.score"] || row["vpr_score"] || row["VPR Score"] || 0);
                const cvssScore = parseFloat(row["cvss_score"] || row["CVSS Score"] || 0);
                const vendor = row["definition.family"] || row["vendor"] || row["Vendor"] || "";
                const description = row["definition.name"] || row["plugin_name"] || row["description"] || row["Description"] || "";
                const pluginPublished = row["definition.plugin_published"] || row["vulnerability_date"] || row["plugin_published"] || "";
                const state = row["state"] || row["State"] || "open";

                stmt.run([
                    importId,
                    hostname,
                    ipAddress,
                    cve,
                    severity,
                    vprScore || null,
                    cvssScore || null,
                    row["first_seen"] || row["First Seen"] || "",
                    row["last_seen"] || row["Last Seen"] || "",
                    row["plugin_id"] || row["Plugin ID"] || "",
                    description,
                    row["description"] || row["Description"] || "",
                    row["solution"] || row["Solution"] || "",
                    vendor,
                    pluginPublished,
                    state,
                    importDate.split("T")[0]
                ], (err) => {
                    if (err) {
                        console.error(`Error importing vulnerability row ${index + 1}:`, err);
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
                console.error("Error finalizing vulnerability import:", err);
                return res.status(500).json({ error: "Import failed" });
            }
            
            res.json({
                success: true,
                imported: imported,
                total: csvData.length,
                importId: importId,
                errors: errors.length > 0 ? errors : undefined
            });
        });
    });
});

app.get("/api/backup/tickets", (req, res) => {
    db.all("SELECT * FROM tickets ORDER BY created_at DESC", (err, rows) => {
        if (err) {
            console.error("Error fetching tickets for backup:", err);
            res.status(500).json({ error: "Failed to fetch tickets" });
            return;
        }
        
        res.json({
            type: "tickets",
            count: rows.length,
            data: rows,
            exported_at: new Date().toISOString()
        });
    });
});

app.get("/api/backup/all", (req, res) => {
    // Get vulnerabilities and tickets from database
    db.all("SELECT * FROM vulnerabilities LIMIT 10000", (err, vulnRows) => {
        if (err) {
            res.status(500).json({ error: "Export failed" });
            return;
        }
        
        db.all("SELECT * FROM tickets ORDER BY created_at DESC", (ticketErr, ticketRows) => {
            if (ticketErr) {
                res.status(500).json({ error: "Export failed - tickets error" });
                return;
            }
            
            res.json({
                type: "complete_backup",
                vulnerabilities: {
                    count: vulnRows.length,
                    data: vulnRows
                },
                tickets: {
                    count: ticketRows.length,
                    data: ticketRows
                },
                exported_at: new Date().toISOString()
            });
        });
    });
});

// Restore data from backup
app.post("/api/restore", upload.single("file"), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: "No file uploaded" });
        }
        
        const type = req.body.type;
        if (!["tickets", "vulnerabilities", "all"].includes(type)) {
            return res.status(400).json({ error: "Invalid data type" });
        }
        
        const filePath = req.file.path;
        const fileData = PathValidator.safeReadFileSync(filePath);
        
        // Use JSZip to extract the backup
        const zip = new (require("jszip"))();
        const zipContent = await zip.loadAsync(fileData);
        
        let restoredCount = 0;
        
        // Process based on data type
        if (type === "tickets" || type === "all") {
            // Extract tickets.json if it exists
            if (zipContent.files["tickets.json"]) {
                const ticketsJson = await zipContent.files["tickets.json"].async("string");
                const ticketsData = JSON.parse(ticketsJson);
                
                if (ticketsData && ticketsData.data && Array.isArray(ticketsData.data)) {
                    // Clear existing tickets if requested
                    if (req.body.clearExisting === "true") {
                        await new Promise((resolve, reject) => {
                            db.run("DELETE FROM tickets", (err) => {
                                if (err) {reject(err);}
                                else {resolve();}
                            });
                        });
                    }
                    
                    // Insert tickets data
                    const ticketValues = ticketsData.data.map(ticket => {
                        return [
                            ticket.xt_number || "",
                            ticket.date_submitted || "",
                            ticket.date_due || "",
                            ticket.hexagon_ticket || "",
                            ticket.service_now_ticket || "",
                            ticket.location || "",
                            ticket.devices || "",
                            ticket.supervisor || "",
                            ticket.tech || "",
                            ticket.status || "",
                            ticket.notes || "",
                            ticket.created_at || new Date().toISOString(),
                            ticket.updated_at || new Date().toISOString()
                        ];
                    });
                    
                    for (const values of ticketValues) {
                        await new Promise((resolve, reject) => {
                            db.run(`
                                INSERT INTO tickets 
                                (xt_number, date_submitted, date_due, hexagon_ticket, service_now_ticket, 
                                location, devices, supervisor, tech, status, notes, created_at, updated_at)
                                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                            `, values, function(err) {
                                if (err) {reject(err);}
                                else {resolve();}
                            });
                        });
                        restoredCount++;
                    }
                }
            }
        }
        
        if (type === "vulnerabilities" || type === "all") {
            // Extract vulnerabilities.json if it exists
            if (zipContent.files["vulnerabilities.json"]) {
                const vulnJson = await zipContent.files["vulnerabilities.json"].async("string");
                const vulnData = JSON.parse(vulnJson);
                
                if (vulnData && vulnData.data && Array.isArray(vulnData.data)) {
                    // Clear existing vulnerabilities if requested
                    if (req.body.clearExisting === "true") {
                        await new Promise((resolve, reject) => {
                            db.run("DELETE FROM vulnerabilities", (err) => {
                                if (err) {reject(err);}
                                else {resolve();}
                            });
                        });
                    }
                    
                    // Insert vulnerability data
                    const vulnValues = vulnData.data.map(vuln => {
                        return [
                            vuln.hostname || "",
                            vuln.ip_address || "",
                            vuln.cve || "",
                            vuln.severity || "",
                            vuln.vpr_score || 0,
                            vuln.cvss_score || 0,
                            vuln.first_seen || "",
                            vuln.last_seen || "",
                            vuln.plugin_name || "",
                            vuln.description || "",
                            vuln.solution || ""
                        ];
                    });
                    
                    for (const values of vulnValues) {
                        await new Promise((resolve, reject) => {
                            db.run(`
                                INSERT INTO vulnerabilities 
                                (hostname, ip_address, cve, severity, vpr_score, cvss_score, 
                                first_seen, last_seen, plugin_name, description, solution)
                                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                            `, values, function(err) {
                                if (err) {reject(err);}
                                else {resolve();}
                            });
                        });
                        restoredCount++;
                    }
                }
            }
        }
        
        // Clean up the uploaded file
        PathValidator.safeUnlinkSync(filePath);
        
        res.json({
            success: true,
            message: `Successfully restored ${restoredCount} records`,
            count: restoredCount
        });
        
    } catch (error) {
        console.error("Error restoring backup:", error);
        res.status(500).json({ error: "Failed to restore data: " + error.message });
    }
});

app.listen(PORT, "0.0.0.0", () => {
  initDb();
  console.log(`🚀 HexTrackr server running on http://localhost:${PORT}`);
  console.log("📊 Database-powered vulnerability management enabled");
  console.log("Available endpoints:");
  console.log(`  - Tickets: http://localhost:${PORT}/tickets.html`);
  console.log(`  - Vulnerabilities: http://localhost:${PORT}/vulnerabilities-new.html`);
  console.log(`  - API: http://localhost:${PORT}/api/vulnerabilities`);
});
