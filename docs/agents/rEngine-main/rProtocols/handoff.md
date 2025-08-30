# Protocol: Agent Handoff (DEPRECATED)

**Status**: DEPRECATED - Use `session_handoff_protocol.md` instead  
**Reason**: Replaced by comprehensive session handoff system  
**Migration Date**: August 19, 2025  

## ⚠️ **This Protocol is Outdated**

This handoff protocol has been replaced by a comprehensive session management system. Please use the new protocol instead.

## 🔄 **New Protocol Location**

**Use Instead**: [`session_handoff_protocol.md`](session_handoff_protocol.md)

### **Key Improvements in New System**

- **MCP Memory Integration**: Automatic storage in memory system
- **Backup File System**: Timestamped files in `/rDocuments/handoffs/` directory
- **Structured Format**: Consistent handoff templates
- **Git Integration**: Automatic checkpoints with handoffs
- **User Confirmation**: Clear completion notices
- **Error Handling**: Fallback systems for reliability

### **Migration Instructions**

**For Users**:

- Use "summarize" command instead of manual handoffs
- Reference new protocol for current procedures
- Check `/rDocuments/handoffs/` directory for session backups

**For AI Agents**:

- Follow `session_handoff_protocol.md` for all handoffs
- Create MCP memory entities for handoff data
- Generate timestamped backup files
- Provide user confirmation of completion

---

## 📚 **Legacy Content** (For Historical Reference)

The content below is preserved for historical reference but should not be used for current operations.

---

## Quick Start Workflow

## Essential Commands to Get Started:

1. `read_file rProtocols/unified-workflow.md 1 100` - Get full workflow context
2. `read_file rAgents/tasks.json 105 180` - Read your assigned table audit project
3. `read_file rAgents/github_copilot_memories.json 1 -1` - Get session history and discoveries
4. `create_file rAgents/claude_sonnet_memories.json` - Create your memory file (use JSON structure from workflow)

**Your Project:** `table_audit_2025_08_16` has 4 phases, Phase 1 is URGENT and ready to start immediately.

## Issue Summary

There is a critical table hover styling bug in the StackTrackr inventory table. When users hover over table rows, it's causing visual artifacts and style changes in OTHER rows, disrupting the table's visual integrity.

## Evidence Provided

User provided two screenshots showing:

- Normal table state with proper zebra striping (alternating row colors)
- Corrupted state during hover interactions where other rows are visually affected

## Expected Symptoms

- Hovering over any table row causes style changes in other rows
- Zebra striping pattern gets disrupted during hover states
- Visual artifacts appear when moving mouse across table rows
- CSS specificity conflicts between hover states and row styling

## Your Task (Phase 1 - Critical Priority)

**File:** `rAgents/tasks.json` - Project: `table_audit_2025_08_16` - Phase 1
**Estimated Time:** 15 minutes
**Status:** Assigned to you immediately

### Primary Objectives

1. **Identify the CSS hover conflict** in `css/styles.css`
2. **Fix table row hover effects** to not affect other rows
3. **Maintain zebra striping** during all hover interactions
4. **Test with large dataset** (1319+ items as shown in user screenshots)

### Files to Investigate

- `css/styles.css` - Primary CSS file with table styling
- `js/inventory.js` - Table rendering logic
- `index.html` - Table structure

### Expected Root Causes

- CSS specificity conflicts between `:hover` pseudo-selectors and zebra striping classes
- Possible JavaScript DOM manipulation affecting multiple rows during hover
- CSS cascade issues with alternating row background colors

### Success Criteria

- [ ] Table row hover effects work properly without affecting other rows
- [ ] Zebra striping maintained during hover states  
- [ ] No visual artifacts on hover interactions
- [ ] Fix validated across different table sizes

### Testing Requirements

- Test hover interactions across multiple rows
- Validate with both small and large datasets
- Ensure cross-browser compatibility
- Test rapid mouse movement across table

### Handoff Context

- StackTrackr v3.04.95 just completed critical JavaScript fixes
- Application is fully functional with 1319+ inventory items loaded
- This hover issue affects user experience significantly
- User wants comprehensive table audit after this urgent fix

## Next Steps After Fix

1. Document the fix in your memory/analysis files
2. Continue with Phase 2: Table Function Documentation
3. Proceed through remaining audit phases

## Contact

If you need additional context or screenshots, the user and I are available for clarification.

**BEGIN IMMEDIATELY** - This is affecting active user experience.

---
**Delegation Status:** ✅ Active  
**Expected Start:** Immediate  
**Expected Completion:** Within 15 minutes
