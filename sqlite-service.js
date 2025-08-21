/**
 * HexTrackr SQLite Service
 * Handles large vulnerability datasets using Web SQL Database API or IndexedDB
 */

class SQLiteService {
    constructor() {
        this.db = null;
        this.isReady = false;
        this.dbName = 'HexTrackrDB';
        this.version = '1.0';
        this.displayName = 'HexTrackr Vulnerability Database';
        this.maxSize = 200 * 1024 * 1024; // 200MB
    }

    /**
     * Initialize the database
     */
    async initialize() {
        try {
            if (typeof(openDatabase) !== 'undefined') {
                // Use Web SQL Database (deprecated but still available in Chrome)
                this.db = openDatabase(this.dbName, this.version, this.displayName, this.maxSize);
                await this.createTables();
                this.isReady = true;
                console.log('✅ SQLite Web SQL Database initialized');
                return true;
            } else {
                // Fallback to IndexedDB
                await this.initializeIndexedDB();
                this.isReady = true;
                console.log('✅ IndexedDB initialized as SQLite fallback');
                return true;
            }
        } catch (error) {
            console.error('❌ Failed to initialize database:', error);
            return false;
        }
    }

    /**
     * Initialize IndexedDB as fallback
     */
    async initializeIndexedDB() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, 1);
            
            request.onerror = () => reject(request.error);
            request.onsuccess = () => {
                this.db = request.result;
                resolve();
            };
            
            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                
                // Create vulnerabilities table
                if (!db.objectStoreNames.contains('vulnerabilities')) {
                    const vulnStore = db.createObjectStore('vulnerabilities', { keyPath: 'id', autoIncrement: true });
                    vulnStore.createIndex('hostname', 'hostname', { unique: false });
                    vulnStore.createIndex('severity', 'severity', { unique: false });
                    vulnStore.createIndex('cve', 'cve', { unique: false });
                }
                
                // Create tickets table
                if (!db.objectStoreNames.contains('tickets')) {
                    const ticketStore = db.createObjectStore('tickets', { keyPath: 'id' });
                    ticketStore.createIndex('status', 'status', { unique: false });
                    ticketStore.createIndex('priority', 'priority', { unique: false });
                }
            };
        });
    }

    /**
     * Create tables for Web SQL
     */
    async createTables() {
        return new Promise((resolve, reject) => {
            this.db.transaction(tx => {
                // Create vulnerabilities table
                tx.executeSql(`
                    CREATE TABLE IF NOT EXISTS vulnerabilities (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        hostname TEXT,
                        ip_address TEXT,
                        vendor TEXT,
                        product TEXT,
                        version TEXT,
                        cve TEXT,
                        severity TEXT,
                        score REAL,
                        vpr_score REAL,
                        description TEXT,
                        solution TEXT,
                        exploit_available INTEGER,
                        patch_available INTEGER,
                        created_date TEXT,
                        updated_date TEXT,
                        scan_date TEXT,
                        file_source TEXT,
                        definition_id TEXT,
                        state TEXT,
                        raw_data TEXT,
                        UNIQUE(hostname, cve, definition_id) ON CONFLICT REPLACE
                    )
                `);
                
                // Create VPR history table for tracking changes over time
                tx.executeSql(`
                    CREATE TABLE IF NOT EXISTS vpr_history (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        hostname TEXT,
                        cve TEXT,
                        definition_id TEXT,
                        vpr_score REAL,
                        severity TEXT,
                        scan_date TEXT,
                        file_source TEXT,
                        created_date TEXT,
                        UNIQUE(hostname, cve, definition_id, scan_date) ON CONFLICT REPLACE
                    )
                `);
                
                // Create tickets table
                tx.executeSql(`
                    CREATE TABLE IF NOT EXISTS tickets (
                        id TEXT PRIMARY KEY,
                        title TEXT,
                        description TEXT,
                        priority TEXT,
                        status TEXT,
                        assignee TEXT,
                        asset_hostname TEXT,
                        asset_ip TEXT,
                        vulnerability_count INTEGER,
                        risk_score INTEGER,
                        created_date TEXT,
                        updated_date TEXT,
                        notes TEXT
                    )
                `);
                
                console.log('✅ Database tables created successfully');
                resolve();
            }, error => {
                console.error('❌ Failed to create tables:', error);
                reject(error);
            });
        });
    }

    /**
     * Bulk insert vulnerabilities (for large CSV uploads)
     */
    async bulkInsertVulnerabilities(vulnerabilities, progressCallback) {
        if (!this.isReady) {
            throw new Error('Database not initialized');
        }

        const batchSize = 1000; // Process in batches
        const totalBatches = Math.ceil(vulnerabilities.length / batchSize);
        
        console.log(`🔄 Starting bulk insert of ${vulnerabilities.length} vulnerabilities in ${totalBatches} batches`);

        for (let i = 0; i < totalBatches; i++) {
            const start = i * batchSize;
            const end = Math.min(start + batchSize, vulnerabilities.length);
            const batch = vulnerabilities.slice(start, end);
            
            if (typeof(openDatabase) !== 'undefined') {
                await this.insertBatchWebSQL(batch);
            } else {
                await this.insertBatchIndexedDB(batch);
            }
            
            const progress = Math.round(((i + 1) / totalBatches) * 100);
            if (progressCallback) {
                progressCallback(progress, i + 1, totalBatches);
            }
            
            // Small delay to prevent UI blocking
            await new Promise(resolve => setTimeout(resolve, 10));
        }
        
        console.log('✅ Bulk insert completed successfully');
    }

    /**
     * Insert batch using Web SQL with VPR change tracking
     */
    async insertBatchWebSQL(batch) {
        return new Promise((resolve, reject) => {
            this.db.transaction(tx => {
                for (const vuln of batch) {
                    // First, check if this vulnerability already exists to track VPR changes
                    tx.executeSql(`
                        SELECT vpr_score, severity FROM vulnerabilities 
                        WHERE hostname = ? AND cve = ? AND definition_id = ?
                    `, [vuln.hostname || '', vuln.cve || '', vuln.definitionId || ''], 
                    (tx, result) => {
                        let isVprChange = false;
                        if (result.rows.length > 0) {
                            const existing = result.rows.item(0);
                            const existingVpr = parseFloat(existing.vpr_score) || 0;
                            const newVpr = parseFloat(vuln.vpr_score || vuln.vprScore) || 0;
                            
                            // Check if VPR score or severity changed
                            if (Math.abs(existingVpr - newVpr) > 0.1 || existing.severity !== vuln.severity) {
                                isVprChange = true;
                                console.log(`📊 VPR Change detected for ${vuln.hostname}/${vuln.cve}: ${existingVpr} → ${newVpr}`);
                            }
                        }
                        
                        // Insert/update main vulnerability record
                        tx.executeSql(`
                            INSERT OR REPLACE INTO vulnerabilities (
                                hostname, ip_address, vendor, product, version, cve, severity, score, vpr_score,
                                description, solution, exploit_available, patch_available, created_date, updated_date,
                                scan_date, file_source, definition_id, state, raw_data
                            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                        `, [
                            vuln.hostname || '',
                            vuln.ip_address || vuln.ipAddress || '',
                            vuln.vendor || '',
                            vuln.product || '',
                            vuln.version || '',
                            vuln.cve || '',
                            vuln.severity || '',
                            vuln.score || vuln.cvssScore || 0,
                            vuln.vpr_score || vuln.vprScore || 0,
                            vuln.description || vuln.definitionName || '',
                            vuln.solution || '',
                            vuln.exploit_available || vuln.exploitAvailable || 0,
                            vuln.patch_available || vuln.patchAvailable || 0,
                            vuln.created_date || vuln.createdDate || new Date().toISOString(),
                            new Date().toISOString(), // Always update the updated_date
                            vuln.scan_date || vuln.date || new Date().toISOString(),
                            vuln.file_source || vuln.fileSource || 'Unknown',
                            vuln.definitionId || vuln.definition_id || '',
                            vuln.state || 'ACTIVE',
                            JSON.stringify(vuln)
                        ]);
                        
                        // Always insert into VPR history for trending (even duplicates for historical tracking)
                        tx.executeSql(`
                            INSERT OR REPLACE INTO vpr_history (
                                hostname, cve, definition_id, vpr_score, severity, scan_date, file_source, created_date
                            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                        `, [
                            vuln.hostname || '',
                            vuln.cve || '',
                            vuln.definitionId || vuln.definition_id || '',
                            vuln.vpr_score || vuln.vprScore || 0,
                            vuln.severity || '',
                            vuln.scan_date || vuln.date || new Date().toISOString(),
                            vuln.file_source || vuln.fileSource || 'Unknown',
                            new Date().toISOString()
                        ]);
                    });
                }
            }, reject, resolve);
        });
    }

    /**
     * Insert batch using IndexedDB
     */
    async insertBatchIndexedDB(batch) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['vulnerabilities'], 'readwrite');
            const store = transaction.objectStore('vulnerabilities');
            
            transaction.oncomplete = () => resolve();
            transaction.onerror = () => reject(transaction.error);
            
            for (const vuln of batch) {
                store.add({
                    hostname: vuln.hostname || '',
                    ip_address: vuln.ip_address || vuln.ipAddress || '',
                    vendor: vuln.vendor || '',
                    product: vuln.product || '',
                    version: vuln.version || '',
                    cve: vuln.cve || '',
                    severity: vuln.severity || '',
                    score: vuln.score || vuln.cvssScore || 0,
                    vpr_score: vuln.vpr_score || vuln.vprScore || 0,
                    description: vuln.description || '',
                    solution: vuln.solution || '',
                    exploit_available: vuln.exploit_available || vuln.exploitAvailable || 0,
                    patch_available: vuln.patch_available || vuln.patchAvailable || 0,
                    created_date: vuln.created_date || vuln.createdDate || new Date().toISOString(),
                    updated_date: vuln.updated_date || vuln.updatedDate || new Date().toISOString(),
                    raw_data: JSON.stringify(vuln)
                });
            }
        });
    }

    /**
     * Get VPR trend data for dashboard charts
     */
    async getVPRTrends(hostname = null, days = 30) {
        if (!this.isReady) return [];
        
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - days);
        const cutoffISO = cutoffDate.toISOString();
        
        if (typeof(openDatabase) !== 'undefined' && this.db.transaction) {
            return new Promise((resolve, reject) => {
                const query = hostname 
                    ? `SELECT scan_date, severity, AVG(vpr_score) as avg_vpr, COUNT(*) as count 
                       FROM vpr_history 
                       WHERE hostname = ? AND scan_date >= ? 
                       GROUP BY scan_date, severity 
                       ORDER BY scan_date ASC`
                    : `SELECT scan_date, severity, AVG(vpr_score) as avg_vpr, COUNT(*) as count 
                       FROM vpr_history 
                       WHERE scan_date >= ? 
                       GROUP BY scan_date, severity 
                       ORDER BY scan_date ASC`;
                
                const params = hostname ? [hostname, cutoffISO] : [cutoffISO];
                
                this.db.transaction(tx => {
                    tx.executeSql(query, params, (tx, result) => {
                        const trends = [];
                        for (let i = 0; i < result.rows.length; i++) {
                            trends.push(result.rows.item(i));
                        }
                        resolve(trends);
                    }, (tx, error) => {
                        console.error('Error fetching VPR trends:', error);
                        resolve([]);
                    });
                });
            });
        } else {
            // IndexedDB fallback - simplified implementation
            return [];
        }
    }

    /**
     * Get VPR changes between scans
     */
    async getVPRChanges(days = 7) {
        if (!this.isReady) return [];
        
        if (typeof(openDatabase) !== 'undefined' && this.db.transaction) {
            return new Promise((resolve, reject) => {
                this.db.transaction(tx => {
                    tx.executeSql(`
                        SELECT 
                            h1.hostname,
                            h1.cve,
                            h1.definition_id,
                            h1.vpr_score as old_vpr,
                            h2.vpr_score as new_vpr,
                            h1.severity as old_severity,
                            h2.severity as new_severity,
                            h1.scan_date as old_date,
                            h2.scan_date as new_date,
                            ABS(h2.vpr_score - h1.vpr_score) as vpr_change
                        FROM vpr_history h1
                        JOIN vpr_history h2 ON h1.hostname = h2.hostname 
                            AND h1.cve = h2.cve 
                            AND h1.definition_id = h2.definition_id
                            AND h1.scan_date < h2.scan_date
                        WHERE ABS(h2.vpr_score - h1.vpr_score) > 0.1
                            AND h2.scan_date >= datetime('now', '-${days} days')
                        ORDER BY vpr_change DESC, h2.scan_date DESC
                        LIMIT 100
                    `, [], (tx, result) => {
                        const changes = [];
                        for (let i = 0; i < result.rows.length; i++) {
                            changes.push(result.rows.item(i));
                        }
                        resolve(changes);
                    }, (tx, error) => {
                        console.error('Error fetching VPR changes:', error);
                        resolve([]);
                    });
                });
            });
        }
        
        return []; // IndexedDB implementation would be more complex
    }

    /**
     * Get all vulnerabilities with pagination
     */
    async getVulnerabilities(offset = 0, limit = 1000) {
        if (!this.isReady) {
            throw new Error('Database not initialized');
        }

        if (typeof(openDatabase) !== 'undefined') {
            return this.getVulnerabilitiesWebSQL(offset, limit);
        } else {
            return this.getVulnerabilitiesIndexedDB(offset, limit);
        }
    }

    /**
     * Get vulnerabilities using Web SQL
     */
    async getVulnerabilitiesWebSQL(offset, limit) {
        return new Promise((resolve, reject) => {
            this.db.transaction(tx => {
                tx.executeSql(
                    'SELECT * FROM vulnerabilities ORDER BY id DESC LIMIT ? OFFSET ?',
                    [limit, offset],
                    (tx, result) => {
                        const vulnerabilities = [];
                        for (let i = 0; i < result.rows.length; i++) {
                            const row = result.rows.item(i);
                            vulnerabilities.push({
                                id: row.id,
                                hostname: row.hostname,
                                ipAddress: row.ip_address,
                                vendor: row.vendor,
                                product: row.product,
                                version: row.version,
                                cve: row.cve,
                                severity: row.severity,
                                cvssScore: row.score,
                                vprScore: row.vpr_score,
                                description: row.description,
                                solution: row.solution,
                                exploitAvailable: row.exploit_available,
                                patchAvailable: row.patch_available,
                                createdDate: row.created_date,
                                updatedDate: row.updated_date
                            });
                        }
                        resolve(vulnerabilities);
                    },
                    (tx, error) => reject(error)
                );
            });
        });
    }

    /**
     * Get vulnerabilities using IndexedDB
     */
    async getVulnerabilitiesIndexedDB(offset, limit) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['vulnerabilities'], 'readonly');
            const store = transaction.objectStore('vulnerabilities');
            const request = store.getAll();
            
            request.onsuccess = () => {
                const allVulns = request.result;
                const paginatedVulns = allVulns.slice(offset, offset + limit);
                resolve(paginatedVulns.map(vuln => ({
                    id: vuln.id,
                    hostname: vuln.hostname,
                    ipAddress: vuln.ip_address,
                    vendor: vuln.vendor,
                    product: vuln.product,
                    version: vuln.version,
                    cve: vuln.cve,
                    severity: vuln.severity,
                    cvssScore: vuln.score,
                    vprScore: vuln.vpr_score,
                    description: vuln.description,
                    solution: vuln.solution,
                    exploitAvailable: vuln.exploit_available,
                    patchAvailable: vuln.patch_available,
                    createdDate: vuln.created_date,
                    updatedDate: vuln.updated_date
                })));
            };
            
            request.onerror = () => reject(request.error);
        });
    }

    /**
     * Clear all vulnerability data
     */
    async clearVulnerabilities() {
        if (!this.isReady) {
            throw new Error('Database not initialized');
        }

        if (typeof(openDatabase) !== 'undefined') {
            return new Promise((resolve, reject) => {
                this.db.transaction(tx => {
                    tx.executeSql('DELETE FROM vulnerabilities', [], resolve, reject);
                });
            });
        } else {
            return new Promise((resolve, reject) => {
                const transaction = this.db.transaction(['vulnerabilities'], 'readwrite');
                const store = transaction.objectStore('vulnerabilities');
                const request = store.clear();
                
                request.onsuccess = () => resolve();
                request.onerror = () => reject(request.error);
            });
        }
    }

    /**
     * Get database statistics
     */
    async getStats() {
        if (!this.isReady) {
            return { vulnerabilities: 0, tickets: 0 };
        }

        if (typeof(openDatabase) !== 'undefined') {
            return new Promise((resolve, reject) => {
                this.db.transaction(tx => {
                    tx.executeSql('SELECT COUNT(*) as count FROM vulnerabilities', [], (tx, result) => {
                        const vulnCount = result.rows.item(0).count;
                        tx.executeSql('SELECT COUNT(*) as count FROM tickets', [], (tx, result) => {
                            const ticketCount = result.rows.item(0).count;
                            resolve({ vulnerabilities: vulnCount, tickets: ticketCount });
                        });
                    }, reject);
                });
            });
        } else {
            // IndexedDB stats implementation
            return new Promise((resolve, reject) => {
                const transaction = this.db.transaction(['vulnerabilities', 'tickets'], 'readonly');
                let vulnCount = 0, ticketCount = 0;
                let completed = 0;
                
                const vulnStore = transaction.objectStore('vulnerabilities');
                const vulnRequest = vulnStore.count();
                vulnRequest.onsuccess = () => {
                    vulnCount = vulnRequest.result;
                    if (++completed === 2) resolve({ vulnerabilities: vulnCount, tickets: ticketCount });
                };
                
                const ticketStore = transaction.objectStore('tickets');
                const ticketRequest = ticketStore.count();
                ticketRequest.onsuccess = () => {
                    ticketCount = ticketRequest.result;
                    if (++completed === 2) resolve({ vulnerabilities: vulnCount, tickets: ticketCount });
                };
                
                transaction.onerror = () => reject(transaction.error);
            });
        }
    }
}

// Initialize the SQLite service
window.sqliteService = new SQLiteService();
