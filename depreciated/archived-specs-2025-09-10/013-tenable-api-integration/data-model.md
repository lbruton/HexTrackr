# Tenable API Integration - Data Model

## Entity Definitions

### Core Tenable Integration Entities

```typescript
// Branded types for security-sensitive Tenable data
type TenableUUID = string & { readonly __brand: unique symbol };
type TenableApiKey = string & { readonly __brand: unique symbol };
type ScanJobId = string & { readonly __brand: unique symbol };
type PluginId = string & { readonly __brand: unique symbol };
type CVEId = string & { readonly __brand: unique symbol };

// Tenable asset record with UUID-first correlation
interface TenableAsset {
    readonly id: string;                          // HexTrackr UUID primary key
    readonly tenable_uuid: TenableUUID;           // Tenable's unique asset identifier
    readonly hostname: string;                    // Asset hostname (fallback correlation)
    readonly ip_addresses: string[];              // JSON array of IP addresses
    readonly operating_system?: string;           // OS information from Tenable
    readonly system_type?: string;                // Server, workstation, network device
    readonly mac_addresses: string[];             // JSON array of MAC addresses
    readonly network_interfaces: NetworkInterface[];
    readonly agent_installed: boolean;            // Tenable agent presence
    readonly last_authenticated_scan?: Date;      // Most recent credentialed scan
    readonly last_scan_time: Date;                // Most recent scan timestamp
    readonly asset_criticality?: AssetCriticality;
    readonly tags: string[];                      // JSON array of Tenable tags
    readonly correlation_confidence: number;      // 0-100 asset matching confidence
    readonly metadata: TenableAssetMetadata;
    readonly created_at: Date;
    readonly updated_at: Date;
}

enum AssetCriticality {
    CRITICAL = 'Critical',
    HIGH = 'High', 
    MEDIUM = 'Medium',
    LOW = 'Low'
}

interface NetworkInterface {
    readonly mac_address: string;
    readonly ip_address: string;
    readonly subnet?: string;
    readonly interface_name?: string;
}

interface TenableAssetMetadata {
    readonly tenable_created_at: Date;            // Asset first seen in Tenable
    readonly tenable_updated_at: Date;            // Asset last updated in Tenable
    readonly scanner_sources: string[];           // Which scanners detected asset
    readonly bios_uuid?: string;                  // BIOS UUID if available
    readonly aws_instance_id?: string;            // AWS instance ID if cloud asset
    readonly azure_vm_id?: string;                // Azure VM ID if cloud asset
    readonly servicenow_sysid?: string;           // ServiceNow system ID correlation
    readonly raw_asset_data: string;              // JSON string of complete Tenable data
}
```

### Vulnerability Scanner Adapter Pattern

```typescript
// Generic vulnerability scanner interface for extensibility
interface VulnerabilityScannerAdapter {
    readonly scanner_type: ScannerType;
    getAssets(): Promise<Asset[]>;
    getVulnerabilities(assetId: TenableUUID): Promise<ScanVulnerability[]>;
    getLastScanResults(): Promise<ScanResult[]>;
    getPluginDetails(pluginId: PluginId): Promise<PluginDetail>;
    authenticateConnection(): Promise<boolean>;
}

enum ScannerType {
    TENABLE_IO = 'Tenable.io',
    TENABLE_SC = 'Tenable.sc',
    TENABLE_OT = 'Tenable.ot',
    NESSUS = 'Nessus'
}

// Tenable-specific implementation
interface TenableScannerAdapter extends VulnerabilityScannerAdapter {
    readonly api_endpoint: string;
    readonly api_key: TenableApiKey;
    readonly secret_key: TenableApiKey;
    readonly rate_limiter: RateLimiter;
    readonly retry_policy: RetryPolicy;
}

interface RetryPolicy {
    readonly max_retries: number;
    readonly base_delay_ms: number;
    readonly max_delay_ms: number;
    readonly exponential_base: number;
}
```

### Scan Management Entities

```typescript
// Background job processing for long-running scans
interface ScanJob {
    readonly id: ScanJobId;                       // Background job identifier
    readonly tenable_scan_id: string;             // Tenable's scan ID
    readonly scan_name: string;                   // Human-readable scan name
    readonly job_type: ScanJobType;
    readonly status: ScanJobStatus;
    readonly priority: JobPriority;
    readonly scheduled_time?: Date;               // For recurring scans
    readonly start_time?: Date;
    readonly completion_time?: Date;
    readonly processing_time_ms?: number;
    readonly assets_discovered: number;
    readonly vulnerabilities_found: number;
    readonly retry_count: number;
    readonly max_retries: number;
    readonly error_message?: string;
    readonly progress_percentage: number;
    readonly current_operation: string;
    readonly job_metadata: ScanJobMetadata;
    readonly created_by: string;                  // User ID who initiated scan
    readonly created_at: Date;
    readonly updated_at: Date;
}

enum ScanJobType {
    ASSET_DISCOVERY = 'Asset Discovery',
    VULNERABILITY_SCAN = 'Vulnerability Scan',
    COMPLIANCE_SCAN = 'Compliance Scan',
    AUTHENTICATED_SCAN = 'Authenticated Scan'
}

enum ScanJobStatus {
    PENDING = 'Pending',
    RUNNING = 'Running',
    COMPLETED = 'Completed',
    FAILED = 'Failed',
    CANCELLED = 'Cancelled',
    RETRYING = 'Retrying'
}

enum JobPriority {
    LOW = 1,
    NORMAL = 2,
    HIGH = 3,
    CRITICAL = 4
}

interface ScanJobMetadata {
    readonly tenable_scan_uuid?: string;
    readonly scan_template: string;
    readonly target_assets: TenableUUID[];
    readonly scan_window_start?: string;          // HH:MM format
    readonly scan_window_end?: string;            // HH:MM format
    readonly exclude_targets: string[];           // IP ranges to exclude
    readonly plugin_sets: string[];               // Tenable plugin families
    readonly performance_settings: ScanPerformanceSettings;
    readonly notification_settings: NotificationSettings;
}

interface ScanPerformanceSettings {
    readonly max_scan_time_hours: number;
    readonly network_timeout: number;
    readonly max_hosts_in_parallel: number;
    readonly checks_per_host: number;
}

interface NotificationSettings {
    readonly notify_on_completion: boolean;
    readonly notify_on_failure: boolean;
    readonly notification_channels: string[];     // email, slack, webhook
}
```

### Plugin Mapping & CVE Correlation

