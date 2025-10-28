# Work Item: Mitigation Tracking Feature

**Type**: Feature (Strategic)
**Priority**: High
**Status**: Research Complete → Ready for Planning
**Estimated Effort**: 3-4 weeks (Phases 1-4), 1 week (Phase 5 optional)

---

## Summary

Implement vulnerability mitigation tracking system to expand ticketing beyond hardware upgrades to include configuration-based fixes, compensating controls, and accepted risk management.

**Team Need**: Track mitigations that don't require hardware replacement (e.g., disable TLS 1.0, apply patches, accept business risk).

---

## Research Complete ✅

**Full Research Documents**: `/docs/srpi/MITIGATION_TRACKING/`
- `00_OVERVIEW.md` - Feature summary and SRPI roadmap
- `02_RESEARCH.md` - 10,000+ word comprehensive architecture analysis
- `03_CVSS_DATA_ANALYSIS.md` - CVSS data availability verification

**Key Findings**:

1. **✅ Strong Architectural Foundations Exist**:
   - Lifecycle management pattern (`lifecycle_state` enum)
   - Ticket-vulnerability junction table (`ticket_vulnerabilities`)
   - Staging + batch processing for bulk operations
   - Soft delete + audit trail patterns

2. **✅ CVSS Data Already Available** (Hidden Treasure!):
   - Imported from Tenable CSV, stored in all vulnerability tables
   - Currently underutilized (only on vulnerability cards)
   - NO API enrichment needed - ready for immediate use

3. **⚠️ Gaps Requiring New Infrastructure**:
   - No mitigation status tracking
   - No bulk vulnerability lifecycle operations
   - No whitelist/exclusion system
   - No mitigation verification workflow

---

## Architecture Decision Needed

**Three Options Identified**:

### Option A: Extend `vulnerabilities_current` Table
- **Pros**: Simple, no JOINs, fast queries
- **Cons**: Tight coupling, limited audit trail, can't track multiple attempts
- **Verdict**: ❌ Not recommended

### Option B: New `vulnerability_mitigations` Table ⭐ RECOMMENDED
- **Schema**: `id`, `vulnerability_id`, `ticket_id` (optional), `mitigation_status`, `mitigation_method`, `plan_date`, `execution_date`, `verification_date`, user tracking, notes, attachments JSON
- **Pros**: Flexible, full audit trail, supports multiple mitigation attempts, works for both ticket-based and whitelist mitigations
- **Cons**: Requires JOINs (minimal performance impact)
- **Verdict**: ✅ **Recommended** - matches HexTrackr audit trail patterns, clean separation of concerns

### Option C: Enhance `ticket_vulnerabilities` Junction Table
- **Pros**: Leverages existing relationship
- **Cons**: Too ticket-centric, inflexible for global/whitelist mitigations
- **Verdict**: ❌ Not recommended

---

## Proposed Workflow

**Mitigation Lifecycle States**:
```
Not Mitigated → Planned → In Progress → Completed → Verified
     ↓                                      ↓
Accepted Risk                          Reopened (if failed)
```

**Mitigation Methods**:
- `patched` - Software/firmware update applied
- `configuration_change` - Security setting modified
- `compensating_control` - Workaround implemented (firewall rule, access restriction)
- `accepted_risk` - Business decision to delay/skip mitigation
- `vendor_fix_pending` - Waiting for vendor patch

**Patterns Supported**:
- **Bulk mitigation**: Mark all devices with CVE-XXXX as mitigated (single ticket, global notes)
- **Individual mitigation**: Mark specific hostname (device-specific notes)

---

## Implementation Roadmap

### Phase 1: Data Model & Backend (Week 1) - REQUIRED
**Tasks**:
- [ ] Create database migration: `vulnerability_mitigations` table
- [ ] Implement `MitigationService` with CRUD operations
- [ ] Add mitigation filtering to `GET /api/vulnerabilities`
- [ ] Create bulk mitigation endpoints (mark CVE as mitigated)
- [ ] Add mitigation reporting endpoints (MTTM, effectiveness)

**Deliverables**: Database schema ready, API endpoints functional, unit tests passing

---

### Phase 2: Ticket Integration (Week 2) - REQUIRED
**Tasks**:
- [ ] Add "Mitigation" job type to tickets enum
- [ ] Implement bulk ticket creation from vulnerability selection
- [ ] Add ticket-mitigation status synchronization (webhook/listener)
- [ ] Create verification workflow (ticket completion triggers verification prompt)

**Deliverables**: Ticket creation from vulnerability grid working, status sync functional, verification workflow complete

---

### Phase 3: UI & Filtering (Week 3) - REQUIRED
**Tasks**:
- [ ] Add mitigation status filters to vulnerability grid (show/hide mitigated)
- [ ] Create bulk mitigation action modal (mark as mitigated, accept risk)
- [ ] Update device/location modals to show mitigation status badges
- [ ] Add "Create Mitigation Ticket" buttons to modals

**Deliverables**: Filtering UI complete, bulk actions working, modal enhancements deployed

---

### Phase 4: Reporting & Analytics (Week 4) - REQUIRED
**Tasks**:
- [ ] Implement mitigation trends chart (daily totals expansion)
- [ ] Add MTTM (Mean Time to Mitigate) calculations to dashboard
- [ ] Create mitigation effectiveness reports (re-opened vulnerabilities)
- [ ] Enhance exports to include mitigation data (CSV/JSON)

