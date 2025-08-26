/**
 * Tickets App JavaScript - Standalone
 * Isolated ticket management functionality
 */

// Global variables for tickets
let tickets = [];
let currentPage = 1;
let rowsPerPage = 25;
let sortColumn = '';
let sortDirection = 'asc';

// DOM Content Loaded Event
document.addEventListener('DOMContentLoaded', function() {
    console.log('Tickets page initializing...');
    initializeTicketsApp();
});

function initializeTicketsApp() {
    console.log('Starting Tickets initialization...');
    
    // Load tickets from storage
    loadTicketsFromStorage();
    
    // Setup event listeners
    setupTicketsEventListeners();
    
    // Update display
    updateTicketsStatistics();
    updateTicketsTable();
    
    console.log('Tickets initialization complete');
}

function setupTicketsEventListeners() {
    // Add ticket button
    const addTicketBtn = document.querySelector('[data-bs-target="#ticketModal"]');
    if (addTicketBtn) {
        addTicketBtn.addEventListener('click', () => {
            resetTicketForm();
        });
    }

    // Import CSV button
    const importCsvBtn = document.getElementById('importCsvBtn');
    const csvImportInput = document.getElementById('csvImportInput');
    
    if (importCsvBtn && csvImportInput) {
        importCsvBtn.addEventListener('click', () => {
            csvImportInput.click();
        });
        
        csvImportInput.addEventListener('change', handleCsvImport);
    }

    // Export buttons
    const exportButtons = document.querySelectorAll('[onclick^="exportData"]');
    exportButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const format = btn.textContent.trim().toLowerCase();
            exportTicketsData(format);
        });
    });

    console.log('Tickets event listeners setup complete');
}

function loadTicketsFromStorage() {
    try {
        const saved = localStorage.getItem('hexTrackrTickets');
        if (saved) {
            tickets = JSON.parse(saved);
            console.log(`Loaded ${tickets.length} tickets from storage`);
        }
    } catch (error) {
        console.warn('Could not load tickets from storage:', error);
        tickets = [];
    }
}

function saveTicketsToStorage() {
    try {
        localStorage.setItem('hexTrackrTickets', JSON.stringify(tickets));
    } catch (error) {
        console.warn('Could not save tickets to storage:', error);
    }
}

function updateTicketsStatistics() {
    const stats = calculateTicketsStats();
    
    // Update statistics cards
    const elements = {
        totalTickets: document.getElementById('totalTickets'),
        openTickets: document.getElementById('openTickets'),
        overdueTickets: document.getElementById('overdueTickets'),
        completedTickets: document.getElementById('completedTickets')
    };

    // Safe update with null checks
    if (elements.totalTickets) elements.totalTickets.textContent = stats.total;
    if (elements.openTickets) elements.openTickets.textContent = stats.open;
    if (elements.overdueTickets) elements.overdueTickets.textContent = stats.overdue;
    if (elements.completedTickets) elements.completedTickets.textContent = stats.completed;
}

function calculateTicketsStats() {
    const now = new Date();
    
    return {
        total: tickets.length,
        open: tickets.filter(t => ['Open', 'In Progress', 'Pending'].includes(t.status)).length,
        overdue: tickets.filter(t => {
            const dueDate = new Date(t.dateDue);
            return dueDate < now && !['Completed', 'Closed'].includes(t.status);
        }).length,
        completed: tickets.filter(t => ['Completed', 'Closed'].includes(t.status)).length
    };
}

function updateTicketsTable() {
    console.log('Updating tickets table...');
    
    const tableBody = document.getElementById('ticketsTableBody');
    if (!tableBody) {
        console.warn('Table body not found');
        return;
    }
    
    // Clear existing rows
    tableBody.innerHTML = '';
    
    if (tickets.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="10" class="text-center text-muted">No tickets available</td></tr>';
        return;
    }
    
    // Add ticket rows
    tickets.forEach((ticket, index) => {
        const row = createTicketRow(ticket, index);
        tableBody.appendChild(row);
    });
    
    // Update pagination info
    updatePaginationInfo();
}

