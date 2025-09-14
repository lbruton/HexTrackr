# Deployment Guide

Comprehensive deployment documentation for HexTrackr in production environments, covering Docker, bare metal, and cloud deployments.

---

## Overview

HexTrackr is designed as a self-contained application with minimal external dependencies, making deployment straightforward across various environments:

- **Docker Deployment** (Recommended): Containerized deployment with Docker Compose
- **Bare Metal Deployment**: Direct installation on Linux/Windows servers
- **Cloud Deployment**: AWS, Azure, GCP with container services
- **Kubernetes Deployment**: Production-scale orchestration

---

## Prerequisites

### System Requirements

#### Minimum Requirements

- **CPU**: 2 cores, 2.0 GHz
- **RAM**: 4 GB
- **Storage**: 20 GB available disk space
- **Network**: 1 Mbps bandwidth
- **OS**: Linux (Ubuntu 20.04+, RHEL 8+), Windows Server 2019+, macOS 10.15+

#### Recommended Requirements

- **CPU**: 4 cores, 2.5 GHz
- **RAM**: 8 GB
- **Storage**: 100 GB SSD storage
- **Network**: 100 Mbps bandwidth
- **OS**: Ubuntu 22.04 LTS or RHEL 9

#### Port Requirements

- **8989**: Main application HTTP server
- **8988**: WebSocket server for real-time updates
- **443/80**: HTTPS/HTTP (if using reverse proxy)

### Software Dependencies

#### For Docker Deployment

- Docker Engine 20.10+
- Docker Compose 2.0+

#### For Bare Metal Deployment

- Node.js 18.x or 20.x LTS
- npm 9.0+ or yarn 1.22+
- SQLite3 3.35+ (bundled with application)

---

## Docker Deployment (Recommended)

### Quick Start with Docker Compose

1. **Download Docker Compose Configuration**:

```yaml
# docker-compose.yml
version: '3.8'

services:
  hextrackr:
    image: hextrackr/hextrackr-server:latest
    container_name: hextrackr-app
    ports:
      - "8989:8989"
      - "8988:8988"
    volumes:
      - hextrackr-data:/data
      - hextrackr-uploads:/app/public/uploads
      - hextrackr-logs:/var/log/hextrackr
    environment:
      - NODE_ENV=production
      - PORT=8989
      - WEBSOCKET_PORT=8988
      - DB_PATH=/data/hextrackr.db
      - LOG_LEVEL=warn
      - LOG_DESTINATION=file
      - LOG_FILE_PATH=/var/log/hextrackr/app.log
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8989/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s

  # Optional: Reverse proxy with SSL termination
  nginx:
    image: nginx:alpine
    container_name: hextrackr-proxy
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
      - ./ssl:/etc/nginx/ssl:ro
    depends_on:
      - hextrackr
    restart: unless-stopped

volumes:
  hextrackr-data:
    driver: local
  hextrackr-uploads:
    driver: local
  hextrackr-logs:
    driver: local

networks:
  default:
    name: hextrackr-network
```

2. **Start the Application**:

```bash
# Create directory and download configuration
mkdir hextrackr-deployment && cd hextrackr-deployment
curl -o docker-compose.yml https://raw.githubusercontent.com/your-org/hextrackr/main/docker-compose.prod.yml

# Start services
docker-compose up -d

# View logs
docker-compose logs -f hextrackr
```

3. **Verify Deployment**:

```bash
# Check application health
curl http://localhost:8989/health

# Check WebSocket connectivity
wscat -c ws://localhost:8988
```

### Docker Environment Variables

