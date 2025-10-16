# Site Normalization System - Complete Architecture

**Date**: October 15, 2025  
**Related Docs**: 
- `/SITE_ADDRESS_DATABASE_PLAN.md` (Master plan)
- `/docs/implementations/DEVICE_SITE_MAPPING.md` (Device intelligence)

---

## Executive Summary

This document visualizes the complete site normalization system, showing how all components work together to create a unified, self-learning data layer for HexTrackr.

---

## System Architecture Diagram

```text
┌─────────────────────────────────────────────────────────────────────┐
│                         USER INTERACTIONS                            │
└─────────────────┬───────────────────────────────┬───────────────────┘
                  │                               │
      ┌───────────▼──────────┐       ┌───────────▼──────────┐
      │ KEV Dashboard        │       │ Ticket Modal         │
      │ (vulnerabilities.js) │       │ (tickets.js)         │
      └───────────┬──────────┘       └───────────┬──────────┘
                  │                               │
                  │ 1. Create ticket from vuln    │ 2. Manual ticket
                  │    hostname: "STRO-RTR-01"    │    site/location entry
                  │                               │
                  ▼                               ▼
         ┌────────────────────────────────────────────────┐
         │     INTELLIGENT RESOLUTION LAYER               │
         │  ┌──────────────────────────────────────────┐  │
         │  │  DeviceSiteLookupService                 │  │
         │  │  - Exact match lookup                    │  │
         │  │  - Pattern matching                      │  │
         │  │  - Substring fallback                    │  │
         │  │  - Learning from corrections             │  │
         │  └──────────────────────────────────────────┘  │
         └───────────────────┬────────────────────────────┘
                             │
                             │ Resolves to site_id
                             ▼
         ┌─────────────────────────────────────────────────────┐
         │              CENTRAL SITE AUTHORITY                  │
         │  ┌───────────────────────────────────────────────┐  │
         │  │            sites table (Master)               │  │
         │  │  ┌─────────────────────────────────────────┐  │  │
         │  │  │ id: 1                                   │  │  │
         │  │  │ canonical_name: "STROUD_OKLAHOMA"       │  │  │
         │  │  │ display_name: "Stroud DC - Oklahoma"    │  │  │
         │  │  └─────────────────────────────────────────┘  │  │
         │  └──────────────────┬────────────────────────────┘  │
         │                     │                               │
         │      ┌──────────────┼──────────────┐                │
         │      │              │              │                │
         │  ┌───▼────┐    ┌───▼────┐    ┌───▼────┐           │
         │  │Team1:  │    │Team2:  │    │Team3:  │           │
         │  │STROUD  │    │STRO    │    │STRD    │           │
         │  │STRD    │    │STRD    │    │STROUD  │           │
         │  └────────┘    └────────┘    └────────┘           │
         │          site_aliases table                        │
         └────────────────────┬───────────────────────────────┘
                              │
              ┌───────────────┼───────────────┐
              │               │               │
              ▼               ▼               ▼
    ┌──────────────┐  ┌──────────────┐  ┌──────────────┐
    │   Tickets    │  │  Addresses   │  │   Devices    │
    │   (site_id)  │  │  (site_id)   │  │  (site_id)   │
    └──────────────┘  └──────────────┘  └──────────────┘
         │                   │                   │
         │                   │                   │
    ┌────▼────┐         ┌───▼────┐         ┌───▼────┐
    │HEX-1234 │         │123 Main│         │RTR-01  │
    │HEX-5678 │         │456 Oak │         │SW-02   │
    │HEX-9012 │         │789 Elm │         │FW-03   │
    └─────────┘         └────────┘         └────────┘
```

---

## Data Flow: Creating Ticket from KEV Dashboard

### Step-by-Step Process

