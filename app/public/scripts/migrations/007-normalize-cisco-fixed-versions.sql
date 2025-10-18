-- ========================================
-- HEX-287: Normalize Cisco Fixed Versions Schema
-- Migration 007: Fix Data Corruption from Multi-OS-Family CVEs
-- Version: 1.0.79
-- Date: 2025-10-18
-- ========================================

-- This migration fixes the critical bug where Cisco advisory data
-- gets overwritten when a CVE affects multiple OS families (IOS + IOS XE).
--
-- ROOT CAUSE: One-to-many relationship (CVE → multiple OS family fixes)
-- was stored in denormalized JSON array, causing INSERT OR REPLACE to
-- overwrite previous OS family data.
--
-- SOLUTION: Normalize schema with separate table for fixed versions,
-- one row per (CVE, OS family, version) tuple.
--
-- ARCHITECTURE PATTERN: Third Normal Form (3NF)
-- - cisco_advisories: One row per CVE (metadata)
-- - cisco_fixed_versions: Multiple rows per CVE (OS-specific fixes)

-- ========================================
-- CISCO FIXED VERSIONS TABLE (Normalized)
-- ========================================

CREATE TABLE IF NOT EXISTS cisco_fixed_versions (
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

-- ========================================
-- INDEXES FOR PERFORMANCE
-- ========================================

-- Lookup by CVE (most common query)
CREATE INDEX IF NOT EXISTS idx_fixed_versions_cve
    ON cisco_fixed_versions(cve_id);

-- Filter by OS family
CREATE INDEX IF NOT EXISTS idx_fixed_versions_os_family
    ON cisco_fixed_versions(os_family);

-- Composite index for frontend queries: WHERE cve_id = ? AND os_family = ?
CREATE INDEX IF NOT EXISTS idx_fixed_versions_lookup
    ON cisco_fixed_versions(cve_id, os_family);

-- ========================================
-- MIGRATE EXISTING DATA (Best-Effort)
-- ========================================

-- Extract existing JSON arrays into normalized rows
-- NOTE: We can't determine OS family from JSON, so we'll:
-- 1. Insert all existing versions with os_family = 'unknown'
-- 2. Re-sync will populate correct OS families
-- 3. This prevents total data loss during migration

INSERT OR IGNORE INTO cisco_fixed_versions (cve_id, os_family, fixed_version, last_synced)
SELECT
    ca.cve_id,
    'unknown' as os_family,  -- Will be corrected on next sync
    json_each.value as fixed_version,
    ca.last_synced
FROM cisco_advisories ca,
     json_each(ca.first_fixed)
WHERE ca.first_fixed IS NOT NULL
  AND ca.first_fixed != '[]'
  AND ca.first_fixed != 'null';

-- ========================================
-- KEEP OLD COLUMNS (Temporary Rollback Safety)
-- ========================================

-- DO NOT drop first_fixed, affected_releases, product_names yet
-- Keep them for 1-2 releases in case we need to rollback
-- Will be removed in Migration 008 after validation

-- ========================================
-- VERIFICATION QUERIES
-- ========================================

-- Run these after migration to verify schema:
--
-- 1. Check cisco_fixed_versions table exists:
--    SELECT name FROM sqlite_master WHERE type='table' AND name='cisco_fixed_versions';
--
-- 2. Count migrated versions:
--    SELECT COUNT(*) FROM cisco_fixed_versions;
--
-- 3. Sample migrated data:
--    SELECT * FROM cisco_fixed_versions LIMIT 10;
--
-- 4. Check indexes created:
--    SELECT name FROM sqlite_master WHERE type='index'
--    AND name LIKE 'idx_fixed_versions%';
--
-- 5. Verify foreign key constraint:
--    PRAGMA foreign_key_check(cisco_fixed_versions);

-- ========================================
-- EXPECTED BEHAVIOR AFTER MIGRATION
-- ========================================

-- BEFORE (Broken):
--   CVE-2025-20352 | first_fixed: ["17.12.6"]  ← Only IOS XE
--
-- AFTER (Fixed):
--   cisco_fixed_versions:
--     CVE-2025-20352 | ios    | 15.2(8)E8
--     CVE-2025-20352 | ios    | 15.2(9)E
--     CVE-2025-20352 | iosxe  | 17.12.6
--     CVE-2025-20352 | iosxe  | 17.13.1

-- ========================================
-- ROLLBACK INSTRUCTIONS (Emergency Only)
-- ========================================

-- WARNING: This will DELETE normalized data
--
-- DROP TABLE IF EXISTS cisco_fixed_versions;
-- DROP INDEX IF EXISTS idx_fixed_versions_cve;
-- DROP INDEX IF EXISTS idx_fixed_versions_os_family;
-- DROP INDEX IF EXISTS idx_fixed_versions_lookup;
--
-- Then revert ciscoAdvisoryService.js to use first_fixed JSON column

-- ========================================
-- END MIGRATION 007
-- ========================================
