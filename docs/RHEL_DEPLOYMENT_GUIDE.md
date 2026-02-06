# RHEL 9 Deployment Guide for HexTrackr

**Last Updated**: 2025-10-16
**Target OS**: Red Hat Enterprise Linux 9.x
**Tested On**: RHEL 10.0 (current production)

---

## Overview

This guide provides detailed instructions for deploying HexTrackr on Red Hat Enterprise Linux (RHEL) 9. While HexTrackr has been successfully deployed on Ubuntu Server 24.04 LTS, deploying on RHEL requires several platform-specific considerations.

### Key Differences from Ubuntu

| Component | Ubuntu 24.04 | RHEL 9 |
|-----------|--------------|--------|
| **Package Manager** | APT (`apt`, `apt-get`) | DNF/YUM (`dnf`, `yum`) |
| **Container Runtime** | Docker CE | Podman (default) or Docker CE |
| **Security Module** | AppArmor (permissive) | SELinux (enforcing) |
| **Firewall** | UFW / iptables | firewalld (zone-based) |
| **Build Tools Group** | `build-essential` | `Development Tools` |
| **Node.js Source** | NodeSource PPA | AppStream modules / NodeSource RPM |
| **SQLite Dev Package** | `libsqlite3-dev` | `sqlite-devel` |

---

## Prerequisites

### System Requirements

- **RHEL 9.x** (9.0, 9.1, 9.2, 9.3, or 9.4)
- **Subscription**: Active RHEL subscription OR use CentOS Stream 9 / Rocky Linux 9 / AlmaLinux 9 (free alternatives)
- **RAM**: 4GB recommended (2GB minimum)
- **Storage**: 20GB free space
- **Network**: Ports 80, 443, 8080, 8443 accessible

### Check RHEL Version

```bash
cat /etc/redhat-release
# Expected output: Red Hat Enterprise Linux release 9.x (Plow)
```

---

## Installation Methods

### Option 1: Docker CE on RHEL 9 (Recommended if Docker experience exists)

**Note**: Docker CE is not officially supported on RHEL 9. You must use the CentOS repository.

#### Step 1: Install Prerequisites

```bash
# Update system
sudo dnf update -y

# Install required packages
sudo dnf install -y dnf-plugins-core
```

#### Step 2: Add Docker Repository

```bash
# Add Docker CE repository (using CentOS repo)
sudo dnf config-manager --add-repo=https://download.docker.com/linux/centos/docker-ce.repo
```

#### Step 3: Install Docker

```bash
# Install Docker CE
sudo dnf install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

# Start and enable Docker
sudo systemctl start docker
sudo systemctl enable docker

# Add user to docker group (logout/login required)
sudo usermod -aG docker $USER
```

#### Step 4: Enable Docker with SELinux

```bash
# Enable SELinux support for Docker (CRITICAL)
sudo mkdir -p /etc/docker
cat <<EOF | sudo tee /etc/docker/daemon.json
{
  "selinux-enabled": true
}
EOF

# Restart Docker
sudo systemctl restart docker
```

---

### Option 2: Podman on RHEL 9 (Red Hat's Recommended Approach)

**Podman** is the default container runtime for RHEL 9 and doesn't require a daemon.

#### Step 1: Install Podman

```bash
# Podman is usually pre-installed on RHEL 9
sudo dnf install -y podman podman-compose

# Verify installation
podman --version
```

#### Step 2: Docker Compose Compatibility

Podman 4.1+ supports Docker Compose natively:

```bash
# Create podman-docker alias
sudo dnf install -y podman-docker

# Verify docker command now works with Podman
docker --version  # Should show Podman version
```

#### Step 3: Enable Podman Socket (for docker-compose compatibility)

```bash
# Enable Podman socket for rootless mode
systemctl --user enable podman.socket
systemctl --user start podman.socket

# Or for system-wide (requires root)
sudo systemctl enable podman.socket
sudo systemctl start podman.socket
```

---

## Application Dependencies

### Step 1: Install Development Tools

```bash
# Install Development Tools group (equivalent to Ubuntu's build-essential)
sudo dnf groupinstall "Development Tools" -y

# Install additional build dependencies
sudo dnf install -y gcc gcc-c++ make python3 python3-devel sqlite-devel
```

