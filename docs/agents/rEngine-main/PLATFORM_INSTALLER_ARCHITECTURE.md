# rEngine Platform Installer Architecture

## 🎯 **Vision: Clean Separation of Platform and User Data**

**Goal**: User installs rEngine platform (not LLM), interacts through MCP, keeps only customizable data in project folders.

---

## 🏗️ **Architecture Overview**

### **Current State (Development)**

```
/Volumes/DATA/GitHub/rEngine/
├── enhanced-scribe-console.js     # Core platform
├── memory-sync-automation.sh      # Core platform  
├── persistent-memory.json         # Core platform
├── docker-compose.yml             # Core platform
├── rAgents/                       # User data
├── rMemory/                       # User data
├── rProtocols/                    # User data
└── ... (100+ core files)          # Core platform
```

### **Target State (Platform Installer)**

```

# Platform Installation (Global/System)

/usr/local/rEngine/                # or ~/.rEngine/
├── bin/
│   ├── rengine-server            # Main platform binary
│   ├── enhanced-scribe           # Scribe system
│   └── memory-sync               # Memory management
├── lib/
│   ├── mcp-protocols/            # Core MCP implementations
│   ├── providers/                # LLM provider adapters
│   └── core/                     # Platform logic
├── config/
│   ├── docker-compose.yml        # Platform services
│   └── default-protocols.json    # Base protocol definitions
└── VERSION                       # Platform version

# User Project (Clean)

/path/to/user/project/
├── rAgents/                      # User's custom agents
│   ├── my-custom-agent.md
│   └── specialized-workflows/
├── rMemories/                    # User's memories
│   ├── project-context.json
│   ├── team-preferences.json
│   └── learning-history/
├── rProtocols/                   # User's custom protocols
│   ├── custom-workflow-001.json
│   └── team-specific/
├── prompts/                      # User's custom prompts
│   ├── code-review-template.md
│   └── documentation-style.md
└── .rengine                      # Project config
    ├── config.json               # Project settings
    └── mcp-endpoints.json        # Platform connection
```

---

## 🔌 **MCP-Only Interaction Model**

### **How It Works**

1. **Platform Installation**: `rengine install` - installs platform globally
2. **Project Initialization**: `rengine init` - creates clean project structure
3. **All Interaction**: Through MCP protocols (no direct file manipulation)
4. **Customization**: User edits .md files, protocols, prompts in their folders
5. **Platform Updates**: `rengine update` - updates platform without touching user data

### **MCP Protocol Examples**

```javascript
// User interacts through MCP, not direct file access
await mcp.call('rengine.memory.store', {
    type: 'project_preference',
    data: { codingStyle: 'functional', testFramework: 'jest' }
});

await mcp.call('rengine.agent.create', {
    name: 'my-code-reviewer',
    template: './rAgents/custom-reviewer.md',
    protocols: ['code-review-001', 'quality-check-002']
});

await mcp.call('rengine.protocol.load', {
    path: './rProtocols/team-workflow.json'
});
```

---

## 🛡️ **Security & Isolation Benefits**

### **Platform Protection**

- **Core files protected**: User cannot accidentally modify platform code
- **Version control**: Platform updates managed separately from user customizations
- **Security isolation**: Platform runs with appropriate permissions, user data in sandboxed folders

### **User Data Safety**

- **No platform contamination**: User's customizations never mixed with platform code
- **Portable projects**: User can move project folders between rEngine installations
- **Backup simplicity**: Only need to backup rAgents/, rMemories/, rProtocols/, prompts/

---

## 📦 **Installation & Update Flow**

### **Initial Installation**

```bash

# Install rEngine platform

curl -sSL https://install.rengine.dev | bash

# or

npm install -g @rengine/platform

# Initialize new project

cd my-project
rengine init

# Start platform services

rengine start
```

### **Platform Updates**