function createTicketRow(ticket, index) {
    const row = document.createElement('tr');
    
    // Format dates
    const dateSubmitted = ticket.dateSubmitted ? new Date(ticket.dateSubmitted).toLocaleDateString() : '';
    const dateDue = ticket.dateDue ? new Date(ticket.dateDue).toLocaleDateString() : '';
    
    // Create status badge
    const statusClass = getStatusClass(ticket.status);
    
    // Create device badges (split by semicolon and comma)
    const devicesBadges = createDeviceBadges(ticket.devices || '');
    
    // Create supervisor badges (split by semicolon and comma)
    const supervisorBadges = createSupervisorBadges(ticket.supervisor || '');
    
    row.innerHTML = `
        <td>${dateSubmitted}</td>
        <td>${dateDue}</td>
        <td>${ticket.hexagonTicket || ''}</td>
        <td>${ticket.serviceNowTicket || ''}</td>
        <td>${ticket.location || ''}</td>
        <td>${devicesBadges}</td>
        <td>${supervisorBadges}</td>
        <td>${ticket.tech || ''}</td>
        <td><span class="status-badge ${statusClass}">${ticket.status || ''}</span></td>
        <td>
            <button class="btn btn-sm btn-outline-primary me-1" onclick="editTicket(${index})" title="Edit">
                <i class="fas fa-edit"></i>
            </button>
            <button class="btn btn-sm btn-outline-danger" onclick="deleteTicket(${index})" title="Delete">
                <i class="fas fa-trash"></i>
            </button>
        </td>
    `;
    
    return row;
}

function createDeviceBadges(devicesString) {
    if (!devicesString || devicesString.trim() === '') return '';
    
    // Split by semicolon and comma, then clean up
    const devices = devicesString
        .split(/[;,]/)
        .map(device => device.trim())
        .filter(device => device.length > 0);
    
    return devices
        .map(device => `<span class="devices-badge">${device}</span>`)
        .join(' ');
}

function createSupervisorBadges(supervisorString) {
    if (!supervisorString || supervisorString.trim() === '') return '';
    
    // Split by semicolon and comma, then clean up
    const supervisors = supervisorString
        .split(/[;,]/)
        .map(supervisor => supervisor.trim())
        .filter(supervisor => supervisor.length > 0);
    
    return supervisors
        .map(supervisor => `<span class="supervisor-badge">${supervisor}</span>`)
        .join(' ');
}

function getStatusClass(status) {
    const statusLower = (status || '').toLowerCase();
    switch (statusLower) {
        case 'open': return 'status-open';
        case 'in progress': return 'status-in-progress';
        case 'completed': return 'status-completed';
        case 'closed': return 'status-closed';
        case 'pending': return 'status-pending';
        default: return 'status-default';
    }
}

function updatePaginationInfo() {
    const paginationInfo = document.querySelector('.table-pagination-info');
    if (paginationInfo) {
        const total = tickets.length;
        paginationInfo.textContent = `Showing 1 to ${total} of ${total} entries`;
    }
}

function editTicket(index) {
    console.log(`Editing ticket at index ${index}:`, tickets[index]);
    // TODO: Implement ticket editing
    alert('Edit ticket functionality coming soon!');
}

function deleteTicket(index) {
    if (confirm('Are you sure you want to delete this ticket?')) {
        tickets.splice(index, 1);
        saveTicketsToStorage();
        updateTicketsStatistics();
        updateTicketsTable();
        console.log(`Deleted ticket at index ${index}`);
    }
}

// Make functions globally available
window.editTicket = editTicket;
window.deleteTicket = deleteTicket;

function resetTicketForm() {
    // Reset form when adding new ticket
    console.log('Resetting ticket form...');
}