**Package Mappings**:
- Ubuntu `build-essential` → RHEL `Development Tools` group
- Ubuntu `python3` → RHEL `python3` (same)
- Ubuntu `libsqlite3-dev` → RHEL `sqlite-devel`
- Ubuntu `g++` → RHEL `gcc-c++`

### Step 2: Install Node.js

**Option A: Using AppStream Modules (Recommended for RHEL 9)**

```bash
# Reset any existing nodejs module
sudo dnf module reset nodejs -y

# Install Node.js 20 LTS from AppStream
sudo dnf module install -y nodejs:20

# Verify installation
node --version  # Should show v20.x.x
npm --version
```

**Option B: Using NodeSource Repository (for specific versions)**

```bash
# Install Node.js 18 LTS
curl -sL https://rpm.nodesource.com/setup_18.x | sudo bash -
sudo dnf install -y nodejs

# OR Node.js 20 LTS
curl -sL https://rpm.nodesource.com/setup_20.x | sudo bash -
sudo dnf install -y nodejs

# Verify
node --version
```

**HexTrackr Requirement**: Node.js 22.x LTS (current production version)

---

## Deploy HexTrackr

### Step 1: Clone Repository

```bash
# Install git if not present
sudo dnf install -y git

# Clone HexTrackr
cd /opt  # or your preferred location
sudo git clone https://github.com/lbruton/HexTrackr.git
cd HexTrackr
```

### Step 2: Set Proper Ownership

```bash
# Change ownership to your user
sudo chown -R $USER:$USER /opt/HexTrackr
```

### Step 3: Configure Environment

```bash
# Copy environment template
cp .env.example .env

# Edit .env file
vim .env
```

**Required .env Variables**:
```bash
NODE_ENV=production
PORT=8080
DATABASE_PATH=app/data/hextrackr.db
HEXTRACKR_VERSION=1.0.66
SESSION_SECRET=<generate-32-char-random-string>
USE_HTTPS=true
SSL_KEY_PATH=/app/certs/key.pem
SSL_CERT_PATH=/app/certs/cert.pem
```

**Generate SESSION_SECRET**:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Step 4: SELinux Configuration (CRITICAL!)

SELinux will block Docker volume mounts by default. You must configure proper contexts.

#### Method 1: Use :Z Flag in docker-compose.yml (Recommended)

Edit `docker-compose.yml` and add `:Z` or `:z` to volume mounts:

```yaml
volumes:
  # Add :z (shared) for volumes accessed by multiple containers
  - ./app:/app/app:z
  - ./config:/app/config:ro,z

  # Add :Z (private) for single-container volumes
  - ./app/data:/app/app/data:Z
  - ./app/uploads:/app/app/uploads:Z
  - ./certs:/app/certs:ro,Z
```

**Difference between :z and :Z**:
- `:z` - Shared label (multiple containers can access)
- `:Z` - Private unshared label (single container only)

#### Method 2: Set SELinux Context Manually

```bash
# Set container_file_t context for Docker volumes
sudo semanage fcontext -a -t container_file_t "/opt/HexTrackr/app/data(/.*)?"
sudo semanage fcontext -a -t container_file_t "/opt/HexTrackr/app/uploads(/.*)?"
sudo semanage fcontext -a -t container_file_t "/opt/HexTrackr/certs(/.*)?"

# Apply the context
sudo restorecon -Rv /opt/HexTrackr/app/data
sudo restorecon -Rv /opt/HexTrackr/app/uploads
sudo restorecon -Rv /opt/HexTrackr/certs
```

#### Method 3: Temporary Permissive Mode (Testing Only)

```bash
# Set SELinux to permissive mode (NOT RECOMMENDED FOR PRODUCTION)
sudo setenforce 0

# To re-enable enforcing mode
sudo setenforce 1

# Check current mode
getenforce
```

### Step 5: Configure Firewall

RHEL 9 uses `firewalld` instead of Ubuntu's `ufw`.

