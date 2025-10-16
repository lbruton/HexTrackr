# Site Address Database - Architecture & Implementation Plan

**Project**: HexTrackr Site Address Normalization & History System  
**Date**: October 15, 2025  
**Status**: Research & Planning Phase  
**Lead**: Development Team  

---

## Executive Summary

This document outlines a comprehensive plan to build a **dynamic site address database** that will serve as the foundation for multi-source data normalization across HexTrackr. The initial implementation focuses on shipping/return addresses for Replace/Refresh ticket workflows, with the architecture designed to scale to additional data sources (NetBox, other CMDB systems) and use cases.

### Key Objectives

1. ✅ **Phase 1**: Wire existing ticket modal fields to database (Replace/Refresh shipping addresses)
2. 🎯 **Phase 2**: Build site normalization layer with alias support
3. 🎯 **Phase 3**: Implement address history tracking with fuzzy search
4. 🎯 **Phase 4**: Add return address management system
5. 🚀 **Phase 5**: Extend to NetBox and other external data sources

---

## Current State Assessment

### Existing Database Schema

#### Tickets Table (Current - v1.0.54+)
```sql
CREATE TABLE tickets (
    id TEXT PRIMARY KEY,
    xt_number TEXT,
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
    site TEXT,                      -- Free-form site code (e.g., "STRO", "CARR")
    site_id TEXT,                   -- Reserved for FK to sites table (unused)
    location_id TEXT,               -- Reserved for FK to locations table (unused)
    deleted INTEGER DEFAULT 0,
    deleted_at TEXT,
    
    -- ✅ ALREADY EXIST (Added but not wired up):
    job_type TEXT DEFAULT 'Upgrade',
    tracking_number TEXT,           -- Legacy concatenated field
    software_versions TEXT,
    mitigation_details TEXT,
    shipping_line1 TEXT,
    shipping_line2 TEXT,
    shipping_city TEXT,
    shipping_state TEXT,
    shipping_zip TEXT,
    return_line1 TEXT,
    return_line2 TEXT,
    return_city TEXT,
    return_state TEXT,
    return_zip TEXT,
    outbound_tracking TEXT,
    return_tracking TEXT
);
```

**Status**: ✅ Database columns exist, ❌ Backend service not reading/writing them, ❌ Frontend edit functionality incomplete

#### Missing Tables (Referenced in docs but not created)
- `sites` - Site normalization table
- `locations` - Location normalization table

**Finding**: These tables are documented in `/docs-source/architecture/data-model.md` but never implemented in production. The `tickets.site_id` and `tickets.location_id` columns were added as placeholders but never utilized.

---

## Architecture Design

### Proposed Table Structure

#### 1. Core Sites Table (`sites`)
```sql
CREATE TABLE sites (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    canonical_name TEXT NOT NULL,           -- Master site identifier (e.g., "STROU_STROUD")
    display_name TEXT NOT NULL,             -- User-friendly name (e.g., "Stroud - Oklahoma")
    description TEXT,                       -- Optional metadata
    is_active BOOLEAN DEFAULT 1,            -- Soft delete flag
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    created_by TEXT,                        -- User who created record
    updated_by TEXT,                        -- User who last modified
    
    UNIQUE(canonical_name)
);
```

**Purpose**: Central authority for all physical sites. One row per real-world location.

---

#### 2. Site Aliases Table (`site_aliases`) - The "Rosetta Stone"
```sql
CREATE TABLE site_aliases (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    site_id INTEGER NOT NULL,               -- FK to sites.id
    source_system TEXT NOT NULL,            -- 'team1', 'team2', 'team3', 'netbox', 'servicenow'
    alias_value TEXT NOT NULL,              -- The actual alias string (e.g., "STRO", "STROU", "STROUD")
    alias_type TEXT DEFAULT 'code',         -- 'site_code', 'location_code', 'slug', 'name'
    is_primary BOOLEAN DEFAULT 0,           -- One primary alias per source_system
    confidence_score REAL DEFAULT 1.0,      -- For fuzzy-matched aliases (0.0-1.0)
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    created_by TEXT,
    notes TEXT,                             -- How this alias was determined
    
    FOREIGN KEY (site_id) REFERENCES sites(id) ON DELETE CASCADE,
    UNIQUE(source_system, alias_value)      -- No duplicate aliases per system
);

CREATE INDEX idx_site_aliases_lookup ON site_aliases(source_system, alias_value);
CREATE INDEX idx_site_aliases_site ON site_aliases(site_id);
```

**Purpose**: **The Translation Layer** - Maps all team-specific site codes to a single canonical site.

**Why This is Brilliant** (Credit: Network Engineer Brain):
- Different teams use different naming conventions (STRO vs STROUD vs STRD)
- Each team uses **at least one** of the site/location codes consistently
- By capturing BOTH site + location as separate aliases, we catch ALL variations
- When ANY combination matches, it resolves to the same `site_id`
- **No duplicate sites, no fragmented data, one source of truth**

**Example Data** (Real-World Scenario):

| site_id | source_system | alias_value | alias_type | is_primary | notes |
|---------|---------------|-------------|------------|------------|-------|
| 1 | team1 | STROUD | site_code | 1 | Original site code |
| 1 | team1 | STRD | location_code | 0 | Location variant |
| 1 | team2 | STRO | site_code | 1 | Abbreviated version |
| 1 | team2 | STRD | location_code | 0 | Shared location code |
| 1 | team3 | STRD | site_code | 1 | Uses location as site |
| 1 | team3 | STROUD | location_code | 0 | Full name as location |
| 1 | netbox | stroud-ok-dc | slug | 1 | NetBox slug format |
| 1 | servicenow | STR-Oklahoma-01 | name | 1 | CMDB naming |

**The Magic**: When Team 2 creates a ticket with `STRO + STRD`, the system searches:
```sql
WHERE (sa1.alias_value IN ('STRO', 'STRD'))
  AND (sa2.alias_value IN ('STRO', 'STRD'))
```
Finds: `site_id = 1` ✅ → All teams share the same address history!

---

