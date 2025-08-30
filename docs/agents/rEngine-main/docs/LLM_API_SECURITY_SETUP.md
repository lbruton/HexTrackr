# rEngine LLM API Integration Security Setup

## Quick Start

1. **Create secure API key storage outside repo:**

```bash
mkdir -p ~/.rengine/secrets/provider-configs
mkdir -p ~/.rengine/logs
```

1. **Copy your API keys to secure location:**

```bash
cp api-keys.env ~/.rengine/secrets/
```

1. **Set permissions (Unix/macOS only):**

```bash
chmod 600 ~/.rengine/secrets/api-keys.env
chmod 700 ~/.rengine/secrets/
```

## API Key Configuration

### Template: ~/.rengine/secrets/api-keys.env

```env

# OpenAI Configuration

OPENAI_API_KEY=sk-...
OPENAI_ORG_ID=org-...
OPENAI_PROJECT_ID=proj_...

# Anthropic/Claude Configuration  

ANTHROPIC_API_KEY=sk-ant-...

# Google/Gemini Configuration

GOOGLE_API_KEY=AIza...
GOOGLE_PROJECT_ID=your-project-id

# Azure OpenAI Configuration

AZURE_OPENAI_KEY=...
AZURE_OPENAI_ENDPOINT=https://....openai.azure.com/
AZURE_OPENAI_VERSION=2024-02-15-preview

# Groq Configuration

GROQ_API_KEY=gsk_...

# Together AI Configuration

TOGETHER_API_KEY=...

# Hugging Face Configuration

HUGGINGFACE_API_KEY=hf_...

# Cohere Configuration

COHERE_API_KEY=...
```

## Docker Integration

The Docker services will mount the secure directory as read-only:

```yaml
volumes:

  - ~/.rengine/secrets:/secrets:ro  # Read-only mount

```

## Security Features

✅ **API keys never in repo**
✅ **Read-only Docker mounts**
✅ **Encrypted key storage option**
✅ **Usage tracking & monitoring**
✅ **Request/response caching**
✅ **Rate limiting & quotas**

## Services Overview

| Service | Port | Purpose |
|---------|------|---------|
| llm-gateway | 4052 | Main API gateway for all LLM calls |
| api-key-manager | 4053 | Secure key validation & rotation |
| usage-tracker | 4054 | Monitor API costs & usage patterns |
| prompt-cache | 4055 | Cache responses to reduce costs |
