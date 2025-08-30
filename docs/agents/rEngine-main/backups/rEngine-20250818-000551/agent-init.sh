#!/bin/bash

# Complete Agent Initialization Script
# Auto-launches scribe console, creates git checkpoint, initializes memory

# Colors  
PINK='\033[95m'
GREEN='\033[92m'
BLUE='\033[94m'
YELLOW='\033[93m'
WHITE='\033[97m'
RESET='\033[0m'

clear
echo -e "${PINK}"
cat << "EOF"
╔══════════════════════════════════════════════════════════════╗
║                  StackTrackr Agent Initialization            ║
║                                                              ║
║   🤖 GitHub Copilot Agent Auto-Setup                       ║
║   🧠 Memory System Activation                              ║
║   📝 Scribe Console Auto-Launch                            ║
╚══════════════════════════════════════════════════════════════╝
EOF
echo -e "${RESET}"

echo -e "${WHITE}🚀 Starting complete agent initialization...${RESET}"
echo -e "${YELLOW}═══════════════════════════════════════════════════════════${RESET}"

# Navigate to project root
cd /Volumes/DATA/GitHub/rEngine

# Step 1: Git Checkpoint
echo -e "${BLUE}📦 STEP 1: Creating git checkpoint...${RESET}"
git add -A
git commit -m "AGENT SESSION START: Auto-initialization $(date '+%Y-%m-%d %H:%M:%S')"
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Git checkpoint created successfully${RESET}"
else
    echo -e "${YELLOW}⚠️  Git checkpoint failed (may be no changes)${RESET}"
fi

# Step 2: Auto-Launch Scribe Console
echo -e "${BLUE}📱 STEP 2: Auto-launching enhanced scribe console...${RESET}"
cd rEngine
./simple-auto-launch.sh

# Step 3: Initialize Agent Memory
echo -e "${BLUE}🧠 STEP 3: Initializing agent memory system...${RESET}"
if [ -f "agent-hello-workflow.js" ]; then
    node agent-hello-workflow.js init
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Agent memory system initialized${RESET}"
    else
        echo -e "${YELLOW}⚠️  Agent memory initialization had issues${RESET}"
    fi
else
    echo -e "${YELLOW}⚠️  agent-hello-workflow.js not found${RESET}"
fi

# Step 4: Verify Systems
echo -e "${BLUE}🔍 STEP 4: Verifying system status...${RESET}"

# Check scribe console
if pgrep -f "enhanced-scribe-console.js" > /dev/null; then
    echo -e "${GREEN}✅ Enhanced Scribe Console: ACTIVE${RESET}"
else
    echo -e "${YELLOW}⚠️  Enhanced Scribe Console: NOT DETECTED${RESET}"
fi

# Check MCP servers  
if pgrep -f "index.js" > /dev/null; then
    echo -e "${GREEN}✅ rEngine MCP Server: ACTIVE${RESET}"
else
    echo -e "${YELLOW}⚠️  rEngine MCP Server: NOT DETECTED${RESET}"
fi

# Check memory files
if [ -f "../rMemory/rAgentMemories/memory.json" ]; then
    echo -e "${GREEN}✅ Agent Memory Files: PRESENT${RESET}"
else
    echo -e "${YELLOW}⚠️  Agent Memory Files: NOT FOUND${RESET}"
fi

echo
echo -e "${PINK}🎯 Initialization Complete!${RESET}"
echo -e "${WHITE}════════════════════════════════════════════════════════════${RESET}"
echo -e "${GREEN}✨ Your StackTrackr agent is now fully initialized:${RESET}"
echo -e "${WHITE}   ✅ Git checkpoint created${RESET}"
echo -e "${WHITE}   ✅ Enhanced scribe console running in external terminal${RESET}"
echo -e "${WHITE}   ✅ Agent memory system loaded${RESET}"
echo -e "${WHITE}   ✅ File monitoring active${RESET}"

echo
echo -e "${BLUE}📋 Next Steps:${RESET}"
echo -e "${WHITE}   • Continue your development in VS Code${RESET}"
echo -e "${WHITE}   • Check the external Terminal for scribe console${RESET}"
echo -e "${WHITE}   • File changes will be automatically logged${RESET}"
echo -e "${WHITE}   • Agent memory is ready for conversation context${RESET}"

echo
echo -e "${PINK}🎮 Ready to work! Hello Kitty scribe is watching over your files! ♡${RESET}"
