# Test Data Model: E2E Testing Suite

## Overview

This document defines the structure of test fixtures and data models used in the Playwright E2E testing suite. All fixtures are designed to validate the requirements from spec 000-hextrackr-master-truth.

## User Fixtures

### User Roles

```javascript
{
  "securityAnalyst": {
    "id": "user-001",
    "email": "analyst@hextrackr.test",
    "password": "Test123!@#",
    "role": "security_analyst",
    "permissions": [
      "vulnerability.import",
      "vulnerability.view",
      "vulnerability.export",
      "dashboard.view"
    ],
    "firstName": "Sarah",
    "lastName": "Analyst",
    "department": "Security Operations"
  },
  
  "networkAdmin": {
    "id": "user-002",
    "email": "admin@hextrackr.test",
    "password": "Admin123!@#",
    "role": "network_admin",
    "permissions": [
      "ticket.create",
      "ticket.update",
      "ticket.export",
      "device.manage",
      "vulnerability.view"
    ],
    "firstName": "John",
    "lastName": "Admin",
    "department": "Network Operations"
  },
  
  "manager": {
    "id": "user-003",
    "email": "manager@hextrackr.test",
    "password": "Manager123!@#",
    "role": "manager",
    "permissions": [
      "dashboard.view",
      "reports.generate",
      "analytics.view",
      "export.all"
    ],
    "firstName": "Maria",
    "lastName": "Manager",
    "department": "IT Management"
  },
  
  "complianceOfficer": {
    "id": "user-004",
    "email": "compliance@hextrackr.test",
    "password": "Comply123!@#",
    "role": "compliance_officer",
    "permissions": [
      "audit.view",
      "audit.export",
      "compliance.reports",
      "data.retention"
    ],
    "firstName": "David",
    "lastName": "Compliance",
    "department": "Risk & Compliance"
  }
}
```

## Vulnerability Data Fixtures

### CSV Import Formats

#### Tenable Format

```csv
Plugin,CVE,CVSS,Risk,Host,Protocol,Port,Name
19506,CVE-2024-0001,7.5,High,192.168.1.100,tcp,443,SSL Certificate Vulnerability
20007,CVE-2024-0002,9.8,Critical,192.168.1.101,tcp,22,SSH Vulnerability
```

#### Cisco Format

```csv
Device,Vulnerability ID,Severity,Score,Description,Remediation
ASA-5506-X,CVE-2024-0001,HIGH,7.5,SSL/TLS Vulnerability,Update to latest firmware
ISR-4431,CVE-2024-0002,CRITICAL,9.8,Remote Code Execution,Apply security patch
```

#### Qualys Format

```csv
QID,Title,Vuln Status,Severity,IP,DNS,OS,CVE ID
90001,SSL Certificate Issue,Active,3,192.168.1.100,device1.local,Windows Server 2019,CVE-2024-0001
90002,SSH Configuration Issue,Active,5,192.168.1.101,device2.local,Linux Ubuntu 20.04,CVE-2024-0002
```

### Size Variants

```javascript
{
  "small": {
    "records": 100,
    "fileSize": "~50KB",
    "purpose": "Quick functional tests"
  },
  
  "medium": {
    "records": 5000,
    "fileSize": "~2.5MB",
    "purpose": "Standard workflow tests"
  },
  
  "large": {
    "records": 25000,
    "fileSize": "~12MB",
    "purpose": "Performance validation"
  },
  
  "xlarge": {
    "records": 100000,
    "fileSize": "~50MB",
    "purpose": "Stress testing"
  }
}
```

## Device Fixtures

### Device Inventory

```javascript
{
  "devices": [
    {
      "id": "dev-001",
      "hostname": "fw-prod-01",
      "ip": "192.168.1.1",
      "type": "firewall",
      "vendor": "Cisco",
      "model": "ASA-5516-X",
      "location": "Data Center A",
      "criticality": "high",
      "vulnerabilityCount": 45
    },
    {
      "id": "dev-002",
      "hostname": "sw-core-01",
      "ip": "192.168.1.2",
      "type": "switch",
      "vendor": "Cisco",
      "model": "Catalyst 9300",
      "location": "Data Center A",
      "criticality": "critical",
      "vulnerabilityCount": 23
    },
    {
      "id": "dev-003",
      "hostname": "srv-web-01",
      "ip": "192.168.10.100",
      "type": "server",
      "vendor": "Dell",
      "model": "PowerEdge R740",
      "os": "Windows Server 2019",
      "location": "Data Center B",
      "criticality": "high",
      "vulnerabilityCount": 67
    }
  ]
}
```

## Ticket Fixtures

### Ticket Templates

```javascript
{
  "serviceNowTicket": {
    "template": "servicenow",
    "fields": {
      "short_description": "Multiple Critical Vulnerabilities on {device}",
      "description": "Automated ticket for vulnerability remediation",
      "priority": "2 - High",
      "category": "Security",
      "subcategory": "Vulnerability",
      "assignment_group": "Network Security",
      "urgency": "2 - High",
      "impact": "2 - High"
    }
  },
  
  "hexagonTicket": {
    "template": "hexagon",
    "fields": {
      "title": "Security Vulnerabilities Detected",
      "type": "Incident",
      "severity": "Major",
      "description": "Multiple vulnerabilities require remediation",
      "affected_ci": "{device_list}",
      "team": "Infrastructure"
    }
  }
}
```

