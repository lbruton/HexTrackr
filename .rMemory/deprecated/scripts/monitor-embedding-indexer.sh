#!/bin/bash
# HexTrackr Embedding Indexer Monitor
# Real-time monitoring for nomic-embed-text indexing process

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$(dirname "$SCRIPT_DIR")")"
LOG_DIR="$PROJECT_ROOT/.rMemory/logs"

# Find the latest indexer log
LATEST_LOG=$(ls -t "$LOG_DIR"/embedding-indexer-*.log 2>/dev/null | head -1)

if [ -z "$LATEST_LOG" ]; then
    echo "❌ No embedding indexer log found in $LOG_DIR"
    echo "💡 Start the indexer first: ./.rMemory/scripts/launch-embedding-indexer.sh"
    exit 1
fi

echo "🧠 HexTrackr Embedding Indexer - Real-time Monitor"
echo "================================================="
echo
echo "📝 Monitoring: $LATEST_LOG"
echo "⌨️  Press Ctrl+C to stop monitoring"
echo

# Color codes for enhanced output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Follow the log with colored output
tail -f "$LATEST_LOG" | while IFS= read -r line; do
    case "$line" in
        *"✅"*)
            echo -e "${GREEN}$line${NC}"
            ;;
        *"🧠"*)
            echo -e "${BLUE}$line${NC}"
            ;;
        *"📊"*)
            echo -e "${CYAN}$line${NC}"
            ;;
        *"🔄"*)
            echo -e "${YELLOW}$line${NC}"
            ;;
        *"❌"*|*"⚠️"*)
            echo -e "${RED}$line${NC}"
            ;;
        *"🚀"*|*"💾"*)
            echo -e "${PURPLE}$line${NC}"
            ;;
        *)
            echo "$line"
            ;;
    esac
done
