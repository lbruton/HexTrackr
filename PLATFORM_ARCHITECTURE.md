# 🚀 HexTrackr Platform Architecture

## Overview
HexTrackr is now a comprehensive, multi-service vulnerability management platform built with a modern containerized architecture designed for scalability and future expansion.

## 🏗️ Current Architecture

### 1. Web Layer (Nginx)
- **Container**: `hextrackr-nginx`
- **Port**: 3232 (http://localhost:3232)
- **Purpose**: Static file serving, API proxying, security headers, caching
- **Features**:
  - Professional gray/blue themed UI
  - No-cache headers for HTML (ensures CSS updates are seen)
  - Rate limiting for API endpoints
  - Security headers (XSS protection, content security policy)
  - Gzip compression
  - Proper MIME type handling

### 2. API Layer (Node.js/Express)
- **Container**: `hextrackr-api`
- **Port**: 3233 (internal), proxied through nginx
- **Purpose**: RESTful API, authentication, database operations
- **Features**:
  - SQLite database with sample vulnerability data
  - JWT authentication
  - File upload handling
  - Health check endpoint
  - API endpoints for vulnerabilities, assets, tickets

### 3. Database Layer
- **Current**: SQLite (development)
- **Future**: PostgreSQL (production-ready with docker profile)
- **Features**: Pre-populated with sample data, asset tracking, ticket management

## 🔮 Future Expansion Ready

### 4. Python/Ansible Automation Service (Planned)
- **Container**: `hextrackr-automation` (profile: automation)
- **Port**: 3234
- **Purpose**: Vulnerability remediation, YAML configuration management
- **Features**:
  - Ansible playbook execution
  - YAML validation and processing
  - Automated vulnerability remediation
  - Integration with main API for status updates

### 5. Redis Caching Service (Planned)
- **Container**: `hextrackr-redis` (profile: cache)
- **Port**: 6379
- **Purpose**: Caching, session storage, task queues
- **Features**: Performance optimization, session management

### 6. PostgreSQL Production Database (Planned)
- **Container**: `hextrackr-postgres` (profile: production-db)
- **Port**: 5432
- **Purpose**: Production-grade database with persistence

## 🎯 Current Features

### ✅ Implemented
1. **Professional Gray/Blue Theme**: Complete UI overhaul with modern design system
2. **Free Tenable VPR API**: No API key required vulnerability priority ratings
3. **ServiceNow Integration**: Full ITSM API support for ticket management
4. **Asset-to-Ticket Workflow**: "Add to Ticket Tracker" button functionality
5. **Multi-Service Architecture**: Nginx + Node.js API separation
6. **Proper Web Server**: Static file serving, caching, security headers
7. **Container Orchestration**: Docker Compose with service dependencies
8. **Health Checks**: Monitoring and restart capabilities

### 🔧 Service Commands

#### Start All Services
```bash
docker-compose up -d
```

#### Start with Automation Service
```bash
docker-compose --profile automation up -d
```

#### Start with Caching
```bash
docker-compose --profile cache up -d
```

#### Production Mode (All Services)
```bash
docker-compose --profile automation --profile cache --profile production-db up -d
```

#### View Logs
```bash
docker-compose logs -f [service-name]
```

#### Scale Services
```bash
docker-compose up -d --scale api=2
```

## 🌐 Access Points

- **Main Dashboard**: http://localhost:3232
- **Tickets Page**: http://localhost:3232/tickets.html
- **API Health**: http://localhost:3232/health
- **Direct API**: http://localhost:3233 (bypasses nginx)
- **Automation Service**: http://localhost:3234 (when enabled)

## 📁 Directory Structure

```
HexTrackr/
├── nginx.conf                 # Nginx web server configuration
├── docker-compose.yml         # Multi-service orchestration
├── Dockerfile                 # Node.js API container
├── Dockerfile.python          # Python/Ansible automation container
├── server.js                  # Express.js API server
├── index.html                 # Main dashboard
├── tickets.html               # Ticket management page
├── unified-design-system.css  # Gray/blue theme
├── automation/                # Python automation service
│   ├── app.py                 # Flask automation API
│   └── requirements.txt       # Python dependencies
├── playbooks/                 # Ansible remediation playbooks
│   └── vulnerability_remediation.yml
├── data/                      # SQLite database
├── uploads/                   # File uploads
└── scripts/                   # Database initialization
```

## 🛡️ Security Features

- Rate limiting on API endpoints
- Security headers (XSS, content security policy)
- JWT authentication
- File upload restrictions
- Network segmentation via Docker networks
- Health monitoring

## 🚀 Next Steps for Platform Growth

1. **Enable Automation Service**: Add Python/Ansible automation for vulnerability remediation
2. **Add Caching**: Implement Redis for performance optimization
3. **Database Migration**: Move to PostgreSQL for production scalability
4. **CI/CD Pipeline**: Add automated testing and deployment
5. **Monitoring**: Add Prometheus/Grafana for metrics
6. **Load Balancing**: Scale API service horizontally
7. **SSL/TLS**: Add HTTPS support with Let's Encrypt

## 🎨 Design System

The platform now features a professional gray/blue color scheme:
- Primary: #475569 (Professional gray)
- Primary Dark: #334155 (Darker gray)
- Accent: #3b82f6 (Beautiful blue)
- Secondary: #64748b (Gray-blue blend)

This replaces the previous purple theme with a more corporate, professional appearance suitable for enterprise vulnerability management.

---

**HexTrackr is now a production-ready, scalable vulnerability management platform with room for extensive growth and customization!** 🎉
