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

### **🚨 CRITICAL: MANDATORY PROTOCOLS - NO EXCEPTIONS**

#### **RULE #1: ALWAYS BACKUP BEFORE CHANGES**
```bash
# NEVER SKIP THIS STEP - Execute before ANY code modification:
git add . && git commit -m "🔄 Pre-work backup: [what you're about to do]"
```

#### **RULE #2: ROADMAP FIRST, CODE SECOND**
- **❌ NEVER**: Start coding without updating roadmap documentation
- **✅ ALWAYS**: Plan changes in PHASE3_ROADMAP.md BEFORE implementation
- **✅ PROCESS**: Update roadmap → Get approval → Create backup → Implement → Test → Commit

#### **RULE #3: FOLLOW ESTABLISHED STRUCTURE**
- **Primary Roadmap**: `PHASE3_ROADMAP.md` (detailed sprint planning)
- **High-level Planning**: `ROADMAP.md` (long-term strategy)
- **Quick Reference**: `.ai-quickref.md` (startup checklist)
- **Configuration**: `MCP_SETUP.md` (MCP server setup)

### **CRITICAL: Always Read These Instructions First**
When starting a new chat session or continuing development, AI assistants must follow this workflow:

#### **1. Essential MCP Server Setup**
- **✅ CORE REQUIRED**: Verify these MCP Servers are available and functional:
  - **Playwright Browser** - For testing and UI validation
  - **Memory** - For session state persistence ✅ **CONFIGURED AND WORKING**
  - **Sequential Thinking** - For complex problem solving
  - **GitHub** - Repository management and issue tracking

- **✅ CYBERSECURITY ENHANCED**: Additional MCP tools for HexTrackr:
  - **Codacy** ⭐ - Code quality and security vulnerability scanning (CRITICAL)
  - **Firecrawl** ⭐ - Web scraping for vulnerability data collection
  - **Hugging Face** - AI/ML models for enhanced risk scoring
  - **DeepWiki** - GitHub repository documentation analysis
  - **MarkItDown** - Document conversion for security reports
  - **Microsoft Docs** - Security guidance and best practices
  - **ImageSorcery** - Image processing for vulnerability reports
  - **Apify** - Web automation for scanner integration

- **⚠️ ACTION**: If any CORE MCP server is unavailable, inform user immediately
- **✅ MEMORY SERVER**: Successfully configured at `/Volumes/DATA/GitHub/server-memory/memory.db`

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
- **If MCP Memory Issues**: 
  - Check VS Code MCP settings point to `/Volumes/DATA/GitHub/server-memory/`
  - Recreate directory: `mkdir -p /Volumes/DATA/GitHub/server-memory`
  - Restart VS Code MCP servers if needed
- **Always**: Communicate issues to user before attempting fixes

#### **7. VS Code MCP Configuration**
For the Memory MCP server to work properly, ensure your VS Code settings include:
```json
{
  "mcp.servers": {
    "memory": {
      "command": "mcp-memory-server",
      "args": ["--storage-path", "/Volumes/DATA/GitHub/server-memory/"]
    }
  }
}
```
**Note**: User should verify MCP server configuration in VS Code settings.

#### **8. Workflow Enforcement Checklist**
**Before making ANY changes, AI assistants must verify:**
- [ ] Git backup completed successfully
- [ ] Roadmap updated with planned changes
- [ ] User approval obtained for significant modifications
- [ ] All MCP servers functional (especially Memory for context)
- [ ] Current sprint/phase understood from PHASE3_ROADMAP.md
- [ ] Docker environment verified running on localhost:8080

**After making changes:**
- [ ] Changes tested in browser
- [ ] Descriptive commit with appropriate emoji category
- [ ] Roadmap progress updated if milestone completed
- [ ] Documentation updated if new features added

---

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
