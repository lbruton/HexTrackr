#!/bin/bash

# rEngine Platform Docker Management Script
# Provides easy commands for Docker-based development

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# Function to print colored output
print_status() {
    echo -e "${BLUE}[rEngine Docker]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Docker is running
check_docker() {
    if ! docker info > /dev/null 2>&1; then
        print_error "Docker is not running. Please start Docker Desktop."
        exit 1
    fi
}

# Build all containers
build() {
    print_status "Building rEngine Platform containers..."
    docker-compose build --no-cache
    print_success "All containers built successfully!"
}

# Start development environment
start() {
    print_status "Starting rEngine Platform development environment..."
    check_docker
    
    # Create necessary directories
    mkdir -p logs rMemory/memory-scribe/logs
    
    # Start services
    docker-compose up -d
    
    print_status "Waiting for services to be ready..."
    sleep 10
    
    # Check service health
    check_health
    
    print_success "rEngine Platform is running!"
    echo ""
    echo "🌐 StackTrackr App:     http://localhost:3033"
    echo "🤖 rEngine Platform:   http://localhost:3034" 
    echo "🧠 MCP Server:         http://localhost:3036"
    echo "🔧 Development Shell:  docker-compose exec development bash"
    echo "🔀 nginx Proxy:        http://localhost:3032"
    echo ""
    echo "📋 Dashboard:          http://localhost:3033/developmentstatus.html"
    echo "📊 Logs:               docker-compose logs -f"
}

# Stop all services
stop() {
    print_status "Stopping rEngine Platform..."
    docker-compose down
    print_success "All services stopped."
}

# Restart all services
restart() {
    print_status "Restarting rEngine Platform..."
    stop
    sleep 2
    start
}

# Check health of all services
check_health() {
    print_status "Checking service health..."
    
    services=("stacktrackr-app:3033" "rengine-platform:3034" "mcp-server:3036")
    
    for service in "${services[@]}"; do
        name=$(echo $service | cut -d: -f1)
        port=$(echo $service | cut -d: -f2)
        
        if curl -f -s "http://localhost:$port" > /dev/null; then
            print_success "$name is healthy (port $port)"
        else
            print_warning "$name may not be ready yet (port $port)"
        fi
    done
}

# View logs
logs() {
    service=${1:-""}
    if [ -z "$service" ]; then
        print_status "Showing logs for all services..."
        docker-compose logs -f
    else
        print_status "Showing logs for $service..."
        docker-compose logs -f "$service"
    fi
}

# Open development shell
shell() {
    print_status "Opening development shell..."
    docker-compose exec development bash
}

# Run VS Code in container
vscode() {
    print_status "Opening VS Code in development container..."
    if command -v code &> /dev/null; then
        code .
        print_success "VS Code should open with dev container support."
        print_status "Select 'Reopen in Container' when prompted."
    else
        print_error "VS Code 'code' command not found. Please install VS Code CLI."
    fi
}

# Clean up Docker resources
clean() {
    print_warning "This will remove all rEngine containers, images, and volumes."
    read -p "Are you sure? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        print_status "Cleaning up Docker resources..."
        docker-compose down -v --rmi all
        docker system prune -f
        print_success "Cleanup complete."
    else
        print_status "Cleanup cancelled."
    fi
}

# Update containers
update() {
    print_status "Updating rEngine Platform..."
    docker-compose pull
    build
    restart
    print_success "Update complete!"
}

# Show status
status() {
    print_status "rEngine Platform Status:"
    echo ""
    docker-compose ps
    echo ""
    check_health
}

# Backup data
backup() {
    timestamp=$(date +"%Y%m%d_%H%M%S")
    backup_dir="backups/docker_backup_$timestamp"
    
    print_status "Creating backup: $backup_dir"
    mkdir -p "$backup_dir"
    
    # Backup volumes
    docker run --rm -v "$(pwd)":/backup -v rengine_mcp_data:/data alpine tar czf /backup/"$backup_dir"/mcp_data.tar.gz -C /data .
    
    # Backup configuration
    cp -r rMemory "$backup_dir/"
    cp docker-compose.yml "$backup_dir/"
    cp .env "$backup_dir/" 2>/dev/null || true
    
    print_success "Backup created: $backup_dir"
}

# Show help
help() {
    echo "rEngine Platform Docker Management"
    echo ""
    echo "Usage: $0 [command]"
    echo ""
    echo "Commands:"
    echo "  build     Build all containers"
    echo "  start     Start development environment"
    echo "  stop      Stop all services"
    echo "  restart   Restart all services"
    echo "  status    Show service status"
    echo "  health    Check service health"
    echo "  logs      View logs (optionally specify service)"
    echo "  shell     Open development shell"
    echo "  vscode    Open VS Code in container"
    echo "  update    Update and rebuild containers"
    echo "  backup    Backup data and configuration"
    echo "  clean     Remove all containers and data"
    echo "  help      Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 start          # Start all services"
    echo "  $0 logs rengine   # View rEngine logs"
    echo "  $0 shell          # Open development shell"
    echo "  $0 vscode         # Open VS Code"
}

# Main command handler
case "${1:-help}" in
    build)
        build
        ;;
    start)
        start
        ;;
    stop)
        stop
        ;;
    restart)
        restart
        ;;
    status)
        status
        ;;
    health)
        check_health
        ;;
    logs)
        logs "$2"
        ;;
    shell)
        shell
        ;;
    vscode)
        vscode
        ;;
    update)
        update
        ;;
    backup)
        backup
        ;;
    clean)
        clean
        ;;
    help|--help|-h)
        help
        ;;
    *)
        print_error "Unknown command: $1"
        help
        exit 1
        ;;
esac
