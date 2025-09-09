# Quickstart: Cisco API Integration

**Purpose**: Validate OAuth 2.0 authentication, threat intelligence enrichment, and asset correlation functionality

## Quick Validation Steps

### 1. OAuth 2.0 Authentication Testing (20 minutes)

**Test Scenario**: Verify secure client credentials flow with automatic token refresh functionality  
**Setup**:

- Configure OAuth client credentials in secrets management system
- Test token acquisition from Cisco OAuth endpoint
- Validate token refresh before expiration threshold
- Verify encrypted credential storage

**Success Criteria**:
✅ OAuth client credentials stored encrypted in secrets management system  
✅ Initial token request succeeds with valid client ID/secret  
✅ Token refresh occurs automatically 5 minutes before expiration  
✅ API requests include valid Bearer token in Authorization header  
✅ Failed authentication handled gracefully with retry logic

**Manual Testing Steps**:

```javascript
// Browser Console Tests - OAuth Flow Validation
console.log('Testing OAuth 2.0 credential configuration...');

// Check credential storage (should show encrypted values)
const credentials = await fetch('/api/cisco/credentials')
  .then(r => r.json());
console.log('Credentials configured:', credentials.length > 0);

// Test token acquisition
const tokenResponse = await fetch('/api/cisco/tokens/refresh', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ credentialId: credentials[0].id })
});
console.log('Token acquisition:', tokenResponse.ok ? 'Success' : 'Failed');

// Verify token in subsequent API calls
const healthCheck = await fetch('/api/cisco/health');
console.log('Authenticated API access:', healthCheck.ok ? 'Success' : 'Failed');
```

### 2. Threat Intelligence Validation (25 minutes)

**Test Scenario**: Verify Cisco Talos intelligence synchronization and vulnerability enrichment  
**Setup**:

- Trigger Talos intelligence sync operation
- Monitor background job progress via WebSocket
- Validate threat indicator data processing
- Check CVE correlation accuracy

**Success Criteria**:
✅ Daily Talos sync completes within 30-minute target timeframe  
✅ Threat indicators stored with proper confidence scoring  
✅ CVE mappings correlate correctly with existing vulnerability records  
✅ Threat intelligence displayed in vulnerability details modal  
✅ Real-time sync progress updated via WebSocket connection

**Threat Intelligence Tests**:

```javascript
// Test Talos intelligence synchronization
const syncResponse = await fetch('/api/cisco/sync/talos', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ 
    syncType: 'daily',
    forceRefresh: true 
  })
});

const syncOperation = await syncResponse.json();
console.log('Talos sync started:', syncOperation.operationId);

// Monitor sync progress
const ws = new WebSocket(`ws://localhost:8989/api/cisco/sync/progress/${syncOperation.operationId}`);
ws.onmessage = (event) => {
  const progress = JSON.parse(event.data);
  console.log(`Sync progress: ${progress.progress_percentage}% - ${progress.current_operation}`);
  
  if (progress.progress_percentage === 100) {
    console.log('Talos sync completed successfully');
    ws.close();
  }
};

// Verify enrichment data integration
setTimeout(async () => {
  const enrichedVulns = await fetch('/api/vulnerabilities?enriched=cisco-talos')
    .then(r => r.json());
  console.log(`Found ${enrichedVulns.length} vulnerabilities with Talos enrichment`);
}, 30000);
```

### 3. Asset Correlation Verification (20 minutes)

**Test Scenario**: Test multi-tier Cisco device correlation using serial numbers, product IDs, and model numbers  
**Setup**:

- Import test Cisco device inventory with various identifier combinations
- Test correlation hierarchy (serial number → product ID → model fallback)
- Validate correlation confidence scoring
- Check manual review flagging for uncertain matches

**Success Criteria**:
✅ Serial number correlation achieves highest confidence (score: 5)  
✅ Product ID + hostname correlation provides reliable matching (score: 4)  
✅ Model + IP fallback correlation flags for manual review (score: 2-3)  
✅ Asset correlation results logged for audit trail  
✅ Uncertain correlations marked for manual verification

**Asset Correlation Tests**:

```javascript
// Test asset correlation with different identifier types
const testAssets = [
  {
    hostname: 'cisco-sw-001.example.com',
    ip_address: '192.168.1.10',
    cisco_serial_number: 'FCW1234ABCD',
    cisco_product_id: 'WS-C2960-24TT-L'
  },
  {
    hostname: 'cisco-rt-002.example.com', 
    ip_address: '10.0.1.1',
    cisco_product_id: 'ISR4331/K9'  // No serial number - secondary correlation
  },
  {
    hostname: 'unknown-cisco.example.com',
    ip_address: '172.16.1.5',
    cisco_model_number: 'Catalyst 2960'  // Fallback correlation only
  }
];