```typescript
// Tenable plugin to CVE correlation system
interface PluginMapping {
    readonly id: string;                          // UUID primary key
    readonly plugin_id: PluginId;                 // Tenable plugin identifier
    readonly plugin_name: string;                 // Plugin display name
    readonly plugin_family: string;               // Tenable plugin family
    readonly cve_ids: CVEId[];                   // Associated CVE identifiers
    readonly cvss_base_score?: number;           // CVSS 3.1 base score
    readonly cvss_temporal_score?: number;        // CVSS 3.1 temporal score
    readonly cvss_vector?: string;               // CVSS vector string
    readonly severity: VulnerabilitySeverity;
    readonly vpr_score?: number;                 // Tenable VPR score
    readonly exploit_available: boolean;
    readonly exploit_ease: ExploitEase;
    readonly patch_publication_date?: Date;
    readonly vulnerability_publication_date?: Date;
    readonly plugin_modification_date: Date;
    readonly solution_text?: string;
    readonly synopsis: string;
    readonly description: string;
    readonly plugin_output_sample?: string;
    readonly references: ExternalReference[];
    readonly see_also: string[];
    readonly metadata: PluginMetadata;
    readonly created_at: Date;
    readonly updated_at: Date;
}

enum ExploitEase {
    NO_KNOWN_EXPLOITS = 'No Known Exploits',
    EXPLOITS_EXIST = 'Exploits Exist', 
    FUNCTIONAL_EXPLOIT = 'Functional Exploit',
    EXPLOITABLE_WITH_AUTHENTICATION = 'Exploitable with Authentication',
    REMOTE_EXPLOIT = 'Remote Exploit'
}

interface ExternalReference {
    readonly type: ReferenceType;
    readonly value: string;
    readonly url?: string;
}

enum ReferenceType {
    CVE = 'CVE',
    BID = 'BID',
    CWE = 'CWE',
    CERT = 'CERT',
    OVAL = 'OVAL',
    SECUNIA = 'Secunia',
    VENDOR_ADVISORY = 'Vendor Advisory'
}

interface PluginMetadata {
    readonly tenable_plugin_id: number;
    readonly plugin_type: PluginType;
    readonly risk_factor: RiskFactor;
    readonly asset_inventory_category?: string;
    readonly compliance_references: string[];
    readonly required_ports: string[];
    readonly required_keys: string[];
    readonly dependencies: string[];
    readonly exclusions: string[];
    readonly raw_plugin_data: string;            // JSON string of complete plugin data
}

enum PluginType {
    REMOTE = 'remote',
    LOCAL = 'local',
    COMBINED = 'combined',
    SUMMARY = 'summary'
}

enum RiskFactor {
    CRITICAL = 'Critical',
    HIGH = 'High',
    MEDIUM = 'Medium',
    LOW = 'Low',
    NONE = 'None'
}
```

### Scan Result Storage

```typescript
// Split ownership model: Tenable read-only vs HexTrackr managed
interface ScanVulnerability {
    readonly id: string;                          // HexTrackr UUID primary key
    
    // Tenable-owned data (read-only, synced from API)
    readonly tenable_data: TenableVulnerabilityData;
    
    // HexTrackr-managed data (user modifications)
    readonly hextrackr_data: HexTrackrVulnerabilityData;
    
    readonly correlation_info: CorrelationInfo;
    readonly created_at: Date;
    readonly updated_at: Date;
}

// Read-only data synchronized from Tenable
interface TenableVulnerabilityData {
    readonly scan_id: string;
    readonly asset_uuid: TenableUUID;
    readonly plugin_id: PluginId;
    readonly plugin_name: string;
    readonly plugin_family: string;
    readonly severity: VulnerabilitySeverity;
    readonly vpr_score?: number;
    readonly cvss_base_score?: number;
    readonly cvss_temporal_score?: number;
    readonly cve_ids: CVEId[];
    readonly first_seen: Date;
    readonly last_seen: Date;
    readonly count: number;                       // Number of times found
    readonly state: TenableVulnerabilityState;
    readonly output?: string;                     // Plugin output text
    readonly port?: number;
    readonly protocol?: string;
    readonly service?: string;
    readonly exploit_available: boolean;
    readonly exploitability_ease: ExploitEase;
    readonly patch_publication_date?: Date;
    readonly vulnerability_publication_date?: Date;
    readonly solution: string;
    readonly synopsis: string;
    readonly description: string;
    readonly see_also: string[];
    readonly raw_tenable_data: string;           // Complete JSON from Tenable API
}

enum TenableVulnerabilityState {
    OPEN = 'Open',
    REOPENED = 'Reopened', 
    FIXED = 'Fixed'
}

// HexTrackr-managed vulnerability data
interface HexTrackrVulnerabilityData {
    status: HexTrackrVulnerabilityStatus;
    assigned_to?: string;                         // User ID
    assigned_team?: string;
    priority: VulnerabilityPriority;
    due_date?: Date;
    remediation_date?: Date;
    false_positive_reason?: string;
    accepted_risk_reason?: string;
    business_justification?: string;
    remediation_notes: string;
    custom_tags: string[];
    sla_breach_date?: Date;
    last_modified_by: string;                    // User ID
    last_modified_at: Date;
}

enum HexTrackrVulnerabilityStatus {
    NEW = 'New',
    ASSIGNED = 'Assigned',
    IN_PROGRESS = 'In Progress', 
    REMEDIATED = 'Remediated',
    FALSE_POSITIVE = 'False Positive',
    ACCEPTED_RISK = 'Accepted Risk',
    RETEST_REQUESTED = 'Retest Requested'
}

enum VulnerabilityPriority {
    P1_CRITICAL = 'P1 - Critical',
    P2_HIGH = 'P2 - High',
    P3_MEDIUM = 'P3 - Medium', 
    P4_LOW = 'P4 - Low'
}

interface CorrelationInfo {
    readonly correlation_method: CorrelationMethod;
    readonly correlation_confidence: number;     // 0-100 confidence score
    readonly correlation_timestamp: Date;
    readonly manual_review_required: boolean;
    readonly correlation_notes?: string;
}

enum CorrelationMethod {
    UUID_EXACT = 'UUID Exact Match',
    HOSTNAME_FALLBACK = 'Hostname Fallback',
    IP_CORRELATION = 'IP Address Correlation',
    MANUAL_MAPPING = 'Manual Mapping'
}
```

## Database Schema

### SQLite Configuration (High-Performance Processing)

```sql
-- Optimize SQLite for background job processing and large scan datasets
PRAGMA journal_mode = WAL;
PRAGMA synchronous = NORMAL;
PRAGMA cache_size = 131072;        -- 512MB cache for large scans
PRAGMA temp_store = MEMORY;
PRAGMA mmap_size = 2147483648;     -- 2GB memory mapping
PRAGMA foreign_keys = ON;
PRAGMA auto_vacuum = INCREMENTAL;
PRAGMA optimize;

-- Enable query planner statistics for performance optimization
ANALYZE;
```

### Asset Correlation Tables

