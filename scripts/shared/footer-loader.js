/**
 * HexTrackr Shared Footer Loader
 * Loads the shared footer component into any page
 */

/* eslint-env browser */
/* global document, window, fetch, DOMParser, console */

document.addEventListener("DOMContentLoaded", function() {
    const footerContainer = document.getElementById("footerContainer");
    
    if (footerContainer) {
        fetch(
            (window.HexTrackrConfig && window.HexTrackrConfig.basePath
                ? window.HexTrackrConfig.basePath.replace(/\/$/, "") + "/scripts/shared/footer.html"
                : "./scripts/shared/footer.html"
            )
        )
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
 * Creates a safe fallback footer using DOM methods
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
    
    const small = document.createElement("small");
    small.className = "text-muted";
    small.textContent = "HexTrackr v1.0.1";
    
    col.appendChild(small);
    row.appendChild(col);
    containerXl.appendChild(row);
    footer.appendChild(containerXl);
    
    container.innerHTML = "";
    container.appendChild(footer);
}