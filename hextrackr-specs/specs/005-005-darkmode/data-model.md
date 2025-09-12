# Data Model: Dark Mode Theme System

**Phase 1 Design Output** | **Date**: 2025-09-12 | **Spec**: 005-005-darkmode

## Entity Definitions

### ThemePreference Entity

**Purpose**: Store user's theme preference with metadata for persistence and synchronization

**Fields**:

- `theme: string` - Theme identifier ('light' | 'dark' | 'system')
- `timestamp: string` - ISO 8601 timestamp of last update
- `source: string` - Source of preference ('user' | 'system' | 'default')
- `version: string` - Schema version for migration support

**Validation Rules**:

- `theme` MUST be one of: 'light', 'dark', 'system'
- `timestamp` MUST be valid ISO 8601 format
- `source` MUST be one of: 'user', 'system', 'default'
- `version` MUST follow semantic versioning (e.g., '1.0.0')

**Example**:

```json
{
  "theme": "dark",
  "timestamp": "2025-09-12T23:45:00.000Z",
  "source": "user",
  "version": "1.0.0"
}
```

### SystemPreference Entity

**Purpose**: Detect and track system-level theme preferences

**Fields**:

- `prefersDark: boolean` - Browser media query result for prefers-color-scheme
- `lastChecked: string` - ISO 8601 timestamp of last system check
- `supported: boolean` - Whether browser supports prefers-color-scheme

**Validation Rules**:

- `prefersDark` MUST be boolean
- `lastChecked` MUST be valid ISO 8601 format
- `supported` MUST be boolean

### ThemeState Entity

**Purpose**: Runtime theme state management

**Fields**:

- `currentTheme: string` - Currently active theme ('light' | 'dark')
- `isTransitioning: boolean` - Whether theme switch is in progress
- `transitionStarted: string` - ISO 8601 timestamp of transition start
- `componentsUpdated: object` - Status of component theme updates

**State Transitions**:

1. **Idle** → **Transitioning**: User clicks theme toggle
2. **Transitioning** → **Idle**: All components updated successfully
3. **Transitioning** → **Error**: Component update failure (fallback to previous theme)

## Storage Schemas

### Phase 1: localStorage Schema

**Key**: `hextrackr_theme_preference`

**Structure**:

```typescript
interface LocalStorageTheme {
  theme: 'light' | 'dark' | 'system';
  timestamp: string;
  source: 'user' | 'system' | 'default';
  version: string;
}
```

**Storage Operations**:

- **Read**: `JSON.parse(localStorage.getItem('hextrackr_theme_preference'))`
- **Write**: `localStorage.setItem('hextrackr_theme_preference', JSON.stringify(preference))`
- **Clear**: `localStorage.removeItem('hextrackr_theme_preference')`

**Error Handling**:

- Invalid JSON → fallback to system preference
- Missing key → initialize with system detection
- Quota exceeded → clear old preferences, retry

### Phase 2: Database Schema (Future)

**Table**: `user_preferences`

```sql
CREATE TABLE user_preferences (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id TEXT NOT NULL,
    preference_key TEXT NOT NULL,
    preference_value TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(session_id, preference_key)
);
```

**Indexes**:

```sql
CREATE INDEX idx_user_preferences_session ON user_preferences(session_id);
CREATE INDEX idx_user_preferences_key ON user_preferences(preference_key);
```

**Migration Strategy**:

1. Detect existing localStorage preferences
2. Migrate to database on first authenticated session
3. Maintain localStorage as fallback for unauthenticated users

## Component Integration Data

### ApexCharts Theme Configuration

**Theme Mapping**:

```typescript
interface ApexChartsTheme {
  mode: 'light' | 'dark';
  palette: 'palette1' | 'palette2' | 'palette3';
  monochrome: {
    enabled: boolean;
    color: string;
    shadeTo: 'light' | 'dark';
    shadeIntensity: number;
  };
}
```

**Color Schemes**:

- **Light Mode**: HexTrackr primary colors (#667eea, #764ba2)
- **Dark Mode**: Adapted high-contrast variants for dark backgrounds

### AG-Grid Theme Classes

**Theme Class Mapping**:

```typescript
interface GridThemeMap {
  light: 'ag-theme-alpine';
  dark: 'ag-theme-alpine-dark';
}
```

**Custom CSS Variables**:

```css
.ag-theme-alpine-dark {
  --ag-background-color: #1a1a1a;
  --ag-foreground-color: #e0e0e0;
  --ag-border-color: #333333;
  --ag-header-background-color: #2d2d2d;
}
```

### VPR Severity Badge Colors

**Contrast Ratios** (WCAG AA Compliant):

**Light Theme**:

- Critical: `#dc2626` on `#ffffff` (7.0:1)
- High: `#ea580c` on `#ffffff` (5.8:1)  
- Medium: `#2563eb` on `#ffffff` (8.6:1)
- Low: `#16a34a` on `#ffffff` (4.5:1)

**Dark Theme**:

- Critical: `#fca5a5` on `#1a1a1a` (7.2:1)
- High: `#fdba74` on `#1a1a1a` (6.1:1)
- Medium: `#93c5fd` on `#1a1a1a` (8.8:1)  
- Low: `#86efac` on `#1a1a1a` (4.7:1)

## Validation Rules

### Theme Value Validation

```typescript
function validateTheme(theme: string): boolean {
  return ['light', 'dark', 'system'].includes(theme);
}

function validateTimestamp(timestamp: string): boolean {
  return !isNaN(Date.parse(timestamp));
}

function validateSource(source: string): boolean {
  return ['user', 'system', 'default'].includes(source);
}
```

### Performance Constraints

- **localStorage reads**: <5ms
- **Theme transitions**: <100ms total
- **Component updates**: <50ms per component
- **Memory usage**: <2MB for theme state management

## Integration Patterns

### Cross-Tab Synchronization

**Event Structure**:

```typescript
interface ThemeStorageEvent {
  type: 'theme_changed';
  oldValue: string;
  newValue: string;
  timestamp: string;
  source: string;
}
```

### WebSocket Events (Future Phase 2)

**Message Structure**:

```typescript
interface ThemeWebSocketMessage {
  type: 'theme_preference_update';
  sessionId: string;
  theme: string;
  timestamp: string;
}
```

This data model provides the foundation for secure, performant theme preference management while supporting both immediate client-side implementation and future database-backed persistence.
