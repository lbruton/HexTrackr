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
/* global fetch, window, document, console, Prism, bootstrap */

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
                const response = await fetch(`/docs-prototype/content/${section}/index.html`);
                if (response.ok) {
                    structure[section] = {
                        file: `${section}/index`,
                        children: await this.discoverSectionChildren(section)
                    };
                }
            } catch (error) {
                console.log(`Section ${section} not found, skipping`);
            }
        }
        
        return structure;
    }

    /**
     * Discover child pages for a section
     */
    async discoverSectionChildren(section) {
        // Known child pages mapping (could be enhanced to be fully dynamic)
        const knownChildren = {
            "getting-started": ["installation"],
            "user-guides": ["ticket-management", "vulnerability-management"],
            "api-reference": ["tickets-api", "vulnerabilities-api"],
            "architecture": ["backend", "database", "deployment", "frontend", "frameworks"],
            "development": ["coding-standards", "contributing", "development-setup"],
            "project-management": ["roadmap", "codacy-compliance"],
            "security": ["overview", "vulnerability-disclosure"]
        };
        
        const children = {};
        const childList = knownChildren[section] || [];
        
        for (const child of childList) {
            try {
                const response = await fetch(`/docs-prototype/content/${section}/${child}.html`);
                if (response.ok) {
                    children[child] = {
                        title: this.formatTitle(child),
                        file: `${section}/${child}`
                    };
                }
            } catch (error) {
                // Child page doesn't exist, skip it
            }
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
     * Render the collapsible navigation
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
                <div class="nav-item">
                    <a class="nav-link${hasChildren ? " collapsed" : ""}" 
                       href="#${section.file}" 
                       data-section="${section.file}"
                       ${hasChildren ? `data-bs-toggle="collapse" data-bs-target="#${collapseId}" aria-expanded="false"` : ""}>
                        <span>
                            <i class="${section.icon} me-2"></i>
                            ${section.title}
                        </span>
                        ${hasChildren ? "<i class=\"fas fa-chevron-down collapse-icon\"></i>" : ""}
                    </a>
                    ${hasChildren ? this.renderSubNavigation(section.children, collapseId) : ""}
                </div>
            `;
        }

        navContainer.innerHTML = html;
    }

    /**
     * Render sub-navigation for collapsible sections
     */
    renderSubNavigation(children, collapseId) {
        let html = `<div class="collapse docs-subnav" id="${collapseId}">`;
        
        for (const [key, child] of Object.entries(children)) {
            html += `
                <a class="nav-link" href="#${child.file}" data-section="${child.file}">
                    ${child.title}
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
            // Check cache first
            let content = this.contentCache.get(section);
            
            if (!content) {
                // Load content from server
                const response = await fetch(`/docs-prototype/content/${section}.html`);
                if (!response.ok) {
                    throw new Error(`Failed to load ${section}: ${response.statusText}`);
                }
                content = await response.text();
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
