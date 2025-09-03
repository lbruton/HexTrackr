# HexTrackr Core Engine & Visualization Sprint

**Sprint Goal:** Perfect the import/export/tracking/trending engine and solve chart visualization scaling issues

**Date:** September 3, 2025  
**Target Completion:** 1-2 days  
**Priority:** Core engine stability before cosmetic features

---

## 🎯 Sprint Objectives

### **Primary Goal: Core Engine Bulletproofing**

- Perfect import/export pipeline reliability
- Achieve Codacy ≤2.0 issues/kLoC target (currently 9.939)
- Implement hostname normalization for duplicate handling
- Test edge cases thoroughly

### **Secondary Goal: Chart Visualization Enhancement**

- Solve magnitude scaling issue (Critical/Low <2k vs Medium/High >15k)
- Make 20% week-over-week trends visible instead of appearing flat
- Maintain data accuracy while improving visual representation

---

## 📊 Current Data Visualization Problem

**Issue:** Chart scaling makes trends invisible

```
Critical:   ~55 (small numbers)
Low:        ~3363 (small numbers)  
Medium:     ~5297 (large numbers)
High:       ~3444 (large numbers)
```

**Result:** 20% week-over-week drops look like straight lines due to Y-axis scaling dominated by large values

## Solution Options:

1. **Dual Y-Axis**: Left axis for Critical/Low, Right axis for Medium/High
2. **Percentage Change View**: Show % change from baseline instead of absolute values
3. **Normalized Scaling**: Scale each severity to 0-100% of its typical range
4. **Logarithmic Scale**: Log scale to compress large value differences

---

## 🚀 Phase 1: Core Engine (Priority 1)

### **Task 1.1: Hostname Normalization** ✅ COMPLETED

**Effort:** 30 minutes  
**Impact:** High - Fixes duplicate detection across domain variations

## IMPLEMENTATION COMPLETED:

- ✅ Enhanced `normalizeHostname()` function with IP address detection
- ✅ Valid IP addresses (x.x.x.x, octets 0-255) preserved completely
- ✅ Domain names normalized (remove after first period)
- ✅ 16/16 test cases passing
- ✅ Codacy analysis clean

## Critical Issue Solved:

- ❌ BEFORE: `10.95.6.210` → `10` (would consolidate all 10.x IPs!)
- ✅ AFTER: `10.95.6.210` → `10.95.6.210` (preserved correctly)
- ✅ Domain case: `nwan10.mmplp.net` → `nwan10` (still works)

## Test Cases Verified:

- ✅ `nwan10.mmplp.net` + `nwan10` → Same unique key
- ✅ IP addresses preserved as complete unique identifiers  
- ✅ Domain changes don't break duplicate detection
- ✅ Invalid IPs (300.300.300.300) treated as hostnames
- ✅ Existing data compatibility maintained

### **Task 1.2: Import Pipeline Edge Case Testing**

**Effort:** 1 hour  
**Impact:** High - Prevents production data corruption

## Test Scenarios:

- [ ] Out-of-order imports (older data after newer)
- [ ] Partial dataset overlaps
- [ ] Large file processing (>10MB)
- [ ] Hostname domain variations
- [ ] Missing CVE handling
- [ ] VPR score changes for same vulnerability

### **Task 1.3: Export Pipeline Enhancement**

**Effort:** 1 hour  
**Impact:** Medium - Completes the data lifecycle

## Requirements:

- Export from `vulnerabilities_current` (not snapshots)
- Include normalized hostnames in export
- Maintain CSV format compatibility
- Handle large dataset exports

---

## 🔧 Phase 2: Codacy Quality Sprint (Priority 1)

### **Current Status:** 9.939 issues/kLoC → **Target:** ≤2.0 issues/kLoC

### **Task 2.1: Critical Complexity Issues**

**Effort:** 2-3 hours  
**Impact:** High - Biggest quality improvement per effort

## Focus Areas:

- 7 critical complexity issues
- Function length reduction
- Cyclomatic complexity reduction

