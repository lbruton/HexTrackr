/**
 * Cisco DNA Center (DNAC) API Integration Service
 * Comprehensive DNAC API client for HexTrackr
 * Version: 1.0.0
 */

class DNACApiService {
    constructor() {
        this.baseUrl = '';
        this.username = '';
        this.password = '';
        this.token = null;
        this.tokenExpiry = null;
        this.isConnected = false;
        this.rateLimitDelay = 1000; // 1 second between API calls
        this.lastApiCall = 0;
        
        // Load saved configuration
        this.loadConfiguration();
    }

    /**
     * Load configuration from localStorage
     */
    loadConfiguration() {
        try {
            const config = JSON.parse(localStorage.getItem('dnac_config') || '{}');
            this.baseUrl = config.baseUrl || '';
            this.username = config.username || '';
            this.password = config.password || '';
            
            console.log('📋 DNAC configuration loaded');
        } catch (error) {
            console.error('❌ Error loading DNAC configuration:', error);
        }
    }

    /**
     * Save configuration to localStorage
     */
    saveConfiguration() {
        try {
            const config = {
                baseUrl: this.baseUrl,
                username: this.username,
                password: this.password
            };
            localStorage.setItem('dnac_config', JSON.stringify(config));
            console.log('💾 DNAC configuration saved');
        } catch (error) {
            console.error('❌ Error saving DNAC configuration:', error);
        }
    }

    /**
     * Configure DNAC connection
     */
    configure(baseUrl, username, password) {
        this.baseUrl = baseUrl.replace(/\/$/, ''); // Remove trailing slash
        this.username = username;
        this.password = password;
        this.saveConfiguration();
        
        console.log('🔧 DNAC configured:', this.baseUrl);
    }

    /**
     * Rate limiting helper
     */
    async rateLimitedCall() {
        const now = Date.now();
        const timeSinceLastCall = now - this.lastApiCall;
        
        if (timeSinceLastCall < this.rateLimitDelay) {
            const waitTime = this.rateLimitDelay - timeSinceLastCall;
            console.log(`⏱️ Rate limiting: waiting ${waitTime}ms`);
            await new Promise(resolve => setTimeout(resolve, waitTime));
        }
        
        this.lastApiCall = Date.now();
    }

