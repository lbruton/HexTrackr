// HexTrackr Ticket Management JavaScript
// This file handles all the interactive functionality for the ticket management system

// Global variables
let tickets = [];
let currentPage = 1;
let rowsPerPage = 25;
let sortColumn = '';
let sortDirection = 'asc';

// DOM Content Loaded Event
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM Content Loaded - Starting HexTrackr initialization');
    initializeApp();
    loadTickets();
    setupEventListeners();
    console.log('HexTrackr initialization complete');
});

// Initialize the application
function initializeApp() {
    console.log('Starting HexTrackr initialization...');
    
    // Check for required libraries
    checkRequiredLibraries();
    
    // Load saved settings from localStorage
    loadSettings();
    updateStatistics();
    
    // Set up pagination
    updatePagination();
    
    console.log('HexTrackr Ticket Management initialized');
}

// Check if required libraries are loaded
function checkRequiredLibraries() {
    const libraries = {
        'Bootstrap': typeof bootstrap !== 'undefined',
        'XLSX': typeof XLSX !== 'undefined',
        'jsPDF': typeof jsPDF !== 'undefined' || typeof window.jspdf !== 'undefined',
        'JSZip': typeof JSZip !== 'undefined'
    };
    
    console.log('Library check:', libraries);
    
    Object.entries(libraries).forEach(([name, loaded]) => {
        if (!loaded) {
            console.warn(`${name} library not loaded - some features may not work`);
        }
    });
    
    return libraries;
}

// Setup all event listeners
function setupEventListeners() {
    // File input handlers
    setupFileHandlers();
    
    // Button handlers
    setupButtonHandlers();
    
    // Table handlers
    setupTableHandlers();
    
    // Modal handlers
    setupModalHandlers();
}

// File handling setup
function setupFileHandlers() {
    const attachDocsBtn = document.getElementById('attachDocsBtn');
    const importCsvBtn = document.getElementById('importCsvBtn');
    const sharedDocsInput = document.getElementById('sharedDocsInput');
    const csvImportInput = document.getElementById('csvImportInput');

    if (attachDocsBtn) {
        attachDocsBtn.addEventListener('click', function() {
            sharedDocsInput.click();
        });
    }

    if (importCsvBtn) {
        importCsvBtn.addEventListener('click', function() {
            csvImportInput.click();
        });
    }

    if (sharedDocsInput) {
        sharedDocsInput.addEventListener('change', handleDocumentAttachment);
    }

    if (csvImportInput) {
        csvImportInput.addEventListener('change', handleCsvImport);
    }
}

// Button handlers setup
function setupButtonHandlers() {
    // External link handlers
    const hexagonLink = document.getElementById('hexagonLink');
    const serviceNowLink = document.getElementById('serviceNowLink');
    
    if (hexagonLink) {
        hexagonLink.addEventListener('click', function(e) {
            e.preventDefault();
            openExternalLink('hexagon');
        });
    }
    
    if (serviceNowLink) {
        serviceNowLink.addEventListener('click', function(e) {
            e.preventDefault();
            openExternalLink('servicenow');
        });
    }

    // Pagination handlers
    const rowsPerPageSelect = document.getElementById('rowsPerPage');
    if (rowsPerPageSelect) {
        rowsPerPageSelect.addEventListener('change', function() {
            rowsPerPage = parseInt(this.value);
            currentPage = 1;
            renderTickets();
            updatePagination();
        });
    }
}

// Table handlers setup
function setupTableHandlers() {
    // Table sorting will be handled by the sortTable function
    // which is called from onclick attributes in the HTML
}

// Modal handlers setup
function setupModalHandlers() {
    // Add any modal-specific handlers here
    console.log('Modal handlers set up');
}

// Handle document attachment
function handleDocumentAttachment(event) {
    const files = event.target.files;
    if (files.length > 0) {
        showNotification(`${files.length} document(s) attached successfully`, 'success');
        
        // Here you would typically upload the files to a server
        // For now, we'll just simulate the process
        console.log('Documents attached:', Array.from(files).map(f => f.name));
    }
}

