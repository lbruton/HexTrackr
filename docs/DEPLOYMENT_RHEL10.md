# HexTrackr Deployment Guide for RHEL 10

**Document Version**: 1.0
**Last Updated**: 2025-01-19
**Target Platform**: Red Hat Enterprise Linux 10
**HexTrackr Version**: 1.0.92

## Table of Contents

1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Phase 1: System Preparation](#phase-1-system-preparation)
4. [Phase 2: Docker Installation](#phase-2-docker-installation)
5. [Phase 3: Application Setup](#phase-3-application-setup)
6. [Phase 4: Configuration](#phase-4-configuration)
7. [Phase 5: SSL/TLS Setup](#phase-5-ssltls-setup)
8. [Phase 6: Deployment](#phase-6-deployment)
9. [Phase 7: Post-Deployment](#phase-7-post-deployment)
10. [Troubleshooting](#troubleshooting)
11. [Backup and Restore](#backup-and-restore)

---

## Overview

This guide provides step-by-step instructions for deploying HexTrackr on Red Hat Enterprise Linux 10 in a production environment. The application runs in Docker containers with nginx as a reverse proxy.

**Architecture Components:**
- **hextrackr-app**: Node.js application container (port 8989)
- **hextrackr-nginx**: Nginx reverse proxy (ports 80/443)
- **hextrackr-database**: Named Docker volume for SQLite database
- **hextrackr-network**: Bridge network for container communication

---

## Prerequisites

### System Requirements

- Red Hat Enterprise Linux 10 (minimal or server installation)
- 4GB RAM minimum (8GB recommended for production)
- 20GB free disk space (50GB+ recommended for production with backups)
- Root or sudo access
- Active Red Hat subscription (for updates)
- Static IP address or FQDN for production deployment

### Required Files

Ensure you have copied these files to your target server:

```
/opt/hextrackr/               # Recommended installation directory
├── app/                      # Application source code
├── backups/                  # Backup directory
├── certs/                    # SSL certificates (cert.pem, key.pem)
├── config/                   # Configuration files
├── docker-compose.yml        # Docker Compose configuration
├── Dockerfile               # Node.js application Dockerfile
├── Dockerfile.node          # Alternative Node build file
├── nginx.conf               # Nginx configuration
└── package.json             # Node.js dependencies
```

---

## Phase 1: System Preparation

### Step 1.0: Configure Static IP Address (Optional but Recommended)

**⚠️ WARNING - SSH Connection Risk:**
If you are connected via SSH, changing the IP address will disconnect your session. Have console access available or ensure you can reconnect to the new IP address before proceeding.

#### Step 1.0.1: Identify Network Interface

```bash
# List all network interfaces
ip addr show

# List NetworkManager connections
nmcli connection show

# Get detailed info about active connection
nmcli device status
```

**Example Output:**
```
DEVICE  TYPE      STATE      CONNECTION
ens192  ethernet  connected  ens192
```

**Note:** Your interface name (ens192, eth0, ens33, etc.) may differ. Use your actual interface name in the commands below.

#### Step 1.0.2: Gather Current Network Information

```bash
# Get current IP configuration
ip addr show <interface-name>

# Get current gateway
ip route show

# Get current DNS servers
cat /etc/resolv.conf

# Get current NetworkManager connection details
nmcli connection show <connection-name>
```

**Record These Values:**
- Current IP: _____________
- Gateway: _____________ (usually 192.168.1.1)
- DNS Servers: _____________ (e.g., 192.168.1.1, 8.8.8.8, 8.8.4.4)
- Subnet Mask: _____________ (usually /24 or 255.255.255.0)

#### Step 1.0.3: Configure Static IP

**Replace the following values with your actual network configuration:**
- `<connection-name>`: Your connection name (from Step 1.0.1)
- `192.168.1.80`: Your desired static IP
- `192.168.1.1`: Your gateway IP
- `8.8.8.8 8.8.4.4`: Your DNS servers (space-separated)

```bash
# Set static IP address with /24 subnet (255.255.255.0)
sudo nmcli connection modify <connection-name> \
    ipv4.addresses 192.168.1.80/24 \
    ipv4.gateway 192.168.1.1 \
    ipv4.dns "8.8.8.8 8.8.4.4" \
    ipv4.method manual

# Alternative: Use your router as DNS
sudo nmcli connection modify <connection-name> \
    ipv4.addresses 192.168.1.80/24 \
    ipv4.gateway 192.168.1.1 \
    ipv4.dns "192.168.1.1" \
    ipv4.method manual

# Bring down and up the connection to apply changes
# WARNING: This will disconnect your SSH session if you're remote
sudo nmcli connection down <connection-name> && sudo nmcli connection up <connection-name>
```

#### Step 1.0.4: Verify Static IP Configuration

**If you were disconnected, reconnect via SSH to the new IP:**
```bash
ssh user@192.168.1.80
```

**Once connected, verify the configuration:**

```bash
# Check IP address
ip addr show <interface-name>

# Should show: inet 192.168.1.80/24

# Check gateway
ip route show

# Should show: default via 192.168.1.1 dev <interface-name>

# Check DNS
cat /etc/resolv.conf

# Should show your configured DNS servers

# Test connectivity
ping -c 4 192.168.1.1  # Test gateway
ping -c 4 8.8.8.8      # Test external connectivity
ping -c 4 google.com   # Test DNS resolution
```

**Verification Checklist:**
- [ ] IP address is 192.168.1.80
- [ ] Gateway is reachable
- [ ] DNS resolution works
- [ ] Can reach external internet

#### Step 1.0.5: Make Configuration Persistent

```bash
# Verify connection will start on boot
nmcli connection show <connection-name> | grep autoconnect

# Should show: connection.autoconnect: yes

# If not, enable autoconnect
sudo nmcli connection modify <connection-name> connection.autoconnect yes

# Verify NetworkManager starts on boot
sudo systemctl enable NetworkManager
sudo systemctl status NetworkManager
```

#### Troubleshooting Static IP Issues

**Problem:** Lost connection and can't reconnect

**Solution 1:** Use console access (physical or virtual console)
```bash
# Check connection status
nmcli connection show
nmcli device status

# Bring connection up
sudo nmcli connection up <connection-name>

# Check for errors
sudo journalctl -u NetworkManager -n 50
```

**Solution 2:** Revert to DHCP temporarily
```bash
# Switch back to DHCP
sudo nmcli connection modify <connection-name> ipv4.method auto
sudo nmcli connection down <connection-name>
sudo nmcli connection up <connection-name>

# Get new DHCP address
ip addr show <interface-name>
```

**Problem:** No internet connectivity after setting static IP

```bash
# Check gateway is correct
ip route show

# Test gateway connectivity
ping 192.168.1.1

# Check DNS
cat /etc/resolv.conf

# Test DNS manually
nslookup google.com 8.8.8.8

# If DNS is the issue, update DNS servers
sudo nmcli connection modify <connection-name> ipv4.dns "8.8.8.8 8.8.4.4"
sudo nmcli connection down <connection-name> && sudo nmcli connection up <connection-name>
```

---

### Step 1.1: Update System

```bash
# Update all packages
sudo dnf update -y

# Reboot if kernel was updated
sudo reboot

# After reboot, verify system
hostnamectl
```

**Verification:**
- System should show RHEL 10.x
- All packages updated successfully

### Step 1.2: Install Required Packages

```bash
# Install essential tools
sudo dnf install -y \
    curl \
    wget \
    git \
    vim \
    net-tools \
    bind-utils \
    firewalld \
    policycoreutils-python-utils

# Verify installations
curl --version
git --version
```

### Step 1.3: Configure Firewall

**⚠️ CRITICAL WARNING - Remote SSH Connections:**
If you are connected via SSH, your current session will remain active (stateful firewall), but you MUST ensure SSH is allowed before reloading the firewall. If you get disconnected without SSH allowed, you will be locked out and require console access to recover.

```bash
# Check if firewalld is currently running
sudo systemctl status firewalld

# Check current configuration (if running)
sudo firewall-cmd --list-all

# CRITICAL: Ensure SSH is allowed FIRST (even if it's already in default rules)
sudo firewall-cmd --permanent --add-service=ssh

# Now start and enable firewall (safe because SSH is configured)
sudo systemctl start firewalld
sudo systemctl enable firewalld

# Check status
sudo firewall-cmd --state

# Add application ports
sudo firewall-cmd --permanent --add-service=http
sudo firewall-cmd --permanent --add-service=https
sudo firewall-cmd --permanent --add-port=8989/tcp  # Application port (optional, for troubleshooting)

# Reload firewall (your current SSH session will stay active)
sudo firewall-cmd --reload

# Verify rules (SSH should be in the list)
sudo firewall-cmd --list-all
```

**Expected Output:**
```
services: dhcpv6-client http https ssh
ports: 8989/tcp
```

**Safety Test (IMPORTANT for remote connections):**
```bash
# Open a SECOND SSH connection in a new terminal to verify access
# DO NOT close your current session until you verify the second connection works
ssh user@your-server-ip

# If the second connection succeeds, you're safe to proceed
# If it fails, troubleshoot before closing your current session
```

### Step 1.4: Set Hostname (Production)

```bash
# Set your production hostname
sudo hostnamectl set-hostname hextrackr.yourdomain.com

# Verify
hostnamectl
```

### Step 1.5: Configure SELinux

```bash
# Check SELinux status
getenforce

# For production, keep SELinux in enforcing mode
# We'll configure proper contexts later
sudo setenforce 1

# Verify
sestatus
```

**Note:** SELinux should remain in `Enforcing` mode for production. We'll configure proper contexts for Docker volumes.

---

## Phase 2: Docker Installation

### Step 2.1: Add Docker Repository

```bash
# Remove old versions if present
sudo dnf remove -y docker \
    docker-client \
    docker-client-latest \
    docker-common \
    docker-latest \
    docker-latest-logrotate \
    docker-logrotate \
    docker-engine \
    podman \
    runc

# Add Docker CE repository
sudo dnf config-manager --add-repo https://download.docker.com/linux/rhel/docker-ce.repo

# Verify repository
sudo dnf repolist | grep docker
```

### Step 2.2: Install Docker Engine

```bash
# Install Docker CE
sudo dnf install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# Verify installation
docker --version
docker compose version
```

**Expected Output:**
```
Docker version 25.x.x, build xxxxx
Docker Compose version v2.x.x
```

### Step 2.3: Configure Docker Service

```bash
# Start Docker service
sudo systemctl start docker

# Enable Docker to start on boot
sudo systemctl enable docker

# Verify Docker is running
sudo systemctl status docker
```

### Step 2.4: Configure Docker for Non-Root User (Optional)

```bash
# Create docker group if it doesn't exist
sudo groupadd docker

# Add your user to docker group
sudo usermod -aG docker $USER

# Apply group changes (logout/login or use newgrp)
newgrp docker

# Test Docker without sudo
docker run hello-world
```

**Verification:**
- Docker should pull and run hello-world container successfully
- No "permission denied" errors

### Step 2.5: Configure Docker Storage (Production)

```bash
# Check current storage driver
docker info | grep "Storage Driver"

# Create daemon configuration
sudo tee /etc/docker/daemon.json > /dev/null <<EOF
{
  "storage-driver": "overlay2",
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "10m",
    "max-file": "3"
  }
}
EOF

# Restart Docker to apply changes
sudo systemctl restart docker

# Verify configuration
docker info | grep -A 5 "Storage Driver"
```

---

## Phase 3: Application Setup

### Step 3.1: Create Application Directory

```bash
# Create installation directory
sudo mkdir -p /opt/hextrackr

# Set ownership (replace 'yourusername' with your actual user)
sudo chown -R $USER:$USER /opt/hextrackr

# Navigate to installation directory
cd /opt/hextrackr

# Verify files are present
ls -la
```

**Expected Files:**
```
drwxr-xr-x. app/
drwxr-xr-x. backups/
drwxr-xr-x. certs/
drwxr-xr-x. config/
-rw-r--r--. docker-compose.yml
-rw-r--r--. Dockerfile
-rw-r--r--. Dockerfile.node
-rw-r--r--. nginx.conf
-rw-r--r--. package.json
```

### Step 3.2: Verify File Permissions

```bash
# Ensure proper ownership
sudo chown -R $USER:$USER /opt/hextrackr

# Set directory permissions
chmod 755 /opt/hextrackr
chmod 755 /opt/hextrackr/app
chmod 755 /opt/hextrackr/backups
chmod 755 /opt/hextrackr/config

# Set secure permissions for certs
chmod 700 /opt/hextrackr/certs
chmod 600 /opt/hextrackr/certs/*.pem

# Verify
ls -la /opt/hextrackr/certs/
```

**Expected Output:**
```
drwx------. certs/
-rw-------. cert.pem
-rw-------. key.pem
```

### Step 3.3: Configure SELinux Contexts for Docker

```bash
# Allow Docker to access bind-mounted directories
sudo semanage fcontext -a -t container_file_t "/opt/hextrackr/app(/.*)?"
sudo semanage fcontext -a -t container_file_t "/opt/hextrackr/config(/.*)?"
sudo semanage fcontext -a -t container_file_t "/opt/hextrackr/backups(/.*)?"
sudo semanage fcontext -a -t container_file_t "/opt/hextrackr/certs(/.*)?"

# Apply contexts
sudo restorecon -Rv /opt/hextrackr

# Verify contexts
ls -Z /opt/hextrackr
```

---

## Phase 4: Configuration

### Step 4.1: Create Environment File with Session Secret

**Note:** This step uses OpenSSL (already installed on RHEL) to generate the session secret. Node.js is not required on the host - it will be available inside the Docker container.

```bash
cd /opt/hextrackr

# Create .env file with auto-generated session secret
cat > .env <<EOF
# ==============================================================================
# HexTrackr Production Environment Configuration
# ==============================================================================

# ==============================================================================
# APPLICATION SETTINGS
# ==============================================================================
NODE_ENV=production
PORT=8080
DATABASE_PATH=data/hextrackr.db
MAX_FILE_SIZE_MB=100

# ==============================================================================
# AUTHENTICATION - REQUIRED
# ==============================================================================
# Session secret generated using OpenSSL (64-character hex string)
SESSION_SECRET=$(openssl rand -hex 32)

# ==============================================================================
# HTTPS/SSL SETTINGS
# ==============================================================================
USE_HTTPS=true

# ==============================================================================
# REVERSE PROXY SETTINGS - PRODUCTION
# ==============================================================================
# Enable trust proxy when running behind nginx
TRUST_PROXY=true

# ==============================================================================
# NODE.JS SETTINGS
# ==============================================================================
# 4GB heap for large backup exports and data processing
NODE_OPTIONS=--max-old-space-size=4096
EOF

# Set secure permissions on .env file
chmod 600 .env
```

### Step 4.2: Verify Session Secret

```bash
# Display the generated .env file
echo "=== Generated .env Configuration ==="
cat .env

# Verify SESSION_SECRET has a value (should be 64 hex characters)
echo ""
echo "=== Session Secret Verification ==="
grep SESSION_SECRET .env

# The output should show something like:
# SESSION_SECRET=a1b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef123456
```

**CRITICAL:** Save the SESSION_SECRET securely. If you lose it, all existing user sessions will be invalidated.

**Expected Output:**
- SESSION_SECRET should have exactly 64 hexadecimal characters (0-9, a-f)
- If it's empty or shows "REPLACE_WITH_...", re-run Step 4.1

### Step 4.3: Review docker-compose.yml

```bash
# Verify docker-compose.yml configuration
cat docker-compose.yml | grep -A 5 "environment:"
```

**Key Settings to Verify:**
- `HEXTRACKR_VERSION`: Should match your deployment version
- `NODE_ENV`: Should be set via .env file
- `USE_HTTPS`: Should be true for production
- Volume mounts are correct
- Port mappings: 8989:8080 (app), 80:80 and 443:443 (nginx)

### Step 4.4: Review nginx.conf

```bash
# Check nginx configuration
cat nginx.conf
```

**Key Items to Verify:**
- SSL certificate paths point to `/etc/nginx/certs/cert.pem` and `/etc/nginx/certs/key.pem`
- Proxy settings correctly forward to `hextrackr:8080`
- Security headers are configured
- SSL protocols and ciphers are secure

---

## Phase 5: SSL/TLS Setup

### Step 5.1: Verify SSL Certificates

```bash
# Check certificate files exist
ls -la /opt/hextrackr/certs/

# Verify certificate details
openssl x509 -in /opt/hextrackr/certs/cert.pem -text -noout | grep -A 2 "Subject:"
openssl x509 -in /opt/hextrackr/certs/cert.pem -text -noout | grep -A 2 "Validity"

# Check private key
openssl rsa -in /opt/hextrackr/certs/key.pem -check
```

### Step 5.2: Production Certificate Setup (Let's Encrypt - Optional)

If you need to generate production certificates with Let's Encrypt:

```bash
# Install certbot
sudo dnf install -y certbot

# Generate certificate (replace with your domain)
sudo certbot certonly --standalone -d hextrackr.yourdomain.com

# Copy certificates to certs directory
sudo cp /etc/letsencrypt/live/hextrackr.yourdomain.com/fullchain.pem /opt/hextrackr/certs/cert.pem
sudo cp /etc/letsencrypt/live/hextrackr.yourdomain.com/privkey.pem /opt/hextrackr/certs/key.pem

# Set permissions
sudo chown $USER:$USER /opt/hextrackr/certs/*.pem
chmod 600 /opt/hextrackr/certs/*.pem
```

### Step 5.3: Test Certificate Configuration

```bash
# Verify certificate matches private key
CERT_MD5=$(openssl x509 -noout -modulus -in /opt/hextrackr/certs/cert.pem | openssl md5)
KEY_MD5=$(openssl rsa -noout -modulus -in /opt/hextrackr/certs/key.pem | openssl md5)

echo "Certificate: $CERT_MD5"
echo "Private Key: $KEY_MD5"

# These should match
if [ "$CERT_MD5" = "$KEY_MD5" ]; then
    echo "✓ Certificate and private key match"
else
    echo "✗ Certificate and private key DO NOT match - fix before continuing"
fi
```

---

## Phase 6: Deployment

### Step 6.1: Build Docker Images

```bash
cd /opt/hextrackr

# Build images (this may take 5-10 minutes)
docker compose build --no-cache

# Verify images were created
docker images | grep hextrackr
```

**Expected Output:**
```
opt-hextrackr-hextrackr    latest    [IMAGE_ID]    [SIZE]
```

### Step 6.2: Create Docker Network and Volume

```bash
# Create network (may already exist from compose file)
docker network create hextrackr-network 2>/dev/null || echo "Network already exists"

# Create named volume for database
docker volume create hextrackr-database

# Verify volume
docker volume ls | grep hextrackr
```

### Step 6.3: Initial Database Setup (First Deployment Only)

If deploying for the first time WITHOUT a database backup:

```bash
# Start only the app container temporarily to initialize database
docker compose up -d hextrackr

# Wait for initialization
sleep 10

# Check logs for successful database initialization
docker compose logs hextrackr | grep -i database

# Stop the container
docker compose down
```

### Step 6.4: Restore Database from Backup (If Available)

If you have a database backup to restore:

```bash
# Ensure containers are stopped
docker compose down

# Verify backup file exists
ls -lh /opt/hextrackr/backups/

# Copy backup to named volume (requires running container)
# Start a temporary container with volume mounted
docker run --rm -v hextrackr-database:/data -v /opt/hextrackr/backups:/backups alpine sh -c "cp /backups/hextrackr-backup-YYYYMMDD-HHMMSS.db /data/hextrackr.db"

# Verify file was copied
docker run --rm -v hextrackr-database:/data alpine ls -lh /data/
```

**Replace** `hextrackr-backup-YYYYMMDD-HHMMSS.db` with your actual backup filename.

### Step 6.5: Start All Services

```bash
cd /opt/hextrackr

# Start all containers in detached mode
docker compose up -d

# Check container status
docker compose ps

# View logs in real-time
docker compose logs -f
```

**Expected Container Status:**
```
NAME                 STATUS          PORTS
hextrackr-app        Up X seconds    0.0.0.0:8989->8080/tcp, 0.0.0.0:8443->8443/tcp
hextrackr-nginx      Up X seconds    0.0.0.0:80->80/tcp, 0.0.0.0:443->443/tcp
```

Press `Ctrl+C` to stop following logs.

### Step 6.6: Verify Service Health

```bash
# Wait 30 seconds for health checks
sleep 30

# Check health status
docker compose ps

# Should show "healthy" status for both containers
docker inspect hextrackr-app | grep -A 5 "Health"
docker inspect hextrackr-nginx | grep -A 5 "Health"
```

---

## Phase 7: Post-Deployment

### Step 7.1: Test Application Access

```bash
# Test local HTTP endpoint (should redirect to HTTPS)
curl -I http://localhost

# Test HTTPS endpoint (use -k for self-signed certs)
curl -k -I https://localhost

# Test from external machine (replace with your server IP/hostname)
curl -k -I https://hextrackr.yourdomain.com
```

**Expected Response:**
- HTTP/1.1 301 (redirect) or 200 OK
- No connection errors

### Step 7.2: Access Web Interface

Open a web browser and navigate to:
- **https://hextrackr.yourdomain.com** (production)
- **https://[SERVER_IP]** (testing)

**For self-signed certificates:**
- Browser will show security warning
- Click "Advanced" → "Proceed to site"
- Or in Chrome, type `thisisunsafe` when warning appears

### Step 7.3: Configure Automatic Restarts

```bash
# Verify restart policy in docker-compose.yml
docker compose config | grep restart

# Should show: restart: unless-stopped

# Test restart
docker compose restart

# Verify containers restarted
docker compose ps
```

### Step 7.4: Configure Systemd Service (Optional - Recommended)

Create a systemd service for automatic startup on boot:

```bash
# Create systemd service file
sudo tee /etc/systemd/system/hextrackr.service > /dev/null <<'EOF'
[Unit]
Description=HexTrackr Application
Requires=docker.service
After=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=/opt/hextrackr
ExecStart=/usr/bin/docker compose up -d
ExecStop=/usr/bin/docker compose down
TimeoutStartSec=0

[Install]
WantedBy=multi-user.target
EOF

# Reload systemd
sudo systemctl daemon-reload

# Enable service
sudo systemctl enable hextrackr.service

# Test service
sudo systemctl start hextrackr.service
sudo systemctl status hextrackr.service
```

### Step 7.5: Configure Log Rotation

```bash
# Create logrotate configuration
sudo tee /etc/logrotate.d/hextrackr > /dev/null <<'EOF'
/opt/hextrackr/app/logs/*.log {
    daily
    rotate 14
    compress
    delaycompress
    notifempty
    create 0644 root root
    sharedscripts
    postrotate
        docker compose -f /opt/hextrackr/docker-compose.yml restart hextrackr > /dev/null 2>&1 || true
    endscript
}
EOF

# Test logrotate configuration
sudo logrotate -d /etc/logrotate.d/hextrackr
```

### Step 7.6: Set Up Automated Backups

```bash
# Create backup script
sudo tee /usr/local/bin/hextrackr-backup.sh > /dev/null <<'EOF'
#!/bin/bash
# HexTrackr Automated Backup Script

BACKUP_DIR="/opt/hextrackr/backups"
TIMESTAMP=$(date +%Y%m%d-%H%M%S)
BACKUP_NAME="hextrackr-backup-${TIMESTAMP}.db"

# Export database from Docker volume
docker run --rm \
    -v hextrackr-database:/data:ro \
    -v ${BACKUP_DIR}:/backup \
    alpine sh -c "cp /data/hextrackr.db /backup/${BACKUP_NAME}"

# Compress backup
gzip ${BACKUP_DIR}/${BACKUP_NAME}

# Keep only last 30 days of backups
find ${BACKUP_DIR} -name "hextrackr-backup-*.db.gz" -mtime +30 -delete

echo "Backup completed: ${BACKUP_NAME}.gz"
EOF

# Make executable
sudo chmod +x /usr/local/bin/hextrackr-backup.sh

# Test backup script
sudo /usr/local/bin/hextrackr-backup.sh

# Verify backup was created
ls -lh /opt/hextrackr/backups/
```

### Step 7.7: Configure Backup Cron Job

```bash
# Add cron job for daily backups at 2 AM
(crontab -l 2>/dev/null; echo "0 2 * * * /usr/local/bin/hextrackr-backup.sh >> /var/log/hextrackr-backup.log 2>&1") | crontab -

# Verify cron job
crontab -l
```

---

## Troubleshooting

### Container Issues

**Problem:** Containers fail to start

```bash
# Check logs
docker compose logs hextrackr
docker compose logs nginx

# Check container status
docker compose ps -a

# Restart containers
docker compose restart

# Full restart
docker compose down && docker compose up -d
```

**Problem:** Port conflicts

```bash
# Check what's using ports
sudo ss -tulpn | grep -E ":(80|443|8989)"

# Stop conflicting services
sudo systemctl stop httpd   # if Apache is running
sudo systemctl stop nginx   # if system nginx is running
```

### Database Issues

**Problem:** Database corruption or connection errors

```bash
# Stop containers
docker compose down

# Check database integrity
docker run --rm -v hextrackr-database:/data alpine sh -c "ls -lh /data/"

# Restore from backup
docker run --rm -v hextrackr-database:/data -v /opt/hextrackr/backups:/backups alpine sh -c "cp /backups/[LATEST_BACKUP].db.gz /data/ && gunzip /data/[LATEST_BACKUP].db.gz && mv /data/[LATEST_BACKUP].db /data/hextrackr.db"

# Restart
docker compose up -d
```

### SSL/Certificate Issues

**Problem:** SSL certificate errors

```bash
# Verify certificate paths in nginx.conf
cat nginx.conf | grep ssl_certificate

# Check certificate files in container
docker compose exec nginx ls -la /etc/nginx/certs/

# Verify certificate is valid
docker compose exec nginx openssl x509 -in /etc/nginx/certs/cert.pem -text -noout | grep -A 2 "Validity"

# Restart nginx
docker compose restart nginx
```

### Network Issues

**Problem:** Cannot access application from external network

```bash
# Check firewall rules
sudo firewall-cmd --list-all

# Verify ports are listening
sudo ss -tulpn | grep -E ":(80|443)"

# Check SELinux denials
sudo ausearch -m avc -ts recent

# Temporarily test with SELinux permissive (testing only)
sudo setenforce 0
# Test access
# Re-enable SELinux
sudo setenforce 1
```

### Performance Issues

**Problem:** Slow response times

```bash
# Check container resource usage
docker stats

# Check system resources
top
df -h

# Check Docker logs for errors
docker compose logs --tail=100 hextrackr

# Restart containers to clear memory
docker compose restart
```

### SELinux Issues

**Problem:** SELinux blocking Docker access

```bash
# Check for denials
sudo ausearch -m avc -ts recent | grep docker

# Generate and apply policy (if denials found)
sudo ausearch -m avc -ts recent | audit2allow -M hextrackr_docker
sudo semodule -i hextrackr_docker.pp

# Verify contexts
ls -Z /opt/hextrackr
```

---

## Backup and Restore

### Manual Backup

```bash
# Export database from Docker volume
TIMESTAMP=$(date +%Y%m%d-%H%M%S)
docker run --rm \
    -v hextrackr-database:/data:ro \
    -v /opt/hextrackr/backups:/backup \
    alpine sh -c "cp /data/hextrackr.db /backup/manual-backup-${TIMESTAMP}.db"

# Compress backup
gzip /opt/hextrackr/backups/manual-backup-${TIMESTAMP}.db
```

### Manual Restore

```bash
# Stop application
docker compose down

# Restore backup (replace FILENAME with your backup)
gunzip -c /opt/hextrackr/backups/FILENAME.db.gz | docker run --rm -i \
    -v hextrackr-database:/data \
    alpine sh -c "cat > /data/hextrackr.db"

# Verify restore
docker run --rm -v hextrackr-database:/data alpine ls -lh /data/

# Start application
docker compose up -d
```

### Full System Backup

```bash
# Create full backup directory
sudo mkdir -p /backup/hextrackr-full-$(date +%Y%m%d)

# Backup configuration files
sudo cp -r /opt/hextrackr/{.env,docker-compose.yml,nginx.conf,config,certs} \
    /backup/hextrackr-full-$(date +%Y%m%d)/

# Export database
docker run --rm \
    -v hextrackr-database:/data:ro \
    -v /backup/hextrackr-full-$(date +%Y%m%d):/backup \
    alpine sh -c "cp /data/hextrackr.db /backup/hextrackr.db"

# Backup uploads (if any)
sudo cp -r /opt/hextrackr/app/uploads /backup/hextrackr-full-$(date +%Y%m%d)/

# Create tarball
cd /backup
sudo tar -czf hextrackr-full-$(date +%Y%m%d).tar.gz hextrackr-full-$(date +%Y%m%d)/
```

---

## Maintenance Commands

### View Logs

```bash
# Real-time logs (all containers)
docker compose logs -f

# Last 100 lines (specific container)
docker compose logs --tail=100 hextrackr

# Search logs for errors
docker compose logs hextrackr | grep -i error
```

### Update Application

```bash
# Navigate to installation directory
cd /opt/hextrackr

# Backup current database
/usr/local/bin/hextrackr-backup.sh

# Stop containers
docker compose down

# Update application files (copy new files to /opt/hextrackr)

# Rebuild images
docker compose build --no-cache

# Start containers
docker compose up -d

# Verify
docker compose ps
```

### Restart Services

```bash
# Restart all containers
docker compose restart

# Restart specific container
docker compose restart hextrackr
docker compose restart nginx
```

### Clean Up Docker Resources

```bash
# Remove unused images
docker image prune -a

# Remove unused volumes (CAREFUL - not database volume)
docker volume prune

# View disk usage
docker system df

# Full cleanup (excludes running containers/volumes)
docker system prune -a --volumes
```

---

## Security Checklist

- [ ] SESSION_SECRET is unique and secure (64+ hex characters)
- [ ] .env file has permissions 600
- [ ] SSL certificates are valid and properly configured
- [ ] Firewall only allows necessary ports (80, 443, 22)
- [ ] SELinux is in enforcing mode
- [ ] Docker containers restart automatically (unless-stopped)
- [ ] Automated backups are configured and tested
- [ ] Log rotation is configured
- [ ] System updates are scheduled
- [ ] Default passwords changed (if any)
- [ ] Unnecessary services disabled
- [ ] SSH key-based authentication enabled (disable password auth)

---

## Support and Additional Resources

### Log Locations

- **Application Logs**: `docker compose logs hextrackr`
- **Nginx Logs**: `docker compose logs nginx`
- **System Logs**: `/var/log/messages`
- **Docker Logs**: `journalctl -u docker`

### Useful Commands

```bash
# Check disk space
df -h

# Check memory usage
free -h

# Check Docker status
systemctl status docker

# Check container health
docker compose ps

# Execute command in container
docker compose exec hextrackr /bin/sh

# View container environment variables
docker compose exec hextrackr env
```

### Performance Monitoring

```bash
# Container resource usage
docker stats

# System resource usage
top
htop  # if installed

# Network connections
ss -tulpn
```

---

## Document History

| Version | Date       | Changes                              |
|---------|------------|--------------------------------------|
| 1.0     | 2025-01-19 | Initial RHEL 10 deployment guide     |

---

**End of Document**
