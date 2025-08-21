-- Initialize HexTrackr SQLite Database
-- This script creates all necessary tables for the vulnerability tracking system

-- Drop existing tables if they exist (for clean setup)
DROP TABLE IF EXISTS vulnerability_history;
DROP TABLE IF EXISTS ticket_vulnerabilities;
DROP TABLE IF EXISTS vulnerabilities;
DROP TABLE IF EXISTS tickets;
DROP TABLE IF EXISTS assets;
DROP TABLE IF EXISTS users;

-- Create users table for authentication
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT DEFAULT 'user', -- 'admin', 'user', 'readonly'
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Create assets table
CREATE TABLE assets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    hostname TEXT UNIQUE NOT NULL,
    ip_address TEXT,
    vendor TEXT,
    operating_system TEXT,
    risk_level TEXT DEFAULT 'medium', -- 'critical', 'high', 'medium', 'low', 'info'
    business_criticality TEXT DEFAULT 'normal', -- 'critical', 'high', 'normal', 'low'
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Create vulnerabilities table
CREATE TABLE vulnerabilities (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    asset_id INTEGER NOT NULL,
    cve_id TEXT,
    definition_id TEXT,
    definition_name TEXT NOT NULL,
    severity TEXT NOT NULL, -- 'critical', 'high', 'medium', 'low', 'info'
    vpr_score REAL DEFAULT 0.0,
    cvss_score REAL DEFAULT 0.0,
    description TEXT,
    solution TEXT,
    exploit_available BOOLEAN DEFAULT FALSE,
    patch_available BOOLEAN DEFAULT FALSE,
    first_seen DATETIME DEFAULT CURRENT_TIMESTAMP,
    last_seen DATETIME DEFAULT CURRENT_TIMESTAMP,
    status TEXT DEFAULT 'open', -- 'open', 'patched', 'mitigated', 'accepted', 'false_positive'
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (asset_id) REFERENCES assets (id) ON DELETE CASCADE
);

-- Create tickets table
CREATE TABLE tickets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ticket_number TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    priority TEXT DEFAULT 'medium', -- 'critical', 'high', 'medium', 'low'
    status TEXT DEFAULT 'open', -- 'open', 'in_progress', 'resolved', 'closed', 'cancelled'
    assignee TEXT,
    asset_id INTEGER,
    risk_score INTEGER DEFAULT 0,
    snow_number TEXT, -- ServiceNow ticket number if integrated
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    resolved_at DATETIME,
    FOREIGN KEY (asset_id) REFERENCES assets (id) ON DELETE SET NULL
);

-- Create junction table for tickets and vulnerabilities (many-to-many)
CREATE TABLE ticket_vulnerabilities (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ticket_id INTEGER NOT NULL,
    vulnerability_id INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (ticket_id) REFERENCES tickets (id) ON DELETE CASCADE,
    FOREIGN KEY (vulnerability_id) REFERENCES vulnerabilities (id) ON DELETE CASCADE,
    UNIQUE(ticket_id, vulnerability_id)
);

-- Create vulnerability history table for tracking changes
CREATE TABLE vulnerability_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    vulnerability_id INTEGER NOT NULL,
    field_name TEXT NOT NULL,
    old_value TEXT,
    new_value TEXT,
    changed_by TEXT,
    changed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (vulnerability_id) REFERENCES vulnerabilities (id) ON DELETE CASCADE
);

-- Create indexes for better performance
CREATE INDEX idx_assets_hostname ON assets(hostname);
CREATE INDEX idx_assets_ip_address ON assets(ip_address);
CREATE INDEX idx_vulnerabilities_asset_id ON vulnerabilities(asset_id);
CREATE INDEX idx_vulnerabilities_cve_id ON vulnerabilities(cve_id);
CREATE INDEX idx_vulnerabilities_severity ON vulnerabilities(severity);
CREATE INDEX idx_vulnerabilities_status ON vulnerabilities(status);
CREATE INDEX idx_tickets_status ON tickets(status);
CREATE INDEX idx_tickets_priority ON tickets(priority);
CREATE INDEX idx_tickets_snow_number ON tickets(snow_number);
CREATE INDEX idx_vulnerability_history_vulnerability_id ON vulnerability_history(vulnerability_id);

-- Insert default admin user (password: admin123)
INSERT INTO users (username, email, password_hash, role) VALUES 
('admin', 'admin@hextrackr.local', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin');

-- Insert sample assets for testing
INSERT INTO assets (hostname, ip_address, vendor, operating_system, risk_level, business_criticality, notes) VALUES 
('db-server-01', '192.168.1.20', 'MySQL', 'Ubuntu 20.04', 'high', 'critical', 'Primary database server'),
('web-server-01', '192.168.1.30', 'Apache', 'CentOS 8', 'medium', 'high', 'Main web application server'),
('file-server-01', '192.168.1.40', 'Samba', 'Windows Server 2019', 'medium', 'normal', 'File sharing server'),
('router-01', '192.168.1.1', 'Cisco', 'IOS XE', 'high', 'critical', 'Core network router'),
('switch-01', '192.168.1.2', 'Cisco', 'IOS', 'medium', 'high', 'Main network switch');

-- Add some sample vulnerabilities
INSERT INTO vulnerabilities (asset_id, cve_id, definition_id, definition_name, severity, vpr_score, cvss_score, description, exploit_available, patch_available, status) VALUES 
(1, 'CVE-2023-1234', 'DEF-001', 'MySQL Remote Code Execution', 'critical', 9.2, 9.8, 'Remote code execution vulnerability in MySQL server', TRUE, TRUE, 'open'),
(1, 'CVE-2023-5678', 'DEF-002', 'Ubuntu Privilege Escalation', 'high', 7.8, 7.4, 'Local privilege escalation in Ubuntu kernel', FALSE, TRUE, 'open'),
(2, 'CVE-2023-9012', 'DEF-003', 'Apache HTTP Server Buffer Overflow', 'high', 8.1, 8.6, 'Buffer overflow in Apache HTTP server', TRUE, TRUE, 'open'),
(4, 'CVE-2023-3456', 'DEF-004', 'Cisco IOS XE Command Injection', 'critical', 9.8, 9.9, 'Command injection vulnerability in Cisco IOS XE', TRUE, TRUE, 'open'),
(5, 'CVE-2023-7890', 'DEF-005', 'Cisco IOS Denial of Service', 'medium', 5.3, 6.2, 'DoS vulnerability in Cisco IOS', FALSE, TRUE, 'open');

-- Add sample tickets
INSERT INTO tickets (ticket_number, title, description, priority, status, assignee, asset_id, risk_score, snow_number) VALUES 
('TKT-001', 'Critical MySQL Vulnerabilities', 'Address critical vulnerabilities on database server', 'critical', 'open', 'john.doe', 1, 95, 'INC0001234'),
('TKT-002', 'Apache Server Security Update', 'Update Apache server to latest version', 'high', 'in_progress', 'jane.smith', 2, 75, NULL),
('TKT-003', 'Cisco Router Security Patch', 'Apply security patches to core router', 'critical', 'open', '', 4, 98, 'INC0001235');

-- Link vulnerabilities to tickets
INSERT INTO ticket_vulnerabilities (ticket_id, vulnerability_id) VALUES 
(1, 1), (1, 2), -- MySQL ticket covers both MySQL and Ubuntu vulns
(2, 3), -- Apache ticket
(3, 4); -- Cisco router ticket

PRAGMA user_version = 1;
