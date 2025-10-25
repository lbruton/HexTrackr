---
title: "Version X.Y.Z - Brief Description of Release"
date: "YYYY-MM-DD"
version: "X.Y.Z"
status: "Released"
category: "Bug Fix|Update|Maintenance|Feature"
---

# Version X.Y.Z - Brief Description of Release

**Release Status**: ✅ Released
**Release Date**: YYYY-MM-DD
**Parent Issues**: [HEX-XXX](https://linear.app/hextrackr/issue/HEX-XXX)

## Overview

**REQUIRED**: One concise paragraph (1-3 sentences) summarizing what this version accomplishes. This appears in the changelog index as the version summary. DO NOT skip this section - it's required for the documentation generator to create proper summaries.

---

## [X.Y.Z]

### Added

#### Feature Name (HEX-XXX/YYY/ZZZ) - YYYY-MM-DD

**Description**: One-sentence summary of what was added and why.

**Key Features**:
- Feature detail 1 with technical specifics
- Feature detail 2 with user-facing benefits
- Feature detail 3 with implementation notes

**Technical Implementation**:
- Component/module affected and how
- API endpoints added or modified
- Database schema changes (if any)

**Use Case**: Real-world scenario where this feature provides value.

**Files Modified**:
- `app/path/to/file1.js`: Description of changes made
- `app/path/to/file2.js`: Description of changes made
- `app/public/path/to/file3.js`: Description of changes made

**Validation**:
-  Feature works as expected in development (https://dev.hextrackr.com)
- Feature works as expected in production (https://hextrackr.com)
- No console errors or warnings
- Passes ESLint validation
- Cross-browser tested (Chrome, Firefox, Safari)
- Dark/light theme compatibility verified

**Issues**:
- [HEX-XXX](https://linear.app/hextrackr/issue/HEX-XXX) - RESEARCH: Feature Name
- [HEX-YYY](https://linear.app/hextrackr/issue/HEX-YYY) - PLAN: Feature Name
- [HEX-ZZZ](https://linear.app/hextrackr/issue/HEX-ZZZ) - IMPLEMENT: Feature Name

---

### Fixed

- Fixed [specific bug] that caused [symptom] when [trigger condition]
- Resolved [issue] affecting [component/feature] by [solution approach]
- Corrected [behavior] to properly [expected behavior]
- Eliminated [problem] causing [impact] in [scenario]

**Technical Fixes** (if complex):
- Fixed race condition in `module.js` where [technical explanation]
- Resolved memory leak in [component] by [solution]
- Corrected SQL query in [service] to handle [edge case]

---

### Changed

- Changed [component/behavior] from [old way] to [new way] for [reason]
- Updated [dependency/library] from vX to vY for [benefit]
- Refactored [module] to improve [performance/maintainability/clarity]
- Modified [configuration] to support [new requirement]

---

### Deprecated

- Deprecated [feature/method] in favor of [replacement] (will be removed in vX.Y.Z)
- [Component] is now deprecated; use [alternative] instead
- **Migration Guide**: [Brief instructions for updating code]

---

### Removed

- Removed [obsolete feature] (deprecated since vX.Y.Z)
- Cleaned up [unused code/dependency] to reduce [impact]
- Eliminated [redundant functionality] replaced by [better approach]

---

### Security

- Implemented [security measure] to prevent [threat]
- Updated [dependency] to patch [CVE-YYYY-XXXXX]
- Enhanced [security feature] with [improvement]
- Strengthened [protection mechanism] against [attack vector]

---

## Notes

### Breaking Changes

**⚠️ BREAKING**: [Description of breaking change]

**Migration Required**:
1. Step 1 to update
2. Step 2 to update
3. Step 3 to update

**Affected Users**: [Who this impacts and how]

### Performance Improvements

- [Specific performance gain] in [component]: [X% faster / Y MB less memory]
- Optimized [operation] reducing [metric] by [amount]

### Known Issues

- **Issue**: [Description of known limitation]
  - **Workaround**: [Temporary solution if available]
  - **Fix Planned**: [Future version or issue tracking]

---

## Changelog Entry Instructions

**Before Committing**:
1. Replace all `X.Y.Z` with actual version number
2. Replace all `YYYY-MM-DD` with actual release date
3. Replace all `HEX-XXX` with actual Linear issue IDs
4. Fill in all sections relevant to this release (delete unused sections)
5. Update `app/public/docs-source/changelog/index.md` with new version
6. Update `app/public/docs-source/ROADMAP.md` with current version
7. Update `package.json` version (use `npm version patch|minor|major`)

**Section Guidelines**:
- **Added**: New features, capabilities, or functionality
- **Fixed**: Bug fixes and corrections
- **Changed**: Modifications to existing features
- **Deprecated**: Features marked for future removal
- **Removed**: Features that have been removed
- **Security**: Security-related changes and patches

**Writing Style**:
- Use past tense ("Added", "Fixed", "Changed")
- Be specific and technical but clear
- Include file paths for code changes
- Link to Linear issues for traceability
- Add validation checkmarks to show testing
- Describe user-facing impact, not just technical changes

**Link Formats**:
- Internal: `#changelog/versions/X.Y.Z`
- Linear: `https://linear.app/hextrackr/issue/HEX-XXX`
- Files: `` `app/path/to/file.js` ``

---

*Template Version: 1.0 | Last Updated: 2025-10-09*
