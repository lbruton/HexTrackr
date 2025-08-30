#!/bin/bash

# Memory Import Automation
# Processes accumulated memory queue and imports to Memento MCP

# Configuration
RMEMORY_DIR="/Volumes/DATA/GitHub/HexTrackr/.rMemory"
QUEUE_DIR="$RMEMORY_DIR/docs/ops/memory-queue"
LOGS_DIR="$RMEMORY_DIR/docs/ops/logs"
NODE_BIN="/usr/local/bin/node"

# Timestamp
TIMESTAMP=$(date '+%Y-%m-%d_%H-%M-%S')
LOG_FILE="$LOGS_DIR/memory-import-$TIMESTAMP.log"

# Create directories if needed
mkdir -p "$QUEUE_DIR"/{real-time,chat-updates,deep-analysis,frustration-data}
mkdir -p "$LOGS_DIR"

# Log function
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

log "Starting automated memory import workflow..."

# Process real-time queue (30-second insights)
if [ -d "$QUEUE_DIR/real-time" ] && [ "$(ls -A $QUEUE_DIR/real-time)" ]; then
    log "Processing real-time insights..."
    
    for file in "$QUEUE_DIR/real-time"/*.json; do
        if [ -f "$file" ]; then
            log "Importing: $(basename "$file")"
            $NODE_BIN "$RMEMORY_DIR/scribes/memory-importer.js" "$file"
            
            if [ $? -eq 0 ]; then
                # Move processed file to archive
                mv "$file" "$QUEUE_DIR/real-time/processed/"
                log "Successfully imported: $(basename "$file")"
            else
                log "ERROR: Failed to import: $(basename "$file")"
            fi
        fi
    done
fi

# Process chat-updates queue (5-minute processing)
if [ -d "$QUEUE_DIR/chat-updates" ] && [ "$(ls -A $QUEUE_DIR/chat-updates)" ]; then
    log "Processing chat updates..."
    
    for file in "$QUEUE_DIR/chat-updates"/*.json; do
        if [ -f "$file" ]; then
            log "Importing chat update: $(basename "$file")"
            $NODE_BIN "$RMEMORY_DIR/scribes/memory-importer.js" "$file"
            
            if [ $? -eq 0 ]; then
                mv "$file" "$QUEUE_DIR/chat-updates/processed/"
                log "Successfully imported chat update: $(basename "$file")"
            else
                log "ERROR: Failed to import chat update: $(basename "$file")"
            fi
        fi
    done
fi

# Process deep analysis queue (hourly comprehensive)
if [ -d "$QUEUE_DIR/deep-analysis" ] && [ "$(ls -A $QUEUE_DIR/deep-analysis)" ]; then
    log "Processing deep analysis insights..."
    
    for file in "$QUEUE_DIR/deep-analysis"/*.json; do
        if [ -f "$file" ]; then
            log "Importing deep analysis: $(basename "$file")"
            $NODE_BIN "$RMEMORY_DIR/scribes/memory-importer.js" "$file"
            
            if [ $? -eq 0 ]; then
                mv "$file" "$QUEUE_DIR/deep-analysis/processed/"
                log "Successfully imported deep analysis: $(basename "$file")"
            else
                log "ERROR: Failed to import deep analysis: $(basename "$file")"
            fi
        fi
    done
fi

# Process frustration data (daily learning)
if [ -d "$QUEUE_DIR/frustration-data" ] && [ "$(ls -A $QUEUE_DIR/frustration-data)" ]; then
    log "Processing frustration analysis..."
    
    for file in "$QUEUE_DIR/frustration-data"/*.json; do
        if [ -f "$file" ]; then
            log "Importing frustration data: $(basename "$file")"
            $NODE_BIN "$RMEMORY_DIR/scribes/memory-importer.js" "$file"
            
            if [ $? -eq 0 ]; then
                mv "$file" "$QUEUE_DIR/frustration-data/processed/"
                log "Successfully imported frustration data: $(basename "$file")"
            else
                log "ERROR: Failed to import frustration data: $(basename "$file")"
            fi
        fi
    done
fi

# Generate daily briefing if it's morning (between 6-9 AM)
CURRENT_HOUR=$(date '+%H')
if [ "$CURRENT_HOUR" -ge 6 ] && [ "$CURRENT_HOUR" -le 9 ]; then
    BRIEFING_FILE="$RMEMORY_DIR/docs/agent-briefing-$(date '+%Y-%m-%d').md"
    
    if [ ! -f "$BRIEFING_FILE" ]; then
        log "Generating daily agent briefing..."
        $NODE_BIN "$RMEMORY_DIR/scribes/agent-context-loader.js"
        
        if [ $? -eq 0 ]; then
            log "Daily briefing generated: $BRIEFING_FILE"
        else
            log "ERROR: Failed to generate daily briefing"
        fi
    else
        log "Daily briefing already exists: $BRIEFING_FILE"
    fi
fi

# Cleanup old logs (keep last 30 days)
find "$LOGS_DIR" -name "memory-import-*.log" -mtime +30 -delete

log "Memory import workflow completed."

# Statistics
PROCESSED_COUNT=$(find "$QUEUE_DIR" -name "processed" -type d -exec find {} -name "*.json" \; | wc -l)
log "Total files processed: $PROCESSED_COUNT"

exit 0
