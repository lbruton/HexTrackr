# Open WebUI API Reference & Model Compatibility Guide

## 🚀 **Open WebUI API Overview**

Open WebUI provides a comprehensive set of APIs and integration capabilities that make it incredibly versatile for AI model integration. Here's everything you need to know:

## 📡 **Core API Endpoints**

### 1. **OpenAI-Compatible API**

- **Base URL**: `http://localhost:3031/v1/` (or your port)
- **Authentication**: Bearer token or API key
- **Endpoints**:
  - `/v1/chat/completions` - Chat completions
  - `/v1/models` - List available models
  - `/v1/embeddings` - Text embeddings
  - `/v1/images/generations` - Image generation

### 2. **Ollama Proxy API**

- **Base URL**: `http://localhost:3031/ollama/api/`
- **Endpoints**:
  - `/ollama/api/tags` - List Ollama models
  - `/ollama/api/generate` - Generate completions
  - `/ollama/api/chat` - Chat with models
  - `/ollama/api/pull` - Pull new models
  - `/ollama/api/push` - Push models

### 3. **WebUI Native API**

- **Base URL**: `http://localhost:3031/api/v1/`
- **Endpoints**:
  - `/api/v1/auths/signin` - Authentication
  - `/api/v1/chats` - Chat management
  - `/api/v1/models` - Model management
  - `/api/v1/users` - User management
  - `/api/v1/configs` - Configuration management

## 🤖 **Model Provider Support**

### **✅ Native Support (Built-in)**

1. **Ollama Models** ⭐
   - All Ollama models work out-of-the-box
   - Local inference
   - Full feature support

1. **OpenAI Models** ⭐
   - GPT-3.5, GPT-4, GPT-4 Turbo
   - DALL-E for image generation
   - Full API compatibility

1. **Azure OpenAI** ⭐
   - All Azure OpenAI models
   - Enterprise features
   - Custom deployments

### **🔌 Via Pipelines Framework**

The Pipelines framework provides extensive provider support:

#### **Google Models**

- **Gemini Pro** ✅ (via `google_manifold_pipeline.py`)
- **Gemini Pro Vision** ✅
- **PaLM 2** ✅
- **Vertex AI Integration** ✅ (via `google_vertexai_manifold_pipeline.py`)

#### **Alibaba Qwen Models**

- **Qwen Models** ✅ (works through multiple pipelines)
  - Via Hugging Face API
  - Via Ollama (qwen2.5-coder:3b confirmed working)
  - Via custom provider pipelines

#### **Popular Providers via Pipelines**

- **Anthropic Claude** ✅ (`anthropic_manifold_pipeline.py`)
- **Groq** ✅ (`groq_manifold_pipeline.py`)
- **Cohere** ✅ (`cohere_manifold_pipeline.py`)
- **DeepSeek** ✅ (`deepseek_manifold_pipeline.py`)
- **Perplexity** ✅ (`perplexity_manifold_pipeline.py`)
- **AWS Bedrock** ✅ (`aws_bedrock_claude_pipeline.py`, `aws_bedrock_deepseek_pipeline.py`)
- **Cloudflare AI** ✅ (`cloudflare_ai_pipeline.py`)
- **LiteLLM** ✅ (`litellm_manifold_pipeline.py`) - **Meta option for 100+ providers**

## 🛠️ **Available Pipelines**

### **Provider Pipelines**

```
anthropic_manifold_pipeline.py      - Anthropic Claude models
aws_bedrock_claude_pipeline.py      - AWS Bedrock Claude
aws_bedrock_deepseek_pipeline.py    - AWS Bedrock DeepSeek
azure_dalle_manifold_pipeline.py    - Azure DALL-E
azure_deepseek_r1_pipeline.py       - Azure DeepSeek R1
azure_jais_core42_pipeline.py       - Azure Jais Core42
azure_openai_manifold_pipeline.py   - Azure OpenAI
azure_openai_pipeline.py            - Azure OpenAI (simple)
cloudflare_ai_pipeline.py           - Cloudflare AI
cohere_manifold_pipeline.py         - Cohere models
deepseek_manifold_pipeline.py       - DeepSeek models
google_manifold_pipeline.py         - Google Gemini models ⭐
google_vertexai_manifold_pipeline.py - Google Vertex AI ⭐
groq_manifold_pipeline.py           - Groq models
litellm_manifold_pipeline.py        - LiteLLM (100+ providers) ⭐
llama_cpp_pipeline.py               - Local llama.cpp
mlx_manifold_pipeline.py            - Apple MLX
ollama_manifold_pipeline.py         - Ollama models
openai_dalle_manifold_pipeline.py   - OpenAI DALL-E
openai_manifold_pipeline.py         - OpenAI models
perplexity_manifold_pipeline.py     - Perplexity models
```

### **Filter & Enhancement Pipelines**

```
function_calling_filter_pipeline.py  - Function calling support
langfuse_filter_pipeline.py         - Langfuse monitoring
rate_limit_filter_pipeline.py       - Rate limiting
detoxify_filter_pipeline.py         - Toxic content filtering
libretranslate_filter_pipeline.py   - Real-time translation
llmguard_prompt_injection_filter_pipeline.py - Security filtering
```

## 🎯 **Gemini Integration Guide**

### **Method 1: Google Manifold Pipeline** ⭐ Recommended

```python

# Install via Pipelines

# URL: https://github.com/open-webui/pipelines/blob/main/examples/pipelines/providers/google_manifold_pipeline.py

# Configuration:

- API Key: Your Google AI API key
- Models: gemini-pro, gemini-pro-vision, gemini-1.5-pro, etc.
- Features: Function calling, vision, embeddings

```

