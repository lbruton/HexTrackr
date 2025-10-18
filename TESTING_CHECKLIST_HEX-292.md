# Location Cards Testing Checklist (HEX-292 Task 4)

**Version**: v1.0.83
**Feature**: Location Cards View
**Test Date**: 2025-10-18
**Test Environment**: https://dev.hextrackr.com
**Tester**: _____________

---

## 🐛 Critical Bug Fix (Pre-Testing)

**Issue Found**: SQL Error - `no such column: isKev`
**Location**: `app/services/locationService.js:88`
**Root Cause**: Query referenced non-existent column `isKev` in `vulnerabilities_current` table
**Fix Applied**: Added LEFT JOIN with `kev_status` table (pattern from `vulnerabilityService.js:128-150`)

**SQL Fix**:
```sql
-- BEFORE (broken):
SELECT hostname, vendor, severity, vpr_score, cve, isKev
FROM vulnerabilities_current
WHERE hostname IS NOT NULL

-- AFTER (fixed):
SELECT
    v.hostname,
    v.vendor,
    v.severity,
    v.vpr_score,
    v.cve,
    CASE WHEN k.cve_id IS NOT NULL THEN 'Yes' ELSE 'No' END as isKev
FROM vulnerabilities_current v
LEFT JOIN kev_status k ON v.cve = k.cve_id
WHERE v.hostname IS NOT NULL
```

**Verification**: ✅ Docker restarted, error no longer appears in logs

---

## 📋 Test Environment Setup

### Prerequisites
- [ ] Browser: Chrome/Firefox/Safari (test all three)
- [ ] Screen sizes: Desktop (≥992px), Tablet (768-991px), Mobile (<768px)
- [ ] Dark mode enabled in browser/OS
- [ ] Developer tools open (Network tab, Console)
- [ ] Authentication credentials: `admin` / `Magellan123!`

### Login
1. Navigate to https://dev.hextrackr.com
2. Enter credentials
3. Verify successful login
4. Navigate to Vulnerabilities page

---

## ✅ Functional Testing

### 1. View Switcher Integration
- [ ] **Locations button visible** between "Vulnerabilities" and "Table" buttons
- [ ] **Icon displays correctly**: `fa-map-marker-alt` (map pin icon)
- [ ] **Button styling**: Bootstrap `btn-outline-primary` theme
- [ ] **Click activates**: Button becomes active (filled primary color)
- [ ] **View switches**: `locationsView` container becomes visible
- [ ] **Other views hide**: Devices, Vulnerabilities, Table views hidden

**Expected Order**: `[Devices] [Vulnerabilities] [Locations] [Table]`

---

### 2. API Integration & Data Loading

#### Initial Load (Lazy Loading Pattern)
- [ ] **No API call on page load** (lazy loading - only fetches on first view switch)
- [ ] **First click triggers fetch**: `GET /api/locations/stats` appears in Network tab
- [ ] **Loading indicator shows**: "Loading location data..." text visible
- [ ] **Response success**: HTTP 200 status code
- [ ] **Response time**: <500ms (performance target)
- [ ] **Data structure valid**: `{ success: true, data: [...], error: null }`

#### API Response Validation
Open Network tab, inspect `/api/locations/stats` response:

```json
{
  "success": true,
  "data": [
    {
      "location": "wtulsa",
      "location_display": "WTULSA",
      "device_count": 42,
      "primary_vendor": "CISCO",
      "vendor_breakdown": {
        "CISCO": 35,
        "Palo Alto": 5,
        "Other": 2
      },
      "total_vpr": 1847.3,
      "severity_breakdown": {
        "Critical": { "count": 12, "vpr": 456.2 },
        "High": { "count": 28, "vpr": 892.1 },
        "Medium": { "count": 15, "vpr": 398.0 },
        "Low": { "count": 8, "vpr": 101.0 }
      },
      "kev_count": 3,
      "open_tickets": 2,
      "confidence": 0.85
    }
  ],
  "error": null
}
```

