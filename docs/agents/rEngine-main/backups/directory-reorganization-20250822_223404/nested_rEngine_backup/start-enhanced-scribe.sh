#!/bin/bash

# Enhanced Scribe Console Launcher
# Starts scribe console in dedicated terminal that stays open

# Colors
PINK='\033[95m'
GREEN='\033[92m'
BLUE='\033[94m'
YELLOW='\033[93m'
RESET='\033[0m'

# Function to check if VS Code terminal is available
check_vscode_terminal() {
    if [ "$TERM_PROGRAM" = "vscode" ]; then
        return 0
    else
        return 1
    fi
}

# Function to start in new terminal tab/window
start_dedicated_terminal() {
    echo -e "${BLUE}🚀 Starting Enhanced Scribe Console in dedicated terminal...${RESET}"
    
    if check_vscode_terminal; then
        # VS Code - use integrated terminal
        echo -e "${GREEN}✅ Detected VS Code environment${RESET}"
        echo -e "${YELLOW}📝 Starting scribe console in current terminal...${RESET}"
        echo -e "${PINK}═══════════════════════════════════════════════${RESET}"
        cd /Volumes/DATA/GitHub/rEngine/rEngine
        node enhanced-scribe-console.js
    else
        # macOS Terminal - open new tab
        osascript << EOF
tell application "Terminal"
    activate
    tell application "System Events" to keystroke "t" using command down
    delay 0.5
    do script "cd /Volumes/DATA/GitHub/rEngine/rEngine && node enhanced-scribe-console.js" in front window
end tell
EOF
        echo -e "${GREEN}✅ Scribe console started in new Terminal tab${RESET}"
    fi
}

# Function to start in background (for automated monitoring)
start_background_mode() {
    echo -e "${BLUE}🔄 Starting Enhanced Scribe Console in background mode...${RESET}"
    cd /Volumes/DATA/GitHub/rEngine/rEngine
    nohup node enhanced-scribe-console.js > scribe-console.log 2>&1 &
    SCRIBE_PID=$!
    echo -e "${GREEN}✅ Scribe console running in background (PID: $SCRIBE_PID)${RESET}"
    echo -e "${YELLOW}📋 Logs: /Volumes/DATA/GitHub/rEngine/rEngine/scribe-console.log${RESET}"
}

# Main execution
echo -e "${PINK}"
cat << "EOF"
     /\_/\  
    ( o.o ) 
     > ^ <    Enhanced Scribe Console Launcher
    
    ♡ ♡ ♡ ♡ ♡ ♡ ♡ ♡ ♡ ♡ ♡ ♡ ♡ ♡ ♡
EOF
echo -e "${RESET}"

# Check arguments
case "${1:-interactive}" in
    "interactive"|"")
        start_dedicated_terminal
        ;;
    "background"|"bg")
        start_background_mode
        ;;
    "help"|"-h"|"--help")
        echo -e "${BLUE}Usage:${RESET}"
        echo -e "  $0                    - Start in interactive mode (dedicated terminal)"
        echo -e "  $0 background         - Start in background mode"
        echo -e "  $0 help              - Show this help"
        ;;
    *)
        echo -e "${YELLOW}Unknown option: $1${RESET}"
        echo -e "Use '$0 help' for usage information"
        exit 1
        ;;
esac
