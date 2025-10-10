/* eslint-env node */
/* global require, console, __dirname */

const sqlite3 = require("sqlite3").verbose();
const path = require("path");
const argon2 = require("argon2");

const dbPath = path.join(__dirname, "..", "..", "data", "hextrackr.db");

/**
 * Initialize database schema and seed initial data
 * @returns {Promise<void>}
 */
async function initializeDatabase() {
  return new Promise((resolve, reject) => {
    // Create database and tables
    const db = new sqlite3.Database(dbPath, async (err) => {
      if (err) {
        console.error("Error opening database:", err.message);
        reject(err);
        return;
      }
      console.log("Connected to SQLite database");

      try {
        // Create tables with complete schema
        await createTables(db);
        await seedInitialData(db);

        // Close database
        db.close((closeErr) => {
          if (closeErr) {
            console.error("Error closing database:", closeErr.message);
            reject(closeErr);
          } else {
            console.log("Database connection closed");
            resolve();
          }
        });
      } catch (error) {
        console.error("Error during database initialization:", error);
        db.close();
        reject(error);
      }
    });
  });
}

/**
 * Create all database tables and indexes
 * @param {sqlite3.Database} db - Database connection
 * @returns {Promise<void>}
 */
function createTables(db) {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
  // Enable foreign keys
  db.run("PRAGMA foreign_keys = ON");
  db.run("PRAGMA journal_mode = WAL");
  db.run("PRAGMA synchronous = NORMAL");

  // 1. Tickets table - core business entity
  db.run(`CREATE TABLE IF NOT EXISTS tickets (
    id TEXT PRIMARY KEY,
    xt_number TEXT UNIQUE,
    date_submitted TEXT,
    date_due TEXT,
    hexagon_ticket TEXT,
    service_now_ticket TEXT,
    location TEXT NOT NULL,
    devices TEXT, -- JSON array or semicolon-delimited string
    supervisor TEXT, -- semicolon-delimited string for multiple supervisors
    tech TEXT,
    status TEXT DEFAULT 'Open',
    notes TEXT,
    attachments TEXT, -- JSON array
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    site TEXT,
    site_id TEXT,
    location_id TEXT
  )`);

  // 2. Vulnerability imports - tracking CSV imports
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

  // 3. Main vulnerabilities table - legacy/normalized data
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
    vendor TEXT DEFAULT '',
    vulnerability_date TEXT DEFAULT '',
    state TEXT DEFAULT 'open',
    import_date TEXT DEFAULT '',
    FOREIGN KEY (import_id) REFERENCES vulnerability_imports (id)
  )`);

  // 4. Ticket-vulnerability junction table
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

  // 5. Vulnerability snapshots - historical data
  db.run(`CREATE TABLE IF NOT EXISTS vulnerability_snapshots (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    import_id INTEGER NOT NULL,
    scan_date TEXT NOT NULL,
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
    vendor TEXT,
    vulnerability_date TEXT,
    state TEXT DEFAULT 'open',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    unique_key TEXT,
    confidence_score INTEGER DEFAULT 50,
    dedup_tier INTEGER DEFAULT 4,
    enhanced_unique_key TEXT,
    FOREIGN KEY (import_id) REFERENCES vulnerability_imports (id)
  )`);

  // 6. Current vulnerabilities - active data
  db.run(`CREATE TABLE IF NOT EXISTS vulnerabilities_current (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    import_id INTEGER NOT NULL,
    scan_date TEXT NOT NULL,
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
    vendor TEXT,
    vulnerability_date TEXT,
    state TEXT DEFAULT 'open',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    unique_key TEXT UNIQUE,
    lifecycle_state TEXT DEFAULT 'active',
    resolved_date TEXT,
    resolution_reason TEXT,
    confidence_score INTEGER DEFAULT 50,
    dedup_tier INTEGER DEFAULT 4,
    enhanced_unique_key TEXT,
    FOREIGN KEY (import_id) REFERENCES vulnerability_imports (id)
  )`);

  // 7. Daily vulnerability totals - aggregated metrics
  db.run(`CREATE TABLE IF NOT EXISTS vulnerability_daily_totals (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    scan_date TEXT NOT NULL UNIQUE,
    critical_count INTEGER DEFAULT 0,
    critical_total_vpr REAL DEFAULT 0,
    high_count INTEGER DEFAULT 0,
    high_total_vpr REAL DEFAULT 0,
    medium_count INTEGER DEFAULT 0,
    medium_total_vpr REAL DEFAULT 0,
    low_count INTEGER DEFAULT 0,
    low_total_vpr REAL DEFAULT 0,
    total_vulnerabilities INTEGER DEFAULT 0,
    total_vpr REAL DEFAULT 0,
    resolved_count INTEGER DEFAULT 0,
    reopened_count INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // 8. Vulnerability staging - import staging area
  db.run(`CREATE TABLE IF NOT EXISTS vulnerability_staging (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    import_id INTEGER NOT NULL,
    hostname TEXT,
    ip_address TEXT,
    cve TEXT,
    severity TEXT,
    vpr_score REAL,
    cvss_score REAL,
    plugin_id TEXT,
    plugin_name TEXT,
    description TEXT,
    solution TEXT,
    vendor_reference TEXT,
    vendor TEXT,
    vulnerability_date TEXT,
    state TEXT,
    enhanced_unique_key TEXT,
    confidence_score REAL,
    dedup_tier INTEGER,
    lifecycle_state TEXT DEFAULT 'staging',
    raw_csv_row JSON,
    processed BOOLEAN DEFAULT 0,
    batch_id INTEGER,
    processing_error TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    processed_at DATETIME,
    FOREIGN KEY (import_id) REFERENCES vulnerability_imports (id)
  )`);

  // 9. Email templates
  db.run(`CREATE TABLE IF NOT EXISTS email_templates (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    template_content TEXT NOT NULL,
    default_content TEXT NOT NULL,
    variables TEXT NOT NULL,
    category TEXT DEFAULT 'ticket',
    is_active BOOLEAN DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // 10. KEV (Known Exploited Vulnerabilities) status
  db.run(`CREATE TABLE IF NOT EXISTS kev_status (
    cve_id TEXT PRIMARY KEY,
    date_added DATE NOT NULL,
    vulnerability_name TEXT,
    vendor_project TEXT,
    product TEXT,
    required_action TEXT,
    due_date DATE,
    known_ransomware_use BOOLEAN DEFAULT 0,
    notes TEXT,
    last_synced TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`);

  // 11. Sync metadata
  db.run(`CREATE TABLE IF NOT EXISTS sync_metadata (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    sync_type TEXT NOT NULL,
    sync_time TIMESTAMP NOT NULL,
    version TEXT,
    record_count INTEGER,
    status TEXT DEFAULT 'completed',
    error_message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`);

  // 12. Ticket templates
  db.run(`CREATE TABLE IF NOT EXISTS ticket_templates (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    template_content TEXT NOT NULL,
    default_content TEXT NOT NULL,
    variables TEXT NOT NULL,
    category TEXT DEFAULT 'ticket',
    is_active BOOLEAN DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // 13. Vulnerability templates
  db.run(`CREATE TABLE IF NOT EXISTS vulnerability_templates (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    template_content TEXT NOT NULL,
    default_content TEXT NOT NULL,
    variables TEXT NOT NULL,
    category TEXT DEFAULT 'vulnerability',
    is_active BOOLEAN DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // 14. Users - Authentication and authorization
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    email TEXT,
    password_hash TEXT NOT NULL,
    role TEXT DEFAULT 'superadmin',
    is_active INTEGER DEFAULT 1,
    last_login DATETIME,
    failed_attempts INTEGER DEFAULT 0,
    failed_login_timestamp DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // 15. User Preferences - Cross-device settings persistence (HEX-138)
  db.run(`CREATE TABLE IF NOT EXISTS user_preferences (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL,
    preference_key TEXT NOT NULL,
    preference_value TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE(user_id, preference_key)
  )`);

  // Trigger to maintain updated_at timestamp for user_preferences
  db.run(`CREATE TRIGGER IF NOT EXISTS user_preferences_updated_at
    AFTER UPDATE ON user_preferences
    FOR EACH ROW
  BEGIN
    UPDATE user_preferences
    SET updated_at = CURRENT_TIMESTAMP
    WHERE id = NEW.id;
  END`);

  // Create indexes for performance
  db.run("CREATE INDEX IF NOT EXISTS idx_vulnerabilities_hostname ON vulnerabilities (hostname)");
  db.run("CREATE INDEX IF NOT EXISTS idx_vulnerabilities_severity ON vulnerabilities (severity)");
  db.run("CREATE INDEX IF NOT EXISTS idx_vulnerabilities_cve ON vulnerabilities (cve)");
  db.run("CREATE INDEX IF NOT EXISTS idx_vulnerabilities_import ON vulnerabilities (import_id)");
  db.run("CREATE INDEX IF NOT EXISTS idx_ticket_vulns_ticket ON ticket_vulnerabilities (ticket_id)");
  db.run("CREATE INDEX IF NOT EXISTS idx_ticket_vulns_vuln ON ticket_vulnerabilities (vulnerability_id)");
  db.run("CREATE INDEX IF NOT EXISTS idx_tickets_status ON tickets (status)");
  db.run("CREATE INDEX IF NOT EXISTS idx_tickets_site ON tickets (site)");
  db.run("CREATE INDEX IF NOT EXISTS idx_tickets_location ON tickets (location)");
  db.run("CREATE INDEX IF NOT EXISTS idx_tickets_xt ON tickets (xt_number)");
  db.run("CREATE INDEX IF NOT EXISTS idx_snapshots_scan_date ON vulnerability_snapshots (scan_date)");
  db.run("CREATE INDEX IF NOT EXISTS idx_snapshots_hostname ON vulnerability_snapshots (hostname)");
  db.run("CREATE INDEX IF NOT EXISTS idx_snapshots_severity ON vulnerability_snapshots (severity)");
  db.run("CREATE INDEX IF NOT EXISTS idx_snapshots_enhanced_key ON vulnerability_snapshots (enhanced_unique_key)");
  db.run("CREATE INDEX IF NOT EXISTS idx_snapshots_cve ON vulnerability_snapshots (cve)");
  db.run("CREATE INDEX IF NOT EXISTS idx_current_unique_key ON vulnerabilities_current (unique_key)");
  db.run("CREATE INDEX IF NOT EXISTS idx_current_scan_date ON vulnerabilities_current (scan_date)");
  db.run("CREATE INDEX IF NOT EXISTS idx_current_enhanced_unique_key ON vulnerabilities_current (enhanced_unique_key)");
  db.run("CREATE INDEX IF NOT EXISTS idx_current_lifecycle_scan ON vulnerabilities_current (lifecycle_state, scan_date)");
  db.run("CREATE INDEX IF NOT EXISTS idx_current_confidence_tier ON vulnerabilities_current (confidence_score, dedup_tier)");
  db.run("CREATE INDEX IF NOT EXISTS idx_current_active_severity ON vulnerabilities_current (lifecycle_state, severity)");
  db.run("CREATE INDEX IF NOT EXISTS idx_current_resolved_date ON vulnerabilities_current (resolved_date)");
  db.run("CREATE INDEX IF NOT EXISTS idx_current_cve ON vulnerabilities_current (cve)");
  db.run("CREATE INDEX IF NOT EXISTS idx_current_vendor ON vulnerabilities_current (vendor)"); // HEX-101 Blocking Issue #3
  db.run("CREATE INDEX IF NOT EXISTS idx_staging_import_id ON vulnerability_staging (import_id)");
  db.run("CREATE INDEX IF NOT EXISTS idx_staging_processed ON vulnerability_staging (processed)");
  db.run("CREATE INDEX IF NOT EXISTS idx_staging_batch_id ON vulnerability_staging (batch_id)");
  db.run("CREATE INDEX IF NOT EXISTS idx_staging_unprocessed_batch ON vulnerability_staging (processed, batch_id)");
  db.run("CREATE INDEX IF NOT EXISTS idx_email_templates_name ON email_templates (name)");
  db.run("CREATE INDEX IF NOT EXISTS idx_email_templates_active ON email_templates (is_active)");
  db.run("CREATE INDEX IF NOT EXISTS idx_email_templates_category ON email_templates (category)");
  db.run("CREATE INDEX IF NOT EXISTS idx_kev_status_ransomware ON kev_status(known_ransomware_use) WHERE known_ransomware_use = 1");
  db.run("CREATE INDEX IF NOT EXISTS idx_kev_status_date_added ON kev_status(date_added)");
  db.run("CREATE INDEX IF NOT EXISTS idx_kev_status_cve_id ON kev_status(cve_id)");
  db.run("CREATE INDEX IF NOT EXISTS idx_kev_status_due_date ON kev_status(due_date)");
  db.run("CREATE INDEX IF NOT EXISTS idx_sync_metadata_type_time ON sync_metadata(sync_type, sync_time DESC)");
  db.run("CREATE INDEX IF NOT EXISTS idx_ticket_templates_name ON ticket_templates (name)");
  db.run("CREATE INDEX IF NOT EXISTS idx_ticket_templates_category ON ticket_templates (category)");
  db.run("CREATE INDEX IF NOT EXISTS idx_ticket_templates_active ON ticket_templates (is_active)");
  db.run("CREATE INDEX IF NOT EXISTS idx_vulnerability_templates_name ON vulnerability_templates (name)");
  db.run("CREATE INDEX IF NOT EXISTS idx_vulnerability_templates_category ON vulnerability_templates (category)");
  db.run("CREATE INDEX IF NOT EXISTS idx_vulnerability_templates_active ON vulnerability_templates (is_active)");
  db.run("CREATE INDEX IF NOT EXISTS idx_users_username ON users (username)");
  db.run("CREATE INDEX IF NOT EXISTS idx_users_email ON users (email)");
  db.run("CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id ON user_preferences (user_id)");

  // Wait for the last index creation to complete before resolving
  db.run("CREATE INDEX IF NOT EXISTS idx_user_preferences_key ON user_preferences (user_id, preference_key)", (err) => {
    if (err) {
      console.error("Error creating indexes:", err.message);
      reject(err);
      return;
    }

    console.log("Database initialized successfully!");
    console.log("Tables created:");
    console.log("  - tickets (ticket management)");
    console.log("  - vulnerability_imports (import tracking)");
    console.log("  - vulnerabilities (legacy vulnerability data)");
    console.log("  - ticket_vulnerabilities (cross-referencing)");
    console.log("  - vulnerability_snapshots (historical data)");
    console.log("  - vulnerabilities_current (active vulnerabilities)");
    console.log("  - vulnerability_daily_totals (aggregated metrics)");
    console.log("  - vulnerability_staging (import staging)");
    console.log("  - email_templates (email templates)");
    console.log("  - kev_status (CISA KEV data)");
    console.log("  - sync_metadata (sync tracking)");
    console.log("  - ticket_templates (ticket templates)");
    console.log("  - vulnerability_templates (vulnerability templates)");
    console.log("  - users (authentication and authorization)");
    console.log("  - user_preferences (cross-device settings - HEX-138)");
    console.log("All 15 tables and 37 indexes created successfully!");

    resolve();
  });
    });
  });
}

/**
 * Seed initial data into database
 * @param {sqlite3.Database} db - Database connection
 * @returns {Promise<void>}
 */
async function seedInitialData(db) {
  return new Promise((resolve, reject) => {
    db.get("SELECT COUNT(*) as count FROM users WHERE username = ?", ["admin"], async (err, row) => {
      if (err) {
        console.error("Error checking for admin user:", err.message);
        reject(err);
        return;
      }

      // Only seed admin if it doesn't exist
      if (!row || row.count === 0) {
        try {
          // Default initial password (MUST be changed after first login)
          const initialPassword = "admin123!";

          // Hash password with Argon2id
          const passwordHash = await argon2.hash(initialPassword, {
            type: argon2.argon2id,
            memoryCost: 19456,
            timeCost: 2,
            parallelism: 1
          });

          // Insert admin user
          db.run(
            `INSERT INTO users (id, username, email, password_hash, role)
             VALUES (?, ?, ?, ?, ?)`,
            [
              "00000000-0000-0000-0000-000000000001",
              "admin",
              "admin@hextrackr.local",
              passwordHash,
              "superadmin"
            ],
            (insertErr) => {
              if (insertErr) {
                console.error("Error creating admin user:", insertErr.message);
                reject(insertErr);
                return;
              }

              console.log("");
              console.log("═══════════════════════════════════════════════════════");
              console.log("🔐 INITIAL ADMIN CREDENTIALS (SAVE THESE!)");
              console.log("═══════════════════════════════════════════════════════");
              console.log("Username: admin");
              console.log(`Password: ${initialPassword}`);
              console.log("═══════════════════════════════════════════════════════");
              console.log("⚠️  CHANGE THIS PASSWORD IMMEDIATELY AFTER FIRST LOGIN!");
              console.log("═══════════════════════════════════════════════════════");
              console.log("");

              resolve();
            }
          );
        } catch (hashError) {
          console.error("Error hashing password:", hashError.message);
          reject(hashError);
        }
      } else {
        console.log("Admin user already exists - skipping seed");
        resolve();
      }
    });
  });
}

// Execute database initialization
initializeDatabase()
  .then(() => {
    console.log("Database initialization completed successfully");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Database initialization failed:", error);
    process.exit(1);
  });