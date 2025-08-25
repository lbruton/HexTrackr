# SQL Migration for Time-Series Schema

## Overview
This folder contains all the SQL scripts and documentation required to migrate the HexTrackr database to a time-series schema. The migration ensures that vulnerabilities are tracked over time, enabling trend analysis and preventing duplicate records.

## Contents
1. **`create_tables.sql`**: Script to create the new schema tables.
2. **`migrate_data.sql`**: Script to migrate existing data to the new schema.
3. **`rollback.sql`**: Script to revert the migration if needed.
4. **`sample_queries.sql`**: Sample queries for common operations on the new schema.
5. **`README.md`**: This documentation file.

## Steps to Execute
1. **Backup the Database**: Ensure a full backup of the database is taken before proceeding.
2. **Run `create_tables.sql`**: This script creates the new tables and indexes.
3. **Run `migrate_data.sql`**: This script migrates the existing data to the new schema.
4. **Test the Migration**: Verify the data integrity and functionality using `sample_queries.sql`.
5. **Rollback if Necessary**: If issues are found, use `rollback.sql` to revert the changes.

## Notes
- Ensure the database is in maintenance mode during the migration to prevent data inconsistencies.
- Test the scripts in a staging environment before running them in production.

## Contact
For any issues or questions, contact the development team.
