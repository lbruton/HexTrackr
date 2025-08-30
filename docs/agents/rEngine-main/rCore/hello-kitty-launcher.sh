#!/bin/bash

# rEngine Hello Kitty Launcher
# Cute startup script with status display and logs

# Colors
PINK='\033[95m'
WHITE='\033[97m'
YELLOW='\033[93m'
GREEN='\033[92m'
RED='\033[91m'
BLUE='\033[94m'
NC='\033[0m' # No Color

clear

echo -e "${PINK}"
cat << "EOF"
     /\_/\  
    ( o.o ) 
     > ^ <    Hello! rEngine MCP Server Status
    
    ♡ ♡ ♡ ♡ ♡ ♡ ♡ ♡ ♡ ♡ ♡ ♡ ♡ ♡ ♡
EOF
echo -e "${NC}"

echo -e "${WHITE}Welcome to rEngine MCP Server Management! ${PINK}(⁀ᗢ⁀)${NC}"
echo -e "${YELLOW}═══════════════════════════════════════════════${NC}"

# Check rEngine MCP Server status
echo -e "\n${BLUE}🔍 Checking rEngine MCP Server...${NC}"
RENGINE_PID=$(ps aux | grep -E "node.*index\.js" | grep -v grep | awk '{print $2}')

if [ -n "$RENGINE_PID" ]; then
    echo -e "${GREEN}✅ rEngine MCP: RUNNING ${PINK}ฅ(^･ω･^ฅ) ${GREEN}(PID: $RENGINE_PID)${NC}"
else
    echo -e "${RED}❌ rEngine MCP: NOT RUNNING ${PINK}(╥﹏╥)${NC}"
    echo -e "${YELLOW}   Starting rEngine MCP Server...${NC}"
    cd /Volumes/DATA/GitHub/rEngine/rEngine
    nohup node index.js > rengine.log 2>&1 &
    sleep 2
    NEW_PID=$(ps aux | grep -E "node.*index\.js" | grep -v grep | awk '{print $2}')
    if [ -n "$NEW_PID" ]; then
        echo -e "${GREEN}✅ rEngine MCP started! ${PINK}ヾ(＾∇＾) ${GREEN}(PID: $NEW_PID)${NC}"
    else
        echo -e "${RED}❌ Failed to start rEngine MCP ${PINK}(｡•́︿•̀｡)${NC}"
    fi
fi

# Check Memory MCP Server
echo -e "\n${BLUE}🧠 Checking Memory Systems...${NC}"
MEMORY_PID=$(ps aux | grep "mcp-server-memory" | grep -v grep | awk '{print $2}')

if [ -n "$MEMORY_PID" ]; then
    echo -e "${GREEN}✅ Memory MCP: RUNNING ${PINK}(＾◡＾) ${GREEN}(PID: $MEMORY_PID)${NC}"
else
    echo -e "${RED}❌ Memory MCP: NOT RUNNING ${PINK}(｡╯︵╰｡)${NC}"
fi

# Check Smart Scribe status
echo ""
echo -e "${PINK}🤖 Smart Scribe System:${NC}"
scribe_pid=$(pgrep -f "smart-scribe.js" 2>/dev/null)
if [ -n "$scribe_pid" ]; then
    echo -e "  ${GREEN}✅ Smart Scribe: RUNNING ${PINK}ฅ(^•ﻌ•^)ฅ ${GREEN}(PID: $scribe_pid)${NC}"
    
    # Check knowledge database
    if [ -f "$SCRIPT_DIR/technical-knowledge.json" ]; then
        local kb_size=$(du -h "$SCRIPT_DIR/technical-knowledge.json" | cut -f1)
        echo -e "  ${GREEN}✅ Knowledge DB: $kb_size ${PINK}(⁎˃ᆺ˂)${NC}"
    fi
    
    # Check cron job
    if crontab -l 2>/dev/null | grep -q "scribe-keepalive"; then
        echo -e "  ${GREEN}✅ Keep-Alive: ACTIVE ${PINK}ya mon! ${GREEN}(every 5 min)${NC}"
    else
        echo -e "  ${YELLOW}⚠️  Keep-Alive: MISSING ${PINK}(need cron)${NC}"
    fi
else
    echo -e "  ${RED}❌ Smart Scribe: STOPPED ${PINK}(⋟﹏⋞)${NC}"
    echo -e "  ${YELLOW}💡 Run: ./start-smart-scribe.sh${NC}"
fi

# Check persistent memory protection
if [ -f "/Volumes/DATA/GitHub/rEngine/rEngine/persistent-memory.json" ]; then
    echo -e "${GREEN}✅ Persistent Memory: PROTECTED ${PINK}ฅ(＾・ω・＾ฅ) ${GREEN}(JSON backup active)${NC}"
else
    echo -e "${YELLOW}⚠️  Persistent Memory: NOT FOUND ${PINK}(・・？) ${YELLOW}(run memory-protection.sh)${NC}"
fi

# Check Ollama
echo -e "\n${BLUE}🦙 Checking Ollama Server...${NC}"
if curl -s http://localhost:11434/api/tags > /dev/null 2>&1; then
    MODEL_COUNT=$(curl -s http://localhost:11434/api/tags | jq '.models | length' 2>/dev/null || echo "0")
    echo -e "${GREEN}✅ Ollama: RUNNING ${PINK}(=^･ω･^=) ${GREEN}($MODEL_COUNT models)${NC}"
else
    echo -e "${RED}❌ Ollama: NOT RUNNING ${PINK}(；一_一)${NC}"
fi

echo -e "\n${YELLOW}═══════════════════════════════════════════════${NC}"
echo -e "${PINK}"
cat << "EOF"
    /\_/\  
   ( ^.^ )   Everything looks purrfect!
    > ^ <    
EOF
echo -e "${NC}"

echo -e "\n${WHITE}📝 Quick Actions:${NC}"
echo -e "${BLUE}   [1]${NC} View rEngine logs:    ${YELLOW}tail -f /Volumes/DATA/GitHub/rEngine/rEngine/rengine.log${NC}"
echo -e "${BLUE}   [2]${NC} Restart rEngine:      ${YELLOW}./restart-rengine.sh${NC}"
echo -e "${BLUE}   [3]${NC} Full status check:    ${YELLOW}./status-check.sh${NC}"
echo -e "${BLUE}   [4]${NC} Start all servers:    ${YELLOW}./start-mcp-servers.sh${NC}"
echo -e "${BLUE}   [5]${NC} Memory protection:    ${YELLOW}./memory-protection.sh${NC}"
echo -e "${BLUE}   [6]${NC} Memory health check:  ${YELLOW}node memory-sync-manager.js health${NC}"

echo -e "\n${PINK}Thanks for using rEngine! Have a purrfect day! ${WHITE}ฅ(＾・ω・＾ฅ)${NC}"
echo ""
