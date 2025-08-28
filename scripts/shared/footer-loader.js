/**
 * HexTrackr Shared Footer Loader
 * Loads the shared footer component into any page
 */

document.addEventListener("DOMContentLoaded", function() {
    const footerContainer = document.getElementById("footerContainer");
    
    if (footerContainer) {
        fetch("/scripts/shared/footer.html")
            .then(response => response.text())
            .then(footerHTML => {
                footerContainer.innerHTML = footerHTML;
                
                // Update version number if available
                const versionSpan = document.getElementById("app-version");
                if (versionSpan && window.HexTrackrConfig && window.HexTrackrConfig.version) {
                    versionSpan.textContent = window.HexTrackrConfig.version;
                }
            })
            .catch(error => {
                console.warn("Failed to load shared footer:", error);
                // Fallback footer
                footerContainer.innerHTML = `
                    <footer class="footer footer-transparent d-print-none mt-5">
                        <div class="container-xl">
                            <div class="row text-center align-items-center flex-row-reverse">
                                <div class="col-12 col-lg-auto mt-3 mt-lg-0">
                                    <small class="text-muted">HexTrackr v1.0.1</small>
                                </div>
                            </div>
                        </div>
                    </footer>
                `;
            });
    }
});