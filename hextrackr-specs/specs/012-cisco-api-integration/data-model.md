# Cisco API Integration - Data Model

## Entity Definitions

### OAuth 2.0 Credential Management (Constitutional Pattern)

```typescript
// Branded types for security-sensitive data
type ClientId = string & { readonly __brand: unique symbol };
type ClientSecret = string & { readonly __brand: unique symbol };
type AccessToken = string & { readonly __brand: unique symbol };
type EncryptedValue = string & { readonly __brand: unique symbol };

// OAuth 2.0 credential entity with encrypted storage
interface CiscoOAuthCredentials {
    readonly id: string;                         // UUID v4 credential set identifier
    readonly name: string;                       // Human-readable credential name
    readonly client_id: EncryptedValue;          // Encrypted OAuth client ID
    readonly client_secret: EncryptedValue;      // Encrypted OAuth client secret
    readonly scopes: readonly string[];          // Requested OAuth scopes
    readonly environment: CiscoEnvironment;      // Production, staging, sandbox
    readonly auth_endpoint: string;              // OAuth token endpoint URL
    readonly api_base_url: string;              // Base API URL for requests
    readonly token_refresh_threshold_mins: number; // Minutes before expiry to refresh
    readonly created_at: Date;
    readonly updated_at: Date;
    readonly created_by: string;                 // User who created credentials
    readonly is_active: boolean;                 // Enable/disable credential set
}

enum CiscoEnvironment {
    PRODUCTION = 'production',
    STAGING = 'staging',
    SANDBOX = 'sandbox'
}

// Active token state management
interface CiscoOAuthToken {
    readonly id: string;                         // UUID v4 token identifier
    readonly credential_id: string;              // Reference to credential set
    readonly access_token: EncryptedValue;       // Encrypted access token
    readonly refresh_token?: EncryptedValue;     // Encrypted refresh token (optional)
    readonly token_type: string;                 // Usually 'Bearer'
    readonly expires_at: Date;                   // Token expiration timestamp
    readonly scope: string;                      // Granted token scope
    readonly issued_at: Date;                    // Token issuance timestamp
    readonly last_used_at?: Date;               // Most recent API call timestamp
    readonly usage_count: number;                // Number of API calls with this token
    readonly is_revoked: boolean;               // Manual revocation flag
}
```

### VendorConnectorConfig Entity

**Purpose**: Unified configuration for all vendor integrations using polymorphic pattern

```typescript
interface VendorConnectorConfig {
  id: string;
  vendorName: string;             // 'Cisco', 'Tenable', etc. (UNIQUE)
  connectorType: string;          // 'CiscoOAuth2ClientCredentials'
  configData: CiscoConnectorConfig; // Polymorphic configuration
  isActive: boolean;              // Enable/disable connector
  createdAt: Date;
  updatedAt: Date;
}
```

### CiscoConnectorConfig Entity

**Purpose**: OAuth 2.0 configuration for Cisco API access (stored in configData JSONB)

```typescript
interface CiscoConnectorConfig {
  clientId: string;               // Encrypted OAuth client ID
  clientSecret: string;           // Encrypted OAuth client secret
  authEndpoint: string;           // https://api.cisco.com/oauth2/token
  apiBaseUrl: string;            // https://api.talos.cisco.com/v1
  scopes: string[];              // ['talos:read', 'advisories:read']
  tokenRefreshThreshold: number;  // Minutes before expiry to refresh (default: 300)
}
```

### OAuthToken Entity

**Purpose**: OAuth 2.0 access token management with automatic refresh

```typescript
interface OAuthToken {
  id: string;
  connectorConfigId: string;      // FK -> VendorConnectorConfig.id
  accessToken: string;            // Current access token
  tokenType: string;              // 'Bearer'
  expiresIn: number;             // Seconds until expiration from issue
  expiresAt: Date;               // Absolute expiration timestamp
  scopes: string[];              // Granted scopes for token
  issuedAt: Date;                // Token issue timestamp
  createdAt: Date;
  updatedAt: Date;
}
```

### Asset Entity Extensions

**Purpose**: Cisco-specific device correlation fields added to existing assets table

