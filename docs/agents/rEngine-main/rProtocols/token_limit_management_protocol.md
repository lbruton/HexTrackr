# Token Limit Management Protocol

**Protocol ID**: TOKEN-MGT-001  
**Version**: 1.0  
**Type**: Infrastructure  
**Layer**: Foundation  
**Status**: Active  

## Overview

This protocol establishes comprehensive token limit management for all AI provider interactions, ensuring robust handling of large files, batch processing, and rate limiting across the rEngine Platform ecosystem.

## Token Limit Specifications

### **Provider Token Limits**

```json
{
  "claude": {
    "context_window": 200000,
    "max_output": 4096,
    "rate_limits": {
      "rpm": 60,
      "rph": 1000
    }
  },
  "gemini": {
    "context_window": 1000000,
    "max_output": 8192,
    "rate_limits": {
      "rpm": 15,
      "rph": 1500
    }
  },
  "groq": {
    "context_window": 32768,
    "max_output": 4096,
    "rate_limits": {
      "rpm": 30,
      "rph": 14400
    }
  },
  "openai": {
    "context_window": 128000,
    "max_output": 4096,
    "rate_limits": {
      "rpm": 500,
      "rph": 10000
    }
  },
  "ollama": {
    "context_window": 32768,
    "max_output": 2048,
    "rate_limits": {
      "rpm": 1000,
      "rph": 60000
    }
  }
}
```

## File Chunking Strategy

### **Intelligent Pre-Chunking**

Uses Qwen 2.5 Coder for structural analysis:

```javascript
// Pre-chunk analysis identifies optimal boundaries
const chunkPlan = {
  file: "large-script.js",
  totalLines: 2500,
  chunks: [
    {
      startLine: 1,
      endLine: 450,
      type: "imports_and_config",
      description: "Module imports and configuration"
    },
    {
      startLine: 451,
      endLine: 1200,
      type: "core_class",
      description: "DocumentSweep class implementation"
    },
    {
      startLine: 1201,
      endLine: 1800,
      type: "utility_methods",
      description: "Helper methods and utilities"
    },
    {
      startLine: 1801,
      endLine: 2500,
      type: "main_execution",
      description: "Main execution and exports"
    }
  ]
}
```

### **Fallback Chunking**

When pre-chunking fails, use conservative line-based splitting:

- **Small files** (< 500 lines): Process as single unit
- **Medium files** (500-2000 lines): Split into 2-3 logical chunks
- **Large files** (> 2000 lines): Use 800-line chunks with 20% overlap

## Token Estimation

### **Character-to-Token Ratio**

```javascript
function estimateTokens(text) {
  // Conservative estimation: 1 token ≈ 4 characters
  return Math.ceil(text.length / 4);
}

function isWithinLimit(text, provider) {
  const tokens = estimateTokens(text);
  const limits = getProviderLimits(provider);
  return tokens <= (limits.context_window * 0.8); // Use 80% safety margin
}
```

### **Safety Margins**

- **Input Context**: Use 80% of provider's context window
- **Output Buffer**: Reserve 25% for response generation
- **Chunk Overlap**: Include 10% overlap between chunks for continuity

## Rate Limiting Implementation

### **Request Tracking**

```javascript
// Rate limiter state management
const rateLimitState = {
  requestHistory: [
    {
      id: "doc_script.js_1755638465430",
      timestamp: 1755638468778,
      success: true,
      provider: "claude",
      tokens_used: 2450
    }
  ],
  lastSaved: 1755638468778
}
```

### **Provider Fallback Chain**

```javascript
const providerChain = [
  { name: "ollama", model: "qwen2.5-coder:3b", priority: 1 },
  { name: "claude", model: "claude-3-5-sonnet-20241022", priority: 2 },
  { name: "groq", model: "llama-3.1-70b-versatile", priority: 3 },
  { name: "gemini", model: "gemini-1.5-flash", priority: 4 },
  { name: "openai", model: "gpt-4o-mini", priority: 5 }
];
```

## Large File Processing

### **Chunk Processing Pipeline**

1. **Analysis Phase**: Qwen pre-chunks based on code structure
2. **Validation Phase**: Check each chunk against token limits
3. **Processing Phase**: Process chunks with provider fallback
4. **Assembly Phase**: Combine chunk results into coherent documentation
5. **Review Phase**: Validate assembled output for completeness

### **Progress Tracking**

