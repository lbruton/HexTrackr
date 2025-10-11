-- Migration 010: Restructure address fields for proper normalization
-- Date: 2025-10-11
-- Description: Replace text address fields with structured components (line1, line2, city, state, zip)
--              This enables future address-to-site relationships and proper multi-line formatting

-- Drop old single-field columns
ALTER TABLE tickets DROP COLUMN shipping_address;
ALTER TABLE tickets DROP COLUMN return_address;

-- Add structured shipping address fields
ALTER TABLE tickets ADD COLUMN shipping_line1 TEXT;
ALTER TABLE tickets ADD COLUMN shipping_line2 TEXT;
ALTER TABLE tickets ADD COLUMN shipping_city TEXT;
ALTER TABLE tickets ADD COLUMN shipping_state TEXT;
ALTER TABLE tickets ADD COLUMN shipping_zip TEXT;

-- Add structured return address fields
ALTER TABLE tickets ADD COLUMN return_line1 TEXT;
ALTER TABLE tickets ADD COLUMN return_line2 TEXT;
ALTER TABLE tickets ADD COLUMN return_city TEXT;
ALTER TABLE tickets ADD COLUMN return_state TEXT;
ALTER TABLE tickets ADD COLUMN return_zip TEXT;

-- Split tracking_number into outbound and return
ALTER TABLE tickets ADD COLUMN outbound_tracking TEXT;
ALTER TABLE tickets ADD COLUMN return_tracking TEXT;

-- Migrate existing tracking_number data (if any exists with " | " separator)
-- This preserves data from the previous version
UPDATE tickets
SET outbound_tracking = CASE
    WHEN instr(tracking_number, ' | ') > 0
    THEN substr(tracking_number, 1, instr(tracking_number, ' | ') - 1)
    ELSE tracking_number
END,
return_tracking = CASE
    WHEN instr(tracking_number, ' | ') > 0
    THEN substr(tracking_number, instr(tracking_number, ' | ') + 3)
    ELSE NULL
END
WHERE tracking_number IS NOT NULL AND tracking_number != '';

-- Keep tracking_number column for backward compatibility with templates
-- It will be auto-generated from outbound_tracking + return_tracking
