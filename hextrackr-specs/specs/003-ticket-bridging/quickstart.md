# Quickstart: Ticket Bridging System

**Purpose**: Validate team hierarchy testing, export generation validation, and multi-platform coordination verification

## Quick Validation Steps

### 1. Team Hierarchy Configuration Testing (20 minutes)

**Test Scenario**: Verify three-tier team assignment structure (Team → Supervisor → Individual)  
**Setup**:

- Configure team hierarchies with supervisor assignments
- Create team members with various roles and skill assignments
- Test hierarchical assignment routing and escalation workflows
- Validate permission-based access control for team operations

**Success Criteria**:
✅ Team creation with supervisor assignments and hierarchical relationships  
✅ Member roles (Member, Lead, Supervisor, Coordinator) function correctly  
✅ Assignment capacity limits enforced based on member configurations  
✅ Skill-based assignment matching works for specialized remediation tasks  
✅ Team permissions control export and escalation capabilities

**Manual Testing Steps**:

```javascript
// Browser Console Tests - Team Hierarchy Validation
console.log('Testing team hierarchy configuration...');

// Create test team structure
const teamResponse = await fetch('/api/teams', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'Infrastructure Security Team',
    supervisor_id: 'user_supervisor_001',
    permissions: {
      can_export: true,
      can_assign: true,
      can_escalate: true,
      external_platforms: ['GitHub', 'Jira']
    },
    metadata: {
      timezone: 'UTC',
      working_hours: {
        start_hour: 9,
        end_hour: 17,
        working_days: [1, 2, 3, 4, 5]
      },
      escalation_threshold_hours: 24
    }
  })
});

const team = await teamResponse.json();
console.log('Team created:', team.id);

// Add team members with different roles
const memberResponse = await fetch('/api/teams/members', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    team_id: team.id,
    user_id: 'user_analyst_001',
    role: 'Member',
    assignment_capacity: 10,
    skills: [
      { skill_name: 'Network Security', proficiency_level: 'Advanced' },
      { skill_name: 'Vulnerability Assessment', proficiency_level: 'Expert' }
    ]
  })
});

const member = await memberResponse.json();
console.log('Team member added:', member.id);

// Test team dashboard aggregation
const dashboard = await fetch(`/api/teams/${team.id}/dashboard`).then(r => r.json());
console.log('Team dashboard:', dashboard);
```

### 2. Multi-Platform Export Generation Testing (25 minutes)

**Test Scenario**: Validate standardized markdown + ZIP export system for external platforms  
**Setup**:

- Configure export templates for Jira, ServiceNow, and GitHub platforms
- Test markdown template processing with Handlebars variables
- Validate ZIP package generation with metadata and attachments
- Check platform-specific field mappings and transformations

**Success Criteria**:
✅ Export templates support multiple ticketing platforms with field mapping  
✅ Handlebars markdown templates render correctly with vulnerability data  
✅ ZIP packages include ticket.md, metadata.json, assets.csv, and attachments  
✅ Platform-specific transformations apply field mappings correctly  
✅ Export packages respect 50MB size limits with secure file validation

**Export Generation Tests**:

```javascript
// Test multi-platform export generation
console.log('Testing export generation system...');

// Create export template for Jira
const templateResponse = await fetch('/api/export-templates', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    platform: 'Jira',
    template_name: 'Vulnerability Remediation Ticket',
    version: '1.0.0',
    markdown_template: `# Vulnerability Remediation: {{vulnerability.cve_id}}
**Priority**: {{assignment.priority}}
**Assignee**: {{team.name}} - {{assignee.name}}
**Due Date**: {{assignment.due_date}}

