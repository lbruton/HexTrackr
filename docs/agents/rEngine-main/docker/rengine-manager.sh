#!/bin/bash

# rEngine Enhanced Docker Management Script
# Provides comprehensive development environment with MCP servers and project tracking

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Configuration
COMPOSE_FILE_BASIC="docker-compose.yml"
COMPOSE_FILE_ENHANCED="docker-compose-enhanced.yml"
NGINX_CONF_BASIC="docker/nginx.conf"
NGINX_CONF_ENHANCED="docker/nginx-enhanced.conf"

print_banner() {
    echo -e "${CYAN}"
    echo "╔══════════════════════════════════════════════════════════════╗"
    echo "║                  🚀 rEngine Platform Manager                 ║"
    echo "║              Enhanced Development Environment                ║"
    echo "╚══════════════════════════════════════════════════════════════╝"
    echo -e "${NC}"
}

print_usage() {
    echo -e "${YELLOW}Usage: $0 [COMMAND] [OPTIONS]${NC}"
    echo ""
    echo -e "${BLUE}Commands:${NC}"
    echo "  start [basic|enhanced]     - Start Docker services"
    echo "  stop                       - Stop Docker services"
    echo "  restart [basic|enhanced]   - Restart Docker services"
    echo "  status                     - Show service status"
    echo "  logs [service]             - Show logs for all services or specific service"
    echo "  shell [service]            - Open shell in running service"
    echo "  build                      - Build all Docker images"
    echo "  clean                      - Remove all containers and volumes"
    echo "  dashboard                  - Open project dashboard in browser"
    echo "  ports                      - Show all service ports"
    echo "  health                     - Check health of all services"
    echo "  mcp-status                 - Show MCP server status"
    echo ""
    echo -e "${BLUE}Options:${NC}"
    echo "  --detach, -d              - Run in detached mode"
    echo "  --force-recreate          - Force recreate containers"
    echo "  --no-deps                 - Don't start linked services"
    echo ""
    echo -e "${BLUE}Examples:${NC}"
    echo "  $0 start enhanced         - Start with all MCP servers"
    echo "  $0 start basic            - Start basic setup only"
    echo "  $0 logs mcp-github        - Show GitHub MCP server logs"
    echo "  $0 shell development      - Open shell in dev container"
}

check_prerequisites() {
    echo -e "${BLUE}🔍 Checking prerequisites...${NC}"
    
    if ! command -v docker &> /dev/null; then
        echo -e "${RED}❌ Docker is not installed${NC}"
        exit 1
    fi
    
    if ! command -v docker-compose &> /dev/null; then
        echo -e "${RED}❌ Docker Compose is not installed${NC}"
        exit 1
    fi
    
    if [ ! -f "$PROJECT_ROOT/.env" ]; then
        echo -e "${YELLOW}⚠️  .env file not found, creating basic one...${NC}"
        cat > "$PROJECT_ROOT/.env" << EOF
# rEngine Platform Environment Variables
NODE_ENV=development
GITHUB_TOKEN=
MCP_SERVER_HOST=0.0.0.0
MCP_SERVER_PORT=4036
RENGINE_DEBUG=true
EOF
        echo -e "${GREEN}✅ Created basic .env file${NC}"
    fi
    
    echo -e "${GREEN}✅ Prerequisites OK${NC}"
}

select_compose_file() {
    local mode="${1:-enhanced}"
    
    if [ "$mode" = "basic" ]; then
        COMPOSE_FILE="$COMPOSE_FILE_BASIC"
        NGINX_CONF="$NGINX_CONF_BASIC"
        echo -e "${BLUE}📋 Using basic configuration${NC}"
    else
        COMPOSE_FILE="$COMPOSE_FILE_ENHANCED"
        NGINX_CONF="$NGINX_CONF_ENHANCED"
        echo -e "${PURPLE}🚀 Using enhanced configuration with MCP servers${NC}"
    fi
    
    # Update nginx config reference in compose file if needed
    if [ -f "$PROJECT_ROOT/$COMPOSE_FILE" ]; then
        if [ "$mode" = "enhanced" ] && [ -f "$PROJECT_ROOT/$NGINX_CONF_ENHANCED" ]; then
            # Use enhanced nginx config
            export NGINX_CONFIG_PATH="$NGINX_CONF_ENHANCED"
        fi
    fi
}

start_services() {
    local mode="${1:-enhanced}"
    local detach_flag=""
    
    if [[ "$*" == *"--detach"* ]] || [[ "$*" == *"-d"* ]]; then
        detach_flag="-d"
    fi
    
    select_compose_file "$mode"
    
    echo -e "${GREEN}🚀 Starting rEngine Platform ($mode mode)...${NC}"
    
    cd "$PROJECT_ROOT"
    
    if [ "$mode" = "enhanced" ]; then
        echo -e "${PURPLE}🔧 Starting enhanced services:${NC}"
        echo -e "   • Project Dashboard (4046)"
        echo -e "   • Code Executor (4043)"
        echo -e "   • Live Dev Server (4044)"
        echo -e "   • MCP Filesystem (4040)"
        echo -e "   • MCP Memory (4041)"
        echo -e "   • MCP GitHub (4042)"
        echo -e "   • MCP Git (4047)"
        echo -e "   • MCP SQLite (4048)"
    fi
    
    docker-compose -f "$COMPOSE_FILE" up $detach_flag
    
    if [ -n "$detach_flag" ]; then
        echo ""
        echo -e "${GREEN}✅ Services started successfully!${NC}"
        show_access_info "$mode"
    fi
}

