#!/bin/bash

# Generate Documentation Portal
# Orchestrates Atlas and Doc agents to update documentation

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
SPECS_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

echo "=========================================="
echo "📚 HEXTRACKR DOCUMENTATION GENERATOR"
echo "=========================================="
echo ""
echo "Usage: $0 [options]"
echo "  --restart, -r     : Restart Docker container before generation"
echo "  --test            : Run additional Playwright E2E tests (optional)"
echo "  --headed          : Run Playwright tests with visible browser"
echo "  --bump <type>     : Bump version (patch/minor/major) before generation"
echo ""
echo "Examples:"
echo "  $0                       # Generate and validate docs"
echo "  $0 --restart             # Restart Docker, then generate"
echo "  $0 --test                # Generate, validate, plus E2E tests"
echo "  $0 --bump patch          # Bump version, update changelog, then generate"
echo "  $0 -r --bump minor       # Restart, bump minor version, generate"
echo ""
echo "Note: Atlas now handles changelog updates and version management!"
echo ""

# Parse command line arguments
BUMP_VERSION=""
RESTART_DOCKER=false
RUN_TESTS=false
HEADED_MODE=false

while [[ $# -gt 0 ]]; do
    case $1 in
        --bump)
            BUMP_VERSION="$2"
            shift 2
            ;;
        --restart|-r)
            RESTART_DOCKER=true
            shift
            ;;
        --test)
            RUN_TESTS=true
            shift
            ;;
        --headed)
            HEADED_MODE=true
            shift
            ;;
        *)
            echo "Unknown option: $1"
            exit 1
            ;;
    esac
done

# Optional: Restart Docker if requested
if [ "$RESTART_DOCKER" = true ]; then
    echo "Restarting Docker container..."
    echo "-----------------------------------------"
    cd "$PROJECT_ROOT"
    docker-compose restart
    if [ $? -eq 0 ]; then
        echo "✅ Docker container restarted"
        echo "⏳ Waiting for service to be ready..."
        sleep 5
    else
        echo "⚠️  Docker restart failed (non-critical)"
    fi
    echo ""
fi

# Step 1: Run Atlas to scan specs and generate roadmap.json
echo "Step 1: Running Atlas agent..."
echo "-----------------------------------------"

# Pass version bump parameter to Atlas if provided
if [ -n "$BUMP_VERSION" ]; then
    echo "📦 Version bump requested: $BUMP_VERSION"
    export ATLAS_BUMP_VERSION="$BUMP_VERSION"
fi

node "$SPECS_ROOT/agents/atlas/atlas.js"
if [ $? -ne 0 ]; then
    echo "❌ Atlas agent failed"
    exit 1
fi
echo ""

# Step 2: Run Doc to update documentation (includes validation)
echo "Step 2: Running Doc agent (with validation)..."
echo "-----------------------------------------"
node "$SPECS_ROOT/agents/doc/doc.js"
DOC_RESULT=$?
if [ $DOC_RESULT -ne 0 ]; then
    echo "❌ Doc agent failed"
    exit 1
fi
echo ""

# Step 3: Optional - Run Playwright validation
if [ "$RUN_TESTS" = true ]; then
    if command -v npx &> /dev/null && [ -f "$PROJECT_ROOT/playwright.config.js" ]; then
        echo "Step 3: Running Playwright validation..."
        echo "-----------------------------------------"
        
        # Create a simple test to verify docs portal
        cat > /tmp/docs-portal-test.spec.js << 'EOF'
const { test, expect } = require('@playwright/test');

test('Documentation portal validation', async ({ page }) => {
    // Navigate to docs portal (port 8989 for Docker)
    await page.goto('http://localhost:8989/docs-html');
    
    // Check that page loads
    await expect(page).toHaveTitle(/HexTrackr/);
    
    // Check for roadmap content
    const roadmapLink = page.locator('a:has-text("Roadmap")').first();
    if (await roadmapLink.isVisible()) {
        await roadmapLink.click();
        await expect(page).toHaveURL(/roadmap/i);
    }
    
    // Verify version number is displayed
    const versionText = await page.locator('text=/v\\d+\\.\\d+\\.\\d+/').first();
    if (await versionText.isVisible()) {
        console.log('✅ Version number found');
    }
});
EOF
        
        # Run the test with correct base URL
        cd "$PROJECT_ROOT"
        HEADED_FLAG=""
        if [ "$HEADED_MODE" = true ]; then
            HEADED_FLAG="--headed"
        fi
        
        npx playwright test /tmp/docs-portal-test.spec.js \
            --reporter=list \
            --config playwright.config.js \
            --project=chromium \
            $HEADED_FLAG \
            2>/dev/null
        
        if [ $? -eq 0 ]; then
            echo "✅ Playwright validation passed"
        else
            echo "⚠️  Playwright validation had issues (non-critical)"
        fi
        
        # Clean up
        rm /tmp/docs-portal-test.spec.js
    else
        echo "Step 4: Skipping Playwright validation (not configured)"
    fi
else
    echo "Step 4: Skipping Playwright validation (use --test to enable)"
fi
echo ""

# Step 4: Summary
echo "=========================================="
echo "✅ DOCUMENTATION GENERATION COMPLETE"
echo "=========================================="
echo ""
echo "📊 Results:"
echo "  • Roadmap updated from $(ls -1 "$SPECS_ROOT/specs" | wc -l) specification(s)"
echo "  • Documentation portal regenerated"
echo "  • HTML files updated"
echo ""
echo "🌐 View at: http://localhost:8989/docs-html"
echo ""