#### 3. Address History Table (`site_address_history`)
```sql
CREATE TABLE site_address_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    site_id INTEGER NOT NULL,               -- FK to sites.id
    address_type TEXT NOT NULL,             -- 'shipping', 'billing', 'mailing', 'physical'
    source_system TEXT NOT NULL,            -- 'hextrackr_tickets', 'netbox', 'manual_entry'
    source_record_id TEXT,                  -- Foreign system's record ID (e.g., ticket ID)
    
    -- Address components (normalized)
    line1 TEXT NOT NULL,
    line2 TEXT,
    city TEXT NOT NULL,
    state TEXT NOT NULL,                    -- 2-letter state code
    zip TEXT NOT NULL,                      -- 5-digit or 5+4 format
    country TEXT DEFAULT 'US',              -- ISO country code
    
    -- Metadata
    full_address TEXT,                      -- Concatenated for full-text search
    is_verified BOOLEAN DEFAULT 0,          -- Manually verified by user
    usage_count INTEGER DEFAULT 1,          -- How many times this address was used
    first_seen DATETIME DEFAULT CURRENT_TIMESTAMP,
    last_seen DATETIME DEFAULT CURRENT_TIMESTAMP,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    created_by TEXT,
    notes TEXT,
    
    FOREIGN KEY (site_id) REFERENCES sites(id) ON DELETE CASCADE
);

CREATE INDEX idx_address_history_site ON site_address_history(site_id, address_type);
CREATE INDEX idx_address_history_source ON site_address_history(source_system, source_record_id);
CREATE INDEX idx_address_history_usage ON site_address_history(site_id, usage_count DESC);
CREATE INDEX idx_address_full_text ON site_address_history(full_address); -- For fuzzy search
```

**Purpose**: Tracks every address ever used for a site, with deduplication and ranking by usage frequency.

**Smart Features**:
- Automatically increments `usage_count` when duplicate address is saved
- `last_seen` updates on each reuse (tracks recency)
- Full-text search on `full_address` for fuzzy matching
- Links back to source ticket for audit trail

---

#### 4. Return Addresses Configuration (`return_addresses_config`)
```sql
CREATE TABLE return_addresses_config (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    location_code TEXT NOT NULL UNIQUE,     -- Internal code (e.g., "HQ", "WAREHOUSE_TX")
    location_name TEXT NOT NULL,            -- Display name (e.g., "Corporate HQ - Dallas")
    
    -- Address components
    line1 TEXT NOT NULL,
    line2 TEXT,
    city TEXT NOT NULL,
    state TEXT NOT NULL,
    zip TEXT NOT NULL,
    country TEXT DEFAULT 'US',
    
    -- Contact info
    contact_name TEXT,
    contact_phone TEXT,
    contact_email TEXT,
    
    -- Metadata
    is_active BOOLEAN DEFAULT 1,
    is_default BOOLEAN DEFAULT 0,           -- One default return address
    display_order INTEGER DEFAULT 0,        -- Sort order in dropdown
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    notes TEXT
);

CREATE INDEX idx_return_addresses_active ON return_addresses_config(is_active, display_order);
```

**Purpose**: Master list of corporate return addresses. Simple table, could be JSON but SQL allows for easier UI management later.

**Design Decision**: This is **configuration data** (not history), so it stays in database rather than JSON for:
- Future admin UI to manage return addresses
- Audit trail via `created_at`/`updated_at`
- Referential integrity if we add tracking later

---

### Data Flow Architecture

```text
┌─────────────────────────────────────────────────────────────────┐
│                      USER CREATES TICKET                         │
│                   (Replace/Refresh Job Type)                     │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
                  ┌──────────────────────┐
                  │  Frontend Modal      │
                  │  - Site: "STRO"      │
                  │  - Location: "STROU" │
                  │  - Shipping fields   │
                  └──────────┬───────────┘
                             │
                             │ 1. Lookup site_id
                             ▼
                  ┌──────────────────────┐
                  │  site_aliases table  │◄────┐
                  │  Find matching site  │     │
                  └──────────┬───────────┘     │
                             │                 │ No match?
                             │ site_id found   │ Auto-create
                             ▼                 │
                  ┌──────────────────────┐     │
                  │   sites table        │─────┘
                  │   Get/Create site    │
                  └──────────┬───────────┘
                             │
                             │ 2. Check for existing address
                             ▼
                  ┌──────────────────────────────┐
                  │  site_address_history table  │
                  │  Search for matching address │
                  └──────────┬───────────────────┘
                             │
                ┌────────────┴────────────┐
                │                         │
        Match found?              No match found?
                │                         │
                ▼                         ▼
    ┌──────────────────┐      ┌──────────────────────┐
    │ Increment        │      │ Insert new address   │
    │ usage_count++    │      │ usage_count = 1      │
    │ Update last_seen │      │                      │
    └──────────┬───────┘      └──────────┬───────────┘
               │                         │
               └────────────┬────────────┘
                            │
                            │ 3. Save ticket
                            ▼
                 ┌──────────────────────┐
                 │   tickets table      │
                 │   - site_id (FK)     │
                 │   - shipping_* cols  │
                 │   - tracking_* cols  │
                 └──────────────────────┘
```

---

## Phase 1: Wire Existing Fields (Week 1)

### Objectives
- ✅ Connect frontend modal fields to backend services
- ✅ Enable save/edit/retrieve for shipping addresses
- ✅ No new database tables (use existing columns)

### Files to Modify

#### 1. Backend Service (`app/services/ticketService.js`)

**INSERT Operation** - Add fields to `createTicket()`:
```javascript
const sql = `INSERT INTO tickets (
    id, date_submitted, date_due, hexagon_ticket, service_now_ticket, location,
    devices, supervisor, tech, status, job_type, notes, attachments,
    created_at, updated_at, site, xt_number, site_id, location_id,
    -- ADD THESE:
    shipping_line1, shipping_line2, shipping_city, shipping_state, shipping_zip,
    return_line1, return_line2, return_city, return_state, return_zip,
    outbound_tracking, return_tracking, software_versions, mitigation_details
) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
```

**UPDATE Operation** - Add fields to `updateTicket()`:
```javascript
const sql = `UPDATE tickets SET
    date_submitted = ?, date_due = ?, hexagon_ticket = ?, service_now_ticket = ?,
    location = ?, devices = ?, supervisor = ?, tech = ?, status = ?, job_type = ?, notes = ?,
    attachments = ?, updated_at = ?, site = ?, xt_number = ?, site_id = ?, location_id = ?,
    -- ADD THESE:
    shipping_line1 = ?, shipping_line2 = ?, shipping_city = ?, shipping_state = ?, shipping_zip = ?,
    return_line1 = ?, return_line2 = ?, return_city = ?, return_state = ?, return_zip = ?,
    outbound_tracking = ?, return_tracking = ?, software_versions = ?, mitigation_details = ?
    WHERE id = ?`;
