/**
 * Accessibility Announcer Utility - T044
 * Provides ARIA live region management for screen reader announcements
 * Follows WCAG 2.1 guidelines for dynamic content announcement
 * 
 * @module AccessibilityAnnouncer
 * @version 1.0.0
 */

/**
 * ARIA live region manager for dynamic content announcements
 * Creates and manages invisible live regions for screen reader accessibility
 * 
 * @class
 */
export class AccessibilityAnnouncer {
  /**
   * Constructor - initializes live regions and announcement queue
   * 
   * @constructor
   */
  constructor() {
    // Live region elements for different announcement types
    this.liveRegions = {
      polite: null,      // For non-urgent announcements
      assertive: null,   // For urgent announcements
      status: null       // For status updates
    };
    
    // Announcement queue and timing management
    this.announcementQueue = [];
    this.isAnnouncing = false;
    this.lastAnnouncement = null;
    this.announcementTimeout = null;
    
    // Configuration
    this.debounceDelay = 1000; // 1 second between announcements
    this.clearDelay = 1500;    // Clear announcement after 1.5 seconds
    this.maxQueueSize = 10;    // Prevent memory issues
    
    // Analytics and debugging
    this.announcementCount = 0;
    this.duplicatesFiltered = 0;
    this.queueDropped = 0;
    
    // Initialize live regions
    this.initializeLiveRegions();
    
    // Register cleanup for page unload
    this.registerCleanup();
    
    console.log("AccessibilityAnnouncer initialized with live regions");
  }

  /**
   * Initialize ARIA live regions in the DOM
   * Creates invisible but accessible regions for screen reader announcements
   * 
   * @returns {void}
   */
  initializeLiveRegions() {
    try {
      // Only initialize if in browser environment
      if (typeof document === "undefined") {
        console.warn("AccessibilityAnnouncer: Document not available, skipping live region setup");
        return;
      }

      // Create container for all live regions
      const container = document.createElement("div");
      container.id = "accessibility-live-regions";
      container.setAttribute("aria-hidden", "true"); // Hide from layout but preserve for screen readers
      container.style.cssText = `
        position: absolute;
        left: -10000px;
        width: 1px;
        height: 1px;
        overflow: hidden;
        clip: rect(0, 0, 0, 0);
        white-space: nowrap;
      `;

      // Create polite live region (non-interrupting)
      this.liveRegions.polite = document.createElement("div");
      this.liveRegions.polite.id = "accessibility-announcer-polite";
      this.liveRegions.polite.setAttribute("aria-live", "polite");
      this.liveRegions.polite.setAttribute("aria-atomic", "true");
      this.liveRegions.polite.setAttribute("role", "status");
      container.appendChild(this.liveRegions.polite);

      // Create assertive live region (interrupting)
      this.liveRegions.assertive = document.createElement("div");
      this.liveRegions.assertive.id = "accessibility-announcer-assertive";
      this.liveRegions.assertive.setAttribute("aria-live", "assertive");
      this.liveRegions.assertive.setAttribute("aria-atomic", "true");
      this.liveRegions.assertive.setAttribute("role", "alert");
      container.appendChild(this.liveRegions.assertive);

      // Create status live region (for status updates)
      this.liveRegions.status = document.createElement("div");
      this.liveRegions.status.id = "accessibility-announcer-status";
      this.liveRegions.status.setAttribute("aria-live", "polite");
      this.liveRegions.status.setAttribute("aria-atomic", "true");
      this.liveRegions.status.setAttribute("role", "status");
      container.appendChild(this.liveRegions.status);

      // Add container to document
      document.body.appendChild(container);

      console.log("ARIA live regions created successfully");
    } catch (error) {
      console.error("Error initializing live regions:", error);
    }
  }

  /**
   * Announce message to screen readers with specified priority
   * 
   * @param {string} message - Message to announce
   * @param {Object} options - Announcement options
   * @param {string} options.priority - 'polite', 'assertive', or 'status' (default: 'polite')
   * @param {boolean} options.immediate - Skip queue and announce immediately (default: false)
   * @param {string} options.category - Category for duplicate filtering (default: 'general')
   * @returns {boolean} True if announcement was queued/announced, false otherwise
   */
  announce(message, options = {}) {
    try {
      // Validate message
      if (!message || typeof message !== "string") {
        console.warn("AccessibilityAnnouncer: Invalid message provided");
        return false;
      }

      // Sanitize message for XSS protection
      const sanitizedMessage = this.sanitizeMessage(message);
      if (!sanitizedMessage) {
        console.warn("AccessibilityAnnouncer: Message failed sanitization");
        return false;
      }

      // Extract options with defaults
      const {
        priority = "polite",
        immediate = false,
        category = "general"
      } = options;

      // Validate priority
      if (!this.liveRegions[priority]) {
        console.warn(`AccessibilityAnnouncer: Invalid priority '${priority}', using 'polite'`);
        return this.announce(sanitizedMessage, { ...options, priority: "polite" });
      }

      // Create announcement object
      const announcement = {
        message: sanitizedMessage,
        priority,
        category,
        timestamp: Date.now(),
        id: this.generateAnnouncementId()
      };

      // Handle immediate announcements
      if (immediate) {
        return this.performAnnouncement(announcement);
      }

      // Filter duplicates
      if (this.isDuplicateAnnouncement(announcement)) {
        this.duplicatesFiltered++;
        console.log(`Filtered duplicate announcement: "${sanitizedMessage}"`);
        return false;
      }

      // Add to queue
      return this.queueAnnouncement(announcement);

    } catch (error) {
      console.error("Error in announce method:", error);
      return false;
    }
  }

