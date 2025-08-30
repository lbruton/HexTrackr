#!/bin/bash

# Two-Stage Documentation Generator
# Stage 1: Groq for MD/JSON, Stage 2: Gemini for HTML

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

echo "📚 Two-Stage Documentation Generator"
echo "🔄 Stage 1: Groq (MD/JSON) → Stage 2: Gemini (HTML)"
echo ""

if [ $# -eq 0 ]; then
    echo "Usage: $0 <file-path> [options]"
    echo ""
    echo "Examples:"
    echo "  $0 rProjects/StackTrackr/js/inventory.js"
    echo "  $0 patchnotes/PATCH-3.04.95.md"
    echo "  $0 --convert-all                    # Convert all existing MD to HTML"
    echo "  $0 --html-only [pattern]            # Only run HTML conversion"
    echo ""
    exit 1
fi

cd "$ROOT_DIR"

if [ "$1" = "--convert-all" ]; then
    echo "🎨 Converting all existing MD files to HTML..."
    node rEngine/gemini-html-converter.js
    echo "✅ Complete! All documentation converted."
    exit 0
fi

if [ "$1" = "--html-only" ]; then
    echo "🎨 Converting MD to HTML for pattern: ${2:-all}"
    if [ -n "$2" ]; then
        node rEngine/gemini-html-converter.js "$2"
    else
        node rEngine/gemini-html-converter.js
    fi
    echo "✅ HTML conversion complete!"
    exit 0
fi

FILE_PATH="$1"

echo "📝 Stage 1: Generating MD/JSON with Groq..."
echo "📂 File: $FILE_PATH"

# Stage 1: Generate MD/JSON with Groq
node rEngine/smart-document-generator.js "$FILE_PATH"

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Stage 1 complete: MD/JSON generated"
    echo ""
    echo "🎨 Stage 2: Converting to HTML with Gemini..."
    
    # Extract base name for pattern matching
    BASE_NAME=$(basename "$FILE_PATH" | sed 's/\.[^.]*$//')
    
    # Stage 2: Convert to HTML with Gemini
    node rEngine/gemini-html-converter.js "$BASE_NAME"
    
    if [ $? -eq 0 ]; then
        echo ""
        echo "🎉 Two-stage documentation generation complete!"
        echo "📊 Summary:"
        echo "   Stage 1 (Groq):   MD/JSON → docs/generated/"
        echo "   Stage 2 (Gemini): HTML    → html-docs/generated/"
        echo ""
        echo "🌐 View documentation:"
        echo "   Portal: file://$ROOT_DIR/html-docs/documentation.html"
        echo "   Direct: file://$ROOT_DIR/html-docs/generated/$(echo "$FILE_PATH" | sed 's/\.[^.]*$/.html/')"
    else
        echo "❌ Stage 2 failed: HTML conversion error"
        exit 1
    fi
else
    echo "❌ Stage 1 failed: MD/JSON generation error"
    exit 1
fi
