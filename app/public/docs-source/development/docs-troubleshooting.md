# Documentation Portal Troubleshooting Guide

This guide helps you resolve common issues with the HexTrackr documentation portal and spec-kit integration.

## Quick Diagnostics

### Check System Status

```bash

# Verify active specification

cat .active-spec

# Test spec synchronization

node scripts/sync-specs-to-roadmap.js

# Test HTML generation

node app/public/docs-html/html-content-updater.js

# Full documentation refresh

npm run docs:generate
```

## Common Issues

### 1. Active Spec Not Displaying

## Symptoms

- No active spec banner appears in documentation
- Spec not highlighted in roadmap table

## Causes & Solutions

#### Missing .active-spec file

```bash

# Check if file exists

ls -la .active-spec

# Create if missing

echo "022-documentation-portal-rebuild" > .active-spec
```

#### Invalid spec format

```bash

# Check current content

cat .active-spec

# Should contain only the spec slug, no extra spaces or characters

# Correct format: "022-documentation-portal-rebuild"

# Incorrect: " 022-documentation-portal-rebuild \n"

```

#### Spec name mismatch

The sync script matches spec names using fuzzy logic. If your spec isn't highlighting:

```bash

# Check spec directory names

ls hextrackr-specs/specs/

# Ensure .active-spec matches a directory name

# Example: .active-spec contains "022-documentation-portal-rebuild"

# Directory should be: hextrackr-specs/specs/022-documentation-portal-rebuild/

```

### 2. Documentation Not Updating

## Symptoms: (2)

- Changes to markdown files don't appear in HTML
- Old content persists after regeneration

## Solutions

#### Force regeneration

```bash

# Clear any cached content and regenerate

rm -rf app/public/docs-html/content/*
npm run docs:generate
```

#### Check file permissions

```bash

# Ensure write permissions for docs directory

chmod -R 755 app/public/docs-html/
```

#### Verify markdown syntax

```bash

# Test specific file parsing

node -e "
const marked = require('marked');
const fs = require('fs');
const content = fs.readFileSync('path/to/your/file.md', 'utf8');
console.log(marked.parse(content));
"
```

### 3. Spec Tasks Not Syncing to Roadmap

## Symptoms: (3)

- Roadmap table shows outdated task counts
- Completed tasks still show as pending

## Causes & Solutions: (2)

#### Incorrect checkbox format

Tasks must use exact markdown checkbox format:

```markdown

# Correct format

- [ ] Pending task
- [x] Completed task
- [X] Also completed (capital X works)

# Incorrect format (will not be counted)

- [] Missing space
- [ ]Extra text before task
- [v] Wrong character

```

#### Missing tasks.md files

```bash

# Check if tasks.md exists in spec directory

ls hextrackr-specs/specs/*/tasks.md

# If missing, tasks won't be counted

# Create from template if needed

```

#### Code block interference

Tasks inside code blocks are ignored:

````markdown

# These tasks will NOT be counted

```

- [ ] Task inside code block
- [x] Another task in code

```

# These tasks WILL be counted

- [ ] Task outside code blocks
- [x] Completed task

````

### 4. HTML Generation Errors

## Symptoms: (4)

- Process crashes during generation
- Partial HTML files created
- Permission denied errors

## Solutions: (2)

#### Missing dependencies

```bash

# Reinstall node modules

npm install

# Check for missing marked library

npm list marked
```

#### File system issues

```bash

# Check disk space

df -h

# Check directory permissions

ls -la app/public/docs-html/

# Fix permissions if needed

sudo chown -R $USER:$USER app/public/docs-html/
```

#### HTML Generation Script issues

```bash

# Verify the HTML generator script exists

ls -la app/public/docs-html/html-content-updater.js

# Check if the script has proper permissions

ls -l app/public/docs-html/html-content-updater.js
```

### 5. Performance Issues

## Symptoms: (5)

- Documentation generation takes >5 seconds
- High memory usage during generation
- Server becomes unresponsive

## Solutions: (3)

#### Reduce concurrent operations

The system processes files with small delays to prevent overwhelming:

