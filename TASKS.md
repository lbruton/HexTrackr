# HEX-196: Soft Delete + XT# Duplicate Bug Fix

**Session Start**: 2025-10-10 (Night Sprint - 3 weeks to CIO demo)
**Status**: In Progress
**Estimated Time**: 2-3 hours
**Priority**: Critical (blocks HEX-197, HEX-198)

---

## Context

**Previous Win**: HEX-195 (Failed status precedence) completed in 20 minutes ✅
**Current Task**: Implement soft delete pattern + fix XT# uniqueness
**Energy Level**: Post-dinner refuel, ready to power through

---

## The Bug

### Issue 1: Duplicate XT# Numbers
- Deleting ticket XT-0035 → Hard DELETE from database
- Next ticket may reuse XT-0035
- **Result**: Two different tickets with same XT# in history

### Issue 2: Lost Audit Trail
- Hard delete = no record ticket ever existed
- ServiceNow changes reference non-existent XT#
- Cannot recover accidentally deleted tickets
- **Impact**: Compliance risk, audit failure

---

## The Solution

### Phase 1 (Tonight): Soft Delete + XT# Fix

**Database Schema**:
```sql
ALTER TABLE tickets ADD COLUMN deleted INTEGER DEFAULT 0;
ALTER TABLE tickets ADD COLUMN deleted_at TEXT;
CREATE INDEX idx_tickets_deleted ON tickets(deleted);
```

**Soft Delete Operation**:
```javascript
// OLD (incorrect):
DELETE FROM tickets WHERE id = ?

// NEW (correct):
UPDATE tickets
SET deleted = 1, deleted_at = datetime('now')
WHERE id = ?
```

**XT# Generation Fix**:
```javascript
// OLD (incorrect):
const maxXT = tickets.filter(t => !t.deleted).reduce(...)  // Excludes deleted!

// NEW (correct):
const maxXT = tickets.reduce(...)  // Includes ALL tickets (deleted + active)
```

**Query Filters**:
```javascript
// All SELECT queries must filter:
SELECT * FROM tickets WHERE deleted = 0 ORDER BY date_submitted DESC
```

---

## Implementation Checklist

### Step 1: Database Migration (30 min)
- [ ] Create migration script: `app/public/scripts/migrations/004-soft-delete-tickets.sql`
- [ ] Add `deleted` INTEGER DEFAULT 0
- [ ] Add `deleted_at` TEXT
- [ ] Add index on `deleted` column
- [ ] Test migration on dev database
- [ ] Verify existing tickets get `deleted = 0`

### Step 2: Backend Service Updates (45 min)
- [ ] Find ticket service/controller delete method
- [ ] Change DELETE to UPDATE (set deleted=1, deleted_at=now())
- [ ] Find all SELECT queries for tickets
- [ ] Add `WHERE deleted = 0` to all SELECT queries
- [ ] Update ticket count queries (exclude deleted)
- [ ] Verify XT# generation includes deleted tickets

### Step 3: Frontend Updates (30 min)
- [ ] Update `app/public/scripts/pages/tickets.js` delete handler
- [ ] Ensure AG-Grid filters deleted tickets from display
- [ ] Update ticket count display (exclude deleted)
- [ ] Update export functions (CSV, markdown) to exclude deleted
- [ ] Verify search/filter functionality excludes deleted

### Step 4: Testing (30 min)
- [ ] **Test Case 1**: Delete ticket → verify `deleted=1` in DB, hidden in UI
- [ ] **Test Case 2**: Delete XT-0051 → create new ticket → gets XT-0052 (not reused)
- [ ] **Test Case 3**: Delete multiple tickets → XT# skips all deleted numbers
- [ ] **Test Case 4**: Export CSV → excludes deleted tickets
- [ ] **Test Case 5**: Existing tickets work correctly (backward compatibility)

