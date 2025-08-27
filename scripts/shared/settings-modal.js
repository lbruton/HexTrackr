/**
 * HexTrackr - Shared Settings Modal Component
 * 
 * 🎯 SHARED COMPONENT PATTERN
 * 
 * This file contains the unified Settings modal functionality that is shared
 * across all HexTrackr pages, following our CSS modular architecture pattern:
 * 
 * scripts/
 * ├── shared/
 * │   ├── settings-modal.js     # This file - shared Settings modal
 * │   ├── navigation.js         # Shared header/navigation components
 * │   └── toast-notifications.js # Shared notification system
 * ├── pages/
 * │   ├── tickets.js           # Ticket-specific functionality
 * │   └── vulnerabilities.js   # Vulnerability-specific functionality
 * └── utils/
 *     ├── api-client.js        # Shared API utilities
 *     └── data-formatters.js   # Shared formatting utilities
 * 
 * @file settings-modal.js
 * @description Unified Settings modal functionality for all HexTrackr pages
 * @version 2.0.0
 * @author HexTrackr Development Team
 * @since 2025-08-26
 * 
 * Dependencies:
 * - Bootstrap 5 (modals, tabs)
 * - Tabler.io CSS Framework
 * 
 * @example
 * // Include in any page:
 * <script src="scripts/shared/settings-modal.js"></script>
 * 
 * // The modal will automatically initialize and be available
 * // All functions are global and work consistently across pages
 */

// 🚀 HEXTRACKR SETTINGS MODAL - SHARED COMPONENT
console.log('✅ HexTrackr Settings Modal (shared) loaded successfully');

/**
 * Settings Modal State Management
 */
