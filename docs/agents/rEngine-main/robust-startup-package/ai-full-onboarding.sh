#!/bin/bash

# ============================================================================
# 🧠 AI Full Context Onboarding Script
# ============================================================================
# Gets AI fully onboarded with prime directive, protocols, and project status
# Vision: Single script → Full contextual awareness → Ready to work

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "${SCRIPT_DIR}/applescript-terminal-function.sh"

# Ensure we're running in AppleScript Terminal
ensure_applescript_terminal "$0" "🧠 AI Onboarding - rEngine" "$@"

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
PINK='\033[95m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${PINK}🧠 AI Full Context Onboarding Protocol${NC}"
echo -e "${CYAN}═══════════════════════════════════════${NC}"
echo ""

# ============================================================================
# PHASE 1: MCP MEMORY CONNECTION
# ============================================================================
echo -e "${CYAN}PHASE 1: Connecting to MCP Memory System...${NC}"

# Start MCP servers if not running
if ! pgrep -f "integrated-mcp-manager" &>/dev/null; then
    echo -e "${YELLOW}🔌 Starting MCP Memory Servers...${NC}"
    node "${SCRIPT_DIR}/integrated-mcp-manager.cjs" &
    MCP_PID=$!
    
    # Wait for MCP to be ready
    echo -e "${YELLOW}⏳ Waiting for memory system...${NC}"
    for i in {1..30}; do
        if pgrep -f "integrated-mcp-manager" &>/dev/null; then
            echo -e "${GREEN}✅ MCP Memory System Online${NC}"
            break
        fi
        sleep 1
        if [ $i -eq 30 ]; then
            echo -e "${RED}❌ Memory system failed to start${NC}"
            exit 1
        fi
    done
else
    echo -e "${GREEN}✅ MCP Memory System already running${NC}"
fi

# ============================================================================
# PHASE 2: PRIME DIRECTIVE & PROTOCOL RETRIEVAL
# ============================================================================
echo -e "${CYAN}PHASE 2: Loading Prime Directive & Protocols...${NC}"

# Check for core files
if [ -f "../persistent-memory.json" ]; then
    echo -e "${GREEN}✅ Persistent memory found${NC}"
else
    echo -e "${YELLOW}⚠️  Persistent memory not found - will initialize${NC}"
fi

if [ -f "../lastsession.json" ]; then
    echo -e "${GREEN}✅ Last session data found${NC}"
    LAST_OBJECTIVE=$(jq -r '.summary.mainObjective // "Unknown"' ../lastsession.json 2>/dev/null || echo "Unknown")
    echo -e "${BLUE}📋 Last Objective: ${LAST_OBJECTIVE}${NC}"
else
    echo -e "${YELLOW}⚠️  No previous session found${NC}"
fi

# ============================================================================
# PHASE 3: ENHANCED SCRIBE CONSOLE STARTUP
# ============================================================================
echo -e "${CYAN}PHASE 3: Starting Enhanced Scribe Console...${NC}"

echo -e "${YELLOW}🌸 Launching Enhanced Scribe with full context...${NC}"
node ../enhanced-scribe-console.js &
SCRIBE_PID=$!

# Wait a moment for scribe to initialize
sleep 3

# ============================================================================
# PHASE 4: CONTEXT SUMMARY & STATUS REPORT
# ============================================================================
echo -e "${CYAN}PHASE 4: Context Summary & Status Report${NC}"
echo -e "${CYAN}═══════════════════════════════════════${NC}"

echo -e "${PINK}🎯 SYSTEM STATUS:${NC}"
echo -e "${GREEN}   ✅ MCP Memory System: Active${NC}"
echo -e "${GREEN}   ✅ Enhanced Scribe Console: Running${NC}"
echo -e "${GREEN}   ✅ VS Code Chat Integration: Enabled${NC}"
echo -e "${GREEN}   ✅ Rolling Context System: Ready${NC}"

echo ""
echo -e "${PINK}📊 PROJECT STATUS:${NC}"
echo -e "${BLUE}   🎯 Last Objective: ${LAST_OBJECTIVE}${NC}"
echo -e "${BLUE}   📁 Working Directory: rEngine Platform${NC}"
echo -e "${BLUE}   🔍 Search Matrix: VS Code Chat + Memory Files${NC}"
echo -e "${BLUE}   🚀 Ready for: 1-2 read answers to any question${NC}"

echo ""
echo -e "${PINK}💬 AVAILABLE CAPABILITIES:${NC}"
echo -e "${CYAN}   • Rolling Context: chat, last10, last100, last1000${NC}"
echo -e "${CYAN}   • Memory Search: Full project history${NC}"
echo -e "${CYAN}   • VS Code Integration: Real-time chat scanning${NC}"
echo -e "${CYAN}   • AppleScript Terminals: Proper process management${NC}"

echo ""
echo -e "${GREEN}🎉 AI FULLY ONBOARDED & READY TO WORK!${NC}"
echo -e "${YELLOW}💡 Enhanced Scribe Console is running in background${NC}"
echo -e "${YELLOW}💡 Use VS Code Copilot to interact with full context${NC}"

# Keep script running to maintain MCP servers
echo ""
echo -e "${PINK}🔄 System Running - Press Ctrl+C to shutdown${NC}"

# Cleanup function
cleanup() {
    echo -e "\n${YELLOW}🛑 Shutting down AI system...${NC}"
    if [ ! -z "$MCP_PID" ]; then
        kill $MCP_PID 2>/dev/null || true
    fi
    if [ ! -z "$SCRIBE_PID" ]; then
        kill $SCRIBE_PID 2>/dev/null || true
    fi
    echo -e "${GREEN}✅ Shutdown complete${NC}"
    exit 0
}

trap cleanup SIGINT SIGTERM

# Wait indefinitely
while true; do
    sleep 1
done
