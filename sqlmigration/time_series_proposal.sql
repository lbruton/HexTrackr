-- Proposal: Dimensional + Time-series model for vulnerabilities

-- 1) Assets dimension
CREATE TABLE IF NOT EXISTS assets (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  hostname TEXT NOT NULL,
  ip_address TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(hostname)
);

-- 2) Vulnerabilities dimension (per asset + vuln_key)
-- vuln_key preference order: CVE -> plugin_id -> hash(name)
CREATE TABLE IF NOT EXISTS dim_vulnerabilities (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  asset_id INTEGER NOT NULL,
  vuln_key TEXT NOT NULL, -- CVE or plugin_id or name hash
  cve TEXT,
  plugin_id TEXT,
  name TEXT, -- plugin/name/definition
  vendor_family TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(asset_id, vuln_key),
  FOREIGN KEY (asset_id) REFERENCES assets(id)
);

-- 3) Time series fact table
CREATE TABLE IF NOT EXISTS fact_vulnerability_timeseries (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  vulnerability_id INTEGER NOT NULL,
  scan_date DATE NOT NULL,
  severity TEXT,
  vpr_score REAL,
  state TEXT,
  import_id INTEGER,
  first_seen TEXT,
  last_seen TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(vulnerability_id, scan_date),
  FOREIGN KEY (vulnerability_id) REFERENCES dim_vulnerabilities(id),
  FOREIGN KEY (import_id) REFERENCES vulnerability_imports(id)
);
CREATE INDEX IF NOT EXISTS idx_fact_scan_date ON fact_vulnerability_timeseries(scan_date);
CREATE INDEX IF NOT EXISTS idx_fact_vuln ON fact_vulnerability_timeseries(vulnerability_id);

-- Helpers
CREATE TABLE IF NOT EXISTS _tmp_name_hash (
  name TEXT PRIMARY KEY,
  hash TEXT
);

-- Populate assets
INSERT INTO assets (hostname, ip_address)
SELECT DISTINCT TRIM(hostname), NULLIF(TRIM(ip_address), '')
FROM vulnerabilities
WHERE TRIM(hostname)!='';

-- Name hash helper: use lower(name) sha1-like via sqlite "hex"/"sha1" unavailable by default; fall back to deterministic substr of lower(name)
-- If description/plugin_name available later, we can recompute.

-- Populate dim_vulnerabilities using COALESCE order for vuln_key
INSERT INTO dim_vulnerabilities (asset_id, vuln_key, cve, plugin_id, name, vendor_family)
SELECT a.id,
       COALESCE(NULLIF(TRIM(v.cve), ''), NULLIF(TRIM(v.plugin_id), ''), printf('name:%s', substr(lower(COALESCE(v.plugin_name, v.description, 'unknown')), 1, 64))) AS vuln_key,
       NULLIF(TRIM(v.cve), ''),
       NULLIF(TRIM(v.plugin_id), ''),
       NULLIF(TRIM(COALESCE(v.plugin_name, v.description)), ''),
       NULLIF(TRIM(v.vendor), '')
FROM vulnerabilities v
JOIN assets a ON a.hostname = TRIM(v.hostname)
GROUP BY a.id, vuln_key;

-- Seed time series with single snapshot using import_date as scan_date when present
INSERT OR IGNORE INTO fact_vulnerability_timeseries (vulnerability_id, scan_date, severity, vpr_score, state, import_id, first_seen, last_seen)
SELECT dv.id,
       COALESCE(NULLIF(v.import_date, ''), DATE(v.created_at)) AS scan_date,
       v.severity,
       v.vpr_score,
       v.state,
       v.import_id,
       v.first_seen,
       v.last_seen
FROM vulnerabilities v
JOIN assets a ON a.hostname = TRIM(v.hostname)
JOIN dim_vulnerabilities dv ON dv.asset_id = a.id AND dv.vuln_key = COALESCE(NULLIF(TRIM(v.cve), ''), NULLIF(TRIM(v.plugin_id), ''), printf('name:%s', substr(lower(COALESCE(v.plugin_name, v.description, 'unknown')), 1, 64)));

-- Verification samples
SELECT COUNT(*) AS assets_count FROM assets;
SELECT COUNT(*) AS dim_vulns_count FROM dim_vulnerabilities;
SELECT COUNT(*) AS fact_rows FROM fact_vulnerability_timeseries;
SELECT scan_date, COUNT(*) AS rows FROM fact_vulnerability_timeseries GROUP BY scan_date ORDER BY scan_date DESC LIMIT 5;
