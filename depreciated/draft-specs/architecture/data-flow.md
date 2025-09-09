# Data Flow Architecture Specification

## Purpose

Define the systematic flow of vulnerability and ticket data through HexTrackr's architecture, ensuring consistent data management, transformation, and synchronization across all system components.

## Success Criteria

- **Data Consistency**: All modules work with synchronized, validated data
- **Performance**: Data operations complete within acceptable time limits
- **Reliability**: Data integrity maintained through all transformations
- **Scalability**: Data flow supports increasing data volumes and complexity

## User Story

"As a network administrator, I want all parts of the system to show consistent, real-time data so that I can make informed decisions based on accurate vulnerability and ticket information."

## System Data Flow Overview

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Data Sources  │───▶│  Processing      │───▶│   Presentation  │
│                 │    │  Layer          │    │   Layer         │
├─────────────────┤    ├──────────────────┤    ├─────────────────┤
│ • CSV Files     │    │ • Data Manager   │    │ • Vuln Table    │
│ • Cisco APIs    │    │ • Rollover Logic │    │ • Statistics    │
│ • Tenable APIs  │    │ • Deduplication  │    │ • Charts        │
│ • Manual Input  │    │ • Validation     │    │ • Ticket Bridge │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

## Core Data Entities

### 1. Vulnerability Data

```javascript
// Raw vulnerability record from scanner
const rawVulnerability = {
  hostname: "server-01.domain.com",
  plugin_id: "19506",
  cve: "CVE-2023-1234",
  description: "Buffer overflow in...",
  severity: "High",
  first_found: "2025-01-15",
  last_found: "2025-03-10",
  // ... additional scanner fields
};

// Normalized vulnerability record
const normalizedVulnerability = {
  id: "uuid-v4-generated",
  normalizedHostname: "server-01", // hostname normalization
  dedupKey: "server-01|CVE-2023-1234", // deduplication identifier
  cve: "CVE-2023-1234",
  pluginId: "19506",
  severity: "HIGH", // standardized severity
  riskScore: 8.5, // calculated VPR score
  firstSeen: "2025-01-15T00:00:00Z",
  lastSeen: "2025-03-10T00:00:00Z",
  status: "ACTIVE", // ACTIVE, RESOLVED, NEW
  // ... normalized fields
};
```

### 2. Ticket Data

```javascript
// Ticket bridge record
const ticketRecord = {
  id: "ticket-uuid",
  ticketNumber: "INC123456",
  title: "Vulnerability Remediation - CVE-2023-1234",
  status: "IN_PROGRESS",
  priority: "HIGH", 
  assignedTo: "team-alpha",
  supervisor: "john.doe",
  site: "datacenter-east",
  devices: ["server-01", "server-02"],
  vulnerabilities: ["vuln-uuid-1", "vuln-uuid-2"], // linked vulnerabilities
  notes: "Markdown formatted notes...",
  dateSubmitted: "2025-03-11T10:30:00Z",
  dateDue: "2025-03-18T17:00:00Z"
};
```

## Data Flow Processes

### 1. Vulnerability Import Process

```
CSV File Upload
       ↓
   Papa.parse() ← Data validation
       ↓
Hostname Normalization ← Remove domain, standardize format
       ↓
Deduplication Key Generation ← hostname + CVE or plugin_id + description
       ↓
Rollover Logic Processing ← Current vs. historical comparison
       ↓
Database Storage ← SQLite with JSON fields
       ↓
Event Broadcast ← Notify all modules of new data
       ↓
UI Refresh ← Update all views with new data
```

**Key Implementation**:
```javascript
async function processVulnerabilityRowsWithRollover(csvData) {
  // Step 1: Validate and normalize
  const normalizedRows = csvData.map(row => ({
    ...row,
    normalizedHostname: normalizeHostname(row.hostname),
    dedupKey: generateDedupKey(row)
  }));
  
  // Step 2: Deduplication and rollover
  const results = await performRolloverAnalysis(normalizedRows);
  
  // Step 3: Database updates (sequential to prevent race conditions)
  for (const item of results) {
    await updateVulnerabilityRecord(item);
  }
  
  // Step 4: Broadcast updates
  eventBus.publish(EVENTS.DATA_LOADED, results);
  
  return results;
}
```

