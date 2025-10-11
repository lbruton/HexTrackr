-- Migration 007: Add job_type column to tickets table
-- Date: 2025-10-10
-- Issue: HEX-203 - Add Job Type field for work categorization
-- Purpose: Enable categorization of tickets by work type (Upgrade, Replace, Refresh, Mitigate, Other)

-- Add job_type column with default value 'Upgrade' for backward compatibility
ALTER TABLE tickets ADD COLUMN job_type TEXT DEFAULT 'Upgrade';

-- Update existing tickets to have 'Upgrade' as job_type (backward compatibility)
UPDATE tickets SET job_type = 'Upgrade' WHERE job_type IS NULL;

-- Create index on job_type for filter performance
CREATE INDEX IF NOT EXISTS idx_tickets_job_type ON tickets(job_type);

-- Verify migration
-- Expected: All tickets should have job_type = 'Upgrade'
-- SELECT COUNT(*) FROM tickets WHERE job_type IS NULL;  -- Should return 0
-- SELECT COUNT(*) FROM tickets WHERE job_type = 'Upgrade';  -- Should match total ticket count
