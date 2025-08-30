#!/bin/bash

# AppleScript Terminal Helper for rEngine
# Provides visible terminal execution with better process management

run_in_applescript_terminal() {
    local title="$1"
    local command="$2"
    local working_dir="${3:-$(pwd)}"
    
    osascript <<EOF
tell application "Terminal"
    activate
    set newTab to do script "cd '$working_dir'"
    set the name of newTab to "$title"
    do script "$command" in newTab
end tell
EOF
}

run_protocol_cleanup() {
    echo "🧹 Starting Protocol Cleanup in visible terminal..."
    
    run_in_applescript_terminal "rEngine Protocol Cleanup" "
echo '🚀 rEngine Protocol Cleanup Starting...'
echo '📂 Current directory: $(pwd)'
echo '📋 Analyzing protocols...'

# List current structure
echo '=== Current rProtocols Structure ==='
ls -la rProtocols/

echo ''
echo '=== Numbered Protocols ==='
ls -la rProtocols/numbered/

echo ''
echo '🎯 Press ENTER to continue with cleanup, or Ctrl+C to cancel'
read -p 'Continue? '

echo '✅ Cleanup would start here...'
echo '📝 This terminal stays open for your review'
"
}

run_docker_startup() {
    echo "🐳 Starting Docker Environment in visible terminal..."
    
    run_in_applescript_terminal "rEngine Docker Startup" "
echo '🚀 rEngine Docker Environment Starting...'
cd /Volumes/DATA/GitHub/rEngine

echo '📋 Checking Docker status...'
docker --version
docker-compose --version

echo '🔧 Starting enhanced Docker environment...'
./docker/rengine-manager.sh start enhanced

echo '📊 Docker startup complete! Terminal stays open for monitoring.'
"
}

run_memory_bridge() {
    echo "🧠 Starting Memory Bridge in visible terminal..."
    
    run_in_applescript_terminal "rEngine Memory Bridge" "
echo '🧠 rEngine Memory Bridge Starting...'
cd /Volumes/DATA/GitHub/rEngine

echo '📋 Starting memory bridge on port 8092...'
node rCore/memory-bridge.js

echo '✅ Memory bridge session complete'
"
}

# Command line interface
case "$1" in
    "cleanup")
        run_protocol_cleanup
        ;;
    "docker")
        run_docker_startup
        ;;
    "memory")
        run_memory_bridge
        ;;
    "custom")
        run_in_applescript_terminal "$2" "$3" "$4"
        ;;
    *)
        echo "Usage: $0 {cleanup|docker|memory|custom}"
        echo "  cleanup  - Run protocol cleanup"
        echo "  docker   - Start Docker environment"  
        echo "  memory   - Start memory bridge"
        echo "  custom   - Custom command: $0 custom 'Title' 'command' 'working_dir'"
        exit 1
        ;;
esac
