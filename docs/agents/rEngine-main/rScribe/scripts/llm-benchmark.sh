#!/bin/bash

# StackTrackr LLM Benchmark - Code Audit Challenge
# Comparing online LLMs vs local Ollama Llama 3B

echo "🏁 Starting LLM Benchmark - Code Audit Challenge"
echo "=================================================="

# Create output directory
mkdir -p /Volumes/DATA/GitHub/rEngine/rAgents/output/benchmark-$(date +%Y%m%d-%H%M%S)
BENCHMARK_DIR="/Volumes/DATA/GitHub/rEngine/rAgents/output/benchmark-$(date +%Y%m%d-%H%M%S)"

# Code audit prompt
AUDIT_PROMPT="Perform a comprehensive code audit of the StackTrackr project. Analyze the JavaScript files in the js/ directory, identify potential security vulnerabilities, code quality issues, performance bottlenecks, and architectural improvements. Provide specific recommendations with file names and line numbers where applicable. Focus on: 1) Security issues 2) Performance optimizations 3) Code quality improvements 4) Architecture recommendations 5) Bug detection"

echo "📝 Audit Prompt: $AUDIT_PROMPT"
echo "📁 Output Directory: $BENCHMARK_DIR"

# Function to time execution
benchmark_llm() {
    local provider=$1
    local model=$2
    local output_file="$BENCHMARK_DIR/${provider}_${model}_audit.md"
    
    echo "🤖 Testing $provider ($model)..."
    local start_time=$(date +%s)
    
    case $provider in
        "ollama")
            curl -X POST http://localhost:11434/api/generate \
                -H "Content-Type: application/json" \
                -d "{
                    \"model\": \"$model\",
                    \"prompt\": \"$AUDIT_PROMPT\",
                    \"stream\": false
                }" > "$output_file.json" 2>/dev/null
            
            # Extract response from JSON
            jq -r '.response' "$output_file.json" > "$output_file" 2>/dev/null || echo "Failed to parse Ollama response" > "$output_file"
            ;;
        "openai")
            if [ -n "$OPENAI_API_KEY" ]; then
                curl -X POST https://api.openai.com/v1/chat/completions \
                    -H "Content-Type: application/json" \
                    -H "Authorization: Bearer $OPENAI_API_KEY" \
                    -d "{
                        \"model\": \"$model\",
                        \"messages\": [{\"role\": \"user\", \"content\": \"$AUDIT_PROMPT\"}],
                        \"max_tokens\": 4000
                    }" > "$output_file.json" 2>/dev/null
                
                jq -r '.choices[0].message.content' "$output_file.json" > "$output_file" 2>/dev/null || echo "OpenAI API call failed" > "$output_file"
            else
                echo "OpenAI API key not set" > "$output_file"
            fi
            ;;
        "anthropic")
            if [ -n "$ANTHROPIC_API_KEY" ]; then
                curl -X POST https://api.anthropic.com/v1/messages \
                    -H "Content-Type: application/json" \
                    -H "x-api-key: $ANTHROPIC_API_KEY" \
                    -H "anthropic-version: 2023-06-01" \
                    -d "{
                        \"model\": \"$model\",
                        \"max_tokens\": 4000,
                        \"messages\": [{\"role\": \"user\", \"content\": \"$AUDIT_PROMPT\"}]
                    }" > "$output_file.json" 2>/dev/null
                
                jq -r '.content[0].text' "$output_file.json" > "$output_file" 2>/dev/null || echo "Claude API call failed" > "$output_file"
            else
                echo "Anthropic API key not set" > "$output_file"
            fi
            ;;
        "google")
            if [ -n "$GEMINI_API_KEY" ]; then
                curl -X POST "https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=$GEMINI_API_KEY" \
                    -H "Content-Type: application/json" \
                    -d "{
                        \"contents\": [{\"parts\": [{\"text\": \"$AUDIT_PROMPT\"}]}]
                    }" > "$output_file.json" 2>/dev/null
                
                jq -r '.candidates[0].content.parts[0].text' "$output_file.json" > "$output_file" 2>/dev/null || echo "Gemini API call failed" > "$output_file"
            else
                echo "Google API key not set" > "$output_file"
            fi
            ;;
        "groq")
            if [ -n "$GROQ_API_KEY" ]; then
                curl -X POST https://api.groq.com/openai/v1/chat/completions \
                    -H "Content-Type: application/json" \
                    -H "Authorization: Bearer $GROQ_API_KEY" \
                    -d "{
                        \"model\": \"$model\",
                        \"messages\": [{\"role\": \"user\", \"content\": \"$AUDIT_PROMPT\"}],
                        \"max_tokens\": 4000
                    }" > "$output_file.json" 2>/dev/null
                
                jq -r '.choices[0].message.content' "$output_file.json" > "$output_file" 2>/dev/null || echo "Groq API call failed" > "$output_file"
            else
                echo "Groq API key not set" > "$output_file"
            fi
            ;;
    esac
    
    local end_time=$(date +%s)
    local duration=$((end_time - start_time))
    
    # Calculate metrics
    local word_count=$(wc -w < "$output_file" 2>/dev/null || echo "0")
    local char_count=$(wc -c < "$output_file" 2>/dev/null || echo "0")
    local line_count=$(wc -l < "$output_file" 2>/dev/null || echo "0")
    
    echo "✅ $provider ($model): ${duration}s, ${word_count} words, ${char_count} chars"
    
    # Create metrics file
    cat > "$BENCHMARK_DIR/${provider}_${model}_metrics.json" << EOF
{
    "provider": "$provider",
    "model": "$model",
    "execution_time_seconds": $duration,
    "word_count": $word_count,
    "character_count": $char_count,
    "line_count": $line_count,
    "timestamp": "$(date -Iseconds)",
    "words_per_second": $(echo "scale=2; $word_count / $duration" | bc -l 2>/dev/null || echo "0")
}
EOF
}

