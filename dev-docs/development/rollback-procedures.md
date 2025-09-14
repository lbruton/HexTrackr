# Rollback Procedures

This document provides procedures for rolling back to a previous version of the HexTrackr application in case of a failed migration.

---

## Database Rollback

1.  **Stop**: Stop the application.
2.  **Restore**: Restore the database from the backup created before the migration.
3.  **Start**: Start the application.

---

## Application Rollback

1.  **Stop**: Stop the application.
2.  **Restore**: Restore the application files from a backup or from the previous version in the version control system.
3.  **Start**: Start the application.
