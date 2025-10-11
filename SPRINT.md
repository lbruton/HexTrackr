# SPRINT: Bidirectional Device-to-Ticket Navigation (HEX-203 Phase 3)

**Feature**: Update vulnerability device cards to show existing ticket status and enable direct navigation to open tickets.

**Date**: 2025-10-11
**Status**: In Progress

---

## Implementation Checklist

### Phase 1: Backend API Endpoint ✅
- [x] Create `/api/tickets/by-device/:hostname` endpoint in routes/tickets.js
- [x] Implement SQL query with json_each for device matching
- [x] Filter: deleted=0, exclude Completed/Cancelled statuses
- [x] Return: XT number, job_type, status, date_submitted, devices array
- [x] Committed: 0059f32

### Phase 2: Frontend Button Logic
- [ ] Update vulnerability card rendering in vulnerabilities.js
- [ ] Add button state detection on card load
- [ ] Implement button color mapping from ticket status
- [ ] Update button text based on ticket count (0/1/2+)
- [ ] Add click handler to replace "Create Ticket" behavior

### Phase 3: Multi-Ticket Picker Modal
- [ ] Create HTML modal structure in vulnerabilities.html
- [ ] Add table showing: XT#, Job Type, Status, Date Submitted
- [ ] Wire up row click → open existing ticket modal
- [ ] Add "Create New Ticket Anyway" button at bottom
- [ ] Handle escape key and backdrop click to dismiss

### Phase 4: Integration & Edge Cases
- [ ] 0 tickets → Show create ticket modal (existing behavior)
- [ ] 1 ticket → Directly open edit ticket modal
- [ ] 2+ tickets → Show picker modal
- [ ] Handle case-insensitive hostname matching
- [ ] Handle IP addresses (already clean, same logic)
- [ ] Test with multiple tabs open (state refresh)

### Phase 5: Testing & Polish
- [ ] Test with device that has no tickets
- [ ] Test with device that has 1 open ticket
- [ ] Test with device that has 2+ open tickets
- [ ] Test with mixed case hostnames
- [ ] Test with IP address devices
- [ ] Verify status colors match tickets.html table
- [ ] Test modal dismissal edge cases

---

## Technical Notes

### SQL Query Pattern
```sql
SELECT t.* FROM tickets t, json_each(t.devices)
WHERE lower(json_each.value) = lower(:hostname)
  AND t.deleted = 0
  AND t.status NOT IN ('Completed', 'Cancelled')
ORDER BY t.created_at DESC;
```

### Status Color Mapping (from tickets.html)
```javascript
const statusColors = {
    "Open": "#17a2b8",           // cyan
    "In Progress": "#ffc107",    // yellow
    "Pending": "#fd7e14",        // orange
    "On Hold": "#6c757d",        // gray
    "Completed": "#28a745",      // green
    "Cancelled": "#dc3545"       // red
};
```

### Button State Logic
```javascript
// Pseudo-code
const tickets = await fetch(`/api/tickets/by-device/${hostname}`);
if (tickets.length === 0) {
    button.text = "Create Ticket";
    button.color = "success"; // green
} else if (tickets.length === 1) {
    button.text = "Open Ticket";
    button.color = mapStatusColor(tickets[0].status);
} else {
    button.text = `View Tickets (${tickets.length})`;
    button.color = mapStatusColor(tickets[0].status); // most recent
}
```

---

## Current Progress

**Completed**:
- [x] Database migration for structured addresses (Migration 010)
- [x] Structured address form fields (line1/line2/city/state/zip)
- [x] formatAddress() JavaScript method
- [x] Improved arrow button styling with Tabler icons

**Completed** ✅:
- [x] Backend API complete (commit 0059f32)
- [x] Frontend button state detection (commit 68cbbb7)
- [x] Multi-ticket picker modal (commit 68cbbb7)
- [x] Correct status/job type color mapping (commit 68cbbb7)
- [x] Bonus: Job type text coloring matching AG Grid

**Blocked**: None

**Implementation Summary**:
- Async ticket state checking for all device cards (parallel API calls)
- Three button states: Create (green) / Open (status-colored) / View Tickets (N)
- Button border reflects ticket status, text color reflects job type
- Modal picker for 2+ tickets with proper status badges
- Keyboard modifiers preserved for bulk ticket creation
- All status values corrected to match tickets.html system

---

## Scratch Notes

### Hostname Examples from Screenshot
- carrnswann02 (38 vulns, 197.4 VPR)
- rosmntnswann07 (35 vulns, 182.0 VPR)
- olathenswan01 (35 vulns, 182.0 VPR)
- eyotanswan08 (35 vulns, 182.0 VPR)
- hearnenswan20 (35 vulns, 182.0 VPR)
- houstnnswann19 (35 vulns, 182.0 VPR)

All have "KEV" badge (red) indicating Known Exploited Vulnerabilities.

### Files to Modify
1. **Backend**: `app/routes/tickets.js` - new endpoint
2. **Backend**: `app/services/ticketsService.js` - query logic
3. **Frontend**: `app/public/vulnerabilities.html` - picker modal HTML
4. **Frontend**: `app/public/scripts/pages/vulnerabilities.js` - button logic

### Edge Cases to Handle
- Device name appears in multiple tickets (common: failed upgrade + replacement)
- Ticket was just created in another tab (refresh state)
- User clicks "Create New" when ticket already exists (allow, don't block)
- Ticket status changes while modal is open (acceptable staleness)

---

## Commit Strategy

1. Backend API endpoint (single commit)
2. Frontend button state detection (single commit)
3. Multi-ticket picker modal (single commit)
4. Integration and edge case handling (single commit)

Total: ~4 commits for clean git history