```bash
# Check firewalld status
sudo systemctl status firewalld

# Open required ports
sudo firewall-cmd --permanent --zone=public --add-service=http
sudo firewall-cmd --permanent --zone=public --add-service=https
sudo firewall-cmd --permanent --zone=public --add-port=8989/tcp
sudo firewall-cmd --permanent --zone=public --add-port=8443/tcp

# Trust Docker bridge interface
sudo firewall-cmd --permanent --zone=trusted --add-interface=docker0

# Reload firewall
sudo firewall-cmd --reload

# Verify rules
sudo firewall-cmd --list-all
```

**Important**: If using Podman, the bridge interface may be named differently (e.g., `cni-podman0`).

### Step 6: SSL Certificate Setup

```bash
# Create certs directory
mkdir -p certs

# Generate self-signed certificate (development/testing)
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout certs/key.pem \
  -out certs/cert.pem \
  -subj "/C=US/ST=State/L=City/O=Organization/CN=hextrackr.local"

# Set proper permissions
chmod 600 certs/key.pem
chmod 644 certs/cert.pem
```

### Step 7: Build and Start

#### Using Docker Compose

```bash
# Build containers
docker-compose build

# Start application
docker-compose up -d

# Check status
docker-compose ps

# View logs
docker-compose logs -f
```

#### Using Podman Compose

```bash
# Build containers
podman-compose build

# Start application
podman-compose up -d

# Check status
podman-compose ps

# View logs
podman-compose logs -f
```

### Step 8: Verify Deployment

```bash
# Check container health
docker-compose ps  # or podman-compose ps

# Test health endpoint
curl -k https://localhost:8989/health

# Expected response: {"status":"ok"}
```

---

## Troubleshooting

### Issue 1: Permission Denied on Volume Mounts

**Symptom**: `Error: EACCES: permission denied` in container logs

**Solution**: SELinux is blocking access. Apply `:Z` or `:z` flags:

```bash
# Check SELinux denials
sudo ausearch -m avc -ts recent

# Apply volume labels (choose one method)
# Method A: Update docker-compose.yml with :Z/:z flags
# Method B: Set SELinux context manually (see Step 4)
```

### Issue 2: Cannot Install better-sqlite3

**Symptom**: `npm install` fails with "Cannot find module better-sqlite3"

**Solution**: Install build dependencies:

```bash
# Install all required build tools
sudo dnf install -y gcc gcc-c++ make python3 python3-devel sqlite-devel

# Rebuild native modules
cd /opt/HexTrackr
npm rebuild better-sqlite3
```

### Issue 3: Firewall Blocks Connections

**Symptom**: Cannot access HexTrackr from browser

**Solution**: Check firewalld rules:

```bash
# List all open ports
sudo firewall-cmd --list-all

# Add missing ports
sudo firewall-cmd --permanent --add-port=8989/tcp
sudo firewall-cmd --reload

# Check if Docker bypass is needed
sudo firewall-cmd --permanent --direct --add-rule ipv4 filter INPUT 0 -p tcp --dport 8989 -j ACCEPT
sudo firewall-cmd --reload
```

### Issue 4: Docker Daemon Won't Start

**Symptom**: `Cannot connect to the Docker daemon`

**Solution**: Check daemon status and logs:

```bash
# Check Docker service
sudo systemctl status docker

# View Docker logs
sudo journalctl -u docker -f

# Restart Docker
sudo systemctl restart docker

# Check SELinux audit log
sudo ausearch -m avc -c dockerd
```

### Issue 5: Podman vs Docker Compatibility

**Symptom**: `docker-compose` not working with Podman

**Solution**: Install podman-docker shim:

```bash
# Install Docker CLI compatibility
sudo dnf install -y podman-docker

# Enable Podman socket
systemctl --user enable --now podman.socket

# Export Docker host variable
export DOCKER_HOST=unix:///run/user/$UID/podman/podman.sock

# Add to ~/.bashrc for persistence
echo 'export DOCKER_HOST=unix:///run/user/$UID/podman/podman.sock' >> ~/.bashrc
```

---

## Performance Considerations

### Database Optimization

HexTrackr uses SQLite with optimized PRAGMA settings. On RHEL, ensure:

