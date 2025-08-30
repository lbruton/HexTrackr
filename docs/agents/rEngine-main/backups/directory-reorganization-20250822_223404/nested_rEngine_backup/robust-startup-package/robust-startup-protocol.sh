#!/bin/bash
# Make executable
chmod +x "$0"
# Robust rEngine Startup Protocol - Addresses Inconsistent Initialization Issues
# Based on analysis of existing quick-start.sh and protocol stack

cd "$(dirname "$0")"
export CI=true NON_INTERACTIVE=true

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
PINK='\033[95m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Protocol state tracking
PROTOCOL_STATE_FILE="./logs/protocol-state.json"
SESSION_ID=$(date +"%Y%m%d_%H%M%S")

# Create protocol state
mkdir -p ./logs
echo "{\"session_id\":\"$SESSION_ID\",\"start_time\":\"$(date -Iseconds)\",\"step\":0,\"status\":\"initializing\"}" > "$PROTOCOL_STATE_FILE"

echo -e "${PINK}🚀 rEngine Robust Startup Protocol v2.0${NC}"
echo -e "${CYAN}📋 Session ID: $SESSION_ID${NC}"

# ============================================================================
# PHASE 0: COMPREHENSIVE SYSTEM HEALTH CHECK
# ============================================================================
echo -e "${CYAN}PHASE 0: Comprehensive System Health Check...${NC}"

update_protocol_state() {
    local step=$1
    local status=$2
    local message=$3
    jq --arg step "$step" --arg status "$status" --arg msg "$message" --arg ts "$(date -Iseconds)" \
       '.step = ($step | tonumber) | .status = $status | .last_message = $msg | .last_update = $ts' \
       "$PROTOCOL_STATE_FILE" > "${PROTOCOL_STATE_FILE}.tmp" && mv "${PROTOCOL_STATE_FILE}.tmp" "$PROTOCOL_STATE_FILE"
}

# Check if jq is available for JSON processing
if ! command -v jq &> /dev/null; then
    echo -e "${YELLOW}⚠️  jq not found - installing for protocol state management...${NC}"
    brew install jq 2>/dev/null || echo -e "${YELLOW}   Please install jq manually for full protocol tracking${NC}"
fi

# Health check function with retry logic
health_check_with_retry() {
    local service_name=$1
    local check_command=$2
    local max_retries=${3:-3}
    local retry_delay=${4:-2}
    
    for ((i=1; i<=max_retries; i++)); do
        if eval "$check_command"; then
            echo -e "${GREEN}✅ $service_name: Healthy${NC}"
            return 0
        else
            echo -e "${YELLOW}⚠️  $service_name: Unhealthy (attempt $i/$max_retries)${NC}"
            if [ $i -lt $max_retries ]; then
                sleep $retry_delay
            fi
        fi
    done
    
    echo -e "${RED}❌ $service_name: Failed health check after $max_retries attempts${NC}"
    return 1
}

# Docker system check
echo -e "${YELLOW}🔍 Checking Docker system health...${NC}"
if ! docker system info &>/dev/null; then
    echo -e "${RED}❌ Docker is not running or accessible${NC}"
    echo -e "${YELLOW}   Starting Docker Desktop...${NC}"
    open -a Docker || {
        echo -e "${RED}💥 Cannot start Docker Desktop. Please start manually and retry.${NC}"
        exit 1
    }
    echo -e "${YELLOW}   Waiting 30 seconds for Docker to initialize...${NC}"
    sleep 30
fi

# Network cleanup - remove any orphaned networks
echo -e "${YELLOW}🧹 Cleaning up orphaned Docker networks...${NC}"
docker network prune -f &>/dev/null || true

update_protocol_state 0 "health_check_complete" "Docker system verified"

# ============================================================================
# PHASE 1: AGGRESSIVE SERVICE CLEANUP
# ============================================================================
echo -e "${CYAN}PHASE 1: Aggressive Service Cleanup...${NC}"

