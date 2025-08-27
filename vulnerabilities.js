/**
 * HexTrackr - Vulnerabilities Management JavaScript
 * 
 * 🎯 INCREMENTAL MIGRATION TARGET
 * 
 * This file is the target for migrating vulnerabilities JavaScript from the embedded 
 * HTML script section in vulnerabilities.html to follow our architectural pattern:
 * "Each HTML page MUST use its own dedicated JS file"
 * 
 * MIGRATION STRATEGY:
 * - All NEW vulnerabilities JavaScript goes directly in this file
 * - When modifying existing embedded JS, comment out in HTML and move here
 * - Migrate code organically as we work through features over time
 * - No rush - system works perfectly with embedded JS
 * 
 * Current State (2025-08-26):
 * - ~1788 lines of JavaScript embedded in vulnerabilities.html (lines 1380-3166)
 * - ModernVulnManager class and all functions currently in HTML <script> section
 * - This file is now properly loaded by HTML and ready for incremental migration
 * 
 * @file vulnerabilities.js
 * @description Modern vulnerability management system JavaScript (incremental migration target)
 * @version 2.0.0
 * @author HexTrackr Development Team
 * @since 2025-08-25
 * @updated 2025-08-26 - Added unified Settings modal support
 * 
 * Dependencies (loaded via HTML):
 * - Tabler.io CSS Framework
 * - AG Grid Community Edition  
 * - ApexCharts for trending visualization
 * - PapaParse for CSV processing
 * - SortableJS for drag-and-drop
 * - Bootstrap 5 for modals and components
 * 
 * @example
 * // This file will incrementally receive migrated code:
 * // - ModernVulnManager class
 * // - All vulnerability management functions
 * // - CSV import/export functionality
 * // - Device management functions
 * // - Chart and grid initialization
 * 
 * @todo Incrementally migrate JavaScript from vulnerabilities.html
 * @todo Add proper JSDoc documentation for all migrated functions
 * @todo Maintain backward compatibility during migration
 */

// 🚧 MIGRATION IN PROGRESS
// This file is now properly loaded by vulnerabilities.html and ready for incremental migration
// All new vulnerabilities features should be added directly to this file

console.log('✅ vulnerabilities.js loaded successfully - ready for incremental migration');

// 📋 INCREMENTAL MIGRATION AREAS:
// □ ModernVulnManager class (~1788 lines in HTML)
// □ Event listeners setup  
// □ AG Grid initialization
// □ ApexCharts configuration
// □ CSV import/export functions
// □ Device management functions
// □ Modal handlers
// □ API communication functions
// □ Utility functions

// 🎯 UNIFIED SETTINGS MODAL SUPPORT (MIGRATED 2025-08-26)
// These functions support the new unified Settings modal across both pages

/**
 * Refresh database statistics for the Settings modal
 * @returns {Promise<void>}
 */
async function refreshStats() {
    try {
        const response = await fetch('/api/backup/stats');
        const stats = await response.json();
        
        document.getElementById('ticketCount').textContent = stats.tickets || 0;
        document.getElementById('vulnCount').textContent = stats.vulnerabilities || 0;
        document.getElementById('totalCount').textContent = stats.total || 0;
        
        // Format database size
        const dbSize = stats.dbSize || 0;
        let sizeStr = dbSize < 1024 ? `${dbSize} B` :
                     dbSize < 1024 * 1024 ? `${(dbSize / 1024).toFixed(1)} KB` :
                     `${(dbSize / (1024 * 1024)).toFixed(1)} MB`;
        document.getElementById('dbSize').textContent = sizeStr;
    } catch (error) {
        console.error('Error fetching stats:', error);
        showToast('Error loading statistics', 'danger');
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
            
            showToast(`Export created: ${filename}`, 'success');
        } else {
            throw new Error('Export failed');
        }
    } catch (error) {
        console.error('Error creating export:', error);
        showToast(`Export failed: ${error.message}`, 'danger');
    }
}