```sql
-- Tenable asset storage with UUID-first correlation
CREATE TABLE tenable_assets (
    id TEXT PRIMARY KEY,
    tenable_uuid TEXT UNIQUE NOT NULL CHECK(LENGTH(tenable_uuid) = 36),
    hostname TEXT NOT NULL CHECK(LENGTH(hostname) <= 255),
    ip_addresses TEXT NOT NULL CHECK(json_valid(ip_addresses)),
    operating_system TEXT CHECK(LENGTH(operating_system) <= 500),
    system_type TEXT CHECK(system_type IN ('Server', 'Workstation', 'Network Device', 'Mobile', 'Other')),
    mac_addresses TEXT NOT NULL CHECK(json_valid(mac_addresses)),
    network_interfaces TEXT CHECK(json_valid(network_interfaces)),
    agent_installed INTEGER NOT NULL DEFAULT 0 CHECK(agent_installed IN (0, 1)),
    last_authenticated_scan TEXT,
    last_scan_time TEXT NOT NULL,
    asset_criticality TEXT CHECK(asset_criticality IN ('Critical', 'High', 'Medium', 'Low')),
    tags TEXT NOT NULL DEFAULT '[]' CHECK(json_valid(tags)),
    correlation_confidence INTEGER NOT NULL CHECK(correlation_confidence >= 0 AND correlation_confidence <= 100),
    metadata TEXT NOT NULL CHECK(json_valid(metadata)),
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
);

-- Performance indexes for asset correlation
CREATE UNIQUE INDEX idx_tenable_assets_uuid ON tenable_assets(tenable_uuid);
CREATE INDEX idx_tenable_assets_hostname ON tenable_assets(hostname COLLATE NOCASE);
CREATE INDEX idx_tenable_assets_ip ON tenable_assets(json_each.value) 
WHERE json_each.path LIKE '$.ip_addresses[%]';
CREATE INDEX idx_tenable_assets_last_scan ON tenable_assets(last_scan_time);
CREATE INDEX idx_tenable_assets_criticality ON tenable_assets(asset_criticality);
CREATE INDEX idx_tenable_assets_agent ON tenable_assets(agent_installed);

-- Asset correlation tracking for audit and troubleshooting
CREATE TABLE asset_correlation_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    tenable_uuid TEXT NOT NULL,
    hextrackr_asset_id TEXT,
    correlation_method TEXT NOT NULL CHECK(correlation_method IN ('UUID Exact Match', 'Hostname Fallback', 'IP Address Correlation', 'Manual Mapping')),
    correlation_confidence INTEGER NOT NULL CHECK(correlation_confidence >= 0 AND correlation_confidence <= 100),
    previous_correlation TEXT,          -- JSON of previous correlation if changed
    correlation_data TEXT NOT NULL CHECK(json_valid(correlation_data)),
    manual_review_required INTEGER DEFAULT 0 CHECK(manual_review_required IN (0, 1)),
    correlation_notes TEXT,
    correlated_by TEXT,                 -- User ID who performed correlation
    correlated_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY(tenable_uuid) REFERENCES tenable_assets(tenable_uuid)
);

CREATE INDEX idx_correlation_log_uuid ON asset_correlation_log(tenable_uuid);
CREATE INDEX idx_correlation_log_method ON asset_correlation_log(correlation_method);
CREATE INDEX idx_correlation_log_confidence ON asset_correlation_log(correlation_confidence);
CREATE INDEX idx_correlation_log_review ON asset_correlation_log(manual_review_required);
```

### Background Job Processing Tables

```sql
-- Background job management for scan processing
CREATE TABLE scan_jobs (
    id TEXT PRIMARY KEY,
    tenable_scan_id TEXT NOT NULL,
    scan_name TEXT NOT NULL CHECK(LENGTH(scan_name) <= 255),
    job_type TEXT NOT NULL CHECK(job_type IN ('Asset Discovery', 'Vulnerability Scan', 'Compliance Scan', 'Authenticated Scan')),
    status TEXT NOT NULL DEFAULT 'Pending' CHECK(status IN ('Pending', 'Running', 'Completed', 'Failed', 'Cancelled', 'Retrying')),
    priority INTEGER NOT NULL DEFAULT 2 CHECK(priority >= 1 AND priority <= 4),
    scheduled_time TEXT,
    start_time TEXT,
    completion_time TEXT,
    processing_time_ms INTEGER,
    assets_discovered INTEGER NOT NULL DEFAULT 0,
    vulnerabilities_found INTEGER NOT NULL DEFAULT 0,
    retry_count INTEGER NOT NULL DEFAULT 0,
    max_retries INTEGER NOT NULL DEFAULT 3,
    error_message TEXT,
    progress_percentage INTEGER NOT NULL DEFAULT 0 CHECK(progress_percentage >= 0 AND progress_percentage <= 100),
    current_operation TEXT NOT NULL DEFAULT 'Initializing',
    job_metadata TEXT NOT NULL CHECK(json_valid(job_metadata)),
    created_by TEXT NOT NULL,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
);

-- Performance indexes for job queue management
CREATE INDEX idx_scan_jobs_status ON scan_jobs(status);
CREATE INDEX idx_scan_jobs_priority ON scan_jobs(priority DESC, created_at ASC);
CREATE INDEX idx_scan_jobs_tenable_id ON scan_jobs(tenable_scan_id);
CREATE INDEX idx_scan_jobs_user ON scan_jobs(created_by);
CREATE INDEX idx_scan_jobs_scheduled ON scan_jobs(scheduled_time) WHERE scheduled_time IS NOT NULL;
CREATE INDEX idx_scan_jobs_completion ON scan_jobs(completion_time) WHERE completion_time IS NOT NULL;

-- Job progress tracking for WebSocket updates
CREATE TABLE job_progress_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    job_id TEXT NOT NULL,
    phase TEXT NOT NULL,
    progress_percentage INTEGER NOT NULL CHECK(progress_percentage >= 0 AND progress_percentage <= 100),
    current_operation TEXT NOT NULL,
    records_processed INTEGER NOT NULL DEFAULT 0,
    total_records INTEGER NOT NULL DEFAULT 0,
    estimated_completion TEXT,
    performance_metrics TEXT CHECK(json_valid(performance_metrics)),
    logged_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY(job_id) REFERENCES scan_jobs(id) ON DELETE CASCADE
);

CREATE INDEX idx_progress_log_job ON job_progress_log(job_id);
CREATE INDEX idx_progress_log_time ON job_progress_log(logged_at);

-- Job queue for prioritized processing
CREATE TABLE job_queue (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    job_id TEXT NOT NULL UNIQUE,
    queue_name TEXT NOT NULL DEFAULT 'default',
    priority INTEGER NOT NULL DEFAULT 2,
    scheduled_for TEXT NOT NULL,
    attempts INTEGER NOT NULL DEFAULT 0,
    max_attempts INTEGER NOT NULL DEFAULT 3,
    backoff_delay_ms INTEGER NOT NULL DEFAULT 1000,
    job_data TEXT NOT NULL CHECK(json_valid(job_data)),
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY(job_id) REFERENCES scan_jobs(id) ON DELETE CASCADE
);

CREATE INDEX idx_job_queue_priority ON job_queue(priority DESC, scheduled_for ASC);
CREATE INDEX idx_job_queue_name ON job_queue(queue_name);
CREATE INDEX idx_job_queue_scheduled ON job_queue(scheduled_for);
```

### Plugin Mapping & CVE Correlation Tables

