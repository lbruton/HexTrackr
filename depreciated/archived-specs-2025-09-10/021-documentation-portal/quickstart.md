# Documentation Portal Spec-Kit Integration - Testing Guide

**Spec**: 022-documentation-portal-spec-kit-integration  
**Created**: 2025-09-10  
**Purpose**: Manual validation and testing procedures

## Quick Validation Checklist

### 1. Portal Generation

- [ ] Run `npm run docs:generate` completes without errors
- [ ] Generation time < 2 seconds
- [ ] All markdown files converted to HTML
- [ ] No orphaned HTML files reported

### 2. Active Spec Display

- [ ] Active spec banner appears on all documentation pages
- [ ] Banner shows correct spec from `.active-spec` file
- [ ] Banner styling matches alert-info Bootstrap class

### 3. ROADMAP Integration

- [ ] ROADMAP.md shows active specifications table
- [ ] Spec progress percentages calculated correctly
- [ ] Pending tasks displayed in "Next Tasks" column
- [ ] Priority indicators (⚪ NORM, 🔴 HIGH, etc.) visible

### 4. Footer Version

- [ ] Footer badge shows current version (v1.0.12)
- [ ] Version dynamically fetched from CHANGELOG
- [ ] No console errors related to version fetching

### 5. Navigation

- [ ] All documentation sections accessible
- [ ] Special pages (ROADMAP, CHANGELOG) load correctly
- [ ] No broken links or 404 errors

## Testing Commands

```bash
# 1. Sync specifications to ROADMAP
npm run docs:sync-specs

# 2. Generate documentation
npm run docs:generate

# 3. Full pipeline (sync + generate)
npm run docs:sync-all

# 4. Start server and test
docker-compose up -d
# Visit http://localhost:8989/docs-html/
```

## Browser Testing

### Chrome/Edge

- [ ] Portal loads correctly
- [ ] Active spec banner visible
- [ ] Footer version displays
- [ ] Navigation works

### Firefox

- [ ] Portal loads correctly
- [ ] Active spec banner visible
- [ ] Footer version displays
- [ ] Navigation works

### Safari

- [ ] Portal loads correctly
- [ ] Active spec banner visible
- [ ] Footer version displays
- [ ] Navigation works

## Performance Benchmarks

| Metric | Target | Actual |
|--------|--------|--------|
| Generation Time | < 2s | ~1.8s |
| Page Load | < 500ms | ~300ms |
| Spec Sync | < 1s | ~0.5s |
| Total Files | 34+ | 34 |

## Common Issues & Solutions

### Issue: Active spec not showing

**Solution**: Check `.active-spec` file exists and contains valid spec ID

### Issue: Footer shows v0.0.0

**Solution**: Ensure CHANGELOG.html is generated and accessible

### Issue: ROADMAP not updating

**Solution**: Run `npm run docs:sync-specs` before generation

### Issue: Generation errors

**Solution**: Check package.json exists in app/public/ directory

## Success Criteria

✅ **Portal Generation**: Completes in < 2 seconds  
✅ **Spec Integration**: Active spec displayed on all pages  
✅ **ROADMAP Sync**: All specs with progress shown  
✅ **Footer Version**: Dynamic version from CHANGELOG  
✅ **Zero Errors**: No console errors during operation  
✅ **Cross-Browser**: Works in Chrome, Firefox, Safari  

## Manual Test Scenarios

### Scenario 1: Change Active Spec

1. Edit `.active-spec` file
2. Run `npm run docs:generate`
3. Verify new spec shown in banner

### Scenario 2: Update Spec Tasks

1. Edit a spec's tasks.md file
2. Run `npm run docs:sync-all`
3. Verify ROADMAP shows updated progress

### Scenario 3: Version Update

1. Edit CHANGELOG.md with new version
2. Run `npm run docs:generate`
3. Verify footer shows new version

## Automated Testing (Future)

```javascript
// Placeholder for future Playwright tests
describe('Documentation Portal', () => {
  test('Active spec banner displays', async ({ page }) => {
    await page.goto('http://localhost:8989/docs-html/');
    const banner = await page.locator('.alert-info');
    await expect(banner).toContainText('Active Specification');
  });
  
  test('Footer version matches CHANGELOG', async ({ page }) => {
    await page.goto('http://localhost:8989/docs-html/');
    const badge = await page.locator('img[alt="HexTrackr Version"]');
    await expect(badge).toHaveAttribute('src', /v1\.0\.12/);
  });
});
```

## Validation Complete

When all checklist items pass, spec 022 can be marked complete.
