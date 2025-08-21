const express = require('express');
const sqlite3 = require('sqlite3').verbose();
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
const PORT = process.env.PORT || 3232;
const JWT_SECRET = process.env.JWT_SECRET || 'hextrackr-secret-key-change-in-production';

// Database setup
const dbPath = path.join(__dirname, 'data', 'hextrackr.db');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database:', err.message);
    } else {
        console.log('Connected to SQLite database at:', dbPath);
    }
});

// Middleware
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net", "https://cdnjs.cloudflare.com"],
            scriptSrc: ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net", "https://cdnjs.cloudflare.com"],
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

// File upload configuration
const upload = multer({
    dest: 'uploads/',
    limits: {
        fileSize: 60 * 1024 * 1024 // 60MB limit
    }
});

// Serve static files with proper MIME types
app.use(express.static(path.join(__dirname), {
    setHeaders: (res, path) => {
        if (path.endsWith('.css')) {
            res.set('Content-Type', 'text/css');
            res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
            res.set('Pragma', 'no-cache');
            res.set('Expires', '0');
        }
        if (path.endsWith('.js')) {
            res.set('Content-Type', 'application/javascript');
            res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
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

    db.get('SELECT * FROM users WHERE username = ?', [username], async (err, user) => {
        if (err) {
            return res.status(500).json({ error: 'Database error' });
        }

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
    });
});

// Assets endpoints
app.get('/api/assets', authenticateToken, (req, res) => {
    const query = `
        SELECT a.*, 
               COUNT(v.id) as vulnerability_count,
               SUM(CASE WHEN v.severity = 'critical' THEN 1 ELSE 0 END) as critical_count,
               SUM(CASE WHEN v.severity = 'high' THEN 1 ELSE 0 END) as high_count,
               AVG(v.vpr_score) as avg_vpr_score
        FROM assets a
        LEFT JOIN vulnerabilities v ON a.id = v.asset_id AND v.status = 'open'
        GROUP BY a.id
        ORDER BY critical_count DESC, high_count DESC, avg_vpr_score DESC
    `;

    db.all(query, [], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
});

app.post('/api/assets', authenticateToken, (req, res) => {
    const { hostname, ip_address, vendor, operating_system, risk_level, business_criticality, notes } = req.body;

    const query = `
        INSERT INTO assets (hostname, ip_address, vendor, operating_system, risk_level, business_criticality, notes)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    db.run(query, [hostname, ip_address, vendor, operating_system, risk_level, business_criticality, notes], function(err) {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({ id: this.lastID });
    });
});

app.put('/api/assets/:id', authenticateToken, (req, res) => {
    const { hostname, ip_address, vendor, operating_system, risk_level, business_criticality, notes } = req.body;
    const { id } = req.params;

    const query = `
        UPDATE assets 
        SET hostname = ?, ip_address = ?, vendor = ?, operating_system = ?, 
            risk_level = ?, business_criticality = ?, notes = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
    `;

    db.run(query, [hostname, ip_address, vendor, operating_system, risk_level, business_criticality, notes, id], function(err) {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({ changes: this.changes });
    });
});

// Vulnerabilities endpoints
app.get('/api/vulnerabilities', authenticateToken, (req, res) => {
    const { asset_id, severity, status } = req.query;
    let query = `
        SELECT v.*, a.hostname, a.ip_address 
        FROM vulnerabilities v
        JOIN assets a ON v.asset_id = a.id
        WHERE 1=1
    `;
    const params = [];

    if (asset_id) {
        query += ' AND v.asset_id = ?';
        params.push(asset_id);
    }
    if (severity) {
        query += ' AND v.severity = ?';
        params.push(severity);
    }
    if (status) {
        query += ' AND v.status = ?';
        params.push(status);
    }

    query += ' ORDER BY v.vpr_score DESC, v.severity DESC';

    db.all(query, params, (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
});

// Tickets endpoints
app.get('/api/tickets', authenticateToken, (req, res) => {
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

    db.all(query, [], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
});

app.post('/api/tickets', authenticateToken, (req, res) => {
    const { ticket_number, title, description, priority, status, assignee, asset_id, snow_number } = req.body;

    const query = `
        INSERT INTO tickets (ticket_number, title, description, priority, status, assignee, asset_id, snow_number)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

    db.run(query, [ticket_number, title, description, priority, status, assignee, asset_id, snow_number], function(err) {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({ id: this.lastID });
    });
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
function processBatch(batch) {
    return new Promise((resolve, reject) => {
        db.serialize(() => {
            db.run('BEGIN TRANSACTION');

            batch.forEach((record) => {
                // Insert or update asset
                const assetQuery = `
                    INSERT OR REPLACE INTO assets (hostname, ip_address, vendor, operating_system)
                    VALUES (?, ?, ?, ?)
                `;
                db.run(assetQuery, [record.hostname, record.ipAddress, record.vendor, record.operatingSystem]);

                // Insert vulnerability
                const vulnQuery = `
                    INSERT INTO vulnerabilities 
                    (asset_id, cve_id, definition_name, severity, vpr_score, cvss_score, description)
                    VALUES (
                        (SELECT id FROM assets WHERE hostname = ?),
                        ?, ?, ?, ?, ?, ?
                    )
                `;
                db.run(vulnQuery, [
                    record.hostname,
                    record.cve || record.definitionId,
                    record.definitionName,
                    record.severity,
                    parseFloat(record.vprScore) || 0,
                    parseFloat(record.cvssScore) || 0,
                    record.description
                ]);
            });

            db.run('COMMIT', (err) => {
                if (err) {
                    db.run('ROLLBACK');
                    reject(err);
                } else {
                    resolve();
                }
            });
        });
    });
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

// Dashboard stats endpoint
app.get('/api/dashboard/stats', authenticateToken, (req, res) => {
    const queries = {
        totalAssets: 'SELECT COUNT(*) as count FROM assets',
        totalVulnerabilities: 'SELECT COUNT(*) as count FROM vulnerabilities WHERE status = "open"',
        criticalVulns: 'SELECT COUNT(*) as count FROM vulnerabilities WHERE severity = "critical" AND status = "open"',
        openTickets: 'SELECT COUNT(*) as count FROM tickets WHERE status IN ("open", "in_progress")',
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
    let completed = 0;
    const total = Object.keys(queries).length;

    Object.entries(queries).forEach(([key, query]) => {
        db.all(query, [], (err, rows) => {
            if (err) {
                console.error(`Error in ${key} query:`, err);
                results[key] = [];
            } else {
                results[key] = rows;
            }
            
            completed++;
            if (completed === total) {
                res.json(results);
            }
        });
    });
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
process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down gracefully...');
    db.close((err) => {
        if (err) {
            console.error('Error closing database:', err);
        } else {
            console.log('Database connection closed.');
        }
        process.exit(0);
    });
});
