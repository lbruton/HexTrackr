# Ticket Bridging System - Data Model

## Entity Definitions

### Core Team Hierarchy Entities

```typescript
// Branded types for security-sensitive team data
type TeamId = string & { readonly __brand: unique symbol };
type UserId = string & { readonly __brand: unique symbol };
type TicketId = string & { readonly __brand: unique symbol };
type ExportPackageId = string & { readonly __brand: unique symbol };
type TemplateId = string & { readonly __brand: unique symbol };

// Team management entity with hierarchical structure
interface TeamEntity {
    readonly id: TeamId;                    // UUID v4 team identifier
    readonly name: string;                  // Team display name (validated length)
    readonly description?: string;          // Optional team description
    readonly supervisor_id: UserId;         // Reference to supervising user
    readonly parent_team_id?: TeamId;       // Optional hierarchical parent
    readonly status: TeamStatus;
    readonly permissions: TeamPermissions;
    readonly metadata: TeamMetadata;
    readonly created_at: Date;
    readonly updated_at: Date;
}

enum TeamStatus {
    ACTIVE = 'Active',
    INACTIVE = 'Inactive',
    ARCHIVED = 'Archived'
}

interface TeamPermissions {
    readonly can_export: boolean;           // Can generate export packages
    readonly can_assign: boolean;           // Can assign tickets to members
    readonly can_escalate: boolean;         // Can escalate cross-team
    readonly external_platforms: ExternalPlatform[];  // Allowed export targets
}

interface TeamMetadata {
    readonly timezone: string;              // Team timezone for scheduling
    readonly working_hours: WorkingHours;   // Standard working hours
    readonly escalation_threshold_hours: number;  // Auto-escalation timing
    readonly export_retention_days: number; // Export package retention
    readonly notification_preferences: NotificationConfig;
}

interface WorkingHours {
    readonly start_hour: number;            // 0-23 hour format
    readonly end_hour: number;              // 0-23 hour format  
    readonly working_days: number[];        // 0-6 (Sunday-Saturday)
    readonly holiday_calendar?: string;     // Optional holiday calendar ID
}
```

### Team Membership and Roles

```typescript
interface TeamMember {
    readonly id: string;                    // UUID v4 membership record
    readonly team_id: TeamId;
    readonly user_id: UserId;
    readonly role: TeamRole;
    readonly assignment_capacity: number;    // Max concurrent ticket assignments
    readonly skills: TeamSkill[];           // Member expertise areas
    readonly status: MemberStatus;
    readonly joined_at: Date;
    readonly last_active: Date;
}

enum TeamRole {
    MEMBER = 'Member',
    LEAD = 'Lead',
    SUPERVISOR = 'Supervisor',
    COORDINATOR = 'Coordinator'
}

interface TeamSkill {
    readonly skill_name: string;
    readonly proficiency_level: SkillLevel;
    readonly certified: boolean;
    readonly last_validated: Date;
}

enum SkillLevel {
    BEGINNER = 'Beginner',
    INTERMEDIATE = 'Intermediate', 
    ADVANCED = 'Advanced',
    EXPERT = 'Expert'
}

enum MemberStatus {
    ACTIVE = 'Active',
    UNAVAILABLE = 'Unavailable',
    ON_LEAVE = 'On Leave'
}
```

### Export Template System

```typescript
interface ExportTemplate {
    readonly id: TemplateId;                // UUID v4 template identifier
    readonly platform: ExternalPlatform;   // Target platform (Jira, ServiceNow, etc.)
    readonly template_name: string;         // Human-readable template name
    readonly version: string;               // Semantic version (1.0.0)
    readonly markdown_template: string;     // Handlebars markdown template
    readonly metadata_schema: TemplateSchema; // JSON schema for metadata
    readonly field_mappings: FieldMapping[]; // Platform-specific field mappings
    readonly validation_rules: TemplateValidation[];
    readonly created_by: UserId;
    readonly status: TemplateStatus;
    readonly created_at: Date;
    readonly updated_at: Date;
}

enum ExternalPlatform {
    JIRA = 'Jira',
    SERVICENOW = 'ServiceNow',
    GITHUB = 'GitHub',
    AZURE_DEVOPS = 'Azure DevOps',
    CUSTOM = 'Custom'
}

interface TemplateSchema {
    readonly required_fields: string[];
    readonly optional_fields: string[];
    readonly field_types: Record<string, JsonSchemaType>;
    readonly validation_patterns: Record<string, string>;
}

interface FieldMapping {
    readonly hextrackr_field: string;       // Source field from HexTrackr
    readonly target_field: string;          // Destination field in external system
    readonly transformation?: FieldTransform; // Optional data transformation
    readonly required: boolean;
}

interface FieldTransform {
    readonly type: TransformType;
    readonly parameters: Record<string, any>;
}

enum TransformType {
    DATE_FORMAT = 'DateFormat',
    STRING_CASE = 'StringCase',
    LOOKUP_TABLE = 'LookupTable',
    REGEX_REPLACE = 'RegexReplace'
}

enum TemplateStatus {
    DRAFT = 'Draft',
    ACTIVE = 'Active',
    DEPRECATED = 'Deprecated',
    ARCHIVED = 'Archived'
}

interface TemplateValidation {
    readonly field: string;
    readonly rule_type: ValidationRuleType;
    readonly parameters: Record<string, any>;
    readonly error_message: string;
}

enum ValidationRuleType {
    REQUIRED = 'Required',
    FORMAT = 'Format',
    LENGTH = 'Length',
    ENUM_VALUE = 'EnumValue'
}
```