### 2. Rollover Logic Data Flow

```
New Import Data
       ↓
Load Current Vulnerabilities ← Query active records
       ↓
Deduplication Matching ← Compare dedupKeys
       ↓
Status Classification:
├─ NEW: Not in current set
├─ PERSISTENT: Found in both sets  
├─ RESOLVED: In current but not new
└─ UPDATED: Changed severity/details
       ↓
Database Updates ← Sequential processing
       ↓
Historical Snapshots ← Archive previous state
       ↓
Statistics Recalculation ← Update metrics
```

**Deduplication Algorithm**:
```javascript
function generateDedupKey(vulnerability) {
  const hostname = normalizeHostname(vulnerability.hostname);
  
  // Primary key: hostname + CVE
  if (vulnerability.cve && vulnerability.cve.trim()) {
    return `${hostname}|${vulnerability.cve.trim()}`;
  }
  
  // Fallback key: hostname + plugin_id + description hash
  const descHash = hashDescription(vulnerability.description);
  return `${hostname}|${vulnerability.plugin_id}|${descHash}`;
}

function normalizeHostname(hostname) {
  return hostname
    .toLowerCase()
    .split('.')[0] // Remove domain
    .replace(/[^a-z0-9-]/g, '-'); // Sanitize
}
```

### 3. Real-Time Data Synchronization

```
Data Change Event
       ↓
Event Bus Notification ← Central communication
       ↓
Module Update Cascade:
├─ Statistics Module ← Recalculate metrics
├─ Chart Module ← Update visualizations
├─ Table Module ← Refresh grid data
├─ Card Module ← Update card displays
└─ Search Module ← Reindex data
       ↓
UI State Synchronization ← Consistent views
       ↓
Performance Monitoring ← Track update times
```

## Database Schema and Data Storage

### SQLite Tables

```sql
-- Current active vulnerabilities
CREATE TABLE vulnerabilities_current (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  dedupKey TEXT UNIQUE NOT NULL,
  hostname TEXT NOT NULL,
  normalizedHostname TEXT NOT NULL,
  cve TEXT,
  plugin_id TEXT,
  description TEXT,
  severity TEXT,
  riskScore REAL,
  firstSeen TEXT,
  lastSeen TEXT,
  status TEXT DEFAULT 'ACTIVE',
  rawData TEXT, -- JSON blob with original scanner data
  lastUpdated TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Historical snapshots for trend analysis
CREATE TABLE vulnerability_snapshots (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  snapshot_date TEXT NOT NULL,
  vulnerability_data TEXT, -- JSON blob of all vulnerabilities at this point
  import_source TEXT,
  total_count INTEGER,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Ticket bridge system
CREATE TABLE tickets (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  ticketNumber TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  status TEXT NOT NULL,
  priority TEXT,
  assignedTo TEXT,
  supervisor TEXT,
  site TEXT,
  devices TEXT, -- JSON array of device names
  vulnerabilities TEXT, -- JSON array of vulnerability IDs
  notes TEXT, -- Markdown content
  dateSubmitted TEXT,
  dateDue TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);
```

### Data Relationships

```
vulnerabilities_current
       ↓ (1:N)
vulnerability_daily_totals (aggregated stats)
       ↓ (1:N)  
vulnerability_snapshots (historical data)

tickets
       ↓ (M:N via JSON arrays)
vulnerabilities_current (linked via dedupKey/hostname)
```

## State Management Architecture

### Centralized State Store

```javascript
class VulnerabilityDataStore {
  constructor() {
    this.state = {
      vulnerabilities: [],
      tickets: [],
      statistics: {},
      filters: {},
      selections: [],
      loading: false,
      error: null,
      lastUpdate: null
    };
    
    this.subscribers = [];
    this.eventBus = new EventBus();
  }
  
  // State updates
  setState(updates) {
    const prevState = { ...this.state };
    this.state = { ...this.state, ...updates };
    
    // Notify subscribers of state changes
    this.notifySubscribers(prevState, this.state);
    
    // Broadcast relevant events
    this.broadcastStateChanges(updates);
  }
  
  // Event-driven updates
  broadcastStateChanges(updates) {
    if (updates.vulnerabilities) {
      this.eventBus.publish(EVENTS.DATA_LOADED, updates.vulnerabilities);
    }
    if (updates.filters) {
      this.eventBus.publish(EVENTS.DATA_FILTERED, updates.filters);
    }
    if (updates.selections) {
      this.eventBus.publish(EVENTS.SELECTION_CHANGED, updates.selections);
    }
  }
}
```