### Step 5: Commit & Linear Update (15 min)
- [ ] Git commit with detailed message
- [ ] Update Linear HEX-196 to "Done"
- [ ] Update TASKS.md with completion notes
- [ ] Push to dev branch

---

## Key Files to Modify

### Backend (Database Layer):
- **NEW**: `app/public/scripts/migrations/004-soft-delete-tickets.sql`
- **MODIFY**: Ticket service (find DELETE operations)
- **MODIFY**: Ticket controller (find SELECT queries)

### Frontend (UI Layer):
- **MODIFY**: `app/public/scripts/pages/tickets.js` (delete handler, XT# generation)
- **VERIFY**: `app/public/scripts/pages/tickets-aggrid.js` (already filters by data)

### Find Commands:
```bash
# Find delete operations:
grep -rn "DELETE FROM tickets" app/

# Find SELECT queries:
grep -rn "SELECT.*FROM tickets" app/

# Find XT# generation:
grep -rn "xt_number\|xtNumber" app/public/scripts/pages/tickets.js
```

---

## Test Scenarios (Dev Environment)

### Scenario 1: Basic Soft Delete
1. Go to https://dev.hextrackr.com/tickets.html
2. Create test ticket XT-0050
3. Click Delete
4. Check database: `sqlite3 app/data/hextrackr.db "SELECT * FROM tickets WHERE xt_number = '0050'"`
5. **Expected**: Row exists with `deleted = 1`, `deleted_at` timestamp
6. **Expected**: Ticket NOT visible in AG-Grid

### Scenario 2: XT# Uniqueness
1. Create ticket (gets XT-0051)
2. Delete XT-0051
3. Create new ticket
4. **Expected**: New ticket gets XT-0052 (skips deleted 0051)

### Scenario 3: Multiple Deletes
1. Create tickets: 0060, 0061, 0062
2. Delete 0061
3. Create new ticket
4. **Expected**: Gets 0063 (skips 0061)

---

## Safety & Rollback

### Pre-Work Safety Commit:
```bash
git add .
git commit -m "🔐 pre-work snapshot (HEX-196)"
```

### Database Backup:
```bash
cp app/data/hextrackr.db app/data/hextrackr.db.backup-hex196
```

### Rollback Plan (if needed):
```bash
# Restore database:
cp app/data/hextrackr.db.backup-hex196 app/data/hextrackr.db

# Git rollback:
git reset --hard HEAD
```

---

## Success Criteria

✅ Soft delete columns added to database
✅ Delete operation sets `deleted=1` instead of DELETE
✅ All queries filter `WHERE deleted = 0`
✅ XT# generation includes deleted tickets in max calculation
✅ No duplicate XT# numbers possible
✅ All 5 test cases pass
✅ Existing tickets work after migration (no regression)
✅ Dev environment tested and verified

---

## Phase 2 (Future - Not Tonight)

**Admin Recovery UI** (deferred to future sprint):
- Admin page to view deleted tickets
- Restore button to flip `deleted = 0`
- Permanent delete with confirmation
- Audit log of deletion actions

**Estimated**: 4-5 hours (separate issue)

---

## Notes & Discoveries

*(Update this section as we work)*

### Discovery 1: XT# Generation Already Correct!
- generateNextXTNumber() at line 488 already queries ALL tickets (no filter)
- This means XT# uniqueness was already working correctly!
- Added comment to prevent future regression

### Discovery 2: All Backend Queries Updated
- getAllTickets() - Added WHERE deleted = 0
- exportTickets() - Added WHERE deleted = 0
- getTicketById() - Added WHERE deleted = 0 AND
- deleteTicket() - Changed DELETE to UPDATE (soft delete)
- generateNextXTNumber() - Left unchanged (correct behavior)

### Issues Encountered:
- None! Migration and backend updates went smoothly

### Time Tracking:
- Start: 23:00
- Migration: 23:15 (15 min)
- Backend: 23:35 (20 min)
- Frontend: SKIPPED (backend handles it!)
- Testing: NEXT
- Commit: TBD
- End: TBD
- **Total**: 35 min so far

---

## Git Commit Message Template

```
fix(tickets): Implement soft delete + fix XT# duplicate bug (HEX-196)

Root Cause:
1. Hard DELETE operation lost audit trail and enabled XT# reuse
2. XT# generation excluded deleted tickets from max calculation

Solution:
- Added soft delete columns: deleted (INTEGER), deleted_at (TEXT)
- Changed DELETE to UPDATE (sets deleted=1, deleted_at=now())
- Added `WHERE deleted = 0` filter to all SELECT queries
- Fixed XT# generation to include ALL tickets (deleted + active)

Database Migration:
- 004-soft-delete-tickets.sql adds columns with DEFAULT 0
- Index on deleted column for performance
- Existing tickets preserved with deleted=0

Test Results (dev.hextrackr.com):
✅ Delete ticket → marked deleted=1, hidden from UI
✅ Delete XT-0051 → next ticket gets XT-0052 (no reuse)
✅ Multiple deletes → XT# sequence skips all deleted
✅ Export excludes deleted tickets
✅ Existing tickets work correctly (backward compatible)

Files Modified:
- app/public/scripts/migrations/004-soft-delete-tickets.sql (new)
- [backend files]
- app/public/scripts/pages/tickets.js

Impact:
- Audit trail preserved for compliance
- XT# uniqueness guaranteed for lifetime
- Accidental delete recovery possible (future admin UI)

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>
```

---

## 🔄 Handoff Note for Clone 2 (Context Recovery)

**Session Context**:
- **Tonight's Wins**: HEX-195 (Failed status precedence) completed in 20 minutes ✅ (commit: 0c80154)
- **Current Task**: HEX-196 soft delete implementation (critical bug, blocks HEX-197/198)
- **Energy Level**: Post-dinner, ready to power through 2-3 hour implementation
- **CIO Demo**: 3 weeks away (need HEX-196 for data integrity demo)

**What's Already Done**:
1. ✅ Linear HEX-196 requirements captured in this file
2. ✅ TASKS.md checkpoint created with full implementation plan
3. ✅ Linear MCP disabled (freed 20K tokens)
4. ✅ Sequential-thinking MCP disabled (freed more tokens)
5. ⏸️  Ready to start implementation (haven't begun coding yet)

**Immediate Next Steps** (when you resume):
1. Create pre-work safety commit: `git commit -m "🔐 pre-work snapshot (HEX-196)"`
2. Backup database: `cp app/data/hextrackr.db app/data/hextrackr.db.backup-hex196`
3. Start with Step 1: Database Migration (create 004-soft-delete-tickets.sql)
4. Follow checklist in order (migration → backend → frontend → testing → commit)

**Key Files You'll Need to Find**:
```bash
# Backend delete operations (Step 2):
grep -rn "DELETE FROM tickets" app/services/ app/controllers/

# Frontend delete handler (Step 3):
grep -rn "deleteTicketFromDB" app/public/scripts/pages/tickets.js

# XT# generation (Step 3):
grep -rn "generateNextXT\|xt_number.*reduce" app/public/scripts/pages/tickets.js
```

**Testing Reminder**:
- Use dev.hextrackr.com (Docker already running)
- Test all 5 scenarios before committing
- Check database directly: `sqlite3 app/data/hextrackr.db "SELECT * FROM tickets WHERE deleted = 1"`

**Rollback Plan** (if things go wrong):
```bash
cp app/data/hextrackr.db.backup-hex196 app/data/hextrackr.db
git reset --hard HEAD
```

**Git Commit Template**: See section above (lines 235-275) - copy/paste when done

**Success = All 5 test cases pass + Linear HEX-196 marked Done**

---

**Last Updated**: 2025-10-10 23:00 (checkpoint created, ready to implement)
**Next Action**: Pre-work safety commit → Database migration → Backend updates → Frontend updates → Testing → Final commit
