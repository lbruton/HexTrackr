# HexTrackr Database Schema
# This file creates the database structure without any sensitive data
# Safe for open source distribution

BEGIN TRANSACTION;

-- Tickets table
CREATE TABLE IF NOT EXISTS tickets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'open',
    priority TEXT DEFAULT 'medium',
    assigned_to TEXT,
    created_by TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    due_date DATETIME,
    tags TEXT,
    estimated_hours REAL,
    actual_hours REAL
);

-- Vulnerabilities table
CREATE TABLE IF NOT EXISTS vulnerabilities (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    cve_id TEXT,
    title TEXT NOT NULL,
    description TEXT,
    severity TEXT DEFAULT 'medium',
    cvss_score REAL,
    affected_systems TEXT,
    status TEXT DEFAULT 'open',
    discovered_date DATETIME,
    patched_date DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    remediation_notes TEXT,
    external_references TEXT
);

-- Sample data for development/testing (non-sensitive)
INSERT OR IGNORE INTO tickets (id, title, description, status, priority, created_by) VALUES 
(1, 'Sample Ticket - Setup Documentation', 'This is a sample ticket for testing purposes', 'open', 'low', 'system'),
(2, 'Sample Ticket - UI Testing', 'Another sample ticket for demo purposes', 'closed', 'medium', 'system');

INSERT OR IGNORE INTO vulnerabilities (id, cve_id, title, description, severity, cvss_score, status) VALUES 
(1, 'CVE-2023-SAMPLE', 'Sample Vulnerability Entry', 'This is a sample vulnerability for testing purposes', 'low', 3.1, 'closed'),
(2, 'CVE-2023-DEMO', 'Demo Vulnerability Entry', 'Another sample vulnerability for demo purposes', 'medium', 5.4, 'open');

COMMIT;
