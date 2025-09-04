# Backing Up and Restoring Data

HexTrackr includes a powerful backup and restore system to ensure your data is safe and can be easily migrated or recovered. All backup and restore operations are managed through the **Settings** modal.

## Accessing Backup and Restore Tools

1. Click the **Settings** (gear) icon in the top-right corner of the application.
2. In the modal, navigate to the **Data Management** tab.

## Creating Backups

Backups are created as ZIP archives containing JSON files of your data. This format is ideal for complete and accurate data preservation.

### Backup Options

You can create backups for specific data types or for the entire system.

- **Backup Tickets**: Creates a `hextrackr_backup_tickets_[date].zip` file containing `tickets.json`.
- **Backup Vulnerabilities**: Creates a `hextrackr_backup_vulnerabilities_[date].zip` file containing `vulnerabilities.json`.

To create a backup:

1. Navigate to the **Data Management** tab.
2. Under the appropriate section (Tickets or Vulnerabilities), click the **Backup ... ZIP** button.
3. The ZIP file will be generated and downloaded by your browser.

### Full System Backup

While there isn't a single button for a full system ZIP backup in the UI, you can achieve a full backup by creating separate backups for tickets and vulnerabilities.

## Restoring Data

You can restore data from a previously created backup ZIP file.

### Restore Process

1. Navigate to the **Data Management** tab.
2. Under the appropriate section, click the **Restore ... ZIP** button.
3. Select the backup ZIP file from your computer.

**Important**: When restoring, the system will add the data from the backup file. It does not automatically clear existing data unless you choose to do so.

### Clearing Data Before Restore

If you want to replace the existing data with the data from your backup, you should first clear the current data.

1. In the **Data Management** tab, click the **Clear ...** button for the data type you intend to restore.
2. You will be asked to confirm this action, as it is irreversible.
3. Once the data is cleared, proceed with the restore process described above.

## Global Data Operations

### Clear All Data

In the **Global Data Operations** section, you will find a **Clear All Data** button. This is a high-risk operation that will permanently delete **all tickets and all vulnerability data** from the system.

- **Use with extreme caution.**
- This is useful when you want to start with a completely clean slate before performing a full system restore.

## Best Practices

- **Regular Backups**: It is highly recommended to perform regular backups of your data, especially before importing large new datasets or performing major system changes.
- **Store Backups Securely**: Backup files contain all your ticket and vulnerability data. Store them in a secure location.
- **Test Restores**: Periodically test your backups by restoring them to a non-production instance of HexTrackr to ensure their integrity.
