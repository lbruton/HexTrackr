/**
 * Import Service - Vendor CSV Import Business Logic
 *
 * This service handles operational imports of vendor CSV data (e.g., Tenable vulnerability scans),
 * not backup/restore operations. Those are handled by the backup service.
 *
 * FIXED: Restored batch processing, lifecycle management, and enhanced deduplication
 */

const Papa = require("papaparse");
const PathValidator = require("../utils/PathValidator");
const helpers = require("../utils/helpers");
const CacheService = require("./cacheService");

// Get singleton instance explicitly (prevents race conditions)
const cacheService = CacheService.getInstance();

/**
 * Extract scan date from filename using various patterns
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

    return "unknown";
}

/**
 * Map CSV row data to vulnerability object structure
 * Uses the helpers.mapVulnerabilityRow function
 */
function mapVulnerabilityRow(row) {
    return helpers.mapVulnerabilityRow(row);
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
 * @param {string} scanDate - Used by caller functions (processVulnerabilitiesWithLifecycle, bulkLoadToStagingTable, etc.)
 */
async function createImportRecord({ filename, vendor, scanDate, rowCount, fileSize, headers }) { // eslint-disable-line no-unused-vars
    return new Promise((resolve, reject) => {
        const importDate = new Date().toISOString();

        const importQuery = `
            INSERT INTO vulnerability_imports
            (filename, import_date, row_count, vendor, file_size, processing_time, raw_headers)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `;

        const db = global.db;
        db.run(importQuery, [
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
 * This is for non-staging imports
 */
async function processVulnerabilitiesWithLifecycle(rows, importId, filePath, scanDate) {
    return new Promise((resolve, reject) => {
        const currentDate = scanDate || new Date().toISOString().split("T")[0];
        const db = global.db;

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
            const _totalRecords = rows.reduce((total, row) => total + mapVulnerabilityRow(row).length, 0);

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

                    // Use ENHANCED unique key generation
                    const enhancedKey = helpers.generateEnhancedUniqueKey(mapped);
                    const legacyKey = helpers.generateUniqueKey(mapped);
                    const confidence = helpers.calculateDeduplicationConfidence(enhancedKey);
                    const tier = helpers.getDeduplicationTier(enhancedKey);

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

                        // Check if vulnerability exists in current table using ENHANCED key
                        db.get("SELECT * FROM vulnerabilities_current WHERE enhanced_unique_key = ? OR unique_key = ?",
                            [enhancedKey, legacyKey], (currentErr, existing) => {
                            if (currentErr) {
                                console.error("Error checking current vulnerability:", currentErr);
                            } else if (existing) {
                                // Update existing vulnerability
                                db.run(`
                                    UPDATE vulnerabilities_current
                                    SET lifecycle_state = 'active',
                                        import_id = ?,
                                        scan_date = ?,
                                        last_seen = ?,
                                        severity = ?,
                                        vpr_score = ?,
                                        cvss_score = ?,
                                        enhanced_unique_key = ?,
                                        confidence_score = ?,
                                        dedup_tier = ?,
                                        vendor = ?,
                                        vendor_reference = ?,
                                        vulnerability_date = ?,
                                        plugin_name = ?,
                                        description = ?,
                                        solution = ?,
                                        state = ?,
                                        plugin_id = ?,
                                        ip_address = ?
                                    WHERE id = ?
                                `, [
                                    importId,
                                    currentDate,
                                    currentDate,
                                    mapped.severity,
                                    mapped.vprScore,
                                    mapped.cvssScore,
                                    enhancedKey,
                                    confidence,
                                    tier,
                                    mapped.vendor,
                                    mapped.vendor || "",
                                    mapped.pluginPublished,
                                    mapped.pluginName,
                                    mapped.description,
                                    mapped.solution,
                                    mapped.state || "ACTIVE",
                                    mapped.pluginId,
                                    mapped.ipAddress,
                                    existing.id
                                ], (updateErr) => {
                                    if (!updateErr) {stats.updated++;}
                                });
                            } else {
                                // Insert new vulnerability to current table
                                db.run(`
                                    INSERT INTO vulnerabilities_current (
                                        import_id,
                                        scan_date,
                                        unique_key,
                                        enhanced_unique_key,
                                        hostname,
                                        ip_address,
                                        cve,
                                        severity,
                                        vpr_score,
                                        cvss_score,
                                        first_seen,
                                        last_seen,
                                        plugin_id,
                                        plugin_name,
                                        description,
                                        solution,
                                        vendor_reference,
                                        vendor,
                                        vulnerability_date,
                                        state,
                                        lifecycle_state,
                                        confidence_score,
                                        dedup_tier
                                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                                `, [
                                    importId,
                                    currentDate,
                                    legacyKey,
                                    enhancedKey,
                                    mapped.hostname,
                                    mapped.ipAddress,
                                    mapped.cve,
                                    mapped.severity,
                                    mapped.vprScore,
                                    mapped.cvssScore,
                                    mapped.firstSeen || currentDate,
                                    currentDate,
                                    mapped.pluginId,
                                    mapped.pluginName,
                                    mapped.description,
                                    mapped.solution,
                                    mapped.vendor || "",
                                    mapped.vendor,
                                    mapped.pluginPublished,
                                    mapped.state || "ACTIVE",
                                    "active",
                                    confidence,
                                    tier
                                ], (insertErr) => {
                                    if (!insertErr) {stats.inserted++;}
                                });
                            }

                            completedOperations++;
                            if (completedOperations === pendingOperations) {
                                processedRows += mappedArray.length;
                                processNextRow(index + 1);
                            }
                        });
                    });
                }
            }

            function finalizeImport() {
                // Mark vulnerabilities still in grace_period as resolved
                db.run(`
                    UPDATE vulnerabilities_current
                    SET lifecycle_state = 'resolved', resolved_date = ?, resolution_reason = 'not_present_in_scan'
                    WHERE lifecycle_state = 'grace_period'
                `, [currentDate], function(resolveErr) {
                    const resolvedCount = this.changes || 0;

                    if (!resolveErr) {
                        console.log(`✅ Resolved ${resolvedCount} vulnerabilities not present in current scan`);
                    }

                    // Update daily totals
                    calculateAndStoreDailyTotalsEnhanced(currentDate, () => {
                        console.log(`✅ Import complete: Inserted: ${stats.inserted}, Updated: ${stats.updated}, Resolved: ${resolvedCount}`);

                        // Clean up file
                        try {
                            if (filePath && PathValidator.safeExistsSync(filePath)) {
                                PathValidator.safeUnlinkSync(filePath);
                            }
                        } catch (unlinkError) {
                            console.error("Error cleaning up file:", unlinkError);
                        }

                        resolve({
                            ...stats,
                            resolved: resolvedCount,
                            totalProcessed: processedRows
                        });
                    });
                });
            }

            // Start processing
            processNextRow(0);
        });
    });
}

