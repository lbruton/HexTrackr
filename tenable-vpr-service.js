/**
 * Tenable VPR API Service - Free Public API Integration
 * Provides Vulnerability Priority Rating (VPR) data without requiring API keys
 * 
 * @description Tenable's free VPR service for vulnerability prioritization
 * @author HexTrackr Team
 * @version 1.0.0
 */

class TenableVPRService {
    constructor() {
        this.baseUrl = 'https://www.tenable.com/plugins/nessus';
        this.vprApiUrl = 'https://www.tenable.com/api/v2/plugins';
        this.rateLimiter = {
            requests: 0,
            resetTime: Date.now() + 60000, // Reset every minute
            maxRequests: 30 // Conservative limit for free API
        };
        this.cache = new Map();
        this.cacheTimeout = 1800000; // 30 minutes
    }

    /**
     * Check rate limiting
     */
    checkRateLimit() {
        const now = Date.now();
        if (now > this.rateLimiter.resetTime) {
            this.rateLimiter.requests = 0;
            this.rateLimiter.resetTime = now + 60000;
        }
        
        if (this.rateLimiter.requests >= this.rateLimiter.maxRequests) {
            throw new Error('Rate limit exceeded. Please wait before making more requests.');
        }
        
        this.rateLimiter.requests++;
    }

    /**
     * Get VPR score for a CVE
     * @param {string} cveId - CVE identifier (e.g., "CVE-2023-1234")
     * @returns {Promise<Object>} VPR data with score and details
     */
    async getVPRScore(cveId) {
        try {
            this.checkRateLimit();
            
            // Check cache first
            const cacheKey = `vpr_${cveId}`;
            const cached = this.cache.get(cacheKey);
            if (cached && (Date.now() - cached.timestamp) < this.cacheTimeout) {
                return cached.data;
            }

            // Use the public Tenable plugin search
            const response = await fetch(`https://www.tenable.com/plugins/search?q=${encodeURIComponent(cveId)}&type=nessus`);
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.text();
            const vprData = this.parseVPRFromHTML(data, cveId);
            
            // Cache the result
            this.cache.set(cacheKey, {
                data: vprData,
                timestamp: Date.now()
            });

            return vprData;
        } catch (error) {
            console.error(`Error getting VPR for ${cveId}:`, error);
            return this.getDefaultVPRData(cveId, error.message);
        }
    }

    /**
     * Parse VPR data from Tenable HTML response
     * @param {string} html - HTML response from Tenable
     * @param {string} cveId - CVE identifier
     * @returns {Object} Parsed VPR data
     */
    parseVPRFromHTML(html, cveId) {
        try {
            // This is a simplified parser - in practice, you'd want more robust parsing
            const vprMatch = html.match(/VPR[\s\S]*?(\d+\.?\d*)/i);
            const cvssMatch = html.match(/CVSS[\s\S]*?(\d+\.?\d*)/i);
            
            const vprScore = vprMatch ? parseFloat(vprMatch[1]) : null;
            const cvssScore = cvssMatch ? parseFloat(cvssMatch[1]) : null;
            
            return {
                cve: cveId,
                vpr: {
                    score: vprScore || this.calculateEstimatedVPR(cvssScore),
                    available: !!vprScore,
                    estimated: !vprScore
                },
                cvss: {
                    score: cvssScore,
                    available: !!cvssScore
                },
                priority: this.calculatePriority(vprScore || this.calculateEstimatedVPR(cvssScore)),
                source: 'tenable_free',
                lastUpdated: new Date().toISOString(),
                details: {
                    exploitability: this.getExploitabilityLevel(vprScore || this.calculateEstimatedVPR(cvssScore)),
                    businessImpact: this.getBusinessImpact(vprScore || this.calculateEstimatedVPR(cvssScore)),
                    riskAcceptance: this.getRiskAcceptance(vprScore || this.calculateEstimatedVPR(cvssScore))
                }
            };
        } catch (error) {
            console.error('Error parsing VPR data:', error);
            return this.getDefaultVPRData(cveId, 'Parse error');
        }
    }

    /**
     * Calculate estimated VPR from CVSS score
     * @param {number} cvssScore - CVSS score
     * @returns {number} Estimated VPR score
     */
    calculateEstimatedVPR(cvssScore) {
        if (!cvssScore) return 5.0; // Default medium priority
        
        // VPR typically ranges from 0-10, with different weighting than CVSS
        // This is a simplified estimation algorithm
        let vpr = cvssScore;
        
        // Adjust for threat intelligence (simplified)
        if (cvssScore >= 9.0) vpr = Math.min(10, cvssScore + 0.5);
        else if (cvssScore >= 7.0) vpr = cvssScore + 0.3;
        else if (cvssScore >= 4.0) vpr = cvssScore + 0.1;
        
        return Math.round(vpr * 10) / 10;
    }

