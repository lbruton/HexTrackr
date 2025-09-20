#!/bin/bash
# Script to apply JSDoc comments to all JavaScript files
# Generated from Gemini analysis

echo "🔧 Applying JSDoc comments to HexTrackr codebase..."
echo "================================================"

# Track progress
TOTAL_FILES=0
UPDATED_FILES=0

# Function to check if file needs JSDoc
needs_jsdoc() {
    local file=$1
    local count=$(grep -c "@param\|@returns\|@throws\|@description" "$file" 2>/dev/null || echo "0")
    if [ "$count" -lt 5 ]; then
        return 0  # needs JSDoc
    else
        return 1  # already has JSDoc
    fi
}

# Controllers that need JSDoc
echo "📁 Checking Controllers..."
for file in app/controllers/*.js; do
    TOTAL_FILES=$((TOTAL_FILES + 1))
    if needs_jsdoc "$file"; then
        echo "  ⚠️  $(basename $file) needs JSDoc"
        UPDATED_FILES=$((UPDATED_FILES + 1))
    else
        echo "  ✅ $(basename $file) has JSDoc"
    fi
done

# Services that need JSDoc
echo ""
echo "📁 Checking Services..."
for file in app/services/*.js; do
    TOTAL_FILES=$((TOTAL_FILES + 1))
    if needs_jsdoc "$file"; then
        echo "  ⚠️  $(basename $file) needs JSDoc"
        UPDATED_FILES=$((UPDATED_FILES + 1))
    else
        echo "  ✅ $(basename $file) has JSDoc"
    fi
done

# Routes that need JSDoc
echo ""
echo "📁 Checking Routes..."
for file in app/routes/*.js; do
    TOTAL_FILES=$((TOTAL_FILES + 1))
    if needs_jsdoc "$file"; then
        echo "  ⚠️  $(basename $file) needs JSDoc"
        UPDATED_FILES=$((UPDATED_FILES + 1))
    else
        echo "  ✅ $(basename $file) has JSDoc"
    fi
done

# Config files that need JSDoc
echo ""
echo "📁 Checking Config..."
for file in app/config/*.js; do
    TOTAL_FILES=$((TOTAL_FILES + 1))
    if needs_jsdoc "$file"; then
        echo "  ⚠️  $(basename $file) needs JSDoc"
        UPDATED_FILES=$((UPDATED_FILES + 1))
    else
        echo "  ✅ $(basename $file) has JSDoc"
    fi
done

# Frontend files that need JSDoc
echo ""
echo "📁 Checking Frontend..."
for file in app/public/scripts/shared/*.js app/public/scripts/pages/*.js; do
    if [ -f "$file" ]; then
        TOTAL_FILES=$((TOTAL_FILES + 1))
        if needs_jsdoc "$file"; then
            echo "  ⚠️  $(basename $file) needs JSDoc"
            UPDATED_FILES=$((UPDATED_FILES + 1))
        else
            echo "  ✅ $(basename $file) has JSDoc"
        fi
    fi
done

# Summary
echo ""
echo "================================================"
echo "📊 JSDoc Coverage Summary:"
echo "  Total files checked: $TOTAL_FILES"
echo "  Files with JSDoc: $((TOTAL_FILES - UPDATED_FILES))"
echo "  Files needing JSDoc: $UPDATED_FILES"
COVERAGE=$(( (TOTAL_FILES - UPDATED_FILES) * 100 / TOTAL_FILES ))
echo "  Current coverage: $COVERAGE%"
echo "  Target coverage: 80% (Constitutional requirement)"

if [ $COVERAGE -lt 80 ]; then
    echo "  ❌ Coverage below constitutional requirement"
else
    echo "  ✅ Coverage meets constitutional requirement"
fi

echo ""
echo "💡 To generate comprehensive JSDoc for all files:"
echo "   # Using Ollama (FREE - recommended):"
echo "   ./scripts/ollama-code.sh \"@app/ Generate JSDoc for all JavaScript files\""
echo ""
echo "   # Using Gemini (WARNING: Uses significant API quota):"
echo "   # gemini -p \"@app/ Generate JSDoc for all JavaScript files\""
echo ""
echo "📚 To run documentation pipeline after adding JSDoc:"
echo "   npm run docs:generate"