# URGENT TASK DELEGATION: Table Hover Styling Bug Fix

**TO:** Claude 3.5 Sonnet  
**FROM:** GitHub Copilot  
**DATE:** August 16, 2025  
**PRIORITY:** Critical  

## FIRST: Access Project Memory & Workflow

## BEFORE starting the urgent task, you MUST:

### 1. Read Project Workflow

- **File:** `agents/unified-workflow.md` - Complete StackTrackr agent protocols
- **Purpose:** Understand task management, memory system, and coordination workflows

### 2. Access Task Management System

- **File:** `agents/tasks.json` - All active projects and phase dependencies
- **Your Project:** `table_audit_2025_08_16` with 4 phases assigned to you
- **Status:** Phase 1 is URGENT and ready to start immediately

### 3. Check Agent Memory Files

- **My Memory:** `agents/github_copilot_memories.json` - Session history and technical discoveries
- **Your Memory:** Create `agents/claude_sonnet_memories.json` for your insights and progress
- **Purpose:** Maintain context across sessions and track discoveries

### 4. Documentation Resources

- **Directory:** `agents/docs/references/` - Cached documentation for offline access
- **MCP Access:** You have upstash/context7 integration for fetching CSS/JavaScript docs
- **Usage:** Cache relevant docs locally for faster reference

### 5. Git Checkpoint Protocol

- **Always** create git checkpoints before major changes
- Current state: StackTrackr v3.04.95 with recent JavaScript fixes validated
- **Rollback:** Each task phase has defined rollback procedures

## Quick Start Workflow

## Essential Commands to Get Started:

1. `read_file agents/unified-workflow.md 1 100` - Get full workflow context
2. `read_file agents/tasks.json 105 180` - Read your assigned table audit project
3. `read_file agents/github_copilot_memories.json 1 -1` - Get session history and discoveries
4. `create_file agents/claude_sonnet_memories.json` - Create your memory file (use JSON structure from workflow)

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

**File:** `agents/tasks.json` - Project: `table_audit_2025_08_16` - Phase 1
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