### Multi-Platform Coordination Entities

```typescript
interface TicketAssignment {
    readonly id: string;                    // UUID v4 assignment identifier
    readonly ticket_id: TicketId;
    readonly team_id: TeamId;
    readonly assignee_id?: UserId;          // Individual assignment (optional)
    readonly assignment_type: AssignmentType;
    readonly priority: AssignmentPriority;
    readonly due_date: Date;
    readonly estimated_hours?: number;      // Work estimation
    readonly assignment_path: AssignmentPath[]; // Escalation trail
    readonly status: AssignmentStatus;
    readonly created_at: Date;
    readonly updated_at: Date;
}

enum AssignmentType {
    TEAM_LEVEL = 'Team Level',
    SUPERVISOR_LEVEL = 'Supervisor Level', 
    INDIVIDUAL_LEVEL = 'Individual Level',
    ESCALATED = 'Escalated'
}

enum AssignmentPriority {
    CRITICAL = 'Critical',
    HIGH = 'High',
    MEDIUM = 'Medium',
    LOW = 'Low'
}

interface AssignmentPath {
    readonly step_number: number;
    readonly from_team_id?: TeamId;
    readonly from_user_id?: UserId;
    readonly to_team_id?: TeamId;
    readonly to_user_id?: UserId;
    readonly action: AssignmentAction;
    readonly reason: string;
    readonly timestamp: Date;
}

enum AssignmentAction {
    CREATED = 'Created',
    ASSIGNED = 'Assigned',
    ESCALATED = 'Escalated',
    TRANSFERRED = 'Transferred',
    COMPLETED = 'Completed'
}

enum AssignmentStatus {
    PENDING = 'Pending',
    ACTIVE = 'Active',
    BLOCKED = 'Blocked',
    COMPLETED = 'Completed',
    CANCELLED = 'Cancelled'
}
```

### Export Package Management

```typescript
interface ExportPackage {
    readonly id: ExportPackageId;           // UUID v4 export identifier
    readonly ticket_id: TicketId;
    readonly template_id: TemplateId;
    readonly generated_by: UserId;
    readonly team_id: TeamId;
    readonly export_format: ExternalPlatform;
    readonly package_metadata: ExportMetadata;
    readonly file_manifest: ExportFile[];
    readonly package_path: string;          // Secure file path
    readonly package_size_bytes: number;
    readonly checksum: string;              // SHA-256 integrity check
    readonly status: ExportStatus;
    readonly retention_until: Date;         // Auto-deletion date
    readonly download_count: number;
    readonly last_downloaded: Date;
    readonly created_at: Date;
}

interface ExportMetadata {
    readonly ticket_summary: string;
    readonly vulnerability_count: number;
    readonly affected_assets: string[];
    readonly severity_breakdown: Record<string, number>;
    readonly export_reason: string;
    readonly custom_fields: Record<string, any>;
}

interface ExportFile {
    readonly filename: string;
    readonly file_type: ExportFileType;
    readonly file_size_bytes: number;
    readonly checksum: string;
    readonly description: string;
}

enum ExportFileType {
    MARKDOWN = 'markdown',
    METADATA_JSON = 'metadata_json',
    ASSETS_CSV = 'assets_csv',
    ATTACHMENT = 'attachment',
    IMPORT_INSTRUCTIONS = 'import_instructions'
}

enum ExportStatus {
    GENERATING = 'Generating',
    READY = 'Ready',
    DOWNLOADED = 'Downloaded',
    EXPIRED = 'Expired',
    ERROR = 'Error'
}
```

## Database Schema

### SQLite Configuration (Multi-Team Optimization)

```sql
-- Optimize SQLite for concurrent team operations
PRAGMA journal_mode = WAL;
PRAGMA synchronous = NORMAL;
PRAGMA cache_size = 131072;        -- 512MB cache for team queries
PRAGMA temp_store = MEMORY;
PRAGMA mmap_size = 2147483648;     -- 2GB memory mapping
PRAGMA foreign_keys = ON;
PRAGMA recursive_triggers = ON;    -- Enable cascading team updates
PRAGMA optimize;

-- Enable full-text search for ticket content
PRAGMA module_list;  -- Verify FTS5 availability
```

### Core Team Management Schema

