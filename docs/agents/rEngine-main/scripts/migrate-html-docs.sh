#!/bin/bash

# Script to migrate HTML documentation to html-docs folder
# This moves all HTML files from docs/generated/html to html-docs for centralized management

set -e

echo "🔄 Starting HTML documentation migration..."

# Create destination directory structure
mkdir -p html-docs/generated
mkdir -p html-docs/archive

# Count existing files
HTML_COUNT=$(find docs/generated/html -name "*.html" 2>/dev/null | wc -l)
echo "📊 Found $HTML_COUNT HTML files to migrate"

# Backup current html-docs if it has content
if [ -d "html-docs" ] && [ "$(ls -A html-docs)" ]; then
    echo "💾 Backing up existing html-docs to html-docs/archive/backup-$(date +%Y%m%d-%H%M%S)"
    mkdir -p "html-docs/archive/backup-$(date +%Y%m%d-%H%M%S)"
    cp -r html-docs/* "html-docs/archive/backup-$(date +%Y%m%d-%H%M%S)/" 2>/dev/null || true
fi

# Move HTML files while preserving directory structure
echo "🚚 Moving HTML files to html-docs/generated..."
if [ -d "docs/generated/html" ]; then
    # Use rsync to preserve structure and handle duplicates
    rsync -av --remove-source-files docs/generated/html/ html-docs/generated/
    
    # Clean up empty directories
    find docs/generated/html -type d -empty -delete 2>/dev/null || true
fi

# Count migrated files
MIGRATED_COUNT=$(find html-docs/generated -name "*.html" 2>/dev/null | wc -l)
echo "✅ Migrated $MIGRATED_COUNT HTML files to html-docs/generated/"

# Update any existing portal links (if portal exists)
if [ -f "html-docs/documentation.html" ]; then
    echo "🔗 Updating portal links..."
    # Update relative paths in documentation portal
    sed -i.bak 's|docs/generated/html/|generated/|g' html-docs/documentation.html
    sed -i.bak 's|../docs/generated/html/|generated/|g' html-docs/documentation.html
    echo "✅ Portal links updated"
fi

# Create index of migrated files
echo "📋 Creating migration index..."
echo "# HTML Documentation Migration" > html-docs/MIGRATION-$(date +%Y%m%d-%H%M%S).md
echo "Migration completed: $(date)" >> html-docs/MIGRATION-$(date +%Y%m%d-%H%M%S).md
echo "" >> html-docs/MIGRATION-$(date +%Y%m%d-%H%M%S).md
echo "## Migrated Files:" >> html-docs/MIGRATION-$(date +%Y%m%d-%H%M%S).md
find html-docs/generated -name "*.html" | sort >> html-docs/MIGRATION-$(date +%Y%m%d-%H%M%S).md

echo "🎉 HTML documentation migration complete!"
echo "📁 All HTML files are now in: html-docs/generated/"
echo "📝 MD/JSON files remain in: docs/generated/"
echo "📋 Migration log: html-docs/MIGRATION-$(date +%Y%m%d-%H%M%S).md"