```bash
# Check filesystem mount options
mount | grep /opt

# For best performance, ensure noatime is set
sudo mount -o remount,noatime /opt
```

### Memory Allocation

HexTrackr allocates 4GB heap by default (NODE_OPTIONS in docker-compose.yml):

```yaml
environment:
  - NODE_OPTIONS=--max-old-space-size=4096  # 4GB heap
```

Adjust based on your RHEL VM resources.

---

## RHEL-Specific Installation Script

Create `/opt/HexTrackr/install-rhel.sh`:

```bash
#!/bin/bash
# HexTrackr RHEL 9 Installation Script

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Check RHEL version
if [[ ! -f /etc/redhat-release ]]; then
    echo -e "${RED}This script requires RHEL/CentOS/Rocky/Alma Linux${NC}"
    exit 1
fi

echo "🔍 Detected: $(cat /etc/redhat-release)"

# Install Docker or Podman
echo ""
read -p "Install Docker (d) or use Podman (p)? [d/P]: " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Dd]$ ]]; then
    echo "📦 Installing Docker CE..."
    sudo dnf install -y dnf-plugins-core
    sudo dnf config-manager --add-repo=https://download.docker.com/linux/centos/docker-ce.repo
    sudo dnf install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

    # Enable SELinux for Docker
    sudo mkdir -p /etc/docker
    echo '{"selinux-enabled": true}' | sudo tee /etc/docker/daemon.json

    sudo systemctl start docker
    sudo systemctl enable docker
    sudo usermod -aG docker $USER

    COMPOSE_CMD="docker compose"
else
    echo "📦 Using Podman..."
    sudo dnf install -y podman podman-compose podman-docker
    systemctl --user enable --now podman.socket

    COMPOSE_CMD="podman-compose"
fi

# Install development tools
echo ""
echo "🔧 Installing development tools..."
sudo dnf groupinstall "Development Tools" -y
sudo dnf install -y gcc gcc-c++ make python3 python3-devel sqlite-devel git

# Install Node.js
echo ""
echo "📦 Installing Node.js 20 LTS..."
sudo dnf module reset nodejs -y
sudo dnf module install -y nodejs:20

# Setup environment
echo ""
echo "⚙️ Setting up environment..."
if [[ ! -f .env ]]; then
    cp .env.example .env

    # Generate SESSION_SECRET
    SESSION_SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
    sed -i "s/your-secret-key-here/${SESSION_SECRET}/" .env

    echo -e "${GREEN}✅ Created .env file${NC}"
fi

# Configure SELinux
echo ""
echo "🔒 Configuring SELinux contexts..."
sudo semanage fcontext -a -t container_file_t "$(pwd)/app/data(/.*)?" 2>/dev/null || true
sudo semanage fcontext -a -t container_file_t "$(pwd)/app/uploads(/.*)?" 2>/dev/null || true
sudo semanage fcontext -a -t container_file_t "$(pwd)/certs(/.*)?" 2>/dev/null || true
sudo restorecon -Rv app/data app/uploads certs 2>/dev/null || true

# Configure firewall
echo ""
echo "🔥 Configuring firewall..."
if systemctl is-active --quiet firewalld; then
    sudo firewall-cmd --permanent --zone=public --add-service=http
    sudo firewall-cmd --permanent --zone=public --add-service=https
    sudo firewall-cmd --permanent --zone=public --add-port=8989/tcp
    sudo firewall-cmd --permanent --zone=public --add-port=8443/tcp
    sudo firewall-cmd --reload
    echo -e "${GREEN}✅ Firewall configured${NC}"
fi

# Generate SSL certificates
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
fi

# Build and start
echo ""
echo "🚀 Building HexTrackr..."
$COMPOSE_CMD build

echo ""
echo "🚀 Starting HexTrackr..."
$COMPOSE_CMD up -d

# Wait for health check
echo ""
echo "⏳ Waiting for application to be ready..."
for i in {1..30}; do
    if curl -k -s https://localhost:8989/health | grep -q "ok"; then
        echo ""
        echo -e "${GREEN}✅ HexTrackr is ready!${NC}"
        echo ""
        echo "🌐 Access at: https://localhost:8989"
        echo "📋 View logs: $COMPOSE_CMD logs -f"
        echo "🛑 Stop: $COMPOSE_CMD down"
        exit 0
    fi
    echo -n "."
    sleep 2
done

echo ""
echo -e "${YELLOW}⚠️  Application is taking longer than expected${NC}"
echo "Check logs: $COMPOSE_CMD logs"
exit 1
```