```text
1. User clicks "Create Ticket" on vulnerability
   Hostname: "STRO-RTR-01"
   
   ┌─────────────────────────┐
   │ KEV Dashboard           │
   │ Device: STRO-RTR-01     │
   │ CVE-2024-1234           │
   └─────────┬───────────────┘
             │
             │ calls deviceLookup.resolveSite()
             ▼
   ┌─────────────────────────────────────────┐
   │ DeviceSiteLookupService                 │
   │                                         │
   │ 1. Check device_site_mappings           │
   │    WHERE hostname = 'STRO-RTR-01'       │
   │    ❌ Not found (first time)             │
   │                                         │
   │ 2. Check hostname_patterns              │
   │    WHERE pattern = 'STRO' (prefix)      │
   │    ✅ Found! site_id = 1                 │
   │                                         │
   │ 3. Create mapping cache                 │
   │    INSERT device_site_mappings          │
   │    (hostname, site_id, confidence=0.8)  │
   └─────────┬───────────────────────────────┘
             │
             │ Returns: {site_id: 1, site_code: "STRO", 
             │           location_code: "STRD", confidence: 0.8}
             ▼
   ┌─────────────────────────┐
   │ Ticket Modal            │
   │ Site: STRO   [filled]   │
   │ Location: STRD [filled] │
   │ 🟡 Medium confidence     │
   └─────────┬───────────────┘
             │
             │ User accepts, clicks Save
             ▼
   ┌─────────────────────────────────────────┐
   │ ticketService.createTicket()            │
   │                                         │
   │ 1. Resolve site_id via siteService      │
   │    (STRO + STRD) → site_id = 1          │
   │                                         │
   │ 2. INSERT INTO tickets                  │
   │    site_id = 1                          │
   │    shipping_line1 = "123 Main St"       │
   │    ...                                  │
   │                                         │
   │ 3. Record address history               │
   │    INSERT site_address_history          │
   │    site_id = 1, line1 = "123 Main St"   │
   │                                         │
   │ 4. Confirm device mapping (LEARNING!)   │
   │    UPDATE device_site_mappings          │
   │    times_confirmed++, confidence=0.9    │
   │                                         │
   │ 5. Update pattern stats                 │
   │    UPDATE hostname_patterns             │
   │    match_count++, confidence += 0.05    │
   └─────────────────────────────────────────┘
```

---

## Learning Mechanism (The Magic)

### Example: System Gets Smarter Over Time

#### Week 1: Initial State
```text
User creates ticket from "STRO-RTR-01"

┌─────────────────────────┐
│ hostname_patterns       │ (Empty - system doesn't know patterns yet)
└─────────────────────────┘

System falls back to substring parsing:
  "STRO" (first 4 chars) → Searches site_aliases → Finds site_id = 1

Result: Returns site_id = 1, confidence = 0.5 (low)

User ACCEPTS suggestion → System LEARNS:
┌─────────────────────────────────────────────┐
│ hostname_patterns                           │
│ site_id: 1, pattern: "STRO", confidence: 0.7│ ← NEW PATTERN!
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│ device_site_mappings                            │
│ hostname: "STRO-RTR-01", site_id: 1, conf: 0.9  │ ← CACHED!
└─────────────────────────────────────────────────┘
```

#### Week 2: Second Device (Pattern Applied)
```text
User creates ticket from "STRO-SW-02"

┌─────────────────────────┐
│ hostname_patterns       │
│ "STRO" (prefix) exists! │ ✅
└─────────────────────────┘

System: Pattern match! "STRO" → site_id = 1
Result: Returns site_id = 1, confidence = 0.7 (medium)

User ACCEPTS → System REINFORCES:
┌─────────────────────────────────────────────┐
│ hostname_patterns                           │
│ "STRO": confidence 0.7 → 0.75 (improved!)   │ ← LEARNING!
│         match_count 1 → 2                   │
└─────────────────────────────────────────────┘
```

#### Week 4: High Confidence State
```text
User creates ticket from "STRO-FW-05"

┌─────────────────────────────────────────────┐
│ hostname_patterns                           │
│ "STRO": confidence = 0.85, match_count = 15 │ ✅ HIGH CONFIDENCE
└─────────────────────────────────────────────┘

System: Pattern match! "STRO" → site_id = 1
Result: Returns site_id = 1, confidence = 0.85 (high)

User sees: 🟢 "High confidence (85%)" badge
User ACCEPTS without thinking → Saves 30 seconds
```

---

## User Correction Flow (Teaching the System)

### Scenario: System Guesses Wrong

