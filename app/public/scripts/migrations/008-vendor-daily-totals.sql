-- Migration 008: Vendor Daily Totals Table
-- Purpose: Create permanent storage for vendor-specific trend data
-- Context: Vendor trends were previously queried from vulnerability_snapshots
--          which gets cleaned up to keep only last 3 scan dates for rollback.
--          This migration creates a dedicated table for historical vendor analytics
--          that never gets cleaned up, similar to vulnerability_daily_totals.
-- Related: Fixes issue where vendor filters (Cisco/Palo/Other) only showed 3 dates
--          while "All Vendors" showed complete history.

CREATE TABLE IF NOT EXISTS vendor_daily_totals (
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

-- Performance indexes for trend queries
CREATE INDEX IF NOT EXISTS idx_vendor_daily_scan_date ON vendor_daily_totals(scan_date);
CREATE INDEX IF NOT EXISTS idx_vendor_daily_vendor ON vendor_daily_totals(vendor);
CREATE INDEX IF NOT EXISTS idx_vendor_daily_composite ON vendor_daily_totals(vendor, scan_date);

-- Notes:
-- - This table is populated during CSV import via calculateAndStoreDailyTotalsEnhanced()
-- - Data is aggregated with same deduplication logic as vulnerability_daily_totals
-- - Deduplication uses hostname + plugin_id (or hostname + description substring)
-- - Vendors tracked: CISCO, Palo Alto, Other
-- - This table is NEVER cleaned up by db-snapshot-cleanup.js
-- - Backfill script (backfill-vendor-daily-totals.js) can populate historical data
