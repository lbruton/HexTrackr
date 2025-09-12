/**
 * Qualys-Specific CSV Generator
 * Extends DataGenerator for authentic Qualys vulnerability scanner data patterns
 * 
 * Generates realistic Qualys VMDR (Vulnerability Management) data for testing
 * vulnerability import functionality with proper QID patterns and OS detection.
 * 
 * @module qualys-generator
 */

const DataGenerator = require('../data-generator');

class QualysGenerator extends DataGenerator {
  constructor(seed = 12345) {
    super(seed);
    
    // Authentic Qualys QID (Quality ID) ranges by vulnerability type
    this.qidRanges = {
      'Critical': [200000, 999999],  // High QIDs for severe vulnerabilities
      'High': [100000, 199999],      // Mid-high range
      'Medium': [50000, 99999],      // Mid range
      'Low': [10000, 49999],         // Lower range for info/config issues
      'Info': [10000, 29999]         // Informational findings
    };
    
    // Qualys numerical severity mapping (1=Info, 2=Low, 3=Medium, 4=High, 5=Critical)
    this.qualysSeverityMapping = {
      'Info': 1,
      'Low': 2, 
      'Medium': 3,
      'High': 4,
      'Critical': 5
    };
    
    // Qualys-specific OS detection patterns
    this.qualysOSPatterns = [
      'Microsoft Windows Server 2019',
      'Microsoft Windows Server 2016', 
      'Microsoft Windows Server 2012 R2',
      'Microsoft Windows 10',
      'Microsoft Windows 11',
      'Red Hat Enterprise Linux 8',
      'Red Hat Enterprise Linux 9',
      'Ubuntu Linux 20.04 LTS',
      'Ubuntu Linux 22.04 LTS',
      'CentOS Linux 7',
      'SUSE Linux Enterprise Server 15',
      'VMware ESXi 7.0',
      'VMware ESXi 6.7',
      'Cisco IOS Software',
      'Cisco NX-OS Software',
      'HP-UX 11.31',
      'Oracle Solaris 11',
      'FreeBSD 13.0',
      'MacOS Monterey',
      'Amazon Linux 2'
    ];
    
    // Qualys-specific vulnerability categories with authentic QID-style titles
    this.qualysVulnTitles = [
      'Microsoft Windows SMB Remote Code Execution Vulnerability (MS17-010)',
      'Apache HTTP Server Multiple Vulnerabilities',
      'OpenSSL Information Disclosure Vulnerability (Heartbleed)',
      'Microsoft Internet Explorer Multiple Memory Corruption Vulnerabilities',
      'Oracle Java SE Multiple Unspecified Vulnerabilities',
      'VMware vCenter Server Multiple Vulnerabilities',
      'Cisco IOS Software Multiple Denial of Service Vulnerabilities',
      'Adobe Flash Player Multiple Memory Corruption Vulnerabilities',
      'MySQL Multiple Vulnerabilities',
      'PHP Multiple Vulnerabilities',
      'WordPress Multiple Vulnerabilities',
      'Apache Tomcat Multiple Vulnerabilities',
      'Microsoft .NET Framework Multiple Vulnerabilities',
      'PostgreSQL Multiple Vulnerabilities',
      'nginx HTTP Server Multiple Vulnerabilities',
      'Red Hat Enterprise Linux Multiple Security Updates',
      'Ubuntu Linux Multiple Security Updates',
      'VMware ESXi Multiple Vulnerabilities',
      'Samba Remote Code Execution Vulnerability',
      'BIND DNS Server Multiple Vulnerabilities',
      'SSH Server Multiple Vulnerabilities',
      'FTP Server Multiple Vulnerabilities',
      'SMTP Server Multiple Vulnerabilities',
      'Telnet Server Security Weakness',
      'SNMP Server Information Disclosure',
      'NFS Server Security Weakness',
      'X11 Server Multiple Vulnerabilities',
      'Kernel Multiple Vulnerabilities',
      'SSL/TLS Certificate Validation Weakness',
      'Web Application Cross-Site Scripting Vulnerability',
      'Web Application SQL Injection Vulnerability',
      'Web Application Directory Traversal Vulnerability',
      'Default Password Detected',
      'Weak Authentication Configuration',
      'Missing Security Updates Detected',
      'End-of-Life Software Detected',
      'Unnecessary Services Running',
      'Information Disclosure via HTTP Headers',
      'Weak SSL/TLS Cipher Suites'
    ];
    
    // Qualys vendor reference patterns (Microsoft, CVE, vendor bulletins)
    this.vendorReferencePrefixes = [
      'MS', 'KB', 'CVE-', 'RHSA-', 'USN-', 'DSA-', 'GLSA-', 'SUSE-',
      'VMSA-', 'CISCO-SA-', 'APPLE-SA-', 'ADOBE-SA-', 'ORACLE-SA-'
    ];
    
    // Network protocols commonly scanned by Qualys
    this.qualysProtocols = [
      'TCP', 'UDP', 'ICMP', 'GRE'
    ];
    
    // Common service ports that Qualys scans
    this.qualysPorts = [
      '21', '22', '23', '25', '53', '80', '110', '135', '139', '143',
      '443', '445', '993', '995', '1433', '1521', '3306', '3389',
      '5432', '5900', '8080', '8443', '9200', '27017', '50070'
    ];
    
    // DNS name patterns for realistic hostnames
    this.dnsPatterns = [
      'server', 'web', 'db', 'mail', 'dns', 'ldap', 'dc', 'fs',
      'backup', 'monitor', 'proxy', 'jump', 'build', 'test'
    ];
    
    this.dnsSuffixes = [
      'internal.com', 'corp.local', 'company.net', 'enterprise.org',
      'production.local', 'dev.local', 'test.local'
    ];
  }

