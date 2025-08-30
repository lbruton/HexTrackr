#!/bin/bash

# Smart Scribe Startup Script with Process and Memory Monitoring
# Author: rEngine System
# Date: August 19, 2025

set -e

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SMART_SCRIBE_PATH="$SCRIPT_DIR/../rEngine/smart-scribe.js"
MEMORY_THRESHOLD=80

echo -e "${BLUE}🔍 Smart Scribe Startup Check${NC}"
echo "================================================"

# Function to get memory usage percentage on macOS
get_memory_usage() {
    # Get memory pressure and parse it
    local memory_pressure=$(memory_pressure 2>/dev/null | grep "System-wide memory free percentage" | awk '{print $5}' | sed 's/%//')
    
    # If memory_pressure command fails, use vm_stat as fallback
    if [ -z "$memory_pressure" ]; then
        local pages_free=$(vm_stat | grep "Pages free" | awk '{print $3}' | sed 's/\.//')
        local pages_total=$(vm_stat | grep -E "Pages (free|active|inactive|speculative|throttled|wired down|purgeable|occupied by compressor)" | awk '{sum += $3} END {print sum}')
        
        if [ -n "$pages_free" ] && [ -n "$pages_total" ] && [ "$pages_total" -gt 0 ]; then
            local free_percentage=$((pages_free * 100 / pages_total))
            memory_pressure=$((100 - free_percentage))
        else
            # Final fallback using top
            memory_pressure=$(top -l 1 -s 0 | grep PhysMem | awk '{print $2}' | sed 's/M.*//' | awk '{used=$1} END {print int(used/16*100)}')
        fi
    else
        # Convert free percentage to used percentage
        memory_pressure=$((100 - memory_pressure))
    fi
    
    echo "$memory_pressure"
}

# Check if Smart Scribe is already running
echo -e "${BLUE}🔍 Checking for existing Smart Scribe processes...${NC}"
EXISTING_SCRIBE=$(ps aux | grep -E "node.*smart-scribe|smart-scribe\.js" | grep -v grep | wc -l | tr -d ' ')

if [ "$EXISTING_SCRIBE" -gt 0 ]; then
    echo -e "${YELLOW}⚠️  Smart Scribe is already running!${NC}"
    echo ""
    ps aux | grep -E "node.*smart-scribe|smart-scribe\.js" | grep -v grep
    echo ""
    echo -e "${YELLOW}❓ Do you want to stop the existing process and start a new one? (y/N)${NC}"
    read -r response
    
    if [[ "$response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
        echo -e "${BLUE}🛑 Stopping existing Smart Scribe processes...${NC}"
        pkill -f "smart-scribe" || true
        sleep 2
        echo -e "${GREEN}✅ Existing processes stopped${NC}"
    else
        echo -e "${GREEN}✅ Keeping existing Smart Scribe running${NC}"
        exit 0
    fi
fi

# Check memory usage
echo -e "${BLUE}🧠 Checking memory usage...${NC}"
MEMORY_USED=$(get_memory_usage)

if [ -n "$MEMORY_USED" ]; then
    echo -e "${BLUE}📊 Current memory usage: ${MEMORY_USED}%${NC}"
    
    if [ "$MEMORY_USED" -ge "$MEMORY_THRESHOLD" ]; then
        echo -e "${RED}⚠️  WARNING: Memory usage is at ${MEMORY_USED}%!${NC}"
        echo -e "${RED}🚨 System is already at high memory usage. Starting Smart Scribe may cause performance issues.${NC}"
        echo ""
        echo -e "${YELLOW}❓ Do you want to continue anyway? (y/N)${NC}"
        read -r response
        
        if [[ ! "$response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
            echo -e "${YELLOW}❌ Smart Scribe startup cancelled due to high memory usage${NC}"
            echo -e "${BLUE}💡 Tip: Close some applications or restart your system to free up memory${NC}"
            exit 1
        fi
    else
        echo -e "${GREEN}✅ Memory usage is acceptable (${MEMORY_USED}% < ${MEMORY_THRESHOLD}%)${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  Could not determine memory usage, proceeding anyway${NC}"
fi

# Check if Smart Scribe file exists
if [ ! -f "$SMART_SCRIBE_PATH" ]; then
    echo -e "${RED}❌ Smart Scribe file not found at: $SMART_SCRIBE_PATH${NC}"
    exit 1
fi

# Start Smart Scribe
echo ""
echo -e "${GREEN}🚀 Starting Smart Scribe...${NC}"
echo -e "${BLUE}📁 Path: $SMART_SCRIBE_PATH${NC}"
echo -e "${BLUE}⏰ Time: $(date)${NC}"
echo "================================================"

# Change to the rEngine directory to ensure relative paths work
cd "$(dirname "$SMART_SCRIBE_PATH")"

# Start Smart Scribe with proper output handling
node "$(basename "$SMART_SCRIBE_PATH")" "$@"