**Validation**:
- [ ] `success` is `true`
- [ ] `data` is array of location objects
- [ ] Each location has all required fields
- [ ] `vendor_breakdown` contains CISCO/Palo Alto/Other counts
- [ ] `severity_breakdown` has all 4 levels (Critical/High/Medium/Low)
- [ ] KEV count accurate (matches database)
- [ ] `error` is `null`

#### Caching Behavior
- [ ] **Second view switch**: No new API call (cached for 5 minutes)
- [ ] **Cache headers**: Check `Cache-Control` header (server: 300s, browser: 60s)
- [ ] **Cache invalidation**: Importing CSV triggers re-fetch

---

### 3. Location Card Rendering

#### Card Structure
For each location card, verify:

**Header Section**:
- [ ] **Location name**: Uppercase (e.g., "WTULSA") with map pin icon
- [ ] **Primary vendor badge**: Blue "CISCO" badge (or orange "Palo Alto", gray "Other")
- [ ] **Badge color correct**: Matches vendor (CISCO=blue, Palo=orange, Other=gray)

**Statistics Row**:
- [ ] **Device count**: Displays total devices at location
- [ ] **Total VPR**: Displays sum of all VPR scores
- [ ] **Values accurate**: Match API response data

**VPR Mini-Cards** (4 severity levels):
- [ ] **Critical card**: Red accent, count + VPR sum displayed
- [ ] **High card**: Orange accent, count + VPR sum displayed
- [ ] **Medium card**: Yellow accent, count + VPR sum displayed
- [ ] **Low card**: Green accent, count + VPR sum displayed
- [ ] **Severity colors**: Match vulnerability cards pattern
- [ ] **All 4 levels visible**: Even if count is 0

**Vendor Icons Row**:
- [ ] **CISCO icon**: Blue circle (`fa-circle` text-primary) with device count
- [ ] **Palo Alto icon**: Orange circle (`fa-circle` text-warning) with device count
- [ ] **Other icon**: Gray circle (`fa-circle` text-secondary) with device count
- [ ] **Tooltips work**: Hover shows "CISCO: 35 devices" format
- [ ] **Only shows non-zero**: Vendors with 0 devices hidden

**KEV Badge** (conditional):
- [ ] **Displays when KEV present**: Red shield icon with count
- [ ] **Hidden when no KEV**: Badge not shown if `kev_count === 0`
- [ ] **Count accurate**: Matches `kev_count` from API

**Open Tickets** (conditional):
- [ ] **Displays ticket icon**: `fa-ticket` with count
- [ ] **Count accurate**: Matches `open_tickets` from API
- [ ] **Text color**: Muted gray for secondary info

**Action Button**:
- [ ] **Button text**: "View Vulnerabilities" with filter icon
- [ ] **Full width**: `btn-sm btn-primary w-100` styling
- [ ] **Hover effect**: Bootstrap primary button hover state

---

### 4. Card Interaction

#### Click-to-Filter Navigation
- [ ] **Click card** (anywhere except button): Triggers `filterByLocation()`
- [ ] **Click button**: Also triggers `filterByLocation()` (event.stopPropagation)
- [ ] **View switches to Table**: Automatically switches from Locations to Table view
- [ ] **Filter applied**: AG-Grid filters by location name
- [ ] **SessionStorage updated**: Check `activeFilters` contains location key
- [ ] **Filter persists**: Refresh page, filter still active

**Expected SessionStorage**:
```json
{
  "location": "wtulsa",
  "vendor": null,
  "severity": null
}
```

#### Cursor & Hover States
- [ ] **Card cursor**: Changes to `pointer` on hover (clickable indicator)
- [ ] **Card elevation**: Subtle shadow increase on hover (`translateY(-2px)`)
- [ ] **Button hover**: Primary button hover state (darker blue)
- [ ] **Smooth transitions**: CSS transitions for hover effects

---

### 5. Pagination System

#### Controls
- [ ] **Pagination controls render**: Below cards, centered
- [ ] **Previous arrow**: `fa-chevron-left` icon, disabled on page 1
- [ ] **Next arrow**: `fa-chevron-right` icon, disabled on last page
- [ ] **Page numbers**: Max 5 visible (e.g., 1 2 3 4 5)
- [ ] **Current page active**: Blue background on active page number
- [ ] **Ellipsis for overflow**: Shows "..." if >5 pages total