  /**
   * Announce theme change specifically - T044 primary use case
   * Provides contextual information about the theme switch
   * 
   * @param {string} newTheme - The new theme ('light' or 'dark')
   * @param {string} previousTheme - The previous theme
   * @param {string} source - Source of the change ('user', 'system', etc.)
   * @returns {boolean} True if announcement was successful
   */
  announceThemeChange(newTheme, previousTheme, source = "user") {
    try {
      // Validate themes
      if (!newTheme || !["light", "dark"].includes(newTheme)) {
        console.warn("Invalid theme for announcement:", newTheme);
        return false;
      }

      // Build contextual message
      let message = `Theme changed to ${newTheme} mode`;
      
      // Add context based on source
      if (source === "system") {
        message += " automatically based on system preferences";
      } else if (source === "user") {
        message += " by user selection";
      }

      // Add accessibility benefits information
      if (newTheme === "dark") {
        message += ". Dark mode may reduce eye strain in low-light environments";
      } else {
        message += ". Light mode provides high contrast for better readability";
      }

      // Announce with high priority for immediate feedback
      return this.announce(message, {
        priority: "assertive",
        category: "theme-change",
        immediate: false // Allow queuing for better UX
      });

    } catch (error) {
      console.error("Error announcing theme change:", error);
      return false;
    }
  }

  /**
   * Announce accessibility compliance status - T044 enhancement
   * Informs users about WCAG compliance when theme changes
   * 
   * @param {Object} accessibilityReport - Report from WCAG validator
   * @param {string} theme - Current theme
   * @returns {boolean} True if announcement was successful
   */
  announceAccessibilityStatus(accessibilityReport, theme) {
    try {
      if (!accessibilityReport || !accessibilityReport.summary) {
        return false;
      }

      const { summary } = accessibilityReport;
      let message = "";

      if (summary.criticalFailures === 0) {
        message = `${theme} theme meets WCAG accessibility standards with ${summary.passRate}% compliance`;
      } else {
        message = `${theme} theme has ${summary.criticalFailures} accessibility issues. Some content may not meet WCAG standards`;
      }

      return this.announce(message, {
        priority: "polite",
        category: "accessibility-status"
      });

    } catch (error) {
      console.error("Error announcing accessibility status:", error);
      return false;
    }
  }

