const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const csv = require('csv-parser');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = process.env.PORT || 3040;
const JWT_SECRET = process.env.JWT_SECRET || 'hextrackr-secret-key-change-in-production';

// PostgreSQL Database setup
const pool = new Pool({
    host: process.env.PGHOST || 'localhost',
    port: process.env.PGPORT || 5432,
    database: process.env.PGDATABASE || 'hextrackr',
    user: process.env.PGUSER || 'hextrackr',
    password: process.env.PGPASSWORD || 'hextrackr123',
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
});

// Test database connection
pool.connect((err, client, release) => {
    if (err) {
        console.error('Error connecting to PostgreSQL database:', err.message);
    } else {
        console.log('Connected to PostgreSQL database');
        release();
    }
});

// Middleware
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net", "https://cdnjs.cloudflare.com", "https://cdn.tailwindcss.com"],
            scriptSrc: ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net", "https://cdnjs.cloudflare.com", "https://cdn.tailwindcss.com"],
            imgSrc: ["'self'", "data:", "https:"],
            fontSrc: ["'self'", "https://cdnjs.cloudflare.com"],
            connectSrc: ["'self'", "https://cloudsso.cisco.com", "https://api.cisco.com"]
        }
    }
}));

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 1000, // limit each IP to 1000 requests per windowMs
    message: 'Too many requests from this IP'
});
app.use(limiter);

// Import database service
const databaseService = require('./database-service.js');

// File upload configuration
const upload = multer({
    dest: 'uploads/',
    limits: {
        fileSize: 100 * 1024 * 1024 // 100MB limit for large CSV files
    }
});

// Block access to deprecated files
app.use('/deprecated', (req, res) => {
    res.status(404).json({ error: 'File not found - deprecated services have been moved' });
});

// Block specific deprecated file requests
app.use(/\/(sqlite-service\.js|turso-service\.js|turso-config\.js|turso-demo\.js)$/, (req, res) => {
    res.status(404).json({ error: 'Service deprecated - please use PostgreSQL backend' });
});

// Serve static files with proper MIME types and security
app.use(express.static(path.join(__dirname), {
    setHeaders: (res, filePath) => {
        // Block access to deprecated files
        if (filePath.includes('deprecated/') || filePath.includes('deprecated\\')) {
            res.status(404).end();
            return;
        }
        
        if (filePath.endsWith('.css')) {
            res.set('Content-Type', 'text/css');
            res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
            res.set('Pragma', 'no-cache');
            res.set('Expires', '0');
        }
        if (filePath.endsWith('.js')) {
            res.set('Content-Type', 'application/javascript');
            res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
            res.set('Pragma', 'no-cache');
            res.set('Expires', '0');
        }
        if (filePath.endsWith('.html')) {
            res.set('Content-Type', 'text/html');
            res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
            res.set('Pragma', 'no-cache');
            res.set('Expires', '0');
        }
    }
}));

// Authentication middleware
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.sendStatus(401);
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
};

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Large CSV Import Endpoints

// Import the large 64MB Cisco vulnerabilities CSV
app.post('/api/import/cisco-csv', async (req, res) => {
    try {
        console.log('🚀 Starting large Cisco CSV import...');
        
        // Check if the large CSV file exists
        const largeCsvPath = path.join(__dirname, 'cisco-vulnerabilities-08_19_2025_-09_02_16-cdt.csv');
        
        if (!fs.existsSync(largeCsvPath)) {
            return res.status(404).json({
                success: false,
                error: 'Large CSV file not found',
                path: largeCsvPath
            });
        }

        // Get file stats
        const stats = fs.statSync(largeCsvPath);
        console.log(`📊 File size: ${(stats.size / 1024 / 1024).toFixed(2)} MB`);

        // Start streaming import
        const result = await databaseService.importCsvFile(largeCsvPath, 'vulnerabilities');
        
        res.json({
            success: true,
            message: 'CSV import completed successfully',
            ...result,
            fileSize: `${(stats.size / 1024 / 1024).toFixed(2)} MB`
        });

    } catch (error) {
        console.error('❌ CSV import error:', error);
        res.status(500).json({
            success: false,
            error: error.message,
            details: 'Failed to import large CSV file'
        });
    }
});

