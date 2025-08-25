-- Insert unique vulnerabilities into the new vulnerabilities table
INSERT INTO vulnerabilities (hostname, ip_address, cve, plugin_name, description, solution, port, protocol, state, notes, created_at)
SELECT DISTINCT hostname, ip_address, cve, plugin_name, description, solution, port, protocol, state, notes, created_at
FROM vulnerabilities;

-- Insert time-series data into the new vulnerability_time_series table
INSERT INTO vulnerability_time_series (vulnerability_id, scan_date, severity, vpr_score, first_seen, last_seen, import_id)
SELECT v.id AS vulnerability_id, v.last_seen AS scan_date, v.severity, v.vpr_score, v.first_seen, v.last_seen, v.import_id
FROM vulnerabilities v
JOIN vulnerabilities nv ON v.hostname = nv.hostname AND v.cve = nv.cve;
