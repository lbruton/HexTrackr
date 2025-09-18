# API Routes

This section contains API documentation for API Routes.

## Source: app/routes/**/*.js

## Constants

<table>
  <thead>
    <tr>
      <th>Global</th><th>Description</th>
    </tr>
  </thead>
  <tbody>
<tr>
    <td><a href="#express">express</a></td>
    <td><p>Backup and Restore Routes
Extracted from server.js lines: 2701, 3274-3798</p>
<p>Routes:</p>
<ul>
<li>DELETE /api/backup/clear/:type - Clear data (line 2701)</li>
<li>GET /api/backup/stats - Get backup statistics (line 3274)</li>
<li>GET /api/backup/vulnerabilities - Export vulnerabilities (line 3304)</li>
<li>GET /api/backup/tickets - Export tickets (line 3606)</li>
<li>GET /api/backup/all - Export complete backup (line 3623)</li>
<li>POST /api/restore - Restore from backup file (line 3654)</li>
</ul>
</td>
    </tr>
<tr>
    <td><a href="#express">express</a></td>
    <td><p>Import Routes - Vendor CSV Import Operations</p>
<p>This module handles operational imports of vendor CSV data (e.g., Tenable vulnerability scans),
not backup/restore operations. Those are handled by the backup module.</p>
<p>Routes extracted from server.js lines: 2337-2399, 2403-2531, 3482-3604, 2534-2550</p>
<h1 id="integration-instructions-for-t053">INTEGRATION INSTRUCTIONS FOR T053:</h1>
<ol>
<li>In server.js, add: const importRoutes = require(&quot;./routes/imports&quot;);</li>
<li>In server.js, add: importController.setProgressTracker(progressTracker);</li>
<li>In server.js, add: app.use(&quot;/api&quot;, importRoutes);</li>
<li>Remove the corresponding routes from server.js (lines documented above)</li>
<li>Ensure multer upload configuration matches server.js exactly</li>
</ol>
<p>ROUTE MAPPING:</p>
<ul>
<li>/api/vulnerabilities/import -&gt; router.post(&quot;/vulnerabilities/import&quot;)</li>
<li>/api/vulnerabilities/import-staging -&gt; router.post(&quot;/vulnerabilities/import-staging&quot;)</li>
<li>/api/import/vulnerabilities -&gt; router.post(&quot;/import/vulnerabilities&quot;)</li>
<li>/api/import/tickets -&gt; router.post(&quot;/import/tickets&quot;)</li>
<li>/api/imports -&gt; router.get(&quot;/imports&quot;)</li>
<li>/api/import/progress/:sessionId -&gt; router.get(&quot;/import/progress/:sessionId&quot;)</li>
</ul>
</td>
    </tr>
<tr>
    <td><a href="#express">express</a></td>
    <td><p>Ticket Routes
Extracted from server.js lines: 3320-3344, 3369-3394, 3396-3422, 3424-3435, 3437-3479, 3482-3498, 3606-3621</p>
<p>Routes:</p>
<ul>
<li>GET /api/tickets - List all tickets (line 3320)</li>
<li>POST /api/tickets - Create new ticket (line 3369)</li>
<li>PUT /api/tickets/:id - Update ticket (line 3396)</li>
<li>DELETE /api/tickets/:id - Delete ticket (line 3424)</li>
<li>POST /api/tickets/migrate - Migrate tickets (line 3437)</li>
<li>POST /api/import/tickets - Import tickets from CSV (line 3482) - NOTE: This route needs special handling in T053</li>
<li>GET /api/backup/tickets - Export tickets (line 3606) - NOTE: This conflicts with backup routes in T053</li>
</ul>
</td>
    </tr>
<tr>
    <td><a href="#express">express</a></td>
    <td><p>Vulnerability Routes
Extracted from server.js lines: 1996-2016, 2019-2092, 2095-2156, 2159-2218, 2221-2283, 2337-2399, 2403-2514, 2517-2531, 3304-3317, 3501-3565</p>
<p>This is the largest and most complex module in HexTrackr, handling:</p>
<ul>
<li>Core vulnerability CRUD operations</li>
<li>Statistics and analytics endpoints</li>
<li>Import/export functionality (CSV imports, backup exports)</li>
<li>Trend analysis and historical data</li>
<li>Staging-based imports for performance</li>
<li>Multi-vendor vulnerability data processing</li>
</ul>
<p>Routes:</p>
<ul>
<li>GET /api/vulnerabilities/stats - Statistics with VPR totals (lines 1996-2016)</li>
<li>GET /api/vulnerabilities/recent-trends - Recent trends for dashboard cards (lines 2019-2092)</li>
<li>GET /api/vulnerabilities/trends - Historical trending data (lines 2095-2156)</li>
<li>GET /api/vulnerabilities - List vulnerabilities with pagination/filters (lines 2159-2218)</li>
<li>GET /api/vulnerabilities/resolved - List resolved vulnerabilities (lines 2221-2283)</li>
<li>POST /api/vulnerabilities/import - Standard CSV import (lines 2337-2399)</li>
<li>POST /api/vulnerabilities/import-staging - High-performance staging import (lines 2403-2514)</li>
<li>DELETE /api/vulnerabilities/clear - Clear all vulnerability data (lines 2517-2531)</li>
<li>GET /api/backup/vulnerabilities - Export vulnerability data (lines 3304-3317) - NOTE: Conflicts with backup routes</li>
<li>POST /api/import/vulnerabilities - Web-based import (lines 3501-3565) - NOTE: Part of import system</li>
</ul>
</td>
    </tr>
