# HexTrackr Git Hooks

## Overview

This directory contains git hooks that enforce code quality without breaking functionality.

## Philosophy: Defense-in-Depth

Our hooks use a **four-layer safety system**:

1. **Layer 1: Safe Auto-Fixes** - Only formatting (markdown, CSS)
2. **Layer 2: Manual Review** - JavaScript warnings but no auto-fix
3. **Layer 3: Secret Detection** - Gitleaks security check (cannot be bypassed)
4. **Layer 4: Documentation** - Guidelines to prevent Codacy false positives

## Current Hooks

### `pre-commit`

**Safe Auto-Fixes:**
- ✅ Markdown formatting (`lint:md:fix`)
- ✅ CSS formatting (`stylelint:fix`)

**Warnings Only (NO auto-fix):**
- ⚠️  ESLint JavaScript issues
- 📚 Directs developer to `.github/CODACY_GUIDELINES.md`

**Security Check (cannot be bypassed):**
- 🔒 Gitleaks secret detection (v8.21.2+)
- Automatically installs gitleaks if not present
- Blocks commit if secrets are detected

**Interactive:**
- Asks user permission to commit with ESLint warnings
- Stages auto-fixed files automatically

### `safe-checkout.sh` (Data Loss Prevention)

**Problem**: Git sometimes allows branch switching with uncommitted changes, leading to data loss.

**Solution**: Use `safe-checkout.sh` wrapper script that blocks branch switching until changes are committed or stashed.

**Usage Options**:

1. **Direct usage**:
   ```bash
   ./.githooks/safe-checkout.sh main
   ./.githooks/safe-checkout.sh feature/my-branch
   ```

2. **Shell alias** (recommended):
   ```bash
   # Add to ~/.zshrc or ~/.bashrc:
   alias gco='/Volumes/DATA/GitHub/HexTrackr/.githooks/safe-checkout.sh'

   # Then use:
   gco main           # Safe checkout
   gco feature/foo    # Safe checkout
   ```

3. **Git alias**:
   ```bash
   git config --global alias.sco '!bash /Volumes/DATA/GitHub/HexTrackr/.githooks/safe-checkout.sh'

   # Then use:
   git sco main       # Safe checkout
   ```

**What It Does**:
- ⛔ Blocks checkout with uncommitted changes
- 📝 Shows exactly what's uncommitted (staged and unstaged)
- 💡 Provides clear options (commit, stash, force)
- ✅ Allows checkout when working tree is clean

**Example Output**:
```
⛔ CHECKOUT BLOCKED - Uncommitted changes detected

✏️  Unstaged changes:
   M	package.json
   M	app/services/foo.js

💡 Options:
   1. Commit everything:  git add -A && git commit -m 'WIP: Save session'
   2. Stash changes:      git stash save 'WIP: 2025-10-01-11:39'
   3. Force checkout:     git checkout -f "main"  (⚠️  DISCARDS CHANGES)
```

**Why Not a Git Hook?**: Git doesn't support `pre-checkout` hooks natively. Script-based wrapper provides better UX.

## Installation

Hooks are automatically installed via:
```bash
git config core.hooksPath .githooks
```

Verify installation:
```bash
git config core.hooksPath
# Should output: .githooks
```

## Testing the Hook

Create a test commit with intentional issues:

```bash
# Test markdown auto-fix
echo "# Test  Header   " > test.md  # Extra spaces
git add test.md
git commit -m "test: markdown formatting"
# Should auto-fix and stage the changes

# Test ESLint warning (no auto-fix)
# Edit a JS file with an issue, hook will warn but not auto-fix
```

## Emergency Bypass

If you need to commit without running hooks:
```bash
git commit --no-verify -m "emergency: critical hotfix"
```

**Use sparingly** - only for:
- Production emergencies
- Critical security hotfixes
- When hooks themselves are broken

**⚠️ WARNING**: Bypassing hooks skips security checks (gitleaks). Use only in genuine emergencies.

## Hook Behavior

### Successful Commit (no issues)
```
🔍 Running safe auto-fixes...
  📝 Fixing markdown formatting...
     ✅ Markdown clean
  🎨 Fixing CSS formatting...
     ✅ CSS clean
⚠️  Checking JavaScript (warnings only, no auto-fix)...
✅ JavaScript clean
🔒 Running gitleaks secret detection...
✅ No secrets detected

✅ Safe fixes applied and staged
```

### Commit with ESLint Warnings
```
🔍 Running safe auto-fixes...
  📝 Fixing markdown formatting...
     ✅ Markdown clean
  🎨 Fixing CSS formatting...
     ✅ CSS clean
⚠️  Checking JavaScript (warnings only, no auto-fix)...

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⚠️  ESLint found issues (NOT auto-fixed for safety)

[... ESLint output ...]

Review manually with: npm run eslint

🚨 CRITICAL: Read .github/CODACY_GUIDELINES.md before
   fixing 'undefined variable' warnings!

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Commit with ESLint warnings? (y/N):
```

## What This Prevents

Based on commit c2e4757 (Sept 18, 2025) incident:

❌ Auto-renaming variables with underscore prefix
❌ Breaking dependency injection patterns
❌ Removing "unused" variables that are actually used
❌ Import/export restructuring that breaks apps
❌ Trusting Codacy "undefined variable" warnings

## Maintenance

### Adding New Safe Auto-Fixes

Only add fixes that are **purely formatting** and cannot break code:

```bash
# Safe: Formatting only
npm run prettier:fix
npm run format:json

# Unsafe: Can change logic
npm run eslint:fix
npm run ts:fix
```

### Updating the Hook

1. Edit `.githooks/pre-commit`
2. Test with dummy commits
3. Document changes in this README
4. Update `.github/CODACY_GUIDELINES.md` if needed

## Troubleshooting

### Hook Not Running
```bash
# Check hooks path
git config core.hooksPath
# Should be: .githooks

# Reinstall
git config core.hooksPath .githooks
```

### Hook Permission Denied
```bash
# Make executable
chmod +x .githooks/pre-commit
```

### Hook Failing on Node Modules
```bash
# Make sure you're in project root
cd /Volumes/DATA/GitHub/HexTrackr
npm install
```

## Resources

- **Codacy Guidelines**: `.github/CODACY_GUIDELINES.md`
- **ESLint Config**: `eslint.config.mjs`
- **Markdown Config**: `.markdownlint.json`
- **CSS Config**: `.stylelintrc.json`

## Version History

- **v1.1.0** (2025-10-01): Data loss prevention
  - Added `safe-checkout.sh` script to prevent branch switching with uncommitted changes
  - Protects against "forgot to commit" scenarios
  - Three usage options: direct, shell alias, git alias

 - **v1.0.0** (2025-09-30): Initial safe hooks implementation
   - Safe auto-fixes for markdown and CSS
   - Warning-only for JavaScript
   - Codacy false positive documentation

- **v1.1.1** (2026-04-14): Gitleaks integration (OPS-116)
   - Added gitleaks secret detection to pre-commit hook
   - Automatic installation of gitleaks if not present
   - Blocks commits with detected secrets (security check cannot be bypassed)