```sql
-- Tenable plugin to CVE mapping with comprehensive metadata
CREATE TABLE tenable_plugin_mapping (
    id TEXT PRIMARY KEY,
    plugin_id TEXT UNIQUE NOT NULL CHECK(LENGTH(plugin_id) <= 50),
    plugin_name TEXT NOT NULL CHECK(LENGTH(plugin_name) <= 500),
    plugin_family TEXT NOT NULL CHECK(LENGTH(plugin_family) <= 100),
    cve_ids TEXT NOT NULL DEFAULT '[]' CHECK(json_valid(cve_ids)),
    cvss_base_score REAL CHECK(cvss_base_score >= 0.0 AND cvss_base_score <= 10.0),
    cvss_temporal_score REAL CHECK(cvss_temporal_score >= 0.0 AND cvss_temporal_score <= 10.0),
    cvss_vector TEXT CHECK(LENGTH(cvss_vector) <= 100),
    severity TEXT NOT NULL CHECK(severity IN ('Critical', 'High', 'Medium', 'Low', 'Info')),
    vpr_score REAL CHECK(vpr_score >= 0.0 AND vpr_score <= 10.0),
    exploit_available INTEGER NOT NULL DEFAULT 0 CHECK(exploit_available IN (0, 1)),
    exploit_ease TEXT CHECK(exploit_ease IN ('No Known Exploits', 'Exploits Exist', 'Functional Exploit', 'Exploitable with Authentication', 'Remote Exploit')),
    patch_publication_date TEXT,
    vulnerability_publication_date TEXT,
    plugin_modification_date TEXT NOT NULL,
    solution_text TEXT,
    synopsis TEXT NOT NULL CHECK(LENGTH(synopsis) <= 1000),
    description TEXT NOT NULL CHECK(LENGTH(description) <= 10000),
    plugin_output_sample TEXT CHECK(LENGTH(plugin_output_sample) <= 2000),
    external_references TEXT NOT NULL DEFAULT '[]' CHECK(json_valid(external_references)),
    see_also TEXT NOT NULL DEFAULT '[]' CHECK(json_valid(see_also)),
    metadata TEXT NOT NULL CHECK(json_valid(metadata)),
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
);

-- Plugin mapping performance indexes
CREATE UNIQUE INDEX idx_plugin_mapping_id ON tenable_plugin_mapping(plugin_id);
CREATE INDEX idx_plugin_mapping_family ON tenable_plugin_mapping(plugin_family);
CREATE INDEX idx_plugin_mapping_severity ON tenable_plugin_mapping(severity);
CREATE INDEX idx_plugin_mapping_cvss ON tenable_plugin_mapping(cvss_base_score) WHERE cvss_base_score IS NOT NULL;
CREATE INDEX idx_plugin_mapping_vpr ON tenable_plugin_mapping(vpr_score) WHERE vpr_score IS NOT NULL;
CREATE INDEX idx_plugin_mapping_exploit ON tenable_plugin_mapping(exploit_available, exploit_ease);
CREATE INDEX idx_plugin_mapping_modified ON tenable_plugin_mapping(plugin_modification_date);

-- CVE to plugin reverse lookup for correlation
CREATE TABLE cve_plugin_correlation (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    cve_id TEXT NOT NULL CHECK(cve_id GLOB 'CVE-[0-9][0-9][0-9][0-9]-[0-9]*'),
    plugin_id TEXT NOT NULL,
    correlation_confidence INTEGER NOT NULL DEFAULT 100 CHECK(correlation_confidence >= 0 AND correlation_confidence <= 100),
    correlation_source TEXT NOT NULL CHECK(correlation_source IN ('Tenable API', 'NVD Mapping', 'Manual Mapping', 'Community Mapping')),
    verified_at TEXT,
    verified_by TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY(plugin_id) REFERENCES tenable_plugin_mapping(plugin_id) ON DELETE CASCADE
);

CREATE INDEX idx_cve_correlation_cve ON cve_plugin_correlation(cve_id);
CREATE INDEX idx_cve_correlation_plugin ON cve_plugin_correlation(plugin_id);
CREATE INDEX idx_cve_correlation_confidence ON cve_plugin_correlation(correlation_confidence);
CREATE UNIQUE INDEX idx_cve_plugin_unique ON cve_plugin_correlation(cve_id, plugin_id);
```

### Vulnerability Storage (Split Ownership Model)

```sql
-- Split ownership: Tenable read-only + HexTrackr managed data
CREATE TABLE scan_vulnerabilities (
    id TEXT PRIMARY KEY,
    
    -- Tenable read-only data (synced from API)
    tenable_scan_id TEXT NOT NULL,
    asset_uuid TEXT NOT NULL,
    plugin_id TEXT NOT NULL,
    plugin_name TEXT NOT NULL CHECK(LENGTH(plugin_name) <= 500),
    plugin_family TEXT NOT NULL CHECK(LENGTH(plugin_family) <= 100),
    tenable_severity TEXT NOT NULL CHECK(tenable_severity IN ('Critical', 'High', 'Medium', 'Low', 'Info')),
    vpr_score REAL CHECK(vpr_score >= 0.0 AND vpr_score <= 10.0),
    cvss_base_score REAL CHECK(cvss_base_score >= 0.0 AND cvss_base_score <= 10.0),
    cvss_temporal_score REAL CHECK(cvss_temporal_score >= 0.0 AND cvss_temporal_score <= 10.0),
    cve_ids TEXT NOT NULL DEFAULT '[]' CHECK(json_valid(cve_ids)),
    first_seen TEXT NOT NULL,
    last_seen TEXT NOT NULL,
    count INTEGER NOT NULL DEFAULT 1,
    tenable_state TEXT NOT NULL CHECK(tenable_state IN ('Open', 'Reopened', 'Fixed')),
    plugin_output TEXT CHECK(LENGTH(plugin_output) <= 10000),
    port INTEGER CHECK(port >= 0 AND port <= 65535),
    protocol TEXT CHECK(protocol IN ('tcp', 'udp', 'icmp')),
    service TEXT CHECK(LENGTH(service) <= 100),
    exploit_available INTEGER NOT NULL DEFAULT 0 CHECK(exploit_available IN (0, 1)),
    exploitability_ease TEXT,
    patch_publication_date TEXT,
    vulnerability_publication_date TEXT,
    solution TEXT CHECK(LENGTH(solution) <= 5000),
    synopsis TEXT NOT NULL CHECK(LENGTH(synopsis) <= 1000),
    description TEXT NOT NULL CHECK(LENGTH(description) <= 10000),
    see_also TEXT NOT NULL DEFAULT '[]' CHECK(json_valid(see_also)),
    raw_tenable_data TEXT NOT NULL CHECK(json_valid(raw_tenable_data)),
    
    -- HexTrackr managed data (user modifications)
    hextrackr_status TEXT NOT NULL DEFAULT 'New' CHECK(hextrackr_status IN ('New', 'Assigned', 'In Progress', 'Remediated', 'False Positive', 'Accepted Risk', 'Retest Requested')),
    assigned_to TEXT,
    assigned_team TEXT CHECK(LENGTH(assigned_team) <= 100),
    priority TEXT NOT NULL DEFAULT 'P3 - Medium' CHECK(priority IN ('P1 - Critical', 'P2 - High', 'P3 - Medium', 'P4 - Low')),
    due_date TEXT,
    remediation_date TEXT,
    false_positive_reason TEXT CHECK(LENGTH(false_positive_reason) <= 1000),
    accepted_risk_reason TEXT CHECK(LENGTH(accepted_risk_reason) <= 1000),
    business_justification TEXT CHECK(LENGTH(business_justification) <= 2000),
    remediation_notes TEXT NOT NULL DEFAULT '' CHECK(LENGTH(remediation_notes) <= 5000),
    custom_tags TEXT NOT NULL DEFAULT '[]' CHECK(json_valid(custom_tags)),
    sla_breach_date TEXT,
    last_modified_by TEXT NOT NULL,
    last_modified_at TEXT DEFAULT (datetime('now')),
    
    -- Correlation metadata
    correlation_method TEXT NOT NULL DEFAULT 'UUID Exact Match' CHECK(correlation_method IN ('UUID Exact Match', 'Hostname Fallback', 'IP Address Correlation', 'Manual Mapping')),
    correlation_confidence INTEGER NOT NULL DEFAULT 100 CHECK(correlation_confidence >= 0 AND correlation_confidence <= 100),
    correlation_timestamp TEXT DEFAULT (datetime('now')),
    manual_review_required INTEGER DEFAULT 0 CHECK(manual_review_required IN (0, 1)),
    correlation_notes TEXT CHECK(LENGTH(correlation_notes) <= 1000),
    
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    
    FOREIGN KEY(asset_uuid) REFERENCES tenable_assets(tenable_uuid) ON DELETE CASCADE,
    FOREIGN KEY(plugin_id) REFERENCES tenable_plugin_mapping(plugin_id) ON DELETE RESTRICT
);

-- Performance indexes for vulnerability queries
CREATE INDEX idx_scan_vulns_asset ON scan_vulnerabilities(asset_uuid);
CREATE INDEX idx_scan_vulns_plugin ON scan_vulnerabilities(plugin_id);
CREATE INDEX idx_scan_vulns_severity ON scan_vulnerabilities(tenable_severity);
CREATE INDEX idx_scan_vulns_status ON scan_vulnerabilities(hextrackr_status);
CREATE INDEX idx_scan_vulns_assigned ON scan_vulnerabilities(assigned_to) WHERE assigned_to IS NOT NULL;
CREATE INDEX idx_scan_vulns_priority ON scan_vulnerabilities(priority);
CREATE INDEX idx_scan_vulns_last_seen ON scan_vulnerabilities(last_seen);
CREATE INDEX idx_scan_vulns_due_date ON scan_vulnerabilities(due_date) WHERE due_date IS NOT NULL;
CREATE INDEX idx_scan_vulns_tenable_state ON scan_vulnerabilities(tenable_state);
CREATE INDEX idx_scan_vulns_scan_id ON scan_vulnerabilities(tenable_scan_id);
CREATE INDEX idx_scan_vulns_correlation ON scan_vulnerabilities(correlation_confidence, manual_review_required);

-- Composite indexes for common query patterns
CREATE INDEX idx_scan_vulns_severity_status ON scan_vulnerabilities(tenable_severity, hextrackr_status);
CREATE INDEX idx_scan_vulns_asset_severity ON scan_vulnerabilities(asset_uuid, tenable_severity);
CREATE INDEX idx_scan_vulns_assigned_priority ON scan_vulnerabilities(assigned_to, priority) WHERE assigned_to IS NOT NULL;
```

