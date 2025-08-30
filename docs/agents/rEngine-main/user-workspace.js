// user-workspace.js - Persistent user workspace system

class UserWorkspace {
    constructor(userId = "default-user") {
        this.userId = userId;
        this.workspace = null;
        this.apiKeyGuard = new APIKeyGuard();
        this.autoSaveEnabled = true;
        this.autoSaveInterval = null;
        
        this.init();
    }
    
    async init() {
        await this.loadWorkspace();
        this.setupAutoSave();
        this.setupEventListeners();
    }
    
    async loadWorkspace() {
        try {
            const response = await fetch(`/api/workspace/${this.userId}`);
            if (response.ok) {
                this.workspace = await response.json();
            } else {
                // Create new workspace
                this.workspace = this.createDefaultWorkspace();
                await this.saveWorkspace();
            }
        } catch (error) {
            console.error("Failed to load workspace:", error);
            this.workspace = this.createDefaultWorkspace();
        }
    }
    
    createDefaultWorkspace() {
        return {
            user: {
                id: this.userId,
                name: "rEngine User",
                created: new Date().toISOString(),
                lastAccess: new Date().toISOString(),
                preferences: {
                    theme: "dark",
                    defaultView: "kanban",
                    autoSave: true
                }
            },
            workspace: {
                title: "My Development Hub",
                description: "Personal workspace for project planning and development",
                sections: [
                    {
                        id: "current-projects",
                        title: "Active Projects",
                        type: "kanban",
                        items: [
                            {
                                id: "sample-1",
                                title: "Welcome to rEngine!",
                                description: "Explore your new AI development workspace",
                                status: "todo",
                                priority: "medium",
                                created: new Date().toISOString()
                            }
                        ]
                    },
                    {
                        id: "ideas",
                        title: "Ideas & Brainstorming",
                        type: "freeform",
                        items: [
                            {
                                id: "idea-1",
                                title: "Mobile Agent for Conference Debugging",
                                content: "Imagine fixing bugs from your phone during presentations",
                                tags: ["mobile", "ai", "debugging"],
                                created: new Date().toISOString()
                            }
                        ]
                    },
                    {
                        id: "notes",
                        title: "Notes & Research",
                        type: "notebook",
                        items: [
                            {
                                id: "note-1",
                                title: "Local LLM Benefits",
                                content: "• 90% cost savings vs cloud APIs\n• Complete privacy\n• Unlimited usage\n• Air-gap capable",
                                created: new Date().toISOString()
                            }
                        ]
                    }
                ]
            },
            privacy: {
                apiKeysAllowed: false,
                sensitiveDataMarkers: ["api_key", "password", "token", "secret"],
                autoRedaction: true
            }
        };
    }
    
