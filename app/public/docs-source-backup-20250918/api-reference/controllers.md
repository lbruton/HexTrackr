# Controllers

This section contains API documentation for Controllers.

## Source: app/controllers/**/*.js

## Classes

<table>
  <thead>
    <tr>
      <th>Global</th><th>Description</th>
    </tr>
  </thead>
  <tbody>
<tr>
    <td><a href="#DocsController">DocsController</a></td>
    <td><p>Documentation Controller
Handles HTTP requests for documentation-related endpoints
Extracted from server.js (T029)</p>
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
    <td><a href="#BackupService">BackupService</a></td>
    <td><p>Backup Controller
Extracted from server.js lines: 2701, 3274-3798</p>
<p>Handles HTTP requests for backup and restore operations.
Delegates business logic to backupService.</p>
</td>
    </tr>
<tr>
    <td><a href="#_Papa">_Papa</a></td>
    <td><p>Import Controller - Vendor CSV Import Operations</p>
<p>This controller handles operational imports of vendor CSV data (e.g., Tenable vulnerability scans),
not backup/restore operations. Those are handled by the backup controller.</p>
<p>Controller logic extracted from server.js lines: 2337-2399, 2403-2531, 3482-3604, 2534-2550</p>
<h1 id="integration-notes-for-t053">INTEGRATION NOTES FOR T053:</h1>
<ul>
<li>setProgressTracker() MUST be called by server.js before route registration</li>
<li>All file upload logic uses PathValidator for security</li>
<li>Controller delegates complex business logic to importService</li>
<li>Progress tracking is handled via injected progressTracker instance</li>
<li>Database operations go through DatabaseService</li>
</ul>
</td>
    </tr>
<tr>
    <td><a href="#TicketService">TicketService</a></td>
    <td><p>Ticket Controller
Extracted from server.js lines: 3320-3344, 3369-3394, 3396-3422, 3424-3435, 3437-3479, 3482-3498, 3606-3621</p>
<p>Handles HTTP requests for ticket operations.
Delegates business logic to ticketService.</p>
<p>T053 INTEGRATION CHECKLIST:</p>
<ol>
<li>Import this controller in server.js: const ticketController = require(&quot;./app/controllers/ticketController&quot;);</li>
<li>Initialize after database connection: ticketController.initialize(db);</li>
<li>Register routes: app.use(&quot;/api/tickets&quot;, require(&quot;./app/routes/tickets&quot;));</li>
<li>Remove duplicate routes from server.js (see routes file for line numbers)</li>
<li>Handle import/backup route conflicts as noted in routes file</li>
</ol>
</td>
    </tr>
<tr>
    <td><a href="#VulnerabilityService">VulnerabilityService</a></td>
    <td><p>Vulnerability Controller
Extracted from server.js lines: 1996-2016, 2019-2092, 2095-2156, 2159-2218, 2221-2283, 2337-2399, 2403-2514, 2517-2531, 3304-3317, 3501-3565</p>
<p>This is the largest and most complex controller in HexTrackr, handling:</p>
<ul>
<li>Statistics and analytics endpoints with complex VPR calculations</li>
<li>Core vulnerability CRUD operations with lifecycle management</li>
<li>CSV import operations (standard and staging-based for performance)</li>
<li>Data management and clearing operations</li>
<li>Export functionality for backup/analysis</li>
</ul>
<p>Delegates business logic to:</p>
<ul>
<li>vulnerabilityService: Core CRUD, import processing, data management</li>
<li>vulnerabilityStatsService: Statistics, trends, analytics calculations</li>
</ul>
<p>T053 INTEGRATION CHECKLIST:</p>
<ol>
<li>Import this controller in server.js: const vulnerabilityController = require(&quot;./app/controllers/vulnerabilityController&quot;);</li>
<li>Initialize after database connection: vulnerabilityController.initialize(db, progressTracker);</li>
<li>Register routes: app.use(&quot;/api/vulnerabilities&quot;, require(&quot;./app/routes/vulnerabilities&quot;));</li>
<li>Remove duplicate routes from server.js (see routes file for line numbers)</li>
<li>Handle import/backup route conflicts as noted in routes file</li>
<li>Ensure utility functions (mapVulnerabilityRow, extractScanDateFromFilename) remain in server.js</li>
</ol>
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
    <td><a href="#findDocsSectionForFilename">findDocsSectionForFilename()</a></td>
    <td><p>Helper function to find a section path for a given filename by scanning the content folder
Extracted from server.js lines 2560-2582
Used by the documentation portal routing system</p>
</td>
    </tr>
<tr>
    <td><a href="#setProgressTracker">setProgressTracker()</a></td>
    <td><p>Set progress tracker instance (called by server.js)</p>
</td>
    </tr>
<tr>
    <td><a href="#importVulnerabilities">importVulnerabilities()</a></td>
    <td><p>POST /api/vulnerabilities/import
Standard vulnerability CSV import with enhanced lifecycle management
From server.js lines 2337-2399</p>
</td>
    </tr>
<tr>
    <td><a href="#importVulnerabilitiesStaging">importVulnerabilitiesStaging()</a></td>
    <td><p>POST /api/vulnerabilities/import-staging
High-performance vulnerability import using staging table for batch processing
From server.js lines 2403-2531</p>
</td>
    </tr>
<tr>
    <td><a href="#importVulnerabilitiesJSON">importVulnerabilitiesJSON()</a></td>
    <td><p>POST /api/import/vulnerabilities
JSON-based vulnerability import for frontend data upload
From server.js lines 3501-3604</p>
</td>
    </tr>
<tr>
    <td><a href="#importTicketsJSON">importTicketsJSON()</a></td>
    <td><p>POST /api/import/tickets