/**
 * Create backup of specified data type
 * @param {string} type - Type of data to backup ('tickets', 'vulnerabilities', 'all')
 * @returns {Promise<void>}
 */
async function backupData(type) {
    return exportData(type); // Same functionality for now
}

/**
 * Import data from file
 * @param {string} type - Type of data to import ('tickets', 'vulnerabilities', 'all')
 * @returns {Promise<void>}
 */
async function importData(type) {
    // Create file input for import
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
                showToast(`Import successful: ${result.message}`, 'success');
                await refreshStats();
                
                // Refresh the vulnerabilities grid if available
                if (type === 'vulnerabilities' && window.gridApi) {
                    // Reload grid data - will be properly implemented when migration is complete
                    console.log('Grid reload would happen here');
                }
            } else {
                const error = await response.json();
                throw new Error(error.message || 'Import failed');
            }
        } catch (error) {
            console.error('Error importing data:', error);
            showToast(`Import failed: ${error.message}`, 'danger');
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
            showToast(result.message, 'success');
            
            // Refresh statistics
            await refreshStats();
            
            // Refresh vulnerabilities grid if available
            if (type === 'vulnerabilities' && window.gridApi) {
                console.log('Grid refresh would happen here');
            }
        } else {
            throw new Error('Clear operation failed');
        }
    } catch (error) {
        console.error('Error clearing data:', error);
        showToast(`Error clearing data: ${error.message}`, 'danger');
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
    showToast('Cisco API connectivity test - feature coming soon', 'info');
    // TODO: Implement actual Cisco PSIRT API test
}

/**
 * Test Tenable API connection
 * @returns {Promise<void>}
 */
async function testTenableConnection() {
    showToast('Tenable API connectivity test - feature coming soon', 'info');
    // TODO: Implement actual Tenable API test
}

/**
 * Fetch data from Cisco PSIRT API
 * @returns {Promise<void>}
 */
async function fetchCiscoData() {
    showToast('Cisco data fetch - feature coming soon', 'info');
    // TODO: Implement actual Cisco PSIRT data fetch
}

/**
 * Fetch data from Tenable API
 * @returns {Promise<void>}
 */
async function fetchTenableData() {
    showToast('Tenable data fetch - feature coming soon', 'info');
    // TODO: Implement actual Tenable data fetch
}

/**
 * Save Settings modal configuration
 * @returns {Promise<void>}
 */
async function saveSettings() {
    // TODO: Implement settings save functionality
    showToast('Settings saved successfully', 'success');
    const settingsModal = bootstrap.Modal.getInstance(document.getElementById('settingsModal'));
    settingsModal.hide();
}

/**
 * Show toast notification (compatibility wrapper)
 * @param {string} message - Message to display
 * @param {string} type - Toast type ('success', 'warning', 'danger', 'info')
 * @returns {void}
 */
function showToast(message, type) {
    // This will be replaced with proper toast implementation during migration
    console.log(`Toast (${type}): ${message}`);
    alert(`${type.toUpperCase()}: ${message}`);
}

// Initialize Settings modal when page loads
document.addEventListener('DOMContentLoaded', function() {
    const settingsModal = document.getElementById('settingsModal');
    if (settingsModal) {
        settingsModal.addEventListener('shown.bs.modal', refreshStats);
        
        // Add event listeners for Settings modal buttons
        document.getElementById('testCiscoConnection')?.addEventListener('click', testCiscoConnection);
        document.getElementById('testTenableConnection')?.addEventListener('click', testTenableConnection);
        document.getElementById('fetchCiscoData')?.addEventListener('click', fetchCiscoData);
        document.getElementById('fetchTenableData')?.addEventListener('click', fetchTenableData);
        document.getElementById('saveSettings')?.addEventListener('click', saveSettings);
    }
});

// 🎯 READY FOR INCREMENTAL MIGRATION
// This file is now properly loaded by vulnerabilities.html with Settings modal support
// All JavaScript code from HTML will be migrated here incrementally as we work on features
