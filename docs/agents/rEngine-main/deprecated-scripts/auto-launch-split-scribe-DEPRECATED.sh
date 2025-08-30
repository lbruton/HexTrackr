#!/bin/bash

# Auto-Launch Split Scribe Console
# Opens external terminal on left side with split display

# Colors
PINK='\033[95m'
GREEN='\033[92m'
BLUE='\033[94m'
YELLOW='\033[93m'
RESET='\033[0m'

echo -e "${PINK}"
cat << "EOF"
     /\_/\  
    ( o.o ) 
     > ^ <    Auto-Launching Split Scribe Console
    
    ♡ ♡ ♡ ♡ ♡ ♡ ♡ ♡ ♡ ♡ ♡ ♡ ♡ ♡ ♡
EOF
echo -e "${RESET}"

echo -e "${BLUE}🚀 Opening split scribe console in external terminal...${RESET}"

# Kill any existing scribe processes
echo -e "${YELLOW}🧹 Cleaning up existing scribe processes...${RESET}"
pkill -f "enhanced-scribe-console.js" 2>/dev/null
pkill -f "split-scribe-console.js" 2>/dev/null

# Wait a moment
sleep 1

# Launch in external terminal positioned on left
echo -e "${GREEN}📺 Launching external terminal with split display...${RESET}"

osascript << EOF
tell application "Terminal"
    activate
    
    -- Create new window
    set newWindow to do script "cd /Volumes/DATA/GitHub/rEngine/rEngine && node split-scribe-console.js"
    
    -- Position window on left side
    set bounds of front window to {50, 100, 800, 700}
    
    -- Set window title
    set custom title of front window to "StackTrackr Scribe Console"
    
end tell
EOF

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Split scribe console launched successfully!${RESET}"
    echo -e "${BLUE}📊 Features:${RESET}"
    echo -e "   • Left side: Last 5 changes"
    echo -e "   • Right side: Full verbose log"
    echo -e "   • Real-time file monitoring"
    echo -e "   • Interactive commands"
    echo -e "${YELLOW}💡 The console will auto-update as you work!${RESET}"
else
    echo -e "${YELLOW}⚠️  AppleScript failed, trying fallback...${RESET}"
    
    # Fallback: Open in new Terminal tab
    open -a Terminal
    sleep 2
    osascript -e 'tell application "Terminal" to do script "cd /Volumes/DATA/GitHub/rEngine/rEngine && node split-scribe-console.js" in front window'
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Fallback successful - scribe console launched!${RESET}"
    else
        echo -e "${YELLOW}⚠️  Auto-launch failed. Please run manually:${RESET}"
        echo -e "${BLUE}cd /Volumes/DATA/GitHub/rEngine/rEngine && node split-scribe-console.js${RESET}"
    fi
fi
