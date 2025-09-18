# Custom Theme Implementation Strategy for HexTrackr

## Vision

Transform HexTrackr's fragmented theme system into a centralized, user-customizable theme engine with a visual theme editor featuring live preview, color pickers for every UI element, and support for custom themes, accessibility modes, and theme sharing.

## Goals

1. **Centralize** all theme variables into a single source of truth
2. **Simplify** the CSS variable system with consistent naming
3. **Enable** user customization through a visual theme editor
4. **Support** accessibility modes (high contrast, color-blind friendly)
5. **Allow** theme import/export and sharing

## Implementation Phases

### Phase 1: Foundation (Week 1-2)
**Goal**: Create the centralized theme engine without breaking existing functionality

#### 1.1 Theme Engine Core
```javascript
// app/public/scripts/shared/theme-engine.js
class ThemeEngine {
  constructor() {
    this.themes = new Map();
    this.activeTheme = null;
    this.customThemes = new Map();
    this.loadDefaultThemes();
  }

  loadDefaultThemes() {
    // Load from theme-variables.json
    this.themes.set('light', defaultLightTheme);
    this.themes.set('dark', defaultDarkTheme);
    this.themes.set('sepia', sepiaTheme);
    this.themes.set('high-contrast', highContrastTheme);
  }

  applyTheme(themeName) {
    const theme = this.themes.get(themeName);
    if (!theme) return false;

    // Generate CSS variables
    const cssText = this.generateCSS(theme);

    // Apply to document
    this.injectCSS(cssText);

    // Update components
    this.updateComponents(theme);

    // Save preference
    this.savePreference(themeName);

    return true;
  }

  generateCSS(theme) {
    let css = ':root {\n';

    // Flatten theme object to CSS variables
    for (const [category, values] of Object.entries(theme)) {
      for (const [key, value] of Object.entries(values)) {
        css += `  ${value.css}: ${value.value};\n`;
      }
    }

    css += '}';
    return css;
  }

  updateComponents(theme) {
    // Update AG-Grid
    if (window.gridApi) {
      const gridTheme = theme.baseTheme === 'dark'
        ? 'ag-theme-quartz-dark'
        : 'ag-theme-quartz';
      window.gridApi.setGridTheme(gridTheme);
    }

    // Update ApexCharts
    if (window.chartThemeAdapter) {
      window.chartThemeAdapter.updateChartTheme(theme);
    }

    // Broadcast theme change event
    window.dispatchEvent(new CustomEvent('themeChanged', {
      detail: theme
    }));
  }
}
```

#### 1.2 Variable Consolidation
- Create mapping from old variables to new system
- Write migration script to update all CSS files
- Test thoroughly in both light and dark modes

### Phase 2: Theme Editor UI (Week 3-4)
**Goal**: Build the visual theme customization interface

#### 2.1 Settings Modal Enhancement
```html
<!-- Add to Settings Modal -->
<div class="tab-pane" id="theme-customization">
  <div class="row">
    <!-- Live Preview Panel -->
    <div class="col-md-6">
      <div class="theme-preview-panel">
        <iframe id="theme-preview" src="/theme-preview.html"></iframe>
      </div>
    </div>

    <!-- Color Picker Controls -->
    <div class="col-md-6">
      <div class="theme-controls">
        <!-- Brand Colors -->
        <div class="color-group">
          <h5>Brand Colors</h5>
          <div class="color-control">
            <label>Primary</label>
            <input type="color" id="color-primary" />
            <input type="text" id="hex-primary" />
          </div>
          <!-- Repeat for other brand colors -->
        </div>

        <!-- Surface Hierarchy -->
        <div class="color-group">
          <h5>Surface Layers</h5>
          <div class="surface-visualizer">
            <!-- Visual representation of surface stack -->
          </div>
          <div class="color-control">
            <label>Base (Level 0)</label>
            <input type="color" id="surface-base" />
          </div>
          <!-- Repeat for surface levels 1-4 -->
        </div>

        <!-- VPR Severity Colors -->
        <div class="color-group">
          <h5>Severity Indicators</h5>
          <!-- Color pickers for Critical, High, Medium, Low -->
        </div>
      </div>
    </div>
  </div>

  <!-- Theme Actions -->
  <div class="theme-actions">
    <button id="save-theme">Save as Custom Theme</button>
    <button id="export-theme">Export Theme</button>
    <button id="import-theme">Import Theme</button>
    <button id="reset-theme">Reset to Default</button>
  </div>
</div>
```

