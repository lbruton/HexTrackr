-- ================================================================
-- CISA KEV Integration Database Schema
-- HexTrackr Vulnerability Management System
--
-- Purpose: Store Known Exploited Vulnerabilities (KEV) metadata
-- Source: https://www.cisa.gov/sites/default/files/feeds/known_exploited_vulnerabilities.json
-- Updated: 2025-09-21
-- ================================================================

-- ================================================================
-- Table Creation
-- ================================================================

-- Main KEV status table to store CISA Known Exploited Vulnerabilities
-- Normalized design separate from main vulnerabilities table for:
-- - Performance optimization (smaller joins)
-- - Data integrity (KEV-specific metadata)
-- - Future extensibility (easy to add KEV fields)
-- - Independent maintenance (KEV updates don't affect core data)
CREATE TABLE IF NOT EXISTS kev_status (
    -- Primary identifier - matches CVE ID from vulnerabilities table
    cve_id TEXT PRIMARY KEY,

    -- CISA KEV catalog fields (from JSON response)
    date_added DATE NOT NULL,                    -- When CISA added to KEV catalog
    vulnerability_name TEXT,                     -- CISA's descriptive name
    vendor_project TEXT,                         -- Affected vendor/project
    product TEXT,                               -- Specific product affected
    required_action TEXT,                       -- CISA recommended action
    due_date DATE,                              -- Federal remediation deadline
    known_ransomware_use BOOLEAN DEFAULT FALSE, -- Used in ransomware campaigns
    notes TEXT,                                 -- Additional CISA context
    short_description TEXT,                     -- Brief vulnerability description

    -- Metadata for sync management
    catalog_version TEXT,                       -- CISA catalog version when added
    cisa_date_released TIMESTAMP,              -- When CISA released this version

    -- HexTrackr tracking fields
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    -- Foreign key relationship to main vulnerabilities table
    FOREIGN KEY (cve_id) REFERENCES vulnerabilities(cve_id) ON DELETE CASCADE
);

-- ================================================================
-- Performance Indexes
-- ================================================================

-- Primary lookup index for KEV status checks
-- Most common query: "Is this CVE a KEV?"
CREATE INDEX IF NOT EXISTS idx_kev_status_cve_id ON kev_status(cve_id);

-- Date-based queries for recent KEV additions
-- Used for: "Show vulnerabilities added to KEV in last 30 days"
CREATE INDEX IF NOT EXISTS idx_kev_status_date_added ON kev_status(date_added);

-- Due date index for compliance tracking
-- Used for: "Show KEV vulnerabilities with approaching deadlines"
CREATE INDEX IF NOT EXISTS idx_kev_status_due_date ON kev_status(due_date);

-- Ransomware use index for threat intelligence
-- Used for: "Show KEV vulnerabilities used in ransomware"
CREATE INDEX IF NOT EXISTS idx_kev_status_ransomware ON kev_status(known_ransomware_use);

-- Vendor/product index for asset-specific queries
-- Used for: "Show KEV vulnerabilities affecting Microsoft products"
CREATE INDEX IF NOT EXISTS idx_kev_status_vendor_product ON kev_status(vendor_project, product);

-- Catalog version index for sync operations
-- Used for: "Find entries from specific catalog versions"
CREATE INDEX IF NOT EXISTS idx_kev_status_catalog_version ON kev_status(catalog_version);

-- ================================================================
-- Sync Management Table
-- ================================================================

-- Track KEV catalog sync operations for monitoring and troubleshooting
CREATE TABLE IF NOT EXISTS kev_sync_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    sync_started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    sync_completed_at TIMESTAMP,

    -- CISA catalog information
    catalog_version TEXT,
    cisa_date_released TIMESTAMP,
    total_kevs_in_catalog INTEGER,

    -- Sync operation results
    kevs_added INTEGER DEFAULT 0,
    kevs_updated INTEGER DEFAULT 0,
    kevs_removed INTEGER DEFAULT 0,
    kevs_matched INTEGER DEFAULT 0,
    kevs_unmatched INTEGER DEFAULT 0,

    -- Operation status
    sync_status TEXT DEFAULT 'running', -- 'running', 'completed', 'failed'
    error_message TEXT,
    duration_ms INTEGER,

    -- Performance metrics
    api_response_time_ms INTEGER,
    database_operation_time_ms INTEGER,

    -- Additional metadata
    triggered_by TEXT DEFAULT 'scheduled', -- 'scheduled', 'manual', 'startup'
    user_agent TEXT DEFAULT 'HexTrackr-KEV-Sync/1.0'
);

