# Tenable API Integration Research for HexTrackr Vulnerability Details Modal Enhancement

## Executive Summary

This research document outlines comprehensive Tenable API integration capabilities to enhance HexTrackr's Vulnerability Details modal with rich contextual information. Building upon the existing Cisco integration research, this analysis covers Tenable.io, Tenable.sc (SecurityCenter), and Nessus Professional APIs to provide vulnerability enrichment, plugin intelligence, asset criticality ratings, and threat intelligence overlays.

## Current HexTrackr Architecture Analysis

### Existing Vulnerability Data Structure

Based on the current `vulnerabilities_current` table schema:

```sql
CREATE TABLE vulnerabilities_current (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  import_id INTEGER NOT NULL,
  scan_date TEXT NOT NULL,
  hostname TEXT,
  ip_address TEXT,
  cve TEXT,
  severity TEXT,
  vpr_score REAL,
  cvss_score REAL,
  first_seen TEXT,
  last_seen TEXT,
  plugin_id TEXT,          -- Key identifier for Tenable integration
  plugin_name TEXT,
  description TEXT,
  solution TEXT,
  vendor_reference TEXT,
  vendor TEXT,             -- Already captures "Tenable" source
  vulnerability_date TEXT,
  state TEXT DEFAULT 'open',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  unique_key TEXT UNIQUE
);
```

### Current Modal Implementation

The `DeviceSecurityModal` class currently displays:

- Basic vulnerability information (CVE, VPR, severity)
- Device-level aggregations (total counts by severity)
- Grid view with first_seen dates
- Limited contextual information

### Integration Opportunity

HexTrackr already processes Tenable scan data via CSV imports with `plugin_id` fields, providing a natural integration point for API enrichment.

## 1. Tenable Platform API Analysis

### 1.1 Tenable.io APIs

## Primary Capabilities

- **Vulnerability Export API**: Bulk vulnerability data with complete plugin metadata
- **Plugin API**: Detailed plugin information, families, and classifications
- **Asset API**: Asset criticality ratings, business context, and exposure scores
- **Workbench API**: Real-time vulnerability states and analytics

## Key Endpoints for Integration

```
GET /workbenches/vulnerabilities/{plugin_id}
GET /plugins/plugin/{plugin_id}
GET /assets/{asset_id}
GET /vulns/export (for bulk operations)
```

## Rate Limits

- Standard License: 5,000 requests per day
- Professional License: Higher limits available
- Bulk export operations recommended for large datasets

### 1.2 Tenable.sc (SecurityCenter) APIs

## Enterprise Capabilities

- **Repository-based Data**: Custom vulnerability classifications
- **Business Context**: Asset criticality based on organizational policies
- **Compliance Mapping**: PCI, SOX, NIST framework associations
- **Custom Severity Classifications**: Organization-specific risk ratings

## Key Endpoints

```
GET /rest/plugin/{id}
GET /rest/pluginFamily
GET /rest/asset
GET /rest/analysis (for compliance queries)
```

### 1.3 Nessus Professional APIs

## Direct Scanner Integration

- **Plugin Metadata**: Direct access to Nessus plugin database
- **Scan Configuration**: Policy and scan template information
- **Real-time Status**: Current scan results and findings

## Key Endpoints: (2)

```
GET /plugins/families
GET /plugins/families/{family_id}/plugins
GET /plugins/plugin/{plugin_id}
```

## 2. Enhanced Vulnerability Context Data

### 2.1 Plugin Intelligence

## Plugin Family Classifications

```javascript
const pluginFamilies = {
  "Web Servers": "Critical infrastructure services",
  "Windows": "Microsoft Windows vulnerabilities", 
  "Cisco": "Cisco network device vulnerabilities",
  "General": "Cross-platform vulnerabilities",
  "Service detection": "Network service identification",
  "Denial of Service": "DoS attack vectors"
};
```

## Plugin Metadata Available

- Plugin publication and modification dates
- Exploit availability and frameworks
- CVSS vector strings and breakdowns
- Risk factors and ease of exploitation
- Required ports and protocols
- Dependencies and prerequisites