  /**
   * Sanitize message to prevent XSS and ensure safe announcement
   * 
   * @param {string} message - Message to sanitize
   * @returns {string|null} Sanitized message or null if unsafe
   */
  sanitizeMessage(message) {
    try {
      // Basic XSS prevention
      const sanitized = message
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "") // Remove script tags
        .replace(/<[^>]*>/g, "") // Remove all HTML tags
        .replace(/[<>&"']/g, (char) => { // Escape remaining dangerous characters
          const escapeMap = {
            "<": "&lt;",
            ">": "&gt;",
            "&": "&amp;",
            "\"": "&quot;",
            "'": "&#x27;"
          };
          return escapeMap[char] || char;
        })
        .trim();

      // Length validation
      if (sanitized.length === 0 || sanitized.length > 500) {
        console.warn("Message length invalid:", sanitized.length);
        return null;
      }

      return sanitized;
    } catch (error) {
      console.error("Error sanitizing message:", error);
      return null;
    }
  }

  /**
   * Check if announcement is a duplicate to prevent spam
   * 
   * @param {Object} announcement - Announcement to check
   * @returns {boolean} True if this is a duplicate announcement
   */
  isDuplicateAnnouncement(announcement) {
    try {
      // Check against last announcement
      if (this.lastAnnouncement &&
          this.lastAnnouncement.message === announcement.message &&
          this.lastAnnouncement.category === announcement.category &&
          (announcement.timestamp - this.lastAnnouncement.timestamp) < this.debounceDelay) {
        return true;
      }

      // Check against queued announcements
      return this.announcementQueue.some(queued => 
        queued.message === announcement.message && 
        queued.category === announcement.category
      );
    } catch (error) {
      console.error("Error checking duplicate announcement:", error);
      return false; // Assume not duplicate on error
    }
  }

  /**
   * Add announcement to queue for processing
   * 
   * @param {Object} announcement - Announcement object
   * @returns {boolean} True if queued successfully
   */
  queueAnnouncement(announcement) {
    try {
      // Check queue size limit
      if (this.announcementQueue.length >= this.maxQueueSize) {
        // Remove oldest announcement to make room
        const dropped = this.announcementQueue.shift();
        this.queueDropped++;
        console.warn("Announcement queue full, dropped:", dropped.message);
      }

      // Add to queue
      this.announcementQueue.push(announcement);
      console.log(`Queued announcement: "${announcement.message}" (queue size: ${this.announcementQueue.length})`);

      // Process queue if not currently announcing
      if (!this.isAnnouncing) {
        this.processAnnouncementQueue();
      }

      return true;
    } catch (error) {
      console.error("Error queuing announcement:", error);
      return false;
    }
  }

  /**
   * Process the announcement queue sequentially
   * 
   * @returns {void}
   */
  processAnnouncementQueue() {
    try {
      if (this.isAnnouncing || this.announcementQueue.length === 0) {
        return;
      }

      this.isAnnouncing = true;
      const announcement = this.announcementQueue.shift();

      // Perform the announcement
      this.performAnnouncement(announcement);

      // Schedule next announcement processing
      setTimeout(() => {
        this.isAnnouncing = false;
        this.processAnnouncementQueue();
      }, this.debounceDelay);

    } catch (error) {
      console.error("Error processing announcement queue:", error);
      this.isAnnouncing = false;
    }
  }

  /**
   * Perform the actual announcement to screen readers
   * 
   * @param {Object} announcement - Announcement object
   * @returns {boolean} True if announcement was performed
   */
  performAnnouncement(announcement) {
    try {
      const liveRegion = this.liveRegions[announcement.priority];
      if (!liveRegion) {
        console.error("Live region not found for priority:", announcement.priority);
        return false;
      }

      // Clear existing content
      liveRegion.textContent = "";

      // Small delay to ensure screen readers detect the change
      setTimeout(() => {
        liveRegion.textContent = announcement.message;
        
        // Store as last announcement
        this.lastAnnouncement = announcement;
        this.announcementCount++;
        
        console.log(`📢 Announced (${announcement.priority}): "${announcement.message}"`);

        // Clear the announcement after delay to prevent re-reading
        setTimeout(() => {
          if (liveRegion.textContent === announcement.message) {
            liveRegion.textContent = "";
          }
        }, this.clearDelay);
      }, 50);

      return true;
    } catch (error) {
      console.error("Error performing announcement:", error);
      return false;
    }
  }

  /**
   * Generate unique announcement ID for tracking
   * 
   * @returns {string} Unique announcement identifier
   */
  generateAnnouncementId() {
    return `announcement-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get announcement statistics for monitoring
   * 
   * @returns {Object} Statistics object
   */
  getStats() {
    return {
      totalAnnouncements: this.announcementCount,
      queueSize: this.announcementQueue.length,
      duplicatesFiltered: this.duplicatesFiltered,
      queueDropped: this.queueDropped,
      isCurrentlyAnnouncing: this.isAnnouncing,
      lastAnnouncement: this.lastAnnouncement ? {
        message: this.lastAnnouncement.message,
        timestamp: this.lastAnnouncement.timestamp,
        category: this.lastAnnouncement.category
      } : null
    };
  }

  /**
   * Clear announcement queue and reset state
   * 
   * @returns {void}
   */
  clearQueue() {
    try {
      const queueSize = this.announcementQueue.length;
      this.announcementQueue = [];
      this.isAnnouncing = false;
      
      if (this.announcementTimeout) {
        clearTimeout(this.announcementTimeout);
        this.announcementTimeout = null;
      }
      
      console.log(`Cleared announcement queue (${queueSize} items removed)`);
    } catch (error) {
      console.error("Error clearing queue:", error);
    }
  }

  /**
   * Register cleanup handlers for page unload
   * 
   * @returns {void}
   */
  registerCleanup() {
    try {
      if (typeof window !== "undefined") {
        window.addEventListener("beforeunload", () => {
          this.destroy();
        });
      }
    } catch (error) {
      console.error("Error registering cleanup:", error);
    }
  }

  /**
   * Clean up resources and remove DOM elements
   * 
   * @returns {void}
   */
  destroy() {
    try {
      // Clear queue and timeouts
      this.clearQueue();
      
      // Remove live regions from DOM
      const container = document.getElementById("accessibility-live-regions");
      if (container) {
        container.remove();
      }
      
      // Clear references
      this.liveRegions = {};
      this.lastAnnouncement = null;
      
      console.log("AccessibilityAnnouncer destroyed and cleaned up");
    } catch (error) {
      console.error("Error destroying AccessibilityAnnouncer:", error);
    }
  }
}

// Create and export singleton instance
export const accessibilityAnnouncer = new AccessibilityAnnouncer();

// Export class for custom instances if needed
export default AccessibilityAnnouncer;