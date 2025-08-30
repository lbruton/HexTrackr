#!/bin/bash

# Auto-Launch Enhanced Scribe Console
# Automatically opens external Terminal with Hello Kitty scribe console

# Colors
PINK='\033[95m'
GREEN='\033[92m'
BLUE='\033[94m'
YELLOW='\033[93m'
WHITE='\033[97m'
RESET='\033[0m'

# Enhanced Hello Kitty Header
echo -e "${PINK}"
cat << "EOF"
     /\_/\  
    ( o.o ) 
     > ^ <    Auto-Launching Enhanced Scribe Console!
    
    ♡ ♡ ♡ ♡ ♡ ♡ ♡ ♡ ♡ ♡ ♡ ♡ ♡ ♡ ♡
EOF
echo -e "${RESET}"

echo -e "${WHITE}🚀 Starting enhanced scribe console in external terminal...${RESET}"
echo -e "${YELLOW}═══════════════════════════════════════════════════════════${RESET}"

# Kill any existing scribe processes
echo -e "${BLUE}🔄 Stopping any existing scribe processes...${RESET}"
pkill -f "enhanced-scribe-console.js" 2>/dev/null
pkill -f "smart-scribe.js" 2>/dev/null
sleep 1

# Check if we're running in VS Code terminal
if [ "$TERM_PROGRAM" = "vscode" ]; then
    echo -e "${GREEN}✅ Detected VS Code environment${RESET}"
    echo -e "${YELLOW}📱 Opening external Terminal for scribe console...${RESET}"
    
    # Open new Terminal window/tab with scribe console
    osascript << EOF
tell application "Terminal"
    activate
    set newTab to do script "cd /Volumes/DATA/GitHub/rEngine/rEngine"
    delay 0.5
    do script "echo -e '${PINK}     /\\\\_/\\\\  
    ( o.o ) 
     > ^ <    Enhanced Scribe Console - External Terminal

    ♡ ♡ ♡ ♡ ♡ ♡ ♡ ♡ ♡ ♡ ♡ ♡ ♡ ♡ ♡${RESET}'" in newTab
    delay 0.5
    do script "echo -e '${WHITE}🧠 Starting enhanced monitoring system...${RESET}'" in newTab
    delay 0.5
    do script "node enhanced-scribe-console.js" in newTab
end tell
EOF
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ External Terminal launched successfully!${RESET}"
        echo -e "${YELLOW}📋 Scribe console running in new Terminal window${RESET}"
        echo -e "${BLUE}💡 You can now continue development in VS Code${RESET}"
        echo -e "${PINK}   The scribe will monitor file changes automatically${RESET}"
    else
        echo -e "${YELLOW}⚠️  Terminal launch failed, trying fallback...${RESET}"
        # Fallback: Run in background
        nohup node enhanced-scribe-console.js > scribe-console.log 2>&1 &
        SCRIBE_PID=$!
        echo -e "${GREEN}✅ Scribe console running in background (PID: $SCRIBE_PID)${RESET}"
        echo -e "${BLUE}📋 Logs: /Volumes/DATA/GitHub/rEngine/rEngine/scribe-console.log${RESET}"
    fi
    
else
    echo -e "${GREEN}✅ Running in standard terminal${RESET}"
    echo -e "${YELLOW}📱 Opening new Terminal tab for scribe console...${RESET}"
    
    # For non-VS Code environments, open new tab
    osascript << EOF
tell application "Terminal"
    activate
    tell application "System Events" to keystroke "t" using command down
    delay 0.5
    do script "cd /Volumes/DATA/GitHub/rEngine/rEngine && node enhanced-scribe-console.js" in front window
end tell
EOF
    
    echo -e "${GREEN}✅ New Terminal tab launched with scribe console${RESET}"
fi

echo
echo -e "${PINK}🎯 Enhanced Scribe Console Features:${RESET}"
echo -e "${WHITE}   ✅ Hello Kitty ASCII art welcome${RESET}"
echo -e "${WHITE}   ✅ Real-time file monitoring${RESET}"
echo -e "${WHITE}   ✅ Last 5 changes display${RESET}"
echo -e "${WHITE}   ✅ Clean INFO logging format${RESET}"
echo -e "${WHITE}   ✅ Interactive command interface${RESET}"
echo
echo -e "${BLUE}📋 Available Commands in Scribe Console:${RESET}"
echo -e "${WHITE}   • summary [timeframe] - Generate conversation summary${RESET}"
echo -e "${WHITE}   • memory             - Check memory status${RESET}"
echo -e "${WHITE}   • logs               - View recent logs${RESET}"
echo -e "${WHITE}   • clear              - Clear screen${RESET}"
echo -e "${WHITE}   • help               - Show commands${RESET}"
echo -e "${WHITE}   • quit               - Exit console${RESET}"
echo
echo -e "${GREEN}✨ Auto-launch complete! Scribe console is now monitoring your files.${RESET}"
echo -e "${PINK}   Continue your development in VS Code - changes will be logged automatically! ${RESET}"
