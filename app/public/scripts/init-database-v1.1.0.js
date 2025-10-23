/* eslint-env node */
/* global require, console, __dirname */

/**
 * HexTrackr Database Initialization Script - v1.1.0 Baseline
 *
 * CONSOLIDATED SCHEMA - Single Source of Truth
 * This file consolidates 3 previous initialization pathways into ONE baseline:
 * - init-database.js (original 15 tables)
 * - Service constructor schemas (cisco_advisories, palo_alto_advisories)
 * - Migration 007 (cisco_fixed_versions normalization)
 * - Migration 012 (audit_logs + audit_log_config)
 *
 * SCHEMA VERSIONING:
 * - v1.1.0 = 21 application tables + 68 indexes + 1 trigger
 * - Excludes lost_and_found (SQLite recovery artifact)
 * - Excludes users from backups (security - password hashes)
 *
 * USAGE:
 * - Fresh installs: Creates complete v1.1.0 schema
 * - Existing databases: Detected and skipped (use migrations)
 *
 * @version 1.1.0
 * @issue HEX-324
 * @see /docs/SRPI/HEX-324-schema-consolidation.md
 */

const sqlite3 = require("sqlite3").verbose();
const path = require("path");
const argon2 = require("argon2");

const dbPath = path.join(__dirname, "..", "..", "data", "hextrackr.db");

/**
 * Check if database already has schema initialized
 * @param {sqlite3.Database} db - Database connection
 * @returns {Promise<boolean>} True if schema exists
 */
async function checkExistingSchema(db) {
  return new Promise((resolve, reject) => {
    db.get(
      "SELECT COUNT(*) as count FROM sqlite_master WHERE type='table' AND name='users'",
      (err, row) => {
        if (err) reject(err);
        else resolve(row.count > 0);
      }
    );
  });
}

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
        // Check if schema already exists
        const schemaExists = await checkExistingSchema(db);
        if (schemaExists) {
          console.log("");
          console.log("═══════════════════════════════════════════════════════");
          console.log("EXISTING DATABASE DETECTED");
          console.log("═══════════════════════════════════════════════════════");
          console.log("Schema already initialized - use migrations for upgrades");
          console.log("To reinitialize, delete the database file first");
          console.log("═══════════════════════════════════════════════════════");
          console.log("");
          db.close();
          resolve();
          return;
        }

        // Create fresh schema
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
 * Create all database tables, indexes, and triggers for v1.1.0 baseline
 * @param {sqlite3.Database} db - Database connection
 * @returns {Promise<void>}
 */