```sql
-- Team hierarchy with recursive relationships
CREATE TABLE teams (
    id TEXT PRIMARY KEY CHECK(LENGTH(id) = 36),  -- UUID validation
    name TEXT NOT NULL CHECK(LENGTH(name) BETWEEN 3 AND 100),
    description TEXT CHECK(LENGTH(description) <= 500),
    supervisor_id TEXT NOT NULL,
    parent_team_id TEXT,
    status TEXT NOT NULL DEFAULT 'Active' CHECK(status IN ('Active', 'Inactive', 'Archived')),
    permissions TEXT NOT NULL CHECK(json_valid(permissions)),
    metadata TEXT NOT NULL CHECK(json_valid(metadata)),
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY(supervisor_id) REFERENCES users(id),
    FOREIGN KEY(parent_team_id) REFERENCES teams(id)
);

-- Team performance indexes
CREATE UNIQUE INDEX idx_teams_name ON teams(name) WHERE status = 'Active';
CREATE INDEX idx_teams_supervisor ON teams(supervisor_id);
CREATE INDEX idx_teams_parent ON teams(parent_team_id);
CREATE INDEX idx_teams_status ON teams(status);

-- Team membership with role assignments
CREATE TABLE team_members (
    id TEXT PRIMARY KEY CHECK(LENGTH(id) = 36),
    team_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    role TEXT NOT NULL CHECK(role IN ('Member', 'Lead', 'Supervisor', 'Coordinator')),
    assignment_capacity INTEGER NOT NULL DEFAULT 5 CHECK(assignment_capacity > 0),
    skills TEXT NOT NULL CHECK(json_valid(skills)),
    status TEXT NOT NULL DEFAULT 'Active' CHECK(status IN ('Active', 'Unavailable', 'On Leave')),
    joined_at TEXT NOT NULL DEFAULT (datetime('now')),
    last_active TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY(team_id) REFERENCES teams(id) ON DELETE CASCADE,
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE(team_id, user_id)
);

CREATE INDEX idx_members_team ON team_members(team_id);
CREATE INDEX idx_members_user ON team_members(user_id);
CREATE INDEX idx_members_role ON team_members(role);
CREATE INDEX idx_members_status ON team_members(status);
CREATE INDEX idx_members_capacity ON team_members(assignment_capacity, status);
```

### Ticket Assignment Schema

```sql
-- Multi-platform ticket assignments with escalation tracking
CREATE TABLE ticket_assignments (
    id TEXT PRIMARY KEY CHECK(LENGTH(id) = 36),
    ticket_id TEXT NOT NULL,
    team_id TEXT NOT NULL,
    assignee_id TEXT,  -- Individual assignment optional
    assignment_type TEXT NOT NULL CHECK(assignment_type IN ('Team Level', 'Supervisor Level', 'Individual Level', 'Escalated')),
    priority TEXT NOT NULL CHECK(priority IN ('Critical', 'High', 'Medium', 'Low')),
    due_date TEXT NOT NULL,
    estimated_hours INTEGER CHECK(estimated_hours > 0),
    assignment_path TEXT NOT NULL CHECK(json_valid(assignment_path)),
    status TEXT NOT NULL DEFAULT 'Pending' CHECK(status IN ('Pending', 'Active', 'Blocked', 'Completed', 'Cancelled')),
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY(ticket_id) REFERENCES tickets(id) ON DELETE CASCADE,
    FOREIGN KEY(team_id) REFERENCES teams(id),
    FOREIGN KEY(assignee_id) REFERENCES users(id),
    UNIQUE(ticket_id, team_id) -- Prevent duplicate team assignments
);

-- Assignment performance indexes
CREATE INDEX idx_assignments_ticket ON ticket_assignments(ticket_id);
CREATE INDEX idx_assignments_team ON ticket_assignments(team_id);
CREATE INDEX idx_assignments_assignee ON ticket_assignments(assignee_id);
CREATE INDEX idx_assignments_status ON ticket_assignments(status);
CREATE INDEX idx_assignments_priority ON ticket_assignments(priority);
CREATE INDEX idx_assignments_due_date ON ticket_assignments(due_date);
CREATE INDEX idx_assignments_team_status ON ticket_assignments(team_id, status);

-- Assignment audit trail for compliance
CREATE TABLE assignment_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    assignment_id TEXT NOT NULL,
    action TEXT NOT NULL CHECK(action IN ('Created', 'Assigned', 'Escalated', 'Transferred', 'Completed')),
    from_team_id TEXT,
    from_user_id TEXT,
    to_team_id TEXT,
    to_user_id TEXT,
    reason TEXT NOT NULL,
    previous_state TEXT,  -- JSON snapshot
    new_state TEXT NOT NULL,  -- JSON snapshot
    changed_by TEXT NOT NULL,
    timestamp TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY(assignment_id) REFERENCES ticket_assignments(id) ON DELETE CASCADE,
    FOREIGN KEY(changed_by) REFERENCES users(id)
);

CREATE INDEX idx_assignment_history_assignment ON assignment_history(assignment_id);
CREATE INDEX idx_assignment_history_timestamp ON assignment_history(timestamp);
CREATE INDEX idx_assignment_history_action ON assignment_history(action);
```

### Export Template Management Schema

```sql
-- Flexible template system for multi-platform exports
CREATE TABLE export_templates (
    id TEXT PRIMARY KEY CHECK(LENGTH(id) = 36),
    platform TEXT NOT NULL CHECK(platform IN ('Jira', 'ServiceNow', 'GitHub', 'Azure DevOps', 'Custom')),
    template_name TEXT NOT NULL CHECK(LENGTH(template_name) BETWEEN 3 AND 100),
    version TEXT NOT NULL CHECK(version GLOB '*.*.*'),  -- Semantic versioning
    markdown_template TEXT NOT NULL CHECK(LENGTH(markdown_template) <= 10000),
    metadata_schema TEXT NOT NULL CHECK(json_valid(metadata_schema)),
    field_mappings TEXT NOT NULL CHECK(json_valid(field_mappings)),
    validation_rules TEXT NOT NULL CHECK(json_valid(validation_rules)),
    created_by TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'Draft' CHECK(status IN ('Draft', 'Active', 'Deprecated', 'Archived')),
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY(created_by) REFERENCES users(id),
    UNIQUE(platform, template_name, version)
);

CREATE INDEX idx_templates_platform ON export_templates(platform);
CREATE INDEX idx_templates_status ON export_templates(status);
CREATE INDEX idx_templates_created_by ON export_templates(created_by);
CREATE INDEX idx_templates_platform_active ON export_templates(platform, status) WHERE status = 'Active';

-- Template usage analytics
CREATE TABLE template_usage (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    template_id TEXT NOT NULL,
    used_by TEXT NOT NULL,
    team_id TEXT NOT NULL,
    ticket_id TEXT NOT NULL,
    success BOOLEAN NOT NULL,
    error_message TEXT,
    processing_time_ms INTEGER,
    used_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY(template_id) REFERENCES export_templates(id) ON DELETE CASCADE,
    FOREIGN KEY(used_by) REFERENCES users(id),
    FOREIGN KEY(team_id) REFERENCES teams(id)
);

CREATE INDEX idx_template_usage_template ON template_usage(template_id);
CREATE INDEX idx_template_usage_team ON template_usage(team_id);
CREATE INDEX idx_template_usage_success ON template_usage(success);
CREATE INDEX idx_template_usage_date ON template_usage(used_at);
```