    async saveWorkspace() {
        try {
            // Scan for sensitive data before saving
            const scannedWorkspace = this.scanAndRedactSensitiveData(this.workspace);
            
            const response = await fetch(`/api/workspace/${this.userId}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(scannedWorkspace)
            });
            
            if (response.ok) {
                console.log("Workspace saved successfully");
                this.showNotification("Workspace saved", "success");
            } else {
                throw new Error("Failed to save workspace");
            }
        } catch (error) {
            console.error("Failed to save workspace:", error);
            this.showNotification("Failed to save workspace", "error");
        }
    }
    
    scanAndRedactSensitiveData(data) {
        const dataStr = JSON.stringify(data);
        const scanResult = this.apiKeyGuard.scanContent(dataStr);
        
        if (scanResult.detected) {
            this.showNotification(scanResult.message, "warning");
            const redacted = this.apiKeyGuard.redactContent(dataStr);
            return JSON.parse(redacted);
        }
        
        return data;
    }
    
    addItem(sectionId, item) {
        const section = this.workspace.workspace.sections.find(s => s.id === sectionId);
        if (section) {
            item.id = this.generateId();
            item.created = new Date().toISOString();
            section.items.push(item);
            this.saveWorkspace();
            this.renderSection(section);
        }
    }
    
    updateItem(sectionId, itemId, updates) {
        const section = this.workspace.workspace.sections.find(s => s.id === sectionId);
        if (section) {
            const item = section.items.find(i => i.id === itemId);
            if (item) {
                Object.assign(item, updates);
                item.modified = new Date().toISOString();
                this.saveWorkspace();
                this.renderSection(section);
            }
        }
    }
    
    deleteItem(sectionId, itemId) {
        const section = this.workspace.workspace.sections.find(s => s.id === sectionId);
        if (section) {
            section.items = section.items.filter(i => i.id !== itemId);
            this.saveWorkspace();
            this.renderSection(section);
        }
    }
    
    generateId() {
        return "item-" + Date.now() + "-" + Math.random().toString(36).substr(2, 9);
    }
    
    setupAutoSave() {
        if (this.autoSaveEnabled) {
            this.autoSaveInterval = setInterval(() => {
                this.saveWorkspace();
            }, 30000); // Auto-save every 30 seconds
        }
    }
    
    setupEventListeners() {
        // Listen for workspace changes
        document.addEventListener("workspaceChanged", () => {
            if (this.autoSaveEnabled) {
                this.saveWorkspace();
            }
        });
        
        // Prevent accidental page close with unsaved changes
        window.addEventListener("beforeunload", (e) => {
            if (this.hasUnsavedChanges()) {
                e.preventDefault();
                e.returnValue = "";
            }
        });
    }
    
    hasUnsavedChanges() {
        // Simple implementation - in production, would track dirty state
        return false;
    }
    
    renderWorkspace() {
        const workspaceContainer = document.getElementById("workspaceContainer");
        if (!workspaceContainer) {return;}
        
        workspaceContainer.innerHTML = `
            <div class="workspace-header">
                <h2><i class="fas fa-clipboard-list"></i> ${this.workspace.workspace.title}</h2>
                <p>${this.workspace.workspace.description}</p>
                <div class="workspace-actions">
                    <button class="btn btn-primary" onclick="workspace.addQuickNote()">
                        <i class="fas fa-plus"></i> Quick Note
                    </button>
                    <button class="btn btn-success" onclick="workspace.addProject()">
                        <i class="fas fa-project-diagram"></i> New Project
                    </button>
                    <button class="btn btn-info" onclick="workspace.brainstormMode()">
                        <i class="fas fa-lightbulb"></i> Brainstorm
                    </button>
                </div>
            </div>
            
            <div class="workspace-sections">
                ${this.workspace.workspace.sections.map(section => this.renderSectionHTML(section)).join("")}
            </div>
        `;
    }
    
    renderSectionHTML(section) {
        switch (section.type) {
            case "kanban":
                return this.renderKanbanSection(section);
            case "freeform":
                return this.renderFreeformSection(section);
            case "notebook":
                return this.renderNotebookSection(section);
            default:
                return `<div class="section-error">Unknown section type: ${section.type}</div>`;
        }
    }
    
    renderKanbanSection(section) {
        const todoItems = section.items.filter(item => item.status === "todo");
        const inProgressItems = section.items.filter(item => item.status === "in-progress");
        const doneItems = section.items.filter(item => item.status === "done");
        
        return `
            <div class="workspace-section kanban-section" data-section-id="${section.id}">
                <h3><i class="fas fa-tasks"></i> ${section.title}</h3>
                <div class="kanban-board">
                    <div class="kanban-column" data-status="todo">
                        <h4>📋 To Do (${todoItems.length})</h4>
                        <div class="kanban-items">
                            ${todoItems.map(item => this.renderKanbanItem(item)).join("")}
                        </div>
                        <button class="add-item-btn" onclick="workspace.addKanbanItem('${section.id}', 'todo')">
                            <i class="fas fa-plus"></i> Add Task
                        </button>
                    </div>
                    <div class="kanban-column" data-status="in-progress">
                        <h4>🔄 In Progress (${inProgressItems.length})</h4>
                        <div class="kanban-items">
                            ${inProgressItems.map(item => this.renderKanbanItem(item)).join("")}
                        </div>
                    </div>
                    <div class="kanban-column" data-status="done">
                        <h4>✅ Done (${doneItems.length})</h4>
                        <div class="kanban-items">
                            ${doneItems.map(item => this.renderKanbanItem(item)).join("")}
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
    
    renderKanbanItem(item) {
        const priorityClass = `priority-${item.priority || "medium"}`;
        return `
            <div class="kanban-item ${priorityClass}" data-item-id="${item.id}" draggable="true">
                <div class="item-header">
                    <span class="item-title">${item.title}</span>
                    <div class="item-actions">
                        <button onclick="workspace.editItem('${item.id}')" title="Edit">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button onclick="workspace.deleteItem('current-projects', '${item.id}')" title="Delete">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
                ${item.description ? `<p class="item-description">${item.description}</p>` : ""}
                <div class="item-meta">
                    <span class="priority priority-${item.priority || "medium"}">${item.priority || "medium"}</span>
                    <span class="created-date">${new Date(item.created).toLocaleDateString()}</span>
                </div>
            </div>
        `;
    }
    
    renderFreeformSection(section) {
        return `
            <div class="workspace-section freeform-section" data-section-id="${section.id}">
                <h3><i class="fas fa-lightbulb"></i> ${section.title}</h3>
                <div class="freeform-canvas">
                    ${section.items.map(item => this.renderFreeformItem(item)).join("")}
                    <button class="add-idea-btn" onclick="workspace.addIdea('${section.id}')">
                        <i class="fas fa-plus"></i> Add Idea
                    </button>
                </div>
            </div>
        `;
    }
    
    renderFreeformItem(item) {
        return `
            <div class="freeform-item" data-item-id="${item.id}">
                <div class="item-header">
                    <h4>${item.title}</h4>
                    <button onclick="workspace.deleteItem('ideas', '${item.id}')" title="Delete">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <p>${item.content}</p>
                ${item.tags ? `<div class="tags">${item.tags.map(tag => `<span class="tag">${tag}</span>`).join("")}</div>` : ""}
            </div>
        `;
    }
    
    renderNotebookSection(section) {
        return `
            <div class="workspace-section notebook-section" data-section-id="${section.id}">
                <h3><i class="fas fa-book"></i> ${section.title}</h3>
                <div class="notebook-items">
                    ${section.items.map(item => this.renderNotebookItem(item)).join("")}
                    <button class="add-note-btn" onclick="workspace.addNote('${section.id}')">
                        <i class="fas fa-plus"></i> Add Note
                    </button>
                </div>
            </div>
        `;
    }
    
    renderNotebookItem(item) {
        return `
            <div class="notebook-item" data-item-id="${item.id}">
                <div class="item-header">
                    <h4>${item.title}</h4>
                    <span class="created-date">${new Date(item.created).toLocaleDateString()}</span>
                    <button onclick="workspace.deleteItem('notes', '${item.id}')" title="Delete">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
                <div class="note-content">${item.content.replace(/\n/g, "<br>")}</div>
            </div>
        `;
    }
    
    // User interaction methods
    addKanbanItem(sectionId, status) {
        const title = prompt("Task title:");
        if (title) {
            const description = prompt("Task description (optional):");
            const priority = prompt("Priority (high/medium/low):", "medium");
            
            this.addItem(sectionId, {
                title,
                description,
                status,
                priority: priority || "medium"
            });
        }
    }
    
    addIdea(sectionId) {
        const title = prompt("Idea title:");
        if (title) {
            const content = prompt("Idea description:");
            const tags = prompt("Tags (comma-separated):");
            
            this.addItem(sectionId, {
                title,
                content,
                tags: tags ? tags.split(",").map(t => t.trim()) : []
            });
        }
    }
    
    addNote(sectionId) {
        const title = prompt("Note title:");
        if (title) {
            const content = prompt("Note content:");
            
            this.addItem(sectionId, {
                title,
                content: content || ""
            });
        }
    }
    
    addQuickNote() {
        const content = prompt("Quick note:");
        if (content) {
            this.addItem("notes", {
                title: "Quick Note",
                content
            });
        }
    }
    
    addProject() {
        const title = prompt("Project name:");
        if (title) {
            const description = prompt("Project description:");
            
            this.addItem("current-projects", {
                title,
                description,
                status: "todo",
                priority: "medium"
            });
        }
    }
    
    brainstormMode() {
        alert("🧠 Brainstorm Mode!\n\nUse the Ideas section to capture thoughts.\nLocal LLM can help expand on your ideas!");
    }
    
    showNotification(message, type = "info") {
        // Simple notification system
        const notification = document.createElement("div");
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }
}

// API Key Guard for security
class APIKeyGuard {
    constructor() {
        this.sensitivePatterns = [
            /sk-[a-zA-Z0-9]{48}/g,           // OpenAI
            /claude-[a-zA-Z0-9-]{32,}/g,     // Claude
            /gsk_[a-zA-Z0-9]{32}/g,          // Groq  
            /AIza[a-zA-Z0-9-_]{35}/g,        // Google
            /ya29\.[a-zA-Z0-9\-_.]{68}/g,    // Google OAuth
            /Bearer [a-zA-Z0-9-_.]{20,}/g,   // Generic Bearer tokens
            /[A-Za-z0-9]{32,}/g              // Generic long strings (be careful with this)
        ];
    }
    
    scanContent(text) {
        for (const pattern of this.sensitivePatterns) {
            if (pattern.test(text)) {
                return {
                    detected: true,
                    message: "⚠️ Sensitive data detected! Content will be redacted before saving.",
                    suggestion: "Store API keys in ~/.rengine/api-keys.txt instead"
                };
            }
        }
        return { detected: false };
    }
    
    redactContent(text) {
        let redacted = text;
        for (const pattern of this.sensitivePatterns) {
            redacted = redacted.replace(pattern, "[REDACTED-SENSITIVE-DATA]");
        }
        return redacted;
    }
}

// Initialize workspace when page loads
let workspace;
document.addEventListener("DOMContentLoaded", function() {
    if (document.getElementById("workspace")) {
        workspace = new UserWorkspace();
    }
});
