-- Migration: Add XT# numbers and site column to tickets
-- Date: 2025-08-26
-- Purpose: Add unique XT# identifiers and site field for better ticket management

-- Add new columns to tickets table (without UNIQUE constraint initially)
ALTER TABLE tickets ADD COLUMN xt_number TEXT;
ALTER TABLE tickets ADD COLUMN site TEXT;

-- Create a temporary sequence table to generate XT# numbers
CREATE TEMPORARY TABLE ticket_sequence AS 
SELECT id, ROW_NUMBER() OVER (ORDER BY created_at) as seq_num 
FROM tickets WHERE xt_number IS NULL;

-- Generate XT# numbers for existing tickets using the sequence
UPDATE tickets 
SET xt_number = 'XT#' || PRINTF('%06d', (
    SELECT seq_num FROM ticket_sequence WHERE ticket_sequence.id = tickets.id
))
WHERE xt_number IS NULL;

-- Drop temporary table
DROP TABLE ticket_sequence;

-- Create index for XT# lookups  
CREATE INDEX IF NOT EXISTS idx_tickets_xt_number ON tickets(xt_number);
CREATE INDEX IF NOT EXISTS idx_tickets_site ON tickets(site);

-- Update site column from location data (can be customized per installation)
-- For now, set site same as location - customers can modify this
UPDATE tickets SET site = location WHERE site IS NULL;
