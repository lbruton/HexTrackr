# CISA KEV UI/UX Design Mockups

## Overview

This document provides comprehensive visual design specifications for integrating CISA KEV indicators into HexTrackr's user interface. The design follows industry standards for security dashboards while maintaining consistency with HexTrackr's existing visual patterns.

---

## Design Principles

### 1. Security-First Visual Hierarchy
- **KEV vulnerabilities receive highest visual priority**
- **Color coding follows severity conventions (red = critical attention)**
- **Clear distinction between exploited vs. unexploited vulnerabilities**

### 2. Accessibility Standards
- **WCAG AA compliance** for color contrast ratios
- **Screen reader friendly** with proper ARIA labels
- **Keyboard navigation** support for all KEV controls

### 3. Performance Considerations
- **Minimal visual overhead** - badges don't impact load times
- **Progressive enhancement** - KEV features degrade gracefully
- **Responsive design** - consistent across all device sizes

---

## Color Palette & Styling

### KEV Color Scheme

```css
/* Primary KEV Colors */
:root {
    --kev-primary: #dc2626;           /* Red-600 */
    --kev-secondary: #ef4444;         /* Red-500 */
    --kev-background: #fef2f2;        /* Red-50 */
    --kev-border: #fecaca;            /* Red-200 */
    --kev-text: #ffffff;              /* White text on red */
    --kev-text-dark: #7f1d1d;        /* Red-900 for backgrounds */

    /* KEV Gradient */
    --kev-gradient: linear-gradient(135deg, #dc2626, #ef4444);

    /* Ransomware KEV (even higher priority) */
    --kev-ransomware: #991b1b;        /* Red-800 */
    --kev-ransomware-bg: #fee2e2;     /* Red-100 */

    /* KEV Status Variants */
    --kev-overdue: #7f1d1d;           /* Red-900 */
    --kev-due-soon: #ea580c;          /* Orange-600 */
    --kev-new: #dc2626;               /* Red-600 */
}
```

### Badge Specifications

```css
.kev-badge {
    /* Core styling */
    background: var(--kev-gradient);
    color: var(--kev-text);
    font-weight: 700;
    font-size: 0.75rem;
    line-height: 1;
    padding: 3px 6px;
    border-radius: 4px;
    text-transform: uppercase;
    letter-spacing: 0.025em;

    /* Visual enhancements */
    box-shadow: 0 1px 3px rgba(220, 38, 38, 0.3);
    border: 1px solid rgba(220, 38, 38, 0.2);

    /* Animation */
    transition: all 0.2s ease-in-out;
}

.kev-badge:hover {
    transform: translateY(-1px);
    box-shadow: 0 2px 6px rgba(220, 38, 38, 0.4);
}

/* Badge variants */
.kev-badge.ransomware {
    background: var(--kev-ransomware);
    animation: pulse-subtle 2s infinite;
}

.kev-badge.overdue {
    background: var(--kev-overdue);
    animation: pulse-urgent 1s infinite;
}

@keyframes pulse-subtle {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.8; }
}

@keyframes pulse-urgent {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.7; }
}
```

---

## Component Mockups

### 1. Vulnerability Cards with KEV Indicators

```
Standard Vulnerability Card:
┌─────────────────────────────────────────────────┐
│ CVE-2024-1234                             [KEV] │
│ Critical Score: 9.8                             │
│ Description: Buffer overflow in network driver  │
│ Affected Hosts: 15 devices                      │
│ First Seen: 2024-09-15  Last Seen: 2024-09-21  │
│ ┌─────────────┐ ┌─────────────┐ ┌──────────────┐ │
│ │ View Details│ │Create Ticket│ │ Export Data  │ │
│ └─────────────┘ └─────────────┘ └──────────────┘ │
└─────────────────────────────────────────────────┘

KEV Vulnerability Card (with red left border):
┃ CVE-2024-5678                   🔥 [KEV] [RANSOM]
┃ Critical Score: 9.8                             │
┃ Description: Apache HTTP Server RCE             │
┃ Affected Hosts: 8 devices                       │
┃ KEV Due Date: 2024-10-21 (30 days)              │
┃ First Seen: 2024-08-15  Last Seen: 2024-09-21  │
┃ ┌─────────────┐ ┌─────────────┐ ┌──────────────┐ │
┃ │ View Details│ │Create Ticket│ │ Export Data  │ │
┃ └─────────────┘ └─────────────┘ └──────────────┘ │
└─────────────────────────────────────────────────┘

Overdue KEV Card (pulsing red border):
┃ CVE-2024-9999                        ⚠️ [OVERDUE]
┃ Critical Score: 9.9                             │
┃ Description: Windows Kernel Elevation           │
┃ Affected Hosts: 23 devices                      │
┃ KEV Due Date: 2024-09-01 (20 days overdue)      │
┃ First Seen: 2024-07-10  Last Seen: 2024-09-21  │
┃ ┌─────────────┐ ┌─────────────┐ ┌──────────────┐ │
┃ │ View Details│ │Create Ticket│ │ Export Data  │ │
┃ └─────────────┘ └─────────────┘ └──────────────┘ │
└─────────────────────────────────────────────────┘
```

