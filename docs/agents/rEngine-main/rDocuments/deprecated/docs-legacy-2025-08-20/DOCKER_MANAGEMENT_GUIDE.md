# 🐳 Docker Container Management Documentation

*Complete guide for the StackTrackr Docker environment and port management*

---

## 🎯 **Overview**

The Docker Container Management system provides a professional, conflict-free multi-service architecture for the StackTrackr platform. All services run in isolated containers with dedicated port allocations to eliminate conflicts with other development tools.

## Key Benefits:

- ✅ **Zero Port Conflicts**: Dedicated port range 3032-3038
- ✅ **Professional Architecture**: Multi-service container orchestration
- ✅ **Easy Access**: Single nginx proxy entry point
- ✅ **Development Ready**: Hot-reload, debugging, and logging

---

## 🚀 **Quick Start**

### **Start Development Environment**

```bash

# One-command startup

./docker-dev.sh start

# Access your application

open http://localhost:3032
```

### **Service Access Points**

```bash

# Entry Point (nginx proxy)

http://localhost:3032

# Direct Service Access

http://localhost:3033  # StackTrackr App
http://localhost:3034  # rEngine Platform  
http://localhost:3036  # MCP Server
http://localhost:3037  # Development Server
```

---

## 📊 **Port Allocation System**

### **Port Range: 3032-3038**

*Dedicated range to avoid conflicts with MCP Memory server (port 3000) and other tools*

| Service | External Port | Internal Port | Purpose |
|---------|---------------|---------------|---------|
| **nginx** | 3032 | 80 | Main entry point (HTTP) |
| **nginx** | 3038 | 443 | Secure entry point (HTTPS) |
| **stacktrackr-app** | 3033 | 3000 | Main application |
| **rengine-platform** | 3034 | 8080 | rEngine API |
| **rengine-platform** | 3035 | 8081 | rEngine WebSocket |
| **mcp-server** | 3036 | 8082 | Model Context Protocol |
| **development** | 3037 | 8000 | Development server |

### **Port Selection Strategy**

- **No Conflicts**: Avoids common development ports (3000, 8080, 8000)
- **Sequential**: Easy to remember and manage
- **Reserved Range**: Dedicated block prevents future conflicts
- **Standard Protocols**: HTTP (80) and HTTPS (443) preserved internally

---

## 🔧 **Docker Development Scripts**

### **Primary Control Script: docker-dev.sh**

#### **Commands**

```bash

# Start all services

./docker-dev.sh start

# Stop all services  

./docker-dev.sh stop

# Restart all services

./docker-dev.sh restart

# View logs for all services

./docker-dev.sh logs

# View logs for specific service

./docker-dev.sh logs stacktrackr-app
./docker-dev.sh logs rengine-platform
./docker-dev.sh logs mcp-server
```

#### **Features**

- ✅ **Health Check Validation**: Ensures services are running properly
- ✅ **Service Dependency Management**: Starts services in correct order
- ✅ **Automatic Port Conflict Detection**: Warns if ports are in use
- ✅ **Development Environment Setup**: Configures hot-reload and debugging

---

## 🏗️ **Docker Compose Architecture**

### **Core Configuration (docker-compose.yml)**

```yaml
version: '3.8'

services:
  nginx:
    image: nginx:alpine
    ports:

      - "3032:80"    # HTTP entry point
      - "3038:443"   # HTTPS entry point

    depends_on:

      - stacktrackr-app
      - rengine-platform

  stacktrackr-app:
    build: .
    ports:

      - "3033:3000"  # Main application

    environment:

      - NODE_ENV=development

    volumes:

      - .:/app
      - /app/node_modules

  rengine-platform:
    build: ./rEngine
    ports:

      - "3034:8080"  # API server
      - "3035:8081"  # WebSocket server

    environment:

      - RENGINE_ENV=development

    volumes:

      - ./rEngine:/app

  mcp-server:
    build: ./rEngineMCP
    ports:

      - "3036:8082"  # MCP protocol

    environment:

      - MCP_ENV=development

```

### **Service Descriptions**

#### **nginx (Reverse Proxy)**

- **Purpose**: Main entry point and load balancer
- **Features**: SSL termination, request routing, static file serving
- **Configuration**: Routes requests to appropriate backend services
- **Access**: Primary entry at <http://localhost:3032>

