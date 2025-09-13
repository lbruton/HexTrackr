import { test, expect } from '@playwright/test';

/**
 * System Preference Detection - E2E Tests (TDD Phase)
 * 
 * CRITICAL TDD REQUIREMENT: These tests MUST FAIL when first run!
 * 
 * These tests verify system theme preference detection and real-time monitoring
 * as specified in HexTrackr Spec 005 Dark Mode Theme System.
 * 
 * Current Implementation Status:
 * - detectSystemPreference() returns null (stub implementation)
 * - No system change listeners implemented
 * - No real-time detection working
 * 
 * RED Phase: Tests FAIL initially, then PASS after T020-T022 implementation.
 * 
 * Creative test scenarios include:
 * - Browser CSS media query capabilities
 * - OS theme change simulation and detection
 * - Real-time listener management
 * - Performance under rapid changes
 * - Memory leak prevention
 * - Cross-browser compatibility edge cases
 */

test.describe('System Preference Detection', () => {
  
  test.beforeEach(async ({ page }) => {
    // Navigate to any HexTrackr page to test theme controller
    await page.goto('http://localhost:8989/vulnerabilities.html');
    
    // Wait for page to load and theme controller to be available
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500); // Allow scripts to initialize
  });

  /**
   * Test 1: Browser Environment Validation
   * Verify the browser supports the APIs we need for system detection
   * These assertions should PASS (testing browser capabilities)
   */
  test('validates browser supports system preference APIs', async ({ page }) => {
    // Test CSS media query support
    const hasMediaQuerySupport = await page.evaluate(() => {
      return typeof window.matchMedia === 'function';
    });
    expect(hasMediaQuerySupport).toBe(true);
    
    // Test prefers-color-scheme media query specifically
    const supportsColorScheme = await page.evaluate(() => {
      const mq = window.matchMedia('(prefers-color-scheme: dark)');
      return mq instanceof MediaQueryList && typeof mq.matches === 'boolean';
    });
    expect(supportsColorScheme).toBe(true);
    
    // Test MediaQueryList listener support (modern browsers)
    const supportsListeners = await page.evaluate(() => {
      const mq = window.matchMedia('(prefers-color-scheme: dark)');
      return typeof mq.addEventListener === 'function' || typeof mq.addListener === 'function';
    });
    expect(supportsListeners).toBe(true);
    
    console.log('✓ Browser supports all required system preference detection APIs');
  });

  /**
   * Test 2: Static System Preference Detection
   * CRITICAL: This test MUST FAIL initially!
   * detectSystemPreference() currently returns null (stub)
   */
  test('detects current system theme preference', async ({ page }) => {
    // Import ThemeController in page context and test detection
    const result = await page.evaluate(async () => {
      try {
        // Dynamically import the ThemeController class
        const module = await import('/scripts/shared/theme-controller.js');
        const controller = new module.ThemeController();
        
        // Get browser system preference for comparison
        const browserSystemPreference = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        
        // Test detectSystemPreference() method
        const detectedPreference = controller.detectSystemPreference();
        
        return {
          browserPreference: browserSystemPreference,
          detectedPreference: detectedPreference,
          success: true
        };
      } catch (error) {
        return {
          error: error.message,
          success: false
        };
      }
    });
    
    if (!result.success) {
      throw new Error(`Failed to import ThemeController: ${result.error}`);
    }
    
    // EXPECTED FAILURE: detectedPreference is null, not browserSystemPreference
    expect(result.detectedPreference).toBe(result.browserPreference);
    expect(result.detectedPreference).not.toBe(null);
    
    console.log(`Expected: ${result.browserPreference}, Got: ${result.detectedPreference} (should fail)`);
  });

  /**
   * Test 3: Simulated System Theme Changes
   * Test detection when OS theme changes (simulated via Playwright)
   * CRITICAL: This test MUST FAIL initially!
   */
  test('detects simulated system theme changes', async ({ page }) => {
    // Import ThemeController
    const themeController = await page.evaluate(async () => {
      const module = await import('/scripts/shared/theme-controller.js');
      return new module.ThemeController();
    });

    // Test initial detection
    let currentDetection = await page.evaluate((controller) => {
      return controller.detectSystemPreference();
    }, themeController);
    
    // THIS WILL FAIL: stub returns null
    expect(currentDetection).not.toBe(null);
    
    // Simulate system change to dark mode
    await page.emulateMedia({ colorScheme: 'dark' });
    await page.waitForTimeout(100); // Allow change to propagate
    
    // Verify browser reflects the change
    const isDarkMode = await page.evaluate(() => {
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    });
    expect(isDarkMode).toBe(true);
    
    // Test detection after simulated change
    // THIS WILL FAIL: stub still returns null instead of 'dark'
    currentDetection = await page.evaluate((controller) => {
      return controller.detectSystemPreference();
    }, themeController);
    expect(currentDetection).toBe('dark');
    
    // Simulate system change to light mode
    await page.emulateMedia({ colorScheme: 'light' });
    await page.waitForTimeout(100);
    
    // THIS WILL FAIL: stub still returns null instead of 'light'
    currentDetection = await page.evaluate((controller) => {
      return controller.detectSystemPreference();
    }, themeController);
    expect(currentDetection).toBe('light');
  });

  /**
   * Test 4: Real-time System Change Detection
   * CRITICAL: This test MUST FAIL initially!
   * No system change listeners are implemented yet
   */
  test('monitors real-time system theme changes', async ({ page }) => {
    let changeEvents = [];
    
    // Setup change tracking
    await page.addInitScript(() => {
      window.themeChangeEvents = [];
    });
    
    // Import ThemeController and setup listener
    await page.evaluate(async () => {
      const module = await import('/scripts/shared/theme-controller.js');
      const controller = new module.ThemeController();
      
      // Add listener for theme changes
      // THIS WILL FAIL: addThemeChangeListener likely doesn't trigger on system changes
      controller.addThemeChangeListener((newTheme, source) => {
        window.themeChangeEvents.push({ theme: newTheme, source: source, timestamp: Date.now() });
      });
      
      window.testController = controller;
    });
    
    // Simulate rapid system changes
    const changes = [
      { colorScheme: 'dark', expectedTheme: 'dark' },
      { colorScheme: 'light', expectedTheme: 'light' },
      { colorScheme: 'dark', expectedTheme: 'dark' }
    ];
    
    for (const change of changes) {
      await page.emulateMedia(change);
      await page.waitForTimeout(100); // Allow detection to occur
    }
    
    // Check if system changes were detected and listeners triggered
    // THIS WILL FAIL: no system change detection implemented
    const capturedEvents = await page.evaluate(() => window.themeChangeEvents);
    
    // Should have captured events for each system change
    expect(capturedEvents.length).toBeGreaterThan(0);
    expect(capturedEvents.some(event => event.source === 'system')).toBe(true);
    
    // Verify events match expected theme changes
    const darkEvents = capturedEvents.filter(event => event.theme === 'dark' && event.source === 'system');
    const lightEvents = capturedEvents.filter(event => event.theme === 'light' && event.source === 'system');
    
    expect(darkEvents.length).toBe(2);
    expect(lightEvents.length).toBe(1);
  });

  /**
   * Test 5: Performance Under Rapid System Changes
   * Test system detection performance and memory management
   * CRITICAL: This test MUST FAIL initially!
   */
  test('handles rapid system changes without performance degradation', async ({ page }) => {
    // Import ThemeController
    await page.evaluate(async () => {
      const module = await import('/scripts/shared/theme-controller.js');
      window.testController = new module.ThemeController();
    });
    
    // Monitor performance during rapid changes
    const startTime = await page.evaluate(() => performance.now());
    
    // Simulate 20 rapid system theme changes
    const rapidChanges = Array(20).fill(null).map((_, i) => 
      ({ colorScheme: i % 2 === 0 ? 'dark' : 'light' })
    );
    
    for (const change of rapidChanges) {
      await page.emulateMedia(change);
      // Test detection speed
      const detectionStart = await page.evaluate(() => performance.now());
      
      // THIS WILL FAIL: detectSystemPreference() returns null, no actual detection
      const detected = await page.evaluate(() => {
        return window.testController.detectSystemPreference();
      });
      
      const detectionEnd = await page.evaluate(() => performance.now());
      const detectionTime = detectionEnd - detectionStart;
      
      // Detection should be fast (< 10ms per call)
      expect(detectionTime).toBeLessThan(10);
      
      // Should detect correct theme
      const expectedTheme = change.colorScheme;
      expect(detected).toBe(expectedTheme);
    }
    
    const totalTime = await page.evaluate(() => performance.now()) - startTime;
    console.log(`Total time for 20 rapid changes: ${totalTime}ms`);
    
    // Total time should be reasonable (< 1 second for 20 changes)
    expect(totalTime).toBeLessThan(1000);
  });

  /**
   * Test 6: System Preference Listener Management
   * Test that listeners are properly added, managed, and cleaned up
   * CRITICAL: This test MUST FAIL initially!
   */
  test('properly manages system preference listeners', async ({ page }) => {
    // Track MediaQueryList listeners in browser
    await page.addInitScript(() => {
      window.mediaQueryListeners = 0;
      
      // Override addEventListener to track listener count
      const originalAddEventListener = MediaQueryList.prototype.addEventListener;
      const originalRemoveEventListener = MediaQueryList.prototype.removeEventListener;
      
      MediaQueryList.prototype.addEventListener = function(...args) {
        window.mediaQueryListeners++;
        return originalAddEventListener.apply(this, args);
      };
      
      MediaQueryList.prototype.removeEventListener = function(...args) {
        window.mediaQueryListeners--;
        return originalRemoveEventListener.apply(this, args);
      };
    });
    
    // Create multiple ThemeController instances
    await page.evaluate(async () => {
      const module = await import('/scripts/shared/theme-controller.js');
      window.controllers = [
        new module.ThemeController(),
        new module.ThemeController(),
        new module.ThemeController()
      ];
    });
    
    // Check initial listener count
    // THIS WILL FAIL: no system listeners implemented yet
    let listenerCount = await page.evaluate(() => window.mediaQueryListeners);
    expect(listenerCount).toBe(3); // Each controller should add one system listener
    
    // Simulate system changes and verify listeners respond
    await page.emulateMedia({ colorScheme: 'dark' });
    await page.waitForTimeout(100);
    
    // All controllers should detect the change
    // THIS WILL FAIL: detectSystemPreference() returns null
    const detections = await page.evaluate(() => {
      return window.controllers.map(controller => controller.detectSystemPreference());
    });
    
    detections.forEach(detection => {
      expect(detection).toBe('dark');
    });
    
    // Test cleanup (if ThemeController had a cleanup method)
    // This documents the expected cleanup behavior
    await page.evaluate(() => {
      // Simulate cleanup - this method doesn't exist yet but should
      window.controllers.forEach(controller => {
        if (typeof controller.cleanup === 'function') {
          controller.cleanup();
        }
      });
    });
    
    // After cleanup, listener count should decrease
    // THIS WILL FAIL: no cleanup implemented
    listenerCount = await page.evaluate(() => window.mediaQueryListeners);
    expect(listenerCount).toBe(0);
  });

  /**
   * Test 7: Edge Cases and Error Handling
   * Test graceful handling of various edge cases
   * Mix of expected passes and failures
   */
  test('handles edge cases gracefully', async ({ page }) => {
    // Test behavior when matchMedia is not available (legacy browser simulation)
    await page.evaluate(() => {
      // Temporarily remove matchMedia
      window.originalMatchMedia = window.matchMedia;
      delete window.matchMedia;
    });
    
    const controllerWithoutMatchMedia = await page.evaluate(async () => {
      const module = await import('/scripts/shared/theme-controller.js');
      return new module.ThemeController();
    });
    
    // Should gracefully handle missing API
    const detectionWithoutAPI = await page.evaluate((controller) => {
      return controller.detectSystemPreference();
    }, controllerWithoutMatchMedia);
    
    // Should return null when API unavailable (this might pass)
    expect(detectionWithoutAPI).toBe(null);
    
    // Restore matchMedia
    await page.evaluate(() => {
      window.matchMedia = window.originalMatchMedia;
    });
    
    // Test with valid matchMedia restored
    const normalController = await page.evaluate(async () => {
      const module = await import('/scripts/shared/theme-controller.js');
      return new module.ThemeController();
    });
    
    // THIS WILL FAIL: still returns null even with API available
    const normalDetection = await page.evaluate((controller) => {
      return controller.detectSystemPreference();
    }, normalController);
    
    expect(normalDetection).not.toBe(null);
    expect(['light', 'dark'].includes(normalDetection)).toBe(true);
  });

  /**
   * Test 8: Cross-Browser Compatibility
   * Test system detection across different browser engines
   * Focus on differences in MediaQueryList API support
   */
  test('works consistently across browser engines', async ({ page, browserName }) => {
    console.log(`Testing system preference detection in: ${browserName}`);
    
    // Import ThemeController
    const themeController = await page.evaluate(async () => {
      const module = await import('/scripts/shared/theme-controller.js');
      return new module.ThemeController();
    });
    
    // Test browser-specific MediaQueryList behavior
    const browserCapabilities = await page.evaluate(() => {
      const mq = window.matchMedia('(prefers-color-scheme: dark)');
      return {
        hasMatches: typeof mq.matches === 'boolean',
        hasAddEventListener: typeof mq.addEventListener === 'function',
        hasAddListener: typeof mq.addListener === 'function', // Legacy
        hasMedia: typeof mq.media === 'string'
      };
    });
    
    // All modern browsers should support these
    expect(browserCapabilities.hasMatches).toBe(true);
    expect(browserCapabilities.hasMedia).toBe(true);
    expect(
      browserCapabilities.hasAddEventListener || browserCapabilities.hasAddListener
    ).toBe(true);
    
    // Test detection works regardless of browser
    // THIS WILL FAIL: stub returns null in all browsers
    const detected = await page.evaluate((controller) => {
      return controller.detectSystemPreference();
    }, themeController);
    
    expect(detected).not.toBe(null);
    expect(['light', 'dark'].includes(detected)).toBe(true);
    
    console.log(`${browserName} system detection: ${detected} (should not be null)`);
  });

  /**
   * Test 9: High Contrast and Accessibility Preferences
   * Creative test for accessibility-related system preferences
   * Tests enhanced system detection capabilities
   */
  test('detects high contrast and accessibility preferences', async ({ page }) => {
    // Test high contrast mode detection
    const supportsHighContrast = await page.evaluate(() => {
      return window.matchMedia('(prefers-contrast: high)').matches;
    });
    
    // Import ThemeController
    const themeController = await page.evaluate(async () => {
      const module = await import('/scripts/shared/theme-controller.js');
      return new module.ThemeController();
    });
    
    // Test if controller can detect enhanced preferences
    // THIS WILL FAIL: no enhanced detection implemented
    const enhancedDetection = await page.evaluate((controller) => {
      // This method doesn't exist yet but documents expected functionality
      if (typeof controller.detectAccessibilityPreferences === 'function') {
        return controller.detectAccessibilityPreferences();
      }
      return null;
    }, themeController);
    
    if (supportsHighContrast) {
      // Should detect high contrast when available
      expect(enhancedDetection).toHaveProperty('contrast');
      expect(enhancedDetection.contrast).toBe('high');
    }
    
    // Test reduced motion preference
    const prefersReducedMotion = await page.evaluate(() => {
      return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    });
    
    if (prefersReducedMotion && enhancedDetection) {
      expect(enhancedDetection).toHaveProperty('motion');
      expect(enhancedDetection.motion).toBe('reduce');
    }
    
    console.log(`High contrast: ${supportsHighContrast}, Reduced motion: ${prefersReducedMotion}`);
  });

  /**
   * Test 10: Memory Leak Prevention
   * Creative test to ensure system preference monitoring doesn't leak memory
   * CRITICAL: This test MUST FAIL initially!
   */
  test('prevents memory leaks during extensive system monitoring', async ({ page }) => {
    // Monitor memory usage during test
    let initialMemory = await page.evaluate(() => {
      if (performance.memory) {
        return performance.memory.usedJSHeapSize;
      }
      return 0;
    });
    
    // Create and destroy many ThemeController instances
    for (let i = 0; i < 100; i++) {
      await page.evaluate(async (iteration) => {
        const module = await import('/scripts/shared/theme-controller.js');
        const controller = new module.ThemeController();
        
        // Add listener
        controller.addThemeChangeListener(() => {});
        
        // Simulate system change detection
        controller.detectSystemPreference();
        
        // Clean up if method exists
        if (typeof controller.cleanup === 'function') {
          controller.cleanup();
        }
      }, i);
      
      // Periodic cleanup
      if (i % 20 === 0) {
        await page.evaluate(() => {
          if (window.gc) {
            window.gc(); // Force garbage collection if available
          }
        });
      }
    }
    
    // Final cleanup
    await page.evaluate(() => {
      if (window.gc) {
        window.gc();
      }
    });
    
    // Check final memory usage
    let finalMemory = await page.evaluate(() => {
      if (performance.memory) {
        return performance.memory.usedJSHeapSize;
      }
      return 0;
    });
    
    if (initialMemory > 0 && finalMemory > 0) {
      const memoryGrowth = finalMemory - initialMemory;
      const memoryGrowthMB = memoryGrowth / (1024 * 1024);
      
      console.log(`Memory growth: ${memoryGrowthMB.toFixed(2)}MB`);
      
      // Memory growth should be reasonable (< 5MB for 100 instances)
      // THIS WILL FAIL: likely memory leaks without proper cleanup
      expect(memoryGrowthMB).toBeLessThan(5);
    }
  });
});