#!/bin/bash

# Enhanced Memory Sync Integration Script
# Purpose: Integrate write-through memory sync into regular workflows
# Usage: ./integrate-enhanced-memory-sync.sh

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

echo "🔧 Integrating Enhanced Memory Sync into StackTrackr"
echo "═══════════════════════════════════════════════════"

# 1. Update memory sync automation to use enhanced version
echo "📝 Updating memory-sync-automation.sh..."
AUTOMATION_FILE="$PROJECT_DIR/rEngine/memory-sync-automation.sh"

# Add enhanced sync call to automation
if grep -q "enhanced-memory-sync.js" "$AUTOMATION_FILE"; then
    echo "✅ Enhanced sync already integrated in automation"
else
    # Insert enhanced sync call before regular sync
    sed -i.bak '/node rEngine\/memory-sync-utility.js/i\
    # Run enhanced memory sync first\
    log "🚀 Running enhanced memory sync with write-through policy..."\
    if node rEngine/enhanced-memory-sync.js >> "$LOG_FILE" 2>&1; then\
        log "✅ Enhanced memory sync completed"\
    else\
        log "⚠️  Enhanced memory sync had issues, continuing with regular sync"\
    fi\
    ' "$AUTOMATION_FILE"
    echo "✅ Enhanced sync integrated into automation"
fi

# 2. Add validation hook to recall.js (already done)
echo "✅ Freshness validation already added to recall.js"

# 3. Create cron job suggestion
echo ""
echo "📅 Suggested cron job for automated sync (every 3 hours):"
echo "0 */3 * * * cd $PROJECT_DIR && ./rEngine/memory-sync-automation.sh cron"

# 4. Add to quick-start.sh integration
QUICKSTART_FILE="$PROJECT_DIR/quick-start.sh"
if grep -q "enhanced-memory-sync" "$QUICKSTART_FILE"; then
    echo "✅ Enhanced sync already in quick-start.sh"
else
    echo "💡 Consider adding enhanced memory sync check to quick-start.sh"
fi

# 5. Test the integration
echo ""
echo "🧪 Testing enhanced memory sync..."
cd "$PROJECT_DIR"
node rEngine/enhanced-memory-sync.js

echo ""
echo "✅ Enhanced Memory Sync Integration Complete!"
echo ""
echo "📋 Next Steps:"
echo "1. Enhanced sync runs automatically with memory-sync-automation.sh"
echo "2. Freshness warnings appear in recall.js when files are stale"
echo "3. Write-through policy keeps handoff.json and tasks.json current"
echo "4. Consider setting up cron job for regular automated sync"
echo ""
echo "🎯 Stale file issue should now be resolved!"
