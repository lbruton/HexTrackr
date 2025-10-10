# TASKS.md - HEX-190 Device Ticket Power Tool Implementation

**Source**: HEX-193 (IMPLEMENT: Device Ticket Auto-Population Power Tool)
**Branch**: `feature/hex-190-device-ticket-power-tool`
**Estimated Time**: ~3 hours (2 sessions)
**Last Updated**: 2025-10-10

---

## Pre-Work Setup

- [ ] **Confirm clean worktree**: `git status` should show no uncommitted changes
- [ ] **Create feature branch**: `git checkout -b feature/hex-190-device-ticket-power-tool`
- [ ] **Create safety commit**: `git commit --allow-empty -m "🔐 pre-work snapshot (HEX-190)"`
- [ ] **Read HEX-192 PLAN**: Review all 4 tasks and code changes

---

## Task 1.1: Enhance button handler with keyboard modifier detection and device filtering

**Estimated Time**: 75 minutes
**Files**: `app/public/scripts/shared/vulnerability-cards.js:185-188`

### Subtasks

- [ ] Locate button onclick handler (line 185-188)
- [ ] Change onclick to pass event object: `vulnManager.handleCreateTicketClick(event, '${device.hostname}')`
- [ ] Add new `handleCreateTicketClick(event, hostname)` method to VulnerabilityCardsManager class
- [ ] Implement hostname parsing (SITE = first 4 chars, Location = first 5 chars)
- [ ] Add keyboard modifier detection (pattern from HEX-144)
  - [ ] Mode 1 (single): No modifiers
  - [ ] Mode 2 (bulk-all): `(event.metaKey || event.ctrlKey) && event.shiftKey`
  - [ ] Mode 3 (KEV): `(event.metaKey || event.ctrlKey) && event.shiftKey && event.code === 'Space'`
- [ ] Implement device filtering using `dataManager.getFilteredDevices()`
- [ ] Add console logging for debugging

### Validation

- [ ] **Manual test (Mode 1)**: Single click → verify existing behavior still works
- [ ] **Manual test (Mode 2)**: Hold Cmd+Shift, click → verify console shows "Bulk mode: X devices"
- [ ] **Manual test (Mode 3)**: Hold Cmd+Shift+Space, click → verify console shows "KEV mode: X devices"
- [ ] **Code review**: Verify cross-platform compatibility (`metaKey` || `ctrlKey`)

### Checkpoint ✅

- [ ] **Propose commit message**: `feat(tickets): Add keyboard shortcuts for device ticket creation (HEX-190 Task 1.1)`
- [ ] **Review code**: Does it match PLAN "After" block?
- [ ] **Decision**: ✅ Proceed to 1.2 | 🔁 Fix issues | ⏸️ Pause

---

## Task 1.2: Enhance sessionStorage to use structured JSON with SITE/Location/devices

**Estimated Time**: 30 minutes
**Files**: `app/public/scripts/shared/vulnerability-cards.js` (createTicketFromDevice method)

### Subtasks

- [ ] Locate existing `createTicketFromDevice(hostname)` method
- [ ] Add optional `options` parameter with default `null`
- [ ] Add conditional logic: if options provided → use new JSON format, else → use old string format
- [ ] Implement new sessionStorage structure with JSON.stringify:
  - [ ] `devices` array
  - [ ] `site` string
  - [ ] `location` string
  - [ ] `mode` string
  - [ ] `timestamp` number (for debugging)
- [ ] Maintain backward compatibility: set BOTH `createTicketData` (new) and `createTicketDevice` (old)
- [ ] Update Task 1.1 to call enhanced method with options parameter

### Validation

- [ ] **DevTools test**: After clicking button, inspect sessionStorage
- [ ] **Verify**: `createTicketData` contains valid JSON with all fields
- [ ] **Verify**: `createTicketDevice` contains first device (backward compat)
- [ ] **Manual test**: Navigation to tickets.html still works

### Checkpoint ✅

