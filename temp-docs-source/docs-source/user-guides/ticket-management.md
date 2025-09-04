# Ticket Management Guide

The Tickets page (`/tickets.html`) lets you create, edit, filter, and export tickets. Devices can be added per ticket and reordered.

## Create a ticket

<!-- markdownlint-disable MD029 -->

1. Open the Tickets page.
2. Click Add Ticket.
3. In the modal, fill:
    - XT Number (optional)
    - Date Submitted, Date Due
    - Hexagon Ticket, ServiceNow Ticket
    - Site, Location
    - Devices: Add Device to insert rows; drag to reorder; Reverse Order to flip numbering
    - Supervisor, Tech, Status, Notes
1. Save to persist.

<!-- markdownlint-enable MD029 -->

## Edit or delete

- Click Edit on a row to modify and save.
- Click Delete to remove; confirm when prompted.

## Search, filters, pagination

- Use top search and dropdowns for Site, Location, Status. Results update instantly.
- Pagination controls at the bottom; adjust rows per page to change density.

## Export and backup

- Open Settings (gear icon):
  - Export Tickets/Vulnerabilities/All (CSV or JSON)
  - Backup data and Restore from zip
  - Clear datasets (tickets/vulns/all)

## ServiceNow links

- Configure your instance in Settings. When enabled, ServiceNow ticket IDs link to your instance.