### **Task 2.2: Quick ErrorProne Fixes**

**Effort:** 1 hour  
**Impact:** Medium - Easy wins

## Items:

- 4 trailing comma issues
- CSS/JS syntax cleanup
- Simple code pattern fixes

---

## 📈 Phase 3: Chart Visualization Enhancement (Priority 2)

### **Task 3.1: Implement Dual Y-Axis Chart**

**Effort:** 2-3 hours  
**Impact:** High - Solves core visibility problem

## ApexCharts Implementation:

```javascript
// Enhanced chart configuration
const chartOptions = {
    chart: { type: 'line' },
    yaxis: [
        {
            title: { text: 'Critical & Low Vulnerabilities' },
            seriesName: ['Critical', 'Low'],
            min: 0,
            max: dataMaxForSmallNumbers * 1.1
        },
        {
            opposite: true,
            title: { text: 'Medium & High Vulnerabilities' },
            seriesName: ['Medium', 'High'],
            min: 0,
            max: dataMaxForLargeNumbers * 1.1
        }
    ],
    series: [
        { name: 'Critical', data: criticalData, yAxisIndex: 0 },
        { name: 'Low', data: lowData, yAxisIndex: 0 },
        { name: 'Medium', data: mediumData, yAxisIndex: 1 },
        { name: 'High', data: highData, yAxisIndex: 1 }
    ]
};
```

### **Task 3.2: Alternative: Percentage Change View**

**Effort:** 1-2 hours  
**Impact:** Medium - Shows trends clearly

## Implementation:

- Calculate baseline (first data point or average)
- Show percentage change from baseline
- Maintains trend visibility regardless of magnitude

### **Task 3.3: Chart View Toggle**

**Effort:** 1 hour  
**Impact:** Medium - User flexibility

## Options:

- [ ] Absolute Values (current)
- [ ] Dual Y-Axis
- [ ] Percentage Change
- [ ] Normalized (0-100%)

---

## 🧪 Phase 4: Testing & Validation

### **Task 4.1: Import/Export Pipeline Testing**

## Test Data:

- Historical data (6 months old)
- Domain variation samples
- Large datasets
- Malformed CSV handling

### **Task 4.2: Chart Visualization Testing**

## Validation:

- Trend visibility with real data
- Data accuracy preservation
- Performance with large datasets
- Mobile responsiveness

### **Task 4.3: Codacy Validation**

**Target:** Achieve ≤2.0 issues/kLoC before sprint completion

---

## 📋 Definition of Done

### **Core Engine:**

- [ ] Hostname normalization implemented and tested
- [ ] All import edge cases handle gracefully
- [ ] Export pipeline matches import robustness
- [ ] Codacy target achieved (≤2.0 issues/kLoC)

### **Chart Visualization:**

- [ ] 20% trends clearly visible in chart
- [ ] Data accuracy maintained
- [ ] Multiple view options available
- [ ] Performance acceptable with real datasets

### **Quality Assurance:**

- [ ] All Codacy critical issues resolved
- [ ] No regression in existing functionality
- [ ] Documentation updated
- [ ] Change log updated

---

## 🎯 Success Metrics

1. **Import Reliability:** 100% successful imports for all test scenarios
2. **Codacy Score:** ≤2.0 issues/kLoC (from 9.939)
3. **Chart Usability:** Trends visible at 20% change threshold
4. **Performance:** Import/chart render times maintain current levels
5. **Data Integrity:** Zero data loss or corruption in testing

---

## 🚀 Next Actions

## Immediate (Today):

- [ ] Review and approve sprint plan
- [ ] Set up test data for edge cases
- [ ] Prepare Codacy analysis baseline

## Tomorrow (Start Sprint):

- [ ] Task 1.1: Implement hostname normalization
- [ ] Task 1.2: Test import edge cases
- [ ] Task 2.1: Begin Codacy critical fixes

**Foundation First Principle:** No chart enhancements until core engine is bulletproof! 🛡️
