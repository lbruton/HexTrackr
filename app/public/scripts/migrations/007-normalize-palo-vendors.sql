-- Migration 007: Normalize Palo Alto vendors in existing data
-- Date: 2025-10-12
-- Purpose: Fix vendor field for Palo Alto devices that were mislabeled during CSV import
-- Related: HEX-209 (Palo Alto Advisory Integration)
--
-- Background:
-- The hostname pattern was originally "nfpan" (too restrictive), now changed to "pan"
-- This migration updates existing records to match the new pattern
-- Affects both current and historical vulnerability tables

BEGIN TRANSACTION;

-- Update vulnerabilities_current table
-- Find all records where hostname contains "pan" (case-insensitive) and set vendor to "Palo Alto"
UPDATE vulnerabilities_current
SET vendor = 'Palo Alto'
WHERE LOWER(hostname) LIKE '%pan%'
  AND vendor != 'Palo Alto';

-- Update vulnerabilities table (historical snapshots)
UPDATE vulnerabilities
SET vendor = 'Palo Alto'
WHERE LOWER(hostname) LIKE '%pan%'
  AND vendor != 'Palo Alto';

-- Update vulnerability_snapshots table
UPDATE vulnerability_snapshots
SET vendor = 'Palo Alto'
WHERE LOWER(hostname) LIKE '%pan%'
  AND vendor != 'Palo Alto';

-- Verify changes
SELECT 'vulnerabilities_current' AS table_name, COUNT(*) AS palo_alto_count
FROM vulnerabilities_current
WHERE vendor = 'Palo Alto'
UNION ALL
SELECT 'vulnerabilities' AS table_name, COUNT(*) AS palo_alto_count
FROM vulnerabilities
WHERE vendor = 'Palo Alto'
UNION ALL
SELECT 'vulnerability_snapshots' AS table_name, COUNT(*) AS palo_alto_count
FROM vulnerability_snapshots
WHERE vendor = 'Palo Alto';

COMMIT;