```typescript
interface Asset extends BaseModel {
  // Existing asset fields...
  
  // Cisco correlation extensions
  ciscoSerialNumber?: string;     // Primary correlation identifier
  ciscoProductId?: string;        // Secondary correlation with hostname
  ciscoModelNumber?: string;      // Fallback correlation with IP
  correlationConfidence?: number; // 1-5 confidence scale for matching
}
```

### VulnerabilityEnrichment Entity

**Purpose**: Polymorphic storage for all vendor-specific vulnerability enhancements

```typescript
interface VulnerabilityEnrichment extends BaseModel {
  vulnerabilityId: string;        // FK -> Vulnerability.id (INDEXED)
  source: string;                 // 'cisco-talos' | 'cisco-advisory' | 'tenable-plugin'
  enrichmentType: string;         // 'threat-indicator' | 'remediation' | 'advisory'
  data: TalosThreatIndicatorData | CiscoSecurityAdvisoryData; // Polymorphic payload
  firstSeenAt: Date;             // First enrichment detection
  lastSeenAt: Date;              // Last enrichment update
}
```

### TalosThreatIndicatorData Schema

**Purpose**: Cisco Talos Intelligence data structure (stored in VulnerabilityEnrichment.data)

```typescript
interface TalosThreatIndicatorData {
  talosId: string;               // Unique Talos identifier
  title: string;                 // Threat indicator title
  description: string;           // Detailed threat description
  severity: 'low' | 'medium' | 'high' | 'critical';
  threatScore: number;           // 0-100 threat severity score
  indicatorType: string;         // 'IOC' | 'Signature' | 'Campaign'
  indicatorValue?: string;       // Specific hash, IP, domain
  relatedCves?: string[];        // Associated CVE identifiers
  publishedDate: Date;           // Talos publication date
  updatedDate: Date;             // Last Talos update
  talosUrl: string;              // Link to original Talos report
  affectedProducts?: string[];    // Cisco products identified by Talos
}
```

### CiscoSecurityAdvisoryData Schema

**Purpose**: Cisco Security Advisory data structure (stored in VulnerabilityEnrichment.data)

```typescript
interface CiscoSecurityAdvisoryData {
  advisoryId: string;            // Unique Cisco Advisory ID (e.g., cisco-sa-20230101)
  title: string;                 // Advisory title
  summary: string;               // Advisory summary
  publishedDate: Date;           // Official publication date
  updatedDate: Date;             // Last advisory update
  cveIds: string[];             // Associated CVE identifiers (non-empty)
  cvssV3BaseScore?: number;      // CVSS v3 base score
  cvssV3Vector?: string;         // CVSS v3 vector string
  remediationGuidance: string;   // Detailed remediation steps
  affectedProducts: Array<{      // Product-specific impact information
    productName: string;
    versions?: string[];         // Affected versions
    fixedVersions?: string[];    // Fixed versions
  }>;
  advisoryUrl: string;           // Official advisory URL
}
```

### VendorConnectorAdapter Interface

**Purpose**: Unified interface for all vendor API integrations

```typescript
interface VendorConnectorAdapter {
  authenticate(): Promise<AuthResult>;
  getAssets(): Promise<Asset[]>;
  getVulnerabilities(): Promise<VulnerabilityEnrichment[]>;
  getAdvisories(): Promise<SecurityAdvisory[]>;
  getHealthStatus(): Promise<ConnectorHealth>;
}

interface AuthResult {
  success: boolean;
  message?: string;
  tokenExpiresAt?: Date;
}

interface ConnectorHealth {
  status: 'operational' | 'degraded' | 'failed';
  lastChecked: Date;
  message?: string;
  metricsUrl?: string;
}
```

## Database Schema

### SQLite Configuration (High Performance)

```sql
-- Optimize SQLite for concurrent API operations
PRAGMA journal_mode = WAL;
PRAGMA synchronous = NORMAL;
PRAGMA cache_size = 131072;         -- 512MB cache for large datasets
PRAGMA temp_store = MEMORY;
PRAGMA mmap_size = 2147483648;      -- 2GB memory mapping
PRAGMA foreign_keys = ON;
PRAGMA optimize;
PRAGMA busy_timeout = 30000;        -- 30 second timeout for busy database
```

