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

**There is no automated bump script.** `npm run release` is an alias for `npm run docs:generate`
(`node app/public/docs-html/html-content-updater.js`): it only regenerates the docs HTML. It does not
prompt for a version, edit version strings, commit or tag. The bump is manual.

HexTrackr is **main-only**: `main` is the deploy branch (Portainer redeploys on merge). Do the bump in a
worktree branch cut from `origin/main` and ship it through a PR to `main`. Never push to `main` directly.

**Version Strategy**:
- Each major session/feature → new patch version (e.g., v1.1.9 → v1.1.10)
- Major architectural changes → new minor version (e.g., v1.1.10 → v1.2.0)
- Breaking changes → new major version (e.g., v1.2.0 → v2.0.0)

### Step 1: Bump the Version Strings (8 files)

Replace the old version with the new one in each of these. Grep for the old version first
(`grep -rn "OLD" --exclude-dir=node_modules --exclude-dir=docs-html --exclude-dir=.git .`) and confirm
every hit below is covered and no others are expected.

| File | What to change |
|---|---|
| `package.json` | `"version"` |
| `package-lock.json` | the two top-level `"version"` lines only (lines 3 and 9); leave dependency versions alone |
| `app/public/package.json` | `"version"` |
| `docker-compose.yml` | `HEXTRACKR_VERSION=X.Y.Z` |
| `README.md` | version badge URL and the `Current version: **vX.Y.Z**` line |
| `app/public/login.html` | `HexTrackr vX.Y.Z • Secure Authentication` |
| `app/public/scripts/shared/footer.html` | `HexTrackr-vX.Y.Z` in the shields.io badge URL |
| `app/public/docs-source/reference/troubleshooting.md` | `**Version**: vX.Y.Z` |

### Step 2: Create the Changelog Version File

**Location**: `app/public/docs-source/changelog/versions/X.Y.Z.md`

There is no template file. Copy the most recent version file in that directory and edit it: frontmatter
(all 5 fields), `# Version X.Y.Z - Title`, release status/date lines, `## Overview`, then the change
sections.

### Step 3: Validate the Changelog File

```bash
python3 .agents/skills/release/scripts/validate_changelog.py app/public/docs-source/changelog/versions/X.Y.Z.md
```

**Required Checks**:
- ✓ YAML frontmatter present with all 5 required fields
- ✓ Overview section exists after frontmatter
- ✓ File located in correct directory
- ✓ Version format matches `X.Y.Z` pattern

### Step 4: Regenerate the Docs HTML

```bash
npm run docs:generate
```

It writes the HTML and then **errors at the end on a missing `logs/docs-source/` directory**. That error
is harmless: the HTML is already written.

The generator re-renders every page, so it also touches HTML for old changelog versions and guides that
did not change. Keep only these generated files and revert the rest (`git checkout -- <path>`):

- `app/public/docs-html/content-manifest.json`
- `app/public/docs-html/content/changelog/index.html`
- `app/public/docs-html/content/changelog/archive.html`
- `app/public/docs-html/content/changelog/versions/X.Y.Z.html` (new)
- `app/public/docs-html/content/reference/troubleshooting.html`
- `app/public/docs-source/changelog/index.md`
- `app/public/docs-source/changelog/archive.md`

Plus any HTML for docs-source pages you actually edited in this change.

### Step 5: Commit and PR

- Expected diff: the 8 version files, the new `versions/X.Y.Z.md`, and the generated files above.
- Commit `chore(release): bump version to X.Y.Z` on the worktree branch (the pre-commit hook runs
  markdown/stylelint fixes and gitleaks).
- Push the branch and open a PR to `main`. The user merges; Portainer redeploys from `main` within about
  5 minutes. No git tag is required.

**Post-Merge**:
- Check the app at https://hextrackr.lbruton.cc shows the new version (login page, footer).
- Check the changelog dropdown shows the last 10 versions (newest first).

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
5. **Missed version string** → grep for the old version after the bump; all 8 files must agree
6. **Committing generator noise** → revert re-rendered HTML for pages that did not change
7. **Editing `package-lock.json` dependency lines** → only the two top-level version lines change

## Proactive Assistance

After completing a major session or feature:
1. Ask user: "Ready to create a changelog entry for this session?"
2. Suggest version number based on scope (patch vs minor vs major)
3. Run the validation script before `npm run docs:generate`
4. Open the PR to `main`; leave the merge to the user