### 2.2 Risk Context Enhancement

## Vulnerability Priority Rating (VPR) Context

```javascript
const vprContextFactors = {
  "vulnerability_age": "Days since disclosure",
  "cvss_impact_score": "Technical impact rating", 
  "exploit_code_maturity": "Exploit availability status",
  "predicted_impact": "Business impact prediction",
  "product_coverage": "Affected system coverage",
  "threat_intensity": "Current threat landscape activity",
  "threat_recency": "Recent exploit activity"
};
```

## Asset Criticality Rating (ACR)

- Business criticality score (1-10)
- Asset type and purpose classification
- Network location and connectivity
- Third-party criticality indicators

### 2.3 Threat Intelligence Overlays

## Exploit Intelligence

- Exploit framework availability (Metasploit, ExploitDB)
- Exploit maturity levels
- Active threat campaign associations
- Malware family connections

## Compliance Framework Mappings

- PCI DSS requirements
- SOX compliance implications  
- NIST framework controls
- Industry-specific standards

## 3. Mock Data Structures

### 3.1 Enhanced Plugin Information

```javascript
const enhancedPluginData = {
  "plugin_id": "19506",
  "plugin_name": "Cisco IOS Software Multiple Vulnerabilities (cisco-sa-20180328-smi2)", 
  "basic_info": {
    "family": "Cisco",
    "type": "remote",
    "category": "security_hole",
    "severity": "High",
    "risk_factor": "High"
  },
  "plugin_intelligence": {
    "publication_date": "2018-03-28",
    "modification_date": "2024-01-15",
    "plugin_version": "1.7",
    "copyright": "Tenable Network Security",
    "dependencies": ["cisco_ios_xe_version.nasl"],
    "required_ports": ["443", "22", "23"],
    "check_type": "remote_banner"
  },
  "vulnerability_details": {
    "cve_list": ["CVE-2018-0171", "CVE-2018-0172"],
    "cvss_v3": {
      "base_score": 8.1,
      "vector": "CVSS:3.0/AV:N/AC:H/PR:N/UI:N/S:U/C:H/I:H/A:H",
      "impact_score": 5.9,
      "exploitability_score": 2.2
    },
    "vpr_score": 8.4,
    "vpr_context": {
      "vulnerability_age": 2190, // days
      "cvss_impact_score": 5.9,
      "exploit_code_maturity": "functional",
      "predicted_impact": "high",
      "product_coverage": "medium",
      "threat_intensity": "medium",
      "threat_recency": "low"
    }
  },
  "threat_intelligence": {
    "exploit_available": true,
    "exploit_frameworks": [
      {
        "name": "Metasploit",
        "module": "cisco/ios/smart_install_protocol"
      }
    ],
    "malware_associations": [],
    "threat_campaigns": ["Smart Install Client hijacking"]
  },
  "remediation_guidance": {
    "solution": "Apply vendor patches for Smart Install Protocol vulnerabilities",
    "workarounds": [
      "Disable Smart Install if not required",
      "Restrict access to Smart Install Protocol (TCP 4786)",
      "Implement network segmentation"
    ],
    "patch_details": {
      "availability": "available",
      "patch_publication": "2018-03-28",
      "fixed_versions": ["15.2(4)S7", "15.1(4)M12a"]
    }
  }
};
```

### 3.2 Asset Context Enhancement

```javascript
const enhancedAssetContext = {
  "hostname": "cisco-sw-core-01.company.com",
  "ip_address": "10.1.1.10",
  "asset_metadata": {
    "asset_criticality_rating": 8.5, // 1-10 scale
    "business_context": {
      "asset_type": "network_infrastructure",
      "business_purpose": "core_networking",
      "location": "datacenter_primary",
      "owner": "Network Operations",
      "criticality_justification": "Core switch for production network"
    },
    "network_context": {
      "network_segment": "core_infrastructure",
      "vlan": "100",
      "connectivity_risk": "high", // network exposure
      "access_complexity": "medium"
    },
    "compliance_context": {
      "pci_scope": true,
      "sox_critical": true,
      "compliance_frameworks": ["PCI-DSS", "SOX", "NIST"]
    }
  },
  "exposure_scoring": {
    "asset_exposure_score": 750, // 0-1000 scale
    "exposure_factors": [
      "network_accessibility",
      "service_exposure", 
      "vulnerability_density",
      "business_criticality"
    ]
  }
};
```

