-- Safe Time-Series Migration for HexTrackr
-- Step 1: Create new tables

-- 1) Assets dimension  
CREATE TABLE IF NOT EXISTS assets (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  hostname TEXT NOT NULL UNIQUE,
  ip_address TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 2) Vulnerabilities dimension (per asset + vuln_key)
CREATE TABLE IF NOT EXISTS dim_vulnerabilities (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  asset_id INTEGER NOT NULL,
  vuln_key TEXT NOT NULL, -- CVE or plugin_id or name hash
  cve TEXT,
  plugin_id TEXT,
  name TEXT,
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
  FOREIGN KEY (vulnerability_id) REFERENCES dim_vulnerabilities(id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_fact_scan_date ON fact_vulnerability_timeseries(scan_date);
CREATE INDEX IF NOT EXISTS idx_fact_vuln ON fact_vulnerability_timeseries(vulnerability_id);

-- Step 2: Populate assets (INSERT OR IGNORE to handle duplicates)
INSERT OR IGNORE INTO assets (hostname, ip_address)
SELECT DISTINCT TRIM(hostname), NULLIF(TRIM(ip_address), '')
FROM vulnerabilities
WHERE TRIM(hostname) != '';

-- Step 3: Populate dim_vulnerabilities 
INSERT OR IGNORE INTO dim_vulnerabilities (asset_id, vuln_key, cve, plugin_id, name, vendor_family)
SELECT a.id,
       COALESCE(
         NULLIF(TRIM(v.cve), ''), 
         NULLIF(TRIM(v.plugin_id), ''), 
         printf('name:%s', substr(lower(COALESCE(v.plugin_name, v.description, 'unknown')), 1, 64))
       ) AS vuln_key,
       NULLIF(TRIM(v.cve), ''),
       NULLIF(TRIM(v.plugin_id), ''),
       NULLIF(TRIM(COALESCE(v.plugin_name, v.description)), ''),
       NULLIF(TRIM(v.vendor), '')
FROM vulnerabilities v
JOIN assets a ON a.hostname = TRIM(v.hostname)
GROUP BY a.id, vuln_key;

-- Step 4: Populate time series data
INSERT OR IGNORE INTO fact_vulnerability_timeseries (vulnerability_id, scan_date, severity, vpr_score, state, import_id, first_seen, last_seen)
SELECT dv.id,
       COALESCE(DATE(v.import_date), DATE(v.last_seen), DATE(v.created_at)) AS scan_date,
       v.severity,
       v.vpr_score,
       v.state,
       v.import_id,
       v.first_seen,
       v.last_seen
FROM vulnerabilities v
JOIN assets a ON a.hostname = TRIM(v.hostname)
JOIN dim_vulnerabilities dv ON dv.asset_id = a.id 
  AND dv.vuln_key = COALESCE(
    NULLIF(TRIM(v.cve), ''), 
    NULLIF(TRIM(v.plugin_id), ''), 
    printf('name:%s', substr(lower(COALESCE(v.plugin_name, v.description, 'unknown')), 1, 64))
  );

-- Step 5: Verification
SELECT 'Assets created:' as metric, COUNT(*) as count FROM assets;
SELECT 'Vulnerabilities created:' as metric, COUNT(*) as count FROM dim_vulnerabilities;
SELECT 'Time series records:' as metric, COUNT(*) as count FROM fact_vulnerability_timeseries;
SELECT 'Scan dates:' as metric, COUNT(DISTINCT scan_date) as count FROM fact_vulnerability_timeseries;
