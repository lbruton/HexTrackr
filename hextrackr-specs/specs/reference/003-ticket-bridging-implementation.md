# Ticket Bridging - Implementation Reference

**Reference for**: `specs/003-ticket-bridging/spec.md`  
**Purpose**: Technical implementation details extracted from draft specifications  
**Status**: Implementation guidance for multi-platform ticket coordination

---

## Database Schema

```sql
CREATE TABLE tickets (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  ticketNumber TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'NEW',
  priority TEXT NOT NULL DEFAULT 'MEDIUM',
  assignedTo TEXT, -- Team identifier
  supervisor TEXT, -- Supervisor contact
  site TEXT, -- Physical location/site
  devices TEXT, -- JSON array of device hostnames
  vulnerabilities TEXT, -- JSON array of vulnerability references
  externalTickets TEXT, -- JSON array of external ticket references
  notes TEXT, -- Markdown formatted notes
  dateSubmitted TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  dateDue TEXT,
  dateCompleted TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Performance indexes
CREATE INDEX idx_tickets_status ON tickets(status);
CREATE INDEX idx_tickets_assigned ON tickets(assignedTo);
CREATE INDEX idx_tickets_due ON tickets(dateDue);
CREATE INDEX idx_tickets_site ON tickets(site);
CREATE INDEX idx_tickets_compound ON tickets(status, assignedTo, dateDue);
CREATE INDEX idx_tickets_devices ON tickets(devices); -- For device search
CREATE INDEX idx_tickets_search ON tickets(title, description); -- Full-text search
```

## Core Ticket Model

```javascript
class Ticket {
  constructor(data) {
    this.id = data.id;
    this.ticketNumber = data.ticketNumber || this.generateTicketNumber();
    this.title = data.title;
    this.description = data.description || '';
    this.status = data.status || 'NEW';
    this.priority = data.priority || 'MEDIUM';
    this.assignedTo = data.assignedTo;
    this.supervisor = data.supervisor;
    this.site = data.site;
    this.devices = Array.isArray(data.devices) ? data.devices : JSON.parse(data.devices || '[]');
    this.vulnerabilities = Array.isArray(data.vulnerabilities) ? data.vulnerabilities : JSON.parse(data.vulnerabilities || '[]');
    this.externalTickets = Array.isArray(data.externalTickets) ? data.externalTickets : JSON.parse(data.externalTickets || '[]');
    this.notes = data.notes || '';
    this.dateSubmitted = data.dateSubmitted;
    this.dateDue = data.dateDue;
    this.dateCompleted = data.dateCompleted;
  }
  
  generateTicketNumber() {
    const prefix = 'HT'; // HexTrackr prefix
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.random().toString(36).substr(2, 3).toUpperCase();
    return `${prefix}${timestamp}${random}`;
  }
  
  isOverdue() {
    if (!this.dateDue) return false;
    return new Date(this.dateDue) < new Date() && this.status !== 'CLOSED';
  }
  
  getDaysUntilDue() {
    if (!this.dateDue) return null;
    const dueDate = new Date(this.dateDue);
    const today = new Date();
    const diffTime = dueDate - today;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }
  
  toJSON() {
    return {
      id: this.id,
      ticketNumber: this.ticketNumber,
      title: this.title,
      description: this.description,
      status: this.status,
      priority: this.priority,
      assignedTo: this.assignedTo,
      supervisor: this.supervisor,
      site: this.site,
      devices: this.devices,
      vulnerabilities: this.vulnerabilities,
      externalTickets: this.externalTickets,
      notes: this.notes,
      dateSubmitted: this.dateSubmitted,
      dateDue: this.dateDue,
      dateCompleted: this.dateCompleted,
      isOverdue: this.isOverdue(),
      daysUntilDue: this.getDaysUntilDue()
    };
  }
}
```

## Ticket Management API

