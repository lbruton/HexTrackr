/**
 * HexTrackr Turso Database Service
 * Handles connection, synchronization, and CRUD operations with Turso SQLite database
 * Enhanced with rate limiting and batch processing for large CSV uploads
 */

class TursoService {
    constructor() {
        this.client = null;
        this.isConnected = false;
        this.config = {
            url: '',
            authToken: ''
        };
        this.maxRetries = 3;
        this.retryDelay = 1000;
        
        // Rate limiting and throttling configuration
        this.rateLimit = {
            requestsPerSecond: 10, // Conservative limit
            requestsPerMinute: 500,
            batchSize: 100, // Records per batch
            throttleDelay: 100, // ms between batches
            currentRequests: 0,
            requestWindow: 1000, // 1 second window
            lastReset: Date.now()
        };
        
        // Upload progress tracking
        this.uploadStats = {
            totalRecords: 0,
            processedRecords: 0,
            errors: 0,
            startTime: null,
            estimatedTimeRemaining: 0
        };
    }

    /**
     * Initialize Turso connection with configuration
     */
    async initialize(config) {
        try {
            this.config = config;
            
            // Import Turso client
            if (typeof window !== 'undefined' && window.libsql) {
                const { createClient } = window.libsql;
                this.client = createClient({
                    url: config.url,
                    authToken: config.authToken
                });
            } else {
                throw new Error('Turso libsql client not loaded');
            }

            // Test connection
            await this.testConnection();
            this.isConnected = true;
            
            // Initialize database schema
            await this.initializeSchema();
            
            console.log('✅ Turso service initialized successfully');
            return true;
        } catch (error) {
            console.error('❌ Failed to initialize Turso service:', error);
            this.isConnected = false;
            throw error;
        }
    }

    /**
     * Test database connection
     */
    async testConnection() {
        if (!this.client) {
            throw new Error('Turso client not initialized');
        }

        try {
            const result = await this.client.execute('SELECT 1 as test');
            return result.rows.length > 0;
        } catch (error) {
            throw new Error(`Connection test failed: ${error.message}`);
        }
    }

    /**
     * Check and enforce rate limiting
     */
    async checkRateLimit() {
        const now = Date.now();
        
        // Reset rate limit window if needed
        if (now - this.rateLimit.lastReset >= this.rateLimit.requestWindow) {
            this.rateLimit.currentRequests = 0;
            this.rateLimit.lastReset = now;
        }
        
        // Check if we've hit the rate limit
        if (this.rateLimit.currentRequests >= this.rateLimit.requestsPerSecond) {
            const waitTime = this.rateLimit.requestWindow - (now - this.rateLimit.lastReset);
            if (waitTime > 0) {
                console.log(`🚦 Rate limit reached. Waiting ${waitTime}ms...`);
                await new Promise(resolve => setTimeout(resolve, waitTime));
                this.rateLimit.currentRequests = 0;
                this.rateLimit.lastReset = Date.now();
            }
        }
        
        this.rateLimit.currentRequests++;
    }

    /**
     * Upload large CSV data with throttling and progress tracking
     */
    async uploadLargeDataset(data, options = {}) {
        const {
            onProgress = null,
            batchSize = this.rateLimit.batchSize,
            throttleDelay = this.rateLimit.throttleDelay
        } = options;

        console.log(`📊 Starting large dataset upload: ${data.length} records`);
        
        // Initialize upload stats
        this.uploadStats = {
            totalRecords: data.length,
            processedRecords: 0,
            errors: 0,
            startTime: Date.now(),
            estimatedTimeRemaining: 0
        };

        const batches = this.createBatches(data, batchSize);
        const results = {
            success: 0,
            errors: 0,
            duplicates: 0,
            details: []
        };

        try {
            for (let i = 0; i < batches.length; i++) {
                const batch = batches[i];
                const batchNumber = i + 1;
                
                console.log(`📦 Processing batch ${batchNumber}/${batches.length} (${batch.length} records)`);
                
                try {
                    // Rate limiting check
                    await this.checkRateLimit();
                    
                    // Process batch
                    const batchResult = await this.processBatch(batch, batchNumber);
                    
                    // Update results
                    results.success += batchResult.success;
                    results.errors += batchResult.errors;
                    results.duplicates += batchResult.duplicates;
                    results.details.push(batchResult);
                    
                    // Update progress
                    this.uploadStats.processedRecords += batch.length;
                    this.uploadStats.errors += batchResult.errors;
                    
                    // Calculate ETA
                    this.updateETA();
                    
                    // Report progress
                    if (onProgress) {
                        onProgress({
                            ...this.uploadStats,
                            currentBatch: batchNumber,
                            totalBatches: batches.length,
                            batchResult
                        });
                    }
                    
                    // Throttle between batches
                    if (i < batches.length - 1) {
                        await new Promise(resolve => setTimeout(resolve, throttleDelay));
                    }
                    
                } catch (batchError) {
                    console.error(`❌ Batch ${batchNumber} failed:`, batchError);
                    results.errors += batch.length;
                    this.uploadStats.errors += batch.length;
                    
                    results.details.push({
                        batch: batchNumber,
                        success: 0,
                        errors: batch.length,
                        duplicates: 0,
                        error: batchError.message
                    });
                }
            }
            
            const totalTime = Date.now() - this.uploadStats.startTime;
            console.log(`✅ Upload completed in ${Math.round(totalTime/1000)}s`);
            console.log(`📈 Success: ${results.success}, Errors: ${results.errors}, Duplicates: ${results.duplicates}`);
            
            return {
                ...results,
                uploadTime: totalTime,
                recordsPerSecond: Math.round(this.uploadStats.totalRecords / (totalTime / 1000))
            };
            
        } catch (error) {
            console.error('❌ Upload failed:', error);
            throw error;
        }
    }