```text
1. User creates ticket from "STROUD-FW-01"
   
   System checks patterns:
   - "STRO" prefix? NO (doesn't start with "STRO")
   - Falls back to substring: "STRO" → site_id = 1
   - Returns: confidence = 0.5 (low)
   
   ┌─────────────────────────┐
   │ Ticket Modal            │
   │ Site: STRO   [filled]   │ ← System's guess
   │ Location: STRD [filled] │
   │ 🔴 Low confidence (50%)  │
   └─────────────────────────┘

2. User CHANGES to:
   │ Site: STRD   [changed]  │ ← User knows better
   │ Location: STROUD [chg]  │
   
3. User clicks Save

4. System detects user_corrected = true

5. Learning triggers:
   
   ┌─────────────────────────────────────────────┐
   │ device_site_mappings                        │
   │ hostname: "STROUD-FW-01"                    │
   │ site_id: 2 (user's choice)                  │
   │ confidence: 1.0 (user override = truth!)    │
   │ mapping_source: "user_override"             │
   └─────────────────────────────────────────────┘
   
   ┌─────────────────────────────────────────────┐
   │ hostname_patterns (NEW PATTERN!)            │
   │ site_id: 2                                  │
   │ pattern: "STROUD" (extracted from hostname) │
   │ confidence: 0.7                             │
   └─────────────────────────────────────────────┘

6. NEXT TIME user creates ticket from "STROUD-SW-01":
   
   System: Pattern match! "STROUD" → site_id = 2
   Result: Auto-fills correctly! User saved from manual correction!
```

---

## Multi-Team Convergence

### How Different Teams Use Different Codes for Same Site

```text
┌────────────────────────────────────────────────────────────┐
│                  sites table (ONE RECORD)                  │
│  id: 1                                                     │
│  canonical_name: "STROUD_OKLAHOMA"                         │
│  display_name: "Stroud Data Center - Oklahoma"            │
└──────────────────────────┬─────────────────────────────────┘
                           │
        ┌──────────────────┼──────────────────┐
        │                  │                  │
        ▼                  ▼                  ▼
┌──────────────┐   ┌──────────────┐   ┌──────────────┐
│ Team 1 Uses: │   │ Team 2 Uses: │   │ Team 3 Uses: │
│ - STROUD     │   │ - STRO       │   │ - STRD       │
│ - STRD       │   │ - STRD       │   │ - STROUD     │
└──────────────┘   └──────────────┘   └──────────────┘
        │                  │                  │
        └──────────────────┼──────────────────┘
                           │
                  ALL RESOLVE TO site_id = 1
                           │
        ┌──────────────────┴──────────────────┐
        │                                     │
        ▼                                     ▼
┌───────────────────┐              ┌───────────────────┐
│ Team 1's Tickets  │              │ Team 2's Tickets  │
│ - HEX-1001        │              │ - HEX-2001        │
│ - HEX-1002        │              │ - HEX-2002        │
└───────────────────┘              └───────────────────┘
        │                                     │
        └─────────────────┬───────────────────┘
                          │
        ALL SHARE THE SAME ADDRESS HISTORY
                          │
                          ▼
        ┌─────────────────────────────────────┐
        │  site_address_history (site_id = 1) │
        │  - 123 Main St, Stroud, OK (used 8x)│
        │  - 456 Oak Ave, Stroud, OK (used 3x)│
        │  - 789 Elm Rd, Stroud, OK (used 1x) │
        └─────────────────────────────────────┘
```

**Result**: When Team 3 creates a ticket, they see address history from Team 1 and Team 2!

---

## Tables and Their Relationships

### Core Tables

```text
┌─────────────────────────────────────────────────────────────────┐
│                          sites (HUB)                            │
│  - id (PK)                                                      │
│  - canonical_name (UNIQUE)                                      │
│  - display_name                                                 │
└────────────────────────────┬────────────────────────────────────┘
                             │ (One-to-Many)
        ┌────────────────────┼────────────────────┐
        │                    │                    │
        ▼                    ▼                    ▼
┌──────────────┐   ┌──────────────────┐   ┌──────────────────┐
│site_aliases  │   │site_address_hist │   │device_site_map   │
│- site_id (FK)│   │- site_id (FK)    │   │- site_id (FK)    │
│- alias_value │   │- line1, city, zip│   │- hostname        │
│- source_sys  │   │- usage_count     │   │- confidence      │
└──────────────┘   └──────────────────┘   └──────────────────┘
        │                    │                    │
        │                    │                    │
┌───────▼─────────────────────▼────────────────────▼──────────┐
│                        tickets                              │
│  - site_id (FK)                                             │
│  - shipping_line1, shipping_city, shipping_state, ...       │
│  - devices (JSON array of hostnames)                        │
└─────────────────────────────────────────────────────────────┘
```

### Lookup Tables (Intelligence Layer)

