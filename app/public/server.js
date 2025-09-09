/* eslint-env node */
/* global __dirname, __filename, require, console, process, setTimeout, setInterval */
 
const express = require("express");
const path = require("path");
const cors = require("cors");
const compression = require("compression");
const sqlite3 = require("sqlite3").verbose();
const multer = require("multer");
const Papa = require("papaparse");
const fs = require("fs");
const rateLimit = require("express-rate-limit");
const http = require("http");
const socketIo = require("socket.io");
const crypto = require("crypto");

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

// Progress tracking for WebSocket-based real-time updates
class ProgressTracker {
    constructor(io) {
        this.io = io;
        this.sessions = new Map(); // sessionId -> { progress, lastUpdate, metadata }
        this.eventThrottle = new Map(); // sessionId -> lastEmitTime
        this.THROTTLE_INTERVAL = 100; // ms - minimum time between progress events
        this.SESSION_CLEANUP_INTERVAL = 30 * 60 * 1000; // 30 minutes
        
        // Auto-cleanup stale sessions
        setInterval(() => this.cleanupStaleSessions(), this.SESSION_CLEANUP_INTERVAL);
    }
    
    createSession(metadata = {}) {
        const sessionId = crypto.randomUUID();
        return this.createSessionWithId(sessionId, metadata);
    }
    
    createSessionWithId(sessionId, metadata = {}) {
        const session = {
            id: sessionId,
            progress: 0,
            status: "initialized",
            startTime: Date.now(),
            lastUpdate: Date.now(),
            metadata: {
                operation: "unknown",
                totalSteps: 0,
                currentStep: 0,
                message: "",
                ...metadata
            }
        };
        
        this.sessions.set(sessionId, session);
        console.log(`Progress session created: ${sessionId} for ${metadata.operation || "unknown operation"}`);
        return sessionId;
    }
    
    updateProgress(sessionId, progress, message = "", additionalData = {}) {
        if (!this.sessions.has(sessionId)) {
            console.warn(`Progress update attempted for unknown session: ${sessionId}`);
            return false;
        }
        
        const session = this.sessions.get(sessionId);
        const now = Date.now();
        
        // Update session data
        session.progress = Math.max(0, Math.min(100, progress));
        session.lastUpdate = now;
        session.metadata.message = message;
        session.metadata.currentStep = additionalData.currentStep || session.metadata.currentStep;
        
        // Add any additional metadata
        Object.assign(session.metadata, additionalData);
        
        // Throttle progress events to prevent spam
        const lastEmit = this.eventThrottle.get(sessionId) || 0;
        const shouldEmit = (now - lastEmit) >= this.THROTTLE_INTERVAL || progress >= 100;
        
        if (shouldEmit) {
            this.eventThrottle.set(sessionId, now);
            
            // Emit to specific room for this session
            this.io.to(`progress-${sessionId}`).emit("progress-update", {
                sessionId,
                progress: session.progress,
                message,
                status: session.status,
                timestamp: now,
                metadata: session.metadata
            });
            
            console.log(`Progress ${sessionId}: ${progress}% - ${message}`);
        }
        
        return true;
    }
    
    completeSession(sessionId, message = "Operation completed", finalData = {}) {
        if (!this.sessions.has(sessionId)) {
            console.warn(`Completion attempted for unknown session: ${sessionId}`);
            return false;
        }
        
        const session = this.sessions.get(sessionId);
        session.progress = 100;
        session.status = "completed";
        session.lastUpdate = Date.now();
        session.metadata.message = message;
        
        // Add final data
        Object.assign(session.metadata, finalData);
        
        // Force emit completion event (ignore throttling)
        this.io.to(`progress-${sessionId}`).emit("progress-complete", {
            sessionId,
            progress: 100,
            message,
            status: "completed",
            timestamp: session.lastUpdate,
            metadata: session.metadata,
            duration: session.lastUpdate - session.startTime
        });
        
        console.log(`Progress session completed: ${sessionId} - ${message}`);
        
        // Schedule session cleanup
        setTimeout(() => {
            this.sessions.delete(sessionId);
            this.eventThrottle.delete(sessionId);
        }, 5000); // Keep for 5 seconds after completion
        
        return true;
    }
    
    errorSession(sessionId, errorMessage, errorData = {}) {
        if (!this.sessions.has(sessionId)) {
            console.warn(`Error attempted for unknown session: ${sessionId}`);
            return false;
        }
        
        const session = this.sessions.get(sessionId);
        session.status = "error";
        session.lastUpdate = Date.now();
        session.metadata.message = errorMessage;
        session.metadata.error = errorData;
        
        // Force emit error event
        this.io.to(`progress-${sessionId}`).emit("progress-error", {
            sessionId,
            progress: session.progress,
            message: errorMessage,
            status: "error",
            timestamp: session.lastUpdate,
            metadata: session.metadata,
            error: errorData
        });
        
        console.error(`Progress session error: ${sessionId} - ${errorMessage}`, errorData);
        
        // Schedule session cleanup
        setTimeout(() => {
            this.sessions.delete(sessionId);
            this.eventThrottle.delete(sessionId);
        }, 10000); // Keep for 10 seconds after error
        
        return true;
    }
    
    getSession(sessionId) {
        return this.sessions.get(sessionId) || null;
    }
    
    cleanupStaleSessions() {
        const now = Date.now();
        const staleThreshold = 60 * 60 * 1000; // 1 hour
        
        for (const [sessionId, session] of this.sessions.entries()) {
            if (now - session.lastUpdate > staleThreshold) {
                console.log(`Cleaning up stale progress session: ${sessionId}`);
                this.sessions.delete(sessionId);
                this.eventThrottle.delete(sessionId);
            }
        }
    }
}

