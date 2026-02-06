/**
 * Cache Service - In-Memory Caching for HexTrackr
 *
 * Provides application-level caching using node-cache to reduce database load
 * and improve response times for frequently-accessed data.
 *
 * Usage Pattern:
 * - Vulnerability data changes primarily during imports
 * - Stats/trends are aggregated data (small payloads)
 * - Default TTL is 90 seconds to keep UI responsive while reducing DB load
 *
 * Performance Impact:
 * - Uncached: 400-1000ms (database query + serialization + compression)
 * - Cached: 2-5ms (memory retrieval)
 * - Memory usage: <1MB for all caches combined
 *
 * @module services/cacheService
 * @since 1.0.36
 */

const NodeCache = require("node-cache");

/**
 * Cache Service singleton for managing application-level caches
 *
 * @class CacheService
 */
class CacheService {
    constructor() {
        if (CacheService.instance) {
            return CacheService.instance;
        }

        /**
         * Stats cache (severity counts, VPR totals)
         * TTL: 1800 seconds (30 minutes - data only changes on CSV imports)
         *
         * @type {NodeCache}
         */
        this.statsCache = new NodeCache({
            stdTTL: 1800, // 30 minutes (data changes infrequently, cleared on imports)
            checkperiod: 30, // Check for expired keys every 30s
            useClones: false, // Disabled: Controllers use res.json() which serializes anyway (40-50% faster)
            maxKeys: 100 // Safety limit
        });

        /**
         * Trends cache (dashboard cards, historical data)
         * TTL: 1800 seconds (30 minutes - data only changes on CSV imports)
         *
         * @type {NodeCache}
         */
        this.trendsCache = new NodeCache({
            stdTTL: 1800, // 30 minutes (data changes infrequently, cleared on imports)
            checkperiod: 30, // Check for expired keys every 30s
            useClones: false, // Disabled: Controllers use res.json() which serializes anyway (40-50% faster)
            maxKeys: 100
        });

        /**
         * Vulnerability data cache (full vulnerability lists)
         * TTL: 1800 seconds (30 minutes - data only changes on CSV imports)
         *
         * @type {NodeCache}
         */
        this.vulnerabilityCache = new NodeCache({
            stdTTL: 1800, // 30 minutes (data changes infrequently, cleared on imports)
            checkperiod: 30, // Check for expired keys every 30s
            useClones: false, // Disabled: Controllers use res.json() which serializes anyway (40-50% faster)
            maxKeys: 50 // Fewer keys (larger payloads)
        });

        // Track cache hits/misses for monitoring
        this.stats = {
            hits: 0,
            misses: 0,
            invalidations: 0
        };

        CacheService.instance = this;
    }

    /**
     * Get singleton instance
     *
     * @returns {CacheService} Singleton instance
     */
    static getInstance() {
        if (!CacheService.instance) {
            CacheService.instance = new CacheService();
        }
        return CacheService.instance;
    }

    // ============================================================================
    // Stats Cache Methods
    // ============================================================================

    /**
     * Get vulnerability statistics from cache
     *
     * @param {string} key - Cache key
     * @returns {object|undefined} Cached data or undefined if not found
     * @example
     * const stats = cacheService.getStats('vulnerability-stats');
     */
    getStats(key) {
        const value = this.statsCache.get(key);
        if (value !== undefined) {
            this.stats.hits++;
        } else {
            this.stats.misses++;
        }
        return value;
    }

    /**
     * Set vulnerability statistics in cache
     *
     * @param {string} key - Cache key
     * @param {object} value - Data to cache
     * @param {number} [ttl] - Optional TTL override (seconds)
     * @returns {boolean} Success status
     * @example
     * cacheService.setStats('vulnerability-stats', statsData);
     */
    setStats(key, value, ttl) {
        return this.statsCache.set(key, value, ttl);
    }

    /**
     * Delete specific stats cache entry
     *
     * @param {string} key - Cache key
     * @returns {number} Number of deleted entries
     */
    deleteStats(key) {
        this.stats.invalidations++;
        return this.statsCache.del(key);
    }

    /**
     * Clear all stats cache
     * Call after imports or data mutations
     *
     * @returns {void}
     * @example
     * cacheService.clearStatsCache(); // After CSV import
     */
    clearStatsCache() {
        this.stats.invalidations++;
        this.statsCache.flushAll();
    }

    // ============================================================================
    // Trends Cache Methods
    // ============================================================================

    /**
     * Get trends data from cache
     *
     * @param {string} key - Cache key
     * @returns {object|undefined} Cached data or undefined if not found
     */
    getTrends(key) {
        const value = this.trendsCache.get(key);
        if (value !== undefined) {
            this.stats.hits++;
        } else {
            this.stats.misses++;
        }
        return value;
    }

    /**
     * Set trends data in cache
     *
     * @param {string} key - Cache key
     * @param {object} value - Data to cache
     * @param {number} [ttl] - Optional TTL override (seconds)
     * @returns {boolean} Success status
     */
    setTrends(key, value, ttl) {
        return this.trendsCache.set(key, value, ttl);
    }

    /**
     * Delete specific trends cache entry
     *
     * @param {string} key - Cache key
     * @returns {number} Number of deleted entries
     */
    deleteTrends(key) {
        this.stats.invalidations++;
        return this.trendsCache.del(key);
    }

    /**
     * Clear all trends cache
     * Call after imports or data mutations
     *
     * @returns {void}
     */
    clearTrendsCache() {
        this.stats.invalidations++;
        this.trendsCache.flushAll();
    }

    // ============================================================================
    // Vulnerability Data Cache Methods
    // ============================================================================