function createTables(db) {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
  // ============================================================================
  // PRAGMA SETTINGS - WAL Mode + Foreign Keys
  // ============================================================================
  db.run("PRAGMA foreign_keys = ON");
  db.run("PRAGMA journal_mode = WAL");
  db.run("PRAGMA synchronous = NORMAL");

  // ============================================================================
  // TABLE 1: tickets - Field operations ticketing system
  // ============================================================================
  db.run(`CREATE TABLE IF NOT EXISTS tickets (
    id TEXT PRIMARY KEY,
    xt_number TEXT,
    date_submitted TEXT,
    date_due TEXT,
    hexagon_ticket TEXT,
    service_now_ticket TEXT,
    location TEXT NOT NULL,
    devices TEXT,
    supervisor TEXT,
    tech TEXT,
    status TEXT DEFAULT 'Open',
    notes TEXT,
    attachments TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    site TEXT,
    site_id TEXT,
    location_id TEXT,
    deleted INTEGER DEFAULT 0,
    deleted_at TEXT,
    job_type TEXT DEFAULT 'Upgrade',
    tracking_number TEXT,
    software_versions TEXT,
    mitigation_details TEXT,
    shipping_line1 TEXT,
    shipping_line2 TEXT,
    shipping_city TEXT,
    shipping_state TEXT,
    shipping_zip TEXT,
    return_line1 TEXT,
    return_line2 TEXT,
    return_city TEXT,
    return_state TEXT,
    return_zip TEXT,
    outbound_tracking TEXT,
    return_tracking TEXT,
    deletion_reason TEXT,
    deleted_by TEXT,
    site_address TEXT,
    return_address TEXT,
    installed_versions TEXT,
    device_status TEXT
  )`);

  // ============================================================================
  // TABLE 2: vulnerability_imports - CSV import tracking
  // ============================================================================
  db.run(`CREATE TABLE IF NOT EXISTS vulnerability_imports (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    filename TEXT NOT NULL,
    import_date TEXT NOT NULL,
    row_count INTEGER NOT NULL,
    vendor TEXT,
    file_size INTEGER,
    processing_time INTEGER,
    raw_headers TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // ============================================================================
  // TABLE 3: vulnerabilities - Legacy vulnerability data
  // ============================================================================
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
    operating_system TEXT,
    solution_text TEXT,
    is_fixed INTEGER DEFAULT 0,
    fixed_cisco_versions TEXT,
    fixed_cisco_url TEXT,
    cisco_synced_at DATETIME,
    fixed_palo_versions TEXT,
    fixed_palo_url TEXT,
    palo_synced_at DATETIME,
    FOREIGN KEY (import_id) REFERENCES vulnerability_imports (id)
  )`);

  // ============================================================================
  // TABLE 4: ticket_vulnerabilities - Junction table for ticket-vuln mapping
  // ============================================================================
  db.run(`CREATE TABLE IF NOT EXISTS ticket_vulnerabilities (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ticket_id TEXT NOT NULL,
    vulnerability_id INTEGER NOT NULL,
    relationship_type TEXT DEFAULT 'remediation',
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (ticket_id) REFERENCES tickets (id),
    FOREIGN KEY (vulnerability_id) REFERENCES vulnerabilities (id)
  )`);

  // ============================================================================
  // TABLE 5: vulnerability_snapshots - Historical vulnerability data
  // ============================================================================
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
    operating_system TEXT,
    solution_text TEXT,
    FOREIGN KEY (import_id) REFERENCES vulnerability_imports (id)
  )`);

  // ============================================================================
  // TABLE 6: vulnerabilities_current - Active vulnerability data
  // ============================================================================
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
    operating_system TEXT,
    solution_text TEXT,
    is_fix_available INTEGER DEFAULT 0,
    FOREIGN KEY (import_id) REFERENCES vulnerability_imports (id)
  )`);

  // ============================================================================
  // TABLE 7: vulnerability_daily_totals - Aggregated trend metrics
  // ============================================================================
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

  // ============================================================================
  // TABLE 8: vendor_daily_totals - Vendor-specific trend metrics (Migration 008)
  // ============================================================================
  db.run(`CREATE TABLE IF NOT EXISTS vendor_daily_totals (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    scan_date TEXT NOT NULL,
    vendor TEXT NOT NULL,
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
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(scan_date, vendor)
  )`);

  // ============================================================================
  // TABLE 9: vulnerability_staging - Import staging area
  // ============================================================================
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
    operating_system TEXT,
    solution_text TEXT,
    FOREIGN KEY (import_id) REFERENCES vulnerability_imports (id)
  )`);

  // ============================================================================
  // TABLE 10: email_templates - Email notification templates
  // ============================================================================
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

  // ============================================================================
  // TABLE 11: kev_status - CISA Known Exploited Vulnerabilities
  // ============================================================================
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

  // ============================================================================
  // TABLE 12: sync_metadata - Background sync tracking
  // ============================================================================
  db.run(`CREATE TABLE IF NOT EXISTS sync_metadata (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    sync_type TEXT NOT NULL,
    sync_time TIMESTAMP NOT NULL,
    version TEXT,
    record_count INTEGER,
    status TEXT DEFAULT 'completed',
    error_message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    next_sync_time TEXT
  )`);

  // ============================================================================
  // TABLE 13: ticket_templates - Ticket markdown templates
  // ============================================================================
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

  // ============================================================================
  // TABLE 14: vulnerability_templates - CVE templates
  // ============================================================================
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

  // ============================================================================
  // TABLE 15: users - Authentication and authorization
  // ============================================================================
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

  // ============================================================================
  // TABLE 16: user_preferences - Cross-device settings (HEX-138)
  // ============================================================================
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

  // ============================================================================
  // TABLE 17: cisco_advisories - Cisco PSIRT advisory data
  // ============================================================================
  db.run(`CREATE TABLE IF NOT EXISTS cisco_advisories (
    cve_id TEXT PRIMARY KEY,
    advisory_id TEXT,
    advisory_title TEXT,
    severity TEXT,
    cvss_score TEXT,
    first_fixed TEXT,
    affected_releases TEXT,
    product_names TEXT,
    publication_url TEXT,
    last_synced TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`);

  // ============================================================================
  // TABLE 18: cisco_fixed_versions - Normalized Cisco fixed versions (Migration 007)
  // ============================================================================
  db.run(`CREATE TABLE IF NOT EXISTS cisco_fixed_versions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    cve_id TEXT NOT NULL,
    os_family TEXT NOT NULL,
    fixed_version TEXT NOT NULL,
    affected_version TEXT,
    last_synced TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (cve_id) REFERENCES cisco_advisories(cve_id) ON DELETE CASCADE,
    UNIQUE(cve_id, os_family, fixed_version)
  )`);

  // ============================================================================
  // TABLE 19: palo_alto_advisories - Palo Alto security bulletins
  // ============================================================================
  db.run(`CREATE TABLE IF NOT EXISTS palo_alto_advisories (
    cve_id TEXT PRIMARY KEY,
    advisory_id TEXT,
    advisory_title TEXT,
    severity TEXT,
    cvss_score TEXT,
    first_fixed TEXT,
    affected_versions TEXT,
    product_name TEXT,
    publication_url TEXT,
    last_synced TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`);

  // ============================================================================
  // TABLE 20: audit_logs - Encrypted audit trail (Migration 012)
  // ============================================================================
  db.run(`CREATE TABLE IF NOT EXISTS audit_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    category TEXT NOT NULL,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,
    user_id TEXT,
    username TEXT,
    ip_address TEXT,
    user_agent TEXT,
    request_id TEXT,
    encrypted_message BLOB NOT NULL,
    encrypted_data BLOB,
    encryption_iv BLOB NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // ============================================================================
  // TABLE 21: audit_log_config - Audit configuration (Migration 012)
  // ============================================================================
  db.run(`CREATE TABLE IF NOT EXISTS audit_log_config (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    encryption_key BLOB NOT NULL,
    key_created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    key_rotated_at DATETIME,
    retention_days INTEGER DEFAULT 30,
    last_cleanup_at DATETIME,
    total_logs_written INTEGER DEFAULT 0,
    total_logs_purged INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // ============================================================================
  // INDEXES - 68 Performance Indexes
  // ============================================================================

  // Tickets indexes (11 total)
  db.run("CREATE INDEX IF NOT EXISTS idx_tickets_status ON tickets (status)");
  db.run("CREATE INDEX IF NOT EXISTS idx_tickets_site ON tickets (site)");
  db.run("CREATE INDEX IF NOT EXISTS idx_tickets_location ON tickets (location)");
  db.run("CREATE INDEX IF NOT EXISTS idx_tickets_xt ON tickets (xt_number)");
  db.run("CREATE INDEX IF NOT EXISTS idx_tickets_deleted ON tickets(deleted)");
  db.run("CREATE INDEX IF NOT EXISTS idx_tickets_xt_number ON tickets(xt_number)");
  db.run("CREATE INDEX IF NOT EXISTS idx_tickets_job_type ON tickets(job_type)");
  db.run("CREATE UNIQUE INDEX IF NOT EXISTS idx_tickets_xt_unique_active ON tickets(xt_number) WHERE deleted = 0");

  // Vulnerabilities indexes (6 total)
  db.run("CREATE INDEX IF NOT EXISTS idx_vulnerabilities_hostname ON vulnerabilities (hostname)");
  db.run("CREATE INDEX IF NOT EXISTS idx_vulnerabilities_severity ON vulnerabilities (severity)");
  db.run("CREATE INDEX IF NOT EXISTS idx_vulnerabilities_cve ON vulnerabilities (cve)");
  db.run("CREATE INDEX IF NOT EXISTS idx_vulnerabilities_import ON vulnerabilities (import_id)");
  db.run("CREATE INDEX IF NOT EXISTS idx_vulnerabilities_is_fixed ON vulnerabilities(is_fixed) WHERE is_fixed = 1");

  // Ticket-vulnerability junction indexes (2 total)
  db.run("CREATE INDEX IF NOT EXISTS idx_ticket_vulns_ticket ON ticket_vulnerabilities (ticket_id)");
  db.run("CREATE INDEX IF NOT EXISTS idx_ticket_vulns_vuln ON ticket_vulnerabilities (vulnerability_id)");

  // Vulnerability snapshots indexes (5 total)
  db.run("CREATE INDEX IF NOT EXISTS idx_snapshots_scan_date ON vulnerability_snapshots (scan_date)");
  db.run("CREATE INDEX IF NOT EXISTS idx_snapshots_hostname ON vulnerability_snapshots (hostname)");
  db.run("CREATE INDEX IF NOT EXISTS idx_snapshots_severity ON vulnerability_snapshots (severity)");
  db.run("CREATE INDEX IF NOT EXISTS idx_snapshots_enhanced_key ON vulnerability_snapshots (enhanced_unique_key)");
  db.run("CREATE INDEX IF NOT EXISTS idx_snapshots_cve ON vulnerability_snapshots (cve)");

  // Vulnerabilities current indexes (11 total)
  db.run("CREATE INDEX IF NOT EXISTS idx_current_unique_key ON vulnerabilities_current (unique_key)");
  db.run("CREATE INDEX IF NOT EXISTS idx_current_scan_date ON vulnerabilities_current (scan_date)");
  db.run("CREATE INDEX IF NOT EXISTS idx_current_enhanced_unique_key ON vulnerabilities_current (enhanced_unique_key)");
  db.run("CREATE INDEX IF NOT EXISTS idx_current_lifecycle_scan ON vulnerabilities_current (lifecycle_state, scan_date)");
  db.run("CREATE INDEX IF NOT EXISTS idx_current_confidence_tier ON vulnerabilities_current (confidence_score, dedup_tier)");
  db.run("CREATE INDEX IF NOT EXISTS idx_current_active_severity ON vulnerabilities_current (lifecycle_state, severity)");
  db.run("CREATE INDEX IF NOT EXISTS idx_current_resolved_date ON vulnerabilities_current (resolved_date)");
  db.run("CREATE INDEX IF NOT EXISTS idx_current_cve ON vulnerabilities_current (cve)");
  db.run("CREATE INDEX IF NOT EXISTS idx_current_vendor ON vulnerabilities_current (vendor)");
  db.run("CREATE INDEX IF NOT EXISTS idx_vulnerabilities_current_fix_available ON vulnerabilities_current(is_fix_available) WHERE is_fix_available = 1");

  // Vulnerability staging indexes (4 total)
  db.run("CREATE INDEX IF NOT EXISTS idx_staging_import_id ON vulnerability_staging (import_id)");
  db.run("CREATE INDEX IF NOT EXISTS idx_staging_processed ON vulnerability_staging (processed)");
  db.run("CREATE INDEX IF NOT EXISTS idx_staging_batch_id ON vulnerability_staging (batch_id)");
  db.run("CREATE INDEX IF NOT EXISTS idx_staging_unprocessed_batch ON vulnerability_staging (processed, batch_id)");

  // Vendor daily totals indexes (3 total)
  db.run("CREATE INDEX IF NOT EXISTS idx_vendor_daily_scan_date ON vendor_daily_totals(scan_date)");
  db.run("CREATE INDEX IF NOT EXISTS idx_vendor_daily_vendor ON vendor_daily_totals(vendor)");
  db.run("CREATE INDEX IF NOT EXISTS idx_vendor_daily_composite ON vendor_daily_totals(vendor, scan_date)");

  // Email templates indexes (3 total)
  db.run("CREATE INDEX IF NOT EXISTS idx_email_templates_name ON email_templates (name)");
  db.run("CREATE INDEX IF NOT EXISTS idx_email_templates_active ON email_templates (is_active)");
  db.run("CREATE INDEX IF NOT EXISTS idx_email_templates_category ON email_templates (category)");

  // KEV status indexes (4 total)
  db.run("CREATE INDEX IF NOT EXISTS idx_kev_status_ransomware ON kev_status(known_ransomware_use) WHERE known_ransomware_use = 1");
  db.run("CREATE INDEX IF NOT EXISTS idx_kev_status_date_added ON kev_status(date_added)");
  db.run("CREATE INDEX IF NOT EXISTS idx_kev_status_cve_id ON kev_status(cve_id)");
  db.run("CREATE INDEX IF NOT EXISTS idx_kev_status_due_date ON kev_status(due_date)");

  // Sync metadata indexes (1 total)
  db.run("CREATE INDEX IF NOT EXISTS idx_sync_metadata_type_time ON sync_metadata(sync_type, sync_time DESC)");

  // Ticket templates indexes (3 total)
  db.run("CREATE INDEX IF NOT EXISTS idx_ticket_templates_name ON ticket_templates (name)");
  db.run("CREATE INDEX IF NOT EXISTS idx_ticket_templates_category ON ticket_templates (category)");
  db.run("CREATE INDEX IF NOT EXISTS idx_ticket_templates_active ON ticket_templates (is_active)");

  // Vulnerability templates indexes (3 total)
  db.run("CREATE INDEX IF NOT EXISTS idx_vulnerability_templates_name ON vulnerability_templates (name)");
  db.run("CREATE INDEX IF NOT EXISTS idx_vulnerability_templates_category ON vulnerability_templates (category)");
  db.run("CREATE INDEX IF NOT EXISTS idx_vulnerability_templates_active ON vulnerability_templates (is_active)");

  // Users indexes (2 total)
  db.run("CREATE INDEX IF NOT EXISTS idx_users_username ON users (username)");
  db.run("CREATE INDEX IF NOT EXISTS idx_users_email ON users (email)");

  // User preferences indexes (2 total)
  db.run("CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id ON user_preferences (user_id)");
  db.run("CREATE INDEX IF NOT EXISTS idx_user_preferences_key ON user_preferences (user_id, preference_key)");

  // Cisco advisories indexes (2 total)
  db.run("CREATE INDEX IF NOT EXISTS idx_cisco_advisories_cve ON cisco_advisories(cve_id)");
  db.run("CREATE INDEX IF NOT EXISTS idx_cisco_advisories_synced ON cisco_advisories(last_synced)");

  // Cisco fixed versions indexes (3 total)
  db.run("CREATE INDEX IF NOT EXISTS idx_fixed_versions_cve ON cisco_fixed_versions(cve_id)");
  db.run("CREATE INDEX IF NOT EXISTS idx_fixed_versions_os_family ON cisco_fixed_versions(os_family)");
  db.run("CREATE INDEX IF NOT EXISTS idx_fixed_versions_lookup ON cisco_fixed_versions(cve_id, os_family)");

  // Palo Alto advisories indexes (2 total)
  db.run("CREATE INDEX IF NOT EXISTS idx_palo_advisories_cve ON palo_alto_advisories(cve_id)");
  db.run("CREATE INDEX IF NOT EXISTS idx_palo_advisories_synced ON palo_alto_advisories(last_synced)");

  // Audit logs indexes (6 total) - last index triggers completion callback
  db.run("CREATE INDEX IF NOT EXISTS idx_audit_logs_category ON audit_logs(category)");
  db.run("CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON audit_logs(timestamp)");
  db.run("CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id)");
  db.run("CREATE INDEX IF NOT EXISTS idx_audit_logs_username ON audit_logs(username)");
  db.run("CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at)");
  db.run("CREATE INDEX IF NOT EXISTS idx_audit_logs_category_timestamp ON audit_logs(category, timestamp)");

  // ============================================================================
  // TRIGGERS - 1 Trigger
  // ============================================================================
  db.run(`CREATE TRIGGER IF NOT EXISTS user_preferences_updated_at
    AFTER UPDATE ON user_preferences
    FOR EACH ROW
  BEGIN
    UPDATE user_preferences
    SET updated_at = CURRENT_TIMESTAMP
    WHERE id = NEW.id;
  END`, (err) => {
    if (err) {
      console.error("Error creating trigger:", err.message);
      reject(err);
      return;
    }

    console.log("");
    console.log("═══════════════════════════════════════════════════════");
    console.log("DATABASE INITIALIZED SUCCESSFULLY - v1.1.0 BASELINE");
    console.log("═══════════════════════════════════════════════════════");
    console.log("Schema Version: v1.1.0 (consolidated)");
    console.log("Tables Created: 21 application tables");
    console.log("Indexes Created: 68 performance indexes");
    console.log("Triggers Created: 1 (user_preferences_updated_at)");
    console.log("");
    console.log("Tables:");
    console.log(" - tickets (field operations ticketing)");
    console.log(" - vulnerability_imports (import tracking)");
    console.log(" - vulnerabilities (legacy vulnerability data)");
    console.log(" - ticket_vulnerabilities (cross-referencing)");
    console.log(" - vulnerability_snapshots (historical data)");
    console.log(" - vulnerabilities_current (active vulnerabilities)");
    console.log(" - vulnerability_daily_totals (aggregated metrics)");
    console.log(" - vendor_daily_totals (vendor-specific metrics)");
    console.log(" - vulnerability_staging (import staging)");
    console.log(" - email_templates (email templates)");
    console.log(" - kev_status (CISA KEV data)");
    console.log(" - sync_metadata (sync tracking)");
    console.log(" - ticket_templates (ticket templates)");
    console.log(" - vulnerability_templates (vulnerability templates)");
    console.log(" - users (authentication and authorization)");
    console.log(" - user_preferences (cross-device settings)");
    console.log(" - cisco_advisories (Cisco PSIRT advisories)");
    console.log(" - cisco_fixed_versions (normalized Cisco versions)");
    console.log(" - palo_alto_advisories (Palo Alto security bulletins)");
    console.log(" - audit_logs (encrypted audit trail)");
    console.log(" - audit_log_config (audit configuration)");
    console.log("═══════════════════════════════════════════════════════");
    console.log("");

    resolve();
  });
    });
  });
}

/**
 * Seed initial data into database (admin user only)
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
              console.log("INITIAL ADMIN CREDENTIALS (SAVE THESE!)");
              console.log("═══════════════════════════════════════════════════════");
              console.log("Username: admin");
              console.log(`Password: ${initialPassword}`);
              console.log("═══════════════════════════════════════════════════════");
              console.log("CHANGE THIS PASSWORD IMMEDIATELY AFTER FIRST LOGIN!");
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

// ============================================================================
// EXECUTION - Main Entry Point
// ============================================================================
initializeDatabase()
  .then(() => {
    console.log("Database initialization completed successfully");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Database initialization failed:", error);
    process.exit(1);
  });
