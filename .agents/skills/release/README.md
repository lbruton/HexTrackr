# Changelog & Version Manager Skill

## Purpose

This skill automates and validates the HexTrackr changelog and version bump process. It prevents documentation generation failures by ensuring changelog files have proper YAML frontmatter and Overview sections.

## How It Works

### Automatic Triggering

Claude Code automatically loads this skill when you:
- Mention "changelog", "version bump", "release", or "npm run release"
- Create or edit files in `/app/public/docs-source/changelog/versions/`
- Ask about versioning workflow
- Complete a major session or feature (Claude will prompt to create changelog)

### What It Does

1. **Validates Changelog Structure** using `scripts/validate_changelog.py`
   - Checks YAML frontmatter (5 required fields)
   - Verifies Overview section exists
   - Validates version format (X.Y.Z)
   - Confirms file location

2. **Guides Release Process**
   - Prompts for changelog creation after major sessions
   - Walks through the bump: hand-edit `package.json`, `package-lock.json` and the README badge, then
     `npm run docs:generate` (= `npm run release`) syncs the other version strings and regenerates HTML
   - Runs validation before `npm run docs:generate`, then a PR to `main` (main-only flow)

3. **Prevents Common Errors**
   - Missing frontmatter → Docs show "Unknown date"
   - Missing Overview → HR lines appear in summaries
   - Wrong category values → Documentation inconsistencies

## Manual Usage

### Validate a Changelog File
```bash
python3 .agents/skills/release/scripts/validate_changelog.py \
  app/public/docs-source/changelog/versions/1.1.11.md
```

### Success Output
```
============================================================
✓ CHANGELOG READY FOR RELEASE
============================================================

Next steps:
  1. Run: npm run docs:generate (the trailing logs/docs-source/ error is harmless)
  2. Revert re-rendered HTML for pages that did not change
  3. Verify HTML output in app/public/docs-html/content/changelog/
  4. Commit on the worktree branch and open a PR to main
```

### Error Output
```
ERROR: Missing required field 'category'
ERROR: Missing '## Overview' section (docs generator needs this for summaries)
✗ CHANGELOG HAS ERRORS - FIX BEFORE RELEASE
```

## File Structure

```
release/
├── SKILL.md                    # Skill instructions (loaded by Claude)
├── scripts/
│   └── validate_changelog.py  # Validation script (deterministic)
└── README.md                   # This file (human documentation)
```

## Progressive Loading

- **Metadata** (~150 tokens): Always loaded at startup - Claude knows this skill exists
- **Instructions** (~2.5K tokens): Loaded only when you mention changelog/versioning
- **Script Output** (~500 tokens): Loaded only when validation runs

**Token Savings**: Without this skill, changelog requirements would be in AGENTS.md (always loaded). Now they're on-demand.

## Testing This Skill

Try these prompts to see the skill activate:

1. **"I'm ready to create a changelog for this session"**
   → Skill loads, guides you through template usage, runs validation

2. **"Let's bump the version"**
   → Skill loads, suggests version number, walks through the manual bump

3. **"Check if my changelog is valid"**
   → Skill loads, runs validation script, provides actionable feedback

## References

- **Workflow**: `SKILL.md` in this directory (the old `/docs/` process guide and template no longer exist)
- **AGENTS.md**: See "Version & Release" section
- **Skill Docs**: https://docs.claude.com/en/docs/agents-and-tools/agent-skills/overview