### Historical Data & Aggregation Tables

```sql
-- Monthly aggregation for trend analysis (performance optimization)
CREATE TABLE tenable_monthly_summary (
    id TEXT PRIMARY KEY,
    summary_month TEXT NOT NULL,              -- YYYY-MM format
    total_assets INTEGER NOT NULL DEFAULT 0,
    active_assets INTEGER NOT NULL DEFAULT 0,
    total_vulnerabilities INTEGER NOT NULL DEFAULT 0,
    critical_vulnerabilities INTEGER NOT NULL DEFAULT 0,
    high_vulnerabilities INTEGER NOT NULL DEFAULT 0,
    medium_vulnerabilities INTEGER NOT NULL DEFAULT 0,
    low_vulnerabilities INTEGER NOT NULL DEFAULT 0,
    info_vulnerabilities INTEGER NOT NULL DEFAULT 0,
    new_vulnerabilities INTEGER NOT NULL DEFAULT 0,
    remediated_vulnerabilities INTEGER NOT NULL DEFAULT 0,
    false_positives INTEGER NOT NULL DEFAULT 0,
    accepted_risks INTEGER NOT NULL DEFAULT 0,
    scan_jobs_completed INTEGER NOT NULL DEFAULT 0,
    scan_jobs_failed INTEGER NOT NULL DEFAULT 0,
    average_scan_time_minutes REAL,
    average_correlation_confidence REAL,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
);

CREATE UNIQUE INDEX idx_monthly_summary_month ON tenable_monthly_summary(summary_month);
CREATE INDEX idx_monthly_summary_created ON tenable_monthly_summary(created_at);

-- Historical scan metadata for data lifecycle management
CREATE TABLE scan_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    tenable_scan_id TEXT NOT NULL,
    scan_name TEXT NOT NULL,
    scan_start_time TEXT NOT NULL,
    scan_end_time TEXT NOT NULL,
    assets_scanned INTEGER NOT NULL,
    vulnerabilities_discovered INTEGER NOT NULL,
    scan_duration_minutes INTEGER NOT NULL,
    scan_type TEXT NOT NULL,
    scanner_version TEXT,
    plugin_set_version TEXT,
    raw_scan_metadata TEXT NOT NULL CHECK(json_valid(raw_scan_metadata)),
    archived_at TEXT,
    retention_until TEXT,               -- Data retention date
    created_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX idx_scan_history_tenable_id ON scan_history(tenable_scan_id);
CREATE INDEX idx_scan_history_start_time ON scan_history(scan_start_time);
CREATE INDEX idx_scan_history_duration ON scan_history(scan_duration_minutes);
CREATE INDEX idx_scan_history_archived ON scan_history(archived_at) WHERE archived_at IS NOT NULL;
CREATE INDEX idx_scan_history_retention ON scan_history(retention_until);
```

## Validation Rules

### Tenable UUID Validation

```typescript
// Strict UUID validation for Tenable asset correlation
function validateTenableUUID(input: string): TenableUUID {
    const uuidV4Pattern = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    
    if (!input || !uuidV4Pattern.test(input)) {
        throw new ValidationError('Invalid Tenable UUID format - must be valid UUID v4');
    }
    
    return input.toLowerCase() as TenableUUID;
}

// Plugin ID validation with Tenable-specific constraints
function validatePluginId(input: string): PluginId {
    const pluginPattern = /^\d{1,6}$/;  // Tenable plugin IDs are numeric, max 6 digits
    
    if (!input || !pluginPattern.test(input)) {
        throw new ValidationError('Invalid Plugin ID format - must be 1-6 digit number');
    }
    
    const pluginNum = parseInt(input, 10);
    if (pluginNum <= 0 || pluginNum > 999999) {
        throw new ValidationError('Plugin ID must be between 1 and 999999');
    }
    
    return input as PluginId;
}

// API key validation for secure credential handling
function validateTenableApiKey(input: string): TenableApiKey {
    // Tenable.io API keys are typically 64-character hex strings
    const apiKeyPattern = /^[a-f0-9]{64}$/i;
    
    if (!input || !apiKeyPattern.test(input)) {
        throw new ValidationError('Invalid Tenable API key format');
    }
    
    return input.toLowerCase() as TenableApiKey;
}
```

### Scan Result Integrity Validation

