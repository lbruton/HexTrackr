# Frontend Shared

This section contains API documentation for Frontend Shared.

## Source: app/public/scripts/shared/**/*.js

## Classes

<table>
  <thead>
    <tr>
      <th>Global</th><th>Description</th>
    </tr>
  </thead>
  <tbody>
<tr>
    <td><a href="#HeaderThemeManager">HeaderThemeManager</a></td>
    <td></td>
    </tr>
<tr>
    <td><a href="#ModalMonitor">ModalMonitor</a></td>
    <td><p>Modal Monitoring and Instrumentation System
Provides comprehensive monitoring for modal operations</p>
</td>
    </tr>
<tr>
    <td><a href="#ModalMonitorIntegration">ModalMonitorIntegration</a></td>
    <td><p>Modal Monitor Integration Helper
Provides easy integration with existing modal system</p>
</td>
    </tr>
<tr>
    <td><a href="#PaginationController">PaginationController</a></td>
    <td><p>PaginationController - Handles pagination logic and UI generation</p>
<p>Usage:</p>
<pre><code class="language-javascript">const pagination = new PaginationController(12, [6, 12, 24, 48]);
pagination.setTotalItems(150);
pagination.renderPaginationControls(&#39;pagination-container&#39;,
  () =&gt; renderCurrentPage(),
  () =&gt; renderCurrentPage()
);
</code></pre>
</td>
    </tr>
<tr>
    <td><a href="#ProgressModal">ProgressModal</a></td>
    <td><p>Real-time Progress Modal Class</p>
</td>
    </tr>
<tr>
    <td><a href="#ThemeController">ThemeController</a></td>
    <td><p>ThemeController class for managing dark/light theme switching in HexTrackr.
Handles system preference detection, theme persistence, and event listening.</p>
</td>
    </tr>
<tr>
    <td><a href="#ToastManager">ToastManager</a></td>
    <td><p>Toast Manager class for handling all user notifications
Provides consistent UI feedback across the application</p>
</td>
    </tr>
<tr>
    <td><a href="#VulnerabilityCardsManager">VulnerabilityCardsManager</a></td>
    <td><p>Manages device cards and vulnerability cards rendering with pagination</p>
</td>
    </tr>
<tr>
    <td><a href="#VulnerabilityChartManager">VulnerabilityChartManager</a></td>
    <td><p>VulnerabilityChartManager - Manages vulnerability chart lifecycle
Extends EventTarget for event-driven communication with other components</p>
</td>
    </tr>
<tr>
    <td><a href="#VulnerabilityCoreOrchestrator">VulnerabilityCoreOrchestrator</a></td>
    <td><p>Central orchestrator for vulnerability management system
Coordinates between all extracted modules and handles cross-cutting concerns</p>
</td>
    </tr>
<tr>
    <td><a href="#VulnerabilityDataManager">VulnerabilityDataManager</a></td>
    <td><p>VulnerabilityDataManager - Centralized data management for vulnerability system</p>