// Handle CSV import
function handleCsvImport(event) {
    const file = event.target.files[0];
    if (file && file.type === 'text/csv') {
        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                const csv = e.target.result;
                const importedTickets = parseCSV(csv);
                
                // Add imported tickets to the existing array
                tickets = tickets.concat(importedTickets);
                
                showNotification(`${importedTickets.length} tickets imported successfully`, 'success');
                renderTickets();
                updateStatistics();
            } catch (error) {
                showNotification('Error importing CSV file: ' + error.message, 'error');
            }
        };
        reader.readAsText(file);
    } else {
        showNotification('Please select a valid CSV file', 'error');
    }
}

// Parse CSV data
function parseCSV(csv) {
    const lines = csv.split('\n');
    const headers = lines[0].split(',').map(h => h.trim());
    const tickets = [];
    
    for (let i = 1; i < lines.length; i++) {
        if (lines[i].trim()) {
            const values = lines[i].split(',').map(v => v.trim());
            const ticket = {};
            
            headers.forEach((header, index) => {
                ticket[header] = values[index] || '';
            });
            
            // Add required fields if missing
            ticket.id = ticket.id || Date.now() + Math.random();
            ticket.dateSubmitted = ticket.dateSubmitted || new Date().toISOString().split('T')[0];
            ticket.status = ticket.status || 'Open';
            
            tickets.push(ticket);
        }
    }
    
    return tickets;
}

// Open external links
function openExternalLink(service) {
    const urls = {
        hexagon: 'https://hexagon.com',
        servicenow: 'https://servicenow.com'
    };
    
    const url = urls[service];
    if (url) {
        window.open(url, '_blank');
        showNotification(`Opening ${service.charAt(0).toUpperCase() + service.slice(1)}...`, 'info');
    }
}

// Export data functions
// Export data function with enhanced debugging
function exportData(format) {
    console.log(`Export button clicked: ${format}`);
    console.log(`Current tickets count: ${tickets.length}`);
    
    if (tickets.length === 0) {
        showNotification('No data to export', 'warning');
        console.log('Export cancelled: No tickets to export');
        return;
    }

    try {
        switch (format) {
            case 'csv':
                console.log('Attempting CSV export...');
                exportToCSV();
                break;
            case 'excel':
                console.log('Attempting Excel export...');
                exportToExcel();
                break;
            case 'json':
                console.log('Attempting JSON export...');
                exportToJSON();
                break;
            case 'pdf':
                console.log('Attempting PDF export...');
                exportToPDF();
                break;
            case 'html':
                console.log('Attempting HTML export...');
                exportToHTML();
                break;
            default:
                console.error('Unsupported export format:', format);
                showNotification('Unsupported export format', 'error');
        }
    } catch (error) {
        console.error('Export error:', error);
        showNotification(`Export failed: ${error.message}`, 'error');
    }
}

// Export to CSV
function exportToCSV() {
    const headers = ['Date Submitted', 'Date Due', 'Hexagon Ticket', 'ServiceNow Ticket', 'Location', 'Devices', 'Supervisor', 'Tech', 'Status'];
    const csvContent = [
        headers.join(','),
        ...tickets.map(ticket => [
            ticket.dateSubmitted || '',
            ticket.dateDue || '',
            ticket.hexagonTicket || '',
            ticket.serviceNowTicket || '',
            ticket.location || '',
            ticket.devices || '',
            ticket.supervisor || '',
            ticket.tech || '',
            ticket.status || ''
        ].join(','))
    ].join('\n');

    downloadFile(csvContent, 'tickets.csv', 'text/csv');
    showNotification('CSV exported successfully', 'success');
}

// Export to Excel (requires XLSX library)
function exportToExcel() {
    if (typeof XLSX === 'undefined') {
        showNotification('Excel export library not loaded', 'error');
        return;
    }

    const ws = XLSX.utils.json_to_sheet(tickets);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Tickets');
    
    XLSX.writeFile(wb, 'tickets.xlsx');
    showNotification('Excel file exported successfully', 'success');
}

// Export to JSON
function exportToJSON() {
    const jsonContent = JSON.stringify(tickets, null, 2);
    downloadFile(jsonContent, 'tickets.json', 'application/json');
    showNotification('JSON exported successfully', 'success');
}