```typescript
// Comprehensive scan result validation with business rules
interface ScanResultValidator {
    validateAssetCorrelation(asset: TenableAsset): ValidationResult;
    validateVulnerabilityData(vuln: ScanVulnerability): ValidationResult;
    validatePluginMapping(mapping: PluginMapping): ValidationResult;
    validateScanJob(job: ScanJob): ValidationResult;
}

class TenableScanResultValidator implements ScanResultValidator {
    validateAssetCorrelation(asset: TenableAsset): ValidationResult {
        const errors: string[] = [];
        
        // UUID must be present and valid
        if (!asset.tenable_uuid) {
            errors.push('Asset must have valid Tenable UUID');
        }
        
        // Hostname validation with fallback correlation rules
        if (!asset.hostname || asset.hostname.length < 2) {
            errors.push('Asset hostname must be at least 2 characters');
        }
        
        // IP address validation
        if (!asset.ip_addresses || asset.ip_addresses.length === 0) {
            errors.push('Asset must have at least one IP address');
        } else {
            asset.ip_addresses.forEach((ip, index) => {
                if (!this.isValidIPAddress(ip)) {
                    errors.push(`Invalid IP address at index ${index}: ${ip}`);
                }
            });
        }
        
        // Correlation confidence validation
        if (asset.correlation_confidence < 50) {
            errors.push('Asset correlation confidence below minimum threshold (50%)');
        }
        
        // MAC address format validation
        asset.mac_addresses.forEach((mac, index) => {
            if (!this.isValidMACAddress(mac)) {
                errors.push(`Invalid MAC address at index ${index}: ${mac}`);
            }
        });
        
        return {
            valid: errors.length === 0,
            errors,
            confidence: asset.correlation_confidence
        };
    }
    
    validateVulnerabilityData(vuln: ScanVulnerability): ValidationResult {
        const errors: string[] = [];
        
        // Plugin ID must exist in mapping table
        if (!vuln.plugin_id) {
            errors.push('Vulnerability must have valid plugin ID');
        }
        
        // Severity consistency check
        if (vuln.tenable_severity && vuln.cvss_base_score) {
            const expectedSeverity = this.calculateSeverityFromCVSS(vuln.cvss_base_score);
            if (expectedSeverity !== vuln.tenable_severity) {
                errors.push(`Severity mismatch: CVSS ${vuln.cvss_base_score} suggests ${expectedSeverity}, but Tenable reports ${vuln.tenable_severity}`);
            }
        }
        
        // Date validation
        const firstSeen = new Date(vuln.first_seen);
        const lastSeen = new Date(vuln.last_seen);
        
        if (firstSeen > lastSeen) {
            errors.push('First seen date cannot be after last seen date');
        }
        
        if (lastSeen > new Date()) {
            errors.push('Last seen date cannot be in the future');
        }
        
        // CVE ID format validation
        vuln.cve_ids.forEach((cve, index) => {
            if (!this.isValidCVE(cve)) {
                errors.push(`Invalid CVE format at index ${index}: ${cve}`);
            }
        });
        
        // Port range validation
        if (vuln.port !== undefined && (vuln.port < 0 || vuln.port > 65535)) {
            errors.push(`Invalid port number: ${vuln.port} (must be 0-65535)`);
        }
        
        return {
            valid: errors.length === 0,
            errors,
            confidence: vuln.correlation_confidence
        };
    }
    
    private isValidIPAddress(ip: string): boolean {
        // IPv4 validation
        const ipv4Pattern = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
        
        // IPv6 validation (basic)
        const ipv6Pattern = /^(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$|^::1$|^::$/;
        
        return ipv4Pattern.test(ip) || ipv6Pattern.test(ip);
    }
    
    private isValidMACAddress(mac: string): boolean {
        const macPattern = /^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/;
        return macPattern.test(mac);
    }
    
    private isValidCVE(cve: string): boolean {
        const cvePattern = /^CVE-\d{4}-\d{4,7}$/;
        return cvePattern.test(cve);
    }
    
    private calculateSeverityFromCVSS(score: number): VulnerabilitySeverity {
        if (score >= 9.0) return VulnerabilitySeverity.CRITICAL;
        if (score >= 7.0) return VulnerabilitySeverity.HIGH;
        if (score >= 4.0) return VulnerabilitySeverity.MEDIUM;
        if (score >= 0.1) return VulnerabilitySeverity.LOW;
        return VulnerabilitySeverity.INFO;
    }
}

interface ValidationResult {
    valid: boolean;
    errors: string[];
    confidence: number;
}
```

### Plugin Mapping Validation

```typescript
// Automated plugin mapping validation with confidence scoring
class PluginMappingValidator {
    async validatePluginCVECorrelation(pluginId: PluginId, cveIds: CVEId[]): Promise<ValidationResult> {
        const errors: string[] = [];
        let confidence = 100;
        
        // Check each CVE against multiple sources
        for (const cve of cveIds) {
            const nvdMatch = await this.checkNVDCorrelation(pluginId, cve);
            const tenableMatch = await this.checkTenableAPICorrelation(pluginId, cve);
            
            if (!nvdMatch && !tenableMatch) {
                errors.push(`No correlation found for plugin ${pluginId} -> CVE ${cve}`);
                confidence -= 20;
            } else if (!nvdMatch || !tenableMatch) {
                // Partial correlation - lower confidence but don't fail
                confidence -= 10;
            }
        }
        
        return {
            valid: errors.length === 0,
            errors,
            confidence: Math.max(confidence, 0)
        };
    }
    
    private async checkNVDCorrelation(pluginId: PluginId, cve: CVEId): Promise<boolean> {
        // Implementation would check NVD database
        // This is a placeholder for the actual NVD API integration
        return true;
    }
    
    private async checkTenableAPICorrelation(pluginId: PluginId, cve: CVEId): Promise<boolean> {
        // Implementation would verify against Tenable API
        return true;
    }
}
```

## Performance Constraints

### Background Job Processing Optimization

```sql
-- Optimized job queue processing for <10min target (1000+ vulnerabilities)
WITH RECURSIVE job_processor AS (
    -- Select highest priority job from queue
    SELECT j.*, q.priority
    FROM scan_jobs j
    JOIN job_queue q ON j.id = q.job_id
    WHERE j.status = 'Pending'
    ORDER BY q.priority DESC, j.created_at ASC
    LIMIT 1
),
batch_processing AS (
    -- Process vulnerabilities in batches of 100 for memory efficiency
    SELECT 
        vulnerability_batch.*,
        ROW_NUMBER() OVER (ORDER BY tenable_severity DESC, last_seen DESC) as process_order
    FROM vulnerability_staging vulnerability_batch
    WHERE batch_id = (SELECT id FROM job_processor)
)
INSERT INTO scan_vulnerabilities 
SELECT * FROM batch_processing 
WHERE process_order <= 100;

-- Update job progress atomically
UPDATE scan_jobs 
SET 
    progress_percentage = CAST((processed_records * 100.0 / assets_discovered) AS INTEGER),
    current_operation = 'Processing vulnerability batch ' || CAST(processed_records/100 AS TEXT),
    updated_at = datetime('now')
WHERE id = (SELECT id FROM job_processor);
```

### Database Query Performance Targets

