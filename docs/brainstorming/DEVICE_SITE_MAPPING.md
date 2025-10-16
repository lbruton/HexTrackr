# Device-to-Site Intelligent Mapping System

**Feature**: Automatically resolve device hostnames to sites using learned patterns and historical data  
**Phase**: 2.5 (Bridge between Phase 2 and Phase 3)  
**Related**: SITE_ADDRESS_DATABASE_PLAN.md Phase 2

---

## Problem Statement

### Current Behavior (vulnerabilities.html)
```javascript
// When creating ticket from KEV dashboard:
hostname = "STRO-RTR-01"
site = hostname.substring(0, 4)      // "STRO" (80-90% accurate)
location = hostname.substring(0, 5)  // "STRO-" (requires manual correction)
```

**Issues**:
- ❌ Hardcoded substring lengths don't work for all naming conventions
- ❌ Different teams use different patterns (STRD-SW vs STROUD-RTR vs STR01)
- ❌ System doesn't learn from user corrections
- ❌ No feedback loop to improve accuracy over time

### Desired Behavior
```javascript
// Smart lookup with learning:
hostname = "STRO-RTR-01"
result = await deviceSiteLookup.resolveSite(hostname);
// Returns: {
//   site_id: 1,
//   site_code: "STRO",
//   location_code: "STRD",
//   confidence: 0.95,
//   source: "learned_pattern"
// }
```

**Benefits**:
- ✅ 95%+ accuracy using learned patterns
- ✅ Self-improving system (learns from corrections)
- ✅ Handles multiple naming conventions
- ✅ Provides confidence scores for manual review

---

## Architecture

### Database Schema

#### Table 1: device_site_mappings
```sql
CREATE TABLE device_site_mappings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    hostname TEXT NOT NULL UNIQUE,
    site_id INTEGER NOT NULL,
    confidence_score REAL DEFAULT 0.5,
    mapping_source TEXT NOT NULL,
    times_confirmed INTEGER DEFAULT 1,
    last_confirmed DATETIME DEFAULT CURRENT_TIMESTAMP,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    created_by TEXT,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_by TEXT,
    FOREIGN KEY (site_id) REFERENCES sites(id) ON DELETE CASCADE
);
```

**Purpose**: Cache of hostname → site_id mappings with usage tracking

#### Table 2: hostname_patterns
```sql
CREATE TABLE hostname_patterns (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    site_id INTEGER NOT NULL,
    pattern_type TEXT NOT NULL,
    pattern_value TEXT NOT NULL,
    confidence_score REAL DEFAULT 0.7,
    match_count INTEGER DEFAULT 0,
    last_matched DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (site_id) REFERENCES sites(id) ON DELETE CASCADE,
    UNIQUE(site_id, pattern_type, pattern_value)
);
```

**Purpose**: Learned patterns for fuzzy matching new hostnames

---

## Smart Lookup Algorithm

### Resolution Flow

```text
┌─────────────────────────┐
│ Hostname: "STRO-RTR-01" │
└────────────┬────────────┘
             │
             ▼
┌────────────────────────────┐
│ 1. Exact Match Lookup      │
│ Check device_site_mappings │
└────────────┬───────────────┘
             │
        Found? ────YES──> Return site_id (confidence: 1.0)
             │
             NO
             ▼
┌────────────────────────────┐
│ 2. Pattern Match           │
│ Check hostname_patterns    │
└────────────┬───────────────┘
             │
        Found? ────YES──> Return site_id (confidence: 0.7-0.9)
             │
             NO
             ▼
┌────────────────────────────┐
│ 3. Substring Fallback      │
│ Parse first 4-5 chars      │
│ Search site_aliases        │
└────────────┬───────────────┘
             │
        Found? ────YES──> Return site_id (confidence: 0.5)
             │
             NO
             ▼
┌────────────────────────────┐
│ 4. Return NULL             │
│ User must select manually  │
└────────────────────────────┘
```

