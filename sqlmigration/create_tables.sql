-- Create vulnerabilities table
CREATE TABLE vulnerabilities (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    hostname TEXT NOT NULL,
    ip_address TEXT,
    cve TEXT NOT NULL,
    plugin_name TEXT,
    description TEXT,
    solution TEXT,
    port INTEGER,
    protocol TEXT,
    state TEXT,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(hostname, cve)
);

-- Create vulnerability_time_series table
CREATE TABLE vulnerability_time_series (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    vulnerability_id INTEGER NOT NULL,
    scan_date DATE NOT NULL,
    severity TEXT,
    vpr_score REAL,
    first_seen DATETIME,
    last_seen DATETIME,
    import_id INTEGER,
    FOREIGN KEY (vulnerability_id) REFERENCES vulnerabilities(id),
    FOREIGN KEY (import_id) REFERENCES vulnerability_imports(id),
    UNIQUE(vulnerability_id, scan_date)
);

-- Add index for faster queries on time-series data
CREATE INDEX idx_vulnerability_time_series_scan_date ON vulnerability_time_series(scan_date);
