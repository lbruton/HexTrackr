#!/bin/bash

# HexTrackr Database Initialization Script
# Creates a clean database with schema and sample data
# Safe for development and open source distribution

echo "🔧 Initializing HexTrackr Database..."

# Remove existing database if it exists
if [ -f "data/hextrackr.db" ]; then
    echo "📁 Backing up existing database..."
    mv data/hextrackr.db data/hextrackr.db.backup.$(date +%Y%m%d_%H%M%S)
fi

# Create fresh database with schema
echo "🗄️ Creating fresh database with schema..."
sqlite3 data/hextrackr.db < data/schema.sql

echo "✅ Database initialized successfully!"
echo "📊 Sample data included for testing"
echo "🔒 No sensitive data included - safe for open source"

# Show table counts
echo ""
echo "📈 Database Summary:"
echo "Tickets: $(sqlite3 data/hextrackr.db 'SELECT COUNT(*) FROM tickets;')"
echo "Vulnerabilities: $(sqlite3 data/hextrackr.db 'SELECT COUNT(*) FROM vulnerabilities;')"
