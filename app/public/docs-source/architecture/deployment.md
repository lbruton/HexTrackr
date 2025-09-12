# Deployment Architecture

This document describes how HexTrackr is packaged and deployed. The current deployment target is a single Docker container that serves:

- The Node.js/Express API (`server.js`)
- Static frontend pages (`tickets.html`, `vulnerabilities.html` and related assets)
- The generated documentation portal (`/docs-html`)

> Scope: Operational packaging, runtime topology, environment configuration, persistence, and production hardening considerations.

---

## Container Topology

HexTrackr runs as a single process inside one container (monolith pattern). No sidecars or auxiliary services are required (SQLite is an embedded file, not a network service).

```text
┌────────────────────────────────────────────┐
│ HexTrackr Container                        │
│  • Node.js (Express)                       │
│  • SQLite file DB (data/hextrackr.db)      │
│  • Static assets + docs portal             │
└────────────────────────────────────────────┘
```

### Characteristics

| Aspect | Implementation |
| ------ | -------------- |
| Base Image | Official Node Alpine (see `Dockerfile.node`) |
| Process Model | Single node process started via `node server.js` |
| Persistence | Bind-mounted `data/` directory for the SQLite file |
| Health Probe | `GET /health` (returns JSON with status, version, uptime) |
| Port | 8080 (internal container), 8989 (external host mapping) |
| Logging | Stdout/stderr (structured JSON not yet implemented) |

---

## Docker Compose Layer

`docker-compose.yml` orchestrates the lone service:

| Service | Purpose | Key Config |
| ------- | ------- | ---------- |
| `hextrackr` | Runs the monolithic app | Port 8989:8080 mapping, bind mounts for code & DB |

### Notable Compose Settings

- `volumes`:
  - `.:/app` (live‑reload style development inside container)
  - `./data:/app/data` (persists SQLite across restarts)
- `environment`:
  - `NODE_ENV` is not set by default (undefined); can be overridden for production
- `restart: unless-stopped` ensures resilience to host reboots.

---

## Image Build (Dockerfile.node)

Responsibilities:

1. Set up Node runtime
2. Copy `package.json` / install dependencies
3. Copy application source (including docs, scripts, styles)
4. Expose port 8080 (internal container port)
5. Define default command (`node server.js`)

### Build Context Notes

- `.dockerignore` (not yet present) should be added in future to trim build context (node_modules, logs, backups).
- Dev workflows mount the repo; production builds should use multi‑stage with a slimmer final image.

---

## Persistence Strategy

| Data | Location | Retention | Notes |
| ---- | -------- | --------- | ----- |
| SQLite DB | `data/hextrackr.db` | Persistent via bind mount | Contains tickets, vulnerability rollover tables, imports, snapshots, daily totals |
| Upload Temp Files | `uploads/` | Ephemeral | CSV uploads removed post‑processing via `PathValidator.safeUnlinkSync` |
| Generated Docs | `docs-html/` | Rebuilt on demand | Static assets baked into image or served from mounted source |
| Backups | `backups/` | Manual snapshots | Folder contains timestamped HTML/DB backups |

---

## Environment Variables

Current minimal set (implicit defaults):

| Variable | Default | Purpose |
| -------- | ------- | ------- |
| `PORT` | 8080 | Internal container listening port |
| `NODE_ENV` | undefined | Not set by default in docker-compose.yml |

Planned / Recommended additions (future hardening):

- `HEXTRACKR_MAX_UPLOAD_MB` (override CSV limit)
- `HEXTRACKR_DB_PATH` (custom database path for clustered storage)
- `LOG_LEVEL` (structured logging control)

---

## Security & Hardening

| Area | Current State | Improvement Opportunities |
| ---- | ------------- | ------------------------ |
| File System Access | Guarded by in‑process `PathValidator` | Add central audit logging for rejected paths |
| Network Surface | Single HTTP port | Optional reverse proxy (Nginx / Traefik) for TLS + rate limiting |
| TLS | Terminated externally (not bundled) | Provide sample compose with Caddy / nginx TLS termination |
| Dependency Risk | Managed via `package.json` | Add CI vulnerability scanning (Trivy, npm audit) |
| Resource Limits | Not specified | Add CPU & memory limits in compose / k8s spec |

---

## Health & Monitoring

- Liveness/readiness: `GET /health` (returns `{ status, version, db, uptime }`).
- Suggested production enhancements:
  - Add metric endpoint (Prometheus format) for import counts & query timing.
  - Add structured log lines (JSON) with request timing.

---

## Deployment Workflow (Current)

1. Clone repository
2. Run `docker compose up --build`
3. Access app at `http://localhost:8989` (Docker maps 8989→8080)
4. Load tickets (`/tickets.html`) or vulnerabilities (`/vulnerabilities.html`)
5. Import CSV via UI or API (`POST /api/vulnerabilities/import`)

### Future Production Path (Planned)

| Stage | Action |
| ----- | ------ |
| Build | CI builds image, runs lint/tests, embeds version metadata |
| Scan | Security scan (Trivy) gating push |
| Push | Publish to registry (e.g., GHCR) |
| Deploy | Pull pinned digest into orchestrator (k8s / ECS / Nomad) |
| Observe | Metrics + logs + health checks |

---

## Scaling Considerations

While single‑node is sufficient now, future scale paths:

| Concern | Option |
| ------- | ------ |
| Concurrent Imports | Serialize (already sequential); queue via lightweight worker if needed |
| Read Throughput | Add SQLite WAL mode & connection pooling (read replicas not supported natively) |
| HA | Migrate to PostgreSQL and split services (import worker vs API) |
| Static Assets | CDN offload for docs & JS bundles |

---

## Backup & Recovery

| Action | Method | Notes |
| ------ | ------ | ----- |
| On‑Demand Export | `GET /api/backup/all` | JSON payload of tickets & legacy vulnerabilities |
| Rollover Tables | Reconstructed via re‑imports | Preserve original CSV archives externally |
| Point‑in‑Time | Copy `data/hextrackr.db` | Quiesce writes during copy for integrity |

Add a cron (external) to snapshot `data/` daily.

---

## Known Gaps

- `.dockerignore` file exists and is properly configured
- No production multi‑stage image
- No automated vulnerability scan in pipeline
- No TLS termination example
- No environment variable schema validation

---

## Summary

HexTrackr’s deployment is intentionally simple: one container, embedded database, fast startup. This keeps operational overhead low while the product matures. The outlined enhancements chart a clear path toward production hardening without premature complexity.
