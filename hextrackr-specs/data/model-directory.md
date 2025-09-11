# OpenRouter Model Directory for HexTrackr

*Last Updated: 2025-09-11*

## 🚨 Breaking: Sonoma Models (2M Context Window!)

**Sonoma Dusk/Sky Alpha** are stealth models with **2 MILLION token context windows** - currently FREE during alpha testing. Rumored to be either:
- **Grok 4.1** in disguise (xAI's pattern of quiet releases)
- **Gemini experimental variant** (Google's push for massive context)

Either way, these are game-changers for codebase analysis!

## Quick Selection Guide

### By Context Window Size
- **2,000,000 tokens**: 🔥 Sonoma Dusk/Sky (entire codebases, all docs at once!)
- **1,048,576 tokens**: Gemini 2.5 Pro/Flash (1M context via direct API)
- **200,000 tokens**: Claude Opus/Sonnet 4.1, GPT-5, O3 series
- **131,072 tokens**: Grok 3 series, Llama 4
- **128,000 tokens**: DeepSeek R1, Llama models, Mistral
- **32,768 tokens**: QwQ-32B (but with deep thinking!)

### By Task Type & Recommended Models

#### 🧠 Consensus & Debate (`mcp__zen__consensus`)
**Best Models**: 
- Sonoma Sky (2M context + intelligence)
- Claude Opus 4.1 (nuanced reasoning)
- GPT-5 (balanced perspectives)
- DeepSeek R1 (logical analysis)

**Why**: Different models bring different reasoning styles for productive debate. Sonoma can hold entire context.

#### 📋 Planning & Architecture (`mcp__zen__planner`)
**Best Models**:
- QwQ-32B Preview (deep thinking specialist)
- DeepSeek R1 (step-by-step reasoning)
- Sonoma Sky (can see entire codebase at once!)

**Why**: Planning needs both deep thinking AND broad context awareness.

#### 🔍 Code Review (`mcp__zen__codereview`)
**Best Models**:
- Sonoma Dusk (2M context = review entire PR)
- Grok Code Fast (specialized for speed)
- QwQ-32B (deep code understanding)
- Codestral (Mistral's code specialist)

**Why**: Code review benefits from seeing full context + specialized understanding.

#### 🛡️ Security Audit (`mcp__zen__secaudit`)
**Best Models**:
- GPT-5 (comprehensive analysis)
- Claude Opus 4.1 (catches subtle issues)
- DeepSeek R1 (systematic checking)
- Sonoma Sky (full codebase security scan!)

**Why**: Security needs both depth and breadth - Sonoma can scan everything at once.

#### 📊 Massive File/Codebase Analysis
**Best Models**:
- 🏆 **Sonoma Dusk/Sky** (2M tokens = ~500 files!)
- Gemini 2.5 Pro (1M tokens)
- Gemini 2.5 Flash (1M tokens, faster)

**Why**: Only these models can hold entire repositories in context.

#### 🤔 Deep Thinking & Reasoning (`mcp__zen__thinkdeep`)
**Best Models**:
- QwQ-32B Preview (thinking specialist)
- DeepSeek R1/R1-Zero (reasoning modes)
- Grok 3 (with extended thinking)
- Sonoma Sky (intelligent variant)

**Why**: These models support extended reasoning tokens or deep analysis.

#### 🔬 Scientific/Research (`mcp__zen__debug`)
**Best Models**:
- DeepSeek R1-Zero (research-oriented)
- GPT-5 (scientific reasoning)
- Claude Opus 4.1 (academic rigor)

**Why**: Scientific tasks need precision and methodical analysis.

## Cost Optimization Strategy

### Tier 1: Free/Cheap (Use First)
1. **Gemini Flash 2.5** - Via direct API, very fast
2. **Sonoma Dusk/Sky** - FREE during alpha, 2M context!
3. **Gemini Pro 2.5** - Via direct API when needed

### Tier 2: Specialized (Task-Specific)
- **QwQ-32B** - For deep thinking tasks
- **DeepSeek R1** - For complex reasoning
- **Grok Code Fast** - For rapid coding

### Tier 3: Premium (When Necessary)
- **Claude Opus 4.1** - For nuanced analysis
- **GPT-5** - For comprehensive tasks
- **O3 models** - For specific requirements

### Emergency Tier: Massive Context
- **Sonoma Models** - When you need to analyze entire codebases
- **Gemini Pro** - 1M token fallback

## Rate Limit Management

### Fallback Chain
```
Primary → Secondary → Tertiary → Emergency
Gemini → Sonoma → OpenRouter Premium → Wait & Retry
```

### Smart Routing
- Small tasks: Gemini Flash (fast, cheap)
- Large context: Sonoma (2M tokens!)
- Complex reasoning: QwQ or DeepSeek
- Consensus: Mix of 3-4 different models

## Practical Use Cases for HexTrackr

### 1. Analyzing Entire Codebase
```bash
# With Sonoma (2M context)
zen chat --model sonoma-sky "Analyze the entire HexTrackr architecture"
# Can load all 500+ files at once!
```

### 2. Complex Bug Investigation
```bash
# With QwQ for deep thinking
zen debug --model qwq-32b "Why does the modal system fail on multi-CVE entries?"
```

### 3. Security Audit
```bash
# With Sonoma for complete coverage
zen secaudit --model sonoma-dusk "Full security audit of HexTrackr"
# Scans EVERYTHING in one pass
```

### 4. Consensus Decision
```bash
# Multiple models for diverse perspectives
zen consensus --models "sonoma-sky,claude-opus,gpt-5,deepseek-r1" \
  "Should we migrate to TypeScript?"
```

## Model Aliases (Quick Reference)

### Sonoma Series (2M Context!)
- `sonoma-dusk`, `dusk`, `2m-fast` → Sonoma Dusk Alpha
- `sonoma-sky`, `sky`, `2m-smart` → Sonoma Sky Alpha

### Thinking Models
- `qwq`, `deep-think` → QwQ-32B Preview
- `r1`, `deepseek-reasoning` → DeepSeek R1
- `r1-zero`, `research-model` → DeepSeek R1-Zero

### Coding Models
- `grok-code` → Grok Code Fast
- `codestral` → Mistral's Codestral
- `qwen-coder` → Qwen 2.5 Coder

### Premium Models
- `opus` → Claude Opus 4.1
- `gpt5` → GPT-5
- `o3` → OpenAI O3

## Agent-Specific Recommendations

### Worf (Security Chief)
- **Primary**: GPT-5 or Claude Opus (thorough analysis)
- **Massive Scans**: Sonoma Sky (2M context for entire repo)
- **Fallback**: Gemini Flash

### DrJackson (Code Archaeologist)
- **Primary**: QwQ-32B (pattern analysis)
- **Historical Analysis**: Sonoma Dusk (entire git history)
- **Quick Scans**: Gemini Flash

### The Stooges (Implementation)
- **Larry**: Grok Code Fast (speed coding)
- **Moe**: QwQ-32B (planning and organization)
- **Curly**: DeepSeek R1 (creative problem solving)

### Uhura (Communications)
- **Translation**: Gemini Flash (fast, efficient)
- **Complex Merges**: Sonoma Sky (see all conflicts at once)

## Special Capabilities Matrix

| Model | Context | Thinking | Images | Functions | JSON | Free |
|-------|---------|----------|---------|-----------|------|------|
| Sonoma Dusk | 2M | ❌ | ✅ | ✅ | ✅ | ✅ |
| Sonoma Sky | 2M | ❌ | ✅ | ✅ | ✅ | ✅ |
| QwQ-32B | 32K | ✅ | ❌ | ❌ | ✅ | ❌ |
| DeepSeek R1 | 128K | ✅ | ❌ | ❌ | ✅ | ❌ |
| Gemini 2.5 Pro | 1M | ❌ | ✅ | ❌ | ✅ | ❌ |
| Claude Opus 4.1 | 200K | ❌ | ✅ | ❌ | ❌ | ❌ |
| GPT-5 | 200K | ❌ | ✅ | ✅ | ✅ | ❌ |
| Grok 3 | 131K | ✅ | ❌ | ✅ | ✅ | ❌ |

## Future Models to Watch

- **Grok 4.1** - If Sonoma IS Grok 4.1, expect official release soon
- **Gemini 3.0** - Rumored 10M context window
- **Claude 5** - Anthropic's next generation
- **GPT-6** - OpenAI's upcoming release
- **Llama 5** - Meta's continued open-source push

## Tips for Zen Tool Usage

1. **Always try Sonoma first for large context tasks** - It's free and has 2M tokens!
2. **Use model aliases** - Type `sky` instead of `openrouter/sonoma-sky-alpha`
3. **Mix models in consensus** - Different perspectives = better decisions
4. **Monitor the alpha period** - Sonoma won't be free forever
5. **Test with smaller models first** - Gemini Flash for quick iterations

## Configuration in Practice

```bash
# Your current .env setup
DEFAULT_MODEL=google/gemini-flash-2.5         # Fast default
MASSIVE_CONTEXT_MODEL=sonoma-dusk            # 2M context beast
PLANNING_MODEL=qwq-32b-preview                # Deep thinker
CONSENSUS_MODELS=sonoma-sky,opus,gpt5,r1     # Diverse team

# Example usage
zen analyze --model $MASSIVE_CONTEXT_MODEL "Review entire codebase"
zen planner --model $PLANNING_MODEL "Design new feature"
zen consensus --models $CONSENSUS_MODELS "Architectural decision"
```

---

*Remember: Sonoma's 2M context window changes everything. You can now analyze your ENTIRE codebase in a single prompt. Use this power wisely!*