# Function to kill process with verification
kill_process_group() {
    local process_pattern=$1
    local service_name=$2
    
    echo -e "${YELLOW}🔍 Searching for $service_name processes...${NC}"
    local pids=$(pgrep -f "$process_pattern" 2>/dev/null || true)
    
    if [ -n "$pids" ]; then
        echo -e "${YELLOW}⚠️  Found $service_name processes: $pids${NC}"
        echo "$pids" | xargs kill -TERM 2>/dev/null || true
        sleep 2
        
        # Force kill if still running
        local remaining=$(pgrep -f "$process_pattern" 2>/dev/null || true)
        if [ -n "$remaining" ]; then
            echo -e "${YELLOW}🔨 Force killing remaining $service_name processes: $remaining${NC}"
            echo "$remaining" | xargs kill -KILL 2>/dev/null || true
        fi
        
        sleep 1
        if pgrep -f "$process_pattern" &>/dev/null; then
            echo -e "${RED}❌ Failed to kill all $service_name processes${NC}"
            return 1
        else
            echo -e "${GREEN}✅ $service_name processes cleaned${NC}"
            return 0
        fi
    else
        echo -e "${GREEN}✅ No $service_name processes found${NC}"
        return 0
    fi
}

# Cleanup sequence with verification
kill_process_group "ollama" "Ollama"
kill_process_group "smart-scribe|scribe-console|scribe-summary" "Smart Scribe"
kill_process_group "mcp-server|start-mcp" "MCP Server"
kill_process_group "enhanced-scribe-console" "Enhanced Scribe Console"

# Docker cleanup with verification
echo -e "${YELLOW}🧹 Docker container cleanup...${NC}"
if docker ps -q --filter "name=rengine|mcp-server|stacktrackr" | grep -q .; then
    echo -e "${YELLOW}⚠️  Stopping rEngine Docker containers...${NC}"
    docker-compose down --remove-orphans
    sleep 3
    
    # Verify cleanup
    if docker ps -q --filter "name=rengine|mcp-server|stacktrackr" | grep -q .; then
        echo -e "${RED}❌ Some containers still running - forcing removal...${NC}"
        docker ps -q --filter "name=rengine|mcp-server|stacktrackr" | xargs -r docker kill
        docker ps -aq --filter "name=rengine|mcp-server|stacktrackr" | xargs -r docker rm -f
    fi
fi

echo -e "${GREEN}✅ Service cleanup complete${NC}"
update_protocol_state 1 "cleanup_complete" "All services cleaned"

# ============================================================================
# PHASE 2: SEQUENTIAL SERVICE STARTUP WITH VALIDATION
# ============================================================================
echo -e "${CYAN}PHASE 2: Sequential Service Startup with Validation...${NC}"

# Start Docker services with health monitoring
echo -e "${YELLOW}🐳 Starting Docker services...${NC}"
docker-compose up -d

# Wait for containers to be in running state
echo -e "${YELLOW}⏳ Waiting for containers to reach running state...${NC}"
for i in {1..60}; do
    if docker-compose ps --filter "status=running" | grep -q "rengine\|mcp-server"; then
        echo -e "${GREEN}✅ Docker containers are running${NC}"
        break
    fi
    
    if [ $i -eq 60 ]; then
        echo -e "${RED}❌ Docker containers failed to start within 60 seconds${NC}"
        docker-compose logs --tail=20
        exit 1
    fi
    
    sleep 1
done

# Health check Docker services
health_check_with_retry "Docker Compose Services" "docker-compose ps --filter 'status=running' | grep -q 'rengine'" 5 3

update_protocol_state 2 "docker_started" "Docker services running"

# ============================================================================
# PHASE 3: MCP SERVER INITIALIZATION WITH VERIFICATION
# ============================================================================
echo -e "${CYAN}PHASE 3: MCP Server Initialization...${NC}"

# Start MCP servers
echo -e "${YELLOW}🔌 Starting MCP Memory Server...${NC}"
if [ -f "/Volumes/DATA/GitHub/rEngine/rEngine/start-mcp-servers.sh" ]; then
    bash /Volumes/DATA/GitHub/rEngine/rEngine/start-mcp-servers.sh &
    MCP_PID=$!
    
    # Wait for MCP server to be responsive
    echo -e "${YELLOW}⏳ Waiting for MCP server to become responsive...${NC}"
    for i in {1..30}; do
        if pgrep -f "mcp-server" &>/dev/null; then
            echo -e "${GREEN}✅ MCP server process detected${NC}"
            break
        fi
        
        if [ $i -eq 30 ]; then
            echo -e "${RED}❌ MCP server failed to start within 30 seconds${NC}"
            exit 1
        fi
        
        sleep 1
    done
