#!/bin/bash

# rEngine Roadmap Dashboard Launcher
# Quick access to strategic planning and architecture documentation

echo "🚀 rEngine Roadmap Dashboard Launcher"
echo "======================================"
echo ""

ROADMAP_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
MAIN_DASHBOARD="$ROADMAP_DIR/index.html"
ARCHITECTURE_DIAGRAM="$ROADMAP_DIR/architecture.html"

# Check if files exist
if [ ! -f "$MAIN_DASHBOARD" ]; then
    echo "❌ Error: Roadmap dashboard not found at $MAIN_DASHBOARD"
    exit 1
fi

if [ ! -f "$ARCHITECTURE_DIAGRAM" ]; then
    echo "❌ Error: Architecture diagram not found at $ARCHITECTURE_DIAGRAM"
    exit 1
fi

echo "📊 Available Roadmap Views:"
echo ""
echo "1. 📈 Strategic Roadmap Dashboard (Main)"
echo "2. 🏗️  Architecture Vision Diagram"
echo "3. 🌐 Open Both in Browser"
echo "4. 📱 Start Local Server (for mobile access)"
echo "5. ❌ Exit"
echo ""

read -p "Select option (1-5): " choice

case $choice in
    1)
        echo "🔄 Opening Strategic Roadmap Dashboard..."
        if command -v open &> /dev/null; then
            # macOS
            open "$MAIN_DASHBOARD"
        elif command -v xdg-open &> /dev/null; then
            # Linux
            xdg-open "$MAIN_DASHBOARD"
        elif command -v start &> /dev/null; then
            # Windows
            start "$MAIN_DASHBOARD"
        else
            echo "📁 Please open: $MAIN_DASHBOARD"
        fi
        ;;
    2)
        echo "🔄 Opening Architecture Vision Diagram..."
        if command -v open &> /dev/null; then
            open "$ARCHITECTURE_DIAGRAM"
        elif command -v xdg-open &> /dev/null; then
            xdg-open "$ARCHITECTURE_DIAGRAM"
        elif command -v start &> /dev/null; then
            start "$ARCHITECTURE_DIAGRAM"
        else
            echo "📁 Please open: $ARCHITECTURE_DIAGRAM"
        fi
        ;;
    3)
        echo "🔄 Opening both dashboards..."
        if command -v open &> /dev/null; then
            open "$MAIN_DASHBOARD"
            sleep 1
            open "$ARCHITECTURE_DIAGRAM"
        elif command -v xdg-open &> /dev/null; then
            xdg-open "$MAIN_DASHBOARD" &
            sleep 1
            xdg-open "$ARCHITECTURE_DIAGRAM" &
        elif command -v start &> /dev/null; then
            start "$MAIN_DASHBOARD"
            start "$ARCHITECTURE_DIAGRAM"
        else
            echo "📁 Please open both files:"
            echo "   - $MAIN_DASHBOARD"
            echo "   - $ARCHITECTURE_DIAGRAM"
        fi
        ;;
    4)
        echo "🌐 Starting local server for mobile access..."
        echo "📱 Access from mobile: http://localhost:8080"
        echo "🛑 Press Ctrl+C to stop server"
        echo ""
        
        # Start simple HTTP server
        if command -v python3 &> /dev/null; then
            cd "$ROADMAP_DIR"
            python3 -m http.server 8080
        elif command -v python &> /dev/null; then
            cd "$ROADMAP_DIR"
            python -m SimpleHTTPServer 8080
        elif command -v node &> /dev/null; then
            cd "$ROADMAP_DIR"
            npx http-server -p 8080
        else
            echo "❌ No suitable HTTP server found (need Python or Node.js)"
            echo "📁 Please open: $MAIN_DASHBOARD"
        fi
        ;;
    5)
        echo "👋 Goodbye!"
        exit 0
        ;;
    *)
        echo "❌ Invalid option. Please select 1-5."
        exit 1
        ;;
esac

echo ""
echo "✅ Dashboard launched successfully!"
echo "📖 Tip: Bookmark these pages for quick access to rEngine strategic planning"
