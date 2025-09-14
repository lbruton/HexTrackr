# Vendor-Specific CSV Generators

This directory contains specialized CSV generators for different vulnerability scanner vendors, extending the base `DataGenerator` class with vendor-specific formatting and data patterns.

## Tenable Generator

The `tenable.js` generator creates authentic Tenable Nessus CSV data with:

### Features
- **Realistic Plugin IDs**: Proper ranges based on severity (Critical: 100k-999k, High: 50k-99k, etc.)
- **Authentic Naming**: Real Tenable vulnerability naming conventions
- **Proper Synopsis**: Tenable-style vulnerability descriptions
- **Accurate VPR/CVSS**: Aligned scoring that matches real-world data
- **Port/Protocol Distribution**: Realistic port assignments with proper TCP/UDP mapping

### Usage

```javascript
const TenableGenerator = require('./tenable');

// Create generator instance
const generator = new TenableGenerator(seed);

// Generate a single record
const record = generator.generateTenableRecord();
console.log(record);
// Output: { 'Plugin ID': 45821, 'CVE': 'CVE-2024-1234', ... }

// Generate CSV with 100 records
const csv = generator.generateTenableCSV(100);

// Generate standard test fixtures
const files = await generator.generateTenableFixtures('./output');
// Creates: tenable-small.csv (50), tenable-medium.csv (500), etc.

// Generate specialized scenarios
const scenarios = await generator.generateTenableScenarios('./scenarios');
// Creates: tenable-critical-only.csv, tenable-single-host.csv, tenable-same-cve.csv
```

### CSV Format
```
Plugin ID,CVE,CVSS V3 Base Score,VPR,Risk,Host,Protocol,Port,Name,Synopsis
45821,CVE-2024-1234,7.5,7.2,High,srv-prod-01,TCP,443,Apache HTTP Server Multiple Vulnerabilities,The remote Apache server is affected by multiple vulnerabilities.
```

### Test Scenarios

1. **Critical Only**: 25 critical vulnerabilities for testing high-priority workflows
2. **Single Host**: Multiple vulnerabilities on one device for aggregation testing  
3. **Same CVE**: One CVE affecting multiple hosts for correlation testing

This generator is specifically designed for testing HexTrackr's Tenable import functionality and ensures test data matches real Tenable scan output patterns.