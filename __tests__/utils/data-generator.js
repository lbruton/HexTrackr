/**
 * CSV Data Generator Utility
 * Generates test CSV files of various sizes for vulnerability import testing
 * 
 * Sizes:
 * - Small: 100 records
 * - Medium: 5,000 records  
 * - Large: 25,000 records
 * - XLarge: 100,000 records
 * 
 * @module data-generator
 */

const fs = require('fs').promises;
const path = require('path');
const { Readable } = require('stream');
const { pipeline } = require('stream/promises');

class DataGenerator {
  constructor(seed = 12345) {
    this.seed = seed;
    this.seedIndex = 0;
    
    // Predefined data pools for realistic variety
    this.devicePrefixes = ['fw', 'sw', 'srv', 'rt', 'lb', 'db', 'web', 'app', 'vpn', 'ids'];
    this.deviceEnvironments = ['prod', 'dev', 'test', 'stage', 'qa', 'dr', 'dmz', 'core'];
    this.deviceNumbers = Array.from({ length: 99 }, (_, i) => String(i + 1).padStart(2, '0'));
    
    this.severities = ['Critical', 'High', 'Medium', 'Low'];
    this.severityWeights = [0.05, 0.15, 0.35, 0.45]; // Realistic distribution
    
    // CVE patterns - mix of recent and historical
    this.cveYears = [2024, 2023, 2022, 2021, 2020, 2019];
    
    // Realistic vulnerability descriptions
    this.vulnTypes = [
      'Remote Code Execution',
      'SQL Injection',
      'Cross-Site Scripting (XSS)',
      'Buffer Overflow',
      'Authentication Bypass',
      'Privilege Escalation',
      'Information Disclosure',
      'Denial of Service',
      'Path Traversal',
      'CSRF Vulnerability',
      'SSL/TLS Weakness',
      'Insecure Deserialization',
      'XXE Injection',
      'Server-Side Request Forgery',
      'Weak Cryptography',
      'Missing Security Headers',
      'Outdated Software Version',
      'Default Credentials',
      'Directory Listing Enabled',
      'Sensitive Data Exposure'
    ];
    
    // IP address ranges for different network segments
    this.ipRanges = [
      '10.0.0.', '10.0.1.', '10.0.2.',     // Internal
      '172.16.0.', '172.16.1.',            // Private
      '192.168.1.', '192.168.2.',          // Local
      '203.0.113.', '198.51.100.'          // Test ranges
    ];
  }

  /**
   * Seeded random number generator for reproducible data
   * @returns {number} Random number between 0 and 1
   */
  random() {
    this.seedIndex++;
    const x = Math.sin(this.seed + this.seedIndex) * 10000;
    return x - Math.floor(x);
  }

  /**
   * Pick random item from array using seeded random
   * @param {Array} array - Array to pick from
   * @returns {*} Random item
   */
  randomPick(array) {
    return array[Math.floor(this.random() * array.length)];
  }

  /**
   * Pick weighted random item
   * @param {Array} items - Items to pick from
   * @param {Array} weights - Probability weights
   * @returns {*} Weighted random item
   */
  weightedPick(items, weights) {
    const random = this.random();
    let sum = 0;
    for (let i = 0; i < weights.length; i++) {
      sum += weights[i];
      if (random < sum) return items[i];
    }
    return items[items.length - 1];
  }

  /**
   * Generate a device hostname
   * @returns {string} Device hostname
   */
  generateDevice() {
    const prefix = this.randomPick(this.devicePrefixes);
    const env = this.randomPick(this.deviceEnvironments);
    const num = this.randomPick(this.deviceNumbers);
    return `${prefix}-${env}-${num}`;
  }

  /**
   * Generate a CVE identifier
   * @returns {string} CVE ID
   */
  generateCVE() {
    const year = this.randomPick(this.cveYears);
    const number = Math.floor(this.random() * 20000) + 1;
    return `CVE-${year}-${String(number).padStart(4, '0')}`;
  }

  /**
   * Generate an IP address
   * @returns {string} IP address
   */
  generateIP() {
    const range = this.randomPick(this.ipRanges);
    const lastOctet = Math.floor(this.random() * 254) + 1;
    return `${range}${lastOctet}`;
  }

  /**
   * Generate VPR score based on severity
   * @param {string} severity - Severity level
   * @returns {number} VPR score
   */
  generateVPR(severity) {
    const ranges = {
      'Critical': [8.0, 10.0],
      'High': [6.0, 7.9],
      'Medium': [4.0, 5.9],
      'Low': [0.1, 3.9]
    };
    const [min, max] = ranges[severity];
    return (min + this.random() * (max - min)).toFixed(1);
  }

  /**
   * Generate CVSS score based on severity
   * @param {string} severity - Severity level
   * @returns {number} CVSS score
   */
  generateCVSS(severity) {
    const ranges = {
      'Critical': [9.0, 10.0],
      'High': [7.0, 8.9],
      'Medium': [4.0, 6.9],
      'Low': [0.1, 3.9]
    };
    const [min, max] = ranges[severity];
    return (min + this.random() * (max - min)).toFixed(1);
  }

