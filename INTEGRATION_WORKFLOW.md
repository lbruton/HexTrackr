# HexTrackr Integration Workflow Guide

## Overview

HexTrackr provides seamless bi-directional integration between vulnerability management and ticketing systems, designed specifically for network administrators who need to efficiently manage security workflows.

## Key Integration Features

### 🔄 **Vulnerability-to-Ticket Flow**

1. **From Vulnerability Dashboard**
   - Click "Edit" on any vulnerability card
   - Click "Open Hexagon Ticket" button in the modal
   - System automatically creates ticket with:
     - Pre-populated device information
     - Severity-based priority and due dates
     - Auto-generated remediation template
     - Direct linking between vulnerability and ticket

2. **Template Generation**
   - CVE details and VPR scores
   - Affected systems and remediation steps
   - Priority levels and time estimates
   - Copy-to-clipboard functionality

### 🎯 **Ticket-to-Vulnerability Flow**

1. **From Ticket Management**
   - Device names in tickets become clickable links
   - Links navigate to vulnerability dashboard filtered by device
   - Visual indicators show devices with active vulnerabilities
   - Vulnerability count badges on device entries

2. **Cross-Reference Integration**
   - Tickets automatically link to vulnerabilities on same devices
   - Vulnerability updates reflect in associated tickets
   - Real-time sync between both systems

## Workflow Examples

### Example 1: Critical Vulnerability Response

1. **Weekly Report Import**
   ```
   Upload weekly vulnerability report → Process CSV data → 
   Identify critical vulnerabilities → Click "Edit" on critical vuln →
   Click "Open Hexagon Ticket" → Auto-generated ticket with 7-day due date
   ```

2. **Remediation Tracking**
   ```
   Ticket created → Copy remediation template → 
   Apply fixes → Update ticket status → 
   Vulnerability automatically marked as addressed
   ```

### Example 2: Device-Focused Management

1. **Device Investigation**
   ```
   Ticket shows "host01" → Click device link → 
   Vulnerability dashboard filtered to host01 → 
   View all vulnerabilities for that device →
   Create consolidated remediation plan
   ```

2. **Multi-Device Tickets**
   ```
   Single ticket covers multiple devices → 
   Each device links to its vulnerability profile →
   Comprehensive security posture view
   ```

## API Integration Workflow

### Cisco Security API Integration

1. **Automated Data Enrichment**
   ```
   Import vulnerability data → Check for missing CVE details →
   Query Cisco Security API → Enrich with VPR scores →
   Auto-update severity classifications
   ```

2. **Real-time Updates**
   ```
   Daily API checks → New advisory data → 
   Update existing vulnerabilities → 
   Generate alerts for new critical issues
   ```

### Tenable Integration

1. **Scan Data Processing**
   ```
   Tenable scan results → Normalize to HexTrackr format →
   Cross-reference with existing tickets → 
   Identify new vulnerabilities requiring tickets
   ```

## Storage and Synchronization

### Local Storage (Small Datasets)

- Browser localStorage for quick access
- Immediate updates and filtering
- Suitable for <1000 vulnerabilities

### Turso Database (Large Datasets)

- Cloud SQLite for 100K+ records
- Team collaboration and sharing
- Automated backup and versioning
- Cross-device synchronization

## Template System

### Auto-Generated Templates

**Critical Vulnerability Template:**
```
PRIORITY: Urgent (7-day deadline)
DEVICE: [hostname]
CVE: [cve_id]
VPR: [vpr_score]

IMMEDIATE ACTIONS:
1. Isolate affected system
2. Apply emergency patch
3. Verify patch effectiveness
4. Document remediation
```

**Standard Vulnerability Template:**
```
PRIORITY: [severity-based]
DEVICE: [hostname]
TIMELINE: [severity-based deadline]

REMEDIATION STEPS:
1. Review vulnerability details
2. Test patches in staging
3. Schedule maintenance window
4. Apply fixes and verify
```

## Advanced Features

### Smart Consolidation

- Detects multiple vulnerabilities on same device
- Suggests ticket consolidation
- Reduces administrative overhead

### Cross-System Linking

- Vulnerability IDs linked to ticket IDs
- Device-based association
- Status synchronization

### Automated Prioritization

- VPR score-based urgency
- Severity-driven due dates
- Exploitability-aware scheduling

## Best Practices

### 1. Regular Data Sync

- Import weekly reports consistently
- Refresh API data daily
- Sync between vulnerability and ticket systems

### 2. Template Customization

- Adapt templates to organizational needs
- Include required compliance information
- Maintain consistent formatting

### 3. Device Naming Consistency

- Use standardized hostname conventions
- Ensure matching between systems
- Implement device registry if needed

### 4. Workflow Automation

- Set up automated report processing
- Configure API refresh schedules
- Establish escalation procedures

## Future Enhancements

### Network Mapping Integration

- Visual topology with vulnerability overlays
- Risk-based network segmentation
- Attack path analysis

### Diff Viewer

- Compare vulnerability states between scans
- Track remediation progress
- Identify recurring issues

### Ansible Integration

- Auto-generated remediation playbooks
- Orchestrated patch deployment
- Compliance verification

## Troubleshooting

### Common Issues

1. **Device Name Mismatches**
   - Ensure consistent naming between systems
   - Use device aliases if necessary
   - Check for case sensitivity

2. **Missing API Data**
   - Verify API credentials
   - Check rate limiting
   - Confirm network connectivity

3. **Sync Problems**
   - Clear browser cache
   - Refresh integration mappings
   - Restart sync process

### Support Resources

- Integration service logs in browser console
- Storage inspection via developer tools
- API response monitoring
- Cross-tab communication debugging
