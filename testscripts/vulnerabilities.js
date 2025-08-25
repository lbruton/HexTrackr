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

/* global document, fetch, showToast, loadData, bootstrap, confirm, Papa, Blob, URL, setTimeout, window, console */
/* global showLoading, hideLoading, FormData */
/* global vulnerabilities, devices, historicalData, updateChart, filterData */

// Importing necessary libraries to fix undefined references
import * as agGrid from 'ag-grid-community';
import ApexCharts from 'apexcharts';

// Define apiBase and other global variables if not already defined
const apiBase = typeof window !== 'undefined' ? window.apiBase || '' : ''; // Replace with actual API base URL if needed
const vulnerabilities = typeof window !== 'undefined' ? window.vulnerabilities || {} : {}; // Replace with actual vulnerabilities data if needed
const filteredVulnerabilities = typeof window !== 'undefined' ? window.filteredVulnerabilities || {} : {}; // Replace with actual filtered vulnerabilities data if needed
const devices = typeof window !== 'undefined' ? window.devices || [] : []; // Replace with actual devices data if needed

// Ensure all browser-specific objects are accounted for
if (typeof Blob === 'undefined') {
    throw new Error('Blob is not supported in this environment.');
}
if (typeof URL === 'undefined') {
    throw new Error('URL is not supported in this environment.');
}
if (typeof setTimeout === 'undefined') {
    throw new Error('setTimeout is not supported in this environment.');
}

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

/**
 * Generate an HTML report for a device's vulnerabilities.
 * @function generateDeviceReport
 */