Make it executable:

```bash
chmod +x install-rhel.sh
./install-rhel.sh
```

---

## Comparison: Ubuntu vs RHEL Commands

### Package Management

| Task | Ubuntu | RHEL 9 |
|------|--------|--------|
| Update packages | `sudo apt update` | `sudo dnf update` |
| Install package | `sudo apt install <pkg>` | `sudo dnf install <pkg>` |
| Search packages | `apt search <name>` | `dnf search <name>` |
| Remove package | `sudo apt remove <pkg>` | `sudo dnf remove <pkg>` |
| List installed | `dpkg -l` | `dnf list installed` |
| Install build tools | `sudo apt install build-essential` | `sudo dnf groupinstall "Development Tools"` |

### Firewall

| Task | Ubuntu (UFW) | RHEL 9 (firewalld) |
|------|--------------|-------------------|
| Enable firewall | `sudo ufw enable` | `sudo systemctl start firewalld` |
| Allow port | `sudo ufw allow 8989/tcp` | `sudo firewall-cmd --permanent --add-port=8989/tcp` |
| Allow service | `sudo ufw allow http` | `sudo firewall-cmd --permanent --add-service=http` |
| Reload | `sudo ufw reload` | `sudo firewall-cmd --reload` |
| Status | `sudo ufw status` | `sudo firewall-cmd --list-all` |

### SELinux vs AppArmor

| Task | Ubuntu (AppArmor) | RHEL 9 (SELinux) |
|------|-------------------|------------------|
| Check status | `sudo aa-status` | `getenforce` |
| Permissive mode | `sudo aa-complain /path` | `sudo setenforce 0` |
| Enforcing mode | `sudo aa-enforce /path` | `sudo setenforce 1` |
| View denials | `sudo dmesg \| grep apparmor` | `sudo ausearch -m avc -ts recent` |
| Set context | N/A | `sudo chcon -t container_file_t /path` |

---

## Production Deployment Checklist

- [ ] RHEL subscription activated (or using free alternative)
- [ ] All system packages updated (`dnf update -y`)
- [ ] Development Tools group installed
- [ ] Node.js 18+ installed and verified
- [ ] Docker CE or Podman installed and running
- [ ] SELinux contexts configured for volume mounts
- [ ] Firewall rules added and reloaded
- [ ] SSL certificates generated (or valid certs installed)
- [ ] `.env` file configured with strong SESSION_SECRET
- [ ] HexTrackr containers built successfully
- [ ] Application accessible at https://localhost:8989
- [ ] Health endpoint returns `{"status":"ok"}`
- [ ] Database initializes without errors
- [ ] WebSocket connections working
- [ ] CSV import functionality tested

---

## Additional Resources

### Official Documentation

- **RHEL 9 Documentation**: https://docs.redhat.com/en/rhel/9
- **Podman Documentation**: https://docs.podman.io/
- **Firewalld Guide**: https://firewalld.org/documentation/
- **SELinux User Guide**: https://access.redhat.com/documentation/en-us/red_hat_enterprise_linux/9/html/using_selinux/

### HexTrackr Documentation

- **Main README**: `/README.md`
- **Ubuntu Deployment**: `/docs/DEPLOYMENT_WORKFLOW.md`
- **Environment Architecture**: `/docs/ENVIRONMENT_ARCHITECTURE.md`
- **Getting Started**: `/app/public/docs-source/guides/getting-started.md`

### Community Support

- **RHEL Community**: https://www.reddit.com/r/redhat/
- **Podman Community**: https://github.com/containers/podman/discussions
- **HexTrackr Issues**: https://github.com/lbruton/HexTrackr/issues

---

**Last Updated**: 2025-10-16
**Maintainer**: HexTrackr Development Team
**License**: See project LICENSE file