#### Pagination Info
- [ ] **Info text displays**: "Showing 1-12 of 42 locations" format
- [ ] **Updates on navigation**: Text changes when page changes
- [ ] **Accurate counts**: Start/end/total match actual data

#### Navigation Testing
- [ ] **Click Next**: Advances to page 2, cards update
- [ ] **Click Previous**: Returns to page 1
- [ ] **Click page number**: Jumps to specific page
- [ ] **Disabled states work**: Can't click prev on page 1, next on last page
- [ ] **URL doesn't change**: Pagination is client-side only

**Default Settings**:
- Items per page: **12** (verify in code: `itemsPerPage: 12`)
- First page: **1** (not 0-indexed in UI)

---

### 6. Sorting System

**Note**: Task 3 implemented sorting methods, but UI controls may not be wired yet. Verify code exists and test if controls are present.

#### Sort Options (if controls visible)
- [ ] **VPR (desc)**: Highest total VPR first
- [ ] **Device Count (desc)**: Most devices first
- [ ] **Location Name (asc)**: Alphabetical order

#### Sort State
- [ ] **Default sort**: VPR descending (highest risk locations first)
- [ ] **Sort persists**: Survives pagination navigation
- [ ] **Visual indicator**: Active sort option highlighted (if UI exists)

**Manual Code Verification**:
Check `location-cards.js` for:
- `sortBy` property (default: 'vpr')
- `sortOrder` property (default: 'desc')
- `sortData()` method implementation
- `changeSort(sortBy, sortOrder)` method

---

## 🎨 Dark Mode Testing

### Theme Toggle
- [ ] **Enable dark mode**: Settings > Appearance > Dark theme
- [ ] **View remains functional**: Location cards still work
- [ ] **No visual breaks**: All text visible, no white-on-white

### Card Styling (Dark Mode)
- [ ] **Card background**: Dark background (`bg-dark` or similar)
- [ ] **Card borders**: Visible borders (not black-on-black)
- [ ] **Text contrast**: All text readable (WCAG AA minimum)
- [ ] **Location name**: White or light gray text
- [ ] **Statistics text**: Good contrast for numbers/labels

### VPR Mini-Cards (Dark Mode)
- [ ] **Critical**: Red accent still visible
- [ ] **High**: Orange accent still visible
- [ ] **Medium**: Yellow accent still visible (not too light)
- [ ] **Low**: Green accent still visible
- [ ] **Text readable**: Counts and VPR sums have good contrast

### Vendor Icons (Dark Mode)
- [ ] **CISCO blue**: Still visible (not too dark)
- [ ] **Palo Alto orange**: Still visible
- [ ] **Other gray**: Distinguishable from background

### Badges & Buttons (Dark Mode)
- [ ] **Primary vendor badge**: Blue badge visible
- [ ] **KEV badge**: Red badge stands out
- [ ] **Action button**: Primary button visible with good contrast
- [ ] **Pagination controls**: Arrows and numbers readable

### Hover States (Dark Mode)
- [ ] **Card hover**: Shadow visible in dark mode
- [ ] **Button hover**: Darker primary blue visible
- [ ] **Page number hover**: Hover state visible

---

## 📱 Responsive Design Testing

### Desktop (≥992px)
- [ ] **3 cards per row**: Bootstrap `col-lg-4` creates 3-column grid
- [ ] **Grid spacing**: Even gaps between cards
- [ ] **Card width**: ~33.33% of container
- [ ] **All content fits**: No horizontal scroll
- [ ] **Pagination centered**: Controls centered below grid

**Test Resolutions**:
- 1920x1080 (Full HD)
- 1366x768 (Laptop)
- 1280x720 (HD)

### Tablet (768-991px)
- [ ] **2 cards per row**: Bootstrap `col-md-6` creates 2-column grid
- [ ] **Grid reflows**: Cards stack in pairs
- [ ] **Content readable**: Text size appropriate
- [ ] **Touch targets**: Buttons large enough (min 44x44px)
- [ ] **Pagination readable**: Controls not cramped

**Test Resolutions**:
- 1024x768 (iPad landscape)
- 768x1024 (iPad portrait)
- 820x1180 (iPad Air)

