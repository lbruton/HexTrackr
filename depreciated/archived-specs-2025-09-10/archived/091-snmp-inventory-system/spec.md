# Specification: SNMP Polling and Inventory System

**Spec ID**: 020-snmp-inventory-system  
**Status**: Draft  
**Priority**: Medium  
**Category**: Infrastructure Enhancement  
**Estimated Effort**: 1-3 hours per night over 9 nights (3 phases)

## Overview

Network administrators need automated device discovery and inventory management to maintain accurate network documentation and correlate vulnerability data with actual device configurations. This system will use SNMP polling to discover devices, collect basic information, and establish the foundation for network topology mapping.

The system will be implemented in phases to maintain manageable development sprints while progressively building capabilities.

## Success Criteria

- **Automated Device Discovery**: System can discover and catalog network devices without manual intervention
- **Real-Time Inventory**: Device information stays current through scheduled polling
- **Vulnerability Correlation**: Inventory data enhances vulnerability management by providing device context
- **Incremental Implementation**: Each phase delivers working functionality within 1-3 hour development windows
- **Configuration Management**: Administrators can easily configure and manage SNMP polling settings

## Actors/Users

**Primary Actor**: Network Administrator

- Manages network device inventory
- Needs accurate device information for vulnerability remediation
- Configures SNMP settings and polling schedules
- Reviews discovered devices and their capabilities

**Secondary Actor**: Security Analyst

- Correlates vulnerability data with actual device configurations
- Uses inventory data to prioritize security efforts
- Tracks device software versions for patch management

## Phased Implementation Approach

### Phase 1: Basic Device Discovery (Week 1 - 3 nights)

**Goal**: Establish foundation with hostname and basic device information

### Phase 2: Software and Version Discovery (Week 2 - 3 nights)  

**Goal**: Collect software versions and device classification for vulnerability correlation

### Phase 3: Network Topology Discovery (Week 3 - 3 nights)

**Goal**: Discover neighbor relationships for mapping foundation

## User Stories

### Phase 1 Stories: Basic Discovery

#### Story 1: SNMP Configuration Management

**As a** network administrator  
**When** I want to set up automated device discovery  
**I want** to configure SNMP community strings and polling parameters  
**So that** the system can access my network devices securely

**Acceptance Criteria**:

- System provides configuration interface for SNMP settings
- Support for SNMPv2c community strings initially [NEEDS CLARIFICATION: SNMPv3 support required?]
- Configuration includes polling intervals and timeout settings
- Settings are securely stored and not exposed in logs
- Test connectivity feature validates SNMP access before saving

#### Story 2: Basic Device Discovery

**As a** network administrator  
**When** the system performs SNMP polling  
**I want** it to discover devices and collect basic information  
**So that** I have an accurate inventory of my network infrastructure

**Acceptance Criteria**:

- System discovers devices through SNMP polling
- Collects hostname (sysName) and system description (sysDescr)
- Records IP addresses and successful polling timestamps
- Handles polling failures gracefully with retry logic
- Creates initial inventory entries for new devices

#### Story 3: Inventory Viewing and Management

**As a** network administrator  
**When** I access the inventory system  
**I want** to see discovered devices in a clear, organized display  
**So that** I can review and manage my network inventory

**Acceptance Criteria**:

- Dedicated inventory page displays discovered devices
- Shows hostname, IP address, system description, and last poll time
- Indicates polling status (success, failure, never polled)
- Allows manual refresh of individual devices
- Provides search and filtering capabilities

### Phase 2 Stories: Software Discovery

#### Story 4: Software Version Collection

**As a** network administrator  
**When** the system polls devices  
**I want** it to collect software version information  
**So that** I can track firmware versions for security and compliance

**Acceptance Criteria**:

- System collects software version strings from polled devices
- Handles different vendor formats (Cisco IOS, Linux, Windows, etc.)
- Stores version information with timestamps
- Tracks version changes over time
- [NEEDS CLARIFICATION: Which specific OIDs should be polled for version info?]

#### Story 5: Device Classification

**As a** network administrator  
**When** viewing inventory data  
**I want** devices to be automatically classified by type  
**So that** I can understand my network composition at a glance

**Acceptance Criteria**:

- System classifies devices based on sysDescr and other SNMP data
- Identifies common types: router, switch, firewall, server, printer
- Provides device type icons and visual indicators
- Allows manual override of automatic classification
- Groups devices by type in inventory views

#### Story 6: Vulnerability Integration

**As a** security analyst  
**When** reviewing vulnerability data  
**I want** to see corresponding inventory information  
**So that** I can correlate vulnerabilities with actual device configurations

**Acceptance Criteria**:

- Vulnerability views show inventory data when available
- Hostname matching connects vulnerability and inventory records
- Displays software versions alongside vulnerability information
- Highlights version mismatches or outdated software
- [NEEDS CLARIFICATION: How should conflicts between vulnerability and inventory hostnames be handled?]

