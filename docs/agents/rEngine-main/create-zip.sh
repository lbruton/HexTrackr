#!/bin/bash
chmod +x "$0"
# Create zip file for the robust startup package

cd /Volumes/DATA/GitHub/rEngine

echo "📦 Creating rEngine Robust Startup System zip file..."

# Create the zip file
zip -r rEngine-robust-startup-system.zip robust-startup-package/

if [ $? -eq 0 ]; then
    echo "✅ Zip file created successfully!"
    echo "📁 Location: /Volumes/DATA/GitHub/rEngine/rEngine-robust-startup-system.zip"
    echo ""
    echo "📋 Package contents:"
    ls -la robust-startup-package/
    echo ""
    echo "📊 Zip file size:"
    ls -lh rEngine-robust-startup-system.zip
else
    echo "❌ Error creating zip file"
    exit 1
fi
