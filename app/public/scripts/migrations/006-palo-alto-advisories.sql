-- ========================================
-- HEX-209: Palo Alto Advisory Sync
-- Migration 006: Palo Alto Networks Advisory Infrastructure
-- Version: 1.0.63
-- Date: 2025-10-13
-- ========================================

-- This migration adds Palo Alto Networks advisory tracking infrastructure,
-- mirroring the Cisco PSIRT implementation pattern from migration 005.
--
-- ARCHITECTURE PATTERN: Multi-vendor advisory system
-- - Separate advisory table per vendor (palo_alto_advisories)
-- - Denormalized display columns in vulnerabilities table
-- - Vendor-neutral boolean (is_fixed) already exists
-- - Same caching and sync patterns as Cisco

-- ========================================
-- PALO ALTO ADVISORIES TABLE
-- ========================================
-- Stores rich metadata from Palo Alto Security Advisory API responses
-- Pattern: Mirrors cisco_advisories table structure
-- API: https://security.paloaltonetworks.com/json/{CVE-ID}

CREATE TABLE IF NOT EXISTS palo_alto_advisories (
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

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_palo_advisories_cve
    ON palo_alto_advisories(cve_id);

CREATE INDEX IF NOT EXISTS idx_palo_advisories_synced
    ON palo_alto_advisories(last_synced);

-- ========================================
-- VULNERABILITIES TABLE EXTENSIONS
-- ========================================
-- Add Palo Alto fixed version tracking columns
-- Pattern: Same as Cisco columns from migration 005

-- Note: is_fixed column already exists (vendor-neutral, added in migration 005)

-- Palo Alto-specific columns
ALTER TABLE vulnerabilities ADD COLUMN fixed_palo_versions TEXT;    -- Display string: "10.2.0-h3, 10.2.1-h2, 11.0.0"
ALTER TABLE vulnerabilities ADD COLUMN fixed_palo_url TEXT;         -- Link to Palo Alto advisory
ALTER TABLE vulnerabilities ADD COLUMN palo_synced_at DATETIME;     -- Last time Palo Alto data was synced for this CVE

-- ========================================
-- SYNC METADATA
-- ========================================
-- Track Palo Alto advisory sync history in existing sync_metadata table
-- (Table already exists from KEV/Cisco implementations, reusing same structure)
--
-- Example sync_metadata row after Palo Alto sync:
-- {
--   sync_type: 'palo_alto',
--   sync_time: '2025-10-13T14:00:00.000Z',
--   version: null,  -- Palo Alto doesn't have catalog version like KEV
--   record_count: 250,
--   status: 'completed',
--   error_message: null
-- }

-- No schema changes needed - sync_metadata already supports multiple sync types

-- ========================================
-- MIGRATION VERIFICATION QUERIES
-- ========================================
-- Run these after migration to verify schema:
--
-- 1. Check palo_alto_advisories table exists:
--    SELECT name FROM sqlite_master WHERE type='table' AND name='palo_alto_advisories';
--
-- 2. Check vulnerabilities new columns:
--    PRAGMA table_info(vulnerabilities);
--
-- 3. Check indexes created:
--    SELECT name FROM sqlite_master WHERE type='index'
--    AND name LIKE 'idx_palo%';
--
-- 4. Verify empty table ready for data:
--    SELECT COUNT(*) FROM palo_alto_advisories;  -- Should be 0

-- ========================================
-- ROLLBACK INSTRUCTIONS (Emergency Only)
-- ========================================
-- WARNING: These commands will DELETE data if sync has occurred
--
-- DROP TABLE IF EXISTS palo_alto_advisories;
--
-- ALTER TABLE vulnerabilities DROP COLUMN fixed_palo_versions;
-- ALTER TABLE vulnerabilities DROP COLUMN fixed_palo_url;
-- ALTER TABLE vulnerabilities DROP COLUMN palo_synced_at;
--
-- DROP INDEX IF EXISTS idx_palo_advisories_cve;
-- DROP INDEX IF EXISTS idx_palo_advisories_synced;

-- ========================================
-- END MIGRATION 006
-- ========================================
