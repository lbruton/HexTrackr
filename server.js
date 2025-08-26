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
  // First get all distinct dates in descending order
  const datesQuery = `
    SELECT DISTINCT scan_date as date
    FROM fact_vulnerability_timeseries 
    WHERE scan_date >= DATE('now', '-180 days')
    ORDER BY scan_date DESC
  `;
  
  db.all(datesQuery, [], (err, dates) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    
    // For each date, calculate cumulative totals up to that date
    const cumulativeQuery = `
      SELECT 
        ? as date,
        f.severity,
        COUNT(*) as count,
        SUM(f.vpr_score) as total_vpr
      FROM fact_vulnerability_timeseries f
      WHERE f.scan_date <= ? AND f.scan_date >= DATE('now', '-180 days')
      GROUP BY f.severity
    `;
    
    const promises = dates.map(dateRow => {
      return new Promise((resolve, reject) => {
        db.all(cumulativeQuery, [dateRow.date, dateRow.date], (err, rows) => {
          if (err) reject(err);
          else {
            const dateData = { 
              date: dateRow.date, 
              Critical: { count: 0, total_vpr: 0 }, 
              High: { count: 0, total_vpr: 0 }, 
              Medium: { count: 0, total_vpr: 0 }, 
              Low: { count: 0, total_vpr: 0 } 
            };
            
            rows.forEach(row => {
              dateData[row.severity] = {
                count: row.count,
                total_vpr: Math.round((row.total_vpr || 0) * 100) / 100 // Round to 2 decimal places
              };
            });
            
            resolve(dateData);
          }
        });
      });
    });
    
    Promise.all(promises)
      .then(results => {
        res.json(results);
      })
      .catch(err => {
        res.status(500).json({ error: err.message });
      });
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

// Import CSV vulnerabilities - TIME-SERIES SCHEMA
app.post('/api/vulnerabilities/import', upload.single('csvFile'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  
  const startTime = Date.now();
  const filename = req.file.originalname;
  const vendor = req.body.vendor || 'unknown';
  const currentDate = new Date().toISOString().split('T')[0];
  
  // Read and parse CSV
  const csvData = fs.readFileSync(req.file.path, 'utf8');
  
  Papa.parse(csvData, {
    header: true,
    complete: (results) => {
      const rows = results.data.filter(row => Object.values(row).some(val => val && val.trim()));
      
      // Insert import record (keep for logging)
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
        let processed = 0;
        
        // Process rows using time-series schema: assets -> dim_vulnerabilities -> fact_vulnerability_timeseries
        rows.forEach((row, index) => {
          // Map CSV columns to database fields
          const hostname = row['asset.name'] || row['hostname'] || row['Host'] || '';
          const ipAddress = row['asset.display_ipv4_address'] || row['asset.ipv4_addresses'] || row['ip_address'] || row['IP Address'] || '';
          const cve = row['definition.cve'] || row['cve'] || row['CVE'] || '';
          const severity = row['severity'] || row['Severity'] || '';
          const vprScore = parseFloat(row['definition.vpr.score'] || row['vpr_score'] || row['VPR Score'] || 0);
          const cvssScore = parseFloat(row['cvss_score'] || row['CVSS Score'] || 0);
          const vendorFamily = row['definition.family'] || row['vendor'] || row['Vendor'] || '';
          const pluginName = row['definition.name'] || row['plugin_name'] || row['description'] || row['Description'] || '';
          const pluginId = row['plugin_id'] || row['Plugin ID'] || '';
          const state = row['state'] || row['State'] || 'open';
          
          // Parse dates
          const parseDate = (dateStr) => {
            if (!dateStr) return null;
            try {
              const date = new Date(dateStr);
              return date.toISOString().split('T')[0];
            } catch (e) {
              return null;
            }
          };
          
          const firstSeenDate = parseDate(
            row['first_seen'] || 
            row['definition.vulnerability_published'] || 
            row['vulnerability_date']
          ) || currentDate;
          
          const lastSeenDate = parseDate(
            row['last_seen'] || 
            row['resurfaced_date'] || 
            row['vulnerability_date']
          ) || currentDate;
          
          // Create vulnerability key (CVE preferred, fallback to plugin_id)
          const vulnKey = cve || pluginId || `name_${pluginName.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 50)}`;
          
          // Step 1: Ensure asset exists
          db.run(`
            INSERT OR IGNORE INTO assets (hostname, ip_address) 
            VALUES (?, ?)
          `, [hostname, ipAddress], function(assetErr) {
            if (assetErr) {
              console.error('Asset insert error:', assetErr);
              return;
            }
            
            // Get asset ID
            db.get(`SELECT id FROM assets WHERE hostname = ?`, [hostname], (assetGetErr, asset) => {
              if (assetGetErr || !asset) {
                console.error('Asset lookup error:', assetGetErr);
                return;
              }
              
              // Step 2: Ensure vulnerability dimension exists
              db.run(`
                INSERT OR IGNORE INTO dim_vulnerabilities 
                (asset_id, vuln_key, cve, plugin_id, name, vendor_family) 
                VALUES (?, ?, ?, ?, ?, ?)
              `, [asset.id, vulnKey, cve, pluginId, pluginName, vendorFamily], function(vulnErr) {
                if (vulnErr) {
                  console.error('Vulnerability dimension insert error:', vulnErr);
                  return;
                }
                
                // Get vulnerability dimension ID
                db.get(`
                  SELECT id FROM dim_vulnerabilities 
                  WHERE asset_id = ? AND vuln_key = ?
                `, [asset.id, vulnKey], (vulnGetErr, vuln) => {
                  if (vulnGetErr || !vuln) {
                    console.error('Vulnerability lookup error:', vulnGetErr);
                    return;
                  }
                  
                  // Step 3: Insert time-series fact (UPSERT for same scan_date)
                  db.run(`
                    INSERT OR REPLACE INTO fact_vulnerability_timeseries 
                    (vulnerability_id, scan_date, severity, vpr_score, state, import_id, first_seen, last_seen)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                  `, [vuln.id, currentDate, severity, vprScore, state, importId, firstSeenDate, lastSeenDate], function(factErr) {
                    if (factErr) {
                      console.error('Time-series fact insert error:', factErr);
                      return;
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
                        processingTime: Date.now() - startTime,
                        message: 'Data imported to time-series database'
                      });
                    }
                  });
                });
              });
            });
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
    // Clear new time-series tables (where actual data is)
    db.run('DELETE FROM fact_vulnerability_timeseries');
    db.run('DELETE FROM dim_vulnerabilities');
    db.run('DELETE FROM assets');
    db.run('DELETE FROM vulnerability_history');
    
    // Clear old tables (for completeness, though they're empty)
    db.run('DELETE FROM ticket_vulnerabilities');
    db.run('DELETE FROM vulnerabilities');
    db.run('DELETE FROM vulnerability_imports', (err) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({ success: true, message: 'All vulnerability data cleared from time-series database' });
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

// ==================== TICKETS API ====================

// Get all tickets
app.get('/api/tickets', (req, res) => {
  const query = `
    SELECT * FROM tickets 
    ORDER BY date_submitted DESC
  `;
  
  db.all(query, [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    
    // Parse JSON fields and map snake_case to camelCase
    const tickets = rows.map(row => ({
      id: row.id,
      dateSubmitted: row.date_submitted,
      dateDue: row.date_due,
      hexagonTicket: row.hexagon_ticket,
      serviceNowTicket: row.service_now_ticket,
      location: row.location,
      devices: JSON.parse(row.devices || '[]'),
      supervisor: row.supervisor,
      tech: row.tech,
      status: row.status,
      notes: row.notes,
      attachments: JSON.parse(row.attachments || '[]'),
      createdAt: row.created_at,
      updatedAt: row.updated_at
    }));
    
    res.json(tickets);
  });
});

// Get single ticket by ID
app.get('/api/tickets/:id', (req, res) => {
  const { id } = req.params;
  
  db.get('SELECT * FROM tickets WHERE id = ?', [id], (err, row) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    
    if (!row) {
      res.status(404).json({ error: 'Ticket not found' });
      return;
    }
    
    // Parse JSON fields and map snake_case to camelCase
    const ticket = {
      id: row.id,
      dateSubmitted: row.date_submitted,
      dateDue: row.date_due,
      hexagonTicket: row.hexagon_ticket,
      serviceNowTicket: row.service_now_ticket,
      location: row.location,
      devices: JSON.parse(row.devices || '[]'),
      supervisor: row.supervisor,
      tech: row.tech,
      status: row.status,
      notes: row.notes,
      attachments: JSON.parse(row.attachments || '[]'),
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
    
    res.json(ticket);
  });
});

// Create new ticket
app.post('/api/tickets', (req, res) => {
  const {
    id,
    dateSubmitted,
    dateDue,
    hexagonTicket,
    serviceNowTicket,
    location,
    devices,
    supervisor,
    tech,
    status,
    notes,
    attachments,
    createdAt,
    updatedAt
  } = req.body;

  // Validate required fields
  if (!location) {
    res.status(400).json({ error: 'Location is required' });
    return;
  }

  const query = `
    INSERT INTO tickets (
      id, date_submitted, date_due, hexagon_ticket, service_now_ticket,
      location, devices, supervisor, tech, status, notes, attachments,
      created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const params = [
    id || Date.now().toString(),
    dateSubmitted,
    dateDue,
    hexagonTicket || '',
    serviceNowTicket || '',
    location,
    JSON.stringify(devices || []),
    supervisor || '',
    tech || '',
    status || 'Open',
    notes || '',
    JSON.stringify(attachments || []),
    createdAt || new Date().toISOString(),
    updatedAt || new Date().toISOString()
  ];

  db.run(query, params, function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    
    res.json({ 
      success: true, 
      id: params[0],
      message: 'Ticket created successfully' 
    });
  });
});

// Update existing ticket
app.put('/api/tickets/:id', (req, res) => {
  const { id } = req.params;
  const {
    dateSubmitted,
    dateDue,
    hexagonTicket,
    serviceNowTicket,
    location,
    devices,
    supervisor,
    tech,
    status,
    notes,
    attachments
  } = req.body;

  // Validate required fields
  if (!location) {
    res.status(400).json({ error: 'Location is required' });
    return;
  }

  const query = `
    UPDATE tickets SET
      date_submitted = ?, date_due = ?, hexagon_ticket = ?, service_now_ticket = ?,
      location = ?, devices = ?, supervisor = ?, tech = ?, status = ?, 
      notes = ?, attachments = ?, updated_at = ?
    WHERE id = ?
  `;

  const params = [
    dateSubmitted,
    dateDue,
    hexagonTicket || '',
    serviceNowTicket || '',
    location,
    JSON.stringify(devices || []),
    supervisor || '',
    tech || '',
    status || 'Open',
    notes || '',
    JSON.stringify(attachments || []),
    new Date().toISOString(),
    id
  ];

  db.run(query, params, function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    
    if (this.changes === 0) {
      res.status(404).json({ error: 'Ticket not found' });
      return;
    }
    
    res.json({ 
      success: true, 
      message: 'Ticket updated successfully' 
    });
  });
});

// Delete ticket
app.delete('/api/tickets/:id', (req, res) => {
  const { id } = req.params;
  
  db.run('DELETE FROM tickets WHERE id = ?', [id], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    
    if (this.changes === 0) {
      res.status(404).json({ error: 'Ticket not found' });
      return;
    }
    
    res.json({ 
      success: true, 
      message: 'Ticket deleted successfully' 
    });
  });
});

// Migrate localStorage data to database
app.post('/api/tickets/migrate', (req, res) => {
  const { tickets, mode = 'check' } = req.body;
  
  if (!Array.isArray(tickets)) {
    res.status(400).json({ error: 'Invalid tickets data' });
    return;
  }

  // First, check if we already have tickets in the database
  db.get('SELECT COUNT(*) as count FROM tickets', [], (err, row) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    
    // Handle different import modes
    if (row.count > 0 && mode === 'check') {
      res.status(409).json({ 
        error: 'Database already contains tickets. Clear existing data first or use replace/append mode.',
        currentCount: row.count
      });
      return;
    }
    
    // If replace mode, clear existing data first
    if (mode === 'replace' && row.count > 0) {
      db.run('DELETE FROM tickets', [], (err) => {
        if (err) {
          res.status(500).json({ error: `Failed to clear existing data: ${err.message}` });
          return;
        }
        // Continue with insert after clearing
        insertTickets();
      });
      return;
    }
    
    // For append mode or empty database, proceed directly
    insertTickets();
    
    function insertTickets() {
      // Begin transaction
      db.serialize(() => {
        db.run('BEGIN TRANSACTION');
        
        let completed = 0;
        let errors = [];
        
        const insertQuery = `
          INSERT INTO tickets (
            id, date_submitted, date_due, hexagon_ticket, service_now_ticket,
            location, devices, supervisor, tech, status, notes, attachments,
            created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        
        for (const ticket of tickets) {
          const params = [
            ticket.id,
            ticket.dateSubmitted,
            ticket.dateDue,
            ticket.hexagonTicket || '',
            ticket.serviceNowTicket || '',
            ticket.location,
            JSON.stringify(ticket.devices || []),
            ticket.supervisor || '',
            ticket.tech || '',
            ticket.status || 'Open',
            ticket.notes || '',
            JSON.stringify(ticket.attachments || []),
            ticket.createdAt || new Date().toISOString(),
            ticket.updatedAt || new Date().toISOString()
          ];
          
          db.run(insertQuery, params, function(err) {
            if (err) {
              errors.push(`Error inserting ticket ${ticket.id}: ${err.message}`);
            }
          
          completed++;
          
          if (completed === tickets.length) {
            if (errors.length > 0) {
              db.run('ROLLBACK');
              res.status(500).json({ 
                error: 'Migration failed', 
                details: errors 
              });
            } else {
              db.run('COMMIT');
              res.json({ 
                success: true, 
                message: `Successfully migrated ${tickets.length} tickets` 
              });
            }
          }
        });
      }
      
      if (tickets.length === 0) {
        db.run('COMMIT');
        res.json({ 
          success: true, 
          message: 'No tickets to migrate' 
        });
      }
    });
    }
  });
});

// Backup and Restore Endpoints

// Export all tickets as JSON backup
app.get('/api/backup/tickets', (req, res) => {
  db.all('SELECT * FROM tickets ORDER BY created_at', [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    
    // Convert snake_case fields back to camelCase for consistency
    const tickets = rows.map(row => ({
      id: row.id,
      dateSubmitted: row.date_submitted,
      dateDue: row.date_due,
      hexagonTicket: row.hexagon_ticket,
      serviceNowTicket: row.service_now_ticket,
      location: row.location,
      devices: JSON.parse(row.devices || '[]'),
      supervisor: row.supervisor,
      tech: row.tech,
      status: row.status,
      notes: row.notes,
      attachments: JSON.parse(row.attachments || '[]'),
      createdAt: row.created_at,
      updatedAt: row.updated_at
    }));
    
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="hextrackr-tickets-backup-${new Date().toISOString().split('T')[0]}.json"`);
    res.json({
      exportDate: new Date().toISOString(),
      dataType: 'tickets',
      count: tickets.length,
      data: tickets
    });
  });
});

// Clear all tickets
app.delete('/api/clear/tickets', (req, res) => {
  db.run('DELETE FROM tickets', [], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ 
      success: true, 
      message: `Cleared ${this.changes} tickets` 
    });
  });
});

// Get backup statistics
app.get('/api/backup/stats', (req, res) => {
  db.get('SELECT COUNT(*) as ticketCount FROM tickets', [], (err, ticketRow) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    
    db.get('SELECT COUNT(*) as vulnCount FROM vulnerabilities', [], (err, vulnRow) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      
      res.json({
        tickets: ticketRow.ticketCount,
        vulnerabilities: vulnRow.vulnCount,
        total: ticketRow.ticketCount + vulnRow.vulnCount
      });
    });
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
