-- ========================================
-- Migration 006: Add Operating System & Solution Data Collection
-- Related: SPRINT-OPERATING-SYSTEM-SOLUTION.md
-- Version: 1.0.63+
-- Date: 2025-10-11
-- ========================================

-- This migration adds two new optional columns to capture additional
-- Tenable export data when available:
--
-- 1. operating_system - Installed OS version (asset.operating_systems from CSV)
-- 2. solution_text - Solution instructions (definition.solution from CSV)
--
-- BACKWARD COMPATIBILITY:
-- - Old CSVs without these fields will have NULL values
-- - Import process continues to work without errors
-- - Fields are optional and nullable
--
-- DATA PRESERVATION:
-- - Uses COALESCE in UPSERT to preserve "last known good value"
-- - Never overwrites real data with NULL
-- - Handles inconsistent CSV exports gracefully

-- ========================================
-- VULNERABILITIES TABLE
-- ========================================
-- Add operating system and solution text columns

ALTER TABLE vulnerabilities ADD COLUMN operating_system TEXT;
ALTER TABLE vulnerabilities ADD COLUMN solution_text TEXT;

-- ========================================
-- VULNERABILITY_STAGING TABLE
-- ========================================
-- Add same columns to staging table for high-performance imports

ALTER TABLE vulnerability_staging ADD COLUMN operating_system TEXT;
ALTER TABLE vulnerability_staging ADD COLUMN solution_text TEXT;

-- ========================================
-- VULNERABILITY_SNAPSHOTS TABLE
-- ========================================
-- Add same columns to snapshots table for historical tracking

ALTER TABLE vulnerability_snapshots ADD COLUMN operating_system TEXT;
ALTER TABLE vulnerability_snapshots ADD COLUMN solution_text TEXT;

-- ========================================
-- NOTES
-- ========================================
-- Column Names:
-- - operating_system: Extracted from CSV column "asset.operating_systems"
-- - solution_text: Extracted from CSV column "definition.solution" with fallback to "solution"
--
-- NULL Semantics:
-- - NULL = "not provided in CSV" (not an error condition)
-- - Empty string = "checked and confirmed empty" (rare)
--
-- COALESCE Strategy (implemented in application code):
-- - Week 1: Import with OS → Saved
-- - Week 2: Import without OS → Previous value preserved
-- - Week 3: Import with different OS → Updated
--
-- Future Use Cases:
-- - Phase 2: Version matching against cisco_advisories.first_fixed
-- - Phase 3: Display in vulnerability details modal
-- - Phase 3: Show "Installed: X.Y.Z → Fixed in: A.B.C" upgrade paths

-- ========================================
-- VERIFICATION QUERIES
-- ========================================
-- Run these after migration to verify schema:
--
-- 1. Check vulnerabilities table columns:
--    PRAGMA table_info(vulnerabilities);
--
-- 2. Check vulnerability_staging table columns:
--    PRAGMA table_info(vulnerability_staging);
--
-- 3. Check vulnerability_snapshots table columns:
--    PRAGMA table_info(vulnerability_snapshots);
--
-- 4. Count rows with operating_system data after import:
--    SELECT COUNT(*) FROM vulnerabilities WHERE operating_system IS NOT NULL;
--
-- 5. Count rows with solution_text data after import:
--    SELECT COUNT(*) FROM vulnerabilities WHERE solution_text IS NOT NULL;
--
-- 6. Sample data to verify extraction:
--    SELECT hostname, cve, operating_system, solution_text
--    FROM vulnerabilities
--    WHERE operating_system IS NOT NULL
--    LIMIT 5;
