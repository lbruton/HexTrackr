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
    if node rCore/enhanced-memory-sync.js >> "$LOG_FILE" 2>&1; then
        log "✅ Enhanced memory sync completed"
    else
        log "⚠️  Enhanced memory sync had issues, continuing with regular sync"
    fi
        if node rCore/memory-sync-utility.js >> "$LOG_FILE" 2>&1; then
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
        echo "{\"status\":\"failure\",\"timestamp\":\"$(date -u +%Y-%m-%dT%H:%M:%SZ)\",\"log\":\"$LOG_FILE\"}" > "$LOG_DIR/last-sync-status.json"
        return 1
    fi
}

MODE=${1:-manual}

if [ "$MODE" = "manual" ]; then
    run_memory_sync
else
    run_memory_sync > /dev/null 2>&1
fi