```bash
# Core Application
NODE_ENV=production
PORT=8989
WEBSOCKET_PORT=8988
HOST=0.0.0.0

# Database
DB_PATH=/data/hextrackr.db
DB_WAL_MODE=true
DB_BUSY_TIMEOUT=10000

# Security
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
CORS_ORIGIN=https://yourdomain.com
SESSION_COOKIE_SECURE=true

# File Uploads
MAX_UPLOAD_SIZE=52428800
UPLOAD_DIR=/app/public/uploads
ALLOWED_EXTENSIONS=csv,json,xlsx

# Logging
LOG_LEVEL=warn
LOG_DESTINATION=file
LOG_FILE_PATH=/var/log/hextrackr/app.log
LOG_FILE_MAX_SIZE=10485760
LOG_FILE_MAX_FILES=5

# Performance
COMPRESSION_ENABLED=true
CACHE_ENABLED=true
STATIC_CACHE_MAX_AGE=2592000000
```

---

## Bare Metal Deployment

### Linux Deployment (Ubuntu/RHEL)

1. **Install Node.js**:

```bash
# Ubuntu
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# RHEL/CentOS
curl -fsSL https://rpm.nodesource.com/setup_20.x | sudo bash -
sudo yum install -y nodejs

# Verify installation
node --version  # Should show v20.x.x
npm --version   # Should show 9.x.x+
```

2. **Download and Install HexTrackr**:

```bash
# Create application directory
sudo mkdir -p /opt/hextrackr
cd /opt/hextrackr

# Download release (replace with actual release URL)
sudo wget https://github.com/your-org/hextrackr/releases/download/v1.0.13/hextrackr-v1.0.13.tar.gz
sudo tar -xzf hextrackr-v1.0.13.tar.gz
cd hextrackr-v1.0.13

# Install dependencies
sudo npm ci --production --ignore-scripts

# Create data directories
sudo mkdir -p data logs uploads
sudo chown -R hextrackr:hextrackr /opt/hextrackr
```

3. **Create System User**:

```bash
# Create dedicated user
sudo useradd -r -s /bin/false -d /opt/hextrackr hextrackr
sudo chown -R hextrackr:hextrackr /opt/hextrackr
```

4. **Configure Environment**:

```bash
# Create environment file
sudo tee /opt/hextrackr/.env << EOF
NODE_ENV=production
PORT=8989
WEBSOCKET_PORT=8988
DB_PATH=/opt/hextrackr/data/hextrackr.db
UPLOAD_DIR=/opt/hextrackr/uploads
LOG_FILE_PATH=/opt/hextrackr/logs/app.log
LOG_LEVEL=warn
RATE_LIMIT_MAX_REQUESTS=100
COMPRESSION_ENABLED=true
CACHE_ENABLED=true
EOF

sudo chown hextrackr:hextrackr /opt/hextrackr/.env
sudo chmod 600 /opt/hextrackr/.env
```

5. **Create Systemd Service**:

```bash
# Create service file
sudo tee /etc/systemd/system/hextrackr.service << EOF
[Unit]
Description=HexTrackr Vulnerability Management Server
Documentation=https://docs.hextrackr.com
After=network.target
Wants=network.target

[Service]
Type=simple
User=hextrackr
Group=hextrackr
WorkingDirectory=/opt/hextrackr
ExecStart=/usr/bin/node app/public/server.js
ExecReload=/bin/kill -HUP \$MAINPID
Restart=always
RestartSec=10
StandardOutput=journal
StandardError=journal
SyslogIdentifier=hextrackr

# Security settings
NoNewPrivileges=true
PrivateTmp=true
ProtectSystem=strict
ProtectHome=true
ReadWritePaths=/opt/hextrackr/data /opt/hextrackr/logs /opt/hextrackr/uploads
CapabilityBoundingSet=CAP_NET_BIND_SERVICE

# Resource limits
LimitNOFILE=65536
LimitNPROC=4096

[Install]
WantedBy=multi-user.target
EOF
```

6. **Start and Enable Service**:

```bash
# Reload systemd and start service
sudo systemctl daemon-reload
sudo systemctl enable hextrackr
sudo systemctl start hextrackr

# Check status
sudo systemctl status hextrackr

# View logs
sudo journalctl -u hextrackr -f
```

