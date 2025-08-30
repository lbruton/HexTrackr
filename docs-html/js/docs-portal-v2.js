/**
 * @fileoverview HexTrackr Documentation Portal v2.0
 * Clean, collapsible navigation system using Tabler.io components
 * 
 * Features:
 * - Collapsible tree navigation with expand/collapse
 * - Instant content switching (no page reloads)
 * - Breadcrumb navigation
 * - Back-to-top functionality
 * - Search integration
 * - Mobile responsive
 * 
 * Framework: Enhanced Tabler.io with custom navigation components
 * Content Source: Pre-processed markdown files from /docs-source/
 * 
 * @author HexTrackr Development Team
 * @version 2.0.0
 */

/* eslint-env browser */
/* global fetch, window, document, console, Prism, bootstrap, marked */

/**
 * Escape HTML entities to prevent XSS attacks
 * @param {string} text - The text to escape
 * @returns {string} - The escaped text
 */
function escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
}

/**
 * Documentation Portal v2 - Clean Architecture
 */
class DocumentationPortalV2 {
    constructor() {
        // Prevent multiple instances
        if (window.docsPortalInstance) {
            console.log("📝 Duplicate DocumentationPortalV2 instance prevented");
            return window.docsPortalInstance;
        }
        
        this.currentSection = "index";
        this.navigationStructure = null;
        this.contentCache = new Map();
        
        // Mark this instance as the singleton
        window.docsPortalInstance = this;
        
        this.init();
    }

    async init() {
        console.log("🚀 Initializing HexTrackr Documentation Portal v2.0");
        
        await this.loadNavigationStructure();
        this.renderNavigation();
        this.setupEventListeners();
        
        // Handle initial hash or load index
        const hash = window.location.hash.substring(1);
        const initialSection = hash || "index";
        await this.loadSection(initialSection);
        
        console.log("✅ Documentation Portal v2.0 ready");
    }

    /**
     * Load the navigation structure from the file system
     * Auto-discovers content from /docs-source/ folder structure
     */
    async loadNavigationStructure() {
        // Configuration for icons and display names (manually curated for better UX)
        const sectionConfig = {
            "index": { title: "Overview", icon: "fas fa-home" },
            "getting-started": { title: "Getting Started", icon: "fas fa-rocket" },
            "user-guides": { title: "User Guides", icon: "fas fa-users" },
            "api-reference": { title: "API Reference", icon: "fas fa-code" },
            "architecture": { title: "Architecture", icon: "fas fa-building" },
            "development": { title: "Development", icon: "fas fa-hammer" },
            "project-management": { title: "Project Management", icon: "fas fa-tasks" },
            "security": { title: "Security", icon: "fas fa-shield-alt" }
        };

        try {
            // Try to auto-discover structure from the actual file system
            const discoveredStructure = await this.discoverDocumentationStructure();
            
            // Merge discovered structure with manual configuration
            this.navigationStructure = {};
            
            // Add overview first
            this.navigationStructure.overview = {
                title: sectionConfig.index.title,
                icon: sectionConfig.index.icon,
                file: "index",
                children: null
            };
            
            // Add discovered sections with configuration
            for (const [sectionKey, sectionData] of Object.entries(discoveredStructure)) {
                if (sectionKey === "index") {continue;} // Skip index, already added as overview
                
                const config = sectionConfig[sectionKey] || {
                    title: this.formatTitle(sectionKey),
                    icon: "fas fa-file-alt" // Default icon
                };
                
                this.navigationStructure[sectionKey] = {
                    title: config.title,
                    icon: config.icon,
                    file: sectionData.file,
                    children: sectionData.children
                };
            }
            
            console.log("📁 Auto-discovered navigation structure:", this.navigationStructure);
            
        } catch (error) {
            console.warn("⚠️ Could not auto-discover structure, using fallback:", error);
            // Fallback to manual structure if auto-discovery fails
            this.loadFallbackStructure(sectionConfig);
        }
    }