### Export Package Tracking Schema

```sql
-- Export package generation and lifecycle management
CREATE TABLE export_packages (
    id TEXT PRIMARY KEY CHECK(LENGTH(id) = 36),
    ticket_id TEXT NOT NULL,
    template_id TEXT NOT NULL,
    generated_by TEXT NOT NULL,
    team_id TEXT NOT NULL,
    export_format TEXT NOT NULL CHECK(export_format IN ('Jira', 'ServiceNow', 'GitHub', 'Azure DevOps', 'Custom')),
    package_metadata TEXT NOT NULL CHECK(json_valid(package_metadata)),
    file_manifest TEXT NOT NULL CHECK(json_valid(file_manifest)),
    package_path TEXT NOT NULL CHECK(LENGTH(package_path) <= 500),
    package_size_bytes INTEGER NOT NULL CHECK(package_size_bytes > 0),
    checksum TEXT NOT NULL CHECK(LENGTH(checksum) = 64),  -- SHA-256 hash
    status TEXT NOT NULL DEFAULT 'Generating' CHECK(status IN ('Generating', 'Ready', 'Downloaded', 'Expired', 'Error')),
    retention_until TEXT NOT NULL,
    download_count INTEGER NOT NULL DEFAULT 0,
    last_downloaded TEXT,
    error_details TEXT,  -- JSON error information if status = 'Error'
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY(ticket_id) REFERENCES tickets(id) ON DELETE CASCADE,
    FOREIGN KEY(template_id) REFERENCES export_templates(id),
    FOREIGN KEY(generated_by) REFERENCES users(id),
    FOREIGN KEY(team_id) REFERENCES teams(id)
);

-- Export package performance indexes  
CREATE INDEX idx_packages_ticket ON export_packages(ticket_id);
CREATE INDEX idx_packages_team ON export_packages(team_id);
CREATE INDEX idx_packages_generated_by ON export_packages(generated_by);
CREATE INDEX idx_packages_status ON export_packages(status);
CREATE INDEX idx_packages_retention ON export_packages(retention_until);
CREATE INDEX idx_packages_created ON export_packages(created_at);

-- Package download audit
CREATE TABLE export_downloads (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    package_id TEXT NOT NULL,
    downloaded_by TEXT NOT NULL,
    download_ip TEXT,  -- Optional IP logging for security
    user_agent TEXT,   -- Optional browser/client tracking
    downloaded_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY(package_id) REFERENCES export_packages(id) ON DELETE CASCADE,
    FOREIGN KEY(downloaded_by) REFERENCES users(id)
);

CREATE INDEX idx_downloads_package ON export_downloads(package_id);
CREATE INDEX idx_downloads_user ON export_downloads(downloaded_by);
CREATE INDEX idx_downloads_date ON export_downloads(downloaded_at);
```

### Performance Optimization Views

```sql
-- Team dashboard aggregation view
CREATE VIEW team_dashboard_summary AS
SELECT 
    t.id as team_id,
    t.name as team_name,
    COUNT(tm.user_id) as member_count,
    COUNT(CASE WHEN ta.status = 'Active' THEN 1 END) as active_assignments,
    COUNT(CASE WHEN ta.status = 'Pending' THEN 1 END) as pending_assignments,
    COUNT(CASE WHEN ta.priority = 'Critical' THEN 1 END) as critical_assignments,
    AVG(CASE WHEN ta.status = 'Active' THEN 
        (julianday('now') - julianday(ta.created_at)) * 24 
    END) as avg_active_hours,
    MAX(ta.updated_at) as last_activity
FROM teams t
LEFT JOIN team_members tm ON t.id = tm.team_id AND tm.status = 'Active'
LEFT JOIN ticket_assignments ta ON t.id = ta.team_id
WHERE t.status = 'Active'
GROUP BY t.id, t.name;

-- Export performance analytics view  
CREATE VIEW export_performance_summary AS
SELECT
    et.platform,
    et.template_name,
    COUNT(ep.id) as total_exports,
    COUNT(CASE WHEN ep.status = 'Ready' THEN 1 END) as successful_exports,
    COUNT(CASE WHEN ep.status = 'Error' THEN 1 END) as failed_exports,
    AVG(ep.package_size_bytes) as avg_package_size,
    AVG(CASE WHEN tu.processing_time_ms IS NOT NULL THEN tu.processing_time_ms END) as avg_processing_time_ms,
    MAX(ep.created_at) as last_used
FROM export_templates et
LEFT JOIN export_packages ep ON et.id = ep.template_id
LEFT JOIN template_usage tu ON et.id = tu.template_id AND tu.success = 1
WHERE et.status = 'Active'
GROUP BY et.platform, et.template_name;
```

