/**
 * HexTrackr Enhanced Cisco API Integration
 * Provides robust Cisco Security API connectivity with comprehensive vulnerability data
 * Documentation: https://developer.cisco.com/docs/security-advisories/
 */

class CiscoAPIService {
    constructor() {
        this.baseUrl = 'https://api.cisco.com/security';
        this.authUrl = 'https://cloudsso.cisco.com/as/token.oauth2';
        this.docsUrl = 'https://developer.cisco.com/docs/security-advisories/';
        this.portalUrl = 'https://sec.cloudapps.cisco.com/security/center/content/CiscoSecurityAdvisory/';
        this.accessToken = null;
        this.tokenExpiry = null;
        this.credentials = null;
        this.maxRetries = 3;
        this.retryDelay = 1000;
        this.rateLimit = {
            requests: 0,
            window: 60000, // 1 minute
            maxRequests: 100, // Cisco API limit
            resetTime: Date.now() + 60000
        };
    }

    /**
     * Check and enforce rate limiting
     */
    async checkRateLimit() {
        const now = Date.now();
        
        // Reset rate limit window if expired
        if (now > this.rateLimit.resetTime) {
            this.rateLimit.requests = 0;
            this.rateLimit.resetTime = now + this.rateLimit.window;
        }
        
        // Check if we've exceeded the rate limit
        if (this.rateLimit.requests >= this.rateLimit.maxRequests) {
            const waitTime = this.rateLimit.resetTime - now;
            console.warn(`🚦 Rate limit reached. Waiting ${Math.ceil(waitTime/1000)}s...`);
            await new Promise(resolve => setTimeout(resolve, waitTime));
            this.rateLimit.requests = 0;
            this.rateLimit.resetTime = Date.now() + this.rateLimit.window;
        }
        
        this.rateLimit.requests++;
    }

    /**
     * Initialize Cisco API service with credentials
     */
    async initialize() {
        try {
            const encrypted = localStorage.getItem('hextrackr_cisco_credentials');
            if (!encrypted) {
                throw new Error('No Cisco credentials found. Please configure API credentials first.');
            }

            // Decrypt credentials (assuming decryptData function exists)
            this.credentials = window.decryptData ? window.decryptData(encrypted) : JSON.parse(encrypted);
            
            if (!this.credentials || !this.credentials.clientId || !this.credentials.clientSecret) {
                throw new Error('Invalid Cisco credentials. Please reconfigure.');
            }

            console.log('🔐 Cisco API service initialized');
            return true;
        } catch (error) {
            console.error('Failed to initialize Cisco API service:', error);
            throw error;
        }
    }

    /**
     * Get OAuth access token
     */
    async getAccessToken() {
        // Check if current token is still valid
        if (this.accessToken && this.tokenExpiry && new Date() < this.tokenExpiry) {
            return this.accessToken;
        }

        if (!this.credentials) {
            await this.initialize();
        }

        try {
            const response = await fetch(this.authUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Accept': 'application/json'
                },
                body: new URLSearchParams({
                    'client_id': this.credentials.clientId,
                    'client_secret': this.credentials.clientSecret,
                    'grant_type': 'client_credentials'
                })
            });

            if (!response.ok) {
                throw new Error(`Authentication failed: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();
            this.accessToken = data.access_token;
            
            // Set token expiry (usually 1 hour, but we'll refresh a bit earlier)
            const expiresIn = data.expires_in || 3600;
            this.tokenExpiry = new Date(Date.now() + (expiresIn - 300) * 1000); // 5 minutes buffer

            console.log('🔑 Cisco API access token obtained');
            return this.accessToken;

        } catch (error) {
            console.error('Failed to get Cisco access token:', error);
            throw error;
        }
    }

    /**
     * Test API connection
     */
    async testConnection() {
        try {
            const token = await this.getAccessToken();
            
            // Test with a simple API call
            const response = await fetch(`${this.baseUrl}/advisories/v2/advisories?limit=1`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`API test failed: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();
            return {
                success: true,
                message: 'Connection successful',
                testData: data
            };

        } catch (error) {
            return {
                success: false,
                message: error.message,
                error: error
            };
        }
    }

