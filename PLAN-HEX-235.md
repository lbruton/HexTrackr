# HEX-235: Fix opt+shift Power Tool for 30-day Report Download

**Issue**: https://linear.app/hextrackr/issue/HEX-235
**Status**: In Progress
**Created**: 2025-10-15
**Assignee**: Lonnie B.

---

## Problem Statement

When clicking on VPR cards with **opt+shift** (Alt+Shift on Mac), it should download a 30-day historical comparison report, similar to the **cmd+shift** shortcut that downloads the 7-day report. Currently, this keyboard shortcut combination does not trigger the 30-day export.

---

## Research Findings

### Current Implementation Analysis

**File**: `app/public/scripts/shared/vulnerability-statistics.js`
**Method**: `_handleCardClick()` (lines 570-605)

#### Existing Keyboard Shortcuts

| Shortcut | Condition | Action | Line |
|----------|-----------|--------|------|
| **Cmd+Shift+Alt+Click** | `cmdOrCtrl && shift && alt` | Latest vs Previous (`exportVprWeeklySummary()`) | 577-582 |
| **Cmd+Shift+Click** | `cmdOrCtrl && shift && !alt` | 7-day comparison (`exportVprHistoricalComparison(7)`) | 586-591 |
| **Cmd+Alt+Click** | `cmdOrCtrl && alt && !shift` | 30-day comparison (`exportVprHistoricalComparison(30)`) | 595-600 |

#### Root Cause

The current implementation requires **Cmd+Alt** (without Shift) for the 30-day export (line 595):

```javascript
// 30-Day comparison
if (cmdOrCtrl && alt && !shift) {
    // Cmd+Alt+Click = 30-day comparison
    event.preventDefault();
    event.stopPropagation();
    this.exportVprHistoricalComparison(30);
    return;
}
```

However, the user expects **Alt+Shift** (without Cmd) to trigger the 30-day report, which is currently not handled.

### Expected Behavior

**Alt+Shift+Click** (opt+shift on Mac) should call `exportVprHistoricalComparison(30)` to download a 30-day historical comparison CSV.

---

## Solution Design

### Option 1: Add Alt+Shift as Alternative Trigger (RECOMMENDED)

**Pros**:
- Maintains backward compatibility (Cmd+Alt still works)
- Provides ergonomic alternative (Alt+Shift is easier to press than Cmd+Alt)
- Follows pattern from device modal (Alt+Shift for bulk operations)

**Cons**:
- Two shortcuts for same action (could be confusing)

### Option 2: Replace Cmd+Alt with Alt+Shift

**Pros**:
- Single, clear shortcut per action
- Consistent with user expectation

**Cons**:
- Breaking change if users already use Cmd+Alt
- Less discoverable (no Cmd key anchor)

**Decision**: **Option 1** - Add Alt+Shift as an additional trigger for consistency with device modal power tools.

---

## Implementation Plan

### Task Breakdown

**Task 1**: Add Alt+Shift keyboard shortcut condition
**File**: `app/public/scripts/shared/vulnerability-statistics.js`
**Location**: Lines 594-601 (after Cmd+Shift condition, before Cmd+Alt condition)
**Estimate**: 5 minutes

**Changes**:
1. Insert new condition block after line 592 (before the Cmd+Alt check)
2. Check for `alt && shift && !cmdOrCtrl`
3. Call `exportVprHistoricalComparison(30)`
4. Update inline comment to reflect new shortcut

**Code Change**:
```javascript
// 30-Day comparison (Alt+Shift - power user shortcut)
if (alt && shift && !cmdOrCtrl) {
    // Alt+Shift+Click = 30-day comparison (opt+shift on Mac)
    event.preventDefault();
    event.stopPropagation();
    this.exportVprHistoricalComparison(30);
    return;
}

// 30-Day comparison (Cmd+Alt - alternative shortcut)
if (cmdOrCtrl && alt && !shift) {
    // Cmd+Alt+Click = 30-day comparison (legacy)
    event.preventDefault();
    event.stopPropagation();
    this.exportVprHistoricalComparison(30);
    return;
}
```

**Task 2**: Update JSDoc comment
**File**: `app/public/scripts/shared/vulnerability-statistics.js`
**Location**: Lines 562-569 (method JSDoc)
**Estimate**: 2 minutes

**Changes**:
- Update JSDoc to document all 4 keyboard shortcuts clearly

**Task 3**: Test all keyboard shortcuts
**Estimate**: 5 minutes

**Test Cases**:
1. ✅ Cmd+Shift+Alt+Click → Weekly summary export
2. ✅ Cmd+Shift+Click → 7-day comparison export
3. ✅ **Alt+Shift+Click** → **30-day comparison export** (NEW)
4. ✅ Cmd+Alt+Click → 30-day comparison export (legacy)
5. ✅ Normal click → Card flip (no modifiers)

---

## Validation Criteria

### Acceptance Criteria

1. **Alt+Shift+Click** on any VPR card triggers 30-day historical CSV download
2. **Cmd+Alt+Click** continues to work (backward compatibility)
3. All other keyboard shortcuts remain functional (Cmd+Shift, Cmd+Shift+Alt)
4. Normal card click behavior unchanged
5. Console logs successful export message
6. CSV filename format: `vpr-comparison-30day-YYYY-MM-DD.csv`

### Test Environment

- **URL**: https://dev.hextrackr.com
- **Browser**: Chrome/Safari on macOS
- **Test User**: Authenticated user with vulnerability data
- **Data Requirements**: Vulnerability snapshots spanning at least 30 days

---

## Implementation Notes

### Why Alt+Shift Instead of Cmd+Alt?

The current Cmd+Alt shortcut is less ergonomic than Alt+Shift because:
1. **Thumb positioning**: Cmd (thumb) + Alt (pinky) requires uncomfortable hand stretching
2. **Consistency**: Device modal already uses Alt+Shift for "all devices at location" bulk operations
3. **User expectation**: User specifically requested "opt+shift" (Alt+Shift)

By adding Alt+Shift as an alternative, we provide the ergonomic shortcut while maintaining backward compatibility.

### Order of Conditions Matters

The condition checks must be ordered from most specific to least specific:
1. Cmd+Shift+Alt (all 3 modifiers)
2. Cmd+Shift (2 modifiers with Cmd)
3. **Alt+Shift** (2 modifiers without Cmd) ← NEW
4. Cmd+Alt (2 modifiers with Cmd)

This prevents Alt+Shift from being caught by the Cmd+Alt condition if evaluation order were reversed.

---

## Rollback Plan

If issues arise, revert the single condition block addition (lines ~594-600). The change is isolated to one conditional block with no side effects.

---

## Related Issues

- **HEX-144**: Original VPR export shortcut implementation
- **HEX-203**: Device modal power tools with Alt+Shift pattern (design precedent)

---

## Estimated Total Time

- Research: 10 minutes (completed)
- Implementation: 5 minutes
- Testing: 5 minutes
- Documentation: 2 minutes
- **Total**: ~22 minutes

---

## Completion Checklist

- [ ] Add Alt+Shift condition to `_handleCardClick()`
- [ ] Update JSDoc comment with new shortcut documentation
- [ ] Test all 5 keyboard shortcut combinations
- [ ] Verify CSV download with correct filename format
- [ ] Update Linear issue with completion notes
- [ ] Git commit with descriptive message
- [ ] Rewind to checkpoint

---

**Plan Created**: 2025-10-15
**Ready for Implementation**: ✅ Yes
