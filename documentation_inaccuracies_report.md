# Documentation Inaccuracies Report

This report details the inaccuracies found in the HexTrackr documentation.

## `getting-started/index.md`

* **Port Number:** The documentation states that the application will be available at `http://localhost:8080`. However, the `docker-compose.yml` file and the `server.js` file both specify that the application should run on port `8989`.

## `api-reference/vulnerabilities-api.md`

* **Inaccuracy:** The `GET /api/vulnerabilities` endpoint is documented as filtering by `lifecycle_state IN ('active', 'reopened')` by default. However, the `server.js` file shows that this filter is only applied if the `lifecycle_state` parameter is not provided in the request.
* **Missing Endpoint:** The documentation is missing the `/api/vulnerabilities/resolved` endpoint, which is present in `server.js`.
* **Missing Endpoint:** The documentation is missing the `/api/vulnerabilities/import-staging` endpoint, which is present in `server.js`.
* **Outdated Information:** The documentation for the `POST /api/vulnerabilities/import` endpoint mentions that a bug was "Fixed in v1.0.5". This information is outdated and should be removed.
* **Clarity:** The documentation for the `POST /api/vulnerabilities/import` and `POST /api/import/vulnerabilities` endpoints could be clearer about the differences between them. The former is for server-side parsing of CSV files, while the latter is for client-side parsing.

## `api-reference/tickets-api.md`

* **Inaccuracy:** The `GET /api/tickets` endpoint is documented as returning `devices` and `attachments` as JSON strings. However, the `server.js` file shows that the `devices` and `attachments` are parsed into JSON objects before being sent to the client.
* **Inaccuracy:** The `POST /api/tickets` endpoint is documented as expecting camelCase keys in the request body. However, the `server.js` file shows that the backend is expecting snake_case keys.
* **Missing Information:** The documentation for the `POST /api/tickets/migrate` endpoint is missing information about the `mode` parameter, which is used to specify whether to `replace` or `append` the data.
* **Clarity:** The documentation for the `POST /api/import/tickets` endpoint could be clearer about the fact that it performs an `INSERT OR REPLACE` operation.

## `api-reference/backup-api.md`

* **Inaccuracy:** The `GET /api/backup/vulnerabilities` endpoint is documented as exporting up to 10,000 vulnerabilities. However, the `server.js` file shows that it exports all vulnerabilities.
* **Inaccuracy:** The `GET /api/backup/all` endpoint is documented as exporting up to 10,000 vulnerabilities. However, the `server.js` file shows that it exports all vulnerabilities.
* **Clarity:** The documentation for the `POST /api/restore` endpoint could be clearer about the fact that it expects a zip file containing `tickets.json` and/or `vulnerabilities.json`.

## `architecture/backend.md`

* **Inaccuracy:** The documentation states that the `server.js` file is "≈1,700+ lines". However, I've already read the file and I know that it's over 3800 lines long.
* **Inaccuracy:** The documentation states that the CORS middleware is "open by default". However, the `server.js` file shows that the CORS middleware is configured to only allow requests from `http://localhost:8080` and `http://127.0.0.1:8080`.
* **Outdated Information:** The documentation mentions a "legacy" `vulnerabilities` table and a `POST /api/import/vulnerabilities` endpoint for legacy data. However, the `server.js` file shows that this table and endpoint have been removed.
* **Clarity:** The documentation could be clearer about the differences between the `processVulnerabilityRowsWithRollover` and `processVulnerabilityRowsWithEnhancedLifecycle` functions. The latter is a newer, more performant version of the former.

## `architecture/database.md`

* **Inaccuracy:** The documentation states that the legacy `vulnerabilities` table still exists for backup/export compatibility. However, the `server.js` file shows that this table has been removed.
* **Inaccuracy:** The documentation for the `vulnerability_imports` table is missing the `vendor`, `file_size`, `processing_time`, and `raw_headers` columns.
* **Inaccuracy:** The documentation for the `vulnerability_snapshots` table is missing the `ip_address`, `cvss_score`, `first_seen`, `last_seen`, `plugin_id`, `plugin_name`, `description`, `solution`, `vendor_reference`, `vulnerability_date`, and `state` columns.
* **Inaccuracy:** The documentation for the `vulnerabilities_current` table is missing the `ip_address`, `cvss_score`, `first_seen`, `plugin_id`, `plugin_name`, `description`, `solution`, `vendor_reference`, `vulnerability_date`, and `state` columns.
* **Inaccuracy:** The documentation for the `vulnerability_daily_totals` table is missing the `resolved_count` and `reopened_count` columns.
* **Inaccuracy:** The documentation for the `tickets` table is missing the `attachments`, `site_id`, and `location_id` columns.
* **Clarity:** The documentation could be clearer about the fact that the `vulnerabilities_current` table has a `lifecycle_state` column that is used to track the state of each vulnerability (e.g., `active`, `reopened`, `resolved`).

