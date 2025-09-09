# Quickstart: Tenable API Integration

**Purpose**: Validate UUID correlation testing, background job validation, and scan result processing verification

## Quick Validation Steps

### 1. API Authentication and Configuration Testing (15 minutes)

**Test Scenario**: Verify Tenable.io API key authentication and secure credential storage  
**Setup**:

- Configure Tenable API credentials (Access Key + Secret Key) in secrets management
- Test API connectivity and authentication validation
- Verify rate limiting configuration for Tenable constraints
- Check encrypted credential storage implementation

**Success Criteria**:
✅ Tenable.io API credentials stored encrypted in secrets management system  
✅ API authentication succeeds with proper X-ApiKeys header format  
✅ Rate limiting configured for 100 requests/minute compliance  
✅ Connection health checks report operational status  
✅ Network access restricted to Tenable.io endpoints only

**Manual Testing Steps**:

```javascript
// Browser Console Tests - Tenable API Authentication
console.log('Testing Tenable API authentication...');

// Check credential configuration
const config = await fetch('/api/tenable/config').then(r => r.json());
console.log('Tenable configuration active:', config.isConfigured);

// Test API connectivity
const healthCheck = await fetch('/api/tenable/health');
const health = await healthCheck.json();
console.log('Tenable API health:', health.status);
console.log('Last successful scan sync:', health.lastScanSync);

// Verify rate limiting setup
console.log('Rate limiting configured:', health.rateLimitConfig);
console.log('Current API usage:', health.currentUsage);
```

### 2. UUID Correlation Testing (20 minutes)

**Test Scenario**: Verify UUID-first correlation system with strict hostname fallback controls  
**Setup**:

- Import test Tenable assets with various identifier scenarios
- Test primary UUID correlation for reliable asset matching
- Validate hostname fallback with manual review flagging
- Check correlation confidence scoring and audit logging

**Success Criteria**:
✅ UUID-first correlation provides most reliable asset matching  
✅ Hostname fallback requires manual review confirmation  
✅ No automatic asset merging without UUID correlation  
✅ Correlation confidence scores assigned correctly  
✅ All correlation decisions logged for audit trail

**UUID Correlation Tests**:

```javascript
// Test UUID-first correlation scenarios
const testScenarios = [
  {
    scenario: 'UUID Exact Match',
    asset: {
      tenable_uuid: '12345678-1234-5678-9012-123456789abc',
      hostname: 'server-001.example.com',
      ip_addresses: ['192.168.1.100']
    },
    expected_confidence: 100,
    expected_method: 'UUID Exact Match'
  },
  {
    scenario: 'Hostname Fallback',
    asset: {
      hostname: 'server-002.example.com',
      ip_addresses: ['192.168.1.101']
      // Note: no tenable_uuid - should trigger fallback
    },
    expected_confidence: 75,
    expected_method: 'Hostname Fallback',
    expected_manual_review: true
  },
  {
    scenario: 'No Correlation Possible',
    asset: {
      ip_addresses: ['10.0.1.50'],
      hostname: 'unknown-system'
    },
    expected_confidence: 0,
    expected_method: null,
    expected_manual_review: true
  }
];

// Execute correlation tests
for (const test of testScenarios) {
  console.log(`Testing ${test.scenario}...`);
  
  const correlationResult = await fetch('/api/tenable/assets/correlate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(test.asset)
  }).then(r => r.json());
  
  console.log(`  Method: ${correlationResult.correlation_method}`);
  console.log(`  Confidence: ${correlationResult.correlation_confidence}`);
  console.log(`  Manual review: ${correlationResult.manual_review_required}`);
}
```

### 3. Background Job Validation (25 minutes)

**Test Scenario**: Verify robust background job processing for scan imports  
**Setup**:

- Configure background job processing with scan polling every 30 minutes
- Trigger scan job with completion monitoring
- Test job failure handling and retry logic
- Validate idempotent processing to prevent duplicate imports

**Success Criteria**:
✅ Background jobs process scan imports without blocking main application  
✅ Job polling detects completed scans within 30-minute window  
✅ Failed jobs retry with exponential backoff mechanism  
✅ Idempotent processing prevents duplicate vulnerability imports  
✅ Real-time job progress tracked via WebSocket updates

**Background Job Tests**:

```javascript
// Test background job processing system
console.log('Testing Tenable background job system...');

// Start a scan import job
const scanJob = await fetch('/api/tenable/scans/start', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    scanType: 'vulnerability_scan',
    targetAssets: ['12345678-1234-5678-9012-123456789abc'],
    priority: 'high'
  })
}).then(r => r.json());

console.log('Scan job started:', scanJob.jobId);

// Monitor job progress via WebSocket
const jobWs = new WebSocket(`ws://localhost:8989/api/tenable/jobs/${scanJob.jobId}/progress`);
jobWs.onmessage = (event) => {
  const progress = JSON.parse(event.data);
  console.log(`Job ${progress.job_id}:`);
  console.log(`  Phase: ${progress.phase}`);
  console.log(`  Progress: ${progress.progress_percentage}%`);
  console.log(`  Assets processed: ${progress.assets_processed}`);
  console.log(`  Vulnerabilities processed: ${progress.vulnerabilities_processed}`);
  
  if (progress.progress_percentage === 100) {
    console.log('Background job completed successfully');
    jobWs.close();
  }
};