### OAuth 2.0 Credential Storage

```sql
-- Encrypted credential storage with audit trails
CREATE TABLE cisco_oauth_credentials (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL CHECK(LENGTH(name) BETWEEN 3 AND 100),
    client_id TEXT NOT NULL,              -- Encrypted at application layer
    client_secret TEXT NOT NULL,          -- Encrypted at application layer
    scopes TEXT NOT NULL CHECK(json_valid(scopes)),
    environment TEXT NOT NULL CHECK(environment IN ('production', 'staging', 'sandbox')),
    auth_endpoint TEXT NOT NULL,
    api_base_url TEXT NOT NULL,
    token_refresh_threshold_mins INTEGER NOT NULL DEFAULT 5 CHECK(token_refresh_threshold_mins BETWEEN 1 AND 60),
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
    created_by TEXT NOT NULL,
    is_active INTEGER NOT NULL DEFAULT 1 CHECK(is_active IN (0, 1)),
    UNIQUE(name, environment)
);

-- Active token management with usage tracking
CREATE TABLE cisco_oauth_tokens (
    id TEXT PRIMARY KEY,
    credential_id TEXT NOT NULL,
    access_token TEXT NOT NULL,           -- Encrypted at application layer
    refresh_token TEXT,                   -- Encrypted at application layer (nullable)
    token_type TEXT NOT NULL DEFAULT 'Bearer',
    expires_at TEXT NOT NULL,
    scope TEXT NOT NULL,
    issued_at TEXT NOT NULL,
    last_used_at TEXT,
    usage_count INTEGER NOT NULL DEFAULT 0,
    is_revoked INTEGER NOT NULL DEFAULT 0 CHECK(is_revoked IN (0, 1)),
    FOREIGN KEY(credential_id) REFERENCES cisco_oauth_credentials(id) ON DELETE CASCADE
);

-- Performance indexes for credential management
CREATE INDEX idx_cisco_creds_active ON cisco_oauth_credentials(is_active, environment);
CREATE INDEX idx_cisco_tokens_credential ON cisco_oauth_tokens(credential_id);
CREATE INDEX idx_cisco_tokens_expires ON cisco_oauth_tokens(expires_at, is_revoked);
CREATE INDEX idx_cisco_tokens_usage ON cisco_oauth_tokens(last_used_at, usage_count);
```

### Vulnerability Enrichment Schema (Constitutional Pattern)

```sql
-- Polymorphic vulnerability enrichment storage
CREATE TABLE vulnerability_enrichments (
    id TEXT PRIMARY KEY,
    vulnerability_id TEXT NOT NULL,
    source TEXT NOT NULL CHECK(source IN ('cisco-talos', 'cisco-advisory', 'cisco-threat-grid', 'cisco-amp')),
    enrichment_type TEXT NOT NULL CHECK(
        enrichment_type IN ('threat-indicator', 'exploitation-status', 'remediation-guidance', 'security-advisory', 'ioc-data', 'attack-pattern')
    ),
    data TEXT NOT NULL CHECK(json_valid(data)),
    first_seen_at TEXT NOT NULL DEFAULT (datetime('now')),
    last_seen_at TEXT NOT NULL DEFAULT (datetime('now')),
    confidence_score INTEGER NOT NULL DEFAULT 50 CHECK(confidence_score BETWEEN 0 AND 100),
    is_active INTEGER NOT NULL DEFAULT 1 CHECK(is_active IN (0, 1)),
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY(vulnerability_id) REFERENCES vulnerabilities_current(id) ON DELETE CASCADE
);

-- Performance indexes for enrichment queries
CREATE INDEX idx_vuln_enrich_vuln_id ON vulnerability_enrichments(vulnerability_id, is_active);
CREATE INDEX idx_vuln_enrich_source ON vulnerability_enrichments(source, enrichment_type);
CREATE INDEX idx_vuln_enrich_confidence ON vulnerability_enrichments(confidence_score, last_seen_at);
```

## Data Flow

### OAuth 2.0 Authentication Flow

