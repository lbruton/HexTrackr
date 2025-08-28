const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '..', 'data', 'hextrackr.db');

// Create database and tables
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
    return;
  }
  console.log('Connected to SQLite database');
});

// Create tables
db.serialize(() => {
  // Tickets table - mirrors localStorage structure
  db.run(`CREATE TABLE IF NOT EXISTS tickets (
    id TEXT PRIMARY KEY,
    location TEXT NOT NULL,
    devices TEXT, -- JSON array of devices
    description TEXT,
    urgency TEXT,
    category TEXT,
    status TEXT DEFAULT 'Open',
    assigned_to TEXT,
    created_date TEXT,
    updated_date TEXT,
    notes TEXT
  )`);

  // Vulnerability imports - raw CSV data with metadata
  db.run(`CREATE TABLE IF NOT EXISTS vulnerability_imports (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    filename TEXT NOT NULL,
    import_date TEXT NOT NULL,
    row_count INTEGER NOT NULL,
    vendor TEXT, -- cisco, tenable, qualys, etc
    file_size INTEGER,
    processing_time INTEGER, -- milliseconds
    raw_headers TEXT, -- JSON array of original column names
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // Normalized vulnerability data
  db.run(`CREATE TABLE IF NOT EXISTS vulnerabilities (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    import_id INTEGER NOT NULL,
    hostname TEXT,
    ip_address TEXT,
    cve TEXT,
    severity TEXT,
    vpr_score REAL,
    cvss_score REAL,
    first_seen TEXT,
    last_seen TEXT,
    plugin_id TEXT,
    plugin_name TEXT,
    description TEXT,
    solution TEXT,
    vendor_reference TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (import_id) REFERENCES vulnerability_imports (id)
  )`);

  // Junction table for ticket-vulnerability relationships
  db.run(`CREATE TABLE IF NOT EXISTS ticket_vulnerabilities (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ticket_id TEXT NOT NULL,
    vulnerability_id INTEGER NOT NULL,
    relationship_type TEXT DEFAULT 'remediation', -- remediation, investigation, etc
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (ticket_id) REFERENCES tickets (id),
    FOREIGN KEY (vulnerability_id) REFERENCES vulnerabilities (id)
  )`);

  // Indexes for performance
  db.run(`CREATE INDEX IF NOT EXISTS idx_vulnerabilities_hostname ON vulnerabilities (hostname)`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_vulnerabilities_severity ON vulnerabilities (severity)`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_vulnerabilities_cve ON vulnerabilities (cve)`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_vulnerabilities_import ON vulnerabilities (import_id)`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_ticket_vulns_ticket ON ticket_vulnerabilities (ticket_id)`);
});

db.close((err) => {
  if (err) {
    console.error('Error closing database:', err.message);
  } else {
    console.log('Database initialized successfully!');
    console.log('Tables created:');
    console.log('  - tickets (ready for future localStorage sync)');
    console.log('  - vulnerability_imports (CSV import tracking)');
    console.log('  - vulnerabilities (normalized data)');
    console.log('  - ticket_vulnerabilities (cross-referencing)');
  }
});
