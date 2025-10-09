# Customizing HexTrackr for Your Brand

This guide shows you how to customize HexTrackr's appearance to match your organization's branding—colors, styling, and basic visual elements.

---

## Quick Start: Change Your Brand Colors

The easiest way to customize HexTrackr is to override a few key color variables. Create a custom CSS file and override these CSS variables:

### Step 1: Create Your Custom CSS File

Create a new file at `app/public/styles/custom-branding.css`:

```css
/* custom-branding.css - Your organization's brand overrides */

:root {
  /* Primary brand color (links, buttons, accents) */
  --hextrackr-primary: #0066cc;  /* Replace with your brand color */

  /* Accent colors for interactive elements */
  --hextrackr-accent: #0052a3;

  /* Success color (completed items, positive indicators) */
  --hextrackr-success: #00a86b;

  /* Warning color (medium priority items) */
  --hextrackr-warning: #f59e0b;

  /* Danger color (critical items, errors) */
  --hextrackr-danger: #dc2626;
}
```

### Step 2: Link Your Custom CSS

Add this line to the `<head>` section of each HTML page **after** the existing stylesheet links:

```html
<!-- Your custom branding (add this line last) -->
<link rel="stylesheet" href="styles/custom-branding.css">
```

Pages to update:
- `app/public/vulnerabilities.html`
- `app/public/tickets.html`
- `app/public/index.html`

---

## Available Customization Options

### Background Colors

Control the overall page background and surface colors:

```css
:root {
  /* Main page background */
  --hextrackr-bg-primary: #f8f9fa;

  /* Secondary background areas */
  --hextrackr-bg-secondary: #e9ecef;

  /* Card and modal backgrounds */
  --hextrackr-surface-base: #ffffff;
}

/* Dark theme overrides */
[data-bs-theme="dark"] {
  --hextrackr-bg-primary: #1a1d23;
  --hextrackr-bg-secondary: #23272f;
  --hextrackr-surface-base: #2d3139;
}
```

### Text Colors

Customize text colors for readability:

```css
:root {
  /* Primary text color */
  --hextrackr-text-primary: #2d3748;

  /* Secondary text (labels, descriptions) */
  --hextrackr-text-secondary: #64748b;

  /* Muted text (placeholders, disabled) */
  --hextrackr-text-muted: #94a3b8;
}

[data-bs-theme="dark"] {
  --hextrackr-text-primary: #e2e8f0;
  --hextrackr-text-secondary: #cbd5e1;
  --hextrackr-text-muted: #94a3b8;
}
```

### Vulnerability Severity Colors

Customize the colors for vulnerability risk levels:

```css
:root {
  /* Critical vulnerabilities */
  --vpr-critical: #dc2626;

  /* High severity */
  --vpr-high: #f97316;

  /* Medium severity */
  --vpr-medium: #f59e0b;

  /* Low severity */
  --vpr-low: #3b82f6;

  /* Informational */
  --vpr-info: #64748b;
}
```

### Border and Divider Colors

Subtle border customization:

```css
:root {
  /* Standard borders */
  --hextrackr-border-color: #e2e8f0;

  /* Light borders (subtle dividers) */
  --hextrackr-border-light: #f1f5f9;
}

[data-bs-theme="dark"] {
  --hextrackr-border-color: #3d4451;
  --hextrackr-border-light: #2d3139;
}
```

---

## Complete Branding Example

Here's a complete example for a company with blue/orange branding:

```css
/* custom-branding.css - Acme Corp branding */

:root {
  /* Acme Corp primary blue */
  --hextrackr-primary: #0052a3;
  --hextrackr-accent: #003d7a;

  /* Acme Corp orange accent */
  --hextrackr-warning: #ff6b35;

  /* Keep standard success/danger colors */
  --hextrackr-success: #00a86b;
  --hextrackr-danger: #dc2626;

  /* Slightly warmer backgrounds */
  --hextrackr-bg-primary: #fafbfc;
  --hextrackr-surface-base: #ffffff;
}

/* Acme Corp dark theme */
[data-bs-theme="dark"] {
  --hextrackr-primary: #4a9eff;
  --hextrackr-accent: #2d7dd2;
  --hextrackr-warning: #ff8c5a;
}
```

---

## Custom Logo

To replace the HexTrackr logo with your organization's logo:

### Step 1: Prepare Your Logo