---

## Service Implementation

### app/services/deviceSiteLookupService.js

```javascript
const { getSiteService } = require('./siteService');
const { getDatabase } = require('../config/database');

class DeviceSiteLookupService {
    constructor(db) {
        this.db = db;
        this.siteService = getSiteService(db);
    }

    /**
     * Resolve hostname to site with confidence scoring
     * 
     * @param {string} hostname - Device hostname
     * @returns {Promise<{site_id: number, site_code: string, location_code: string, confidence: number, source: string}>}
     */
    async resolveSite(hostname) {
        // Step 1: Exact match in mappings table
        const exactMatch = this.db.prepare(`
            SELECT 
                dsm.site_id,
                dsm.confidence_score,
                dsm.mapping_source,
                s.canonical_name,
                sa1.alias_value as site_code,
                sa2.alias_value as location_code
            FROM device_site_mappings dsm
            JOIN sites s ON s.id = dsm.site_id
            LEFT JOIN site_aliases sa1 ON sa1.site_id = s.id AND sa1.alias_type = 'site_code' AND sa1.is_primary = 1
            LEFT JOIN site_aliases sa2 ON sa2.site_id = s.id AND sa2.alias_type = 'location_code' AND sa2.is_primary = 1
            WHERE dsm.hostname = ?
        `).get(hostname);

        if (exactMatch) {
            // Update confirmation count
            this.db.prepare(`
                UPDATE device_site_mappings
                SET times_confirmed = times_confirmed + 1,
                    last_confirmed = CURRENT_TIMESTAMP
                WHERE hostname = ?
            `).run(hostname);

            return {
                site_id: exactMatch.site_id,
                site_code: exactMatch.site_code,
                location_code: exactMatch.location_code,
                confidence: 1.0,
                source: 'exact_match'
            };
        }

        // Step 2: Pattern matching
        const patternMatch = this.findBestPatternMatch(hostname);
        if (patternMatch) {
            // Create mapping for future use
            this.createMapping(hostname, patternMatch.site_id, 0.8, 'pattern_match');
            
            return {
                site_id: patternMatch.site_id,
                site_code: patternMatch.site_code,
                location_code: patternMatch.location_code,
                confidence: patternMatch.confidence,
                source: 'pattern_match'
            };
        }

        // Step 3: Fallback to substring parsing
        const substringMatch = this.parseHostnameSubstring(hostname);
        if (substringMatch) {
            return {
                site_id: substringMatch.site_id,
                site_code: substringMatch.site_code,
                location_code: substringMatch.location_code,
                confidence: 0.5,
                source: 'substring_parse'
            };
        }

        // Step 4: No match found
        return null;
    }

    /**
     * Find best matching pattern for hostname
     */
    findBestPatternMatch(hostname) {
        const patterns = this.db.prepare(`
            SELECT 
                hp.site_id,
                hp.pattern_type,
                hp.pattern_value,
                hp.confidence_score,
                s.canonical_name,
                sa1.alias_value as site_code,
                sa2.alias_value as location_code
            FROM hostname_patterns hp
            JOIN sites s ON s.id = hp.site_id
            LEFT JOIN site_aliases sa1 ON sa1.site_id = s.id AND sa1.alias_type = 'site_code' AND sa1.is_primary = 1
            LEFT JOIN site_aliases sa2 ON sa2.site_id = s.id AND sa2.alias_type = 'location_code' AND sa2.is_primary = 1
            ORDER BY hp.confidence_score DESC
        `).all();

        for (const pattern of patterns) {
            let matches = false;

            switch (pattern.pattern_type) {
                case 'prefix':
                    matches = hostname.startsWith(pattern.pattern_value);
                    break;
                case 'contains':
                    matches = hostname.toLowerCase().includes(pattern.pattern_value.toLowerCase());
                    break;
                case 'regex':
                    try {
                        const regex = new RegExp(pattern.pattern_value, 'i');
                        matches = regex.test(hostname);
                    } catch (e) {
                        console.error(`Invalid regex pattern: ${pattern.pattern_value}`);
                    }
                    break;
            }

            if (matches) {
                // Update pattern stats
                this.db.prepare(`
                    UPDATE hostname_patterns
                    SET match_count = match_count + 1,
                        last_matched = CURRENT_TIMESTAMP
                    WHERE id = ?
                `).run(pattern.id);

                return {
                    site_id: pattern.site_id,
                    site_code: pattern.site_code,
                    location_code: pattern.location_code,
                    confidence: pattern.confidence_score
                };
            }
        }

        return null;
    }

    /**
     * Fallback: Parse hostname using substring rules
     */
    parseHostnameSubstring(hostname) {
        // Current logic: first 4 chars for site, first 5 for location
        const siteGuess = hostname.substring(0, 4).toUpperCase();
        const locationGuess = hostname.substring(0, 5).toUpperCase();

        // Try to find matching site via aliases
        const site = this.db.prepare(`
            SELECT DISTINCT s.id, s.canonical_name,
                   sa1.alias_value as site_code,
                   sa2.alias_value as location_code
            FROM sites s
            JOIN site_aliases sa ON sa.site_id = s.id
            LEFT JOIN site_aliases sa1 ON sa1.site_id = s.id AND sa1.alias_type = 'site_code' AND sa1.is_primary = 1
            LEFT JOIN site_aliases sa2 ON sa2.site_id = s.id AND sa2.alias_type = 'location_code' AND sa2.is_primary = 1
            WHERE sa.alias_value IN (?, ?)
            LIMIT 1
        `).get(siteGuess, locationGuess);

        if (site) {
            // Create low-confidence mapping
            this.createMapping(hostname, site.id, 0.5, 'substring_parse');
            return {
                site_id: site.id,
                site_code: site.site_code || siteGuess,
                location_code: site.location_code || locationGuess
            };
        }

        return null;
    }

    /**
     * Create or update device mapping
     */
    createMapping(hostname, siteId, confidence, source) {
        const existing = this.db.prepare(`
            SELECT id FROM device_site_mappings WHERE hostname = ?
        `).get(hostname);

        if (existing) {
            this.db.prepare(`
                UPDATE device_site_mappings
                SET site_id = ?,
                    confidence_score = ?,
                    mapping_source = ?,
                    times_confirmed = times_confirmed + 1,
                    last_confirmed = CURRENT_TIMESTAMP,
                    updated_at = CURRENT_TIMESTAMP
                WHERE hostname = ?
            `).run(siteId, confidence, source, hostname);
        } else {
            this.db.prepare(`
                INSERT INTO device_site_mappings (
                    hostname, site_id, confidence_score, mapping_source, created_by
                ) VALUES (?, ?, ?, ?, 'auto_created')
            `).run(hostname, siteId, confidence, source);
        }
    }

    /**
     * User confirms or corrects a mapping
     * This is THE LEARNING MECHANISM
     */
    confirmMapping(hostname, siteId, userCorrected = false) {
        const confidence = userCorrected ? 1.0 : 0.9;
        const source = userCorrected ? 'user_override' : 'user_confirmed';

        this.createMapping(hostname, siteId, confidence, source);

        // If user corrected, learn a new pattern
        if (userCorrected) {
            this.learnPattern(hostname, siteId);
        }
    }

    /**
     * Extract and save pattern from user-corrected hostname
     */
    learnPattern(hostname, siteId) {
        // Extract common prefix patterns
        const parts = hostname.split(/[-_]/);
        if (parts.length > 0) {
            const prefix = parts[0];
            
            // Save prefix pattern
            this.db.prepare(`
                INSERT INTO hostname_patterns (site_id, pattern_type, pattern_value, confidence_score)
                VALUES (?, 'prefix', ?, 0.7)
                ON CONFLICT(site_id, pattern_type, pattern_value) DO UPDATE
                SET match_count = match_count + 1,
                    confidence_score = MIN(0.95, confidence_score + 0.05)
            `).run(siteId, prefix);
        }
    }

    /**
     * Get all mappings for a site (for review/debugging)
     */
    getSiteMappings(siteId) {
        return this.db.prepare(`
            SELECT hostname, confidence_score, mapping_source, times_confirmed, last_confirmed
            FROM device_site_mappings
            WHERE site_id = ?
            ORDER BY confidence_score DESC, times_confirmed DESC
        `).all(siteId);
    }

    /**
     * Get learned patterns for a site
     */
    getSitePatterns(siteId) {
        return this.db.prepare(`
            SELECT pattern_type, pattern_value, confidence_score, match_count, last_matched
            FROM hostname_patterns
            WHERE site_id = ?
            ORDER BY confidence_score DESC, match_count DESC
        `).all(siteId);
    }
}

module.exports = DeviceSiteLookupService;
```

