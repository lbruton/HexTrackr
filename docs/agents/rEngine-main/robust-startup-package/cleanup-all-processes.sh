#!/bin/bash

# ============================================================================
# 🧹 rEngine Process Cleanup Script
# ============================================================================
# Standalone cleanup script for all rEngine processes
# Can be run independently or called by startup scripts

set -e

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
PINK='\033[95m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${PINK}🧹 rEngine Process Cleanup${NC}"
echo -e "${CYAN}========================${NC}"

# Function to kill process with verification
kill_process_group() {
    local pattern="$1"
    local service_name="$2"
    
    echo -e "${YELLOW}🔍 Checking for $service_name processes...${NC}"
    local pids=$(pgrep -f "$pattern" 2>/dev/null || true)
    
    if [ -n "$pids" ]; then
        echo -e "${YELLOW}⚠️  Found $service_name processes: $pids${NC}"
        echo -e "${YELLOW}🔨 Terminating $service_name processes...${NC}"
        
        # Graceful termination first
        echo "$pids" | xargs kill -TERM 2>/dev/null || true
        sleep 3
        
        # Force kill if still running
        local remaining=$(pgrep -f "$pattern" 2>/dev/null || true)
        if [ -n "$remaining" ]; then
            echo -e "${YELLOW}🔨 Force killing remaining $service_name processes: $remaining${NC}"
            echo "$remaining" | xargs kill -KILL 2>/dev/null || true
            sleep 1
        fi
        
        # Final verification
        local final_check=$(pgrep -f "$pattern" 2>/dev/null || true)
        if [ -n "$final_check" ]; then
            echo -e "${RED}❌ Failed to kill all $service_name processes${NC}"
            return 1
        else
            echo -e "${GREEN}✅ Successfully terminated $service_name${NC}"
        fi
    else
        echo -e "${GREEN}✅ No $service_name processes found${NC}"
    fi
}

# Function to verify Ollama instead of killing it
verify_ollama() {
    echo -e "${YELLOW}🔍 Verifying Ollama availability...${NC}"
    
    if pgrep -f "ollama" > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Ollama is running (desktop mode)${NC}"
        
        # Check for any available models (generic check)
        local models=$(ollama list 2>/dev/null | tail -n +2 | awk '{print $1}' | head -3)
        if [ -n "$models" ]; then
            echo -e "${GREEN}✅ Available models:${NC}"
            echo "$models" | while read model; do
                echo -e "${GREEN}   • $model${NC}"
            done
        else
            echo -e "${YELLOW}⚠️  No models found, but Ollama is running${NC}"
        fi
    else
        echo -e "${YELLOW}⚠️  Ollama not running - please start Ollama desktop app${NC}"
    fi
}

# Cleanup sequence with verification
echo -e "${CYAN}Starting process cleanup...${NC}"

kill_process_group "enhanced-scribe-console" "Enhanced Scribe Console"
kill_process_group "mcp-server|start-mcp" "MCP Server"
kill_process_group "smart-scribe|scribe-console|scribe-summary" "Smart Scribe"
verify_ollama  # Verify instead of kill
kill_process_group "context7-mcp" "Context7 MCP"

# Docker cleanup with verification
echo -e "${YELLOW}🧹 Docker container cleanup...${NC}"
if docker ps -q --filter "name=rengine|mcp-server|stacktrackr" | grep -q .; then
    echo -e "${YELLOW}⚠️  Stopping rEngine Docker containers...${NC}"
    docker ps -q --filter "name=rengine|mcp-server|stacktrackr" | xargs -r docker stop
    sleep 2
    
    # Verify cleanup
    if docker ps -q --filter "name=rengine|mcp-server|stacktrackr" | grep -q .; then
        echo -e "${YELLOW}🔨 Force killing remaining containers...${NC}"
        docker ps -q --filter "name=rengine|mcp-server|stacktrackr" | xargs -r docker kill
    fi
    echo -e "${GREEN}✅ Docker containers cleaned up${NC}"
else
    echo -e "${GREEN}✅ No rEngine Docker containers running${NC}"
fi

# Network cleanup - remove any orphaned networks
echo -e "${YELLOW}🌐 Cleaning up Docker networks...${NC}"
docker network prune -f 2>/dev/null || true

# Remove any lock files
echo -e "${YELLOW}🔒 Removing lock files...${NC}"
rm -f /Volumes/DATA/GitHub/rEngine/memory-sync.lock 2>/dev/null || true
rm -f /Volumes/DATA/GitHub/rEngine/*.lock 2>/dev/null || true

echo -e "${GREEN}✅ Cleanup complete - all rEngine processes terminated${NC}"
echo -e "${CYAN}🚀 Ready for fresh startup${NC}"