    /**
     * Auto-discover documentation structure from content files
     */
    async discoverDocumentationStructure() {
        // This would ideally call a server endpoint that scans the /docs-source/ directory
        // For now, we'll simulate this by checking what content files exist
        const structure = {};
        
        // List of sections to check (could be made dynamic)
        const sectionsToCheck = [
            "getting-started", "user-guides", "api-reference", 
            "architecture", "development", "project-management", "security"
        ];
        
        for (const section of sectionsToCheck) {
            try {
                // Check if the main section file exists
                const response = await fetch(`content/${section}/index.html`);
                if (response.ok) {
                    structure[section] = {
                        file: `${section}/index`,
                        children: await this.discoverSectionChildren(section)
                    };
                }
            } catch (_error) {
                console.log(`Section ${section} not found, skipping`);
            }
        }
        
        // Step 2: Auto-discover roadmaps from /roadmaps/ folder
        await this.discoverRoadmapsStructure(structure);
        
        return structure;
    }

    /**
     * Auto-discover roadmap files from /roadmaps/ folder and add them to project-management
     */
    async discoverRoadmapsStructure(structure) {
        console.log("📁 Scanning /roadmaps/ folder for additional content...");
        
        // Known roadmap files to check
        const roadmapFiles = [
            { file: "ROADMAP.md", title: "Roadmap", key: "roadmap", path: "../roadmaps/" },
            { file: "sprint-security-compliance-2025-08-29-1630.md", title: "Current Sprint", key: "current-sprint", path: "../roadmaps/" }
        ];
        
        // Root level files to check
        const rootFiles = [
            { file: "CHANGELOG.md", title: "Changelog", key: "changelog", path: "../" }
        ];
        
        try {
            // If project-management section doesn't exist, create it
            if (!structure["project-management"]) {
                structure["project-management"] = {
                    file: "project-management/index",
                    children: {}
                };
            } else if (!structure["project-management"].children) {
                structure["project-management"].children = {};
            }
            
            // Test each roadmap file to see if it exists
            for (const roadmapFile of roadmapFiles) {
                try {
                    // Check if file exists by trying to fetch it from roadmaps folder
                    const response = await fetch(`${roadmapFile.path}${roadmapFile.file}`);
                    if (response.ok) {
                        console.log(`✅ Found roadmap file: ${roadmapFile.file}`);
                        
                        // Add to project-management children
                        structure["project-management"].children[roadmapFile.key] = {
                            title: roadmapFile.title,
                            file: `${roadmapFile.path}${roadmapFile.file}`, // Direct link to source
                            isExternal: true // Flag to handle differently
                        };
                    }
                } catch (_error) {
                    console.log(`Roadmap file ${roadmapFile.file} not accessible, skipping`);
                }
            }
            
            // Test each root file to see if it exists
            for (const rootFile of rootFiles) {
                try {
                    // Check if file exists by trying to fetch it from root
                    const response = await fetch(`${rootFile.path}${rootFile.file}`);
                    if (response.ok) {
                        console.log(`✅ Found root file: ${rootFile.file}`);
                        
                        // Add to project-management children
                        structure["project-management"].children[rootFile.key] = {
                            title: rootFile.title,
                            file: `${rootFile.path}${rootFile.file}`, // Direct link to source
                            isExternal: true // Flag to handle differently
                        };
                    }
                } catch (_error) {
                    console.log(`Root file ${rootFile.file} not accessible, skipping`);
                }
            }
            
            console.log("📁 Roadmaps structure discovery complete");
            
        } catch (error) {
            console.warn("⚠️ Could not discover roadmaps structure:", error);
        }
    }