---

## Frontend Integration

### Modified vulnerabilities.js (KEV Dashboard)

```javascript
/**
 * Enhanced: Create ticket from vulnerability data
 * NOW: Uses smart site lookup instead of substring parsing
 */
async function createTicketFromVulnerability(vulnData) {
    const hostname = vulnData.hostname;
    
    // Call smart lookup service
    const siteResolution = await fetch(`/api/devices/resolve-site?hostname=${encodeURIComponent(hostname)}`)
        .then(r => r.json());
    
    // Populate modal with smart suggestions
    if (siteResolution && siteResolution.site_code) {
        document.getElementById("site").value = siteResolution.site_code;
        document.getElementById("location").value = siteResolution.location_code;
        
        // Show confidence indicator
        const confidenceBadge = document.getElementById("siteConfidenceBadge");
        if (siteResolution.confidence >= 0.9) {
            confidenceBadge.className = "badge bg-success";
            confidenceBadge.textContent = `High confidence (${Math.round(siteResolution.confidence * 100)}%)`;
        } else if (siteResolution.confidence >= 0.7) {
            confidenceBadge.className = "badge bg-warning";
            confidenceBadge.textContent = `Medium confidence (${Math.round(siteResolution.confidence * 100)}%) - Please verify`;
        } else {
            confidenceBadge.className = "badge bg-secondary";
            confidenceBadge.textContent = `Low confidence (${Math.round(siteResolution.confidence * 100)}%) - May need correction`;
        }
    } else {
        // Fallback to manual entry
        document.getElementById("site").value = "";
        document.getElementById("location").value = "";
        document.getElementById("siteConfidenceBadge").textContent = "Unable to auto-detect - Please enter manually";
    }
    
    // Open ticket modal
    openTicketModal(vulnData);
}

/**
 * When ticket is saved, confirm the mapping
 */
async function saveTicket(ticketData) {
    // ... existing save logic ...
    
    // If this ticket has devices, confirm the site mapping
    if (ticketData.devices && ticketData.devices.length > 0) {
        const siteId = ticketData.site_id;
        const userModifiedSite = checkIfUserChangedSiteFields();
        
        for (const device of ticketData.devices) {
            await fetch('/api/devices/confirm-mapping', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({
                    hostname: device.hostname,
                    site_id: siteId,
                    user_corrected: userModifiedSite
                })
            });
        }
    }
}

/**
 * Detect if user manually changed site/location fields
 */
function checkIfUserChangedSiteFields() {
    const originalSite = document.getElementById("site").dataset.originalValue;
    const currentSite = document.getElementById("site").value;
    return originalSite !== currentSite;
}
```

