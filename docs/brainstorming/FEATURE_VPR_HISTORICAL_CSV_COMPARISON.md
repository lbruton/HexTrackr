# VPR Historical CSV Comparison Feature

**Status**: Planning
**Date**: 2025-10-13
**Related**: HEX-144, HEX-149 (VPR weekly summary export)

---

## Overview

Add keyboard shortcuts for historical VPR trend comparisons beyond the current "latest vs previous" report. Users can generate 7-day and 30-day comparison reports using modifier keys on VPR card clicks.

---

## Problem Statement

Current CSV export (Cmd+Shift+Click) compares **most recent vs second-most-recent** scan dates. Network engineers need longer-term trend analysis:
- **Weekly trends**: How did VPR change over the past week?
- **Monthly trends**: How did VPR change over the past 30 days?

This helps identify:
- Gradual vulnerability accumulation
- Effectiveness of patching campaigns
- Long-term security posture trends

---

## Solution

### Keyboard Shortcuts

| Shortcut (Mac) | Shortcut (Windows) | Timeframe | Comparison |
|----------------|-------------------|-----------|------------|
| `Cmd+Shift+Click` | `Ctrl+Shift+Click` | **7 Days** | Current vs ~7 days ago |
| `Cmd+Alt+Click` | `Ctrl+Alt+Click` | **30 Days** | Current vs ~30 days ago |
| `Cmd+Shift+Alt+Click` | `Ctrl+Shift+Alt+Click` | Current | Latest vs Previous |

---

## Technical Implementation

### 1. Historical Snapshot Finder

**Method**: `_findHistoricalSnapshot(trends, daysBack)`

**Logic**:
```javascript
_findHistoricalSnapshot(trends, daysBack) {
    // Most recent snapshot (current)
    const currentDate = new Date(trends[trends.length - 1].date);

    // Calculate target date (current - daysBack)
    const targetDate = new Date(currentDate);
    targetDate.setDate(targetDate.getDate() - daysBack);

    // Find closest snapshot <= target date
    const historical = trends.reverse().find(snapshot =>
        new Date(snapshot.date) <= targetDate
    );

    // Graceful fallback: Use oldest available data if no data within timeframe
    if (!historical) {
        const oldestSnapshot = trends[0];
        const actualDaysBack = Math.floor(
            (currentDate - new Date(oldestSnapshot.date)) / (1000 * 60 * 60 * 24)
        );

        return {
            snapshot: oldestSnapshot,
            isFallback: true,
            actualDaysBack: actualDaysBack,
            note: `Using oldest available data (${actualDaysBack} days)`
        };
    }

    // Normal case: Found data within timeframe
    const actualDaysBack = Math.floor(
        (currentDate - new Date(historical.date)) / (1000 * 60 * 60 * 24)
    );

    return {
        snapshot: historical,
        isFallback: false,
        actualDaysBack: actualDaysBack,
        note: null
    };
}
```

**Returns**:
```javascript
{
    snapshot: {...},           // Trends data point
    isFallback: boolean,       // True if using oldest available (not within timeframe)
    actualDaysBack: number,    // Actual days between snapshots
    note: string | null        // Fallback explanation if applicable
}
```

---

### 2. Historical Aggregation Method

**Method**: `_aggregateVprByVendorHistorical(vendorFilter, daysBack)`

**Reuses existing logic** but replaces "previousWeek" with historical snapshot:

```javascript
async _aggregateVprByVendorHistorical(vendorFilter, daysBack) {
    // Fetch trends from backend API
    const url = `/api/vulnerabilities/trends?vendor=${encodeURIComponent(vendorFilter)}`;
    const response = await authState.authenticatedFetch(url);
    const trends = await response.json();

    // Current week (most recent)
    const currentWeek = trends[trends.length - 1];

    // Historical snapshot using finder logic
    const historicalData = this._findHistoricalSnapshot(trends, daysBack);
    const previousWeek = historicalData.snapshot;

    // Calculate percentage changes (same as current implementation)
    // ... existing logic ...

    return {
        current: currentTotals,
        currentCounts: currentCounts,
        percentChanges: percentChanges,
        countPercentChanges: countPercentChanges,
        dates: {
            current: currentWeek.date,
            previous: previousWeek.date,
            actualDaysBack: historicalData.actualDaysBack,
            isFallback: historicalData.isFallback,
            note: historicalData.note
        }
    };
}
```

---

### 3. Export Method

**Method**: `exportVprHistoricalComparison(daysBack)`

**Same structure as current `exportVprWeeklySummary()`** but:
- Calls `_aggregateVprByVendorHistorical()` instead of `_aggregateVprByVendor()`
- Adds CSV header section with date range
- Includes fallback note if applicable
- Changes filename to reflect timeframe

