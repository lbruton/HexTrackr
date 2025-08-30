#!/bin/bash

# StackTrackr Memory System Monitor
# Monitors critical services and auto-restarts where possible
# Logs status and sends alerts when services are down

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
LOG_FILE="$PROJECT_ROOT/logs/memory-monitor.log"
STATUS_FILE="$PROJECT_ROOT/logs/memory-status.json"
ALERT_FILE="$PROJECT_ROOT/logs/memory-alerts.log"

# Create logs directory if it doesn't exist
mkdir -p "$PROJECT_ROOT/logs"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Timestamp function
timestamp() {
    date '+%Y-%m-%d %H:%M:%S'
}

# Logging function
log() {
    echo "$(timestamp) - $1" | tee -a "$LOG_FILE"
}

# Alert function
alert() {
    local message="$1"
    echo "$(timestamp) - ALERT: $message" | tee -a "$ALERT_FILE"
    # Desktop notification (macOS)
    osascript -e "display notification \"$message\" with title \"StackTrackr Memory Alert\""
}

# Check if service is running on port
check_port() {
    local port=$1
    local service_name=$2
    
    if lsof -i :$port > /dev/null 2>&1; then
        return 0
    else
        return 1
    fi
}

# Check HTTP endpoint
check_http() {
    local url=$1
    local timeout=${2:-5}
    
    if curl -s --max-time $timeout "$url" > /dev/null 2>&1; then
        return 0
    else
        return 1
    fi
}

# Check Memory Scribe Dashboard
check_memory_scribe() {
    local status="DOWN"
    local details=""
    
    if check_port 3002 "Memory Scribe"; then
        if check_http "http://localhost:3002/health"; then
            status="UP"
            details="Healthy on port 3002"
        else
            status="PARTIAL"
            details="Port 3002 open but health check failed"
        fi
    else
        status="DOWN"
        details="Not running on port 3002"
        
        # Auto-restart Memory Scribe
        log "Attempting to restart Memory Scribe Dashboard..."
        cd "$PROJECT_ROOT/memory-scribe"
        
        # Kill any existing process
        pkill -f "dashboard-server.js" 2>/dev/null
        
        # Start new process
        nohup node dashboard-server.js > scribe.log 2>&1 &
        sleep 3
        
        # Check if restart was successful
        if check_port 3002 "Memory Scribe"; then
            status="RESTARTED"
            details="Auto-restarted successfully"
            log "Memory Scribe Dashboard restarted successfully"
        else
            alert "Failed to restart Memory Scribe Dashboard"
        fi
    fi
    
    echo "$status|$details"
}

# Check MCP Servers
check_mcp_servers() {
    local memory_server_running=false
    local context7_running=false
    
    # Check for MCP memory server process
    if pgrep -f "mcp-server-memory" > /dev/null; then
        memory_server_running=true
    fi
    
    # Check for Context7 MCP server process  
    if pgrep -f "context7-mcp" > /dev/null; then
        context7_running=true
    fi
    
    if $memory_server_running && $context7_running; then
        echo "UP|Both MCP servers running"
    elif $memory_server_running; then
        echo "PARTIAL|Memory server only"
    elif $context7_running; then
        echo "PARTIAL|Context7 server only"
    else
        echo "DOWN|No MCP servers running - VS Code restart needed"
    fi
}