    /**
     * Authenticate with DNAC and get token
     */
    async authenticate() {
        try {
            if (!this.baseUrl || !this.username || !this.password) {
                throw new Error('DNAC credentials not configured');
            }

            await this.rateLimitedCall();

            const authUrl = `${this.baseUrl}/dna/system/api/v1/auth/token`;
            const credentials = btoa(`${this.username}:${this.password}`);

            console.log('🔐 Authenticating with DNAC...');

            const response = await fetch(authUrl, {
                method: 'POST',
                headers: {
                    'Authorization': `Basic ${credentials}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`Authentication failed: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();
            this.token = data.Token;
            this.tokenExpiry = Date.now() + (3600 * 1000); // Token valid for 1 hour
            this.isConnected = true;

            console.log('✅ DNAC authentication successful');
            return { success: true, message: 'Successfully authenticated with DNAC' };

        } catch (error) {
            console.error('❌ DNAC authentication failed:', error);
            this.isConnected = false;
            return { success: false, error: error.message };
        }
    }

    /**
     * Check if token is valid and refresh if needed
     */
    async ensureAuthenticated() {
        if (!this.token || Date.now() >= this.tokenExpiry) {
            console.log('🔄 Token expired, re-authenticating...');
            return await this.authenticate();
        }
        return { success: true };
    }

    /**
     * Make authenticated API request to DNAC
     */
    async makeApiRequest(endpoint, method = 'GET', body = null) {
        try {
            const authResult = await this.ensureAuthenticated();
            if (!authResult.success) {
                throw new Error('Authentication required');
            }

            await this.rateLimitedCall();

            const url = `${this.baseUrl}/dna/intent/api/v1${endpoint}`;
            const options = {
                method,
                headers: {
                    'X-Auth-Token': this.token,
                    'Content-Type': 'application/json'
                }
            };

            if (body && method !== 'GET') {
                options.body = JSON.stringify(body);
            }

            console.log(`🌐 DNAC API: ${method} ${endpoint}`);
            const response = await fetch(url, options);

            if (!response.ok) {
                throw new Error(`API request failed: ${response.status} ${response.statusText}`);
            }

            return await response.json();

        } catch (error) {
            console.error(`❌ DNAC API request failed:`, error);
            throw error;
        }
    }

    /**
     * Get all network devices
     */
    async getNetworkDevices() {
        try {
            console.log('📊 Fetching network devices from DNAC...');
            const data = await this.makeApiRequest('/network-device');
            
            const devices = data.response || [];
            console.log(`✅ Retrieved ${devices.length} network devices`);
            
            return {
                success: true,
                data: devices.map(device => ({
                    id: device.id,
                    hostname: device.hostname,
                    managementIpAddress: device.managementIpAddress,
                    platformId: device.platformId,
                    softwareType: device.softwareType,
                    softwareVersion: device.softwareVersion,
                    role: device.role,
                    family: device.family,
                    type: device.type,
                    macAddress: device.macAddress,
                    serialNumber: device.serialNumber,
                    upTime: device.upTime,
                    reachabilityStatus: device.reachabilityStatus,
                    lastUpdated: device.lastUpdated
                })),
                count: devices.length
            };

        } catch (error) {
            console.error('❌ Error fetching network devices:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Get network topology
     */
    async getNetworkTopology() {
        try {
            console.log('🗺️ Fetching network topology from DNAC...');
            const data = await this.makeApiRequest('/topology/physical-topology');
            
            console.log('✅ Network topology retrieved');
            return {
                success: true,
                data: data.response || {},
                nodes: data.response?.nodes || [],
                links: data.response?.links || []
            };

        } catch (error) {
            console.error('❌ Error fetching network topology:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Get device health
     */
    async getDeviceHealth(deviceId = null) {
        try {
            let endpoint = '/device-health';
            if (deviceId) {
                endpoint += `?deviceId=${deviceId}`;
            }

            console.log('🏥 Fetching device health from DNAC...');
            const data = await this.makeApiRequest(endpoint);
            
            const healthData = data.response || [];
            console.log(`✅ Retrieved health data for ${healthData.length} devices`);
            
            return {
                success: true,
                data: healthData.map(device => ({
                    deviceId: device.deviceId,
                    deviceFamily: device.deviceFamily,
                    name: device.name,
                    healthScore: device.healthScore,
                    issueCount: device.issueCount,
                    location: device.location,
                    deviceType: device.deviceType,
                    osType: device.osType,
                    interfaceStats: device.interfaceStats,
                    cpuHealth: device.cpuHealth,
                    memoryUtilization: device.memoryUtilization,
                    lastUpdated: device.lastUpdated
                })),
                count: healthData.length
            };

        } catch (error) {
            console.error('❌ Error fetching device health:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Get security advisories
     */
    async getSecurityAdvisories() {
        try {
            console.log('🔒 Fetching security advisories from DNAC...');
            const data = await this.makeApiRequest('/security-advisory');
            
            const advisories = data.response || [];
            console.log(`✅ Retrieved ${advisories.length} security advisories`);
            
            return {
                success: true,
                data: advisories.map(advisory => ({
                    advisoryId: advisory.advisoryId,
                    sir: advisory.sir,
                    firstPublished: advisory.firstPublished,
                    lastUpdated: advisory.lastUpdated,
                    cves: advisory.cves,
                    bugIDs: advisory.bugIDs,
                    cvssBaseScore: advisory.cvssBaseScore,
                    advisoryTitle: advisory.advisoryTitle,
                    publicationUrl: advisory.publicationUrl,
                    summary: advisory.summary
                })),
                count: advisories.length
            };

        } catch (error) {
            console.error('❌ Error fetching security advisories:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Get compliance details
     */
    async getComplianceDetails() {
        try {
            console.log('📋 Fetching compliance details from DNAC...');
            const data = await this.makeApiRequest('/compliance');
            
            const compliance = data.response || [];
            console.log(`✅ Retrieved compliance data for ${compliance.length} devices`);
            
            return {
                success: true,
                data: compliance.map(item => ({
                    deviceUuid: item.deviceUuid,
                    complianceType: item.complianceType,
                    status: item.status,
                    lastSyncTime: item.lastSyncTime,
                    categories: item.categories
                })),
                count: compliance.length
            };

        } catch (error) {
            console.error('❌ Error fetching compliance details:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Get site information
     */
    async getSites() {
        try {
            console.log('🏢 Fetching sites from DNAC...');
            const data = await this.makeApiRequest('/site');
            
            const sites = data.response || [];
            console.log(`✅ Retrieved ${sites.length} sites`);
            
            return {
                success: true,
                data: sites.map(site => ({
                    id: site.id,
                    name: site.name,
                    parentId: site.parentId,
                    groupTypeList: site.groupTypeList,
                    groupHierarchy: site.groupHierarchy,
                    additionalInfo: site.additionalInfo
                })),
                count: sites.length
            };

        } catch (error) {
            console.error('❌ Error fetching sites:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Sync all DNAC data and correlate with vulnerabilities
     */
    async syncAllData() {
        try {
            console.log('🔄 Starting comprehensive DNAC data sync...');
            
            const results = {
                devices: await this.getNetworkDevices(),
                health: await this.getDeviceHealth(),
                advisories: await this.getSecurityAdvisories(),
                compliance: await this.getComplianceDetails(),
                sites: await this.getSites(),
                topology: await this.getNetworkTopology()
            };

            // Correlate with existing vulnerability data
            if (window.vulnData && results.devices.success) {
                console.log('🔗 Correlating DNAC devices with vulnerability data...');
                
                const correlatedData = results.devices.data.map(device => {
                    const relatedVulns = window.vulnData.filter(vuln => 
                        vuln.hostname === device.hostname || 
                        vuln.ipAddress === device.managementIpAddress
                    );
                    
                    return {
                        ...device,
                        vulnerabilityCount: relatedVulns.length,
                        criticalVulns: relatedVulns.filter(v => v.severity === 'critical').length,
                        highVulns: relatedVulns.filter(v => v.severity === 'high').length,
                        relatedVulnerabilities: relatedVulns
                    };
                });

                results.correlatedDevices = {
                    success: true,
                    data: correlatedData,
                    count: correlatedData.length
                };
            }

            const totalItems = Object.values(results).reduce((sum, result) => 
                sum + (result.success ? result.count || 0 : 0), 0
            );

            console.log(`✅ DNAC sync completed: ${totalItems} total items retrieved`);
            
            return {
                success: true,
                message: `Successfully synced ${totalItems} items from DNAC`,
                results,
                timestamp: new Date().toISOString()
            };

        } catch (error) {
            console.error('❌ DNAC sync failed:', error);
            return {
                success: false,
                error: error.message,
                timestamp: new Date().toISOString()
            };
        }
    }

    /**
     * Test DNAC connection
     */
    async testConnection() {
        try {
            console.log('🧪 Testing DNAC connection...');
            
            const authResult = await this.authenticate();
            if (!authResult.success) {
                throw new Error(authResult.error);
            }

            // Test basic API call
            const testResult = await this.makeApiRequest('/network-device?limit=1');
            
            console.log('✅ DNAC connection test successful');
            return {
                success: true,
                message: 'DNAC connection successful',
                serverVersion: testResult.version || 'Unknown',
                timestamp: new Date().toISOString()
            };

        } catch (error) {
            console.error('❌ DNAC connection test failed:', error);
            return {
                success: false,
                error: error.message,
                timestamp: new Date().toISOString()
            };
        }
    }

    /**
     * Get connection status
     */
    getStatus() {
        return {
            connected: this.isConnected,
            baseUrl: this.baseUrl,
            username: this.username,
            hasToken: !!this.token,
            tokenExpiry: this.tokenExpiry ? new Date(this.tokenExpiry).toISOString() : null
        };
    }
}

// Create global instance
window.dnacService = new DNACApiService();

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DNACApiService;
}

console.log('🚀 DNAC API Service loaded successfully');