1. **Token Request**: Use `CiscoConnectorConfig` to request access token from `authEndpoint`
2. **Token Storage**: Store `accessToken`, `expiresAt`, and `scopes` in `OAuthToken` table
3. **Auto Refresh**: Check `expiresAt` against `tokenRefreshThreshold` before API calls
4. **Failure Handling**: Retry with exponential backoff, notify administrators on persistent failures

### Asset Correlation Process

1. **Primary**: Match Cisco devices using `ciscoSerialNumber` (highest confidence: 5)
2. **Secondary**: Match using `ciscoProductId` + `hostname` combination (confidence: 4)
3. **Fallback**: Match using `ciscoModelNumber` + IP address (confidence: 2-3)
4. **Review Flag**: Set `correlationConfidence` < 4 for manual review

### Vulnerability Enrichment Process

1. **Talos Intelligence**: Daily sync creates `VulnerabilityEnrichment` records with `source='cisco-talos'`
2. **Security Advisories**: Weekly sync creates enrichments with `source='cisco-advisory'`
3. **Data Correlation**: Link enrichments to existing vulnerabilities via CVE mapping
4. **Update Logic**: Update `lastSeenAt` for existing enrichments, create new for fresh data

## Validation Rules

### OAuth 2.0 Security Validation (Constitutional Pattern)

```typescript
// Credential validation with security requirements
function validateCiscoCredentials(credentials: CiscoOAuthCredentials): ValidationResult {
    const errors: string[] = [];
    
    // Client ID format validation
    if (!credentials.client_id || credentials.client_id.length < 10) {
        errors.push('Client ID must be at least 10 characters');
    }
    
    // Client secret strength validation
    if (!credentials.client_secret || credentials.client_secret.length < 32) {
        errors.push('Client secret must be at least 32 characters');
    }
    
    // Scope validation
    const validScopes = ['talos:read', 'advisories:read', 'vulnerability:read', 'assets:read'];
    const invalidScopes = credentials.scopes.filter(scope => !validScopes.includes(scope));
    if (invalidScopes.length > 0) {
        errors.push(`Invalid scopes: ${invalidScopes.join(', ')}`);
    }
    
    // Endpoint validation
    if (!credentials.auth_endpoint.startsWith('https://')) {
        errors.push('Authentication endpoint must use HTTPS');
    }
    
    if (!credentials.api_base_url.startsWith('https://')) {
        errors.push('API base URL must use HTTPS');
    }
    
    return {
        valid: errors.length === 0,
        errors
    };
}

// Token expiration validation
function validateTokenExpiry(token: CiscoOAuthToken, thresholdMinutes: number = 5): boolean {
    const now = new Date();
    const expiryWithThreshold = new Date(token.expires_at.getTime() - (thresholdMinutes * 60 * 1000));
    return now < expiryWithThreshold;
}
```

### Configuration Validation

- `VendorConnectorConfig.vendorName` MUST be unique across all vendors
- `CiscoConnectorConfig.clientId` and `clientSecret` MUST be encrypted at rest
- `CiscoConnectorConfig.scopes` array MUST be non-empty
- `CiscoConnectorConfig.tokenRefreshThreshold` MUST be positive integer (recommended: 300)

### Token Validation

- `OAuthToken.accessToken` MUST be non-empty string
- `OAuthToken.expiresAt` MUST be future timestamp when created
- `OAuthToken.scopes` MUST match requested scopes from configuration

### Asset Correlation Validation

- `Asset.correlationConfidence` MUST be integer between 1-5 if present
- `Asset.ciscoSerialNumber` SHOULD be unique when present (primary identifier)
- At least one Cisco correlation field MUST be present for Cisco-correlated assets

### Enrichment Validation

- `VulnerabilityEnrichment.vulnerabilityId` MUST exist as foreign key
- `VulnerabilityEnrichment.source` and `enrichmentType` MUST be from controlled vocabulary
- `TalosThreatIndicatorData.severity` MUST be valid enum value
- `TalosThreatIndicatorData.threatScore` MUST be 0-100 range
- `CiscoSecurityAdvisoryData.cveIds` MUST be non-empty array
- `CiscoSecurityAdvisoryData.affectedProducts` MUST be non-empty array

