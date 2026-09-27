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
   - Runs validation before `npm run release`
   - Reminds about post-release steps (Linear updates, git push --tags)

3. **Prevents Common Errors**
   - Missing frontmatter → Docs show "Unknown date"
   - Missing Overview → HR lines appear in summaries
   - Wrong category values → Documentation inconsistencies

## Manual Usage

### Validate a Changelog File
```bash
python3 .claude/skills/changelog-version-manager/scripts/validate_changelog.py \
  app/public/docs-source/changelog/versions/1.1.11.md
```

### Success Output
```
============================================================
✓ CHANGELOG READY FOR RELEASE
============================================================

Next steps:
  1. Run: npm run release
  2. Verify HTML output in app/public/docs-html/content/changelog/
  3. Update Linear issue status
  4. Push changes: git push origin dev --tags
```

### Error Output
```
ERROR: Missing required field 'category'
ERROR: Missing '## Overview' section (docs generator needs this for summaries)
✗ CHANGELOG HAS ERRORS - FIX BEFORE RELEASE
```

## File Structure

```
changelog-version-manager/
├── SKILL.md                    # Skill instructions (loaded by Claude)
├── scripts/
│   └── validate_changelog.py  # Validation script (deterministic)
└── README.md                   # This file (human documentation)
```

## Progressive Loading

- **Metadata** (~150 tokens): Always loaded at startup - Claude knows this skill exists
- **Instructions** (~2.5K tokens): Loaded only when you mention changelog/versioning
- **Script Output** (~500 tokens): Loaded only when validation runs

**Token Savings**: Without this skill, changelog requirements would be in CLAUDE.md (always loaded). Now they're on-demand.

## Testing This Skill

Try these prompts to see the skill activate:

1. **"I'm ready to create a changelog for this session"**
   → Skill loads, guides you through template usage, runs validation

2. **"Let's bump the version"**
   → Skill loads, suggests version number, walks through `npm run release`

3. **"Check if my changelog is valid"**
   → Skill loads, runs validation script, provides actionable feedback

## References

- **Process Guide**: `/docs/CHANGELOG AND VERSION BUMP PROCESS.md`
- **Template**: `/docs/TEMPLATE_CHANGELOG.md`
- **CLAUDE.md**: See "Changelogs" section
- **Skill Docs**: https://docs.claude.com/en/docs/agents-and-tools/agent-skills/overview
