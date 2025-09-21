# CISA KEV API Service Architecture

## Overview

This document defines the API service architecture for integrating CISA Known Exploited Vulnerabilities (KEV) data into HexTrackr. The architecture follows HexTrackr's modular patterns with dedicated service layers, RESTful endpoints, and comprehensive error handling.

---

## Service Layer Architecture

### KEV Service Module (`app/services/kevService.js`)

**Design Principles:**
- **Single Responsibility**: Handles only KEV-related operations
- **Dependency Injection**: Receives database connection and logger
- **Async/Await**: Modern Promise-based patterns
- **Error Boundaries**: Comprehensive error handling with logging
- **Caching Strategy**: Multi-layer caching for performance

```javascript
/**
 * CISA KEV Service
 * Handles all Known Exploited Vulnerabilities operations
 *
 * @class KevService
 */
class KevService {
    constructor(database, logger, cache = null) {
        this.db = database;
        this.logger = logger;
        this.cache = cache;
        this.kevApiUrl = 'https://www.cisa.gov/sites/default/files/feeds/known_exploited_vulnerabilities.json';
        this.cacheTimeout = 3600000; // 1 hour in milliseconds
    }

    // ================================================================
    // Core Synchronization Methods
    // ================================================================

    /**
     * Check for KEV catalog updates without downloading full data
     * Uses HEAD request and ETag comparison for efficiency
     *
     * @returns {Promise<boolean>} True if update available
     */
    async checkForUpdates() {
        // Implementation: Compare catalog version or ETag
    }

    /**
     * Download and synchronize KEV data from CISA
     * Handles batch processing and transaction management
     *
     * @param {boolean} forceUpdate - Skip version check
     * @returns {Promise<Object>} Sync results with statistics
     */
    async syncKevData(forceUpdate = false) {
        // Implementation: Full sync workflow with logging
    }

    /**
     * Process batch of KEV vulnerabilities
     * Optimized for SQLite with transaction batching
     *
     * @param {Array} kevBatch - Array of KEV vulnerability objects
     * @returns {Promise<Object>} Batch processing results
     */
    async processBatch(kevBatch) {
        // Implementation: Batch insert/update with error handling
    }

    // ================================================================
    // Query Operations
    // ================================================================

    /**
     * Check if specific CVE is in KEV catalog
     * Optimized for high-frequency lookups with caching
     *
     * @param {string} cveId - CVE identifier (e.g., 'CVE-2024-1234')
     * @returns {Promise<boolean>} True if CVE is KEV
     */
    async isKevVulnerability(cveId) {
        // Implementation: Fast lookup with cache check
    }

    /**
     * Get complete KEV metadata for specific CVE
     * Returns full CISA KEV details
     *
     * @param {string} cveId - CVE identifier
     * @returns {Promise<Object|null>} KEV metadata or null
     */
    async getKevMetadata(cveId) {
        // Implementation: Full KEV record retrieval
    }

    /**
     * Get KEV statistics for dashboard
     * Cached results for performance
     *
     * @returns {Promise<Object>} KEV statistics summary
     */
    async getKevStatistics() {
        // Implementation: Dashboard statistics with caching
    }

    /**
     * Get recent KEV additions
     * Used for trending and alerts
     *
     * @param {number} days - Number of days to look back
     * @returns {Promise<Array>} Recent KEV additions
     */
    async getRecentKevAdditions(days = 30) {
        // Implementation: Date-filtered KEV query
    }

    // ================================================================
    // Bulk Operations
    // ================================================================

    /**
     * Initial population of KEV data for existing vulnerabilities
     * One-time operation for new installations
     *
     * @returns {Promise<Object>} Population results and statistics
     */
    async populateInitialData() {
        // Implementation: Initial setup workflow
    }

    /**
     * Bulk KEV status check for multiple CVEs
     * Optimized for vulnerability table loading
     *
     * @param {Array<string>} cveIds - Array of CVE identifiers
     * @returns {Promise<Map>} Map of CVE ID to KEV status
     */
    async bulkKevStatus(cveIds) {
        // Implementation: Batch status lookup
    }

    // ================================================================
    // Cache Management
    // ================================================================

    /**
     * Clear KEV-related caches
     * Used after data updates
     */
    async invalidateCache() {
        // Implementation: Cache invalidation
    }

    /**
     * Get cached data with fallback
     *
     * @param {string} key - Cache key
     * @param {Function} fallback - Function to generate data if not cached
     * @returns {Promise<any>} Cached or generated data
     */
    async getCachedData(key, fallback) {
        // Implementation: Cache with fallback pattern
    }
}
```

