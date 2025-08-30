# rEngine Platform Docker Migration Guide

## 🎯 **Overview**

This guide covers the immediate Docker migration of the rEngine Platform development environment, eliminating VS Code script execution prompts and providing a consistent containerized development experience.

## 🚀 **Quick Start**

### **Prerequisites**

- Docker Desktop installed and running
- VS Code with Dev Containers extension
- Git repository cloned locally

### **Launch Development Environment**

```bash

# One-command startup

./docker-dev.sh start

# Or manual Docker Compose

docker-compose up -d
```

### **Open in VS Code**

```bash

# Launch VS Code with dev container

./docker-dev.sh vscode

# Or manually

code .

# Then select "Reopen in Container" when prompted

```

## 🏗️ **Architecture**

### **Container Structure**

```
rEngine Platform Docker Architecture
├── stacktrackr-app     (Port 3000) - Main web application
├── rengine-platform    (Port 8080) - Multi-agent services  
├── mcp-server          (Port 8082) - Memory/knowledge graph
├── development         (Port 8000) - VS Code dev environment
└── nginx               (Port 80)   - Reverse proxy
```

### **Network Topology**

```
Host Machine
├── localhost:3000  → StackTrackr App
├── localhost:8080  → rEngine Platform
├── localhost:8082  → MCP Server
└── localhost:80    → nginx (production-like routing)
```

## 📋 **Container Services**

### **stacktrackr-app**

- **Purpose**: Main StackTrackr web application
- **Base Image**: `node:18-alpine`
- **Port**: 3000
- **Volume Mounts**: Live code editing support
- **Environment**: Development mode with hot reload

### **rengine-platform**

- **Purpose**: Multi-agent AI orchestration services
- **Base Image**: `node:18-alpine`
- **Ports**: 8080 (main), 8081 (services)
- **Dependencies**: MCP Server
- **Features**: Nodemon for auto-restart on changes

### **mcp-server**

- **Purpose**: Memory Context Protocol server
- **Base Image**: `node:18-alpine`  
- **Port**: 8082
- **Data Persistence**: `/data` volume for memory storage
- **Health Checks**: Built-in health monitoring

### **development**

- **Purpose**: VS Code dev container environment
- **Base Image**: `mcr.microsoft.com/vscode/devcontainers/javascript-node:18`
- **Features**: Full development toolchain
- **Extensions**: Copilot, TypeScript, Docker, etc.

### **nginx**

- **Purpose**: Reverse proxy and load balancer
- **Base Image**: `nginx:alpine`
- **Port**: 80
- **Configuration**: Production-like routing setup

## 🛠️ **Management Commands**

### **Docker Development Script** (`./docker-dev.sh`)

```bash

# Essential Commands

./docker-dev.sh start      # Start all services
./docker-dev.sh stop       # Stop all services  
./docker-dev.sh restart    # Restart everything
./docker-dev.sh status     # Show service status

# Development Commands  

./docker-dev.sh shell      # Open development shell
./docker-dev.sh vscode     # Launch VS Code in container
./docker-dev.sh logs       # View all logs
./docker-dev.sh logs rengine  # View specific service logs

# Maintenance Commands

./docker-dev.sh build      # Rebuild containers
./docker-dev.sh update     # Update and rebuild
./docker-dev.sh backup     # Backup data
./docker-dev.sh clean      # Remove all containers/data
```

### **Direct Docker Compose Commands**

```bash

# Service management

docker-compose up -d                    # Start all services
docker-compose down                     # Stop all services
docker-compose restart rengine-platform # Restart specific service

# Development

docker-compose exec development bash    # Development shell
docker-compose logs -f rengine-platform # Follow logs

# Debugging

docker-compose ps                       # Show running containers
docker-compose top                      # Show processes
```

## 💻 **VS Code Development**

### **Dev Container Features**

- ✅ **No Script Prompts**: All scripts run within container
- ✅ **Live Editing**: File changes sync immediately  
- ✅ **Integrated Terminal**: Direct access to containerized environment
- ✅ **Extension Support**: Pre-configured development extensions
- ✅ **Port Forwarding**: Automatic port mapping to host

### **Recommended Workflow**