```

**GET Operation** - Fields already returned by SELECT *, no changes needed

#### 2. Frontend JavaScript (`app/public/scripts/pages/tickets.js`)

**Fix `editTicket()` method** - Populate fields when editing:
```javascript
editTicket(id) {
    const ticket = this.getTicketById(id);
    if (!ticket) return;

    // ... existing field population ...
    
    // ADD: Populate conditional fields
    document.getElementById("shippingLine1").value = ticket.shipping_line1 || "";
    document.getElementById("shippingLine2").value = ticket.shipping_line2 || "";
    document.getElementById("shippingCity").value = ticket.shipping_city || "";
    document.getElementById("shippingState").value = ticket.shipping_state || "";
    document.getElementById("shippingZip").value = ticket.shipping_zip || "";
    
    document.getElementById("returnLine1").value = ticket.return_line1 || "";
    document.getElementById("returnLine2").value = ticket.return_line2 || "";
    document.getElementById("returnCity").value = ticket.return_city || "";
    document.getElementById("returnState").value = ticket.return_state || "";
    document.getElementById("returnZip").value = ticket.return_zip || "";
    
    document.getElementById("outboundTracking").value = ticket.outbound_tracking || "";
    document.getElementById("returnTracking").value = ticket.return_tracking || "";
    
    document.getElementById("softwareVersions").value = ticket.software_versions || "";
    document.getElementById("mitigationDetailsInput").value = ticket.mitigation_details || "";
    
    // Trigger job type change to show/hide appropriate fields
    this.handleJobTypeChange();
}
```

**Validation** - Ensure all field names match database column names (snake_case in DB, camelCase in JS)

### Testing Checklist
- [ ] Create new Replace ticket with shipping address → Saves to DB
- [ ] Create new Refresh ticket with shipping address → Saves to DB
- [ ] Edit existing ticket, modify shipping address → Updates in DB
- [ ] Close modal without saving → No changes persist
- [ ] Reopen edited ticket → All fields populate correctly
- [ ] Create Upgrade ticket with software versions → Saves to DB
- [ ] Create Mitigate ticket with mitigation details → Saves to DB

### Success Criteria
✅ All existing modal fields save and retrieve correctly  
✅ No data loss on edit operations  
✅ Field values persist across page refreshes  

---

## Phase 2: Site Normalization Layer (Week 2-3)

### Objectives
- 🎯 Create `sites`, `site_aliases` tables
- 🎯 Migrate existing site/location data from tickets
- 🎯 Implement alias resolution service
- 🎯 Update ticket creation to auto-assign site_id

### Implementation Steps

#### Step 1: Database Migration
```sql
-- Migration script: migrations/002_create_sites_tables.sql

BEGIN TRANSACTION;

-- Create sites table
CREATE TABLE sites (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    canonical_name TEXT NOT NULL UNIQUE,
    display_name TEXT NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    created_by TEXT,
    updated_by TEXT
);

-- Create site_aliases table
CREATE TABLE site_aliases (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    site_id INTEGER NOT NULL,
    source_system TEXT NOT NULL,
    alias_value TEXT NOT NULL,
    alias_type TEXT DEFAULT 'code',
    is_primary BOOLEAN DEFAULT 0,
    confidence_score REAL DEFAULT 1.0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    created_by TEXT,
    notes TEXT,
    FOREIGN KEY (site_id) REFERENCES sites(id) ON DELETE CASCADE,
    UNIQUE(source_system, alias_value)
);

CREATE INDEX idx_site_aliases_lookup ON site_aliases(source_system, alias_value);
CREATE INDEX idx_site_aliases_site ON site_aliases(site_id);

COMMIT;
```

#### Step 2: Data Migration Script
```javascript
// scripts/migrate-site-data.js

/**
 * Migrate existing site/location combinations from tickets table
 * Creates canonical sites and establishes aliases
 */
async function migrateSiteData() {
    const db = await getDatabase();
    
    // Get unique site+location combinations
    const combinations = db.prepare(`
        SELECT DISTINCT site, location
        FROM tickets
        WHERE site IS NOT NULL AND location IS NOT NULL
        ORDER BY site, location
    `).all();
    
    for (const combo of combinations) {
        const canonicalName = `${combo.site}_${combo.location}`.toUpperCase();
        const displayName = `${combo.site} - ${combo.location}`;
        
        // Create site record
        const siteResult = db.prepare(`
            INSERT INTO sites (canonical_name, display_name, created_by)
            VALUES (?, ?, 'system_migration')
            ON CONFLICT(canonical_name) DO NOTHING
        `).run(canonicalName, displayName);
        
        const siteId = siteResult.lastInsertRowid || 
                       db.prepare('SELECT id FROM sites WHERE canonical_name = ?')
                         .get(canonicalName).id;
        
        // Create aliases
        db.prepare(`
            INSERT INTO site_aliases (site_id, source_system, alias_value, alias_type, is_primary, created_by)
            VALUES (?, 'hextrackr_site', ?, 'code', 1, 'system_migration')
            ON CONFLICT DO NOTHING
        `).run(siteId, combo.site);
        
        db.prepare(`
            INSERT INTO site_aliases (site_id, source_system, alias_value, alias_type, is_primary, created_by)
            VALUES (?, 'hextrackr_location', ?, 'code', 0, 'system_migration')
            ON CONFLICT DO NOTHING
        `).run(siteId, combo.location);
        
        // Update tickets with site_id
        db.prepare(`
            UPDATE tickets 
            SET site_id = ?
            WHERE site = ? AND location = ?
        `).run(siteId, combo.site, combo.location);
    }
    
    console.log(`✅ Migrated ${combinations.length} site combinations`);
}
```

#### Step 3: Site Lookup Service
```javascript
// app/services/siteService.js