## Data Validation and Integrity

### Input Validation Pipeline

```javascript
const ValidationPipeline = {
  // CSV data validation
  validateCSVRow(row) {
    const errors = [];
    
    // Required fields
    if (!row.hostname) errors.push('Missing hostname');
    if (!row.description) errors.push('Missing description');
    
    // Format validation
    if (row.cve && !this.isValidCVE(row.cve)) {
      errors.push('Invalid CVE format');
    }
    
    // Severity validation
    if (row.severity && !this.isValidSeverity(row.severity)) {
      errors.push('Invalid severity level');
    }
    
    return {
      valid: errors.length === 0,
      errors,
      normalized: this.normalizeRow(row)
    };
  },
  
  // Data integrity checks
  async validateDataIntegrity() {
    const checks = [
      this.checkDuplicateKeys(),
      this.checkOrphanedRecords(),
      this.checkDataConsistency(),
      this.checkReferentialIntegrity()
    ];
    
    const results = await Promise.all(checks);
    return results.every(check => check.passed);
  }
};
```

## Performance Optimization

### Data Loading Strategy

```javascript
class PerformantDataLoader {
  constructor() {
    this.cache = new Map();
    this.loadingPromises = new Map();
  }
  
  async loadVulnerabilities(filters = {}) {
    const cacheKey = this.generateCacheKey(filters);
    
    // Return cached data if available
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }
    
    // Avoid duplicate requests
    if (this.loadingPromises.has(cacheKey)) {
      return this.loadingPromises.get(cacheKey);
    }
    
    // Load data with performance monitoring
    const loadPromise = this.performLoad(filters);
    this.loadingPromises.set(cacheKey, loadPromise);
    
    try {
      const data = await loadPromise;
      this.cache.set(cacheKey, data);
      return data;
    } finally {
      this.loadingPromises.delete(cacheKey);
    }
  }
  
  // Pagination for large datasets
  async loadPaginatedData(page, size, filters) {
    const offset = (page - 1) * size;
    const query = this.buildPaginationQuery(offset, size, filters);
    
    return {
      data: await this.executeQuery(query),
      pagination: {
        page,
        size,
        total: await this.getTotalCount(filters),
        hasMore: await this.hasMorePages(page, size, filters)
      }
    };
  }
}
```

### Memory Management

```javascript
class DataMemoryManager {
  constructor() {
    this.maxCacheSize = 50; // MB
    this.cleanupThreshold = 0.8; // 80% of max
  }
  
  manageMemory() {
    const memoryUsage = this.getMemoryUsage();
    
    if (memoryUsage > this.maxCacheSize * this.cleanupThreshold) {
      this.performCleanup();
    }
  }
  
  performCleanup() {
    // Remove least recently used cache entries
    // Clean up event listeners
    // Garbage collect large objects
  }
}
```

## Error Handling and Recovery

### Data Flow Error Scenarios

```javascript
class DataFlowErrorHandler {
  async handleImportError(error, context) {
    switch (error.type) {
      case 'VALIDATION_ERROR':
        return this.handleValidationError(error, context);
      
      case 'DUPLICATE_KEY_ERROR':
        return this.handleDuplicateKeyError(error, context);
      
      case 'DATABASE_ERROR':
        return this.handleDatabaseError(error, context);
      
      case 'NETWORK_ERROR':
        return this.handleNetworkError(error, context);
      
      default:
        return this.handleUnknownError(error, context);
    }
  }
  
  async recoverFromFailure(failureContext) {
    // Implement automatic recovery strategies
    // - Retry with exponential backoff
    // - Fallback to cached data
    // - Graceful degradation
    // - User notification
  }
}
```

This data flow architecture ensures HexTrackr maintains consistent, reliable data management while supporting the complexity required for effective vulnerability and ticket coordination.