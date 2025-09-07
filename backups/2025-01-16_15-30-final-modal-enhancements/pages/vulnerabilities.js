/* eslint-env browser */
/* global ModernVulnManager */

/**
 * @fileoverview
 * This file initializes the vulnerability management application.
 * It creates an instance of the ModernVulnManager and sets up
 * global event listeners.
 *
 * @version 1.0.0
 * @author Gemini
 * @date 2025-09-03
 */

document.addEventListener("DOMContentLoaded", () => {
    const vulnManager = new ModernVulnManager();
    
    // Make the vulnManager instance globally accessible for inline event handlers
    window.vulnManager = vulnManager;

    // Add event listener for chart metric toggle
    document.querySelectorAll("input[name=\"chart-metric\"]").forEach(radio => {
        radio.addEventListener("change", () => {
            if (vulnManager && vulnManager.updateChart) {
                vulnManager.updateChart();
            }
        });
    });
});