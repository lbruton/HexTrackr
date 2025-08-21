/**
 * HexTrackr Turso Configuration Manager
 * Handles Turso database configuration, connection setup, and UI integration
 */

class TursoConfigManager {
    constructor() {
        this.modal = null;
        this.config = {
            url: '',
            authToken: ''
        };
        this.isConfigured = false;
        this.setupUI();
    }

    /**
     * Initialize Turso configuration UI
     */
    setupUI() {
        // Create modal HTML if it doesn't exist
        if (!document.getElementById('tursoConfigModal')) {
            this.createConfigModal();
        }
        
        // Load saved configuration
        this.loadSavedConfig();
        
        // Setup event listeners
        this.setupEventListeners();
    }

    /**
     * Create Turso configuration modal
     */
    createConfigModal() {
        const modalHTML = `
        <div class="modal fade" id="tursoConfigModal" tabindex="-1" aria-labelledby="tursoConfigModalLabel" aria-hidden="true">
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="tursoConfigModalLabel">
                            <i class="fas fa-database me-2"></i>Turso Database Configuration
                        </h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <div class="row">
                            <div class="col-md-8">
                                <div class="card">
                                    <div class="card-header">
                                        <h6><i class="fas fa-cog me-2"></i>Database Connection</h6>
                                    </div>
                                    <div class="card-body">
                                        <form id="tursoConfigForm">
                                            <div class="mb-3">
                                                <label for="tursoUrl" class="form-label">
                                                    <i class="fas fa-link me-1"></i>Database URL
                                                </label>
                                                <input type="url" class="form-control" id="tursoUrl" 
                                                       placeholder="libsql://your-database.turso.io"
                                                       required>
                                                <div class="form-text">
                                                    Your Turso database URL (starts with libsql://)
                                                </div>
                                            </div>
                                            <div class="mb-3">
                                                <label for="tursoAuthToken" class="form-label">
                                                    <i class="fas fa-key me-1"></i>Auth Token
                                                </label>
                                                <input type="password" class="form-control" id="tursoAuthToken" 
                                                       placeholder="Enter your Turso auth token"
                                                       required>
                                                <div class="form-text">
                                                    Your Turso authentication token
                                                </div>
                                            </div>
                                        </form>
                                        
                                        <div id="tursoTestResult" class="mt-3" style="display: none;"></div>
                                        
                                        <div class="d-grid gap-2 d-md-flex justify-content-md-end mt-3">
                                            <button class="btn btn-outline-primary me-md-2" onclick="tursoConfigManager.testConnection()">
                                                <i class="fas fa-vial me-1"></i>Test Connection
                                            </button>
                                            <button class="btn btn-success" onclick="tursoConfigManager.saveConfig()">
                                                <i class="fas fa-save me-1"></i>Save Configuration
                                            </button>
                                        </div>
                                    </div>
                                </div>
                                
                                <!-- Database Statistics -->
                                <div class="card mt-3" id="tursoStatsCard" style="display: none;">
                                    <div class="card-header">
                                        <h6><i class="fas fa-chart-bar me-2"></i>Database Statistics</h6>
                                    </div>
                                    <div class="card-body">
                                        <div class="row text-center">
                                            <div class="col-4">
                                                <div class="stat-card">
                                                    <div class="stat-value text-danger" id="tursoVulnCount">0</div>
                                                    <div class="stat-label">Vulnerabilities</div>
                                                </div>
                                            </div>
                                            <div class="col-4">
                                                <div class="stat-card">
                                                    <div class="stat-value text-primary" id="tursoTicketCount">0</div>
                                                    <div class="stat-label">Tickets</div>
                                                </div>
                                            </div>
                                            <div class="col-4">
                                                <div class="stat-card">
                                                    <div class="stat-value text-success" id="tursoLastSync">Never</div>
                                                    <div class="stat-label">Last Sync</div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="col-md-4">
                                <div class="card">
                                    <div class="card-header">
                                        <h6><i class="fas fa-sync me-2"></i>Sync Operations</h6>
                                    </div>
                                    <div class="card-body">
                                        <div class="d-grid gap-2">
                                            <button class="btn btn-outline-primary" onclick="tursoConfigManager.syncVulnerabilities()">
                                                <i class="fas fa-shield-alt me-1"></i>Sync Vulnerabilities
                                            </button>
                                            <button class="btn btn-outline-info" onclick="tursoConfigManager.syncTickets()">
                                                <i class="fas fa-ticket-alt me-1"></i>Sync Tickets
                                            </button>
                                            <button class="btn btn-outline-success" onclick="tursoConfigManager.restoreVulnerabilities()">
                                                <i class="fas fa-download me-1"></i>Restore Vulnerabilities
                                            </button>
                                            <button class="btn btn-outline-warning" onclick="tursoConfigManager.restoreTickets()">
                                                <i class="fas fa-download me-1"></i>Restore Tickets
                                            </button>
                                        </div>
                                        
                                        <!-- Progress indicator -->
                                        <div id="tursoSyncProgress" class="mt-3" style="display: none;">
                                            <div class="progress">
                                                <div class="progress-bar" role="progressbar" style="width: 0%"></div>
                                            </div>
                                            <small class="text-muted" id="tursoSyncStatus">Initializing...</small>
                                        </div>
                                    </div>
                                </div>
                                
                                <div class="card mt-3">
                                    <div class="card-header">
                                        <h6><i class="fas fa-info-circle me-2"></i>Setup Instructions</h6>
                                    </div>
                                    <div class="card-body">
                                        <ol class="small">
                                            <li>Create a Turso account at <a href="https://turso.tech" target="_blank">turso.tech</a></li>
                                            <li>Install Turso CLI: <code>curl -sSfL https://get.tur.so/install.sh | bash</code></li>
                                            <li>Create database: <code>turso db create hextrackr</code></li>
                                            <li>Get URL: <code>turso db show hextrackr --url</code></li>
                                            <li>Create token: <code>turso db tokens create hextrackr</code></li>
                                            <li>Enter the URL and token above</li>
                                        </ol>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-outline-danger" onclick="tursoConfigManager.clearConfig()">
                            <i class="fas fa-trash me-1"></i>Clear Configuration
                        </button>
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                    </div>
                </div>
            </div>
        </div>`;
        
        document.body.insertAdjacentHTML('beforeend', modalHTML);
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Listen for Turso progress updates
        window.addEventListener('tursoProgress', (event) => {
            this.updateProgress(event.detail);
        });

        // Auto-save configuration on form changes
        const form = document.getElementById('tursoConfigForm');
        if (form) {
            form.addEventListener('input', () => {
                // Save to temporary storage
                this.config.url = document.getElementById('tursoUrl').value;
                this.config.authToken = document.getElementById('tursoAuthToken').value;
            });
        }
    }