# Run benchmarks
echo "🚀 Starting benchmarks..."

# Local Ollama models (baseline)
benchmark_llm "ollama" "qwen2.5:3b"
benchmark_llm "ollama" "llama3:8b"
benchmark_llm "ollama" "gemma2:2b"

# Online LLMs (if API keys available)
benchmark_llm "openai" "gpt-4o"
benchmark_llm "openai" "gpt-4-turbo"
benchmark_llm "anthropic" "claude-3-5-sonnet-20241022"
benchmark_llm "anthropic" "claude-3-haiku-20240307"
benchmark_llm "google" "gemini-1.5-pro"
benchmark_llm "google" "gemini-1.5-flash"
benchmark_llm "groq" "llama-3.1-70b-versatile"
benchmark_llm "groq" "mixtral-8x7b-32768"

echo "📊 Generating benchmark report..."

# Create comprehensive benchmark report
cat > "$BENCHMARK_DIR/benchmark_report.md" << 'EOF'
# StackTrackr LLM Benchmark Report

## Code Audit Challenge Results

### Methodology
- **Task**: Comprehensive code audit of StackTrackr JavaScript codebase
- **Focus Areas**: Security, Performance, Code Quality, Architecture, Bug Detection
- **Metrics**: Execution time, response quality, word count, specificity

### Models Tested

#### Local Models (Ollama)
- **Qwen2.5:3B** - Fast Chinese-English model
- **Llama3:8B** - Meta's flagship model
- **Gemma2:2B** - Google's efficient model

#### Online Models
- **GPT-4o** - OpenAI's latest multimodal model
- **GPT-4 Turbo** - OpenAI's optimized model
- **Claude 3.5 Sonnet** - Anthropic's balanced model
- **Claude 3 Haiku** - Anthropic's speed-optimized model
- **Gemini 1.5 Pro** - Google's advanced model
- **Gemini 1.5 Flash** - Google's fast model
- **Llama 3.1 70B** - Meta's large model via Groq
- **Mixtral 8x7B** - Mistral's mixture-of-experts model

### Performance Metrics
EOF

# Add metrics to report
echo "| Model | Provider | Time (s) | Words | Words/sec | Quality Score |" >> "$BENCHMARK_DIR/benchmark_report.md"
echo "|-------|----------|----------|--------|-----------|---------------|" >> "$BENCHMARK_DIR/benchmark_report.md"

for metrics_file in "$BENCHMARK_DIR"/*_metrics.json; do
    if [ -f "$metrics_file" ]; then
        provider=$(jq -r '.provider' "$metrics_file")
        model=$(jq -r '.model' "$metrics_file")
        time=$(jq -r '.execution_time_seconds' "$metrics_file")
        words=$(jq -r '.word_count' "$metrics_file")
        wps=$(jq -r '.words_per_second' "$metrics_file")
        
        echo "| $model | $provider | $time | $words | $wps | TBD |" >> "$BENCHMARK_DIR/benchmark_report.md"
    fi
done

echo "" >> "$BENCHMARK_DIR/benchmark_report.md"
echo "### Analysis Summary" >> "$BENCHMARK_DIR/benchmark_report.md"
echo "- **Fastest Response**: [To be analyzed]" >> "$BENCHMARK_DIR/benchmark_report.md"
echo "- **Most Comprehensive**: [To be analyzed]" >> "$BENCHMARK_DIR/benchmark_report.md"
echo "- **Best Value (Local)**: [To be analyzed]" >> "$BENCHMARK_DIR/benchmark_report.md"
echo "- **Best Overall**: [To be analyzed]" >> "$BENCHMARK_DIR/benchmark_report.md"

echo ""
echo "✅ Benchmark complete!"
echo "📁 Results saved to: $BENCHMARK_DIR"
echo "📊 Report: $BENCHMARK_DIR/benchmark_report.md"
echo ""
echo "🔍 Individual audit reports:"
ls -la "$BENCHMARK_DIR"/*.md

EOF
