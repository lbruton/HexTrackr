#!/bin/bash

# rEngine Memory File Sync Script
# Keeps /agents/memory and /rAgents/memory in sync for MCP compatibility
# This is needed because GitHub doesn't handle symbolic links well

# Colors for output
BLUE='\033[0;34m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

SOURCE_FILE="/Volumes/DATA/GitHub/rEngine/rAgents/memory"
TARGET_FILE="/Volumes/DATA/GitHub/rEngine/agents/memory"

echo -e "${BLUE}🔄 Syncing memory files...${NC}"
echo -e "${BLUE}ℹ️  NOTE: MCP server writes to agents/memory, rAgents/memory is our primary source${NC}"

# Ensure target directory exists
mkdir -p "$(dirname "$TARGET_FILE")"

# Check which file is newer and sync accordingly
if [[ "$SOURCE_FILE" -nt "$TARGET_FILE" ]]; then
    echo -e "${YELLOW}📋 rAgents/memory is newer, updating agents/memory${NC}"
    cp "$SOURCE_FILE" "$TARGET_FILE"
    echo -e "${GREEN}✅ Synced from rAgents/memory to agents/memory${NC}"
elif [[ "$TARGET_FILE" -nt "$SOURCE_FILE" ]]; then
    echo -e "${YELLOW}📋 agents/memory is newer (MCP wrote to it), updating rAgents/memory${NC}"
    cp "$TARGET_FILE" "$SOURCE_FILE"
    echo -e "${GREEN}✅ Synced from agents/memory to rAgents/memory (preserving MCP updates)${NC}"
else
    echo -e "${GREEN}✅ Memory files are already in sync${NC}"
fi

echo -e "${BLUE}📊 Memory file status:${NC}"
echo -e "   Source (rAgents): $(wc -l < "$SOURCE_FILE") lines"
echo -e "   Target (agents):  $(wc -l < "$TARGET_FILE") lines"