## Validation Rules

### Team Structure Validation

```typescript
// Compile-time team validation with branded types
function validateTeamId(input: string): TeamId {
    const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidPattern.test(input)) {
        throw new ValidationError('Invalid team UUID format');
    }
    return input as TeamId;
}

function validateTeamName(input: string): string {
    const namePattern = /^[a-zA-Z0-9\s\-_]+$/;
    if (!input || input.length < 3 || input.length > 100 || !namePattern.test(input)) {
        throw new ValidationError('Team name must be 3-100 characters, alphanumeric with spaces, hyphens, underscores');
    }
    return input.trim();
}

// Hierarchical team structure validation
class TeamHierarchyValidator {
    validateTeamAssignment(teamId: TeamId, parentTeamId?: TeamId): void {
        if (parentTeamId && teamId === parentTeamId) {
            throw new ValidationError('Team cannot be its own parent');
        }
        
        // Prevent circular references in team hierarchy
        this.validateNoCircularReference(teamId, parentTeamId);
    }
    
    private validateNoCircularReference(teamId: TeamId, parentId?: TeamId): void {
        // Implementation would recursively check parent chain
        // Throw error if circular reference detected
    }
}
```

### Export Template Validation

```typescript
interface TemplateValidationRule {
    field: string;
    validator: (value: any) => boolean;
    message: string;
}

const templateValidationRules: TemplateValidationRule[] = [
    {
        field: 'platform',
        validator: (value) => Object.values(ExternalPlatform).includes(value),
        message: 'Platform must be one of: Jira, ServiceNow, GitHub, Azure DevOps, Custom'
    },
    {
        field: 'markdown_template', 
        validator: (value) => typeof value === 'string' && value.length <= 10000,
        message: 'Markdown template must be string with maximum 10,000 characters'
    },
    {
        field: 'version',
        validator: (value) => /^\d+\.\d+\.\d+$/.test(value),
        message: 'Version must follow semantic versioning (e.g., 1.0.0)'
    }
];

// Template processing security validation
class TemplateSecurityValidator {
    validateMarkdownTemplate(template: string): void {
        // Prevent template injection attacks
        const dangerousPatterns = [
            /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
            /javascript:/i,
            /on\w+\s*=/i,
            /{{[^}]*[\(\)\[\]]+[^}]*}}/  // Complex expression injection
        ];
        
        for (const pattern of dangerousPatterns) {
            if (pattern.test(template)) {
                throw new SecurityError('Template contains potentially dangerous content');
            }
        }
    }
    
    validateFieldMapping(mapping: FieldMapping): void {
        // Validate field names against XSS and injection
        const fieldNamePattern = /^[a-zA-Z][a-zA-Z0-9_.-]*$/;
        
        if (!fieldNamePattern.test(mapping.hextrackr_field)) {
            throw new ValidationError('Invalid HexTrackr field name format');
        }
        
        if (!fieldNamePattern.test(mapping.target_field)) {
            throw new ValidationError('Invalid target field name format');
        }
    }
}
```

### Assignment Logic Validation  

```typescript
interface AssignmentValidationContext {
    team: TeamEntity;
    assignee?: TeamMember;
    ticket: any; // Reference to ticket entity
    currentWorkload: number;
}

class AssignmentValidator {
    validateTeamCapacity(context: AssignmentValidationContext): void {
        if (context.assignee) {
            const { assignment_capacity } = context.assignee;
            
            if (context.currentWorkload >= assignment_capacity) {
                throw new ValidationError(
                    `User has reached assignment capacity (${assignment_capacity})`
                );
            }
        }
    }
    
    validateSkillMatch(context: AssignmentValidationContext, requiredSkills: string[]): void {
        if (context.assignee && requiredSkills.length > 0) {
            const userSkills = context.assignee.skills.map(s => s.skill_name.toLowerCase());
            const hasRequiredSkill = requiredSkills.some(skill => 
                userSkills.includes(skill.toLowerCase())
            );
            
            if (!hasRequiredSkill) {
                throw new ValidationError(
                    `Assignee lacks required skills: ${requiredSkills.join(', ')}`
                );
            }
        }
    }
    
    validateWorkingHours(context: AssignmentValidationContext, dueDate: Date): void {
        const { working_hours } = context.team.metadata;
        const dueDayOfWeek = dueDate.getDay();
        const dueHour = dueDate.getHours();
        
        if (!working_hours.working_days.includes(dueDayOfWeek)) {
            throw new ValidationError('Due date falls outside team working days');
        }
        
        if (dueHour < working_hours.start_hour || dueHour > working_hours.end_hour) {
            throw new ValidationError('Due date falls outside team working hours');
        }
    }
}
```

### Export Format Validation