---

## RESTful API Endpoints

### 1. KEV Management Endpoints

#### `GET /api/kev/sync`
**Purpose**: Manual KEV data synchronization
**Access**: Admin only
**Response Time**: 30-120 seconds

```javascript
// Request
GET /api/kev/sync
Authorization: Bearer <admin-token>

// Response (200 OK)
{
    "success": true,
    "message": "KEV sync completed successfully",
    "data": {
        "catalogVersion": "2024.09.21",
        "totalKevs": 1234,
        "kevsAdded": 15,
        "kevsUpdated": 3,
        "kevsRemoved": 0,
        "syncDuration": 45.2,
        "lastSync": "2024-09-21T15:30:00Z"
    }
}

// Response (202 Accepted) - Sync in progress
{
    "success": true,
    "message": "KEV sync started",
    "data": {
        "syncId": "sync_1727015400123",
        "status": "running",
        "estimatedCompletion": "2024-09-21T15:32:00Z"
    }
}

// Response (429 Too Many Requests)
{
    "success": false,
    "error": "Sync already in progress",
    "data": {
        "currentSyncId": "sync_1727015400123",
        "startedAt": "2024-09-21T15:30:00Z"
    }
}
```

#### `GET /api/kev/stats`
**Purpose**: KEV coverage and statistics
**Access**: All authenticated users
**Response Time**: <500ms

```javascript
// Request
GET /api/kev/stats

// Response (200 OK)
{
    "success": true,
    "data": {
        "totalKevs": 1234,
        "ransomwareKevs": 156,
        "overdueKevs": 23,
        "dueSoonKevs": 8,
        "recentKevs": 45,
        "kevPercentage": 1.2,
        "lastSync": "2024-09-21T15:30:00Z",
        "catalogVersion": "2024.09.21",
        "trends": {
            "last7Days": 5,
            "last30Days": 45,
            "last90Days": 123
        }
    }
}
```

#### `GET /api/kev/recent`
**Purpose**: Recent KEV additions
**Access**: All authenticated users
**Parameters**: `?days=30` (optional, default 30)

```javascript
// Request
GET /api/kev/recent?days=7

// Response (200 OK)
{
    "success": true,
    "data": {
        "count": 5,
        "vulnerabilities": [
            {
                "cveId": "CVE-2024-1234",
                "dateAdded": "2024-09-21",
                "vulnerabilityName": "Critical Buffer Overflow",
                "vendorProject": "Example Vendor",
                "product": "Example Product",
                "dueDate": "2024-10-21",
                "knownRansomwareUse": false
            }
        ]
    }
}
```

### 2. Enhanced Vulnerability Endpoints

#### `GET /api/vulnerabilities` (Enhanced)
**Purpose**: Vulnerability listing with KEV integration
**Enhancement**: Add KEV filtering and status

