# RHEL 9 Quick Reference for HexTrackr

**Target**: Network admins deploying HexTrackr on RHEL 9 servers
**Time to Deploy**: ~15-20 minutes

---

## TL;DR - Fastest Path to Deployment

```bash
# 1. Clone repository
git clone https://github.com/lbruton/HexTrackr.git
cd HexTrackr

# 2. Run RHEL installer (handles everything automatically)
chmod +x install-rhel.sh
./install-rhel.sh

# 3. Access application
https://localhost:8989
```

That's it! The script handles:
- ✅ Docker/Podman installation
- ✅ Node.js 20 LTS setup
- ✅ Build tools and dependencies
- ✅ SELinux configuration
- ✅ Firewall rules
- ✅ SSL certificate generation
- ✅ Container build and startup

---

## Key Differences: Ubuntu → RHEL

### Package Management

```bash
# Ubuntu                          # RHEL 9
sudo apt update                   sudo dnf update
sudo apt install <package>        sudo dnf install <package>
sudo apt install build-essential  sudo dnf groupinstall "Development Tools"
```

### Container Runtime

**Ubuntu**: Docker CE (default)
**RHEL 9**: Podman (recommended) or Docker CE (via CentOS repo)

```bash
# Podman (RHEL default - daemonless, rootless)
sudo dnf install -y podman podman-compose

# Docker CE (if you prefer traditional Docker)
sudo dnf config-manager --add-repo=https://download.docker.com/linux/centos/docker-ce.repo
sudo dnf install -y docker-ce docker-compose-plugin
```

### Firewall

```bash
# Ubuntu (UFW)                    # RHEL (firewalld)
sudo ufw allow 8989/tcp          sudo firewall-cmd --permanent --add-port=8989/tcp
sudo ufw allow http              sudo firewall-cmd --permanent --add-service=http
sudo ufw reload                  sudo firewall-cmd --reload
```

### SELinux (The Big Difference!)

**Ubuntu**: AppArmor (permissive by default)
**RHEL**: SELinux (enforcing by default)

#### Critical: Docker Volume Permissions

Add `:Z` or `:z` to volume mounts in `docker-compose.yml`:

```yaml
volumes:
  - ./app/data:/app/app/data:Z      # Private label (single container)
  - ./app:/app/app:z                # Shared label (multiple containers)
  - ./certs:/app/certs:ro,Z         # Read-only with private label
```

**Without these flags, you'll get "Permission denied" errors!**

---

## Manual Installation Steps

### 1. Install Prerequisites

```bash
# Update system
sudo dnf update -y

# Install development tools
sudo dnf groupinstall "Development Tools" -y
sudo dnf install -y gcc gcc-c++ make python3 python3-devel sqlite-devel git

# Install Node.js 20 LTS
sudo dnf module reset nodejs -y
sudo dnf module install -y nodejs:20
```

### 2. Install Container Runtime

**Option A: Podman (Recommended)**

```bash
sudo dnf install -y podman podman-compose podman-docker
systemctl --user enable --now podman.socket
```

**Option B: Docker CE**

```bash
sudo dnf install -y dnf-plugins-core
sudo dnf config-manager --add-repo=https://download.docker.com/linux/centos/docker-ce.repo
sudo dnf install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

# Enable SELinux for Docker
sudo mkdir -p /etc/docker
echo '{"selinux-enabled": true}' | sudo tee /etc/docker/daemon.json
sudo systemctl restart docker
```

### 3. Configure SELinux

```bash
cd /path/to/HexTrackr
mkdir -p app/data app/uploads certs

# Set SELinux contexts
sudo semanage fcontext -a -t container_file_t "$(pwd)/app/data(/.*)?"
sudo semanage fcontext -a -t container_file_t "$(pwd)/app/uploads(/.*)?"
sudo semanage fcontext -a -t container_file_t "$(pwd)/certs(/.*)?"

# Apply contexts
sudo restorecon -Rv app/data app/uploads certs
```

### 4. Configure Firewall

```bash
# Open required ports
sudo firewall-cmd --permanent --zone=public --add-service=http
sudo firewall-cmd --permanent --zone=public --add-service=https
sudo firewall-cmd --permanent --zone=public --add-port=8989/tcp
sudo firewall-cmd --permanent --zone=public --add-port=8443/tcp

# Trust container bridge
sudo firewall-cmd --permanent --zone=trusted --add-interface=docker0  # or cni-podman0

# Reload firewall
sudo firewall-cmd --reload
```

### 5. Setup Application

```bash
# Create .env file
cp .env.example .env

# Generate SESSION_SECRET
SESSION_SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
echo "SESSION_SECRET=${SESSION_SECRET}" >> .env

# Generate SSL certificate
mkdir -p certs
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout certs/key.pem -out certs/cert.pem \
  -subj "/C=US/ST=State/L=City/O=HexTrackr/CN=hextrackr.local"

# Build and start
docker-compose build  # or podman-compose build
docker-compose up -d  # or podman-compose up -d
```

---

## Troubleshooting

### Permission Denied Errors

**Symptom**: Container logs show `EACCES: permission denied`

**Cause**: SELinux is blocking volume access

**Fix**:
```bash
# Option 1: Add :Z flags to docker-compose.yml volumes
volumes:
  - ./app/data:/app/app/data:Z

# Option 2: Set SELinux contexts manually
sudo restorecon -Rv app/data app/uploads certs

# Option 3: Check SELinux denials
sudo ausearch -m avc -ts recent
```

### Can't Install better-sqlite3