### 3.3 Compliance Mapping Data

```javascript
const complianceMapping = {
  "plugin_id": "19506",
  "compliance_frameworks": {
    "pci_dss": {
      "requirements": ["6.1", "6.2", "11.2"],
      "descriptions": [
        "6.1 - Establish a process to identify security vulnerabilities",
        "6.2 - Ensure all systems are protected from known vulnerabilities",
        "11.2 - Run internal and external network vulnerability scans"
      ],
      "severity_override": "high", // PCI treats network device vulns as high
      "remediation_timeline": "immediate" // Critical systems require immediate action
    },
    "nist_csf": {
      "functions": ["PR.IP-12", "DE.CM-8"],
      "subcategories": [
        "PR.IP-12: A vulnerability management plan is developed and implemented",
        "DE.CM-8: Vulnerability scans are performed"
      ]
    },
    "sox": {
      "relevant": true,
      "impact_areas": ["IT General Controls", "Network Security"],
      "risk_level": "high"
    }
  }
};
```

## 4. Integration Architecture

### 4.1 Detection and Routing Logic

## Tenable Source Detection

```javascript
function isTeableVulnerability(vulnerability) {
  // Multiple detection methods
  return (
    vulnerability.vendor === 'Tenable' ||
    vulnerability.plugin_id !== null ||
    /^[0-9]+$/.test(vulnerability.plugin_id) // Tenable plugin IDs are numeric
  );
}

function getTenableEnrichmentData(pluginId, hostname) {
  // Route to appropriate Tenable platform
  if (hasTenable_io_Config()) {
    return getTenable_io_PluginData(pluginId);
  } else if (hasTenableSC_Config()) {
    return getTenableSC_PluginData(pluginId);  
  } else if (hasNessus_Config()) {
    return getNessus_PluginData(pluginId);
  }
  return null;
}
```

### 4.2 API Authentication Architecture

## Tenable.io Authentication

```javascript
const tenableIOConfig = {
  baseUrl: 'https://cloud.tenable.com',
  authentication: {
    type: 'api_key',
    access_key: process.env.TENABLE_ACCESS_KEY,
    secret_key: process.env.TENABLE_SECRET_KEY
  },
  rateLimiting: {
    requestsPerDay: 5000,
    burstLimit: 100,
    backoffStrategy: 'exponential'
  }
};
```

## Tenable SecurityCenter Authentication

```javascript
const tenableSCConfig = {
  baseUrl: 'https://securitycenter.company.com',
  authentication: {
    type: 'session_token', // or certificate_based
    username: process.env.TENABLE_SC_USER,
    password: process.env.TENABLE_SC_PASS,
    sessionTimeout: 3600
  }
};
```

### 4.3 Caching and Performance Strategy

## Multi-Level Caching

```javascript
const cacheStrategy = {
  level1: {
    type: 'memory',
    duration: '15m', 
    data: 'frequently_accessed_plugins'
  },
  level2: {
    type: 'sqlite',
    table: 'tenable_plugin_cache',
    duration: '24h',
    data: 'complete_plugin_metadata'
  },
  level3: {
    type: 'file_based',
    duration: '7d',
    data: 'bulk_export_snapshots'
  }
};
```

### 4.4 Error Handling and Fallbacks

## Graceful Degradation

```javascript
async function getEnhancedVulnerabilityData(vulnerability) {
  try {
    // Attempt Tenable API enrichment
    const tenableData = await getTenableEnrichment(vulnerability.plugin_id);
    return mergeVulnerabilityData(vulnerability, tenableData);
  } catch (apiError) {
    console.warn('Tenable API unavailable, using cached data:', apiError);
    
    // Fallback to cached data
    const cachedData = await getCachedPluginData(vulnerability.plugin_id);
    if (cachedData) {
      return mergeVulnerabilityData(vulnerability, cachedData);
    }
    
    // Final fallback to basic data
    return vulnerability;
  }
}
```

