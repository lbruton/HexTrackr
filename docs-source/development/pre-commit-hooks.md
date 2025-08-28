# Pre-commit Hooks Documentation

## Overview

HexTrackr implements an enhanced pre-commit hook system that automatically enforces code quality standards
before commits reach the repository. This system uses a "graduated approach" that combines safe auto-fixing
with validation-only checks for critical issues.

## Archit### Auto-fix Loop Issuecture

### Hook Components

The enhanced pre-commit hook system consists of

- **Markdown Linting**: Auto-fixes formatting issues, validates compliance
- **ESLint (JavaScript)**: Selective auto-fixing for safe issues, validation for logic/security
- **Stylelint (CSS)**: Auto-fixes formatting, property order, and style consistency
- **Codacy Integration**: Supports project goal of <50 total issues for v1.0.3

### File Structure

```text
.githooks/
├── pre-commit              # Active enhanced hook
├── pre-commit-backup       # Original hook backup
└── pre-commit-enhanced     # Enhanced hook template

package.json                # Enhanced npm scripts
eslint.config.mjs          # ESLint configuration (ES modules)
.stylelintrc.json          # Stylelint configuration
.markdownlint.json         # Markdownlint configuration
```

## Configuration

### ESLint Configuration

Located in `eslint.config.mjs` (ES module format)

```javascript
export default [
  {
    ignores: [
      "node_modules/**",
      "**/node_modules/**", 
      "dist/**",
      "build/**",
      "coverage/**",
      "scripts/chart.min.js"
    ]
  },
  // ... additional configuration
];
```

## Key Features

- ES module format (`.mjs` extension)
- Node.js and browser environment support
- Comprehensive rule set for code quality
- Quote style enforcement (double quotes)
- Security-focused linting rules

### Stylelint Issues

Located in `.stylelintrc.json`

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

## Key Features: (2)

- Standard CSS linting rules
- Property validation
- Color and unit validation
- Duplicate property detection

### Markdownlint Configuration

Uses existing `.markdownlint.json` with custom HexTrackr formatter in `scripts/fix-markdown.js`.

## Graduated Approach Strategy

### ✅ Safe Auto-fixes (Automatic)

Issues that are automatically fixed and re-staged

## Markdown

- Line wrapping and spacing
- List formatting consistency
- Heading spacing requirements
- Ordered list numbering

## CSS

- Property order standardization
- Missing semicolons
- Spacing and indentation
- Color format consistency

## JavaScript

- Quote style consistency (double quotes)
- Spacing and indentation
- Layout formatting
- Semicolon insertion

### ⚠️ Validation-Only (Manual Review Required)

Issues that block commits and require manual attention

## Security Issues

- XSS vulnerabilities
- SQL injection patterns
- Unsafe DOM manipulation

## Logic Issues

- Unused variables
- Unreachable code
- Type-related problems

## Breaking Changes

- Function signature modifications
- Variable scope changes
- API modifications

## Installation & Setup

### Initial Setup

```bash

# Install git hooks path

npm run hooks:install

# Verify hook is executable

chmod +x .githooks/pre-commit

# Test hook functionality

./.githooks/pre-commit
```

### Package.json Scripts

Enhanced npm scripts for manual quality control

```json
{
  "scripts": {
    "lint:all": "npm run lint:md && npm run eslint && npm run stylelint",
    "fix:all": "npm run lint:md:fix && npm run eslint:fix && npm run stylelint:fix",
    "eslint": "eslint '**/*.js' --ignore-pattern '**/*.min.js' --config eslint.config.mjs",
    "eslint:fix": "eslint '**/*.js' --ignore-pattern '**/*.min.js' --config eslint.config.mjs --fix",
    "stylelint": "stylelint '**/*.css'",
    "stylelint:fix": "stylelint '**/*.css' --fix",
    "lint:md": "markdownlint --config .markdownlint.json --ignore-path .markdownlintignore '**/*.md'",
    "lint:md:fix": "node scripts/fix-markdown.js"
  }
}
```

## Hook Workflow

### Execution Flow

1. **Stage Detection**: Identifies staged files by type (.md, .css, .js)
2. **Auto-fixing Phase**: Runs safe auto-fixes for each file type
3. **Re-staging**: Automatically stages auto-fixed files
4. **Validation Phase**: Runs full validation on all files
5. **Result Reporting**: Provides detailed feedback with line numbers
6. **Commit Decision**: Allows commit only if all validations pass

### Sample Output

```bash
[pre-commit] Running code quality checks...

[pre-commit] Checking Markdown files...
[pre-commit] Auto-fixing Markdown issues...
📊 Markdown Formatting Results
Files processed: 2
Total fixes applied: 15
✅ [pre-commit] Markdown validation passed

[pre-commit] Checking CSS/SCSS files...
[pre-commit] Auto-fixing CSS issues...
✅ [pre-commit] CSS validation passed

[pre-commit] Checking JavaScript files...
[pre-commit] Auto-fixing safe JavaScript issues...
✅ [pre-commit] JavaScript validation passed

✅ [pre-commit] All code quality checks passed! ✅
```

### Error Handling

When validation fails