```sql
-- Materialized view for dashboard queries (<500ms target)
CREATE VIEW vulnerability_dashboard_summary AS
SELECT 
    COUNT(*) as total_vulnerabilities,
    COUNT(CASE WHEN tenable_severity = 'Critical' THEN 1 END) as critical_count,
    COUNT(CASE WHEN tenable_severity = 'High' THEN 1 END) as high_count,
    COUNT(CASE WHEN tenable_severity = 'Medium' THEN 1 END) as medium_count,
    COUNT(CASE WHEN tenable_severity = 'Low' THEN 1 END) as low_count,
    COUNT(CASE WHEN hextrackr_status = 'New' THEN 1 END) as new_count,
    COUNT(CASE WHEN hextrackr_status = 'Assigned' THEN 1 END) as assigned_count,
    COUNT(CASE WHEN hextrackr_status = 'In Progress' THEN 1 END) as in_progress_count,
    COUNT(CASE WHEN hextrackr_status = 'Remediated' THEN 1 END) as remediated_count,
    AVG(correlation_confidence) as avg_correlation_confidence,
    COUNT(CASE WHEN manual_review_required = 1 THEN 1 END) as manual_review_count,
    MAX(last_seen) as most_recent_scan
FROM scan_vulnerabilities
WHERE tenable_state = 'Open';

-- Pre-computed aggregation triggers for real-time updates
CREATE TRIGGER update_daily_totals_insert 
AFTER INSERT ON scan_vulnerabilities
BEGIN
    INSERT OR REPLACE INTO vulnerability_daily_totals (
        date, total_vulnerabilities, critical_count, high_count, 
        medium_count, low_count, info_count, new_today, updated_at
    )
    SELECT 
        date('now'),
        (SELECT COUNT(*) FROM scan_vulnerabilities WHERE date(created_at) = date('now')),
        (SELECT COUNT(*) FROM scan_vulnerabilities WHERE tenable_severity = 'Critical' AND date(created_at) = date('now')),
        (SELECT COUNT(*) FROM scan_vulnerabilities WHERE tenable_severity = 'High' AND date(created_at) = date('now')),
        (SELECT COUNT(*) FROM scan_vulnerabilities WHERE tenable_severity = 'Medium' AND date(created_at) = date('now')),
        (SELECT COUNT(*) FROM scan_vulnerabilities WHERE tenable_severity = 'Low' AND date(created_at) = date('now')),
        (SELECT COUNT(*) FROM scan_vulnerabilities WHERE tenable_severity = 'Info' AND date(created_at) = date('now')),
        1, -- new_today increment
        datetime('now');
END;
```

### Memory Management Constraints

```typescript
// Streaming processing for large scan results (memory constraint: <1GB peak)
class StreamingTenableProcessor {
    private readonly BATCH_SIZE = 1000;
    private readonly MAX_MEMORY_MB = 1024;
    
    async processLargeScanResults(scanJob: ScanJob): Promise<void> {
        const memoryMonitor = new MemoryMonitor(this.MAX_MEMORY_MB);
        let processed = 0;
        
        try {
            // Process vulnerabilities in memory-efficient batches
            const vulnerabilityStream = this.createVulnerabilityStream(scanJob);
            const batchProcessor = new BatchProcessor(this.BATCH_SIZE);
            
            for await (const vulnerabilityBatch of batchProcessor.process(vulnerabilityStream)) {
                // Memory check before processing
                await memoryMonitor.checkMemoryUsage();
                
                // Process batch with transaction control
                await this.processBatch(vulnerabilityBatch, scanJob.id);
                
                processed += vulnerabilityBatch.length;
                
                // Update progress
                await this.updateJobProgress(scanJob.id, {
                    progress_percentage: Math.floor((processed / scanJob.vulnerabilities_found) * 100),
                    current_operation: `Processed ${processed}/${scanJob.vulnerabilities_found} vulnerabilities`,
                    records_processed: processed
                });
                
                // Explicit garbage collection hint for large batches
                if (processed % (this.BATCH_SIZE * 10) === 0) {
                    global.gc?.();
                }
            }
            
        } catch (error) {
            await this.handleProcessingError(scanJob.id, error);
            throw error;
        } finally {
            // Cleanup resources
            await memoryMonitor.cleanup();
        }
    }
}

// Memory monitoring utility
class MemoryMonitor {
    constructor(private maxMemoryMB: number) {}
    
    async checkMemoryUsage(): Promise<void> {
        const memoryUsage = process.memoryUsage();
        const heapUsedMB = memoryUsage.heapUsed / 1024 / 1024;
        
        if (heapUsedMB > this.maxMemoryMB) {
            throw new Error(`Memory usage exceeded limit: ${heapUsedMB}MB > ${this.maxMemoryMB}MB`);
        }
        
        // Trigger garbage collection if memory usage is high
        if (heapUsedMB > this.maxMemoryMB * 0.8 && global.gc) {
            global.gc();
        }
    }
    
    async cleanup(): Promise<void> {
        // Force garbage collection on cleanup
        global.gc?.();
    }
}
```

### Rate Limiting & API Optimization

```typescript
// Tenable API rate limiting with exponential backoff
class TenableAPIRateLimiter {
    private readonly REQUESTS_PER_MINUTE = 100;  // Tenable.io limit
    private readonly BURST_LIMIT = 20;           // Short-term burst allowance
    private requestQueue: Array<() => Promise<any>> = [];
    private requestTimes: number[] = [];
    
    async makeRequest<T>(requestFn: () => Promise<T>): Promise<T> {
        await this.waitForRateLimit();
        
        const startTime = Date.now();
        let retryCount = 0;
        const maxRetries = 5;
        
        while (retryCount < maxRetries) {
            try {
                const result = await requestFn();
                this.recordSuccessfulRequest(startTime);
                return result;
                
            } catch (error) {
                if (this.isRateLimitError(error)) {
                    const backoffMs = this.calculateBackoff(retryCount);
                    console.warn(`Rate limited, backing off for ${backoffMs}ms (attempt ${retryCount + 1})`);
                    await this.delay(backoffMs);
                    retryCount++;
                    continue;
                }
                
                throw error; // Non-rate-limit error
            }
        }
        
        throw new Error(`Max retries exceeded for API request after ${maxRetries} attempts`);
    }
    
    private async waitForRateLimit(): Promise<void> {
        const now = Date.now();
        const oneMinuteAgo = now - 60000;
        
        // Clean old request times
        this.requestTimes = this.requestTimes.filter(time => time > oneMinuteAgo);
        
        // Check if we need to wait
        if (this.requestTimes.length >= this.REQUESTS_PER_MINUTE) {
            const oldestRequest = Math.min(...this.requestTimes);
            const waitTime = oldestRequest + 60000 - now;
            
            if (waitTime > 0) {
                console.log(`Rate limit reached, waiting ${waitTime}ms`);
                await this.delay(waitTime);
            }
        }
        
        this.requestTimes.push(now);
    }
    
    private isRateLimitError(error: any): boolean {
        return error.response?.status === 429 || 
               error.message?.includes('rate limit') ||
               error.message?.includes('too many requests');
    }
    
    private calculateBackoff(retryCount: number): number {
        // Exponential backoff: 1s, 2s, 4s, 8s, 16s
        return Math.min(1000 * Math.pow(2, retryCount), 30000);
    }
    
    private delay(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}
```

## Integration Mappings

### Cross-System Data Flow Patterns

