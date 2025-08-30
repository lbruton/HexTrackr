#!/bin/bash

# StackTrackr Universal AI Agent Startup Script
# Following COPILOT_INSTRUCTIONS.md protocol for proper initialization

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
PINK='\033[95m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${PINK}🚀 StackTrackr Universal AI Agent Startup${NC}"
echo -e "${BLUE}Following COPILOT_INSTRUCTIONS.md protocol${NC}"
echo ""

# Set automation environment variables to prevent any prompts
export CI=true
export NON_INTERACTIVE=true

echo -e "${CYAN}STEP 1: Launching rEngine Services (Docker + MCP + Smart Scribe)...${NC}"
bash "$SCRIPT_DIR/bin/launch-rEngine-services.sh"

echo -e "${CYAN}STEP 2: Executing mandatory memory synchronization...${NC}"
bash "$SCRIPT_DIR/rEngine/memory-sync-automation.sh" manual

echo -e "${CYAN}STEP 2.5: Checking memory file synchronization...${NC}"
bash "$SCRIPT_DIR/scripts/sync-memory-files.sh"

echo -e "${CYAN}STEP 3: Opening Split Scribe Console in Terminal.app...${NC}"
# Launch Split Scribe Console in Terminal.app (as specified in COPILOT_INSTRUCTIONS.md)
osascript << 'EOF'
tell application "Terminal"
    activate
    
    -- Create new window
    set newWindow to do script "cd /Volumes/DATA/GitHub/rEngine/rEngine && node split-scribe-console.js"
    
    -- Position window on left side
    set bounds of front window to {50, 100, 900, 700}
    
    -- Set window title
    set custom title of front window to "StackTrackr Split Scribe Console"
    
end tell
EOF

echo -e "${CYAN}STEP 4: Initializing agent-specific context...${NC}"
# Check if an agent type was specified
cd "$SCRIPT_DIR"
if [ "$1" != "" ]; then
    echo -e "${GREEN}Starting $1 agent initialization...${NC}"
    node rEngine/universal-agent-init.js --agent-type "$1" --auto --non-interactive
else
    echo -e "${YELLOW}Auto-detecting agent type...${NC}"
    node rEngine/universal-agent-init.js --auto --non-interactive
fi

echo ""
echo -e "${GREEN}✅ StackTrackr Universal Agent Startup Complete${NC}"
echo -e "${BLUE}💡 Split Scribe Console should be visible in Terminal.app${NC}"
echo ""
echo -e "${CYAN}💡 Usage examples:${NC}"
echo -e "  ${BLUE}./startup.sh${NC}          # Auto-detect agent"
echo -e "  ${BLUE}./startup.sh claude${NC}   # Start Claude session"
echo -e "  ${BLUE}./startup.sh gpt${NC}      # Start GPT session"
echo -e "  ${BLUE}./startup.sh gemini${NC}   # Start Gemini session"
