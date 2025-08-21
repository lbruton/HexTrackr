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
     * Get OAuth access token with rate limiting
     */
    async getAccessToken() {
        // Check if current token is still valid
        if (this.accessToken && this.tokenExpiry && new Date() < this.tokenExpiry) {
            return this.accessToken;
        }

        await this.checkRateLimit();

        if (!this.credentials) {
            await this.initialize();
        }

        try {
            const response = await fetch(this.authUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: new URLSearchParams({
                    grant_type: 'client_credentials',
                    client_id: this.credentials.clientId,
                    client_secret: this.credentials.clientSecret
                })
            });

            if (!response.ok) {
                throw new Error(`Authentication failed: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();
            this.accessToken = data.access_token;
            
            // Set expiry time (subtract 5 minutes for safety)
            const expiresIn = (data.expires_in || 3600) - 300;
            this.tokenExpiry = new Date(Date.now() + (expiresIn * 1000));

            console.log('✅ Cisco API access token obtained');
            return this.accessToken;
        } catch (error) {
            console.error('Failed to get Cisco API access token:', error);
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
            await this.checkRateLimit();
            const response = await fetch(`${this.baseUrl}/advisories/cvrf/cve/CVE-2023-20001`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json'
                }
            });

            if (response.ok) {
                console.log('✅ Cisco API connection test successful');
                return { success: true, message: 'Connection successful' };
            } else {
                throw new Error(`API test failed: ${response.status} ${response.statusText}`);
            }
        } catch (error) {
            console.error('❌ Cisco API connection test failed:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Fetch enhanced security advisories with comprehensive data
     */
    async fetchSecurityAdvisories(options = {}) {
        try {
            const token = await this.getAccessToken();
            
            // Build query parameters
            const params = new URLSearchParams({
                format: 'json',
                ...options
            });

            await this.checkRateLimit();
            const response = await this.retryRequest(async () => {
                return fetch(`${this.baseUrl}/advisories/oval?${params}`, {
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
            console.log(`📡 Fetched ${data.advisories?.length || 0} Cisco security advisories`);
            
            return this.enhanceAdvisoryData(data.advisories || []);
        } catch (error) {
            console.error('Failed to fetch Cisco security advisories:', error);
            throw error;
        }
    }

    /**
     * Fetch detailed CVE information with enhanced data
     */
    async fetchCVEDetails(cveId) {
        try {
            const token = await this.getAccessToken();
            
            await this.checkRateLimit();
            const response = await this.retryRequest(async () => {
                return fetch(`${this.baseUrl}/advisories/cvrf/cve/${cveId}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Accept': 'application/json'
                    }
                });
            });

            if (!response.ok) {
                if (response.status === 404) {
                    return null; // CVE not found in Cisco database
                }
                throw new Error(`Failed to fetch CVE details: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();
            return this.enhanceCVEData(data, cveId);
        } catch (error) {
            console.error(`Failed to fetch CVE details for ${cveId}:`, error);
            return null;
        }
    }

    /**
     * Enhance advisory data with additional information and links
     */
    enhanceAdvisoryData(advisories) {
        return advisories.map(advisory => {
            const enhanced = {
                ...advisory,
                // Add documentation links
                ciscoDocsUrl: this.docsUrl,
                advisoryUrl: advisory.advisoryId ? `${this.portalUrl}${advisory.advisoryId}` : null,
                
                // Enhanced metadata
                fetchedAt: new Date().toISOString(),
                source: 'Cisco Security API',
                
                // Add VPR calculation
                vprScore: this.calculateEnhancedVPR(advisory),
                
                // Risk assessment
                riskLevel: this.assessRiskLevel(advisory),
                
                // Remediation timeline
                remediationTimeline: this.getRemediationTimeline(advisory),
                
                // Additional context
                exploitabilityData: this.getExploitabilityData(advisory),
                patchAvailability: this.getPatchAvailability(advisory)
            };

            return enhanced;
        });
    }

    /**
     * Enhance CVE data with comprehensive information
     */
    enhanceCVEData(cveData, cveId) {
        return {
            ...cveData,
            cveId,
            ciscoDocsUrl: this.docsUrl,
            cveUrl: `https://cve.mitre.org/cgi-bin/cvename.cgi?name=${cveId}`,
            nvdUrl: `https://nvd.nist.gov/vuln/detail/${cveId}`,
            ciscoAdvisoryUrl: cveData.advisoryId ? `${this.portalUrl}${cveData.advisoryId}` : null,
            
            // Enhanced analysis
            vprScore: this.calculateEnhancedVPR(cveData),
            riskLevel: this.assessRiskLevel(cveData),
            exploitabilityAnalysis: this.analyzeExploitability(cveData),
            patchStatus: this.analyzePatchStatus(cveData),
            
            // Metadata
            fetchedAt: new Date().toISOString(),
            source: 'Cisco Security API'
        };
    }

    /**
     * Calculate enhanced VPR score with multiple factors
     */
    calculateEnhancedVPR(advisory) {
        let score = 0;
        
        // Base CVSS score
        if (advisory.cvssBaseScore) {
            score += parseFloat(advisory.cvssBaseScore) * 8; // Scale to 80 points max
        }
        
        // Exploit availability bonus
        if (advisory.exploits && advisory.exploits.length > 0) {
            score += 15;
        }
        
        // Age penalty (older vulnerabilities are more likely to be exploited)
        if (advisory.firstPublished) {
            const ageInDays = (Date.now() - new Date(advisory.firstPublished)) / (1000 * 60 * 60 * 24);
            if (ageInDays > 30) score += 5; // Add points for older vulns
        }
        
        // Critical infrastructure bonus
        if (advisory.platformsList && advisory.platformsList.some(p => 
            p.toLowerCase().includes('ios') || p.toLowerCase().includes('router') || p.toLowerCase().includes('switch')
        )) {
            score += 10;
        }
        
        return Math.min(100, Math.max(0, score.toFixed(1)));
    }

    /**
     * Assess overall risk level
     */
    assessRiskLevel(advisory) {
        const vpr = parseFloat(this.calculateEnhancedVPR(advisory));
        const cvss = parseFloat(advisory.cvssBaseScore || 0);
        
        if (vpr >= 90 || cvss >= 9.0) return 'CRITICAL';
        if (vpr >= 70 || cvss >= 7.0) return 'HIGH';
        if (vpr >= 40 || cvss >= 4.0) return 'MEDIUM';
        return 'LOW';
    }

    /**
     * Get remediation timeline based on severity
     */
    getRemediationTimeline(advisory) {
        const risk = this.assessRiskLevel(advisory);
        switch (risk) {
            case 'CRITICAL': return '24-48 hours';
            case 'HIGH': return '1 week';
            case 'MEDIUM': return '1 month';
            case 'LOW': return '3 months';
            default: return 'As resources permit';
        }
    }

    /**
     * Analyze exploitability
     */
    analyzeExploitability(advisory) {
        const analysis = {
            exploitExists: false,
            exploitComplexity: 'UNKNOWN',
            publicExploits: 0,
            exploitMaturity: 'UNKNOWN'
        };
        
        if (advisory.exploits && advisory.exploits.length > 0) {
            analysis.exploitExists = true;
            analysis.publicExploits = advisory.exploits.length;
            analysis.exploitMaturity = 'FUNCTIONAL';
        }
        
        // Check CVSS vector for complexity
        if (advisory.cvssVector) {
            if (advisory.cvssVector.includes('AC:L')) {
                analysis.exploitComplexity = 'LOW';
            } else if (advisory.cvssVector.includes('AC:H')) {
                analysis.exploitComplexity = 'HIGH';
            }
        }
        
        return analysis;
    }

    /**
     * Analyze patch status
     */
    analyzePatchStatus(advisory) {
        return {
            patchAvailable: advisory.status === 'Interim' || advisory.status === 'Final',
            patchDate: advisory.firstFixed || null,
            workaroundAvailable: advisory.workarounds && advisory.workarounds.length > 0,
            updateRequired: true
        };
    }

    /**
     * Get exploitability data
     */
    getExploitabilityData(advisory) {
        return {
            hasExploit: advisory.exploits && advisory.exploits.length > 0,
            exploitCount: advisory.exploits ? advisory.exploits.length : 0,
            exploitTypes: advisory.exploits ? advisory.exploits.map(e => e.type || 'Unknown') : []
        };
    }

    /**
     * Get patch availability information
     */
    getPatchAvailability(advisory) {
        return {
            available: advisory.status === 'Final',
            interim: advisory.status === 'Interim',
            date: advisory.firstFixed,
            version: advisory.fixedInVersion || null
        };
    }

    /**
     * Retry request with exponential backoff
     */
    async retryRequest(requestFunction, maxRetries = this.maxRetries) {
        let lastError;
        
        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                const response = await requestFunction();
                if (response.ok) {
                    return response;
                }
                
                // Don't retry on client errors (4xx)
                if (response.status >= 400 && response.status < 500) {
                    throw new Error(`Client error: ${response.status} ${response.statusText}`);
                }
                
                lastError = new Error(`HTTP ${response.status}: ${response.statusText}`);
            } catch (error) {
                lastError = error;
                
                if (attempt === maxRetries) {
                    break;
                }
                
                // Exponential backoff with jitter
                const delay = this.retryDelay * Math.pow(2, attempt - 1) + Math.random() * 1000;
                console.warn(`🔄 Request failed, retrying in ${Math.round(delay)}ms (attempt ${attempt}/${maxRetries})`);
                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }
        
        throw lastError;
    }

    /**
     * Get API documentation URL
     */
    getDocumentationUrl() {
        return this.docsUrl;
    }

    /**
     * Get rate limit status
     */
    getRateLimitStatus() {
        const now = Date.now();
        const remaining = Math.max(0, this.rateLimit.maxRequests - this.rateLimit.requests);
        const resetIn = Math.max(0, this.rateLimit.resetTime - now);
        
        return {
            requests: this.rateLimit.requests,
            remaining,
            resetIn: Math.ceil(resetIn / 1000),
            maxRequests: this.rateLimit.maxRequests
        };
    }
}

// Make the service globally available
window.CiscoAPIService = CiscoAPIService;
window.ciscoAPI = new CiscoAPIService();
