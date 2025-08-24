# HexTrackr - Cybersecurity Vulnerability Management System

## 🛡️ Project Overview
HexTrackr is a dual-purpose cybersecurity management system providing comprehensive vulnerability tracking and security ticket workflow management.

## 📁 Project Structure

### **Core Applications**
- `vulnerabilities-new.html` - Modern vulnerability management dashboard with Tabler.io
- `tickets.html` - Security ticket workflow management system
- `server.js` - Node.js/Express backend with SQLite database
- `app.js` - Ticket management JavaScript controller
- `sample-data.js` - Development test data

### **Styling & Assets**
- `styles.css` - Custom styling and Tabler.io integration
- `help/` - Documentation and instruction files

### **Development & Planning**
- `PHASE3_ROADMAP.md` - **PRIMARY ROADMAP** - Detailed implementation plan
- `ROADMAP.md` - High-level project roadmap and long-term planning
- `deprecated/` - Archived files no longer in active use

### **Docker Deployment**
- `Dockerfile` - Container configuration
- `docker-compose.yml` - Multi-service orchestration

## 🚀 Current Status

### **Completed Phases**
- ✅ **Phase 1**: Tabler.io framework integration and enhanced card system
- ✅ **Phase 2**: Enhanced modal system with VPR summaries and export functionality

### **Active Development**
- 🔄 **Phase 3**: Advanced UX improvements and vendor intelligence (see `PHASE3_ROADMAP.md`)

## 📋 Development Workflow

### **Primary Planning Document**
The project now uses `PHASE3_ROADMAP.md` as the primary planning and tracking document, which provides:
- Detailed sprint-based task breakdown
- Technical architecture specifications  
- Implementation timelines and priorities
- Quality assurance and testing strategies

### **Deprecated Files**
- `deprecated/progress.json.bak` - Legacy milestone tracking (replaced by markdown roadmap)
- `deprecated/vulnerabilities.bak.html` - Original vulnerability page (replaced by Tabler.io version)

## 🏃 Quick Start

### **Development Environment**
```bash
# Start the application
docker-compose up -d

# Access the vulnerability dashboard
http://localhost:8080/vulnerabilities-new.html

# Access the tickets system  
http://localhost:8080/tickets.html
```

### **Next Steps**
1. Review `PHASE3_ROADMAP.md` for upcoming enhancements
2. Follow sprint-based development approach
3. Test new features against existing data
4. Maintain documentation as features are completed

---

## 🤖 **AI Assistant Workflow Instructions**

### **CRITICAL: Always Read These Instructions First**
When starting a new chat session or continuing development, AI assistants must follow this workflow:

#### **1. Essential MCP Server Setup**
- **✅ REQUIRED**: Verify these MCP Servers are available and functional:
  - **Playwright Browser** - For testing and UI validation
  - **Context7** - For enhanced context management
  - **Memory** - For session state persistence
  - **Sequential Thinking** - For complex problem solving
- **⚠️ ACTION**: If any MCP server is unavailable, inform user immediately

#### **2. Mandatory Git Backup Protocol**
- **✅ BEFORE ANY CODE CHANGES**: Always create git backup
- **Command**: `git add . && git commit -m "🔄 Pre-work backup: [brief description]"`
- **✅ AFTER SIGNIFICANT CHANGES**: Commit with descriptive messages
- **⚠️ NEVER**: Make multiple edits without intermediate commits

#### **3. Project Context Loading**
- **✅ READ FIRST**: `PHASE3_ROADMAP.md` - Primary active roadmap
- **✅ CHECK STATUS**: Current phase completion and next sprint priorities
- **✅ VERIFY**: Docker environment running on `localhost:8080`
- **✅ REVIEW**: Any open issues or pending tasks in roadmap

#### **4. Development Standards**
- **Framework**: Tabler.io (NOT Bootstrap) for all UI components
- **Backend**: Node.js/Express with SQLite database
- **Primary File**: `vulnerabilities-new.html` (NOT `vulnerabilities.html`)
- **Testing**: Always test changes in browser via `localhost:8080`
- **Documentation**: Update roadmap progress after completing tasks

#### **5. Session Continuity Checklist**
```bash
# Verify environment
docker ps                           # Check containers running
git status                          # Check for uncommitted changes
git log --oneline -5               # Review recent commits

# Load project context
cat PHASE3_ROADMAP.md | head -50   # Review current phase
ls -la                             # Verify project structure
```

#### **6. Emergency Recovery**
- **If Docker Issues**: `docker-compose down && docker-compose up -d`
- **If Git Issues**: Create backup branch before any fixes
- **If File Corruption**: Restore from `deprecated/` folder if needed
- **Always**: Communicate issues to user before attempting fixes

### **Current Project State**
- **Active Branch**: `main`
- **Current Phase**: Phase 3 (Sprint 3.1 ready to start)
- **Primary Focus**: CVE link fixes, enhanced modals, vendor filtering
- **Critical Files**: 
  - `vulnerabilities-new.html` - Main application
  - `PHASE3_ROADMAP.md` - Development planning
  - `server.js` - Backend API

#### **MCP Server Usage Guidelines**
- **Playwright Browser**: 
  - Use for testing UI changes at `localhost:8080`
  - Verify modal functionality and card interactions
  - Test CVE popup links and export features
- **Memory**: 
  - Store project context and progress between sessions
  - Track completed tasks and current sprint status
  - Remember user preferences and design decisions
- **Sequential Thinking**: 
  - Use for complex problem solving (debugging, architecture decisions)
  - Break down large features into manageable steps
  - Analyze roadmap dependencies and sprint planning
- **Context7**: 
  - Maintain awareness of file relationships and dependencies
  - Track changes across multiple files in single operations
  - Understand impact of modifications on overall system

#### **Git Commit Message Standards**
```bash
# Feature completion
git commit -m "✅ Sprint 3.1: [Feature] - [Brief description]"

# Bug fixes  
git commit -m "🐛 Fix: [Issue] - [Solution applied]"

# Roadmap updates
git commit -m "📋 Roadmap: [Update type] - [Changes made]"

# Backup commits
git commit -m "🔄 Pre-work backup: [What you're about to work on]"
```

---

*Last Updated: August 24, 2025*  
*Current Version: 2.1.0*  
*Active Roadmap: Phase 3 - Enhanced UX & Advanced Filtering*
