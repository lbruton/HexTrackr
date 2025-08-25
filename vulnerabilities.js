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
 * Current State (2025-08-25):
 * - ~1860 lines of JavaScript embedded in vulnerabilities.html (lines 1098-2958)
 * - ModernVulnManager class and all functions currently in HTML <script> section
 * - This file serves as the incremental migration target
 * 
 * @file vulnerabilities.js
 * @description Modern vulnerability management system JavaScript (incremental migration target)
 * @version 1.0.0
 * @author HexTrackr Development Team
 * @since 2025-08-25
 * 
 * Dependencies:
 * - Tabler.io CSS Framework
 * - AG Grid Community Edition
 * - ApexCharts for trending visualization
 * - PapaParse for CSV processing
 * - SortableJS for drag-and-drop
 * - Bootstrap 5 for modals and components
 * 
 * @example
 * // This file will eventually contain:
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
// This file is ready to receive migrated JavaScript from vulnerabilities.html
// All new vulnerabilities features should be added directly to this file

// Global vulnerability manager instance (will be migrated)
let vulnManager;

// 📋 MIGRATION CHECKLIST:
// □ ModernVulnManager class (~1860 lines)
// □ Event listeners setup
// □ AG Grid initialization
// □ ApexCharts configuration
// □ CSV import/export functions
// □ Device management functions
// □ Modal handlers
// □ API communication functions
// □ Utility functions

// Example of properly documented function for future migrations:
/**
 * Placeholder function showing documentation pattern for migrated code
 * @param {string} message - The message to display
 * @param {string} type - Toast type ('success', 'warning', 'danger', 'info')
 * @returns {void}
 * @example
 * showToast('Import completed!', 'success');
 */
function showToastExample(message, type) {
    // This is just an example - actual implementation will be migrated from HTML
    console.log(`Toast: ${message} (${type})`);
}

// 🎯 Ready for incremental migration as we work through vulnerabilities features

/**
 * Save vulnerability changes
 * Updates vulnerability details via a PUT request.
 * @async
 * @function saveVulnerabilityChanges
 */
async function saveVulnerabilityChanges() {
    const id = document.getElementById('editVulnId').value;
    const formData = {
        hostname: document.getElementById('editHostname').value,
        ip_address: document.getElementById('editIpAddress').value,
        severity: document.getElementById('editSeverity').value,
        state: document.getElementById('editState').value,
        notes: document.getElementById('editNotes').value
    };

    try {
        const response = await fetch(`${apiBase}/vulnerabilities/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });

        if (response.ok) {
            showToast('Vulnerability updated successfully!', 'success');
            await loadData(); // Refresh the data
            bootstrap.Modal.getInstance(document.getElementById('editVulnModal')).hide();
        } else {
            showToast('Failed to update vulnerability', 'danger');
        }
    } catch (error) {
        showToast('Error updating vulnerability: ' + error.message, 'danger');
    }
}

/**
 * Delete vulnerability
 * Deletes a vulnerability via a DELETE request.
 * @async
 * @function deleteVulnerability
 * @param {string} id - The ID of the vulnerability to delete.
 */
async function deleteVulnerability(id) {
    if (!confirm('Are you sure you want to delete this vulnerability? This action cannot be undone.')) {
        return;
    }

    try {
        const response = await fetch(`${apiBase}/vulnerabilities/${id}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            showToast('Vulnerability deleted successfully!', 'success');
            await loadData(); // Refresh the data
        } else {
            showToast('Failed to delete vulnerability', 'danger');
        }
    } catch (error) {
        showToast('Error deleting vulnerability: ' + error.message, 'danger');
    }
}

/**
 * Refresh single vulnerability
 * Simulates refreshing vulnerability data.
 * @async
 * @function refreshVulnerability
 * @param {string} id - The ID of the vulnerability to refresh.
 */
async function refreshVulnerability(id) {
    const vuln = vulnerabilities[id] || filteredVulnerabilities[id];
    if (!vuln) {
        showToast('Vulnerability not found', 'danger');
        return;
    }

    showToast('Refreshing vulnerability data...', 'info');

    // Simulate refresh - in production, this would re-scan the specific vulnerability
    await new Promise(resolve => setTimeout(resolve, 1000));

    showToast('Vulnerability data refreshed!', 'success');
}

/**
 * Export device-specific vulnerabilities as a CSV file.
 * @function exportDeviceReport
 * @param {string} hostname - The hostname of the device.
 */
function exportDeviceReport(hostname) {
    const device = devices.find(d => d.hostname === hostname);
    if (!device) return;

    const csvData = device.vulnerabilities.map(vuln => ({
        'Device': hostname,
        'CVE': vuln.cve || 'N/A',
        'VPR Score': vuln.vpr_score || 0,
        'Severity': vuln.severity,
        'Plugin Name': vuln.plugin_name,
        'Port': vuln.port || 'N/A',
        'First Seen': vuln.first_seen ? new Date(vuln.first_seen).toLocaleDateString() : 'N/A',
        'Last Seen': vuln.last_seen ? new Date(vuln.last_seen).toLocaleDateString() : 'N/A'
    }));

    const csv = Papa.unparse(csvData);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `device_${hostname}_vulnerabilities_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast(`Device report exported for ${hostname}`, 'success');
}

/**
 * Export the currently displayed vulnerability as a text file.
 * @function exportVulnerabilityReport
 */
function exportVulnerabilityReport() {
    const modal = document.getElementById('vulnerabilityModal');
    if (!modal.classList.contains('show')) return;

    const vulnTitle = modal.querySelector('.modal-title').textContent;
    const vulnInfo = modal.querySelector('#vulnerabilityInfo').innerHTML;

    const reportContent = `
        ${vulnTitle}\n
        Generated: ${new Date().toLocaleString()}\n
        ${vulnInfo.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ')}\n
    `;

    const blob = new Blob([reportContent], { type: 'text/plain;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `vulnerability_report_${new Date().toISOString().split('T')[0]}.txt`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast('Vulnerability report exported', 'success');
}