```javascript
// In html-content-updater.js, increase delay if needed
await new Promise(resolve => setTimeout(resolve, 100)); // Increase from 50ms
```

#### Monitor memory usage

```bash

# Watch memory during generation

top -p $(pgrep node)

# Or use htop for better visualization

htop -p $(pgrep node)
```

#### Check for large files

```bash

# Find large markdown files that might slow processing

find app/public/docs-source -name "*.md" -size +1M -ls
```

## Error Codes and Messages

### Common Error Messages

#### "html-content-updater.js not found"

```bash

# Verify HTML generator script location

ls app/public/docs-html/html-content-updater.js

# If missing, the script is required for generation

# Check if it was accidentally deleted or moved

```

#### "No tasks.md files found"

```bash

# Check spec directory structure

find hextrackr-specs/specs -name "tasks.md"

# Each spec should have a tasks.md file

# Create missing files from template if needed

```

#### "Path traversal detected"

This is a security error from path validation:

```bash

# Check for invalid characters in file paths

# Avoid: ../../../, absolute paths, special characters

# Use only relative paths within project directory

```

### Exit Codes

- `0`: Success
- `1`: General error (check logs for details)
- `ENOENT`: File not found
- `EACCES`: Permission denied
- `EMFILE`: Too many open files

## Advanced Debugging

### Enable Debug Logging

```bash

# Set environment variable for verbose output

DEBUG=docs:* npm run docs:generate

# Or add console.log statements to scripts for detailed tracing

```

### Manual Step-by-Step Testing

1. **Test spec reading:**

```bash
node -e "
const fs = require('fs');
try {
  const spec = fs.readFileSync('.active-spec', 'utf8').trim();
  console.log('Active spec:', spec);
} catch (e) {
  console.log('No active spec:', e.message);
}
"
```

1. **Test task parsing:**

```bash
node -e "
const fs = require('fs');
const content = fs.readFileSync('hextrackr-specs/specs/022-documentation-portal-rebuild/tasks.md', 'utf8');
const total = (content.match(/^\s*-\s*\[(?: |x|X)\]\s+/gm) || []).length;
const done = (content.match(/^\s*-\s*\[(?:x|X)\]\s+/gm) || []).length;
console.log('Tasks:', { total, done, pct: Math.round((done / total) * 100) });
"
```

1. **Test HTML generation:**

```bash
node -e "
const HtmlContentUpdater = require('./app/public/docs-html/html-content-updater.js');
const updater = new HtmlContentUpdater();
updater.loadActiveSpec().then(spec => console.log('Active spec loaded:', spec));
"
```

## Prevention Tips

### Regular Maintenance

```bash

# Weekly documentation health check

npm run docs:generate && echo 'Documentation system healthy'

# Monthly cleanup of orphaned files

find app/public/docs-html/content -name "*.html" -mtime +30 -delete
```

### Best Practices

1. **Always test locally before committing changes**
2. **Keep .active-spec updated when switching specs**
3. **Use proper markdown checkbox format in tasks.md**
4. **Run docs:generate after spec changes**
5. **Monitor file permissions in docs directories**

### Monitoring

```bash

# Set up periodic checks

echo "0 */6 * * * cd /path/to/hextrackr && npm run docs:generate" | crontab -

# Or use systemd timer for more robust monitoring

```

## Getting Help

If you encounter issues not covered in this guide:

1. **Check recent changes:**

```bash
git log --oneline -10 scripts/ app/public/docs-html/
```

1. **Search existing issues:**

```bash

# Look for similar problems in git history

git log --grep="docs" --grep="spec" --grep="generate"
```

1. **Create detailed bug report with:**
   - Error messages and stack traces
   - System information (`node --version`, OS, etc.)
   - Steps to reproduce
   - Expected vs. actual behavior
   - Relevant file contents

1. **Test in clean environment:**

```bash

# Clone fresh copy and test

git clone https://github.com/Lonnie-Bruton/HexTrackr.git hextrackr-test
cd hextrackr-test
npm install
npm run docs:generate
```

This troubleshooting guide should resolve most common documentation portal issues. Keep this document updated as new issues and solutions are discovered.
