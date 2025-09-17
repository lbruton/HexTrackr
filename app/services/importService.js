/**
 * Import Service - Vendor CSV Import Business Logic
 *
 * This service handles operational imports of vendor CSV data (e.g., Tenable vulnerability scans),
 * not backup/restore operations. Those are handled by the backup service.
 *
 * Business logic extracted from server.js lines: 252-341, 1306-1823, 2291-2335, and various processing functions
 *
 * INTEGRATION DEPENDENCIES FOR T053:
 * ==================================
 * - Uses DatabaseService for all database operations
 * - Uses PathValidator for secure file operations
 * - Uses helpers for vulnerability mapping and deduplication
 * - Requires existing database schema (staging tables, current tables)
 * - Compatible with existing ProgressTracker WebSocket implementation
 * - Maintains all existing CSV parsing and mapping logic
 */

const Papa = require("papaparse");
const crypto = require("crypto");
const PathValidator = require("../utils/PathValidator");
const DatabaseService = require("./databaseService");
const ValidationService = require("./validationService");
const helpers = require("../utils/helpers");

/**
 * Extract scan date from filename using various patterns
 * From server.js lines 2291-2335
 */
function extractDateFromFilename(filename) {
    if (!filename) {
        return null;
    }

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

/**
 * Extract vendor from filename based on common patterns
 */
function extractVendorFromFilename(filename) {
    if (!filename) {
        return "unknown";
    }

    const lowerFilename = filename.toLowerCase();

    // Check for common vendor patterns
    if (lowerFilename.includes("tenable") || lowerFilename.includes("nessus")) {
        return "Tenable";
    }
    if (lowerFilename.includes("qualys")) {
        return "Qualys";
    }
    if (lowerFilename.includes("rapid7") || lowerFilename.includes("nexpose")) {
        return "Rapid7";
    }
    if (lowerFilename.includes("openvas")) {
        return "OpenVAS";
    }
    if (lowerFilename.includes("nmap")) {
        return "Nmap";
    }

    return "unknown";
}

/**
 * Map CSV row to vulnerability record(s) with multi-CVE splitting
 * From server.js lines 252-341
 */
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

    // Enhanced hostname processing with normalization
    let hostname = row["asset.name"] || row["hostname"] || row["Host"] || "";
    hostname = helpers.normalizeHostname(hostname);

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
    const pluginName = row["definition.name"] || row["plugin_name"] || row["description"] || row["Description"] || "";

    // Parse multiple CVEs and create separate records for each
    const cvePattern = /CVE-\d{4}-\d{4,}/gi;
    const ciscoPattern = /cisco-sa-[\w-]+/gi;

    const cveMatches = (cve || "").match(cvePattern) || [];
    const ciscoMatches = (cve || "").match(ciscoPattern) || [];
    const allCVEs = [...cveMatches, ...ciscoMatches];

    // If no CVEs found, create single record with empty CVE
    if (allCVEs.length === 0) {
        return [{
            assetId: row["asset.id"] || row["asset_id"] || row["Asset ID"] || "",
            hostname: hostname,
            ipAddress: ipAddress,
            cve: "",
            severity: row["severity"] || row["Severity"] || "",
            vprScore: row["definition.vpr.score"] || row["definition.vpr_v2.score"] || row["vpr_score"] || row["VPR Score"] ? parseFloat(row["definition.vpr.score"] || row["definition.vpr_v2.score"] || row["vpr_score"] || row["VPR Score"]) : null,
            cvssScore: row["cvss_score"] || row["CVSS Score"] ? parseFloat(row["cvss_score"] || row["CVSS Score"]) : null,
            vendor: helpers.normalizeVendor(row["definition.family"] || row["vendor"] || row["Vendor"] || ""),
            pluginName: pluginName,
            description: description,
            solution: row["solution"] || row["Solution"] || "",
            state: row["state"] || row["State"] || "ACTIVE",
            firstSeen: row["first_seen"] || row["First Seen"] || "",
            lastSeen: row["last_seen"] || row["Last Seen"] || "",
            pluginId: row["definition.id"] || row["plugin_id"] || row["Plugin ID"] || "",
            pluginPublished: row["definition.plugin_published"] || row["definition.plugin_updated"] || row["definition.vulnerability_published"] || row["vulnerability_date"] || row["plugin_published"] || ""
        }];
    }

    // Create separate record for each CVE
    return allCVEs.map(individualCVE => {
        // Augment description with CVE if not already present
        let augmentedDescription = description;
        if (description && !description.includes(individualCVE)) {
            augmentedDescription = `${description} (${individualCVE})`;
        }

        return {
            assetId: row["asset.id"] || row["asset_id"] || row["Asset ID"] || "",
            hostname: hostname,
            ipAddress: ipAddress,
            cve: individualCVE,
            severity: row["severity"] || row["Severity"] || "",
            vprScore: row["definition.vpr.score"] || row["definition.vpr_v2.score"] || row["vpr_score"] || row["VPR Score"] ? parseFloat(row["definition.vpr.score"] || row["definition.vpr_v2.score"] || row["vpr_score"] || row["VPR Score"]) : null,
            cvssScore: row["cvss_score"] || row["CVSS Score"] ? parseFloat(row["cvss_score"] || row["CVSS Score"]) : null,
            vendor: helpers.normalizeVendor(row["definition.family"] || row["vendor"] || row["Vendor"] || ""),
            pluginName: pluginName,
            description: augmentedDescription,
            solution: row["solution"] || row["Solution"] || "",
            state: row["state"] || row["State"] || "ACTIVE",
            firstSeen: row["first_seen"] || row["First Seen"] || "",
            lastSeen: row["last_seen"] || row["Last Seen"] || "",
            pluginId: row["definition.id"] || row["plugin_id"] || row["Plugin ID"] || "",
            pluginPublished: row["definition.plugin_published"] || row["definition.plugin_updated"] || row["definition.vulnerability_published"] || row["vulnerability_date"] || row["plugin_published"] || ""
        };
    });
}

