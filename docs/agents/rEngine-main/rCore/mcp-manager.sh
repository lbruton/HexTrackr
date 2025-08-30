#!/bin/bash

# StackTrackr MCP Server Management Script
# Manages MCP servers: start, stop, restart, status, install auto-startup

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

SCRIPT_DIR="/Volumes/DATA/GitHub/rEngine/rEngineMCP"
STARTUP_SCRIPT="$SCRIPT_DIR/start-mcp-servers.sh"
HEALTH_SCRIPT="$SCRIPT_DIR/health-monitor.sh"
PLIST_FILE="$SCRIPT_DIR/com.stacktrackr.mcp-servers.plist"
PLIST_DEST="$HOME/Library/LaunchAgents/com.stacktrackr.mcp-servers.plist"

show_usage() {
    echo -e "${BLUE}StackTrackr MCP Server Management${NC}"
    echo ""
    echo "Usage: $0 [command]"
    echo ""
    echo "Commands:"
    echo "  start      - Start both MCP servers"
    echo "  stop       - Stop both MCP servers"
    echo "  restart    - Restart both MCP servers"
    echo "  status     - Show server status"
    echo "  install    - Install auto-startup service"
    echo "  uninstall  - Remove auto-startup service"
    echo "  logs       - Show recent logs"
    echo "  monitor    - Start health monitoring daemon"
    echo ""
}

is_running() {
    local pattern="$1"
    pgrep -f "$pattern" > /dev/null 2>&1
}

show_status() {
    echo -e "${BLUE}📊 MCP Server Status:${NC}"
    
    if is_running "node.*index.js"; then
        local pid=$(pgrep -f "node.*index.js" | head -1)
        echo -e "${GREEN}✅ rEngineMCP: Running (PID: $pid)${NC}"
    else
        echo -e "${RED}❌ rEngineMCP: Not running${NC}"
    fi
    
    if is_running "mcp-server-memory"; then
        local pid=$(pgrep -f "mcp-server-memory" | head -1)
        echo -e "${GREEN}✅ Memory MCP: Running (PID: $pid)${NC}"
    else
        echo -e "${RED}❌ Memory MCP: Not running${NC}"
    fi
    
    # Check if auto-startup is installed
    if [ -f "$PLIST_DEST" ]; then
        echo -e "${GREEN}✅ Auto-startup: Installed${NC}"
    else
        echo -e "${YELLOW}⚠️  Auto-startup: Not installed${NC}"
    fi
}

start_servers() {
    echo -e "${BLUE}🚀 Starting MCP Servers...${NC}"
    "$STARTUP_SCRIPT"
}

stop_servers() {
    echo -e "${YELLOW}🛑 Stopping MCP Servers...${NC}"
    
    # Stop rEngineMCP
    if is_running "node.*index.js"; then
        pkill -f "node.*index.js"
        echo -e "${GREEN}✅ rEngineMCP stopped${NC}"
    fi
    
    # Stop Memory MCP
    if is_running "mcp-server-memory"; then
        pkill -f "mcp-server-memory"
        echo -e "${GREEN}✅ Memory MCP stopped${NC}"
    fi
}

install_autostart() {
    echo -e "${BLUE}📦 Installing auto-startup service...${NC}"
    
    # Copy plist file
    cp "$PLIST_FILE" "$PLIST_DEST"
    
    # Load the service
    launchctl load "$PLIST_DEST"
    
    echo -e "${GREEN}✅ Auto-startup service installed${NC}"
    echo -e "   Service will start MCP servers on login and keep them running"
}

uninstall_autostart() {
    echo -e "${YELLOW}🗑️  Removing auto-startup service...${NC}"
    
    if [ -f "$PLIST_DEST" ]; then
        launchctl unload "$PLIST_DEST"
        rm "$PLIST_DEST"
        echo -e "${GREEN}✅ Auto-startup service removed${NC}"
    else
        echo -e "${YELLOW}⚠️  Auto-startup service not installed${NC}"
    fi
}

show_logs() {
    echo -e "${BLUE}📝 Recent Logs:${NC}"
    echo ""
    
    if [ -f "$SCRIPT_DIR/rengine.log" ]; then
        echo -e "${YELLOW}=== rEngineMCP Log (last 10 lines) ===${NC}"
        tail -10 "$SCRIPT_DIR/rengine.log"
        echo ""
    fi
    
    if [ -f "$SCRIPT_DIR/memory-server.log" ]; then
        echo -e "${YELLOW}=== Memory MCP Log (last 10 lines) ===${NC}"
        tail -10 "$SCRIPT_DIR/memory-server.log"
        echo ""
    fi
    
    if [ -f "$SCRIPT_DIR/health-monitor.log" ]; then
        echo -e "${YELLOW}=== Health Monitor Log (last 5 lines) ===${NC}"
        tail -5 "$SCRIPT_DIR/health-monitor.log"
    fi
}

start_monitor() {
    echo -e "${BLUE}🏥 Starting health monitoring daemon...${NC}"
    nohup "$HEALTH_SCRIPT" --daemon > /dev/null 2>&1 &
    echo -e "${GREEN}✅ Health monitor started (checks every 5 minutes)${NC}"
}

# Main command handling
case "$1" in
    start)
        start_servers
        ;;
    stop)
        stop_servers
        ;;
    restart)
        stop_servers
        sleep 2
        start_servers
        ;;
    status)
        show_status
        ;;
    install)
        install_autostart
        ;;
    uninstall)
        uninstall_autostart
        ;;
    logs)
        show_logs
        ;;
    monitor)
        start_monitor
        ;;
    *)
        show_usage
        exit 1
        ;;
esac
