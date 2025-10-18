# HexTrackr Development Tasks

**Last Updated**: 2025-10-18
**Session**: Location Cards Research & Planning (SRPI Workflow)

---

## 🚀 **Active Development: Location Cards Feature**

### **Linear Issue Hierarchy**

**Parent**: [HEX-288](https://linear.app/hextrackr/issue/HEX-288) - Location Cards View for Vulnerability Dashboard

**Child Issues** (SRPI Workflow):
- ✅ [HEX-289](https://linear.app/hextrackr/issue/HEX-289) - [SPEC] Requirements & Design (In Progress)
- ✅ [HEX-290](https://linear.app/hextrackr/issue/HEX-290) - [RESEARCH] Technical Analysis (Research Complete)
- ✅ [HEX-291](https://linear.app/hextrackr/issue/HEX-291) - [PLAN] Implementation Breakdown (Planning Complete)
- ⏳ [HEX-292](https://linear.app/hextrackr/issue/HEX-292) - [IMPLEMENT] Phase 1 MVP (Ready to Start)

---

## 📋 **Next Session: Start Implementation**

### **Objective**
Implement Phase 1 MVP of Location Cards view - a third card view on `vulnerabilities.html` showing location-based security metrics aggregated from hostname parsing.

### **Quick Context**

**What**: Add "Locations" view between "Vulnerabilities" and "Table" view toggles

**Why**: Enable site-level security visibility and geographic risk prioritization

**How**:
- Parse hostnames using existing `hostnameParserService.js` (supports multi-vendor: CISCO, Palo Alto, Other)
- Aggregate vulnerabilities by location with server-side caching (5-min TTL)
- Display location cards with VPR mini-cards (following device cards pattern)
- Show vendor distribution with colored device icons (blue=CISCO, orange=Palo Alto, gray=Other)

### **Research Findings** (Completed This Session)

✅ **Infrastructure exists**: `hostnameParserService.js` handles hostname → location extraction
✅ **Pattern matching**: Config-driven via `/config/device-naming-patterns.json` (18+ patterns)
✅ **Multi-vendor support**: Aggregates across CISCO, Palo Alto, Other devices
✅ **UI patterns documented**: Screenshots captured, device cards pattern analyzed
✅ **Data sources mapped**: All required data exists in vulnerabilities/tickets tables
✅ **Architecture defined**: Server-side aggregation, 5-min cache, <500ms response time

### **Key Architectural Decisions**

1. **View Toggle Position**: Add "Locations" between "Vulnerabilities" and "Table"
2. **Config-Driven Patterns**: No code changes needed for new hostname patterns
3. **Multi-Vendor Aggregation**: Location cards aggregate all vendors at location
4. **Primary Vendor Display**: Show most common vendor badge on card
5. **Vendor Icon Visualization**: Device count with colored icons (blue/orange/gray)
6. **Server-Side Performance**: Aggregate on backend, cache for 5 minutes

### **Scope Boundary**

✅ **In Scope**: Location-based aggregation from hostname parsing
❌ **Out of Scope**: 4-digit site codes (separate ticket normalization issue)

---

## 🛠️ **Implementation Tasks (HEX-292)**

### **Backend** (3 days)

1. **Create Location Service** (`app/services/locationService.js`)
   - Import `hostnameParserService`
   - Aggregate vulnerabilities by location
   - Calculate metrics: device count, VPR breakdown, KEV presence, vendor distribution
   - Correlate with tickets for open ticket count
   - Return location stats with vendor breakdown

2. **Create API Endpoint** (`app/routes/locations.js` + controller)
   - `GET /api/locations/stats`
   - Add authentication middleware (`requireAuth`)
   - Implement caching (5-min TTL, follow HEX-101 pattern)
   - Add cache invalidation on CSV import/ticket changes

3. **Register Route** (`app/public/server.js`)
   - Mount `/api/locations` route
   - Initialize location controller

### **Frontend** (4 days)

1. **Add View Toggle** (`app/public/vulnerabilities.html:360-375`)
   ```html
   <input type="radio" class="btn-check" name="view-options" id="view-locations" autocomplete="off">
   <label class="btn btn-outline-primary" for="view-locations" data-view="locations">
       <i class="fas fa-map-marker-alt me-1"></i>Locations
   </label>
   ```

2. **Create View Container** (`app/public/vulnerabilities.html:432+`)
   ```html
   <div id="locationsView" class="view-content d-none">
       <div class="p-3">
           <div id="locationControlsTop" class="d-flex justify-content-between mb-3"></div>
           <div class="row row-cards" id="locationCards"></div>
           <div id="locationPaginationControls" class="mt-4"></div>
       </div>
   </div>
   ```

3. **Create Location Cards Manager** (`app/public/scripts/shared/vulnerability-location-cards.js`)
   - Class: `VulnerabilityLocationCardsManager`
   - Method: `generateLocationCardsHTML(locations)` - render location cards
   - Method: `renderVendorIcons(vendorBreakdown)` - colored device icons
   - Method: `viewLocationDetails(location)` - stub for Phase 2 modal
   - Method: `createTicketForLocation(location)` - navigate to tickets.html
   - Follow device cards pattern from `vulnerability-cards.js:698-746`

4. **Wire Up Core Orchestrator** (`app/public/scripts/shared/vulnerability-core.js`)
   - Register location cards manager
   - Add view switcher logic for "locations" view
   - Implement data loading for locations view
   - Add cache busting on data mutations

### **Location Card Structure** (Reference)

```
┌─────────────────────────────────────────────┐
│ 📍 WTULSA                      [CISCO] 🏢   │ ← Location + Primary vendor
│ 🔵 35  🟠 5  ⚫ 2  (42 devices)            │ ← Vendor icons (blue/orange/gray)
├─────────────────────────────────────────────┤
│ ┌───────┬───────┬───────┬───────┐          │
│ │  12   │  28   │  15   │   8   │          │ ← VPR mini-cards
│ │Critical│ High │Medium │  Low  │          │   (aggregated all vendors)
│ │ 456.2 │ 892.1│ 398.0 │ 101.0 │          │
│ └───────┴───────┴───────┴───────┘          │
├─────────────────────────────────────────────┤
│ 📊 Total VPR: 1,847.3                      │
│ ⚠️  KEV: 3 vulnerabilities                 │
│ 🎟️  Open Tickets: 2                        │
├─────────────────────────────────────────────┤
│ [View Details]  [Create Ticket]            │
└─────────────────────────────────────────────┘
```

**Vendor Icon Colors**:
- 🔵 Blue = CISCO devices
- 🟠 Orange = Palo Alto devices
- ⚫ Gray = Other devices (wireless bridges, etc.)

### **Testing** (2 days)
- Backend unit tests (location aggregation logic)
- API endpoint tests (caching, authentication)
- Frontend rendering tests
- Responsive design testing (desktop/tablet/mobile)
- Performance testing (<500ms response time)

### **Documentation** (1 day)
- Update `/docs/backend-api.md` (new endpoint)
- Add location cards user guide
- Update changelog with version bump

---

## 📚 **Reference Documentation**

### **Code Patterns to Follow**
- **Device Cards**: `app/public/scripts/shared/vulnerability-cards.js:698-746`
- **Caching Pattern**: HEX-101 (server-side aggregation, 5-min TTL)
- **Hostname Parsing**: `app/services/hostnameParserService.js`
- **Tabler.io Responsive Grid**: `col-lg-3 col-md-6` (4→2→1 columns)

### **Configuration Files**
- **Hostname Patterns**: `/config/device-naming-patterns.json` (18+ patterns)
- **Import Config**: `/config/import.config.json` (vendor keywords)

### **UI Screenshots** (Captured This Session)
- **Location**: `/tmp/location-cards-ui-research/`
- Device cards full view
- VPR mini-cards close-up
- Statistics cards layout
- Integration cards compact pattern

### **Related Issues**
- HEX-241: Device naming pattern detection (precedent)
- HEX-203: Ticket state awareness pattern (replication)
- HEX-243: Tabler.io card optimization (UI patterns)
- HEX-101: Server-side aggregation pattern (caching)

---

## 🎯 **Success Criteria**

**Phase 1 MVP** (HEX-292):
- [ ] View toggle includes "Locations" button (between Vulnerabilities and Table)
- [ ] Location cards display with accurate metrics (multi-vendor aggregation)
- [ ] Vendor distribution shown with colored device icons
- [ ] Primary vendor badge displays most common vendor
- [ ] VPR mini-cards show correct severity breakdown
- [ ] Responsive grid works on all breakpoints
- [ ] Pagination works (6/12/24/48 items per page)
- [ ] Sorting works (VPR desc, device count desc, location name asc)
- [ ] Search/filter respects location names
- [ ] API response time <500ms
- [ ] No console errors or warnings
- [ ] New hostname patterns can be added via config without code deployment

**Phase 2 Details Modal** (Future):
- [ ] Location details modal with vendor breakdown chart
- [ ] All devices at location (AG-Grid table)
- [ ] All CVEs affecting location
- [ ] Associated tickets with status
- [ ] Export functionality (PDF/CSV)

---

## 💾 **Session Artifacts**

**Memento Knowledge Graph**: Session saved as `HEXTRACKR-LOCATION-CARDS-RESEARCH-20251018-052900`

**Linear Issues**: HEX-288 (parent), HEX-289 (spec), HEX-290 (research), HEX-291 (plan), HEX-292 (implement)

**Screenshots**: `/tmp/location-cards-ui-research/` (7 UI reference screenshots)

---

## 🚦 **Getting Started Next Session**

### **Quick Start Prompt**

```
"I'm ready to start implementing the Location Cards feature (HEX-292).

The research and planning are complete (HEX-288 parent issue). I need to:
1. Create backend locationService.js with multi-vendor aggregation
2. Add GET /api/locations/stats endpoint with caching
3. Add 'Locations' view toggle between Vulnerabilities and Table
4. Create location cards UI with vendor distribution icons
5. Follow device cards pattern from vulnerability-cards.js

Key requirements:
- Multi-vendor support (CISCO, Palo Alto, Other)
- Vendor icons with colors (blue/orange/gray)
- Config-driven hostname parsing (device-naming-patterns.json)
- Server-side aggregation with 5-min cache
- VPR mini-cards aggregated across all vendors

Review TASKS.md for complete context. Let's start with the backend service."
```

### **Files to Read First**
1. `TASKS.md` (this file - complete context)
2. `app/services/hostnameParserService.js` (existing hostname parser)
3. `app/public/scripts/shared/vulnerability-cards.js:698-746` (device cards pattern)
4. `/config/device-naming-patterns.json` (hostname patterns config)

### **Development Environment**
- **URL**: https://dev.hextrackr.com
- **Auth**: Username: admin, Password: Magellan123!
- **Docker**: Use `docker-restart` agent if needed (HexTrackr-specific command)

---

## 📊 **Estimate**

**Total Effort**: 8 points (10 days)
- Backend: 3 days
- Frontend: 4 days
- Testing: 2 days
- Documentation: 1 day

**Target Completion**: 2-3 weeks (depends on availability)

---

**Last Session**: 2025-10-18 - Research & Planning Complete
**Next Session**: Implementation Phase 1 MVP (HEX-292)
**Status**: ✅ Ready to implement
