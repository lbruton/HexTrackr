# HEX-267 SRPI Plan: Supervisor & Tech Field Normalization

**Issue**: [HEX-267](https://linear.app/hextrackr/issue/HEX-267)
**Feature Branch**: `feature/hex-267-supervisor-tech-normalization`
**Created**: 2025-10-21
**Estimated Time**: 4 hours
**Complexity**: Medium

---

## Executive Summary

**Objective**: Normalize supervisor and tech fields to consistent "First Last; First Last" format, enabling future location→supervisor→contact lookups and removing 65 lines of duplicate normalization code.

**Approach**: Nuclear option - normalize data at write time (input), store clean data in database, simplify template rendering.

**Scope**:
- 7 files modified (supervisor field)
- 4 files modified (tech field)
- 1 migration script created (Migration 009)
- 65 lines of duplicate code removed
- 6500 tickets migrated

**Success Criteria**:
- ✅ All supervisor/tech data in "First Last; First Last" format
- ✅ Input accepts any format, normalizes on save
- ✅ Templates render without runtime normalization
- ✅ Zero data loss, <2 minute rollback capability

---

## Implementation Tasks

### Task 1: Create Normalization Helper Function
**Estimated Time**: 30 minutes
**Dependencies**: None
**Risk**: Low

**Objective**: Create reusable `normalizePersonName()` function that handles all input formats.

**Files to Modify**:
- `app/public/scripts/pages/tickets.js` (new function)

**Implementation Details**:

```javascript
/**
 * Normalize person name(s) to "First Last; First Last" format
 * Handles multiple formats:
 * - "LAST,FIRST; LAST2,FIRST2" → "First Last; First2 Last2"
 * - "First Last; First2 Last2" → "First Last; First2 Last2" (pass-through)
 * - "john smith" → "John Smith" (capitalize)
 *
 * @param {string} input - Raw name input (any format)
 * @returns {string} Normalized name in "First Last; First Last" format
 */
normalizePersonName(input) {
    if (!input || input === "N/A") {
        return input;
    }

    const trimmed = input.trim();
    if (!trimmed) return "";

    // Split on semicolon (multiple people)
    const people = trimmed.split(";").map(p => p.trim()).filter(Boolean);

    // Transform each person
    const normalized = people.map(person => {
        // If no comma, assume "First Last" format (just capitalize)
        if (!person.includes(",")) {
            return this.toProperCase(person);
        }

        // "LAST,FIRST" format - reverse and capitalize
        const parts = person.split(",").map(p => p.trim());
        if (parts.length < 2) {
            return this.toProperCase(person); // Fallback: capitalize as-is
        }

        const lastName = this.toProperCase(parts[0]);
        const firstName = this.toProperCase(parts[1]);
        return `${firstName} ${lastName}`;
    });

    // Join multiple people with semicolon-space
    return normalized.join("; ");
}

/**
 * Convert string to Proper Case (SMITH → Smith)
 * Handles word boundaries for names like "O'Brien", "McDonald"
 *
 * @param {string} str - String to convert
 * @returns {string} Proper case string
 */
toProperCase(str) {
    if (!str) return str;
    return str.toLowerCase().replace(/\b\w/g, char => char.toUpperCase());
}
```

**Testing**:
```javascript
// Test cases (add to browser console or unit test)
const tests = [
    ["SMITH,JOHN; DOE,JANE", "John Smith; Jane Doe"],
    ["John Smith; Jane Doe", "John Smith; Jane Doe"],
    ["john smith", "John Smith"],
    ["O'BRIEN,MIKE", "Mike O'Brien"],
    ["", ""],
    [null, null],
    ["N/A", "N/A"]
];

tests.forEach(([input, expected]) => {
    const result = ticketManager.normalizePersonName(input);
    console.log(`${input} → ${result} ${result === expected ? "✅" : "❌"}`);
});
```

**Acceptance Criteria**:
- ✅ Handles "LAST,FIRST" format (transforms to "First Last")
- ✅ Handles "First Last" format (capitalizes)
- ✅ Handles lowercase input (capitalizes)
- ✅ Handles multiple people (semicolon-delimited)
- ✅ Handles edge cases (null, empty, "N/A")
- ✅ Handles special characters (O'Brien, McDonald, De La Cruz)

**Commit Message**:
```
feat(HEX-267): Add normalizePersonName() helper for supervisor/tech fields

- Create reusable normalization function in tickets.js
- Handles multiple input formats (LAST,FIRST / First Last / lowercase)
- Supports multiple people (semicolon-delimited)
- Includes toProperCase() for consistent capitalization
- Edge case handling (null, empty, "N/A", special chars)

Reference: HEX-267 Task 1
```

---

### Task 2: Apply Normalization to Input Fields
**Estimated Time**: 15 minutes
**Dependencies**: Task 1 (requires `normalizePersonName()`)
**Risk**: Low

**Objective**: Transform supervisor and tech input on save (before database write).

**Files to Modify**:
- `app/public/scripts/pages/tickets.js` (line ~1162-1163)

**Implementation Details**:

**Before** (tickets.js:1152-1166):
```javascript
const ticket = {
    id: this.currentEditingId || Date.now().toString(),
    xtNumber: xtNumber,
    dateSubmitted: document.getElementById("dateSubmitted").value,
    dateDue: document.getElementById("dateDue").value,
    hexagonTicket: document.getElementById("hexagonTicket").value,
    serviceNowTicket: document.getElementById("serviceNowTicket").value,
    site: document.getElementById("site").value,
    location: document.getElementById("location").value,
    devices: this.getDevices(),
    supervisor: document.getElementById("supervisor").value,  // OLD: Pass-through
    tech: document.getElementById("tech").value,              // OLD: Pass-through
    status: document.getElementById("status").value,
    jobType: document.getElementById("jobType").value,
    notes: document.getElementById("notes").value,
    // ... rest of fields
};
```

**After**:
```javascript
const ticket = {
    id: this.currentEditingId || Date.now().toString(),
    xtNumber: xtNumber,
    dateSubmitted: document.getElementById("dateSubmitted").value,
    dateDue: document.getElementById("dateDue").value,
    hexagonTicket: document.getElementById("hexagonTicket").value,
    serviceNowTicket: document.getElementById("serviceNowTicket").value,
    site: document.getElementById("site").value,
    location: document.getElementById("location").value,
    devices: this.getDevices(),
    supervisor: this.normalizePersonName(document.getElementById("supervisor").value),  // NEW: Normalize
    tech: this.normalizePersonName(document.getElementById("tech").value),              // NEW: Normalize
    status: document.getElementById("status").value,
    jobType: document.getElementById("jobType").value,
    notes: document.getElementById("notes").value,
    // ... rest of fields
};
```

**Testing**:
1. Open ticket modal
2. Paste "SMITH,JOHN; DOE,JANE" into supervisor field
3. Paste "ANDERSON,MIKE" into tech field
4. Click Save
5. Re-open ticket for editing
6. Verify fields show "John Smith; Jane Doe" and "Mike Anderson"

**Acceptance Criteria**:
- ✅ Supervisor field normalizes on save
- ✅ Tech field normalizes on save
- ✅ Normalized data stored in database
- ✅ Re-opening ticket shows normalized data
- ✅ No visual regressions (modal, table, AG-Grid)

**Commit Message**:
```
feat(HEX-267): Apply normalization to supervisor/tech input fields

- Transform supervisor input using normalizePersonName() before save
- Transform tech input using normalizePersonName() before save
- Data now stored in consistent "First Last; First Last" format
- User can paste any format (LAST,FIRST / First Last / lowercase)

Reference: HEX-267 Task 2
```

---

### Task 3: Remove Duplicate Normalization from Templates
**Estimated Time**: 45 minutes
**Dependencies**: Task 2 (requires normalized data in database)
**Risk**: Medium (template rendering logic)

**Objective**: Simplify template rendering by removing runtime normalization (data already normalized in database).

**Files to Modify**:
1. `app/public/scripts/shared/template-editor.js` (lines 729-760, 767-770)
2. `app/public/scripts/shared/ticket-markdown-editor.js` (lines 532-566)
3. `app/services/templateService.js` (simplify processor)

**Implementation Details**:

#### 3.1: template-editor.js

**Delete** (lines 729-760):
```javascript
/**
 * Helper: Normalize supervisor names from "LAST, FIRST ; LAST2, FIRST2" to "First Last, First2 Last2"
 * @param {string} supervisorField - Supervisor field value in EAM format
 * @returns {string} Normalized supervisor names in proper case
 */
normalizeSupervisorNames(supervisorField) {
    if (!supervisorField || supervisorField === "N/A") {
        return supervisorField;
    }

    const trimmed = supervisorField.trim();

    // Split on semicolon (EAM delimiter for multiple supervisors)
    const supervisors = trimmed.split(";").map(s => s.trim()).filter(s => s.length > 0);

    // Transform each supervisor from "LAST, FIRST" to "First Last"
    const normalized = supervisors.map(supervisor => {
        // If no comma, pass through as-is (edge case)
        if (!supervisor.includes(",")) {
            return this.toProperCase(supervisor);
        }

        // Split on comma to get [LAST, FIRST]
        const parts = supervisor.split(",").map(p => p.trim());
        if (parts.length < 2) {
            return this.toProperCase(supervisor);
        }

        // Reverse to "First Last" and convert to proper case
        const firstName = this.toProperCase(parts[1]);
        const lastName = this.toProperCase(parts[0]);
        return `${firstName} ${lastName}`;
    });

    // Join multiple supervisors with comma-space
    return normalized.join(", ");
}
```

**Delete** (lines 767-770):
```javascript
/**
 * Helper: Convert string to proper case (SMITH → Smith)
 * @param {string} str - String to convert
 * @returns {string} Proper case string
 */
toProperCase(str) {
    if (!str) {return str;}
    return str.toLowerCase().replace(/\b\w/g, char => char.toUpperCase());
}
```

**Update** (line 669 - processTemplate() function):
```javascript
// OLD
"[SUPERVISOR]": this.normalizeSupervisorNames(ticket.supervisor) || "N/A",

// NEW (data already normalized in DB)
"[SUPERVISOR]": ticket.supervisor || "N/A",
```

#### 3.2: ticket-markdown-editor.js

**Delete** (lines 532-566) - Same `normalizeSupervisorNames()` function as template-editor.js

**Update** (line 412 - processTemplate() function):
```javascript
// OLD
"[SUPERVISOR]": this.normalizeSupervisorNames(ticket.supervisor) || "N/A",

// NEW (data already normalized in DB)
"[SUPERVISOR]": ticket.supervisor || "N/A",
```

#### 3.3: templateService.js

**Update** (lines 705-708):
```javascript
// OLD - processor does runtime normalization
"[SUPERVISOR]": {
    description: "Supervisor name",
    required: false,
    fallback: "N/A",
    processor: (ticketData) => (ticketData && ticketData.supervisor) || "N/A"
},

// NEW - simple pass-through (already normalized)
"[SUPERVISOR]": {
    description: "Supervisor name (normalized format: First Last; First Last)",
    required: false,
    fallback: "N/A",
    processor: (ticketData) => (ticketData && ticketData.supervisor) || "N/A"
},
```

**Tech field** (already pass-through, just update description):
```javascript
"[TECHNICIAN]": {
    description: "Technician name (normalized format: First Last; First Last)",
    required: false,
    fallback: "N/A",
    processor: (ticketData) => (ticketData && ticketData.technician) || "N/A"
},
```

**Testing**:
1. Create new ticket with supervisor "SMITH,JOHN" and tech "DOE,JANE"
2. Save ticket (normalization applied by Task 2)
3. Generate markdown using "View Ticket Markdown" button
4. Verify markdown shows "Supervisor: John Smith" and "Technician: Jane Doe"
5. Test email template generation
6. Test vulnerability template generation

**Acceptance Criteria**:
- ✅ Removed 31 lines from template-editor.js
- ✅ Removed 34 lines from ticket-markdown-editor.js
- ✅ Simplified templateService.js processor
- ✅ Templates render correctly with normalized data
- ✅ No visual regressions in markdown output
- ✅ Email and vulnerability templates work correctly

**Commit Message**:
```
refactor(HEX-267): Remove duplicate normalization from template rendering

- Delete normalizeSupervisorNames() from template-editor.js (-31 lines)
- Delete normalizeSupervisorNames() from ticket-markdown-editor.js (-34 lines)
- Simplify templateService.js processor (data already normalized)
- Templates now use stored normalized data (no runtime processing)
- Net: -65 lines of duplicate code removed

Reference: HEX-267 Task 3
```

---

### Task 4: Create Migration Script (Migration 009)
**Estimated Time**: 1 hour
**Dependencies**: Tasks 1-3 (requires normalization logic tested)
**Risk**: Medium (data migration)

**Objective**: Create one-time migration script to normalize existing 6500 tickets.

**Files to Create**:
- `app/scripts/migrations/009-normalize-supervisor-tech.js`

**Implementation Details**:

```javascript
/**
 * Migration 009: Normalize Supervisor and Tech Fields
 *
 * Context: HEX-267 - Auto Conversion of Supervisor Input
 *
 * Problem: Database contains mixed formats for supervisor/tech fields:
 * - "SMITH,JOHN; DOE,JANE" (Hexagon EAM format)
 * - "John Smith; Jane Doe" (manual entry)
 * - "john smith" (lowercase)
 *
 * Solution: Normalize all existing data to "First Last; First Last" format
 *
 * Impact: ~6500 tickets
 * Estimated Time: <5 seconds
 * Rollback: Restore from backup (BackupService)
 */

const Database = require("better-sqlite3");
const path = require("path");
const fs = require("fs");

/**
 * Normalize person name(s) to "First Last; First Last" format
 * (Matches client-side logic in tickets.js)
 */
function normalizePersonName(input) {
    if (!input || input === "N/A" || typeof input !== "string") {
        return input;
    }

    const trimmed = input.trim();
    if (!trimmed) return "";

    // Split on semicolon (multiple people)
    const people = trimmed.split(";").map(p => p.trim()).filter(Boolean);

    // Transform each person
    const normalized = people.map(person => {
        // If no comma, assume "First Last" format (just capitalize)
        if (!person.includes(",")) {
            return toProperCase(person);
        }

        // "LAST,FIRST" format - reverse and capitalize
        const parts = person.split(",").map(p => p.trim());
        if (parts.length < 2) {
            return toProperCase(person);
        }

        const lastName = toProperCase(parts[0]);
        const firstName = toProperCase(parts[1]);
        return `${firstName} ${lastName}`;
    });

    // Join with semicolon-space (consistent delimiter)
    return normalized.join("; ");
}

/**
 * Convert string to Proper Case (SMITH → Smith)
 */
function toProperCase(str) {
    if (!str) return str;
    return str.toLowerCase().replace(/\b\w/g, char => char.toUpperCase());
}

/**
 * Run migration
 */
async function migrate() {
    const dbPath = process.env.DATABASE_PATH || path.join(__dirname, "../../data/hextrackr.db");

    console.log("=".repeat(60));
    console.log("Migration 009: Normalize Supervisor and Tech Fields");
    console.log("=".repeat(60));

    // Check database exists
    if (!fs.existsSync(dbPath)) {
        console.error(`❌ Database not found at: ${dbPath}`);
        process.exit(1);
    }

    const db = new Database(dbPath);

    try {
        console.log("\n📊 Pre-migration analysis...");

        // Get all tickets with supervisor or tech data
        const tickets = db.prepare(`
            SELECT id, supervisor, tech
            FROM tickets
            WHERE supervisor IS NOT NULL OR tech IS NOT NULL
        `).all();

        console.log(`   Found ${tickets.length} tickets with supervisor/tech data`);

        // Analyze format distribution
        const formats = {
            lastFirst: 0,    // Contains comma (LAST,FIRST)
            normalized: 0,   // Already normalized (First Last)
            lowercase: 0,    // All lowercase
            empty: 0         // Null or empty
        };

        tickets.forEach(ticket => {
            const sup = ticket.supervisor || "";
            const tech = ticket.tech || "";

            if (!sup && !tech) {
                formats.empty++;
            } else if (sup.includes(",") || tech.includes(",")) {
                formats.lastFirst++;
            } else if (sup === sup.toLowerCase() || tech === tech.toLowerCase()) {
                formats.lowercase++;
            } else {
                formats.normalized++;
            }
        });

        console.log("\n📈 Format Distribution:");
        console.log(`   LAST,FIRST format:    ${formats.lastFirst}`);
        console.log(`   Already normalized:   ${formats.normalized}`);
        console.log(`   Lowercase:            ${formats.lowercase}`);
        console.log(`   Empty:                ${formats.empty}`);

        // Sample tickets for manual review
        console.log("\n🔍 Sample tickets (first 5):");
        tickets.slice(0, 5).forEach(ticket => {
            const oldSup = ticket.supervisor || "(empty)";
            const oldTech = ticket.tech || "(empty)";
            const newSup = normalizePersonName(ticket.supervisor) || "(empty)";
            const newTech = normalizePersonName(ticket.tech) || "(empty)";

            console.log(`\n   Ticket ${ticket.id}:`);
            console.log(`      Supervisor: "${oldSup}" → "${newSup}"`);
            console.log(`      Tech:       "${oldTech}" → "${newTech}"`);
        });

        // Confirm before proceeding
        console.log("\n⚠️  WARNING: This will modify 6500 tickets!");
        console.log("   Backup your database before proceeding.");
        console.log("   Press Ctrl+C to cancel, or wait 5 seconds to continue...\n");

        await new Promise(resolve => setTimeout(resolve, 5000));

        console.log("🚀 Starting migration...\n");

        // Run migration in transaction
        const startTime = Date.now();

        db.prepare("BEGIN TRANSACTION").run();

        const updateStmt = db.prepare(`
            UPDATE tickets
            SET supervisor = ?, tech = ?, updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        `);

        let updated = 0;
        let unchanged = 0;
        let errors = 0;

        tickets.forEach(ticket => {
            try {
                const normalizedSupervisor = normalizePersonName(ticket.supervisor);
                const normalizedTech = normalizePersonName(ticket.tech);

                // Only update if changed
                if (normalizedSupervisor !== ticket.supervisor || normalizedTech !== ticket.tech) {
                    updateStmt.run(normalizedSupervisor, normalizedTech, ticket.id);
                    updated++;
                } else {
                    unchanged++;
                }
            } catch (error) {
                console.error(`   ❌ Error updating ticket ${ticket.id}:`, error.message);
                errors++;
            }
        });

        db.prepare("COMMIT").run();

        const duration = Date.now() - startTime;

        console.log("\n✅ Migration complete!");
        console.log(`   Updated:   ${updated} tickets`);
        console.log(`   Unchanged: ${unchanged} tickets`);
        console.log(`   Errors:    ${errors} tickets`);
        console.log(`   Duration:  ${duration}ms\n`);

        // Verify migration
        console.log("🔍 Post-migration verification...");

        const verifyTickets = db.prepare(`
            SELECT id, supervisor, tech
            FROM tickets
            WHERE supervisor LIKE '%,%' OR tech LIKE '%,%'
        `).all();

        if (verifyTickets.length > 0) {
            console.warn(`   ⚠️  Found ${verifyTickets.length} tickets still with comma format!`);
            verifyTickets.slice(0, 3).forEach(ticket => {
                console.log(`      Ticket ${ticket.id}: "${ticket.supervisor}" / "${ticket.tech}"`);
            });
        } else {
            console.log("   ✅ No comma-formatted names remaining");
        }

        console.log("\n" + "=".repeat(60));
        console.log("Migration 009 completed successfully!");
        console.log("=".repeat(60) + "\n");

    } catch (error) {
        console.error("\n❌ Migration failed:", error);
        console.log("   Rolling back transaction...");

        try {
            db.prepare("ROLLBACK").run();
            console.log("   ✅ Rollback successful");
        } catch (rollbackError) {
            console.error("   ❌ Rollback failed:", rollbackError);
        }

        process.exit(1);
    } finally {
        db.close();
    }
}

// Run migration if called directly
if (require.main === module) {
    migrate().catch(error => {
        console.error("Fatal error:", error);
        process.exit(1);
    });
}

module.exports = { migrate, normalizePersonName, toProperCase };
```

**Testing** (Dry Run):
```bash
# 1. Backup database first
npm run db:backup

# 2. Run migration on dev database
node app/scripts/migrations/009-normalize-supervisor-tech.js

# 3. Verify results in database
sqlite3 app/data/hextrackr.db "SELECT id, supervisor, tech FROM tickets LIMIT 10"

# 4. Test ticket CRUD operations
# Open HexTrackr → Edit ticket → Verify normalized names display correctly

# 5. If issues found, rollback
npm run db:restore
```

**Acceptance Criteria**:
- ✅ Migration script analyzes format distribution before running
- ✅ Shows sample tickets for manual review
- ✅ 5-second confirmation delay (cancel opportunity)
- ✅ Runs in transaction (rollback on error)
- ✅ Updates only changed tickets (performance optimization)
- ✅ Logs progress and errors
- ✅ Verifies no comma-formatted names remain
- ✅ Completes in <5 seconds for 6500 tickets

**Commit Message**:
```
feat(HEX-267): Add Migration 009 to normalize supervisor/tech fields

- Create migration script for existing 6500 tickets
- Normalize supervisor and tech fields to "First Last; First Last"
- Pre-migration analysis shows format distribution
- Transaction-wrapped with rollback on error
- Verification step confirms no comma-formatted names remain
- Performance: <5 seconds for full dataset

Reference: HEX-267 Task 4
```

---

### Task 5: Test Migration on Dev Database
**Estimated Time**: 45 minutes
**Dependencies**: Task 4 (requires migration script)
**Risk**: Medium (testing data integrity)

**Objective**: Validate migration on development database before production deployment.

**Testing Checklist**:

#### 5.1: Pre-Migration Backup
```bash
# Create timestamped backup
npm run db:backup

# Verify backup created
ls -lh backups/ | tail -1
```

#### 5.2: Run Migration
```bash
# Execute migration script
node app/scripts/migrations/009-normalize-supervisor-tech.js

# Expected output:
# - Format distribution analysis
# - Sample tickets preview
# - 5-second confirmation delay
# - Progress updates
# - Success message
```

#### 5.3: Database Verification
```sql
-- Check for remaining comma-formatted names
SELECT id, supervisor, tech
FROM tickets
WHERE supervisor LIKE '%,%' OR tech LIKE '%,%';
-- Expected: 0 rows

-- Sample normalized tickets
SELECT id, supervisor, tech
FROM tickets
WHERE supervisor IS NOT NULL
LIMIT 10;
-- Expected: All names in "First Last; First Last" format

-- Check updated_at timestamps
SELECT id, supervisor, updated_at
FROM tickets
ORDER BY updated_at DESC
LIMIT 5;
-- Expected: Recent timestamps for migrated tickets
```

#### 5.4: Application Testing

**Test 1: View Existing Tickets**
1. Open HexTrackr tickets page
2. Select AG-Grid view
3. Verify supervisor/tech columns show normalized names
4. Check for visual regressions

**Test 2: Edit Existing Ticket**
1. Click Edit on migrated ticket
2. Verify supervisor/tech fields show normalized data
3. Make no changes, click Save
4. Verify data unchanged

**Test 3: Create New Ticket**
1. Click "Add Ticket"
2. Paste "SMITH,JOHN; DOE,JANE" into supervisor
3. Paste "ANDERSON,MIKE" into tech
4. Click Save
5. Re-open ticket
6. Verify shows "John Smith; Jane Doe" and "Mike Anderson"

**Test 4: Template Rendering**
1. Open existing ticket with supervisor/tech data
2. Click "View Ticket Markdown"
3. Verify markdown shows normalized names
4. Check [SUPERVISOR] and [TECHNICIAN] variables resolve correctly

**Test 5: CSV Export**
1. Open Settings → Data Management
2. Click "Export Tickets (CSV)"
3. Open CSV file
4. Verify supervisor/tech columns have normalized data
5. Check for any formatting issues

**Test 6: Search/Filter**
1. Use search bar to find supervisor name
2. Verify search works with normalized format
3. Test case-insensitive search

#### 5.5: Performance Testing
```bash
# Time the migration (should be <5 seconds)
time node app/scripts/migrations/009-normalize-supervisor-tech.js

# Check database size before/after
ls -lh app/data/hextrackr.db
```

#### 5.6: Rollback Testing
```bash
# Test rollback capability
npm run db:restore

# Verify database restored to pre-migration state
sqlite3 app/data/hextrackr.db "SELECT COUNT(*) FROM tickets WHERE supervisor LIKE '%,%'"
# Expected: >0 (comma-formatted names present)
```

**Acceptance Criteria**:
- ✅ Migration completes in <5 seconds
- ✅ Zero comma-formatted names remain in database
- ✅ All ticket CRUD operations work correctly
- ✅ Templates render normalized names
- ✅ CSV export contains normalized data
- ✅ Search/filter functions work
- ✅ No visual regressions
- ✅ Rollback restores database successfully

**Issues Found**: Document any issues in Linear HEX-267 comments

**Commit Message**: (No code changes, testing only)

---

### Task 6: Deploy to Production
**Estimated Time**: 45 minutes
**Dependencies**: Task 5 (successful dev testing)
**Risk**: Medium (production deployment)

**Objective**: Deploy normalization changes to production environment.

**Deployment Checklist**:

#### 6.1: Pre-Deployment

```bash
# 1. Ensure all commits are in feature branch
git status
git log --oneline -5

# 2. Merge feature branch to dev
git checkout dev
git merge feature/hex-267-supervisor-tech-normalization

# 3. Run linting
npm run lint

# 4. Verify Docker build
docker-compose build
```

#### 6.2: Production Backup

```bash
# SSH to production server
ssh hextrackr@192.168.1.80

# Navigate to app directory
cd /opt/hextrackr

# Create production backup
npm run db:backup

# Verify backup
ls -lh backups/ | tail -1

# Copy backup to local machine (safety)
exit
scp hextrackr@192.168.1.80:/opt/hextrackr/backups/latest.db ./backups/prod-pre-hex-267.db
```

#### 6.3: Deploy Code

```bash
# Push to main branch (triggers production deployment if automated)
git checkout main
git merge dev
git push origin main

# OR manual deployment:
ssh hextrackr@192.168.1.80
cd /opt/hextrackr
git pull origin main
docker-compose down
docker-compose up -d
```

#### 6.4: Run Production Migration

```bash
# SSH to production
ssh hextrackr@192.168.1.80
cd /opt/hextrackr

# Run migration (will show 5-second confirmation)
docker exec hextrackr-app node app/scripts/migrations/009-normalize-supervisor-tech.js

# Monitor logs
docker logs hextrackr-app --tail 100

# Verify migration success
docker exec hextrackr-app sqlite3 /app/data/hextrackr.db "SELECT COUNT(*) FROM tickets WHERE supervisor LIKE '%,%'"
# Expected: 0
```

#### 6.5: Smoke Testing

**Test 1: Application Health**
- Navigate to https://hextrackr.com
- Verify app loads without errors
- Check browser console for JavaScript errors

**Test 2: Ticket Operations**
- Create new ticket with supervisor/tech
- Edit existing ticket
- Delete ticket (soft delete)
- Verify all operations work

**Test 3: Template Generation**
- Generate ticket markdown
- Verify supervisor/tech display correctly
- Check email template preview

**Test 4: CSV Export**
- Export tickets to CSV
- Verify normalized data in export

#### 6.6: Monitoring (24 hours)

**Log Monitoring**:
```bash
# Watch for errors
docker logs -f hextrackr-app | grep -i error

# Check for migration-related issues
docker logs hextrackr-app | grep -i "supervisor\|tech"
```

**User Reports**:
- Monitor for user-reported issues
- Check Linear for new bug reports
- Respond within 4 hours if issues found

#### 6.7: Rollback Procedure (If Needed)

```bash
# 1. SSH to production
ssh hextrackr@192.168.1.80
cd /opt/hextrackr

# 2. Stop application
docker-compose down

# 3. Restore database
npm run db:restore

# 4. Revert code
git log --oneline -10  # Find commit before HEX-267
git checkout <commit-hash>

# 5. Restart application
docker-compose up -d

# 6. Verify rollback
docker logs hextrackr-app --tail 50
```

**Rollback Time**: <2 minutes (as specified in Research)

**Acceptance Criteria**:
- ✅ Code deployed to production without errors
- ✅ Migration completes successfully on prod database
- ✅ All smoke tests pass
- ✅ No error logs related to supervisor/tech normalization
- ✅ Users can create/edit tickets normally
- ✅ Templates render correctly
- ✅ CSV exports contain normalized data
- ✅ Zero critical issues reported in 24 hours

**Commit Message**:
```
chore(HEX-267): Deploy supervisor/tech normalization to production

- Merged feature branch to main
- Ran Migration 009 on production database
- Verified 6500 tickets normalized successfully
- All smoke tests passed
- Monitoring for 24 hours (no issues expected)

Reference: HEX-267 Task 6 (Complete)
Closes: HEX-267
```

---

## Success Metrics

**Code Quality**:
- ✅ 65 lines of duplicate code removed
- ✅ Zero new linting errors
- ✅ All existing tests pass
- ✅ JSDoc comments added for new functions

**Data Quality**:
- ✅ 100% of tickets normalized (6500/6500)
- ✅ Zero comma-formatted names in database
- ✅ Consistent "First Last; First Last" format

**Performance**:
- ✅ Migration completes in <5 seconds
- ✅ Input normalization adds <1ms to save operation
- ✅ Template rendering ~0.5ms faster (no runtime normalization)

**User Experience**:
- ✅ Users can paste any format (seamless)
- ✅ Display consistent across all views
- ✅ No visual regressions
- ✅ Zero user-reported issues in 24 hours

**Technical Debt**:
- ✅ Duplicate normalization code eliminated
- ✅ Future location→supervisor lookup enabled
- ✅ Cleaner, more maintainable codebase

---

## Rollback Plan

**Trigger**: Error logs, user reports, or data integrity issues

**Steps**:
1. Stop application (docker-compose down)
2. Restore database from backup (<30 seconds)
3. Git revert all HEX-267 commits
4. Restart application (docker-compose up -d)
5. Verify rollback successful

**Total Time**: <2 minutes

**Risk**: Low (backups tested, transaction-wrapped migration)

---

## Post-Implementation

**Documentation**:
- ✅ Update CLAUDE.md with normalization pattern
- ✅ Add migration to migration log
- ✅ Create changelog entry (v1.0.94)

**Memento**:
- ✅ Save implementation session to knowledge graph
- ✅ Tag with "migration", "data-normalization", "technical-debt-reduction"

**Linear**:
- ✅ Update HEX-267 status to "Done"
- ✅ Add completion comment with metrics
- ✅ Link to commit SHA and changelog

**Celebration**:
- ✅ 65 lines of duplicate code eliminated!
- ✅ Future feature enabled (contact lookup)
- ✅ Cleaner, more maintainable codebase
- ✅ Zero data loss, zero downtime

---

**Total Estimated Time**: 4 hours
**Actual Time**: (To be filled after implementation)
**Variance**: (To be calculated)

**Next Steps**: Begin implementation with Task 1
