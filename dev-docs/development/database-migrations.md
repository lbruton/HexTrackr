# Database Migrations

This document describes the database initialization process and how to perform database migrations. For a complete overview of the migration framework, see the [Migration Framework](./migration-framework.md) documentation.

---

## Initialization

The database is initialized automatically when the application starts for the first time. The initialization script `scripts/init-database.js` creates the necessary tables and indexes.

---

## Migrations

Database migrations are handled automatically by the application. When a new version of the application requires a change to the database schema, a migration script is created to update the database.

### Creating a Migration

1.  Create a new SQL file in the `migrations` directory.
2.  The filename should follow the format `YYYYMMDDHHMMSS-description.sql`.
3.  Add the necessary SQL statements to the file to update the database schema.

### Running Migrations

Migrations are run automatically when the application starts. The application checks for new migration files and applies them in chronological order.