</tbody>
</table>

<a name="express"></a>

## express

Backup and Restore Routes
Extracted from server.js lines: 2701, 3274-3798

Routes:

- DELETE /api/backup/clear/:type - Clear data (line 2701)
- GET /api/backup/stats - Get backup statistics (line 3274)
- GET /api/backup/vulnerabilities - Export vulnerabilities (line 3304)
- GET /api/backup/tickets - Export tickets (line 3606)
- GET /api/backup/all - Export complete backup (line 3623)
- POST /api/restore - Restore from backup file (line 3654)

**Kind**: global constant  

* * *

<a name="express"></a>

## express

Import Routes - Vendor CSV Import Operations

This module handles operational imports of vendor CSV data (e.g., Tenable vulnerability scans),
not backup/restore operations. Those are handled by the backup module.

Routes extracted from server.js lines: 2337-2399, 2403-2531, 3482-3604, 2534-2550

INTEGRATION INSTRUCTIONS FOR T053
==================================

1. In server.js, add: const importRoutes = require("./routes/imports");
2. In server.js, add: importController.setProgressTracker(progressTracker);
3. In server.js, add: app.use("/api", importRoutes);
4. Remove the corresponding routes from server.js (lines documented above)
5. Ensure multer upload configuration matches server.js exactly

ROUTE MAPPING:

- /api/vulnerabilities/import -> router.post("/vulnerabilities/import")
- /api/vulnerabilities/import-staging -> router.post("/vulnerabilities/import-staging")
- /api/import/vulnerabilities -> router.post("/import/vulnerabilities")
- /api/import/tickets -> router.post("/import/tickets")
- /api/imports -> router.get("/imports")
- /api/import/progress/:sessionId -> router.get("/import/progress/:sessionId")

**Kind**: global constant  

* * *

<a name="express"></a>

## express

Ticket Routes
Extracted from server.js lines: 3320-3344, 3369-3394, 3396-3422, 3424-3435, 3437-3479, 3482-3498, 3606-3621

Routes:

- GET /api/tickets - List all tickets (line 3320)
- POST /api/tickets - Create new ticket (line 3369)
- PUT /api/tickets/:id - Update ticket (line 3396)
- DELETE /api/tickets/:id - Delete ticket (line 3424)
- POST /api/tickets/migrate - Migrate tickets (line 3437)
- POST /api/import/tickets - Import tickets from CSV (line 3482) - NOTE: This route needs special handling in T053
- GET /api/backup/tickets - Export tickets (line 3606) - NOTE: This conflicts with backup routes in T053

**Kind**: global constant  

* * *

<a name="express"></a>

## express

Vulnerability Routes
Extracted from server.js lines: 1996-2016, 2019-2092, 2095-2156, 2159-2218, 2221-2283, 2337-2399, 2403-2514, 2517-2531, 3304-3317, 3501-3565

This is the largest and most complex module in HexTrackr, handling:

- Core vulnerability CRUD operations
- Statistics and analytics endpoints
- Import/export functionality (CSV imports, backup exports)
- Trend analysis and historical data
- Staging-based imports for performance
- Multi-vendor vulnerability data processing

Routes:

- GET /api/vulnerabilities/stats - Statistics with VPR totals (lines 1996-2016)
- GET /api/vulnerabilities/recent-trends - Recent trends for dashboard cards (lines 2019-2092)
- GET /api/vulnerabilities/trends - Historical trending data (lines 2095-2156)
- GET /api/vulnerabilities - List vulnerabilities with pagination/filters (lines 2159-2218)
- GET /api/vulnerabilities/resolved - List resolved vulnerabilities (lines 2221-2283)
- POST /api/vulnerabilities/import - Standard CSV import (lines 2337-2399)
- POST /api/vulnerabilities/import-staging - High-performance staging import (lines 2403-2514)
- DELETE /api/vulnerabilities/clear - Clear all vulnerability data (lines 2517-2531)
- GET /api/backup/vulnerabilities - Export vulnerability data (lines 3304-3317) - NOTE: Conflicts with backup routes
- POST /api/import/vulnerabilities - Web-based import (lines 3501-3565) - NOTE: Part of import system

**Kind**: global constant  

* * *

---