    /**
     * Fetch recent security advisories
     */
    async fetchSecurityAdvisories(options = {}) {
        const {
            startDate = this.getDateDaysAgo(30),
            endDate = new Date().toISOString().split('T')[0],
            limit = 100,
            severity = null
        } = options;

        try {
            const token = await this.getAccessToken();
            
            let url = `${this.baseUrl}/advisories/v2/advisories?startDate=${startDate}&endDate=${endDate}&limit=${limit}`;
            
            if (severity) {
                url += `&severity=${severity}`;
            }

            const response = await this.retryRequest(async () => {
                return await fetch(url, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Accept': 'application/json'
                    }
                });
            });

            if (!response.ok) {
                throw new Error(`Failed to fetch advisories: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();
            return data.advisories || [];

        } catch (error) {
            console.error('Failed to fetch Cisco security advisories:', error);
            throw error;
        }
    }

    /**
     * Fetch CVE details
     */
    async fetchCVEDetails(cveId) {
        try {
            const token = await this.getAccessToken();
            
            const response = await this.retryRequest(async () => {
                return await fetch(`${this.baseUrl}/advisories/v2/cve/${cveId}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Accept': 'application/json'
                    }
                });
            });

            if (!response.ok) {
                throw new Error(`Failed to fetch CVE details: ${response.status} ${response.statusText}`);
            }

            return await response.json();

        } catch (error) {
            console.error(`Failed to fetch CVE details for ${cveId}:`, error);
            throw error;
        }
    }

    /**
     * Transform Cisco advisory data to HexTrackr format
     */
    transformAdvisoryData(advisories, assetMapping = null) {
        return advisories.map(advisory => {
            // Extract CVE from advisory
            const cve = advisory.cves && advisory.cves.length > 0 ? advisory.cves[0] : advisory.advisoryId;
            
            // Map severity
            const severity = this.mapSeverity(advisory.sir);
            
            // Calculate VPR score based on severity and other factors
            const vprScore = this.calculateVPRScore(advisory);
            
            // Determine affected assets (this would typically come from your asset inventory)
            const hostname = this.getHostnameFromAssetMapping(advisory, assetMapping) || 'Unknown Asset';
            const ipAddress = this.getIPFromAssetMapping(advisory, assetMapping) || 'Unknown IP';

            return {
                hostname: hostname,
                ipAddress: ipAddress,
                cve: cve,
                definitionId: advisory.advisoryId,
                definitionName: advisory.advisoryTitle || advisory.summary,
                severity: severity,
                vprScore: vprScore,
                vendor: 'Cisco',
                state: 'ACTIVE',
                date: new Date(advisory.lastUpdated || advisory.publicationUrl).toLocaleDateString(),
                // Additional Cisco-specific fields
                ciscoAdvisory: {
                    id: advisory.advisoryId,
                    firstPublished: advisory.firstPublished,
                    lastUpdated: advisory.lastUpdated,
                    summary: advisory.summary,
                    workarounds: advisory.workarounds,
                    exploitabilityScore: advisory.exploitabilityScore,
                    impactScore: advisory.impactScore,
                    productNames: advisory.productNames,
                    cves: advisory.cves
                }
            };
        });
    }

    /**
     * Map Cisco severity to HexTrackr format
     */
    mapSeverity(sir) {
        if (!sir) return 'info';
        const severity = sir.toLowerCase();
        
        if (severity.includes('critical')) return 'critical';
        if (severity.includes('high')) return 'high';
        if (severity.includes('medium')) return 'medium';
        if (severity.includes('low')) return 'low';
        return 'info';
    }

    /**
     * Calculate VPR score based on Cisco advisory data
     */
    calculateVPRScore(advisory) {
        let score = 0;
        
        // Base score from severity
        const severityScores = {
            'critical': 9.0,
            'high': 7.0,
            'medium': 5.0,
            'low': 3.0
        };
        
        const severity = this.mapSeverity(advisory.sir);
        score = severityScores[severity] || 0;
        
        // Adjust based on exploitability
        if (advisory.exploitabilityScore) {
            score += (advisory.exploitabilityScore / 10);
        }
        
        // Adjust for CVE availability (higher priority if CVE exists)
        if (advisory.cves && advisory.cves.length > 0) {
            score += 0.5;
        }
        
        // Adjust for workarounds (lower priority if workarounds exist)
        if (advisory.workarounds && advisory.workarounds.length > 0) {
            score -= 0.3;
        }
        
        // Ensure score is within bounds
        return Math.min(Math.max(score, 0), 10);
    }

    /**
     * Get hostname from asset mapping (placeholder for asset management integration)
     */
    getHostnameFromAssetMapping(advisory, assetMapping) {
        if (!assetMapping) return null;
        
        // This would typically query your asset management system
        // For now, return a placeholder that could be enhanced
        if (advisory.productNames && advisory.productNames.length > 0) {
            // Try to match product names to known assets
            for (const product of advisory.productNames) {
                if (assetMapping[product]) {
                    return assetMapping[product].hostname;
                }
            }
        }
        
        return null;
    }

    /**
     * Get IP address from asset mapping
     */
    getIPFromAssetMapping(advisory, assetMapping) {
        if (!assetMapping) return null;
        
        const hostname = this.getHostnameFromAssetMapping(advisory, assetMapping);
        if (hostname && assetMapping[hostname]) {
            return assetMapping[hostname].ipAddress;
        }
        
        return null;
    }

    /**
     * Get date X days ago in YYYY-MM-DD format
     */
    getDateDaysAgo(days) {
        const date = new Date();
        date.setDate(date.getDate() - days);
        return date.toISOString().split('T')[0];
    }

    /**
     * Retry mechanism for API requests
     */
    async retryRequest(requestFunction, maxRetries = this.maxRetries) {
        let lastError;
        
        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                const response = await requestFunction();
                
                // Handle rate limiting
                if (response.status === 429) {
                    const retryAfter = response.headers.get('Retry-After') || this.retryDelay;
                    console.warn(`Rate limited, retrying after ${retryAfter}ms...`);
                    await new Promise(resolve => setTimeout(resolve, parseInt(retryAfter) * 1000));
                    continue;
                }
                
                return response;
                
            } catch (error) {
                lastError = error;
                if (attempt < maxRetries) {
                    console.warn(`Attempt ${attempt} failed, retrying in ${this.retryDelay}ms...`);
                    await new Promise(resolve => setTimeout(resolve, this.retryDelay));
                    this.retryDelay *= 2; // Exponential backoff
                }
            }
        }
        
        throw lastError;
    }

    /**
     * Sync vulnerabilities with progress callback
     */
    async syncVulnerabilities(progressCallback = null) {
        try {
            if (progressCallback) progressCallback({ status: 'Authenticating...', progress: 10 });
            
            // Initialize if needed
            if (!this.credentials) {
                await this.initialize();
            }

            if (progressCallback) progressCallback({ status: 'Fetching advisories...', progress: 30 });
            
            // Fetch recent advisories
            const advisories = await this.fetchSecurityAdvisories({
                startDate: this.getDateDaysAgo(30),
                limit: 500 // Increased limit for more comprehensive sync
            });

            if (progressCallback) progressCallback({ status: 'Processing data...', progress: 70 });
            
            // Transform to HexTrackr format
            const vulnerabilities = this.transformAdvisoryData(advisories);

            if (progressCallback) progressCallback({ status: 'Finalizing...', progress: 90 });
            
            // Merge with existing data
            const existingData = JSON.parse(localStorage.getItem('hextrackr_vuln_data') || '[]');
            const mergedData = this.mergeVulnerabilityData(existingData, vulnerabilities);
            
            // Save to storage
            localStorage.setItem('hextrackr_vuln_data', JSON.stringify(mergedData));
            
            if (progressCallback) progressCallback({ status: 'Complete!', progress: 100 });
            
            return {
                success: true,
                newVulnerabilities: vulnerabilities.length,
                totalVulnerabilities: mergedData.length,
                data: mergedData
            };

        } catch (error) {
            if (progressCallback) progressCallback({ status: `Failed: ${error.message}`, progress: 0 });
            throw error;
        }
    }

    /**
     * Merge vulnerability data, avoiding duplicates
     */
    mergeVulnerabilityData(existingData, newData) {
        const merged = new Map();
        
        // Add existing data
        existingData.forEach(item => {
            const key = `${item.hostname}-${item.definitionId || item.cve}`;
            merged.set(key, item);
        });
        
        // Add new data, preferring newer entries
        newData.forEach(item => {
            const key = `${item.hostname}-${item.definitionId || item.cve}`;
            const existing = merged.get(key);
            
            if (!existing || new Date(existing.date) < new Date(item.date)) {
                merged.set(key, item);
            }
        });
        
        return Array.from(merged.values());
    }

    /**
     * Clear stored access token (force re-authentication)
     */
    clearToken() {
        this.accessToken = null;
        this.tokenExpiry = null;
    }

    /**
     * Get API statistics
     */
    async getAPIStatistics() {
        try {
            const token = await this.getAccessToken();
            
            // Get count of recent advisories
            const recentAdvisories = await this.fetchSecurityAdvisories({
                startDate: this.getDateDaysAgo(7),
                limit: 1000
            });

            return {
                recentAdvisories: recentAdvisories.length,
                apiStatus: 'Connected',
                lastCheck: new Date().toISOString(),
                tokenExpiry: this.tokenExpiry
            };

        } catch (error) {
            return {
                recentAdvisories: 0,
                apiStatus: 'Error: ' + error.message,
                lastCheck: new Date().toISOString(),
                tokenExpiry: null
            };
        }
    }
}

