#!/bin/bash

# Simple Auto-Launch Enhanced Scribe Console
# Opens external terminal automatically on agent init

# Colors
PINK='\033[95m'
GREEN='\033[92m'
BLUE='\033[94m'
YELLOW='\033[93m'
WHITE='\033[97m'
RESET='\033[0m'

echo -e "${PINK}"
cat << "EOF"
     /\_/\  
    ( o.o ) 
     > ^ <    Auto-Launching Enhanced Scribe Console!
    
    ♡ ♡ ♡ ♡ ♡ ♡ ♡ ♡ ♡ ♡ ♡ ♡ ♡ ♡ ♡
EOF
echo -e "${RESET}"

echo -e "${BLUE}🚀 Starting enhanced scribe console...${RESET}"

# Kill any existing scribe processes
pkill -f "enhanced-scribe-console.js" 2>/dev/null
pkill -f "smart-scribe.js" 2>/dev/null
sleep 1

# Method 1: Try to open new Terminal window
if command -v osascript >/dev/null 2>&1; then
    echo -e "${YELLOW}📱 Opening external Terminal window...${RESET}"
    
    osascript -e 'tell application "Terminal" to do script "cd /Volumes/DATA/GitHub/rEngine/rEngine && echo \"🧠 Enhanced Scribe Console Starting...\" && node enhanced-scribe-console.js"' 2>/dev/null
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ External Terminal launched successfully!${RESET}"
        echo -e "${PINK}   Scribe console running in new Terminal window${RESET}"
    else
        echo -e "${YELLOW}⚠️  AppleScript failed, using background mode...${RESET}"
        nohup node enhanced-scribe-console.js > scribe-console.log 2>&1 &
        echo -e "${GREEN}✅ Scribe console running in background (PID: $!)${RESET}"
    fi
else
    # Method 2: Background mode for non-macOS
    echo -e "${YELLOW}📱 Starting in background mode...${RESET}"
    nohup node enhanced-scribe-console.js > scribe-console.log 2>&1 &
    echo -e "${GREEN}✅ Scribe console running in background (PID: $!)${RESET}"
fi

echo
echo -e "${BLUE}🎯 Scribe Console Features Active:${RESET}"
echo -e "${WHITE}   ✅ Hello Kitty ASCII art${RESET}"
echo -e "${WHITE}   ✅ Real-time file monitoring${RESET}"
echo -e "${WHITE}   ✅ Last 5 changes display${RESET}"
echo -e "${WHITE}   ✅ Clean INFO logging${RESET}"

echo
echo -e "${GREEN}✨ Auto-launch complete!${RESET}"
echo -e "${PINK}   Your scribe is now monitoring files automatically${RESET}"

# Show current status
sleep 2
if pgrep -f "enhanced-scribe-console.js" > /dev/null; then
    echo -e "${GREEN}🟢 Scribe Status: ACTIVE${RESET}"
    echo -e "${BLUE}📋 View logs: tail -f scribe-console.log${RESET}"
else
    echo -e "${YELLOW}🟡 Scribe Status: Starting...${RESET}"
fi
