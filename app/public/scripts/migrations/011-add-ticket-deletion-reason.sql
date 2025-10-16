-- Migration 011: Add deletion reason and deleted_by for audit trail
-- Date: 2025-10-16
-- Issue: HEX-248 - Add Deletion Reason Prompt for Ticket Soft Delete

-- Add deletion reason column (user-provided reason for deleting the ticket)
ALTER TABLE tickets ADD COLUMN deletion_reason TEXT;

-- Add deleted_by column (username of person who deleted the ticket)
ALTER TABLE tickets ADD COLUMN deleted_by TEXT;

-- Note: This extends the existing soft delete functionality from Migration 004
-- which added 'deleted' (INTEGER) and 'deleted_at' (TEXT) columns
--
-- Usage after deletion:
-- - deleted = 1 (soft deleted flag)
-- - deleted_at = datetime when deleted
-- - deletion_reason = user-provided reason (e.g., "Duplicate of HEX-247")
-- - deleted_by = username from session (e.g., "lonnie.bruton")