## 5. Modal Integration Design

### 5.1 Enhanced UI Sections

## Plugin Intelligence Tab

- Plugin family and type information
- Publication and modification dates
- Risk factor and exploit difficulty
- Required ports and protocols
- Check type and methodology

## Risk Context Tab

- VPR score breakdown with context factors
- Asset criticality rating with justification
- Business impact assessment
- Network exposure analysis

## Threat Intelligence Tab

- Exploit availability and frameworks
- Active threat campaigns
- Malware associations
- Recent activity indicators

## Compliance Tab

- Framework mappings (PCI, SOX, NIST)
- Requirement descriptions
- Remediation timelines
- Severity overrides

## Remediation Tab

- Detailed solution guidance
- Workaround procedures
- Patch information and availability
- Implementation recommendations

### 5.2 Progressive Enhancement Strategy

## Phase 1: Basic Plugin Enhancement

- Plugin metadata display
- Family and type information
- Publication dates

## Phase 2: Risk Context Integration

- VPR context factors
- Asset criticality display
- Basic threat intelligence

## Phase 3: Advanced Features

- Compliance framework mapping
- Detailed remediation guidance
- Threat campaign associations

## 6. Complementary Design with Cisco Integration

### 6.1 Unified Enhancement Framework

## Source Detection Logic

```javascript
function getVulnerabilityEnrichment(vulnerability) {
  // Cisco-specific enrichment (existing)
  if (isCiscoVulnerability(vulnerability)) {
    return getCiscoPSIRTData(vulnerability.cve);
  }
  
  // Tenable-specific enrichment (new)
  if (isTeableVulnerability(vulnerability)) {
    return getTenablePluginData(vulnerability.plugin_id);
  }
  
  // Generic CVE enrichment (fallback)
  return getGenericCVEData(vulnerability.cve);
}
```

### 6.2 Consistent Modal Interface

## Tab Structure

- **Overview**: Basic vulnerability information (existing)
- **Vendor Intelligence**: Cisco PSIRT OR Tenable Plugin data
- **Risk Assessment**: VPR/SIR scores and context
- **Remediation**: Vendor-specific guidance
- **Compliance**: Framework mappings
- **Timeline**: Discovery and patch information

### 6.3 Data Presentation Consistency

## Unified Risk Scoring Display

```javascript
const riskScoreDisplay = {
  cisco: {
    primary: 'sir_score', // Security Impact Rating
    secondary: 'cvss_score',
    context: 'sir_factors'
  },
  tenable: {
    primary: 'vpr_score', // Vulnerability Priority Rating  
    secondary: 'cvss_score',
    context: 'vpr_context'
  },
  generic: {
    primary: 'cvss_score',
    secondary: null,
    context: 'cvss_vector'
  }
};
```

## 7. Implementation Recommendations

### 7.1 Phased Implementation Approach

## Phase 1: Foundation (2-3 weeks)

- Implement Tenable source detection logic
- Create basic API integration framework
- Add plugin metadata caching system
- Enhance modal with plugin intelligence tab

## Phase 2: Core Features (3-4 weeks)

- Integrate VPR context and risk scoring
- Add asset criticality display
- Implement threat intelligence overlay
- Create unified vendor intelligence interface

## Phase 3: Advanced Features (2-3 weeks)

- Add compliance framework mapping
- Implement detailed remediation guidance
- Create threat campaign associations
- Add bulk enrichment capabilities

### 7.2 Technical Implementation Strategy

## Database Schema Extensions

```sql
-- Plugin intelligence cache
CREATE TABLE tenable_plugin_cache (
  plugin_id TEXT PRIMARY KEY,
  plugin_data TEXT, -- JSON blob
  cached_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  expires_at DATETIME
);

-- Asset context cache  
CREATE TABLE tenable_asset_cache (
  hostname TEXT PRIMARY KEY,
  asset_data TEXT, -- JSON blob
  cached_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  expires_at DATETIME
);
```

