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
        this.initServiceNowSettings();
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
 * Export data backup for specified type
 * @param {string} type - Type of data to backup ('tickets', 'vulnerabilities', 'all')
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
            
            // Create download
            const timestamp = new Date().toISOString().split('T')[0];
            const filename = `hextrackr_backup_${type}_${timestamp}.json`;
            
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            showNotification(`Export created: ${filename}`, 'success');
        } else {
            throw new Error('Export failed');
        }
    } catch (error) {
        console.error('Error creating export:', error);
        showNotification(`Export failed: ${error.message}`, 'danger');
    }
}

/**
 * Create backup of specified data type (alias for exportData)
 * @param {string} type - Type of data to backup
 * @returns {Promise<void>}
 */
async function backupData(type) {
    return exportData(type);
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

})();