/**
 * Parse CSV file using PapaParse
 */
async function parseCSV(csvData) {
    return new Promise((resolve, reject) => {
        Papa.parse(csvData, {
            header: true,
            skipEmptyLines: true,
            complete: (results) => resolve(results),
            error: (error) => reject(error)
        });
    });
}

/**
 * Create import record in database
 */
async function createImportRecord({ filename, vendor, scanDate, rowCount, fileSize, headers }) {
    return new Promise((resolve, reject) => {
        const importDate = new Date().toISOString();

        const importQuery = `
            INSERT INTO vulnerability_imports
            (filename, import_date, row_count, vendor, file_size, processing_time, raw_headers)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `;

        DatabaseService.getDatabase().run(importQuery, [
            filename,
            importDate,
            rowCount,
            vendor,
            fileSize,
            0, // Will update after completion
            JSON.stringify(headers)
        ], function(err) {
            if (err) {
                reject(err);
            } else {
                resolve({
                    importId: this.lastID,
                    importDate
                });
            }
        });
    });
}

/**
 * Process vulnerabilities with enhanced lifecycle management
 * Simplified version of the complex logic from server.js lines 1306+
 */
async function processVulnerabilitiesWithLifecycle(rows, importId, filePath, scanDate) {
    return new Promise((resolve, reject) => {
        const currentDate = scanDate || new Date().toISOString().split("T")[0];
        const db = DatabaseService.getDatabase();

        console.log("🚀 PERFORMANCE: Starting enhanced rollover import");
        console.log(`📊 PERFORMANCE: Scan date: ${currentDate}, Rows: ${rows.length}`);

        // Step 1: Mark all active vulnerabilities as potentially stale (grace period)
        db.run("UPDATE vulnerabilities_current SET lifecycle_state = 'grace_period' WHERE lifecycle_state = 'active'", (err) => {
            if (err) {
                console.error("Error marking vulnerabilities as stale:", err);
                reject(new Error("Failed to prepare for import"));
                return;
            }

            // Step 2: Process new vulnerability data
            const stats = {
                inserted: 0,
                updated: 0,
                reopened: 0,
                duplicate_skipped: 0
            };

            let processedRows = 0;
            const totalRecords = rows.reduce((total, row) => total + mapVulnerabilityRow(row).length, 0);

            // Process rows sequentially to prevent race conditions
            function processNextRow(index) {
                if (index >= rows.length) {
                    // Finalize processing
                    finalizeImport();
                    return;
                }

                const row = rows[index];
                const mappedArray = mapVulnerabilityRow(row);

                if (mappedArray.length === 0) {
                    processNextRow(index + 1);
                    return;
                }

                let pendingOperations = 0;
                let completedOperations = 0;

                // Process each mapped vulnerability from this row
                for (const mapped of mappedArray) {
                    pendingOperations++;

                    // Generate unique key for deduplication
                    const uniqueKey = helpers.generateUniqueKey(mapped);

                    // Insert to vulnerabilities table (snapshot)
                    const snapshotQuery = `
                        INSERT INTO vulnerabilities
                        (import_id, hostname, ip_address, cve, severity, vpr_score, cvss_score,
                         first_seen, last_seen, plugin_id, plugin_name, description, solution,
                         vendor, vulnerability_date, state, import_date)
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    `;

                    db.run(snapshotQuery, [
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
                        mapped.pluginName,
                        mapped.description,
                        mapped.solution,
                        mapped.vendor,
                        mapped.pluginPublished,
                        mapped.state,
                        currentDate
                    ], function(snapshotErr) {
                        if (snapshotErr) {
                            console.error("Error inserting to vulnerabilities:", snapshotErr);
                        }

                        // Check if vulnerability exists in current table
                        db.get("SELECT * FROM vulnerabilities_current WHERE unique_key = ?", [uniqueKey], (currentErr, existing) => {
                            if (currentErr) {
                                console.error("Error checking current vulnerability:", currentErr);
                            } else if (existing) {
                                // Update existing vulnerability
                                db.run(`
                                    UPDATE vulnerabilities_current
                                    SET lifecycle_state = 'active', last_seen = ?, severity = ?, vpr_score = ?, cvss_score = ?
                                    WHERE unique_key = ?
                                `, [currentDate, mapped.severity, mapped.vprScore, mapped.cvssScore, uniqueKey], (updateErr) => {
                                    if (!updateErr) {stats.updated++;}
                                });
                            } else {
                                // Insert new vulnerability to current table
                                db.run(`
                                    INSERT INTO vulnerabilities_current
                                    (unique_key, hostname, ip_address, cve, severity, vpr_score, cvss_score,
                                     first_seen, last_seen, plugin_id, plugin_name, description, solution,
                                     vendor, vulnerability_date, state, lifecycle_state, import_date)
                                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                                `, [
                                    uniqueKey,
                                    mapped.hostname,
                                    mapped.ipAddress,
                                    mapped.cve,
                                    mapped.severity,
                                    mapped.vprScore,
                                    mapped.cvssScore,
                                    mapped.firstSeen,
                                    currentDate,
                                    mapped.pluginId,
                                    mapped.pluginName,
                                    mapped.description,
                                    mapped.solution,
                                    mapped.vendor,
                                    mapped.pluginPublished,
                                    mapped.state,
                                    "active",
                                    currentDate
                                ], (insertErr) => {
                                    if (!insertErr) {stats.inserted++;}
                                });
                            }

                            completedOperations++;
                            if (completedOperations === pendingOperations) {
                                processedRows++;
                                if (processedRows % 100 === 0) {
                                    console.log(`📈 PROGRESS: ${processedRows}/${rows.length} rows processed`);
                                }
                                processNextRow(index + 1);
                            }
                        });
                    });
                }
            }

            function finalizeImport() {
                // Mark remaining grace period vulnerabilities as resolved
                db.run("UPDATE vulnerabilities_current SET lifecycle_state = 'resolved' WHERE lifecycle_state = 'grace_period'", (finalErr) => {
                    if (finalErr) {
                        console.error("Error finalizing import:", finalErr);
                        reject(finalErr);
                    } else {
                        console.log("✅ Enhanced lifecycle import completed:", stats);
                        resolve({
                            success: true,
                            stats,
                            totalRecords,
                            currentDate,
                            enhancedLifecycle: true
                        });
                    }
                });
            }

            // Start processing
            processNextRow(0);
        });
    });
}