// Create global instance
window.ciscoAPIService = new CiscoAPIService();

// Enhanced global functions for UI integration
window.testCiscoAPIEnhanced = async function() {
    const resultDiv = document.getElementById('ciscoTestResult');
    resultDiv.style.display = 'block';
    resultDiv.className = 'alert alert-info';
    resultDiv.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Testing Cisco API connection...';

    try {
        const result = await window.ciscoAPIService.testConnection();
        
        if (result.success) {
            resultDiv.className = 'alert alert-success';
            resultDiv.innerHTML = `
                <i class="fas fa-check-circle me-2"></i>
                <strong>✅ Connection Successful!</strong><br>
                ${result.message}<br>
                <small class="text-muted">API is ready for vulnerability sync</small>
            `;
        } else {
            throw new Error(result.message);
        }
    } catch (error) {
        resultDiv.className = 'alert alert-danger';
        resultDiv.innerHTML = `
            <i class="fas fa-exclamation-triangle me-2"></i>
            <strong>❌ Connection Failed!</strong><br>
            ${error.message}
        `;
    }
};

window.syncCiscoVulnerabilitiesEnhanced = async function() {
    const progressDiv = document.getElementById('syncProgress');
    const statusDiv = document.getElementById('syncStatus');
    const progressBar = progressDiv.querySelector('.progress-bar');

    progressDiv.style.display = 'block';

    try {
        const result = await window.ciscoAPIService.syncVulnerabilities((progress) => {
            progressBar.style.width = progress.progress + '%';
            statusDiv.textContent = progress.status;
        });

        // Update UI with new data
        if (window.vulnData !== undefined) {
            window.vulnData = result.data;
            if (typeof filterAndDisplayData === 'function') {
                filterAndDisplayData();
            }
        }

        setTimeout(() => {
            progressDiv.style.display = 'none';
        }, 2000);

        alert(`✅ Successfully synced ${result.newVulnerabilities} new vulnerabilities from Cisco API!\nTotal vulnerabilities: ${result.totalVulnerabilities}`);

    } catch (error) {
        progressDiv.style.display = 'none';
        alert(`❌ Sync failed: ${error.message}`);
    }
};
