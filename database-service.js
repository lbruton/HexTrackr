/**
 * HexTrackr Database Service - PostgreSQL with Large CSV Import Support
 * Handles vulnerability data with streaming CSV processing for large files
 */

const { Pool } = require('pg');
const fs = require('fs');
const fastCsv = require('fast-csv');

class DatabaseService {
    constructor() {
        // Use environment variables or defaults for PostgreSQL connection
        this.pool = new Pool({
            user: process.env.PGUSER || 'hextrackr',
            password: process.env.PGPASSWORD || 'hextrackr123',
            host: process.env.PGHOST || 'localhost',
            port: process.env.PGPORT || 5432,
            database: process.env.PGDATABASE || 'hextrackr',
            max: 20, // Maximum number of clients in the pool
            idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
            connectionTimeoutMillis: 2000, // Return error after 2 seconds if connection could not be established
            maxLifetimeSeconds: 60 // Close (and replace) a connection after 60 seconds
        });

        // Handle pool errors
        this.pool.on('error', (err, client) => {
            console.error('🚨 Unexpected error on idle client:', err);
        });

        this.isReady = false;
        this.initializeDatabase();
    }

    /**
     * Initialize database schema
     */
    async initializeDatabase() {
        try {
            console.log('🔧 Initializing PostgreSQL database...');
            
            // Create tables if they don't exist
            await this.query(`
                CREATE TABLE IF NOT EXISTS vulnerabilities (
                    id SERIAL PRIMARY KEY,
                    advisory_id VARCHAR(255) UNIQUE NOT NULL,
                    title TEXT NOT NULL,
                    summary TEXT,
                    description TEXT,
                    severity VARCHAR(50),
                    cvss_score DECIMAL(3,1),
                    cvss_vector TEXT,
                    cve_ids TEXT[],
                    affected_products TEXT[],
                    cisco_bug_ids TEXT[],
                    publication_date TIMESTAMP,
                    last_updated TIMESTAMP,
                    workarounds TEXT,
                    fixed_software TEXT[],
                    status VARCHAR(50) DEFAULT 'open',
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                );
            `);

            await this.query(`
                CREATE TABLE IF NOT EXISTS assets (
                    id SERIAL PRIMARY KEY,
                    hostname VARCHAR(255) UNIQUE NOT NULL,
                    ip_address INET,
                    vendor VARCHAR(255),
                    operating_system VARCHAR(255),
                    risk_level VARCHAR(50) DEFAULT 'medium',
                    last_scan TIMESTAMP,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                );
            `);

            await this.query(`
                CREATE TABLE IF NOT EXISTS tickets (
                    id SERIAL PRIMARY KEY,
                    title VARCHAR(255) NOT NULL,
                    description TEXT,
                    status VARCHAR(50) DEFAULT 'open',
                    priority VARCHAR(50) DEFAULT 'medium',
                    assigned_to VARCHAR(255),
                    vulnerability_count INTEGER DEFAULT 0,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                );
            `);

            await this.query(`
                CREATE TABLE IF NOT EXISTS ticket_vulnerabilities (
                    id SERIAL PRIMARY KEY,
                    ticket_id INTEGER REFERENCES tickets(id) ON DELETE CASCADE,
                    vulnerability_id INTEGER REFERENCES vulnerabilities(id) ON DELETE CASCADE,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    UNIQUE(ticket_id, vulnerability_id)
                );
            `);

            // Create indexes for better performance
            await this.query(`
                CREATE INDEX IF NOT EXISTS idx_vulnerabilities_advisory_id ON vulnerabilities(advisory_id);
                CREATE INDEX IF NOT EXISTS idx_vulnerabilities_severity ON vulnerabilities(severity);
                CREATE INDEX IF NOT EXISTS idx_vulnerabilities_status ON vulnerabilities(status);
                CREATE INDEX IF NOT EXISTS idx_assets_hostname ON assets(hostname);
                CREATE INDEX IF NOT EXISTS idx_tickets_status ON tickets(status);
            `);

            this.isReady = true;
            console.log('✅ PostgreSQL database initialized successfully');
            
        } catch (error) {
            console.error('❌ Failed to initialize database:', error);
            throw error;
        }
    }