class SiteService {
    constructor(db) {
        this.db = db;
    }
    
    /**
     * Resolve site ID from site/location codes
     * 
     * NETWORK ENGINEER LOGIC:
     * Different teams use different codes, but they overlap.
     * By checking if EITHER site OR location matches existing aliases,
     * we catch all variations and unify them to one canonical site.
     * 
     * Examples:
     * - Team1: STROUD + STRD → site_id 1
     * - Team2: STRO + STRD   → site_id 1 (STRD overlaps!)
     * - Team3: STRD + STROUD → site_id 1 (both overlap!)
     */
    async resolveSiteId(siteCode, locationCode, sourceSystem = 'hextrackr') {
        // Try fuzzy match: find sites where EITHER code matches existing aliases
        let site = this.db.prepare(`
            SELECT DISTINCT s.id, s.canonical_name
            FROM sites s
            JOIN site_aliases sa ON sa.site_id = s.id
            WHERE sa.alias_value IN (?, ?)
            GROUP BY s.id
            HAVING COUNT(DISTINCT sa.alias_value) >= 1
            ORDER BY COUNT(DISTINCT sa.alias_value) DESC
            LIMIT 1
        `).get(siteCode, locationCode);
        
        if (site) {
            // Add new aliases if they don't exist yet
            this.addAliasIfNotExists(site.id, sourceSystem, siteCode, 'site_code');
            this.addAliasIfNotExists(site.id, sourceSystem, locationCode, 'location_code');
            return site.id;
        }
        
        // No match found - create new site with BOTH codes as aliases
        const canonicalName = `${siteCode}_${locationCode}`.toUpperCase();
        const displayName = `${siteCode} - ${locationCode}`;
        
        const result = this.db.prepare(`
            INSERT INTO sites (canonical_name, display_name, created_by)
            VALUES (?, ?, 'auto_created')
        `).run(canonicalName, displayName);
        
        const siteId = result.lastInsertRowid;
        
        // Create aliases for BOTH site and location codes
        this.addAliasIfNotExists(siteId, sourceSystem, siteCode, 'site_code', true);
        this.addAliasIfNotExists(siteId, sourceSystem, locationCode, 'location_code', false);
        
        return siteId;
    }
    
    /**
     * Helper: Add alias only if it doesn't exist
     * Prevents duplicate key errors
     */
    addAliasIfNotExists(siteId, sourceSystem, aliasValue, aliasType, isPrimary = false) {
        const existing = this.db.prepare(`
            SELECT id FROM site_aliases
            WHERE source_system = ? AND alias_value = ?
        `).get(sourceSystem, aliasValue);
        
        if (!existing) {
            this.db.prepare(`
                INSERT INTO site_aliases (site_id, source_system, alias_value, alias_type, is_primary, created_by)
                VALUES (?, ?, ?, ?, ?, 'auto_created')
            `).run(siteId, sourceSystem, aliasValue, aliasType, isPrimary ? 1 : 0);
        }
    }
    
    /**
     * Get all aliases for a site
     */
    async getSiteAliases(siteId) {
        return this.db.prepare(`
            SELECT source_system, alias_value, alias_type, is_primary
            FROM site_aliases
            WHERE site_id = ?
            ORDER BY source_system, is_primary DESC
        `).all(siteId);
    }
}
```

### Success Criteria
✅ All existing tickets have valid `site_id` values  
✅ New tickets auto-resolve site_id on creation  
✅ Site aliases can be queried from any source system  
✅ No duplicate canonical sites exist  

---

## Phase 2.5: Intelligent Device-to-Site Mapping (Week 3.5)

### Objectives
- 🎯 Create device hostname → site_id mapping system
- 🎯 Learn patterns from user behavior (self-improving)
- 🎯 Improve KEV dashboard auto-population from 80-90% to 95%+ accuracy
- 🎯 Eliminate manual corrections on most tickets

### Current Pain Point (vulnerabilities.html)
```javascript
// Today: Hardcoded substring parsing
hostname = "STRO-RTR-01"
site = hostname.substring(0, 4)      // "STRO" (works 80-90% of time)
location = hostname.substring(0, 5)  // "STRO-" (often needs correction)
```

**Problems**:
- ❌ Doesn't work for all naming conventions
- ❌ No learning from corrections
- ❌ Different teams = different patterns = failures

### Enhanced Solution
```javascript
// Smart lookup with learning
const result = await deviceLookup.resolveSite("STRO-RTR-01");
// Returns: {site_id: 1, site_code: "STRO", location_code: "STRD", confidence: 0.95}
```

### Database Tables

#### device_site_mappings (Cache Layer)
```sql
CREATE TABLE device_site_mappings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    hostname TEXT NOT NULL UNIQUE,
    site_id INTEGER NOT NULL,
    confidence_score REAL DEFAULT 0.5,
    mapping_source TEXT NOT NULL,           -- 'exact', 'pattern', 'substring', 'user_override'
    times_confirmed INTEGER DEFAULT 1,
    last_confirmed DATETIME DEFAULT CURRENT_TIMESTAMP,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (site_id) REFERENCES sites(id) ON DELETE CASCADE
);
```

#### hostname_patterns (Learning Layer)
```sql
CREATE TABLE hostname_patterns (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    site_id INTEGER NOT NULL,
    pattern_type TEXT NOT NULL,             -- 'prefix', 'regex', 'contains'
    pattern_value TEXT NOT NULL,            -- e.g., "STRO-", "^STRD.*"
    confidence_score REAL DEFAULT 0.7,
    match_count INTEGER DEFAULT 0,
    last_matched DATETIME,
    FOREIGN KEY (site_id) REFERENCES sites(id),
    UNIQUE(site_id, pattern_type, pattern_value)
);
```

### Resolution Algorithm

**Multi-tier lookup** (from fastest/most accurate to slowest/least accurate):

1. **Exact Match** (confidence: 1.0)
   - Check `device_site_mappings` for exact hostname
   - If found → return immediately

2. **Pattern Match** (confidence: 0.7-0.9)
   - Check `hostname_patterns` for prefix/regex/contains matches
   - If found → cache in mappings table for next time

3. **Substring Fallback** (confidence: 0.5)
   - Parse first 4-5 chars, search `site_aliases`
   - If found → cache in mappings table

4. **No Match** (confidence: 0.0)
   - Return null, user must select manually

### Learning Behavior

**Scenario 1: User accepts suggestion**
```javascript
System suggests: site_id = 1 (confidence: 0.7)
User accepts → confirmMapping(hostname, site_id, user_corrected: false)
Result: Mapping confidence increased to 0.9
```

**Scenario 2: User corrects**
```javascript
System suggests: site_id = 1 (confidence: 0.7)
User changes to: site_id = 2
User saves → confirmMapping(hostname, site_id, user_corrected: true)
Result: 
  - Mapping created with confidence 1.0
  - NEW pattern learned from hostname prefix
  - Future similar hostnames auto-resolve to site_id = 2