```javascript
class TicketManager {
  constructor(database) {
    this.db = database;
  }
  
  async createTicket(ticketData) {
    const ticket = new Ticket(ticketData);
    
    const query = `
      INSERT INTO tickets (
        ticketNumber, title, description, status, priority,
        assignedTo, supervisor, site, devices, vulnerabilities,
        externalTickets, notes, dateSubmitted, dateDue
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    const params = [
      ticket.ticketNumber,
      ticket.title,
      ticket.description,
      ticket.status,
      ticket.priority,
      ticket.assignedTo,
      ticket.supervisor,
      ticket.site,
      JSON.stringify(ticket.devices),
      JSON.stringify(ticket.vulnerabilities),
      JSON.stringify(ticket.externalTickets),
      ticket.notes,
      ticket.dateSubmitted,
      ticket.dateDue
    ];
    
    const result = await this.db.run(query, params);
    ticket.id = result.lastID;
    
    // Log ticket creation
    console.log(`Created ticket ${ticket.ticketNumber}:`, ticket.title);
    
    return ticket;
  }
  
  async updateTicket(id, updates) {
    // Build dynamic update query
    const fields = [];
    const values = [];
    
    for (const [key, value] of Object.entries(updates)) {
      if (key === 'devices' || key === 'vulnerabilities' || key === 'externalTickets') {
        fields.push(`${key} = ?`);
        values.push(JSON.stringify(value));
      } else {
        fields.push(`${key} = ?`);
        values.push(value);
      }
    }
    
    // Always update the updated_at timestamp
    fields.push('updated_at = ?');
    values.push(new Date().toISOString());
    values.push(id);
    
    const query = `UPDATE tickets SET ${fields.join(', ')} WHERE id = ?`;
    await this.db.run(query, values);
    
    return this.getTicketById(id);
  }
  
  async getTicketById(id) {
    const query = 'SELECT * FROM tickets WHERE id = ?';
    const row = await this.db.get(query, [id]);
    return row ? new Ticket(row) : null;
  }
  
  async getTickets(filters = {}) {
    let query = 'SELECT * FROM tickets WHERE 1=1';
    const params = [];
    
    // Apply filters
    if (filters.status) {
      query += ' AND status = ?';
      params.push(filters.status);
    }
    
    if (filters.assignedTo) {
      query += ' AND assignedTo = ?';
      params.push(filters.assignedTo);
    }
    
    if (filters.site) {
      query += ' AND site = ?';
      params.push(filters.site);
    }
    
    if (filters.overdue) {
      query += ' AND dateDue < ? AND status != "CLOSED"';
      params.push(new Date().toISOString());
    }
    
    // Sorting
    query += ' ORDER BY dateSubmitted DESC';
    
    const rows = await this.db.all(query, params);
    return rows.map(row => new Ticket(row));
  }
  
  async deleteTicket(id) {
    const query = 'DELETE FROM tickets WHERE id = ?';
    await this.db.run(query, [id]);
  }
}
```

## Export System Implementation

```javascript
class TicketExportManager {
  constructor() {
    this.templates = {
      servicenow: this.generateServiceNowTemplate,
      jira: this.generateJiraTemplate,
      generic: this.generateGenericTemplate
    };
  }
  
  async exportTicket(ticket, format = 'generic') {
    const template = this.templates[format] || this.templates.generic;
    return template(ticket);
  }
  
  generateServiceNowTemplate(ticket) {
    return `# ServiceNow Ticket: ${ticket.ticketNumber}

## Summary
**Title:** ${ticket.title}
**Priority:** ${ticket.priority}
**Status:** ${ticket.status}
**Assigned To:** ${ticket.assignedTo}
**Supervisor:** ${ticket.supervisor}
**Site:** ${ticket.site}
**Due Date:** ${ticket.dateDue || 'Not set'}

## Description
${ticket.description}

## Affected Devices
${ticket.devices.map(device => `- ${device}`).join('\n')}

## Related Vulnerabilities
${ticket.vulnerabilities.map(vuln => `- ${vuln}`).join('\n')}

## Technical Notes
${ticket.notes}

## External References
${ticket.externalTickets.map(ext => `- ${ext.system}: ${ext.ticketId} (${ext.url})`).join('\n')}

---
*Generated by HexTrackr on ${new Date().toISOString()}*
`;
  }
  
  generateJiraTemplate(ticket) {
    return `{panel:title=Ticket Summary|borderStyle=solid}
*Title:* ${ticket.title}
*Priority:* ${ticket.priority}
*Status:* ${ticket.status}
*Assigned To:* ${ticket.assignedTo}
*Due Date:* ${ticket.dateDue || 'Not set'}
{panel}

h2. Description
${ticket.description}

h2. Affected Devices
${ticket.devices.map(device => `* ${device}`).join('\n')}

h2. Vulnerabilities
${ticket.vulnerabilities.map(vuln => `* ${vuln}`).join('\n')}

h2. Notes
${ticket.notes}

----
_Generated by HexTrackr Ticket Bridge System_
`;
  }
  