  /**
   * Generate a realistic Qualys QID based on severity
   * @param {string} severity - Vulnerability severity
   * @returns {number} QID number
   */
  generateQID(severity) {
    const range = this.qidRanges[severity] || this.qidRanges['Medium'];
    return Math.floor(this.random() * (range[1] - range[0] + 1)) + range[0];
  }

  /**
   * Generate Qualys numerical severity (1-5)
   * @param {string} severity - Text severity
   * @returns {number} Numerical severity
   */
  generateQualysSeverity(severity) {
    return this.qualysSeverityMapping[severity] || 3;
  }

  /**
   * Generate realistic DNS hostname
   * @returns {string} DNS hostname
   */
  generateDNSName() {
    const prefix = this.randomPick(this.dnsPatterns);
    const suffix = this.randomPick(this.dnsSuffixes);
    const number = Math.floor(this.random() * 99) + 1;
    return `${prefix}${number < 10 ? '0' + number : number}.${suffix}`;
  }

  /**
   * Generate NetBIOS name (typically Windows)
   * @returns {string} NetBIOS name or empty
   */
  generateNetBIOS() {
    // About 40% of hosts have NetBIOS names (Windows systems)
    if (this.random() < 0.4) {
      const prefixes = ['SRV', 'WS', 'DC', 'SQL', 'WEB', 'FILE', 'PRINT'];
      const prefix = this.randomPick(prefixes);
      const number = Math.floor(this.random() * 999) + 1;
      return `${prefix}${String(number).padStart(3, '0')}`;
    }
    return '';
  }

  /**
   * Generate Qualys-style OS detection string
   * @returns {string} OS string
   */
  generateQualysOS() {
    return this.randomPick(this.qualysOSPatterns);
  }