---

## API Endpoints

### app/routes/api.js

```javascript
// Resolve hostname to site
router.get('/api/devices/resolve-site', async (req, res) => {
    try {
        const { hostname } = req.query;
        const deviceLookup = new DeviceSiteLookupService(db);
        const result = await deviceLookup.resolveSite(hostname);
        res.json(result || {site_code: null, location_code: null, confidence: 0});
    } catch (error) {
        console.error('Error resolving site:', error);
        res.status(500).json({error: error.message});
    }
});

// Confirm or correct a mapping (learning endpoint)
router.post('/api/devices/confirm-mapping', async (req, res) => {
    try {
        const { hostname, site_id, user_corrected } = req.body;
        const deviceLookup = new DeviceSiteLookupService(db);
        deviceLookup.confirmMapping(hostname, site_id, user_corrected);
        res.json({success: true});
    } catch (error) {
        console.error('Error confirming mapping:', error);
        res.status(500).json({error: error.message});
    }
});

// Get mappings for a site (admin/debug)
router.get('/api/sites/:siteId/device-mappings', async (req, res) => {
    try {
        const { siteId } = req.params;
        const deviceLookup = new DeviceSiteLookupService(db);
        const mappings = deviceLookup.getSiteMappings(siteId);
        const patterns = deviceLookup.getSitePatterns(siteId);
        res.json({ mappings, patterns });
    } catch (error) {
        console.error('Error fetching mappings:', error);
        res.status(500).json({error: error.message});
    }
});
```

