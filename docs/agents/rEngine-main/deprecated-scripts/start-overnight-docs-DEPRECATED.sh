#!/bin/bash

# Overnight Documentation Generation Script
# Ultra-conservative batch processing for large files

echo "🌙 Starting overnight documentation generation..."
echo "📅 Date: $(date)"
echo "📂 Working directory: $(pwd)"

# Ensure we're in the right directory
cd "$(dirname "$0")/.."

# Create logs directory if it doesn't exist
mkdir -p rCore/logs

# Set environment variables if not already set
if [ -z "$GROQ_API_KEY" ]; then
    echo "⚠️  Warning: GROQ_API_KEY not set. Make sure it's in .env file."
fi

# Start the overnight batch processor
echo "🚀 Starting batch processor..."
node rCore/overnight-batch-processor.js "$@"

exit_code=$?

echo ""
echo "🏁 Overnight processing finished with exit code: $exit_code"
echo "📅 Completed at: $(date)"

# Show the latest log file
latest_log=$(ls -t rEngine/logs/batch-processing-*.log 2>/dev/null | head -1)
if [ -n "$latest_log" ]; then
    echo "📋 Latest log file: $latest_log"
    echo "📊 Last 10 lines of log:"
    tail -10 "$latest_log"
fi

exit $exit_code
