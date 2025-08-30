#!/bin/bash

# StackTrackr MCP Servers with Health Monitoring
# Manual script with keep-alive and health check functionality
# Protects memory integrity by monitoring server health

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

# Configuration
RENGINE_DIR="/Volumes/DATA/GitHub/rEngine/rEngine"
RENGINE_LOG="$RENGINE_DIR/rengine.log"
MEMORY_LOG="$RENGINE_DIR/memory-server.log"
HEALTH_LOG="$RENGINE_DIR/health-monitor.log"
PID_FILE="$RENGINE_DIR/mcp-monitor.pid"
HEALTH_CHECK_INTERVAL=30  # seconds between health checks
MAX_RESTART_ATTEMPTS=3
RESTART_COOLDOWN=60      # seconds to wait before attempting restart

# Cleanup function
cleanup() {
    echo -e "\n${YELLOW}🧹 Cleaning up monitoring processes...${NC}"
    if [ -f "$PID_FILE" ]; then
        rm -f "$PID_FILE"
    fi
    exit 0
}

# Set up signal handlers
trap cleanup INT TERM

# Function to log with timestamp
log_message() {
    local level="$1"
    local message="$2"
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    echo "[$timestamp] [$level] $message" >> "$HEALTH_LOG"
    echo -e "${BLUE}[$timestamp]${NC} $message"
}

# Function to check if a process is running
is_running() {
    local pattern="$1"
    pgrep -f "$pattern" > /dev/null 2>&1
}

# Function to get process health
check_process_health() {
    local pattern="$1"
    local name="$2"
    
    if is_running "$pattern"; then
        local pid=$(pgrep -f "$pattern" | head -1)
        local cpu=$(ps -p "$pid" -o %cpu= 2>/dev/null | tr -d ' ')
        local mem=$(ps -p "$pid" -o %mem= 2>/dev/null | tr -d ' ')
        echo -e "${GREEN}✅ $name: Running (PID: $pid, CPU: ${cpu}%, MEM: ${mem}%)${NC}"
        return 0
    else
        echo -e "${RED}❌ $name: Not running${NC}"
        return 1
    fi
}

# Function to start rEngineMCP server
start_rengine() {
    log_message "INFO" "🔧 Starting rEngineMCP Server..."
    cd "$RENGINE_DIR"
    nohup node index.js > "$RENGINE_LOG" 2>&1 &
    local pid=$!
    sleep 2
    if is_running "node.*index.js"; then
        log_message "SUCCESS" "✅ rEngineMCP started successfully (PID: $pid)"
        return 0
    else
        log_message "ERROR" "❌ Failed to start rEngineMCP"
        return 1
    fi
}

# Function to start memory MCP server
start_memory() {
    log_message "INFO" "🧠 Starting Memory MCP Server..."
    cd "$RENGINE_DIR"
    nohup npx @modelcontextprotocol/server-memory > "$MEMORY_LOG" 2>&1 &
    local pid=$!
    sleep 2
    if is_running "mcp-server-memory"; then
        log_message "SUCCESS" "✅ Memory MCP started successfully (PID: $pid)"
        return 0
    else
        log_message "ERROR" "❌ Failed to start Memory MCP"
        return 1
    fi
}

# Function to restart a service with attempt tracking
restart_service() {
    local service_name="$1"
    local start_function="$2"
    local attempt_var="$3"
    
    local current_attempts=$(eval "echo \$$attempt_var")
    current_attempts=$((current_attempts + 1))
    eval "$attempt_var=$current_attempts"
    
    if [ $current_attempts -le $MAX_RESTART_ATTEMPTS ]; then
        log_message "WARN" "🔄 Attempting to restart $service_name (attempt $current_attempts/$MAX_RESTART_ATTEMPTS)"
        echo -e "${YELLOW}⚠️  MEMORY AT RISK: $service_name crashed! Attempting restart...${NC}"
        
        # Kill any zombie processes
        pkill -f "$service_name" 2>/dev/null
        sleep 3
        
        # Restart the service
        if $start_function; then
            log_message "SUCCESS" "✅ $service_name restarted successfully"
            eval "$attempt_var=0"  # Reset attempt counter on success
            return 0
        else
            log_message "ERROR" "❌ Failed to restart $service_name"
            return 1
        fi
    else
        log_message "CRITICAL" "🚨 CRITICAL: $service_name failed $MAX_RESTART_ATTEMPTS times. Entering cooldown."
        echo -e "${RED}🚨 CRITICAL: $service_name restart attempts exhausted!${NC}"
        echo -e "${RED}⚠️  MEMORY INTEGRITY AT RISK!${NC}"
        sleep $RESTART_COOLDOWN
        eval "$attempt_var=0"  # Reset after cooldown
        return 1
    fi
}

