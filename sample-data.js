// Sample test data for HexTrackr
// This can be imported for testing purposes

const sampleTickets = [
    {
        "id": "1692555600000",
        "dateSubmitted": "2025-08-15",
        "dateDue": "2025-08-22",
        "hexagonTicket": "HEX-2025-001",
        "serviceNowTicket": "SN123456",
        "location": "Data Center Alpha",
        "devices": ["host01", "host30", "host03"],
        "supervisor": "John Smith",
        "tech": "Alice Johnson",
        "status": "In Progress",
        "notes": "Initial deployment phase for new security updates",
        "createdAt": "2025-08-15T10:30:00.000Z",
        "updatedAt": "2025-08-15T10:30:00.000Z"
    },
    {
        "id": "1692642000000",
        "dateSubmitted": "2025-08-16",
        "dateDue": "2025-08-23",
        "hexagonTicket": "HEX-2025-002",
        "serviceNowTicket": "SN123457",
        "location": "Building B Server Room",
        "devices": ["server-prod-01", "server-prod-02"],
        "supervisor": "Sarah Wilson",
        "tech": "Bob Martinez",
        "status": "Open",
        "notes": "Routine maintenance and security patching",
        "createdAt": "2025-08-16T09:15:00.000Z",
        "updatedAt": "2025-08-16T09:15:00.000Z"
    },
    {
        "id": "1692728400000",
        "dateSubmitted": "2025-08-17",
        "dateDue": "2025-08-24",
        "hexagonTicket": "HEX-2025-003",
        "serviceNowTicket": "",
        "location": "Remote Site C",
        "devices": ["host15", "host16", "host17", "backup-srv-01"],
        "supervisor": "Mike Davis",
        "tech": "Carol Thompson",
        "status": "Completed",
        "notes": "Successfully completed vulnerability assessment and remediation",
        "createdAt": "2025-08-17T14:20:00.000Z",
        "updatedAt": "2025-08-17T16:45:00.000Z"
    },
    {
        "id": "1692814800000",
        "dateSubmitted": "2025-08-18",
        "dateDue": "2025-08-19",
        "hexagonTicket": "HEX-2025-004",
        "serviceNowTicket": "SN123459",
        "location": "Data Center Alpha",
        "devices": ["critical-srv-01"],
        "supervisor": "John Smith",
        "tech": "David Chen",
        "status": "Open",
        "notes": "URGENT: Critical security vulnerability requires immediate attention",
        "createdAt": "2025-08-18T08:00:00.000Z",
        "updatedAt": "2025-08-18T08:00:00.000Z"
    },
    {
        "id": "1692901200000",
        "dateSubmitted": "2025-08-19",
        "dateDue": "2025-08-26",
        "hexagonTicket": "HEX-2025-005",
        "serviceNowTicket": "SN123460",
        "location": "Branch Office East",
        "devices": ["workstation-01", "workstation-02", "workstation-03"],
        "supervisor": "Lisa Garcia",
        "tech": "Emily Rodriguez",
        "status": "In Progress",
        "notes": "Desktop security updates and compliance checks",
        "createdAt": "2025-08-19T11:30:00.000Z",
        "updatedAt": "2025-08-19T13:15:00.000Z"
    },
    {
        "id": "1692987600000",
        "dateSubmitted": "2025-08-20",
        "dateDue": "2025-08-27",
        "hexagonTicket": "HEX-2025-006",
        "serviceNowTicket": "SN123461",
        "subject": "Q4 Planned Maintenance Window",
        "taskInstruction": "Schedule and prepare for quarterly maintenance including system updates, security patches, and hardware checks across all production servers.",
        "location": "All Sites",
        "devices": ["nswan01", "nswan02", "nswan03", "nswan04"],
        "supervisor": "Jennifer Lee",
        "tech": "Michael Rodriguez",
        "status": "Pending",
        "notes": "Waiting for approval from management team. All technical preparations completed.",
        "createdAt": "2025-08-20T09:00:00.000Z",
        "updatedAt": "2025-08-20T09:00:00.000Z"
    }
];

// Function to load sample data (for testing)
function loadSampleData() {
    localStorage.setItem('hexagonTickets', JSON.stringify(sampleTickets));
    if (typeof ticketManager !== 'undefined') {
        ticketManager.loadTickets();
        ticketManager.renderTickets();
        ticketManager.updateStatistics();
        ticketManager.populateLocationFilter();
        console.log('Sample data loaded successfully!');
    }
}

// Function to clear all data
function clearAllData() {
    if (confirm('Are you sure you want to clear all ticket data? This cannot be undone.')) {
        localStorage.removeItem('hexagonTickets');
        if (typeof ticketManager !== 'undefined') {
            ticketManager.tickets = [];
            ticketManager.renderTickets();
            ticketManager.updateStatistics();
            ticketManager.populateLocationFilter();
            console.log('All data cleared successfully!');
        }
    }
}

console.log('Sample data module loaded. Use loadSampleData() to load test data or clearAllData() to clear existing data.');
