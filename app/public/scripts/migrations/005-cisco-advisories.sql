-- ========================================
-- HEX-141: Cisco PSIRT Advisory Sync
-- Migration 005: Multi-Vendor Advisory Infrastructure
-- Version: 1.0.63
-- Date: 2025-10-11
-- ========================================

-- This migration creates the infrastructure for multi-vendor
-- fixed software version tracking, starting with Cisco PSIRT API.
--
-- ARCHITECTURE PATTERN: Mirrors KEV implementation
-- - Separate advisory table for rich metadata
-- - Denormalized display columns in vulnerabilities table
-- - Vendor-neutral boolean + vendor-specific columns
-- - Future-proof for Palo Alto, Fortinet, etc.

-- ========================================
-- CISCO ADVISORIES TABLE
-- ========================================
-- Stores rich metadata from Cisco PSIRT API responses
-- Pattern: Mirror kev_status table structure

CREATE TABLE IF NOT EXISTS cisco_advisories (
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

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_cisco_advisories_cve
    ON cisco_advisories(cve_id);

CREATE INDEX IF NOT EXISTS idx_cisco_advisories_synced
    ON cisco_advisories(last_synced);

-- ========================================
-- VULNERABILITIES TABLE EXTENSIONS
-- ========================================
-- Add multi-vendor fixed version tracking columns
-- Pattern: Vendor-neutral boolean + vendor-specific display columns

-- Vendor-neutral column (indicates ANY vendor has a fix)
ALTER TABLE vulnerabilities ADD COLUMN is_fixed INTEGER DEFAULT 0;

-- Cisco-specific columns
ALTER TABLE vulnerabilities ADD COLUMN fixed_cisco_versions TEXT;    -- Display string: "15.2(4)M11, 16.3.1, 17.1.1"
ALTER TABLE vulnerabilities ADD COLUMN fixed_cisco_url TEXT;         -- Link to Cisco advisory
ALTER TABLE vulnerabilities ADD COLUMN cisco_synced_at DATETIME;     -- Last time Cisco data was synced for this CVE

-- Future vendor columns (add as needed without schema redesign):
-- ALTER TABLE vulnerabilities ADD COLUMN fixed_palo_versions TEXT;
-- ALTER TABLE vulnerabilities ADD COLUMN fixed_palo_url TEXT;
-- ALTER TABLE vulnerabilities ADD COLUMN palo_synced_at DATETIME;
--
-- ALTER TABLE vulnerabilities ADD COLUMN fixed_fortinet_versions TEXT;
-- ALTER TABLE vulnerabilities ADD COLUMN fixed_fortinet_url TEXT;
-- ALTER TABLE vulnerabilities ADD COLUMN fortinet_synced_at DATETIME;

-- Index for filtering vulnerabilities with fixes
CREATE INDEX IF NOT EXISTS idx_vulnerabilities_is_fixed
    ON vulnerabilities(is_fixed)
    WHERE is_fixed = 1;

-- ========================================
-- SYNC METADATA
-- ========================================
-- Track Cisco advisory sync history in existing sync_metadata table
-- (Table already exists from KEV implementation, reusing same structure)
--
-- Example sync_metadata row after Cisco sync:
-- {
--   sync_type: 'cisco',
--   sync_time: '2025-10-11T20:30:00.000Z',
--   version: null,  -- Cisco doesn't have catalog version like KEV
--   record_count: 1234,
--   status: 'completed',
--   error_message: null
-- }

-- No schema changes needed - sync_metadata already supports multiple sync types

-- ========================================
-- MIGRATION VERIFICATION QUERIES
-- ========================================
-- Run these after migration to verify schema:
--
-- 1. Check cisco_advisories table exists:
--    SELECT name FROM sqlite_master WHERE type='table' AND name='cisco_advisories';
--
-- 2. Check vulnerabilities new columns:
--    PRAGMA table_info(vulnerabilities);
--
-- 3. Check indexes created:
--    SELECT name FROM sqlite_master WHERE type='index'
--    AND (name LIKE 'idx_cisco%' OR name LIKE '%is_fixed%');
--
-- 4. Verify empty tables ready for data:
--    SELECT COUNT(*) FROM cisco_advisories;  -- Should be 0

-- ========================================
-- ROLLBACK INSTRUCTIONS (Emergency Only)
-- ========================================
-- WARNING: These commands will DELETE data if sync has occurred
--
-- DROP TABLE IF EXISTS cisco_advisories;
--
-- ALTER TABLE vulnerabilities DROP COLUMN is_fixed;
-- ALTER TABLE vulnerabilities DROP COLUMN fixed_cisco_versions;
-- ALTER TABLE vulnerabilities DROP COLUMN fixed_cisco_url;
-- ALTER TABLE vulnerabilities DROP COLUMN cisco_synced_at;
--
-- DROP INDEX IF EXISTS idx_cisco_advisories_cve;
-- DROP INDEX IF EXISTS idx_cisco_advisories_synced;
-- DROP INDEX IF EXISTS idx_vulnerabilities_is_fixed;

-- ========================================
-- END MIGRATION 005
-- ========================================
