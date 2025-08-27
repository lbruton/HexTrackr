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

// Get vulnerability statistics with VPR totals
app.get('/api/vulnerabilities/stats', (req, res) => {
  const query = `
    SELECT 
      severity,
      COUNT(*) as count,
      SUM(vpr_score) as total_vpr,
      AVG(vpr_score) as avg_vpr,
      MIN(first_seen) as earliest,
      MAX(last_seen) as latest
    FROM vulnerabilities 
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

// Get historical trending data (last 14 days)
app.get('/api/vulnerabilities/trends', (req, res) => {
  const query = `
    SELECT 
      DATE(created_at) as date,
      severity,
      COUNT(*) as count,
      SUM(vpr_score) as total_vpr
    FROM vulnerabilities 
    WHERE created_at >= DATE('now', '-14 days')
    GROUP BY DATE(created_at), severity
    ORDER BY date DESC, severity
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

// Get vulnerabilities with pagination
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
      conditions.push('(hostname LIKE ? OR cve LIKE ? OR plugin_name LIKE ?)');
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }
    if (severity) {
      conditions.push('severity = ?');
      params.push(severity);
    }
    whereClause = 'WHERE ' + conditions.join(' AND ');
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
        
        rows.forEach(row => {
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

          stmt.run([
            importId,
            hostname,
            ipAddress,
            cve,
            severity,
            vprScore || null,
            cvssScore || null,
            row['first_seen'] || row['First Seen'] || '',
            row['last_seen'] || row['Last Seen'] || '',
            row['plugin_id'] || row['Plugin ID'] || '',
            description,
            row['description'] || row['Description'] || '',
            row['solution'] || row['Solution'] || '',
            vendor,
            pluginPublished,
            state,
            new Date().toISOString().split('T')[0]
          ], (err) => {
            if (err) console.error('Row insert error:', err);
            processed++;
            
            if (processed === rows.length) {
              stmt.finalize();
              
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

// Clear all vulnerability data
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
  });
};

// Backup API endpoints for settings modal
app.get('/api/backup/stats', (req, res) => {
    db.get('SELECT COUNT(*) as vulnerabilities FROM vulnerabilities', (err, vulnRow) => {
        if (err) {
            res.status(500).json({ error: 'Database error' });
            return;
        }
        
        // Since tickets are localStorage-based, we'll return 0 for now
        res.json({
            vulnerabilities: vulnRow.vulnerabilities,
            tickets: 0,
            total: vulnRow.vulnerabilities
        });
    });
});

app.get('/api/backup/vulnerabilities', (req, res) => {
    db.all('SELECT * FROM vulnerabilities LIMIT 10000', (err, rows) => {
        if (err) {
            res.status(500).json({ error: 'Export failed' });
            return;
        }
        res.json({
            type: 'vulnerabilities',
            count: rows.length,
            data: rows,
            exported_at: new Date().toISOString()
        });
    });
});

app.get('/api/backup/tickets', (req, res) => {
    // Tickets are localStorage-based, so return empty data
    res.json({
        type: 'tickets',
        count: 0,
        data: [],
        exported_at: new Date().toISOString(),
        note: 'Tickets are stored in browser localStorage. Use browser export functionality.'
    });
});

app.get('/api/backup/all', (req, res) => {
    db.all('SELECT * FROM vulnerabilities LIMIT 10000', (err, vulnRows) => {
        if (err) {
            res.status(500).json({ error: 'Export failed' });
            return;
        }
        
        res.json({
            type: 'complete_backup',
            vulnerabilities: {
                count: vulnRows.length,
                data: vulnRows
            },
            tickets: {
                count: 0,
                data: [],
                note: 'Tickets are stored in browser localStorage. Use browser export functionality.'
            },
            exported_at: new Date().toISOString()
        });
    });
});

app.listen(PORT, () => {
  initDb();
  console.log(`🚀 HexTrackr server running on http://localhost:${PORT}`);
  console.log('📊 Database-powered vulnerability management enabled');
  console.log('Available endpoints:');
  console.log(`  - Tickets: http://localhost:${PORT}/tickets.html`);
  console.log(`  - Vulnerabilities: http://localhost:${PORT}/vulnerabilities-new.html`);
  console.log(`  - API: http://localhost:${PORT}/api/vulnerabilities`);
});
