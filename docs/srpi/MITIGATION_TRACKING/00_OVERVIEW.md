# Mitigation Tracking Feature - SRPI Overview

**Status**: Research Phase
**Started**: October 28, 2025
**Team Feedback**: Presentation feedback session
**Priority**: High (strategic feature)

---

## Feature Request Summary

The team identified a need to expand HexTrackr's ticketing system to include vulnerability mitigation tracking. Currently, tickets handle hardware upgrades, replacements, and installations, but vulnerabilities that can be fixed with configuration changes (e.g., disabling insecure protocols, applying patches) have no workflow.

### Key Requirements

1. **Flag vulnerabilities as mitigated** with notes
2. **Bulk mitigation operations** (mark all devices with CVE-XXXX as mitigated)
3. **Individual device mitigation** (configuration change on specific hostname)
4. **Integration with ticket system** (mitigation tickets)
5. **Filtering capabilities** (show/hide mitigated vulnerabilities)
6. **Reporting** (monthly mitigation reports, Mean Time to Mitigate)

### Complexity Assessment

This feature touches multiple systems:
- Vulnerability data model (lifecycle tracking)
- Ticket system (new ticket type or extend existing)
- Device/location aggregation (filtering mitigated items)
- Reporting and analytics (mitigation trends)
- UI (bulk actions, status filters, verification workflow)

### SRPI Approach

Given the complexity and cross-system dependencies, we're using the full SRPI cycle:

**Specification** → Define user requirements and workflows
**Research** → Investigate architecture options and integration points
**Plan** → Design database schema and implementation roadmap
**Implement** → Incremental development with testing checkpoints

---

## Related Work

### UI/UX Refinements (Quick Wins)

Parallel to the mitigation feature research, the team provided feedback on existing UI elements:

1. **Priority Dropdowns**: Add vulnerability count and ticket priority sorting
2. **Description Filtering**: Strip redundant vendor prefixes from vulnerability descriptions
3. **Modal Enhancements**: Add location links, reorder table columns, fix KEV device counts
4. **CVSS Display**: Surface existing CVSS data in tables and modals

These refinements are smaller in scope and can be implemented while mitigation architecture is being researched.

---

## Documentation Structure

This SRPI folder contains:

- **00_OVERVIEW.md** (this file) - Feature summary and SRPI roadmap
- **01_SPECIFICATION.md** - User requirements, workflows, and acceptance criteria
- **02_RESEARCH.md** - Architecture investigation, database options, integration points
- **03_CVSS_DATA_ANALYSIS.md** - Deep dive on CVSS data availability and usage
- **04_PLAN.md** - Database schema design, implementation roadmap, issue breakdown
- **05_IMPLEMENTATION_LOG.md** - Session tracking for incremental development

---

## Current Phase: Research

**Research Objectives**:

1. Evaluate database architecture options (extend table vs new table vs junction table)
2. Design mitigation workflow (planned → executed → verified)
3. Determine ticket integration strategy (new ticket type vs existing system)
4. Investigate alternative approaches (configuration whitelist vs ticket-centric)
5. Define reporting requirements (MTTM, effectiveness metrics, monthly reports)
6. Leverage existing CVSS data for risk assessment

**Research Deliverable**: Architecture Decision Document with recommended approach

---

## Key Findings from Initial Research

### Database Architecture

HexTrackr has strong foundations for mitigation tracking:

- **Lifecycle management** pattern (`lifecycle_state` enum: active → grace_period → resolved)
- **Ticket-vulnerability junction** table already exists (`ticket_vulnerabilities`)
- **Staging + batch processing** pattern for bulk operations
- **Soft delete + audit trail** pattern for tracking changes

### CVSS Data Discovery

Research revealed that **CVSS scores are already in the database**:

- Imported from Tenable CSV (`cvss_score` field in all vulnerability tables)
- Currently only displayed on vulnerability cards (with fallback estimation)
- NO API enrichment needed - data ready for immediate use
- Can be surfaced alongside VPR for comprehensive risk assessment

### Three Architecture Options Identified

**Option A**: Extend `vulnerabilities_current` with mitigation fields
**Pros**: Simple, no JOINs, follows lifecycle pattern
**Cons**: Tight coupling to vulnerability records

**Option B**: Create new `vulnerability_mitigations` table
**Pros**: Flexible, audit trail, supports multiple mitigation attempts
**Cons**: Requires JOINs, more complex queries

**Option C**: Enhance `ticket_vulnerabilities` junction table
**Pros**: Leverages existing relationship, ties mitigation to tickets
**Cons**: Requires ticket creation for all mitigations

---

## Next Steps

1. **Complete Research Phase** (3-5 days)
   - Architecture decision document
   - Workflow diagrams
   - UI mockups

2. **Planning Phase** (1-2 days)
   - Database schema design
   - API endpoint specifications
   - UI component breakdown
   - Implementation issue list

3. **Implementation Phase** (Incremental)
   - Session-based development (checkpoint/rewind workflow)
   - Test-driven development
   - Documentation updates

---

## Team Collaboration

**Feedback Welcome**: This is a team-driven feature. Please review research findings and provide input on:
- Workflow preferences (ticket-centric vs configuration whitelist)
- Reporting requirements (what metrics matter most?)
- UI/UX patterns (bulk actions, verification workflow)

**Update Cadence**: Research findings will be shared as they become available for team review and feedback.

---

## References

- **SRPI Process Guide**: `/docs/SRPI_PROCESS.md`
- **Database Schema**: `/docs/SCHEMA_EVOLUTION.md`
- **Ticket System**: `/docs/architecture/backend.md` (Ticket Service section)
- **Existing SRPI Example**: `/docs/srpi/HEX-324/` (Specification, Research, Plan phases)
