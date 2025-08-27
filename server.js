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

// Clear data endpoint
app.delete('/api/backup/clear/:type', (req, res) => {
    const { type } = req.params;
    let query = '';
    
    if (type === 'vulnerabilities') {
        query = 'DELETE FROM vulnerabilities';
    } else if (type === 'tickets') {
        query = 'DELETE FROM tickets';
    } else if (type === 'all') {
        // For 'all', we'll run multiple queries
        db.run('DELETE FROM vulnerabilities', (vulnErr) => {
            if (vulnErr) {
                res.status(500).json({ error: 'Failed to clear vulnerabilities' });
                return;
            }
            
            db.run('DELETE FROM tickets', (ticketErr) => {
                if (ticketErr) {
                    res.status(500).json({ error: 'Failed to clear tickets' });
                    return;
                }
                
                res.json({ message: 'All data cleared successfully' });
            });
        });
        return; // Exit early since we're handling the response in the nested callbacks
    } else {
        res.status(400).json({ error: 'Invalid data type' });
        return;
    }
    
    // Run the query for single table clear
    db.run(query, (err) => {
        if (err) {
            res.status(500).json({ error: `Failed to clear ${type}` });
            return;
        }
        
        res.json({ message: `${type} cleared successfully` });
    });
});

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
        
        db.get('SELECT COUNT(*) as tickets FROM tickets', (ticketErr, ticketRow) => {
            if (ticketErr) {
                res.status(500).json({ error: 'Database error - tickets' });
                return;
            }
            
            const vulnCount = vulnRow.vulnerabilities;
            const ticketCount = ticketRow.tickets;
            
            // Get database file size
            const dbSize = fs.statSync(dbPath).size;
            
            res.json({
                vulnerabilities: vulnCount,
                tickets: ticketCount,
                total: vulnCount + ticketCount,
                dbSize: dbSize
            });
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

// Tickets CRUD endpoints (restored after PostgreSQL corruption incident)
app.get('/api/tickets', (req, res) => {
    db.all('SELECT * FROM tickets ORDER BY created_at DESC', (err, rows) => {
        if (err) {
            console.error('Error fetching tickets:', err);
            res.status(500).json({ error: 'Failed to fetch tickets' });
            return;
        }
        res.json(rows);
    });
});

app.post('/api/tickets', (req, res) => {
    const ticket = req.body;
    
    const sql = `INSERT INTO tickets (
        id, start_date, end_date, primary_number, incident_number, site_code,
        affected_devices, assignee, notes, status, priority, linked_cves,
        created_at, updated_at, display_site_code, ticket_number, site_id, location_id
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    
    const params = [
        ticket.id, ticket.start_date, ticket.end_date, ticket.primary_number,
        ticket.incident_number, ticket.site_code, JSON.stringify(ticket.affected_devices),
        ticket.assignee, ticket.notes, ticket.status, ticket.priority,
        JSON.stringify(ticket.linked_cves), ticket.created_at, ticket.updated_at,
        ticket.display_site_code, ticket.ticket_number, ticket.site_id, ticket.location_id
    ];
    
    db.run(sql, params, function(err) {
        if (err) {
            console.error('Error saving ticket:', err);
            res.status(500).json({ error: 'Failed to save ticket' });
            return;
        }
        res.json({ success: true, id: ticket.id });
    });
});

app.delete('/api/tickets/:id', (req, res) => {
    const ticketId = req.params.id;
    
    db.run('DELETE FROM tickets WHERE id = ?', [ticketId], function(err) {
        if (err) {
            console.error('Error deleting ticket:', err);
            res.status(500).json({ error: 'Failed to delete ticket' });
            return;
        }
        res.json({ success: true, deleted: this.changes });
    });
});

app.post('/api/tickets/migrate', (req, res) => {
    const tickets = req.body.tickets || [];
    
    if (!Array.isArray(tickets) || tickets.length === 0) {
        return res.json({ success: true, message: 'No tickets to migrate' });
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
                console.error('Error migrating ticket:', err);
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
app.post('/api/import/tickets', (req, res) => {
    const csvData = req.body.data || [];
    
    if (!Array.isArray(csvData) || csvData.length === 0) {
        return res.status(400).json({ error: 'No data provided' });
    }
    
    let imported = 0;
    let errors = [];
    
    // Prepare insert statement with UPSERT (INSERT OR REPLACE)
    const stmt = db.prepare(`
        INSERT OR REPLACE INTO tickets (
            id, xt_number, date_submitted, date_due, hexagon_ticket, 
            service_now_ticket, location, devices, supervisor, tech,
            status, notes, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    csvData.forEach((row, index) => {
        try {
            // Use existing XT number from CSV or generate one
            const xtNumber = row.xt_number || row['XT Number'] || `XT${String(index + 1).padStart(3, '0')}`;
            const now = new Date().toISOString();
            
            // Use existing ID from CSV or generate one
            const ticketId = row.id || `ticket_${Date.now()}_${index}`;
            
            stmt.run([
                ticketId,
                xtNumber,
                row.date_submitted || row['Date Submitted'] || '',
                row.date_due || row['Date Due'] || '',
                row.hexagon_ticket || row['Hexagon Ticket'] || '',
                row.service_now_ticket || row['ServiceNow Ticket'] || '',
                row.location || row['Location'] || '',
                row.devices || row['Devices'] || '',
                row.supervisor || row['Supervisor'] || '',
                row.tech || row['Tech'] || '',
                row.status || row['Status'] || 'Open',
                row.notes || row['Notes'] || '',
                row.created_at || now,
                now
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
            console.error('Error finalizing ticket import:', err);
            return res.status(500).json({ error: 'Import failed' });
        }
        
        res.json({
            success: true,
            imported: imported,
            total: csvData.length,
            errors: errors.length > 0 ? errors : undefined
        });
    });
});

app.post('/api/import/vulnerabilities', (req, res) => {
    const csvData = req.body.data || [];
    
    if (!Array.isArray(csvData) || csvData.length === 0) {
        return res.status(400).json({ error: 'No data provided' });
    }
    
    const importDate = new Date().toISOString();
    let imported = 0;
    let errors = [];
    
    // Create import record
    const importQuery = `
        INSERT INTO vulnerability_imports 
        (filename, import_date, row_count, vendor, file_size, processing_time, raw_headers)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    
    db.run(importQuery, [
        'web-upload.csv',
        importDate,
        csvData.length,
        'web-import',
        0,
        0,
        JSON.stringify(Object.keys(csvData[0] || {}))
    ], function(err) {
        if (err) {
            console.error('Error creating import record:', err);
            return res.status(500).json({ error: 'Failed to create import record' });
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
                    importDate.split('T')[0]
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
                console.error('Error finalizing vulnerability import:', err);
                return res.status(500).json({ error: 'Import failed' });
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

app.get('/api/backup/tickets', (req, res) => {
    db.all('SELECT * FROM tickets ORDER BY created_at DESC', (err, rows) => {
        if (err) {
            console.error('Error fetching tickets for backup:', err);
            res.status(500).json({ error: 'Failed to fetch tickets' });
            return;
        }
        
        res.json({
            type: 'tickets',
            count: rows.length,
            data: rows,
            exported_at: new Date().toISOString()
        });
    });
});

app.get('/api/backup/all', (req, res) => {
    // Get vulnerabilities and tickets from database
    db.all('SELECT * FROM vulnerabilities LIMIT 10000', (err, vulnRows) => {
        if (err) {
            res.status(500).json({ error: 'Export failed' });
            return;
        }
        
        db.all('SELECT * FROM tickets ORDER BY created_at DESC', (ticketErr, ticketRows) => {
            if (ticketErr) {
                res.status(500).json({ error: 'Export failed - tickets error' });
                return;
            }
            
            res.json({
                type: 'complete_backup',
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
app.post('/api/restore', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }
        
        const type = req.body.type;
        if (!['tickets', 'vulnerabilities', 'all'].includes(type)) {
            return res.status(400).json({ error: 'Invalid data type' });
        }
        
        const filePath = req.file.path;
        const fileData = fs.readFileSync(filePath);
        
        // Use JSZip to extract the backup
        const zip = new (require('jszip'))();
        const zipContent = await zip.loadAsync(fileData);
        
        let restoredCount = 0;
        
        // Process based on data type
        if (type === 'tickets' || type === 'all') {
            // Extract tickets.json if it exists
            if (zipContent.files['tickets.json']) {
                const ticketsJson = await zipContent.files['tickets.json'].async('string');
                const ticketsData = JSON.parse(ticketsJson);
                
                if (ticketsData && ticketsData.data && Array.isArray(ticketsData.data)) {
                    // Clear existing tickets if requested
                    if (req.body.clearExisting === 'true') {
                        await new Promise((resolve, reject) => {
                            db.run('DELETE FROM tickets', (err) => {
                                if (err) reject(err);
                                else resolve();
                            });
                        });
                    }
                    
                    // Insert tickets data
                    const ticketValues = ticketsData.data.map(ticket => {
                        return [
                            ticket.xt_number || '',
                            ticket.date_submitted || '',
                            ticket.date_due || '',
                            ticket.hexagon_ticket || '',
                            ticket.service_now_ticket || '',
                            ticket.location || '',
                            ticket.devices || '',
                            ticket.supervisor || '',
                            ticket.tech || '',
                            ticket.status || '',
                            ticket.notes || '',
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
                                if (err) reject(err);
                                else resolve();
                            });
                        });
                        restoredCount++;
                    }
                }
            }
        }
        
        if (type === 'vulnerabilities' || type === 'all') {
            // Extract vulnerabilities.json if it exists
            if (zipContent.files['vulnerabilities.json']) {
                const vulnJson = await zipContent.files['vulnerabilities.json'].async('string');
                const vulnData = JSON.parse(vulnJson);
                
                if (vulnData && vulnData.data && Array.isArray(vulnData.data)) {
                    // Clear existing vulnerabilities if requested
                    if (req.body.clearExisting === 'true') {
                        await new Promise((resolve, reject) => {
                            db.run('DELETE FROM vulnerabilities', (err) => {
                                if (err) reject(err);
                                else resolve();
                            });
                        });
                    }
                    
                    // Insert vulnerability data
                    const vulnValues = vulnData.data.map(vuln => {
                        return [
                            vuln.hostname || '',
                            vuln.ip_address || '',
                            vuln.cve || '',
                            vuln.severity || '',
                            vuln.vpr_score || 0,
                            vuln.cvss_score || 0,
                            vuln.first_seen || '',
                            vuln.last_seen || '',
                            vuln.plugin_name || '',
                            vuln.description || '',
                            vuln.solution || ''
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
                                if (err) reject(err);
                                else resolve();
                            });
                        });
                        restoredCount++;
                    }
                }
            }
        }
        
        // Clean up the uploaded file
        fs.unlinkSync(filePath);
        
        res.json({
            success: true,
            message: `Successfully restored ${restoredCount} records`,
            count: restoredCount
        });
        
    } catch (error) {
        console.error('Error restoring backup:', error);
        res.status(500).json({ error: 'Failed to restore data: ' + error.message });
    }
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
