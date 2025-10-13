# HexTrackr User Guide

Welcome to HexTrackr! This guide will help you make the most of your vulnerability and ticket management workflow.

---

## Table of Contents

- [Quick Start](#quick-start)
- [Vulnerability Dashboard](#vulnerability-dashboard)
  - [VPR Cards and Statistics](#vpr-cards-and-statistics)
  - [Vendor Filtering](#vendor-filtering)
  - [Data Views](#data-views)
  - [KEV Integration](#kev-integration)
- [Ticket Management](#ticket-management)
  - [Creating and Managing Tickets](#creating-and-managing-tickets)
  - [Device Management](#device-management)
  - [Ticket Bundles](#ticket-bundles)
- [Import and Export](#import-and-export)
  - [CSV Import](#csv-import)
  - [Exporting Data](#exporting-data)
- [Advanced Features](#advanced-features)
- [Settings and Preferences](#settings-and-preferences)

---

## Quick Start

After installation, access HexTrackr through your browser:

- **Development**: `https://dev.hextrackr.com`
- **Production**: `https://hextrackr.com`

**Note**: Type `thisisunsafe` to bypass the self-signed certificate warning in development.

### First Steps

1. **Import Vulnerability Data**: Click the Import button on the Vulnerabilities page
2. **Select Scan Date**: Choose when the scan was performed (critical for trending)
3. **Upload CSV**: Select your vulnerability scan export file
4. **Review Dashboard**: View your vulnerability landscape in real-time

---

## Vulnerability Dashboard

The vulnerability dashboard at `/vulnerabilities.html` is your central hub for tracking and analyzing security vulnerabilities across your environment.

### VPR Cards and Statistics

At the top of the dashboard, you'll see four risk cards displaying vulnerability statistics:

- **Critical** (Red): Highest-priority vulnerabilities requiring immediate attention
- **High** (Orange): Significant vulnerabilities needing prompt remediation
- **Medium** (Yellow): Moderate-risk vulnerabilities for scheduled remediation
- **Low** (Blue): Lower-priority vulnerabilities for routine maintenance

**Toggle Between Views**: Click any card to switch between:
- **VPR Totals** (default): Sum of Vulnerability Priority Rating scores (risk-based view)
- **Vulnerability Counts**: Total number of vulnerabilities in each severity level

#### Hidden Power Feature: VPR Trend Export

**Power Tool Shortcuts**: Hold keyboard modifiers and click any VPR card to instantly export detailed CSV trend reports:

- **Cmd+Shift+Click** (Mac) or **Ctrl+Shift+Click** (Windows): **7-Day Comparison** - Current vs 7 days ago
- **Cmd+Alt+Click** (Mac) or **Ctrl+Alt+Click** (Windows): **30-Day Comparison** - Current vs 30 days ago
- **Cmd+Shift+Alt+Click** (Mac) or **Ctrl+Shift+Alt+Click** (Windows): **Latest vs Previous** - Most recent two scans

Each CSV includes vendor breakdown (Cisco, Palo Alto, Other) with both VPR totals and vulnerability counts. Actual scan dates are shown in the report header with graceful fallback if insufficient historical data exists.

### Vendor Filtering

Filter vulnerabilities by vendor to focus on specific technology stacks:

- **CISCO**: Cisco Systems vulnerabilities (IOS, IOS-XE, ASA, etc.)
- **Palo Alto**: Palo Alto Networks devices and PAN-OS
- **Other**: All other vendors (Tenable plugins, third-party software, etc.)

**Two Ways to Filter**:
1. **Toggle Buttons**: Click vendor buttons above the statistics cards
2. **Dropdown Menu**: Use the vendor dropdown in the filter bar

Both filtering methods stay synchronized - selecting a vendor in one updates the other automatically.

### Data Views

Switch between three views to analyze vulnerabilities from different perspectives:

#### Table View (Default)

A comprehensive, sortable table powered by AG-Grid showing all vulnerability details:

- **Quick Search**: Filter by CVE, hostname, severity, or any field
- **Column Sorting**: Click headers to sort by any column
- **Advanced Filtering**: Use the filter bar for complex queries
- **Column Customization**: Resize and reorder columns to your preference

#### Devices View

Group vulnerabilities by affected devices:

- **Device Cards**: One card per device showing vulnerability count and total VPR score
- **Severity Breakdown**: Visual breakdown of vulnerability severities per device
- **KEV Indicators**: Red badges show if device has Known Exploited Vulnerabilities
- **Click to Explore**: Click "View Device Details" to see all vulnerabilities on that device
- **Pagination**: Browse through devices with 6 cards per page

#### Vulnerabilities View

Group by unique vulnerabilities (CVE, Cisco SA, or Plugin ID):

- **Vulnerability Cards**: One card per unique vulnerability
- **Impact Scope**: Shows how many devices are affected
- **Total Risk**: Displays combined VPR score across all affected devices
- **Severity Badge**: Color-coded severity indicator on each card
- **KEV Badge**: Red indicator for Known Exploited Vulnerabilities
- **Click to Explore**: Click any card to see all affected devices

### KEV Integration

**KEV (Known Exploited Vulnerabilities)** are vulnerabilities actively being exploited in the wild according to CISA.

#### Identifying KEV Vulnerabilities

KEV vulnerabilities are marked throughout the interface:

- **Table View**: Dedicated KEV column with YES/NO badges
  - Red "YES" badge = In CISA catalog (prioritize!)
  - Blue "NO" badge = Not in KEV catalog
- **Vulnerability Cards**: Red KEV badge in upper-right corner
- **Device Cards**: KEV badge appears if ANY vulnerability on that device is a KEV

#### Using KEV Information

**Why KEV Matters**:
- **Active Exploitation**: These vulnerabilities are being exploited right now
- **Higher Priority**: Should be remediated before non-KEV vulnerabilities
- **Compliance**: Many frameworks require tracking KEV vulnerabilities

**How to Use**:
1. **Filter by KEV**: Use the KEV column filter or severity dropdown
2. **Click for Details**: Click any KEV badge to see full CISA information
3. **Cross-Reference**: Links to NIST NVD for complete CVE details
4. **Prioritize Remediation**: Create tickets for KEV vulnerabilities first

**Automatic Updates**: HexTrackr syncs with the CISA KEV catalog daily, so KEV status is always current.

---

## Ticket Management

The tickets page at `/tickets.html` helps you manage remediation work with a sophisticated AG-Grid interface.

### Creating and Managing Tickets

#### Create a New Ticket

1. Click **Add New Ticket** button
2. **Ticket Number** is auto-generated (4-digit format: 0001, 0002, etc.)
3. Fill in required fields:
   - **Date Submitted**: When the ticket was created
   - **Date Due**: Remediation deadline
   - **Site**: Physical location or network zone
   - **Location**: Specific building/datacenter
   - **Supervisor**: Who owns the work
   - **Tech**: Who will perform the work
4. Add devices using the device management interface (see below)
5. Click **Save Ticket**

#### Edit Existing Tickets

1. Find the ticket in the main table
2. Click the **Edit** (pencil) icon
3. Make your changes
4. Click **Save Ticket**

### Device Management

The device management interface in the ticket modal provides powerful tools for organizing remediation work:

#### Adding Devices

**Manual Entry**:
- Click the **+** button to add a new device row
- **Smart Increment**: System automatically suggests the next device name
  - Example: Adding after `host01` suggests `host02`
  - Example: Adding after `server-a` suggests `server-b`

**Bulk Import**: Add comma-separated or line-separated device lists

#### Ordering Devices

Device order matters for sequential operations (reboots, patching, etc.). Three ways to reorder:

1. **Drag and Drop**: Click and hold the `::` handle, drag to new position
2. **Arrow Buttons**: Click ↑ or ↓ to move device up or down one position
3. **Reverse Order**: Click **Reverse** button to flip the entire list

**Why Order Matters**:
- Boot sequences for cluster failover
- Patching order to maintain service availability
- Troubleshooting flow documentation

#### Removing Devices

Click the **-** button next to any device to remove it from the list.

### Ticket Bundles

Generate complete documentation packages for remediation work:

**Download Ticket Bundle**:
1. Find the ticket in the main table
2. Click the **Download Bundle** (download) icon
3. Receive a ZIP file containing:
   - Ticket details in PDF format
   - Ticket details in Markdown format
   - Any shared documentation uploaded during the session
   - File attachments stored with the ticket

**Perfect for**: Handoffs to field technicians, audit documentation, ServiceNow attachments

### Filtering and Searching

**Global Search Bar**: Filters tickets by:
- Ticket number
- Hexagon number
- ServiceNow number
- Location
- Site
- Supervisor name
- Tech name
- Device names

**Status Filter**: Show tickets by status (Open, Closed, Completed, Overdue, etc.)

**Location Filter**: Dynamically populated with all locations in your database

#### Interactive Statistics Cards

Click statistics cards at the top of the page to filter the ticket list:

- **Total Tickets**: Reset all filters, show everything
- **Open Tickets**: Show active work (excludes Closed, Completed, Failed)
- **Overdue**: Show urgent tickets needing immediate attention
- **Completed**: Show finished work (Completed + Closed)

**Visual Feedback**: Active filter cards are highlighted with borders and shadows.

### ServiceNow Integration

If you've configured ServiceNow in Settings:

- All ServiceNow ticket numbers become **clickable links**
- Links open directly to the corresponding ticket in your ServiceNow instance
- No copying and pasting ticket numbers!

---

## Import and Export

HexTrackr provides comprehensive import/export capabilities for data migration, backup, and reporting.

### CSV Import

#### Importing Vulnerabilities

1. Click **Import** button on Vulnerabilities page
2. **Select Scan Date**: Choose when the vulnerability scan was performed
   - This date is critical for accurate trend analysis
   - Use the scan completion date from your vulnerability scanner
3. **Choose CSV File**: Select your export from Tenable, Cisco, or compatible scanner
4. **Watch Progress**: Real-time progress modal shows import status
5. **Review Results**: Dashboard updates automatically with new data

**Supported Formats**:
- Tenable.io comprehensive exports
- Cisco vulnerability exports (standard and legacy)
- Any CSV with standard vulnerability fields

#### Importing Tickets

1. Click **Import CSV** button on Tickets page
2. **Select File**: Choose your ticket data CSV
3. **Choose Import Mode**:
   - **Replace All Data**: Clears existing tickets, imports new dataset
   - **Add to Existing**: Merges with current tickets (upsert mode)
4. **Review Progress**: Import summary shows migrated and failed rows

**CSV Requirements**:
- Include ticket number, dates, site, location
- Device lists can be comma-separated or line-separated
- Missing ticket numbers are auto-generated

### Exporting Data

#### Quick Exports from Vulnerabilities

Export your current filtered view in multiple formats:

- **CSV**: Spreadsheet-compatible format
- **Excel**: Native .xlsx format with formatting
- **JSON**: API-compatible format for automation
- **PDF**: Print-ready report format
- **HTML**: Self-contained web report

**All exports respect your current filters** - export exactly what you see on screen.

#### Quick Exports from Tickets

Same export formats available for tickets:

- **CSV**: Perfect for backup and re-import
- **Excel**: Formatted spreadsheet with device lists
- **JSON**: API-ready format for integrations
- **PDF**: Professional report format
- **HTML**: Shareable web reports

#### Import Summary Reports

After importing vulnerabilities, download professional HTML reports:

1. **Download Report Button**: Appears in progress modal after import completes
2. **Complete Reports**: Self-contained HTML with embedded CSS
3. **Print-Friendly**: Optimized for screen and professional printing
4. **Descriptive Names**: Files named `HexTrackr_Import_Report_YYYY-MM-DD_[source].html`

---

## Advanced Features

### Vulnerability Trend Analysis

The main chart on the Vulnerabilities page shows trends over time:

- **Toggle View**: Switch between Vulnerability Count and VPR Score Sum
- **Date Range**: Automatically adjusts based on your scan history
- **Severity Breakdown**: Color-coded lines for each severity level
- **Vendor Filtering**: Trends update when you filter by vendor

**Use Cases**:
- Track remediation progress over time
- Identify periods of increased risk
- Measure security improvement initiatives
- Report to stakeholders with visual data

### Cross-Navigation Between Views

Click through the interface seamlessly:

- **Hostname Links**: Click any hostname to jump to that device's details
- **CVE Links**: Click CVE identifiers to see all affected devices
- **KEV Badges**: Click to view full CISA KEV information
- **Modal Navigation**: Smoothly transition between device and vulnerability views

### Keyboard Shortcuts

**VPR Card Export Shortcuts**:
- **Cmd+Shift+Click** (Mac) or **Ctrl+Shift+Click** (Windows): Export 7-day trend comparison
- **Cmd+Alt+Click** (Mac) or **Ctrl+Alt+Click** (Windows): Export 30-day trend comparison
- **Cmd+Shift+Alt+Click** (Mac) or **Ctrl+Shift+Alt+Click** (Windows): Export latest vs previous comparison

**General Navigation**:
- **Escape**: Close open modals
- **Tab**: Navigate through form fields

### Real-Time Updates

When using the import feature, HexTrackr provides live progress updates:

- **WebSocket Connection**: Real-time progress bar during imports
- **Fallback Mode**: If WebSocket fails, manual progress updates continue
- **Status Messages**: Clear feedback at each stage of import process

---

## Settings and Preferences

Access settings by clicking **Settings** in the header navigation.

The Settings modal has **4 tabs** for different configuration areas:

### Theme Settings

**Dark/Light Mode** (Header toggle):
- Toggle between dark and light themes using the moon/sun icon
- Automatically detects your system preference on first visit
- Theme choice persists across all pages
- Saves to local storage for future sessions

### API Configuration Tab

**Cisco PSIRT Integration**:
- Configure Cisco Product Security Incident Response Team (PSIRT) API access
- Retrieve fixed versions for Cisco vulnerabilities
- API client ID and secret management

**KEV Synchronization**:
- **Enable/Disable Auto-Sync**: Control automatic CISA KEV catalog updates
- **Manual Sync Button**: Force immediate update from CISA
- **Sync Status**: View last update time and record count
- **Sync Schedule**: Automatic daily synchronization at 3:00 AM

### Ticket Systems Tab

**ServiceNow Integration**:

Configure ServiceNow to enable clickable ticket links:

1. Enter your **ServiceNow instance URL**
   - Example: `https://yourcompany.service-now.com`
2. Click **Test Link** to verify the URL format
3. **Save Settings**

**After Configuration**: All ServiceNow ticket numbers throughout HexTrackr become clickable links that open directly in your ServiceNow instance.

### Data Management Tab

**Backup Operations**:
- **Download Full Backup**: Export complete database (all tickets and vulnerabilities) as ZIP archive
- **Import Backup**: Restore data from previously exported backup files

**Data Cleanup** (Destructive Operations):
- **Clear All Tickets**: Remove all ticket records (requires confirmation)
- **Clear All Vulnerabilities**: Remove all vulnerability data (requires confirmation)
- **Clear All Data**: Complete database reset (requires confirmation)

**Important**: All cleanup operations are irreversible. Ensure you have recent backups before performing destructive operations.

### System Configuration Tab

**Future Enhancements**:
- Placeholder for additional system-level settings
- Reserved for future configuration options

---

## Tips and Best Practices

### Vulnerability Management

**Daily Workflow**:
1. Check VPR cards for total risk overview
2. Filter by vendor to focus on specific technology stacks
3. Check KEV vulnerabilities first (active exploitation)
4. Review new vulnerabilities in Table view
5. Create tickets for high-priority items

**Weekly Workflow**:
1. Import latest vulnerability scans
2. Review trend chart for progress
3. Identify devices with highest vulnerability counts
4. Update ticket statuses as remediation completes

### Ticket Management

**Creating Effective Tickets**:
- Use specific, descriptive locations
- Order devices by patching sequence
- Include supervisor and tech assignments
- Set realistic due dates based on complexity

**Tracking Progress**:
- Update ticket status as work progresses
- Use bundle downloads for documentation
- Link to ServiceNow for external coordination

### Import Best Practices

**Before Importing**:
- Verify scan date is correct (critical for trends)
- Check CSV file size (large files may take longer)
- Have previous import available for comparison

**After Importing**:
- Review import summary for any errors
- Check vulnerability counts match expectations
- Verify new vulnerabilities appear in Table view
- Download import summary report for records

### Export Best Practices

**Regular Backups**:
- Export complete data monthly (CSV or JSON)
- Store exports in version control or backup system
- Test restore process periodically

**Reporting**:
- Use vendor filtering + export for vendor-specific reports
- Export KEV vulnerabilities separately for compliance
- Generate HTML reports for non-technical stakeholders

---

## Troubleshooting

### Common Issues

**Vulnerabilities Not Appearing After Import**

- **Check Filters**: Ensure no active filters are hiding data
- **Verify Scan Date**: Incorrect date may cause lifecycle issues
- **Review Import Summary**: Check for errors in import report

**Empty API Responses**

- **Use HTTPS**: Always access via `https://` URLs
- **Check Browser Console**: Look for CORS or network errors
- **Verify Server Status**: Ensure Docker containers are running

**CSV Import Errors**

- **Column Mapping**: Verify CSV has required columns
- **File Format**: Ensure CSV is UTF-8 encoded
- **File Size**: Very large files (>100MB) may need splitting

**ServiceNow Links Not Working**

- **Verify Settings**: Check ServiceNow URL is correctly configured
- **Check Format**: Ensure URL ends without trailing slash
- **Test Connection**: Use the "Test Connection" button in Settings

---

## Getting More Help

- **Documentation Portal**: Built-in at `/docs-html/`
- **API Documentation**: Technical reference at `/docs-html/jsdocs/`
- **GitHub Issues**: Report bugs at [HexTrackr GitHub](https://github.com/Lonnie-Bruton/HexTrackr/issues)

---

**Version**: 1.0.54
**Last Updated**: 2025-10-09