## Affected Assets
{{#each affected_assets}}
- {{hostname}} ({{ip_address}})
{{/each}}

## Vulnerability Details
**Severity**: {{vulnerability.severity}}
**CVSS Score**: {{vulnerability.cvss_score}}

{{vulnerability.description}}

## Remediation Steps
{{remediation.guidance}}`,
    field_mappings: [
      {
        hextrackr_field: 'assignment.priority',
        target_field: 'priority',
        transformation: { type: 'LookupTable', parameters: { 'Critical': '1', 'High': '2', 'Medium': '3', 'Low': '4' } }
      },
      {
        hextrackr_field: 'vulnerability.severity',
        target_field: 'customfield_10001',
        required: true
      }
    ]
  })
});

const template = await templateResponse.json();
console.log('Export template created:', template.id);

// Generate export package for test ticket
const exportResponse = await fetch('/api/tickets/export', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    ticket_id: 'ticket_test_001',
    template_id: template.id,
    export_format: 'Jira',
    include_attachments: true,
    custom_fields: {
      project_key: 'INFRA',
      issue_type: 'Bug'
    }
  })
});

const exportOperation = await exportResponse.json();
console.log('Export operation started:', exportOperation.package_id);

// Monitor export progress
const progressWs = new WebSocket(`ws://localhost:8989/api/exports/${exportOperation.package_id}/progress`);
progressWs.onmessage = (event) => {
  const progress = JSON.parse(event.data);
  console.log(`Export progress: ${progress.progress_percentage}% - ${progress.current_operation}`);
  
  if (progress.progress_percentage === 100) {
    console.log('Export package generated successfully');
    console.log(`Package size: ${progress.package_size_bytes} bytes`);
    progressWs.close();
  }
};
```

### 3. Team Assignment and Coordination Testing (20 minutes)

**Test Scenario**: Validate assignment routing, escalation workflows, and cross-team coordination  
**Setup**:

- Create tickets with vulnerability assignments to different teams
- Test initial team-level assignment with subsequent individual assignment
- Validate supervisor escalation for cross-team coordination scenarios
- Check assignment history tracking and handoff acknowledgments

**Success Criteria**:
✅ Tickets route to appropriate teams based on vulnerability types and skills  
✅ Team-level assignments escalate to supervisors for coordination decisions  
✅ Individual assignments respect capacity limits and working hours  
✅ Cross-team handoffs require acknowledgment with audit trail logging  
✅ Assignment conflicts resolved through supervisor override capabilities

**Assignment Coordination Tests**:

```javascript
// Test ticket assignment and coordination workflows
console.log('Testing assignment coordination system...');

// Create test ticket assignment
const assignmentResponse = await fetch('/api/tickets/assignments', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    ticket_id: 'ticket_vuln_001',
    team_id: 'team_infrastructure_001',
    assignment_type: 'Team Level',
    priority: 'High',
    due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    estimated_hours: 8,
    assignment_reason: 'Critical infrastructure vulnerability requires immediate attention'
  })
});

const assignment = await assignmentResponse.json();
console.log('Team assignment created:', assignment.assignment_id);

// Test escalation workflow
const escalationResponse = await fetch(`/api/tickets/assignments/${assignment.assignment_id}/escalate`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    reason: 'Requires cross-team coordination with network security team',
    escalate_to: 'supervisor',
    additional_teams: ['team_network_security_002']
  })
});

const escalation = await escalationResponse.json();
console.log('Escalation initiated:', escalation.escalation_id);

// Monitor assignment status changes
const assignmentWs = new WebSocket(`ws://localhost:8989/api/assignments/${assignment.assignment_id}/status`);
assignmentWs.onmessage = (event) => {
  const statusUpdate = JSON.parse(event.data);
  console.log('Assignment status update:', statusUpdate);
  console.log(`  Status: ${statusUpdate.status}`);
  console.log(`  Updated by: ${statusUpdate.updated_by}`);
  console.log(`  Reason: ${statusUpdate.reason}`);
};

// Check assignment history
setTimeout(async () => {
  const history = await fetch(`/api/tickets/assignments/${assignment.assignment_id}/history`)
    .then(r => r.json());
  console.log('Assignment history:', history);
}, 10000);
```

### 4. Export Package Validation and Security Testing (15 minutes)

**Test Scenario**: Verify secure export package creation with integrity validation  
**Setup**:

- Generate export packages with various attachment types and sizes
- Test file type validation and size limitations enforcement
- Validate SHA-256 checksum calculation and integrity verification
- Check secure file path handling and access controls

**Success Criteria**:
✅ Export packages enforce file type whitelist (pdf, png, jpg, txt, csv, md)  
✅ Individual file size limits (10MB) and package size limits (50MB) enforced  
✅ SHA-256 checksums calculated and validated for package integrity  
✅ Secure file paths prevent directory traversal vulnerabilities  
✅ Export retention policies automatically clean up expired packages

**Export Security Tests**:

```javascript
// Test export package security and validation
console.log('Testing export package security...');

// Test file validation with various attachment types
const testFiles = [
  { filename: 'vulnerability-report.pdf', size: 5 * 1024 * 1024, type: 'application/pdf' },
  { filename: 'network-diagram.png', size: 2 * 1024 * 1024, type: 'image/png' },
  { filename: 'asset-inventory.csv', size: 1024 * 1024, type: 'text/csv' },
  { filename: 'malicious.exe', size: 1024, type: 'application/octet-stream' }, // Should be rejected
  { filename: 'oversized.pdf', size: 15 * 1024 * 1024, type: 'application/pdf' } // Should be rejected
];

