/**
 * Tenable-Specific CSV Generator
 * Generates authentic Tenable Nessus CSV data for testing
 * 
 * Features:
 * - Realistic Tenable Plugin IDs (10000-999999 range)
 * - Authentic Tenable vulnerability naming conventions
 * - Proper VPR scoring aligned with CVSS
 * - Tenable-specific synopsis formatting
 * - Real-world port/protocol distributions
 * 
 * @module tenable-generator
 */

const DataGenerator = require('../data-generator');

// Shared configuration: Authentic Tenable Plugin ID ranges
const PLUGIN_ID_RANGES = {
  'Critical': [100000, 999999],  // High plugin IDs for critical vulns
  'High': [50000, 99999],        // Mid-range for high severity  
  'Medium': [20000, 49999],      // Lower mid-range
  'Low': [10000, 19999]          // Lowest range for info/low
};

class TenableGenerator extends DataGenerator {
  constructor(seed = 12345) {
    super(seed);
    
    // Authentic Tenable Plugin ID ranges
    this.pluginRanges = PLUGIN_ID_RANGES;
    
    // Tenable-specific vulnerability categories with authentic naming
    this.tenableVulnTypes = [
      'Apache HTTP Server Multiple Vulnerabilities',
      'Microsoft Windows SMB Remote Code Execution',
      'OpenSSL Multiple Information Disclosure Vulnerabilities',
      'Adobe Flash Player Multiple Memory Corruption Vulnerabilities',
      'Oracle Java SE Multiple Unspecified Vulnerabilities',
      'Cisco IOS Software Multiple Denial of Service Vulnerabilities',
      'VMware vSphere Client Multiple Vulnerabilities',
      'Red Hat Enterprise Linux Security Update',
      'Ubuntu Security Notification',
      'CentOS Security Advisory',
      'WordPress Plugin Multiple Vulnerabilities',
      'PHP Multiple Vulnerabilities',
      'MySQL Multiple Vulnerabilities',
      'PostgreSQL Multiple Vulnerabilities',
      'nginx HTTP Server Multiple Vulnerabilities',
      'Samba Remote Code Execution Vulnerability',
      'Bind DNS Server Multiple Denial of Service Vulnerabilities',
      'Firefox Multiple Memory Corruption Vulnerabilities',
      'Chrome Multiple Security Vulnerabilities',
      'Internet Explorer Multiple Memory Corruption Vulnerabilities',
      'SSL Certificate Signed Using Weak Hashing Algorithm',
      'SSL Medium Strength Cipher Suites Supported',
      'SSL RC4 Cipher Suites Supported',
      'TLS Version 1.0 Protocol Detection',
      'SSH Weak MAC Algorithms Enabled',
      'DNS Server Cache Poisoning Vulnerability',
      'FTP Supports Unencrypted Cleartext Logins',
      'Telnet Service Supports Unencrypted Logins',
      'SNMP Agent Default Community Name',
      'SMB Signing Disabled',
      'Web Server HTTP Header Internal IP Disclosure',
      'Web Server Default Error Page Information Disclosure',
      'TCP/IP Implementation Vulnerable to Denial of Service',
      'Network Time Protocol Daemon Amplification Vulnerability'
    ];
    
    // Tenable synopsis templates for realism
    this.synopsisTemplates = [
      'The remote {service} server is affected by multiple vulnerabilities.',
      'The version of {service} installed on the remote host is affected by a vulnerability.',
      'The remote {service} installation contains multiple security vulnerabilities.',
      'A vulnerability exists in the remote {service} server.',
      'The remote host is missing security-related patches.',
      'The remote {service} service has a security vulnerability.',
      'Multiple vulnerabilities exist in the installed version of {service}.',
      'The remote {service} server is vulnerable to a security issue.'
    ];
    
    // Common services for synopsis generation
    this.services = [
      'Apache', 'nginx', 'IIS', 'MySQL', 'PostgreSQL', 'Oracle', 'SSH', 
      'FTP', 'SMTP', 'DNS', 'DHCP', 'SNMP', 'Telnet', 'HTTP', 'HTTPS'
    ];
    
    // Realistic port distributions for Tenable scans
    this.tenablePorts = [
      { port: '80', weight: 0.15 },
      { port: '443', weight: 0.20 },
      { port: '22', weight: 0.12 },
      { port: '21', weight: 0.05 },
      { port: '23', weight: 0.03 },
      { port: '25', weight: 0.04 },
      { port: '53', weight: 0.06 },
      { port: '139', weight: 0.04 },
      { port: '445', weight: 0.08 },
      { port: '993', weight: 0.02 },
      { port: '995', weight: 0.02 },
      { port: '3389', weight: 0.06 },
      { port: '1433', weight: 0.03 },
      { port: '3306', weight: 0.04 },
      { port: '5432', weight: 0.03 },
      { port: '8080', weight: 0.03 },
      { port: '8443', weight: 0.04 },
      { port: '0', weight: 0.06 }  // General/multiple ports
    ];
  }

