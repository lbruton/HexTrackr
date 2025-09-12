## `architecture/database.md`

* **Outdated Information:** The documentation states that the legacy `vulnerabilities` table still exists for backup/export compatibility. However, the `server.js` file shows that this table has been removed from the database initialization script, and the application will error if the backup endpoints that use it are called.
