#!/bin/bash

# Safe Protocol Cleanup Script
# Purpose: Remove outdated protocols/ directory since rProtocols/ contains updated versions

PROJECT_DIR="/Volumes/DATA/GitHub/rEngine"
OLD_PROTOCOLS="$PROJECT_DIR/protocols"
ARCHIVE_DIR="$PROJECT_DIR/archive/protocols-cleanup-$(date +%Y%m%d-%H%M%S)"

echo "🧹 Safe Protocol Cleanup"
echo "═══════════════════════"
echo "Analysis shows rProtocols/ contains updated versions"
echo "Moving old protocols/ to archive for safety"
echo ""

# Create archive directory
mkdir -p "$ARCHIVE_DIR"

# Archive the entire old protocols directory
echo "📦 Archiving old protocols directory..."
cp -r "$OLD_PROTOCOLS" "$ARCHIVE_DIR/"
echo "✅ Backup created: $ARCHIVE_DIR/protocols/"

# Remove the old protocols directory
echo "🗑️  Removing old protocols/ directory..."
rm -rf "$OLD_PROTOCOLS"
echo "✅ Old protocols/ directory removed"

# Check for any references that need updating
echo ""
echo "🔍 Checking for references that need updating..."

# Create a list of files that might reference the old protocols/ directory
REFERENCES_FOUND=false

# Search for hardcoded references to protocols/ (excluding archive and hidden files)
while IFS= read -r -d '' file; do
    if grep -l "protocols/" "$file" 2>/dev/null | grep -v ".git" | grep -v "archive" | grep -v "$(basename "$0")" >/dev/null 2>&1; then
        echo "📝 Found reference in: $file"
        REFERENCES_FOUND=true
    fi
done < <(find "$PROJECT_DIR" -type f \( -name "*.md" -o -name "*.js" -o -name "*.sh" -o -name "*.json" \) -not -path "*/.*" -not -path "*/archive/*" -not -path "*/node_modules/*" -print0)

if [ "$REFERENCES_FOUND" = false ]; then
    echo "✅ No hardcoded references to protocols/ found"
else
    echo ""
    echo "⚠️  Some references found - consider updating them to use rProtocols/"
fi

echo ""
echo "✅ Protocol cleanup completed successfully!"
echo ""
echo "📋 Summary:"
echo "   📁 Old protocols/ directory archived and removed"
echo "   📦 Backup available at: $ARCHIVE_DIR/protocols/"
echo "   📂 Active protocols now in: rProtocols/"
echo ""
echo "📝 Updated protocol structure:"
echo "   ✅ rProtocols/ - Active operational protocols"
echo "   📦 archive/ - Historical backups"
echo "   🗑️  protocols/ - Removed (was duplicate/outdated)"