// Vulnerability processing helper functions
function mapVulnerabilityRow(row) {
    // CVE extraction logic - try direct field first, then extract from name
    let cve = row["definition.cve"] || row["cve"] || row["CVE"] || "";
    if (!cve && row["definition.name"]) {
        const cveMatch = row["definition.name"].match(/(CVE-\d{4}-\d+)/);
        cve = cveMatch ? cveMatch[1] : "";
        
        // Also try extracting Cisco vulnerability IDs from parentheses
        if (!cve) {
            const ciscoMatch = row["definition.name"].match(/\(([^)]+)\)$/);
            cve = ciscoMatch ? ciscoMatch[1] : "";
        }
    }
    
    // Preserve complete CVE string (Option A Plus approach)
    // Previously truncated multiple CVEs - now preserving all CVE data
    // Future enhancement: Add CVE parsing layer when API expansion needed
    
    // Enhanced hostname processing with normalization
    let hostname = row["asset.name"] || row["hostname"] || row["Host"] || "";
    hostname = normalizeHostname(hostname); // Use existing function
    
    // Enhanced IP address handling for multiple formats
    let ipAddress = row["asset.display_ipv4_address"] || row["asset.ipv4_addresses"] || row["ip_address"] || row["IP Address"] || "";
    if (ipAddress && ipAddress.includes(",")) {
        // Take first valid IP from comma-separated list
        const ips = ipAddress.split(",").map(ip => ip.trim());
        ipAddress = ips[0]; // Use first IP as primary
    }
    
    // Enhanced description handling - prefer definition.description for Tenable, name for others
    const description = row["definition.description"] || row["definition.name"] || row["plugin_name"] || row["description"] || row["Description"] || "";
    
    // Plugin name contains the full vulnerability name/description for matching and display
    // The front-end will extract CVE/Cisco SA for the Vulnerability column display
    const pluginName = row["definition.name"] || row["plugin_name"] || row["description"] || row["Description"] || "";
    
    return {
        assetId: row["asset.id"] || row["asset_id"] || row["Asset ID"] || "",
        hostname: hostname,
        ipAddress: ipAddress, 
        cve: cve,
        severity: row["severity"] || row["Severity"] || "",
        vprScore: row["definition.vpr.score"] || row["definition.vpr_v2.score"] || row["vpr_score"] || row["VPR Score"] ? parseFloat(row["definition.vpr.score"] || row["definition.vpr_v2.score"] || row["vpr_score"] || row["VPR Score"]) : null,
        cvssScore: row["cvss_score"] || row["CVSS Score"] ? parseFloat(row["cvss_score"] || row["CVSS Score"]) : null,
        vendor: normalizeVendor(row["definition.family"] || row["vendor"] || row["Vendor"] || ""),
        pluginName: pluginName,
        description: description,
        solution: row["solution"] || row["Solution"] || "",
        state: row["state"] || row["State"] || "ACTIVE",
        firstSeen: row["first_seen"] || row["First Seen"] || "",
        lastSeen: row["last_seen"] || row["Last Seen"] || "",
        pluginId: row["definition.id"] || row["plugin_id"] || row["Plugin ID"] || "",
        pluginPublished: row["definition.plugin_published"] || row["definition.plugin_updated"] || row["definition.vulnerability_published"] || row["vulnerability_date"] || row["plugin_published"] || ""
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
function normalizeHostname(hostname) {
    if (!hostname) {
        return "";
    }
    
    const cleanHostname = hostname.trim();
    
    // Check if hostname is a valid IP address (x.x.x.x pattern with valid octets)
    const ipRegex = /^(\d{1,3}\.){3}\d{1,3}$/;
    if (ipRegex.test(cleanHostname)) {
        // Validate that all octets are between 0-255
        const octets = cleanHostname.split(".").map(Number);
        const isValidIP = octets.every(octet => octet >= 0 && octet <= 255);
        
        if (isValidIP) {
            // For valid IP addresses, return the full IP - don't split on periods
            return cleanHostname.toLowerCase();
        }
    }
    
    // For domain names or invalid IPs, remove everything after first period to handle domain variations
    // Examples: nwan10.mmplp.net -> nwan10, nswan10 -> nswan10, 300.300.300.300 -> 300
    return cleanHostname.split(".")[0].toLowerCase();
}

function normalizeVendor(vendor) {
    if (!vendor) {
        return "Other";
    }
    
    const cleanVendor = vendor.trim().toLowerCase();
    
    if (cleanVendor.includes("cisco")) {
        return "CISCO";
    } else if (cleanVendor.includes("palo alto")) {
        return "Palo Alto";
    } else {
        return "Other";
    }
}

// Enhanced deduplication supporting functions
function normalizeIPAddress(ipAddress) {
    if (!ipAddress) {return null;}
    
    // Handle multiple IPs (take first valid one)
    const ips = ipAddress.split(",").map(ip => ip.trim());
    for (const ip of ips) {
        if (isValidIPAddress(ip)) {
            return ip.toLowerCase();
        }
    }
    return null;
}

function isValidIPAddress(ip) {
    if (!ip) {return false;}
    
    // Check if IP address is valid (x.x.x.x pattern with valid octets)
    const ipRegex = /^(\d{1,3}\.){3}\d{1,3}$/;
    if (!ipRegex.test(ip)) {return false;}
    
    // Validate that all octets are between 0-255
    const octets = ip.split(".").map(Number);
    return octets.every(octet => octet >= 0 && octet <= 255);
}

function createDescriptionHash(description) {
    if (!description) {return "empty";}
    
    // Create stable hash from description (first 50 chars, normalized)
    const normalized = description.trim().toLowerCase()
        .replace(/\s+/g, " ")
        .substring(0, 50);
    
    // Simple hash function using crypto if available
    try {
        const crypto = require("crypto");
        return crypto.createHash("md5").update(normalized).digest("hex").substring(0, 8);
    } catch (_e) {
        // Fallback hash function if crypto not available
        let hash = 0;
        for (let i = 0; i < normalized.length; i++) {
            const char = normalized.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32-bit integer
        }
        return Math.abs(hash).toString(36);
    }
}

function calculateDeduplicationConfidence(uniqueKey) {
    if (uniqueKey.startsWith("asset:")) {return 95;} // Highest confidence
    if (uniqueKey.startsWith("cve:")) {return 85;}   // High confidence
    if (uniqueKey.startsWith("plugin:")) {return 70;} // Medium confidence
    if (uniqueKey.startsWith("desc:")) {return 50;}   // Low confidence
    return 25; // Very low confidence
}

function getDeduplicationTier(uniqueKey) {
    if (uniqueKey.startsWith("asset:")) {return 1;} // Most stable
    if (uniqueKey.startsWith("cve:")) {return 2;}   // High reliability
    if (uniqueKey.startsWith("plugin:")) {return 3;} // Medium reliability
    if (uniqueKey.startsWith("desc:")) {return 4;}   // Least reliable
    return 5; // Unknown/legacy
}

// Enhanced multi-tier unique key generation
function generateEnhancedUniqueKey(mapped) {
    const normalizedHostname = normalizeHostname(mapped.hostname);
    const normalizedIP = normalizeIPAddress(mapped.ipAddress);
    
    // Tier 1: Asset ID + Plugin ID (most stable)
    if (mapped.assetId && mapped.pluginId) {
        return `asset:${mapped.assetId}|plugin:${mapped.pluginId}`;
    }
    
    // Tier 2: CVE + Hostname/IP (CVE-based when available)
    if (mapped.cve && mapped.cve.trim()) {
        const hostIdentifier = normalizedIP || normalizedHostname;
        return `cve:${mapped.cve.trim()}|host:${hostIdentifier}`;
    }
    
    // Tier 3: Plugin ID + Hostname/IP + Vendor (USER'S REQUESTED APPROACH)
    if (mapped.pluginId && mapped.pluginId.trim()) {
        const hostIdentifier = normalizedIP || normalizedHostname;
        const vendor = mapped.vendor || "unknown";
        return `plugin:${mapped.pluginId.trim()}|host:${hostIdentifier}|vendor:${vendor}`;
    }
    
    // Tier 4: Description hash + Hostname/IP (fallback)
    const descriptionHash = createDescriptionHash(mapped.description);
    const hostIdentifier = normalizedIP || normalizedHostname;
    return `desc:${descriptionHash}|host:${hostIdentifier}`;
}

// Legacy function maintained for backward compatibility during transition
function generateUniqueKey(mapped) {
    // Create unique key with normalized hostname to handle domain variations
    const normalizedHostname = normalizeHostname(mapped.hostname);
    
    // Prefer CVE when available for better deduplication
    if (mapped.cve && mapped.cve.trim()) {
        return `${normalizedHostname}|${mapped.cve.trim()}`;
    }
    
    // Fallback to plugin_id + description for vulnerabilities without CVE
    if (mapped.pluginId && mapped.pluginId.trim()) {
        return `${normalizedHostname}|${mapped.pluginId.trim()}|${(mapped.description || "").trim().substring(0, 100)}`;
    }
    
    // Final fallback to original method with normalized hostname
    const keyParts = [
        normalizedHostname,
        (mapped.description || "").trim(),
        (mapped.vprScore || 0).toString()
    ];
    return keyParts.join("|");
}

function _processVulnerabilityRowsWithRollover(rows, stmt, importId, filePath, responseData, res, scanDate) {
    const currentDate = scanDate || new Date().toISOString().split("T")[0];
    
    console.log("Starting rollover import for scan date:", currentDate, "with", rows.length, "rows");
    
    // Step 1: Mark all current vulnerabilities as potentially stale
    db.run("UPDATE vulnerabilities_current SET last_seen = ? WHERE scan_date < ?", 
        [currentDate, currentDate], (err) => {
        if (err) {
            console.error("Error marking vulnerabilities as stale:", err);
            res.status(500).json({ error: "Failed to prepare for import" });
            return;
        }
        
        // Step 2: Process all new vulnerability data SEQUENTIALLY to avoid race conditions
        const processedKeys = new Set();
        let insertCount = 0;
        let updateCount = 0;
        let finalizeCalled = false; // Prevent multiple finalize calls
        
        if (rows.length === 0) {
            // No data to process, finalize
            finalizeBatch();
            return;
        }

        // FIXED: Process rows sequentially instead of with forEach to prevent race conditions
        function processNextRow(index) {
            if (index >= rows.length) {
                // All rows processed, finalize once
                if (!finalizeCalled) {
                    finalizeCalled = true;
                    finalizeBatch();
                }
                return;
            }

            const row = rows[index];
            const mapped = mapVulnerabilityRow(row);
            const uniqueKey = generateEnhancedUniqueKey(mapped);
            
            // Use the current scan date for last_seen to indicate this vulnerability is present in current scan
            mapped.lastSeen = currentDate;
            
            // Skip duplicates within the same batch
            if (processedKeys.has(uniqueKey)) {
                processNextRow(index + 1); // Continue to next row
                return;
            }
            processedKeys.add(uniqueKey);
            
            // Insert into snapshots (historical record)
            db.run("INSERT INTO vulnerability_snapshots " +
                "(import_id, scan_date, hostname, ip_address, cve, severity, vpr_score, cvss_score, " +
                " first_seen, last_seen, plugin_id, plugin_name, description, solution, " +
                " vendor_reference, vendor, vulnerability_date, state, unique_key)" +
                "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", [
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
                mapped.pluginName,
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
                
                // Check if this vulnerability already exists in current table
                db.get("SELECT id, first_seen FROM vulnerabilities_current WHERE unique_key = ?", 
                    [uniqueKey], (err, existingRow) => {
                    if (err) {
                        console.error("Error checking existing vulnerability:", err);
                        processNextRow(index + 1); // Continue to next row
                        return;
                    }
                    
                    if (existingRow) {
                        // Update existing vulnerability - preserve first_seen, update last_seen and other fields
                        db.run("UPDATE vulnerabilities_current SET " +
                            "import_id = ?, scan_date = ?, hostname = ?, ip_address = ?, cve = ?, " +
                            "severity = ?, vpr_score = ?, cvss_score = ?, last_seen = ?, " +
                            "plugin_id = ?, plugin_name = ?, description = ?, solution = ?, " +
                            "vendor_reference = ?, vendor = ?, vulnerability_date = ?, state = ? " +
                            "WHERE unique_key = ?", [
                            importId, currentDate, mapped.hostname, mapped.ipAddress, mapped.cve,
                            mapped.severity, mapped.vprScore, mapped.cvssScore, mapped.lastSeen,
                            mapped.pluginId, mapped.pluginName, mapped.description, mapped.solution,
                            mapped.vendor, mapped.vendor, mapped.pluginPublished, mapped.state,
                            uniqueKey
                        ], (err) => {
                            if (err) {
                                console.error("Current table update error:", err);
                            } else {
                                updateCount++;
                            }
                            processNextRow(index + 1); // Continue to next row
                        });
                    } else {
                        // Insert new vulnerability
                        db.run("INSERT INTO vulnerabilities_current " +
                            "(import_id, scan_date, hostname, ip_address, cve, severity, vpr_score, cvss_score, " +
                             "first_seen, last_seen, plugin_id, plugin_name, description, solution, " +
                             "vendor_reference, vendor, vulnerability_date, state, unique_key)" +
                            "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", [
                            importId, currentDate, mapped.hostname, mapped.ipAddress, mapped.cve,
                            mapped.severity, mapped.vprScore, mapped.cvssScore,
                            mapped.firstSeen || currentDate, // Use current date as first_seen if not provided
                            mapped.lastSeen, mapped.pluginId, mapped.pluginName, mapped.description,
                            mapped.solution, mapped.vendor, mapped.vendor, mapped.pluginPublished,
                            mapped.state, uniqueKey
                        ], (err) => {
                            if (err) {
                                console.error("Current table insert error:", err);
                            } else {
                                insertCount++;
                            }
                            processNextRow(index + 1); // Continue to next row
                        });
                    }
                });
            });
        }

        // Start processing from the first row
        processNextRow(0);
        
        function finalizeBatch() {
            // Step 3: Remove vulnerabilities that are no longer present (haven't been updated in this scan)
            db.run("DELETE FROM vulnerabilities_current WHERE last_seen < ?", [currentDate], function(err) {
                const removedCount = this.changes || 0;
                if (err) {
                    console.error("Error removing stale vulnerabilities:", err);
                } else {
                    console.log("Removed", removedCount, "stale vulnerabilities from current table");
                }
                
                // Step 4: Calculate and store daily totals
                calculateAndStoreDailyTotals(currentDate, () => {
                    // Clean up file
                    try {
                        if (filePath && fs.existsSync(filePath)) {
                            PathValidator.safeUnlinkSync(filePath);
                        }
                    } catch (unlinkError) {
                        console.error("Error cleaning up file:", unlinkError);
                    }
                    
                    // Send success response
                    const finalResponse = {
                        ...responseData,
                        rowsProcessed: rows.length,
                        insertCount,
                        updateCount,
                        scanDate: currentDate,
                        rolloverComplete: true,
                        removedStale: removedCount
                    };
                    
                    console.log("Import completed:", finalResponse);
                    res.json(finalResponse);
                });
            });
        }
    });
}

// ✅ BULK STAGING LOADER - Session 2 Performance Enhancement
function bulkLoadToStagingTable(rows, importId, scanDate, filePath, responseData, sessionId, startTime) {
    const loadStart = Date.now();
    console.log(`🚀 BULK LOAD: Starting bulk insert of ${rows.length} rows to staging table`);
    
    // Prepare batch INSERT statement for staging table
    const stagingInsertSQL = `
        INSERT INTO vulnerability_staging (
            import_id, hostname, ip_address, cve, severity, vpr_score, cvss_score,
            plugin_id, plugin_name, description, solution, vendor_reference, vendor,
            vulnerability_date, state, raw_csv_row
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    // ✅ TRANSACTION WRAPPING FOR PERFORMANCE
    db.serialize(() => {
        db.run("BEGIN TRANSACTION", (err) => {
            if (err) {
                console.error("Error starting transaction:", err);
                progressTracker.errorSession(sessionId, "Transaction start failed", { error: err });
                return;
            }
            
            console.log("💾 Transaction started - bulk inserting rows");
            progressTracker.updateProgress(sessionId, 25, "Inserting rows into staging table...", { currentStep: 2 });
            
            const stmt = db.prepare(stagingInsertSQL);
            let insertedCount = 0;
            let errorCount = 0;
            const errors = [];
            const totalRows = rows.length;
            
            // Process all rows in the transaction
            rows.forEach((row, index) => {
                try {
                    // Map CSV row to staging table structure
                    const mapped = mapVulnerabilityRow(row);
                    
                    stmt.run([
                        importId,
                        mapped.hostname,
                        mapped.ipAddress,
                        mapped.cve,
                        mapped.severity,
                        mapped.vprScore,
                        mapped.cvssScore,
                        mapped.pluginId,
                        mapped.pluginName,
                        mapped.description,
                        mapped.solution,
                        mapped.vendor,
                        mapped.vendor,
                        mapped.pluginPublished,
                        mapped.state,
                        JSON.stringify(row) // Store raw CSV row for flexibility
                    ], function(err) {
                        if (err) {
                            console.error(`Row ${index + 1} insert error:`, err);
                            errors.push(`Row ${index + 1}: ${err.message}`);
                            errorCount++;
                        } else {
                            insertedCount++;
                            
                            // Update progress every 100 rows or on completion
                            if (insertedCount % 100 === 0 || insertedCount === totalRows) {
                                const progress = 25 + ((insertedCount / totalRows) * 35); // 25-60% range
                                progressTracker.updateProgress(sessionId, progress, 
                                    `Inserted ${insertedCount}/${totalRows} rows to staging table...`, { 
                                    currentStep: 2, 
                                    insertedCount,
                                    totalRows 
                                });
                            }
                        }
                    });
                } catch (error) {
                    console.error(`Row ${index + 1} mapping error:`, error);
                    errors.push(`Row ${index + 1}: ${error.message}`);
                    errorCount++;
                }
            });
            
            // Finalize the prepared statement and commit transaction
            stmt.finalize((err) => {
                if (err) {
                    console.error("Error finalizing statement:", err);
                    db.run("ROLLBACK", () => {
                        progressTracker.errorSession(sessionId, "Staging insert failed", { error: err, errorCount, errors });
                    });
                    return;
                }
                
                // Commit the transaction
                db.run("COMMIT", (err) => {
                    if (err) {
                        console.error("Error committing transaction:", err);
                        progressTracker.errorSession(sessionId, "Transaction commit failed", { error: err });
                        return;
                    }
                    
                    const loadTime = Date.now() - loadStart;
                    const rowsPerSecond = insertedCount / (loadTime / 1000);
                    
                    console.log(`✅ BULK LOAD COMPLETE: ${insertedCount}/${rows.length} rows inserted in ${loadTime}ms (${rowsPerSecond.toFixed(1)} rows/sec)`);
                    
                    // Update progress: Staging complete, starting final processing
                    progressTracker.updateProgress(sessionId, 60, 
                        `Staging complete. Processing ${insertedCount} rows to final tables...`, { 
                        currentStep: 3, 
                        insertedToStaging: insertedCount,
                        loadTime,
                        rowsPerSecond: parseFloat(rowsPerSecond.toFixed(1))
                    });
                    
                    // Clean up file immediately after staging
                    try {
                        if (filePath && PathValidator.safeExistsSync(filePath)) {
                            PathValidator.safeUnlinkSync(filePath);
                            console.log("🗑️  Source file cleaned up");
                        }
                    } catch (unlinkError) {
                        console.error("Error cleaning up file:", unlinkError);
                    }
                    
                    // ✅ NOW PROCESS FROM STAGING TO FINAL TABLES
                    processStagingToFinalTables(importId, scanDate, {
                        ...responseData,
                        bulkLoadTime: loadTime,
                        bulkLoadRowsPerSecond: parseFloat(rowsPerSecond.toFixed(1)),
                        insertedToStaging: insertedCount,
                        stagingErrors: errorCount
                    }, sessionId, startTime); // Pass sessionId instead of res
                });
            });
        });
    });
}

// ✅ BATCH PROCESSOR - Session 2 Performance Enhancement  
// Process staging table to final tables in configurable batches
function processStagingToFinalTables(importId, scanDate, responseData, sessionId, startTime) {
    const _processStart = Date.now(); // Performance tracking (may be used in future metrics)
    const batchSize = 1000; // Process 1000 rows at a time
    const currentDate = scanDate;
    
    console.log("🔄 BATCH PROCESSOR: Starting batch processing from staging table");
    console.log(`📊 Batch Size: ${batchSize}, Import ID: ${importId}, Scan Date: ${currentDate}`);
    
    // Step 1: Mark all active vulnerabilities as potentially stale (grace period)
    const graceStart = Date.now();
    progressTracker.updateProgress(sessionId, 65, "Preparing existing vulnerabilities for update...", { currentStep: 3 });
    
    db.run("UPDATE vulnerabilities_current SET lifecycle_state = 'grace_period' WHERE lifecycle_state = 'active'", (err) => {
        if (err) {
            console.error("Error marking vulnerabilities as stale:", err);
            progressTracker.errorSession(sessionId, "Failed to prepare for batch processing", { error: err });
            return;
        }
        
        console.log(`⏱️  Grace period update took ${Date.now() - graceStart}ms`);
        
        // Step 2: Get total count for batch processing
        db.get("SELECT COUNT(*) as total FROM vulnerability_staging WHERE import_id = ? AND processed = 0", 
            [importId], (err, countResult) => {
            if (err) {
                console.error("Error counting staging records:", err);
                progressTracker.errorSession(sessionId, "Failed to count staging records", { error: err });
                return;
            }
            
            const totalRows = countResult.total;
            const totalBatches = Math.ceil(totalRows / batchSize);
            
            console.log(`📈 Processing ${totalRows} rows in ${totalBatches} batches`);
            
            // Update progress: Starting batch processing
            progressTracker.updateProgress(sessionId, 70, `Processing ${totalRows} rows in ${totalBatches} batches...`, { 
                currentStep: 3, 
                totalRows, 
                totalBatches 
            });
            
            // Initialize batch processing stats
            const batchStats = {
                processedRows: 0,
                insertedToCurrent: 0,
                updatedInCurrent: 0,
                insertedToSnapshots: 0,
                errors: 0,
                currentBatch: 0,
                totalBatches,
                startTime: Date.now()
            };
            
            // Start batch processing
            processNextBatch(importId, currentDate, batchSize, batchStats, responseData, sessionId, startTime);
        });
    });
}

// Process batches sequentially to maintain data integrity
function processNextBatch(importId, currentDate, batchSize, batchStats, responseData, sessionId, startTime) {
    if (batchStats.currentBatch >= batchStats.totalBatches) {
        // All batches processed - finalize
        finalizeBatchProcessing(importId, currentDate, batchStats, responseData, sessionId, startTime);
        return;
    }
    
    const batchStart = Date.now();
    batchStats.currentBatch++;
    
    // Update progress for this batch
    const batchProgress = 70 + ((batchStats.currentBatch / batchStats.totalBatches) * 25); // 70-95% range
    progressTracker.updateProgress(sessionId, batchProgress, 
        `Processing batch ${batchStats.currentBatch}/${batchStats.totalBatches}...`, { 
        currentStep: 3, 
        currentBatch: batchStats.currentBatch,
        totalBatches: batchStats.totalBatches,
        processedRows: batchStats.processedRows
    });
    
    // Get next batch of unprocessed records
    const selectBatchSQL = `
        SELECT * FROM vulnerability_staging 
        WHERE import_id = ? AND processed = 0 
        ORDER BY id 
        LIMIT ?
    `;
    
    db.all(selectBatchSQL, [importId, batchSize], (err, batchRows) => {
        if (err) {
            console.error("Error selecting batch:", err);
            batchStats.errors++;
            processNextBatch(importId, currentDate, batchSize, batchStats, responseData, sessionId, startTime);
            return;
        }
        
        if (batchRows.length === 0) {
            // No more rows to process
            finalizeBatchProcessing(importId, currentDate, batchStats, responseData, sessionId, startTime);
            return;
        }
        
        console.log(`🔄 Processing batch ${batchStats.currentBatch}/${batchStats.totalBatches} (${batchRows.length} rows)`);
        
        // Process this batch using transaction
        db.serialize(() => {
            db.run("BEGIN TRANSACTION", (txErr) => {
                if (txErr) {
                    console.error("Batch transaction error:", txErr);
                    batchStats.errors++;
                    processNextBatch(importId, currentDate, batchSize, batchStats, responseData, sessionId, startTime);
                    return;
                }
                
                // Process each row in the batch
                let batchProcessed = 0;
                const processedIds = [];
                
                batchRows.forEach((row, _index) => {
                    // Generate unique keys using existing logic
                    const enhancedKey = generateEnhancedUniqueKey(row);
                    const legacyKey = generateUniqueKey(row);
                    const confidence = calculateDeduplicationConfidence(enhancedKey);
                    const tier = getDeduplicationTier(enhancedKey);
                    
                    // Insert to snapshots first
                    const snapshotInsert = `
                        INSERT INTO vulnerability_snapshots (
                            import_id, scan_date, hostname, ip_address, cve, severity, 
                            vpr_score, cvss_score, first_seen, last_seen, plugin_id, 
                            plugin_name, description, solution, vendor_reference, vendor, 
                            vulnerability_date, state, unique_key, enhanced_unique_key, 
                            confidence_score, dedup_tier
                        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    `;
                    
                    db.run(snapshotInsert, [
                        importId, currentDate, row.hostname, row.ip_address, row.cve,
                        row.severity, row.vpr_score, row.cvss_score, row.vulnerability_date || currentDate,
                        currentDate, row.plugin_id, row.plugin_name, row.description,
                        row.solution, row.vendor_reference, row.vendor, row.vulnerability_date,
                        row.state, legacyKey, enhancedKey, confidence, tier
                    ], function(snapErr) {
                        if (snapErr) {
                            console.error(`Snapshot insert error for row ${row.id}:`, snapErr);
                            batchStats.errors++;
                        } else {
                            batchStats.insertedToSnapshots++;
                        }
                        
                        // Check if exists in current table
                        const checkExisting = `
                            SELECT id, lifecycle_state FROM vulnerabilities_current 
                            WHERE unique_key = ? OR enhanced_unique_key = ?
                        `;
                        
                        db.get(checkExisting, [legacyKey, enhancedKey], (checkErr, existing) => {
                            if (checkErr) {
                                console.error(`Check existing error for row ${row.id}:`, checkErr);
                                batchStats.errors++;
                            } else if (existing) {
                                // Update existing
                                const updateCurrent = `
                                    UPDATE vulnerabilities_current SET
                                        import_id = ?, scan_date = ?, hostname = ?, ip_address = ?, 
                                        cve = ?, severity = ?, vpr_score = ?, cvss_score = ?,
                                        last_seen = ?, plugin_id = ?, plugin_name = ?, 
                                        description = ?, solution = ?, vendor_reference = ?,
                                        vendor = ?, vulnerability_date = ?, state = ?,
                                        lifecycle_state = 'active', enhanced_unique_key = ?,
                                        confidence_score = ?, dedup_tier = ?
                                    WHERE id = ?
                                `;
                                
                                db.run(updateCurrent, [
                                    importId, currentDate, row.hostname, row.ip_address, row.cve,
                                    row.severity, row.vpr_score, row.cvss_score, currentDate,
                                    row.plugin_id, row.plugin_name, row.description, row.solution,
                                    row.vendor_reference, row.vendor, row.vulnerability_date,
                                    row.state, enhancedKey, confidence, tier, existing.id
                                ], (updateErr) => {
                                    if (updateErr) {
                                        console.error(`Current update error for row ${row.id}:`, updateErr);
                                        batchStats.errors++;
                                    } else {
                                        batchStats.updatedInCurrent++;
                                    }
                                    finalizeBatchRow();
                                });
                            } else {
                                // Insert new
                                const insertCurrent = `
                                    INSERT INTO vulnerabilities_current (
                                        import_id, scan_date, hostname, ip_address, cve, severity,
                                        vpr_score, cvss_score, first_seen, last_seen, plugin_id,
                                        plugin_name, description, solution, vendor_reference, vendor,
                                        vulnerability_date, state, unique_key, lifecycle_state,
                                        enhanced_unique_key, confidence_score, dedup_tier
                                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active', ?, ?, ?)
                                `;
                                
                                db.run(insertCurrent, [
                                    importId, currentDate, row.hostname, row.ip_address, row.cve,
                                    row.severity, row.vpr_score, row.cvss_score, 
                                    row.vulnerability_date || currentDate, currentDate, row.plugin_id,
                                    row.plugin_name, row.description, row.solution, row.vendor_reference,
                                    row.vendor, row.vulnerability_date, row.state, legacyKey,
                                    enhancedKey, confidence, tier
                                ], (insertErr) => {
                                    if (insertErr) {
                                        console.error(`Current insert error for row ${row.id}:`, insertErr);
                                        batchStats.errors++;
                                    } else {
                                        batchStats.insertedToCurrent++;
                                    }
                                    finalizeBatchRow();
                                });
                            }
                        });
                    });
                    
                    function finalizeBatchRow() {
                        batchProcessed++;
                        processedIds.push(row.id);
                        
                        if (batchProcessed === batchRows.length) {
                            // Mark batch as processed
                            const updateProcessed = `UPDATE vulnerability_staging SET processed = 1, processed_at = ? WHERE id IN (${processedIds.map(() => "?").join(",")})`;
                            db.run(updateProcessed, [new Date().toISOString(), ...processedIds], (markErr) => {
                                if (markErr) {
                                    console.error("Error marking batch as processed:", markErr);
                                }
                                
                                // Commit batch transaction
                                db.run("COMMIT", (commitErr) => {
                                    if (commitErr) {
                                        console.error("Batch commit error:", commitErr);
                                        batchStats.errors++;
                                    }
                                    
                                    const batchTime = Date.now() - batchStart;
                                    const batchRowsPerSec = batchRows.length / (batchTime / 1000);
                                    batchStats.processedRows += batchRows.length;
                                    
                                    console.log(`✅ Batch ${batchStats.currentBatch} complete: ${batchRows.length} rows in ${batchTime}ms (${batchRowsPerSec.toFixed(1)} rows/sec)`);
                                    
                                    // Process next batch
                                    setTimeout(() => {
                                        processNextBatch(importId, currentDate, batchSize, batchStats, responseData, sessionId, startTime);
                                    }, 10); // Small delay to prevent overwhelming the system
                                });
                            });
                        }
                    }
                });
            });
        });
    });
}

// Finalize batch processing and clean up staging table
function finalizeBatchProcessing(importId, currentDate, batchStats, responseData, sessionId, startTime) {
    console.log("🏁 FINALIZE: Starting batch processing finalization");
    
    // Update progress: Starting finalization
    progressTracker.updateProgress(sessionId, 95, "Finalizing import and cleaning up...", { 
        currentStep: 3, 
        processedRows: batchStats.processedRows,
        insertedToCurrent: batchStats.insertedToCurrent,
        updatedInCurrent: batchStats.updatedInCurrent
    });
    
    // Step 1: Handle vulnerabilities still in grace_period (mark as resolved)
    db.run("UPDATE vulnerabilities_current SET " +
        "lifecycle_state = 'resolved', resolved_date = ?, resolution_reason = 'not_present_in_scan' " +
        "WHERE lifecycle_state = 'grace_period'", [currentDate], function(err) {
        
        const resolvedCount = this.changes || 0;
        if (err) {
            console.error("Error resolving stale vulnerabilities:", err);
        } else {
            console.log(`✅ Resolved ${resolvedCount} vulnerabilities not present in current scan`);
        }
        
        // Step 2: Calculate and store enhanced daily totals
        calculateAndStoreDailyTotalsEnhanced(currentDate, () => {
            // Step 3: Clean up staging table for this import
            db.run("DELETE FROM vulnerability_staging WHERE import_id = ?", [importId], function(cleanupErr) {
                if (cleanupErr) {
                    console.error("Error cleaning up staging table:", cleanupErr);
                } else {
                    console.log(`🗑️  Staging cleanup: ${this.changes} records removed`);
                }
                
                // Step 4: Update import record with final processing time
                const totalImportTime = Date.now() - startTime;
                db.run("UPDATE vulnerability_imports SET processing_time = ? WHERE id = ?", 
                    [totalImportTime, importId], (updateErr) => {
                    if (updateErr) {
                        console.error("Error updating import record:", updateErr);
                    }
                    
                    // Calculate final performance metrics
                    const totalTime = Date.now() - startTime;
                    const totalTimeSeconds = totalTime / 1000;
                    const overallRowsPerSecond = batchStats.processedRows / totalTimeSeconds;
                    const batchProcessTime = Date.now() - batchStats.startTime;
                    
                    console.log("🎉 STAGING IMPORT COMPLETE - PERFORMANCE SUMMARY:");
                    console.log(`⏱️  Total Import Time: ${totalTimeSeconds.toFixed(1)}s`);
                    console.log(`⚡ Overall Speed: ${overallRowsPerSecond.toFixed(1)} rows/second`);
                    console.log(`📊 Batch Processing: ${batchProcessTime}ms for ${batchStats.processedRows} rows`);
                    console.log("💾 Database Operations:");
                    console.log(`   📥 Snapshots: ${batchStats.insertedToSnapshots}`);
                    console.log(`   ➕ Inserted: ${batchStats.insertedToCurrent}`);
                    console.log(`   ✏️  Updated: ${batchStats.updatedInCurrent}`);
                    console.log(`   🔄 Resolved: ${resolvedCount}`);
                    console.log(`❌ Errors: ${batchStats.errors}`);
                    
                    // Send comprehensive success response
                    const finalResponse = {
                        ...responseData,
                        rowsProcessed: batchStats.processedRows,
                        inserted: batchStats.insertedToCurrent,
                        updated: batchStats.updatedInCurrent,
                        resolvedCount,
                        scanDate: currentDate,
                        rolloverComplete: true,
                        enhancedLifecycle: true,
                        enhancedDeduplication: true,
                        stagingMode: true,
                        
                        // ✅ ENHANCED PERFORMANCE METRICS
                        performanceMetrics: {
                            totalImportTimeMs: totalTime,
                            totalImportTimeSeconds: parseFloat(totalTimeSeconds.toFixed(1)),
                            overallRowsPerSecond: parseFloat(overallRowsPerSecond.toFixed(1)),
                            batchProcessTimeMs: batchProcessTime,
                            
                            stagingMetrics: {
                                bulkLoadTime: responseData.bulkLoadTime || 0,
                                bulkLoadRowsPerSecond: responseData.bulkLoadRowsPerSecond || 0,
                                insertedToStaging: responseData.insertedToStaging || 0,
                                stagingErrors: responseData.stagingErrors || 0
                            },
                            
                            batchMetrics: {
                                totalBatches: batchStats.totalBatches,
                                batchSize: 1000,
                                batchProcessingTimeMs: batchProcessTime,
                                avgBatchTime: Math.round(batchProcessTime / batchStats.totalBatches),
                                batchRowsPerSecond: parseFloat((batchStats.processedRows / (batchProcessTime / 1000)).toFixed(1))
                            },
                            
                            dbOperations: {
                                snapshotInserts: batchStats.insertedToSnapshots,
                                currentInserts: batchStats.insertedToCurrent,
                                currentUpdates: batchStats.updatedInCurrent,
                                resolved: resolvedCount,
                                errors: batchStats.errors
                            }
                        }
                    };
                    
                    console.log("✅ Enhanced staging import completed:", JSON.stringify(finalResponse, null, 2));
                    
                    // Complete the progress session with final results
                    progressTracker.completeSession(sessionId, "CSV import completed successfully", {
                        ...finalResponse,
                        totalProcessingTime: Date.now() - startTime
                    });
                });
            });
        });
    });
}

// Enhanced vulnerability rollover with lifecycle management
function processVulnerabilityRowsWithEnhancedLifecycle(rows, stmt, importId, filePath, responseData, res, scanDate) {
    const currentDate = scanDate || new Date().toISOString().split("T")[0];
    
    // ✅ PERFORMANCE INSTRUMENTATION - Session 1 Enhancement
    const perfStart = Date.now();
    const memoryStart = process.memoryUsage();
    console.log("🚀 PERFORMANCE: Starting enhanced rollover import");
    console.log(`📊 PERFORMANCE: Scan date: ${currentDate}, Rows: ${rows.length}`);
    console.log(`🧠 MEMORY START: ${Math.round(memoryStart.heapUsed / 1024 / 1024)}MB heap, ${Math.round(memoryStart.rss / 1024 / 1024)}MB RSS`);
    
    // Step 1: Mark all active vulnerabilities as potentially stale (grace period)
    const graceStart = Date.now();
    db.run("UPDATE vulnerabilities_current SET lifecycle_state = 'grace_period' WHERE lifecycle_state = 'active'", (err) => {
        if (err) {
            console.error("Error marking vulnerabilities as stale:", err);
            res.status(500).json({ error: "Failed to prepare for import" });
            return;
        }
        
        console.log(`⏱️  PERFORMANCE: Grace period update took ${Date.now() - graceStart}ms`);
        
        // Step 2: Process new vulnerability data with enhanced deduplication
        const processedKeys = new Set();
        const legacyProcessedKeys = new Set(); // Track legacy keys too for transition
        const stats = {
            inserted: 0,
            updated: 0,
            reopened: 0,
            duplicate_skipped: 0,
            enhanced_dedup_used: 0,
            legacy_dedup_used: 0
        };
        
        // ✅ PERFORMANCE TRACKING VARIABLES
        const perfStats = {
            dbOperations: 0,
            snapshotInserts: 0,
            currentChecks: 0,
            currentUpdates: 0,
            currentInserts: 0,
            totalDbTime: 0,
            avgRowTime: 0,
            processedRows: 0,
            startTime: Date.now()
        };
        
        let finalizeCalled = false;
        
        if (rows.length === 0) {
            finalizeEnhancedRollover();
            return;
        }
        
        // Process rows sequentially to prevent race conditions
        function processNextRow(index) {
            if (index >= rows.length) {
                if (!finalizeCalled) {
                    finalizeCalled = true;
                    finalizeEnhancedRollover();
                }
                return;
            }
            
            // ✅ PERFORMANCE: Track per-row timing and operations
            const rowStart = Date.now();
            perfStats.processedRows++;
            
            // Progress logging every 100 rows or every 10% for smaller datasets
            const progressInterval = Math.max(100, Math.floor(rows.length / 10));
            if (index % progressInterval === 0 && index > 0) {
                const elapsed = (Date.now() - perfStats.startTime) / 1000;
                const rowsPerSecond = perfStats.processedRows / elapsed;
                const memNow = process.memoryUsage();
                const memUsageMB = Math.round(memNow.heapUsed / 1024 / 1024);
                const etaSeconds = Math.round((rows.length - index) / rowsPerSecond);
                
                console.log(`📈 PROGRESS: ${index}/${rows.length} (${Math.round(index/rows.length*100)}%) - ${rowsPerSecond.toFixed(1)} rows/sec - ETA: ${etaSeconds}s - Memory: ${memUsageMB}MB`);
                console.log(`🔍 DB STATS: ${perfStats.dbOperations} ops, Avg: ${(perfStats.totalDbTime/perfStats.dbOperations || 0).toFixed(1)}ms per op`);
            }
            
            const row = rows[index];
            const mapped = mapVulnerabilityRow(row);
            
            // Generate both enhanced and legacy keys for transition
            const enhancedKey = generateEnhancedUniqueKey(mapped);
            const legacyKey = generateUniqueKey(mapped);
            const confidence = calculateDeduplicationConfidence(enhancedKey);
            const tier = getDeduplicationTier(enhancedKey);
            
            // Use enhanced key as primary, legacy as fallback during transition
            mapped.lastSeen = currentDate;
            
            // Skip duplicates within same batch (check both key types)
            if (processedKeys.has(enhancedKey) || legacyProcessedKeys.has(legacyKey)) {
                stats.duplicate_skipped++;
                processNextRow(index + 1);
                return;
            }
            processedKeys.add(enhancedKey);
            legacyProcessedKeys.add(legacyKey);
            
            // Track which deduplication method was used
            if (enhancedKey !== legacyKey) {
                stats.enhanced_dedup_used++;
            } else {
                stats.legacy_dedup_used++;
            }
            
            // Insert into snapshots (historical record) with enhanced fields
            const snapshotStart = Date.now();
            perfStats.dbOperations++;
            db.run("INSERT INTO vulnerability_snapshots " +
                "(import_id, scan_date, hostname, ip_address, cve, severity, vpr_score, cvss_score, " +
                " first_seen, last_seen, plugin_id, plugin_name, description, solution, " +
                " vendor_reference, vendor, vulnerability_date, state, unique_key, " +
                " enhanced_unique_key, confidence_score, dedup_tier)" +
                "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", [
                importId, currentDate, mapped.hostname, mapped.ipAddress, mapped.cve,
                mapped.severity, mapped.vprScore, mapped.cvssScore, mapped.firstSeen,
                currentDate, mapped.pluginId, mapped.pluginName, mapped.description,
                mapped.solution, mapped.vendor, mapped.vendor, mapped.pluginPublished,
                mapped.state, legacyKey, enhancedKey, confidence, tier
            ], (err) => {
                const snapshotTime = Date.now() - snapshotStart;
                perfStats.totalDbTime += snapshotTime;
                perfStats.snapshotInserts++;
                
                if (err) {
                    console.error("Snapshot insert error:", err);
                }
                
                // Check existing vulnerability state using both keys during transition
                const checkStart = Date.now();
                perfStats.dbOperations++;
                const checkQuery = `
                    SELECT id, first_seen, lifecycle_state, resolved_date, unique_key, enhanced_unique_key 
                    FROM vulnerabilities_current 
                    WHERE unique_key = ? OR enhanced_unique_key = ? OR enhanced_unique_key = ? OR unique_key = ?
                `;
                
                db.get(checkQuery, [legacyKey, enhancedKey, legacyKey, enhancedKey], (err, existingRow) => {
                    const checkTime = Date.now() - checkStart;
                    perfStats.totalDbTime += checkTime;
                    perfStats.currentChecks++;
                    
                    if (err) {
                        console.error("Error checking existing vulnerability:", err);
                        processNextRow(index + 1);
                        return;
                    }
                    
                    if (existingRow) {
                        // Determine lifecycle transition
                        let newState = "active";
                        const resolutionReason = null;
                        
                        if (existingRow.lifecycle_state === "resolved") {
                            newState = "reopened";
                            stats.reopened++;
                        } else {
                            stats.updated++;
                        }
                        
                        // Update existing vulnerability with enhanced fields
                        const updateStart = Date.now();
                        perfStats.dbOperations++;
                        db.run("UPDATE vulnerabilities_current SET " +
                            "import_id = ?, scan_date = ?, hostname = ?, ip_address = ?, cve = ?, " +
                            "severity = ?, vpr_score = ?, cvss_score = ?, last_seen = ?, " +
                            "plugin_id = ?, plugin_name = ?, description = ?, solution = ?, " +
                            "vendor_reference = ?, vendor = ?, vulnerability_date = ?, state = ?, " +
                            "lifecycle_state = ?, resolved_date = ?, resolution_reason = ?, " +
                            "enhanced_unique_key = ?, confidence_score = ?, dedup_tier = ? " +
                            "WHERE id = ?", [
                            importId, currentDate, mapped.hostname, mapped.ipAddress, mapped.cve,
                            mapped.severity, mapped.vprScore, mapped.cvssScore, currentDate,
                            mapped.pluginId, mapped.pluginName, mapped.description, mapped.solution,
                            mapped.vendor, mapped.vendor, mapped.pluginPublished, mapped.state,
                            newState, null, resolutionReason, enhancedKey, confidence, tier, existingRow.id
                        ], (err) => {
                            const updateTime = Date.now() - updateStart;
                            perfStats.totalDbTime += updateTime;
                            perfStats.currentUpdates++;
                            
                            if (err) {
                                console.error("Current table update error:", err);
                            }
                            
                            // ✅ PERFORMANCE: Complete row timing
                            const totalRowTime = Date.now() - rowStart;
                            perfStats.avgRowTime = ((perfStats.avgRowTime * (perfStats.processedRows - 1)) + totalRowTime) / perfStats.processedRows;
                            
                            processNextRow(index + 1);
                        });
                    } else {
                        // Insert new vulnerability with enhanced fields
                        const insertStart = Date.now();
                        perfStats.dbOperations++;
                        db.run("INSERT INTO vulnerabilities_current " +
                            "(import_id, scan_date, hostname, ip_address, cve, severity, vpr_score, cvss_score, " +
                             "first_seen, last_seen, plugin_id, plugin_name, description, solution, " +
                             "vendor_reference, vendor, vulnerability_date, state, unique_key, " +
                             "lifecycle_state, enhanced_unique_key, confidence_score, dedup_tier)" +
                            "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", [
                            importId, currentDate, mapped.hostname, mapped.ipAddress, mapped.cve,
                            mapped.severity, mapped.vprScore, mapped.cvssScore,
                            mapped.firstSeen || currentDate, currentDate, mapped.pluginId,
                            mapped.pluginName, mapped.description, mapped.solution, mapped.vendor,
                            mapped.vendor, mapped.pluginPublished, mapped.state, legacyKey,
                            "active", enhancedKey, confidence, tier
                        ], (err) => {
                            const insertTime = Date.now() - insertStart;
                            perfStats.totalDbTime += insertTime;
                            perfStats.currentInserts++;
                            
                            if (err) {
                                console.error("Current table insert error:", err);
                            } else {
                                stats.inserted++;
                            }
                            
                            // ✅ PERFORMANCE: Complete row timing
                            const totalRowTime = Date.now() - rowStart;
                            perfStats.avgRowTime = ((perfStats.avgRowTime * (perfStats.processedRows - 1)) + totalRowTime) / perfStats.processedRows;
                            
                            processNextRow(index + 1);
                        });
                    }
                });
            });
        }
        
        // Start processing from the first row
        processNextRow(0);
        
        function finalizeEnhancedRollover() {
            // Step 3: Handle vulnerabilities still in grace_period (mark as resolved)
            db.run("UPDATE vulnerabilities_current SET " +
                "lifecycle_state = 'resolved', resolved_date = ?, resolution_reason = 'not_present_in_scan' " +
                "WHERE lifecycle_state = 'grace_period'", [currentDate], function(err) {
                
                const resolvedCount = this.changes || 0;
                if (err) {
                    console.error("Error resolving stale vulnerabilities:", err);
                } else {
                    console.log("Resolved", resolvedCount, "vulnerabilities not present in current scan");
                }
                
                // Step 4: Calculate and store enhanced daily totals
                calculateAndStoreDailyTotalsEnhanced(currentDate, () => {
                    // Clean up file
                    try {
                        if (filePath && PathValidator.safeExistsSync(filePath)) {
                            PathValidator.safeUnlinkSync(filePath);
                        }
                    } catch (unlinkError) {
                        console.error("Error cleaning up file:", unlinkError);
                    }
                    
                    // ✅ PERFORMANCE METRICS - Final Summary
                    const totalImportTime = Date.now() - perfStart;
                    const totalImportSeconds = totalImportTime / 1000;
                    const rowsPerSecond = rows.length / totalImportSeconds;
                    const memoryEnd = process.memoryUsage();
                    const memoryDelta = Math.round((memoryEnd.heapUsed - memoryStart.heapUsed) / 1024 / 1024);
                    const avgDbOpTime = perfStats.totalDbTime / perfStats.dbOperations;
                    
                    console.log("🎉 PERFORMANCE SUMMARY:");
                    console.log(`⏱️  Total Import Time: ${totalImportSeconds.toFixed(1)}s (${totalImportTime}ms)`);
                    console.log(`⚡ Processing Speed: ${rowsPerSecond.toFixed(1)} rows/second`);
                    console.log(`🧠 Memory Impact: ${memoryDelta > 0 ? "+" : ""}${memoryDelta}MB (End: ${Math.round(memoryEnd.heapUsed/1024/1024)}MB)`);
                    console.log(`💾 Database Operations: ${perfStats.dbOperations} total`);
                    console.log(`   📥 Snapshot Inserts: ${perfStats.snapshotInserts}`);
                    console.log(`   🔍 Current Checks: ${perfStats.currentChecks}`);
                    console.log(`   ✏️  Current Updates: ${perfStats.currentUpdates}`);
                    console.log(`   ➕ Current Inserts: ${perfStats.currentInserts}`);
                    console.log(`⏲️  Avg DB Operation: ${avgDbOpTime.toFixed(1)}ms`);
                    console.log(`📊 Avg Row Processing: ${perfStats.avgRowTime.toFixed(1)}ms`);
                    
                    // Send enhanced success response with performance metrics
                    const finalResponse = {
                        ...responseData,
                        rowsProcessed: rows.length,
                        ...stats,
                        resolvedCount,
                        scanDate: currentDate,
                        rolloverComplete: true,
                        enhancedLifecycle: true,
                        enhancedDeduplication: true,
                        // ✅ PERFORMANCE METRICS in response
                        performanceMetrics: {
                            totalImportTimeMs: totalImportTime,
                            totalImportTimeSeconds: parseFloat(totalImportSeconds.toFixed(1)),
                            rowsPerSecond: parseFloat(rowsPerSecond.toFixed(1)),
                            memoryDeltaMB: memoryDelta,
                            memoryEndMB: Math.round(memoryEnd.heapUsed/1024/1024),
                            dbOperations: {
                                total: perfStats.dbOperations,
                                snapshotInserts: perfStats.snapshotInserts,
                                currentChecks: perfStats.currentChecks,
                                currentUpdates: perfStats.currentUpdates,
                                currentInserts: perfStats.currentInserts,
                                avgTimeMs: parseFloat(avgDbOpTime.toFixed(1))
                            },
                            avgRowTimeMs: parseFloat(perfStats.avgRowTime.toFixed(1))
                        }
                    };
                    
                    console.log("Enhanced import completed:", finalResponse);
                    res.json(finalResponse);
                });
            });
        }
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

// Enhanced daily totals calculation with lifecycle states
function calculateAndStoreDailyTotalsEnhanced(scanDate, callback) {
    // Calculate totals from active vulnerabilities only (excluding resolved)
    const totalsQuery = `
        SELECT 
            severity,
            COUNT(*) as count,
            COALESCE(SUM(vpr_score), 0) as total_vpr,
            COUNT(CASE WHEN lifecycle_state = 'reopened' THEN 1 END) as reopened_count
        FROM vulnerabilities_current 
        WHERE scan_date = ? AND lifecycle_state IN ('active', 'reopened')
        GROUP BY severity
    `;
    
    db.all(totalsQuery, [scanDate], (err, results) => {
        if (err) {
            console.error("Error calculating enhanced daily totals:", err);
            callback();
            return;
        }
        
        // Get resolved count for the day
        db.get("SELECT COUNT(*) as resolved_count FROM vulnerabilities_current WHERE resolved_date = ?", 
            [scanDate], (err, resolvedResult) => {
            
            const resolvedCount = resolvedResult ? resolvedResult.resolved_count : 0;
            
            const totals = {
                critical_count: 0, critical_total_vpr: 0,
                high_count: 0, high_total_vpr: 0,
                medium_count: 0, medium_total_vpr: 0,
                low_count: 0, low_total_vpr: 0,
                total_vulnerabilities: 0, total_vpr: 0,
                resolved_count: resolvedCount,
                reopened_count: 0
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
                totals.reopened_count += row.reopened_count || 0;
            });
            
            // Store enhanced daily totals
            db.run(`INSERT OR REPLACE INTO vulnerability_daily_totals 
                (scan_date, critical_count, critical_total_vpr, high_count, high_total_vpr,
                 medium_count, medium_total_vpr, low_count, low_total_vpr, 
                 total_vulnerabilities, total_vpr, resolved_count, reopened_count)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, [
                scanDate,
                totals.critical_count, totals.critical_total_vpr,
                totals.high_count, totals.high_total_vpr,
                totals.medium_count, totals.medium_total_vpr,
                totals.low_count, totals.low_total_vpr,
                totals.total_vulnerabilities, totals.total_vpr,
                totals.resolved_count, totals.reopened_count
            ], (err) => {
                if (err) {
                    console.error("Error storing enhanced daily totals:", err);
                } else {
                    console.log(`Enhanced daily totals updated for ${scanDate}`);
                }
                callback();
            });
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

// Create HTTP server and Socket.io setup
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: ["http://localhost:8080", "http://127.0.0.1:8080"],
        methods: ["GET", "POST"],
        credentials: true
    },
    pingTimeout: 60000,
    pingInterval: 25000
});