// Export to PDF (requires jsPDF library)
function exportToPDF() {
    if (typeof jsPDF === 'undefined') {
        showNotification('PDF export library not loaded', 'error');
        return;
    }

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    doc.setFontSize(16);
    doc.text('HexTrackr Tickets Report', 20, 20);
    
    // Add table
    const headers = [['Date Submitted', 'Date Due', 'Hexagon #', 'ServiceNow #', 'Location', 'Status']];
    const data = tickets.map(ticket => [
        ticket.dateSubmitted || '',
        ticket.dateDue || '',
        ticket.hexagonTicket || '',
        ticket.serviceNowTicket || '',
        ticket.location || '',
        ticket.status || ''
    ]);

    doc.autoTable({
        head: headers,
        body: data,
        startY: 30,
        styles: { fontSize: 8 }
    });

    doc.save('tickets.pdf');
    showNotification('PDF exported successfully', 'success');
}

// Export to HTML
function exportToHTML() {
    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <title>HexTrackr Tickets Report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        table { border-collapse: collapse; width: 100%; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f2f2f2; }
        h1 { color: #667eea; }
    </style>
</head>
<body>
    <h1>HexTrackr Tickets Report</h1>
    <p>Generated on: ${new Date().toLocaleString()}</p>
    <table>
        <thead>
            <tr>
                <th>Date Submitted</th>
                <th>Date Due</th>
                <th>Hexagon Ticket</th>
                <th>ServiceNow Ticket</th>
                <th>Location</th>
                <th>Devices</th>
                <th>Supervisor</th>
                <th>Tech</th>
                <th>Status</th>
            </tr>
        </thead>
        <tbody>
            ${tickets.map(ticket => `
                <tr>
                    <td>${ticket.dateSubmitted || ''}</td>
                    <td>${ticket.dateDue || ''}</td>
                    <td>${ticket.hexagonTicket || ''}</td>
                    <td>${ticket.serviceNowTicket || ''}</td>
                    <td>${ticket.location || ''}</td>
                    <td>${ticket.devices || ''}</td>
                    <td>${ticket.supervisor || ''}</td>
                    <td>${ticket.tech || ''}</td>
                    <td>${ticket.status || ''}</td>
                </tr>
            `).join('')}
        </tbody>
    </table>
</body>
</html>`;

    downloadFile(htmlContent, 'tickets.html', 'text/html');
    showNotification('HTML report exported successfully', 'success');
}

// Download file helper
function downloadFile(content, filename, mimeType) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// Enhanced sortTable function with debugging
function sortTable(column) {
    console.log(`Sort table clicked: ${column}`);
    console.log(`Current sort: ${sortColumn} ${sortDirection}`);
    
    if (sortColumn === column) {
        sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
        sortColumn = column;
        sortDirection = 'asc';
    }

    console.log(`New sort: ${sortColumn} ${sortDirection}`);

    // Update sort indicators
    updateSortIndicators();
    
    try {
        // Sort tickets
        tickets.sort((a, b) => {
            let aVal = a[column] || '';
            let bVal = b[column] || '';
            
            // Handle dates
            if (column.includes('date') || column.includes('Date')) {
                aVal = new Date(aVal);
                bVal = new Date(bVal);
            }
            
            if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
            if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
            return 0;
        });

        console.log('Tickets sorted successfully');
        renderTickets();
        
    } catch (error) {
        console.error('Sort error:', error);
        showNotification(`Sort failed: ${error.message}`, 'error');
    }
}

// Update sort indicators
function updateSortIndicators() {
    const headers = document.querySelectorAll('.sortable-header');
    headers.forEach(header => {
        header.classList.remove('sort-asc', 'sort-desc');
        if (header.dataset.column === sortColumn) {
            header.classList.add(`sort-${sortDirection}`);
        }
    });
}

// Enhanced loadTickets function with debugging
function loadTickets() {
    console.log('Loading tickets from localStorage...');
    
    const savedTickets = localStorage.getItem('hextrackr-tickets');
    if (savedTickets) {
        try {
            tickets = JSON.parse(savedTickets);
            console.log(`Loaded ${tickets.length} tickets from localStorage`);
        } catch (error) {
            console.error('Error parsing saved tickets:', error);
            // Initialize with sample data if parsing fails
            initializeSampleData();
        }
    } else {
        console.log('No saved tickets found, initializing with sample data');
        initializeSampleData();
    }
    
    renderTickets();
    updateStatistics();
}

// Initialize with sample data
function initializeSampleData() {
    tickets = [
        {
            id: 1,
            dateSubmitted: '2024-01-15',
            dateDue: '2024-01-30',
            hexagonTicket: 'HEX-001',
            serviceNowTicket: 'SNW-001',
            location: 'Building A',
            devices: 'Server Rack 1',
            supervisor: 'John Smith',
            tech: 'Jane Doe',
            status: 'In Progress'
        },
        {
            id: 2,
            dateSubmitted: '2024-01-16',
            dateDue: '2024-02-01',
            hexagonTicket: 'HEX-002',
            serviceNowTicket: 'SNW-002',
            location: 'Building B',
            devices: 'Network Switch',
            supervisor: 'Mike Johnson',
            tech: 'Bob Wilson',
            status: 'Completed'
        },
        {
            id: 3,
            dateSubmitted: '2024-01-17',
            dateDue: '2024-02-05',
            hexagonTicket: 'HEX-003',
            serviceNowTicket: 'SNW-003',
            location: 'Building C',
            devices: 'Firewall',
            supervisor: 'Sarah Davis',
            tech: 'Alice Brown',
            status: 'Open'
        }
    ];
    saveTickets();
    console.log(`Initialized with ${tickets.length} sample tickets`);
}

// Save tickets to localStorage
function saveTickets() {
    localStorage.setItem('hextrackr-tickets', JSON.stringify(tickets));
}

// Render tickets table
// Enhanced renderTickets function with debugging
function renderTickets() {
    console.log(`Rendering tickets: ${tickets.length} total, page ${currentPage}`);
    
    const tbody = document.getElementById('ticketsTableBody');
    if (!tbody) {
        console.error('Tickets table body not found');
        return;
    }

    const startIndex = (currentPage - 1) * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    const pageTickets = tickets.slice(startIndex, endIndex);
    
    console.log(`Showing tickets ${startIndex + 1}-${Math.min(endIndex, tickets.length)} of ${tickets.length}`);

    tbody.innerHTML = pageTickets.map(ticket => `
        <tr>
            <td>${ticket.dateSubmitted || ''}</td>
            <td>${ticket.dateDue || ''}</td>
            <td>${ticket.hexagonTicket || ''}</td>
            <td>${ticket.serviceNowTicket || ''}</td>
            <td>${ticket.location || ''}</td>
            <td>${ticket.devices || ''}</td>
            <td>${ticket.supervisor || ''}</td>
            <td>${ticket.tech || ''}</td>
            <td>
                <span class="badge ${getStatusBadgeClass(ticket.status)}">
                    ${ticket.status || 'Unknown'}
                </span>
            </td>
            <td>
                <div class="btn-group btn-group-sm" role="group">
                    <button type="button" class="btn btn-outline-primary btn-sm" onclick="editTicket(${ticket.id})" title="Edit">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button type="button" class="btn btn-outline-danger btn-sm" onclick="deleteTicket(${ticket.id})" title="Delete">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');

    updatePaginationInfo();
    console.log('Tickets rendered successfully');
}

// Get status badge class
function getStatusBadgeClass(status) {
    switch (status?.toLowerCase()) {
        case 'completed': return 'bg-success';
        case 'in progress': return 'bg-warning';
        case 'overdue': return 'bg-danger';
        case 'open': return 'bg-info';
        default: return 'bg-secondary';
    }
}

// Update statistics
function updateStatistics() {
    const totalTickets = tickets.length;
    const inProgress = tickets.filter(t => t.status === 'In Progress').length;
    const completed = tickets.filter(t => t.status === 'Completed').length;
    const overdue = tickets.filter(t => {
        if (!t.dateDue) return false;
        const dueDate = new Date(t.dateDue);
        const today = new Date();
        return dueDate < today && t.status !== 'Completed';
    }).length;

    document.getElementById('totalTickets').textContent = totalTickets;
    document.getElementById('inProgressTickets').textContent = inProgress;
    document.getElementById('completedTickets').textContent = completed;
    document.getElementById('overdueTickets').textContent = overdue;
}

// Update pagination
function updatePagination() {
    const totalPages = Math.ceil(tickets.length / rowsPerPage);
    const paginationControls = document.getElementById('paginationControls');
    
    if (!paginationControls) return;

    let paginationHTML = '';
    
    // Previous button
    paginationHTML += `
        <li class="page-item ${currentPage === 1 ? 'disabled' : ''}">
            <a class="page-link" href="#" onclick="changePage(${currentPage - 1})">Previous</a>
        </li>
    `;
    
    // Page numbers
    for (let i = 1; i <= totalPages; i++) {
        if (i === 1 || i === totalPages || (i >= currentPage - 2 && i <= currentPage + 2)) {
            paginationHTML += `
                <li class="page-item ${i === currentPage ? 'active' : ''}">
                    <a class="page-link" href="#" onclick="changePage(${i})">${i}</a>
                </li>
            `;
        } else if (i === currentPage - 3 || i === currentPage + 3) {
            paginationHTML += '<li class="page-item disabled"><span class="page-link">...</span></li>';
        }
    }
    
    // Next button
    paginationHTML += `
        <li class="page-item ${currentPage === totalPages ? 'disabled' : ''}">
            <a class="page-link" href="#" onclick="changePage(${currentPage + 1})">Next</a>
        </li>
    `;
    
    paginationControls.innerHTML = paginationHTML;
}

// Update pagination info
function updatePaginationInfo() {
    const startIndex = (currentPage - 1) * rowsPerPage + 1;
    const endIndex = Math.min(startIndex + rowsPerPage - 1, tickets.length);
    const paginationInfo = document.getElementById('paginationInfo');
    
    if (paginationInfo) {
        paginationInfo.textContent = `Showing ${startIndex} to ${endIndex} of ${tickets.length} entries`;
    }
}

// Change page
function changePage(page) {
    const totalPages = Math.ceil(tickets.length / rowsPerPage);
    if (page >= 1 && page <= totalPages) {
        currentPage = page;
        renderTickets();
        updatePagination();
    }
}

// Edit ticket
function editTicket(id) {
    const ticket = tickets.find(t => t.id == id);
    if (ticket) {
        // You can implement a modal or form for editing here
        showNotification(`Edit ticket ${ticket.hexagonTicket || id}`, 'info');
        console.log('Edit ticket:', ticket);
    }
}

// Delete ticket
function deleteTicket(id) {
    if (confirm('Are you sure you want to delete this ticket?')) {
        tickets = tickets.filter(t => t.id != id);
        saveTickets();
        renderTickets();
        updateStatistics();
        updatePagination();
        showNotification('Ticket deleted successfully', 'success');
    }
}

// Show notification
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `alert alert-${type === 'error' ? 'danger' : type} alert-dismissible fade show position-fixed`;
    notification.style.cssText = 'top: 20px; right: 20px; z-index: 1050; min-width: 300px;';
    notification.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    document.body.appendChild(notification);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
        }
    }, 5000);
}

