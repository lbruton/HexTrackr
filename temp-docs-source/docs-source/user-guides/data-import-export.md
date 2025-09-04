# Importing and Exporting Data

HexTrackr provides robust functionality for importing and exporting data in various formats, allowing for easy data migration, analysis, and integration with other tools.

All data operations are handled through the **Settings** modal, which can be accessed by clicking the gear icon in the application header.

## Accessing Data Management

1. Click the **Settings** (gear) icon in the top-right corner of the application.
2. In the modal that appears, navigate to the **Data Management** tab.

## Exporting Data

You can export both tickets and vulnerabilities in several formats.

### Exporting as CSV

This is the most common format for use in spreadsheets like Excel or Google Sheets.

1. In the **Data Management** tab, locate the section for either **Tickets Management** or **Vulnerabilities Management**.
2. Click the **Export ... CSV** button for the data type you wish to export.
3. A CSV file containing all the current data for that type will be generated and downloaded by your browser.

### Exporting All Data

From the **Global Data Operations** section, you can export all tickets and vulnerabilities into a single ZIP archive containing separate CSV files.

1. Click the **Export All Data** button.
2. A ZIP file named `hextrackr_all_data_export_[date].zip` will be downloaded. This file contains `tickets.csv` and `vulnerabilities.csv`.

## Importing Data

HexTrackr supports importing data from CSV files. This is the primary way to add vulnerability data from scanners like Tenable or Cisco.

### Importing Vulnerabilities from CSV

1. On the **Vulnerability Management Dashboard**, click the **Import** button.
2. You will be prompted to select a **Scan Date**. This is a crucial step for the historical trend analysis. Choose the date the vulnerability scan was performed.
3. Click **Import with Date**.
4. Select the CSV file from your computer.

The file will be uploaded and processed. The dashboard and tables will automatically refresh with the new data.

### Importing Tickets from CSV

1. Navigate to the **Data Management** tab in the **Settings** modal.
2. Under **Tickets Management**, click the **Import Tickets CSV** button.
3. Select the CSV file containing your ticket data.

The system will process the file and add the tickets to the database.

### CSV File Format

For a successful import, your CSV file should have a header row with column names that match the fields in HexTrackr. The system is flexible and can map common variations (e.g., `hostname`, `Host`, `asset.name`).

## Required fields for Vulnerabilities

- `hostname` (or equivalent)
- `cve` (or equivalent)
- `severity`

## Required fields for Tickets

- `hexagon_ticket`
- `location`
- `date_submitted`
- `date_due`
