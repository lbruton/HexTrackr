# rEngine Bug Tracker

> **⚠️ DEPRECATED - Use MASTER_ROADMAP.md Instead**
>
> This tracking system has been consolidated into `/MASTER_ROADMAP.md` for unified project management.
> All rEngine bugs and issues are now tracked there under component-specific sections.
>
> **Go to**: `/MASTER_ROADMAP.md` → Critical Issues & High Priority sections

---

## Active Critical Bugs

### ✅ RESOLVED: Claude API 404 Error in Documentation Generation

- **Date Reported**: 2025-08-19
- **Status**: ✅ RESOLVED
- **Reporter**: Documentation sweep process
- **Description**: Claude API returning 404 errors during doc generation with model `claude-3-5-sonnet-20241022`
- **Root Cause**: Invalid Claude model name in API configuration
- **Impact**: Complete documentation generation failure, HTML conversion blocked
- **Resolution**: Updated model name to `claude-3-5-sonnet-20240620` in:
  - `rEngine/call-llm.js`
  - `rEngine/claude-doc-sweep-and-html.js`
- **Validation**: ✅ Claude API connection test successful
- **Documentation**: `docs/reports/BUG_FIX_CLAUDE_API_404_RESOLUTION.md`
- **Priority**: HIGH → RESOLVED

### 🚨 Document Sweep Cron Jobs Not Executing

- **Date Reported**: 2025-08-18
- **Status**: CRITICAL - ACTIVE
- **Reporter**: System monitoring
- **Description**: Scheduled document sweep jobs (6 AM/6 PM) configured in crontab but not executing
- **Impact**: Missing automated documentation updates, manual intervention required
- **Location**:
  - Crontab entries exist: `0 6 * * * automated-document-sweep.sh` and `0 18 * * * automated-document-sweep.sh`
  - Script exists: `/scripts/automated-document-sweep.sh`
- **Investigation Needed**:
  - [ ] Check cron daemon status
  - [ ] Verify script permissions
  - [ ] Test manual execution of automated script
  - [ ] Check system logs for cron errors
- **Workaround**: Manual document sweep execution
- **Priority**: HIGH

### ⚠️ ES Module Compatibility Issue in Document Sweep

- **Date Reported**: 2025-08-18
- **Status**: ACTIVE
- **Reporter**: Document sweep logs
- **Description**: `ReferenceError: require is not defined` in document-sweep.js
- **Error Location**: `DocumentSweep.printSummary()` at line 366
- **Impact**: Summary printing fails, but sweep completes successfully
- **Root Cause**: Mixed ES module/CommonJS usage
- **Investigation Needed**:
  - [ ] Audit all require() statements in ES modules
  - [ ] Convert to import statements or use createRequire()
  - [ ] Test summary functionality after fix
- **Workaround**: Sweep completes without summary display
- **Priority**: MEDIUM

## Active Minor Issues

### 📊 Document Sweep Duration Reporting

- **Date Reported**: 2025-08-18
- **Status**: ACTIVE
- **Description**: Duration shows as "NaNs" in sweep completion report
- **Impact**: Unable to monitor performance trends
- **Root Cause**: Timing calculation error
- **Priority**: LOW

## Recently Resolved

### ✅ MCP Server Connection Reliability

- **Date Reported**: 2025-08-17
- **Date Resolved**: 2025-08-17
- **Status**: RESOLVED
- **Description**: MCP server disconnections causing agent memory failures
- **Solution**: Implemented `mcp-fallback-handler.js` with automatic JSON fallback
- **Result**: 100% memory continuity even during MCP outages

### ✅ Split Scribe Console Terminal Integration

- **Date Reported**: 2025-08-17
- **Date Resolved**: 2025-08-17
- **Status**: RESOLVED
- **Description**: Console launching in VS Code terminal instead of Terminal.app
- **Solution**: Updated launch commands to use osascript for Terminal.app
- **Result**: Proper split-screen console functionality restored

## Bug Report Template

```markdown

### 🐛 [Bug Title]

- **Date Reported**: YYYY-MM-DD
- **Status**: ACTIVE/RESOLVED/INVESTIGATING
- **Reporter**: [Name/System]
- **Description**: [Brief description]
- **Impact**: [User/system impact]
- **Location**: [File/function/line]
- **Steps to Reproduce**:
  1. [Step 1]
  2. [Step 2]
  3. [Step 3]
- **Expected Behavior**: [What should happen]
- **Actual Behavior**: [What actually happens]
- **Investigation Needed**:
  - [ ] [Task 1]
  - [ ] [Task 2]
- **Workaround**: [Temporary solution]
- **Priority**: CRITICAL/HIGH/MEDIUM/LOW

```

## Escalation Process

1. **CRITICAL**: Immediate attention, system unusable
2. **HIGH**: Affects core functionality, requires prompt fix
3. **MEDIUM**: Affects secondary features, can be scheduled
4. **LOW**: Minor issues, cosmetic problems

## Testing Protocol

Before marking any bug as resolved:

1. [ ] Reproduce the original issue
2. [ ] Apply the fix
3. [ ] Verify fix resolves the issue
4. [ ] Test for regression in related functionality
5. [ ] Update documentation if needed
6. [ ] Create git checkpoint

---

*Last Updated: 2025-08-18*
*Next Review: 2025-08-19*
