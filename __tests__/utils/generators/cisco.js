/**
 * Cisco-Specific CSV Generator
 * Extends DataGenerator for authentic Cisco vulnerability data patterns
 * 
 * Generates realistic Cisco Security Advisory and vulnerability data for testing
 * vulnerability import functionality with proper Cisco naming conventions.
 * 
 * @module cisco-generator
 */

const DataGenerator = require('../data-generator');

class CiscoGenerator extends DataGenerator {
  constructor(seed = 12345) {
    super(seed);
    
    // Cisco-specific device naming patterns
    this.ciscoDeviceTypes = [
      'ASA', 'ISR', 'ASR', 'CSR', 'WS-C', 'WS-X', 'AIR-', 'SG', 'ME-',
      'C9300', 'C9400', 'C9500', 'C9600', 'C3560', 'C3650', 'C3850',
      'C2960', 'C4500', 'C6500', 'C7200', 'C7600', 'N7K', 'N9K', 'N5K',
      'UCS-', 'WAVE-', 'WSA-', 'ESA-', 'FMC-', 'FTD-', 'FXOS'
    ];
    
    // Cisco software versions
    this.iosVersions = [
      '15.1(4)M12', '15.2(4)S7', '15.3(3)M10', '15.4(3)S6',
      '15.5(3)M4', '15.6(2)S3', '15.7(3)M3', '15.8(3)M2',
      '16.3.7', '16.6.4', '16.9.3', '16.12.4', '17.3.2',
      '12.2(55)SE12', '12.4(25e)', '15.0(2)SE11'
    ];
    
    // Cisco-specific vulnerability ID patterns
    this.ciscoVulnPrefixes = [
      'cisco-sa-', 'CSCv', 'CSCu', 'CSCt', 'CSCs', 'CSCw',
      'cisco-bug-id-', 'PSIRT-'
    ];
    
    // Cisco Security Advisory categories
    this.ciscoCategories = [
      'IOS Software', 'IOS XE Software', 'IOS XR Software', 'NX-OS Software',
      'ASA Software', 'FXOS Software', 'Firepower Management Center',
      'Unified Communications', 'Wireless LAN Controller', 'Prime Infrastructure',
      'DNA Center', 'Identity Services Engine', 'Email Security Appliance',
      'Web Security Appliance', 'TelePresence', 'WebEx', 'Jabber'
    ];
    
    // Network device specific vulnerability types
    this.ciscoVulnTypes = [
      'IOS Command Injection Vulnerability',
      'ASA SSL VPN Denial of Service',
      'SNMP Community String Information Disclosure',
      'HTTP Server Authentication Bypass',
      'SSH Key Exchange Denial of Service',
      'OSPF LSA Manipulation Vulnerability',
      'BGP UPDATE Message Handling DoS',
      'DHCP Server Buffer Overflow',
      'TACACS+ Authentication Bypass',
      'RADIUS Shared Secret Brute Force',
      'CDP Protocol Information Disclosure',
      'LLDP Protocol Buffer Overflow',
      'STP Root Bridge Manipulation',
      'VLAN Hopping via Double Tagging',
      'IPsec VPN Information Disclosure',
      'NAT Translation Table DoS',
      'QoS Policy Map Buffer Overflow',
      'Routing Table Poisoning',
      'Firmware Update Authentication Bypass',
      'Web Management Interface XSS',
      'CLI Command History Information Disclosure',
      'Configuration File Access Control Bypass',
      'Memory Corruption in Packet Processing',
      'Session Management Weakness',
      'Certificate Validation Bypass'
    ];
    
    // Cisco impact ratings
    this.ciscoImpacts = [
      'Complete system compromise possible',
      'Denial of service condition',
      'Information disclosure',
      'Authentication bypass possible',
      'Privilege escalation to administrative level',
      'Remote code execution with system privileges',
      'Configuration modification possible',
      'Network traffic interception',
      'Service disruption',
      'Data corruption possible',
      'Routing table manipulation',
      'Security policy bypass',
      'Management interface compromise',
      'Network segmentation bypass',
      'Firmware corruption possible'
    ];
    
    // Cisco-specific solutions
    this.ciscoSolutions = [
      'Upgrade to recommended software version',
      'Apply interim software fix (SMU)',
      'Configure access control lists (ACLs)',
      'Disable affected protocol if not required',
      'Enable authentication for management protocols',
      'Implement network segmentation',
      'Apply security configuration guidelines',
      'Update to latest security advisory patch',
      'Configure rate limiting for affected services',
      'Enable logging and monitoring',
      'Implement compensating security controls',
      'Update device firmware',
      'Reconfigure affected feature settings',
      'Apply Cisco security baseline configuration',
      'Contact Cisco TAC for assistance'
    ];
    
    // Cisco Bug ID patterns
    this.ciscoBugIdPatterns = [
      'CSCv', 'CSCu', 'CSCt', 'CSCs', 'CSCw', 'CSCx'
    ];
    
    // Cisco product families for more realistic device naming
    this.ciscoProductFamilies = {
      'Router': ['ISR4000', 'ASR1000', 'ASR9000', 'CSR1000V', '7200', '7600'],
      'Switch': ['C9300', 'C9400', 'C9500', 'C3650', 'C3850', 'C2960', 'N7K', 'N9K'],
      'Firewall': ['ASA5500', 'ASA5500X', 'FTD', 'FXOS'],
      'Wireless': ['WLC2500', 'WLC5520', 'WLC8540', 'AIR-CT'],
      'Security': ['WSA', 'ESA', 'ISE', 'FMC', 'CX'],
      'UC': ['CUCM', 'CUC', 'UCCX', 'IMP', 'TMS']
    };
  }