// Initialize progress tracker
const progressTracker = new ProgressTracker(io);

// Socket.io connection handling
io.on("connection", (socket) => {
    console.log(`WebSocket client connected: ${socket.id}`);
    
    // Join progress room when client requests to track a session
    socket.on("join-progress", (sessionId) => {
        if (sessionId && typeof sessionId === "string") {
            socket.join(`progress-${sessionId}`);
            console.log(`Client ${socket.id} joined progress room: ${sessionId}`);
            
            // Send current session status if it exists
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
    
    // Leave progress room
    socket.on("leave-progress", (sessionId) => {
        if (sessionId && typeof sessionId === "string") {
            socket.leave(`progress-${sessionId}`);
            console.log(`Client ${socket.id} left progress room: ${sessionId}`);
        }
    });
    
    // Handle disconnection
    socket.on("disconnect", (reason) => {
        console.log(`WebSocket client disconnected: ${socket.id} (${reason})`);
    });
});

// Database setup
const dbPath = path.join(__dirname, "data", "hextrackr.db");
const db = new sqlite3.Database(dbPath);

// Middleware - Secure CORS Configuration
app.use(cors({
    origin: ["http://localhost:8080", "http://127.0.0.1:8080"],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
    credentials: true
}));

// Rate Limiting - DoS Protection
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: "Too many requests from this IP, please try again later.",
    standardHeaders: true,
    legacyHeaders: false,
});
app.use("/api/", limiter);

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
        // Try to read version from package.json, fallback to environment variable
        let version = "unknown";
        try {
            version = require("./package.json").version;
        } catch (packageError) {
            version = process.env.HEXTRACKR_VERSION || "unknown";
            console.log(`Using environment version: ${version} (package.json not found: ${packageError.message})`);
        }
        
        // Simple DB file existence check (non-blocking)
        const dbExists = PathValidator.safeExistsSync(dbPath);
        res.json({ status: "ok", version: version, db: dbExists, uptime: process.uptime() });
    } catch (error) {
        console.error("Health endpoint error:", error.message);
        res.json({ status: "ok", version: process.env.HEXTRACKR_VERSION || "unknown", db: false, uptime: process.uptime() });
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
      MIN(COALESCE(first_seen, scan_date)) as earliest,
      MAX(COALESCE(last_seen, scan_date)) as latest
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
  // Get previous data from vulnerability_daily_totals (most recent vs previous day)
  const previousQuery = `
    SELECT 
      scan_date,
      critical_count as critical_count, critical_total_vpr as critical_total_vpr,
      high_count as high_count, high_total_vpr as high_total_vpr,
      medium_count as medium_count, medium_total_vpr as medium_total_vpr,
      low_count as low_count, low_total_vpr as low_total_vpr
    FROM vulnerability_daily_totals 
    ORDER BY scan_date DESC 
    LIMIT 2
  `;

  db.all(previousQuery, [], (err, dailyTotalsRows) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      
      // Calculate trends
      const trends = {};
      
      // If we have daily totals history, use it for comparison
      let currentData = {};
      let previousData = {};
      
      if (dailyTotalsRows.length >= 1) {
        // Use the most recent daily total as "current"
        const currentRow = dailyTotalsRows[0];
        currentData = {
          "Critical": { count: currentRow.critical_count || 0, total_vpr: currentRow.critical_total_vpr || 0 },
          "High": { count: currentRow.high_count || 0, total_vpr: currentRow.high_total_vpr || 0 },
          "Medium": { count: currentRow.medium_count || 0, total_vpr: currentRow.medium_total_vpr || 0 },
          "Low": { count: currentRow.low_count || 0, total_vpr: currentRow.low_total_vpr || 0 }
        };
      }
      
      if (dailyTotalsRows.length >= 2) {
        // Use the second most recent daily total (previousData)
        const prevRow = dailyTotalsRows[1];
        previousData = {
          "Critical": { count: prevRow.critical_count || 0, total_vpr: prevRow.critical_total_vpr || 0 },
          "High": { count: prevRow.high_count || 0, total_vpr: prevRow.high_total_vpr || 0 },
          "Medium": { count: prevRow.medium_count || 0, total_vpr: prevRow.medium_total_vpr || 0 },
          "Low": { count: prevRow.low_count || 0, total_vpr: prevRow.low_total_vpr || 0 }
        };
      } else if (dailyTotalsRows.length === 1) {
        // First day of data, compare to zero
        previousData = {
          "Critical": { count: 0, total_vpr: 0 },
          "High": { count: 0, total_vpr: 0 },
          "Medium": { count: 0, total_vpr: 0 },
          "Low": { count: 0, total_vpr: 0 }
        };
      }
      
      // Build trends for each severity
      Object.keys(currentData).forEach(severity => {
        const current = currentData[severity];
        const prev = previousData[severity] || { count: 0, total_vpr: 0 };
        const currentVpr = Math.round((current.total_vpr || 0) * 100) / 100;
        trends[severity] = {
          current: { count: current.count, total_vpr: currentVpr },
          trend: {
            count_change: current.count - prev.count,
            vpr_change: Math.round((currentVpr - prev.total_vpr) * 100) / 100
          }
        };
      });
      
      res.json(trends);
    });
});

