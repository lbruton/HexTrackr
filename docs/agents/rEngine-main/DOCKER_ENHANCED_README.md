# 🚀 rEngine Enhanced Docker Platform

A comprehensive development environment with integrated MCP servers, project tracking, and live development tools.

## 🎯 What This Gives You

### 🔌 **MCP Server Library** (No Authentication Required)

- **Filesystem MCP** (4040): Complete workspace file access
- **Memory MCP** (4041): Persistent memory across sessions
- **GitHub MCP** (4042): Repository management and issue tracking
- **Git MCP** (4047): Version control operations
- **SQLite MCP** (4048): Database operations and queries
- **Context7 MCP** (4049): Long-term context management and compression
- **Playwright MCP** (4050): Browser automation and HTML/JS testing
- **TimeSeries MCP** (4051): Track context evolution and memory patterns

### 💻 **Development Tools**

- **Code Executor** (4043): Test JavaScript/Python code in isolated environment
- **Live Dev Server** (4044): Auto-reload on file changes with WebSocket
- **Project Dashboard** (4046): Real-time project tracking from MASTER_ROADMAP.md

### 🌐 **Unified Access**

- **Main Gateway** (4032): Single entry point to all services
- **Enhanced Nginx**: Intelligent routing and load balancing
- **Health Monitoring**: Automatic service health checks

## 🚀 Quick Start

### 1. **Setup Environment**

```bash

# Copy environment template

cp .env.example .env

# Edit with your preferences (GitHub token optional)

nano .env
```

### 2. **Start Enhanced Platform**

```bash

# Start with all MCP servers and development tools

./docker/rengine-manager.sh start enhanced

# Or start basic setup only

./docker/rengine-manager.sh start basic
```

### 3. **Access Your Tools**

- 🌐 **Main Dashboard**: <http://localhost:4032>
- 📊 **Project Tracking**: <http://localhost:4046>  
- 💻 **Code Executor**: <http://localhost:4043>
- 🔥 **Live Dev Server**: <http://localhost:4044>

## 🔧 Management Commands

```bash

# Start/Stop Services

./docker/rengine-manager.sh start enhanced    # Full setup
./docker/rengine-manager.sh start basic       # Minimal setup
./docker/rengine-manager.sh stop              # Stop all services
./docker/rengine-manager.sh restart enhanced  # Restart with full setup

# Monitoring & Debugging

./docker/rengine-manager.sh status            # Show service status
./docker/rengine-manager.sh health            # Health check all services
./docker/rengine-manager.sh mcp-status        # Check MCP servers
./docker/rengine-manager.sh ports             # List all ports
./docker/rengine-manager.sh logs              # View all logs
./docker/rengine-manager.sh logs mcp-github   # Specific service logs

# Development

./docker/rengine-manager.sh shell development # Open shell in dev container
./docker/rengine-manager.sh dashboard         # Open dashboard in browser
./docker/rengine-manager.sh build             # Rebuild images
./docker/rengine-manager.sh clean             # Clean all containers/volumes
```

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                     🌐 Nginx Gateway (4032)                     │
│              Single Entry Point + Load Balancing               │
└─────────────────────────────────────────────────────────────────┘
                                  │
                 ┌────────────────┼────────────────┐
                 │                │                │
    ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
    │  📦 StackTrackr  │  │ 🚀 rEngine      │  │ 📊 Project      │
    │     (4033)      │  │   Platform      │  │   Dashboard     │
    │                 │  │   (4034-4035)   │  │     (4046)      │
    └─────────────────┘  └─────────────────┘  └─────────────────┘
                                  │
    ┌─────────────────────────────┼─────────────────────────────┐
    │                             │                             │
