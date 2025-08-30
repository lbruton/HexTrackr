#!/bin/bash

# Memory Sync Automation Script
# Purpose: Automated daily sync between MCP and rMemory systems
# Schedule: Recommended daily execution via cron
# 
# Usage: ./memory-sync-automation.sh [manual|cron]
# Manual: Interactive mode with full output
# Cron: Silent mode with log file output only

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
LOG_DIR="$PROJECT_DIR/logs"
TIMESTAMP=$(date "+%Y-%m-%d_%H-%M-%S")
LOG_FILE="$LOG_DIR/memory-sync-auto-$TIMESTAMP.log"

# Ensure logs directory exists
mkdir -p "$LOG_DIR"

# Function to log with timestamp
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

# Function to run sync
run_memory_sync() {
    log "🔄 Starting automated memory sync..."
    
    cd "$PROJECT_DIR" || {
        log "❌ Failed to change to project directory: $PROJECT_DIR"
        exit 1
    }
    
    # Run memory sync utility
    # Run enhanced memory sync first
    log "🚀 Running enhanced memory sync with write-through policy..."
    if node rEngine/enhanced-memory-sync.js >> "$LOG_FILE" 2>&1; then
        log "✅ Enhanced memory sync completed"
    else
        log "⚠️  Enhanced memory sync had issues, continuing with regular sync"
    fi
        if node rEngine/memory-sync-utility.js >> "$LOG_FILE" 2>&1; then
        log "✅ Memory sync completed successfully"
        
        # Update development status dashboard timestamp
        if [ -f "developmentstatus.html" ]; then
            # Update the timestamp in the dashboard (simple sed replacement)
            CURRENT_DATE=$(date "+%B %d, %Y")
            sed -i '' "s/Last Updated: [^<]*/Last Updated: $CURRENT_DATE/" developmentstatus.html
            log "✅ Updated development dashboard timestamp"
        fi
        
        # Create success marker
        echo "{\"status\":\"success\",\"timestamp\":\"$(date -u +%Y-%m-%dT%H:%M:%SZ)\",\"log\":\"$LOG_FILE\"}" > "$LOG_DIR/last-sync-status.json"
        
        return 0
    else
        log "❌ Memory sync failed - see log for details"
        
        # Create failure marker
        echo "{\"status\":\"failed\",\"timestamp\":\"$(date -u +%Y-%m-%dT%H:%M:%SZ)\",\"log\":\"$LOG_FILE\"}" > "$LOG_DIR/last-sync-status.json"
        
        return 1
    fi
}

# Function to check sync health
check_sync_health() {
    log "🏥 Checking memory sync health..."
    
    # Check if critical files exist and are recent
    CRITICAL_FILES=("rMemory/rAgentMemories/memory.json" "rMemory/rAgentMemories/handoff.json" "rMemory/rAgentMemories/tasks.json" "rMemory/rAgentMemories/persistent-memory.json")
    
    for file in "${CRITICAL_FILES[@]}"; do
        if [ -f "$PROJECT_DIR/$file" ]; then
            # Check file age (in seconds)
            if [ "$(uname)" = "Darwin" ]; then
                # macOS
                FILE_AGE=$(($(date +%s) - $(stat -f %m "$PROJECT_DIR/$file")))
            else
                # Linux
                FILE_AGE=$(($(date +%s) - $(stat -c %Y "$PROJECT_DIR/$file")))
            fi
            
            # 86400 seconds = 24 hours
            if [ $FILE_AGE -gt 86400 ]; then
                log "⚠️  $file is $(($FILE_AGE / 3600)) hours old - may need sync"
            else
                log "✅ $file is fresh ($(($FILE_AGE / 3600)) hours old)"
            fi
        else
            log "❌ $file is missing - critical for agent continuity"
        fi
    done
}

# Function to setup cron job
setup_cron() {
    log "⏰ Setting up automated daily sync..."
    
    # Create cron job entry (daily at 6 AM)
    CRON_ENTRY="0 6 * * * cd $PROJECT_DIR && $SCRIPT_DIR/memory-sync-automation.sh cron >/dev/null 2>&1"
    
    # Check if cron job already exists
    if crontab -l 2>/dev/null | grep -q "memory-sync-automation.sh"; then
        log "ℹ️  Cron job already exists for memory sync"
    else
        # Add cron job
        (crontab -l 2>/dev/null; echo "$CRON_ENTRY") | crontab -
        log "✅ Added daily memory sync cron job (6 AM)"
        log "📋 Cron job: $CRON_ENTRY"
    fi
}

# Function to show sync status
show_status() {
    log "📊 Memory Sync Status Dashboard"
    log "════════════════════════════════"
    
    # Check last sync status
    if [ -f "$LOG_DIR/last-sync-status.json" ]; then
        LAST_STATUS=$(cat "$LOG_DIR/last-sync-status.json")
        log "📋 Last sync: $LAST_STATUS"
    else
        log "⚠️  No previous sync status found"
    fi
    
    # Check sync health
    check_sync_health
    
    # Show recent log files
    log "📁 Recent sync logs:"
    ls -la "$LOG_DIR"/memory-sync-auto-*.log 2>/dev/null | tail -5 | while read line; do
        log "   $line"
    done
}

# Main execution
MODE="${1:-manual}"

case "$MODE" in
    "manual")
        log "🚀 Manual Memory Sync Execution"
        log "════════════════════════════════"
        show_status
        echo ""
        run_memory_sync
        echo ""
        log "🔗 View detailed sync results: $LOG_FILE"
        ;;
        
    "cron")
        # Silent cron mode - all output goes to log file only
        echo "[$(date '+%Y-%m-%d %H:%M:%S')] 🤖 Automated Memory Sync (Cron)" >> "$LOG_FILE"
        run_memory_sync
        ;;
        
    "setup")
        log "⚙️  Memory Sync Setup Mode"
        log "═══════════════════════════"
        setup_cron
        show_status
        ;;
        
    "status")
        show_status
        ;;
        
    *)
        echo "Usage: $0 [manual|cron|setup|status]"
        echo ""
        echo "  manual  - Run sync interactively with full output"
        echo "  cron    - Run sync silently for cron execution" 
        echo "  setup   - Setup automated daily sync via cron"
        echo "  status  - Show current sync status and health"
        echo ""
        echo "Example cron setup:"
        echo "  $0 setup"
        exit 1
        ;;
esac

log "✨ Memory sync automation complete!"
