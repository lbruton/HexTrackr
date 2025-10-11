-- Migration 005: Remove UNIQUE constraint from xt_number to allow soft deletes
-- Date: 2025-10-10
-- Issue: HEX-196 - xt_number UNIQUE constraint blocks soft delete reuse

-- SQLite doesn't support DROP CONSTRAINT, so we need to recreate the table
-- Step 1: Create new table without UNIQUE constraint (matching current schema exactly)
CREATE TABLE tickets_new (
    id TEXT PRIMARY KEY,
    xt_number TEXT,  -- REMOVED UNIQUE constraint
    date_submitted TEXT,
    date_due TEXT,
    hexagon_ticket TEXT,
    service_now_ticket TEXT,
    location TEXT NOT NULL,
    devices TEXT,
    supervisor TEXT,
    tech TEXT,
    status TEXT DEFAULT 'Open',
    notes TEXT,
    attachments TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    site TEXT,
    site_id TEXT,
    location_id TEXT,
    deleted INTEGER DEFAULT 0,
    deleted_at TEXT
);

-- Step 2: Copy all data from old table to new table (explicit column list)
INSERT INTO tickets_new
    (id, xt_number, date_submitted, date_due, hexagon_ticket, service_now_ticket,
     location, devices, supervisor, tech, status, notes, attachments,
     created_at, updated_at, site, site_id, location_id, deleted, deleted_at)
SELECT
    id, xt_number, date_submitted, date_due, hexagon_ticket, service_now_ticket,
    location, devices, supervisor, tech, status, notes, attachments,
    created_at, updated_at, site, site_id, location_id, deleted, deleted_at
FROM tickets;

-- Step 3: Drop old table
DROP TABLE tickets;

-- Step 4: Rename new table to original name
ALTER TABLE tickets_new RENAME TO tickets;

-- Step 5: Recreate indexes (deleted index already exists from migration 004)
CREATE INDEX IF NOT EXISTS idx_tickets_deleted ON tickets(deleted);
CREATE INDEX IF NOT EXISTS idx_tickets_xt_number ON tickets(xt_number);
CREATE INDEX IF NOT EXISTS idx_tickets_status ON tickets(status);
CREATE UNIQUE INDEX IF NOT EXISTS idx_tickets_xt_unique_active ON tickets(xt_number) WHERE deleted = 0;

-- Verify migration
-- SELECT COUNT(*) FROM tickets;  -- Should match original count (31 tickets)
