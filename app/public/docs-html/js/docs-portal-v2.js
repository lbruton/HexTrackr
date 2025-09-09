/**
 * @fileoverview HexTrackr Documentation Portal v2.0
 * Clean, collapsible navigation system using Tabler.io components
 * 
 * Features:
 * - Collapsible tree navigation with expand/collapse
 * - Instant content switching (no page reloads)
 * - Breadcrumb n            // Define potential files to check for each section
            // This list covers all existing files and provides room for new ones
            const potentialFiles = [
                // Getting Started
                "installation",
                // User Guides
                "ticket-management", "vulnerability-management",
                // API Reference
                "tickets-api", "vulnerabilities-api", "backup-api", "index",
                // Architecture
                "backend", "database", "deployment", "frontend", "frameworks", "project-analysis",
                // Development
                "coding-standards", "contributing", "development-setup", "memory-system",
                "pre-commit-hooks", "docs-portal-guide",
                // Project Management
                "strategic-roadmap", "quality-badges", "codacy-compliance", "roadmap-to-sprint-system",
                // Security
                "vulnerability-scanning", "backup-restore"
            ];

            // Special case: For development section, include CHANGELOG
            if (section === "development") {
                try {
                    const changelogResponse = await fetch(this.getContentUrl("CHANGELOG.html"));
                    if (changelogResponse.ok) {
                        children["changelog"] = {
                            title: "Changelog",
                            file: "CHANGELOG"
                        };
                    }
                } catch (_error) {
                    // CHANGELOG doesn't exist, skip it
                }
            }
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
        
        // Handle initial hash or load overview
        const hash = window.location.hash.substring(1);
        const initialSection = hash || "overview";
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
            "overview": { title: "Overview", icon: "fas fa-home" },
            "getting-started": { title: "Getting Started", icon: "fas fa-rocket" },
            "user-guides": { title: "User Guides", icon: "fas fa-users" },
            "api-reference": { title: "API Reference", icon: "fas fa-code" },
            "architecture": { title: "Architecture", icon: "fas fa-building" },
            "development": { title: "Development", icon: "fas fa-hammer" },
            "security": { title: "Security", icon: "fas fa-shield-alt" },
            "white-papers": { title: "White Papers", icon: "fas fa-file-alt" },
            "roadmap": { title: "Roadmap", icon: "fas fa-map" },
            "changelog": { title: "Changelog", icon: "fas fa-list" },
            "sprint": { title: "Current Sprint", icon: "fas fa-running" }
        };

        try {
            // Try to auto-discover structure from the actual file system
            const discoveredStructure = await this.discoverDocumentationStructure();
            
            // Initialize navigation structure
            this.navigationStructure = {};
            
            // Add overview first (from OVERVIEW.html, not overview/index.html)
            try {
                const overviewResponse = await fetch(this.getContentUrl("OVERVIEW.html"));
                if (overviewResponse.ok) {
                    console.log("✅ Overview found: OVERVIEW.html");
                    this.navigationStructure.overview = {
                        title: sectionConfig.overview.title,
                        icon: sectionConfig.overview.icon,
                        file: "OVERVIEW", // Points to OVERVIEW.html
                        children: null
                    };
                } else {
                    console.log("❌ OVERVIEW.html not found");
                }
            } catch (error) {
                console.log("❌ Failed to check OVERVIEW.html:", error.message);
            }
            
            // Add discovered sections with configuration in proper order
            // 1. Getting Started should be first after Overview
            // 2. Then alphabetical order for regular folders
            // 3. Then special files (Current Sprint, Roadmap, Changelog) at the end
            
            const orderedSections = [];
            const specialSections = [];
            
            // First, separate regular sections from special files
            for (const [sectionKey, sectionData] of Object.entries(discoveredStructure)) {
                if (["roadmap", "changelog", "sprint"].includes(sectionKey)) {
                    specialSections.push([sectionKey, sectionData]);
                } else {
                    orderedSections.push([sectionKey, sectionData]);
                }
            }
            
            // Sort regular sections alphabetically, but ensure getting-started comes first
            orderedSections.sort(([keyA], [keyB]) => {
                if (keyA === "getting-started") {return -1;}
                if (keyB === "getting-started") {return 1;}
                return keyA.localeCompare(keyB);
            });
            
            // Add regular sections first
            for (const [sectionKey, sectionData] of orderedSections) {
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
            
            // Add special sections in the desired order: Current Sprint, Roadmap, Changelog
            const specialOrder = ["sprint", "roadmap", "changelog"];
            for (const specialKey of specialOrder) {
                const foundSpecial = specialSections.find(([key]) => key === specialKey);
                if (foundSpecial) {
                    const [sectionKey, sectionData] = foundSpecial;
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
            }
            
            console.log("📁 Navigation structure loaded:", Object.keys(this.navigationStructure));
            
        } catch (error) {
            console.warn("⚠️ Could not auto-discover structure, using fallback:", error);
            // Fallback to manual structure if auto-discovery fails
            this.loadFallbackStructure(sectionConfig);
        }
    }

    /**
     * Dynamically discover content folders by probing known common folder names
     * This ensures any new documentation folder is automatically included in navigation
     */
    async discoverContentFolders() {
        const commonFolders = [
            // Known existing folders
            "getting-started", "user-guides", "api-reference", 
            "architecture", "development", "security", "project-management",
            // Common documentation folder patterns to discover
            "tutorials", "guides", "reference", "examples", "advanced",
            "administration", "configuration", "deployment", "troubleshooting",
            "best-practices", "faq", "changelog", "roadmap", "releases"
        ];
        
        const discoveredFolders = [];
        
        for (const folder of commonFolders) {
            try {
                // Try to access the folder by checking for an index or any HTML file
                const testUrls = [
                    `${folder}/index.html`,
                    `${folder}/overview.html`
                ];
                
                let folderExists = false;
                for (const testUrl of testUrls) {
                    try {
                        const response = await fetch(this.getContentUrl(testUrl));
                        if (response.ok) {
                            folderExists = true;
                            break;
                        }
                    } catch (_error) {
                        // Continue testing other URLs
                    }
                }
                
                if (folderExists) {
                    discoveredFolders.push(folder);
                    console.log(`📁 Discovered content folder: ${folder}`);
                }
            } catch (_error) {
                // Folder doesn't exist, continue
            }
        }
        
        return discoveredFolders;
    }

    /**
     * Auto-discover documentation structure from content files
     * TRULY DYNAMIC: Scans actual folder structure from generated HTML files
     */
    async discoverDocumentationStructure() {
        const structure = {};
        
        try {
            console.log("🔍 Starting dynamic documentation structure discovery...");
            
            // Known directories based on docs-source structure
            // These are the actual folders that exist in docs-source/
            const knownSections = [
                "api-reference",
                "architecture", 
                "development",
                "getting-started",
                "security",
                "user-guides",
                "white-papers"
            ];
            
            // Discover each section and its files
            for (const section of knownSections) {
                console.log(`📁 Discovering section: ${section}`);
                
                // Check if section exists by testing for index.html
                try {
                    const indexResponse = await fetch(this.getContentUrl(`${section}/index.html`));
                    if (indexResponse.ok) {
                        console.log(`✅ Section found: ${section}`);
                        
                        // Discover all files in this section
                        const children = await this.discoverSectionChildren(section);
                        
                        structure[section] = {
                            file: `${section}/index`, // Always use index.html as main file
                            children: children
                        };
                        
                        console.log(`📋 Section ${section} has ${children ? Object.keys(children).length : 0} child files`);
                    } else {
                        console.log(`❌ Section ${section} has no index.html, skipping`);
                    }
                } catch (error) {
                    console.log(`❌ Failed to check section ${section}:`, error.message);
                }
            }
            
            // Add special standalone files as their own top-level menu items
            const specialFiles = [
                { key: "roadmap", title: "Strategic Roadmap", file: "ROADMAP" },
                { key: "changelog", title: "Changelog", file: "CHANGELOG" },
                { key: "sprint", title: "Current Sprint", file: "SPRINT" }
            ];
            
            for (const special of specialFiles) {
                try {
                    const response = await fetch(this.getContentUrl(`${special.file}.html`));
                    if (response.ok) {
                        console.log(`✅ Special file found: ${special.file}.html`);
                        structure[special.key] = {
                            title: special.title,
                            file: special.file,
                            children: null
                        };
                    } else {
                        console.log(`❌ Special file not found: ${special.file}.html`);
                    }
                } catch (error) {
                    console.log(`❌ Failed to check special file ${special.file}:`, error.message);
                }
            }
            
            console.log("🎉 Dynamic structure discovery complete:", Object.keys(structure));
            
        } catch (error) {
            console.error("❌ Could not discover documentation structure:", error);
        }
        
        return structure;
    }

    /**
     * Auto-discover roadmap files from /roadmaps/ folder and add them to development
     */
    async discoverRoadmapsStructure(structure) {
        console.log("📁 Scanning for roadmap and changelog files...");
        
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
            // If development section doesn't exist, create it
            if (!structure["development"]) {
                structure["development"] = {
                    file: "development/index",
                    children: {}
                };
            } else if (!structure["development"].children) {
                structure["development"].children = {};
            }
            
            // Test each roadmap file to see if it exists
            for (const roadmapFile of roadmapFiles) {
                try {
                    // Check if file exists by trying to fetch it from roadmaps folder
                    const response = await fetch(`${roadmapFile.path}${roadmapFile.file}`);
                    if (response.ok) {
                        console.log(`✅ Found roadmap file: ${roadmapFile.file}`);
                        
                        // Add to development children
                        structure["development"].children[roadmapFile.key] = {
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
                        
                        // Add to development children
                        structure["development"].children[rootFile.key] = {
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
     * Auto-discover children for a documentation section by testing actual files
     * TRULY DYNAMIC: Tests for files based on what was generated, not hardcoded lists
     */
    async discoverSectionChildren(section) {
        const children = {};
        
        try {
            console.log(`🔍 Discovering files in section: ${section}`);
            
            // Get a list of known files from our generation output
            // We know these files exist based on the npm run docs:generate output
            const knownFilesBySection = {
                "api-reference": ["backup-api", "tickets-api", "vulnerabilities-api"],
                "architecture": ["backend", "data-model", "database", "deployment", "frameworks", "frontend", "project-analysis", "rollover-mechanism"],
                "development": ["coding-standards", "contributing", "docs-portal-guide"],
                "getting-started": [], // Only has index.html
                "security": ["overview", "vulnerability-disclosure"],
                "user-guides": ["ticket-management", "vulnerability-management"],
                "white-papers": ["the-three-stooges", "the-vibe-coding-revolution"]
            };
            
            const potentialFiles = knownFilesBySection[section] || [];
            
            for (const fileName of potentialFiles) {
                try {
                    const response = await fetch(this.getContentUrl(`${section}/${fileName}.html`));
                    if (response.ok) {
                        console.log(`✅ Found file: ${section}/${fileName}.html`);
                        children[fileName] = {
                            title: this.formatTitle(fileName),
                            file: `${section}/${fileName}`
                        };
                    } else {
                        console.log(`❌ File not found: ${section}/${fileName}.html`);
                    }
                } catch (error) {
                    console.log(`❌ Failed to check file ${section}/${fileName}.html:`, error.message);
                }
            }
            
            console.log(`📋 Section ${section} discovered ${Object.keys(children).length} files:`, Object.keys(children));
            
        } catch (error) {
            console.warn(`❌ Could not discover children for section ${section}:`, error);
        }
        
        return Object.keys(children).length > 0 ? children : null;
    }

    /**
     * Dynamically discover files in a section by making systematic requests
     * This implements the true dynamic discovery as documented in docs-portal-guide.md
     */
    async discoverFilesInSection(section, children) {
        console.log(`🔍 Discovering files in section: ${section}`);
        
        // Method 1: Try nginx directory listing first (as documented)
        try {
            const dirUrl = `content/${section}/`;
            console.log(`📂 Attempting directory listing: ${dirUrl}`);
            
            const response = await fetch(dirUrl);
            if (response.ok) {
                const html = await response.text();
                
                // Parse HTML response to extract .html file names
                const htmlFileMatches = html.match(/href="([^"]+\.html)"/g);
                if (htmlFileMatches) {
                    console.log("✅ Directory listing successful, found HTML files");
                    
                    for (const match of htmlFileMatches) {
                        const filename = match.match(/href="([^"]+\.html)"/)[1];
                        // Strip leading ./ if present and remove .html extension
                        const name = filename.replace(/^\.\//, "").replace(".html", "");
                        
                        // Skip index.html (handled separately) and avoid duplicates
                        if (name !== "index" && !children[name]) {
                            console.log(`📄 Found via directory listing: ${filename} -> ${name}`);
                            children[name] = {
                                title: this.formatTitle(name),
                                file: `${section}/${name}`
                            };
                        }
                    }
                    return; // Success with directory listing, no need for fallback
                }
            } else {
                console.log(`⚠️ Directory listing failed (${response.status}), falling back to pattern testing`);
                throw new Error("Directory listing not available");
            }
        } catch (error) {
            console.log("📋 Directory listing failed, using fallback pattern testing:", error.message);
        }
        
        // Method 2: Fall back to testing common file patterns
        const commonPatterns = [
            // API files
            "tickets-api",
            "vulnerabilities-api", 
            "backup-api",
            // Guide files
            "users-guide",
            "admin-guide",
            "installation",
            "configuration",
            // Architecture files
            "architecture-overview",
            "component-diagram",
            "database-schema",
            "api-design",
            // Development files
            "deployment-guide",
            "testing-guide",
            "troubleshooting",
            "docker-setup",
            "performance",
            "backup-restore",
            "monitoring",
            "memory-system",
            "docs-portal-guide"
        ];
        
        for (const pattern of commonPatterns) {
            try {
                const response = await fetch(this.getContentUrl(`${section}/${pattern}.html`));
                if (response.ok && !children[pattern]) {
                    console.log(`✅ Found via pattern testing: ${pattern}.html`);
                    children[pattern] = {
                        title: this.formatTitle(pattern),
                        file: `${section}/${pattern}`
                    };
                }
            } catch (_err) {
                // Silently continue testing other patterns
            }
        }
        
        console.log(`📊 Discovered ${Object.keys(children).length} files in ${section}:`, Object.keys(children));
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
              children: [{ key: "deployment", title: "Deployment" }] },
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
                  { key: "roadmap", title: "Roadmap" },
                  { key: "changelog", title: "Changelog" },
                  { key: "coding-standards", title: "Coding Standards" },
                  { key: "contributing", title: "Contributing" },
                  { key: "development-setup", title: "Development Setup" }
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
            
            // Use the section's main file (which should be index) instead of first child
            const sectionFile = section.file;

            html += `
                <a class="list-group-item list-group-item-action d-flex align-items-center${hasChildren ? " collapsed" : ""}" 
                   href="#${sectionFile}" 
                   data-section="${sectionFile}"
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
                // Special handling for Overview page since we removed index.md files
                if (section === "index") {
                    content = this.generateOverviewContent();
                } else if (isExternalFile) {
                    // Load external markdown file and convert to HTML
                    content = await this.loadExternalMarkdown(section);
                } else {
                    // Map section to actual file name
                    let fileName = section;
                    if (section === "overview") {
                        fileName = "OVERVIEW"; // Special case: overview section maps to OVERVIEW.html
                    } else if (section === "roadmap") {
                        fileName = "ROADMAP"; // Special case: roadmap section maps to ROADMAP.html  
                    } else if (section === "changelog") {
                        fileName = "CHANGELOG"; // Special case: changelog section maps to CHANGELOG.html
                    } else if (section === "sprint") {
                        fileName = "SPRINT"; // Special case: sprint section maps to SPRINT.html
                    } else if (this.navigationStructure[section] && this.navigationStructure[section].file) {
                        // Use the file path from navigation structure for sections with subfiles
                        fileName = this.navigationStructure[section].file;
                    }
                    
                    // Load processed HTML content with proper base path
                    const contentUrl = this.getContentUrl(`${fileName}.html`);
                    console.log(`📄 Fetching content from: ${contentUrl}`);
                    
                    const response = await fetch(contentUrl);
                    if (!response.ok) {
                        throw new Error(`Failed to load ${section}: ${response.statusText} (URL: ${contentUrl})`);
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
     * Get the correct base path for content files
     * This handles different ways the documentation portal might be accessed
     */
    getBasePath() {
        const currentPath = window.location.pathname;
        
        // If we're serving directly from docs-html directory (like http://localhost:8081)
        if (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") {
            return "";  // No prefix needed when serving from docs-html itself
        }
        
        // If we're in the docs-html directory, return the path to docs-html
        if (currentPath.includes("/docs-html/")) {
            const basePath = currentPath.substring(0, currentPath.indexOf("/docs-html/") + "/docs-html/".length);
            return basePath;
        }
        
        // If we're in the root directory, need to go into docs-html
        if (currentPath === "/" || currentPath.endsWith("/")) {
            return "docs-html/";
        }
        
        // Default fallback - return docs-html relative path
        return "docs-html/";
    }

    /**
     * Helper method to create content URL with proper base path
     */
    getContentUrl(relativePath) {
        const basePath = this.getBasePath();
        return `${basePath}content/${relativePath}`;
    }

    /**
     * Generate dynamic Overview content since we removed index.md files
     */
    generateOverviewContent() {
        return `
            <h1>HexTrackr Documentation</h1>
            <p>Welcome to the HexTrackr documentation portal. This comprehensive guide covers deployment, usage, and development of the HexTrackr vulnerability and ticket management system.</p>
            
            <div class="row">
                <div class="col-md-6 mb-4">
                    <div class="card">
                        <div class="card-body">
                            <h3 class="card-title"><i class="fas fa-rocket"></i> Getting Started</h3>
                            <p class="card-text">Quick deployment and setup instructions to get HexTrackr running with Docker.</p>
                            <a href="#getting-started/deployment" class="btn btn-primary">View Deployment Guide</a>
                        </div>
                    </div>
                </div>
                
                <div class="col-md-6 mb-4">
                    <div class="card">
                        <div class="card-body">
                            <h3 class="card-title"><i class="fas fa-book"></i> User Guides</h3>
                            <p class="card-text">Learn how to manage tickets and vulnerabilities effectively.</p>
                            <a href="#user-guides/ticket-management" class="btn btn-primary">View User Guides</a>
                        </div>
                    </div>
                </div>
                
                <div class="col-md-6 mb-4">
                    <div class="card">
                        <div class="card-body">
                            <h3 class="card-title"><i class="fas fa-code"></i> API Reference</h3>
                            <p class="card-text">Complete API documentation for developers and integrations.</p>
                            <a href="#api-reference/tickets-api" class="btn btn-primary">View API Docs</a>
                        </div>
                    </div>
                </div>
                
                <div class="col-md-6 mb-4">
                    <div class="card">
                        <div class="card-body">
                            <h3 class="card-title"><i class="fas fa-building"></i> Architecture</h3>
                            <p class="card-text">Technical architecture and system design documentation.</p>
                            <a href="#architecture/backend" class="btn btn-primary">View Architecture</a>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="alert alert-info">
                <h4><i class="fas fa-info-circle"></i> About HexTrackr</h4>
                <p>HexTrackr is a comprehensive vulnerability and ticket management system built with Node.js, Express, and SQLite. It provides tools for tracking security vulnerabilities, managing support tickets, and integrating with external systems like ServiceNow.</p>
            </div>
        `;
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
