// Import security utilities for safe theme handling - T029
import '../utils/security.js';

// Import WCAG contrast validation utilities - T043
import { validateColorCombination, generateAccessibilityReport } from '../utils/wcag-contrast-validator.js';

// Constants for theme management
const THEME_KEY = 'hextrackr-theme';
const THEME_VALUES = ['light', 'dark', 'system'];
const DEFAULT_THEME = 'system';

/**
 * ThemeController class for managing dark/light theme switching in HexTrackr.
 * Handles system preference detection, theme persistence, and event listening.
 * 
 * @class
 */
export class ThemeController {
  /**
   * Constructor for ThemeController.
   * Initializes the controller with default state.
   * 
   * @constructor
   */
  constructor() {
    // Initialize storage with private browsing mode detection
    try {
      // Test localStorage availability and quota
      localStorage.setItem('__theme_test__', '1');
      localStorage.removeItem('__theme_test__');
      this.storage = localStorage;
      this.storageType = 'localStorage';
    } catch (e) {
      if (e.name === 'QuotaExceededError') {
        console.warn('localStorage quota exceeded, using sessionStorage fallback');
      } else {
        console.warn('localStorage unavailable (private browsing?), using sessionStorage fallback');
      }
      this.storage = sessionStorage;
      this.storageType = 'sessionStorage';
    }
    
    // T020-T022: Initialize storage, listeners, and system preference monitoring
    this.listeners = []; // Array for storing theme change callbacks
    
    // T036: Debounce mechanism for performance - prevent rapid theme switching
    this.debounceTimeout = null;
    this.pendingTheme = null;
    this.pendingSource = null;
    this.DEBOUNCE_DELAY = 300; // 300ms debounce delay
    
    // T038: Event listener cleanup references
    this.systemMediaQuery = null;
    this.systemChangeHandler = null;
    this.cleanupHandlers = []; // Array for storing cleanup functions
    
    // T039: Browser compatibility detection for CSS custom properties
    this.cssCustomPropertiesSupported = this.detectCSSCustomProperties();
    this.legacyFallbackActive = false;
    
    // T040: Storage quota monitoring and recovery
    this.storageQuotaExceeded = false;
    this.storageRecoveryAttempts = 0;
    this.maxRecoveryAttempts = 3;
    this.storageHealthStatus = 'healthy'; // 'healthy', 'degraded', 'critical', 'failed'
    this.lastStorageError = null;
    this.storageMetrics = {
      totalWrites: 0,
      successfulWrites: 0,
      failedWrites: 0,
      quotaExceededCount: 0,
      lastQuotaExceeded: null
    };
    
    // Initialize storage health check
    this.checkStorageHealth();
    
    // T041: Cross-tab synchronization setup
    this.crossTabSyncEnabled = true;
    this.storageEventListener = null;
    this.tabId = this.generateTabId();
    this.syncMetrics = {
      eventsReceived: 0,
      eventsProcessed: 0,
      syncConflicts: 0,
      lastSyncTime: null
    };
    
    // Initialize cross-tab synchronization
    this.initCrossTabSync();
    
    // Initialize system preference change listener
    this.initSystemListener();
  }

  /**
   * Check storage health and quota availability - T040
   * Performs comprehensive storage testing and establishes baseline metrics
   * 
   * @returns {Object} Storage health report
   */
  checkStorageHealth() {
    try {
      const healthReport = {
        available: false,
        type: this.storageType,
        quotaAvailable: false,
        estimatedQuota: null,
        usedBytes: null,
        availableBytes: null,
        canWrite: false,
        testResults: []
      };

      // Test basic storage availability
      try {
        const testKey = '__hextrackr_storage_test__';
        const testValue = 'health_check';
        
        this.storage.setItem(testKey, testValue);
        const retrievedValue = this.storage.getItem(testKey);
        this.storage.removeItem(testKey);
        
        if (retrievedValue === testValue) {
          healthReport.available = true;
          healthReport.canWrite = true;
          healthReport.testResults.push('Basic read/write: PASS');
        }
      } catch (basicError) {
        healthReport.testResults.push(`Basic read/write: FAIL - ${basicError.message}`);
        this.updateStorageHealthStatus('critical');
        return healthReport;
      }

      // Test quota estimation (StorageManager API)
      if ('storage' in navigator && 'estimate' in navigator.storage) {
        navigator.storage.estimate().then(estimate => {
          healthReport.quotaAvailable = true;
          healthReport.estimatedQuota = estimate.quota;
          healthReport.usedBytes = estimate.usage;
          healthReport.availableBytes = estimate.quota - estimate.usage;
          
          // Update storage health based on quota usage
          const usagePercentage = (estimate.usage / estimate.quota) * 100;
          if (usagePercentage > 90) {
            this.updateStorageHealthStatus('critical');
          } else if (usagePercentage > 75) {
            this.updateStorageHealthStatus('degraded');
          }
          
          console.log('Storage quota:', {
            quota: Math.round(estimate.quota / 1024 / 1024) + ' MB',
            used: Math.round(estimate.usage / 1024 / 1024) + ' MB',
            available: Math.round((estimate.quota - estimate.usage) / 1024 / 1024) + ' MB',
            usagePercentage: Math.round(usagePercentage) + '%'
          });
        }).catch(quotaError => {
          console.warn('Could not estimate storage quota:', quotaError);
          healthReport.testResults.push(`Quota estimation: FAIL - ${quotaError.message}`);
        });
      }

      // Test quota exceeded handling
      try {
        const largeTestKey = '__hextrackr_quota_test__';
        const largeTestValue = 'x'.repeat(1024); // 1KB test
        
        this.storage.setItem(largeTestKey, largeTestValue);
        this.storage.removeItem(largeTestKey);
        healthReport.testResults.push('Quota handling: PASS');
      } catch (quotaError) {
        if (quotaError.name === 'QuotaExceededError') {
          this.storageQuotaExceeded = true;
          this.updateStorageHealthStatus('critical');
          healthReport.testResults.push('Quota handling: QUOTA_EXCEEDED');
        } else {
          healthReport.testResults.push(`Quota handling: FAIL - ${quotaError.message}`);
        }
      }

      console.log('Storage health check completed:', healthReport);
      return healthReport;
    } catch (error) {
      console.error('Storage health check failed:', error);
      this.updateStorageHealthStatus('failed');
      return { available: false, error: error.message };
    }
  }

  /**
   * Update storage health status with logging - T040
   * 
   * @param {string} status - New health status
   * @returns {void}
   */
  updateStorageHealthStatus(status) {
    const previousStatus = this.storageHealthStatus;
    this.storageHealthStatus = status;
    
    if (previousStatus !== status) {
      console.log(`Storage health status changed: ${previousStatus} → ${status}`);
      
      // Notify listeners of storage health changes
      this.notifyListeners('storage-health-changed', {
        previousStatus,
        currentStatus: status,
        timestamp: Date.now()
      });
    }
  }

