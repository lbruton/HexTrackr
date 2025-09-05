# Backing Up and Restoring Data

This guide explains how to back up and restore your HexTrackr data.

## Backing Up Data

HexTrackr allows you to create a ZIP backup of your data.

1. Open the **Settings** modal (cog icon in the header).
2. Go to the **Data Management** tab.
3. Click one of the **Backup** buttons:
    - **Backup Tickets**: Creates a ZIP file containing `tickets.json`.
    - **Backup Vulnerabilities**: Creates a ZIP file containing `vulnerabilities.json`.
    - **Backup All Data**: Creates a ZIP file containing both `tickets.json` and `vulnerabilities.json`.

## Restoring Data

You can restore your data from a ZIP backup file.

1. Open the **Settings** modal.
2. Go to the **Data Management** tab.
3. Click the **Restore Data** button.
4. Select the ZIP backup file from your computer.
5. Choose the type of data to restore (`tickets`, `vulnerabilities`, or `all`).
6. Optionally, you can choose to clear existing data before restoring.

**Warning**: Restoring data will overwrite any existing data of the same type if you choose to clear it. Be sure to back up your current data before restoring from an older backup.