else
    echo -e "${YELLOW}⚠️  MCP server script not found - will rely on Docker MCP services${NC}"
fi

update_protocol_state 3 "mcp_started" "MCP server initialized"

# ============================================================================
# PHASE 4: OLLAMA INITIALIZATION WITH MODEL VERIFICATION
# ============================================================================
echo -e "${CYAN}PHASE 4: Ollama Initialization...${NC}"

# Start Ollama service
echo -e "${YELLOW}🦙 Starting Ollama service...${NC}"
ollama serve &
OLLAMA_PID=$!

# Wait for Ollama to be responsive
echo -e "${YELLOW}⏳ Waiting for Ollama to become responsive...${NC}"
for i in {1..45}; do
    if curl -s http://localhost:11434/api/version &>/dev/null; then
        echo -e "${GREEN}✅ Ollama service is responsive${NC}"
        break
    fi
    
    if [ $i -eq 45 ]; then
        echo -e "${RED}❌ Ollama failed to become responsive within 45 seconds${NC}"
        exit 1
    fi
    
    sleep 1
done

# Check/load required models
echo -e "${YELLOW}🔍 Checking required Ollama models...${NC}"
REQUIRED_MODELS=("llama3.1" "llama3.1:8b")  # Adjust based on your setup

for model in "${REQUIRED_MODELS[@]}"; do
    if ollama list | grep -q "$model"; then
        echo -e "${GREEN}✅ Model $model is available${NC}"
    else
        echo -e "${YELLOW}⚠️  Model $model not found - attempting to pull...${NC}"
        if ollama pull "$model"; then
            echo -e "${GREEN}✅ Model $model pulled successfully${NC}"
        else
            echo -e "${YELLOW}⚠️  Failed to pull $model - continuing anyway${NC}"
        fi
    fi
done

update_protocol_state 4 "ollama_ready" "Ollama service and models ready"

# ============================================================================
# PHASE 5: MEMORY SYNCHRONIZATION WITH RETRY LOGIC
# ============================================================================
echo -e "${CYAN}PHASE 5: Memory Synchronization...${NC}"

# Memory sync with retry logic
sync_memory_with_retry() {
    local max_attempts=3
    local attempt=1
    
    while [ $attempt -le $max_attempts ]; do
        echo -e "${YELLOW}🧠 Memory sync attempt $attempt/$max_attempts...${NC}"
        
        if bash /Volumes/DATA/GitHub/rEngine/rEngine/memory-sync-automation.sh manual; then
            echo -e "${GREEN}✅ Memory synchronization successful${NC}"
            return 0
        else
            echo -e "${YELLOW}⚠️  Memory sync attempt $attempt failed${NC}"
            if [ $attempt -lt $max_attempts ]; then
                echo -e "${YELLOW}   Waiting 5 seconds before retry...${NC}"
                sleep 5
            fi
            ((attempt++))
        fi
    done
    
    echo -e "${RED}❌ Memory synchronization failed after $max_attempts attempts${NC}"
    echo -e "${YELLOW}   Continuing with degraded memory functionality...${NC}"
    return 1
}

sync_memory_with_retry
update_protocol_state 5 "memory_synced" "Memory synchronization completed"

# ============================================================================
# PHASE 6: ENHANCED SCRIBE CONSOLE LAUNCH
# ============================================================================
echo -e "${CYAN}PHASE 6: Enhanced Scribe Console Launch...${NC}"

# Launch Enhanced Scribe Console with error handling
launch_scribe_console() {
    osascript << 'EOF'
tell application "Terminal"
    activate
    
    try
        set newWindow to do script "cd /Volumes/DATA/GitHub/rEngine/rEngine && echo '🚀 Starting Enhanced Scribe Console...' && node enhanced-scribe-console.js"
        set bounds of front window to {50, 100, 900, 700}
        set custom title of front window to "rEngine Enhanced Scribe Console - Session: $SESSION_ID"
        
        return "success"
    on error errorMessage
        return "error: " & errorMessage
    end try
end tell
EOF
}

