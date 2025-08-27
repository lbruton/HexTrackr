-- Migration: Populate XT# numbers for existing tickets
-- Date: 2025-08-26
-- Purpose: Generate XT# identifiers for tickets that don't have them

-- Check if we need to populate XT# numbers
UPDATE tickets 
SET xt_number = 'XT#' || PRINTF('%06d', (
    SELECT COUNT(*) + 1 FROM tickets t2 
    WHERE t2.created_at < tickets.created_at 
    OR (t2.created_at = tickets.created_at AND t2.id <= tickets.id)
))
WHERE xt_number IS NULL OR xt_number = '';

-- Update site column from location data where site is empty
UPDATE tickets SET site = location WHERE site IS NULL OR site = '';

-- Show results
SELECT COUNT(*) as total_tickets FROM tickets;
SELECT COUNT(*) as tickets_with_xt_numbers FROM tickets WHERE xt_number IS NOT NULL AND xt_number != '';
SELECT xt_number, hexagon_ticket, location, site FROM tickets ORDER BY xt_number LIMIT 5;