// HexTrackr Shared Settings Modal Component
(function() {
  'use strict';
  
  const SettingsModal = {
    // Initialize the settings modal
    async init() {
      try {
        await this.loadModalHtml();
        this.setupEventListeners();
        initServiceNowSettings(); // Call as standalone function instead of method
        console.log('Settings modal initialized');
      } catch (error) {
        console.error('Failed to initialize settings modal:', error);
      }
    },

    // Load the modal HTML from shared file
    async loadModalHtml() {
      try {
        const response = await fetch('scripts/shared/settings-modal.html');
        if (!response.ok) {
          throw new Error(`Failed to load settings modal: ${response.status}`);
        }
        
        const modalHtml = await response.text();
        
        // Find the modal container or create one if it doesn't exist
        let modalContainer = document.getElementById('settingsModalContainer');
        if (!modalContainer) {
          modalContainer = document.createElement('div');
          modalContainer.id = 'settingsModalContainer';
          document.body.appendChild(modalContainer);
        }
        
        // Inject the modal HTML
        modalContainer.innerHTML = modalHtml;
        
        // Get reference to the modal element for Bootstrap
        this.modal = document.getElementById('settingsModal');
        
        console.log('✅ HexTrackr Settings Modal (shared) loaded successfully');
        
      } catch (error) {
        console.error('❌ Failed to load shared settings modal:', error);
        throw error;
      }
    },
    
    /**
     * Setup all event listeners for the Settings modal
     */
    setupEventListeners() {
        // Handle tab switching from dropdown links
        document.addEventListener('click', (e) => {
            const target = e.target.closest('[data-settings-tab]');
            if (target) {
                const tabId = target.getAttribute('data-settings-tab');
                this.switchToTab(tabId);
            }
        });
        
        // Refresh stats when modal is shown
        this.modal.addEventListener('shown.bs.modal', refreshStats);
        
        // API test buttons
        document.getElementById('testCiscoConnection')?.addEventListener('click', testCiscoConnection);
        document.getElementById('testTenableConnection')?.addEventListener('click', testTenableConnection);
        
        // Data fetch buttons
        document.getElementById('fetchCiscoData')?.addEventListener('click', fetchCiscoData);
        document.getElementById('fetchTenableData')?.addEventListener('click', fetchTenableData);
        
        // Settings save button
        document.getElementById('saveSettings')?.addEventListener('click', saveSettings);
        
        // CSV Import buttons
        document.getElementById('importTicketsCSV')?.addEventListener('click', () => importCSV('tickets'));
        document.getElementById('importVulnerabilitiesCSV')?.addEventListener('click', () => importCSV('vulnerabilities'));
        
        // Initialize ServiceNow settings when modal is shown
        this.modal.addEventListener('shown.bs.modal', initServiceNowSettings);
        
        console.log('Settings modal event listeners configured');
    },
    
    /**
     * Switch to a specific tab in the settings modal
     * @param {string} tabId - The ID of the tab to switch to
     */
    switchToTab(tabId) {
        // Deactivate all tabs
        document.querySelectorAll('#settingsModal .nav-link').forEach(tab => {
            tab.classList.remove('active');
            tab.setAttribute('aria-selected', 'false');
        });
        
        document.querySelectorAll('#settingsModal .tab-pane').forEach(pane => {
            pane.classList.remove('show', 'active');
        });
        
        // Activate the target tab
        const targetTab = document.getElementById(tabId + '-tab');
        const targetPane = document.getElementById(tabId);
        
        if (targetTab && targetPane) {
            targetTab.classList.add('active');
            targetTab.setAttribute('aria-selected', 'true');
            targetPane.classList.add('show', 'active');
            console.log(`✅ Switched to ${tabId} tab`);
        } else {
            console.warn(`❌ Tab ${tabId} not found`);
        }
    }
};

/**
 * Refresh database statistics for the Settings modal
 * @returns {Promise<void>}
 */
async function refreshStats() {
    try {
        const response = await fetch('/api/backup/stats');
        const stats = await response.json();
        
        // Update counters
        const ticketCountEl = document.getElementById('ticketCount');
        const vulnCountEl = document.getElementById('vulnCount');
        const totalCountEl = document.getElementById('totalCount');
        const dbSizeEl = document.getElementById('dbSize');
        
        if (ticketCountEl) ticketCountEl.textContent = stats.tickets || 0;
        if (vulnCountEl) vulnCountEl.textContent = stats.vulnerabilities || 0;
        if (totalCountEl) totalCountEl.textContent = stats.total || 0;
        
        // Format database size
        if (dbSizeEl) {
            const dbSize = stats.dbSize || 0;
            let sizeStr = dbSize < 1024 ? `${dbSize} B` :
                         dbSize < 1024 * 1024 ? `${(dbSize / 1024).toFixed(1)} KB` :
                         `${(dbSize / (1024 * 1024)).toFixed(1)} MB`;
            dbSizeEl.textContent = sizeStr;
        }
    } catch (error) {
        console.error('Error fetching stats:', error);
        showNotification('Error loading statistics', 'danger');
    }
}

/**
 * Export data as CSV for specified type
 * @param {string} type - Type of data to export ('tickets', 'vulnerabilities', 'all')
 * @returns {Promise<void>}
 */
async function exportData(type) {
    try {
        let endpoint = '/api/backup/';
        switch(type) {
            case 'tickets':
                endpoint += 'tickets';
                break;
            case 'vulnerabilities':
                endpoint += 'vulnerabilities';
                break;
            case 'all':
                endpoint += 'all';
                break;
            default:
                throw new Error('Invalid export type');
        }
        
        const response = await fetch(endpoint);
        if (response.ok) {
            const data = await response.json();
            
            // Create CSV export based on type
            const timestamp = new Date().toISOString().split('T')[0];
            
            if (type === 'all') {
                // Export combined CSV for all data
                await exportCombinedCSV(data, timestamp);
            } else {
                // Export single CSV file
                await exportSingleCSV(data, type, timestamp);
            }
            
        } else {
            throw new Error('Export failed');
        }
    } catch (error) {
        console.error('Error creating export:', error);
        showNotification(`Export failed: ${error.message}`, 'danger');
    }
}

/**
 * Export single data type as CSV
 */
async function exportSingleCSV(data, type, timestamp) {
    if (!data.data || data.data.length === 0) {
        showNotification(`No ${type} data to export`, 'warning');
        return;
    }
    
    // Convert to CSV using Papa Parse
    const csv = Papa.unparse(data.data);
    const filename = `hextrackr_${type}_${timestamp}.csv`;
    
    // Download CSV file
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    downloadFile(blob, filename);
    
    showNotification(`CSV export created: ${filename}`, 'success');
}

/**
 * Export all data as combined CSV
 */
async function exportCombinedCSV(data, timestamp) {
    let combinedData = [];
    
    // Add vulnerabilities with type indicator
    if (data.vulnerabilities && data.vulnerabilities.data) {
        data.vulnerabilities.data.forEach(item => {
            combinedData.push({ data_type: 'vulnerability', ...item });
        });
    }
    
    // Add tickets with type indicator
    if (data.tickets && data.tickets.data) {
        data.tickets.data.forEach(item => {
            combinedData.push({ data_type: 'ticket', ...item });
        });
    }
    
    if (combinedData.length === 0) {
        showNotification('No data to export', 'warning');
        return;
    }
    
    const csv = Papa.unparse(combinedData);
    const filename = `hextrackr_all_data_${timestamp}.csv`;
    
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    downloadFile(blob, filename);
    
    showNotification(`Combined CSV export created: ${filename}`, 'success');
}

/**
 * Utility function to download a file
 * @param {Blob} blob - File blob to download
 * @param {string} filename - Name of the file
 */
function downloadFile(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

/**
 * Create ZIP backup of specified data type with JSON content
 * @param {string} type - Type of data to backup
 * @returns {Promise<void>}
 */
async function backupData(type) {
    try {
        const zip = new JSZip();
        const timestamp = new Date().toISOString().split('T')[0];
        
        // Create metadata
        const metadata = {
            backup_type: type,
            created_at: new Date().toISOString(),
            schema_version: "1.0",
            application: "HexTrackr",
            version: "2.3"
        };
        
        if (type === 'all') {
            // Fetch all data types
            const [ticketsRes, vulnsRes, statsRes] = await Promise.all([
                fetch('/api/backup/tickets'),
                fetch('/api/backup/vulnerabilities'),
                fetch('/api/backup/stats')
            ]);
            
            if (ticketsRes.ok && vulnsRes.ok && statsRes.ok) {
                const ticketsData = await ticketsRes.json();
                const vulnsData = await vulnsRes.json();
                const statsData = await statsRes.json();
                
                // Add files to ZIP
                zip.file('tickets.json', JSON.stringify(ticketsData, null, 2));
                zip.file('vulnerabilities.json', JSON.stringify(vulnsData, null, 2));
                zip.file('statistics.json', JSON.stringify(statsData, null, 2));
                zip.file('metadata.json', JSON.stringify(metadata, null, 2));
                
                metadata.contents = {
                    tickets: ticketsData.count || 0,
                    vulnerabilities: vulnsData.count || 0,
                    total_records: (ticketsData.count || 0) + (vulnsData.count || 0)
                };
            }
        } else {
            // Single data type backup
            const response = await fetch(`/api/backup/${type}`);
            if (response.ok) {
                const data = await response.json();
                zip.file(`${type}.json`, JSON.stringify(data, null, 2));
                metadata.contents = { [type]: data.count || 0 };
            } else {
                throw new Error(`Failed to fetch ${type} data`);
            }
        }
        
        // Update metadata and add to ZIP
        zip.file('metadata.json', JSON.stringify(metadata, null, 2));
        
        // Generate ZIP file
        const zipBlob = await zip.generateAsync({ type: 'blob' });
        
        // Create download
        const filename = `hextrackr_backup_${type}_${timestamp}.zip`;
        const url = URL.createObjectURL(zipBlob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        showNotification(`ZIP backup created: ${filename}`, 'success');
        
    } catch (error) {
        console.error('Error creating ZIP backup:', error);
        showNotification(`ZIP backup failed: ${error.message}`, 'danger');
    }
}

/**
 * Import data from file
 * @param {string} type - Type of data to import ('tickets', 'vulnerabilities', 'all')
 * @returns {Promise<void>}
 */
async function importData(type) {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json,.csv';
    
    input.onchange = async function(event) {
        const file = event.target.files[0];
        if (!file) return;
        
        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('type', type);
            
            const response = await fetch('/api/import', {
                method: 'POST',
                body: formData
            });
            
            if (response.ok) {
                const result = await response.json();
                showNotification(`Import successful: ${result.message}`, 'success');
                await refreshStats();
                
                // Trigger page-specific refresh if available
                if (window.refreshPageData) {
                    window.refreshPageData(type);
                }
            } else {
                const error = await response.json();
                throw new Error(error.message || 'Import failed');
            }
        } catch (error) {
            console.error('Error importing data:', error);
            showNotification(`Import failed: ${error.message}`, 'danger');
        }
    };
    
    input.click();
}

/**
 * Clear specified data type with confirmation
 * @param {string} type - Type of data to clear ('tickets', 'vulnerabilities', 'all')
 * @returns {Promise<void>}
 */
async function clearData(type) {
    const confirmText = type.toUpperCase();
    const confirmed = await showClearConfirmationModal(type, confirmText);
    
    if (!confirmed) return;
    
    try {
        const response = await fetch(`/api/backup/clear/${type}`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            const result = await response.json();
            showNotification(result.message, 'success');
            
            // Refresh statistics
            await refreshStats();
            
            // Trigger page-specific refresh if available
            if (window.refreshPageData) {
                window.refreshPageData(type);
            }
        } else {
            throw new Error('Clear operation failed');
        }
    } catch (error) {
        console.error('Error clearing data:', error);
        showNotification(`Error clearing data: ${error.message}`, 'danger');
    }
}

/**
 * Show confirmation modal for data clearing
 * @param {string} type - Type of data being cleared
 * @param {string} confirmText - Text that must be typed to confirm
 * @returns {Promise<boolean>} True if confirmed, false otherwise
 */
function showClearConfirmationModal(type, confirmText) {
    return new Promise((resolve) => {
        const modal = document.createElement('div');
        modal.className = 'modal fade';
        modal.innerHTML = `
            <div class="modal-dialog modal-dialog-centered">
                <div class="modal-content">
                    <div class="modal-header bg-danger text-white">
                        <h5 class="modal-title">
                            <i class="fas fa-exclamation-triangle me-2"></i>
                            Confirm Clear ${type.charAt(0).toUpperCase() + type.slice(1)}
                        </h5>
                        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <div class="alert alert-danger">
                            <strong>Warning:</strong> This action cannot be undone. All ${type} data will be permanently deleted.
                        </div>
                        <p>To confirm, type <strong>${confirmText}</strong> in the field below:</p>
                        <input type="text" class="form-control" id="confirmInput" placeholder="Type ${confirmText} to confirm">
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                        <button type="button" class="btn btn-danger" id="confirmBtn" disabled>Clear Data</button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        const bsModal = new bootstrap.Modal(modal);
        const confirmInput = modal.querySelector('#confirmInput');
        const confirmBtn = modal.querySelector('#confirmBtn');
        
        confirmInput.addEventListener('input', () => {
            if (confirmInput.value === confirmText) {
                confirmBtn.disabled = false;
                confirmBtn.classList.remove('disabled');
            } else {
                confirmBtn.disabled = true;
                confirmBtn.classList.add('disabled');
            }
        });
        
        confirmBtn.addEventListener('click', () => {
            if (confirmInput.value === confirmText) {
                bsModal.hide();
                resolve(true);
            }
        });
        
        modal.addEventListener('hidden.bs.modal', () => {
            document.body.removeChild(modal);
            resolve(false);
        });
        
        bsModal.show();
        confirmInput.focus();
    });
}

// API Test Functions (stubs for now)
/**
 * Test Cisco PSIRT API connection
 * @returns {Promise<void>}
 */
async function testCiscoConnection() {
    showNotification('Cisco API connectivity test - feature coming soon', 'info');
    // TODO: Implement actual Cisco PSIRT API test
    document.getElementById('ciscoStatus').textContent = 'Testing...';
    document.getElementById('ciscoStatus').className = 'badge bg-warning';
    
    setTimeout(() => {
        document.getElementById('ciscoStatus').textContent = 'Not Configured';
        document.getElementById('ciscoStatus').className = 'badge bg-secondary';
    }, 2000);
}

/**
 * Test Tenable API connection
 * @returns {Promise<void>}
 */
async function testTenableConnection() {
    showNotification('Tenable API connectivity test - feature coming soon', 'info');
    // TODO: Implement actual Tenable API test
    document.getElementById('tenableStatus').textContent = 'Testing...';
    document.getElementById('tenableStatus').className = 'badge bg-warning';
    
    setTimeout(() => {
        document.getElementById('tenableStatus').textContent = 'Not Configured';
        document.getElementById('tenableStatus').className = 'badge bg-secondary';
    }, 2000);
}

/**
 * Fetch data from Cisco PSIRT API
 * @returns {Promise<void>}
 */
async function fetchCiscoData() {
    showNotification('Cisco data fetch - feature coming soon', 'info');
    // TODO: Implement actual Cisco PSIRT data fetch
}

/**
 * Fetch data from Tenable API
 * @returns {Promise<void>}
 */
async function fetchTenableData() {
    showNotification('Tenable data fetch - feature coming soon', 'info');
    // TODO: Implement actual Tenable data fetch
}

/**
 * Save Settings modal configuration
 * @returns {Promise<void>}
 */
async function saveSettings() {
    try {
        // Collect all settings from the modal
        const settings = {
            // API Configuration
            apiEndpoint: document.getElementById('apiEndpoint')?.value || '',
            refreshInterval: parseInt(document.getElementById('refreshInterval')?.value) || 30,
            apiKey: document.getElementById('apiKey')?.value || '',
            enableApiAuth: document.getElementById('enableApiAuth')?.checked || false,
            
            // ServiceNow Configuration
            enableServiceNow: document.getElementById('enableServiceNow')?.checked || false,
            serviceNowUrl: document.getElementById('serviceNowUrl')?.value || '',
            
            // Save timestamp
            lastSaved: new Date().toISOString()
        };

        // Save to localStorage
        localStorage.setItem('hextrackr-settings', JSON.stringify(settings));
        
        // Try to save to server as well (if API is available)
        try {
            const response = await fetch('/api/settings', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(settings)
            });
            
            if (response.ok) {
                console.log('✅ Settings saved to server successfully');
            } else {
                console.log('⚠️ Server save failed, using localStorage only');
            }
        } catch (apiError) {
            console.log('⚠️ Server not available, using localStorage only');
        }
        
        // Update ServiceNow integration status
        updateServiceNowStatus();
        
        // Show success notification
        showNotification('Settings saved successfully!', 'success');
        
        // Close the modal
        const settingsModal = bootstrap.Modal.getInstance(document.getElementById('settingsModal'));
        if (settingsModal) {
            settingsModal.hide();
        }
        
        // Refresh page data if there are any refresh hooks
        if (window.refreshPageData) {
            window.refreshPageData('settings');
        }
        
    } catch (error) {
        console.error('❌ Error saving settings:', error);
        showNotification('Error saving settings. Please try again.', 'danger');
    }
}

/**
 * Notification system - will be improved with proper toast implementation
 * @param {string} message - Message to display
 * @param {string} type - Notification type ('success', 'warning', 'danger', 'info')
 */
function showNotification(message, type) {
    // Fallback notification system
    // This will be replaced with proper toast notifications later
    console.log(`${type.toUpperCase()}: ${message}`);
    
    // Try to use page-specific toast if available
    if (window.showToast) {
        window.showToast(message, type);
    } else if (window.ticketManager && window.ticketManager.showToast) {
        window.ticketManager.showToast(message, type);
    } else {
        // Fallback to alert for now
        alert(`${type.toUpperCase()}: ${message}`);
    }
}

// ServiceNow Integration Functions
function initServiceNowSettings() {
    const enabledToggle = document.getElementById('serviceNowEnabled');
    const instanceInput = document.getElementById('serviceNowInstance');
    const configDiv = document.getElementById('serviceNowConfig');
    const urlPreview = document.getElementById('urlPatternPreview');
    const statusBadge = document.getElementById('serviceNowStatus');
    const testButton = document.getElementById('testServiceNowLink');
    const saveButton = document.getElementById('saveServiceNowSettings');

    if (!enabledToggle || !instanceInput) return;

    // Load saved settings
    loadServiceNowSettings();

    // Toggle configuration visibility
    enabledToggle.addEventListener('change', function() {
        configDiv.style.display = this.checked ? 'block' : 'none';
        updateServiceNowStatus();
        updateUrlPreview();
    });

    // Update URL preview as user types
    instanceInput.addEventListener('input', updateUrlPreview);

    // Test link functionality
    testButton.addEventListener('click', testServiceNowConnection);

    // Save settings
    saveButton.addEventListener('click', saveServiceNowSettings);

    // Initial state
    updateServiceNowStatus();
    updateUrlPreview();
}

function loadServiceNowSettings() {
    try {
        const settings = JSON.parse(localStorage.getItem('serviceNowSettings') || '{}');
        const enabledToggle = document.getElementById('serviceNowEnabled');
        const instanceInput = document.getElementById('serviceNowInstance');
        const configDiv = document.getElementById('serviceNowConfig');

        if (enabledToggle) {
            enabledToggle.checked = settings.enabled || false;
        }
        if (instanceInput) {
            instanceInput.value = settings.instanceUrl || '';
        }
        if (configDiv) {
            configDiv.style.display = settings.enabled ? 'block' : 'none';
        }
    } catch (error) {
        console.error('Error loading ServiceNow settings:', error);
    }
}

function saveServiceNowSettings() {
    try {
        const enabledToggle = document.getElementById('serviceNowEnabled');
        const instanceInput = document.getElementById('serviceNowInstance');

        if (!enabledToggle || !instanceInput) {
            showToast('Settings elements not found', 'error');
            return;
        }

        // Validate URL if enabled
        if (enabledToggle.checked && instanceInput.value) {
            const url = instanceInput.value.trim();
            if (!url.match(/^https:\/\/.*\.service-now\.com\/?$/)) {
                showToast('Please enter a valid ServiceNow URL (https://yourorg.service-now.com)', 'error');
                instanceInput.focus();
                return;
            }
        }

        const settings = {
            enabled: enabledToggle.checked,
            instanceUrl: instanceInput.value.trim()
        };

        localStorage.setItem('serviceNowSettings', JSON.stringify(settings));
        updateServiceNowStatus();
        showToast('ServiceNow settings saved successfully', 'success');

        // Trigger page refresh if available
        if (window.refreshPageData) {
            window.refreshPageData('serviceNow');
        }
    } catch (error) {
        console.error('Error saving ServiceNow settings:', error);
        showToast('Failed to save ServiceNow settings', 'error');
    }
}

function updateServiceNowStatus() {
    const statusBadge = document.getElementById('serviceNowStatus');
    const enabledToggle = document.getElementById('serviceNowEnabled');
    const instanceInput = document.getElementById('serviceNowInstance');

    if (!statusBadge || !enabledToggle) return;

    const isEnabled = enabledToggle.checked;
    const hasValidUrl = instanceInput && instanceInput.value.trim().match(/^https:\/\/.*\.service-now\.com\/?$/);

    if (isEnabled && hasValidUrl) {
        statusBadge.textContent = 'Enabled';
        statusBadge.className = 'badge bg-success ms-auto';
    } else if (isEnabled) {
        statusBadge.textContent = 'Configuration Needed';
        statusBadge.className = 'badge bg-warning ms-auto';
    } else {
        statusBadge.textContent = 'Disabled';
        statusBadge.className = 'badge bg-secondary ms-auto';
    }
}

function updateUrlPreview() {
    const urlPreview = document.getElementById('urlPatternPreview');
    const instanceInput = document.getElementById('serviceNowInstance');
    const enabledToggle = document.getElementById('serviceNowEnabled');

    if (!urlPreview || !instanceInput || !enabledToggle) return;

    if (!enabledToggle.checked) {
        urlPreview.textContent = 'ServiceNow integration is disabled';
        return;
    }

    const instanceUrl = instanceInput.value.trim();
    if (!instanceUrl) {
        urlPreview.textContent = 'Enter your ServiceNow instance URL to see the pattern';
        return;
    }

    const baseUrl = instanceUrl.replace(/\/$/, ''); // Remove trailing slash
    const pattern = `${baseUrl}/nav_to.do?uri=incident_list.do?sysparm_query=number={TICKET_NUMBER}`;
    urlPreview.textContent = pattern;
}

function testServiceNowConnection() {
    const instanceInput = document.getElementById('serviceNowInstance');
    const enabledToggle = document.getElementById('serviceNowEnabled');

    if (!instanceInput || !enabledToggle) {
        showToast('Settings elements not found', 'error');
        return;
    }

    if (!enabledToggle.checked) {
        showToast('Please enable ServiceNow integration first', 'warning');
        return;
    }

    const instanceUrl = instanceInput.value.trim();
    if (!instanceUrl) {
        showToast('Please enter your ServiceNow instance URL', 'warning');
        instanceInput.focus();
        return;
    }

    if (!instanceUrl.match(/^https:\/\/.*\.service-now\.com\/?$/)) {
        showToast('Please enter a valid ServiceNow URL format', 'error');
        instanceInput.focus();
        return;
    }

    // Generate test URL
    const baseUrl = instanceUrl.replace(/\/$/, '');
    const testUrl = `${baseUrl}/nav_to.do?uri=incident_list.do?sysparm_query=number=INC0000001`;

    // Open test link
    window.open(testUrl, '_blank');
    showToast('Test link opened in new tab', 'info');
}

function generateServiceNowUrl(ticketNumber) {
    try {
        const settings = JSON.parse(localStorage.getItem('serviceNowSettings') || '{}');
        
        if (!settings.enabled || !settings.instanceUrl) {
            return null;
        }

        const baseUrl = settings.instanceUrl.replace(/\/$/, '');
        return `${baseUrl}/nav_to.do?uri=incident_list.do?sysparm_query=number=${ticketNumber}`;
    } catch (error) {
        console.error('Error generating ServiceNow URL:', error);
        return null;
    }
}

function isServiceNowEnabled() {
    try {
        const settings = JSON.parse(localStorage.getItem('serviceNowSettings') || '{}');
        return settings.enabled && settings.instanceUrl;
    } catch (error) {
        console.error('Error checking ServiceNow status:', error);
        return false;
    }
};

/**
 * Convert tickets data to CSV format
 * @param {Array} tickets - Array of ticket objects
 * @returns {string} CSV data
 */
function convertTicketsToCSV(tickets) {
    if (!tickets || tickets.length === 0) {
        return 'id,xt_number,date_submitted,date_due,hexagon_ticket,service_now_ticket,location,devices,supervisor,tech,status,notes,created_at,updated_at\n';
    }
    
    // Transform tickets for CSV with proper field mapping
    const csvData = tickets.map(ticket => ({
        id: ticket.id || '',
        xt_number: ticket.xt_number || '',
        date_submitted: ticket.date_submitted || '',
        date_due: ticket.date_due || '',
        hexagon_ticket: ticket.hexagon_ticket || '',
        service_now_ticket: ticket.service_now_ticket || '',
        location: ticket.location || '',
        devices: ticket.devices || '',
        supervisor: ticket.supervisor || '',
        tech: ticket.tech || '',
        status: ticket.status || '',
        notes: ticket.notes || '',
        created_at: ticket.created_at || '',
        updated_at: ticket.updated_at || ''
    }));
    
    return Papa.unparse(csvData);
}

/**
 * Convert vulnerabilities data to CSV format
 * @param {Array} vulnerabilities - Array of vulnerability objects
 * @returns {string} CSV data
 */
function convertVulnerabilitiesToCSV(vulnerabilities) {
    if (!vulnerabilities || vulnerabilities.length === 0) {
        return 'id,hostname,ip_address,cve,severity,vpr_score,cvss_score,first_seen,last_seen,plugin_name,description,solution\n';
    }
    
    // Transform vulnerabilities for CSV
    const csvData = vulnerabilities.map(vuln => ({
        id: vuln.id || '',
        hostname: vuln.hostname || '',
        ip_address: vuln.ip_address || '',
        cve: vuln.cve || '',
        severity: vuln.severity || '',
        vpr_score: vuln.vpr_score || 0,
        cvss_score: vuln.cvss_score || 0,
        first_seen: vuln.first_seen || '',
        last_seen: vuln.last_seen || '',
        plugin_name: vuln.plugin_name || '',
        description: vuln.description || '',
        solution: vuln.solution || ''
    }));
    
    return Papa.unparse(csvData);
}

/**
 * Export all data as separate CSV files in a ZIP
 * @returns {Promise<void>}
 */
async function exportAllDataAsCSV() {
    try {
        const zip = new JSZip();
        const timestamp = new Date().toISOString().split('T')[0];
        
        // Fetch all data
        const [ticketsRes, vulnsRes] = await Promise.all([
            fetch('/api/backup/tickets'),
            fetch('/api/backup/vulnerabilities')
        ]);
        
        if (ticketsRes.ok && vulnsRes.ok) {
            const ticketsData = await ticketsRes.json();
            const vulnsData = await vulnsRes.json();
            
            // Convert to CSV
            const ticketsCSV = convertTicketsToCSV(ticketsData.data || []);
            const vulnsCSV = convertVulnerabilitiesToCSV(vulnsData.data || []);
            
            // Add CSV files to ZIP
            zip.file('tickets.csv', ticketsCSV);
            zip.file('vulnerabilities.csv', vulnsCSV);
            
            // Add metadata
            const metadata = {
                export_type: 'all_csv',
                created_at: new Date().toISOString(),
                application: 'HexTrackr',
                version: '2.3',
                contents: {
                    tickets: ticketsData.count || 0,
                    vulnerabilities: vulnsData.count || 0
                }
            };
            zip.file('export_info.json', JSON.stringify(metadata, null, 2));
            
            // Generate and download ZIP
            const zipBlob = await zip.generateAsync({ type: 'blob' });
            const filename = `hextrackr_all_data_export_${timestamp}.zip`;
            
            const url = URL.createObjectURL(zipBlob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            showNotification(`All data CSV export created: ${filename}`, 'success');
        } else {
            throw new Error('Failed to fetch data for export');
        }
    } catch (error) {
        console.error('Error creating all data CSV export:', error);
        showNotification(`All data CSV export failed: ${error.message}`, 'danger');
    }
}

/**
 * Import CSV data
 * @param {string} type - Type of data to import ('tickets' or 'vulnerabilities')
 */
async function importCSV(type) {
    try {
        // Create a file input element
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = '.csv';
        fileInput.style.display = 'none';
        
        fileInput.addEventListener('change', async function(event) {
            const file = event.target.files[0];
            if (!file) return;
            
            try {
                // Read the CSV file
                const text = await file.text();
                const data = Papa.parse(text, { 
                    header: true, 
                    skipEmptyLines: true 
                });
                
                if (data.errors.length > 0) {
                    throw new Error(`CSV parsing errors: ${data.errors.map(e => e.message).join(', ')}`);
                }
                
                // Send to backend for import
                const response = await fetch(`/api/import/${type}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        data: data.data
                    })
                });
                
                if (response.ok) {
                    const result = await response.json();
                    showNotification(`${type} import successful: ${result.imported || data.data.length} records imported`, 'success');
                    
                    // Refresh page data if available
                    if (window.refreshPageData) {
                        window.refreshPageData(type);
                    }
                    if (window.loadTickets) {
                        window.loadTickets();
                    }
                } else {
                    const error = await response.json();
                    throw new Error(error.message || 'Import failed');
                }
            } catch (error) {
                console.error('Import error:', error);
                showNotification(`Import failed: ${error.message}`, 'danger');
            } finally {
                // Clean up
                document.body.removeChild(fileInput);
            }
        });
        
        // Trigger file selection
        document.body.appendChild(fileInput);
        fileInput.click();
        
    } catch (error) {
        console.error('Error setting up import:', error);
        showNotification(`Import setup failed: ${error.message}`, 'danger');
    }
}