    /**
     * Discover child pages for a section by dynamically scanning the content directory
     */
    async discoverSectionChildren(section) {
        const children = {};
        
        // Define section-specific files to avoid showing all pages in every dropdown
        const sectionFiles = {
            "getting-started": ["installation"],
            "user-guides": ["ticket-management", "vulnerability-management"],
            "api-reference": ["tickets-api", "vulnerabilities-api", "backup-api"],
            "architecture": ["backend", "database", "deployment", "frontend", "frameworks"],
            "development": ["coding-standards", "contributing", "development-setup", 
                          "memory-system", "pre-commit-hooks", "docs-portal-guide"],
            "project-management": ["roadmap", "roadmap-to-sprint-system", "codacy-compliance"],
            "security": ["overview", "vulnerability-disclosure"]
        };
        
        try {
            // Get the files specific to this section
            const filesToTest = sectionFiles[section] || [];
            
            // Test each potential file to see if it exists
            for (const child of filesToTest) {
                try {
                    const childResponse = await fetch(`content/${section}/${child}.html`);
                    if (childResponse.ok) {
                        children[child] = {
                            title: this.formatTitle(child),
                            file: `${section}/${child}`
                        };
                    }
                } catch (_error) {
                    // Child page doesn't exist, skip it
                }
            }
        } catch (error) {
            console.warn(`Could not discover children for section ${section}:`, error);
        }
        
        return Object.keys(children).length > 0 ? children : null;
    }

    /**
     * Format a filename/key into a readable title
     */
    formatTitle(key) {
        return key
            .split("-")
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(" ");
    }

    /**
     * Fallback navigation structure if auto-discovery fails
     */
    loadFallbackStructure(sectionConfig) {
        this.navigationStructure = {};
        
        // Build structure from data-driven approach
        const sections = this.getFallbackSections();
        
        sections.forEach(section => {
            this.navigationStructure[section.key] = this.buildSection(sectionConfig, section);
        });
        
        console.log("📁 Using fallback navigation structure");
    }

    /**
     * Get fallback section definitions
     */
    getFallbackSections() {
        return [
            { key: "overview", configKey: "index", file: "index", children: [] },
            { key: "getting-started", configKey: "getting-started", file: "getting-started/index", 
              children: [{ key: "installation", title: "Installation" }] },
            { key: "user-guides", configKey: "user-guides", file: "user-guides/index",
              children: [
                  { key: "ticket-management", title: "Ticket Management" },
                  { key: "vulnerability-management", title: "Vulnerability Management" }
              ]},
            { key: "api-reference", configKey: "api-reference", file: "api-reference/index",
              children: [
                  { key: "tickets-api", title: "Tickets API" },
                  { key: "vulnerabilities-api", title: "Vulnerabilities API" }
              ]},
            { key: "architecture", configKey: "architecture", file: "architecture/index",
              children: [
                  { key: "backend", title: "Backend" },
                  { key: "database", title: "Database" },
                  { key: "deployment", title: "Deployment" },
                  { key: "frontend", title: "Frontend" },
                  { key: "frameworks", title: "Frameworks" }
              ]},
            { key: "development", configKey: "development", file: "development/index",
              children: [
                  { key: "coding-standards", title: "Coding Standards" },
                  { key: "contributing", title: "Contributing" },
                  { key: "development-setup", title: "Development Setup" }
              ]},
            { key: "project-management", configKey: "project-management", file: "project-management/index",
              children: [
                  { key: "roadmap", title: "Roadmap" },
                  { key: "codacy-compliance", title: "Codacy Compliance" }
              ]},
            { key: "security", configKey: "security", file: "security/index",
              children: [
                  { key: "overview", title: "Security Overview" },
                  { key: "vulnerability-disclosure", title: "Vulnerability Disclosure" }
              ]}
        ];
    }

    /**
     * Build a section structure
     */
    buildSection(sectionConfig, section) {
        const config = sectionConfig[section.configKey];
        const result = {
            title: config.title,
            icon: config.icon,
            file: section.file,
            children: null
        };

        if (section.children.length > 0) {
            result.children = {};
            section.children.forEach(child => {
                result.children[child.key] = {
                    title: child.title,
                    file: `${section.key}/${child.key}`
                };
            });
        }

        return result;
    }