**Deliverables**: Reporting dashboard complete, exports include mitigation status, analytics functional

---

### Phase 5: Configuration Whitelist (Week 5) - OPTIONAL
**Tasks**:
- [ ] Add "Mitigation Rules" section to Settings modal (admin-only)
- [ ] Implement global mitigation rule engine (CVE + method + notes)
- [ ] Add whitelist filtering to vulnerability queries
- [ ] Create mitigation rule management UI (add/edit/delete rules)

**Deliverables**: Whitelist system functional, settings UI complete, rule engine tested

**Note**: This phase supports "global mitigations" without individual tickets (e.g., false positives, business decisions). Can be deferred to later release if needed.

---

## Open Questions for Planning Phase

**Architecture**:
1. ✅ Confirm Option B (new `vulnerability_mitigations` table) as recommended approach?
2. New "Mitigation" job type vs extend existing ticket types?
3. Implement Phase 5 (whitelist) now or defer to later release?

**Workflow**:
4. Should mitigations require manual verification or auto-verify on ticket completion?
5. Should bulk mitigation actions allow individual device notes or only single global note?
6. Should "accepted risk" mitigations have expiration dates (annual re-review)?

**UI/UX**:
7. Should mitigated vulnerabilities be hidden by default or visible?
8. Add visual mitigation badge to vulnerability cards?
9. Show full mitigation timeline in vulnerability details modal?

**Reporting**:
10. MTTM calculation from `first_seen` or from mitigation planning date?
11. Add mitigation metrics to main dashboard or create separate mitigation page?
12. Include mitigation data in existing vulnerability exports or create separate mitigation report?

---

## Dependencies

**Blocks**:
- UI refinement work item (Change 6: Add CVSS column to Location Details table) - mitigation feature will use CVSS for risk assessment

**Blocked By**:
- None - research complete, ready for planning phase

**Related**:
- CVSS Data Enhancement work item (mitigation feature will leverage CVSS scoring)

---

## Success Criteria

**Technical**:
- [ ] Database schema supports both ticket-based and whitelist-based mitigations
- [ ] API endpoints handle bulk operations efficiently (1000+ vulnerabilities)
- [ ] Filtering system performs well (no UI lag when toggling show/hide mitigated)
- [ ] Reporting calculations accurate (MTTM, effectiveness metrics)

**User Experience**:
- [ ] Mitigation workflow intuitive (3 clicks or less to mark as mitigated)
- [ ] Bulk actions save time vs individual device mitigation
- [ ] Reporting provides actionable insights (not just raw data)
- [ ] Documentation clear enough for team to use without training

**Business Value**:
- [ ] Reduced time tracking mitigations manually (eliminate spreadsheets)
- [ ] Improved audit trail (who mitigated what, when, how)
- [ ] Better risk visibility (separate active threats from mitigated items)
- [ ] Measurable improvement (MTTM trending downward over time)

---

## Files to Create/Modify

**New Files**:
- `/app/services/mitigationService.js` - Mitigation CRUD and bulk operations
- `/app/controllers/mitigationController.js` - API endpoints
- `/app/routes/mitigation.js` - Route definitions
- `/app/migrations/013-create-vulnerability-mitigations.sql` - Database migration
- `/app/public/scripts/shared/mitigation-modal.js` - Bulk action modal
- `/app/public/scripts/shared/mitigation-manager.js` - Client-side mitigation logic

**Modified Files**:
- `/app/services/vulnerabilityService.js` - Add mitigation filtering
- `/app/services/ticketService.js` - Add "Mitigation" job type, status sync
- `/app/public/scripts/pages/vulnerabilities.js` - Add mitigation filters to grid
- `/app/public/scripts/shared/device-security-modal.js` - Add mitigation status badges
- `/app/public/scripts/shared/location-details-modal.js` - Add mitigation indicators
- `/app/public/scripts/shared/vulnerability-cards.js` - Add mitigation badges

---

## Next Steps

1. **Planning Phase** (2-3 days):
   - Create Architecture Decision Document (ADD)
   - Answer 18 open questions (above + 8 more in research doc)
   - Design database schema (finalize Option B details)
   - Create UI mockups/wireframes for mitigation modals
   - Break Phases 1-4 into 2-4 day implementation sessions

2. **Team Review**:
   - Review architecture decision (Option A/B/C)
   - Validate workflow design (lifecycle states)
   - Confirm reporting requirements (which metrics matter most?)
   - Discuss Phase 5 priority (whitelist now or later?)

3. **Implementation** (Weeks 3-7):
   - Execute Phases 1-4 (required work)
   - Optional: Execute Phase 5 (whitelist support)
   - Testing and validation after each phase
   - Documentation updates

---

## References

- **Research Documents**: `/docs/srpi/MITIGATION_TRACKING/`
- **SRPI Process Guide**: `/docs/SRPI_PROCESS.md`
- **Database Schema**: `/docs/SCHEMA_EVOLUTION.md`
- **Ticket System Docs**: `/docs/architecture/backend.md` (TicketService section)
- **KEV Integration** (similar pattern): `/app/services/kevService.js`

---

**Created**: October 28, 2025
**Last Updated**: October 28, 2025
**Status**: Ready for Planning Phase (awaiting Linear workspace resolution)