// Test correlation API
for (const asset of testAssets) {
  const correlationResult = await fetch('/api/cisco/assets/correlate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(asset)
  }).then(r => r.json());
  
  console.log(`Asset ${asset.hostname}:`);
  console.log(`  Correlation method: ${correlationResult.correlation_method}`);
  console.log(`  Confidence score: ${correlationResult.correlation_confidence}`);
  console.log(`  Manual review required: ${correlationResult.manual_review_required}`);
}
```

### 4. Security Advisory Integration (15 minutes)

**Test Scenario**: Validate Cisco Security Advisory processing and remediation guidance integration  
**Setup**:

- Trigger security advisory sync operation
- Test advisory-to-CVE correlation
- Verify remediation guidance extraction
- Check affected products mapping

**Success Criteria**:
✅ Weekly advisory sync processes 100+ advisories within 10-minute target  
✅ CVE correlations link advisories to existing vulnerability records  
✅ Remediation guidance extracted and formatted correctly  
✅ Affected product information mapped to asset inventory  
✅ Critical advisories trigger notification alerts

**Security Advisory Tests**:

```javascript
// Test security advisory synchronization
const advisorySync = await fetch('/api/cisco/sync/advisories', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ 
    syncPeriod: 'weekly',
    includeUpdates: true 
  })
}).then(r => r.json());

console.log('Advisory sync operation:', advisorySync.operationId);

// Check advisory processing results
setTimeout(async () => {
  const advisoryStatus = await fetch(`/api/cisco/sync/advisories/${advisorySync.operationId}`)
    .then(r => r.json());
    
  console.log('Advisory sync results:');
  console.log(`  Advisories processed: ${advisoryStatus.advisories_processed}`);
  console.log(`  CVE correlations created: ${advisoryStatus.cve_correlations}`);
  console.log(`  Critical advisories: ${advisoryStatus.critical_count}`);
}, 15000);
```

### 5. Performance and Integration Testing (10 minutes)

**Test Scenario**: Validate performance targets and HexTrackr integration  
**Setup**:

- Monitor API response times and resource usage
- Test vulnerability enrichment display in UI
- Verify notification system integration
- Check audit logging functionality

**Success Criteria**:
✅ Cisco enriched vulnerability details load within 2-second target  
✅ Daily sync operations complete without memory leaks or errors  
✅ HexTrackr notifications triggered for critical advisories  
✅ API rate limiting respects Cisco constraints (no 429 errors)  
✅ All integration operations logged for audit compliance

**Performance Testing Steps**:

```javascript
// Performance validation tests
const performanceTest = async () => {
  const startTime = Date.now();
  
  // Test enriched vulnerability loading
  const vulnDetails = await fetch('/api/vulnerabilities/CVE-2023-1234?enriched=true')
    .then(r => r.json());
  
  const loadTime = Date.now() - startTime;
  console.log(`Enriched vulnerability load time: ${loadTime}ms (target: <2000ms)`);
  
  // Check for Cisco enrichment data
  const ciscoEnrichments = vulnDetails.enrichments?.filter(e => e.source.startsWith('cisco-'));
  console.log(`Cisco enrichments found: ${ciscoEnrichments?.length || 0}`);
  
  // Test notification integration
  if (ciscoEnrichments?.some(e => e.data.severity === 'Critical')) {
    console.log('Critical advisory notifications should be triggered');
  }
};

await performanceTest();
```

## Automated Test Validation

### Unit Test Coverage

**Required Tests**:

- OAuth 2.0 Client Credentials flow with token refresh
- `VendorConnectorAdapter` interface methods for Cisco implementation
- Asset correlation logic (serial → product ID → model hierarchy)
- Polymorphic data storage and retrieval for enrichments

**Execution**: `npm test -- --grep="cisco-integration"`

### Integration Test Coverage

**Required Tests**:

- End-to-end OAuth authentication with real Cisco endpoints
- Talos Intelligence API data retrieval and parsing
- Security Advisory API synchronization
- Database schema validation for enrichment storage

**Execution**: `npm run test:integration -- cisco`

### Performance Test Coverage

**Test Scenario**: Process 1000+ Talos indicators and 100+ security advisories
**Success Criteria**:
✅ Daily Talos sync completes within 30 minutes  
✅ Advisory processing completes without timeouts  
✅ Database queries remain responsive during sync (<500ms)  
✅ UI displays enriched data within 2 seconds  
✅ Memory usage stable during large dataset processing

## Common Issues and Solutions

### OAuth Authentication Failures

**Symptoms**: Token requests returning 401 Unauthorized or token refresh failures
**Diagnosis**: Check client credential configuration and network connectivity
**Solution**:

- Verify client ID and secret are correctly encrypted in secrets management
- Check OAuth endpoint URLs match Cisco documentation
- Ensure proper scope configuration: `['talos:read', 'advisories:read']`
- Test network connectivity to `https://api.cisco.com/oauth2/token`
- Review token refresh threshold timing (recommended: 300 seconds)