/**
 * Bulk load vulnerabilities to staging table for high-performance import
 * FIXED: Added proper error handling and batch processing
 */
async function bulkLoadToStagingTable(rows, importId, scanDate, filePath, responseData, sessionId, startTime, progressTracker) {
    return new Promise((resolve, reject) => {
        const loadStart = Date.now();
        console.log(`🚀 BULK LOAD: Starting bulk insert of ${rows.length} rows to staging table`);

        const db = global.db;

        // Prepare batch INSERT statement for staging table
        const stagingInsertSQL = `
            INSERT INTO vulnerability_staging (
                import_id, hostname, ip_address, cve, severity, vpr_score, cvss_score,
                plugin_id, plugin_name, description, solution, vendor_reference, vendor,
                vulnerability_date, state, raw_csv_row
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        // Transaction wrapping for performance
        db.serialize(() => {
            db.run("BEGIN TRANSACTION", (err) => {
                if (err) {
                    console.error("Error starting transaction:", err);
                    if (progressTracker && progressTracker.errorSession) {
                        progressTracker.errorSession(sessionId, "Transaction start failed", { error: err });
                    }
                    reject(err);
                    return;
                }

                console.log("💾 Transaction started - bulk inserting rows");
                if (progressTracker && progressTracker.updateProgress) {
                    progressTracker.updateProgress(sessionId, 25, "Inserting rows into staging table...", { currentStep: 2 });
                }

                const stmt = db.prepare(stagingInsertSQL);
                let insertedCount = 0;
                let errorCount = 0;
                const totalRows = rows.length;

                // Process all rows in the transaction, handling multi-CVE splitting
                let totalRecordsToInsert = 0;
                const allMappedRecords = [];

                // First pass: calculate total records and prepare all mapped data
                rows.forEach((row, index) => {
                    try {
                        const mappedArray = mapVulnerabilityRow(row);
                        totalRecordsToInsert += mappedArray.length;

                        // Store each mapped record with source row reference
                        mappedArray.forEach(mapped => {
                            allMappedRecords.push({
                                mapped,
                                sourceRowIndex: index,
                                rawRow: row
                            });
                        });
                    } catch (error) {
                        console.error(`Row ${index + 1} mapping error:`, error);
                        errorCount++;
                    }
                });

                console.log(`📊 CSV Processing: ${rows.length} rows → ${totalRecordsToInsert} vulnerability records`);

                // Second pass: insert all mapped records
                allMappedRecords.forEach((record, recordIndex) => {
                    const { mapped, rawRow } = record;

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
                        JSON.stringify(rawRow) // Store raw CSV row for flexibility
                    ], function(err) {
                        if (err) {
                            console.error(`Record ${recordIndex + 1} insert error:`, err);
                            errorCount++;
                        } else {
                            insertedCount++;

                            // Update progress every 100 records or on completion
                            if (insertedCount % 100 === 0 || insertedCount === totalRecordsToInsert) {
                                const progress = 25 + ((insertedCount / totalRecordsToInsert) * 35); // 25-60% range
                                if (progressTracker && progressTracker.updateProgress) {
                                    progressTracker.updateProgress(sessionId, progress,
                                        `Inserted ${insertedCount}/${totalRecordsToInsert} records to staging table...`, {
                                            currentStep: 2,
                                            insertedCount,
                                            totalRows
                                        });
                                }
                            }
                        }
                    });
                });

                // Finalize the prepared statement and commit transaction
                stmt.finalize((err) => {
                    if (err) {
                        console.error("Error finalizing statement:", err);
                        db.run("ROLLBACK", () => {
                            if (progressTracker && progressTracker.errorSession) {
                                progressTracker.errorSession(sessionId, "Staging insert failed", { error: err, errorCount });
                            }
                            reject(err);
                        });
                        return;
                    }

                    db.run("COMMIT", (err) => {
                        if (err) {
                            console.error("Error committing transaction:", err);
                            if (progressTracker && progressTracker.errorSession) {
                                progressTracker.errorSession(sessionId, "Transaction commit failed", { error: err });
                            }
                            reject(err);
                            return;
                        }

                        const loadTime = Date.now() - loadStart;
                        const rowsPerSecond = insertedCount / (loadTime / 1000);

                        console.log(`✅ BULK LOAD COMPLETE: ${insertedCount} records inserted in ${loadTime}ms (${rowsPerSecond.toFixed(1)} records/sec)`);

                        // Update progress: Staging complete
                        if (progressTracker && progressTracker.updateProgress) {
                            progressTracker.updateProgress(sessionId, 60,
                                `Staging complete. Processing ${insertedCount} records to final tables...`, {
                                currentStep: 3,
                                insertedToStaging: insertedCount,
                                loadTime,
                                rowsPerSecond: parseFloat(rowsPerSecond.toFixed(1))
                            });
                        }

                        // Clean up file
                        try {
                            if (filePath && PathValidator.safeExistsSync(filePath)) {
                                PathValidator.safeUnlinkSync(filePath);
                                console.log("🗑️  Source file cleaned up");
                            }
                        } catch (cleanupError) {
                            console.warn("File cleanup warning:", cleanupError.message);
                        }

                        // NOW PROCESS FROM STAGING TO FINAL TABLES WITH BATCH PROCESSING
                        processStagingToFinalTables(importId, scanDate, {
                            ...responseData,
                            bulkLoadTime: loadTime,
                            bulkLoadRowsPerSecond: parseFloat(rowsPerSecond.toFixed(1)),
                            insertedToStaging: insertedCount,
                            stagingErrors: errorCount
                        }, sessionId, startTime, progressTracker);

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
 * RESTORED: Process staging data to final tables with BATCH PROCESSING
 * This is the critical function that was broken in the refactor
 */
function processStagingToFinalTables(importId, scanDate, responseData, sessionId, startTime, progressTracker) {
    const batchSize = 1000; // Process 1000 rows at a time
    const currentDate = scanDate;
    const db = global.db;

    console.log("🔄 BATCH PROCESSOR: Starting batch processing from staging table");
    console.log(`📊 Batch Size: ${batchSize}, Import ID: ${importId}, Scan Date: ${currentDate}`);

    // Step 1: Mark all active vulnerabilities as potentially stale (grace period)
    const graceStart = Date.now();
    if (progressTracker && progressTracker.updateProgress) {
        progressTracker.updateProgress(sessionId, 65, "Preparing existing vulnerabilities for update...", { currentStep: 3 });
    }

    db.run("UPDATE vulnerabilities_current SET lifecycle_state = 'grace_period' WHERE lifecycle_state = 'active'", (err) => {
        if (err) {
            console.error("Error marking vulnerabilities as stale:", err);
            if (progressTracker && progressTracker.errorSession) {
                progressTracker.errorSession(sessionId, "Failed to prepare for batch processing", { error: err });
            }
            return;
        }

        console.log(`⏱️  Grace period update took ${Date.now() - graceStart}ms`);

        // Step 2: Get total count for batch processing
        db.get("SELECT COUNT(*) as total FROM vulnerability_staging WHERE import_id = ? AND processed = 0",
            [importId], (err, countResult) => {
            if (err) {
                console.error("Error counting staging records:", err);
                if (progressTracker && progressTracker.errorSession) {
                    progressTracker.errorSession(sessionId, "Failed to count staging records", { error: err });
                }
                return;
            }

            const totalRows = countResult.total;
            const totalBatches = Math.ceil(totalRows / batchSize);

            console.log(`📈 Processing ${totalRows} rows in ${totalBatches} batches`);

            // Update progress: Starting batch processing
            if (progressTracker && progressTracker.updateProgress) {
                progressTracker.updateProgress(sessionId, 70, `Processing ${totalRows} rows in ${totalBatches} batches...`, {
                    currentStep: 3,
                    totalRows,
                    totalBatches
                });
            }

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
            processNextBatch(importId, currentDate, batchSize, batchStats, responseData, sessionId, startTime, progressTracker);
        });
    });
}

/**
 * RESTORED: Process batches sequentially to maintain data integrity
 */
function processNextBatch(importId, currentDate, batchSize, batchStats, responseData, sessionId, startTime, progressTracker) {
    const db = global.db;

    if (batchStats.currentBatch >= batchStats.totalBatches) {
        // All batches processed - finalize
        finalizeBatchProcessing(importId, currentDate, batchStats, responseData, sessionId, startTime, progressTracker);
        return;
    }

    const batchStart = Date.now();
    batchStats.currentBatch++;

    // Update progress for this batch
    const batchProgress = 70 + ((batchStats.currentBatch / batchStats.totalBatches) * 25); // 70-95% range
    if (progressTracker && progressTracker.updateProgress) {
        progressTracker.updateProgress(sessionId, batchProgress,
            `Processing batch ${batchStats.currentBatch}/${batchStats.totalBatches}...`, {
            currentStep: 3,
            currentBatch: batchStats.currentBatch,
            totalBatches: batchStats.totalBatches,
            processedRows: batchStats.processedRows
        });
    }

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
            processNextBatch(importId, currentDate, batchSize, batchStats, responseData, sessionId, startTime, progressTracker);
            return;
        }

        if (batchRows.length === 0) {
            // No more rows to process
            finalizeBatchProcessing(importId, currentDate, batchStats, responseData, sessionId, startTime, progressTracker);
            return;
        }

        console.log(`🔄 Processing batch ${batchStats.currentBatch}/${batchStats.totalBatches} (${batchRows.length} rows)`);

        // Process this batch using transaction
        db.serialize(() => {
            db.run("BEGIN TRANSACTION", (txErr) => {
                if (txErr) {
                    console.error("Batch transaction error:", txErr);
                    batchStats.errors++;
                    processNextBatch(importId, currentDate, batchSize, batchStats, responseData, sessionId, startTime, progressTracker);
                    return;
                }

                // Process each row in the batch
                let batchProcessed = 0;
                const processedIds = [];

                batchRows.forEach((row) => {
                    // Generate ENHANCED unique keys using existing helper functions
                    const mapped = {
                        assetId: row.asset_id,
                        hostname: row.hostname,
                        ipAddress: row.ip_address,
                        cve: row.cve,
                        severity: row.severity,
                        vprScore: row.vpr_score,
                        cvssScore: row.cvss_score,
                        pluginId: row.plugin_id,
                        pluginName: row.plugin_name,
                        description: row.description,
                        solution: row.solution,
                        vendor: row.vendor,
                        pluginPublished: row.vulnerability_date,
                        state: row.state
                    };

                    const enhancedKey = helpers.generateEnhancedUniqueKey(mapped);
                    const legacyKey = helpers.generateUniqueKey(mapped);
                    const confidence = helpers.calculateDeduplicationConfidence(enhancedKey);
                    const tier = helpers.getDeduplicationTier(enhancedKey);

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

                        // Check if exists in current table using ENHANCED keys
                        const checkExisting = `
                            SELECT id, lifecycle_state FROM vulnerabilities_current
                            WHERE enhanced_unique_key = ? OR unique_key = ?
                        `;

                        db.get(checkExisting, [enhancedKey, legacyKey], (checkErr, existing) => {
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
                                        processNextBatch(importId, currentDate, batchSize, batchStats, responseData, sessionId, startTime, progressTracker);
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

/**
 * RESTORED: Finalize batch processing and clean up staging table
 */
function finalizeBatchProcessing(importId, currentDate, batchStats, responseData, sessionId, startTime, progressTracker) {
    const db = global.db;

    console.log("🏁 FINALIZE: Starting batch processing finalization");

    // Update progress: Starting finalization
    if (progressTracker && progressTracker.updateProgress) {
        progressTracker.updateProgress(sessionId, 95, "Finalizing import and cleaning up...", {
            currentStep: 3,
            processedRows: batchStats.processedRows,
            insertedToCurrent: batchStats.insertedToCurrent,
            updatedInCurrent: batchStats.updatedInCurrent
        });
    }

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

                    // Complete the import session
                    const finalStats = {
                        ...responseData,
                        resolvedCount,
                        processedRows: batchStats.processedRows,
                        insertedToCurrent: batchStats.insertedToCurrent,
                        updatedInCurrent: batchStats.updatedInCurrent,
                        insertedToSnapshots: batchStats.insertedToSnapshots,
                        totalProcessingTime: totalImportTime,
                        rowsPerSecond: batchStats.processedRows / (totalImportTime / 1000)
                    };

                    console.log(`🎉 IMPORT COMPLETE: ${batchStats.processedRows} rows processed in ${totalImportTime}ms`);
                    console.log(`   - Inserted to Current: ${batchStats.insertedToCurrent}`);
                    console.log(`   - Updated in Current: ${batchStats.updatedInCurrent}`);
                    console.log(`   - Resolved: ${resolvedCount}`);
                    console.log(`   - Errors: ${batchStats.errors}`);

                    // Clear all caches after successful import
                    cacheService.clearAll();

                    // Generate import summary and complete progress tracking
                    if (progressTracker && progressTracker.completeSession) {
                        // Generate comprehensive import summary
                        generateImportSummary(currentDate, responseData, finalStats)
                            .then(summary => {
                                summary.sessionId = sessionId;
                                const enhancedStats = {
                                    ...finalStats,
                                    importSummary: summary
                                };
                                progressTracker.completeSession(sessionId, "Import completed successfully", enhancedStats);
                            })
                            .catch(summaryErr => {
                                console.error("Error generating import summary:", summaryErr);
                                // Complete without summary if generation fails
                                progressTracker.completeSession(sessionId, "Import completed successfully", finalStats);
                            });
                    }
                });
            });
        });
    });
}

/**
 * Calculate and store enhanced daily totals with VPR distribution
 */
function calculateAndStoreDailyTotalsEnhanced(scanDate, callback) {
    const db = global.db;

    if (!scanDate) {
        console.warn("calculateAndStoreDailyTotalsEnhanced called without scanDate");
        if (callback) {callback();}
        return;
    }

    console.log("📊 Calculating enhanced daily totals for:", scanDate);

    const totalsQuery = `
        SELECT
            severity,
            COUNT(*) as count,
            SUM(max_vpr) as total_vpr,
            SUM(reopened_flag) as reopened_count
        FROM (
            SELECT
                severity,
                hostname,
                COALESCE(plugin_id, SUBSTR(description, 1, 100)) as dedup_key,
                MAX(vpr_score) as max_vpr,
                MAX(CASE WHEN lifecycle_state = 'reopened' THEN 1 ELSE 0 END) as reopened_flag
            FROM vulnerabilities_current
            WHERE scan_date = ? AND lifecycle_state IN ('active', 'reopened')
            GROUP BY severity, hostname, dedup_key
        ) grouped
        GROUP BY severity
    `;

    db.all(totalsQuery, [scanDate], (err, results = []) => {
        if (err) {
            console.error("Error calculating enhanced daily totals:", err);
            if (callback) {callback();}
            return;
        }

        db.get(
            `SELECT COUNT(*) AS resolved_count
             FROM (
                SELECT hostname,
                       COALESCE(plugin_id, SUBSTR(description, 1, 100)) as dedup_key
                FROM vulnerabilities_current
                WHERE resolved_date = ?
                GROUP BY hostname, dedup_key
             ) grouped`,
            [scanDate],
            (resolvedErr, resolvedRow) => {
                if (resolvedErr) {
                    console.error("Error getting resolved count for daily totals:", resolvedErr);
                    if (callback) {callback();}
                    return;
                }

                const resolvedCount = resolvedRow ? resolvedRow.resolved_count : 0;

                const totals = {
                    critical_count: 0,
                    critical_total_vpr: 0,
                    high_count: 0,
                    high_total_vpr: 0,
                    medium_count: 0,
                    medium_total_vpr: 0,
                    low_count: 0,
                    low_total_vpr: 0,
                    total_vulnerabilities: 0,
                    total_vpr: 0,
                    reopened_count: 0
                };

                results.forEach((row) => {
                    const severity = (row.severity || "").toLowerCase();
                    const count = Number(row.count) || 0;
                    const totalVpr = Number(row.total_vpr) || 0;
                    const reopened = Number(row.reopened_count) || 0;

                    switch (severity) {
                        case "critical":
                            totals.critical_count = count;
                            totals.critical_total_vpr = totalVpr;
                            break;
                        case "high":
                            totals.high_count = count;
                            totals.high_total_vpr = totalVpr;
                            break;
                        case "medium":
                            totals.medium_count = count;
                            totals.medium_total_vpr = totalVpr;
                            break;
                        case "low":
                            totals.low_count = count;
                            totals.low_total_vpr = totalVpr;
                            break;
                        default:
                            break;
                    }

                    totals.total_vulnerabilities += count;
                    totals.total_vpr += totalVpr;
                    totals.reopened_count += reopened;
                });

                db.run(
                    `INSERT OR REPLACE INTO vulnerability_daily_totals (
                        scan_date,
                        critical_count,
                        critical_total_vpr,
                        high_count,
                        high_total_vpr,
                        medium_count,
                        medium_total_vpr,
                        low_count,
                        low_total_vpr,
                        total_vulnerabilities,
                        total_vpr,
                        resolved_count,
                        reopened_count
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                    [
                        scanDate,
                        totals.critical_count,
                        totals.critical_total_vpr,
                        totals.high_count,
                        totals.high_total_vpr,
                        totals.medium_count,
                        totals.medium_total_vpr,
                        totals.low_count,
                        totals.low_total_vpr,
                        totals.total_vulnerabilities,
                        totals.total_vpr,
                        resolvedCount,
                        totals.reopened_count
                    ],
                    (storeErr) => {
                        if (storeErr) {
                            console.error("Error storing enhanced daily totals:", storeErr);
                        } else {
                            console.log(`✅ Enhanced daily totals updated for ${scanDate}`);
                        }
                        if (callback) {callback();}
                    }
                );
            }
        );
    });
}

