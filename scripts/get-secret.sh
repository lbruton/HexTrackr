#!/bin/bash

# Get Secret from macOS Keychain
# Usage: get-secret.sh KEY_NAME

if [ -z "$1" ]; then
    echo "Usage: $0 KEY_NAME" >&2
    exit 1
fi

KEY_NAME="$1"
SERVICE="HexTrackr"

# Try to get the key from Keychain
secret=$(security find-generic-password -s "$SERVICE" -a "$KEY_NAME" -w 2>/dev/null)

if [ $? -eq 0 ] && [ -n "$secret" ]; then
    echo "$secret"
else
    # Fallback to environment variable (for development/testing)
    env_var="${KEY_NAME}"
    env_value="${!env_var}"

    if [ -n "$env_value" ]; then
        echo "$env_value"
    else
        echo "Error: Secret '$KEY_NAME' not found in Keychain or environment" >&2
        exit 1
    fi
fi