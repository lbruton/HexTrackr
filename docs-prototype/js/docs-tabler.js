/* eslint-env browser */
/* global fetch, window, document, console, CSS, Prism, bootstrap */
 

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

// Documentation Portal JavaScript (Tabler.io version)
class DocumentationPortal {
    constructor() {
        this.currentSection = "index";
        this.documentationData = {};
        this.searchIndex = [];
        this.fileStructure = null;
        this.init();
    }

    async init() {
        await this.loadFileStructure();
        this.renderSidebar();
        this.setupEventListeners();
        this.loadDocumentationData();
        this.initializeSearch();
        // Try to update overview statistics dynamically
        this.refreshOverviewStats();
        
        // Handle initial hash on load, or load index by default
        const hash = window.location.hash.substring(1);
        const initialSection = hash || "index";
        this.loadSection(initialSection);
    }

    async loadFileStructure() {
        try {
            // In a real scenario, this would be a fetch call to a server endpoint
            // that returns the directory structure as JSON.
            // For this prototype, we'll simulate it.
            this.fileStructure = {
                "Getting Started": [
                    "index.html",
                    "installation.html"
                ],
                "User Guides": [
                    "index.html",
                    "ticket-management.html",
                    "vulnerability-management.html"
                ],
                "API Reference": [
                    "index.html",
                    "tickets-api.html",
                    "vulnerabilities-api.html"
                ],
                "Architecture": [
                    "index.html",
                    "backend.html",
                    "database.html",
                    "deployment.html",
                    "frontend.html",
                    "frameworks.html"
                ],
                "Development": [
                    "index.html",
                    "coding-standards.html",
                    "contributing.html",
                    "development-setup.html"
                ],
                "Project Management": [
                    "index.html",
                    "roadmap.html",
                    "codacy-compliance.html"
                ],
                "Security": [
                    "index.html",
                    "overview.html",
                    "vulnerability-disclosure.html"
                ]
            };
            console.log("File structure loaded.");
        } catch (error) {
            console.error("Failed to load file structure:", error);
            this.fileStructure = {};
        }
    }

    renderSidebar() {
        const sidebarContainer = document.getElementById("sidebar-container");
        if (!sidebarContainer) {return;}

        let html = `
            <div class="card-header">
                <h3 class="card-title">
                    <i class="fas fa-list me-2"></i>
                    Table of Contents
                </h3>
            </div>
            <div class="list-group list-group-flush">
                <a href="#index" class="list-group-item list-group-item-action" data-section="index">Overview</a>
        `;

        for (const [category, files] of Object.entries(this.fileStructure)) {
            html += `<div class="list-group-item bg-light fw-bold">${category}</div>`;
            for (const file of files) {
                const sectionName = file.replace(".html", "");
                // Handle index files to just display the category name
                const displayName = sectionName === "index" 
                    ? category
                    : sectionName.replace(/-/g, " ").replace(/\b\w/g, l => l.toUpperCase());
                
                const dataSection = sectionName === "index" 
                    ? `${category.toLowerCase().replace(/ /g, "-")}/index`
                    : `${category.toLowerCase().replace(/ /g, "-")}/${sectionName}`;

                // Special handling for the main index to avoid prefix
                const linkSection = sectionName === "index" && category === "Getting Started"
                    ? "index"
                    : dataSection;

                html += `<a href="#${linkSection}" class="list-group-item list-group-item-action" data-section="${linkSection}">• ${displayName}</a>`;
            }
        }

        html += "</div>";
        sidebarContainer.innerHTML = html;
    }

    setupEventListeners() {
        // Use event delegation for sidebar links
        document.getElementById("sidebar-container").addEventListener("click", (e) => {
            if (e.target.matches(".list-group-item[data-section]")) {
                e.preventDefault();
                const section = e.target.dataset.section;
                this.loadSection(section);
            }
        });

        // Search keyboard shortcut
        document.addEventListener("keydown", (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === "k") {
                e.preventDefault();
                this.openSearch();
            }
        });

        // Hash change for direct links
        window.addEventListener("hashchange", () => {
            this.handleHashChange();
        });