/**
 * Process staging import with progress tracking
 * High-performance import using staging table for batch processing
 */
async function processStagingImport({ filePath, filename, vendor, scanDate, sessionId, startTime, progressTracker }) {
    try {
        // Update progress: Starting CSV parsing
        progressTracker.updateProgress(sessionId, 5, "Parsing CSV file...", { currentStep: 1 });

        // Read and parse CSV
        const csvData = PathValidator.safeReadFileSync(filePath, "utf8");
        const results = await parseCSV(csvData);
        const rows = results.data.filter(row => Object.values(row).some(val => val && val.trim()));

        // Update progress: CSV parsing completed
        progressTracker.updateProgress(sessionId, 15, `Parsed ${rows.length} rows from CSV`, {
            currentStep: 1,
            rowCount: rows.length
        });

        console.log(`📈 Parsed ${rows.length} rows from CSV`);

        // Create import record
        const importRecord = await createImportRecord({
            filename,
            vendor,
            scanDate,
            rowCount: rows.length,
            fileSize: 0, // File size not available in this context
            headers: results.meta.fields
        });

        // Update progress: Starting bulk load to staging
        progressTracker.updateProgress(sessionId, 20, "Loading data to staging table...", {
            currentStep: 2,
            importId: importRecord.importId
        });

        // Bulk load to staging table (simplified version)
        await bulkLoadToStagingTable(rows, importRecord.importId, scanDate, filePath, {
            success: true,
            importId: importRecord.importId,
            filename,
            vendor,
            scanDate,
            stagingMode: true
        }, sessionId, startTime, progressTracker);

    } catch (error) {
        console.error("Staging import failed:", error);
        progressTracker.errorSession(sessionId, "Staging import failed: " + error.message, { error });
        throw error;
    }
}