// Auto-initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    SettingsModal.init();
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        SettingsModal,
        refreshStats,
        exportData,
        backupData,
        importData,
        clearData,
        testCiscoConnection,
        testTenableConnection,
        fetchCiscoData,
        fetchTenableData,
        saveSettings,
        initServiceNowSettings,
        loadServiceNowSettings,
        saveServiceNowSettings,
        generateServiceNowUrl,
        isServiceNowEnabled
    };
}

// Export for testing and page integration
window.SettingsModal = SettingsModal;
window.refreshPageData = window.refreshPageData || function() {};

// Export individual functions for onclick handlers
window.exportData = exportData;
window.backupData = backupData;
window.importData = importData;
window.clearData = clearData;
window.exportAllDataAsCSV = exportAllDataAsCSV;
window.restoreData = restoreData;
window.restoreFullSystemBackup = restoreFullSystemBackup;

/**
 * Restore full system backup (all data types)
 * This is a specialized version of restoreData that handles the 'all' type
 * @returns {Promise<void>}
 */
async function restoreFullSystemBackup() {
    try {
        // Show confirmation dialog first
        const confirmed = await showRestoreConfirmationModal();
        if (!confirmed) return;
        
        // Call restoreData with 'all' type
        await restoreData('all');
    } catch (error) {
        console.error('Error with full system restore:', error);
        showNotification(`System restore failed: ${error.message}`, 'danger');
    }
}

