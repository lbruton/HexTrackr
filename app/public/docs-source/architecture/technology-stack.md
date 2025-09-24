# Technology Stack

This document provides a list of the technologies used in the HexTrackr project.

---

## Frontend

- **HTML5**
- **CSS3**
- **JavaScript (ES6)**
- **Bootstrap**
- **Tabler.io**
- **AG Grid**
- **ApexCharts**
- **Socket.io-client**

---

## Backend

- **Node.js**
- **Express**
- **Socket.io**
- **SQLite3**

---

## Development

- **Docker**
- **Docker Compose**
- **nginx**
- **Jest**
- **Playwright**

---

## External Integrations

### Security Intelligence

- **CISA KEV API** *(v1.0.22+)*
  - Known Exploited Vulnerabilities catalog
  - Automatic daily synchronization
  - No authentication required
  - JSON feed from `https://www.cisa.gov/sites/default/files/feeds/known_exploited_vulnerabilities.json`

### Threat Intelligence Sources

- **NIST National Vulnerability Database (NVD)**
  - CVE detail links and references
  - Authoritative vulnerability information
  - Accessed via direct links to `https://nvd.nist.gov/vuln/detail/{cveId}`

### Data Sources

- **Tenable.io/Nessus** - Vulnerability scanner CSV exports
- **Qualys VMDR** - Vulnerability scanner CSV exports
- **Rapid7 InsightVM** - Vulnerability scanner CSV exports
- **Custom CSV** - Any properly formatted vulnerability data