JSON-based ticket import for frontend data upload
From server.js lines 3482-3499</p>
</td>
    </tr>
<tr>
    <td><a href="#getImportHistory">getImportHistory()</a></td>
    <td><p>GET /api/imports
Get import history with vulnerability counts
From server.js lines 2534-2550</p>
</td>
    </tr>
<tr>
    <td><a href="#checkImportProgress">checkImportProgress()</a></td>
    <td><p>GET /api/import/progress/:sessionId
Check import progress for a specific session
Progress tracking via WebSocket (ProgressTracker class)</p>
</td>
    </tr>
</tbody>
</table>

<a name="DocsController"></a>

## DocsController

Documentation Controller
Handles HTTP requests for documentation-related endpoints
Extracted from server.js (T029)

**Kind**: global class  

* * *

<a name="DocsController+getStats"></a>

### docsController.getStats()

Get documentation statistics
Handles GET /api/docs/stats
Computes API endpoints, JS function count, and framework statistics
Original: server.js lines 2624-2680

**Kind**: instance method of [<code>DocsController</code>](#DocsController)  

* * *

<a name="BackupService"></a>

## BackupService

Backup Controller
Extracted from server.js lines: 2701, 3274-3798

Handles HTTP requests for backup and restore operations.
Delegates business logic to backupService.

**Kind**: global constant  

* * *

<a name="_Papa"></a>

## \_Papa

Import Controller - Vendor CSV Import Operations

This controller handles operational imports of vendor CSV data (e.g., Tenable vulnerability scans),
not backup/restore operations. Those are handled by the backup controller.

Controller logic extracted from server.js lines: 2337-2399, 2403-2531, 3482-3604, 2534-2550

INTEGRATION NOTES FOR T053
===========================

- setProgressTracker() MUST be called by server.js before route registration
- All file upload logic uses PathValidator for security
- Controller delegates complex business logic to importService
- Progress tracking is handled via injected progressTracker instance
- Database operations go through DatabaseService

**Kind**: global constant  

* * *

<a name="TicketService"></a>

## TicketService

Ticket Controller
Extracted from server.js lines: 3320-3344, 3369-3394, 3396-3422, 3424-3435, 3437-3479, 3482-3498, 3606-3621

Handles HTTP requests for ticket operations.
Delegates business logic to ticketService.

T053 INTEGRATION CHECKLIST:

1. Import this controller in server.js: const ticketController = require("./app/controllers/ticketController");
2. Initialize after database connection: ticketController.initialize(db);
3. Register routes: app.use("/api/tickets", require("./app/routes/tickets"));
4. Remove duplicate routes from server.js (see routes file for line numbers)
5. Handle import/backup route conflicts as noted in routes file

**Kind**: global constant  

* * *

<a name="VulnerabilityService"></a>

## VulnerabilityService

Vulnerability Controller
Extracted from server.js lines: 1996-2016, 2019-2092, 2095-2156, 2159-2218, 2221-2283, 2337-2399, 2403-2514, 2517-2531, 3304-3317, 3501-3565

This is the largest and most complex controller in HexTrackr, handling:

- Statistics and analytics endpoints with complex VPR calculations
- Core vulnerability CRUD operations with lifecycle management
- CSV import operations (standard and staging-based for performance)
- Data management and clearing operations
- Export functionality for backup/analysis

Delegates business logic to:

- vulnerabilityService: Core CRUD, import processing, data management
- vulnerabilityStatsService: Statistics, trends, analytics calculations

T053 INTEGRATION CHECKLIST:

1. Import this controller in server.js: const vulnerabilityController = require("./app/controllers/vulnerabilityController");
2. Initialize after database connection: vulnerabilityController.initialize(db, progressTracker);
3. Register routes: app.use("/api/vulnerabilities", require("./app/routes/vulnerabilities"));
4. Remove duplicate routes from server.js (see routes file for line numbers)
5. Handle import/backup route conflicts as noted in routes file
6. Ensure utility functions (mapVulnerabilityRow, extractScanDateFromFilename) remain in server.js

**Kind**: global constant  

* * *

<a name="findDocsSectionForFilename"></a>

## findDocsSectionForFilename()

Helper function to find a section path for a given filename by scanning the content folder
Extracted from server.js lines 2560-2582
Used by the documentation portal routing system

**Kind**: global function  

* * *

<a name="setProgressTracker"></a>

## setProgressTracker()

Set progress tracker instance (called by server.js)

**Kind**: global function  

* * *

<a name="importVulnerabilities"></a>

## importVulnerabilities()

POST /api/vulnerabilities/import
Standard vulnerability CSV import with enhanced lifecycle management
From server.js lines 2337-2399

**Kind**: global function  

* * *

<a name="importVulnerabilitiesStaging"></a>

## importVulnerabilitiesStaging()

POST /api/vulnerabilities/import-staging
High-performance vulnerability import using staging table for batch processing
From server.js lines 2403-2531

**Kind**: global function  

* * *

<a name="importVulnerabilitiesJSON"></a>

## importVulnerabilitiesJSON()

POST /api/import/vulnerabilities
JSON-based vulnerability import for frontend data upload
From server.js lines 3501-3604

**Kind**: global function  

* * *

<a name="importTicketsJSON"></a>

## importTicketsJSON()

POST /api/import/tickets
JSON-based ticket import for frontend data upload
From server.js lines 3482-3499

**Kind**: global function  

* * *

<a name="getImportHistory"></a>

## getImportHistory()

GET /api/imports
Get import history with vulnerability counts
From server.js lines 2534-2550

**Kind**: global function  

* * *

<a name="checkImportProgress"></a>

## checkImportProgress()

GET /api/import/progress/:sessionId
Check import progress for a specific session
Progress tracking via WebSocket (ProgressTracker class)

**Kind**: global function  

* * *

---