- **File format**: SVG recommended (scales perfectly), PNG also works
- **Dimensions**: 180px width × 40px height (approximate)
- **Background**: Transparent
- **File name**: `custom-logo.svg` or `custom-logo.png`

### Step 2: Add Logo File

Place your logo file in:
```
app/public/assets/images/custom-logo.svg
```

### Step 3: Update Header

In your `custom-branding.css` file, add:

```css
/* Replace HexTrackr logo with custom logo */
.navbar-brand img {
  content: url('/assets/images/custom-logo.svg');
  height: 40px;
  width: auto;
}
```

---

## Custom Fonts

To use your organization's brand font:

### Step 1: Add Font Files

Place your font files (WOFF2 recommended) in:
```
app/public/assets/fonts/YourBrandFont.woff2
```

### Step 2: Define Font Face

In `custom-branding.css`:

```css
/* Define your brand font */
@font-face {
  font-family: 'YourBrandFont';
  src: url('/assets/fonts/YourBrandFont.woff2') format('woff2');
  font-weight: normal;
  font-style: normal;
  font-display: swap;
}

/* Apply to all text */
:root {
  --hextrackr-font-family: 'YourBrandFont', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}

body {
  font-family: var(--hextrackr-font-family);
}
```

---

## Advanced: Custom Component Styling

For more specific customizations, you can target individual components:

### Custom Card Styling

```css
/* Customize vulnerability cards */
.device-card {
  border-left: 4px solid var(--hextrackr-primary);
  border-radius: 8px;
}

.device-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}
```

### Custom Button Styling

```css
/* Customize primary buttons */
.btn-primary {
  background: var(--hextrackr-primary);
  border-color: var(--hextrackr-primary);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.btn-primary:hover {
  background: var(--hextrackr-accent);
  border-color: var(--hextrackr-accent);
}
```

### Custom Badge Styling

```css
/* Customize severity badges */
.badge.severity-critical {
  background: var(--vpr-critical);
  font-weight: 600;
  padding: 0.35rem 0.65rem;
}

.badge.severity-high {
  background: var(--vpr-high);
  font-weight: 600;
  padding: 0.35rem 0.65rem;
}
```

---

## Testing Your Customizations

After making changes:

1. **Clear browser cache**: Hard refresh with `Cmd+Shift+R` (Mac) or `Ctrl+Shift+R` (Windows)
2. **Test both themes**: Toggle between light and dark mode to ensure colors work in both
3. **Check readability**: Ensure text remains readable on all backgrounds
4. **Test all pages**: Verify customizations work on vulnerabilities, tickets, and other pages

---

## Troubleshooting

### My changes aren't appearing

- **Clear browser cache** with hard refresh
- **Check CSS file path** - ensure `custom-branding.css` is in `/styles/` directory
- **Verify HTML link** - ensure `<link>` tag is **after** existing stylesheets
- **Check browser console** - look for CSS file loading errors

### Colors look wrong in dark mode

- **Add dark theme overrides** using `[data-bs-theme="dark"]` selector
- **Test contrast** - dark backgrounds need lighter colors, light backgrounds need darker colors

### Logo appears stretched or distorted

- **Check logo dimensions** - should be approximately 180px × 40px
- **Use `width: auto` and `height: 40px`** in CSS to maintain aspect ratio
- **Use SVG format** for best scaling results

### Fonts not loading

- **Check font file path** - ensure correct path to `/assets/fonts/`
- **Use WOFF2 format** for best browser support
- **Add font fallbacks** - always include system fonts as backup

---

## Best Practices

✅ **Always use CSS variables** for colors - enables proper theme switching
✅ **Test in both light and dark themes** - ensure readability in both modes
✅ **Keep backups** of your `custom-branding.css` file
✅ **Document your changes** with CSS comments
✅ **Use web-safe fonts** or include font files with proper licensing

❌ **Avoid hardcoding colors** (like `background: #ffffff`) - breaks theme switching
❌ **Don't modify core HexTrackr CSS files** - use custom overrides instead
❌ **Don't use `!important` unless absolutely necessary** - causes maintenance issues

---

## Getting Help

If you need assistance with customizations:

- Review the [User Guide](user-guide.md) for feature documentation
- Check the [Getting Started Guide](getting-started.md) for installation help
- Refer to CSS variable definitions in `app/public/styles/css-variables.css`

---

*Last Updated: 2025-10-09 | Version 1.0.54*
