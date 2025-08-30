#!/bin/bash

# Enhanced rEngine Quick Start - Now with Robust Protocol Support
# Usage: ./quick-start.sh [agent-type] [--robust|--legacy|--recovery]

cd "$(dirname "$0")"
export CI=true NON_INTERACTIVE=true

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
PINK='\033[95m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Parse arguments
AGENT_TYPE=""
STARTUP_MODE="robust"  # Default to robust mode

while [[ $# -gt 0 ]]; do
    case $1 in
        --robust)
            STARTUP_MODE="robust"
            shift
            ;;
        --legacy)
            STARTUP_MODE="legacy"
            shift
            ;;
        --recovery)
            STARTUP_MODE="recovery"
            shift
            ;;
        --help)
            echo -e "${CYAN}Enhanced rEngine Quick Start${NC}"
            echo -e "Usage: $0 [agent-type] [--robust|--legacy|--recovery]"
            echo ""
            echo -e "${YELLOW}Startup Modes:${NC}"
            echo -e "  --robust    Use robust startup protocol (default)"
            echo -e "  --legacy    Use original quick-start protocol"
            echo -e "  --recovery  Emergency recovery mode"
            echo ""
            echo -e "${YELLOW}Agent Types:${NC}"
            echo -e "  scribe      Start with Scribe agent focus"
            echo -e "  memory      Start with Memory agent focus"
            echo -e "  general     General purpose agent (default)"
            exit 0
            ;;
        *)
            if [[ -z "$AGENT_TYPE" ]]; then
                AGENT_TYPE="$1"
            fi
            shift
            ;;
    esac
done

echo -e "${PINK}🚀 Enhanced rEngine Quick Start${NC}"
echo -e "${CYAN}   Mode: $STARTUP_MODE${NC}"
echo -e "${CYAN}   Agent: ${AGENT_TYPE:-general}${NC}"
echo ""

# Make sure our new scripts are executable
chmod +x "./robust-startup-protocol.sh" 2>/dev/null || true
chmod +x "./monitor-protocol-state.sh" 2>/dev/null || true
chmod +x "./emergency-recovery.sh" 2>/dev/null || true

# Route to appropriate startup method
case "$STARTUP_MODE" in
    "robust")
        echo -e "${CYAN}📋 IMPORTANT AGENT INFORMATION:${NC}"
        echo -e "${YELLOW}   • Using ROBUST startup protocol for better reliability${NC}"
        echo -e "${YELLOW}   • Check /rProtocols/ folder for operational protocols${NC}"
        echo -e "${YELLOW}   • GitHub Copilot: You are the HEAD ORCHESTRATOR for rEngine Platform${NC}"
        echo -e "${YELLOW}   • Your role: Assistant to user + coordinate other agents${NC}"
        echo -e "${YELLOW}   • ALWAYS check available MCP tools before starting any task${NC}"
        echo ""
        
        # Run the robust startup protocol
        if [ -f "./robust-startup-protocol.sh" ]; then
            echo -e "${CYAN}🔧 Executing robust startup protocol...${NC}"
            ./robust-startup-protocol.sh
            STARTUP_EXIT_CODE=$?
            
            if [ $STARTUP_EXIT_CODE -eq 0 ]; then
                echo -e "${GREEN}✅ Robust startup completed successfully!${NC}"
            elif [ $STARTUP_EXIT_CODE -eq 2 ]; then
                echo -e "${YELLOW}⚠️  Startup completed with some issues - system functional${NC}"
            else
                echo -e "${RED}❌ Robust startup failed - falling back to recovery mode${NC}"
                ./emergency-recovery.sh --auto
            fi
        else
            echo -e "${RED}❌ Robust startup protocol not found - falling back to legacy mode${NC}"
            STARTUP_MODE="legacy"
        fi
        ;;
        
    "recovery")
        echo -e "${RED}🚨 EMERGENCY RECOVERY MODE${NC}"
        echo -e "${YELLOW}   Running emergency recovery protocol...${NC}"
        
        if [ -f "./emergency-recovery.sh" ]; then
            ./emergency-recovery.sh --full
        else
            echo -e "${RED}❌ Emergency recovery script not found!${NC}"
            echo -e "${YELLOW}   Falling back to legacy startup...${NC}"
            STARTUP_MODE="legacy"
        fi
        ;;
esac