```javascript
// Request with KEV filter
GET /api/vulnerabilities?kev=true&page=1&limit=50

// Response (200 OK) - Enhanced with KEV data
{
    "success": true,
    "data": {
        "vulnerabilities": [
            {
                "id": 12345,
                "cveId": "CVE-2024-1234",
                "severity": "Critical",
                "vprScore": 9.8,
                "description": "Buffer overflow vulnerability",
                // Enhanced KEV data
                "isKev": true,
                "kevMetadata": {
                    "dateAdded": "2024-09-21",
                    "dueDate": "2024-10-21",
                    "requiredAction": "Apply security patches",
                    "knownRansomwareUse": false
                }
            }
        ],
        "pagination": {
            "page": 1,
            "limit": 50,
            "total": 156,
            "pages": 4
        },
        "filters": {
            "kev": true
        }
    }
}
```

#### `GET /api/vulnerabilities/:cveId/kev`
**Purpose**: KEV status for specific vulnerability
**Response Time**: <50ms

```javascript
// Request
GET /api/vulnerabilities/CVE-2024-1234/kev

// Response (200 OK) - KEV found
{
    "success": true,
    "data": {
        "isKev": true,
        "cveId": "CVE-2024-1234",
        "dateAdded": "2024-09-21",
        "vulnerabilityName": "Critical Buffer Overflow",
        "vendorProject": "Example Vendor",
        "product": "Example Product",
        "requiredAction": "Apply security patches immediately",
        "dueDate": "2024-10-21",
        "knownRansomwareUse": false,
        "notes": "High priority vulnerability",
        "daysUntilDue": 30
    }
}

// Response (200 OK) - Not a KEV
{
    "success": true,
    "data": {
        "isKev": false,
        "cveId": "CVE-2024-5678"
    }
}

// Response (404 Not Found)
{
    "success": false,
    "error": "CVE not found in vulnerability database",
    "data": {
        "cveId": "CVE-2024-9999"
    }
}
```

### 3. Bulk Operations

#### `POST /api/kev/bulk-status`
**Purpose**: Bulk KEV status check
**Access**: Authenticated users
**Use Case**: Loading vulnerability tables with KEV indicators

```javascript
// Request
POST /api/kev/bulk-status
Content-Type: application/json

{
    "cveIds": [
        "CVE-2024-1234",
        "CVE-2024-5678",
        "CVE-2024-9999"
    ]
}

// Response (200 OK)
{
    "success": true,
    "data": {
        "results": {
            "CVE-2024-1234": {
                "isKev": true,
                "dateAdded": "2024-09-21",
                "dueDate": "2024-10-21"
            },
            "CVE-2024-5678": {
                "isKev": false
            },
            "CVE-2024-9999": {
                "isKev": false
            }
        },
        "processed": 3,
        "kevCount": 1
    }
}
```

---

## Error Handling Strategy

### Error Response Format

```javascript
// Standard error response
{
    "success": false,
    "error": "Human-readable error message",
    "code": "ERROR_CODE",
    "data": {
        // Additional error context
    },
    "timestamp": "2024-09-21T15:30:00Z",
    "requestId": "req_1727015400123"
}
```

### Error Codes and Handling

| Error Code | Description | HTTP Status | Retry Strategy |
|------------|-------------|-------------|----------------|
| `KEV_SYNC_IN_PROGRESS` | Sync already running | 429 | Wait and retry |
| `KEV_API_UNAVAILABLE` | CISA API unreachable | 503 | Exponential backoff |
| `KEV_DATA_CORRUPTED` | Invalid KEV data format | 500 | Alert admin |
| `KEV_CVE_NOT_FOUND` | CVE not in database | 404 | No retry needed |
| `KEV_CACHE_ERROR` | Cache operation failed | 500 | Fallback to DB |
| `KEV_DATABASE_ERROR` | Database operation failed | 500 | Retry with backoff |

### Retry Logic Implementation

```javascript
class RetryHandler {
    static async withRetry(operation, maxRetries = 3, baseDelay = 1000) {
        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                return await operation();
            } catch (error) {
                if (attempt === maxRetries || !this.isRetryable(error)) {
                    throw error;
                }

                const delay = baseDelay * Math.pow(2, attempt - 1); // Exponential backoff
                await this.sleep(delay);
            }
        }
    }

    static isRetryable(error) {
        const retryableCodes = [
            'KEV_API_UNAVAILABLE',
            'KEV_DATABASE_TIMEOUT',
            'KEV_TEMPORARY_ERROR'
        ];
        return retryableCodes.includes(error.code);
    }
}
```

