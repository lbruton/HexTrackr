#!/bin/bash
# All-in-One MCP Server Manager
# Replaces VS Code MCP extensions with integrated solution

cd "$(dirname "$0")"

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

MCP_LOG_DIR="./logs/mcp"
mkdir -p "$MCP_LOG_DIR"

case "$1" in
    "start")
        echo -e "${CYAN}🚀 Starting All-in-One MCP Server Stack...${NC}"
        
        # Stop any existing MCP processes
        pkill -f "mcp-server-memory" 2>/dev/null || true
        pkill -f "context7-mcp" 2>/dev/null || true
        sleep 2
        
        echo -e "${BLUE}📁 Starting Memory MCP Server...${NC}"
        npx @modelcontextprotocol/server-memory > "$MCP_LOG_DIR/memory-server.log" 2>&1 &
        MEMORY_PID=$!
        
        echo -e "${BLUE}📚 Starting Context7 Documentation Server...${NC}"
        npx @upstash/context7-mcp@latest > "$MCP_LOG_DIR/context7-server.log" 2>&1 &
        CONTEXT7_PID=$!
        
        # Save PIDs for management
        echo "$MEMORY_PID" > "$MCP_LOG_DIR/memory.pid"
        echo "$CONTEXT7_PID" > "$MCP_LOG_DIR/context7.pid"
        
        sleep 3
        
        # Verify servers started
        if kill -0 "$MEMORY_PID" 2>/dev/null && kill -0 "$CONTEXT7_PID" 2>/dev/null; then
            echo -e "${GREEN}✅ All MCP servers started successfully${NC}"
            echo -e "${CYAN}   Memory Server PID: $MEMORY_PID${NC}"
            echo -e "${CYAN}   Context7 Server PID: $CONTEXT7_PID${NC}"
            
            # Create status file for VS Code integration
            cat > .vscode/mcp-status.json << EOF
{
  "status": "running",
  "servers": {
    "memory": {
      "pid": $MEMORY_PID,
      "command": "npx @modelcontextprotocol/server-memory",
      "log": "$MCP_LOG_DIR/memory-server.log"
    },
    "context7": {
      "pid": $CONTEXT7_PID,
      "command": "npx @upstash/context7-mcp@latest", 
      "log": "$MCP_LOG_DIR/context7-server.log"
    }
  },
  "started": "$(date -Iseconds)"
}
EOF
            
        else
            echo -e "${RED}❌ Failed to start MCP servers${NC}"
            exit 1
        fi
        ;;
        
    "stop")
        echo -e "${YELLOW}🛑 Stopping All MCP Servers...${NC}"
        
        # Kill by PID if available
        if [ -f "$MCP_LOG_DIR/memory.pid" ]; then
            kill $(cat "$MCP_LOG_DIR/memory.pid") 2>/dev/null || true
            rm -f "$MCP_LOG_DIR/memory.pid"
        fi
        
        if [ -f "$MCP_LOG_DIR/context7.pid" ]; then
            kill $(cat "$MCP_LOG_DIR/context7.pid") 2>/dev/null || true
            rm -f "$MCP_LOG_DIR/context7.pid"
        fi
        
        # Fallback: kill by process name
        pkill -f "mcp-server-memory" 2>/dev/null || true
        pkill -f "context7-mcp" 2>/dev/null || true
        
        # Remove status file
        rm -f .vscode/mcp-status.json
        
        echo -e "${GREEN}✅ All MCP servers stopped${NC}"
        ;;
        
    "status")
        echo -e "${CYAN}📊 MCP Server Status:${NC}"
        
        if [ -f ".vscode/mcp-status.json" ]; then
            echo -e "${GREEN}✅ MCP Status File Found${NC}"
            
            if [ -f "$MCP_LOG_DIR/memory.pid" ] && kill -0 $(cat "$MCP_LOG_DIR/memory.pid") 2>/dev/null; then
                echo -e "${GREEN}✅ Memory Server: Running (PID: $(cat "$MCP_LOG_DIR/memory.pid"))${NC}"
            else
                echo -e "${RED}❌ Memory Server: Not Running${NC}"
            fi
            
            if [ -f "$MCP_LOG_DIR/context7.pid" ] && kill -0 $(cat "$MCP_LOG_DIR/context7.pid") 2>/dev/null; then
                echo -e "${GREEN}✅ Context7 Server: Running (PID: $(cat "$MCP_LOG_DIR/context7.pid"))${NC}"
            else
                echo -e "${RED}❌ Context7 Server: Not Running${NC}"
            fi
        else
            echo -e "${YELLOW}⚠️  No MCP servers running${NC}"
        fi
        ;;
        
    "logs")
        echo -e "${CYAN}📋 MCP Server Logs:${NC}"
        
        if [ -f "$MCP_LOG_DIR/memory-server.log" ]; then
            echo -e "${BLUE}--- Memory Server Log (last 10 lines) ---${NC}"
            tail -10 "$MCP_LOG_DIR/memory-server.log"
        fi
        
        if [ -f "$MCP_LOG_DIR/context7-server.log" ]; then
            echo -e "${BLUE}--- Context7 Server Log (last 10 lines) ---${NC}"
            tail -10 "$MCP_LOG_DIR/context7-server.log"
        fi
        ;;
        
    "restart")
        echo -e "${CYAN}🔄 Restarting All MCP Servers...${NC}"
        "$0" stop
        sleep 2
        "$0" start
        ;;
        
    *)
        echo -e "${CYAN}All-in-One MCP Server Manager${NC}"
        echo -e "Usage: $0 {start|stop|status|logs|restart}"
        echo ""
        echo -e "${YELLOW}Commands:${NC}"
        echo -e "  start    - Start all MCP servers"
        echo -e "  stop     - Stop all MCP servers" 
        echo -e "  status   - Show server status"
        echo -e "  logs     - Show recent logs"
        echo -e "  restart  - Restart all servers"
        echo ""
        echo -e "${BLUE}Replaces VS Code MCP extensions with integrated solution${NC}"
        ;;
esac
