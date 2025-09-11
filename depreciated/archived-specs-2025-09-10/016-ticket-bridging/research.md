# Research Document: Ticket Bridging System

**Specification**: 003-ticket-bridging  
**Created**: 2025-09-09  
**Phase**: Research (Phase 0)  
**Status**: Complete  

## Architecture Decisions

### Multi-Platform Coordination Architecture

**Decision**: Implement hub-and-spoke ticket coordination pattern with HexTrackr as central hub  
**Rationale**: Distributed teams use different ticketing systems (Jira, ServiceNow, GitHub Issues). Central coordination prevents tickets from falling through cracks while maintaining team autonomy.  
**Implementation**: HexTrackr maintains authoritative ticket registry while exporting formatted tickets for external system import.

### Export-Based Integration Strategy

**Decision**: Export tickets as standardized markdown + zip packages rather than direct API integrations  
**Rationale**: External ticketing systems have diverse APIs, authentication methods, and field requirements. Standardized export formats provide flexibility while avoiding complex API maintenance.  
**Implementation**:

- Markdown templates for human-readable ticket descriptions
- ZIP archives containing attachments, metadata, and import instructions
- Configurable field mapping templates for different target systems

### Hierarchical Assignment Model

**Decision**: Three-tier assignment structure (Team → Supervisor → Individual)  
**Rationale**: Distributed teams need different granularity levels for task assignment. Supervisors coordinate within teams while maintaining overall visibility.  
**Implementation**:

- Team-level routing for initial assignment
- Supervisor escalation for cross-team coordination
- Individual assignment for specific remediation tasks

## Integration Analysis

### Existing HexTrackr Integration Points

**Vulnerability Linking**: Leverage existing `ticket_vulnerabilities` junction table  
**Database Foundation**: Extend existing `tickets` table with multi-platform export metadata  
**WebSocket Progress**: Utilize existing `ProgressTracker` for export operations  
**Security Utilities**: Apply `PathValidator` for safe ZIP file generation and template processing

### Export Format Standardization

**Markdown Template Structure**:

```markdown
# Vulnerability Remediation: [CVE-ID]
**Priority**: [Critical/High/Medium/Low]  
**Assignee**: [Team/Supervisor/Individual]  
**Due Date**: [ISO Date]  

## Affected Assets
[Device list with IPs and hostnames]

## Vulnerability Details  
[CVE description, severity, CVSS scores]

## Remediation Steps
[Vendor-specific remediation guidance]
```

**ZIP Package Contents**:

- ticket.md (primary ticket description)
- metadata.json (structured data for API imports)
- assets.csv (affected device inventory)
- attachments/ (screenshots, configuration files, reports)

### Multi-Platform Template System

**Platform-Specific Templates**: Configurable templates for popular ticketing systems  
**Jira Template**: JIRA markup with custom fields mapping  
**ServiceNow Template**: Table-based format with incident classification  
**GitHub Issues Template**: Markdown with issue labels and assignee mapping  
**Custom Templates**: User-definable templates with field substitution variables

## Security Requirements

### Export Data Protection

**Sensitive Data Filtering**: Remove internal IP addresses, usernames, and system details from exports  
**Access Control**: Role-based permissions for ticket creation, assignment, and export operations  
**Audit Trail**: Complete history of ticket operations, assignments, and export events  
**Data Retention**: 90-day retention for exported packages with secure deletion

### Multi-Team Security Boundaries

**Team Isolation**: Teams only see tickets assigned to their group unless escalated  
**Supervisor Visibility**: Supervisors view all tickets within their teams plus cross-team escalations  
**Administrator Access**: Full system visibility with audit logging for compliance  
**Export Permissions**: Granular control over which teams can export to external systems

### Attachment Security

**File Type Validation**: Whitelist approach for attachment types (pdf, png, jpg, txt, csv)  
**Size Limitations**: 10MB per attachment, 50MB per ticket export package  
**Virus Scanning**: Integration with system antivirus for uploaded attachments  
**Encryption**: AES-256 encryption for sensitive attachments within ZIP packages

## Performance Targets

### Ticket Management Performance  

**Creation Time**: <2 seconds for ticket creation with vulnerability linking  
**Export Generation**: <30 seconds for ZIP package creation with 20+ attachments  
**Dashboard Loading**: <1 second for team dashboard with 500+ active tickets  
**Search Performance**: <500ms for ticket search across 10,000+ historical records

### Multi-Team Scalability