```javascript
async exportVprHistoricalComparison(daysBack) {
    // Fetch historical data for all vendors
    const [ciscoData, paloData, otherData] = await Promise.all([
        this._aggregateVprByVendorHistorical("CISCO", daysBack),
        this._aggregateVprByVendorHistorical("Palo Alto", daysBack),
        this._aggregateVprByVendorHistorical("Other", daysBack)
    ]);

    // Extract dates and build header
    const reportDates = ciscoData.dates; // All vendors have same dates
    const timeframeName = daysBack === 7 ? "WEEKLY" : "MONTHLY";
    const fallbackNote = reportDates.isFallback
        ? ` (LIMITED DATA - using oldest available: ${reportDates.actualDaysBack} days)`
        : "";

    // CSV Header
    let csvContent = `${timeframeName} VPR COMPARISON (${daysBack} DAYS${fallbackNote})\n`;
    csvContent += `Date Range: ${reportDates.previous} to ${reportDates.current}\n`;
    if (reportDates.note) {
        csvContent += `Note: ${reportDates.note}\n`;
    }
    csvContent += `\n`; // Blank line before tables

    // Build tables (same as current implementation)
    // ... existing CSV generation logic ...

    // Download with descriptive filename
    const filename = `HexTrackr_VPR_${timeframeName}_${daysBack}day_${reportDates.previous}_to_${reportDates.current}.csv`;
    this._downloadCSV(csvContent, filename);
}
```

---

### 4. Click Handler Update

**Method**: `_handleCardClick(event)`

**Add modifier key detection**:

```javascript
_handleCardClick(event) {
    const card = event.currentTarget;
    const severity = card.dataset.severity;

    // Check for power tool shortcuts (with modifiers)
    const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
    const cmdOrCtrl = isMac ? event.metaKey : event.ctrlKey;
    const shift = event.shiftKey;
    const alt = event.altKey;

    // Historical comparisons (NEW)
    if (cmdOrCtrl && shift && alt) {
        // Cmd+Shift+Alt+Click = 7-day comparison
        event.preventDefault();
        this.exportVprHistoricalComparison(7);
        return;
    }

    if (cmdOrCtrl && alt && !shift) {
        // Cmd+Alt+Click = 30-day comparison
        event.preventDefault();
        this.exportVprHistoricalComparison(30);
        return;
    }

    // Current comparison (EXISTING)
    if (cmdOrCtrl && shift && !alt) {
        // Cmd+Shift+Click = latest vs previous
        event.preventDefault();
        this.exportVprWeeklySummary();
        return;
    }

    // Normal click - toggle metric type (EXISTING)
    this.toggleMetricType();
}
```

---

## CSV Output Examples

### 7-Day Report (Normal Case)

```csv
WEEKLY VPR COMPARISON (7 DAYS)
Date Range: 2025-10-06 to 2025-10-13

OVERALL VPR TOTALS,,,,,,OVERALL VULNERABILITY COUNTS
PERIOD,CRITICAL,HIGH,MEDIUM,LOW,TOTAL,,PERIOD,CRITICAL,HIGH,MEDIUM,LOW,TOTAL
2025-10-06,148.0,23222.0,18689.9,1484.9,43544.8,,2025-10-06,12,234,456,78,780
2025-10-13,203.2,23216.7,24452.7,1483.9,49356.5,,2025-10-13,15,235,480,77,807
CHANGE,55.2,-5.3,5762.8,-1.0,5811.7,,CHANGE,3,1,24,-1,27

CISCO DEVICES (VPR),,,,,,CISCO DEVICES (COUNTS)
PERIOD,CRITICAL,HIGH,MEDIUM,LOW,TOTAL,,PERIOD,CRITICAL,HIGH,MEDIUM,LOW,TOTAL
2025-10-06,100.5,15000.0,12000.0,900.0,28000.5,,2025-10-06,8,150,300,50,508
2025-10-13,150.2,15100.0,16000.0,895.0,32145.2,,2025-10-13,10,152,320,48,530
CHANGE,49.7,100.0,4000.0,-5.0,4144.7,,CHANGE,2,2,20,-2,22
...
```

### 30-Day Report (Fallback Case)

```csv
MONTHLY VPR COMPARISON (30 DAYS - LIMITED DATA - using oldest available: 21 days)
Date Range: 2025-09-22 to 2025-10-13
Note: Using oldest available data (21 days)

OVERALL VPR TOTALS,,,,,,OVERALL VULNERABILITY COUNTS
PERIOD,CRITICAL,HIGH,MEDIUM,LOW,TOTAL,,PERIOD,CRITICAL,HIGH,MEDIUM,LOW,TOTAL
2025-09-22,120.5,22890.0,17200.0,1450.0,41660.5,,2025-09-22,10,220,400,75,705
2025-10-13,203.2,23216.7,24452.7,1483.9,49356.5,,2025-10-13,15,235,480,77,807
CHANGE,82.7,326.7,7252.7,33.9,7696.0,,CHANGE,5,15,80,2,102
...
```

