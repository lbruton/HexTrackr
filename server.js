const express = require('express');
const path = require('path');
const cors = require('cors');
const compression = require('compression');
const sqlite3 = require('sqlite3').verbose();
const multer = require('multer');
const Papa = require('papaparse');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 8080;

// Database setup
const dbPath = path.join(__dirname, 'data', 'hextrackr.db');
const db = new sqlite3.Database(dbPath);

// Middleware
app.use(cors());
app.use(compression());
app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ extended: true, limit: '100mb' }));

// File upload configuration
const upload = multer({
  dest: 'uploads/',
  limits: { fileSize: 100 * 1024 * 1024 } // 100MB limit
});

// Security headers
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  next();
});

// API Routes

// Get vulnerability statistics with VPR totals (using time-series schema)
app.get('/api/vulnerabilities/stats', (req, res) => {
  const query = `
    SELECT 
      f.severity,
      COUNT(*) as count,
      SUM(f.vpr_score) as total_vpr,
      AVG(f.vpr_score) as avg_vpr,
      MIN(f.first_seen) as earliest,
      MAX(f.last_seen) as latest
    FROM fact_vulnerability_timeseries f
    JOIN dim_vulnerabilities dv ON f.vulnerability_id = dv.id
    WHERE f.scan_date = (
      SELECT MAX(scan_date) FROM fact_vulnerability_timeseries f2 
      WHERE f2.vulnerability_id = f.vulnerability_id
    )
    GROUP BY f.severity
  `;
  
  db.all(query, [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// Get historical trending data (last 180 days based on time-series data)
app.get('/api/vulnerabilities/trends', (req, res) => {
  const query = `
    SELECT 
      f.scan_date as date,
      f.severity,
      COUNT(*) as count,
      SUM(f.vpr_score) as total_vpr
    FROM fact_vulnerability_timeseries f
    WHERE f.scan_date >= DATE('now', '-180 days')
    GROUP BY f.scan_date, f.severity
    ORDER BY f.scan_date DESC, f.severity
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

// Get vulnerabilities with pagination (using time-series schema)
app.get('/api/vulnerabilities', (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 50;
  const offset = (page - 1) * limit;
  const search = req.query.search || '';
  const severity = req.query.severity || '';
  
  let whereClause = '';
  let params = [];
  
  if (search || severity) {
    let conditions = [];
    if (search) {
      conditions.push('(a.hostname LIKE ? OR dv.cve LIKE ? OR dv.name LIKE ?)');
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }
    if (severity) {
      conditions.push('f.severity = ?');
      params.push(severity);
    }
    whereClause = 'WHERE ' + conditions.join(' AND ') + ' AND';
  } else {
    whereClause = 'WHERE';
  }
  
  const query = `
    SELECT 
      a.hostname,
      a.ip_address,
      dv.cve,
      dv.name as plugin_name,
      dv.description,
      dv.solution,
      dv.plugin_id,
      dv.vendor_family as vendor,
      f.severity,
      f.vpr_score,
      f.state,
      f.first_seen,
      f.last_seen,
      f.scan_date
    FROM fact_vulnerability_timeseries f
    JOIN dim_vulnerabilities dv ON f.vulnerability_id = dv.id
    JOIN assets a ON dv.asset_id = a.id
    ${whereClause} f.scan_date = (
      SELECT MAX(scan_date) FROM fact_vulnerability_timeseries f2 
      WHERE f2.vulnerability_id = f.vulnerability_id
    )
    ORDER BY f.vpr_score DESC, f.last_seen DESC 
    LIMIT ? OFFSET ?
  `;
  
  params.push(limit, offset);
  
  db.all(query, params, (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    
    // Get total count for pagination
    let countConditions = whereClause.replace('WHERE', '').replace(' AND', '');
    if (countConditions) {
      countConditions = 'WHERE ' + countConditions + ' AND';
    } else {
      countConditions = 'WHERE';
    }
    
    const countQuery = `
      SELECT COUNT(*) as total 
      FROM fact_vulnerability_timeseries f
      JOIN dim_vulnerabilities dv ON f.vulnerability_id = dv.id
      JOIN assets a ON dv.asset_id = a.id
      ${countConditions} f.scan_date = (
        SELECT MAX(scan_date) FROM fact_vulnerability_timeseries f2 
        WHERE f2.vulnerability_id = f.vulnerability_id
      )
    `;
    
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
app.post('/api/vulnerabilities/import', upload.single('csvFile'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  
  const startTime = Date.now();
  const filename = req.file.originalname;
  const vendor = req.body.vendor || 'unknown';
  
  // Read and parse CSV
  const csvData = fs.readFileSync(req.file.path, 'utf8');
  
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
        
        let processed = 0;
        
        rows.forEach(async (row) => {
          // Map Cisco CSV columns to database fields
          const hostname = row['asset.name'] || row['hostname'] || row['Host'] || '';
          const ipAddress = row['asset.display_ipv4_address'] || row['asset.ipv4_addresses'] || row['ip_address'] || row['IP Address'] || '';
          const cve = row['definition.cve'] || row['cve'] || row['CVE'] || '';
          const severity = row['severity'] || row['Severity'] || '';
          const vprScore = parseFloat(row['definition.vpr.score'] || row['vpr_score'] || row['VPR Score'] || 0);
          const cvssScore = parseFloat(row['cvss_score'] || row['CVSS Score'] || 0);
          const vendor = row['definition.family'] || row['vendor'] || row['Vendor'] || '';
          const description = row['definition.name'] || row['plugin_name'] || row['description'] || row['Description'] || '';
          const pluginPublished = row['definition.plugin_published'] || row['vulnerability_date'] || row['plugin_published'] || '';
          const state = row['state'] || row['State'] || 'open';
          
          // Parse dates from CSV - try multiple date fields and formats
          const parseDate = (dateStr) => {
            if (!dateStr) return null;
            try {
              const date = new Date(dateStr);
              return date.toISOString().split('T')[0];
            } catch (e) {
              return null;
            }
          };
          
          // Priority order: vulnerability_published -> plugin_updated -> resurfaced_date
          const vulnerabilityDate = parseDate(
            row['definition.vulnerability_published'] || 
            row['definition.plugin_updated'] || 
            row['resurfaced_date'] || 
            row['vulnerability_date'] || 
            row['first_seen'] || 
            row['last_seen']
          );
          
          const firstSeenDate = parseDate(
            row['first_seen'] || 
            row['definition.vulnerability_published'] || 
            vulnerabilityDate
          );
          
          const lastSeenDate = parseDate(
            row['last_seen'] || 
            row['resurfaced_date'] || 
            vulnerabilityDate
          );
          
          // Fallback to current date ONLY if no valid dates found anywhere
          const currentDate = new Date().toISOString().split('T')[0];
          const finalFirstSeen = firstSeenDate || vulnerabilityDate || currentDate;
          const finalLastSeen = lastSeenDate || vulnerabilityDate || currentDate;
          const finalVulnDate = vulnerabilityDate || currentDate;
          
          // Check if vulnerability already exists (based on hostname + CVE + plugin_id)
          const uniqueKey = `${hostname}-${cve}-${row['plugin_id'] || row['Plugin ID'] || ''}`;
          
          db.get(`
            SELECT rowid, vpr_score, last_seen FROM vulnerabilities 
            WHERE hostname = ? AND cve = ? AND plugin_id = ?
          `, [hostname, cve, row['plugin_id'] || row['Plugin ID'] || ''], (err, existingVuln) => {
            
            if (existingVuln) {
              // UPSERT: Update existing vulnerability
              // Keep historical VPR data by creating a history record if VPR changed significantly
              const oldVpr = parseFloat(existingVuln.vpr_score) || 0;
              const vprChange = Math.abs(vprScore - oldVpr);
              
              if (vprChange > 0.1) { // Track significant VPR changes
                // Insert historical record
                db.run(`
                  INSERT INTO vulnerability_history 
                  (vulnerability_id, vpr_score_old, vpr_score_new, change_date, import_id)
                  VALUES (?, ?, ?, ?, ?)
                `, [existingVuln.rowid, oldVpr, vprScore, currentDate, importId]);
              }
              
              // Update the current vulnerability record
              db.run(`
                UPDATE vulnerabilities SET
                  ip_address = ?, severity = ?, vpr_score = ?, cvss_score = ?,
                  last_seen = ?, state = ?, import_date = ?, vendor = ?,
                  description = ?, solution = ?
                WHERE rowid = ?
              `, [
                ipAddress, severity, vprScore, cvssScore,
                finalLastSeen, state, currentDate, vendor,
                row['description'] || row['Description'] || '',
                row['solution'] || row['Solution'] || '',
                existingVuln.rowid
              ]);
            } else {
              // INSERT: New vulnerability
              db.run(`
                INSERT INTO vulnerabilities 
                (import_id, hostname, ip_address, cve, severity, vpr_score, cvss_score, 
                 first_seen, last_seen, plugin_id, plugin_name, description, solution, 
                 vendor, vulnerability_date, state, import_date)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
              `, [
                importId, hostname, ipAddress, cve, severity, vprScore, cvssScore,
                finalFirstSeen, finalLastSeen, row['plugin_id'] || row['Plugin ID'] || '',
                description, row['description'] || row['Description'] || '',
                row['solution'] || row['Solution'] || '', vendor, finalVulnDate,
                state, currentDate
              ]);
            }
            
            processed++;
            
            if (processed === rows.length) {
              // Clean up uploaded file
              fs.unlinkSync(req.file.path);
              
              res.json({
                success: true,
                importId,
                rowsProcessed: processed,
                filename,
                processingTime: Date.now() - startTime
              });
            }
          });
        });
      });
    },
    error: (error) => {
      res.status(400).json({ error: 'CSV parsing failed: ' + error.message });
    }
  });
});

// Update a specific vulnerability
app.put('/api/vulnerabilities/:id', (req, res) => {
  const { id } = req.params;
  const { hostname, ip_address, severity, state, notes } = req.body;
  
  const query = `
    UPDATE vulnerabilities 
    SET hostname = ?, ip_address = ?, severity = ?, state = ?, notes = ?
    WHERE rowid = ?
  `;
  
  db.run(query, [hostname, ip_address, severity, state, notes, id], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    
    if (this.changes === 0) {
      res.status(404).json({ error: 'Vulnerability not found' });
      return;
    }
    
    res.json({ success: true, message: 'Vulnerability updated successfully' });
  });
});

// Clear all vulnerability data - MUST come before /:id route
app.delete('/api/vulnerabilities/clear', (req, res) => {
  db.serialize(() => {
    db.run('DELETE FROM ticket_vulnerabilities');
    db.run('DELETE FROM vulnerabilities');
    db.run('DELETE FROM vulnerability_imports', (err) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({ success: true, message: 'All vulnerability data cleared' });
    });
  });
});

// Delete a specific vulnerability
app.delete('/api/vulnerabilities/:id', (req, res) => {
  const { id } = req.params;
  
  db.run('DELETE FROM vulnerabilities WHERE rowid = ?', [id], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    
    if (this.changes === 0) {
      res.status(404).json({ error: 'Vulnerability not found' });
      return;
    }
    
    res.json({ success: true, message: 'Vulnerability deleted successfully' });
  });
});

// Tenable API integration for historical VPR data
app.get('/api/tenable/historical-vpr', async (req, res) => {
  const tenableApiKey = req.headers['x-tenable-api-key'];
  const tenableSecretKey = req.headers['x-tenable-secret-key'];
  
  if (!tenableApiKey || !tenableSecretKey) {
    return res.status(400).json({ error: 'Tenable API credentials required' });
  }
  
  try {
    // Get historical VPR data from Tenable
    const response = await fetch('https://cloud.tenable.com/workbenches/vulnerabilities', {
      headers: {
        'X-ApiKeys': `accessKey=${tenableApiKey}; secretKey=${tenableSecretKey}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      
      // Process and store historical VPR data
      const historicalData = data.vulnerabilities.map(vuln => ({
        cve: vuln.plugin_id,
        vpr_score: vuln.vpr_score,
        last_seen: vuln.last_seen,
        severity: vuln.severity
      }));
      
      res.json({
        success: true,
        count: historicalData.length,
        data: historicalData
      });
    } else {
      res.status(response.status).json({ error: 'Failed to fetch from Tenable API' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Error connecting to Tenable API: ' + error.message });
  }
});

// Get VPR trend data for charts
app.get('/api/vulnerabilities/vpr-trends', (req, res) => {
  const query = `
    SELECT 
      vh.change_date as date,
      AVG(vh.vpr_score_new) as avg_vpr,
      COUNT(*) as change_count,
      v.severity
    FROM vulnerability_history vh
    JOIN vulnerabilities v ON vh.vulnerability_id = v.rowid
    WHERE vh.change_date >= date('now', '-30 days')
    GROUP BY vh.change_date, v.severity
    ORDER BY vh.change_date DESC
  `;
  
  db.all(query, [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// Get import history
app.get('/api/imports', (req, res) => {
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
  maxAge: '1m', // Short cache for development
  etag: true,
  lastModified: true
}));

// Fallback to tickets.html for root
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'tickets.html'));
});

// Initialize database on startup
const initDb = () => {
  const fs = require('fs');
  if (!fs.existsSync(dbPath)) {
    console.log('Initializing database...');
    require('./scripts/init-database.js');
  }
  
  // Add new columns if they don't exist (for existing databases)
  db.serialize(() => {
    db.run(`ALTER TABLE vulnerabilities ADD COLUMN vendor TEXT DEFAULT ''`, (err) => {
      if (err && !err.message.includes('duplicate column')) {
        console.error('Error adding vendor column:', err.message);
      }
    });
    
    db.run(`ALTER TABLE vulnerabilities ADD COLUMN vulnerability_date TEXT DEFAULT ''`, (err) => {
      if (err && !err.message.includes('duplicate column')) {
        console.error('Error adding vulnerability_date column:', err.message);
      }
    });
    
    db.run(`ALTER TABLE vulnerabilities ADD COLUMN state TEXT DEFAULT 'open'`, (err) => {
      if (err && !err.message.includes('duplicate column')) {
        console.error('Error adding state column:', err.message);
      }
    });
    
    db.run(`ALTER TABLE vulnerabilities ADD COLUMN import_date TEXT DEFAULT ''`, (err) => {
      if (err && !err.message.includes('duplicate column')) {
        console.error('Error adding import_date column:', err.message);
      }
    });
    
    db.run(`ALTER TABLE vulnerabilities ADD COLUMN notes TEXT DEFAULT ''`, (err) => {
      if (err && !err.message.includes('duplicate column')) {
        console.error('Error adding notes column:', err.message);
      }
    });
    
    // Create vulnerability history table for VPR tracking
    db.run(`CREATE TABLE IF NOT EXISTS vulnerability_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      vulnerability_id INTEGER,
      vpr_score_old REAL,
      vpr_score_new REAL,
      change_date TEXT,
      import_id INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (vulnerability_id) REFERENCES vulnerabilities(rowid),
      FOREIGN KEY (import_id) REFERENCES vulnerability_imports(id)
    )`, (err) => {
      if (err) {
        console.error('Error creating vulnerability_history table:', err.message);
      }
    });
  });
};

app.listen(PORT, () => {
  initDb();
  console.log(`🚀 HexTrackr server running on http://localhost:${PORT}`);
  console.log('📊 Database-powered vulnerability management enabled');
  console.log('Available endpoints:');
  console.log(`  - Tickets: http://localhost:${PORT}/tickets.html`);
  console.log(`  - Vulnerabilities: http://localhost:${PORT}/vulnerabilities.html`);
  console.log(`  - API: http://localhost:${PORT}/api/vulnerabilities`);
});