#### **stacktrackr-app (Main Application)**

- **Purpose**: Core StackTrackr web application
- **Features**: React frontend, API integration, user interface
- **Development**: Hot-reload enabled, source maps available
- **Access**: Direct access at <http://localhost:3033>

#### **rengine-platform (AI Engine)**

- **Purpose**: AI processing and agent management
- **Features**: Model execution, memory management, API services
- **Ports**: Dual port setup for API (3034) and WebSocket (3035)
- **Access**: API at <http://localhost:3034>

#### **mcp-server (Model Context Protocol)**

- **Purpose**: Standardized AI model communication
- **Features**: Protocol compliance, model abstraction, context management
- **Integration**: Works with multiple AI providers
- **Access**: MCP protocol at <http://localhost:3036>

---

## 🛠️ **System Requirements & Validation**

### **Docker Requirement Check Script**

```bash

# Validate system requirements

./scripts/docker-requirement-check.sh
```

#### **Validation Checks**

1. **Docker Installation**: Verifies Docker is installed and accessible
2. **Docker Daemon**: Ensures Docker daemon is running
3. **System Resources**: Checks available RAM, disk space, CPU
4. **Port Availability**: Validates ports 3032-3038 are free
5. **Network Configuration**: Ensures Docker networking is functional

#### **Automatic Installation Guidance**

```bash

# If Docker not found, script provides:

echo "Docker not found. Install options:"
echo "1. Docker Desktop: https://www.docker.com/products/docker-desktop"
echo "2. Docker Engine: https://docs.docker.com/engine/install/"
echo "3. For macOS: brew install --cask docker"
```

### **Resource Requirements**

- **RAM**: Minimum 4GB, Recommended 8GB
- **Disk**: 2GB free space for containers
- **CPU**: 2+ cores recommended
- **Network**: Internet access for image downloads

---

## 🔄 **Integration with Development Workflow**

### **With Mobile Development System**

- **Complementary**: Docker environment works alongside mobile development
- **Port Sharing**: Uses same port allocation strategy
- **Service Detection**: Mobile system automatically detects Docker availability

```bash

# Mobile development fallback when Docker unavailable

if ! docker --version &> /dev/null; then
    echo "Docker not available, using mobile fallback mode"
    export NO_DOCKER=true
fi
```

### **With rEngine Platform**

- **Service Integration**: All rEngine components containerized
- **Memory Sharing**: Persistent volumes for data continuity
- **API Gateway**: nginx routes rEngine API calls correctly

### **With Git Workflow**

- **Branch Safe**: Docker environment works with any Git branch
- **Volume Mounts**: Source code changes reflected immediately
- **Build Context**: Dockerfile optimized for development

---

## 📊 **Performance & Monitoring**

### **Service Health Checks**

```bash

# Built-in health monitoring

docker-compose ps

# Individual service status

curl -f http://localhost:3032/health
curl -f http://localhost:3033/api/health
curl -f http://localhost:3034/health
```

### **Resource Monitoring**

```bash

# Monitor container resource usage

docker stats

# View container logs

docker logs stacktrackr_stacktrackr-app_1
docker logs stacktrackr_rengine-platform_1
docker logs stacktrackr_mcp-server_1
```

### **Performance Optimization**

- **Build Caching**: Multi-stage builds for faster rebuilds
- **Volume Optimization**: Node modules cached in volumes
- **Memory Limits**: Containers sized appropriately
- **Network Efficiency**: Internal container networking

---

## 🚨 **Troubleshooting**

### **Common Issues**

#### **Port Already in Use**

```bash

# Check what's using the port

lsof -i :3032

# Kill process if necessary

kill -9 <PID>

# Or use different port range in docker-compose.yml

ports:

  - "4032:80"  # Alternative port

```

#### **Container Won't Start**

```bash

# Check container logs

docker logs <container_name>

# Rebuild container

docker-compose build --no-cache <service_name>

# Reset everything

docker-compose down --volumes
docker-compose up --build
```

#### **Services Can't Communicate**

```bash

# Check network connectivity

docker network ls
docker network inspect stacktrackr_default

# Test service connectivity

docker exec -it <container> ping <other_service>
```