// Load settings from localStorage
function loadSettings() {
    const savedSettings = localStorage.getItem('hextrackr-settings');
    if (savedSettings) {
        const settings = JSON.parse(savedSettings);
        rowsPerPage = settings.rowsPerPage || 25;
        
        // Apply settings to UI
        const rowsSelect = document.getElementById('rowsPerPage');
        if (rowsSelect) {
            rowsSelect.value = rowsPerPage;
        }
    }
}

// Save settings to localStorage
function saveSettings() {
    const settings = {
        rowsPerPage: rowsPerPage
    };
    localStorage.setItem('hextrackr-settings', JSON.stringify(settings));
}

// Export this object for debugging and global access
window.HexTrackrTickets = {
    tickets,
    exportData,
    sortTable,
    changePage,
    editTicket,
    deleteTicket,
    showNotification,
    renderTickets,
    loadTickets,
    initializeSampleData
};

// Make key functions globally available
window.exportData = exportData;
window.sortTable = sortTable;
window.editTicket = editTicket;
window.deleteTicket = deleteTicket;

// Add test function for debugging
window.testButtonClick = function(buttonType, param = null) {
    console.log(`Testing button click: ${buttonType}`, param);
    
    switch(buttonType) {
        case 'export':
            exportData(param || 'csv');
            break;
        case 'sort':
            sortTable(param || 'dateSubmitted');
            break;
        case 'edit':
            editTicket(param || 1);
            break;
        case 'delete':
            deleteTicket(param || 1);
            break;
        default:
            console.log('Unknown button type');
    }
};

console.log('HexTrackr Tickets global functions exposed');
console.log('Available functions:', Object.keys(window.HexTrackrTickets));
console.log('Test with: testButtonClick("export", "csv") or testButtonClick("sort", "dateSubmitted")');
