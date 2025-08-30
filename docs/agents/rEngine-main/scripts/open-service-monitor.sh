#!/bin/bash

# StackTrackr Service Status Monitor - Console Popup
# Following COPILOT_INSTRUCTIONS.md - must use Terminal.app

# Colors
PINK='\033[95m'
GREEN='\033[92m'
BLUE='\033[94m'
CYAN='\033[96m'
YELLOW='\033[93m'
RED='\033[91m'
RESET='\033[0m'

echo -e "${PINK}📊 StackTrackr Service Status Monitor${RESET}"
echo -e "${BLUE}Opening real-time service dashboard in Terminal.app...${RESET}"

# Get project directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

# Launch Service Status Monitor in Terminal.app
osascript << EOF
tell application "Terminal"
    activate
    
    -- Create new window for service monitoring
    set newWindow to do script "cd '$PROJECT_DIR' && bash '$SCRIPT_DIR/service-monitor-dashboard.sh'"
    
    -- Position window at bottom
    set bounds of front window to {300, 400, 1200, 800}
    
    -- Set window title
    set custom title of front window to "StackTrackr Service Dashboard"
    
end tell
EOF

echo -e "${GREEN}✅ Service Status Monitor opened in Terminal.app${RESET}"
