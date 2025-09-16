Tickets Page (tickets.html)

As a Network Operations Administrator coordinating two remote teams that rely on different ticket systems, I want to capture, organize, and exchange Hexagon maintenance and ServiceNow change/incident details-including device sequences, supervisors, and supporting documentation-so that I can track work orders end-to-end, from intake through shared documentation to exportable bundles for field teams and stakeholders.

Key needs:

- Generate sequential XT numbers automatically and persist semicolon-ordered device lists (draggable, reversible).
- Import CSVs from legacy trackers with append/replace modes; normalize device formats and migrate to /api/tickets/migrate.
- Monitor ticket health via stats (total/open/overdue/completed) and table filters (search, status, location).
- View tickets in markdown for quick sharing, copy bundle-ready assets, and download ZIP bundles (PDF + markdown + uploaded docs).
- Export filtered lists to CSV/Excel/JSON/PDF/HTML.
- Handle validation/errors (toast feedback, migration conflicts) and preserve audit fields (created/updated timestamps).
- Produce exports that align with both Hexagon maintenance workflows and ServiceNow change/incident processes.


Vulnerabilities Page (vulnerabilities.html)

As a Network Operations Administrator, I want to ingest scanner CSVs, monitor rolling vulnerability metrics, and drill into affected devices or advisories so that I can prioritize remediation using accurate VPR trends, lifecycle states, and critical KEV identifiers.

Key needs:

- Upload CSVs via staging importer (/api/vulnerabilities/import-staging) that handles multi-format fields, split CVEs and Cisco SAs, and updates the rollover tables with deduped VPR totals.
- Watch real-time progress through the WebSocket-backed progress modal, with automatic fallback if sockets fail.
- Consume /api/vulnerabilities (active/reopened), /recent-trends, /trends, and /resolved to populate AG Grid, stat cards, and trends.
- Filter and search by severity, lifecycle, host, and leverage daily totals that avoid VPR inflation.
- Review import history, backup/export data, and clear rollover tables when staging new datasets (dangerous admin operations).
- Drill into device and vulnerability modals that aggregate by normalized hostname and description with accurate counts.
- Track deduplicated VPR sums by severity, monitor trends, and validate daily totals without double counting.
- Quickly prioritize CISA KEVs and deliver filtered reporting data to stakeholders.