  async exportMultipleTickets(tickets, formats = ['generic']) {
    const exports = {};
    
    for (const format of formats) {
      exports[format] = [];
      
      for (const ticket of tickets) {
        const exported = await this.exportTicket(ticket, format);
        exports[format].push({
          filename: `${ticket.ticketNumber}_${format}.md`,
          content: exported
        });
      }
    }
    
    return exports;
  }
  
  async createZipPackage(tickets, formats = ['generic']) {
    const archiver = require('archiver');
    const fs = require('fs');
    const path = require('path');
    
    const exports = await this.exportMultipleTickets(tickets, formats);
    const zipPath = path.join(__dirname, '../uploads', `tickets_${Date.now()}.zip`);
    
    const output = fs.createWriteStream(zipPath);
    const archive = archiver('zip');
    
    archive.pipe(output);
    
    // Add files to zip
    for (const [format, files] of Object.entries(exports)) {
      for (const file of files) {
        archive.append(file.content, { name: `${format}/${file.filename}` });
      }
    }
    
    await archive.finalize();
    
    return new Promise((resolve, reject) => {
      output.on('close', () => resolve(zipPath));
      archive.on('error', reject);
    });
  }
}
```

## User Interface Implementation

### Dashboard HTML

```html
<div class="container-fluid">
  <!-- Ticket Statistics Cards -->
  <div class="row mb-4">
    <div class="col-md-3">
      <div class="card">
        <div class="card-body">
          <div class="d-flex align-items-center">
            <div class="subheader">Total Tickets</div>
            <div class="ms-auto">
              <span class="text-primary h1" id="totalTickets">0</span>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="col-md-3">
      <div class="card">
        <div class="card-body">
          <div class="d-flex align-items-center">
            <div class="subheader">Overdue</div>
            <div class="ms-auto">
              <span class="text-danger h1" id="overdueTickets">0</span>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="col-md-3">
      <div class="card">
        <div class="card-body">
          <div class="d-flex align-items-center">
            <div class="subheader">In Progress</div>
            <div class="ms-auto">
              <span class="text-info h1" id="inProgressTickets">0</span>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="col-md-3">
      <div class="card">
        <div class="card-body">
          <div class="d-flex align-items-center">
            <div class="subheader">Completed</div>
            <div class="ms-auto">
              <span class="text-success h1" id="completedTickets">0</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  
  <!-- Filters and Actions -->
  <div class="row mb-3">
    <div class="col-md-8">
      <div class="btn-group" role="group">
        <input type="radio" class="btn-check" name="statusFilter" id="all" value="all" checked>
        <label class="btn btn-outline-primary" for="all">All</label>
        
        <input type="radio" class="btn-check" name="statusFilter" id="active" value="active">
        <label class="btn btn-outline-primary" for="active">Active</label>
        
        <input type="radio" class="btn-check" name="statusFilter" id="overdue" value="overdue">
        <label class="btn btn-outline-danger" for="overdue">Overdue</label>
      </div>
    </div>
    <div class="col-md-4 text-end">
      <div class="btn-group">
        <button class="btn btn-primary" id="createTicket">
          <i class="fas fa-plus"></i> New Ticket
        </button>
        <button class="btn btn-outline-primary" id="exportSelected">
          <i class="fas fa-download"></i> Export
        </button>
      </div>
    </div>
  </div>
  
  <!-- Tickets Table -->
  <div class="card">
    <div class="table-responsive">
      <table class="table table-vcenter card-table">
        <thead>
          <tr>
            <th><input type="checkbox" id="selectAll"></th>
            <th>Ticket #</th>
            <th>Title</th>
            <th>Status</th>
            <th>Priority</th>
            <th>Assigned</th>
            <th>Site</th>
            <th>Due Date</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody id="ticketsTableBody">
          <!-- Dynamically populated -->
        </tbody>
      </table>
    </div>
  </div>
