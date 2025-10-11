-- Migration 004: Add soft delete support to tickets table
-- Date: 2025-10-10
-- Issue: HEX-196 - Duplicate XT# ticket numbers + Missing soft delete

-- Add soft delete columns
ALTER TABLE tickets ADD COLUMN deleted INTEGER DEFAULT 0;
ALTER TABLE tickets ADD COLUMN deleted_at TEXT;

-- Create index for performance (WHERE deleted = 0 queries)
CREATE INDEX idx_tickets_deleted ON tickets(deleted);

-- Verify migration (all existing tickets should have deleted = 0)
-- SELECT COUNT(*) FROM tickets WHERE deleted = 0;  -- Should match total count