// Check job queue status
setTimeout(async () => {
  const queueStatus = await fetch('/api/tenable/jobs/queue').then(r => r.json());
  console.log('Job queue status:', queueStatus);
}, 5000);
```

### 4. Scan Result Processing Verification (20 minutes)

**Test Scenario**: Validate comprehensive scan result import and data integrity  
**Setup**:

- Execute scan result processing for completed Tenable scans
- Test plugin ID to CVE correlation mapping
- Verify split ownership model preserves user management data
- Check scan metadata preservation and audit logging

**Success Criteria**:
✅ Scan results processed within 10-minute target for 1000+ vulnerabilities  
✅ Plugin ID mapping correctly correlates to CVE identifiers  
✅ Split ownership preserves HexTrackr management data during sync  
✅ Scan metadata (scan_id, scan_date, scanner_info) preserved  
✅ Asset-vulnerability relationships established with integrity constraints

**Scan Processing Tests**:

```javascript
// Test scan result processing and data ownership split
console.log('Testing scan result processing...');

// Simulate completed scan data
const mockScanResults = {
  scanId: 'scan_12345',
  scanName: 'Weekly Infrastructure Scan',
  completedAt: new Date().toISOString(),
  assetsScanned: 50,
  vulnerabilitiesFound: 247,
  pluginResults: [
    {
      pluginId: '19506',
      pluginName: 'Nessus Scan Information',
      severity: 'Info',
      assetUuid: '12345678-1234-5678-9012-123456789abc'
    },
    {
      pluginId: '58651', 
      pluginName: 'CVE-2023-1234 Detection',
      severity: 'High',
      cveIds: ['CVE-2023-1234'],
      assetUuid: '12345678-1234-5678-9012-123456789abc'
    }
  ]
};

// Process scan results
const processResponse = await fetch('/api/tenable/scans/process', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(mockScanResults)
});

const processingResult = await processResponse.json();
console.log('Scan processing result:', processingResult);

