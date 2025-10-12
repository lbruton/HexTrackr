#!/bin/bash

# Secure API Keys Management Script
# This script stores API keys in macOS Keychain for secure access

set -e

echo "🔐 Securing API Keys in macOS Keychain"
echo "======================================="

# Function to add/update a key in Keychain
add_to_keychain() {
    local service_name="$1"
    local account_name="$2"
    local key_value="$3"

    # Delete existing entry if it exists (to update)
    security delete-generic-password -s "$service_name" -a "$account_name" 2>/dev/null || true

    # Add new entry
    security add-generic-password -s "$service_name" -a "$account_name" -w "$key_value" -T ""

    echo "✅ Stored: $service_name/$account_name"
}

# Check if we're running interactively
if [ -t 0 ]; then
    echo ""
    echo "This script will store the following API keys in macOS Keychain:"
    echo "  - OPENAI_API_KEY (for Memento and Claude-context)"
    echo "  - OPENROUTER_API_KEY (for AI model routing)"
    echo "  - BRAVE_API_KEY (for web search)"
    echo "  - CODACY_ACCOUNT_TOKEN (for code quality)"
    echo ""
    read -p "Do you want to continue? (y/n) " -n 1 -r
    echo ""

    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Aborted."
        exit 1
    fi
fi

# Store the keys
echo ""
echo "Storing API keys in Keychain..."

# You'll need to replace these with actual values from your backup files
# For security, we don't hardcode the actual keys here

# Example of how to store (uncomment and add real keys):
# add_to_keychain "HexTrackr" "OPENAI_API_KEY" "your-openai-key-here"
# add_to_keychain "HexTrackr" "OPENROUTER_API_KEY" "your-openrouter-key-here"
# add_to_keychain "HexTrackr" "BRAVE_API_KEY" "your-brave-key-here"
# add_to_keychain "HexTrackr" "CODACY_ACCOUNT_TOKEN" "your-codacy-token-here"

echo ""
echo "⚠️  IMPORTANT: You need to manually add your API keys to this script"
echo "   or run the following commands with your actual keys:"
echo ""
echo "   security add-generic-password -s HexTrackr -a OPENAI_API_KEY -w 'your-key'"
echo "   security add-generic-password -s HexTrackr -a OPENROUTER_API_KEY -w 'your-key'"
echo "   security add-generic-password -s HexTrackr -a BRAVE_API_KEY -w 'your-key'"
echo "   security add-generic-password -s HexTrackr -a CODACY_ACCOUNT_TOKEN -w 'your-token'"
echo ""
echo "After storing, you can retrieve keys with:"
echo "   security find-generic-password -s HexTrackr -a OPENAI_API_KEY -w"
echo ""