### 2. Vulnerability Table with KEV Column

```
Vulnerability Data Table:
┌────────────────┬──────────┬─────┬─────────┬──────────────────────────────┬─────────┐
│ CVE ID         │ Severity │ VPR │ KEV     │ Description                  │ Actions │
├────────────────┼──────────┼─────┼─────────┼──────────────────────────────┼─────────┤
│ CVE-2024-1234  │ Critical │ 9.8 │ 🔥 KEV   │ Buffer overflow vulnerability│ Details │
│ CVE-2024-5678  │ High     │ 8.2 │ 🔥 RANSOM│ Apache HTTP Server RCE       │ Details │
│ CVE-2024-9999  │ Critical │ 9.9 │ ⚠️ OVERDUE│ Windows Kernel Elevation     │ Details │
│ CVE-2024-1111  │ Medium   │ 6.5 │    -    │ XSS in web application       │ Details │
│ CVE-2024-2222  │ High     │ 7.8 │    -    │ SQL injection vulnerability  │ Details │
└────────────────┴──────────┴─────┴─────────┴──────────────────────────────┴─────────┘

Filter Controls:
┌─────────────────────────────────────────────────────────────────────────────────┐
│ Filters: [ All Severities ▼] [All Types ▼] [🔥 KEV Only] [⚠️ Overdue] [Search...]│
└─────────────────────────────────────────────────────────────────────────────────┘

Sort Options:
┌─────────────────────────────────────────────────────────────────────────────────┐
│ Sort by: [KEV Priority ▼] [Severity ▼] [VPR Score ▼] [Date ▼]                   │
└─────────────────────────────────────────────────────────────────────────────────┘
```

### 3. Dashboard KEV Statistics Widget

```
KEV Status Dashboard Widget:
┌───────────── KEV Intelligence ─────────────────┐
│                                                │
│ ┌──────────────────────────────────────────────┐ │
│ │          KEV Status Overview                 │ │
│ │                                              │ │
│ │  🔥 Total KEVs: 15                           │ │
│ │  📊 Coverage: 1.2% of vulnerabilities        │ │
│ │  ⚠️ Overdue: 3 vulnerabilities               │ │
│ │  🔔 Due Soon: 5 vulnerabilities (< 7 days)   │ │
│ │                                              │ │
│ └──────────────────────────────────────────────┘ │
│                                                │
│ ┌──────────────────────────────────────────────┐ │
│ │           Recent KEV Additions               │ │
│ │                                              │ │
│ │     ▁▁▃▅█▇▃▅▂▁▁▁▃▅▇█▇▅▃▁▁▂▄▆█▇▅▃▁▁▁        │ │
│ │     │                               │        │ │
│ │   30 days ago                    Today       │ │
│ │                                              │ │
│ │   Last 7 days: +2 KEVs                      │ │
│ │   Last 30 days: +8 KEVs                     │ │
│ │                                              │ │
│ └──────────────────────────────────────────────┘ │
│                                                │
│ ┌──────────────────────────────────────────────┐ │
│ │              Quick Actions                   │ │
│ │                                              │ │
│ │  [🔄 Sync KEV Data]  [📋 View All KEVs]     │ │
│ │  [📊 KEV Report]     [⚙️ KEV Settings]       │ │
│ │                                              │ │
│ │  Last Sync: 2 hours ago ✅                   │ │
│ │                                              │ │
│ └──────────────────────────────────────────────┘ │
└────────────────────────────────────────────────┘
```

