# 🔐 Secure API Key Setup Instructions

## Overview

This setup ensures your LLM API keys are stored securely outside the repository to prevent accidental commits to GitHub.

## Directory Structure

```
~/.rengine/
└── secrets/
    ├── api-keys.env          # Main API keys file
    ├── .gitignore           # Ignore file (extra safety)
    └── backup/
        └── api-keys-backup.env  # Backup copy
```

## Setup Steps

### 1. Create the Secrets Directory

```bash
mkdir -p ~/.rengine/secrets/backup
```

### 2. Create API Keys File

```bash
touch ~/.rengine/secrets/api-keys.env
chmod 600 ~/.rengine/secrets/api-keys.env  # Restrict access
```

### 3. Add Your API Keys

Edit `~/.rengine/secrets/api-keys.env` with your actual API keys:

```env

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
```

### 4. Create Safety Backup

```bash
cp ~/.rengine/secrets/api-keys.env ~/.rengine/secrets/backup/api-keys-backup.env
```

### 5. Add Extra Protection

```bash
echo "# Never commit API keys
*.env
api-keys*
*key*" > ~/.rengine/secrets/.gitignore
```

## Docker Integration

The Docker services are configured to mount your secrets directory as read-only:

```yaml
volumes:

  - ~/.rengine/secrets:/secrets:ro  # Read-only mount

```

This means:

- ✅ API keys are accessible to Docker services
- ✅ Keys are stored outside the repository
- ✅ Read-only prevents accidental modification
- ✅ No risk of committing to GitHub

## Usage in LLM Gateway

The LLM gateway automatically loads keys from `/secrets/api-keys.env`:

```javascript
// Keys are loaded securely inside Docker
const openaiKey = process.env.OPENAI_API_KEY;
const anthropicKey = process.env.ANTHROPIC_API_KEY;
// etc...
```

## Verification Steps

### 1. Test Directory Structure

```bash
ls -la ~/.rengine/secrets/

# Should show: api-keys.env, .gitignore, backup/

```

### 2. Test File Permissions

```bash
ls -l ~/.rengine/secrets/api-keys.env

# Should show: -rw------- (600 permissions)

```

### 3. Test Docker Mount

```bash
cd /Volumes/DATA/GitHub/rEngine
docker-compose -f docker-compose-enhanced.yml up llm-gateway

# Should start without "secrets not found" errors

```

### 4. Test API Access

Visit `http://localhost:4052` to test the LLM gateway interface.

## Security Best Practices

### ✅ Do's

- Keep API keys in `~/.rengine/secrets/` only
- Use 600 permissions (owner read/write only)
- Create regular backups
- Rotate keys periodically
- Monitor usage via dashboard

### ❌ Don'ts

- Never commit `.env` files with real keys
- Don't share keys in chat/email
- Don't use keys in script examples
- Don't store keys in repository files
- Don't use world-readable permissions

## Troubleshooting

### "No API key found" errors

1. Check file exists: `ls ~/.rengine/secrets/api-keys.env`
2. Check permissions: `ls -l ~/.rengine/secrets/api-keys.env`
3. Check Docker mount: Look for mount errors in logs
4. Verify file format: Ensure `KEY=value` format

### "Permission denied" errors

```bash
chmod 600 ~/.rengine/secrets/api-keys.env
chown $USER ~/.rengine/secrets/api-keys.env
```

### Docker mount issues

- Ensure full path: `~/.rengine/secrets` not `./secrets`
- Check Docker has permission to access home directory
- Restart Docker if needed

## Quick Setup Script

Run this to set up everything automatically:

```bash
#!/bin/bash
echo "🔐 Setting up secure API key storage..."

# Create directory structure

mkdir -p ~/.rengine/secrets/backup

# Create template file

cat > ~/.rengine/secrets/api-keys.env << 'EOF'

# Replace with your actual API keys

OPENAI_API_KEY=sk-your-openai-key-here
ANTHROPIC_API_KEY=sk-ant-your-anthropic-key-here
GOOGLE_AI_API_KEY=your-google-ai-key-here
GROQ_API_KEY=gsk_your-groq-key-here
EOF

# Set secure permissions

chmod 600 ~/.rengine/secrets/api-keys.env

# Create .gitignore

echo "*.env
api-keys*
*key*" > ~/.rengine/secrets/.gitignore

echo "✅ Setup complete!"
echo "📝 Edit ~/.rengine/secrets/api-keys.env with your real API keys"
echo "🚀 Then run: docker-compose -f docker-compose-enhanced.yml up"
```

## Integration with rEngine

Once configured, your enhanced Docker environment provides:

- 🤖 **LLM Gateway** (`localhost:4052`) - Secure API access with rate limiting
- 📊 **Usage Dashboard** (`localhost:4054`) - Cost monitoring and analytics  
- 🔒 **Secure Storage** - Keys outside repository, read-only Docker mounts
- 🎯 **Multiple Providers** - OpenAI, Anthropic, Google, Groq support
- 📈 **Monitoring** - Request logging, error tracking, performance metrics

Your development environment is now production-ready with enterprise-grade security! 🎉