# Function to perform health monitoring
health_monitor() {
    local rengine_restart_attempts=0
    local memory_restart_attempts=0
    
    log_message "INFO" "🏥 Health monitoring started (check interval: ${HEALTH_CHECK_INTERVAL}s)"
    
    while true; do
        echo -e "\n${PURPLE}🏥 Health Check $(date '+%H:%M:%S')${NC}"
        
        # Check rEngineMCP
        if ! check_process_health "node.*index.js" "rEngineMCP"; then
            log_message "ERROR" "❌ rEngineMCP health check failed"
            restart_service "rEngineMCP" "start_rengine" "rengine_restart_attempts"
        fi
        
        # Check Memory MCP
        if ! check_process_health "mcp-server-memory" "Memory MCP"; then
            log_message "ERROR" "❌ Memory MCP health check failed"
            restart_service "Memory MCP" "start_memory" "memory_restart_attempts"
        fi
        
        # Check log file sizes (prevent disk space issues)
        local rengine_size=$(stat -f%z "$RENGINE_LOG" 2>/dev/null || echo 0)
        local memory_size=$(stat -f%z "$MEMORY_LOG" 2>/dev/null || echo 0)
        
        if [ $rengine_size -gt 100000000 ]; then  # 100MB
            log_message "WARN" "📄 rEngineMCP log file large ($(($rengine_size/1024/1024))MB), consider rotation"
        fi
        
        if [ $memory_size -gt 100000000 ]; then  # 100MB
            log_message "WARN" "📄 Memory MCP log file large ($(($memory_size/1024/1024))MB), consider rotation"
        fi
        
        sleep $HEALTH_CHECK_INTERVAL
    done
}

# Main execution
echo -e "${BLUE}🚀 StackTrackr MCP Servers with Health Monitoring${NC}"
echo -e "${BLUE}📅 Started: $(date)${NC}"

# Store monitor PID
echo $$ > "$PID_FILE"

# Memory file sync check
echo -e "${YELLOW}🔄 Checking memory file synchronization...${NC}"
if [ -f "/Volumes/DATA/GitHub/rEngine/scripts/sync-memory-files.sh" ]; then
    bash /Volumes/DATA/GitHub/rEngine/scripts/sync-memory-files.sh
else
    log_message "WARN" "⚠️  Memory sync script not found, continuing..."
fi

# Initial startup
log_message "INFO" "🚀 Starting MCP servers with monitoring..."

# Start Memory MCP FIRST (required by protocol)
if is_running "mcp-server-memory"; then
    log_message "INFO" "✅ Memory MCP Server already running"
else
    start_memory
fi

# Then start rEngineMCP
if is_running "node.*index.js"; then
    log_message "INFO" "✅ rEngineMCP Server already running"
else
    start_rengine
fi

# Wait for initialization
sleep 3

# Initial health check
echo -e "\n${BLUE}📊 Initial Server Status:${NC}"
check_process_health "node.*index.js" "rEngineMCP"
check_process_health "mcp-server-memory" "Memory MCP"

echo -e "\n${BLUE}📝 Log Files:${NC}"
echo -e "   rEngineMCP: tail -f $RENGINE_LOG"
echo -e "   Memory MCP: tail -f $MEMORY_LOG"
echo -e "   Health Monitor: tail -f $HEALTH_LOG"

echo -e "\n${GREEN}🏥 Starting continuous health monitoring...${NC}"
echo -e "${YELLOW}💡 Press Ctrl+C to stop monitoring and cleanup${NC}"

# Start health monitoring loop
health_monitor
