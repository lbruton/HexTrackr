-- Migration 009: Add job-type-specific fields to tickets table
-- Date: 2025-10-11
-- Description: Add fields for tracking numbers, addresses, and job-specific notes

-- Add shipping/replacement fields
ALTER TABLE tickets ADD COLUMN tracking_number TEXT;
ALTER TABLE tickets ADD COLUMN shipping_address TEXT;
ALTER TABLE tickets ADD COLUMN return_address TEXT;

-- Add job-specific notes fields
ALTER TABLE tickets ADD COLUMN software_versions TEXT;  -- For Upgrade job type
ALTER TABLE tickets ADD COLUMN mitigation_details TEXT; -- For Mitigate job type
