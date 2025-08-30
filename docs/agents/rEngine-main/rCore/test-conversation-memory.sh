#!/bin/bash

# Test rEngineMCP conversation memory
echo "🧪 Testing rEngineMCP Conversation Memory System"
echo "================================================="

# Test if plugin is responding
echo "1. Testing plugin connectivity..."
echo '{"jsonrpc": "2.0", "id": 1, "method": "tools/list"}' | /opt/homebrew/bin/node /Volumes/DATA/GitHub/rEngine/rEngine/index.js 2>/dev/null | head -5

# Test conversation recording
echo -e "\n2. Testing conversation memory..."
echo "Creating test conversation session..."

# Create test conversation
TEST_PAYLOAD='{
  "jsonrpc": "2.0",
  "id": 2,
  "method": "tools/call",
  "params": {
    "name": "rengine_tag_in_ollama",
    "arguments": {
      "message": "Hello, this is a test message. Please respond with just: MEMORY TEST SUCCESSFUL",
      "session_id": "test_session_mac_mini",
      "remember_conversation": true,
      "model": "llama3:8b"
    }
  }
}'

echo "$TEST_PAYLOAD" | /opt/homebrew/bin/node /Volumes/DATA/GitHub/rEngine/rEngine/index.js 2>/dev/null | jq -r '.result.content[0].text' 2>/dev/null

echo -e "\n3. Checking if conversation was saved..."
if [ -f "/Volumes/DATA/GitHub/rEngine/rEngine/.rengine/conversations/test_session_mac_mini.json" ]; then
    echo "✅ Memory file exists, checking content:"
    echo "📄 Last recorded exchange:"
    cat "/Volumes/DATA/GitHub/rEngine/rEngine/.rengine/conversations/test_session_mac_mini.json" | jq -r '.exchanges[-1] | "Human: " + .human + "
Assistant: " + .assistant'

echo -e "\n🎯 rEngineMCP Mac Mini Test Complete!"