### 4. Settings Modal - KEV Integration Tab

```
Settings Modal - KEV Integration Tab:
┌─────────────────────────────────────────────────────────────────────────────┐
│ Settings                                                               [ × ] │
├─────────────────────────────────────────────────────────────────────────────┤
│ [General] [Backup] [Import] [🔥 KEV Integration] [Theme] [About]             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  CISA KEV Integration Settings                                              │
│                                                                             │
│  ┌─── Synchronization ──────────────────────────────────────────────────┐   │
│  │                                                                       │   │
│  │  ☑️ Enable automatic KEV synchronization                             │   │
│  │  🕐 Sync Schedule: [Daily at 3:00 AM Eastern ▼]                      │   │
│  │  📊 Last Sync: September 21, 2024 at 3:15 AM (Success) ✅            │   │
│  │  📈 Catalog Version: 2024.09.21 (1,234 KEVs)                        │   │
│  │                                                                       │   │
│  │  [🔄 Sync Now]  [📋 View Sync Log]  [🧪 Test Connection]             │   │
│  │                                                                       │   │
│  └───────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌─── Display Options ──────────────────────────────────────────────────┐   │
│  │                                                                       │   │
│  │  ☑️ Show KEV badges on vulnerability cards                           │   │
│  │  ☑️ Highlight KEV vulnerabilities in tables                          │   │
│  │  ☑️ Show KEV column in vulnerability table                           │   │
│  │  ☑️ Enable KEV filtering and sorting                                 │   │
│  │  ☑️ Show overdue KEV indicators                                      │   │
│  │                                                                       │   │
│  │  Badge Style: [🔥 Fire + Text ▼] [🎨 Preview]                        │   │
│  │                                                                       │   │
│  └───────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌─── Notifications ────────────────────────────────────────────────────┐   │
│  │                                                                       │   │
│  │  ☑️ Email alerts for new KEV vulnerabilities                         │   │
│  │  ☑️ Notifications for overdue KEV remediation                        │   │
│  │  📧 Email: admin@company.com                                         │   │
│  │                                                                       │   │
│  │  Alert Threshold: [All new KEVs ▼]                                   │   │
│  │  Frequency: [Daily digest ▼]                                         │   │
│  │                                                                       │   │
│  └───────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│                                                    [Cancel] [Save Settings] │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 5. KEV Detail Modal

```
KEV Detail Modal (opened from table/card):
┌─────────────────────────────────────────────────────────────────────────────┐
│ KEV Details: CVE-2024-1234                                            [ × ] │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  🔥 Known Exploited Vulnerability                                           │
│                                                                             │
│  ┌─── CISA KEV Information ─────────────────────────────────────────────┐   │
│  │                                                                       │   │
│  │  📋 Vulnerability Name: Apache HTTP Server RCE                       │   │
│  │  🏢 Vendor/Project: Apache Software Foundation                       │   │
│  │  📦 Product: HTTP Server                                             │   │
│  │  📅 Added to KEV: September 15, 2024                                 │   │
│  │  ⏰ Remediation Due: October 15, 2024 (24 days remaining)            │   │
│  │  🦠 Ransomware Use: ❌ No known ransomware campaigns                 │   │
│  │                                                                       │   │
│  │  📝 Required Action:                                                  │   │
│  │  Apply security updates per Apache security advisory                 │   │
│  │  ASA-2024-001. Upgrade to version 2.4.58 or later.                  │   │
│  │                                                                       │   │
│  │  📄 Additional Notes:                                                 │   │
│  │  Critical vulnerability being actively exploited in the wild.        │   │
│  │  Federal agencies must remediate by due date per BOD 22-01.          │   │
│  │                                                                       │   │
│  └───────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌─── HexTrackr Environment Impact ─────────────────────────────────────┐   │
│  │                                                                       │   │
│  │  🖥️ Affected Devices: 8 servers                                      │   │
│  │  📊 Severity Score: 9.8/10 Critical                                  │   │
│  │  📈 VPR Score: 9.2/10                                                │   │
│  │  👁️ First Detected: August 10, 2024                                  │   │
│  │  🔄 Last Seen: September 21, 2024                                     │   │
│  │                                                                       │   │
│  │  📍 Affected Hosts:                                                   │   │
│  │  • web-server-01.company.com                                         │   │
│  │  • web-server-02.company.com                                         │   │
│  │  • staging-web.company.com                                           │   │
│  │  • [Show all 8 hosts...]                                             │   │
│  │                                                                       │   │
│  └───────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌─── Quick Actions ────────────────────────────────────────────────────┐   │
│  │                                                                       │   │
│  │  [🎫 Create Ticket]  [📋 Export Report]  [🔗 View CISA Page]        │   │
│  │                                                                       │   │
│  │  [📧 Send Alert]     [📊 View History]   [⚙️ Track Progress]        │   │
│  │                                                                       │   │
│  └───────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│                                                              [Close Modal] │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Responsive Design Specifications