┌─────────────────┐  ┌─────────────────┐              ┌─────────────────┐
│ 💻 Code Executor │  │ 🔥 Live Dev     │              │ 🔌 MCP Servers  │
│     (4043)      │  │   Server        │              │   (4040-4048)   │
│                 │  │   (4044-4045)   │              │                 │
└─────────────────┘  └─────────────────┘              └─────────────────┘
```

## 🔌 MCP Server Details

### **Filesystem MCP (4040)**

- **Purpose**: Complete workspace file access
- **Capabilities**: Read, write, search, monitor files
- **Volume**: Entire workspace mounted at `/workspace`

### **Memory MCP (4041)**  

- **Purpose**: Persistent memory across sessions
- **Capabilities**: Store/retrieve conversation context
- **Storage**: `./persistent-memory.json`

### **GitHub MCP (4042)**

- **Purpose**: Repository and project management
- **Capabilities**: Issues, PRs, commits, project tracking
- **Auth**: Optional `GITHUB_TOKEN` in `.env`

### **Git MCP (4047)**

- **Purpose**: Version control operations  
- **Capabilities**: Status, diff, commit, branch operations
- **Volume**: Full git repository access

### **SQLite MCP (4048)**

- **Purpose**: Database operations
- **Capabilities**: Query, schema management, data analysis
- **Storage**: `./rMemory` directory

## 💻 Development Features

### **Live Code Execution**

```javascript
// Test code instantly at http://localhost:4043
const test = () => {
  console.log("Hello from rEngine!");
  return { success: true, timestamp: new Date() };
};

test();
```

### **Live Development Server**

- **Auto-reload**: WebSocket-based file watching
- **Hot reload**: Changes reflect immediately
- **Multi-project**: Support for StackTrackr and other projects

### **Project Dashboard**  

- **Real-time tracking**: Parses MASTER_ROADMAP.md automatically
- **Status monitoring**: Critical, high, medium priority visualization
- **Progress tracking**: Active vs completed projects

## 🚀 For AI Context & Project Tracking

This setup gives me (your AI assistant) comprehensive awareness of:

### **📁 File System Access**

- Read any file in the workspace
- Monitor file changes in real-time
- Search across entire codebase

### **🧠 Memory Persistence**

- Remember conversations across sessions
- Track project progress and decisions
- Maintain context even if VS Code disconnects

### **🐙 GitHub Integration**

- Track issues and pull requests
- Monitor repository activity
- Understand project roadmap and priorities

### **📊 Project Status**

- Real-time view of active projects from MASTER_ROADMAP.md
- Priority tracking (Critical, High, Medium)
- Progress monitoring across all initiatives

### **💾 Database Access**

- Query project data and metrics
- Analyze code patterns and usage
- Track development progress over time

## 🔄 Live Development Workflow

1. **Start Enhanced Platform**: `./docker/rengine-manager.sh start enhanced`
2. **Open Dashboard**: <http://localhost:4032>
3. **Write Code**: Use live dev server at <http://localhost:4044>
4. **Test Code**: Use code executor at <http://localhost:4043>
5. **Track Progress**: Monitor projects at <http://localhost:4046>

Files auto-reload, tests run instantly, and I have full context of everything happening.

## 🏁 Open Source Ready

This Docker configuration provides:

- ✅ **Single command deployment**: `docker-compose up`
- ✅ **No external dependencies**: Everything runs in containers
- ✅ **Zero configuration**: Works out of the box
- ✅ **Comprehensive tooling**: MCP servers + development tools
- ✅ **Production ready**: Nginx, health checks, logging

Perfect for releasing as **"rEngine Platform - Complete AI Development Environment"** 🌍

## 🛠️ Customization

### **Add More MCP Servers**

Edit `docker-compose-enhanced.yml` to add additional MCP servers:

```yaml
mcp-custom:
  image: node:20-alpine
  ports:

    - "4049:4049"

  command: npx @modelcontextprotocol/server-custom
```

### **Environment Variables**

All configuration through `.env` file:

- `GITHUB_TOKEN`: For GitHub MCP integration
- `NODE_ENV`: development/production
- `RENGINE_DEBUG`: Enable debug logging

### **Port Configuration**

All ports configurable in docker-compose file:

- Range 4032-4048 for main services
- Range 4049+ available for custom services

---

🎉 **You now have a complete AI development platform with full project awareness and live development capabilities!**