1. **Open Project**: `code .` in project directory
2. **Reopen in Container**: Accept VS Code prompt
3. **Automatic Setup**: Post-create commands install dependencies
4. **Start Development**: All services running and ready

### **Debugging Setup**

```json
// .vscode/launch.json (auto-configured)
{
  "type": "node",
  "request": "launch",
  "name": "Debug rEngine",
  "program": "${workspaceFolder}/rEngine/index.js",
  "env": {
    "NODE_ENV": "development"
  }
}
```

## 🔧 **Configuration**

### **Environment Variables**

```bash

# docker-compose.yml environment section

NODE_ENV=development
MCP_SERVER_URL=http://mcp-server:8082
DATA_PATH=/data
```

### **Volume Mounts**

```yaml

# Live development volume mounts

volumes:

  - ./:/workspace                    # Full project access
  - ./rEngine:/rengine              # rEngine source
  - ./rMemory:/data                 # Memory persistence
  - /workspace/node_modules         # Optimize node_modules

```

### **Port Mapping**

```yaml

# Host:Container port mappings

ports:

  - "3000:3000"    # StackTrackr App
  - "8080:8080"    # rEngine Platform  
  - "8081:8081"    # rEngine Services
  - "8082:8082"    # MCP Server
  - "80:80"        # nginx Proxy

```

## 🚨 **Troubleshooting**

### **Common Issues**

## Docker Not Running

```bash

# Check Docker status

docker info

# Start Docker Desktop

open -a Docker
```

## Port Conflicts

```bash

# Check what's using ports

lsof -i :3000
lsof -i :8080

# Kill processes if needed

kill -9 $(lsof -t -i:3000)
```

## Container Build Failures

```bash

# Clean rebuild

./docker-dev.sh clean
./docker-dev.sh build

# Check build logs

docker-compose build --no-cache --progress=plain
```

## Permission Issues

```bash

# Fix volume permissions

docker-compose exec development chown -R node:node /workspace
```

## Memory/Disk Issues

```bash

# Clean Docker system

docker system prune -f
docker volume prune -f

# Check disk usage

docker system df
```

### **Health Checks**

```bash

# Service health

./docker-dev.sh health

# Manual health checks

curl http://localhost:3000      # StackTrackr
curl http://localhost:8080      # rEngine  
curl http://localhost:8082      # MCP Server
```

## 📊 **Benefits Achieved**

### **Development Experience**

- ✅ **No Script Prompts**: Eliminated macOS security interruptions
- ✅ **Consistent Environment**: Same setup across all machines
- ✅ **Fast Setup**: One command to running development environment
- ✅ **Isolation**: No conflicts with host system packages

### **Operational Benefits**

- ✅ **Scalability**: Easy to add new services
- ✅ **Monitoring**: Built-in health checks and logging
- ✅ **Backup/Recovery**: Simple data persistence and backup
- ✅ **Production Parity**: Development matches deployment

## 🔮 **Next Steps**

### **Immediate Enhancements**

- [ ] **Service Discovery**: Automatic service registration
- [ ] **Load Balancing**: Multiple instance support
- [ ] **SSL/TLS**: HTTPS development environment
- [ ] **Database Integration**: PostgreSQL/Redis containers

### **Production Preparation**

- [ ] **CI/CD Pipeline**: Automated building and deployment
- [ ] **Monitoring Stack**: Prometheus + Grafana
- [ ] **Log Aggregation**: ELK stack integration
- [ ] **Security Hardening**: Container security best practices

### **Platform Features**

- [ ] **Multi-Project Support**: Isolated environments per project
- [ ] **Resource Management**: CPU/memory limits and quotas
- [ ] **Auto-Scaling**: Horizontal scaling based on load
- [ ] **Backup Automation**: Scheduled data backups

---

## 📚 **Additional Resources**

- **Docker Compose Reference**: <https://docs.docker.com/compose/>
- **VS Code Dev Containers**: <https://code.visualstudio.com/docs/remote/containers>
- **Node.js Docker Best Practices**: <https://nodejs.org/en/docs/guides/nodejs-docker-webapp/>

**Last Updated**: August 18, 2025  
**Version**: rEngine Platform v2.1.0  
**Status**: ✅ Initial Docker Infrastructure Complete
