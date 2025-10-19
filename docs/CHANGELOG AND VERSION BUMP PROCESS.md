## Version Bump & Changelog Workflow

**Used for**: Checkpoint/rewind workflow sessions (HEX-254), feature releases, hotfixes

### Version Bump Procedure

**Step 1: Edit package.json**
```bash
# Manually update version in root package.json
# Example: "version": "1.0.71" → "version": "1.0.72"
```

**Step 2: Run release script**
```bash
npm run release
```

This automatically syncs version across 5 files:
- `package.json` (root)
- `app/public/package.json`
- `app/public/scripts/shared/footer.html`
- `README.md`
- `docker-compose.yml`
- `app/public/login.html`

**Step 3: Verify sync**
```bash
# Check all 5 files have matching version
grep -n "1.0.72" package.json app/public/package.json README.md docker-compose.yml app/public/login.html app/public/scripts/shared/footer.html
```

### Changelog Template Process

**Step 1: Create new version file**

**File**: `/app/public/docs-source/changelog/versions/[VERSION].md`

**Template Structure**:
```markdown
---
title: "Version [VERSION] - [Feature Name]: [Brief Description]"
date: "YYYY-MM-DD"
version: "[VERSION]"
status: "In Progress" | "Released"
category: "Enhancement" | "Bug Fix" | "Security" | "Performance" | "Documentation"
---

# Version [VERSION] - [Feature Name]: [Brief Description]

**Release Status**: 🚧 In Progress | ✅ Released
**Release Date**: TBD | YYYY-MM-DD
**Parent Issue**: [HEX-XXX](https://linear.app/hextrackr/issue/HEX-XXX)
**Implementation**: [HEX-XXX](https://linear.app/hextrackr/issue/HEX-XXX) Session N

## Overview

[1-2 sentence description of what this version accomplishes]

## Implementation Tasks

### Planned
- [ ] Task 1
- [ ] Task 2
- [ ] Task 3

### Completed
- [ ] TBD (updated during implementation)

## Technical Details

**Files Modified**:
- `path/to/file.js` - Description of changes
- `path/to/other.js` - Description of changes

**Migration Pattern** (if applicable):
```javascript
// BEFORE
console.log("Old pattern");

// AFTER
this._log('info', "New pattern", { context });
```

## Success Criteria

- [X] Version bumped to [VERSION] across 5 files
- [ ] Specific success criterion 1
- [ ] Specific success criterion 2
- [ ] Testing verified

## Related Issues

- Parent: [HEX-XXX](link) - Parent issue title
- Implementation: [HEX-XXX](link) - Implementation issue title
- Session: [HEX-XXX](link) - Session-specific issue (if applicable)

## Progress

**Sessions Complete**: N/Total (X%)
- Session 1: Description (vX.X.X)
- Session 2: Description (vX.X.X)
- Session N: Current session (vX.X.X)
```

**Step 2: Update changelog index**

**File**: `/app/public/docs-source/changelog/index.md`

Update two sections:

1. **Current Version** (top of file):
```markdown
**Current Version**: [v1.0.72](#changelog/versions/1.0.72) In Progress
```

2. **Latest Releases** (version list):
```markdown
- [**v1.0.72**](#changelog/versions/1.0.72) - 2025-10-17 - Feature Name: Brief Description
- [**v1.0.71**](#changelog/versions/1.0.71) - 2025-10-17 - CHAPrevious Feature
```

**Step 3: Commit version bump**
```bash
git add -A
git commit -m "chore: Version bump to v[VERSION] for [HEX-XXX] Session N"
```

### Version Numbering Strategy

**Format**: `MAJOR.MINOR.PATCH`

- **MAJOR**: Breaking changes (e.g., 2.0.0)
- **MINOR**: New features, backwards compatible (e.g., 1.1.0)
- **PATCH**: Bug fixes, small enhancements (e.g., 1.0.72)

**HEX-254 Strategy** (Logging System):
- Each session increments PATCH version
- Session 7 → v1.0.71
- Session 8 → v1.0.72
- Session 9 → v1.0.73 (etc.)

**Feature Releases**:
- Significant features increment MINOR version
- Example: Palo Alto integration → v1.1.0

**Breaking Changes**:
- Database schema changes requiring migration → MAJOR version
- API changes breaking backwards compatibility → MAJOR version