function exportTicketsData(format) {
    console.log(`Exporting tickets data as ${format}...`);
    
    if (tickets.length === 0) {
        alert('No tickets to export');
        return;
    }

    try {
        switch (format) {
            case 'csv':
                exportAsCSV();
                break;
            case 'excel':
                exportAsExcel();
                break;
            case 'json':
                exportAsJSON();
                break;
            case 'pdf':
                exportAsPDF();
                break;
            case 'html':
                exportAsHTML();
                break;
            default:
                console.warn(`Unknown export format: ${format}`);
        }
    } catch (error) {
        console.error('Export error:', error);
        alert('Export failed. Please try again.');
    }
}

function exportAsCSV() {
    const csvData = [
        ['Date Submitted', 'Date Due', 'Hexagon Ticket #', 'ServiceNow #', 'Location', 'Devices', 'Supervisor', 'Tech', 'Status'],
        ...tickets.map(t => [
            t.dateSubmitted || '',
            t.dateDue || '',
            t.hexagonTicket || '',
            t.serviceNowTicket || '',
            t.location || '',
            (t.devices || []).join(', '),
            t.supervisor || '',
            t.tech || '',
            t.status || ''
        ])
    ];

    const csvContent = csvData.map(row => row.map(field => `"${field}"`).join(',')).join('\n');
    downloadFile(csvContent, 'tickets.csv', 'text/csv');
}

function exportAsJSON() {
    const jsonContent = JSON.stringify(tickets, null, 2);
    downloadFile(jsonContent, 'tickets.json', 'application/json');
}

function exportAsExcel() {
    if (typeof XLSX === 'undefined') {
        alert('Excel export requires XLSX library');
        return;
    }
    
    const worksheet = XLSX.utils.json_to_sheet(tickets);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Tickets');
    XLSX.writeFile(workbook, 'tickets.xlsx');
}

function exportAsPDF() {
    if (typeof jsPDF === 'undefined') {
        alert('PDF export requires jsPDF library');
        return;
    }
    
    // Basic PDF export
    console.log('PDF export functionality to be implemented');
}

function exportAsHTML() {
    const htmlContent = generateHTMLReport();
    downloadFile(htmlContent, 'tickets.html', 'text/html');
}

function generateHTMLReport() {
    return `
<!DOCTYPE html>
<html>
<head>
    <title>HexTrackr Tickets Report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        table { border-collapse: collapse; width: 100%; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f2f2f2; }
    </style>
</head>
<body>
    <h1>HexTrackr Tickets Report</h1>
    <p>Generated: ${new Date().toLocaleString()}</p>
    <table>
        <thead>
            <tr>
                <th>Date Submitted</th>
                <th>Location</th>
                <th>Status</th>
                <th>Supervisor</th>
                <th>Tech</th>
            </tr>
        </thead>
        <tbody>
            ${tickets.map(ticket => `
                <tr>
                    <td>${ticket.dateSubmitted || ''}</td>
                    <td>${ticket.location || ''}</td>
                    <td>${ticket.status || ''}</td>
                    <td>${ticket.supervisor || ''}</td>
                    <td>${ticket.tech || ''}</td>
                </tr>
            `).join('')}
        </tbody>
    </table>
</body>
</html>`;
}

function downloadFile(content, filename, mimeType) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    
    URL.revokeObjectURL(url);
}

function handleCsvImport(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const csvText = e.target.result;
            const importedTickets = parseCsvToTickets(csvText);
            
            if (importedTickets.length > 0) {
                // Add imported tickets to existing tickets
                tickets.push(...importedTickets);
                saveTicketsToStorage();
                updateTicketsStatistics();
                updateTicketsTable();
                
                showImportSuccess(importedTickets.length);
            } else {
                showImportError('No valid tickets found in CSV file');
            }
        } catch (error) {
            console.error('CSV import error:', error);
            showImportError('Error parsing CSV file: ' + error.message);
        }
    };
    reader.readAsText(file);
    
    // Reset file input
    event.target.value = '';
}

