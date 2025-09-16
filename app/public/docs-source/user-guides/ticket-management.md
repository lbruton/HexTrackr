# Ticket Management Guide

This guide provides a comprehensive overview of the features available on the Tickets page (`/tickets.html`), from creating and managing tickets to exporting data.

## Creating and Editing Tickets

### Creating a New Ticket

1. From the main tickets view, click the **Add New Ticket** button to open the ticket modal.
2. The **Ticket Number (XT#)** is automatically generated for you and is not editable.
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
  - File attachments stored with the record. The bundler renames files to match the XT number and sanitizes file names to avoid path traversal.

## Searching and Filtering

The ticket list can be quickly filtered to find what you need.

- **Global Search**: The main search bar filters tickets based on a wide range of fields, including XT#, Hexagon #, ServiceNow #, location, site, supervisor, tech, and device names.
- **Status Filter**: Use the dropdown to show tickets with a specific status (e.g., "Open", "Overdue").
- **Location Filter**: This dropdown is dynamically populated with all unique locations from the tickets in the database, allowing you to easily filter by a specific location.

## Importing Ticket Data

- **CSV Import Button**: Selecting **Import CSV** opens a file picker and routes the file through PapaParse in the browser. The parser trims whitespace, normalizes device lists (arrays, commas, or semicolons), and generates XT numbers when the column is missing.
- **Mode Selection**: When the database already contains tickets, the importer prompts for **Replace All Data** (clears the table before importing) or **Add to Existing Data** (upsert into the current dataset). Both options call `POST /api/tickets/migrate` with a `mode` flag.
- **Error Handling**: Invalid rows surface as toast notifications and are logged in the browser console for troubleshooting. The migration endpoint responds with counts for migrated and failed rows.

## Data Export and Backup

Use the export toolbar to download the currently filtered dataset.

- **Quick Exports**: `CSV`, `Excel`, `JSON`, `PDF`, and `HTML` buttons delegate to `exportTicketsTableData(format)`. Devices are converted back to semicolon strings, and attachments are omitted for compact output.
- **Local Backup**: The CSV export mirrors the schema expected by the importer, making round-trips lossless. JSON exports include the camelCase keys consumed by the REST API so automated tooling can feed them directly into `POST /api/tickets`.
- **Error Feedback**: Export actions surface toast notifications for missing data or generation errors (for example, attempting to export when no rows match the current filters).

## ServiceNow Integration

If ServiceNow integration is configured in the settings, all ServiceNow ticket numbers in the list become clickable links that open directly to the corresponding ticket in your ServiceNow instance.