-- Index for sync log queries
CREATE INDEX IF NOT EXISTS idx_kev_sync_log_started ON kev_sync_log(sync_started_at);
CREATE INDEX IF NOT EXISTS idx_kev_sync_log_status ON kev_sync_log(sync_status);

-- ================================================================
-- Data Views for Common Queries
-- ================================================================

-- View combining vulnerability data with KEV status
-- Optimized for vulnerability table display with KEV indicators
CREATE VIEW IF NOT EXISTS vulnerabilities_with_kev AS
SELECT
    v.*,
    k.cve_id IS NOT NULL AS is_kev,
    k.date_added AS kev_date_added,
    k.due_date AS kev_due_date,
    k.known_ransomware_use,
    k.required_action AS kev_required_action,
    k.vulnerability_name AS kev_name,
    -- Calculate days until KEV due date
    CASE
        WHEN k.due_date IS NOT NULL
        THEN julianday(k.due_date) - julianday('now')
        ELSE NULL
    END AS days_until_kev_due
FROM vulnerabilities v
LEFT JOIN kev_status k ON v.cve_id = k.cve_id;

-- View for KEV statistics dashboard
-- Pre-calculated metrics for performance
CREATE VIEW IF NOT EXISTS kev_statistics AS
SELECT
    COUNT(*) AS total_kevs,
    COUNT(CASE WHEN known_ransomware_use = 1 THEN 1 END) AS ransomware_kevs,
    COUNT(CASE WHEN due_date < date('now') THEN 1 END) AS overdue_kevs,
    COUNT(CASE WHEN due_date BETWEEN date('now') AND date('now', '+7 days') THEN 1 END) AS due_soon_kevs,
    COUNT(CASE WHEN date_added > date('now', '-30 days') THEN 1 END) AS recent_kevs,
    MIN(date_added) AS oldest_kev_date,
    MAX(date_added) AS newest_kev_date
FROM kev_status;

-- ================================================================
-- Sample Data for Testing
-- ================================================================

-- Sample KEV entries for development and testing
-- Note: These are fictional examples for testing purposes
INSERT OR IGNORE INTO kev_status (
    cve_id, date_added, vulnerability_name, vendor_project, product,
    required_action, due_date, known_ransomware_use, notes,
    catalog_version, short_description
) VALUES
    ('CVE-2024-0001', '2024-01-15', 'Sample Buffer Overflow', 'Sample Vendor', 'Sample Product',
     'Apply security update', '2024-02-14', 0, 'Testing entry',
     '2024.01.15', 'Sample vulnerability for testing KEV functionality'),

    ('CVE-2024-0002', '2024-02-01', 'Sample RCE Vulnerability', 'Another Vendor', 'Web Server',
     'Apply patches immediately', '2024-03-01', 1, 'High priority - ransomware use',
     '2024.02.01', 'Remote code execution used in ransomware campaigns'),

    ('CVE-2024-0003', '2024-03-15', 'Sample Authentication Bypass', 'Security Corp', 'Auth System',
     'Update to latest version', '2024-04-14', 0, 'Standard remediation',
     '2024.03.15', 'Authentication bypass in enterprise software');

-- ================================================================
-- Migration Scripts
-- ================================================================

-- Forward migration (create tables)
-- Run this to add KEV support to existing HexTrackr installation
--
-- Usage: sqlite3 data/hextrackr.db < planning/kev-database-schema.sql

-- Backward migration (rollback)
-- Uncomment the following lines to remove KEV tables
-- WARNING: This will delete all KEV data permanently!
--
-- DROP VIEW IF EXISTS kev_statistics;
-- DROP VIEW IF EXISTS vulnerabilities_with_kev;
-- DROP TABLE IF EXISTS kev_sync_log;
-- DROP TABLE IF EXISTS kev_status;