## Performance Constraints

### API Synchronization Performance (Constitutional Pattern)

```sql
-- Optimized batch processing for Talos intelligence sync
WITH RECURSIVE batch_processor AS (
    -- Process Talos intelligence in 100-record batches
    SELECT 
        rule_id,
        rule_name,
        description,
        category,
        severity,
        indicators,
        ROW_NUMBER() OVER (ORDER BY last_modified DESC) as rn
    FROM temp_talos_import
    WHERE rn <= 100
),
conflict_resolution AS (
    -- Handle conflicts with existing records
    SELECT 
        COALESCE(existing.id, randomblob(16)) as id,
        bp.rule_id,
        bp.rule_name,
        bp.description,
        bp.category,
        bp.severity,
        bp.indicators,
        CASE WHEN existing.id IS NULL THEN 'INSERT' ELSE 'UPDATE' END as operation
    FROM batch_processor bp
    LEFT JOIN cisco_talos_intelligence existing ON existing.rule_id = bp.rule_id
)
INSERT OR REPLACE INTO cisco_talos_intelligence (
    id, rule_id, rule_name, description, category, 
    severity, indicators, first_seen, last_modified, 
    references, updated_at
)
SELECT 
    id, rule_id, rule_name, description, category,
    severity, indicators, 
    COALESCE(first_seen, datetime('now')),
    datetime('now'),
    '[]' as references,
    datetime('now')
FROM conflict_resolution;
```

### Memory Management Constraints

- **OAuth Token Cache**: Maximum 50 active tokens in memory
- **Enrichment Batch Size**: 500 enrichment records per database transaction
- **Asset Correlation Buffer**: 1,000 correlation entries before database flush
- **API Response Caching**: 15-minute TTL for advisory data, 4-hour TTL for Talos data

### Performance Targets

- **Daily Talos Sync**: Complete within 30 minutes for 10,000 new/updated rules
- **Advisory Processing**: Handle 100+ new advisories within 10 minutes
- **Asset Correlation**: Process 1,000 device correlations within 5 minutes
- **Database Queries**: <500ms for enrichment lookups, <2sec for complex advisory searches
- **UI Response Time**: <2sec for vulnerability details with Cisco enrichments
- **Concurrent Users**: Support 50+ concurrent users during API sync operations

### Database Indexing Strategy

```sql
-- Vendor configuration lookups
CREATE INDEX idx_vendor_config_vendor_name ON vendor_connector_configurations(vendor_name);

-- OAuth token management
CREATE INDEX idx_oauth_tokens_connector_id ON oauth_tokens(connector_config_id);
CREATE INDEX idx_oauth_tokens_expires_at ON oauth_tokens(expires_at);

-- Asset correlation optimization
CREATE INDEX idx_assets_cisco_serial ON assets(cisco_serial_number);
CREATE INDEX idx_assets_cisco_product_id ON assets(cisco_product_id);
CREATE INDEX idx_assets_cisco_model ON assets(cisco_model_number);

-- Enrichment query performance
CREATE INDEX idx_vuln_enrich_vuln_id ON vulnerability_enrichments(vulnerability_id);
CREATE INDEX idx_vuln_enrich_source ON vulnerability_enrichments(source);
CREATE INDEX idx_vuln_enrich_type ON vulnerability_enrichments(enrichment_type);
```

### Data Optimization

- **JSONB Indexing**: Use GIN indexes on `data` JSONB column for frequent queries
- **Partition Strategy**: Partition `vulnerability_enrichments` by `created_at` for historical data
- **Token Cleanup**: Implement automatic cleanup of expired OAuth tokens
- **Data Retention**: Archive Talos intelligence older than 1 year to separate storage

### Memory Management

- **Batch Processing**: Process Talos data in batches of 1000 records to control memory usage
- **Connection Pooling**: Use connection pooling for OAuth token refresh operations
- **Cache Strategy**: Cache frequently accessed advisory data to reduce API calls

## Integration Mappings

### API Contract Integration (Constitutional Pattern)