```

### Frontend Integration

**vulnerabilities.js changes**:
```javascript
async function createTicketFromVulnerability(vulnData) {
    const hostname = vulnData.hostname;
    
    // NEW: Smart lookup
    const siteResolution = await fetch(`/api/devices/resolve-site?hostname=${hostname}`)
        .then(r => r.json());
    
    // Populate with confidence indicator
    if (siteResolution) {
        document.getElementById("site").value = siteResolution.site_code;
        document.getElementById("location").value = siteResolution.location_code;
        
        // Show confidence badge
        if (siteResolution.confidence >= 0.9) {
            showBadge("High confidence", "success");
        } else if (siteResolution.confidence >= 0.7) {
            showBadge("Medium confidence - please verify", "warning");
        } else {
            showBadge("Low confidence - may need correction", "secondary");
        }
    }
}

// When ticket saved, confirm the mapping
async function saveTicket(data) {
    // ... existing logic ...
    
    // NEW: Confirm or correct mapping
    await fetch('/api/devices/confirm-mapping', {
        method: 'POST',
        body: JSON.stringify({
            hostname: data.hostname,
            site_id: data.site_id,
            user_corrected: checkIfUserChangedSite()
        })
    });
}
```

### API Endpoints

**New endpoints**:
- `GET /api/devices/resolve-site?hostname=STRO-RTR-01` - Resolve hostname to site
- `POST /api/devices/confirm-mapping` - Confirm or correct mapping (learning endpoint)
- `GET /api/sites/:id/device-mappings` - View learned patterns (admin)

### Example Learning Over Time

**Week 1** (Initial state):
```text
STRO-RTR-01 → Substring parse → site_id: 1 (confidence: 0.5)
User accepts → Mapping created + Pattern learned: "STRO" prefix
```

**Week 2** (System learning):
```text
STRO-SW-01 → Pattern match "STRO" → site_id: 1 (confidence: 0.7)
STRO-FW-02 → Pattern match "STRO" → site_id: 1 (confidence: 0.7)
Pattern confidence increased to 0.80 (used 3 times)
```

**Week 4** (High confidence):
```text
STRO-AP-05 → Pattern match "STRO" → site_id: 1 (confidence: 0.85)
User accepts → Pattern confidence increased to 0.88
Any "STRO-*" device now auto-resolves with 95%+ accuracy
```

### Benefits

**Before**:
- 80-90% accuracy (static substring parsing)
- 10-20% manual corrections required
- No improvement over time

**After**:
- 95%+ accuracy (learned patterns)
- <5% manual corrections
- Self-improving system
- Visual confidence indicators
- Handles multiple team naming conventions

### Implementation Steps

1. **Database migration** - Create tables (30 min)
2. **Service layer** - `DeviceSiteLookupService.js` (2-3 hours)
3. **API endpoints** - Add to routes (1 hour)
4. **Frontend integration** - Modify vulnerabilities.js (2 hours)
5. **Backfill data** - Extract devices from existing tickets (1 hour)
6. **Testing** - Verify learning behavior (2 hours)

**Total effort**: ~1.5 days

### Success Criteria
✅ KEV dashboard auto-population reaches 95%+ accuracy  
✅ System learns new patterns from user corrections  
✅ Confidence scores accurately reflect reliability  
✅ Manual corrections trigger pattern learning  
✅ Existing tickets backfilled into mappings table  

**See detailed implementation**: `/docs/implementations/DEVICE_SITE_MAPPING.md`

---

## Phase 3: Address History & Fuzzy Search (Week 4-5)

### Objectives
- 🎯 Create `site_address_history` table
- 🎯 Capture addresses on ticket save
- 🎯 Build address lookup modal UI
- 🎯 Implement fuzzy search with ranking

### Implementation Steps

#### Step 1: Database Table
```sql
-- Already defined above in "Proposed Table Structure"
```

#### Step 2: Address Capture Service
```javascript
// app/services/addressHistoryService.js

class AddressHistoryService {
    constructor(db) {
        this.db = db;
    }
    
    /**
     * Save or update address in history
     * Increments usage_count if duplicate
     */
    async recordAddress(siteId, addressData, sourceTicketId) {
        const fullAddress = `${addressData.line1} ${addressData.line2 || ''} ${addressData.city}, ${addressData.state} ${addressData.zip}`.trim();
        
        // Check for existing match
        const existing = this.db.prepare(`
            SELECT id, usage_count
            FROM site_address_history
            WHERE site_id = ?
              AND address_type = ?
              AND line1 = ?
              AND COALESCE(line2, '') = ?
              AND city = ?
              AND state = ?
              AND zip = ?
        `).get(
            siteId,
            addressData.type || 'shipping',
            addressData.line1,
            addressData.line2 || '',
            addressData.city,
            addressData.state,
            addressData.zip
        );
        
        if (existing) {
            // Update existing record
            this.db.prepare(`
                UPDATE site_address_history
                SET usage_count = usage_count + 1,
                    last_seen = CURRENT_TIMESTAMP
                WHERE id = ?
            `).run(existing.id);
            
            return existing.id;
        } else {
            // Insert new record
            const result = this.db.prepare(`
                INSERT INTO site_address_history (
                    site_id, address_type, source_system, source_record_id,
                    line1, line2, city, state, zip, full_address, created_by
                ) VALUES (?, ?, 'hextrackr_tickets', ?, ?, ?, ?, ?, ?, ?, 'ticket_save')
            `).run(
                siteId,
                addressData.type || 'shipping',
                sourceTicketId,
                addressData.line1,
                addressData.line2,
                addressData.city,
                addressData.state,
                addressData.zip,
                fullAddress
            );
            
            return result.lastInsertRowid;
        }
    }
    