# Check Ollama
check_ollama() {
    local status="DOWN"
    local details=""
    
    if check_port 11434 "Ollama"; then
        if check_http "http://localhost:11434/api/tags"; then
            # Count available models
            local model_count=$(curl -s http://localhost:11434/api/tags 2>/dev/null | jq '.models | length' 2>/dev/null || echo "0")
            status="UP"
            details="$model_count models available"
        else
            status="PARTIAL"
            details="Port 11434 open but API not responding"
        fi
    else
        status="DOWN"
        details="Not running on port 11434"
    fi
    
    echo "$status|$details"
}

# Check OpenWebUI
check_openwebui() {
    local status="DOWN"
    local details=""
    
    if check_port 3031 "OpenWebUI"; then
        if check_http "http://localhost:3031/health"; then
            status="UP"
            details="Running on port 3031"
        else
            status="PARTIAL"
            details="Port 3031 open but health check failed"
        fi
    else
        # Check if it's running on wrong port (3000)
        if check_port 3000 "OpenWebUI"; then
            status="WRONG_PORT"
            details="Running on port 3000 instead of 3031"
            alert "OpenWebUI running on wrong port (3000) - should be 3031"
        else
            status="DOWN"
            details="Not running"
        fi
    fi
    
    echo "$status|$details"
}

# Main monitoring function
monitor_services() {
    local timestamp=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
    
    echo -e "${BLUE}=== StackTrackr Memory System Status Check ===${NC}"
    echo "Timestamp: $(timestamp)"
    echo
    
    # Check each service
    local memory_scribe_result=$(check_memory_scribe)
    local mcp_result=$(check_mcp_servers)
    local ollama_result=$(check_ollama)
    local openwebui_result=$(check_openwebui)
    
    # Parse results
    local memory_scribe_status="${memory_scribe_result%%|*}"
    local memory_scribe_details="${memory_scribe_result##*|}"
    
    local mcp_status="${mcp_result%%|*}"
    local mcp_details="${mcp_result##*|}"
    
    local ollama_status="${ollama_result%%|*}"
    local ollama_details="${ollama_result##*|}"
    
    local openwebui_status="${openwebui_result%%|*}"
    local openwebui_details="${openwebui_result##*|}"
    
    # Display status with colors
    display_service_status "Memory Scribe Dashboard" "$memory_scribe_status" "$memory_scribe_details"
    display_service_status "MCP Servers" "$mcp_status" "$mcp_details"
    display_service_status "Ollama API" "$ollama_status" "$ollama_details"
    display_service_status "OpenWebUI" "$openwebui_status" "$openwebui_details"
    
    # Generate JSON status
    cat > "$STATUS_FILE" << EOF
{
  "timestamp": "$timestamp",
  "services": {
    "memory_scribe": {
      "status": "$memory_scribe_status",
      "details": "$memory_scribe_details",
      "port": 3002
    },
    "mcp_servers": {
      "status": "$mcp_status", 
      "details": "$mcp_details"
    },
    "ollama": {
      "status": "$ollama_status",
      "details": "$ollama_details",
      "port": 11434
    },
    "openwebui": {
      "status": "$openwebui_status",
      "details": "$openwebui_details",
      "expected_port": 3031
    }
  },
  "overall_health": "$(calculate_overall_health "$memory_scribe_status" "$mcp_status" "$ollama_status" "$openwebui_status")"
}
EOF
    
    # Check for critical failures
    check_critical_failures "$memory_scribe_status" "$mcp_status" "$ollama_status" "$openwebui_status"
    
    echo
    log "Status check completed - see $STATUS_FILE for JSON details"
}

# Display service status with colors
display_service_status() {
    local name="$1"
    local status="$2"
    local details="$3"
    
    case "$status" in
        "UP"|"RESTARTED")
            echo -e "${GREEN}✓${NC} $name: ${GREEN}$status${NC} - $details"
            ;;
        "PARTIAL"|"WRONG_PORT")
            echo -e "${YELLOW}⚠${NC} $name: ${YELLOW}$status${NC} - $details"
            ;;
        "DOWN")
            echo -e "${RED}✗${NC} $name: ${RED}$status${NC} - $details"
            ;;
        *)
            echo -e "${BLUE}?${NC} $name: $status - $details"
            ;;
    esac
}

