# Protocol: Unified Document Scribe System

**Version:** 1.0.0  
**Date:** August 19, 2025  
**Status:** ACTIVE  
**Priority:** HIGH  

## 🎯 Overview

This protocol defines the operation of the unified Document Scribe system, which provides intelligent documentation generation, API communication, and idle-time processing capabilities. The system replaces multiple scattered API communication scripts with a single, rate-limited, intelligent tool.

## 🚀 Core Features

### **1. Unified API Communication**

- **Single Interface**: One tool for all LLM provider communication
- **Rate Limiting**: Intelligent rate limiting per provider
- **MCP Integration**: Uses rEngine MCP relay for all API calls
- **Provider Fallback**: Automatic fallback chain with intelligent selection
- **Argument-Based**: Simple command-line interface for all operations

### **2. Idle-Time Documentation Crawling**

- **Automatic Triggering**: Starts after 10 minutes of inactivity
- **Local Processing**: Uses Qwen models for cost efficiency
- **Prime Directive Balance**: Preserves rScribe's core recording function
- **Graceful Interruption**: Pauses when user returns
- **File Discovery**: Automatically finds undocumented files

### **3. Manual Documentation Operations**

- **Document Sweeps**: Full directory scanning and documentation
- **HTML Generation**: Professional HTML output via MCP relay
- **Single File Processing**: Document individual files on demand
- **Quality Control**: Manual triggers for critical documentation

## 📋 Usage Protocol

### **Command Structure**

```bash
node /Volumes/DATA/GitHub/rEngine/rEngine/document-scribe.js [action] [options]
```

### **Core Actions**

#### **Idle Documentation Crawling**

```bash

# Start idle documentation (background mode)

node document-scribe.js --idle-crawl --duration 30m

# Extended idle crawling

node document-scribe.js --idle-crawl --duration 2h
```

#### **Manual Document Sweeps**

```bash

# Full document sweep

node document-scribe.js --document-sweep

# Document specific file

node document-scribe.js --document-sweep --file /path/to/script.js

# Document specific directory

node document-scribe.js --document-sweep --file /path/to/directory
```

#### **HTML Generation**

```bash

# Generate HTML documentation

node document-scribe.js --html-sweep
```

#### **Direct API Communication**

```bash

# Direct provider communication

node document-scribe.js --provider gemini --prompt "Analyze this code"

# Specific model selection

node document-scribe.js --provider ollama --model qwen2.5-coder:7b --prompt "Document this"

# With custom rate limiting

node document-scribe.js --provider claude --rate-limit 30 --prompt "Review this API"
```

## ⚙️ Configuration

### **Environment Variables** (in `/rEngine/.env`)

```env
CLAUDE_API_KEY=your_claude_key
GEMINI_API_KEY=your_gemini_key
GROQ_API_KEY=your_groq_key
OPENAI_API_KEY=your_openai_key
```

### **Rate Limits** (per provider)

| Provider | Requests/Min | Requests/Hour | Cost |
|----------|--------------|---------------|------|
| **Claude** | 60 | 1,000 | $$$ |
| **Gemini** | 15 | 1,500 | $$ |
| **Groq** | 30 | 14,400 | $ |
| **OpenAI** | 500 | 10,000 | $$$ |
| **Ollama** | Unlimited | Unlimited | FREE |

### **Provider Chains** (task-specific)

- **Documentation**: `qwen2.5-coder:7b → gemini → claude → groq → openai`
- **Analysis**: `claude → gemini → groq → openai → qwen2.5:3b`
- **HTML**: `gemini → claude → groq → openai`
- **Idle Tasks**: `qwen2.5-coder:7b → qwen2.5:3b` (local only)

## 🧠 Intelligent Features

### **Activity Monitoring**

- **Idle Detection**: 10-minute threshold for idle state
- **User Return**: Automatic pausing when activity detected
- **Prime Directive**: rScribe recording always takes priority
- **Background Processing**: Non-blocking idle operations

### **File Discovery**

- **Auto-Scan**: Automatically finds undocumented files
- **Extension Filtering**: `.js`, `.py`, `.sh`, `.md` files
- **Directory Exclusion**: Skips `node_modules`, `.git`, `logs`, `backups`
- **Documentation Check**: Verifies if documentation already exists

### **Quality Control**