## `architecture/data-model.md`

* **Inaccuracy:** The documentation states that the legacy `vulnerabilities` table still exists for backup/export compatibility. However, the `server.js` file shows that this table has been removed.
* **Inaccuracy:** The documentation for the `vulnerability_imports` table is missing the `vendor`, `file_size`, `processing_time`, and `raw_headers` columns.
* **Inaccuracy:** The documentation for the `vulnerabilities_current` table is missing the `ip_address`, `cvss_score`, `first_seen`, `plugin_id`, `plugin_name`, `description`, `solution`, `vendor_reference`, `vulnerability_date`, and `state` columns.
* **Inaccuracy:** The documentation for the `vulnerability_snapshots` table is missing the `ip_address`, `cvss_score`, `first_seen`, `last_seen`, `plugin_id`, `plugin_name`, `description`, `solution`, `vendor_reference`, `vulnerability_date`, and `state` columns.
* **Inaccuracy:** The documentation for the `vulnerability_daily_totals` table is missing the `resolved_count` and `reopened_count` columns.
* **Inaccuracy:** The documentation for the `tickets` table is missing the `attachments`, `site_id`, and `location_id` columns.
* **Clarity:** The documentation could be clearer about the fact that the `vulnerabilities_current` table has a `lifecycle_state` column that is used to track the state of each vulnerability (e.g., `active`, `reopened`, `resolved`).
* **Clarity:** The documentation for the `vulnerability_snapshots` table is very brief. It should be expanded to include a full list of the table's columns.
* **Clarity:** The documentation for the `ticket_vulnerabilities` table is confusing. It states that the `vulnerability_id` column is a foreign key to the `vulnerabilities.id` column, but it also says that the `vulnerabilities` table is a legacy table. It should be updated to reflect the current schema.

## `architecture/deployment.md`

* **Inaccuracy:** The documentation states that the application runs on port `8080`. However, the `docker-compose.yml` file and the `server.js` file both specify that the application should run on port `8989`.
* **Inaccuracy:** The documentation states that the `NODE_ENV` environment variable is set to `development` by default. However, the `docker-compose.yml` file does not set this variable, so it will be `undefined` by default.
* **Outdated Information:** The documentation mentions that a `.dockerignore` file is "not yet present". However, a `.dockerignore` file does exist in the root directory.
* **Clarity:** The documentation could be clearer about the fact that the `vulnerabilities_current` table is the primary table for vulnerability data, and that the legacy `vulnerabilities` table has been removed.

## `architecture/frameworks.md`

* **Inaccuracy:** The documentation for Tabler.io states that it's used in `vulnerabilities.html`, `tickets.html`, and `docs-prototype/index.html`. However, the `docs-prototype` directory does not exist. The documentation portal is served from the `docs-html` directory.
* **Inaccuracy:** The documentation for PrismJS states that it's used in `docs-prototype/index.html` and `docs-prototype/js/docs-tabler.js`. However, the `docs-prototype` directory does not exist.
* **Inaccuracy:** The documentation for marked + highlight.js states that it's used in `docs-prototype/html-content-updater.js`. However, the `docs-prototype` directory does not exist.
* **Outdated Information:** The documentation for the backend and server lists `dotenv` as a dependency. However, this package is not listed in the `package.json` file.
* **Clarity:** The documentation could be clearer about the fact that the application uses two different charting libraries: ApexCharts and Chart.js. It should explain why both are used and what the plans are for consolidating them in the future.

## `architecture/refactoring-plan.md`

* **Inaccuracy:** The refactoring plan is presented as a future plan, but it has already been implemented.

## `architecture/rollover-mechanism.md`

* **Inaccuracy:** The documentation for the "Generate Unique Key" step is incomplete. It doesn't mention the `generateEnhancedUniqueKey` function, which is the new, preferred way of generating unique keys. It also doesn't mention the multi-tier deduplication system.
* **Inaccuracy:** The documentation for the "Remove Stale Vulnerabilities" step is inaccurate. It states that stale vulnerabilities are deleted from the `vulnerabilities_current` table. However, the `server.js` file shows that they are marked as "resolved" instead of being deleted.
* **Clarity:** The documentation could be clearer about the differences between the `processVulnerabilityRowsWithRollover` and `processVulnerabilityRowsWithEnhancedLifecycle` functions. The latter is a newer, more performant version of the former.

## `architecture/spec-kit-integration.md`