```typescript
// Integration adapter for HexTrackr core vulnerability system
interface TenableIntegrationAdapter {
    // Asset correlation with existing HexTrackr assets
    correlateAssets(tenableAssets: TenableAsset[]): Promise<AssetCorrelationResult[]>;
    
    // Vulnerability sync with split ownership model
    syncVulnerabilities(scanResults: ScanVulnerability[]): Promise<VulnerabilitySync[]>;
    
    // Background job integration
    queueScanJob(scanConfig: ScanConfiguration): Promise<ScanJobId>;
    monitorScanProgress(jobId: ScanJobId): AsyncIterator<JobProgress>;
    
    // Plugin mapping synchronization
    updatePluginMappings(): Promise<PluginMappingUpdateResult>;
}

// Asset correlation result with confidence scoring
interface AssetCorrelationResult {
    readonly tenable_uuid: TenableUUID;
    readonly hextrackr_asset_id?: string;
    readonly correlation_method: CorrelationMethod;
    readonly correlation_confidence: number;
    readonly manual_review_required: boolean;
    readonly correlation_data: {
        readonly matched_fields: string[];
        readonly conflicting_fields: string[];
        readonly similarity_scores: Record<string, number>;
    };
}

// Vulnerability synchronization with conflict resolution
interface VulnerabilitySync {
    readonly vulnerability_id: string;
    readonly sync_action: SyncAction;
    readonly conflicts_detected: ConflictType[];
    readonly resolution_strategy: ResolutionStrategy;
    readonly tenable_changes: Partial<TenableVulnerabilityData>;
    readonly hextrackr_preservation: string[]; // Fields to preserve
}

enum SyncAction {
    CREATE_NEW = 'Create New',
    UPDATE_TENABLE_DATA = 'Update Tenable Data',
    PRESERVE_HEXTRACKR_DATA = 'Preserve HexTrackr Data',
    MERGE_WITH_CONFLICTS = 'Merge with Conflicts',
    MANUAL_REVIEW_REQUIRED = 'Manual Review Required'
}

enum ConflictType {
    SEVERITY_MISMATCH = 'Severity Mismatch',
    STATUS_CONFLICT = 'Status Conflict',
    ASSIGNMENT_CONFLICT = 'Assignment Conflict',
    REMEDIATION_CONFLICT = 'Remediation Date Conflict'
}

enum ResolutionStrategy {
    TENABLE_WINS = 'Tenable Wins',
    HEXTRACKR_WINS = 'HexTrackr Wins',
    MERGE_BOTH = 'Merge Both',
    MANUAL_INTERVENTION = 'Manual Intervention'
}
```

### WebSocket Progress Integration

```typescript
// Real-time progress reporting for scan jobs
interface ScanProgressWebSocketHandler {
    subscribeToJob(jobId: ScanJobId, clientId: string): void;
    unsubscribeFromJob(jobId: ScanJobId, clientId: string): void;
    broadcastProgress(jobId: ScanJobId, progress: JobProgressUpdate): void;
}

interface JobProgressUpdate {
    readonly job_id: ScanJobId;
    readonly phase: ScanProcessingPhase;
    readonly progress_percentage: number;
    readonly current_operation: string;
    readonly assets_processed: number;
    readonly vulnerabilities_processed: number;
    readonly estimated_completion: Date;
    readonly performance_metrics: {
        readonly assets_per_second: number;
        readonly vulnerabilities_per_second: number;
        readonly memory_usage_mb: number;
        readonly database_queue_size: number;
    };
    readonly error_summary?: {
        readonly error_count: number;
        readonly recent_errors: string[];
    };
}

enum ScanProcessingPhase {
    INITIALIZING = 'Initializing',
    CONNECTING_TO_TENABLE = 'Connecting to Tenable',
    FETCHING_SCAN_RESULTS = 'Fetching Scan Results',
    CORRELATING_ASSETS = 'Correlating Assets',
    PROCESSING_VULNERABILITIES = 'Processing Vulnerabilities',
    UPDATING_PLUGIN_MAPPINGS = 'Updating Plugin Mappings',
    FINALIZING = 'Finalizing',
    COMPLETED = 'Completed'
}
```

### API Contract Integration

```typescript
// REST API endpoints for Tenable integration management
interface TenableAPIContract {
    // Configuration management
    'POST /api/tenable/configure': {
        request: TenableConfiguration;
        response: ConfigurationResult;
    };
    
    // Scan management
    'POST /api/tenable/scans/start': {
        request: ScanStartRequest;
        response: ScanJobResponse;
    };
    
    'GET /api/tenable/scans/:scanId/status': {
        params: { scanId: ScanJobId };
        response: ScanJobStatus;
    };
    
    'POST /api/tenable/scans/:scanId/cancel': {
        params: { scanId: ScanJobId };
        response: CancellationResult;
    };
    
    // Asset correlation management
    'GET /api/tenable/assets/correlation-review': {
        query: {
            confidence_threshold?: number;
            manual_review_only?: boolean;
            limit?: number;
            offset?: number;
        };
        response: PaginatedAssetCorrelation;
    };
    
    'POST /api/tenable/assets/:assetId/correlate': {
        params: { assetId: TenableUUID };
        request: ManualCorrelationRequest;
        response: CorrelationResult;
    };
    
    // Plugin mapping management
    'GET /api/tenable/plugins/mappings': {
        query: {
            plugin_family?: string;
            cve_id?: CVEId;
            updated_since?: string;
        };
        response: PluginMapping[];
    };
    
    'POST /api/tenable/plugins/sync': {
        request: PluginSyncRequest;
        response: PluginSyncResult;
    };
    
    // Vulnerability management with split ownership
    'GET /api/tenable/vulnerabilities': {
        query: VulnerabilitySearchQuery;
        response: PaginatedVulnerabilities;
    };
    
    'PATCH /api/tenable/vulnerabilities/:vulnId': {
        params: { vulnId: string };
        request: HexTrackrVulnerabilityUpdate;  // Only HexTrackr-managed fields
        response: VulnerabilityUpdateResult;
    };
}

interface VulnerabilitySearchQuery {
    readonly asset_uuid?: TenableUUID;
    readonly plugin_id?: PluginId;
    readonly severity?: VulnerabilitySeverity[];
    readonly status?: HexTrackrVulnerabilityStatus[];
    readonly assigned_to?: string;
    readonly cve_id?: CVEId;
    readonly first_seen_after?: Date;
    readonly last_seen_before?: Date;
    readonly correlation_confidence_min?: number;
    readonly manual_review_required?: boolean;
    readonly limit?: number;
    readonly offset?: number;
    readonly sort_by?: string;
    readonly sort_order?: 'asc' | 'desc';
}

interface HexTrackrVulnerabilityUpdate {
    // Only fields managed by HexTrackr (Tenable data is read-only)
    readonly status?: HexTrackrVulnerabilityStatus;
    readonly assigned_to?: string;
    readonly assigned_team?: string;
    readonly priority?: VulnerabilityPriority;
    readonly due_date?: Date;
    readonly remediation_date?: Date;
    readonly false_positive_reason?: string;
    readonly accepted_risk_reason?: string;
    readonly business_justification?: string;
    readonly remediation_notes?: string;
    readonly custom_tags?: string[];
}
```

---

*This data model supports the secure, high-performance implementation of HexTrackr Specification 013: Tenable API Integration with UUID-first correlation, background job processing, and split ownership data architecture.*
