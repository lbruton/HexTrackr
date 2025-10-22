#!/bin/bash

# HexTrackr RHEL 9 Installation Script
# Compatible with: RHEL 9.x, CentOS Stream 9, Rocky Linux 9, AlmaLinux 9

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Banner
echo "======================================"
echo "   HexTrackr RHEL 9 Installation"
echo "======================================"
echo ""

# Detect OS
if [[ ! -f /etc/redhat-release ]]; then
    echo -e "${RED}❌ This script requires RHEL/CentOS/Rocky/Alma Linux${NC}"
    echo "For Ubuntu/Debian, use: ./install.sh"
    exit 1
fi

echo -e "${GREEN}🔍 Detected: $(cat /etc/redhat-release)${NC}"
echo ""

# Check if running as root
if [[ $EUID -eq 0 ]]; then
   echo -e "${YELLOW}⚠️  This script should not be run as root${NC}"
   echo "Please run as a regular user with sudo privileges"
   exit 1
fi

# Check sudo access
if ! sudo -v; then
    echo -e "${RED}❌ This script requires sudo privileges${NC}"
    exit 1
fi

# Function to check command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Step 1: Choose Container Runtime
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}Container Runtime Selection${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo "HexTrackr can run with either Docker or Podman:"
echo ""
echo "  [D] Docker CE - Traditional container runtime (requires CentOS repo)"
echo "  [P] Podman    - Red Hat's daemonless alternative (recommended for RHEL)"
echo ""
read -p "Choose container runtime [D/p]: " -n 1 -r
echo ""
CONTAINER_CHOICE=${REPLY:-D}

if [[ $CONTAINER_CHOICE =~ ^[Dd]$ ]]; then
    RUNTIME="docker"
    COMPOSE_CMD="docker compose"
    echo -e "${GREEN}✅ Selected: Docker CE${NC}"
else
    RUNTIME="podman"
    COMPOSE_CMD="podman-compose"
    echo -e "${GREEN}✅ Selected: Podman${NC}"
fi
echo ""

# Step 2: Update system
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}System Update${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo "📦 Updating system packages..."
sudo dnf update -y
echo -e "${GREEN}✅ System updated${NC}"
echo ""

# Step 3: Install Development Tools
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}Development Tools${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo "🔧 Installing Development Tools..."
sudo dnf groupinstall "Development Tools" -y
echo ""
echo "🔧 Installing build dependencies..."
sudo dnf install -y gcc gcc-c++ make python3 python3-devel sqlite-devel git
echo -e "${GREEN}✅ Development tools installed${NC}"
echo ""

# Step 4: Install Node.js
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}Node.js Installation${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

if command_exists node; then
    NODE_VERSION=$(node --version)
    echo -e "${YELLOW}⚠️  Node.js is already installed: ${NODE_VERSION}${NC}"
    read -p "Reinstall Node.js 20 LTS? [y/N]: " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        INSTALL_NODE=true
    else
        INSTALL_NODE=false
    fi
else
    INSTALL_NODE=true
fi

if [[ $INSTALL_NODE == true ]]; then
    echo "📦 Installing Node.js 20 LTS from AppStream..."
    sudo dnf module reset nodejs -y
    sudo dnf module install -y nodejs:20
    echo -e "${GREEN}✅ Node.js installed: $(node --version)${NC}"
else
    echo -e "${GREEN}✅ Using existing Node.js installation${NC}"
fi
echo ""

# Step 5: Install Container Runtime
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}Container Runtime Setup${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

if [[ $RUNTIME == "docker" ]]; then
    if command_exists docker; then
        echo -e "${GREEN}✅ Docker is already installed${NC}"
        docker --version
    else
        echo "📦 Installing Docker CE (using CentOS repository)..."
        sudo dnf install -y dnf-plugins-core
        sudo dnf config-manager --add-repo=https://download.docker.com/linux/centos/docker-ce.repo
        sudo dnf install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

        echo "🔒 Enabling SELinux support for Docker..."
        sudo mkdir -p /etc/docker
        cat <<EOF | sudo tee /etc/docker/daemon.json
{
  "selinux-enabled": true
}
EOF

        echo "🚀 Starting Docker service..."
        sudo systemctl start docker
        sudo systemctl enable docker

        echo "👤 Adding $USER to docker group..."
        sudo usermod -aG docker $USER

        echo -e "${GREEN}✅ Docker installed successfully${NC}"
        echo -e "${YELLOW}⚠️  You must log out and back in for group membership to take effect${NC}"
    fi
else
    if command_exists podman; then
        echo -e "${GREEN}✅ Podman is already installed${NC}"
        podman --version
    else
        echo "📦 Installing Podman..."
        sudo dnf install -y podman podman-compose podman-docker
        echo -e "${GREEN}✅ Podman installed successfully${NC}"
    fi

    echo "🔌 Enabling Podman socket..."
    systemctl --user enable --now podman.socket 2>/dev/null || true

    echo "🔗 Setting up Docker compatibility..."
    if [[ ! -f ~/.bashrc.hextrackr.bak ]]; then
        cp ~/.bashrc ~/.bashrc.hextrackr.bak 2>/dev/null || true
    fi

    if ! grep -q "DOCKER_HOST.*podman" ~/.bashrc; then
        echo 'export DOCKER_HOST=unix:///run/user/$UID/podman/podman.sock' >> ~/.bashrc
        export DOCKER_HOST=unix:///run/user/$UID/podman/podman.sock
        echo -e "${GREEN}✅ Docker compatibility configured${NC}"
    fi
fi
echo ""

# Step 6: Configure SELinux
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}SELinux Configuration${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

SELINUX_STATUS=$(getenforce)
echo "🔒 SELinux status: $SELINUX_STATUS"

if [[ $SELINUX_STATUS == "Enforcing" ]]; then
    echo "🔧 Configuring SELinux contexts for HexTrackr..."

    # Create directories if they don't exist
    mkdir -p app/data app/uploads certs

    # Set SELinux contexts
    sudo semanage fcontext -a -t container_file_t "$(pwd)/app/data(/.*)?" 2>/dev/null || echo "Context already exists for app/data"
    sudo semanage fcontext -a -t container_file_t "$(pwd)/app/uploads(/.*)?" 2>/dev/null || echo "Context already exists for app/uploads"
    sudo semanage fcontext -a -t container_file_t "$(pwd)/certs(/.*)?" 2>/dev/null || echo "Context already exists for certs"

    # Apply contexts
    sudo restorecon -Rv app/data app/uploads certs 2>/dev/null || true

    echo -e "${GREEN}✅ SELinux contexts configured${NC}"
else
    echo -e "${YELLOW}⚠️  SELinux is not enforcing - skipping context configuration${NC}"
fi
echo ""

# Step 7: Configure Firewall
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}Firewall Configuration${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

if systemctl is-active --quiet firewalld; then
    echo "🔥 Configuring firewall rules..."

    sudo firewall-cmd --permanent --zone=public --add-service=http
    sudo firewall-cmd --permanent --zone=public --add-service=https
    sudo firewall-cmd --permanent --zone=public --add-port=8989/tcp
    sudo firewall-cmd --permanent --zone=public --add-port=8443/tcp

    # Add Docker/Podman bridge to trusted zone
    if [[ $RUNTIME == "docker" ]]; then
        sudo firewall-cmd --permanent --zone=trusted --add-interface=docker0 2>/dev/null || echo "docker0 interface not found (will be added on first container start)"
    else
        sudo firewall-cmd --permanent --zone=trusted --add-interface=cni-podman0 2>/dev/null || echo "podman interface not found (will be added on first container start)"
    fi

    sudo firewall-cmd --reload

    echo -e "${GREEN}✅ Firewall configured${NC}"
    echo ""
    echo "Open ports:"
    sudo firewall-cmd --list-ports
else
    echo -e "${YELLOW}⚠️  firewalld is not running - skipping firewall configuration${NC}"
fi
echo ""

# Step 8: Setup Environment
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}Environment Configuration${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

if [[ ! -f .env ]]; then
    if [[ -f .env.example ]]; then
        cp .env.example .env
        echo -e "${GREEN}✅ Created .env from .env.example${NC}"
    else
        cat > .env <<EOF
NODE_ENV=production
PORT=8080
DATABASE_PATH=app/data/hextrackr.db
HEXTRACKR_VERSION=1.0.66
USE_HTTPS=true
SSL_KEY_PATH=/app/certs/key.pem
SSL_CERT_PATH=/app/certs/cert.pem
EOF
        echo -e "${GREEN}✅ Created default .env file${NC}"
    fi

    # Generate SESSION_SECRET
    echo "🔐 Generating secure SESSION_SECRET..."
    SESSION_SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")

    if grep -q "SESSION_SECRET=" .env; then
        sed -i "s/SESSION_SECRET=.*/SESSION_SECRET=${SESSION_SECRET}/" .env
    else
        echo "SESSION_SECRET=${SESSION_SECRET}" >> .env
    fi

    echo -e "${GREEN}✅ SESSION_SECRET configured${NC}"
else
    echo -e "${GREEN}✅ .env file already exists${NC}"
fi
echo ""

# Step 9: SSL Certificate Setup
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}SSL Certificate Setup${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

if [[ ! -f certs/key.pem ]]; then
    echo "🔐 Generating self-signed SSL certificate..."
    mkdir -p certs
    openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
      -keyout certs/key.pem \
      -out certs/cert.pem \
      -subj "/C=US/ST=State/L=City/O=HexTrackr/CN=hextrackr.local"

    chmod 600 certs/key.pem
    chmod 644 certs/cert.pem

    echo -e "${GREEN}✅ SSL certificate generated${NC}"
    echo -e "${YELLOW}⚠️  Using self-signed certificate - browsers will show security warning${NC}"
else
    echo -e "${GREEN}✅ SSL certificate already exists${NC}"
fi
echo ""

# Step 10: Update docker-compose.yml for SELinux
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}Docker Compose Configuration${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

if [[ $SELINUX_STATUS == "Enforcing" ]]; then
    echo "🔧 Checking docker-compose.yml for SELinux volume flags..."

    # Check if :z or :Z flags are already present
    if grep -q ":z\|:Z" docker-compose.yml; then
        echo -e "${GREEN}✅ SELinux volume flags already configured${NC}"
    else
        echo -e "${YELLOW}⚠️  SELinux volume flags not found in docker-compose.yml${NC}"
        echo ""
        echo "To fix permission issues, you should add :z or :Z flags to volume mounts."
        echo "Example:"
        echo "  - ./app/data:/app/app/data:Z    # Private label"
        echo "  - ./app:/app/app:z               # Shared label"
        echo ""
        echo "See docs/RHEL_DEPLOYMENT_GUIDE.md for details"
    fi
else
    echo -e "${YELLOW}⚠️  SELinux not enforcing - volume flags not required${NC}"
fi
echo ""

# Step 11: Build and Start
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}Build and Start HexTrackr${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

echo "🚀 Building HexTrackr Docker image..."
$COMPOSE_CMD build

echo ""
echo "🚀 Starting HexTrackr containers..."
$COMPOSE_CMD up -d

# Step 12: Health Check
echo ""
echo "⏳ Waiting for application to be ready..."
echo ""

HEALTH_URL="https://localhost:8989/health"
MAX_ATTEMPTS=30

for i in $(seq 1 $MAX_ATTEMPTS); do
    if curl -k -s $HEALTH_URL 2>/dev/null | grep -q "ok"; then
        echo ""
        echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
        echo -e "${GREEN}✅ HexTrackr is ready!${NC}"
        echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
        echo ""
        echo "🌐 Access the application at: https://localhost:8989"
        echo "📋 View logs: $COMPOSE_CMD logs -f"
        echo "🛑 Stop: $COMPOSE_CMD down"
        echo "🔄 Restart: $COMPOSE_CMD restart"
        echo ""
        echo "📚 Documentation:"
        echo "   - RHEL Guide: docs/RHEL_DEPLOYMENT_GUIDE.md"
        echo "   - User Guide: https://localhost:8989/docs-html/"
        echo ""

        if [[ $RUNTIME == "docker" ]] && groups $USER | grep -q docker; then
            echo -e "${YELLOW}⚠️  You're in the docker group but may need to log out/in for it to take effect${NC}"
        fi

        if [[ $SELINUX_STATUS == "Enforcing" ]] && ! grep -q ":z\|:Z" docker-compose.yml; then
            echo -e "${YELLOW}⚠️  If you encounter permission issues, add SELinux flags to docker-compose.yml${NC}"
            echo "   See: docs/RHEL_DEPLOYMENT_GUIDE.md (Step 4: SELinux Configuration)"
        fi

        echo ""
        echo "Container Status:"
        $COMPOSE_CMD ps
        echo ""

        exit 0
    fi
    echo -n "."
    sleep 2
done

echo ""
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${YELLOW}⚠️  Application is taking longer than expected to start${NC}"
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo "Troubleshooting steps:"
echo ""
echo "1. Check container logs:"
echo "   $COMPOSE_CMD logs"
echo ""
echo "2. Check SELinux denials:"
echo "   sudo ausearch -m avc -ts recent"
echo ""
echo "3. Check firewall status:"
echo "   sudo firewall-cmd --list-all"
echo ""
echo "4. Verify containers are running:"
echo "   $COMPOSE_CMD ps"
echo ""
echo "See docs/RHEL_DEPLOYMENT_GUIDE.md for detailed troubleshooting"
echo ""

exit 1