    /**
     * Load saved configuration from localStorage
     */
    loadSavedConfig() {
        try {
            const saved = localStorage.getItem('hextrackr_turso_config');
            if (saved) {
                this.config = JSON.parse(saved);
                this.isConfigured = this.config.url && this.config.authToken;
                
                // Populate form if modal exists
                const urlInput = document.getElementById('tursoUrl');
                const tokenInput = document.getElementById('tursoAuthToken');
                
                if (urlInput && tokenInput) {
                    urlInput.value = this.config.url;
                    tokenInput.value = this.config.authToken;
                }
                
                // Try to auto-connect if configured
                if (this.isConfigured) {
                    this.initializeConnection();
                }
            }
        } catch (error) {
            console.error('Failed to load Turso configuration:', error);
        }
    }

    /**
     * Open configuration modal
     */
    openModal() {
        const modal = new bootstrap.Modal(document.getElementById('tursoConfigModal'));
        modal.show();
        
        // Load current stats if connected
        if (window.tursoService && window.tursoService.isConnected) {
            this.loadStatistics();
        }
    }

    /**
     * Test database connection
     */
    async testConnection() {
        const url = document.getElementById('tursoUrl').value.trim();
        const authToken = document.getElementById('tursoAuthToken').value.trim();
        const resultDiv = document.getElementById('tursoTestResult');

        if (!url || !authToken) {
            this.showResult(resultDiv, 'error', 'Please enter both URL and auth token');
            return;
        }

        this.showResult(resultDiv, 'info', '<i class="fas fa-spinner fa-spin"></i> Testing connection...');

        try {
            // Test connection using temporary config
            const testService = new TursoService();
            await testService.initialize({ url, authToken });
            
            this.showResult(resultDiv, 'success', '✅ Connection successful! Database is ready to use.');
            document.getElementById('tursoStatsCard').style.display = 'block';
            
            // Load statistics
            const stats = await testService.getStatistics();
            this.updateStatistics(stats);
            
            testService.disconnect();
            
        } catch (error) {
            this.showResult(resultDiv, 'error', `❌ Connection failed: ${error.message}`);
            document.getElementById('tursoStatsCard').style.display = 'none';
        }
    }

