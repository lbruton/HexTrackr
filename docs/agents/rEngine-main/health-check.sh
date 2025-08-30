#!/bin/bash

# rEngine Health Check System
# Comprehensive monitoring for Docker services and memory systems

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Health check configuration
HEALTH_CHECK_TIMEOUT=5
DOCKER_COMPOSE_FILE="${1:-docker-compose-enhanced.yml}"

echo -e "${BLUE}🏥 rEngine Health Check System${NC}"
echo -e "${BLUE}=================================${NC}"
echo "Timestamp: $(date)"
echo "Docker Compose File: $DOCKER_COMPOSE_FILE"
echo ""

# Function to check if a service is running
check_service_health() {
    local service_name="$1"
    local port="$2"
    local endpoint="$3"
    
    echo -n "Checking $service_name (port $port)... "
    
    # Check if container is running
    if ! docker-compose -f "$DOCKER_COMPOSE_FILE" ps "$service_name" | grep -q "Up"; then
        echo -e "${RED}❌ Container not running${NC}"
        return 1
    fi
    
    # Check if port is responding
    if command -v nc >/dev/null 2>&1; then
        if ! nc -z localhost "$port" 2>/dev/null; then
            echo -e "${YELLOW}⚠️  Container running but port not responding${NC}"
            return 1
        fi
    fi
    
    # Check HTTP endpoint if provided
    if [ -n "$endpoint" ] && command -v curl >/dev/null 2>&1; then
        if ! curl -f -s --max-time "$HEALTH_CHECK_TIMEOUT" "$endpoint" >/dev/null 2>&1; then
            echo -e "${YELLOW}⚠️  Port responding but HTTP endpoint unhealthy${NC}"
            return 1
        fi
    fi
    
    echo -e "${GREEN}✅ Healthy${NC}"
    return 0
}

# Function to check memory system health
check_memory_health() {
    echo -e "${PURPLE}🧠 Memory System Health Check${NC}"
    echo "--------------------------------"
    
    # Check persistent memory file
    if [ -f "./persistent-memory.json" ]; then
        echo -e "Persistent Memory File: ${GREEN}✅ Found${NC}"
        
        # Check if file is valid JSON
        if jq empty ./persistent-memory.json 2>/dev/null; then
            echo -e "Memory File Format: ${GREEN}✅ Valid JSON${NC}"
            
            # Get memory stats
            local memory_size=$(stat -f%z ./persistent-memory.json 2>/dev/null || stat -c%s ./persistent-memory.json 2>/dev/null || echo "unknown")
            echo -e "Memory File Size: ${CYAN}$memory_size bytes${NC}"
            
            # Check for recent updates
            local last_modified
            if command -v stat >/dev/null 2>&1; then
                if [[ "$OSTYPE" == "darwin"* ]]; then
                    last_modified=$(stat -f "%Sm" -t "%Y-%m-%d %H:%M:%S" ./persistent-memory.json)
                else
                    last_modified=$(stat -c "%y" ./persistent-memory.json | cut -d'.' -f1)
                fi
                echo -e "Last Modified: ${CYAN}$last_modified${NC}"
            fi
        else
            echo -e "Memory File Format: ${RED}❌ Invalid JSON${NC}"
        fi
    else
        echo -e "Persistent Memory File: ${RED}❌ Not found${NC}"
    fi
    
    # Check memory directories
    for dir in "rMemory" "rAgents/memory" "memory-backups"; do
        if [ -d "./$dir" ]; then
            echo -e "$dir Directory: ${GREEN}✅ Found${NC}"
        else
            echo -e "$dir Directory: ${YELLOW}⚠️  Not found${NC}"
        fi
    done
    
    echo ""
}

# Function to check Docker system health
check_docker_health() {
    echo -e "${BLUE}🐳 Docker System Health${NC}"
    echo "-------------------------"
    
    # Check Docker daemon
    if ! docker info >/dev/null 2>&1; then
        echo -e "Docker Daemon: ${RED}❌ Not running${NC}"
        return 1
    fi
    echo -e "Docker Daemon: ${GREEN}✅ Running${NC}"
    
    # Check Docker Compose
    if ! command -v docker-compose >/dev/null 2>&1; then
        echo -e "Docker Compose: ${RED}❌ Not installed${NC}"
        return 1
    fi
    echo -e "Docker Compose: ${GREEN}✅ Available${NC}"
    
    # Check if compose file exists
    if [ ! -f "$DOCKER_COMPOSE_FILE" ]; then
        echo -e "Compose File: ${RED}❌ $DOCKER_COMPOSE_FILE not found${NC}"
        return 1
    fi
    echo -e "Compose File: ${GREEN}✅ Found${NC}"
    
    echo ""
}

