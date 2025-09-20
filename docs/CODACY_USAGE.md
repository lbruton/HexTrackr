# Codacy CLI Usage Guide

## Overview

This guide documents how to use Codacy CLI for code quality checks in HexTrackr. The Codacy MCP server is **NOT required** for local code scanning - only the CLI tool itself.

## Installation

### macOS (Homebrew)
```bash
brew tap codacy/tap
brew install codacy-analysis-cli
```

### Manual Installation
```bash
# Download latest release
curl -L https://github.com/codacy/codacy-analysis-cli/releases/latest/download/codacy-analysis-cli.sh -o codacy
chmod +x codacy
sudo mv codacy /usr/local/bin/
```

## Basic Usage

### Quick Scan
```bash
# From HexTrackr root directory
cd /Volumes/DATA/GitHub/HexTrackr
codacy-analysis-cli analyze
```

### Detailed Scan with Output
```bash
# JSON output for detailed analysis
codacy-analysis-cli analyze \
  --directory /Volumes/DATA/GitHub/HexTrackr \
  --output results.json \
  --format json

# Human-readable output
codacy-analysis-cli analyze \
  --directory /Volumes/DATA/GitHub/HexTrackr \
  --format text
```

### Scan Specific Directories
```bash
# Scan only app directory (production code)
codacy-analysis-cli analyze --directory /Volumes/DATA/GitHub/HexTrackr/app

# Scan only frontend
codacy-analysis-cli analyze --directory /Volumes/DATA/GitHub/HexTrackr/app/public
```

## Configuration

### .codacy.yml
HexTrackr includes a `.codacy.yml` configuration file that:
- Excludes vendor libraries
- Focuses on `/app/` directory
- Skips test files and documentation
- Applies JavaScript/Node.js specific rules

### Custom Patterns
```bash
# Use specific tools only
codacy-analysis-cli analyze --tool eslint

# Exclude patterns
codacy-analysis-cli analyze --exclude "tests/**,docs/**"
```

## Integration with HexTrackr Workflow

### Pre-Commit Check
```bash
# Run before committing
codacy-analysis-cli analyze --directory app/
if [ $? -eq 0 ]; then
  git commit -m "feat: passed Codacy checks"
else
  echo "Fix Codacy issues before committing"
fi
```

### CI/CD Integration
```bash
# In your CI pipeline
npm run eslint && \
npm run stylelint && \
codacy-analysis-cli analyze
```

### With Docker
```bash
# Run analysis inside Docker container
docker run -v $(pwd):/code codacy/codacy-analysis-cli analyze
```

## Understanding Results

### Exit Codes
- `0` - No issues found
- `1` - Issues found
- `2` - Error running analysis

### Issue Levels
- **Error**: Must fix - security vulnerabilities, bugs
- **Warning**: Should fix - code smells, complexity
- **Info**: Consider fixing - style issues, minor improvements

### Common Issues in HexTrackr
1. **Complexity**: Functions over 15 lines
2. **Duplication**: Similar code blocks
3. **Security**: Path traversal risks (use PathValidator)
4. **Style**: Inconsistent formatting (run eslint:fix first)

## Troubleshooting

### Analysis Takes Too Long
```bash
# Exclude large directories
codacy-analysis-cli analyze --exclude "node_modules/**,data/**"
```

### No Issues Found (Unexpected)
```bash
# Check configuration is loaded
codacy-analysis-cli validate-configuration

# Force specific tools
codacy-analysis-cli analyze --tool jshint --tool eslint
```

### Permission Errors
```bash
# Ensure executable permissions
chmod +x $(which codacy-analysis-cli)
```

## When to Use Codacy MCP

The Codacy MCP server is only needed for:
- Managing pull requests via API
- Listing organization repositories
- Getting PR-specific issues
- API-based workflow automation

For local code quality checks, the CLI is sufficient and saves ~600 tokens per session.

## Quick Reference

```bash
# Most common command for HexTrackr
codacy-analysis-cli analyze --directory /Volumes/DATA/GitHub/HexTrackr/app

# Before committing
npm run eslint:fix && npm run stylelint:fix && codacy-analysis-cli analyze

# Detailed analysis
codacy-analysis-cli analyze --format json --output analysis.json
```

---

*Note: This guide replaces the need for Codacy MCP in most development scenarios. Enable the MCP server only when API features are specifically required.*