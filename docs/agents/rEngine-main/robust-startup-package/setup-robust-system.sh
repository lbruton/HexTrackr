#!/bin/bash
# Setup script - Make all robust startup scripts executable

echo "🔧 Setting up rEngine Robust Startup System permissions..."

# Make all the new robust scripts executable
chmod +x ./robust-startup-protocol.sh
chmod +x ./monitor-protocol-state.sh  
chmod +x ./emergency-recovery.sh
chmod +x ./validate-protocol-stack.sh
chmod +x ./quick-start-enhanced.sh
chmod +x ./setup-robust-system.sh

# Create logs directory
mkdir -p ./logs

# Verify permissions
echo "✅ Script permissions set:"
ls -la *.sh | grep -E "(robust|monitor|emergency|validate|enhanced)" | awk '{print "   " $1 " " $9}'

echo ""
echo "🎯 Robust startup system is ready!"
echo "   Run: ./quick-start-enhanced.sh --robust"
echo "   Or:  ./robust-startup-protocol.sh"
echo ""
echo "📚 Documentation: ./ROBUST_STARTUP_README.md"