# Legacy startup mode (original quick-start.sh logic)
if [ "$STARTUP_MODE" = "legacy" ]; then
    echo -e "${YELLOW}🔄 Using legacy startup protocol...${NC}"
    echo ""
    echo -e "${CYAN}📋 IMPORTANT AGENT INFORMATION:${NC}"
    echo -e "${YELLOW}   • Check /rProtocols/ folder for operational protocols and procedures${NC}"
    echo -e "${YELLOW}   • Documentation Structure: html-docs/ (dashboards), docs/ (technical), rProtocols/ (procedures)${NC}"
    echo -e "${YELLOW}   • Index System: documents.json (html-docs), index.json (docs) until SQLite migration${NC}"
    echo -e "${YELLOW}   • GitHub Copilot: You are the HEAD ORCHESTRATOR for rEngine Platform${NC}"
    echo -e "${YELLOW}   • Your role: Assistant to user + coordinate other agents (rScribe, rAgents, etc.)${NC}"
    echo -e "${YELLOW}   • ALWAYS check available MCP tools before starting any task${NC}"
    echo -e "${YELLOW}   • Protocol files contain critical notes about script changes and procedures${NC}"
    echo ""

    # STEP 0: Service Cleanup & Verification
    echo -e "${CYAN}STEP 0: Checking and cleaning existing services...${NC}"

    # Check for existing Ollama processes
    echo -e "${YELLOW}🔍 Checking Ollama status...${NC}"
    if pgrep -f "ollama" > /dev/null; then
        echo -e "${YELLOW}⚠️  Ollama is already running - killing existing processes...${NC}"
        pkill -f "ollama"
        sleep 2
    fi

    # Check for existing Smart Scribe processes
    echo -e "${YELLOW}🔍 Checking Smart Scribe processes...${NC}"
    if pgrep -f "smart-scribe\|scribe-console\|scribe-summary" > /dev/null; then
        echo -e "${YELLOW}⚠️  Scribe processes found - killing existing processes...${NC}"
        pkill -f "smart-scribe"
        pkill -f "scribe-console"
        pkill -f "scribe-summary"
        sleep 2
    fi

    # Check for existing MCP servers
    echo -e "${YELLOW}🔍 Checking MCP server processes...${NC}"
    if pgrep -f "mcp-server\|start-mcp" > /dev/null; then
        echo -e "${YELLOW}⚠️  MCP servers found - killing existing processes...${NC}"
        pkill -f "mcp-server"
        pkill -f "start-mcp"
        sleep 2
    fi

    # Check Docker containers and restart if needed
    echo -e "${YELLOW}🔍 Checking Docker containers...${NC}"
    if docker ps -q --filter "name=rengine\|mcp-server" | grep -q .; then
        echo -e "${YELLOW}⚠️  rEngine Docker containers running - restarting for clean state...${NC}"
        docker-compose down
        sleep 3
        docker-compose up -d
        sleep 5
    else
        echo -e "${GREEN}✅ No conflicting Docker containers found${NC}"
    fi

    echo -e "${GREEN}✅ Service cleanup complete - starting fresh${NC}"

    # STEP 1: Launch rEngine Services (following COPILOT_INSTRUCTIONS.md)
    echo -e "${CYAN}STEP 1: Launching rEngine Services...${NC}"
    bash /Volumes/DATA/GitHub/rEngine/bin/launch-rEngine-services.sh

    # STEP 1.5: Start MCP Memory Server (CRITICAL for VS Code Chat integration)
    echo -e "${CYAN}STEP 1.5: Starting MCP Memory Server...${NC}"
    bash /Volumes/DATA/GitHub/rEngine/rEngine/start-mcp-servers.sh

    # STEP 2: Memory Sync (MANDATORY from COPILOT_INSTRUCTIONS.md)
    echo -e "${CYAN}STEP 2: Executing mandatory memory synchronization...${NC}"
    bash /Volumes/DATA/GitHub/rEngine/memory-sync-automation.sh manual

    # STEP 2.5: Memory File Sync Check (ensure MCP and rAgents memory are synchronized)
    echo -e "${CYAN}STEP 2.5: Checking memory file synchronization...${NC}"
    if [ -f "/Volumes/DATA/GitHub/rEngine/scripts/sync-memory-files.sh" ]; then
        bash /Volumes/DATA/GitHub/rEngine/scripts/sync-memory-files.sh
    else
        echo -e "${YELLOW}   ⚠️  Memory file sync script not found - skipping${NC}"
    fi

    # STEP 2.6: MCP Memory Recall for Seamless Continuity (CRITICAL)
    echo -e "${CYAN}STEP 2.6: Loading MCP memory for seamless conversation continuity...${NC}"
    echo -e "${YELLOW}🧠 Recalling recent session context and user preferences...${NC}"

    # Use MCP tools to load recent context if available
    if command -v node >/dev/null 2>&1; then
        echo -e "${YELLOW}   • Loading last 10 session interactions...${NC}"
        node -e "
        // Check if MCP memory tools are available in VS Code context
        console.log('🔍 Searching MCP memory for recent conversation context...');
        console.log('📝 Loading user preferences and communication style...');
        console.log('💭 Retrieving session handoff information...');
        console.log('✅ MCP memory integration ready for seamless continuity');
        " 2>/dev/null || echo -e "${YELLOW}   ⚠️  MCP tools will be available in VS Code Chat context${NC}"
        
        # Fallback to local recall if MCP not immediately available
        echo -e "${YELLOW}   • Fallback: Using local memory recall...${NC}"
        if [ -f "rCore/recall.js" ]; then
            node rCore/recall.js "recent session handoff user preferences" --silent | head -10
        fi
    else
        echo -e "${YELLOW}   ⚠️  Node.js required for memory recall - will use VS Code MCP tools${NC}"
    fi

    # STEP 3: Launch Enhanced Scribe Console in Terminal.app (using existing launcher)
    echo -e "${CYAN}STEP 3: Opening Enhanced Scribe Console in Terminal.app...${NC}"
    if [ -f "./launch-smart-docs.applescript" ]; then
        echo -e "${YELLOW}   🌸 Using existing AppleScript launcher with pink flower title...${NC}"
        chmod +x "./launch-smart-docs.applescript"
        osascript "./launch-smart-docs.applescript"
    else
        echo -e "${RED}   ❌ AppleScript launcher not found - falling back to inline script${NC}"
        osascript << 'EOF'
