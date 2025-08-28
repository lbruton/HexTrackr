/* eslint-env browser */

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
        this.handleHashChange(); // Handle initial hash on load
    }

    async loadFileStructure() {
        try {
            // In a real scenario, this would be a fetch call to a server endpoint
            // that returns the directory structure as JSON.
            // For this prototype, we'll simulate it.
            this.fileStructure = {
                "Getting Started": [
                    "installation-guide.html",
                    "quick-start.html",
                    "configuration.html",
                    "first-run.html"
                ],
                "User Guides": [
                    "ticket-management.html",
                    "vulnerability-management.html",
                    "csv-import-export.html",
                    "settings.html",
                    "backup-restore.html"
                ],
                "API Reference": [
                    "rest-api-reference.html",
                    "tickets.html",
                    "vulnerabilities.html"
                ],
                "Architecture": [
                    "overview.html",
                    "database-schema.html",
                    "page-flow-navigation.html",
                    "docs-system.html",
                    "functions.html",
                    "javascript-reference.html",
                    "symbols-index.html"
                ],
                "Development": [
                    "development-setup.html",
                    "coding-standards.html",
                    "coding-style-guide.html",
                    "testing-guide.html",
                    "versioning.html"
                ],
                "Frameworks": [
                    "bootstrap.html",
                    "nodejs-express.html",
                    "tabler-io.html"
                ],
                "Project Management": [
                    "roadmap.html"
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
        if (!sidebarContainer) return;

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
                const sectionName = file.replace('.html', '');
                const displayName = sectionName.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
                const dataSection = `${category.toLowerCase().replace(/ /g, '-')}/${sectionName}`;
                html += `<a href="#${dataSection}" class="list-group-item list-group-item-action" data-section="${dataSection}">• ${displayName}</a>`;
            }
        }

        html += '</div>';
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
        if (!section) section = "index";
        this.showLoading();
        
        try {
            const filePath = `content/${section}.html`;
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
        
        let sectionEl = document.getElementById(`${section}-content`);
        if (!sectionEl) {
            sectionEl = document.createElement("section");
            sectionEl.id = `${section}-content`;
            container.innerHTML = ''; // Clear previous content
            container.appendChild(sectionEl);
        }
        
        sectionEl.innerHTML = content;

        // Apply syntax highlighting to any code blocks
        if (window.Prism) {
            Prism.highlightAllUnder(sectionEl);
        }
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
        const displayName = section.split('/').pop().replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
        document.getElementById("page-title").textContent = displayName;
        document.getElementById("page-description").textContent = `HexTrackr Documentation | ${displayName}`;
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
                <div class="text-muted">${message}</div>
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
        return text.replace(new RegExp(query, "gi"), (match) => `<span class="bg-yellow-lt">${match}</span>`);
    }
}

// Initialize the documentation portal
document.addEventListener("DOMContentLoaded", () => {
    const portal = new DocumentationPortal();
});