    /**
     * Calculate priority level from VPR score
     * @param {number} vprScore - VPR score
     * @returns {string} Priority level
     */
    calculatePriority(vprScore) {
        if (vprScore >= 9.0) return 'Critical';
        if (vprScore >= 7.0) return 'High';
        if (vprScore >= 4.0) return 'Medium';
        return 'Low';
    }

    /**
     * Get exploitability level
     * @param {number} vprScore - VPR score
     * @returns {string} Exploitability level
     */
    getExploitabilityLevel(vprScore) {
        if (vprScore >= 9.0) return 'Active exploitation observed';
        if (vprScore >= 7.0) return 'High exploit potential';
        if (vprScore >= 4.0) return 'Medium exploit potential';
        return 'Low exploit potential';
    }

    /**
     * Get business impact assessment
     * @param {number} vprScore - VPR score
     * @returns {string} Business impact
     */
    getBusinessImpact(vprScore) {
        if (vprScore >= 9.0) return 'Severe business impact';
        if (vprScore >= 7.0) return 'High business impact';
        if (vprScore >= 4.0) return 'Medium business impact';
        return 'Low business impact';
    }

    /**
     * Get risk acceptance recommendation
     * @param {number} vprScore - VPR score
     * @returns {string} Risk acceptance guidance
     */
    getRiskAcceptance(vprScore) {
        if (vprScore >= 9.0) return 'Immediate action required - Do not accept risk';
        if (vprScore >= 7.0) return 'Patch within 48 hours';
        if (vprScore >= 4.0) return 'Patch within 30 days';
        return 'Standard patching cycle acceptable';
    }

    /**
     * Get default VPR data when API fails
     * @param {string} cveId - CVE identifier
     * @param {string} errorMessage - Error message
     * @returns {Object} Default VPR data
     */
    getDefaultVPRData(cveId, errorMessage) {
        return {
            cve: cveId,
            vpr: {
                score: 5.0,
                available: false,
                estimated: true,
                error: errorMessage
            },
            cvss: {
                score: null,
                available: false
            },
            priority: 'Medium',
            source: 'tenable_free_fallback',
            lastUpdated: new Date().toISOString(),
            details: {
                exploitability: 'Unknown - API unavailable',
                businessImpact: 'Medium business impact (estimated)',
                riskAcceptance: 'Standard patching cycle acceptable'
            }
        };
    }

    /**
     * Batch get VPR scores for multiple CVEs
     * @param {string[]} cveIds - Array of CVE identifiers
     * @param {Function} progressCallback - Progress callback function
     * @returns {Promise<Object[]>} Array of VPR data
     */
    async getBatchVPRScores(cveIds, progressCallback = null) {
        const results = [];
        const total = cveIds.length;
        
        for (let i = 0; i < total; i++) {
            try {
                const vprData = await this.getVPRScore(cveIds[i]);
                results.push(vprData);
                
                if (progressCallback) {
                    progressCallback({
                        current: i + 1,
                        total: total,
                        percentage: Math.round(((i + 1) / total) * 100),
                        currentCve: cveIds[i]
                    });
                }
                
                // Add delay to respect rate limits
                if (i < total - 1) {
                    await this.delay(2000); // 2 second delay between requests
                }
            } catch (error) {
                console.error(`Error processing CVE ${cveIds[i]}:`, error);
                results.push(this.getDefaultVPRData(cveIds[i], error.message));
            }
        }
        
        return results;
    }

    /**
     * Utility delay function
     * @param {number} ms - Milliseconds to delay
     * @returns {Promise} Promise that resolves after delay
     */
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Clear cache
     */
    clearCache() {
        this.cache.clear();
        console.log('Tenable VPR cache cleared');
    }

    /**
     * Get cache statistics
     * @returns {Object} Cache statistics
     */
    getCacheStats() {
        return {
            size: this.cache.size,
            rateLimitRemaining: this.rateLimiter.maxRequests - this.rateLimiter.requests,
            rateLimitReset: new Date(this.rateLimiter.resetTime).toISOString()
        };
    }
}

// Export for use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = TenableVPRService;
}

// Global instance for browser use
if (typeof window !== 'undefined') {
    window.TenableVPRService = TenableVPRService;
}
