#!/bin/bash
# Protocol Validation Script - Verify all rEngine services are working together
# Usage: ./validate-protocol-stack.sh [--verbose|--silent|--fix]

cd "$(dirname "$0")"

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

VERBOSE=false
SILENT=false
FIX_ISSUES=false

# Parse arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --verbose)
            VERBOSE=true
            shift
            ;;
        --silent)
            SILENT=true
            shift
            ;;
        --fix)
            FIX_ISSUES=true
            shift
            ;;
        --help)
            echo -e "${CYAN}Protocol Stack Validation${NC}"
            echo -e "Usage: $0 [--verbose|--silent|--fix]"
            echo ""
            echo -e "${YELLOW}Options:${NC}"
            echo -e "  --verbose    Show detailed validation steps"
            echo -e "  --silent     Minimal output (exit codes only)"
            echo -e "  --fix        Attempt to fix issues automatically"
            echo -e "  --help       Show this help message"
            echo ""
            echo -e "${YELLOW}Exit Codes:${NC}"
            echo -e "  0    All validations passed"
            echo -e "  1    Minor issues detected"
            echo -e "  2    Major issues detected"
            echo -e "  3    Critical system failure"
            exit 0
            ;;
        *)
            echo -e "${RED}Unknown option: $1${NC}"
            exit 1
            ;;
    esac
done

# Logging functions
log_info() {
    if [ "$SILENT" = false ]; then
        echo -e "$1"
    fi
}

log_verbose() {
    if [ "$VERBOSE" = true ]; then
        echo -e "   $1"
    fi
}

log_error() {
    echo -e "$1" >&2
}

# Validation tracking
TOTAL_CHECKS=0
PASSED_CHECKS=0
FAILED_CHECKS=0
ISSUES=()

# Validation function
validate_service() {
    local service_name="$1"
    local check_command="$2"
    local fix_command="$3"
    local critical="${4:-false}"
    
    ((TOTAL_CHECKS++))
    log_verbose "${YELLOW}Checking $service_name...${NC}"
    
    if eval "$check_command"; then
        ((PASSED_CHECKS++))
        log_verbose "${GREEN}✅ $service_name: OK${NC}"
        return 0
    else
        ((FAILED_CHECKS++))
        ISSUES+=("$service_name")
        
        if [ "$critical" = true ]; then
            log_error "${RED}❌ $service_name: CRITICAL FAILURE${NC}"
        else
            log_verbose "${YELLOW}⚠️  $service_name: Issues detected${NC}"
        fi
        
        if [ "$FIX_ISSUES" = true ] && [ -n "$fix_command" ]; then
            log_verbose "${CYAN}   Attempting to fix $service_name...${NC}"
            if eval "$fix_command"; then
                log_verbose "${GREEN}   ✅ $service_name: Fixed${NC}"
                ((PASSED_CHECKS++))
                ((FAILED_CHECKS--))
                # Remove from issues array
                ISSUES=("${ISSUES[@]/$service_name}")
                return 0
            else
                log_verbose "${RED}   ❌ Failed to fix $service_name${NC}"
            fi
        fi
        
        return 1
    fi
}

# Start validation
if [ "$SILENT" = false ]; then
    echo -e "${CYAN}🔍 rEngine Protocol Stack Validation${NC}"
    echo -e "========================================"
fi

# 1. Docker Services Validation
log_info "${BLUE}📊 Docker Services:${NC}"
validate_service "Docker Daemon" \
    "docker info &>/dev/null" \
    "open -a Docker" \
    true

validate_service "Docker Compose Services" \
    "docker-compose ps --filter 'status=running' | grep -q 'rengine'" \
    "docker-compose up -d"

validate_service "Container Health" \
    "docker-compose ps --filter 'status=running' --format '{{.State}}' | grep -qv Restarting" \
    "docker-compose restart"

# 2. Ollama Service Validation
log_info "${BLUE}🦙 Ollama Service:${NC}"
validate_service "Ollama Process" \
    "pgrep -f 'ollama' &>/dev/null" \
    "ollama serve &"

validate_service "Ollama Responsiveness" \
    "curl -s http://localhost:11434/api/version &>/dev/null" \
    "pkill -f ollama && sleep 2 && ollama serve &"

validate_service "Ollama Models" \
    "ollama list | grep -q 'llama'" \
    "ollama pull llama3.1:8b"

# 3. MCP Server Validation
log_info "${BLUE}🔌 MCP Server:${NC}"
validate_service "MCP Server Process" \
    "pgrep -f 'mcp-server' &>/dev/null || docker-compose ps | grep -q mcp-server" \
    "bash /Volumes/DATA/GitHub/rEngine/rEngine/start-mcp-servers.sh &"

