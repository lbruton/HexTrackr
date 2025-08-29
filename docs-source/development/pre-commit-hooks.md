<!--
MARKDOWNLINT COMPLIANCE REQUIRED
This file MUST pass markdownlint validation before commit.
Run: node scripts/fix-markdown.js --file=THIS_FILE.md
Automated validation via pre-commit hooks - DO NOT BYPASS
-->

# Pre-commit Hooks Documentation

## Overview

HexTrackr implements an enhanced pre-commit hook system that automatically enforces code quality standards before commits reach the repository. The system uses a pragmatic approach that combines automated fixing with intelligent validation, ensuring code quality while maintaining development velocity.

## System Architecture

### Hook Location and Structure

```text
.githooks/
└── pre-commit              # Enhanced pre-commit hook (executable)

Configuration Files:
├── .markdownlint.json       # Markdown rules (MD013, MD046 disabled)
├── eslint.config.mjs        # ESLint configuration (ES module)
├── .stylelintrc.json        # Stylelint configuration
└── scripts/
    └── fix-markdown.js      # Custom Codacy-compliant markdown fixer
```

### Quality Tools Integration

The pre-commit hook integrates three quality tools:

1. **Custom Markdown Fixer** (`scripts/fix-markdown.js`)
   - Handles Codacy-specific violations
   - Fixes MD022, MD032, MD036, MD029, MD024 violations
   - Compatible with MD013/MD046 disabled rules

1. **Stylelint** (CSS/SCSS)
   - Auto-fixes formatting and property order
   - Validates CSS standards compliance
   - Full validation after auto-fix

1. **ESLint** (JavaScript)
   - Selective auto-fix for safe issues only
   - Full validation including security and logic checks
   - Excludes minified files (*.min.js)

## Pre-commit Hook Process

### Execution Flow

The hook executes in this sequence for each staged file type:

1. **File Detection**: Identifies staged files by extension
2. **Auto-fix Phase**: Applies safe automatic fixes
3. **Re-staging**: Automatically stages fixed files
4. **Validation Phase**: Runs full quality checks
5. **Result Reporting**: Provides detailed feedback
6. **Commit Decision**: Blocks commit if critical issues remain

### Markdown Processing

```bash

# For each staged *.md file:

node scripts/fix-markdown.js --file="$file"

# Auto-fix Applied:

- Heading spacing (MD022)
- List spacing (MD032)
- Emphasis to heading conversion (MD036)
- Ordered list numbering (MD029)
- Duplicate heading detection (MD024)

# Validation: Delegated to Codacy

# (markdownlint CLI --disable flags have compatibility issues)

```

### CSS/SCSS Processing

```bash

# Auto-fix formatting issues:

./node_modules/.bin/stylelint --fix $STAGED_CSS_FILES

# Re-stage fixed files:

git add $STAGED_CSS_FILES

# Full validation:

./node_modules/.bin/stylelint $STAGED_CSS_FILES
```

### JavaScript Processing

```bash

# Safe auto-fix only (suggestion, layout):

./node_modules/.bin/eslint --fix --fix-type suggestion,layout --config eslint.config.mjs $STAGED_JS_FILES

# Re-stage fixed files: (2)

git add $STAGED_JS_FILES

# Full validation (including security, logic):

./node_modules/.bin/eslint --config eslint.config.mjs $STAGED_JS_FILES
```

## Configuration Details

### Markdown Configuration (.markdownlint.json)

```json
{
  "default": true,
  "MD013": false,  // Line length (disabled - not auto-fixable)
  "MD033": false,  // HTML tags allowed
  "MD041": false,  // First line heading requirement disabled
  "MD046": false   // Code block style (disabled - project preference)
}
```

**Note**: MD013 and MD046 are disabled because:

- MD013 (line length) cannot be automatically fixed safely
- MD046 (code block style) conflicts with project documentation standards
- Both rules don't affect Codacy quality scores
- markdownlint CLI `--disable` flags have compatibility issues

### ESLint Configuration (eslint.config.mjs)

