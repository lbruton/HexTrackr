-- Migration 015: Add next_sync_time to sync_metadata (HEX-279)
-- Created: 2025-10-21
-- Purpose: Enable countdown timer and service health indicators for API sync jobs
-- Feature: Store next scheduled sync time for Cisco, Palo Alto, and KEV background syncs

-- Add next_sync_time column to sync_metadata table
ALTER TABLE sync_metadata ADD COLUMN next_sync_time TEXT;

-- Initialize next_sync_time for existing records (24 hours from last sync)
UPDATE sync_metadata
SET next_sync_time = datetime(sync_time, '+24 hours')
WHERE next_sync_time IS NULL;

-- Verification
SELECT
    sync_type,
    sync_time as last_sync,
    next_sync_time,
    CAST((julianday(next_sync_time) - julianday('now')) * 24 AS INTEGER) as hours_until_next
FROM sync_metadata
ORDER BY sync_type, sync_time DESC;