  /**
   * Generate authentic Tenable Plugin ID based on severity
   * @param {string} severity - Vulnerability severity
   * @returns {number} Tenable Plugin ID
   */
  generateTenablePluginId(severity) {
    const [min, max] = this.pluginRanges[severity];
    return Math.floor(min + this.random() * (max - min));
  }

  /**
   * Generate realistic Tenable vulnerability name
   * @param {string} severity - Vulnerability severity
   * @returns {string} Tenable vulnerability name
   */
  generateTenableName(severity) {
    return this.randomPick(this.tenableVulnTypes);
  }

  /**
   * Generate Tenable synopsis with authentic format
   * @param {string} name - Vulnerability name
   * @returns {string} Tenable synopsis
   */
  generateTenableSynopsis(name) {
    const template = this.randomPick(this.synopsisTemplates);
    const service = this.randomPick(this.services);
    
    // Extract service from name if possible, otherwise use random
    const nameWords = name.toLowerCase().split(' ');
    const detectedService = this.services.find(s => 
      nameWords.some(word => word.includes(s.toLowerCase()))
    );
    
    const finalService = detectedService || service;
    return template.replace('{service}', finalService);
  }

  /**
   * Generate weighted random port for Tenable scans
   * @returns {string} Port number
   */
  generateTenablePort() {
    const random = this.random();
    let sum = 0;
    
    for (const { port, weight } of this.tenablePorts) {
      sum += weight;
      if (random < sum) return port;
    }
    
    return '0'; // Fallback
  }

  /**
   * Generate protocol based on port
   * @param {string} port - Port number
   * @returns {string} Protocol
   */
  generateProtocol(port) {
    const tcpPorts = ['80', '443', '22', '21', '23', '25', '139', '445', '993', '995', '3389', '1433', '3306', '5432', '8080', '8443'];
    const udpPorts = ['53', '161', '162', '123', '69'];
    
    if (udpPorts.includes(port)) return 'UDP';
    if (tcpPorts.includes(port)) return 'TCP';
    
    // For port 0 or unknown, pick randomly with TCP preference
    return this.random() < 0.8 ? 'TCP' : 'UDP';
  }

  /**
   * Generate a complete Tenable CSV record
   * @param {Object} options - Generation options
   * @returns {Object} Tenable record data
   */
  generateTenableRecord(options = {}) {
    const severity = options.severity || this.weightedPick(this.severities, this.severityWeights);
    const pluginId = this.generateTenablePluginId(severity);
    const cve = options.cve || this.generateCVE();
    const cvss = this.generateCVSS(severity);
    const vpr = this.generateVPR(severity);
    const host = options.host || this.generateDevice();
    const port = options.port || this.generateTenablePort();
    const protocol = this.generateProtocol(port);
    const name = this.generateTenableName(severity);
    const synopsis = this.generateTenableSynopsis(name);
    
    return {
      'Plugin ID': pluginId,
      'CVE': cve,
      'CVSS V3 Base Score': cvss,
      'VPR': vpr,
      'Risk': severity,
      'Host': host,
      'Protocol': protocol,
      'Port': port,
      'Name': name,
      'Synopsis': synopsis
    };
  }