function parseCsvToTickets(csvText) {
    const lines = csvText.split('\n').filter(line => line.trim());
    if (lines.length < 2) return [];
    
    // Parse header row
    const headers = lines[0].split(',').map(h => h.replace(/['"]/g, '').trim());
    console.log('CSV Headers:', headers);
    
    const tickets = [];
    
    for (let i = 1; i < lines.length; i++) {
        try {
            const values = parseCsvLine(lines[i]);
            if (values.length >= headers.length - 1) { // Allow for missing last column
                const ticket = createTicketFromCsvRow(headers, values);
                if (ticket.hexagonTicket || ticket.serviceNowTicket) { // Must have at least one ticket number
                    tickets.push(ticket);
                }
            }
        } catch (error) {
            console.warn(`Error parsing line ${i + 1}:`, error);
        }
    }
    
    return tickets;
}

function parseCsvLine(line) {
    const values = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
        const char = line[i];
        const nextChar = line[i + 1];
        
        if (char === '"') {
            if (inQuotes && nextChar === '"') {
                // Escaped quote
                current += '"';
                i++; // Skip next quote
            } else {
                // Start or end quotes
                inQuotes = !inQuotes;
            }
        } else if (char === ',' && !inQuotes) {
            // End of field
            values.push(current.trim());
            current = '';
        } else {
            current += char;
        }
    }
    
    // Add last field
    values.push(current.trim());
    
    return values;
}

function createTicketFromCsvRow(headers, values) {
    const ticket = {
        id: Date.now() + Math.random(), // Generate unique ID
        dateCreated: new Date().toISOString()
    };
    
    // Map CSV columns to ticket properties
    headers.forEach((header, index) => {
        const value = values[index] || '';
        
        switch (header.toLowerCase()) {
            case 'date submitted':
                ticket.dateSubmitted = value;
                break;
            case 'date due':
                ticket.dateDue = value;
                break;
            case 'hexagon ticket #':
                ticket.hexagonTicket = value.replace(/['"]/g, '');
                break;
            case 'service now #':
                ticket.serviceNowTicket = value.replace(/['"]/g, '');
                break;
            case 'location':
                ticket.location = value;
                break;
            case 'devices':
                ticket.devices = value;
                break;
            case 'supervisor':
                ticket.supervisor = value;
                break;
            case 'tech':
                ticket.tech = value;
                break;
            case 'status':
                ticket.status = value;
                break;
            case 'notes':
                ticket.notes = value;
                break;
        }
    });
    
    return ticket;
}

function showImportSuccess(count) {
    // Create a simple success message
    const alertDiv = document.createElement('div');
    alertDiv.className = 'alert alert-success alert-dismissible fade show';
    alertDiv.innerHTML = `
        <strong>Success!</strong> Imported ${count} tickets from CSV.
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    // Insert at top of container
    const container = document.querySelector('.container-fluid');
    const firstRow = container.querySelector('.row');
    container.insertBefore(alertDiv, firstRow);
    
    // Auto-dismiss after 5 seconds
    setTimeout(() => {
        if (alertDiv.parentNode) {
            alertDiv.remove();
        }
    }, 5000);
}

function showImportError(message) {
    // Create a simple error message
    const alertDiv = document.createElement('div');
    alertDiv.className = 'alert alert-danger alert-dismissible fade show';
    alertDiv.innerHTML = `
        <strong>Error!</strong> ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    // Insert at top of container
    const container = document.querySelector('.container-fluid');
    const firstRow = container.querySelector('.row');
    container.insertBefore(alertDiv, firstRow);
    
    // Auto-dismiss after 8 seconds
    setTimeout(() => {
        if (alertDiv.parentNode) {
            alertDiv.remove();
        }
    }, 8000);
}

// Global functions for tickets (maintain compatibility)
window.tickets = tickets;
window.exportData = exportTicketsData;
window.updateStatistics = updateTicketsStatistics;

console.log('Tickets app standalone JavaScript loaded');