### Mobile (< 768px)

```
Mobile Vulnerability Card:
┌─────────────────────────────┐
│ CVE-2024-1234         [KEV] │
│ Critical • VPR: 9.8         │
│ Buffer overflow in driver   │
│ 15 devices affected         │
│ Due: Oct 21 (30 days)       │
│ ┌────────────┐ ┌──────────┐ │
│ │  Details   │ │  Ticket  │ │
│ └────────────┘ └──────────┘ │
└─────────────────────────────┘

Mobile Table (stacked layout):
┌─────────────────────────────┐
│ 🔥 CVE-2024-1234            │
│ Critical • KEV              │
│ Due: Oct 21, 2024           │
│ Buffer overflow             │
│ [View Details]              │
├─────────────────────────────┤
│ CVE-2024-5678               │
│ High • 8.2 VPR              │
│ XSS vulnerability           │
│ [View Details]              │
└─────────────────────────────┘
```

### Tablet (768px - 1024px)

```
Tablet Grid Layout (2 cards per row):
┌──────────────────────────┐ ┌──────────────────────────┐
│ CVE-2024-1234      [KEV] │ │ CVE-2024-5678            │
│ Critical • 9.8           │ │ High • 8.2               │
│ Buffer overflow          │ │ XSS vulnerability        │
│ 15 devices               │ │ 3 devices                │
│ Due: Oct 21              │ │ First seen: Sep 15       │
│ [Details] [Ticket]       │ │ [Details] [Ticket]       │
└──────────────────────────┘ └──────────────────────────┘
```

### Desktop (> 1024px)

Full desktop layout as shown in main mockups above.

---

## Accessibility Features

### Screen Reader Support

```html
<!-- KEV badge with proper accessibility -->
<span class="kev-badge"
      role="status"
      aria-label="Known Exploited Vulnerability - Critical Priority">
    🔥 KEV
</span>

<!-- Vulnerability card with ARIA labels -->
<div class="vulnerability-card kev"
     role="article"
     aria-labelledby="cve-title-1234"
     aria-describedby="cve-desc-1234">

    <h3 id="cve-title-1234">CVE-2024-1234</h3>
    <p id="cve-desc-1234">Buffer overflow vulnerability - Known Exploited</p>

    <!-- Remediation timeline -->
    <div role="timer" aria-label="KEV remediation deadline">
        Due: October 21, 2024 (30 days remaining)
    </div>
</div>
```

### Keyboard Navigation

```css
/* Focus indicators for KEV elements */
.kev-badge:focus,
.vulnerability-card.kev:focus,
.kev-filter-button:focus {
    outline: 3px solid #1e40af; /* Blue focus ring */
    outline-offset: 2px;
    border-radius: 4px;
}

/* High contrast mode support */
@media (prefers-contrast: high) {
    .kev-badge {
        background: #000000;
        color: #ffffff;
        border: 2px solid #ffffff;
    }

    .vulnerability-card.kev {
        border: 3px solid #ff0000;
        background: #ffffff;
    }
}
```

### Color Blindness Considerations

```css
/* Alternative indicators for color-blind users */
.kev-badge::before {
    content: "🔥 "; /* Fire emoji as shape indicator */
}

.vulnerability-card.kev::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    width: 0;
    height: 0;
    border-left: 20px solid #dc2626;
    border-bottom: 20px solid transparent;
    /* Triangle indicator */
}
```

