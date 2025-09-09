/**
 * HexTrackr Configuration Loader
 * Loads application configuration including version from the server
 * Must be loaded before footer-loader.js and other components that depend on config
 */

/* eslint-env browser */
/* global window, fetch, console */

(function() {
    "use strict";
    
    // Initialize global config object
    window.HexTrackrConfig = window.HexTrackrConfig || {};
    
    /**
     * Load application configuration from server
     * @returns {Promise<void>}
     */
    async function loadConfig() {
        try {
            console.log("🔧 Loading HexTrackr configuration...");
            
            // Fetch version and health info from server
            const response = await fetch("/health", {
                method: "GET",
                headers: {
                    "Accept": "application/json"
                },
                // Add timeout to prevent hanging
                signal: AbortSignal.timeout(5000)
            });
            
            if (!response.ok) {
                throw new Error(`Health endpoint returned ${response.status}: ${response.statusText}`);
            }
            
            const healthData = await response.json();
            
            // Store configuration in global object
            window.HexTrackrConfig = {
                version: healthData.version || "unknown",
                status: healthData.status,
                dbConnected: healthData.db,
                uptime: healthData.uptime,
                loadTime: new Date().toISOString()
            };
            
            console.log(`✅ HexTrackr configuration loaded: v${window.HexTrackrConfig.version}`);
            
            // Dispatch custom event to notify other components that config is ready
            const configLoadedEvent = new CustomEvent("hextrackr:config:loaded", {
                detail: window.HexTrackrConfig
            });
            document.dispatchEvent(configLoadedEvent);
            
        } catch (error) {
            console.warn("⚠️ Failed to load HexTrackr configuration:", error.message);
            
            // Set fallback configuration
            window.HexTrackrConfig = {
                version: "unknown",
                status: "error",
                dbConnected: false,
                uptime: 0,
                loadTime: new Date().toISOString(),
                error: error.message
            };
            
            // Still dispatch event so components don't hang waiting
            const configErrorEvent = new CustomEvent("hextrackr:config:error", {
                detail: { error: error.message }
            });
            document.dispatchEvent(configErrorEvent);
        }
    }
    
    /**
     * Get current version string
     * @returns {string} Current application version
     */
    function getVersion() {
        return window.HexTrackrConfig?.version || "unknown";
    }
    
    /**
     * Check if configuration is loaded and valid
     * @returns {boolean} True if config is loaded
     */
    function isConfigLoaded() {
        return window.HexTrackrConfig && 
               typeof window.HexTrackrConfig.version === "string" && 
               window.HexTrackrConfig.version !== "unknown";
    }
    
    // Add utility methods to global config
    window.HexTrackrConfig.getVersion = getVersion;
    window.HexTrackrConfig.isLoaded = isConfigLoaded;
    
    // Load configuration when DOM is ready
    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", loadConfig);
    } else {
        // DOM is already ready
        loadConfig();
    }
    
})();