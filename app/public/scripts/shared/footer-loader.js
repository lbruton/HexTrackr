/**
 * HexTrackr Shared Footer Loader
 * Loads the shared footer component
 */

/* eslint-env browser */
/* global document, window, fetch, DOMParser, console */

document.addEventListener("DOMContentLoaded", function() {
    const footerContainer = document.getElementById("footerContainer");
    
    if (footerContainer) {
        // Determine the correct path based on current location
        const basePath = window.location.pathname.includes("/docs-html/") ? "../" : "";
        const footerPath = `${basePath}scripts/shared/footer.html`;
        
        fetch(footerPath)
            .then(response => response.text())
            .then(footerHTML => {
                // Create a safe DOM parser to prevent XSS
                const parser = new DOMParser();
                const footerDoc = parser.parseFromString(footerHTML, "text/html");
                const footerElement = footerDoc.body.firstElementChild;
                
                if (footerElement) {
                    // Clear container and append parsed element safely
                    footerContainer.innerHTML = "";
                    footerContainer.appendChild(footerElement);
                } else {
                    // If parsing fails, use fallback
                    createFallbackFooter(footerContainer);
                }
                
                // Update version number if available
                const versionSpan = document.getElementById("app-version");
                if (versionSpan && window.HexTrackrConfig && window.HexTrackrConfig.version) {
                    versionSpan.textContent = window.HexTrackrConfig.version;
                }
            })
            .catch(error => {
                console.warn("Failed to load shared footer:", error);
                createFallbackFooter(footerContainer);
            });
    }
});

/**
 * Creates a safe fallback footer using DOM methods with badges
 * @param {Element} container - The container element to add footer to
 */
function createFallbackFooter(container) {
    const footer = document.createElement("footer");
    footer.className = "footer footer-transparent d-print-none mt-5";
    
    const containerXl = document.createElement("div");
    containerXl.className = "container-xl";
    
    const row = document.createElement("div");
    row.className = "row text-center align-items-center flex-row-reverse";
    
    const col = document.createElement("div");
    col.className = "col-12 col-lg-auto mt-3 mt-lg-0";
    
    const ul = document.createElement("ul");
    ul.className = "list-inline list-inline-dots mb-0";
    
    // Version badge
    const versionLi = document.createElement("li");
    versionLi.className = "list-inline-item";
    const versionA = document.createElement("a");
    versionA.href = "/docs-html/#CHANGELOG";
    versionA.title = "View Changelog";
    const versionImg = document.createElement("img");
    versionImg.src = "https://img.shields.io/badge/HexTrackr-v1.0.44-blue?style=flat&logo=data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEyIDJMMTMuMDkgOC4yNkwyMSA5TDEzLjA5IDE1Ljc0TDEyIDIyTDEwLjkxIDE1Ljc0TDMgOUwxMC45MSA4LjI2TDEyIDJaIiBmaWxsPSJ3aGl0ZSIvPgo8L3N2Zz4K";
    versionImg.alt = "HexTrackr Version";
    versionImg.style.height = "20px";
    versionImg.className = "img-fluid";
    versionA.appendChild(versionImg);
    versionLi.appendChild(versionA);
    
    // SQLite badge
    const sqliteLi = document.createElement("li");
    sqliteLi.className = "list-inline-item";
    const sqliteImg = document.createElement("img");
    sqliteImg.src = "https://img.shields.io/badge/Database-SQLite-003B57?style=flat&logo=sqlite&logoColor=white";
    sqliteImg.alt = "SQLite Database";
    sqliteImg.style.height = "20px";
    sqliteImg.className = "img-fluid";
    sqliteLi.appendChild(sqliteImg);
    
    // Express.js badge
    const expressLi = document.createElement("li");
    expressLi.className = "list-inline-item";
    const expressImg = document.createElement("img");
    expressImg.src = "https://img.shields.io/badge/Backend-Express.js-000000?style=flat&logo=express&logoColor=white";
    expressImg.alt = "Express.js Backend";
    expressImg.style.height = "20px";
    expressImg.className = "img-fluid";
    expressLi.appendChild(expressImg);
    
    // Tabler badge
    const tablerLi = document.createElement("li");
    tablerLi.className = "list-inline-item";
    const tablerImg = document.createElement("img");
    tablerImg.src = "https://img.shields.io/badge/UI-Tabler-667df6?style=flat&logo=tabler&logoColor=white";
    tablerImg.alt = "Tabler UI Framework";
    tablerImg.style.height = "20px";
    tablerImg.className = "img-fluid";
    tablerLi.appendChild(tablerImg);
    
    // Documentation badge
    const docsLi = document.createElement("li");
    docsLi.className = "list-inline-item";
    const docsA = document.createElement("a");
    docsA.href = "/docs-html/";
    docsA.target = "_blank";
    docsA.title = "Project Documentation";
    const docsImg = document.createElement("img");
    docsImg.src = "https://img.shields.io/badge/Documentation-Available-green?style=flat&logo=gitbook&logoColor=white";
    docsImg.alt = "Documentation";
    docsImg.style.height = "20px";
    docsImg.className = "img-fluid";
    docsA.appendChild(docsImg);
    docsLi.appendChild(docsA);
    
    // GitHub badge
    const githubLi = document.createElement("li");
    githubLi.className = "list-inline-item";
    const githubA = document.createElement("a");
    githubA.href = "https://github.com/Lonnie-Bruton/HexTrackr";
    githubA.target = "_blank";
    githubA.title = "Source Code Repository";
    const githubImg = document.createElement("img");
    githubImg.src = "https://img.shields.io/badge/GitHub-Repository-black?style=flat&logo=github&logoColor=white";
    githubImg.alt = "GitHub Repository";
    githubImg.style.height = "20px";
    githubImg.className = "img-fluid";
    githubA.appendChild(githubImg);
    githubLi.appendChild(githubA);
    
    // Codacy badge
    const codacyLi = document.createElement("li");
    codacyLi.className = "list-inline-item";
    const codacyA = document.createElement("a");
    codacyA.href = "https://app.codacy.com?utm_source=gh&utm_medium=referral&utm_content=&utm_campaign=Badge_grade";
    codacyA.target = "_blank";
    codacyA.title = "Code Quality Grade A";
    const codacyImg = document.createElement("img");
    codacyImg.src = "https://app.codacy.com/project/badge/Grade/b3f731f8d8244dabafabb39339014886";
    codacyImg.alt = "Codacy Grade A";
    codacyImg.style.height = "20px";
    codacyImg.className = "img-fluid";
    codacyA.appendChild(codacyImg);
    codacyLi.appendChild(codacyA);
    
    ul.appendChild(versionLi);
    ul.appendChild(sqliteLi);
    ul.appendChild(expressLi);
    ul.appendChild(tablerLi);
    ul.appendChild(docsLi);
    ul.appendChild(githubLi);
    ul.appendChild(codacyLi);
    
    col.appendChild(ul);
    row.appendChild(col);
    containerXl.appendChild(row);
    footer.appendChild(containerXl);

    container.innerHTML = "";
    container.appendChild(footer);
}