    /**
     * Render the collapsible navigation using Tabler.io list groups
     */
    renderNavigation() {
        const navContainer = document.getElementById("docsNavigation");
        if (!navContainer) {
            return;
        }

        let html = "";

        for (const [key, section] of Object.entries(this.navigationStructure)) {
            const hasChildren = section.children && Object.keys(section.children).length > 0;
            const collapseId = `collapse-${key}`;

            html += `
                <a class="list-group-item list-group-item-action d-flex align-items-center${hasChildren ? " collapsed" : ""}" 
                   href="#${section.file}" 
                   data-section="${section.file}"
                   ${hasChildren ? `data-bs-toggle="collapse" data-bs-target="#${collapseId}" aria-expanded="false"` : ""}
                   style="border-left: 3px solid transparent; transition: all 0.2s ease;">
                    <div class="d-flex align-items-center w-100">
                        <span class="avatar avatar-xs bg-primary-lt me-3" style="flex-shrink: 0;">
                            <i class="${section.icon}"></i>
                        </span>
                        <span class="flex-fill text-body fw-medium">${section.title}</span>
                        ${hasChildren ? "<i class=\"fas fa-chevron-down collapse-icon ms-2 text-muted\" style=\"transition: transform 0.2s ease;\"></i>" : ""}
                    </div>
                </a>
                ${hasChildren ? this.renderSubNavigation(section.children, collapseId) : ""}
            `;
        }

        navContainer.innerHTML = html;
        
        // Add custom styling for active states and hover effects
        this.addNavigationStyling();
    }

    /**
     * Add custom styling for navigation interactions
     */
    addNavigationStyling() {
        const style = document.createElement("style");
        style.textContent = `
            .list-group-item-action:hover {
                border-left-color: var(--tblr-primary) !important;
                background-color: var(--tblr-bg-surface-secondary);
                transform: translateX(2px);
            }
            
            .list-group-item-action.active {
                border-left-color: var(--tblr-primary) !important;
                background-color: var(--tblr-primary-lt);
                color: var(--tblr-primary-fg);
            }
            
            .list-group-item-action[aria-expanded="true"] .collapse-icon {
                transform: rotate(180deg);
            }
            
            .list-group-item-action .avatar {
                background-color: var(--tblr-primary-lt) !important;
                color: var(--tblr-primary) !important;
            }
            
            .list-group-item-action:hover .avatar {
                background-color: var(--tblr-primary) !important;
                color: white !important;
            }
        `;
        
        // Remove existing style if present
        const existingStyle = document.getElementById("nav-custom-style");
        if (existingStyle) {
            existingStyle.remove();
        }
        
        style.id = "nav-custom-style";
        document.head.appendChild(style);
    }