### **Recovery Procedures**

#### **Complete Reset**

```bash

# Nuclear option: reset everything

docker-compose down --volumes --remove-orphans
docker system prune -a
docker-compose up --build
```

#### **Selective Service Restart**

```bash

# Restart specific service

docker-compose restart stacktrackr-app
docker-compose restart rengine-platform
```

#### **Port Conflict Resolution**

```bash

# Automatic port detection and assignment

./scripts/find-available-ports.sh 3032 6

# Returns: Available ports starting from 3032

```

---

## 🔧 **Customization Options**

### **Environment Variables**

```yaml

# In docker-compose.yml

environment:

  - NODE_ENV=development      # Change to production
  - DEBUG=true               # Enable debug logging
  - LOG_LEVEL=info          # Set logging level
  - API_TIMEOUT=30000       # Customize API timeout

```

### **Port Customization**

```yaml

# Change external ports while keeping internal ports

services:
  stacktrackr-app:
    ports:

      - "4033:3000"  # Use port 4033 instead of 3033

```

### **Volume Mounts**

```yaml

# Add custom volume mounts

volumes:

  - ./custom-config:/app/config
  - ./logs:/app/logs
  - type: tmpfs

    target: /app/tmp
```

### **Resource Limits**

```yaml

# Set container resource limits

deploy:
  resources:
    limits:
      cpus: '2.0'
      memory: 2G
    reservations:
      cpus: '1.0'
      memory: 1G
```

---

## 📚 **Best Practices**

### **Development Workflow**

- ✅ **Use docker-dev.sh**: Always use the wrapper script
- ✅ **Check Health**: Verify services are running before development
- ✅ **Monitor Logs**: Keep an eye on container logs during development
- ✅ **Clean Builds**: Use `--no-cache` when dependencies change

### **Container Management**

- ✅ **Regular Cleanup**: Run `docker system prune` weekly
- ✅ **Image Updates**: Pull latest base images monthly
- ✅ **Volume Backup**: Backup persistent volumes before major changes
- ✅ **Security Updates**: Keep Docker and base images updated

### **Troubleshooting**

- ✅ **Check Logs First**: Always start with container logs
- ✅ **Isolate Issues**: Test individual services
- ✅ **Verify Ports**: Ensure no port conflicts
- ✅ **Test Connectivity**: Verify service-to-service communication

---

## 📞 **Support & Maintenance**

### **File Locations**

```
Docker Configuration:
├── docker-compose.yml (Main configuration)
├── docker-dev.sh (Management script)
├── Dockerfile (Main app container)
├── rEngine/Dockerfile (rEngine container)
└── rEngineMCP/Dockerfile (MCP container)

Scripts:
├── scripts/docker-requirement-check.sh
├── scripts/find-available-ports.sh
└── one-click-startup.js (Docker integration)

Generated Files:
├── docker-compose.override.yml (Local overrides)
└── .docker/ (Build cache and logs)
```

### **Log Files**

- **Container Logs**: `docker logs <container_name>`
- **Build Logs**: `docker-compose build --progress=plain`
- **System Logs**: `docker system events`
- **Performance Logs**: `docker stats --no-stream`

### **Maintenance Tasks**

- **Weekly**: Clean unused containers and images
- **Monthly**: Update base images and dependencies  
- **Quarterly**: Review resource allocation and limits
- **Before Releases**: Full system test and validation

---

## 🔗 **Integration Examples**

### **With CI/CD Pipeline**

```yaml

# GitHub Actions example

- name: Start Docker Environment

  run: ./docker-dev.sh start
  
- name: Run Tests

  run: npm test

- name: Health Check

  run: curl -f http://localhost:3032/health
```

### **With Monitoring Tools**

```bash

# Prometheus metrics endpoint

curl http://localhost:3034/metrics

# Custom health check

curl http://localhost:3032/api/status
```

### **With Load Testing**

```bash

# Test nginx proxy performance

ab -n 1000 -c 10 http://localhost:3032/

# Test direct service performance  

ab -n 1000 -c 10 http://localhost:3033/api/inventory
```

---

*Last Updated: August 18, 2025*  
*Version: 2.1.0*  
*Status: Production Ready*
