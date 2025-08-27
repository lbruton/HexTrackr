-- Migration: Update tickets table to match localStorage structure
-- Date: 2025-08-26
-- Purpose: Align database schema with actual application usage

-- Backup existing tickets table
DROP TABLE IF EXISTS tickets_backup;
CREATE TABLE tickets_backup AS SELECT * FROM tickets;

-- Drop and recreate tickets table with proper schema
DROP TABLE IF EXISTS tickets;
CREATE TABLE tickets (
    id TEXT PRIMARY KEY,
    date_submitted TEXT NOT NULL,
    date_due TEXT NOT NULL,
    hexagon_ticket TEXT,
    service_now_ticket TEXT,
    location TEXT NOT NULL,
    devices TEXT, -- JSON array of device strings
    supervisor TEXT,
    tech TEXT,
    status TEXT DEFAULT 'Open',
    notes TEXT,
    attachments TEXT, -- JSON array of attachment objects
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_tickets_location ON tickets(location);
CREATE INDEX IF NOT EXISTS idx_tickets_status ON tickets(status);
CREATE INDEX IF NOT EXISTS idx_tickets_date_submitted ON tickets(date_submitted);
CREATE INDEX IF NOT EXISTS idx_tickets_date_due ON tickets(date_due);
CREATE INDEX IF NOT EXISTS idx_tickets_hexagon_ticket ON tickets(hexagon_ticket);
CREATE INDEX IF NOT EXISTS idx_tickets_service_now_ticket ON tickets(service_now_ticket);
