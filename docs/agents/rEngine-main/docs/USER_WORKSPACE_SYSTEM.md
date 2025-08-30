# User Workspace System - Persistent Memory & Planning

## 🎯 **Vision: Personal Whiteboard for Every User**

Every enterprise or self-hosted rEngine user gets their own persistent workspace - like a digital whiteboard that remembers everything between sessions.

---

## 🏗️ **Workspace Architecture**

### **Directory Structure**

```
/Volumes/DATA/GitHub/rEngine/user-workspaces/
├── user-[id]/
│   ├── workspace.json          # Main workspace data
│   ├── projects/               # Project-specific notes
│   ├── brainstorm/            # Ideation and planning
│   ├── notes/                 # General notes and observations
│   ├── templates/             # Personal templates
│   └── archive/               # Completed/archived items
└── shared/
    ├── enterprise-templates/   # Company-wide templates
    └── knowledge-base/        # Shared knowledge
```

### **Workspace Data Model**

```json
{
  "user": {
    "id": "user-001",
    "name": "Developer Name",
    "created": "2025-08-23T08:00:00Z",
    "lastAccess": "2025-08-23T08:30:00Z",
    "preferences": {
      "theme": "dark",
      "defaultView": "kanban",
      "autoSave": true
    }
  },
  "workspace": {
    "title": "My Development Hub",
    "description": "Personal workspace for project planning and development",
    "sections": [
      {
        "id": "current-projects",
        "title": "Active Projects",
        "type": "kanban",
        "items": []
      },
      {
        "id": "ideas",
        "title": "Ideas & Brainstorming",
        "type": "freeform",
        "items": []
      },
      {
        "id": "notes",
        "title": "Notes & Research",
        "type": "notebook",
        "items": []
      }
    ]
  },
  "privacy": {
    "apiKeysAllowed": false,
    "sensitiveDataMarkers": ["api_key", "password", "token", "secret"],
    "autoRedaction": true
  }
}
```

---

## 📱 **Dashboard Integration**

### **New Workspace Tab**

I'll add a "My Workspace" tab to the dashboard with:

- 📝 **Digital Whiteboard**: Drag-and-drop notes, ideas, diagrams
- 📋 **Project Kanban**: To-do, In Progress, Done columns
- 💡 **Idea Capture**: Quick brainstorming with AI assistance
- 📚 **Knowledge Base**: Personal notes and research
- 🔒 **Privacy Controls**: Automatic API key detection and warnings

### **Workspace Features**

## Real-time Collaboration Tools:

- 🖊️ **Rich Text Editor**: Markdown support with live preview
- 🎨 **Visual Canvas**: Draw, diagram, sketch ideas
- 📌 **Sticky Notes**: Color-coded, categorized notes
- 🔗 **Link Management**: Save and organize important links
- 📅 **Timeline View**: Project milestones and deadlines

## AI Integration:

- 🤖 **Smart Suggestions**: AI helps organize and categorize content
- 📝 **Auto-completion**: Complete thoughts and expand ideas
- 🔍 **Smart Search**: Find content across all workspace items
- 💬 **Chat Integration**: Discuss ideas with local LLM
- 📊 **Progress Tracking**: AI-generated insights on project status

---

## 🔐 **Privacy & Security Architecture**

### **API Key Management**

## Strict No-Storage Policy:

```javascript
// API key detection and warning system
class APIKeyGuard {
    constructor() {
        this.sensitivePatterns = [
            /sk-[a-zA-Z0-9]{48}/g,           // OpenAI
            /claude-[a-zA-Z0-9-]{32,}/g,     // Claude
            /gsk_[a-zA-Z0-9]{32}/g,          // Groq  
            /AIza[a-zA-Z0-9-_]{35}/g,        // Google
            /ya29\.[a-zA-Z0-9\-_.]{68}/g     // Google OAuth
        ];
    }
    
    scanContent(text) {
        for (let pattern of this.sensitivePatterns) {
            if (pattern.test(text)) {
                return {
                    detected: true,
                    message: "⚠️ API key detected! This will not be saved.",
                    suggestion: "Please store API keys in ~/.rengine/api-keys.txt"
                };
            }
        }
        return { detected: false };
    }
    
    redactContent(text) {
        let redacted = text;
        for (let pattern of this.sensitivePatterns) {
            redacted = redacted.replace(pattern, '[REDACTED-API-KEY]');
        }
        return redacted;
    }
}
```

## Session-Based API Key Loading:

```bash

# ~/.rengine/api-keys.txt (user manages this file)

OPENAI_API_KEY=sk-your-key-here
CLAUDE_API_KEY=claude-your-key-here  
GROQ_API_KEY=gsk-your-key-here
GEMINI_API_KEY=AIza-your-key-here

# These are loaded at session start, never stored in workspace

```

### **Enterprise Compliance**

## Data Protection:

- 🔒 **Local Storage Only**: All workspace data stays on user's machine
- 🚫 **No Cloud Sync**: Enterprise version has zero external dependencies
- 🔐 **Encryption at Rest**: AES-256 encryption for sensitive workspaces
- 👥 **User Isolation**: Complete separation between user workspaces
- 📝 **Audit Logging**: Track all workspace access and modifications

---

## 🛠️ **Implementation Plan**

### **Phase 1: Core Workspace System**

## Backend API Endpoints:

```javascript
// workspace-api.js
app.get('/api/workspace/:userId', getUserWorkspace);
app.post('/api/workspace/:userId', saveWorkspace);
app.post('/api/workspace/:userId/item', addWorkspaceItem);
app.put('/api/workspace/:userId/item/:itemId', updateWorkspaceItem);
app.delete('/api/workspace/:userId/item/:itemId', deleteWorkspaceItem);
app.post('/api/workspace/:userId/scan-security', scanForSensitiveData);
```

## Frontend Components:

```javascript
// Workspace Dashboard Components

- WorkspaceCanvas: Main whiteboard interface
- KanbanBoard: Project management view
- NotesEditor: Rich text note taking
- IdeaCapture: Quick brainstorming tool
- SecurityScanner: API key detection

```

### **Phase 2: AI Integration**

## Local LLM Workspace Assistant:

- 💭 **Idea Expansion**: "Help me brainstorm features for this project"
- 📋 **Task Generation**: "Break this project into actionable tasks"
- 🔍 **Content Organization**: "Categorize these notes automatically"
- 📝 **Meeting Summaries**: "Summarize this brainstorming session"
- 🎯 **Goal Setting**: "Help me set realistic milestones"

### **Phase 3: Enterprise Features**

## Team Collaboration:

- 👥 **Shared Workspaces**: Team-level planning and coordination
- 📊 **Reporting**: Aggregate insights across team workspaces
- 🔄 **Sync Options**: Optional secure team synchronization
- 📱 **Mobile Access**: View and edit workspace from mobile devices

---

## 💡 **Use Case Examples**

### **Software Developer Workspace**

```
Current Projects (Kanban):
├── 📱 Mobile App Refactor [In Progress]
├── 🔧 API Performance Optimization [To Do]
└── 📊 Dashboard Analytics [Done]

Ideas & Brainstorming:
├── 💡 "What if we added voice commands to the mobile app?"
├── 🎯 "Consider microservices architecture for scaling"
└── 🔮 "Future: AI-powered code review integration"

Notes & Research:
├── 📚 "React Native vs Flutter comparison"
├── 🔗 "Useful GraphQL optimization articles"
└── 📝 "Meeting notes: Q4 planning session"
```

### **Enterprise Team Lead Workspace**

```
Strategic Planning:
├── 🎯 Q4 Objectives and Key Results
├── 👥 Team Capacity Planning
└── 💰 Budget Allocation for New Tools

Team Management:
├── 📊 Performance Review Templates
├── 🎓 Training and Development Plans
└── 🔄 Process Improvement Ideas

Architecture & Vision:
├── 🏗️ System Architecture Diagrams
├── 🔮 Technology Roadmap 2025-2026
└── 🚀 Innovation Lab Proposals
```

### **Startup Founder Workspace**

```
Product Strategy:
├── 🎯 Go-to-Market Strategy
├── 💡 Feature Prioritization Matrix
└── 🏆 Competitive Analysis

Business Development:
├── 💰 Investor Pitch Deck Ideas
├── 🤝 Partnership Opportunities
└── 📈 Growth Metrics and KPIs

Vision & Planning:
├── 🌟 Company Mission and Values
├── 📅 12-Month Milestone Timeline
└── 🎨 Brand Identity Concepts
```

---

## 🎨 **Visual Interface Design**

### **Workspace Canvas**

```
┌─────────────────────────────────────────────────────────┐
│ My Workspace - John Developer                           │
├─────────────────────────────────────────────────────────┤
│ [📋 Projects] [💡 Ideas] [📝 Notes] [🔍 Search]       │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐     │
│  │   TO DO     │  │ IN PROGRESS │  │    DONE     │     │
│  ├─────────────┤  ├─────────────┤  ├─────────────┤     │
│  │ • API Design│  │ • Dashboard │  │ • Setup     │     │
│  │ • Testing   │  │   Refactor  │  │ • Planning  │     │
│  │ • Deploy    │  │ • Bug Fixes │  │             │     │
│  └─────────────┘  └─────────────┘  └─────────────┘     │
│                                                         │
│  💡 Recent Ideas:                                       │
│  • Mobile voice commands                               │
│  • AI code review integration                         │
│  • Automated testing pipeline                         │
│                                                         │
│  📝 Quick Notes:                                        │
│  • Remember to update API docs                        │
│  • Team meeting Friday 2pm                           │
│  • Consider Redis for caching                        │
└─────────────────────────────────────────────────────────┘
```

---

## 🔄 **Integration with Existing rEngine**

### **Dashboard Tab Addition**

I'll add the workspace as a new tab in the existing health dashboard:

```html
<!-- New tab in dashboard navigation -->
<button class="nav-tab" onclick="showTab('workspace')">
    <i class="fas fa-clipboard-list"></i> My Workspace
</button>
```

### **API Extension**

The workspace API will integrate with the existing health-api.cjs:

```javascript
// Add to existing health-api.cjs
app.get('/api/workspace/:userId', this.serveWorkspace.bind(this));
app.post('/api/workspace/:userId/save', this.saveWorkspace.bind(this));
```

### **Data Persistence**

Workspace data will be stored alongside existing rEngine memory:

```
rEngine Data Structure:
├── persistent-memory.json      # Existing agent memory
├── user-workspaces/           # NEW: User workspace data
│   ├── default-user/          # Default workspace for single-user
│   └── enterprise-users/      # Enterprise multi-user workspaces
└── api-keys/                  # NEW: Session-based API key storage
    └── .gitignore            # Ensure keys never get committed
```

This creates a powerful, privacy-focused workspace system that enhances rEngine's capabilities while maintaining enterprise security standards. Users get their own digital whiteboard that remembers everything, helps them plan and organize, and integrates seamlessly with the AI development workflow!