for (const file of testFiles) {
  const validationResponse = await fetch('/api/export-packages/validate-file', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(file)
  });
  
  const validation = await validationResponse.json();
  console.log(`File ${file.filename}:`);
  console.log(`  Valid: ${validation.valid}`);
  console.log(`  Reason: ${validation.reason || 'Accepted'}`);
}

// Test package integrity verification
const packageId = 'package_test_001';
const integrityCheck = await fetch(`/api/export-packages/${packageId}/integrity`)
  .then(r => r.json());

console.log('Package integrity check:', integrityCheck);
console.log(`  Checksum valid: ${integrityCheck.checksum_valid}`);
console.log(`  File count: ${integrityCheck.file_count}`);
console.log(`  Total size: ${integrityCheck.total_size_bytes} bytes`);
```

### 5. Multi-Platform Coordination and Template Testing (10 minutes)

**Test Scenario**: Validate template customization and platform compatibility  
**Setup**:

- Test template processing for different target platforms
- Validate field transformation and data mapping accuracy
- Check template versioning and backward compatibility
- Verify import instructions generation for manual processes

**Success Criteria**:
✅ Templates render correctly for Jira, ServiceNow, GitHub, and custom platforms  
✅ Field transformations apply data mapping rules without data loss  
✅ Template versioning maintains backward compatibility for existing exports  
✅ Import instructions provide clear guidance for manual ticket creation  
✅ Template validation prevents potentially dangerous content injection

**Template Compatibility Tests**:

```javascript
// Test template compatibility across platforms
const platforms = ['Jira', 'ServiceNow', 'GitHub', 'Custom'];
const testTicketData = {
  vulnerability: {
    cve_id: 'CVE-2023-1234',
    severity: 'Critical',
    cvss_score: 9.8,
    description: 'Remote code execution vulnerability in web application'
  },
  assignment: {
    priority: 'Critical',
    due_date: '2024-01-15T09:00:00Z'
  },
  team: { name: 'Security Response Team' },
  assignee: { name: 'Senior Security Analyst' },
  affected_assets: [
    { hostname: 'web-server-01.example.com', ip_address: '192.168.1.100' },
    { hostname: 'api-server-02.example.com', ip_address: '192.168.1.101' }
  ]
};