### Mobile (<768px)
- [ ] **1 card per row**: Full-width cards (100%)
- [ ] **Vertical stacking**: All cards stack vertically
- [ ] **Text readable**: Font sizes appropriate for small screens
- [ ] **Touch targets large**: All buttons tappable (min 44x44px)
- [ ] **No horizontal scroll**: Content fits within viewport
- [ ] **Pagination usable**: Controls easy to tap

**Test Resolutions**:
- 375x667 (iPhone SE)
- 414x896 (iPhone 11 Pro Max)
- 360x640 (Android common)

### Orientation Changes
- [ ] **Portrait → Landscape**: Layout adapts correctly
- [ ] **Landscape → Portrait**: No visual breaks
- [ ] **Resize doesn't break view**: Smooth transitions

---

## 🌐 Cross-Browser Testing

### Chrome (Primary)
- [ ] **Rendering correct**: All elements display properly
- [ ] **JavaScript works**: Click handlers functional
- [ ] **CSS correct**: Flexbox, grid, shadows render
- [ ] **Performance good**: <500ms load time
- [ ] **Console clean**: No errors or warnings

### Firefox
- [ ] **Rendering matches Chrome**: Visual parity
- [ ] **JavaScript compatible**: All features work
- [ ] **CSS renders correctly**: Flexbox, grid work
- [ ] **Hover states work**: Transitions smooth
- [ ] **Console clean**: No Firefox-specific errors

### Safari (macOS/iOS)
- [ ] **Rendering correct**: WebKit renders properly
- [ ] **JavaScript works**: Fetch API, promises work
- [ ] **CSS compatible**: Flexbox, grid, transforms
- [ ] **Touch events work** (iOS): Tap to filter functional
- [ ] **Console clean**: No Safari-specific errors

**Known Issues to Watch**:
- Safari may require `-webkit-` prefixes for some CSS
- Fetch API requires polyfill for older Safari versions
- Touch events different from click events on iOS

---

## ⚡ Performance Testing

### API Response Time
- [ ] **<500ms target**: Measure in Network tab
- [ ] **Consistent**: Multiple tests show consistent speed
- [ ] **Cached responses faster**: <100ms for cached data

**Measurement**:
1. Open DevTools > Network tab
2. Click "Locations" view
3. Find `/api/locations/stats` request
4. Check "Time" column (should be <500ms)

### Page Render Time
- [ ] **Cards render quickly**: No visible delay after data loads
- [ ] **No layout shifts**: Cards don't jump during render
- [ ] **Smooth transitions**: Fade-in animations smooth

**Measurement**:
1. Open DevTools > Performance tab
2. Start recording
3. Click "Locations" view
4. Stop recording after cards render
5. Check render time (target: <100ms after data received)

### Memory Usage
- [ ] **No memory leaks**: Check DevTools > Memory
- [ ] **Pagination doesn't leak**: Navigate pages, memory stable
- [ ] **View switching clean**: Switching views doesn't accumulate

**Test Procedure**:
1. Take heap snapshot (Memory tab)
2. Navigate through all pages
3. Switch views multiple times
4. Take another heap snapshot
5. Compare sizes (should be similar)

### Large Dataset Testing
If location count >100:
- [ ] **Pagination handles large sets**: Shows correct page count
- [ ] **Performance stable**: No slowdown with many locations
- [ ] **Scroll performance good**: Smooth scrolling

---

## 🔍 Error Handling

### API Errors
Test each scenario:

**Network Failure**:
- [ ] Disconnect network, click Locations view
- [ ] Error toast displays: "Failed to fetch location data"
- [ ] Console shows error message
- [ ] View doesn't crash (graceful degradation)

**Authentication Failure**:
- [ ] Clear session cookie, click Locations view
- [ ] Redirects to login page (or shows auth error)

**Server Error (500)**:
- [ ] Trigger 500 error (if possible)
- [ ] Error toast displays: "Failed to load location data"
- [ ] Console logs error details

**Empty Dataset**:
- [ ] Test with database containing no locations
- [ ] Shows "No locations found" message (or similar)
- [ ] Pagination hidden when no data

