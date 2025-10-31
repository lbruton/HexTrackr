---
name: changelog-version-manager
description: Manages HexTrackr changelog version files and version bump process. Triggers when user mentions changelog, version bump, npm run release, creates new version files, or asks about versioning workflow. Validates YAML frontmatter and Overview sections to prevent docs generator failures.
---

# Changelog & Version Manager

## When to Use This Skill

Automatically trigger when the user:
- Mentions "changelog", "version bump", "release", or "npm run release"
- Creates or edits files in `/app/public/docs-source/changelog/versions/`
- Asks about versioning workflow or release process
- Completes a major session or feature (prompt to create changelog entry)

## Critical Requirements

The docs generator (`html-content-updater.js`) REQUIRES both of these for proper rendering:

### 1. YAML Frontmatter (MUST be at top of file)
```yaml
---
title: "Version X.Y.Z - Brief Description"
date: "YYYY-MM-DD"
version: "X.Y.Z"
status: "Released"
category: "Bug Fix|Update|Maintenance|Feature"
---
```

**Why Required**: Without frontmatter → "Unknown date" appears in navigation

### 2. Overview Section (MUST come after frontmatter, before changelog sections)
```markdown
## Overview

One concise paragraph (1-3 sentences) summarizing this version.
```

**Why Required**: Without Overview → HR lines (`---`) from frontmatter appear in Recent Releases summary

## Version Bump Workflow

### Step 1: Create Changelog Version File

**Location**: `/app/public/docs-source/changelog/versions/X.Y.Z.md`

**Use Template**: `/docs/TEMPLATE_CHANGELOG.md`

**Version Strategy**:
- Each major session/feature → new patch version (e.g., v1.1.9 → v1.1.10)
- Major architectural changes → new minor version (e.g., v1.1.10 → v1.2.0)
- Breaking changes → new major version (e.g., v1.2.0 → v2.0.0)

### Step 2: Validate Changelog File

**Automatic**: Run validation script before proceeding
```bash
python3 .claude/skills/changelog-version-manager/scripts/validate_changelog.py app/public/docs-source/changelog/versions/X.Y.Z.md
```

**Required Checks**:
- ✓ YAML frontmatter present with all 5 required fields
- ✓ Overview section exists after frontmatter
- ✓ File located in correct directory
- ✓ Version format matches `X.Y.Z` pattern

### Step 3: One-Button Release

**Command**: `npm run release`

**What It Does**:
1. Prompts for new version number (X.Y.Z)
2. Updates 5 files simultaneously:
   - `package.json` (root)
   - `package-lock.json` (root)
   - `app/package.json` (app)
   - `app/package-lock.json` (app)
   - `DEPLOY/ansible-deploy/roles/nodejs/defaults/main.yml` (deployment)
3. Runs `npm run docs:generate` to regenerate HTML
4. Creates git commit with version bump message
5. Creates git tag (e.g., `v1.1.10`)

**Post-Release**:
- Verify HTML output in `/app/public/docs-html/content/changelog/`
- Check dropdown navigation shows last 10 versions (newest first)
- Update Linear issue to "Done" status
- Push changes: `git push origin dev --tags`

## Rolling Window Architecture (v1.1.0+)

**Auto-Generated Files** (never edit manually):
- `index.md` - Shows last 10 versions with summaries
- `archive.md` - Table of all versions older than last 10

**Example**: When v1.1.10 ships, all v1.0.x versions automatically roll into `archive.md`

## Validation Script Output

**Success**:
```
✓ YAML frontmatter valid (all 5 fields present)
✓ Overview section found
✓ File location correct
✓ Version format valid (X.Y.Z)
✓ Changelog ready for release
```

**Failure Examples**:
```
ERROR: Missing YAML frontmatter
ERROR: Missing required field 'category'
WARNING: Missing Overview section (docs generator needs this)
ERROR: Version format invalid (expected X.Y.Z, got 1.1)
```

## Common Pitfalls to Prevent

1. **Missing frontmatter** → Docs generator shows "Unknown date"
2. **Missing Overview** → HR lines (`---`) appear in summaries
3. **Wrong category value** → Use exact strings: "Bug Fix", "Update", "Maintenance", "Feature"
4. **Manual index.md edits** → File regenerates on next `npm run docs:generate`
5. **Forgetting to push tags** → Deployment expects tagged versions

## Reference Documentation

- **Process Guide**: `/docs/CHANGELOG AND VERSION BUMP PROCESS.md`
- **Template**: `/docs/TEMPLATE_CHANGELOG.md`
- **CLAUDE.md Section**: See "Changelogs" section for complete requirements

## Proactive Assistance

After completing a major session or feature:
1. Ask user: "Ready to create a changelog entry for this session?"
2. Suggest version number based on scope (patch vs minor vs major)
3. Run validation script automatically before `npm run release`
4. Remind user to update Linear issue status
5. Confirm git push with tags