---

## Animation & Micro-interactions

### Hover Effects

```css
.vulnerability-card.kev:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(220, 38, 38, 0.15);
    border-left-width: 6px;
    transition: all 0.3s ease-out;
}

.kev-badge:hover {
    transform: scale(1.05);
    box-shadow: 0 4px 12px rgba(220, 38, 38, 0.4);
}
```

### Loading States

```css
.kev-status-loading {
    background: linear-gradient(90deg,
        #f3f4f6 25%,
        #e5e7eb 50%,
        #f3f4f6 75%);
    background-size: 200% 100%;
    animation: shimmer 1.5s infinite;
}

@keyframes shimmer {
    0% { background-position: -200% 0; }
    100% { background-position: 200% 0; }
}
```

### Success Animations

```css
.kev-sync-success {
    animation: success-pulse 0.6s ease-out;
}

@keyframes success-pulse {
    0% { transform: scale(1); }
    50% { transform: scale(1.05); }
    100% { transform: scale(1); }
}
```

---

## Testing Requirements

### Visual Regression Tests

```javascript
// Playwright visual testing
describe('KEV Visual Components', () => {
    test('KEV badge renders correctly', async ({ page }) => {
        await page.goto('/vulnerabilities');
        await expect(page.locator('.kev-badge')).toHaveScreenshot('kev-badge.png');
    });

    test('KEV card styling', async ({ page }) => {
        await page.goto('/vulnerabilities');
        await expect(page.locator('.vulnerability-card.kev')).toHaveScreenshot('kev-card.png');
    });
});
```

### Accessibility Tests

```javascript
// Axe accessibility testing
describe('KEV Accessibility', () => {
    test('KEV components meet WCAG AA standards', async ({ page }) => {
        await page.goto('/vulnerabilities');
        const results = await page.axe();
        expect(results.violations).toHaveLength(0);
    });
});
```

### Cross-browser Testing

- **Chrome**: Latest stable
- **Firefox**: Latest stable
- **Safari**: Latest stable
- **Edge**: Latest stable
- **Mobile Safari**: iOS 15+
- **Chrome Mobile**: Android 10+

---

## Implementation Notes

### CSS Organization

```scss
// File structure for KEV styles
/app/public/styles/
├── components/
│   ├── kev-badge.css
│   ├── kev-cards.css
│   └── kev-tables.css
├── layouts/
│   └── kev-dashboard.css
└── utilities/
    └── kev-animations.css
```

### Icon Strategy

```css
/* Unicode and emoji fallbacks */
.kev-icon::before {
    content: "🔥"; /* Primary: Fire emoji */
    font-family: "Apple Color Emoji", "Segoe UI Emoji", sans-serif;
}

/* SVG fallback for better control */
.kev-icon.svg::before {
    content: "";
    background-image: url('data:image/svg+xml,<svg>...</svg>');
    width: 16px;
    height: 16px;
    display: inline-block;
}
```

### Performance Considerations

```css
/* GPU acceleration for animations */
.vulnerability-card.kev {
    will-change: transform;
    backface-visibility: hidden;
}

/* Lazy load non-critical KEV assets */
.kev-advanced-charts {
    content-visibility: auto;
    contain-intrinsic-size: 300px;
}
```

---

## Future Enhancements

### Interactive Elements
- **Drag-and-drop KEV prioritization**
- **Bulk KEV actions** (mark as patched, create tickets)
- **KEV timeline visualization** with historical data
- **Customizable KEV dashboard widgets**

### Advanced Visualizations
- **KEV heat map** by network segment
- **Remediation progress tracking** with gantt charts
- **Threat landscape comparison** with industry data
- **Predictive KEV scoring** based on environmental factors

---

**Document Information:**
- **Created**: 2025-09-21
- **Version**: 1.0
- **Status**: Planning Phase
- **Design System**: Based on HexTrackr v1.0.20 patterns
- **Accessibility Target**: WCAG 2.1 AA compliance

**Related Documents:**
- `/planning/kev-lookup-plan.md` - Main planning document
- `/planning/kev-database-schema.sql` - Database specifications
- `/planning/kev-api-specification.md` - API architecture
- `/planning/kev-test-plan.md` - Testing strategy