/**
 * Update daily totals (simplified version for non-batch imports)
 */
function _updateDailyTotals(scanDate, callback) {
    // Just call the enhanced version
    calculateAndStoreDailyTotalsEnhanced(scanDate, callback);
}

/**
 * Import CSV file with standard processing (non-staging)
 */
async function importCSV(filepath, filename, vendor, scanDate, _options = {}) {
    try {
        // Read and parse CSV
        const csvData = PathValidator.safeReadFileSync(filepath, "utf8");
        const results = await parseCSV(csvData);
        const rows = results.data.filter(row => Object.values(row).some(val => val && val.trim()));

        // Extract metadata
        const fileSize = PathValidator.safeStatSync(filepath).size;
        const extractedVendor = vendor || extractVendorFromFilename(filename);
        const extractedDate = scanDate || extractDateFromFilename(filename);

        // Create import record
        const { importId, _importDate } = await createImportRecord({
            filename,
            vendor: extractedVendor,
            scanDate: extractedDate,
            rowCount: rows.length,
            fileSize,
            headers: results.meta.fields
        });

        console.log(`📝 Import record created: ID ${importId}, Processing ${rows.length} rows`);

        // Process vulnerabilities
        const result = await processVulnerabilitiesWithLifecycle(rows, importId, filepath, extractedDate);

        return {
            success: true,
            importId,
            filename,
            processingTime: Date.now() - Date.parse(importDate),
            ...result
        };
    } catch (error) {
        console.error("Import failed:", error);
        throw error;
    }
}