// Get historical trending data (last 14 days)
app.get("/api/vulnerabilities/trends", (req, res) => {
  // Get optional date range parameters from query string
  const { startDate, endDate } = req.query;
  
  let whereClause = "";
  let params = [];
  
  if (startDate && endDate) {
    whereClause = "WHERE scan_date >= ? AND scan_date <= ?";
    params = [startDate, endDate];
  } else if (startDate) {
    whereClause = "WHERE scan_date >= ?";
    params = [startDate];
  } else if (endDate) {
    whereClause = "WHERE scan_date <= ?";
    params = [endDate];
  }
  // No WHERE clause = return all data for ApexCharts to handle filtering
  
  const query = `
    SELECT 
      scan_date as date,
      critical_count, critical_total_vpr,
      high_count, high_total_vpr,
      medium_count, medium_total_vpr,
      low_count, low_total_vpr,
      total_vulnerabilities, total_vpr
    FROM vulnerability_daily_totals 
    ${whereClause}
    ORDER BY scan_date ASC
  `;
  
  db.all(query, params, (err, rows) => {
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
  
  // CRITICAL FIX: Always filter by lifecycle_state to show only active vulnerabilities
  const conditions = ["lifecycle_state IN (?, ?)"];
  params.push("active", "reopened");
  
  if (search) {
    conditions.push("(hostname LIKE ? OR cve LIKE ? OR plugin_name LIKE ?)");
    params.push(`%${search}%`, `%${search}%`, `%${search}%`);
  }
  if (severity) {
    conditions.push("severity = ?");
    params.push(severity);
  }
  
  whereClause = "WHERE " + conditions.join(" AND ");
  
  const query = `
    SELECT * FROM vulnerabilities_current 
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
    const countQuery = `SELECT COUNT(*) as total FROM vulnerabilities_current ${whereClause}`;
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

// Get resolved/fixed vulnerabilities (for troubleshooting and historical analysis)
app.get("/api/vulnerabilities/resolved", (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 50;
  const offset = (page - 1) * limit;
  const search = req.query.search || "";
  
  let whereClause = "";
  const params = [];
  
  // Show only resolved vulnerabilities
  const conditions = ["lifecycle_state = ?"];
  params.push("resolved");
  
  if (search) {
    conditions.push("(hostname LIKE ? OR cve LIKE ? OR plugin_name LIKE ?)");
    params.push(`%${search}%`, `%${search}%`, `%${search}%`);
  }
  
  whereClause = "WHERE " + conditions.join(" AND ");
  
  const query = `
    SELECT *, 
           resolved_date,
           resolution_reason,
           CASE 
             WHEN resolved_date IS NOT NULL THEN 'Fixed on ' || resolved_date
             ELSE 'Status unknown'
           END as resolution_summary
    FROM vulnerabilities_current 
    ${whereClause}
    ORDER BY resolved_date DESC, last_seen DESC 
    LIMIT ? OFFSET ?
  `;
  
  params.push(limit, offset);
  
  db.all(query, params, (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    
    // Get total count for pagination
    const countQuery = `SELECT COUNT(*) as total FROM vulnerabilities_current ${whereClause}`;
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
        },
        note: "These vulnerabilities were marked as resolved/fixed when they disappeared from scans"
      });
    });
  });
});

// Import CSV vulnerabilities
/**
 * Extract scan date from filename using various patterns
 * @param {string} filename - The CSV filename
 * @returns {string|null} - Date in YYYY-MM-DD format or null if no pattern matches
 */
function extractScanDateFromFilename(filename) {
    if (!filename) {return null;}
    
    const currentYear = new Date().getFullYear();
    
    // Pattern 1: Month abbreviations (aug28, sept01, etc.)
    const monthAbbrMatch = filename.match(/(jan|feb|mar|apr|may|jun|jul|aug|sep|sept|oct|nov|dec)(\d{1,2})/i);
    if (monthAbbrMatch) {
        const monthMap = {
            "jan": "01", "feb": "02", "mar": "03", "apr": "04", "may": "05", "jun": "06",
            "jul": "07", "aug": "08", "sep": "09", "sept": "09", "oct": "10", "nov": "11", "dec": "12"
        };
        const month = monthMap[monthAbbrMatch[1].toLowerCase()];
        const day = monthAbbrMatch[2].padStart(2, "0");
        return `${currentYear}-${month}-${day}`;
    }
    
    // Pattern 2: MM_DD_YYYY or MM-DD-YYYY format
    const numericDateMatch = filename.match(/(\d{1,2})[_-](\d{1,2})[_-](\d{4})/);
    if (numericDateMatch) {
        const month = numericDateMatch[1].padStart(2, "0");
        const day = numericDateMatch[2].padStart(2, "0"); 
        const year = numericDateMatch[3];
        return `${year}-${month}-${day}`;
    }
    
    // Pattern 3: YYYY-MM-DD format
    const isoDateMatch = filename.match(/(\d{4})[_-](\d{1,2})[_-](\d{1,2})/);
    if (isoDateMatch) {
        const year = isoDateMatch[1];
        const month = isoDateMatch[2].padStart(2, "0");
        const day = isoDateMatch[3].padStart(2, "0");
        return `${year}-${month}-${day}`;
    }
    
    // Pattern 4: Just day number (assume current month/year)
    const dayOnlyMatch = filename.match(/(\d{1,2})[^\d]/);
    if (dayOnlyMatch) {
        const day = dayOnlyMatch[1].padStart(2, "0");
        const month = String(new Date().getMonth() + 1).padStart(2, "0");
        return `${currentYear}-${month}-${day}`;
    }
    
    return null; // No date pattern found
}

app.post("/api/vulnerabilities/import", upload.single("csvFile"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }
  
  const startTime = Date.now();
  const filename = req.file.originalname;
  const vendor = req.body.vendor || "unknown";
  const extractedDate = extractScanDateFromFilename(filename);
  const scanDate = req.body.scanDate || extractedDate || new Date().toISOString().split("T")[0];
  
  // Log filename date extraction for debugging
  if (extractedDate) {
    console.log(`Extracted date '${extractedDate}' from filename '${filename}'`);
  } else if (!req.body.scanDate) {
    console.log(`No date extracted from filename '${filename}', using today's date`);
  }
  
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
        
        // Process rows using enhanced rollover architecture with lifecycle management
        processVulnerabilityRowsWithEnhancedLifecycle(rows, null, importId, req.file.path, {
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

// ✅ STAGING-BASED CSV IMPORT - Session 2 Performance Enhancement
// High-performance import using staging table for batch processing
app.post("/api/vulnerabilities/import-staging", upload.single("csvFile"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }
  
  const startTime = Date.now();
  const filename = req.file.originalname;
  const vendor = req.body.vendor || "unknown";
  const extractedDate = extractScanDateFromFilename(filename);
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
      totalSteps: 3, // 1. Parse CSV, 2. Load to staging, 3. Process to final tables
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
  
  // Update progress: Starting CSV parsing
  progressTracker.updateProgress(sessionId, 5, "Parsing CSV file...", { currentStep: 1 });
  
  // Read and parse CSV
  const csvData = PathValidator.safeReadFileSync(req.file.path, "utf8");
  
  Papa.parse(csvData, {
    header: true,
    complete: (results) => {
      const rows = results.data.filter(row => Object.values(row).some(val => val && val.trim()));
      
      // Update progress: CSV parsing completed
      progressTracker.updateProgress(sessionId, 15, `Parsed ${rows.length} rows from CSV`, { 
        currentStep: 1, 
        rowCount: rows.length 
      });
      
      console.log(`📈 Parsed ${rows.length} rows from CSV`);
      
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
        0, // Will update after completion
        JSON.stringify(results.meta.fields)
      ], function(err) {
        if (err) {
          progressTracker.errorSession(sessionId, "Failed to create import record: " + err.message, { error: err });
          console.error("Import record creation failed:", err);
          return;
        }
        
        const importId = this.lastID;
        console.log(`📝 Import record created: ID ${importId}`);
        
        // Update progress: Starting bulk load to staging
        progressTracker.updateProgress(sessionId, 20, "Loading data to staging table...", { 
          currentStep: 2, 
          importId: importId 
        });
        
        // ✅ BULK LOAD TO STAGING TABLE
        bulkLoadToStagingTable(rows, importId, scanDate, req.file.path, {
          success: true,
          importId,
          filename,
          vendor,
          scanDate,
          stagingMode: true
        }, sessionId, startTime); // Pass sessionId instead of res
      });
    },
    error: (error) => {
      progressTracker.errorSession(sessionId, "CSV parsing failed: " + error.message, { error: error });
      console.error("CSV parsing failed:", error);
    }
  });
});

// Clear all vulnerability data
app.delete("/api/vulnerabilities/clear", (req, res) => {
  db.serialize(() => {
    db.run("DELETE FROM ticket_vulnerabilities");
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

// Documentation statistics endpoint is implemented at line 938

// Clear data endpoint
app.delete("/api/backup/clear/:type", (req, res) => {
    const { type } = req.params;
    
    if (type === "all") {
        // For 'all', clear all rollover vulnerability tables and tickets
        db.run("DELETE FROM vulnerability_snapshots", (snapErr) => {
            if (snapErr) {
                res.status(500).json({ error: "Failed to clear vulnerability snapshots" });
                return;
            }
            
            db.run("DELETE FROM vulnerabilities_current", (currentErr) => {
                if (currentErr) {
                    res.status(500).json({ error: "Failed to clear current vulnerabilities" });
                    return;
                }
                
                db.run("DELETE FROM vulnerability_daily_totals", (dailyErr) => {
                    if (dailyErr) {
                        res.status(500).json({ error: "Failed to clear daily totals" });
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
            });
        });
        return; // Exit early since we're handling the response in the nested callbacks
    }
    
    if (type === "vulnerabilities") {
        // Clear all vulnerability rollover tables
        db.run("DELETE FROM vulnerability_snapshots", (snapErr) => {
            if (snapErr) {
                res.status(500).json({ error: "Failed to clear vulnerability snapshots" });
                return;
            }
            
            db.run("DELETE FROM vulnerabilities_current", (currentErr) => {
                if (currentErr) {
                    res.status(500).json({ error: "Failed to clear current vulnerabilities" });
                    return;
                }
                
                db.run("DELETE FROM vulnerability_daily_totals", (dailyErr) => {
                    if (dailyErr) {
                        res.status(500).json({ error: "Failed to clear daily totals" });
                        return;
                    }
                    
                    res.json({ message: "Vulnerabilities cleared successfully" });
                });
            });
        });
        return;
    }
    
    if (type === "tickets") {
        db.run("DELETE FROM tickets", (err) => {
            if (err) {
                res.status(500).json({ error: "Failed to clear tickets" });
                return;
            }
            
            res.json({ message: "Tickets cleared successfully" });
        });
        return;
    }
    
    res.status(400).json({ error: "Invalid data type" });
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

    // Enhanced deduplication schema columns for vulnerabilities_current table
    db.run("ALTER TABLE vulnerabilities_current ADD COLUMN lifecycle_state TEXT DEFAULT 'active'", (err) => {
      if (err && !err.message.includes("duplicate column")) {
        console.error("Error adding lifecycle_state column:", err.message);
      }
    });
    
    db.run("ALTER TABLE vulnerabilities_current ADD COLUMN resolved_date TEXT", (err) => {
      if (err && !err.message.includes("duplicate column")) {
        console.error("Error adding resolved_date column:", err.message);
      }
    });
    
    db.run("ALTER TABLE vulnerabilities_current ADD COLUMN resolution_reason TEXT", (err) => {
      if (err && !err.message.includes("duplicate column")) {
        console.error("Error adding resolution_reason column:", err.message);
      }
    });
    
    db.run("ALTER TABLE vulnerabilities_current ADD COLUMN confidence_score INTEGER DEFAULT 50", (err) => {
      if (err && !err.message.includes("duplicate column")) {
        console.error("Error adding confidence_score column:", err.message);
      }
    });
    
    db.run("ALTER TABLE vulnerabilities_current ADD COLUMN dedup_tier INTEGER DEFAULT 4", (err) => {
      if (err && !err.message.includes("duplicate column")) {
        console.error("Error adding dedup_tier column:", err.message);
      }
    });
    
    db.run("ALTER TABLE vulnerabilities_current ADD COLUMN enhanced_unique_key TEXT", (err) => {
      if (err && !err.message.includes("duplicate column")) {
        console.error("Error adding enhanced_unique_key column:", err.message);
      }
    });

    // Enhanced deduplication schema columns for vulnerability_snapshots table
    db.run("ALTER TABLE vulnerability_snapshots ADD COLUMN confidence_score INTEGER DEFAULT 50", (err) => {
      if (err && !err.message.includes("duplicate column")) {
        console.error("Error adding confidence_score column to snapshots:", err.message);
      }
    });
    
    db.run("ALTER TABLE vulnerability_snapshots ADD COLUMN dedup_tier INTEGER DEFAULT 4", (err) => {
      if (err && !err.message.includes("duplicate column")) {
        console.error("Error adding dedup_tier column to snapshots:", err.message);
      }
    });
    
    db.run("ALTER TABLE vulnerability_snapshots ADD COLUMN enhanced_unique_key TEXT", (err) => {
      if (err && !err.message.includes("duplicate column")) {
        console.error("Error adding enhanced_unique_key column to snapshots:", err.message);
      }
    });

    // Enhanced columns for vulnerability_daily_totals table
    db.run("ALTER TABLE vulnerability_daily_totals ADD COLUMN resolved_count INTEGER DEFAULT 0", (err) => {
      if (err && !err.message.includes("duplicate column")) {
        console.error("Error adding resolved_count column to daily totals:", err.message);
      }
    });
    
    db.run("ALTER TABLE vulnerability_daily_totals ADD COLUMN reopened_count INTEGER DEFAULT 0", (err) => {
      if (err && !err.message.includes("duplicate column")) {
        console.error("Error adding reopened_count column to daily totals:", err.message);
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

    // ✅ STAGING TABLE - Session 2 Performance Enhancement
    // Temporary table for bulk CSV import processing
    db.run(`CREATE TABLE IF NOT EXISTS vulnerability_staging (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      import_id INTEGER NOT NULL,
      
      -- Core vulnerability fields (from existing schema)
      hostname TEXT,
      ip_address TEXT,
      cve TEXT,
      severity TEXT,
      vpr_score REAL,
      cvss_score REAL,
      plugin_id TEXT,
      plugin_name TEXT,
      description TEXT,
      solution TEXT,
      vendor_reference TEXT,
      vendor TEXT,
      vulnerability_date TEXT,
      state TEXT,
      
      -- Extended fields for enhanced deduplication (from recent enhancements)
      enhanced_unique_key TEXT,
      confidence_score REAL,
      dedup_tier INTEGER,
      lifecycle_state TEXT DEFAULT 'staging',
      
      -- Raw CSV data for flexibility across vendors
      raw_csv_row JSON,
      
      -- Processing tracking
      processed BOOLEAN DEFAULT 0,
      batch_id INTEGER,
      processing_error TEXT,
      
      -- Timestamps
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      processed_at DATETIME,
      
      FOREIGN KEY (import_id) REFERENCES vulnerability_imports (id)
    )`, (err) => {
      if (err) {
        console.error("Error creating vulnerability_staging table:", err.message);
      } else {
        console.log("✅ vulnerability_staging table ready for batch processing");
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

    // Enhanced performance indexes for deduplication and lifecycle management
    db.run("CREATE INDEX IF NOT EXISTS idx_current_enhanced_unique_key ON vulnerabilities_current (enhanced_unique_key)", (err) => {
      if (err) {
        console.error("Error creating current enhanced_unique_key index:", err.message);
      }
    });

    db.run("CREATE INDEX IF NOT EXISTS idx_current_lifecycle_scan ON vulnerabilities_current (lifecycle_state, scan_date)", (err) => {
      if (err) {
        console.error("Error creating current lifecycle_scan index:", err.message);
      }
    });

    db.run("CREATE INDEX IF NOT EXISTS idx_snapshots_enhanced_key ON vulnerability_snapshots (enhanced_unique_key)", (err) => {
      if (err) {
        console.error("Error creating snapshots enhanced_unique_key index:", err.message);
      }
    });

    db.run("CREATE INDEX IF NOT EXISTS idx_current_confidence_tier ON vulnerabilities_current (confidence_score, dedup_tier)", (err) => {
      if (err) {
        console.error("Error creating current confidence_tier index:", err.message);
      }
    });

    db.run("CREATE INDEX IF NOT EXISTS idx_current_active_severity ON vulnerabilities_current (lifecycle_state, severity)", (err) => {
      if (err) {
        console.error("Error creating current active_severity index:", err.message);
      }
    });

    db.run("CREATE INDEX IF NOT EXISTS idx_current_resolved_date ON vulnerabilities_current (resolved_date)", (err) => {
      if (err) {
        console.error("Error creating current resolved_date index:", err.message);
      }
    });

    // ✅ STAGING TABLE INDEXES - Session 2 Performance Enhancement
    db.run("CREATE INDEX IF NOT EXISTS idx_staging_import_id ON vulnerability_staging (import_id)", (err) => {
      if (err) {
        console.error("Error creating staging import_id index:", err.message);
      }
    });

    db.run("CREATE INDEX IF NOT EXISTS idx_staging_processed ON vulnerability_staging (processed)", (err) => {
      if (err) {
        console.error("Error creating staging processed index:", err.message);
      }
    });

    db.run("CREATE INDEX IF NOT EXISTS idx_staging_batch_id ON vulnerability_staging (batch_id)", (err) => {
      if (err) {
        console.error("Error creating staging batch_id index:", err.message);
      }
    });

    db.run("CREATE INDEX IF NOT EXISTS idx_staging_unprocessed_batch ON vulnerability_staging (processed, batch_id)", (err) => {
      if (err) {
        console.error("Error creating staging unprocessed_batch index:", err.message);
      }
    });

    // Migration script for enhanced deduplication (run once)
    db.get("SELECT COUNT(*) as enhanced_count FROM vulnerabilities_current WHERE enhanced_unique_key IS NOT NULL", (err, result) => {
      if (err) {
        console.error("Error checking migration status:", err);
        return;
      }
      
      const totalCount = result ? result.enhanced_count : 0;
      
      // Only run migration if most records don't have enhanced keys
      db.get("SELECT COUNT(*) as total_count FROM vulnerabilities_current", (err, totalResult) => {
        if (err) {return;}
        
        const totalRecords = totalResult ? totalResult.total_count : 0;
        const migrationNeeded = totalRecords > 0 && (totalCount / totalRecords) < 0.5;
        
        if (migrationNeeded) {
          console.log("Starting enhanced deduplication migration for existing data...");
          migrateExistingVulnerabilities();
        }
      });
    });
  });
};

// Migration function for existing vulnerability data
function migrateExistingVulnerabilities() {
    console.log("Starting vulnerability data migration to enhanced deduplication...");
    
    // Get all existing vulnerabilities that need migration
    db.all("SELECT * FROM vulnerabilities_current WHERE enhanced_unique_key IS NULL OR enhanced_unique_key = ''", [], (err, rows) => {
        if (err) {
            console.error("Migration failed:", err);
            return;
        }
        
        if (rows.length === 0) {
            console.log("No vulnerabilities need migration");
            return;
        }
        
        let migrated = 0;
        const migrationStats = {
            duplicatesFound: 0,
            keyUpgraded: 0,
            confidenceImproved: 0,
            errors: 0
        };
        
        function migrateNextRow(index) {
            if (index >= rows.length) {
                console.log(`Migration completed: ${migrated} rows processed`, migrationStats);
                
                // After migration, resolve duplicates
                if (migrationStats.keyUpgraded > 0) {
                    setTimeout(resolveMigrationDuplicates, 1000);
                }
                return;
            }
            
            const row = rows[index];
            const mapped = {
                assetId: null, // Not available in existing data
                hostname: row.hostname,
                ipAddress: row.ip_address,
                cve: row.cve,
                pluginId: row.plugin_id,
                description: row.description,
                vendor: row.vendor
            };
            
            const enhancedKey = generateEnhancedUniqueKey(mapped);
            const confidence = calculateDeduplicationConfidence(enhancedKey);
            const tier = getDeduplicationTier(enhancedKey);
            
            // Check if enhanced key differs from original
            if (enhancedKey !== row.unique_key) {
                migrationStats.keyUpgraded++;
            }
            
            const currentConfidence = row.confidence_score || 50;
            if (confidence > currentConfidence) {
                migrationStats.confidenceImproved++;
            }
            
            // Update row with enhanced data
            db.run("UPDATE vulnerabilities_current SET enhanced_unique_key = ?, confidence_score = ?, dedup_tier = ? WHERE id = ?",
                [enhancedKey, confidence, tier, row.id], (err) => {
                if (err) {
                    console.error("Error migrating row:", row.id, err);
                    migrationStats.errors++;
                } else {
                    migrated++;
                }
                migrateNextRow(index + 1);
            });
        }
        
        migrateNextRow(0);
    });
}

// Resolve duplicates created during migration
function resolveMigrationDuplicates() {
    console.log("Resolving duplicates created during migration...");
    
    // Find duplicates based on enhanced unique key
    const duplicateQuery = `
        SELECT enhanced_unique_key, COUNT(*) as count, 
               GROUP_CONCAT(id) as ids,
               GROUP_CONCAT(confidence_score) as confidences,
               GROUP_CONCAT(first_seen) as first_seens
        FROM vulnerabilities_current 
        WHERE enhanced_unique_key IS NOT NULL AND enhanced_unique_key != ''
        GROUP BY enhanced_unique_key 
        HAVING COUNT(*) > 1
        LIMIT 100
    `;
    
    db.all(duplicateQuery, [], (err, duplicates) => {
        if (err) {
            console.error("Error finding duplicates:", err);
            return;
        }
        
        console.log(`Found ${duplicates.length} groups of duplicates to resolve`);
        
        duplicates.forEach(duplicate => {
            const ids = duplicate.ids.split(",");
            const confidences = duplicate.confidences.split(",").map(Number);
            const firstSeens = duplicate.first_seens.split(",");
            
            // Keep the record with highest confidence score, or earliest first_seen if tied
            let bestIndex = 0;
            let bestConfidence = confidences[0];
            let bestFirstSeen = firstSeens[0];
            
            for (let i = 1; i < confidences.length; i++) {
                const isNewBest = confidences[i] > bestConfidence || 
                    (confidences[i] === bestConfidence && firstSeens[i] < bestFirstSeen);
                
                if (isNewBest) {
                    bestIndex = i;
                    bestConfidence = confidences[i];
                    bestFirstSeen = firstSeens[i];
                }
            }
            
            const keepId = ids[bestIndex];
            const removeIds = ids.filter(id => id !== keepId);
            
            // Remove duplicate records
            removeIds.forEach(removeId => {
                db.run("DELETE FROM vulnerabilities_current WHERE id = ?", [removeId], (err) => {
                    if (err) {
                        console.error("Error removing duplicate:", removeId, err);
                    } else {
                        console.log(`Removed duplicate vulnerability ID ${removeId}, kept ${keepId} (confidence: ${bestConfidence})`);
                    }
                });
            });
        });
    });
}

// Backup API endpoints for settings modal
app.get("/api/backup/stats", (req, res) => {
    // Use the new table structure: vulnerabilities_current instead of vulnerabilities
    db.get("SELECT COUNT(*) as vulnerabilities FROM vulnerabilities_current", (err, vulnRow) => {
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
                            db.serialize(() => {
                                db.run("DELETE FROM vulnerability_snapshots");
                                db.run("DELETE FROM vulnerabilities_current");
                                db.run("DELETE FROM vulnerability_daily_totals", (err) => {
                                    if (err) {reject(err);}
                                    else {resolve();}
                                });
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

server.listen(PORT, "0.0.0.0", () => {
  initDb();
  console.log(`🚀 HexTrackr server running on http://localhost:${PORT}`);
  console.log("📊 Database-powered vulnerability management enabled");
  console.log("🔌 WebSocket progress tracking enabled");
  console.log("Available endpoints:");
  console.log(`  - Tickets: http://localhost:${PORT}/tickets.html`);
  console.log(`  - Vulnerabilities: http://localhost:${PORT}/vulnerabilities.html`);
  console.log(`  - API: http://localhost:${PORT}/api/vulnerabilities`);
});