  /**
   * Generate Tenable CSV with specified number of records
   * @param {number} recordCount - Number of records to generate
   * @param {Object} options - Generation options
   * @returns {string} CSV content
   */
  generateTenableCSV(recordCount, options = {}) {
    const headers = ['Plugin ID', 'CVE', 'CVSS V3 Base Score', 'VPR', 'Risk', 'Host', 'Protocol', 'Port', 'Name', 'Synopsis'];
    const rows = [headers.join(',')];
    
    // Track hosts and CVEs for realistic distribution
    const hosts = new Set();
    const cves = new Set();
    
    for (let i = 0; i < recordCount; i++) {
      // Reuse some hosts and CVEs for realism
      let host = this.generateDevice();
      if (hosts.size > 0 && this.random() < 0.4) {
        // 40% chance to reuse existing host (multiple vulns per host)
        host = this.randomPick(Array.from(hosts));
      }
      hosts.add(host);
      
      let cve = this.generateCVE();
      if (cves.size > 0 && this.random() < 0.2) {
        // 20% chance to reuse existing CVE (same vuln on multiple hosts)
        cve = this.randomPick(Array.from(cves));
      }
      cves.add(cve);
      
      const record = this.generateTenableRecord({
        host,
        cve,
        ...options
      });
      
      // Convert record to CSV row
      const row = headers.map(header => this.escapeCSV(record[header])).join(',');
      rows.push(row);
    }
    
    return rows.join('\n');
  }

  /**
   * Generate standard Tenable test files
   * @param {string} outputDir - Output directory
   * @returns {Promise<Object>} Generated file paths
   */
  async generateTenableFixtures(outputDir) {
    const path = require('path');
    const fs = require('fs').promises;
    
    await fs.mkdir(outputDir, { recursive: true });
    
    const sizes = {
      small: 50,      // Small Tenable scan
      medium: 500,    // Medium network scan
      large: 2000,    // Large enterprise scan
      xlarge: 10000   // Full enterprise assessment
    };
    
    const files = {};
    
    for (const [size, count] of Object.entries(sizes)) {
      const filePath = path.join(outputDir, `tenable-${size}.csv`);
      const csv = this.generateTenableCSV(count);
      await fs.writeFile(filePath, csv, 'utf8');
      files[size] = filePath;
      console.log(`Generated Tenable ${size} dataset: ${count} records at ${filePath}`);
    }
    
    return files;
  }

  /**
   * Create specialized Tenable test scenarios
   * @param {string} outputDir - Output directory
   * @returns {Promise<Object>} Generated scenario files
   */
  async generateTenableScenarios(outputDir) {
    const path = require('path');
    const fs = require('fs').promises;
    
    await fs.mkdir(outputDir, { recursive: true });
    const scenarios = {};
    
    // Scenario 1: Critical vulnerabilities only
    const criticalCsv = this.generateTenableCSV(25, { severity: 'Critical' });
    const criticalPath = path.join(outputDir, 'tenable-critical-only.csv');
    await fs.writeFile(criticalPath, criticalCsv, 'utf8');
    scenarios.critical = criticalPath;
    
    // Scenario 2: Single host with multiple vulnerabilities
    const singleHost = 'srv-prod-01';
    let singleHostRows = ['Plugin ID,CVE,CVSS V3 Base Score,VPR,Risk,Host,Protocol,Port,Name,Synopsis'];
    for (let i = 0; i < 15; i++) {
      const record = this.generateTenableRecord({ host: singleHost });
      const row = ['Plugin ID', 'CVE', 'CVSS V3 Base Score', 'VPR', 'Risk', 'Host', 'Protocol', 'Port', 'Name', 'Synopsis']
        .map(header => this.escapeCSV(record[header])).join(',');
      singleHostRows.push(row);
    }
    const singleHostPath = path.join(outputDir, 'tenable-single-host.csv');
    await fs.writeFile(singleHostPath, singleHostRows.join('\n'), 'utf8');
    scenarios.singleHost = singleHostPath;
    
    // Scenario 3: Same CVE across multiple hosts
    const sameCve = 'CVE-2024-0001';
    let sameCveRows = ['Plugin ID,CVE,CVSS V3 Base Score,VPR,Risk,Host,Protocol,Port,Name,Synopsis'];
    for (let i = 0; i < 10; i++) {
      const record = this.generateTenableRecord({ cve: sameCve, severity: 'High' });
      const row = ['Plugin ID', 'CVE', 'CVSS V3 Base Score', 'VPR', 'Risk', 'Host', 'Protocol', 'Port', 'Name', 'Synopsis']
        .map(header => this.escapeCSV(record[header])).join(',');
      sameCveRows.push(row);
    }
    const sameCvePath = path.join(outputDir, 'tenable-same-cve.csv');
    await fs.writeFile(sameCvePath, sameCveRows.join('\n'), 'utf8');
    scenarios.sameCve = sameCvePath;
    
    return scenarios;
  }
}

module.exports = TenableGenerator;