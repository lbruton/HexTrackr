#!/bin/bash
# Emergency Recovery Protocol - Handles specific failure scenarios
# Usage: ./emergency-recovery.sh [--full|--docker|--ollama|--mcp|--memory]

cd "$(dirname "$0")"

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

RECOVERY_MODE="${1:-full}"
RECOVERY_LOG="./logs/recovery-$(date +%Y%m%d_%H%M%S).log"

# Create logs directory
mkdir -p ./logs

log_action() {
    local message="$1"
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    echo "[$timestamp] $message" >> "$RECOVERY_LOG"
    echo -e "$message"
}

# Full system recovery
full_recovery() {
    log_action "${RED}🚨 EMERGENCY: Full system recovery initiated${NC}"
    
    # Kill everything
    log_action "${YELLOW}1/6 Killing all processes...${NC}"
    pkill -f "ollama" 2>/dev/null || true
    pkill -f "mcp-server" 2>/dev/null || true
    pkill -f "enhanced-scribe-console" 2>/dev/null || true
    pkill -f "smart-scribe" 2>/dev/null || true
    sleep 3
    
    # Docker nuclear option
    log_action "${YELLOW}2/6 Docker nuclear cleanup...${NC}"
    docker-compose down --remove-orphans 2>/dev/null || true
    docker system prune -f 2>/dev/null || true
    sleep 2
    
    # Network reset
    log_action "${YELLOW}3/6 Network cleanup...${NC}"
    docker network prune -f 2>/dev/null || true
    
    # Clear locks and temp files
    log_action "${YELLOW}4/6 Clearing locks and temp files...${NC}"
    rm -f ./logs/protocol-state.json 2>/dev/null || true
    rm -f /tmp/ollama-* 2>/dev/null || true
    
    # Memory backup
    log_action "${YELLOW}5/6 Backing up memory state...${NC}"
    if [ -f "./persistent-memory.json" ]; then
        cp "./persistent-memory.json" "./logs/memory-backup-$(date +%Y%m%d_%H%M%S).json"
    fi
    
    # Restart with robust protocol
    log_action "${YELLOW}6/6 Restarting with robust protocol...${NC}"
    sleep 2
    ./robust-startup-protocol.sh
}

# Docker-specific recovery
docker_recovery() {
    log_action "${YELLOW}🐳 Docker recovery initiated${NC}"
    
    # Stop containers gracefully first
    log_action "   Stopping containers gracefully..."
    docker-compose down 2>/dev/null || true
    sleep 3
    
    # Force removal if needed
    if docker ps -q --filter "name=rengine|mcp-server|stacktrackr" | grep -q .; then
        log_action "   Force removing stubborn containers..."
        docker ps -q --filter "name=rengine|mcp-server|stacktrackr" | xargs -r docker kill
        docker ps -aq --filter "name=rengine|mcp-server|stacktrackr" | xargs -r docker rm -f
    fi
    
    # Network cleanup
    log_action "   Cleaning up networks..."
    docker network prune -f
    
    # Restart
    log_action "   Restarting Docker services..."
    docker-compose up -d
    
    # Wait for health
    log_action "   Waiting for services to be healthy..."
    sleep 10
    
    if docker-compose ps --filter "status=running" | grep -q "rengine"; then
        log_action "${GREEN}✅ Docker recovery successful${NC}"
    else
        log_action "${RED}❌ Docker recovery failed${NC}"
        return 1
    fi
}

# Ollama-specific recovery
ollama_recovery() {
    log_action "${YELLOW}🦙 Ollama recovery initiated${NC}"
    
    # Kill Ollama processes
    log_action "   Stopping Ollama processes..."
    pkill -f "ollama" 2>/dev/null || true
    sleep 2
    
    # Clear Ollama temp files
    log_action "   Clearing Ollama temp files..."
    rm -f /tmp/ollama-* 2>/dev/null || true
    
    # Restart Ollama
    log_action "   Starting Ollama service..."
    ollama serve &
    OLLAMA_PID=$!
    
    # Wait for responsiveness
    log_action "   Waiting for Ollama to become responsive..."
    for i in {1..30}; do
        if curl -s http://localhost:11434/api/version &>/dev/null; then
            log_action "${GREEN}✅ Ollama recovery successful${NC}"
            return 0
        fi
        sleep 1
    done
    
    log_action "${RED}❌ Ollama recovery failed${NC}"
    return 1
}

# MCP-specific recovery
mcp_recovery() {
    log_action "${YELLOW}🔌 MCP Server recovery initiated${NC}"
    
    # Kill MCP processes
    log_action "   Stopping MCP processes..."
    pkill -f "mcp-server" 2>/dev/null || true
    sleep 2
    
    # Restart MCP servers
    log_action "   Starting MCP servers..."
    if [ -f "/Volumes/DATA/GitHub/rEngine/rEngine/start-mcp-servers.sh" ]; then
        bash /Volumes/DATA/GitHub/rEngine/rEngine/start-mcp-servers.sh &
        sleep 5
        
        if pgrep -f "mcp-server" &>/dev/null; then
            log_action "${GREEN}✅ MCP recovery successful${NC}"
        else
            log_action "${RED}❌ MCP recovery failed${NC}"
            return 1
        fi
    else
        log_action "${YELLOW}⚠️  MCP start script not found${NC}"
        return 1
    fi
}

