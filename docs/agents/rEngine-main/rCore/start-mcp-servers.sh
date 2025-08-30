#!/bin/bash

# rEngine MCP Servers Startup Script
# This script ensures both MCP servers are running for VS Code Chat integration

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Paths
RENGINE_DIR="/Volumes/DATA/GitHub/rEngine/rEngine"
RENGINE_LOG="$RENGINE_DIR/rengine.log"
MEMORY_LOG="$RENGINE_DIR/memory-server.log"

echo -e "${BLUE}🚀 Starting rEngine MCP Servers...${NC}"

# Memory file sync check before starting MCP servers
echo -e "${YELLOW}🔄 Checking memory file synchronization...${NC}"
if [ -f "/Volumes/DATA/GitHub/rEngine/scripts/sync-memory-files.sh" ]; then
    bash /Volumes/DATA/GitHub/rEngine/scripts/sync-memory-files.sh
else
    echo -e "${YELLOW}⚠️  Memory sync script not found, continuing...${NC}"
fi

# Function to check if a process is running
is_running() {
    local pattern="$1"
    pgrep -f "$pattern" > /dev/null 2>&1
}

# Function to start rEngineMCP server
start_rengine() {
    echo -e "${YELLOW}🔧 Starting rEngineMCP Server...${NC}"
    cd "$RENGINE_DIR"
    nohup node index.js > "$RENGINE_LOG" 2>&1 &
    local pid=$!
    echo -e "${GREEN}✅ rEngineMCP started (PID: $pid)${NC}"
    echo -e "   Log: $RENGINE_LOG"
}

# Function to start memory MCP server
start_memory() {
    echo -e "${YELLOW}🧠 Starting Memory MCP Server...${NC}"
    cd "$RENGINE_DIR"
    nohup npx @modelcontextprotocol/server-memory > "$MEMORY_LOG" 2>&1 &
    local pid=$!
    echo -e "${GREEN}✅ Memory MCP started (PID: $pid)${NC}"
    echo -e "   Log: $MEMORY_LOG"
}

# Start Memory MCP FIRST (required by protocol)
if is_running "mcp-server-memory"; then
    echo -e "${GREEN}✅ Memory MCP Server already running${NC}"
else
    start_memory
fi

# Then start rEngineMCP
if is_running "node.*index.js"; then
    echo -e "${GREEN}✅ rEngineMCP Server already running${NC}"
else
    start_rengine
fi

# Wait a moment for servers to initialize
sleep 3

# Verify both servers are running
echo -e "\n${BLUE}📊 Server Status:${NC}"
if is_running "node.*index.js"; then
    echo -e "${GREEN}✅ rEngineMCP: Running${NC}"
else
    echo -e "${RED}❌ rEngineMCP: Not running${NC}"
fi

if is_running "mcp-server-memory"; then
    echo -e "${GREEN}✅ Memory MCP: Running${NC}"
else
    echo -e "${RED}❌ Memory MCP: Not running${NC}"
fi

echo -e "\n${BLUE}📝 To view logs:${NC}"
echo -e "   rEngineMCP: tail -f $RENGINE_LOG"
echo -e "   Memory MCP: tail -f $MEMORY_LOG"

echo -e "\n${GREEN}🎉 MCP Servers startup complete!${NC}"
