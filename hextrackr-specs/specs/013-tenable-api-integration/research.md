# Research: Tenable API Integration

**Date**: 2025-09-09  
**Status**: Complete  
**Prerequisites**: spec.md analysis completed  

## Technical Research Findings

### Background Job Processing System

**Decision**: Implement dedicated background job processing for scan imports  
**Rationale**: Automated vulnerability scan imports require long-running processes that shouldn't block the main application. Polling Tenable's API for completed scans needs robust job management with retry logic and failure handling.  
**Alternatives considered**:

- Direct synchronous API calls (rejected - would block UI)
- Simple cron jobs (rejected - no failure handling or monitoring)
- Webhook-based imports (future optimization - Tenable webhook support unclear)

**Recommended Implementation**: Background job system with scheduled polling every 30 minutes for completed scans. Jobs should be idempotent to prevent duplicate imports.

### Asset Correlation Strategy  

**Decision**: UUID-first correlation with strict hostname fallback controls  
**Rationale**: Tenable UUIDs provide the most reliable asset matching. Hostname fallback creates data integrity risks but may be necessary when UUIDs unavailable.  
**Alternatives considered**:

- IP-based matching (rejected - IPs change frequently)
- MAC address correlation (rejected - not always available)
- Hostname-only matching (rejected - hostname conflicts common)

**Implementation Recommendations**:

1. Primary: Match assets using Tenable UUID as unique identifier
2. Fallback: Hostname matching with manual review flag
3. Never: Automatic merging of assets without UUID correlation

### Data Source of Truth Architecture

**Decision**: Split ownership model for vulnerability data  
**Rationale**: Tenable should be authoritative for discovery data (CVE details, severity, first/last seen) while HexTrackr owns management data (status, assignee, comments).  
**Alternatives considered**:

- Tenable as single source of truth (rejected - overwrites user management)
- HexTrackr as single source of truth (rejected - loses Tenable updates)

**Data Flow Pattern**:

```
Tenable Data (Read-Only): CVE ID, severity, description, asset UUID
HexTrackr Data (Managed): status, assignee, notes, remediation_date
```

### API Client Architecture Pattern

**Decision**: Generic VulnerabilityScannerAdapter interface with Tenable implementation  
**Rationale**: Abstract interface enables future scanner integrations (Qualys, Rapid7) without refactoring core logic.  
**Alternatives considered**:

- Tenable-specific client (rejected - limits extensibility)
- Multiple concrete clients (rejected - code duplication)

**Interface Methods**:

```typescript
interface VulnerabilityScannerAdapter {
  getAssets(): Promise<Asset[]>
  getVulnerabilities(assetId: string): Promise<Vulnerability[]>
  getLastScanResults(): Promise<ScanResult[]>
}
```

## Implementation Recommendations

### Database Schema Considerations

- Add `tenable_uuid` field to assets table for correlation
- Implement `plugin_mapping` table for Tenable Plugin ID → CVE correlation
- Store scan metadata (scan_id, scan_date, scanner_info) for audit trail
- Partition historical scan data by date for performance

### Security Requirements

- API keys MUST be encrypted at rest using secrets management system
- Rate limiting MUST respect Tenable API constraints (typically 100 requests/minute)
- API authentication MUST use X-ApiKeys header format for Tenable.io
- Network access MUST be restricted to Tenable.io endpoints only

### Data Lifecycle Management

- Retain raw scan data for 180 days in primary database
- Archive older data to long-term storage (S3 Glacier equivalent)  
- Implement monthly data aggregation for trend analysis
- Create summary tables: monthly vulnerability counts, resolution trends

## Risk Assessment

### High Risk Areas

1. **Asset Correlation Failures**: Hostname fallback may create duplicate assets
2. **Data Integrity**: Overwriting HexTrackr management data from Tenable sync
3. **Performance Degradation**: Unbounded historical data growth
4. **API Rate Limits**: Exceeding Tenable API constraints during large imports

### Mitigation Strategies

1. Implement correlation review workflow for hostname matches
2. Split data ownership with clear read-only/managed field boundaries  
3. Implement data retention and aggregation policies
4. Add exponential backoff retry logic with rate limit detection

## Validation Criteria

### Technical Validation

- [ ] Background job system handles long-running imports without blocking UI
- [ ] UUID correlation achieves >95% asset matching accuracy
- [ ] API rate limiting prevents 429 errors from Tenable
- [ ] Historical data queries complete within 5 seconds

### Functional Validation  

- [ ] Scan results import automatically within 1 hour of completion
- [ ] Asset metadata synchronizes including IP addresses and OS information
- [ ] User-modified vulnerability statuses preserved during sync
- [ ] Plugin ID mapping correctly correlates to CVE identifiers

### Performance Validation

- [ ] Import job processes 1000+ vulnerabilities within 10 minutes
- [ ] Database queries remain responsive during background imports  
- [ ] Trend analysis reports generate within 30 seconds
- [ ] Memory usage remains stable during large dataset imports

## Library Dependencies

### Recommended Libraries

- **HTTP Client**: `axios` with retry interceptors for API communication
- **Job Processing**: `bull` or equivalent Redis-based job queue
- **Rate Limiting**: `bottleneck` for API request throttling
- **Database**: Native SQLite with prepared statements for performance

### Integration Points

- Background job scheduler integration with existing HexTrackr infrastructure
- Secrets management integration for API key storage
- Logging integration for audit trail and monitoring
- Error notification integration for failed import alerts
