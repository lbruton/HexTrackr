-- Migration: Create separate sites and locations tables for HexTrackr
-- Purpose: Support multiple ticket systems with different site/location codes
-- Date: 2025-08-26

-- Create sites table
CREATE TABLE IF NOT EXISTS sites (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    code VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Create locations table  
CREATE TABLE IF NOT EXISTS locations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    code VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Insert current unique sites from tickets table
INSERT OR IGNORE INTO sites (code, name, description) 
SELECT DISTINCT 
    site as code,
    site as name,
    'Migrated from tickets table' as description
FROM tickets 
WHERE site IS NOT NULL AND site != '';

-- Insert current unique locations from tickets table
INSERT OR IGNORE INTO locations (code, name, description)
SELECT DISTINCT 
    location as code,
    location as name, 
    'Migrated from tickets table' as description
FROM tickets
WHERE location IS NOT NULL AND location != '';

-- Add foreign key columns to tickets table
ALTER TABLE tickets ADD COLUMN site_id INTEGER REFERENCES sites(id);
ALTER TABLE tickets ADD COLUMN location_id INTEGER REFERENCES locations(id);

-- Update tickets table with proper foreign key references
UPDATE tickets SET site_id = (
    SELECT s.id FROM sites s WHERE s.code = tickets.site
) WHERE site IS NOT NULL;

UPDATE tickets SET location_id = (
    SELECT l.id FROM locations l WHERE l.code = tickets.location  
) WHERE location IS NOT NULL;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_tickets_site_id ON tickets(site_id);
CREATE INDEX IF NOT EXISTS idx_tickets_location_id ON tickets(location_id);
CREATE INDEX IF NOT EXISTS idx_sites_code ON sites(code);
CREATE INDEX IF NOT EXISTS idx_locations_code ON locations(code);
