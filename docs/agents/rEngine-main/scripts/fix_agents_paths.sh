#!/bin/bash

# Script to fix all remaining agents/ path references to rAgents/
# This will fix the lazy symlink hack once and for all

echo "🔧 Fixing agents/ path references to rAgents/"
echo "=============================================="

# Find and replace in all relevant files
find . -type f \( -name "*.json" -o -name "*.js" -o -name "*.md" -o -name "*.sh" \) \
    -not -path "./node_modules/*" \
    -not -path "./.git/*" \
    -not -path "./archive/*" \
    -not -path "./backups/*" \
    -exec grep -l "agents/" {} \; | while read file; do
    
    echo "📝 Updating: $file"
    
    # Use sed to replace agents/ with rAgents/ but be careful not to replace:
    # - "agents" in comments that aren't paths
    # - "agents" in general text
    # Only replace "agents/" (with trailing slash) to be path-specific
    sed -i '' 's|agents/|rAgents/|g' "$file"
done

echo ""
echo "✅ Path fix complete!"
echo ""
echo "🔍 Verification - remaining agents/ references:"
grep -r "agents/" . --include="*.json" --include="*.js" --include="*.md" --include="*.sh" \
    --exclude-dir=node_modules --exclude-dir=.git --exclude-dir=archive --exclude-dir=backups | head -10

echo ""
echo "🧹 Cleanup complete! The symlink hack has been properly fixed."
