#!/bin/bash

# StackTrackr Scribe Startup Script
# Run this outside VS Code to start the scribe monitoring system

PINK='\033[95m'
RESET='\033[0m'
BRIGHT_PINK='\033[95;1m'

echo -e "${BRIGHT_PINK}"
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║                 StackTrackr Scribe Startup                   ║"
echo "║                                                              ║"
echo "║   🧠 Starting AI Conversation Monitoring System             ║"
echo "║   📝 Background Process - Runs Independent of VS Code       ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo -e "${RESET}"

# Change to StackTrackr directory
cd "/Volumes/DATA/GitHub/rEngine"

# Check if we're in the right place
if [ ! -f "package.json" ]; then
    echo -e "${PINK}❌ Error: Not in StackTrackr directory. Please check the path.${RESET}"
    exit 1
fi

echo -e "${PINK}📁 Working directory: $(pwd)${RESET}"
echo -e "${PINK}🔍 Checking system components...${RESET}"

# Check if rEngine exists
if [ ! -d "rEngine" ]; then
    echo -e "${PINK}❌ Error: rEngine directory not found${RESET}"
    exit 1
fi

# Check if memory system exists  
if [ ! -d "rMemory/rAgentMemories" ]; then
    echo -e "${PINK}❌ Error: rMemory/rAgentMemories directory not found${RESET}"
    exit 1
fi

# Check if smart-scribe exists
if [ ! -f "rEngine/smart-scribe.js" ]; then
    echo -e "${PINK}❌ Error: smart-scribe.js not found in rEngine/${RESET}"
    exit 1
fi

echo -e "${PINK}✅ All components found${RESET}"

# Kill any existing scribe processes
echo -e "${PINK}🔄 Checking for existing scribe processes...${RESET}"
pkill -f "smart-scribe.js" 2>/dev/null
sleep 1

# Check if Node.js is available
if ! command -v node &> /dev/null; then
    echo -e "${PINK}❌ Error: Node.js not found. Please install Node.js first.${RESET}"
    exit 1
fi

echo -e "${PINK}✅ Node.js found: $(node --version)${RESET}"

# Start the scribe in the background
echo -e "${PINK}🚀 Starting Smart Scribe system...${RESET}"

# Start with nohup so it continues running after terminal closes
nohup node rEngine/smart-scribe.js > scribe.log 2>&1 &
SCRIBE_PID=$!

# Give it a moment to start
sleep 2

# Check if it's running
if ps -p $SCRIBE_PID > /dev/null; then
    echo -e "${BRIGHT_PINK}🎉 Smart Scribe started successfully!${RESET}"
    echo -e "${PINK}   Process ID: $SCRIBE_PID${RESET}"
    echo -e "${PINK}   Log file: $(pwd)/scribe.log${RESET}"
    echo -e "${PINK}   Monitor with: tail -f scribe.log${RESET}"
    echo ""
    echo -e "${PINK}📋 Scribe Management Commands:${RESET}"
    echo -e "${PINK}   Check status: ps aux | grep smart-scribe${RESET}"
    echo -e "${PINK}   View logs:    tail -f scribe.log${RESET}"
    echo -e "${PINK}   Stop scribe:  pkill -f smart-scribe.js${RESET}"
    echo ""
    echo -e "${BRIGHT_PINK}✨ Scribe is now monitoring your StackTrackr sessions!${RESET}"
    echo -e "${PINK}   It will continue running even if you close VS Code.${RESET}"
else
    echo -e "${PINK}❌ Error: Failed to start Smart Scribe${RESET}"
    echo -e "${PINK}   Check the log file for details: cat scribe.log${RESET}"
    exit 1
fi