  /**
   * Generate CSV with specified number of vulnerability records
   * @param {number} recordCount - Number of records to generate
   * @param {string} format - Vendor format (generic, tenable, cisco, qualys)
   * @returns {string} CSV content
   */
  generateCSV(recordCount, format = 'generic') {
    const rows = [];
    
    // Add header based on format
    const headers = this.getHeaders(format);
    rows.push(headers.join(','));
    
    // Track devices and CVEs for realistic distribution
    const devices = new Set();
    const cves = new Set();
    
    // Generate records
    for (let i = 0; i < recordCount; i++) {
      // Reuse some devices and CVEs for realistic duplication
      let device = this.generateDevice();
      if (devices.size > 0 && this.random() < 0.3) {
        // 30% chance to reuse existing device
        device = this.randomPick(Array.from(devices));
      }
      devices.add(device);
      
      let cve = this.generateCVE();
      if (cves.size > 0 && this.random() < 0.15) {
        // 15% chance to reuse existing CVE (multiple devices affected)
        cve = this.randomPick(Array.from(cves));
      }
      cves.add(cve);
      
      const severity = this.weightedPick(this.severities, this.severityWeights);
      const row = this.generateRow(format, {
        index: i + 1,
        device,
        cve,
        severity,
        ip: this.generateIP(),
        vpr: this.generateVPR(severity),
        cvss: this.generateCVSS(severity),
        description: this.randomPick(this.vulnTypes),
        pluginId: Math.floor(this.random() * 200000) + 10000,
        port: this.randomPick(['443', '80', '22', '3389', '445', '3306', '1433', '8080', '8443'])
      });
      
      rows.push(row);
    }
    
    return rows.join('\n');
  }

  /**
   * Get headers for specific vendor format
   * @param {string} format - Vendor format
   * @returns {Array<string>} Header columns
   */
  getHeaders(format) {
    switch (format) {
      case 'tenable':
        return ['Plugin ID', 'CVE', 'CVSS V3 Base Score', 'VPR', 'Risk', 'Host', 'Protocol', 'Port', 'Name', 'Synopsis'];
      case 'cisco':
        return ['Device', 'IP Address', 'Vulnerability ID', 'Severity', 'Score', 'Title', 'Category', 'Impact', 'Solution'];
      case 'qualys':
        return ['IP', 'DNS', 'NetBIOS', 'OS', 'QID', 'Title', 'Severity', 'Port', 'Protocol', 'CVE ID', 'Vendor Reference'];
      default: // generic
        return ['CVE', 'Device', 'Severity', 'VPR', 'Description', 'IP_Address', 'Port', 'First_Seen', 'Last_Seen'];
    }
  }

  /**
   * Generate a data row for specific vendor format
   * @param {string} format - Vendor format
   * @param {Object} data - Row data
   * @returns {string} CSV row
   */
  generateRow(format, data) {
    const firstSeen = this.generateDate(-30);
    const lastSeen = this.generateDate(-1);
    
    switch (format) {
      case 'tenable':
        return [
          data.pluginId,
          data.cve,
          data.cvss,
          data.vpr,
          data.severity,
          data.device,
          'TCP',
          data.port,
          data.description,
          `${data.description} vulnerability detected`
        ].map(v => this.escapeCSV(v)).join(',');
        
      case 'cisco':
        return [
          data.device,
          data.ip,
          data.cve,
          data.severity,
          data.cvss,
          data.description,
          'Security',
          'High',
          'Apply security patch'
        ].map(v => this.escapeCSV(v)).join(',');
        
      case 'qualys':
        return [
          data.ip,
          data.device,
          '',
          'Linux/Windows',
          data.pluginId,
          data.description,
          data.severity,
          data.port,
          'TCP',
          data.cve,
          'MS-' + String(Math.floor(this.random() * 9999)).padStart(4, '0')
        ].map(v => this.escapeCSV(v)).join(',');
        
      default: // generic
        return [
          data.cve,
          data.device,
          data.severity,
          data.vpr,
          data.description,
          data.ip,
          data.port,
          firstSeen,
          lastSeen
        ].map(v => this.escapeCSV(v)).join(',');
    }
  }

  /**
   * Escape CSV values that contain commas or quotes
   * @param {*} value - Value to escape
   * @returns {string} Escaped value
   */
  escapeCSV(value) {
    if (value === null || value === undefined) return '';
    const str = String(value);
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  }

  /**
   * Generate a date string within the last N days
   * @param {number} daysAgo - Maximum days ago
   * @returns {string} Date string
   */
  generateDate(daysAgo) {
    const date = new Date();
    date.setDate(date.getDate() - Math.floor(this.random() * Math.abs(daysAgo)));
    return date.toISOString().split('T')[0];
  }

  /**
   * Save CSV to file
   * @param {string} filePath - Path to save file
   * @param {number} recordCount - Number of records
   * @param {string} format - Vendor format
   * @returns {Promise<void>}
   */
  async saveToFile(filePath, recordCount, format = 'generic') {
    const csv = this.generateCSV(recordCount, format);
    await fs.writeFile(filePath, csv, 'utf8');
  }

  /**
   * Generate standard test fixtures
   * @param {string} outputDir - Output directory
   * @returns {Promise<Object>} Generated file paths
   */
  async generateStandardFixtures(outputDir = path.join(__dirname, '../fixtures/csv')) {
    await fs.mkdir(outputDir, { recursive: true });
    
    const sizes = {
      small: 100,
      medium: 5000,
      large: 25000,
      xlarge: 100000
    };
    
    const files = {};
    
    for (const [size, count] of Object.entries(sizes)) {
      const filePath = path.join(outputDir, `test-${size}.csv`);
      await this.saveToFile(filePath, count, 'generic');
      files[size] = filePath;
      console.log(`Generated ${size} dataset: ${count} records at ${filePath}`);
    }
    
    return files;
  }
}

module.exports = DataGenerator;