stop_services() {
    echo -e "${YELLOW}🛑 Stopping rEngine Platform...${NC}"
    
    cd "$PROJECT_ROOT"
    
    # Try both compose files
    if [ -f "$COMPOSE_FILE_ENHANCED" ]; then
        docker-compose -f "$COMPOSE_FILE_ENHANCED" down 2>/dev/null || true
    fi
    
    if [ -f "$COMPOSE_FILE_BASIC" ]; then
        docker-compose -f "$COMPOSE_FILE_BASIC" down 2>/dev/null || true
    fi
    
    echo -e "${GREEN}✅ Services stopped${NC}"
}

show_status() {
    echo -e "${BLUE}📊 Service Status:${NC}"
    cd "$PROJECT_ROOT"
    
    # Check which compose file is active
    if docker-compose -f "$COMPOSE_FILE_ENHANCED" ps --services 2>/dev/null | grep -q .; then
        docker-compose -f "$COMPOSE_FILE_ENHANCED" ps
    elif docker-compose -f "$COMPOSE_FILE_BASIC" ps --services 2>/dev/null | grep -q .; then
        docker-compose -f "$COMPOSE_FILE_BASIC" ps
    else
        echo -e "${YELLOW}No services are currently running${NC}"
    fi
}

show_logs() {
    local service="$1"
    cd "$PROJECT_ROOT"
    
    if [ -n "$service" ]; then
        echo -e "${BLUE}📋 Logs for $service:${NC}"
        docker-compose -f "$COMPOSE_FILE_ENHANCED" logs -f "$service" 2>/dev/null || \
        docker-compose -f "$COMPOSE_FILE_BASIC" logs -f "$service"
    else
        echo -e "${BLUE}📋 Logs for all services:${NC}"
        docker-compose -f "$COMPOSE_FILE_ENHANCED" logs -f 2>/dev/null || \
        docker-compose -f "$COMPOSE_FILE_BASIC" logs -f
    fi
}

open_shell() {
    local service="${1:-development}"
    echo -e "${BLUE}🐚 Opening shell in $service...${NC}"
    
    cd "$PROJECT_ROOT"
    docker-compose -f "$COMPOSE_FILE_ENHANCED" exec "$service" sh 2>/dev/null || \
    docker-compose -f "$COMPOSE_FILE_BASIC" exec "$service" sh
}

build_images() {
    echo -e "${BLUE}🔨 Building Docker images...${NC}"
    cd "$PROJECT_ROOT"
    docker-compose -f "$COMPOSE_FILE_ENHANCED" build
}

clean_all() {
    echo -e "${RED}🧹 Cleaning up all containers and volumes...${NC}"
    read -p "This will remove all containers and volumes. Continue? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        cd "$PROJECT_ROOT"
        docker-compose -f "$COMPOSE_FILE_ENHANCED" down -v --remove-orphans 2>/dev/null || true
        docker-compose -f "$COMPOSE_FILE_BASIC" down -v --remove-orphans 2>/dev/null || true
        docker system prune -f
        echo -e "${GREEN}✅ Cleanup complete${NC}"
    fi
}

open_dashboard() {
    echo -e "${BLUE}🌐 Opening project dashboard...${NC}"
    
    # Check if services are running
    if ! docker-compose -f "$COMPOSE_FILE_ENHANCED" ps | grep -q "Up"; then
        echo -e "${YELLOW}⚠️  Services don't appear to be running. Starting enhanced mode...${NC}"
        start_services "enhanced" "--detach"
        sleep 5
    fi
    
    # Open dashboard in default browser
    if command -v open &> /dev/null; then
        open "http://localhost:4032"
    elif command -v xdg-open &> /dev/null; then
        xdg-open "http://localhost:4032"
    else
        echo -e "${CYAN}📱 Open http://localhost:4032 in your browser${NC}"
    fi
}