- [ ] **Commit Tasks 1.1 + 1.2**: `feat(tickets): Add keyboard shortcuts for bulk device ticket creation (HEX-190 Tasks 1.1-1.2)`
- [ ] **Git checkpoint**: Record commit hash in table below
- [ ] **Review**: SessionStorage structure matches PLAN?
- [ ] **Decision**: ✅ Proceed to 1.3 | 🔁 Fix issues | ⏸️ Pause

---

## Task 1.3: Update modal pre-population to parse JSON and populate SITE/Location/devices

**Estimated Time**: 60 minutes
**Files**: `app/public/scripts/pages/tickets.js:3544-3590`

### Subtasks

- [ ] Locate modal auto-open logic (lines 3544-3590)
- [ ] Add `ticketDataRaw` variable to read `createTicketData` from sessionStorage
- [ ] Wrap existing code in `if (autoOpen === "true")` block
- [ ] Add try-catch block for JSON parsing
- [ ] Implement SITE field population: `document.getElementById("site").value = ticketData.site`
- [ ] Implement Location field population: `document.getElementById("location").value = ticketData.location`
- [ ] Set `dataset.powerToolPopulated = "true"` flag on location field (for Task 1.4)
- [ ] Implement multiple device population:
  - [ ] First device in existing field
  - [ ] Loop through remaining devices (i = 1 to length)
  - [ ] Call `window.ticketManager.addDeviceField()` for each
  - [ ] Use staggered setTimeout to populate each new field
- [ ] Update toast message to show device count and mode
- [ ] Maintain backward compatibility: handle old `createTicketDevice` format in else block

### Validation