```bash

# Update platform (user data untouched)

rengine update

# Platform automatically:

# 1. Downloads new platform version

# 2. Migrates user protocols if needed

# 3. Preserves all user customizations

# 4. Restarts services with new features

```

### **Project Migration**

```bash

# Move project to new machine

rsync -av ./rAgents ./rMemories ./rProtocols ./prompts user@newmachine:/path/

# On new machine (with rEngine installed)

cd /path/to/copied/project
rengine init  # Reconnects to platform
rengine start # Ready to work
```

---

## 🎯 **Competitive Advantages**

### **vs Current AI Tools**

| Feature | Cline/Claude-Dev | rEngine Platform |
|---------|------------------|------------------|
| **Installation** | Complex setup, mixed files | Single installer, clean separation |
| **Updates** | Risk breaking user configs | Safe platform updates |
| **Portability** | Hard to move projects | Drop folder + `rengine init` |
| **Team Sharing** | Share entire setup | Share only rAgents/rMemories folders |
| **Enterprise** | Not enterprise-ready | Professional deployment model |

### **Professional Benefits**

1. **Enterprise Deployment**: IT can install platform, users get clean projects
2. **Team Collaboration**: Share only relevant customizations, not platform internals
3. **Version Management**: Platform and user customizations versioned separately
4. **Security Compliance**: Clear separation of platform and user data
5. **Maintenance**: Platform updates without user disruption

---

## 🔧 **Implementation Phases**

### **Phase 1: Platform Extraction (Q2 2025)**

- [ ] Identify core platform vs user-customizable files
- [ ] Create platform installer structure
- [ ] Build MCP-only interaction layer
- [ ] Design clean project template

### **Phase 2: Installer Development (Q3 2025)**

- [ ] Build cross-platform installer (`rengine install`)
- [ ] Implement project initialization (`rengine init`)
- [ ] Create update mechanism (`rengine update`)
- [ ] Add migration tools for existing projects

### **Phase 3: Production Deployment (Q4 2025)**

- [ ] Package for npm, brew, apt, etc.
- [ ] Enterprise deployment documentation
- [ ] Team collaboration workflows
- [ ] Professional support channels

---

## 🌟 **User Experience**

### **Developer Experience**

```bash

# Day 1: Install rEngine

curl -sSL https://install.rengine.dev | bash

# Day 1: Start new project

mkdir my-ai-app && cd my-ai-app
rengine init

# Creates: rAgents/, rMemories/, rProtocols/, prompts/, .rengine/

# Day 1: Customize

echo "You are a React expert..." > prompts/react-assistant.md
echo '{"workflow": "tdd"}' > rProtocols/my-workflow.json

# Day 1: Start coding

rengine start  # Platform services up, ready to code

# Month later: Platform update

rengine update  # New features, your customizations untouched

# Project sharing

zip -r my-project.zip rAgents/ rMemories/ rProtocols/ prompts/

# Teammate: unzip, `rengine init`, ready to collaborate

```

### **Enterprise Experience**

```bash

# IT Admin: Deploy platform enterprise-wide

ansible-playbook install-rengine.yml

# Developers: Clean project setup

cd /projects/new-feature
rengine init --template enterprise

# Gets company-specific protocols, prompts, agents

# Team Lead: Share team customizations

git init && git add rAgents/ rMemories/ rProtocols/ prompts/

# No platform files in repo, clean collaboration

```

---

## 🎉 **Why This Is Revolutionary**

### **No Competitor Has This**

- **Cline**: Everything mixed together, hard to update
- **Claude-Dev**: No separation of concerns
- **Others**: Developer tools, not platforms

### **Enterprise-Ready**

- **Professional deployment model**
- **Clean separation of platform and data**
- **Safe update mechanisms**
- **Team collaboration built-in**

### **Developer-Friendly**

- **Simple installation and setup**
- **Portable projects**
- **No platform contamination of user code**
- **MCP provides clean API layer**

This architecture makes rEngine the **first professional AI development platform** with proper software engineering practices! 🚀