show_ports() {
    echo -e "${BLUE}🔌 Service Ports:${NC}"
    echo ""
    echo -e "${CYAN}Main Access Points:${NC}"
    echo "  🌐 Main Dashboard:     http://localhost:4032"
    echo "  📊 Project Dashboard:  http://localhost:4046"
    echo "  🔥 Live Dev Server:    http://localhost:4044"
    echo "  💻 Code Executor:      http://localhost:4043"
    echo ""
    echo -e "${CYAN}Applications:${NC}"
    echo "  📦 StackTrackr:        http://localhost:4033"
    echo "  🚀 rEngine Platform:   http://localhost:4034"
    echo "  🔧 rEngine Secondary:  http://localhost:4035"
    echo "  🛠️  Development:        http://localhost:4037"
    echo ""
    echo -e "${CYAN}MCP Servers:${NC}"
    echo "  📁 Core MCP:           http://localhost:4036"
    echo "  📂 Filesystem:         http://localhost:4040"
    echo "  🧠 Memory:             http://localhost:4041"
    echo "  🐙 GitHub:             http://localhost:4042"
    echo "  🔀 Git:                http://localhost:4047"
    echo "  🗄️  SQLite:             http://localhost:4048"
    echo "  🎯 Context7:           http://localhost:4049"
    echo "  🎭 Playwright:         http://localhost:4050"
    echo "  📊 TimeSeries:         http://localhost:4051"
}

check_health() {
    echo -e "${BLUE}🏥 Health Check:${NC}"
    
    local services=(
        "4032:Main Gateway"
        "4033:StackTrackr"
        "4034:rEngine Platform"
        "4036:Core MCP Server"
        "4043:Code Executor"
        "4044:Live Dev Server"
        "4046:Project Dashboard"
    )
    
    for service in "${services[@]}"; do
        IFS=':' read -r port name <<< "$service"
        if curl -s "http://localhost:$port" >/dev/null 2>&1; then
            echo -e "  ✅ $name (port $port): ${GREEN}Healthy${NC}"
        else
            echo -e "  ❌ $name (port $port): ${RED}Not responding${NC}"
        fi
    done
}

show_mcp_status() {
    echo -e "${PURPLE}🔌 MCP Server Status:${NC}"
    
    local mcp_servers=(
        "4036:Core MCP Server"
        "4040:Filesystem MCP"
        "4041:Memory MCP"
        "4042:GitHub MCP"
        "4047:Git MCP"
        "4048:SQLite MCP"
        "4049:Context7 MCP"
        "4050:Playwright MCP"
        "4051:TimeSeries MCP"
    )
    
    for server in "${mcp_servers[@]}"; do
        IFS=':' read -r port name <<< "$server"
        if curl -s "http://localhost:$port/health" >/dev/null 2>&1; then
            echo -e "  ✅ $name: ${GREEN}Online${NC}"
        else
            echo -e "  ❌ $name: ${RED}Offline${NC}"
        fi
    done
}

show_access_info() {
    local mode="$1"
    echo ""
    echo -e "${CYAN}╔══════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${CYAN}║                    🎉 rEngine Platform Ready!                ║${NC}"
    echo -e "${CYAN}╚══════════════════════════════════════════════════════════════╝${NC}"
    echo ""
    echo -e "${GREEN}🌐 Main Dashboard: ${BLUE}http://localhost:4032${NC}"
    echo -e "${GREEN}📊 Project Tracking: ${BLUE}http://localhost:4046${NC}"
    
    if [ "$mode" = "enhanced" ]; then
        echo -e "${GREEN}💻 Code Executor: ${BLUE}http://localhost:4043${NC}"
        echo -e "${GREEN}🔥 Live Dev Server: ${BLUE}http://localhost:4044${NC}"
        echo ""
        echo -e "${PURPLE}🔌 MCP Servers Available:${NC}"
        echo -e "   � Filesystem (4040) • 🧠 Memory (4041) • 🐙 GitHub (4042)"
        echo -e "   🔀 Git (4047) • 🗄️ SQLite (4048) • 🎯 Context7 (4049)"
        echo -e "   🎭 Playwright (4050) • 📊 TimeSeries (4051)"
    fi
    
    echo ""
    echo -e "${YELLOW}💡 Quick Commands:${NC}"
    echo -e "   $0 dashboard    # Open main dashboard"
    echo -e "   $0 ports        # Show all ports"
    echo -e "   $0 health       # Check service health"
    echo -e "   $0 logs         # View all logs"
}

# Main script logic
main() {
    print_banner
    
    if [ $# -eq 0 ]; then
        print_usage
        exit 1
    fi
    
    case "$1" in
        start)
            check_prerequisites
            start_services "${2:-enhanced}" "${@:3}"
            ;;
        stop)
            stop_services
            ;;
        restart)
            stop_services
            sleep 2
            start_services "${2:-enhanced}" "${@:3}"
            ;;
        status)
            show_status
            ;;
        logs)
            show_logs "$2"
            ;;
        shell)
            open_shell "$2"
            ;;
        build)
            build_images
            ;;
        clean)
            clean_all
            ;;
        dashboard)
            open_dashboard
            ;;
        ports)
            show_ports
            ;;
        health)
            check_health
            ;;
        mcp-status)
            show_mcp_status
            ;;
        *)
            echo -e "${RED}❌ Unknown command: $1${NC}"
            echo ""
            print_usage
            exit 1
            ;;
    esac
}

# Run main function with all arguments
main "$@"