# Function to show service overview
show_service_overview() {
    echo -e "${CYAN}📊 Service Overview${NC}"
    echo "-------------------"
    
    echo "Docker Compose Services:"
    docker-compose -f "$DOCKER_COMPOSE_FILE" ps --format "table {{.Name}}\t{{.State}}\t{{.Ports}}" 2>/dev/null || echo "No services running"
    
    echo ""
    echo "Container Resource Usage:"
    docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.NetIO}}" 2>/dev/null || echo "No containers running"
    
    echo ""
}

# Function to check network connectivity
check_network_health() {
    echo -e "${GREEN}🌐 Network Connectivity${NC}"
    echo "------------------------"
    
    # Check if rengine network exists
    if docker network ls | grep -q rengine-network; then
        echo -e "rEngine Network: ${GREEN}✅ Exists${NC}"
    else
        echo -e "rEngine Network: ${RED}❌ Not found${NC}"
    fi
    
    # Test internal connectivity between services
    echo "Internal Service Connectivity:"
    # This would require more complex testing, simplified for now
    echo -e "  Service Discovery: ${YELLOW}⚠️  Manual testing required${NC}"
    
    echo ""
}

# Function to generate health report
generate_health_report() {
    local timestamp=$(date +"%Y%m%d_%H%M%S")
    local report_file="./logs/health_report_$timestamp.log"
    
    mkdir -p ./logs
    
    echo "Generating detailed health report..."
    {
        echo "rEngine Health Report"
        echo "Generated: $(date)"
        echo "===================="
        echo ""
        
        # Docker system info
        echo "Docker System Information:"
        docker system info 2>/dev/null || echo "Docker info unavailable"
        echo ""
        
        # Container details
        echo "Container Details:"
        docker-compose -f "$DOCKER_COMPOSE_FILE" ps -a 2>/dev/null || echo "No compose services"
        echo ""
        
        # Container logs (last 50 lines each)
        echo "Recent Container Logs:"
        for container in $(docker-compose -f "$DOCKER_COMPOSE_FILE" ps -q 2>/dev/null); do
            container_name=$(docker inspect --format='{{.Name}}' "$container" | sed 's/^.//')
            echo "--- $container_name ---"
            docker logs --tail=50 "$container" 2>/dev/null || echo "No logs available"
            echo ""
        done
        
        # Memory system details
        echo "Memory System Files:"
        find . -name "*.json" -path "./rMemory/*" -o -path "./memory-backups/*" -o -name "persistent-memory.json" | head -20
        echo ""
        
        # Disk usage
        echo "Disk Usage:"
        du -sh . 2>/dev/null || echo "Disk usage unavailable"
        echo ""
        
    } > "$report_file"
    
    echo -e "Health report saved to: ${CYAN}$report_file${NC}"
    echo ""
}

# Main health check execution
main() {
    # Start with overall system checks
    check_docker_health
    check_memory_health
    
    # Check individual services
    echo -e "${YELLOW}🔍 Service Health Checks${NC}"
    echo "-------------------------"
    
    # Define services to check (using arrays instead of associative array for compatibility)
    services_names=("nginx" "mcp-memory-persistent" "mcp-github" "project-dashboard" "code-executor" "dev-server")
    services_ports=("80" "4041" "4042" "4043" "4044" "4045")
    services_endpoints=("/health" "/health" "/health" "/health" "/health" "")
    
    local healthy_count=0
    local total_count=${#services_names[@]}
    
    for i in "${!services_names[@]}"; do
        local service="${services_names[$i]}"
        local port="${services_ports[$i]}"
        local endpoint="${services_endpoints[$i]}"
        local full_endpoint=""
        
        if [ -n "$endpoint" ]; then
            full_endpoint="http://localhost:$port$endpoint"
        fi
        
        if check_service_health "$service" "$port" "$full_endpoint"; then
            ((healthy_count++))
        fi
    done
    
    echo ""
    check_network_health
    show_service_overview
    
    # Summary
    echo -e "${PURPLE}📋 Health Check Summary${NC}"
    echo "------------------------"
    echo -e "Services Healthy: ${GREEN}$healthy_count${NC}/${CYAN}$total_count${NC}"
    
    if [ "$healthy_count" -eq "$total_count" ]; then
        echo -e "Overall Status: ${GREEN}✅ All Systems Healthy${NC}"
    elif [ "$healthy_count" -gt 0 ]; then
        echo -e "Overall Status: ${YELLOW}⚠️  Partial Systems Healthy${NC}"
    else
        echo -e "Overall Status: ${RED}❌ System Issues Detected${NC}"
    fi
    
    echo ""
    echo -e "${BLUE}💡 Quick Actions:${NC}"
    echo "  Start services: docker-compose -f $DOCKER_COMPOSE_FILE up -d"
    echo "  View logs: docker-compose -f $DOCKER_COMPOSE_FILE logs -f [service]"
    echo "  Restart service: docker-compose -f $DOCKER_COMPOSE_FILE restart [service]"
    echo "  Generate report: $0 --report"
    
    # Generate report if requested
    if [ "$1" = "--report" ] || [ "$2" = "--report" ]; then
        echo ""
        generate_health_report
    fi
}

# Execute main function
main "$@"