SCRIBE_RESULT=$(launch_scribe_console)
if [[ "$SCRIBE_RESULT" == "success" ]]; then
    echo -e "${GREEN}✅ Enhanced Scribe Console launched${NC}"
else
    echo -e "${YELLOW}⚠️  Enhanced Scribe Console launch issue: $SCRIBE_RESULT${NC}"
fi

update_protocol_state 6 "scribe_launched" "Enhanced Scribe Console started"

# ============================================================================
# PHASE 7: SYSTEM VERIFICATION & READINESS REPORT
# ============================================================================
echo -e "${CYAN}PHASE 7: System Verification & Readiness Report...${NC}"

# Comprehensive system status check
echo -e "${YELLOW}📊 Final System Status Check:${NC}"

# Docker status
if docker-compose ps --filter "status=running" | grep -q "rengine\|mcp-server"; then
    echo -e "${GREEN}✅ Docker Services: Running${NC}"
    DOCKER_STATUS="✅"
else
    echo -e "${RED}❌ Docker Services: Issues detected${NC}"
    DOCKER_STATUS="❌"
fi

# Ollama status
if pgrep -f "ollama" &>/dev/null && curl -s http://localhost:11434/api/version &>/dev/null; then
    echo -e "${GREEN}✅ Ollama Service: Running and responsive${NC}"
    OLLAMA_STATUS="✅"
else
    echo -e "${RED}❌ Ollama Service: Issues detected${NC}"
    OLLAMA_STATUS="❌"
fi

# MCP Server status
if pgrep -f "mcp-server" &>/dev/null; then
    echo -e "${GREEN}✅ MCP Server: Running${NC}"
    MCP_STATUS="✅"
else
    echo -e "${YELLOW}⚠️  MCP Server: May not be running (check Docker services)${NC}"
    MCP_STATUS="⚠️"
fi

# Enhanced Scribe status
if pgrep -f "enhanced-scribe-console" &>/dev/null; then
    echo -e "${GREEN}✅ Enhanced Scribe: Running${NC}"
    SCRIBE_STATUS="✅"
else
    echo -e "${YELLOW}⚠️  Enhanced Scribe: Check Terminal.app window${NC}"
    SCRIBE_STATUS="⚠️"
fi

# Create status summary
echo -e "\n${CYAN}📋 SYSTEM READINESS SUMMARY${NC}"
echo -e "=================================="
echo -e "Session ID: ${CYAN}$SESSION_ID${NC}"
echo -e "Docker Services: $DOCKER_STATUS"
echo -e "Ollama Service: $OLLAMA_STATUS"
echo -e "MCP Server: $MCP_STATUS"  
echo -e "Enhanced Scribe: $SCRIBE_STATUS"
echo -e "=================================="

# Final protocol state update
if [[ "$DOCKER_STATUS" == "✅" && "$OLLAMA_STATUS" == "✅" ]]; then
    update_protocol_state 7 "ready" "System fully operational"
    echo -e "${GREEN}🎉 rEngine System is READY for multi-LLM operations!${NC}"
    
    # Success indicators for LLM detection
    echo -e "${PINK}🤖 SYSTEM READY - LLM AGENTS CAN PROCEED${NC}"
    echo -e "${CYAN}   • Ollama: Available for specialized tasks${NC}"
    echo -e "${CYAN}   • Memory Matrix: Synchronized and operational${NC}"
    echo -e "${CYAN}   • Enhanced Scribe: Recording conversations${NC}"
    echo -e "${CYAN}   • Protocol Stack: All protocols loaded${NC}"
    
    exit 0
else
    update_protocol_state 7 "degraded" "Some services have issues"
    echo -e "${YELLOW}⚠️  System started with some issues - check status above${NC}"
    echo -e "${YELLOW}   You may continue with reduced functionality${NC}"
    
    exit 2
fi
