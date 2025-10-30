CREATE TABLE vulnerability_imports (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    filename TEXT NOT NULL,
    import_date TEXT NOT NULL,
    row_count INTEGER NOT NULL,
    vendor TEXT, -- cisco, tenable, qualys, etc
    file_size INTEGER,
    processing_time INTEGER, -- milliseconds
    raw_headers TEXT, -- JSON array of original column names
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
CREATE TABLE sqlite_sequence(name,seq);
CREATE TABLE vulnerabilities (
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
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP, vendor TEXT DEFAULT '', vulnerability_date TEXT DEFAULT '', state TEXT DEFAULT 'open', import_date TEXT DEFAULT '', is_fixed INTEGER DEFAULT 0, fixed_cisco_versions TEXT, fixed_cisco_url TEXT, cisco_synced_at DATETIME, operating_system TEXT, solution_text TEXT, fixed_palo_versions TEXT, fixed_palo_url TEXT, palo_synced_at DATETIME,
    FOREIGN KEY (import_id) REFERENCES vulnerability_imports (id)
  );
CREATE TABLE ticket_vulnerabilities (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ticket_id TEXT NOT NULL,
    vulnerability_id INTEGER NOT NULL,
    relationship_type TEXT DEFAULT 'remediation', -- remediation, investigation, etc
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (ticket_id) REFERENCES tickets (id),
    FOREIGN KEY (vulnerability_id) REFERENCES vulnerabilities (id)
  );
CREATE TABLE vulnerability_snapshots (
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
                enhanced_unique_key TEXT, operating_system TEXT, solution_text TEXT,
                FOREIGN KEY (import_id) REFERENCES vulnerability_imports (id)
            );
CREATE TABLE vulnerabilities_current (
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
                enhanced_unique_key TEXT, is_fix_available INTEGER DEFAULT 0, operating_system TEXT, solution_text TEXT,
                FOREIGN KEY (import_id) REFERENCES vulnerability_imports (id)
            );
CREATE TABLE vulnerability_daily_totals (
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
            );
CREATE TABLE vulnerability_staging (
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
                processed_at DATETIME, operating_system TEXT, solution_text TEXT,
                FOREIGN KEY (import_id) REFERENCES vulnerability_imports (id)
            );
CREATE TABLE email_templates (
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
            );
CREATE TABLE kev_status (
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
                );
CREATE TABLE sync_metadata (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    sync_type TEXT NOT NULL,
                    sync_time TIMESTAMP NOT NULL,
                    version TEXT,
                    record_count INTEGER,
                    status TEXT DEFAULT 'completed',
                    error_message TEXT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                , next_sync_time TEXT);
CREATE TABLE ticket_templates (
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
);
CREATE TABLE vulnerability_templates (
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
);
CREATE TABLE users (
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
  );
CREATE TABLE lost_and_found(rootpgno INTEGER, pgno INTEGER, nfield INTEGER, id INTEGER, c0, c1, c2, c3, c4, c5, c6, c7, c8, c9, c10, c11, c12, c13, c14, c15, c16, c17, c18, c19, c20, c21, c22, c23, c24, c25);
CREATE TABLE user_preferences (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  preference_key TEXT NOT NULL,
  preference_value TEXT NOT NULL,  -- JSON for complex values (theme, settings, templates)
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE(user_id, preference_key)
);
CREATE TABLE IF NOT EXISTS "tickets" (
    id TEXT PRIMARY KEY,
    xt_number TEXT,  -- REMOVED UNIQUE constraint
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
    deleted_at TEXT
, job_type TEXT DEFAULT 'Upgrade', tracking_number TEXT, software_versions TEXT, mitigation_details TEXT, shipping_line1 TEXT, shipping_line2 TEXT, shipping_city TEXT, shipping_state TEXT, shipping_zip TEXT, return_line1 TEXT, return_line2 TEXT, return_city TEXT, return_state TEXT, return_zip TEXT, outbound_tracking TEXT, return_tracking TEXT, deletion_reason TEXT, deleted_by TEXT, site_address TEXT, return_address TEXT, installed_versions TEXT, device_status TEXT);
CREATE TABLE cisco_advisories (
    cve_id TEXT PRIMARY KEY,                    -- CVE identifier (e.g., "CVE-2024-1234")
    advisory_id TEXT,                           -- Cisco advisory ID (e.g., "cisco-sa-20241001-xyz")
    advisory_title TEXT,                        -- Human-readable advisory title
    severity TEXT,                              -- Cisco severity rating (Critical, High, Medium, Low)
    cvss_score TEXT,                            -- CVSS score from Cisco advisory
    first_fixed TEXT,                           -- JSON array: ["15.2(4)M11", "16.3.1", "17.1.1"]
    affected_releases TEXT,                     -- JSON array of affected software versions
    product_names TEXT,                         -- JSON array of affected Cisco products
    publication_url TEXT,                       -- Direct link to Cisco advisory page
    last_synced TIMESTAMP DEFAULT CURRENT_TIMESTAMP  -- Last time this advisory was synced
);
CREATE TABLE palo_alto_advisories (
    cve_id TEXT PRIMARY KEY,                    -- CVE identifier (e.g., "CVE-2024-3400")
    advisory_id TEXT,                           -- Palo Alto advisory ID (same as CVE for their API)
    advisory_title TEXT,                        -- Human-readable advisory title from containers.cna.title
    severity TEXT,                              -- Severity rating from metrics[0].cvssV4_0.baseSeverity
    cvss_score TEXT,                            -- CVSS score from metrics[0].cvssV4_0.baseScore
    first_fixed TEXT,                           -- JSON array: ["10.2.0-h3", "10.2.1-h2", "11.0.0"]
    affected_versions TEXT,                     -- JSON array from x_affectedList
    product_name TEXT,                          -- From affected[].product (always "PAN-OS" for v1)
    publication_url TEXT,                       -- Constructed: https://security.paloaltonetworks.com/{cve_id}
    last_synced TIMESTAMP DEFAULT CURRENT_TIMESTAMP  -- Last time this advisory was synced
);
CREATE TABLE vendor_daily_totals (
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
);
CREATE TABLE audit_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,

    -- Event Classification (indexed for fast queries)
    category TEXT NOT NULL,                    -- e.g., 'user.login', 'ticket.delete', 'import.start'
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,

    -- User Context (may be NULL for system events)
    user_id TEXT,                              -- User identifier (if authenticated)
    username TEXT,                             -- Username for quick lookup

    -- Request Context (if web request)
    ip_address TEXT,                           -- Client IP address
    user_agent TEXT,                           -- Browser/client identifier
    request_id TEXT,                           -- Correlation ID from request logging

    -- Encrypted Payload (contains sensitive details)
    encrypted_message BLOB NOT NULL,           -- AES-256-GCM encrypted message
    encrypted_data BLOB,                       -- AES-256-GCM encrypted JSON data object
    encryption_iv BLOB NOT NULL,               -- Initialization vector for decryption

    -- Metadata
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE audit_log_config (
    id INTEGER PRIMARY KEY CHECK (id = 1),     -- Singleton table (only 1 row allowed)

    -- Encryption Key (generated on first initialization)
    encryption_key BLOB NOT NULL,              -- AES-256 key (32 bytes)
    key_created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    key_rotated_at DATETIME,                   -- For future key rotation feature

    -- Retention Policy
    retention_days INTEGER DEFAULT 30,         -- Days to keep audit logs
    last_cleanup_at DATETIME,                  -- Last purge timestamp

    -- Statistics
    total_logs_written INTEGER DEFAULT 0,      -- Lifetime audit log count
    total_logs_purged INTEGER DEFAULT 0,       -- Lifetime purge count

    -- Metadata
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE cisco_fixed_versions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    cve_id TEXT NOT NULL,                           -- CVE identifier (e.g., "CVE-2025-20352")
    os_family TEXT NOT NULL,                        -- OS family: "ios", "iosxe", "iosxr", "nxos", "asa", "ftd", "fxos"
    fixed_version TEXT NOT NULL,                    -- Fixed version: "15.2(8)E8", "17.12.6", etc.
    affected_version TEXT,                          -- Affected version this fixes: "15.2(8)E5", "17.12.5a"
    last_synced TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- Last time this version was synced

    -- Foreign key to cisco_advisories (cascade delete)
    FOREIGN KEY (cve_id) REFERENCES cisco_advisories(cve_id) ON DELETE CASCADE,

    -- Prevent duplicate (CVE, OS family, version) entries
    UNIQUE(cve_id, os_family, fixed_version)
);
CREATE INDEX idx_current_unique_key ON vulnerabilities_current (unique_key);
CREATE INDEX idx_current_enhanced_unique_key ON vulnerabilities_current (enhanced_unique_key);
CREATE INDEX idx_snapshots_enhanced_key ON vulnerability_snapshots (enhanced_unique_key);
CREATE UNIQUE INDEX idx_tickets_xt_unique_active ON tickets(xt_number) WHERE deleted = 0;
CREATE INDEX idx_vulnerabilities_hostname ON vulnerabilities (hostname);
CREATE INDEX idx_vulnerabilities_severity ON vulnerabilities (severity);
CREATE INDEX idx_vulnerabilities_cve ON vulnerabilities (cve);
CREATE INDEX idx_vulnerabilities_import ON vulnerabilities (import_id);
CREATE INDEX idx_ticket_vulns_ticket ON ticket_vulnerabilities (ticket_id);
CREATE INDEX idx_ticket_vulns_vuln ON ticket_vulnerabilities (vulnerability_id);
CREATE INDEX idx_snapshots_scan_date ON vulnerability_snapshots (scan_date);
CREATE INDEX idx_snapshots_hostname ON vulnerability_snapshots (hostname);
CREATE INDEX idx_snapshots_severity ON vulnerability_snapshots (severity);
CREATE INDEX idx_current_scan_date ON vulnerabilities_current (scan_date);
CREATE INDEX idx_current_lifecycle_scan ON vulnerabilities_current (lifecycle_state, scan_date);
CREATE INDEX idx_current_confidence_tier ON vulnerabilities_current (confidence_score, dedup_tier);
CREATE INDEX idx_current_active_severity ON vulnerabilities_current (lifecycle_state, severity);
CREATE INDEX idx_current_resolved_date ON vulnerabilities_current (resolved_date);
CREATE INDEX idx_staging_import_id ON vulnerability_staging (import_id);
CREATE INDEX idx_staging_processed ON vulnerability_staging (processed);
CREATE INDEX idx_staging_batch_id ON vulnerability_staging (batch_id);
CREATE INDEX idx_staging_unprocessed_batch ON vulnerability_staging (processed, batch_id);
CREATE INDEX idx_email_templates_name ON email_templates (name);
CREATE INDEX idx_email_templates_active ON email_templates (is_active);
CREATE INDEX idx_email_templates_category ON email_templates (category);
CREATE INDEX idx_kev_status_ransomware ON kev_status(known_ransomware_use) WHERE known_ransomware_use = 1;
CREATE INDEX idx_kev_status_date_added ON kev_status(date_added);
CREATE INDEX idx_kev_status_cve_id ON kev_status(cve_id);
CREATE INDEX idx_kev_status_due_date ON kev_status(due_date);
CREATE INDEX idx_sync_metadata_type_time ON sync_metadata(sync_type, sync_time DESC);
CREATE INDEX idx_ticket_templates_name ON ticket_templates (name);
CREATE INDEX idx_ticket_templates_category ON ticket_templates (category);
CREATE INDEX idx_ticket_templates_active ON ticket_templates (is_active);
CREATE INDEX idx_vulnerability_templates_name ON vulnerability_templates (name);
CREATE INDEX idx_vulnerability_templates_category ON vulnerability_templates (category);
CREATE INDEX idx_vulnerability_templates_active ON vulnerability_templates (is_active);
CREATE INDEX idx_snapshots_cve ON vulnerability_snapshots (cve);
CREATE INDEX idx_current_cve ON vulnerabilities_current (cve);
CREATE INDEX idx_current_vendor ON vulnerabilities_current (vendor);
CREATE INDEX idx_users_username ON users (username);
CREATE INDEX idx_users_email ON users (email);
CREATE INDEX idx_user_preferences_user_id
  ON user_preferences(user_id);
CREATE INDEX idx_user_preferences_key
  ON user_preferences(user_id, preference_key);
CREATE INDEX idx_tickets_deleted ON tickets(deleted);
CREATE INDEX idx_tickets_xt_number ON tickets(xt_number);
CREATE INDEX idx_tickets_status ON tickets(status);
CREATE INDEX idx_tickets_xt ON tickets (xt_number);
CREATE INDEX idx_tickets_location ON tickets (location);
CREATE INDEX idx_tickets_site ON tickets (site);
CREATE INDEX idx_tickets_job_type ON tickets(job_type);
CREATE INDEX idx_cisco_advisories_cve
    ON cisco_advisories(cve_id);
CREATE INDEX idx_cisco_advisories_synced
    ON cisco_advisories(last_synced);
CREATE INDEX idx_vulnerabilities_is_fixed
    ON vulnerabilities(is_fixed)
    WHERE is_fixed = 1;
CREATE INDEX idx_vulnerabilities_current_fix_available 
    ON vulnerabilities_current(is_fix_available) WHERE is_fix_available = 1;
CREATE INDEX idx_palo_advisories_cve
    ON palo_alto_advisories(cve_id);
CREATE INDEX idx_palo_advisories_synced
    ON palo_alto_advisories(last_synced);
CREATE INDEX idx_vendor_daily_scan_date ON vendor_daily_totals(scan_date);
CREATE INDEX idx_vendor_daily_vendor ON vendor_daily_totals(vendor);
CREATE INDEX idx_vendor_daily_composite ON vendor_daily_totals(vendor, scan_date);
CREATE INDEX idx_audit_logs_category ON audit_logs(category);
CREATE INDEX idx_audit_logs_timestamp ON audit_logs(timestamp);
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_username ON audit_logs(username);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);
CREATE INDEX idx_audit_logs_category_timestamp ON audit_logs(category, timestamp);
CREATE INDEX idx_fixed_versions_cve
    ON cisco_fixed_versions(cve_id);
CREATE INDEX idx_fixed_versions_os_family
    ON cisco_fixed_versions(os_family);
CREATE INDEX idx_fixed_versions_lookup
    ON cisco_fixed_versions(cve_id, os_family);
CREATE TRIGGER user_preferences_updated_at
  AFTER UPDATE ON user_preferences
  FOR EACH ROW
BEGIN
  UPDATE user_preferences
  SET updated_at = CURRENT_TIMESTAMP
  WHERE id = NEW.id;
END;
