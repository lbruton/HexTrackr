#!/bin/bash

# Archive Duplicate Scripts - Safe Cleanup for StackTrackr
# Created: August 18, 2025
# Purpose: Move duplicate/dead scripts to archive instead of deleting

set -e

ARCHIVE_DIR="archive/duplicate-scripts-2025-08-18"
TIMESTAMP=$(date '+%Y-%m-%d_%H-%M-%S')

echo "🗄️  Starting safe archival of duplicate scripts..."
echo "📁 Archive location: $ARCHIVE_DIR"
echo "⏰ Timestamp: $TIMESTAMP"

# Function to safely move with backup
safe_move() {
    local source="$1"
    local dest_dir="$2"
    local reason="$3"
    
    if [ -e "$source" ]; then
        echo "📦 Moving: $source -> $dest_dir/ ($reason)"
        mkdir -p "$dest_dir"
        mv "$source" "$dest_dir/"
    else
        echo "⚠️  Skipped: $source (not found)"
    fi
}

echo ""
echo "🔄 Phase 1: Moving rEngine duplicate startup scripts..."

# rEngine duplicates (bin/ versions are active)
safe_move "rEngine/start-environment.sh" "$ARCHIVE_DIR/rEngine-duplicates" "Duplicate of bin/start-environment.sh"
safe_move "rEngine/start-scribe.sh" "$ARCHIVE_DIR/rEngine-duplicates" "Duplicate of bin/start-scribe.sh" 
safe_move "rEngine/start-smart-scribe.sh" "$ARCHIVE_DIR/rEngine-duplicates" "Duplicate of bin/start-smart-scribe.sh"

echo ""
echo "🔄 Phase 2: Moving obsolete automation scripts..."

# Obsolete automation scripts
safe_move "scripts/automated-document-sweep.sh" "$ARCHIVE_DIR/scripts-duplicates" "Superseded by rEngine/document-sweep.js"
safe_move "scripts/automated-memory-sync.sh" "$ARCHIVE_DIR/scripts-duplicates" "Superseded by rEngine/memory-sync-automation.sh"

echo ""
echo "🔄 Phase 3: Moving duplicate Docker configurations..."

# Duplicate Docker configs
safe_move "docker-dev.sh" "$ARCHIVE_DIR/root-duplicates" "Duplicate of docker/docker-dev.sh"
safe_move "launch-agent.applescript" "$ARCHIVE_DIR/root-duplicates" "Obsolete launch script"

echo ""
echo "🔄 Phase 4: Moving old/broken memory scripts..."

# Old memory management scripts
if [ -d "tools" ]; then
    echo "📦 Archiving tools/ directory (superseded by rEngine/ and scripts/)"
    mv tools "$ARCHIVE_DIR/tools-duplicates/"
fi

echo ""
echo "🔄 Phase 5: Moving miscellaneous duplicates..."

# Root level duplicates
safe_move "startup.sh" "$ARCHIVE_DIR/root-duplicates" "Superseded by bin/one-click-startup.sh"
safe_move "quick-start.sh" "$ARCHIVE_DIR/root-duplicates" "Superseded by bin/universal-agent-init.sh"

echo ""
echo "📝 Creating archive manifest..."

# Create manifest of what was archived
cat > "$ARCHIVE_DIR/ARCHIVE_MANIFEST.md" << EOF
# Duplicate Scripts Archive - $(date)

## Purpose
This archive contains duplicate, obsolete, or superseded scripts that were safely moved during system cleanup.

## Active Replacements
- **Startup Scripts**: Use \`bin/\` versions instead of \`rEngine/\` duplicates
- **Document Sweep**: Use \`rEngine/document-sweep.js\` instead of \`scripts/automated-document-sweep.sh\`
- **Memory Sync**: Use \`rEngine/memory-sync-automation.sh\` instead of \`scripts/automated-memory-sync.sh\`
- **Docker**: Use \`docker/docker-dev.sh\` instead of root \`docker-dev.sh\`
- **Agent Init**: Use \`bin/universal-agent-init.sh\` instead of \`quick-start.sh\`

## Directory Structure
- \`rEngine-duplicates/\`: Scripts duplicated from bin/
- \`scripts-duplicates/\`: Obsolete automation scripts  
- \`tools-duplicates/\`: Old tools directory
- \`root-duplicates/\`: Miscellaneous root-level duplicates

## Restoration
If any archived script is needed:
\`\`\`bash
cp archive/duplicate-scripts-2025-08-18/[category]/[script] ./
\`\`\`

## Git Backup
Full backup tagged as: \`pre-cleanup-backup-2025-08-18\`
EOF

echo ""
echo "✅ Archive complete!"
echo "📊 Summary:"
find "$ARCHIVE_DIR" -type f | wc -l | xargs echo "   Files archived:"
du -sh "$ARCHIVE_DIR" | awk '{print "   Archive size: " $1}'
echo ""
echo "💡 To restore any file:"
echo "   cp $ARCHIVE_DIR/[category]/[filename] ./"
echo ""
echo "🔍 View manifest:"
echo "   cat $ARCHIVE_DIR/ARCHIVE_MANIFEST.md"
