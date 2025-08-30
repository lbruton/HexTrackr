#!/bin/bash

echo "🔑 Setting up OpenWebUI Docker Container with API Keys"
echo "======================================================"

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "❌ Error: .env file not found!"
    echo "📝 Please create a .env file with your API keys."
    echo "💡 Use .env.template as a reference."
    exit 1
fi

# Load environment variables from .env file
echo "📂 Loading API keys from .env file..."
set -a  # automatically export all variables
source .env
set +a  # turn off automatic export

# Validate required environment variables
missing_vars=()
[ -z "$OPENAI_API_KEY" ] && missing_vars+=("OPENAI_API_KEY")
[ -z "$ANTHROPIC_API_KEY" ] && missing_vars+=("ANTHROPIC_API_KEY")
[ -z "$GROQ_API_KEY" ] && missing_vars+=("GROQ_API_KEY")
[ -z "$GOOGLE_API_KEY" ] && missing_vars+=("GOOGLE_API_KEY")

if [ ${#missing_vars[@]} -gt 0 ]; then
    echo "❌ Missing required environment variables:"
    printf " - %s\n" "${missing_vars[@]}"
    echo "📝 Please add them to your .env file."
    exit 1
fi

# Stop the current OpenWebUI container
echo "📦 Stopping current OpenWebUI container..."
docker stop open-webui 2>/dev/null || echo "⚠️  No existing container to stop"

# Create a new container with API keys from environment
echo "🚀 Starting OpenWebUI with environment-based API keys..."
docker run -d \
  --name open-webui-with-keys \
  -p 3000:8080 \
  -e OPENAI_API_KEY="$OPENAI_API_KEY" \
  -e OPENAI_API_BASE_URL="https://api.openai.com/v1" \
  -e ANTHROPIC_API_KEY="$ANTHROPIC_API_KEY" \
  -e GOOGLE_API_KEY="$GOOGLE_API_KEY" \
  -e GEMINI_API_KEY="$GOOGLE_API_KEY" \
  -e GROQ_API_KEY="$GROQ_API_KEY" \
  -e OLLAMA_BASE_URL="http://host.docker.internal:11434" \
  -v open-webui:/app/backend/data \
  --add-host=host.docker.internal:host-gateway \
  ghcr.io/open-webui/open-webui:main

if [ $? -eq 0 ]; then
    echo "✅ OpenWebUI started successfully with secure API keys!"
    echo "🌐 Access at: http://localhost:3000"
    echo ""
    echo "Available Models:"
    echo "🤖 Local Ollama: Qwen2.5:3B, Llama3:8B, Gemma2:2B"
    echo "🔥 OpenAI: GPT-4o, GPT-4 Turbo"
    echo "🧠 Claude: 3.5 Sonnet, 3 Haiku"
    echo "🌟 Gemini: 1.5 Pro, 1.5 Flash"  
    echo "⚡ Groq: Llama 3.1 70B, Mixtral 8x7B"
    echo ""
    echo "🔒 Security: API keys loaded securely from .env file"
else
    echo "❌ Failed to start OpenWebUI container"
    exit 1
fi
