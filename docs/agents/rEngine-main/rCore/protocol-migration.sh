#!/bin/bash

# Protocol Stack Cleanup and Migration Script
# Purpose: Migrate useful content from old protocols/ to rProtocols/ and clean up duplicates

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
OLD_PROTOCOLS="$PROJECT_DIR/protocols"
NEW_PROTOCOLS="$PROJECT_DIR/rProtocols"
ARCHIVE_DIR="$PROJECT_DIR/archive/protocol-migration-$(date +%Y%m%d)"

echo "🧹 Protocol Stack Cleanup and Migration"
echo "═══════════════════════════════════════"
echo "Old protocols: $OLD_PROTOCOLS"
echo "New protocols: $NEW_PROTOCOLS"
echo "Archive: $ARCHIVE_DIR"
echo ""

# Create archive directory
mkdir -p "$ARCHIVE_DIR"

# Analysis function
analyze_file_differences() {
    local old_file="$1"
    local new_file="$2"
    local filename="$3"
    
    if [ ! -f "$new_file" ]; then
        echo "📋 $filename: Only in old protocols - CANDIDATE FOR MIGRATION"
        return 1
    fi
    
    if diff -q "$old_file" "$new_file" > /dev/null 2>&1; then
        echo "✅ $filename: Identical files - SAFE TO REMOVE OLD"
        return 0
    else
        echo "⚠️  $filename: Files differ - NEEDS REVIEW"
        echo "   Size old: $(wc -l < "$old_file") lines"
        echo "   Size new: $(wc -l < "$new_file") lines"
        return 2
    fi
}

echo "🔍 Analyzing protocol files..."
echo "───────────────────────────────────────"

IDENTICAL_COUNT=0
DIFFERENT_COUNT=0
MIGRATION_COUNT=0

# Check each file in old protocols
for old_file in "$OLD_PROTOCOLS"/*.md; do
    if [ -f "$old_file" ]; then
        filename=$(basename "$old_file")
        new_file="$NEW_PROTOCOLS/$filename"
        
        analyze_file_differences "$old_file" "$new_file" "$filename"
        result=$?
        
        case $result in
            0) IDENTICAL_COUNT=$((IDENTICAL_COUNT + 1)) ;;
            1) MIGRATION_COUNT=$((MIGRATION_COUNT + 1)) ;;
            2) DIFFERENT_COUNT=$((DIFFERENT_COUNT + 1)) ;;
        esac
    fi
done

echo ""
echo "📊 Analysis Summary:"
echo "   ✅ Identical files: $IDENTICAL_COUNT"
echo "   ⚠️  Different files: $DIFFERENT_COUNT"
echo "   📋 Migration candidates: $MIGRATION_COUNT"
echo ""

# Handle deprecated files
echo "🗑️  Checking for deprecated content..."
if [ -f "$OLD_PROTOCOLS/handoff.md" ]; then
    if grep -q "DEPRECATED" "$OLD_PROTOCOLS/handoff.md"; then
        echo "✅ handoff.md: Confirmed deprecated, safe to archive"
        cp "$OLD_PROTOCOLS/handoff.md" "$ARCHIVE_DIR/deprecated-handoff.md"
    fi
fi

# Migration decisions
echo ""
echo "🎯 Migration Plan:"
echo "─────────────────"

# Files that are identical - can remove old versions
echo "📝 Files to remove (identical in rProtocols):"
for old_file in "$OLD_PROTOCOLS"/*.md; do
    if [ -f "$old_file" ]; then
        filename=$(basename "$old_file")
        new_file="$NEW_PROTOCOLS/$filename"
        
        if [ -f "$new_file" ] && diff -q "$old_file" "$new_file" > /dev/null 2>&1; then
            echo "   - $filename"
        fi
    fi
done

echo ""
echo "📝 Files with differences (need review):"
for old_file in "$OLD_PROTOCOLS"/*.md; do
    if [ -f "$old_file" ]; then
        filename=$(basename "$old_file")
        new_file="$NEW_PROTOCOLS/$filename"
        
        if [ -f "$new_file" ] && ! diff -q "$old_file" "$new_file" > /dev/null 2>&1; then
            echo "   - $filename (review needed)"
        fi
    fi
done

echo ""
echo "🤔 Would you like to proceed with migration? (y/N)"
read -r PROCEED

if [[ "$PROCEED" =~ ^[Yy]$ ]]; then
    echo ""
    echo "🚀 Executing migration..."
    
    # Archive the entire old protocols directory
    echo "📦 Archiving old protocols directory..."
    cp -r "$OLD_PROTOCOLS" "$ARCHIVE_DIR/protocols-backup"
    
    # Remove identical files from old protocols
    for old_file in "$OLD_PROTOCOLS"/*.md; do
        if [ -f "$old_file" ]; then
            filename=$(basename "$old_file")
            new_file="$NEW_PROTOCOLS/$filename"
            
            if [ -f "$new_file" ] && diff -q "$old_file" "$new_file" > /dev/null 2>&1; then
                echo "🗑️  Removing identical file: $filename"
                rm "$old_file"
            fi
        fi
    done
    
    # Remove deprecated handoff.md if exists
    if [ -f "$OLD_PROTOCOLS/handoff.md" ] && grep -q "DEPRECATED" "$OLD_PROTOCOLS/handoff.md"; then
        echo "🗑️  Removing deprecated handoff.md"
        rm "$OLD_PROTOCOLS/handoff.md"
    fi
    
    # Check if protocols directory is now empty
    if [ ! "$(ls -A "$OLD_PROTOCOLS" 2>/dev/null)" ]; then
        echo "📁 Old protocols directory is empty, removing it..."
        rmdir "$OLD_PROTOCOLS"
        echo "✅ Old protocols/ directory removed"
    else
        echo "📁 Old protocols directory still contains files:"
        ls -la "$OLD_PROTOCOLS"
        echo "💡 Consider reviewing remaining files manually"
    fi
    
    # Update any references to old protocols directory
    echo "🔗 Updating references..."
    
    # Check for any hardcoded references to protocols/ that should be rProtocols/
    echo "🔍 Checking for protocol references that need updating..."
    
    # Search for references (excluding our own script and archive)
    if command -v rg >/dev/null 2>&1; then
        rg "protocols/" --type md --type js --type sh "$PROJECT_DIR" \
            --exclude-dir archive \
            --exclude-dir "$ARCHIVE_DIR" \
            --exclude "$(basename "$0")" || true
    else
        grep -r "protocols/" --include="*.md" --include="*.js" --include="*.sh" "$PROJECT_DIR" \
            --exclude-dir=archive 2>/dev/null | \
            grep -v "$(basename "$0")" || true
    fi
    
    echo ""
    echo "✅ Protocol migration completed!"
    echo "📦 Backup saved to: $ARCHIVE_DIR"
    echo "📁 Active protocols now in: $NEW_PROTOCOLS"
    
else
    echo "❌ Migration cancelled"
fi

echo ""
echo "📋 Next Steps:"
echo "1. Review any remaining files in protocols/ directory"
echo "2. Update any hardcoded references from protocols/ to rProtocols/"
echo "3. Test system functionality to ensure no broken references"
echo "4. Commit the cleanup changes"