```bash
❌ [pre-commit] ESLint validation failed
[pre-commit] Run 'npm run eslint' to see details

[pre-commit] Code quality checks failed. Please fix issues before committing.
[pre-commit] Tip: Some issues were auto-fixed and staged. Review changes with 'git diff --cached'
```

## Manual Commands

### Diagnostic Commands

```bash

# Check all file types

npm run lint:all

# Check specific file types

npm run eslint
npm run stylelint
npm run lint:md

# Auto-fix all safe issues

npm run fix:all

# Auto-fix specific file types

npm run eslint:fix
npm run stylelint:fix
npm run lint:md:fix
```

### Testing Hook Functionality

```bash

# Test the hook manually

./.githooks/pre-commit

# Test with specific files

git add specific-file.js
./.githooks/pre-commit

# Bypass hook for emergency commits (NOT RECOMMENDED)

git commit --no-verify -m "Emergency commit"
```

## Integration with Codacy

### Workflow Enhancement

The pre-commit hooks support the established Codacy workflow

1. **Pre-commit**: Catches and fixes formatting issues automatically
2. **Codacy Dashboard**: User focuses on logic and security issues
3. **Manual Selection**: Reduced workload due to fewer formatting issues
4. **Systematic Fixes**: AI handles implementation of user-selected patterns

### Impact on Issue Count

## Before Enhanced Hooks

- 83 total Codacy issues
- Manual selection required for all issues
- High ratio of formatting issues

## After Enhanced Hooks

- Formatting issues auto-fixed before commit
- Focus on critical logic/security issues
- Target: <50 issues for v1.0.3 release

## Troubleshooting

### Common Issues

## ESLint Configuration Error

```bash

# Error: Unexpected token 'export'

# Solution: Ensure package.json has correct config reference

"eslint": "eslint '**/*.js' --config eslint.config.mjs"
```

## Permission Issues

```bash

# Make hook executable

chmod +x .githooks/pre-commit

# Verify git hooks path

git config core.hooksPath .githooks
```

## Markdown Formatting Loop

```bash

# If markdown auto-fixer runs repeatedly

# Check for complex formatting issues that need manual attention

# Use git diff --cached to see what changes are being made

```

```text

**Markdown Formatting Loop:**
```bash

# If markdown auto-fixer runs repeatedly (2)

# Check for complex formatting issues that need manual attention (2)

# Use git diff --cached to see what changes are being made (2)

```

### Performance Considerations

## Large Codebase Optimization

- Hook only processes staged files
- Ignores patterns defined in each linter's configuration
- Uses selective auto-fixing to minimize processing time

## File Type Filtering

- `.min.js` files excluded from JavaScript linting
- `node_modules/` directories ignored
- Binary files automatically skipped

## Best Practices

### Commit Workflow

1. **Stage Changes**: `git add .`
2. **Let Hook Run**: Automatic during `git commit`
3. **Review Auto-fixes**: `git diff --cached` if needed
4. **Address Failures**: Fix validation issues manually
5. **Commit Success**: Proceed when all checks pass

### Development Guidelines

## Safe Auto-fix Categories

- Formatting and style consistency
- Whitespace and indentation
- Quote style standardization
- Property order in CSS

## Manual Review Categories

- Logic modifications
- Security vulnerabilities
- Variable scope changes
- API modifications

### Emergency Procedures

## Bypass Hook (Emergency Only)

```bash
git commit --no-verify -m "Emergency: brief description"
```

## Restore Previous Hook

```bash
cp .githooks/pre-commit-backup .githooks/pre-commit
```

## Maintenance

### Regular Updates

## Monthly Review

- Check for new ESLint/Stylelint rules
- Update configuration based on Codacy dashboard patterns
- Review auto-fix effectiveness

## Configuration Updates

- Update rule severity based on project needs
- Add new file patterns to ignore lists
- Adjust auto-fix scope based on safety assessment

### Version Compatibility

## Dependencies

- ESLint 9.34.0+
- Stylelint 16.23.1+
- markdownlint-cli 0.41.0+

## Node.js Compatibility

- Requires Node.js 16+ for ES module support
- Compatible with npm 8+ and yarn 1.22+

## Security Considerations

### Auto-fix Safety

The graduated approach ensures

- **No logic changes** in auto-fixes
- **No variable renaming** or scope modifications
- **No API changes** or function signature modifications
- **Format-only changes** that don't affect behavior

### Validation Boundaries

Security-related issues require manual review

- XSS vulnerability patterns
- SQL injection detection
- Unsafe DOM manipulation
- Dependency vulnerabilities

## Future Enhancements

### Planned Improvements

1. **Performance Optimization**: Parallel linting for large changesets
2. **Custom Rules**: HexTrackr-specific linting rules
3. **Integration Testing**: Automated testing of hook functionality
4. **Metrics Dashboard**: Track fix success rates and patterns

### Consideration Items

1. **IDE Integration**: Pre-commit validation in VS Code
2. **CI/CD Pipeline**: Mirror pre-commit checks in GitHub Actions
3. **Team Onboarding**: Automated setup for new developers
4. **Configuration Management**: Centralized rule management

---

*This documentation is maintained as part of the HexTrackr project and should be updated
whenever the pre-commit hook system is modified.*