validate_service "MCP Server Responsiveness" \
    "docker-compose ps --filter 'name=mcp-server' --filter 'status=running' | grep -q mcp-server" \
    "docker-compose restart mcp-server"

# 4. Memory System Validation
log_info "${BLUE}🧠 Memory System:${NC}"
validate_service "Memory Files Present" \
    "[ -f './persistent-memory.json' ]" \
    "echo '{\"context\":[],\"entities\":{},\"last_sync\":\"\"}' > './persistent-memory.json'"

validate_service "Memory File Integrity" \
    "jq empty './persistent-memory.json' 2>/dev/null" \
    "cp './persistent-memory.json' './persistent-memory.json.backup' && echo '{\"context\":[],\"entities\":{},\"last_sync\":\"\"}' > './persistent-memory.json'"

validate_service "Memory Directory Structure" \
    "[ -d './rMemory' ] && [ -d './rMemory/search-matrix' ]" \
    "mkdir -p ./rMemory/search-matrix"

validate_service "Memory Sync Functionality" \
    "[ -f '/Volumes/DATA/GitHub/rEngine/rEngine/memory-sync-automation.sh' ]" \
    ""

# 5. Enhanced Scribe Console Validation
log_info "${BLUE}📝 Enhanced Scribe Console:${NC}"
validate_service "Scribe Console Script" \
    "[ -f './rEngine/enhanced-scribe-console.js' ]" \
    ""

validate_service "Node.js Runtime" \
    "command -v node >/dev/null 2>&1" \
    ""

validate_service "Scribe Process (Optional)" \
    "pgrep -f 'enhanced-scribe-console' &>/dev/null" \
    ""

# 6. Protocol Files Validation  
log_info "${BLUE}📋 Protocol Files:${NC}"
validate_service "Protocol Directory" \
    "[ -d './rProtocols' ]" \
    ""

validate_service "Core Protocol Files" \
    "[ -f './rProtocols/rEngine_startup_protocol.md' ] && [ -f './rProtocols/memory_management_protocol.md' ]" \
    ""

validate_service "Startup Scripts" \
    "[ -f './quick-start.sh' ] && [ -x './quick-start.sh' ]" \
    "chmod +x ./quick-start.sh"

# 7. Network and Connectivity
log_info "${BLUE}🌐 Network & Connectivity:${NC}"
validate_service "Internet Connectivity" \
    "curl -s --connect-timeout 5 https://google.com &>/dev/null" \
    ""

validate_service "Docker Network" \
    "docker network ls | grep -q rengine" \
    "docker network create rengine_default"

validate_service "Port Availability" \
    "! lsof -i :11434 | grep -v ollama &>/dev/null || curl -s http://localhost:11434/api/version &>/dev/null" \
    ""

# Results Summary
log_info ""
log_info "${CYAN}📋 Validation Summary:${NC}"
log_info "========================================"
log_info "Total Checks: ${CYAN}$TOTAL_CHECKS${NC}"
log_info "Passed: ${GREEN}$PASSED_CHECKS${NC}"
log_info "Failed: ${RED}$FAILED_CHECKS${NC}"

if [ ${#ISSUES[@]} -gt 0 ]; then
    log_info ""
    log_info "${YELLOW}⚠️  Issues Detected:${NC}"
    for issue in "${ISSUES[@]}"; do
        if [ -n "$issue" ]; then
            log_info "   • $issue"
        fi
    done
fi

# Determine overall health and exit code
if [ $FAILED_CHECKS -eq 0 ]; then
    log_info ""
    log_info "${GREEN}🎉 All validations passed! System is healthy.${NC}"
    exit 0
elif [ $FAILED_CHECKS -le 2 ]; then
    log_info ""
    log_info "${YELLOW}⚠️  Minor issues detected. System functional with degraded performance.${NC}"
    if [ "$FIX_ISSUES" = false ]; then
        log_info "${CYAN}💡 Tip: Run with --fix to attempt automatic repairs${NC}"
    fi
    exit 1
elif [ $FAILED_CHECKS -le 5 ]; then
    log_info ""
    log_info "${RED}❌ Major issues detected. System may be unstable.${NC}"
    log_info "${CYAN}💡 Recommended: Run './emergency-recovery.sh --auto'${NC}"
    exit 2
else
    log_error ""
    log_error "${RED}💥 Critical system failure detected!${NC}"
    log_error "${CYAN}💡 Recommended: Run './emergency-recovery.sh --full'${NC}"
    exit 3
fi
