#!/bin/bash

# Docker Installation Requirement Check
# Part of rEngine Platform v2.1.0 startup sequence

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Print functions
print_header() {
    echo -e "${CYAN}================================${NC}"
    echo -e "${CYAN}  rEngine Platform Docker Check${NC}"
    echo -e "${CYAN}================================${NC}"
    echo ""
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Main check function
check_docker_installation() {
    print_header
    
    echo "Checking Docker installation requirements..."
    echo ""
    
    # Check if Docker command exists
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed!"
        echo ""
        echo -e "${YELLOW}🐳 Docker Desktop Installation Required${NC}"
        echo ""
        echo "rEngine Platform requires Docker for:"
        echo "  • Eliminating macOS script execution prompts"
        echo "  • Professional multi-service architecture"
        echo "  • Production-ready deployment foundation"
        echo "  • Consistent development environment"
        echo ""
        echo -e "${CYAN}Installation Options:${NC}"
        echo ""
        echo "1. Download Docker Desktop:"
        echo "   https://www.docker.com/products/docker-desktop/"
        echo ""
        echo "2. Install via Homebrew:"
        echo "   brew install --cask docker"
        echo ""
        echo "3. Install via MacPorts:"
        echo "   sudo port install docker-desktop"
        echo ""
        echo -e "${YELLOW}After installation:${NC}"
        echo "  1. Launch Docker Desktop application"
        echo "  2. Complete the setup wizard"
        echo "  3. Ensure Docker is running (whale icon in menu bar)"
        echo "  4. Re-run this script to verify installation"
        echo ""
        echo -e "${RED}⛔ Cannot proceed without Docker installed${NC}"
        exit 1
    fi
    
    print_success "Docker command found"
    
    # Check if Docker daemon is running
    if ! docker info &> /dev/null; then
        print_error "Docker Desktop is not running!"
        echo ""
        echo -e "${YELLOW}🚀 Please start Docker Desktop:${NC}"
        echo "  1. Launch Docker Desktop application"
        echo "  2. Wait for it to fully start (whale icon should be steady)"
        echo "  3. You should see 'Docker Desktop is running' status"
        echo ""
        echo "Then re-run this script to continue."
        exit 1
    fi
    
    print_success "Docker daemon is running"
    
    # Get Docker version info
    DOCKER_VERSION=$(docker --version | cut -d' ' -f3 | cut -d',' -f1)
    print_info "Docker version: $DOCKER_VERSION"
    
    # Check Docker Compose
    if docker compose version &> /dev/null; then
        COMPOSE_VERSION=$(docker compose version --short 2>/dev/null || echo "unknown")
        print_success "Docker Compose available (v$COMPOSE_VERSION)"
    elif docker-compose --version &> /dev/null; then
        COMPOSE_VERSION=$(docker-compose --version | cut -d' ' -f3 | cut -d',' -f1)
        print_warning "Using legacy docker-compose (v$COMPOSE_VERSION)"
        print_info "Consider upgrading to Docker Compose V2"
    else
        print_error "Docker Compose not found!"
        echo ""
        echo "Docker Compose is required for rEngine Platform."
        echo "Please update Docker Desktop to the latest version."
        exit 1
    fi
    
    # Check available resources
    echo ""
    echo -e "${BLUE}📊 Docker Resource Check:${NC}"
    
    # Get system info
    TOTAL_CPU=$(sysctl -n hw.ncpu)
    TOTAL_RAM_BYTES=$(sysctl -n hw.memsize)
    TOTAL_RAM_GB=$((TOTAL_RAM_BYTES / 1024 / 1024 / 1024))
    
    echo "  💻 System CPU cores: $TOTAL_CPU"
    echo "  🧠 System RAM: ${TOTAL_RAM_GB}GB"
    
    # Resource recommendations
    if [ "$TOTAL_RAM_GB" -lt 8 ]; then
        print_warning "Recommend 8GB+ RAM for optimal performance"
    else
        print_success "Sufficient RAM available"
    fi
    
    if [ "$TOTAL_CPU" -lt 4 ]; then
        print_warning "Recommend 4+ CPU cores for optimal performance"
    else
        print_success "Sufficient CPU cores available"
    fi
    
    # Check disk space
    AVAILABLE_SPACE=$(df -h . | awk 'NR==2{print $4}' | sed 's/G.*//')
    if [ "${AVAILABLE_SPACE%.*}" -lt 10 ]; then
        print_warning "Low disk space (${AVAILABLE_SPACE}GB). Recommend 10GB+ free space"
    else
        print_success "Sufficient disk space available (${AVAILABLE_SPACE}GB)"
    fi
    
    echo ""
    print_success "All Docker requirements satisfied!"
    echo ""
    echo -e "${CYAN}🚀 Ready to launch rEngine Platform containers!${NC}"
    echo ""
    echo "Next steps:"
    echo "  ./docker-dev.sh start    # Start development environment"
    echo "  ./docker-dev.sh status   # Check container status"
    echo "  ./docker-dev.sh logs     # View container logs"
    echo ""
    
    return 0
}

# Execute the check
check_docker_installation