Key features:

- ES module format for modern Node.js compatibility
- Selective auto-fixing with `--fix-type suggestion,layout`
- Security and logic rules validation-only
- Excludes minified files and dependencies

### Stylelint Configuration (.stylelintrc.json)

```json
{
  "extends": ["stylelint-config-standard"],
  "rules": {
    "property-no-unknown": true,
    "declaration-block-no-duplicate-properties": true,
    "color-no-invalid-hex": true,
    "unit-no-unknown": true
  }
}
```

## Installation & Setup

### Initial Setup

```bash

# Install git hooks path (if not already set)

git config core.hooksPath .githooks

# Ensure hook is executable

chmod +x .githooks/pre-commit

# Install dependencies

npm install

# Test hook manually

./.githooks/pre-commit
```

### Verify Installation

```bash

# Check git hooks configuration

git config core.hooksPath

# Should output: .githooks

# Check hook permissions

ls -la .githooks/pre-commit

# Should show: -rwxr-xr-x (executable)

```

## Usage and Workflow

### Normal Development Workflow

```bash

# 1. Make changes to files

vim some-file.js

# 2. Stage changes

git add .

# 3. Commit (pre-commit hook runs automatically)

git commit -m "your commit message"

# Hook output example:

[pre-commit] Running code quality checks...
[pre-commit] Checking Markdown files...
[pre-commit] Auto-fixing Markdown issues...
📊 Markdown Formatting Results:
Files processed: 2
Total fixes applied: 5
[pre-commit] Markdown auto-fix complete (validation delegated to Codacy)
[pre-commit] All code quality checks passed! ✅
```

### When Pre-commit Hook Fails

```bash

# Example failure output:

[pre-commit] ESLint validation failed
[pre-commit] Run 'npm run eslint' to see details
[pre-commit] Code quality checks failed. Please fix issues before committing.
[pre-commit] Tip: Some issues were auto-fixed and staged. Review changes with 'git diff --cached'

# Steps to resolve:

1. Review what was auto-fixed: git diff --cached
2. Check specific issues: npm run eslint
3. Fix remaining issues manually
4. Stage fixes: git add .
5. Retry commit: git commit -m "your message"

```

## Manual Quality Control Commands

### Individual Tool Commands

```bash

# Markdown fixing

node scripts/fix-markdown.js --file=docs/example.md
node scripts/fix-markdown.js --all

# ESLint

npm run eslint                    # Check only
npm run eslint:fix               # Safe auto-fix

# Stylelint

npm run stylelint                # Check only
npm run stylelint:fix            # Auto-fix
```

### Package.json Scripts

The following npm scripts are available for manual quality control:

```json
{
  "scripts": {
    "lint:all": "npm run lint:md && npm run eslint && npm run stylelint",
    "fix:all": "npm run lint:md:fix && npm run eslint:fix && npm run stylelint:fix",
    "eslint": "eslint '**/*.js' --ignore-pattern '**/*.min.js' --config eslint.config.mjs",
    "eslint:fix": "eslint '**/*.js' --ignore-pattern '**/*.min.js' --config eslint.config.mjs --fix",
    "stylelint": "stylelint '**/*.css'",
    "stylelint:fix": "stylelint '**/*.css' --fix",
    "lint:md:fix": "node scripts/fix-markdown.js --all"
  }
}
```

## Codacy Integration

### Quality Workflow

The pre-commit hooks support the established Codacy compliance workflow:

1. **Pre-commit**: Automatically fixes formatting issues before they reach Codacy
2. **Codacy Analysis**: Focuses on logic, security, and complex issues
3. **Developer Focus**: Manual attention only needed for critical issues
4. **Target Goal**: Maintain <50 total Codacy issues for production releases

### Issue Categories

## Auto-fixed by Pre-commit

- Markdown formatting (heading spacing, list formatting)
- CSS property order and formatting
- JavaScript quote style and indentation
- Basic syntax and layout issues

## Requires Manual Attention (Codacy alerts)