### Threat Intelligence Sync Issues

**Symptoms**: Talos sync operations timing out or incomplete data processing
**Diagnosis**: Monitor background job progress and check API rate limiting
**Solution**:

- Implement exponential backoff for rate-limited requests (429 responses)
- Increase processing timeout for large dataset operations
- Check Talos API endpoint availability and service status
- Optimize batch processing size (recommended: 1,000 indicators per batch)
- Monitor memory usage during large sync operations

### Asset Correlation Problems

**Symptoms**: Low correlation confidence scores or incorrect device matching
**Diagnosis**: Review correlation logic and identifier quality
**Solution**:

- Improve asset data quality with complete Cisco identifiers
- Adjust correlation confidence thresholds for business requirements
- Implement manual review workflow for uncertain matches (confidence < 4)
- Add device discovery integration to populate missing identifiers
- Create correlation validation rules for critical infrastructure

### Security Advisory Integration Failures

**Symptoms**: Advisory sync errors or missing CVE correlations
**Diagnosis**: Check advisory parsing logic and CVE database updates
**Solution**:

- Validate advisory XML/JSON parsing against Cisco schema updates
- Update CVE correlation mappings from NIST NVD database
- Handle advisory format changes with backward compatibility
- Implement fallback mechanisms for parsing failures
- Add validation for incomplete advisory data

### Performance Degradation

**Symptoms**: Slow vulnerability enrichment display or sync timeouts
**Diagnosis**: Monitor database query performance and API response times
**Solution**:

- Optimize database indexes for enrichment queries
- Implement caching for frequently accessed threat intelligence data
- Add connection pooling for high-volume API operations
- Monitor and tune SQLite WAL mode configuration
- Implement background cleanup for expired enrichment data

## Complete Workflow Test

### End-to-End Cisco Integration Validation (75 minutes)

**Step 1: OAuth Configuration and Testing** (15 minutes)

- Configure OAuth client credentials in HexTrackr secrets management
- Test initial token acquisition and validate encrypted storage
- Verify automatic token refresh functionality
- Test authentication error handling and retry logic

**Step 2: Threat Intelligence Synchronization** (25 minutes)

- Trigger comprehensive Talos intelligence sync operation
- Monitor real-time progress via WebSocket connection
- Validate threat indicator processing and confidence scoring
- Verify CVE correlation accuracy with existing vulnerability database
- Check database performance during large dataset processing

**Step 3: Asset Correlation Validation** (15 minutes)

- Import test Cisco device inventory with various identifier combinations
- Test multi-tier correlation hierarchy (serial → product → model)
- Validate correlation confidence scoring and manual review flagging
- Verify audit trail logging for all correlation operations

**Step 4: Security Advisory Integration** (10 minutes)

- Execute security advisory sync with real-time monitoring
- Test advisory parsing and CVE mapping functionality
- Verify remediation guidance extraction and formatting
- Check critical advisory notification triggers

**Step 5: UI Integration and Performance** (10 minutes)

- Test Cisco enrichment display in vulnerability details modal
- Validate performance targets for enriched data loading
- Verify notification integration for critical advisories
- Check overall system stability during concurrent operations

**Success Criteria**:
✅ Complete Cisco API integration functional with OAuth 2.0 security  
✅ Threat intelligence enrichment enhances vulnerability analysis capabilities  
✅ Asset correlation provides reliable Cisco device identification  
✅ Security advisory integration delivers timely remediation guidance  
✅ Performance targets met with stable resource utilization  
✅ HexTrackr UI seamlessly displays Cisco enrichment data  
✅ Audit trails maintain compliance with security requirements

### Integration Quality Assessment

**Security Compliance**: OAuth 2.0 implementation follows industry best practices  
**Data Accuracy**: Multi-tier correlation provides reliable asset identification  
**Performance Standards**: All operations complete within specified timeframes  
**Reliability**: Error handling and retry logic ensure stable operations  
**Maintainability**: Modular design supports future Cisco API updates

### Operational Readiness Validation

**Monitoring**: Real-time progress tracking for all background operations  
**Alerting**: Automated notifications for authentication failures and critical advisories  
**Backup Recovery**: Encrypted credential backup and disaster recovery procedures  
**Documentation**: Complete operational procedures for support team training  
**Security Audit**: Comprehensive logging for compliance and forensic analysis