    /**
     * Get address history for a site, ranked by usage
     */
    async getAddressHistory(siteId, addressType = 'shipping', limit = 10) {
        return this.db.prepare(`
            SELECT 
                id,
                line1, line2, city, state, zip,
                usage_count,
                is_verified,
                last_seen,
                first_seen
            FROM site_address_history
            WHERE site_id = ? AND address_type = ?
            ORDER BY usage_count DESC, last_seen DESC
            LIMIT ?
        `).all(siteId, addressType, limit);
    }
    
    /**
     * Fuzzy search addresses across all sites
     */
    async fuzzySearchAddresses(searchQuery, addressType = 'shipping', limit = 20) {
        // Simple implementation - can be enhanced with FTS5 later
        const query = `%${searchQuery}%`;
        
        return this.db.prepare(`
            SELECT 
                sah.id,
                sah.line1, sah.line2, sah.city, sah.state, sah.zip,
                sah.usage_count,
                s.canonical_name,
                s.display_name
            FROM site_address_history sah
            JOIN sites s ON s.id = sah.site_id
            WHERE sah.address_type = ?
              AND (
                sah.full_address LIKE ? OR
                s.canonical_name LIKE ? OR
                s.display_name LIKE ?
              )
            ORDER BY sah.usage_count DESC, sah.last_seen DESC
            LIMIT ?
        `).all(addressType, query, query, query, limit);
    }
}
```

#### Step 3: Frontend Address Lookup Modal
```html
<!-- app/public/tickets.html - Add after ticket modal -->

<div class="modal fade" id="addressLookupModal" tabindex="-1">
    <div class="modal-dialog modal-lg">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title">
                    <i class="ti ti-map-search me-2"></i>Address History
                </h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <div class="modal-body">
                <div class="mb-3">
                    <input type="text" 
                           class="form-control" 
                           id="addressSearchInput" 
                           placeholder="Search addresses by street, city, or site name...">
                </div>
                
                <div id="addressHistoryResults" class="list-group">
                    <!-- Populated dynamically -->
                </div>
            </div>
        </div>
    </div>
</div>
```

```javascript
// app/public/scripts/pages/tickets.js - Add method

async showAddressLookup(targetFieldPrefix) {
    // Get current site_id
    const siteCode = document.getElementById("site").value;
    const locationCode = document.getElementById("location").value;
    
    if (!siteCode || !locationCode) {
        alert("Please select Site and Location first");
        return;
    }
    
    // Fetch address history
    const response = await fetch(`/api/sites/address-history?site=${siteCode}&location=${locationCode}`);
    const addresses = await response.json();
    
    // Populate modal
    const resultsDiv = document.getElementById("addressHistoryResults");
    resultsDiv.innerHTML = addresses.map(addr => `
        <a href="#" class="list-group-item list-group-item-action" 
           data-address-id="${addr.id}">
            <div class="d-flex w-100 justify-content-between">
                <h6 class="mb-1">${addr.line1} ${addr.line2 || ''}</h6>
                <small class="text-muted">Used ${addr.usage_count}x</small>
            </div>
            <p class="mb-1">${addr.city}, ${addr.state} ${addr.zip}</p>
            <small class="text-muted">Last used: ${new Date(addr.last_seen).toLocaleDateString()}</small>
        </a>
    `).join('');
    
    // Add click handlers
    resultsDiv.querySelectorAll('.list-group-item').forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const addressId = item.dataset.addressId;
            const address = addresses.find(a => a.id == addressId);
            
            // Populate form fields
            document.getElementById(`${targetFieldPrefix}Line1`).value = address.line1;
            document.getElementById(`${targetFieldPrefix}Line2`).value = address.line2 || '';
            document.getElementById(`${targetFieldPrefix}City`).value = address.city;
            document.getElementById(`${targetFieldPrefix}State`).value = address.state;
            document.getElementById(`${targetFieldPrefix}Zip`).value = address.zip;
            
            // Close modal
            bootstrap.Modal.getInstance(document.getElementById('addressLookupModal')).hide();
        });
    });
    
    // Show modal
    new bootstrap.Modal(document.getElementById('addressLookupModal')).show();
}
```

#### Step 4: Add Spyglass Icon to HTML
```html
<!-- Modify shipping address section in ticket modal -->
<div class="col-md-6">
    <div class="card">
        <div class="card-header">
            <h4 class="card-title d-flex justify-content-between align-items-center">
                <span><i class="ti ti-truck me-1"></i>Shipping Address</span>
                <button type="button" 
                        class="btn btn-sm btn-ghost-primary" 
                        onclick="ticketManager.showAddressLookup('shipping')"
                        title="View address history">
                    <i class="ti ti-search"></i>
                </button>
            </h4>
        </div>
        <!-- ... rest of fields ... -->
    </div>
</div>
```

### Success Criteria
✅ Addresses save to history on ticket creation  
✅ Address lookup modal displays historical addresses  
✅ Clicking address auto-fills form fields  
✅ Most-used addresses appear at top of list  
✅ Fuzzy search finds addresses across all sites  

---

## Phase 4: Return Address Management (Week 6)

### Objectives
- 🎯 Create `return_addresses_config` table
- 🎯 Build admin UI to manage return addresses
- 🎯 Replace return address fields with dropdown
- 🎯 Add JSON export/import capability

### Implementation Details

#### Database Table
```sql
-- Already defined above in "Proposed Table Structure"
```

#### Seed Data
```javascript
// scripts/seed-return-addresses.js

