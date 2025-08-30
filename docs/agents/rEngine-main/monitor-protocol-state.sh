#!/bin/bash
# Protocol State Monitor - Real-time system health monitoring
# Usage: ./monitor-protocol-state.sh [--continuous|--once|--reset]

cd "$(dirname "$0")"

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

PROTOCOL_STATE_FILE="./logs/protocol-state.json"
MONITOR_MODE="${1:-once}"

# Create directory if it doesn't exist
mkdir -p ./logs

check_system_health() {
    local timestamp=$(date)
    
    echo -e "${CYAN}📊 rEngine System Health Check - $timestamp${NC}"
    echo "=================================================================="
    
    # Read current protocol state
    if [ -f "$PROTOCOL_STATE_FILE" ]; then
        local session_id=$(jq -r '.session_id // "unknown"' "$PROTOCOL_STATE_FILE" 2>/dev/null)
        local current_step=$(jq -r '.step // 0' "$PROTOCOL_STATE_FILE" 2>/dev/null)
        local status=$(jq -r '.status // "unknown"' "$PROTOCOL_STATE_FILE" 2>/dev/null)
        local last_update=$(jq -r '.last_update // "never"' "$PROTOCOL_STATE_FILE" 2>/dev/null)
        
        echo -e "Session ID: ${CYAN}$session_id${NC}"
        echo -e "Protocol Step: ${CYAN}$current_step/7${NC}"
        echo -e "Status: ${CYAN}$status${NC}"
        echo -e "Last Update: ${CYAN}$last_update${NC}"
        echo ""
    else
        echo -e "${YELLOW}⚠️  No protocol state file found${NC}"
        echo ""
    fi
    
    # Docker Services
    echo -e "${BLUE}🐳 Docker Services:${NC}"
    if docker-compose ps --filter "status=running" 2>/dev/null | grep -q "rengine\|mcp-server"; then
        echo -e "   ${GREEN}✅ Running${NC}"
        docker-compose ps --format "table {{.Name}}\t{{.Status}}" | grep -E "rengine|mcp-server" | sed 's/^/   /'
    else
        echo -e "   ${RED}❌ Not running or issues detected${NC}"
    fi
    echo ""
    
    # Ollama Service
    echo -e "${BLUE}🦙 Ollama Service:${NC}"
    if pgrep -f "ollama" &>/dev/null; then
        if curl -s http://localhost:11434/api/version &>/dev/null; then
            echo -e "   ${GREEN}✅ Running and responsive${NC}"
            local version=$(curl -s http://localhost:11434/api/version 2>/dev/null | jq -r '.version // "unknown"' 2>/dev/null)
            echo -e "   Version: $version"
        else
            echo -e "   ${YELLOW}⚠️  Process running but not responsive${NC}"
        fi
    else
        echo -e "   ${RED}❌ Not running${NC}"
    fi
    echo ""
    
    # MCP Server
    echo -e "${BLUE}🔌 MCP Server:${NC}"
    if pgrep -f "mcp-server" &>/dev/null; then
        echo -e "   ${GREEN}✅ Process running${NC}"
        local mcp_pids=$(pgrep -f "mcp-server" | tr '\n' ' ')
        echo -e "   PIDs: $mcp_pids"
    else
        echo -e "   ${YELLOW}⚠️  Process not detected (may be in Docker)${NC}"
    fi
    echo ""
    
    # Enhanced Scribe Console
    echo -e "${BLUE}📝 Enhanced Scribe Console:${NC}"
    if pgrep -f "enhanced-scribe-console" &>/dev/null; then
        echo -e "   ${GREEN}✅ Running${NC}"
    else
        echo -e "   ${YELLOW}⚠️  Not detected (check Terminal.app)${NC}"
    fi
    echo ""
    
    # Memory Files Status
    echo -e "${BLUE}🧠 Memory System:${NC}"
    local memory_files=(
        "./rMemory/auto-context.json"
        "./persistent-memory.json"
        "./rMemory/search-matrix"
    )
    
    for file in "${memory_files[@]}"; do
        if [ -f "$file" ] || [ -d "$file" ]; then
            local mod_time=$(stat -f "%Sm" -t "%Y-%m-%d %H:%M:%S" "$file" 2>/dev/null)
            echo -e "   ${GREEN}✅ $(basename "$file")${NC} (modified: $mod_time)"
        else
            echo -e "   ${YELLOW}⚠️  $(basename "$file") missing${NC}"
        fi
    done
    echo ""
    
    # System Resources
    echo -e "${BLUE}💻 System Resources:${NC}"
    local memory_usage=$(ps -o pid,ppid,%mem,command -ax | grep -E "(ollama|node|docker)" | grep -v grep | awk '{mem+=$3} END {print int(mem)}')
    echo -e "   Memory Usage (Ollama/Node/Docker): ${CYAN}${memory_usage:-0}%${NC}"
    
    local disk_usage=$(df -h . | tail -1 | awk '{print $5}' | sed 's/%//')
    echo -e "   Disk Usage: ${CYAN}${disk_usage}%${NC}"
    echo ""
    
    # Overall Health Status
    local health_score=0
    local max_score=5
    
    # Docker check
    if docker-compose ps --filter "status=running" 2>/dev/null | grep -q "rengine\|mcp-server"; then
        ((health_score++))
    fi
    
    # Ollama check
    if pgrep -f "ollama" &>/dev/null && curl -s http://localhost:11434/api/version &>/dev/null; then
        ((health_score++))
    fi
    
    # MCP Server check (either process or Docker)
    if pgrep -f "mcp-server" &>/dev/null || docker-compose ps --filter "status=running" 2>/dev/null | grep -q "mcp-server"; then
        ((health_score++))
    fi
    
    # Memory files check
    if [ -f "./persistent-memory.json" ]; then
        ((health_score++))
    fi
    
    # Protocol state check
    if [ -f "$PROTOCOL_STATE_FILE" ] && [ "$(jq -r '.status' "$PROTOCOL_STATE_FILE" 2>/dev/null)" == "ready" ]; then
        ((health_score++))
    fi
    
    echo -e "${BLUE}🏥 Overall Health Score: ${CYAN}$health_score/$max_score${NC}"
    
    if [ $health_score -eq $max_score ]; then
        echo -e "${GREEN}🎉 System Status: EXCELLENT${NC}"
        return 0
    elif [ $health_score -ge 3 ]; then
        echo -e "${YELLOW}⚠️  System Status: GOOD (minor issues)${NC}"
        return 1
    else
        echo -e "${RED}❌ System Status: POOR (major issues)${NC}"
        return 2
    fi
}

reset_protocol_state() {
    echo -e "${YELLOW}🔄 Resetting protocol state...${NC}"
    if [ -f "$PROTOCOL_STATE_FILE" ]; then
        rm "$PROTOCOL_STATE_FILE"
        echo -e "${GREEN}✅ Protocol state reset${NC}"
    else
        echo -e "${YELLOW}⚠️  No protocol state file to reset${NC}"
    fi
}

continuous_monitor() {
    echo -e "${CYAN}🔄 Starting continuous monitoring (Ctrl+C to stop)...${NC}"
    echo ""
    
    while true; do
        clear
        check_system_health
        echo ""
        echo -e "${BLUE}Next check in 10 seconds...${NC}"
        sleep 10
    done
}

# Main execution
case "$MONITOR_MODE" in
    "--continuous")
        continuous_monitor
        ;;
    "--reset")
        reset_protocol_state
        ;;
    "--once"|*)
        check_system_health
        exit $?
        ;;
esac
