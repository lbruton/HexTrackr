/* eslint-env browser */

// Documentation Portal JavaScript (Tabler.io version)
class DocumentationPortal {
    constructor() {
        this.currentSection = "overview";
        this.documentationData = {};
        this.searchIndex = [];
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadDocumentationData();
        this.initializeSearch();
        this.updateActiveNavigation();
        this.handleHashChange(); // Handle initial hash on load
    }

    setupEventListeners() {
        // Navigation links
        document.querySelectorAll(".list-group-item[data-section]").forEach(link => {
            link.addEventListener("click", (e) => {
                e.preventDefault();
                const section = e.target.closest("[data-section]").dataset.section;
                this.loadSection(section);
            });
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
        document.getElementById("searchInput").addEventListener("input", (e) => {
            this.performSearch(e.target.value);
        });
    }

    async loadSection(section) {
        if (!section) section = "overview";
        this.showLoading();
        
        try {
            if (section === "overview") {
                this.renderOverview();
            } else {
                // Map sections to generated content files
                const fileMap = {
                    "api-tickets": "content/api/tickets.html",
                    "api-vulnerabilities": "content/api/vulnerabilities.html",
                    "frameworks-tabler": "content/frameworks/tabler.html",
                    "frameworks-bootstrap": "content/frameworks/bootstrap.html", 
                    "frameworks-apexcharts": "content/frameworks/apexcharts.html",
                    "frameworks-aggrid": "content/frameworks/aggrid.html",
                    "functions-overview": "content/architecture/overview.html",
                    "functions-tickets": "content/architecture/functions.html",
                    "database-schema": "content/architecture/database-schema.html",
                    "ui-api-flowcharts": "content/architecture/ui-api-flowcharts.html",
                    "page-flow-navigation": "content/architecture/page-flow-navigation.html",
                    "bugs-found": "content/code-review/bugs-found.html",
                    "handoff-template": "content/code-review/handoff-template.html",
                    // Distinct content sections (no more duplicates)
                    "javascript": "content/architecture/javascript-reference.html",
                    "javascript-reference": "content/architecture/javascript-reference.html",
                    "symbols": "content/architecture/symbols-index.html",
                    "symbols-index": "content/architecture/symbols-index.html",
                    "docs-system": "content/architecture/docs-system.html",
                    "roadmap": "content/roadmap.html"
                };
                
                const filePath = fileMap[section];
                
                if (!filePath) {
                    throw new Error(`Unknown section: ${section}`);
                }
                
                const response = await fetch(filePath);
                if (!response.ok) {
                    throw new Error(`Failed to load ${section}: ${response.statusText}`);
                }
                
                const content = await response.text();
                this.renderHTML(content, section);
            }
            
            this.currentSection = section;
            this.updateActiveNavigation();
            this.updatePageTitle(section);
            
            if (window.location.hash !== `#${section}`) {
                window.history.pushState(null, null, `#${section}`);
            }
            
        } catch (error) {
            console.error("Error loading section:", error);
            this.showError(`Failed to load ${section} documentation: ${error.message}`);
        } finally {
            this.hideLoading();
        }
    }

    renderOverview() {
        const container = document.getElementById("content-container");
        // The overview is already in the HTML, so we just need to make sure it's visible
        container.querySelector("#overview-content").style.display = "block";
    }

    renderHTML(content, section) {
        const container = document.getElementById("content-container");
        
        // Hide overview if it's there
        const overviewContent = container.querySelector("#overview-content");
        if(overviewContent) overviewContent.style.display = "none";

        let sectionEl = document.getElementById(`${section}-content`);
        if (!sectionEl) {
            sectionEl = document.createElement("section");
            sectionEl.id = `${section}-content`;
            container.appendChild(sectionEl);
        }
        
        // Hide all other sections
        document.querySelectorAll("#content-container section").forEach(s => {
            s.style.display = "none";
        });

        sectionEl.innerHTML = content;
        sectionEl.style.display = "block";

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
        const sectionNames = {
            overview: "Technical Documentation",
            "api-tickets": "Ticket Management API",
            "api-vulnerabilities": "Vulnerability Management API",
            "frameworks-tabler": "Tabler.io Integration",
            "frameworks-bootstrap": "Bootstrap Usage",
            "frameworks-apexcharts": "ApexCharts Implementation",
            "frameworks-aggrid": "AG Grid Integration",
            "functions-overview": "System Architecture",
            "functions-tickets": "Function Reference",
            "bugs-found": "Known Issues & Fixes",
            "handoff-template": "Sprint Handoffs",
            // Legacy mappings
            "javascript": "Function Reference",
            "symbols": "Function Reference"
        };

        const title = sectionNames[section] || "Documentation";
        document.getElementById("page-title").textContent = title;
        document.getElementById("page-description").textContent = `HexTrackr ${title}`;
    }

    handleHashChange() {
        const hash = window.location.hash.substring(1);
        const section = hash || "overview";
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
        const searchModal = new bootstrap.Modal(document.getElementById("searchModal"));
        searchModal.show();
    }

    async loadDocumentationData() {
        // Load generated documentation files for search indexing
        const files = [
            "content/api/tickets.html",
            "content/frameworks/tabler.html",
            "content/frameworks/bootstrap.html",
            "content/frameworks/apexcharts.html",
            "content/frameworks/aggrid.html",
            "content/architecture/overview.html",
            "content/architecture/functions.html"
        ];

        try {
            const fetchPromises = files.map(file => {
                const section = this.fileToSection(file);
                return fetch(file)
                    .then(response => response.ok ? response.text() : "")
                    .then(text => ({
                        file: section,
                        content: this.stripHTML(text)
                    }))
                    .catch(() => ({ file: section, content: "" }));
            });

            this.documentationData = await Promise.all(fetchPromises);
            this.initializeSearch();
        } catch (error) {
            console.log("Search data loading failed, search will be limited:", error);
            this.documentationData = [];
        }
    }

    fileToSection(file) {
        const mapping = {
            "content/api/tickets.html": "api-tickets",
            "content/frameworks/tabler.html": "frameworks-tabler",
            "content/frameworks/bootstrap.html": "frameworks-bootstrap",
            "content/frameworks/apexcharts.html": "frameworks-apexcharts",
            "content/frameworks/aggrid.html": "frameworks-aggrid",
            "content/architecture/overview.html": "functions-overview",
            "content/architecture/functions.html": "functions-tickets"
        };
        return mapping[file] || file;
    }

    stripHTML(html) {
        const temp = document.createElement("div");
        temp.innerHTML = html;
        return temp.textContent || temp.innerText || "";
    }

    initializeSearch() {
        if (!this.documentationData.length) return;

        this.searchIndex = this.documentationData.flatMap(doc => {
            const lines = doc.content.split("\n");
            return lines.map((line, index) => ({
                id: `${doc.file}-${index}`,
                section: doc.file,
                text: line
            }));
        });
        console.log("Search index built");
    }

    performSearch(query) {
        const resultsContainer = document.getElementById("searchResults");
        
        if (!query.trim()) {
            resultsContainer.innerHTML = "<p class=\"text-muted text-center\">Start typing to search...</p>";
            return;
        }

        const lowerCaseQuery = query.toLowerCase();
        const results = this.searchIndex.filter(item => item.text.toLowerCase().includes(lowerCaseQuery));

        if (results.length === 0) {
            resultsContainer.innerHTML = "<p class=\"text-muted text-center\">No results found.</p>";
            return;
        }

        resultsContainer.innerHTML = results.slice(0, 20).map(result => `
            <a href="#${result.section}" class="list-group-item list-group-item-action" data-bs-dismiss="modal"
               onclick="portal.loadSection('${result.section}')">
                <div class="fw-bold">${result.section.replace(/-/g, " ")}</div>
                <div class="text-muted small">${this.highlight(result.text, query)}</div>
            </a>
        `).join("");
    }

    highlight(text, query) {
        return text.replace(new RegExp(query, "gi"), (match) => `<span class="bg-yellow-lt">${match}</span>`);
    }
}

// Initialize the documentation portal
document.addEventListener("DOMContentLoaded", () => {
    const portal = new DocumentationPortal();
});
