#!/bin/bash

# Simple Cron Setup for HexTrackr Memory System
# Hourly deep analysis with real logging

echo "⏰ Setting up hourly deep analysis cron job"
echo "=========================================="
echo ""

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(cd "$SCRIPT_DIR/../.." && pwd)"

echo "📍 Project directory: $PROJECT_DIR"
echo "📁 Script directory: $SCRIPT_DIR"
echo ""

# Create the hourly script
HOURLY_SCRIPT="$SCRIPT_DIR/hourly-deep-analysis.sh"

cat > "$HOURLY_SCRIPT" << 'EOF'
#!/bin/bash

# Hourly Deep Analysis for HexTrackr Memory System
cd /Volumes/DATA/GitHub/HexTrackr

# Load environment
source .env

# Create timestamp log
TIMESTAMP=$(date +%Y%m%d-%H%M%S)
LOG_FILE=".rMemory/logs/deep-analysis/hourly-$TIMESTAMP.log"

echo "🕐 $(date): Starting hourly deep analysis" | tee "$LOG_FILE"
echo "📊 Analyzing recent chat logs and code changes..." | tee -a "$LOG_FILE"

# Run deep analysis with full output capture
node .rMemory/scribes/deep-chat-analysis.js 2>&1 | tee -a "$LOG_FILE"

echo "✅ $(date): Deep analysis complete" | tee -a "$LOG_FILE"
EOF

chmod +x "$HOURLY_SCRIPT"

echo "✅ Created hourly script: $HOURLY_SCRIPT"
echo ""

# Show current crontab
echo "📋 Current crontab:"
crontab -l 2>/dev/null || echo "(no crontab found)"
echo ""

# Prepare cron job
CRON_JOB="0 * * * * $HOURLY_SCRIPT >> .rMemory/logs/cron.log 2>&1"

echo "🔧 Proposed cron job (runs every hour):"
echo "   $CRON_JOB"
echo ""

read -p "Add this cron job? (y/n): " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    # Add to crontab
    (crontab -l 2>/dev/null; echo "$CRON_JOB") | crontab -
    echo "✅ Cron job added!"
    echo ""
    echo "📋 Updated crontab:"
    crontab -l
else
    echo "⏸️  Cron job not added. You can manually add it later:"
    echo "   crontab -e"
    echo "   Then add: $CRON_JOB"
fi

echo ""
echo "🔍 To monitor hourly logs:"
echo "   tail -f .rMemory/logs/deep-analysis/hourly-*.log"
echo ""
echo "� To remove cron job later:"
echo "   crontab -e  # then delete the line"
