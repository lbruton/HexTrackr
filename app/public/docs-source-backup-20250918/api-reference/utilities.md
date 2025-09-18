# Utilities

This section contains API documentation for Utilities.

## Source: app/utils/**/*.js

## Classes

<table>
  <thead>
    <tr>
      <th>Global</th><th>Description</th>
    </tr>
  </thead>
  <tbody>
<tr>
    <td><a href="#ProgressTracker">ProgressTracker</a></td>
    <td><p>ProgressTracker - Manages real-time progress tracking for long-running operations</p>
<p>Features:</p>
<ul>
<li>Session-based progress tracking with unique IDs</li>
<li>WebSocket integration via Socket.io for real-time updates</li>
<li>Throttled progress events to prevent spam</li>
<li>Automatic cleanup of stale sessions</li>
<li>Error handling and session management</li>
</ul>
<p>Usage:
const progressTracker = new ProgressTracker(io);
const sessionId = progressTracker.createSession({ operation: &quot;import&quot; });
progressTracker.updateProgress(sessionId, 50, &quot;Processing data...&quot;);
progressTracker.completeSession(sessionId, &quot;Import completed&quot;);</p>
</td>
    </tr>
</tbody>
</table>

## Constants

<table>
  <thead>
    <tr>
      <th>Global</th><th>Description</th>
    </tr>
  </thead>
  <tbody>
<tr>
    <td><a href="#crypto">crypto</a></td>
    <td><p>HexTrackr Helper Functions
Standalone utility functions extracted from server.js for better modularity</p>
</td>
    </tr>
<tr>
    <td><a href="#fs">fs</a></td>
    <td><p>PathValidator - Security utility for path validation
Prevents directory traversal attacks and validates file paths</p>
</td>
    </tr>
</tbody>
</table>

## Functions

<table>
  <thead>
    <tr>
      <th>Global</th><th>Description</th>
    </tr>
  </thead>
  <tbody>
<tr>
    <td><a href="#normalizeHostname">normalizeHostname(hostname)</a> ⇒ <code>string</code></td>
    <td><p>Normalize hostname for consistent deduplication
Handles IP addresses vs domain names appropriately</p>
</td>
    </tr>
<tr>
    <td><a href="#normalizeVendor">normalizeVendor(vendor)</a> ⇒ <code>string</code></td>
    <td><p>Normalize vendor names for consistent categorization</p>
</td>
    </tr>
<tr>
    <td><a href="#normalizeIPAddress">normalizeIPAddress(ipAddress)</a> ⇒ <code>string</code> | <code>null</code></td>
    <td><p>Normalize IP address, handling multiple IPs and validation</p>
</td>
    </tr>
<tr>
    <td><a href="#isValidIPAddress">isValidIPAddress(ip)</a> ⇒ <code>boolean</code></td>
    <td><p>Validate if a string is a valid IP address</p>
</td>
    </tr>
<tr>
    <td><a href="#createDescriptionHash">createDescriptionHash(description)</a> ⇒ <code>string</code></td>
    <td><p>Create a stable hash from description text for deduplication</p>
</td>
    </tr>
<tr>
    <td><a href="#extractScanDateFromFilename">extractScanDateFromFilename(filename)</a> ⇒ <code>string</code> | <code>null</code></td>
    <td><p>Extract scan date from filename using various patterns</p>
</td>
    </tr>
<tr>
    <td><a href="#calculateDeduplicationConfidence">calculateDeduplicationConfidence(uniqueKey)</a> ⇒ <code>number</code></td>
    <td><p>Calculate confidence level for deduplication based on unique key type</p>
</td>
    </tr>
<tr>
    <td><a href="#getDeduplicationTier">getDeduplicationTier(uniqueKey)</a> ⇒ <code>number</code></td>
    <td><p>Get deduplication tier (1-5) based on unique key reliability</p>
</td>
    </tr>
<tr>
    <td><a href="#generateEnhancedUniqueKey">generateEnhancedUniqueKey(mapped)</a> ⇒ <code>string</code></td>
    <td><p>Generate enhanced multi-tier unique key for vulnerability deduplication</p>
</td>
    </tr>
<tr>
    <td><a href="#generateUniqueKey">generateUniqueKey(mapped)</a> ⇒ <code>string</code></td>
    <td><p>Legacy function maintained for backward compatibility during transition</p>
</td>
    </tr>
<tr>
    <td><a href="#mapVulnerabilityRow">mapVulnerabilityRow(row)</a> ⇒ <code>array</code></td>
    <td><p>Map CSV row data to vulnerability object structure</p>
</td>
    </tr>
<tr>
    <td><a href="#mapTicketRow">mapTicketRow(row, index)</a> ⇒ <code>object</code></td>
    <td><p>Map CSV row data to ticket object structure</p>
</td>
    </tr>
<tr>
    <td><a href="#findDocsSectionForFilename">findDocsSectionForFilename(filename)</a> ⇒ <code>string</code> | <code>null</code></td>
    <td><p>Find a documentation section path for a given filename by scanning the content folder</p>
</td>
    </tr>
</tbody>
</table>

<a name="ProgressTracker"></a>

## ProgressTracker

ProgressTracker - Manages real-time progress tracking for long-running operations

Features:

- Session-based progress tracking with unique IDs
- WebSocket integration via Socket.io for real-time updates
- Throttled progress events to prevent spam
- Automatic cleanup of stale sessions
- Error handling and session management

Usage:
const progressTracker = new ProgressTracker(io);
const sessionId = progressTracker.createSession({ operation: "import" });
progressTracker.updateProgress(sessionId, 50, "Processing data...");
progressTracker.completeSession(sessionId, "Import completed");

**Kind**: global class  

