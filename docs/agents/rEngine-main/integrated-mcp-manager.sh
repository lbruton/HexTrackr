#!/bin/bash
# Integrated MCP Memory Server Manager
# Replaces VS Code dependency with local project control

cd "$(dirname "$0")"

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Configuration
PROJECT_ROOT="/Volumes/DATA/GitHub/rEngine"
MCP_MEMORY_PORT="8001"
MCP_CONTEXT7_PORT="8002"
MEMORY_DATA_DIR="$PROJECT_ROOT/rMemory/mcp-data"
LOG_DIR="$PROJECT_ROOT/logs/mcp"

# Ensure directories exist
mkdir -p "$MEMORY_DATA_DIR" "$LOG_DIR"

# Start integrated MCP memory server
start_memory_server() {
    echo -e "${BLUE}🧠 Starting Integrated MCP Memory Server...${NC}"
    
    # Kill any existing instances
    pkill -f "server-memory" || true
    pkill -f "context7-mcp" || true
    
    # Start MCP Memory Server with local control
    nohup npx @modelcontextprotocol/server-memory \
        --data-dir="$MEMORY_DATA_DIR" \
        --port="$MCP_MEMORY_PORT" \
        > "$LOG_DIR/memory-server.log" 2>&1 &
    
    MCP_MEMORY_PID=$!
    echo $MCP_MEMORY_PID > "$LOG_DIR/memory-server.pid"
    
    # Start Context7 Documentation Server
    nohup npx @upstash/context7-mcp@latest \
        --port="$MCP_CONTEXT7_PORT" \
        > "$LOG_DIR/context7-server.log" 2>&1 &
    
    MCP_CONTEXT7_PID=$!
    echo $MCP_CONTEXT7_PID > "$LOG_DIR/context7-server.pid"
    
    # Wait for servers to start
    sleep 3
    
    if ps -p $MCP_MEMORY_PID > /dev/null; then
        echo -e "${GREEN}✅ MCP Memory Server started (PID: $MCP_MEMORY_PID, Port: $MCP_MEMORY_PORT)${NC}"
    else
        echo -e "${RED}❌ MCP Memory Server failed to start${NC}"
        return 1
    fi
    
    if ps -p $MCP_CONTEXT7_PID > /dev/null; then
        echo -e "${GREEN}✅ Context7 Server started (PID: $MCP_CONTEXT7_PID, Port: $MCP_CONTEXT7_PORT)${NC}"
    else
        echo -e "${RED}❌ Context7 Server failed to start${NC}"
        return 1
    fi
    
    # Update VS Code settings to use local servers
    update_vscode_settings
    
    return 0
}

# Update VS Code settings for local MCP servers
update_vscode_settings() {
    echo -e "${BLUE}🔧 Updating VS Code settings for local MCP servers...${NC}"
    
    cat > "$PROJECT_ROOT/.vscode/settings.json" << 'EOF'
{
  "mcp.servers": {
    "memory-local": {
      "command": "node",
      "args": ["./node_modules/@modelcontextprotocol/server-memory/dist/index.js"],
      "env": {
        "MCP_MEMORY_DATA_DIR": "./rMemory/mcp-data"
      },
      "disabled": false
    },
    "context7-local": {
      "command": "npx",
      "args": ["@upstash/context7-mcp@latest"],
      "disabled": false
    }
  },
  "mcp.logging.level": "info",
  "files.associations": {
    "*.json": "jsonc"
  }
}
EOF
    
    echo -e "${GREEN}✅ VS Code settings updated for local MCP servers${NC}"
}

# Stop MCP servers
stop_servers() {
    echo -e "${YELLOW}🛑 Stopping MCP servers...${NC}"
    
    if [ -f "$LOG_DIR/memory-server.pid" ]; then
        kill $(cat "$LOG_DIR/memory-server.pid") 2>/dev/null || true
        rm -f "$LOG_DIR/memory-server.pid"
    fi
    
    if [ -f "$LOG_DIR/context7-server.pid" ]; then
        kill $(cat "$LOG_DIR/context7-server.pid") 2>/dev/null || true
        rm -f "$LOG_DIR/context7-server.pid"
    fi
    
    # Fallback cleanup
    pkill -f "server-memory" || true
    pkill -f "context7-mcp" || true
    
    echo -e "${GREEN}✅ MCP servers stopped${NC}"
}

# Check server status
check_status() {
    echo -e "${BLUE}📊 MCP Server Status:${NC}"
    
    if [ -f "$LOG_DIR/memory-server.pid" ] && ps -p $(cat "$LOG_DIR/memory-server.pid") > /dev/null; then
        echo -e "   ${GREEN}✅ Memory Server: Running (PID: $(cat "$LOG_DIR/memory-server.pid"))${NC}"
    else
        echo -e "   ${RED}❌ Memory Server: Not running${NC}"
    fi
    
    if [ -f "$LOG_DIR/context7-server.pid" ] && ps -p $(cat "$LOG_DIR/context7-server.pid") > /dev/null; then
        echo -e "   ${GREEN}✅ Context7 Server: Running (PID: $(cat "$LOG_DIR/context7-server.pid"))${NC}"
    else
        echo -e "   ${RED}❌ Context7 Server: Not running${NC}"
    fi
    
    echo ""
    echo -e "${BLUE}📁 Data Directory: ${NC}$MEMORY_DATA_DIR"
    echo -e "${BLUE}📝 Logs Directory: ${NC}$LOG_DIR"
}

# Show server logs
show_logs() {
    echo -e "${BLUE}📜 Recent MCP Server Logs:${NC}"
    echo -e "${YELLOW}Memory Server:${NC}"
    if [ -f "$LOG_DIR/memory-server.log" ]; then
        tail -10 "$LOG_DIR/memory-server.log"
    else
        echo "No memory server logs found"
    fi
    
    echo ""
    echo -e "${YELLOW}Context7 Server:${NC}"
    if [ -f "$LOG_DIR/context7-server.log" ]; then
        tail -10 "$LOG_DIR/context7-server.log"
    else
        echo "No context7 server logs found"
    fi
}

# Main command handling
case "$1" in
    start)
        start_memory_server
        ;;
    stop)
        stop_servers
        ;;
    restart)
        stop_servers
        sleep 2
        start_memory_server
        ;;
    status)
        check_status
        ;;
    logs)
        show_logs
        ;;
    *)
        echo "Usage: $0 {start|stop|restart|status|logs}"
        echo ""
        echo "Integrated MCP Memory Server Manager"
        echo "  start   - Start local MCP servers"
        echo "  stop    - Stop all MCP servers"
        echo "  restart - Restart MCP servers"
        echo "  status  - Show server status"
        echo "  logs    - Show recent logs"
        exit 1
        ;;
esac