  /**
   * Generate vendor reference ID
   * @returns {string} Vendor reference
   */
  generateVendorReference() {
    const prefix = this.randomPick(this.vendorReferencePrefixes);
    
    if (prefix.startsWith('MS')) {
      // Microsoft pattern: MS##-###
      const year = 10 + Math.floor(this.random() * 15); // MS10-MS24
      const id = String(Math.floor(this.random() * 999) + 1).padStart(3, '0');
      return `MS${year}-${id}`;
    } else if (prefix.startsWith('KB')) {
      // Knowledge Base: KB#######
      const id = Math.floor(this.random() * 9000000) + 1000000;
      return `KB${id}`;
    } else if (prefix.startsWith('CVE-')) {
      // Generate matching CVE
      return this.generateCVE();
    } else {
      // Generic pattern: PREFIX-YYYY-####
      const year = this.randomPick([2020, 2021, 2022, 2023, 2024]);
      const id = String(Math.floor(this.random() * 9999) + 1).padStart(4, '0');
      return `${prefix}${year}-${id}`;
    }
  }

  /**
   * Generate Qualys-specific CSV format
   * @param {number} recordCount - Number of records to generate
   * @returns {string} CSV content in Qualys format
   */
  generateQualysCSV(recordCount) {
    const rows = [];
    
    // Qualys CSV header format
    const headers = [
      'IP', 'DNS', 'NetBIOS', 'OS', 'QID', 'Title', 'Severity',
      'Port', 'Protocol', 'CVE ID', 'Vendor Reference'
    ];
    rows.push(headers.join(','));
    
    // Track IPs and CVEs for realistic distribution
    const ipsUsed = new Set();
    const cvesUsed = new Set();
    
    for (let i = 0; i < recordCount; i++) {
      // Generate or reuse IP (70% new, 30% reuse for multiple vulns per host)
      let ip = this.generateIP();
      if (ipsUsed.size > 0 && this.random() < 0.3) {
        ip = this.randomPick(Array.from(ipsUsed));
      }
      ipsUsed.add(ip);
      
      // Generate or reuse CVE (85% new, 15% reuse for multiple hosts affected)
      let cve = this.generateCVE();
      if (cvesUsed.size > 0 && this.random() < 0.15) {
        cve = this.randomPick(Array.from(cvesUsed));
      }
      cvesUsed.add(cve);
      
      const severity = this.weightedPick(this.severities, this.severityWeights);
      const qid = this.generateQID(severity);
      const dns = this.generateDNSName();
      const netbios = this.generateNetBIOS();
      const os = this.generateQualysOS();
      const title = this.randomPick(this.qualysVulnTitles);
      const numSeverity = this.generateQualysSeverity(severity);
      const port = this.randomPick(this.qualysPorts);
      const protocol = this.randomPick(this.qualysProtocols);
      const vendorRef = this.generateVendorReference();
      
      // Build Qualys CSV row
      const row = [
        ip,                    // IP
        dns,                   // DNS
        netbios,               // NetBIOS  
        os,                    // OS
        qid,                   // QID
        title,                 // Title
        numSeverity,           // Severity (numerical 1-5)
        port,                  // Port
        protocol,              // Protocol
        cve,                   // CVE ID
        vendorRef              // Vendor Reference
      ].map(v => this.escapeCSV(v)).join(',');
      
      rows.push(row);
    }
    
    return rows.join('\n');
  }

  /**
   * Save Qualys CSV to file
   * @param {string} filePath - Output file path
   * @param {number} recordCount - Number of records
   * @returns {Promise<void>}
   */
  async saveQualysCSV(filePath, recordCount) {
    const csv = this.generateQualysCSV(recordCount);
    const fs = require('fs').promises;
    await fs.writeFile(filePath, csv, 'utf8');
    console.log(`Generated Qualys CSV: ${recordCount} records at ${filePath}`);
  }
}

// Export both the class and a convenience function
module.exports = QualysGenerator;

// Convenience function for direct use
module.exports.generateQualysData = function(recordCount = 1000, seed = 12345) {
  const generator = new QualysGenerator(seed);
  return generator.generateQualysCSV(recordCount);
};

// CLI usage support
if (require.main === module) {
  const generator = new QualysGenerator();
  const recordCount = parseInt(process.argv[2]) || 1000;
  const outputFile = process.argv[3] || 'qualys-sample.csv';
  
  generator.saveQualysCSV(outputFile, recordCount)
    .then(() => console.log('Qualys CSV generation complete!'))
    .catch(console.error);
}