## Performance Baselines

### Expected Metrics

```javascript
{
  "performance": {
    "pageLoad": {
      "dashboard": 200,  // ms
      "vulnerabilities": 500,  // ms
      "tickets": 300  // ms
    },
    
    "dataOperations": {
      "csvImport_1000": 5000,  // ms
      "csvImport_25000": 30000,  // ms
      "tableSort": 100,  // ms
      "tableFilter": 150,  // ms
      "export": 2000  // ms
    },
    
    "charts": {
      "initial": 200,  // ms
      "update": 100  // ms
    },
    
    "websocket": {
      "progressInterval": 100,  // ms
      "latency": 50  // ms
    }
  }
}
```

## Dashboard State Fixtures

### Dashboard Configurations

```javascript
{
  "emptyDashboard": {
    "vulnerabilities": 0,
    "tickets": 0,
    "devices": 0,
    "charts": "no-data"
  },
  
  "smallDataset": {
    "vulnerabilities": 100,
    "critical": 10,
    "high": 30,
    "medium": 40,
    "low": 20,
    "devices": 10,
    "tickets": 5
  },
  
  "largeDataset": {
    "vulnerabilities": 25000,
    "critical": 2500,
    "high": 7500,
    "medium": 10000,
    "low": 5000,
    "devices": 500,
    "tickets": 150
  }
}
```

## Test Execution Context

### Browser Contexts

```javascript
{
  "desktop": {
    "viewport": { "width": 1920, "height": 1080 },
    "userAgent": "desktop",
    "deviceScaleFactor": 1
  },
  
  "tablet": {
    "viewport": { "width": 768, "height": 1024 },
    "userAgent": "tablet",
    "deviceScaleFactor": 2,
    "hasTouch": true
  },
  
  "mobile": {
    "viewport": { "width": 375, "height": 667 },
    "userAgent": "mobile",
    "deviceScaleFactor": 3,
    "hasTouch": true,
    "isMobile": true
  }
}
```

## Audit Trail Fixtures

### Audit Events

```javascript
{
  "auditEvents": [
    {
      "id": "evt-001",
      "timestamp": "2024-01-15T10:30:00Z",
      "user": "analyst@hextrackr.test",
      "action": "IMPORT_CSV",
      "details": {
        "filename": "vulnerabilities_scan_jan.csv",
        "records": 5000,
        "duration": 4500
      }
    },
    {
      "id": "evt-002",
      "timestamp": "2024-01-15T11:00:00Z",
      "user": "admin@hextrackr.test",
      "action": "CREATE_TICKET",
      "details": {
        "ticketId": "TKT-2024-001",
        "devices": 3,
        "vulnerabilities": 15
      }
    },
    {
      "id": "evt-003",
      "timestamp": "2024-01-15T14:00:00Z",
      "user": "manager@hextrackr.test",
      "action": "EXPORT_REPORT",
      "details": {
        "format": "PDF",
        "type": "Executive Summary"
      }
    }
  ]
}
```

## Compliance Data

### Data Retention Records

```javascript
{
  "retentionPolicies": {
    "vulnerabilityData": {
      "retention": "365 days",
      "purgeAfter": "400 days",
      "archiveLocation": "cold-storage"
    },
    
    "auditLogs": {
      "retention": "2555 days",  // 7 years
      "purgeAfter": "never",
      "archiveLocation": "compliance-archive"
    },
    
    "tickets": {
      "retention": "180 days",
      "purgeAfter": "365 days",
      "archiveLocation": "ticket-archive"
    }
  }
}
```

## Mock API Responses

### WebSocket Messages

```javascript
{
  "progressUpdate": {
    "type": "progress",
    "data": {
      "current": 1000,
      "total": 25000,
      "percentage": 4,
      "message": "Processing records...",
      "eta": "5 minutes"
    }
  },
  
  "completionMessage": {
    "type": "complete",
    "data": {
      "total": 25000,
      "imported": 24950,
      "duplicates": 50,
      "errors": 0,
      "duration": 28500
    }
  },
  
  "errorMessage": {
    "type": "error",
    "data": {
      "message": "Import failed",
      "details": "Invalid CSV format at line 1001",
      "code": "INVALID_FORMAT"
    }
  }
}
```

## Validation Rules

### Data Constraints

```javascript
{
  "validation": {
    "cve": {
      "pattern": "^CVE-\\d{4}-\\d{4,}$",
      "required": true
    },
    
    "severity": {
      "enum": ["Critical", "High", "Medium", "Low", "Info"],
      "required": true
    },
    
    "vpr": {
      "min": 0,
      "max": 10,
      "precision": 1
    },
    
    "ipAddress": {
      "pattern": "^(?:[0-9]{1,3}\\.){3}[0-9]{1,3}$",
      "required": false
    },
    
    "hostname": {
      "maxLength": 255,
      "pattern": "^[a-zA-Z0-9-._]+$"
    }
  }
}
```

---
*Data model for E2E test fixtures - Spec 001*