-- ================================================================
-- Data Integrity Checks
-- ================================================================

-- Check for orphaned KEV entries (KEVs without corresponding vulnerabilities)
-- Should return 0 rows in a healthy database
-- SELECT k.cve_id FROM kev_status k
-- LEFT JOIN vulnerabilities v ON k.cve_id = v.cve_id
-- WHERE v.cve_id IS NULL;

-- Check for duplicate KEV entries
-- Should return 0 rows (enforced by PRIMARY KEY)
-- SELECT cve_id, COUNT(*) as count FROM kev_status
-- GROUP BY cve_id HAVING COUNT(*) > 1;

-- Validate date consistency
-- Should return 0 rows (due_date should be after date_added)
-- SELECT cve_id FROM kev_status
-- WHERE due_date < date_added;

-- ================================================================
-- Performance Testing Queries
-- ================================================================

-- Test KEV lookup performance (should be <50ms)
-- EXPLAIN QUERY PLAN SELECT * FROM kev_status WHERE cve_id = 'CVE-2024-0001';

-- Test vulnerability table with KEV join performance
-- EXPLAIN QUERY PLAN SELECT * FROM vulnerabilities_with_kev LIMIT 100;

-- Test KEV filtering performance (should use index)
-- EXPLAIN QUERY PLAN SELECT * FROM vulnerabilities_with_kev WHERE is_kev = 1;

-- ================================================================
-- Maintenance Queries
-- ================================================================

-- Clean up old sync logs (keep last 30 days)
-- DELETE FROM kev_sync_log
-- WHERE sync_started_at < datetime('now', '-30 days');

-- Update KEV table statistics (for SQLite query optimizer)
-- ANALYZE kev_status;
-- ANALYZE vulnerabilities_with_kev;

-- Vacuum after large KEV data changes
-- VACUUM;

-- ================================================================
-- Security Considerations
-- ================================================================

-- 1. Input Validation: All KEV data from CISA API should be sanitized
-- 2. Parameterized Queries: Use prepared statements for all user inputs
-- 3. Access Control: KEV sync operations should require admin privileges
-- 4. Audit Trail: All KEV changes are logged in kev_sync_log table
-- 5. Data Integrity: Foreign key constraints prevent orphaned records

-- ================================================================
-- Monitoring Queries
-- ================================================================

-- Check sync health (last successful sync)
-- SELECT MAX(sync_completed_at) as last_sync,
--        (julianday('now') - julianday(MAX(sync_completed_at))) * 24 as hours_since_sync
-- FROM kev_sync_log
-- WHERE sync_status = 'completed';

-- KEV coverage statistics
-- SELECT
--     (SELECT COUNT(*) FROM kev_status) as total_kevs,
--     (SELECT COUNT(*) FROM vulnerabilities) as total_vulns,
--     ROUND(
--         (SELECT COUNT(*) FROM kev_status) * 100.0 /
--         (SELECT COUNT(*) FROM vulnerabilities), 2
--     ) as kev_percentage;

-- Recent KEV additions trend
-- SELECT date_added, COUNT(*) as kevs_added
-- FROM kev_status
-- WHERE date_added > date('now', '-30 days')
-- GROUP BY date_added
-- ORDER BY date_added DESC;

-- ================================================================
-- Documentation Links
-- ================================================================

-- CISA KEV Catalog: https://www.cisa.gov/known-exploited-vulnerabilities-catalog
-- JSON Feed: https://www.cisa.gov/sites/default/files/feeds/known_exploited_vulnerabilities.json
-- CSV Feed: https://www.cisa.gov/sites/default/files/feeds/known_exploited_vulnerabilities.csv
-- Schema Documentation: https://github.com/cisagov/kev-data

-- ================================================================
-- Schema Version Information
-- ================================================================

-- Schema Version: 1.0.0
-- Created: 2025-09-21
-- Compatible with: HexTrackr v1.0.20+
-- SQLite Version: 3.31.0+
-- Estimated Size: ~50KB for 1,200 KEV entries
-- Performance Target: <50ms for KEV status lookups