/**
 * Simplified bulk load to staging table
 */
async function bulkLoadToStagingTable(rows, importId, scanDate, filePath, responseData, sessionId, startTime, progressTracker) {
    return new Promise((resolve, reject) => {
        const db = DatabaseService.getDatabase();
        const loadStart = Date.now();

        console.log(`🚀 BULK LOAD: Starting bulk insert of ${rows.length} rows to staging table`);

        const stagingInsertSQL = `
            INSERT INTO vulnerability_staging (
                import_id, hostname, ip_address, cve, severity, vpr_score, cvss_score,
                plugin_id, plugin_name, description, solution, vendor_reference, vendor,
                vulnerability_date, state, raw_csv_row
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        db.serialize(() => {
            db.run("BEGIN TRANSACTION", (err) => {
                if (err) {
                    console.error("Error starting transaction:", err);
                    progressTracker.errorSession(sessionId, "Transaction start failed", { error: err });
                    reject(err);
                    return;
                }

                console.log("💾 Transaction started - bulk inserting rows");
                progressTracker.updateProgress(sessionId, 25, "Inserting rows into staging table...", { currentStep: 2 });

                const stmt = db.prepare(stagingInsertSQL);
                let insertedCount = 0;
                let errorCount = 0;

                // Process all rows and their mapped vulnerabilities
                const allMappedRecords = [];
                rows.forEach((row, index) => {
                    try {
                        const mappedArray = mapVulnerabilityRow(row);
                        mappedArray.forEach(mapped => {
                            allMappedRecords.push({
                                mapped,
                                sourceRowIndex: index,
                                rawRow: row
                            });
                        });
                    } catch (mappingError) {
                        console.error(`Error mapping row ${index}:`, mappingError);
                        errorCount++;
                    }
                });

                // Insert all mapped records
                allMappedRecords.forEach((record, index) => {
                    try {
                        const mapped = record.mapped;
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
                            "", // vendor_reference
                            mapped.vendor,
                            mapped.pluginPublished,
                            mapped.state,
                            JSON.stringify(record.rawRow)
                        ], (err) => {
                            if (err) {
                                console.error(`Error inserting staging record ${index}:`, err);
                                errorCount++;
                            } else {
                                insertedCount++;

                                // Update progress every 100 records
                                if (insertedCount % 100 === 0 || insertedCount === allMappedRecords.length) {
                                    const progress = 25 + ((insertedCount / allMappedRecords.length) * 35); // 25-60% range
                                    progressTracker.updateProgress(sessionId, progress,
                                        `Inserted ${insertedCount}/${allMappedRecords.length} records to staging table...`, {
                                            currentStep: 2,
                                            insertedCount,
                                            totalRows: allMappedRecords.length
                                        });
                                }
                            }
                        });
                    } catch (insertError) {
                        console.error(`Error preparing insert for record ${index}:`, insertError);
                        errorCount++;
                    }
                });

                // Finalize and commit
                stmt.finalize((err) => {
                    if (err) {
                        console.error("Error finalizing statement:", err);
                        db.run("ROLLBACK", () => {
                            progressTracker.errorSession(sessionId, "Staging insert failed", { error: err, errorCount });
                            reject(err);
                        });
                        return;
                    }

                    db.run("COMMIT", (err) => {
                        if (err) {
                            console.error("Error committing transaction:", err);
                            progressTracker.errorSession(sessionId, "Transaction commit failed", { error: err });
                            reject(err);
                            return;
                        }

                        const loadTime = Date.now() - loadStart;
                        const rowsPerSecond = insertedCount / (loadTime / 1000);

                        console.log(`✅ BULK LOAD COMPLETE: ${insertedCount} records inserted in ${loadTime}ms (${rowsPerSecond.toFixed(1)} records/sec)`);

                        // Update progress: Staging complete
                        progressTracker.updateProgress(sessionId, 60,
                            `Staging complete. Processing ${insertedCount} records to final tables...`, {
                            currentStep: 3,
                            insertedToStaging: insertedCount,
                            loadTime,
                            rowsPerSecond: parseFloat(rowsPerSecond.toFixed(1))
                        });

                        // Clean up file
                        try {
                            if (filePath && PathValidator.safeExistsSync(filePath)) {
                                PathValidator.safeUnlinkSync(filePath);
                            }
                        } catch (cleanupError) {
                            console.warn("File cleanup warning:", cleanupError.message);
                        }

                        // Complete with staging results
                        progressTracker.completeSession(sessionId, "Staging import completed successfully", {
                            insertedToStaging: insertedCount,
                            stagingErrors: errorCount,
                            bulkLoadTime: loadTime,
                            bulkLoadRowsPerSecond: parseFloat(rowsPerSecond.toFixed(1))
                        });

                        resolve({
                            insertedToStaging: insertedCount,
                            stagingErrors: errorCount
                        });
                    });
                });
            });
        });
    });
}

/**
 * Process JSON vulnerability data
 */
async function processVulnerabilitiesJSON(csvData) {
    return new Promise((resolve, reject) => {
        const importDate = new Date().toISOString();
        let imported = 0;
        const errors = [];

        // Create import record
        createImportRecord({
            filename: "web-upload.csv",
            vendor: "web-import",
            scanDate: importDate.split("T")[0],
            rowCount: csvData.length,
            fileSize: 0,
            headers: Object.keys(csvData[0] || {})
        }).then(importRecord => {
            const db = DatabaseService.getDatabase();

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
                        importRecord.importId,
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
                    reject(new Error("Import failed"));
                } else {
                    resolve({
                        imported,
                        importId: importRecord.importId,
                        errors
                    });
                }
            });
        }).catch(reject);
    });
}

/**
 * Process JSON ticket data
 */
async function processTicketsJSON(csvData) {
    return new Promise((resolve, reject) => {
        const db = DatabaseService.getDatabase();
        let imported = 0;
        const errors = [];

        // Prepare insert statement
        const stmt = db.prepare(`
            INSERT INTO tickets
            (title, description, priority, status, assigned_to, category,
             devices, environment, business_impact, technical_details,
             estimated_hours, created_at, due_date)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);

        csvData.forEach((row, index) => {
            try {
                // Parse devices JSON if it's a string
                let devices = [];
                if (row.devices) {
                    try {
                        devices = typeof row.devices === "string" ? JSON.parse(row.devices) : row.devices;
                    } catch (parseError) {
                        devices = [row.devices]; // Fallback to array with string
                    }
                }

                stmt.run([
                    row.title || "",
                    row.description || "",
                    row.priority || "Medium",
                    row.status || "Open",
                    row.assigned_to || "",
                    row.category || "",
                    JSON.stringify(devices),
                    row.environment || "",
                    row.business_impact || "",
                    row.technical_details || "",
                    parseFloat(row.estimated_hours || 0),
                    row.created_at || new Date().toISOString(),
                    row.due_date || ""
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
                reject(new Error("Import failed"));
            } else {
                resolve({
                    imported,
                    errors
                });
            }
        });
    });
}

/**
 * Get import history with vulnerability counts
 */
async function getImportHistory() {
    return new Promise((resolve, reject) => {
        const db = DatabaseService.getDatabase();

        const query = `
            SELECT
                vi.*,
                COUNT(v.id) as vulnerability_count
            FROM vulnerability_imports vi
            LEFT JOIN vulnerabilities v ON vi.id = v.import_id
            GROUP BY vi.id
            ORDER BY vi.import_date DESC
            LIMIT 50
        `;

        db.all(query, [], (err, rows) => {
            if (err) {
                reject(err);
            } else {
                resolve(rows);
            }
        });
    });
}

module.exports = {
    extractDateFromFilename,
    extractVendorFromFilename,
    mapVulnerabilityRow,
    parseCSV,
    createImportRecord,
    processVulnerabilitiesWithLifecycle,
    processStagingImport,
    processVulnerabilitiesJSON,
    processTicketsJSON,
    getImportHistory
};