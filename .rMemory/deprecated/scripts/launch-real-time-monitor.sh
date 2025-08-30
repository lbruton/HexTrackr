#!/bin/bash

# Real-time Memory Monitor
# Continuously monitors for immediate context changes and adds to memory queue

# Configuration
RMEMORY_DIR="/Volumes/DATA/GitHub/HexTrackr/.rMemory"
QUEUE_DIR="$RMEMORY_DIR/docs/ops/memory-queue"
LOGS_DIR="$RMEMORY_DIR/docs/ops/logs"
NODE_BIN="/usr/local/bin/node"
PID_FILE="/tmp/rmemory-realtime-monitor.pid"

# Interval in seconds (30 seconds for real-time monitoring)
MONITOR_INTERVAL=30

# Timestamp
TIMESTAMP=$(date '+%Y-%m-%d_%H-%M-%S')
LOG_FILE="$LOGS_DIR/realtime-monitor-$TIMESTAMP.log"

# Create directories if needed
mkdir -p "$QUEUE_DIR/real-time"
mkdir -p "$LOGS_DIR"

# Log function
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

# Check if already running
if [ -f "$PID_FILE" ]; then
    PID=$(cat "$PID_FILE")
    if kill -0 "$PID" 2>/dev/null; then
        log "Real-time monitor already running with PID: $PID"
        exit 1
    else
        log "Removing stale PID file"
        rm -f "$PID_FILE"
    fi
fi

# Store our PID
echo $$ > "$PID_FILE"

log "Starting real-time memory monitor (PID: $$)"
log "Monitoring interval: ${MONITOR_INTERVAL} seconds"

# Cleanup function
cleanup() {
    log "Shutting down real-time monitor..."
    rm -f "$PID_FILE"
    exit 0
}

# Trap signals for clean shutdown
trap cleanup SIGTERM SIGINT

# Main monitoring loop
while true; do
    # Start the real-time scribe in monitoring mode
    $NODE_BIN "$RMEMORY_DIR/scribes/real-time-analysis.js" --monitor >> "$LOG_FILE" 2>&1 &
    SCRIBE_PID=$!
    
    log "Real-time scribe started in monitoring mode (PID: $SCRIBE_PID)"
    log "Monitoring interval: ${MONITOR_INTERVAL} seconds"
    log "Model: qwen2.5-coder:7b"
    
    # Store the scribe PID for management
    echo $SCRIBE_PID > "/tmp/rmemory-scribe.pid"
done
