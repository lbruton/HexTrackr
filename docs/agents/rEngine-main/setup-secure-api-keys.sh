#!/bin/bash

echo "🔐 Setting up secure API key storage for rEngine..."
echo ""

# Create directory structure
echo "📁 Creating ~/.rengine/secrets directory..."
mkdir -p ~/.rengine/secrets/backup

# Create template file
echo "📝 Creating API keys template..."
cat > ~/.rengine/secrets/api-keys.env << 'EOF'
# Replace with your actual API keys
# OpenAI Configuration
OPENAI_API_KEY=sk-your-openai-key-here
OPENAI_ORG_ID=org-your-org-id-here

# Anthropic Configuration  
ANTHROPIC_API_KEY=sk-ant-your-anthropic-key-here

# Google AI Configuration
GOOGLE_AI_API_KEY=your-google-ai-key-here

# Groq Configuration
GROQ_API_KEY=gsk_your-groq-key-here

# Additional providers (optional)
COHERE_API_KEY=your-cohere-key-here
HUGGINGFACE_API_KEY=hf_your-huggingface-key-here
EOF

# Set secure permissions
echo "🔒 Setting secure permissions (600)..."
chmod 600 ~/.rengine/secrets/api-keys.env

# Create .gitignore for extra safety
echo "🛡️  Creating safety .gitignore..."
cat > ~/.rengine/secrets/.gitignore << 'EOF'
# Never commit API keys
*.env
api-keys*
*key*
*secret*
EOF

# Create backup
echo "💾 Creating backup copy..."
cp ~/.rengine/secrets/api-keys.env ~/.rengine/secrets/backup/api-keys-backup.env

echo ""
echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Edit ~/.rengine/secrets/api-keys.env with your real API keys"
echo "2. Run: docker-compose -f docker-compose-enhanced.yml up"
echo "3. Visit http://localhost:4052 for LLM Gateway"
echo "4. Visit http://localhost:4054 for Usage Dashboard"
echo ""
echo "🚀 Your secure LLM environment is ready!"