/**
 * Import CSV file with staging (high-performance)
 */
async function importCsvStaging(filepath, filename, vendor, scanDate, sessionId, progressTracker, _options = {}) {
    const startTime = Date.now();

    try {
        // Read and parse CSV
        const csvData = PathValidator.safeReadFileSync(filepath, "utf8");
        const results = await parseCSV(csvData);
        const rows = results.data.filter(row => Object.values(row).some(val => val && val.trim()));

        // Extract metadata
        const fileSize = PathValidator.safeStatSync(filepath).size;
        const extractedVendor = vendor || extractVendorFromFilename(filename);
        const extractedDate = scanDate || extractDateFromFilename(filename);

        // Create import record
        const { importId, _importDate } = await createImportRecord({
            filename,
            vendor: extractedVendor,
            scanDate: extractedDate,
            rowCount: rows.length,
            fileSize,
            headers: results.meta.fields
        });

        console.log("🚀 STAGING IMPORT: Starting high-performance CSV import");
        console.log(`📊 File: ${filename}, Vendor: ${extractedVendor}, Scan Date: ${extractedDate}`);
        console.log(`📝 Import record created: ID ${importId}`);

        // Update progress
        if (progressTracker && progressTracker.updateProgress) {
            progressTracker.updateProgress(sessionId, 15, `Parsed ${rows.length} rows from CSV`, {
                currentStep: 1,
                rowCount: rows.length
            });
        }

        // Load to staging table with batch processing
        const responseData = {
            success: true,
            importId,
            filename,
            vendor: extractedVendor,
            scanDate: extractedDate,
            stagingMode: true
        };

        const result = await bulkLoadToStagingTable(
            rows,
            importId,
            extractedDate,
            filepath,
            responseData,
            sessionId,
            startTime,
            progressTracker
        );

        return {
            success: true,
            importId,
            filename,
            processingTime: Date.now() - startTime,
            ...result
        };
    } catch (error) {
        console.error("Staging import failed:", error);
        if (progressTracker && progressTracker.errorSession) {
            progressTracker.errorSession(sessionId, "Import failed: " + error.message, { error });
        }
        throw error;
    }
}

