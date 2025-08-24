# HexTrackr Copilot Instructions

## Project Overview
HexTrackr is a dual-purpose cybersecurity management system with two main applications:
1. **Ticket Management** (`tickets.html` + `app.js`) - Hexagon security ticket workflow management
2. **Vulnerability Management** (`vulnerabilities.html`) - Multi-vendor vulnerability data analysis

## Architecture & Data Flow

### Storage Strategy
- **Local Storage**: Primary data persistence using `localStorage` for tickets (`hexagonTickets` key)
- **IndexedDB**: Vulnerability data storage via `localforage` library (`hextrackr` database)
- **No Backend**: Pure client-side application with CSV import/export capabilities

### Key Components
- **HexagonTicketsManager Class**: Main controller in `app.js` handling all ticket operations
- **Vulnerability Manager**: Embedded in `vulnerabilities.html` as global functions and variables
- **Device Management**: Smart auto-increment system for network device names (e.g., `host01` → `host02`)

## Critical Development Patterns

### Ticket System Conventions
```javascript
// Ticket ID generation: Always use timestamp
id: Date.now().toString()

// Required fields validation: Only location is mandatory
if (!location.trim()) { /* validation error */ }

// Device smart naming: Extracts prefix + number, auto-increments with zero-padding
// nswan01 → nswan02, host030 → host031
```

### Data Persistence
```javascript
// Tickets: Direct localStorage
this.saveTickets() → localStorage.setItem('hexagonTickets', JSON.stringify(this.tickets))

// Vulnerabilities: IndexedDB wrapper
await dbSet('hextrackr_vuln_data', vulnData)
```

### PDF Generation & File Bundling
- Uses `jsPDF` for standardized Hexagon ticket PDFs with specific formatting requirements
- JSZip integration creates downloadable bundles with PDFs, shared docs, and attachments
- Template includes Service Now integration instructions and ITCC contact info

## UI/UX Patterns

### Modal Management
- Bootstrap 5 modals with `data-ticket-id` attributes for cross-modal communication
- Edit/View flow: View modal → Edit modal with 300ms transition delay
- Form state management through `currentEditingId` and `currentViewingId` properties

### Pagination & Filtering
- Consistent pagination across both applications (assets, vulnerabilities, tickets)
- Real-time search with highlighting using `highlightSearch()` method
- Filter combinations: status + location + search term with page reset on filter change

### Device Input Enhancement
- Drag-and-drop reordering with SortableJS
- Smart device name suggestions based on previous entries
- Add/remove buttons with automatic focus management

## Integration Points

### External Dependencies
```html
<!-- Core Libraries -->
Bootstrap 5.3.0, Font Awesome 6.4.0, ApexCharts (vulnerabilities only)

<!-- Document Processing -->
jsPDF + AutoTable, JSZip, XLSX (SheetJS), PapaParse (CSV)

<!-- Advanced Features -->
SortableJS (drag-drop), LocalForage (IndexedDB), CryptoJS (planned API auth)
```

### API Integration Framework
- Cisco PSIRT API integration (OAuth2 ready)
- Placeholder infrastructure for Tenable, Qualys, Palo Alto APIs
- Future SNMP polling and Ansible automation integration planned

## Common Development Tasks

### Adding New Ticket Fields
1. Update form HTML in `tickets.html`
2. Modify `saveTicket()` method in `HexagonTicketsManager`
3. Update `renderTickets()` table structure
4. Adjust PDF generation in `bundleTicketFiles()`

### CSV Import/Export Extensions
- CSV headers must match `sample-data.js` structure
- Location field is the only required field for import validation
- Export functions support multiple formats: CSV, Excel, JSON, PDF, HTML

### Vulnerability Data Processing
- CSV parser expects standard scanner formats (Tenable, Qualys, Nessus)
- VPR scoring integration for risk prioritization
- Asset grouping by hostname with severity counting

## Testing & Data Management

### Sample Data
- `sample-data.js` provides realistic test data with `loadSampleData()` function
- `clearAllData()` function for complete data reset during development

### File Naming Conventions
- Bundle files: `{SiteName}_{YYYYMMDD}_{TicketNumber}_bundle.zip`
- PDF exports: Standardized Hexagon format with company branding

## Security Considerations
- All API credentials stored in localStorage (production should use secure vault)
- File uploads processed entirely client-side (no server upload risks)
- CORS considerations for external API integrations