### JavaScript Errors
- [ ] **Console clean**: No uncaught exceptions
- [ ] **Missing data handled**: Null/undefined checks work
- [ ] **Invalid data handled**: Malformed API responses don't crash

---

## 🧪 Edge Cases

### Data Edge Cases
- [ ] **Location with 0 devices**: Card doesn't display (or shows 0)
- [ ] **Location with 0 VPR**: Displays "0.0" correctly
- [ ] **No KEV vulnerabilities**: KEV badge hidden
- [ ] **No open tickets**: Ticket info hidden or shows 0
- [ ] **Single vendor at location**: Only one vendor icon shows

### UI Edge Cases
- [ ] **Only 1 location total**: Pagination hidden
- [ ] **Exactly 12 locations**: Page 1 full, no page 2
- [ ] **13 locations**: Page 1 has 12, page 2 has 1
- [ ] **Very long location name**: Text wraps or truncates
- [ ] **Location name with special chars**: Displays correctly

### Browser Edge Cases
- [ ] **Cookies disabled**: Graceful error (if session required)
- [ ] **JavaScript disabled**: Fallback message (or page doesn't load)
- [ ] **Very old browser**: Feature detection works (or polyfills load)

---

## 📝 Console Validation

### Expected Debug Logs
When clicking "Locations" view for first time:

```
📍 HEX-292: Lazy loading location cards data
📍 HEX-292: Fetching location statistics from API
📍 Location stats loaded: { count: 42 }
```

### No Errors
- [ ] **No red errors**: Console should be clean
- [ ] **No warnings**: No yellow warnings
- [ ] **No 404s**: All assets load (CSS, JS, images)
- [ ] **No CORS errors**: API calls succeed

### Network Tab Validation
- [ ] **GET /api/locations/stats**: HTTP 200
- [ ] **Authorization header present**: Session cookie sent
- [ ] **Cache headers correct**: Server caching enabled
- [ ] **Response size reasonable**: Not bloated (check KB size)

---

## 🎯 Success Criteria Checklist

**Phase 1 MVP Requirements** (from HEX-292):
- [ ] View toggle includes "Locations" button
- [ ] Location cards display with accurate metrics
- [ ] Vendor distribution shown with colored device icons
- [ ] Primary vendor badge displays most common vendor
- [ ] VPR mini-cards show correct severity breakdown
- [ ] Responsive grid works on all breakpoints (3→2→1 columns)
- [ ] Pagination works (12 items per page)
- [ ] Sorting works (VPR desc, device count desc, location name asc)
- [ ] API response time <500ms
- [ ] No console errors or warnings

**Bug Fixes**:
- [x] SQL error "no such column: isKev" resolved
- [ ] KEV count displays correctly after fix
- [ ] No other SQL errors in logs

**Documentation**:
- [ ] Testing checklist complete (this document)
- [ ] Changelog updated with bug fix
- [ ] User guide created (if needed)

---

## 📊 Test Results Summary

**Test Date**: _____________
**Tester**: _____________
**Browser(s) Tested**: _____________
**Screen Sizes Tested**: _____________

**Total Tests**: 150+
**Passed**: _____
**Failed**: _____
**Skipped**: _____

### Critical Issues Found
1. ________________________________________
2. ________________________________________
3. ________________________________________

### Minor Issues Found
1. ________________________________________
2. ________________________________________
3. ________________________________________

### Recommendations
_________________________________________________________________
_________________________________________________________________
_________________________________________________________________

### Sign-Off
- [ ] All critical tests passed
- [ ] All blockers resolved
- [ ] Ready for production release

**Tester Signature**: _____________________ **Date**: __________

---

## 🔄 Next Steps After Testing

1. **Document Results**: Fill in test results summary above
2. **Fix Any Bugs**: Address failed tests before release
3. **Update Changelog**: Add test results to v1.0.83 changelog
4. **Update Linear**: Mark HEX-292 Task 4 complete
5. **Create Rewind Log**: Document completion for next session
6. **Release**: Deploy to production if all tests pass

---

**Testing Checklist Version**: 1.0
**Last Updated**: 2025-10-18
**Related Issues**: HEX-288 (parent), HEX-292 (implementation)