function generateDeviceReport() {
    const modal = document.getElementById('deviceModal');
    if (!modal.classList.contains('show')) {
        showToast('No device modal is currently open', 'warning');
        return;
    }

    const modalTitle = modal.querySelector('.modal-title').textContent;
    const hostname = modalTitle.replace('Device Security Overview', '').replace(/[^a-zA-Z0-9.-]/g, '').trim();

    const device = devices.find(d => d.hostname.includes(hostname) || hostname.includes(d.hostname));
    if (!device) {
        showToast('Could not find device data for report generation', 'error');
        return;
    }

    const reportHtml = `
    <!DOCTYPE html>
    <html>
    <head>
        <title>Device Security Report - ${device.hostname}</title>
        <link href="https://cdn.jsdelivr.net/npm/@tabler/core@1.0.0-beta17/dist/css/tabler.min.css" rel="stylesheet">
        <style>
            body { font-family: 'Segoe UI', sans-serif; margin: 20px; }
            .report-header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #206bc4; padding-bottom: 20px; }
            .summary-stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; margin-bottom: 30px; }
            .stat-card { background: #f8fafc; padding: 15px; border-radius: 8px; text-align: center; border: 1px solid #e2e8f0; }
            .vuln-table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            .vuln-table th, .vuln-table td { padding: 12px; text-align: left; border-bottom: 1px solid #e2e8f0; }
            .vuln-table th { background: #206bc4; color: white; }
            .severity-critical { color: #dc3545; font-weight: bold; }
            .severity-high { color: #fd7e14; font-weight: bold; }
            .severity-medium { color: #ffc107; font-weight: bold; }
            .severity-low { color: #198754; font-weight: bold; }
            .footer { margin-top: 40px; text-align: center; color: #6c757d; font-size: 0.9em; }
        </style>
    </head>
    <body>
        <div class="report-header">
            <h1>🛡️ Device Security Report</h1>
            <h2>${device.hostname}</h2>
            <p>Generated on ${new Date().toLocaleString()} by HexTrackr</p>
        </div>

        <div class="summary-stats">
            <div class="stat-card">
                <h3 class="severity-critical">${device.criticalCount || 0}</h3>
                <p>Critical<br>VPR: ${(device.criticalVPR || 0).toFixed(1)}</p>
            </div>
            <div class="stat-card">
                <h3 class="severity-high">${device.highCount || 0}</h3>
                <p>High<br>VPR: ${(device.highVPR || 0).toFixed(1)}</p>
            </div>
            <div class="stat-card">
                <h3 class="severity-medium">${device.mediumCount || 0}</h3>
                <p>Medium<br>VPR: ${(device.mediumVPR || 0).toFixed(1)}</p>
            </div>
            <div class="stat-card">
                <h3 class="severity-low">${device.lowCount || 0}</h3>
                <p>Low<br>VPR: ${(device.lowVPR || 0).toFixed(1)}</p>
            </div>
        </div>

        <h3>📊 Total Risk Score: ${(device.totalVPR || 0).toFixed(1)} VPR</h3>

        <table class="vuln-table">
            <thead>
                <tr>
                    <th>CVE</th>
                    <th>VPR Score</th>
                    <th>Severity</th>
                    <th>Plugin Name</th>
                    <th>Port</th>
                    <th>First Seen</th>
                </tr>
            </thead>
            <tbody>
                ${device.vulnerabilities.map(vuln => `
                    <tr>
                        <td>${vuln.cve || 'N/A'}</td>
                        <td><strong>${vuln.vpr_score || 0}</strong></td>
                        <td class="severity-${(vuln.severity || 'low').toLowerCase()}">${vuln.severity || 'Low'}</td>
                        <td>${vuln.plugin_name || 'Unknown'}</td>
                        <td>${vuln.port || 'N/A'}</td>
                        <td>${vuln.first_seen ? new Date(vuln.first_seen).toLocaleDateString() : 'N/A'}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>

        <div class="footer">
            <p>This report contains ${device.vulnerabilities.length} vulnerabilities detected for ${device.hostname}</p>
            <p>Generated by HexTrackr Vulnerability Management System</p>
        </div>
    </body>
    </html>
    `;

    const blob = new Blob([reportHtml], { type: 'text/html;charset=utf-8' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `device_${device.hostname}_security_report_${new Date().toISOString().split('T')[0]}.html`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast(`HTML security report generated for ${device.hostname}`, 'success');
}

/**
 * Handles CSV import for vulnerabilities.
 * @param {Event} event - The file input change event.
 */
async function handleCsvImport(event) {
    const file = event.target.files[0];
    if (!file) return;

    // Check file size (warn if over 10MB)
    if (file.size > 10 * 1024 * 1024) {
        if (!confirm(`This file is ${Math.round(file.size / (1024 * 1024))}MB. Large files will be processed server-side for better performance. Continue?`)) {
            event.target.value = ''; // Clear the input
            return;
        }
    }

    showLoading('Uploading CSV file...');

    try {
        // Prepare form data for upload
        const formData = new FormData();
        formData.append('csvFile', file);
        formData.append('vendor', 'cisco'); // Default to cisco, could be made configurable

        // Upload to database API
        const response = await fetch(`${apiBase}/vulnerabilities/import`, {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Import failed');
        }

        showLoading('Processing data...');
        const result = await response.json();

        showLoading('Updating display...');
        await loadData();

        hideLoading();
        showToast(`CSV import completed! Imported ${result.rowsProcessed.toLocaleString()} vulnerabilities from ${result.filename}.`, 'success');

        // Clear the file input for next use
        event.target.value = '';
    } catch (error) {
        hideLoading();
        console.error('Error importing CSV:', error);
        showToast('Error importing CSV: ' + error.message, 'danger');
        event.target.value = '';
    }
}

/**
 * Calculates the severity level based on the VPR score.
 * @param {number} vprScore - The Vulnerability Priority Rating score.
 * @returns {string} - The severity level (Critical, High, Medium, Low).
 */
function calculateSeverity(vprScore) {
    if (vprScore >= 9.0) return 'Critical';
    if (vprScore >= 7.0) return 'High';
    if (vprScore >= 4.0) return 'Medium';
    return 'Low';
}

/**
 * Processes devices and aggregates vulnerability data.
 */
function processDevices() {
    const deviceMap = new Map();

    vulnerabilities.forEach(vuln => {
        if (!deviceMap.has(vuln.hostname)) {
            deviceMap.set(vuln.hostname, {
                hostname: vuln.hostname,
                vulnerabilities: [],
                criticalCount: 0,
                highCount: 0,
                mediumCount: 0,
                lowCount: 0,
                criticalVPR: 0,
                highVPR: 0,
                mediumVPR: 0,
                lowVPR: 0,
                totalCount: 0,
                totalVPR: 0
            });
        }

        const device = deviceMap.get(vuln.hostname);
        device.vulnerabilities.push(vuln);
        device.totalCount++;

        const vprScore = vuln.vpr_score || 0;
        device.totalVPR += vprScore;

        switch (vuln.severity) {
            case 'Critical': 
                device.criticalCount++; 
                device.criticalVPR += vprScore;
                break;
            case 'High': 
                device.highCount++; 
                device.highVPR += vprScore;
                break;
            case 'Medium': 
                device.mediumCount++; 
                device.mediumVPR += vprScore;
                break;
            case 'Low': 
                device.lowCount++; 
                device.lowVPR += vprScore;
                break;
        }
    });

    devices = Array.from(deviceMap.values());
}

/**
 * Loads vulnerabilities and historical data from the database API.
 */
async function loadData() {
    try {
        // Load vulnerabilities from database API
        const response = await fetch(`${apiBase}/vulnerabilities?limit=10000`);
        if (response.ok) {
            const result = await response.json();
            vulnerabilities = result.data || [];
        } else {
            vulnerabilities = [];
        }

        // Load historical trending data for chart
        const trendsResponse = await fetch(`${apiBase}/vulnerabilities/trends`);
        if (trendsResponse.ok) {
            historicalData = await trendsResponse.json();
        } else {
            historicalData = [];
        }

        processDevices();
        loadStatistics(); // Load statistics from API
        updateChart();
        filterData();
    } catch (error) {
        console.error('Error loading data:', error);
        showToast('Error loading data from database', 'danger');
    }
}

// Modern Vulnerability Management System
class ModernVulnManager {
    constructor() {
        this.devices = []; // Corrected from constant to instance variable
        this.vulnerabilities = []; // Corrected from constant to instance variable
        this.historicalData = []; // Corrected from constant to instance variable
        this.statistics = {}; // Added to avoid undefined reference
        this.uniqueAssets = new Set();
        this.apiBase = '/api';
        
        this.setupEventListeners();
        this.initializeGrid();
        this.initializeChart();
        this.loadData();
    }

    setupEventListeners() {
        // Event listeners for various UI elements
        document.getElementById('importCsvBtn').addEventListener('click', () => {
            document.getElementById('csvFileInput').click();
        });

        document.getElementById('csvFileInput').addEventListener('change', (e) => {
            this.handleCsvImport(e);
        });

        document.getElementById('searchInput').addEventListener('input', () => {
            this.filterData();
        });

        document.getElementById('severityFilter').addEventListener('change', () => {
            this.filterData();
        });

        document.querySelectorAll('[data-view]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const view = e.target.dataset.view || e.target.closest('[data-view]').dataset.view;
                if (view) {
                    this.switchView(view);
                }
            });
        });

        document.getElementById('exportBtn').addEventListener('click', () => {
            this.exportData();
        });

        document.getElementById('refreshBtn').addEventListener('click', () => {
            this.refreshData();
        });

        document.getElementById('saveSettings').addEventListener('click', () => {
            this.saveSettings();
        });

        document.getElementById('saveVulnEdit').addEventListener('click', () => {
            this.saveVulnerabilityChanges();
        });

        document.getElementById('clearDataBtn').addEventListener('click', () => {
            this.showClearDataConfirmation();
        });

        document.getElementById('exportDeviceData').addEventListener('click', () => {
            this.exportDeviceData();
        });

        document.getElementById('generateDeviceReport').addEventListener('click', () => {
            this.generateDeviceReport();
        });
    }

    initializeGrid() {
        const columnDefs = [
            { headerName: 'Date', field: 'import_date', sortable: true, filter: 'agDateColumnFilter', width: 100, cellRenderer: (params) => params.value ? new Date(params.value).toLocaleDateString() : '-' },
            { headerName: 'Hostname', field: 'hostname', sortable: true, filter: true, width: 150, cellRenderer: (params) => `<a href="#" class="fw-bold text-primary text-decoration-none" onclick="vulnManager.viewDeviceDetails('${params.value}')">${params.value || '-'}</a>` },
            { headerName: 'IP Address', field: 'ip_address', sortable: true, filter: true, width: 130, cellRenderer: (params) => params.value || '-' },
            { headerName: 'Severity', field: 'severity', sortable: true, filter: true, width: 100, cellRenderer: (params) => `<span class="severity-badge severity-${params.value.toLowerCase()}">${params.value || 'Low'}</span>` },
            { headerName: 'CVE Info', field: 'cve', sortable: true, filter: true, width: 120, cellRenderer: (params) => params.value && params.value.startsWith('CVE-') ? `<a href="#" class="text-decoration-none" onclick="vulnManager.lookupCVE('${params.value}')">${params.value}</a>` : params.value || '-' },
            { headerName: 'Vendor', field: 'vendor', sortable: true, filter: true, width: 120, cellRenderer: (params) => params.value || '-' },
            { headerName: 'Vulnerability Description', field: 'plugin_name', sortable: true, filter: true, flex: 1, minWidth: 250, cellRenderer: (params) => params.value.length > 80 ? `<span title="${params.value}">${params.value.substring(0, 80)}...</span>` : params.value || '-' },
            { headerName: 'VPR Score', field: 'vpr_score', sortable: true, filter: 'agNumberColumnFilter', width: 100, cellRenderer: (params) => `<span class="severity-badge severity-${params.value >= 9 ? 'critical' : params.value >= 7 ? 'high' : params.value >= 4 ? 'medium' : 'low'}">${params.value.toFixed(1)}</span>` },
            { headerName: 'State', field: 'state', sortable: true, filter: true, width: 90, cellRenderer: (params) => `<span class="badge bg-${params.value === 'open' ? 'warning' : 'success'}">${params.value || 'open'}</span>` },
            { headerName: 'Actions', field: 'actions', width: 120, cellRenderer: (params) => `<div class="btn-group" role="group"><button class="btn btn-sm btn-outline-primary" onclick="vulnManager.editVulnerability(${params.data.id})" title="Edit"><i class="fas fa-edit"></i></button><button class="btn btn-sm btn-outline-danger" onclick="vulnManager.deleteVulnerability(${params.data.id})" title="Delete"><i class="fas fa-trash"></i></button><button class="btn btn-sm btn-outline-success" onclick="vulnManager.refreshVulnerability(${params.data.id})" title="Refresh"><i class="fas fa-sync"></i></button></div>` }
        ];

        const gridOptions = {
            columnDefs: columnDefs,
            rowData: [],
            defaultColDef: { resizable: true, sortable: true, filter: true },
            pagination: true,
            paginationPageSize: 50,
            animateRows: true,
            rowSelection: 'multiple',
            suppressRowClickSelection: true,
            enableRangeSelection: true,
            onGridReady: (params) => {
                this.gridApi = params.api;
                params.api.sizeColumnsToFit();
            }
        };

        const gridDiv = document.getElementById('vulnGrid');
        new agGrid.Grid(gridDiv, gridOptions);
    }

    initializeChart() {
        const options = {
            series: [{ name: 'Critical', data: [] }, { name: 'High', data: [] }, { name: 'Medium', data: [] }, { name: 'Low', data: [] }],
            chart: { height: 350, type: 'line', zoom: { enabled: true }, toolbar: { show: true }, animations: { enabled: true, easing: 'easeinout', speed: 800 } },
            dataLabels: { enabled: false },
            stroke: { curve: 'smooth', width: 3 },
            colors: ['#dc2626', '#d97706', '#0284c7', '#059669'],
            title: { text: 'Vulnerability Trends Over Time', align: 'left', style: { fontSize: '16px', fontWeight: '600' } },
            grid: { borderColor: '#e2e8f0', strokeDashArray: 5 },
            markers: { size: 6, strokeWidth: 2, hover: { size: 8 } },
            xaxis: { type: 'datetime', labels: { format: 'MMM dd' } },
            yaxis: { title: { text: 'Number of Vulnerabilities' }, min: 0 },
            legend: { position: 'top', horizontalAlign: 'right', markers: { width: 8, height: 8, radius: 4 } },
            tooltip: { shared: true, intersect: false, y: { formatter: (val) => `${val} vulnerabilities` } }
        };

        this.chart = new ApexCharts(document.getElementById('historicalChart'), options);
        this.chart.render();
    }

    /**
     * Save vulnerability changes
     * Updates vulnerability details via a PUT request.
     * @async
     * @function saveVulnerabilityChanges
     */
    async saveVulnerabilityChanges() {
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
                await this.loadData(); // Refresh the data
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
    async deleteVulnerability(id) {
        if (!confirm('Are you sure you want to delete this vulnerability? This action cannot be undone.')) {
            return;
        }

        try {
            const response = await fetch(`${apiBase}/vulnerabilities/${id}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                showToast('Vulnerability deleted successfully!', 'success');
                await this.loadData(); // Refresh the data
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
    async refreshVulnerability(id) {
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
    exportDeviceReport(hostname) {
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
    exportVulnerabilityReport() {
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

    /**
     * Generate an HTML report for a device's vulnerabilities.
     * @function generateDeviceReport
     */
    generateDeviceReport() {
        const modal = document.getElementById('deviceModal');
        if (!modal.classList.contains('show')) {
            showToast('No device modal is currently open', 'warning');
            return;
        }

        const modalTitle = modal.querySelector('.modal-title').textContent;
        const hostname = modalTitle.replace('Device Security Overview', '').replace(/[^a-zA-Z0-9.-]/g, '').trim();

        const device = devices.find(d => d.hostname.includes(hostname) || hostname.includes(d.hostname));
        if (!device) {
            showToast('Could not find device data for report generation', 'error');
            return;
        }

        const reportHtml = `
        <!DOCTYPE html>
        <html>
        <head>
            <title>Device Security Report - ${device.hostname}</title>
            <link href="https://cdn.jsdelivr.net/npm/@tabler/core@1.0.0-beta17/dist/css/tabler.min.css" rel="stylesheet">
            <style>
                body { font-family: 'Segoe UI', sans-serif; margin: 20px; }
                .report-header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #206bc4; padding-bottom: 20px; }
                .summary-stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; margin-bottom: 30px; }
                .stat-card { background: #f8fafc; padding: 15px; border-radius: 8px; text-align: center; border: 1px solid #e2e8f0; }
                .vuln-table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                .vuln-table th, .vuln-table td { padding: 12px; text-align: left; border-bottom: 1px solid #e2e8f0; }
                .vuln-table th { background: #206bc4; color: white; }
                .severity-critical { color: #dc3545; font-weight: bold; }
                .severity-high { color: #fd7e14; font-weight: bold; }
                .severity-medium { color: #ffc107; font-weight: bold; }
                .severity-low { color: #198754; font-weight: bold; }
                .footer { margin-top: 40px; text-align: center; color: #6c757d; font-size: 0.9em; }
            </style>
        </head>
        <body>
            <div class="report-header">
                <h1>🛡️ Device Security Report</h1>
                <h2>${device.hostname}</h2>
                <p>Generated on ${new Date().toLocaleString()} by HexTrackr</p>
            </div>

            <div class="summary-stats">
                <div class="stat-card">
                    <h3 class="severity-critical">${device.criticalCount || 0}</h3>
                    <p>Critical<br>VPR: ${(device.criticalVPR || 0).toFixed(1)}</p>
                </div>
                <div class="stat-card">
                    <h3 class="severity-high">${device.highCount || 0}</h3>
                    <p>High<br>VPR: ${(device.highVPR || 0).toFixed(1)}</p>
                </div>
                <div class="stat-card">
                    <h3 class="severity-medium">${device.mediumCount || 0}</h3>
                    <p>Medium<br>VPR: ${(device.mediumVPR || 0).toFixed(1)}</p>
                </div>
                <div class="stat-card">
                    <h3 class="severity-low">${device.lowCount || 0}</h3>
                    <p>Low<br>VPR: ${(device.lowVPR || 0).toFixed(1)}</p>
                </div>
            </div>

            <h3>📊 Total Risk Score: ${(device.totalVPR || 0).toFixed(1)} VPR</h3>

            <table class="vuln-table">
                <thead>
                    <tr>
                        <th>CVE</th>
                        <th>VPR Score</th>
                        <th>Severity</th>
                        <th>Plugin Name</th>
                        <th>Port</th>
                        <th>First Seen</th>
                    </tr>
                </thead>
                <tbody>
                    ${device.vulnerabilities.map(vuln => `
                        <tr>
                            <td>${vuln.cve || 'N/A'}</td>
                            <td><strong>${vuln.vpr_score || 0}</strong></td>
                            <td class="severity-${(vuln.severity || 'low').toLowerCase()}">${vuln.severity || 'Low'}</td>
                            <td>${vuln.plugin_name || 'Unknown'}</td>
                            <td>${vuln.port || 'N/A'}</td>
                            <td>${vuln.first_seen ? new Date(vuln.first_seen).toLocaleDateString() : 'N/A'}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>

            <div class="footer">
                <p>This report contains ${device.vulnerabilities.length} vulnerabilities detected for ${device.hostname}</p>
                <p>Generated by HexTrackr Vulnerability Management System</p>
            </div>
        </body>
        </html>
        `;

        const blob = new Blob([reportHtml], { type: 'text/html;charset=utf-8' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `device_${device.hostname}_security_report_${new Date().toISOString().split('T')[0]}.html`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        showToast(`HTML security report generated for ${device.hostname}`, 'success');
    }

    /**
     * Handles CSV import for vulnerabilities.
     * @param {Event} event - The file input change event.
     */
    async handleCsvImport(event) {
        const file = event.target.files[0];
        if (!file) return;

        // Check file size (warn if over 10MB)
        if (file.size > 10 * 1024 * 1024) {
            if (!confirm(`This file is ${Math.round(file.size / (1024 * 1024))}MB. Large files will be processed server-side for better performance. Continue?`)) {
                event.target.value = ''; // Clear the input
                return;
            }
        }

        showLoading('Uploading CSV file...');

        try {
            // Prepare form data for upload
            const formData = new FormData();
            formData.append('csvFile', file);
            formData.append('vendor', 'cisco'); // Default to cisco, could be made configurable

            // Upload to database API
            const response = await fetch(`${apiBase}/vulnerabilities/import`, {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Import failed');
            }

            showLoading('Processing data...');
            const result = await response.json();

            showLoading('Updating display...');
            await this.loadData();

            hideLoading();
            showToast(`CSV import completed! Imported ${result.rowsProcessed.toLocaleString()} vulnerabilities from ${result.filename}.`, 'success');

            // Clear the file input for next use
            event.target.value = '';
        } catch (error) {
            hideLoading();
            console.error('Error importing CSV:', error);
            showToast('Error importing CSV: ' + error.message, 'danger');
            event.target.value = '';
        }
    }

    /**
     * Calculates the severity level based on the VPR score.
     * @param {number} vprScore - The Vulnerability Priority Rating score.
     * @returns {string} - The severity level (Critical, High, Medium, Low).
     */
    calculateSeverity(vprScore) {
        if (vprScore >= 9.0) return 'Critical';
        if (vprScore >= 7.0) return 'High';
        if (vprScore >= 4.0) return 'Medium';
        return 'Low';
    }

    /**
     * Processes devices and aggregates vulnerability data.
     */
    processDevices() {
        const deviceMap = new Map();

        vulnerabilities.forEach(vuln => {
            if (!deviceMap.has(vuln.hostname)) {
                deviceMap.set(vuln.hostname, {
                    hostname: vuln.hostname,
                    vulnerabilities: [],
                    criticalCount: 0,
                    highCount: 0,
                    mediumCount: 0,
                    lowCount: 0,
                    criticalVPR: 0,
                    highVPR: 0,
                    mediumVPR: 0,
                    lowVPR: 0,
                    totalCount: 0,
                    totalVPR: 0
                });
            }

            const device = deviceMap.get(vuln.hostname);
            device.vulnerabilities.push(vuln);
            device.totalCount++;

            const vprScore = vuln.vpr_score || 0;
            device.totalVPR += vprScore;

            switch (vuln.severity) {
                case 'Critical': 
                    device.criticalCount++; 
                    device.criticalVPR += vprScore;
                    break;
                case 'High': 
                    device.highCount++; 
                    device.highVPR += vprScore;
                    break;
                case 'Medium': 
                    device.mediumCount++; 
                    device.mediumVPR += vprScore;
                    break;
                case 'Low': 
                    device.lowCount++; 
                    device.lowVPR += vprScore;
                    break;
            }
        });

        devices = Array.from(deviceMap.values());
    }

    /**
     * Loads vulnerabilities and historical data from the database API.
     */
    async loadData() {
        try {
            const response = await fetch(`${this.apiBase}/vulnerabilities`);
            const result = await response.json();
            this.vulnerabilities = result.data || [];

            const trendsResponse = await fetch(`${this.apiBase}/trends`);
            this.historicalData = await trendsResponse.json();
        } catch (error) {
            console.error('Error loading data:', error);
            this.vulnerabilities = [];
            this.historicalData = [];
        }

        this.loadStatistics(); // Load statistics from API
    }

    async loadStatistics() {
        // Placeholder for loadStatistics method to avoid undefined reference
        console.log('Loading statistics...');
    }

    updateDevices(deviceMap) {
        this.devices = Array.from(deviceMap.values());
    }
}

// Initialize the application
let vulnManager;
document.addEventListener('DOMContentLoaded', () => {
    vulnManager = new ModernVulnManager();
});
