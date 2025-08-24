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

*Last Updated: August 24, 2025*  
*Current Version: 2.1.0*  
*Active Roadmap: Phase 3 - Enhanced UX & Advanced Filtering*