</div>
```

### Ticket Creation Modal

```html
<div class="modal fade" id="ticketModal" tabindex="-1">
  <div class="modal-dialog modal-lg">
    <div class="modal-content">
      <form id="ticketForm">
        <div class="modal-header">
          <h5 class="modal-title">Create New Ticket</h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
        </div>
        <div class="modal-body">
          <div class="row">
            <div class="col-md-8">
              <div class="mb-3">
                <label class="form-label">Title *</label>
                <input type="text" class="form-control" name="title" required>
              </div>
            </div>
            <div class="col-md-4">
              <div class="mb-3">
                <label class="form-label">Priority</label>
                <select class="form-select" name="priority">
                  <option value="LOW">Low</option>
                  <option value="MEDIUM" selected>Medium</option>
                  <option value="HIGH">High</option>
                  <option value="CRITICAL">Critical</option>
                </select>
              </div>
            </div>
          </div>
          
          <div class="mb-3">
            <label class="form-label">Description</label>
            <textarea class="form-control" rows="3" name="description"></textarea>
          </div>
          
          <div class="row">
            <div class="col-md-4">
              <div class="mb-3">
                <label class="form-label">Assigned Team</label>
                <select class="form-select" name="assignedTo">
                  <option value="">Select Team...</option>
                  <option value="team-alpha">Team Alpha</option>
                  <option value="team-beta">Team Beta</option>
                  <option value="contractor-external">External Contractor</option>
                </select>
              </div>
            </div>
            <div class="col-md-4">
              <div class="mb-3">
                <label class="form-label">Supervisor</label>
                <input type="text" class="form-control" name="supervisor" placeholder="john.doe@company.com">
              </div>
            </div>
            <div class="col-md-4">
              <div class="mb-3">
                <label class="form-label">Site</label>
                <input type="text" class="form-control" name="site" placeholder="datacenter-east">
              </div>
            </div>
          </div>
          
          <div class="row">
            <div class="col-md-6">
              <div class="mb-3">
                <label class="form-label">Due Date</label>
                <input type="datetime-local" class="form-control" name="dateDue">
              </div>
            </div>
            <div class="col-md-6">
              <div class="mb-3">
                <label class="form-label">Status</label>
                <select class="form-select" name="status">
                  <option value="NEW">New</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="TESTING">Testing</option>
                  <option value="CLOSED">Closed</option>
                </select>
              </div>
            </div>
          </div>
          
          <div class="mb-3">
            <label class="form-label">Affected Devices</label>
            <textarea class="form-control" rows="2" name="devices" placeholder="server-01, server-02, workstation-03"></textarea>
            <div class="form-text">Enter device hostnames separated by commas</div>
          </div>
          
          <div class="mb-3">
            <label class="form-label">Notes</label>
            <textarea class="form-control" rows="4" name="notes" placeholder="Use markdown formatting..."></textarea>
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
          <button type="submit" class="btn btn-primary">Save Ticket</button>
        </div>
      </form>
    </div>
  </div>
</div>
```

## Integration Workflows

### ServiceNow Integration

```javascript
class ServiceNowIntegration {
  constructor(config) {
    this.baseUrl = config.instanceUrl;
    this.credentials = config.credentials;
    this.tableName = config.tableName || 'incident';
  }
  
