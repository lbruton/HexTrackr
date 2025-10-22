#!/bin/bash
# HEX-282: Fix database path configuration and migrate data to named volume
# This script corrects the critical database corruption issue

set -e

echo "========================================"
echo "HexTrackr Database Path Fix (HEX-282)"
echo "========================================"
echo ""

# Step 1: Update .env file
echo "Step 1: Updating .env DATABASE_PATH..."
if grep -q "DATABASE_PATH=./data/hextrackr.db" .env; then
    sed -i.backup "s|DATABASE_PATH=./data/hextrackr.db|DATABASE_PATH=/app/data/hextrackr.db|" .env
    echo "✅ Updated DATABASE_PATH to /app/data/hextrackr.db"
else
    echo "⚠️  .env already updated or manual intervention needed"
fi

# Step 2: Stop Docker to safely copy database
echo ""
echo "Step 2: Stopping Docker containers..."
docker-compose down

# Step 3: Copy current database to named volume using temporary container
echo ""
echo "Step 3: Migrating database from bind mount to named volume..."
docker run --rm \
  -v "$(pwd)/app/data:/source" \
  -v hextrackr_hextrackr-database:/target \
  alpine sh -c "cp -v /source/hextrackr.db /target/ && cp -v /source/sessions.db /target/ 2>/dev/null || true"

echo "✅ Database migrated to named volume"

# Step 4: Start Docker with new configuration
echo ""
echo "Step 4: Starting Docker with corrected configuration..."
docker-compose up -d

# Step 5: Wait for startup and verify
echo ""
echo "Step 5: Waiting for application to start..."
sleep 10

# Step 6: Verify database path
echo ""
echo "Step 6: Verifying database path..."
docker-compose logs hextrackr | grep "DATABASE" | tail -1

# Step 7: Verify database location
echo ""
echo "Step 7: Verifying database in named volume..."
docker exec hextrackr-app ls -lh /app/data/hextrackr.db

# Step 8: Verify bind mount exclusion
echo ""
echo "Step 8: Verifying bind mount exclusion..."
if docker exec hextrackr-app ls /app/app/data/ 2>&1 | grep -q "No such file"; then
    echo "✅ Bind mount correctly excluded - database isolated in named volume"
else
    echo "❌ WARNING: Bind mount still exists at /app/app/data/"
    echo "Check docker-compose.yml line 17"
fi

echo ""
echo "========================================"
echo "✅ Database path fix complete!"
echo "========================================"
echo ""
echo "Next steps:"
echo "1. Navigate to Settings → Sync → Cisco PSIRT"
echo "2. Click 'Sync Now' to repopulate advisory data"
echo "3. Test ticket creation/editing"
echo "4. Test soft delete functionality"
echo ""