<p>Usage:</p>
<pre><code class="language-javascript">const dataManager = new VulnerabilityDataManager(&#39;/api&#39;);
await dataManager.loadData();
const filteredData = dataManager.filterData(&#39;searchTerm&#39;, &#39;Critical&#39;);
</code></pre>
</td>
    </tr>
<tr>
    <td><a href="#VulnerabilityGridManager">VulnerabilityGridManager</a></td>
    <td><p>Manages all AG Grid operations for vulnerability data display</p>
</td>
    </tr>
<tr>
    <td><a href="#VulnerabilitySearchManager">VulnerabilitySearchManager</a></td>
    <td><p>Manages vulnerability search, filtering, and external lookup operations</p>
</td>
    </tr>
<tr>
    <td><a href="#WebSocketClient">WebSocketClient</a></td>
    <td><p>WebSocket client class for real-time progress tracking</p>
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
    <td><a href="#headerThemeManager">headerThemeManager</a></td>
    <td><p>Auto-initialize header theme management when module loads
This ensures theme toggles work on all pages that include this script</p>
</td>
    </tr>
<tr>
    <td><a href="#VPR_COLORS">VPR_COLORS</a></td>
    <td><p>Vulnerability Color Constants
Single source of truth for VPR severity colors
These values match the CSS variables defined in vulnerabilities.css</p>
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
    <td><a href="#debounce">debounce(func, delay)</a> ⇒ <code>function</code></td>
    <td><p>Debounce function to limit the rate at which a function gets called.
This is crucial for performance on events that fire rapidly, like window resize.</p>
</td>
    </tr>
<tr>
    <td><a href="#createVulnerabilityGridOptions">createVulnerabilityGridOptions(componentContext, isDarkMode)</a> ⇒ <code>GridOptions</code></td>
    <td><p>Creates and returns the complete AG Grid configuration object.</p>
</td>
    </tr>
<tr>
    <td><a href="#createFallbackFooter">createFallbackFooter(container)</a></td>
    <td><p>Creates a safe fallback footer using DOM methods with badges</p>
</td>
    </tr>
<tr>
    <td><a href="#escapeHtml">escapeHtml(text)</a> ⇒ <code>string</code></td>
    <td><p>Escape HTML characters to prevent XSS attacks</p>
</td>
    </tr>
<tr>
    <td><a href="#getVPRColors">getVPRColors(theme)</a> ⇒ <code>Array.&lt;string&gt;</code></td>
    <td><p>Get severity colors for the current theme</p>
</td>
    </tr>
<tr>
    <td><a href="#getSeverityColor">getSeverityColor(severity, theme)</a> ⇒ <code>Object</code></td>
    <td><p>Get color configuration for a specific severity</p>
</td>
    </tr>
<tr>
    <td><a href="#getVPRColorsFromCSS">getVPRColorsFromCSS()</a> ⇒ <code>Array.&lt;string&gt;</code></td>
    <td><p>Get colors from CSS variables (dynamic, theme-aware)</p>
</td>
    </tr>
<tr>
    <td><a href="#getCurrentTheme">getCurrentTheme()</a> ⇒ <code>string</code></td>
    <td><p>Get the current theme from document body</p>
</td>
    </tr>
</tbody>
</table>

<a name="HeaderThemeManager"></a>

## HeaderThemeManager

**Kind**: global class  

* [HeaderThemeManager](#HeaderThemeManager)
  * [new HeaderThemeManager()](#new_HeaderThemeManager_new)
  * [.HeaderThemeManager](#HeaderThemeManager+HeaderThemeManager)
    * [new exports.HeaderThemeManager()](#new_HeaderThemeManager+HeaderThemeManager_new)
  * [.init()](#HeaderThemeManager+init) ⇒ <code>void</code>
  * [.initializeToggles()](#HeaderThemeManager+initializeToggles) ⇒ <code>void</code>
  * [.applyInitialTheme()](#HeaderThemeManager+applyInitialTheme) ⇒ <code>void</code>
  * [.toggleToDark()](#HeaderThemeManager+toggleToDark) ⇒ <code>void</code>
  * [.toggleToLight()](#HeaderThemeManager+toggleToLight) ⇒ <code>void</code>
  * [.updateToggleVisibility(currentTheme)](#HeaderThemeManager+updateToggleVisibility) ⇒ <code>void</code>
  * [.getThemeController()](#HeaderThemeManager+getThemeController) ⇒ [<code>ThemeController</code>](#ThemeController)
  * [.isInitialized()](#HeaderThemeManager+isInitialized) ⇒ <code>boolean</code>

* * *

<a name="new_HeaderThemeManager_new"></a>

### new HeaderThemeManager()

Header Theme Manager - manages theme toggle UI in navigation header

* * *

<a name="HeaderThemeManager+HeaderThemeManager"></a>

### headerThemeManager.HeaderThemeManager

**Kind**: instance class of [<code>HeaderThemeManager</code>](#HeaderThemeManager)  

* * *

<a name="new_HeaderThemeManager+HeaderThemeManager_new"></a>

#### new exports.HeaderThemeManager()

Initialize header theme management

* * *

<a name="HeaderThemeManager+init"></a>

### headerThemeManager.init() ⇒ <code>void</code>

Initialize theme toggles after DOM is loaded
T023: Theme toggle UI button integration

**Kind**: instance method of [<code>HeaderThemeManager</code>](#HeaderThemeManager)  

* * *

<a name="HeaderThemeManager+initializeToggles"></a>

### headerThemeManager.initializeToggles() ⇒ <code>void</code>

Initialize theme toggle elements and event listeners

**Kind**: instance method of [<code>HeaderThemeManager</code>](#HeaderThemeManager)  

* * *

<a name="HeaderThemeManager+applyInitialTheme"></a>

### headerThemeManager.applyInitialTheme() ⇒ <code>void</code>

Apply initial theme on page load

**Kind**: instance method of [<code>HeaderThemeManager</code>](#HeaderThemeManager)  

* * *

<a name="HeaderThemeManager+toggleToDark"></a>

### headerThemeManager.toggleToDark() ⇒ <code>void</code>

Toggle to dark theme

**Kind**: instance method of [<code>HeaderThemeManager</code>](#HeaderThemeManager)  

* * *

<a name="HeaderThemeManager+toggleToLight"></a>

### headerThemeManager.toggleToLight() ⇒ <code>void</code>

Toggle to light theme

**Kind**: instance method of [<code>HeaderThemeManager</code>](#HeaderThemeManager)  

* * *

<a name="HeaderThemeManager+updateToggleVisibility"></a>

### headerThemeManager.updateToggleVisibility(currentTheme) ⇒ <code>void</code>

Update theme toggle visibility based on current theme
T023: Show/hide appropriate toggle buttons

**Kind**: instance method of [<code>HeaderThemeManager</code>](#HeaderThemeManager)  

| Param | Type | Description |
| --- | --- | --- |
| currentTheme | <code>string</code> | Current active theme ('light' | 'dark') |

* * *

<a name="HeaderThemeManager+getThemeController"></a>

### headerThemeManager.getThemeController() ⇒ [<code>ThemeController</code>](#ThemeController)

Get current theme controller instance

**Kind**: instance method of [<code>HeaderThemeManager</code>](#HeaderThemeManager)  
**Returns**: [<code>ThemeController</code>](#ThemeController) - The theme controller instance  

* * *

<a name="HeaderThemeManager+isInitialized"></a>

### headerThemeManager.isInitialized() ⇒ <code>boolean</code>

Check if header theme manager is initialized

**Kind**: instance method of [<code>HeaderThemeManager</code>](#HeaderThemeManager)  
**Returns**: <code>boolean</code> - True if initialized  

* * *

<a name="ModalMonitor"></a>

## ModalMonitor

Modal Monitoring and Instrumentation System
Provides comprehensive monitoring for modal operations

**Kind**: global class  

* [ModalMonitor](#ModalMonitor)
  * [.init()](#ModalMonitor+init)
  * [.startMemoryMonitoring()](#ModalMonitor+startMemoryMonitoring)
  * [.recordMemorySnapshot()](#ModalMonitor+recordMemorySnapshot)
  * [.reportMemoryLeak()](#ModalMonitor+reportMemoryLeak)
  * [.instrumentPerformanceAPIs()](#ModalMonitor+instrumentPerformanceAPIs)
  * [.setupErrorTracking()](#ModalMonitor+setupErrorTracking)
  * [.trackModalOperationStart()](#ModalMonitor+trackModalOperationStart)
  * [.trackModalOperationEnd()](#ModalMonitor+trackModalOperationEnd)
  * [.reportPerformanceIssue()](#ModalMonitor+reportPerformanceIssue)
  * [.logError()](#ModalMonitor+logError)
  * [.trimMetricsArrays()](#ModalMonitor+trimMetricsArrays)
  * [.startPeriodicReporting()](#ModalMonitor+startPeriodicReporting)
  * [.generatePerformanceReport()](#ModalMonitor+generatePerformanceReport)
  * [.calculatePerformanceStats()](#ModalMonitor+calculatePerformanceStats)
  * [.calculateMemoryStats()](#ModalMonitor+calculateMemoryStats)
  * [.calculateStats()](#ModalMonitor+calculateStats)
  * [.getRecentErrors()](#ModalMonitor+getRecentErrors)
  * [.calculateHealthScore()](#ModalMonitor+calculateHealthScore)
  * [.getStatus()](#ModalMonitor+getStatus)
  * [.getMetrics()](#ModalMonitor+getMetrics)
  * [.dispatchEvent()](#ModalMonitor+dispatchEvent)
  * [.formatBytes()](#ModalMonitor+formatBytes)
  * [.destroy()](#ModalMonitor+destroy)

* * *

<a name="ModalMonitor+init"></a>

### modalMonitor.init()

Initialize monitoring system

**Kind**: instance method of [<code>ModalMonitor</code>](#ModalMonitor)  

* * *

<a name="ModalMonitor+startMemoryMonitoring"></a>

### modalMonitor.startMemoryMonitoring()

Start memory monitoring

**Kind**: instance method of [<code>ModalMonitor</code>](#ModalMonitor)  

* * *

<a name="ModalMonitor+recordMemorySnapshot"></a>

### modalMonitor.recordMemorySnapshot()

Record memory snapshot

**Kind**: instance method of [<code>ModalMonitor</code>](#ModalMonitor)  

* * *

<a name="ModalMonitor+reportMemoryLeak"></a>

### modalMonitor.reportMemoryLeak()

Report memory leak detection

**Kind**: instance method of [<code>ModalMonitor</code>](#ModalMonitor)  

* * *

<a name="ModalMonitor+instrumentPerformanceAPIs"></a>

### modalMonitor.instrumentPerformanceAPIs()

Instrument performance APIs for modal operations

**Kind**: instance method of [<code>ModalMonitor</code>](#ModalMonitor)  

* * *

<a name="ModalMonitor+setupErrorTracking"></a>

### modalMonitor.setupErrorTracking()

Setup error tracking

**Kind**: instance method of [<code>ModalMonitor</code>](#ModalMonitor)  

* * *

<a name="ModalMonitor+trackModalOperationStart"></a>

### modalMonitor.trackModalOperationStart()

Track modal operation start

**Kind**: instance method of [<code>ModalMonitor</code>](#ModalMonitor)  

* * *

<a name="ModalMonitor+trackModalOperationEnd"></a>

### modalMonitor.trackModalOperationEnd()

Track modal operation end

**Kind**: instance method of [<code>ModalMonitor</code>](#ModalMonitor)  

* * *

<a name="ModalMonitor+reportPerformanceIssue"></a>

### modalMonitor.reportPerformanceIssue()

Report performance issue

**Kind**: instance method of [<code>ModalMonitor</code>](#ModalMonitor)  

* * *

<a name="ModalMonitor+logError"></a>

### modalMonitor.logError()

Log error to error tracking system

**Kind**: instance method of [<code>ModalMonitor</code>](#ModalMonitor)  

* * *

<a name="ModalMonitor+trimMetricsArrays"></a>

### modalMonitor.trimMetricsArrays()

Trim metrics arrays to prevent memory issues

**Kind**: instance method of [<code>ModalMonitor</code>](#ModalMonitor)  

* * *

<a name="ModalMonitor+startPeriodicReporting"></a>

### modalMonitor.startPeriodicReporting()

Start periodic reporting

**Kind**: instance method of [<code>ModalMonitor</code>](#ModalMonitor)  

* * *

<a name="ModalMonitor+generatePerformanceReport"></a>

### modalMonitor.generatePerformanceReport()

Generate performance report

**Kind**: instance method of [<code>ModalMonitor</code>](#ModalMonitor)  

* * *

<a name="ModalMonitor+calculatePerformanceStats"></a>

### modalMonitor.calculatePerformanceStats()

Calculate performance statistics

**Kind**: instance method of [<code>ModalMonitor</code>](#ModalMonitor)  

* * *

<a name="ModalMonitor+calculateMemoryStats"></a>

### modalMonitor.calculateMemoryStats()

Calculate memory statistics

**Kind**: instance method of [<code>ModalMonitor</code>](#ModalMonitor)  

* * *

<a name="ModalMonitor+calculateStats"></a>

### modalMonitor.calculateStats()

Calculate basic statistics for array

**Kind**: instance method of [<code>ModalMonitor</code>](#ModalMonitor)  

* * *

<a name="ModalMonitor+getRecentErrors"></a>

### modalMonitor.getRecentErrors()

Get recent errors

**Kind**: instance method of [<code>ModalMonitor</code>](#ModalMonitor)  

* * *

<a name="ModalMonitor+calculateHealthScore"></a>

### modalMonitor.calculateHealthScore()

Calculate overall health score (0-100)

**Kind**: instance method of [<code>ModalMonitor</code>](#ModalMonitor)  

* * *

<a name="ModalMonitor+getStatus"></a>

### modalMonitor.getStatus()

Get current monitoring status

**Kind**: instance method of [<code>ModalMonitor</code>](#ModalMonitor)  

* * *

<a name="ModalMonitor+getMetrics"></a>

### modalMonitor.getMetrics()

Get all metrics data

**Kind**: instance method of [<code>ModalMonitor</code>](#ModalMonitor)  

* * *

<a name="ModalMonitor+dispatchEvent"></a>

### modalMonitor.dispatchEvent()

Dispatch custom event

**Kind**: instance method of [<code>ModalMonitor</code>](#ModalMonitor)  

* * *

<a name="ModalMonitor+formatBytes"></a>

### modalMonitor.formatBytes()

Format bytes for human reading

**Kind**: instance method of [<code>ModalMonitor</code>](#ModalMonitor)  

* * *

<a name="ModalMonitor+destroy"></a>

### modalMonitor.destroy()

Clean up monitoring

**Kind**: instance method of [<code>ModalMonitor</code>](#ModalMonitor)  

* * *

<a name="ModalMonitorIntegration"></a>

## ModalMonitorIntegration

Modal Monitor Integration Helper
Provides easy integration with existing modal system

**Kind**: global class  

* * *

<a name="PaginationController"></a>

## PaginationController

PaginationController - Handles pagination logic and UI generation

Usage:

```javascript
const pagination = new PaginationController(12, [6, 12, 24, 48]);
pagination.setTotalItems(150);
pagination.renderPaginationControls('pagination-container', 
  () => renderCurrentPage(), 
  () => renderCurrentPage()
);
```

**Kind**: global class  

* * *

<a name="ProgressModal"></a>

## ProgressModal

Real-time Progress Modal Class

**Kind**: global class  

* [ProgressModal](#ProgressModal)
  * [.createModalHTML()](#ProgressModal+createModalHTML)
  * [.setupEventListeners()](#ProgressModal+setupEventListeners)
  * [.setupWebSocketListeners()](#ProgressModal+setupWebSocketListeners)
  * [.removeWebSocketListeners()](#ProgressModal+removeWebSocketListeners)
  * [.show(options)](#ProgressModal+show)
  * [.hide()](#ProgressModal+hide)
  * [.update(data)](#ProgressModal+update)
  * [.handleProgressUpdate(data)](#ProgressModal+handleProgressUpdate)
  * [.handleProgressStatus(data)](#ProgressModal+handleProgressStatus)
  * [.handleProgressComplete(data)](#ProgressModal+handleProgressComplete)
  * [.handleWebSocketError()](#ProgressModal+handleWebSocketError)
  * [.updateUI()](#ProgressModal+updateUI)
  * [.showSuccess(message)](#ProgressModal+showSuccess)
  * [.showError(message)](#ProgressModal+showError)
  * [.showCompleteButtons()](#ProgressModal+showCompleteButtons)
  * [.handleCancel()](#ProgressModal+handleCancel)
  * [.showCancelConfirmation()](#ProgressModal+showCancelConfirmation)
  * [.handleClose()](#ProgressModal+handleClose)
  * [.isActiveProgress()](#ProgressModal+isActiveProgress) ⇒ <code>boolean</code>
  * [.resetProgressState()](#ProgressModal+resetProgressState)
  * [.cleanup()](#ProgressModal+cleanup)
  * [.destroy()](#ProgressModal+destroy)

* * *

<a name="ProgressModal+createModalHTML"></a>

### progressModal.createModalHTML()

Create the modal HTML structure following HexTrackr patterns

**Kind**: instance method of [<code>ProgressModal</code>](#ProgressModal)  

* * *

<a name="ProgressModal+setupEventListeners"></a>

### progressModal.setupEventListeners()

Setup event listeners for modal interactions

**Kind**: instance method of [<code>ProgressModal</code>](#ProgressModal)  

* * *

<a name="ProgressModal+setupWebSocketListeners"></a>

### progressModal.setupWebSocketListeners()

Setup WebSocket event listeners

**Kind**: instance method of [<code>ProgressModal</code>](#ProgressModal)  

* * *

<a name="ProgressModal+removeWebSocketListeners"></a>

### progressModal.removeWebSocketListeners()

Remove WebSocket event listeners

**Kind**: instance method of [<code>ProgressModal</code>](#ProgressModal)  

* * *

<a name="ProgressModal+show"></a>

### progressModal.show(options)

Show the progress modal

**Kind**: instance method of [<code>ProgressModal</code>](#ProgressModal)  

| Param | Type | Description |
| --- | --- | --- |
| options | <code>Object</code> | Configuration options |
| options.title | <code>string</code> | Modal title |
| options.sessionId | <code>string</code> | Session ID for WebSocket room |
| options.allowCancel | <code>boolean</code> | Whether to show cancel button |
| options.onCancel | <code>function</code> | Callback for cancel action |
| options.initialMessage | <code>string</code> | Initial status message |

* * *

<a name="ProgressModal+hide"></a>

### progressModal.hide()

Hide the progress modal

**Kind**: instance method of [<code>ProgressModal</code>](#ProgressModal)  

* * *

<a name="ProgressModal+update"></a>

### progressModal.update(data)

Update progress manually (for non-WebSocket usage)

**Kind**: instance method of [<code>ProgressModal</code>](#ProgressModal)  

| Param | Type | Description |
| --- | --- | --- |
| data | <code>Object</code> | Progress data |

* * *

<a name="ProgressModal+handleProgressUpdate"></a>

### progressModal.handleProgressUpdate(data)

Handle progress updates from WebSocket

**Kind**: instance method of [<code>ProgressModal</code>](#ProgressModal)  

| Param | Type | Description |
| --- | --- | --- |
| data | <code>Object</code> | Progress data from WebSocket |

* * *

<a name="ProgressModal+handleProgressStatus"></a>

### progressModal.handleProgressStatus(data)

Handle status updates from WebSocket

**Kind**: instance method of [<code>ProgressModal</code>](#ProgressModal)  

| Param | Type | Description |
| --- | --- | --- |
| data | <code>Object</code> | Status data from WebSocket |

* * *

<a name="ProgressModal+handleProgressComplete"></a>

### progressModal.handleProgressComplete(data)

Handle progress completion from WebSocket

**Kind**: instance method of [<code>ProgressModal</code>](#ProgressModal)  

| Param | Type | Description |
| --- | --- | --- |
| data | <code>Object</code> | Completion data from WebSocket |

* * *

<a name="ProgressModal+handleWebSocketError"></a>

### progressModal.handleWebSocketError()

Handle WebSocket connection errors

**Kind**: instance method of [<code>ProgressModal</code>](#ProgressModal)  

* * *

<a name="ProgressModal+updateUI"></a>

### progressModal.updateUI()

Update the UI with current progress data

**Kind**: instance method of [<code>ProgressModal</code>](#ProgressModal)  

* * *

<a name="ProgressModal+showSuccess"></a>

### progressModal.showSuccess(message)

Show success state

**Kind**: instance method of [<code>ProgressModal</code>](#ProgressModal)  

| Param | Type | Description |
| --- | --- | --- |
| message | <code>string</code> | Success message |

* * *

<a name="ProgressModal+showError"></a>

### progressModal.showError(message)

Show error state

**Kind**: instance method of [<code>ProgressModal</code>](#ProgressModal)  

| Param | Type | Description |
| --- | --- | --- |
| message | <code>string</code> | Error message |

* * *

<a name="ProgressModal+showCompleteButtons"></a>

### progressModal.showCompleteButtons()

Show completion buttons (hide cancel, show close)

**Kind**: instance method of [<code>ProgressModal</code>](#ProgressModal)  

* * *

<a name="ProgressModal+handleCancel"></a>

### progressModal.handleCancel()

Handle cancel button click

**Kind**: instance method of [<code>ProgressModal</code>](#ProgressModal)  

* * *

<a name="ProgressModal+showCancelConfirmation"></a>

### progressModal.showCancelConfirmation()

Show cancel confirmation dialog

**Kind**: instance method of [<code>ProgressModal</code>](#ProgressModal)  

* * *

<a name="ProgressModal+handleClose"></a>

### progressModal.handleClose()

Handle close button click

**Kind**: instance method of [<code>ProgressModal</code>](#ProgressModal)  

* * *

<a name="ProgressModal+isActiveProgress"></a>

### progressModal.isActiveProgress() ⇒ <code>boolean</code>

Check if progress is actively running

**Kind**: instance method of [<code>ProgressModal</code>](#ProgressModal)  
**Returns**: <code>boolean</code> - True if progress is active  

* * *

<a name="ProgressModal+resetProgressState"></a>

### progressModal.resetProgressState()

Reset progress state to initial values

**Kind**: instance method of [<code>ProgressModal</code>](#ProgressModal)  

* * *

<a name="ProgressModal+cleanup"></a>

### progressModal.cleanup()

Cleanup resources when modal is hidden

**Kind**: instance method of [<code>ProgressModal</code>](#ProgressModal)  

* * *

<a name="ProgressModal+destroy"></a>

### progressModal.destroy()

Destroy the modal and remove all event listeners

**Kind**: instance method of [<code>ProgressModal</code>](#ProgressModal)  

* * *

<a name="ToastManager"></a>

## ToastManager

Toast Manager class for handling all user notifications
Provides consistent UI feedback across the application

**Kind**: global class  

* [ToastManager](#ToastManager)
  * [.showToast(message, [type], [options])](#ToastManager+showToast) ⇒ <code>string</code>
  * [.showLoading(message, [options])](#ToastManager+showLoading) ⇒ <code>string</code>
  * [.hideLoading()](#ToastManager+hideLoading)
  * [.showError(message, [error], [options])](#ToastManager+showError)
  * [.showSuccess(message, [options])](#ToastManager+showSuccess)
  * [.showWarning(message, [options])](#ToastManager+showWarning)
  * [.showInfo(message, [options])](#ToastManager+showInfo)
  * [.showCVEStatus(cveId, status, [data])](#ToastManager+showCVEStatus)
  * [.clearAll()](#ToastManager+clearAll)
  * [.showModalError(modalId, message, [options])](#ToastManager+showModalError)
  * [.clearModalErrors(modalId)](#ToastManager+clearModalErrors)

* * *

<a name="ToastManager+showToast"></a>

### toastManager.showToast(message, [type], [options]) ⇒ <code>string</code>

Show a toast notification

**Kind**: instance method of [<code>ToastManager</code>](#ToastManager)  
**Returns**: <code>string</code> - Toast ID for reference  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| message | <code>string</code> |  | Message to display |
| [type] | <code>string</code> | <code>&quot;&#x27;info&#x27;&quot;</code> | Type: success, error, warning, info, danger |
| [options] | <code>Object</code> |  | Additional options |

* * *

<a name="ToastManager+showLoading"></a>

### toastManager.showLoading(message, [options]) ⇒ <code>string</code>

Show a loading toast with spinner

**Kind**: instance method of [<code>ToastManager</code>](#ToastManager)  
**Returns**: <code>string</code> - Loading toast ID  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| message | <code>string</code> | <code>&quot;Loading...&quot;</code> | Loading message |
| [options] | <code>Object</code> |  | Additional options |

* * *

<a name="ToastManager+hideLoading"></a>

### toastManager.hideLoading()

Hide the loading toast

**Kind**: instance method of [<code>ToastManager</code>](#ToastManager)  

* * *

<a name="ToastManager+showError"></a>

### toastManager.showError(message, [error], [options])

Show error with details

**Kind**: instance method of [<code>ToastManager</code>](#ToastManager)  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| message | <code>string</code> |  | Error message |
| [error] | <code>Error</code> \| <code>Object</code> | <code></code> | Error object with details |
| [options] | <code>Object</code> |  | Additional options |

* * *

<a name="ToastManager+showSuccess"></a>

### toastManager.showSuccess(message, [options])

Show success message

**Kind**: instance method of [<code>ToastManager</code>](#ToastManager)  

| Param | Type | Description |
| --- | --- | --- |
| message | <code>string</code> | Success message |
| [options] | <code>Object</code> | Additional options |

* * *

<a name="ToastManager+showWarning"></a>

### toastManager.showWarning(message, [options])

Show warning message

**Kind**: instance method of [<code>ToastManager</code>](#ToastManager)  

| Param | Type | Description |
| --- | --- | --- |
| message | <code>string</code> | Warning message |
| [options] | <code>Object</code> | Additional options |

* * *

<a name="ToastManager+showInfo"></a>

### toastManager.showInfo(message, [options])

Show info message

**Kind**: instance method of [<code>ToastManager</code>](#ToastManager)  

| Param | Type | Description |
| --- | --- | --- |
| message | <code>string</code> | Info message |
| [options] | <code>Object</code> | Additional options |

* * *

<a name="ToastManager+showCVEStatus"></a>

### toastManager.showCVEStatus(cveId, status, [data])

Show a toast for CVE lookup status

**Kind**: instance method of [<code>ToastManager</code>](#ToastManager)  

| Param | Type | Description |
| --- | --- | --- |
| cveId | <code>string</code> | CVE identifier |
| status | <code>string</code> | Status: looking, found, notfound, error |
| [data] | <code>Object</code> | Additional data |

* * *

<a name="ToastManager+clearAll"></a>

### toastManager.clearAll()

Clear all toasts

**Kind**: instance method of [<code>ToastManager</code>](#ToastManager)  

* * *

<a name="ToastManager+showModalError"></a>

### toastManager.showModalError(modalId, message, [options])

Show modal error state

**Kind**: instance method of [<code>ToastManager</code>](#ToastManager)  

| Param | Type | Description |
| --- | --- | --- |
| modalId | <code>string</code> | Modal element ID |
| message | <code>string</code> | Error message |
| [options] | <code>Object</code> | Additional options |

* * *

<a name="ToastManager+clearModalErrors"></a>

### toastManager.clearModalErrors(modalId)

Clear modal errors

**Kind**: instance method of [<code>ToastManager</code>](#ToastManager)  

| Param | Type | Description |
| --- | --- | --- |
| modalId | <code>string</code> | Modal element ID |

* * *

<a name="VulnerabilityCardsManager"></a>

## VulnerabilityCardsManager

Manages device cards and vulnerability cards rendering with pagination

**Kind**: global class  

* [VulnerabilityCardsManager](#VulnerabilityCardsManager)
  * [.renderDeviceCards()](#VulnerabilityCardsManager+renderDeviceCards)
  * [.generateDeviceCardsHTML(devices)](#VulnerabilityCardsManager+generateDeviceCardsHTML) ⇒ <code>string</code>
  * [.renderVulnerabilityCards()](#VulnerabilityCardsManager+renderVulnerabilityCards)
  * [.generateVulnerabilityCardsHTML(vulnEntries)](#VulnerabilityCardsManager+generateVulnerabilityCardsHTML) ⇒ <code>string</code>
  * [.generateVulnerabilityLinkHTML(cve, primaryVuln)](#VulnerabilityCardsManager+generateVulnerabilityLinkHTML) ⇒ <code>string</code>
  * [.generateVulnerabilityActionsHTML(cve, primaryVuln, vulnDataId)](#VulnerabilityCardsManager+generateVulnerabilityActionsHTML) ⇒ <code>string</code>
  * [.initializeSortable(container)](#VulnerabilityCardsManager+initializeSortable)
  * [.updateForCurrentView(viewType)](#VulnerabilityCardsManager+updateForCurrentView)

* * *

<a name="VulnerabilityCardsManager+renderDeviceCards"></a>

### vulnerabilityCardsManager.renderDeviceCards()

Render device cards with VPR scoring and pagination

**Kind**: instance method of [<code>VulnerabilityCardsManager</code>](#VulnerabilityCardsManager)  

* * *

<a name="VulnerabilityCardsManager+generateDeviceCardsHTML"></a>

### vulnerabilityCardsManager.generateDeviceCardsHTML(devices) ⇒ <code>string</code>

Generate HTML for device cards

**Kind**: instance method of [<code>VulnerabilityCardsManager</code>](#VulnerabilityCardsManager)  
**Returns**: <code>string</code> - HTML string for device cards  

| Param | Type | Description |
| --- | --- | --- |
| devices | <code>Array</code> | Array of device objects |

* * *

<a name="VulnerabilityCardsManager+renderVulnerabilityCards"></a>

### vulnerabilityCardsManager.renderVulnerabilityCards()

Render vulnerability cards grouped by CVE with VPR scoring

**Kind**: instance method of [<code>VulnerabilityCardsManager</code>](#VulnerabilityCardsManager)  

* * *

<a name="VulnerabilityCardsManager+generateVulnerabilityCardsHTML"></a>

### vulnerabilityCardsManager.generateVulnerabilityCardsHTML(vulnEntries) ⇒ <code>string</code>

Generate HTML for vulnerability cards

**Kind**: instance method of [<code>VulnerabilityCardsManager</code>](#VulnerabilityCardsManager)  
**Returns**: <code>string</code> - HTML string for vulnerability cards  

| Param | Type | Description |
| --- | --- | --- |
| vulnEntries | <code>Array</code> | Array of [cve, vulns] tuples |

* * *

<a name="VulnerabilityCardsManager+generateVulnerabilityLinkHTML"></a>

### vulnerabilityCardsManager.generateVulnerabilityLinkHTML(cve, primaryVuln) ⇒ <code>string</code>

Generate vulnerability link HTML (CVE or Cisco SA)
Handles multiple CVEs with proper individual link creation

**Kind**: instance method of [<code>VulnerabilityCardsManager</code>](#VulnerabilityCardsManager)  
**Returns**: <code>string</code> - HTML string for vulnerability link(s)  

| Param | Type | Description |
| --- | --- | --- |
| cve | <code>string</code> | CVE identifier(s) - may be comma/space separated |
| primaryVuln | <code>Object</code> | Primary vulnerability object |

* * *

<a name="VulnerabilityCardsManager+generateVulnerabilityActionsHTML"></a>

### vulnerabilityCardsManager.generateVulnerabilityActionsHTML(cve, primaryVuln, vulnDataId) ⇒ <code>string</code>

Generate vulnerability card actions HTML

**Kind**: instance method of [<code>VulnerabilityCardsManager</code>](#VulnerabilityCardsManager)  
**Returns**: <code>string</code> - HTML string for card actions  

| Param | Type | Description |
| --- | --- | --- |
| cve | <code>string</code> | CVE identifier |
| primaryVuln | <code>Object</code> | Primary vulnerability object |
| vulnDataId | <code>string</code> | Vulnerability data ID |

* * *

<a name="VulnerabilityCardsManager+initializeSortable"></a>

### vulnerabilityCardsManager.initializeSortable(container)

Initialize Sortable.js for drag-and-drop functionality

**Kind**: instance method of [<code>VulnerabilityCardsManager</code>](#VulnerabilityCardsManager)  

| Param | Type | Description |
| --- | --- | --- |
| container | <code>HTMLElement</code> | Container element |

* * *

<a name="VulnerabilityCardsManager+updateForCurrentView"></a>

### vulnerabilityCardsManager.updateForCurrentView(viewType)

Update cards for current view type

**Kind**: instance method of [<code>VulnerabilityCardsManager</code>](#VulnerabilityCardsManager)  

| Param | Type | Description |
| --- | --- | --- |
| viewType | <code>string</code> | Current view type |

* * *

<a name="VulnerabilityDataManager"></a>

## VulnerabilityDataManager

VulnerabilityDataManager - Centralized data management for vulnerability system

Usage:

```javascript
const dataManager = new VulnerabilityDataManager('/api');
await dataManager.loadData();
const filteredData = dataManager.filterData('searchTerm', 'Critical');
```

**Kind**: global class  

* [VulnerabilityDataManager](#VulnerabilityDataManager)
  * [.loadData()](#VulnerabilityDataManager+loadData) ⇒ <code>Promise.&lt;void&gt;</code>
  * [.processDevices()](#VulnerabilityDataManager+processDevices)
  * [.loadStatistics()](#VulnerabilityDataManager+loadStatistics) ⇒ <code>Promise.&lt;void&gt;</code>
  * [.filterData(searchTerm, severityFilter)](#VulnerabilityDataManager+filterData) ⇒ <code>Array</code>
  * [.groupVulnerabilitiesByCVE()](#VulnerabilityDataManager+groupVulnerabilitiesByCVE) ⇒ <code>Object</code>
  * [.getDeviceByHostname(hostname)](#VulnerabilityDataManager+getDeviceByHostname) ⇒ <code>Object</code> \| <code>null</code>
  * [.getStatistics()](#VulnerabilityDataManager+getStatistics) ⇒ <code>Object</code>
  * [.getTrends()](#VulnerabilityDataManager+getTrends) ⇒ <code>Object</code>
  * [.getHistoricalData()](#VulnerabilityDataManager+getHistoricalData) ⇒ <code>Array</code>
  * [.getAllVulnerabilities()](#VulnerabilityDataManager+getAllVulnerabilities) ⇒ <code>Array</code>
  * [.getFilteredVulnerabilities()](#VulnerabilityDataManager+getFilteredVulnerabilities) ⇒ <code>Array</code>
  * [.getDevices()](#VulnerabilityDataManager+getDevices) ⇒ <code>Array</code>
  * [.getUniqueAssetCount()](#VulnerabilityDataManager+getUniqueAssetCount) ⇒ <code>number</code>
  * [.refreshData()](#VulnerabilityDataManager+refreshData) ⇒ <code>Promise.&lt;void&gt;</code>
  * [.on(event, callback)](#VulnerabilityDataManager+on)
  * [.off(event, callback)](#VulnerabilityDataManager+off)
  * [.emit(event, data)](#VulnerabilityDataManager+emit)
  * [.extendTimelineData(originalData)](#VulnerabilityDataManager+extendTimelineData) ⇒ <code>Array</code>
  * [.exportDeviceReport(hostname)](#VulnerabilityDataManager+exportDeviceReport) ⇒ <code>Object</code> \| <code>null</code>
  * [.saveVulnerability(id, formData)](#VulnerabilityDataManager+saveVulnerability) ⇒ <code>Promise.&lt;boolean&gt;</code>
  * [.deleteVulnerability(id)](#VulnerabilityDataManager+deleteVulnerability) ⇒ <code>Promise.&lt;boolean&gt;</code>
  * [.clearAllData()](#VulnerabilityDataManager+clearAllData) ⇒ <code>Promise.&lt;boolean&gt;</code>
  * [.fetchTenableHistoricalData(apiKey, secretKey)](#VulnerabilityDataManager+fetchTenableHistoricalData) ⇒ <code>Promise.&lt;(Object\|null)&gt;</code>

* * *

<a name="VulnerabilityDataManager+loadData"></a>

### vulnerabilityDataManager.loadData() ⇒ <code>Promise.&lt;void&gt;</code>

Load vulnerability data from API endpoints

**Kind**: instance method of [<code>VulnerabilityDataManager</code>](#VulnerabilityDataManager)  

* * *

<a name="VulnerabilityDataManager+processDevices"></a>

### vulnerabilityDataManager.processDevices()

Process vulnerability data to create device aggregations

**Kind**: instance method of [<code>VulnerabilityDataManager</code>](#VulnerabilityDataManager)  

* * *

<a name="VulnerabilityDataManager+loadStatistics"></a>

### vulnerabilityDataManager.loadStatistics() ⇒ <code>Promise.&lt;void&gt;</code>

Load statistics and trend data from API

**Kind**: instance method of [<code>VulnerabilityDataManager</code>](#VulnerabilityDataManager)  

* * *

<a name="VulnerabilityDataManager+filterData"></a>

### vulnerabilityDataManager.filterData(searchTerm, severityFilter) ⇒ <code>Array</code>

Filter vulnerability data based on search term and severity

**Kind**: instance method of [<code>VulnerabilityDataManager</code>](#VulnerabilityDataManager)  
**Returns**: <code>Array</code> - Filtered vulnerabilities  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| searchTerm | <code>string</code> | <code>null</code> | Search term for hostname, CVE, or plugin name |
| severityFilter | <code>string</code> | <code>null</code> | Severity level filter |

* * *

<a name="VulnerabilityDataManager+groupVulnerabilitiesByCVE"></a>

### vulnerabilityDataManager.groupVulnerabilitiesByCVE() ⇒ <code>Object</code>

Group vulnerabilities by CVE for card view display

**Kind**: instance method of [<code>VulnerabilityDataManager</code>](#VulnerabilityDataManager)  
**Returns**: <code>Object</code> - Grouped vulnerabilities by CVE or plugin ID  

* * *

<a name="VulnerabilityDataManager+getDeviceByHostname"></a>

### vulnerabilityDataManager.getDeviceByHostname(hostname) ⇒ <code>Object</code> \| <code>null</code>

Get device by hostname

**Kind**: instance method of [<code>VulnerabilityDataManager</code>](#VulnerabilityDataManager)  
**Returns**: <code>Object</code> \| <code>null</code> - Device object or null if not found  

| Param | Type | Description |
| --- | --- | --- |
| hostname | <code>string</code> | Device hostname |

* * *

<a name="VulnerabilityDataManager+getStatistics"></a>

### vulnerabilityDataManager.getStatistics() ⇒ <code>Object</code>

Get vulnerability statistics

**Kind**: instance method of [<code>VulnerabilityDataManager</code>](#VulnerabilityDataManager)  
**Returns**: <code>Object</code> - Current statistics object  

* * *

<a name="VulnerabilityDataManager+getTrends"></a>

### vulnerabilityDataManager.getTrends() ⇒ <code>Object</code>

Get trend data

**Kind**: instance method of [<code>VulnerabilityDataManager</code>](#VulnerabilityDataManager)  
**Returns**: <code>Object</code> - Current trend data  

* * *

<a name="VulnerabilityDataManager+getHistoricalData"></a>

### vulnerabilityDataManager.getHistoricalData() ⇒ <code>Array</code>

Get historical data for charting

**Kind**: instance method of [<code>VulnerabilityDataManager</code>](#VulnerabilityDataManager)  
**Returns**: <code>Array</code> - Historical trend data  

* * *

<a name="VulnerabilityDataManager+getAllVulnerabilities"></a>

### vulnerabilityDataManager.getAllVulnerabilities() ⇒ <code>Array</code>

Get all vulnerability data

**Kind**: instance method of [<code>VulnerabilityDataManager</code>](#VulnerabilityDataManager)  
**Returns**: <code>Array</code> - All vulnerabilities  

* * *

<a name="VulnerabilityDataManager+getFilteredVulnerabilities"></a>

### vulnerabilityDataManager.getFilteredVulnerabilities() ⇒ <code>Array</code>

Get filtered vulnerability data

**Kind**: instance method of [<code>VulnerabilityDataManager</code>](#VulnerabilityDataManager)  
**Returns**: <code>Array</code> - Filtered vulnerabilities  

* * *

<a name="VulnerabilityDataManager+getDevices"></a>

### vulnerabilityDataManager.getDevices() ⇒ <code>Array</code>

Get all processed devices

**Kind**: instance method of [<code>VulnerabilityDataManager</code>](#VulnerabilityDataManager)  
**Returns**: <code>Array</code> - All device objects  

* * *

<a name="VulnerabilityDataManager+getUniqueAssetCount"></a>

### vulnerabilityDataManager.getUniqueAssetCount() ⇒ <code>number</code>

Get unique asset count

**Kind**: instance method of [<code>VulnerabilityDataManager</code>](#VulnerabilityDataManager)  
**Returns**: <code>number</code> - Number of unique assets  

* * *

<a name="VulnerabilityDataManager+refreshData"></a>

### vulnerabilityDataManager.refreshData() ⇒ <code>Promise.&lt;void&gt;</code>

Refresh all data from API

**Kind**: instance method of [<code>VulnerabilityDataManager</code>](#VulnerabilityDataManager)  

* * *

<a name="VulnerabilityDataManager+on"></a>

### vulnerabilityDataManager.on(event, callback)

Add event listener

**Kind**: instance method of [<code>VulnerabilityDataManager</code>](#VulnerabilityDataManager)  

| Param | Type | Description |
| --- | --- | --- |
| event | <code>string</code> | Event name |
| callback | <code>function</code> | Callback function |

* * *

<a name="VulnerabilityDataManager+off"></a>

### vulnerabilityDataManager.off(event, callback)

Remove event listener

**Kind**: instance method of [<code>VulnerabilityDataManager</code>](#VulnerabilityDataManager)  

| Param | Type | Description |
| --- | --- | --- |
| event | <code>string</code> | Event name |
| callback | <code>function</code> | Callback function to remove |

* * *

<a name="VulnerabilityDataManager+emit"></a>

### vulnerabilityDataManager.emit(event, data)

Emit event to all listeners

**Kind**: instance method of [<code>VulnerabilityDataManager</code>](#VulnerabilityDataManager)  

| Param | Type | Description |
| --- | --- | --- |
| event | <code>string</code> | Event name |
| data | <code>Object</code> | Event data |

* * *

<a name="VulnerabilityDataManager+extendTimelineData"></a>

### vulnerabilityDataManager.extendTimelineData(originalData) ⇒ <code>Array</code>

Extend timeline data with interpolated values for charting

**Kind**: instance method of [<code>VulnerabilityDataManager</code>](#VulnerabilityDataManager)  
**Returns**: <code>Array</code> - Extended data with interpolated values  

| Param | Type | Description |
| --- | --- | --- |
| originalData | <code>Array</code> | Original historical data points |

* * *

<a name="VulnerabilityDataManager+exportDeviceReport"></a>

### vulnerabilityDataManager.exportDeviceReport(hostname) ⇒ <code>Object</code> \| <code>null</code>

Export device vulnerability report as CSV data

**Kind**: instance method of [<code>VulnerabilityDataManager</code>](#VulnerabilityDataManager)  
**Returns**: <code>Object</code> \| <code>null</code> - CSV data and metadata or null if device not found  

| Param | Type | Description |
| --- | --- | --- |
| hostname | <code>string</code> | Device hostname |

* * *

<a name="VulnerabilityDataManager+saveVulnerability"></a>

### vulnerabilityDataManager.saveVulnerability(id, formData) ⇒ <code>Promise.&lt;boolean&gt;</code>

Save vulnerability changes via API

**Kind**: instance method of [<code>VulnerabilityDataManager</code>](#VulnerabilityDataManager)  
**Returns**: <code>Promise.&lt;boolean&gt;</code> - Success status  

| Param | Type | Description |
| --- | --- | --- |
| id | <code>number</code> | Vulnerability ID |
| formData | <code>Object</code> | Updated vulnerability data |

* * *

<a name="VulnerabilityDataManager+deleteVulnerability"></a>

### vulnerabilityDataManager.deleteVulnerability(id) ⇒ <code>Promise.&lt;boolean&gt;</code>

Delete vulnerability via API

**Kind**: instance method of [<code>VulnerabilityDataManager</code>](#VulnerabilityDataManager)  
**Returns**: <code>Promise.&lt;boolean&gt;</code> - Success status  

| Param | Type | Description |
| --- | --- | --- |
| id | <code>number</code> | Vulnerability ID |

* * *

<a name="VulnerabilityDataManager+clearAllData"></a>

### vulnerabilityDataManager.clearAllData() ⇒ <code>Promise.&lt;boolean&gt;</code>

Clear all vulnerability data via API

**Kind**: instance method of [<code>VulnerabilityDataManager</code>](#VulnerabilityDataManager)  
**Returns**: <code>Promise.&lt;boolean&gt;</code> - Success status  

* * *

<a name="VulnerabilityDataManager+fetchTenableHistoricalData"></a>

### vulnerabilityDataManager.fetchTenableHistoricalData(apiKey, secretKey) ⇒ <code>Promise.&lt;(Object\|null)&gt;</code>

Fetch historical VPR data from Tenable API

**Kind**: instance method of [<code>VulnerabilityDataManager</code>](#VulnerabilityDataManager)  
**Returns**: <code>Promise.&lt;(Object\|null)&gt;</code> - Fetched data or null on error  

| Param | Type | Description |
| --- | --- | --- |
| apiKey | <code>string</code> | Tenable API key |
| secretKey | <code>string</code> | Tenable secret key |

* * *

<a name="VulnerabilitySearchManager"></a>

## VulnerabilitySearchManager

Manages vulnerability search, filtering, and external lookup operations

**Kind**: global class  

* [VulnerabilitySearchManager](#VulnerabilitySearchManager)
  * [.setupEventListeners()](#VulnerabilitySearchManager+setupEventListeners)
  * [.lookupVulnerability(vulnId, pluginName)](#VulnerabilitySearchManager+lookupVulnerability)
  * [.lookupCVE(cveId)](#VulnerabilitySearchManager+lookupCVE)
  * [.lookupCVEWithCiscoAPI(cveId, clientId, clientSecret, retryCount, maxRetries)](#VulnerabilitySearchManager+lookupCVEWithCiscoAPI)
  * [.openCVEPopups(cveIds)](#VulnerabilitySearchManager+openCVEPopups)
  * [.displayCVEInfo(cveId, data)](#VulnerabilitySearchManager+displayCVEInfo)
  * [.extractCiscoVulnId(pluginName)](#VulnerabilitySearchManager+extractCiscoVulnId) ⇒ <code>string</code> \| <code>null</code>
  * [.getVulnerabilityLink(vulnData)](#VulnerabilitySearchManager+getVulnerabilityLink) ⇒ <code>Object</code>
  * [.delay(ms)](#VulnerabilitySearchManager+delay)
  * [.cacheAPIResponse(cveId, data)](#VulnerabilitySearchManager+cacheAPIResponse)
  * [.getCachedAPIResponse(cveId)](#VulnerabilitySearchManager+getCachedAPIResponse) ⇒ <code>Object</code> \| <code>null</code>
  * [.handleOfflineMode(cveId)](#VulnerabilitySearchManager+handleOfflineMode)
  * [.displayOfflineCVEInfo(cveId)](#VulnerabilitySearchManager+displayOfflineCVEInfo)
  * [.processPendingCVELookups()](#VulnerabilitySearchManager+processPendingCVELookups)

* * *

<a name="VulnerabilitySearchManager+setupEventListeners"></a>

### vulnerabilitySearchManager.setupEventListeners()

Setup search and filter event listeners

**Kind**: instance method of [<code>VulnerabilitySearchManager</code>](#VulnerabilitySearchManager)  

* * *

<a name="VulnerabilitySearchManager+lookupVulnerability"></a>

### vulnerabilitySearchManager.lookupVulnerability(vulnId, pluginName)

Enhanced lookup method that handles different vulnerability ID types

**Kind**: instance method of [<code>VulnerabilitySearchManager</code>](#VulnerabilitySearchManager)  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| vulnId | <code>string</code> |  | Vulnerability ID (CVE, Cisco SA, or plugin) |
| pluginName | <code>string</code> | <code>null</code> | Optional plugin name for extraction |

* * *

<a name="VulnerabilitySearchManager+lookupCVE"></a>

### vulnerabilitySearchManager.lookupCVE(cveId)

Handle CVE lookup with multiple CVE support

**Kind**: instance method of [<code>VulnerabilitySearchManager</code>](#VulnerabilitySearchManager)  

| Param | Type | Description |
| --- | --- | --- |
| cveId | <code>string</code> | CVE identifier(s) |

* * *

<a name="VulnerabilitySearchManager+lookupCVEWithCiscoAPI"></a>

### vulnerabilitySearchManager.lookupCVEWithCiscoAPI(cveId, clientId, clientSecret, retryCount, maxRetries)

Lookup CVE using Cisco PSIRT API with retry and fallback (T040)

**Kind**: instance method of [<code>VulnerabilitySearchManager</code>](#VulnerabilitySearchManager)  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| cveId | <code>string</code> |  | Single CVE identifier |
| clientId | <code>string</code> |  | Cisco API client ID |
| clientSecret | <code>string</code> |  | Cisco API client secret |
| retryCount | <code>number</code> | <code>0</code> | Current retry attempt |
| maxRetries | <code>number</code> | <code>3</code> | Maximum number of retries |

* * *

<a name="VulnerabilitySearchManager+openCVEPopups"></a>

### vulnerabilitySearchManager.openCVEPopups(cveIds)

Open CVE lookup popups for multiple CVE IDs

**Kind**: instance method of [<code>VulnerabilitySearchManager</code>](#VulnerabilitySearchManager)  

| Param | Type | Description |
| --- | --- | --- |
| cveIds | <code>Array</code> | Array of CVE identifiers |

* * *

<a name="VulnerabilitySearchManager+displayCVEInfo"></a>

### vulnerabilitySearchManager.displayCVEInfo(cveId, data)

Display CVE information from Cisco PSIRT API

**Kind**: instance method of [<code>VulnerabilitySearchManager</code>](#VulnerabilitySearchManager)  

| Param | Type | Description |
| --- | --- | --- |
| cveId | <code>string</code> | CVE identifier |
| data | <code>Object</code> | CVE data from API |

* * *

<a name="VulnerabilitySearchManager+extractCiscoVulnId"></a>

### vulnerabilitySearchManager.extractCiscoVulnId(pluginName) ⇒ <code>string</code> \| <code>null</code>

Extract Cisco vulnerability ID from plugin name

**Kind**: instance method of [<code>VulnerabilitySearchManager</code>](#VulnerabilitySearchManager)  
**Returns**: <code>string</code> \| <code>null</code> - Cisco SA identifier or null  

| Param | Type | Description |
| --- | --- | --- |
| pluginName | <code>string</code> | Plugin name to search |

* * *

<a name="VulnerabilitySearchManager+getVulnerabilityLink"></a>

### vulnerabilitySearchManager.getVulnerabilityLink(vulnData) ⇒ <code>Object</code>

Determine vulnerability ID type and create appropriate link

**Kind**: instance method of [<code>VulnerabilitySearchManager</code>](#VulnerabilitySearchManager)  
**Returns**: <code>Object</code> - Link information object  

| Param | Type | Description |
| --- | --- | --- |
| vulnData | <code>Object</code> | Vulnerability data object |

* * *

<a name="VulnerabilitySearchManager+delay"></a>

### vulnerabilitySearchManager.delay(ms)

T040: Helper method for exponential backoff delay

**Kind**: instance method of [<code>VulnerabilitySearchManager</code>](#VulnerabilitySearchManager)  

| Param | Type | Description |
| --- | --- | --- |
| ms | <code>number</code> | Milliseconds to delay |

* * *

<a name="VulnerabilitySearchManager+cacheAPIResponse"></a>

### vulnerabilitySearchManager.cacheAPIResponse(cveId, data)

T040: Cache API responses for offline/failure scenarios

**Kind**: instance method of [<code>VulnerabilitySearchManager</code>](#VulnerabilitySearchManager)  

| Param | Type | Description |
| --- | --- | --- |
| cveId | <code>string</code> | CVE identifier |
| data | <code>Object</code> | API response data |

* * *

<a name="VulnerabilitySearchManager+getCachedAPIResponse"></a>

### vulnerabilitySearchManager.getCachedAPIResponse(cveId) ⇒ <code>Object</code> \| <code>null</code>

T040: Retrieve cached API response

**Kind**: instance method of [<code>VulnerabilitySearchManager</code>](#VulnerabilitySearchManager)  
**Returns**: <code>Object</code> \| <code>null</code> - Cached data or null  

| Param | Type | Description |
| --- | --- | --- |
| cveId | <code>string</code> | CVE identifier |

* * *

<a name="VulnerabilitySearchManager+handleOfflineMode"></a>

### vulnerabilitySearchManager.handleOfflineMode(cveId)

T040: Handle offline mode with graceful degradation

**Kind**: instance method of [<code>VulnerabilitySearchManager</code>](#VulnerabilitySearchManager)  

| Param | Type | Description |
| --- | --- | --- |
| cveId | <code>string</code> | CVE identifier |

* * *

<a name="VulnerabilitySearchManager+displayOfflineCVEInfo"></a>

### vulnerabilitySearchManager.displayOfflineCVEInfo(cveId)

T040: Display offline CVE information

**Kind**: instance method of [<code>VulnerabilitySearchManager</code>](#VulnerabilitySearchManager)  

| Param | Type | Description |
| --- | --- | --- |
| cveId | <code>string</code> | CVE identifier |

* * *

<a name="VulnerabilitySearchManager+processPendingCVELookups"></a>

### vulnerabilitySearchManager.processPendingCVELookups()

T040: Process pending CVE lookups when coming back online

**Kind**: instance method of [<code>VulnerabilitySearchManager</code>](#VulnerabilitySearchManager)  

* * *

<a name="WebSocketClient"></a>

## WebSocketClient

WebSocket client class for real-time progress tracking

**Kind**: global class  

* [WebSocketClient](#WebSocketClient)
  * [.debug()](#WebSocketClient+debug)
  * [.connect()](#WebSocketClient+connect) ⇒ <code>Promise.&lt;boolean&gt;</code>

* * *

<a name="WebSocketClient+debug"></a>

### webSocketClient.debug()

Debug logging method - only logs when debug mode is enabled

**Kind**: instance method of [<code>WebSocketClient</code>](#WebSocketClient)  

* * *

<a name="WebSocketClient+connect"></a>

### webSocketClient.connect() ⇒ <code>Promise.&lt;boolean&gt;</code>

Connect to WebSocket server

**Kind**: instance method of [<code>WebSocketClient</code>](#WebSocketClient)  
**Returns**: <code>Promise.&lt;boolean&gt;</code> - Connection success  

* * *

<a name="headerThemeManager"></a>

## headerThemeManager

Auto-initialize header theme management when module loads
This ensures theme toggles work on all pages that include this script

**Kind**: global constant  

* * *

<a name="VPR_COLORS"></a>

## VPR\_COLORS

Vulnerability Color Constants
Single source of truth for VPR severity colors
These values match the CSS variables defined in vulnerabilities.css

**Kind**: global constant  

* * *

<a name="debounce"></a>

## debounce(func, delay) ⇒ <code>function</code>

Debounce function to limit the rate at which a function gets called.
This is crucial for performance on events that fire rapidly, like window resize.

**Kind**: global function  
**Returns**: <code>function</code> - The debounced function.  

| Param | Type | Description |
| --- | --- | --- |
| func | <code>function</code> | The function to debounce. |
| delay | <code>number</code> | The debounce delay in milliseconds. |

* * *

<a name="createVulnerabilityGridOptions"></a>

## createVulnerabilityGridOptions(componentContext, isDarkMode) ⇒ <code>GridOptions</code>

Creates and returns the complete AG Grid configuration object.

**Kind**: global function  
**Returns**: <code>GridOptions</code> - A complete AG Grid `gridOptions` object.  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| componentContext | <code>object</code> |  | The "this" context of the calling component (e.g., ModernVulnManager)                                    to access its methods and properties like `gridApi`. |
| isDarkMode | <code>boolean</code> | <code>false</code> | Whether to use dark mode theme (optional) |

* * *

<a name="createFallbackFooter"></a>

## createFallbackFooter(container)

Creates a safe fallback footer using DOM methods with badges

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| container | <code>Element</code> | The container element to add footer to |

* * *

<a name="escapeHtml"></a>

## escapeHtml(text) ⇒ <code>string</code>

Escape HTML characters to prevent XSS attacks

**Kind**: global function  
**Returns**: <code>string</code> - Escaped text  

| Param | Type | Description |
| --- | --- | --- |
| text | <code>string</code> | Text to escape |

* * *

<a name="getVPRColors"></a>

## getVPRColors(theme) ⇒ <code>Array.&lt;string&gt;</code>

Get severity colors for the current theme

**Kind**: global function  
**Returns**: <code>Array.&lt;string&gt;</code> - Array of hex color values  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| theme | <code>string</code> | <code>&quot;light&quot;</code> | 'light' or 'dark' |

* * *

<a name="getSeverityColor"></a>

## getSeverityColor(severity, theme) ⇒ <code>Object</code>

Get color configuration for a specific severity

**Kind**: global function  
**Returns**: <code>Object</code> - Color configuration object  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| severity | <code>string</code> |  | 'critical', 'high', 'medium', or 'low' |
| theme | <code>string</code> | <code>&quot;light&quot;</code> | 'light' or 'dark' |

* * *

<a name="getVPRColorsFromCSS"></a>

## getVPRColorsFromCSS() ⇒ <code>Array.&lt;string&gt;</code>

Get colors from CSS variables (dynamic, theme-aware)

**Kind**: global function  
**Returns**: <code>Array.&lt;string&gt;</code> - Array of hex color values from CSS  

* * *

<a name="getCurrentTheme"></a>

## getCurrentTheme() ⇒ <code>string</code>

Get the current theme from document body

**Kind**: global function  
**Returns**: <code>string</code> - 'light' or 'dark'  

* * *

---
