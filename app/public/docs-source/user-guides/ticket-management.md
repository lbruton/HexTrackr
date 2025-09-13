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

The ticket modal includes a powerful interface for managing a list of devices associated with a ticket.

- **Adding Devices**: Click the **+** button on any device row to add a new device entry below it. The system will attempt to "smart increment" the device name based on the previous entry (e.g., `host01` will suggest `host02`).
- **Removing Devices**: Click the **-** button to remove a device entry.
- **Reordering Devices**: You can reorder devices to define a specific sequence (e.g., for reboots or patching).
  - **Drag and Drop**: Click and hold the drag handle (`::`) to drag a device to a new position.
  - **Arrow Buttons**: Use the up and down arrow buttons for fine-tuned positioning.
  - **Reverse Order**: Click the **Reverse** button to instantly invert the entire order of the device list.

## Viewing and Exporting a Single Ticket

From the main ticket list, you can view a ticket's details or download a bundle of its information.

- **View Ticket**: Click the **View** (eye) icon to see a clean, markdown-formatted version of the ticket's details in a modal.
- **Download Bundle**: Click the **Download Bundle** (download icon) to get a `.zip` archive containing:
  - The ticket details in **PDF** format.
  - The ticket details in **Markdown** format.
  - Any other attached documentation.

## Searching and Filtering

The ticket list can be quickly filtered to find what you need.

- **Global Search**: The main search bar filters tickets based on a wide range of fields, including XT#, Hexagon #, ServiceNow #, location, site, supervisor, tech, and device names.
- **Status Filter**: Use the dropdown to show tickets with a specific status (e.g., "Open", "Overdue").
- **Location Filter**: This dropdown is dynamically populated with all unique locations from the tickets in the database, allowing you to easily filter by a specific location.

## Data Export and Backup

HexTrackr provides several options for exporting your ticket data.

- **Quick Exports**: Use the `CSV`, `Excel`, `JSON`, `PDF`, and `HTML` buttons at the top of the page to quickly export the currently filtered list of tickets.

## ServiceNow Integration

If ServiceNow integration is configured in the settings, all ServiceNow ticket numbers in the list will become clickable links that open directly to the corresponding ticket in your ServiceNow instance.
