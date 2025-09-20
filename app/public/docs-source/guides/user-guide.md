# HexTrackr User Guide

> Complete guide for using HexTrackr's ticket and vulnerability management features

## Table of Contents

- [Ticket Management](#ticket-management)
- [Vulnerability Management](#vulnerability-management)
- [Import & Export](#import--export)
- [Settings & Preferences](#settings--preferences)

---

## Ticket Management

This section provides a comprehensive overview of the features available on the Tickets page (`/tickets.html`), from creating and managing tickets to exporting data.

## Creating and Editing Tickets

### Creating a New Ticket

1. From the main tickets view, click the **Add New Ticket** button to open the ticket modal.
2. The **Ticket Number** is automatically generated as a four-digit code (e.g., `0001`) and is not editable.
3. Fill in the required fields, including **Date Submitted**, **Date Due**, **Site**, and **Location**.
4. Add devices to the ticket using the **Devices** section (see below for details).
5. Click **Save Ticket** to create the new ticket.

### Editing an Existing Ticket

1. Find the ticket you wish to edit in the main table.
2. Click the **Edit** (pencil) icon in the **Actions** column.
3. The ticket modal will open with the existing data populated.
4. Make your changes and click **Save Ticket**.

## Device Management

The ticket modal includes a powerful interface for managing a list of devices associated with a ticket. Devices are stored in the database as a semicolon-delimited string so the boot/order sequence is preserved exactly as entered.

- **Adding Devices**: Click the **+** button on any device row to add a new device entry below it. The system will attempt to "smart increment" the device name based on the previous entry (e.g., `host01` will suggest `host02`).
- **Removing Devices**: Click the **-** button to remove a device entry.
- **Reordering Devices**: You can reorder devices to define a specific sequence (e.g., for reboots or patching).
  - **Drag and Drop**: Click and hold the drag handle (`::`) to drag a device to a new position.
  - **Arrow Buttons**: Use the up and down arrow buttons for fine-tuned positioning.
  - **Reverse Order**: Click the **Reverse** button to instantly invert the entire order of the device list.
- **Persistence Note**: CSV imports can provide comma-separated lists or JSON arrays; the importer normalizes everything into the same semicolon format used by the UI.

## Viewing and Exporting a Single Ticket

From the main ticket list, you can view a ticket's details or download a bundle of its information.

- **View Ticket**: Click the **View** (eye) icon to see a clean, markdown-formatted version of the ticket's details in a modal.
- **Download Bundle**: Click the **Download Bundle** (download icon) to get a `.zip` archive containing:
  - The ticket details in **PDF** format (generated with jsPDF using the same content as the modal).
  - The ticket details in **Markdown** format.
  - Any shared documentation uploaded during the session.
  - File attachments stored with the record. The bundler renames files to match the ticket number and sanitizes file names to avoid path traversal.

## Searching and Filtering

The ticket list can be quickly filtered to find what you need.

- **Global Search**: The main search bar filters tickets based on a wide range of fields, including the four-digit ticket #, Hexagon #, ServiceNow #, location, site, supervisor, tech, and device names.
- **Status Filter**: Use the dropdown to show tickets with a specific status (e.g., "Open", "Overdue").
- **Location Filter**: This dropdown is dynamically populated with all unique locations from the tickets in the database, allowing you to easily filter by a specific location.

## Importing Ticket Data

- **CSV Import Button**: Selecting **Import CSV** opens a file picker and routes the file through PapaParse in the browser. The parser trims whitespace, normalizes device lists (arrays, commas, or semicolons), and generates ticket numbers when the column is missing.
- **Mode Selection**: When the database already contains tickets, the importer prompts for **Replace All Data** (clears the table before importing) or **Add to Existing Data** (upsert into the current dataset). Both options call `POST /api/tickets/migrate` with a `mode` flag.
- **Error Handling**: Invalid rows surface as toast notifications and are logged in the browser console for troubleshooting. The migration endpoint responds with counts for migrated and failed rows.

## Data Export and Backup

Use the export toolbar to download the currently filtered dataset.

- **Quick Exports**: `CSV`, `Excel`, `JSON`, `PDF`, and `HTML` buttons delegate to `exportTicketsTableData(format)`. Devices are converted back to semicolon strings, and attachments are omitted for compact output.
- **Local Backup**: The CSV export mirrors the schema expected by the importer, making round-trips lossless. JSON exports include the camelCase keys consumed by the REST API so automated tooling can feed them directly into `POST /api/tickets`.
- **Error Feedback**: Export actions surface toast notifications for missing data or generation errors (for example, attempting to export when no rows match the current filters).

## ServiceNow Integration

If ServiceNow integration is configured in the settings, all ServiceNow ticket numbers in the list become clickable links that open directly to the corresponding ticket in your ServiceNow instance.

---

## Vulnerability Management

The Vulnerability Management dashboard (`vulnerabilities.html`) is a powerful tool for analyzing, tracking, and managing security vulnerabilities across your assets.

---

## Import & Export

HexTrackr provides comprehensive import and export capabilities for both ticket and vulnerability data, ensuring seamless data migration and backup operations.

### Importing Vulnerability Data

The primary way to populate the dashboard is by importing CSV files from vulnerability scanners. HexTrackr supports multiple CSV formats with advanced processing capabilities.

### Basic Import Process

1. From the dashboard, click the **Import** button.
2. You will be prompted to select a **Scan Date**. This date is critical for accurate historical trending. It should be the date the vulnerability scan was performed.
3. After confirming the date, select the CSV file from your computer.

The system will then upload and process the file. Thanks to the rollover pipeline described in the backend architecture, the new data will be integrated and the dashboard will automatically refresh.

### Progress Feedback and WebSocket Fallback

- The import dialog launches the shared **Progress Modal**, which joins the session returned by `POST /api/vulnerabilities/import-staging` and displays live updates from Socket.io (`progress-update`, `progress-complete`, `progress-error`).
- If the WebSocket connection fails, the modal displays a warning banner and continues in manual mode-imports still complete, but the progress bar advances based on return values from the REST endpoints.
- Enable verbose WebSocket logging for troubleshooting by setting `localStorage.hextrackr_debug = "true"` before starting an import.

### Supported CSV Formats

HexTrackr automatically detects and processes multiple CSV export formats from various vulnerability scanners:

#### Format 1: Legacy Cisco Export (aug28 style)

## Key Characteristics

- Missing `definition.cve` column
- CVE data extracted from `definition.name` using intelligent regex patterns
- Cisco vulnerability IDs extracted from parentheses in vulnerability names

## Supported Columns

- `asset.display_ipv4_address` - Primary IP address of the asset
- `asset.id` - Unique asset identifier
- `asset.name` - Hostname of the affected device
- `definition.family` - Vulnerability family (e.g., "CISCO", "Misc.")
- `definition.id` - Plugin/vulnerability identifier
- `definition.name` - Full vulnerability name with embedded identifiers
- `definition.vpr.score` - Vulnerability Priority Rating score
- `id` - Unique vulnerability instance identifier
- `severity` - Risk severity level
- `state` - Vulnerability state (typically "ACTIVE")

## CVE Extraction Examples

- `Cisco IOS XE Software Bootstrap (cisco-sa-bootstrap-KfgxYgdh)` -> extracts `cisco-sa-bootstrap-KfgxYgdh`
- `SSH Weak MAC Algorithms Enabled` -> no CVE extracted (handled via plugin ID)

#### Format 2: Standard Cisco Export (sept01/sept02 style)

## Key Characteristics: (2)

- Direct `definition.cve` column mapping (recommended format)
- Enhanced metadata including plugin publication dates
- Support for resurfaced vulnerability tracking

## Additional Columns

- `definition.cve` - Direct CVE identifier mapping
- `definition.plugin_published` - Plugin publication date (ISO format)
- `definition.plugin_updated` - Plugin last update date (ISO format)
- `resurfaced_date` - Date when vulnerability reappeared (if applicable)

**This is the recommended export format** for optimal data quality and processing efficiency.

#### Format 3: Full Tenable Export (comprehensive format)

## Key Characteristics: (3)

- Support for `asset.ipv4_addresses` with multiple comma-separated IPs
- Comprehensive vulnerability metadata and risk scoring
- Enhanced fields for advanced vulnerability management
- Handles large files (60MB+) efficiently

## Extended Columns

- `asset.ipv4_addresses` - Multiple IP addresses (comma-separated)
- `definition.description` - Detailed vulnerability description
- `definition.vpr_v2.score` - Enhanced VPR scoring
- `definition.vpr_v2.drivers_cve_id` - CVE drivers for VPR calculation
- `definition.vulnerability_published` - CVE publication date
- `vuln_age` - Age of vulnerability in days
- `vuln_sla_date` - SLA target date for remediation
- `port` - Affected network port
- `protocol` - Network protocol
- `age_in_days` - Asset exposure duration

### Advanced Import Features

#### CVE and Vulnerability ID Extraction Logic

The import system uses a comprehensive multi-tier approach to identify vulnerability information:

1. **Primary CVE**: Direct mapping from `definition.cve` column
2. **CVE Fallback**: Regex extraction from `definition.name` using pattern `(CVE-\d{4}-\d+)`
3. **Cisco Vulnerability IDs**: Extract Cisco Security Advisory IDs from parentheses `(cisco-sa-[\w-]+)` patterns
4. **Plugin Fallback**: Use `definition.id` + `definition.name` for unique identification

##### Cisco Security Advisory Support

HexTrackr now provides enhanced support for Cisco vulnerability identifiers:

- **Pattern Recognition**: Automatically detects `cisco-sa-*` patterns in vulnerability names
- **Link Generation**: Cisco SA IDs link directly to Cisco's security advisory portal
- **Display Priority**: Cisco SA IDs are displayed prominently in the "Vulnerability" column (renamed from "CVE")
- **Fallback Handling**: When neither CVE nor Cisco SA is available, displays plugin ID with descriptive styling

## Examples

- **CVE Direct**: `CVE-2025-20155` -> `CVE-2025-20155` (links to CVE.org)
- **CVE Extracted**: `Cisco IOS Software DoS (CVE-2020-3200)` -> `CVE-2020-3200` (links to CVE.org)
- **Cisco SA**: `Bootstrap Vulnerability (cisco-sa-bootstrap-KfgxYgdh)` -> `cisco-sa-bootstrap-KfgxYgdh` (links to cisco.com)
- **Plugin ID**: `SSH Weak Encryption` -> `Plugin 12345` (plugin ID with styling)

#### Multiple Value Handling

**CVEs (Comma-separated)**:

- Input: `"CVE-2023-1234, CVE-2023-5678, CVE-2023-9012"`
- Processing: Uses first CVE (`CVE-2023-1234`) as primary identifier
- Additional CVEs stored in description for reference

**IP Addresses (Comma-separated)**:

- Input: `"10.95.12.1, 10.40.12.1, 10.50.12.1"`
- Processing: Uses first IP (`10.95.12.1`) as primary address
- Complete list maintained for device correlation

#### Hostname Normalization

Automatic hostname processing for consistent device identification:

- **Domain Stripping**: `server01.domain.com` -> `server01`
- **IP Preservation**: `192.168.1.1` -> `192.168.1.1` (no modification)
- **Invalid Format Handling**: Gracefully handles malformed hostnames

#### Enhanced Deduplication

Multi-tier unique key generation with confidence scoring:

1. **Tier 1**: `asset.id` + `definition.id` (95% confidence - most stable)
2. **Tier 2**: `normalized_hostname` + `cve` (90% confidence)
3. **Tier 3**: `definition.id` + `normalized_hostname` + `vendor` (85% confidence)
4. **Tier 4**: `plugin_id` + `description` hash (80% confidence - fallback)

### Rollover Architecture Behavior

HexTrackr implements a sophisticated rollover system that manages vulnerability lifecycles:

#### Import Processing Flow

1. **File Upload**: CSV files uploaded via the dashboard import button trigger server-side processing
2. **Data Parsing**: Advanced CSV parsing handles multiple formats with intelligent column detection
3. **Vulnerability ID Extraction**: System extracts CVE, Cisco SA, or plugin identifiers using multi-tier logic
4. **New Import Storage**: CSV data processed and stored in `vulnerability_snapshots` (historical record)
5. **Current State Update**: `vulnerabilities_current` table updated with latest vulnerability state
6. **Lifecycle Management**: System automatically determines vulnerability lifecycle states
7. **UI Refresh**: Dashboard automatically updates to display new data with enhanced vulnerability column
8. **Aggregation**: Daily totals updated for trend analysis

#### Lifecycle States

- **`active`**: Newly discovered or currently present vulnerabilities
- **`reopened`**: Previously resolved vulnerabilities that have reappeared
- **`resolved`**: Vulnerabilities no longer detected in latest scan

#### Expected Behavior After Import

**New Vulnerabilities**:

- Immediately appear in dashboard with `lifecycle_state = 'active'`
- Included in current vulnerability counts and statistics
- Available in all dashboard views (Table, Devices, Vulnerabilities)

**Missing Vulnerabilities**:

- Vulnerabilities not found in new scan marked as `lifecycle_state = 'resolved'`
- Hidden from main dashboard views (maintains clean current state)
- Historical data preserved for trend analysis

**Reappearing Vulnerabilities**:

- Previously resolved vulnerabilities that reappear marked as `lifecycle_state = 'reopened'`
- Displayed prominently in dashboard with reopened status
- Lifecycle history maintained for audit purposes

### Import Troubleshooting

#### Common Issues and Solutions

## Empty Dashboard After Import

- **Issue**: No vulnerabilities visible despite successful import
- **Cause**: Default view filters show only `active` and `reopened` states
- **Solution**: Check `lifecycle_state` filtering; resolved vulnerabilities are hidden by design
- **Verification**: Use `/api/vulnerabilities/resolved` endpoint to verify resolved items

## Missing CVE Information

- **Issue**: CVE fields appear blank in dashboard
- **Cause**: CVE extraction failed from `definition.name` field
- **Solution**: Verify vulnerability names contain recognizable CVE patterns
- **Workaround**: System uses plugin ID + description for unique identification

## Hostname Duplicates

- **Issue**: Same device appears multiple times with slight name variations
- **Cause**: Hostname normalization not handling specific domain patterns
- **Solution**: Check normalized hostname rules; may need custom normalization
- **Example**: `server01.corp.com` and `server01.internal.com` both normalize to `server01`

## Large File Performance

- **Issue**: Import appears slow or times out with large CSV files
- **Cause**: Client-side processing limitations with files over 10MB
- **Solution**: System automatically switches to server-side processing for large files
- **Expected**: Files over 60MB process successfully with progress indicators

## Incomplete Data After Import

- **Issue**: Some vulnerability records missing key fields
- **Cause**: CSV column mapping mismatch or unsupported format
- **Solution**: Verify CSV format matches supported column structures
- **Debugging**: Check server logs for field mapping warnings

## CSV Import Returns 404 Error (Fixed in v1.0.5)

- **Issue**: CSV file upload fails with 404 "Cannot POST /undefined/import" error
- **Root Cause**: Missing `apiBase` property in ModernVulnManager class causing undefined API endpoint URLs
- **Symptoms**: Import button clicks result in 404 errors, CSV files not processed
- **Resolution**: Fixed in version 1.0.5 by adding `this.apiBase = "/api"` property to ModernVulnManager constructor
- **Verification**: Import functionality now properly routes to `/api/vulnerabilities/import` endpoint
- **Impact**: Resolves complete CSV import functionality breakdown that prevented all vulnerability data uploads

#### Supported Column Mapping Reference

| Source Column | Internal Mapping | Purpose | Required |
|---------------|------------------|---------|----------|
| `asset.display_ipv4_address` | `ip_address` | Primary device IP | Yes |
| `asset.ipv4_addresses` | `ip_address` | Multi-IP support (first used) | Alternative |
| `asset.name` | `hostname` | Device hostname | Yes |
| `asset.id` | `asset_id` | Unique asset identifier | Recommended |
| `definition.cve` | `cve` | Direct CVE mapping | Preferred |
| `definition.name` | `plugin_name` | Vulnerability name/CVE source | Yes |
| `definition.id` | `plugin_id` | Plugin identifier | Yes |
| `definition.family` | `vendor` | Vulnerability vendor/family | Yes |
| `definition.vpr.score` | `vpr_score` | Risk priority score | Recommended |
| `definition.description` | `description` | Detailed vulnerability info | Optional |
| `severity` | `severity` | Risk severity level | Yes |
| `state` | `state` | Current vulnerability state | Yes |

#### Performance Optimization

**Large File Handling**:

- Files under 10MB: Client-side parsing with Papa.parse
- Files over 10MB: Automatic server-side processing
- Memory management: Streaming processing prevents memory exhaustion
- Progress tracking: Real-time import progress for large datasets

**Database Optimization**:

- Sequential processing prevents race conditions during import
- Batch insertion for improved performance
- Automatic cleanup of temporary files after processing
- Database transaction handling ensures data integrity

## The Dashboard

The dashboard provides multiple ways to analyze your vulnerability data.

### Statistics Cards

At the top of the page, you'll find cards summarizing the current vulnerability state by severity. Each card displays **VPR Totals** by default - the sum of the Vulnerability Priority Rating scores for that severity level, providing a risk-based perspective. You can **click on any card** to toggle between two views:

- **VPR Totals** (default): The sum of all VPR scores for that severity, emphasizing overall risk.
- **Vulnerability Counts**: The total number of vulnerabilities for that severity.

### Historical Trend Chart

The main chart visualizes vulnerability trends over time. You can toggle the view to see trends based on:

- **Vulnerability Count**
- **VPR Score Sum**

This allows you to see whether your overall risk is increasing or decreasing.

## Data Views

You can switch between three different views to analyze the data from different perspectives:

### 1. Table View

This is the default view, powered by AG Grid. It provides a detailed, sortable, and filterable table of all current vulnerabilities.

- **Sorting**: Click on any column header to sort the data.
- **Filtering**: Use the search bar and the severity dropdown to filter the data.
- **Column Resizing**: Drag column borders to resize columns to your preferred width.
- **Advanced Features**: The table includes grouping, column pinning, and export capabilities for comprehensive data analysis.

### 2. Devices View

This view groups all vulnerabilities by the affected device (hostname). Each card represents a device and shows:

- The total number of vulnerabilities on that device.
- The total VPR score for that device.
- A breakdown of vulnerabilities by severity.

Click **View Device Details** to see a list of all vulnerabilities affecting that specific device. The device modal provides detailed information about the selected device and displays an interactive grid of its vulnerabilities.

**Enhanced Modal Aggregation (v1.0.6+)**: The device modal now properly aggregates and displays ALL vulnerabilities affecting the selected device. For example, a device like `grimesnswan03` will show all 12 vulnerabilities associated with it, providing complete visibility into the device's vulnerability profile.

**Enhanced Navigation**: You can click on hostname links within vulnerability modals to seamlessly navigate to device details. The modal system now properly transitions between views, ensuring a smooth user experience without layering issues.

### 3. Vulnerabilities View

This view groups all findings by vulnerability identifier (CVE, Cisco SA, or plugin ID). Each card represents a unique vulnerability and shows:

- The number of devices affected by it.
- The total VPR score it contributes across all devices.
- A breakdown of the severity of the findings.
- **Enhanced Display**: Vulnerability identifiers are now shown in a dedicated "Vulnerability" column with appropriate linking:
  - **CVE identifiers** link to the MITRE CVE database
  - **Cisco SA identifiers** link to Cisco's security advisory portal
  - **Plugin IDs** are styled for easy identification when CVE/SA data is unavailable

Click on a card to see a list of all devices affected by that vulnerability.

**Enhanced Modal Aggregation (v1.0.6+)**: The vulnerability modal now properly aggregates and displays ALL devices affected by the selected vulnerability. For example, CVE-2017-3881 will show all 24 affected devices in a comprehensive list, providing complete visibility into the vulnerability's impact across your infrastructure.

## Card Pagination

Both the Devices View and Vulnerabilities View now include intelligent pagination controls:

- **Default Display**: Shows 6 cards per page for optimal viewing and performance
- **Navigation Controls**: Use the pagination controls at the bottom to navigate through pages
- **Responsive Design**: Cards automatically adjust to screen size while maintaining readability
- **Quick Navigation**: Jump to first, last, or specific page numbers for efficient browsing

This pagination system ensures smooth performance even with large datasets while maintaining the visual appeal of the card-based interface.

## Vulnerability Lookup

From the Table or Vulnerability views, you can click on vulnerability identifiers to access authoritative information:

- **CVE identifiers** (e.g., `CVE-2023-12345`) link to the [MITRE CVE website](https://cve.mitre.org/)
- **Cisco SA identifiers** (e.g., `cisco-sa-bootstrap-KfgxYgdh`) link to [Cisco's Security Advisory portal](https://cisco.com/c/en/us/support/docs/csa/)
- **Plugin IDs** display with distinctive styling for easy identification

This provides direct access to detailed vulnerability information from authoritative sources.

## Integration with Other Systems

The vulnerability management system integrates seamlessly with other HexTrackr components:

- **Ticket System**: Create tickets directly from vulnerability data
- **ServiceNow Integration**: Automated ticket creation for critical vulnerabilities
- **Backup System**: All vulnerability data included in system-wide backups
- **API Access**: RESTful API endpoints for programmatic access to vulnerability data

---

## Settings & Preferences

HexTrackr provides various settings and preferences to customize the application to your organization's needs.

### Theme Settings

- **Dark/Light Mode Toggle**: Switch between dark and light themes using the theme switcher in the header
- **System Preference Detection**: Automatically matches your operating system's theme preference
- **Persistent Theme Selection**: Your theme choice is saved and applied across all pages

### ServiceNow Integration Settings

Configure ServiceNow integration through the Settings modal:

1. Click the **Settings** button in the header navigation
2. Navigate to the **ServiceNow** tab
3. Enter your ServiceNow instance URL (e.g., `https://yourcompany.service-now.com`)
4. Configure field mappings for ticket creation
5. Test the connection using the **Test Connection** button

### Data Management Settings

The Settings modal provides several data management options:

- **Export All Data**: Download a complete backup of all tickets and vulnerabilities
- **Clear All Data**: Remove all data from the database (requires confirmation)
- **Import Settings**: Configure default import behaviors and mappings
- **Backup Schedule**: Set up automated backup schedules (if enabled)

### Display Preferences

Customize how data is displayed throughout the application:

- **Date Format**: Choose between US (MM/DD/YYYY) and international (DD/MM/YYYY) formats
- **Table Row Density**: Compact, comfortable, or spacious row heights
- **Default View**: Set the default view for tickets and vulnerabilities pages
- **Items Per Page**: Configure pagination defaults (6, 12, 24, or 48 items)

### Performance Settings

Optimize HexTrackr for your environment:

- **WebSocket Logging**: Enable verbose WebSocket logging for debugging
- **Cache Duration**: Configure how long data is cached in the browser
- **Auto-Refresh**: Set automatic data refresh intervals
- **Progress Notifications**: Control how import/export progress is displayed