    /**
     * Save configuration to localStorage
     */
    async saveConfig() {
        const url = document.getElementById('tursoUrl').value.trim();
        const authToken = document.getElementById('tursoAuthToken').value.trim();

        if (!url || !authToken) {
            alert('Please enter both URL and auth token');
            return;
        }

        try {
            this.config = { url, authToken };
            localStorage.setItem('hextrackr_turso_config', JSON.stringify(this.config));
            this.isConfigured = true;

            // Initialize connection
            await this.initializeConnection();
            
            const resultDiv = document.getElementById('tursoTestResult');
            this.showResult(resultDiv, 'success', '✅ Configuration saved and connected successfully!');
            
        } catch (error) {
            const resultDiv = document.getElementById('tursoTestResult');
            this.showResult(resultDiv, 'error', `❌ Failed to save configuration: ${error.message}`);
        }
    }

    /**
     * Initialize Turso connection
     */
    async initializeConnection() {
        if (!this.isConfigured) return;

        try {
            await window.tursoService.initialize(this.config);
            console.log('🗄️ Turso database connected');
            
            // Update UI if modal is open
            if (document.getElementById('tursoConfigModal').classList.contains('show')) {
                await this.loadStatistics();
            }
            
        } catch (error) {
            console.error('Failed to initialize Turso connection:', error);
        }
    }

    /**
     * Sync vulnerabilities to Turso
     */
    async syncVulnerabilities() {
        if (!window.tursoService || !window.tursoService.isConnected) {
            alert('Please configure and connect to Turso database first');
            return;
        }

        try {
            const vulnData = JSON.parse(localStorage.getItem('hextrackr_vuln_data') || '[]');
            if (vulnData.length === 0) {
                alert('No vulnerability data to sync');
                return;
            }

            this.showProgress('Syncing vulnerabilities...');
            const result = await window.tursoService.syncVulnerabilities(vulnData);
            this.hideProgress();
            
            alert(`✅ Successfully synced ${result.count} vulnerabilities to Turso database`);
            await this.loadStatistics();
            
        } catch (error) {
            this.hideProgress();
            alert(`❌ Failed to sync vulnerabilities: ${error.message}`);
        }
    }

    /**
     * Sync tickets to Turso
     */
    async syncTickets() {
        if (!window.tursoService || !window.tursoService.isConnected) {
            alert('Please configure and connect to Turso database first');
            return;
        }

        try {
            const tickets = JSON.parse(localStorage.getItem('tickets') || '[]');
            if (tickets.length === 0) {
                alert('No ticket data to sync');
                return;
            }

            this.showProgress('Syncing tickets...');
            const result = await window.tursoService.syncTickets(tickets);
            this.hideProgress();
            
            alert(`✅ Successfully synced ${result.count} tickets to Turso database`);
            await this.loadStatistics();
            
        } catch (error) {
            this.hideProgress();
            alert(`❌ Failed to sync tickets: ${error.message}`);
        }
    }

    /**
     * Restore vulnerabilities from Turso
     */
    async restoreVulnerabilities() {
        if (!window.tursoService || !window.tursoService.isConnected) {
            alert('Please configure and connect to Turso database first');
            return;
        }

        try {
            this.showProgress('Restoring vulnerabilities...');
            const vulnerabilities = await window.tursoService.loadVulnerabilities();
            this.hideProgress();

            if (vulnerabilities.length === 0) {
                alert('No vulnerabilities found in database');
                return;
            }

            // Update local storage and UI
            localStorage.setItem('hextrackr_vuln_data', JSON.stringify(vulnerabilities));
            if (window.vulnData !== undefined) {
                window.vulnData = vulnerabilities;
                if (typeof filterAndDisplayData === 'function') {
                    filterAndDisplayData();
                }
            }

            alert(`✅ Successfully restored ${vulnerabilities.length} vulnerabilities from Turso database`);
            
        } catch (error) {
            this.hideProgress();
            alert(`❌ Failed to restore vulnerabilities: ${error.message}`);
        }
    }