    /**
     * Execute a query with optional parameters
     */
    async query(text, params = []) {
        const start = Date.now();
        try {
            const res = await this.pool.query(text, params);
            const duration = Date.now() - start;
            console.log('📊 Query executed:', { 
                text: text.substring(0, 100) + (text.length > 100 ? '...' : ''), 
                duration: `${duration}ms`, 
                rows: res.rowCount 
            });
            return res;
        } catch (error) {
            console.error('❌ Query error:', error);
            throw error;
        }
    }

    /**
     * Get a client for transactions
     */
    async getClient() {
        return await this.pool.connect();
    }

    /**
     * Import large CSV file with streaming for memory efficiency
     */
    async importCsvFile(filePath, csvType = 'vulnerabilities') {
        return new Promise((resolve, reject) => {
            console.log(`🚀 Starting streaming import of ${csvType} from ${filePath}`);
            
            const batchSize = 1000; // Process in batches of 1000 rows
            let batch = [];
            let totalProcessed = 0;
            let totalErrors = 0;

            const stream = fs.createReadStream(filePath)
                .pipe(fastCsv.parse({ headers: true, trim: true }))
                .on('data', async (row) => {
                    batch.push(row);
                    
                    if (batch.length >= batchSize) {
                        // Pause the stream while processing batch
                        stream.pause();
                        
                        try {
                            await this.processBatch(batch, csvType);
                            totalProcessed += batch.length;
                            console.log(`📈 Processed ${totalProcessed} ${csvType} records`);
                        } catch (error) {
                            console.error(`❌ Batch processing error:`, error);
                            totalErrors++;
                        }
                        
                        batch = [];
                        stream.resume();
                    }
                })
                .on('end', async () => {
                    // Process final batch if any remaining
                    if (batch.length > 0) {
                        try {
                            await this.processBatch(batch, csvType);
                            totalProcessed += batch.length;
                        } catch (error) {
                            console.error(`❌ Final batch processing error:`, error);
                            totalErrors++;
                        }
                    }
                    
                    console.log(`✅ CSV import completed: ${totalProcessed} records processed, ${totalErrors} errors`);
                    resolve({
                        success: true,
                        totalProcessed,
                        totalErrors,
                        message: `Successfully imported ${totalProcessed} ${csvType} records`
                    });
                })
                .on('error', (error) => {
                    console.error(`❌ CSV import error:`, error);
                    reject(error);
                });
        });
    }