## API Integration Pattern

```javascript
// Follow existing HexTrackr patterns
app.get('/api/vulnerability/:id/tenable-enrichment', async (req, res) => {
  try {
    const vulnerability = await getVulnerabilityById(req.params.id);
    const enrichment = await getTenableEnrichment(vulnerability);
    res.json({ success: true, data: enrichment });
  } catch (error) {
    console.error('Tenable enrichment error:', error);
    res.status(500).json({ error: 'Failed to retrieve enhancement data' });
  }
});
```

### 7.3 Configuration Management

## Settings Integration

```javascript
const tenableSettings = {
  platform: 'tenable_io', // or 'tenable_sc', 'nessus'
  authentication: {
    // Platform-specific auth config
  },
  features: {
    plugin_intelligence: true,
    asset_criticality: true,
    threat_intelligence: false, // Premium feature
    compliance_mapping: true
  },
  caching: {
    enabled: true,
    duration: '24h',
    max_size: '100MB'
  }
};
```

### 7.4 Testing Strategy

## Unit Tests

- API integration functions
- Data transformation logic
- Cache management
- Error handling scenarios

## Integration Tests

- Modal enhancement display
- API authentication flows
- Data enrichment pipelines
- Performance under load

## User Acceptance Tests

- Enhanced modal functionality
- Cross-vendor data consistency
- Performance and responsiveness
- Error recovery scenarios

## 8. Success Metrics and Monitoring

### 8.1 Performance Metrics

- **API Response Times**: < 500ms for cached data, < 2s for live API calls
- **Cache Hit Ratio**: > 80% for frequently accessed plugins
- **Modal Load Times**: < 1s for enhanced vulnerability details
- **Error Rates**: < 5% for API integrations

### 8.2 User Experience Metrics

- **Information Richness**: 3x more contextual data per vulnerability
- **Remediation Guidance**: Detailed solutions for 95%+ of Tenable vulnerabilities  
- **Risk Prioritization**: VPR context for all Tenable-sourced findings
- **Compliance Mapping**: Framework associations for critical vulnerabilities

### 8.3 Integration Health Monitoring

- **API Availability**: Monitor Tenable platform uptime
- **Rate Limit Tracking**: Prevent quota exhaustion
- **Data Freshness**: Ensure timely cache invalidation
- **Authentication Status**: Monitor token/session validity

## 9. Security Considerations

### 9.1 Credential Management

- Store API credentials encrypted in SQLite using Node.js crypto
- Never expose credentials in logs or error messages
- Implement credential rotation procedures
- Use least-privilege API permissions

### 9.2 Data Privacy

- Cache only necessary metadata, not sensitive vulnerability details
- Implement data retention policies for cached information
- Ensure compliance with organizational data policies
- Provide cache clearing mechanisms

### 9.3 Network Security

- Use HTTPS for all API communications
- Implement certificate pinning where possible
- Validate SSL/TLS configurations
- Monitor for man-in-the-middle attacks

## 10. Conclusion

The Tenable API integration provides significant opportunity to enhance HexTrackr's vulnerability management capabilities with rich contextual information, threat intelligence, and risk prioritization data. By implementing a phased approach that complements the existing Cisco integration, HexTrackr can provide security analysts with comprehensive vulnerability intelligence from multiple authoritative sources.

The proposed architecture leverages HexTrackr's existing patterns while adding sophisticated caching, error handling, and performance optimization strategies. This integration will transform the Vulnerability Details modal from a basic information display into a comprehensive vulnerability intelligence platform.

## Next Steps

1. Review and approve proposed architecture
2. Begin Phase 1 implementation with basic plugin intelligence
3. Establish Tenable API credentials and testing environment
4. Create integration tests for modal enhancement features

---

*This research document provides the foundation for implementing comprehensive Tenable API integration in HexTrackr. The ui-design-specialist agent can use this information to create detailed implementation plans and modal enhancement designs.*
