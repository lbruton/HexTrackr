# HexTrackr User Guide

> Your complete guide to managing tickets and vulnerabilities with HexTrackr

## Table of Contents

- [Ticket Management](#ticket-management)
- [Vulnerability Management](#vulnerability-management)
- [KEV (Known Exploited Vulnerabilities)](#kev-known-exploited-vulnerabilities)
- [Import & Export](#import--export)
- [Settings & Preferences](#settings--preferences)

---

## Ticket Management

### Creating Tickets

1. Click the **Add New Ticket** button
2. The **Ticket Number** is automatically generated (e.g., `0001`)
3. Fill in required fields:
   - **Date Submitted** and **Date Due**
   - **Site** and **Location**
   - **Supervisor** and **Tech** assignments
4. Add devices to the ticket using the device manager
5. Click **Save Ticket**

### Managing Devices on Tickets

The device manager lets you organize maintenance sequences efficiently:

- **Add Device**: Click the **+** button (smart-increments names like `host01` → `host02`)
- **Remove Device**: Click the **-** button
- **Reorder Devices**:
  - Drag and drop using the `::` handle
  - Use up/down arrow buttons for precise positioning
  - Click **Reverse** to flip the entire sequence

> **Tip**: Device order is preserved exactly as entered - perfect for reboot sequences and patch orders!

### Viewing and Exporting Tickets

- **View Details**: Click the eye icon for a clean, formatted view
- **Download Bundle**: Click the download icon for a ZIP archive containing:
  - Ticket details in PDF format
  - Ticket details in Markdown format
  - Any attached documentation
  - File attachments (renamed to match ticket number)

### Searching and Filtering

- **Global Search**: Searches across ticket numbers, locations, sites, supervisor names, tech names, and device names
- **Status Filter**: Filter by status (Open, Overdue, Completed, Closed, etc.)
- **Location Filter**: Dynamically populated with all locations in your database

### Interactive Statistics Cards

Click the statistics cards at the top to quickly filter tickets:

- **Total Tickets**: Reset all filters, show everything
- **Open Tickets**: Show only active tickets (excludes Closed, Completed, Failed)
- **Overdue**: Show tickets requiring immediate attention
- **Completed**: Display finished work (Completed + Closed)

Active cards are highlighted with borders to show your current filter.

### Importing Ticket Data

1. Click **Import CSV**
2. Select your CSV file
3. Choose import mode:
   - **Replace All Data**: Clears existing tickets first
   - **Add to Existing Data**: Merges with current tickets

The system automatically:
- Generates ticket numbers if missing
- Normalizes device lists (handles arrays, commas, or semicolons)
- Validates data and shows errors for invalid rows

### Exporting Ticket Data

Export your filtered data in multiple formats:

- **CSV**: Compatible with Excel and import back into HexTrackr
- **Excel**: Native Excel format with formatted columns
- **JSON**: For automation and API integration
- **PDF**: Print-ready format
- **HTML**: Standalone web pages with embedded styling

> **Export Tip**: The CSV export format matches the import format - perfect for backups and round-trips!

### ServiceNow Integration

If configured in Settings, ServiceNow ticket numbers become clickable links that open directly in your ServiceNow instance.

---

## Vulnerability Management

The Vulnerability Dashboard helps you analyze, track, and manage security vulnerabilities across all your assets.

### Dashboard Overview

- **VPR Summary Cards**: Quick view of Critical, High, Medium, and Low vulnerabilities
- **Trend Charts**: Historical vulnerability data and trend analysis
- **AG-Grid Table**: Powerful filtering, sorting, and searching
- **Device Cards**: Vulnerability counts by hostname
- **Vendor Filtering**: Filter by CISCO, Palo Alto, or Other vendors

### Viewing Vulnerability Details

Click any vulnerability in the table to see:

- **CVE Information**: Full vulnerability description
- **Affected Devices**: All devices with this vulnerability
- **NIST NVD Links**: External links to authoritative CVE data
- **KEV Status**: Known Exploited Vulnerability indicator (if applicable)
- **VPR Score**: Vulnerability Priority Rating
- **Severity Level**: Critical, High, Medium, or Low

### Vendor Filtering

Use the vendor toggle buttons to filter the entire dashboard:

- **Overall**: All vulnerabilities across all vendors
- **CISCO**: Vulnerabilities on CISCO devices only
- **Palo Alto**: Vulnerabilities on Palo Alto devices only
- **Other**: Vulnerabilities on other vendor devices

The vendor filter synchronizes with the search dropdown and updates all statistics, charts, and tables simultaneously.

### VPR Weekly Summary Export

**Hidden Power Feature**: Cmd+Shift+Click (Mac) or Ctrl+Shift+Click (Windows) on any VPR summary card to export a comprehensive CSV report with:

- Overall VPR totals by severity
- Vendor-specific breakdowns (CISCO, Palo Alto, Other)
- Previous week vs. current week comparisons
- Vulnerability counts alongside VPR scores

Perfect for weekly supervisor meetings and reporting!

---

## KEV (Known Exploited Vulnerabilities)

HexTrackr integrates with CISA's Known Exploited Vulnerabilities catalog to help you prioritize actively exploited threats.

### Identifying KEV Vulnerabilities

KEV vulnerabilities are marked throughout the interface:

- **KEV Column**: Red "YES" badge for known exploited vulnerabilities
- **Vulnerability Cards**: KEV badge in the upper-right corner
- **Device Cards**: KEV badge when ANY vulnerability on that device is a known KEV
- **Details Modal**: KEV badge in the modal header

### KEV Modal

Click any KEV badge to see:

- **CISA KEV Status**: Confirmation of Known Exploited Vulnerability designation
- **NIST NVD Links**: Authoritative CVE information
- **Additional Notes**: Special guidance from CISA
- **CVE Details Button**: Seamless transition to full vulnerability details

### Filtering KEV Vulnerabilities

Focus on exploited vulnerabilities using:

1. **KEV Column Filter**: Click the filter icon in the KEV column header
2. **Severity Dropdown**: Select "KEV" from the main filter dropdown
3. **Combined Filtering**: Mix KEV filter with severity, VPR, or vendor filters

### KEV Synchronization

HexTrackr automatically maintains current KEV data:

- **Daily Sync**: CISA KEV catalog updates automatically every 24 hours
- **Background Process**: Updates happen without interrupting your workflow
- **No Authentication Required**: Uses CISA's public KEV feed
- **Manual Sync**: Force immediate update from Settings modal

### KEV Settings

Configure KEV integration in the Settings modal:

- **Enable/Disable Sync**: Control automatic KEV updates
- **Sync Schedule**: Customize update frequency (default: daily)
- **Display Options**: Customize KEV indicators and badges
- **Sync Status**: View last update time and status

### Using KEV for Prioritization

- **Immediate Attention**: KEV vulnerabilities require urgent remediation
- **Regulatory Compliance**: Many frameworks mandate KEV tracking
- **Risk Assessment**: Combine KEV status with VPR scores for comprehensive prioritization
- **Threat Intelligence**: Real-world exploitation data from CISA

---

## Import & Export

### Importing Vulnerability Data

1. Click the **Import** button on the dashboard
2. Select a **Scan Date** (critical for accurate trending)
3. Choose your CSV file from the vulnerability scanner
4. Monitor the progress modal for real-time status

The system automatically:
- Validates the CSV format
- Normalizes vendor names (CISCO, Palo Alto, etc.)
- Updates the dashboard with new data
- Refreshes statistics and trends

### Import Progress

The import progress modal shows:

- **Real-time Status**: Live updates as the import processes
- **Error Reporting**: Detailed feedback for any issues
- **Completion Summary**: Total records imported and any failures
- **Download Report**: Export a professional HTML report of the import results

### Exporting Vulnerability Data

Export vulnerability data in multiple formats:

- **CSV**: Full vulnerability dataset
- **Excel**: Formatted Excel spreadsheet
- **JSON**: For automation and integrations
- **Vendor Breakdown CSV**: Hidden power feature (see VPR Weekly Summary above)

> **Backup Strategy**: Regular CSV exports provide complete data backups that can be re-imported if needed.

---

## Settings & Preferences

Access the Settings modal to configure HexTrackr for your environment.

### ServiceNow Integration

- **Instance URL**: Your ServiceNow instance URL (e.g., `https://yourcompany.service-now.com`)
- **Enable Links**: Make ServiceNow ticket numbers clickable throughout the interface

### KEV Configuration

- **Enable Sync**: Automatic daily synchronization with CISA KEV catalog
- **Sync Schedule**: Customize update frequency
- **Display Options**: Badge styles and visual indicators
- **Manual Sync**: Force immediate update

### Theme Preferences

- **Color Scheme**: Light or dark mode
- **Accent Colors**: Customize interface colors
- **Table Density**: Adjust row spacing in data tables

### Data Management

- **Clear Cache**: Reset cached data
- **Export Settings**: Backup your configuration
- **Import Settings**: Restore configuration from backup

---

## Tips & Tricks

### Keyboard Shortcuts

- **Cmd/Ctrl+Shift+Click on VPR Cards**: Export vendor breakdown CSV
- **Cmd/Ctrl+F**: Quick search in tables
- **Escape**: Close modals and dialogs
- **Arrow Keys**: Navigate within tables

### Best Practices

- **Regular Backups**: Export CSV data weekly as backups
- **KEV Monitoring**: Check KEV filter daily for new exploited vulnerabilities
- **Vendor Filtering**: Use vendor filters for targeted remediation planning
- **Device Sequences**: Maintain accurate device order for patch coordination

### Performance Tips

- **Filter Early**: Use filters to reduce dataset size for faster operations
- **Clear Old Data**: Periodically archive historical data
- **Browser Cache**: Clear browser cache if experiencing slowness

---

## Getting Help

- **Documentation Portal**: Complete technical documentation at `/docs-html/`
- **API Reference**: For integrations and automation
- **Roadmap**: View planned features and improvements
- **Changelog**: Track all updates and fixes by version

Need more help? Check the **Troubleshooting** section in the reference documentation or contact your system administrator.
