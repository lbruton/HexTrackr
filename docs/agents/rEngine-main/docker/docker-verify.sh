#!/bin/bash

# rEngine Platform Docker Setup Verification
# Quick test to ensure Docker environment is working correctly

echo "🐳 rEngine Platform Docker Setup Verification"
echo "============================================="

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

success() { echo -e "${GREEN}✅ $1${NC}"; }
warning() { echo -e "${YELLOW}⚠️  $1${NC}"; }
error() { echo -e "${RED}❌ $1${NC}"; }

# Check Docker
echo "1. Checking Docker availability..."
if command -v docker &> /dev/null && docker info &> /dev/null; then
    success "Docker is installed and running"
    docker --version
else
    error "Docker is not available. Please install Docker Desktop."
    exit 1
fi

# Check Docker Compose
echo -e "\n2. Checking Docker Compose..."
if command -v docker-compose &> /dev/null; then
    success "Docker Compose is available"
    docker-compose --version
else
    error "Docker Compose not found"
    exit 1
fi

# Check VS Code
echo -e "\n3. Checking VS Code..."
if command -v code &> /dev/null; then
    success "VS Code CLI is available"
else
    warning "VS Code CLI not found (optional for manual setup)"
fi

# Check project files
echo -e "\n4. Checking project structure..."
files=("Dockerfile" "docker-compose.yml" ".devcontainer/devcontainer.json" "docker-dev.sh")
for file in "${files[@]}"; do
    if [ -f "$file" ] || [ -d "$file" ]; then
        success "$file exists"
    else
        error "$file missing"
    fi
done

# Check package.json files
echo -e "\n5. Checking package.json files..."
packages=("package.json" "rEngine/package.json" "rEngineMCP/package.json")
for pkg in "${packages[@]}"; do
    if [ -f "$pkg" ]; then
        success "$pkg exists"
    else
        error "$pkg missing"
    fi
done

# Test build (dry run)
echo -e "\n6. Testing Docker build (dry run)..."
if docker-compose config &> /dev/null; then
    success "Docker Compose configuration is valid"
else
    error "Docker Compose configuration has errors"
fi

echo -e "\n🎯 Setup Verification Complete!"
echo -e "\nNext steps:"
echo "1. Run: ./docker-dev.sh start"
echo "2. Open VS Code: ./docker-dev.sh vscode"
echo "3. Select 'Reopen in Container' when prompted"
echo "4. Start developing without script prompts! 🚀"