```javascript
const batchProgress = {
  totalChunks: 12,
  processedChunks: 8,
  failedChunks: 1,
  currentProvider: "claude",
  estimatedCompletion: "2025-08-20T15:30:00Z",
  tokenUsage: {
    total: 45600,
    byProvider: {
      "ollama": 12400,
      "claude": 33200
    }
  }
}
```

## Error Handling

### **Token Limit Exceeded**

```javascript
if (error.status === 413 || error.message.includes("token limit")) {
  // Attempt automatic chunking
  const chunks = await createEmergencyChunks(content, 0.5); // 50% smaller
  return await processChunks(chunks, nextProvider);
}
```

### **Rate Limit Hit**

```javascript
if (error.status === 429) {
  const waitTime = calculateBackoffTime(provider, attemptCount);
  await sleep(waitTime);
  return await retryWithNextProvider(content, providerIndex + 1);
}
```

### **Provider Failure Recovery**

```javascript
async function processWithFallback(content, providerChain) {
  for (const provider of providerChain) {
    try {
      return await makeRequest(content, provider);
    } catch (error) {
      logProviderFailure(provider, error);
      if (isLastProvider(provider)) {
        throw new Error("All providers failed");
      }
      continue;
    }
  }
}
```

## Monitoring and Metrics

### **Real-Time Metrics**

- **Token Usage**: Track per-provider consumption
- **Success Rates**: Monitor provider reliability
- **Processing Speed**: Measure tokens/second by provider
- **Queue Depth**: Monitor pending requests
- **Cost Tracking**: Calculate API costs by provider

### **Health Checks**

```bash

# Check rate limiter status

node rEngine/document-scribe.js --check-limits

# Validate token estimation accuracy

node rEngine/test-rate-limiter.js --validate-tokens

# Test provider failover

node rEngine/test-rate-limiter.js --test-failover
```

## Configuration Files

### **Rate Limiter Persistence**

- `.rate-limiter-claude.json` - Claude request history
- `.rate-limiter-groq.json` - Groq request tracking
- `.rate-limiter-gemini-test.json` - Gemini testing data
- `.rate-limiter-default.json` - Default provider state

### **Pre-Chunk Queue**

- `rMemory/pre-chunk-queue.json` - Intelligent chunking plans
- `rMemory/batch-progress.json` - Processing state tracking

## Integration Points

### **Document Scribe Integration**

```bash

# Process with token-aware chunking

node rEngine/document-scribe.js --document-sweep --smart-chunking

# Rate-limited batch processing

node rEngine/document-scribe.js --batch-process --rate-limit 10

# Provider-specific processing

node rEngine/document-scribe.js --provider claude --chunk-size 1500
```

### **Scribe Summary Integration**

The scribe summary system automatically triggers pre-chunking analysis:

```javascript
// Auto-triggered on file changes
const preChunkResults = await scribe.analyzeAndPreChunk();
await scribe.queueForDocumentation(filePath, chunkPlan);
```

## Emergency Procedures

### **Token Overflow Response**

1. **Immediate**: Switch to smaller chunk size (50% reduction)
2. **Fallback**: Use next provider in chain
3. **Emergency**: Process file manually in smaller sections
4. **Recovery**: Update token estimation for future processing

### **Rate Limit Crisis**

1. **Throttle**: Reduce processing speed by 75%
2. **Queue**: Hold requests until limits reset
3. **Distribute**: Spread load across all available providers
4. **Notify**: Alert monitoring systems of degraded performance

## Protocol Compliance

### **Required Implementations**

- ✅ Token estimation with safety margins
- ✅ Intelligent pre-chunking with structural analysis
- ✅ Multi-provider fallback chains
- ✅ Rate limiting with persistent state
- ✅ Progress tracking and recovery
- ✅ Error handling for all limit scenarios

### **Testing Requirements**

- **Load Testing**: Process 100+ files in batch
- **Limit Testing**: Deliberately exceed token limits
- **Failover Testing**: Simulate provider outages
- **Recovery Testing**: Resume from interruption

## Success Metrics

- **Completion Rate**: >95% of files processed successfully
- **Token Efficiency**: <20% waste due to oversized chunks
- **Provider Utilization**: Balanced load across all providers
- **Recovery Time**: <30 seconds from provider failure
- **Queue Processing**: <2 minute average wait time

---

**Related Protocols**: Enhanced Scribe System Protocol, Ollama Recovery Protocol, System Recovery Protocol  
**Implementation Files**: `rEngine/document-scribe.js`, `rEngine/test-rate-limiter.js`, `rEngine/scribe-summary.js`  
**Testing Files**: `.rate-limiter-*.json`, `rMemory/pre-chunk-queue.json`
