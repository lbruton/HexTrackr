#!/bin/bash

# Universal Agent Initialization Launcher
# Easy wrapper script for initializing any AI agent type

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
RENGINE_DIR="$SCRIPT_DIR/../rEngine"

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
PINK='\033[0;35m'
NC='\033[0m' # No Color

echo -e "${CYAN}🚀 Universal Agent Initialization Launcher${NC}"
echo -e "${BLUE}Supporting: Claude, GPT, Gemini, GitHub Copilot, VS Code Copilot${NC}"
echo ""
echo -e "${PINK}📋 PROTOCOL REMINDER:${NC}"
echo -e "${YELLOW}   • Check /rProtocols/ folder for operational procedures${NC}"
echo -e "${YELLOW}   • GitHub Copilot: You are the HEAD ORCHESTRATOR for rEngine${NC}"
echo -e "${YELLOW}   • Always check available MCP tools before starting tasks${NC}"
echo ""

# Check if agent type is provided as argument
AGENT_TYPE=""
if [ "$1" != "" ]; then
    AGENT_TYPE="$1"
    echo -e "${GREEN}✅ Agent type specified: ${AGENT_TYPE}${NC}"
else
    echo -e "${YELLOW}💡 No agent type specified - will auto-detect${NC}"
fi

# Check if Node.js is available
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Error: Node.js is not installed or not in PATH${NC}"
    exit 1
fi

# Change to rEngine directory
cd "$RENGINE_DIR" || {
    echo -e "${RED}❌ Error: Could not change to rEngine directory${NC}"
    exit 1
}

# Run the universal agent initialization
echo -e "${CYAN}🔄 Starting universal agent initialization...${NC}"
echo ""

if [ "$AGENT_TYPE" != "" ]; then
    # Run with specified agent type in auto mode
    node universal-agent-init.js --agent-type "$AGENT_TYPE" --auto
else
    # Run with auto-detection in auto mode
    node universal-agent-init.js --auto
fi

EXIT_CODE=$?

echo ""
if [ $EXIT_CODE -eq 0 ]; then
    echo -e "${GREEN}✅ Universal agent initialization completed successfully!${NC}"
    echo -e "${PINK}💡 Your AI agent is now ready with full MCP integration!${NC}"
else
    echo -e "${RED}❌ Initialization failed with exit code: $EXIT_CODE${NC}"
    echo -e "${YELLOW}💭 Check the output above for error details${NC}"
fi

exit $EXIT_CODE