### Windows Deployment

1. **Install Node.js**:
   - Download from <https://nodejs.org/>
   - Install LTS version (20.x)
   - Verify installation in PowerShell: `node --version`

2. **Download and Extract HexTrackr**:

```powershell
# Create application directory
New-Item -ItemType Directory -Path "C:\HexTrackr" -Force
cd C:\HexTrackr

# Download and extract (replace with actual URL)
Invoke-WebRequest -Uri "https://github.com/your-org/hextrackr/releases/download/v1.0.13/hextrackr-v1.0.13.zip" -OutFile "hextrackr.zip"
Expand-Archive -Path "hextrackr.zip" -DestinationPath "."

# Install dependencies
npm ci --production --ignore-scripts
```

3. **Create Environment File**:

```powershell
# Create .env file
@"
NODE_ENV=production
PORT=8989
WEBSOCKET_PORT=8988
DB_PATH=C:\HexTrackr\data\hextrackr.db
UPLOAD_DIR=C:\HexTrackr\uploads
LOG_FILE_PATH=C:\HexTrackr\logs\app.log
LOG_LEVEL=warn
"@ | Out-File -FilePath ".env" -Encoding UTF8
```

4. **Install as Windows Service** (using node-windows):

```powershell
# Install node-windows globally
npm install -g node-windows

# Create service script
@"
var Service = require('node-windows').Service;
var svc = new Service({
  name: 'HexTrackr Server',
  description: 'HexTrackr Vulnerability Management System',
  script: 'C:\\HexTrackr\\app\\public\\server.js',
  nodeOptions: [
    '--max_old_space_size=2048'
  ],
  env: {
    name: 'NODE_ENV',
    value: 'production'
  }
});

svc.on('install', function() {
  svc.start();
});

svc.install();
"@ | Out-File -FilePath "install-service.js" -Encoding UTF8

# Install service
node install-service.js
```

---

## Reverse Proxy Configuration

### Nginx Configuration

```nginx
# /etc/nginx/sites-available/hextrackr
upstream hextrackr_app {
    server 127.0.0.1:8989;
    keepalive 32;
}

upstream hextrackr_websocket {
    server 127.0.0.1:8988;
}

# HTTP redirect to HTTPS
server {
    listen 80;
    server_name hextrackr.yourdomain.com;
    return 301 https://$server_name$request_uri;
}

# HTTPS server
server {
    listen 443 ssl http2;
    server_name hextrackr.yourdomain.com;

    # SSL configuration
    ssl_certificate /etc/ssl/certs/hextrackr.crt;
    ssl_certificate_key /etc/ssl/private/hextrackr.key;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512;
    ssl_prefer_server_ciphers off;

    # Security headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options DENY always;
    add_header X-Content-Type-Options nosniff always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    # Main application
    location / {
        proxy_pass http://hextrackr_app;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 86400;
    }

    # WebSocket endpoint
    location /socket.io/ {
        proxy_pass http://hextrackr_websocket;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 86400;
        proxy_send_timeout 86400;
    }

    # Static assets with long cache
    location ~* \.(css|js|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
        proxy_pass http://hextrackr_app;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }

    # Upload size limit
    client_max_body_size 50M;

    # Logging
    access_log /var/log/nginx/hextrackr_access.log;
    error_log /var/log/nginx/hextrackr_error.log;
}
```

### Apache Configuration