# Calculate overall system health
calculate_overall_health() {
    local memory_scribe="$1"
    local mcp="$2" 
    local ollama="$3"
    local openwebui="$4"
    
    local critical_down=0
    local warnings=0
    
    # Memory Scribe is critical
    if [[ "$memory_scribe" == "DOWN" ]]; then
        critical_down=$((critical_down + 1))
    elif [[ "$memory_scribe" == "PARTIAL" ]]; then
        warnings=$((warnings + 1))
    fi
    
    # MCP servers are critical for full functionality
    if [[ "$mcp" == "DOWN" ]]; then
        critical_down=$((critical_down + 1))
    elif [[ "$mcp" == "PARTIAL" ]]; then
        warnings=$((warnings + 1))
    fi
    
    # Ollama is important but not critical
    if [[ "$ollama" == "DOWN" ]]; then
        warnings=$((warnings + 1))
    fi
    
    # OpenWebUI is nice to have
    if [[ "$openwebui" == "DOWN" || "$openwebui" == "WRONG_PORT" ]]; then
        warnings=$((warnings + 1))
    fi
    
    if [[ $critical_down -gt 0 ]]; then
        echo "CRITICAL"
    elif [[ $warnings -gt 1 ]]; then
        echo "DEGRADED"
    elif [[ $warnings -gt 0 ]]; then
        echo "WARNING"
    else
        echo "HEALTHY"
    fi
}

# Check for critical failures and send alerts
check_critical_failures() {
    local memory_scribe="$1"
    local mcp="$2"
    local ollama="$3"
    local openwebui="$4"
    
    # Alert if Memory Scribe is down and couldn't be restarted
    if [[ "$memory_scribe" == "DOWN" ]]; then
        alert "Memory Scribe Dashboard is down and auto-restart failed!"
    fi
    
    # Alert if MCP servers are down (requires manual VS Code restart)
    if [[ "$mcp" == "DOWN" ]]; then
        alert "MCP servers are down - VS Code restart required!"
    fi
    
    # Alert if OpenWebUI is on wrong port
    if [[ "$openwebui" == "WRONG_PORT" ]]; then
        alert "OpenWebUI running on wrong port - check Docker configuration!"
    fi
}

# Install cron job function
install_cron() {
    local script_path="$SCRIPT_DIR/memory-system-monitor.sh"
    
    # Make script executable
    chmod +x "$script_path"
    
    # Check if cron job already exists
    if crontab -l 2>/dev/null | grep -q "memory-system-monitor.sh"; then
        echo "Cron job already exists"
        return 0
    fi
    
    # Add cron job to run every 15 minutes
    (crontab -l 2>/dev/null; echo "*/15 * * * * $script_path >> $LOG_FILE 2>&1") | crontab -
    
    echo "Cron job installed - monitoring every 15 minutes"
    log "Memory system monitoring cron job installed"
}

# Uninstall cron job function
uninstall_cron() {
    if crontab -l 2>/dev/null | grep -q "memory-system-monitor.sh"; then
        crontab -l 2>/dev/null | grep -v "memory-system-monitor.sh" | crontab -
        echo "Cron job removed"
        log "Memory system monitoring cron job removed"
    else
        echo "No cron job found"
    fi
}

# Show recent alerts
show_alerts() {
    if [[ -f "$ALERT_FILE" ]]; then
        echo "Recent alerts (last 24 hours):"
        grep "$(date -v-1d '+%Y-%m-%d')\|$(date '+%Y-%m-%d')" "$ALERT_FILE" | tail -20
    else
        echo "No alerts found"
    fi
}

# Main script logic
case "${1:-monitor}" in
    "monitor")
        monitor_services
        ;;
    "install-cron")
        install_cron
        ;;
    "uninstall-cron") 
        uninstall_cron
        ;;
    "alerts")
        show_alerts
        ;;
    "status")
        if [[ -f "$STATUS_FILE" ]]; then
            cat "$STATUS_FILE" | jq '.' 2>/dev/null || cat "$STATUS_FILE"
        else
            echo "No status file found - run monitor first"
        fi
        ;;
    "help")
        echo "Usage: $0 [monitor|install-cron|uninstall-cron|alerts|status|help]"
        echo ""
        echo "Commands:"
        echo "  monitor        - Run status check (default)"
        echo "  install-cron   - Install 15-minute monitoring cron job"
        echo "  uninstall-cron - Remove monitoring cron job"
        echo "  alerts         - Show recent alerts"
        echo "  status         - Show last status check results"
        echo "  help           - Show this help"
        ;;
    *)
        echo "Unknown command: $1"
        echo "Use '$0 help' for usage information"
        exit 1
        ;;
esac