  /**
   * Generate Cisco-specific device hostname
   * @returns {string} Cisco device hostname
   */
  generateCiscoDevice() {
    const family = this.randomPick(Object.keys(this.ciscoProductFamilies));
    const model = this.randomPick(this.ciscoProductFamilies[family]);
    const location = this.randomPick(['HQ', 'BR1', 'BR2', 'DC1', 'DC2', 'WAN', 'LAN', 'DMZ']);
    const number = String(Math.floor(this.random() * 99) + 1).padStart(2, '0');
    
    return `${family.toLowerCase()}-${location.toLowerCase()}-${model.toLowerCase()}-${number}`;
  }

  /**
   * Generate Cisco Security Advisory ID
   * @returns {string} Cisco SA ID
   */
  generateCiscoSA() {
    const year = new Date().getFullYear();
    const number = String(Math.floor(this.random() * 9999) + 1).padStart(4, '0');
    const category = this.randomPick(['iosxe', 'asa', 'nxos', 'iosxr', 'fmc', 'wlc']);
    return `cisco-sa-${year}${number}-${category}`;
  }

  /**
   * Generate Cisco Bug ID
   * @returns {string} Cisco Bug ID
   */
  generateCiscoBugId() {
    const prefix = this.randomPick(this.ciscoBugIdPatterns);
    const number = String(Math.floor(this.random() * 999999) + 100000);
    return `${prefix}${number}`;
  }

  /**
   * Generate mixed Cisco vulnerability ID (SA, Bug ID, or CVE)
   * @returns {string} Mixed vulnerability ID
   */
  generateCiscoVulnId() {
    const random = this.random();
    if (random < 0.4) {
      return this.generateCiscoSA();
    } else if (random < 0.7) {
      return this.generateCiscoBugId();
    } else {
      return this.generateCVE();
    }
  }

  /**
   * Generate Cisco-specific vulnerability title
   * @returns {string} Vulnerability title
   */
  generateCiscoVulnTitle() {
    return this.randomPick(this.ciscoVulnTypes);
  }

  /**
   * Generate Cisco-specific impact description
   * @returns {string} Impact description
   */
  generateCiscoImpact() {
    return this.randomPick(this.ciscoImpacts);
  }

  /**
   * Generate Cisco-specific solution
   * @returns {string} Solution description
   */
  generateCiscoSolution() {
    return this.randomPick(this.ciscoSolutions);
  }