const defaultReturnAddresses = [
    {
        location_code: 'HQ_DALLAS',
        location_name: 'Corporate Headquarters - Dallas',
        line1: '123 Main Street',
        line2: 'Suite 400',
        city: 'Dallas',
        state: 'TX',
        zip: '75201',
        is_default: true,
        display_order: 1
    },
    {
        location_code: 'WAREHOUSE_OK',
        location_name: 'Oklahoma Warehouse',
        line1: '456 Industrial Pkwy',
        city: 'Oklahoma City',
        state: 'OK',
        zip: '73102',
        display_order: 2
    }
];
```

#### Frontend Dropdown
```html
<div class="col-md-6">
    <div class="card">
        <div class="card-header">
            <h4 class="card-title">
                <i class="ti ti-package-export me-1"></i>Return Address
            </h4>
        </div>
        <div class="card-body">
            <select class="form-select" id="returnAddressSelect">
                <option value="">Select return address...</option>
                <!-- Populated from return_addresses_config -->
            </select>
            
            <!-- Read-only display of selected address -->
            <div id="returnAddressDisplay" class="mt-2 p-2 bg-light rounded" style="display: none;">
                <small class="text-muted">
                    <div id="returnAddressText"></div>
                </small>
            </div>
        </div>
    </div>
</div>
```

### JSON Export/Import
```javascript
// app/routes/api.js

router.get('/api/return-addresses/export', (req, res) => {
    const addresses = db.prepare('SELECT * FROM return_addresses_config ORDER BY display_order').all();
    res.json(addresses);
});

router.post('/api/return-addresses/import', (req, res) => {
    const addresses = req.body;
    // Validate and insert
});
```

### Success Criteria
✅ Return addresses managed via database  
✅ Dropdown replaces individual field inputs  
✅ JSON export produces valid configuration file  
✅ JSON import validates and loads addresses  

---

## Phase 5: External System Integration (Future)

### The Vision: Universal Site Key

**Your `sites` table becomes the central hub** for ALL site-related data across the organization:

```text
                    ┌─────────────────────┐
                    │   sites (id=1)      │
                    │   STROUD_OKLAHOMA   │
                    └──────────┬──────────┘
                               │
        ┌──────────────────────┼──────────────────────┐
        │                      │                      │
    ┌───▼───┐            ┌────▼─────┐          ┌─────▼────┐
    │Tickets│            │Addresses │          │Devices   │
    └───┬───┘            └────┬─────┘          └─────┬────┘
        │                     │                       │
        ├─ HEX-1234          ├─ 123 Main St          ├─ Switch-01
        ├─ HEX-5678          ├─ 456 Oak Ave          ├─ Router-02
        └─ HEX-9012          └─ 789 Elm Rd           └─ Firewall-03
```

**Every module in HexTrackr** (and external systems) can:
1. Resolve their site code → `site_id`
2. Query for related data using that `site_id`
3. Aggregate metrics across all sources

**Example Queries After Full Implementation**:
```sql
-- "Show me everything for Stroud"
SELECT 
    s.display_name,
    COUNT(DISTINCT t.id) as ticket_count,
    COUNT(DISTINCT sah.id) as unique_addresses,
    COUNT(DISTINCT sd.id) as device_count,
    GROUP_CONCAT(DISTINCT sa.alias_value) as all_known_names
FROM sites s
LEFT JOIN tickets t ON t.site_id = s.id
LEFT JOIN site_address_history sah ON sah.site_id = s.id
LEFT JOIN site_devices sd ON sd.site_id = s.id
LEFT JOIN site_aliases sa ON sa.site_id = s.id
WHERE s.id = 1
GROUP BY s.id;

-- Result:
-- Stroud Data Center | 47 tickets | 8 addresses | 23 devices | STRO,STRD,STROUD,...
```

### NetBox Integration Example

#### New Table: NetBox Sites Cache
```sql
CREATE TABLE netbox_sites_cache (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    netbox_id INTEGER NOT NULL UNIQUE,
    site_id INTEGER,                        -- FK to sites.id (nullable until matched)
    netbox_name TEXT,
    netbox_slug TEXT,
    netbox_status TEXT,
    physical_address_line1 TEXT,
    physical_address_city TEXT,
    physical_address_state TEXT,
    physical_address_zip TEXT,
    latitude REAL,
    longitude REAL,
    last_synced DATETIME,
    sync_status TEXT,                       -- 'synced', 'conflict', 'unmapped'
    FOREIGN KEY (site_id) REFERENCES sites(id)
);
```

#### Sync Service
```javascript
// app/services/netboxSyncService.js

class NetBoxSyncService {
    async syncSites() {
        // 1. Fetch from NetBox API
        const netboxSites = await this.fetchNetBoxSites();
        
        // 2. Update cache table
        for (const nbSite of netboxSites) {
            await this.updateCache(nbSite);
        }
        
        // 3. Attempt auto-matching with existing sites
        await this.autoMatchSites();
    }
    