```typescript
class ExportFormatValidator {
    validateZipPackageSize(packageSizeBytes: number): void {
        const MAX_PACKAGE_SIZE = 50 * 1024 * 1024; // 50MB limit
        
        if (packageSizeBytes > MAX_PACKAGE_SIZE) {
            throw new ValidationError(
                `Export package exceeds maximum size limit (${MAX_PACKAGE_SIZE} bytes)`
            );
        }
    }
    
    validateFileManifest(manifest: ExportFile[]): void {
        const allowedExtensions = ['.md', '.json', '.csv', '.txt', '.pdf', '.png', '.jpg'];
        const maxFileSize = 10 * 1024 * 1024; // 10MB per file
        
        for (const file of manifest) {
            // Validate file extension
            const hasValidExtension = allowedExtensions.some(ext => 
                file.filename.toLowerCase().endsWith(ext)
            );
            
            if (!hasValidExtension) {
                throw new ValidationError(
                    `File ${file.filename} has unsupported extension`
                );
            }
            
            // Validate file size
            if (file.file_size_bytes > maxFileSize) {
                throw new ValidationError(
                    `File ${file.filename} exceeds maximum size limit`
                );
            }
        }
    }
    
    validateChecksumIntegrity(expectedChecksum: string, actualChecksum: string): void {
        if (expectedChecksum !== actualChecksum) {
            throw new SecurityError('Export package checksum validation failed');
        }
    }
}
```

## Performance Constraints

### Team Dashboard Performance

```sql
-- Optimized team dashboard query with sub-second response time
WITH team_stats AS (
    SELECT 
        t.id,
        t.name,
        t.supervisor_id,
        COUNT(tm.user_id) as member_count,
        json_extract(t.metadata, '$.working_hours.timezone') as timezone
    FROM teams t
    LEFT JOIN team_members tm ON t.id = tm.team_id AND tm.status = 'Active'  
    WHERE t.status = 'Active'
    GROUP BY t.id
),
assignment_stats AS (
    SELECT 
        ta.team_id,
        COUNT(CASE WHEN ta.status = 'Active' THEN 1 END) as active_count,
        COUNT(CASE WHEN ta.status = 'Pending' THEN 1 END) as pending_count,
        COUNT(CASE WHEN ta.priority = 'Critical' THEN 1 END) as critical_count,
        MIN(ta.due_date) as earliest_due
    FROM ticket_assignments ta
    WHERE ta.status IN ('Active', 'Pending')
    GROUP BY ta.team_id
)
SELECT 
    ts.*,
    COALESCE(as_.active_count, 0) as active_assignments,
    COALESCE(as_.pending_count, 0) as pending_assignments, 
    COALESCE(as_.critical_count, 0) as critical_assignments,
    as_.earliest_due
FROM team_stats ts
LEFT JOIN assignment_stats as_ ON ts.id = as_.team_id
ORDER BY ts.name;
```

### Export Generation Optimization

```typescript
class ExportPerformanceManager {
    // Streaming ZIP generation for memory efficiency
    async generateExportPackage(
        ticket: any,
        template: ExportTemplate,
        attachments: ExportFile[]
    ): Promise<ExportPackage> {
        const startTime = Date.now();
        
        // Memory constraint: 128MB max during generation
        const memoryConstraint = 128 * 1024 * 1024;
        
        try {
            // Stream-based ZIP generation
            const zipStream = this.createZipStream();
            
            // Add markdown content (generated from template)
            const markdownContent = await this.renderTemplate(ticket, template);
            zipStream.addBuffer(Buffer.from(markdownContent), 'ticket.md');
            
            // Add metadata JSON
            const metadata = this.generateMetadata(ticket);
            zipStream.addBuffer(Buffer.from(JSON.stringify(metadata)), 'metadata.json');
            
            // Stream large attachments to avoid memory spikes
            for (const attachment of attachments) {
                await this.streamAttachmentToZip(zipStream, attachment);
            }
            
            const packageBuffer = await zipStream.finalize();
            const generationTime = Date.now() - startTime;
            
            // Performance target: <30 seconds for ZIP generation
            if (generationTime > 30000) {
                console.warn(`Export generation exceeded 30s target: ${generationTime}ms`);
            }
            
            return this.createExportPackage(packageBuffer, generationTime);
            
        } catch (error) {
            // Cleanup partial files on error
            await this.cleanupPartialExport();
            throw error;
        }
    }
    
    // Background cleanup for expired packages
    async cleanupExpiredPackages(): Promise<void> {
        const expiredPackages = await this.findExpiredPackages();
        
        for (const pkg of expiredPackages) {
            await this.secureDeletePackage(pkg);
        }
    }
}
```

### Database Query Optimization

```sql
-- Index optimization for concurrent team operations
CREATE INDEX idx_assignments_team_priority_due ON ticket_assignments(
    team_id, priority, due_date, status
) WHERE status IN ('Active', 'Pending');

-- Partial index for active workload calculations
CREATE INDEX idx_members_active_capacity ON team_members(
    user_id, assignment_capacity, status
) WHERE status = 'Active';

-- Composite index for export package cleanup
CREATE INDEX idx_packages_retention_status ON export_packages(
    retention_until, status
) WHERE status IN ('Ready', 'Downloaded');
```

### Memory and Concurrency Constraints

- **Concurrent Teams**: Support 50 teams with 20 members each simultaneously
- **Assignment Processing**: Handle 100+ ticket assignments per minute
- **Export Generation**: Maximum 10 concurrent ZIP package generations
- **Database Connections**: Pool size limited to 20 connections
- **Memory Usage**: 256MB maximum per export operation
- **WebSocket Connections**: 200+ concurrent progress tracking sessions

### Performance Targets

- **Team Dashboard Loading**: <1 second for 500+ active tickets
- **Assignment Creation**: <2 seconds with notification dispatch
- **Export Package Generation**: <30 seconds with 20+ attachments
- **Template Processing**: <500ms for complex Handlebars templates
- **Search Performance**: <300ms across 10,000+ historical assignments
- **Bulk Operations**: Process 50+ assignments in <10 seconds

