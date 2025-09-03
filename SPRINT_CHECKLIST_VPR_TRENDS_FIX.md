# HexTrackr VPR Trends Sprint Checklist

*Generated: September 2, 2025*
*Agent-Ready Task Breakdown for OpenAI Codex / Google Gemini*

## **🎯 SPRINT OBJECTIVE**

Fix VPR trending data display issues after rollover architecture implementation. System shows empty trends despite having data, and statistics cards display incorrect calculations.

---

## **📊 CONTEXT SUMMARY**

### **Current State**

- **Architecture**: Rollover system implemented and working correctly ✅
- **Data**: 4,953 snapshots, 1,651 current records, 8 daily totals (Aug 11-18) ✅  
- **Issues**: API endpoints need configuration updates, not architectural rebuild ✅
- **User Feedback**: Remove 14-day API filter, fix VPR summation, enable chart panning ✅

### **Root Causes Identified**

1. **Empty Trends**: 14-day filter excludes August data (need 30+ days or remove filter)
2. **Wrong Statistics**: API returns counts instead of VPR score sums  
3. **Settings Modal**: Data removal functionality broken
4. **Field Mapping**: CSV date fields incomplete for Cisco format

---

## **📋 TASK BREAKDOWN**

### **🔧 TASK 1: Fix Trends API Date Filtering**

**Priority**: Critical | **Estimate**: 15 minutes | **Agent**: Any

**Objective**: Remove server-side date filtering to enable frontend chart panning

**Files to Modify**:

- `/server.js` (lines ~531-535)

**Current Code**:

```sql
WHERE scan_date >= DATE('now', '-14 days')
```

**Required Change**:

```sql
-- Remove WHERE clause completely - return ALL historical data
```

**Detailed Steps**:

1. Open `/server.js`
2. Find `/api/vulnerabilities/trends` endpoint (line ~531)
3. Locate SQL query with `WHERE scan_date >= DATE('now', '-14 days')`
4. **Remove entire WHERE clause** - let ApexCharts handle filtering
5. Test: `curl http://localhost:8080/api/vulnerabilities/trends`
6. Verify: Response includes August data (not empty array)

**Success Criteria**:

- ✅ API returns historical data from August 11-18
- ✅ No server-side date filtering
- ✅ Frontend charts can pan back months

---

### **🔧 TASK 2: Fix Statistics VPR Summation**

**Priority**: Critical | **Estimate**: 20 minutes | **Agent**: Any

**Objective**: Return VPR score totals instead of averages/counts

**Files to Modify**:

- `/server.js` (statistics endpoints)

**Current Issue**:

```javascript
// Line ~467: avgVpr = total_vpr / count (WRONG - returns average)
```

**Required Changes**:

1. **Statistics Cards API**: Return SUM of VPR scores by criticality
2. **Remove averaging logic**: Use `total_vpr` directly, not `total_vpr / count`
3. **Add percentage calculation**: Compare current vs previous scan VPR totals

**Detailed Steps**:

1. Find statistics endpoint in `/server.js`
2. Locate VPR calculation logic (around line 467)
3. Change `avgVpr = total_vpr / count` to `totalVpr = total_vpr`
4. Update response to send totals, not averages
5. Add previous scan comparison for percentage changes
6. Test: Verify cards show "185 Critical VPR" not "5.78 avg"

**Expected Results**:

- Critical: 185 total VPR (not 5.78 average)
- High: [sum] total VPR  
- Medium: [sum] total VPR
- Low: [sum] total VPR
- Percentage change from previous scan

---

### **🔧 TASK 3: Fix Settings Modal Data Removal**

**Priority**: High | **Estimate**: 25 minutes | **Agent**: Any

**Objective**: Restore data removal functionality in settings modal

**Files to Check**:

- `/server.js` (delete endpoints)
- `/scripts/shared/settings-modal.js` (frontend calls)

**Current Issue**: Settings modal data removal failing (user report)

**Investigation Steps**:

1. Test settings modal → "Remove Data" → verify network requests
2. Check for 404/500 errors in browser console
3. Verify delete endpoints exist and respond correctly
4. Ensure proper request/response format

**Common Fixes**:

- Missing DELETE route handlers
- Incorrect endpoint URLs in frontend
- CORS issues with DELETE methods
- Missing error handling

**Success Criteria**:

- ✅ Settings modal successfully removes vulnerability data
- ✅ UI updates after removal
- ✅ No console errors during operation

---

### **🔧 TASK 4: Enhanced CSV Field Mapping**

**Priority**: Medium | **Estimate**: 30 minutes | **Agent**: Any

**Objective**: Complete Cisco CSV date field mappings

**Files to Modify**:

- `/server.js` (mapVulnerabilityRow function)

**Current Mappings**:

```javascript
// Existing working mappings:
asset.display_ipv4_address → ip_address
asset.name → hostname  
definition.family → vendor
definition.vpr.score → vpr_score
```

**Missing Mappings** (from user screenshot):

```javascript
// Add these mappings:
definition.first_found → first_seen
definition.last_found → last_seen  
```

**Detailed Steps**:

1. Locate `mapVulnerabilityRow()` function in `/server.js`
2. Add date field mappings for Cisco CSV format
3. Add COALESCE fallbacks for NULL dates in SQL queries
4. Test with Cisco CSV file upload
5. Verify date fields populate correctly

**Success Criteria**:

- ✅ first_seen/last_seen fields populated from CSV
- ✅ NULL date handling with fallbacks
- ✅ Statistics show proper date ranges

---

### **🔧 TASK 5: Frontend Chart Configuration**

**Priority**: Medium | **Estimate**: 20 minutes | **Agent**: Any

**Objective**: Configure ApexCharts for proper panning and 14-day default view

**Files to Modify**:

- `/scripts/pages/vulnerabilities.js` (chart configuration)

**Required Changes**:

1. **Default View**: Set chart to show last 14 days by default
2. **Panning**: Enable user to pan back 6+ months if data exists
3. **Zoom**: Allow zoom controls for different time ranges
4. **Performance**: Optimize for large datasets

**Chart Configuration**:

```javascript
// ApexCharts options to add/modify:
xaxis: {
  type: 'datetime',
  min: // Last 14 days from current date
  max: // Current date
}
chart: {
  zoom: {
    enabled: true,
    type: 'x'
  },
  pan: {
    enabled: true,
    type: 'x'  
  }
}
```

**Success Criteria**:

- ✅ Chart defaults to 14-day view
- ✅ Users can pan to view historical data (Aug 11-18)
- ✅ Smooth zoom/pan experience
- ✅ No performance issues with data load

---

## **🧪 TESTING PROTOCOL**

### **Pre-Testing Setup**

```bash

# 1. Start HexTrackr server

cd /Volumes/DATA/GitHub/HexTrackr
node server.js

# 2. Open browser to http://localhost:8080

# 3. Navigate to vulnerabilities page

```

### **Test Cases**

#### **Test Case 1: Trends API**

```bash

# Before fix: Should return empty array []

curl http://localhost:8080/api/vulnerabilities/trends

# After fix: Should return August data

curl http://localhost:8080/api/vulnerabilities/trends | jq '.[0].scan_date'

# Expected: "2025-08-18" or similar August dates

```

#### **Test Case 2: Statistics Cards**

```javascript
// Navigate to vulnerabilities page
// Check statistics cards display:
// Before: "Critical: 5.78 avg" 
// After: "Critical: 185 total"
```

#### **Test Case 3: Chart Panning**

```javascript
// 1. View chart with default 14-day range
// 2. Use chart controls to pan left 
// 3. Verify August data becomes visible
// 4. Zoom in/out to test different ranges
```

#### **Test Case 4: Settings Modal**

```javascript
// 1. Open Settings modal
// 2. Try "Remove Vulnerability Data" 
// 3. Verify no console errors
// 4. Check data actually removed from UI
```

---

## **🚨 CRITICAL REMINDERS**

### **Before Making Changes**

1. **Run Codacy Analysis**:

   ```bash

   # Must run BEFORE edits

   # Will help identify existing issues to avoid introducing new ones

   ```

1. **Create Git Checkpoint**:

   ```bash
   git add -A && git commit -m "CHECKPOINT: Before VPR trends API fixes"
   ```

### **After Each Change**

1. **Test Immediately**: Verify fix works before moving to next task
2. **Run Codacy Again**: Ensure no new issues introduced
3. **Update Progress**: Mark task ✅ when verified working

### **Architecture Notes**

- **Do NOT modify rollover system** - it's working correctly
- **Focus on API configuration**, not database changes  
- **Preserve existing vendor-neutral CSV import pipeline**
- **Maintain all security validations and error handling**

### **User Requirements Summary**

- **Remove API date filtering** → enable chart panning
- **Fix VPR summation** → totals not averages  
- **Default 14-day chart view** → handled by frontend
- **Settings modal fixes** → restore data removal
- **Field mapping completion** → Cisco date fields

---

## **📁 KEY FILES & LOCATIONS**

| File | Purpose | Lines of Interest |
|------|---------|------------------|
| `/server.js` | Main backend logic | ~531 (trends), ~467 (stats) |
| `/scripts/pages/vulnerabilities.js` | Chart configuration | ApexCharts setup |
| `/scripts/shared/settings-modal.js` | Settings functionality | Delete operations |
| `/data/hextrackr.db` | Database | 8 daily totals (Aug 11-18) |

---

## **✅ COMPLETION CRITERIA**

**Sprint Considered Complete When**:

1. ✅ Trends chart displays August historical data
2. ✅ Statistics cards show VPR score totals (not averages)
3. ✅ Users can pan chart to view 6+ months of data  
4. ✅ Chart defaults to 14-day view
5. ✅ Settings modal data removal works
6. ✅ All Codacy issues resolved
7. ✅ No console errors in browser
8. ✅ User confirms trending functionality restored

**Final Verification**:

- Upload a test CSV → verify charts update
- Pan chart timeline → verify historical data visible  
- Check statistics → verify VPR totals correct
- Test settings → verify data removal works

---

*This checklist is designed for any AI agent to follow independently. Each task includes specific file locations, code examples, and clear success criteria for autonomous execution.*