- **Model Selection**: Code-focused models for documentation
- **Content Validation**: Ensures meaningful output before saving
- **Error Handling**: Graceful fallback and retry logic
- **Logging**: Comprehensive activity and error logging

## 📂 File Structure

### **Input Sources**

- **Code Files**: All `.js`, `.py`, `.sh` files in project
- **Existing Docs**: `rDocuments/autogen/` markdown files
- **Configuration**: `rEngine/.env` for API keys

### **Output Locations**

- **Markdown Docs**: `rDocuments/autogen/` (organized by source path)
- **HTML Docs**: `rDocuments/html/` (web-ready format)
- **Logs**: `logs/document-scribe.log` (activity tracking)

## 🔄 Operational Workflow

### **1. System Initialization**

1. Load environment variables and API keys
2. Initialize rate limiting counters
3. Create required directories
4. Start activity monitoring (if idle mode)

### **2. Idle Documentation Process**

1. **Monitor Activity**: Track user interaction
2. **Trigger Idle**: Start after 10 minutes inactivity
3. **Discover Files**: Scan for undocumented files
4. **Process Files**: Use Qwen for local documentation
5. **Graceful Exit**: Stop when user returns

### **3. Manual Operations**

1. **Parse Arguments**: Determine action and parameters
2. **Validate Input**: Check files and parameters
3. **Execute Task**: Run documentation or HTML generation
4. **Rate Limiting**: Enforce provider-specific limits
5. **Output Results**: Save to appropriate directories

## 🚨 Error Handling

### **Provider Failures**

- **Automatic Fallback**: Chain through available providers
- **Rate Limit Respect**: Wait when limits exceeded
- **Retry Logic**: Multiple attempts with backoff
- **Graceful Degradation**: Fall back to local models

### **File System Errors**

- **Permission Issues**: Log and continue with other files
- **Missing Directories**: Auto-create required paths
- **Disk Space**: Monitor and alert if space low
- **Concurrent Access**: Handle file locking gracefully

## 📊 Monitoring & Logging

### **Activity Logs**

- **Location**: `logs/document-scribe.log`
- **Format**: `[timestamp] [level] message`
- **Levels**: INFO, WARN, ERROR
- **Rotation**: Daily log rotation recommended

### **Rate Limit Tracking**

- **Real-time Monitoring**: Per-provider request counting
- **Automatic Reset**: Minute/hour counter resets
- **Limit Warnings**: Alerts before hitting limits
- **Wait Calculations**: Smart delay calculations

## 🔧 Maintenance Protocol

### **Daily Operations**

1. **Monitor Logs**: Check for errors or issues
2. **Review Output**: Verify documentation quality
3. **Update Models**: Pull latest Ollama models if needed
4. **Clean Logs**: Rotate or archive old log files

### **Weekly Operations**

1. **Rate Limit Review**: Analyze usage patterns
2. **Model Performance**: Compare provider effectiveness
3. **Documentation Audit**: Review generated content quality
4. **System Optimization**: Adjust thresholds and limits

## 🎯 Integration Points

### **rScribe Integration**

- **Prime Directive**: Recording function always takes priority
- **Activity Detection**: Shared activity monitoring
- **Memory System**: Integration with rEngine memory
- **Search Matrix**: Documentation feeds into search matrix

### **MCP Relay System**

- **Unified Communication**: All API calls via MCP relay
- **Provider Abstraction**: Consistent interface across providers
- **Error Propagation**: Proper error handling and reporting
- **Session Management**: Shared session state

## 📈 Success Metrics

### **Documentation Coverage**

- **Target**: 90%+ of code files documented
- **Quality**: Meaningful, accurate documentation
- **Freshness**: Documentation updated with code changes
- **Accessibility**: Clear, readable format

### **System Performance**

- **Response Time**: <30 seconds for single file documentation
- **Uptime**: 99%+ availability for idle monitoring
- **Error Rate**: <5% provider failure rate
- **Cost Efficiency**: 80%+ tasks handled by local models

---

## 🚀 **Quick Start Commands**

```bash

# Start idle documentation monitoring

node document-scribe.js --idle-crawl

# Document a specific file

node document-scribe.js --document-sweep --file myfile.js

# Generate HTML documentation (2)

node document-scribe.js --html-sweep

# Direct API communication

node document-scribe.js --provider gemini --prompt "Analyze this code"
```

**This protocol establishes the Document Scribe as the primary tool for all documentation and API communication needs within the rEngine platform.**