### Phase 3 Stories: Topology Discovery

#### Story 7: CDP/LLDP Neighbor Discovery

**As a** network administrator  
**When** the system polls Cisco devices  
**I want** it to discover CDP neighbor relationships  
**So that** I can understand my network topology

**Acceptance Criteria**:

- System polls CDP neighbor tables from Cisco devices
- Collects neighbor device names and connection interfaces
- Stores neighbor relationships with discovery timestamps
- Handles partial neighbor data gracefully
- Also supports LLDP for non-Cisco devices when available

#### Story 8: Topology Relationship Storage

**As a** network administrator  
**When** neighbor relationships are discovered  
**I want** them stored for topology mapping  
**So that** I can visualize and analyze my network structure

**Acceptance Criteria**:

- System stores source device, target device, and interface information
- Tracks when relationships were discovered and last validated
- Handles bidirectional relationships correctly
- Identifies and resolves conflicting neighbor data
- Provides foundation data for network mapping visualization

## Detailed Requirements

### SNMP Polling Engine

- Configurable polling intervals (default: every 4 hours)
- Graceful handling of unreachable devices
- Retry logic with exponential backoff for failed polls
- Support for SNMPv2c initially, with extensibility for SNMPv3
- Efficient polling to avoid network congestion

### Data Management

- Store all collected information with timestamps
- Track polling history and success rates
- Handle device hostname changes and IP address updates
- Provide data retention policies for historical information
- Export capabilities for integration with external systems

### Security and Credentials

- Secure storage of SNMP community strings
- Support for different credentials per device/subnet
- Audit logging of all polling activities
- Network segmentation awareness for different SNMP communities
- [NEEDS CLARIFICATION: Requirements for credential rotation?]

### Integration Points

- Seamless correlation with existing vulnerability data
- Foundation for network mapping system (021-network-mapping)
- Enhancement of ticket creation with device context
- API endpoints for external system integration

## Assumptions

- Network devices support SNMP polling (SNMPv2c minimum)
- Network administrator has appropriate SNMP community strings
- HexTrackr deployment has network access to target devices
- Devices have consistent hostname configurations
- SNMP polling will not significantly impact network performance

## Open Questions

1. **SNMP Version Support**: Initial implementation priorities? [NEEDS CLARIFICATION]
   - Start with SNMPv2c only, or include SNMPv3?
   - Security requirements for credential management?
   - Support for per-device credential configuration?

2. **Device Discovery Scope**: How should device discovery be bounded? [NEEDS CLARIFICATION]
   - Manual IP range configuration vs. automatic subnet discovery?
   - Integration with existing network documentation?
   - Handling of dynamic IP addresses and DHCP?

3. **Polling Performance**: Optimization strategies? [NEEDS CLARIFICATION]
   - Acceptable polling frequency for different device types?
   - Parallel vs. sequential polling approaches?
   - Network bandwidth impact considerations?

4. **Data Retention**: Historical data management? [NEEDS CLARIFICATION]
   - How long to retain polling history?
   - Compression or archival strategies for old data?
   - Audit requirements for inventory changes?

5. **Error Handling**: Failed polling scenarios? [NEEDS CLARIFICATION]
   - How many retries before marking device as unreachable?
   - Notification requirements for persistent failures?
   - Manual intervention triggers?

6. **Hostname Correlation**: Matching with vulnerability data? [NEEDS CLARIFICATION]
   - How to handle hostname variations (FQDN vs. short names)?
   - Resolution of conflicts between SNMP and vulnerability data?
   - Manual mapping capabilities for edge cases?

## Dependencies

- **Network Infrastructure**: SNMP-enabled devices with appropriate access
- **Existing Systems**: Vulnerability database for correlation
- **Development Environment**: Node.js SNMP library support
- **Database**: Storage expansion for inventory and polling data
- **Security**: Credential management system

## Non-Goals

- This specification does NOT include:
  - Network device configuration management
  - SNMP trap handling or real-time monitoring
  - Performance monitoring or threshold alerting
  - Integration with network management platforms (PRTG, SolarWinds, etc.)
  - Automated device provisioning or configuration deployment
  - SNMPv3 security implementation (Phase 1)

## Success Metrics

- **Discovery Accuracy**: >95% of SNMP-enabled devices successfully discovered
- **Polling Reliability**: >98% successful poll rate for reachable devices  
- **Data Freshness**: Inventory data no older than configured polling interval
- **Performance Impact**: Polling completes within allocated time windows
- **Integration Value**: Increased vulnerability remediation efficiency through device context

---

**Next Steps**: Use `/plan 020` to generate technical implementation details for each phase, including SNMP library selection, database schema, and polling architecture.
