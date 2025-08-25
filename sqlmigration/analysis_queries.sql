-- Core counts
SELECT COUNT(*) AS total_vulnerabilities FROM vulnerabilities;
SELECT COUNT(DISTINCT hostname) AS unique_assets FROM vulnerabilities WHERE hostname IS NOT NULL AND TRIM(hostname)!='';
SELECT COUNT(DISTINCT cve) AS unique_cves FROM vulnerabilities WHERE cve IS NOT NULL AND TRIM(cve)!='';
SELECT COUNT(DISTINCT hostname || '|' || cve) AS distinct_hostname_cve FROM vulnerabilities WHERE TRIM(hostname)!='' AND TRIM(cve)!='';

-- Severity distribution
SELECT severity, COUNT(*) AS count FROM vulnerabilities GROUP BY severity ORDER BY count DESC;

-- Vendor / family distribution (row-level)
SELECT vendor, COUNT(*) AS count FROM vulnerabilities GROUP BY vendor ORDER BY count DESC;

-- Import/vendor distribution (import-level)
SELECT vendor AS source_vendor, COUNT(*) AS imports FROM vulnerability_imports GROUP BY vendor ORDER BY imports DESC;

-- Duplicate groups by hostname + cve
SELECT hostname, cve, COUNT(*) AS cnt
FROM vulnerabilities
WHERE TRIM(hostname)!='' AND TRIM(cve)!=''
GROUP BY hostname, cve
HAVING COUNT(*)>1
ORDER BY cnt DESC
LIMIT 50;

-- Aggregate duplicate stats by hostname + cve
WITH g AS (
  SELECT hostname, cve, COUNT(*) AS cnt
  FROM vulnerabilities
  WHERE TRIM(hostname)!=''
  GROUP BY hostname, cve
)
SELECT COUNT(*) AS dup_groups, SUM(cnt) AS rows_in_dup_groups, SUM(cnt-1) AS extra_rows
FROM g
WHERE cnt>1;

-- True importer uniqueness (hostname+cve+plugin_id)
SELECT hostname, cve, plugin_id, COUNT(*) AS cnt
FROM vulnerabilities
GROUP BY hostname, cve, plugin_id
HAVING COUNT(*)>1
ORDER BY cnt DESC
LIMIT 50;

-- Date patterns
SELECT MIN(first_seen) AS min_first_seen, MAX(last_seen) AS max_last_seen FROM vulnerabilities;
SELECT DATE(created_at) AS created_date, COUNT(*) AS cnt FROM vulnerabilities GROUP BY DATE(created_at) ORDER BY created_date;
SELECT import_date, COUNT(*) AS cnt FROM vulnerabilities GROUP BY import_date ORDER BY import_date;
SELECT last_seen, COUNT(*) AS cnt FROM vulnerabilities GROUP BY last_seen ORDER BY last_seen;

-- VPR availability and variance
SELECT COUNT(*) AS vpr_nonnull FROM vulnerabilities WHERE vpr_score IS NOT NULL;
SELECT COUNT(*) AS vpr_null FROM vulnerabilities WHERE vpr_score IS NULL;
SELECT COUNT(DISTINCT vpr_score) AS vpr_distinct FROM vulnerabilities WHERE vpr_score IS NOT NULL;
SELECT hostname, cve, MIN(vpr_score) AS min_vpr, MAX(vpr_score) AS max_vpr, COUNT(*) AS cnt
FROM vulnerabilities
WHERE vpr_score IS NOT NULL AND TRIM(hostname)!='' AND TRIM(cve)!=''
GROUP BY hostname, cve
HAVING COUNT(*)>1 AND MAX(vpr_score) - MIN(vpr_score) > 0.1
ORDER BY (MAX(vpr_score)-MIN(vpr_score)) DESC
LIMIT 50;

-- VPR history linkage check
SELECT COUNT(*) AS history_rows FROM vulnerability_history;
SELECT COUNT(*) AS nonnull_history FROM vulnerability_history WHERE vulnerability_id IS NOT NULL;
SELECT change_date, COUNT(*) AS cnt FROM vulnerability_history GROUP BY change_date ORDER BY change_date DESC LIMIT 10;

-- Missing data profile
SELECT COUNT(*) AS total,
  SUM(CASE WHEN hostname IS NULL OR TRIM(hostname)='' THEN 1 ELSE 0 END) AS empty_hostname,
  SUM(CASE WHEN ip_address IS NULL OR TRIM(ip_address)='' THEN 1 ELSE 0 END) AS empty_ip,
  SUM(CASE WHEN cve IS NULL OR TRIM(cve)='' THEN 1 ELSE 0 END) AS empty_cve,
  SUM(CASE WHEN severity IS NULL OR TRIM(severity)='' THEN 1 ELSE 0 END) AS empty_severity,
  SUM(CASE WHEN vpr_score IS NULL THEN 1 ELSE 0 END) AS null_vpr,
  SUM(CASE WHEN cvss_score IS NULL THEN 1 ELSE 0 END) AS null_cvss,
  SUM(CASE WHEN plugin_id IS NULL OR TRIM(plugin_id)='' THEN 1 ELSE 0 END) AS empty_plugin_id,
  SUM(CASE WHEN plugin_name IS NULL OR TRIM(plugin_name)='' THEN 1 ELSE 0 END) AS empty_plugin_name,
  SUM(CASE WHEN description IS NULL OR TRIM(description)='' THEN 1 ELSE 0 END) AS empty_description,
  SUM(CASE WHEN solution IS NULL OR TRIM(solution)='' THEN 1 ELSE 0 END) AS empty_solution,
  SUM(CASE WHEN vendor_reference IS NULL OR TRIM(vendor_reference)='' THEN 1 ELSE 0 END) AS empty_vendor_reference,
  SUM(CASE WHEN vulnerability_date IS NULL OR TRIM(vulnerability_date)='' THEN 1 ELSE 0 END) AS empty_vuln_date,
  SUM(CASE WHEN last_seen IS NULL OR TRIM(last_seen)='' THEN 1 ELSE 0 END) AS empty_last_seen
FROM vulnerabilities;