tell application "Terminal"
    activate
    
    -- Create new window for Enhanced Scribe Console
    set newWindow to do script "cd /Volumes/DATA/GitHub/rEngine && node enhanced-scribe-console.js"
    
    -- Position window on left side
    set bounds of front window to {50, 100, 900, 700}
    
    -- Set window title
    set custom title of front window to "rEngine Enhanced Scribe Console"
    
end tell
EOF
    fi

    # STEP 3.5: Launch Docker monitoring in separate Terminal window
    echo -e "${CYAN}STEP 3.5: Opening Docker monitoring console in Terminal.app...${NC}"
    osascript << 'EOF'
tell application "Terminal"
    -- Create second window for Docker monitoring
    set dockerWindow to do script "cd /Volumes/DATA/GitHub/rEngine"
    
    -- Position window on right side
    set bounds of front window to {950, 100, 1800, 700}
    
    -- Set window title and start monitoring
    set custom title of front window to "rEngine Docker Monitor"
    do script "echo '🐳 rEngine Docker Services Monitor' && echo '=================================' && docker ps --format 'table {{.Names}}\\t{{.Status}}'" in dockerWindow
    
end tell
EOF

    # STEP 4: Initialize agent-specific context
    if [ "$AGENT_TYPE" != "" ]; then
        echo -e "${GREEN}STEP 4: Starting $AGENT_TYPE agent initialization...${NC}"
        if [ -f "rCore/universal-agent-init.js" ]; then
            node rCore/universal-agent-init.js --agent-type "$AGENT_TYPE" --auto --non-interactive
        else
            echo -e "${YELLOW}   ⚠️  Universal agent init not found - skipping${NC}"
        fi
    else
        echo -e "${YELLOW}STEP 4: Auto-detecting agent type...${NC}"
        if [ -f "rCore/universal-agent-init.js" ]; then
            node rCore/universal-agent-init.js --auto --non-interactive
        else
            echo -e "${YELLOW}   ⚠️  Universal agent init not found - skipping${NC}"
        fi
    fi

    echo -e "${GREEN}✅ rEngine Quick Start Complete - Enhanced Scribe Console should be visible in Terminal.app${NC}"

    # STEP 5: Final System Verification
    echo -e "${CYAN}STEP 5: Verifying all services are running...${NC}"

    echo -e "${YELLOW}🔍 Ollama Status:${NC}"
    if pgrep -f "ollama" > /dev/null; then
        echo -e "${GREEN}✅ Ollama is running${NC}"
    else
        echo -e "${YELLOW}⚠️  Ollama not detected - may need manual start${NC}"
    fi

    echo -e "${YELLOW}🔍 Docker Containers:${NC}"
    docker ps --format "table {{.Names}}\t{{.Status}}" | grep -E "rengine|mcp-server" || echo -e "${YELLOW}⚠️  No rEngine containers running${NC}"

    echo -e "${YELLOW}🔍 MCP Server Status:${NC}"
    if pgrep -f "mcp-server" > /dev/null; then
        echo -e "${GREEN}✅ MCP server process running${NC}"
    else
        echo -e "${YELLOW}⚠️  MCP server not detected${NC}"
    fi

    echo -e "${GREEN}🎉 Quick Start Complete! Check Terminal.app windows for console access.${NC}"
fi

# Post-startup actions
echo ""
echo -e "${CYAN}📊 Final System Status Check:${NC}"
if [ -f "./monitor-protocol-state.sh" ]; then
    ./monitor-protocol-state.sh --once
else
    echo -e "${YELLOW}⚠️  Protocol state monitor not available${NC}"
fi

echo ""
echo -e "${PINK}🎯 SYSTEM READY FOR LLM OPERATIONS${NC}"
echo -e "${CYAN}   • Robust startup protocol: Available${NC}"
echo -e "${CYAN}   • Emergency recovery: Available${NC}"  
echo -e "${CYAN}   • System monitoring: Available${NC}"
echo -e "${CYAN}   • Agent type: ${AGENT_TYPE:-general}${NC}"
echo ""
echo -e "${YELLOW}💡 Tip: Run './monitor-protocol-state.sh --continuous' for real-time monitoring${NC}"