/**
 * Generate comprehensive import summary for progress completion
 * @param {string} scanDate - Scan date for comparison
 * @param {Object} importMetadata - Import metadata (filename, vendor, etc.)
 * @param {Object} processingStats - Processing statistics from import
 * @returns {Promise<Object>} Import summary object
 */
async function generateImportSummary(scanDate, importMetadata, processingStats) {
    return new Promise((resolve, reject) => {
        const db = global.db;

        console.log("📊 Generating import summary for scan date:", scanDate);

        // Get current and previous daily totals for comparison
        const totalsQuery = `
            SELECT
                scan_date,
                critical_count, critical_total_vpr,
                high_count, high_total_vpr,
                medium_count, medium_total_vpr,
                low_count, low_total_vpr,
                total_vulnerabilities, total_vpr,
                resolved_count, reopened_count
            FROM vulnerability_daily_totals
            ORDER BY scan_date DESC
            LIMIT 2
        `;

        db.all(totalsQuery, [], (err, totalsRows) => {
            if (err) {
                console.error("Error fetching daily totals for summary:", err);
                return reject(err);
            }

            const currentTotals = totalsRows[0] || {};
            const previousTotals = totalsRows[1] || {};

            // Calculate severity impact
            const severityImpact = {
                critical: {
                    current: currentTotals.critical_count || 0,
                    previous: previousTotals.critical_count || 0,
                    netChange: (currentTotals.critical_count || 0) - (previousTotals.critical_count || 0),
                    vprChange: (currentTotals.critical_total_vpr || 0) - (previousTotals.critical_total_vpr || 0)
                },
                high: {
                    current: currentTotals.high_count || 0,
                    previous: previousTotals.high_count || 0,
                    netChange: (currentTotals.high_count || 0) - (previousTotals.high_count || 0),
                    vprChange: (currentTotals.high_total_vpr || 0) - (previousTotals.high_total_vpr || 0)
                },
                medium: {
                    current: currentTotals.medium_count || 0,
                    previous: previousTotals.medium_count || 0,
                    netChange: (currentTotals.medium_count || 0) - (previousTotals.medium_count || 0),
                    vprChange: (currentTotals.medium_total_vpr || 0) - (previousTotals.medium_total_vpr || 0)
                },
                low: {
                    current: currentTotals.low_count || 0,
                    previous: previousTotals.low_count || 0,
                    netChange: (currentTotals.low_count || 0) - (previousTotals.low_count || 0),
                    vprChange: (currentTotals.low_total_vpr || 0) - (previousTotals.low_total_vpr || 0)
                }
            };

            // Find new CVEs introduced in this scan
            const newCvesQuery = `
                SELECT
                    cve,
                    severity,
                    COUNT(*) as hostCount,
                    ROUND(SUM(vpr_score), 2) as totalVpr,
                    MIN(scan_date) as firstSeen
                FROM vulnerabilities_current
                WHERE scan_date = ?
                  AND lifecycle_state IN ('active', 'reopened')
                  AND cve IS NOT NULL
                  AND cve NOT IN (
                      SELECT DISTINCT cve
                      FROM vulnerability_snapshots
                      WHERE scan_date < ?
                        AND cve IS NOT NULL
                  )
                GROUP BY cve, severity
                ORDER BY severity, hostCount DESC
            `;

            // Find CVEs that were REMOVED/RESOLVED in this scan (no longer present)
            const resolvedCvesQuery = `
                SELECT
                    prev.cve,
                    prev.severity,
                    COUNT(DISTINCT prev.hostname) as hostCount,
                    ROUND(SUM(prev.vpr_score), 2) as totalVpr,
                    MAX(prev.scan_date) as lastSeen
                FROM vulnerability_snapshots prev
                WHERE prev.scan_date < ?
                  AND prev.cve IS NOT NULL
                  AND prev.cve NOT IN (
                      SELECT DISTINCT cve
                      FROM vulnerabilities_current
                      WHERE scan_date = ?
                        AND cve IS NOT NULL
                  )
                GROUP BY prev.cve, prev.severity
                ORDER BY prev.severity, hostCount DESC
            `;

            db.all(newCvesQuery, [scanDate, scanDate], (cveErr, newCveRows) => {
                if (cveErr) {
                    console.error("Error finding new CVEs:", cveErr);
                    // Continue without CVE discovery data
                }

                const newCves = newCveRows || [];
                const totalNewVulnerabilities = newCves.reduce((sum, cve) => sum + cve.hostCount, 0);
                const totalNewVpr = newCves.reduce((sum, cve) => sum + cve.totalVpr, 0);

                // Query for resolved CVEs
                db.all(resolvedCvesQuery, [scanDate, scanDate], (resolvedErr, resolvedCveRows) => {
                    if (resolvedErr) {
                        console.error("Error finding resolved CVEs:", resolvedErr);
                        // Continue without resolved CVE data
                    }

                    const resolvedCves = resolvedCveRows || [];
                    const totalResolvedVulnerabilities = resolvedCves.reduce((sum, cve) => sum + cve.hostCount, 0);
                    const totalResolvedVpr = resolvedCves.reduce((sum, cve) => sum + cve.totalVpr, 0);

                    // Calculate percentage changes
                    const totalPrevious = previousTotals.total_vulnerabilities || 0;
                    const totalCurrent = currentTotals.total_vulnerabilities || 0;
                    const percentageChange = totalPrevious > 0 ?
                        ((totalCurrent - totalPrevious) / totalPrevious * 100) : 0;

                    // Get unique hosts affected
                    const hostsQuery = `
                        SELECT COUNT(DISTINCT hostname) as uniqueHosts
                        FROM vulnerabilities_current
                        WHERE scan_date = ? AND lifecycle_state IN ('active', 'reopened')
                    `;

                    db.get(hostsQuery, [scanDate], (hostsErr, hostsResult) => {
                        if (hostsErr) {
                            console.error("Error counting unique hosts:", hostsErr);
                        }

                        const uniqueHosts = hostsResult ? hostsResult.uniqueHosts : 0;

                    // Build comprehensive summary
                    const summary = {
                        sessionId: null, // Will be set by caller
                        importMetadata: {
                            filename: importMetadata.filename || "unknown",
                            vendor: importMetadata.vendor || "unknown",
                            scanDate: scanDate,
                            importId: importMetadata.importId,
                            totalRows: importMetadata.totalRows || 0,
                            processingTime: processingStats.processingTime || 0
                        },
                        cveDiscovery: {
                            newCves: newCves.map(cve => ({
                                cve: cve.cve,
                                severity: cve.severity,
                                hostCount: cve.hostCount,
                                totalVpr: cve.totalVpr,
                                firstSeen: cve.firstSeen
                            })),
                            totalNewCves: newCves.length,
                            totalNewVulnerabilities: totalNewVulnerabilities,
                            totalNewVpr: Math.round(totalNewVpr * 100) / 100,
                            // Resolved/removed CVEs
                            resolvedCves: resolvedCves.map(cve => ({
                                cve: cve.cve,
                                severity: cve.severity,
                                hostCount: cve.hostCount,
                                totalVpr: cve.totalVpr,
                                lastSeen: cve.lastSeen
                            })),
                            totalResolvedCves: resolvedCves.length,
                            totalResolvedVulnerabilities: totalResolvedVulnerabilities,
                            totalResolvedVpr: Math.round(totalResolvedVpr * 100) / 100
                        },
                        severityImpact: severityImpact,
                        hostImpact: {
                            totalUniqueHosts: uniqueHosts,
                            newHostsAffected: 0, // Could be calculated if needed
                            existingHostsUpdated: 0 // Could be calculated if needed
                        },
                        comparison: {
                            previousTotal: totalPrevious,
                            currentTotal: totalCurrent,
                            netChange: totalCurrent - totalPrevious,
                            percentageChange: Math.round(percentageChange * 100) / 100,
                            significantChange: Math.abs(percentageChange) > 25,
                            changeThreshold: 25,
                            resolvedCount: currentTotals.resolved_count || 0,
                            reopenedCount: currentTotals.reopened_count || 0
                        }
                    };

                    console.log("✅ Import summary generated:", {
                        newCves: summary.cveDiscovery.totalNewCves,
                        resolvedCves: summary.cveDiscovery.totalResolvedCves,
                        totalChange: summary.comparison.netChange,
                        percentChange: summary.comparison.percentageChange
                    });

                    resolve(summary);
                    });
                });
            });
        });
    });
}

// Export the service functions
module.exports = {
    extractDateFromFilename,
    extractScanDateFromFilename: extractDateFromFilename, // Alias for compatibility
    extractVendorFromFilename,
    importCSV,
    importCsvStaging,
    processVulnerabilitiesWithLifecycle,
    bulkLoadToStagingTable,
    processStagingToFinalTables,
    generateImportSummary
};