**Symptom**: `npm install` fails during container build

**Fix**: Ensure build tools are installed on **host** (not just container):
```bash
sudo dnf install -y gcc gcc-c++ make python3 python3-devel sqlite-devel
```

### Firewall Blocks Access

**Symptom**: Can't access HexTrackr from browser

**Fix**:
```bash
# Check firewall rules
sudo firewall-cmd --list-all

# Add missing port
sudo firewall-cmd --permanent --add-port=8989/tcp
sudo firewall-cmd --reload

# If still blocked, add direct rule
sudo firewall-cmd --permanent --direct --add-rule ipv4 filter INPUT 0 -p tcp --dport 8989 -j ACCEPT
sudo firewall-cmd --reload
```

### Docker Daemon Won't Start

**Symptom**: `Cannot connect to the Docker daemon`

**Fix**:
```bash
# Check Docker status
sudo systemctl status docker

# Check SELinux audit logs
sudo ausearch -m avc -c dockerd

# Restart Docker with SELinux enabled
sudo systemctl restart docker
```

### Podman Commands Don't Work

**Symptom**: `docker-compose: command not found` with Podman

**Fix**:
```bash
# Install Docker compatibility layer
sudo dnf install -y podman-docker

# Enable Podman socket
systemctl --user enable --now podman.socket

# Set Docker host environment variable
export DOCKER_HOST=unix:///run/user/$UID/podman/podman.sock
echo 'export DOCKER_HOST=unix:///run/user/$UID/podman/podman.sock' >> ~/.bashrc
```

---

## Package Name Mappings

| Component | Ubuntu Package | RHEL 9 Package |
|-----------|----------------|----------------|
| Build tools | `build-essential` | `Development Tools` (group) |
| C++ compiler | `g++` | `gcc-c++` |
| Python dev | `python3-dev` | `python3-devel` |
| SQLite dev | `libsqlite3-dev` | `sqlite-devel` |
| Node.js | NodeSource PPA | AppStream module or NodeSource RPM |
| Docker | Docker CE | Docker CE (CentOS repo) or Podman |

---

## SELinux Cheat Sheet

### Check Status
```bash
getenforce                    # Check if SELinux is enforcing
sestatus                      # Detailed SELinux status
```

### View Denials
```bash
sudo ausearch -m avc -ts recent          # Recent denials
sudo ausearch -m avc -c dockerd          # Docker-specific denials
sudo sealert -a /var/log/audit/audit.log # Detailed analysis
```

### Set Contexts
```bash
# View current context
ls -Z /path/to/directory

# Set context for Docker volumes
sudo chcon -t container_file_t /path/to/directory

# Make context permanent
sudo semanage fcontext -a -t container_file_t "/path(/.*)?"
sudo restorecon -Rv /path
```

### Temporary Permissive Mode (Testing Only)
```bash
sudo setenforce 0   # Permissive
sudo setenforce 1   # Enforcing
```

---

## Firewalld Cheat Sheet

### Basic Commands
```bash
sudo firewall-cmd --list-all                          # Show all rules
sudo firewall-cmd --get-active-zones                  # Show active zones
sudo firewall-cmd --permanent --add-port=8989/tcp     # Open port
sudo firewall-cmd --permanent --add-service=http      # Open service
sudo firewall-cmd --reload                            # Apply changes
```

### Docker/Podman Integration
```bash
# Trust container bridge
sudo firewall-cmd --permanent --zone=trusted --add-interface=docker0

# Allow container-to-host communication
sudo firewall-cmd --permanent --zone=trusted --add-interface=cni-podman0
```

---

## Post-Installation Checklist

- [ ] Application accessible at https://localhost:8989
- [ ] Health endpoint returns `{"status":"ok"}`
- [ ] Can log in and access dashboard
- [ ] CSV import works without errors
- [ ] WebSocket connection successful (check browser console)
- [ ] No SELinux denials in audit log
- [ ] Firewall allows external access (if needed)
- [ ] Containers restart automatically (`docker-compose ps` shows "Up")

---

## Differences from Ubuntu Deployment

### What Stays the Same ✅
- Application code (100% compatible)
- Docker Compose configuration (with minor SELinux additions)
- Database schema and migrations
- Node.js dependencies
- nginx configuration
- Environment variables

### What Changes ❌
- Package manager (APT → DNF)
- Package names (e.g., `libsqlite3-dev` → `sqlite-devel`)
- Container runtime (Docker → Podman recommended)
- Security module (AppArmor → SELinux)
- Firewall (UFW → firewalld)
- Volume mount flags (must add `:Z` or `:z` for SELinux)

### Migration Path
If you have an existing Ubuntu deployment:

1. **Export data** from Ubuntu instance
   ```bash
   # On Ubuntu
   docker exec hextrackr-app node /app/app/public/scripts/backup-database.js
   ```

2. **Deploy on RHEL** using `install-rhel.sh`

3. **Import data** to RHEL instance
   ```bash
   # On RHEL
   docker exec hextrackr-app node /app/app/public/scripts/restore-database.js
   ```

---

## Support Resources

- **Full Guide**: `docs/RHEL_DEPLOYMENT_GUIDE.md` (comprehensive 800+ line guide)
- **RHEL Documentation**: https://docs.redhat.com/en/rhel/9
- **Podman Docs**: https://docs.podman.io/
- **HexTrackr Issues**: https://github.com/lbruton/HexTrackr/issues

---

**Last Updated**: 2025-10-16
**Author**: HexTrackr Development Team