/**
 * Show confirmation modal for system restore
 * @returns {Promise<boolean>} True if confirmed, false otherwise
 */
function showRestoreConfirmationModal() {
    return new Promise((resolve) => {
        const modal = document.createElement('div');
        modal.className = 'modal fade';
        modal.innerHTML = `
            <div class="modal-dialog modal-dialog-centered">
                <div class="modal-content">
                    <div class="modal-header bg-warning">
                        <h5 class="modal-title">
                            <i class="fas fa-exclamation-triangle me-2"></i>
                            Confirm Full System Restore
                        </h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <div class="alert alert-warning">
                            <strong>Warning:</strong> This will restore all data from a backup file.
                            Existing data may be overwritten or duplicated.
                        </div>
                        <p>Would you like to clear existing data before restore?</p>
                        <div class="form-check form-switch mb-3">
                            <input class="form-check-input" type="checkbox" id="clearBeforeRestore">
                            <label class="form-check-label" for="clearBeforeRestore">
                                Clear existing data before restore
                            </label>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                        <button type="button" class="btn btn-primary" id="confirmRestoreBtn">Proceed with Restore</button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        const bsModal = new bootstrap.Modal(modal);
        const confirmBtn = modal.querySelector('#confirmRestoreBtn');
        const clearCheckbox = modal.querySelector('#clearBeforeRestore');
        
        confirmBtn.addEventListener('click', () => {
            const shouldClear = clearCheckbox.checked;
            bsModal.hide();
            resolve(true);
        });
        
        modal.addEventListener('hidden.bs.modal', () => {
            document.body.removeChild(modal);
            resolve(false);
        });
        
        bsModal.show();
    });
}

/**
 * Restore data from a ZIP backup file
 * @param {string} type - Type of data to restore ('tickets', 'vulnerabilities', 'all')
 * @returns {Promise<void>}
 */
async function restoreData(type) {
    try {
        // Create a file input element for selecting the backup file
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.zip';
        input.style.display = 'none';
        
        input.onchange = async function(event) {
            const file = event.target.files[0];
            if (!file) return;
            
            // Show loading notification
            showNotification(`Restoring ${type} data from backup...`, 'info');
            
            try {
                // Create form data with the file and type
                const formData = new FormData();
                formData.append('file', file);
                formData.append('type', type);
                
                // Send to backend for processing
                const response = await fetch('/api/restore', {
                    method: 'POST',
                    body: formData
                });
                
                if (response.ok) {
                    const result = await response.json();
                    showNotification(`Restore successful: ${result.message}`, 'success');
                    
                    // Refresh statistics
                    await refreshStats();
                    
                    // Trigger page-specific refresh if available
                    if (window.refreshPageData) {
                        window.refreshPageData(type);
                    }
                } else {
                    const error = await response.json();
                    throw new Error(error.message || 'Restore failed');
                }
            } catch (error) {
                console.error('Error restoring data:', error);
                showNotification(`Restore failed: ${error.message}`, 'danger');
            } finally {
                // Clean up
                document.body.removeChild(input);
            }
        };
        
        // Trigger file selection
        document.body.appendChild(input);
        input.click();
        
    } catch (error) {
        console.error('Error setting up restore:', error);
        showNotification(`Restore setup failed: ${error.message}`, 'danger');
    }
}

})();