### Filename Examples

```
HexTrackr_VPR_WEEKLY_7day_2025-10-06_to_2025-10-13.csv
HexTrackr_VPR_MONTHLY_30day_2025-09-22_to_2025-10-13.csv
```

---

## Edge Cases & Handling

### 1. Insufficient Historical Data

**Scenario**: User requests 30-day comparison but only has 21 days of data.

**Behavior**:
- Use oldest available snapshot (21 days ago)
- Show fallback note in CSV header: `"LIMITED DATA - using oldest available: 21 days"`
- Display actual date range in filename and header
- No error - graceful degradation

---

### 2. Only One Snapshot Available

**Scenario**: Fresh installation, only 1 data point.

**Behavior**:
- Compare current vs current (0% change)
- CSV header shows same date twice
- Note: `"Using oldest available data (0 days)"`

---

### 3. No Data Available

**Scenario**: No trends data in database (shouldn't happen in production).

**Behavior**:
- Show toast notification: "No historical data available for comparison"
- Don't generate CSV
- Same validation as current `exportVprWeeklySummary()`

---

## Files to Modify

### Primary File
- `app/public/scripts/shared/vulnerability-statistics.js`
  - Add `_findHistoricalSnapshot()` method (~30 lines)
  - Add `_aggregateVprByVendorHistorical()` method (~80 lines, reuses existing logic)
  - Add `exportVprHistoricalComparison()` method (~120 lines, based on existing export)
  - Update `_handleCardClick()` method (add Alt modifier detection, ~15 lines)

**Estimated additions**: ~245 lines of code

---

## Testing Checklist

### Functional Testing
- [ ] **7-day normal**: Click Cmd+Shift+Alt on VPR card with 7+ days of data
  - Verify single CSV download
  - Verify date range shows ~7 days
  - Verify totals match expected values

- [ ] **30-day normal**: Click Cmd+Alt on VPR card with 30+ days of data
  - Verify single CSV download
  - Verify date range shows ~30 days
  - Verify totals match expected values

- [ ] **7-day fallback**: Test with <7 days of data
  - Verify uses oldest available
  - Verify fallback note appears
  - Verify actual days shown in header

- [ ] **30-day fallback**: Test with <30 days of data
  - Verify uses oldest available
  - Verify fallback note appears
  - Verify actual days shown in header

- [ ] **Existing shortcuts unchanged**:
  - Cmd+Shift+Click still generates latest vs previous
  - Regular click still toggles VPR/Count view

### Cross-browser Testing
- [ ] Chrome (Mac)
- [ ] Chrome (Windows)
- [ ] Firefox (Mac)
- [ ] Firefox (Windows)
- [ ] Safari (Mac)

### Data Validation
- [ ] OVERALL section aggregates correctly
- [ ] Vendor sections match backend trends
- [ ] Percentage changes calculated correctly
- [ ] Dates displayed match actual snapshot dates

---

## User Documentation

### Power Tool Shortcuts (Updated)

**VPR Card Export Shortcuts**:

Click any of the 4 VPR total cards with keyboard modifiers to export CSV reports:

| Shortcut | Mac | Windows | Report Type |
|----------|-----|---------|-------------|
| **Weekly** | `Cmd+Shift+Click` | `Ctrl+Shift+Click` | Current vs 7 days ago |
| **Monthly** | `Cmd+Alt+Click` | `Ctrl+Alt+Click` | Current vs 30 days ago |
| **Current** | `Cmd+Shift+Alt+Click` | `Ctrl+Shift+Alt+Click` | Latest vs Previous scan |

**Note**: Historical comparisons use the closest available data if exact timeframe isn't available. The CSV header shows actual date ranges and notes any fallback behavior.

---

## Implementation Timeline

**Estimated Effort**: 2-3 hours
- 1 hour: Core implementation
- 30 minutes: Testing
- 30 minutes: Documentation updates
- 30 minutes: Edge case validation

---

## Future Enhancements

### Custom Timeframes
Allow user to specify custom day ranges (14, 60, 90 days) via settings modal.

### Trend Charts
Generate ApexCharts line graphs showing VPR trends over selected timeframe.

### Email Reports
Schedule automated weekly/monthly CSV reports via email.

### Comparison Overlays
Show multiple timeframe comparisons in single CSV (7-day, 30-day, 90-day side-by-side).

---

## Related Context

**Previous Work**:
- HEX-144: VPR weekly summary export (Cmd+Shift+Click)
- HEX-149: Vendor breakdown in CSV reports
- v1.0.65: Fixed CSV export bugs (4 downloads, filtered totals, date comparison)

**Memento Patterns**:
- `Pattern: Scan Date vs Upload Timestamp for Trend Comparison`
- `Pattern: Event Listener Bind-Once Strategy`

**Backend API**:
- `GET /api/vulnerabilities/trends?vendor={vendor}` returns time-series snapshots with dates