* **Inaccuracy:** The documentation for the "HTML Content Generator" states that the script is located at `app/public/docs-html/html-content-updater.js`. However, this file does not exist.
* **Inaccuracy:** The documentation for the "NPM Scripts Integration" lists a `docs:sync-all` script. However, this script is not defined in the `package.json` file.
* **Clarity:** The documentation could be clearer about the fact that the `ROADMAP.md` file is generated automatically from the `tasks.md` files in the `hextrackr-specs/specs` directory.

## `development/index.md`

* **Broken Link:** The documentation links to a `pre-commit-hooks.md` file, but this file does not exist in the `development` directory.

## `development/contributing.md`

* **Inaccuracy:** The documentation states that the linting rules are defined in the `.eslintrc.js` file. However, the `eslint.config.mjs` file is the main configuration file for ESLint.

## `development/docs-portal-guide.md`

* **Inaccuracy:** The documentation for the "File Structure" states that the main portal HTML file is `docs-html/index.html`. However, the `server.js` file shows that the main portal HTML file is `docs-html/index.html`.
* **Inaccuracy:** The documentation for the "File Structure" states that the master template for content is `docs-html/template.html`. However, this file does not exist.
* **Inaccuracy:** The documentation for the "File Structure" states that the Markdown to HTML converter is `docs-html/html-content-updater.js`. However, this file does not exist.
* **Inaccuracy:** The documentation for the "File Structure" states that the portal JavaScript is `docs-html/js/docs-portal-v2.js`. However, this file does not exist.
* **Inaccuracy:** The documentation for the "File Structure" states that the generated HTML content is in `docs-html/content/`. However, the `server.js` file shows that the content is served directly from the `docs-html` directory.
* **Inaccuracy:** The documentation for "Adding New Documentation" and "Creating New Sections" refers to the `html-content-updater.js` script, which does not exist.
* **Inaccuracy:** The documentation for "Troubleshooting" refers to the `html-content-updater.js` script and the `logs/docs-source/html-update-report.md` file, which do not exist.
* **Clarity:** The documentation could be clearer about the fact that the documentation portal is a single-page application (SPA) that uses hash-based routing.

## `development/docs-troubleshooting.md`

* **Inaccuracy:** The documentation refers to the `html-content-updater.js` script, which does not exist.
* **Inaccuracy:** The documentation refers to the `docs-html/content/` directory, which does not exist.
* **Inaccuracy:** The documentation refers to the `template.html` file, which does not exist.
* **Clarity:** The documentation could be clearer about the fact that the documentation portal is a single-page application (SPA) that uses hash-based routing.

## `development/testing-strategy.md`

* **Inaccuracy:** The documentation states that the application runs on port `8080`. However, the `docker-compose.yml` file and the `server.js` file both specify that the application should run on port `8989`.
* **Inaccuracy:** The documentation for "Database State Management" shows an example of how to reset the database state between tests. However, this example is incomplete and does not actually reset the database.
* **Clarity:** The documentation could be clearer about the fact that the `/test-data/` directory does not exist.

## `user-guides/index.md`

* **Broken Link:** The documentation links to a `data-import-export.md` file, but this file does not exist in the `user-guides` directory.
* **Broken Link:** The documentation links to a `backup-restore.md` file, but this file does not exist in the `user-guides` directory.

## `user-guides/ticket-management.md`

* **Broken Link:** The documentation links to a `data-import-export.md` file, but this file does not exist in the `user-guides` directory.
* **Broken Link:** The documentation links to a `backup-restore.md` file, but this file does not exist in the `user-guides` directory.
* **Clarity:** The documentation could be clearer about the fact that the "XT#" is automatically generated and not editable.

## `user-guides/vulnerability-management.md`

* **Broken Link:** The documentation links to a `data-import-export.md` file, but this file does not exist in the `user-guides` directory.
* **Broken Link:** The documentation links to a `backup-restore.md` file, but this file does not exist in the `user-guides` directory.
* **Outdated Information:** The documentation for "CSV Import Returns 404 Error" states that this bug was "Fixed in v1.0.5". This information is outdated and should be removed.
* **Clarity:** The documentation could be clearer about the differences between the `processVulnerabilityRowsWithRollover` and `processVulnerabilityRowsWithEnhancedLifecycle` functions. The latter is a newer, more performant version of the former.
* **Clarity:** The documentation for "Hostname Normalization" is incomplete. It doesn't mention that the `normalizeHostname` function also handles IP addresses.
* **Clarity:** The documentation for "Enhanced Deduplication" is incomplete. It doesn't mention the `calculateDeduplicationConfidence` and `getDeduplicationTier` functions.