        // Search input
        const searchInput = document.getElementById("searchInput");
        if (searchInput) {
            searchInput.addEventListener("input", (e) => {
                this.performSearch(e.target.value);
            });
        }
    }

    async loadSection(section) {
        if (!section) {section = "index";}
        this.showLoading();
        
        try {
            // Adjust the file path to correctly point to the content directory
            const filePath = `/docs-prototype/content/${section}.html`;
            const response = await fetch(filePath);
            
            if (!response.ok) {
                throw new Error(`Failed to load ${section}: ${response.statusText}`);
            }
            
            const content = await response.text();
            this.renderHTML(content, section);
            
            this.currentSection = section;
            this.updateActiveNavigation();
            this.updatePageTitle(section);
            
            if (window.location.hash !== `#${section}`) {
                window.history.pushState(null, null, `#${section}`);
            }
            
        } catch (error) {
            console.error("Error loading section:", error);
            this.showError(`Failed to load documentation for "${section}". Please check the file path and server status.`);
        } finally {
            this.hideLoading();
        }
    }

    renderHTML(content, section) {
        const container = document.getElementById("content-container");
        
        // Always clear the container first to prevent duplication
        container.innerHTML = "";
        
        // Create new section element for the content
        const sectionEl = document.createElement("section");
        sectionEl.id = `${section}-content`;
        sectionEl.innerHTML = content;
        
        container.appendChild(sectionEl);

        // Apply syntax highlighting to any code blocks
        if (window.Prism) {
            Prism.highlightAllUnder(sectionEl);
        }

        // Rewrite internal links inside the loaded content to use hash routing
        this.rewriteInternalLinks(sectionEl);
    }

    updateActiveNavigation() {
        document.querySelectorAll(".list-group-item[data-section]").forEach(link => {
            link.classList.remove("active");
        });
        
        const activeLink = document.querySelector(`.list-group-item[data-section="${this.currentSection}"]`);
        if (activeLink) {
            activeLink.classList.add("active");
        }
    }

    updatePageTitle(section) {
        const displayName = section.split("/").pop().replace(/-/g, " ").replace(/\b\w/g, l => l.toUpperCase());
        
        // Debug logging
        console.log("🔧 DEBUG: updatePageTitle called with section:", section);
        console.log("🔧 DEBUG: displayName:", displayName);
        
        // Note: Removed static title elements to prevent duplication
        // Content files now provide their own headings directly
        
        // Update browser tab title only
        document.title = `HexTrackr - Documentation | ${displayName}`;
        console.log("🔧 DEBUG: Updated browser tab title to:", `HexTrackr - Documentation | ${displayName}`);
    }

    handleHashChange() {
        const hash = window.location.hash.substring(1);
        const section = hash || "index";
        if (section !== this.currentSection) {
            this.loadSection(section);
        }
    }

    showLoading() {
        document.getElementById("loading-spinner").style.display = "block";
        document.getElementById("content-container").style.display = "none";
    }

    hideLoading() {
        document.getElementById("loading-spinner").style.display = "none";
        document.getElementById("content-container").style.display = "block";
    }

    showError(message) {
        const container = document.getElementById("content-container");
        container.innerHTML = `
            <div class="alert alert-danger" role="alert">
                <h4 class="alert-title">Error Loading Documentation</h4>
                <div class="text-muted">${escapeHtml(message)}</div>
            </div>
        `;
    }

    openSearch() {
        const searchModalEl = document.getElementById("searchModal");
        if (searchModalEl) {
            const searchModal = new bootstrap.Modal(searchModalEl);
            searchModal.show();
        }
    }

    async loadDocumentationData() {
        // This method can be enhanced to load all docs for client-side search
        console.log("Skipping full data load for search in this version.");
    }

    initializeSearch() {
        // This method can be enhanced for client-side search
        console.log("Search initialization skipped in this version.");
    }

    performSearch(query) {
        const resultsContainer = document.getElementById("searchResults");
        if (resultsContainer) {
            resultsContainer.innerHTML = "<p class=\"text-muted text-center\">Search is not fully implemented in this version.</p>";
        }
    }

    highlight(text, query) {
        return text.replace(new RegExp(this.escapeRegExp(query), "gi"), (match) => `<span class="bg-yellow-lt">${match}</span>`);
    }

    escapeRegExp(string) {
        return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); // Escape special characters
    }

    // Map a content href to a section path used by the router. Returns
    // { section: 'category/page', fragment?: 'anchor' } or null if external.
    mapContentHrefToSection(href) {
        if (!href) {return null;}
        const trimmed = href.trim();

        // External links or protocols we don't handle
        if (/^(https?:)?\/\//i.test(trimmed) || /^mailto:/i.test(trimmed) || /^tel:/i.test(trimmed)) {
            return null;
        }

        // In-page anchor within the current content
        if (trimmed.startsWith("#")) {
            return { section: this.currentSection, fragment: trimmed.slice(1) };
        }

        // Normalize common path patterns to content path
        const patterns = [
            /^\/?docs-prototype\/content\/(.+?)\.html(?:#(.*))?$/i,
            /^\/?content\/(.+?)\.html(?:#(.*))?$/i,
            /^\.\.\/content\/(.+?)\.html(?:#(.*))?$/i,
            /^\.\/content\/(.+?)\.html(?:#(.*))?$/i,
        ];

        for (const rx of patterns) {
            const m = trimmed.match(rx);
            if (m) {
                const section = m[1];
                const fragment = m[2];
                return { section, fragment };
            }
        }

        // Relative HTML file link (e.g., "backend.html")
        if (/^[a-z0-9\-_/]+\.html(?:#(.*))?$/i.test(trimmed)) {
            const rel = trimmed.replace(/^\.\//, "");
            const noHtml = rel.replace(/\.html(?:#.*)?$/i, "");
            // Resolve relative to current section directory
            const parts = this.currentSection.split("/");
            parts.pop(); // remove current page
            const base = parts.join("/");
            const section = base ? `${base}/${noHtml}` : noHtml;
            const fragMatch = trimmed.match(/\.html#(.*)$/i);
            const fragment = fragMatch ? fragMatch[1] : undefined;
            return { section, fragment };
        }

        return null;
    }

    // Rewrite internal links inside a container to hash-based routes and
    // delegate navigation through loadSection. Keeps external links intact.
    rewriteInternalLinks(rootEl) {
        if (!rootEl) {return;}
        const anchors = rootEl.querySelectorAll("a[href]");
        anchors.forEach((a) => {
            const href = a.getAttribute("href");
            const mapped = this.mapContentHrefToSection(href);
            if (!mapped) {return;} // external

            // If it's an in-page anchor, just handle smooth scroll
            if (href.startsWith("#")) {
                a.addEventListener("click", (e) => {
                    e.preventDefault();
                    const id = href.slice(1);
                    const target = rootEl.querySelector(`[id="${CSS.escape(id)}"]`);
                    if (target) {target.scrollIntoView({ behavior: "smooth", block: "start" });}
                });
                return;
            }

            // Regular internal doc link: rewrite href and handle via router
            const newHash = `#${mapped.section}`;
            a.setAttribute("href", newHash);
            a.addEventListener("click", (e) => {
                e.preventDefault();
                this.loadSection(mapped.section).then(() => {
                    if (mapped.fragment) {
                        const target = document.getElementById(mapped.fragment) || rootEl.querySelector(`[id="${CSS.escape(mapped.fragment)}"]`);
                        if (target) {target.scrollIntoView({ behavior: "smooth", block: "start" });}
                    }
                });
            });
        });
    }

    // Fetch dynamic statistics for the overview cards
    async refreshOverviewStats() {
        try {
            const res = await fetch("/api/docs/stats");
            if (!res.ok) {return;} // leave defaults
            const data = await res.json();
            // Update cards if present
            const endpointEl = document.querySelector("#overview-content .card-body .h1");
            // The overview has 3 cards; query them explicitly
            const cards = document.querySelectorAll("#overview-content .card.card-sm .card-body .h1");
            if (cards.length >= 3) {
                // 0: endpoints, 1: js functions, 2: frameworks
                if (typeof data.apiEndpoints === "number") {cards[0].textContent = data.apiEndpoints;}
                if (typeof data.jsFunctions === "number") {cards[1].textContent = data.jsFunctions;}
                if (typeof data.frameworks === "number") {cards[2].textContent = data.frameworks;}
            }

            // Also update badge counts if present
            const apiBadges = Array.from(document.querySelectorAll("#overview-content .badge.bg-blue-lt"));
            const jsBadges = Array.from(document.querySelectorAll("#overview-content .badge.bg-green-lt"));
            const apiBadge = apiBadges.find(b => /Endpoints/i.test(b.textContent));
            const jsBadge = jsBadges.find(b => /Functions/i.test(b.textContent));
            if (apiBadge && typeof data.apiEndpoints === "number") {apiBadge.textContent = `${data.apiEndpoints} Endpoints`;}
            if (jsBadge && typeof data.jsFunctions === "number") {jsBadge.textContent = `${data.jsFunctions} Functions`;}
        } catch (_) {
            // ignore; leave defaults
        }
    }
}

// Initialize the documentation portal
document.addEventListener("DOMContentLoaded", () => {
    const portal = new DocumentationPortal();
});