**Concurrent Users**: Support 50+ simultaneous users across distributed teams  
**Team Scale**: Support 10 teams with 20 members each  
**Ticket Volume**: Handle 1,000+ active tickets with daily processing of 100+ new tickets  
**Export Throughput**: Generate 20+ export packages simultaneously without performance degradation

### Database Optimization

**Indexing Strategy**: Composite indexes on (team_id, status, due_date) and (assignee_id, priority)  
**Query Performance**: Sub-second response for filtered ticket views and team dashboards  
**Storage Efficiency**: Historical ticket archival after 1 year with compressed storage  
**Backup Performance**: Incremental backups complete within 5 minutes

## Risk Assessment

### High-Risk Areas

**Assignment Conflicts**: Multiple teams claiming same vulnerability for remediation  

- **Mitigation**: First-come-first-served assignment with escalation workflow  
- **Resolution**: Supervisor override capability with audit trail

**Export Format Compatibility**: Target systems rejecting imported ticket formats  

- **Mitigation**: Pre-validation templates with system-specific testing  
- **Fallback**: Manual import instructions included in every export package

**Cross-Team Communication Breakdown**: Tickets lost between team handoffs  

- **Mitigation**: Mandatory handoff acknowledgment with email notifications  
- **Monitoring**: Dashboard alerts for tickets pending handoff >24 hours

### Medium-Risk Areas

**Attachment Storage Growth**: Large attachments consuming disk space  

- **Mitigation**: Automated cleanup of expired export packages  
- **Optimization**: Image compression and PDF optimization for attachments

**Template Maintenance**: Outdated templates causing import failures  

- **Mitigation**: Version control for templates with update notifications  
- **Testing**: Automated template validation against target system APIs

### Low-Risk Areas

**User Interface Complexity**: Multi-team workflows may confuse users  

- **Solution**: Role-based interface simplification and guided workflows  
- **Training**: Built-in help system with team-specific guidance

## Implementation Readiness

### Prerequisites Met

- ✅ HexTrackr ticket system foundation with vulnerability linking established  
- ✅ WebSocket progress tracking available for export operations  
- ✅ Security utilities (PathValidator) ready for safe file operations  
- ✅ Database schema supports team-based ticket organization

### Required Extensions

**Database Schema**:

```sql
-- Team management
CREATE TABLE teams (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  supervisor_id INTEGER REFERENCES users(id)
);

-- Export tracking  
CREATE TABLE ticket_exports (
  id INTEGER PRIMARY KEY,
  ticket_id TEXT REFERENCES tickets(id),
  export_format TEXT NOT NULL,
  generated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  package_path TEXT,
  exported_by INTEGER REFERENCES users(id)
);

-- Template management
CREATE TABLE export_templates (
  id INTEGER PRIMARY KEY, 
  platform TEXT NOT NULL,
  template_name TEXT NOT NULL,
  markdown_template TEXT NOT NULL,
  metadata_schema TEXT, -- JSON schema
  created_by INTEGER REFERENCES users(id)
);
```

### Development Dependencies

**Template Engine**: Handlebars.js for markdown template processing  
**Archive Generation**: Node.js `archiver` library for ZIP package creation  
**File Processing**: `multer` (already available) for attachment handling  
**Email Notifications**: Integration with existing notification system for team alerts

### Integration Points

**User Management**: Extend existing user system with team assignments and roles  
**Notification System**: Team-specific alerts for assignments, escalations, exports  
**Dashboard Enhancement**: Team-filtered views and supervisor oversight panels  
**API Extensions**: RESTful endpoints for ticket assignment, export, and team management

## Implementation Phases

### Phase 1: Core Team Management

- Team creation and member assignment interface  
- Basic ticket assignment to teams with supervisor escalation  
- Team-filtered dashboard views and permissions

### Phase 2: Export System Foundation  

- Markdown template system with variable substitution  
- ZIP package generation with metadata and attachments  
- Basic export templates for common platforms (Jira, GitHub)

### Phase 3: Advanced Coordination Features

- Cross-team handoff workflows with acknowledgment requirements  
- Supervisor oversight dashboard with team performance metrics  
- Advanced template customization with field mapping

### Phase 4: Integration Optimization

- Direct API integration for popular platforms (optional enhancement)  
- Automated import validation and feedback systems  
- Advanced analytics for team performance and ticket resolution trends

---
**Research Status**: ✅ Complete - Multi-platform coordination architecture validated, ready for data model design  
**Confidence Level**: High - Leverages HexTrackr foundations with proven export-based integration approach  
**Next Phase**: Proceed to data-model.md for team structure, template schemas, and export data definitions
