#!/bin/bash

# StackTrackr MCP Health Monitor
# Monitors and auto-restarts MCP servers if they crash

SCRIPT_DIR="/Volumes/DATA/GitHub/rEngine/rEngineMCP"
STARTUP_SCRIPT="$SCRIPT_DIR/start-mcp-servers.sh"
HEALTH_LOG="$SCRIPT_DIR/health-monitor.log"

log_message() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') - $1" >> "$HEALTH_LOG"
}

# Function to check if a process is running
is_running() {
    local pattern="$1"
    pgrep -f "$pattern" > /dev/null 2>&1
}

# Health check function
health_check() {
    local restart_needed=false
    
    # Check rEngineMCP
    if ! is_running "node.*index.js"; then
        log_message "❌ rEngineMCP server down - restarting..."
        restart_needed=true
    fi
    
    # Check Memory MCP
    if ! is_running "mcp-server-memory"; then
        log_message "❌ Memory MCP server down - restarting..."
        restart_needed=true
    fi
    
    if [ "$restart_needed" = true ]; then
        log_message "🔄 Running startup script..."
        "$STARTUP_SCRIPT"
        log_message "✅ Restart completed"
    fi
}

# Initial log entry
log_message "🏥 Health monitor started"

# Run health check
health_check

# If called with --daemon, run continuous monitoring
if [ "$1" = "--daemon" ]; then
    log_message "🔄 Starting daemon mode (5-minute intervals)"
    while true; do
        sleep 300  # Check every 5 minutes
        health_check
    done
fi