# Memory-specific recovery
memory_recovery() {
    log_action "${YELLOW}🧠 Memory system recovery initiated${NC}"
    
    # Backup current memory state
    if [ -f "./persistent-memory.json" ]; then
        log_action "   Backing up current memory..."
        cp "./persistent-memory.json" "./logs/memory-backup-$(date +%Y%m%d_%H%M%S).json"
    fi
    
    # Check memory file integrity
    if [ -f "./persistent-memory.json" ]; then
        if ! jq empty "./persistent-memory.json" 2>/dev/null; then
            log_action "   Memory file corrupted - attempting repair..."
            if [ -f "./logs/memory-backup-"*".json" ]; then
                latest_backup=$(ls -t ./logs/memory-backup-*.json 2>/dev/null | head -1)
                log_action "   Restoring from backup: $latest_backup"
                cp "$latest_backup" "./persistent-memory.json"
            else
                log_action "   No backup found - creating fresh memory file..."
                echo '{"context":[],"entities":{},"last_sync":""}' > "./persistent-memory.json"
            fi
        fi
    else
        log_action "   Memory file missing - creating fresh..."
        echo '{"context":[],"entities":{},"last_sync":""}' > "./persistent-memory.json"
    fi
    
    # Run memory sync
    log_action "   Running memory synchronization..."
    if bash /Volumes/DATA/GitHub/rEngine/rEngine/memory-sync-automation.sh manual; then
        log_action "${GREEN}✅ Memory recovery successful${NC}"
    else
        log_action "${YELLOW}⚠️  Memory sync had issues but continuing...${NC}"
    fi
}

# Auto-detect and fix specific issues
auto_recovery() {
    log_action "${CYAN}🔍 Auto-detecting issues and applying targeted fixes...${NC}"
    
    local issues_found=0
    
    # Check Docker
    if ! docker-compose ps --filter "status=running" 2>/dev/null | grep -q "rengine"; then
        log_action "   Detected: Docker issues"
        docker_recovery
        ((issues_found++))
    fi
    
    # Check Ollama
    if ! (pgrep -f "ollama" &>/dev/null && curl -s http://localhost:11434/api/version &>/dev/null); then
        log_action "   Detected: Ollama issues"
        ollama_recovery
        ((issues_found++))
    fi
    
    # Check MCP
    if ! pgrep -f "mcp-server" &>/dev/null; then
        log_action "   Detected: MCP Server issues"
        mcp_recovery
        ((issues_found++))
    fi
    
    # Check Memory
    if [ ! -f "./persistent-memory.json" ] || ! jq empty "./persistent-memory.json" 2>/dev/null; then
        log_action "   Detected: Memory issues"
        memory_recovery
        ((issues_found++))
    fi
    
    if [ $issues_found -eq 0 ]; then
        log_action "${GREEN}✅ No issues detected - system appears healthy${NC}"
    else
        log_action "${YELLOW}🔧 Applied $issues_found targeted fixes${NC}"
    fi
}

# Display usage
usage() {
    echo -e "${CYAN}Emergency Recovery Protocol${NC}"
    echo -e "Usage: $0 [recovery_mode]"
    echo ""
    echo -e "${YELLOW}Recovery Modes:${NC}"
    echo -e "  --full      Full system recovery (nuclear option)"
    echo -e "  --docker    Docker services recovery"
    echo -e "  --ollama    Ollama service recovery"
    echo -e "  --mcp       MCP server recovery"
    echo -e "  --memory    Memory system recovery"
    echo -e "  --auto      Auto-detect and fix issues (default)"
    echo -e "  --help      Show this help message"
    echo ""
    echo -e "${YELLOW}Examples:${NC}"
    echo -e "  $0 --auto        # Auto-detect and fix issues"
    echo -e "  $0 --docker      # Fix Docker services only"
    echo -e "  $0 --full        # Nuclear option - restart everything"
}

# Make scripts executable
chmod +x "./robust-startup-protocol.sh" 2>/dev/null || true
chmod +x "./monitor-protocol-state.sh" 2>/dev/null || true

# Main execution
echo -e "${CYAN}🚨 rEngine Emergency Recovery Protocol${NC}"
echo -e "Recovery log: ${CYAN}$RECOVERY_LOG${NC}"
echo ""

case "$RECOVERY_MODE" in
    "--full")
        full_recovery
        ;;
    "--docker")
        docker_recovery
        ;;
    "--ollama")
        ollama_recovery
        ;;
    "--mcp")
        mcp_recovery
        ;;
    "--memory")
        memory_recovery
        ;;
    "--auto"|*)
        auto_recovery
        ;;
    "--help")
        usage
        exit 0
        ;;
esac

# Final status check
echo ""
echo -e "${CYAN}📊 Post-recovery system status:${NC}"
./monitor-protocol-state.sh --once
