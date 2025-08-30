#!/bin/bash

# StackTrackr MCP Servers Status Checker
# Quick status check without starting services

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Configuration
RENGINE_DIR="/Volumes/DATA/GitHub/rEngine/rEngine"
HEALTH_LOG="$RENGINE_DIR/health-monitor.log"
PID_FILE="$RENGINE_DIR/mcp-monitor.pid"

# Function to check if a process is running
is_running() {
    local pattern="$1"
    pgrep -f "$pattern" > /dev/null 2>&1
}

# Function to get detailed process info
get_process_info() {
    local pattern="$1"
    local name="$2"
    
    if is_running "$pattern"; then
        local pid=$(pgrep -f "$pattern" | head -1)
        local cpu=$(ps -p "$pid" -o %cpu= 2>/dev/null | tr -d ' ')
        local mem=$(ps -p "$pid" -o %mem= 2>/dev/null | tr -d ' ')
        local start_time=$(ps -p "$pid" -o lstart= 2>/dev/null)
        echo -e "${GREEN}✅ $name${NC}"
        echo -e "   PID: $pid | CPU: ${cpu}% | Memory: ${mem}%"
        echo -e "   Started: $start_time"
        return 0
    else
        echo -e "${RED}❌ $name: Not running${NC}"
        return 1
    fi
}

echo -e "${BLUE}📊 StackTrackr MCP Servers Status${NC}"
echo -e "${BLUE}🕐 $(date)${NC}\n"

# Check services
get_process_info "node.*index.js" "rEngineMCP Server"
echo
get_process_info "mcp-server-memory" "Memory MCP Server"
echo

# Check health monitor
if [ -f "$PID_FILE" ]; then
    local monitor_pid=$(cat "$PID_FILE")
    if ps -p "$monitor_pid" > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Health Monitor: Running (PID: $monitor_pid)${NC}"
    else
        echo -e "${YELLOW}⚠️  Health Monitor: PID file exists but process not running${NC}"
        rm -f "$PID_FILE"
    fi
else
    echo -e "${YELLOW}⚠️  Health Monitor: Not running${NC}"
fi

echo

# Check recent health log entries
if [ -f "$HEALTH_LOG" ]; then
    echo -e "${BLUE}📋 Recent Health Log (last 5 entries):${NC}"
    tail -5 "$HEALTH_LOG" | sed 's/^/   /'
else
    echo -e "${YELLOW}📋 No health log found${NC}"
fi

echo
echo -e "${BLUE}💡 Usage:${NC}"
echo -e "   Start with monitoring: ./start-mcp-servers-with-monitoring.sh"
echo -e "   Quick start (no monitoring): ./start-mcp-servers.sh"
echo -e "   Status check: ./check-mcp-status.sh"
