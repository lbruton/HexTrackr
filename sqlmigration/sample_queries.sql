-- Get the latest vulnerabilities
SELECT v.hostname, v.cve, ts.severity, ts.vpr_score, ts.scan_date
FROM vulnerabilities v
JOIN vulnerability_time_series ts ON v.id = ts.vulnerability_id
WHERE ts.scan_date = (SELECT MAX(scan_date) FROM vulnerability_time_series WHERE vulnerability_id = v.id);

-- Track VPR changes over time
SELECT v.hostname, v.cve, ts.scan_date, ts.vpr_score
FROM vulnerabilities v
JOIN vulnerability_time_series ts ON v.id = ts.vulnerability_id
WHERE v.cve = 'CVE-2023-1234' AND v.hostname = 'server01'
ORDER BY ts.scan_date;
