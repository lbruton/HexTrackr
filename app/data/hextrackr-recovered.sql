BEGIN;
PRAGMA writable_schema = on;
PRAGMA encoding = 'UTF-8';
PRAGMA page_size = '4096';
PRAGMA auto_vacuum = '0';
PRAGMA user_version = '0';
PRAGMA application_id = '0';
CREATE TABLE sqlite_sequence(name,seq);
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
                );
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
CREATE TABLE "tickets" (
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
CREATE INDEX idx_current_unique_key ON vulnerabilities_current (unique_key);
CREATE INDEX idx_current_enhanced_unique_key ON vulnerabilities_current (enhanced_unique_key);
CREATE INDEX idx_snapshots_enhanced_key ON vulnerability_snapshots (enhanced_unique_key);
CREATE UNIQUE INDEX idx_tickets_xt_unique_active ON tickets(xt_number) WHERE deleted = 0;
INSERT OR IGNORE INTO 'vulnerability_imports'('id', 'filename', 'import_date', 'row_count', 'vendor', 'file_size', 'processing_time', 'raw_headers', 'created_at') VALUES (91, 'vulnerabilities-10_15_2025_-07_57_22-cdt.csv', '2025-10-16T06:07:30.611Z', 14142, 'cisco', 18991875, 32702, '["age_in_days","asset.host_name","asset.id","asset.ipv4_addresses","asset.name","asset.operating_systems","definition.cve","definition.description","definition.family","definition.id","definition.name","definition.solution","definition.vpr.score","definition.vulnerability_published","definition.workaround","definition.workaround_published","definition.workaround_type","first_observed","id","last_seen","port","protocol","resurfaced_date","severity","state","vuln_age","vuln_sla_date"]', '2025-10-16 06:07:30');
INSERT OR IGNORE INTO 'vulnerability_imports'('id', 'filename', 'import_date', 'row_count', 'vendor', 'file_size', 'processing_time', 'raw_headers', 'created_at') VALUES (92, 'vulnerabilities-10_15_2025_-07_57_22-cdt.csv', '2025-10-16T14:05:56.584Z', 14142, 'cisco', 18991875, 29862, '["age_in_days","asset.host_name","asset.id","asset.ipv4_addresses","asset.name","asset.operating_systems","definition.cve","definition.description","definition.family","definition.id","definition.name","definition.solution","definition.vpr.score","definition.vulnerability_published","definition.workaround","definition.workaround_published","definition.workaround_type","first_observed","id","last_seen","port","protocol","resurfaced_date","severity","state","vuln_age","vuln_sla_date"]', '2025-10-16 14:05:56');
INSERT OR IGNORE INTO 'vulnerability_imports'('id', 'filename', 'import_date', 'row_count', 'vendor', 'file_size', 'processing_time', 'raw_headers', 'created_at') VALUES (1, 'vulnerabilities-cisco.csv', '2025-09-19T07:22:09.406Z', 12222, 'cisco', 3168463, 7255, '["asset.display_ipv4_address","asset.id","asset.name","definition.cve","definition.family","definition.id","definition.name","definition.plugin_published","definition.plugin_updated","definition.vpr.score","id","resurfaced_date","severity","state"]', '2025-09-19 07:22:09');
INSERT OR IGNORE INTO 'vulnerability_imports'('id', 'filename', 'import_date', 'row_count', 'vendor', 'file_size', 'processing_time', 'raw_headers', 'created_at') VALUES (2, 'vulnerabilities-cisco-1.csv', '2025-09-19T07:22:36.810Z', 12073, 'cisco', 3129130, 8751, '["asset.display_ipv4_address","asset.id","asset.name","definition.cve","definition.family","definition.id","definition.name","definition.plugin_published","definition.plugin_updated","definition.vpr.score","id","resurfaced_date","severity","state"]', '2025-09-19 07:22:36');
INSERT OR IGNORE INTO 'vulnerability_imports'('id', 'filename', 'import_date', 'row_count', 'vendor', 'file_size', 'processing_time', 'raw_headers', 'created_at') VALUES (3, 'device-security-server01-2025-09-06.csv', '2025-09-20T22:44:08.493Z', 10, 'cisco', 432, 892, '["Device Information"]', '2025-09-20 22:44:08');
INSERT OR IGNORE INTO 'vulnerability_imports'('id', 'filename', 'import_date', 'row_count', 'vendor', 'file_size', 'processing_time', 'raw_headers', 'created_at') VALUES (4, 'device-security-server01-2025-09-06.csv', '2025-09-20T22:50:24.801Z', 10, 'cisco', 432, 45, '["Device Information"]', '2025-09-20 22:50:24');
INSERT OR IGNORE INTO 'vulnerability_imports'('id', 'filename', 'import_date', 'row_count', 'vendor', 'file_size', 'processing_time', 'raw_headers', 'created_at') VALUES (5, 'vulnerabilities-cisco.csv', '2025-09-20T22:52:21.916Z', 12222, 'cisco', 3168463, 6314, '["asset.display_ipv4_address","asset.id","asset.name","definition.cve","definition.family","definition.id","definition.name","definition.plugin_published","definition.plugin_updated","definition.vpr.score","id","resurfaced_date","severity","state"]', '2025-09-20 22:52:21');
INSERT OR IGNORE INTO 'vulnerability_imports'('id', 'filename', 'import_date', 'row_count', 'vendor', 'file_size', 'processing_time', 'raw_headers', 'created_at') VALUES (6, 'vulnerabilities-cisco-1.csv', '2025-09-20T22:52:48.862Z', 12073, 'cisco', 3129130, 8187, '["asset.display_ipv4_address","asset.id","asset.name","definition.cve","definition.family","definition.id","definition.name","definition.plugin_published","definition.plugin_updated","definition.vpr.score","id","resurfaced_date","severity","state"]', '2025-09-20 22:52:48');
INSERT OR IGNORE INTO 'vulnerability_imports'('id', 'filename', 'import_date', 'row_count', 'vendor', 'file_size', 'processing_time', 'raw_headers', 'created_at') VALUES (7, 'vulnerabilities-cisco-1.csv', '2025-09-20T23:04:24.920Z', 12073, 'cisco', 3129130, 9306, '["asset.display_ipv4_address","asset.id","asset.name","definition.cve","definition.family","definition.id","definition.name","definition.plugin_published","definition.plugin_updated","definition.vpr.score","id","resurfaced_date","severity","state"]', '2025-09-20 23:04:24');
INSERT OR IGNORE INTO 'vulnerability_imports'('id', 'filename', 'import_date', 'row_count', 'vendor', 'file_size', 'processing_time', 'raw_headers', 'created_at') VALUES (8, 'vulnerabilities-cisco.csv', '2025-09-20T23:05:23.694Z', 12222, 'cisco', 3168463, 6671, '["asset.display_ipv4_address","asset.id","asset.name","definition.cve","definition.family","definition.id","definition.name","definition.plugin_published","definition.plugin_updated","definition.vpr.score","id","resurfaced_date","severity","state"]', '2025-09-20 23:05:23');
INSERT OR IGNORE INTO 'vulnerability_imports'('id', 'filename', 'import_date', 'row_count', 'vendor', 'file_size', 'processing_time', 'raw_headers', 'created_at') VALUES (9, 'vulnerabilities-cisco-1.csv', '2025-09-20T23:06:36.597Z', 12073, 'cisco', 3129130, 10002, '["asset.display_ipv4_address","asset.id","asset.name","definition.cve","definition.family","definition.id","definition.name","definition.plugin_published","definition.plugin_updated","definition.vpr.score","id","resurfaced_date","severity","state"]', '2025-09-20 23:06:36');
INSERT OR IGNORE INTO 'vulnerability_imports'('id', 'filename', 'import_date', 'row_count', 'vendor', 'file_size', 'processing_time', 'raw_headers', 'created_at') VALUES (10, 'vulnerabilities-cisco-1.csv', '2025-09-20T23:10:46.019Z', 12073, 'cisco', 3129130, 10388, '["asset.display_ipv4_address","asset.id","asset.name","definition.cve","definition.family","definition.id","definition.name","definition.plugin_published","definition.plugin_updated","definition.vpr.score","id","resurfaced_date","severity","state"]', '2025-09-20 23:10:46');
INSERT OR IGNORE INTO 'vulnerability_imports'('id', 'filename', 'import_date', 'row_count', 'vendor', 'file_size', 'processing_time', 'raw_headers', 'created_at') VALUES (11, 'vulnerabilities-cisco.csv', '2025-09-20T23:14:47.708Z', 12222, 'cisco', 3168463, 9442, '["asset.display_ipv4_address","asset.id","asset.name","definition.cve","definition.family","definition.id","definition.name","definition.plugin_published","definition.plugin_updated","definition.vpr.score","id","resurfaced_date","severity","state"]', '2025-09-20 23:14:47');
INSERT OR IGNORE INTO 'vulnerability_imports'('id', 'filename', 'import_date', 'row_count', 'vendor', 'file_size', 'processing_time', 'raw_headers', 'created_at') VALUES (12, 'vulnerabilities-cisco.csv', '2025-09-20T23:15:37.358Z', 12222, 'cisco', 3168463, 7075, '["asset.display_ipv4_address","asset.id","asset.name","definition.cve","definition.family","definition.id","definition.name","definition.plugin_published","definition.plugin_updated","definition.vpr.score","id","resurfaced_date","severity","state"]', '2025-09-20 23:15:37');
INSERT OR IGNORE INTO 'vulnerability_imports'('id', 'filename', 'import_date', 'row_count', 'vendor', 'file_size', 'processing_time', 'raw_headers', 'created_at') VALUES (13, 'vulnerabilities-cisco-1.csv', '2025-09-20T23:17:49.449Z', 12073, 'cisco', 3129130, 8551, '["asset.display_ipv4_address","asset.id","asset.name","definition.cve","definition.family","definition.id","definition.name","definition.plugin_published","definition.plugin_updated","definition.vpr.score","id","resurfaced_date","severity","state"]', '2025-09-20 23:17:49');
INSERT OR IGNORE INTO 'vulnerability_imports'('id', 'filename', 'import_date', 'row_count', 'vendor', 'file_size', 'processing_time', 'raw_headers', 'created_at') VALUES (14, 'vulnerabilities-cisco.csv', '2025-09-23T14:10:14.152Z', 13374, 'cisco', 3613396, 16944, '["asset.display_ipv4_address","asset.id","asset.name","definition.cve","definition.family","definition.id","definition.name","definition.plugin_published","definition.plugin_updated","definition.vpr.score","id","resurfaced_date","severity","state"]', '2025-09-23 14:10:14');
INSERT OR IGNORE INTO 'vulnerability_imports'('id', 'filename', 'import_date', 'row_count', 'vendor', 'file_size', 'processing_time', 'raw_headers', 'created_at') VALUES (15, 'vulnerabilities-cisco.csv', '2025-09-23T16:32:37.544Z', 12222, 'cisco', 3168463, 8330, '["asset.display_ipv4_address","asset.id","asset.name","definition.cve","definition.family","definition.id","definition.name","definition.plugin_published","definition.plugin_updated","definition.vpr.score","id","resurfaced_date","severity","state"]', '2025-09-23 16:32:37');
INSERT OR IGNORE INTO 'vulnerability_imports'('id', 'filename', 'import_date', 'row_count', 'vendor', 'file_size', 'processing_time', 'raw_headers', 'created_at') VALUES (16, 'vulnerabilities-cisco-1.csv', '2025-09-23T16:33:04.403Z', 12073, 'cisco', 3129130, 9643, '["asset.display_ipv4_address","asset.id","asset.name","definition.cve","definition.family","definition.id","definition.name","definition.plugin_published","definition.plugin_updated","definition.vpr.score","id","resurfaced_date","severity","state"]', '2025-09-23 16:33:04');
INSERT OR IGNORE INTO 'vulnerability_imports'('id', 'filename', 'import_date', 'row_count', 'vendor', 'file_size', 'processing_time', 'raw_headers', 'created_at') VALUES (17, 'vulnerabilities-cisco.csv', '2025-09-23T16:34:00.420Z', 13374, 'cisco', 3613396, 17309, '["asset.display_ipv4_address","asset.id","asset.name","definition.cve","definition.family","definition.id","definition.name","definition.plugin_published","definition.plugin_updated","definition.vpr.score","id","resurfaced_date","severity","state"]', '2025-09-23 16:34:00');
INSERT OR IGNORE INTO 'vulnerability_imports'('id', 'filename', 'import_date', 'row_count', 'vendor', 'file_size', 'processing_time', 'raw_headers', 'created_at') VALUES (18, 'vulnerabilities-cisco.csv', '2025-09-23T16:51:12.891Z', 12222, 'cisco', 3168463, 9063, '["asset.display_ipv4_address","asset.id","asset.name","definition.cve","definition.family","definition.id","definition.name","definition.plugin_published","definition.plugin_updated","definition.vpr.score","id","resurfaced_date","severity","state"]', '2025-09-23 16:51:12');
INSERT OR IGNORE INTO 'vulnerability_imports'('id', 'filename', 'import_date', 'row_count', 'vendor', 'file_size', 'processing_time', 'raw_headers', 'created_at') VALUES (19, 'vulnerabilities-cisco-1.csv', '2025-09-23T16:53:29.015Z', 12073, 'cisco', 3129130, 13379, '["asset.display_ipv4_address","asset.id","asset.name","definition.cve","definition.family","definition.id","definition.name","definition.plugin_published","definition.plugin_updated","definition.vpr.score","id","resurfaced_date","severity","state"]', '2025-09-23 16:53:29');
INSERT OR IGNORE INTO 'vulnerability_imports'('id', 'filename', 'import_date', 'row_count', 'vendor', 'file_size', 'processing_time', 'raw_headers', 'created_at') VALUES (20, 'vulnerabilities-cisco.csv', '2025-09-23T17:01:40.388Z', 13374, 'cisco', 3613396, 19309, '["asset.display_ipv4_address","asset.id","asset.name","definition.cve","definition.family","definition.id","definition.name","definition.plugin_published","definition.plugin_updated","definition.vpr.score","id","resurfaced_date","severity","state"]', '2025-09-23 17:01:40');
INSERT OR IGNORE INTO 'vulnerability_imports'('id', 'filename', 'import_date', 'row_count', 'vendor', 'file_size', 'processing_time', 'raw_headers', 'created_at') VALUES (21, 'test-import-summary.csv', '2025-09-23T18:24:51.881Z', 5, 'tenable', 858, 1584, '["asset.name","asset.display_ipv4_address","definition.cve","definition.name","vulnerability.severity","definition.vpr.score","vulnerability.state","vulnerability.first_seen","vulnerability.last_seen","definition.id"]', '2025-09-23 18:24:51');
INSERT OR IGNORE INTO 'vulnerability_imports'('id', 'filename', 'import_date', 'row_count', 'vendor', 'file_size', 'processing_time', 'raw_headers', 'created_at') VALUES (22, 'vulnerabilities-cisco.csv', '2025-09-23T18:27:34.799Z', 12222, 'cisco', 3168463, 7348, '["asset.display_ipv4_address","asset.id","asset.name","definition.cve","definition.family","definition.id","definition.name","definition.plugin_published","definition.plugin_updated","definition.vpr.score","id","resurfaced_date","severity","state"]', '2025-09-23 18:27:34');
INSERT OR IGNORE INTO 'vulnerability_imports'('id', 'filename', 'import_date', 'row_count', 'vendor', 'file_size', 'processing_time', 'raw_headers', 'created_at') VALUES (23, 'vulnerabilities-cisco-1.csv', '2025-09-23T18:28:29.057Z', 12073, 'cisco', 3129130, 9829, '["asset.display_ipv4_address","asset.id","asset.name","definition.cve","definition.family","definition.id","definition.name","definition.plugin_published","definition.plugin_updated","definition.vpr.score","id","resurfaced_date","severity","state"]', '2025-09-23 18:28:29');
INSERT OR IGNORE INTO 'vulnerability_imports'('id', 'filename', 'import_date', 'row_count', 'vendor', 'file_size', 'processing_time', 'raw_headers', 'created_at') VALUES (24, 'vulnerabilities-cisco.csv', '2025-09-23T18:29:02.844Z', 13374, 'cisco', 3613396, 18665, '["asset.display_ipv4_address","asset.id","asset.name","definition.cve","definition.family","definition.id","definition.name","definition.plugin_published","definition.plugin_updated","definition.vpr.score","id","resurfaced_date","severity","state"]', '2025-09-23 18:29:02');
INSERT OR IGNORE INTO 'vulnerability_imports'('id', 'filename', 'import_date', 'row_count', 'vendor', 'file_size', 'processing_time', 'raw_headers', 'created_at') VALUES (25, 'vulnerabilities-cisco.csv', '2025-09-23T19:16:49.708Z', 12222, 'cisco', 3168463, 7275, '["asset.display_ipv4_address","asset.id","asset.name","definition.cve","definition.family","definition.id","definition.name","definition.plugin_published","definition.plugin_updated","definition.vpr.score","id","resurfaced_date","severity","state"]', '2025-09-23 19:16:49');
INSERT OR IGNORE INTO 'vulnerability_imports'('id', 'filename', 'import_date', 'row_count', 'vendor', 'file_size', 'processing_time', 'raw_headers', 'created_at') VALUES (26, 'vulnerabilities-cisco-1.csv', '2025-09-23T19:18:28.931Z', 12073, 'cisco', 3129130, 9037, '["asset.display_ipv4_address","asset.id","asset.name","definition.cve","definition.family","definition.id","definition.name","definition.plugin_published","definition.plugin_updated","definition.vpr.score","id","resurfaced_date","severity","state"]', '2025-09-23 19:18:28');
INSERT OR IGNORE INTO 'vulnerability_imports'('id', 'filename', 'import_date', 'row_count', 'vendor', 'file_size', 'processing_time', 'raw_headers', 'created_at') VALUES (27, 'vulnerabilities-cisco.csv', '2025-09-23T19:25:13.495Z', 13374, 'cisco', 3613396, 17223, '["asset.display_ipv4_address","asset.id","asset.name","definition.cve","definition.family","definition.id","definition.name","definition.plugin_published","definition.plugin_updated","definition.vpr.score","id","resurfaced_date","severity","state"]', '2025-09-23 19:25:13');
INSERT OR IGNORE INTO 'vulnerability_imports'('id', 'filename', 'import_date', 'row_count', 'vendor', 'file_size', 'processing_time', 'raw_headers', 'created_at') VALUES (28, 'vulnerabilities-cisco.csv', '2025-09-23T19:58:31.533Z', 12222, 'cisco', 3168463, 8303, '["asset.display_ipv4_address","asset.id","asset.name","definition.cve","definition.family","definition.id","definition.name","definition.plugin_published","definition.plugin_updated","definition.vpr.score","id","resurfaced_date","severity","state"]', '2025-09-23 19:58:31');
INSERT OR IGNORE INTO 'vulnerability_imports'('id', 'filename', 'import_date', 'row_count', 'vendor', 'file_size', 'processing_time', 'raw_headers', 'created_at') VALUES (29, 'vulnerabilities-cisco-1.csv', '2025-09-23T19:59:08.897Z', 12073, 'cisco', 3129130, 10004, '["asset.display_ipv4_address","asset.id","asset.name","definition.cve","definition.family","definition.id","definition.name","definition.plugin_published","definition.plugin_updated","definition.vpr.score","id","resurfaced_date","severity","state"]', '2025-09-23 19:59:08');
INSERT OR IGNORE INTO 'vulnerability_imports'('id', 'filename', 'import_date', 'row_count', 'vendor', 'file_size', 'processing_time', 'raw_headers', 'created_at') VALUES (30, 'vulnerabilities-cisco.csv', '2025-09-23T20:00:26.286Z', 13374, 'cisco', 3613396, 19646, '["asset.display_ipv4_address","asset.id","asset.name","definition.cve","definition.family","definition.id","definition.name","definition.plugin_published","definition.plugin_updated","definition.vpr.score","id","resurfaced_date","severity","state"]', '2025-09-23 20:00:26');
INSERT OR IGNORE INTO 'vulnerability_imports'('id', 'filen