---

## Learning Behavior Examples

### Scenario 1: First Time Device
```text
User creates ticket from KEV dashboard
Hostname: "STRO-RTR-01"

System:
1. No exact match in device_site_mappings
2. No pattern match in hostname_patterns
3. Substring parse: "STRO" → Finds site_id = 1
4. Returns: {site_id: 1, site_code: "STRO", confidence: 0.5}
5. User ACCEPTS suggestion → Confirms mapping
6. Creates: device_site_mappings entry with confidence = 0.9
7. Learns: hostname_patterns entry with pattern "STRO" (prefix)
```

### Scenario 2: Second Device (Learning Applied)
```text
User creates ticket from KEV dashboard
Hostname: "STRO-SW-02"

System:
1. No exact match (different hostname)
2. PATTERN MATCH: "STRO" prefix → site_id = 1
3. Returns: {site_id: 1, site_code: "STRO", confidence: 0.7}
4. User ACCEPTS → Confirms mapping
5. Creates: device_site_mappings entry
6. Updates: hostname_patterns "STRO" confidence += 0.05 → 0.75
```

### Scenario 3: User Correction (Teaching the System)
```text
User creates ticket from KEV dashboard
Hostname: "STROUD-FW-01"

System:
1. No exact match
2. Pattern match: "STRO" prefix? NO (doesn't start with "STRO")
3. Substring parse: "STRO" → Returns site_id = 1
4. Returns: {site_id: 1, confidence: 0.5}

User: MANUALLY CHANGES to site_id = 2 (different site)

System:
5. Detects user_corrected = true
6. Creates: device_site_mappings with confidence = 1.0
7. Learns: NEW pattern "STROUD" (prefix) for site_id = 2
8. Future "STROUD-*" devices → Auto-resolve to site_id = 2
```

---

## Migration Strategy

### Step 1: Database Migration
```sql
-- migrations/003_device_site_mappings.sql
BEGIN TRANSACTION;

CREATE TABLE device_site_mappings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    hostname TEXT NOT NULL UNIQUE,
    site_id INTEGER NOT NULL,
    confidence_score REAL DEFAULT 0.5,
    mapping_source TEXT NOT NULL,
    times_confirmed INTEGER DEFAULT 1,
    last_confirmed DATETIME DEFAULT CURRENT_TIMESTAMP,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    created_by TEXT,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_by TEXT,
    FOREIGN KEY (site_id) REFERENCES sites(id) ON DELETE CASCADE
);

CREATE TABLE hostname_patterns (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    site_id INTEGER NOT NULL,
    pattern_type TEXT NOT NULL,
    pattern_value TEXT NOT NULL,
    confidence_score REAL DEFAULT 0.7,
    match_count INTEGER DEFAULT 0,
    last_matched DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (site_id) REFERENCES sites(id) ON DELETE CASCADE,
    UNIQUE(site_id, pattern_type, pattern_value)
);

CREATE INDEX idx_device_hostname ON device_site_mappings(hostname);
CREATE INDEX idx_device_site ON device_site_mappings(site_id);
CREATE INDEX idx_hostname_patterns_site ON hostname_patterns(site_id);

COMMIT;
```