```typescript
// REST API endpoints for Cisco integration management
interface CiscoIntegrationAPI {
    // Credential management
    '/api/cisco/credentials': {
        POST: (request: CreateCredentialsRequest) => Promise<CiscoOAuthCredentials>;
        GET: () => Promise<CiscoOAuthCredentials[]>;
        PUT: (id: string, request: UpdateCredentialsRequest) => Promise<CiscoOAuthCredentials>;
        DELETE: (id: string) => Promise<void>;
    };
    
    // Token management
    '/api/cisco/tokens/refresh': {
        POST: (credentialId: string) => Promise<CiscoOAuthToken>;
    };
    
    // Sync operations
    '/api/cisco/sync/talos': {
        POST: (options: TalosSyncOptions) => Promise<SyncOperationResponse>;
        GET: (operationId: string) => Promise<SyncOperationStatus>;
    };
    
    '/api/cisco/sync/advisories': {
        POST: (options: AdvisorySyncOptions) => Promise<SyncOperationResponse>;
        GET: (operationId: string) => Promise<SyncOperationStatus>;
    };
    
    // Asset correlation
    '/api/cisco/assets/correlate': {
        POST: (request: AssetCorrelationRequest) => Promise<AssetCorrelationResponse>;
        GET: (assetId: string) => Promise<CiscoAssetExtension>;
    };
    
    // Health monitoring
    '/api/cisco/health': {
        GET: () => Promise<ConnectorHealth>;
    };
}

// WebSocket integration for real-time sync progress
interface CiscoSyncProgress {
    operation_id: string;
    operation_type: 'talos-intelligence' | 'security-advisories' | 'asset-discovery';
    progress_percentage: number;
    records_processed: number;
    total_records: number;
    current_phase: string;
    estimated_completion?: string;
    error_count: number;
}
```

### Cross-System Data Flow (Constitutional Pattern)

```typescript
// HexTrackr core system integration patterns
interface HexTrackrCiscoIntegration {
    // Vulnerability system integration
    vulnerabilityService: {
        enrichVulnerability: (vulnerabilityId: string, enrichments: VulnerabilityEnrichment[]) => Promise<void>;
        getVulnerabilityEnrichments: (vulnerabilityId: string) => Promise<VulnerabilityEnrichment[]>;
        correlateWithCiscoAdvisory: (cveId: string, advisoryId: string) => Promise<void>;
    };
    
    // Asset system integration
    assetService: {
        updateAssetWithCiscoData: (assetId: string, ciscoData: CiscoAssetExtension) => Promise<void>;
        correlateAssetByCisco: (identifiers: CiscoAssetIdentifier) => Promise<AssetCorrelation[]>;
        flagAssetForManualReview: (assetId: string, reason: string) => Promise<void>;
    };
    
    // Notification system integration
    notificationService: {
        notifyCriticalAdvisory: (advisory: CiscoSecurityAdvisory, affectedAssets: string[]) => Promise<void>;
        notifyCorrelationFailure: (identifiers: CiscoAssetIdentifier, reason: string) => Promise<void>;
        notifySyncCompletion: (operation: SyncOperationResult) => Promise<void>;
    };
}
```

## Integration Points

### External Dependencies

- **Cisco OAuth 2.0 Provider**: Token authentication and management
- **Cisco Talos Intelligence API**: Daily threat intelligence synchronization
- **Cisco Security Advisory API**: Weekly security advisory updates
- **Certificate Authority**: SSL/TLS validation for secure API communication

### Internal HexTrackr Integration

- **Secrets Management**: Encrypted storage of OAuth client credentials
- **Job Scheduler**: Background processing for daily/weekly synchronization tasks
- **Vulnerability Database**: Core vulnerability records for enrichment correlation
- **Asset Management**: Device inventory for Cisco product correlation
- **User Interface**: Dashboard integration for displaying enhanced threat intelligence
- **Notification System**: Alerts for authentication failures and critical advisories

### Data Security

- **Encryption**: All OAuth credentials encrypted using AES-256 in secrets management
- **API Communication**: All external API calls over HTTPS with certificate validation
- **Access Control**: Role-based access to vendor configuration management
- **Audit Logging**: All configuration changes and API interactions logged for compliance