```apache
# /etc/apache2/sites-available/hextrackr.conf
<VirtualHost *:80>
    ServerName hextrackr.yourdomain.com
    Redirect permanent / https://hextrackr.yourdomain.com/
</VirtualHost>

<VirtualHost *:443>
    ServerName hextrackr.yourdomain.com

    # SSL Configuration
    SSLEngine on
    SSLCertificateFile /etc/ssl/certs/hextrackr.crt
    SSLCertificateKeyFile /etc/ssl/private/hextrackr.key
    SSLProtocol all -SSLv3 -TLSv1 -TLSv1.1

    # Security Headers
    Header always set Strict-Transport-Security "max-age=31536000; includeSubDomains"
    Header always set X-Frame-Options DENY
    Header always set X-Content-Type-Options nosniff

    # Proxy Configuration
    ProxyPreserveHost On
    ProxyRequests Off

    # Main application
    ProxyPass /socket.io/ ws://127.0.0.1:8988/socket.io/
    ProxyPassReverse /socket.io/ ws://127.0.0.1:8988/socket.io/

    ProxyPass / http://127.0.0.1:8989/
    ProxyPassReverse / http://127.0.0.1:8989/

    # WebSocket support
    RewriteEngine On
    RewriteCond %{HTTP:Upgrade} websocket [NC]
    RewriteCond %{HTTP:Connection} upgrade [NC]
    RewriteRule ^/?(.*) "ws://127.0.0.1:8988/$1" [P,L]

    # Logging
    ErrorLog ${APACHE_LOG_DIR}/hextrackr_error.log
    CustomLog ${APACHE_LOG_DIR}/hextrackr_access.log combined
</VirtualHost>
```

---

## Cloud Deployment

### AWS Deployment with ECS

1. **Create ECS Task Definition**:

```json
{
  "family": "hextrackr",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "512",
  "memory": "1024",
  "executionRoleArn": "arn:aws:iam::ACCOUNT:role/ecsTaskExecutionRole",
  "taskRoleArn": "arn:aws:iam::ACCOUNT:role/ecsTaskRole",
  "containerDefinitions": [
    {
      "name": "hextrackr-app",
      "image": "hextrackr/hextrackr-server:latest",
      "portMappings": [
        {
          "containerPort": 8989,
          "protocol": "tcp"
        },
        {
          "containerPort": 8988,
          "protocol": "tcp"
        }
      ],
      "environment": [
        {
          "name": "NODE_ENV",
          "value": "production"
        },
        {
          "name": "DB_PATH",
          "value": "/data/hextrackr.db"
        }
      ],
      "mountPoints": [
        {
          "sourceVolume": "hextrackr-data",
          "containerPath": "/data"
        }
      ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/hextrackr",
          "awslogs-region": "us-east-1",
          "awslogs-stream-prefix": "ecs"
        }
      },
      "healthCheck": {
        "command": ["CMD-SHELL", "curl -f http://localhost:8989/health || exit 1"],
        "interval": 30,
        "timeout": 5,
        "retries": 3,
        "startPeriod": 60
      }
    }
  ],
  "volumes": [
    {
      "name": "hextrackr-data",
      "efsVolumeConfiguration": {
        "fileSystemId": "fs-0123456789abcdef0",
        "rootDirectory": "/hextrackr-data"
      }
    }
  ]
}
```

2. **Application Load Balancer Configuration**:

```yaml
# ALB Target Groups
- HealthCheckPath: /health
  HealthCheckProtocol: HTTP
  HealthCheckIntervalSeconds: 30
  HealthyThresholdCount: 2
  Port: 8989
  Protocol: HTTP
  UnhealthyThresholdCount: 5
  VpcId: vpc-12345678
  TargetType: ip

# WebSocket Target Group
- HealthCheckPath: /socket.io/
  HealthCheckProtocol: HTTP
  Port: 8988
  Protocol: HTTP
  VpcId: vpc-12345678
  TargetType: ip
```

### Azure Container Instances