#### 2.2 Theme Preview Component
```javascript
// app/public/scripts/shared/theme-preview.js
class ThemePreview {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.setupPreviewElements();
  }

  setupPreviewElements() {
    // Create mini versions of all UI components
    this.createHeader();
    this.createStatCards();
    this.createTable();
    this.createChart();
    this.createModal();
  }

  updatePreview(themeChanges) {
    // Apply changes in real-time
    for (const [variable, value] of Object.entries(themeChanges)) {
      this.container.style.setProperty(variable, value);
    }
  }

  createStatCards() {
    const html = `
      <div class="preview-stat-cards">
        <div class="stat-card" style="background: var(--hextrackr-surface-1)">
          <span style="color: var(--vpr-critical)">Critical: 125</span>
        </div>
        <div class="stat-card" style="background: var(--hextrackr-surface-1)">
          <span style="color: var(--vpr-high)">High: 342</span>
        </div>
        <!-- More stat cards -->
      </div>
    `;
    this.container.insertAdjacentHTML('beforeend', html);
  }
}
```

### Phase 3: Custom Theme Management (Week 5)
**Goal**: Implement theme persistence, import/export, and sharing

#### 3.1 Theme Storage Service
```javascript
// app/services/themeStorageService.js
class ThemeStorageService {
  constructor(db) {
    this.db = db;
    this.initializeSchema();
  }

  async initializeSchema() {
    await this.db.run(`
      CREATE TABLE IF NOT EXISTS custom_themes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT UNIQUE NOT NULL,
        description TEXT,
        base_theme TEXT NOT NULL,
        theme_data JSON NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        is_active BOOLEAN DEFAULT 0,
        share_code TEXT UNIQUE
      )
    `);
  }

  async saveTheme(theme) {
    const shareCode = this.generateShareCode();

    const sql = `
      INSERT OR REPLACE INTO custom_themes
      (name, description, base_theme, theme_data, share_code)
      VALUES (?, ?, ?, ?, ?)
    `;

    return this.db.run(sql, [
      theme.name,
      theme.description,
      theme.baseTheme,
      JSON.stringify(theme.colors),
      shareCode
    ]);
  }

  async exportTheme(themeId) {
    const theme = await this.getTheme(themeId);

    return {
      version: '1.0.0',
      name: theme.name,
      description: theme.description,
      baseTheme: theme.base_theme,
      colors: JSON.parse(theme.theme_data),
      exportDate: new Date().toISOString()
    };
  }

  async importTheme(themeData) {
    // Validate theme structure
    if (!this.validateTheme(themeData)) {
      throw new Error('Invalid theme format');
    }

    // Check for conflicts
    const existing = await this.findByName(themeData.name);
    if (existing) {
      themeData.name += ' (Imported)';
    }

    return this.saveTheme(themeData);
  }

  generateShareCode() {
    return Math.random().toString(36).substring(2, 15);
  }
}
```