## Integration Mappings

### API Contract Integration

```typescript
// RESTful API endpoints for team coordination
interface TeamManagementAPI {
    // Team operations
    createTeam(team: CreateTeamRequest): Promise<TeamResponse>;
    updateTeam(teamId: TeamId, updates: UpdateTeamRequest): Promise<TeamResponse>;
    assignMember(teamId: TeamId, userId: UserId, role: TeamRole): Promise<MembershipResponse>;
    
    // Assignment operations  
    assignTicket(request: TicketAssignmentRequest): Promise<AssignmentResponse>;
    escalateTicket(assignmentId: string, reason: string): Promise<EscalationResponse>;
    transferTicket(assignmentId: string, targetTeamId: TeamId): Promise<TransferResponse>;
    
    // Export operations
    generateExport(request: ExportGenerationRequest): Promise<ExportResponse>;
    downloadPackage(packageId: ExportPackageId): Promise<PackageDownloadResponse>;
    listTemplates(platform?: ExternalPlatform): Promise<TemplateListResponse>;
}

interface TicketAssignmentRequest {
    ticket_id: TicketId;
    team_id: TeamId;
    assignee_id?: UserId;
    priority: AssignmentPriority;
    due_date: string;  // ISO 8601 format
    estimated_hours?: number;
    assignment_reason: string;
}

interface ExportGenerationRequest {
    ticket_id: TicketId;
    template_id: TemplateId;
    export_format: ExternalPlatform;
    include_attachments: boolean;
    custom_fields?: Record<string, any>;
}
```

### WebSocket Progress Integration  

```typescript
// Real-time updates for team coordination and export progress
interface TeamCoordinationSocket {
    // Assignment notifications
    onAssignmentCreated(callback: (assignment: TicketAssignment) => void): void;
    onAssignmentEscalated(callback: (escalation: AssignmentPath) => void): void;
    onAssignmentCompleted(callback: (completion: AssignmentCompletion) => void): void;
    
    // Export progress tracking
    onExportStarted(callback: (packageId: ExportPackageId) => void): void;
    onExportProgress(callback: (progress: ExportProgress) => void): void;
    onExportCompleted(callback: (package: ExportPackage) => void): void;
    
    // Team notifications
    onTeamWorkloadAlert(callback: (alert: WorkloadAlert) => void): void;
    onDeadlineReminder(callback: (reminder: DeadlineReminder) => void): void;
}

interface ExportProgress {
    package_id: ExportPackageId;
    phase: ExportPhase;
    progress_percentage: number;
    current_operation: string;
    estimated_completion: string;
    files_processed: number;
    total_files: number;
}

enum ExportPhase {
    TEMPLATE_PROCESSING = 'Template Processing',
    FILE_COLLECTION = 'File Collection',  
    ZIP_GENERATION = 'ZIP Generation',
    CHECKSUM_CALCULATION = 'Checksum Calculation',
    FINAL_VALIDATION = 'Final Validation'
}
```

### External Platform Integration Patterns

```typescript
// Extensible connector pattern for different ticketing systems
abstract class TicketingSystemConnector {
    abstract validateConnection(): Promise<boolean>;
    abstract createTicket(data: ExportPackage): Promise<string>;
    abstract updateTicket(ticketId: string, data: ExportPackage): Promise<void>;
    abstract getTicketStatus(ticketId: string): Promise<TicketStatus>;
}

class JiraConnector extends TicketingSystemConnector {
    async createTicket(data: ExportPackage): Promise<string> {
        // Jira-specific API integration
        const jiraPayload = this.transformToJiraFormat(data);
        return await this.jiraAPI.createIssue(jiraPayload);
    }
    
    private transformToJiraFormat(data: ExportPackage): any {
        // Transform HexTrackr export to Jira issue format
        return {
            fields: {
                project: { key: this.config.projectKey },
                summary: data.package_metadata.ticket_summary,
                description: this.processMarkdownContent(data),
                issuetype: { name: 'Bug' },
                priority: this.mapPriority(data.package_metadata),
                // Additional Jira-specific fields
            }
        };
    }
}

// Template-driven integration for maximum flexibility
class TemplateBasedExporter {
    async exportToSystem(
        package: ExportPackage,
        template: ExportTemplate
    ): Promise<ExportResult> {
        // Process template with Handlebars
        const processedContent = this.templateEngine.render(
            template.markdown_template,
            this.buildTemplateContext(package)
        );
        
        // Generate platform-specific metadata
        const metadata = this.generatePlatformMetadata(
            package,
            template.field_mappings
        );
        
        // Create ZIP package with processed content
        return await this.createExportPackage(processedContent, metadata);
    }
}
```

### Database Integration Patterns

