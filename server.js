/* eslint-env node */
/* global __dirname, __filename, require, console, process, setTimeout */
 
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
        vprScore: row["definition.vpr.score"] || row["vpr_score"] || row["VPR Score"] ? parseFloat(row["definition.vpr.score"] || row["vpr_score"] || row["VPR Score"]) : null,
        cvssScore: row["cvss_score"] || row["CVSS Score"] ? parseFloat(row["cvss_score"] || row["CVSS Score"]) : null,
        vendor: row["definition.family"] || row["vendor"] || row["Vendor"] || "",
        pluginName: row["definition.name"] || row["plugin_name"] || row["description"] || row["Description"] || "",
        description: row["definition.name"] || row["plugin_name"] || row["description"] || row["Description"] || "",
        pluginPublished: row["definition.plugin_published"] || row["vulnerability_date"] || row["plugin_published"] || "",
        state: row["state"] || row["State"] || "open",
        firstSeen: row["first_seen"] || row["First Seen"] || "",
        lastSeen: row["last_seen"] || row["Last Seen"] || "",
        pluginId: row["definition.id"] || row["plugin_id"] || row["Plugin ID"] || "",
        solution: row["solution"] || row["Solution"] || ""
    };
}

function _processVulnerabilityRows(rows, stmt, importId, filePath, responseData, res, scanDate) {
    let processed = 0;
    const importDate = scanDate || new Date().toISOString().split("T")[0];
    
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
            mapped.description,  // plugin_name in SQL
            mapped.description,  // description in SQL  
            mapped.solution,
            mapped.vendor,
            mapped.pluginPublished,
            mapped.state,
            importDate
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

// Rollover architecture helper functions
function generateUniqueKey(mapped) {
    // Create unique key based on hostname + description + VPR score (since CVE may be empty)
    const keyParts = [
        (mapped.hostname || "").trim(),
        (mapped.description || "").trim(),
        (mapped.vprScore || 0).toString()
    ];
    return keyParts.join("|");
}

function processVulnerabilityRowsWithRollover(rows, stmt, importId, filePath, responseData, res, scanDate) {
    let processed = 0;
    const currentDate = scanDate || new Date().toISOString().split("T")[0];
    
    // Process each row for rollover architecture
    rows.forEach((row) => {
        const mapped = mapVulnerabilityRow(row);
        const uniqueKey = generateUniqueKey(mapped);
        
        // Insert into snapshots (historical record)
        db.run(`INSERT INTO vulnerability_snapshots 
            (import_id, scan_date, hostname, ip_address, cve, severity, vpr_score, cvss_score, 
             first_seen, last_seen, plugin_id, plugin_name, description, solution, 
             vendor_reference, vendor, vulnerability_date, state, unique_key)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, [
            importId,
            currentDate,
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
            mapped.vendor,
            mapped.pluginPublished,
            mapped.state,
            uniqueKey
        ], (err) => {
            if (err) {
                console.error("Snapshot insert error:", err);
            }
        });
        
        // Insert or replace in current table (latest state)
        db.run(`INSERT OR REPLACE INTO vulnerabilities_current 
            (import_id, scan_date, hostname, ip_address, cve, severity, vpr_score, cvss_score, 
             first_seen, last_seen, plugin_id, plugin_name, description, solution, 
             vendor_reference, vendor, vulnerability_date, state, unique_key)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, [
            importId,
            currentDate,
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
            mapped.vendor,
            mapped.pluginPublished,
            mapped.state,
            uniqueKey
        ], (err) => {
            if (err) {
                console.error("Current table insert error:", err);
            }
            processed++;
            
            if (processed === rows.length) {
                // Calculate and store daily totals
                calculateAndStoreDailyTotals(currentDate, () => {
                    stmt.finalize();
                    PathValidator.safeUnlinkSync(filePath);
                    res.json({
                        ...responseData,
                        rowsProcessed: processed,
                        scanDate: currentDate,
                        rolloverComplete: true
                    });
                });
            }
        });
    });
}

function calculateAndStoreDailyTotals(scanDate, callback) {
    // Calculate totals from current state (not snapshots)
    const totalsQuery = `
        SELECT 
            severity,
            COUNT(*) as count,
            COALESCE(SUM(vpr_score), 0) as total_vpr
        FROM vulnerabilities_current 
        WHERE scan_date = ?
        GROUP BY severity
    `;
    
    db.all(totalsQuery, [scanDate], (err, results) => {
        if (err) {
            console.error("Error calculating daily totals:", err);
            callback();
            return;
        }
        
        const totals = {
            critical_count: 0, critical_total_vpr: 0,
            high_count: 0, high_total_vpr: 0,
            medium_count: 0, medium_total_vpr: 0,
            low_count: 0, low_total_vpr: 0,
            total_vulnerabilities: 0, total_vpr: 0
        };
        
        results.forEach(row => {
            const severity = row.severity.toLowerCase();
            if (severity === "critical") {
                totals.critical_count = row.count;
                totals.critical_total_vpr = row.total_vpr;
            } else if (severity === "high") {
                totals.high_count = row.count;
                totals.high_total_vpr = row.total_vpr;
            } else if (severity === "medium") {
                totals.medium_count = row.count;
                totals.medium_total_vpr = row.total_vpr;
            } else if (severity === "low") {
                totals.low_count = row.count;
                totals.low_total_vpr = row.total_vpr;
            }
            totals.total_vulnerabilities += row.count;
            totals.total_vpr += row.total_vpr;
        });
        
        // Store or update daily totals
        db.run(`INSERT OR REPLACE INTO vulnerability_daily_totals 
            (scan_date, critical_count, critical_total_vpr, high_count, high_total_vpr,
             medium_count, medium_total_vpr, low_count, low_total_vpr, 
             total_vulnerabilities, total_vpr)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, [
            scanDate,
            totals.critical_count, totals.critical_total_vpr,
            totals.high_count, totals.high_total_vpr,
            totals.medium_count, totals.medium_total_vpr,
            totals.low_count, totals.low_total_vpr,
            totals.total_vulnerabilities, totals.total_vpr
        ], (err) => {
            if (err) {
                console.error("Error storing daily totals:", err);
            } else {
                console.log(`Daily totals updated for ${scanDate}`);
            }
            callback();
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
    FROM vulnerabilities_current 
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

// Get recent vulnerability statistics with trend comparison (for cards)
app.get("/api/vulnerabilities/recent-trends", (req, res) => {
  const recentQuery = `
    SELECT 
      severity,
      COUNT(*) as count,
      SUM(vpr_score) as total_vpr
    FROM vulnerabilities 
    WHERE DATE(created_at) = (
      SELECT MAX(DATE(created_at)) FROM vulnerabilities
    )
    GROUP BY severity
  `;
  
  const previousQuery = `
    SELECT 
      severity,
      COUNT(*) as count,
      SUM(vpr_score) as total_vpr
    FROM vulnerabilities 
    WHERE DATE(created_at) = (
      SELECT DISTINCT DATE(created_at) 
      FROM vulnerabilities 
      WHERE DATE(created_at) < (SELECT MAX(DATE(created_at)) FROM vulnerabilities)
      ORDER BY DATE(created_at) DESC 
      LIMIT 1
    )
    GROUP BY severity
  `;
  
  db.all(recentQuery, [], (err, recentRows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    
    db.all(previousQuery, [], (err, previousRows) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      
      // Calculate trends
      const trends = {};
      const previousData = {};
      
      previousRows.forEach(row => {
        previousData[row.severity] = { 
          count: row.count, 
          total_vpr: Math.round((row.total_vpr || 0) * 100) / 100 
        };
      });
      
      recentRows.forEach(row => {
        const prev = previousData[row.severity] || { count: 0, total_vpr: 0 };
        const currentVpr = Math.round((row.total_vpr || 0) * 100) / 100;
        trends[row.severity] = {
          current: { count: row.count, total_vpr: currentVpr },
          trend: {
            count_change: row.count - prev.count,
            vpr_change: Math.round((currentVpr - prev.total_vpr) * 100) / 100
          }
        };
      });
      
      res.json(trends);
    });
  });
});

// Get historical trending data (last 14 days)
app.get("/api/vulnerabilities/trends", (req, res) => {
  const query = `
    SELECT 
      scan_date as date,
      critical_count, critical_total_vpr,
      high_count, high_total_vpr,
      medium_count, medium_total_vpr,
      low_count, low_total_vpr,
      total_vulnerabilities, total_vpr
    FROM vulnerability_daily_totals 
    WHERE scan_date >= DATE('now', '-14 days')
    ORDER BY scan_date DESC
  `;
  
  db.all(query, [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    
    // Format data for chart consumption
    const trends = rows.map(row => ({
      date: row.date,
      Critical: { 
        count: row.critical_count, 
        total_vpr: Math.round((row.critical_total_vpr || 0) * 100) / 100 
      },
      High: { 
        count: row.high_count, 
        total_vpr: Math.round((row.high_total_vpr || 0) * 100) / 100 
      },
      Medium: { 
        count: row.medium_count, 
        total_vpr: Math.round((row.medium_total_vpr || 0) * 100) / 100 
      },
      Low: { 
        count: row.low_count, 
        total_vpr: Math.round((row.low_total_vpr || 0) * 100) / 100 
      }
    }));
    
    res.json(trends);
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
  const scanDate = req.body.scanDate || new Date().toISOString().split("T")[0]; // Use provided date or default to today
  
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
        
        // Process rows using rollover architecture (no stmt needed for rollover)
        processVulnerabilityRowsWithRollover(rows, null, importId, req.file.path, {
          success: true,
          importId,
          filename,
          processingTime: Date.now() - startTime
        }, res, scanDate);
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
    db.run("DELETE FROM vulnerability_snapshots");
    db.run("DELETE FROM vulnerabilities_current");
    db.run("DELETE FROM vulnerability_daily_totals");
    db.run("DELETE FROM vulnerability_imports", (err) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({ success: true, message: "All vulnerability data cleared from rollover architecture" });
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

// Only redirect direct section requests (not content files which are loaded by AJAX)
app.get(/^\/docs-html\/([^\/]+)\.html$/, (req, res) => {
    let section = req.params[0];
    
    // Security: Validate section parameter against whitelist to prevent open redirect
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
    
    // If the request is only a filename (no directory), try to resolve the correct section path
    if (!section.includes("/")) {
        const resolved = findDocsSectionForFilename(`${section}.html`);
        if (resolved) {section = resolved;}
    }
    
    // Security: Only redirect to valid sections, otherwise return 404
    if (!validSections.includes(section)) {
        return res.status(404).json({ error: "Documentation section not found" });
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

        // 1) Count /api routes by scanning this server.js file
        const serverCode = readText(__filename);
        const apiRouteRegex = /app\.(get|post|put|delete|patch)\s*\(\s*["'`]\/api\/[^"'`]+["'`]/g;
        const matches = serverCode.match(apiRouteRegex) || [];
        const apiEndpoints = [...new Set(matches)].length; // dedupe

        // 2) Approximate JS function count across scripts/ and docs-html/js and server.js
        const jsTargets = [
            path.join(__dirname, "scripts"),
            path.join(__dirname, "docs-html", "js")
        ];
        let jsFunctions = 0;
        const fnRegexes = [
            /function\s+\w+/g,
            /const\s+\w+\s*=\s*\(/g,
            /\w+\s*:\s*function/g
        ];

        const filesToScan = [__filename]; // always include server.js
        for (const dir of jsTargets) {
            try {
                const files = PathValidator.safeReaddirSync(dir);
                for (const file of files) {
                    if (file.endsWith(".js")) {
                        filesToScan.push(path.join(dir, file));
                    }
                }
            } catch (_) { /* ignore missing directories */ }
        }

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

// Serve docs-html content files directly (before general static middleware)
app.use("/docs-html", express.static(path.join(__dirname, "docs-html"), {
  maxAge: "1m",
  etag: true,
  lastModified: true
}));

// Serve static files from current directory
app.use(express.static(__dirname, {
  maxAge: "1m", // Short cache for development
  etag: true,
  lastModified: true
}));

// Clear data endpoint

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
    
    if (type === "all") {
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
    }
    
    // Determine query based on type - using const for better code quality
    const query = type === "vulnerabilities" ? "DELETE FROM vulnerabilities" :
                  type === "tickets" ? "DELETE FROM tickets" : null;
    
    if (!query) {
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

    // Create rollover architecture tables
    db.run(`CREATE TABLE IF NOT EXISTS vulnerability_snapshots (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      import_id INTEGER NOT NULL,
      scan_date TEXT NOT NULL,
      hostname TEXT,
      ip_address TEXT,
      cve TEXT,
      severity TEXT,
      vpr_score REAL,
      cvss_score REAL,
      first_seen TEXT,
      last_seen TEXT,
      plugin_id TEXT,
      plugin_name TEXT,
      description TEXT,
      solution TEXT,
      vendor_reference TEXT,
      vendor TEXT,
      vulnerability_date TEXT,
      state TEXT DEFAULT 'open',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      unique_key TEXT,
      FOREIGN KEY (import_id) REFERENCES vulnerability_imports (id)
    )`, (err) => {
      if (err) {
        console.error("Error creating vulnerability_snapshots table:", err.message);
      }
    });

    db.run(`CREATE TABLE IF NOT EXISTS vulnerabilities_current (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      import_id INTEGER NOT NULL,
      scan_date TEXT NOT NULL,
      hostname TEXT,
      ip_address TEXT,
      cve TEXT,
      severity TEXT,
      vpr_score REAL,
      cvss_score REAL,
      first_seen TEXT,
      last_seen TEXT,
      plugin_id TEXT,
      plugin_name TEXT,
      description TEXT,
      solution TEXT,
      vendor_reference TEXT,
      vendor TEXT,
      vulnerability_date TEXT,
      state TEXT DEFAULT 'open',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      unique_key TEXT UNIQUE,
      FOREIGN KEY (import_id) REFERENCES vulnerability_imports (id)
    )`, (err) => {
      if (err) {
        console.error("Error creating vulnerabilities_current table:", err.message);
      }
    });

    db.run(`CREATE TABLE IF NOT EXISTS vulnerability_daily_totals (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      scan_date TEXT NOT NULL UNIQUE,
      critical_count INTEGER DEFAULT 0,
      critical_total_vpr REAL DEFAULT 0,
      high_count INTEGER DEFAULT 0,
      high_total_vpr REAL DEFAULT 0,
      medium_count INTEGER DEFAULT 0,
      medium_total_vpr REAL DEFAULT 0,
      low_count INTEGER DEFAULT 0,
      low_total_vpr REAL DEFAULT 0,
      total_vulnerabilities INTEGER DEFAULT 0,
      total_vpr REAL DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`, (err) => {
      if (err) {
        console.error("Error creating vulnerability_daily_totals table:", err.message);
      }
    });

    // Create indexes for performance
    db.run("CREATE INDEX IF NOT EXISTS idx_snapshots_scan_date ON vulnerability_snapshots (scan_date)", (err) => {
      if (err) {
        console.error("Error creating snapshots scan_date index:", err.message);
      }
    });

    db.run("CREATE INDEX IF NOT EXISTS idx_snapshots_hostname ON vulnerability_snapshots (hostname)", (err) => {
      if (err) {
        console.error("Error creating snapshots hostname index:", err.message);
      }
    });

    db.run("CREATE INDEX IF NOT EXISTS idx_snapshots_severity ON vulnerability_snapshots (severity)", (err) => {
      if (err) {
        console.error("Error creating snapshots severity index:", err.message);
      }
    });

    db.run("CREATE INDEX IF NOT EXISTS idx_current_unique_key ON vulnerabilities_current (unique_key)", (err) => {
      if (err) {
        console.error("Error creating current unique_key index:", err.message);
      }
    });

    db.run("CREATE INDEX IF NOT EXISTS idx_current_scan_date ON vulnerabilities_current (scan_date)", (err) => {
      if (err) {
        console.error("Error creating current scan_date index:", err.message);
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
  console.log(`  - Vulnerabilities: http://localhost:${PORT}/vulnerabilities.html`);
  console.log(`  - API: http://localhost:${PORT}/api/vulnerabilities`);
});
