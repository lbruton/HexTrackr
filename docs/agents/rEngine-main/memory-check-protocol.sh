#!/bin/bash

# rEngine Memory Check Protocol
# Comprehensive memory system validation and health monitoring

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo -e "${BLUE}🧠 rEngine Memory Check Protocol${NC}"
echo -e "${CYAN}=================================${NC}"

cd "$(dirname "$0")"
BASE_DIR="/Volumes/DATA/GitHub/rEngine"
cd "$BASE_DIR"

# Track results
ISSUES_FOUND=0
CHECKS_PASSED=0
TOTAL_CHECKS=0

# Function to log check result
log_check() {
    local check_name="$1"
    local status="$2"
    local message="$3"
    
    TOTAL_CHECKS=$((TOTAL_CHECKS + 1))
    
    if [ "$status" = "PASS" ]; then
        echo -e "${GREEN}✅ $check_name: $message${NC}"
        CHECKS_PASSED=$((CHECKS_PASSED + 1))
    elif [ "$status" = "WARN" ]; then
        echo -e "${YELLOW}⚠️  $check_name: $message${NC}"
    else
        echo -e "${RED}❌ $check_name: $message${NC}"
        ISSUES_FOUND=$((ISSUES_FOUND + 1))
    fi
}

echo -e "${YELLOW}Starting comprehensive memory system check...${NC}\n"

# Check 1: Critical Memory Files
echo -e "${CYAN}1. Critical Memory Files Check${NC}"
MEMORY_DIR="$BASE_DIR/rMemory/rAgentMemories"
CRITICAL_FILES=("memory.json" "handoff.json" "tasks.json" "preferences.json")

for file in "${CRITICAL_FILES[@]}"; do
    if [ -f "$MEMORY_DIR/$file" ]; then
        # Check file size (should be > 100 bytes)
        size=$(wc -c < "$MEMORY_DIR/$file")
        if [ "$size" -gt 100 ]; then
            log_check "File: $file" "PASS" "Present and valid ($size bytes)"
        else
            log_check "File: $file" "FAIL" "Too small ($size bytes)"
        fi
    else
        log_check "File: $file" "FAIL" "Missing"
    fi
done

# Check 2: Persistent Memory System
echo -e "\n${CYAN}2. Persistent Memory System${NC}"
if [ -f "$BASE_DIR/rEngine/persistent-memory.json" ]; then
    # Test memory sync manager
    if node "$BASE_DIR/rEngine/memory-sync-manager.js" health >/dev/null 2>&1; then
        log_check "Memory Sync Manager" "PASS" "Health check successful"
    else
        log_check "Memory Sync Manager" "FAIL" "Health check failed"
    fi
else
    log_check "Persistent Memory" "FAIL" "persistent-memory.json missing"
fi

# Check 3: MCP Memory Integration
echo -e "\n${CYAN}3. MCP Memory Integration${NC}"
if pgrep -f "mcp.*memory" >/dev/null; then
    log_check "MCP Memory Server" "PASS" "Process running"
else
    log_check "MCP Memory Server" "WARN" "No MCP memory process detected"
fi

# Check 4: Memory Health Monitor
echo -e "\n${CYAN}4. Memory Health Monitor${NC}"
if [ -f "$BASE_DIR/rEngine/memory-health-monitor.js" ]; then
    if node "$BASE_DIR/rEngine/memory-health-monitor.js" --quick-check >/dev/null 2>&1; then
        log_check "Health Monitor" "PASS" "Monitor functional"
    else
        log_check "Health Monitor" "WARN" "Monitor script present but check failed"
    fi
else
    log_check "Health Monitor" "FAIL" "Monitor script missing"
fi

# Check 5: Memory File Ages
echo -e "\n${CYAN}5. Memory File Freshness${NC}"
CURRENT_TIME=$(date +%s)
HOUR_AGO=$((CURRENT_TIME - 3600))
DAY_AGO=$((CURRENT_TIME - 86400))

for file in "$MEMORY_DIR"/*.json; do
    if [ -f "$file" ]; then
        filename=$(basename "$file")
        file_time=$(stat -f %m "$file" 2>/dev/null || stat -c %Y "$file" 2>/dev/null)
        
        if [ "$file_time" -gt "$HOUR_AGO" ]; then
            log_check "Freshness: $filename" "PASS" "Updated within last hour"
        elif [ "$file_time" -gt "$DAY_AGO" ]; then
            log_check "Freshness: $filename" "WARN" "Updated within last day"
        else
            log_check "Freshness: $filename" "FAIL" "Stale (>24 hours old)"
        fi
    fi
done

# Check 6: Smart Scribe Memory Integration
echo -e "\n${CYAN}6. Smart Scribe Memory Integration${NC}"
if [ -f "$BASE_DIR/rEngine/scribe-mcp-export.json" ]; then
    log_check "Scribe Export" "PASS" "Export file present"
else
    log_check "Scribe Export" "WARN" "No pending scribe export"
fi

# Check 7: Memory Logs
echo -e "\n${CYAN}7. Memory System Logs${NC}"
LOG_DIR="$BASE_DIR/logs"
if [ -d "$LOG_DIR" ]; then
    log_check "Log Directory" "PASS" "Present"
    
    # Check for recent memory-related logs
    if find "$LOG_DIR" -name "*memory*" -mtime -1 | grep -q .; then
        log_check "Memory Logs" "PASS" "Recent memory logs found"
    else
        log_check "Memory Logs" "WARN" "No recent memory logs"
    fi
else
    log_check "Log Directory" "FAIL" "Missing"
fi

# Check 8: Test Memory Operations
echo -e "\n${CYAN}8. Memory Operations Test${NC}"
if [ -f "$BASE_DIR/rEngine/test-memory.js" ]; then
    if node "$BASE_DIR/rEngine/test-memory.js" >/dev/null 2>&1; then
        log_check "Memory Test" "PASS" "Operations working"
    else
        log_check "Memory Test" "FAIL" "Operations failed"
    fi
else
    log_check "Memory Test" "WARN" "Test script missing"
fi

# Summary
echo -e "\n${CYAN}=================================${NC}"
echo -e "${BLUE}Memory Check Protocol Results${NC}"
echo -e "${CYAN}=================================${NC}"

if [ "$ISSUES_FOUND" -eq 0 ]; then
    echo -e "${GREEN}🎉 All memory systems healthy!${NC}"
    echo -e "${GREEN}✅ Checks passed: $CHECKS_PASSED/$TOTAL_CHECKS${NC}"
    exit 0
elif [ "$ISSUES_FOUND" -le 2 ]; then
    echo -e "${YELLOW}⚠️  Minor issues detected${NC}"
    echo -e "${YELLOW}✅ Checks passed: $CHECKS_PASSED/$TOTAL_CHECKS${NC}"
    echo -e "${YELLOW}❌ Issues found: $ISSUES_FOUND${NC}"
    exit 1
else
    echo -e "${RED}❌ Significant memory system issues detected${NC}"
    echo -e "${RED}✅ Checks passed: $CHECKS_PASSED/$TOTAL_CHECKS${NC}"
    echo -e "${RED}❌ Issues found: $ISSUES_FOUND${NC}"
    echo -e "\n${YELLOW}Recommended actions:${NC}"
    echo -e "  1. Run: ./quick-start.sh to reinitialize systems"
    echo -e "  2. Check: node rEngine/memory-sync-manager.js health"
    echo -e "  3. Verify: MCP servers are running"
    exit 2
fi