    /**
     * Get vulnerability data from cache
     *
     * @param {string} key - Cache key
     * @returns {object|undefined} Cached data or undefined if not found
     */
    getVulnerabilities(key) {
        const value = this.vulnerabilityCache.get(key);
        if (value !== undefined) {
            this.stats.hits++;
        } else {
            this.stats.misses++;
        }
        return value;
    }

    /**
     * Set vulnerability data in cache
     *
     * @param {string} key - Cache key
     * @param {object} value - Data to cache
     * @param {number} [ttl] - Optional TTL override (seconds)
     * @returns {boolean} Success status
     */
    setVulnerabilities(key, value, ttl) {
        return this.vulnerabilityCache.set(key, value, ttl);
    }

    /**
     * Delete specific vulnerability cache entry
     *
     * @param {string} key - Cache key
     * @returns {number} Number of deleted entries
     */
    deleteVulnerabilities(key) {
        this.stats.invalidations++;
        return this.vulnerabilityCache.del(key);
    }

    /**
     * Clear all vulnerability data cache
     * Call after imports or data mutations
     *
     * @returns {void}
     */
    clearVulnerabilitiesCache() {
        this.stats.invalidations++;
        this.vulnerabilityCache.flushAll();
    }

    // ============================================================================
    // Helper Methods
    // ============================================================================

    /**
     * Higher-order function for caching Express endpoint responses
     * Eliminates duplicated cache check/set logic across controllers
     *
     * @param {object} res - Express response object
     * @param {string} cacheType - Cache type: 'stats', 'trends', or 'vulnerabilities'
     * @param {string} cacheKey - Unique cache key for this request
     * @param {number} serverTTL - Server-side cache TTL in seconds (node-cache)
     * @param {Function} handler - Async function that returns the data to cache
     * @param {number} [browserTTL] - Optional browser cache TTL (Cache-Control max-age)
     *                                 Defaults to min(serverTTL, 60) for fresh data checks
     * @returns {Promise<void>}
     * @example
     * // Server cache 5min, browser cache 60s
     * await cacheService.withCaching(res, 'stats', 'vulnerability-stats', 300, async () => {
     *     return await getStatsFromDatabase();
     * }, 60);
     */
    async withCaching(res, cacheType, cacheKey, serverTTL, handler, browserTTL = null) {
        // Select appropriate cache based on type
        let getCache, setCache;

        if (cacheType === "trends") {
            getCache = this.getTrends.bind(this);
            setCache = this.setTrends.bind(this);
        } else if (cacheType === "vulnerabilities") {
            getCache = this.getVulnerabilities.bind(this);
            setCache = this.setVulnerabilities.bind(this);
        } else {
            // Default to stats cache
            getCache = this.getStats.bind(this);
            setCache = this.setStats.bind(this);
        }

        // Browser cache defaults to shorter value for frequent freshness checks
        // Max 60s to allow fresh data to appear within 1 minute of cache clear
        const cacheDuration = browserTTL !== null ? browserTTL : Math.min(serverTTL, 60);

        // Check cache first
        const cached = getCache(cacheKey);
        if (cached) {
            res.setHeader("X-Cache", "HIT");
            res.setHeader("Cache-Control", `public, max-age=${cacheDuration}, must-revalidate`);
            return res.json(cached);
        }

        // Cache miss - execute handler
        const result = await handler();

        // Cache result with server TTL
        setCache(cacheKey, result, serverTTL);

        // Send response with MISS headers and browser TTL
        res.setHeader("X-Cache", "MISS");
        res.setHeader("Cache-Control", `public, max-age=${cacheDuration}, must-revalidate`);
        return res.json(result);
    }

    // ============================================================================
    // Global Operations
    // ============================================================================

    /**
     * Clear all caches (stats + trends + vulnerabilities)
     * Use after imports or significant data changes
     *
     * @returns {void}
     * @example
     * cacheService.clearAll(); // After Monday morning import
     */
    clearAll() {
        this.clearStatsCache();
        this.clearTrendsCache();
        this.clearVulnerabilitiesCache();

        if (global.logger?.info) {
            global.logger.info("backend", "cache", "All caches cleared", {
                statsKeys: this.statsCache.keys().length,
                trendsKeys: this.trendsCache.keys().length,
                vulnKeys: this.vulnerabilityCache.keys().length
            });
        } else {
            console.log("All caches cleared");
        }
    }

    /**
     * Get cache statistics
     * Useful for monitoring cache effectiveness
     *
     * @returns {object} Cache statistics
     * @example
     * const stats = cacheService.getStatistics();
     * console.log(`Hit rate: ${(stats.hitRate * 100).toFixed(1)}%`);
     */
    getStatistics() {
        const total = this.stats.hits + this.stats.misses;
        return {
            hits: this.stats.hits,
            misses: this.stats.misses,
            invalidations: this.stats.invalidations,
            hitRate: total > 0 ? this.stats.hits / total : 0,
            statsCache: {
                keys: this.statsCache.keys().length,
                stats: this.statsCache.getStats()
            },
            trendsCache: {
                keys: this.trendsCache.keys().length,
                stats: this.trendsCache.getStats()
            },
            vulnerabilityCache: {
                keys: this.vulnerabilityCache.keys().length,
                stats: this.vulnerabilityCache.getStats()
            }
        };
    }

    /**
     * Reset cache statistics
     * Does not clear cached data
     *
     * @returns {void}
     */
    resetStatistics() {
        this.stats.hits = 0;
        this.stats.misses = 0;
        this.stats.invalidations = 0;
    }
}

// Export class with explicit getInstance() pattern
// This prevents race conditions during module initialization
module.exports = CacheService;