    async autoMatchSites() {
        // Fuzzy match NetBox slugs with site aliases
        // Create new site_aliases entries for matches
        // Flag conflicts for manual review
    }
}
```

### Success Criteria (Phase 5)
✅ NetBox sites cached locally  
✅ Auto-matching creates aliases with confidence scores  
✅ Conflicts flagged for manual review  
✅ Address data from NetBox populates history  

---

## Technical Considerations

### Performance

**Expected Scale**:
- Sites: ~100-500 records
- Site Aliases: ~500-2000 records (5-10 aliases per site)
- Address History: ~1000-10000 records over time
- Return Addresses: ~5-20 records

**Optimization**:
- Indexes on all FK and lookup columns
- `site_address_history.full_address` indexed for text search
- Consider SQLite FTS5 for fuzzy search if performance degrades
- `usage_count` desc index for fast top-N queries

### Data Integrity

**Constraints**:
- CASCADE deletes on site_id FKs (deleting site removes aliases/addresses)
- UNIQUE constraints on (source_system, alias_value) prevent duplicates
- NOT NULL on critical fields (line1, city, state, zip)

**Validation**:
- State codes: 2-letter uppercase (dropdown in UI)
- ZIP codes: Regex validation (5-digit or 5+4 format)
- Address normalization (trim, uppercase state, etc.)

### Migration Strategy

**Rollback Plan**:
- All migrations in transactions
- Backup database before Phase 2+ migrations
- Keep `tickets.site` and `tickets.location` text columns for backward compatibility
- `site_id` is nullable during transition period

**Zero-Downtime**:
- Phase 1 uses existing columns (no schema changes)
- Phase 2+ adds new tables without modifying tickets table initially
- `site_id` populated via background job, not blocking ticket saves

---

## Risk Assessment

| Risk | Impact | Mitigation |
|------|--------|------------|
| **Data duplication** (multiple canonical sites for same location) | Medium | Alias matching algorithm with confidence scores; manual review UI |
| **Address typos** create separate history records | Low | Fuzzy deduplication on save; "mark as duplicate" UI feature |
| **NetBox API changes** break sync | Medium | Version-locked API client; alerting on sync failures |
| **Performance degradation** with 10K+ addresses | Low | Indexed properly; pagination on history views; consider FTS5 |
| **User confusion** with alias system | Medium | Clear UI labels; "What is this?" tooltips; documentation |

---

## Success Metrics

### Phase 1
- [ ] 100% of ticket saves include shipping address data
- [ ] 0 reported data loss incidents
- [ ] Edit operations preserve all field values

### Phase 2
- [ ] 100% of tickets have valid `site_id`
- [ ] <1 second site resolution time
- [ ] 0 duplicate canonical sites

### Phase 3
- [ ] Address lookup modal loads in <500ms
- [ ] Top 3 addresses cover 80% of usage
- [ ] Users report faster ticket creation (UX survey)

### Phase 4
- [ ] Return address dropdown replaces manual entry
- [ ] 0 malformed return addresses in tickets

---

## Open Questions

1. **Address Verification**: Should we integrate USPS Address Validation API?
   - **Decision**: Phase 3 future enhancement, not MVP

2. **Bulk Import**: How to handle CSV import of 1000+ historical addresses?
   - **Decision**: Build admin tool in Phase 3.5

3. **Multi-tenancy**: Do different teams need isolated address databases?
   - **Decision**: Not needed now; revisit if >5 teams use system

4. **Geocoding**: Store lat/long for mapping features?
   - **Decision**: Add to NetBox integration (Phase 5)

---

## Timeline Summary

| Phase | Duration | Key Deliverables |
|-------|----------|------------------|
| **Phase 1** | 1 week | Existing fields wired to DB |
| **Phase 2** | 2-3 weeks | Site normalization + aliases |
| **Phase 2.5** | 1.5 days | Device-to-site intelligent mapping |
| **Phase 3** | 2-3 weeks | Address history + fuzzy search |
| **Phase 4** | 1 week | Return address management |
| **Phase 5** | 3-4 weeks | NetBox integration |
| **Total** | **10-13 weeks** | Full system operational |

---

## Next Steps

### Immediate (This Week)
1. ✅ Review and approve this plan
2. ⏳ Create Phase 1 implementation ticket (HEX-XXX)
3. ⏳ Set up feature branch: `feature/site-address-database`
4. ⏳ Modify `ticketService.js` and `tickets.js` per Phase 1 spec

### Week 2
1. Deploy Phase 1 to dev environment
2. User acceptance testing on ticket creation/editing
3. Begin Phase 2 database design review

---

## Appendix A: Example Data Flow

### Scenario: User Creates Replace Ticket

**Input**:
```javascript
{
    site: "STRO",
    location: "STROU",
    jobType: "Replace",
    shippingLine1: "123 Main St",
    shippingCity: "Stroud",
    shippingState: "OK",
    shippingZip: "74079"
}
```

**Processing** (Phase 2+):
1. Resolve `site_id`:
   - Lookup aliases: `STRO` (site) + `STROU` (location)
   - Find or create site: `STRO_STROU` → `site_id = 42`

2. Check address history:
   - Search `site_address_history` for matching address
   - Found: Increment `usage_count`, update `last_seen`
   - Not Found: Insert new record

3. Save ticket:
   - `tickets.site_id = 42`
   - `tickets.shipping_line1 = "123 Main St"`
   - ... etc.

**Output** (Database State):
```sql
-- sites table
INSERT INTO sites (id, canonical_name, display_name) 
VALUES (42, 'STRO_STROU', 'STRO - STROU');

-- site_aliases table
INSERT INTO site_aliases (site_id, source_system, alias_value) 
VALUES (42, 'hextrackr_site', 'STRO'),
       (42, 'hextrackr_location', 'STROU');

-- site_address_history table
INSERT INTO site_address_history (
    site_id, address_type, line1, city, state, zip, usage_count
) VALUES (42, 'shipping', '123 Main St', 'Stroud', 'OK', '74079', 1);

-- tickets table
INSERT INTO tickets (
    id, site, location, site_id, 
    shipping_line1, shipping_city, shipping_state, shipping_zip
) VALUES (
    '1729012345', 'STRO', 'STROU', 42,
    '123 Main St', 'Stroud', 'OK', '74079'
);
```

---

## Appendix B: SQL Queries Reference

### Common Queries

**Get site with all aliases**:
```sql
SELECT 
    s.id, s.canonical_name, s.display_name,
    GROUP_CONCAT(sa.alias_value || ' (' || sa.source_system || ')') as aliases
FROM sites s
LEFT JOIN site_aliases sa ON sa.site_id = s.id
WHERE s.canonical_name = 'STRO_STROU'
GROUP BY s.id;
```

**Top 10 most-used addresses for a site**:
```sql
SELECT line1, line2, city, state, zip, usage_count
FROM site_address_history
WHERE site_id = 42 AND address_type = 'shipping'
ORDER BY usage_count DESC, last_seen DESC
LIMIT 10;
```

**Find unmatched sites (no aliases)**:
```sql
SELECT s.*
FROM sites s
LEFT JOIN site_aliases sa ON sa.site_id = s.id
WHERE sa.id IS NULL;
```

**Address deduplication candidates**:
```sql
SELECT 
    sah1.id as id1, sah2.id as id2,
    sah1.line1, sah1.city, sah1.state,
    sah1.usage_count + sah2.usage_count as combined_usage
FROM site_address_history sah1
JOIN site_address_history sah2 ON sah1.site_id = sah2.site_id 
    AND sah1.id < sah2.id
WHERE sah1.line1 = sah2.line1 
  AND sah1.city = sah2.city
  AND sah1.state = sah2.state
ORDER BY combined_usage DESC;
```

---

## Document Control

**Version**: 1.0  
**Last Updated**: October 15, 2025  
**Author**: HexTrackr Development Team  
**Review Status**: Draft  
**Next Review**: Start of Phase 2  

**Change Log**:
- v1.0 (2025-10-15): Initial draft covering Phases 1-5

---
