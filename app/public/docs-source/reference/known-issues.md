# Known Issues Tracker

This document tracks all security vulnerabilities, performance issues, and quality concerns identified through automated code reviews. Each issue includes a checkbox for tracking resolution status, file location, and reference to the original review report.

## Review Reports Archive

All detailed analysis reports are stored in `/subagents/reviews/` organized by date.

---

## 🔴 Critical Issues (Must Fix Immediately)

### Security Vulnerabilities

- [ ] **CSV Injection Vulnerability** - `vulnerability-core.js:653-655` ([Review: 2025-09-18](../../../../subagents/reviews/2025-09-18/20250918-164008-review-final.md#L18))
  - **Risk**: Formula injection in Excel/spreadsheet applications
  - **Fix**: Sanitize cells starting with `=`, `+`, `-`, `@` by prefixing with `'`
  - **Code Location**: `exportVulnerabilityReport()` method

  ```javascript
  // Required fix: Prevent formula injection
  .replace(/^[=+\-@]/g, "'$&")
  ```

### Memory Leaks

- [ ] **UI Event Listeners Memory Leak** - `vulnerability-core.js:148-208, 763-798` ([Review: 2025-09-18](../../../../subagents/reviews/2025-09-18/20250918-164008-review-final.md#L31))
  - **Risk**: Prevents garbage collection, causes performance degradation
  - **Fix**: Store listener references and remove in destroy() method
  - **Impact**: Long-running sessions will exhaust memory

- [ ] **Theme Listeners Memory Leak** - `vulnerability-core.js:224-261` ([Review: 2025-09-18](../../../../subagents/reviews/2025-09-18/20250918-164008-review-final.md#L51))
  - **Risk**: Theme change listeners never removed
  - **Fix**: Store listener references for cleanup
  - **Impact**: Memory accumulation on theme changes

### Input Validation

- [ ] **File Upload Validation Missing** - `vulnerability-core.js:414-418` ([Review: 2025-09-18](../../../../subagents/reviews/2025-09-18/20250918-164008-review-final.md#L57))
  - **Risk**: Accepts any file type without validation
  - **Fix**: Check file extension, MIME type, and size limits
  - **Required**: `.csv` files only, max 100MB

---

## 🟠 High Priority Issues (Fix This Sprint)

### Performance Violations

- [ ] **WebSocket Timeout Violation** - `vulnerability-core.js:92-99` ([Review: 2025-09-18](../../../../subagents/reviews/2025-09-18/20250918-164008-review-final.md#L64))
  - **Issue**: 5-second timeout exceeds constitutional requirement (<50ms for WebSocket)
  - **Fix**: Reduce timeout to 3 seconds max
  - **Constitutional Reference**: Article V Section I

### Documentation Compliance

- [ ] **JSDoc Coverage Missing** - `vulnerability-core.js:multiple` ([Review: 2025-09-18](../../../../subagents/reviews/2025-09-18/20250918-164008-review-final.md#L69))
  - **Issue**: Multiple public methods lack JSDoc documentation
  - **Requirement**: 100% JSDoc coverage per constitution Article I Section III
  - **Methods Missing Docs**:
    - `setupEventListeners()`
    - `setupThemeHandling()`
    - `setupWebSocketListeners()`
    - `showToast()`
    - `flipStatCards()`

---

## 🟡 Medium Priority Issues (Next Sprint)

### Architecture & Maintainability

- [ ] **Module Loading Inconsistency** - `vulnerability-core.js:12-19` ([Review: 2025-09-18](../../../../subagents/reviews/2025-09-18/20250918-164008-review-final.md#L77))
  - **Issue**: Mixed ES6 modules and global script dependencies
  - **Fix**: Refactor to consistent ES6 module pattern
  - **Impact**: Maintainability and testing complexity

### Data Sanitization

- [ ] **Filename Sanitization** - `vulnerability-core.js:639` ([Review: 2025-09-18](../../../../subagents/reviews/2025-09-18/20250918-164008-review-final.md#L83))
  - **Issue**: Special characters in hostnames create confusing filenames
  - **Fix**: `hostname.replace(/[^a-zA-Z0-9_-]/g, '_')`
  - **Impact**: User experience when exporting files

---

## Constitutional Violations Summary

### Failed Requirements

- ❌ **Article I Section III**: JSDoc 100% coverage requirement
- ❌ **Article I Section VIII**: Security practices - input validation gaps
- ❌ **Article V Section I**: Performance requirements - WebSocket timeout
- ❌ **Article V Section III**: Resource constraints - memory leaks

### Compliance Path

1. Complete JSDoc documentation (6 methods)
2. Fix security vulnerabilities (2 critical)
3. Address performance violations (1 timeout issue)
4. Implement resource cleanup (2 memory leaks)

---

## Metrics Summary

| Metric | Count | Status |
|--------|-------|--------|
| Critical Issues | 4 | 🔴 Unresolved |
| High Priority | 2 | 🟠 Unresolved |
| Medium Priority | 2 | 🟡 Unresolved |
| Constitutional Violations | 4 | ❌ Failed |
| Security Vulnerabilities | 2 | 🔴 Critical |
| Memory Leaks | 2 | 🔴 Critical |
| Performance Issues | 1 | 🟠 High |

---

## Recommended Implementation Order

### Phase 1: Security Critical (Immediate)

1. Fix CSV injection vulnerability
2. Add file upload validation
3. Implement memory leak fixes

### Phase 2: Compliance (This Sprint)

1. Complete JSDoc documentation
2. Fix WebSocket timeout
3. Add test coverage

### Phase 3: Quality (Next Sprint)

1. Refactor module architecture
2. Add filename sanitization
3. Extract utility functions

---

## Tracking Instructions

1. Check off issues as they are resolved
2. Add PR numbers when fixes are implemented
3. Update review date when re-reviewing
4. Add new issues from future reviews below

---

## Additional Issues (From Future Reviews)

_This section will be populated as more files are reviewed_

---

_Last Updated: 2025-09-18_
_Review Tool: Code Review Agent with Gemini Cross-Validation_