- [ ] **Manual test (Mode 1)**: Single click → verify SITE="CORP", Location="CORP-", 1 device
- [ ] **Manual test (Mode 2)**: Cmd+Shift+Click → verify X devices populated, SITE/Location auto-filled
- [ ] **Manual test (Mode 3)**: Cmd+Shift+Space+Click → verify only KEV devices, SITE/Location auto-filled
- [ ] **Verify**: Device number indicators (#0, #1, #2...) update correctly
- [ ] **Verify**: Drag-drop still works
- [ ] **Verify**: Toast message shows correct count/mode
- [ ] **Backward compat test**: Use console to set old format → verify single device works

### Checkpoint ✅

- [ ] **Review**: All 3 modes working correctly?
- [ ] **Review**: Existing features (drag-drop, numbering) still work?
- [ ] **Decision**: ✅ Proceed to 1.4 | 🔁 Fix issues | ⏸️ Pause

---

## Task 1.4: Add autofill conflict resolution (disable location-to-device when power tool used)

**Estimated Time**: 15 minutes
**Files**: `app/public/scripts/pages/tickets.js:580-608`

### Subtasks

- [ ] Locate `handleLocationToDeviceAutofill(locationValue)` method (lines 580-608)
- [ ] Add location field reference: `const locationField = document.getElementById("location")`
- [ ] Add early return check: if `locationField.dataset.powerToolPopulated === "true"` → return
- [ ] Position check AFTER `currentEditingId` check, BEFORE device input logic

### Validation

- [ ] **Power tool test**: Use power tool (any mode) → type in Location field → verify first device does NOT auto-update
- [ ] **Manual ticket test**: Create new ticket manually → type in Location field → verify first device DOES auto-update
- [ ] **Regression test**: Verify existing autofill behavior works when NOT using power tool

### Checkpoint ✅

- [ ] **Commit Tasks 1.3 + 1.4**: `feat(tickets): Enhance modal pre-population with SITE/Location (HEX-190 Tasks 1.3-1.4)`
- [ ] **Git checkpoint**: Record commit hash in table below
- [ ] **Review**: Autofill conflict resolved?
- [ ] **Decision**: ✅ Complete implementation | 🔁 Fix issues | ⏸️ Pause

---

# Git Checkpoints

| Commit Hash | Tasks | Notes |
|-------------|-------|-------|
| (empty pre-work) | Pre-work safety | Empty commit before starting |
|  | 1.1, 1.2 | Keyboard shortcuts + sessionStorage |
|  | 1.3, 1.4 | Modal pre-population + autofill fix |

---

# Verification (post-implementation)

## Functional Testing

- [ ] **Mode 1 (Single)**: Works as before, PLUS auto-fills SITE/Location
- [ ] **Mode 2 (Bulk)**: Cmd+Shift+Click adds all devices at location
- [ ] **Mode 3 (KEV)**: Cmd+Shift+Space+Click adds only KEV devices
- [ ] **Backward compatibility**: Old sessionStorage format still works
- [ ] **Autofill integration**: Power tool disables autofill, manual tickets enable it
- [ ] **Existing features**: Drag-drop, numbering, sorting all still work

## Browser Compatibility

- [ ] **macOS**: Safari, Chrome (Cmd key)
- [ ] **Windows**: Chrome, Edge (Ctrl key)
- [ ] **Linux**: Firefox (Ctrl key)

## Developer Experience

- [ ] **Console logs**: Clean, informative (no errors)
- [ ] **SessionStorage**: Inspect structure matches PLAN
- [ ] **Code quality**: JSDoc comments added, no eslint errors

## UI/UX

- [ ] **Toast messages**: Accurate device count and mode labels
- [ ] **Device fields**: Pre-populated correctly, properly numbered
- [ ] **SITE/Location**: Auto-filled from hostname parsing
- [ ] **Performance**: No lag when adding 50+ devices

---

# PR Checklist

- [ ] Linked to HEX-190 (SPEC), HEX-191 (RESEARCH), HEX-192 (PLAN)
- [ ] Diff matches PLAN "After" blocks
- [ ] Security checks: XSS protection maintained (escapeHtml already in addDeviceField)
- [ ] Screenshots attached (before/after for each mode)
- [ ] Reviewers assigned with task IDs referenced
- [ ] CHANGELOG.md updated (if version bump)

---

# Fail-Safe

## Revert Steps (tested in dev)

- [ ] **Option 1 (Git revert)**: `git revert <commit-hash>`
- [ ] **Option 2 (Feature flag)**: Set `ENABLE_TICKET_POWER_TOOL = false` in vulnerability-cards.js
- [ ] **Verify**: Old code path works after revert

## Backups

- [ ] **Not applicable**: Client-side only, no database changes

## Post-Merge Monitoring

- [ ] **Browser console**: Monitor for JavaScript errors
- [ ] **User feedback**: Check for keyboard shortcut conflicts (macOS/Windows)
- [ ] **Analytics** (if available): Track shortcut usage vs single-click ratio

---

# Notes

**Total Implementation Time**: ~3 hours (2 sessions)

**Session 1 (90 min)**: Tasks 1.1, 1.2
**Session 2 (75 min)**: Tasks 1.3, 1.4

**Critical Success Factors**:
- Backward compatibility maintained throughout
- Existing features (drag-drop, autofill) work correctly
- Keyboard shortcuts tested on all platforms
- No assumptions - all code verified from RESEARCH

**Reference Issues**:
- HEX-190: SPECIFICATION (parent)
- HEX-191: RESEARCH (verified baseline)
- HEX-192: PLAN (task breakdown)
- HEX-144: Keyboard shortcut pattern reference

---

# Quick Reference: Integration Points

**Button Handler**: `app/public/scripts/shared/vulnerability-cards.js:185-188`
```javascript
// BEFORE: onclick="vulnManager.createTicketFromDevice('${device.hostname}')"
// AFTER:  onclick="vulnManager.handleCreateTicketClick(event, '${device.hostname}')"
```

**Modal Pre-Population**: `app/public/scripts/pages/tickets.js:3544-3590`
```javascript
// New JSON structure in sessionStorage.createTicketData:
{
  devices: ["CORP-WKS-001", "CORP-WKS-002"],
  site: "CORP",
  location: "CORP-",
  mode: "single|bulk-all|bulk-kev",
  timestamp: 1728584421000
}
```

**Keyboard Pattern Reference**: `app/public/scripts/pages/vulnerability-statistics.js:545-556`
```javascript
// Cross-platform modifier detection:
(event.metaKey || event.ctrlKey) && event.shiftKey
```

**Autofill Conflict Fix**: `app/public/scripts/pages/tickets.js:580-608`
```javascript
// Add early return in handleLocationToDeviceAutofill:
if (locationField.dataset.powerToolPopulated === "true") return;
```
