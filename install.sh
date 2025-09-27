#!/bin/bash

# HexTrackr Cross-Platform Installation Script
# Works on macOS and Linux (Ubuntu/Debian)

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Detect OS
OS="unknown"
if [[ "$OSTYPE" == "darwin"* ]]; then
    OS="macOS"
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    OS="Linux"
    # Check for specific distro
    if [ -f /etc/os-release ]; then
        . /etc/os-release
        DISTRO=$NAME
    fi
fi

echo "🔍 Detected OS: $OS"
if [ "$OS" == "Linux" ] && [ ! -z "$DISTRO" ]; then
    echo "   Distribution: $DISTRO"
fi
echo ""

# Check Docker installation
check_docker() {
    if ! command -v docker &> /dev/null; then
        echo -e "${RED}❌ Docker is not installed${NC}"
        echo ""

        if [ "$OS" == "macOS" ]; then
            echo "Please install Docker Desktop from: https://www.docker.com/products/docker-desktop"
        elif [ "$OS" == "Linux" ]; then
            echo "To install Docker on Ubuntu/Debian, run:"
            echo "  curl -fsSL https://get.docker.com | sh"
            echo "  sudo usermod -aG docker \$USER"
            echo "  (Then log out and back in)"
        fi
        exit 1
    fi

    # Check docker compose
    if ! docker compose version &> /dev/null; then
        if ! docker-compose version &> /dev/null; then
            echo -e "${RED}❌ Docker Compose is not installed${NC}"
            exit 1
        else
            # Use older docker-compose syntax
            DOCKER_COMPOSE="docker-compose"
        fi
    else
        DOCKER_COMPOSE="docker compose"
    fi

    echo -e "${GREEN}✅ Docker is installed${NC}"
    docker version --format 'Docker version {{.Server.Version}}'
    echo ""
}

# Create .env file if it doesn't exist
setup_env() {
    if [ ! -f .env ]; then
        if [ -f .env.example ]; then
            cp .env.example .env
            echo -e "${GREEN}✅ Created .env file from .env.example${NC}"
        else
            # Create basic .env file
            cat > .env <<EOF
NODE_ENV=development
PORT=8080
DATABASE_PATH=app/public/data/hextrackr.db
HEXTRACKR_VERSION=1.0.33
EOF
            echo -e "${GREEN}✅ Created default .env file${NC}"
        fi
    else
        echo -e "${GREEN}✅ .env file already exists${NC}"
    fi
    echo ""
}

# Build and start containers
start_hextrackr() {
    echo "🚀 Building HexTrackr Docker image..."
    $DOCKER_COMPOSE build

    echo ""
    echo "🚀 Starting HexTrackr..."
    $DOCKER_COMPOSE up -d

    # Wait for health check
    echo ""
    echo "⏳ Waiting for application to be ready..."

    for i in {1..30}; do
        if $DOCKER_COMPOSE ps | grep -q "healthy"; then
            echo ""
            echo -e "${GREEN}✅ HexTrackr is ready!${NC}"
            echo ""
            echo "🌐 Access the application at: http://localhost:8989"
            echo "📋 View logs: ./docker-logs.sh"
            echo "🛑 Stop: ./docker-stop.sh"
            echo "🔄 Rebuild: ./docker-rebuild.sh"
            echo ""

            # Show container status
            echo "Container Status:"
            $DOCKER_COMPOSE ps
            exit 0
        fi
        echo -n "."
        sleep 2
    done

    echo ""
    echo -e "${YELLOW}⚠️  Application is taking longer than expected to start${NC}"
    echo "Check logs with: $DOCKER_COMPOSE logs"
    exit 1
}

# Main execution
echo "======================================"
echo "   HexTrackr Installation Script"
echo "======================================"
echo ""

check_docker
setup_env
start_hextrackr