### Step 2: Backfill Existing Data
```javascript
// scripts/backfill-device-mappings.js
// Extract devices from existing tickets and create initial mappings

const tickets = db.prepare(`
    SELECT DISTINCT devices, site_id 
    FROM tickets 
    WHERE devices IS NOT NULL AND site_id IS NOT NULL
`).all();

for (const ticket of tickets) {
    const devices = JSON.parse(ticket.devices);
    for (const device of devices) {
        // Create mapping
        db.prepare(`
            INSERT INTO device_site_mappings (hostname, site_id, confidence_score, mapping_source)
            VALUES (?, ?, 0.8, 'ticket_backfill')
            ON CONFLICT(hostname) DO UPDATE
            SET times_confirmed = times_confirmed + 1
        `).run(device.hostname, ticket.site_id);
    }
}
```

---

## Success Metrics

### Before Enhancement
- **Accuracy**: 80-90% (substring parsing)
- **Manual corrections**: 10-20% of tickets
- **Learning**: None (static algorithm)

### After Enhancement
- **Accuracy**: 95%+ (learned patterns)
- **Manual corrections**: <5% of tickets
- **Learning**: Improves over time
- **User confidence**: Visual indicators show reliability

---

## Future Enhancements

### Phase 2.6: Advanced Pattern Learning
- Machine learning-based hostname parsing
- Multi-pattern matching (combine prefix + regex)
- Conflict resolution (when patterns overlap)

### Phase 2.7: Device Inventory Integration
- Sync with NetBox device inventory
- Auto-discover new devices
- Validate hostname conventions

### Phase 2.8: Admin UI
- Review and approve learned patterns
- Manually create/edit patterns
- View mapping statistics per site
- Export/import pattern configurations

---

## Integration Timeline

| Week | Task |
|------|------|
| Week 1 | Create database tables, write service layer |
| Week 2 | Add API endpoints, integrate with vulnerabilities.js |
| Week 3 | Backfill existing data, test learning behavior |
| Week 4 | User acceptance testing, confidence tuning |

---

## Appendix: Real-World Pattern Examples

### Team 1 Patterns (Prefix-based)
```
STROUD-RTR-01 → site_id: 1
STROUD-RTR-02 → site_id: 1
STROUD-SW-01  → site_id: 1
Pattern learned: "STROUD" (prefix) → confidence 0.85
```

### Team 2 Patterns (Abbreviated)
```
STRO-FW-01 → site_id: 1
STRO-FW-02 → site_id: 1
STRO-AP-01 → site_id: 1
Pattern learned: "STRO" (prefix) → confidence 0.80
```

### Team 3 Patterns (Location-first)
```
STRD-ROUTER-01 → site_id: 1
STRD-SWITCH-01 → site_id: 1
Pattern learned: "STRD" (prefix) → confidence 0.75
```

### All Patterns Resolve to Same Site
```sql
SELECT * FROM hostname_patterns WHERE site_id = 1;

| pattern_type | pattern_value | confidence_score | match_count |
|--------------|---------------|------------------|-------------|
| prefix       | STROUD        | 0.85             | 15          |
| prefix       | STRO          | 0.80             | 12          |
| prefix       | STRD          | 0.75             | 8           |
```

**Result**: Any device starting with STROUD, STRO, or STRD → Auto-resolves to site_id = 1 ✅