    /**
     * Create batches from data array
     */
    createBatches(data, batchSize) {
        const batches = [];
        for (let i = 0; i < data.length; i += batchSize) {
            batches.push(data.slice(i, i + batchSize));
        }
        return batches;
    }

    /**
     * Process a single batch with transaction support
     */
    async processBatch(batch, batchNumber) {
        const result = {
            batch: batchNumber,
            success: 0,
            errors: 0,
            duplicates: 0,
            errorDetails: []
        };

        try {
            // Use transaction for batch
            await this.client.batch(
                batch.map(record => ({
                    sql: `INSERT OR REPLACE INTO vulnerabilities 
                          (hostname, ip_address, cve, definition_id, definition_name, 
                           severity, vpr_score, vendor, state, date_created) 
                          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                    args: [
                        record.hostname || '',
                        record.ipAddress || '',
                        record.cve || '',
                        record.definitionId || '',
                        record.name || '',
                        record.severity || 'UNKNOWN',
                        parseFloat(record.vprScore) || 0,
                        record.vendor || '',
                        record.state || 'ACTIVE',
                        record.dateCreated || new Date().toISOString()
                    ]
                }))
            );
            
            result.success = batch.length;
            
        } catch (error) {
            console.error(`Batch ${batchNumber} error:`, error);
            result.errors = batch.length;
            result.errorDetails.push(error.message);
        }
        
        return result;
    }

    /**
     * Update estimated time remaining
     */
    updateETA() {
        const elapsed = Date.now() - this.uploadStats.startTime;
        const processed = this.uploadStats.processedRecords;
        const remaining = this.uploadStats.totalRecords - processed;
        
        if (processed > 0) {
            const timePerRecord = elapsed / processed;
            this.uploadStats.estimatedTimeRemaining = Math.round(timePerRecord * remaining);
        }
    }

    /**
     * Get upload progress information
     */
    getUploadProgress() {
        const progress = (this.uploadStats.processedRecords / this.uploadStats.totalRecords) * 100;
        return {
            ...this.uploadStats,
            progressPercentage: Math.round(progress),
            recordsPerSecond: this.calculateRecordsPerSecond()
        };
    }

    /**
     * Calculate current records per second rate
     */
    calculateRecordsPerSecond() {
        if (!this.uploadStats.startTime || this.uploadStats.processedRecords === 0) {
            return 0;
        }
        
        const elapsed = (Date.now() - this.uploadStats.startTime) / 1000;
        return Math.round(this.uploadStats.processedRecords / elapsed);
    }

    /**
     * Initialize database schema for vulnerabilities and tickets
     */
    async initializeSchema() {
        const schemas = [
            // Vulnerabilities table
            `CREATE TABLE IF NOT EXISTS vulnerabilities (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                hostname TEXT NOT NULL,
                ip_address TEXT,
                cve TEXT,
                definition_id TEXT,
                definition_name TEXT,
                severity TEXT NOT NULL,
                vpr_score REAL DEFAULT 0,
                vendor TEXT,
                state TEXT DEFAULT 'ACTIVE',
                date_created TEXT,
                date_updated TEXT DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(hostname, definition_id)
            )`,
            
            // Tickets table
            `CREATE TABLE IF NOT EXISTS tickets (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                hexagon_ticket TEXT UNIQUE NOT NULL,
                service_now TEXT,
                location TEXT NOT NULL,
                devices TEXT,
                supervisor TEXT NOT NULL,
                tech TEXT NOT NULL,
                status TEXT DEFAULT 'Open',
                notes TEXT,
                date_submitted TEXT,
                date_due TEXT,
                date_created TEXT DEFAULT CURRENT_TIMESTAMP,
                date_updated TEXT DEFAULT CURRENT_TIMESTAMP
            )`,
            
            // Sync metadata table
            `CREATE TABLE IF NOT EXISTS sync_metadata (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                table_name TEXT NOT NULL,
                last_sync TEXT DEFAULT CURRENT_TIMESTAMP,
                record_count INTEGER DEFAULT 0,
                sync_status TEXT DEFAULT 'pending'
            )`
        ];

        for (const schema of schemas) {
            try {
                await this.client.execute(schema);
            } catch (error) {
                console.error('Schema creation error:', error);
                throw error;
            }
        }

        // Initialize sync metadata
        await this.updateSyncMetadata('vulnerabilities', 0);
        await this.updateSyncMetadata('tickets', 0);
    }

    /**
     * Sync vulnerabilities to Turso database
     */
    async syncVulnerabilities(vulnerabilities) {
        if (!this.isConnected) {
            throw new Error('Turso service not connected');
        }

        try {
            console.log(`🔄 Syncing ${vulnerabilities.length} vulnerabilities to Turso...`);
            
            // Clear existing data for fresh sync
            await this.client.execute('DELETE FROM vulnerabilities');
            
            // Batch insert vulnerabilities
            const batchSize = 100;
            let syncedCount = 0;
            
            for (let i = 0; i < vulnerabilities.length; i += batchSize) {
                const batch = vulnerabilities.slice(i, i + batchSize);
                await this.insertVulnerabilityBatch(batch);
                syncedCount += batch.length;
                
                // Update progress
                const progress = Math.round((syncedCount / vulnerabilities.length) * 100);
                this.notifyProgress('vulnerabilities', progress, syncedCount, vulnerabilities.length);
            }

            // Update sync metadata
            await this.updateSyncMetadata('vulnerabilities', syncedCount);
            
            console.log(`✅ Successfully synced ${syncedCount} vulnerabilities to Turso`);
            return { success: true, count: syncedCount };
            
        } catch (error) {
            console.error('❌ Failed to sync vulnerabilities:', error);
            throw error;
        }
    }

    /**
     * Insert batch of vulnerabilities
     */
    async insertVulnerabilityBatch(vulnerabilities) {
        const transaction = await this.client.transaction();
        
        try {
            for (const vuln of vulnerabilities) {
                await transaction.execute({
                    sql: `INSERT OR REPLACE INTO vulnerabilities 
                          (hostname, ip_address, cve, definition_id, definition_name, 
                           severity, vpr_score, vendor, state, date_created)
                          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                    args: [
                        vuln.hostname || '',
                        vuln.ipAddress || '',
                        vuln.cve || '',
                        vuln.definitionId || '',
                        vuln.definitionName || '',
                        vuln.severity || 'info',
                        vuln.vprScore || 0,
                        vuln.vendor || '',
                        vuln.state || 'ACTIVE',
                        vuln.date || new Date().toISOString()
                    ]
                });
            }
            
            await transaction.commit();
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }

    /**
     * Load vulnerabilities from Turso database
     */
    async loadVulnerabilities() {
        if (!this.isConnected) {
            throw new Error('Turso service not connected');
        }

        try {
            const result = await this.client.execute('SELECT * FROM vulnerabilities ORDER BY date_created DESC');
            
            // Transform database format back to application format
            const vulnerabilities = result.rows.map(row => ({
                hostname: row.hostname,
                ipAddress: row.ip_address,
                cve: row.cve,
                definitionId: row.definition_id,
                definitionName: row.definition_name,
                severity: row.severity,
                vprScore: parseFloat(row.vpr_score) || 0,
                vendor: row.vendor,
                state: row.state,
                date: row.date_created
            }));

            console.log(`📥 Loaded ${vulnerabilities.length} vulnerabilities from Turso`);
            return vulnerabilities;
            
        } catch (error) {
            console.error('❌ Failed to load vulnerabilities:', error);
            throw error;
        }
    }

    /**
     * Sync tickets to Turso database
     */
    async syncTickets(tickets) {
        if (!this.isConnected) {
            throw new Error('Turso service not connected');
        }

        try {
            console.log(`🔄 Syncing ${tickets.length} tickets to Turso...`);
            
            // Clear existing data for fresh sync
            await this.client.execute('DELETE FROM tickets');
            
            // Insert tickets
            for (const ticket of tickets) {
                await this.client.execute({
                    sql: `INSERT OR REPLACE INTO tickets 
                          (hexagon_ticket, service_now, location, devices, supervisor, 
                           tech, status, notes, date_submitted, date_due)
                          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                    args: [
                        ticket.hexagonTicket || '',
                        ticket.serviceNow || '',
                        ticket.location || '',
                        JSON.stringify(ticket.devices || []),
                        ticket.supervisor || '',
                        ticket.tech || '',
                        ticket.status || 'Open',
                        ticket.notes || '',
                        ticket.dateSubmitted || '',
                        ticket.dateDue || ''
                    ]
                });
            }

            // Update sync metadata
            await this.updateSyncMetadata('tickets', tickets.length);
            
            console.log(`✅ Successfully synced ${tickets.length} tickets to Turso`);
            return { success: true, count: tickets.length };
            
        } catch (error) {
            console.error('❌ Failed to sync tickets:', error);
            throw error;
        }
    }

    /**
     * Load tickets from Turso database
     */
    async loadTickets() {
        if (!this.isConnected) {
            throw new Error('Turso service not connected');
        }

        try {
            const result = await this.client.execute('SELECT * FROM tickets ORDER BY date_created DESC');
            
            // Transform database format back to application format
            const tickets = result.rows.map(row => ({
                id: row.id,
                hexagonTicket: row.hexagon_ticket,
                serviceNow: row.service_now,
                location: row.location,
                devices: JSON.parse(row.devices || '[]'),
                supervisor: row.supervisor,
                tech: row.tech,
                status: row.status,
                notes: row.notes,
                dateSubmitted: row.date_submitted,
                dateDue: row.date_due
            }));

            console.log(`📥 Loaded ${tickets.length} tickets from Turso`);
            return tickets;
            
        } catch (error) {
            console.error('❌ Failed to load tickets:', error);
            throw error;
        }
    }

    /**
     * Update sync metadata
     */
    async updateSyncMetadata(tableName, recordCount) {
        await this.client.execute({
            sql: `INSERT OR REPLACE INTO sync_metadata 
                  (table_name, last_sync, record_count, sync_status)
                  VALUES (?, CURRENT_TIMESTAMP, ?, 'completed')`,
            args: [tableName, recordCount]
        });
    }

    /**
     * Get sync metadata
     */
    async getSyncMetadata() {
        const result = await this.client.execute('SELECT * FROM sync_metadata');
        return result.rows;
    }

    /**
     * Execute custom query
     */
    async query(sql, args = []) {
        if (!this.isConnected) {
            throw new Error('Turso service not connected');
        }

        try {
            return await this.client.execute({ sql, args });
        } catch (error) {
            console.error('Query execution error:', error);
            throw error;
        }
    }

    /**
     * Get database statistics
     */
    async getStatistics() {
        try {
            const [vulnCount, ticketCount, metadata] = await Promise.all([
                this.client.execute('SELECT COUNT(*) as count FROM vulnerabilities'),
                this.client.execute('SELECT COUNT(*) as count FROM tickets'),
                this.getSyncMetadata()
            ]);

            return {
                vulnerabilities: vulnCount.rows[0]?.count || 0,
                tickets: ticketCount.rows[0]?.count || 0,
                lastSync: metadata.reduce((acc, meta) => {
                    acc[meta.table_name] = meta.last_sync;
                    return acc;
                }, {})
            };
        } catch (error) {
            console.error('Failed to get statistics:', error);
            return { vulnerabilities: 0, tickets: 0, lastSync: {} };
        }
    }

    /**
     * Disconnect from Turso
     */
    disconnect() {
        if (this.client) {
            this.client.close();
            this.client = null;
        }
        this.isConnected = false;
        console.log('🔌 Disconnected from Turso database');
    }

    /**
     * Notify progress for UI updates
     */
    notifyProgress(operation, progress, current, total) {
        // Dispatch custom event for UI to catch
        if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('tursoProgress', {
                detail: { operation, progress, current, total }
            }));
        }
    }

    /**
     * Retry mechanism for failed operations
     */
    async retryOperation(operation, maxRetries = this.maxRetries) {
        let lastError;
        
        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                return await operation();
            } catch (error) {
                lastError = error;
                if (attempt < maxRetries) {
                    console.warn(`Attempt ${attempt} failed, retrying in ${this.retryDelay}ms...`);
                    await new Promise(resolve => setTimeout(resolve, this.retryDelay));
                    this.retryDelay *= 2; // Exponential backoff
                }
            }
        }
        
        throw lastError;
    }
}

// Create global instance
window.tursoService = new TursoService();

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = TursoService;
}