    /**
     * Restore tickets from Turso
     */
    async restoreTickets() {
        if (!window.tursoService || !window.tursoService.isConnected) {
            alert('Please configure and connect to Turso database first');
            return;
        }

        try {
            this.showProgress('Restoring tickets...');
            const tickets = await window.tursoService.loadTickets();
            this.hideProgress();

            if (tickets.length === 0) {
                alert('No tickets found in database');
                return;
            }

            // Update local storage and UI
            localStorage.setItem('tickets', JSON.stringify(tickets));
            if (window.tickets !== undefined) {
                window.tickets = tickets;
                if (typeof renderTickets === 'function') {
                    renderTickets();
                }
            }

            alert(`✅ Successfully restored ${tickets.length} tickets from Turso database`);
            
        } catch (error) {
            this.hideProgress();
            alert(`❌ Failed to restore tickets: ${error.message}`);
        }
    }

    /**
     * Load and display database statistics
     */
    async loadStatistics() {
        if (!window.tursoService || !window.tursoService.isConnected) return;

        try {
            const stats = await window.tursoService.getStatistics();
            this.updateStatistics(stats);
        } catch (error) {
            console.error('Failed to load Turso statistics:', error);
        }
    }

    /**
     * Update statistics display
     */
    updateStatistics(stats) {
        document.getElementById('tursoVulnCount').textContent = stats.vulnerabilities.toLocaleString();
        document.getElementById('tursoTicketCount').textContent = stats.tickets.toLocaleString();
        
        const lastSync = stats.lastSync.vulnerabilities || stats.lastSync.tickets;
        if (lastSync) {
            const syncDate = new Date(lastSync);
            document.getElementById('tursoLastSync').textContent = syncDate.toLocaleDateString();
        }
    }

    /**
     * Show operation progress
     */
    showProgress(message) {
        const progressDiv = document.getElementById('tursoSyncProgress');
        const statusDiv = document.getElementById('tursoSyncStatus');
        const progressBar = progressDiv.querySelector('.progress-bar');
        
        progressDiv.style.display = 'block';
        statusDiv.textContent = message;
        progressBar.style.width = '10%';
    }

    /**
     * Update progress
     */
    updateProgress(detail) {
        const progressDiv = document.getElementById('tursoSyncProgress');
        const statusDiv = document.getElementById('tursoSyncStatus');
        const progressBar = progressDiv.querySelector('.progress-bar');
        
        if (progressDiv.style.display !== 'none') {
            progressBar.style.width = detail.progress + '%';
            statusDiv.textContent = `${detail.operation}: ${detail.current}/${detail.total}`;
        }
    }

    /**
     * Hide progress indicator
     */
    hideProgress() {
        setTimeout(() => {
            document.getElementById('tursoSyncProgress').style.display = 'none';
        }, 1000);
    }

    /**
     * Show result message
     */
    showResult(element, type, message) {
        element.style.display = 'block';
        element.className = `alert alert-${type === 'error' ? 'danger' : type}`;
        element.innerHTML = message;
    }

    /**
     * Clear configuration
     */
    clearConfig() {
        if (confirm('Are you sure you want to clear the Turso configuration?')) {
            localStorage.removeItem('hextrackr_turso_config');
            this.config = { url: '', authToken: '' };
            this.isConfigured = false;
            
            document.getElementById('tursoUrl').value = '';
            document.getElementById('tursoAuthToken').value = '';
            document.getElementById('tursoTestResult').style.display = 'none';
            document.getElementById('tursoStatsCard').style.display = 'none';
            
            if (window.tursoService) {
                window.tursoService.disconnect();
            }
            
            alert('Turso configuration cleared');
        }
    }
}

// Create global instance
window.tursoConfigManager = new TursoConfigManager();

// Auto-initialize on DOM load
document.addEventListener('DOMContentLoaded', () => {
    if (window.tursoConfigManager) {
        window.tursoConfigManager.setupUI();
    }
});