// Upload and import CSV files
app.post('/api/import/upload-csv', upload.single('csvFile'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                error: 'No file uploaded'
            });
        }

        const csvType = req.body.csvType || 'vulnerabilities';
        console.log(`🚀 Importing uploaded CSV: ${req.file.originalname} (${csvType})`);

        // Import the uploaded file
        const result = await databaseService.importCsvFile(req.file.path, csvType);

        // Clean up uploaded file
        fs.unlinkSync(req.file.path);

        res.json({
            success: true,
            message: 'CSV file imported successfully',
            filename: req.file.originalname,
            ...result
        });

    } catch (error) {
        console.error('❌ Upload CSV import error:', error);
        
        // Clean up file on error
        if (req.file && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }

        res.status(500).json({
            success: false,
            error: error.message,
            details: 'Failed to import uploaded CSV file'
        });
    }
});

// Get vulnerability statistics
app.get('/api/vulnerabilities/stats', async (req, res) => {
    try {
        const stats = await databaseService.getVulnerabilityStats();
        res.json({
            success: true,
            data: stats
        });
    } catch (error) {
        console.error('❌ Stats error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Search vulnerabilities with filters
app.get('/api/vulnerabilities/search', async (req, res) => {
    try {
        const filters = {
            search: req.query.search,
            severity: req.query.severity,
            status: req.query.status,
            limit: parseInt(req.query.limit) || 100
        };

        const vulnerabilities = await databaseService.searchVulnerabilities(filters);
        
        res.json({
            success: true,
            data: vulnerabilities,
            count: vulnerabilities.length
        });
    } catch (error) {
        console.error('❌ Search error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Get import progress (for real-time updates)
app.get('/api/import/status', (req, res) => {
    // This could be enhanced with real-time progress tracking
    res.json({
        success: true,
        message: 'Import status endpoint - enhance with real-time progress tracking'
    });
});

// Debug: List available files
app.get('/debug/files', (req, res) => {
    const fs = require('fs');
    const files = fs.readdirSync(__dirname).filter(file => 
        file.endsWith('.html') || file.endsWith('.css') || file.endsWith('.js')
    );
    res.json({ availableFiles: files, directory: __dirname });
});

// Serve main application
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Serve tickets page
app.get('/tickets.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'tickets.html'));
});

// Serve any other HTML files
app.get('/*.html', (req, res) => {
    const fileName = req.params[0] + '.html';
    const filePath = path.join(__dirname, fileName);
    
    // Check if file exists
    if (require('fs').existsSync(filePath)) {
        res.sendFile(filePath);
    } else {
        res.status(404).send('Page not found');
    }
});

// Authentication endpoints
app.post('/api/auth/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        const result = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
        const user = result.rows[0];

        if (!user || !(await bcrypt.compare(password, user.password_hash))) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const token = jwt.sign(
            { id: user.id, username: user.username, role: user.role },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({ 
            token, 
            user: { 
                id: user.id, 
                username: user.username, 
                email: user.email, 
                role: user.role 
            } 
        });
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ error: 'Database error' });
    }
});

// Assets endpoints - adapted to work with Cisco vulnerability data
app.get('/api/assets', (req, res) => {
    const query = `
        SELECT 
            unnest(affected_products) as hostname,
            '0.0.0.0' as ip_address,
            'Cisco' as vendor,
            'Unknown' as operating_system,
            COUNT(*) as vulnerability_count,
            SUM(CASE WHEN severity = 'critical' THEN 1 ELSE 0 END) as critical_count,
            SUM(CASE WHEN severity = 'high' THEN 1 ELSE 0 END) as high_count,
            SUM(CASE WHEN severity = 'medium' THEN 1 ELSE 0 END) as medium_count,
            SUM(CASE WHEN severity = 'low' THEN 1 ELSE 0 END) as low_count,
            AVG(cvss_score) as avg_vpr_score
        FROM vulnerabilities 
        WHERE status = 'open' AND affected_products IS NOT NULL
        GROUP BY unnest(affected_products)
        HAVING COUNT(*) > 0
        ORDER BY critical_count DESC, high_count DESC, avg_vpr_score DESC
        LIMIT 50
    `;

    pool.query(query)
        .then(result => {
            res.json(result.rows);
        })
        .catch(err => {
            console.error('Error querying assets:', err);
            res.status(500).json({ error: 'Failed to fetch assets' });
        });
});

app.post('/api/assets', authenticateToken, async (req, res) => {
    const { hostname, ip_address, vendor, operating_system, risk_level, business_criticality, notes } = req.body;

    const query = `
        INSERT INTO assets (hostname, ip_address, vendor, operating_system, risk_level, business_criticality, notes)
        VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id
    `;

    try {
        const result = await pool.query(query, [hostname, ip_address, vendor, operating_system, risk_level, business_criticality, notes]);
        res.json({ id: result.rows[0].id });
    } catch (err) {
        console.error('Asset creation error:', err);
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/assets/:id', authenticateToken, async (req, res) => {
    const { hostname, ip_address, vendor, operating_system, risk_level, business_criticality, notes } = req.body;
    const { id } = req.params;

    const query = `
        UPDATE assets 
        SET hostname = $1, ip_address = $2, vendor = $3, operating_system = $4, 
            risk_level = $5, business_criticality = $6, notes = $7, updated_at = CURRENT_TIMESTAMP
        WHERE id = $8
    `;

    try {
        const result = await pool.query(query, [hostname, ip_address, vendor, operating_system, risk_level, business_criticality, notes, id]);
        res.json({ changes: result.rowCount });
    } catch (err) {
        console.error('Asset update error:', err);
        res.status(500).json({ error: err.message });
    }
});

// Vulnerabilities endpoints - adapted for Cisco vulnerability data
app.get('/api/vulnerabilities', (req, res) => {
    const { severity, status } = req.query;
    let query = `
        SELECT 
            id,
            advisory_id,
            title,
            summary,
            description,
            severity,
            vpr_score,
            cvss_score,
            publication_date,
            status,
            affected_products,
            cve_ids,
            asset_ip,
            asset_name as hostname,
            vendor
        FROM vulnerabilities
        WHERE 1=1
    `;
    const params = [];
    let paramCount = 0;

    if (severity) {
        paramCount++;
        query += ` AND severity = $${paramCount}`;
        params.push(severity);
    }
    if (status) {
        paramCount++;
        query += ` AND status = $${paramCount}`;
        params.push(status);
    } else {
        // Default to open vulnerabilities only
        paramCount++;
        query += ` AND status = $${paramCount}`;
        params.push('open');
    }

    query += ' ORDER BY vpr_score DESC NULLS LAST, severity DESC LIMIT 1000';

    pool.query(query, params)
        .then(result => {
            // Transform data to match frontend expectations
            const transformedData = result.rows.map(row => ({
                ...row,
                hostname: row.hostname || (row.affected_products && row.affected_products[0]) || 'Unknown',
                ip_address: row.asset_ip || '192.168.1.1',
                vulnerability_id: row.advisory_id,
                cve: row.cve_ids && row.cve_ids[0] || '',
                // Keep VPR score properly mapped
                vpr_score: row.vpr_score
            }));
            
            res.json(transformedData);
        })
        .catch(err => {
            console.error('Error querying vulnerabilities:', err);
            res.status(500).json({ error: 'Failed to fetch vulnerabilities' });
        });
});

// Tickets endpoints
app.get('/api/tickets', authenticateToken, async (req, res) => {
    const query = `
        SELECT t.*, a.hostname, a.ip_address,
               COUNT(tv.vulnerability_id) as vulnerability_count
        FROM tickets t
        LEFT JOIN assets a ON t.asset_id = a.id
        LEFT JOIN ticket_vulnerabilities tv ON t.id = tv.ticket_id
        GROUP BY t.id
        ORDER BY 
            CASE t.priority 
                WHEN 'critical' THEN 1 
                WHEN 'high' THEN 2 
                WHEN 'medium' THEN 3 
                ELSE 4 
            END,
            t.created_at DESC
    `;

    try {
        const result = await pool.query(query);
        res.json(result.rows);
    } catch (err) {
        console.error('Tickets query error:', err);
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/tickets', authenticateToken, async (req, res) => {
    const { ticket_number, title, description, priority, status, assignee, asset_id, snow_number } = req.body;

    const query = `
        INSERT INTO tickets (ticket_number, title, description, priority, status, assignee, asset_id, snow_number)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id
    `;

    try {
        const result = await pool.query(query, [ticket_number, title, description, priority, status, assignee, asset_id, snow_number]);
        res.json({ id: result.rows[0].id });
    } catch (err) {
        console.error('Ticket creation error:', err);
        res.status(500).json({ error: err.message });
    }
});

// CSV upload endpoint
app.post('/api/upload/csv', authenticateToken, upload.single('csvFile'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
    }

    const results = [];
    const filePath = req.file.path;

    fs.createReadStream(filePath)
        .pipe(csv())
        .on('data', (data) => results.push(data))
        .on('end', async () => {
            try {
                // Process and insert data in batches
                const batchSize = 100;
                let processed = 0;

                for (let i = 0; i < results.length; i += batchSize) {
                    const batch = results.slice(i, i + batchSize);
                    await processBatch(batch);
                    processed += batch.length;
                    
                    // Send progress update
                    if (processed % 1000 === 0) {
                        console.log(`Processed ${processed}/${results.length} records`);
                    }
                }

                // Clean up uploaded file
                fs.unlinkSync(filePath);

                res.json({ 
                    message: 'CSV processed successfully', 
                    recordsProcessed: processed 
                });
            } catch (error) {
                console.error('CSV processing error:', error);
                res.status(500).json({ error: 'Failed to process CSV' });
            }
        })
        .on('error', (error) => {
            console.error('CSV parsing error:', error);
            res.status(500).json({ error: 'Failed to parse CSV' });
        });
});

// Process batch of CSV records
async function processBatch(batch) {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        for (const record of batch) {
            // Insert or update asset using PostgreSQL UPSERT
            const assetQuery = `
                INSERT INTO assets (hostname, ip_address, vendor, operating_system)
                VALUES ($1, $2, $3, $4)
                ON CONFLICT (hostname) DO UPDATE SET
                    ip_address = EXCLUDED.ip_address,
                    vendor = EXCLUDED.vendor,
                    operating_system = EXCLUDED.operating_system
            `;
            await client.query(assetQuery, [record.hostname, record.ipAddress, record.vendor, record.operatingSystem]);

            // Insert vulnerability
            const vulnQuery = `
                INSERT INTO vulnerabilities 
                (asset_id, cve_id, definition_name, severity, vpr_score, cvss_score, description)
                VALUES (
                    (SELECT id FROM assets WHERE hostname = $1),
                    $2, $3, $4, $5, $6, $7
                )
            `;
            await client.query(vulnQuery, [
                record.hostname,
                record.cve || record.definitionId,
                record.definitionName,
                record.severity,
                parseFloat(record.vprScore) || 0,
                parseFloat(record.cvssScore) || 0,
                record.description
            ]);
        }

        await client.query('COMMIT');
    } catch (err) {
        await client.query('ROLLBACK');
        throw err;
    } finally {
        client.release();
    }
}

// ServiceNow integration endpoints
app.get('/api/servicenow/ticket/:snow_number', authenticateToken, async (req, res) => {
    const { snow_number } = req.params;
    
    // This is a placeholder for ServiceNow integration
    // In a real implementation, you would make API calls to ServiceNow
    res.json({
        snow_number,
        status: 'open',
        assigned_to: 'IT Team',
        short_description: `ServiceNow ticket ${snow_number}`,
        description: 'Placeholder for ServiceNow integration',
        priority: 'high',
        created_on: new Date().toISOString()
    });
});

// Free Tenable VPR API integration
app.get('/api/tenable/vpr/:cve', authenticateToken, async (req, res) => {
    const { cve } = req.params;
    
    try {
        // This uses Tenable's free VPR API (no key required for basic CVE lookups)
        const response = await fetch(`https://www.tenable.com/plugins/vpr/${cve}`);
        
        if (response.ok) {
            const data = await response.text(); // Returns HTML, would need parsing
            res.json({
                cve,
                vpr_score: 'Available via web scraping',
                message: 'Free Tenable VPR data available'
            });
        } else {
            res.status(404).json({ error: 'CVE not found in Tenable database' });
        }
    } catch (error) {
        console.error('Tenable VPR API error:', error);
        res.status(500).json({ error: 'Failed to fetch VPR data' });
    }
});

// Cisco PSIRT API proxy to handle CORS
app.post('/api/cisco/oauth/token', authenticateToken, async (req, res) => {
    const { client_id, client_secret } = req.body;
    
    if (!client_id || !client_secret) {
        return res.status(400).json({ error: 'Client ID and Client Secret are required' });
    }
    
    try {
        console.log('🔧 Proxying Cisco OAuth request...');
        
        const response = await fetch('https://cloudsso.cisco.com/as/token.oauth2', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Accept': 'application/json'
            },
            body: new URLSearchParams({
                grant_type: 'client_credentials',
                client_id: client_id,
                client_secret: client_secret
            })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            console.log('✅ Cisco OAuth token obtained successfully');
            res.json(data);
        } else {
            console.error('❌ Cisco OAuth error:', data);
            res.status(response.status).json(data);
        }
    } catch (error) {
        console.error('🔥 Cisco API proxy error:', error);
        res.status(500).json({ 
            error: 'Failed to connect to Cisco API',
            details: error.message 
        });
    }
});

// Cisco PSIRT advisories proxy
app.get('/api/cisco/advisories', authenticateToken, async (req, res) => {
    const { access_token } = req.query;
    
    if (!access_token) {
        return res.status(400).json({ error: 'Access token is required' });
    }
    
    try {
        console.log('📡 Fetching Cisco security advisories...');
        
        const response = await fetch('https://api.cisco.com/security/advisories/v2/advisories', {
            headers: {
                'Authorization': `Bearer ${access_token}`,
                'Accept': 'application/json'
            }
        });
        
        const data = await response.json();
        
        if (response.ok) {
            console.log(`✅ Retrieved ${data.advisories?.length || 0} Cisco advisories`);
            res.json(data);
        } else {
            console.error('❌ Cisco advisories error:', data);
            res.status(response.status).json(data);
        }
    } catch (error) {
        console.error('🔥 Cisco advisories proxy error:', error);
        res.status(500).json({ 
            error: 'Failed to fetch Cisco advisories',
            details: error.message 
        });
    }
});

// Dashboard stats endpoint
app.get('/api/dashboard/stats', async (req, res) => {
    try {
        const queries = {
            totalAssets: 'SELECT COUNT(*) as count FROM assets',
            totalVulnerabilities: 'SELECT COUNT(*) as count FROM vulnerabilities WHERE status = \'open\'',
            criticalVulns: 'SELECT COUNT(*) as count FROM vulnerabilities WHERE severity = \'critical\' AND status = \'open\'',
            openTickets: 'SELECT COUNT(*) as count FROM tickets WHERE status IN (\'open\', \'in_progress\')',
            severityBreakdown: `
                SELECT severity, COUNT(*) as count 
                FROM vulnerabilities 
                WHERE status = 'open' 
                GROUP BY severity
            `,
            topRiskyAssets: `
                SELECT a.hostname, a.ip_address, COUNT(v.id) as vuln_count,
                       SUM(CASE WHEN v.severity = 'critical' THEN 1 ELSE 0 END) as critical_count
                FROM assets a
                JOIN vulnerabilities v ON a.id = v.asset_id
                WHERE v.status = 'open'
                GROUP BY a.id
                ORDER BY critical_count DESC, vuln_count DESC
                LIMIT 5
            `
        };

        const results = {};
        
        for (const [key, query] of Object.entries(queries)) {
            try {
                const result = await pool.query(query);
                results[key] = result.rows;
            } catch (err) {
                console.error(`Error in ${key} query:`, err);
                results[key] = [];
            }
        }
        
        res.json(results);
    } catch (error) {
        console.error('Dashboard stats error:', error);
        res.status(500).json({ error: 'Failed to fetch dashboard stats' });
    }
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 HexTrackr server running on port ${PORT}`);
    console.log(`📊 Dashboard: http://localhost:${PORT}`);
    console.log(`🔒 API: http://localhost:${PORT}/api`);
});

// Graceful shutdown
process.on('SIGINT', async () => {
    console.log('\n🛑 Shutting down gracefully...');
    try {
        await pool.end();
        console.log('Database connection pool closed.');
    } catch (err) {
        console.error('Error closing database pool:', err);
    }
    process.exit(0);
});