// Verify data split ownership
const vulnId = processingResult.vulnerabilities[0]?.id;
if (vulnId) {
  // Modify HexTrackr-managed fields
  await fetch(`/api/vulnerabilities/${vulnId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      hextrackr_status: 'Assigned',
      assigned_to: 'analyst_001',
      remediation_notes: 'Scheduled for next maintenance window'
    })
  });
  
  // Simulate subsequent sync
  await fetch('/api/tenable/scans/process', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(mockScanResults)
  });
  
  // Verify HexTrackr data preserved
  const updatedVuln = await fetch(`/api/vulnerabilities/${vulnId}`).then(r => r.json());
  console.log('Data ownership split verification:');
  console.log('  HexTrackr status preserved:', updatedVuln.hextrackr_status === 'Assigned');
  console.log('  Assignment preserved:', updatedVuln.assigned_to === 'analyst_001');
  console.log('  Notes preserved:', updatedVuln.remediation_notes.includes('maintenance'));
}
```

## Automated Test Validation

### Unit Test Coverage

**Required Tests**:

- Tenable.io API authentication and credential management
- UUID-first correlation with hostname fallback logic
- Background job processing and retry mechanisms
- Plugin ID to CVE mapping transformations
- Split ownership model for data synchronization

**Execution**: `npm test -- --grep="tenable-integration"`

### Integration Test Coverage

**Required Tests**:

- End-to-end scan import workflow with real Tenable.io API
- Background job queue processing with Bull/Redis integration
- Database transaction handling for bulk vulnerability imports
- WebSocket real-time progress updates for job monitoring
- Rate limiting compliance with Tenable.io constraints

**Execution**: `npm run test:integration -- tenable-api-integration`

### Performance Test Coverage

**Test Scenarios**: Validate Tenable integration meets performance targets
**Success Criteria**:
✅ Background job processes 1000+ vulnerabilities within 10-minute target  
✅ UUID correlation handles 500+ asset records in <5 minutes  
✅ API requests respect 100 requests/minute rate limit  
✅ Database queries maintain <500ms response time during bulk imports  
✅ Memory usage remains stable with no leak detection

**Execution**: `npm run test:performance -- tenable-scan-processing`

## Common Issues and Solutions

### Tenable.io Authentication Failures

**Symptoms**: API connection failures with 401/403 errors during scan imports
**Diagnosis**: Check API key configuration and Tenable.io account permissions
**Solution**:

- Verify Access Key and Secret Key are correctly configured in secrets management
- Ensure Tenable.io API user has proper scan read permissions
- Check API key expiration and regenerate if necessary
- Validate X-ApiKeys header format: `accessKey={access_key}; secretKey={secret_key}`
- Test network connectivity to <https://cloud.tenable.com> endpoints

### UUID Correlation Issues

**Symptoms**: Asset duplication or incorrect correlation confidence scores
**Diagnosis**: Review correlation logic and UUID data quality from Tenable
**Solution**:

- Ensure Tenable.io exports include valid UUID fields for assets
- Check for UUID format consistency (RFC 4122 standard)
- Review hostname fallback scenarios requiring manual confirmation
- Validate correlation confidence thresholds (UUID=100, hostname=75)
- Enable detailed correlation logging for audit trail analysis

### Background Job Processing Failures

**Symptoms**: Scan imports hanging or failing with timeout errors
**Diagnosis**: Monitor Redis queue status and job worker performance
**Solution**:

- Check Redis connectivity and queue worker health status
- Verify job retry configuration with exponential backoff
- Monitor memory usage during large scan processing (target: <1GB)
- Implement job timeout handling for stalled operations
- Add idempotency checks to prevent duplicate processing

### API Rate Limiting Issues

**Symptoms**: Frequent 429 errors and throttled scan import operations
**Diagnosis**: Monitor API request patterns and rate limit compliance
**Solution**:

- Configure strict rate limiting to 100 requests/minute maximum
- Implement exponential backoff for rate-limited requests
- Add request queuing to batch API calls efficiently
- Monitor usage metrics to optimize polling intervals
- Consider increasing scan polling from 30 to 60 minutes if needed

### Split Ownership Data Conflicts

**Symptoms**: User-managed data overwritten during scan synchronization
**Diagnosis**: Check split ownership model implementation and field isolation
**Solution**:

- Verify Tenable-owned fields (severity, description, scan metadata) update correctly
- Ensure HexTrackr-owned fields (status, assignment, notes) preserved during sync
- Add validation rules to prevent accidental data overwriting
- Implement field-level locking during concurrent update operations
- Check audit logging for data modification tracking

## Complete Workflow Test

### End-to-End Tenable Integration Validation (80 minutes)

**Step 1: Authentication and Configuration Setup** (15 minutes)

- Configure Tenable.io API credentials in HexTrackr secrets management
- Test API connectivity and validate rate limiting configuration
- Verify background job queue operational with Redis connectivity
- Check WebSocket progress tracking infrastructure availability

**Step 2: UUID Correlation System Validation** (20 minutes)

- Import test asset data with various UUID and hostname scenarios
- Validate UUID-first correlation provides highest confidence matching
- Test hostname fallback with manual review requirement enforcement
- Verify correlation audit logging and confidence score accuracy

**Step 3: Background Job Processing Execution** (25 minutes)

- Trigger comprehensive scan import job with 100+ vulnerabilities
- Monitor background job progress via WebSocket real-time updates
- Validate job retry mechanism with simulated temporary API failures
- Check idempotent processing prevents duplicate vulnerability imports

**Step 4: Scan Result Processing Verification** (15 minutes)

- Process scan results with plugin ID to CVE correlation mapping
- Test split ownership model preserves HexTrackr user-managed data
- Verify scan metadata preservation (scan_id, completion_date, scanner_info)
- Validate asset-vulnerability relationship integrity constraints

**Step 5: Performance and Integration Assessment** (5 minutes)

- Monitor database query performance during bulk operations
- Check memory usage stability throughout import processing
- Verify UI responsiveness with real-time job progress display
- Validate notification system integration for critical issues

**Success Criteria**:
✅ Complete Tenable integration functional with secure API authentication  
✅ UUID correlation provides reliable asset identification with fallback controls  
✅ Background job processing handles large scan datasets efficiently  
✅ Split ownership model maintains data integrity during synchronization  
✅ Performance targets met with stable resource utilization  
✅ Real-time progress tracking provides operational visibility  
✅ Comprehensive audit logging maintains compliance requirements

### Integration Quality Assessment

**Data Integrity**: Split ownership model preserves user workflow data  
**Performance Standards**: Background processing meets 10-minute targets  
**Reliability**: Job retry mechanisms ensure eventual consistency  
**Security Compliance**: API credentials encrypted with audit logging  
**Operational Excellence**: Real-time monitoring with automated alerting

### Operational Readiness Validation

**Monitoring Infrastructure**: Background job health and API connectivity status  
**Alerting Configuration**: Automated notifications for authentication and processing failures  
**Error Recovery**: Comprehensive retry logic with exponential backoff strategies  
**Documentation Completeness**: Operational procedures for support team training  
**Audit Compliance**: Complete logging for forensic analysis and compliance reporting