```yaml
# azure-container-instance.yml
apiVersion: 2018-10-01
location: eastus
name: hextrackr-aci
properties:
  containers:
  - name: hextrackr-app
    properties:
      image: hextrackr/hextrackr-server:latest
      ports:
      - port: 8989
        protocol: TCP
      - port: 8988
        protocol: TCP
      resources:
        requests:
          cpu: 1
          memoryInGb: 2
      environmentVariables:
      - name: NODE_ENV
        value: production
      - name: PORT
        value: "8989"
      - name: WEBSOCKET_PORT
        value: "8988"
      volumeMounts:
      - name: hextrackr-data
        mountPath: /data
  volumes:
  - name: hextrackr-data
    azureFile:
      shareName: hextrackr-data
      storageAccountName: yourstorageaccount
      storageAccountKey: yourkey
  osType: Linux
  ipAddress:
    type: Public
    ports:
    - protocol: TCP
      port: 8989
    - protocol: TCP
      port: 8988
    dnsNameLabel: hextrackr-demo
tags:
  Environment: Production
  Application: HexTrackr
type: Microsoft.ContainerInstance/containerGroups
```

---

## Kubernetes Deployment

### Deployment Manifests

1. **Namespace and ConfigMap**:

```yaml
# namespace.yml
apiVersion: v1
kind: Namespace
metadata:
  name: hextrackr

---
# configmap.yml
apiVersion: v1
kind: ConfigMap
metadata:
  name: hextrackr-config
  namespace: hextrackr
data:
  NODE_ENV: "production"
  PORT: "8989"
  WEBSOCKET_PORT: "8988"
  LOG_LEVEL: "warn"
  COMPRESSION_ENABLED: "true"
  CACHE_ENABLED: "true"
```

2. **Persistent Volume and Claims**:

```yaml
# storage.yml
apiVersion: v1
kind: PersistentVolume
metadata:
  name: hextrackr-data-pv
spec:
  capacity:
    storage: 100Gi
  accessModes:
    - ReadWriteOnce
  persistentVolumeReclaimPolicy: Retain
  storageClassName: fast-ssd
  hostPath:
    path: /data/hextrackr

---
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: hextrackr-data-pvc
  namespace: hextrackr
spec:
  accessModes:
    - ReadWriteOnce
  storageClassName: fast-ssd
  resources:
    requests:
      storage: 100Gi
```

3. **Deployment**:

```yaml
# deployment.yml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: hextrackr-app
  namespace: hextrackr
  labels:
    app: hextrackr
spec:
  replicas: 2
  selector:
    matchLabels:
      app: hextrackr
  template:
    metadata:
      labels:
        app: hextrackr
    spec:
      containers:
      - name: hextrackr
        image: hextrackr/hextrackr-server:1.0.13
        ports:
        - containerPort: 8989
          name: http
        - containerPort: 8988
          name: websocket
        envFrom:
        - configMapRef:
            name: hextrackr-config
        volumeMounts:
        - name: data
          mountPath: /data
        - name: uploads
          mountPath: /app/public/uploads
        resources:
          requests:
            memory: "1Gi"
            cpu: "500m"
          limits:
            memory: "2Gi"
            cpu: "1000m"
        livenessProbe:
          httpGet:
            path: /health
            port: 8989
          initialDelaySeconds: 30
          periodSeconds: 30
        readinessProbe:
          httpGet:
            path: /health
            port: 8989
          initialDelaySeconds: 10
          periodSeconds: 10
      volumes:
      - name: data
        persistentVolumeClaim:
          claimName: hextrackr-data-pvc
      - name: uploads
        emptyDir: {}
```

4. **Services**:

```yaml
# services.yml
apiVersion: v1
kind: Service
metadata:
  name: hextrackr-service
  namespace: hextrackr
spec:
  selector:
    app: hextrackr
  ports:
  - name: http
    port: 8989
    targetPort: 8989
  - name: websocket
    port: 8988
    targetPort: 8988
  type: ClusterIP

---
apiVersion: v1
kind: Service
metadata:
  name: hextrackr-websocket
  namespace: hextrackr
spec:
  selector:
    app: hextrackr
  ports:
  - name: websocket
    port: 8988
    targetPort: 8988
  type: ClusterIP
```

5. **Ingress**:

```yaml
# ingress.yml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: hextrackr-ingress
  namespace: hextrackr
  annotations:
    nginx.ingress.kubernetes.io/proxy-read-timeout: "3600"
    nginx.ingress.kubernetes.io/proxy-send-timeout: "3600"
    nginx.ingress.kubernetes.io/websocket-services: "hextrackr-websocket"
spec:
  tls:
  - hosts:
    - hextrackr.yourdomain.com
    secretName: hextrackr-tls
  rules:
  - host: hextrackr.yourdomain.com
    http:
      paths:
      - path: /socket.io
        pathType: Prefix
        backend:
          service:
            name: hextrackr-websocket
            port:
              number: 8988
      - path: /
        pathType: Prefix
        backend:
          service:
            name: hextrackr-service
            port:
              number: 8989
```

---

## Security Hardening

### System Security

1. **Firewall Configuration**:

```bash
# UFW (Ubuntu)
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 8989/tcp  # HexTrackr HTTP
sudo ufw allow 8988/tcp  # HexTrackr WebSocket
sudo ufw enable

# firewalld (RHEL)
sudo firewall-cmd --permanent --add-port=8989/tcp
sudo firewall-cmd --permanent --add-port=8988/tcp
sudo firewall-cmd --reload
```

2. **SSL/TLS Certificate Setup**:

```bash
# Let's Encrypt with Certbot
sudo apt-get update
sudo apt-get install certbot python3-certbot-nginx

# Obtain certificate
sudo certbot --nginx -d hextrackr.yourdomain.com

# Auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

3. **Application Security**:

```bash
# Create secure environment file
sudo tee /opt/hextrackr/.env.secure << EOF
# Generate secure session secret
SESSION_SECRET=$(openssl rand -hex 32)

# Enable security features
SECURITY_HSTS_ENABLED=true
SECURITY_CONTENT_TYPE_NOSNIFF=true
SECURITY_FRAME_OPTIONS=DENY
CORS_ORIGIN=https://hextrackr.yourdomain.com
SESSION_COOKIE_SECURE=true
EOF
```

---

## Monitoring and Maintenance

### Health Monitoring

1. **Health Check Script**:

```bash
#!/bin/bash
# health-check.sh

API_URL="http://localhost:8989"
WS_URL="ws://localhost:8988"

# Check HTTP API
if curl -f -s "${API_URL}/health" > /dev/null; then
    echo "✓ HTTP API healthy"
else
    echo "✗ HTTP API unhealthy"
    exit 1
fi

# Check WebSocket (requires wscat: npm install -g wscat)
if echo "ping" | wscat -c "${WS_URL}" -w 5 > /dev/null 2>&1; then
    echo "✓ WebSocket healthy"
else
    echo "✗ WebSocket unhealthy"
    exit 1
fi

echo "✓ All services healthy"
```

2. **Log Rotation**:

```bash
# /etc/logrotate.d/hextrackr
/opt/hextrackr/logs/*.log {
    daily
    rotate 30
    compress
    delaycompress
    missingok
    notifempty
    create 0644 hextrackr hextrackr
    postrotate
        systemctl reload hextrackr
    endscript
}
```

### Backup Strategy

```bash
#!/bin/bash
# backup.sh

BACKUP_DIR="/backup/hextrackr"
DATE=$(date +%Y%m%d_%H%M%S)

# Create backup directory
mkdir -p "${BACKUP_DIR}"

# Database backup
cp /opt/hextrackr/data/hextrackr.db "${BACKUP_DIR}/hextrackr_${DATE}.db"

# Configuration backup
cp /opt/hextrackr/.env "${BACKUP_DIR}/config_${DATE}.env"

# Uploads backup (if significant)
tar -czf "${BACKUP_DIR}/uploads_${DATE}.tar.gz" /opt/hextrackr/uploads/

# Clean old backups (keep 30 days)
find "${BACKUP_DIR}" -type f -mtime +30 -delete

echo "Backup completed: ${DATE}"
```

This comprehensive deployment guide provides everything needed for secure, scalable HexTrackr deployments across various environments and platforms.