for (const platform of platforms) {
  console.log(`Testing ${platform} template compatibility...`);
  
  const renderResponse = await fetch('/api/export-templates/render', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      platform: platform,
      template_name: 'Vulnerability Remediation Ticket',
      data: testTicketData
    })
  });
  
  const rendered = await renderResponse.json();
  console.log(`  ${platform} rendering: ${rendered.success ? 'Success' : 'Failed'}`);
  console.log(`  Content length: ${rendered.content?.length || 0} characters`);
  console.log(`  Field mappings applied: ${rendered.mappings_applied}`);
}
```

## Automated Test Validation

### Unit Test Coverage

**Required Tests**:

- Team hierarchy creation and role assignment validation
- Export template processing with Handlebars rendering engine
- Ticket assignment routing and escalation workflow logic
- Multi-platform field mapping and transformation rules
- Export package generation with security validation

**Execution**: `npm test -- --grep="ticket-bridging"`

### Integration Test Coverage

**Required Tests**:

- End-to-end ticket assignment to export package workflow
- WebSocket real-time updates for assignment and export progress
- Multi-team coordination with supervisor escalation scenarios
- Export package download with integrity verification
- Template versioning and backward compatibility validation

**Execution**: `npm run test:integration -- ticket-bridging-system`

### Performance Test Coverage

**Test Scenarios**: Validate ticket bridging system meets performance targets
**Success Criteria**:
✅ Team dashboard loads within 1 second for 500+ active tickets  
✅ Export package generation completes within 30 seconds for 20+ attachments  
✅ Assignment creation and routing complete within 2 seconds  
✅ Template processing renders complex templates within 500ms  
✅ Multi-team coordination handles 50+ concurrent assignments

**Execution**: `npm run test:performance -- ticket-coordination-load`

## Common Issues and Solutions

### Team Hierarchy Configuration Problems

**Symptoms**: Assignment routing failures or incorrect team member access
**Diagnosis**: Check team structure, supervisor assignments, and role permissions
**Solution**:

- Verify supervisor assignments for each team with valid user references
- Ensure team member roles align with assignment and escalation permissions
- Check hierarchical parent-child relationships prevent circular references
- Validate working hours configuration matches team timezone settings
- Review skill assignments match vulnerability remediation requirements

### Export Template Processing Failures

**Symptoms**: Template rendering errors or malformed export packages
**Diagnosis**: Check Handlebars syntax and field mapping configuration
**Solution**:

- Validate Handlebars template syntax with proper variable references
- Ensure field mappings reference correct HexTrackr data model fields
- Check transformation rules for data type compatibility
- Test template rendering with various data scenarios including empty values
- Implement template validation against security injection patterns

### Assignment Coordination Conflicts

**Symptoms**: Duplicate assignments or team capacity exceeded warnings
**Diagnosis**: Review assignment logic and capacity management configuration
**Solution**:

- Implement first-come-first-served assignment with conflict resolution
- Add supervisor override capabilities for assignment conflicts
- Check team member capacity limits and current workload calculations
- Validate assignment time constraints against team working hours
- Enable assignment queue management for high-volume scenarios

### Export Package Generation Issues

**Symptoms**: Package creation timeouts or corrupted ZIP files
**Diagnosis**: Monitor file processing and memory usage during package creation
**Solution**:

- Implement streaming ZIP generation to avoid memory constraints
- Add file size validation before package processing begins
- Check attachment file accessibility and permission requirements
- Optimize large file handling with chunked processing
- Implement cleanup procedures for partial package generation failures

### Multi-Platform Template Compatibility

**Symptoms**: Platform-specific import failures or data format mismatches
**Diagnosis**: Review field mappings and target platform requirements
**Solution**:

- Update field mapping transformations for platform API changes
- Test template output against target platform validation requirements
- Implement fallback templates for unsupported field types
- Add import instruction generation for manual processing scenarios
- Create platform-specific validation rules for data format compliance

## Complete Workflow Test

### End-to-End Ticket Bridging Validation (90 minutes)

**Step 1: Team Structure and Configuration Setup** (20 minutes)

- Create comprehensive team hierarchy with multiple security teams
- Configure team members with diverse roles and skill specializations
- Set up supervisor assignments and escalation threshold configurations
- Validate team permission settings for export and assignment capabilities

**Step 2: Export Template Configuration and Testing** (25 minutes)

- Create export templates for Jira, ServiceNow, and GitHub platforms
- Configure field mappings with platform-specific transformation rules
- Test template rendering with complex vulnerability and asset data
- Validate template versioning and backward compatibility requirements

**Step 3: Ticket Assignment and Coordination Execution** (25 minutes)

- Create tickets with various vulnerability types and severity levels
- Execute team-level assignments with skill-based routing validation
- Test cross-team coordination with supervisor escalation workflows
- Monitor assignment history and handoff acknowledgment processes

**Step 4: Export Package Generation and Validation** (15 minutes)

- Generate export packages for each configured platform template
- Validate ZIP package contents include all required components
- Test download functionality with integrity verification
- Verify export retention and cleanup policies function correctly

**Step 5: Multi-Platform Coordination Assessment** (5 minutes)

- Review export package compatibility across target platforms
- Validate import instructions accuracy for manual processing
- Check notification system integration for assignment and export events
- Assess overall system performance during concurrent operations

**Success Criteria**:
✅ Complete ticket bridging system functional with multi-team coordination  
✅ Export generation provides reliable multi-platform ticket creation  
✅ Team hierarchy supports effective assignment routing and escalation  
✅ Export packages maintain data integrity with security validation  
✅ Performance targets met with stable resource utilization  
✅ Real-time coordination tracking provides operational visibility  
✅ Comprehensive audit logging maintains compliance and accountability

### Integration Quality Assessment

**Workflow Efficiency**: Hub-and-spoke coordination prevents ticket loss  
**Data Security**: Encrypted exports with comprehensive audit trails  
**Platform Compatibility**: Standardized formats support diverse ticketing systems  
**Team Coordination**: Hierarchical assignment with escalation workflows  
**Operational Scalability**: Concurrent processing supports distributed teams

### Operational Readiness Validation

**Team Training**: Complete documentation for multi-team coordination procedures  
**Export Management**: Automated cleanup and retention policy enforcement  
**Escalation Procedures**: Clear guidelines for cross-team coordination requirements  
**Security Compliance**: Comprehensive logging for audit and forensic analysis  
**Performance Monitoring**: Real-time tracking for assignment and export operations
