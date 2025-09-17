# HexTrackr Claude Code Hooks

This directory contains automated hooks that enhance the development workflow for HexTrackr.

## Available Hooks

### 1. **File Backup Hook** (`file-backup.sh`)
- **Trigger**: Before file edits (PreToolUse)
- **Purpose**: Creates timestamped backups of important files
- **Features**:
  - Automatic backup before Edit/Write/MultiEdit operations
  - Keeps last 10 backups per file
  - Skips temporary and system files
  - Organized backup structure in `.claude/backups/`

### 2. **Lint-on-Save Hook** (`lint-on-save.sh`)
- **Trigger**: After file edits (PostToolUse)
- **Purpose**: Automatically runs linters and auto-fixes issues
- **Features**:
  - ESLint for JavaScript files (`npm run eslint:fix`)
  - Stylelint for CSS files (`npm run stylelint:fix`)
  - Auto-fixes issues where possible
  - Clean, colorized output
  - Background execution for minimal interruption

### 3. **Security Scanner Hook** (`security-scan.sh`)
- **Trigger**: After security-sensitive file edits
- **Purpose**: Scans for common security vulnerabilities
- **Features**:
  - Pattern matching for security issues (eval, innerHTML, etc.)
  - SQL injection detection
  - XSS vector identification
  - Hardcoded secrets detection
  - ESLint security rule integration
  - Detailed logging to `/tmp/hextrackr-security-scan.log`

## Configuration

Hooks are configured in `.claude/hooks.json` with these patterns:

```json
{
  "PreToolUse": [
    {
      "matcher": {
        "tool_name": "Edit|Write|MultiEdit",
        "file_path": "\\.(js|css|html|json)$"
      },
      "hooks": ["file-backup.sh"]
    }
  ],
  "PostToolUse": [
    {
      "matcher": {
        "tool_name": "Edit|Write|MultiEdit",
        "file_path": "\\.js$"
      },
      "hooks": ["lint-on-save.sh js"]
    }
  ]
}
```

## File Patterns

- **JavaScript Linting**: Triggers on `*.js` files
- **CSS Linting**: Triggers on `*.css` files
- **Security Scanning**: Triggers on `server.js`, `scripts/**/*.js`, or files containing "security"
- **File Backup**: Triggers on `*.js`, `*.css`, `*.html`, `*.json` files

## Environment Variables

The hooks use these Claude Code environment variables:
- `$CLAUDE_PROJECT_DIR`: Project root directory
- Hook input via stdin containing file paths and tool information

## Logs and Output

- **Lint logs**: `/tmp/hextrackr-*lint.log`
- **Security logs**: `/tmp/hextrackr-security-scan.log`
- **Backups**: `.claude/backups/[relative-path]/[filename]_[timestamp].backup`

## Disabling Hooks

To temporarily disable hooks, set in `.claude/settings.local.json`:
```json
{
  "disableAllHooks": true
}
```

## Integration with HexTrackr Workflow

These hooks integrate seamlessly with the HexTrackr development workflow:
- Docker-only development environment
- S-R-P-T methodology
- Quality-first code standards
- Security-conscious development

The hooks run automatically when Claude Code performs file operations, ensuring consistent code quality without disrupting the development flow.