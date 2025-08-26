-- API Update Queries for Time-Series Schema

-- 1. Updated Stats Query (latest data from time series)
SELECT 
  f.severity,
  COUNT(*) as count,
  SUM(f.vpr_score) as total_vpr,
  AVG(f.vpr_score) as avg_vpr,
  MIN(f.first_seen) as earliest,
  MAX(f.last_seen) as latest
FROM fact_vulnerability_timeseries f
JOIN dim_vulnerabilities dv ON f.vulnerability_id = dv.id
WHERE f.scan_date = (
  SELECT MAX(scan_date) FROM fact_vulnerability_timeseries f2 
  WHERE f2.vulnerability_id = f.vulnerability_id
)
GROUP BY f.severity;

-- 2. Updated Trends Query (time series data)
SELECT 
  f.scan_date as date,
  f.severity,
  COUNT(*) as count,
  SUM(f.vpr_score) as total_vpr
FROM fact_vulnerability_timeseries f
WHERE f.scan_date >= DATE('now', '-180 days')
GROUP BY f.scan_date, f.severity
ORDER BY f.scan_date DESC, f.severity;

-- 3. Updated Vulnerabilities List Query (with joins)
SELECT 
  a.hostname,
  a.ip_address,
  dv.cve,
  dv.name as plugin_name,
  dv.plugin_id,
  f.severity,
  f.vpr_score,
  f.state,
  f.first_seen,
  f.last_seen,
  f.scan_date
FROM fact_vulnerability_timeseries f
JOIN dim_vulnerabilities dv ON f.vulnerability_id = dv.id
JOIN assets a ON dv.asset_id = a.id
WHERE f.scan_date = (
  SELECT MAX(scan_date) FROM fact_vulnerability_timeseries f2 
  WHERE f2.vulnerability_id = f.vulnerability_id
)
ORDER BY f.vpr_score DESC;

-- 4. Updated Count Query
SELECT COUNT(*) as total 
FROM fact_vulnerability_timeseries f
WHERE f.scan_date = (
  SELECT MAX(scan_date) FROM fact_vulnerability_timeseries f2 
  WHERE f2.vulnerability_id = f.vulnerability_id
);
