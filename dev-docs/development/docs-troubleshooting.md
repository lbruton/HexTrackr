# Documentation Portal Troubleshooting Guide

This guide helps you resolve common issues with the HexTrackr documentation portal.

## Quick Diagnostics

### Check System Status

```bash
# Test HTML generation
node app/public/docs-html/html-content-updater.js

# Full documentation refresh
npm run docs:generate

# Check documentation file structure
ls -la app/public/docs-source/
ls -la app/public/docs-html/content/
```

## Common Issues

### 1. Documentation Not Updating

**Symptoms:**

- Changes to markdown files don't appear in the HTML documentation
- Stale content shown in browser
- Documentation pages show outdated information

**Solutions:**

#### Force regeneration

```bash
# Clean regeneration
rm -rf app/public/docs-html/content/*
npm run docs:generate
```

#### Check file permissions

```bash
# Ensure write permissions
chmod -R 755 app/public/docs-html/
chmod -R 644 app/public/docs-html/content/*.html
```

#### Verify markdown syntax

```bash
# Run markdown linter
npm run lint:md

# Check specific file syntax
npx markdownlint app/public/docs-source/**/*.md
```

### 2. HTML Generation Errors

**Symptoms:**

- HTML content updater fails to run
- Missing HTML files in content directory
- Broken links in documentation navigation
- Console errors in browser

**Solutions:**

#### Missing dependencies

```bash
# Install missing packages
npm install

# Verify marked library
node -e "console.log(require('marked'))"

# Check dotenv
node -e "console.log(require('dotenv'))"
```

#### File system issues

```bash
# Check disk space
df -h

# Verify directory structure
mkdir -p app/public/docs-html/content
mkdir -p logs/docs-source

# Check file ownership
chown -R $(whoami) app/public/docs-html/
```

#### HTML Generation Script issues

```bash
# Run with debug output
DEBUG=1 node app/public/docs-html/html-content-updater.js

# Test template loading
node -e "const fs = require('fs'); console.log(fs.readFileSync('app/public/docs-html/template.html', 'utf8'))"
```

### 3. Performance Issues

**Symptoms:**

- Slow documentation generation
- Browser freezing when loading documentation
- High memory usage during HTML generation

**Solutions:**

#### Reduce concurrent operations

```bash
# Process files individually instead of batch
node app/public/docs-html/html-content-updater.js --single-thread
```

#### Monitor memory usage

```bash
# Check memory during generation
top -p $(pgrep -f html-content-updater)

# Memory usage analysis
node --max-old-space-size=512 app/public/docs-html/html-content-updater.js
```

#### Check for large files

```bash
# Find large markdown files
find app/public/docs-source/ -name "*.md" -size +1M

# Check image sizes
find app/public/docs-source/ -name "*.png" -o -name "*.jpg" -size +5M
```

### 4. Navigation and Linking Issues

**Symptoms:**

- Broken internal links
- Missing pages in navigation
- 404 errors for documentation pages

**Solutions:**

#### Check link format

```bash
# Verify relative link format
grep -r "\.md)" app/public/docs-source/ | grep -v "http"

# Check for absolute paths
grep -r "file://" app/public/docs-source/
```

#### Validate navigation structure

```bash
# Test navigation JSON generation
node -e "
const updater = require('./app/public/docs-html/html-content-updater.js');
// Test navigation discovery logic
"
```

## Error Codes and Messages

### Common Error Messages

#### "html-content-updater.js not found"

**Cause**: Script path incorrect or file missing
**Solution**:

```bash
# Verify file exists
ls -la app/public/docs-html/html-content-updater.js

# Run from project root
cd /path/to/hextrackr && node app/public/docs-html/html-content-updater.js
```

#### "Cannot read property 'replace' of undefined"

**Cause**: Template file corrupt or missing
**Solution**:

```bash
# Check template file
cat app/public/docs-html/template.html

# Restore template if needed
git checkout app/public/docs-html/template.html
```

#### "Path traversal detected"

**Cause**: Invalid file paths in markdown content
**Solution**: Review and fix file path references in markdown files

### Exit Codes

- **0**: Success
- **1**: General error (check logs)
- **2**: File system permission error
- **3**: Template or configuration error

## Advanced Debugging

### Enable Debug Logging

```bash
# Enable verbose output
export DEBUG=docs:*
npm run docs:generate

# Log to file
npm run docs:generate > docs-debug.log 2>&1
```

### Manual Step-by-Step Testing

```javascript
// Test template loading
const fs = require('fs');
const template = fs.readFileSync('app/public/docs-html/template.html', 'utf8');
console.log('Template loaded:', template.length, 'characters');

// Test markdown parsing
const { marked } = require('marked');
const markdown = '# Test\n\nThis is a test.';
const html = marked.parse(markdown);
console.log('Parsed HTML:', html);

// Test file discovery
const path = require('path');
const glob = require('glob');
const files = glob.sync('app/public/docs-source/**/*.md');
console.log('Found markdown files:', files.length);
```

## Prevention Tips

### Regular Maintenance

```bash
# Weekly maintenance routine
npm run lint:all
npm run docs:generate
npm test

# Check for broken links
npm run docs:validate-links
```

### Best Practices

- Always test documentation changes locally before committing
- Use relative links for internal documentation references
- Keep markdown files under 1MB for optimal performance
- Validate markdown syntax with linting tools

### Monitoring

```bash
# Monitor documentation build times
time npm run docs:generate

# Check generated file sizes
du -sh app/public/docs-html/content/

# Validate HTML output
html5validator app/public/docs-html/content/*.html
```

## Getting Help

If you continue experiencing issues:

1. **Check logs**: Review `logs/docs-source/html-update-report.md` for detailed error information
2. **Validate environment**: Ensure Node.js version compatibility and all dependencies are installed
3. **File permissions**: Verify read/write access to documentation directories
4. **Clean rebuild**: Delete `app/public/docs-html/content/` and regenerate from scratch

For persistent issues, create a bug report with:

- Error messages and stack traces
- Environment details (Node.js version, OS)
- Steps to reproduce the issue
- Documentation generation logs