```text
┌──────────────────────────────────────────────────────────────┐
│               device_site_mappings (CACHE)                   │
│  Purpose: Fast hostname → site_id lookup                     │
│  Updates: On every ticket save (learning)                    │
│  Confidence: Increases with confirmations                    │
└──────────────────────────────────────────────────────────────┘
                             │
                             │ feeds data to
                             ▼
┌──────────────────────────────────────────────────────────────┐
│              hostname_patterns (LEARNING)                    │
│  Purpose: Extract patterns from hostnames                    │
│  Updates: When user corrects a suggestion                    │
│  Confidence: Increases with successful matches               │
└──────────────────────────────────────────────────────────────┘
```

---

## Performance Characteristics

### Lookup Speed

```text
Query Type                Time       Notes
─────────────────────────────────────────────────────────────
Exact hostname match      <1ms       Indexed lookup
Pattern match (prefix)    <5ms       Indexed regex scan
Substring fallback        <10ms      Table scan on aliases
Full resolution           <15ms      Worst case (no cache)
```

### Scale Estimates

```text
Table                  Expected Size    Index Size
────────────────────────────────────────────────────
sites                  100-500 rows     <1 KB
site_aliases           500-2000 rows    <10 KB
device_site_mappings   1K-10K rows      <100 KB
hostname_patterns      100-500 rows     <5 KB
site_address_history   1K-10K rows      <100 KB
```

**SQLite handles this easily** - no performance concerns.

---

## Future Integration Points

### NetBox (External CMDB)

```text
┌─────────────────────────┐
│ NetBox API              │
│ GET /dcim/sites/        │
└────────────┬────────────┘
             │
             │ Sync Service
             ▼
┌─────────────────────────────────┐
│ netbox_sites_cache              │
│ - netbox_id                     │
│ - site_id (FK to sites)         │
│ - netbox_slug                   │
│ - physical_address              │
└────────────┬────────────────────┘
             │
             │ Auto-match via fuzzy search
             ▼
┌─────────────────────────────────┐
│ site_aliases                    │
│ NEW: source_system = 'netbox'   │
│      alias_value = netbox_slug  │
└─────────────────────────────────┘
```

Now devices in NetBox automatically map to HexTrackr sites!

### IP Address Management (IPAM)

```text
┌─────────────────────────────────┐
│ site_networks (NEW)             │
│ - site_id (FK)                  │
│ - network_cidr (e.g. 10.45.0/16)│
│ - vlan_id                       │
└─────────────────────────────────┘

Query: "Show me all networks at STRO"
→ Resolves: STRO → site_id = 1
→ Returns: All site_networks WHERE site_id = 1
```

### Device Inventory

```text
┌─────────────────────────────────┐
│ site_devices (NEW)              │
│ - site_id (FK)                  │
│ - hostname                      │
│ - device_type                   │
│ - serial_number                 │
└─────────────────────────────────┘

Query: "Show me all devices at Stroud"
→ Resolves: Stroud → site_id = 1
→ Returns: All site_devices WHERE site_id = 1
```

---

## Benefits Summary

### For Users
- ✅ **95%+ auto-fill accuracy** (from 80-90%)
- ✅ **Faster ticket creation** (30-60 seconds saved per ticket)
- ✅ **Shared knowledge** across teams (address history)
- ✅ **Visual confidence indicators** (know when to verify)
- ✅ **Self-correcting** (learns from mistakes)

### For Administrators
- ✅ **No duplicate sites** (alias system prevents)
- ✅ **Multi-source integration** (NetBox, ServiceNow, etc.)
- ✅ **Audit trail** (who created what, when)
- ✅ **Pattern analytics** (see what naming conventions exist)
- ✅ **Scalable architecture** (add new data types easily)

### For Developers
- ✅ **Clean data model** (normalized, relational)
- ✅ **Performance optimized** (indexed lookups)
- ✅ **Extensible** (hub-and-spoke pattern)
- ✅ **Self-documenting** (confidence scores show reliability)
- ✅ **Testable** (clear input/output expectations)

---

## Conclusion

This system transforms HexTrackr from a **data entry tool** into an **intelligent assistant**:

**Before**: "I need to manually parse hostnames and guess site codes"  
**After**: "The system learns from my team's behavior and auto-fills correctly"

**Before**: "Each team maintains separate address databases"  
**After**: "Everyone shares the same address history via site aliases"

**Before**: "Adding NetBox integration means rewriting everything"  
**After**: "Just add NetBox aliases, everything else works automatically"

The `sites` table is the foundation that makes all of this possible. 🎯