  /**
   * Generate unique tab identifier for cross-tab synchronization - T041
   * 
   * @returns {string} Unique tab identifier
   */
  generateTabId() {
    return `hextrackr-tab-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Initialize cross-tab synchronization via storage events - T041
   * Listens for theme changes in other tabs and synchronizes automatically
   * 
   * @returns {void}
   */
  initCrossTabSync() {
    try {
      if (typeof window === 'undefined') {
        console.log('Cross-tab sync not available in non-browser environment');
        return;
      }

      // Create storage event listener for cross-tab communication
      this.storageEventListener = (event) => {
        this.handleStorageEvent(event);
      };

      // Listen for storage events (fired when localStorage changes in other tabs)
      window.addEventListener('storage', this.storageEventListener);

      // Register cleanup handler for storage event listener
      this.registerCleanupHandler(() => {
        if (this.storageEventListener) {
          window.removeEventListener('storage', this.storageEventListener);
          this.storageEventListener = null;
        }
      });

      console.log(`Cross-tab synchronization initialized for tab: ${this.tabId}`);
    } catch (error) {
      console.error('Failed to initialize cross-tab synchronization:', error);
      this.crossTabSyncEnabled = false;
    }
  }

  /**
   * Handle storage events from other tabs - T041
   * Processes theme changes and synchronizes the current tab
   * 
   * @param {StorageEvent} event - Storage event from another tab
   * @returns {void}
   */
  handleStorageEvent(event) {
    try {
      // Only process events for our theme storage key
      if (event.key !== THEME_KEY) {
        return;
      }

      this.syncMetrics.eventsReceived++;

      // Ignore events if cross-tab sync is disabled
      if (!this.crossTabSyncEnabled) {
        return;
      }

      // Validate event data
      if (!event.newValue) {
        console.log('Theme cleared in another tab - applying system preference');
        const systemTheme = this.detectSystemPreference() || DEFAULT_THEME;
        this.applyCrossTabTheme(systemTheme, 'cross-tab-clear');
        return;
      }

      // Parse the new theme data
      let themeData;
      try {
        themeData = JSON.parse(event.newValue);
      } catch (parseError) {
        // Handle legacy simple string format
        const legacyTheme = this.validateTheme(event.newValue);
        if (legacyTheme) {
          this.applyCrossTabTheme(legacyTheme, 'cross-tab-legacy');
        }
        return;
      }

      // Validate theme data structure
      if (!themeData || typeof themeData !== 'object' || !themeData.theme) {
        console.warn('Invalid cross-tab theme data received');
        return;
      }

      // Validate the theme value
      const newTheme = this.validateTheme(themeData.theme);
      if (!newTheme) {
        console.warn('Invalid theme value in cross-tab sync:', themeData.theme);
        return;
      }

      // Check for sync conflicts (rapid changes)
      const now = Date.now();
      if (this.syncMetrics.lastSyncTime && (now - this.syncMetrics.lastSyncTime) < 100) {
        this.syncMetrics.syncConflicts++;
        console.log('Cross-tab sync conflict detected - debouncing');
        
        // Use debouncing to handle rapid changes
        if (this.crossTabDebounceTimeout) {
          clearTimeout(this.crossTabDebounceTimeout);
        }
        
        this.crossTabDebounceTimeout = setTimeout(() => {
          this.applyCrossTabTheme(newTheme, 'cross-tab-debounced');
        }, 150);
        
        return;
      }

      // Apply the theme change from another tab
      this.applyCrossTabTheme(newTheme, 'cross-tab');
      
    } catch (error) {
      console.error('Error handling cross-tab storage event:', error);
    }
  }

  /**
   * Apply theme change from cross-tab synchronization - T041
   * Updates current tab without triggering another storage event
   * 
   * @param {string} theme - Theme to apply
   * @param {string} source - Source identifier for the change
   * @returns {void}
   */
  applyCrossTabTheme(theme, source) {
    try {
      // Validate theme
      const validatedTheme = this.validateTheme(theme);
      if (!validatedTheme) {
        console.warn(`Invalid cross-tab theme '${theme}', ignoring`);
        return;
      }

      // Apply theme to DOM without updating storage (to avoid event loop)
      this.applyTheme(validatedTheme);
      
      // Notify listeners of the cross-tab change
      this.notifyListeners(validatedTheme, source);
      
      // Update sync metrics
      this.syncMetrics.eventsProcessed++;
      this.syncMetrics.lastSyncTime = Date.now();
      
      console.log(`Cross-tab theme sync applied: ${validatedTheme} (source: ${source})`);
    } catch (error) {
      console.error('Error applying cross-tab theme:', error);
    }
  }

  /**
   * Enable or disable cross-tab synchronization - T041
   * 
   * @param {boolean} enabled - Whether to enable cross-tab sync
   * @returns {void}
   */
  setCrossTabSyncEnabled(enabled) {
    try {
      const wasEnabled = this.crossTabSyncEnabled;
      this.crossTabSyncEnabled = !!enabled;
      
      if (wasEnabled !== this.crossTabSyncEnabled) {
        console.log(`Cross-tab synchronization ${this.crossTabSyncEnabled ? 'enabled' : 'disabled'}`);
        
        // Notify listeners of sync status change
        this.notifyListeners('cross-tab-sync-changed', {
          enabled: this.crossTabSyncEnabled,
          tabId: this.tabId,
          timestamp: Date.now()
        });
      }
    } catch (error) {
      console.error('Error setting cross-tab sync status:', error);
    }
  }

  /**
   * Get cross-tab synchronization status and metrics - T041
   * 
   * @returns {Object} Cross-tab sync information
   */
  getCrossTabSyncStatus() {
    return {
      enabled: this.crossTabSyncEnabled,
      tabId: this.tabId,
      metrics: { ...this.syncMetrics },
      listenerActive: !!this.storageEventListener,
      supportedBrowser: typeof window !== 'undefined' && 'addEventListener' in window
    };
  }

  /**
   * Detect if browser supports CSS custom properties (CSS variables) - T039
   * Used to determine if fallback mechanisms are needed for legacy browsers
   * 
   * @returns {boolean} True if CSS custom properties are supported
   */
  detectCSSCustomProperties() {
    try {
      // Check if we're in a browser environment
      if (typeof window === 'undefined' || !window.CSS) {
        console.warn('CSS API not available, assuming CSS custom properties not supported');
        return false;
      }

      // Modern CSS.supports() method (most reliable)
      if (window.CSS.supports) {
        const supported = window.CSS.supports('--test-var', 'red') || window.CSS.supports('(--test-var: red)');
        if (supported) {
          console.log('CSS custom properties supported via CSS.supports()');
          return true;
        }
      }

      // Fallback: Test by creating a test element
      const testElement = document.createElement('div');
      testElement.style.setProperty('--test-css-var', 'test-value');
      
      // Check if the custom property was set
      const testValue = getComputedStyle(testElement).getPropertyValue('--test-css-var');
      const isSupported = testValue === 'test-value';
      
      if (isSupported) {
        console.log('CSS custom properties supported via element test');
      } else {
        console.warn('CSS custom properties not supported - legacy fallback will be used');
      }
      
      return isSupported;
    } catch (error) {
      console.error('Error detecting CSS custom properties support:', error);
      // Fail safe - assume not supported if we can't detect
      return false;
    }
  }

  /**
   * Validate theme value against allowed themes - T029
   * Uses HexTrackr security patterns for input validation
   * 
   * @param {any} theme - Theme value to validate
   * @returns {string|null} Valid theme or null if invalid
   */
  validateTheme(theme) {
    try {
      // Ensure theme is a string
      if (typeof theme !== 'string') {
        console.warn('Theme must be a string, got:', typeof theme);
        return null;
      }

      // Sanitize input using HexTrackr security pattern
      const sanitizedTheme = window.escapeHtml ? window.escapeHtml(theme) : theme;
      
      // Check against whitelist of allowed values
      if (!THEME_VALUES.includes(sanitizedTheme)) {
        console.warn(`Invalid theme value '${sanitizedTheme}'. Allowed values:`, THEME_VALUES);
        return null;
      }

      return sanitizedTheme;
    } catch (error) {
      console.error('Error validating theme:', error);
      return null;
    }
  }

  /**
   * Sanitize theme value for safe storage - T029
   * 
   * @param {string} theme - Theme value to sanitize
   * @returns {string} Sanitized theme value
   */
  sanitizeThemeForStorage(theme) {
    try {
      // Validate first
      const validTheme = this.validateTheme(theme);
      if (!validTheme) {
        return DEFAULT_THEME;
      }

      // Additional sanitization for storage keys and values
      const sanitized = validTheme.replace(/[^a-z]/g, ''); // Only lowercase letters
      
      return THEME_VALUES.includes(sanitized) ? sanitized : DEFAULT_THEME;
    } catch (error) {
      console.error('Error sanitizing theme for storage:', error);
      return DEFAULT_THEME;
    }
  }

  /**
   * Validate theme source to prevent injection attacks - T029
   * 
   * @param {any} source - Source identifier to validate
   * @returns {string} Sanitized source or 'unknown'
   */
  validateThemeSource(source) {
    try {
      if (typeof source !== 'string') {
        return 'unknown';
      }

      // Whitelist of allowed source values
      const allowedSources = ['user', 'system', 'initial', 'storage', 'fallback'];
      const sanitizedSource = window.escapeHtml ? window.escapeHtml(source) : source;
      
      return allowedSources.includes(sanitizedSource) ? sanitizedSource : 'unknown';
    } catch (error) {
      console.error('Error validating theme source:', error);
      return 'unknown';
    }
  }

  /**
   * Retrieves the current theme.
   * 
   * @returns {string} The current theme ('light' | 'dark' | null if not set)
   */
  getTheme() {
    try {
      // T040: Check memory storage first if storage failed
      let storedData = null;
      
      if (this.memoryStorage && this.memoryStorage.has(THEME_KEY)) {
        storedData = this.memoryStorage.get(THEME_KEY);
      } else {
        // T020: Retrieve theme from storage with validation - T031 enhanced input sanitization
        storedData = this.storage.getItem(THEME_KEY);
      }
      
      if (!storedData) {
        // No stored theme, fallback to system preference
        return this.detectSystemPreference() || DEFAULT_THEME;
      }

      // T031: Safely parse and validate stored theme data
      let themeData;
      try {
        themeData = JSON.parse(storedData);
      } catch (parseError) {
        // If JSON parsing fails, treat as legacy simple string
        const legacyTheme = this.validateTheme(storedData);
        return legacyTheme || this.detectSystemPreference() || DEFAULT_THEME;
      }

      // T031: Validate the parsed theme data structure
      if (!themeData || typeof themeData !== 'object') {
        console.warn('Invalid theme data structure, using fallback');
        return this.detectSystemPreference() || DEFAULT_THEME;
      }

      // T031: Sanitize and validate the theme value from storage
      const storedTheme = themeData.theme;
      const sanitizedTheme = this.validateTheme(storedTheme);
      
      if (sanitizedTheme && ['light', 'dark', 'system'].includes(sanitizedTheme)) {
        return sanitizedTheme;
      }

      // Invalid stored theme, fallback to system preference
      console.warn(`Invalid stored theme '${storedTheme}', using fallback`);
      return this.detectSystemPreference() || DEFAULT_THEME;
    } catch (error) {
      console.error('Error retrieving theme:', error);
      // T031: Secure fallback on any error
      return this.detectSystemPreference() || DEFAULT_THEME;
    }
  }

  /**
   * Sets the theme with debouncing to prevent performance issues - T036
   * 
   * @param {string} theme - The theme to set ('light' | 'dark')
   * @param {string} source - The source of the change ('user' | 'system' | 'initial')
   * @param {boolean} immediate - If true, bypass debouncing for immediate application
   * @returns {boolean} True if set successfully, false otherwise
   */
  setTheme(theme, source, immediate = false) {
    try {
      // T036: For system changes and initial loads, apply immediately
      if (immediate || source === 'system' || source === 'initial') {
        return this.setThemeImmediate(theme, source);
      }

      // T036: Debounce user-initiated theme changes
      return this.setThemeDebounced(theme, source);
    } catch (error) {
      console.error('Error in setTheme:', error);
      return false;
    }
  }

  /**
   * Sets the theme immediately without debouncing - T036
   * 
   * @param {string} theme - The theme to set ('light' | 'dark')
   * @param {string} source - The source of the change ('user' | 'system' | 'initial')
   * @returns {boolean} True if set successfully, false otherwise
   */
  setThemeImmediate(theme, source) {
    try {
      // T029: Use secure validation methods for theme and source
      const validatedTheme = this.validateTheme(theme);
      const validatedSource = this.validateThemeSource(source);
      
      if (!validatedTheme) {
        console.warn(`Invalid theme '${theme}', using default theme`);
        return false;
      }
      
      // Only allow 'light' and 'dark' for setTheme (not 'system')
      if (!['light', 'dark'].includes(validatedTheme)) {
        console.warn(`setTheme only accepts 'light' or 'dark', got '${validatedTheme}'`);
        return false;
      }
      // T020: Store theme preference with proper key and validation - T029 security enhanced
      const sanitizedTheme = this.sanitizeThemeForStorage(validatedTheme);
      const themeData = JSON.stringify({
        theme: sanitizedTheme,
        timestamp: Date.now(),
        source: validatedSource,
        version: '1.0.0'
      });
      
      // T040: Enhanced storage with quota handling and recovery
      const storageSuccess = this.attemptStorageWrite(THEME_KEY, themeData);
      if (!storageSuccess) {
        console.warn('Theme preference could not be saved after recovery attempts');
        // Continue execution - storage failure shouldn't prevent theme application
      }
      
      // T021: Apply theme to document and notify listeners - T029 using sanitized values
      this.applyTheme(sanitizedTheme);
      this.notifyListeners(sanitizedTheme, validatedSource);
      return true;
    } catch (error) {
      console.error('Error setting theme:', error);
      return false; // Graceful failure
    }
  }

  /**
   * Sets the theme with debouncing for performance - T036
   * Prevents rapid theme switches from causing performance issues
   * 
   * @param {string} theme - The theme to set ('light' | 'dark')
   * @param {string} source - The source of the change ('user' | 'system' | 'initial')
   * @returns {boolean} True if queued successfully, false otherwise
   */
  setThemeDebounced(theme, source) {
    try {
      // T036: Clear any existing debounce timeout
      if (this.debounceTimeout) {
        clearTimeout(this.debounceTimeout);
        this.debounceTimeout = null;
      }

      // T036: Store pending theme change
      this.pendingTheme = theme;
      this.pendingSource = source;

      // T036: Set new debounce timeout
      this.debounceTimeout = setTimeout(() => {
        try {
          // Apply the pending theme change
          const success = this.setThemeImmediate(this.pendingTheme, this.pendingSource);
          
          // Clear debounce state
          this.debounceTimeout = null;
          this.pendingTheme = null;
          this.pendingSource = null;

          if (!success) {
            console.warn('Debounced theme application failed');
          }
        } catch (error) {
          console.error('Error in debounced theme application:', error);
        }
      }, this.DEBOUNCE_DELAY);

      return true; // Successfully queued
    } catch (error) {
      console.error('Error setting debounced theme:', error);
      return false;
    }
  }

  /**
   * Forces immediate application of any pending debounced theme - T036
   * Useful for cleanup or when immediate theme change is required
   * 
   * @returns {boolean} True if flush was successful, false otherwise
   */
  flushPendingTheme() {
    try {
      if (this.debounceTimeout && this.pendingTheme) {
        // Clear the timeout
        clearTimeout(this.debounceTimeout);
        this.debounceTimeout = null;

        // Apply pending theme immediately
        const success = this.setThemeImmediate(this.pendingTheme, this.pendingSource);
        
        // Clear pending state
        this.pendingTheme = null;
        this.pendingSource = null;

        return success;
      }
      return true; // No pending theme to flush
    } catch (error) {
      console.error('Error flushing pending theme:', error);
      return false;
    }
  }

  /**
   * Detects the user's system theme preference.
   * 
   * @returns {string|null} 'dark' if prefers dark, 'light' if prefers light, null on error
   */
  detectSystemPreference() {
    try {
      // T021: System preference detection using media queries
      if (typeof window === 'undefined' || !window.matchMedia) {
        return 'light'; // Default for non-browser environments
      }
      
      const darkModeQuery = window.matchMedia('(prefers-color-scheme: dark)');
      return darkModeQuery.matches ? 'dark' : 'light';
    } catch (error) {
      console.error('Error detecting system preference:', error);
      return 'light'; // Safe default
    }
  }

  /**
   * Adds a callback listener for theme changes.
   * 
   * @param {Function} callback - The function to call on theme change (receives new theme and source)
   * @returns {void}
   */
  addThemeChangeListener(callback) {
    try {
      if (typeof callback !== 'function') {
        throw new Error('Callback must be a function');
      }
      // T022: Add callback to listeners array and handle removal if needed
      this.listeners.push(callback);
    } catch (error) {
      console.error('Error adding theme listener:', error);
    }
  }

  /**
   * Removes a specific callback listener for theme changes - T038
   * 
   * @param {Function} callback - The function to remove from listeners
   * @returns {boolean} True if removed successfully, false if not found
   */
  removeThemeChangeListener(callback) {
    try {
      if (typeof callback !== 'function') {
        console.warn('Callback must be a function');
        return false;
      }
      
      const index = this.listeners.indexOf(callback);
      if (index > -1) {
        this.listeners.splice(index, 1);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error removing theme listener:', error);
      return false;
    }
  }

  /**
   * Apply theme to document element and update DOM.
   * T021: Document class updates and theme attribute management
   * T039: Enhanced with CSS custom properties fallback
   * 
   * @param {string} theme - The theme to apply ('light' | 'dark')
   * @returns {void}
   */
  applyTheme(theme) {
    try {
      if (typeof document !== 'undefined' && document.documentElement) {
        // T030: Validate and sanitize theme before DOM manipulation
        const safeTheme = this.validateTheme(theme);
        if (!safeTheme || !['light', 'dark'].includes(safeTheme)) {
          console.warn(`Unsafe theme value '${theme}', applying default theme`);
          this.applyTheme(DEFAULT_THEME === 'system' ? 'light' : DEFAULT_THEME);
          return;
        }

        // T030: XSS-safe attribute setting using HexTrackr security patterns
        const sanitizedTheme = window.escapeHtml ? window.escapeHtml(safeTheme) : safeTheme;
        
        // Update Bootstrap 5.3+ data-bs-theme attribute for Tabler.io compatibility
        document.documentElement.setAttribute('data-bs-theme', sanitizedTheme);
        
        // T030: XSS-safe CSS class manipulation - validate class names
        const validClassNames = ['theme-light', 'theme-dark'];
        const newClassName = `theme-${sanitizedTheme}`;
        
        // Only apply if the generated class name is in our whitelist
        if (validClassNames.includes(newClassName)) {
          document.documentElement.classList.remove('theme-light', 'theme-dark');
          document.documentElement.classList.add(newClassName);
        } else {
          console.warn(`Invalid theme class name '${newClassName}', skipping class update`);
        }

        // T039: Apply legacy fallback for browsers without CSS custom properties
        if (!this.cssCustomPropertiesSupported) {
          this.applyLegacyTheme(sanitizedTheme);
        }
      }
    } catch (error) {
      console.error('Error applying theme to document:', error);
      // T030: Fallback to safe default on error
      try {
        if (document && document.documentElement) {
          document.documentElement.setAttribute('data-bs-theme', 'light');
          document.documentElement.classList.remove('theme-light', 'theme-dark');
          document.documentElement.classList.add('theme-light');
        }
      } catch (fallbackError) {
        console.error('Error applying fallback theme:', fallbackError);
      }
    }
  }

  /**
   * Apply legacy theme for browsers without CSS custom properties - T039
   * Directly sets CSS properties on elements that would normally use CSS variables
   * 
   * @param {string} theme - The theme to apply ('light' | 'dark')
   * @returns {void}
   */
  applyLegacyTheme(theme) {
    try {
      if (!this.legacyFallbackActive) {
        console.log('Activating legacy theme fallback for CSS custom properties');
        this.legacyFallbackActive = true;
      }

      // Define legacy theme values (from dark-theme.css)
      const legacyThemes = {
        light: {
          '--bs-body-bg': '#ffffff',
          '--bs-body-color': '#212529',
          '--bs-card-bg': '#ffffff',
          '--bs-border-color': '#dee2e6',
          '--bs-navbar-bg': '#ffffff',
          '--bs-btn-bg': '#ffffff',
          '--bs-form-control-bg': '#ffffff',
          '--bs-primary': '#0d6efd',
          '--bs-success': '#198754',
          '--bs-warning': '#ffc107',
          '--bs-danger': '#dc3545'
        },
        dark: {
          '--bs-body-bg': '#0f172a',
          '--bs-body-color': '#e2e8f0',
          '--bs-card-bg': '#1e293b',
          '--bs-border-color': '#374151',
          '--bs-navbar-bg': '#0f172a',
          '--bs-btn-bg': '#334155',
          '--bs-form-control-bg': '#1e293b',
          '--bs-primary': '#3b82f6',
          '--bs-success': '#10b981',
          '--bs-warning': '#f59e0b',
          '--bs-danger': '#ef4444'
        }
      };

      const themeValues = legacyThemes[theme];
      if (!themeValues) {
        console.warn(`No legacy theme values defined for '${theme}'`);
        return;
      }

      // Apply theme values directly to document root
      const documentRoot = document.documentElement;
      Object.entries(themeValues).forEach(([property, value]) => {
        try {
          // Try to set as custom property first (in case browser partially supports it)
          documentRoot.style.setProperty(property, value);
          
          // Also apply to body for broader compatibility
          if (property === '--bs-body-bg') {
            document.body.style.backgroundColor = value;
          } else if (property === '--bs-body-color') {
            document.body.style.color = value;
          }
        } catch (propertyError) {
          console.warn(`Failed to set legacy property ${property}:`, propertyError);
        }
      });

      // Apply legacy styles to common elements
      this.applyLegacyElementStyles(theme);

    } catch (error) {
      console.error('Error applying legacy theme:', error);
    }
  }

  /**
   * Apply legacy styles to specific element types - T039
   * Targets common Bootstrap and HexTrackr components
   * 
   * @param {string} theme - The theme being applied
   * @returns {void}
   */
  applyLegacyElementStyles(theme) {
    try {
      const isDark = theme === 'dark';
      
      // Apply to cards
      const cards = document.querySelectorAll('.card');
      cards.forEach(card => {
        card.style.backgroundColor = isDark ? '#1e293b' : '#ffffff';
        card.style.borderColor = isDark ? '#374151' : '#dee2e6';
        card.style.color = isDark ? '#e2e8f0' : '#212529';
      });

      // Apply to form controls
      const formControls = document.querySelectorAll('.form-control, .form-select');
      formControls.forEach(control => {
        control.style.backgroundColor = isDark ? '#1e293b' : '#ffffff';
        control.style.borderColor = isDark ? '#475569' : '#ced4da';
        control.style.color = isDark ? '#e2e8f0' : '#212529';
      });

      // Apply to navigation
      const navbars = document.querySelectorAll('.navbar');
      navbars.forEach(navbar => {
        navbar.style.backgroundColor = isDark ? '#0f172a' : '#ffffff';
        navbar.style.color = isDark ? '#e2e8f0' : '#212529';
      });

    } catch (error) {
      console.error('Error applying legacy element styles:', error);
    }
  }

  /**
   * Notify all registered listeners of theme change.
   * T022: Theme state management and event propagation
   * 
   * @param {string} newTheme - The new theme that was applied
   * @param {string} source - The source of the change
   * @returns {void}
   */
  notifyListeners(newTheme, source) {
    try {
      this.listeners.forEach(callback => {
        try {
          callback(newTheme, source);
        } catch (callbackError) {
          console.error('Error in theme change callback:', callbackError);
        }
      });
    } catch (error) {
      console.error('Error notifying theme listeners:', error);
    }
  }

  /**
   * Initialize system preference change listener.
   * T021: System preference detection and automatic theme switching
   * T038: Enhanced with cleanup reference storage
   * T042: Comprehensive media query monitoring and preference detection
   * 
   * @returns {void}
   */
  initSystemListener() {
    try {
      if (typeof window === 'undefined' || !window.matchMedia) {
        console.log('System preference detection not available in this environment');
        return;
      }

      // T042: Initialize system preference tracking
      this.systemPreferences = {
        darkModeQuery: null,
        lightModeQuery: null,
        contrastQuery: null,
        reducedMotionQuery: null,
        currentPreference: null,
        lastChangeTime: null,
        changeCount: 0
      };

      // Primary dark mode preference detection
      this.systemMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      this.systemPreferences.darkModeQuery = this.systemMediaQuery;
      
      // Additional system preference queries for comprehensive monitoring
      this.systemPreferences.lightModeQuery = window.matchMedia('(prefers-color-scheme: light)');
      this.systemPreferences.contrastQuery = window.matchMedia('(prefers-contrast: high)');
      this.systemPreferences.reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

      // T042: Enhanced system change handler with comprehensive preference tracking
      this.systemChangeHandler = (e) => {
        this.handleSystemPreferenceChange(e);
      };

      // Set up listeners for all preference queries
      this.setupSystemPreferenceListeners();

      // Initialize current system preference
      this.systemPreferences.currentPreference = this.detectSystemPreference();
      
      console.log('System preference monitoring initialized:', {
        darkMode: this.systemPreferences.darkModeQuery.matches,
        lightMode: this.systemPreferences.lightModeQuery.matches,
        highContrast: this.systemPreferences.contrastQuery.matches,
        reducedMotion: this.systemPreferences.reducedMotionQuery.matches
      });

    } catch (error) {
      console.error('Error initializing system listener:', error);
    }
  }

  /**
   * Set up media query listeners for all system preferences - T042
   * 
   * @returns {void}
   */
  setupSystemPreferenceListeners() {
    try {
      const queries = [
        { query: this.systemPreferences.darkModeQuery, name: 'dark-mode' },
        { query: this.systemPreferences.lightModeQuery, name: 'light-mode' },
        { query: this.systemPreferences.contrastQuery, name: 'high-contrast' },
        { query: this.systemPreferences.reducedMotionQuery, name: 'reduced-motion' }
      ];

      queries.forEach(({ query, name }) => {
        if (query) {
          // Create specific handler for this query
          const handler = (e) => {
            console.log(`System ${name} preference changed:`, e.matches);
            this.systemChangeHandler(e);
          };

          // Add listener with browser compatibility
          if (query.addEventListener) {
            query.addEventListener('change', handler);
          } else if (query.addListener) {
            // Legacy browsers
            query.addListener(handler);
          }

          // Store handler for cleanup
          this.registerCleanupHandler(() => {
            try {
              if (query.removeEventListener) {
                query.removeEventListener('change', handler);
              } else if (query.removeListener) {
                query.removeListener(handler);
              }
            } catch (cleanupError) {
              console.warn(`Error cleaning up ${name} listener:`, cleanupError);
            }
          });
        }
      });

    } catch (error) {
      console.error('Error setting up system preference listeners:', error);
    }
  }

  /**
   * Handle system preference changes with enhanced logic - T042
   * 
   * @param {MediaQueryListEvent} event - Media query change event
   * @returns {void}
   */
  handleSystemPreferenceChange(event) {
    try {
      const now = Date.now();
      this.systemPreferences.changeCount++;
      this.systemPreferences.lastChangeTime = now;

      // Detect new system preference
      const newSystemPreference = this.detectSystemPreference();
      const previousPreference = this.systemPreferences.currentPreference;
      
      // Update current preference tracking
      this.systemPreferences.currentPreference = newSystemPreference;

      // Log preference change for debugging
      if (previousPreference !== newSystemPreference) {
        console.log(`System preference changed: ${previousPreference} → ${newSystemPreference}`);
      }

      // Only apply if user has system preference set
      const currentTheme = this.getTheme();
      if (currentTheme === 'system') {
        // Determine theme from system preference
        let newTheme;
        switch (newSystemPreference) {
          case 'dark':
            newTheme = 'dark';
            break;
          case 'light':
            newTheme = 'light';
            break;
          default:
            newTheme = 'light'; // Safe fallback
        }

        console.log(`Applying system theme: ${newTheme} (preference: ${newSystemPreference})`);
        
        // T036: Use immediate theme application for system changes
        this.setTheme(newTheme, 'system', true);

        // T041: Notify listeners of system preference change
        this.notifyListeners('system-preference-changed', {
          preference: newSystemPreference,
          theme: newTheme,
          timestamp: now,
          changeCount: this.systemPreferences.changeCount
        });
      } else {
        console.log(`System preference changed to ${newSystemPreference}, but user theme is ${currentTheme} - no change applied`);
      }

    } catch (error) {
      console.error('Error handling system preference change:', error);
    }
  }

  /**
   * Get comprehensive system preference information - T042
   * 
   * @returns {Object} System preference details
   */
  getSystemPreferences() {
    try {
      if (!this.systemPreferences) {
        return { available: false, reason: 'System preferences not initialized' };
      }

      return {
        available: true,
        preferences: {
          colorScheme: this.detectSystemPreference(),
          darkMode: this.systemPreferences.darkModeQuery?.matches || false,
          lightMode: this.systemPreferences.lightModeQuery?.matches || false,
          highContrast: this.systemPreferences.contrastQuery?.matches || false,
          reducedMotion: this.systemPreferences.reducedMotionQuery?.matches || false
        },
        tracking: {
          currentPreference: this.systemPreferences.currentPreference,
          lastChangeTime: this.systemPreferences.lastChangeTime,
          changeCount: this.systemPreferences.changeCount
        },
        support: {
          mediaQueries: typeof window !== 'undefined' && !!window.matchMedia,
          addEventListener: !!(this.systemPreferences.darkModeQuery?.addEventListener),
          addListener: !!(this.systemPreferences.darkModeQuery?.addListener)
        }
      };
    } catch (error) {
      console.error('Error getting system preferences:', error);
      return { available: false, error: error.message };
    }
  }

  /**
   * Cleanup all event listeners and resources - T038
   * Call this method when the ThemeController is no longer needed
   * to prevent memory leaks and dangling references
   * 
   * @returns {void}
   */
  destroy() {
    try {
      // Clear any pending debounce timeout
      if (this.debounceTimeout) {
        clearTimeout(this.debounceTimeout);
        this.debounceTimeout = null;
      }

      // T041: Clear cross-tab debounce timeout
      if (this.crossTabDebounceTimeout) {
        clearTimeout(this.crossTabDebounceTimeout);
        this.crossTabDebounceTimeout = null;
      }

      // Clear pending theme state
      this.pendingTheme = null;
      this.pendingSource = null;

      // Remove system preference listener
      if (this.systemMediaQuery && this.systemChangeHandler) {
        try {
          if (this.systemMediaQuery.removeEventListener) {
            this.systemMediaQuery.removeEventListener('change', this.systemChangeHandler);
          } else if (this.systemMediaQuery.removeListener) {
            // Legacy browsers
            this.systemMediaQuery.removeListener(this.systemChangeHandler);
          }
        } catch (listenerError) {
          console.warn('Error removing system preference listener:', listenerError);
        }
        
        this.systemMediaQuery = null;
        this.systemChangeHandler = null;
      }

      // Clear all theme change listeners
      this.listeners = [];

      // Execute any additional cleanup handlers
      this.cleanupHandlers.forEach(handler => {
        try {
          if (typeof handler === 'function') {
            handler();
          }
        } catch (handlerError) {
          console.warn('Error in cleanup handler:', handlerError);
        }
      });

      // Clear cleanup handlers array
      this.cleanupHandlers = [];

      console.log('ThemeController cleanup completed successfully');
    } catch (error) {
      console.error('Error during ThemeController cleanup:', error);
    }
  }

  /**
   * Register a custom cleanup handler - T038
   * Useful for components that need to cleanup when theme controller is destroyed
   * 
   * @param {Function} handler - Cleanup function to call on destroy
   * @returns {void}
   */
  registerCleanupHandler(handler) {
    try {
      if (typeof handler === 'function') {
        this.cleanupHandlers.push(handler);
      } else {
        console.warn('Cleanup handler must be a function');
      }
    } catch (error) {
      console.error('Error registering cleanup handler:', error);
    }
  }

  /**
   * Get browser compatibility information - T039
   * Provides details about what features are supported
   * 
   * @returns {Object} Compatibility information object
   */
  getBrowserCompatibility() {
    return {
      cssCustomProperties: this.cssCustomPropertiesSupported,
      legacyFallbackActive: this.legacyFallbackActive,
      mediaQueries: typeof window !== 'undefined' && window.matchMedia !== undefined,
      localStorage: this.storageType === 'localStorage',
      sessionStorage: this.storageType === 'sessionStorage',
      cssSupportsAPI: typeof window !== 'undefined' && window.CSS && window.CSS.supports !== undefined,
      crossTabSync: this.getCrossTabSyncStatus(), // T041: Include cross-tab sync status
      systemPreferences: this.getSystemPreferences(), // T042: Include system preference monitoring
      browserInfo: this.getBrowserInfo()
    };
  }

  /**
   * Attempt storage write with quota handling and recovery - T040
   * Implements progressive fallback and cleanup strategies
   * 
   * @param {string} key - Storage key to write
   * @param {string} value - Value to store
   * @returns {boolean} True if write succeeded, false if all attempts failed
   */
  attemptStorageWrite(key, value) {
    this.storageMetrics.totalWrites++;
    
    try {
      // First attempt: Direct write
      this.storage.setItem(key, value);
      this.storageMetrics.successfulWrites++;
      
      // Reset recovery attempts on success
      if (this.storageRecoveryAttempts > 0) {
        console.log('Storage write succeeded after recovery attempts');
        this.storageRecoveryAttempts = 0;
        this.storageQuotaExceeded = false;
        this.updateStorageHealthStatus('healthy');
      }
      
      return true;
    } catch (error) {
      this.storageMetrics.failedWrites++;
      this.lastStorageError = {
        error: error.message,
        timestamp: Date.now(),
        key: key,
        attempt: this.storageRecoveryAttempts + 1
      };
      
      console.warn(`Storage write failed (attempt ${this.storageRecoveryAttempts + 1}):`, error);
      
      // Handle quota exceeded specifically
      if (error.name === 'QuotaExceededError') {
        this.storageMetrics.quotaExceededCount++;
        this.storageMetrics.lastQuotaExceeded = Date.now();
        this.storageQuotaExceeded = true;
        
        return this.handleQuotaExceeded(key, value);
      }
      
      // Handle other storage errors
      return this.handleStorageError(error, key, value);
    }
  }

  /**
   * Handle quota exceeded error with cleanup and recovery - T040
   * 
   * @param {string} key - Storage key being written
   * @param {string} value - Value being stored
   * @returns {boolean} True if recovery succeeded
   */
  handleQuotaExceeded(key, value) {
    console.warn('Storage quota exceeded, attempting recovery...');
    this.updateStorageHealthStatus('critical');
    
    if (this.storageRecoveryAttempts >= this.maxRecoveryAttempts) {
      console.error('Maximum storage recovery attempts reached, falling back to memory-only');
      return this.fallbackToMemoryStorage(key, value);
    }
    
    this.storageRecoveryAttempts++;
    
    // Recovery strategy 1: Clear old theme data
    if (this.storageRecoveryAttempts === 1) {
      return this.clearOldThemeData(key, value);
    }
    
    // Recovery strategy 2: Clear all HexTrackr storage
    if (this.storageRecoveryAttempts === 2) {
      return this.clearHexTrackrStorage(key, value);
    }
    
    // Recovery strategy 3: Emergency cleanup
    if (this.storageRecoveryAttempts === 3) {
      return this.emergencyStorageCleanup(key, value);
    }
    
    return false;
  }

  /**
   * Clear old theme data to free up quota - T040
   * 
   * @param {string} key - Current key being written
   * @param {string} value - Current value being stored
   * @returns {boolean} True if recovery write succeeded
   */
  clearOldThemeData(key, value) {
    try {
      console.log('Recovery attempt 1: Clearing old theme data');
      
      // Look for old theme-related keys
      const keysToRemove = [];
      for (let i = 0; i < this.storage.length; i++) {
        const storageKey = this.storage.key(i);
        if (storageKey && (
          storageKey.includes('theme') ||
          storageKey.includes('dark-mode') ||
          storageKey.includes('hextrackr-old')
        )) {
          keysToRemove.push(storageKey);
        }
      }
      
      // Remove old keys
      keysToRemove.forEach(oldKey => {
        if (oldKey !== key) { // Don't remove the key we're trying to write
          this.storage.removeItem(oldKey);
        }
      });
      
      console.log(`Removed ${keysToRemove.length} old theme keys`);
      
      // Retry write
      this.storage.setItem(key, value);
      console.log('Recovery attempt 1: SUCCESS');
      return true;
    } catch (retryError) {
      console.warn('Recovery attempt 1: FAILED -', retryError);
      return false;
    }
  }

  /**
   * Clear all HexTrackr-related storage - T040
   * 
   * @param {string} key - Current key being written
   * @param {string} value - Current value being stored
   * @returns {boolean} True if recovery write succeeded
   */
  clearHexTrackrStorage(key, value) {
    try {
      console.log('Recovery attempt 2: Clearing all HexTrackr storage');
      
      const keysToRemove = [];
      for (let i = 0; i < this.storage.length; i++) {
        const storageKey = this.storage.key(i);
        if (storageKey && storageKey.includes('hextrackr')) {
          keysToRemove.push(storageKey);
        }
      }
      
      // Remove HexTrackr keys except the one we're trying to write
      keysToRemove.forEach(oldKey => {
        if (oldKey !== key) {
          this.storage.removeItem(oldKey);
        }
      });
      
      console.log(`Removed ${keysToRemove.length} HexTrackr keys`);
      
      // Retry write
      this.storage.setItem(key, value);
      console.log('Recovery attempt 2: SUCCESS');
      return true;
    } catch (retryError) {
      console.warn('Recovery attempt 2: FAILED -', retryError);
      return false;
    }
  }

  /**
   * Emergency storage cleanup - remove oldest entries - T040
   * 
   * @param {string} key - Current key being written
   * @param {string} value - Current value being stored
   * @returns {boolean} True if recovery write succeeded
   */
  emergencyStorageCleanup(key, value) {
    try {
      console.log('Recovery attempt 3: Emergency cleanup of oldest entries');
      
      // Get all storage keys with timestamps if possible
      const allKeys = [];
      for (let i = 0; i < this.storage.length; i++) {
        const storageKey = this.storage.key(i);
        if (storageKey) {
          allKeys.push(storageKey);
        }
      }
      
      // Remove up to 10 oldest entries (simple approach)
      const keysToRemove = allKeys.slice(0, Math.min(10, allKeys.length - 1));
      keysToRemove.forEach(oldKey => {
        if (oldKey !== key) {
          this.storage.removeItem(oldKey);
        }
      });
      
      console.log(`Emergency cleanup: Removed ${keysToRemove.length} entries`);
      
      // Retry write
      this.storage.setItem(key, value);
      console.log('Recovery attempt 3: SUCCESS');
      return true;
    } catch (retryError) {
      console.error('Recovery attempt 3: FAILED -', retryError);
      return false;
    }
  }

  /**
   * Fallback to memory-only storage - T040
   * 
   * @param {string} key - Storage key
   * @param {string} value - Value to store
   * @returns {boolean} Always returns false to indicate storage failure
   */
  fallbackToMemoryStorage(key, value) {
    console.warn('Falling back to memory-only storage - theme will not persist across sessions');
    
    // Initialize memory storage if not exists
    if (!this.memoryStorage) {
      this.memoryStorage = new Map();
    }
    
    this.memoryStorage.set(key, value);
    this.updateStorageHealthStatus('failed');
    
    // Return false to indicate persistent storage failed
    return false;
  }

  /**
   * Handle non-quota storage errors - T040
   * 
   * @param {Error} error - The storage error
   * @param {string} key - Storage key
   * @param {string} value - Value being stored
   * @returns {boolean} True if error was handled successfully
   */
  handleStorageError(error, key, value) {
    console.error('Storage error encountered:', error);
    
    // Handle specific error types
    if (error.name === 'SecurityError') {
      console.warn('Security error - likely private browsing mode');
      this.updateStorageHealthStatus('degraded');
      return this.fallbackToMemoryStorage(key, value);
    }
    
    if (error.name === 'InvalidAccessError') {
      console.warn('Invalid access error - storage may be corrupted');
      this.updateStorageHealthStatus('critical');
      return this.fallbackToMemoryStorage(key, value);
    }
    
    // Generic error handling
    this.updateStorageHealthStatus('degraded');
    return this.fallbackToMemoryStorage(key, value);
  }

  /**
   * Get storage metrics and health information - T040
   * 
   * @returns {Object} Comprehensive storage status
   */
  getStorageStatus() {
    return {
      healthStatus: this.storageHealthStatus,
      quotaExceeded: this.storageQuotaExceeded,
      recoveryAttempts: this.storageRecoveryAttempts,
      lastError: this.lastStorageError,
      metrics: { ...this.storageMetrics },
      storageType: this.storageType,
      memoryFallbackActive: !!this.memoryStorage
    };
  }

  /**
   * Get basic browser information for compatibility reporting - T039
   * 
   * @returns {Object} Browser information
   */
  getBrowserInfo() {
    try {
      if (typeof navigator === 'undefined') {
        return { userAgent: 'Server-side', version: 'unknown' };
      }

      const ua = navigator.userAgent;
      let browserName = 'Unknown';
      let version = 'Unknown';

      // Detect browser type (simplified detection)
      if (ua.includes('Chrome') && !ua.includes('Edg')) {
        browserName = 'Chrome';
        const match = ua.match(/Chrome\/([0-9.]+)/);
        version = match ? match[1] : 'Unknown';
      } else if (ua.includes('Firefox')) {
        browserName = 'Firefox';
        const match = ua.match(/Firefox\/([0-9.]+)/);
        version = match ? match[1] : 'Unknown';
      } else if (ua.includes('Safari') && !ua.includes('Chrome')) {
        browserName = 'Safari';
        const match = ua.match(/Version\/([0-9.]+)/);
        version = match ? match[1] : 'Unknown';
      } else if (ua.includes('Edg')) {
        browserName = 'Edge';
        const match = ua.match(/Edg\/([0-9.]+)/);
        version = match ? match[1] : 'Unknown';
      } else if (ua.includes('MSIE') || ua.includes('Trident')) {
        browserName = 'Internet Explorer';
        const match = ua.match(/(?:MSIE |rv:)([0-9.]+)/);
        version = match ? match[1] : 'Unknown';
      }

      return {
        userAgent: ua,
        browserName,
        version,
        mobile: /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua)
      };
    } catch (error) {
      console.error('Error getting browser info:', error);
      return { userAgent: 'Error', version: 'unknown' };
    }
  }

  /**
   * Validate specific color combination for WCAG AA compliance - T043
   * 
   * @param {string} foreground - Foreground color (hex)
   * @param {string} background - Background color (hex)
   * @param {string} label - Description of the combination
   * @returns {Object} Validation result with pass/fail and contrast ratio
   */
  validateColorAccessibility(foreground, background, label = 'Custom combination') {
    try {
      return validateColorCombination(foreground, background, {
        level: 'AA',
        includeAAA: false,
        textSizes: ['normal', 'large'],
        label: label
      });
    } catch (error) {
      console.error('Error validating color accessibility:', error);
      return {
        passes: false,
        ratio: 0,
        error: error.message
      };
    }
  }

  /**
   * Generate comprehensive accessibility report for current theme - T043
   * Tests all critical UI color combinations against WCAG standards
   * 
   * @param {string} theme - Theme to validate ('light' or 'dark')
   * @returns {Object} Accessibility report with violations and recommendations
   */
  generateThemeAccessibilityReport(theme = 'dark') {
    try {
      // Only validate dark theme colors (light theme uses browser defaults)
      if (theme !== 'dark') {
        return {
          theme: theme,
          summary: { total: 0, passed: 0, failed: 0, passRate: 100 },
          violations: [],
          message: 'Light theme accessibility validation not implemented (uses system defaults)'
        };
      }

      // Extract current CSS custom properties for dark theme
      const computedStyle = getComputedStyle(document.documentElement);
      
      const themeColors = {
        // Core colors
        '--bs-body-color': computedStyle.getPropertyValue('--bs-body-color').trim(),
        '--bs-body-bg': computedStyle.getPropertyValue('--bs-body-bg').trim(),
        '--bs-emphasis-color': computedStyle.getPropertyValue('--bs-emphasis-color').trim(),
        '--bs-secondary-color': computedStyle.getPropertyValue('--bs-secondary-color').trim(),
        '--bs-tertiary-color': computedStyle.getPropertyValue('--bs-tertiary-color').trim(),
        
        // Component colors
        '--bs-card-bg': computedStyle.getPropertyValue('--bs-card-bg').trim() || computedStyle.getPropertyValue('--bs-body-bg').trim(),
        
        // VPR badges
        '--vpr-critical': computedStyle.getPropertyValue('--vpr-critical').trim(),
        '--vpr-high': computedStyle.getPropertyValue('--vpr-high').trim(),
        '--vpr-medium': computedStyle.getPropertyValue('--vpr-medium').trim(),
        '--vpr-low': computedStyle.getPropertyValue('--vpr-low').trim(),
        '--vpr-info': computedStyle.getPropertyValue('--vpr-info').trim(),
        
        // Semantic colors
        '--bs-primary': computedStyle.getPropertyValue('--bs-primary').trim(),
        '--bs-success': computedStyle.getPropertyValue('--bs-success').trim(),
        '--bs-warning': computedStyle.getPropertyValue('--bs-warning').trim(),
        '--bs-danger': computedStyle.getPropertyValue('--bs-danger').trim(),
        '--bs-info': computedStyle.getPropertyValue('--bs-info').trim(),
      };

      // Use the utility's report generation function
      const report = generateAccessibilityReport(themeColors, 'AA');
      
      // Add theme context
      report.theme = theme;
      report.validatedBy = 'ThemeController.generateThemeAccessibilityReport()';
      
      console.log('🎯 Theme Accessibility Report Generated:', {
        theme: report.theme,
        passRate: `${report.summary.passRate}%`,
        violations: report.violations.length,
        timestamp: report.timestamp
      });
      
      return report;
      
    } catch (error) {
      console.error('Error generating theme accessibility report:', error);
      return {
        theme: theme,
        timestamp: new Date().toISOString(),
        summary: { total: 0, passed: 0, failed: 0, passRate: 0 },
        violations: [],
        error: error.message
      };
    }
  }

  /**
   * Check if current theme meets WCAG AA standards - T043
   * Quick validation method for runtime accessibility checking
   * 
   * @returns {boolean} True if theme meets WCAG AA standards
   */
  isThemeAccessible() {
    try {
      const currentTheme = this.getTheme();
      const resolvedTheme = currentTheme === 'system' ? this.detectSystemPreference() || 'light' : currentTheme;
      
      if (resolvedTheme === 'light') {
        // Assume light theme is accessible (system defaults)
        return true;
      }
      
      const report = this.generateThemeAccessibilityReport('dark');
      return report.summary.criticalFailures === 0;
      
    } catch (error) {
      console.error('Error checking theme accessibility:', error);
      return false; // Conservative approach: assume not accessible if error occurs
    }
  }

  /**
   * Log accessibility report to console for debugging - T043
   * 
   * @param {boolean} verbose - Include detailed color information
   * @returns {void}
   */
  logAccessibilityReport(verbose = false) {
    try {
      const currentTheme = this.getTheme();
      const resolvedTheme = currentTheme === 'system' ? this.detectSystemPreference() || 'light' : currentTheme;
      
      console.group('🎨 HexTrackr Theme Accessibility Report');
      console.log('Current theme:', currentTheme, resolvedTheme !== currentTheme ? `(resolved: ${resolvedTheme})` : '');
      
      if (resolvedTheme === 'dark') {
        const report = this.generateThemeAccessibilityReport('dark');
        
        console.log('📊 Summary:', `${report.summary.passed}/${report.summary.total} combinations pass WCAG AA (${report.summary.passRate}%)`);
        
        if (report.violations.length > 0) {
          console.warn('❌ Violations:', report.violations.length);
          if (verbose) {
            report.violations.forEach((violation, index) => {
              console.log(`   ${index + 1}. ${violation.combination}: ${violation.ratio}:1 (needs ${violation.required}:1)`);
              console.log(`      Colors: ${violation.foreground} on ${violation.background}`);
            });
          }
        } else {
          console.log('✅ All combinations pass WCAG AA standards!');
        }
        
        if (verbose) {
          console.log('🕐 Report generated:', report.timestamp);
          console.log('📋 Full report:', report);
        }
      } else {
        console.log('💡 Light theme active - using system accessibility defaults');
      }
      
      console.groupEnd();
    } catch (error) {
      console.error('Error logging accessibility report:', error);
    }
  }
}