- [ProgressTracker](#ProgressTracker)
  - [.createSession(metadata)](#ProgressTracker+createSession) ⇒ <code>string</code>
  - [.createSessionWithId(sessionId, metadata)](#ProgressTracker+createSessionWithId) ⇒ <code>string</code>
  - [.updateProgress(sessionId, progress, message, additionalData)](#ProgressTracker+updateProgress) ⇒ <code>boolean</code>
  - [.completeSession(sessionId, message, finalData)](#ProgressTracker+completeSession) ⇒ <code>boolean</code>
  - [.errorSession(sessionId, errorMessage, errorData)](#ProgressTracker+errorSession) ⇒ <code>boolean</code>
  - [.getSession(sessionId)](#ProgressTracker+getSession) ⇒ <code>Object</code> \| <code>null</code>
  - [.cleanupStaleSessions()](#ProgressTracker+cleanupStaleSessions)

* * *

<a name="ProgressTracker+createSession"></a>

### progressTracker.createSession(metadata) ⇒ <code>string</code>

Create a new progress session with auto-generated UUID

**Kind**: instance method of [<code>ProgressTracker</code>](#ProgressTracker)  
**Returns**: <code>string</code> - sessionId - Unique session identifier  

| Param | Type | Description |
| --- | --- | --- |
| metadata | <code>Object</code> | Initial metadata for the session |

* * *

<a name="ProgressTracker+createSessionWithId"></a>

### progressTracker.createSessionWithId(sessionId, metadata) ⇒ <code>string</code>

Create a new progress session with specified ID

**Kind**: instance method of [<code>ProgressTracker</code>](#ProgressTracker)  
**Returns**: <code>string</code> - sessionId - The session identifier  

| Param | Type | Description |
| --- | --- | --- |
| sessionId | <code>string</code> | Unique session identifier |
| metadata | <code>Object</code> | Initial metadata for the session |

* * *

<a name="ProgressTracker+updateProgress"></a>

### progressTracker.updateProgress(sessionId, progress, message, additionalData) ⇒ <code>boolean</code>

Update progress for a session with throttled WebSocket events

**Kind**: instance method of [<code>ProgressTracker</code>](#ProgressTracker)  
**Returns**: <code>boolean</code> - Success status  

| Param | Type | Description |
| --- | --- | --- |
| sessionId | <code>string</code> | Session identifier |
| progress | <code>number</code> | Progress percentage (0-100) |
| message | <code>string</code> | Progress message |
| additionalData | <code>Object</code> | Additional metadata to include |

* * *

<a name="ProgressTracker+completeSession"></a>

### progressTracker.completeSession(sessionId, message, finalData) ⇒ <code>boolean</code>

Mark a session as completed and emit completion event

**Kind**: instance method of [<code>ProgressTracker</code>](#ProgressTracker)  
**Returns**: <code>boolean</code> - Success status  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| sessionId | <code>string</code> |  | Session identifier |
| message | <code>string</code> | <code>&quot;Operation completed&quot;</code> | Completion message |
| finalData | <code>Object</code> |  | Final metadata to include |

* * *

<a name="ProgressTracker+errorSession"></a>

### progressTracker.errorSession(sessionId, errorMessage, errorData) ⇒ <code>boolean</code>

Mark a session as errored and emit error event

**Kind**: instance method of [<code>ProgressTracker</code>](#ProgressTracker)  
**Returns**: <code>boolean</code> - Success status  

| Param | Type | Description |
| --- | --- | --- |
| sessionId | <code>string</code> | Session identifier |
| errorMessage | <code>string</code> | Error message |
| errorData | <code>Object</code> | Error details and metadata |

* * *

<a name="ProgressTracker+getSession"></a>

### progressTracker.getSession(sessionId) ⇒ <code>Object</code> \| <code>null</code>

Get session data by ID

**Kind**: instance method of [<code>ProgressTracker</code>](#ProgressTracker)  
**Returns**: <code>Object</code> \| <code>null</code> - Session object or null if not found  

| Param | Type | Description |
| --- | --- | --- |
| sessionId | <code>string</code> | Session identifier |

* * *

<a name="ProgressTracker+cleanupStaleSessions"></a>

### progressTracker.cleanupStaleSessions()

Clean up stale sessions that haven't been updated recently
Automatically called via setInterval in constructor

**Kind**: instance method of [<code>ProgressTracker</code>](#ProgressTracker)  

* * *

<a name="crypto"></a>

## crypto

HexTrackr Helper Functions
Standalone utility functions extracted from server.js for better modularity

**Kind**: global constant  

* * *

<a name="fs"></a>

## fs

PathValidator - Security utility for path validation
Prevents directory traversal attacks and validates file paths

**Kind**: global constant  

* * *

<a name="normalizeHostname"></a>

## normalizeHostname(hostname) ⇒ <code>string</code>

Normalize hostname for consistent deduplication
Handles IP addresses vs domain names appropriately

**Kind**: global function  
**Returns**: <code>string</code> - Normalized hostname  

| Param | Type | Description |
| --- | --- | --- |
| hostname | <code>string</code> | Raw hostname from CSV |

* * *

<a name="normalizeVendor"></a>

## normalizeVendor(vendor) ⇒ <code>string</code>

Normalize vendor names for consistent categorization

**Kind**: global function  
**Returns**: <code>string</code> - Normalized vendor name  

| Param | Type | Description |
| --- | --- | --- |
| vendor | <code>string</code> | Raw vendor name |

* * *

<a name="normalizeIPAddress"></a>

## normalizeIPAddress(ipAddress) ⇒ <code>string</code> \| <code>null</code>

Normalize IP address, handling multiple IPs and validation

**Kind**: global function  
**Returns**: <code>string</code> \| <code>null</code> - First valid IP address or null  

| Param | Type | Description |
| --- | --- | --- |
| ipAddress | <code>string</code> | Raw IP address string (may contain multiple IPs) |

* * *

<a name="isValidIPAddress"></a>

## isValidIPAddress(ip) ⇒ <code>boolean</code>

Validate if a string is a valid IP address

**Kind**: global function  
**Returns**: <code>boolean</code> - True if valid IP address  

| Param | Type | Description |
| --- | --- | --- |
| ip | <code>string</code> | IP address to validate |

* * *

<a name="createDescriptionHash"></a>

## createDescriptionHash(description) ⇒ <code>string</code>

Create a stable hash from description text for deduplication

**Kind**: global function  
**Returns**: <code>string</code> - Short hash string  

| Param | Type | Description |
| --- | --- | --- |
| description | <code>string</code> | Description text to hash |

* * *

<a name="extractScanDateFromFilename"></a>

## extractScanDateFromFilename(filename) ⇒ <code>string</code> \| <code>null</code>

Extract scan date from filename using various patterns

**Kind**: global function  
**Returns**: <code>string</code> \| <code>null</code> - Date in YYYY-MM-DD format or null if no pattern matches  

| Param | Type | Description |
| --- | --- | --- |
| filename | <code>string</code> | The CSV filename |

* * *

<a name="calculateDeduplicationConfidence"></a>

## calculateDeduplicationConfidence(uniqueKey) ⇒ <code>number</code>

Calculate confidence level for deduplication based on unique key type

**Kind**: global function  
**Returns**: <code>number</code> - Confidence percentage (0-100)  

| Param | Type | Description |
| --- | --- | --- |
| uniqueKey | <code>string</code> | The unique key to analyze |

* * *

<a name="getDeduplicationTier"></a>

## getDeduplicationTier(uniqueKey) ⇒ <code>number</code>

Get deduplication tier (1-5) based on unique key reliability

**Kind**: global function  
**Returns**: <code>number</code> - Tier number (1 = most stable, 5 = least stable)  

| Param | Type | Description |
| --- | --- | --- |
| uniqueKey | <code>string</code> | The unique key to analyze |

* * *

<a name="generateEnhancedUniqueKey"></a>

## generateEnhancedUniqueKey(mapped) ⇒ <code>string</code>

Generate enhanced multi-tier unique key for vulnerability deduplication

**Kind**: global function  
**Returns**: <code>string</code> - Enhanced unique key with tier prefix  

| Param | Type | Description |
| --- | --- | --- |
| mapped | <code>object</code> | Mapped vulnerability data object |

* * *

<a name="generateUniqueKey"></a>

## generateUniqueKey(mapped) ⇒ <code>string</code>

Legacy function maintained for backward compatibility during transition

**Kind**: global function  
**Returns**: <code>string</code> - Legacy unique key format  

| Param | Type | Description |
| --- | --- | --- |
| mapped | <code>object</code> | Mapped vulnerability data object |

* * *

<a name="mapVulnerabilityRow"></a>

## mapVulnerabilityRow(row) ⇒ <code>array</code>

Map CSV row data to vulnerability object structure

**Kind**: global function  
**Returns**: <code>array</code> - Array of mapped vulnerability objects (may contain multiple CVEs)  

| Param | Type | Description |
| --- | --- | --- |
| row | <code>object</code> | Raw CSV row data |

* * *

<a name="mapTicketRow"></a>

## mapTicketRow(row, index) ⇒ <code>object</code>

Map CSV row data to ticket object structure

**Kind**: global function  
**Returns**: <code>object</code> - Mapped ticket object  

| Param | Type | Description |
| --- | --- | --- |
| row | <code>object</code> | Raw CSV row data |
| index | <code>number</code> | Row index for generating fallback IDs |

* * *

<a name="findDocsSectionForFilename"></a>

## findDocsSectionForFilename(filename) ⇒ <code>string</code> \| <code>null</code>

Find a documentation section path for a given filename by scanning the content folder

**Kind**: global function  
**Returns**: <code>string</code> \| <code>null</code> - Relative section path or null if not found  

| Param | Type | Description |
| --- | --- | --- |
| filename | <code>string</code> | The filename to search for |

* * *

---

## Source: app/public/scripts/utils/**/*.js

## Modules

<table>
  <thead>
    <tr>
      <th>Module</th><th>Description</th>
    </tr>
  </thead>
  <tbody>
<tr>
    <td><a href="#module_AccessibilityAnnouncer">AccessibilityAnnouncer</a></td>
    <td><p>Accessibility Announcer Utility - T044
Provides ARIA live region management for screen reader announcements
Follows WCAG 2.1 guidelines for dynamic content announcement</p>
</td>
    </tr>
</tbody>
</table>

## Classes

<table>
  <thead>
    <tr>
      <th>Global</th><th>Description</th>
    </tr>
  </thead>
  <tbody>
<tr>
    <td><a href="#ChartThemeAdapter">ChartThemeAdapter</a></td>
    <td></td>
    </tr>
</tbody>
</table>

## Constants

<table>
  <thead>
    <tr>
      <th>Global</th><th>Description</th>
    </tr>
  </thead>
  <tbody>
<tr>
    <td><a href="#DARK_THEME_COLORS">DARK_THEME_COLORS</a></td>
    <td><p>HexTrackr Dark Theme Color Definitions
Extracted from dark-theme.css for testing</p>
</td>
    </tr>
<tr>
    <td><a href="#CRITICAL_COMBINATIONS">CRITICAL_COMBINATIONS</a></td>
    <td><p>Critical text/background combinations to test
These represent the most important UI elements for accessibility</p>
</td>
    </tr>
</tbody>
</table>

## Functions

<table>
  <thead>
    <tr>
      <th>Global</th><th>Description</th>
    </tr>
  </thead>
  <tbody>
<tr>
    <td><a href="#safeSetInnerHTML">safeSetInnerHTML(element, htmlContent)</a></td>
    <td><p>Safely set innerHTML with DOMPurify sanitization</p>
</td>
    </tr>
<tr>
    <td><a href="#escapeHtml">escapeHtml(text)</a> ⇒ <code>string</code></td>
    <td><p>Escape HTML entities to prevent XSS attacks</p>
</td>
    </tr>
<tr>
    <td><a href="#safeCreateElement">safeCreateElement(tagName, content, attributes)</a> ⇒ <code>HTMLElement</code></td>
    <td><p>Safely create element with sanitized content</p>
</td>
    </tr>
<tr>
    <td><a href="#testDarkThemeCompliance">testDarkThemeCompliance(verbose)</a> ⇒ <code>Object</code></td>
    <td><p>Run WCAG AA compliance test on all critical color combinations</p>
</td>
    </tr>
<tr>
    <td><a href="#generateRecommendations">generateRecommendations(criticalFailures, nonCriticalFailures)</a> ⇒ <code>Array</code></td>
    <td><p>Generate actionable recommendations for fixing accessibility issues</p>
</td>
    </tr>
<tr>
    <td><a href="#testColorCombination">testColorCombination(foreground, background, label)</a> ⇒ <code>Object</code></td>
    <td><p>Test specific color combination</p>
</td>
    </tr>
<tr>
    <td><a href="#hexToRgb">hexToRgb(hex)</a> ⇒ <code>Object</code></td>
    <td><p>Convert hex color to RGB values
Handles both 3-digit and 6-digit hex codes with or without #</p>
</td>
    </tr>
<tr>
    <td><a href="#calculateLuminance">calculateLuminance(rgb)</a> ⇒ <code>number</code></td>
    <td><p>Calculate relative luminance of a color per WCAG 2.1 formula</p>
</td>
    </tr>
<tr>
    <td><a href="#calculateContrastRatio">calculateContrastRatio(color1, color2)</a> ⇒ <code>number</code></td>
    <td><p>Calculate contrast ratio between two colors per WCAG 2.1</p>
</td>
    </tr>
<tr>
    <td><a href="#validateWCAGCompliance">validateWCAGCompliance(ratio, level, textSize)</a> ⇒ <code>Object</code></td>
    <td><p>Validate if contrast ratio meets WCAG standards</p>
</td>
    </tr>
<tr>
    <td><a href="#validateColorCombination">validateColorCombination(foreground, background, options)</a> ⇒ <code>Object</code></td>
    <td><p>Comprehensive contrast validation for a color combination</p>
</td>
    </tr>
<tr>
    <td><a href="#batchValidateColors">batchValidateColors(combinations, options)</a> ⇒ <code>Array</code></td>
    <td><p>Batch validate multiple color combinations</p>
</td>
    </tr>
<tr>
    <td><a href="#generateAccessibilityReport">generateAccessibilityReport(themeColors, level)</a> ⇒ <code>Object</code></td>
    <td><p>Generate accessibility report for theme colors</p>
</td>
    </tr>
<tr>
    <td><a href="#suggestImprovedColors">suggestImprovedColors(foreground, background, targetRatio)</a> ⇒ <code>Object</code></td>
    <td><p>Suggest improved colors for failing combinations</p>
</td>
    </tr>
</tbody>
</table>

<a name="module_AccessibilityAnnouncer"></a>

## AccessibilityAnnouncer

Accessibility Announcer Utility - T044
Provides ARIA live region management for screen reader announcements
Follows WCAG 2.1 guidelines for dynamic content announcement

**Version**: 1.0.0  

- [AccessibilityAnnouncer](#module_AccessibilityAnnouncer)
  - [.AccessibilityAnnouncer](#module_AccessibilityAnnouncer.AccessibilityAnnouncer)
    - [new exports.AccessibilityAnnouncer()](#new_module_AccessibilityAnnouncer.AccessibilityAnnouncer_new)
    - [.initializeLiveRegions()](#module_AccessibilityAnnouncer.AccessibilityAnnouncer+initializeLiveRegions) ⇒ <code>void</code>
    - [.announce(message, options)](#module_AccessibilityAnnouncer.AccessibilityAnnouncer+announce) ⇒ <code>boolean</code>
    - [.announceThemeChange(newTheme, previousTheme, source)](#module_AccessibilityAnnouncer.AccessibilityAnnouncer+announceThemeChange) ⇒ <code>boolean</code>
    - [.announceAccessibilityStatus(accessibilityReport, theme)](#module_AccessibilityAnnouncer.AccessibilityAnnouncer+announceAccessibilityStatus) ⇒ <code>boolean</code>
    - [.sanitizeMessage(message)](#module_AccessibilityAnnouncer.AccessibilityAnnouncer+sanitizeMessage) ⇒ <code>string</code> \| <code>null</code>
    - [.isDuplicateAnnouncement(announcement)](#module_AccessibilityAnnouncer.AccessibilityAnnouncer+isDuplicateAnnouncement) ⇒ <code>boolean</code>
    - [.queueAnnouncement(announcement)](#module_AccessibilityAnnouncer.AccessibilityAnnouncer+queueAnnouncement) ⇒ <code>boolean</code>
    - [.processAnnouncementQueue()](#module_AccessibilityAnnouncer.AccessibilityAnnouncer+processAnnouncementQueue) ⇒ <code>void</code>
    - [.performAnnouncement(announcement)](#module_AccessibilityAnnouncer.AccessibilityAnnouncer+performAnnouncement) ⇒ <code>boolean</code>
    - [.generateAnnouncementId()](#module_AccessibilityAnnouncer.AccessibilityAnnouncer+generateAnnouncementId) ⇒ <code>string</code>
    - [.getStats()](#module_AccessibilityAnnouncer.AccessibilityAnnouncer+getStats) ⇒ <code>Object</code>
    - [.clearQueue()](#module_AccessibilityAnnouncer.AccessibilityAnnouncer+clearQueue) ⇒ <code>void</code>
    - [.registerCleanup()](#module_AccessibilityAnnouncer.AccessibilityAnnouncer+registerCleanup) ⇒ <code>void</code>
    - [.destroy()](#module_AccessibilityAnnouncer.AccessibilityAnnouncer+destroy) ⇒ <code>void</code>

* * *

<a name="module_AccessibilityAnnouncer.AccessibilityAnnouncer"></a>

### AccessibilityAnnouncer.AccessibilityAnnouncer

ARIA live region manager for dynamic content announcements
Creates and manages invisible live regions for screen reader accessibility

**Kind**: static class of [<code>AccessibilityAnnouncer</code>](#module_AccessibilityAnnouncer)  

- [.AccessibilityAnnouncer](#module_AccessibilityAnnouncer.AccessibilityAnnouncer)
  - [new exports.AccessibilityAnnouncer()](#new_module_AccessibilityAnnouncer.AccessibilityAnnouncer_new)
  - [.initializeLiveRegions()](#module_AccessibilityAnnouncer.AccessibilityAnnouncer+initializeLiveRegions) ⇒ <code>void</code>
  - [.announce(message, options)](#module_AccessibilityAnnouncer.AccessibilityAnnouncer+announce) ⇒ <code>boolean</code>
  - [.announceThemeChange(newTheme, previousTheme, source)](#module_AccessibilityAnnouncer.AccessibilityAnnouncer+announceThemeChange) ⇒ <code>boolean</code>
  - [.announceAccessibilityStatus(accessibilityReport, theme)](#module_AccessibilityAnnouncer.AccessibilityAnnouncer+announceAccessibilityStatus) ⇒ <code>boolean</code>
  - [.sanitizeMessage(message)](#module_AccessibilityAnnouncer.AccessibilityAnnouncer+sanitizeMessage) ⇒ <code>string</code> \| <code>null</code>
  - [.isDuplicateAnnouncement(announcement)](#module_AccessibilityAnnouncer.AccessibilityAnnouncer+isDuplicateAnnouncement) ⇒ <code>boolean</code>
  - [.queueAnnouncement(announcement)](#module_AccessibilityAnnouncer.AccessibilityAnnouncer+queueAnnouncement) ⇒ <code>boolean</code>
  - [.processAnnouncementQueue()](#module_AccessibilityAnnouncer.AccessibilityAnnouncer+processAnnouncementQueue) ⇒ <code>void</code>
  - [.performAnnouncement(announcement)](#module_AccessibilityAnnouncer.AccessibilityAnnouncer+performAnnouncement) ⇒ <code>boolean</code>
  - [.generateAnnouncementId()](#module_AccessibilityAnnouncer.AccessibilityAnnouncer+generateAnnouncementId) ⇒ <code>string</code>
  - [.getStats()](#module_AccessibilityAnnouncer.AccessibilityAnnouncer+getStats) ⇒ <code>Object</code>
  - [.clearQueue()](#module_AccessibilityAnnouncer.AccessibilityAnnouncer+clearQueue) ⇒ <code>void</code>
  - [.registerCleanup()](#module_AccessibilityAnnouncer.AccessibilityAnnouncer+registerCleanup) ⇒ <code>void</code>
  - [.destroy()](#module_AccessibilityAnnouncer.AccessibilityAnnouncer+destroy) ⇒ <code>void</code>

* * *

<a name="new_module_AccessibilityAnnouncer.AccessibilityAnnouncer_new"></a>

#### new exports.AccessibilityAnnouncer()

Constructor - initializes live regions and announcement queue

* * *

<a name="module_AccessibilityAnnouncer.AccessibilityAnnouncer+initializeLiveRegions"></a>

#### accessibilityAnnouncer.initializeLiveRegions() ⇒ <code>void</code>

Initialize ARIA live regions in the DOM
Creates invisible but accessible regions for screen reader announcements

**Kind**: instance method of [<code>AccessibilityAnnouncer</code>](#module_AccessibilityAnnouncer.AccessibilityAnnouncer)  

* * *

<a name="module_AccessibilityAnnouncer.AccessibilityAnnouncer+announce"></a>

#### accessibilityAnnouncer.announce(message, options) ⇒ <code>boolean</code>

Announce message to screen readers with specified priority

**Kind**: instance method of [<code>AccessibilityAnnouncer</code>](#module_AccessibilityAnnouncer.AccessibilityAnnouncer)  
**Returns**: <code>boolean</code> - True if announcement was queued/announced, false otherwise  

| Param | Type | Description |
| --- | --- | --- |
| message | <code>string</code> | Message to announce |
| options | <code>Object</code> | Announcement options |
| options.priority | <code>string</code> | 'polite', 'assertive', or 'status' (default: 'polite') |
| options.immediate | <code>boolean</code> | Skip queue and announce immediately (default: false) |
| options.category | <code>string</code> | Category for duplicate filtering (default: 'general') |

* * *

<a name="module_AccessibilityAnnouncer.AccessibilityAnnouncer+announceThemeChange"></a>

#### accessibilityAnnouncer.announceThemeChange(newTheme, previousTheme, source) ⇒ <code>boolean</code>

Announce theme change specifically - T044 primary use case
Provides contextual information about the theme switch

**Kind**: instance method of [<code>AccessibilityAnnouncer</code>](#module_AccessibilityAnnouncer.AccessibilityAnnouncer)  
**Returns**: <code>boolean</code> - True if announcement was successful  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| newTheme | <code>string</code> |  | The new theme ('light' or 'dark') |
| previousTheme | <code>string</code> |  | The previous theme |
| source | <code>string</code> | <code>&quot;user&quot;</code> | Source of the change ('user', 'system', etc.) |

* * *

<a name="module_AccessibilityAnnouncer.AccessibilityAnnouncer+announceAccessibilityStatus"></a>

#### accessibilityAnnouncer.announceAccessibilityStatus(accessibilityReport, theme) ⇒ <code>boolean</code>

Announce accessibility compliance status - T044 enhancement
Informs users about WCAG compliance when theme changes

**Kind**: instance method of [<code>AccessibilityAnnouncer</code>](#module_AccessibilityAnnouncer.AccessibilityAnnouncer)  
**Returns**: <code>boolean</code> - True if announcement was successful  

| Param | Type | Description |
| --- | --- | --- |
| accessibilityReport | <code>Object</code> | Report from WCAG validator |
| theme | <code>string</code> | Current theme |

* * *

<a name="module_AccessibilityAnnouncer.AccessibilityAnnouncer+sanitizeMessage"></a>

#### accessibilityAnnouncer.sanitizeMessage(message) ⇒ <code>string</code> \| <code>null</code>

Sanitize message to prevent XSS and ensure safe announcement

**Kind**: instance method of [<code>AccessibilityAnnouncer</code>](#module_AccessibilityAnnouncer.AccessibilityAnnouncer)  
**Returns**: <code>string</code> \| <code>null</code> - Sanitized message or null if unsafe  

| Param | Type | Description |
| --- | --- | --- |
| message | <code>string</code> | Message to sanitize |

* * *

<a name="module_AccessibilityAnnouncer.AccessibilityAnnouncer+isDuplicateAnnouncement"></a>

#### accessibilityAnnouncer.isDuplicateAnnouncement(announcement) ⇒ <code>boolean</code>

Check if announcement is a duplicate to prevent spam

**Kind**: instance method of [<code>AccessibilityAnnouncer</code>](#module_AccessibilityAnnouncer.AccessibilityAnnouncer)  
**Returns**: <code>boolean</code> - True if this is a duplicate announcement  

| Param | Type | Description |
| --- | --- | --- |
| announcement | <code>Object</code> | Announcement to check |

* * *

<a name="module_AccessibilityAnnouncer.AccessibilityAnnouncer+queueAnnouncement"></a>

#### accessibilityAnnouncer.queueAnnouncement(announcement) ⇒ <code>boolean</code>

Add announcement to queue for processing

**Kind**: instance method of [<code>AccessibilityAnnouncer</code>](#module_AccessibilityAnnouncer.AccessibilityAnnouncer)  
**Returns**: <code>boolean</code> - True if queued successfully  

| Param | Type | Description |
| --- | --- | --- |
| announcement | <code>Object</code> | Announcement object |

* * *

<a name="module_AccessibilityAnnouncer.AccessibilityAnnouncer+processAnnouncementQueue"></a>

#### accessibilityAnnouncer.processAnnouncementQueue() ⇒ <code>void</code>

Process the announcement queue sequentially

**Kind**: instance method of [<code>AccessibilityAnnouncer</code>](#module_AccessibilityAnnouncer.AccessibilityAnnouncer)  

* * *

<a name="module_AccessibilityAnnouncer.AccessibilityAnnouncer+performAnnouncement"></a>

#### accessibilityAnnouncer.performAnnouncement(announcement) ⇒ <code>boolean</code>

Perform the actual announcement to screen readers

**Kind**: instance method of [<code>AccessibilityAnnouncer</code>](#module_AccessibilityAnnouncer.AccessibilityAnnouncer)  
**Returns**: <code>boolean</code> - True if announcement was performed  

| Param | Type | Description |
| --- | --- | --- |
| announcement | <code>Object</code> | Announcement object |

* * *

<a name="module_AccessibilityAnnouncer.AccessibilityAnnouncer+generateAnnouncementId"></a>

#### accessibilityAnnouncer.generateAnnouncementId() ⇒ <code>string</code>

Generate unique announcement ID for tracking

**Kind**: instance method of [<code>AccessibilityAnnouncer</code>](#module_AccessibilityAnnouncer.AccessibilityAnnouncer)  
**Returns**: <code>string</code> - Unique announcement identifier  

* * *

<a name="module_AccessibilityAnnouncer.AccessibilityAnnouncer+getStats"></a>

#### accessibilityAnnouncer.getStats() ⇒ <code>Object</code>

Get announcement statistics for monitoring

**Kind**: instance method of [<code>AccessibilityAnnouncer</code>](#module_AccessibilityAnnouncer.AccessibilityAnnouncer)  
**Returns**: <code>Object</code> - Statistics object  

* * *

<a name="module_AccessibilityAnnouncer.AccessibilityAnnouncer+clearQueue"></a>

#### accessibilityAnnouncer.clearQueue() ⇒ <code>void</code>

Clear announcement queue and reset state

**Kind**: instance method of [<code>AccessibilityAnnouncer</code>](#module_AccessibilityAnnouncer.AccessibilityAnnouncer)  

* * *

<a name="module_AccessibilityAnnouncer.AccessibilityAnnouncer+registerCleanup"></a>

#### accessibilityAnnouncer.registerCleanup() ⇒ <code>void</code>

Register cleanup handlers for page unload

**Kind**: instance method of [<code>AccessibilityAnnouncer</code>](#module_AccessibilityAnnouncer.AccessibilityAnnouncer)  

* * *

<a name="module_AccessibilityAnnouncer.AccessibilityAnnouncer+destroy"></a>

#### accessibilityAnnouncer.destroy() ⇒ <code>void</code>

Clean up resources and remove DOM elements

**Kind**: instance method of [<code>AccessibilityAnnouncer</code>](#module_AccessibilityAnnouncer.AccessibilityAnnouncer)  

* * *

<a name="ChartThemeAdapter"></a>

## ChartThemeAdapter

**Kind**: global class  

- [ChartThemeAdapter](#ChartThemeAdapter)
  - [new ChartThemeAdapter()](#new_ChartThemeAdapter_new)
  - [.detectCurrentTheme()](#ChartThemeAdapter+detectCurrentTheme) ⇒ <code>string</code>
  - [.getThemeConfig(theme)](#ChartThemeAdapter+getThemeConfig) ⇒ <code>Object</code>
  - [.getCSSVariables(theme)](#ChartThemeAdapter+getCSSVariables) ⇒ <code>Object</code>
  - [.getFallbackConfig(theme)](#ChartThemeAdapter+getFallbackConfig) ⇒ <code>Object</code>
  - [.getFallbackCSSVariables(theme)](#ChartThemeAdapter+getFallbackCSSVariables) ⇒ <code>Object</code>
  - [.getVulnerabilityColors(theme)](#ChartThemeAdapter+getVulnerabilityColors) ⇒ <code>Array</code>
  - [.updateChartTheme(chartInstance, theme, chartId)](#ChartThemeAdapter+updateChartTheme) ⇒ <code>Promise.&lt;boolean&gt;</code>
  - [.registerCharts(charts)](#ChartThemeAdapter+registerCharts) ⇒ <code>void</code>
  - [.updateAllCharts(theme)](#ChartThemeAdapter+updateAllCharts) ⇒ <code>Promise.&lt;Array&gt;</code>
  - [.applyGridTheme(gridApi, theme, gridId)](#ChartThemeAdapter+applyGridTheme) ⇒ <code>boolean</code>
  - [.applyGridThemeLegacy(gridApi, theme, gridId)](#ChartThemeAdapter+applyGridThemeLegacy) ⇒ <code>boolean</code>
  - [.registerGrids(grids)](#ChartThemeAdapter+registerGrids) ⇒ <code>void</code>
  - [.updateAllGrids(theme)](#ChartThemeAdapter+updateAllGrids) ⇒ <code>Array.&lt;boolean&gt;</code>
  - [.updateAllComponents(theme)](#ChartThemeAdapter+updateAllComponents) ⇒ <code>Promise.&lt;Object&gt;</code>
  - [.getCurrentTheme()](#ChartThemeAdapter+getCurrentTheme) ⇒ <code>string</code>
  - [.getRegistryStatus()](#ChartThemeAdapter+getRegistryStatus) ⇒ <code>Object</code>
  - [.clearRegistry()](#ChartThemeAdapter+clearRegistry) ⇒ <code>void</code>

* * *

<a name="new_ChartThemeAdapter_new"></a>

### new ChartThemeAdapter()

Creates an instance of ChartThemeAdapter.
T025: Initialize theme detection and chart registry

* * *

<a name="ChartThemeAdapter+detectCurrentTheme"></a>

### chartThemeAdapter.detectCurrentTheme() ⇒ <code>string</code>

Detect current theme from document element
T025: Theme detection logic

**Kind**: instance method of [<code>ChartThemeAdapter</code>](#ChartThemeAdapter)  
**Returns**: <code>string</code> - Current theme ('light' | 'dark')  

* * *

<a name="ChartThemeAdapter+getThemeConfig"></a>

### chartThemeAdapter.getThemeConfig(theme) ⇒ <code>Object</code>

Retrieves the theme configuration for ApexCharts based on the specified theme.
T025: Complete ApexCharts theme configuration with CSS custom properties

**Kind**: instance method of [<code>ChartThemeAdapter</code>](#ChartThemeAdapter)  
**Returns**: <code>Object</code> - The configuration object for ApexCharts compatible with the theme  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| theme | <code>string</code> | <code>&quot;light&quot;</code> | The theme to apply ('light' or 'dark') |

* * *

<a name="ChartThemeAdapter+getCSSVariables"></a>

### chartThemeAdapter.getCSSVariables(theme) ⇒ <code>Object</code>

Get CSS custom property values for theming
T025: CSS variable extraction for dynamic theming

**Kind**: instance method of [<code>ChartThemeAdapter</code>](#ChartThemeAdapter)  
**Returns**: <code>Object</code> - CSS variable values  

| Param | Type | Description |
| --- | --- | --- |
| theme | <code>string</code> | Theme name ('light' | 'dark') |

* * *

<a name="ChartThemeAdapter+getFallbackConfig"></a>

### chartThemeAdapter.getFallbackConfig(theme) ⇒ <code>Object</code>

Fallback theme configuration when CSS variables fail
T025: Error resilience for theme configuration

**Kind**: instance method of [<code>ChartThemeAdapter</code>](#ChartThemeAdapter)  
**Returns**: <code>Object</code> - Fallback configuration  

| Param | Type | Description |
| --- | --- | --- |
| theme | <code>string</code> | Theme name |

* * *

<a name="ChartThemeAdapter+getFallbackCSSVariables"></a>

### chartThemeAdapter.getFallbackCSSVariables(theme) ⇒ <code>Object</code>

Fallback CSS variables when extraction fails

**Kind**: instance method of [<code>ChartThemeAdapter</code>](#ChartThemeAdapter)  
**Returns**: <code>Object</code> - Fallback CSS variables  

| Param | Type | Description |
| --- | --- | --- |
| theme | <code>string</code> | Theme name |

* * *

<a name="ChartThemeAdapter+getVulnerabilityColors"></a>

### chartThemeAdapter.getVulnerabilityColors(theme) ⇒ <code>Array</code>

Get vulnerability-specific chart colors - S002

**Kind**: instance method of [<code>ChartThemeAdapter</code>](#ChartThemeAdapter)  
**Returns**: <code>Array</code> - Array of vulnerability severity colors [critical, high, medium, low]  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| theme | <code>string</code> | <code>&quot;light&quot;</code> | Theme name ('light' | 'dark') |

* * *

<a name="ChartThemeAdapter+updateChartTheme"></a>

### chartThemeAdapter.updateChartTheme(chartInstance, theme, chartId) ⇒ <code>Promise.&lt;boolean&gt;</code>

Updates the theme of an existing ApexCharts instance.
T025: Dynamic chart theme updates with performance optimization

**Kind**: instance method of [<code>ChartThemeAdapter</code>](#ChartThemeAdapter)  
**Returns**: <code>Promise.&lt;boolean&gt;</code> - True if update succeeded  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| chartInstance | <code>Object</code> |  | The ApexCharts instance to update |
| theme | <code>string</code> |  | The theme to apply ('light' or 'dark') |
| chartId | <code>string</code> | <code>null</code> | Optional chart identifier for registry |

* * *

<a name="ChartThemeAdapter+registerCharts"></a>

### chartThemeAdapter.registerCharts(charts) ⇒ <code>void</code>

Register multiple chart instances for bulk theme updates
T025: Chart instance management for bulk operations

**Kind**: instance method of [<code>ChartThemeAdapter</code>](#ChartThemeAdapter)  

| Param | Type | Description |
| --- | --- | --- |
| charts | <code>Object</code> | Object with chartId: chartInstance pairs |

* * *

<a name="ChartThemeAdapter+updateAllCharts"></a>

### chartThemeAdapter.updateAllCharts(theme) ⇒ <code>Promise.&lt;Array&gt;</code>

Update all registered charts to new theme
T025: Bulk chart theme updates for performance

**Kind**: instance method of [<code>ChartThemeAdapter</code>](#ChartThemeAdapter)  
**Returns**: <code>Promise.&lt;Array&gt;</code> - Results of all chart updates  

| Param | Type | Description |
| --- | --- | --- |
| theme | <code>string</code> | Theme to apply to all charts |

* * *

<a name="ChartThemeAdapter+applyGridTheme"></a>

### chartThemeAdapter.applyGridTheme(gridApi, theme, gridId) ⇒ <code>boolean</code>

Applies the specified theme to an AG-Grid instance using modern themeQuartz API.
T037: Modern AG-Grid theme switching with themeQuartz for smooth transitions

**Kind**: instance method of [<code>ChartThemeAdapter</code>](#ChartThemeAdapter)  
**Returns**: <code>boolean</code> - True if theme applied successfully  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| gridApi | <code>Object</code> |  | The AG-Grid API instance to update |
| theme | <code>string</code> |  | The theme to apply ('light' or 'dark') |
| gridId | <code>string</code> | <code>null</code> | Optional grid identifier for registry |

* * *

<a name="ChartThemeAdapter+applyGridThemeLegacy"></a>

### chartThemeAdapter.applyGridThemeLegacy(gridApi, theme, gridId) ⇒ <code>boolean</code>

Legacy fallback method for AG-Grid theme switching using CSS classes
T026: Backward compatibility for older AG-Grid setups

**Kind**: instance method of [<code>ChartThemeAdapter</code>](#ChartThemeAdapter)  
**Returns**: <code>boolean</code> - True if theme applied successfully  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| gridApi | <code>Object</code> |  | The AG-Grid API instance to update |
| theme | <code>string</code> |  | The theme to apply ('light' or 'dark') |
| gridId | <code>string</code> | <code>null</code> | Optional grid identifier for registry |

* * *

<a name="ChartThemeAdapter+registerGrids"></a>

### chartThemeAdapter.registerGrids(grids) ⇒ <code>void</code>

Register multiple AG-Grid instances for bulk theme updates
T026: Grid instance management for bulk operations

**Kind**: instance method of [<code>ChartThemeAdapter</code>](#ChartThemeAdapter)  

| Param | Type | Description |
| --- | --- | --- |
| grids | <code>Object</code> | Object with gridId: gridApi pairs |

* * *

<a name="ChartThemeAdapter+updateAllGrids"></a>

### chartThemeAdapter.updateAllGrids(theme) ⇒ <code>Array.&lt;boolean&gt;</code>

Update all registered grids to new theme
T026: Bulk grid theme updates

**Kind**: instance method of [<code>ChartThemeAdapter</code>](#ChartThemeAdapter)  
**Returns**: <code>Array.&lt;boolean&gt;</code> - Results of all grid updates  

| Param | Type | Description |
| --- | --- | --- |
| theme | <code>string</code> | Theme to apply to all grids |

* * *

<a name="ChartThemeAdapter+updateAllComponents"></a>

### chartThemeAdapter.updateAllComponents(theme) ⇒ <code>Promise.&lt;Object&gt;</code>

Update all registered charts and grids to new theme
T025/T026: Complete theme system update

**Kind**: instance method of [<code>ChartThemeAdapter</code>](#ChartThemeAdapter)  
**Returns**: <code>Promise.&lt;Object&gt;</code> - Results of updates  

| Param | Type | Description |
| --- | --- | --- |
| theme | <code>string</code> | Theme to apply ('light' or 'dark') |

* * *

<a name="ChartThemeAdapter+getCurrentTheme"></a>

### chartThemeAdapter.getCurrentTheme() ⇒ <code>string</code>

Get current theme state

**Kind**: instance method of [<code>ChartThemeAdapter</code>](#ChartThemeAdapter)  
**Returns**: <code>string</code> - Current theme ('light' or 'dark')  

* * *

<a name="ChartThemeAdapter+getRegistryStatus"></a>

### chartThemeAdapter.getRegistryStatus() ⇒ <code>Object</code>

Get registry status for debugging

**Kind**: instance method of [<code>ChartThemeAdapter</code>](#ChartThemeAdapter)  
**Returns**: <code>Object</code> - Registry information  

* * *

<a name="ChartThemeAdapter+clearRegistry"></a>

### chartThemeAdapter.clearRegistry() ⇒ <code>void</code>

Clear all registrations (useful for cleanup)

**Kind**: instance method of [<code>ChartThemeAdapter</code>](#ChartThemeAdapter)  

* * *

<a name="DARK_THEME_COLORS"></a>

## DARK\_THEME\_COLORS

HexTrackr Dark Theme Color Definitions
Extracted from dark-theme.css for testing

**Kind**: global constant  

* * *

<a name="CRITICAL_COMBINATIONS"></a>

## CRITICAL\_COMBINATIONS

Critical text/background combinations to test
These represent the most important UI elements for accessibility

**Kind**: global constant  

* * *

<a name="safeSetInnerHTML"></a>

## safeSetInnerHTML(element, htmlContent)

Safely set innerHTML with DOMPurify sanitization

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| element | <code>HTMLElement</code> | The DOM element to update |
| htmlContent | <code>string</code> | The HTML content to sanitize and inject |

* * *

<a name="escapeHtml"></a>

## escapeHtml(text) ⇒ <code>string</code>

Escape HTML entities to prevent XSS attacks

**Kind**: global function  
**Returns**: <code>string</code> - - The escaped text  

| Param | Type | Description |
| --- | --- | --- |
| text | <code>string</code> | The text to escape |

* * *

<a name="safeCreateElement"></a>

## safeCreateElement(tagName, content, attributes) ⇒ <code>HTMLElement</code>

Safely create element with sanitized content

**Kind**: global function  
**Returns**: <code>HTMLElement</code> - - The created element  

| Param | Type | Description |
| --- | --- | --- |
| tagName | <code>string</code> | The HTML tag name |
| content | <code>string</code> | The content to sanitize |
| attributes | <code>object</code> | Optional attributes to set |

* * *

<a name="testDarkThemeCompliance"></a>

## testDarkThemeCompliance(verbose) ⇒ <code>Object</code>

Run WCAG AA compliance test on all critical color combinations

**Kind**: global function  
**Returns**: <code>Object</code> - Test results with summary and violations  

| Param | Type | Description |
| --- | --- | --- |
| verbose | <code>boolean</code> | Include detailed results in output |

* * *

<a name="generateRecommendations"></a>

## generateRecommendations(criticalFailures, nonCriticalFailures) ⇒ <code>Array</code>

Generate actionable recommendations for fixing accessibility issues

**Kind**: global function  
**Returns**: <code>Array</code> - List of actionable recommendations  

| Param | Type | Description |
| --- | --- | --- |
| criticalFailures | <code>Array</code> | Critical accessibility violations |
| nonCriticalFailures | <code>Array</code> | Non-critical accessibility issues |

* * *

<a name="testColorCombination"></a>

## testColorCombination(foreground, background, label) ⇒ <code>Object</code>

Test specific color combination

**Kind**: global function  
**Returns**: <code>Object</code> - Detailed test result  

| Param | Type | Description |
| --- | --- | --- |
| foreground | <code>string</code> | Foreground color (hex) |
| background | <code>string</code> | Background color (hex) |
| label | <code>string</code> | Description of the combination |

* * *

<a name="hexToRgb"></a>

## hexToRgb(hex) ⇒ <code>Object</code>

Convert hex color to RGB values
Handles both 3-digit and 6-digit hex codes with or without #

**Kind**: global function  
**Returns**: <code>Object</code> - RGB values {r, g, b} or null if invalid  

| Param | Type | Description |
| --- | --- | --- |
| hex | <code>string</code> | Hex color code |

* * *

<a name="calculateLuminance"></a>

## calculateLuminance(rgb) ⇒ <code>number</code>

Calculate relative luminance of a color per WCAG 2.1 formula

**Kind**: global function  
**Returns**: <code>number</code> - Relative luminance (0-1)  

| Param | Type | Description |
| --- | --- | --- |
| rgb | <code>Object</code> | RGB color values {r, g, b} |

* * *

<a name="calculateContrastRatio"></a>

## calculateContrastRatio(color1, color2) ⇒ <code>number</code>

Calculate contrast ratio between two colors per WCAG 2.1

**Kind**: global function  
**Returns**: <code>number</code> - Contrast ratio (1-21)  

| Param | Type | Description |
| --- | --- | --- |
| color1 | <code>string</code> | First color (hex) |
| color2 | <code>string</code> | Second color (hex) |

* * *

<a name="validateWCAGCompliance"></a>

## validateWCAGCompliance(ratio, level, textSize) ⇒ <code>Object</code>

Validate if contrast ratio meets WCAG standards

**Kind**: global function  
**Returns**: <code>Object</code> - Validation result  

| Param | Type | Description |
| --- | --- | --- |
| ratio | <code>number</code> | Contrast ratio to validate |
| level | <code>string</code> | WCAG level ('AA' or 'AAA') |
| textSize | <code>string</code> | Text size ('normal' or 'large') |

* * *

<a name="validateColorCombination"></a>

## validateColorCombination(foreground, background, options) ⇒ <code>Object</code>

Comprehensive contrast validation for a color combination

**Kind**: global function  
**Returns**: <code>Object</code> - Complete validation results  

| Param | Type | Description |
| --- | --- | --- |
| foreground | <code>string</code> | Foreground color (hex) |
| background | <code>string</code> | Background color (hex) |
| options | <code>Object</code> | Validation options |

* * *

<a name="batchValidateColors"></a>

## batchValidateColors(combinations, options) ⇒ <code>Array</code>

Batch validate multiple color combinations

**Kind**: global function  
**Returns**: <code>Array</code> - Array of validation results  

| Param | Type | Description |
| --- | --- | --- |
| combinations | <code>Array</code> | Array of {fg, bg, label} objects |
| options | <code>Object</code> | Validation options |

* * *

<a name="generateAccessibilityReport"></a>

## generateAccessibilityReport(themeColors, level) ⇒ <code>Object</code>

Generate accessibility report for theme colors

**Kind**: global function  
**Returns**: <code>Object</code> - Accessibility report  

| Param | Type | Description |
| --- | --- | --- |
| themeColors | <code>Object</code> | Theme color definitions |
| level | <code>string</code> | WCAG level to validate against |

* * *

<a name="suggestImprovedColors"></a>

## suggestImprovedColors(foreground, background, targetRatio) ⇒ <code>Object</code>

Suggest improved colors for failing combinations

**Kind**: global function  
**Returns**: <code>Object</code> - Color suggestions  

| Param | Type | Description |
| --- | --- | --- |
| foreground | <code>string</code> | Current foreground color |
| background | <code>string</code> | Current background color |
| targetRatio | <code>number</code> | Target contrast ratio |

* * *

---