---

## Caching Strategy

### Multi-Layer Caching Architecture

```javascript
class KevCacheManager {
    constructor() {
        this.memoryCache = new Map(); // In-memory cache
        this.redisCache = null;       // Redis cache (optional)
        this.dbCache = null;          // Database-level caching
    }

    async get(key) {
        // Layer 1: Memory cache (fastest)
        if (this.memoryCache.has(key)) {
            return this.memoryCache.get(key);
        }

        // Layer 2: Redis cache (fast)
        if (this.redisCache) {
            const value = await this.redisCache.get(key);
            if (value) {
                this.memoryCache.set(key, value);
                return value;
            }
        }

        // Layer 3: Database cache (slower)
        return null; // Fallback to database
    }

    async set(key, value, ttl = 3600) {
        // Set in all cache layers
        this.memoryCache.set(key, value);

        if (this.redisCache) {
            await this.redisCache.setex(key, ttl, JSON.stringify(value));
        }
    }
}
```

### Cache Keys Strategy

| Cache Key | TTL | Description |
|-----------|-----|-------------|
| `kev:status:{cveId}` | 1 hour | Individual KEV status |
| `kev:stats:dashboard` | 15 minutes | Dashboard statistics |
| `kev:catalog:version` | 1 hour | Current catalog version |
| `kev:recent:{days}` | 30 minutes | Recent KEV additions |
| `kev:bulk:{hash}` | 30 minutes | Bulk lookup results |

---

## Rate Limiting

### API Rate Limits

| Endpoint | Limit | Window | Scope |
|----------|--------|--------|--------|
| `/api/kev/sync` | 2 requests | 5 minutes | Global |
| `/api/kev/stats` | 60 requests | 1 minute | Per user |
| `/api/kev/recent` | 30 requests | 1 minute | Per user |
| `/api/vulnerabilities/:id/kev` | 100 requests | 1 minute | Per user |
| `/api/kev/bulk-status` | 10 requests | 1 minute | Per user |

### Rate Limiting Implementation

```javascript
const rateLimit = require('express-rate-limit');

// KEV sync rate limiting (strict)
const kevSyncLimiter = rateLimit({
    windowMs: 5 * 60 * 1000, // 5 minutes
    max: 2, // 2 requests per window
    message: {
        success: false,
        error: 'Too many sync requests. Please wait before trying again.',
        code: 'KEV_SYNC_RATE_LIMITED'
    },
    standardHeaders: true,
    legacyHeaders: false
});

// General KEV API rate limiting
const kevApiLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 100, // 100 requests per minute
    message: {
        success: false,
        error: 'Too many KEV API requests. Please slow down.',
        code: 'KEV_API_RATE_LIMITED'
    }
});
```

---

## Performance Monitoring

### Metrics Collection

```javascript
class KevMetrics {
    static record(operation, duration, success = true) {
        const metric = {
            operation,
            duration,
            success,
            timestamp: new Date().toISOString()
        };

        // Log to monitoring system
        logger.info('KEV Operation Metric', metric);

        // Track performance targets
        this.checkPerformanceTargets(operation, duration);
    }

    static checkPerformanceTargets(operation, duration) {
        const targets = {
            'kev_status_lookup': 50,    // 50ms target
            'kev_bulk_lookup': 200,     // 200ms target
            'kev_stats_query': 500,     // 500ms target
            'kev_sync_operation': 120000 // 2 minutes target
        };

        const target = targets[operation];
        if (target && duration > target) {
            logger.warn(`KEV performance target exceeded: ${operation} took ${duration}ms (target: ${target}ms)`);
        }
    }
}
```