- Security vulnerabilities
- Logic errors and unused variables
- Complex code quality issues
- Performance optimizations

## Troubleshooting

### Common Issues and Solutions

#### Permission Denied

```bash

# Problem: ./githooks/pre-commit: Permission denied

# Solution:

chmod +x .githooks/pre-commit
```

#### Hook Not Running

```bash

# Problem: Hook doesn't execute during commit

# Check git hooks path:

git config core.hooksPath

# If empty, set it:

git config core.hooksPath .githooks
```

#### ESLint Configuration Error

```bash

# Problem: Unexpected token 'export' in eslint.config.mjs

# Solution: Ensure Node.js 16+ and proper config reference

node --version  # Should be 16+
```

#### Markdownlint Issues

```bash

# Problem: Markdownlint CLI --disable flags not working

# Current Solution: Custom script handles Codacy violations

# Validation delegated to Codacy for reliability

```

### Emergency Procedures

#### Bypass Hook (Emergency Only)

```bash

# ONLY for critical hotfixes - use sparingly

git commit --no-verify -m "Emergency fix: brief description"

# Follow up immediately with quality fixes:

npm run fix:all
git add .
git commit -m "fix: resolve quality issues from emergency commit"
```

#### Restore Functionality

```bash

# If hook becomes corrupted, restore from git:

git checkout HEAD -- .githooks/pre-commit
chmod +x .githooks/pre-commit
```

## Technical Implementation Details

### File Processing Logic

The hook uses git's staging area efficiently:

```bash

# Detect staged files by type

STAGED_MD_FILES=$(git diff --cached --name-only --diff-filter=ACM | grep -E '\.md$' || true)
STAGED_CSS_FILES=$(git diff --cached --name-only --diff-filter=ACM | grep -E '\.(css|scss)$' || true)
STAGED_JS_FILES=$(git diff --cached --name-only --diff-filter=ACM | grep -E '\.js$' | grep -v '\.min\.js$' || true)

# Process only if files exist

if [ -n "$STAGED_MD_FILES" ]; then

    # Process markdown files

fi
```

### Auto-fix Safety

The system ensures safe automatic fixes by:

- **Markdown**: Only formatting changes (spacing, numbering)
- **CSS**: Property order and syntax fixes
- **JavaScript**: `--fix-type suggestion,layout` only (no logic changes)

### Performance Optimization

- Processes only staged files (not entire codebase)
- Skips processing when no relevant files are staged
- Uses efficient file filtering with grep patterns
- Excludes minified files and dependencies

## Maintenance and Updates

### Regular Maintenance Tasks

#### Monthly Review

- Check Codacy dashboard for new patterns
- Review auto-fix effectiveness
- Update configurations based on project needs

#### Dependency Updates

```bash

# Update linting tools

npm update eslint stylelint

# Verify configuration compatibility

npm run lint:all
```

### Configuration Updates

When modifying linting rules:

1. Test with `npm run lint:all`
2. Verify pre-commit hook functionality
3. Update this documentation
4. Communicate changes to team

### Version Compatibility

## Current Tool Versions

- Node.js: 16+ (required for ES modules)
- ESLint: 8.57.0+
- Stylelint: 16.23.1+
- markdownlint-cli: 0.41.0+ (for future official integration)

## Security Considerations

### Safe Auto-fix Boundaries

The pre-commit hook only auto-fixes:

- **Format and style**: No logic changes
- **Syntax fixes**: Semicolons, quotes, spacing
- **Property order**: CSS property organization
- **Markdown structure**: Heading and list formatting

### Manual Review Required

Critical issues that block commits:

- Security vulnerabilities (XSS, injection)
- Logic errors and unused variables
- Function signature changes
- API modifications

### Validation Boundaries

The hook maintains strict separation:

- **Auto-fix**: Safe, formatting-only changes
- **Validation**: Security, logic, and quality checks
- **Delegation**: Complex validation handled by Codacy

---

*This documentation reflects the current implementation as of August 28, 2025.
Update this file whenever the pre-commit hook system is modified.*