### **Method 2: Vertex AI Pipeline**

```python

# For enterprise Google Cloud users

# URL: https://github.com/open-webui/pipelines/blob/main/examples/pipelines/providers/google_vertexai_manifold_pipeline.py

# Configuration: (2)

- Service Account JSON
- Project ID
- Region
- Full Vertex AI model catalog

```

### **Method 3: LiteLLM Pipeline** (Universal)

```python

# LiteLLM supports 100+ providers including Gemini

# URL: https://github.com/open-webui/pipelines/blob/main/examples/pipelines/providers/litellm_manifold_pipeline.py

# Supports:

- gemini/gemini-pro
- gemini/gemini-pro-vision  
- vertex_ai/gemini-pro
- All major providers through one interface

```

## 🔧 **Qwen Integration Guide**

### **Method 1: Ollama** ⭐ Confirmed Working

```bash

# Already working in your setup

ollama pull qwen2.5-coder:3b

# Available models: qwen2:0.5b, qwen2:1.5b, qwen2:7b, qwen2.5-coder, etc.

```

### **Method 2: Via Hugging Face API**

```python

# Through OpenAI-compatible endpoint or custom pipeline

# Supports: Qwen2.5, Qwen2.5-Coder, Qwen-VL, etc.

```

### **Method 3: LiteLLM Pipeline**

```python

# LiteLLM supports Hugging Face endpoints

# Can integrate Qwen models via HF API

```

## 🚀 **Installation & Setup**

### **Installing Pipelines**

```bash

# Method 1: Docker (Recommended)

docker run -d -p 9099:9099 \
  --add-host=host.docker.internal:host-gateway \
  -v pipelines:/app/pipelines \
  --name pipelines --restart always \
  ghcr.io/open-webui/pipelines:main

# Method 2: Direct Installation

docker run -d -p 9099:9099 \
  -e PIPELINES_URLS="https://github.com/open-webui/pipelines/blob/main/examples/pipelines/providers/google_manifold_pipeline.py" \
  --add-host=host.docker.internal:host-gateway \
  -v pipelines:/app/pipelines \
  --name pipelines --restart always \
  ghcr.io/open-webui/pipelines:main
```

### **Connecting to Open WebUI**

1. Navigate to **Settings → Connections → OpenAI API**
2. Set API URL to: `http://localhost:9099` (or `http://host.docker.internal:9099` if in Docker)
3. Set API Key to: `0p3n-w3bu!`
4. Your pipelines should now be active

### **Managing Pipelines**

1. Go to **Admin Settings → Pipelines**
2. Upload pipeline files or paste URLs
3. Configure valve values (API keys, endpoints, etc.)
4. Enable/disable pipelines as needed

## 📝 **API Integration Examples**

### **Using with rEngineMCP**

```javascript
// Already integrated in your setup!
// Groq primary, Ollama fallback architecture
// Can easily add more providers via pipelines
```

### **Direct API Usage**

```bash

# Chat completion

curl -X POST http://localhost:3031/v1/chat/completions \
  -H "Authorization: Bearer your-api-key" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gemini-pro",
    "messages": [{"role": "user", "content": "Hello!"}]
  }'

# List models

curl http://localhost:3031/v1/models \
  -H "Authorization: Bearer your-api-key"
```

## 🎨 **Enhanced Features**

### **RAG (Retrieval Augmented Generation)**

- Document upload and processing
- Web search integration (SearXNG, Google, Brave, etc.)
- Citation support
- Hybrid search with BM25 + CrossEncoder

### **Multi-Modal Support**

- Image generation (DALL-E, Automatic1111, ComfyUI)
- Vision models (LlaVA, GPT-4V, Gemini Pro Vision)
- Voice and video calls
- File upload support

### **Advanced Features**

- Function calling
- Code execution (Python via Pyodide)
- Real-time collaboration (Channels)
- Memory and personalization
- Conversation cloning and sharing

## 🔐 **Security & Administration**

### **Authentication**

- Role-based access control (RBAC)
- LDAP integration
- OAuth support
- API key management

### **Enterprise Features**

- User groups and permissions
- Model whitelisting
- Rate limiting
- Audit logging
- Webhook integration

## 🌟 **Recommendations for Your Setup**

### **High Priority** ⭐

1. **Install Google Manifold Pipeline** - Native Gemini support
2. **Install LiteLLM Pipeline** - 100+ providers in one pipeline
3. **Add rate limiting** - Prevent API abuse
4. **Setup monitoring** - Langfuse or Opik integration

### **Medium Priority**

1. **Anthropic Claude Pipeline** - Excellent reasoning
2. **Function calling pipeline** - Enhanced capabilities  
3. **Toxic content filtering** - Safety
4. **Translation pipeline** - Multi-language support

### **Your Current Status** ✅

- ✅ Open WebUI running on port 3031
- ✅ Groq API integrated in rEngineMCP
- ✅ Ollama with Qwen models working
- ✅ Docker setup complete
- 🔄 Ready to add more providers via Pipelines

## 🎯 **Next Steps**

1. **Add Gemini**: Install Google Manifold Pipeline
2. **Expand Qwen**: Test other Qwen variants via Ollama
3. **Universal Access**: Install LiteLLM for 100+ providers
4. **Enhance Security**: Add rate limiting and content filtering
5. **Monitor Usage**: Setup Langfuse integration

Your setup is already excellent with Groq + Ollama! Adding these pipelines will give you access to virtually every AI model available. 🚀

---
*Generated for StackTrackr rEngineMCP Integration - August 17, 2025*