### Health Check Endpoint

```javascript
// GET /api/kev/health
{
    "success": true,
    "data": {
        "status": "healthy",
        "lastSync": "2024-09-21T15:30:00Z",
        "syncStatus": "completed",
        "catalogVersion": "2024.09.21",
        "totalKevs": 1234,
        "apiResponseTime": 45,
        "databaseHealth": "good",
        "cacheHealth": "good",
        "uptime": 86400
    }
}
```

---

## Security Considerations

### Input Validation

```javascript
const kevValidationRules = {
    cveId: {
        pattern: /^CVE-\d{4}-\d{4,7}$/,
        required: true,
        sanitize: true
    },
    catalogVersion: {
        pattern: /^\d{4}\.\d{2}\.\d{2}$/,
        required: false
    },
    bulkCveIds: {
        type: 'array',
        maxItems: 1000,
        itemPattern: /^CVE-\d{4}-\d{4,7}$/
    }
};
```

### API Authentication Integration

```javascript
// Future authentication middleware
app.use('/api/kev/sync', requireRole('admin'));
app.use('/api/kev/stats', requireAuth());
app.use('/api/kev/*', requireAuth());
```

---

## Testing Strategy

### Unit Tests

```javascript
describe('KevService', () => {
    describe('isKevVulnerability', () => {
        it('should return true for known KEV', async () => {
            const result = await kevService.isKevVulnerability('CVE-2024-1234');
            expect(result).toBe(true);
        });

        it('should return false for non-KEV', async () => {
            const result = await kevService.isKevVulnerability('CVE-2024-9999');
            expect(result).toBe(false);
        });

        it('should complete within 50ms', async () => {
            const start = Date.now();
            await kevService.isKevVulnerability('CVE-2024-1234');
            const duration = Date.now() - start;
            expect(duration).toBeLessThan(50);
        });
    });
});
```

### Integration Tests

```javascript
describe('KEV API Endpoints', () => {
    describe('GET /api/kev/stats', () => {
        it('should return KEV statistics', async () => {
            const response = await request(app)
                .get('/api/kev/stats')
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data).toHaveProperty('totalKevs');
            expect(response.body.data).toHaveProperty('kevPercentage');
        });
    });
});
```

---

## Deployment Considerations

### Environment Configuration

```javascript
// Environment variables for KEV integration
const kevConfig = {
    apiUrl: process.env.KEV_API_URL || 'https://www.cisa.gov/sites/default/files/feeds/known_exploited_vulnerabilities.json',
    syncSchedule: process.env.KEV_SYNC_SCHEDULE || '0 3 * * 1-5', // 3 AM weekdays
    cacheTimeout: parseInt(process.env.KEV_CACHE_TIMEOUT) || 3600000,
    batchSize: parseInt(process.env.KEV_BATCH_SIZE) || 1000,
    maxRetries: parseInt(process.env.KEV_MAX_RETRIES) || 3,
    apiTimeout: parseInt(process.env.KEV_API_TIMEOUT) || 30000
};
```

### Database Migration

```javascript
// Migration script for existing installations
async function migrateKevTables() {
    const migrationSql = await fs.readFile('planning/kev-database-schema.sql', 'utf8');
    await db.exec(migrationSql);
    logger.info('KEV database migration completed');
}
```

---

## Documentation References

- **Main Planning Document**: `/planning/kev-lookup-plan.md`
- **Database Schema**: `/planning/kev-database-schema.sql`
- **UI Mockups**: `/planning/kev-ui-mockup.md`
- **Test Plan**: `/planning/kev-test-plan.md`
- **CISA KEV Catalog**: https://www.cisa.gov/known-exploited-vulnerabilities-catalog

---

**Document Information:**
- **Created**: 2025-09-21
- **Version**: 1.0
- **Status**: Planning Phase
- **Next Review**: Before Phase 1 implementation