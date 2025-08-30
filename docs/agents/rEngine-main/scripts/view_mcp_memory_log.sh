#!/bin/bash

# MCP Memory Log Viewer - Opens console popup for real-time monitoring
# Following COPILOT_INSTRUCTIONS.md - must use Terminal.app, not VS Code terminal

# Colors
PINK='\033[95m'
GREEN='\033[92m'
BLUE='\033[94m'
CYAN='\033[96m'
YELLOW='\033[93m'
RESET='\033[0m'

echo -e "${PINK}📋 MCP Memory Log Viewer - Terminal.app Console${RESET}"
echo -e "${BLUE}Following COPILOT_INSTRUCTIONS.md protocol${RESET}"

# Get project directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

echo -e "${CYAN}🔍 Opening MCP Memory Log console in Terminal.app...${RESET}"

# Launch MCP Memory Log viewer in Terminal.app with proper positioning
osascript << EOF
tell application "Terminal"
    activate
    
    -- Create new window for MCP Memory monitoring
    set newWindow to do script "cd '$PROJECT_DIR' && echo -e '${PINK}🧠 MCP Memory Log Monitor${RESET}' && echo -e '${BLUE}Real-time monitoring of MCP operations${RESET}' && echo '' && tail -f rMemory/logs/mcp-memory.log 2>/dev/null || echo 'No MCP log file found. Creating...' && touch rMemory/logs/mcp-memory.log && tail -f rMemory/logs/mcp-memory.log"
    
    -- Position window on right side (complementing split scribe on left)
    set bounds of front window to {920, 100, 1400, 700}
    
    -- Set window title
    set custom title of front window to "MCP Memory Log Monitor"
    
end tell
EOF

echo -e "${GREEN}✅ MCP Memory Log console opened in Terminal.app${RESET}"
echo -e "${YELLOW}💡 Window positioned on right side to complement Split Scribe console${RESET}"
