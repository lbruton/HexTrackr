/* eslint-env browser */
/* global console, document, window */

/**
 * Security utilities for HexTrackr
 * Provides XSS protection, input sanitization, and content security policy helpers
 */

/* eslint-env browser */
/* global DOMPurify */

/**
 * Safely set innerHTML with DOMPurify sanitization
 * @param {HTMLElement} element - The DOM element to update
 * @param {string} htmlContent - The HTML content to sanitize and inject
 */
function safeSetInnerHTML(element, htmlContent) {
    if (typeof DOMPurify !== "undefined") {
        element.innerHTML = DOMPurify.sanitize(htmlContent);
    } else {
        console.warn("DOMPurify not available, falling back to textContent"); // eslint-disable-line no-console
        element.textContent = htmlContent;
    }
}

/**
 * Escape HTML entities to prevent XSS attacks
 * @param {string} text - The text to escape
 * @returns {string} - The escaped text
 */
function escapeHtml(text) {
    if (!text) {
        return "";
    }
    const div = document.createElement("div"); // eslint-disable-line no-undef
    div.textContent = text;
    return div.innerHTML;
}

/**
 * Safely create element with sanitized content
 * @param {string} tagName - The HTML tag name
 * @param {string} content - The content to sanitize
 * @param {object} attributes - Optional attributes to set
 * @returns {HTMLElement} - The created element
 */
function safeCreateElement(tagName, content = "", attributes = {}) {
    const element = document.createElement(tagName); // eslint-disable-line no-undef
    
    if (content) {
        if (typeof DOMPurify !== "undefined") {
            element.innerHTML = DOMPurify.sanitize(content);
        } else {
            element.textContent = content;
        }
    }
    
    // Set attributes safely
    for (const [key, value] of Object.entries(attributes)) {
        if (key.startsWith("on")) {
            console.warn(`Skipping event attribute: ${key}`); // eslint-disable-line no-console
            continue;
        }
        element.setAttribute(key, escapeHtml(value));
    }
    
    return element;
}

// Make functions globally available
if (typeof window !== "undefined") { // eslint-disable-line no-undef
    window.safeSetInnerHTML = safeSetInnerHTML;
    window.escapeHtml = escapeHtml;
    window.safeCreateElement = safeCreateElement;
}