#### 3.2 Theme Sharing API
```javascript
// app/routes/themes.js
router.get('/api/themes/shared/:shareCode', async (req, res) => {
  try {
    const theme = await themeService.getByShareCode(req.params.shareCode);
    if (!theme) {
      return res.status(404).json({ error: 'Theme not found' });
    }
    res.json({ success: true, theme });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/api/themes/custom', async (req, res) => {
  try {
    const themeId = await themeService.saveTheme(req.body);
    res.json({ success: true, id: themeId });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

### Phase 4: Accessibility Modes (Week 6)
**Goal**: Implement specialized themes for accessibility

#### 4.1 Sepia Mode
```javascript
const sepiaTheme = {
  name: 'Sepia',
  baseTheme: 'light',
  filters: {
    sepia: 0.8,
    brightness: 0.95,
    contrast: 0.85
  },
  colors: {
    surfaces: {
      base: '#f4f1e8',
      surface1: '#faf8f3',
      surface2: '#f0ede4',
      surface3: '#ebe7dc',
      surface4: '#e6e1d3'
    },
    text: {
      body: '#5c4033',
      emphasis: '#3e2723',
      secondary: '#795548',
      tertiary: '#8d6e63'
    },
    brand: {
      primary: '#8b6914',
      secondary: '#6b5d54',
      success: '#5d8b3a',
      warning: '#cc7722',
      danger: '#aa4444',
      info: '#5588aa'
    }
  }
};
```

#### 4.2 High Contrast Mode
```javascript
const highContrastTheme = {
  name: 'High Contrast',
  baseTheme: 'dark',
  wcagLevel: 'AAA',
  colors: {
    surfaces: {
      base: '#000000',
      surface1: '#ffffff',
      surface2: '#000000',
      surface3: '#ffffff',
      surface4: '#000000'
    },
    text: {
      body: '#ffffff',
      emphasis: '#ffff00',
      secondary: '#00ffff',
      tertiary: '#ff00ff'
    },
    borders: {
      subtle: '#ffffff',
      muted: '#ffffff',
      strong: '#ffff00'
    }
  }
};
```

#### 4.3 Color-Blind Modes
```javascript
// Deuteranopia (Red-Green Color Blindness)
const deuteranopiaTheme = {
  name: 'Deuteranopia Friendly',
  baseTheme: 'light',
  colorMapping: {
    // Remap problematic colors
    red: '#0066cc',    // Blue instead of red
    green: '#117733',  // Darker green
    orange: '#ff9900', // Keep orange
    blue: '#0066cc'    // Keep blue
  },
  vpr: {
    critical: '#0066cc',  // Blue
    high: '#ff9900',      // Orange
    medium: '#663399',    // Purple
    low: '#117733'        // Dark green
  }
};

// Protanopia (Red-Green Color Blindness Variant)
const protanopiaTheme = {
  name: 'Protanopia Friendly',
  baseTheme: 'light',
  colorMapping: {
    red: '#0066cc',    // Blue
    green: '#117733',  // Dark green
    orange: '#ffcc00', // Yellow-orange
    blue: '#0066cc'    // Blue
  }
};
```

### Phase 5: Advanced Features (Week 7-8)
**Goal**: Implement advanced customization and optimization

#### 5.1 Theme Interpolation
```javascript
class ThemeInterpolator {
  // Create smooth transitions between themes
  interpolate(themeA, themeB, progress) {
    const interpolated = {};

    for (const [key, valueA] of Object.entries(themeA.colors)) {
      const valueB = themeB.colors[key];
      interpolated[key] = this.interpolateColor(valueA, valueB, progress);
    }

    return interpolated;
  }

  interpolateColor(colorA, colorB, progress) {
    const rgbA = this.hexToRgb(colorA);
    const rgbB = this.hexToRgb(colorB);

    const r = Math.round(rgbA.r + (rgbB.r - rgbA.r) * progress);
    const g = Math.round(rgbA.g + (rgbB.g - rgbA.g) * progress);
    const b = Math.round(rgbA.b + (rgbB.b - rgbA.b) * progress);

    return this.rgbToHex(r, g, b);
  }
}
```

#### 5.2 Theme Validation
```javascript
class ThemeValidator {
  validate(theme) {
    const errors = [];

    // Check color contrast ratios
    this.validateContrast(theme, errors);

    // Check color relationships
    this.validateHierarchy(theme, errors);

    // Check accessibility
    this.validateAccessibility(theme, errors);

    return {
      valid: errors.length === 0,
      errors
    };
  }