    /**
     * Render sub-navigation for collapsible sections
     */
    renderSubNavigation(children, collapseId) {
        let html = `<div class="collapse" id="${collapseId}">`;
        
        for (const [_key, child] of Object.entries(children)) {
            html += `
                <a class="list-group-item list-group-item-action d-flex align-items-center ps-5" 
                   href="#${child.file}" 
                   data-section="${child.file}"
                   style="border-left: 3px solid transparent; transition: all 0.2s ease; font-size: 0.9rem;">
                    <span class="avatar avatar-xs bg-secondary-lt me-3" style="flex-shrink: 0;">
                        <i class="fas fa-file-alt"></i>
                    </span>
                    <span class="text-body">${child.title}</span>
                </a>
            `;
        }
        
        html += "</div>";
        return html;
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Navigation clicks
        document.getElementById("docsNavigation").addEventListener("click", (e) => {
            const link = e.target.closest("a[data-section]");
            if (link && !link.hasAttribute("data-bs-toggle")) {
                e.preventDefault();
                const section = link.dataset.section;
                this.loadSection(section);
            }
        });

        // Hash change for direct links
        window.addEventListener("hashchange", () => {
            const hash = window.location.hash.substring(1);
            if (hash && hash !== this.currentSection) {
                this.loadSection(hash);
            }
        });

        // Back to top button
        const backToTop = document.getElementById("backToTop");
        const contentArea = document.getElementById("contentArea");
        
        contentArea.addEventListener("scroll", () => {
            if (contentArea.scrollTop > 300) {
                backToTop.classList.add("show");
            } else {
                backToTop.classList.remove("show");
            }
        });

        backToTop.addEventListener("click", () => {
            contentArea.scrollTo({ top: 0, behavior: "smooth" });
        });

        // Search keyboard shortcut
        document.addEventListener("keydown", (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === "k") {
                e.preventDefault();
                this.openSearch();
            }
        });
    }

    /**
     * Load a documentation section
     */
    async loadSection(section) {
        console.log(`📖 Loading section: ${section}`);
        
        // Show loading state
        this.showLoading();
        
        try {
            // Check if this is an external roadmap file
            const isExternalFile = this.isExternalFile(section);
            
            // Check cache first
            let content = this.contentCache.get(section);
            
            if (!content) {
                if (isExternalFile) {
                    // Load external markdown file and convert to HTML
                    content = await this.loadExternalMarkdown(section);
                } else {
                    // Load processed HTML content
                    const response = await fetch(`content/${section}.html`);
                    if (!response.ok) {
                        throw new Error(`Failed to load ${section}: ${response.statusText}`);
                    }
                    content = await response.text();
                }
                this.contentCache.set(section, content);
            }
            
            // Render content
            this.renderContent(content, section);
            
            // Update navigation state
            this.updateActiveNavigation(section);
            this.updateBreadcrumb(section);
            
            // Update URL
            if (window.location.hash !== `#${section}`) {
                window.history.pushState(null, null, `#${section}`);
            }
            
            this.currentSection = section;
            
        } catch (error) {
            console.error("❌ Error loading section:", error);
            this.showError(`Failed to load documentation for "${section}"`);
        }
    }

    /**
     * Check if a section refers to an external file
     */
    isExternalFile(section) {
        // Handle direct external file paths
        if (section.includes("../")) {
            return true;
        }
        
        // Check if any navigation item has this section marked as external
        for (const [, sectionData] of Object.entries(this.navigationStructure)) {
            if (sectionData.children) {
                for (const [childKey, childData] of Object.entries(sectionData.children)) {
                    if (childKey === section && childData.isExternal) {
                        return true;
                    }
                }
            }
        }
        return false;
    }

    /**
     * Load external markdown file and convert to HTML
     */
    async loadExternalMarkdown(section) {
        console.log(`📄 Loading external markdown for: ${section}`);
        
        let filePath = null;
        
        // If section contains path characters, it's a direct file path
        if (section.includes("../")) {
            filePath = section;
        } else {
            // Find the file path from navigation structure
            for (const [, sectionData] of Object.entries(this.navigationStructure)) {
                if (sectionData.children) {
                    for (const [childKey, childData] of Object.entries(sectionData.children)) {
                        if (childKey === section && childData.isExternal) {
                            filePath = childData.file;
                            break;
                        }
                    }
                }
            }
        }
        
        if (!filePath) {
            throw new Error(`External file path not found for section: ${section}`);
        }
        
        console.log(`📄 Fetching external file: ${filePath}`);
        
        // Fetch the raw markdown
        const response = await fetch(filePath);
        if (!response.ok) {
            throw new Error(`Failed to load external file ${filePath}: ${response.statusText}`);
        }
        
        const markdown = await response.text();
        
        // Convert markdown to HTML using marked.js (assuming it's loaded)
        if (typeof marked !== "undefined") {
            // Configure marked renderer for badges
            const renderer = new marked.Renderer();
            
            // Custom link renderer to handle shields.io badges
            renderer.link = function(token) {
                console.log("Link renderer token:", token);
                
                let href, text, title;
                
                // Handle different token formats
                if (typeof token === "object") {
                    href = token.href;
                    text = token.text;
                    title = token.title || "";
                } else {
                    // Fallback for old API format
                    href = arguments[0];
                    title = arguments[1];
                    text = arguments[2];
                }
                
                console.log("Extracted values:", { href, text, title });
                
                // Check if this is a shields.io badge
                if (href && (href.includes("shields.io") || href.includes("img.shields.io"))) {
                    return `<a href="${href}" target="_blank" title="${title}"><img src="${href}" alt="${text}" class="badge-img"></a>`;
                }
                
                // Regular link
                return `<a href="${href || ""}" ${title ? `title="${title}"` : ""}>${text || ""}</a>`;
            };
            
            // Configure marked with our custom renderer
            marked.setOptions({
                renderer: renderer,
                breaks: true,
                gfm: true
            });
            
            return marked.parse(markdown);
        } else {
            // Fallback: just wrap in <pre> tags
            return `<div class="alert alert-info">
                <h4>External File: ${section}</h4>
                <pre class="bg-light p-3 border rounded">${escapeHtml(markdown)}</pre>
            </div>`;
        }
    }

    /**
     * Show loading state
     */
    showLoading() {
        const contentArea = document.getElementById("contentArea");
        contentArea.innerHTML = `
            <div class="text-center p-5">
                <div class="spinner-border text-primary" role="status">
                    <span class="visually-hidden">Loading...</span>
                </div>
                <p class="mt-3 text-muted">Loading documentation...</p>
            </div>
        `;
    }

    /**
     * Render content in the main area
     */
    renderContent(content, section) {
        const contentArea = document.getElementById("contentArea");
        contentArea.innerHTML = content;
        
        // Apply syntax highlighting
        if (window.Prism) {
            Prism.highlightAllUnder(contentArea);
        }
        
        // Scroll to top
        contentArea.scrollTo(0, 0);
        
        // Update page title
        const sectionTitle = this.getSectionTitle(section);
        document.title = `HexTrackr - Documentation | ${sectionTitle}`;
    }

    /**
     * Show error message
     */
    showError(message) {
        const contentArea = document.getElementById("contentArea");
        contentArea.innerHTML = `
            <div class="alert alert-danger" role="alert">
                <h4 class="alert-title">Error Loading Documentation</h4>
                <div class="text-muted">${escapeHtml(message)}</div>
            </div>
        `;
    }

    /**
     * Update active navigation state
     */
    updateActiveNavigation(section) {
        // Remove all active states
        document.querySelectorAll(".docs-nav .nav-link").forEach(link => {
            link.classList.remove("active");
        });
        
        // Add active state to current section
        const activeLink = document.querySelector(`[data-section="${section}"]`);
        if (activeLink) {
            activeLink.classList.add("active");
            
            // Expand parent if it's a child section
            const collapse = activeLink.closest(".collapse");
            if (collapse) {
                const bsCollapse = new bootstrap.Collapse(collapse, { toggle: false });
                bsCollapse.show();
            }
        }
    }

    /**
     * Update breadcrumb navigation
     */
    updateBreadcrumb(section) {
        const breadcrumb = document.getElementById("breadcrumb");
        if (!breadcrumb) {
            console.warn("Breadcrumb element not found, skipping breadcrumb update");
            return;
        }
        
        const sectionTitle = this.getSectionTitle(section);
        
        breadcrumb.innerHTML = `
            <li class="breadcrumb-item">
                <a href="../tickets.html">HexTrackr</a>
            </li>
            <li class="breadcrumb-item">
                <a href="#index">Documentation</a>
            </li>
            <li class="breadcrumb-item active" aria-current="page">${sectionTitle}</li>
        `;
    }

    /**
     * Get section title from navigation structure
     */
    getSectionTitle(section) {
        if (section === "index") {return "Overview";}
        
        // Search in main sections
        for (const mainSection of Object.values(this.navigationStructure)) {
            if (mainSection.file === section) {
                return mainSection.title;
            }
            
            // Search in children
            if (mainSection.children) {
                for (const child of Object.values(mainSection.children)) {
                    if (child.file === section) {
                        return child.title;
                    }
                }
            }
        }
        
        // Fallback: capitalize and format
        return section.split("/").pop().replace(/-/g, " ").replace(/\b\w/g, l => l.toUpperCase());
    }

    /**
     * Open search modal
     */
    openSearch() {
        const searchModal = new bootstrap.Modal(document.getElementById("searchModal"));
        searchModal.show();
        
        // Focus search input after modal is shown
        document.getElementById("searchModal").addEventListener("shown.bs.modal", () => {
            document.getElementById("searchInput").focus();
        }, { once: true });
    }
}

// Initialize the documentation portal when DOM is ready
document.addEventListener("DOMContentLoaded", () => {
    // Prevent multiple instances - check if navigation already exists
    if (window.docsPortal || document.getElementById("docsNavigation").children.length > 0) {
        console.log("📝 Documentation Portal already initialized, skipping duplicate");
        return;
    }
    window.docsPortal = new DocumentationPortalV2();
});