```typescript
// Repository pattern for team and export data access
interface TeamRepository {
    findTeamById(id: TeamId): Promise<TeamEntity | null>;
    findTeamsByUser(userId: UserId): Promise<TeamEntity[]>;
    findTeamMembers(teamId: TeamId): Promise<TeamMember[]>;
    createTeam(team: TeamEntity): Promise<void>;
    updateTeam(teamId: TeamId, updates: Partial<TeamEntity>): Promise<void>;
    deleteTeam(teamId: TeamId): Promise<void>;
}

interface AssignmentRepository {
    createAssignment(assignment: TicketAssignment): Promise<void>;
    updateAssignmentStatus(id: string, status: AssignmentStatus): Promise<void>;
    findAssignmentsByTeam(teamId: TeamId): Promise<TicketAssignment[]>;
    findAssignmentsByUser(userId: UserId): Promise<TicketAssignment[]>;
    findOverdueAssignments(): Promise<TicketAssignment[]>;
    recordAssignmentHistory(history: AssignmentPath): Promise<void>;
}

interface ExportRepository {  
    createTemplate(template: ExportTemplate): Promise<void>;
    findTemplatesByPlatform(platform: ExternalPlatform): Promise<ExportTemplate[]>;
    createExportPackage(package: ExportPackage): Promise<void>;
    updatePackageStatus(id: ExportPackageId, status: ExportStatus): Promise<void>;
    findExpiredPackages(): Promise<ExportPackage[]>;
    recordDownload(packageId: ExportPackageId, userId: UserId): Promise<void>;
}

// Service layer orchestration
class TicketCoordinationService {
    constructor(
        private teamRepo: TeamRepository,
        private assignmentRepo: AssignmentRepository,
        private exportRepo: ExportRepository,
        private notificationService: NotificationService
    ) {}
    
    async assignTicketToTeam(request: TicketAssignmentRequest): Promise<AssignmentResponse> {
        // Validate team capacity and permissions
        const team = await this.teamRepo.findTeamById(request.team_id);
        await this.validateAssignmentRequest(team, request);
        
        // Create assignment record
        const assignment = await this.createAssignment(request);
        await this.assignmentRepo.createAssignment(assignment);
        
        // Send notifications
        await this.notificationService.notifyTeamAssignment(assignment);
        
        return { success: true, assignment_id: assignment.id };
    }
}
```

## Migration Strategies

### Team Data Migration

```sql
-- Migration from existing user-based assignments to team-based
BEGIN TRANSACTION;

-- Create default teams for existing users
INSERT INTO teams (id, name, supervisor_id, status, permissions, metadata)
SELECT 
    lower(hex(randomblob(16))),  -- Generate UUID
    'Team_' || u.username,
    u.id,
    'Active',
    '{"can_export": true, "can_assign": true, "can_escalate": false, "external_platforms": ["GitHub"]}',
    '{"timezone": "UTC", "working_hours": {"start_hour": 9, "end_hour": 17, "working_days": [1,2,3,4,5]}, "escalation_threshold_hours": 24, "export_retention_days": 90}'
FROM users u
WHERE u.role IN ('analyst', 'admin');

-- Migrate existing ticket assignments to team structure
INSERT INTO ticket_assignments (id, ticket_id, team_id, assignee_id, assignment_type, priority, due_date, assignment_path, status)
SELECT 
    lower(hex(randomblob(16))),
    t.id,
    tm.team_id,  -- From newly created teams
    t.assigned_to,
    'Individual Level',
    COALESCE(t.priority, 'Medium'),
    COALESCE(t.due_date, datetime('now', '+7 days')),
    '[{"step_number": 1, "action": "Migrated", "reason": "Data migration", "timestamp": "' || datetime('now') || '"}]',
    CASE t.status 
        WHEN 'open' THEN 'Active'
        WHEN 'closed' THEN 'Completed'
        ELSE 'Pending'
    END
FROM tickets t
JOIN users u ON t.assigned_to = u.id
JOIN (
    SELECT tm.*, ROW_NUMBER() OVER (PARTITION BY tm.user_id ORDER BY tm.joined_at) as rn
    FROM team_members tm
) tm ON u.id = tm.user_id AND tm.rn = 1  -- First team for user
WHERE t.assigned_to IS NOT NULL;

COMMIT;
```

### Template Migration and Versioning

```sql
-- Template version management for backward compatibility
CREATE TABLE template_migrations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    template_id TEXT NOT NULL,
    from_version TEXT NOT NULL,
    to_version TEXT NOT NULL,
    migration_script TEXT NOT NULL,
    applied_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY(template_id) REFERENCES export_templates(id)
);

-- Example template upgrade migration
INSERT INTO template_migrations (template_id, from_version, to_version, migration_script)
VALUES (
    'jira-template-uuid',
    '1.0.0',
    '1.1.0',
    'UPDATE export_templates SET markdown_template = REPLACE(markdown_template, "{{priority}}", "{{assignment.priority}}") WHERE id = "jira-template-uuid"'
);
```

### Performance Schema Evolution

```sql
-- Add indexes for new query patterns without downtime
CREATE INDEX CONCURRENTLY idx_assignments_workload_calculation ON ticket_assignments(
    assignee_id, status, created_at
) WHERE status IN ('Active', 'Pending');

-- Gradual data type migration for better performance
ALTER TABLE export_packages ADD COLUMN package_size_mb REAL;
UPDATE export_packages SET package_size_mb = package_size_bytes / 1048576.0;

-- Create optimized replacement table for better performance
CREATE TABLE team_members_optimized (
    -- Same structure as team_members but with better defaults
    id TEXT PRIMARY KEY,
    team_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'Member',
    assignment_capacity INTEGER NOT NULL DEFAULT 10,  -- Increased default
    skills TEXT NOT NULL DEFAULT '[]',
    status TEXT NOT NULL DEFAULT 'Active',
    joined_at TEXT NOT NULL DEFAULT (datetime('now')),
    last_active TEXT NOT NULL DEFAULT (datetime('now'))
);
```

---

*This data model supports the comprehensive implementation of HexTrackr Specification 003: Ticket Bridging System with multi-platform coordination, team hierarchy management, and secure export capabilities.*
