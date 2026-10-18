---
tags: []
doc_type: guide
project: hextrackr
source: manual
created: "2026-03-12"
updated: "2026-03-12"
sourceFiles:
  - "docs/CHANGELOG AND VERSION BUMP PROCESS.md"
---

# Version Management

**Used for**: Feature releases, bug fixes, code cleanup, documentation updates

**IMPORTANT**: This document describes the **AUTOMATED** workflow. The docs generator automatically handles changelog index management and version syncing.

---

## Version Bump Procedure (Automated - One Command!)

### Step 1: Update version in root package.json

Use npm version command (recommended) OR manual edit:

```bash
# Option A: Use npm version (recommended - creates git tag automatically)
npm version patch  # Bug fixes, small changes
npm version minor  # New features
npm version major  # Breaking changes

# Option B: Manual edit (no git tag)
# Edit package.json: "version": "X.Y.Z" -> "X.Y.Z+1"
```

### Step 2: Run ONE command to sync everything

```bash
npm run release
```

**That's it!** This single command automatically:

1. **Syncs version** from root package.json to **7 files**:
   - `app/public/package.json`
   - `app/public/scripts/shared/footer.html`
   - `app/public/server.js` (fallback version)
   - `app/public/login.html`
   - `README.md`
   - `docker-compose.yml`
   - All documentation markdown files

2. **Regenerates changelog navigation**:
   - `changelog/index.md` (last 10 versions with summaries)
   - `changelog/archive.md` (all older versions in table)
   - Rolling window dropdown (newest 10 only)

3. **Converts all markdown to HTML**:
   - 130+ documentation files
   - Changelog versions with proper dates and summaries
   - JSDoc API documentation with dark mode theme

**Note**: `npm run release` and `npm run docs:generate` are the same command (both run `html-content-updater.js`)

---

## Changelog Creation Process (Automated)

### Step 1: Create new version file

**File**: `/app/public/docs-source/changelog/versions/[VERSION].md`

**Use template**: `/docs/TEMPLATE_CHANGELOG.md`

**CRITICAL**: Every changelog MUST include:
1. **YAML frontmatter** (at top of file)
2. **Overview section** (after metadata, before changelog sections)

Without these, the docs generator will show "Unknown date" and HR lines instead of summaries.

**Minimal Required Structure**:
```markdown
---
title: "Version X.Y.Z - Brief Description"
date: "YYYY-MM-DD"
version: "X.Y.Z"
status: "Released"
category: "Bug Fix|Update|Maintenance|Feature"
---

# Version X.Y.Z - Brief Description

**Release Status**: Released
**Release Date**: YYYY-MM-DD
**Parent Issues**: [HEX-XXX](https://linear.app/hextrackr/issue/HEX-XXX)

## Overview

One concise paragraph (1-3 sentences) summarizing what this version accomplishes.

---

## [X.Y.Z]

### Fixed
- Fixed issue description

### Added
- Added feature description
```

### Step 2: Run release command

```bash
npm run release
```

This single command automatically:
- Syncs version from package.json to all 7 files
- Adds your new version to `index.md` (auto-generated)
- Updates archive table if needed (auto-generated)
- Regenerates all HTML with proper summaries and dates
- Updates rolling window dropdown (last 10 versions)
- Regenerates JSDoc with dark mode theme

**DO NOT manually edit**:
- `changelog/index.md` (AUTO-GENERATED)
- `changelog/archive.md` (AUTO-GENERATED)

### Step 3: Commit changes

```bash
git add -A
git commit -m "release: vX.Y.Z - [Brief Description] ([HEX-XXX])"
git push origin dev
```

---

## Version Numbering Strategy

**Format**: `MAJOR.MINOR.PATCH`

- **MAJOR**: Breaking changes (e.g., 2.0.0)
- **MINOR**: New features, backwards compatible (e.g., 1.1.0)
- **PATCH**: Bug fixes, small enhancements (e.g., 1.0.72)

**Feature Releases**:
- Significant features increment MINOR version

**Breaking Changes**:
- Database schema changes requiring migration -> MAJOR version
- API changes breaking backwards compatibility -> MAJOR version

---

## Related

- [[Git Workflow]]
- [[Schema Evolution]]
- [Overview](/Volumes/DATA/GitHub/Devops/DocVault/Projects/HexTrackr/Overview.md)