    /**
     * Process a batch of CSV rows
     */
    async processBatch(batch, csvType) {
        const client = await this.getClient();
        
        try {
            await client.query('BEGIN');
            
            for (const row of batch) {
                if (csvType === 'vulnerabilities') {
                    await this.insertVulnerability(client, row);
                } else if (csvType === 'assets') {
                    await this.insertAsset(client, row);
                }
            }
            
            await client.query('COMMIT');
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }

    /**
     * Insert vulnerability record from CSV row
     */
    async insertVulnerability(client, row) {
        // Map CSV columns to database fields (adjust based on your CSV structure)
        const query = `
            INSERT INTO vulnerabilities (
                advisory_id, title, summary, description, severity, cvss_score,
                cvss_vector, cve_ids, affected_products, cisco_bug_ids,
                publication_date, last_updated, workarounds, fixed_software
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
            ON CONFLICT (advisory_id) DO UPDATE SET
                title = EXCLUDED.title,
                summary = EXCLUDED.summary,
                description = EXCLUDED.description,
                severity = EXCLUDED.severity,
                cvss_score = EXCLUDED.cvss_score,
                last_updated = EXCLUDED.last_updated,
                updated_at = CURRENT_TIMESTAMP
        `;

        const values = [
            row.advisory_id || row.Advisory_ID || row.id,
            row.title || row.Title || '',
            row.summary || row.Summary || '',
            row.description || row.Description || '',
            row.severity || row.Severity || 'medium',
            parseFloat(row.cvss_score || row.CVSS_Score) || null,
            row.cvss_vector || row.CVSS_Vector || null,
            this.parseArrayField(row.cve_ids || row.CVE_IDs),
            this.parseArrayField(row.affected_products || row.Affected_Products),
            this.parseArrayField(row.cisco_bug_ids || row.Cisco_Bug_IDs),
            this.parseDate(row.publication_date || row.Publication_Date),
            this.parseDate(row.last_updated || row.Last_Updated),
            row.workarounds || row.Workarounds || null,
            this.parseArrayField(row.fixed_software || row.Fixed_Software)
        ];

        await client.query(query, values);
    }

    /**
     * Insert asset record from CSV row
     */
    async insertAsset(client, row) {
        const query = `
            INSERT INTO assets (hostname, ip_address, vendor, operating_system, risk_level)
            VALUES ($1, $2, $3, $4, $5)
            ON CONFLICT (hostname) DO UPDATE SET
                ip_address = EXCLUDED.ip_address,
                vendor = EXCLUDED.vendor,
                operating_system = EXCLUDED.operating_system,
                risk_level = EXCLUDED.risk_level,
                updated_at = CURRENT_TIMESTAMP
        `;

        const values = [
            row.hostname || row.Hostname,
            row.ip_address || row.IP_Address || null,
            row.vendor || row.Vendor || null,
            row.operating_system || row.OS || null,
            row.risk_level || row.Risk_Level || 'medium'
        ];

        await client.query(query, values);
    }

    /**
     * Parse array fields from CSV (comma-separated values)
     */
    parseArrayField(value) {
        if (!value) return null;
        if (Array.isArray(value)) return value;
        return value.split(',').map(item => item.trim()).filter(item => item.length > 0);
    }

    /**
     * Parse date fields from CSV
     */
    parseDate(dateString) {
        if (!dateString) return null;
        const parsed = new Date(dateString);
        return isNaN(parsed.getTime()) ? null : parsed;
    }

    /**
     * Get vulnerability statistics
     */
    async getVulnerabilityStats() {
        const stats = await this.query(`
            SELECT 
                COUNT(*) as total,
                COUNT(CASE WHEN severity = 'critical' THEN 1 END) as critical,
                COUNT(CASE WHEN severity = 'high' THEN 1 END) as high,
                COUNT(CASE WHEN severity = 'medium' THEN 1 END) as medium,
                COUNT(CASE WHEN severity = 'low' THEN 1 END) as low,
                COUNT(CASE WHEN status = 'open' THEN 1 END) as open,
                COUNT(CASE WHEN status = 'closed' THEN 1 END) as closed
            FROM vulnerabilities
        `);
        
        return stats.rows[0];
    }

    /**
     * Search vulnerabilities with filters
     */
    async searchVulnerabilities(filters = {}) {
        let query = 'SELECT * FROM vulnerabilities WHERE 1=1';
        const params = [];
        let paramIndex = 1;

        if (filters.search) {
            query += ` AND (title ILIKE $${paramIndex} OR description ILIKE $${paramIndex} OR advisory_id ILIKE $${paramIndex})`;
            params.push(`%${filters.search}%`);
            paramIndex++;
        }

        if (filters.severity) {
            query += ` AND severity = $${paramIndex}`;
            params.push(filters.severity);
            paramIndex++;
        }

        if (filters.status) {
            query += ` AND status = $${paramIndex}`;
            params.push(filters.status);
            paramIndex++;
        }

        query += ' ORDER BY publication_date DESC';
        
        if (filters.limit) {
            query += ` LIMIT $${paramIndex}`;
            params.push(filters.limit);
        }

        const result = await this.query(query, params);
        return result.rows;
    }

    /**
     * Close database connections
     */
    async close() {
        await this.pool.end();
        console.log('📛 Database connections closed');
    }
}

// Export singleton instance
const databaseService = new DatabaseService();
module.exports = databaseService;