  /**
   * Generate Cisco-specific category
   * @returns {string} Product category
   */
  generateCiscoCategory() {
    return this.randomPick(this.ciscoCategories);
  }

  /**
   * Generate CVSS score with Cisco-appropriate distribution
   * @param {string} severity - Severity level
   * @returns {number} CVSS score
   */
  generateCiscoCVSS(severity) {
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
   * Generate Cisco CSV with specified number of records
   * @param {number} recordCount - Number of records to generate
   * @returns {string} CSV content in Cisco format
   */
  generateCiscoCSV(recordCount) {
    const rows = [];
    
    // Cisco CSV header format
    const headers = [
      'Device', 'IP Address', 'Vulnerability ID', 'Severity', 'Score', 
      'Title', 'Category', 'Impact', 'Solution'
    ];
    rows.push(headers.join(','));
    
    // Track devices for realistic distribution
    const devices = new Set();
    const vulnIds = new Set();
    
    for (let i = 0; i < recordCount; i++) {
      // Reuse some devices for realistic multi-vulnerability scenarios
      let device = this.generateCiscoDevice();
      if (devices.size > 0 && this.random() < 0.25) {
        device = this.randomPick(Array.from(devices));
      }
      devices.add(device);
      
      // Reuse some vulnerability IDs for realistic multi-device scenarios
      let vulnId = this.generateCiscoVulnId();
      if (vulnIds.size > 0 && this.random() < 0.10) {
        vulnId = this.randomPick(Array.from(vulnIds));
      }
      vulnIds.add(vulnId);
      
      const severity = this.weightedPick(this.severities, this.severityWeights);
      const score = this.generateCiscoCVSS(severity);
      const title = this.generateCiscoVulnTitle();
      const category = this.generateCiscoCategory();
      const impact = this.generateCiscoImpact();
      const solution = this.generateCiscoSolution();
      const ip = this.generateIP();
      
      const row = [
        device,
        ip,
        vulnId,
        severity,
        score,
        title,
        category,
        impact,
        solution
      ].map(v => this.escapeCSV(v)).join(',');
      
      rows.push(row);
    }
    
    return rows.join('\n');
  }

  /**
   * Save Cisco CSV to file
   * @param {string} filePath - Path to save file
   * @param {number} recordCount - Number of records
   * @returns {Promise<void>}
   */
  async saveCiscoCSVToFile(filePath, recordCount) {
    const csv = this.generateCiscoCSV(recordCount);
    const fs = require('fs').promises;
    await fs.writeFile(filePath, csv, 'utf8');
  }

  /**
   * Generate sample Cisco CSV for testing
   * @param {number} recordCount - Number of records (default: 100)
   * @returns {string} CSV content
   */
  generateSample(recordCount = 100) {
    return this.generateCiscoCSV(recordCount);
  }

  /**
   * Get Cisco CSV headers
   * @returns {Array<string>} Header columns
   */
  getHeaders() {
    return [
      'Device', 'IP Address', 'Vulnerability ID', 'Severity', 'Score', 
      'Title', 'Category', 'Impact', 'Solution'
    ];
  }

  /**
   * Generate comprehensive Cisco test scenarios
   * @param {string} scenario - Scenario type (critical_infrastructure, enterprise_mixed, development_environment)
   * @param {number} recordCount - Number of records
   * @returns {string} CSV content
   */
  generateScenario(scenario, recordCount) {
    // Adjust severity distribution based on scenario
    switch (scenario) {
      case 'critical_infrastructure':
        this.severityWeights = [0.15, 0.25, 0.35, 0.25]; // More critical vulnerabilities
        break;
      case 'development_environment':
        this.severityWeights = [0.02, 0.08, 0.30, 0.60]; // More low/medium severity
        break;
      case 'enterprise_mixed':
      default:
        this.severityWeights = [0.05, 0.15, 0.35, 0.45]; // Standard distribution
        break;
    }
    
    return this.generateCiscoCSV(recordCount);
  }
}

module.exports = CiscoGenerator;