  validateContrast(theme, errors) {
    // Check text against backgrounds
    const textColor = theme.text.body;
    const background = theme.surfaces.base;

    const ratio = this.getContrastRatio(textColor, background);
    if (ratio < 4.5) {
      errors.push({
        type: 'contrast',
        message: `Text contrast ratio ${ratio} is below WCAG AA minimum of 4.5`,
        elements: ['text.body', 'surfaces.base']
      });
    }
  }

  getContrastRatio(color1, color2) {
    // Calculate WCAG contrast ratio
    const l1 = this.getLuminance(color1);
    const l2 = this.getLuminance(color2);

    const lighter = Math.max(l1, l2);
    const darker = Math.min(l1, l2);

    return (lighter + 0.05) / (darker + 0.05);
  }
}
```

## Migration Plan

### Step 1: Audit Current Usage (Day 1-2)
```bash
# Find all CSS variable usage
grep -r "--hextrackr-\|--bs-\|--vpr-\|--chart-\|--ag-" app/public/

# Generate migration map
node scripts/generate-theme-migration-map.js
```

### Step 2: Create Compatibility Layer (Day 3-4)
```css
/* theme-compatibility.css */
/* Map old variables to new system */
:root {
  /* Old → New mappings */
  --hextrackr-primary: var(--theme-brand-primary);
  --bs-primary: var(--theme-brand-primary);
  --tblr-primary: var(--theme-brand-primary);
  /* ... continue for all variables */
}
```

### Step 3: Update Components (Day 5-7)
- Update one component at a time
- Test in both light and dark modes
- Verify no visual regressions

### Step 4: Remove Old System (Day 8)
- Delete old theme CSS files
- Remove compatibility layer
- Update documentation

## Testing Strategy

### Unit Tests
```javascript
describe('ThemeEngine', () => {
  test('applies theme correctly', () => {
    const engine = new ThemeEngine();
    engine.applyTheme('dark');

    const computed = getComputedStyle(document.documentElement);
    expect(computed.getPropertyValue('--theme-brand-primary'))
      .toBe('#2563eb');
  });

  test('validates contrast ratios', () => {
    const validator = new ThemeValidator();
    const result = validator.validate(customTheme);

    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });
});
```

### Visual Regression Tests
```javascript
test('theme consistency', async ({ page }) => {
  await page.goto('/vulnerabilities');

  // Apply each theme and screenshot
  for (const theme of ['light', 'dark', 'sepia']) {
    await page.evaluate((t) => {
      window.themeEngine.applyTheme(t);
    }, theme);

    await page.screenshot({
      path: `test-results/theme-${theme}.png`
    });
  }
});
```

## Performance Considerations

### CSS Variable Performance
- Limit CSS variable depth (max 3 levels)
- Cache computed values in JavaScript
- Use CSS containment for theme transitions

### Theme Loading
- Lazy load theme data
- Preload user's preferred theme
- Use service worker for theme caching

### Runtime Updates
- Batch CSS variable updates
- Debounce color picker changes
- Use requestAnimationFrame for smooth transitions

## Success Metrics

1. **Centralization**: 100% of theme variables in single system
2. **Performance**: Theme switch < 50ms
3. **Accessibility**: All themes pass WCAG AA
4. **Customization**: Users can customize 100% of colors
5. **Adoption**: 25% of users create custom themes

## Rollout Plan

### Beta Phase (Week 9)
- Enable for 10% of users
- Collect feedback
- Fix issues

### General Availability (Week 10)
- Enable for all users
- Provide migration guide
- Support custom themes

## Future Enhancements

1. **AI-Powered Themes**: Generate themes from images
2. **Seasonal Themes**: Auto-switch based on time/season
3. **Team Themes**: Share themes within organizations
4. **Theme Marketplace**: Community theme sharing
5. **Dynamic Themes**: Change based on data (red for high alerts)

---

*Generated: 2025-09-17 | Version: 1.0.0*