  async createTicketInServiceNow(hextrackrTicket) {
    const serviceNowData = this.mapToServiceNowFormat(hextrackrTicket);
    
    try {
      const response = await fetch(`${this.baseUrl}/api/now/table/${this.tableName}`, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${btoa(this.credentials)}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(serviceNowData)
      });
      
      const result = await response.json();
      
      if (response.ok) {
        // Update HexTrackr ticket with ServiceNow reference
        await this.updateExternalTicketReference(hextrackrTicket.id, 'servicenow', result.result.number);
        return { success: true, ticketNumber: result.result.number };
      } else {
        throw new Error(`ServiceNow API error: ${result.error.message}`);
      }
    } catch (error) {
      console.error('ServiceNow integration error:', error);
      return { success: false, error: error.message };
    }
  }
  
  mapToServiceNowFormat(ticket) {
    return {
      short_description: ticket.title,
      description: this.buildServiceNowDescription(ticket),
      priority: this.mapPriority(ticket.priority),
      assigned_to: ticket.assignedTo,
      location: ticket.site,
      u_devices: ticket.devices.join(', '),
      u_hextrackr_id: ticket.ticketNumber
    };
  }
  
  buildServiceNowDescription(ticket) {
    return `
${ticket.description}

Affected Devices:
${ticket.devices.map(device => `- ${device}`).join('\n')}

Related Vulnerabilities:
${ticket.vulnerabilities.join(', ')}

Technical Notes:
${ticket.notes}

Generated by HexTrackr Ticket Bridge System
Original Ticket: ${ticket.ticketNumber}
`.trim();
  }
}
```

## Testing Implementation

### Unit Tests

```javascript
describe('Ticket Management', () => {
  let ticketManager;
  
  beforeEach(() => {
    ticketManager = new TicketManager(mockDatabase);
  });
  
  describe('Ticket Creation', () => {
    test('should create ticket with auto-generated number', async () => {
      const ticketData = {
        title: 'Test Vulnerability Remediation',
        priority: 'HIGH',
        assignedTo: 'team-alpha'
      };
      
      const ticket = await ticketManager.createTicket(ticketData);
      
      expect(ticket.ticketNumber).toMatch(/^HT\d{6}[A-Z0-9]{3}$/);
      expect(ticket.title).toBe(ticketData.title);
      expect(ticket.priority).toBe(ticketData.priority);
    });
    
    test('should handle missing optional fields', async () => {
      const minimalData = { title: 'Minimal Test Ticket' };
      const ticket = await ticketManager.createTicket(minimalData);
      
      expect(ticket.priority).toBe('MEDIUM'); // default
      expect(ticket.status).toBe('NEW'); // default
      expect(ticket.devices).toEqual([]); // empty array
    });
  });
  
  describe('Ticket Queries', () => {
    test('should filter tickets by status', async () => {
      const tickets = await ticketManager.getTickets({ status: 'IN_PROGRESS' });
      tickets.forEach(ticket => {
        expect(ticket.status).toBe('IN_PROGRESS');
      });
    });
    
    test('should identify overdue tickets', async () => {
      const overdueTickets = await ticketManager.getTickets({ overdue: true });
      overdueTickets.forEach(ticket => {
        expect(ticket.isOverdue()).toBe(true);
      });
    });
  });
});

describe('Export System', () => {
  let exportManager;
  
  beforeEach(() => {
    exportManager = new TicketExportManager();
  });
  
  test('should generate ServiceNow formatted export', async () => {
    const ticket = new Ticket({
      ticketNumber: 'HT123456ABC',
      title: 'Test Ticket',
      devices: ['server-01', 'server-02']
    });
    
    const exported = await exportManager.exportTicket(ticket, 'servicenow');
    
    expect(exported).toContain('ServiceNow Ticket: HT123456ABC');
    expect(exported).toContain('- server-01');
    expect(exported).toContain('- server-02');
  });
  
  test('should create zip package with multiple formats', async () => {
    const tickets = [new Ticket({ title: 'Test 1' }), new Ticket({ title: 'Test 2' })];
    const zipPath = await exportManager.createZipPackage(tickets, ['servicenow', 'jira']);
    
    expect(fs.existsSync(zipPath)).toBe(true);
    
    // Cleanup
    fs.unlinkSync(zipPath);
  });
});
```

## Performance Considerations

### Database Optimization

```sql
-- Optimized queries for common operations
SELECT 
  status,
  COUNT(*) as count,
  COUNT(CASE WHEN dateDue < datetime('now') AND status != 'CLOSED' THEN 1 END) as overdue_count
FROM tickets 
GROUP BY status;
```

### Caching Strategy

```javascript
class TicketCache {
  constructor() {
    this.cache = new Map();
    this.TTL = 5 * 60 * 1000; // 5 minutes
  }
  
  get(key) {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.TTL) {
      return cached.data;
    }
    this.cache.delete(key);
    return null;
  }
  
  set(key, data) {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }
  
  invalidate(pattern) {
    for (const key of this.cache.keys()) {
      if (key.includes(pattern)) {
        this.cache.delete(key);
      }
    }
  }
}
```

## Required Dependencies

```javascript
// package.json additions
{
  "dependencies": {
    "archiver": "^5.3.1",
    "node-fetch": "^3.3.1"
  }
}
```

This implementation reference provides comprehensive technical details for building the ticket bridging system with multi-platform export capabilities, database optimization, and integration workflows.
